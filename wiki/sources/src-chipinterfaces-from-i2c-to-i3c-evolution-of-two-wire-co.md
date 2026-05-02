---
doc_id: src-chipinterfaces-from-i2c-to-i3c-evolution-of-two-wire-co
title: "From I2C to I3C: Evolution of Two-Wire Communication in Embedded Systems"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/chipinterfaces-from-i2c-to-i3c-evolution-of-two-wire-co.md
domain: tech/peripheral
created: 2026-05-02
updated: 2026-05-02
tags: [peripheral, i3c, i2c, embedded-systems]
---

# From I2C to I3C: Evolution of Two-Wire Communication in Embedded Systems

## 来源

- **原始文件**: raw/tech/peripheral/chipinterfaces-from-i2c-to-i3c-evolution-of-two-wire-co.md
- **提取日期**: 2026-05-02

## 摘要

本文详细对比了I2C和I3C两种双线通信协议，介绍了I3C作为I2C继任者的关键改进，包括更高速度、动态寻址、带内中断和更低的功耗，适用于现代SoC和FPGA设计。

## 关键要点

- I3C时钟速度可达12.5MHz(SDR)，HDR模式下高达100Mbps
- 支持动态地址分配，无需硬件配置地址
- 带内中断(IBI)消除了额外GPIO中断线的需求
- 向后兼容I2C设备

## 技术细节

- **速度对比**: I2C最高5Mbps vs I3C最高100Mbps
- **信号方式**: I3C支持开漏+推挽信号
- **新特性**: Hot Join、睡眠模式、标准化命令集
- **IP选型要点**: MIPI规范合规性、角色可配置、HDR支持

## Related Pages

- [[i3c]] — I2C 到 I3C 的演进分析
- [[i2c]] — I3C 兼容的上一代协议
- [[mipi-alliance]] — I3C 标准的制定者
- [[synopsys]] — 提供 MIPI I3C IP 解决方案
- [[ddr5]] — DDR5 中 I3C 的应用（SPD Hub）

## 开放问题

- 从I2C到I3C的过渡策略和混合系统设计
- I3C在遗留系统中的兼容性验证
