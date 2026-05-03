---
doc_id: src-先进封装技术科普-什么是扇出型封装fan-out-packaging-什么是fowlp-focos和
title: 先进封装技术科普：什么是扇出型封装Fan out  Packaging？什么是FOWLP、FOCoS和InFO
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/先进封装技术科普：什么是扇出型封装Fan-out  Packaging？什么是FOWLP、FOCoS和InFO.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## 摘要

本文系统介绍了扇出型封装（Fan-out Packaging）技术的概念、分类和演进。从WLP（晶圆级封装）的基础概念出发，解释了扇入（Fan-In）与扇出（Fan-Out）的区别，重点剖析了三类技术：FOWLP（无基板扇出型晶圆级封装）、FOCoS（基板扇出型封装）和InFO-PoP（台积电集成扇出型叠层封装）。文章追溯了从英飞凌eWLB到台积电InFO的技术演进，分析了RDL（重布线层）在扇出中的核心作用，并结合UCIe标准说明了扇出型封装在Chiplet时代的战略意义。Apple A10/A11/A12系列芯片的成功应用使该技术获得广泛关注。

## 关键要点

### 1. 扇出型封装基础概念
| 概念 | 定义 | 特点 |
|------|------|------|
| **WLP** | Wafer Level Packaging，晶圆级封装 | 整片晶圆统一封装后切割，而非先切后封 |
| **Fan-In** | 凸点Bump在Die投影面积内 | IO数量有限，传统CSP封装 |
| **Fan-Out** | 凸点Bump超出Die面积 | 提供更多IO，支持更复杂互连 |
| **RDL** | Redistribution Layer，重布线层 | 将Die表面IO扇出到更大面积 |

### 2. 三类扇出封装技术对比
| 技术 | 全称 | 关键特征 | 代表应用 |
|------|------|---------|---------|
| **FOWLP** | Fan-out Wafer Level Packaging | 无基板，RDL直接做在塑封材料上 | 英飞凌eWLB、高通 |
| **FOCoS** | Fan-Out Chip on Substrate | 保留基板，RDL在基板上 | ASE等OSAT |
| **InFO** | Integrated Fan-Out | 台积电专有技术，FOWLP+PoP叠层 | Apple A10/A11/A12 |

### 3. FOWLP工艺演进
| 代际 | 技术 | 年份 | 特点 |
|------|------|------|------|
| 第一代 | eWLB (Embedded Wafer Level BGA) | 2007 | Die First Face Down，英飞凌开发 |
| 变种 | RCP (Redistributed Chip Packaging) | 2006 | 飞思卡尔路线，后被NXP继承 |
| 变种 | M-Series | - | Face Up Die First，解决对齐问题 |
| 第二代 | InFO-PoP | 2016+ | FOWLP+DRAM叠层，用于iPhone7 |

**eWLB工艺流程**：
1. Die面朝下放在临时基板上（键合胶固定）
2. 覆盖塑封材料（Molding Compound）
3. 紫外线移除键合胶和临时基板
4. 在Die上做RDL层和锡球
5. 切割成单个芯片

### 4. RDL重布线层技术
- **材料**：高分子薄膜 + Al/Cu金属化布线
- **功能**：将Die表面IO重新分布到更大面积
- **工艺**：沉积金属层和绝缘层形成电路
- **关键指标**：线宽/线距、层数、可靠性

### 5. InFO-PoP详解（台积电）
- **结构**：下层FOWLP + 上层DRAM叠层
- **互连**：TIV (Through InFO Via) 穿透塑封材料连接DRAM和下层锡球
- **优势**：无需传统基板，更薄、IO密度更高
- **代表**：Apple A10芯片，随iPhone7成名

## Key Quotes

- "Fan-out packaging has become increasingly popular, especially after Apple's A10/A11/A12 series CPUs powered by TSMC's advanced fan-out technologies."
- "RDL is the key enabler—it redistributes IO beyond the die area through metal and dielectric layers."
- "Traditional packaging cuts dies first then packages individually; WLP packages the whole wafer before dicing."

## 技术细节

- **UCIe兼容性**：扇出型封装与UCIe（Universal Chiplet Interconnect Express）标准兼容
- **2.5D封装**：FOCoS可与EMIB、Interposer等2.5D技术结合
- **应力管理**：Wafer级封装需解决热应力、机械应力问题
- **对准精度**：Die放置精度直接影响RDL良率
- **其他封装技术**：Wirebond（成本低）、Flip-chip（BGA常用）

## 原文引用

> "扇出型封装最近越来越火热，尤其Apple的A10/A11/A12系列CPU经过台积电诸多扇出型封装技术加持，iPhone大放异彩之后，越来越多的人在讨论扇出型封装"

> "RDL层是其中比较关键的一环，它通过在Die表明沉积金属层和绝缘层形成电路，将IO扇出到Die面积之外，是扇出的主要功臣。一般采用高分子薄膜材料和Al/Cu金属化布线"

> "传统封装是先切片，在一个个单独封装；而WLP往往是一个晶圆Wafer整体经过封装，封装好了，再进行切片"

> "扇入和扇出是指导出的凸点Bump是否超出了裸片Die的面积，从而是否可以提供更多IO"

> "更多的先进封装技术，敬请期待后文。"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/先进封装技术科普：什么是扇出型封装Fan-out  Packaging？什么是FOWLP、FOCoS和InFO.md) [[../../raw/tech/soc-pm/先进封装技术科普：什么是扇出型封装Fan-out  Packaging？什么是FOWLP、FOCoS和InFO.md|原始文章]]