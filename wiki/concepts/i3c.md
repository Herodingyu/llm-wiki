---
doc_id: i3c
title: I3C
page_type: concept
related_sources:
  - src-i3c-protocol-cnblogs
  - src-i3c-overview-csdn
  - src-i3c-wevolver-article-i3c-vs-i2c
  - src-i3c-thinkpalm-blogs-i3c-explained-what-it-is-how-it-wo
  - src-i3c-mipi-specifications-i3c-sensor-specification
  - src-mipi-press-releases-mipi-releases-i3c-basic-v
  - src-i3c-synopsys-designware-ip-interface-ip-mipi-mipi-i3c
  - src-i3c-prodigytechno-ddr5-i3c
  - src-chipinterfaces-from-i2c-to-i3c-evolution-of-two-wire-co
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, peripheral, protocol]
---

# I3C

## 定义

I3C（Improved Inter-Integrated Circuit）是 MIPI 联盟推出的下一代双线串行总线标准，旨在替代 I2C 并统一传感器接口。I3C 在保持与 I2C 引脚兼容的同时，大幅提升传输速率、降低功耗，并引入动态地址分配、带内中断等现代特性，特别适合移动设备和物联网中的多传感器场景。

## 技术细节

核心特性：

- **高速传输**：SDR 模式默认 12.5 Mbps，HDR（High Data Rate）模式可达 33.3 Mbps，远超 I2C 的 400 kbps
- **I2C 兼容**：同一总线可同时挂载 I2C 和 I3C 设备（I2C 设备通过低通滤波器忽略高速信号）
- **动态地址分配**：主机在初始化时为从机分配 7 位动态地址，避免 I2C 的地址冲突问题
- **带内中断**：从机可通过总线主动发起中断，无需额外 IRQ 引脚
- **多主设备支持**：支持主设备角色切换和总线仲裁
- **推挽驱动**：SDA 线使用推挽驱动（非开漏），实现更快的上升沿和更低功耗

通信模式：
- **SDR（Single Data Rate）**：默认单数据速率模式，与 I2C 时序相似
- **HDR-DDR**：双数据速率模式
- **HDR-TSP/TSL**：三元符号模式
- **HDR-BT**：位级传输模式

应用场景：
- 智能手机多传感器（加速度计、陀螺仪、摄像头、指纹识别等）
- 汽车电子传感器网络
- DDR5 SPD Hub（通过 I3C 访问内存配置信息）
- 物联网设备

## 相关来源

- [[src-i3c-protocol-cnblogs]] — I3C 协议通信机制详解
- [[src-i3c-overview-csdn]] — I3C 核心特性通俗介绍
- [[src-i3c-wevolver-article-i3c-vs-i2c]] — I3C 与 I2C 的对比分析
- [[src-i3c-thinkpalm-blogs-i3c-explained-what-it-is-how-it-wo]] — I3C 工作原理全面解析
- [[src-i3c-mipi-specifications-i3c-sensor-specification]] — MIPI I3C 传感器规范
- [[src-mipi-press-releases-mipi-releases-i3c-basic-v]] — MIPI I3C Basic 版本发布
- [[src-i3c-synopsys-designware-ip-interface-ip-mipi-mipi-i3c]] — Synopsys I3C IP 解决方案
- [[src-i3c-prodigytechno-ddr5-i3c]] — DDR5 中 I3C 的应用
- [[src-chipinterfaces-from-i2c-to-i3c-evolution-of-two-wire-co]] — 从 I2C 到 I3C 的演进
- [[src-i3c-chipinterfaces-from-i2c-to-i3c-evolution-of-two-wire-co]] — I3C 文件夹中的 I2C 到 I3C 演进分析
- [[src-i3c-dynamic-address-csdn]] — I3C 动态地址分配详解
- [[src-i3c-dfrobot-blog-17282html]] — DFRobot I3C 入门介绍
- [[src-i3c-acute-en-popular-551]] — Acute I3C 测试仪器
- [[src-i3c-sciety-articles-activity-103390-chips4010006]] — 开源 FPGA I3C 控制器
- [[src-i3c-lists-linux-kernel-2025-03-26-782]] — Qualcomm I3C Linux 驱动
- [[src-i3c-mipi-knowledge-library-webinars-mipi-elektor]] — MIPI I3C 网络研讨会
- [[src-i3c-resources-mipi-i3c-sensor-sessions-at-mipi-devcon]] — MIPI DevCon I3C 传感器会议
- [[src-i3c-nxp-docs-en-training-reference-material-tip]] — NXP I3C 培训资料
- [[src-design-reuse-news-202529816-di3cm-hci-a-high-performa]] — DI3CM-HCI I3C Host Controller IP
- [[src-st-resource-en-application-note-an4013-intr]] — ST I2C 应用笔记 AN4013
- [[src-st-resource-en-application-note-an4277-how]] — ST I3C 应用笔记 AN4277
- [[src-nxp-docs-en-application-note-an12174pdf]] — NXP I3C 应用笔记 AN12174
- [[src-nxp-docs-en-application-note-an14175pdf]] — NXP I3C 应用笔记 AN14175
- [[src-i3c-community-pwmxy87654-attachments-pwmxy87654-tech-d]] — I3C 社区技术文档

## 相关概念

- [[i2c]] — I3C 的前身和兼容对象
- [[spi]] — 另一种常见的外设总线，I3C 在某些场景下可替代 SPI
- [[uart]] — 异步串行通信协议
- [[ddr5]] — 使用 I3C 访问 SPD Hub

## 相关实体

- [[mipi-alliance]] — I3C 标准的制定者
- [[synopsys]] — 提供 MIPI I3C DesignWare IP
- [[ddr5]] — 使用 I3C 访问 SPD Hub
