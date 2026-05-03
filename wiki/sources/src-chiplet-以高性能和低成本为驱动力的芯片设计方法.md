---
doc_id: src-chiplet-以高性能和低成本为驱动力的芯片设计方法
title: Chiplet   以高性能和低成本为驱动力的芯片设计方法
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/Chiplet - 以高性能和低成本为驱动力的芯片设计方法.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · 芯片架构设计](https://www.zhihu.com/column/c_1877951126294372352) 10 人赞同了该文章 随着计算需求不断增长，单芯片已无法满足算力增长的需求 (工艺缩放带来的性能提升无法满足业务对性能的需求)，chiplet 系统成为主流。与单芯片相比，这些由多个独立芯片重新封装而成的芯片能够满足极高的性能需求，且不会增加功耗、面积或良率，同时可提高芯片设计的灵活性、效率和可扩展性。构建 chiplet 架构有多种方法，其中最常见的有两种。

## Key Points

### 1. 1\. Chiplet介绍
随着计算需求不断增长，单芯片已无法满足算力增长的需求 (工艺缩放带来的性能提升无法满足业务对性能的需求)，chiplet 系统成为主流。与单芯片相比，这些由多个独立芯片重新封装而成的芯片能够满足极高的性能需求，且不会增加功耗、面积或良率，同时可提高芯片设计的灵活性、效率和可扩展性。构建 chiplet 架构有多种方法，其中最常见的有两种。

### 2. 2\. 常见Chiplet方案


### 3. 2.1.对称Die
所谓对称Die (同构chiplet)，是指每个Die的形状相同，通过对称方式合封成完整的芯片，常见的有2 Die和4 Die两种产品形态。 - **2-Die** ![](https://pic1.zhimg.com/v2-0c69c98a4000d12428988dd7af2193aa_1440w.jpg)

### 4. 2.2. 非对称Die
和对称Die (同构chiplet)相对应的是非对称Die (异构chiplet)，指的是使用不同用途的Die合封成完整的芯片，一般而言不同用途的Die主要是指计算Die、IO Die、MEM Die (不一定有)，通过IO Die的类型进行区分。

### 5. 3\. 量产Chiplet芯片示例
- ***Google TPU*** Google TPU从v5开始引入Chiplet设计。 ***TPU v5p*** 1 \* 计算Die + 1 \* IO Die + 6 \* HBM ![](https://pic4.zhimg.com/v2-bc3ee4435784963eb6f7ae4ed3800471_1440w.jpg)

## Evidence

- Source: [原始文章](raw/tech/soc-pm/Chiplet - 以高性能和低成本为驱动力的芯片设计方法.md) [[../../raw/tech/soc-pm/Chiplet - 以高性能和低成本为驱动力的芯片设计方法.md|原始文章]]

## Key Quotes

> "M3 Ultra (两个M3 Max合封)"

> "全IO Die (传输+MEM+Ctrl Die)"

> "Graviton3 & Graviton4"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/Chiplet - 以高性能和低成本为驱动力的芯片设计方法.md) [[../../raw/tech/soc-pm/Chiplet - 以高性能和低成本为驱动力的芯片设计方法.md|原始文章]]
