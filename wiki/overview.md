---
doc_id: overview
title: 知识库概览
page_type: overview
created: 2026-05-02
updated: 2026-05-02
tags: [overview, synthesis]
---

# 知识库概览

## 当前状态

**丁工的知识库** 是一个专注于硬件工程领域的个人知识库，基于 Karpathy LLM Wiki 模式构建。

| 指标 | 数值 |
|------|------|
| 原始材料 | 137 篇文章 |
| 领域覆盖 | 7 个子领域 |
| 来源笔记 | 137 篇（已处理） |
| 概念页 | 38 页（已创建） |
| 实体页 | 21 页（已创建） |
| 综合分析 | 5 页（已创建） |
| 最后更新 | 2026-05-02 |

---

## 知识领域

### 技术领域

#### 1. DRAM (`tech/dram/`)

**文章数**: 16  
**核心主题**: [[ddr-training|DDR Training]]、[[ddr-calibration|Calibration]]、[[ddr-phy|PHY 设计]]、[[signal-integrity|信号完整性]]、[[3d-dram|3D DRAM]]、[[cxm|CXL 内存扩展]]

涵盖 [[ddr5|DDR4/DDR5]]/[[lpddr5|LPDDR5]] 的初始化、训练与校准流程，包括 [[write-leveling|Write Leveling]]、Read Training、ZQ Calibration 等关键技术。同时追踪 [[3d-dram|3D DRAM]] 和 [[cxm|CXL（Compute Express Link）]] 等前沿技术动态。

**关键实体**: [[samsung|Samsung]]、[[micron|Micron]]、[[sk-hynix|SK Hynix]]、[[synopsys|Synopsys]]  
**关键来源**: CSDN、博客园、Synopsys、Micron、TrendForce、AnandTech

#### 2. Peripheral (`tech/peripheral/`)

**文章数**: 38  
**核心主题**: [[i2c|I2C]]、[[spi|SPI]]、[[uart|UART]]、[[i3c|I3C]]、[[pwm|PWM]]、[[dma|DMA]]

重点覆盖 [[i3c|I3C（MIPI I3C）]] 作为 [[i2c|I2C]] 的下一代替代协议，包括动态地址分配、HDR（High Data Rate）模式、与 [[ddr5|DDR5 SPD Hub]] 的集成等。同时包含传统外设协议（[[i2c|I2C]]/[[spi|SPI]]/[[uart|UART]]）的深入技术文章，以及 STM32 平台的驱动开发实践。

**关键实体**: [[mipi-alliance|MIPI Alliance]]、[[synopsys|Synopsys]]  
**关键来源**: MIPI Alliance、NXP、ST、Synopsys、CSDN、博客园

#### 3. TV Backlight (`tech/tv-backlight/`)

**文章数**: 14  
**核心主题**: [[local-dimming|Local Dimming]]、[[mini-led|Mini-LED]]、[[led-driver|LED Driver]]、背光驱动 IC

涵盖直下式/侧入式背光、[[local-dimming|Local Dimming]] 算法、[[mini-led|Mini-LED]] 驱动方案，以及主流驱动 IC（TI、[[renesas|Renesas]]）的技术规格。关注从传统 LED 到 [[mini-led|Mini-LED]] 的技术演进路径。

**关键实体**: [[lg|LG]]、[[tcl|TCL]]、[[samsung|Samsung]]、[[renesas|Renesas]]  
**关键来源**: LEDinside、DisplayDaily、TI、Renesas

#### 4. SoC PM (`tech/soc-pm/`)

**文章数**: 18  
**核心主题**: SoC 开发、[[agile-hardware|敏捷方法]]、[[verification|验证]]、[[tapeout|Tapeout]]、项目管理

覆盖芯片设计全流程：从 RTL 设计到 [[tapeout|Tapeout]] 的签核检查清单，以及 Agile/Scrum 在硬件开发中的应用。同时关注 AI 驱动的芯片设计工具（[[synopsys|Synopsys]] VSO.ai）和开源芯片生态（[[risc-v|RISC-V]]、PULP Platform）。

**关键实体**: [[synopsys|Synopsys]]、[[nvidia|NVIDIA]]  
**关键来源**: Synopsys、SemiWiki、SemiEngineering、arXiv

### 行业领域

#### 5. TV (`industry/tv/`)

**文章数**: 14  
**核心主题**: TV 产品、SoC（[[mediatek|MediaTek]] Pentonic、Amlogic）、面板技术、OS 生态

追踪 TV 行业动态：[[mini-led|Mini-LED]] 背光 TV 产品、[[oled|OLED evo]] 技术、主流 SoC 平台（[[mediatek|MediaTek Pentonic 800]]、Amlogic S928X）、Tizen/webOS 等 OS 生态，以及 [[tcon|TCON（Timing Controller）]] 市场。

**关键实体**: [[lg|LG]]、[[tcl|TCL]]、[[samsung|Samsung]]、[[mediatek|MediaTek]]  
**关键来源**: TrendForce、HDTVTest、DisplaySpecifications、电子发烧友

#### 6. Smart Glasses (`industry/smart-glasses/`)

**文章数**: 19  
**核心主题**: [[ar|AR]]/[[vr|VR]] 产品、SoC（[[qualcomm|Qualcomm]] Snapdragon）、[[waveguide|光波导]]、[[lcos|LCOS]]、[[android-xr|Android XR]]

覆盖智能眼镜和 [[xr|XR]] 设备：[[meta-ray-ban|Meta Ray-Ban]]、[[apple-vision-pro|Apple Vision Pro]]、[[samsung|Samsung]] Galaxy XR 等产品分析，[[qualcomm|Qualcomm]] Snapdragon Spaces 平台，[[waveguide|光波导（Lumus）]] 和 [[lcos|LCOS]] 显示技术，以及 [[android-xr|Android XR]] 生态系统。

**关键实体**: [[meta|Meta]]、[[apple|Apple]]、[[google|Google]]、[[qualcomm|Qualcomm]]、[[samsung|Samsung]]  
**关键来源**: RoadtoVR、Tom's Guide、TechInsights、Auganix

#### 7. Car Infotainment (`industry/car-infotainment/`)

**文章数**: 18  
**核心主题**: 车载信息娱乐、[[smart-cockpit|智能座舱]]、[[dms|DMS]]/[[oms|OMS]]、SoC（[[qualcomm|Qualcomm]]、[[nvidia|NVIDIA]]、[[renesas|Renesas]]）

涵盖[[smart-cockpit|智能座舱]]和车载娱乐系统：[[qualcomm|Qualcomm]] Snapdragon Cockpit、[[nvidia|NVIDIA]] DRIVE Thor、[[renesas|Renesas]] 车载方案，[[dms|DMS（Driver Monitoring System）]] 和 [[oms|OMS（Occupant Monitoring System）]] 技术，以及 [[carplay|Apple CarPlay Ultra]] 等手机-车机互联方案。

**关键实体**: [[qualcomm|Qualcomm]]、[[nvidia|NVIDIA]]、[[renesas|Renesas]]、[[mediatek|MediaTek]]、[[apple|Apple]]  
**关键来源**: Qualcomm、NVIDIA、Renesas、ResearchInChina、财新

---

## 跨域主题

### 1. SoC 架构演进

从 TV SoC（[[mediatek|MediaTek Pentonic]]）到车载 SoC（[[qualcomm|Qualcomm Snapdragon]]）再到 XR SoC（[[qualcomm|Qualcomm Snapdragon Spaces]]），观察不同应用场景对 SoC 架构的需求差异。相关概念：[[chiplet|Chiplet]]、[[risc-v|RISC-V]]。

### 2. 显示技术融合

TV（[[mini-led|Mini-LED]]/[[oled|OLED]]）→ Smart Glasses（[[waveguide|光波导]]/[[lcos|LCOS]]）→ Car（车载显示），显示技术在不同形态设备中的迁移和适配。相关概念：[[micro-led|Micro LED]]、[[qd-oled|QD-OLED]]、[[tcon|TCON]]。

### 3. 接口协议统一趋势

[[i3c|I3C]] 作为统一传感器接口，从手机（[[ddr5|DDR5 SPD]]）延伸到 IoT、汽车、数据中心，观察协议的跨域渗透。相关概念：[[i2c|I2C]]、[[spi|SPI]]、[[uart|UART]]、[[mipi-alliance|MIPI Alliance]]。

### 4. AI 在硬件设计中的应用

[[synopsys|Synopsys]] VSO.ai（[[verification|验证]]）、AI 驱动 Bug 发现、[[chiplet|Chiplet]] 设计自动化等。相关概念：[[agile-hardware|敏捷硬件]]、[[tapeout|流片]]。

---

## 开放问题

1. **[[3d-dram|3D DRAM]] 何时量产？** 目前处于研发阶段，需要持续追踪 [[samsung|三星]]、[[micron|美光]]、[[sk-hynix|SK 海力士]] 的动态
2. **[[cxm|CXL]] 能否统一内存扩展？** CXL 内存模块的商业化进展和生态建设
3. **[[i3c|I3C]] 替代 [[i2c|I2C]] 的时间表？** 特别是在 [[ddr5|DDR5 SPD]]、传感器集线器等场景
4. **[[mini-led|Mini-LED]] vs [[oled|OLED]] 谁会主导高端 TV？** 成本、画质、功耗的综合竞争
5. **[[ar|AR]] 眼镜的杀手级应用是什么？** 从 B 端（工业）到 C 端（消费）的演进路径
6. **[[smart-cockpit|智能座舱]]的差异化方向？** [[dms|DMS]]/[[oms|OMS]]、AI 助手、多屏互动等功能的优先级

---

## 知识缺口

| 领域 | 缺口描述 | 优先级 |
|------|----------|--------|
| DRAM | [[lpddr5|LPDDR5X]]/LPDDR6 细节、GDDR 显存 | 高 |
| Peripheral | USB4/Thunderbolt、PCIe 协议 | 中 |
| TV | [[oled|OLED]] 材料技术、[[micro-led|Micro-LED]] 量产 | 中 |
| SoC PM | 先进封装（[[chiplet|Chiplet]]、UCIe）| 高 |
| Smart Glasses | 空间计算算法、[[slam|SLAM]] 技术 | 中 |
| Car | 自动驾驶芯片（FSD、[[nvidia|Orin]]）| 高 |

---

## 综合分析

- [[dram-evolution]] — DRAM 技术演进：从 DDR4 到 3D DRAM
- [[tv-display-technologies]] — TV 显示技术对比：Mini LED vs OLED vs Micro LED
- [[display-interface-evolution]] — 显示接口演进：从 LVDS 到 CXL
- [[smart-glasses-vs-car-infotainment]] — 智能眼镜 vs 车载信息娱乐：SoC 架构对比
- [[ai-in-consumer-electronics]] — AI 在消费电子中的应用

## 相关页面

- [[index]] — 总目录
- [[glossary]] — 术语表
- [[log]] — 操作日志
- [[concepts]] — 概念页目录
- [[entities]] — 实体页目录
- [[sources]] — 来源笔记目录
- [[syntheses]] — 综合分析目录

---

*最后更新: 2026-05-02*
