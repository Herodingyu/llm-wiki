> 来源: 博客园 | 转自 4k8k.xyz | URL: https://www.cnblogs.com/sky-heaven/p/15948268.html
> 原URL: https://www.cnblogs.com/sky-heaven/p/15948268.html
> 收集时间: 2026-05-01

# DDR 基础知识点汇总

> 来源：博客园 | 转自 4k8k.xyz | URL: https://www.cnblogs.com/sky-heaven/p/15948268.html
> 抓取时间：2026-05-01

## DDR 存储层级结构

channel > DIMM > rank > chip > bank > row/column

- **channel**：对应多个DDR控制器
- **DIMM**：内存插槽
- **rank**：一次访问位宽决定，也成物理bank
- **chip**：1个chip大多是4bit/8bit/16bit等，组成一个rank
- **bank**：颗粒里的logic-bank，DDR3一般对应8个bank存储体
- **row/column**：行/列地址

## DDR3 8Bit 数据预取技术

- SDRAM最开始是时钟下降沿采样，数据传输速率和频率是1:1关系
- DDR1：双边沿采样，预取2bit
- DDR2：预取4bit
- DDR3：预取8bit

举例：DDR3-800内存的存储核心频率其实仅有100MHz，其输入/输出时钟频率为400MHz，利用双边沿采样技术，有效数据传输频率则为800MHz。

## DDR SDRAM 时序参数

DDR2-800内存的标准时序：5-5-5-18
DDR3-800内存的标准时序：6-6-6-15
DDR3-1066为7-7-7-20
DDR3-1333更是达到了9-9-9-25

四个数字的含义依次为：
1. **CAS Latency (CL)**：内存CAS延迟时间
2. **RAS-to-CAS Delay (tRCD)**：行地址传输到列地址的延迟时间
3. **Row-precharge Delay (tRP)**：行地址选通脉冲预充电时间
4. **Row-active Delay (tRAS)**：行地址选通延迟

## 寻址情况

1. **页命中（PH, Page Hit）**：要寻址的行与L-Bank是空闲的，总耗时 = tRCD + CL
2. **页快速命中（PFH, Page Fast Hit）**：要寻址的行正好是前一个操作的工作行，总耗时 = CL
3. **页错失（PM, Page Miss）**：要寻址的行所在的L-Bank中已经有一个行处于活动状态，总耗时 = tRP + tRCD + CL

## DDR 控制器架构

DDR控制器功能：
1. 对DDR存储颗粒进行初始化
2. AXI等总线简单读写，和DDR存储颗粒复杂的读写时序做相互转换
3. 控制器要产生DDR颗粒需要的周期性的刷新指令
4. 指令调度和重排序设计，提高带宽利用率

## ZQC 和 ODT

- **ZQ Calibration**：DDR3新增管脚ZQ，接高精度240欧姆电阻，提供精准电阻参考
- **ODT**：利用ZQ电阻值，实现精确的阻抗匹配，保证DDR PHY + PCB走线 + DDR SDRAM系统数据通路的信号完整性

ZQCL主要用于系统上电初始化和器件复位，需要512个时钟周期。
ZQCS在正常操作时跟踪连续的电压和温度变化，需要64个时钟周期。

## Write Leveling

Write Leveling的功能是调整DRAM颗粒端DQS信号和CLK信号边沿对齐。只有使用了fly-by的情况下需使能write leveling。

fly-by布线：地址、命令和时钟的布线依次经过每一颗DDR memory芯片。而dq和dqs作了点到点的连接。

## 原文链接

https://www.cnblogs.com/sky-heaven/p/15948268.html
