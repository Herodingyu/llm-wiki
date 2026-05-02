---
title: "同型号同款 CPU 为什么会有「体质」之分？ - yx huang 的回答"
source: "https://www.zhihu.com/question/24622588/answer/28662486"
author:
  - "[[yx huang硅工中最像码农的​ 关注]]"
  - "[[Ricky Li​中央处理器 (CPU)话题下的优秀答主]]"
  - "[[知乎用户U4wM0x]]"
published:
created: 2026-05-02
description: "好了，这个十分接近于自己方向的问题。楼上答得都很不错了，我来说下自己的看法。主要是电路设计的角度。…"
tags:
  - "clippings"
---
36 人赞同了该回答

![](https://picx.zhimg.com/50/e4b637349c1a1df842327aa599dcf9ac_720w.jpg?source=2c26e567)

好了，这个十分接近于自己方向的问题。楼上答得都很不错了，我来说下自己的看法。主要是电路设计的角度。在物理成因上的接触不算多，有工艺仔可以出来答答。 任何物品都是非理想的，对于芯片来说说也一样。同批次生产出来的芯片，就是会不同，以下称为 分布 （variability）。这个分布有 硅片 硅片（D2D）不同，也硅片间不同（WID）。这些不同主要的体现就是开关速度（ 门间延时 ），以及 静态功耗 。当然，因为分布产生的器件坏死，短路等效应我们先不考虑。 在过去，基本只用考虑D2D分布，因为它决定了一片芯片不同于另一片芯片，简单来说就是电路延时/最高频率的限制（timing closure）。而WID分布则不用考虑，一则这个不同不大，二则因为他们相互可以抵消：一个管子快一个管子慢，最后总延时。 而现在28nm往下，大家也越来越看重WID的分布了，特别是对于intel这种CPU，因为频率很高， 寄存器 到寄存器间门很少，相互抵消作用不明显。所以WID的分析越来越重要。 在过去，分布产生的主要原因就是 阈值电压 （Vth）的分布，这个阈值电压高了，管子（芯片）就变慢，但是静态功耗就升高了（省电）。静态功耗就是芯片什么活都不干消耗的能量。这个对于Intel这种1.8billion个管子的CPU来说，已经不可忽视了。所以这个阈值电压就是一个平衡，高了不好低了也不好。 阈值电压的改变对于Intel这种CPU的速度的影响其实不是很大。相反，那些低电压低功耗的器件（比如医疗用的小感应器）对于阈值电压很敏感，所以过去体质的研究主要在这里。 好了，说现在。我的感觉，省电基本是第一要务，速度较之上一代维持稳定即可。所以，现在器件的电压越来越低，0.9V很常见，甚至0.6V的都有见过。那么对于阈值电压就敏感了。而且重要的问题是，不仅现在对于阈值电压敏感，主要还有因为门越来越小，门间 金属连线 确没有减小，所以速度越来越依靠于片上连线（metal layer）。现在连线的分布（roughness）也很影响速度。还就就是连线电阻会造成门的实际电压因为连线电阻的作用而降低（ IR drop ）。例如：10%的电压降低可导致速度降低一倍多（28nm）。 总结以上，就是器件越来越小，分布效应越来越明显。解决办法：最简单就是加电压。保证最慢的那块芯片都能工作（margin based design）。那样其他都能工作。但这样太浪费了。所以有了一些新的解决办法，主要就是为每片片子设定一个最合适的工作电压或者频率。当让还有调节管子的阈值电压（body-biasing），这个不展开讲了。 关于方法，我非常喜欢如下这张图：（来自UCSD 的prof. Khang） 上文提到的生产一批次，找出快的片子卖得贵，慢的片子卖得便宜就是属于以上的Post-silicon characterization的办法。据说Intel花了很多时间在这种生产后调试上，而且用了很多年了。 再总结，对于芯片：快不是目的，稳定低功耗并且较快地工作才是目的。 恳请Intel或者高通仔来说说实际生产过程中，真正用了哪些控制分布的办法。

[编辑于 2014-08-02 18:11](https://www.zhihu.com/question/24622588/answer/28662486)[芯片设计行业也是吃年轻饭吗？](https://www.zhihu.com/question/393826075/answer/2711075237)

[

多学一样本事，就少说一句求人的话，现在的努力，是为了以后的不求别人，实力是最强的底气。芯片设计行业为什么不是青春饭，而是越老越值钱？一哥今天来给大家分析一波，请大家不要焦...

](https://www.zhihu.com/question/393826075/answer/2711075237)

#### 更多回答

编辑推荐

![](https://picx.zhimg.com/50/abcb6b7256e9d6bfa26b18007776670b_720w.jpg?source=1def8aca)

@Zhe Liu的回答精炼准确, 我再贴几张图解释Process Variation是怎样影响CPU的. 通俗CPU的"体质", 实际上是指CPU能正常工作的电压/频率的区间. 这个区间可以用这样的图来表示: 生产这个图的方法是让CPU工作在一组不同的电压/频率节点上, 然后跑一套测试, 结果正确就标绿色, 否则标红色. 那么"体质"好的CPU的图应该是这样的: 体质好的CPU, 可以通过增加电压, 让CPU工作在更高的频率上且不会发生"错误". 由于这种"错误"仅在频率高的时候出现, 所以它的发生和CPU的工作频率是相关的. 这种错误的学名叫做Delay Fault. 意思就是时间太短了, 电信号来来不及通过所有的逻辑门. 导致这种错误的, 是两方面的原因, 一个是数字电路的设计过程中, 两个寄存器之间的元器件太多, 速度根本就快不了. 另一个是电路挺正常的, 但是代工厂的工艺不行, 生产的芯片质量不好. 对于第一种情况, 可以用下面这个电路图来解释 (请原谅粗糙的画图技术..) 每两个寄存器(图中用R表示)之间的电路都需要在1个时钟周期内完成. 但是图中红色路径的长度远大于绿色路径, 使得当时钟频率升高时, 红色路径很可能来不及走完, 于是产生了错误. 像这样的关键路径延迟过大的问题对同一型号的全部CPU都是存在的, 它本身不会带来体质差异, 但是它和第二种情况的结合会影响CPU的体质. 对于第二种情况, 可以参考下面的工艺图 左边是28nm下使用double pattern后的工艺, 右边则没有使用double pattern. 可以看到, 左边工艺中, 脊状物(应该是Poly)的process variation非常小, 而右边工艺的process variation则比较大. 如果使用右图中的工艺来生产CPU, 并且碰巧在CPU的关键路径上生成的Poly/Via/Metal质量很差, 那么这一片CPU就会对频率很敏感. 如果使用左图的工艺, 生产出来的CPU会质量差异较小, 而且质量普遍高于右图工艺. 因此工艺和设计的复合作用, 是导致CPU的体质不一的原因. 这怎么会是玄学?

CPU这玩意生产时候同系列都是一个晶圆切割出来的 至于2.5G和3.0G区别都是后期测试后才定频 举例一下 100块芯片有50个能稳定2.5G 剩下的如有神助都是上3.0G 那市场上就会卖出两种各50颗 厂家当然愿意这样赚得多点 问题来了 广大屌丝觉得2.5更划算啊 都不愿意买3.0的了 厂家就想了 卖不出去的3.0本来成本和2.5就一样啊 为毛我要放在仓库落灰呢 干脆我们拿25颗定成2.5G卖算了 于是 市场上就出现了25颗2.5G包超3.0的超频神器

以上都是做梦之余胡说八道 个人拙见博看官一笑而已 勿喷

![](chrome-extension://difoiogjjojoaoomphldepapgpbgkhkb/assets/logo-O35E636P.png) Sider

[导游称大熊猫花花是残疾游客秒报警 340 万](https://www.zhihu.com/search?q=%E5%AF%BC%E6%B8%B8%E7%A7%B0%E5%A4%A7%E7%86%8A%E7%8C%AB%E8%8A%B1%E8%8A%B1%E6%98%AF%E6%AE%8B%E7%96%BE%E6%B8%B8%E5%AE%A2%E7%A7%92%E6%8A%A5%E8%AD%A6&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[孙杨被曝疑违规录取博士 335 万](https://www.zhihu.com/search?q=%E5%AD%99%E6%9D%A8%E8%A2%AB%E6%9B%9D%E7%96%91%E8%BF%9D%E8%A7%84%E5%BD%95%E5%8F%96%E5%8D%9A%E5%A3%AB&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[女子徒手给月子里宝宝打耳洞 294 万](https://www.zhihu.com/search?q=%E5%A5%B3%E5%AD%90%E5%BE%92%E6%89%8B%E7%BB%99%E6%9C%88%E5%AD%90%E9%87%8C%E5%AE%9D%E5%AE%9D%E6%89%93%E8%80%B3%E6%B4%9E&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[曝吴宣仪提出解约遭乐华拒绝 289 万](https://www.zhihu.com/search?q=%E6%9B%9D%E5%90%B4%E5%AE%A3%E4%BB%AA%E6%8F%90%E5%87%BA%E8%A7%A3%E7%BA%A6%E9%81%AD%E4%B9%90%E5%8D%8E%E6%8B%92%E7%BB%9D&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[阿 Sa 蔡卓妍官宣结婚 289 万](https://www.zhihu.com/search?q=%E9%98%BF+Sa+%E8%94%A1%E5%8D%93%E5%A6%8D%E5%AE%98%E5%AE%A3%E7%BB%93%E5%A9%9A&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[广州地铁有人喷洒不明液体 266 万](https://www.zhihu.com/search?q=%E5%B9%BF%E5%B7%9E%E5%9C%B0%E9%93%81%E6%9C%89%E4%BA%BA%E5%96%B7%E6%B4%92%E4%B8%8D%E6%98%8E%E6%B6%B2%E4%BD%93&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)