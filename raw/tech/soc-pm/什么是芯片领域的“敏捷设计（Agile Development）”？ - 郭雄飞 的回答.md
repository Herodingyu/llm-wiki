---
title: "什么是芯片领域的“敏捷设计（Agile Development）”？ - 郭雄飞 的回答"
source: "https://www.zhihu.com/question/288483086/answer/471249764"
author:
  - "[[郭雄飞开源非狂热爱好者​ 关注]]"
  - "[[路桑]]"
  - "[[其实我是老莫框图级芯片设计研究人员…]]"
published:
created: 2026-05-02
description: "先从祖师爷的Slide看起来吧，顺便纠正下其他答主的一些观点，IC是可以做敏捷的，迭代的流程可以足够短，…"
tags:
  - "clippings"
---
21 人赞同了该回答

![](https://pica.zhimg.com/50/v2-e423261a68aa489a6e93e8cced1e6186_720w.jpg?source=2c26e567)

先从祖师爷的Slide看起来吧，顺便纠正下其他答主的一些观点，IC是可以做敏捷的，迭代的流程可以足够短，迭代过程中不一定要流片，所以也可以应用 Scrum 。 一个数据是 SiFive 目前从给客户提需求到可以TO的周期是1个半月。 BTW， chisel 生成的 verilog ， EDA工具 可以支持的很好，所以可以说短期内不用担心EDA不支持的问题，验证做足就好了；长期的，chisel/firrtl/abc/yosys/arachne-pnr这些工具会逐渐完善，打通到fab前的所有流程，接下来就是开源EDA的黄金时代了。 SlidesSlides 从54:30开始看起 欢迎参加2018年9月8号在张江的和敏捷硬件设计相关的活动 也欢迎关注CNRV社区，重点关注RISC-V和敏捷硬件开发领域的最新进展：[嵌入式培训是哪个机构比较好，达内怎样，华清又怎样？](https://www.zhihu.com/question/34561115/answer/3624555488)

[

作为一个培训机构出来的程序员，我对这个问题有很深的感触。2014年，我通过培训班找到了第一份程序员的工作。那个时候，IT行业正处于高速发展期，整体就业环境很好，虽然好工作不多，...

](https://www.zhihu.com/question/34561115/answer/3624555488)

#### 更多回答

谢邀。有趣， 答题的朋友

[@其实我是老莫](https://www.zhihu.com/people/edb345a4e764ee0fdd0a77194ecd5346)

同我是KTH校友。也来讲讲对敏捷在硬件领域中的前景和目前的应用吧。我所在的公司，业界NO.1，在多年前也在研究敏捷开发在硬件领域的应用，不过让人略微失望的是，更多的还在项目管理的角度考虑如何去实现项目紧逼确保进度量化过程的方式，不是说这么做不行，但这么做确实后来被项目证明没有卵用。

再转回到你所要问的问题，敏捷开发，或者更准确地指向，“快速开发硬件”的新流程的前景和做研究的可能性。路桑自己每年也在工程行业发表论文，而敏捷开发譬如伴随RISC-V为众人所悉知的chipsel语言可谓是彻底颠覆了包括EDA公司提出的敏捷开发发展进成。从论文发表的难易度来看，这个研究方向九死一生，因为它显然不同于在材料和器件方向的灌水，或者好听一点，百花争鸣。

因为，你要获得计算机体系结构和EDA工程应用领域的认可，你得有全套的开发流程，至少成功流片，而且还能有数据证明你在时间高效性的同时也保证了硬件综合时序的快速收敛，硬件功能的准确描述，以及面积门数的比对等等，这一切加起来才算得上是一种颠覆，一场有潜质的革命。

那么，你可能会问，之前就没有人抱怨，没有人给出解决方案吗？——有的，只是真得不能完美解决上述提出的所有问题。譬如，已经很早提出比RTL抽象层次更高的SystemC可综合建模，包括Cadence公司在内的业界EDA公司已经有了不少的case来跟着一起搭卖工具，每年的EDA和设计验证行业大会例如DAC和DVCon都有SystemC的身影，然而，它依然无法成为RTL的绝对替代。

Why？很明显代码量减少，全套的EDA流程和成功的案例背书，怎么还是这么多年难以推广？因为路桑想说，硬件领域的敏捷开发在推广方式上与软件领域有很大的不同，软件领域只需要软件工程师举手投票就能有大概率胜出，而硬件领域的绝对票券不在工程师那里，而在大公司和EDA公司那里，这里面的参与者只有都点头了，硬件科技树的走向才有可能生长变化。

而我们刚才提到的RISC-V和chipsel，拜托看看它们的爸爸是谁，是一贯有着给硬件科技带来春风的伯克利啊，不过即便他们能带头示范，能够快速买进的也只是一些光脚的，譬如其它高校研究和初创公司愿意用这一套“颠覆性”硬件设计流程，而其它大公司的包袱就太重了，得缓缓过几年再看风向。

最后，就路桑个人而言，我很希望看到这个颠覆和其它新的“敏捷开发”技术能够在硬件领域迎来蓬勃的发展和买单，毕竟硬件领域多年来缺乏生气，尤其在设计领域的发展严重滞后。不妨大胆做一个有趣而令人后怕的想象，如果类似chipsel的更软件和抽象的语言逐渐占据市场的话，算法和软件基因的公司要“侵入”硬件开发领域将变得不再那么困难，硬件设计人员的技能护城河将慢慢消失，而那个时候芯片功能验证人员依然会有市场，因为无论建模多么抽象，都要做功能验证，而且验证技术只会加强和复杂，why?因为验证人员依然是高昂流片费用背后的守门员啊，只此一次机会——各位老板们要不要了解一下呢？

想了解更多验证技术，可以关注「路科验证」公众号，或者访问路科验证官网

文章里面写的很清楚啊。一个是提高EDA工具的智能化程度，从而进一步加大设计自动化程度。另外一个是借鉴软件行业开源的成功经验，研究IC设计领域的开源设计模式和方法。

其实这些东西已经研究多年，现在DAPAR出钱是想把这些零散的基础研究向“应用基础研究”转化。既转化成可以被直接使用的工具软件或设计模式。

这是一个大的框架，那么多人得到资助就是因为他们之前分别在不同的点上做了相关研究。

最后回到读博的问题，敏捷设计这是一个大框架，而读博研究的都是具体问题。所以最后这个问题我无法回答。

![](chrome-extension://difoiogjjojoaoomphldepapgpbgkhkb/assets/logo-O35E636P.png) Sider

[导游称大熊猫花花是残疾游客秒报警 340 万](https://www.zhihu.com/search?q=%E5%AF%BC%E6%B8%B8%E7%A7%B0%E5%A4%A7%E7%86%8A%E7%8C%AB%E8%8A%B1%E8%8A%B1%E6%98%AF%E6%AE%8B%E7%96%BE%E6%B8%B8%E5%AE%A2%E7%A7%92%E6%8A%A5%E8%AD%A6&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[孙杨被曝疑违规录取博士 335 万](https://www.zhihu.com/search?q=%E5%AD%99%E6%9D%A8%E8%A2%AB%E6%9B%9D%E7%96%91%E8%BF%9D%E8%A7%84%E5%BD%95%E5%8F%96%E5%8D%9A%E5%A3%AB&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[女子徒手给月子里宝宝打耳洞 294 万](https://www.zhihu.com/search?q=%E5%A5%B3%E5%AD%90%E5%BE%92%E6%89%8B%E7%BB%99%E6%9C%88%E5%AD%90%E9%87%8C%E5%AE%9D%E5%AE%9D%E6%89%93%E8%80%B3%E6%B4%9E&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[曝吴宣仪提出解约遭乐华拒绝 290 万](https://www.zhihu.com/search?q=%E6%9B%9D%E5%90%B4%E5%AE%A3%E4%BB%AA%E6%8F%90%E5%87%BA%E8%A7%A3%E7%BA%A6%E9%81%AD%E4%B9%90%E5%8D%8E%E6%8B%92%E7%BB%9D&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[阿 Sa 蔡卓妍官宣结婚 290 万](https://www.zhihu.com/search?q=%E9%98%BF+Sa+%E8%94%A1%E5%8D%93%E5%A6%8D%E5%AE%98%E5%AE%A3%E7%BB%93%E5%A9%9A&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[广州地铁有人喷洒不明液体 267 万](https://www.zhihu.com/search?q=%E5%B9%BF%E5%B7%9E%E5%9C%B0%E9%93%81%E6%9C%89%E4%BA%BA%E5%96%B7%E6%B4%92%E4%B8%8D%E6%98%8E%E6%B6%B2%E4%BD%93&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)