# DDR基础知识点汇总

> 来源: 博客园 (www.cnblogs.com/sky-heaven)
> 原URL: https://www.cnblogs.com/sky-heaven/p/15948268.html
> 收集时间: 2026-05-01

## 文档推荐

- ddr3/4等协议: JESD79-3F.pdf
- 高手进阶，终极内存技术指南——完整.pdf
- 理解DRAM电路结构和时序参数: https://linux.codingbelief.com/zh/memory/dram/dram_storage_cell.html

## DDR颗粒的电路图来源

可以去网站搜索镁光DDR4 SDRAM关键词。找出micron DDR4 SDRAM datasheet.pdf，点击相关链接。网上很多图非常不清楚，下面给一张DDR3和DDR4的高清图。

## DDR3-1866控制器/PHY/颗粒之间的带宽关系

举例，DDR3-1866，意味着芯片与颗粒之间的传输速率是1866bps（单指一根DDR数据信号线，一般DDR3芯片引脚是32bit），芯片PHY的DDR管脚信号线对应的时钟频率是1866/2=933MHz，因为上下边沿采样原理。

假设芯片接口，DDR数据位宽支持32bit，那么控制器如果是128bit数据位宽，那么时钟频率是=（1866*32）/ 128 = 466MHz。

## channel > DIMM > rank > chip > bank > row/column

- channel（对应多个DDR控制器）> DIMM（内存插槽）
- > rank（一次访问位宽决定，也成物理bank）
- > chip（1个chip大多是4bit/8bit/16bit等，组成一个rank）
- > bank（颗粒里的logic-bank，DDR3一般对应8个bank存储体）
- > row/column

## DDR页和行的概念理解

- DDR logic bank的row就是行，对应行地址选中等。
- DDR页的概念，是针对刷新或者访问来说的，举例，一个rank可能有4个chip组成，一个chip里可能有8个bank，每一个bank有N个行。页指的是一个rank里每个chip，所有bank的一个行地址；注意不是一行，是多行，行数是chip数目*bank数目。
- 所以，DDR页，可以讲为一个rank里每个chip的行地址
- （ps：在一个rank里，每个chip的地址是相同的。因为多个chip组成一个总数据位宽。DDR接口的cs信号，虽然叫chip select，其实是rank（一组chip）的 select）。

## DDR3 8Bit数据预取技术的理解

- SDRAM最开始是时钟下降沿采样，数据传输速率和频率是1:1关系，即一个周期可传输1bit数据；
- DDR1，采用时钟双边沿采样，即上升沿、下降沿都采样。一个时钟周期可传输2bit数据，这个时候，就叫预取2bit技术了。
- DDR2，预取4bit。
- DDR3，预取8bit。举例，DDR3-800内存的存储核心频率其实仅有100MHz，其输入/输出时钟频率为400MHz，利用双边沿采样技术，有效数据传输频率则为800MHz。

一般，协议里称为8n prefetch。所以一个DDR3 16bit SDRAM内存颗粒，其一次读写访问的数据量是8*16=128bit。

## DDR burst相关概念

BL，是burst length。对应预取bit数目，DDR3对应的BL是8
BC，是burst chop，中文理解是burst剁开切开，是为了兼容DDR2的burst length为4的情况。

## DDR SDRAM的时序参数和读写访问过程

DDR2-800内存的标准时序：5-5-5-18
DDR3-800内存的标准时序则达到了6-6-6-15
DDR3-1066为7-7-7-20
DDR3-1333更是达到了9-9-9-25

这4个数字的含义依次为：
1. CAS Latency（CL值）内存CAS延迟时间
2. RAS－to－CAS Delay（tRCD），代表内存行地址传输到列地址的延迟时间
3. Row-precharge Delay（tRP），代表内存行地址选通脉冲预充电时间
4. Row-active Delay（tRAS），代表内存行地址选通延迟

三种寻址情况：
- **页命中（PH，Page Hit）**：要寻址的行与L-Bank是空闲的。总耗时为tRCD+CL
- **页快速命中（PFH）**：要寻址的行正好是前一个操作的工作行。总耗时仅为CL
- **页错失（PM，Page Miss）**：要寻址的行所在的L-Bank中已经有一个行处于活动状态。总耗时为tRP+tRCD+CL

## 计算DDR容量的方法

由图可以归纳出：
1. bank有8个；对应BA[2:0]
2. 行地址有15bit；列地址有10-3=7bit（其中低3bit不会用于列寻址）
3. 每个bank的数据量 = 行 * 列 * 单元存储bit数 = 2^15 * 2^7 * 128bit = 512Mbit
4. 内存颗粒的容量 = 8 * 512bit = 4Gbit = 512MB

## DDR控制器架构

DDR控制器功能简介：
1. 对DDR存储颗粒进行初始化
2. AXI等总线简单读写，和DDR存储颗粒复杂的读写时序，做相互转换
3. 控制器要产生DDR颗粒需要的周期性的刷新指令，不需要用户的干预
4. DDR控制器接收的请求，一般没有顺序性，访问DDR颗粒的数据传输中，存在大量非数据的传输，即保证DDR颗粒时序的命令配置信息传输。会导致DDR带宽利用率低。因此，出现指令调度和重排序设计。

## DDR自动刷新和自刷新

DDR的最小存储单元电路形式是电容，是通过充放电，实现0,1值存储。如果长时间维持1值，会因为电路漏电特性，把电容里的电荷释放掉。

所以出现自动刷新概念，把DDR里的数据再次充电刷新一次，目的是保留DDR存储值。

根据协议定义，可知bank里的一行最大自动刷新间隔是7.8us；一个bank最大自动刷新间隔是64ms。由此，常见设计，一个bank的行数是8192。因为协议推导出的最大bank行数=64ms/7.8us=8205。

- 自动刷新是指控制器必须参与发起每一个自动刷新请求。适合正常工作的时候。
- 自刷新是指控制器只发起刷新开始和结束两个请求。适合休眠，DRAM颗粒自己负责刷新操作。
- 预充电是针对一个bank或者所有bank的一行的操作；是伴随读写命令操作之后执行的。
- 刷新是同时对所有bank的所有行操作。

## ZQC和ODT意义

- DDR3新增管脚ZQ，接高精度240欧姆电阻。意义是提供精准电阻参考，该电阻对芯片内温度不敏感。ZQC，就暗示ZQ电阻的calibration校准。
- ODT，是利用ZQ电阻值，实现精确的阻抗匹配。保证DDR PHY + PCB走线 + DDR SDRAM这一个系统数据通路的信号完整性，比如解决信号反射问题等。
- ZQCL主要用于系统上电初始化和器件复位，一次完整的ZQCL需要512个时钟周期。
- ZQCS在正常操作时跟踪连续的电压和温度变化，ZQCS需要64个时钟周期。

## Write Leveling是什么？

Write Leveling的功能是调整DRAM颗粒端DQS信号和CLK信号边沿对齐。

只有使用了fly-by的情况下需使能write leveling。

所谓的fly-by 布线，指地址、命令和时钟的布线依次经过每一颗DDR memory芯片。而dq和dqs作了点到点的连接。fly-by 结构相对于T布线，有助于降低同步切换噪声（Simultaneous Switching Noise）。
