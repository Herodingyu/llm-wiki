---
doc_id: src-vlsisystemdesign-soc-labs
title: VLSI System Design SoC Labs - RISC-V Reference SoC Tapeout Program
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/vlsisystemdesign-soc-labs.md
domain: tech/soc-pm
created: 2026-05-02
updated: 2026-05-02
tags: [soc-pm, tapeout, chip-design, risc-v, education]
---

# VLSI System Design SoC Labs - RISC-V Reference SoC Tapeout Program

## 来源

- **原始文件**: raw/tech/soc-pm/vlsisystemdesign-soc-labs.md
- **提取日期**: 2026-05-02

## 摘要

VLSI System Design (VSD) 的 RISC-V Reference SoC Tapeout Program 是一个为期20周的国家级别计划，旨在通过使用 Synopsys EDA 工具和 SCL180 PDK 为工程学生提供完整的芯片开发经验，从 RTL 设计到实际的硅片流片。

## 关键要点

- 20周完整流片周期，使用 Synopsys 工具和 SCL180 nm PDK
- 分为三个阶段：10周在线培训、4周 IIT Gandhinagar 现场实践、6周全芯片实现与流片
- 涵盖从 RTL 到 GDSII 以及后硅验证的完整流程
- 强调动手实践和端到端芯片开发能力培养
- 属于印度半导体任务的一部分，目标是为国家培养硅片设计人才

## 技术细节

- 培训栈：iverilog, GTKWave, Yosys, OpenSTA, Xschem, ngspice, OpenLane
- 签核栈：Synopsys (Design Compiler, PrimeTime, ICC2/Fusion)
- PDK: SCL 180 nm (IO 2.5V, Core 1.8V)，包含 SRAM/POR 宏单元
- 输出成果：可复用的 RTL→GDSII 流程、跨工艺角时序报告、流片提交包

## Related Pages

- [[risc-v]] — 开源 RISC-V SoC 流片项目
- [[chiplet]] — SoC 集成设计
- [[tapeout]] — 从 RTL 到硅片的流片流程
- [[verification]] — 芯片验证流程
- [[synopsys]] — 使用 Synopsys 工具链

## 开放问题

- 该计划的可扩展性如何？是否能真正建立一个可复制的全国性框架？
- 与商业 EDA 工具相比，开源工具链在工业环境中的适用性如何？
