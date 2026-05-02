---
doc_id: i2c
title: I2C
page_type: concept
related_sources:
  - src-chipinterfaces-from-i2c-to-i3c-evolution-of-two-wire-co
  - src-i3c-wevolver-article-i3c-vs-i2c
  - src-kitemetric-blogs-mastering-i2c-drivers-on-embedded
  - src-cavliwireless-blog-not-mini-in-depth-exploration-of-i2
  - src-i3c-protocol-cnblogs
  - src-i3c-overview-csdn
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, peripheral, protocol]
---

# I2C

## 定义

I2C（Inter-Integrated Circuit）是由 Philips（现 NXP）于 1982 年开发的两线同步串行总线协议。I2C 仅使用两根信号线（SCL 时钟线和 SDA 数据线）即可实现多主多从通信，因其简单性和低引脚占用，成为嵌入式系统中最广泛使用的短距离板级通信协议之一。

## 技术细节

核心特性：

- **两线接口**：SCL（Serial Clock Line）+ SDA（Serial Data Line）
- **多主多从**：同一总线可挂载多个主设备和多个从设备
- **开漏驱动**：SDA 和 SCL 均为开漏输出，需外部上拉电阻
- **静态地址**：从设备使用固定的 7 位或 10 位地址
- **标准速率**：Standard-mode 100 kbps，Fast-mode 400 kbps，Fast-mode Plus 1 Mbps，High-speed mode 3.4 Mbps

通信协议：
- **起始条件（START）**：SCL 高电平时 SDA 下降沿
- **停止条件（STOP）**：SCL 高电平时 SDA 上升沿
- **数据帧**：8 位数据 + 1 位 ACK/NACK
- **读/写方向**：地址最低位表示读（1）或写（0）

局限性：
- 速度较低，不适合高速数据传输
- 静态地址可能产生冲突（尤其多相同设备场景）
- 开漏驱动限制了上升沿速度
- 无内置中断机制，从设备无法主动通知主设备
- 总线电容限制（通常 400 pF）限制了总线长度和设备数量

## 相关来源

- [[src-chipinterfaces-from-i2c-to-i3c-evolution-of-two-wire-co]] — I2C 到 I3C 的演进分析
- [[src-i3c-wevolver-article-i3c-vs-i2c]] — I2C 与 I3C 的详细对比
- [[src-kitemetric-blogs-mastering-i2c-drivers-on-embedded]] — 嵌入式 I2C 驱动开发
- [[src-cavliwireless-blog-not-mini-in-depth-exploration-of-i2]] — I2C 深入探索
- [[src-i3c-protocol-cnblogs]] — I2C 在 I3C 混合总线中的共存策略
- [[src-i3c-overview-csdn]] — I2C 与 I3C 的兼容性说明
- [[src-digitalmanuscriptpedia-conferences-indexphp-dmp-lnmr-article-d]] — I2C 相关会议论文

## 相关概念

- [[i3c]] — I2C 的继任者，向下兼容
- [[spi]] — 另一种常见外设总线，速度更高但引脚更多
- [[uart]] — 异步串行通信协议

## 相关实体

- [[mipi-alliance]] — 制定 I3C 等下一代标准
- [[synopsys]] — 提供 I2C/I3C IP 解决方案
