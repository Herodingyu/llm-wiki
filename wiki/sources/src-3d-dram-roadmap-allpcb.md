---
doc_id: src-3d-dram-roadmap-allpcb
title: 3D DRAM Roadmap and Production Timeline
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/allpcb-allelectrohub-3d-dram-roadmap-and-produc.md
domain: tech/dram
created: 2026-05-02
updated: 2026-05-02
tags: [dram, 3d-dram, roadmap, ai-memory, hbm]
---

# 3D DRAM Roadmap and Production Timeline

## 来源

- **原始文件**: raw/tech/dram/allpcb-allelectrohub-3d-dram-roadmap-and-produc.md
- **提取日期**: 2026-05-02

## Summary

随着AI服务器对内存带宽需求持续增长，传统平面DRAM和HBM都面临物理极限挑战。3D DRAM通过垂直堆叠存储单元，有望成为突破内存墙的下一代关键技术。本文综述了3D DRAM的发展路线图与量产时间表，涵盖两大技术路径：HBM式多die堆叠封装和单片式monolithic堆叠。平面DRAM工艺已接近约12nm物理极限，电容器的深宽比问题日益严峻。三星计划2025年推出基于垂直沟道晶体管技术的早期版本，2030年实现全堆叠；SK海力士探索IGZO沟道材料；美光拥有最多的3D DRAM相关专利。行业还提出无电容DRAM概念，利用浮体效应存储电荷。NEO Semiconductor提出的3D X-DRAM目标128Gb密度和230层堆叠。市场预测2030年全球3D DRAM市场规模可达约1000亿美元，应用场景涵盖数据中心、智能手机和自动驾驶等领域。

## Key Points

### 1. 技术背景与驱动力
- AI工作负载对内存速度和密度提出更高要求
- 平面DRAM工艺接近物理极限（约12nm），缩放面临电容器深宽比和电荷共享挑战
- HBM虽提供更高带宽，但带宽也将面临极限
- 存算一体（Compute-in-Memory）商业化尚远，3D DRAM成为现实选择

### 2. 两大发展路径

| 路径 | 技术特点 | 优势 | 挑战 |
|------|----------|------|------|
| HBM式堆叠 | 多die垂直封装（4/8/16层） | 技术成熟，带宽高 | 封装成本高，密度受限 |
| 单片式堆叠 | 单芯片内垂直堆叠存储单元 | 成本潜力大，密度高 | 工艺复杂，电容器堆叠困难 |

### 3. 无电容DRAM创新
- 利用单晶体管单元和浮体效应（Floating Body Effect）存储电荷
- 主要技术路线：Dynamic Flash Memory、VLT、Z-RAM、IGZO-FET
- 无需外部电容器，简化3D堆叠结构

### 4. 主要厂商布局

| 厂商 | 关键进展 | 专利/技术 |
|------|----------|-----------|
| 三星 | 2019年启动研究，2025年推出早期版本，2030年全堆叠 | 垂直沟道晶体管，SAINT-D设计，4F2单元结构 |
| SK海力士 | 2024年披露电学特性，探索IGZO沟道 | IGZO TFT低漏电特性 |
| 美光 | 2019年开始研究，专利数量领先 | 截至2022年8月获超30项专利 |
| NEO Semiconductor | 提出3D X-DRAM技术 | 目标128Gb密度，230层堆叠 |

### 5. 应用前景
- 数据中心/云服务器：AI训练和推理的大内存需求
- 智能手机：LPDDR可能逐步被替代
- 自动驾驶：实时处理传感器大数据流
- 市场预测：2030年市场规模约1000亿美元

## Key Quotes

> "Memory bandwidth has become an increasing bottleneck in AI servers, limiting system compute efficiency."

> "In theory, compute-in-memory could fully address the 'memory wall,' but commercial maturity and mass production of such solutions remain distant. In this context, 3D DRAM is emerging as a promising alternative to HBM."

> "3D DRAM stacks storage cells vertically rather than laying them out horizontally, increasing capacity per unit area by multiple times."

> "Samsung aims for 2025 production and plans to scale the process node to 8–9 nm by 2027–2028; current leading DRAM processes are around 12 nm."

> "NEO claims 3D X-DRAM can reach 128 Gb density across 230 layers, eight times current DRAM density, with long-term targets of an eightfold capacity increase per decade and 1 Tb cells between 2030 and 2035."

## Related Pages

- [[3d-dram]] — 3D DRAM 技术路线图与量产时间表
- [[ddr5]] — 当前主流 DRAM 标准
- [[cxm]] — 3D DRAM 未来可能用于 CXL 内存模块
- [[mcrdimm]] — 同为突破内存容量/带宽瓶颈的方案
- [[samsung]] — 2019 年开展 3D DRAM 研究
- [[sk-hynix]] — 探索 IGZO 沟道材料
- [[micron]] — 2022 年前已获得超过 30 项 3D DRAM 相关专利

## 开放问题

- 无电容DRAM的商业化可行性和量产时间表尚不明确
- 3D DRAM的制造成本与HBM相比是否具有竞争力
- 单片式3D DRAM的技术挑战（电容堆叠、漏电控制）如何解决
