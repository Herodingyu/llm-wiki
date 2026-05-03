---
title: "AI系统-22AI芯片存储介绍"
source: "https://zhuanlan.zhihu.com/p/2021603589714445979"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "AI运算需要大量的数据要处理，而是超级大的模型算法也需要进行存储，对整个系统存储提出来了更高的要求，具体就是：更大，更快，更小，更省电等，既要还要。 AI系统的存储分为两部分：SoC内部和SoC外部存储芯片 So…"
tags:
  - "clippings"
---
[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810)

![](https://pic2.zhimg.com/v2-37f16d2eb6926798181b0128694c7123_1440w.jpg)

AI运算需要大量的数据要处理，而是超级大的模型算法也需要进行存储，对整个系统存储提出来了更高的要求，具体就是：更大，更快，更小，更省电等，既要还要。

AI系统的存储分为两部分： [SoC](https://zhida.zhihu.com/search?content_id=272190736&content_type=Article&match_order=1&q=SoC&zhida_source=entity) 内部和SoC外部存储芯片

1. SoC **芯片内部** 的存储主要就是 [SRAM](https://zhida.zhihu.com/search?content_id=272190736&content_type=Article&match_order=1&q=SRAM&zhida_source=entity) 和为了安全存储密钥等的efuse。
2. 只有SoC内部存储远远不够， **外部存储** 主要就是动态存储的 **[DDR](https://zhida.zhihu.com/search?content_id=272190736&content_type=Article&match_order=1&q=DDR&zhida_source=entity)** 和静态存储的 **Flash** 和 **[UFS](https://zhida.zhihu.com/search?content_id=272190736&content_type=Article&match_order=1&q=UFS&zhida_source=entity)** 等，还有ROM的 **[EEPROM](https://zhida.zhihu.com/search?content_id=272190736&content_type=Article&match_order=1&q=EEPROM&zhida_source=entity)** 等，SoC内部需要集成相关控制器就可以。

本篇文章详细介绍各种存储及优缺点，在AI运算中发挥的作用等。

## 1\. 存储基础知识

![](https://pica.zhimg.com/v2-0ffca879d54aba255e464dc7da042f64_1440w.jpg)

## 1.1 DDR和LPDDR及HBM

![](https://pic3.zhimg.com/v2-586822b844f9dce50e54456556904a6c_1440w.jpg)

**DDR 全称 Double Data Rate** （双倍速率同步动态随机存储器），严格的来讲，DDR 应该叫 **DDR SDRAM** ，它是一种 **易失性存储器** 。虽然JEDEC于2018年宣布正式发布DDR5标准，但实际上最终的规范到2020年才完成，其目标是将内存带宽在DDR4基础上翻倍，速率3200MT/s起，最高可达 **6400MT** /s，电压则从1.2V降至1.1V，功耗减少30%。

**LPDDR** 是在DDR的基础上多了 **LP(Low Power)** 前缀，全称是Low Power Double Data Rate SDRAM，简称“ **低功耗内存** ”，是DDR的一种，以 **低功耗和小体积** 著称。而 LPDDR 拥有比同代 DDR 内存更低的功耗和更小的体积，该类型芯片主要应用于移动式电子产品等低功耗设备上。

DDR和LPDDR对比：

| 名称 | 特点 | 应用领域 |
| --- | --- | --- |
| DDR | 1\. 高传输速率 2. 相对较高的功耗 | 1\. 个人电脑2. 服务器 3. 工作站 |
| LPDDR | 1\. 低功耗 2. 高传输速率 | 1\. 智能手机2. 平板电脑 3. 笔记本电脑 |

**LPDDR DRAM** 提供了一种功耗显著降低的高性能解决方案，而降低功耗是平板电脑、智能手机和汽车等移动应用的重点要求。此类应用所需的 SoC 倾向于在每个通道上使用更少的存储设备和更短的互连，而 LPDDR DRAM 的运行速度比标准 DDR DRAM 快（例如，LPDDR4/4X DRAM 的运行速度最高为 4267 Mbps，而标准 DDR4 DRAM 的运行速度最高为 3200 Mbps），所以能够提供更高的性能。但 LPDDR DRAM 在此类设备中不使用，处于待机状态时，可以将它们置于 **低功耗状态** ，例如深度睡眠状态，或者可以使用动态频率调节 (DFS) 功能在较低频率下运行。因此，当存储通道待机时，存储控制器可以适时地使用这些低功耗功能来降低总功耗。

LPDDR5 DRAM 使用 **动态电压调节 (DVS)** 功能节省更多功耗，此时存储器控制器可以在通道待机期间降低 DRAM 的频率和电压。与普通的标准 DDR DRAM 通道（64 位宽）相比，LPDDR DRAM 通道通常为 16 位或 32 位宽。与其他两个类别的 DRAM 世代一样，后继的每一个 LPDDR 世代（LPDDR5、LPDDR4/4X、LPDDR3、LPDDR2、LPDDR）都比其上一代产品具有更高的性能和更低的功耗。此外，任何两代 LPDDR 都不彼此兼容。

DDR 分为三个主要类别，每个类别都有独特的功能，可帮助设计人员满足其目标片上系统 (SoC) 的功耗、性能和面积要求。下图显示了不同的 DDR 类别及其目标应用场景。

![](https://pic3.zhimg.com/v2-8a4e01510ee030c7459638caae1bd344_1440w.jpg)

- 标准 DDR 面向 **服务器、云计算、网络、笔记本电脑、台式机和消费类应用** ，支持更宽的通道宽度、更高的密度和不同的形状尺寸。DDR4 是这一类别目前最常用的标准，支持高达 3200 Mbps 的数据速率。DDR5 DRAM 的运行速度高达 6400 Mbps，预计将在 2020 年问世。
- 移动 DDR (LPDDR) 适用于对面积和功耗非常敏感的 **移动和汽车应用** 。LPDDR 提供更窄的通道宽度和几种低功耗工作状态。LPDDR4 和 LPDDR4X 支持高达 4267 Mbps 的数据速率，是该类别中的常用标准。最大数据速率为 6400 Mbps 的 LPDDR5 DRAM 预计将于 2020 年问世。
- 图形 DDR (GDDR) 面向需要 **极高吞吐量的数据密集型应用程序** ，例如图形相关应用程序、数据中心加速和 AI。GDDR 和高带宽存储器 (HBM) 是这一类型的标准。

**HBM（High Bandwidth Memory** ，高带宽内存）是一款新型的CPU/GPU 内 存芯片，其实就是将很多个DDR芯片 **堆叠** 在一起后和GPU封装在一起，实现 大容量，高位宽的DDR组合阵列。

![](https://pica.zhimg.com/v2-cb49d912e882bc4e7c2107358faefdf4_1440w.jpg)

高速、高带宽HBM堆栈没有以外部互连线的方式与信号处理器芯片连接，而是通过 **中间介质层紧凑而快速地连接** ，同时HBM内部的不同DRAM采用TSV 实现信号纵向连接，HBM具备的特性几乎与片内集成的RAM存储器一样。

HBM注意在 **服务器上** 用的，带宽更高。GDDR5内存每通道位宽32bit，16通道总共512bit; 目前主流的第二代HBM2每个堆栈可以堆至多8层DRAM die，在容量和速度 方面有了提升。HBM2的每个堆栈支持最多1024个数据pin，每pin的传输速率可以达到2000Mbit/s，那么总带宽是256Gbyte/s; 在2400Mbit/s的每pin传输速率之下，一个HBM2堆栈封装的带宽为307Gbyte/s。

![](https://pic1.zhimg.com/v2-23eb849b3505dfed3882cf384daae942_1440w.jpg)

## 1.2 NAND FLASH和Nor FLASH

![](https://pic1.zhimg.com/v2-2db9b15ac8863eb7f7b7555afb7b124c_1440w.jpg)

- **NAND型闪存** 是一种非易失性存储器，适用于大容量数据存储。NAND Flash通过 **串行访问** 模式进行读写操作，具有较快的写入速度和更高的密度。
- **NOR型闪存** 是另一种非易失性存储器，主要用于存储代码和配置数据。与NAND型闪存相比，NOR Flash采用 **并行访问** 模式，具有较快的读取速度，但写入速度较慢，存储密度较低。

| 名称 | 特点 | 应用领域 |
| --- | --- | --- |
| NAND Flash | 1\. 较高的存储密度 2. 快速写入速度 3. 适用于大容量数据存储 | 1\. 固态硬盘（SSD）2. USB闪存驱动器 3. SD卡 |
| [Nor Flash](https://zhida.zhihu.com/search?content_id=272190736&content_type=Article&match_order=1&q=Nor+Flash&zhida_source=entity) | 1\. 快速读取速度 2. 适用于代码和配置数据存储 3. 相对较低的存储密度 | 1\. 嵌入式系统2. BIOS/UEFI固件 3. 汽车电子 |

![](https://pic2.zhimg.com/v2-19b7715efd425a5b3824deb753936e2f_1440w.jpg)

### 1.2.1 NAND Flash

**NAND Flash** 存储器具有容量较大，改写速度快等优点，适用于大量数据的存储，因而在业界得到了越来越广泛的应用，如闪存盘、固态硬盘、 [eMMC](https://zhida.zhihu.com/search?content_id=272190736&content_type=Article&match_order=1&q=eMMC&zhida_source=entity) 、UFS 等。

**NOR flash** 数据线和地址线分开，可以实现ram一样的随机寻址功能，可以读取任何一个字节。但是擦除仍要按块来擦。

根据其不同的工艺技术，NAND 已经从最早的 SLC 一路发展到如今的 MLC、TLC、QLC 和 PLC。

![](https://pic3.zhimg.com/v2-9d20d65e14971ce869715d2334173988_1440w.jpg)

- 按速度价格比排序：SLC>MLC>TLC>QLC>PLC
- 按容量大小排序：PLC>QLC>TLC>MLC>SLC

### 1.2.2 Nor Flash

特点:

1. 读取速度快，适合代码执行（如 **固件和BIOS** ）。
2. 擦除速度相对较慢，擦除操作以块为单位进行。
3. 擦除单元较大（通常为128KB或更大）。

应用: NOR Flash以其高可靠性和 **直接执行代码** 的能力而著称，允许应用程序直接在flash闪存中运行。常用于需要快速读取的场景，如嵌入式系统的固件存储。

对比：

- **速度** ：由于NAND flash数据线引脚和地址线引脚复用，因此读取速度比NOR flash慢，但是擦除和写入 速度比NOR flash快很多。
- **容量** ：NAND flash数据密度大，体积小，成本也低。因此大容量的flash都是nand型的。小容量的2～12M的flash多是nor型的。
- **使用寿命** ：nand flash的擦除次数是nor的数倍。而且nand flash可以标记坏块，从而使软件跳过坏块。nor flash 一旦损坏便无法再用。NOR Flash：由于其较低的存储密度和按字节擦除的特性，NOR Flash具有更长的寿命和更高的耐久性。它可以承受更多的擦写操作，因此适用于对寿命要求较高的应用场景。NAND Flash：相对而言，NAND Flash的寿命较短且较容易损坏。由于采用了块擦除的方式，并且每个存储块只能擦写有限次数，所以随着时间的推移和频繁的擦写操作，NAND Flash的寿命会逐渐减少。为了增加寿命，NAND Flash通常使用了一些技术来平衡数据分布并将擦写操作尽量均匀地分散在整体存储芯片上。
- **应用** ：NAND Flash以其高速的写入和擦除速度、大容量和高成本效益在大数据存储领域占据主导地位，如 **U盘、MP3播放器和固态硬盘** 等‌。而NOR Flash则以其快速的读取速度和直接执行代码的能力在嵌入式系统和特定应用中发挥重要作用‌，如存储固件和引导程序。另外，NOR Flash的读取和我们常见的SDRAM的读取是一样，用户可以直接运行装载在NOR FLASH里面的代码，这样可以减少SRAM的容量从而节约了成本。NAND Flash没有采取内存的随机读取技术，它的读取是以一次读取一快的形式来进行的，通常是一次读取512个字节，采用这种技术的Flash比较廉价。用户不能直接运行NAND Flash上的代码，因此好多使用NAND Flash的开发板除了使用NAND Flah以外，还作上了一块小的NOR Flash来运行启动代码。
- **可靠性和错误纠正** ：NOR Flash：NOR Flash具有较好的可靠性和错误纠正能力。由于其并行结构，当某个存储单元出现错误时，可以通过冗余电路进行错误校验和修正。这使得数据的读取和写入过程更加可靠，并提供了更高的数据完整性。NAND Flash：与之相比，NAND Flash的可靠性较低。由于存储密度较高，当某个存储单元出现错误时，可能会导致整个块的数据损坏。为了解决这个问题，NAND Flash通常使用了一些纠错码（ **ECC** ）算法来检测和纠正错误。这些算法可以检测和修复在数据传输过程中发生的错误，提高了存储数据的可靠性。
- **价格** ：‌NOR Flash的价格相对较高，而NAND Flash的价格相对较低。NOR Flash:由于其内部复杂的结构和较低的存储密度, 导致其成本相对较高。

参考：

1. [blog.csdn.net/weixin\_37](https://link.zhihu.com/?target=https%3A//blog.csdn.net/weixin_37414365/article/details/121157753)
2. [blog.csdn.net/zhh174962](https://link.zhihu.com/?target=https%3A//blog.csdn.net/zhh1749621866/article/details/142318142)

## 1.3 总线Flash和SPI flash

外置flash按接口分有 **总线flash，SPI flash** 。总线flash需要MCU上有外部总线接口，SPI flash就是通过SPI口对flash进行读写。速度上，总线flash比SPI的快，但是SPI的便宜。

**总线Flash和SPI flash区别** ：

- **接口类型** ：总线FLASH需要通过外部总线接口进行连接，而SPI FLASH则是通过SPI口进行读写操作。速度与成本‌：总线FLASH的速度通常比SPI FLASH快，但SPI FLASH的成本较低。这是因为 **SPI FLASH使用串行- - 传输方式，每次传输的数据量较小，而总线FLASH支持并行传输，可以同时传输多个数据位，从而提高了数据传输速度‌** 。
- **应用场景** ：由于总线FLASH的速度较快，它更适合对性能要求较高的应用，如高性能计算、图像处理等。而SPI FLASH由于其低成本和简单的接口，更适合用于对成本敏感的应用，如物联网设备、嵌入式系统等‌。

速度比较快的SPI就是 **[QSPI](https://zhida.zhihu.com/search?content_id=272190736&content_type=Article&match_order=1&q=QSPI&zhida_source=entity)** ：

![](https://pic4.zhimg.com/v2-3fd07875f2e05d2d6437630d20a79527_1440w.jpg)

QSPI是 **Queued SPI** 的简写，是Motorola公司推出的SPI接口的扩展，比SPI应用更加广泛。在SPI协议的基础上，Motorola公司对其功能进行了增强，增加了队列传输机制， 推出了队列串行外围接口协议（即QSPI协议）。QSPI 是一种专用的通信接口，连接单、双或四（条数据线）SPIFlash 存储介质。

该接口可以在以下三种模式下工作：

1. **间接模式** ：使用 QSPI 寄存器执行全部操作，即通过读取QUADSPI\_DR寄存器的内容完成接受数据， 将写入到QUADSPI\_DR寄存器的内容发送给外部SPI设备。
2. **状态轮询模式** ：周期性读取外部 Flash 状态寄存器，而且标志位置 1 时会产生中断（如擦除或烧写完成，会产生中断）
3. **内存映射模式** ：外部 Flash 映射到微控制器地址空间，从而系统将其视作内部存储器

采用双闪存模式时，将同时访问两个 Quad-SPI Flash，吞吐量和容量均可提高二倍。

参考： [doc.embedfire.com/linux](https://link.zhihu.com/?target=https%3A//doc.embedfire.com/linux/stm32mp1/hal/zh/latest/doc/chapter22/chapter22.html%23qspi)

## 1.3 eMMC和UFS

![](https://pic2.zhimg.com/v2-d4b21f1db8a8849dce03f50a801cc5cb_1440w.jpg)

**eMMC ( Embedded Multi Media Card)** 采用统一的MMC标准接口， 把高密度 NAND Flash 以及 MMC Controller 封装在一颗 BGA 芯片中。针对 Flash 的特性，产品内部已经包含了 Flash 管理技术，包括错误探测和纠正，flash 平均擦写，坏块管理，掉电保护等技术。用户无需担心产品内部 flash 晶圆制程和工艺的变化。同时 eMMC 单颗芯片为主板内部节省更多的空间。简单地说，eMMC=Nand Flash+控制器+标准封装

eMMC具有以下 **优势** ：

1. 简化类手机产品存储器的设计。
2. 更新速度快。
3. 加速产品研发效率。
![](https://picx.zhimg.com/v2-65fbab67ab4907acb36eda4926f00221_1440w.jpg)

UFS：全称 **Universal Flash Storage** ，我们可以将它视为eMMC的 **进阶版** ，同样是由多个闪存芯片、主控组成的阵列式存储模块。

UFS 弥补了 eMMC 仅支持半双工运行（读写必须分开执行）的缺陷，可以实现全双工运行，所以性能得到翻番。

**uMCP** 是结合了 UFS 和 LPDDR 封装而成的智慧型手机记忆体标准，与 eMCP 相比，国产的 uMCP 在性能上更为突出，提供了更高的性能和功率节省。

## 1.4 EEPROM

![](https://pic2.zhimg.com/v2-c93ad36f3334321231221ee64df235e1_1440w.jpg)

介绍下只读存储器，这里的只读知识程序不可以写。使用特殊的设备是可以写的。

- ROM是只读的，永远不可以写。
- **PROM** （可编程只读存储器），只可编程一次
- **EPROM** （可擦除可编程只读存储器）可以多次编程写，但是需要紫外线擦除
- **EEPROM** （电可擦除可编程只读存储器）在电路上加脉冲就可以擦除，数据可以保存100年，擦除100万次。但是大小一般在512KB以下。

为了加大大小，然后就出来了FLSAH，这就是可写的了。

![](https://pic3.zhimg.com/v2-e4c3e655137188abdec85caeb8a0c6b0_1440w.jpg)

## 1.5 其他

> SRAM和DRAM的区别？

1. **SRAM（Static Random-Access Memory，静态随机存取存储器）：不需要定期刷新，掉电还能保存数据。**
2. **DRAM（Dynamic Random Access Memory，动态随机存取存储器）：需要定期刷新，掉电数据丢失。**

**访问速度：SRAM比DRAM快。**  
  
**功耗：静态SRAM功耗高，动态DRAM功耗高**  
  
**成本：SRAM贵，一般用做cache，存储一位需要6个MOS管。DRAM便宜存储一位需要一个电容，判断电容电荷**  
  
**容量：DRAM容量比SRAM大的多，单元密度高，面积小，在芯片中大量应用。SRAM抛开价格面积大，不能大量使用。**  
  
**S**

存储器是用于移动设备、IoT、汽车和云数据中心等应用中的任何电子系统的重要组件。 **SoC 设计人员必须选择合适的存储器技术，才能提供必要的性能、容量、功率和面积** 。DDR 已成为现实的存储技术，可用于多种类别，包括标准 DDR 和低功耗 DDR (LPDDR)。最新的标准 LPDDR5 和 DDR5 以更低的功耗提供更高的性能。LPDDR5 的运行速度高达 6400 Mbps，具有许多低功耗和 RAS 功能，包括新颖的时钟架构、可简化时序收敛。数据速率高达 6400 Mbps 的 DDR5 DRAM 支持更高的密度，包括双通道 DIMM 拓扑以提高通道效率和性能。

SRAM在芯片内部，直接连到NoC上

![](https://pic2.zhimg.com/v2-a22d76230455c3982e4fdcf127ae3fc5_1440w.jpg)

在汽车中的应用：

1. 汽车属于移动设备，电池供电要省电需要用 **LPDDR**
2. SoC中需要固件加载用Nor FLASH，但是用户数据存储还是要用 **NAND FLASH**
3. 选择更先进的 **UFS** =NAND FLASH +控制器

参考：

1. [blog.csdn.net/yingtexin](https://link.zhihu.com/?target=https%3A//blog.csdn.net/yingtexin/article/details/131010628%3Fspm%3D1001.2101.3001.6650.5%26utm_medium%3Ddistribute.pc_relevant.none-task-blog-2~default~BlogCommendFromBaidu~Ctr-5-131010628-blog-134449778.235) ^v43^pc\_blog\_bottom\_relevance\_base3&depth\_1-utm\_source=distribute.pc\_relevant.none-task-blog-2~default~BlogCommendFromBaidu~Ctr-5-131010628-blog-134449778.235^v43^pc\_blog\_bottom\_relevance\_base3&utm\_relevant\_index=10
2. [blog.csdn.net/qq\_280874](https://link.zhihu.com/?target=https%3A//blog.csdn.net/qq_28087491/article/details/134449778)
3. [blog.csdn.net/weixin\_45](https://link.zhihu.com/?target=https%3A//blog.csdn.net/weixin_45365488/article/details/134185155)

## 2\. LPDDR5

![](https://picx.zhimg.com/v2-ce69ccecf67b527daaf2cbd9851fc7af_1440w.jpg)

**LPDDR5** 控制器使用简单的 **本地接口接受命令** ，并将其转换为 LPDDR5 设备所需的命令序列。该核心还能够执行所有初始化、刷新和断电功能。

核心使用存储体管理逻辑监控每个 LPDDR 存储体的状态。存储体仅在必要时打开或关闭，以最小化存取延迟。

核心会在命令队列中将多个 **命令排队** 。这将允许到高度随机的地址位置的短传输以及到连续地址空间的更长传输实现最优带宽利用率。命令队列还用于适时地执行前视激活、预充电和自动预充电，进一步提高总体吞吐量。

参考： [rambus.com/](https://link.zhihu.com/?target=https%3A//www.rambus.com/) 接口-ip/lpddr/?lang=zh-hans

## 2.1 DDR控制器基础

![](https://pic2.zhimg.com/v2-75de91cf819f5b9fe761d88d7ceb139d_1440w.jpg)

DDR SDRAM子系统包含 **DDR controller、DDR PHY和DRAM存储颗粒** 三部分。我们分别看一下各部分的组成，然后讲述一下数据的读写过程。

### 2.1.1 DDR controller

内存控制器负责 **初始化DRAM** ，并重排读写命令，以获得最大的DRAM带宽。它通过多端口与其他用户核进行连接，这些端口的类型包含AXI4/AXI3/AHB/CHI。每个端口有可配置的宽度、命令和数据FIFO。

内存控制器接收来自于一个或者多个 **CPU、DSP、GPU的请求** ，这些请求使用的地址是逻辑地址，由仲裁器来决定这些请求的优先级，并将其放入内存控制器中。如果一个请求处于高优先级(赢得仲裁)，会被映射到一个DRAM的物理地址并被转换为一个DRAM命令序列。这些命令序列被放置在内存控制器中的队列池(Queue pool)中，内存控制器会执行队列池中这些被挂起的命令，并将逻辑地址转化为物理地址，并由状态机输出符合DRAM访问协议的电信号，经由PHY驱动DRAM的物理IO口。

- Arbitration CMD priority： **仲裁器** ，仲裁CMD的优先级。会对来自各端口的请求进行仲裁，并将请求发送给控制器，仲裁其从端口收到的每个事务，每个事务都有一个相对应的优先级。端口仲裁逻辑会根据优先级进行处理，从而确定如何向控制器发出请求。以Cadence Denali内存控制器为例，它有几种仲裁策略：
- Round Robin：每个端口对应一个独立的 **计数器** ，当端口上有请求被接受的时候，计数器就会增加，然后仲裁器会针对计数器非0的端口的请求进行轮流仲裁，每仲裁执行一次，相应端口的计数器减一，直到端口接受请求计数器变为0。
- **带宽分配/优先级轮流操作** ：结合轮流操作、优先级、带宽和端口带宽保持等，根据用户分配的命令优先级，将传入的命令按优先级分组。在每个优先级组内，仲裁器评估请求的端口、命令队列和请求的优先级，从而确定优先级。当控制器繁忙时，超过其带宽分配的端口，可能会接受较低的优先级服务。
- **加权优先级循环** ：是一种面向服务质量的算法，结合了循环操作、优先级、相对优先级、端口排序的功能。根据命令的优先级或该类型命令的相关端口的优先级，将传入的命令分成优先级组。具有较高权重的端口可能会更频繁的接受仲裁，从而更容易被运行到。
- **DDR SDRAM Control：DDR SDRAM的控制** 。包含了一个命令队列，接受来自仲裁器的命令。该命令队列使用一个重排算法来决定命令的放置顺序。重排逻辑遵循一些规则，通过考虑地址碰撞、源碰撞、数据碰撞、命令类型和优先级，来确定命令插入到命令队列的位置。重排逻辑还通过命令分组和bank分割，来提高控制器的效率。当命令进入命令队列后，选择逻辑扫描命令队列中的命令进行运行。若较高优先级的命令还没有准备好运行，较低优先级的命令不与命令队列中排在前面的命令冲突，那么这个较低优先级的命令，可以先于该没准备好的高优先级命令运行。此外，控制器还包含一个仲裁块，支持软件可编程接口、外部引脚及计数器的低功耗控制。另外，控制器支持调频功能，用户可以通过操作寄存器组，调整ddr的工作频率。
- **Transaction Processing** ：事务处理用于处理命令队列中的命令。该逻辑会重排命令，使DRAM的读写带宽吞吐最大化。

### 2.1.2 DDR PHY

DDR PHY是连接 **DDR颗粒和DDR Controller的桥梁** ，它负责把DDR Controller发过来的数据转换成符合DDR协议的信号，并发送到DDR颗粒。相反地，它也负责把DRAM发送过来的数据转换成符合DFI（DDR PHY Interface）协议的信号并发送给内存控制器。DDR PHY和内存控制器统称为DDR IP，他们保证了SoC和DRAM之间的数据传输。

目前在DDR IP的市场上，国际厂商占据较高的市场份额，而国内IP企业占比很小，究其原因，主要是由于 **DDR PHY具有较高的技术门槛** ，要在这类PHY上实现突破并不容易。DDR PHY是一个系统工程，在如下方面需要着重关注：

- 1\. DDR PHY的数据传输采用 **并行多位、单端突发** 的传输模式，对电源完整性PI（Power Integrity，电源完整性）和信号完整性SI （Signal Integrity，信号完整性）的要求很高。  
	2\. 为了能够补偿不确定的延时，针对不同信号，DDR PHY有个灵活配置的延时电路及对应的辅助逻辑，这些延时电路可能会随着电压及温度变化而变化。因此PHY针对这些电路要有校准（Training），可以说DDR PHY是对Training要求最多的接口。

### 2.1.3 DDR DRAM颗粒

从DDR PHY到内存颗粒的层次关系如下： **channel->DIMM->rank->chip->bank->row/column组成的memory array** 。例如，i7 CPU 支持两个Channel（双通道），每个Channel上可以插2个DIMM（dual inline memory module，双列直插式存储模块），每个DIMM由2个rank构成，8个chip组成一个rank。由于现在多数芯片的位宽是8bit，而CPU的位宽是64bit，因此经常是8个芯片可以组成一个rank。

- **Channel** ：简单理解一个通道对应一个DDR控制器，每个通道拥有一组地址线、控制线和数据线。
- **DIMM** ：是主板上的一个内存插槽，一个channel可以包含多个DIMM。
- **Rank** ：一组可以被一个内存通道同时访问的芯片组合称作一个rank，一个rank中的每个芯片都共用内存通道提供的地址线、控制线和数据线，同时每个芯片都提供一组输出线，这些输出线组合起来就是内存条的输出线。简单来说rank是一组内存芯片集合，当芯片位宽芯片数=64bit（内存总位宽）时，这些芯片组成一个Rank，存储64bit的数据。一般每个芯片位宽是8bit，然后内存条每面8个芯片，那么每面就构成了一个Rank，这两面的Rank通过一根地址线来区分当前要访问的是哪一面。同一个Rank中所有的芯片协作来读取一个地址（1个Rank，8个芯片8bit=64bit），这个地址的不同bit，每8个一组分散在这个Rank上的不同芯片上。设计Rank的原因是为了减少每个芯片的位宽（在CPU总位宽确定的前提下，比如64bit），降低复杂度。
- **Chip** ：是内存条上的一个芯片，由多个bank组成，大多数是4bit/8bit/16bit，多个chip做成一个rank，配合完成一次访问的位宽。
- **Bank** ：是一个逻辑上的概念。一个bank可以分散到多个chip上，一个chip也可以包含多个bank。
- **Row、Column组成的memory array** ：可以简单的理解bank为一个二维bit类型的数组。每个bank对应一个bit，8个bank组成8bit的数据。

参考： [eet-china.com/mp/a20334](https://link.zhihu.com/?target=https%3A//www.eet-china.com/mp/a203340.html)

## 2.2 Rambus方案

![](https://pic1.zhimg.com/v2-78d25b9e792d2d905877b40503049b0c_1440w.jpg)

Rambus LPDDR5T/5X/5控制器核心设计用于需要低功耗高内存吞吐量的应用程序，包括移动设备、物联网（IoT）、汽车、笔记本电脑和边缘网络设备。

- **Rambus LPDDR5T/5X/5控制器核心** 是为用于需要高内存吞吐量和低延迟的应用程序而设计的。核心使用一个简单的本地接口接受命令，并将它们转换为LPDDR5T/5X/5设备所需的命令序列。
- 核心还执行所有初始化、刷新和降电功能。核心使用银行管理逻辑来监控每个LPDDR银行的状态。银行只在必要时开放或关闭，以最大限度地减少接入延迟。
- 核心在命令队列中 **排队排列多个命令** 。这使得到高度随机地址位置的短传输以及到连续地址空间的长传输能够实现最佳的带宽利用率。命令队列还用于机会性地执行展望激活、预充电和自动预充，进一步提高总体吞吐量。
- **附加核心，如AXI核心总线接口、多端口前端和在线ECC核心** ，可以选择与核心一起交付。该核心可以与目标LPDDR5T/5X/5 PHY进行完全集成和验证。
![](https://pic3.zhimg.com/v2-720a198efe2f21f51da42be6c1932246_1440w.jpg)

参考： [rambus.com/](https://link.zhihu.com/?target=https%3A//www.rambus.com/) 接口-ip/lpddr/?lang=zh-hans

## 2.3 synopsys方案

![](https://pica.zhimg.com/v2-334a1ca5eeea9d9540f8c818a8616abc_1440w.jpg)

**LPDDR DRAM 提供了一种功耗显著降低的高性能解决方案** ，而降低功耗是平板电脑、智能手机和汽车等移动应用的重点要求。此类应用所需的 SoC 倾向于在每个通道上使用更少的存储设备和更短的互连，而 LPDDR DRAM 的运行速度比标准 DDR DRAM 快（例如，LPDDR4/4X DRAM 的运行速度最高为 4267 Mbps，而标准 DDR4 DRAM 的运行速度最高为 3200 Mbps），所以能够提供更高的性能。但 LPDDR DRAM 在此类设备中不使用，处于待机状态时，可以将它们置于低功耗状态，例如深度睡眠状态，或者可以使用动态频率调节 (DFS) 功能在较低频率下运行。因此，当存储通道待机时，存储控制器可以适时地使用这些低功耗功能来降低总功耗。

LPDDR5 DRAM 使用 **动态电压调节 (DVS) 功能节省更多功耗** ，此时存储器控制器可以在通道待机期间降低 DRAM 的频率和电压。与普通的标准 DDR DRAM 通道（64 位宽）相比，LPDDR DRAM 通道通常为 16 位或 32 位宽。与其他两个类别的 DRAM 世代一样，后继的每一个 LPDDR 世代（LPDDR5、LPDDR4/4X、LPDDR3、LPDDR2、LPDDR）都比其上一代产品具有更高的性能和更低的功耗。此外，任何两代 LPDDR 都不彼此兼容。

## 2.3.1 DDR控制器IP

Synopsys DDR5/4 控制器是针对 **延迟、带宽和面积优化的新一代内存控制器，** 支持 JEDEC 标准 DDR5 和 DDR4 SDRAM 和 DIMMS。高度可配置的控制器满足或超出了从数据中心到消费者的广泛应用的设计要求。Synopsys DDR5/4 控制器通过 DFI 5.0 接口连接到 Synopsys DDR5/4 PHY 或其他 PHY，以创建完整的内存接口解决方案。控制器包括软件配置寄存器，可通过 AMBA 3.0 APB 接口访问。

DDR 控制器模块包括 **高级命令调度程序、内存协议处理器、可选 ECC（纠错码）和双通道支持，以及到 PHY 的 DFI 接口** 。

Synopsys DDR 控制器无缝集成了 **Synopsys内联内存加密 (IME)安全模** 块，以确保正在使用或存储在片外内存中的数据的机密性。Synopsys 安全 DDR 控制器 IP 支持数据机密性，为读/写通道提供符合标准的独立加密支持，每个区域加密/解密，并针对面积、性能和延迟进行了高度优化。Synopsys 安全内存控制器的加密/解密延迟开销低至 2 个时钟周期。

- 支持 JEDEC 标准 DDR5 和 DDR4 SDRAM 和 DIMM
- 具有托管 QoS 的多端口 Arm® AMBA® 接口 (4 AXI™/3 AXI™) 或用于 DDR 控制器的单端口主机接口
- 符合 DFI 5.0 标准的接口，可连接至 Synopsys DDR5/4 PHY 或其他 DDR5/4 PHY
- 具有基于 QoS 的调度和相位感知调度等独特功能，具有一流的性能
- 高带宽设计，读取时最多有 64 个 CAM 条目，写入时最多有 64 个 CAM 条目；延迟低至 8 个时钟周期
- UVM 测试平台具有嵌入式断言和选项，可将 DDR5/4 PHY 纳入验证环境
- 安全控制器：集成 IME 安全模块，确保数据保密性

## 2.3.1 LPDDR5 PHY

**Synopsys LPDDR5/4/4X PHY** 是 Synopsys 的物理 (PHY) 层 IP 接口解决方案，适用于需要高性能 LPDDR5X、LPDDR5、LPDDR4 和 LPDDR4X SDRAM 接口（运行速度高达 6400 Mbps）的 ASIC、ASSP、片上系统 (SoC) 和系统级封装应用。凭借灵活的配置选项，LPDDR5/4/4X PHY 可用于支持 LPDDR5X、LPDDR5 和/或 LPDDR4/4X SDRAM 的各种移动应用，精确满足这些系统的特定功率、性能和面积 (PPA) 要求。

LPDDR5/4/4X PHY 针对 **高性能、低延迟、小面积、低功耗和易于集成进行了优化** ，以强化 IP 组件（宏单元）的形式提供，以促进以下类型的信号：

- 单端命令/地址 (C/A) 和数据 (DQ) 信号
- 差分信号（时钟、数据选通和 WCK 信号）
- 基于 CMOS 逻辑电平的 C/A 信号

**宏单元包括完全集成的 IO，可轻松组装成各种配置** ，支持各种 SoC DRAM 接口要求。支持基于 GDSII 的 PHY 的是基于 RTL 的 PHY 实用程序模块 (PUB)，它具有 Synopsys 独特的基于固件的训练功能。除了在启动后训练接口外，PUB 还包含 PHY 的配置寄存器，执行针对电压和温度漂移的定期延迟线补偿，执行 DRAM 再训练，并促进 ATE 测试和接口诊断。LPDDR5/4/4X PHY 包括一个连接到内存控制器的 DFI 5.0 接口，可以与 Synopsys LPDDR5/4/4X 控制器结合使用，形成完整的 DDR 接口解决方案。

- 支持 JEDEC 标准 LPDDR5X、LPDDR5、LPDDR4 和 LPDDR4X SDRAM
- 支持高达 6400 Mbps 的数据速率
- 设计用于与 Synopsys 的 LPDDR5/4/4X 控制器快速集成，以提供完整的 DDR 接口解决方案
- DFI 5.0 控制器接口
- 使用嵌入式校准处理器进行独立于 PHY 的基于固件的训练
- LPDDR5X/LPDDR5/4/4X 模式可选双通道架构，与两个独立 PHY 相比，可在更小面积内实现两个独立通道
- 支持基于 DFI 的低功耗模式以及低功耗睡眠和保持模式
- 支持最多 15 种训练状态/频率
- 灵活实施，以支持具有优化 PHY 架构的封装堆叠 (PoP) 或离散 DRAM-on-PCB 系统
- 内置抗衰老功能，可防止 NBTI 和 HCI 的影响

参考： [synopsys.com/zh-cn/desi](https://link.zhihu.com/?target=https%3A//www.synopsys.com/zh-cn/designware-ip/interface-ip/ddr5-lpddr5.html)

## 2.4 其他

**DDR内存交织**

为了提高DDR的访存速度，可以使用 **多通道(channel)技术** 。如果数据存储在不同通道的内存条上，内存控制器就可以 **并行的读取这些数据** ：

总带宽 = 单个内存条带宽 \* 通道数

但是由于程序的局限性，一个程序并不会把数据放到各个地方，从而落入另一个DIMM里，往往程序和数据都在一个DIMM里，加上CPU的Cache本身就会把数据帮你预取出来，这个多通道对速度的提高就不那么明显了。

另外一种提高访存带宽的技术就是让同 **一块内存分布到不同的通道中去，这种技术叫做交织（Interleaving）** ， 此时多通道的技术才能发挥更大的用处。

![](https://picx.zhimg.com/v2-3e427c50b20498c24f39c892d08e42a5_1440w.jpg)

SOC中通常有多个master经过NOC访问DDR，结构如上图

![](https://pic2.zhimg.com/v2-4ce4c14b80b5f598e3121acc64ff6d81_1440w.jpg)

**内存交织的实现方式：**

内存交织将内存按照粒度（256B, 512B, 1KB, 2KB …）分配到不同的memory controller内存交织将内存按照粒度（256B, 512B, 1KB, 2KB …）分配到同一个memory controller的不同通道上各组件的视角：

从master视角看（该视角也是软件视角），此时看到的仍然是一块连续的内存从NOC视角看，此时一块连续的内存已经被均匀的分布到不同的memory controller（或同一个memory controller不同通道）所控制的内存中。由于软件看到的是连续内存，故不需要关注如何高效利用DDRC，各master的内存交织由NOC统一管理。若master发出跨粒度的trans，会被NOC拆分。

**内存交织的优点：**

- 统一的地址空间
- 自动负债均衡
- 带宽与交织的通道数成正比  
	**内存不交织的优点：**
- 根据流量类型、功能或其他考虑因素显式地划分工作负载
- 独立电源模式切换和/或频率变化

参考： [blog.csdn.net/dajiao\_zi](https://link.zhihu.com/?target=https%3A//blog.csdn.net/dajiao_zi/article/details/131476593)

**LPDDR5：实现智能驾驶的关键技术之一：**

![](https://pica.zhimg.com/v2-f102b7ac9057d25d5bc664bfecab2636_1440w.jpg)

DDR5把速度提上来了，但是在汽车中还需要 **功能安全** 。特斯拉宣布召回部分Model X和S车型，原因是其微控制器中的8GB嵌入式多媒体卡(eMMC)存在问题。eMMC上累积的磨损会损害主显示屏、车辆警报信号、存储设备和检查摄像头。所有这些损失加起来会耗尽 **内存安全操作的可靠性** 。

安全汽车存储器的一个重要考虑因素是纠错码（ **ECC** ）。ECC是汽车存储器中的一个关键因素，因为它可以防止系统故障，同时提供流畅的自主驾驶体验。

汽车存储器的安全风险分为两类 **：系统故障和硬件故障** 。系统故障由存储器的ECC处理，检测在数据传输过程中被分类的错误。硬件故障必须在测试和制造阶段解决。

参考： [eet-china.com/mp/a42585](https://link.zhihu.com/?target=https%3A//www.eet-china.com/mp/a42585.html)

tips：

- 系统中可能有多个DDR控制器和PHY，例如64G，一组DDR颗粒8G，有8对DDR控制器和PHY。这样进行复位和时钟控制的时候就可以分开控制，例如为了省电，某种节能模式只开16G就够用了，就可以quit其他进行复位。
- DDR里面为了安全也需要区分安全世界和非安全世界，需要使用其他IP控制实现，例如TZC
- DDR retention会DDR控制器自己去维护数据刷新，从而省电
- DDR的AXI接口接到NoC上。或者SoC里面的APN总线上

## 3\. QSPI FLASH

固件启动的时候需要用到 **QSPI FLASH** ，这个FLASH就是Nor FLASH。

## 3.1 QSPI FLASH演进介绍

SPI 是英语 Serial Peripheral interface 的缩写，顾名思义就是串行外围设备接口，一种 **高速的，全双工，同步的通信总线** ，并且在芯片的管脚上只占用四根线，节约了芯片的管脚，为 PCB 的布局上节省空间，提供方便，主要应用在 EEPROM，Flash，RTC，AD转换，传感器等设备上。　　SPI 的四根信号线： **CS** 　　片选信号线，每个设备都占用一个片选信号线，当 CS 信号线显低电平时，表示该设备被选中，则 SCK，MOSI 和 MISO 信号有效。每个设备都拥有属于自己的 CS 信号线，主机选中设备时，会拉低指定设备的 CS 线电平。使用 CS 信号线，可以使多个设备共同使用同一份 SCK，MOSI 和 MISO 信号线，减少引脚数量，也可以告诉设备本次访问已结束，方便下次重新发起访问请求。 **SCK** 　　时钟信号线，为 SPI 通信过程中提供时钟信号，当 SCK 每次产生上升沿或下降沿时，MOSI 和 MISO 传输一比特数据。 **MOSI** 　　主机发送，从机接收信号线，主机通过该信号线发送数据，从机从该信号线接收到数据。 **MISO** 　　主机接收，从机发送信号线，与 MOSI 相反，这里主机要接收数据，从机要发送数据。两根串行数据信号线保证了主从机之间可以全双工通信。　　SPI 可以实现 **全双工通信** ，但与 SPI Flash 通信的时候反而不需要进行全双工通信：在 Host 不把指令和地址发送完之前，SPI Flash 不会知道 Host 要干嘛，自然不会主动向 Host 发送数据；在 SPI Flash 向 Host 发送数据的时候，Host 也没有必要发送任何数据，因此，当 Host 与 SPI Flash 通信时，总是处于半双工状态，也总有一根数据信号线处于空闲状态。如图所示。

![](https://pic4.zhimg.com/v2-5f236588c7044dbd27acdfe0c0b16fa1_1440w.jpg)

为了把这跟信号线充分利用起来，从而发明了 **DSPI** 。　　当 SPI Flash 准备给 Host 发送数据的时候，如果把 MOSI 也作为 SPI Flash 给 Host 发送数据的数据信号线使用，则每个 SCK 时钟可以发送两比特的数据：原来的MOSI （现在称之为 D0）发送第一个比特，MISO（现在称之为 D1）发送第二个比特，在不增加信号线的基础上，一个时钟发送两个比特数据，相当于传输速率提升了一倍！这就叫做 DSPI，D 是 Dual 的意思。如图所示。

![](https://pic3.zhimg.com/v2-e0b0c077fb958f61088176ead8dbea4e_1440w.jpg)

但 DSPI 的速度好像还是有些慢，如果再增加两条数据线（D3 和 D4），让传输速度提升到 DSPI 的两倍，那么 DSPI 就变成了 **QSPI** ，Q 是 Quad 的缩写。　　相比较于 SPI，QSPI 在数据传输的时候，一个 SCK 时钟能传输 4 比特数据，两个 SCK 时钟就能传输一字节的数据，性能提升，让 CPU 直接执行存储在 SPI Flash 的程序变成了可能。如图 所示。

![](https://pic2.zhimg.com/v2-9567a453940e65bb596df7a2f330307f_1440w.jpg)

能否再让数据引脚增加一倍，8 根数据线岂不是速度更快，那就了解下 FSMC 吧，直接 16 根数据信号线，速度自然变得更快了，但使用 SPI FLash，不就是 **图一个线少嘛，线太多就是PCIE** 了。

参考： [bbs.elecfans.com/jishu\_](https://link.zhihu.com/?target=https%3A//bbs.elecfans.com/jishu_2342610_1_1.html)

## 3.2 QSPI FLASH控制器

SPI Flash控制器（以下简称“ **QSPI** ”）主要实现两类功能，一是与Flash设备进行 **数据交互** ，二是对Flash设备进行 **管理和查询** 。

数据交互主要通过直接访问（DAC）和间接访问（INDAC）两种方式实现，管理查询主要通过软件触发命令生成（STIG）方式实现。

DAC方式，AHB地址与Flash设备地址一一映射，可用于开机启动引导（Boot）和片内程序执行（XIP）。

**INDAC方式** ，需设置AHB地址范围，对落入该地址范围内的访问均采用间接访问方式，并使用嵌入式SRam作为收发数据缓存，还可通过DMA外设接口与外部DMA进行握手。

**STIG方式** ，通过APB总线配置内部的一组寄存器，产生Flash命令（不同Flash设备，对应的命令有所不同），用来访问Flash设备中的寄存器以及执行擦除（Erase）操作。

除此之外，还支持最原始的SPI访问方式，即旁路掉DAC和INDAC，直接访问底层的收发FIFO

![](https://pica.zhimg.com/v2-d739df2ac725e528a7f7be46b4fe042e_1440w.jpg)

QSPI主要由 **AHB接口单元、APB接口单元、直接访问控制单元** （以下简称“DAC”）、间接访问控制单元（以下简称“INDAC”）、Flash命令生成单元、SPI传输单元和SPI/Dual SPI/Qual SPI接口单元几部分组成。其中，AHB接口单元负责通信，APB接口单元负责配置，通过AHB地址区分直接/间接访问模式，分别进入DAC和INDAC。无论采用哪种模式均要经过Flash命令生成单元，转换为Flash可识别的命令格式，进入底层SPI传输单元，实现串并/并串转换，通过SPI/Dual SPI/Qual SPI接口单元与外部的Flash设备完成通信。架构框图如图1所示。

特征概述：

1. 内存映射的直接操作模式，用于Flash数据传输和执行Flash存储的代码；
2. 软件设置的间接操作模式，用于低延迟、非计算密集Flash数据传输；
3. 可选的DMA外设接口，用于在间接操作模式中，与外部DMA同步状态信息；
4. 内部提供一个SRAM，用于在间接操作模式中，缓冲Flash数据；
5. 提供FLash访问控制控制器，用于执行Flash命令；
6. 可寻址的存储颗粒，允许一次超过8字节；
7. 支持设备时钟频率，包括133MHz或80MHz；
8. 支持XIP，连续模式（可能是跨设备的连续地址可执行模式）；
9. 支持DDR模式（上升沿和下降沿都可以传输数据）和DTR协议（串行流控协议）；
10. 支持单、双倍和四倍的IO指令；
11. 可编程设备长度；
12. 可编程写保护范围，防止系统对这些块的写操作；
13. 可编程的访问操作间隔延迟；
14. 传统模式，软件可直接访问底层收发FIFOs，绕过高层处理过程；
15. 将AHB时钟和SPI时钟解耦，兼容慢系统时钟；
16. 可编程波特率发生器，产生分频时钟；
17. 具有高速读数据采集机制；
18. 可调节时钟，提升读数据采集；
19. 可编程中断发生器；
20. 最大支持四个外部设备片选；
21. 可编程AHB解码器，支持连续寻址模式，可以跨外部设备寻址，并自动检测设备地址边界；
22. 支持BOOT模式；

**信号接口** ：这里描述的信号接口主要是芯片内部与片上网络的信号接口；QSPI串行外设接口是芯片外部的信号，主要用于连接外部FLash芯片。根据上面逻辑结构图，整个QSPI Flash存储控制器分为两个部分：SPI传输介质逻辑（右边青色）和Flash存储控制逻辑（左边红棕色）。

从系统软件来看，信号接口主要包括：

1. APB从设备接口，系统软件用于可编程寄存器的访问；
2. AHB从设备接口，在直接模式下，系统软件用于数据传输；
3. 可选的DMA外设接口，与外部DMA同步内部SDRAM状态；
4. 内部SDRAM接口，外部DMA用该SDRAM实现与系统主存之间的数据传输。

参考：

1. [blog.csdn.net/yangguoyu](https://link.zhihu.com/?target=https%3A//blog.csdn.net/yangguoyu8023/article/details/121400556)
2. [blog.csdn.net/lsshao/ar](https://link.zhihu.com/?target=https%3A//blog.csdn.net/lsshao/article/details/119752208)

## 4\. UFS

![](https://pic3.zhimg.com/v2-253533dfdb96fda1b2bc630623c08150_1440w.jpg)

## 4.1 UFS介绍

![](https://pic3.zhimg.com/v2-d96fe2fa0801373e13dbd1462e231be6_1440w.jpg)

说起UFS，必须要讲讲它的前辈 **eMMC** 。eMMC是一种嵌入式多媒体卡，是由JEDEC协会所制定的一种嵌入式非易失性存储器。它采用并行传输技术，读写必须分开执行，虽然仅提供单路读写功能，但仍具备体积小、高度集成与低复杂度的优势。目前最新的 eMMC 5.1 标准，连续读取速度约为 250MB/s。

UFS最早是由JEDEC在2011年推出的，采用全新的串行传输技术，可同时读写操作。第一代 UFS 由于与当时 eMMC 标准速度差异不大，且成本较为高昂，因此并未成功普及。直至 2014 年 UFS 2.0 标准问世后，连续读取速度约达 800MB/s，UFS 才成为 Android 旗舰手机逐渐采用的标准配置。目前最新的 UFS 3.1 标准，连续读取速度约为 1,700MB/s。这时，UFS的传输速度已远远领先于eMMC。

**UFS为什么能那么快？**

首先，它在数据信号传输上，使用的是 **差分串行传输** 。这是UFS快的基础。所有的高速传输总线，如SATA，PCIe，SAS，都是串行差分信号。串行，可以使用更快的时钟（时钟信息可以嵌在数据流中）；差分信号，即用两根信号线上的电平差表示0或者1。与单端信号传输相比，差分信号抗干扰能力强，能提供更宽的带宽（跑得更快）。打个比方，假设用两个信号线上电平差表示0和1，具体来讲，差值大于0，表示1，差值小于0，表示0。如果传输过程中存在干扰，两个线上加了近乎同样大小的干扰电平，两者相减，差值几乎不变，你大爷还是你大爷。但对单端信号传输来说，就很容易受干扰，比如0-1V表示0,1-3V表示1，一个本来是0.8V的电压，加入干扰，变成1.5V，相当于0变成1，数据就出错了，你大妈已经不是你大妈了。抗干扰能力强，因而可以用更快的速度进行数据传输，从而能提供更宽的带宽了。UFS的前辈是eMMC，使用的是并行数据传输。并行最大的问题是速度上不去，因为一旦时钟上去，干扰就变大，信号完整性无法保证。

其次，UFS和PCIe一样，支持 **多通道数据传输** ，目前最多支持两个通道。多通道可以让UFS在成本、功耗和性能之间做取舍。

还有，它是 **全双工工作模式** ，就是读写可以并行。它的前辈eMMC是半双工，读写不能同时进行。

![](https://pic4.zhimg.com/v2-3fd4696f5e896a58c7b89e3530adea9b_1440w.jpg)

要让UFS速度快，这些基础设施是必须的。但要充分利用底层高速数据传输通道，还需要 **上层数据传输协议配合** 。就好比我们现在有一条又宽敞又平坦的高速公路，我们需要一辆高速的汽车行驶在上面。你如果让一辆拖拉机在上面跑，高速公路算是白修了。

UFS协议上层，怎样来充分发挥底层速度快的优势呢？

UFS支持 **命令队列** ，就是主机一下可以发很多个命令下去，然后UFS设备支持并行和乱序执行，谁先完成谁先返回状态。这种命令处理方式叫做异步命令处理。而它的前辈eMMC，是不支持命令队列的，命令一个一个执行，或者一包一包（每个包里面含有若干个命令）执行，前面命令没有执行完成，后面的命令是不能发下去的。这种命令处理方式叫做同步命令处理。

我们来比较一下“全双工+异步命令处理”和“半双工+同步命令处理”两者命令处理方式和命令执行效率。

• **半双工+同步**

![](https://pic2.zhimg.com/v2-86736c60aca2443e141a3b1c7a6d4e39_1440w.jpg)

主机发了一个写命令W1给设备，然后主机把数据写到设备；由于是同步传输模式，命令处理是一个一个处理的，所以在发读命令R2之前，必须等前一个写命令W1完成；同样，在发送写命令W3之前，必须等R2命令完成。

• **全双工+异步**

![](https://pic4.zhimg.com/v2-29bd8d5a583070a06514ad7b60a3252f_1440w.jpg)

现在的手机，应用非常丰富，你要一边斗地主，一边听歌，还要聊微信，多线程操作。由于全双工和命令队列的存在， **UFS处理命令的效率** 大大提高，给用户极好的体验。

参考： [ssdfans.com/?](https://link.zhihu.com/?target=http%3A//www.ssdfans.com/%3Fp%3D92565)

## 4.2 UFS软硬件架构

![](https://picx.zhimg.com/v2-ab163dba689f69c8e1049660c13e7059_1440w.jpg)

**硬件上的UFS芯片** 如上图，是比较小的。

![](https://picx.zhimg.com/v2-bebbe5d63722f473d47f861c875ec21f_1440w.jpg)

**硬件架构** 如上图：

![](https://picx.zhimg.com/v2-ca625a92dc2f50c249f77ae809173187_1440w.jpg)

**接口示意图** 如上图：

![](https://pic2.zhimg.com/v2-db71f4293fad5745f45573917a739463_1440w.jpg)

**硬件分区** ，如上图：最多支持八个LU，其中两个LU可以作为boot分区用，一个RPMB分区，其他LU分区用作user分区

**Device descriptor** ：描述整个UFS device的属性：工作状态，lu属性，lu权限等

**Unit descriptor** ：描述每个LU各自的属性：类型，块大小，权限等

**Geometry Descriptor** ：描述UFS device的几何属性：读块大小，写块大小等

![](https://pic1.zhimg.com/v2-7d73e3514fa6a9fcd07b4aa243cf7d10_1440w.jpg)

**硬件初始化流程** ，如上图：

![](https://pic3.zhimg.com/v2-8d6806f6318275fd784d229f023e5e38_1440w.jpg)

整个UFS协议栈可以分为三层： **应用层(UFS Application Layer(UAP))，传输层(UFS Transport Layer(UTP))，链路层(UIC InterConnect Layer(UIC))** 。应用层发出SCSI命令(UFS没有自己的命令使用的是简化的SCSI命令)，在传输层将SCSI分装为UPIU，再经过链路层将命令发送给Devices。下面分别介绍这三层：

1. **应用层(UFS Application Layer(UAP))**
- UFS command set(UCS)：使用的命令是简化的SCSI命令(SCSI Primary Command(SPC),SCSI Block Command(SBC))，如读写命令等。
- Device Manager: 用于管理UFS设备、设备集操作(对设备的工作模式或状态进行控制)，设备集配置(对设备硬件属性进行设置)。
- Task Manager：任务管理器用于管理命令队列中的命令。比如任务管理器可以发Abort命令，终止之前发下去的命令。它也可以清空命令队列中的所有命令。

2.**传输层(UFS Transport Layer(UTP))**

这一层是JEDEC协议制定的，其他两层都是引用别人的协议。这一层也是UFS最重要的一层。在这一层将应用层的SCSI命令封装为 UFS可以识别的UPIU(固定格式的数据结构，用以传输应用层发来的命令或者请求)，通过互联层到Devices实现端到端的数据传输。

![](https://pica.zhimg.com/v2-2e515c221c3619df8b9ca24deb3b8cea_1440w.jpg)

图5：UPIU的格式

最小的UPIU是32字节，根据不同的Transaction Type这个大小也是不同的。0~11是12字节的帧头。具体的UPIU类型和12字节的帧头可以参考“JESD220D\_UFS3.0”，这里就不在赘述。

3.**链路层(UIC InterConnect Layer(UIC))**

主要包括MIPI UniPro 数据链路层和MIPI M-PHY 物理层。其中，MIPI UniPro 数据链路层负责主机和设备的链接，它本身是一个完整的协议栈;MIPI M-PHY 物理层负责传输实实在在的物理信号，使用8/10编码、差分信号串行数据传输。数据传输分高低速模式，每种模式下又有几种不同的速度档。

**UFS分区表** ：UFS设备的物理存储空间可以有若干个独立的逻辑地址空间，我们把逻辑地址空间叫做 **LU，即Logical Unit，俗称“撸”。** 前面看到，在每个UPIU的Header中，有个LUN（Logical Unit Number）的域，就是标识该UPIU关联的命令或者请求的目标逻辑单元。每个LU的地址空间是独立的，主机在发命令或者请求给设备的时候，须通过LUN指定目标逻辑单元。

![](https://picx.zhimg.com/v2-a6ae8d6b84d1faec0b82b0564fbc9275_1440w.jpg)

image.png

如上图所示，UFS设备有 **若干个LU** ，每个LU接收主机发过来的命令或者请求，这些命令或者请求可来自应用层的SCSI模块、设备管理器或者任务管理器。每个LU都是独立的，“独立”表现在下面几个方面：

逻辑地址空间是独立的，都是从LBA 0开始；

逻辑块大小可以不同，可以为4KB，..；

可以有不同的安全属性，比如可以设置不同的写保护属性；

每个LU可以有自己的命令队列；

不同的LU可以存储不同的数据，比如有的LU存储系统启动代码，有的LU存储普通的应用数据，有的LU存储用户特殊数据...

UFS2.1中可以有最多32个普通LU和“ **四大名撸** ”（四个Well known LU，众所周知的LU）。

![](https://pic3.zhimg.com/v2-46ca7fd42a961f9599ee96c1f7b5538e_1440w.jpg)

普通LU的逻辑块大小至少是4KB，但RPMB LU逻辑块大小为256B。

**BOOT LU**

顾名思义，就是用来存储启动代码的LU。不过，BOOT LU本身是不存储启动代码的，它只是个虚拟的LU，启动代码物理上是存储在普通LU上的。

有两个Boot LU，LU A和LU B，可以用来存储不同启动代码（比如一个新，一个旧），但在启动过程中，只有一个是活跃的（Active）的。32个普通LU中的任意一个可以配成Boot LU A或者Boot LU B。

“ **四大名撸** ” 每个LU分工明确，分别执行不同的任务。下面把 “四大名撸” 能接收的命令列一下：

![](https://pic2.zhimg.com/v2-213a57cc25c19dfac95f01ebf4fde721_1440w.jpg)

他们能接收一些通用的命令（如上图绿色命令），还有只有该LU能执行的命令（如红色命令），具体命令可查看Spec。

![](https://pic3.zhimg.com/v2-9aabb0ebc1f0662eff0e6bdc8f2b8676_1440w.jpg)

具体 **AB分区还是通过GPT分区** 实现的。分区表区域包含分区表项。这个区域由GPT头定义，一般占用磁盘LBA2～LBA33扇区。分区表中的每个分区项由起始地址、结束地址、类型值、名字、属性标志、GUID值组成。分区表建立后，128位的GUID对系统来说是唯一的。每个分区表项大小为128字节，每个分区表项管理一共分区。

![](https://pic4.zhimg.com/v2-ca3e0192ea4f883636ac107423225863_1440w.jpg)

参考：

1. [blog.csdn.net/don\_chian](https://link.zhihu.com/?target=https%3A//blog.csdn.net/don_chiang709/article/details/89312118)
2. [51cto.com/article/70739](https://link.zhihu.com/?target=https%3A//www.51cto.com/article/707398.html)
3. [blog.csdn.net/Thanksgin](https://link.zhihu.com/?target=https%3A//blog.csdn.net/Thanksgining/article/details/96454739)

## 4.2 synopsys UFS解决方案

![](https://pica.zhimg.com/v2-30681aac43afa23c87964a85b56a2a3c_1440w.jpg)

在达到 **预期性能的同时，保持低功耗** ，成为移动存储IC设计人员面临的主要挑战。UFS的设计，旨在帮助客户 克服这一挑战，因为它在物理互连层采用了MIPI M-PHY规范，并在数据传输（或链路）层采用MIPI UniPro规 范。 **MIPI M-PHY为电迁移控制提供了双速模式，并提供了低延时，支持最低待机功耗，而UniPro提供了可靠的 高速通信和低功耗运行** 。为了节约更多能耗，JEDEC UFS标准在低速 (LS-MODE) 和Hibernate (HIBERN8) 模 式下采用参考时钟门控。

![](https://pic2.zhimg.com/v2-d3c2079d4adeaf37da0526dd765d31ad_1440w.jpg)

JEDEC UFS是高端智能手机和平板电脑中的嵌入式大容量存储设备的理想选择。它在处理器之间采用串行接口，用 于实现UFS主机，控制UFS设备。如图2所示，UFS从上至下包含多个分层： **`UFS命令集 (UCS) 层（也称为应用层）：处理UFS使用的小型机系统接口 (SCSI) 命令`** UFS传输协议 (UTP) 层：执行更高层UFS协议信息单元 (UPIU) 命令的生成和处理 \` UFS InerConnect (UIC) 层：处理UFS主机与设备间的连接，其中包含针对链路层的MIPI UniPro和针对 物理层的MIPI M-PHY。UIC层提供了UIC IO控制服务接入点 (UIO\_SAP)，与UniPro中的设备管理实体 (DME)\_SAP相对应。

MIPI UniPro包含 **四层（图3），称为UniPro堆栈：设备管理实体 (DME)、传输 (L4)、网络 (L3) 数据 (L2) 和PHY适配器 (L1.5)** 。物理适配器 层(L1.5)通过参考M-PHY模块接口 (RMMI) 与MIPI M-PHY (L1) 连接。UniPro用于在四层内进行 点对点通信，以帮助维持链路可靠性，并使通信保持较高的抽象等级。物理层 – MIPI M-PHY – 通过多种电源模式提 供了高带宽、低引脚数和低功耗，而且通过RMMI与UniPro接口。

![](https://picx.zhimg.com/v2-ced54d3317b836c2a14e7035e67755b1_1440w.jpg)

汽车行业全新的硬件功能和极高的软件需求正在推动对存储设备的极致需求。Counterpoint 报告称，在当前十年中，汽车的存储容量是 **2TB 到 11TB** 不等。正如预期的那样，ADAS 和信息娱乐 (IVI)/数字驾驶舱系统将引领对存储的需求。

ADAS 系统需要 **实时收集、存储、分析、处理和传输有关复杂道路状况和驾驶环境的大量信息** 。随着从辅助系统到自动驾驶系统的演变，传感器的数量不断增加，所收集的信息量正在飙升。同样，车载信息娱乐 (IVI) 系统正在转变为由数字驾驶舱系统管理的大型屏幕和“拟人”界面，该系统控制从外部通信 (V2x) 到内部 HMI (Human Machine Interaction) 和娱乐的所有内容，对大型快速存储有广泛的需求。

UFS 是移动设备数据存储的流行标准， **也是现代汽车中满足大型和快速存储需求的最佳选择** 。UFS 目前提供高达 1TB 的存储容量。标准化机构（JEDEC 和 MIPI）在过去十年中一直在推进 UFS 标准的数据速率和功能。

随着对 UFS 4.0 的需求开始出现，当今市场上经过硅验证的汽车解决方案支持 UFS 3.0，从而可通过 2 条通道达到 2.9GBps。鉴于该接口是双向的，我们讨论的 UFS 速度超过 eMMC 传输速度的 6 倍。该数据速率超过 5G 传输速率 (2.5GBps)，当数据在闪存设备和主机处理器以外的外部系统之间进行传输时，可在主机处理器内部实现较小的内部存储器。

Synopsys 一直是 UFS IP 的先驱，在控制器和 PHY 方面提供支持最高级规范（UFS 4.0、Unipro 2.0 和 MPHY 5.0)的产品。我们的汽车 MPHY 产品已经过 2 级（-40 至 105 度）AEC Q100 认证，支持先进的 7nm 和 5nm 工艺节点。我们的 UFS 3.0 控制器拥有 ASIL-B 安全等级，具有一整套 FuSa 交付物，并已经过硅验证，可快速设计到下一个汽车项目中。我们持续关注 UFS，并制定详尽的路线图，以满足客户在该市场中的设计需求。

SNPS UFS 解决方案的主要特点：

1. 符合 MIPI M-PHY v5.0 或 M-PHY v4.1 规范 M-PHY Type-I
2. MPHY 支持高速 (HS) Gear1、Gear2、Gear3、Gear4、Gear5 A/B 模式和低速脉冲宽度调制 (PWM) Gear1 到 Gear5，采用 Type-I LS 实现。
3. UFS 主机控制器 IP 可将 UFS 主机控制器应用层与预先配置的 Synopsys MIPI® UniPro 协议栈进行集成
4. UFS 控制器支持 UFSHCI 规范的内联加密部分，并实现具有 256/128 密钥长度的 AES-XTS Block 密钥，以实现最大安全性。
5. 支持满足指定 ISO 26262 ASIL 等级的随机硬件故障指标。
- DFMEA (Design failure mode and effect analysis)
- FMEDA (Failure Modes Effects and Diagnostic Analysis)
- 安全手册

参考：

1. [synopsys.com/content/da](https://link.zhihu.com/?target=https%3A//www.synopsys.com/content/dam/synopsys/china/whitepapers/mipi_ufs_uniport_wp_cn.pdf)
2. [synopsys.com/zh-cn/desi](https://link.zhihu.com/?target=https%3A//www.synopsys.com/zh-cn/designware-ip/technical-bulletin/automotive-embedded-storage-ufs.html)

## 5\. PCIE

![](https://pic1.zhimg.com/v2-4bcbe272d2943e548f8f3d9d87c161ee_1440w.jpg)

![](https://pic1.zhimg.com/v2-3c59edc751ee298d0708eb8b6f8f014a_1440w.jpg)

## 5.1 PCIE简介

**Peripheral Component Interconnect Express** ，简称 **PCI-E** ，官方简称 **PCIe** ，是计算机总线的一个重要分支，它沿用既有的PCI编程概念及信号标准，并且构建了更加高速的串行通信系统标准。

PCIe拥有更快的速率，所以几乎取代了以往所有的内部总线（包括AGP和PCI）。现在英特尔和AMD已采用单芯片组技术，取代原有的南桥和北桥方案。

除此之外，PCIe设备能够支持热拔插以及热交换特性，目前支持的三种电压分别为+3.3V、3.3Vaux以及+12V。

考虑到现在显卡功耗的日益增加，PCIe而后在规范中改善了直接从插槽中取电的功率限制，×16的最大提供功率一度达到了75W，相对于AGP 8X接口有了很大的提升。

PCIe保证了兼容性，支持PCI的操作系统无需进行任何更改即可支持PCIe总线。这也给用户的升级带来方便。由此可见，PCIe最大的意义在于它的通用性，不仅可以让它用于南桥和其他设备的连接，也可以延伸到芯片组间的连接，甚至也可以用于连接图形处理器，这样，整个I/O系统重新统一起来，将更进一步简化计算机系统，增加计算机的可移植性和模块化。

![](https://pic1.zhimg.com/v2-cbf731f53c80dccd0c48c9327a64eb76_1440w.jpg)

![](https://pic2.zhimg.com/v2-15c69498ff80a9cdcc4eddaedd28b231_1440w.jpg)

![](https://pica.zhimg.com/v2-68ace747777a3319ec6c2f0b9d49adce_1440w.jpg)

PCIe的连接是建立在一个单向的序列的（1-bit）点对点连接基础之上，这称之为 ***通道* （lane）** 。这一点上PCIe连接与早期PCI连接形成鲜明对比，PCI连接基于总线控制，所有设备共享双向32位并行总线。PCIe是一个多层协议，由事务层，数据交换层和物理层构成。物理层又可进一步分为逻辑子层和电气子层。逻辑子层又可分为物理代码子层（PCS）和介质接入控制子层（MAC）。这些术语借用自 IEEE 802 网络协议模型。PCIe通过ASPM协议进行电源管理。

![](https://pic2.zhimg.com/v2-fcb65eda79794234d0940b6c7f0c6019_1440w.jpg)

参考： [zh.wikipedia.org/wiki/P](https://link.zhihu.com/?target=https%3A//zh.wikipedia.org/wiki/PCI_Express)

## 5.2 PCIE软硬件架构

PCIe子系统有4种设备类型，分别是 **Root Complex(RC)，PCIe switch，PCIe End Point和PCIe Bridge** 。如下图所示，switch设备和RC设备可以向上或向下连接PCIe总线，PCIe总线的最底层为EP设备。

![](https://picx.zhimg.com/v2-2439d18b5b9d26b92a28f4b317366ce9_1440w.jpg)

PCIe 系统就是指由许多设备相互透过 PCIe 点对点连接所组成的。如下图范例，其结构是由一个Root Complex (RC)、多个Endpoints、Bridge和Switches所组成。

![](https://pic3.zhimg.com/v2-2ede56476a7260e5999ee5e3eda55358_1440w.jpg)

**Root Complex (RC)** ：I/O 层次结构的根，负责将 CPU/Memory子系统连接至 I/O ，可视为一虚拟的PCIe Bus(Bus-0)。RC 比较偏向软体的概念，在x86 架构伺服器上，硬体部分是由CPU和PCH所共同实现。Switch：多个虚拟 PCI-to-PCI 桥设备的逻辑组合 Endpoints：指一种Function 类型，可作为 PCIe 交易(Transaction)的请求者(Requester)或完成者(Completer)。

**PCIe 配置空间** (PCIe Configuration Space)

PCIe Spec中定义：每个PCIe Function都有 4096 Byte 的配置空间(Configuration Space)。前256 Bytes 是和 PCI 兼容的空间，剩余的为PCIe 扩展配置空间(Extended Configuration Space)。其中前 256 Bytes PCI 兼容的空间是为software-driven的初始化和配置提供的，通常可以透过I/O Programming 或是 Direct Memory Access (DMA) 访问。

![](https://pic4.zhimg.com/v2-51117eb4489defbf307f6892a6079ee7_1440w.jpg)

另外，在offset 0x00-0x3F的空间为Header(蓝色框部分), 他的内容格式可分为type 0 和 type 1两种，上色部分为他们共同的部分

Type 0 主要为Endpoints，例如PCI Express Endpoint、Legacy PCI Express Endpoint、RCiEP、Root Complex Event Collector

PCI Express是一种 **分层协议，由设备核心层、传输事务层，数据链路层和物理层组成。**

![](https://pica.zhimg.com/v2-027c21c06805b3a6575c5fefaf1347b6_1440w.jpg)

![](https://pic4.zhimg.com/v2-d954b43746f3a359eba1e8539f8ec145_1440w.jpg)

image.png

参考：

1. [blog.csdn.net/yeiris/ar](https://link.zhihu.com/?target=https%3A//blog.csdn.net/yeiris/article/details/126633678)
2. [zhuanlan.zhihu.com/p/54](https://zhuanlan.zhihu.com/p/542778929)

## 5.3 PCIE SSD PK UFS

在电脑上，我们都是用 **PCIE接口连接SSD固态硬盘** ，在手机上则是使用的 **UFS** ，那这两种技术分支那个更好？

当然 **PCIE除了可以访问SSD，还可以访问ETH、USB等各种高速设备，应用非常灵活和广泛** ，在手机中 **为什么就没有用PCIE？**

![](https://picx.zhimg.com/v2-cc1ac7d656c01840b2f325402e03aecb_1440w.jpg)

![](https://picx.zhimg.com/v2-08261f90b0e47892c634d8b6532824db_1440w.jpg)

UFS是eMMC的替代，抛开EmmC来说，SSD和UFS好像 **难分伯仲** 。从最底层的存储 **两者都是NAND FLSAH** ，区别就是硬件接口和软件协议的实现。

先说结论： **UFS偏向移动设备，低功耗，属于为移动产品定制的，不通用。PCIE SSD速度比UFS快，且通用，但是功耗大，体积大，不适合移动设备。**

NVMe是专门为高速闪存芯片设计的协议，主要是为企业级和数据中心的PCIe SSD设计的接口标准，来充分发挥闪存的性能。在NVMe之前，除了自成体系的SCSI协议（SAS SSD），其它SSD基本用的是AHCI+SATA协议。其实AHCI和SATA是为HDD服务的，而且SATA是由PATA进化而来，也是使用到了我们前面提到的高速串行的全双工传输。奈何SSD具有更低的延迟和更高的性能，SATA已经严重制约了SSD的速度，此时就需要PCIe了。

UFS拥有很好的性能，尤其是到了UFS4.0时代，2lan的顺序读可以达到4GB/s。但是，同时我们也可以看到，NVMe作为专为SSD所设计的协议，确实也有着无以伦比的性能，尤其是PCIe6.0，单lan就可以达到恐怖的8GB/s。

**那么苹果为什么会采用NVMe而安卓还在继续使用UFS呢？孰优孰劣？**

![](https://picx.zhimg.com/v2-60b29dc7e3fc58fe52ef49f92baa7fc9_1440w.jpg)

NVMe是 **简洁的高速协议** ，从上图我们也可以看到NVMe传输只需要一层，而SCSI则需要多层传递，比较臃肿，UFS子系统隶属于SCSI低层。而且UFS自身也分了三层，简单介绍一下：

UFS平台层：获取平台相关的属性，通过ufshcd\_pltfrm\_probe调用公共层ufshcd\_init。获取底层UFS host驱动并传递到公共层。

UFS公共层：提供UFS公共行为，策略，错误处理等。实现ufshcd\_init等。

UFS host物理层：实现scsi控制器驱动。

![](https://pic1.zhimg.com/v2-f5a9e12455ebd277d712155cc51a9896_1440w.jpg)

目前的发展 **UFS在抄PCIE，而把PCIE应用在手机上的苹果也在抄UFS** 。两者互相融合，共同进步。

![](https://pic1.zhimg.com/v2-383c0dc3aaeb9eaf78bab363b162a53a_1440w.jpg)

苹果无法将普通的NVMe SSD直接放在手机里，一个是尺寸不允许，二来现有SSD的功耗也是手机无法承受的，所以可以肯定的是，苹果凭借其强大的整合能力和话语权，特殊定制了适用于手机的NVMe SSD。苹果采用了一种移动版的PCIe，叫M-PCIe。M-PCIe就把标准的PCIe物理层换成了M-PHY，看到这个大家是不是很眼熟，对的，M-PHY就是UFS用的物理层。

UFS参考NVMe增加更多的feature，使UFS为终端场景提供更高的性能，更好的安全性，可靠性和易用性。

**所以两个神仙打架，如何破局** ？--两者都是NAND FLASH，如果有一种 **新的存储替代了NAND FLASH** ，到那个时候估计两个都玩完。

参考：

1. [blog.csdn.net/zhuzongpe](https://link.zhihu.com/?target=https%3A//blog.csdn.net/zhuzongpeng/article/details/132818343)
2. [elecfans.com/consume/22](https://link.zhihu.com/?target=https%3A//www.elecfans.com/consume/2299344.html)

## 5.4 synopsys方案

![](https://picx.zhimg.com/v2-b27459a64659ac3f163622522497e8f3_1440w.jpg)

**PCI Express 6.x 控制器 IP** ：

可配置且可扩展的 Synopsys PCI Express® (PCIe®) 6.x 控制器 IP 支持 PCI Express 6.x 规范的所有必需功能，用户可以配置它以支持端点 (EP)、根端口、双模式 (DM) 或交换机端口 (SW) 应用程序。采用全新 MultiStream 架构的低延迟控制器支持完整的 64GT/s x16 通道带宽，支持高达 1024 位的数据路径，同时实现 1GHz 的时序收敛。控制器可以确保多个源和多虚拟通道实现的最佳流量。对主机、设备和双模式的支持可在没有可用的 6.x 主机和互操作伙伴的情况下实现早期互操作性。设计人员可以利用控制器对 Arm AXI 的支持以及包括可延迟内存写入在内的高级主机功能，实现基于 Arm 的 SoC 的最大吞吐量。控制器的可靠性、可用性和可服务性 (RAS) 功能可增强数据完整性、简化固件开发并改善链路启动。

- 支持 PCI Express 6.2/6.1/6.0.1 (64GT/s)、5.0 (32 GT/s)、4.0 (16 GT/s)、3.1 (8 GT/s) 和 PIPE (32 位) 规范的所有必需功能
- 基于经过硅验证的 PCIe 6.x 控制器设计
- 允许完整的 64GT/s x16 通道带宽，并实现高达 1024 位的数据路径
- 支持包括 ECC 在内的高级 RAS 数据保护功能
- 支持 Synopsys 原生接口或可选的 Arm® AMBA® 5/4/3 AXI 应用程序接口
- 可配置为低功耗、小面积和低延迟
- 利用 Synopsys HyperDMA™ 实现高效的嵌入式 DMA 应用
- 通过完整性和数据加密 (IDE) ECN 可选支持 PCI Express 链路加密
- 符合标准的 IDE 安全模块使用 PCIe 6.x 接口保护 SoC 的数据传输
- TDISP 支持 PCIe 的单根 I/O 虚拟化 (SR IOV) 和通过 IDE 实现的硬件安全

**适用于 PCI Express 6.x 和 CXL 3.x 的 Synopsys PHY IP：**

用于 PCI Express® (PCIe®) 6.x 的多通道 Synopsys PHY IP 满足当今对网络接口卡 (NIC)、背板和芯片间接口更高带宽和功率效率的需求。PHY 独特的 DSP 算法优化了模拟和数字均衡，正在申请专利的诊断功能可实现几乎为零的链路停机时间。PHY 可最大限度地减少封装串扰，允许 x16 链路的密集 SoC 集成，并通过基于 ADC 架构的优化数据路

- 支持 PCIe 6.x 和 CXL 3.x 规范的最新功能
- 支持 PAM-4 信令和最多 x16 通道分叉配置
- 通过独特的 DSP 算法实现跨通道更高功率效率
- 借助正在申请专利的诊断功能，实现几乎零链路中断时间
- 利用布局感知架构最大程度减少封装串扰
- 通过基于 ADC/DSP 的架构实现跨 PVT 变化的一致性能
- 支持接收器的 PCIe 通道裕度
- 支持L0p子状态电源状态、电源门控和电源岛
- 嵌入式误码率测试仪 (BERT)、非破坏性内部眼图监视器和第一位误码率 (FBER)
- 内置自测试向量、伪随机位序列器 (PRBS) 生成和检查器
- 支持 -40°C 至 125°C 结温
- 支持倒装芯片封装
![](https://pic4.zhimg.com/v2-86b169c86bc13c56593d203e7fcfb847_1440w.jpg)

为了使 AI 加速器有效发挥作用，在它（作为设备）和 CPU 及 GPU（主机）之间移动的数据必须快速且延迟极低。实现这一点的关键是什么？PCI Express® (PCIe®) 高速接口。

PCIe 每三年左右推出一次，每代产品都能提供双倍的带宽，这正是我们数据驱动的数字世界所需要的。最新版本的规范 PCIe 6.0 提供：

- 每引脚 64 GT/s 的数据传输速率
- 全新低功耗状态，提高电源效率
- 性价比高
- 高性能完整性和数据加密 (IDE)
- 与前几代产品向后兼容

根据 GlobalData 的数据，人工智能正在迅速普及到芯片组，预计到 2030 年，超过 40% 的芯片组将包含人工智能硬件。人工智能和机器学习 (ML) 工作负载的复杂性不断增加。事实上，人工智能和机器学习训练模型的大小大约每隔几个月就会翻一番。为了有效，人工智能系统必须能够在不牺牲性能或延迟的情况下通过人工智能开发管道移动大型数据集。请考虑以下带宽密集型工作负载的示例：

- 需要更多计算和内存的高清 4K 和 8K 视频
- 高分辨率和高动态范围，实现机器视觉和实时感知
- 多摄像头阵列和 4D 感应，可实现深度和运动推理

所有这些趋势都表明，人工智能加速器对于提供语音激活和高度自动化车辆等应用所需的近乎即时响应所需的并行计算能力至关重要。这些高性能机器可以采用非常大的芯片的形式，例如用于深度学习系统的Cerebras 晶圆级引擎 (WSE)。或者，它们可以是 GPU、大规模多核标量处理器或空间加速器。后者是可以数十到数百个组合的单个芯片，从而创建更大的系统，能够处理通常需要数百 petaFLOPS 处理能力的大型神经网络。

凭借处理 AI 和 ML 工作负载的能力，AI 加速器增强了数据中心服务器中 CPU 的处理能力，而 PCIe 则充当了两者之间的桥梁。PCIe 在其角色中提供了许多好处：

- 最大限度地提高芯片间接口的带宽，无论是用于大规模计算阵列中的 AI 加速器还是边缘计算
- 提供扩展容量以在多个主机和多个设备之间移动数据，因为 PCIe 插槽可以容纳各种类型的扩展卡，包括 AI 加速器
- 通过多线程支持跨多个芯片并行处理工作负载
- 实现主机与设备之间的通用互操作性，可在系统运行时无缝添加或移除 AI 加速卡
- 通过节能的 PCIe 6.0 L0p 模式最大限度地减少碳足迹，该模式允许流量在更少的通道上运行，从而降低功耗
- 提供数据机密性、完整性和重放保护，以确保网络上的数据不会被观察、篡改、删除、插入或重放数据包

另外两片AI SoC相互连接，增强算力，或者多片组成阵列。这时候最快的还是PCIE。

参考：

> 后记：本篇看似零散，其实很强大。立题比较大，如果一个SoC几百个人做，那这篇也需要几个小组，所以写不了太详细，也只是介绍，不能拿自己的业余来挑战别人的专业。还是篇幅有限，下一篇讲下数据一致性问题。大模型AI SoC的存算一体架构直接的限制就是硬件SoC的存储工艺。很多时候技术已经发明出来了，但是工艺做不出来。

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位有自己公众号的留言： **申请转载** ！

纯干货持续更新，欢迎 **分享给朋友** 、 **点赞、收藏、在看、划线和评论交流** ！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

编辑于 2026-03-29 15:06・上海[2025双十一选购NAS必看！绿联NAS不同盘位怎么选？一篇文章告诉你，家庭、办公存储需求1-6盘位应该怎么选！](https://zhuanlan.zhihu.com/p/1969839883439808731)

[

为什么现在越来越多人从“网盘用户”转投NAS私有云？只因网盘存满了想扩容，一看年费要几百；开通了VIP，还有高速流量限制；存娃的成长照片或工作文件，总担心隐私泄露。我也不是说...

](https://zhuanlan.zhihu.com/p/1969839883439808731)