---
doc_id: glossary
title: 术语表
page_type: glossary
created: 2026-05-02
updated: 2026-05-02
tags: [terminology, glossary]
---

# 术语表

## DRAM 领域

| 术语 | 英文 | 定义 | 相关页面 |
|------|------|------|----------|
| DDR | Double Data Rate | 双倍数据速率，在时钟上升沿和下降沿都传输数据 | [[ddr-training]] |
| Training | — | DRAM 初始化过程中的时序校准，包括 Write Leveling、Read Training 等 | [[ddr-training]] |
| Calibration | — | 校准 DRAM 接口的电气参数（ZQ、VREF 等） | [[ddr-training]] |
| Write Leveling | — | 校准 DQ-DQS 与 CK 的相对时序 | [[ddr-training]] |
| ZQ Calibration | — | 通过外部精密电阻（ZQ）校准输出驱动阻抗和 ODT | [[ddr-training]] |
| PHY | Physical Layer | 物理层接口，负责并串转换、时钟恢复等 | [[ddr-phy]] |
| DQS | Data Strobe | 数据选通信号，用于数据对齐 | [[ddr-training]] |
| ODT | On-Die Termination | 芯片内终结电阻，用于信号完整性 | [[ddr-training]] |
| CXL | Compute Express Link | 计算快速链接，用于内存扩展和加速器连接 | [[cxl]] |
| MCRDIMM | Multiplexer Combined Ranks DIMM | 多路复用组合列 DIMM，提高带宽 | [[mcdimm]] |
| 3D DRAM | — | 三维堆叠 DRAM，突破平面缩放限制 | [[3d-dram]] |
| LPDDR | Low Power DDR | 低功耗 DDR，用于移动设备 | [[lpddr5]] |
| Signal Integrity | — | 信号完整性，确保高速信号正确传输 | [[signal-integrity]] |

## Peripheral 领域

| 术语 | 英文 | 定义 | 相关页面 |
|------|------|------|----------|
| I2C | Inter-Integrated Circuit | 集成电路间总线，两线串行通信协议 | [[i2c]] |
| I3C | Improved Inter-Integrated Circuit | 改进型 I2C，更高速度、更低功耗、动态寻址 | [[i3c]] |
| SPI | Serial Peripheral Interface | 串行外设接口，全双工同步通信 | [[spi]] |
| UART | Universal Asynchronous Receiver-Transmitter | 通用异步收发器，异步串行通信 | [[uart]] |
| PWM | Pulse Width Modulation | 脉宽调制，用于电机控制、LED 调光等 | [[pwm]] |
| DMA | Direct Memory Access | 直接内存访问，无需 CPU 干预的数据传输 | [[dma]] |
| HDR | High Data Rate | 高数据速率模式（I3C），可达 33.3 Mbps | [[i3c]] |
| SDR | Single Data Rate | 单数据速率模式（I3C），12.5 Mbps | [[i3c]] |
| CCC | Common Command Code | 通用命令码（I3C），用于总线管理 | [[i3c]] |
| DAA | Dynamic Address Assignment | 动态地址分配（I3C），自动分配从设备地址 | [[i3c]] |
| IBI | In-Band Interrupt | 带内中断（I3C），通过数据总线发送中断 | [[i3c]] |
| SPD | Serial Presence Detect | 串行存在检测（DDR5 使用 I3C 接口） | [[i3c]] |
| MIPI | Mobile Industry Processor Interface | 移动行业处理器接口联盟，制定 I3C 等标准 | [[mipi-alliance]] |
| SerDes | Serializer/Deserializer | 串并转换器，用于高速串行通信 | [[serdes]] |

## TV Backlight 领域

| 术语 | 英文 | 定义 | 相关页面 |
|------|------|------|----------|
| Local Dimming | — | 局部调光，分区控制背光亮度 | [[local-dimming]] |
| Mini-LED | — | 微型 LED 背光，芯片尺寸 100-200μm | [[mini-led]] |
| Direct Lit | 直下式 | LED 位于液晶面板正后方 | [[local-dimming]] |
| Edge Lit | 侧入式 | LED 位于液晶面板边缘 | [[local-dimming]] |
| LED Driver | — | LED 驱动 IC，控制 LED 电流和亮度 | [[led-driver]] |
| BCON | Backlight Control | 背光控制接口（传统） | [[local-dimming]] |
| BCONless | — | 无 BCON 的单线通信方案 | [[local-dimming]] |
| Dimming Zone | — | 调光分区，Local Dimming 的基本单元 | [[local-dimming]] |
| TCON | Timing Controller | 时序控制器，控制面板刷新时序 | [[tcon]] |

## SoC PM 领域

| 术语 | 英文 | 定义 | 相关页面 |
|------|------|------|----------|
| SoC | System on Chip | 片上系统，集成处理器、内存、外设等 | [[smart-cockpit]] |
| RTL | Register Transfer Level | 寄存器传输级，数字电路设计抽象层 | [[verification]] |
| Tapeout | — | 流片，将设计交付晶圆厂制造 | [[tapeout]] |
| Signoff | — | 签核，设计通过所有验证检查 | [[tapeout]] |
| DFT | Design for Test | 可测试性设计 | [[verification]] |
| EDA | Electronic Design Automation | 电子设计自动化工具 | [[synopsys]] |
| Agile | — | 敏捷开发方法，应用于硬件项目管理 | [[agile-hardware]] |
| Scrum | — | 敏捷框架之一，迭代式项目管理 | [[agile-hardware]] |
| Verification | — | 验证，确保设计符合规格 | [[verification]] |
| Emulation | — | 仿真，使用硬件加速器验证设计 | [[verification]] |
| Chiplet | — | 芯粒，将大芯片拆分为小芯片组合 | [[chiplet]] |
| UCIe | Universal Chiplet Interconnect Express | 通用芯粒互连标准 | [[chiplet]] |
| RISC-V | — | 开源指令集架构 | [[risc-v]] |

## 行业领域

| 术语 | 英文 | 定义 | 相关页面 |
|------|------|------|----------|
| XR | Extended Reality | 扩展现实，包括 AR/VR/MR | [[xr]] |
| AR | Augmented Reality | 增强现实，叠加虚拟信息到现实世界 | [[ar]] |
| VR | Virtual Reality | 虚拟现实，完全沉浸式体验 | [[vr]] |
| MR | Mixed Reality | 混合现实，虚实融合 | [[xr]] |
| LCOS | Liquid Crystal on Silicon | 硅基液晶，用于 AR 眼镜显示 | [[lcos]] |
| Waveguide | 光波导 | 引导光线的结构，用于 AR 眼镜 | [[waveguide]] |
| DMS | Driver Monitoring System | 驾驶员监控系统 | [[dms]] |
| OMS | Occupant Monitoring System | 乘员监控系统 | [[oms]] |
| HUD | Head-Up Display | 抬头显示 | [[smart-cockpit]] |
| CarPlay | — | Apple 车载系统 | [[carplay]] |
| Android Auto | — | Google 车载系统 | [[carplay]] |
| Snapdragon | — | Qualcomm 处理器品牌 | [[qualcomm]] |
| Tizen | — | Samsung 开发的 Linux 操作系统 | [[samsung]] |
| webOS | — | LG 开发的 Linux 操作系统 | [[lg]] |

---

## 命名规范

### 中文优先原则
- 页面标题使用中文
- 首次出现英文术语时附中文解释
- 后续使用可保留英文缩写（如 DDR、I3C）

### 弃用/避免术语

| 避免使用 | 替代 | 原因 |
|----------|------|------|
| "内存"（模糊） | "DRAM" 或 "存储器" | 明确技术类型 |
| "芯片"（过于宽泛） | "SoC"、"IC"、"Die" | 精确描述 |
| "驱动"（歧义） | "Driver IC"、"驱动程序" | 区分硬件/软件 |

---

*最后更新: 2026-05-02*
