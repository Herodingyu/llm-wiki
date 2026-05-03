---
doc_id: src-芯片cp测试过程中的烘烤目的是什么-老狼-的回答
title: 芯片CP测试过程中的烘烤目的是什么？   老狼 的回答
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/芯片CP测试过程中的烘烤目的是什么？ - 老狼 的回答.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## 摘要

本文简要解答了芯片CP（Chip Probing）测试过程中"烘烤"步骤的目的。核心 insight：CP测试中的烘烤通常不是高低温测试，而是早期的"墨点烘烤"工艺。在早期封测车间不支持直接读取Wafer Map（晶圆图）的时代，CP测试后需要对不良Die进行打墨点标记，烘烤步骤用于固化墨点，确保标记在后续切割和封装过程中保持清晰可辨。随着技术进步，现代封测车间已普遍支持直接读取电子Map，墨点烘烤工艺逐渐被淘汰。

## 关键要点

### 1. CP测试中的"烘烤"本质
- **非高低温测试**：CP过程中的烘烤通常不是指可靠性测试中的高温烘烤
- **墨点烘烤**：早期工艺中用于固化标记墨点
- **历史背景**：早期封测车间不支持直接读取电子Wafer Map

### 2. CP测试完整流程
| 步骤 | 操作 | 目的 |
|------|------|------|
| **Probe测试** | 探针卡接触晶圆上的Die | 测试电气特性 |
| **结果判定** | ATE自动判定Pass/Fail | 筛选好坏Die |
| **标记不良** | 对Fail的Die打墨点 | 视觉标识 |
| **烘烤固化** | 加热固化墨点 | 确保标记持久 |
| **生成Map** | 记录每颗Die的测试结果 | 后续分拣依据 |

### 3. 墨点标记的技术细节
- **材料**：专用半导体标记墨水，耐高温、耐化学腐蚀
- **工艺**：测试完成后由打点机在Fail Die表面打点
- **烘烤条件**：通常在中低温（100-150°C）下烘烤数分钟至数十分钟
- **目的**：
  - 固化墨水，防止在后续清洗、切割中脱落
  - 确保封装厂操作人员能清晰识别坏Die

### 4. 现代替代方案
- **电子Wafer Map**：直接以数据文件形式记录测试结果
- **优势**：
  - 无需物理标记，避免墨点污染
  - 支持更复杂的分类（不仅好/坏，还可分等级）
  - 与自动化设备直接对接
- **趋势**：墨点烘烤已逐步被电子Map取代

## Key Quotes

- "The baking in CP testing is typically not high-temperature reliability testing, but rather early 'ink dot baking' process."
- "Baking is used to cure ink marks on defective dies, ensuring visibility during subsequent dicing and packaging."
- "Modern facilities have largely replaced ink dot baking with electronic Wafer Maps."

## 技术细节

- **CP测试环境**：通常在常温下进行，特殊产品可能加测高低温
- **Wafer Map格式**：标准格式如SECS/GEM，包含Die坐标和测试结果
- **墨点位置精度**：需避开Bond Pad区域，防止影响后续封装键合
- **烘烤设备**：洁净烘箱，需控制颗粒度和温度均匀性

## 原文引用

> "你这个如果不是高低温测试的话，那就是墨点烘烤了，早期的封测车间不支持直接读MAP，所以CP这边一般都进行打墨点"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/芯片CP测试过程中的烘烤目的是什么？ - 老狼 的回答.md) [[../../raw/tech/soc-pm/芯片CP测试过程中的烘烤目的是什么？ - 老狼 的回答.md|原始文章]]