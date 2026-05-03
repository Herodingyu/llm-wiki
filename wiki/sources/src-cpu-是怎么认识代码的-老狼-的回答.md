---
doc_id: src-cpu-是怎么认识代码的-老狼-的回答
title: CPU 是怎么认识代码的？   老狼 的回答
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/CPU 是怎么认识代码的？ - 老狼 的回答.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

就是为什么计算机能运行我们编写的代码（比如c语言，计算机为什么会运行这个东西，原理是什么）？ 就目前我的理解，我们编辑的c语言最终加载到计算机的是二进… 吴建明wujianming 等 1761 人赞同了该回答 ![](https://pica.zhimg.com/50/v2-4d725457237e42f9ca6c9237f212b594_720w.jpg?source=2c26e567)

## Key Points

### 1. CPU 是怎么认识代码的？
就是为什么计算机能运行我们编写的代码（比如c语言，计算机为什么会运行这个东西，原理是什么）？ 就目前我的理解，我们编辑的c语言最终加载到计算机的是二进… 吴建明wujianming 等 1761 人赞同了该回答

## Evidence

- Source: [原始文章](raw/tech/soc-pm/CPU 是怎么认识代码的？ - 老狼 的回答.md) [[../../raw/tech/soc-pm/CPU 是怎么认识代码的？ - 老狼 的回答.md|原始文章]]

## Key Quotes

> "---
title: "CPU 是怎么认识代码的"

> "就是为什么计算机能运行我们编写的代码（比如c语言，计算机为什么会运行这个东西，原理是什么）"

> "硬件指令解码器是完全由硬件连线（hardwired)完成的机器代码解码。它是最原始的解码器，由有限状态机驱动，解码速度十分快。它现在还在很多精简指令CPU（ RISC ）中发挥作用"

> "这么做除了能化繁为简外，它的输出Micro-Ops作为可以执行的最小单位，可以被调度入Pipeline中来 提高指令的并行性 ： 然后才会进入ALU，IMUL等等逻辑运算单元。它们基本是由逻辑门搭出来的"

> "其他 这么神奇的Micro-Ops，我们是不是不会碰到它呢？实际上 ，很多人都听过它并还在每次重启都更新过它！"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/CPU 是怎么认识代码的？ - 老狼 的回答.md) [[../../raw/tech/soc-pm/CPU 是怎么认识代码的？ - 老狼 的回答.md|原始文章]]
