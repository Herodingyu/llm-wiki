---
doc_id: smart-glasses-soc
title: 智能眼镜 SOC 选型
created: 2026-05-05
updated: 2026-05-05
tags: [smart-glasses, soc, chip-selection, wearable, power]
page_type: concept
---

# 智能眼镜 SOC 选型

## 核心矛盾

智能眼镜 SOC 选型的核心矛盾是**功耗、算力、尺寸的三元不可能**——无法同时满足轻量化（<40g）、长续航（>12h）、强算力（>5 TOPS）。[[insight-impossible-triangle]]

## 手机 SOC 为什么不能直接用

| 约束 | 手机 SOC 典型值 | 眼镜可接受值 | 差距 |
|------|----------------|-------------|------|
| TDP | 5-12W | <1-2W | 5-10× |
| 封装尺寸 | 15×15mm BGA | <10×10mm | 2×+ |
| 待机功耗 | 50-100mW | <10mW | 5-10× |
| 蓝牙/WiFi 集成 | 外挂射频模块 | 必须内置 | 架构不匹配 |
| 语音唤醒 | CPU 轮询或外挂 DSP | 需超低功耗始终监听 | 无专用 VPU |
| PMIC 配套 | 手机级 DCDC | 可穿戴级 μA 级静态电流 | 电源管理不匹配 |

手机 SOC 的功耗曲线为"间歇性重负载"（刷视频、打游戏）优化，而眼镜是"持续轻负载+偶发峰值"（始终监听语音、随时拍照、偶尔翻译）。

> 例外：[[mediatek-dimensity-9500]] 的"眼镜方案"采用**分体式计算**，眼镜端只做传感器采集和极简推理，重负载由手机承担。

## 务实选型路径

### 纯 AI 眼镜（无显示/简单通知）

| SOC | 制程 | 核心特性 | 适用场景 |
|-----|------|---------|---------|
| [[bes2800]] | — | 蓝牙+音频+VPU 集成，Meta 独家供应商，市占超30% | 翻译+听歌+拍照 |
| [[bes3000]] | 5nm | 12 TOPS，预计 2026 年中上市 | 下一代 AI 眼镜 |
| [[allwinner-v821]] | — | 已出货 180 万+台 | 性价比路线 |
| [[allwinner-v881]] | — | 1 TOPS NPU，2026年4月量产 | 入门级 AI 眼镜 |
| [[qualcomm-ar1]] | 4nm | 生态最成熟，70%份额 | 生态依赖型产品 |

### AR 眼镜（光波导+SLAM+手势）

| SOC | 制程 | 核心特性 | 适用场景 |
|-----|------|---------|---------|
| [[qualcomm-ar1-plus]] | 4nm | 体积-26%，功耗-7%，支持10亿参数 SLM | 当前 AR 眼镜主流 |
| [[qualcomm-wear-elite]] | 3nm | 首颗可穿戴 3nm，12 TOPS | 下一代高端 AR |
| [[hexagon-tianxiang-hx77]] | — | 国产首款 AI+AR SoC，全功能功耗<500mW | 国产替代路线 |

### 分体式高端 AR

| 方案 | 架构 | 说明 |
|------|------|------|
| [[mediatek-dimensity-9500]] + 协处理器 | 眼镜端 ISP+显示+轻量 AI，手机端 SLAM+大模型 | 牺牲便携性换算力 |

## 架构趋势：三芯异构

[[goertek]] 首创的 **MCU+ISP+NPU 三芯异构**架构正在成为参考设计标准：

- **MCU**：电源管理和传感器聚合（μA 级待机）
- **ISP**：摄像头和显示（独立时序，不唤醒主 CPU）
- **NPU**：AI 推理（INT8 量化，事件触发）

相比单颗大 SOC，续航提升 **50-200%**。[[insight-three-chip-heterogeneous]]

## 选型 Checklist

- [ ] 持续运行功耗 <1-2W？
- [ ] 待机功耗 <10mW？
- [ ] 封装尺寸 <10×10mm？
- [ ] 内置蓝牙/WiFi 射频？
- [ ] 专用 VPU/语音唤醒单元？
- [ ] NPU 支持 INT8 量化？
- [ ] 可穿戴级 PMIC 配套？
- [ ] 双系统（Android+RTOS）支持？

## 关联概念

- [[ar]] — 增强现实
- [[vr]] — 虚拟现实
- [[xr]] — 扩展现实
- [[waveguide]] — 光波导光学
- [[slam]] — 同步定位与地图构建
- [[power-management]] — 电源管理

## 关联实体

- [[qualcomm]] — 高通
- [[mediatek]] — 联发科
- [[meta]] — Meta
- [[allwinner]] — 全志科技
- [[goertek]] — 歌尔股份

---

*参考来源：26Q1-smartglasses.agent.final.md 第2章（SOC架构）、第3章（xPU算力）*
