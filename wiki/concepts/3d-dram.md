---
doc_id: 3d-dram
title: 3D DRAM
page_type: concept
related_sources:
  - src-3d-dram-roadmap-allpcb
  - src-ddr-basics-summary
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, dram, advanced-technology]
---

# 3D DRAM

## 定义

3D DRAM 是指通过垂直堆叠存储单元来实现三维集成的下一代 DRAM 技术。随着平面 DRAM 工艺接近物理极限（约 12nm），3D DRAM 成为突破"内存墙"、持续提升容量和带宽的关键技术方向。

## 技术细节

主要发展路径：

- **HBM 式多 Die 堆叠**：通过 TSV（硅通孔）将多个 DRAM Die 垂直堆叠封装，已商用（HBM2/HBM2E/HBM3/HBM3E）
- **单片式 Monolithic 堆叠**：在同一硅片上垂直堆叠存储单元，目前处于研发阶段
- **无电容 DRAM（Capacitor-Free DRAM）**：利用浮体效应存储电荷，省去传统电容结构，更适合三维集成

技术挑战：
- 电容堆叠：传统 DRAM 依赖平面电容，三维化需要创新的电容结构
- 漏电控制：垂直堆叠导致漏电流增大，影响数据保持时间
- 散热管理：多层堆叠的热密度显著增加
- 制造成本：新工艺流程和设备投入巨大

行业进展：
- 三星：2019 年开展 3D DRAM 研究，计划 2025 年推出基于垂直沟道晶体管技术的早期版本，2030 年实现全堆叠
- SK 海力士：探索 IGZO 沟道材料用于可堆叠 DRAM
- 美光：2022 年前已获得超过 30 项 3D DRAM 相关专利
- NEO Semiconductor：提出 3D X-DRAM 技术，目标 128Gb 密度，230 层堆叠

市场预测：
- 2030 年全球 3D DRAM 市场规模可达约 1000 亿美元
- 基本容量可达约 100GB，远超当前高端 DRAM 的 36GB

## 相关来源

- [[src-3d-dram-roadmap-allpcb]] — 3D DRAM 技术路线图与量产时间表
- [[src-ddr-basics-summary]] — 平面 DRAM 的技术极限背景

## 相关概念

- [[ddr5]] — 当前主流 DRAM 标准
- [[cxm]] — 3D DRAM 未来可能用于 CXL 内存模块
- [[mcrdimm]] — 同为突破内存容量/带宽瓶颈的方案

## 相关实体

- [[samsung]] — 2019 年开展 3D DRAM 研究
- [[sk-hynix]] — 探索 IGZO 沟道材料
- [[micron]] — 拥有超过 30 项 3D DRAM 专利
