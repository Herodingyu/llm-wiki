---
doc_id: src-huayuan-hyasic-mini-led-am-driver
title: "华源智信 — Mini LED AM 驱动技术行业开拓者"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/tv-backlight/huayuan-vs-xsignal-bconless-comparison.md
domain: tech/tv-backlight
created: 2026-05-04
updated: 2026-05-04
tags: [tv-backlight, mini-led, bcon-less, huayuan, hyasic, led-driver, am-driver]
---

# 华源智信 — Mini LED AM 驱动技术行业开拓者

## 来源

- **原始文件**: raw/tech/tv-backlight/huayuan-vs-xsignal-bconless-comparison.md
- **原始 URL**: 多个来源汇总（行家说、搜狐、充电头网、电子发烧友等）
- **提取日期**: 2026-05-04

## 摘要

华源智信半导体（深圳）有限公司成立于 2018 年，核心团队来自 iWatt、Dialog、PI 等国际知名半导体企业，是国内最早研发布局 Mini LED 背光驱动芯片的厂家之一。公司定位 Mini LED 背光 AM 驱动技术行业开拓者，2024 年全年出货量突破 10 亿颗，连续 5 年翻倍式增长。核心产品包括 HY8XXX 系列、HY8811（4 通道 AM Mini LED TV 背光驱动）、HY8602B0QA（车规级 8 通道 AM 驱动）。核心专利技术为 SPB（Serial-Parallel-Broadcast）协议和 Distributed Architecture 分布式架构。

## 关键要点

- 2018 年成立，核心团队来自 iWatt、Dialog、PI
- 国内最早研发布局 Mini LED 背光驱动芯片的厂家之一
- 2024 年出货量突破 10 亿颗，连续 5 年翻倍增长
- 全球布局超过百项核心技术专利
- 核心协议：SPB（Serial-Parallel-Broadcast）专利协议
- 核心架构：Distributed Architecture 分布式架构（BCON 总控台 + 分布式车道）
- 主要客户：海信、小米、创维、长虹、康佳、视源、京东方
- 车规级产品：HY8602B0QA 通过 AEC-Q100 认证

## 关键引用

- "华源智信作为国内最早研发布局 Mini LED 背光驱动芯片的厂家之一"
- "2024 年全年出货量突破 10 亿颗"
- "SPB 协议具有出色的通信可靠性，支持高达 16MHz 的通信频率"
- "Distributed Architecture 占据了更小的空间，并且适合更多分区的终端产品"

## 技术细节

**SPB 协议特点**:
- 类 SPI 接口但走线更简单
- 广播形式（非排队），减小数据发送到灯板刷新的时间差
- 支持反馈机制，可侦测每区每芯片状态
- 支持高达 16MHz 通信频率

**Distributed Architecture**:
- BCON 作为"总控台"控制多个"车道"
- 每个驱动 IC 驱动 4 个区
- 分区可灵活扩展，电流调控精度高

## Related Pages

- [[bcon-less]] — 华源智信的 BCON 架构是理解 Bcon-less 演进的重要参考
- [[mini-led]] — Mini LED 背光驱动技术
- [[led-driver]] — LED 驱动 IC 技术

## 开放问题

- 华源智信是否有计划推出支持 SoC 直连的无 BCON 方案？
- SPB 协议在 Bcon-less 架构下的兼容性如何？
