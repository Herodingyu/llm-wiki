---
doc_id: risc-v
title: RISC-V
page_type: entity
entity_type: standard
related_sources: [src-pulp-platform-docs-riscvmunich2024-riscv-summit-eu-202, src-semiwiki.md, src-vlsisystemdesign-soc-labs]
related_concepts: [concept-open-isa, concept-cpu-architecture, concept-soc-design]
created: 2026-05-02
updated: 2026-05-02
tags: [entity, standard, isa, processor, open-source]
---

# RISC-V

## 概述

RISC-V是一种开放的指令集架构（ISA），由加州大学伯克利分校于2010年原创开发。与ARM和x86等专有ISA不同，RISC-V采用宽松的BSD许可证，允许任何人免费使用、修改和扩展，无需支付授权费。RISC-V已成为继x86和ARM之后的第三大CPU架构，在嵌入式系统、物联网、AI加速器和高性能计算领域获得广泛采用。RISC-V International负责标准的制定和推广，成员包括Google、Intel、Qualcomm、Samsung等巨头。

## 关键事实

- 2010年由UC Berkeley开发，基于精简指令集计算（RISC）原则
- 完全开放标准，无需授权费，BSD许可证
- RISC-V International管理规范制定，已有70+扩展
- 被应用于MCU、应用处理器、AI加速器、服务器CPU等多种场景
- PULP Platform是开源RISC-V处理器研究平台
- 中国、欧盟等地区将RISC-V视为半导体自主可控的重要路径

## 产品/技术

- **基础ISA**：RV32I/RV64I（整数指令集）、RV32E（嵌入式）
- **标准扩展**：M（乘除法）、A（原子操作）、F/D（浮点）、C（压缩指令）
- **特权架构**：支持操作系统运行（S模式、U模式）
- **矢量扩展**：RVV（矢量处理），面向AI/ML和HPC
- **应用案例**：SiFive处理器、阿里巴巴平头哥玄铁、Andes晶心
- **开发平台**：PULP Platform、Rocket Chip、BOOM

## 相关来源

- [[src-pulp-platform-docs-riscvmunich2024-riscv-summit-eu-202]] — RISC-V Summit EU 2024
- [[src-semiwiki.md]] — 半导体行业动态
- [[src-vlsisystemdesign-soc-labs]] — SoC设计实验室

## 相关概念

- [[risc-v]] — RISC-V是主要的开放指令集架构
- [[risc-v]] — 与x86、ARM并列的三大CPU架构之一
- [[chiplet]] — RISC-V广泛应用于SoC集成设计
