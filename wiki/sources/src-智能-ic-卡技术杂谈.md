---
doc_id: src-智能-ic-卡技术杂谈
title: 智能 IC 卡技术杂谈
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/智能 IC 卡技术杂谈.md
domain: tech/peripheral
created: 2026-05-04
updated: 2026-05-04
tags: [peripheral]
---

## Summary

[收录于 · 成都IT圈](https://www.zhihu.com/column/chengdu) 34 人赞同了该文章 目录

## Key Points

### 1. 接触 & 非接触 & 双界面卡
接照用途和构成，可以将 IC 卡划分为 **存储卡** （Memory Card）和带有 CPU 的 **智能卡** （Smart Card）。 - **接触式卡** ：IC 芯片封装在 PVC 塑料里面，但是触点外露，需要与卡槽产生物理接触才能读写数据；

### 2. ISO/IEC 7816
**ISO/IEC 7816** 是一种标准化的接触式智能卡通信协议，主要用于读写 **接触式** 的集成电路卡，该协议由如下 14 个部分组成： - **[ISO7816-1](https://link.zhihu.com/?target=https%3A//www.iso.org/standard/14732.html)** ：物理特性；

### 3. ISO/IEC 14443
**ISO/IEC 14443** 定义了 **Type A** 和 **Type B** 两种 IC 卡类型，它们均工作在 `13.56MHz` 无线频率，两者的主要区别在于调制方式、编码方案（协议第 2 部分）、协议初始化过程（协议第 3 部分）三个方面，但是都共同采用了协议第 4 部分定义的传输协议，该协议主要由如下 4 个部分组成：

### 4. Mifare 1 卡
恩智浦半导体于 1994 年 推出的 [Mifare Classic 系列](https://link.zhihu.com/?target=https%3A//www.nxp.com/products/rfid-nfc/mifare-hf/mifare-classic%3AMC_41863) 也被称为 **Mifare 1** ，即俗称的 **M1 卡** 。其工作频率为 `13.56MHZ` ，

### 5. 应用协议数据单元 APDU
应用协议数据单元（ **APDU** ，Application Protocol Data Unit）是卡片和外部应用之间的通信报文协议，其格式标准被定义在 **ISO7816-4** 当中，具体可以被划分为 **命令** 和 **响应** 两种类型：

## Evidence

- Source: [原始文章](raw/tech/peripheral/智能 IC 卡技术杂谈.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/peripheral/智能 IC 卡技术杂谈.md)
