---
title: "了解Linux内核内存映射（二）"
source: "https://zhuanlan.zhihu.com/p/536802325"
author:
  - "[[精通Linux内核Linux内核技术交流群q群977878001欢迎大家进群]]"
published:
created: 2026-05-02
description: "一. IO映射介绍设备驱动程序要直接访问外设或其接口卡上的物理电路，这部分通常都是以寄存器的形式出现。外设寄存器也称为I/O端口，通常包括：控制寄存器、状态寄存器和数据寄存器三大类。根据访问外设寄存器的不…"
tags:
  - "clippings"
---
2 人赞同了该文章

**一. IO映射介绍**

设备 [驱动程序](https://zhida.zhihu.com/search?content_id=207422841&content_type=Article&match_order=1&q=%E9%A9%B1%E5%8A%A8%E7%A8%8B%E5%BA%8F&zhida_source=entity) 要直接访问外设或其接口卡上的 [物理电路](https://zhida.zhihu.com/search?content_id=207422841&content_type=Article&match_order=1&q=%E7%89%A9%E7%90%86%E7%94%B5%E8%B7%AF&zhida_source=entity) ，这部分通常都是以寄存器的形式出现。外设寄存器也称为I/O端口，通常包括：控制寄存器、 [状态寄存器](https://zhida.zhihu.com/search?content_id=207422841&content_type=Article&match_order=1&q=%E7%8A%B6%E6%80%81%E5%AF%84%E5%AD%98%E5%99%A8&zhida_source=entity) 和数据寄存器三大类。根据访问外设寄存器的不同方式，可以把CPU分成两大类。一类CPU（如ARM，Power PC等）把这些寄存器看作内存的一部分，寄存器参与内存统一编址，访问寄存器就通过访问一般的 [内存指令](https://zhida.zhihu.com/search?content_id=207422841&content_type=Article&match_order=1&q=%E5%86%85%E5%AD%98%E6%8C%87%E4%BB%A4&zhida_source=entity) 进行，所以，这种CPU没有专门用于设备I/O的指令。这就是所谓的“I/O内存”方式。另一类CPU（典型地如X86）将外设的寄存器看成一个独立的 [地址空间](https://zhida.zhihu.com/search?content_id=207422841&content_type=Article&match_order=1&q=%E5%9C%B0%E5%9D%80%E7%A9%BA%E9%97%B4&zhida_source=entity) ，所以访问内存的指令不能用来访问这些寄存器，而要为对外设寄存器的读／写设置专用指令，如IN和OUT指令。这就是所谓的” I/O端口”方式 。目前有两种方式实现 [IO寄存器](https://zhida.zhihu.com/search?content_id=207422841&content_type=Article&match_order=1&q=IO%E5%AF%84%E5%AD%98%E5%99%A8&zhida_source=entity) 的访问：

**a – I/O 映射方式（I/O-mapped）**

典型地，如X86处理器为外设专门实现了一个单独的地址空间，称为"I/O地址空间"或者"I/O端口空间"，CPU通过专门的I/O指令（如X86的IN和OUT指令）来访问这一空间中的地址单元。

**b – 内存映射方式（Memory-mapped）**

RISC [指令系统](https://zhida.zhihu.com/search?content_id=207422841&content_type=Article&match_order=1&q=%E6%8C%87%E4%BB%A4%E7%B3%BB%E7%BB%9F&zhida_source=entity) 的CPU（如ARM、PowerPC等）通常只实现一个 [物理地址空间](https://zhida.zhihu.com/search?content_id=207422841&content_type=Article&match_order=1&q=%E7%89%A9%E7%90%86%E5%9C%B0%E5%9D%80%E7%A9%BA%E9%97%B4&zhida_source=entity) ，外设I/O端口成为内存的一部分。此时，CPU可以象访问一个 [内存单元](https://zhida.zhihu.com/search?content_id=207422841&content_type=Article&match_order=1&q=%E5%86%85%E5%AD%98%E5%8D%95%E5%85%83&zhida_source=entity) 那样访问外设I/O端口，而不需要设立专门的外设I/O指令。

但是，这两者在硬件实现上的差异对于软件来说是完全透明的，驱动程序开发人员可以将内存映射方式的I/O端口和外设内存统一看作是"I/O内存"资源。

一般来说，在系统运行时，外设的I/O内存资源的物理地址是已知的，由硬件的设计决定。但是CPU通常并没有为这些已知的外设I/O内存资源的物理地址预定义 [虚拟地址](https://zhida.zhihu.com/search?content_id=207422841&content_type=Article&match_order=1&q=%E8%99%9A%E6%8B%9F%E5%9C%B0%E5%9D%80&zhida_source=entity) 范围，驱动程序并不能直接通过物理地址访问I/O内存资源， [linux内存映射（二）\_卢平光的博客-CSDN博客](https://link.zhihu.com/?target=https%3A//blog.csdn.net/ludashei2/article/details/91344508) 一般来说，在系统运行时，外设的I/O内存资源的物理地址是已知的，由硬件的设计决定。但是CPU通常并没有为这些已知的外设I/O内存资源的物理地址预定义虚拟地址范围，驱动程序并不能直接通过物理地址访问I/O内存资源，

而必须将它们映射到核心虚地址空间内（通过页表），然后才能根据映射所得到的核心虚地址范围，通过访内指令访问这些I/O内存资源。

**二. Memory-mapped**

内存映射方式操作IO寄存器可分为两步：

**[虚拟内存空间](https://zhida.zhihu.com/search?content_id=207422841&content_type=Article&match_order=1&q=%E8%99%9A%E6%8B%9F%E5%86%85%E5%AD%98%E7%A9%BA%E9%97%B4&zhida_source=entity) 申请**

虽然虚拟内存是操作系统挂历的的虚拟资源，但同样需要申请，主要用到以下两个函数：

\*\*struct resource requset\_mem\_region(unsigned long start, unsigned long len,char name)

这个函数从内核申请len个 [内存地址](https://zhida.zhihu.com/search?content_id=207422841&content_type=Article&match_order=1&q=%E5%86%85%E5%AD%98%E5%9C%B0%E5%9D%80&zhida_source=entity) （在3G~4G之间的虚地址），而这里的start为I/O物理地址，name为设备的名称。注意，。如果分配成功，则返回非NULL，否则，返回NULL。另外，可以通过/proc/iomem查看系统给各种设备的内存范围。

要释放所申请的I/O内存，应当使用release\_mem\_region（）函数：

void release\_mem\_region(unsigned long start, unsigned long len)

**IO地址映射**

将一个IO地址 [空间映射](https://zhida.zhihu.com/search?content_id=207422841&content_type=Article&match_order=1&q=%E7%A9%BA%E9%97%B4%E6%98%A0%E5%B0%84&zhida_source=entity) 到内核的 [虚拟地址空间](https://zhida.zhihu.com/search?content_id=207422841&content_type=Article&match_order=1&q=%E8%99%9A%E6%8B%9F%E5%9C%B0%E5%9D%80%E7%A9%BA%E9%97%B4&zhida_source=entity) 上去

void \* \_\_ioremap(unsigned long phys\_addr, unsigned long size, unsigned long flags)

入口： phys\_addr：要映射的起始的IO地址；

size：要映射的空间的大小；

flags：要映射的IO空间的和权限有关的标志；

*\*void [ioremap](https://zhida.zhihu.com/search?content_id=207422841&content_type=Article&match_order=2&q=ioremap&zhida_source=entity) (unsigned long phys\_addr, unsigned long size)*

*phys\_addr：是要映射的物理地址*

*size：是要映射的长度，单位是字节*

*[头文件](https://zhida.zhihu.com/search?content_id=207422841&content_type=Article&match_order=1&q=%E5%A4%B4%E6%96%87%E4%BB%B6&zhida_source=entity) ：io.h*

*注意：是物理地址所在页整页映射*

ioremap 依靠 \_\_ioremap实现,它只是在\_\_ioremap中以第三个参数为0调用来实现.

ioremap是内核提供的用来映射外设寄存器到主存的函数：举个例子，比如某个驱动设备有100 个寄存器，他们都是连在一块的，位置是固定的，假如每个寄存器占4个字节，那么一共400个字节的空间被映射到内存成功后，ioaddr就是这段地址的开头（注意ioaddr是虚拟地址，而mmio\_start是物理地址，它是BIOS得到的，肯定是物理地址，而保护模式下CPU不认物理地址，只认虚拟地址），ioaddr+0就是第一个寄存器的地址，ioaddr+4就是第二个 [寄存器地址](https://zhida.zhihu.com/search?content_id=207422841&content_type=Article&match_order=1&q=%E5%AF%84%E5%AD%98%E5%99%A8%E5%9C%B0%E5%9D%80&zhida_source=entity) （每个寄存器占4个字节），以此类推。

*ioremap\_nocache - 把内存映射到CPU空间*

*void \_\_iomem \* ioremap\_nocache (unsigned long phys\_addr, unsigned longsize);*

*phys\_addr：要映射的物理地址*

*size：要映射资源的大小*

ioremap\_nocache进行一系列平台相关的操作使得CPU可以通过readb/readw/readl/writeb/writew/writel等IO函数进行访问。

注：返回的地址不保证可以作为虚拟地址直接访问。

调用ioremap\_nocache()函数之后，返回一个线性地址,此时CPU 可以访问设备的内存(已经将其映射到了线性地址空间中了),此时CPU可以使用访问内存的指令访问设备的内存空间(host bridge 判断访问 [物理内存](https://zhida.zhihu.com/search?content_id=207422841&content_type=Article&match_order=1&q=%E7%89%A9%E7%90%86%E5%86%85%E5%AD%98&zhida_source=entity) 还是设备中的内存)，此时我们就可以像访问内存一样来访问设备的内存(寄存器)。

ioremap 与ioremap\_nocache唯一的区别就是，ioremap映射得到的虚拟地址可直接想操作内存一样使用，而ioremap\_nocache获得的虚拟地址只能通过内核提供的专用函数来访问IO寄存器

**三. ioremap 与 [mmap](https://zhida.zhihu.com/search?content_id=207422841&content_type=Article&match_order=1&q=mmap&zhida_source=entity)**

上一节已经介绍过mmap，其实 [mmap函数](https://zhida.zhihu.com/search?content_id=207422841&content_type=Article&match_order=1&q=mmap%E5%87%BD%E6%95%B0&zhida_source=entity) 可以直接将硬件物理地址与自身虚拟地址进行映射，这样就不需要经过kernel驱动来操作硬件了（前提是用户进程已知硬件物理地址，或者驱动帮用户集成记忆了硬件物理地址）。另外kenrel驱动可使用ioremap将硬件物理地址与内核虚拟地址进行映射，这样驱动也可直接操作硬件。

可总结为两种方式映射物理硬件寄存器地址：

1 驱动直接控制

使用ioremap函数得到内核空间虚拟地址，直接访问

2 用户进程调用驱动实现的mmap函数，将硬件地址直接映射到用户虚拟地址空间，绕过内核（驱动）。

其中，需映射的物理地址有两种传递方式：

a 用户进程知道硬件寄存器地址基地址（必须为页帧整数倍）以及需控制的寄存器地址偏移，则可在调用mmap时，传递给驱动

b 用户调用mmap时指定 [offset](https://zhida.zhihu.com/search?content_id=207422841&content_type=Article&match_order=1&q=offset&zhida_source=entity) 为0，真正的物理地址由驱动记忆

下提供一个用户进程通过调用驱动提供的mmap函数，实现直接读写硬件寄存器的程序skeleto

user app:

```
#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <sys/mman.h>
#include <unistd.h>
#define GPIO_BASE                    (0x20000000 + 0x200000)
#define GPIO_DATA_OFFSET              0x0244
#define BLOCK_SIZE (4*1024)
 
volatile unsigned int *gpio;
void init_gpio(void)
{
int  mem_fd;
void *gpio_map;
/* open /dev/mem */
if ((mem_fd = open("/dev/mem", O_RDWR|O_SYNC) ) < 0) {
      printf("can't open /dev/mem \n");
      exit(-1);
   }
 /* mmap GPIO ,注意，mmap总是按页帧映射的，因此无论用户传递的offset设置为寄存器基地址还是改组寄存器中的某一个寄存器地址偏移，实际映射后得到虚拟地址都是这组寄存器所在页帧的映射虚拟地址，因此最好直接将offset指定为寄存器基地址，并且清楚知道需控制的寄存器地址相对于基地址的偏移量。
  */
gpio_map = mmap(
      NULL, 
      BLOCK_SIZE,   
      PROT_READ|PROT_WRITE,
      MAP_SHARED,     
      mem_fd,          
      GPIO_BASE      
   );
close(mem_fd);
if (gpio_map == MAP_FAILED) {
      printf("mmap error %d\n", (int)gpio_map);
      exit(-1);
   }
   // Always use volatile pointer!
   gpio = (volatile unsigned int *)(gpio_map + GPIO_DATA_OFFSET);
}
```

driver:

```
static int my_map(struct file *filp, struct vm_area_struct *vma)
{    
    //unsigned long page;
    unsigned char i;
    //注意这里不需要作右移，因为vma结构体已将上层传递物理地址转为页帧
    //若用户传递offset为0即vm_pgoff =0，那么驱动需自己知道硬件地址，此时需要做一下物理地址到页帧率的转化 即PA_ADDR >> PAGE_SHIFT
    unsigned long offset = vma->vm_pgoff;
    unsigned long start = (unsigned long)vma->vm_start;
    //unsigned long end =  (unsigned long)vma->vm_end;
    unsigned long size = (unsigned long)(vma->vm_end - vma->vm_start);

  
    //将用户空间的一个vma虚拟内存区映射到以page开始的一段连续物理页面上
    if(remap_pfn_range(vma,start,offset,size,PAGE_SHARED))//第三个参数是页帧号，由物理地址右移PAGE_SHIFT得到
        return -1;
    return 0;
}
```

需注意，用户进程调用的mmap函数与驱动mmap的实现所使用的形参不同，因为mmap到my\_map的过程中会发生如下操作：

mmap内存映射的实现过程，总的来说可以分为三个阶段：

**（一）进程启动映射过程，并在虚拟地址空间中为映射创建虚拟映射区域**

1、进程在用户空间调用库函数mmap，原型：void \*mmap(void \*start, size\_t length, int prot, int flags, int fd, off\_t offset);

2、在当前进程的虚拟地址空间中，寻找一段空闲的满足要求的连续的虚拟地址

3、为此虚拟区分配一个vm\_area\_struct结构，接着对这个结构的各个域进行了初始化

4、将新建的虚拟区结构（vm\_area\_struct）插入进程的虚拟地址区域链表或树中

**（二）调用内核空间的系统调用函数mmap（不同于用户空间函数），实现文件物理地址和进程虚拟地址的一一映射关系**

5、为映射分配了新的虚拟地址区域后，通过待映射的 [文件指针](https://zhida.zhihu.com/search?content_id=207422841&content_type=Article&match_order=1&q=%E6%96%87%E4%BB%B6%E6%8C%87%E9%92%88&zhida_source=entity) ，在文件描述符表中找到对应的文件描述符，通过文件描述符，链接到内核“已打开文件集”中该文件的 [文件结构](https://zhida.zhihu.com/search?content_id=207422841&content_type=Article&match_order=1&q=%E6%96%87%E4%BB%B6%E7%BB%93%E6%9E%84&zhida_source=entity) 体（struct file），每个文件结构体维护着和这个已打开文件相关各项信息。

6、通过该文件的文件结构体，链接到file\_operations模块，调用内核函数mmap，其原型为：int mmap(struct file \*filp, struct vm\_area\_struct \*vma)，不同于用户空间库函数。

7、内核mmap函数通过 [虚拟文件系统](https://zhida.zhihu.com/search?content_id=207422841&content_type=Article&match_order=1&q=%E8%99%9A%E6%8B%9F%E6%96%87%E4%BB%B6%E7%B3%BB%E7%BB%9F&zhida_source=entity) inode模块定位到文件磁盘物理地址。

8、通过remap\_pfn\_range函数建立页表，即实现了文件地址和虚拟地址区域的映射关系。此时，这片虚拟地址并没有任何数据关联到主存中。

```
原文链接：http://t.csdn.cn/6KwIb
```
![动图封面](https://pic2.zhimg.com/v2-df4511ec8745e3127fd4a153d9c01309_b.jpg)

![动图封面](https://pic3.zhimg.com/v2-da564508fa41f8a1eeea932ff5246280_b.jpg)

编辑于 2022-07-05 22:04[有什么简单的库存管理软件？](https://www.zhihu.com/question/635557587/answer/1974413172032156202)

[

用表单大师搭建库存管理系统，低成本、高效率，个性化不怕踩雷，轻松实现生产、销售、库存、财务管理一体化。同时操作成本也不高，操作者往往只需要用户进行直观地拖、拉、拽、连线等...

](https://www.zhihu.com/question/635557587/answer/1974413172032156202)