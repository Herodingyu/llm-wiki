---
title: "【术】怎样绕过Linux kernel在用户态操纵硬件"
source: "https://zhuanlan.zhihu.com/p/367409778"
author:
  - "[[放我出去​斯坦福大学 电子工程硕士]]"
published:
created: 2026-05-02
description: "最近明尼苏达大学一个实验室向Linux内核提交恶意代码，导致整所学校被Linux拉黑的事，闹得沸沸扬扬。作为给Linux内核交过代码的人，我也是颇有感触。但是今天这篇文章要讲的是相反的事情：怎样绕过给Linux kernel…"
tags:
  - "clippings"
---
[收录于 · 操作系统的术与道](https://www.zhihu.com/column/c_1248401728673579008)

77 人赞同了该文章

最近 [明尼苏达大学](https://zhida.zhihu.com/search?content_id=169776037&content_type=Article&match_order=1&q=%E6%98%8E%E5%B0%BC%E8%8B%8F%E8%BE%BE%E5%A4%A7%E5%AD%A6&zhida_source=entity) 一个实验室向Linux内核提交恶意代码，导致整所学校被Linux拉黑的事，闹得沸沸扬扬。作为给Linux内核交过代码的人，我也是颇有感触。但是今天这篇文章要讲的是相反的事情：怎样绕过给Linux [kernel](https://zhida.zhihu.com/search?content_id=169776037&content_type=Article&match_order=1&q=kernel&zhida_source=entity) 交代码，同时又能开发硬件驱动。

Linux上的 [设备驱动](https://zhida.zhihu.com/search?content_id=169776037&content_type=Article&match_order=1&q=%E8%AE%BE%E5%A4%87%E9%A9%B1%E5%8A%A8&zhida_source=entity) 开发一般是在内核中进行的——开发者在内核源码中加入自己设备需要的驱动，测试成功后可以上交给内核维护者，通过审核后就，驱动就到了Linux源码中。这种方法虽然行之有效，但是缺点在于要求开发者直接接触 [内核代码](https://zhida.zhihu.com/search?content_id=169776037&content_type=Article&match_order=1&q=%E5%86%85%E6%A0%B8%E4%BB%A3%E7%A0%81&zhida_source=entity) ，修改、编译内核，有时候就不太方便。作为开发者，我们有时候很想在用户空间开发驱动，只可惜硬件的寄存器都被Linux内核保护了起来，不能读写。怎么办呢？Linux专门提供了一套在用户空间开发驱动的方法：UIO框架。

UIO就是userspace IO，用户空间输入输出。开发者只需要在内核中写非常少量的代码（几十行），把需要哪些寄存器告诉UIO框架，UIO就会生成一个设备文件，/dev/uio0，然后我们只需要在用户空间打开这个文件， [mmap](https://zhida.zhihu.com/search?content_id=169776037&content_type=Article&match_order=1&q=mmap&zhida_source=entity) 到内存中，就可以直接操纵寄存器了！这样一来，即使你需要给一个复杂设备（比如摄像头）写驱动，你也可以在用户空间来反复修改、迭代你的 [驱动代码](https://zhida.zhihu.com/search?content_id=169776037&content_type=Article&match_order=1&q=%E9%A9%B1%E5%8A%A8%E4%BB%A3%E7%A0%81&zhida_source=entity) ，根本不需要重新编译 [内核](https://zhida.zhihu.com/search?content_id=169776037&content_type=Article&match_order=10&q=%E5%86%85%E6%A0%B8&zhida_source=entity) 。非常方便。

UIO的原理是，把硬件寄存器的地址用ioremap函数给映射到 [用户态](https://zhida.zhihu.com/search?content_id=169776037&content_type=Article&match_order=1&q=%E7%94%A8%E6%88%B7%E6%80%81&zhida_source=entity) 的虚拟地址。这个过程需要修改page table，但是UIO框架把这件事情做好了，所以我们只需要告诉UIO我们需要哪些寄存器就好。在用户空间，我们的程序访问 [虚拟地址](https://zhida.zhihu.com/search?content_id=169776037&content_type=Article&match_order=2&q=%E8%99%9A%E6%8B%9F%E5%9C%B0%E5%9D%80&zhida_source=entity) 的时候，page table会把我们引导到真正的硬件的 [物理地址](https://zhida.zhihu.com/search?content_id=169776037&content_type=Article&match_order=1&q=%E7%89%A9%E7%90%86%E5%9C%B0%E5%9D%80&zhida_source=entity) ，我们就可以操纵硬件了。

比如说，要把地址0x30300000，大小0x10000的一片 [寄存器](https://zhida.zhihu.com/search?content_id=169776037&content_type=Article&match_order=6&q=%E5%AF%84%E5%AD%98%E5%99%A8&zhida_source=entity) 区域开放给用户空间，我们可以在内核中写一个小模块，核心代码如下：

```c
static struct uio_info info;

info.name = "example_uio";
info.version = "1.0";
info.mem[0].memtype = UIO_MEM_PHYS;
info.mem[0].addr = 0x30300000; /* 实际地址 */
info.mem[0].size = 0x10000;
```

在 [内核模块](https://zhida.zhihu.com/search?content_id=169776037&content_type=Article&match_order=1&q=%E5%86%85%E6%A0%B8%E6%A8%A1%E5%9D%97&zhida_source=entity) 中声明这个模块跟"example,UIO"设备相匹配：

```
static const struct of_device_id my_of_ids[] = {
           { .compatible = "example,UIO"},
           {},
};
MODULE_DEVICE_TABLE(of, my_of_ids);
```

然后在 [设备树](https://zhida.zhihu.com/search?content_id=169776037&content_type=Article&match_order=1&q=%E8%AE%BE%E5%A4%87%E6%A0%91&zhida_source=entity) （device tree）中声明我们的硬件：

```
UIO {
         compatible = "example,UIO";
         reg = <0x30300000 0x10000>;
         // 加入需要的pinctrl状态
};
```

注意设备树里必须要用"example,UIO"作为compatible，这样我们的模块才能匹配到这个设备。

然后内核这边的工作就完成了！在用户空间我们只需要写这样的代码：

```
devuio_fd = open("/dev/uio0", O_RDWR | O_SYNC);
if (devuio_fd < 0){
       perror("Failed to open the device");
       exit(EXIT_FAILURE);
}

demo_driver_map = mmap(NULL, 0x10000, PROT_READ|PROT_WRITE,
                       MAP_SHARED, devuio_fd, 0);
if(demo_driver_map == MAP_FAILED) {
       perror("devuio mmap");
       close(devuio_fd);
       exit(EXIT_FAILURE);
}
```

这样就把0x30300000处的0x10000大小的寄存器空间开放给了用户空间，我们可以直接读写demo\_driver\_map处的地址，来操纵寄存器。如果那个寄存器是连接着一个LED的话，我们可以从用户空间点亮、熄灭LED。

实际操作中，硬件可能会有 [引脚复用](https://zhida.zhihu.com/search?content_id=169776037&content_type=Article&match_order=1&q=%E5%BC%95%E8%84%9A%E5%A4%8D%E7%94%A8&zhida_source=entity) （pin mux），需要我们在设备树里面配置pinctrl，让硬件的复用控制器接到我们需要的寄存器。

以上就是利用UIO框架在用户空间开发驱动的方法。

发布于 2021-04-24 11:29[应届生工作半年想转行学嵌入式，求建议?](https://www.zhihu.com/question/580214790/answer/3474838125)

[我是从一个普通二本毕业，98年的，电气工程及其自动化专业（学的一塌糊涂），校招去了一家私企当了一名设备工程师。这个岗位给我的感觉就是很闲，也学不到东西，每天保养维修设备，说...](https://www.zhihu.com/question/580214790/answer/3474838125)