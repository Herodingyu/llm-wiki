---
doc_id: src-芯片-设计流程入门
title: 芯片 设计流程入门
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/AI系统/芯片-设计流程入门.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810) 6 人赞同了该文章 ![](https://pic2.zhimg.com/v2-e4fcc2cece39c7f395da8b6586150f7d_1440w.jpg)

## Key Points

### 1. 1\. 市场需求
![](https://pic2.zhimg.com/v2-85e9b7f674c6e4a4a10720fb5628232d_1440w.jpg) 要做一个芯片，首先得有需求，也就是 **应用场景** ，有市场去买单。当前科技时代，电子技术在各方面都有应用，可以说 **有电路板的地方就有芯片需求** 。例如手机、电脑、智能家具，我们的衣食住行用等方方面面。

### 2. 1.1 关于EDA模拟软件
![](https://pic4.zhimg.com/v2-dde32859e19cf904c33b664ee2cc53f1_1440w.jpg) - 软件在做架构设计的时候，有时候需要进行一些验证，看软件是否支持，可以使用 **[qemu](https://zhida.zhihu.com/search?content_id=271860259&content_type=Article&match

### 3. 1.2 关于架构师
![](https://pic4.zhimg.com/v2-81020e2c4a86393f8f42469092907e63_1440w.jpg) 数字集成电路设计实现流程是个相当漫长的过程，拿手机基带芯片为例，对于3G, 4G, 5G, 工程师最初见到的是无数页的协议文档。

### 4. 2\. 芯片设计概述
芯片设计分为两部分， **前端（逻辑设计）** 和 **后端（物理设计）** 。 ![](https://pic2.zhimg.com/v2-f9f75f2e9b61056ed8191ac29f309caf_1440w.jpg)

### 5. 3\. 芯片前端设计
1. [RTL设计](https://zhida.zhihu.com/search?content_id=271860259&content_type=Article&match_order=1&q=RTL%E8%AE%BE%E8%AE%A1&zhida_source=entity)

## Evidence

- Source: [原始文章](raw/tech/soc-pm/AI系统/芯片-设计流程入门.md) [[../../raw/tech/soc-pm/AI系统/芯片-设计流程入门.md|原始文章]]

## Key Quotes

> "物理版图以GDSII的文件格式交给芯片代工厂"

> "VDK与qemu的区别就是qemu支持的芯片型号有限，自己添加很麻烦，要修改qemu的源码。而在VDK图形界面上 **点一点就可以添加一个IP** ，而且很多IP是不出名的，厂商私有的不会广泛支持，就需要自己加。所以IP厂商基本会有自己的集成验证工具供客户使用。"

> "芯片开发的周期很漫长，在最开始需求阶段，一些应用上的软件也许就 **具备开发条件** 了，例如在qemu上进行app应用的开发，一些依赖于SoC上IP的应用，可以使用VDK做一些数据流的通路开发，并不支持具体的业务，这样后续拿到真正芯片后就可以省略很多一部分研发任务，并且可以 **提前验证** 软件技术方案的可行性。"

> "如果软件技术方案不可行需要修改SoC硬件也可以 **及早的修改** 。因为芯片研发越到后期修改的成本越大，如果流片了还需要修改，那就快game over了，巨额资金打水漂。所以宁愿先投入研发人员去慢慢磨，也不愿意在硬件上去试错，人可没芯片生产值钱。"

> "有一个说法就是 **老外** 掌握一项新技术，首先就是 **加密做界面化** ，不提供源码然后商业 **卖钱** 。而这个周期要延迟一两年到市场上，而 **中国** 则 **直接推给自己的客户** ，客户有能力抄的就抄跑了，大家都不太注重商业保密，可能技术比较low **不用藏着掖着** ，大家都是抄的。。。这就是 **中国速度** 。"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/AI系统/芯片-设计流程入门.md) [[../../raw/tech/soc-pm/AI系统/芯片-设计流程入门.md|原始文章]]
