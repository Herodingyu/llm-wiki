---
doc_id: src-tenstorrent-为什么不是又一张-gpu
title: Tenstorrent 为什么不是又一张 GPU？
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/industry/ai/芯片与算力/Tenstorrent 为什么不是又一张 GPU？.md
domain: industry/ai
created: 2026-05-09
updated: 2026-05-09
tags: [ai]
---

## Summary

JW *2026年5月6日 19:20* 很多人第一次看 Tenstorrent，会把它放进“又一家 AI 芯片公司”的抽屉里。 RISC-V。

## Key Points

### 1. 一、先看产品：它已经不是只有开发板
Tenstorrent 当前公开产品大致分四层。 第一层是 PCIe 卡。 老一代是 Wormhole，常见产品是 n150 和 n300。n150 是单 Wormhole 处理器，72 个 Tensix core，12GB GDDR6，288GB/s 内存带宽，FP16 峰值 74 TFLOPS，板卡功耗 160W。n300 是双 Wormhole，128 个 Tensix core，24GB

### 2. 二、Tensix 才是主角，RISC-V 不是用来硬算 MatMul 的
“RISC-V AI 芯片”这个说法很容易误导。 普通工程师听到 RISC-V，会想到 CPU。既然是 CPU，那它怎么和 GPU 比矩阵乘？ 这个理解不对。 Tenstorrent 的核心单元叫 Tensix。一个 Tensix core 不是一个简单的 RISC-V CPU。它更像一个小型数据流计算岛：

### 3. 三、为什么它老是强调 SRAM 和网络
AI 芯片宣传里，大家都爱讲峰值算力。 但大模型推理真正难受的地方，常常不是峰值。 Prefill 阶段像一次大批量计算，输入 token 全部进来，attention 和 MLP 可以比较充分地吃掉矩阵算力。

### 4. 四、参数表里最该看的不是 FLOPS
把 Tenstorrent 和 GPU 放在一起时，最容易误读的是 FLOPS。 Blackhole p150a 的公开规格是 664 TFLOPS BlockFP8。看起来很高。 但这里有两个提醒。

### 5. 五、工具链：它押的是开源全栈，而不是只兼容 PyTorch
Tenstorrent 的软件栈可以分三层看。 最高层是 TT-Forge。 它是 MLIR-based compiler，目标是从 PyTorch、JAX、TensorFlow 这类框架把模型 lowering 到 Tenstorrent 硬件上。对大多数模型开发者来说，这层最重要，因为它决定“我已有模型能不能少改代码跑起来”。

## Evidence

- Source: [原始文章](raw/industry/ai/芯片与算力/Tenstorrent 为什么不是又一张 GPU？.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/industry/ai/芯片与算力/Tenstorrent 为什么不是又一张 GPU？.md)
