---
doc_id: chiplet
title: Chiplet
page_type: concept
related_sources:
  - src-chipletsummit-proceeding-files-a0q5f0000044zma-2024020
  - src-semiengineering
  - src-semiengineering-how-ai-and-connected-workflows-will-clos
  - src-semiwiki
  - src-semiwiki-eda-keysight-eda-336039-keysight-eda-202
  - src-semiwiki-eda-346400-keysight-eda-at-61dac-its-big
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, soc-pm, advanced-packaging]
---

# Chiplet

## 定义

Chiplet（芯粒/小芯片）是一种将传统单片 SoC 拆分为多个独立制造的小芯片，再通过先进封装技术（如 2.5D/3D 封装）互联集成的设计范式。Chiplet 通过"分解-优化-重组"的思路，用最优工艺制造每个功能模块，从而突破摩尔定律放缓带来的性能和成本瓶颈。

## 技术细节

核心优势：

- **良率提升**：小芯片面积更小，制造良率显著高于大型单片 Die
- **工艺优化**：不同功能模块可采用最适合的工艺节点（如 CPU 用 3nm，I/O 用 12nm）
- **成本降低**：避免为整个 SoC 使用最先进的昂贵工艺
- **复用性**：通用 Chiplet（如 I/O Die、内存控制器）可在多个产品中复用
- **快速迭代**：部分功能升级只需替换相应 Chiplet，无需重流整个 SoC

互联技术：
- **UCIe（Universal Chiplet Interconnect Express）**：行业统一的 Chiplet 互联标准
- **2.5D 封装**：通过硅中介层（Silicon Interposer）或有机基板实现高密度互联
- **3D 封装**：垂直堆叠 Chiplet，通过 TSV（硅通孔）或混合键合（Hybrid Bonding）互联
- **先进封装**：CoWoS、EMIB、FoCoS-B 等封装技术

挑战：
- **互联带宽和延迟**：Chiplet 间通信带宽和延迟直接影响系统性能
- **热管理**：多 Die 集成导致热密度集中
- **设计复杂性**：需要系统级架构师统筹多个 Chiplet 的协同设计
- **生态建设**：标准化和供应链成熟度仍在发展中

典型应用：
- AMD EPYC/锐龙处理器（CCD + IOD 架构）
- Intel Meteor Lake（计算 Tile + 图形 Tile + SoC Tile + I/O Tile）
- Apple M 系列 Ultra 版本（M1/M2/M3 Ultra 通过 UltraFusion 连接两个 Max Die）
- AI 加速器（如 NVIDIA Blackwell 通过 NVLink-C2C 互联）

## 相关来源

- [[src-chipletsummit-proceeding-files-a0q5f0000044zma-2024020]] — Chiplet Summit 会议资料
- [[src-semiengineering]] — Semiconductor Engineering 的 Chiplet 标准专题
- [[src-semiengineering-how-ai-and-connected-workflows-will-clos]] — AI 和互联工作流对 Chiplet 设计的影响
- [[src-semiwiki]] — SemiWiki 的 Chiplet 技术分析
- [[src-semiwiki-eda-keysight-eda-336039-keysight-eda-202]] — EDA 工具对 Chiplet 设计的支持
- [[src-semiwiki-eda-346400-keysight-eda-at-61dac-its-big]] — Chiplet 时代的 EDA 挑战

## 相关概念

- [[tapeout]] — Chiplet 分解降低了单次流片的风险和成本
- [[verification]] — Chiplet 需要新的互联和接口验证方法
- [[agile-hardware]] — Chiplet 的模块化与敏捷开发理念契合
- [[risc-v]] — RISC-V 生态推动 Chiplet 标准化和开放架构

## 相关实体

- [[synopsys]] — 提供 Chiplet PHY Designer 和 UCIe IP
- [[renesas]] — R-Car X5H 支持 UCle chiplet 扩展
- [[mediatek]] — 与 NVIDIA 合作 chiplet 架构座舱平台
