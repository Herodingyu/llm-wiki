---
doc_id: src-huayuan-hyasic-mini-led-driver
title: "华源智信 Mini LED 背光驱动芯片技术资料"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/tv-backlight/huayuan-vs-xsignal-bconless-comparison.md
domain: tech/tv-backlight
created: 2026-05-04
updated: 2026-05-04
tags: [tv-backlight, mini-led, bcon-less, huayuan, hyasic, led-driver, spb-protocol]
---

# 华源智信 Mini LED 背光驱动芯片技术资料

## 来源

- **原始文件**: raw/tech/tv-backlight/huayuan-vs-xsignal-bconless-comparison.md
- **信息来源**: 企业官方资料、行业媒体报道、公开新闻
- **提取日期**: 2026-05-04

## 公司概况

华源智信半导体（深圳）有限公司成立于 2018 年，核心团队来自 iWatt、Dialog、PI 等国际知名半导体企业。定位为 Mini LED 背光 AM 驱动技术行业开拓者。

## 核心业务数据

- **2024 年全年出货量突破 10 亿颗**
- 自 2018 年成立以来**连续 5 年翻倍式增长**
- 全球布局**超过百项核心技术专利**（专利信息 101 条）

## Mini LED 驱动产品线

| 产品型号 | 类型 | 关键特性 | 应用场景 |
|----------|------|----------|----------|
| **HY8XXX 系列** | AM 驱动 | SPB 专利协议，分布式架构 | 电视、显示器、笔记本 |
| **HY8811** | 4 通道 AM Mini LED TV 背光驱动 | SPB 数字通讯协议，累计出货超 4 亿颗 | 电视背光 |
| **HY8602B0QA** | 车规级 AM Mini LED 驱动 | AEC-Q100（SGS Grade 1），8 通道，11bit DC + 12bit PWM + 23bit 混合调光，单通道 30V/48mA | 车载显示 |

## 核心技术

### 1. Distributed Architecture（分布式架构）
- 将驱动 IC 像"车道"一样分布，每个 IC 驱动 4 个区
- BCON 作为"总控台"控制所有车道
- 占用更小空间，适合更多分区

### 2. SPB（Serial-Parallel-Broadcast）专利协议
- 类 SPI 接口但走线更简单
- 广播形式（非排队），减小数据发送到灯板刷新的时间差
- 支持反馈机制，可侦测每区每芯片状态
- 通信频率最高支持 **16MHz**
- 支持单面布线、长距离传输

### 3. Bcon-less 专利（2025 年 5 月）
- **专利号 CN222813301U**："一种 LED 驱动电路、背光系统及显示装置"
- 核心创新：**图像处理单元直接与驱动单元通信，省去驱动控制单元（BCON/MCU）**
- 简化电路设计，降低电路成本

## 客户覆盖

海信、小米、创维、长虹、康佳、视源（CVTE）、京东方等

## 重要里程碑

| 时间 | 事件 |
|------|------|
| 2018 | 公司成立 |
| 2021 | 专为 Mini LED 研发的 AM 驱动方案正式量产 |
| 2022.09 | 海信 U8 电视选用华源 HY8XXX 系列芯片和 SPB 协议架构 |
| 2024.02 | 推出车规级芯片 HY8602B0QA |
| 2024.11 | AM Mini LED 驱动芯片累计出货超 10 亿颗 |
| 2025.01 | 2024 年全年出货量突破 10 亿颗 |
| 2025.03 | 入选"2024 投中榜·锐公司 100"榜单 |
| 2025.05 | 获得 Bcon-less 关键专利 CN222813301U |

## Related Pages

- [[bcon-less]] — 华源智信是 Bcon-less 架构的重要专利持有者
- [[mini-led]] — Mini LED 背光技术
- [[led-driver]] — LED 驱动 IC 技术
- [[src-xsignal-xp7008q-mini-led-driver]] — 芯格诺竞争对手

## 开放问题

- 华源智信是否计划推出集成 TCON 的多合一芯片？
- SPB 协议能否成为 Bcon-less 架构的行业标准？
