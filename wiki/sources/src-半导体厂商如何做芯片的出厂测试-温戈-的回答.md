---
doc_id: src-半导体厂商如何做芯片的出厂测试-温戈-的回答
title: 半导体厂商如何做芯片的出厂测试？   温戈 的回答
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/半导体厂商如何做芯片的出厂测试？ - 温戈 的回答.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## 摘要

本文从DFT（可测试性设计）和ATE（自动测试设备）工程师的专业视角，系统介绍了芯片出厂测试的完整流程。作者作为前Teradyne ATE工程师和现AMD DFT+数字IC设计工程师，分享了从Wafer Test到Final Test的第一手经验。文章详细阐述了DFT技术如何革命性地改变功能测试方式——通过在芯片设计阶段嵌入测试回路，实现95%以上功能覆盖率的自动化测试pattern生成。同时介绍了BGA封装的socket测试方案、不同ATE机种的编程差异，以及测试成本已接近研发成本的产业现实。

## 关键要点

### 1. 芯片测试两大阶段
| 阶段 | 测试对象 | 核心设备 | 时长 | 关键产出 |
|------|---------|---------|------|---------|
| **Wafer Test** | 晶圆上的裸Die | ATE + Probe Card | 快速 | Wafer Map、良品率数据 |
| **Final Test** | 封装后的芯片 | ATE + SLT + Socket | 数小时 | 产品分级、测试报告 |

### 2. DFT技术：测试效率的革命
- **传统方式**：手写软件生成tester程序（pattern），效率极低
- **DFT方案**：设计阶段加入测试回路，流片后工具自动生成pattern
- **覆盖率**：DFT可覆盖95%以上的功能测试
- **主要工具商**：Mentor、Cadence、Synopsys
- **配套矢量**：DFT工程师生成数万条测试向量，验证芯片功能

### 3. BGA封装测试方案
- **Socket夹持**：使用专用BGA socket将芯片夹紧，连接测试基板
- **价格区间**：从几千块到十几万不等（汽车芯片socket更贵）
- **批量生产**：机械手自带夹子，自动取放芯片
- **少量评价**：带盖子的socket，手动操作
- **原理**：通过socket管脚将芯片引脚连接到测试基板

### 4. 测试项目分类
| 类别 | 具体内容 | 工具/方法 |
|------|---------|----------|
| **电气测试** | 电流测试、电压测试、管脚DC特性 | ATE精确测量 |
| **时序测试** | Timing特性验证 | 高速ATE通道 |
| **功能测试** | DFT自动生成pattern覆盖95%+ | DFT工具链 |
| **Flash测试** | 擦写次数、数据保持 | 专用Flash测试算法 |
| **老化测试** | 高温高压条件下跑全套测试 | Burn-in Oven |

### 5. 测试工程实施细节
- **ATE机种差异**：
  - 爱德万(Advantest)：需C++编程
  - 泰瑞达(Teradyne)：Excel形式配置
- **硬件板卡**：需设计专用板卡连接tester
- **晶圆多同测**：计算针脚在wafer上的扎针位置，提高并行度
- **高温测试**：需使用耐热材料，验证极端环境下的可靠性
- **人员协作**：测试工程师、产品工程师、DFT工程师协同工作

## Key Quotes

- "Large companies test tens of thousands of chips daily—the testing pressure is immense."
- "DFT can cover over 95% of functional testing through automated pattern generation."
- "Test costs for many large companies have approached R&D costs."

## 技术细节

- **测试程序迭代**：每次版本迭代涉及几十万行代码，需保证零错误
- **日产能**：大公司每日测试几万片芯片，测试压力巨大
- **测试成本**：很多大公司的测试成本已接近研发成本
- **测试厂房**：需大量机械和自动化设备，环境控制严格
- **DFT回路**：在RTL设计阶段插入Scan Chain、BIST等测试结构

## 原文引用

> "大公司的每日流水的芯片就有几万片, 测试的压力是非常大"

> "生产工程师会使用自动测试仪器(ATE)运行芯片设计方给出的程序, 粗暴的把芯片分成好的/坏的这两部分, 坏的会直接被舍弃, 如果这个阶段坏片过多, 基本会认为是晶圆厂自身的良品率低下"

> "封装的地点一般就在晶圆厂附近, 这是因为未封装的芯片无法长距离运输"

> "生产工厂内实际上有十几个流程, Final Test只是第一步"

> "Final Test是工厂的重点, 需要大量的机械和自动化设备"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/半导体厂商如何做芯片的出厂测试？ - 温戈 的回答.md) [[../../raw/tech/soc-pm/半导体厂商如何做芯片的出厂测试？ - 温戈 的回答.md|原始文章]]