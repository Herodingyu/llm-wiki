---
title: "手机中的LPDDR为什么不能替代电脑里的DDR？谁速度更快？"
source: "https://zhuanlan.zhihu.com/p/259866605"
author:
  - "[[老狼​新知答主]]"
published:
created: 2026-05-02
description: "最近一个朋友向我提出了一个有趣的问题：“LPDDR4和DDR4现在主频都很高，LPDDR4又省电，有更好的能耗比，为什么DDR4还继续存在？”这着实是个好问题，脱口而出的答案又被我咽了下去。思考了一天，我们今天就来详细…"
tags:
  - "clippings"
---
[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog)

721 人赞同了该文章

最近一个朋友向我提出了一个有趣的问题：“LPDDR4和DDR4现在主频都很高，LPDDR4又省电，有更好的能耗比，为什么DDR4还继续存在？”这着实是个好问题，脱口而出的答案又被我咽了下去。思考了一天，我们今天就来详细对比一下。

我们首先要澄清三个误解：

**1.** 有人说这是个关公战秦琼的问题，也就是说，没有CPU同时支持两者。其实，现在很多CPU同时即支持LPDDR，又支持DDR。如 [Baytrail系列](https://zhida.zhihu.com/search?content_id=145878775&content_type=Article&match_order=1&q=Baytrail%E7%B3%BB%E5%88%97&zhida_source=entity) ，支持LPDDR3，和DDR3L；而最新的 [GML](https://zhida.zhihu.com/search?content_id=145878775&content_type=Article&match_order=1&q=GML&zhida_source=entity) ，则支持LPDDR4和DDR4。还有笔记本cml，也支持两者。

**2.** LPDDR仅仅提供32bit数据，不能满足x86 64bit数据位宽的需求。实际上这完全不是问题， [JEDEC Spec](https://zhida.zhihu.com/search?content_id=145878775&content_type=Article&match_order=1&q=JEDEC+Spec&zhida_source=entity) 定义了如何用LPDDR4提供64bit数据问题的方法，具体我们后节介绍原理的时候再解释。

**3.** LPDDR带宽比DDR低。实际上LPDDR4 [^1] 标准定义的带宽比DDR4标准更高：

![](https://picx.zhimg.com/v2-4b20fb87fbef2e78dbae8cf8ff72b505_1440w.jpg)

来源：JEDEC

现在已经有4266MT/s的LPDDR4了，当然DDR4也有类似频率（尽管不在Spec里）。如果频率一样，如都是2133MHz，LPDDR4和DDR4都可以提供每数据pin 4266Mbps的传输带宽。这点没有任何区别。

在厘清了这些误解后，在答案揭晓之前，我们还需要了解LPDDR和DDR的一些主要区别，这样有助于我们理解最后的数据。

## LPDDR4 vs DDR4

在本专栏中，我们介绍了很多DDR4的原理，这里不再赘述：

LPDDR4除了电压更低之外，它设计之初并不是给台式机用的。和它服务的嵌入式系统一样，它的目标市场往往是固定搭配的，这让它的配置少了很多灵活性。它的话语空间中，一个和DDR4重要的区别就是 [Channel](https://zhida.zhihu.com/search?content_id=145878775&content_type=Article&match_order=1&q=Channel&zhida_source=entity) 。

和LPDDR3每个芯片（Die，device）提供32bit的数据位宽不同，LPDDR4为了降低数据通路的长度，每个芯片分成两个Channel：

![](https://pic1.zhimg.com/v2-edac1aad4fbe221cf72bff5cb715dc78_1440w.jpg)

每个Channel提供16bit的数据位宽。是的，你没看错， **每个LPDDR4颗粒提供2个Channel** ！这和DDR4 Channel可以包含一到两个 [DIMM](https://zhida.zhihu.com/search?content_id=145878775&content_type=Article&match_order=1&q=DIMM&zhida_source=entity) （1DPC，2DPC），而每个DIMM则可以包含4到16个DDR4颗粒。这和DDR5的sub-channel也不同，后者是把DIMM分成两个子通道，而不是每个颗粒都提供两个通道。

这是个重要区别，为了能够提供x86的64bit数据位宽，需要4个LPDDR4，每个提供16bit位宽（想想为什么不是两个）：

![](https://picx.zhimg.com/v2-703e7601c8b6062780dde0c1c204f05b_1440w.jpg)

注意这种搭配还同时提供了两个Channel，它与下面这种DDR4标准搭配完全不同：

![](https://pic2.zhimg.com/v2-474c89f38e08ea88ac0b19b2ed6d4911_1440w.jpg)

LPDDR4每个颗粒有16个bank，但每个Channel都只有8个bank。而DDR4则支持 [Bank Group](https://zhida.zhihu.com/search?content_id=145878775&content_type=Article&match_order=1&q=Bank+Group&zhida_source=entity) ，并发性高很多。

原理够了，是可以看看数据了。

## Benchmark数据

我们希望在真实的硬件上一较高下，但会立刻陷入一个麻烦：尽管CPU支持两者，但没有任何一款真正的硬件上可以同时支持两者。那怎么办呢？只有借助于仿真器了，实际上有人已经帮我们比较过了，我们后面的数据都来自这篇论文：

A Performance & Power Comparison of Modern High-Speed DRAM Architectures [^2]

更妙的是该论文不但比较了LPDDR4和DDR4，更把几乎所有的DRAM架构都加进来了，十分难得，建议感兴趣的同学认真研读。好了，我们看看数据：

![](https://pic4.zhimg.com/v2-6a89dd6d780845f0a9cf01a1f21d7061_1440w.jpg)

来源：参考资料2

数据基于CPI，也就是cycles per instruction，指令平均时钟周期数，当然是越小越好了。可以看出DDR4比LPDDR4 CPI平均好6%。

![](https://pic2.zhimg.com/v2-b56694c8ca9e53b2b2c1b82d45aaf1bf_1440w.jpg)

DDR4相较LPDDR4，延迟低了很多。LPDDR4难道没有什么优点了吗？当然是功耗更低了：

![](https://pic3.zhimg.com/v2-1d399e7d842531209bf937d69c41eaac_1440w.jpg)

## 结论

详细内容还是建议大家详细读论文。这里稍微解释一下这个结果，DDR4相比LPDDR4，提供了Bank Group，并发性更好；时序（tRCD等）往往更低；价格更便宜。无怪乎能选DDR4，就不会用LPDDR4。但LPDDR4耗电低得多，在手机等等设备上还是必选它。

欢迎大家关注本专栏和用微信扫描下方二维码加入微信公众号"UEFIBlog"，在那里有最新的文章。

![](https://pica.zhimg.com/v2-121ecd3d4080deb1c557bf47dc00d246_1440w.jpg)

用微信扫描二维码加入UEFIBlog公众号

## 参考

还没有人送礼物，鼓励一下作者吧

编辑于 2020-09-30 22:28[三部门发文+新政解读：ODI备案如何助力企业成功出海【成功案例】](https://zhuanlan.zhihu.com/p/1987171790427006383)

[

2025年末，北京一家科技公司正式收到了其香港子公司项目的ODI备案批复。随着一纸文书落地， 一笔10万元人民币的资金，通过官方认可的合规渠道，有序汇往香港。这看似平常的跨境调动，...

](https://zhuanlan.zhihu.com/p/1987171790427006383)

[^1]: LPDDR4 Spec [https://www.jedec.org/sites/default/files/docs/JESD209-4.pdf](https://www.jedec.org/sites/default/files/docs/JESD209-4.pdf)

[^2]: Benchmark [https://user.eng.umd.edu/~blj/papers/memsys2018-dramsim.pdf](https://user.eng.umd.edu/~blj/papers/memsys2018-dramsim.pdf)