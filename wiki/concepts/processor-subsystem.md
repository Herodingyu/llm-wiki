---
doc_id: processor-subsystem
title: 处理器子系统（Processor Subsystem）
page_type: concept
related_sources:
  - src-onechan-soc-processor-subsystem
related_entities: []
created: 2026-05-09
updated: 2026-05-09
tags: [concept, soc, processor, cpu, gpu, npu, dsp, mcu]
---

# 处理器子系统（Processor Subsystem）

## 定义

处理器子系统是 SoC 的"大脑"，负责执行指令、处理数据、调度任务。现代 SoC 通常不只有 CPU，还包含 GPU、DSP、NPU、ISP、MCU 等多种计算单元。

## 核心理念

- **让合适的硬件干合适的活**：通用 CPU 很灵活，但不是所有任务都应该交给 CPU
- **异构计算是趋势**：不同任务交给专用加速器，单位能耗更低
- **性能 ≠ 频率**：架构效率、并行度、内存带宽同样关键

## 处理器类型

| 类型 | 特点 | 典型任务 | 能效比 |
|------|------|---------|--------|
| CPU | 通用、顺序执行 | 控制逻辑、通用计算 | 中 |
| GPU | 大规模并行 | 图形渲染、并行计算 | 高 |
| NPU/TPU | 矩阵运算专用 | AI 推理、训练 | 极高 |
| DSP | 数字信号处理 | 音频、基带、图像滤波 | 高 |
| ISP | 图像流水线 | 降噪、白平衡、HDR | 高 |
| MCU | 简单控制 | 传感器管理、低功耗任务 | 中 |

## 现代处理器趋势

### AI 时代下的演进
- **NPU 成为标配**：手机 SoC 普遍集成 AI 加速器
- **Transformer 加速**：支持 Attention 机制的专用硬件
- **稀疏计算**：利用模型稀疏性提升有效算力
- **量化推理**：INT8/INT4 低精度推理降低功耗

### 大小核架构
| 核心 | 特点 | 用途 |
|------|------|------|
| 大核（P-core） | 高性能、高功耗 | 重度任务、游戏、编译 |
| 小核（E-core） | 低功耗、中等性能 | 后台任务、待机、轻负载 |

## 设计要点

### 任务调度
- 操作系统调度器决定任务跑在哪个核心
- 异构调度需要考虑任务特性与核心能力匹配
- 实时任务需要绑定到特定核心

### 一致性支持
- 多核共享内存时的 Cache 一致性（ACE/CHI）
- 核间中断与信号量（IPI、Mailbox）
- 负载均衡与迁移开销

## 相关来源

- [[src-onechan-soc-processor-subsystem]] — SoC（4）：一文详解AI时代下的处理器子系统

## 开放问题

- RISC-V 能否在高端 SoC 中与 ARM 竞争？
- 通用 NPU 与专用 AI 加速器（如 Transformer Engine）的边界在哪里？
