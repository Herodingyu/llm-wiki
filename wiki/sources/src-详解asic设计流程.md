---
doc_id: src-详解asic设计流程
title: 详解ASIC设计流程
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/详解ASIC设计流程.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## 摘要

本文系统梳理了ASIC（专用集成电路）从概念到硅片的完整设计流程，涵盖需求分析、架构设计、RTL编码、功能验证、逻辑综合、逻辑等价检查、物理设计（布局布线）、硅后验证和流片等10个关键阶段。作者指出，尽管EDA工具大幅提升了自动化程度，但设计人员在各阶段的明智决策仍是项目成功的关键。文章特别强调了设计与验证团队的并行工作模式——验证团队基于设计人员发布的RTL版本开发测试平台和测试用例，通过迭代发现Bug并推动功能收敛，这是现代芯片开发的核心协作机制。

## 关键要点

### 1. ASIC设计流程概览
| 阶段 | 核心任务 | 主要工具/方法 | 交付物 |
|------|---------|-------------|--------|
| **需求分析** | 收集客户需求，评估市场和资源 | 市场调研、技术评估 | 需求文档 |
| **技术指标** | 定义功能、接口、架构规范 | 规格书编写 | Specifications |
| **架构设计** | 系统级设计，确定组件、频率、功耗 | 架构建模工具 | 架构文档 |
| **数字设计** | RTL编码（Verilog/VHDL） | 代码编辑器、Linter | RTL代码 |
| **功能验证** | 验证RTL功能正确性 | EDA仿真器、UVM | 测试报告、覆盖率 |
| **逻辑综合** | RTL→门级网表 | Design Compiler等 | 网表、SDC约束 |
| **逻辑等价检查** | 网表与RTL功能一致性 | Formality等 | LEC报告 |
| **物理设计(PnR)** | 布局、布线、时序优化 | ICC/Innovus等 | GDSII、版图 |
| **硅后验证** | 实际芯片测试调试 | ATE、示波器 | 测试报告 |
| **流片** | GDSII提交代工厂制造 | - | 硅片样品 |

### 2. 需求与规格阶段
- **需求来源**：客户（计划在其系统中使用该芯片的公司）
- **评估内容**：
  - 最终产品的市场价值
  - 项目所需资源数量
  - 技术可行性
- **规格示例**：
  - 计算能力：支持VR成像算法
  - 处理器：双核ARM A53 @ 600MHz
  - 接口：USB 3.0、蓝牙、PCIe Gen2
  - 显示：1920×1080分辨率控制器

### 3. 架构设计要点
- **系统级视图**：数据如何在芯片内部流动
- **并行处理示例**：
  - 处理器从系统RAM取图像数据并执行
  - 图形引擎同时执行前一批数据的后处理
  - 两者并行，数据流不冲突
- **关键决策**：时钟频率、功耗预算、性能目标、数据通路

### 4. 数字设计与验证的并行协作
```
设计团队 ──发布RTL v1.0──→ 验证团队
     ↑                           │
     └──修复Bug，发布v1.1←───────┘
              ↓
         功能收敛，签核
```

- **设计团队**：发布RTL版本
- **验证团队**：开发Testbench环境和测试用例
- **Bug闭环**：验证失败 → 设计团队修复 → 发布新版RTL → 重新验证
- **收敛标准**：对功能正确性有足够信心（通常以覆盖率为量化指标）

## Key Quotes

- "The typical design flow follows a structured approach with multiple steps, some occurring in parallel and others sequentially."
- "Design and verification teams work in parallel—designers 'release' an RTL version while the verification team develops testbench environments and test cases."
- "Logic synthesis tools convert RTL descriptions in HDL to gate-level netlists, describing circuit gates and their connections."

### 5. 逻辑综合与物理设计
**逻辑综合**：
- 输入：RTL + 时序/面积/功耗约束
- 输出：门级网表（标准单元+触发器）
- 工具：Synopsys Design Compiler、Cadence Genus
- 库文件：代工厂提供，含触发器上升/下降时间、组合门延迟等

**逻辑等价检查（LEC）**：
- 验证网表与RTL功能等效
- 可选：门级仿真（带延迟反标，但仿真速度慢）

**物理设计（PnR）**：
- 工具：Cadence Encounter、Synopsys IC Compiler
- 任务：
  - 标准单元放置成行
  - 定义IO球形图
  - 创建金属层
  - 插入缓冲器满足时序
- 输出：布局版图 → 提交制造

## 技术细节

- **IP复用**：现代芯片大量使用成熟IP（如Flex CAN、DDR控制器）以节省时间和资源
- **HDL选择**：Verilog和VHDL是最主流硬件描述语言，SystemVerilog用于验证
- **EDA仿真器**：VCS、Xcelium、ModelSim等，支持设计建模和激励施加
- **技术节点选择**：综合工具可访问不同工艺节点的数字元件库
- **GDSII**：流片最终交付格式，半导体代工厂用于制造硅片的图形数据流

## 原文引用

> "典型的设计流程遵循以下所示的结构，可以分为多个步骤。这些阶段中的某些阶段并行发生，而某些阶段依次发生"

> "半导体公司的客户通常是其他一些计划在其系统或最终产品中使用该芯片的公司。因此，客户的需求在决定如何设计芯片方面也起着重要作用"

> "架构师提出了芯片应如何工作的系统级视图。他们将确定所需的所有其他组件，它们应以什么时钟频率运行以及如何确定功耗和性能要求"

> "为了节省时间并实现功能收敛，设计团队和验证团队并行运行，其中设计人员'发布'了一个RTL版本，验证团队开发了测试平台环境和测试用例以测试该RTL版本的功能"

> "逻辑综合工具可将HDL中的RTL描述转换为门级网表。该网表只不过是对电路的门和它们之间的连接的描述"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/详解ASIC设计流程.md) [[../../raw/tech/soc-pm/详解ASIC设计流程.md|原始文章]]