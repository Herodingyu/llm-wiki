---
title: "为什么ARM Server要用ACPI？ACPI vs DeviceTree"
source: "https://zhuanlan.zhihu.com/p/488898867"
author:
  - "[[老狼​新知答主]]"
published:
created: 2026-05-02
description: "近期除了新冠疫情泛滥的新闻之外，最吸引人们注意力的莫过于乌克兰的战争了。出乎大多数人的意料以外，曾经以为会一边倒的战争，变得拖沓不堪，恰如上海的“短暂”隔离——没完没了。无论结果如何，这场战争让曾经…"
tags:
  - "clippings"
---
[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog)

216 人赞同了该文章

目录

近期除了新冠疫情泛滥的新闻之外，最吸引人们注意力的莫过于乌克兰的战争了。出乎大多数人的意料以外，曾经以为会一边倒的战争，变得拖沓不堪，恰如上海的“短暂”隔离——没完没了。无论结果如何，这场战争让曾经老大哥科技上的软肋暴露无遗，在美国和欧洲的高科技武器和信息战助力下，俄军不但没有风卷残云，反倒随着时间的推进，落入被动挨打的局面。对于看似置身局外的中国来讲，这次“特别军事行动”，在某种程度上是个好事，它是一次真实的沙盘演练，在不损失什么的情况下，看看对方出招的方向在哪里。相信今后，追求科技进步，尤其是芯片产业完全自主可控，更成为国家的当务之急。

国内芯片设计热已经有一段时间了，我不时可以获知这家或者那家在做芯片。有些公司非常有名，有些则在百度上也搜不到，只有在企查查之类的软件上管窥一下。其中不少公司还找上门来，让帮忙搞定 [BIOS](https://zhida.zhihu.com/search?content_id=196775608&content_type=Article&match_order=1&q=BIOS&zhida_source=entity) 。这些新芯片大部分基于成熟ARM的架构，也有时下新宠 [RISC-V](https://zhida.zhihu.com/search?content_id=196775608&content_type=Article&match_order=1&q=RISC-V&zhida_source=entity) 。这其中有一个规律：RISC-V芯片族还在忙着进入嵌入式系统，而ARM芯片们则从嵌入式系统中向上生长，不断侵蚀桌面和笔电系统，更是向x86占据绝对优势的服务器领域发起第三波冲击。在和这些新伙伴交流的时候，一个问题总是被反复提及：为什么嵌入式系统中运行良好的 [uboot](https://zhida.zhihu.com/search?content_id=196775608&content_type=Article&match_order=1&q=uboot&zhida_source=entity) + DeviceTree模式固件，在台式机，特别是服务器市场中，不能照方抓药呢？

在客户闪烁的眼神背后，我听出了客户的弦外之音：uboot+DeviceTree模式没有BIOS厂商什么事，为什么ARM服务器不行？相当于客户问S4店，你们能带来什么价值？为什么要给中间商赚差价的意思。听到这个事关商业模式是否可行的终极问题，我是病中惊坐起，强打十二分精神，来回答一下这个问题：为什么通用服务器要用 [UEFI](https://zhida.zhihu.com/search?content_id=196775608&content_type=Article&match_order=1&q=UEFI&zhida_source=entity) + ACPI？

前一阵，我花了点时间，介绍了ARM SystemReady的由来和目的：

我在其中介绍了uboot的种种局限，和传统ARM在软件上的封闭与x86的开放（尽管硬件上恰恰相反）。今天咱们从另一个角度来看一下这个问题。

## 嵌入式产品 vs 服务器产品

我们分别在两者中各挑选一个典型产品，看看他们的客群和商业模式有什么区别。手机是典型的嵌入式产品，它和云服务器的客户有什么不同？

手机的客户是终端消费者，它是一种高度定制化产品。它的硬件和软件一经出厂，则不能轻易改变。用户既不能随便更换主板上的各种硬件，也不能更换软件。不信可以试试看能不能在苹果手机刷入华为手机固件（包括操作系统），是不是就可以得到一个苹果样子的华为手机？不但不同厂商不能互刷，同一个厂商不同的产品线一般也不能互刷。如此的高度定制，让通用需求极大削弱，对硬件和操作系统的互操作性需求也相应减弱了。

云服务器的客户是云服务厂商和企业IT等专业用户。这些客户一个根本诉求是兼容性，包括硬件的和软件的。因为带有芯片和BIOS的主板只是拼图的一小部分，各种外围板卡、操作系统、中间件、数据库和上层软件则是拼图中更大一块。这些部分往往从不同的厂商采购，甚至有些板卡和软件是祖传的，没人敢改。服务器超级复杂，不能垂直整合，只能采用生态圈的模式。这对硬件和操作系统的互操作性提出了很高的要求。 **要通用和互操作，这就要标准化，各个部件也要各自产品化，而不能是整个产品是一个产品就好了** 。操作系统只有一份，是一个单独的产品；PCIe板卡也是一个产品，单独售卖；尽管主板和CPU千奇百怪， **但这些硬件和软件的各种产品都可以在上面顺利运行，主板上的BIOS定制起到了关键作用** 。BIOS起到了遮蔽硬件区别，提供统一界面的作用。

UEFI的标准化让它相对uboot，更加适合服务器和个人电脑。它初始化了硬件，并 **主要通过ACPI来描述硬件，提供一个硬件抽象表述（另外一个是SMBIOS）** 。但DeviceTree也是标准化 [^1] 和开源 [^2] 的数据格式，它也能隐藏和汇报硬件的差异，为什么服务器必须使用ACPI呢？为什么前文介绍的ARM SystemReady中仅有面向嵌入式的IR标准用推荐用DeviceTree，而服务器的基线SBBR （Server Base Boot Requirements）中明确要求ACPI呢？

## DeviceTree简介

早期Linux和硬件芯片与平台绑定严重，在arch/arm下有着众多名字叫march-xxxx（芯片微架构）和plat-xxx（平台）的目录，里面有着众多各个芯片和平台的代码。基本上每加入一个芯片和平台，就要加入一个目录和一组代码，可扩展性十分差。而相较而言，i386等目录就清爽了很多。这种情况不能持续，随着支持Linux开始支持越来越多的平台和芯片，矛盾爆发了（Linus发飙了）。

支持PowerPC和SPARC的Open Firmware有一种不错的硬件抽象模型：DeviceTree（DT）。顾名思义，也就是用设备树的方式，将系统中的硬件设备组织和继承关系描述出来。Linux在支持这两种架构的CPU的时候，也加入了对DT的支持。在ARM Linux这种C语言硬编码模式支持芯片和平台出现瓶颈后，自然而然，DT就被借鉴过来，从此目录清爽了很多（后期做过清理）。

DT的文本模式叫做DTS（Device Tree Source），它是文本的可以方便阅读的版本，相当于c语言的.c文件，可以用任何文本编辑器编辑它。它采用树状描述系统的设备。让我们看一个例子，如BeagleBone Black [^3]

![](https://pic4.zhimg.com/v2-b6545be4b0ae4fa044e193ab4bd83c55_1440w.jpg)

我们把它的设备抽象成：

![](https://pic3.zhimg.com/v2-ce023b187e155d01bda8d4641794a25e_1440w.jpg)

一个对应的DTS文件为：

```
{
   model = "TI AM335x BeagleBone Black"; 
   compatible = "ti,beaglebone-black", "ti,am335x-boneblack", "ti,am335x-bone", "ti,am33xx"; 
    cpus 
    { 
      cpu@0 { cpu0-supply = <&dcdc2_reg>;  }; 
     }; 
     memory 
    { 
       device_type = "memory"; reg = <0x80000000 0x10000000>; /* 256 MB */ 
    };
};
```

其中的关键字和细节因为篇幅的关系，我就不展开介绍了，感兴趣的同学请自行阅读spec [^2] 。

DTS相当于c源码，要编译以后才能用。DT的编译器叫做DTC（Device Tree Complier），编译后形成相当于C语言.obj的DTB（Device Tree BLOB）文件。编译命令像这样：

```
dtc -O dtb -o outputBLOB.dtb -b 0 inputSOURCE.dts
```

Linux中有DTB解释器，能解析DTB格式（ePAPR），做到动态Binding。

DT可以和Linux一起编译，build到最后的zImage中，搜索boot/dts，你还可以看到它们。也可以由BIOS动态生成，通过传参的方式传递给Linux内涵。

如果我们自行观察DT的设备树，就会发现它和ACPI定义的设备树十分神似。两者都可以描述系统中设备的硬件，提供硬件抽象表述，那么什么让DT不能用于服务器这个市场呢？

## DeviceTree vs ACPI

ACPI和UEFI一样，由微软和Intel联合提出。血液中的微软味道，让Linux社区天然的就产生了抵触心理，在开始试图采用UEFI + DT来支持服务器，最后还是选择拥抱ACPI了。是什么原因呢？Linux社区专文做出了回答 [^4] 。简单来说包含一下几点：

1。ACPI更强大：ACPI不但提供静态表和设备数，还由AML提供动态方法(Method)。由OSPM解释执行的Method，让主板厂商有了更大的灵活性，可以做出更加复杂的行为。如RAS这种有一系列操作实现的功能，用DT来实现是不可想象的。 **也就是ACPI不但实现了硬件设备的静态抽象，还实现了硬件行为的动态抽象。**

2。ACPI更全面：ACPI顾名思义，还提供全面的电源管理功能。

3。ACPI兼容性更强：用一套抽象模型可以支持全部操作系统，如果用DT的话，需要另外采用ACPI支持Windows（ARM Windows）

4。ACPI已经是服务器事实标准：随着x86服务器占据主流，ACPI已经占据了服务器生态位，后进的ARM要支持既有的配件和生态，采用ACPI是明智之举。PCI/ [PCIe总线](https://zhida.zhihu.com/search?content_id=196775608&content_type=Article&match_order=1&q=PCIe%E6%80%BB%E7%BA%BF&zhida_source=entity) 在ARM服务器中的广泛接纳也是这个道理。

## 结论

以上四点，尤其是第一点，让UEFI+ACPI的模式在服务器端看起来十分必要，BIOS的商业模式还可以在ARM上继续。

DT标准还在演进，最近的标准发布于2021年，它在ARM嵌入式系统中牢牢占住脚跟。但ACPI已经占据了服务器和大部分桌面。个人觉得在嵌入式系统中uboot+DT的方式不需要改变，而服务器领域的UEFI+ACPI也将是ARM服务器的必然选择。有意思的是中间地带：由台式机和笔电代表的消费类产品。

由于ARM性能的提高，越来越多的厂家拥抱ARM电脑，微软Windows ARM版工作得也不错，桌面ARM的功能也越来越全面，通用性要求也变高了。在桌面端接纳或者移植ACPI，成为了一个趋势。而 **国产ARM桌面芯片** ，除了 [鲲鹏](https://zhida.zhihu.com/search?content_id=196775608&content_type=Article&match_order=1&q=%E9%B2%B2%E9%B9%8F&zhida_source=entity) 和 [飞腾](https://zhida.zhihu.com/search?content_id=196775608&content_type=Article&match_order=1&q=%E9%A3%9E%E8%85%BE&zhida_source=entity) ，其他对ACPI的接纳度很低。这让国产Linux厂商十分困扰，尽管Linux已经支持两者，但并不能同时支持。同时支持两个分支增加了工作量，也带来了产品质量问题。DT和ACPI，就像一对矛盾，在ARM桌面这个战场上，到底是盾挡住矛，还是矛戳破盾呢？结局也许十分明显。

欢迎大家关注本专栏和用微信扫描下方二维码加入微信公众号"UEFIBlog"，在那里有最新的文章。关注公众号，留言“资料”，有一些公开芯片资料供下载。

![](https://pic1.zhimg.com/v2-91d380fba0955ebce85e5bf264d63cf6_1440w.jpg)

## 参考

还没有人送礼物，鼓励一下作者吧

编辑于 2022-03-30 10:50[操作系统](https://www.zhihu.com/topic/19552686)[国产](https://www.zhihu.com/topic/19582468)

[^1]: DeviceTree官网 [https://www.devicetree.org/](https://www.devicetree.org/)

[^2]: ^ <sup><a href="#ref_2_0">a</a></sup> <sup><a href="#ref_2_1">b</a></sup> DeviceTree Spec [https://github.com/devicetree-org/devicetree-specification](https://github.com/devicetree-org/devicetree-specification)

[^3]: beagleboard BLACK官网 [https://beagleboard.org/BLACK](https://beagleboard.org/BLACK)

[^4]: Why ACPI？ [https://www.kernel.org/doc/html/latest//arm64/arm-acpi.html#why-acpi-on-arm](https://www.kernel.org/doc/html/latest//arm64/arm-acpi.html#why-acpi-on-arm)