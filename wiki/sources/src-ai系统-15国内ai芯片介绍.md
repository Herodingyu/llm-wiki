---
doc_id: src-ai系统-15国内ai芯片介绍
title: AI系统 15国内AI芯片介绍
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/AI系统/AI系统-15国内AI芯片介绍.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810) 8 人赞同了该文章 ![](https://picx.zhimg.com/v2-24d08d4c2581ade7e4c3c027b75fb53d_1440w.jpg)

## Key Points

### 1. 1.壁仞科技
![](https://pic2.zhimg.com/v2-67a0ecbb1ce3ff4a31d414e10399b3ad_1440w.jpg) 壁仞的产品形态是直接跟英伟达竞争，号称中国英伟达，有点狂，动的蛋糕太大了，所以还是被老美台积电的一套组合拳给制裁的最惨，本文讲的 [BR100](https://zhida.zhihu.com/search?content_id=272187628&c

### 2. 1.1 BR100通用GPU介绍
![](https://pic1.zhimg.com/v2-a7fae90b329865e286413625e69a36fe_1440w.jpg) 从封装上采用了双Die设计，就是晶圆上切下来的两个芯粒（硅材质），采用封装技术（加一个铁皮，引出来引脚）封装到一块，这样外面看就是一个大号的芯片在电路板上。

### 3. 1.2 BR100架构
> 对于AI芯片的架构，总结有下面5点（AI芯片五步分析法）： 1. 簇：计算部分有很多的cluster就是簇 2. PE：簇里面有几个PE（处理引擎），一般是4个，里面有张量、标量等计算硬件算子 3. 调度：簇里面有调度器管理PE的计算

### 4. 2.寒武纪
![](https://pica.zhimg.com/v2-c06e29ade2d5eda262f4ab9ba800bcb0_1440w.jpg) 发展历程： ![](https://pica.zhimg.com/v2-5f9ea143c5dfe24dcb56dc488f6610fc_1440w.jpg)

### 5. 2.1 MLU03产品介绍
寒武纪产品架构官方公布的名称分为 MLU00 MLU01 MLU02 MLU03，分别对应于 1A、1H、1M、以及官方尚未公布型号的 [MLU370](https://zhida.zhihu.com/search?content_id=272187628&content_type=Article&match_order=1&q=MLU370&zhida_source=entity) 的处理器内核

## Evidence

- Source: [原始文章](raw/tech/soc-pm/AI系统/AI系统-15国内AI芯片介绍.md) [[../../raw/tech/soc-pm/AI系统/AI系统-15国内AI芯片介绍.md|原始文章]]

## Key Quotes

> "点赞、收藏、在看、划线和评论交流"

> "对于AI芯片的架构，总结有下面5点（AI芯片五步分析法）："

> "好在封装技术相对芯片制造难度小些，国产可以搞定。应该华为就用了芯片堆叠封装的方式来规避性能的缺陷，都是被迫的创新。"

> "然后华为就有了自己的NPU，这里要说一个华为是一个商业公司，并非技术至上，除了跟美帝硬刚外，产品质量好外，其他方面并不是消费者眼中想的那个样子，业界基本愿意跟华为合作的公司很少，奉行“拿来主义”，俗称“行业搅屎棍”，这里的寒武纪就这样被抛弃了，不过寒武纪从一个小公司发展壮大也离不开华为背书做的贡献，只能说相互利用。"

> "IPU作为PE，里面SRAM、调度都有，一个cluster把SRAM、调度又独立出来一个大的管理，这里面是不是太冗余了？把IPU里面的SRAM和调度拿出来只cluster里面有，甚至一个芯片只有一个大的调度和SRAM，所有的cluster共享不是更好"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/AI系统/AI系统-15国内AI芯片介绍.md) [[../../raw/tech/soc-pm/AI系统/AI系统-15国内AI芯片介绍.md|原始文章]]
