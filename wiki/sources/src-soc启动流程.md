---
doc_id: src-soc启动流程
title: SOC启动流程
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/SOC启动流程.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

不坠青云之志 等 224 人赞同了该文章 目录 目标：做个明白人

## Key Points

### 1. 1\. 芯片漫谈
天下大事，必作于细; 天下难事，必作于易。

### 2. 1.1 疑问：
1）芯片的功耗怎么来的？（ [动态功耗](https://zhida.zhihu.com/search?content_id=234054408&content_type=Article&match_order=1&q=%E5%8A%A8%E6%80%81%E5%8A%9F%E8%80%97&zhida_source=entity) -晶体管翻转， [静态功耗](https://zhida.zhi

### 3. 1.2 芯片分解：
SOC->ALU等功能模块->逻辑门（与非门，或门等）->晶体管(PMOS/NMOS) ![](https://picx.zhimg.com/v2-bd6e3d1568ff17916c3ed7ca9b3478d9_1440w.jpg)

### 4. 1.3 CMOS晶体管组成：
![](https://pica.zhimg.com/v2-28ff8d2eeeea0af1d9d4cf6a8a369c10_1440w.jpg) PMOS/NMOS ![](https://pic2.zhimg.com/v2-e473613afd5439f67d9edd0992269fa3_1440w.jpg)

### 5. 1.4 CPU性能：
- 提高频率（与线宽有关，线宽越细，频率上限越高），频率越高，时钟周期越短，每秒执行的指令数越多。 - 流水线（指令宽度，cache, MMU, TLB, 分支预测，乱序执行， 通过这些方法让流水线满负荷工作），将一条指令分成多个阶段执行，从而达到一个时钟完成一条指令。这也有利于提高CPU的主频。

## Evidence

- Source: [原始文章](raw/tech/bsp/SOC启动流程.md) [[../../raw/tech/bsp/SOC启动流程.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/SOC启动流程.md) [[../../raw/tech/bsp/SOC启动流程.md|原始文章]]
