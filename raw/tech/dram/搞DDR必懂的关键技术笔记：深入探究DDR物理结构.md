---
title: "搞DDR必懂的关键技术笔记：深入探究DDR物理结构"
source: "https://zhuanlan.zhihu.com/p/713042976"
author:
  - "[[TrustZone​​​海思技术有限公司 员工]]"
published:
created: 2026-05-02
description: "引言这篇文章的目的就是来看看芯片的物理结构，拿LPDDR5举例。 通过逐步深入探讨LPDDR5内存的 物理结构，到文章结束时，您将清晰了解与LPDDR5内存相关的关键术语，包括：LPDDR5 IOs：命令总线（CA）、数据总线（DQ…"
tags:
  - "clippings"
---
[收录于 · SoC知识百宝箱](https://www.zhihu.com/column/c_1892355985563169100)

航海家 DBinary 等 338 人赞同

## 引言

这篇文章的目的就是来看看芯片的物理结构，拿LPDDR5举例。

通过逐步深入探讨LPDDR5内存的 **物理结构** ，到文章结束时，您将清晰了解与LPDDR5内存相关的关键术语，包括：

- LPDDR5 IOs：命令总线（CA）、数据总线（DQ/DQS）、芯片选择（CS）、时钟（CK）
- Bank和Bank组架构
- Rank和页面大小
- LPDDR5内存通道
- x16/x32/x64宽度的解释

我们将从单个DRAM存储单元开始，逐步探索它是如何构成焊接在PCB上的完整内存封装的。

![](https://picx.zhimg.com/v2-9423ab1f90ddb0e5c952fd9d48c808d9_1440w.jpg)

图0：从存储单元到存储封装

## LPDDR5内存芯片

### 单个存储单元

![](https://pic1.zhimg.com/v2-a4c127902462d846b2d3a30512c25fb6_1440w.jpg)

在最底层，一个位本质上是一个电容器，用于存储电荷，而晶体管则作为开关。由于电容器会随时间放电，信息最终会消失，除非电容器被定期“刷新”。

> 这就是DRAM中“D”的来源——它指的是“动态”，与SRAM中的“静态”相对应。

![](https://pic3.zhimg.com/v2-37c5f61d2cce5c9b18ddc42e9a765e88_1440w.jpg)

### Bank, Rows and Columns

![](https://pic3.zhimg.com/v2-abc8954059de50094f2a7dbae6dee5ec_1440w.jpg)

当你放大一级视图时，你会注意到存储单元被排列成行和列的网格状。

**这样的存储单元网格被称为一个Bank** 。Bank还有一个结构叫做感测放大器（Sense Amps）。

在读操作期间，首先会激活一行并将其加载到感测放大器中。

> 之前讲过哦：

- **[搞DDR，你必须得看看我的这篇笔记](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyOTY5NzkwNg%3D%3D%26mid%3D2247499905%26idx%3D1%26sn%3D0ff71ca88db96df46cd7737cfe879c1c%26chksm%3Dfa5f9d9ccd28148a949b406e9a8e7b09c7798d2e61d7b3ef25d0b66fdd2192abb9143ec2ec26%26payreadticket%3DHHmEk1v_ke3WLiL9zTAMF4zQb7El4fLiqNNv70LRP0Fnhhx3QJjNGPMPBeIAhAwvGmwiypE%23rd)**

然后，使用列地址来读取相应的列位。

在LPDDR5中，

- 每个Bank的一行包含1KB（8192位）的数据。
- 每行中的这1KB数据被排列成64列，每列128位。\[64 x 128位 = 8192位\]
- 因此，每次读/写访问都会指定一个行地址和一个列地址，Bank会返回128位的数据。这个数字很重要，我们将在下一节中再次提及它。
![](https://pic3.zhimg.com/v2-1bba48fd69dacc79303293b002594e1a_1440w.jpg)

图2：存储器阵列

### LPDDR5 Bank架构

![](https://pic4.zhimg.com/v2-687e9800458c5c0170bfae83608dc587_1440w.jpg)

再放大一级视图，每个LPDDR5芯片都有32个这样的Bank块。这32个块可以以3种不同的配置进行排列。

- [Bank组模式](https://zhida.zhihu.com/search?content_id=246584547&content_type=Article&match_order=1&q=Bank%E7%BB%84%E6%A8%A1%E5%BC%8F&zhida_source=entity)

**也称为BG模式** 。在这里，32个Bank块被组织成2组，每组4个Bank组，每个Bank组包含4个Bank。\[2x4x4=32\]。

在下面的图3中，请注意Y轴上的BG0、1、2、3和X轴上的Bank0、1、2、3。 在读/写操作期间，提供的Bank地址会激活2个Bank，并访问总共256位的数据（请记住，每个行和列地址在一个Bank内访问128位的数据）。

> 记得之前我们讲过那个寻址的路线没，一共多少个线，然后不断地分配总线数量。用来做片选。

- [16 Bank模式](https://zhida.zhihu.com/search?content_id=246584547&content_type=Article&match_order=1&q=16+Bank%E6%A8%A1%E5%BC%8F&zhida_source=entity)

在此模式下，32个Bank块被组织成2组，每组16个Bank。\[2 x 16 = 32\]。

此模式与Bank组模式之间的区别在于，访问Bank的时序参数在这两种模式之间是不同的。

您稍后会看到，16 Bank模式只能在低于3200 Mbps的速度下运行，而BG模式则在大于3200 Mbps的速度下运行。

- [8 Bank模式](https://zhida.zhihu.com/search?content_id=246584547&content_type=Article&match_order=1&q=8+Bank%E6%A8%A1%E5%BC%8F&zhida_source=entity) 在这里，32个Bank块被组织成4组，每组8个Bank。\[4 x 8 = 32\]。因此，在读/写操作期间，提供的Bank地址会激活4个Bank，并访问总共512位的数据。
![](https://pic1.zhimg.com/v2-68e6afb7baf8834e6c49169864969a68_1440w.jpg)

图3：LPDDR5 Bank架构

> 那为什么有3种Bank模式而不是只有一种？

LPDDR5提供多种Bank模式以适应不同的操作速度（如3200Mbps、5400Mbps、6400Mbps等）和不同的数据访问宽度（256位和512位）。 **Bank模式的选择是在初始化期间通过在模式寄存器MR3中设置一个参数来完成的** （默认设置是16 Bank模式）。

因此，您选择哪种配置取决于两个因素：

1. 速度等级 - 存储器以什么速度运行？
1. [原生突发长度](https://zhida.zhihu.com/search?content_id=246584547&content_type=Article&match_order=1&q=%E5%8E%9F%E7%94%9F%E7%AA%81%E5%8F%91%E9%95%BF%E5%BA%A6&zhida_source=entity) - 每次操作您想要读取/写入多少位数据？

让我们详细看看这些。

> 速度等级

- 如果存储器以> 3200Mb/s的速度运行，则只能使用Bank组模式。
- 如果存储器以<= 3200Mb/s的速度运行，则只能使用16 Bank模式。
- 8 Bank模式可以在所有速度下访问。

> 指的是在单次突发传输中能够连续传输的数据单元（如字节或字）的数量。这个参数对于提高数据传输效率和性能至关重要。具体来说，原生突发长度定义了在一个突发传输周期内，内存能够连续、无中断地处理的数据量。 当进行突发传输时，只要指定了起始地址和突发长度，内存就会依次自动对后续的相应数量的存储单元进行读/写操作，而无需控制器在每个数据单元传输之间重新指定地址。这种方式减少了地址信号的开销，从而提高了数据传输的速率和效率。 在LPDDR5等高速内存标准中，原生突发长度的具体值取决于内存的设计规格和性能要求。较长的突发长度可以在单个传输周期内处理更多的数据，从而提高数据传输的吞吐量；而较短的突发长度则可能更适合于对功耗有严格要求的应用场景。 此外，原生突发长度还与内存的其他参数（如突发大小、总线宽度等）密切相关。这些参数共同决定了内存的数据传输性能和效率。

---

> 原生突发长度

- 在 **16 Bank模式** 和 **Bank组模式** 下，一次读操作会并行激活2个Bank，并访问256位的数据（请记住，每个Bank返回128位的数据）。在LPDDR5中，数据总线宽度为16位（DQ\[15:0\]）。因此，这256位的数据随后会以16个数据块的形式突发传输出来，每个数据块包含16位数据（16x16=256）。这也被称为BL16或突发长度16。
- 在8 Bank模式下，如图3所示，每次读/写操作会激活4个Bank，并总共获取512位的数据。这些数据随后会以32个节拍的形式突发传输出来，每个节拍包含16位数据（32x16=512）。这被称为突发长度32。

> 示例：如果您的系统设计为以6400Mb/s的速度运行（这是LPDDR5支持的最高速度），并且您需要以256位为单位的数据访问，那么您会选择Bank组模式。  
>   
> **Note** ：在Bank组模式下，您也可以实现BL32（突发长度32），但这稍微复杂一些，并且会对数据进行一些交织处理。如果您想要突发长度为32，那么直接使用8 Bank模式会更好。

### 页大小（Page Size）

**页大小是指当一行被激活时，加载到感测放大器中的位数。**

- 在16 Bank模式和Bank组模式下，页大小为2KB。
- 在8 Bank模式下，页大小为4KB。

> 我们是如何得出这些数字的？

在图2中，我们看到Bank中的 **每一行存储1KB的数据** （以64列、每列128位的方式排列）；

![](https://pic3.zhimg.com/v2-1bba48fd69dacc79303293b002594e1a_1440w.jpg)

图2：存储器阵列

并且，从图3中我们可以看到，在16 Bank模式和Bank组模式下， **两行会同时被激活以总共获取256位的数据** 。因此，从内存芯片的角度来看， **两行被激活，所以总页大小为2x1KB = 2KB。**

由此推断， **在8 Bank模式下，一次访问会激活4个Bank，因此页大小为4KB** 。

### 密度

到目前为止，我们已经讨论了LPDDR5内存芯片的物理结构， **但是内存芯片的容量是多少，它能存储多少位数据呢？**

LPDDR5内存芯片是按照特定的容量制造的，从JEDEC规范中指定的2Gb到32Gb不等。

一个2Gb容量的芯片和一个32Gb容量的芯片之间的 **主要区别在于每个Bank中的行数** 。

下表显示了以Bank组模式（BG模式）运行的内存所需的地址位数。

> 表1：x16 DQ 模式寻址

| Memory Density | 2Gb | 8Gb | 16Gb | 32Gb |
| --- | --- | --- | --- | --- |
| Number of Rows | 8192 | 32,768 | 65,536 | 131,072 |
| Number of Cols | 64 | 64 | 64 | 64 |
| Row Address Bits | R0-R12 | R0-R14 | R0-R15 | R0-R16 |
| Col Address Bits | C0-C5 | C0-C5 | C0-C5 | C0-C5 |
| Bank Address Bits | BA0-BA1 | BA0-BA1 | BA0-BA1 | BA0-BA1 |
| BG Address Bits | BG0-BG1 | BA0-BA1 | BA0-BA1 | BA0-BA1 |
| Page Size | 2KB | 2KB | 2KB | 2KB |
| Array Pre-Fetch | 256b | 256b | 256b | 256b |

**计算一个2Gb芯片的总密度：**

> 4 (BG) x 4 (Banks) x 8192 (rows) x 64 (cols) x 256b (each col) = 2,147,483,648 = 2Gb

再给你整个图放这里！

![](https://pic4.zhimg.com/v2-687e9800458c5c0170bfae83608dc587_1440w.jpg)

![](https://pic3.zhimg.com/v2-fae075e7312016f1746099e9eeba49c0_1440w.jpg)

## 说说参数

DRAM芯片相当于一栋装满文件柜的大楼

- Bank组（Bank Group）相当于楼层号，用于识别你需要的文件所在的楼层
- Bank地址（Bank Address）相当于楼层内的文件柜编号，用于识别你需要的文件所在的具体文件柜
- 行地址（Row Address）相当于文件柜中的抽屉编号，用于识别文件所在的具体抽屉。将数据读取到感测放大器（Sense Amplifiers）中相当于打开/抽出文件抽屉。
- 列地址（Col Address）相当于抽屉内文件的编号，用于识别抽屉内具体文件的编号。
- 当你想读取另一行数据时，你需要先将当前文件放回抽屉并关闭它，然后再打开下一个抽屉。这相当于预充电（PRECHARGE）操作。

## x8 DQ 模式

LPDDR5 接口有 16 个 DQ（数据）引脚。因此，默认情况下，内存以所谓的 x16 DQ 模式运行。

但是，你可以禁用 8 个 DQ 引脚，并将内存置于 x8 DQ 模式。

在这种模式下，在一次读或写访问期间，只有一个 Bank 被激活（而不是 2 个）。作为回报，你得到的是一个容量更大的内存，即与 x16 模式相比，每个 Bank 看起来的行数是 x16 模式的两倍。（我们将访问宽度减半，因此，正如你所期望的，深度加倍。）

---

> 我先解释一下这个 “容量更大”

在LPDDR5或其他DRAM技术中，将接口从x16 DQ模式切换到x8 DQ模式实际上并不直接增加物理上的存储容量（即芯片上存储单元的总数）。然而，从逻辑和访问效率的角度来看，它给人一种“容量更大”的错觉，这主要是因为改变了数据访问的方式和Bank的利用率。

具体来说，当在x16 DQ模式下工作时，内存接口可以并行处理更多的数据（因为有两个Bank可以同时被激活，并且每个Bank的访问宽度是16位），这提高了数据传输的吞吐量。但是，在x8 DQ模式下，虽然一次只能激活一个Bank，并且访问宽度减半（每个Bank的访问宽度现在是8位），但这允许在逻辑上更深入地访问内存。

这里的“容量更大”主要体现在以下几个方面：

1. **更深的Row寻址空间** ：由于一次只能激活一个Bank，并且访问宽度减半，因此每个Bank在逻辑上看起来像是拥有更多的Row。这是因为当访问宽度减少时，为了保持相同的总数据传输速率，需要访问更多的Row来填充数据通道。这并不意味着物理上增加了Row的数量，而是改变了数据访问的粒度。
2. **Bank利用率** ：在x16 DQ模式下，两个Bank可以同时被激活，这可能导致在某些情况下，一个Bank在等待另一个Bank完成操作时被闲置。而在x8 DQ模式下，虽然牺牲了并行性，但确保了每次只有一个Bank被完全利用，从而可能提高了某些特定工作负载下的整体效率。
3. **灵活性和优化** ：在某些应用场景中，比如对延迟敏感的应用，减少并行性和增加深度可能是一个有利的权衡。这是因为较深的Row寻址空间可以减少PRECHARGE和ACTIVATE命令的频率，这些命令在DRAM操作中可能会引入相对较长的延迟。
![](https://pic3.zhimg.com/v2-b99b404c3ed7734b2fe90a597ef6459e_1440w.jpg)

图四: x8 DQ Mode

> 表2：x8 DQ 模式寻址

| Memory Density | 2Gb | 8Gb | 16Gb | 32Gb |
| --- | --- | --- | --- | --- |
| Number of Rows | 16,384 | 65,536 | 131,072 | 262,144 |
| Number of Cols | 64 | 64 | 64 | 64 |
| Row Address Bits | R0-R13 | R0-R15 | R0-R16 | R0-R17 |
| Col Address Bits | C0-C5 | C0-C5 | C0-C5 | C0-C5 |
| Bank Address Bits | BA0-BA1 | BA0-BA1 | BA0-BA1 | BA0-BA1 |
| BG Address Bits | BG0-BG1 | BA0-BA1 | BA0-BA1 | BA0-BA1 |
| Page Size | 1KB | 1KB | 1KB | 1KB |
| Array Pre-Fetch | 128b | 128b | 128b | 128b |

在上面的表格中，请注意与表1相比，Array Pre-Fetch和Page Size减半了，而行数（Number of Rows）加倍了。

> x16模式与x8模式的设置是通过模式寄存器MR8来完成的。

## LPDDR5 内存通道

![](https://pic1.zhimg.com/v2-beecdd0262f099050738387ddcf7d850_1440w.jpg)

> 表3：LPDDR5 输入/输出（IOs）

```
|
```

| Pin | Width | Type | Description |
| --- | --- | --- | --- |
| RESET\_n | 1 | Input | Reset pin |
| CK\_t, CK\_c | 1 | Input | Differential clock |
| CS\[1:0\] | 2 | Input | Chip Select. Think of this as the enable/valid pin. The rest of the command bus is valid only when this is high. |
| CA\[6:0\] | 7 | Input | Address bus. This is used to select which BankGroup,Bank,Row,Col to access. |
| DQ\[15:0\] | 16 | InOut | Bidirectional data bus |
| WCK\[1:0\]\_t, WCK\[1:0\]\_c | 2 | Input | Differential clocks used for WRITE data capture and READ data output |
| DMI\[1:0\] | 2 | InOut | Data mask inversion. This IO has several functions such as DataMask (DM), DataBusInversion (DBI), or Link ECC based on the mode register setting. |
| RDQS\[1:0\]\_t, RDQS\[1:0\]\_c | 1 | RDQS\_t: Inout, RDQS\_c: Output | Read Data Strobe |

### 秩（Ranks）、宽度级联（Width Cascading）和深度级联（Depth Cascading）

一个通道可以由一个或多个LPDDR5内存芯片组成\*\*。在下图中，我展示了如何配置多个2Gb内存芯片来增加通道中的总内存容量。\*\*

- 2Gb通道容量：这很简单。只需将一个2Gb内存芯片连接到LPDDR5的IOs上。
- 4Gb通道容量：在这里，我们有两个2Gb芯片，它们被“深度级联”，也称为2秩（Rank）配置。通过设置芯片选择0（CS0引脚）来访问芯片A，而芯片B则通过CS1引脚来选择。但是，由于一次只有一个芯片选择引脚处于活动状态， **因此两个芯片共享相同的地址和数据总线。**
- 8Gb通道容量：在这里，我们有四个2Gb芯片。与4Gb容量类似，这里也有2秩。 **但在每个秩内部，我们有两个“宽度级联”的芯片，即每个芯片都被配置为x8宽度模式** 。
![](https://pic1.zhimg.com/v2-931887bf03ec4d540fd20f19a30d6260_1440w.jpg)

图5：LPDDR5 通道

## LPDDR5 内存封装

![](https://pica.zhimg.com/v2-6287f2887298077e6b9d79bd99979a68_1440w.jpg)

图6：x64 4通道LPDDR5封装

最后，我们再将视角拉远一点，现在我们看到的是整个LPDDR5内存设备封装。这是你可以从美光（Micron）或三星（Samsung）等供应商那里购买的产品。

通常，一个内存封装包含多个通道。这使得内存制造商能够创建具有不同宽度和容量的内存设备，以满足各种应用的需求。

在供应商的产品目录中，典型的宽度和容量包括：

- 容量：4GB、8GB、16GB等
- 宽度：x16（1通道）、x32（2通道）、x64（4通道）。每个通道都是独立可访问的，并且拥有自己的CA和DQ引脚集。

## SoC-LPDDR5 接口

既然我们已经了解了LPDDR5内存的外观，那么我将以讨论处理器或SoC如何对内存进行读写来结束本文。

为了与LPDDR5内存通信，SoC、ASIC、FPGA或处理器需要一个控制器和一个PHY。这三个实体——控制器、PHY和LPDDR5内存设备——共同构成了LPDDR5内存子系统。

![](https://pic4.zhimg.com/v2-0a0b4bd47e90b2d8ae0da906a38eb1eb_1440w.jpg)

图7：LPDDR5内存子系统

## LPDDR5 接口

如前所述，下表描述了PHY与单个LPDDR5内存通道之间的接口。这些IO是PCB上的物理走线。

| Pin | Width | Type | Description |
| --- | --- | --- | --- |
| RESET\_n | 1 | Input | Reset pin |
| CK\_t, CK\_c | 1 | Input | Differential clock |
| CS | 1 | Input | Chip Select. Think of this as the enable/valid pin. The rest of the command bus is valid only when this is high. |
| CA\[6:0\] | 7 | Input | Address bus. This is used to select which BankGroup,Bank,Row,Col to access. |
| DQ\[15:0\] | 16 | InOut | Bidirectional data bus |
| WCK\[1:0\]\_t, WCK\[1:0\]\_c | 2 | Input | Differential clocks used for WRITE data capture and READ data output |
| DMI\[1:0\] | 2 | InOut | Data mask inversion. This IO has several functions such as DataMask (DM), DataBusInversion (DBI), or Link ECC based on the mode register setting. |
| RDQS\[1:0\]\_t, RDQS\[1:0\]\_c | 1 | RDQS\_t: Inout, RDQS\_c: Output | Read Data Strobe |

## DFI 接口

**控制器可以被视为逻辑层面的核心** 。 **它是一个复杂的状态机，确保在执行读取、写入或刷新操作时严格遵守LPDDR5协议** 。而另一方面， **PHY则代表物理层面，包含了所有必要的模拟组件，以确保时钟、地址和数据信号在内存与PHY之间能够可靠地传输。**

参考前面的图7，PHY和控制器通过一个定义明确的标准接口——即DFI接口——进行通信。通过这个接口，PHY可以向控制器报告其当前状态，比如是否处于初始化阶段、校准阶段，或者是否已准备好执行读取/写入操作。

## 控制器接口

**访问DDR内存需要精确的步骤和时序控制** 。例如，为了将数据写入内存，需要向内存发送一系列命令来激活正确的bank、行和列，然后在精确的时间点（称为写入延迟）发送数据。此外，在所有这些操作之间，内存还需要以固定的周期进行刷新，以防止数据丢失。

控制器通过抽象化这些复杂的步骤和时序控制， **提供了一个简单的接口（如AXI）** ，使得我们可以更容易地发出写入或读取指令。

除了提供一个简单的内存访问接口外， **控制器还具备多种智能功能（如地址重排序），这些功能有助于SoC/处理器最大化内存带宽** 。这一点非常重要，因为内存通常是笔记本电脑、手机或复杂ASIC（如TPU）性能瓶颈的所在。

> 点赞超200，更Training！

## 推荐阅读

- **[搞DDR，你必须得看看我的这篇笔记（一）：DRAM](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyOTY5NzkwNg%3D%3D%26mid%3D2247499731%26idx%3D1%26sn%3Ded6d2d9c7c1394cb2e14e06d816ca6d3%26chksm%3Dfa5fa2cecd282bd83fc7b03b9ced81f340106c4eff24584cdb43f67951cd8b79a0103d9ac5e8%26payreadticket%3DHIRmBy507MIugzZMMmmuQ0AWO4p3txZaIfjD8aztw7CoTccSKWTcw99cdX4632pLwKgKzgI%23rd)**
- **[搞DDR，你必须得看看我的这篇笔记（二）：DDRC](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyOTY5NzkwNg%3D%3D%26mid%3D2247499810%26idx%3D1%26sn%3D645237902019cbbdbcf8b10a809ce99d%26chksm%3Dfa5f9d3fcd281429ef86e0978187565eff36f00e65b4056e9630d568cd6446354a402a8f2c44%26payreadticket%3DHPE0wn7SohYJRH0lQwSlb-zec4XZDS94KHrAWJ5y4DH3rszLagMHRmlEiL4t4Oifq-uLZYc%23rd)**
- **[搞DDR，你是可以看看我的这篇笔记（三）：DDRPHY](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyOTY5NzkwNg%3D%3D%26mid%3D2247499837%26idx%3D1%26sn%3Dd6a26437743137ba2c7e2af35fdd35b4%26chksm%3Dfa5f9d20cd281436f50709e2f8c7cba68d9d525f3488540b15b0ee4a059eef96448aa1438499%26token%3D84940425%26lang%3Dzh_CN%23rd)**
- **[搞DDR，你必须得看看我的这篇笔记（总结篇）](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyOTY5NzkwNg%3D%3D%26mid%3D2247499905%26idx%3D1%26sn%3D0ff71ca88db96df46cd7737cfe879c1c%26chksm%3Dfa5f9d9ccd28148a949b406e9a8e7b09c7798d2e61d7b3ef25d0b66fdd2192abb9143ec2ec26%26payreadticket%3DHMFCrV2B0r_Iz2RraVfQjksHCi-gHbyo5F7EY1mOA-MdLJDMhpecfl8-t8lOL5gZ2OyLCCI%23rd)**
- **[搞DDR必懂的关键技术笔记：ODT](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyOTY5NzkwNg%3D%3D%26mid%3D2247500207%26idx%3D1%26sn%3Deea78433813d7202f302f8299bdba83c%26chksm%3Dfa5f9cb2cd2815a447601a59254e217f83662c877cf08811e11b628b4f4066c6e0a469b12096%26payreadticket%3DHJsZjEEG-deG7cFtMIE2hakjJn7nbERQyTQM_NLliRXX0SYohpXr1RTNhTzKofee-jNXne0%23rd)**
- **[搞DDR必懂的关键技术笔记：Initialization, Training ， Calibration](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyOTY5NzkwNg%3D%3D%26mid%3D2247500248%26idx%3D1%26sn%3D503c5f59d1676950ec7013635fe170dc%26chksm%3Dfa5f9cc5cd2815d3de2d22fafda69e3870403f23bcb765c088a4f20eb56dc7079dd305212038%26token%3D851425450%26lang%3Dzh_CN%23rd)**

还没有人送礼物，鼓励一下作者吧

发布于 2024-08-06 15:14・贵州[ODI投资主体与申报类型（独立申报、联合申报、合并申报）全景解析](https://zhuanlan.zhihu.com/p/1988909639107101664)

[

随着全球化步伐的加快，中国企业的跨境投资需求日益增长，境外直接投资（ODI）成为许多企业扩展国际市场、提升竞争力的重要途径。然而，ODI的申报和主体选择并非一项简单的任务，它...

](https://zhuanlan.zhihu.com/p/1988909639107101664)