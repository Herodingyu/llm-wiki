---
doc_id: src-cpu是怎么改变频率的-老狼-的回答
title: CPU是怎么改变频率的？   老狼 的回答
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/CPU是怎么改变频率的？ - 老狼 的回答.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## 摘要

本文详细解释了CPU频率调节的核心机制——PLL（Phase-Lock Loop，锁相环）倍频原理。作者从主板晶振产生的基频出发，逐步拆解PLL的组成结构：鉴相器（Phase Detector）、压控振荡器（VCO）和分频器（N-Divider）。核心 insight 在于：所谓"倍频"实际上是通过VCO生成高频信号，再经分频器分频后反馈到鉴相器，形成闭环控制。文章还介绍了AMD Ryzen的多CCX独立倍频/分频机制，以及Multiplier如何实现不同核心和Cache的差异化频率配置。

## 关键要点

### 1. PLL基本组成与工作原理
| 组件 | 功能 | 关键参数 |
|------|------|---------|
| 鉴相器(Phase Detector) | 比较输入基准频率与反馈频率的相位差 | 锁定范围、捕捉范围 |
| 压控振荡器(VCO) | 根据控制电压生成对应频率的输出 | 调谐范围、相位噪声 |
| 分频器(N-Divider) | 将VCO输出分频后反馈给鉴相器 | 分频比N |
| 电荷泵(CP) | 将相位差转换为控制电压 | 电流大小 |

### 2. "倍频"的实质是分频反馈
- 输入基准频率：例如100MHz
- VCO生成高频：例如4000MHz
- N-Divider设置为40分频 → 反馈回鉴相器为100MHz
- 鉴相器比较两路100MHz，相位差为0时锁定
- **整体效果**：输入100MHz → 输出4000MHz，呈现40倍频效果

### 3. CPU多域频率管理
| 频率域 | 来源 | 说明 |
|--------|------|------|
| 核心频率 | 基频 × Multiplier | 每个CCX/CCD可独立配置 |
| Cache频率 | 独立的Multiplier | L1/L2/L3可能有不同频率 |
| 基频 | 南桥或主板独立频率源 | 通常为100MHz |

### 4. AMD Ryzen的特殊机制
- 每个CCX/CCD拥有独立的倍频和分频
- PLL分频决定最高频率档位：1.0、0.8、0.67、0.57、0.5
- Clock Stretch技术允许核心在基础频率上浮动约0.1GHz

## 关键引用

- CPU频率调整的核心机制是PLL锁相环，通过鉴相器、压控振荡器和分频器的闭环反馈实现稳定频率输出。
- 所谓"倍频"实际上是通过VCO生成高频信号，再经N分频器分频后形成闭环锁定，而非真正的频率倍增。
- AMD Ryzen采用每个CCX/CCD独立倍频/分频机制，结合Clock Stretch技术实现精细频率调节。

## 技术细节

- **环路滤波器**：CPout输出经外部环路滤波器后连接至Vtune，滤除高频噪声
- **小数倍频**：高端PLL使用Σ-Δ调制器(Sigma-Delta Modulator)实现非整数倍频
- **Intel ICC**：集成时钟控制器，负责协调各模块时钟分配
- **商业PLL器件**：如德州仪器LMX2594，支持宽带频率合成

## 原文引用

> "你可能有点疑惑，明明是倍频，为什么里面用的是分频器"

> "如果N-Divider设置为40分频，那么Phase Detector保持稳定的条件自然是N-Divider输入为4000MHz，这样输出才是100MHz维持Phase Detector稳定"

> "所以右侧的频率输出将为4000MHz，整体上看仿佛是40倍频。（其实是用VCO生成一个4GHz的频率然后分频回去成100MHz比对是否准确，形成闭环控制） 所以实名反对 @Bluebear 这位哈工大的CS博士，PLL不是用来分频的"

> "至于Multiplier这块，可以实现任意正整数倍的频率改变，实际上CPU的核心 Cache有不同的频率，因此有不同的Multiplier做倍频。至于基频来自南桥或者主板独立频率源"

> "AMD Ryzen吧，基频Multiplier到合适频率，比如4G，接着用PLL分频。好玩的在于每个CCX/CCD有一个倍频一个分频，因此实际每个CCX/CCD有自己的频率"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/CPU是怎么改变频率的？ - 老狼 的回答.md) [[../../raw/tech/soc-pm/CPU是怎么改变频率的？ - 老狼 的回答.md|原始文章]]