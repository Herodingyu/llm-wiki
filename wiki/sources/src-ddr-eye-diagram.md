---
title: DDR眼图怎么看？别只看"眼睛大不大"
author: Vector
source: 信号完整性和电源完整性
url: https://mp.weixin.qq.com/s/tpu1s-SeH9_S6SFLBsGq7w
date: 2026-06-21
category: dram
tags: [DDR, 眼图, Eye Diagram, SIPI, Margin]
---

原文已保存至 `raw/tech/dram/2026-06-21-DDR眼图怎么看.md`

# 核心要点

DDR 眼图不是"好不好看"的波形图，而是一张系统 Margin 地图。

**七步看眼图法：**
1. 确认场景（Read/Write、Byte Lane、bit、ODT/Vref/Pattern）
2. 找最差 bit（不按平均，按最弱链路）
3. 看眼宽（时间 Margin、Setup/Hold）
4. 看眼高（电压 Margin、Vref、电源噪声）
5. 看中心点（采样点到四边边界的距离 = 风险地图）
6. 做参数扫描（ODT/Drive/Vref/Delay/Pattern 定位问题来源）
7. 转成工程动作（Layout、Package、PDN、模型、配置修改）

**关键判断：**
- 眼睛开了 ≠ 设计安全（要看 Margin 分布）
- 平均眼图会骗人（最差 bit 决定稳定性下限）
- 眼图变差通常是多因素叠加（反射+串扰+损耗+电源噪声+ODT）
- Mask Pass 是底线不是终点
- 仿真和实测要对齐模型、边界条件、Pattern 等

**五大常见误判：**
1. 眼睛大就一定安全
2. 眼图差就是等长问题
3. 仿真 pass = 板子 pass
4. 只看 DQ 就够了
5. Training 能过就不用管眼图
