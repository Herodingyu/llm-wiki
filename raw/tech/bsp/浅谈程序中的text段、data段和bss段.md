---
title: "浅谈程序中的text段、data段和bss段"
source: "https://zhuanlan.zhihu.com/p/28659560"
author:
  - "[[韦东山嵌入式关注公众号: 百问科技，学习更多嵌入式干货]]"
published:
created: 2026-05-02
description: "一般情况，一个程序本质上都是由 bss段、data段、text段三个段组成——这是计算机程序设计中重要的基本概念。而且在嵌入式系统的设计中也非常重要，牵涉到嵌入式系统运行时的内存大小分配，存储单元占用空间大小的…"
tags:
  - "clippings"
---
[收录于 · 韦东山嵌入式Linux](https://www.zhihu.com/column/c_118891916)

96 人赞同了该文章

一般情况，一个程序本质上都是由 [bss段](https://zhida.zhihu.com/search?content_id=3651742&content_type=Article&match_order=1&q=bss%E6%AE%B5&zhida_source=entity) 、 [data段](https://zhida.zhihu.com/search?content_id=3651742&content_type=Article&match_order=1&q=data%E6%AE%B5&zhida_source=entity) 、 [text段](https://zhida.zhihu.com/search?content_id=3651742&content_type=Article&match_order=1&q=text%E6%AE%B5&zhida_source=entity) 三个段组成——这是计算机程序设计中重要的基本概念。而且在 [嵌入式系统](https://zhida.zhihu.com/search?content_id=3651742&content_type=Article&match_order=1&q=%E5%B5%8C%E5%85%A5%E5%BC%8F%E7%B3%BB%E7%BB%9F&zhida_source=entity) 的设计中也非常重要，牵涉到嵌入式系统运行时的内存大小分配，存储单元占用空间大小的问题。

在采用 [段式内存管理](https://zhida.zhihu.com/search?content_id=3651742&content_type=Article&match_order=1&q=%E6%AE%B5%E5%BC%8F%E5%86%85%E5%AD%98%E7%AE%A1%E7%90%86&zhida_source=entity) 的架构中（比如intel的80x86系统），bss段（Block Started by Symbol segment）通常是指用来存放程序中未初始化的全局变量的一块内存区域，一般在初始化时bss 段部分将会清零（bss段属于静态内存分配，即程序一开始就将其清零了）。

比如，在C语言程序编译完成之后，已初始化的全局变量保存在.data 段中，未初始化的全局变量保存在.bss 段中。

**text段**: 用于存放程序代码的区域， 编译时确定， 只读。更进一步讲是存放处理器的机器指令，当各个源文件单独编译之后生成目标文件，经连接器链接各个目标文件并解决各个源文件之间函数的引用，与此同时，还得将所有目标文件中的.text段合在一起，但不是简单的将它们“堆”在一起就完事，还需要处理各个段之间的函数引用问题。

在嵌入式系统中，如果处理器是带 [MMU](https://zhida.zhihu.com/search?content_id=3651742&content_type=Article&match_order=1&q=MMU&zhida_source=entity) （MemoryManagement Unit， [内存管理单元](https://zhida.zhihu.com/search?content_id=3651742&content_type=Article&match_order=1&q=%E5%86%85%E5%AD%98%E7%AE%A1%E7%90%86%E5%8D%95%E5%85%83&zhida_source=entity) ），那么当我们的可执行程序被加载到内存以后，通常都会将.text段所在的内存空间设置为只读，以保护.text中的代码不会被意外的改写（比如在程序出错时）。当然，如果没有MMU就无法获得这种代码保护功能。

**data段**:用于存放在编译阶段(而非运行时)就能确定的数据，可读可写。也是通常所说的静态存储区，赋了初值的全局变量、常量和静态变量都存放在这个域。

而bss段不在可执行文件中，由系统初始化。

关于data和bss段更详细的区别我们不妨用下面2段小程序说明一下

程序1:

int ar\[30000\];

void main()

{

......

}

程序2:

int ar\[300000\] = {1, 2, 3, 4, 5, 6 };

void main()

{

......

}

发现程序2编译之后所得的可执行文件比程序1大得多。

为什么？

区别很明显，程序1位于bss段，程序2位于data段，两者的区别在于：

全局的未初始化变量存在于bss段中，具体体现为一个占位符，全局的已初始化变量存于data段中，而函数内的自动变量都在栈上分配空间。

bss不占用可执行文件空间，其内容由操作系统初始化（清零），裸机程序需要自行手动清零。

而data段则需要占用可执行文件空间，其内容由程序初始化，因此造成了上述情况。

**注意** ：

bss段（未手动初始化的数据）并不给该段的数据分配空间，只是记录数据所需空间的大小。

data段（已手动初始化的数据）为数据分配空间，数据保存在目标文件中。

data段包含经过初始化的全局变量以及它们的值。

BSS段的大小从可执行文件中得到，然后链接器得到这个大小的内存块，紧跟在数据段后面。当这个内存区进入程序的地址空间后全部清零，包含data和bss段的整个区段此时通常称为数据区。

**联系方式：**

韦东山商城： [首页-韦东山老师个人店-淘宝网](https://link.zhihu.com/?target=https%3A//100ask.taobao.com/)

电话：0755-86200561

手机/微信：13266630429 ，暗号：知乎专栏

[所属专栏 · 2025-12-25 17:53 更新](https://zhuanlan.zhihu.com/c_118891916)

[![](https://pic1.zhimg.com/v2-ede5849e82d5d2ac99d74873da4371d3_720w.jpg?source=172ae18b)](https://zhuanlan.zhihu.com/c_118891916)

[韦东山嵌入式Linux](https://zhuanlan.zhihu.com/c_118891916)

[

韦东山嵌入式

234 篇内容 · 12802 赞同

](https://zhuanlan.zhihu.com/c_118891916)

[

最热内容 ·

【2020/5.29开庭】韦东山：闲鱼与盗版更配，坚决打击盗版，起诉到底绝不和解！

](https://zhuanlan.zhihu.com/c_118891916)

编辑于 2018-08-10 13:26[怎样才能选择高效的报表工具？](https://www.zhihu.com/question/560285076/answer/1987111161032884620)

[

有关报表功能，大部分的朋友“吐槽”说：累觉不爱。可是，我们从实际的咨询量中发现：也许，是你不会用啊！今天，表姐就来介绍下表单大师报表统计功能的用法。/ 1 /数量统计适用场景：...

](https://www.zhihu.com/question/560285076/answer/1987111161032884620)