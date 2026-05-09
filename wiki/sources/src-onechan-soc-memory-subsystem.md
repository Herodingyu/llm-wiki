---
doc_id: src-onechan-soc-memory-subsystem
title: "SoC（3）：一文看懂存储子系统"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/SoC（3）一文看懂存储子系统.md
domain: tech/soc-pm
created: 2026-05-09
updated: 2026-05-09
tags: [soc-pm, soc, memory, subsystem, cache, sram, ddr, dram, flash, spm, otp, efuse, onechan]
---

# SoC（3）：一文看懂存储子系统

## 来源

- **原始文件**: raw/tech/soc-pm/SoC（3）一文看懂存储子系统.md
- **原文链接**: https://mp.weixin.qq.com/s/（需从公众号专辑获取）
- **来源平台**: 微信公众号「芯片系统成长记」
- **作者**: alltowine / OneChan
- **提取日期**: 2026-05-09

## 文章类型

技术入门 / SoC 子系统系列（第3篇）

## 核心主题

存储子系统不是"几块 memory macro"的拼盘，而是支撑整个 SoC 运行的数据生命线——回答"数据应该放在哪里，怎样被快速、可靠、低功耗、可预测地访问"。

## 关键内容

### 一、存储层级的本质
计算单元越来越快，但存储的速度、容量、成本、功耗不可同时最优。因此用不同类型存储组成层级结构：最常用的数据离计算单元最近，大容量数据放在更远但更便宜的位置。

### 二、核心矛盾：速度、容量、成本、功耗不可兼得

| 存储类型 | 速度 | 容量 | 面积成本 | 功耗 | 掉电保持 |
|----------|------|------|----------|------|----------|
| 寄存器 | 最快 | 极小 | 高 | 低 | 否 |
| L1/L2 Cache | 很快 | 小 | 高 | 中 | 否 |
| 片上 SRAM/SPM | 快 | 中小 | 较高 | 较低 | 否 |
| DDR/DRAM | 中等 | 大 | 低 | 较高 | 否 |
| Flash | 慢 | 很大 | 很低 | 低 | 是 |
| OTP/eFuse | 很慢 | 极小 | — | 极低 | 是（一次性） |

### 三、Cache vs SPM 的取舍
- **Cache**：硬件自动管理，追求平均性能，适合通用计算
- **SPM（ScratchPad Memory）**：软件显式管理，追求确定性，适合实时 DSP、NPU 本地缓冲、硬实时控制

### 四、DDR 是共享资源，不是无限带宽
DDR 往往是最容易成为系统瓶颈的共享资源。摄像头写入、NPU 读取、Display 读取、CPU 运行程序可能同时访问 DDR。必须结合互联仲裁、QoS、DMA、双缓冲和带宽预算一起设计。

### 五、Flash 与 OTP/eFuse 的角色
- **Flash**：掉电不丢，保存 BootLoader、固件、配置、文件系统
- **OTP/eFuse**：一次性写入，用于芯片 ID、安全启动配置、密钥哈希、调试口锁定

### 六、存储控制器的本质
把复杂存储介质细节封装起来，对 SoC 内部提供统一、可访问、可管理的存储资源。包括：地址译码、时序控制、访问仲裁、突发传输、刷新管理、ECC、低功耗管理、初始化校准。

### 七、存储映射：软硬件契约
地址规划影响启动、驱动、安全、调试和系统扩展，必须早期规划并保留扩展空间。

### 八、实践例子：摄像头图像全流程
摄像头 → ISP → Camera DMA 写入 DDR → NPU 读取推理 → Display 读取 framebuffer → CPU 处理结果。涉及：DDR 共享带宽、SRAM 关键缓冲、Cache 一致性维护、Flash 保存算法固件。

### 九、存储子系统最容易踩的坑
1. **只看容量，不看带宽** — 多模块并发时带宽和延迟才是瓶颈
2. **忽略最坏情况延迟** — Cache Miss 导致硬实时场景抖动
3. **DMA 与 Cache 一致性处理不清楚** — 嵌入式系统常见 bug 来源
4. **地址映射规划不清晰** — 后期修改成本极高
5. **忽略存储安全** — 哪些地址可执行、哪些区域安全世界可访问、密钥是否能被直接读出

## 技术亮点

| 亮点 | 说明 |
|------|------|
| 仓储体系类比 | 手边工具→抽屉→资料柜→仓库→档案室→远程仓库，极直观 |
| Cache/SPM 取舍框架 | 明确区分"平均性能"与"确定性"两种设计目标 |
| 完整数据生命周期 | 从采集→处理→显示→存储，全链路展示存储子系统作用 |
| 五句设计原则 | 分层、热数据近计算、Cache/SPM 取舍、DDR 共享资源、地址映射契约 |
| 安全视角 | 将 OTP/eFuse 和安全启动纳入存储子系统范畴 |

## 质量评估

| 维度 | 评分 | 说明 |
|------|------|------|
| 技术深度 | ⭐⭐⭐⭐⭐ | 从寄存器到 Flash 的完整存储 spectrum，含控制器视角 |
| 工程实用性 | ⭐⭐⭐⭐⭐ | 五句原则 + 五个避坑点，工程价值极高 |
| 系统性 | ⭐⭐⭐⭐⭐ | 层级 → 矛盾 → 各层详解 → 控制器 → 映射 → 实例 → 避坑 |
| 可读性 | ⭐⭐⭐⭐⭐ | 仓储类比 + 摄像头实例，零基础友好 |

## 建议行动

- ✅ 创建 [[memory-subsystem]] 概念词条
- ✅ 创建 [[spm]] 概念词条（ScratchPad Memory）
- ✅ 将"五句存储设计原则"纳入 SoC 架构评审模板
- ✅ 建立 DDR 带宽预算建模模板（含多主并发场景）
- ✅ 结合 [[src-onechan-soc-interconnect-subsystem]] 理解 DDR 仲裁与 QoS

## Related Pages

- [[memory-subsystem]] — 存储子系统概念词条（待创建）
- [[cache]] — Cache 概念（已有）
- [[ddr5]] — DDR5 概念（已有）
- [[spm]] — ScratchPad Memory 概念（待创建）
- [[soc]] — SoC 系统级芯片概念词条（待创建）
- [[src-onechan-soc-peripheral-subsystem]] — 外设子系统（同系列第1篇）
- [[src-onechan-soc-interconnect-subsystem]] — 互联子系统（同系列第2篇）
- [[src-onechan-soc-processor-subsystem]] — 处理器子系统（同系列第4篇）
- [[src-onechan-soc-low-power-design]] — 架构级低功耗设计（同系列第5篇）

## 开放问题

- SPM 与 Cache 的混合架构（部分地址 Cacheable、部分 SPM-managed）在当代 AI SoC 中的最佳实践是什么？
- 3D DRAM / HBM / CXL 等新型存储技术如何改变传统 SoC 存储层级设计？
- 存储安全（安全启动、密钥保护、防回滚）在不同安全等级（Consumer/Automotive/Military）下的差异化要求如何系统化整理？
