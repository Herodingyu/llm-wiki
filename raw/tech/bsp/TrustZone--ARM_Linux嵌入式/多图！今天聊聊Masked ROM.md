---
title: "多图！今天聊聊Masked ROM"
source: "https://zhuanlan.zhihu.com/p/716456419"
author:
  - "[[TrustZone​​​海思技术有限公司 员工]]"
published:
created: 2026-05-03
description: "Hi，早！ 今天讲讲掩模ROM，为啥讲这个？两个原因： 1、昨天写了一篇文章：后来你发现芯片的安全不安全了，于是你认识了PUF。2、咱们平时经常说的BootRom就是掩模ROM。 本文简单讲讲相关的概念，感性的认识一下就…"
tags:
  - "clippings"
---
[收录于 · SoC知识百宝箱](https://www.zhihu.com/column/c_1892355985563169100)

3 人赞同了该文章

Hi，早！

今天讲讲掩模ROM，为啥讲这个？两个原因：

- 1、昨天写了一篇文章： **[后来你发现芯片的安全不安全了，于是你认识了PUF。](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyOTY5NzkwNg%3D%3D%26mid%3D2247500630%26idx%3D1%26sn%3D1ff28c4c6081d1c35502583528601563%26chksm%3Dfa5f9e4bcd28175d7c365f5ff52afa2af946dbbcac19c8e62ed337cc90411ceb4b604a8e9fb9%26payreadticket%3DHDPs-C5IXqg5IEJvSAXtwfq9Tymm5WwWZKIOXiX-lYXKe7d3a71iQx3HsqBGY2mVBQE-U_M%23rd)**
- 2、咱们平时经常说的 [BootRom](https://zhida.zhihu.com/search?content_id=247342567&content_type=Article&match_order=1&q=BootRom&zhida_source=entity) 就是掩模ROM。

---

> 本文简单讲讲相关的概念，感性的认识一下就行。其次是图片较多，挺好看。如果文字不通顺，烦请脑补。

---

掩模ROM（Masked ROM，或称为编程ROM）是一种特殊的只读存储器（ROM），它在制造过程中就被永久性地编程了数据。这种编程是通过在制造过程中的 [光刻步骤](https://zhida.zhihu.com/search?content_id=247342567&content_type=Article&match_order=1&q=%E5%85%89%E5%88%BB%E6%AD%A5%E9%AA%A4&zhida_source=entity) 中，直接在芯片上创建 [逻辑电路](https://zhida.zhihu.com/search?content_id=247342567&content_type=Article&match_order=1&q=%E9%80%BB%E8%BE%91%E7%94%B5%E8%B7%AF&zhida_source=entity) 的物理掩模来实现的，因此得名“掩模ROM”。这种技术在集成电路的大批量生产中特别有用，因为它能显著降低生产成本。

### 成本与灵活性的妥协

掩模ROM的主要优势在于其低成本。由于数据是在芯片制造时直接嵌入的，所以不需要额外的编程步骤或设备，这大大简化了生产过程并减少了生产成本。然而，这种技术也带来了一些限制。一旦芯片被制造出来，其存储的数据就无法更改，这意味着掩模ROM在程序灵活性上做出了妥协。因此，它们最适合那些不需要更改或升级固件的应用程序，比如 [嵌入式系统](https://zhida.zhihu.com/search?content_id=247342567&content_type=Article&match_order=1&q=%E5%B5%8C%E5%85%A5%E5%BC%8F%E7%B3%BB%E7%BB%9F&zhida_source=entity) 、微控制器、以及大批量生产的消费电子产品等。

### 视频游戏卡带中的应用

在视频游戏领域，掩模ROM也被广泛使用，尤其是在早期的游戏卡带中，如任天堂的NES（Nintendo Entertainment System）游戏卡。这些游戏卡通常包含一块或多块掩模ROM芯片，如你提到的MCM6570（尽管这是一个虚构的型号，用于说明概念，实际产品可能有所不同）。这些芯片直接存储了游戏的数据和程序，游戏主机可以直接读取这些数据，而无需通过复杂的图像处理或解码过程。这种方式简化了游戏数据的访问过程，使得游戏能够更快速地加载和运行。

### 直接读取的优势

掩模ROM芯片直接读取的优势在于其高速性和直接性。由于数据是直接以物理电路的形式存储在芯片上的，因此访问这些数据时不需要任何中间解码或转换步骤。这使得游戏或其他应用程序能够更快地启动和运行，同时也减少了出错的可能性。此外，由于掩模ROM的制造成本较低，这也使得基于掩模ROM的游戏卡带能够以较低的价格提供给消费者。

总之，掩模ROM因其低成本和直接读取的特性，在大批量生产的集成电路和视频游戏卡带中得到了广泛应用。尽管它们在程序灵活性上有所妥协，但在许多不需要频繁更新或修改固件的应用场景中，掩模ROM仍然是一种非常有效的存储解决方案。

现在我们知道了掩模ROM通常用于大批量生产的集成电路，这些电路为了降低成本，可以接受在程序灵活性上的妥协。此外，还生产了独立的掩模ROM，如MCM6570，它们最常见于视频游戏卡带中。 **这些芯片可以直接读取，无需通过图像处理来解码** 。

然而，需要注意的是，由于这些芯片易于读取，因此它们经常与安全处理器配合使用， **以防止简单的复制** （例如，任天堂的CIC系列芯片）。

小型ROM也被用于构建逻辑阵列，如CPU微码等应用。

![](https://pic1.zhimg.com/v2-0c397dd45e5a2ef5d59cc9f441021f66_1440w.jpg)

原图说明：“带有掩模ROM的微控制器。它们通常只有内部工厂标记。” 版权所有2005年Sergei P. Skorobogatov

## 逻辑门

### NOR

![](https://picx.zhimg.com/v2-510debe767c8b1f4a9712c56fe9953ff_1440w.jpg)

上图：NOR结构示例示意图。版权所有2005年Sergei P. Skorobogatov，经授权使用

NOR ROM的工作原理是将位线拉高到VCC。当选择一个字线时，可能存在某种机制将其拉低。因此，它被称为“NOR”，因为输出为1，除非任何位线将输出拉低。

例如，假设WL0为1，其余为0。BL0产生1，因为没有将其短路到地，但在顶部有一个拉高到VCC的元件。同样对于BL2，WL1和WL3晶体管都关闭，允许输出1。然而，BL3输出0，因为WL0和BL3交点的晶体管是导通的，将输出短路到0。

### OR

“也存在一个OR结构，但它与NOR结构的唯一区别在于晶体管连接到VCC而不是VSS”

### NAND

![](https://pica.zhimg.com/v2-ced4964dacb645481f919291b2f42bc2_1440w.jpg)

上图：NAND ROM参考电路图。版权所有2005年Sergei P. Skorobogatov

这些是NOR ROM的逻辑反向版本。它们不是通过某种开关并行地将线路拉低，而是将开关串联起来。通过选择非选定行中的所有开关来激活它们，该区域内开关的有无决定了输出状态是否改变。例如，在上面的图中，输出位线连接有一个上拉晶体管。

假设WL1-3被激活，但WL0没有。BL0将输出0，因为该线路上的所有晶体管（仅在WL2处的那个）都导通，导致BL0被拉低到地。类似地，BL1也输出0，因为WL1和WL3晶体管都导通，导致BL1被拉低。然而，BL3输出1，因为虽然WL3晶体管导通，但WL0晶体管没有导通，所以BL3保持在高电平状态。

## Technology

实现上述开关有几种方法。通常， **这些是通过操纵掩模层来完成的** ，但也存在后制造技术（例如： **[激光ROM](https://link.zhihu.com/?target=https%3A//siliconpr0n.org/wiki/doku.php%3Fid%3Drom%3Alaser)** ）。

![](https://pic1.zhimg.com/v2-975a67356f714b30a7665d2555e9c372_1440w.jpg)

### Active layer-有源层

- **定义** ：有源层是半导体器件中用于产生和控制电流的区域。在MOSFET等场效应晶体管中，有源层通常指的是沟道区域，它位于栅极下方，是电子或空穴在电场作用下流动的主要通道。
- **在芯片后端的作用** ：虽然“有源层”这一术语更多地与前端工艺（如晶体管制造）相关联，但在芯片后端设计中，有源层的布局和连接方式也直接影响着芯片的整体性能。后端设计师需要确保有源层与金属层之间的正确连接，以实现电路功能的正确实现。

综上所述，Implanted、Metal、Contact layer、Active layer等术语在芯片后端设计中各具特色，共同构成了芯片的物理实现基础。通过精确控制这些层的形成和连接方式，可以确保芯片具有优异的性能和可靠性。

![](https://pic3.zhimg.com/v2-5121d7b78569fe154f8b382d73225a54_1440w.jpg)

原图说明：“MOS NOR ROM的配置和布局，采用有源层编程技术。这种存储器可以通过光学方式进行读取。” 版权所有2005年Sergei P. Skorobogatov，经授权使用。

### Contact layer-接触层

![](https://picx.zhimg.com/v2-d0b9c6bd675b9b573457f6ed6b0c1ffd_1440w.jpg)

原图说明：“带有接触层编程的MOS NOR ROM的配置和布局。这种存储器可以通过光学方式读取，但通常需要进行去层处理。”

如果采用现代CMP（化学机械抛光）工艺，则通常需要进行去层处理，但较旧的ROM则可以通过金属层看到接触点。在上面的图像中，形成了许多晶体管，但只有少数几个是实际连接的。连接到位线的晶体管形成了驱动晶体管，如果其中有任何一个导通，就会将输出拉低。

### Metal-金属层

- **定义** ：金属层是芯片内部用于信号传输和电源分配的导电层。这些金属层通常由铝、铜或其他导电材料制成，通过在芯片的不同部分之间布线，实现电路功能。
- **在芯片后端的作用** ：金属层在芯片后端设计中起着至关重要的作用。它们不仅用于传输电信号，将各个功能单元连接起来，实现逻辑运算和数据处理；还负责提供芯片内各个功能单元的电源和接地，确保电路的正常工作。此外，金属层还具有一定的散热和电磁屏蔽功能。
![](https://pic3.zhimg.com/v2-17c2abf2cbf0c8d7b722b0ddaa5bdf7a_1440w.jpg)

原图说明：“带有金属层编程的MOS NAND ROM的配置和布局。这种存储器可以通过光学方式读取。”

光学读取方式很简单。在上面的图像中，到处都形成了晶体管。然而，其中的一些晶体管通过在它们上面放置金属而被永久桥接，始终导通。

从理论上讲，我想象几个晶体管之间的短路接触是不必要的。例如，左边的上面三个接触点。中间的接触点实际上没有做任何事，因为周围的两个晶体管都被旁路了。

### Implanted-离子注入

- **定义** ：离子注入是一种半导体掺杂技术，通过在硅片上注入特定种类的离子（如硼、磷、砷等），来改变硅片的导电性能。这些离子在硅片中占据晶格位置，形成替位式杂质，从而改变硅片的掺杂浓度和类型。
- **在芯片后端的作用** ：在芯片制造过程中，离子注入常用于形成晶体管的源极、漏极区域，以及调整晶体管的阈值电压等。通过精确控制离子注入的剂量和能量，可以实现对晶体管性能的精细调控。
![](https://pic4.zhimg.com/v2-b0e6f02a175bb0d32ca9f340ed8b404b_1440w.jpg)

原图说明：“带有离子注入编程的MOS NOR ROM的配置和布局。这种类型的存储器提供了高水平的安全保护，防止光学读取。”

![](https://pic1.zhimg.com/v2-e77ef3a8be0f7d77fbb9351c1bf863d6_1440w.jpg)

原图说明：“带有离子注入编程的MOS NAND ROM的配置和布局。这种类型的存储器提供了高水平的安全保护，防止光学读取。”

离子注入ROM的工作原理基本上是从一个具有正常工作晶体管网格的掩模开始。然后，其中一些晶体管会经历额外的轰击，以改变其阈值电压。

在上述示例中，阈值电压被提高，使得无论施加什么栅极电压，晶体管都处于关闭状态。这与耗尽型晶体管不同，耗尽型晶体管在正常情况下是导通的，当施加偏置时才会关闭。

## Reading out

由于这些（信息）在显微镜下也难以直接观察， **因此在旧芯片上读取这些信息也可能颇具挑战性。**

### 电子分析-Electronic

尝试通过研究芯片内部的电路结构来发现测试模式、故障等。这种方法已成功应用于如N64 CIC等芯片的“数据提取”。

### 光学分析-Optical

通常，这种掺杂水平的差异在肉眼下是不可见的。然而，我注意到，植入区域的外延层会有凹陷，这些凹陷在斜射光照明下可以观察到。利用这种高度差异，通过斜射光照明、共焦显微镜等技术，可能能够读取植入式掩模ROM的内容。

### 染色法-Staining

这通常是读取此类信息的首选方法。关于使用Dash蚀刻进行染色的详细信息，请参考此页面。虽然其他混合物也可能产生结果，但这种方法是行业内最标准、最常用的。

### 扫描电容显微镜（SCM）

这是一种类似于原子力显微镜（AFM）的技术，通过测量由于掺杂引起的电容变化来工作。据推测，这种方法可能适用于ROM的分析，但目前我们还没有这方面的确凿数据支持。

### 扫描微波阻抗显微镜（SMIM）

关于扫描微波阻抗显微镜的更多信息，请参考： **[链接](https://link.zhihu.com/?target=https%3A//www.chipworks.com/about-chipworks/overview/blog/scanning-microwave-impedance-microscopy-smim)** 。

虽然据推测这种方法可能适用于ROM的分析，但目前我们同样缺乏确凿的数据支持。

### 能量色散X射线光谱（EDS）

我与人讨论过这个问题，他们认为掺杂剂的浓度可能太低，以至于无法被EDS检测到。如果有人能实际进行扫描并验证这一点，那将是非常有价值的。

## Examples

> Nintendo 6102 NOR implant ROM

![](https://pic1.zhimg.com/v2-e40023270cb28eed62195c0caa2b9d6c_1440w.jpg)

Above: top metal

![](https://pic1.zhimg.com/v2-52e89101ded1c72c3d779516aa3fe340_1440w.jpg)

Above: unstained active area

![](https://pic1.zhimg.com/v2-445e3fa32ede8567908b4b15a578c5c2_1440w.jpg)

Above: stained active area

> Motorola MCM6570 metal gate NAND ROM

![](https://pica.zhimg.com/v2-bfd5c1ff1a2a94f5961afabba233cbbc_1440w.jpg)

> TI TMS5200NL metal gate NAND ROM

![](https://picx.zhimg.com/v2-4e6521211aeaa2842372fa9006464067_1440w.jpg)

> Creative Technology CT1741 metal NAND ROM

![](https://pic3.zhimg.com/v2-a076ba6cdc8284190caee125cb4c2246_1440w.jpg)

基于金属的NAND掩模ROM。与上述类似，但采用更小的工艺，并且始终存在触点。

> Motorola MC68010P8 active NOR ROM

![](https://pic3.zhimg.com/v2-df0e76dc334462364140714d2dc76d12_1440w.jpg)

> RSA SecurID 1C vs 2C

![](https://picx.zhimg.com/v2-22bbe31bdc7d3f61f47eff3a6af5817b_1440w.jpg)

Above: earlier 1C die

![](https://pica.zhimg.com/v2-aa2006b8e6b50e5bdb3fd987ad3120be_1440w.jpg)

Above: 后来的2C芯片改用植入式ROM

![](https://pic1.zhimg.com/v2-093eb8b40097e7fb2414af694025431e_1440w.jpg)

上图：使用Dash蚀刻法对2C进行染色以显示位（bit）

> CBM 65CE02 active NOR ROM

![](https://pic3.zhimg.com/v2-f945f66d94d0eb4d05452086d941b314_1440w.jpg)

非常罕见的对角图案

> Bandai Tamagotchi metal NOR ROM

![](https://pic2.zhimg.com/v2-c5078146289956a5f6bd222ced4fc4c3_1440w.jpg)

> HK HK628 active metal gate NAND ROM

![](https://picx.zhimg.com/v2-fd032177e6da267c7d975ee93e3df283_1440w.jpg)

> Intel 80486DX

![](https://pic4.zhimg.com/v2-3c426a007f872423bcea1a30e54c80df_1440w.jpg)

## 解码

我创建了SiliconAnalysis GitHub组，旨在将各种杂项工具整合到一个推荐的工具链中。从高层次来看，流程大致如下：

1. **生成空间等效的1和0的二维数组** ：使用某个工具生成一个空间上与原始数据等效的、由1和0组成的二维数组。
2. **单独使用rompar** ：rompar是一个工具，可以用于解码或分析ROM数据。在这一步中，我们将rompar作为单独的解码工具来使用。
3. **使用djangoMonkeys进行众包** ：djangoMonkeys是一个平台，可以用于众包数据处理和分析任务。在这一步中，我们将利用djangoMonkeys来收集和处理来自多个用户的解码结果或数据输入。
4. **生成CV训练数据** ：上述两个工具（rompar和djangoMonkeys）都可以生成用于计算机视觉（CV）训练的数据。这些数据可以用于训练机器学习模型，以提高解码的准确性或自动化程度。
5. **输入到zorrom库进行解码为二进制** ：将处理后的数据输入到zorrom库中，zorrom是一个专门用于解码ROM数据的库，它能够将输入的数据解码成二进制形式。
6. **了解如何排序位** ：在解码过程中，了解如何正确地排序位是非常重要的。因为ROM数据中的位可能不是按照线性的顺序排列的，而是根据特定的布局或模式进行排列。zorrom库或相关的解码工具需要知道这种排列模式，以便能够准确地恢复出原始的数据或指令。

## References

- “Semi-invasive attacks - A new approach to hardware security analysis.” Sergei P. Skorobogatov.
- “Image decode Project”: [progettoemma.net/dump/](https://link.zhihu.com/?target=http%3A//www.progettoemma.net/dump/)

发布于 2024-08-25 22:28・四川[【页漫已死，条漫当立】掌阅Tango2评测：Carta1300＋手机比例，看字同样没问题](https://zhuanlan.zhihu.com/p/1979520897976141687)

[

页漫真的落伍了？条漫时代的掌阅Tango2：Carta1300＋轻薄手机比例，看动画同样舒服！大家好，我是知乎电纸书阅读器评测博...

](https://zhuanlan.zhihu.com/p/1979520897976141687)