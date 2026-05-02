---
title: "IC设计，怎么实现面积和时序的均衡优化？"
source: "https://zhuanlan.zhihu.com/p/24103386"
author:
  - "[[龚黎明​中央处理器 (CPU)等 2 个话题下的优秀答主]]"
published:
created: 2026-05-02
description: "今天讲一个简单的小案例，希望大家从这个案例中学到IC设计最基本的设计优化方法。 时序、功耗和面积是IC设计中最基本的矛盾面，很多时候都是得到这个就要牺牲另一个，比如为了时序更好就要插入流水线增加面积。但…"
tags:
  - "clippings"
---
[收录于 · 半导学社](https://www.zhihu.com/column/stephen)

李一雷 等 107 人赞同了该文章

今天讲一个简单的小案例，希望大家从这个案例中学到IC设计最基本的设计优化方法。

时序、功耗和面积是IC设计中最基本的矛盾面，很多时候都是得到这个就要牺牲另一个，比如为了时序更好就要插入 [流水线](https://zhida.zhihu.com/search?content_id=1827845&content_type=Article&match_order=1&q=%E6%B5%81%E6%B0%B4%E7%BA%BF&zhida_source=entity) 增加面积。但是坑爹的是，并没有什么固定的规律可行，也有很多时候，采用某些方法，既可以得到更小的面积，也可以得到更好的时序。也有的时候即可以降低功耗，也可以降低面积。总之，没有绝对的规律。

今天不讲功耗，只讲时序和面积。

一般而言，写完的design，我们都会做一个简单的综合，看下 [时序裕量](https://zhida.zhihu.com/search?content_id=1827845&content_type=Article&match_order=1&q=%E6%97%B6%E5%BA%8F%E8%A3%95%E9%87%8F&zhida_source=entity) 怎么样。时序好的话，可以给后端的布局布线带来很大的好处，省去了重复迭代的次数。时序裕量太小，则不是个好消息，后续 [STA](https://zhida.zhihu.com/search?content_id=1827845&content_type=Article&match_order=1&q=STA&zhida_source=entity) 和布线会有很大麻烦。当然时序裕量太大，其实也是一种浪费。而设计者，需要在时序和面积之间做平衡。时序太紧，要想办法缓解，时序太松，要想办法做的更紧凑一点。

我之前做的一个设计，里面有一个步骤是这样的：输入6个5bit宽的数a,b,c,d,e,f；然后要求五个值:out1,out2,out3,out4,out5。其中：

out1=b+c+d+e+f;

out2=a+c+d+e+f;

out3=a+b+d+e+f;

out4=a+b+c+e+f;

out5=a+b+c+d+f;

**第一版设计**

当时时钟要求是300M。我的设计方法很简单，考虑到5个输出有大量的重复计算，比如out1和out2都计算了c+d+e+f，浪费面积，没有必要，所以将算法优化为下面的解法(=表示组合逻辑运算，<=表示左边是寄存器)：

sum=a+b+c+d+e+f;

out1<=sum-a;

out2<=sum-b;

out3<=sum-c;

out4<=sum-d;

out5<=sum-e;

这种好处是节省面积，没有重复计算，sum可以被复用5次，总共需要10个 [加法器](https://zhida.zhihu.com/search?content_id=1827845&content_type=Article&match_order=1&q=%E5%8A%A0%E6%B3%95%E5%99%A8&zhida_source=entity) （减法也是加法器来实现）。缺点就是路径太长，需要先求5个加法，然后求1个减法。但是综合之后，timing裕量还行，有个正十几ps。

**第二版设计**

后来，我们的新项目要升级，将时钟从300M提高到了400M，我用 [DC综合](https://zhida.zhihu.com/search?content_id=1827845&content_type=Article&match_order=1&q=DC%E7%BB%BC%E5%90%88&zhida_source=entity) 之后，发现采用第一版的算法timing变得很紧张，slack为0，而且因为timing太紧，综合工具不得不采用更大的cell和插更多的buffer，模块面积一下子增大了40%。考虑到timing紧是面积增大的主因，为了优化timing，我采用了最原始的算法：

out1<=b+c+d+e+f;

out2<=a+c+d+e+f;

out3<=a+b+d+e+f;

out4<=a+b+c+e+f;

out5<=a+b+c+d+f;

一综合，发现timing确实变好了很多，路径变短了，每级寄存器只有4个加法器，slack有100ps，但是面积增加了50%，因为用到了20个加法单元，加法器的数量比上一版翻了一倍。简单来说：timing过好，面积过大。

**第三版设计**

考虑到上述算法，虽然timing好，但是复用性太差，加法器太多，我又改成了下面这种：

sum0 = a+b;

sum1 = c+d;

sum2 = e+f;

out1 <= b+sum1+sum2;

out2 <= a+sum1+sum2;

out3 <= sum0+d+sum2;

out4 <= sum0+c+sum2;

out5 <= sum0+sum1+f;

新算法加法器总共需要13个，每个寄存器的路径仍然是4级加法器。面积相比于第一版增加了30%，timing slack为+20ps，虽然slack比第二版少了很多，但是在够用的前提下，面积却优化了，达到了面积和timing的比较好的一个平衡点。这就是最终的设计。

这只是一个很简单的计算单元的例子。这个计算单元的设计，在300M的时候和400M的时候，分别采用了不同数量的加法器单元来实现同样的功能。需要知道的是，我在做这个设计的时候，事先并不知道300M和400M在 [RTL](https://zhida.zhihu.com/search?content_id=1827845&content_type=Article&match_order=1&q=RTL&zhida_source=entity) 上有多大的差距，Coding策略的改变是因为我做了DC综合，评估了面积和timing之后，得到了清晰的指标才做的调整。没有人可以做到写RTL的时候凭空做优化，凭直觉就直接写出来最合适的Coding出来。某种程度上说，设计优化的步骤基本都是对照综合结果和所需的功能case by case研究出来的，因此也就没有普适的技巧。

硬件设计跟软件设计最大的区别，就在于硬件设计你可以决定采用多少硬件资源，面积是不固定的，时钟也是可以调整的。这就决定了硬件设计的巨大灵活性。这种灵活性数据结构教不了，基本都是经验。数据结构可以告诉你怎么做链表，怎么排序，但是一个排序算法落实到硬件上，实现起来又是千奇百怪。很多时候，都是case by case的分析。这也是为什么鲜少见到普适的硬件架构，因为底层的细节太多了。

不过硬件优化的灵魂其实很明确，是 **效率** 。我们希望不常用的功能尽量少耗电，希望常用的功能尽量运算的快；希望信号之间减少等待和延迟，又希望增加握手提高可靠性；希望一次传输尽量做得多，又希望零零碎碎的传也支持；希望缓冲区小以减少成本，又希望缓冲区快增加效率；希望各种path延时齐整一点好提频，又希望非核心功能降频少耗电；希望关键path能多给资源尽量快的出结果，希望非关键path慢慢算以减少资源；希望某些模块能够分时复用减少资源，希望某些部分增加资源以提高并行度；希望出错能现场纠错，又希望能预测投机。这些基本都是无规律的东西，无法用公式表达，确切描述的，但是都指向一个目标，效率。

效率这个东西虽然没有公式，但是设计人员的 **直觉** 通常能够观察到。当我们观察一个系统的时候，挑出哪些地方效率不高通常并不难，因为我们知道哪些模块重要，哪些模块次要，哪些path关键，哪些path不关键，因此一个模糊的直觉很容易告诉我们大致的方向，剩下的就是试，看参数做取舍。这也是我本人觉得，为什么IC设计一直停留在RTL阶段的原因。因为人的因素还是太大，人能做的还是太多，所以 [EDA工具](https://zhida.zhihu.com/search?content_id=1827845&content_type=Article&match_order=1&q=EDA%E5%B7%A5%E5%85%B7&zhida_source=entity) 不能胜任，只能人自己来做。

欢迎大家关注我的微信公众号： **半导学社。**

还没有人送礼物，鼓励一下作者吧

编辑于 2020-08-20 07:07