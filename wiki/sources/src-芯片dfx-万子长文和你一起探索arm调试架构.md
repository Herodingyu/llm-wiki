---
doc_id: src-芯片dfx-万子长文和你一起探索arm调试架构
title: 【芯片DFX】万子长文和你一起探索Arm调试架构
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【芯片DFX】万子长文和你一起探索Arm调试架构.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

本文是一篇深入探索ARM调试架构的万字长文，系统梳理了ARM生态中三大调试相关规范（Arm ARM指令集手册、CoreSight架构、ADI调试接口）的关系与分工。文章首先介绍了调试寄存器的三种访问接口（External Debug Interface通过DAP、Memory-mapped Interface复用系统总线、System Register Interface通过专用指令），并对比了External Debug（裸机调试，halt状态）和Self-hosted Debug（OS内调试，异常陷入）两种调试模型的本质差异。随后深入探讨了Debug over Powerdown的实现机制，从v7-A的core/debug power domain分离到DynamIQ的DebugBlock架构演进。在CoreSight & ADI部分，文章详细比较了SoC-400（CoreSight v2 + ADI v5.2）和SoC-600（CoreSight v3 + ADI v6）两代架构，重点分析了DAP拓扑变化（DP+APBIC+AP取代DP+DAPBUS）、Power Control机制（DP power control和Granular power control）、以及Secure Debug的认证体系（DBGEN/SPIDEN信号、Secure Enclave生命周期管理、SDC-600安全调试通道）。

## Key Points

### 1. 调试架构三规范的关系

| 规范 | 定义范围 | 核心作用 |
|------|---------|---------|
| Arm ARM | 处理器内部debug/trace功能 | 架构基石（breakpoint/watchpoint/ETM） |
| CoreSight | 与Arm兼容的debug/trace行为 | 多核调试架构外延 |
| ADI | SoC与外部物理连接（JTAG/SWD） | 调试接口规范 |

**历史关系**：ADI先于CoreSight存在，为兼容ARM7/ARM9的legacy scan chain和新兴的CoreSight多核架构，ADI保持了独立规范。CoreSight架构范畴包含ADI-compliant的DAP实现。

### 2. 调试寄存器接口

#### 2.1 External Debug Interface

通过DAP（Debug Access Port）连接外部调试器，使用ROM Table发现组件：

| ROM Table层级 | 作用 | 典型地址 |
|--------------|------|---------|
| DP ROM | 发现系统中的MEM-APs | 0x0 |
| Cluster level ROM | 发现APB-AP子系统内的debug资源 | APB-AP基地址+0 |

**组件地址规则**：每个组件占用4KB地址空间，entry保存`[x:12]`地址。

#### 2.2 Memory-mapped Interface

从interconnect出APB口绕回子系统入口，core可在不依赖外部调试器的情况下访问debug寄存器。

#### 2.3 System Register Interface

通过专用指令访问debug系统寄存器，大部分要求EL1及以上权限，主要用于内核层面的debug agent（如kgdb）。

### 3. 调试模型对比

| 特性 | External Debug | Self-hosted Debug |
|------|---------------|-------------------|
| 典型场景 | 裸机调试、bring-up | OS内软件调试 |
| Debug Event行为 | 进入halt状态 | 上报异常并陷入 |
| 单步调试 | Halting step（halt→执行→halt） | Software step（exception→执行→exception） |
| 工具 | JLink/DSTREAM | gdb/kgdb |

**kgdb单步实现**：`kernel_enable_single_step()`设置`MDSCR_EL1.SS=1`和`PSTATE.SS=1`，异常返回后执行一条指令再次触发software step exception。

### 4. Debug over Powerdown演进

| 架构 | 实现方式 | 问题/改进 |
|------|---------|----------|
| v7-A早期 | Core domain + Debug domain分离 | 基本满足 |
| 早期v8-A（A57/A72） | 独立debug power domain | cluster idling导致debug domain掉电 |
| DynamIQ（A55+） | DebugBlock完全脱离cluster | 独立power domain，物理位置灵活 |

### 5. CoreSight SoC架构对比

| 特性 | SoC-400 (2012) | SoC-600 (2017) |
|------|---------------|---------------|
| CoreSight版本 | v2.0 | v3.0 |
| ADI版本 | v5.2 | v6.0 |
| DAP拓扑 | DP + DAPBUS + AP | DP + APBIC + AP |
| AP地址空间 | 8bit（APv1） | 4KB（APv2，作为CoreSight组件） |
| 调试端口 | JTAG/SWD | 支持非JTAG/SWD（PCIe/USB等） |
| ROM Table | 无AP层级ROM | 有AP层级ROM Table |

### 6. Power Control机制

#### 6.1 DP Power Control

DP寄存器`CTRL/STAT[31:28]`提供两对握手信号：
- `CDBGPWRUPREQ/ACK`：控制Debug power domain
- `CSYSPWRUPREQ/ACK`：控制System power domain

#### 6.2 Granular Power Control演进

| 架构 | 实现 | 位置 |
|------|------|------|
| CoreSight v2 | GPR（Granular Power Requester） | 独立组件，挂在MEM-AP后级 |
| CoreSight v3/ADIv6 | 集成到ROM Table（class 0x9） | ROM Table entry中增加DBGPCR/DBGPSR |

### 7. Secure Debug认证体系

#### 7.1 认证信号

| 信号 | 含义 |
|------|------|
| DBGEN | Invasive debug enable |
| SPIDEN | Secure invasive debug enable |
| NIDEN | Non-invasive debug enable（v8.4后取消） |
| SPNIDEN | Secure non-invasive debug enable（v8.4后取消） |

#### 7.2 配置方式

1. **固定值**（Tied LOW/HIGH）
2. **OTP一次性编程**（按产品生命周期配置）
3. **Custom Authentication Module**（挑战-响应机制，最优方案）

#### 7.3 Secure Enclave生命周期

| 状态 | SCB输出 | 说明 |
|------|---------|------|
| Chip Manufacture | 未规定 | 设计/制造阶段 |
| Device Manufacture | 未规定 | OEM阶段 |
| Secure Enable | 默认0 | 产品上市，可通过challenge-response修改 |
| RMA | 未规定 | 生命周期终点 |

#### 7.4 SDC-600安全调试通道

 debugger → SDC-600 → Secure Enclave（证书注入/验证）→ 使能DAP与Host system通路

## Key Quotes

> "各种形式的debug的最终目的都是获取core的状态，控制core的行为。这都是通过对core内的debug register进行读写来实现的。"

> "两种调试模型最本质的差异在于debug event触发后的不同行为：在external debug模型下，core会进入halt状态；而在self-hosted debug模型下，core会上报异常并陷入对应的EL级别进行异常处理。"

> "DebugBlock的出现是为了更好地支持debug over powerdown，它算不上是多大的改动，因为里面的东西还是那些，只不过在hierarchy上完全脱离cluster。"

> "ADIv6 permits debug links other than JTAG or SWD to access the AP layer, so that multiple different links can be used to access debug functionality."

> "现代架构完善的debug机制提供了内核的高度可见性，这对于开发者来说是一件利器，但同样给恶意访问提供了便利。"

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【芯片DFX】万子长文和你一起探索Arm调试架构.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【芯片DFX】万子长文和你一起探索Arm调试架构.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【芯片DFX】万子长文和你一起探索Arm调试架构.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【芯片DFX】万子长文和你一起探索Arm调试架构.md|原始文章]]
