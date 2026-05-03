---
doc_id: src-低功耗设计的rtl-coding方法
title: 低功耗设计的RTL coding方法
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/低功耗设计的RTL coding方法.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## 摘要

本文从RTL编码实践角度，提出了一种常被忽视但可行性极高的低功耗设计技巧——在模块级彻底消除动态功耗。作者指出，常见的低功耗技术（clock gating、power gating、DVFS等）大多与RTL编码技巧关联不大，而前端工程师通常只知道clock gating（时钟门控）和减少组合逻辑跳变两点。核心 insight：仅停掉模块的clock并不能完全消除该模块的动态功耗，因为来自其他仍在工作模块的输入信号仍可能驱动该模块前端的组合逻辑产生翻转。彻底消除动态功耗的正确做法是：（1）停掉模块clock；（2）将该模块所有仍在跳变的输入tie成恒定值。

## 关键要点

### 1. 常见低功耗技术回顾
| 技术 | 实现层级 | 前端参与度 |
|------|---------|-----------|
| Clock Gating | 寄存器级 | 高（手动或工具自动插入） |
| Power Gating | 模块/域级 | 中（配合UPF） |
| Retention逻辑 | 寄存器级 | 中 |
| SRAM低电压Retention | 存储器级 | 低 |
| DVFS | 系统级 | 低 |
| 综合策略限制 | 门级 | 低 |

### 2. Clock Gating的局限性
- **覆盖率目标**：通常要求达到95%以上
- **实现方式**：手动在RTL中添加，或综合工具自动插入（ICG clock gating）
- **作用范围**：仅能阻止寄存器翻转，寄存器输出恒定后，下级组合逻辑自然静止
- **盲区**：无法阻止来自其他模块的输入信号驱动该模块前端组合逻辑翻转

### 3. 模块动态功耗的完整构成
```
其他工作模块 → [输入信号跳变] → [本模块前端组合逻辑翻转] → [寄存器（已停clock）]
                                    ↑                        ↑
                                Clock Gating无法管控        Clock Gating可管控
```

- **后半部分**：寄存器已停clock → 输入恒定 → 下级组合逻辑无翻转 ✓
- **前半部分**：输入信号仍从其他模块跳变而来 → 前端组合逻辑继续翻转 ✗

### 4. 彻底消除动态功耗的两步法
| 步骤 | 操作 | 效果 |
|------|------|------|
| 第一步 | 停掉模块的clock | 寄存器停止翻转，消除后端动态功耗 |
| 第二步 | 将模块所有input tie成恒定值 | 前端组合逻辑输入恒定，消除前端动态功耗 |

**关键前提**：如果一个模块的clock可以停掉，说明该模块当前完全不工作，此时将输入tie成恒定值不会影响功能正确性。

### 5. 实施建议
- **模块级检查**：以模块为单元进行检查，而非逐条检查assign语句
- **主干逻辑**：模块划分通常是逻辑最窄的地方，在此处tie住input效率最高
- **工具辅助**：可利用功耗分析工具识别模块输入跳变情况
- **验证注意**：tie input后需验证模块唤醒时能正确恢复工作

## Key Quotes

- "Stopping the module clock alone cannot completely eliminate dynamic power consumption, because input signals from other working modules may still drive the front-end combinational logic to toggle."
- "The correct two-step approach to completely eliminate dynamic power: (1) stop the module clock; (2) tie all toggling inputs to constant values."
- "Clock gating can only prevent register toggling, but cannot prevent input signals from driving front-end combinational logic."

## 技术细节

- **组合逻辑冗余跳变示例**：`a = b & c;` 当b=0时，c的跳变为无效跳变，但前端工具通常不检查
- **静态功耗 vs 动态功耗**：clock gating后静态功耗仍存在（漏电流），动态功耗（翻转功耗）可被消除
- **模块划分原则**：好的模块划分应使接口最小化，便于功耗管理
- **UPF协同**：结合Unified Power Format可实现更精细的电源域控制

## 原文引用

> "（1）其实就是clock gating。这是最常用的也最受前端人员热爱的技术。写完代码之后也会review一下clock gating的覆盖率，看看有没有达到95%以上"

> "实际coding过程中，不会有人去check每个组合逻辑是不是跳变太多，有些多余的跳变，只要不干扰功能的正确性，没有人会去管"

> "比如说： a=b&c；假如在一段时间内，b的值为0，那么a的值无疑肯定是0，那么c的跳变就是无意义的跳变。那么输出c信号的cell就是在做无用功，在浪费功耗"

> "可是组合逻辑不像寄存器，寄存器你只要关掉它的clock，它的输出就不会有任何跳变，就会只剩下静态功耗。组合逻辑没有clock端，与门没有时钟端，或门没有时钟端，MUX没有时钟端，你要关掉它，只能关掉给它提供输入的上一级寄存器源"

> "当你的一个模块在某一段时间，完全不工作的时候，你可以：（1）在这段时间，关掉这个模块的clock。（2）检查这个模块的input，对还在跳变的input，将其全部tie成恒定值。这样才可以根除这个模块的动态功耗"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/低功耗设计的RTL coding方法.md) [[../../raw/tech/soc-pm/低功耗设计的RTL coding方法.md|原始文章]]