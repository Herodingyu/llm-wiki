---
title: "单片机通信中SPI、I2C、UART三种总线有什么异同"
source: "https://zhuanlan.zhihu.com/p/584940276"
author:
  - "[[归藏新能源汽车软件开发]]"
published:
created: 2026-05-02
description: "发布12小时以后，收藏30+，点赞2，收藏点赞比达到了惊人的15，再创历史新高。朋友们，如果对您有帮助，别光收藏，顺手点个赞呗！ヾ(≧∇≦谢谢≧∇≦)ノ ………………更新线……………… 基本概念通信按基本分类可…"
tags:
  - "clippings"
---
[收录于 · 智能&节能汽车技术](https://www.zhihu.com/column/c_1596885984758706176)

546 人赞同了该文章

### 发布12小时以后，收藏30+，点赞2，收藏点赞比达到了惊人的15，再创历史新高。

朋友们，如果对您有帮助，别光收藏，顺手点个赞呗！ヾ(≧∇≦谢谢≧∇≦)ノ

………………更新线………………

### 基本概念

通信按基本分类可分为并行通信和串行通信。按照信号的传输方向可以分为单工通信、半双工通信、全双工通信。

![](https://pica.zhimg.com/v2-876971418681badeffebe771c1a93b2c_1440w.jpg)

单工通信数据只能从发动机发送到接收机,不允许从接收机发送到发送机。

![](https://pic3.zhimg.com/v2-59fa629b50032387c9fb0daa05b1b40a_1440w.jpg)

双工通讯数据可以在发动机和接收机之间相互传输，但是不能同时发送。

![](https://picx.zhimg.com/v2-5904b23a0dbadb56d7e84a446252d55d_1440w.jpg)

全双工通信允许数据在发动机和接收机之间双向传输而且数据可以同时发送。

- **[SPI](https://zhida.zhihu.com/search?content_id=218121250&content_type=Article&match_order=1&q=SPI&zhida_source=entity)** (Serial Peripheral Interface： **串行外设接口**)，是 [Motorola](https://zhida.zhihu.com/search?content_id=218121250&content_type=Article&match_order=1&q=Motorola&zhida_source=entity) 公司提出的一种 **同步串行数据** 传输标准。
- **I2C** (INTER IC BUS： **IC之间总线**)，也常写成IIC，是由 [PHILIPS](https://zhida.zhihu.com/search?content_id=218121250&content_type=Article&match_order=1&q=PHILIPS&zhida_source=entity) 公司开发的 **两线式串行总线** ，用于连接微控制器及其外围设备，是微电子通信控制领域广泛采用的一种总线标准。
- **[UART](https://zhida.zhihu.com/search?content_id=218121250&content_type=Article&match_order=1&q=UART&zhida_source=entity)** (Universal Asynchronous Receiver Transmitter： **通用异步收发器**)，是电脑硬件的一部分，它把将要传输的资料在串行通信与并行通信之间加以转换，UART通常被集成于其他通讯接口的连接上。 **UART即我们通常说的“串口”。**
![](https://pic2.zhimg.com/v2-8a67a6d88f0f94f2868722c797da7eb7_1440w.jpg)

三种通信总线的特点

**对单片机，通信是与传感器存储器芯片外围控制芯片的信息交换。**

### UART通信总线

**UART是一通用串行异步通信总线。该总线有两条数据线可以实现全双工的发送和接收，常用于单片机与单片机或外部辅助设备之间的通信。**

UART发送数据时先发低位后发高位。当总线处于空闲状态时，线路保持高电平。以发送数据0x96为例，发送数据前会先发一个0，让总线从高电平变成低电平，提醒数据接收方做好准备，然后依次从低位到高位发送八位数据。传输完成后，会发一个1，让总线重新回到高电平。

![](https://pic4.zhimg.com/v2-417de584670f98cf8dd913cb3317e729_1440w.jpg)

UART数据发送过程中，包含8位数据位，一位起始位，一位停止位。一共10位。如若需要发送新的数据，则重新从起始位开始。

UART属于异步通讯，这意味着没有时钟信号，取而代之的是在数据包中添加开始和停止位。这些位定义了数据包的开始和结束，因此接收UART知道何时读取这些数据。

当接收UART检测到起始位时，它将以特定波特率的频率读取。波特率是数据传输速度的度量，以每秒比特数（bps）表示。两个UART必须以大约相同的波特率工作，发送和接收UART之间的波特率只能相差约10％。

### I2C通信总线

I2C是一种两线式、串行、半双工同步通信总线，可以挂载多个参与通信的器件，常用于板内通讯，比如单片机与外围芯片之间短距离、低速的信号传输。

![](https://pic4.zhimg.com/v2-171917b80eaa1917d86610880d15058f_1440w.jpg)

I2C寻址方式

I2C总线有两条线，一条 [SCL](https://zhida.zhihu.com/search?content_id=218121250&content_type=Article&match_order=1&q=SCL&zhida_source=entity) 时钟线用于时钟同步，一条 [SDA](https://zhida.zhihu.com/search?content_id=218121250&content_type=Article&match_order=1&q=SDA&zhida_source=entity) 数据线，用于数据传输。I2c总线能够挂载多个器件且支持多主机模式。也就是说总线上任何一个器件都可以作为主机，但是受限于只有一根数据线，同一时刻只能有一个主机。即拥有该时刻下总线的控制权，也就是发起和结束一次通信的权利。而从机只能被主机呼叫。

在I2C总线下每个器件都有一个7位的ID地址。如上图，当MCU为主机，呼叫 [E2PROM](https://zhida.zhihu.com/search?content_id=218121250&content_type=Article&match_order=1&q=E2PROM&zhida_source=entity) 时，会向总线先发一个0X31，找到E2PROM。

**信号发送原则：** 从高位到低位依次发送。

当总线空闲时，时钟总线和数据总线均保持高电平，当主机要传输数据时，会先将数据总线的电平拉低，此时数据线上这个从高到低的跳变沿就是起始位。接下来就是进行器件寻址。对sc低电平时依次发送七位地址位0x31.发送完毕后，sd a会发送一个读写指示位。高电平表示要请求数据。主机发送完以上数据从机如果成功接收，会发送一个应答位到总线上。

![](https://picx.zhimg.com/v2-c8ad0370dcf44ac43c69f38f24821539_1440w.jpg)

寻址过程

![](https://pic2.zhimg.com/v2-c21b969ce87b4000c680719d437b6d19_1440w.jpg)

数据发送过程

数据发送过程与寻址过程类似。值得注意的是，当8位数据发送完成后需要从机有一个应答位才能进行下一个字节的传输。当所有数据传输完成后，主机要把SCL线拉到高电平，把SDA数据线从低电平拉到高电平。这个由低到高的跳边沿表示了停止位。

### SPI通信总线

SPI串行外围设备接口对，是一种高速全双工同步通信总线。常用于单片机和EEPROM、FLASH、实时时钟、数字信号处理器等器件的通信。他主要是主从方式通信，通常只有一个主机和数个从机。

SPI总线有四根线。

[SCLK](https://zhida.zhihu.com/search?content_id=218121250&content_type=Article&match_order=1&q=SCLK&zhida_source=entity) ：时钟信号，由主机产生；

[MOSI](https://zhida.zhihu.com/search?content_id=218121250&content_type=Article&match_order=1&q=MOSI&zhida_source=entity) ：主机给从机发送指令或数据的通道；

[MISO](https://zhida.zhihu.com/search?content_id=218121250&content_type=Article&match_order=1&q=MISO&zhida_source=entity) ：主机读取 从机状态或数据的通道；

CS：从机片选使能信号。

![](https://picx.zhimg.com/v2-ae3f60fb4c1f623b3ec88dbfa0a992b7_1440w.jpg)

在同一时刻，主机只能与一个从机进行通信。当有多个从机时，需要用片选使能信号，将对应的从机CS接口电平拉高或拉低（取决于片选使能信号是高有效还是低有效）

![](https://picx.zhimg.com/v2-7cc01d07bafd5d194cf8b45800443475_1440w.jpg)

**信号发送原则：** 从高位到低位依次发送。没有开始位、结束位、应答位，规则比较简单。

SCLK由高电平跳变到低电平时进行数据输出，由低电平跳变到高电平时进行数据采样。

![](https://pic4.zhimg.com/v2-a06ca95231565067596fa274db59c07b_1440w.jpg)

CPOL时钟极性：

CPOL=0，SCLK空闲状态为低电平；

CPOL=1，SCLK空闲状态为高电平。

CPHA时钟相位：

CPHA=0，每个周期的第一个跳边沿采样；

CPHA=1，每个周期的第一个跳边沿输出。

SPI通讯无起始位和停止位，因此数据可以连续流传输而不会中断；没有像I2C这样的复杂的从站寻址系统，数据传输速率比I2C更高（几乎快两倍）。独立的MISO和MOSI线路，可以同时发送和接收数据。

但是SPI使用四根线（I2C和UART使用两根线），没有信号接收成功的确认（I2C拥有此功能），没有任何形式的错误检查。

我是知乎 ，一枚汽车研究员，码字不易，您的支持是我更新的最大动力，如果对您有帮助，欢迎关注、点赞！

编辑于 2022-11-24 15:48・浙江[25年毕业 ic还能入吗?](https://www.zhihu.com/question/600773376/answer/49206663649)

[我成都某双非院校的电子信息毕业生，现在在一家AI的公司专注于riscv cpu的验证工作，回想当初快毕业了，对自己...](https://www.zhihu.com/question/600773376/answer/49206663649)