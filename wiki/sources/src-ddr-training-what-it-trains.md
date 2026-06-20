---
title: DDR Training 到底在训练什么？
author: Vector
source: 信号完整性和电源完整性
url: https://mp.weixin.qq.com/s/krO2wGvDXrdI0cPRMhiqoQ
date: 2026-06-18
category: dram
tags: [DDR, Training, PHY, SIPI, 内存控制器]
---

原文已保存至 `raw/tech/dram/2026-06-18-DDR-Training-到底在训练什么.md`

# 核心要点

DDR Training 的本质是 PHY 面对真实物理世界的自动校准，通过扫时间、扫电压、扫 Pattern，找到读写最稳定的采样窗口。

**五大训练维度：**
1. **时间训练** — Delay/Phase 调整，让 DQ/DQS 在正确时间点被采样
2. **窗口训练** — Pattern 测试找到可通过区域，选中心点
3. **电压训练** — Vref 调整，让 0/1 判决门限处于安全位置
4. **通道差异补偿** — 补偿 PCB、PKG、DRAM 颗粒、Byte Lane 之间的延迟差
5. **稳定性验证** — 不仅看 Pass/Fail，更要看 Margin 是否足够

**关键工程判断：**
- Training 失败常见原因：通道质量差、DQ/DQS skew 过大、ODT/驱动设置不当、电源/Vref 噪声
- Training 不是掩盖糟糕设计的手段，SIPI 仿真仍是前置必要步骤
- 真正成熟的 DDR 工程看 Margin，Pass 只是最低要求

**相关文章：**
- 上一篇：存储到底是什么？从硬盘、内存到 DDR/HBM，一次讲清
- 下一篇：DDR 拓扑：T-Branch、Fly-by、Point-to-Point 到底怎么选？
