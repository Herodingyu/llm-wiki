---
title: "SoC常用外设存储设备--PSRAM"
source: "https://zhuanlan.zhihu.com/p/452070318"
author:
  - "[[小伙纸热衷于soc设计，希望遇到志同道合的朋友。]]"
published:
created: 2026-05-02
description: "PSRAM【重要提示】：本文内容为自创内容，如需转发，请注明出处。前言PSRAM作为常用的一种外设存储设备，所具有的优点使其广泛被应用。本文先介绍常用的存储器简单介绍各自特点，在原理章节对psram的工作原理进行…"
tags:
  - "clippings"
---
33 人赞同了该文章

## PSRAM

```
【重要提示】：本文内容为自创内容，如需转发，请注明出处。
```

### 前言

PSRAM作为常用的一种外设存储设备，所具有的优点使其广泛被应用。本文先介绍常用的存储器简单介绍各自特点，在原理章节对psram的工作原理进行详细介绍。

对于常用的存储器可以简单分类如下：

1、数据易失性存储器，如 [DRAM](https://zhida.zhihu.com/search?content_id=188590224&content_type=Article&match_order=1&q=DRAM&zhida_source=entity) (Dynamic RAM，动态RAM)、SRAM(Static RAM，静态RAM)。这类存储器读写速度较快，但是掉电后数据会丢失。在SoC设计中通常被用作数据缓存、程序缓存；

2、数据非易失性存储器，如NAND/ [NOR flash](https://zhida.zhihu.com/search?content_id=188590224&content_type=Article&match_order=1&q=NOR+flash&zhida_source=entity) 。这类存储器读写速度比较慢，但是在掉电后数据不会丢失。因此，在SoC设计中可用作大数据的存储或者程序的存储；

3、新出现的存储器PSRAM(pseudo SRAM)，称之为伪静态随机存取器。它具有SRAM的接口协议：给出地址、读写指令，就可以实现数据的存取；相比DRAM的实现，它不需要复杂的memory controller来控制内存单元去定期刷新数据，但是它的内核架构却是DRAM架构；传统的SRAM是由6个晶体管构成一个存储cell，而psram则是由1个晶体管+一个电容构成一个存储cell，因此psram可以实现较大的存储容量；

基于上述分析，新出现的存储器psram相比传统存储器具有如下优点：

1. 更大的带宽：串行psram通过八路串行接口对外互联，最高在200MHz Double-Data-Rate速率下，可实现超3Gbps的带宽传输；
2. 更高的容量：目前可实现存储容量有：32M、64M、256M，这比市面上其他串行接口随机存储器的容量要大很多；
3. 更低的成本：串行psram采用DRAM架构，可以有效压缩芯片体积，故串行psram生产成本接近DRAM成本；
4. 更小的尺寸：串行psram的低引脚数封装与传统的RAM存储相比，具有尺寸更小、成本更低等优势；
5. 更广的应用：psram采用的是自行刷新（Self-Refresh），不需要刷新电路即能保存它内部存储的数据；而DRAM每隔一段时间，要刷新充电一次，否则内部的数据即会消失，因此psram相比传统RAM会有更广的应用；

### 原理

psram目前支持的标准有JEDEC JESD251A(Profile 2.0)、HyperRAM、 [Xccela standards](https://zhida.zhihu.com/search?content_id=188590224&content_type=Article&match_order=1&q=Xccela+standards&zhida_source=entity) ，本节主要分析Xccela standards，其对应的厂家为 [apmemory](https://zhida.zhihu.com/search?content_id=188590224&content_type=Article&match_order=1&q=apmemory&zhida_source=entity) (爱普科技)，下面ap的psram为例进行描述：

**接口信号：**

![](https://pic3.zhimg.com/v2-510ba0717d9b95dee51edf9cd0c6446c_1440w.jpg)

图1 psram接口信号

其中，VDD、VDDQ、VSS、VSSQ为电源信号，数字设计部分不用关注；

A/DQ为8bit的地址/数据总线，地址是以byte为单位，故该64M存储空间的芯片所需要的地址位宽为23bit。数据传输是按照时钟的双边沿传输，故一个时钟周期可以传输2byte数据量；

DQS/DM共用一个IO信号，DM为data mask，当需要对写数据进行mask时，常使用该信号。比如写操作限定最小数据量为2byte，但是实际只想写1byte时，就可以使用该信号；DQS为DQ strobe指示信号；

CE#为片选信号，低有效，当CE为高表示芯片处于待机。

CLK为时钟信号，由外部输入；

RESET#为复位信号，低有效，可选。由于芯片内部reset信号在pad上设置为上拉，故该信号可以通过外部悬空；

**上电初始化：**

芯片的上电初始化操作可以分为两个阶段，第一阶段称之为： **phase1** ，第二阶段称之为： **phase2** ；（phase2包含两个方法）

**phase1：**

VDD和VDDQ同时上电，当其稳定且超过最小VDD(200mV)时，进入phase1，phase1保持最小时间为150us；

**在phase1时间范围内，CE#必须保持为高，CLK必须为低** ；

**phase2：**

方法1：使用RESET#管脚法

phase1结束后，使用RESET#管脚进行芯片的phase2阶段初始化；

具体的实施参见下图：

需要注意使用RESET#进行phase2阶段复位时，tRP、tRST必须满足对应的时间要求；

方法2：使用全局复位方法

phase1结束后，使用全局复位进入phase2；

具体的实施参见下图：

![](https://pic1.zhimg.com/v2-8ae9e7c188d531bd6cf2690d0ac07356_1440w.jpg)

图3 上电初始化@method2

全局复位指令可以复位所有的寄存器内容，对memory里面的内容不保证正确性。全局复位时，需要保证CE持续4个clock为低，当全局复位完成后，时钟为可选（可以toggling，也可以为为低/高）。全局复位操作流程见下图：

其中，INST为burst操作类型指示信号，具体含义如下：

### 操作

**memory array读操作：**

读操作时序参见下图：

备注：

1、 DQS在指令INST、地址锁定后被初始化为0，在第一个上升沿出指示第一个1byte有效数据，可以支持断续；

2、 读指令INST为0x00/20；

3、 有效数据在地址锁定后LC延迟后输出，一般LC=5clk，在psram刷新阶段，LC最大为10clk；

4、 读数据阶段DQS为输出信号，DM不用，一个clk可以读出2byte数据；

5、 RBX功能打开时，单次burst可以超过1KB边界，但是需要满足RBXwait时间限制；

6、 读数据结束以CE#拉高结束；

**memory array写操作：**

写操作时序参见下图：

备注：

1、 写指令INST为0x80/A0；

2、 写数据最小为2byte，可以配合DM一起实现写1byte数据，最大无限制，只要满足tCEM(CE#低脉冲时间)时间要求即可；

3、 写操作延时存在多种模式，根据寄存器MR4\[7:5\]来确定，默认为WL 5；

4、 DQS在写操作中不使用；

5、 在连续的短burst写操作中，tRC需要满足要求时间，通常可以拉高CE#；

**寄存器读写操作：**

寄存器的读写操作时序参见下图：

![](https://pic1.zhimg.com/v2-4f1697c9dedf3cac159cb8fe5dfc1596_1440w.jpg)

图9 寄存器读操作

备注：

1、 寄存器读指令INST为：0x40；

2、 寄存器写指令INST为：0xC0；

3、 寄存器读写只需要1byte地址，故地址放置于A0位置处；

4、 psram一个clk可以读2byte数据，故读操作中一次可以读出2个寄存器，一个寄存器占8bit，具体读出顺序见图；

5、 寄存器的写操作不需要DM即可实现1byte写入；

定义的寄存器具体参见下图：

寄存器的每bit含义参考datasheet；

**HALF SLEEP模式：**

half sleep进入/退出时序：

备注：

1、 通过配置寄存器MR6为0xF0进入half sleep，同时CE#需要拉低3clk时间，tHS有最小周期要求，具体参见datasheet；

2、 half sleep模式下存储的数据会被保持，同时设备以超低功耗运行；

half sleep退出，只需要给CE#一个低脉冲即可，低脉冲持续时间tXPHS有最小要求，具体参见datasheet；

**DPD模式：**

DPD模式进入/退出时序：

备注：

1、 通过配置寄存器MR6为0xC0进入DPD(power down)，同时CE#需要拉低3clk时间，tDPD有最小周期要求，具体参见datasheet；

2、 DPD模式下存储的数据会被保持，同时设备以超低功耗运行；

DPD退出，只需要给CE#一个低脉冲即可，低脉冲持续时间tXPDPD有最小要求，具体参见datasheet；

编辑于 2023-01-31 18:01・IP 属地未知[大模型落地的最佳范例？深度测评出门问问 TicNote AI 录音卡片，看它如何重新定义“录音笔”](https://zhuanlan.zhihu.com/p/1976704708388344713)

[

AI的星辰大海，不该只是手机里的APP。从年初DeepSeek点燃战场，到如今各类大模型混战，我却在想我们与AI之间，似乎总隔...

](https://zhuanlan.zhihu.com/p/1976704708388344713)