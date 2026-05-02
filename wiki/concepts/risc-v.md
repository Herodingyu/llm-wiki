---
doc_id: risc-v
title: RISC-V
page_type: concept
related_sources:
  - src-pulp-platform-docs-riscvmunich2024-riscv-summit-eu-202
  - src-semiwiki
  - src-vlsisystemdesign-soc-labs
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, soc-pm, processor-architecture]
---

# RISC-V

## 定义

RISC-V 是一种基于精简指令集计算（RISC）原则的开源指令集架构（ISA），由加州大学伯克利分校于 2010 年首次发布。与 x86 和 ARM 等专有 ISA 不同，RISC-V 采用开放的 BSD 许可证，任何人都可以免费使用、修改和扩展，无需支付授权费或版税，已成为处理器架构领域最具影响力的开放标准。

## 技术细节

核心特性：

- **模块化设计**：
  - 基础整数指令集（RV32I/RV64I）为最小子集
  - 标准扩展：M（乘除法）、A（原子操作）、F（单精度浮点）、D（双精度浮点）、C（压缩指令）等
  - 自定义扩展：预留编码空间供厂商添加专有指令

- **开放生态**：
  - 无授权费、无版税
  - 开源处理器核（Rocket Chip、BOOM、CVA6 等）
  - 开源工具链（GCC、LLVM、GDB、QEMU）
  - 活跃的国际基金会（RISC-V International）

应用场景：
- **微控制器**：替代 ARM Cortex-M 系列，成本敏感型 IoT 设备
- **应用处理器**：智能手机、平板、边缘计算设备
- **高性能计算**：服务器 CPU、AI 加速器（如 Tenstorrent、Esperanto）
- **定制加速器**：DSA（Domain-Specific Architecture）与 RISC-V 控制核心结合

商业采用：
- 高通、联发科、三星等手机芯片厂商在 IoT 和嵌入式领域采用
- 阿里巴巴平头哥（玄铁系列）、赛昉科技、香山（中科院）等国内厂商积极布局
- 英特尔投资 SiFive 并推出 RISC-V 开发板
- 汽车电子领域（如瑞萨、英飞凌）开始评估 RISC-V

挑战：
- 软件生态（尤其是移动和桌面操作系统）仍在建设中
- 碎片化风险：各厂商自定义扩展可能导致兼容性分裂
- 专利风险：虽然 ISA 开放，但具体实现仍可能涉及第三方专利

## 相关来源

- [[src-pulp-platform-docs-riscvmunich2024-riscv-summit-eu-202]] — RISC-V Summit EU 2024 技术资料
- [[src-semiwiki]] — SemiWiki 的 RISC-V 行业分析
- [[src-vlsisystemdesign-soc-labs]] — SoC 实验室中的 RISC-V 应用

## 相关概念

- [[chiplet]] — RISC-V 与开放 Chiplet 生态相互促进
- [[verification]] — RISC-V 核心需要充分的验证确保兼容性
- [[agile-hardware]] — 开源模式加速 RISC-V 迭代和创新

## 相关实体

- [[synopsys]] — 提供 RISC-V IP 和 EDA 工具
- [[mediatek]] — 采用 Arm 架构，关注 RISC-V 生态
- [[qualcomm]] — RISC-V 国际基金会成员
