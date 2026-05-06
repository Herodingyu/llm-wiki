# SoC 外设 IP 架构设计手册

> **文档版本**: v1.0  
> **适用范围**: 嵌入式 SoC 数字外设 IP 设计与软件开发  
> **总线架构**: ARM AMBA AXI4/AHB Lite/APB4  

---

# 1. SoC 顶层架构总览

本章为后续 13 个外设 IP 的详细设计建立系统级上下文，阐明总线互联拓扑、地址空间规划以及中断/时钟/复位信号的全局分配策略。所有 IP 模块均通过统一的 APB 配置接口接入系统，其中 DMA 控制器额外具备 AXI4 Master 数据通路，以实现高速存储器访问与外设数据搬运。

## 1.1 系统互联拓扑

### 1.1.1 总线矩阵架构：CPU Core + AXI Crossbar + AHB/APB Bridge 的分层总线结构

本 SoC 采用三级分层总线架构，从高到低依次为 AXI4 交叉开关（Crossbar）、AHB Lite 矩阵、APB 总线桥接层。该分层设计的核心考量在于性能与面积的权衡：CPU 指令/数据取指和 DMA 大块数据传输对带宽与延迟敏感，因此挂载于 AXI4 总线层；而外设寄存器访问以单字读写为主、吞吐量低，降级到 APB 总线层可显著降低门数与功耗。

顶层总线为 64-bit 数据位宽的 AXI4 Crossbar，配置 2 个 Master 端口（CPU Core 的 D-bus 与 DMA 控制器的 AXI Master）和 3 个 Slave 端口。Slave 端口 0 连接 AXI-to-AHB Lite Bridge，负责将配置访问下传至 APB 外设；Slave 端口 1 连接片内 AXI4 SRAM Controller，提供低延迟的紧耦合存储器（TCM）访问；Slave 端口 2 保留为 AXI 扩展端口，用于外挂高带宽外设或外部存储器控制器。

AHB Lite 矩阵位于第二级，由 AXI-to-AHB Bridge 的 Master 端口驱动，向下分发到 8 个 AHB Slave 端口。其中 2 个端口分别连接 AHB-to-APB Bridge-0 和 Bridge-1，其余 6 个端口保留给高速 AHB 外设（如 USB、SD/eMMC 控制器）或未来的总线扩展。两级 APB 桥接器将 32-bit AHB 事务转换为 APB 协议，挂接全部 13 个 APB Slave 外设，每个桥接器最多承载 8 个外设，总地址空间覆盖 0x4000_0000 至 0x4000_CFFF。

### 1.1.2 各 IP 在总线层级中的位置：DMA 挂 AXI Master，外设挂 APB Slave

在总线层级定位上，各 IP 的接口属性决定其挂载位置。DMA 控制器具备双重接口：其 AXI4 Master 端口直接连接至 AXI Crossbar 的 Master 端口，支持突发（Burst）传输以完成存储器到存储器、存储器到外设的数据搬运；其 APB Slave 配置端口则通过 AHB-to-APB Bridge 接入，供 CPU 配置通道参数、源/目的地址与传输长度。其余 12 个 IP（UART、I2C、SPI、I3C、GPIO/Pinmux、PWM、IR TX/RX、Mailbox、HW Semaphore、Timer、Watchdog、RTC）均为纯 APB Slave，仅响应来自 CPU 或 DMA 的寄存器读写事务。

值得注意的是，GPIO/Pinmux 模块虽然以 APB Slave 存在，但其控制的 32 根物理引脚可映射到 UART 的 TX/RX、I2C 的 SDA/SCL、SPI 的 MOSI/MISO 等多路复用功能。引脚映射关系通过 GPIO 配置寄存器静态或动态切换，该控制路径同样经过 APB 总线层。

### 1.1.3 多主多从互连关系：CPU、DMA 作为 Master；外设 IP 作为 Slave 的访问矩阵

系统存在两类总线主设备（Bus Master）和三类从设备（Bus Slave）。主设备包括 CPU Core（发起指令与数据访问）与 DMA 控制器（发起外设数据搬运访问）。从设备分为三组：AXI 层的片内 SRAM 与扩展端口、AHB 层的 APB 桥接器、APB 层的 13 个外设寄存器接口。

访问矩阵遵循"主设备可访问所有从设备"的完全互连原则，但受地址译码器约束。CPU 可访问全部外设寄存器以完成配置与状态查询，亦可访问 SRAM 进行代码执行与数据存取。DMA 的 AXI Master 在传输过程中同时需要访问 SRAM（数据源或目的地）与外设寄存器（如 UART FIFO 地址），因此地址译码器必须保证 DMA 对 APB 外设地址段的可见性。各外设之间不存在直接总线访问路径，所有通信必须通过共享存储器或 Mailbox/HW Semaphore 等同步机制间接完成。

以下为 SoC 顶层架构总框图，展示总线层级、主从关系以及各 IP 的物理连接位置：

```
+------------------------+    +------------------------+
|     CPU Core           |    |    DMA Controller      |
|  (AXI4 Master, D-bus)  |    |  (AXI4 Master / APB  |
|                        |    |       Slave)           |
+-----------+------------+    +-----------+------------+
            |                             |
            +-------------+---------------+
                          |
              +-----------v------------+
              |    AXI4 Crossbar        |
              |   (2 Masters × 3        |
              |         Slaves)          |
              +-----------+------------+
                          |
        +-----------------+-----------------+
        |                 |                 |
 +------v------+   +------v------+   +------v------+
 | AXI-to-AHB  |   | AXI4 SRAM   |   | AXI Slave   |
 |   Bridge    |   | Controller  |   | (Expansion) |
 +------+------+   +-------------+   +-------------+
        |
        | AHB Lite Matrix
        | (1 Master × 8 Slaves)
        |
 +------v--------------------------------------v------+
 |         AHB-to-APB Bridge-0                  |        |
 |         AHB-to-APB Bridge-1                  |        |
 +------+---------------+---------------+------+        |
        |               |               |                 |
 +------v----+   +-----v----+   +-----v----+   +-----v----+
 |   UART    |   |   I2C    |   |   SPI    |   |   I3C    |
 |0x4000_0000|   |0x4000_1000|   |0x4000_2000|   |0x4000_3000|
 +-----------+   +----------+   +----------+   +----------+
 | GPIO/Pin  |   |   PWM    |   | IR TX/RX |   | DMA CFG  |
 | 0x4000_4000|   |0x4000_5000|   |0x4000_6000|   |0x4000_7000|
 +-----------+   +----------+   +----------+   +----------+
 |  Mailbox  |   |  HW Sem  |   |  Timer   |   |   WDT    |
 | 0x4000_8000|   |0x4000_9000|   |0x4000_A000|   |0x4000_B000|
 +-----------+   +----------+   +----------+   +----------+
 |   RTC     |
 | 0x4000_C000|
 +-----------+

 +----------------------------------------------------------------+
 |              Interrupt Aggregator  →  NVIC / GIC               |
 |     [IRQ0:UART] [IRQ1:I2C] [IRQ2:SPI] [IRQ3:I3C] ...           |
 +----------------------------------------------------------------+
```

框图中，箭头方向表示主从关系的数据流向。AXI Crossbar 位于中心枢纽，CPU 与 DMA 作为 Master 向下访问所有 Slave 节点；AHB-to-APB Bridge 作为协议转换与地址路由节点，将 13 个外设按地址段分接至两个 APB 桥接器上；Interrupt Aggregator 收集所有外设中断源并统一向 NVIC（嵌套向量中断控制器）或 GIC（通用中断控制器）递交请求。

## 1.2 地址空间规划

### 1.2.1 APB 外设统一地址映射表：基地址分配与地址区间划分

APB 外设统一编址于 0x4000_0000 起始的 64 KB 连续物理地址空间中。每个外设预留 4 KB（0x1000）地址窗口，遵循 32-bit 字对齐原则。4 KB 的粒度足以容纳 64 个 32-bit 配置寄存器（每个寄存器占 4 字节）以及保留/测试寄存器，为各 IP 后续的功能扩展预留余量。地址映射表如表 1-1 所示。

**表 1-1 APB 外设地址映射表**

| IP 名称 | 基地址（Base） | 结束地址（End） | 地址范围大小 | 总线接口 |
|---------|--------------|----------------|------------|---------|
| UART | 0x4000_0000 | 0x4000_0FFF | 4 KB | APB Slave |
| I2C Master/Slave | 0x4000_1000 | 0x4000_1FFF | 4 KB | APB Slave |
| SPI Master/Slave | 0x4000_2000 | 0x4000_2FFF | 4 KB | APB Slave |
| I3C | 0x4000_3000 | 0x4000_3FFF | 4 KB | APB Slave |
| GPIO/Pinmux | 0x4000_4000 | 0x4000_4FFF | 4 KB | APB Slave |
| PWM | 0x4000_5000 | 0x4000_5FFF | 4 KB | APB Slave |
| IR TX/RX | 0x4000_6000 | 0x4000_6FFF | 4 KB | APB Slave |
| DMA (Config) | 0x4000_7000 | 0x4000_7FFF | 4 KB | APB Slave |
| Mailbox | 0x4000_8000 | 0x4000_8FFF | 4 KB | APB Slave (Dual-port) |
| HW Semaphore | 0x4000_9000 | 0x4000_9FFF | 4 KB | APB Slave (Multi-port) |
| Timer | 0x4000_A000 | 0x4000_AFFF | 4 KB | APB Slave |
| Watchdog | 0x4000_B000 | 0x4000_BFFF | 4 KB | APB Slave |
| RTC | 0x4000_C000 | 0x4000_CFFF | 4 KB | APB Slave (VBAT domain) |
| **保留/扩展** | 0x4000_D000 | 0x4000_FFFF | 12 KB | — |

地址映射的顺序依据通信协议类型与功能相关性编排：串行通信类外设（UART、I2C、SPI、I3C）置于低地址段便于快速定位；通用 IO 与控制类（GPIO、PWM、IR）随后；系统服务类（DMA 配置、Mailbox、HW Semaphore、Timer、Watchdog、RTC）置于高地址段。保留的 12 KB 地址空间（0x4000_D000 至 0x4000_FFFF）为未来新增外设或功能扩展预留。

### 1.2.2 寄存器偏移地址统一编码规则：32-bit 对齐，每 IP 预留 4KB 空间

在 4 KB 的 IP 级地址窗口内部，寄存器偏移地址采用统一编码规范。基地址以上的偏移量以 32-bit（4 字节）为单位递增，即寄存器 n 的绝对地址为 `Base + n × 4`。所有寄存器位宽固定为 32-bit，低 16-bit 或低 8-bit 用于实际功能位域，高位保留（Read-As-Zero, Write-Ignored）。

偏移地址 0x000 至 0x00C 通常分配为模块标识寄存器（ID/版本寄存器）与全局控制寄存器（使能/复位/时钟门控），偏移 0x010 至 0x0FC 分配功能配置寄存器，偏移 0x100 至 0x1FC 分配中断与状态寄存器，偏移 0x200 以上保留或用于测试接口。该编码规则确保各 IP 的寄存器手册格式一致，便于驱动程序以统一结构体访问。

此外，地址译码器在 AHB-to-APB Bridge 中实现，采用高位匹配（Base Address Masking）机制。以 UART 为例，译码器检查地址位 [31:12] 是否等于 0x40000，若匹配则选中 UART 的 PSEL（Peripheral Select）信号，地址位 [11:0] 作为内部偏移传入 UART 寄存器文件。未命中任何外设地址窗口的事务将返回总线错误（PSLVERR = 1），由 CPU 的硬故障处理程序捕获。

## 1.3 系统信号分配

### 1.3.1 中断路由架构：各 IP 中断源 → 中断聚合器 → NVIC/GIC 的映射关系

本 SoC 包含 18 个独立中断请求（IRQ）信号，由 13 个外设产生，经两级聚合后送达 NVIC。第一级为各 IP 内部的中断源合并：GPIO 的 32 个引脚中断、Timer 的 4 个通道中断分别在模块内部通过使能/状态寄存器聚合为单个 IRQ 输出；第二级为全局中断聚合器（Interrupt Aggregator），负责将异步外设 IRQ 同步到处理器时钟域并完成电平/边沿转换。中断聚合器输出连接至 NVIC 的 32 个外部中断输入线（IRQ[31:0]）中的低 18 位，高 14 位保留供系统扩展。

中断映射表（表 1-2）列出每个外设对应的中断号、触发类型以及用途说明。触发类型决定 NVIC 的检测方式：电平触发（Level-sensitive）要求 ISR 清除外设中断源以拉低信号；上升沿触发（Rising-edge）适用于脉冲型事件；高低电平触发（High/Level）表示中断源持续为高直至清除。

**表 1-2 外设中断映射表**

| IP 名称 | 中断号（IRQ） | 触发类型 | 中断源描述 | 目标处理器 |
|---------|-------------|---------|----------|-----------|
| UART | IRQ[0] | 电平触发 | 发送 FIFO 空 / 接收 FIFO 满 / 错误 | Cortex-M / RISC-V |
| I2C | IRQ[1] | 电平触发 | 传输完成 / 仲裁丢失 / 地址匹配 | Cortex-M / RISC-V |
| SPI | IRQ[2] | 电平触发 | 传输完成 / FIFO 状态 / 模式错误 | Cortex-M / RISC-V |
| I3C | IRQ[3] | 电平触发 | SDR/HDDR 完成 / 动态地址分配 / CCC 命令 | Cortex-M / RISC-V |
| GPIO | IRQ[4] | 电平触发 | 32 引脚边沿/电平中断聚合 | Cortex-M / RISC-V |
| PWM | IRQ[5] | 上升沿触发 | 周期完成 / 比较匹配 | Cortex-M / RISC-V |
| IR TX/RX | IRQ[6] | 上升沿触发 | 帧发送完成 / 帧接收完成 / 解码错误 | Cortex-M / RISC-V |
| DMA | IRQ[7] | 电平触发 | 通道传输完成 / 总线错误 / 链表终止 | Cortex-M / RISC-V |
| Mailbox A→B | IRQ[8] | 上升沿触发 | 处理器 A 向处理器 B 写入邮件 | Core B |
| Mailbox B→A | IRQ[9] | 上升沿触发 | 处理器 B 向处理器 A 写入邮件 | Core A |
| HW Semaphore | IRQ[10] | 上升沿触发 | 信号量解锁事件（按核心广播） | 多核心 |
| Timer | IRQ[11] | 电平触发 | 4 通道计数器溢出 / 比较匹配聚合 | Cortex-M / RISC-V |
| Watchdog | IRQ[12] | 上升沿触发 | 预警中断（复位前 N 周期告警） | Cortex-M / RISC-V |
| RTC 秒 tick | IRQ[13] | 上升沿触发 | 1 Hz 秒计数器溢出 | Cortex-M / RISC-V |
| RTC 闹钟 | IRQ[14] | 上升沿触发 | 匹配预设闹钟时刻 | Cortex-M / RISC-V |
| 保留 | IRQ[15:17] | — | 预留扩展 | — |
| 保留 | IRQ[18:31] | — | 预留扩展 | — |

Mailbox 与 HW Semaphore 的中断在多核配置下具有定向属性：Mailbox 的 A→B 中断仅路由至目标核心 B 的 NVIC 输入线，避免无关核心被唤醒；HW Semaphore 的中断在信号量被任意核心释放时广播至所有监听核心，由软件轮询 semaphore ID 寄存器判定是否与本核心相关。

### 1.3.2 时钟域划分：PCLK 主时钟域、WDT_RTC 32kHz 时钟域、DMA AXI 时钟域

SoC 内部存在三个功能时钟域（Clock Domain）以及一个常开电源域时钟，如表 1-3 所示。时钟域划分旨在实现动态时钟门控与低功耗模式切换：当某功能模块空闲时，其所属时钟可由时钟门控单元（Clock Gating Cell）关闭而不影响其他模块。

**表 1-3 时钟域划分表**

| 时钟域名称 | 时钟源频率（典型值） | 覆盖 IP / 模块 | 时钟门控支持 | 说明 |
|-----------|-------------------|--------------|------------|------|
| PCLK 主时钟域 | HCLK / 2（如 50 MHz） | UART, I2C, SPI, I3C, GPIO, PWM, IR, DMA CFG, Mailbox, HW Sem, Timer | 按 IP 独立门控 | 外设寄存器访问基准时钟 |
| AXI 系统时钟域 | HCLK（如 100 MHz） | CPU Core, AXI Crossbar, AXI SRAM Controller, DMA AXI Master | Crossbar 全局门控 | 高速数据通路与存储器访问 |
| WDT_RTC 32kHz 时钟域 | 外部 32.768 kHz 晶振 | Watchdog 计数器, RTC 计数器 | 不可门控（常开） | 低功耗时基与唤醒 |
| VBAT 电源域 | 32.768 kHz / 内部 RC | RTC 保持寄存器, 备份域 SRAM | 不可门控 | 主电源掉电时保持运行 |

PCLK 主时钟域由系统主时钟 HCLK 经 2 分频得到，频率通常为 50 MHz。该时钟域覆盖 11 个 APB 外设（不含 Watchdog 与 RTC）。每个外设配备独立的时钟使能位（位于系统时钟门控寄存器 SYSCFG_CLK_EN 中），软件可在初始化阶段使能对应位，在模块不使用时清零以降低动态功耗。

AXI 系统时钟域与 HCLK 同频（100 MHz 典型值），驱动 AXI Crossbar、SRAM Controller 以及 DMA 的 AXI Master 逻辑。DMA 控制器内部存在跨时钟域（Clock Domain Crossing, CDC）逻辑：配置端口处于 PCLK 域，数据端口处于 AXI 时钟域，两者通过异步 FIFO 与握手信号同步。

WDT_RTC 32kHz 时钟域使用外部 32.768 kHz 晶振或内部低功耗 RC 振荡器作为时基。Watchdog 的递减计数器与 RTC 的秒计数器均运行在该时钟域，以保证主时钟关闭（如系统进入 Deep-Sleep 模式）时仍能维持计时与 watchdog 超时检测。32kHz 时钟域与 PCLK 域之间的寄存器访问通过专用同步器（Double-Flip-Flop Synchronizer）实现，APB 写事务更新 32kHz 域寄存器时需经历 2~3 个 32kHz 时钟周期的同步延迟。

VBAT 电源域是物理隔离的电源岛，由纽扣电池或超级电容供电。RTC 的闹钟匹配逻辑与备份寄存器位于该域，即使主电源（VDD）完全掉电仍可保持时间与闹钟设置。VBAT 域的 APB 访问在主电源恢复后自动重新使能，无需额外初始化。

### 1.3.3 复位策略：系统冷复位（PRESETn）、独立外设软复位、WDT 热复位分级结构

复位系统采用三级分级结构，以平衡复位粒度与系统稳定性。

第一级为系统冷复位（Cold Reset，信号 PRESETn，低有效）。该复位在上电、外部复位引脚拉低或电源监控电路（POR, Power-On Reset）触发时生效，作用于整个 SoC 除 VBAT 域外的所有逻辑。PRESETn 的释放遵循时钟稳定后的同步释放机制，由复位同步器（Reset Synchronizer）确保所有时钟域的复位解除在不同上升沿完成，避免亚稳态传播。

第二级为独立外设软复位（Individual Peripheral Soft Reset）。每个 APB 外设在系统控制模块（SYSCFG）中配备 1-bit 软复位寄存器位。软件向对应位写 1 后，该位自动清零（自清除，Self-clearing），产生一个持续 4 个 PCLK 周期的局部复位脉冲至目标外设。该机制允许在系统运行中单独复位某个外设（如 UART 波特率配置错误后重置 FIFO 与状态机），而无需影响其他模块或全局系统状态。所有 13 个外设的软复位控制位集中映射于 SYSCFG 的 0x400F_0004（外设软复位寄存器 PER_RST），各 IP 对应的位域在后续章节详细定义。

第三级为看门狗热复位（Warm Reset）。Watchdog 模块在计数器递减至零时触发系统热复位，该复位信号 WDT_RSTn 直接驱动全局复位网络，效果与 PRESETn 类似，但保留部分调试与诊断寄存器（如复位原因寄存器 RST_CAUSE）的内容以供软件分析复位源。WDT_RSTn 不复位 VBAT 域的 RTC 逻辑，确保系统重启后闹钟与时间基准不丢失。

此外，RTC 的 VBAT 域具备独立的复位引脚（RTC_RSTn），用于在更换纽扣电池后手动清零备份域寄存器。该引脚与主复位域物理隔离，仅影响 RTC 内部逻辑。

三级复位结构的优先顺序为：PRESETn > WDT_RSTn > 独立外设软复位。当 PRESETn 有效时，所有软复位控制与 WDT 输出均被屏蔽，确保系统级复位拥有最高优先级。复位原因寄存器（RST_CAUSE，位于 SYSCFG 偏移 0x000）的位 [0] 记录 POR/PRESETn 事件，位 [1] 记录 WDT_RSTn 事件，位 [2] 记录外部复位引脚事件，位 [3] 记录软件系统复位（通过 AIRCR 寄存器触发），位 [4:15] 保留。软件在启动时读取该寄存器即可判定本次启动的复位原因，进而执行差异化的初始化流程（如看门狗复位后进入诊断模式而非正常启动）。


---

## 2. UART — 通用异步收发器

通用异步收发器（Universal Asynchronous Receiver/Transmitter，UART）是 SoC 中最基础的外设通信接口，承担调试日志输出、Bootloader 串口下载、低速传感器通信等关键任务。其设计哲学在于以极简的布线（TX/RX 双绞线）换取可靠的点对点异步数据传输，同时通过硬件 FIFO 和中断机制将 CPU 从逐字节轮询中解放出来。本章采用 ARM PL011 风格的寄存器模型，该模型已在 ARM Cortex-A/M 系列处理器中被广泛验证，具备成熟的软件生态兼容性。

### 2.1 内部架构与框图

#### 2.1.1 UART 控制器顶层框图

UART IP 的整体数据流遵循一条清晰的串行处理链路：APB 总线上的配置与数据读写首先到达寄存器组，由波特率发生器产生定时基准，经 FIFO 缓冲后通过移位寄存器完成串行/并行转换，最终在中断控制器的调度下向 CPU 报告事件。以下框图展示了各子模块的互联关系与主要信号流向。

```
+--------------------------------------------------------------------------+
|                     UART Controller (APB Slave)                        |
|                                                                        |
|   APB Interface                                                        |
|   +--------------------+                                               |
|   | PCLK / PRESETn     |                                               |
|   | PSEL / PENABLE     |<---- APB Bus                                  |
|   | PWRITE / PADDR[11:0]                                                |
|   | PWDATA / PRDATA    |                                               |
|   +---------+----------+                                               |
|             |                                                          |
|             v                                                          |
|   +--------------------+    +--------------------+    +------------+ |
|   |   Register Bank    |--->|  Baud Rate Generator|--->| Clock Gate | |
|   | (CR/LCR/IBRD/FBRD/ |    |  (IBRD + FBRD)      |    | (16x Baud) | |
|   |  IMSC/IFLS/DR/FR)  |    +--------------------+    +------+-----+ |
|   +---------+----------+                                        |      |
|             |                                                     v      |
|             |           +-----------+    +-----------+   +-----------+ |
|             |           | TX FIFO   |    | RX FIFO   |   | Baud Clock| |
|             |           | (16x8b)   |    | (16x12b)  |   |           | |
|             |           +-----+-----+    +-----+-----+   +-----+-----+ |
|             |                 |                  |                |      |
|             |                 v                  v                v      |
|   +---------+----------+ +-------+        +-------+   +-------------+   |
|   | Interrupt Ctrl     | | TX Shift|<---->| RX Shift|<--| Line Ctrl  |   |
|   | (IMSC/RIS/MIS/ICR) | | Reg(8b) |    | Reg(12b)|   | & Status(FR) |   |
|   +---------+----------+ +----+----+    +----+----+   +-------+------+   |
|             |                 |               |               |        |
|             |                 v               v               v        |
|   +---------+----------+  UARTTXD         UARTRXD          UARTnCTS    |
|   | UARTINTR (ORed)    |  (TX Output)    (RX Input)       (Flow Ctrl)|
|   +--------------------+                                               |
+--------------------------------------------------------------------------+
```

图中 APB Interface 将外部 APB 总线协议转换为内部寄存器读写使能信号；Register Bank 集中管理全部软件可见寄存器，其输出同时驱动波特率发生器的分频系数和线路控制寄存器的帧格式参数；Baud Rate Generator 接收 IBRD（整数波特率除数）和 FBRD（小数波特率除数）后产生 16 倍波特率的内部采样时钟，该时钟直接驱动 TX/RX 移位寄存器的位节拍；TX FIFO 宽度为 8 位，RX FIFO 宽度为 12 位（其中高 4 位为 Break、Parity、Framing、Overrun 错误标志），二者深度均为 16 级；Interrupt Controller 将 11 个独立中断源经逻辑 OR 运算后输出单一的 UARTINTR 中断线，降低 CPU 中断向量占用。

#### 2.1.2 关键子模块说明

波特率发生器由两级结构组成：整数分频器和小数累加器。整数分频器直接对输入时钟 UARTCLK 做向下计数，产生粗调频率；小数累加器以 1/64 为步进单位累加 FBRD 值，每当累加溢出时向整数分频器借位，实现 0.015625 精度级的细调。该结构在 48 MHz 时钟下产生 115200 波特率的误差可控制在 0.02% 以内，满足 RS-232 标准对±2% 容差的要求。

TX/RX FIFO 的深度选定为 16 级，是在硅面积与软件开销之间的折中。深度过小（如 4 级）会导致 CPU 频繁进出中断服务程序，增加上下文切换开销；深度过大（如 64 级）在 8 位数据位、无校验位、1 位停止位的配置下可缓存近 7 个完整帧，虽降低中断频率，但在低波特率场景下会显著增加传输延迟。16 级深度配合可编程 FIFO 阈值（1/8、1/4、1/2、3/4、7/8），允许软件根据实时负载动态调整中断触发点。

帧格式控制器负责在发送端插入起始位、校验位和停止位，在接收端检测这些字段的有效性。其工作依赖 16x 采样时钟：接收器在检测到 RX 输入从高到低跳变后，在第 8 个采样时钟（即起始位中点）进行首采样确认，后续每 16 个采样时钟读取一位数据，这种"过采样中点采样"策略将位边界对齐误差容忍度扩展至 ±3.125%。

### 2.2 工作原理

#### 2.2.1 异步串行帧格式

UART 帧以线路空闲高电平为基准，每一帧由以下字段严格顺序拼接：1 位起始位（逻辑 0）、5 至 9 位数据位（LSB First）、可选的 1 位校验位、1 至 2 位停止位（逻辑 1）。数据位长度由 LCR_H.WLEN 字段设定，校验类型（奇/偶/固定/无）由 LCR_H.PEN、LCR_H.EPS、LCR_H.SPS 联合编码，停止位数量由 LCR_H.STP2 控制。

接收端的位采样采用 16x 过采样机制。当 RX 线路从空闲高电平翻转为低电平时，接收状态机启动计数器，在后续第 8 个采样时钟对起始位进行中心采样，若此时仍为低电平则确认有效起始位并进入数据接收状态；若为高电平则判定为噪声毛刺，状态机退回空闲态。确认起始位后，数据位的采样点均匀分布在每 16 个采样时钟的中心位置，即相对于起始位下降沿的 24、40、56…个采样时钟处。停止位采样结束后，接收器将数据与错误标志打包写入 RX FIFO。

这种中点采样策略的物理含义在于：将每一位时间等分为 16 个相位段，在最中间的第 8 段采样可获得最大的噪声裕量。假设发送端与接收端的波特率误差各为±1%，则最坏情况下位边界偏移约为 16 个采样时钟的 2%，即 0.32 个采样周期，远低于中点采样允许的±3.125 个采样周期安全窗口。

#### 2.2.2 波特率计算

波特率分频器的输入为 UARTCLK，输出为 16x 波特率采样时钟，因此总的分频系数满足：

    Baud Rate Divisor = UARTCLK / (16 × Baud Rate)

该分频系数被拆分为整数部分 IBRD 和小数部分 FBRD（分辨率为 1/64），写入对应的配置寄存器。小数分频器的实现本质上是一个模 64 的累加器：每 UARTCLK 周期累加 FBRD 值，溢出时向整数分频器额外借用一个时钟周期，从而在若干个分频周期内平滑地实现非整数分频比。

实际波特率公式为：

    Actual Baud Rate = UARTCLK / [16 × (IBRD + FBRD/64)]

以 UARTCLK = 48 MHz、目标波特率 115200 为例：

    Divisor = 48,000,000 / (16 × 115,200) = 26.041666…
    IBRD = 26, FBRD = round(0.041666 × 64) = round(2.666) = 3
    Actual Baud Rate = 48,000,000 / [16 × (26 + 3/64)] = 115,177 Hz
    误差 = |115,200 − 115,177| / 115,200 = 0.02%

误差分析表明，当目标波特率在 UARTCLK/16 附近时（即分频系数较小），小数分频器的效果最为显著。对于 9600 波特率，分频系数约为 312.5，此时 IBRD=312、FBRD=32 可精确实现目标值，误差为 0。而当目标波特率接近 UARTCLK/16 的上限（如 UARTCLK=48MHz 时上限为 3 Mbps）时，分频系数接近 1，小数部分的量化步进（1/64≈1.56%）将成为主要误差源。

#### 2.2.3 流控机制

硬件流控通过 RTS（Request To Send）和 CTS（Clear To Send）引脚实现双向握手。当 CR.RTSEN=1 时，接收端的 FIFO 水位超过阈值后硬件自动拉高 RTS 信号，通知对端暂停发送；当 CR.CTSEN=1 时，发送端在送出下一帧前检测 CTS 引脚，仅当 CTS 为低电平（表示对端就绪）时才启动移位发送。RTS/CTS 流控的优势在于响应实时、无需额外数据带宽，缺点是需要额外两条物理连线。

软件流控（XON/XOFF）则以带内信令方式工作：接收端在 FIFO 即将溢出时主动发送 XOFF 字符（0x13，DC3），发送端收到后暂停传输；当接收端处理完积压数据后发送 XON 字符（0x11，DC1）恢复传输。软件流控仅需 TX/RX 两根信号线即可实现，但要求数据链路为透明传输且两端均支持字符解析。此外，XON/XOFF 的响应延迟包含对端字符发送时间（约 1/波特率 × 10 位）和本端字符接收解码时间，在高速场景下该延迟可能已导致 FIFO 溢出，因此高速链路通常优先采用硬件流控。

### 2.3 软件可见寄存器

#### 2.3.1 配置寄存器组

表 1 汇总了 UART IP 的全部配置寄存器，涵盖控制、线路格式、波特率和 FIFO 阈值四类。所有寄存器均按 32 位边界对齐，保留位读回为 0、写操作被忽略。配置顺序有严格要求：必须在设置 IBRD、FBRD、LCR_H 之后最后写 CR.UARTEN=1，否则波特率分频器不会加载新的分频系数。

**表 1  UART 配置寄存器组**

| 偏移地址 | 寄存器名 | 位域 | 属性 | 复位值 | 功能描述 |
|----------|----------|------|------|--------|----------|
| 0x024 | UART_IBRD | [15:0] | R/W | 0x0000 | 整数波特率除数。分频系数整数部分直接写入，范围 1~65535 |
| 0x028 | UART_FBRD | [5:0] | R/W | 0x00 | 小数波特率除数。分辨率为 1/64，累加器每溢出一次向整数分频器借位 |
| 0x02C | UART_LCR_H | [7:0] | R/W | 0x00 | 线路控制寄存器。位[7] SPS=固定校验选择；位[6:5] WLEN=字长(00=5,01=6,10=7,11=8 位)；位[4] FEN=FIFO 使能；位[3] STP2=双停止位；位[2] EPS=偶校验选择(0=奇,1=偶)；位[1] PEN=校验使能；位[0] BRK=发送 Break 条件(强制 TX 持续低电平) |
| 0x030 | UART_CR | [15:0] | R/W | 0x0000 | 控制寄存器。位[15] CTSEN=CTS 硬件流控使能；位[14] RTSEN=RTS 硬件流控使能；位[11] RTS=RTS 引脚手动输出；位[10] DTR=DTR 引脚手动输出；位[9] RXE=接收使能；位[8] TXE=发送使能；位[7] LBE=内部回环测试；位[0] UARTEN=模块总使能 |
| 0x034 | UART_IFLS | [5:0] | R/W | 0x12 | FIFO 中断水平选择。位[5:3] RXIFLSEL=RX FIFO 触发阈值(000=1/8,001=1/4,010=1/2,011=3/4,100=7/8)；位[2:0] TXIFLSEL=TX FIFO 触发阈值，编码同上 |

LCR_H 寄存器定义了帧格式的全部参数，是 UART 初始化阶段最关键的寄存器。其中 FEN 位控制 TX/RX FIFO 的使能与否：FEN=0 时 UART 退化为单字节缓冲模式（等同于 8250 的兼容行为），此时 FIFO 深度为 1，每收发一字节即产生中断；FEN=1 时 16 级 FIFO 生效，配合 IFLS 寄存器实现批量中断触发。WLEN 字段选择数据位宽，绝大多数现代通信场景使用 11（8 位数据）。BRK 位用于主动发送 Break 条件，在调试和红外 IrDA 协议中有应用。

#### 2.3.2 数据寄存器

UART_DR（偏移 0x000）是唯一的软件数据端口，采用读写不对称映射：写 UART_DR 将 PWDATA[7:0] 推入 TX FIFO；读 UART_DR 从 RX FIFO 弹出数据，同时返回附加的错误标志位。RX FIFO 每单元为 12 位宽，其中高 4 位在读取 UART_DR 时映射到 PRDATA[11:8]，低 8 位映射到 PRDATA[7:0]。错误标志包括 OE（Overrun Error，RX FIFO 满时又有新帧到达）、BE（Break Error，RX 持续低电平超过一帧时间）、PE（Parity Error，校验位计算与接收值不符）、FE（Framing Error，停止位采样为 0）。当软件读取 UART_DR 时，RX FIFO 单元被弹出，对应的错误标志在读取后立即清除；但 UART_RSR_ECR 寄存器中的错误状态位需通过写操作清除。

UART_RSR_ECR（偏移 0x004）为接收状态寄存器与错误清除寄存器的复用地址。读此寄存器返回当前挂起的错误状态 OE/BE/PE/FE（对应位[3:0]）；向此地址写任意值将清零全部 4 位错误标志。这种"读后得状态、写任意值清除"的语义允许软件在一次总线事务中完成错误诊断和清除，避免读后写两次寄存器访问的开销。

#### 2.3.3 状态与中断寄存器

表 2 集中列出了 UART IP 的状态寄存器、FIFO 标志寄存器和完整中断控制矩阵。其中中断矩阵采用四寄存器模型——IMSC（屏蔽）、RIS（原始状态）、MIS（屏蔽后状态）、ICR（清除）——该模型源自 ARM PrimeCell 标准，已被 SoC 工程师广泛接受。

**表 2  UART 状态与中断寄存器组**

| 偏移地址 | 寄存器名 | 位域 | 属性 | 复位值 | 功能描述 |
|----------|----------|------|------|--------|----------|
| 0x000 | UART_DR | [11:8] | RO | 0x0 | 数据寄存器错误标志。位[11] OE=溢出错误；位[10] BE=Break 错误；位[9] PE=校验错误；位[8] FE=帧格式错误。读 DR 时自动清除 |
| 0x004 | UART_RSR_ECR | [3:0] | RW | 0x0 | 接收状态/错误清除寄存器。位[3] OE；位[2] BE；位[1] PE；位[0] FE。写任意值清零全部错误位 |
| 0x018 | UART_FR | [9:0] | RO | 0x90 | 标志寄存器。位[7] TXFE=TX FIFO 空；位[6] RXFF=RX FIFO 满；位[5] TXFF=TX FIFO 满；位[4] RXFE=RX FIFO 空；位[3] BUSY=正在发送/接收；位[0] CTS=CTS 引脚电平状态 |
| 0x038 | UART_IMSC | [10:0] | R/W | 0x000 | 中断屏蔽寄存器。位[n]=1 使能对应中断源，=0 屏蔽 |
| 0x03C | UART_RIS | [10:0] | RO | 0x000 | 原始中断状态寄存器。直接反映各中断源电平，不受 IMSC 屏蔽影响 |
| 0x040 | UART_MIS | [10:0] | RO | 0x000 | 屏蔽后中断状态寄存器。MIS = RIS & IMSC，CPU 通常读取此寄存器判定中断原因 |
| 0x044 | UART_ICR | [10:0] | WO | — | 中断清除寄存器。写 1 到对应位清除该中断源，写 0 无影响 |

表 2 中中断位域在 IMSC/RIS/MIS/ICR 四个寄存器之间严格对齐，位[10:0]定义如下：位[10] OEINTR=溢出错误中断；位[9] BEINTR=Break 错误中断；位[8] PEINTR=校验错误中断；位[7] FEINTR=帧格式错误中断；位[6] RTINTR=接收超时中断（RX FIFO 非空且 32 位时间无新数据到达）；位[5] TXINTR=TX FIFO 低于触发水平中断；位[4] RXINTR=RX FIFO 达到或超过触发水平中断；位[3] DSRMINTR=DSR 调制解调器状态中断；位[2] DCDMINTR=DCD 调制解调器状态中断；位[1] CTSINTR=CTS 调制解调器状态中断；位[0] RIMINTR=RI 调制解调器状态中断。

UART_FR 寄存器提供实时的 FIFO 与线路状态，软件在轮询模式下可通过查询 TXFF 和 RXFE 决定是否可以写入或读取数据。TXFE 与 BUSY 的组合尤其关键：TXFE=1 仅表示 TX FIFO 为空，但 BUSY=1 表示移位寄存器中仍有数据正在发送；软件在关闭 UART（写 CR.UARTEN=0）之前必须等待 BUSY=0，否则会导致帧截断。

中断控制矩阵的工作机制可概括为：每个中断源（如 RX FIFO 水位超过阈值）首先将对应的 RIS 位置 1；若 IMSC 中同一位为 1，则该中断通过屏蔽层使 MIS 位置 1，并最终经 OR 门输出 UARTINTR；CPU 在中断服务程序中读取 MIS 确定中断源，向 ICR 对应位写 1 清除中断，写 1 操作同时清除 RIS 和 MIS 中的对应位。TXINTR 和 RXINTR 的触发条件由 IFLS 寄存器中的 TXIFLSEL 和 RXIFLSEL 字段独立配置，允许软件在"批量传输优先"（阈值设高）与"低延迟响应优先"（阈值设低）之间灵活取舍。


---

# 3. I2C Master/Slave — 两线串行总线控制器

## 3.1 内部架构与框图

### 3.1.1 I2C 控制器顶层框图

I2C（Inter-Integrated Circuit）控制器作为 APB 总线从设备，内部采用分层状态机架构：寄存器访问层、字节协议层和位时序层。以下框图展示了以 Synopsys DW_apb_i2c 为参考风格的完整数据通路，覆盖从 APB 总线接口到 SCL/SDA 物理引脚的全部功能模块。

```
+--------------------------------------------------------------------------+
|                        I2C Controller (APB Slave)                        |
|                                                                          |
|   APB Interface                                                          |
|   +--------------------+                                                 |
|   | PCLK / PRESETn     |                                                 |
|   | PSEL / PENABLE     |<---- APB Bus                                   |
|   | PWRITE / PADDR     |                                                 |
|   | PWDATA / PRDATA    |                                                 |
|   +---------+----------+                                                 |
|             |                                                            |
|             v                                                            |
|   +--------------------+     +--------------------+     +--------------+|
|   |   Register Bank    |---->|  Clock Prescaler   |---->| SCL Generator||
|   | (IC_CON/IC_TAR/   |     |(HCNT/LCNT regs)    |     |(High/Low cnt) ||
|   | IC_DATA_CMD etc.) |     +--------------------+     +------+-------+|
|   +---------+----------+                                        |       |
|             |                                                   |       |
|             v                                                   v       |
|   +--------------------+     +--------------------+     +--------------+|
|   |  Interrupt Ctrl    |<--->|  Bit Control Engine|<--->|  Byte Ctrl   ||
|   | (STAT/MASK/CLR)    |     |(SCL/SDA bit SM)    |     |(Shift/ACK)   ||
|   +---------+----------+     +----+---------+-----+     +------+-------+|
|             |                     |         |                    |        |
|             v                     v         v                    v        |
|   +--------------------+     +---+---+   +---+---+       +------+------+ |
|   |   I2CINTR (ORed)   |     |SCL Pad|   |SDA Pad|       | TX FIFO     | |
|   +--------------------+     |(OD/OC)|   |(OD/OC)|       | (16/32b)    | |
|                                +--+--+   +--+--+       +------+------+ |
|                                   |         |                |         |
|                                   v         v                v         |
|                               SCL Out    SDA Out        +------+------+ |
|                               SCL In     SDA In         | RX FIFO     | |
|                                                         | (16/32b)    | |
|                                                         +-------------+ |
|   +--------------------+                                               |
|   |  Slave Address     |<---- Compare IC_SAR vs received 7/10-bit addr |
|   |  Match Logic       |                                               |
|   +--------------------+                                               |
|                                                                          |
|   +--------------------+     +--------------------+                     |
|   |  Arbitration Logic |     |  Clock Sync Logic  |                     |
|   |  (Multi-Master)    |     |  (SCL Stretching)  |                     |
|   +--------------------+     +--------------------+                     |
|                                                                          |
+--------------------------------------------------------------------------+
```

APB 接口将 PCLK 时钟域的寄存器访问请求转换为内部读写使能信号，地址译码覆盖 4KB 空间。寄存器组（Register Bank）集中管理所有软件可见配置，其中 IC_CON 的 MASTER_MODE 位与 IC_SLAVE_DISABLE 位共同决定内部状态机的路由：当 MASTER_MODE=1 且 IC_SLAVE_DISABLE=1 时，位控制引擎（Bit Control Engine）仅响应 Master 路径的时钟生成请求；当 MASTER_MODE=0 且 IC_SLAVE_DISABLE=0 时，引擎进入 Slave 被动响应状态；当两位组合为 MASTER_MODE=1 且 IC_SLAVE_DISABLE=0 时，控制器同时监听 Slave 地址匹配逻辑和 Master 传输请求，实现双模并发。

位控制引擎是核心的逐位状态机，负责产生和检测 START、STOP、ACK、NACK 条件，并在 SCL 的 9 个周期内完成 8 位数据加 1 位应答的时序控制。字节控制模块（Byte Control）管理发送移位寄存器和接收移位寄存器，在 Master 写操作时从 TX FIFO 取出数据逐位移出到 SDA，在 Master 读操作时将移位寄存器组装完成的字节推入 RX FIFO。时钟预分频器根据 IC_SS_SCL_HCNT/LCNT（标准模式 100Kbps）或 IC_FS_SCL_HCNT/LCNT（快速模式 400Kbps）中写入的计数值，在 PCLK 域内精确控制 SCL 的高电平与低电平周期。

仲裁逻辑（Arbitration Logic）监测多主环境下 SDA 总线的线与状态：当本机作为 Master 发送逻辑 1，但采样到 SDA 为 0 时，仲裁失败标志置位，当前传输立即中止，控制器可选择自动切换为 Slave 接收模式（若地址匹配）或释放总线。时钟同步逻辑处理 SCL 时钟拉伸（Clock Stretching）：Slave 设备在 SCL 低电平期间将 SCL 拉低以延长时序，本机作为 Slave 时同样具备此能力，拉伸时长受内部 RX FIFO 满状态或 TX FIFO 空状态驱动。

### 3.1.2 主从模式切换逻辑

主从模式切换不是通过外部引脚电平触发，而是由 IC_CON 寄存器中的两位控制字完成内部状态机的路由重构。IC_CON[0]（MASTER_MODE）决定 Master 路径是否使能，IC_CON[6]（IC_SLAVE_DISABLE）决定 Slave 路径是否关闭。三种有效配置对应的行为如下：

- **仅 Master**：MASTER_MODE=1，IC_SLAVE_DISABLE=1。SCL 由内部发生器驱动，SDA 由 Bit Engine 主动控制，Slave 地址匹配逻辑被门控关闭以节省动态功耗。
- **仅 Slave**：MASTER_MODE=0，IC_SLAVE_DISABLE=0。SCL 为输入信号，SDA 在地址匹配后根据 R/W 位方向切换为输入或输出，控制器持续监听总线上的 START 条件及后续地址字节。
- **Master+Slave 双模**：MASTER_MODE=1，IC_SLAVE_DISABLE=0。控制器在总线空闲时维持 Master 就绪态，同时地址匹配逻辑持续比较 IC_SAR 与总线地址；若本机作为 Master 时仲裁失败，硬件自动释放 SCL 驱动并切换为 Slave 接收路径；若总线上出现匹配地址的寻址，Slave 响应逻辑抢占总线控制权，当前 Master 传输被挂起。

动态切换的关键安全机制在于 IC_ENABLE 寄存器（偏移 0x6C）的使能时序：软件必须先在 IC_CON 中完成模式配置，写入目标地址（IC_TAR 或 IC_SAR）及 SCL 计数器，最后置位 IC_ENABLE[0] 才允许状态机离开 IDLE 状态。IC_ENABLE 的清零操作（禁能）具有自清除特性，硬件在检测到当前字节传输边界后自动将 IC_ENABLE 复位为 0，避免在总线通信中途断钟导致协议错误。

## 3.2 工作原理

### 3.2.1 I2C 协议时序：条件产生与检测、时钟拉伸

I2C 总线采用开漏（Open-Drain）输出结构，SCL 与 SDA 均需外部上拉电阻至高电平，总线空闲时两线均为高。控制器通过检测两线的电平组合来识别协议条件：START 条件定义为 SCL 高电平期间 SDA 从高到低的跳变；STOP 条件定义为 SCL 高电平期间 SDA 从低到高的跳变。位控制引擎在每个 SCL 周期内严格执行数据变化窗口约束——SDA 上的数据位只能在 SCL 低电平期间翻转，在 SCL 上升沿被采样，高电平期间必须保持稳定。

ACK（Acknowledge）与 NACK（Not Acknowledge）由第 9 个 SCL 周期决定：接收方将 SDA 拉低产生 ACK，保持释放状态（高电平）则产生 NACK。Master 发送模式下，Bit Engine 在第 9 周期采样 SDA 以判断 Slave 是否应答；若收到 NACK 且 IC_CON 中未配置忽略 NACK，则触发 TX_ABRT 中断，传输中止源寄存器 IC_TX_ABRT_SOURCE 的对应位（bit[3] ABRT_NOACK）置 1。

时钟拉伸（Clock Stretching）是 Slave 端用于流量控制的核心机制。当 Slave 接收数据时 RX FIFO 已满，或 Slave 发送数据时 TX FIFO 为空，Slave 可将 SCL 拉低，迫使 Master 进入等待状态。本机作为 Slave 时，时钟拉伸由内部 FIFO 水位自动触发，无需软件干预；软件可通过 IC_STATUS[0]（ACTIVITY）和 IC_STATUS[6]（SLV_ACTIVITY）观测 Slave 是否正处于拉伸状态。

### 3.2.2 Master 传输流程

Master 模式下的完整写操作流程如下：

1. 配置 IC_CON（0x00）：置位 MASTER_MODE=1，选择速度模式 SPEED[2:1]（01=Standard 100Kbps，10=Fast 400Kbps），若需 Repeated START 支持则置位 IC_RESTART_EN。
2. 配置 IC_TAR（0x04）：写入 7-bit 或 10-bit 目标从机地址。若使用 10-bit 地址，需同时置位 IC_CON[4]（IC_10BITADDR_MASTER）。
3. 配置 SCL 时钟计数器：根据 PCLK 频率和 I2C 标准时序要求，计算并写入 IC_SS_SCL_HCNT/LCNT（偏移 0x14/0x18）或 IC_FS_SCL_HCNT/LCNT（偏移 0x1C/0x20）。
4. 置位 IC_ENABLE（0x6C）使能控制器。
5. 向 IC_DATA_CMD（0x10）写入命令：bit[7:0] 为待发送数据，bit[8]（CMD）=0 表示写方向，bit[9]（STOP）=1 表示发送后产生 STOP，bit[10]（RESTART）=1 表示发送前产生 Repeated START。
6. 数据被推入 TX FIFO，Bit Engine 在总线空闲时自动产生 START 条件，随后输出地址字节（IC_TAR + R/W=0）并等待 Slave ACK。
7. 每字节发送后，根据 IC_DATA_CMD 的 STOP 位决定是否产生 STOP；若需连续传输多字节，仅最后一字节置位 STOP=1，中间字节保持 STOP=0。

Master 读操作的关键差异在于 IC_DATA_CMD 的 CMD 位：软件写 IC_DATA_CMD 时置位 CMD=1，这并不直接读取数据，而是向 TX FIFO 中压入一个读命令令牌（Read Command Token）。Bit Engine 在总线上产生地址字节（R/W=1）后，切换 SDA 方向为输入，从 Slave 接收数据字节并推入 RX FIFO。软件随后通过读 IC_DATA_CMD 从 RX FIFO 弹出数据。

### 3.2.3 Slave 响应机制

Slave 模式的响应流程如下：

1. 配置 IC_CON：清零 MASTER_MODE=0，清零 IC_SLAVE_DISABLE=0（即允许 Slave 模式），选择速度模式（Slave 模式下的速度配置主要用于时钟拉伸时序约束）。
2. 配置 IC_SAR（0x08）：写入本机 7-bit 或 10-bit 从机地址。若使用 10-bit 地址，置位 IC_CON[3]（IC_10BITADDR_SLAVE）。
3. 使能 IC_ENABLE。
4. Bit Engine 持续监测 SCL/SDA 以检测 START 条件；检测到 START 后，接收随后 8 位地址字节并与 IC_SAR 比较。
5. 地址匹配且 R/W=0（Master 写 Slave）：Slave 在第 9 周期拉低 SDA 产生 ACK，随后接收数据字节存入 RX FIFO，每字节产生 RX_FULL 中断（若 RX FIFO 水位超过阈值）。
6. 地址匹配且 R/W=1（Master 读 Slave）：Slave 在第 9 周期产生 ACK，随后触发 RD_REQ 中断通知软件准备数据；软件向 IC_DATA_CMD 写入数据推入 TX FIFO，Bit Engine 将数据逐位移出至 SDA。若 TX FIFO 空且 Master 仍请求数据，Slave 自动拉伸 SCL 等待软件填充数据。
7. 广播地址（General Call，地址 0x00）：若 IC_ACK_GENERAL_CALL=1，控制器响应广播地址并接收后续数据。

### 3.2.4 时钟配置

SCL 时钟的高电平与低电平周期由 PCLK 频率和 HCNT/LCNT 寄存器共同决定。DW_apb_i2c 风格的计算公式为：

```
IC_SS_SCL_HCNT = ceil((tHIGH(min) × fPCLK) - 8)
IC_SS_SCL_LCNT = ceil((tLOW(min) × fPCLK) - 1)
IC_FS_SCL_HCNT = ceil((tHIGH(min) × fPCLK) - 8)
IC_FS_SCL_LCNT = ceil((tLOW(min) × fPCLK) - 1)
```

其中减 8 与减 1 的偏移量来源于内部同步逻辑（Synchronizer、Filter、输出驱动延迟）引入的固定延迟补偿。以 PCLK = 50MHz、Fast Mode（400Kbps）为例：tHIGH(min) = 600ns，tLOW(min) = 1300ns，则 IC_FS_SCL_HCNT = ceil(30 - 8) = 22，IC_FS_SCL_LCNT = ceil(65 - 1) = 64，实际 SCL 周期为 (22+8+64+1) / 50MHz ≈ 1.9μs，对应波特率约 526Kbps，在 I2C Fast Mode 允许范围内。软件应在改变速度模式前禁能 IC_ENABLE，更新 HCNT/LCNT 后重新使能，以避免总线上出现时序毛刺。

## 3.3 软件可见寄存器

### 3.3.1 配置寄存器组

表 3-1 列出了 I2C 控制器的配置寄存器组，包含控制、地址和时钟三类寄存器。所有寄存器按 32-bit APB 对齐访问，保留位读回为 0，写入无影响。

**表 3-1  I2C 配置寄存器组**

| 偏移地址 | 寄存器名 | 位域 | 读写属性 | 复位值 | 功能描述 |
|:--------:|:--------|:-----|:--------:|:------:|:---------|
| 0x00 | IC_CON | [31:7] | R/W | 0x0000 | 保留位，读回 0 |
| | | [6] IC_SLAVE_DISABLE | R/W | 0x1 | 1=禁用 Slave 模式；0=使能 Slave 模式 |
| | | [5] IC_RESTART_EN | R/W | 0x0 | 1=支持 Repeated START 条件产生；0=不支持 |
| | | [4] IC_10BITADDR_MASTER | R/W | 0x0 | 1=Master 使用 10-bit 地址；0=7-bit 地址 |
| | | [3] IC_10BITADDR_SLAVE | R/W | 0x0 | 1=Slave 使用 10-bit 地址；0=7-bit 地址 |
| | | [2:1] SPEED | R/W | 0x2 | 速度模式：00=保留，01=Standard(100K)，10=Fast(400K)，11=High(3.4M) |
| | | [0] MASTER_MODE | R/W | 0x1 | 1=使能 Master 模式；0=禁用 Master 模式 |
| 0x04 | IC_TAR | [31:13] | R/W | 0x0000 | 保留位，读回 0 |
| | | [12] GC_OR_START | R/W | 0x0 | 当 SPECIAL=1 时，0=General Call，1=START Byte |
| | | [11] SPECIAL | R/W | 0x0 | 1=发送特殊命令（General Call/START Byte）；0=正常目标地址 |
| | | [10] DEVICE_ID | R/W | 0x0 | 1=执行 Device ID 读取命令（需 SPECIAL=1） |
| | | [9:0] IC_TAR | R/W | 0x055 | 10-bit 目标地址；若 7-bit 模式仅 [6:0] 有效 |
| 0x08 | IC_SAR | [31:10] | R/W | 0x0000 | 保留位，读回 0 |
| | | [9:0] IC_SAR | R/W | 0x055 | 本机 Slave 地址；7-bit 模式仅 [6:0] 有效 |
| 0x14 | IC_SS_SCL_HCNT | [31:16] | R/W | 0x0000 | 保留位，读回 0 |
| | | [15:0] HCNT | R/W | 0x0047 | Standard Speed SCL 高电平周期计数（PCLK 周期数） |
| 0x18 | IC_SS_SCL_LCNT | [31:16] | R/W | 0x0000 | 保留位，读回 0 |
| | | [15:0] LCNT | R/W | 0x004F | Standard Speed SCL 低电平周期计数（PCLK 周期数） |
| 0x1C | IC_FS_SCL_HCNT | [31:16] | R/W | 0x0000 | 保留位，读回 0 |
| | | [15:0] HCNT | R/W | 0x0007 | Fast Speed SCL 高电平周期计数（PCLK 周期数） |
| 0x20 | IC_FS_SCL_LCNT | [31:16] | R/W | 0x0000 | 保留位，读回 0 |
| | | [15:0] LCNT | R/W | 0x0017 | Fast Speed SCL 低电平周期计数（PCLK 周期数） |
| 0x6C | IC_ENABLE | [31:1] | R/W | 0x0000 | 保留位，读回 0 |
| | | [0] ENABLE | R/W | 0x0 | 1=使能 I2C 控制器；0=禁能。配置完成后最后置位 |

IC_CON 是模式控制的核心寄存器。SPEED[2:1] 选择总线速度等级，但仅影响 Master 模式下的 SCL 发生源选择（选择 SS 或 FS 计数器）；Slave 模式下速度配置用于定义时钟拉伸的最大允许时长。MASTER_MODE 与 IC_SLAVE_DISABLE 的组合决定主从行为，如 3.1.2 节所述，软件不应在同一时刻同时启用两种模式的主动传输逻辑，除非明确需要双模并发监听。

IC_TAR 在 Master 模式下定义目标设备地址。当 SPECIAL=1 时，控制器忽略 IC_TAR[9:0] 中的普通地址，转而发送 General Call（广播，地址 0x00）或 START Byte（用于唤醒低速 Slave）。DEVICE_ID 位用于执行 I2C 规范定义的 Device ID 读取序列，这是一种特殊的 3 字节地址探测命令。

### 3.3.2 数据寄存器与状态中断寄存器组

表 3-2 汇总了数据寄存器 IC_DATA_CMD、状态寄存器 IC_STATUS、FIFO 水位寄存器以及中断矩阵寄存器的完整定义。

**表 3-2  I2C 数据、状态与中断寄存器组**

| 偏移地址 | 寄存器名 | 位域 | 读写属性 | 复位值 | 功能描述 |
|:--------:|:--------|:-----|:--------:|:------:|:---------|
| 0x10 | IC_DATA_CMD | [31:11] | R/W | 0x0000 | 保留位，读回 0 |
| | | [10] RESTART | W | 0x0 | 写 1 表示在发送/读取前产生 Repeated START（需 IC_RESTART_EN=1） |
| | | [9] STOP | W | 0x0 | 写 1 表示在发送/读取后产生 STOP 条件 |
| | | [8] CMD | W | 0x0 | 写 0=WRITE 命令，写 1=READ 命令（向 TX FIFO 压入读令牌） |
| | | [7:0] DAT | R/W | 0x00 | 写操作：待发送数据推入 TX FIFO；读操作：从 RX FIFO 弹出接收数据 |
| 0x2C | IC_INTR_STAT | [31:14] | RO | 0x0000 | 保留位，读回 0 |
| | | [13] MST_ON_HOLD | RO | 0x0 | Master 因 TX FIFO 空暂停（Clock Hold） |
| | | [12] RESTART_DET | RO | 0x0 | Slave 模式检测到 Repeated START |
| | | [11] GEN_CALL | RO | 0x0 | 检测到 General Call 地址 |
| | | [10] START_DET | RO | 0x0 | 检测到 START 条件 |
| | | [9] STOP_DET | RO | 0x0 | 检测到 STOP 条件 |
| | | [8] ACTIVITY | RO | 0x0 | 总线活动检测（任意 START/STOP/位传输触发） |
| | | [7] RX_DONE | RO | 0x0 | Slave 接收完成（Master 发送 NACK 后） |
| | | [6] TX_ABRT | RO | 0x0 | 发送中止（仲裁失败/无 ACK/TX FIFO 空时写等） |
| | | [5] RD_REQ | RO | 0x0 | Slave 模式 Master 请求读数据 |
| | | [4] TX_EMPTY | RO | 0x0 | TX FIFO 低于触发阈值 |
| | | [3] TX_OVER | RO | 0x0 | TX FIFO 溢出（写入已满的 FIFO） |
| | | [2] RX_FULL | RO | 0x0 | RX FIFO 达到或超过触发阈值 |
| | | [1] RX_OVER | RO | 0x0 | RX FIFO 溢出（接收数据时 FIFO 已满） |
| | | [0] RX_UNDER | RO | 0x0 | RX FIFO 下溢（读取空的 FIFO） |
| 0x30 | IC_INTR_MASK | [13:0] | R/W | 0x8FF | 中断屏蔽，1=使能对应中断，0=屏蔽。复位后默认使能大部分中断 |
| 0x34 | IC_RAW_INTR_STAT | [13:0] | RO | 0x0000 | 原始中断状态，不受屏蔽影响 |
| 0x40 | IC_CLR_INTR | [0] | RO/WO | 0x0 | 读后清除组合中断，同时清除所有独立中断标志 |
| 0x70 | IC_STATUS | [31:7] | RO | 0x0000 | 保留位，读回 0 |
| | | [6] SLV_ACTIVITY | RO | 0x0 | 1=Slave 正在进行传输 |
| | | [5] MST_ACTIVITY | RO | 0x0 | 1=Master 正在进行传输 |
| | | [4] RFF | RO | 0x0 | 1=RX FIFO Full |
| | | [3] RFNE | RO | 0x0 | 1=RX FIFO Not Empty |
| | | [2] TFE | RO | 0x0 | 1=TX FIFO Empty |
| | | [1] TFNF | RO | 0x1 | 1=TX FIFO Not Full |
| | | [0] ACTIVITY | RO | 0x0 | 1=总线处于活动状态 |
| 0x74 | IC_TXFLR | [31:6] | RO | 0x00 | 保留位，读回 0 |
| | | [5:0] TXFLR | RO | 0x00 | TX FIFO 当前有效数据数量 |
| 0x78 | IC_RXFLR | [31:6] | RO | 0x00 | 保留位，读回 0 |
| | | [5:0] RXFLR | RO | 0x00 | RX FIFO 当前有效数据数量 |
| 0x80 | IC_TX_ABRT_SOURCE | [22:0] | RO | 0x0000 | TX 中止源详细原因，每 bit 对应一种具体失败场景 |

IC_DATA_CMD 是软件与控制器交互的核心数据端口，其读写语义具有方向不对称性：写操作向 TX FIFO 压入数据或读命令令牌，bit[10:8] 仅对写有效；读操作从 RX FIFO 弹出已接收的数据字节，bit[10:8] 读回为 0。TX_ABRT 中断是调试 Master 传输失败的关键入口，软件应在 TX_ABRT 触发后读取 IC_TX_ABRT_SOURCE（0x80）获取具体原因：bit[0] ABRT_7B_ADDR_NOACK 表示地址字节无 ACK，bit[1] ABRT_10ADDR1_NOACK 表示 10-bit 地址第一段无 ACK，bit[2] ABRT_10ADDR2_NOACK 表示第二段无 ACK，bit[3] ABRT_TXDATA_NOACK 表示数据字节无 ACK，bit[12] ABRT_LOST 表示仲裁失败，bit[15] ABRT_SLVFLUSH_TXFIFO 表示 Slave 模式因被寻址而清空 TX FIFO。

IC_STATUS 提供总线实时快照，其中 MST_ACTIVITY 与 SLV_ACTIVITY 互斥或并发反映双模状态下的活动归属。TFNF（TX FIFO Not Full）是上电复位后唯一为 1 的状态位，表明 TX FIFO 已就绪可接收软件写入。IC_INTR_STAT 与 IC_INTR_MASK 构成标准的中断矩阵：原始中断经屏蔽后输出到 I2CINTR 单一中断线，IC_CLR_INTR 读后清除所有标志，此外各中断源还提供独立清除寄存器（0x44~0x58），便于精确中断处理。

FIFO 水位寄存器 IC_TXFLR 与 IC_RXFLR 以 0~FIFO_DEPTH 的数值反映队列占用量，TX 中断阈值（IC_INTR_MASK 中 TX_EMPTY 的触发点）和 RX 中断阈值（RX_FULL 的触发点）由内部固定逻辑或可选的 IC_DMA_TDLR/RDLR 寄存器定义，用于配合 DMA 控制器实现块传输。当 DMA 使能时，TX_EMPTY 和 RX_FULL 中断不再路由到 CPU，而直接驱动 DMA 请求信号 dma_tx_req 和 dma_rx_req，减少中断负载并提高吞吐效率。


---

## 4. SPI Master/Slave — 四线串行外设接口

### 4.1 内部架构与框图

#### 4.1.1 SPI 控制器顶层框图

本 SPI 控制器采用 Synopsys DW_apb_ssi 兼容架构，通过 APB 总线接口与 SoC 互联，内部划分为协议转换层、时钟生成层、数据通路层和片选控制层四个功能域。APB 接口模块将 PCLK 时钟域的寄存器访问请求转换为内部并行读写信号，驱动寄存器组完成配置更新或状态回读。寄存器组输出的控制字送入时钟分频器与帧格式控制器，分别产生 SCLK 输出时钟和采样沿选择信号。发送数据由软件写入数据寄存器（DR）后进入 TX FIFO，在传输触发条件满足时加载至 TX 移位寄存器，在 SCLK 驱动下逐位串行输出到 MOSI；与此同时，MISO 上的输入位在相同时钟边沿被采样进入 RX 移位寄存器，组装完成后推入 RX FIFO，供软件通过读 DR 获取。中断控制器聚合 FIFO 水位、传输完成及错误事件，向 SoC 中断聚合器输出单一的 SSIINTR 请求线。

```
+--------------------------------------------------------------------------+
|                     SPI Controller (APB Slave, SSI)                      |
|                                                                          |
|  APB Interface                                                           |
|  +-------------------+                                                   |
|  | PCLK / PRESETn    |                                                   |
|  | PSEL / PENABLE    |<---- APB Bus (PADDR[11:0], PWDATA/PRDATA[31:0])  |
|  | PWRITE / PADDR    |                                                   |
|  | PWDATA / PRDATA   |                                                   |
|  +---------+---------+                                                   |
|            |                                                             |
|            v                                                             |
|  +-------------------+     +-------------------+     +------------------+ |
|  |  Register Bank    |---->|  Baud Rate Div    |---->|  SCLK Generator | |
|  | (CTRLR0/CTRLR1/   |     | (BAUDR: 2~65534)  |     |  (sclk_out/in)  | |
|  |  BAUDR/SER/DR    |     +-------------------+     +--------+---------+ |
|  |  /SR/IMR/ISR etc)|                                        |          |
|  +---------+---------+                                        |          |
|            |                                                  |          |
|            v                                                  v          |
|  +-------------------+     +-------------------+     +------------------+ |
|  |  Interrupt Ctrl   |<--->|  Frame Format &   |<--->|  CPOL/CPHA &    | |
|  |  (IMR/ISR/ICR)    |     |  Transfer Ctrl    |     |  Edge Select    | |
|  +---------+---------+     +----+---------+----+     +--------+---------+ |
|            |                    |         |                   |           |
|            v                    v         v                   v           |
|  +-------------------+      +---+---+   +---+---+      +----------------+ |
|  |  SSIINTR (ORed)   |      |TX Shift|   |RX Shift|     | CS Control    | |
|  +-------------------+      |Reg(16) |   |Reg(16) |     | (1~4 Slaves)  | |
|                               +--+--+   +--+--+      +--------+--------+ |
|                                  |         |                |             |
|            +---------------------+         +----------------+             |
|            |                                              |              |
|            v                                              v              |
|  +-------------------+     +-------------------+     +------------+      |
|  |  TX FIFO          |     |  RX FIFO          |     | SER[3:0]  |      |
|  |  (16/32/64/256)  |     |  (16/32/64/256)  |     |  CS_N[3:0]|      |
|  +-------------------+     +-------------------+     +------------+      |
|                                                                          |
|  +-------------------+                                                   |
|  | Slave Mode Logic  |<-- ss_in_n (Slave Select Input, active low)      |
|  | (ss_in_n & sclk_in|<-- sclk_in (Serial Clock Input, Slave mode only)  |
|  |  trigger shift)   |                                                   |
|  +-------------------+                                                   |
|                                                                          |
|  External Pins:  sclk_out/in,  mosi,  miso,  cs_n[3:0] / ss_in_n       |
+--------------------------------------------------------------------------+
```

**关键子模块与数据流说明。** APB Interface 负责协议转换，将 APB 的 SETUP/ACCESS 周期映射为寄存器读写脉冲；所有配置寄存器集中在 Register Bank，通过内部地址译码器分散到各功能子模块的使能端口。Baud Rate Divider 接收 BAUDR 配置值，对 PCLK 进行偶数分频（最小分频系数为 2），产生 Master 模式下的 sclk_out；Slave 模式下该分频器被旁路，直接使用外部输入的 sclk_in。TX/RX FIFO 的深度由综合参数 `FIFO_DEPTH` 决定，可选 16/32/64/128/256，数据宽度与 DFS（Data Frame Size）配置保持一致，最高支持 16 bit 每帧。CS Control 模块在 Master 模式下将 SER 寄存器的位映射到 1~4 个独立的 SPI_CS_N 输出；在 Slave 模式下，该模块被禁用，取而代之的是 Slave Mode Logic 对 ss_in_n 的边沿检测与同步逻辑。

#### 4.1.2 Master 模式自动片选生成

Master 模式的传输启动依赖两个条件：TX FIFO 非空且 SER 寄存器至少有一位有效（即 `SER & ser_mask != 0`，其中 `ser_mask` 为硬件实现的有效片选范围）。当两个条件同时满足时，CS Control 状态机进入 ACTIVE 状态，按照 CTRLR0 中的 SCPOL/SCPH 配置拉低目标片选信号，并在 SCLK 的第一个有效边沿前插入适当的建立时间。对于 Motorola SPI 模式，片选信号在完整传输期间保持低电平；当 TX FIFO 空且 TX Shift Register 完成最后一个位的移出后，状态机进入 CS_INACTIVE，片选在 SCLK 最后一个边沿后的保持时间之后释放（拉高）。若软件需要连续多帧传输（如访问 Flash 存储器的页写操作），可通过保持 SER 寄存器值不变并持续向 DR 写入数据，使片选在整个 burst 期间维持有效。BAUDR 分频值的计算公式为 `SCLK_OUT = PCLK / BAUDR`，其中 BAUDR 必须为 2 到 65534 之间的偶数；复位后 BAUDR 默认值为 0x0000（分频器禁用），必须在使能 SSIENR 之前完成配置，否则 sclk_out 将维持无效状态。

#### 4.1.3 Slave 模式响应逻辑

Slave 模式下，内部 Baud Rate Divider 被完全旁路，SCLK 和片选均来自外部 Master。Slave Mode Logic 包含两级同步器对 ss_in_n 和 sclk_in 进行跨时钟域处理，消除亚稳态风险。当 ss_in_n 经同步后检测到低电平，且 sclk_in 出现第一个有效边沿（由 CTRLR0.SCPH 决定是第 1 个还是第 2 个边沿），TX Shift Register 从 TX FIFO 读取待发送数据，RX Shift Register 开始采样 MOSI 输入。每出现一个 SCLK 有效边沿，TX Shift 移出 1 bit 到 MISO，RX Shift 移入 1 bit 来自 MOSI；经过 DFS 配置的位数后，RX Shift 将组装好的数据推入 RX FIFO，同时若 TX FIFO 非空则预加载下一帧数据。当 ss_in_n 回到高电平，当前帧传输结束；若此时 TX Shift 尚未完成全部位数的移出，SR.TXE（Transmission Error）标志置位，指示 Slave 响应数据未准备就绪。Slave 模式下 MISO 引脚的三态由 CTRLR0.SLV_OE 控制：当 SLV_OE=0 时 MISO 处于高阻态，适用于多 Slave 共享 MISO 总线的场景；当 SLV_OE=1 时 MISO 由内部 TX Shift 驱动。

### 4.2 工作原理

#### 4.2.1 四种时钟极性/相位模式

SPI 协议通过时钟极性（Clock Polarity, CPOL）和时钟相位（Clock Phase, CPHA）的组合定义四种传输模式，分别对应 CTRLR0 寄存器中的 SCPOL（位 [10]）和 SCPH（位 [9]）。CPOL 决定 SCLK 空闲状态下的电平：CPOL=0（SCPOL=0）时空闲为低电平，CPOL=1（SCPOL=1）时空闲为高电平。CPHA 决定数据采样发生在 SCLK 的第几个边沿：CPHA=0（SCPH=0）时数据在第一个有效边沿采样，CPHA=1（SCPH=1）时数据在第二个有效边沿采样。这两种二值参数的组合产生了四种物理上可区分的时序：Mode 0（CPOL=0, CPHA=0）在上升沿采样、下降沿设置；Mode 1（CPOL=0, CPHA=1）在下降沿采样、上升沿设置；Mode 2（CPOL=1, CPHA=0）在下降沿采样、上升沿设置；Mode 3（CPOL=1, CPHA=1）在上升沿采样、下降沿设置。从实现角度看，Mode 0 与 Mode 3 在采样边沿（均为上升沿）上一致，区别仅在于空闲电平和片选激活后的首个 SCLK 边沿方向；因此大多数 SPI 从设备至少支持其中一种，而全功能控制器必须完整支持四种模式以兼容不同厂商的外设。

时序约束方面，数据建立时间（t_setup）和保持时间（t_hold）由 SCLK 半周期的 50% 占空比自然提供。Master 模式下，建立时间可通过 BAUDR 分频值间接调节：分频值越大，SCLK 周期越长，建立/保持时间越宽裕；Slave 模式下，建立时间完全取决于外部 Master 的 SCLK 输出特性，Slave 控制器仅在内部边沿检测逻辑中对输入信号做同步延迟处理，典型引入 2~3 级触发器延迟（约 2~3 个 PCLK 周期）。

#### 4.2.2 全双工串行传输

SPI 的核心传输机制是一个双端口环形移位结构。Master 与 Slave 各拥有一个 TX Shift Register 和一个 RX Shift Register，两个 Shift Register 在物理上构成一个长度等于 DFS 配置位数的串行移位链。每帧传输期间，SCLK 的每个有效边沿同时驱动两个动作：TX Shift 的最低有效位（LSB）输出到 MOSI（Master）或 MISO（Slave），而 RX Shift 在相同时钟边沿锁存对方发送线上的输入位并向高位移位。经过 DFS 个 SCLK 周期后，Master 的 RX Shift 中存储的是 Slave 发出的完整数据帧，Slave 的 RX Shift 中存储的是 Master 发出的完整数据帧，双方在同一时刻完成一次全双工数据交换。

这一机制意味着 SPI 的"发送"与"接收"在硬件层面不可分割：即使软件仅需要执行写操作（TX Only 模式），RX Shift 仍会在每个 SCLK 周期锁存 MISO 上的数据，只是这些数据不会被推入 RX FIFO（由 CTRLR0.TMOD 控制）；同理，RX Only 模式下 Master 仍需向 TX FIFO 提供 dummy 数据以驱动 SCLK 时钟的生成。在 EEPROM Read 模式（TMOD=11）下，硬件自动插入控制帧（如读指令 + 地址），随后切换为只收状态，利用 CTRLR1.NDF 控制连续接收的帧数，避免软件逐帧干预。

#### 4.2.3 帧格式支持

控制器支持三种工业标准帧格式，由 CTRLR0.SPI_FRF（位 [23:22]）选择。

**Motorola SPI（SPI_FRF=00）**：最通用的四线帧格式。片选信号在整帧期间保持低电平，数据在 MOSI/MISO 上传输，MSB 先出。帧长度由 DFS 配置决定（1~16 bit），无额外帧头或控制字。

**TI SSP（SPI_FRF=01）**：采用帧同步脉冲替代 Motorola 的片选电平有效机制。FS（Frame Sync）信号在首 bit 传输前产生一个 SCLK 周期的高电平脉冲，标识帧起始；数据在后续 SCLK 周期中传输。该模式省去片选持续低电平的开销，适用于短帧高频传输场景，但要求外部设备兼容 TI 的同步脉冲协议。

**National Microwire（SPI_FRF=10）**：采用控制字 + 数据字的半双工分时结构。传输分为两个阶段：第一阶段 Master 发送固定 8 bit 控制字（由 CTRLR0.CFS 配置），该控制字包含后续数据的方向和长度信息；第二阶段 Slave 在控制字结束后根据指令在 MISO 上返回数据，或在 MOSI 上继续接收 Master 写入的数据。Microwire 模式下，MWCR 寄存器的 MDD 位（位 [0]）控制数据方向：MDD=0 为接收（Slave 在 MISO 上发送数据），MDD=1 为发送（Master 在 MOSI 上继续发送数据）；MWMOD 位（位 [1]）控制是否采用顺序模式（Sequential Mode），即控制字仅发送一次，后续数据帧连续传输，减少控制字开销。

### 4.3 软件可见寄存器

#### 4.3.1 配置寄存器组

表 4-1 汇总了 SPI 控制器的所有配置寄存器。软件必须在使能 SSIENR 之前完成 CTRLR0/CTRLR1/BAUDR/SER 的配置；在传输过程中修改这些寄存器将导致未定义行为。

**表 4-1 配置寄存器组**

| 偏移地址 | 寄存器名 | 位域 | 读写属性 | 复位值 | 功能描述 |
|---------|---------|------|---------|--------|---------|
| 0x00 | **CTRLR0** | [31:24] | R/W | 0x00 | 保留，读返回 0 |
| | | [23:22] SPI_FRF | R/W | 0x0 | 帧格式选择：00=Motorola SPI，01=TI SSP，10=Microwire，11=保留 |
| | | [21:20] | R/W | 0x0 | 保留 |
| | | [19:16] CFS | R/W | 0x0 | Microwire 控制帧大小，CFS+1 为控制帧位数（仅 Microwire 模式有效） |
| | | [15] SRL | R/W | 0 | Shift Register Loopback：1=内部 TX Shift→RX Shift 回环，用于自检 |
| | | [14] SLV_OE | R/W | 0 | Slave 输出使能：Slave 模式下 1=驱动 MISO，0=MISO 高阻 |
| | | [13] | R/W | 0 | 保留 |
| | | [12:11] TMOD | R/W | 0x0 | 传输模式：00=TX/RX 全双工，01=TX Only，10=RX Only，11=EEPROM Read |
| | | [10] SCPOL | R/W | 0 | 串行时钟极性（CPOL）：0=空闲低，1=空闲高 |
| | | [9] SCPH | R/W | 0 | 串行时钟相位（CPHA）：0=第 1 个边沿采样，1=第 2 个边沿采样 |
| | | [8:0] DFS | R/W | 0x007 | 数据帧大小：DFS+1 = 每帧位数，范围 1~16 bit（0x007=8 bit） |
| 0x04 | **CTRLR1** | [15:0] NDF | R/W | 0x0000 | 连续接收数据帧数（仅 Master 的 RX Only 或 EEPROM Read 模式）：NDF+1 为接收帧总数 |
| 0x08 | **SSIENR** | [31:1] | R/W | 0x0 | 保留 |
| | | [0] SSI_EN | R/W | 0 | SSI 模块总使能：1=使能所有子模块，0=复位除寄存器外的所有逻辑 |
| 0x0C | **MWCR** | [31:2] | R/W | 0x0 | 保留 |
| | | [1] MWMOD | R/W | 0 | Microwire 顺序模式：1=控制字仅发一次，后续数据连续传输 |
| | | [0] MDD | R/W | 0 | Microwire 数据方向：0=接收（Slave→Master），1=发送（Master→Slave） |
| 0x10 | **SER** | [31:4] | R/W | 0x0 | 保留 |
| | | [3:0] SER_N | R/W | 0x0 | Slave 使能（片选输出）：bit[n]=1 选中并拉低 CS_N[n]，Master 模式有效 |
| 0x14 | **BAUDR** | [31:16] | R/W | 0x0000 | 保留 |
| | | [15:0] SCKDV | R/W | 0x0000 | 波特率分频值：SCLK_OUT = PCLK / SCKDV，必须为偶数，范围 2~65534 |

CTRLR0 是功能最密集的配置寄存器，其 TMOD 字段直接决定后续数据通路的行为模式。当 TMOD=01（TX Only）时，RX FIFO 不被写入，ISR.RXFI 和 ISR.RXOI 不会触发；当 TMOD=10（RX Only）时，软件需预先向 TX FIFO 写入至少一个 dummy 字以启动 SCLK 生成。CTRLR1 仅在 Master 模式且 TMOD 为 RX Only 或 EEPROM Read 时有效，硬件在接收到 NDF+1 个数据帧后自动停止 SCLK 并释放片选，实现定长接收的自动化。BAUDR.SCKDV 的偶数约束源于分频器内部的半周期计数结构：计数器在每个 PCLK 边沿递增，当计数值达到 SCKDV/2 时翻转 SCLK 输出，因此奇数分频值会导致非对称占空比。

#### 4.3.2 数据寄存器

DR（Data Register）位于偏移地址 0x60，是软件与 TX/RX FIFO 交互的唯一数据端口。该寄存器采用读写分离的语义映射：写 DR 将 PWDATA 的低 16 位推入 TX FIFO（实际写入位宽由 DFS 决定，若 DFS<7 则仅低 DFS+1 位有效）；读 DR 从 RX FIFO 弹出数据至 PRDATA 的低 16 位，高 16 位读回 0。为了提高 APB burst 传输效率，DR 在地址空间 0x60~0x7C 上存在 8 个物理别名，软件可通过连续访问这些别名地址实现快速的 FIFO 批量读写，而不必在每次访问后修改地址指针。DR 的访问宽度必须与 DFS 配置匹配：当 DFS ≤ 7（即帧长 ≤ 8 bit）时，8 bit 访问即可；当 DFS ≥ 8 时，必须使用 16 bit 访问以确保完整数据被收发。若 TX FIFO 已满时执行写 DR 操作，硬件将丢弃写入数据并置位 ISR.TXOI（TX Overflow Interrupt）；若 RX FIFO 为空时执行读 DR 操作，读回数据为未定义值，同时 ISR.RXUI（RX Underflow Interrupt）置位。

#### 4.3.3 状态与中断寄存器

表 4-2 给出了状态、FIFO 水位及中断相关的寄存器完整定义。状态寄存器 SR 提供实时运行的硬件标志，适用于查询式驱动；中断寄存器组（IMR/ISR/RIS/ICR）配合 FIFO 阈值寄存器（TXFTLR/RXFTLR）实现中断驱动的高效数据传输。

**表 4-2 状态与中断寄存器组**

| 偏移地址 | 寄存器名 | 位域 | 读写属性 | 复位值 | 功能描述 |
|---------|---------|------|---------|--------|---------|
| 0x18 | **TXFTLR** | [31:8] | R/W | 0x000000 | 保留 |
| | | [7:0] TFT | R/W | 0x00 | TX FIFO 阈值：当 TX FIFO 数据量 ≤ TFT 时触发 TXE 中断 |
| 0x1C | **RXFTLR** | [31:8] | R/W | 0x000000 | 保留 |
| | | [7:0] RFT | R/W | 0x00 | RX FIFO 阈值：当 RX FIFO 数据量 > RFT 时触发 RXF 中断 |
| 0x20 | **TXFLR** | [31:8] | RO | 0x000000 | 保留 |
| | | [7:0] TXTFL | RO | 0x00 | TX FIFO 当前数据量（0 = 空，FIFO_DEPTH = 满） |
| 0x24 | **RXFLR** | [31:8] | RO | 0x000000 | 保留 |
| | | [7:0] RXTFL | RO | 0x00 | RX FIFO 当前数据量（0 = 空，FIFO_DEPTH = 满） |
| 0x28 | **SR** | [31:8] | RO | 0x000000 | 保留 |
| | | [7] DCOLR | RO | 0 | 数据冲突检测（仅 Slave）：MISO 输出与总线状态不符时置位 |
| | | [6] TXE | RO | 0 | 发送错误：TX FIFO 空时 Shift Register 请求数据 |
| | | [5] RFF | RO | 0 | RX FIFO Full：1=RX FIFO 已达最大深度 |
| | | [4] RFNE | RO | 0 | RX FIFO Not Empty：1=RX FIFO 至少含 1 个数据 |
| | | [3] TFE | RO | 1 | TX FIFO Empty：1=TX FIFO 为空，可直接写入 |
| | | [2] TFNF | RO | 1 | TX FIFO Not Full：1=TX FIFO 未满，可继续写入 |
| | | [1] BUSY | RO | 0 | SSI 忙标志：1=Shift Register 正在进行传输 |
| | | [0] | RO | 0 | 保留 |
| 0x2C | **IMR** | [31:6] | R/W | 0x000000 | 保留 |
| | | [5] MSTIM | R/W | 0 | 多主冲突中断屏蔽：1=使能 |
| | | [4] RXFIM | R/W | 0 | RX FIFO 满中断屏蔽：1=使能 |
| | | [3] RXOIM | R/W | 0 | RX FIFO 溢出中断屏蔽：1=使能 |
| | | [2] RXUIM | R/W | 0 | RX FIFO 下溢中断屏蔽：1=使能 |
| | | [1] TXOIM | R/W | 0 | TX FIFO 溢出中断屏蔽：1=使能 |
| | | [0] TXEIM | R/W | 0 | TX FIFO 空中断屏蔽：1=使能（触发条件：TXFLR ≤ TXFTLR） |
| 0x30 | **ISR** | [31:6] | RO | 0x000000 | 保留 |
| | | [5:0] | RO | 0x00 | 中断状态：ISR[n] = RIS[n] & IMR[n]，反映当前使能的中断源 |
| 0x34 | **RIS** | [31:6] | RO | 0x000000 | 保留 |
| | | [5] MSTIR | RO | 0 | 多主冲突原始中断：检测到 ss_in_n=0 时置位（Master 模式下） |
| | | [4] RXFIR | RO | 0 | RX FIFO 满原始中断 |
| | | [3] RXOIR | RO | 0 | RX FIFO 溢出原始中断：RX FIFO 满时仍收到新数据 |
| | | [2] RXUIR | RO | 0 | RX FIFO 下溢原始中断：读空 RX FIFO |
| | | [1] TXOIR | RO | 0 | TX FIFO 溢出原始中断：写满 TX FIFO |
| | | [0] TXEIR | RO | 0 | TX FIFO 空原始中断：TXFLR ≤ TXFTLR.TFT |
| 0x48 | **ICR** | [31:1] | RO | 0x000000 | 保留 |
| | | [0] ICR | RO | 0 | 组合中断清除：读此寄存器清除所有中断标志 |

中断系统的层次结构为：原始中断源（RIS）→ 中断屏蔽（IMR）→ 中断状态（ISR）→ 物理中断线 SSIINTR。软件可通过读取 ISR 确定当前活跃的中断源，通过读取 ICR 一次性清除全部中断标志。TXE 中断（TX FIFO Empty）的行为与 TXFTLR 密切相关：若 TXFTLR.TFT=0，则只要 TX FIFO 数据量降至 0 即触发中断，适合单次小量传输；若 TFT=7，则 TX FIFO 数据量 ≤ 7 时触发中断，软件可在中断服务程序中批量写入 FIFO_DEPTH-7 个数据字，减少中断频率。RX 方向的 RFT 阈值同理，建议设置为 RX FIFO 深度的 50%~75%，以预留足够的接收缓冲余量应对中断延迟。BUSY 标志的语义需特别注意：BUSY=1 仅表示 Shift Register 正在移位，不代表 FIFO 非空；当 BUSY=0 且 TFE=1 时，可安全地重新配置 CTRLR0 或关闭 SSIENR。


---

## 5. I3C — 改进型两线串行总线

I3C（Improved Inter-Integrated Circuit）由 MIPI Alliance 制定，规范版本 v1.1.1 在 2016 年首次发布后经过多次修订，旨在以两根信号线（SDA、SCL）替代传统 I2C 与 SPI 的混合拓扑，为传感器集群、摄像头模组、DDR5 SPD Hub 等场景提供更高带宽与更低功耗的片间互联方案。与 I2C 相比，I3C 将时钟速率从 400 kHz 提升至 12.5 MHz，引入动态地址分配（DAA, Dynamic Address Assignment）以消除静态地址冲突，并原生支持带内中断（IBI, In-Band Interrupt）从而省却独立的中断引脚。I3C 总线同时允许 I2C 遗留设备以 100 kHz 或 400 kHz 的速率开漏挂载，通过保留广播地址 `0x7E` 自动与 I2C 设备隔离——I2C 设备不会响应该地址，而 I3C 设备将其识别为广播入口。

### 5.1 内部架构与框图

#### 5.1.1 I3C 控制器顶层框图

本控制器采用 APB4 从接口作为软件访问通道，内部以寄存器组、双模协议引擎、SDR/DDR 数据通路及可选 DMA 接口四级结构组织。APB 接口侧配备 32 位寄存器组，包含配置、命令、数据端口、状态与中断寄存器。协议引擎层将 I2C 兼容逻辑与 I3C 新特性逻辑合并为统一的状态机，依据当前传输上下文在开漏（Open-Drain）与推挽（Push-Pull）驱动模式间自动切换。SDR/DDR 引擎负责比特级编码：SDR 模式下每 SCL 周期传输 1 bit，DDR 模式下每 SCL 周期在上升沿与下降沿各采样 1 bit，实现 2 bit/周期的吞吐率。内置 DMA 接口通过 AHB 主端口将 TX/RX 数据缓冲区与系统存储器连接，支持 8 级环形描述符队列，从而减轻 CPU 在批量传感器数据读取中的中断负担。

```
+-----------------------------------------------------------------------+
|                         I3C Controller Top                              |
|                                                                         |
|  +-----------+     +----------------+     +-------------------------+   |
|  |  APB4     |     |   Register     |     |   Dual-Mode Protocol    |   |
|  |  Slave    |---->|    Block       |---->|       Engine            |   |
|  | Interface |     |  (32-bit R/W)  |     | (I2C-compat + I3C-ext)  |   |
|  +-----------+     +----------------+     +------------+------------+   |
|       |                                              |                |
|       |                   +-----------+              |                |
|       |                   |   DMA     |<-------------+                |
|       |                   | Interface |              |                |
|       |                   +-----+-----+     +--------+--------+        |
|       |                         |             |  SDR/DDR Engine  |       |
|       |                         |             +--------+--------+        |
|       |                         |                      |                 |
|       v                         v                      v                 |
|  +-----------------------------------------------------------+         |
|  |                     Pin Driver & Pad                      |         |
|  |         (Open-Drain / Push-Pull Auto Switch)              |         |
|  +------------------------+-+--------------------------------+         |
|                           | |                                          |
|                         SCL SDA                                       |
+-----------------------------------------------------------------------+
```

上图的数据流沿从左至右、从上至下方向流动。APB 总线上的 CPU 访问首先到达寄存器组，写入命令寄存器触发协议引擎启动一次传输；协议引擎根据命令中的模式位选择 SDR 或 DDR 数据通路，并在仲裁阶段使用开漏驱动，在数据阶段切换为推挽驱动以提升边沿速率。DMA 接口在使能后绕过寄存器组的数据端口，直接从存储器向 TX FIFO 或从 RX FIFO 向存储器搬运数据。

#### 5.1.2 与 I2C 的关键差异模块

I3C 控制器在 I2C 兼容核心之上增设三个专用子模块。动态地址分配（DAA）引擎负责在总线初始化阶段执行 ENTDAA 流程：控制器发出广播 ENTDAA 后，从设备依次上报 48 位预置 ID（PID）、总线特性寄存器（BCR）与设备特性寄存器（DCR），DAA 引擎为每个设备计算奇偶校验位并下发 7 位动态地址，同时维护一张设备角色表（DET, Device Enumeration Table）。带内中断（IBI）仲裁器监测总线空闲状态，当检测到从设备发起的 START（从设备在 SCL 高电平期间下拉 SDA）时，提供时钟并执行地址仲裁：多位从设备同时竞争时，地址数值更小者胜出（低地址高优先级），胜出的从设备随后发送强制性数据字节（MDB, Mandatory Data Byte）。CCC 命令解码器识别以广播地址 `0x7E` 开头的命令帧，解析 8 位命令码并触发内部动作，例如 ENEC/DISEC 控制 IBI 与热插拔事件的使能，ENTAS 通知从设备进入低功耗活动状态，RSTDAA 强制清除所有动态地址。

### 5.2 工作原理

#### 5.2.1 I3C 协议分层：SDR 与 DDR 模式

SDR（Single Data Rate）模式是 I3C 的基础传输方式，与 I2C 的时序兼容但速率更高。在仲裁、地址及应答阶段，SDA 线工作于开漏模式，SCL 最高 400 kHz，确保 I2C 遗留设备能够监听总线而不被误触发；进入数据阶段后，驱动器切换为推挽模式，SCL 可提升至 12.5 MHz。I2C 遗留设备共存机制依赖于地址隔离：I3C 广播地址 `0x7E` 为 I2C 保留地址，I2C 设备看到该地址后不应答，从而静默忽略所有 CCC 广播与 DAA 过程。DDR（Double Data Rate）模式要求总线上所有活跃设备均支持 HDR（High Data Rate）能力，控制器先通过广播 CCC `ENTHDR(0)` 通知总线进入 HDR-DDR 状态，随后在推挽模式下于每个 SCL 周期的上升沿与下降沿各传输 1 bit，有效吞吐率可达 25 Mbps（12.5 MHz × 2 bit）。DDR 的帧格式与 SDR 不同：数据以 16 bit 字为单位组织，包含 2 bit 前缀、8 bit 有效载荷与 6 bit CRC，控制器在 HDR 退出模式序列（HDR Exit Pattern）后返回 SDR。

#### 5.2.2 总线初始化流程

总线上电后的标准初始化序列遵循以下四步。第一步，控制器发送广播 DISEC 命令，禁用所有从设备的 IBI、热插拔与控制器角色请求事件，防止初始化期间产生竞争。第二步，发送广播 RSTDAA，强制所有从设备清除已持有的动态地址与组地址，回到未分配状态。第三步，发送广播 ENTDAA 进入动态地址分配流程：控制器发出 START + `0x7E` + W，随后所有尚未拥有动态地址的从设备以开漏方式竞争总线；仲裁胜出者传输 48 位 PID、8 位 BCR 与 8 位 DCR，控制器在接收到这些标识后，计算 7 位动态地址的奇偶校验位（奇校验，地址位为 D[6:0]，校验位 P = ~(D6⊕D5⊕D4⊕D3⊕D2⊕D1⊕D0)），并以单字节形式回写；从设备校验通过后应答 ACK，控制器继续循环该过程，直到某次 `0x7E` 读操作收到 NACK，表明所有从设备均已分配地址。第四步，发送广播 ENEC 使能 IBI 与热插拔事件，总线进入正常运行态。控制器将各设备的动态地址、BCR、DCR 写入内部的设备角色表（DET），供后续私有读/写事务快速索引。

#### 5.2.3 带内中断（IBI）

IBI 是 I3C 区别于 I2C 的核心特性之一，它允许从设备在无需额外中断引脚的情况下异步通知控制器。当总线处于空闲状态（Bus Available，SCL 与 SDA 均为高且持续超过 Bus Free 时间）时，从设备将 SDA 下拉，控制器检测到该事件后于 1 μs 内将 SCL 下拉，形成一次由从设备发起的 START 条件。随后控制器提供 SCL 时钟，竞争总线的从设备输出各自的 7 位动态地址；仲裁期间 SDA 仍为开漏，遵循“写 0 赢写 1”的线与规则，因此地址数值较小者（二进制下更多高位为 0）必然胜出。控制器对胜出地址发送 ACK，胜出的从设备随后传输 1 字节 MDB，其中高 4 位为群码（Group ID），低 4 位为特定中断原因码，依据 MIPI MDB Values Implementers Table 定义。若控制器希望拒绝此次 IBI，可在地址阶段或 MDB 阶段发送 NACK，从设备将在总线再次空闲后重试。IBI 仲裁器内部维护优先级屏蔽寄存器，可编程禁止特定地址范围发起中断，从而避免高优先级从设备持续垄断总线。

#### 5.2.4 CCC 通用命令

通用命令代码（CCC, Common Command Code）是 I3C 总线管理的标准化手段，分为广播（Broadcast，目标地址 `0x7E` + W）与定向（Direct，目标为特定从设备动态地址）两类。ENTDAA（`0x07`）触发 DAA 流程，已在 5.2.2 节详述。RSTDAA（`0x06`）为广播命令，强制所有从设备清除动态地址，常用于系统复归或地址重新规划。ENEC（`0x00`）与 DISEC（`0x01`）分别使能或禁止从设备发起的事件，命令 payload 的 bit[0]`ENINT`/`DISINT` 控制 IBI，bit[2]`ENHJ`/`DISHJ` 控制热插拔请求，控制器可在初始化或低功耗阶段精确关闭不需要的异步源。ENTAS（`0x02`–`0x05`，对应 ENTAS0–ENTAS3）告知从设备总线即将进入空闲，允许其按四个级别调整内部状态：状态 0 要求 1 μs 内响应（无低功耗），状态 3 允许 50 ms 唤醒时间，从设备可据此关闭内部振荡器或 ADC 偏置。SETMWL（`0x09`）与 SETMRL（`0x0A`）协商从设备的写/读最大数据长度，避免控制器发送超出从设备 FIFO 深度的传输。上述 CCC 均由命令解码器自动解析，无需 CPU 介入比特级时序。

### 5.3 软件可见寄存器

软件通过 32 位 APB 接口访问 I3C 控制器，所有寄存器按字对齐排列，支持字节、半字与字访问。表 5-1 汇总配置与命令寄存器，表 5-2 汇总状态与中断寄存器。

**表 5-1 I3C 配置与命令寄存器组**

| 偏移地址 | 寄存器名 | 位域 | 属性 | 复位值 | 功能描述 |
|:---:|:---|:---|:---:|:---:|:---|
| `0x00` | `I3C_MASTER_CONFIG` | `[0]` MODE_SEL | R/W | `0x0` | 控制器模式选择：`0` = Slave，`1` = Master |
| | | `[2:1]` BUS_MODE | R/W | `0x0` | 总线模式：`00`= 纯 I3C，`01`= I2C+Fm（400kHz），`10`= I2C+Fs+（1MHz），`11`= 混合自动检测 |
| | | `[4:3]` HDR_CAP | R/W | `0x1` | HDR 支持能力：`01`= SDR only，`10`= SDR+HDR-DDR，`11`= 保留 |
| | | `[15:5]` RSVD | — | `0x0` | 保留，读零写忽略 |
| | | `[23:16]` MAX_DEVS | R/W | `0x08` | 支持的从设备最大数量（决定 DET 深度），范围 1–16 |
| | | `[31:24]` RSVD | — | `0x0` | 保留 |
| `0x04` | `I3C_SLAVE_CONFIG` | `[6:0]` STATIC_ADDR | R/W | `0x00` | 从设备模式下的静态 I2C 地址（7 bit） |
| | | `[14:7]` DYNAMIC_ADDR | R/W | `0x00` | 从设备模式下的动态地址，DAA 后由主设备写入 |
| | | `[15]` ADDR_VALID | R/W | `0x0` | 地址有效标志：`1` 表示 DYNAMIC_ADDR 已合法分配 |
| | | `[23:16]` BCR | R/W | `0x00` | 总线特性寄存器值，初始化时上报给主设备 |
| | | `[31:24]` DCR | R/W | `0x00` | 设备特性寄存器值，初始化时上报给主设备 |
| `0x08` | `I3C_CTRL` | `[0]` ENABLE | R/W | `0x0` | 控制器全局使能：`1` 激活 SCL/SDA 驱动器 |
| | | `[1]` DMA_EN | R/W | `0x0` | DMA 接口使能：`1` 启用 AHB 主端口数据搬运 |
| | | `[2]` IBI_ACCEPT | R/W | `0x0` | IBI 自动应答：`1` 使能硬件自动 ACK 从设备 IBI |
| | | `[3]` HJ_ACCEPT | R/W | `0x0` | 热插拔自动应答：`1` 使能硬件自动处理 Hot-Join 请求 |
| | | `[4]` ABORT | R/W1S | `0x0` | 传输中止请求：写 `1` 立即终止当前传输并清 FIFO |
| | | `[31:5]` RSVD | — | `0x0` | 保留 |
| `0x0C` | `I3C_SCL_TIMING` | `[7:0]` SCL_OD_LCNT | R/W | `0x50` | 开漏模式下 SCL 低电平周期计数值 |
| | | `[15:8]` SCL_OD_HCNT | R/W | `0x50` | 开漏模式下 SCL 高电平周期计数值 |
| | | `[23:16]` SCL_PP_LCNT | R/W | `0x08` | 推挽模式下 SCL 低电平周期计数值 |
| | | `[31:24]` SCL_PP_HCNT | R/W | `0x08` | 推挽模式下 SCL 高电平周期计数值 |
| `0x10` | `I3C_TX_RX_DATA_PORT` | `[7:0]` DATA | R/W | `0x00` | TX/RX 数据端口：写操作压入 TX FIFO，读操作弹出 RX FIFO |
| | | `[15:8]` RSVD | — | `0x0` | 保留 |
| | | `[23:16]` TX_FIFO_LVL | R | `0x00` | 当前 TX FIFO 占用深度（只读） |
| | | `[31:24]` RX_FIFO_LVL | R | `0x00` | 当前 RX FIFO 占用深度（只读） |
| `0x14` | `I3C_COMMAND` | `[6:0]` DEV_ADDR | R/W | `0x00` | 目标设备 7 位地址；CCC 广播时固定为 `0x7E` |
| | | `[7]` RNW | R/W | `0x0` | 读写方向：`0` = 写（W），`1` = 读（R） |
| | | `[15:8]` CCC_CODE | R/W | `0x00` | CCC 命令码（仅在 CP=`01` 时有效） |
| | | `[23:16]` BYTE_CNT | R/W | `0x00` | 传输字节数减 1（`0x00`=1 字节，`0xFF`=256 字节） |
| | | `[25:24]` CP | R/W | `0x0` | 命令类型：`00`= 私有传输，`01`= CCC 广播，`10`= CCC 定向，`11`= HDR 模式入口 |
| | | `[26]` TOC | R/W | `0x0` | 传输结束控制：`0`= 后续命令跟随（Sr），`1`= 最终命令（P） |
| | | `[31:27]` RSVD | — | `0x0` | 保留 |

`I3C_MASTER_CONFIG` 寄存器的 `MAX_DEVS` 字段直接决定内部 DET 的 SRAM 深度，建议在 SoC 集成阶段根据实际挂载的传感器数量裁剪，以减少门数。`I3C_SCL_TIMING` 中的四个时序参数以控制器工作时钟（通常 50–100 MHz APB 时钟域经过预分频）的周期数为基本单位；例如当预分频后为 25 MHz 时，将 `SCL_PP_LCNT` 与 `SCL_PP_HCNT` 均配置为 `0x01` 即可获得 12.5 MHz 的推挽 SCL 频率。

`I3C_COMMAND` 是软件触发一次传输的核心入口。CPU 先将设备地址、CCC 码、字节数等字段写入该寄存器，随后控制器自动将命令压入内部命令队列并启动协议引擎。CP 字段区分四种命令类型：私有传输用于常规的寄存器读/写；CCC 广播向所有从设备发送配置变更；CCC 定向针对单个从设备读取状态（如 GETSTATUS、GETPID）；HDR 模式入口则发出 `ENTHDR(0)` 并切换至 DDR 引擎。

**表 5-2 I3C 状态、中断与设备表寄存器组**

| 偏移地址 | 寄存器名 | 位域 | 属性 | 复位值 | 功能描述 |
|:---:|:---|:---|:---:|:---:|:---|
| `0x18` | `I3C_STATUS` | `[0]` BUS_BUSY | R | `0x0` | 总线忙标志：`1` 表示控制器正在执行传输 |
| | | `[1]` MASTER_MODE | R | `0x0` | 当前角色：`1` = Master，`0` = Slave |
| | | `[2]` DA_MATCH | R | `0x0` | 动态地址匹配：从设备模式下检测到自身地址 |
| | | `[3]` CCC_ACTIVE | R | `0x0` | CCC 传输进行中标志 |
| | | `[4]` HDR_MODE | R | `0x0` | HDR 模式活跃标志 |
| | | `[7:5]` RSVD | — | `0x0` | 保留 |
| | | `[15:8]` LAST_DA | R | `0x00` | 最后一次成功通信的设备动态地址 |
| | | `[23:16]` BUS_ERR_CODE | R | `0x00` | 总线错误编码：`0x01`= SDA 被非预期拉低，`0x02`= CRC 错误，`0x04`= 仲裁丢失 |
| | | `[31:24]` RSVD | — | `0x0` | 保留 |
| `0x1C` | `I3C_INT_STS` | `[0]` TX_COMPLETE | R/W1C | `0x0` | 传输完成中断：当前命令队列全部执行完毕 |
| | | `[1]` RX_READY | R/W1C | `0x0` | RX FIFO 达到阈值中断 |
| | | `[2]` IBI_RECEIVED | R/W1C | `0x0` | 收到带内中断请求中断 |
| | | `[3]` CCC_DONE | R/W1C | `0x0` | CCC 命令执行完毕中断 |
| | | `[4]` DAA_COMPLETE | R/W1C | `0x0` | 动态地址分配流程结束中断 |
| | | `[5]` HJ_RECEIVED | R/W1C | `0x0` | 收到热插拔请求中断 |
| | | `[6]` ARB_LOST | R/W1C | `0x0` | 仲裁丢失中断（主设备发起传输时竞争失败） |
| | | `[7]` BUS_ERROR | R/W1C | `0x0` | 总线错误中断 |
| | | `[15:8]` FIFO_STAT | R | `0x0` | FIFO 状态：`bit0`= TX 下溢，`bit1`= RX 溢出 |
| | | `[31:16]` RSVD | — | `0x0` | 保留 |
| `0x20` | `I3C_INT_EN` | `[7:0]` INT_MASK | R/W | `0x00` | 中断使能掩码，对应 `I3C_INT_STS` bit `[7:0]`，`1` = 使能 |
| | | `[31:8]` RSVD | — | `0x0` | 保留 |
| `0x24`–`0x60` | `I3C_DEVICE_TABLE[0..15]` | `[6:0]` DYNAMIC_ADDR | R | `0x00` | 已分配动态地址（7 bit） |
| | | `[14:7]` STATIC_ADDR | R/W | `0x00` | 对应设备的静态 I2C 地址（若为 I2C 遗留设备） |
| | | `[15]` VALID | R/W | `0x0` | 表项有效位 |
| | | `[23:16]` BCR | R | `0x00` | 设备总线特性寄存器快照 |
| | | `[31:24]` DCR | R | `0x00` | 设备设备特性寄存器快照 |

`I3C_STATUS` 为只读状态寄存器，软件可在轮询模式下通过检测 `BUS_BUSY` 位判断命令是否执行完毕；在中断驱动模式下，则等待 `TX_COMPLETE` 中断。`BUS_ERR_CODE` 提供粗粒度的故障定位：当多个从设备同时响应非预期时，SDA 线与结果异常会触发 `0x01` 错误；HDR-DDR 模式下 CRC6 校验失败则触发 `0x02`。

`I3C_INT_STS` 采用写 1 清除（W1C）机制，避免中断丢失与软件竞态。`IBI_RECEIVED` 与 `HJ_RECEIVED` 是 I3C 特有的异步事件，`DAA_COMPLETE` 则在 ENTDAA 流程结束后置位，软件此时应遍历 `I3C_DEVICE_TABLE` 读取从设备分配结果。设备表共 16 个条目，偏移 `0x24` 起每 4 字节一个表项，对应 `MAX_DEVS` 配置的最大从设备数。每个表项在 DAA 完成后由硬件自动填充 `DYNAMIC_ADDR`、`BCR` 与 `DCR`，软件亦可预写 `STATIC_ADDR` 与 `VALID` 位以登记已知的 I2C 遗留设备，使控制器在混合总线中正确跳过这些地址的 DAA 仲裁。

中断寄存器的设计遵循层级屏蔽原则：`I3C_INT_EN` 提供总开关，而 `I3C_CTRL` 中的 `IBI_ACCEPT` 与 `HJ_ACCEPT` 提供行为级开关——即使 `IBI_RECEIVED` 中断被使能，若 `IBI_ACCEPT=0`，控制器仍会在地址阶段发送 NACK 拒绝 IBI，仅将事件记录于状态寄存器而不触发中断。这种分层控制允许软件在不同功耗状态下灵活管理总线异步源。


---

## 6. GPIO / Pinmux — 通用输入输出与引脚复用

GPIO（General Purpose Input/Output）模块与 Pinmux（Pin Multiplexer）单元是 SoC 数字外设层与物理封装引脚之间的桥梁。GPIO 提供软件可控的通用数字输入输出能力，而 Pinmux 解决 SoC 外设信号数量远超物理引脚数量的结构性矛盾。两者通常以 APB Slave 接口接入系统总线，本章以 32-pin Bank 为组织单元，描述其内部架构、数据流机制及完整的软件寄存器规范。

### 6.1 内部架构与框图

#### 6.1.1 GPIO 模块框图

每个 GPIO Bank 管理最多 32 个引脚，内部由 APB 从机接口、寄存器组、中断检测逻辑和输入同步器四大部分构成。输出路径从数据寄存器（DR）经方向控制门驱动至 Pinmux 输出多路选择器；输入路径则从 Pinmux 输入多路选择器经过两级触发器同步器消除亚稳态后送入 Pad 状态寄存器（PSR）和中断检测单元。中断检测逻辑包含独立的边沿检测（上升沿/下降沿）和电平检测（高电平/低电平）两条通路，检测结果经中断屏蔽寄存器（IMR）过滤后写入中断状态寄存器（ISR），最终 32 个引脚的中断请求通过 OR 树聚合成 Bank 级中断线输出。

```
                              ┌─────────────────────────────────────────────────────┐
                              │              GPIO Controller (per Bank)              │
                              │                 (up to 32 pins)                    │
   ┌──────────────────────────┼─────────────────────────────────────────────────────┼──────────────────┐
   │                          │                                                     │                  │
   │   APB Bus (PCLK)         │   ┌──────────┐   ┌──────────┐   ┌──────────┐      │                  │
   │      │                   │   │ GPIO_DR  │   │GPIO_GDIR │   │ GPIO_PSR │      │                  │
   │      ▼                   │   │ (Data)   │   │(Direction│   │(Pad State│      │                  │
   │ ┌─────────┐              │   └────┬─────┘   └────┬─────┘   └────┬─────┘      │                  │
   │ │APB Slave│◄────────────►│◄───────┘              │              │            │                  │
   │ │Interface│              │                       │              │            │                  │
   │ └─────────┘              │   ┌──────────┐   ┌────┴────┐   ┌────┴────┐         │                  │
   │                          │   │GPIO_ICR1 │   │GPIO_ICR2│   │GPIO_IMR │         │                  │
   │                          │   │(pin 0-15)│   │(pin16-31│   │(Int Mask│         │                  │
   │                          │   └────┬─────┘   └────┬─────┘   └────┬─────┘         │                  │
   │                          │        │              │              │              │                  │
   │                          │   ┌────┴──────────────┴──────────────┴────┐         │                  │
   │                          │   │      Interrupt Detection Logic         │         │                  │
   │                          │   │  ┌─────────────┐  ┌─────────────┐    │         │                  │
   │                          │   │  │ Edge Detect │  │ Level Detect│    │         │                  │
   │                          │   │  │ (Rise/Fall) │  │ (High/Low)  │    │         │                  │
   │                          │   │  └──────┬──────┘  └──────┬──────┘    │         │                  │
   │                          │   │         └────────────────┘             │         │                  │
   │                          │   │                  │                     │         │                  │
   │                          │   │         ┌────────┴────────┐            │         │                  │
   │                          │   │         │   GPIO_ISR      │            │         │                  │
   │                          │   │         │ (Int Status)    │            │         │                  │
   │                          │   │         └────────┬────────┘            │         │                  │
   │                          │   └──────────────────┼─────────────────────┘         │                  │
   │                          │                      │                               │                  │
   │                          │   ┌──────────────────┴──────────────────┐           │                  │
   │                          │   │       GPIO_EDGE_SEL                 │           │                  │
   │                          │   │  (Override ICR for both-edge)       │           │                  │
   │                          │   └─────────────────────────────────────┘           │                  │
   │                          │                      │                               │                  │
   └──────────────────────────┼──────────────────────┼───────────────────────────────┼──────────────────┘
                              │                      ▼                               │
                              │          gpio_interrupt[31:0] ──────► IRQ Aggregator│
                              │                                                     │
                              │   ┌─────────────────────────────────────────────┐   │
                              │   │      Input Synchronizer (2-stage FF)        │   │
                              │   │   pad_in ──► [FF1] ──► [FF2] ──► synced_in │   │
                              │   └─────────────────────────────────────────────┘   │
                              │                      │                               │
                              ▼                      ▼                               ▼
                       pin_out[31:0]           pin_in[31:0]                    pad_ctrl[31:0]
                              │                      │                               │
                              ▼                      ▼                               ▼
                        ┌──────────┐          ┌──────────┐                  ┌──────────┐
                        │  Pinmux  │          │  Pinmux  │                  │  Pinmux  │
                        │Out Mux   │          │In  Mux   │                  │Pad Ctrl  │
                        └──────────┘          └──────────┘                  └──────────┘
```

#### 6.1.2 Pinmux 复用矩阵框图

Pinmux 控制器位于 GPIO 模块与物理焊盘之间，承担功能选择和电气属性配置的双重职责。每个物理焊盘对应一个 8 选 1 功能多路选择器，由 PINMUX_SELn 寄存器的 3-4 bit 字段控制，输入端分别连接 GPIO（Func 0）、UART、SPI、I2C、PWM 等专用外设信号。多路选择器输出进入 Pad 控制单元，该单元包含驱动强度调节、上拉/下拉电阻使能、开漏输出控制、施密特触发器使能、斜率控制和输入/输出缓冲使能等子模块，最终将配置后的信号驱动至物理焊盘。

```
                              ┌──────────────────────────────────────────────────────────────┐
                              │                    PINMUX Controller                         │
   ┌──────────────────────────┼──────────────────────────────────────────────────────────────┼──────────────┐
   │                          │                                                              │              │
   │   APB Bus (PCLK)         │   ┌─────────────┐      ┌─────────────┐      ┌──────────┐   │              │
   │      │                   │   │ PINMUX_SEL0 │      │ PINMUX_SEL1 │      │PINMUX_   │   │              │
   │      ▼                   │   │ (per pin    │      │ (per pin    │      │ SELn     │   │              │
   │ ┌─────────┐              │   │  3-4 bit)   │      │  3-4 bit)   │      │          │   │              │
   │ │APB Slave│◄────────────►│◄──┴─────────────┘      └──────┬──────┘      └────┬─────┘   │              │
   │ │Interface│              │                             │                  │         │              │
   │ └─────────┘              │   ┌─────────────────────────┴──────────────────┴─────────┐ │              │
   │                          │   │           Function-to-Pad Mux Matrix                 │ │              │
   │                          │   │                                                      │ │              │
   │                          │   │   ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐   │ │              │
   │                          │   │   │ Func 0 │  │ Func 1 │  │ Func 2 │  │ Func 7 │   │ │              │
   │                          │   │   │ (GPIO) │  │(UART0) │  │(SPI0)  │  │(I2C0)  │   │ │              │
   │                          │   │   └───┬────┘  └───┬────┘  └───┬────┘  └───┬────┘   │ │              │
   │                          │   │       │           │           │           │        │ │              │
   │                          │   │   ┌───┴───┐   ┌───┴───┐   ┌───┴───┐   ┌───┴───┐   │ │              │
   │                          │   │   │ 8:1   │   │ 8:1   │   │ 8:1   │   │ 8:1   │   │ │              │
   │                          │   │   │ Mux   │   │ Mux   │   │ Mux   │   │ Mux   │   │ │              │
   │                          │   │   └───┬───┘   └───┬───┘   └───┬───┘   └───┬───┘   │ │              │
   │                          │   │       └───────────┴───────────┴───────────┘        │ │              │
   │                          │   │                   │                                 │ │              │
   │                          │   └───────────────────┼─────────────────────────────────┘ │              │
   │                          │                       │                                   │              │
   │                          │   ┌───────────────────┴─────────────────────────────────┐ │              │
   │                          │   │                PAD Control Block                   │ │              │
   │                          │   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │ │              │
   │                          │   │  │ Drive   │ │ Pull-Up │ │Pull-Down│ │Open Drain│  │ │              │
   │                          │   │  │Strength │ │ Enable  │ │ Enable  │ │ Enable   │  │ │              │
   │                          │   │  │(2-4bit) │ │ (1bit)  │ │ (1bit)  │ │ (1bit)   │  │ │              │
   │                          │   │  └─────────┘ └─────────┘ └─────────┘ └─────────┘  │ │              │
   │                          │   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │ │              │
   │                          │   │  │Schmitt  │ │ Slew    │ │ Input   │ │ Output  │  │ │              │
   │                          │   │  │Trigger  │ │ Rate    │ │ Enable  │ │ Enable  │  │ │              │
   │                          │   │  │(1bit)   │ │(2bit)   │ │(1bit)   │ │(1bit)   │  │ │              │
   │                          │   │  └─────────┘ └─────────┘ └─────────┘ └─────────┘  │ │              │
   │                          │   └─────────────────────────────────────────────────────┘ │              │
   │                          │                      │                                  │              │
   └──────────────────────────┼──────────────────────┼──────────────────────────────────┼──────────────┘
                              ▼                      ▼                                  ▼
                           Pad[0]                 Pad[1]                              Pad[n]
```

#### 6.1.3 GPIO 中断路由

32 个 GPIO 引脚各自产生独立的中断请求，经 Bank 内部 OR 树聚合成单条中断线（或分为高 16 bit / 低 16 bit 两条线）接入 SoC 级中断控制器（GIC 或 PLIC）。软件在收到聚合中断后读取 `GPIO_ISR` 寄存器定位具体触发源，再读取 `GPIO_PSR` 确认当前引脚电平。聚合结构的优势在于减少中断控制器输入端口的消耗——典型 SoC 配置 4-8 个 GPIO Bank 时仅需 4-8 条中断线，而非 128-256 条独立线。

### 6.2 工作原理

#### 6.2.1 GPIO 数据流

GPIO 的数据通路分为输出和输入两条单向路径，由 `GPIOx_GDIR` 寄存器按引脚独立控制方向。输出路径上，软件将目标电平写入 `GPIOx_DR`，该 32-bit 寄存器的 bit[n] 直接驱动 GPIO[n] 的输出缓冲器，但仅当 `GPIOx_GDIR` 的对应位为 1（输出模式）时信号方能通过方向控制门到达 Pinmux。输入路径上，外部引脚状态经 Pinmux 输入多路选择器后进入两级触发器同步器：第一级采样 Pad 输入，第二级锁存第一级输出，从而将跨时钟域传播的亚稳态概率控制在可接受范围。同步后的信号同时送入 `GPIOx_PSR` 和中断检测逻辑；读 `GPIOx_PSR` 返回的是最近一次同步完成的引脚状态，该操作通常消耗 2 个 wait states 以等待同步链稳定。

#### 6.2.2 中断触发机制

每个引脚的中断触发方式由 `GPIOx_ICR1`（pin 0-15）和 `GPIOx_ICR2`（pin 16-31）以 2-bit 字段独立配置：编码 `00` 为低电平触发，`01` 为高电平触发，`10` 为上升沿触发，`11` 为下降沿触发。边沿检测逻辑在同步器输出信号的每个 PCLK 周期采样当前值和前一周期值，通过异或运算配合电平判断提取边沿事件；电平检测逻辑直接比较同步后信号与配置阈值。检测结果与 `GPIOx_IMR` 的对应位进行与操作——仅当 IMR 位为 1（中断使能）时，满足触发条件的 event 才能置位 `GPIOx_ISR`。ISR 采用写-1-清除（W1C）机制，软件在中断服务程序中读取 ISR 定位触发源后，向对应位写 1 清除标志，避免重复进入中断。`GPIOx_EDGE_SEL` 寄存器提供全局覆盖能力：当某 bit 置 1 时，对应引脚忽略 ICR 配置，强制进入双边沿触发模式，适用于需要捕获任意跳变的调试和通信场景。

#### 6.2.3 Pinmux 复用策略

上电复位后，所有物理焊脚的默认功能由熔丝或 ROM 固件预先定义，典型配置为 Func 0（GPIO）以确保芯片启动时引脚处于可控状态。软件通过修改 `PINMUXn_SEL` 寄存器将焊脚从 GPIO 切换至专用外设功能，如 UART_TX、SPI_MOSI、I2C_SCL 或 PWM_OUT。每次切换需遵循先关闭当前功能、修改选择字段、再使能新功能的时序，防止两个功能模块同时驱动同一焊脚造成总线冲突。Pad 控制寄存器 `PADn_CTRL` 与功能选择寄存器解耦设计，允许在复用切换过程中独立保持或更新电气属性；例如 I2C 功能使能时，软件通常将对应焊脚配置为开漏输出并配合外部上拉电阻，而 SPI 功能则使用推挽输出和较高驱动强度以支持高速时钟边沿。

### 6.3 软件可见寄存器

#### 6.3.1 GPIO 配置与数据寄存器

| 偏移地址 | 寄存器名 | 位域 | 属性 | 复位值 | 功能描述 |
|:--------:|:---------|:-----|:----:|:------:|:---------|
| 0x00 | `GPIOx_DR` | [31:0] 每 bit 对应 GPIO[n] 输出值 | R/W | 0x0000_0000 | **数据寄存器**。写操作设置输出引脚电平（1=高，0=低）；读操作返回上次写入值。仅在 `GDIR` 对应位为 1 时驱动 Pad。 |
| 0x04 | `GPIOx_GDIR` | [31:0] 每 bit 控制 GPIO[n] 方向 | R/W | 0x0000_0000 | **方向寄存器**。bit[n]=1 表示 GPIO[n] 为输出；bit[n]=0 表示输入。 |
| 0x08 | `GPIOx_PSR` | [31:0] 每 bit 反映 GPIO[n] 同步后状态 | RO | 0x0000_0000 | **Pad 状态寄存器**。只读，返回经两级同步器后的物理引脚电平。读操作自动等待同步完成，消耗 2 个 wait states。 |
| 0x1C | `GPIOx_EDGE_SEL` | [31:0] 每 bit 覆盖 GPIO[n] 边沿配置 | R/W | 0x0000_0000 | **边沿选择寄存器**。bit[n]=1 时，pin[n] 配置为双边沿触发，覆盖 `ICR1/ICR2` 对该引脚的设置。 |

#### 6.3.2 GPIO 中断寄存器

| 偏移地址 | 寄存器名 | 位域 | 属性 | 复位值 | 功能描述 |
|:--------:|:---------|:-----|:----:|:------:|:---------|
| 0x0C | `GPIOx_ICR1` | [1:0]=pin0, [3:2]=pin1, ..., [31:30]=pin15 | R/W | 0x0000_0000 | **中断配置寄存器 1**。每 2-bit 字段编码：00=低电平，01=高电平，10=上升沿，11=下降沿。 |
| 0x10 | `GPIOx_ICR2` | [1:0]=pin16, [3:2]=pin17, ..., [31:30]=pin31 | R/W | 0x0000_0000 | **中断配置寄存器 2**。编码规则同 ICR1，覆盖 pin 16-31。 |
| 0x14 | `GPIOx_IMR` | [31:0] 每 bit 屏蔽 GPIO[n] 中断 | R/W | 0x0000_0000 | **中断屏蔽寄存器**。bit[n]=1 使能 pin[n] 中断；0 屏蔽。复位后所有中断默认关闭。 |
| 0x18 | `GPIOx_ISR` | [31:0] 每 bit 记录 GPIO[n] 中断事件 | R/W1C | 0x0000_0000 | **中断状态寄存器**。bit[n]=1 表示 pin[n] 满足触发条件。写 1 清除对应位；写 0 无效。 |

#### 6.3.3 Pinmux / Pad 控制寄存器

| 偏移地址 | 寄存器名 | 位域 | 属性 | 复位值 | 功能描述 |
|:--------:|:---------|:-----|:----:|:------:|:---------|
| 0x000 + n×0x04 | `PINMUXn_SEL` | [3:0]=MUX_MODE, [4]=SION, [31:5]=Reserved | R/W | 0x0000_0005 | **复用选择寄存器**。`MUX_MODE` 选择 Pad[n] 功能（0=GPIO, 1=UART0_TX, 2=SPI0_MOSI, 3=I2C0_SCL, 4=PWM0_OUT, 5-7=保留）；`SION`（Software Input On）=1 时强制输入缓冲使能，用于回环测试。每引脚一个寄存器，n 为引脚索引。 |
| 0x400 + n×0x04 | `PADn_CTRL` | [0]=SRE, [2:1]=DSE, [3]=ODE, [4]=PKE, [5]=PUE, [7:6]=PUS, [8]=HYS, [9]=IBE, [10]=OBE, [31:11]=Reserved | R/W | 0x0000_01B0 | **Pad 控制寄存器**。`SRE` 斜率控制（0=慢，1=快）；`DSE` 驱动强度（00=2mA, 01=4mA, 10=8mA, 11=12mA）；`ODE` 开漏使能（1=开漏）；`PKE` 上拉/保持器使能；`PUE` 上拉/保持器选择（0=Keeper, 1=Pull-Up/Down）；`PUS` 上拉强度/下拉选择；`HYS` 施密特触发器使能；`IBE` 输入缓冲使能；`OBE` 输出缓冲使能。 |

上电默认配置中，`PINMUXn_SEL` 的 `MUX_MODE` 字段通常复位为 `0000`（GPIO 功能），`PADn_CTRL` 复位为输入缓冲使能、Keeper 保持器激活、标准驱动强度的保守状态，以防止未配置引脚在上电期间产生浮空振荡或总线冲突。软件在初始化阶段需按应用场景逐项修改 `MUX_MODE`、`DSE`、`ODE` 和 `PUS` 字段，使 Pad 电气特性与所连接外设协议匹配。所有 Pinmux 和 Pad 控制寄存器均为 PCLK 时钟域同步写入，配置生效延迟不超过 2 个 PCLK 周期。


---

## 7. PWM — 脉宽调制控制器

PWM（Pulse Width Modulation，脉宽调制）控制器是 SoC 中负责生成精确时序方波的数字外设，广泛应用于电机调速、LED 亮度控制、DC-DC 变换器栅极驱动以及音频 DAC 等场景。本章所述 PWM IP 集成 4 个独立通道，每个通道支持双比较器输出与互补死区控制，通过 APB 总线接口向软件提供完整的周期、占空比、死区时间及输入捕获配置能力。

### 7.1 内部架构与框图

#### 7.1.1 PWM 控制器顶层框图

PWM 控制器以 APB Slave 接口作为软件访问入口。APB 总线写操作将配置参数写入全局控制寄存器或各通道的影子寄存器；读操作返回当前计数器值、捕获值或中断状态。APB 接口下游连接全局控制模块，负责解析 `PWM_CTRL` 中的全局使能、计数模式选择以及各通道独立使能信号。全局控制模块输出一组分发到 4 个通道的公共时基信号 `pwm_clk`，该时钟由 PCLK 经可编程预分频器分频得到，公式为 `pwm_clk = PCLK / (PRESCALER + 1)`，其中 PRESCALER 为 8-bit 无符号数，分频范围 1~256。

每个通道内部包含独立的计时单元，由预分频后时钟驱动 16-bit 计数器，计数器值与两个比较寄存器（CMP_A / CMP_B）实时比较，比较结果送入波形合成逻辑生成原始 PWM 信号。原始信号随后经过死区插入模块（Dead-Time Insertion），在互补输出对 PWMx_A 与 PWMx_B 的翻转边沿插入可编程延迟，防止 H 桥等功率拓扑中的上下桥臂直通短路。死区模块之后为极性控制与输出使能门控，最终驱动至 SoC 引脚。所有通道共享一组中断汇集逻辑，将周期匹配、比较匹配及捕获事件汇聚为单一中断请求线 `pwm_irq`，送至系统中断控制器。

顶层数据流如下框图所示：

```
                     ┌─────────────────────────────────────────────────────────────┐
                     │                 PWM Controller (4-Channel)                 │
                     │                 APB Slave Interface, PCLK                    │
  ┌──────────────────┼─────────────────────────────────────────────────────────────┼──────────────────┐
  │                  │                                                             │                  │
  │   APB Bus        │    ┌─────────────┐    ┌─────────────┐                    │                  │
  │  (PCLK/PSLV)     │    │  PWM_CTRL   │    │PWM_PRESCALER│                    │                  │
  │      │           │    │(Global Ctrl)│    │(8-bit Div)  │                    │                  │
  │      ▼           │    └──────┬──────┘    └──────┬──────┘                    │                  │
  │ ┌─────────┐      │◄──────────┘                    │                          │                  │
  │ │APB Slave│      │    ┌───────────────────────────┴────────────────────────┐  │                  │
  │ │Interface│      │    │           Clock Generator / Timebase              │  │                  │
  │ └─────────┘      │    │   PCLK ──► [Prescaler] ──► pwm_clk ──────────────►  │  │                  │
  │                  │    └────────────────────────┬─────────────────────────────┘  │                  │
  │                  │                             │                                │                  │
  │                  │    ┌────────────────────────┴─────────────────────────────┐   │                  │
  │                  │    │              Channel 0  Waveform Generation         │   │                  │
  │                  │    │  ┌─────────┐  ┌─────────┐  ┌─────────┐             │   │                  │
  │                  │    │  │PERIOD   │  │ CMP_A   │  │ CMP_B   │             │   │                  │
  │                  │    │  │(16-bit) │  │(16-bit) │  │(16-bit) │             │   │                  │
  │                  │    │  └────┬────┘  └────┬────┘  └────┬────┘             │   │                  │
  │                  │    │       └────────────┼────────────┘                   │   │                  │
  │                  │    │  ┌─────────────────┴─────────────────┐             │   │                  │
  │                  │    │  │   16-bit Counter + 2x Comparator  │             │   │                  │
  │                  │    │  │   (Up/Down/Center-aligned)        │             │   │                  │
  │                  │    │  └─────────────┬─────────────────────┘             │   │                  │
  │                  │    │                │                                   │   │                  │
  │                  │    │         ┌──────┴──────┐                            │   │                  │
  │                  │    │         │ Dead-Time   │                            │   │                  │
  │                  │    │         │ Insertion   │                            │   │                  │
  │                  │    │         │(DT reg)     │                            │   │                  │
  │                  │    │         └───┬────┬────┘                            │   │                  │
  │                  │    │            PWM0_A  PWM0_B                          │   │                  │
  │                  │    └────────────┼────────┼────────────────────────────────┘   │                  │
  │                  │                 │        │                                 │                  │
  │                  │    ┌────────────┴────────┴──────────────────────────────┐   │                  │
  │                  │    │         Polarity Control / Output Enable            │   │                  │
  │                  │    │   (per-channel polarity inversion & gate)           │   │                  │
  │                  │    └────────────────────┬───────────────────────────────┘   │                  │
  │                  │                         │                                    │                  │
  │                  │    ╔════════════════════╧════════════════════╗                │                  │
  │                  │    ║  Channel 1..3 (identical structure)   ║                │                  │
  │                  │    ╚════════════════════╤════════════════════╝                │                  │
  │                  │                         │                                    │                  │
  │                  │    ┌────────────────────┴────────────────────────────────┐   │                  │
  │                  │    │           Interrupt Aggregation Unit                 │   │                  │
  │                  │    │  ┌─────────┐  ┌─────────┐  ┌─────────┐             │   │                  │
  │                  │    │  │ Period  │  │ Compare │  │ Capture │             │   │                  │
  │                  │    │  │ Match   │  │ Match   │  │ Event   │             │   │                  │
  │                  │    │  └────┬────┘  └────┬────┘  └────┬────┘             │   │                  │
  │                  │    │       └───────────┴───────────┘                     │   │                  │
  │                  │    │                   │                                 │   │                  │
  │                  │    │            PWM_INT_STS ──► pwm_irq ──► GIC/PLIC    │   │                  │
  │                  │    └───────────────────┼─────────────────────────────────┘   │                  │
  └──────────────────┼────────────────────────┼─────────────────────────────────────┼──────────────────┘
                     │                        │                                     │
                     ▼                        ▼                                     ▼
                PWM0_A..PWM3_A          PWM0_B..PWM3_B                           pwm_irq
               (Primary Outputs)     (Complementary Outputs)
```

#### 7.1.2 单通道计时单元内部结构

单个通道的计时单元由三级级联逻辑构成。第一级为 8-bit 预分频器，接收全局 `pwm_clk` 并可在此基础上再做二次分频，使每个通道拥有独立的计数时钟频率。第二级为 16-bit 增/减计数器，支持向上、向下及中心对齐三种计数模式，计数方向由全局模式选择位与通道独立模式选择位共同决定。第三级为双路比较器，分别将当前计数值 `CNT` 与 `CMP_A`、`CMP_B` 比较；当 `CNT == CMP_A` 时置位通道 A 输出，当 `CNT == CMP_B`（或计数器溢出/下溢）时复位通道 A 输出。通道 B 的比较逻辑与通道 A 对称，但输出极性可独立配置。比较结果送入 PWM 波形生成逻辑，根据计数模式产生边沿对齐或中心对齐波形。波形生成逻辑下游连接死区发生器：当检测到 PWM_A 或 PWM_B 任意一路发生翻转时，死区计时器启动，在固定数量的 `pwm_clk` 周期内强制两路输出同时为无效电平，从而实现死区保护。

### 7.2 工作原理

#### 7.2.1 三种计数模式

PWM 模块支持向上计数、向下计数与中心对齐三种计数模式，其波形特征与应用场景存在显著差异。

**向上计数（边沿对齐）**模式下，计数器从 0 递增到 `PERIOD`，随后复位至 0 并重新开始。输出信号在 `CNT < CMP` 期间维持有效电平，在 `CNT >= CMP` 时翻转。该模式产生的 PWM 波形所有通道的周期起始边沿对齐于计数器复位时刻，适用于对相位关系有严格要求的多通道同步场景，如多相 Buck 变换器。占空比计算公式为 `Duty = CMP / (PERIOD + 1)`。

**向下计数**模式与向上计数对称，计数器从 `PERIOD` 递减至 0 后重新加载。输出逻辑同样为 `CNT < CMP` 时有效，但波形边沿在周期末尾对齐。该模式在特定电机控制算法中与向上计数配合使用，以产生互补的非对称波形。

**中心对齐（对称 PWM）**模式下，计数器先从 0 向上计数至 `PERIOD`，再从 `PERIOD` 向下计数至 0，形成三角波时基。输出在向上计数阶段于 `CNT == CMP` 时翻转，在向下计数阶段再次于 `CNT == CMP` 时翻转。中心对齐波形的优势在于任一开关周期内仅发生一次有效翻转，且谐波能量集中在两倍开关频率处，易于滤波，因而广泛应用于无刷直流电机（BLDC）与永磁同步电机（PMSM）的矢量控制。

#### 7.2.2 PWM 波形生成

波形生成的核心逻辑为比较器输出与计数器状态的组合。以向上计数模式为例，假设 `PERIOD = 999`、`CMP_A = 300`，则计数器在每个 `pwm_clk` 周期从 0 递增。当 `CNT` 达到 300 时，比较器 A 输出匹配脉冲，波形生成逻辑将 PWM_A 置为无效电平；当 `CNT` 达到 999 并复位为 0 时，PWM_A 恢复为有效电平。由此产生高电平宽度为 300 个时钟周期、周期为 1000 个时钟周期的 PWM 波形，占空比为 30%。

中心对齐模式下，比较匹配发生在计数器的上升段与下降段各一次。若 `CMP_A = 300`、`PERIOD = 999`，则向上计数至 300 时 PWM_A 翻转一次，继续计数至 999 后向下计数，再次经过 300 时 PWM_A 翻转第二次。该模式下占空比公式为 `Duty = CMP / PERIOD`。为支持 100% 占空比输出，比较器逻辑在 `CMP >= PERIOD` 时强制输出持续有效电平；0% 占空比则通过 `CMP = 0` 实现。

#### 7.2.3 死区插入与互补输出

在驱动 H 桥、半桥或三相逆变器的功率 MOSFET/IGBT 时，互补输出的两路信号 PWMx_A 与 PWMx_B 分别控制上桥臂与下桥臂。由于功率器件的关断延迟（`t_off`）通常大于开通延迟（`t_on`），若两路信号互补翻转时无任何延时，将出现上下桥臂同时导通的直通现象，导致电源短路。死区插入模块通过在任一信号翻转后插入固定延时来解决该问题。

死区时间 `T_dead` 由 `PWM_CHx_DEADTIME` 寄存器配置，单位为 `pwm_clk` 周期数。以通道 0 为例，当 PWM0_A 由低变高时，死区发生器先拉低 PWM0_B 并维持 `T_dead` 个时钟周期，再将 PWM0_A 置高；反向翻转时同理。死区时间的工程取值需大于功率器件最坏情况下的 `t_off - t_on` 差值并保留安全裕量，典型范围为 0.5~5 μs。若 `PWM_CHx_DEADTIME = 0`，死区插入被旁路，两路信号严格互补。

#### 7.2.4 输入捕获模式

除波形输出外，每个 PWM 通道可配置为输入捕获模式，用于测量外部数字信号的频率、周期或脉冲宽度。捕获模式下，对应通道的引脚由输出方向切换为输入方向，内部计数器在捕获使能后自由运行。外部信号边沿（上升沿、下降沿或双边沿，由 `PWM_CAP_CTRL` 配置）触发计数器值锁存至捕获寄存器 `PWM_CAP_VAL`。

频率测量场景下，软件在两次连续上升沿捕获之间读取 `PWM_CAP_VAL` 的差值 `ΔT`，结合 `pwm_clk` 频率 `f_clk` 计算被测频率 `f_in = f_clk / ΔT`。脉宽测量场景下，上升沿触发计数器复位，下降沿触发锁存，锁存值直接对应高电平宽度。捕获逻辑内部集成 4 级可编程滤波器，用于抑制输入信号上的窄脉冲毛刺；滤波宽度配置为 `2^N` 个 `pwm_clk` 周期，`N` 取值 0~15。当捕获事件发生时，对应通道的捕获中断标志置位，若 `PWM_INT_EN` 中相应位已使能，则向中断控制器发送 `pwm_irq`。

### 7.3 软件可见寄存器

PWM 控制器所有寄存器均通过 32-bit APB 访问，地址空间以通道 0 基址为原点按 16-byte 步进组织。通道 0 寄存器区占 `0x20~0x2F`，通道 1~3 分别在 `0x30~0x3F`、`0x40~0x4F`、`0x50~0x5F` 镜像相同寄存器布局。下表仅列出通道 0 的偏移地址，通道 n 的基址为 `0x20 + n × 0x10`。

**表 1：全局与通道配置/数据寄存器**

| 偏移地址 | 寄存器名 | 位域 | 属性 | 复位值 | 功能描述 |
|:--------:|:---------|:-----|:----:|:------:|:---------|
| 0x00 | `PWM_CTRL` | [0] `GLOBAL_EN` | R/W | 0x0 | 模块全局使能。0=禁用所有通道时钟并复位计数器；1=使能。 |
| | | [3:1] `MODE` | R/W | 0x0 | 全局计数模式：000=向上计数，001=向下计数，010=中心对齐，其余保留。 |
| | | [7:4] `CH_EN` | R/W | 0x0 | 通道使能位，bit[n]=1 使能通道 n 输出/捕获。 |
| | | [8] `CAPTURE_EN` | R/W | 0x0 | 全局捕获模式使能，置位时通道使能位控制捕获而非输出。 |
| | | [31:9] — | RO | 0x0 | 保留，读返回 0。 |
| 0x04 | `PWM_PRESCALER` | [7:0] `PRESCALE` | R/W | 0x0 | 时钟预分频值。计数器时钟 `pwm_clk = PCLK / (PRESCALE + 1)`，范围 1~256。 |
| | | [31:8] — | RO | 0x0 | 保留。 |
| 0x08 | `PWM_SYNC_UPDATE` | [0] `UPDATE` | WO | — | 影子寄存器同步更新触发。写 1 将 `PERIOD`/`CMP_A`/`CMP_B` 影子寄存器原子加载至活跃寄存器，硬件自清零。 |
| 0x0C | `PWM_DEADTIME_GLOBAL` | [7:0] `DT_GLOBAL` | R/W | 0x0 | 全局死区时间默认值（时钟周期数），通道未配置独立死区时采用此值。 |
| 0x20 | `PWM_CH0_CTRL` | [0] `CH_EN` | R/W | 0x0 | 通道 0 独立使能，可覆盖全局 `CH_EN[0]`。 |
| | | [1] `POL_A` | R/W | 0x0 | 通道 A 输出极性：0=正极性（高有效），1=负极性（低有效）。 |
| | | [2] `POL_B` | R/W | 0x0 | 通道 B 输出极性，编码同 `POL_A`。 |
| | | [3] `DT_EN` | R/W | 0x0 | 死区插入使能：1=在 A/B 互补输出间插入死区。 |
| | | [6:4] `CH_MODE` | R/W | 0x0 | 通道独立模式：000=遵循全局模式，001=向上，010=向下，011=中心对齐。 |
| | | [15:7] — | RO | 0x0 | 保留。 |
| 0x24 | `PWM_CH0_PERIOD` | [15:0] `PERIOD` | R/W | 0x0 | 通道 0 计数周期值。向上/向下模式范围为 1~65535；中心对齐模式下最大有效值为 32767。 |
| | | [31:16] — | RO | 0x0 | 保留。 |
| 0x28 | `PWM_CH0_CMP_A` | [15:0] `CMP_A` | R/W | 0x0 | 通道 A 比较值。向上计数时，CNT < CMP_A 输出有效；中心对齐时双边翻转。 |
| | | [31:16] — | RO | 0x0 | 保留。 |
| 0x2C | `PWM_CH0_CMP_B` | [15:0] `CMP_B` | R/W | 0x0 | 通道 B 比较值，用于互补输出或独立双 PWM 输出。 |
| | | [31:16] — | RO | 0x0 | 保留。 |
| 0x30 | `PWM_CH0_DEADTIME` | [7:0] `DT` | R/W | 0x0 | 通道 0 独立死区时间（时钟周期数），`DT_EN=1` 时覆盖全局默认值。最大 255 个 `pwm_clk` 周期。 |
| | | [31:8] — | RO | 0x0 | 保留。 |

**表 2：状态与中断寄存器**

| 偏移地址 | 寄存器名 | 位域 | 属性 | 复位值 | 功能描述 |
|:--------:|:---------|:-----|:----:|:------:|:---------|
| 0x10 | `PWM_INT_EN` | [0] `PERIOD0_EN` | R/W | 0x0 | 通道 0 周期匹配中断使能。计数器溢出/下溢时触发。 |
| | | [1] `CMPA0_EN` | R/W | 0x0 | 通道 0 比较 A 匹配中断使能。 |
| | | [2] `CMPB0_EN` | R/W | 0x0 | 通道 0 比较 B 匹配中断使能。 |
| | | [3] `CAP0_EN` | R/W | 0x0 | 通道 0 捕获事件中断使能。 |
| | | [7:4] `CH1_INT_EN` | R/W | 0x0 | 通道 1 中断使能位，编码同通道 0（PERIOD/CMPA/CMPB/CAP）。 |
| | | [11:8] `CH2_INT_EN` | R/W | 0x0 | 通道 2 中断使能位。 |
| | | [15:12] `CH3_INT_EN` | R/W | 0x0 | 通道 3 中断使能位。 |
| | | [31:16] — | RO | 0x0 | 保留。 |
| 0x14 | `PWM_INT_STS` | [15:0] `INT_STS` | R/W1C | 0x0 | 中断状态寄存器，每 4-bit 对应一个通道（PERIOD/CMPA/CMPB/CAP）。对应位读 1 表示事件已发生；写 1 清除。 |
| | | [31:16] — | RO | 0x0 | 保留。 |
| 0x18 | `PWM_CAP_CTRL` | [1:0] `CAP_EDGE` | R/W | 0x0 | 捕获边沿选择：00=上升沿，01=下降沿，10=双边沿，11=保留。 |
| | | [3:2] `CAP_CH` | R/W | 0x0 | 捕获通道选择：0~3 分别对应 PWM 通道 0~3 的输入引脚。 |
| | | [7:4] `FILTER` | R/W | 0x0 | 输入滤波配置。滤波宽度 = `2^FILTER` 个 `pwm_clk` 周期，FILTER=0 时滤波器旁路。 |
| | | [31:8] — | RO | 0x0 | 保留。 |
| 0x1C | `PWM_CAP_VAL` | [15:0] `CAP_VAL1` | RO | 0x0 | 捕获值 1。上升沿触发时锁存的计数器值；双边沿模式下为先触发边沿的值。 |
| | | [31:16] `CAP_VAL2` | RO | 0x0 | 捕获值 2。下降沿触发时锁存的计数器值；双边沿模式下为后触发边沿的值。 |
| 0x34 | `PWM_CH0_STATUS` | [15:0] `CNT_VAL` | RO | 0x0 | 通道 0 当前 16-bit 计数器值实时镜像。 |
| | | [31:16] — | RO | 0x0 | 保留。 |

中断架构采用事件源汇集设计：16 个中断源（4 通道 × 4 事件类型）在 `PWM_INT_STS` 中各占有独立标志位，经 `PWM_INT_EN` 屏蔽后通过或门汇聚为单根 `pwm_irq` 信号线。软件在中断服务程序中读取 `PWM_INT_STS` 即可定位具体通道与事件类型，随后写 1 清除已处理标志。`PWM_CHx_STATUS` 寄存器仅反映当前计数器值，不携带中断标志，其设计目的是支持调试时实时观察计数器运行状态，以及捕获模式下辅助计算脉宽差值。


---

## 8. IR TX/RX — 红外发射/接收控制器

### 8.1 内部架构与框图

红外发射/接收控制器（Infrared Transmitter/Receiver Controller）是 SoC 中负责短距离红外遥控通信的专用数字外设，通过 APB 总线挂载于外设时钟域。该 IP 内部划分为 TX 发射通路和 RX 接收通路两条独立链路，共享 APB 寄存器接口但使用独立的 FIFO 和中断线路，从而允许 CPU 在同一时刻执行发送调度与接收解析。

#### 8.1.1 IR TX 模块框图

IR TX 模块接收软件写入的地址与命令数据，按照选定协议编码后叠加 38 kHz 载波，最终输出脉宽调制（Pulse-Distance Modulation）信号驱动片外红外发光二极管（IR LED）。其内部数据流自左向右依次为：APB Slave 接口接收寄存器访问请求，将配置参数写入控制与载波寄存器，将待发数据推入 TX FIFO；FIFO 以 32-bit 字宽缓冲若干帧待发数据，协议编码器根据 `IR_TX_CTRL` 中配置的协议类型（NEC / RC5 / Sony）取出 FIFO 顶帧，展开为引导码（Leader）、地址域、命令域及校验域的时序脉冲序列；调制逻辑将编码后的基带脉冲与载波发生器输出的高频方波进行逻辑与运算，产生实际驱动 IR LED 的调制波形。载波发生器由可编程分频器构成，对 PCLK 分频得到 36–40 kHz 范围内的目标载波频率，并支持占空比调节（典型值 1/3）。输出驱动级为单端 CMOS 推挽缓冲，可直接驱动 IR LED 串联限流电阻回路，亦可输出至片外驱动晶体管。

```
                              ┌──────────────────────────────────────────────┐
                              │              IR Transmitter (TX)             │
                              │                                              │
  ┌───────────────────────────┼──────────────────────────────────────────────┼───────────────────────────┐
  │                           │                                              │                           │
  │      APB Bus              │    ┌─────────────┐     ┌─────────────────┐   │                           │
  │     (PCLK/PSLV)           │    │ IR_TX_CTRL  │     │ IR_TX_CARRIER   │   │                           │
  │         │                 │    │(Enable/Proto│     │(Divider/Duty   │   │                           │
  │         ▼                 │    │-col/Modul.) │     │    Control)     │   │                           │
  │   ┌──────────┐            │    └──────┬──────┘     └────────┬────────┘   │                           │
  │   │APB Slave │◄──────────►│◄──────────┘                   │            │                           │
  │   │Interface │            │    ┌───────────────────────────┴────────────┐ │                           │
  │   └──────────┘            │    │         Carrier Generator              │ │                           │
  │                           │    │                                      │ │                           │
  │                           │    │   PCLK ──► [Divider] ──► carrier_clk │ │                           │
  │                           │    │                (~38kHz, duty=1/3)    │ │                           │
  │                           │    │                    │                 │ │                           │
  │                           │    └────────────────────┼───────────────────┘ │                           │
  │                           │                         │                   │                           │
  │                           │    ┌────────────────────┴────────────────────┐│                           │
  │                           │    │         Protocol Encoder              ││                           │
  │                           │    │  ┌──────────┐    ┌──────────┐        ││                           │
  │                           │    │  │   NEC    │    │   RC5    │        ││                           │
  │                           │    │  │ Encoder  │    │ Manchester│        ││                           │
  │                           │    │  │          │    │ Encoder  │        ││                           │
  │                           │    │  └────┬─────┘    └────┬─────┘        ││                           │
  │                           │    │       └───────────────┘                ││                           │
  │                           │    │              │                         ││                           │
  │                           │    │         ┌────┴────┐                    ││                           │
  │                           │    │         │  MUX    │◄── Sony Encoder  ││                           │
  │                           │    │         └───┬─────┘                    ││                           │
  │                           │    └───────────────┼───────────────────────┘│                           │
  │                           │                    │                        │                           │
  │                           │    ┌───────────────┴────────────────────────┐│                           │
  │                           │    │         Modulation Logic              ││                           │
  │                           │    │                                      ││                           │
  │                           │    │   baseband_pulse ◄──► [AND Gate]    ││                           │
  │                           │    │          │              ▲            ││                           │
  │                           │    │          └──────────────┘ (carrier_clk)││                           │
  │                           │    │                    │                 ││                           │
  │                           │    │   ┌──────────────┴─────────────────┐ ││                           │
  │                           │    │   │      TX FIFO (16x32)           │ ││                           │
  │                           │    │   │  ┌────────┐   ┌────────┐       │ ││                           │
  │                           │    │   │  │ ADDR   │   │ CMD    │◄─────┼─┼┼───────────────────────────┤
  │                           │    │   │  │ 8/16b  │   │ 8b     │      │ ││                           │
  │                           │    │   │  └────────┘   └────────┘       │ ││                           │
  │                           │    │   └──────────────┬─────────────────┘ ││                           │
  │                           │    └──────────────────┼──────────────────┘│                           │
  │                           │                       │                   │                           │
  │                           │    ┌──────────────────┴──────────────────┐│                           │
  │                           │    │         Output Driver               ││                           │
  │                           │    │         (Pad / IR LED)              ││                           │
  │                           │    └───────────────┬───────────────────┘│                           │
  └───────────────────────────┼────────────────────┼───────────────────┼───────────────────────────┘
                              │                    │                   │
                              ▼                    ▼                   ▼
                           reg_access        ir_tx_pwm_out         ir_tx_int
```

#### 8.1.2 IR RX 模块框图

IR RX 模块完成与 TX 相反的物理层恢复过程。片外红外接收模块（如 TSOP1838 或集成于封装内的模拟前端）首先将入射的 38 kHz 调制光信号转换为数字基带方波，该方波经输入引脚进入数字接收通路。数字前端包含可编程毛刺滤波器（Glitch Filter），其阈值由 `IR_RX_PW_CFG` 寄存器配置，用于抑制窄于 50 µs 的噪声脉冲。滤波后信号送入边沿检测逻辑，在上升沿与下降沿分别捕获高精度计时器（通常运行于 1 MHz 采样时钟域）的当前值，得到相邻边沿之间的时间间隔——即脉冲宽度或空闲宽度。脉宽测量结果送入协议解码器，解码器内部并行实例化 NEC、RC5、Sony 三套状态机，根据 `IR_RX_CTRL` 中的协议选择信号激活对应分支，将脉宽序列翻译为地址、命令及重复标志。解码后的完整帧推入 RX FIFO，CPU 通过轮询或中断方式读取 `IR_RX_DATA` 寄存器获得数据。若 FIFO 写满后仍收到新帧，则置位溢出标志（OVERRUN）；若脉宽序列无法与任何协议时序窗口匹配，则置位帧错误标志（FRAMING_ERR）。

```
                              ┌──────────────────────────────────────────────┐
                              │              IR Receiver (RX)                │
                              │                                              │
  ┌───────────────────────────┼──────────────────────────────────────────────┼───────────────────────────┐
  │                           │                                              │                           │
  │      APB Bus              │    ┌─────────────┐     ┌─────────────────┐   │                           │
  │     (PCLK/PSLV)           │    │ IR_RX_CTRL  │     │ IR_RX_PW_CFG    │   │                           │
  │         │                 │    │(Enable/Proto│     │(Glitch Thresh/ │   │                           │
  │         ▼                 │    │-col Select) │     │  Window Config) │   │                           │
  │   ┌──────────┐            │    └──────┬──────┘     └────────┬────────┘   │                           │
  │   │APB Slave │◄──────────►│◄──────────┘                     │            │                           │
  │   │Interface │            │                                 │            │                           │
  │   └──────────┘            │                                 │            │                           │
  │                           │                                 ▼            │                           │
  │                           │    ┌────────────────────────────────────┐   │                           │
  │                           │    │   Analog Front-End / Demodulator   │   │                           │
  │                           │    │  (TSOP1838 or Integrated AFE)      │   │                           │
  │                           │    │                                    │   │                           │
  │                           │    │  IR Input ──► [BPF ~38kHz] ──►    │   │                           │
  │                           │    │  [AGC] ──► [Demod] ──► demod_out  │   │                           │
  │                           │    │                                    │   │                           │
  │                           │    └───────────────┬────────────────────┘   │                           │
  │                           │                    │                        │                           │
  │                           │    ┌───────────────┴────────────────────────┐│                           │
  │                           │    │      Input Filter & Edge Detector     ││                           │
  │                           │    │  demod_out ──► [Glitch Filter]       ││                           │
  │                           │    │       │                                ││                           │
  │                           │    │       ▼                                ││                           │
  │                           │    │  [Rise/Fall Edge Detect] ──► edges    ││                           │
  │                           │    └───────────────┬────────────────────────┘│                           │
  │                           │                    │                        │                           │
  │                           │    ┌───────────────┴────────────────────────┐│                           │
  │                           │    │      Pulse Width Measurement Timer    ││                           │
  │                           │    │  ┌──────────┐   ┌──────────┐           ││                           │
  │                           │    │  │ Counter│   │ Capture  │           ││                           │
  │                           │    │  │(1MHz)  │   │ Register │◄── edges ││                           │
  │                           │    │  └───┬─────┘   └────┬─────┘           ││                           │
  │                           │    │      │              │                   ││                           │
  │                           │    │      └──────────────┘ (high/lo width)   ││                           │
  │                           │    └───────────────┬────────────────────────┘│                           │
  │                           │                    │                        │                           │
  │                           │    ┌───────────────┴────────────────────────┐│                           │
  │                           │    │         Protocol Decoder              ││                           │
  │                           │    │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ││                           │
  │                           │    │  │  NEC    │ │  RC5    │ │  Sony   │ ││                           │
  │                           │    │  │ Decoder │ │Manch.   │ │ SIRCS   │ ││                           │
  │                           │    │  │(Leader+ │ │Decoder  │ │Decoder │ ││                           │
  │                           │    │  │Addr+Cmd)│ │(Toggle+│ │(12/15/ │ ││                           │
  │                           │    │  │         │ │Addr+Cmd)│ │ 20bit)  │ ││                           │
  │                           │    │  └───┬─────┘ └────┬────┘ └───┬─────┘ ││                           │
  │                           │    │      └───────────┴───────────┘       ││                           │
  │                           │    │                 │                      ││                           │
  │                           │    │            ┌────┴────┐                 ││                           │
  │                           │    │            │   MUX   │                 ││                           │
  │                           │    │            └───┬─────┘                 ││                           │
  │                           │    └───────────────┼───────────────────────┘│                           │
  │                           │                    │                        │                           │
  │                           │    ┌───────────────┴────────────────────────┐│                           │
  │                           │    │         RX FIFO (8x32)                ││                           │
  │                           │    │  ┌────────┐ ┌────────┐ ┌────────┐   ││                           │
  │                           │    │  │Addr    │ │Cmd     │ │Repeat  │   ││                           │
  │                           │    │  │Field   │ │Field   │ │Flag    │   ││                           │
  │                           │    │  └────────┘ └────────┘ └────────┘   ││                           │
  │                           │    │              │                        ││                           │
  │                           │    │         IR_RX_DATA ◄───┘            ││                           │
  │                           │    └───────────────┬────────────────────────┘│                           │
  │                           │                    │                        │                           │
  │                           │    ┌───────────────┴────────────────────────┐│                           │
  │                           │    │      RX Status & Interrupt Control      ││                           │
  │                           │    │  ┌─────────┐ ┌─────────┐ ┌─────────┐  ││                           │
  │                           │    │  │RECEIVED │ │OVERRUN  │ │FRAMING  │  ││                           │
  │                           │    │  │  Flag   │ │  Flag   │ │  ERR    │  ││                           │
  │                           │    │  └─────────┘ └─────────┘ └─────────┘  ││                           │
  │                           │    └───────────────┬────────────────────────┘│                           │
  └───────────────────────────┼────────────────────┼────────────────────────┼───────────────────────────┘
                              │                    │                        │
                              ▼                    ▼                        ▼
                           reg_access         ir_rx_data               ir_rx_int
```

### 8.2 工作原理

#### 8.2.1 IR TX 发送流程

发送通路的启动由软件对 `IR_TX_CTRL` 的写操作触发。软件首先配置协议类型（`PROTO_SEL` 字段）、载波分频系数（写入 `IR_TX_CARRIER`）以及调制使能位，随后将目标地址和命令写入 `IR_TX_DATA` 寄存器。写操作自动将数据推入 TX FIFO。当 `TX_EN` 置位且 FIFO 非空时，TX 状态机退出 IDLE 状态并弹出 FIFO 顶帧。

协议编码器依据 `PROTO_SEL` 对弹出的帧展开时序编码。以 NEC 协议为例，编码器依次输出：9 ms 载波突发（占空比 1/3 的 38 kHz 方波）、4.5 ms 空闲间隔、32 bit 数据位流。每 bit 的编码遵循脉冲距离调制规则：先发送 0.56 ms 的载波突发作为固定头部，随后若该 bit 为逻辑 1 则空闲 1.69 ms，若为逻辑 0 则空闲 0.56 ms。32 bit 数据由 8 bit 地址、8 bit 地址反码、8 bit 命令、8 bit 命令反码拼接而成，这种冗余结构允许接收端在解码时进行单 bit 错误检测。若软件使能重复码（`REPEAT_EN`），状态机在首帧结束后按 `IR_TX_REPEAT` 配置的间隔（典型 110 ms）自动插入 NEC 重复帧——重复帧仅包含 9 ms 引导突发与 2.25 ms 空闲，省略完整数据域，从而降低总线占用并标识长按键事件。

编码后的基带信号进入调制逻辑，与载波时钟执行按位逻辑与运算：基带高电平期间输出 38 kHz 方波，基带低电平期间输出恒定低电平。最终调制波形经 Pad 驱动至片外 IR LED，完成电-光转换。

#### 8.2.2 IR RX 接收流程

接收通路的输入为片外红外接收模块解调后的数字基带信号 `demod_out`。该信号首先经过可编程毛刺滤波器：计时器对输入电平持续采样，仅当同一电平维持超过 `GLITCH_THR` 配置的时间阈值（单位 µs）时才视为有效边沿，从而抑制电源噪声与机械振动产生的亚微秒级尖峰。

边沿检测逻辑在确认后的上升沿和下降沿分别锁存高精度计数器值，两次锁存值的差即为脉冲宽度（高电平持续时间）或空闲宽度（低电平持续时间）。这些宽度值送入协议解码器进行匹配。以 NEC 解码器为例，其内部状态机按以下顺序验证：检测 9 ms ± 10% 的引导脉冲，确认后检测后续 4.5 ms ± 10% 的空闲间隔；引导头匹配成功后，进入数据位解析状态，对每个数据位测量其总时长（2.25 ms 对应逻辑 1，1.12 ms 对应逻辑 0）；全部 32 bit 接收完毕后，检查地址域与地址反码、命令域与命令反码是否按位互补，验证通过则将地址和命令写入 RX FIFO，并置位 `RECEIVED` 标志与可选的中断请求。

对于 RC5 协议，解码器采用曼彻斯特解码策略：每个 bit 周期固定为 1.778 ms，解码器在周期中点采样电平——若前半周期为空闲、后半周期为载波，则判定为逻辑 1；反之为逻辑 0。RC5 帧包含 2 bit 起始位（固定为 1）、1 bit 翻转位（Toggle，每次按键取反）、5 bit 地址和 6 bit 命令，总计 14 bit。Sony SIRCS 协议则采用脉冲宽度编码，解码器直接测量载波突发持续时间：2.4 ms 为起始位，1.2 ms 为逻辑 1，0.6 ms 为逻辑 0，各 bit 间由固定 0.6 ms 空闲分隔。

#### 8.2.3 协议支持参数与时序差异

控制器硬件实例化三套独立的状态机解码路径，覆盖消费电子产品中最广泛使用的三种红外遥控协议。下表给出三种协议在载波频率、编码方式、帧结构与时序容差方面的核心差异。

| 协议 | 载波频率 | 占空比 | 编码方式 | 引导码 | 数据位宽 | 单帧时长 | 重复码机制 |
|------|---------|--------|---------|--------|---------|---------|-----------|
| **NEC** | 38 kHz | 1/3 | 脉冲距离（Pulse-Distance） | 9 ms 载波 + 4.5 ms 空闲 | 32 bit（8 地址 + 8 地址反码 + 8 命令 + 8 命令反码） | ~67.5 ms | 9 ms 载波 + 2.25 ms 空闲 + 0.56 ms 终止突发，间隔 ~110 ms |
| **RC5** | 36 kHz | ~25–33% | 曼彻斯特（Manchester） | 2 起始位（S1=S2=1） | 14 bit（1 Toggle + 5 地址 + 6 命令） | ~24.9 ms | 无专用重复帧，全帧以 ~114 ms 间隔重发 |
| **Sony SIRCS** | 40 kHz | 1/3 | 脉冲宽度（Pulse-Width） | 2.4 ms 起始突发 | 12/15/20 bit（7 命令 + 5/8/13 地址） | ~25–45 ms | 无专用重复码，按键持续期间全帧重发 |

硬件解码器对关键时序参数均保留 ±10% 的容差窗口，以兼容不同厂商遥控器的晶振偏差与温漂。例如 NEC 引导码的 9 ms 脉冲在硬件中被判定为 8.1–9.9 ms，4.5 ms 空闲被判定为 4.05–4.95 ms。对于 NEC Extended 变体，控制器通过检测地址域与地址反码不呈严格按位互补关系来识别 16 bit 扩展地址模式，此时反码字节的语义转换为扩展地址低 8 bit。

### 8.3 软件可见寄存器

IR TX/RX 控制器通过 APB 寄存器映射向软件暴露全部配置与状态接口。寄存器空间按功能划分为 TX 寄存器组（偏移 0x00–0x1C）、RX 寄存器组（偏移 0x20–0x40）以及共享中断寄存器组（偏移 0x50–0x54）。所有寄存器位宽为 32 bit，复位值为 0x0000_0000 除非另有说明。

#### 8.3.1 IR TX 寄存器组

| 偏移地址 | 寄存器名 | 位域 | 读写属性 | 复位值 | 功能描述 |
|---------|---------|------|---------|--------|---------|
| 0x00 | `IR_TX_CTRL` | [0] `TX_EN` | R/W | 0 | 发送通路使能：1 = 启动 TX 状态机；0 = 停止并复位发送逻辑 |
| | | [3:1] `PROTO_SEL` | R/W | 0 | 协议选择：000 = NEC，001 = RC5，010 = Sony 12-bit，011 = Sony 15-bit，100 = Sony 20-bit，101–111 = 保留 |
| | | [4] `MOD_EN` | R/W | 0 | 载波调制使能：1 = 输出 38 kHz 调制波形；0 = 输出基带脉冲（调试模式） |
| | | [5] `REPEAT_EN` | R/W | 0 | 重复码自动发送使能：1 = 首帧结束后按 `IR_TX_REPEAT` 配置自动插入重复帧 |
| | | [6] `FIFO_RST` | WO | 0 | FIFO 复位：写 1 清空 TX FIFO，硬件自动清零 |
| | | [31:7] — | RO | 0 | 保留，读返回 0 |
| 0x04 | `IR_TX_CARRIER` | [15:0] `CARRIER_DIV` | R/W | 0 | 载波分频系数：载波频率 = PCLK / (`CARRIER_DIV` × 2)。当 PCLK = 48 MHz 时，`CARRIER_DIV` = 632 产生约 37.97 kHz |
| | | [23:16] `DUTY_THR` | R/W | 0 | 占空比阈值：载波周期内高电平持续计数 = `DUTY_THR`，低电平持续计数 = `CARRIER_DIV` − `DUTY_THR`。典型配置 `DUTY_THR` = `CARRIER_DIV` / 3 实现 1/3 占空比 |
| | | [31:24] — | RO | 0 | 保留 |
| 0x08 | `IR_TX_DATA` | [7:0] `ADDR` | WO | 0 | 发送地址域，写入时自动推入 TX FIFO |
| | | [15:8] `CMD` | WO | 0 | 发送命令域，写入时自动推入 TX FIFO |
| | | [16] `EXT` | WO | 0 | NEC 扩展位：1 = 使用 16-bit 扩展地址模式（此时 `ADDR` 为低 8 bit） |
| | | [31:17] — | RO | 0 | 保留 |
| 0x0C | `IR_TX_STATUS` | [0] `BUSY` | RO | 0 | 发送忙标志：1 = 状态机正在输出帧；0 = IDLE 或 FIFO 空 |
| | | [1] `DONE` | RO | 0 | 发送完成标志：1 = 当前帧已完整输出，写 `IR_TX_DATA` 或读本寄存器自动清零 |
| | | [2] `FIFO_UNDERRUN` | R/W1C | 0 | FIFO 下溢标志：1 = 发送过程中 FIFO 变空导致帧截断 |
| | | [3] `REPEAT_ACTIVE` | RO | 0 | 重复发送中标志：1 = 当前处于自动重复码发送阶段 |
| | | [4:0] `FIFO_CNT` | RO | 0 | TX FIFO 当前数据字数（0–16） |
| | | [5] `FIFO_FULL` | RO | 0 | FIFO 满标志 |
| | | [6] `FIFO_EMPTY` | RO | 1 | FIFO 空标志，复位后默认 1 |
| | | [31:7] — | RO | 0 | 保留 |
| 0x10 | `IR_TX_REPEAT` | [15:0] `RPT_INTERVAL` | R/W | 0x006E | 重复码间隔，单位 ms，默认 110 ms |
| | | [23:16] `RPT_COUNT` | R/W | 0 | 重复码发送次数：0 = 无限重复，1–255 = 限定次数 |
| | | [31:24] — | RO | 0 | 保留 |

#### 8.3.2 IR RX 寄存器组

| 偏移地址 | 寄存器名 | 位域 | 读写属性 | 复位值 | 功能描述 |
|---------|---------|------|---------|--------|---------|
| 0x20 | `IR_RX_CTRL` | [0] `RX_EN` | R/W | 0 | 接收通路使能：1 = 启动边沿检测、脉宽测量与协议解码；0 = 关闭并清空 FIFO |
| | | [3:1] `PROTO_SEL` | R/W | 0 | 协议选择，编码同 `IR_TX_CTRL`[3:1] |
| | | [4] `DEMOD_INV` | R/W | 0 | 输入极性反转：1 = 将 `demod_out` 反相后送入滤波器，适配不同 AFE 输出极性 |
| | | [5] `GLITCH_EN` | R/W | 1 | 毛刺滤波使能：1 = 启用输入滤波；0 = 直通模式（降低延迟但牺牲抗噪性） |
| | | [6] `FIFO_RST` | WO | 0 | RX FIFO 复位：写 1 清空，硬件自动清零 |
| | | [31:7] — | RO | 0 | 保留 |
| 0x24 | `IR_RX_PW_CFG` | [7:0] `GLITCH_THR` | R/W | 0x32 | 毛刺滤波阈值，单位 µs，默认 50 µs |
| | | [15:8] `WIN_MARGIN` | R/W | 0x0A | 时序容差百分比，默认 10%（±10%） |
| | | [23:16] `MIN_PULSE` | R/W | 0x06 | 最小有效载波脉冲数，用于滤除非载波噪声 |
| | | [31:24] — | RO | 0 | 保留 |
| 0x28 | `IR_RX_DATA` | [7:0] `ADDR` | RO | 0 | 接收地址域，读操作弹出 RX FIFO 顶帧 |
| | | [15:8] `CMD` | RO | 0 | 接收命令域 |
| | | [23:16] `EXT_ADDR` | RO | 0 | 扩展地址高 8 bit（NEC Extended 模式有效） |
| | | [24] `REPEAT` | RO | 0 | 重复帧标志：1 = 该帧为重复码而非首次按键 |
| | | [25] `VALID` | RO | 0 | 数据有效标志：1 = FIFO 顶帧数据已校验通过 |
| | | [31:26] — | RO | 0 | 保留 |
| 0x2C | `IR_RX_PW` | [15:0] `PULSE_WIDTH` | RO | 0 | 上次测量的脉冲宽度，单位 µs，调试与原始模式使用 |
| | | [31:16] `SPACE_WIDTH` | RO | 0 | 上次测量的空闲宽度，单位 µs |
| 0x30 | `IR_RX_STATUS` | [0] `RECEIVED` | R/W1C | 0 | 接收完成标志：1 = RX FIFO 中至少有一帧可用 |
| | | [1] `OVERRUN` | R/W1C | 0 | 溢出标志：1 = RX FIFO 满后收到新帧导致数据丢失 |
| | | [2] `FRAMING_ERR` | R/W1C | 0 | 帧错误标志：1 = 脉宽序列无法匹配当前协议的时序窗口 |
| | | [3] `TIMEOUT` | R/W1C | 0 | 超时标志：1 = 帧接收过程中空闲时间超过协议最大允许值 |
| | | [4:0] `FIFO_CNT` | RO | 0 | RX FIFO 当前数据字数（0–8） |
| | | [5] `FIFO_FULL` | RO | 0 | FIFO 满标志 |
| | | [6] `FIFO_EMPTY` | RO | 1 | FIFO 空标志 |
| | | [31:7] — | RO | 0 | 保留 |

#### 8.3.3 中断寄存器

TX 与 RX 的中断源经内部聚合后向中断控制器输出单一中断线 `ir_irq`。软件通过读取 `IR_INT_STS` 判断中断归属。

| 偏移地址 | 寄存器名 | 位域 | 读写属性 | 复位值 | 功能描述 |
|---------|---------|------|---------|--------|---------|
| 0x50 | `IR_INT_EN` | [0] `TX_DONE_EN` | R/W | 0 | TX 发送完成中断使能 |
| | | [1] `TX_FIFO_UNDERRUN_EN` | R/W | 0 | TX FIFO 下溢中断使能 |
| | | [2] `TX_FIFO_EMPTY_EN` | R/W | 0 | TX FIFO 空中断使能 |
| | | [3] `TX_REPEAT_DONE_EN` | R/W | 0 | TX 重复码发送完成中断使能 |
| | | [16] `RX_RECEIVED_EN` | R/W | 0 | RX 接收完成中断使能 |
| | | [17] `RX_OVERRUN_EN` | R/W | 0 | RX 溢出中断使能 |
| | | [18] `RX_FRAMING_ERR_EN` | R/W | 0 | RX 帧错误中断使能 |
| | | [19] `RX_TIMEOUT_EN` | R/W | 0 | RX 超时中断使能 |
| | | [31:20, 15:4] — | RO | 0 | 保留 |
| 0x54 | `IR_INT_STS` | [0] `TX_DONE` | R/W1C | 0 | TX 发送完成中断状态，写 1 清除 |
| | | [1] `TX_FIFO_UNDERRUN` | R/W1C | 0 | TX FIFO 下溢中断状态 |
| | | [2] `TX_FIFO_EMPTY` | R/W1C | 0 | TX FIFO 空中断状态 |
| | | [3] `TX_REPEAT_DONE` | R/W1C | 0 | TX 重复码完成中断状态 |
| | | [16] `RX_RECEIVED` | R/W1C | 0 | RX 接收完成中断状态 |
| | | [17] `RX_OVERRUN` | R/W1C | 0 | RX 溢出中断状态 |
| | | [18] `RX_FRAMING_ERR` | R/W1C | 0 | RX 帧错误中断状态 |
| | | [19] `RX_TIMEOUT` | R/W1C | 0 | RX 超时中断状态 |
| | | [31:20, 15:4] — | RO | 0 | 保留 |

软件中断服务程序的典型处理顺序为：读取 `IR_INT_STS` 确定中断源；若为 `RX_RECEIVED`，则轮询读取 `IR_RX_DATA` 直至 `FIFO_EMPTY` 置位；若为 `TX_DONE`，则检查 `BUSY` 与 `FIFO_EMPTY`，若仍有待发数据可继续写入 `IR_TX_DATA` 启动下一帧。所有中断状态位均遵循写 1 清除（W1C）语义，避免软件读取-修改-写入操作引入竞态条件。


---

## 9. DMA — 直接存储器访问控制器

DMA（Direct Memory Access，直接存储器访问）控制器是 SoC 中负责在内存与外设之间、内存与内存之间高速搬运数据的关键基础设施 IP。其核心设计目标是在无需 CPU 干预的情况下完成大数据块传输，从而将 CPU 算力释放给计算密集型任务。本章所描述的 DMA 控制器采用 8 通道并发架构，具备 Master/Slave 双接口特性：APB Slave 接口供软件配置寄存器，AXI Master 接口发起总线读写事务；同时支持硬件流控制握手、突发传输优化以及 Scatter-Gather 链表描述符，以满足现代 SoC 对高带宽外设数据搬移的严苛需求。

### 9.1 内部架构与框图

#### 9.1.1 DMA 控制器顶层框图

DMA 控制器的顶层架构由三大功能平面组成：配置平面（APB Slave）、控制平面（通道控制阵列与仲裁器）以及数据平面（FIFO 缓冲与 AXI Master 接口）。配置平面通过 4KB 寄存器地址空间向 CPU 暴露所有软件可见寄存器；控制平面负责 8 个独立通道的传输调度和优先级仲裁；数据平面通过读写 FIFO 中转，最终由 AXI Master 接口向系统总线矩阵发起事务。

顶层框图的内部数据流如下：CPU 通过 APB 总线写入通道配置寄存器后，通道控制单元内部的传输状态机从 IDLE 跳转至 READY。当存在外设握手请求（DREQ）或软件直接触发（Memory-to-Memory 模式）时，通道向中央仲裁器发起总线访问请求。仲裁器根据固定优先级或轮询策略选通一个通道，授权其使用 AXI Master 接口。读通道从源地址连续读取数据填充内部 FIFO，写通道将 FIFO 中的数据以相同或不同的数据宽度、突发长度写入目标地址。一次完整的传输由若干次 AXI burst 事务组成，所有 burst 完成后通道状态机回到 IDLE，并依据中断使能配置向 CPU 发出完成中断。

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                        DMA Controller Top Level (8-Channel)                   │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐        ┌──────────┐  ┌──────────┐  │
│   │ Channel 0│  │ Channel 1│  │ Channel 2│  ....  │ Channel 6│  │ Channel 7│  │
│   │ Controller│  │ Controller│  │ Controller│        │ Controller│  │ Controller│  │
│   │ ─────────│  │ ─────────│  │ ─────────│        │ ─────────│  │ ─────────│  │
│   │ SRC_ADDR │  │ SRC_ADDR │  │ SRC_ADDR │        │ SRC_ADDR │  │ SRC_ADDR │  │
│   │ DST_ADDR │  │ DST_ADDR │  │ DST_ADDR │        │ DST_ADDR │  │ DST_ADDR │  │
│   │ XFER_SIZE│  │ XFER_SIZE│  │ XFER_SIZE│        │ XFER_SIZE│  │ XFER_SIZE│  │
│   │ LLI_PTR  │  │ LLI_PTR  │  │ LLI_PTR  │        │ LLI_PTR  │  │ LLI_PTR  │  │
│   │ CTRL_REG │  │ CTRL_REG │  │ CTRL_REG │        │ CTRL_REG │  │ CTRL_REG │  │
│   │ STA_REG  │  │ STA_REG  │  │ STA_REG  │        │ STA_REG  │  │ STA_REG  │  │
│   └─────┬────┘  └─────┬────┘  └─────┬────┘        └─────┬────┘  └─────┬────┘  │
│         │             │             │                   │             │         │
│         └─────────────┴─────────────┴───────────────────┴─────────────┘         │
│                                   │                                           │
│                       ┌───────────▼────────────┐                              │
│                       │  Channel Arbiter       │                              │
│                       │ (Priority / Round-Robin) │                              │
│                       │ ──────────────────────  │                              │
│                       │ • Priority Encoder      │                              │
│                       │ • 4-level SW Priority   │                              │
│                       │ • Channel-number HW    │                              │
│                       │   tie-break fallback   │                              │
│                       └───────────┬────────────┘                              │
│                                   │                                           │
│                       ┌───────────▼────────────┐                              │
│                       │  FIFO / Data Buffer    │                              │
│                       │ (512-byte MFIFO)       │                              │
│                       │ ──────────────────────  │                              │
│                       │ • Width Adaptation     │                              │
│                       │ • Burst Accumulation   │                              │
│                       │ • Cross-domain Staging │                              │
│                       └───────────┬────────────┘                              │
│                                   │                                           │
│         ┌─────────────────────────┴─────────────────────────┐                   │
│         │              AXI4 Master Interface              │                   │
│         │  ┌────────────────┐      ┌──────────────────────┐  │                   │
│         │  │ Read Channel  │      │    Write Channel   │  │                   │
│         │  │ • ARADDR/ARID │      │ • AWADDR/AWID      │  │                   │
│         │  │ • ARBURST/ARLEN│     │ • AWBURST/AWLEN    │  │                   │
│         │  │ • RDATA/RRESP │      │ • WDATA/WSTRB      │  │                   │
│         │  │ • ARCACHE/ARPROT│    │ • AWCACHE/AWPROT   │  │                   │
│         │  └───────┬────────┘      └──────────┬─────────┘  │                   │
│         └──────────┴──────────────────────────┴────────────┘                   │
│                    │                              │                            │
│             ┌──────▼──────┐                ┌──────▼──────┐                     │
│             │  AXI Master │                │  AXI Master │                     │
│             │  Read Port  │                │  Write Port │                     │
│             │  (to Bus    │                │  (to Bus    │                     │
│             │   Matrix)   │                │   Matrix)   │                     │
│             └─────────────┘                └─────────────┘                     │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │              APB4 Slave Interface (Register Configuration Port)          │  │
│  │  ───────────────────────────────────────────────────────────────────  │  │
│  │  • 4KB register space: 0x000 ~ 0xFFF                                    │  │
│  │  • Secure & Non-secure access control (via PPROT[1:0])                │  │  │
│  │  • CPU configures all global and per-channel registers                 │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │              Peripheral Handshake Interface (DREQ/DACK)                │  │
│  │  ───────────────────────────────────────────────────────────────────  │  │
│  │  • DMA_REQ[7:0]  ← from peripherals (UART/SPI/ADC/I2S...)              │  │
│  │  • DMA_ACK[7:0]  → to peripherals  (transfer grant)                    │  │
│  │  • Hardware flow control for M2P and P2M transfers                    │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                Interrupt Output Interface                               │  │
│  │  • dma_irq: single combined interrupt line to CPU NVIC/GIC              │  │
│  │  • Per-channel sources: DONE / HALF / ERROR / LLI_COMPLETED             │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

#### 9.1.2 通道控制单元内部结构

每个通道控制单元是独立的传输执行引擎，包含四组核心子模块。第一组是地址与计数寄存器堆，包括 32-bit 源地址寄存器 SAR、32-bit 目标地址寄存器 DAR 以及 16-bit 传输大小计数器 BLOCK_TS。地址寄存器在每次 AXI beat 或 burst 完成后由硬件自动递增或保持固定，取决于 CTRL 寄存器中的 INC 配置。第二组是控制状态机，采用四状态设计：IDLE → FETCH（预取 LLI 描述符） → ACTIVE（执行读写 burst） → COMPLETE（置位 DONE 并可选中断）。第三组是 Handshaking 接口逻辑，负责采样外设的 DMA_REQ 信号并在仲裁器授权后回送 DMA_ACK。第四组是 Scatter-Gather 引擎子接口，在 LLI 模式下通过读取内存中的描述符自动重装载 SAR、DAR、SIZE 与 LLP 寄存器，实现无需 CPU 干预的多块连续传输。

#### 9.1.3 Scatter-Gather 描述符引擎

Scatter-Gather（分散/聚集）引擎是 DMA 控制器支持非连续内存块传输的核心模块。当通道配置为链表模式（LLI Mode）时，通道状态机在完成当前块传输后，不直接回到 IDLE，而是读取 CHx_LLP 寄存器指向的内存地址，获取下一个 LLI 描述符。描述符引擎通过 AXI Master 接口发起一次固定 32-byte 的读事务，将描述符内容写入内部影子寄存器，随后立即装载到 SAR、DAR、BLOCK_TS、CTRL 与 LLP 寄存器。若新装载的 LLP 值为非零，状态机继续执行下一块传输；若 LLP 值为零，表示已到达链表末尾，状态机跳转至 COMPLETE 状态。整个预取过程对软件透明，CPU 仅需在初始化时构建内存中的描述符链表并写入首地址到 CHx_LLP。

### 9.2 工作原理

#### 9.2.1 三种传输模式

DMA 控制器支持三种基本传输模式，分别对应不同的数据流方向和握手需求。Memory-to-Memory（M2M）模式用于内存块拷贝，如帧缓冲区复制或固件加载。此模式下源和目标均为内存地址，无需外设握手，CPU 配置完寄存器并置位 CH_EN 后，DMA 立即开始连续 burst 传输直至 BLOCK_TS 减至零。Memory-to-Peripheral（M2P）模式用于向外设 FIFO 填充数据，典型场景包括 UART 发送、SPI TX 和 DAC 输出。此模式下目标地址固定（外设 FIFO 端口），DMA 需等待外设通过 DMA_REQ 信号请求数据后才能执行写事务。Peripheral-to-Memory（P2M）模式用于从外设接收数据，典型场景包括 ADC 采样、UART/SPI RX 和传感器数据采集。此模式下源地址固定，DMA 在外设 DMA_REQ 有效时执行读事务并将数据写入内存。M2P 与 P2M 模式统称为外设流控模式，其传输节奏完全由外设的数据产生或消耗速率决定。

#### 9.2.2 外设握手机制

外设握手采用 DREQ/DACK 信号对实现硬件流控制，其完整时序可分解为四个阶段。第一阶段为请求阶段：当外设 FIFO 水位越过预设阈值（如 UART TX FIFO 半空或 RX FIFO 半满）时，外设将对应的 DMA_REQ 信号置为高电平。第二阶段为仲裁阶段：DMA 控制器内部的请求采样逻辑锁存所有通道的 DREQ 信号，仅当通道已被使能（CH_EN=1）且仲裁器授予该通道总线访问权时，握手逻辑才进入第三阶段。第三阶段为应答阶段：DMA 在 AXI 地址通道发送首笔读或写地址的同时，将对应通道的 DMA_ACK 信号置为高电平，通知外设数据传输已经开始。第四阶段为释放阶段：当一次 burst（或单 beat，取决于配置）完成后，DMA 在 AXI 写响应（BVALID/BREADY）或读最后一个数据（RLAST）到达后将 DMA_ACK 置低；外设在检测到 ACK 下降沿后，若 FIFO 水位仍满足阈值条件则保持 DREQ，否则释放 DREQ。上述握手时序可用伪代码表示如下：

```
while (BLOCK_TS > 0):
    wait_until(DMA_REQ == 1);
    arbiter_grant(channel);
    DMA_ACK <= 1;
    execute_axi_burst(SRC_ADDR, DST_ADDR, burst_len);
    DMA_ACK <= 0;
    if (peripheral_deasserts_REQ):
        break;
```

需要特别指出，在 M2M 模式下，DREQ/DACK 信号被内部逻辑屏蔽，通道状态机在 CH_EN 置位后直接由仲裁器调度，无需等待外设握手。

#### 9.2.3 突发传输优化

突发传输（Burst Transfer）是最大化总线带宽利用率的核心手段。DMA 控制器支持四级突发长度配置：1 beat、4 beats、8 beats 和 16 beats，分别对应 AXI 协议中的 ARLEN = 0x0、0x3、0x7 和 0xF。同时支持四级数据宽度配置：8-bit、16-bit、32-bit 和 64-bit，对应 AXI 数据总线上的 WDATA/RDATA 有效字节由 WSTRB 信号标识。源与目标的突发参数可独立配置，允许跨宽度转换传输，例如将 8-bit 宽度的外设 FIFO 数据以 32-bit 宽度打包写入内存，从而减少 AXI 地址通道事务数量。一次 burst 的总数据量等于 Burst Length × Data Width。当传输总字节数不是 burst 总数据量的整数倍时，控制器自动将尾部非对齐数据拆分为较短 burst 或单 beat 事务。此外，地址递增模式支持 byte/halfword/word/double-word 四级粒度，确保不同宽度的突发传输不会破坏内存中的数据对齐。

#### 9.2.4 LLI 链表描述符结构

LLI（Linked List Item）描述符是 Scatter-Gather 模式下的基本调度单元，在内存中以连续 32-byte 结构存放。每个描述符包含 7 个字段：SAR（源地址，4 byte）、DAR（目标地址，4 byte）、LLP（下一描述符指针，4 byte）、CTRL_LO（低控制字，4 byte）、CTRL_HI/SIZE（高控制字/块大小，4 byte）、SSTAT（源状态快照，4 byte）以及 DSTAT（目标状态快照，4 byte）。其中 SAR 和 DAR 为当前块的物理起始地址；LLP 指向下一个描述符的物理地址，若值为 0x0000_0000 则表示链表终止。CTRL_LO 包含中断使能位、源/目标地址递增标志、源/目标数据宽度、源/目标突发长度以及流控类型编码。CTRL_HI 的低 16 位存放 BLOCK_TS，即当前块以数据宽度为单位的传输计数。SSTAT 和 DSTAT 为可选字段，允许 DMA 控制器在传输完成后将总线状态信息回写到描述符中，供驱动程序调试或错误分析使用。软件在初始化链表时，需确保每个描述符的地址按 32-byte 边界对齐，以避免 DMA 描述符预取过程中的非对齐访问异常。

### 9.3 软件可见寄存器

DMA 控制器的寄存器空间共 4KB，分为全局寄存器区（偏移 0x000 ~ 0x0FF）和通道寄存器区（偏移 0x100 ~ 0xFFF）。8 个通道各占用 0x80 字节，基址公式为 `0x100 + ch * 0x80`（ch = 0~7）。所有寄存器均通过 APB4 Slave 接口访问，支持 32-bit 读写；状态类寄存器中的 W1C（写 1 清零）位需软件通过写 1 操作清除，写 0 无影响。

#### 9.3.1 全局控制寄存器

全局寄存器区管理 DMA 控制器的整体使能、中断聚合以及错误诊断。DMA_CTRL 寄存器的全局使能位控制整个控制器的时钟门控与状态机复位释放；INT_EN 和 INT_CLR 采用位图结构，每个通道对应一位，便于软件以批量方式管理中断。DMA_ERR_STS 寄存器不仅标识哪些通道发生了错误，还通过 ERR_CODE 字段提供 4 位错误类型编码，覆盖总线读错误、总线写错误、配置非法（如地址不对齐）和描述符预取错误四类场景。

**表 9-1 全局控制与状态寄存器**

| 偏移地址 | 寄存器名 | 位域 | 属性 | 复位值 | 功能描述 |
|:--------:|:---------|:-----|:----:|:------:|:---------|
| 0x000 | DMA_CTRL | [0] EN | R/W | 0 | DMA 全局使能；0=控制器关闭（所有通道强制停止），1=正常工作 |
| | | [1] SWRST | W | — | 软件复位；写 1 触发全局软复位，自动清零所有通道寄存器和中断状态 |
| | | [31:2] RSV | — | 0 | 保留，读返回 0 |
| 0x004 | DMA_STATUS | [0] ACTIVE | R | 0 | 全局活跃状态；任意通道非 IDLE 时置 1 |
| | | [7:1] RSV | — | 0 | 保留 |
| | | [15:8] CH_ACTIVE | R | 0 | 通道活跃位图；CH0=bit8，CH7=bit15，对应位为 1 表示该通道正在传输 |
| 0x008 | DMA_INT_EN | [7:0] CH_IE | R/W | 0 | 通道中断使能位图；bit[n]=1 使能通道 n 的中断输出 |
| | | [15:8] ERR_IE | R/W | 0 | 错误中断使能位图；bit[n]=1 使能通道 n 的错误中断 |
| 0x00C | DMA_INT_STS | [7:0] CH_IS | R | 0 | 通道中断状态位图；通道完成/半完成时硬件置位 |
| | | [15:8] ERR_IS | R | 0 | 错误中断状态位图；通道发生总线或配置错误时置位 |
| 0x010 | DMA_INT_CLR | [7:0] CH_IC | W1C | 0 | 通道中断清除；写 1 清除对应位的中断状态 |
| | | [15:8] ERR_IC | W1C | 0 | 错误中断清除；写 1 清除对应错误中断位 |
| 0x014 | DMA_ERR_STS | [7:0] CH_ERR | R | 0 | 通道错误位图；bit[n]=1 表示通道 n 存在未处理错误 |
| | | [11:8] ERR_CODE | R | 0 | 错误类型码：0=无错，1=AXI 读错误（RRESP/SLVERR/DECERR），2=AXI 写错误（BRESP 非 OKAY），3=配置错误（地址未对齐或非法突发组合），4=LLI 预取错误（描述符读失败），5~15=保留 |
| | | [31:12] RSV | — | 0 | 保留 |

#### 9.3.2 通道专用配置寄存器

每个通道拥有独立的 8 个 32-bit 配置寄存器，偏移地址相对于通道基址计算。CHx_CTRL 寄存器包含通道使能、暂停控制、传输模式选择以及 4-bit 优先级编码。CHx_CTL 寄存器（传输控制）是配置密度最高的寄存器，涵盖源/目标地址递增、数据宽度、突发大小以及流控类型选择。CHx_CFG 寄存器专用于外设握手配置，其中 HS_SEL 字段选择 16 个外设请求线之一，HS_EN 位决定是否启用硬件握手。值得注意的是，CHx_SIZE 寄存器的 BLOCK_TS 字段以数据宽度为单位计数，实际传输字节数等于 BLOCK_TS × SRC_WIDTH（或 DST_WIDTH，二者在合法配置下应保持一致或通过 FIFO 宽度转换适配）。

**表 9-2 通道专用配置寄存器（基址：0x100 + ch × 0x80）**

| 偏移 | 寄存器名 | 位域 | 属性 | 复位值 | 功能描述 |
|:----:|:---------|:-----|:----:|:------:|:---------|
| +0x00 | CHx_CTRL | [0] CH_EN | R/W | 0 | 通道使能；写 1 启动传输，传输完成后硬件自动清 0 |
| | | [1] CH_PAUSE | R/W | 0 | 通道暂停；写 1 暂停当前通道，FIFO 内数据排空后挂起；写 0 恢复 |
| | | [3:2] XFER_MODE | R/W | 0 | 传输模式：00=单块模式，01=LLI 链表模式，10=自动重载模式，11=保留 |
| | | [7:4] PRIORITY | R/W | 0 | 通道优先级：0~15，数值越大优先级越高；仲裁器在同一优先级组内采用通道号轮询 |
| | | [31:8] RSV | — | 0 | 保留 |
| +0x04 | CHx_SRC_ADDR | [31:0] SAR | R/W | 0 | 源起始物理地址；字节对齐；外设 FIFO 地址时硬件不递增 |
| +0x08 | CHx_DST_ADDR | [31:0] DAR | R/W | 0 | 目标起始物理地址；字节对齐 |
| +0x0C | CHx_SIZE | [15:0] BLOCK_TS | R/W | 0 | 传输块大小；以 SRC_WIDTH 对应的字节数为单位的传输计数；0 表示 65536 次传输 |
| | | [31:16] RSV | — | 0 | 保留 |
| +0x10 | CHx_LLP | [31:0] LLP | R/W | 0 | 链表指针；LLI 模式下指向下一个描述符的物理地址；bit[4:0] 必须为 0（32-byte 对齐） |
| +0x14 | CHx_CTL | [0] SRC_INC | R/W | 0 | 源地址递增：1=每 beat/burst 后按 SRC_WIDTH 递增，0=固定地址 |
| | | [1] DST_INC | R/W | 0 | 目标地址递增：1=递增，0=固定 |
| | | [4:2] SRC_WIDTH | R/W | 0 | 源数据宽度：000=8-bit，001=16-bit，010=32-bit，011=64-bit，1xx=保留 |
| | | [7:5] DST_WIDTH | R/W | 0 | 目标数据宽度；编码同 SRC_WIDTH |
| | | [11:8] SRC_BURST | R/W | 0 | 源突发大小：0000=1，0001=4，0010=8，0011=16，其余保留 |
| | | [15:12] DST_BURST | R/W | 0 | 目标突发大小；编码同 SRC_BURST |
| | | [18:16] TTC_FC | R/W | 0 | 传输类型与流控：000=M2M-DMA 流控，001=M2P-DMA 流控，010=P2M-DMA 流控，100=M2P-外设流控，101=P2M-外设流控，其余保留 |
| | | [19] INT_EN | R/W | 0 | 块传输完成中断使能：1=当前 LLI 块完成后产生中断 |
| | | [31:20] RSV | — | 0 | 保留 |
| +0x18 | CHx_CFG | [3:0] HS_SEL | R/W | 0 | 硬件握手外设选择：0~15 对应 16 条外设 DMA 请求线 |
| | | [4] HS_EN | R/W | 0 | 硬件握手使能：1=使用 DMA_REQ/DACK 握手，0=软件流控（仅 M2M 有效） |
| | | [5] CH_SUSP | R/W | 0 | 通道挂起请求；写 1 请求挂起，硬件在 FIFO 排空后置位 STA 中的 SUSP 位 |
| | | [31:6] RSV | — | 0 | 保留 |

#### 9.3.3 通道状态与链表寄存器

通道状态寄存器向软件暴露通道的实时运行状态，包括忙标志、完成标志、错误标志以及半传输标志。CHx_STATUS 中的 BUSY 位在状态机处于 FETCH 或 ACTIVE 时置位，是判断通道是否可安全重新配置的唯一可靠依据。DONE 和 ERR 位为 W1C 属性，软件在中断服务程序中读取状态后必须写 1 清除，否则后续传输的中断无法触发。CHx_LLP_RO 为只读寄存器，反映当前正在执行或预取的 LLI 描述符地址，用于调试挂死的链表传输。CHx_LLI_STAT 寄存器记录描述符引擎的状态，包括当前链表深度计数和预取 FIFO 的空满状态。

**表 9-3 通道状态与链表寄存器（基址：0x100 + ch × 0x80）**

| 偏移 | 寄存器名 | 位域 | 属性 | 复位值 | 功能描述 |
|:----:|:---------|:-----|:----:|:------:|:---------|
| +0x1C | CHx_STATUS | [0] BUSY | R | 0 | 通道忙标志：1=通道状态机处于 FETCH/ACTIVE，0=IDLE/COMPLETE |
| | | [1] DONE | R/W1C | 0 | 传输完成标志：单块模式时整个传输完成置位；LLI 模式时每块完成且 INT_EN=1 时置位；全部完成后最终置位 |
| | | [2] ERR | R/W1C | 0 | 传输错误标志：总线错误、配置非法或 LLI 预取失败时置位；通道自动停止 |
| | | [3] HALF | R/W1C | 0 | 半传输完成标志：BLOCK_TS 减至初始值一半时置位（仅单块模式有效） |
| | | [4] SUSP | R | 0 | 通道已挂起标志：CH_SUSP 请求生效且 FIFO 排空后置位 |
| | | [31:5] RSV | — | 0 | 保留 |
| +0x20 | CHx_LLP_RO | [31:0] CUR_LLP | R | 0 | 当前 LLI 指针只读副本；反映硬件正在使用或预取的描述符地址 |
| +0x24 | CHx_LLI_STAT | [7:0] LLI_CNT | R | 0 | 已完成的 LLI 描述符计数；LLI 模式下每完成一个描述符硬件自动递增 |
| | | [16] PFETCH_EMPTY | R | 1 | 预取 FIFO 空标志：1=描述符预取缓冲为空，0=存在待处理描述符 |
| | | [17] PFETCH_FULL | R | 0 | 预取 FIFO 满标志：1=预取缓冲已满（深度为 2） |
| | | [31:18] RSV | — | 0 | 保留 |
| +0x28 | CHx_SAR_RO | [31:0] CUR_SAR | R | 0 | 当前源地址只读副本；传输过程中硬件实时更新 |
| +0x2C | CHx_DAR_RO | [31:0] CUR_DAR | R | 0 | 当前目标地址只读副本；传输过程中硬件实时更新 |
| +0x30 | CHx_SIZE_RO | [15:0] CUR_TS | R | 0 | 当前剩余传输计数只读副本；反映 BLOCK_TS 递减后的实时值 |
| | | [31:16] RSV | — | 0 | 保留 |

通道状态与链表寄存器的设计遵循“配置寄存器可写、状态寄存器只读或 W1C”的原则，确保软件在调试时能够观测到 DMA 硬件的实时进度，同时不会因为误写状态寄存器而破坏硬件状态机。CHx_SAR_RO、CHx_DAR_RO 和 CHx_SIZE_RO 三个调试寄存器在传输过程中以 AXI 事务边界为粒度更新，其值与总线上实际发出的地址和剩余 beat 数保持同步，可用于精确追踪大数据量传输的执行进度。在多通道并发场景下，软件可通过轮询 DMA_STATUS 的 CH_ACTIVE 位图快速判断系统级 DMA 负载，进而决定是否向低优先级通道分配新的传输任务。


---

## 10. Mailbox — 多核/多处理器间信箱通信

Mailbox IP 是 SoC 中实现处理器间异步消息通知的专用硬件模块。与 DMA 控制器负责的大数据块搬运不同，Mailbox 的核心定位是**低延迟事件通知**——通过共享寄存器存储一条 32 位消息并配合中断机制，使一个处理器能够在微秒级时间尺度内唤醒对端核执行指定任务。本设计实现 8 通道单寄存器型 Mailbox，支持双处理器（Processor A 与 Processor B）通过 APB 总线进行不对称读写访问。

### 10.1 内部架构与框图

#### 10.1.1 Mailbox 模块框图

模块采用单寄存器型架构（Register-based Mailbox），每通道仅维护一个 32 位共享寄存器单元，而非深度 FIFO。该选择在芯片面积与消息吞吐之间取得平衡：寄存器型设计每通道仅需约 50 个等效门，8 通道总开销低于一个 16 字深度 FIFO 的十分之一，适用于以通知为主、数据量极小的核间通信场景。模块内部由四部分组成：8 通道寄存器阵列、状态标志逻辑、中断生成器以及 APB Slave 接口。

寄存器阵列中的每个单元同时连接写端口（Write Port A，来自 Processor A）与读端口（Read Port B，面向 Processor B）。状态标志逻辑实时监测读写事务，在写使能有效时置位 FULL 并清零 EMPTY，在读使能有效时执行相反操作，同时检测并记录 OVERFLOW（写满再写）与 UNDERFLOW（读空再读）异常。中断生成器对 FULL 与 EMPTY 的上升沿进行采样，结合中断使能寄存器产生定向到两个处理器 NVIC/GIC 的 RX 与 TX 中断请求。APB Slave 接口将上述所有寄存器映射到统一的 4 KB 地址空间，两个处理器通过系统总线矩阵访问同一物理地址但具有不同操作语义——Processor A 主要执行写与状态轮询，Processor B 主要执行读与中断响应。

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Mailbox IP — 8-Channel                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    Processor A (APB0)                           Processor B (APB1)           │
│         │                                              │                     │
│         ▼                                              ▼                     │
│   ┌─────────────┐                               ┌─────────────┐              │
│   │   NVIC_A    │◀──────────────────────────────│   NVIC_B    │              │
│   │  (TX_IRQ)   │        mailbox_irq_a          │  (RX_IRQ)   │              │
│   └─────────────┘                               └─────────────┘              │
│         ▲                                              ▲                     │
│         │                                              │                     │
│   ┌─────┴──────────────────────────────────────────────┴─────┐               │
│   │                   Interrupt Generator                     │               │
│   │  ┌─────────────────────────────────────────────────────┐  │               │
│   │  │  CHx_FULL detect  ──▶ RX_IRQ[x] ──▶ Processor B   │  │               │
│   │  │  CHx_EMPTY detect ──▶ TX_IRQ[x] ──▶ Processor A   │  │               │
│   │  └─────────────────────────────────────────────────────┘  │               │
│   └──────────────────────┬─────────────────────────────────────┘               │
│                          │                                                   │
│   ┌──────────────────────▼─────────────────────────────────────┐               │
│   │                    Status Flag Logic                        │               │
│   │  ┌─────────────────────────────────────────────────────┐    │               │
│   │  │  Per-channel: FULL, EMPTY, OVERFLOW, UNDERFLOW     │    │               │
│   │  │  • Write to CHx_WR  ──▶  set FULL, clear EMPTY    │    │               │
│   │  │  • Read from CHx_RD ──▶  clear FULL, set EMPTY     │    │               │
│   │  └─────────────────────────────────────────────────────┘    │               │
│   └──────────────────────┬─────────────────────────────────────┘               │
│                          │                                                   │
│   ┌──────────────────────▼─────────────────────────────────────┐               │
│   │              8-Channel Register Array (×32-bit)           │               │
│   │  ┌────────┐ ┌────────┐ ┌────────┐        ┌────────┐      │               │
│   │  │ CH0_REG│ │ CH1_REG│ │ CH2_REG│  ...   │ CH7_REG│      │               │
│   │  │[31:0]  │ │[31:0]  │ │[31:0]  │        │[31:0]  │      │               │
│   │  │(WR/RD) │ │(WR/RD) │ │(WR/RD) │        │(WR/RD) │      │               │
│   │  └────────┘ └────────┘ └────────┘        └────────┘      │               │
│   │                                                            │               │
│   │  Write Port A ──▶ CHx_REG ──▶ Read Port B                  │               │
│   └──────────────────────┬─────────────────────────────────────┘               │
│                          │                                                   │
│   ┌──────────────────────▼─────────────────────────────────────┐               │
│   │              APB Slave Interface (Unified)                │               │
│   │  • Port A: Processor A accesses WR / STATUS / INT regs  │               │
│   │  • Port B: Processor B accesses RD / STATUS / INT regs  │               │
│   │  • Both ports share unified 4 KB address space            │               │
│   └───────────────────────────────────────────────────────────┘               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 10.1.2 多核通信拓扑

在双处理器 SoC 中，Mailbox 挂接于系统 APB 外设总线段，通过 AXI-to-APB 桥接器与总线矩阵向 Processor A 和 Processor B 暴露完全一致的物理地址空间。两者的区别在于操作语义：Processor A 对通道寄存器执行写操作，Processor B 执行读操作。中断路由呈交叉结构——RX 中断（消息到达通知）接入 Processor B 的 NVIC/GIC，TX 中断（消息已被取走确认）接入 Processor A 的 NVIC/GIC。该交叉拓扑确保发送方在写入后被动等待接收方取走数据，接收方在读取后反向通知发送方通道已腾空，形成无需软件参与握手位操作的硬件级流控闭环。

### 10.2 工作原理

#### 10.2.1 单通道通信流程

单通道通信遵循严格的生产者-消费者时序，硬件通过 FULL/EMPTY 标志实现流控，软件仅需执行读写与中断处理。

发送阶段由 Processor A 启动。软件首先查询目标通道的 MBOX_CHx_STATUS[EMPTY]，若该位为 1，表明通道当前无未读消息，具备写入条件；若 EMPTY=0（即 FULL=1），则写操作将被硬件拒绝并置位 OVERFLOW 错误标志，提示软件当前通道尚未被接收方读取。确认可写后，Processor A 向 MBOX_CHx_WR 发起 32 位 APB 写事务，写数据被锁存至通道寄存器，同时硬件组合逻辑在同一总线时钟周期内置位 FULL 并清零 EMPTY。中断生成器采样 FULL 的上升沿，若 MBOX_INT_EN 寄存器中对应位的 RX_IRQ_EN 已使能，则向 Processor B 的中断控制器断言 RX 中断请求线。

接收阶段由 Processor B 响应。Processor B 收到 RX 中断后，进入中断服务程序并读取 MBOX_CHx_RD，读数据总线返回最近一次写入的 32 位消息。读使能信号触发状态逻辑执行反向操作：清零 FULL、置位 EMPTY。中断生成器随即检测 EMPTY 的上升沿，若对应 TX_IRQ_EN 已使能，则向 Processor A 断言 TX 中断，通知其该通道已再次可写。整个流程中，单寄存器结构决定了消息不具备缓冲能力——在 Processor B 完成读取前，Processor A 的任何重复写入都将覆盖既有数据。因此软件协议需确保在收到 TX 中断前不发起新的写操作，或在上层设计消息序列号以检测覆盖。

#### 10.2.2 多通道优先级设计

8 条物理通道在硬件层面完全对称，但软件可按通信语义划分为两类用途。通道 0~3 定义为普通消息通道，用于常规任务分发、参数传递与状态同步；通道 4~7 定义为高优先级通道，专用于紧急控制通信，如核间中断触发、电源域状态变更通知或看门狗事件上报。两类通道的硬件差异仅体现在中断路由配置上——高优先级通道映射至 NVIC/GIC 中优先级更高的中断向量号，从而在 Processor B 端实现中断抢占，确保紧急消息优先得到处理。

由于每通道仅维护单个 32 位寄存器，8 条通道可同时承载 8 笔独立的 32 位并行数据。对于需传输超过 32 位的数据块（如结构体、配置表或图像描述符），推荐软件协议采用“指针传递”模式：消息本身仅携带指向共享内存区域的 32 位地址指针，接收方在读取 Mailbox 后通过 DMA 控制器执行后续的大块数据搬运。该模式将 Mailbox 的角色严格限定为**通知载体**，避免试图用单寄存器通道传输大数据量而导致的协议复杂化与吞吐瓶颈。

### 10.3 软件可见寄存器

#### 10.3.1 通道数据寄存器与通道状态寄存器

每个通道向软件暴露三个寄存器：写寄存器 MBOX_CHx_WR、读寄存器 MBOX_CHx_RD 与状态寄存器 MBOX_CHx_STATUS。写寄存器仅对 Processor A（发送方）具有写入语义，读寄存器仅对 Processor B（接收方）具有读取语义，两者在物理上映射到同一 32 位寄存器单元但访问端口独立。状态寄存器的 FULL 与 EMPTY 位由硬件根据最近一次读写事务自动更新，软件可通过轮询这些标志实现阻塞式发送或接收；OVERFLOW 与 UNDERFLOW 标志则用于诊断非法访问，以 W1C（写 1 清除）方式清零。

表 10-1 通道数据寄存器与状态寄存器（基址：MBOX_BASE，N = 0~7）

| 偏移地址 | 寄存器名 | 位域 | 读写属性 | 复位值 | 功能描述 |
|----------|----------|------|----------|--------|----------|
| 0x00 + N×0x10 | MBOX_CHx_WR | [31:0] DATA | W | 0x00000000 | 通道 x 写数据寄存器。Processor A 写入 32 位消息数据，硬件在同一周期内置位对应通道的 FULL 标志 |
| 0x04 + N×0x10 | MBOX_CHx_RD | [31:0] DATA | R | 0x00000000 | 通道 x 读数据寄存器。Processor B 读取最近一次写入的 32 位数据，硬件在同一周期内清除 FULL 标志 |
| 0x08 + N×0x10 | MBOX_CHx_STATUS | [0] FULL | R | 0x0 | 通道满标志。1 = 有新消息未读取，0 = 消息已被读取或为空。由硬件根据读写操作自动更新，软件只读 |
| | | [1] EMPTY | R | 0x1 | 通道空标志。1 = 无消息，0 = 有新消息。复位后默认为 1，是 FULL 位的反相状态，便于软件快速轮询 |
| | | [2] OVERFLOW | R/W1C | 0x0 | 写溢出错误标志。当 FULL = 1 时 Processor A 再次写入，硬件置位此标志。软件写 1 清除 |
| | | [3] UNDERFLOW | R/W1C | 0x0 | 读下溢错误标志。当 EMPTY = 1 时 Processor B 执行读取，硬件置位此标志。软件写 1 清除 |
| | | [31:4] Reserved | — | 0x00000000 | 保留，读取返回 0，写入忽略 |

#### 10.3.2 中断寄存器

中断控制采用全局寄存器组设计，以 8 位位图分别管理 8 个通道的接收（RX）与发送（TX）两类中断。RX 中断在通道 FULL 标志由 0 变为 1 时触发，用于通知 Processor B 有新消息到达；TX 中断在 EMPTY 标志由 0 变为 1 时触发，用于通知 Processor A 通道已腾空、可写入下一笔消息。MBOX_INT_STS 状态寄存器以只读形式暴露当前挂起的中断源；MBOX_INT_CLR 清除寄存器采用 W1C（写 1 清除）语义，消除软件读取-修改-写回操作可能引入的竞态条件。MBOX_MSG_PENDING 寄存器聚合所有通道的 FULL 状态，使 Processor B 可以通过单次 32 位读操作判断 0~7 通道中哪些存在待处理消息，将轮询 8 个独立状态寄存器的开销缩减为一次总线访问。

表 10-2 中断控制与状态寄存器

| 偏移地址 | 寄存器名 | 位域 | 读写属性 | 复位值 | 功能描述 |
|----------|----------|------|----------|--------|----------|
| 0x80 | MBOX_INT_EN | [7:0] RX_IRQ_EN | R/W | 0x00 | 接收中断使能。bit[x] = 1 使能通道 x 的接收中断，当 CHx_STATUS.FULL 由 0 变 1 时向 Processor B 产生中断 |
| | | [15:8] TX_IRQ_EN | R/W | 0x00 | 发送中断使能。bit[x] = 1 使能通道 x 的发送中断，当 CHx_STATUS.EMPTY 由 0 变 1 时向 Processor A 产生中断 |
| | | [31:16] Reserved | — | 0x0000 | 保留 |
| 0x84 | MBOX_INT_STS | [7:0] RX_IRQ_STS | R | 0x00 | 接收中断状态。bit[x] = 1 表示通道 x 的接收中断当前挂起，反映 FULL 上升沿事件 |
| | | [15:8] TX_IRQ_STS | R | 0x00 | 发送中断状态。bit[x] = 1 表示通道 x 的发送中断当前挂起，反映 EMPTY 上升沿事件 |
| | | [31:16] Reserved | — | 0x0000 | 保留 |
| 0x88 | MBOX_INT_CLR | [7:0] RX_IRQ_CLR | W1C | 0x00 | 接收中断清除。对 bit[x] 写 1 清除对应通道的 RX_IRQ_STS 位，写 0 无影响 |
| | | [15:8] TX_IRQ_CLR | W1C | 0x00 | 发送中断清除。对 bit[x] 写 1 清除对应通道的 TX_IRQ_STS 位 |
| | | [31:16] Reserved | — | 0x0000 | 保留 |
| 0x8C | MBOX_MSG_PENDING | [7:0] PENDING | R | 0x00 | 消息挂起聚合状态。bit[x] = CHx_STATUS.FULL，Processor B 可通过单次读取判断哪些通道有待读消息 |
| | | [31:8] Reserved | — | 0x000000 | 保留 |


---

## 11. HW Semaphore — 硬件信号量

HW Semaphore IP 为 SoC 中的多核/多总线 Master 环境提供硬件级资源互斥机制。与基于内存自旋锁的软件信号量不同，该 IP 通过专用寄存器阵列和内置仲裁电路，在硬件层面完成原子性的读-判断-锁定序列，消除了软件原子指令对缓存一致性协议和总线竞争条件的依赖。本章描述 32 信号量实例的内部架构、两阶段原子操作协议，以及软件可见的完整寄存器映射。

### 11.1 内部架构与框图

#### 11.1.1 HW Semaphore 框图

HW Semaphore 内部由四个功能层级构成：信号量寄存器阵列、原子操作控制单元、中断与事件生成器，以及多端口 APB 从接口。32 个信号量以寄存器阵列形式组织，每个信号量单元独立维护 LOCK 位、PROCID 和 COREID 三个状态域。原子操作控制单元包含硬件仲裁器和比较器，负责串行化多 Master 并发请求，并在单时钟周期内完成读-改-写事务。中断生成器监测所有信号量的 LOCK 位下降沿，向等待该资源的处理器核心发送释放通知。APB 接口层将各功能模块映射到统一的 4 KB 寄存器地址空间，支持多 Master 通过系统总线交叉开关独立访问。

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Hardware Semaphore (HSEM) IP Core                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │              Semaphore Register Array (HSEM_R0~R31)                 │   │
│  │  ┌──────────┐ ┌──────────┐              ┌──────────┐               │   │
│  │  │ HSEM_R0  │ │ HSEM_R1  │     ...      │ HSEM_R31 │               │   │
│  │  │ [0] LOCK │ │ [0] LOCK │              │ [0] LOCK │               │   │
│  │  │ [7:1]PID │ │ [7:1]PID │              │ [7:1]PID │               │   │
│  │  │ [11:8]CID│ │ [11:8]CID│              │ [11:8]CID│               │   │
│  │  └────┬─────┘ └────┬─────┘              └────┬─────┘               │   │
│  │       │            │                       │                      │   │
│  │       └────────────┴───────────┬───────────┘                      │   │
│  │                                │                                  │   │
│  │  HSEM_RLR0~RLR31 ──────────────┘  (Read Lock Reg, 只读, 读即尝试取锁)│   │
│  └────────────────────────────────┼──────────────────────────────────┘   │
│                                   │                                         │
│  ┌────────────────────────────────▼──────────────────────────────────┐   │
│  │                    Atomic Operation Control Unit                     │   │
│  │  ┌────────────────────────────────────────────────────────────┐    │   │
│  │  │              Hardware Arbiter + Comparator                  │    │   │
│  │  │  ────────────────────────────────────────────────────────  │    │   │
│  │  │  • Serializes concurrent Read/Write requests               │    │   │
│  │  │  • Matches COREID/PROCID on Write-to-Release              │    │   │
│  │  │  • Atomic Read-Modify-Write in single clock cycle          │    │   │
│  │  └────────────────────────────────────────────────────────────┘    │   │
│  └────────────────────────────────┬──────────────────────────────────┘   │
│                                   │                                         │
│  ┌────────────────────────────────▼──────────────────────────────────┐   │
│  │                 Interrupt & Event Generator                          │   │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌───────────────┐  │   │
│  │  │ Core 0 I/F      │    │ Core 1 I/F      │    │ Core N I/F    │  │   │
│  │  │ HSEM_C0IER/ISR  │    │ HSEM_C1IER/ISR  │    │ HSEM_CNIER/ISR│  │   │
│  │  │ [31:0] per-sem  │    │ [31:0] per-sem  │    │ [31:0] per-sem│  │   │
│  │  └────────┬────────┘    └────────┬────────┘    └───────┬───────┘  │   │
│  │           │                      │                      │         │   │
│  │           └──────────────────────┴──────────────────────┘         │   │
│  │                              │                                    │   │
│  │                              ▼                                    │   │
│  │                    hsem_irq[0]  hsem_irq[1] ... hsem_irq[N]         │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │              Multi-Port APB Slave Interface                         │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │  • PCLK / PRESETn                                                  │   │
│  │  • PADDR[11:0]  → 4 KB register space                              │   │
│  │  • PSEL[3:0]    → 4 independent select lines (Core0/1/DMA/DSP)     │   │
│  │  • PWDATA / PRDATA / PWRITE / PENABLE                             │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 11.1.2 多核仲裁拓扑

在典型双核 SoC 中，CPU Core 0 与 Core 1 通过 AXI 交叉开关连接到 APB 桥，进而访问 HW Semaphore 的 APB 从端口。HSEM 的 APB 接口层可配置 4 条独立的 PSEL 选择线，分别对应 Core 0、Core 1、DMA 控制器和 DSP 四个总线 Master。各 Master 共享同一 4 KB 寄存器地址空间，但原子操作控制单元内部的硬件仲裁器确保同一时钟周期内仅处理一个 Master 对同一信号量的访问请求。仲裁器采用固定优先级方案，Master ID 数值小的请求者优先获得授权；若同一周期内不同 Master 访问不同信号量，则请求可并行处理，因为 32 个信号量各自拥有独立的 LOCK/COREID/PROCID 状态寄存器，不存在结构竞争。

### 11.2 工作原理

#### 11.2.1 Read-to-Claim 原子操作

HW Semaphore 的锁获取操作通过 Read-to-Claim 协议实现原子性。软件读取 HSEM_RLRx（Read Lock Register）时，硬件仲裁器在总线读事务的同一周期内完成三步操作：采样当前信号量的 LOCK 位状态；若 LOCK=0，则硬件自动置位 LOCK=1，并将当前 Master 的 COREID 和软件预设的 PROCID 写入对应位域；最后将操作结果通过读数据总线返回给请求者。若读返回值为 0x0000_0000，表示获取成功，请求者已成为该信号量的持有者；若读返回非零值，则表明该信号量已被占用，返回值中包含当前持有者的 COREID（位 [11:8]）、PROCID（位 [7:1]）和 LOCK=1（位 [0]）。软件在获取失败后，可选择忙等待（自旋）轮询同一寄存器，或进入睡眠态并依赖中断通知机制唤醒。RLR 寄存器的设计核心在于将读操作与锁获取合并为单一不可中断的硬件事务，彻底消除了软件方案中"读-判断-写"序列之间的竞态窗口。

#### 11.2.2 Write-to-Release 机制

信号量的释放通过 Write-to-Release 协议完成。软件向 HSEM_Rx 寄存器写入包含自身 COREID 和 PROCID 的数据字，硬件比较器将该写入数据中的 COREID/PROCID 与信号量内部存储的持有者标识进行比对，仅在完全匹配的情况下才将 LOCK 位清 0 完成解锁。这一匹配机制防止了非持有者意外释放信号量，避免了因软件缺陷导致的临界区保护失效。若 COREID 匹配失败，硬件静默忽略该写操作，信号量保持锁定状态。对于需要更高安全等级的场景，HSEM_CR 寄存器的 KEYEN 位可启用密钥保护模式；此时释放操作要求软件在写 HSEM_Rx 之前，先向 HSEM_KEYR 寄存器写入正确的 32 位解锁密钥，硬件在密钥匹配后才允许执行 COREID/PROCID 比对和解锁。

#### 11.2.3 中断通知机制

当信号量被持有者释放（LOCK 位从 1 变为 0）时，中断生成器检测该下降沿事件，并查询各核心的中断使能寄存器 HSEM_CxIER。若某核心已使能该信号量对应位（IER[n]=1），则硬件将该核心的 HSEM_CxISR 寄存器中的对应位置 1，并向该核心的中断控制器（NVIC 或 GIC）发送 hsem_irq[x] 中断请求。等待该信号量的核心从中断服务程序中读取 HSEM_CxMISR（屏蔽后中断状态，等于 ISR & IER），确定是哪个信号量被释放，随后立即读取该信号量的 RLR 寄存器尝试获取锁。中断通知机制将自旋等待转换为事件驱动，显著降低了获取失败时的总线带宽消耗和功耗。

### 11.3 软件可见寄存器

#### 11.3.1 信号量操作寄存器与全局控制寄存器

32 个信号量各自拥有一对操作寄存器：可读写的 HSEM_Rx 用于状态查询和受保护释放，以及只读的 HSEM_RLRx 用于原子性读-取锁。全局控制寄存器 HSEM_CR 和 HSEM_KEYR 提供核心身份配置和密钥保护功能。下表汇总了这些寄存器的偏移地址、位域定义、访问属性、复位值及功能描述。

| 偏移地址 | 寄存器名 | 位域 | 读写属性 | 复位值 | 功能描述 |
|:---|:---|:---|:---|:---|:---|
| 0x000 | HSEM_R0 | [0] LOCK | R/W | 0x0000_0000 | 信号量 0 锁定状态：1=已锁定，0=空闲 |
| | | [7:1] PROCID | R/W | 0x00 | 占用者进程标识符（0~127） |
| | | [11:8] COREID | R/W | 0x0 | 占用者核心标识符（0~15） |
| | | [31:12] Reserved | — | 0x00000 | 保留，读返回 0，写忽略 |
| 0x004~0x07C | HSEM_R1~R31 | [11:0] | R/W | 0x000 | 信号量 1~31，位域结构同 HSEM_R0 |
| 0x080 | HSEM_RLR0 | [0] LOCK | R | 0x0000_0000 | 读锁寄存器 0：读操作同时硬件尝试置位 LOCK；返回 0=获取成功，1=已被占用 |
| | | [7:1] PROCID | R | 0x00 | 当前占用者进程 ID（若返回 0 则表示当前获取成功） |
| | | [11:8] COREID | R | 0x0 | 当前占用者核心 ID |
| | | [31:12] Reserved | — | 0x00000 | 保留 |
| 0x084~0x0FC | HSEM_RLR1~RLR31 | [11:0] | R | 0x000 | 读锁寄存器 1~31，结构同 HSEM_RLR0 |
| 0x140 | HSEM_CR | [7:0] COREID | R/W | 0x00 | 当前访问核心 ID 配置；软件在初始化时写入本核心的 Master ID |
| | | [8] KEYEN | R/W | 0 | 密钥保护全局使能：1=启用 HSEM_KEYR 解锁检查，0=禁用 |
| | | [31:9] Reserved | — | 0x000000 | 保留 |
| 0x144 | HSEM_KEYR | [31:0] KEY | W | 0x0000_0000 | 解锁密钥寄存器；仅在 KEYEN=1 时有效，写入正确密钥后下一次 HSEM_Rx 写操作才被接受 |

HSEM_Rx 与 HSEM_RLRx 的关键区别在于访问语义：HSEM_Rx 的读操作仅返回当前状态而不改变锁状态，写操作仅在 COREID/PROCID 匹配（且密钥校验通过）时才能解锁；HSEM_RLRx 的读操作则在返回数据的同时原子性地尝试获取锁，写操作对该寄存器无效。

#### 11.3.2 每核心中断寄存器

HW Semaphore 为每个可连接的核心提供一组独立的中断控制寄存器，以 Core 0 为例，基地址偏移从 0x100 开始。每组包含中断使能（IER）、中断清除（ICR）、中断状态（ISR）和屏蔽后中断状态（MISR）四个 32 位寄存器，每个位对应一个信号量的释放事件。双核系统需要两组共 8 个寄存器，占据 0x100~0x11F 的地址空间。

| 偏移地址 | 寄存器名 | 位域 | 读写属性 | 复位值 | 功能描述 |
|:---|:---|:---|:---|:---|:---|
| 0x100 | HSEM_C0IER | [31:0] IEn | R/W | 0x0000_0000 | Core 0 中断使能：bit[n]=1 使能 Semaphore n 的释放中断 |
| 0x104 | HSEM_C0ICR | [31:0] ICn | W1C | 0x0000_0000 | Core 0 中断清除：写 1 清除 HSEM_C0ISR 对应位，写 0 无影响 |
| 0x108 | HSEM_C0ISR | [31:0] ISn | R | 0x0000_0000 | Core 0 中断状态：bit[n]=1 表示 Semaphore n 已被释放且触发了中断事件 |
| 0x10C | HSEM_C0MISR | [31:0] MIn | R | 0x0000_0000 | Core 0 屏蔽后中断状态：MISR = ISR & IER，反映实际向中断控制器上报的有效中断位 |
| 0x110 | HSEM_C1IER | [31:0] IEn | R/W | 0x0000_0000 | Core 1 中断使能，结构同 HSEM_C0IER |
| 0x114 | HSEM_C1ICR | [31:0] ICn | W1C | 0x0000_0000 | Core 1 中断清除，结构同 HSEM_C0ICR |
| 0x118 | HSEM_C1ISR | [31:0] ISn | R | 0x0000_0000 | Core 1 中断状态，结构同 HSEM_C0ISR |
| 0x11C | HSEM_C1MISR | [31:0] MIn | R | 0x0000_0000 | Core 1 屏蔽后中断状态，结构同 HSEM_C0MISR |

中断生成逻辑按以下规则工作：当任意 Semaphore n 的 LOCK 位发生 1→0 跳变时，硬件将 HSEM_C0ISR[n] 和 HSEM_C1ISR[n] 同时置 1（若存在更多核心则同理）。随后，各核心的 MISR 寄存器在内部执行 ISR 与 IER 的按位与运算，仅当 MISR[n]=1 时才向该核心的中断控制器发送中断请求。软件在中断服务程序中应读取 MISR 确定有效中断源，在成功获取对应信号量后向 ICR 写入相应位清除中断标志，避免中断线持续有效。

#### 11.3.3 全局控制寄存器

HSEM_CR 寄存器中的 COREID 位域（[7:0]）由软件在系统初始化阶段写入当前核心的唯一标识。该值会作为硬件仲裁器在 RLR 读操作中自动填充到信号量 COREID 位域的源数据，同时也是 Write-to-Release 比对操作的参考基准。在支持 TrustZone 的系统中，Secure 世界与 Non-Secure 世界可通过配置不同的 COREID 空间（例如 Secure 核心使用 0x0~0x7，Non-Secure 使用 0x8~0xF）实现信号量访问的安全隔离。HSEM_KEYR 寄存器提供额外的释放保护：当 HSEM_CR[KEYEN]=1 时，任何对 HSEM_Rx 的写解锁操作都要求软件在最近的 256 个 APB 周期内向 HSEM_KEYR 写入过有效密钥；否则硬件静默丢弃该写事务。密钥机制防止了因软件误操作或恶意代码导致的信号量非法释放，适用于汽车电子和工业控制等高安全需求场景。


---

# 12. Timer — 通用定时器/计数器

通用定时器（General-Purpose Timer, GPT）是 SoC 外设层中最基础的时间基准单元，承担操作系统节拍（OS Tick）分发、延时生成、事件时间戳捕获、PWM 波形输出及硬件级联计数等职责。本章描述一套四通道 Timer IP 的完整架构，每通道独立配置，且 Timer0 与 Timer1 支持级联为 64-bit 宽计数器。

## 12.1 内部架构与框图

### 12.1.1 Timer 模块框图（单通道）

单通道 Timer 的数据通路从 APB 总线接口进入，经寄存器文件译码后，分别驱动预分频器、计数器与比较/捕获逻辑，最终汇聚至中断生成单元。数据流用 `──▶` 表示，控制流用 `───` 表示。

```
                              APB4 Bus (PCLK/PRESETn)
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │     APB Interface &          │
                    │     Address Decoder          │
                    └──────────────┬───────────────┘
                                   │ Register Write / Read
                                   ▼
                    ┌──────────────────────────────┐
                    │      Register File (per ch)    │
                    │  ┌────────┐ ┌────────┐       │
                    │  │ LOAD   │ │ CTRL   │       │
                    │  │ BGLOAD │ │ CMP    │       │
                    │  │ CASCADE│ │ CAP    │       │
                    │  └────┬───┘ └───┬────┘       │
                    └───────┼─────────┼────────────┘
                            │         │
              ┌─────────────┘         └─────────────┐
              │                                       │
              ▼                                       ▼
    ┌──────────────────┐                  ┌──────────────────┐
    │   8-bit Prescaler│                  │  Compare/Capture │
    │   (Div = PRE+1)  │                  │     Logic        │
    │                  │◀── PRE[7:0] ────│                  │
    └────────┬─────────┘                  │  ◀── CMP[31:0]   │
             │                             │  ◀── CAP_CTRL    │
             ▼                             └────────┬─────────┘
    ┌──────────────────┐                            │
    │  32-bit Counter  │◀── LOAD[31:0]              │ Match/Capture
    │  Up/Down counting│◀── Enable / Mode            │ Event
    │  VALUE[31:0]     │──▶ To APB read bus         ▼
    │  OV (Overflow)   │──▶ To Cascade Logic  ┌──────────────────┐
    └────────┬─────────┘                      │  Interrupt Gen   │
             │                                │  ┌────┐ ┌────┐  │
             │                                │  │RIS │ │MIS │  │
             │ Overflow (periodic mode)       │  └────┘ └────┘  │
             │ Reload from LOAD                 └────────┬────────┘
             │                                         │
             └───────────────────────────────────────────┘
                                   │
                                   ▼
                           Timerx_IRQ_OUT
```

**APB 接口与译码单元**将 32-bit APB 读写转换为寄存器访问脉冲，未使用位读取返回 0。**预分频器**接收 PCLK，由 8-bit 分频值 `PRE[7:0]` 产生 `TimerCLK = PCLK / (PRE + 1)`；`PRE = 0` 时分频比为 1。**32-bit 计数器**在使能后每个 TimerCLK 周期递增或递减，计数值实时映射到只读寄存器 `TMRx_VALUE`。**比较/捕获逻辑**检测 `VALUE == CMP` 产生匹配事件，并在捕获引脚边沿触发时将 `VALUE` 锁存到 `TMRx_CAP`。**中断生成单元**对匹配、溢出和捕获事件进行逻辑或运算，经中断使能位屏蔽后输出到中断控制器。

### 12.1.2 多通道级联架构

本 IP 集成四个独立通道，每通道寄存器组占 0x20 字节。Timer0 与 Timer1 之间嵌入级联逻辑：Timer0 的计数器溢出时产生单周期脉冲，作为 Timer1 的额外时钟输入。Timer1 的 `CASCADE_EN` 位置 1 后，仅响应级联脉冲而忽略 PCLK，两通道拼接为 `{TMR1_VALUE, TMR0_VALUE}` 的 64-bit 递增计数器。Timer2 与 Timer3 保持独立运行，但均保留外部 I/O 引脚映射，可将 `TMRx_OUT` 映射到 GPIO 复用引脚，或将外部引脚信号作为 `TMRx_IN` 捕获源。

## 12.2 工作原理

### 12.2.1 自由运行与周期模式

自由运行模式下，计数器从 0x00000000 递增，到达 0xFFFFFFFF 后回绕至 0x00000000，不触发重载。若 `INTEn` 置位，溢出时产生中断，但计数器继续运行。周期模式下，计数器从 `TMRx_LOAD` 递减至 0，产生溢出事件后自动重载并继续递减，是 OS Tick 的标准实现。周期公式为 `T_period = (LOAD + 1) × (PRE + 1) / f_PCLK`。`TMRx_CTRL[10]` 置 1 使能单次模式：计数器递减至 0 后自动停止，需软件重新写入 `LOAD` 并置位使能位方可再次启动。

### 12.2.2 输入捕获模式

输入捕获模式下，外部引脚 `TMRx_IN` 的有效边沿（上升/下降/双边沿，由 `CTRL[7:6]` 选择）触发捕获逻辑，将当前 32-bit 计数值原子性锁存到 `TMRx_CAP`，同时置位捕获中断标志。两次连续捕获值的差值即为被测事件的时间间隔：`Δt = (CAP2 − CAP1) × (PRE + 1) / f_PCLK`。若两次捕获之间发生溢出，软件需根据溢出中断计数进行回绕补偿。典型应用包括脉冲宽度测量、超声波回波时间测量及 IR 协议解码。

### 12.2.3 输出比较与 PWM 模式

输出比较模式持续检测 `VALUE` 与 `TMRx_CMP` 的相等关系；匹配时根据 `CTRL[9:8]` 执行置位、清零、翻转或单脉冲输出，可生成非对称波形。PWM 模式是输出比较的特例：计数器从 0 递增至 `LOAD` 后重置，周期内 `VALUE < CMP` 时输出高电平，否则输出低电平。PWM 频率 `f_PWM = f_PCLK / ((PRE + 1) × (LOAD + 1))`，占空比 `D = CMP / (LOAD + 1)`。Timer 内置 PWM 不支持死区插入与互补输出，驱动功率级需选用专用 PWM IP。

### 12.2.4 级联 64-bit 模式

级联模式解决单 32-bit 计数器计时范围受限的问题。Timer0 配置为自由运行递增，其溢出驱动 Timer1 的时钟输入；Timer1 使能级联后仅响应级联脉冲。软件通过两次 APB 读取获取 64-bit 值，但存在读取过程中 Timer0 溢出导致不一致的风险。硬件通过 `TMR0_CASCADE[2]`（Snapshot）提供快照机制：写 1 后硬件将 `{TMR1_VALUE, TMR0_VALUE}` 锁存到影子寄存器，后续读取返回影子值，保证读一致性。64-bit 级联最大计时为 `(2^64 − 1) × (PRE + 1) / f_PCLK`，在 100 MHz PCLK 下约为 5845 年。

## 12.3 软件可见寄存器

每通道占 0x20 字节地址空间，四个通道基址依次为 `BASE + 0x000`、`0x020`、`0x040`、`0x060`。以下以 Timer0（偏移相对通道基址）为例，所有通道寄存器结构相同。

### 12.3.1 配置与加载寄存器

表 12-1 汇总控制 Timer 工作模式的配置与加载寄存器。`TMR0_CTRL` 覆盖使能、模式、预分频、中断使能及调试挂停；`TMR0_LOAD` 与 `TMR0_BGLOAD` 分别提供即时重载与后台缓冲重载；`TMR0_CASCADE` 控制级联时钟源与快照。

**表 12-1 Timer0 配置与加载寄存器**

| 偏移地址 | 寄存器名 | 位域 | 属性 | 复位值 | 功能描述 |
|:---:|---|:---|:---:|:---:|---|
| `0x00` | **TMR0_LOAD** | `[31:0]` | R/W | `0x00000000` | 计数器加载/重载值。写入立即加载到计数器；周期模式下递减至 0 后自动从此寄存器恢复初值 |
| `0x08` | **TMR0_CTRL** | `[0]` TimerEn | R/W | `0` | 计数器使能：1 = 运行；0 = 停止并保持当前值 |
| | | `[1]` TimerMode | R/W | `0` | 0 = 自由运行递增；1 = 周期递减模式（从 LOAD 递减至 0 后重载） |
| | | `[2]` INTEn | R/W | `0` | 中断使能：1 = 允许溢出/匹配/捕获事件产生中断 |
| | | `[3]` INTType | R/W | `0` | 中断类型：0 = 电平中断；1 = 脉冲中断 |
| | | `[5:4]` Prescale | R/W | `0` | 预分频：00 = /1；01 = /16；10 = /256；11 = /1（保留） |
| | | `[7:6]` CapEdge | R/W | `0` | 捕获边沿：00 = 禁用；01 = 上升沿；10 = 下降沿；11 = 双边沿 |
| | | `[9:8]` OutMode | R/W | `0` | 输出比较动作：00 = 无动作；01 = 置位；10 = 清零；11 = 翻转 |
| | | `[10]` OneShot | R/W | `0` | 单次模式：1 = 周期模式仅执行一次，递减至 0 后自动停止 |
| | | `[11]` DbgHalt | R/W | `0` | 调试挂停：1 = 调试器 halt CPU 时计数器暂停 |
| | | `[15:12]` | — | R | `0` | 保留位，读返回 0 |
| `0x18` | **TMR0_BGLOAD** | `[31:0]` | R/W | `0x00000000` | 后台重载值。写入不立即生效；当前周期结束后下一周期从此值加载，实现 PWM 无撕裂更新 |
| `0x24` | **TMR0_CASCADE** | `[0]` CascadeEn | R/W | `0` | 级联使能：1 = Timer1 使用 Timer0 溢出作为时钟源 |
| | | `[1]` CascadeSrc | R/W | `0` | 级联源选择：0 = Timer0 溢出；1 = 外部级联输入引脚（保留） |
| | | `[2]` Snapshot | W/O | `0` | 快照触发：写 1 将当前 64-bit 计数值锁存到影子寄存器 |
| | | `[31:3]` | — | R | `0` | 保留位 |

### 12.3.2 计数与比较寄存器

`TMR0_VALUE` 实时反映计数器当前值，但 APB 读事务存在 2~3 个 PCLK 周期延迟，绝大多数场景可忽略。`TMR0_CMP` 存储比较阈值，在输出比较和 PWM 模式下决定输出翻转时刻。`TMR0_CAP` 在捕获事件发生时由硬件自动更新，软件读取即可获得外部事件时间戳。

### 12.3.3 中断寄存器

Timer 中断遵循标准分层模型：`TMR0_RIS` 反映硬件事件真实状态，不受中断使能影响；`TMR0_MIS` 为 `RIS & INTEn` 的结果，直接驱动中断输出线。`TMR0_INTCLR` 为只写清除寄存器，写入任意值即可清除 pending 标志。中断源包含溢出/下溢、输出比较匹配、输入捕获事件三类，共享同一根中断线，软件需在 ISR 中读取 `RIS` 以区分原因。

**表 12-2 Timer0 计数、比较、捕获与中断寄存器**

| 偏移地址 | 寄存器名 | 位域 | 属性 | 复位值 | 功能描述 |
|:---:|---|:---|:---:|:---:|---|
| `0x04` | **TMR0_VALUE** | `[31:0]` | R/O | `0x00000000` | 当前 32-bit 计数值。递增模式下为 0~0xFFFFFFFF；递减模式下为剩余计数值 |
| `0x1C` | **TMR0_CMP** | `[31:0]` | R/W | `0x00000000` | 比较阈值。`VALUE == CMP` 时产生匹配事件，执行输出动作并置位中断标志 |
| `0x20` | **TMR0_CAP** | `[31:0]` | R/O | `0x00000000` | 捕获值。捕获引脚有效边沿触发时硬件自动锁存当前 `VALUE` |
| `0x0C` | **TMR0_INTCLR** | `[31:0]` | W/O | — | 中断清除。写任意值清除 `RIS` 和 `MIS`；不影响计数器运行 |
| `0x10` | **TMR0_RIS** | `[0]` TimerRIS | R/O | `0` | 原始溢出/匹配状态：1 = 递减至 0 或比较匹配已发生 |
| | | `[1]` CapRIS | R/O | `0` | 原始捕获状态：1 = 捕获事件已发生 |
| | | `[31:2]` | — | R | `0` | 保留位 |
| `0x14` | **TMR0_MIS** | `[0]` TimerMIS | R/O | `0` | 屏蔽后溢出/匹配状态：`TimerMIS = TimerRIS & INTEn` |
| | | `[1]` CapMIS | R/O | `0` | 屏蔽后捕获状态：`CapMIS = CapRIS & INTEn` |
| | | `[31:2]` | — | R | `0` | 保留位 |

软件配置周期中断的标准流程为：向 `TMR0_LOAD` 写入周期初值，配置 `TMR0_CTRL` 的 `TimerMode=1`、`INTEn=1` 及所需 `Prescale`，最后置位 `TimerEn=1`。计数器启动后每个周期结束置位 `TimerRIS`，经屏蔽后通过 `TimerMIS` 向 NVIC/GIC 发中断请求；ISR 执行后向 `TMR0_INTCLR` 写任意值清除 pending。PWM 动态调占空比时应修改 `TMR0_BGLOAD`，硬件在当前周期边界自动切换至新参数。


---

## 13. Watchdog — 看门狗定时器

看门狗定时器（Watchdog Timer, WDT）是 SoC 中用于检测软件故障并强制恢复系统运行的独立硬件监控模块。其核心价值在于：当 CPU 因程序跑飞、死循环或堆栈溢出而丧失正常执行能力时，WDT 能够在预定时间内自主触发系统复位，将 SoC 恢复至已知初始状态。与第 12 章介绍的通用定时器不同，WDT 不依赖系统主时钟，而是运行在独立的低速时钟域中，确保即使主时钟源失效、CPU 停止响应，监控功能仍可正常运作。本章从内部架构、工作机制和软件寄存器三个层面，阐述一个具备窗口喂狗、写保护锁和调试暂停能力的 32 位 WDT IP 设计。

### 13.1 内部架构与框图

#### 13.1.1 内部模块结构与数据流

WDT 的内部架构围绕一条清晰的数据通路展开：独立时钟源驱动预分频器，预分频器输出送入 32 位递减计数器，计数器当前值同时送往窗口比较器和零值比较器，比较结果经过复位控制逻辑产生系统复位信号。APB 配置接口作为软件访问通道，通过异步桥接跨越时钟域，连接到寄存器文件。以下框图展示了各子模块的连接关系与数据流向：

```
                    独立时钟源 WDT_CLK (32kHz RC / Xtal)
                           │
                           ▼
                ┌─────────────────────┐
                │    Clock Mux        │◀──── WDT_CTRL[5:4] (时钟源选择)
                │ (32kHz / 1kHz /     │
                │  外部测试时钟)      │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │    Prescaler        │◀──── WDT_PRESCALE[7:0] (分频系数)
                │  WDT_CLK/(N+1)      │      N = 0~255，典型 /32 /128
                └──────────┬──────────┘
                           │ WDT_CNT_CLK
                           ▼
        ┌─────────────────────────────────────────────────────┐
        │           32-bit 递减计数器核心                   │
        │  ┌─────────────┐        ┌─────────────┐           │
        │  │  WDT_LOAD   │──加载──▶│  WDT_VALUE  │──递减──▶ 0│
        │  │  (重载初值) │        │ (当前计数值) │           │
        │  └─────────────┘        └──────┬──────┘           │
        └──────────────────────────────┼───────────────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              │                        │                        │
              ▼                        ▼                        ▼
        ┌──────────┐           ┌──────────┐           ┌──────────────┐
        │ Window   │◀─WINDOW  │ Compare  │           │   Reset      │
        │Compare   │           │ (== 0)   │──▶INT──▶ │   Control    │
        │(VALUE >  │           │触发      │           │  (RST_OUT)   │
        │ WINDOW?) │           │WDT_INT   │           │  系统复位    │
        └────┬─────┘           └──────────┘           └──────────────┘
             │                                                    │
             ▼ 过早喂狗错误                                       ▼
       WDT_STATUS[0]                                        WDOGRES
       (EarlyErr flag)                                    (SoC 全局复位)

      ════════════════════════════════════════════════════════════
                              喂狗通路
      ════════════════════════════════════════════════════════════

    CPU/APB ──▶ Write 0x1ACCE551 ──▶ WDT_LOCK ──▶ 解锁状态
                                              │
                                              ▼
    CPU/APB ──▶ Write WDT_FEED_SEQ ──▶ 序列比较器 ──▶ 计数器重载
                                               │        (VALUE ← LOAD)
                                               ▼
                                         WDT_STATUS[2] Locked=0
```

框图中的六个关键子模块承担不同的硬件职责。Clock Mux 负责在 32kHz 内部 RC 振荡器、外部 32.768kHz 晶振和测试时钟之间进行选择，由 WDT_CTRL 寄存器的时钟源选择位控制。Prescaler 对选中的时钟进行可编程分频，分频系数 N 取值范围为 0 至 255，计数器实际时钟频率为 WDT_CLK/(N+1)，这一设计兼顾了短超时检测（高分辨率）和长超时覆盖（低频率）两种场景。32 位递减计数器是 WDT 的核心运算单元，上电复位后处于冻结状态，软件配置 WDT_LOAD 初值并置位使能位后，计数器在每个 WDT_CNT_CLK 上升沿减 1，直至归零。窗口比较器持续将 WDT_VALUE 与 WDT_WINDOW 阈值比较，当软件执行喂狗操作时，若当前计数值大于窗口值，比较器输出"过早喂狗"错误标志。复位控制模块在检测到计数器归零或过早喂狗错误时，产生宽度可配置的 WDOGRES 脉冲，该信号接入 SoC 顶层复位网络，可复位 CPU、总线矩阵、外设及存储控制器，但不影响 RTC 备份域和 WDT 自身配置（避免复位后丢失故障原因）。APB 异步桥接实现 APB 总线时钟（PCLK）与 WDT_CLK 之间的跨时钟域（CDC）安全握手，确保寄存器读写不会出现亚稳态传播。

#### 13.1.2 独立时钟域与复位域设计

WDT 的独立性体现在两个维度。时钟维度上，WDT_CLK 源自芯片内部的 32kHz RC 振荡器或外部 32.768kHz 晶振，与系统主时钟 HCLK/PCLK 完全异步。这一设计确保当 PLL 失锁、时钟门控关闭或主时钟树因功耗管理而停振时，WDT 仍可维持计数。APB 寄存器访问通过双触发器同步链完成 CDC，写操作在 WDT_CLK 域被采样后执行，读操作则通过握手协议将 WDT_VALUE 等状态安全传回 PCLK 域。复位维度上，WDT 的复位输出连接到系统全局复位控制器，但其自身寄存器组通常位于独立的复位域中——系统复位不会清除 WDT 状态寄存器中的故障标志，便于启动后的故障诊断。调试维度上，WDT_CTRL 寄存器集成 DbgHalt 控制位；当调试器通过 CoreSight 挂起 CPU 时，若该位置 1，WDT 计数器同步暂停，防止调试会话中因未及时喂狗而触发非预期的系统复位。

### 13.2 工作原理

#### 13.2.1 超时复位机制

WDT 的基础工作模式是递减计数超时复位。软件在初始化阶段向 WDT_LOAD 写入超时初值（例如 32kHz 时钟下写入 32000 对应 1 秒超时），置位 WDT_CTRL 的 WDT_EN 和 RST_EN 位，计数器随即开始递减。正常运行期间，软件需在计数器到达 0 之前执行喂狗操作，使计数器重载为 WDT_LOAD 值并继续运行。若软件因故障丧失喂狗能力，计数器持续递减至 0，零值比较器检测到该事件后，复位控制模块产生 WDOGRES 脉冲。该脉冲的宽度由 WDT_RSTCNT 寄存器配置，典型值为 4~256 个 WDT_CLK 周期，确保复位信号在整个 SoC 中充分传播并稳定。超时复位将系统恢复至初始状态，但不复位 RTC 备份域（VBAT 域），以维持实时时钟和备份寄存器的连续性。

#### 13.2.2 窗口喂狗机制

传统的"在超时前任意时刻喂狗"机制存在一个安全漏洞：若程序陷入一个恰好包含喂狗操作的快速循环，WDT 将永远无法触发复位，故障被掩盖。窗口喂狗机制通过引入时间窗口下限消除了这一漏洞。WDT_WINDOW 寄存器定义了一个介于 0 和 WDT_LOAD 之间的阈值，构成双重判定边界：当软件执行喂狗时，若当前 WDT_VALUE 大于 WDT_WINDOW（过早喂狗），或者 WDT_VALUE 已经等于 0（过晚喂狗/超时），窗口比较器均判定喂狗无效，并触发系统复位。只有在 WDT_VALUE 小于或等于 WDT_WINDOW 且大于 0 的区间内执行喂狗，才会被接受为重载计数器的合法操作。这一"时间窗口"迫使软件必须在经过一段最低运行时间后才能喂狗，有效防止了异常快速循环中的"侥幸"喂狗。

#### 13.2.3 写保护机制

WDT 的关键配置寄存器（WDT_CTRL、WDT_LOAD、WDT_WINDOW、WDT_PRESCALE）受 WDT_LOCK 写保护寄存器控制，防止软件误写或恶意篡改监控参数。上电默认状态下 WDT_LOCK 处于锁定态（Locked=1），所有受保护寄存器表现为只读。解锁需要向 WDT_LOCK 写入 32 位特定密钥序列 0x1ACCE551（该十六进制值的选取基于其位模式在典型代码执行流中极难偶然出现）。写操作在 WDT_CLK 域被采样验证后，锁定状态翻转，软件获得一次完整的配置窗口。部分增强型设计在喂狗成功后自动回锁，要求每次重新配置前均需再次执行解锁序列，进一步提升安全等级。若向 WDT_LOCK 写入任何非密钥值，寄存器立即锁定（或保持锁定），写操作本身不产生总线错误响应，但由 WDT_STATUS 的 Locked 标志反映当前状态。

### 13.3 软件可见寄存器

WDT IP 通过 APB 从接口暴露一组 32 位寄存器，基址记为 WDT_BASE。所有寄存器按字对齐，访问宽度为 32 位。以下两张表格分别汇总配置寄存器组和状态/中断寄存器组的详细定义。

**表 13-1 WDT 配置与喂狗寄存器**

| 寄存器名称 | 偏移地址 | 位域 | 读写属性 | 复位值 | 功能描述 |
|:---|:---|:---|:---|:---|:---|
| WDT_CTRL | `0x00` | `[0]` WDT_EN | R/W | `0x0` | 看门狗使能。1=计数器开始递减；0=计数器冻结，保持当前值 |
| | | `[1]` RST_EN | R/W | `0x0` | 复位使能。1=计数到0产生WDOGRES系统复位；0=仅产生中断 |
| | | `[2]` INT_EN | R/W | `0x0` | 中断使能。1=允许计数到0时产生中断；与RST_EN可同时置位 |
| | | `[3]` DbgHalt | R/W | `0x0` | 调试暂停控制。1=CPU调试halt时WDT暂停计数；0=调试期间继续计数 |
| | | `[4]` WindowEn | R/W | `0x0` | 窗口机制使能。1=启用窗口喂狗检查；0=禁用窗口，仅超时判定 |
| | | `[5:4]` CLK_SEL | R/W | `0x0` | 时钟源选择。00=32kHz内部RC；01=32.768kHz外部晶振；10=测试时钟 |
| | | `[31:6]` Reserved | — | `0x0` | 保留，读返回0，写忽略 |
| WDT_PRESCALE | `0x04` | `[7:0]` PRESCALE | R/W | `0x00` | 预分频系数。计数器时钟频率 = WDT_CLK / (PRESCALE + 1)，范围 /1 ~ /256 |
| | | `[31:8]` Reserved | — | `0x0` | 保留 |
| WDT_LOAD | `0x08` | `[31:0]` LOAD | R/W | `0xFFFFFFFF` | 计数器重载值/超时阈值。32位递减初值，写入后在下一次喂狗或使能时加载 |
| WDT_WINDOW | `0x0C` | `[31:0]` WINDOW | R/W | `0x00000000` | 窗口下限值。WindowEn=1时，仅当计数器当前值≤WINDOW且>0时喂狗有效 |
| WDT_FEED | `0x10` | `[15:0]` FEED_SEQ | W/O | — | 喂狗序列寄存器。需按固定顺序写入双字节序列：先写0x55，在16个PCLK周期内再写0xAA |
| | | `[31:16]` Reserved | — | — | 保留，写忽略 |
| WDT_LOCK | `0x14` | `[31:0]` LOCK | R/W | `0x00000001` | 写保护锁。写入0x1ACCE551解锁；写入其他任意值锁定。读取返回当前锁定状态（0=解锁，非0=锁定） |
| WDT_RSTCNT | `0x18` | `[7:0]` RST_WIDTH | R/W | `0x0F` | 复位脉冲宽度。WDOGRES低电平有效脉冲宽度 = (RST_WIDTH + 1) × WDT_CLK周期，默认16周期 |
| | | `[31:8]` Reserved | — | `0x0` | 保留 |

**表 13-2 WDT 状态与中断寄存器**

| 寄存器名称 | 偏移地址 | 位域 | 读写属性 | 复位值 | 功能描述 |
|:---|:---|:---|:---|:---|:---|
| WDT_VALUE | `0x1C` | `[31:0]` VALUE | R/O | `0xFFFFFFFF` | 当前递减计数器值。读取返回 WDT_CLK 域的实时计数值，因 CDC 延迟可能存在±1个 WDT_CNT_CLK 的采样误差 |
| WDT_STATUS | `0x20` | `[0]` EarlyErr | R/O | `0x0` | 过早喂狗错误标志（sticky）。窗口模式下喂狗时计数器值>WINDOW，该位置1，需系统复位清除 |
| | | `[1]` LateErr | R/O | `0x0` | 超时复位标志（sticky）。计数器递减到0触发复位时置1，反映WDT是否已触发过超时事件 |
| | | `[2]` Locked | R/O | `0x1` | 当前锁定状态。1=配置寄存器被锁定；0=已解锁，允许修改 |
| | | `[3]` Running | R/O | `0x0` | 运行状态。1=计数器正在递减；0=计数器冻结或停止 |
| | | `[31:4]` Reserved | — | `0x0` | 保留 |
| WDT_INTCLR | `0x24` | `[31:0]` INTCLR | W/O | — | 中断清除寄存器。写任意值清除 WDT_RIS/MIS 中的中断挂起状态，不影响 EarlyErr/LateErr sticky 标志 |
| WDT_RIS | `0x28` | `[0]` RawInt | R/O | `0x0` | 原始中断状态。1=计数器已到达0且INT_EN=1，中断条件满足；不受中断屏蔽影响 |
| | | `[31:1]` Reserved | — | `0x0` | 保留 |
| WDT_MIS | `0x2C` | `[0]` MaskedInt | R/O | `0x0` | 屏蔽后中断状态。MaskedInt = RawInt AND INT_EN，反映实际送往中断控制器 NVIC/GIC 的信号状态 |
| | | `[31:1]` Reserved | — | `0x0` | 保留 |

WDT_VALUE 寄存器作为只读状态端口，其跨时钟域读取存在固有采样延迟，软件在评估剩余超时时间时应将±1个计数器时钟周期的误差纳入计算。WDT_STATUS 中的 EarlyErr 和 LateErr 标志采用 sticky 设计——一旦被置位，只能通过系统复位清除，软件无法通过写操作擦除故障记录，这一设计保证了故障审计的完整性。喂狗序列寄存器 WDT_FEED 的写入顺序具有严格的时序要求：先写入 0x55，随后在 16 个 PCLK 周期内写入 0xAA，序列比较器在两笔写操作均匹配后才触发电路重载计数器。若序列错误或超时，喂狗失败，计数器继续递减。这种双字节序列验证增加了误写触发喂狗的门限，与 WDT_LOCK 写保护形成双重安全屏障。


---

## 14. RTC — 实时时钟

### 14.1 内部架构与框图

#### 14.1.1 RTC 内部架构

RTC（Real Time Clock）是 SoC 中唯一需要跨越主电源生命周期持续运行的定时模块，其核心功能是在系统关机或深度休眠状态下维持墙钟时间（Wall-clock Time），并为操作系统和上层应用提供日历、定时唤醒及安全时间戳服务。图 14-1 展示了 RTC IP 的完整内部架构与数据流路径。

```
                        32.768 kHz 晶振输入
                        (Xtal_IN / Xtal_OUT)
                               │
                               ▼
                    ┌──────────────────────┐
                    │   时钟失效检测模块    │◀── RTC_CTRL.CLK_FAIL_IE
                    │   (Clock Monitor)     │──▶ CLK_FAIL_STS → INT
                    └───────────┬──────────┘
                                │
                                ▼
                    ┌──────────────────────┐
                    │   异步预分频器       │◀── RTC_PRESCALER[22:16]
                    │   PREDIV_A (7-bit)   │    PREDIV_A (1~128)
                    │   32.768kHz ──▶ 256Hz │
                    └───────────┬──────────┘
                                │
                                ▼
                    ┌──────────────────────┐
                    │   同步预分频器       │◀── RTC_PRESCALER[15:0]
                    │   PREDIV_S (16-bit)  │    PREDIV_S (0~32767)
                    │   256Hz ──▶ 1Hz      │
                    └───────────┬──────────┘
                                │
                                ▼
            ┌──────────────────────────────────────────────────┐
            │              时间/日期计数器组 (BCD 格式)         │
            │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐     │
            │  │SEC │ │MIN │ │HOUR│ │DAY │ │MON │ │YEAR│     │
            │  │0-59│ │0-59│ │0-23│ │1-31│ │1-12│ │0-99│     │
            │  └─┬─┘ └─┬─┘ └─┬─┘ └─┬─┘ └─┬─┘ └─┬─┘          │
            │    └──▶ 进位链 (秒→分→时→日→月→年) ──▶         │
            │              ▲                               │
            │              └──── 闰年逻辑 (2月天数修正)      │
            │  ┌────────────────────┐                       │
            │  │  WEEKDAY 计数器    │◀── 日进位自动更新       │
            │  │  (1~7, 周日=1)     │                       │
            │  └────────────────────┘                       │
            └──────────────────────────────────────────────────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
    ┌──────────────┐ ┌──────────┐ ┌──────────────┐
    │ 闹钟比较器 A  │ │ 闹钟比较器│ │  Tamper 检测  │
    │ ALRM_A_CTRL  │ │    B     │ │   模块        │
    │ (秒/分/时/日) │ │(秒/分/时/日)│ (开盖/电压/  │
    │ 掩码控制     │ │ 掩码控制  │ │ 温度/引脚)   │
    └──────┬───────┘ └─────┬────┘ └──────┬───────┘
           │               │             │
           ▼               ▼             ▼
    RTC_ALRM_A_IRQ   RTC_ALRM_B_IRQ   RTC_TAMP_IRQ
    (→ NVIC + PMU    (→ NVIC + PMU    (→ 备份寄存器擦除
     唤醒控制器)      唤醒控制器)      + 时间戳记录)

    ┌──────────────────────────────────────────────────┐
    │              VBAT 备份域 (独立电源)                 │
    │  ┌────┐ ┌────┐        ┌────┐ ┌────┐              │
    │  │BKP0│ │BKP1│  ...   │BKP14│ │BKP15│            │
    │  │32b │ │32b │        │32b  │ │32b  │            │
    │  └────┘ └────┘        └────┘ └────┘              │
    │  Tamper 事件触发时可选自动擦除                    │
    └──────────────────────────────────────────────────┘
```

*图 14-1：RTC 内部架构框图*

框图左侧的时钟链路遵循典型的两级分频架构：32.768 kHz 晶振经过异步预分频器（Asynchronous Prescaler, PREDIV_A）降至中间频率（通常为 256 Hz 或 1 kHz），再由同步预分频器（Synchronous Prescaler, PREDIV_S）精确分频到 1 Hz。两级分频的设计动机在于功耗与精度的权衡——PREDIV_A 以较高频率运行但逻辑极简（7 位计数器），PREDIV_S 在较低频率下运行 16 位计数器，整体动态功耗被显著压低。分频链输出的 1 Hz 脉冲驱动时间计数器组的秒寄存器 RTC_SEC，并通过进位链依次触发分、时、日、月、年的递增。日进位同时驱动 WEEKDAY 计数器，以 7 为模循环。闰年逻辑模块监测 YEAR 寄存器值，在每年 2 月判定是否需要将 RTC_DAY 的上限从 28 扩展至 29，确保日历正确性。闹钟比较器 A 与 B 独立运行于计数器组下游，各自将预设的秒、分、时、日字段与实时计数器值进行逐位比较，掩码位（Mask）决定哪些字段参与匹配判定，未掩码字段比较全部相等时即触发对应的闹钟事件。Tamper 检测模块并行监听来自外部物理传感器的异常信号，检测事件被锁存的同时，当前时间值被捕获至 Tamper 时间戳寄存器组。

#### 14.1.2 备份域设计

RTC 核心逻辑、Tamper 检测电路以及 16 个备份寄存器（BKP_0~BKP_15）统一布局于 VBAT 供电域，与主系统 VDD 域通过电源切换器（Power Switch）隔离。该切换器通常为模拟开关或集成在 PMU 中的电源多路复用器，其控制逻辑持续监测 VDD 电压；当 VDD 跌落至阈值以下（典型值约 1.2~1.5 V，取决于工艺节点），切换器在数微秒内将 RTC 域的供电路径从 VDD 切换至 VBAT（纽扣电池，典型 3 V 锂锰电池），切换过程设计为 make-before-break 时序以避免供电 glitch。主电源恢复后，切换器自动回切至 VDD 路径，VBAT 仅作为备用。此架构使 RTC 在主系统完全断电时仍维持计时，VBAT 域静态电流典型值为 1~3 μA（含 32.768 kHz 晶振驱动），一枚 CR2032 纽扣电池可支持数年不间断运行。所有位于 VBAT 域的寄存器在设计上采用全静态 CMOS 单元或 Retention Latch，确保无时钟状态下数据保持。

#### 14.1.3 Tamper 检测模块

Tamper 检测是 RTC 在安全场景下的核心附加功能，其目标是检测对设备物理完整性的非法入侵并在第一时间记录入侵时间。检测源包括四类：开盖检测（Anti-tamper Switch，封装开启时机械开关断开）、电压异常（VDD 跌落或毛刺超出容忍带）、温度异常（芯片温度偏离正常工作区间）、外部引脚状态变化（EVIN1~EVIN3 专用篡改检测输入引脚）。每路输入经过可配置的数字消抖滤波器（采样窗口典型 2~8 个 RTC 时钟周期），滤除电磁干扰导致的虚假跳变。一旦滤波器判定有效事件，硬件自动执行三项操作：置位 RTC_TAMP_STS 中对应标志位、将当前 RTC_SEC~RTC_YEAR 值锁存至 RTC_TAMP_TS_SEC~RTC_TAMP_TS_YEAR 时间戳寄存器、若 RTC_TAMP_CTRL.ERASE_BKP 置位则异步擦除全部 16 个备份寄存器（写入 0）。Tamper 事件同时可作为中断源上报 NVIC，并在 Deep Sleep 或 Standby 模式下通过 PMU 唤醒控制器拉启系统电源。

### 14.2 工作原理

#### 14.2.1 时间维护机制

RTC 的时间基准由 32.768 kHz 晶振提供，该频率值为 2 的 15 次幂，天然适配二进制分频链。两级预分频器的输出频率由以下公式决定：

$$f_{1\text{Hz}} = \frac{32768}{(\text{PREDIV\_A} + 1) \times (\text{PREDIV\_S} + 1)}$$

典型配置取 PREDIV_A = 127、PREDIV_S = 255，即 32768 / 128 / 256 = 1 Hz。1 Hz 脉冲输入秒计数器 RTC_SEC，该计数器以 BCD（Binary-Coded Decimal）格式编码，有效范围为 0x00~0x59。秒计数器从 0x59 进位到 0x00 时产生分钟进位脉冲，驱动 RTC_MIN 递增；分进位驱动时，时进位驱动日，月进位驱动年。日计数器的上限值并非固定 31，而是由闰年逻辑和当前月份共同决定：1 月、3 月、5 月、7 月、8 月、10 月、12 月为 31 天，4 月、6 月、9 月、11 月为 30 天，2 月在平年为 28 天、闰年为 29 天。

闰年判断逻辑以公历（Gregorian Calendar）规则实现，对 BCD 编码的年份值（0~99，对应 2000~2099）执行以下判定：若年份能被 4 整除但不能被 100 整除，或能被 400 整除，则该年为闰年。由于 RTC_YEAR 的 8 位 BCD 编码覆盖 2000~2099 区间，在此范围内能被 100 整除的年份仅有 2000（BCD 0x00），而 2000 能被 400 整除，因此仍判定为闰年。2100 年超出本 RTC 的表示范围，故在实际硅实现中，闰年逻辑可简化为检测年份低两位（BCD 个位和十位）是否能被 4 整除，并将 0x00 年份硬编码为闰年。

#### 14.2.2 闹钟匹配机制

RTC 配备两组完全独立的闹钟 ALRM_A 和 ALRM_B，每组包含 4 个字段匹配寄存器（秒、分、时、日）和一个控制寄存器。闹钟匹配的核心是逐字段比较加掩码控制：RTC_ALRMx_SEC 的低 7 位存储目标秒值，第 7 位 MSK_SEC 为掩码位——当 MSK_SEC = 1 时，秒字段不参与匹配判定，视为"不关心"；MSK_SEC = 0 时，仅当实时秒计数器等于 ALRMx_SEC[6:0] 时秒字段匹配。分、时、日字段同理。四个字段的匹配结果经过与逻辑产生最终闹钟触发信号，即只有所有未掩码字段均匹配时闹钟才触发。

掩码机制赋予软件灵活的配置空间。例如，将 MSK_SEC 置 1、其余掩码清零，则闹钟在每分钟的指定秒时刻触发；将 MSK_SEC 与 MSK_MIN 均置 1，则闹钟在每小时指定分钟和秒时刻触发；若四个掩码全部置 1，则闹钟每秒触发一次，可作为 1 Hz 周期性唤醒源使用。闹钟触发后，硬件置位 RTC_INT_STS 中的对应标志位，若 RTC_INT_EN 中对应中断使能位已置位，则向 NVIC 发送中断请求；若 RTC_ALRMx_CTRL 中的 WKUP_EN 置位，则同时向 PMU 发送唤醒请求，将系统从 Deep Sleep 或 Standby 低功耗模式中唤醒。

#### 14.2.3 低功耗与唤醒

RTC 是 SoC 低功耗架构中的战略性组件。在 Deep Sleep 模式下，主时钟树（HCLK、PCLK）被门控关闭，CPU 与大部分外设停止工作，但 RTC 域因位于 VBAT 供电路径而继续以 32.768 kHz 运行。当预设的闹钟时刻到达，RTC_ALRM_A_IRQ 或 RTC_ALRM_B_IRQ 信号被发送至 PMU 的唤醒控制器，PMU 据此重新使能主时钟振荡器和电源稳压器，系统恢复至运行模式。此机制使 SoC 能够以微安级平均电流实现分钟级甚至小时级的定时唤醒，是无线传感器节点、电表、IoT 终端等电池供电设备的关键使能技术。Tamper 事件同样具备唤醒能力——在 Standby 模式下，若 RTC_TAMP_CTRL 中对应检测源使能，任何物理篡改信号均可触发系统上电，以便主 CPU 立即响应安全事件。

### 14.3 软件可见寄存器

#### 14.3.1 时间与日期寄存器

表 14-1 汇总了 RTC 的时间/日期计数器寄存器与闹钟配置寄存器。所有计数器寄存器在复位后值为 0，需由软件在首次上电时写入当前时间；位于 VBAT 域的寄存器在 VDD 掉电期间由备份电池维持，上电后自动恢复。

**表 14-1：RTC 时间与闹钟寄存器定义**

| 偏移地址 | 寄存器名 | 位域 | 读写属性 | 复位值 | 功能描述 |
|:--------:|:---------|:-----|:--------:|:------:|:---------|
| 0x00 | RTC_CTRL | [0] RTC_EN<br>[1] FMT<br>[2] CLK_SRC<br>[3] DST_EN<br>[4] BYPSHAD<br>[5] CLK_FAIL_IE | R/W | 0x00 | [0] RTC 使能，1=运行<br>[1] 时间格式，0=24h，1=12h<br>[2] 时钟源，0=外部晶振，1=内部 32kHz RC<br>[3] 夏令时使能<br>[4] 绕过影子寄存器直接读计数器<br>[5] 时钟失效中断使能 |
| 0x04 | RTC_PRESCALER | [22:16] PREDIV_A<br>[15:0] PREDIV_S | R/W | 0x007F_00FF | [22:16] 异步预分频值，范围 0~127，实际分频比 = PREDIV_A+1<br>[15:0] 同步预分频值，范围 0~32767，实际分频比 = PREDIV_S+1 |
| 0x08 | RTC_SEC | [6:0] SEC<br>[7] 保留 | R/W | 0x00 | [6:0] BCD 秒值，0x00~0x59 |
| 0x0C | RTC_MIN | [6:0] MIN<br>[7] 保留 | R/W | 0x00 | [6:0] BCD 分钟值，0x00~0x59 |
| 0x10 | RTC_HOUR | [5:0] HOUR<br>[6] AM_PM<br>[7] 保留 | R/W | 0x00 | [5:0] BCD 小时值，0x00~0x23（24h）或 0x01~0x12（12h）<br>[6] 12h 格式下午标志，1=PM |
| 0x14 | RTC_DAY | [5:0] DAY<br>[7:6] 保留 | R/W | 0x01 | [5:0] BCD 日期值，0x01~0x31 |
| 0x18 | RTC_WEEKDAY | [2:0] WEEKDAY<br>[7:3] 保留 | R/W | 0x01 | [2:0] 星期，1=周日，2=周一，…，7=周六 |
| 0x1C | RTC_MON | [4:0] MONTH<br>[7:5] 保留 | R/W | 0x01 | [4:0] BCD 月份值，0x01~0x12 |
| 0x20 | RTC_YEAR | [7:0] YEAR | R/W | 0x00 | [7:0] BCD 年份值，0x00~0x99，对应 2000~2099 |
| 0x24 | RTC_ALRM_A_SEC | [6:0] ALRM_A_SEC<br>[7] MSK_SEC | R/W | 0x00 | [6:0] 闹钟 A 目标秒值（BCD）<br>[7] 秒掩码，1=秒字段不参与匹配 |
| 0x28 | RTC_ALRM_A_MIN | [6:0] ALRM_A_MIN<br>[7] MSK_MIN | R/W | 0x00 | [6:0] 闹钟 A 目标分值（BCD）<br>[7] 分掩码 |
| 0x2C | RTC_ALRM_A_HOUR | [5:0] ALRM_A_HOUR<br>[6] AM_PM<br>[7] MSK_HOUR | R/W | 0x00 | [5:0] 闹钟 A 目标时值（BCD）<br>[6] 12h 下午标志<br>[7] 时掩码 |
| 0x30 | RTC_ALRM_A_DAY | [5:0] ALRM_A_DAY<br>[6] WDSEL<br>[7] MSK_DAY | R/W | 0x01 | [5:0] 闹钟 A 目标日值（BCD）<br>[6] 日/星期选择，0=匹配日期，1=匹配星期<br>[7] 日掩码 |
| 0x34 | RTC_ALRM_A_CTRL | [0] ALRM_A_EN<br>[1] WKUP_EN<br>[7:2] 保留 | R/W | 0x00 | [0] 闹钟 A 使能<br>[1] 闹钟 A 作为唤醒源使能 |
| 0x38 | RTC_ALRM_B_SEC | [6:0] ALRM_B_SEC<br>[7] MSK_SEC | R/W | 0x00 | 闹钟 B 秒配置，结构与 A 相同 |
| 0x3C | RTC_ALRM_B_MIN | [6:0] ALRM_B_MIN<br>[7] MSK_MIN | R/W | 0x00 | 闹钟 B 分配置 |
| 0x40 | RTC_ALRM_B_HOUR | [5:0] ALRM_B_HOUR<br>[6] AM_PM<br>[7] MSK_HOUR | R/W | 0x00 | 闹钟 B 时配置 |
| 0x44 | RTC_ALRM_B_DAY | [5:0] ALRM_B_DAY<br>[6] WDSEL<br>[7] MSK_DAY | R/W | 0x01 | 闹钟 B 日配置 |
| 0x48 | RTC_ALRM_B_CTRL | [0] ALRM_B_EN<br>[1] WKUP_EN | R/W | 0x00 | 闹钟 B 使能与唤醒控制 |

RTC_CTRL 寄存器中的 BYPSHAD（Bypass Shadow）位控制读取行为。默认状态下，RTC 在 APB 总线时钟域与 32.768 kHz 计数器域之间插入影子寄存器（Shadow Register）作为跨时钟域同步手段，软件读取时间寄存器时实际读取的是最近一次同步后的影子值，时延不超过 1 个 RTC 时钟周期（约 30.5 μs）。置位 BYPSHAD 后软件直接读取计数器值，消除同步延迟，但需软件自行处理亚稳态风险，仅在时间校准或调试场景下使用。

#### 14.3.2 闹钟寄存器

闹钟寄存器的结构已在表 14-1 中完整定义（偏移 0x24~0x48）。闹钟 B 的寄存器组与闹钟 A 保持镜像结构，偏移地址顺延。两组闹钟可独立使能，也可同时使能以实现复杂唤醒策略——例如 ALRM_A 配置为每日固定时刻唤醒主系统进行数据采集，ALRM_B 配置为每周唤醒一次进行远程通信。

#### 14.3.3 中断与备份寄存器

表 14-2 定义了 RTC 的中断控制、状态、备份寄存器以及 Tamper 检测相关寄存器。中断状态寄存器 RTC_INT_STS 采用写-1-清除（W1C）机制，软件向对应标志位写 1 即可清除中断 pending；写 0 无影响。

**表 14-2：RTC 中断、备份与 Tamper 寄存器定义**

| 偏移地址 | 寄存器名 | 位域 | 读写属性 | 复位值 | 功能描述 |
|:--------:|:---------|:-----|:--------:|:------:|:---------|
| 0x4C | RTC_INT_EN | [0] ALRM_A_IE<br>[1] ALRM_B_IE<br>[2] TAMP_IE<br>[3] TS_IE<br>[4] SEC_IE<br>[7:5] 保留 | R/W | 0x00 | [0] 闹钟 A 中断使能<br>[1] 闹钟 B 中断使能<br>[2] Tamper 中断使能<br>[3] 时间戳中断使能<br>[4] 秒中断使能（每秒触发） |
| 0x50 | RTC_INT_STS | [0] ALRM_A_IF<br>[1] ALRM_B_IF<br>[2] TAMP_IF<br>[3] TS_IF<br>[4] SEC_IF<br>[7:5] 保留 | R/W1C | 0x00 | [0] 闹钟 A 中断标志，写 1 清除<br>[1] 闹钟 B 中断标志<br>[2] Tamper 中断标志<br>[3] 时间戳事件标志<br>[4] 秒中断标志 |
| 0x54 | RTC_INT_RAW | [4:0] 同 INT_STS | R/O | 0x00 | 原始中断状态，不受中断使能位屏蔽 |
| 0x60 | RTC_BKP_0 | [31:0] BKP_DATA | R/W | 0x0000_0000 | 备份寄存器 0，VBAT 域保持 |
| 0x64 | RTC_BKP_1 | [31:0] BKP_DATA | R/W | 0x0000_0000 | 备份寄存器 1 |
| 0x9C | RTC_BKP_15 | [31:0] BKP_DATA | R/W | 0x0000_0000 | 备份寄存器 15（偏移 = 0x60 + 4×15） |
| 0xA0 | RTC_TAMP_CTRL | [0] TAMP1_EN<br>[1] TAMP2_EN<br>[2] TAMP3_EN<br>[4:3] TAMP1_TRIG<br>[6:5] TAMP2_TRIG<br>[8:7] TAMP3_TRIG<br>[12] ERASE_BKP<br>[13] TAMP_FLT<br>[15:14] FLT_CNT<br>[31:16] 保留 | R/W | 0x0000 | [2:0] Tamper 输入 1/2/3 检测使能<br>[4:3] TAMP1 触发边沿，00=上升沿，01=下降沿，10=双边沿，11=电平<br>[6:5] TAMP2 触发边沿<br>[8:7] TAMP3 触发边沿<br>[12] Tamper 时自动擦除备份寄存器<br>[13] 数字消抖滤波使能<br>[15:14] 滤波采样计数，00=2 周期，01=4 周期，10=8 周期，11=保留 |
| 0xA4 | RTC_TAMP_STS | [0] TAMP1_EVT<br>[1] TAMP2_EVT<br>[2] TAMP3_EVT<br>[3] TAMP_OVF<br>[7:4] 保留<br>[15:8] TAMP_ID | R/W1C | 0x00 | [0] Tamper1 事件标志<br>[1] Tamper2 事件标志<br>[2] Tamper3 事件标志<br>[3] 事件溢出标志（多事件未及时处理）<br>[15:8] 触发 Tamper 的源 ID（多源同时触发时编码优先级最高者） |
| 0xA8 | RTC_TAMP_TS_SEC | [6:0] TS_SEC<br>[7] 保留 | R/O | 0x00 | Tamper 事件时间戳：秒（BCD） |
| 0xAC | RTC_TAMP_TS_MIN | [6:0] TS_MIN | R/O | 0x00 | Tamper 事件时间戳：分（BCD） |
| 0xB0 | RTC_TAMP_TS_HOUR | [5:0] TS_HOUR<br>[6] AM_PM | R/O | 0x00 | Tamper 事件时间戳：时（BCD） |
| 0xB4 | RTC_TAMP_TS_DAY | [5:0] TS_DAY | R/O | 0x01 | Tamper 事件时间戳：日（BCD） |
| 0xB8 | RTC_TAMP_TS_MON | [4:0] TS_MONTH | R/O | 0x01 | Tamper 事件时间戳：月（BCD） |
| 0xBC | RTC_TAMP_TS_YEAR | [7:0] TS_YEAR | R/O | 0x00 | Tamper 事件时间戳：年（BCD） |

备份寄存器 BKP_0~BKP_15 均位于 VBAT 域，在主电源掉电期间由纽扣电池维持数据完整性。软件通常将安全密钥、设备唯一标识、配置校验和等敏感数据存放于此。当 Tamper 事件触发且 ERASE_BKP 位置位时，硬件以异步总线周期并行擦除全部 16 个备份寄存器，擦除操作在 Tamper 事件确认后 2~4 个 32.768 kHz 周期内完成，确保攻击者无法通过截断 VBAT 供电来阻止密钥销毁。Tamper 时间戳寄存器组在事件发生时自动锁存当前时间值，且被硬件写保护——软件只能读取，无法修改，保证审计链的不可抵赖性。

#### 14.3.4 Tamper 寄存器

Tamper 控制与状态寄存器的位域定义已完整列于表 14-2（偏移 0xA0~0xBC）。RTC_TAMP_CTRL 中的 TAMPx_TRIG 字段允许为每个检测源独立配置触发极性，适应不同传感器类型：机械开盖开关通常接成下降沿触发（开关断开），而电压异常监控器通常接成上升沿触发（过压事件）。数字滤波器通过 FLT_CNT 配置采样深度，在消抖与响应延迟之间提供可调平衡；对于物理入侵检测，典型配置为 8 周期滤波（约 244 μs @ 32.768 kHz），足以抑制 ESD 放电引起的亚微秒级毛刺，同时不显著影响响应实时性。RTC_TAMP_STS 中的 TAMP_OVF 位用于标识事件堆积：若在前一个 Tamper 事件未被软件清除之前又有新事件发生，OVF 位置位，提醒软件存在未被单独记录的安全事件序列。

---

## 15. SoC 系统集成与互联

前述十四章分别阐述了 UART、I2C、SPI、I3C、GPIO/Pinmux、PWM、IR、DMA、Mailbox、HW Semaphore、Timer、Watchdog 与 RTC 共 13 个外设 IP 的内部架构与寄存器规范。本章将这些离散模块置于统一的系统视角下，描述总线互联拓扑、地址空间分配、中断路由网络、时钟/复位分发策略以及低功耗设计约束，从而给出 SoC 数字外设层的完整集成视图。

### 15.1 总线互联架构

#### 15.1.1 AXI Crossbar + AHB/APB Bridge 分层结构

本 SoC 采用三级总线分层架构。顶层 AXI 4×4 Crossbar 承担高带宽主设备间的高速数据交换；中间层 AHB Lite 连接存储控制器；底层 APB 总线矩阵以低速、低门控开销的方式挂载全部 13 个外设 IP 的寄存器接口。

AXI Crossbar 主设备侧接入 CPU AXI Master（指令与数据合并端口）以及 DMA AXI Master。从设备侧映射至 AHB Lite Bridge、片上 SRAM（512 KB）、外部 Flash 控制器以及 AXI-to-APB Bridge。Crossbar 内部采用固定优先级轮询仲裁，CPU 具备最高优先级，DMA 次之，确保控制通路不受突发传输阻塞。

AHB Lite 总线宽度 32 bit，支持 SINGLE、INCR4 与 INCR8 突发类型，向下连接 SRAM 控制器与 Flash 控制器。APB 总线由 AHB-to-APB Bridge 引出，将 32 bit AHB 事务拆分为 APB4 协议的单拍访问，经 APB MUX 扩展为三条独立外设分组总线。

以下框图展示了从 CPU/DMA 到各外设的完整互联路径：

```
                               ┌───────────────────────────────────────────────┐
                               │           SoC Top-Level Interconnect          │
                               └───────────────────────────────────────────────┘

  ┌──────────┐    ┌──────────┐
  │   CPU    │    │   DMA    │
  │ AXI Master│   │ AXI Master│
  │ (Instr+   │   │ (Rd+Wr    │
  │  Data)    │   │  Arb)     │
  └────┬─────┘    └────┬─────┘
       │               │
       └───────┬───────┘
               │
       ┌───────▼────────┐
       │  AXI 4×4       │◀── Sys Config (AWCACHE/ARCACHE)
       │  Crossbar      │◀── QoS & Priority (CPU > DMA)
       └──┬──┬──┬──┬────┘
          │  │  │  │
    ┌─────┘  │  │  └─────┐
    │        │  │        │
┌───▼───┐ ┌──▼──┐  ┌────▼────┐ ┌──────▼──────┐
│ AHB   │ │SRAM │  │  Flash  │ │ AXI-to-APB  │
│ Bridge│ │512KB│  │Controller│ │   Bridge    │
└───┬───┘ └─────┘  └─────────┘ └──────┬──────┘
    │                                  │
┌───▼──────────────┐                   │
│   AHB Lite Bus   │                   │
│ (SRAM/Flash)     │                   │
└──────────────────┘                   │
                                       │
                              ┌────────▼────────┐
                              │  AHB-to-APB     │
                              │   Bridge        │
                              │  (HCLK→PCLK)     │
                              └────────┬────────┘
                                       │
                              ┌────────▼────────┐
                              │   APB MUX       │
                              │ (Address Decoder) │
                              └────┬──┬──┬──────┘
                                   │  │  │
                          ┌────────┘  │  └────────┐
                          │           │           │
                   ┌──────▼────┐ ┌────▼────┐ ┌────▼────┐
                   │  APB0     │ │  APB1   │ │  APB2   │
                   │ (High-Spd)│ │ (System)│ │ (Sec/Low)│
                   │ PCLK      │ │ PCLK    │ │PCLK_DIV2│
                   └────┬──────┘ └────┬────┘ └────┬────┘
                        │             │           │
    ┌───────────────────┼─────────┐   │   ┌───────┼──────────────┐
    │   │   │   │   │   │         │   │   │   │   │              │
    ▼   ▼   ▼   ▼   ▼   ▼         ▼   ▼   ▼   ▼   ▼              ▼
┌───┐ ┌─┐ ┌─┐ ┌─┐ ┌───┐ ┌───┐   ┌───┐ ┌───┐   ┌─────┐ ┌─────┐ ┌───┐
│UART│I2C│SPI│I3C│GPIO │DMA  │   │PWM│Timer│   │Mailbox│HSEM │WDT│RTC│
│    │   │   │   │/Pin │Cfg  │   │   │     │   │       │     │   │   │
└───┘ └─┘ └─┘ └─┘ └───┘ └───┘   └───┘ └───┘   └─────┘ └─────┘ └───┘ └───┘
  │    │   │   │   │    │         │   │           │       │       │     │
  └────┴───┴───┴───┴────┘         └───┴───────────┘       └───────┴─────┘
        (APB0: 高速通信+GPIO+DMA配置)     (APB1: 系统外设)      (APB2: 低速/安全)

  外设功能信号
  ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
  │TX/RX│SCL/│SCK/│SCL/│GPIO│PWM │IR_ │DREQ│无  │无  │TIN/│WDOGRES│Xtal│
  │     │SDA │CS  │SDA │[31:0]│输出│TX/RX│/DACK│外部│外部│TOUT│(复位)│    │
  └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

#### 15.1.2 DMA 总线主控接口

DMA 控制器具备 AXI Master 接口，与 CPU 同级直连 AXI Crossbar。APB 总线宽度仅 32 bit 且不支持突发传输，若 DMA 通过 APB 访问 SRAM，4 KB 搬运将产生 1024 次独立 APB 事务，效率极低。DMA AXI Master 支持 INCR8 与 WRAP4 突发，读写通道独立，各具备 512 byte 深度 MFIFO，可在一次仲裁授权下完成多拍连续搬运。

DMA 的 APB Slave 配置端口挂载于 APB0，软件通过该端口配置通道参数，但数据平面的实际读写事务由 AXI Master 发起，与 APB 配置平面完全解耦。DMA 与外设间的流控握手（DREQ[7:0]/DACK[7:0]）为点对点专用信号，不经过总线矩阵，确保 FIFO 水位触发的传输请求具备确定性低延迟。

#### 15.1.3 APB 外设分组与片选

APB MUX 将 13 个外设划分为三个独立总线段，每段配备独立的时钟门控与复位控制。

APB0（高速通信与配置段）挂载 UART、I2C、SPI、I3C、GPIO/Pinmux 与 DMA 配置接口。该段外设需响应外部事件或承担 DMA 配置职责，运行在全速 PCLK（典型 96 MHz），确保寄存器访问延迟最小化。

APB1（系统外设段）挂载 PWM 与 Timer。二者运行时软件交互频率低于通信外设——PWM 初始化后仅需周期性更新占空比，Timer 在 OS Tick 场景下多数时间自主运行。隔离至独立段可防止 PWM DMA 写操作干扰 APB0 通信外设的中断响应延迟。

APB2（低速安全段）挂载 Mailbox、HW Semaphore、Watchdog 和 RTC，时钟源可选 PCLK_DIV2 或独立低速时钟。Watchdog 与 RTC 拥有独立 32 kHz 时钟域，APB 访问通过异步桥接跨越时钟域。APB2 可通过总线防火墙配置访问权限，仅允许安全态 CPU 访问，防止非安全软件误清除 WDT 或篡改 RTC。

### 15.2 地址映射表

#### 15.2.1 完整地址分配表

SoC 外设地址空间锚定于 0x4000_0000，采用统一 4 KB 粒度对齐。每外设占据独立 4 KB 页，内部寄存器以字对齐排列，低 12 位由 IP 内部译码，高 20 位由 APB MUX 产生 PSEL 片选。

**表 15-1 外设地址映射总表**

| 外设名称 | 基地址 | 地址范围 | 寄存器偏移上限 | 所属总线 | 访问属性 |
|:---|:---|:---|:---|:---|:---|
| UART | 0x4000_0000 | 0x4000_0000 ~ 0x4000_0FFF | 0xFFC | APB0 | 全可读写 |
| I2C | 0x4000_1000 | 0x4000_1000 ~ 0x4000_1FFF | 0xFFC | APB0 | 全可读写 |
| SPI | 0x4000_2000 | 0x4000_2000 ~ 0x4000_2FFF | 0xFFC | APB0 | 全可读写 |
| I3C | 0x4000_3000 | 0x4000_3000 ~ 0x4000_3FFF | 0xFFC | APB0 | 全可读写 |
| GPIO/Pinmux | 0x4000_4000 | 0x4000_4000 ~ 0x4000_4FFF | 0xFFC | APB0 | 全可读写 |
| PWM | 0x4000_5000 | 0x4000_5000 ~ 0x4000_5FFF | 0xFFC | APB1 | 全可读写 |
| IR TX/RX | 0x4000_6000 | 0x4000_6000 ~ 0x4000_6FFF | 0xFFC | APB0 | 全可读写 |
| DMA (Config) | 0x4000_7000 | 0x4000_7000 ~ 0x4000_7FFF | 0xFFC | APB0 | 安全/非安全可配置 |
| Mailbox | 0x4000_8000 | 0x4000_8000 ~ 0x4000_8FFF | 0xFFC | APB2 | 双端口访问 |
| HW Semaphore | 0x4000_9000 | 0x4000_9000 ~ 0x4000_9FFF | 0xFFC | APB2 | 多核原子访问 |
| Timer | 0x4000_A000 | 0x4000_A000 ~ 0x4000_AFFF | 0xFFC | APB1 | 全可读写 |
| Watchdog | 0x4000_B000 | 0x4000_B000 ~ 0x4000_BFFF | 0xFFC | APB2 | 写保护关键寄存器 |
| RTC | 0x4000_C000 | 0x4000_C000 ~ 0x4000_CFFF | 0xFFC | APB2 | VBAT 域，跨时钟域访问 |

地址映射遵循三项约束：4 KB 对齐与 ARM Cortex-M NVIC 规划兼容，便于复用 CMSIS 头文件；DMA 配置端口与 AXI Master 共享同一设备标识，硬件通过独立路由机制区分 APB 寄存器访问与 AXI 数据事务；APB2 的 Mailbox 与 HW Semaphore 具备多端口访问能力，冲突由 IP 内部仲裁器而非总线解码器解决。

#### 15.2.2 地址解码逻辑

APB MUX 中的地址解码器依据 PADDR[31:12] 产生各外设 PSEL 信号，采用组合逻辑直接译码，不含状态机，确保单周期片选响应。译码公式为 PSEL_x = (PADDR[31:12] == 20'h4000x)，其中 x 从 0 到 C 分别对应 UART 至 RTC。当访问地址落在 0x4000_D000 及以上未分配区域时，APB MUX 产生 PSEL_NONE 并触发 PSLVERR = 1，由异常控制器向 CPU 报告 BusFault。

### 15.3 中断连接拓扑

#### 15.3.1 中断分配总表

13 个外设共产生 17 条独立中断请求线，全部接入 NVIC。低延迟外设分配至低中断号以获得更快响应，安全关键外设分配至中等优先级，RTC 与 WDT 的中断具备唤醒能力。

**表 15-2 外设中断分配总表**

| 中断号 | 中断信号名 | 来源外设 | 触发方式 | 目标 NVIC 通道 | 备注 |
|:---:|:---|:---|:---|:---:|:---|
| 0 | UARTINTR | UART | 电平高 | NVIC[0] | 发送 FIFO 空 / 接收 FIFO 满 / 错误 |
| 1 | SPIINTR | SPI | 电平高 | NVIC[1] | 发送下溢 / 接收上溢 / 传输完成 |
| 2 | I2CINTR | I2C | 电平高 | NVIC[2] | 发送完成 / 接收就绪 / 仲裁丢失 |
| 3 | I3CINTR | I3C | 电平高 | NVIC[3] | SDR/DDR 完成 / IBI / 错误 |
| 4 | DMAINTR | DMA | 电平高 | NVIC[4] | 通道传输完成 / 错误 / 链表结束 |
| 5 | GPIOINTR | GPIO/Pinmux | 电平高 | NVIC[5] | 32 路边沿/电平检测 OR 聚合 |
| 6 | PWMINTR | PWM | 电平高 | NVIC[6] | 周期匹配 / 比较匹配 / 捕获事件 |
| 7 | IRINTR | IR TX/RX | 电平高 | NVIC[7] | TX FIFO 空 / RX FIFO 满 / 帧完成 |
| 8 | TIMERINTR | Timer | 电平高 | NVIC[8] | 四通道匹配/溢出/捕获 OR 聚合 |
| 16 | MB_RX_A | Mailbox | 脉冲上升沿 | NVIC[16] | Processor B 消息到达通知 A |
| 17 | MB_RX_B | Mailbox | 脉冲上升沿 | NVIC[17] | Processor A 消息到达通知 B |
| 18 | HSEM_C0 | HW Semaphore | 脉冲上升沿 | NVIC[18] | Core 0 关注的信号量释放 |
| 19 | HSEM_C1 | HW Semaphore | 脉冲上升沿 | NVIC[19] | Core 1 关注的信号量释放 |
| 20 | WDTINTR | Watchdog | 脉冲上升沿 | NVIC[20] | 预警中断（计数器到达阈值） |
| 21 | RTCSEC | RTC | 脉冲上升沿 | NVIC[21] | 秒脉冲中断（1 Hz） |
| 22 | RTCALRM | RTC | 脉冲上升沿 | NVIC[22] | 闹钟 A/B 匹配 / Tamper 检测 |

中断信号分为两类。电平触发中断（UARTINTR、SPIINTR、I2CINTR、I3CINTR、DMAINTR、GPIOINTR、PWMINTR、IRINTR、TIMERINTR）在外设内部状态寄存器清零前持续拉高，适用于事件持续存在的场景。脉冲触发中断（Mailbox、HW Semaphore、Watchdog、RTC）在事件发生时产生单周期脉冲，无需软件清除，适用于通知型事件。GPIOINTR 与 TIMERINTR 分别为 32 路和四通道内部源的 OR 聚合，CPU 进入服务程序后需读取状态寄存器确定具体源。RTC 的 RTCALRM 为闹钟 A、闹钟 B 和 Tamper 三个内部源的聚合，通过 RTC_INT_STA 位域区分。

#### 15.3.2 中断聚合与路由

中断路由遵循"低延迟直连、安全扩展隔离"策略。NVIC 0~15 号向量分配给对实时性影响最大的外设，从中断断言到向量取指的最大延迟不超过 12 个 PCLK 周期。UART（0）、SPI（1）、I2C（2）、I3C（3）与 DMA（4）占据前五个向量，因为通信外设 FIFO 深度有限，中断响应延迟直接决定最高可持续波特率。

16 号及以上中断分配给系统服务与后台外设。Mailbox 与 HW Semaphore 为核间通信专用，延迟需求取决于软件协议设计而非硬实时约束。Watchdog 预警中断（20）优先级低于通信外设但高于后台任务，预警时给予 CPU 补救机会，在计数器归零前执行紧急状态保存；若置于过低优先级，可能被高负载通信中断淹没而丧失预警意义。

WDT 与 RTC 中断具备唤醒属性。CPU 进入 WFI 睡眠态且 PCLK 被门控时，WDTINTR 与 RTCALRM 直接送入 PMU 的异步唤醒检测逻辑，绕过 NVIC 正常时钟域。PMU 检测到有效唤醒脉冲后恢复时钟树并释放 CPU 复位，唤醒延迟由 WDT_CLK 或 RTC_32K 周期决定，典型值为数十微秒。

### 15.4 时钟与复位分配

#### 15.4.1 时钟域划分表

SoC 外设层存在四个独立时钟域：PCLK、PCLK_DIV2、ACLK 与 RTC_32K。时钟域边界由双触发器同步链或异步 FIFO 桥接，确保跨域信号不产生亚稳态传播。

**表 15-3 时钟域分配与属性表**

| 时钟域 | 典型频率 | 来源 | 驱动外设 | 跨域桥接点 | 门控支持 |
|:---|:---|:---|:---|:---|:---|
| ACLK | 100~200 MHz | AXI PLL | AXI Crossbar, DMA AXI Master | AXI-to-AHB/APB Bridge | 不支持（常开） |
| PCLK | 48~96 MHz | APB PLL | APB0/APB1 全部外设 | AHB-to-APB Bridge | 支持，按 IP 独立门控 |
| PCLK_DIV2 | 24~48 MHz | PCLK 二分频 | APB2 部分外设 | APB MUX 内部分频器 | 支持，按总线段门控 |
| WDT_CLK | 32 kHz | RC 振荡器或外部晶振 | Watchdog 计数器核心 | APB 异步桥接 | 不支持（常开监控） |
| RTC_32K | 32.768 kHz | 外部晶振 | RTC 核心、Tamper 检测 | APB 异步桥接 | 不支持（VBAT 域常开） |

PCLK 是 APB 外设主时钟。UART、I2C、SPI、I3C 的波特率发生器以 PCLK 为参考分频，PCLK 频率直接决定最大线速率。PWM 与 Timer 的计数时钟源自 PCLK，经内部预分频器降频，PCLK 频率影响 PWM 最小占空比分辨率和 Timer 最大计时范围。PCLK_DIV2 为 APB2 段可选时钟，Mailbox 与 HW Semaphore 为纯寄存器型外设，可在 PCLK_DIV2 下运行以降低动态功耗。Watchdog 与 RTC 的 APB 访问通过异步桥接完成，桥接器在 APB 侧采样 PCLK，在 WDT/RTC 侧采样各自独立时钟。ACLK 与 PCLK 通常为同源 PLL 分频输出的同步时钟，AXI-to-APB Bridge 内部对 AHB 侧 INCR 突发请求进行拆分和重排序，以适应 APB 单拍访问特性。

#### 15.4.2 复位分级结构

复位网络采用三级树状结构，从全局冷复位到局部软复位逐层细化。

**表 15-4 复位信号分级与覆盖范围**

| 复位信号 | 触发源 | 覆盖范围 | 排除对象 | 持续时间 | 软件可控 |
|:---|:---|:---|:---|:---|:---:|
| SYS_RESETn | 上电复位、外部 RESET 引脚 | 全部数字逻辑 | 无 | 4~256 个 ACLK 周期 | 否 |
| APB_PERIPH_RESETn | RST_CTRL 寄存器位域 | 指定 APB 外设 | DMA AXI 主状态、RTC 备份域 | 8 个 PCLK 周期 | 是，位域独立 |
| WDT_RESETn | Watchdog 超时或窗口喂狗错误 | CPU、总线矩阵、全部 APB 外设（除 RTC） | WDT 自身状态、RTC 备份域 | 4~256 个 WDT_CLK 周期 | 否 |
| HRESETn | AHB 桥内部逻辑复位 | AHB-to-APB Bridge、AHB Slave | AXI 主设备 | 与 SYS_RESETn 同步 | 否 |

SYS_RESETn 为最顶层复位，由 PMU 在上电电压稳定后产生，或由外部 RESET 引脚强制触发，覆盖全部数字逻辑。复位释放时序由复位序列器控制：AXI 域先于 AHB 域释放，AHB 域先于 APB 域释放，确保总线矩阵在 CPU 开始取指前已稳定。

APB_PERIPH_RESETn 为外设级软复位，由 RST_CTRL 寄存器 13 个独立位域控制，每外设一位。软件检测到某外设进入不可恢复状态时，向对应位写 1 并清 0，产生 8 个 PCLK 周期的局部复位脉冲，仅复位目标外设寄存器组与内部状态机，不影响总线矩阵或其他外设。DMA 的 AXI Master 状态机不在 APB_PERIPH_RESETn 覆盖范围内，避免 AXI 事务中途复位导致总线死锁。

WDT_RESETn 为看门狗触发的系统热复位。当 Watchdog 计数器归零或检测到过早喂狗错误时，WDOGRES 脉冲接入 PMU 复位仲裁逻辑。若 WDT_CTRL 的 RST_EN 为 1 且未处于调试暂停态，PMU 将 WDT_RESETn 分发至 SYS_RESETn 的下游节点，复位除 RTC 备份域和 WDT 故障记录寄存器外的全部逻辑。WDT_RESETn 脉冲宽度由 WDT_RSTCNT 配置，典型值为 128 个 WDT_CLK 周期（约 4 ms），确保复位信号传播至整个芯片。

### 15.5 低功耗设计

#### 15.5.1 时钟门控策略

每个 APB 外设配备独立的 PCLK_EN 门控信号，由 PMU 的时钟控制单元（CCU）根据软件配置和外设活动状态动态开关。门控粒度为每外设一个独立使能位，共 13 个使能信号，外加 3 个总线段级门控（APB0_EN、APB1_EN、APB2_EN）。当某段上全部外设使能位均为 0 时，CCU 自动关闭该段总线时钟。

门控决策由两级机制协同完成。第一级为软件显式控制：CLK_EN 寄存器的每比特由软件在设备初始化时置位、去初始化时清零。第二级为硬件自动推导：部分外设具备内部活动检测，在无活动超时后自动向 CCU 请求关闭自身时钟。例如 I3C 控制器检测到总线空闲超过 1 ms 后自动进入低功耗活动状态，向 CCU 发送 CLK_REQ=0；当检测到 START 条件或软件写命令寄存器时，CLK_REQ 恢复为 1，CCU 在 2 个 PCLK 周期内重新开启时钟。物理实现采用集成时钟门控单元（ICG），在 PCLK 路径上插入逻辑门而非多路选择器，避免时钟切换 glitch。

#### 15.5.2 电源域划分

SoC 数字外设层划分为三个电源域，通过片上电源开关和隔离单元实现域间电气解耦。

**表 15-5 电源域划分与外设归属**

| 电源域 | 供电来源 | 包含外设/模块 | 状态 | 静态电流目标 |
|:---|:---|:---|:---|:---|
| PD0（主数字域） | VDD（系统主电源） | CPU、AXI Crossbar、AHB Bridge、APB MUX、全部 APB0/APB1 外设 | 可关断 | < 10 μA |
| PD1（外设可选域） | VDD（可开关电源轨） | APB2 段外设：Mailbox、HSEM、WDT（APB 配置侧） | 可独立关断 | < 5 μA |
| PD_AO（常开域） | VDD/VBAT 双电源 | RTC 核心、32.768 kHz 振荡器、Tamper 检测、备份寄存器 | 始终开启 | 1~3 μA（VBAT 时） |

PD0 为主数字电源域，涵盖全部高速逻辑。系统进入深度睡眠或待机模式时，PD0 可由 PMU 完全关闭，此时 ACLK 与 PCLK 停振。PD0 关闭前，软件需确保所有 DMA 传输完成、所有 APB 外设进入安全状态（UART FIFO 排空、GPIO 输出锁存），否则断电将导致总线事务异常终止。

PD1 为外设可关闭电源域，服务于非关键后台外设。Mailbox 与 HW Semaphore 在处理器核均休眠且无核间通信需求时可下电；WDT 的 APB 配置接口位于 PD1，但其 32 kHz 计数器核心由独立电源岛常供，确保 PD1 关闭后看门狗监控不丢失。PD1 与 PD0 之间的电源开关由 PMU 控制，开关序列遵循先隔离后断电、先上电后释放隔离的顺序，防止浮动输入产生直通电流。

PD_AO（Always-On）为常开电源域，物理布局于芯片角落，通过独立电源环供电。PD_AO 在 VDD 正常时由主电源供电；当 VDD 跌落至阈值以下（典型 1.2~1.5 V），电源切换器在数微秒内将供电路径切换至 VBAT（纽扣电池），采用 make-before-break 时序避免供电 glitch。RTC 的全部功能——包括振荡器、分频器、BCD 计数器、闹钟比较器、Tamper 检测与 16 个备份寄存器——均位于 PD_AO，确保主系统完全断电时墙钟时间仍持续累进。Tamper 检测在 VBAT 供电期间仍有效，一旦检测到物理攻击，硬件自动擦除备份寄存器并记录时间戳，待主电源恢复后由软件读取审计。

低功耗状态转换由 PMU 状态机统一调度。从运行态到睡眠态的软件流程为：写 PMU_CR 置位 SLEEPDEEP，CPU 执行 WFI，NVIC 屏蔽除唤醒源外的全部中断，CCU 依次关闭 APB1、APB0 的 PCLK，最后关断 PD0 电源开关。典型唤醒源包括 RTC 闹钟、WDT 预警、外部 GPIO 边沿以及 UART RX 起始位检测。唤醒事件经异步检测送入 PMU，PMU 在 2~4 个 RTC_32K 周期内完成电源恢复，重新使能 PCLK 后 CPU 从 WFI 后的下一条指令恢复执行。RTC 计时在整个睡眠-唤醒周期中保持连续，因为 PD_AO 全程不断电。


---

