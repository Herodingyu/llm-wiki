> 来源: CSDN | 作者：m0_57493153 | URL: https://blog.csdn.net/m0_57493153/article/details/144533384
> 原URL: https://blog.csdn.net/m0_57493153/article/details/144533384
> 收集时间: 2026-05-01

# DDR Training 详解

> 来源：CSDN | 作者：m0_57493153 | URL: https://blog.csdn.net/m0_57493153/article/details/144533384
> 抓取时间：2026-05-01

## DDR training 出现的原因

1. **信号完整性（Signal Integrity, SI）问题**：随着DDR内存频率的提高，信号完整性问题变得更加突出。高速信号在传输过程中会受到各种因素的影响，如反射、串扰、噪声干扰等，这些问题会导致信号失真，影响数据的正确传输。DDR training通过自适应的机制来补偿这些信号完整性问题，确保数据链路的可靠性。

2. **时钟和数据信号的对齐**：在高速数据传输中，时钟信号和数据信号需要精确对齐以保证数据的正确读取和写入。由于物理布局、走线长度差异等因素，时钟和数据信号可能会有微小的偏差，DDR training通过调整时序来对齐这些信号，以确保数据传输的准确性。

3. **适应不同的物理层设计**：不同的主板设计、内存条设计以及物理层的实现可能会引入不同的信号传输特性。DDR training能够适应这些差异，通过调整参数来优化内存系统的性能。

4. **提高数据传输效率**：DDR内存通过双倍数据速率的传输方式，结合多通道传输和数据校验等技术，提高了数据传输效率和可靠性。DDR training是实现这些技术的关键步骤之一。

## DDR training sequence

为了保证稳定且可靠的内存访问，写入和读取的眼图（eye diagram）的宽度是一个关键因素。眼图的位置取决于两个主要参数：LCDL（Load Command Delay Line，负载命令延迟线）的值以及VREF（参考电压）的设置。

写入和读取数据眼图训练用于通过改变LCDL的值（结合初始计算和编程的VREF设置）来找出最佳的眼图位置。

VREF训练用于确定一个VREF值的范围，在该范围内内存接口（写入和读取）是稳定的，并进一步确定最佳的写入和读取眼图位置。

### 训练步骤

1. **CS Training**: 目的是对齐CS_N和CK；在发送cmd后进入CS Training Mode，通过Delay CS_N timing以达到和CK对齐

2. **CA Training**: 目的是对齐CA和CK，在发送cmd后进入CA Training Mode，通过Delay CA timing以达到和CK对齐

3. **ZQ Calibration**：每个DRAM都包含一个称为DQ校准控制块的特殊模块和一个ZQ引脚，该引脚连接有一个外部精密（±1%）240Ω电阻。这个外部精密电阻是"参考"电阻，它在所有温度下都保持在240Ω。在初始化期间发出ZQCL命令时，DQ校准控制块被激活，并产生一个调谐值。然后，该值被复制到每个DQ的内部电路中。

4. **DLL(Delay Lock Loop)**

## 原文链接

https://blog.csdn.net/m0_57493153/article/details/144533384
