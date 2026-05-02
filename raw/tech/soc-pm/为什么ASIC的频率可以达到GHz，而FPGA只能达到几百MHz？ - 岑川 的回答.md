---
title: "为什么ASIC的频率可以达到GHz，而FPGA只能达到几百MHz？ - 岑川 的回答"
source: "https://www.zhihu.com/question/51179323/answer/124680433"
author:
  - "[[岑川Stay conscious​ 关注]]"
  - "[[荔枝童鞋]]"
  - "[[H.Wang深圳南山某高科技玩具厂的硬件研发]]"
published:
created: 2026-05-02
description: "人生第一次啊……竟然上了100赞……好多知乎上一直关注的学长和前辈们还有大V都给点了赞我好受鼓舞啊:-D…"
tags:
  - "clippings"
---
不坠青云之志、LogicJitterGibbs 等 1694 人赞同了该回答

![](https://picx.zhimg.com/50/1ebba50919599274f79a74fa59ac3c55_720w.jpg?source=2c26e567)

人生第一次啊……竟然上了100赞……好多知乎上一直关注的学长和前辈们还有大V都给点了赞我好受鼓舞啊:-D谢谢大家 其实如果是搞 FPGA 结构或者CAD的话，这些都是基础了，本人也只是个大四狗还在学习中。。。 看到点赞的基本都是搞IC的，你们都是我前辈，请指教:-D 以后我一定好好学习努力答题233:-D ———————————————— 为什么实现同样的电路，asic频率总是（几乎是一定）比FPGA要高？简单来看这是FPGA在要求“可重构”的特性时对速度做出的妥协。FPGA为了满足可重构的特性，被设计成了一个岛状的逻辑块矩阵电路，每个逻辑块里又有很多个相同的子逻辑块，每个子逻辑块中有要实现任意电路的各种元素，比如 LUT （逻辑查找表），用于组合逻辑的构成，和FF（ flip-flop ，即触发器）用于时序电路的构成。逻辑块之间是布线管道，其中有各种固定长短的线（segment）和连接这些线的开关们（switch）。一块Asic电路要实现一个逻辑电路，只需按照你的电路设计图纸按原样把电路刻在芯片上，里面加法器就是你在数电课本中看到的加法器，乘法器就是你所熟知的乘法器，导线也是你熟悉的不能再熟悉的，没有中断的一根金属线而已。 而FPGA呢？加法器可能已经不是你知道的那个加法器了（当然高端FPGA都有加法器的 hard logic 这个另算），它已经被FPGA综合工具变成了一堆LUTs，没错，就是前面所说的这些逻辑元素。乘法器同理。导线呢？不是一根不间断的直导线了，它首先要从一个逻辑块出发，先经过一个开关，进入布线管道，然后前面遇到了一个Switch Box（假设是Altera家的板子），也就是十字路口，经过十字路口中的开关跳转，它可能左拐了，然后又遇到一个SB，……几经周折，终于到了目的逻辑块的门口，又要经过一个开关，进入目的逻辑块和里面的逻辑元素相连，就这样构成一个可能再普通不过的加法器、乘法器，等等。 所以FPGA为什么频率肯定没有Asic高你现在一定清楚了。第一，实现同样的功能，FPGA需要更大的面积，在更大的面积的情况下，即使用纯导线，其导线总长度（或严格一点， critical path 的导线长度）也要比asic的电路长吧？第二，其实也是最重要的一点，就是布线结构（ routing architecture ）非常复杂，一条导线从a到b，一般总要经过几个开关，而这些开关都是有延时的，这个延时非常大，是FPGA频率不得提高的主要原因。 上图中粉色线为一整条等电平的“导线”，又臭又长。asic看到了肯定会嫌弃有没有啊…… 上图绿色方块是一个SB！粉色线还是刚刚那条“导线”。注意是“一条”导线哦。现在知道FPGA中导线们的十字路口有多复杂了吗？ （工具用的是 VPR \[2\]，学术界的开放综合工具。商业工具看不到这么详细的routing arch） 实际上，题主这个问题在06年已经被多伦多大学的课题组调研过了\[1\]，他们的研究表明，对于一个只有组合和时序逻辑（没有memory等）的电路来说，平均下来，在FPGA上实现需要40倍于asic电路的面积，3~4倍的关键路径延时，和12倍的功耗。而这里面其实吧，大多数都是布线结构的锅。面积上，布线结构一般要占FPGA总面积的60~70%左右，延时上，这个数字只会更高。所以FPGA的布线结构和布局布线算法是一个FPGA领域中很重要的一个研究方向。 要使FPGA做到完全和asic速度一样快应该是不可能的，这是由它的可重构特性直接决定的。但折中的办法不是没有，比如我前面提到hard logic，就是把一些通常使用频次很高的逻辑电路直接以asic的方式嵌入到FPGA里面，比如加法器乘法器等等，一旦要用到它们，也就不用再像以前那样用好多个逻辑块来造它了，这样就减小了面积、提高了速度、降低了功耗。现在高端一点的FPGA里面不仅有这些加法乘法器的小玩意，还有存储器，DSP，微处理器等等。它们的目的都是相同的，就是为了在保证可重构特性的情况下，尽量拉近与asic电路的距离，提高性能。 为了提高速度，还有很多方法，比如用流水线对逻辑做分段等等，这里就不多说啦。题主还有什么问题还都可以问我~ Ref: \[1\]. I. Kuon and J. Rose, “Measuring the gap between FPGAs and ASIC s,” in Proceedings of the Internation Symposium on Field Programmable Gate Arrays (FPGA ’06), Monterey, California, USA, ACM Press, New York, NY, Feb. 22–24, 2006, pp. 21–30. \[2\]. J. Rose, J. Luu, C. Yu, O. Densmore, J. Goeders, A. Somerville, K. Kent, P. Jamieson, and J. Anderson. The VTR Project: Architecture and CAD for FPGAs from Verilog to Routing. In ACM/SIGDA Int. Symposium on Field-Programmable Gate Arrays, pages 77–86, 2012. \[3\]. V. Betz, J. Rose, A. Marquardt, “Architecture & CAD For Deep- Submicron FPGAs”, Kluwer Academic Publishers, 1999.

[编辑于 2016-12-20 11:21](https://www.zhihu.com/question/51179323/answer/124680433)[嵌入式行业的前途怎么样？](https://www.zhihu.com/question/659194072/answer/34641840884)

[

我个人觉得还是可以的，可以参考下我的经历。我是本专业，但是学习的时候没有心思用在学习上，每科都是追求不挂科就行。一分耕耘一份收获，实习的时候就感觉到工作是真难找啊，投出...

](https://www.zhihu.com/question/659194072/answer/34641840884)

#### 更多回答

谢邀！

fpga是通过存储单元来实现逻辑的，存储单元是由门构成的，asic直接由门实现，实现同样的功能，fpga用到的逻辑单元比asic多。

后期布局布线也不一样。fpga是固定的布线和固定的优化策略，只能选择。asic有很强大的后端处理工具，策略更灵活，可以在性能，面积和功耗之间平衡。

这也是专用跟通用之间不可避免的博弈吧。

简单来讲，是实现逻辑的方法不同，FPGA是LUT+FF结构。ASIC可以完全定制，逻辑可以直接靠由晶体管构成的逻辑门实现。

以一个四输入一输出的组合逻辑来说，在FPGA中，需要使用一个4-LUT，实质上是一个16bit大小的SRAM，四个输入作为地址线，去寻址对应位的输出值。

LUT这种实现方法，相比于ASIC中直接利用晶体管构成的逻辑门，高下立判。

![](chrome-extension://difoiogjjojoaoomphldepapgpbgkhkb/assets/logo-O35E636P.png) Sider[「喝水都胖」的说法有科学依据吗？生理期怎么吃都不胖是真的吗？](https://www.zhihu.com/roundtable/zhiyoutanzhenjianfei?spu=biz%3D0%26ci%3D3707801%26si%3D0c8df66a-01db-4d85-8a60-0b9a5ad194e7%26ts%3D1777704628%26zid%3D3)

[导游称大熊猫花花是残疾游客秒报警 340 万](https://www.zhihu.com/search?q=%E5%AF%BC%E6%B8%B8%E7%A7%B0%E5%A4%A7%E7%86%8A%E7%8C%AB%E8%8A%B1%E8%8A%B1%E6%98%AF%E6%AE%8B%E7%96%BE%E6%B8%B8%E5%AE%A2%E7%A7%92%E6%8A%A5%E8%AD%A6&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[孙杨被曝疑违规录取博士 335 万](https://www.zhihu.com/search?q=%E5%AD%99%E6%9D%A8%E8%A2%AB%E6%9B%9D%E7%96%91%E8%BF%9D%E8%A7%84%E5%BD%95%E5%8F%96%E5%8D%9A%E5%A3%AB&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[女子徒手给月子里宝宝打耳洞 293 万](https://www.zhihu.com/search?q=%E5%A5%B3%E5%AD%90%E5%BE%92%E6%89%8B%E7%BB%99%E6%9C%88%E5%AD%90%E9%87%8C%E5%AE%9D%E5%AE%9D%E6%89%93%E8%80%B3%E6%B4%9E&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[曝吴宣仪提出解约遭乐华拒绝 291 万](https://www.zhihu.com/search?q=%E6%9B%9D%E5%90%B4%E5%AE%A3%E4%BB%AA%E6%8F%90%E5%87%BA%E8%A7%A3%E7%BA%A6%E9%81%AD%E4%B9%90%E5%8D%8E%E6%8B%92%E7%BB%9D&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[阿 Sa 蔡卓妍官宣结婚 290 万](https://www.zhihu.com/search?q=%E9%98%BF+Sa+%E8%94%A1%E5%8D%93%E5%A6%8D%E5%AE%98%E5%AE%A3%E7%BB%93%E5%A9%9A&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[广州地铁有人喷洒不明液体 267 万](https://www.zhihu.com/search?q=%E5%B9%BF%E5%B7%9E%E5%9C%B0%E9%93%81%E6%9C%89%E4%BA%BA%E5%96%B7%E6%B4%92%E4%B8%8D%E6%98%8E%E6%B6%B2%E4%BD%93&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)