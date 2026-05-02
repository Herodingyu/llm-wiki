---
title: "SOC低功耗: AVS与DVFS"
source: "https://zhuanlan.zhihu.com/p/1923053824836351324"
author:
  - "[[Waldeinsamkeit用功不必太猛，但求有恒]]"
published:
created: 2026-05-02
description: "AVS由于工艺，温度，老化程度等原因，每个器件满足性能所需要的最小电压是动态变化的。AVS（Adaptive Voltage Scaling）是一种动态调整供电电压的技术，通过为每类器件分配其所需的最小电压，在满足性能需求的同时…"
tags:
  - "clippings"
---
[收录于 · SOC学习](https://www.zhihu.com/column/c_1792243028209037312)

29 人赞同了该文章

## AVS

由于工艺，温度，老化程度等原因，每个器件满足性能所需要的最小电压是动态变化的。AVS（Adaptive Voltage Scaling）是一种动态调整供电电压的技术，通过为每类器件分配其所需的最小电压，在满足性能需求的同时最小化功耗。

典型的AVS结构如图所示：

![](https://pic3.zhimg.com/v2-ebecc5ad1be6d2dce4a48cba722d952c_1440w.jpg)

如何获取所需的最小电压可以通过步进的方式，比如一开始VDD是1V，CORE通过 [I2C](https://zhida.zhihu.com/search?content_id=259735349&content_type=Article&match_order=1&q=I2C&zhida_source=entity) 通知 [PMIC](https://zhida.zhihu.com/search?content_id=259735349&content_type=Article&match_order=1&q=PMIC&zhida_source=entity) 下降0.1V，等个1ms看看PVT是否报错。如果不报，CORE通知PMIC再降0.1V，这时候就是0.8V，CORE再等个1ms看看PVT是否报错。如果这时候报错，就回调到0.9V，0.9V就是最小的电压。

报错检测如图所示：

![](https://pic2.zhimg.com/v2-462aec7d5352c0f00a8d1368a3ce3599_1440w.jpg)

main\_clk被2分频并生成Launch CLK。Launch CLK与其延迟版本进行比较。该延迟是可编程的，必须设置为与该独特器件的速度（如SS/TT/FF）相关的值（通常ATE机台上就确定好并写进OTP里）。时序比较通过触发器完成，该触发器使用Launch CLK为其自身的延迟版本计时。如果添加的延迟过长，触发器输出为高，表明存在时序问题并触发中断。

时序图如图所示：

![](https://pica.zhimg.com/v2-9c86eedc40d7c3a140a39e1eb19fb4a6_1440w.jpg)

举例：

1. 实例背景与初始状态
- 场景：车载仪表盘 [MCU](https://zhida.zhihu.com/search?content_id=259735349&content_type=Article&match_order=1&q=MCU&zhida_source=entity) 在25°C环境下以192 MHz频率运行，初始VDDCORE电压为数据手册标称的0.9 V（基于SS器件在-20°C的最坏情况）。
- 器件工艺：实际器件为TT（典型）工艺，理论上可在更低电压下运行。
1. 调节过程分步解析

步骤1： [PVT传感器](https://zhida.zhihu.com/search?content_id=259735349&content_type=Article&match_order=1&q=PVT%E4%BC%A0%E6%84%9F%E5%99%A8&zhida_source=entity) 初始化与电压试探

- 硬件配置：通过 [OTP熔丝](https://zhida.zhihu.com/search?content_id=259735349&content_type=Article&match_order=1&q=OTP%E7%86%94%E4%B8%9D&zhida_source=entity) 读取该器件的理想PVT延迟值（如32），编程到延迟线中。
- 软件流程：应用程序启动后，通过I2C命令PMIC将VDDCORE从0.9 V逐步降低，每次降低25 mV（如0.875 V），并等待5 ms让电压稳定。

步骤2：温度变化触发电压调整

- 温度下降场景：当车辆启动后引擎舱温度降至-10°C，晶体管速度变慢，延迟线的Launch CLK延迟增加。
- 时序检测：PVT传感器对比Launch CLK与其延迟版本，当延迟超过阈值时，触发中断（Alarm信号置高）。

步骤3：闭环反馈调节电压

- 中断响应：MCU收到中断后，通过I2C请求PMIC将VDDCORE提高1个步长（0.875 V→0.9 V），消除时序违规。
- 动态平衡：温度继续下降至-20°C时，再次触发报警，电压进一步提高至0.925 V，确保时序裕量。

步骤4：温度回升时的功耗优化

- 电压降低试探：当车辆停止运行，温度回升至25°C，应用程序周期性试探降低电压（如0.9 V→0.875 V→0.85 V）。
- 无报警确认：若降低电压后PVT传感器未触发报警，说明当前电压满足时序要求，保持该电压以节省功耗（较标称电压降低5.6%）。

## DVFS

DVFS（Dynamic Voltage Frequency Scaling）是指根据系统负载动态调整电源电压（VDD）和时钟频率（FCLK）的技术，其核心目标是在性能需求与功耗之间取得平衡。看上去和AVS很像，但DVFS中电压和频率是提前设置好的离散值，软件根据当前任务负载决定把电压频率调整到哪个值。所以AVS省功耗的能力比DVFS更强，但是实现起来也更复杂。

发布于 2025-06-30 16:36・上海