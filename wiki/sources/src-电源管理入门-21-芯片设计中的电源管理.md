---
doc_id: src-电源管理入门-21-芯片设计中的电源管理
title: 电源管理入门 21 芯片设计中的电源管理
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/电源管理/电源管理入门-21 芯片设计中的电源管理.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679) 12 人赞同了该文章 ![](https://picx.zhimg.com/v2-7a4aa2ff697fa72762ee49e7a50d6a81_1440w.jpg)

## Key Points

### 1. 1\. 关于PCSA和SCP
参考： [ARM系列 -- PCSA（一）](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzU0MTE1OTU0NA%3D%3D%26mid%3D2247483900%26idx%3D1%26sn%3Dd4d2e40d5a52cf6c8a33772c8d6e0da7%26chksm%3Dfb2f78eb

### 2. 2\. 关于PSCI和SCMI
![](https://pic3.zhimg.com/v2-858c93b6b387c0c03550089ca395edde_1440w.jpg) 参考：PSCI官方文档 SCMI官方文档 [ARM系列 -- PSCI](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzU0MTE1OTU0NA%3D%3D

### 3. 3\. 关于芯片SoC设计中的一些要点
- SCP子系统一般是在 **Always-on区域** ，也就是休眠的时候不下电，除非整机关机才下电。 - SCP有独立的 **M核硬件** ，所以需要设计 **中断** ， **RAM内存映射** 区域的使用

### 4. 参考：
1.[ARM系列 -- 电源和时钟管理](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzU0MTE1OTU0NA%3D%3D%26mid%3D2247484406%26idx%3D1%26sn%3Dc7a758c6ed5d99f447207aafd78285ef%26chksm%3Dfb2f7ae1c

## Evidence

- Source: [原始文章](raw/tech/bsp/电源管理/电源管理入门-21 芯片设计中的电源管理.md) [[../../raw/tech/bsp/电源管理/电源管理入门-21 芯片设计中的电源管理.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/电源管理/电源管理入门-21 芯片设计中的电源管理.md) [[../../raw/tech/bsp/电源管理/电源管理入门-21 芯片设计中的电源管理.md|原始文章]]
