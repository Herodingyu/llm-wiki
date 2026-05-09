!\[cover\_image\](https://mmbiz.qpic.cn/sz\_mmbiz\_jpg/g68z8egLoSqAHXxFp3SHGsjbrN37VG9ahRP2YU7U3UFNlviasvTpDdKUeteLrYQ0SY7ooDOWaUJc1 NhQwyVaWRWmkmHrePWiabvWomcXn09LA/0?wx\_fmt=jpeg)


# SoC（1）：浅谈外设子系统 

Original  alltowine  alltowine  [芯片系统成长记](javascript:void\(0\);) *2026年5月6日 17:40* * 湖北 *

在小说阅读器读本章

去阅读

在小说阅读器中沉浸阅读

很多人第一次看 SoC 架构图，会把注意力放在 CPU、GPU、DDR、Cache、NoC 这些“高大上”的模块上。相比之下，UART、I2C、SPI、GPIO、PWM、Timer、ADC 这些外设看起来像边角料。 

但如果从系统角度看，外设并不是 SoC 的“附属品”，而是 SoC 连接真实世界的入口。CPU 再强，如果不能读取传感器、控制电机、接收网络数据、驱动显示屏、管理电源，它就只是芯片内部一个会执行指令的孤岛。外设子系统的本质，就是让计算核心与外部世界进行可靠、可控、可扩展的交互。 

!\[Image\](https://mmbiz.qpic.cn/sz\_mmbiz\_png/g68z8egLoSqIgVQwvJ9E9aMQYMViboP9icwnD5 NeSG0g9 Tj4 GtbYU3wiaSo3bKRolicaMgH3pycAfqOGOMvz0 XibgJTLRSURBCq0mEM7kf5 RxEOg/640?wx\_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx\_lazy=1#imgIndex=0) 


## 一、SoC 为什么需要外设？ 

我们先不从 UART、SPI 这些名词开始，而从一个最基本的问题开始： 

一个芯片要完成任务，最少需要什么？ 

答案大概是三类能力： 

第一，  计算能力  。比如 CPU、DSP、NPU 负责处理数据。 

第二，  存储能力  。比如 SRAM、Flash、DDR 负责保存代码、数据和状态。 

第三，  交互能力  。也就是和芯片外部的人、设备、环境交换信息。 

前两类能力主要发生在芯片内部，而第三类能力就落在外设子系统身上。 

举个例子，一颗智能门锁芯片需要： 

 读取按键输入，这是 GPIO； 

 读取指纹模组，这是 SPI 或 UART； 

 和蓝牙/Wi-Fi 模块通信，这是 UART、SPI 或 SDIO； 

 控制电机开锁，这是 PWM 或 GPIO； 

 记录日志到 Flash，这是 QSPI 或内部存储接口； 

 低功耗唤醒，这是 RTC、Wakeup GPIO 或电源管理外设。所以外设子系统不是“很多小接口堆在一起”，而是 SoC 面向应用场景的能力集合。 


## 二、外部世界很慢，但系统内部很快 

理解外设设计，先要理解一个矛盾： 

SoC 内部追求高带宽、低延迟、高并发；而外部设备往往低速、异步、不确定。 

CPU 可能运行在 GHz 级别，片上总线可能是几十位、上百位宽，DDR 传输带宽也很高。但一个 I2C 传感器可能只有几百 kHz，一个 UART 串口可能只是几 Mbps，一个机械按键甚至以“毫秒”为单位变化。这就带来几个问题： 

 CPU 不能一直等外设，否则计算资源被浪费。 

 外设数据到来的时间不确定，系统必须能响应异步事件。 

 不同外设速度不同，需要缓冲、握手和协议转换。 

 外设访问系统内存时，要避免破坏一致性和安全边界。所以外设子系统的设计目标，不是简单把接口接到总线上，而是要在“高速确定的片上系统”和“低速不确定的外部世界”之间建立一套秩序。 


## 三、外设子系统通常包含什么？ 

从系统设计角度看，一个外设子系统通常包含四类东西： 


### 1\. 外设控制器 

这是真正实现协议和功能的模块，例如 UART 控制器、SPI 控制器、I2C 控制器、USB 控制器、Ethernet MAC、SD/MMC 控制器、GPIO 控制器、Timer、PWM 等。它们负责把软件的配置转换成真实的引脚波形或数据传输行为。比如 SPI 控制器会根据寄存器配置决定： 

 时钟频率是多少； 

 CPOL/CPHA 模式是什么； 

 一次传输多少 bit； 

 片选信号如何控制； 

 发送和接收 FIFO 如何工作。 


### 2\. 寄存器接口 

CPU 通常不是直接“操作外设电路”，而是通过读写寄存器来控制外设。 

比如软件想通过 UART 发送一个字节，本质上可能只是： 

 把波特率写入配置寄存器； 

 把数据写入发送数据寄存器； 

 等待状态寄存器显示发送完成； 

  必要时响应中断。  所以从软件视角看，外设是一组地址；从硬件视角看，这些地址背后是寄存器、状态机、FIFO 和协议逻辑。 

外设不是孤立存在的，它必须通过总线被 CPU 访问。 


### 3\. 中断与事件机制 

如果 CPU 不断轮询外设状态，例如一直读 UART 状态寄存器看有没有数据，会非常浪费。  更合理的方式是：外设有事件时通知 CPU。  这就是中断。 

例如 UART 收到一个字节后，触发 RX 中断；Timer 到期后，触发定时中断；GPIO 检测到按键下降沿后，触发外部中断。  中断的价值在于让系统从“CPU 主动问”变成“外设主动通知”。  这和现实生活类似：你不会每隔 1 秒打开门看外卖到了没有，而是等门铃响。门铃就是中断。 


### 4\. DMA 与缓冲 

对于高吞吐外设，比如 Ethernet、USB、SDIO、摄像头接口，  如果每个字节都让 CPU 搬运，CPU 会被数据搬运拖垮  。 

这时就需要 DMA。DMA 的作用是让外设和内存之间直接搬运数据，CPU 只负责配置源地址、目的地址、长度、方向和完成中断。 

例如网卡收到一帧数据后，可以通过 DMA 把数据写入内存缓冲区，然后通知 CPU：“包已经放好了，你来处理吧。”  这体现了外设子系统设计里的一个重要原则：  CPU 应该做决策，不应该做重复搬运。 


## 四、外设为什么通常挂在低速总线上？ 

SoC 里通常会有不同层次的总线或互连结构。第一章里提到，系统中既有高性能的数据总线，也有面向寄存器访问的寄存器总线；不同模块根据性能需求接入不同层级。 

外设大多不需要极高带宽，所以常常挂在  低速、低功耗、低复杂度  的外设总线上，例如 APB 这类总线。原因很简单： 

 外设寄存器访问频率低； 

 外设通常不是系统性能瓶颈； 

 低速总线面积更小、功耗更低、时序更容易收敛； 

 把外设从高性能主干上隔离出来，可以降低系统复杂度。  这就像城市道路系统：高速公路负责跨城运输，主干道负责城市通勤，小区道路负责最后几百米。你不会把每个小区门口都直接接到高速公路上。 

在 SoC 里也是一样：CPU、DDR、GPU、NPU 这类高带宽模块走高速互连；UART、GPIO、I2C、Timer 这类外设走低速外设总线。中间可能通过桥接模块完成协议转换。  


## 五、一个例子：从按键点亮 LED 看外设子系统 

我们用一个最简单的例子理解外设子系统：按下按键，点亮 LED。 

这件事看起来简单，但在 SoC 内部会经过一条完整链路。 


### 第一步：GPIO 采样外部电平 

按键连接到芯片引脚。这个引脚进入 GPIO 控制器。 

GPIO 控制器会把这个引脚配置成输入模式，并把外部高低电平同步到芯片内部时钟域。 

这里有一个隐藏问题：外部按键不是芯片时钟产生的，是异步信号。因此 GPIO 内部通常需要同步和去抖，否则可能产生亚稳态或毛刺。 


### 第二步：GPIO 触发中断 

当 GPIO 检测到下降沿，比如按键被按下，就向中断控制器发出请求。 

中断控制器再通知 CPU。 

这样 CPU 不需要一直轮询 GPIO 状态，而是可以在平时执行其他任务，等事件发生再响应。 


### 第三步：CPU 执行中断服务程序 

CPU 进入中断服务程序后，会读取 GPIO 状态寄存器，确认是哪一个引脚触发了中断。 

然后它可能清除中断标志位，避免重复触发。 


### 第四步：CPU 配置 LED 对应的 GPIO 输出 

LED 连接到另一个 GPIO 引脚。CPU 通过总线访问 GPIO 的输出寄存器，把对应 bit 写成 1 或 0。GPIO 控制器再驱动外部引脚电平变化，LED 点亮。这个简单例子里，其实已经包含了外设子系统设计的关键概念： 

引脚复用、GPIO 控制器、寄存器访问、外设总线、中断控制、时钟域同步、软件驱动。所以外设子系统看似简单，实则是软硬件协同最密集的地方之一。 


## 六、外设设计的三个关键问题 


### 1\. 软件如何控制硬件？ 

外设必须暴露清晰的寄存器模型。一个好的外设寄存器设计，应该让软件容易理解、容易配置、容易调试。 

比如状态寄存器要能反映当前状态，控制寄存器要避免一位多义，清中断机制要明确是写 1 清除还是写 0 清除。 

很多芯片 bug 不是出在算法，而是出在寄存器定义含糊，导致驱动工程师和硬件工程师理解不一致。 


### 2\. 数据如何高效流动？ 

低速外设可以由 CPU 直接读写寄存器。但高速外设必须考虑 FIFO 和 DMA。FIFO 解决瞬时速率不匹配问题，DMA 解决大块数据搬运问题。 

比如音频接口 I2S，如果没有 FIFO，CPU 稍微响应慢一点就可能产生音频断裂；如果没有 DMA，CPU 要不断搬运音频采样点，系统负担会很重。 


### 3\. 外设如何不影响系统稳定性？ 

外设连接真实世界，也意味着它更容易面对异常情况。 

例如： 

I2C 从设备无响应； 

 SPI Flash 传输中断； 

 UART 收到乱码； 

 USB 设备热插拔； 

 GPIO 输入毛刺； 

 外部中断风暴； 

 DMA 写错地址。  因此外设子系统设计必须考虑超时、错误状态、复位机制、中断屏蔽、权限隔离和调试可观测性。成熟的外设设计，不只是“能跑”，还要“出错时可恢复、可定位、可隔离”。 


## 七、从架构师视角看外设子系统 

如果你是 SoC 架构师，设计外设子系统时不应该先问“我要放几个 UART”，而应该先问： 

这个 SoC 面向什么应用？ 

 需要连接哪些外部设备？ 

 哪些接口是启动必需的？ 

 哪些外设需要 DMA？ 

 哪些外设需要低功耗唤醒？ 

 哪些外设属于安全域？ 

 哪些外设需要被多个处理器共享？ 

 哪些外设会成为量产测试和调试入口？ 

比如一颗车规 MCU，  CAN、LIN、PWM、ADC、Timer   可能非常关键；一颗 AIoT SoC，  UART、SPI、I2C、I2S、SDIO、USB、Ethernet   可能更重要；一颗安全芯片，则可能更关注 TRNG、Crypto、eFuse、Secure GPIO 和访问权限控制。所以外设子系统不是标准件拼盘，而是产品定义的硬件表达。 


## 八、外设子系统的设计原则 

可以把外设子系统的设计原则总结成四句话。 

第一，  慢设备不要拖慢快系统  。 

 通过桥接、低速总线、FIFO、DMA，把外设和高性能主系统解耦。 

第二，  CPU 不做无意义等待  。 

 用中断代替轮询，用 DMA 代替搬运，让 CPU 负责控制和决策。 

第三，  寄存器就是软硬件契约  。 

 寄存器定义要稳定、清晰、可验证，因为它直接决定驱动开发体验。 

第四，  外设面对真实世界，必须设计异常路径  。 

 协议错误、超时、复位、热插拔、毛刺、中断风暴，都要在架构阶段考虑。 

如果说 CPU 是大脑，存储是记忆，互连是神经网络，那么外设就是 SoC 的感官和手脚。它让芯片能看见、听见、感知、通信、控制和响应。  一个优秀的外设子系统，不是接口数量越多越好，而是能够在目标应用场景下，以合适的成本、功耗、带宽和可靠性，把计算系统连接到真实世界。 

外设子系统设计的难点也正在这里：它既要懂硬件协议，又要懂软件驱动；既要考虑性能，又要考虑低功耗；既要满足功能，又要能处理异常。所以，外设不是 SoC 架构里的边角料。它是芯片真正“有用起来”的地方。

预览时标签不可点

**微信扫一扫赞赏作者**  [ Like the Author ](javascript:;)

Close

**[0人付费](javascript:;)

**

更多

Loading...

Loading...

Close

更多

Name cleared

**微信扫一扫赞赏作者** Like the Author  [Other Amount](javascript:;)

赞赏后展示我的头像

作品

暂无作品

Like the Author

Other Amount

¥

最低赞赏 ¥0

OK

Back

**Other Amount**

更多

赞赏金额

¥

最低赞赏 ¥0

1

2

3

4

5

6

7

8

9

0

.

SoC合集 · 目录 #SoC合集

下一篇  SoC（2）：浅谈互联子系统

Close

更多

搜索「」网络结果

Close

**调整当前正文文字大小

**

更多

100%

​

Comment

暂无留言

1 comment(s)

已无更多数据

[Send Message](javascript:;)

写留言:

[](javascript:; "轻点两下打开表情键盘")[](javascript:; "轻点两下选择图片")

Scan to Follow

继续滑动看下一个

轻触阅读原文

!\[Image\](http://mmbiz.qpic.cn/mmbiz\_png/ibRFNxEJVe1KQXlyyQFTEicX9LPIBN4h4AP1qnybM2v04iaiaLWVrEDhicQBjP8ymoqJMnqK0bKAyTmNyYEzr7HMs3A/0?wx\_fmt=png)

芯片系统成长记

向上滑动看下一个

当前内容可能存在未经审核的第三方商业营销信息，请确认是否继续访问。

[继续访问](javascript:) [Cancel](javascript:)

[微信公众平台广告规范指引](javacript:;)

[Got It](javascript:;)

Scan with Weixin to  
use this Mini Program

[Cancel](javascript:void\(0\);) [Allow](javascript:void\(0\);)

[Cancel](javascript:void\(0\);) [Allow](javascript:void\(0\);)

[Cancel](javascript:void\(0\);) [Allow](javascript:void\(0\);)

× 分析

!\[跳转二维码\](https://mp.weixin.qq.com/s?\_\_biz=MzY0MDYzODg5OQ==&mid=2247483867&idx=1&sn=819678058552485ed2533a42a75049c4&chksm=f0c10b07c7b682112929b55bca0333a2574d1485550e799cb977fed67bfebdb2394c281c6a7d&cur\_album\_id=4504145523100237835&scene=190)!\[作者头像\](http://mmbiz.qpic.cn/mmbiz\_png/ibRFNxEJVe1KQXlyyQFTEicX9LPIBN4h4AP1qnybM2v04iaiaLWVrEDhicQBjP8ymoqJMnqK0bKAyTmNyYEzr7HMs3A/0?wx\_fmt=png)

微信扫一扫可打开此内容，  
使用完整服务

!\[Image\](https://mmbiz.qpic.cn/mmbiz\_png/ibRFNxEJVe1KQXlyyQFTEicX9LPIBN4h4AP1qnybM2v04iaiaLWVrEDhicQBjP8ymoqJMnqK0bKAyTmNyYEzr7HMs3A/300?wx\_fmt=png&wxfrom=18)

芯片系统成长记

已关注

Like

Share

Popular

Comment

:  ，  ，  ，  ，  ，  ，  ，  ，  ，  ，  ，  ，  .     Video  Mini Program  Like  ，轻点两下取消赞  Wow  ，轻点两下取消在看  Share  Comment  Favorite  听过 

可在「公众号 > 右上角  \> 划线」找到划线过的内容

!\[划线引导图\](https://res.wx.qq.com/op\_res/opqv3ix6k9E4e64 ZzO7uIqE3 ZblwIojfmt7u70m59yS1ylFK-hTu6 Ra8V\_LaWQJ1P4 OlUJPdXLfVBtrm3 TwRrw)

OK

, ,

选择留言身份

**Comment

**

暂无留言

1 comment(s)

已无更多数据

[Send Message](javascript:;)

写留言:

[](javascript:; "轻点两下打开表情键盘")[](javascript:; "轻点两下选择图片")

Close

更多

Close

**

SoC合集

**

Details

更多

Loading...

关闭


## 确认提交投诉

你可以补充投诉原因（选填）

确定