---
title: "UEFI代码是由谁加载的？ - 老狼 的回答"
source: "https://www.zhihu.com/question/342720591/answer/1152995242"
author:
  - "[[老狼​新知答主已关注]]"
  - "[[王方浩​自动驾驶话题下的优秀答主]]"
  - "[[binsys]]"
published:
created: 2026-05-02
description: "谢邀。这个问题答案本来很简单，但最近由于Boot Guard的引入变得复杂起来了。我们从简单的答案讲起。简单…"
tags:
  - "clippings"
---
## UEFI代码是由谁加载的？

[![](https://pica.zhimg.com/v2-de7e9ee6f2bd9282ce1199d2c6e0046c.jpeg)

BIOS

评分积累中

· 8 人评价

BIOS是一款专注于生物医学研究的AI科学家工具，在BixBench上排名第一，旨在提升研究效率和生产力。

](https://www.zhihu.com/topic/19564458)

经常听人说，UEFI取代了BIOS。 据我所致，BIOS是固化在FLASH中的一段代码，CPU在加电之后从FLASH中载入BIOS，然后完成后续启动步…

269 人赞同了该回答

![](https://picx.zhimg.com/v2-d06e7ee95d2d0d0eb3205592f33d06a4.jpg?source=7e7ef6e2&needBackground=1)

用微信扫描二维码加入UEFIBlog公众号

还没有人送礼物，鼓励一下作者吧[学模拟IC必须掌握什么？](https://zhuanlan.zhihu.com/p/591824367)

[

在IC行业有一个共识： 模拟设计入门很难，熟练掌握更难。初入行或者还没入行的同学，只是模糊地知道模拟难度要大于数字，但...

](https://zhuanlan.zhihu.com/p/591824367)

#### 更多回答

![](https://picx.zhimg.com/50/v2-7a69a925975761cf16df7bd567b533c9_720w.jpg?source=1def8aca)

首先简单说明下，现在所说的UEFI就是BIOS，也是放在一块8M的Flash中。而硬盘中也有一块EFI分区，这个分区存放的是引导程序，拿linux来举例就是GRUB。所以2者不要混淆。 那么接下来，我们在详细分析下，系统的整个启动过程，以及如何加载UEFI，启动操作系统。 开机 用简单的语言来描述就是，电脑按下开机键之后做了什么？ 1. 我们先看下CPU的结构，之前intel的CPU是由南北桥组成的，在我做固件的时候，北桥就已经没有了，北桥主要是做内存控制器用途的，由于同样是高速总线，所以集成到CPU里面了，只留下了南桥，南桥主要是低速总线，例如串口，USB接口，硬盘，显示器接口等（现在南桥也已经集成在CPU里了，所以后面统一称CPU），其中就包括我们的BIOS，之前的叫法是BIOS，现在intel升级了一下软件架构，使得BIOS更加灵活，类似一个小的操作系统，改名叫UEFI，然后扶植台湾亲儿子做这个架构，成为了开机启动的事实标准。 2. 实际上开机启动之后，CPU会从外部地址去取指令，intel的CPU是从FFxxxxxx的某个地址，而ARM则大部分是从0地址取指令。所以大部分固件也就是UEFI（ARM叫uboot）会把启动程序放在这个地址，这段代码大部分都是汇编代码，做一些简单的初始化，有人就问了，为什么不用C语言呢，因为这时候系统还没有初始化堆栈，而C语言是需要堆栈的，而汇编则不需要，做完简单的初始化之后，UEFI会把cache当做堆栈使用，然后初始化内存，之后会把程序搬运到内存中，之后就是初始化各种硬件了，例如USB接口，显卡，硬盘等。 也就是说，CPU每次启动都会从固定的地址取指令来初始化CPU，然后初始化整个硬件设备 。 启动操作系统 UEFI启动完成之后，一般会有一个选择启动项的界面，选择从那个硬盘或者操作系统启动。 1. 这一部分选择好之后，BIOS直接会跳转到硬盘的MBR分区，BIOS就已经结束了，以后没BIOS什么事情了。程序跳转到MBR分区（MBR是硬盘的第一个分区）之后，就会加载操作系统的引导程序，实际上这一部分也是相当复杂，因为MBR一个分区只有512个字节，对普通的程序来说太小了，所以这一部分实际上也是一些指针，让程序跳转到真正的引导程序去启动，类似一个向导的功能。随着PC的发展，上面的引导方式捉襟见肘，首先的一个问题是MBR分区坏了怎么办，那么整个盘就废掉了，因为没法引导操作系统了。 2. 那么UEFI是如何解决这个问题的呢？UEFI的架构好就好在，支持了EFI文件系统，也就是说，我不关心文件在那个扇区，我只关心文件，这样引导程序可以放在第一个分区MBR，也可以在第100个，这就解决了上面的问题。因此每次安装操作系统的时候都会多出一个EFI分区（大部分对用户是隐藏的）， 这个分区的作用就是安装引导程序，以linux来举例子就是安装grub，UEFI启动之后，直接读取硬盘的EFI文件系统，然后启动grub，再由grub去引导操作系统 。操作系统启动之后就接管了整个硬件，用户就可以在操作系统下工作了。而windows也有对应的引导程序，只不过这一部分没有公开，也是在EFI分区 \[1\] 总结 系统开机之后会从UEFI启动，初始化整个硬件，之后会跳到硬盘的EFI分区，启动操作系统引导程序，之后操作系统开始工作。 参考 EFI分区 http://cn.wondershare.com/recover-data/all-you-need-to-know-about-the-efi-system-partition.html

UEFI是个统称，按照问题来看，可以划分为UEFI执行环境，和在磁盘上的作为OS Loader 的 UEFI App。

App 由UEFI环境来加载，UEFI环境就是所谓的BIOS，通常固化在主板上。

简单说磁盘上你看到的efi文件仅仅是整个uefi引导的最后阶段。在这之前固化在主板上的uefi固件已经跑很多东西了。

![](chrome-extension://difoiogjjojoaoomphldepapgpbgkhkb/assets/logo-O35E636P.png) Sider

[导游称大熊猫花花是残疾游客秒报警 340 万](https://www.zhihu.com/search?q=%E5%AF%BC%E6%B8%B8%E7%A7%B0%E5%A4%A7%E7%86%8A%E7%8C%AB%E8%8A%B1%E8%8A%B1%E6%98%AF%E6%AE%8B%E7%96%BE%E6%B8%B8%E5%AE%A2%E7%A7%92%E6%8A%A5%E8%AD%A6&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[孙杨被曝疑违规录取博士 335 万](https://www.zhihu.com/search?q=%E5%AD%99%E6%9D%A8%E8%A2%AB%E6%9B%9D%E7%96%91%E8%BF%9D%E8%A7%84%E5%BD%95%E5%8F%96%E5%8D%9A%E5%A3%AB&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[女子徒手给月子里宝宝打耳洞 294 万](https://www.zhihu.com/search?q=%E5%A5%B3%E5%AD%90%E5%BE%92%E6%89%8B%E7%BB%99%E6%9C%88%E5%AD%90%E9%87%8C%E5%AE%9D%E5%AE%9D%E6%89%93%E8%80%B3%E6%B4%9E&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[曝吴宣仪提出解约遭乐华拒绝 289 万](https://www.zhihu.com/search?q=%E6%9B%9D%E5%90%B4%E5%AE%A3%E4%BB%AA%E6%8F%90%E5%87%BA%E8%A7%A3%E7%BA%A6%E9%81%AD%E4%B9%90%E5%8D%8E%E6%8B%92%E7%BB%9D&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[阿 Sa 蔡卓妍官宣结婚 289 万](https://www.zhihu.com/search?q=%E9%98%BF+Sa+%E8%94%A1%E5%8D%93%E5%A6%8D%E5%AE%98%E5%AE%A3%E7%BB%93%E5%A9%9A&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[广州地铁有人喷洒不明液体 266 万](https://www.zhihu.com/search?q=%E5%B9%BF%E5%B7%9E%E5%9C%B0%E9%93%81%E6%9C%89%E4%BA%BA%E5%96%B7%E6%B4%92%E4%B8%8D%E6%98%8E%E6%B6%B2%E4%BD%93&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)