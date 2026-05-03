---
title: "uboot入门-6移植要点"
source: "https://zhuanlan.zhihu.com/p/2026982719679154174"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "本篇作为结尾先对之前的文章进行下 汇总：uboot入门-1简介和运行uboot入门-2Makefile和编译uboot-3链接脚本和第一阶段启动uboot入门-4命令行和驱动管理uboot入门-5linux启动前夜uboot入门-6移植要点--本篇对于uboo…"
tags:
  - "clippings"
---
[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181)

2 人赞同了该文章

![](https://picx.zhimg.com/v2-2099b7695777c898a41cbb689089ed41_1440w.jpg)

本篇作为结尾先对之前的文章进行下 **汇总** ：

1. [uboot入门-1简介和运行](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485585%26idx%3D1%26sn%3D31986099c526f8b0b90c8b1babd95b66%26chksm%3Dfa528eb5cd2507a3bc9307a200ea952079e802567621354701d7311bf53047a54c61f5c83723%26scene%3D21%23wechat_redirect)
2. [uboot入门-2Makefile和编译](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485605%26idx%3D1%26sn%3D169686ea14f6c4869d2e29ee0b8ed0d8%26chksm%3Dfa528e81cd25079745e3d1c70d114658d45c7c8f190b83f7191f4bec4061628d31f790d80f94%26scene%3D21%23wechat_redirect)
3. [uboot-3链接脚本和第一阶段启动](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485624%26idx%3D1%26sn%3D8eca0b96da7954a9a5baecc3762ca957%26chksm%3Dfa528e9ccd25078af116f59b19c4a395a64e8746b06c3ef89bbd8c9adce0732f8fd14a6f4c0d%26scene%3D21%23wechat_redirect)
4. [uboot入门-4命令行和驱动管理](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485653%26idx%3D1%26sn%3Dce76f546a9f3194d8a6a032323e1c5cf%26chksm%3Dfa528ef1cd2507e7f0fafe71e236a7f4ba34da4c946cc60e034b3a66f4836b242d7fb697a2e0%26scene%3D21%23wechat_redirect)
5. [uboot入门-5linux启动前夜](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485664%26idx%3D1%26sn%3D76364b8391018fe142ae86fdd9ef47ab%26chksm%3Dfa528ec4cd2507d298dc7d6b0981d3eee57fea45f3693b65a31d1c763d40d1d5a14a42e673c5%26scene%3D21%23wechat_redirect)
6. uboot入门-6移植要点--本篇

对于uboot移植需要先搞清楚下面几个概念：

- 作为 **[SoC芯片](https://zhida.zhihu.com/search?content_id=272990164&content_type=Article&match_order=1&q=SoC%E8%8A%AF%E7%89%87&zhida_source=entity) 厂家** 会做一个基础底板，基于开源Uboot官方版本中找到一个 **最相近的板子配置** 进行移植，去适配自己的芯片和底板。这就是 **芯片原厂 [BSP包](https://zhida.zhihu.com/search?content_id=272990164&content_type=Article&match_order=1&q=BSP%E5%8C%85&zhida_source=entity)** 。
- 买别人SoC自己做底板的 **一般板卡厂家** ，会拿到SoC直接提供的u-boot 源码，做查看、修改(增加新功能) 或 u-boot 版本升级这三大块的用处； **修改升级** 都需要对新板子做适配/移植。
- 如果SoC和板子都不是自己的，只需要改功能，的 **用户产品厂家** 那就更容易了，例如加一个命令行。

一般板卡厂家是我们最经常遇到的场景， **芯片是别人的，跟业务相关的底板是自己的** 。这就需要进行 **移植** 。

## 1\. u-boot 移植要点

![](https://pica.zhimg.com/v2-3b17e89018eae65c9f29801885ebea08_1440w.jpg)

**芯片公司、开发板厂家和用户** 之间联系：

1. **芯片公司** 移植的 u-boot 从一开始是基于官方的 u-boot 拿来修改，添加/修改自家的 [EVK 评估版](https://zhida.zhihu.com/search?content_id=272990164&content_type=Article&match_order=1&q=EVK+%E8%AF%84%E4%BC%B0%E7%89%88&zhida_source=entity) 的板子型号、相关外设初始化文件，并修改 u-boot 的 Makefile 配置，然后把自家芯片的 EVK 评估版的硬件原理图、u-boot、Linux 和 根文件系统以及使用说明文档等等全部开源，以供下游做应用的公司/厂家和做开发板的公司拿来做修改或直接应用；
2. **做开发板的厂家** 在拿到了芯片公司提供的芯片评估版 EVK 板子的原理图后，与 SoC 直接相关的比如 [PMIC](https://zhida.zhihu.com/search?content_id=272990164&content_type=Article&match_order=1&q=PMIC&zhida_source=entity) 、 [DDR](https://zhida.zhihu.com/search?content_id=272990164&content_type=Article&match_order=1&q=DDR&zhida_source=entity) 、 [FLASH](https://zhida.zhihu.com/search?content_id=272990164&content_type=Article&match_order=1&q=FLASH&zhida_source=entity) 、 [以太网 PHY 芯片](https://zhida.zhihu.com/search?content_id=272990164&content_type=Article&match_order=1&q=%E4%BB%A5%E5%A4%AA%E7%BD%91+PHY+%E8%8A%AF%E7%89%87&zhida_source=entity) 等等不会做大改，一般直接照搬过来画自己的开发板。因为在移植 u-boot 的时候就不用再为新选型的芯片做代码适配，一般没必要做这种费力但效果不大的事情，能直接用的就尽量直接用，能不用改的就尽量不改。然后再拿到芯片公司提供的芯片评估版 EVK 板子对应的 u-boot 源码之后，同样的再添加/修改为自家开发板的型号、添加一点点自己板子的外设初始化代码（这个要求比较高）并修改 Makefile，便得到自家开发板适配的又一个 u-boot；
3. 当 **用户** 拿到了开发板厂家 或者 芯片公司提供的 u-boot 源码，即所有相关文件和初始化代码都写好了，便可以直接编译进而使用，或者自己再进一步定制化。

一般把 u-boot 做成对应平台通用的和最小化的，即 **只保留必要的板级外设初始化代码** （如串口、网口和 FLASH 等需要主要做适配，都尽量找能现成使用的），其他更多板级外设初始化在 Linux 移植部分中完成。如果要深入学习，有以下要点可以 **参考** ：

1\. 如果芯片公司或者单位提供了移植好的 u-boot，可以用 beyong 软件把移植好的 u-boot 文件夹与 官方原版（版本要一致）进行对比，看一看改动了哪些文件夹和哪些文件，帮助学习。

2\. \[uboot移植新手入门实践\_哔哩哔哩 (゜-゜)つロ 干杯~-bilibili\]([bilibili.com/video/BV15](https://link.zhihu.com/?target=https%3A//www.bilibili.com/video/BV15W411m7AQ))。版本比较新。

3\. \[韦东山 \_ 嵌入式Linux \_ 第1期与2期间的衔接课程 \_ u-boot编译体验和源码深度分析 \_哔哩哔哩 (゜-゜)つロ 干杯~-bilibili\]([bilibili.com/video/BV1W](https://link.zhihu.com/?target=https%3A//www.bilibili.com/video/BV1WW411L7Tb)) 老版本。

4\. \[【韦东山 】移植U-boot 2012 04 01 到JZ2440\_哔哩哔哩 (゜-゜)つロ 干杯~-bilibili\]([bilibili.com/video/BV1P](https://link.zhihu.com/?target=https%3A//www.bilibili.com/video/BV1Pt411n7cv)) 老版本。

5\. \[linux-----uboot和kernel移植 - 灰信网（软件开发博客聚合） ([freesion.com](https://link.zhihu.com/?target=http%3A//freesion.com))\]([freesion.com/article/24](https://link.zhihu.com/?target=https%3A//www.freesion.com/article/2426374191/))。

## 2\. 移植修改

![](https://pic3.zhimg.com/v2-6345bb7531e6fb4823bb6c435a282a66_1440w.jpg)

## 2.1 uboot代码框架

移植uboot前需要了解下uboot的代码框架，好知道修改那些代码。

![](https://pic1.zhimg.com/v2-a02b6401e8e876843d8054fdeb16a470_1440w.jpg)

在 **硬件层面嵌入式** 系统的核心一般包括以下 **层次** ：

（1） **目标板** ：它包含了系统运行所需的所有组件，如SOC芯片、DDR、flash/emmc存储器、各种外设以及时钟源、电源管理芯片等  
（2） **SOC** ：它包含了cpu、总线控制器、集成在片内的rom、sram、dma控制器、硬件加速器、异构核，以及片内时钟、电源控制模块等  
（3） **处理器架构** ：它一般指处理器体系结构的大版本，不同的体系结构之间可能存在不同的指令集、异常模型以及内存模型等。例如对于arm系列架构，armv8和armv7就属于不同的处理器架构  
（4） **cpu型号** ：它是指处理器的具体型号，如cortex-a53或cortex-a72等

- **[arch目录](https://zhida.zhihu.com/search?content_id=272990164&content_type=Article&match_order=1&q=arch%E7%9B%AE%E5%BD%95&zhida_source=entity)** 包含了处理器架构相关代码，
- **arch/cpu目录** 包含了特定cpu代码，
- **[board目录](https://zhida.zhihu.com/search?content_id=272990164&content_type=Article&match_order=1&q=board%E7%9B%AE%E5%BD%95&zhida_source=entity)** 则包含了特定目标板的代码。

因此当我们新增加一款目标板时，主要的工作就可以 **集中在board** 相关的代码，只要不是太新的cpu型号，arch和cpu相关代码在uboot官方版本中都已经被支持。

## 2.2 添加board的基本步骤

当我们开始一个全新的项目时，总是希望能先让系统能运行起来，然后再在此基础上为其添加更多的feature，这个只包含能让系统运行所需模块的系统，叫做 **最小系统** 。cpu能正常运行包含以下几个条件：  
（1）具有合适的 **电源和时钟**  
（2）程序代码被 **加载到合适的位置** ，cpu能够正常获取指令  
（3）具有cpu用于数据操作的 **可读写内存**  
（4）cpu被 **release reset**

当然对于需要支持中断的系统，则还需要包含 **中断控制器** ，而对于像操作系统这种需要通过定时器驱动进程切换的系统，则显然还需要 **timer定时器** 。为了达到以上目的，我们添加board的基本步骤大概如下：  
（1）在board目录下为 **新board添加一个目录** ，用于存放board特定的代码  
（2）为新目录 **添加Kconfig配置选项和Makefile编译选项** ，将其添加到编译系统中  
（3）在Kconfig中为该board定义一个 **配置项** ，并为该配置项添加其所支持的特性，如cpu架构、cpu型号等  
（4）为新board增加一个配置相关的 **头文件和编译所需的defconfig** 文件，用于该board相关的选项配置  
（5）在board目录下添加适当的文件，并实现 **必要的接口**

## 2.3 添加自己的开发板

### 2.3.1 新增config文件

那必须 **能抄就抄** 啊，找相近的config抄。先在 configs 目录下创建默认配置文件， **复制** mx6ull\_14x14\_evk\_emmc\_defconfig，然后重命名为 mx6ull\_alientek\_emmc\_defconfig，命令如下：

```
cd configs

cp mx6ull_14x14_evk_emmc_defconfig mx6ull_alientek_emmc_defconfig
```

然后修改里面的一些标识字符串命名。

### 2.3.2 添加头文件

在目录 include/configs 下添加 I.MX6ULL-ALPHA 开 发 板 对 应 的 头 文 件 ， 复 制

include/configs/mx6ullevk.h，并重命名为 mx6ull\_alientek\_emmc.h，命令如下：

```
cp include/configs/mx6ullevk.h mx6ull_alientek_emmc.
```

然后修改里面的一些标识字符串命名。

根据需求对**.h头文件** 里面的宏进行修改和增减

- 宏 PHYS\_SDRAM\_SIZE 就是板子上 DRAM 的大小
- 宏 CONFIG\_DISPLAY\_CPUINFO，uboot 启动的时候可以输出 CPU 信息。
- 宏 CONFIG\_DISPLAY\_BOARDINFO，uboot 启动的时候可以输出板子信息。
- CONFIG\_SYS\_MALLOC\_LEN 为 malloc 内存池大小
- 宏 CONFIG\_BOARD\_EARLY\_INIT\_F，这样 board\_init\_f 函数就会调用board\_early\_init\_f 函数
- 宏 CONFIG\_BOARD\_LATE\_INIT，这样 board\_init\_r 函数就会调用board\_late\_init 函数。
- 宏 CONFIG\_BOOTCOMMAND，此宏就是设置环境变量 [bootcmd](https://zhida.zhihu.com/search?content_id=272990164&content_type=Article&match_order=1&q=bootcmd&zhida_source=entity) 的值。
- 宏 CONFIG\_SYS\_LOAD\_ADDR 表示 linux kernel 在 DRAM 中的加载地址
- 宏 CONFIG\_SYS\_HZ 为系统时钟频率，这里为 1000Hz。
- 宏 CONFIG\_STACKSIZE 为栈大小，这里为 128KB。
- 宏 CONFIG\_NR\_DRAM\_BANKS 为 DRAM BANK 的数量

### 2.3.3 板级文件夹

uboot 中每个板子都有一个对应的文件夹来存放 **板级文件** ，比如开发板上外设驱动文件等等。NXP 的 I.MX 系列芯片的所有板级文件夹都存放在 board/freescale 目录下，在这个目录下有个名为 mx6ullevk 的文件夹，这个文件夹就是 NXP 官方 I.MX6ULL EVK 开发板的板级文件夹。复制 mx6ullevk，将其重命名为 mx6ull\_alientek\_emmc，命令如下：

```
cd board/freescale/
cp mx6ullevk/ -r mx6ull_alientek_emmc
```

进 入 mx6ull\_alientek\_emmc 目 录 中 ， 将 其 中 的 mx6ullevk.c 文 件 重 命 名 为mx6ull\_alientek\_emmc.c，命令如下：

```
cd mx6ull_alientek_emmc
mv mx6ullevk.c mx6ull_alientek_emmc.c
```

修改对应的Makefile文件、cfg文件、Kconfig文件

### 2.3.4 dts文件

以下是 **自定义dtb文件** 的方法：

（1）在arch/arm/dts/目录下添加dts文件test-board-minimal.dts，并在目录的Makefile中添加以下编译选项

```
dtb-$(CONFIG_TARGET_TESTBOARD) += test-board-minimal.dtb
```

（2）在配置文件configs/testboard\_defconfig中指定该dtb为默认dtb文件，并使能uboot的设备树支持

```
CONFIG_DEFAULT_DEVICE_TREE="test-board-minimal"
CONFIG_OF_CONTROL=y
CONFIG_OF_SEPARATE=y
```

## 2.4 适配修改举例

### 2.4.1 LCD点灯修改

一般 uboot 中修改驱动基本都是在 **xxx.h 和 xxx.c** 这两个文件中进行的，xxx 为板子名称，

比如 mx6ull\_alientek\_emmc.h 和 mx6ull\_alientek\_emmc.c 这两个文件。

一般修改 LCD 驱动重点注意以下几点：

1. LCD 所使用的 GPIO，查看 uboot 中 LCD 的 IO 配置是否正确。
2. LCD 背光引脚 GPIO 的配置。
3. LCD 配置参数是否正确

### 2.4.2 驱动修改

例如网卡等跟目标板子有差异的 **硬件驱动** 。

### 2.4.3 打印信息和环境变量修改

一些启动时 **打印的板子信息** 如果不对需要进行修改。

uboot 中有两个非常重要的环境变量 **bootcmd** 和 **[bootargs](https://zhida.zhihu.com/search?content_id=272990164&content_type=Article&match_order=1&q=bootargs&zhida_source=entity)** ，如果需要也应该修改

bootargs里面：

- console设置linux终端和波特率
- root设置根文件系统位置
- rootfstype指定根文件系统类型

uboot 移植到此结束，简单总结一下 uboot 移植的过程：

1. 不管是购买的开发板还是自己做的开发板，基本都是参考半导体厂商的 **dmeo 板** ，而半导体厂商会在他们自己的开发板上移植好 uboot、linux kernel 和 rootfs 等，最终制作好 BSP包提供给用户。我们可以在官方提供的 BSP 包的基础上添加我们的板子，也就是俗称的移植。
2. 我们购买的开发板或者自己做的板子一般都不会原封不动的照抄半导体厂商的 demo板，都会 **根据实际** 的情况来做修改，既然有修改就必然涉及到 uboot 下驱动的移植。
3. 一般 uboot 中需要解决 **串口、NAND、EMMC 或 SD 卡、网络和 LCD 驱动** ，因为 uboot的主要目的就是启动 Linux 内核，所以不需要考虑太多的外设驱动。
4. 在 uboot 中添加自己的 **板子信息** ，根据自己板子的实际情况来修改 uboot 中的驱动。

> 后记：  
> 本篇作为uboot入门的结尾， **写的比较空一些** ，也可能没做过实际的工作讲出来不知道难点和技巧在哪里，不过也写了这么多。  
> 我经常问人一个问题： **怎么样才能提高技能** ？一个答案是 **领导给你一个能提高技能的活干** 。细想真是如果没做过，即便是学习了也是不能够太深入的理解，被内行一问便知。另一个回答是 **有高人带** ，但是说实话除了应届生，大厂里面真没多少人愿意带人，估计都是精力有限 **只带嫡系** ，估计还是多想想怎么成为嫡系更重要。  
> 笔者也不是什么活都干过，很多方面也不是专家，但是这里讲的作为uboot入门这个系列 **应该够用** 了。至少可以让干啥的时候能快速的学习找到对应的解决方案，在干中继续学习吧。

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

编辑于 2026-04-13 11:20・上海[26年4月，NAS选购指南丨绿联、群晖、极空间、威联通、华为丨一网打尽，各种玩法丨PT下载、影音、公网IP、硬盘丨NAS存储清单选购](https://zhuanlan.zhihu.com/p/343824994)

[

大家好，我是加勒比考斯！考斯之前是媒体记者，后面是NAS从业人员，知道行业最深内幕！ \[图片\] NAS动态篇31、...

](https://zhuanlan.zhihu.com/p/343824994)