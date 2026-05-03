---
doc_id: src-半导体厂商如何做芯片的出厂测试-ricky-li-的回答
title: 半导体厂商如何做芯片的出厂测试？   Ricky Li 的回答
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/半导体厂商如何做芯片的出厂测试？ - Ricky Li 的回答.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## 摘要

本文从产业视角全面介绍了半导体芯片从晶圆制造到最终出货的完整测试流程。作者详细描述了两大测试阶段：Wafer Test（晶圆测试，使用ATE自动测试设备）和Final Test（最终测试，包含ATE和SLT系统级测试）。文章揭示了芯片"体质"分级的商业逻辑——通过测试将芯片按性能/缺陷分类为不同产品线（如i3/i5/i7），以及DFT（可测试性设计）如何革命性地提升测试效率。核心 insight：芯片测试是涉及数千人协作的巨大工程，测试成本已接近研发成本，测试程序开发是流片前必须完成的关键工作。

## 关键要点

### 1. 芯片测试全流程概览
| 阶段 | 地点 | 设备 | 目的 |
|------|------|------|------|
| **Wafer Test** | 晶圆厂或附近测试厂 | ATE自动测试设备 | 筛选好坏Die，生成Wafer Map |
| **切割** | 晶圆厂 | 切割机 | 按Wafer Test结果分拣 |
| **封装** | 封装厂（晶圆厂附近） | 封装设备 | 保护芯片，引出管脚 |
| **Final Test** | 测试工厂 | ATE + SLT | 严格分类，确定产品等级 |
| **分拣/刻字/包装** | 测试工厂 | 自动化设备 | 成品准备出货 |

### 2. Wafer Test（晶圆测试）
- **执行方**：生产工程师使用ATE运行设计方提供的测试程序
- **结果分类**：粗暴分为好片/坏片，坏片直接舍弃
- **良品率监控**：坏片过多则判定为晶圆厂良品率低，需赔偿
- **输出**：Wafer Map（晶圆图），记录每颗Die的测试结果
- **后续**：好片送封装，封装地点通常在晶圆厂附近（裸片无法长距离运输）

### 3. Final Test（最终测试）
**测试现象与产品分级**：
| 测试结果 | 处理方式 | 产品定位 |
|---------|---------|---------|
| 完全正常 | 最高等级 | 酷睿i7 |
| 工作频率不高 | 降频销售 | 酷睿i5 |
| CPU坏2个核心 | 屏蔽坏核 | 酷睿i3 |
| GPU损坏 | 屏蔽显示核心 | 赛扬 |
| 封装损坏/部分损坏 | 报废或降级 | - |

**Final Test两大步骤**：
1. **ATE测试**：几分钟完成，测试项目包括电源、管脚DC、JTAG、Burn-in、PHY、IP内部（Scan/BIST/Function）、IP IO（DDR/SATA/PLL/PCIe/Display）等
2. **SLT测试**：几小时完成，芯片安装到主板，启动操作系统，软件烤机测试

### 4. DFT（可测试性设计）革命
- **传统方式**：手写软件生成测试pattern，效率极低
- **DFT方案**：设计阶段加入测试回路，流片后工具自动生成测试pattern
- **覆盖率**：DFT可覆盖95%以上的功能测试
- **工具商**：Mentor、Cadence、Synopsys等提供DFT解决方案
- **配套矢量**：DFT工程师生成几万到几十万行测试向量

### 5. 测试工程的组织与成本
- **人员规模**：涉及DFT工程师、测试工程师、产品工程师等上百人
- **代码量**：每次测试版本迭代几十万行代码
- **日产量**：大公司每日测试几万片芯片
- **成本占比**：很多大公司的测试成本已接近研发成本
- **测试厂房**：需要大量机械和自动化设备，精密环境控制

## Key Quotes

- "Large companies test tens of thousands of chips daily—the testing pressure is immense."
- "DFT can cover over 95% of functional testing through automated pattern generation."
- "Test costs for many large companies have approached R&D costs."

## 技术细节

- **ATE设备**：爱德万(Advantest)、泰瑞达(Teradyne)等，不同机种编程方式不同（C++或Excel形式）
- **Socket测试**：BGA封装用专用socket夹持测试，价格从几千到十几万不等
- **Burn-in**：老化测试，高温高压条件下运行以筛选早期失效
- **BGA测试挑战**：不能多次焊接，使用socket实现非破坏性测试
- **晶圆多同测**：需计算针脚扎在wafer上的位置，提高测试效率

## 原文引用

> "大公司的每日流水的芯片就有几万片, 测试的压力是非常大"

> "生产工程师会使用 自动测试仪器 (ATE)运行芯片设计方给出的程序, 粗暴的把芯片分成好的/坏的这两部分, 坏的会直接被舍弃, 如果这个阶段坏片过多, 基本会认为是晶圆厂自身的良品率低下"

> "封装的地点一般就在晶圆厂附近, 这是因为未封装的芯片无法长距离运输"

> "生产工厂内实际上有十几个流程, Final Test只是第一步"

> "Final Test是工厂的重点, 需要大量的机械和自动化设备"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/半导体厂商如何做芯片的出厂测试？ - Ricky Li 的回答.md) [[../../raw/tech/soc-pm/半导体厂商如何做芯片的出厂测试？ - Ricky Li 的回答.md|原始文章]]