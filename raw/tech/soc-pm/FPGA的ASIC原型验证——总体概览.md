---
title: "FPGA的ASIC原型验证——总体概览"
source: "https://zhuanlan.zhihu.com/p/106153830"
author:
  - "[[Kevin Zhang爱瑶瑶，爱生活]]"
published:
created: 2026-05-02
description: "前言随着芯片性能的提高、集成越来越多的SOC、IP，芯片的复杂度也愈发复杂，给芯片验证带来了资金和时间上挑战。FPGA可以进行RTL验证、加速仿真进度、提前进行嵌入式及相关应用的研发，因此FPGA的ASIC原型验证在现…"
tags:
  - "clippings"
---
[收录于 · 一个AI芯片的FPGA原型验证](https://www.zhihu.com/column/c_1210541663111946240)

57 人赞同了该文章

## 前言

随着芯片性能的提高、集成越来越多的SOC、IP，芯片的复杂度也愈发复杂，给芯片验证带来了资金和时间上挑战。FPGA可以进行 [RTL验证](https://zhida.zhihu.com/search?content_id=111720014&content_type=Article&match_order=1&q=RTL%E9%AA%8C%E8%AF%81&zhida_source=entity) 、加速仿真进度、提前进行 [嵌入式](https://zhida.zhihu.com/search?content_id=111720014&content_type=Article&match_order=1&q=%E5%B5%8C%E5%85%A5%E5%BC%8F&zhida_source=entity) 及相关应用的研发，因此FPGA的 [ASIC](https://zhida.zhihu.com/search?content_id=111720014&content_type=Article&match_order=1&q=ASIC&zhida_source=entity) 原型验证在现在的数字芯片设计中是必不可少的。

但是，我们也要看到FPGA原型的一些限制：

1. 规模限制：FPGA资源规模比较小，需要多片FPGA共同协同将芯片所有功能放进去；
2. 速度限制：芯片的频率在一般1GHz以上，但是FPGA中的频率在20MHz以下，在多片FPGA的芯片验证中甚至低于5MHz；
3. 功耗限制：FPGA的功耗一般在芯片的10倍以上；
4. 结构限制：FPGA的结构有它特有的IO、PHY、RAM、IP，这会导致芯片的验证无法和ASIC完全相同。

在FPGA的ASIC验证中，我们需要对ASIC的代码做相应修改，以完成对应功能，甚至有些IP是无法覆盖的。

## FPGA资源

下面对FPGA的资源逐一对比，如下表格所示。除了普通的RTL逻辑和基本端口，其他的类似存储时钟DSP等，最好都手动映射，这也意味着ASIC在转为FPGA验证平台中哪些内容是需要重点关注的，并手动分配的。

![](https://pic1.zhimg.com/v2-235ce3ac0dee82bf7f39f1dbecd76290_1440w.jpg)

## FPGA的ASIC的原型验证步骤

1. FPGA仿真平台选型
2. 把ASIC转成FPGA代码
3. FPGA综合分析
4. 载入软件运行，调试
5. 软硬件系统协同验证

### FPGA仿真平台

FPGA仿真平台选型主要关心一下几个方面：

1. 容量：门数按照多一倍预估、Block RAM、时钟资源尽量多
2. 内置IP：首要考虑，按照需求支持PCIE、DDR4等
3. 接口：IO一般来说都够用
4. 速度：要求比较低

目前来看一般单颗FPGA都不能支持大的数字芯片的逻辑量，一般我们采用两种方式解决。一是逻辑拆分，单独验证。但这种方式的风险太高，也丧失了整体验证的能力，一般不使用。二是多片联合进行原型验证，这种方式就涉及到划片，划片是否合理，ASIC到FPGA的转换，这些会产生新的问题，增加了验证的难度，这也是我们现在主流的验证方式，如 [HAPS平台](https://zhida.zhihu.com/search?content_id=111720014&content_type=Article&match_order=1&q=HAPS%E5%B9%B3%E5%8F%B0&zhida_source=entity) ， [S2C平台](https://zhida.zhihu.com/search?content_id=111720014&content_type=Article&match_order=1&q=S2C%E5%B9%B3%E5%8F%B0&zhida_source=entity) 等。

### ASIC代码转为FPGA代码

一般纯的RTL可以直接综合成对应资源，但是pad、Gate-level netlists、SOC cell、SOC Memory、特殊IP、BIST、Gated Clock、Clock无法这样做，我们需要做特殊的调整。

对于ASIC的详细修改方案， *我后面会结合项目单独再写具体的实现方式与注意点（挖坑）* 。

### 其它

其他调试中有意思的事情，可能一个小问题耽误几星期的BUG，关于FPGA的综合、划片、上板调试， *我也会单独写文章介绍（挖坑）* 。

## 总结

本文主要介绍了FPGA的ASIC原型验证概况、FPGA资源对比、步骤。最重要的是给自己挖了些坑，结合最近的一个大的芯片项目，会把这些坑都给填上，为了加速自己填坑，预约下两篇的内容：

## 参考文献

1. [FPGA-Based Prototyping Methodology Manual](https://link.zhihu.com/?target=https%3A//www.synopsys.com/company/resources/synopsys-press/fpga-based-prototyping-methodology-manual.html)

还没有人送礼物，鼓励一下作者吧

编辑于 2020-02-11 00:19[ASIC](https://www.zhihu.com/topic/19650409)[芯片设计](https://www.zhihu.com/topic/19769031)[现场可编辑逻辑门阵列（FPGA）](https://www.zhihu.com/topic/19570427)[【经验】做完模拟IC流片项目，入职老牌IC大厂！](https://zhuanlan.zhihu.com/p/1918724130510968664)

[

大家好，我是 IC 修真院模拟流片班级的小Y。 站在即将踏入 IC 验证行业的门槛前，内心满是感慨。这段从迷茫到坚定的学习求职之旅，有太多故事与经验想和大家分享，希望能给大家提供一...

](https://zhuanlan.zhihu.com/p/1918724130510968664)