---
doc_id: soc-subsystems-overview
title: SoC 五大子系统综合对比
page_type: synthesis
related_sources:
  - src-onechan-soc-peripheral-subsystem
  - src-onechan-soc-interconnect-subsystem
  - src-onechan-soc-memory-subsystem
  - src-onechan-soc-processor-subsystem
  - src-onechan-soc-low-power-design
  - src-soc-register-default-values
related_concepts:
  - soc
  - peripheral-subsystem
  - interconnect-subsystem
  - memory-subsystem
  - processor-subsystem
  - low-power-design
  - register-default-values
created: 2026-05-09
updated: 2026-06-22
tags: [synthesis, soc, architecture, system-design]
---

# SoC 五大子系统综合对比

## 系统关系图

```
                    ┌─────────────┐
                    │   处理器子系统  │  ← 大脑：CPU/GPU/NPU/DSP
                    │  (计算与控制)  │
                    └──────┬──────┘
                           │ 取指/访存
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────┴──────┐ ┌──────┴──────┐ ┌──────┴──────┐
    │   存储子系统   │ │   互联子系统   │ │   外设子系统   │
    │  (记忆系统)   │ │  (道路桥梁)   │ │  (感官手脚)   │
    │ Cache/SRAM/  │ │  AXI/AHB/   │ │ UART/I2C/   │
    │ DDR/Flash    │ │  APB/NoC    │ │ SPI/USB/... │
    └─────────────┘ └─────────────┘ └─────────────┘
                           │
                    ┌──────┴──────┐
                    │   低功耗设计   │  ← 贯穿所有子系统
                    │ (DVFS/门控/   │
                    │  电源域管理)   │
                    └─────────────┘
```

## 寄存器与硬件契约：默认值不是"无人值守"，而是设计决策

寄存器默认值是芯片上电后、固件写第一行代码之前，数字设计工程师在 RTL 里一个触发器一个触发器指定的初始状态。它是芯片和固件之间的沉默契约。

### 默认值的物理来源

| 类型 | 机制 | 状态 | 说明 |
|------|------|------|------|
| 带异步复位端 | POR 强制拉回复位值 | 确定（0 或 1） | RTL 里 FDCE/FDPE 例化时指定 |
| 无复位端 | 热噪声/工艺偏差 | 随机（undefined） | 手册标 "u"，不能依赖 |
| 硬件自动加载 | POR 后状态机自动写入 | 确定但需等待 | 某些外设需等若干微秒 |

### 为什么不是全 0？

1. **上电安全**：某些"关闭"电平在物理上是高电平 → 复位值必须指定为 1
2. **覆盖常用场景**：数字设计工程师替固件写初始化（如 PLL 默认 8 倍频、Flash 默认 1 等待周期）
3. **面积/功耗取舍**：高速路径/FIFO 省略复位端，用硬件自动加载补偿

### 固件三大陷阱

1. **依赖默认值**：芯片版本/换 IP 后默认值可能变化 → 全部显式写入
2. **对只写寄存器读-修改-写**：读返回的 0 是总线接口假象 → 用影子变量维护状态
3. **自动加载未完成就访问**：换电源芯片后上电斜率变化 → 遵守手册延迟

### 固件铁律

- 不依赖任何默认值，初始化阶段全部显式写入
- 只写寄存器用影子变量，完整赋值
- 上电先验证芯片ID、复位状态、时钟状态（生存基线）
- 手册标 "default: u" 的位必须显式初始化

---

## 子系统核心职责对比

| 维度 | 处理器子系统 | 存储子系统 | 互联子系统 | 外设子系统 | 低功耗设计 |
|------|-----------|-----------|-----------|-----------|-----------|
| **核心问题** | 谁来算？怎么算？ | 数据放哪？怎么取？ | 模块怎么连？谁优先？ | 怎么连外设？ | 怎么省电？ |
| **关键指标** | 性能、能效比 | 带宽、延迟、容量 | 带宽、延迟、仲裁效率 | 接口种类、速率 | 功耗、唤醒时间 |
| **设计哲学** | 专用优于通用 | 热数据靠近计算 | 合适的路给合适的流量 | 事件驱动优于轮询 | 会干活优于少干活 |
| **最常见坑** | 大小核调度失衡 | Cache 一致性 Bug | 总线死锁/带宽不足 | DMA 与 CPU 冲突 | 电源域隔离不彻底 |

## 设计权衡矩阵

| 场景 | 处理器选择 | 存储策略 | 互联方案 | 外设重点 | 功耗策略 |
|------|----------|---------|---------|---------|---------|
| **手机 SoC** | 大小核 + GPU + NPU | LPDDR + 大 Cache | AXI Crossbar | USB/Camera/Display | DVFS + Aggressive 门控 |
| **车载 SoC** | 多核 A76 + 安全核 | ECC DDR + 双备份 | NoC + 冗余 | CAN/Ethernet/摄像头 | 功能安全优先 |
| **IoT MCU** | Cortex-M 单核 | 小 SRAM + Flash | AHB/APB | I2C/SPI/GPIO | 深度睡眠 + 事件唤醒 |
| **AI 加速器** | NPU 阵列 + 控制核 | HBM + 本地 SRAM | 高带宽 NoC | PCIe/网络 | 电源域精细划分 |
| **电视 SoC** | 多核 A55 + GPU | DDR4 + 大帧缓冲 | AXI + QoS | HDMI/USB/WiFi | 待机功耗优化 |

## 协同设计要点

### 1. 处理器 ↔ 存储
- Cache 策略影响处理器性能上限
- NPU 本地 SRAM 决定 AI 推理效率
- 内存带宽不足时，再强的处理器也跑不动

### 2. 处理器 ↔ 互联
- 多核一致性依赖互联协议（ACE/CHI）
- 中断路由影响实时响应
- 任务调度需考虑互联拓扑

### 3. 存储 ↔ 互联
- DDR 带宽是所有主设备的共享瓶颈
- QoS 机制保证关键数据优先传输
- DMA 减少 CPU 参与数据搬运

### 4. 外设 ↔ 低功耗
- 外设事件唤醒是低功耗系统的生命线
- GPIO 中断设计决定唤醒响应速度
- 时钟门控粒度影响功耗下限

### 5. 全系统 ↔ 低功耗
- 电源域划分需要所有子系统配合
- 状态保持（Retention）策略跨模块协调
- 唤醒序列涉及多个子系统时序

## 典型数据流示例

### 摄像头 → AI 推理 → 显示
```
Camera → ISP → DDR(framebuffer) → NPU → DDR(result)
                     ↓                           ↓
               Display Controller ←─────────────┘
```
- **外设**：Camera 接口接收图像
- **存储**：DDR 存储帧缓冲和推理结果
- **处理器**：NPU 执行 AI 推理
- **互联**：DMA 搬运数据，总线仲裁协调多主访问
- **功耗**：ISP 和 NPU 按需开启，空闲时门控

## 相关来源

- [[src-onechan-soc-peripheral-subsystem]] — 外设子系统
- [[src-onechan-soc-interconnect-subsystem]] — 互联子系统
- [[src-onechan-soc-memory-subsystem]] — 存储子系统
- [[src-onechan-soc-processor-subsystem]] — 处理器子系统
- [[src-onechan-soc-low-power-design]] — 低功耗设计
- [[src-soc-register-default-values]] — 寄存器默认值与硬件契约

## 相关概念

- [[soc]] — SoC 总览
- [[peripheral-subsystem]] — 外设子系统
- [[interconnect-subsystem]] — 互联子系统
- [[memory-subsystem]] — 存储子系统
- [[processor-subsystem]] — 处理器子系统
- [[low-power-design]] — 低功耗设计

## 开放问题

- Chiplet 架构下，子系统边界是否会重新定义？
- 存算一体（Compute-in-Memory）是否会融合处理器和存储子系统？
- 自动驾驶 SoC 的功能安全要求如何影响子系统设计权衡？
