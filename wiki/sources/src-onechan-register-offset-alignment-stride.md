---
doc_id: src-onechan-register-offset-alignment-stride
title: "寄存器地址偏移、地址对齐与 Stride 的底层逻辑"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/register-offset-alignment-stride-onechan.md
domain: tech/soc-pm
created: 2026-05-04
updated: 2026-05-04
tags: [soc-pm, register, address-offset, alignment, stride, axi, fpga, dma, mmio, onechan]
---

# 寄存器地址偏移、地址对齐与 Stride 的底层逻辑

## 来源

- **原始文件**: raw/tech/soc-pm/register-offset-alignment-stride-onechan.md
- **原文链接**: https://mp.weixin.qq.com/s/kaj70_dL_WcTSRsGDfw38g
- **来源平台**: 微信公众号「OneChan」
- **作者**: OneChan
- **提取日期**: 2026-05-04

## 文章类型

技术深度 / FPGA + 嵌入式驱动实战

## 核心主题

寄存器地址偏移、地址对齐、Stride 三者共同构成嵌入式系统 MMIO（内存映射 I/O）的底层逻辑，包含可直接工程使用的 Verilog AXI-Lite 译码代码和 C 语言 DMA Stride 驱动。

## 关键内容

### 1. 寄存器地址偏移
- 公式：ADDR = BASE + OFFSET
- 硬件译码：高位片选 + 低位偏移译码
- 工程要求：偏移必须是 4 的倍数（32 位总线）

### 2. 地址对齐
- 规则：A mod w = 0
- AXI-Lite 强制 32 位对齐（低 2 位必须为 0）
- C 语言结构体对齐：`__attribute__((aligned(n)))`、`#pragma pack(n)`

### 3. Stride（步长）
- 定义：连续两次访问的地址间隔
- 公式：下一行 = 本行 + 有效宽度 + Stride
- 应用场景：图像 DMA 传输、二维数组、Cache 对齐填充

### 4. 实战代码
- **Verilog AXI-Lite 寄存器地址译码**（可直接对接 CPU/MCU）
- **C 语言 DMA Stride 驱动**（含图像传输示例）

## 技术亮点

| 亮点 | 说明 |
|------|------|
| AXI-Lite 译码 | 完整的写通道/读通道控制，含地址对齐掩码 |
| DMA Stride 驱动 | 逐行传输，自动地址跳跃，含完成检测 |
| 联动闭环 | 偏移 → 对齐 → Stride 的硬件+软件完整链路 |

## 质量评估

| 维度 | 评分 | 说明 |
|------|------|------|
| 技术深度 | ⭐⭐⭐⭐⭐ | 从硬件译码到软件驱动的完整链路 |
| 工程实用性 | ⭐⭐⭐⭐⭐ | 可直接工程使用的 Verilog + C 代码 |
| 代码质量 | ⭐⭐⭐⭐⭐ | 完整可编译的模块代码 |
| 可读性 | ⭐⭐⭐⭐ | 公式推导 + 代码实战，结构清晰 |

## 建议行动

- ✅ AXI-Lite 寄存器译码模式作为 wiki 中 FPGA/SoC 设计的标准参考模板
- ✅ 提取 Verilog 和 C 代码为独立代码参考文档
- ✅ 创建 [[mmio]] 概念词条

## Related Pages

- [[mmio]] — 内存映射 I/O（待创建）
- [[axi-lite]] — AXI-Lite 总线（待创建）
- [[src-onechan-register-types-ro-rw-wo]] — 寄存器类型
- [[src-onechan-multicore-ipc]] — 多核 IPC
- [[src-onechan-peripheral-core-system-reset]] — 三类复位

## 开放问题

- 本文代码是否应作为标准模板在团队内推广？
- 64 位总线（8 字节对齐）的 AXI-Lite 译码如何扩展？
