---
title: "ARM攒机指南-后端篇"
source: "https://zhuanlan.zhihu.com/p/32368596"
author:
  - "[[重走此间路]]"
published:
created: 2026-05-02
description: "工作中经常遇到和做市场和芯片同事讨论PPA。这时，后端会拿出这样一个表格： 上图是一个A53的后端实现结果，节点是TSMC16FFLL+， 数据经过改动，并不是准确结果。我们就此来解读下。首先，我们需要知道，作为一个…"
tags:
  - "clippings"
---
[收录于 · ARM攒机指南](https://www.zhihu.com/column/c_70349842)

吴建明wujianming、LogicJitterGibbs 等 106 人赞同了该文章

工作中经常遇到和做市场和芯片同事讨论 [PPA](https://zhida.zhihu.com/search?content_id=5136617&content_type=Article&match_order=1&q=PPA&zhida_source=entity) 。这时，后端会拿出这样一个表格：

![](https://pic3.zhimg.com/v2-06aa2e4745a8f892d0d9af5bf296d32e_1440w.jpg)

上图是一个 [A53](https://zhida.zhihu.com/search?content_id=5136617&content_type=Article&match_order=1&q=A53&zhida_source=entity) 的后端实现结果，节点是 [TSMC16FFLL+](https://zhida.zhihu.com/search?content_id=5136617&content_type=Article&match_order=1&q=TSMC16FFLL%2B&zhida_source=entity) ， **数据经过改动，并不是准确结果。** 我们就此来解读下。

首先，我们需要知道，作为一个有理想的手机芯片公司，可以选择的工厂并不多， [台积电](https://zhida.zhihu.com/search?content_id=5136617&content_type=Article&match_order=1&q=%E5%8F%B0%E7%A7%AF%E7%94%B5&zhida_source=entity) （TSMC）， [联电](https://zhida.zhihu.com/search?content_id=5136617&content_type=Article&match_order=1&q=%E8%81%94%E7%94%B5&zhida_source=entity) （UMC）， [三星](https://zhida.zhihu.com/search?content_id=5136617&content_type=Article&match_order=1&q=%E4%B8%89%E6%98%9F&zhida_source=entity) ，Global Foundries（GF）， [中芯](https://zhida.zhihu.com/search?content_id=5136617&content_type=Article&match_order=1&q=%E4%B8%AD%E8%8A%AF&zhida_source=entity) （SMIC）也勉强算一个。还有，今年开始 [Intel工厂](https://zhida.zhihu.com/search?content_id=5136617&content_type=Article&match_order=1&q=Intel%E5%B7%A5%E5%8E%82&zhida_source=entity) （ICF）也会开放给ARM处理器。事实上有人已经开始做了，只不过用的不是第三方的物理库。通常新工艺会选TSMC，然后要降成本的时候会去UMC。GF一直比较另类，保险起见不敢选，而三星不太理别人所以也没人理他。至于SMIC，嘿嘿，那需要有很高的理想才能选。

16nm的含义我就不具体说了，网上很多解释。而TSMC的16nm又分为很多小节点，FFLL++，FFC等。他们之间的最高频率，漏电，成本等会有一些区别，适合不同的芯片，比如手机芯片喜欢漏电低，成本低的，服务器喜欢频率高的，不一而足。

接下来看表格第一排，Configuration。这个最容易理解，使用了四核A53，一级数据缓存32KB，二级1MB，打开了ECC和加解密引擎。这几个选项会对面积产生较大影响，对频率和功耗也有较小影响。

接下来是Performance target,目标频率。后端工程师把频率称作Performance，在做后端实现时，必须在频率，功耗，面积（PPA）里选定一个主参数来作为主要优化目标。这个表格是专门为高性能A53做的，频率越高，面积和漏电就会越大，这是没法避免的。稍后我再贴个低功耗小面积的报告做对比。

下面是Current Performance，也就是现在实现了的频率。里面的TT/0.9V/85C是什么意思？我们知道，在一个晶圆（Wafer）上，不可能每点的电子漂移速度都是一样的，而电压，温度不同，它们的特性也会不同，我们把它们分类，就有了PVT（Process，Voltage，  
Temperature），分别对应于TT/0.9V/85C。而Process又有很多Conner，类似正态分布，TT只是其中之一，按照电子漂移速度还可以有SS，S，TT，F，FF等等。通常后端结果需要一个Signoff条件（我们这通常是SSG），按照这个条件出去流片，作为筛选门槛，之下的芯片就会不合格，跑不到所需的频率。所以条件设的越低，良率（Yield）就会越高。但是条件也不能设的太低，不然后端很难做，或者干脆方程无解，跑不出结果。X86上有个词叫体质，就是这个PVT。

这一栏有两个频率，容易区分，就是不同的电压。在频率确定时，动态功耗是电压的2次方，这个大家都知道。

下一行是Optimized PVT。大家都知道后端EDA工具其实就是解方程，需要给他一个优化目标，它会自动找出最优局部解。而1.0V和0.9V中必须选一个值，作为最常用的频率，功耗和面积的甜点（Sweet Spot）。这里是选了1.0V，它的SSG和目标要求更接近，那些达不到的Corner可以作为降频贱卖。

再下一行是漏电Leakage，就是静态功耗。CPU停在那啥都不跑也会有这个功耗，它包含了四个CPU中的逻辑和一级缓存的漏电。但是A53本身是不包含二级缓存的，其他的一些小逻辑，比如SCU（Snooping Control Unit）也在CPU核之外，这些被称作Non-CPU，包含在MP4中。我们待机的时候就是看的它，可以通过power gating关掉二三级缓存，但是通常来说，不会全关，或者没法关。

下面是Dynamic Power，动态功耗。基本上我见过的CPU在测量动态功耗的时候，都是跑的Dhrystone。Dhrystone是个非常古老的跑分程序，基本上就是在做字符串拷贝，非常容易被软件，编译器和硬件优化，作为性能指标基本上只有MCU在看了。但是它有个好处，就是程序很小，数据量也少，可以只运行在一级缓存（如果有的话），这样二级缓存和它之后的电路全都只有漏电。虽然访问二级三级缓存甚至DDR会比访问一级缓存耗费更多的能量，但是它们的延迟也大，此时CPU流水线很可能陷入停顿。这样的后果就是Dhrystone能最大程度的消耗CPU核心逻辑的功耗，比访问二级以上缓存的程序都要高。所以通常都拿Dhrystone来作为CPU最大功耗指标。实际上，是可以写出比Dhrystone更耗电的程序的，称作 [Max Power Vector](https://zhida.zhihu.com/search?content_id=5136617&content_type=Article&match_order=1&q=Max+Power+Vector&zhida_source=entity) ，做SoC功耗估算的时候会用上。

动态功耗和电压强相关。公式里面本身就是2次方，然后频率变化也和电压相关，在跨电压的时候就是三次方的关系了。所以别看1.0V只比0.72V高了39%，最终动态功耗可能是3倍。而频率高的时候，动态功耗占了绝大部分，所以电压不可小觑。

此外，动态功耗和温度相关，SoC运行的时候不可能温度维持在0度，所以功耗通常会拿85度或者更高来计算，这个就不多说了。

下一行是Area，面积。面积是芯片公司的立足之本，和毛利率直接相关。所以在性能符合的情况下，越小越好，甚至可以牺牲功耗，不惜推高电压，所以有了加压（Over Drive）。有个数据，当前28nm上，每个平方毫米差不多是10美分的成本，一个超低端的手机芯片怎么也得30mm（200块钱那种手机用的，可能你都没见过，还是智能机），芯片面积成本就是3刀，这还不算封测，储存和运输。低端的也得是40mm（300块的手机）。我们常见的600-700块钱的手机，其中六分之一成本是手机芯片。当然，反过来，也有人不缺钱的，比如苹果，据说A10在16nm上做到了125mm，换算成这里的A53MP4，单看面积不考虑功耗，足足可以放120个A53，这可是跑在2.8G的A53，如果是1.5G的，150个都可能做到。

为了控制功耗，在做RTL的时候就需要插入额外晶体管，做 [Clock Gating](https://zhida.zhihu.com/search?content_id=5136617&content_type=Article&match_order=1&q=Clock+Gating&zhida_source=entity) ，而且这还是分级的，RTL级，模块级，系统级，信号时钟上也有（我看到的SoC时钟通常占了整个逻辑电路功耗的三分之一）。这样一套搞下来，面积起码大1/3.然后就是 [Power Gating](https://zhida.zhihu.com/search?content_id=5136617&content_type=Article&match_order=1&q=Power+Gating&zhida_source=entity),也是分级的。最简单的是每块缓存给一个开关，模块也有一个开关。复杂的根据不同指令，可以计算出哪些Cache bank短时间内不用，直接给它关了。Power Gating需要的延时会比Clock Gating大，有的时候如果操作很频繁，Power Gating反而得不偿失，这需要仔细的考量。而且，设计的越复杂，验证也就越难写，这里面需要做一个均衡。除了时钟域，电源域，还有电压域，可以根据不同频率调电压。当然了，域越多，布线越难，面积越大。

再往上，可以定义出不同的power state，让上层软件也参与经来，形成电源管理和调度。

影响面积的因素，上面只是前端，后端还有一堆考量。首先就是表格下一排， [Metal Stack](https://zhida.zhihu.com/search?content_id=5136617&content_type=Article&match_order=1&q=Metal+Stack&zhida_source=entity) 。芯片制造的时候是一层层蚀刻的，而蚀刻的时候需要一层层打码，免得关键部分见光，简称Mask。这里的11m就表示有11层。晶体管本身是在最底层的，而走线就得从上面走，层数越多越容易，做板子布线的同学肯定一看就明白了。照理说这就该多放几层，但是工厂跟你算钱也是按照层数来的，越多越贵。层数少了不光走线难，总体面积的利用率也低，像A53，11层做到80%的利用率就挺好了。所以芯片上不是把每个小模块面积求和就是总体面积，还得考虑布局布线（PR，Placing&Routing），考虑面积利用率。

再看表格下两排，Logic Architecture和Memory。这个也容易理解，就是逻辑和内存，数字电路的两大模块分类。这个内存是片上静态内存，不是外面的DDR。 [uLVT](https://zhida.zhihu.com/search?content_id=5136617&content_type=Article&match_order=1&q=uLVT&zhida_source=entity) 是什么意思呢，Ultra Low Voltage Threshold，指的是标准逻辑单元（Standard Cell）用了超低电压门限。电压低对于动态功耗当然是个好事，但是这个标准单元的漏电也很高，和频率是对数关系，也就是说，漏电每增加10倍，最高频率才增加log10%。后端可以给EDA工具设一个限制条件，比如只有不超过1%的需要冲频率的关键路径逻辑电路使用uLVT，其余都使用LVT，SVT或者HVT（电压依次升高，漏电减小），来减小总体漏电。

对于动态功耗，后端还可以定制晶体管的源极和漏极的长度，越窄的电流越大，漏电越高，相应的，最高频率就可以冲的更高。所以我们有时候还能看到uLVT C16，LVT C24之类的参数，这里的C就是指Channel Length。

接下去就是Memory，又作Memory Instance，也有人把它称作FCI（Fast Cache Instance）。访问Memory有三个重要参数，read，write和setup。这三个参数可以是同样的时间，也可以不一样。对于一级缓存来说基本用的是同样的时间，并且是一个时钟周期，而且这当中没法流水化。从A73开始，我看到后端的关键路径都是卡在访问一级缓存上。也就是说，这段路径能做多快，CPU就能跑到多快的频率，而一级缓存的大小也决定了索引的大小，越大就越慢，频率越低，所以ARM的高端CPU一级缓存都没超过64KB，这和后端紧密相关。当然，一级缓存增大带来的收益本身也会非线性减小。之后的二三级缓存，可以使用多周期访问，也可以使用多bank交替访问，大小也因此可以放到几百KB/几MB。

逻辑和内存统称为Physical Library，物理库，它是根据工厂给的每个工艺节点的物理开发包（PDK）设计的，而Library是一个Fabless芯片公司能做到的最底层。能够定制自己的成熟物理库，是这家公司后端领先的标志之一。

最后一行，Margin。这是指的工厂在生产过程中，肯定会产生偏差，而这行指标定义了偏差的范围。如下图：

![](https://pic3.zhimg.com/v2-9d76ddc85550b7eae1400bcee4dc4ff4_1440w.jpg)

蓝色表示我们刚才说的一些Corner的分布，红色表示生产偏差Variation。必须做一些测试芯片来矫正这些偏差。SB-OCV表示stage-based on-chip variation，和其他的几个偏差加在一起，总共+-7%，也就是说会有7%的芯片不在后端设计结束时确定的结果之内。

后面还有一些setup UC之类的，表示信号建立时间，保持时间的不确定性（Uncertainty），以及PLL的抖动范围。

至此，一张报告解读完毕，我们再看看对应的低功耗版实现版本：

![](https://picx.zhimg.com/v2-24ae79a0866126a131910357dc6a56bf_1440w.jpg)

这里频率降到1.5G左右，每Ghz动态功耗少了10%，但是静态降到了15mW，只有30%。我们可以看到，这里使用了LVT，没有uLVT，这就是静态功耗能够做低的原因之一。由于面积不是优化目标，其它基本没变，这个也是可以理解的，因为Channel宽度没变，逻辑的面积没法变小，逻辑部分的低利用率也使得变化基本看不出来。

编辑于 2019-07-23 19:21[实测了市面所有AI代码工具后，我们发现【AI】和【低代码】真相](https://zhuanlan.zhihu.com/p/1982031286123120136)

[

引言：泡沫与焦虑最近，豆包AI手机和各类“一句话生成代码”的视频刷屏了。作为在低代码领域深耕10年的团队，我们和大家一样兴奋，也曾有过担心： 以后还需要低代码平台吗？直接让AI...

](https://zhuanlan.zhihu.com/p/1982031286123120136)