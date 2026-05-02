---
title: "page fault时发生了什么"
source: "https://zhuanlan.zhihu.com/p/66046257"
author:
  - "[[兰新宇talk is cheap]]"
published:
created: 2026-05-02
description: "在Linux中，进程和内核都是通过 页表PTE访问一个物理页面的，如果无法访问到正确的地址，将产生page fault（缺页异常）。由于造成内核空间和用户空间的page fault的原因不尽相同，因此其处理流程也有所区别（以x86…"
tags:
  - "clippings"
---
[收录于 · 术道经纬](https://www.zhihu.com/column/c_1108400140804726784)

公园野鸭 等 173 人赞同了该文章

在Linux中，进程和内核都是通过 [页表PTE](https://zhuanlan.zhihu.com/p/67813716) 访问一个物理页面的，如果无法访问到正确的地址，将产生page fault（ [缺页异常](https://zhida.zhihu.com/search?content_id=102805782&content_type=Article&match_order=1&q=%E7%BC%BA%E9%A1%B5%E5%BC%82%E5%B8%B8&zhida_source=entity) ）。

![](https://pic1.zhimg.com/v2-886ff2229f964a91b3bceb128d137254_1440w.jpg)

由于造成内核空间和用户空间的page fault的原因不尽相同，因此其处理流程也有所区别（以x86为例，代码位于"/arch/x86/x86-mm/fault.c"）。

```
void __do_page_fault(...)
{
    if (unlikely(fault_in_kernel_space(address)))
        do_kern_addr_fault(regs, hw_error_code, address);
    else
        do_user_addr_fault(regs, hw_error_code, address);
    ...
}
```

内核页面由于使用频繁，通常不会被换出，所以这里是"unlikely"。

```
do_kern_addr_fault()
    --> vmalloc_fault()
```

对于用户空间，需要区分多种情况，page fault的处理显得更为复杂。

```
do_user_addr_fault()
    --> handle_mm_fault()
        --> handle_pte_fault()
```

首先，访问的内存地址必须是合法的，所谓「合法」，就是该地址一定是落在进程的某个VMA区间内。

```
struct vm_area_struct vma = find_vma(mm, address);

if (unlikely(!vma)) {
    bad_area(regs, hw_error_code, address);
    return;
}
if (likely(vma->vm_start <= address))
    goto good_area;
```

假设现在一个进程的地址空间分布如下，那么address B是合法的（good area），address A就是非法的（bad area）。

![](https://pic3.zhimg.com/v2-64fbc3a093464dbaeed905abe3701ac6_1440w.jpg)

地址落在进程的地址空间内，但对地址的访问权限不对（比如试图写入一个readonly的区域），也是非法的。访问了非法的地址，或者非法地访问了地址，就不是page fault那么简单了，将进一步上升到 [segmentation fault](https://zhuanlan.zhihu.com/p/71517406) 。

如果地址合法，权限也正确，那么还得分两种情况来讨论。 **第一种情况** 是PTE不存在，这会出现在：

- 对于 [anonymous page](https://zhuanlan.zhihu.com/p/70964551) ，用户空间使用malloc()进行内存申请时（对应底层的实现是mmap或者brk），内核并不会立刻为其分配物理内存，而只是为请求的进程的rbtree管理的vma信息中记录（添加或更改）诸如内存范围和标志之类的信息。

只有当内存被真正使用，触发page fault，才会真正分配物理页面和对应的页表项，即demand alloction，对应的函数实现是 **do\_anonymous\_page()** 。通过 [mmap映射](https://zhuanlan.zhihu.com/p/67894878) 建立的heap和stack等内存区域，在初始未使用时，也适用于这样的规则。

![](https://pic3.zhimg.com/v2-32f9d4c1ffbfe1faeafe7839cb6cf368_1440w.jpg)

- 对于 [page cache](https://zhuanlan.zhihu.com/p/68071761) ， 在发生内存回收后，部分text(code)段的页面会被discard，部分data段的页面会被writeback，之后再次访问这些页面，也将出现page fault。此时，需要从外部存储介质中，将页面内容调回内存，即demand paging，对应的函数实现是 **do\_fault()** 。
```
vm_fault_t handle_pte_fault(struct vm_fault *vmf)
{
    if (!vmf->pte) {
        if (vma_is_anonymous(vmf->vma))
            return do_anonymous_page(vmf);
        else
            return do_fault(vmf);
    }
    ...
}
```
![](https://picx.zhimg.com/v2-db7e0912fa7c55e070a64dd972d75dc7_1440w.jpg)

图片来源于http://jake.dothome.co.kr/wp-content/uploads/2017/01/do\_fault-1.png

**第二种情况** 是PTE存在，但其中的"P(resent)"位为0，说明这是一个之前被swap out出去的anonymous page。现在PTE里存储的不是物理页面的编号PPN，而是外部 [swap area](https://zhida.zhihu.com/search?content_id=102805782&content_type=Article&match_order=1&q=swap+area&zhida_source=entity) 中slot的编号swp\_entry\_t，需要通过 **do\_swap\_page()** ，执行swap in操作将页面的内容拷贝回内存。

```
/* orig_pte是指发生page fault时的PTE */
if (!pte_present(vmf->orig_pte))
    return do_swap_page(vmf);
```
![](https://pic2.zhimg.com/v2-05f71fb82df5b732f9ab9848e2ffe947_1440w.jpg)

发生page fault时，如果目标页面驻留在外部存储器，那么需要开销较大的I/O操作，这种page fault被称为" **major** "的。而如果目标页面就在内存中（比如 [swap cache](https://zhuanlan.zhihu.com/p/98793444) ），只是缺少一个对该页面的引用而已，这种page fault不需要重新分配内存页面，代价较小，因此被称为" **minor** "的。

还是那个 [图书馆借书的例子](https://zhuanlan.zhihu.com/p/98793444) ，前台相当于内存，书库相当于磁盘，从前台直接取走就是"minor page fault"，比如书到期了你还没有看完，可以在前台办完还书手续后马上再借（前提是这本书没有被其他读者预约），付出的代价就是多一次借书手续而已。

而如果你还了两个月再去借这本书，书已经被管理员上架了，你就需要自己去书架上按照类别寻找这本书，花费的时间自然较多，这就是"major page fault"。

**参考：**

*原创文章，转载请注明出处。*

还没有人送礼物，鼓励一下作者吧

编辑于 2020-08-04 22:48[三个月从小白到精通—我的Abaqus结构仿真成长之路](https://zhuanlan.zhihu.com/p/701978491)

[

导读：仿真秀从去年开办《结构工程师双证研修班》以来，已经有超2000名爱学习的学员加入进来。以下是一位Abaqus结构仿真零基础的学员，在仿真秀-仿真高研院学习结构仿真的经历。 写...

](https://zhuanlan.zhihu.com/p/701978491)