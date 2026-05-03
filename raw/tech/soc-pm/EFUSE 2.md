---
title: "EFUSE 2"
source: "https://zhuanlan.zhihu.com/p/677694580"
author:
  - "[[LeonardT​​芯片设计]]"
published:
created: 2026-05-03
description: "周五铜锅涮肉的时候被催更，趁着看球（亚洲杯 中国vs塔吉克斯坦）的间隙，继续把文章写完。本章全是10年EFUSE设计集成的干货，用在了若干代手机SOC芯片中，可能会有些枯燥，但可以真正用在芯片设计中。 书接上文，…"
tags:
  - "clippings"
---
[收录于 · 芯片架构设计](https://www.zhihu.com/column/c_1877951126294372352)

42 人赞同了该文章

周五铜锅涮肉的时候被催更，趁着看球（亚洲杯 中国vs塔吉克斯坦）的间隙，继续把文章写完。本章全是10年EFUSE设计集成的干货，用在了若干代手机SOC芯片中，可能会有些枯燥，但可以真正用在芯片设计中。

书接上文，首先介绍一下EFUSE Controller设计。一般而言，EFUSE通常在如下四个场景下使用：

- 芯片测试：

此时通过芯片管脚朝EFUSE中写入芯片CP/FT测试过程中得到的各种信息，最常见的包括 [Memory Repair](https://zhida.zhihu.com/search?content_id=238728998&content_type=Article&match_order=1&q=Memory+Repair&zhida_source=entity) （RAM Repair）信息、芯片体质信息、模拟器件的校准信息（温度/工艺传感器、某些PHY）、Wafer和封测版本信息等

- 整机出厂：

此时通过芯片内软件编程的方式写入产品的关键信息，如Chip ID、Root Key、 [RSA Hash Key](https://zhida.zhihu.com/search?content_id=238728998&content_type=Article&match_order=1&q=RSA+Hash+Key&zhida_source=entity) 、芯片关键feature（芯片生命周期、是否支持安全启动、是否支持fast boot、......）等

- 芯片上电

芯片上电时，系统上电状态机会trigger EFUSE Controller，从EFUSE中读出所有的信息，其中某些信息被存储在寄存器中供软件（SCP、AP Core）后续使用，某些信息会被通过各种手段（信号直连、DMA总线传输）送到使用点（ram repair pin）

- 系统升级

系统升级的时候，需要通过芯片内软件编程的方式写入某些信息，最常见的是为了防系统回滚而在EFUSE中存储的软件版本号

综上可见，EFUSE在使用过程中，需要准备两套访问通路。其中一条通路需要直连到芯片的PAD上，在芯片不正常工作的时候通过PAD直接访问EFUSE；另一条通路需要软件可控，芯片工作过程中软件通过此通路读写EFUSE，芯片booting时上电状态机自动读取EFUSE本质上只是此通路的硬件版本。

首先是连接到芯片PAD的EFUSE访问通路，一般而言，EFUSE可以独占一组test pin，60-70个EFUSE pin对手机SOC芯片而言并不是大难题，可以把所有的EFUSE pin都拉到IO上供测试模式下读写EFUSE。但是对于某些IO Limited的芯片产品而言，如此之多的EFUSE pin需要进一步优化，因此也可以通过SPI2EFUSE（I2C2EFUSE类似）完成测试模式下的EFUSE读写。

- 直接把EFUSE Pin拉到PAD的好处是读写EFUSE的测试程序更加直接，避免了逻辑错误导致EFUSE无法访问的情况，但缺点就是需要拉出的test pin比较多，60-70个
![](https://pic3.zhimg.com/v2-53a87b57bda9f1eaa567061665a2b718_1440w.jpg)

EFUSE pin直连到testpin上

- 使用SPI2EFUSE的方案，需要自研SPI2EFUSE的硬件逻辑，如果硬件设计错误会导致EFUSE读写失败的严重问题，但好处就是可以拉出很少的pin，从60-70个减少到4个
![](https://pic4.zhimg.com/v2-f95d60a86d2f052bccb7f4fee9b5d0db_1440w.jpg)

EFUSE pin转成SPI pin后再连到testpin上

接下来是EFUSE软件编程通路，实际上是设计合适的EFUSE软件访问方式。

对于读通路，可以整个软件访问变成两个步骤：

1. 软件配置EFUSE读操作的起始地址和读数据长度（单位为word），然后使能EFUSE接口把数据从EFUSE中读到连接到系统总线的EFUSE数据寄存器上，此时应支持burst的读操作。
2. 系统上电时，默认由硬件读出整个EFUSE的数据，起始地址默认值为0，读数据长度默认值为EFUSE长度
3. 第一步操作完成后，软件通过系统总线读EFUSE数据寄存器，得到EFUSE中的各种值

对于写通路，由于EFUSE需避免重复烧写，同时EFUSE写操作不影响系统时序（EFUSE读操作时间会影响芯片booting速度），因此可以把EFUSE写操作简化为1 bit的现场编程。

1. 软件配置EFUSE写操作的地址（单位为bit），然后使能EFUSE接口把数据写到EFUSE Cell中，此时支持1 bit的编程即可
2. 可以加入EFUSE重复编程保护工作，当EFSUE中的数据已经成1的时候，本次编程操作失效，上报异常中断

EFUSE在接口上和其它IO控制器类似，本质上都可以使用一个状态机控制EFUSE的所有管脚赋某个值完成一次特定的操作，这是最直观最容易理解且不容易出错的设计思路。

对于EFUSE读操作，可以按照管脚的值分成若干状态，每个状态下管脚都是一组特定的值

![](https://pic4.zhimg.com/v2-623f2015a70390bb6f381e8b4ce22dcd_1440w.jpg)

EFUSE读操作状态划分

EFUSE写操作也是类似的原则。

![](https://pic2.zhimg.com/v2-a4a0f68a1353c7b64356f49f90ad7245_1440w.jpg)

EFUSE写操作状态划分

需要注意的是，EFUSE的所有时序都是按照绝对时间来的，但是EFUSE的硬件逻辑只能按照时钟数来计算时间，因此EFUSE的工作频率变化是需要特别关注的地方。当EFUSE的工作时钟变化时，EFUSE的时序就会变得不再准确，因此一般可以使用固定的晶体时钟来作为EFUSE工作时钟（e.g. 26MHz）。

接下来是EFUSE 可靠性设计，由于EFUSE易失效的特性，因此在实际使用的过程中常常需要冗余设计保障EFUSE的可靠性。一般来说有两种方式：

- Double Bits Design，通过放置两块EFUSE来保障可靠性。编程的时候同时对两个EFUSE的相同bit进行编程，读取的时候对两个EFUSE的相同地址同时读去，任何一个比特为高则EFUSE的相应位就为高
![](https://picx.zhimg.com/v2-b2c5cb76b84c4121a52867ca315fb3e1_1440w.jpg)

Double Bits Design示意图

- EFUSE对折设计，仅使用一块EFUSE，对折EFUSE内容，高位的EFUSE bit和低位的EFUSE bit任意有效的时候，EFUSE的对应位有效。以256x32 bits为例子，实际容量为128x32 bits，n \* 32 + y 比特上的信息和(n + 128) \* 32 + y比特上的信息含义完全相同。读的时候需要对不同位置进行两次读操作，写的时候需要对不同位置进行两次写操作

Double Bits Design可以节省读取时间和编程时间，但是其面积和功耗会大于EFUSE对折设计，所以需要在设计过程中进行合理的取舍。一般而言除了追求极致面积/功耗的产品外，都更加推荐Double Bits Design。

写到这里，EFUSE的内容也基本结束了。由于若干年前内购的笔记本电源损坏，一时半会也没办法去github上写程序了，所以代码暂时先欠着，后续完成后再更新回来。况且十几年前的水平和现在相比，虽然coding速度和flow能力远远超过现在（动手能力退化），但是探查设计本质和取舍能力还是远远弱于现在的。重新再写一遍，结构也许能够更加清晰。

最后是个闲话，当年在EFUSE设计上犯下的最大bug，其实只是看错了一个时间单位。T家在若干ns时序中插入了一个us值，很寸的是本人和负责验证的小姐姐（当年是小姐姐）都把它看成了ns，更加寸的是小姐姐在timing仿真的时候把EFUSE仿真模型的timing check给关掉了。于是乎芯片顺顺利利的tapeout直到回片测试的时候才发现软件编程会由于编程时间短而经常失败（写不成1），常常一个粗心大意就会导致一款芯片的失败。万幸的是还有一条work around的方法，如果一次写1失败的话，反复的多写几次1还是能成功的，软件简单绕一下就可以救命了，连ECO都不用做（其实也没法做）。当然T家从N16开始，已经把单位统一成了ns，避免糊涂蛋们继续犯错误。

![](https://pic4.zhimg.com/v2-ecddd8e64c20af4d13295c226441c8f3_1440w.jpg)

时间单位不同，有时候很要命

最后的最后，EFUSE使用上的最大的问题实际上来自于其black box的特性导致常常在Fab的投片室里merge的时候发现需要去修DRC和ERC，某种程度上来说这是个无解又烦人的小问题，只能接受它。

编辑于 2024-01-15 11:09・北京[芯片设计](https://www.zhihu.com/topic/19769031)[40+VMware替代案例分享！《VMware升级替代专题》2025版发布！](https://zhuanlan.zhihu.com/p/1925570477792948896)

[

自博通收购 VMware，VMware 产品组合和订阅模式屡次调整，一步步提升企业用户的 VMware 订阅成本与使用⻛险。为了帮助用户...

](https://zhuanlan.zhihu.com/p/1925570477792948896)