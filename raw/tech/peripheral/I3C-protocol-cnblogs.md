# I3C协议详解

> 来源: 博客园 (www.cnblogs.com/linhaostudy)
> 原URL: https://www.cnblogs.com/linhaostudy/p/19625228
> 收集时间: 2026-05-01

I3C最初的设计目的是为移动设备创建一个能够使用多个传感器的单一接口。随着现代化移动设备对于传感器数量的增加以及对性能的提高，I2C和SPI已经达到了他们所能支持的临界点，而I3C的出现就是为了解决这一问题，I3C可以在同一根主线上支持更多的传感器设备，而且不会因为要支持中断或睡眠模式而增加额外的逻辑信号。I3C可以在更低功耗的情况下提供更快的传输速率。

## 一、简述

I3C（Improved Inter Integrated Circuit）升级版的集成电路总线，同样两根总线：SDA和SCL。I3C接口致力于改善I2C的性能，并提供向后兼容，即兼容I2C。

名词解释：
- SDR：Single Data Rate，单一数据传输模式
- HDR：High Data Rate，高速数据传输模式
- Main Master：当前被配置为I3C总线的主设备
- Secondary Master：可以作为I3C的主设备，但当前被配置为从设备
- Current Master：此时此刻是主设备

## 二、连接方式

SDR模式是I3C总线上的默认通讯模式，也是从Current Master向Slave传输私有消息的主要模式。I3C SDR模式与传统的I2C协议非常相似，因此I3C与许多I2C设备可以并存。

如何区分是I2C的数据包还是I3C的：
- 从I3C master到I2C的数据包会被I3C slave忽略
- I3C Master到I3C Slave的数据包一般不会被I2C Slave检测到，因为I2C的低通滤波器会阻止I3C较高的时钟进入设备内部电路

## 三、通讯协议

### 1、SDR动态分配地址

- I3C可以为所有的I3C从设备动态分配7-bit address
- 在I3C从设备中会有两个standardized characteristics register和内部的48-bit临时ID去协助此过程
- Bus Characteristic Register：描述I3C兼容设备在动态地址分配和通用命令代码中使用的角色和功能
- Device Characteristic Register：描述I3C兼容的设备类型（加速计、陀螺仪等）
- 仍然支持I2C的静态地址：传统I2C设备需要提供的只读寄存器Legacy Virtual Register，用来描述该I2C设备的功能

### 2、主设备发送的地址

- 发送静态地址：持有该地址的I2C从设备响应
- 发送7位的0x7E：此地址为广播地址，所有I3C从设备都会响应，所有I2C从设备都不会响应
- 发送动态地址：持有该地址的I3C从设备响应

I3C Slave设备不需知道自身处在I2C总线上或是I3C总线上。如果其自身有一个I2C静态地址，那么它可以一直使用这个地址，直到被赋予一个动态地址。一旦被赋予了动态地址，它就必须作为一个I3C Slave设备工作。

### 3、I3C从设备的职责

- 紧随START或Repeated START条件，尝试对I3C总线上的广播地址或指向自己的地址进行响应
- 如果一条消息指向Slave的动态地址，那么Slave可以ACK或NACK这个地址头
- 如果ACK，则以SDR模式处理这条消息
- 如果NACK，则抛弃接下来的任何数据，等待下一个START或Repeated START
- I3C Slave必须处理所有可以应用的CCC（Common Command Code）命令
- 如果CCC命令改变了总线的模式，支持HDR的Slave可以选择进入HDR，不支持HDR的设备则启动HDR退出监测器

### 4、公共传输格式

- 对应的start和stop跟I2C时序完全相同
- start + 7bit(地址) + 1bit(读写位) + 1bit(应答位/非应答)
- 当地址头是个可仲裁的地址时，从设备可以向主设备发送三种请求：
  - **In-Band中断请求**：等同于使用额外的中断总线请求Master的介入控制，必须使用RnW位置1的设备动态地址
  - **Secondary Master请求**：除非I3C Slave标记为支持此功能，否则不应请求这个功能，必须使用RnW位置0的地址头
  - **热接入请求**：只有当I3C总线可操作时，I3C Slave才可以发出此请求，使用的头地址必须为特殊的7位0x02 Hot-Join

### 5、特性

**带内中断**

I3C允许从设备启动带内中断，这对于I2C和SPI设备来说都需要一根额外的信号线才能实现。当总线处于空闲状态时，从设备可以通过中断机制发送一个"START"信号，然后主设备会为从设备提供一个时钟信号，从设备可以通过主设备提供的分配地址将设备驱动到总线上来启动中断。如果此时有多个从设备尝试启动中断，则地址最小的从设备获得此次仲裁。

**热接入**

I3C允许从设备在总线配置完成之后再连接到总线上，即热接入特性。连接在同一总线上的传感器可以暂时关闭，直到需要唤醒的时候才激活唤醒。

## 四、I3C与I2C的区别

| 特性 | I2C | I3C |
|------|-----|-----|
| 标准组织 | Philips/NXP | MIPI Alliance |
| 兼容性 | 原生I2C | 向下兼容I2C |
| 最高速率 | 3.4 MHz (HS) | 12.5 MHz (SDR) |
| 驱动方式 | 开漏 | 开漏+推挽 |
| 动态地址 | ❌ | ✅ |
| 带内中断 | ❌ | ✅ |
| 热插拔 | ❌ | ✅ |
| 功耗(1KB数据) | ~100 μJ | ~30-50 μJ |

## 五、多速率工作模式

| 模式 | 全称 | 速率 | 特点 |
|------|------|------|------|
| SDR | Single Data Rate | 最高12.5 Mbps | 基础模式，兼容I2C时序 |
| HDR-DDR | High Data Rate - Double Data Rate | 最高25 Mbps | 数据在时钟上升沿和下降沿均传输 |
| HDR-TSP | High Data Rate - Ternary Symbol Pulse | 最高96 Mbps | 使用三元符号脉冲编码 |
| HDR-TSL | High Data Rate - Ternary Symbol Level | 最高24 Mbps | 另一种三元编码模式 |

> HDR模式需要纯I3C设备支持，传统I2C设备只能在SDR模式下工作。

## 六、对比 UART/SPI/I2C/I3C

| | UART | SPI | I2C | I3C |
|---|------|-----|-----|-----|
| 通信方式 | 全双工异步串行 | 全双工同步串行 | 半双工同步串行 | 同步串行 |
| 信号线 | RX、TX、GND | SDO、SDI、SCLK、SS | SDA、SCLK | SDA、SCLK |
| 从属关系 | 不存在从属关系 | 存在主从设备，片选信号选择从机 | 存在主从设备，地址（静态）选择从机 | 存在主从设备，地址（动态、广播）选择从机 |
| 通信速率 | 最大115200bps | 不定，最高几M | 400K，最高1M | SDR 4/8.8M，HDR 20M以上 |
| 单次传输 | 5-8bit | 8bit | 8bit | 8bit |
| clk | 事先约定好 | 可调 | 可调 | 可调 |

## 七、代码相关

参考：https://blog.csdn.net/u010787514/article/details/88557561
