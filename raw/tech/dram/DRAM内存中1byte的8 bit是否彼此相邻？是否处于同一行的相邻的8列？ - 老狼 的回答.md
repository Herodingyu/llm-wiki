---
title: "DRAM内存中1byte的8 bit是否彼此相邻？是否处于同一行的相邻的8列？ - 老狼 的回答"
source: "https://www.zhihu.com/question/570175157/answer/2786641858"
author:
  - "[[老狼​新知答主已关注]]"
  - "[[匿名用户]]"
  - "[[小斛分粮官就剩一句了？]]"
published:
created: 2026-05-02
description: "我们一次从内存中读出的内容，并不在一个内存Bank同一行的相邻列中，甚至不一定在同一颗内存颗粒中！这是…"
tags:
  - "clippings"
---
[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog)

252 人赞同了该回答

目录

![](https://pica.zhimg.com/50/v2-d6fbdd59daf94e54f0ec650051d7fbbb_720w.jpg?source=2c26e567)

我们一次从内存中读出的内容，并不在一个 内存Bank 同一行的相邻列中 ，甚至不一定在同一颗 内存颗粒 中！这是一个有点反直觉的答案，探究它的来由，甚至向前推进一步： 如果发现一个bit错误，如何从其物理地址译码到内存单元（cell）呢 ？ 这并不一定只关乎于电脑爱好者的好奇心满足，也有一定现实意义，并且 具有很大的经济价值 ！为什么这么说？背后的原理是什么呢？ 内存的层级关系 我在内存系列科普文章中，介绍了内存参数的基本层级关系： 考虑到科普的趣味性和通俗性，介绍并不深入，对于一个颗粒（Chip/Device）内部的讲解十分粗糙。考虑到这些，我还为此做了一份补充的案例分析： 从这几篇文章颇受欢迎的结果来看，本专栏的读者似乎已经对rank、chip/device、bank的关系已经了然于胸，但对于bank内部的关系却仍然模糊。今天，我们就从地址解码的角度来看看bank内部究竟发生了什么。 我们先来回顾一下：从内存控制器到内存颗粒内部逻辑，笼统上讲从大到小为：channel＞DIMM＞rank＞chip/device＞bank＞row/column，如下图： 选定row/column（行/列）就可以定位内存单元（cell）了。 但在bank和行、列之间，其实还有一个层级： Array 。 为了压缩行列的选择信号，每个bank中会将cell进行分组，每组单元之间共用row、column信号。也就是一个行列选择信号，会同时选中它们，进入各自 Sense Amplifier （也就是数据buffer）。每组都有自己的Sense Amplifier，合起来一起提供一组数据，组这个层级就叫做Array。其实它和我们常见的内存标识中一个数字紧密相关，知道是什么吗？ 你想对了，就是 常见的2Rx4或者1Rx8中的4或者8，这个数字就是每个Bank中Array的个数 ： 我们可以将它理解为页：一个bank就像一本书，有好几页（Array）。在地址解码的时候，选中了一个bank后，接着告诉你在第几行第几列，你不是打开第一页来找，而是同时在好多页同时找到那个交叉点，同时将内容输出出来，得到一串结果。 案例分析 好了，我们回到问题，“ DRAM内存中1byte的8 bit是否彼此相邻？是否处于同一行的相邻的8列 ？”，答案要看选择何种颗粒。 我们知道内存条有64bit的数据线，每次至少传输64bit的数据。每次CPU将地址转换成64bit地址对齐（如果地址不对齐，就拆解读两次）。这64个bit的数据要一次读出来，分布在内存条一个rank中所有颗粒中。64bit是8个Bytes，它的分布一般有两种方式： 如果是服务器常用的x4搭建的内存条，1个byte会被分成两个部分，每个x4颗粒分4个bit，这4个bit会被分配到颗粒的某个bank的4个Array中。不会分布在一个Array中相邻的列中。 如果是台式机常用的x8搭建的内存条，1个byte8个bit会被分配到颗粒的某个bank的8个Array中。不会分布在一个Array中相邻的列中。 这里要注意区分Bank Group和Array。 内存物理地址解码的经济价值 已知某个物理地址内存发生错误，如何定位到内存条、颗粒、甚至内存单元？这是经常看到的问题。 如果能回答这个问题，小到电脑爱好者可以准确得换掉坏掉的内存；大到云厂商在出错后可以进行内存淘汰（云服务器中内存成本几乎占三成），内存条ODM/OEM可以利用hPPR进行内存修复。不仅如此，知道物理地址到channel、DIMM、rank、chip/device、bank、row/column的映射关系，对于内存颗粒厂商、内存条厂商甚至是内存黑产厂商都具有很大的相关经济价值，是进行内存修复、分级、筛片等环节的必须技术能力。毕竟，用类似 MemTest86 等软件一顿操作测出问题，还要进行有的放矢的进行下一个环节，而知道究竟哪里出错了必不可少。 结论 读到这里，你是不是跃跃欲试，想要用这篇文章学到的知识去挣这笔快钱呢？实际上事情要复杂得多，细节中隐藏着魔鬼。实际应用中，因为性能的考虑，CPU会开启了各种interleave，大到Socket，小到bank，物理地址经过层层map，已经变得面目全非，甚至各代CPU的映射关系都不一致，不同内存配置映射也会有变化，超级复杂。 BIOS 作为设置Memory Map的主体，才完全了解物理地址到物理器件的映射关系，只有BIOS提供相关decode函数，才是通用的可靠的。这也是为什么服务器 RAS功能 检查出内存错误，可以对应修复和替换的原因。可惜该decode接口既不开放，也不标准，未得到广泛应用。 欢迎大家关注本专栏和用微信扫描下方二维码加入微信公众号"UEFIBlog"，在那里有最新的文章。关注公众号，留言“资料”，有一些公开芯片资料供下载。[表单是什么？表单和表格有何区别？](https://www.zhihu.com/question/266077661/answer/2939267363)

[

这不点我名儿了么，表单大师来告诉你，表单和表格有何区别表单和表格都是用于展示数据的方式，但它们在实际使用中有一些区别。表格通常是一个包含行和列的网格状结构，每一行代表一...

](https://www.zhihu.com/question/266077661/answer/2939267363)

#### 更多回答

![](https://pica.zhimg.com/50/v2-2f89c9a39715d9b23835bf745accffa2_720w.jpg?source=1def8aca)

“ DRAM内存中1byte的8 bit是否彼此相邻？ ” 答案：一般来说，是的，但也有4bit的，通常都是8bit。 苹果的m1甚至是16bit。 当一个64位系统要读写一个64bit内存的时候，会分摊到内存条的bank上。在bank上，最小的单位就是8bit ，每次激活行列选择电路的时候，激活的就是8个bit。 一般内存条工作模式为“Single-rank Dual-rank Quad-rank”，具体详情自己去谷歌。 问题来了，如何分辨一条内存条到底是 8bit相邻还是4bit相邻？ 看(3)Data width Item Description Definition 1 Size — 2 Rank 1R = Single-rank 2R = Dual-rank 4R = Quad-rank 3 Data width 数据宽度，这里就能看出来 x4 = 4-bit x8 = 8-bit 4 Voltage rating L = Low voltage (1.35v) U = Ultra low voltage (1.25v) Blank or omitted = Standard 5 Memory speed 12800 = 1600-MT/s 10600 = 1333-MT/s 8500 = 1066-MT/s 6 DIMM type R = RDIMM (registered) E = UDIMM (unbuffered with ECC) L = LRDIMM (load reduced)H = HDIMM (HyperCloud) 相关链接： blog.memory4less.com/20 DIMM identification Single Rank vs Dual Rank RAM: Differences & Performance Impact 计算机是如何工作的？探索主内存，以DDR5为例\_哔哩哔哩\_bilibili

是的，因为内存连续读或写同一位置效率最高，切换位置是需要时间的，内存设置里的各种时序里面就是切换位置、切换读写等的时钟数，没特殊需求不会分开存储。

![](chrome-extension://difoiogjjojoaoomphldepapgpbgkhkb/assets/logo-O35E636P.png) Sider

[导游称大熊猫花花是残疾游客秒报警 340 万](https://www.zhihu.com/search?q=%E5%AF%BC%E6%B8%B8%E7%A7%B0%E5%A4%A7%E7%86%8A%E7%8C%AB%E8%8A%B1%E8%8A%B1%E6%98%AF%E6%AE%8B%E7%96%BE%E6%B8%B8%E5%AE%A2%E7%A7%92%E6%8A%A5%E8%AD%A6&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[孙杨被曝疑违规录取博士 335 万](https://www.zhihu.com/search?q=%E5%AD%99%E6%9D%A8%E8%A2%AB%E6%9B%9D%E7%96%91%E8%BF%9D%E8%A7%84%E5%BD%95%E5%8F%96%E5%8D%9A%E5%A3%AB&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[女子徒手给月子里宝宝打耳洞 294 万](https://www.zhihu.com/search?q=%E5%A5%B3%E5%AD%90%E5%BE%92%E6%89%8B%E7%BB%99%E6%9C%88%E5%AD%90%E9%87%8C%E5%AE%9D%E5%AE%9D%E6%89%93%E8%80%B3%E6%B4%9E&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[曝吴宣仪提出解约遭乐华拒绝 289 万](https://www.zhihu.com/search?q=%E6%9B%9D%E5%90%B4%E5%AE%A3%E4%BB%AA%E6%8F%90%E5%87%BA%E8%A7%A3%E7%BA%A6%E9%81%AD%E4%B9%90%E5%8D%8E%E6%8B%92%E7%BB%9D&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[阿 Sa 蔡卓妍官宣结婚 289 万](https://www.zhihu.com/search?q=%E9%98%BF+Sa+%E8%94%A1%E5%8D%93%E5%A6%8D%E5%AE%98%E5%AE%A3%E7%BB%93%E5%A9%9A&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[广州地铁有人喷洒不明液体 266 万](https://www.zhihu.com/search?q=%E5%B9%BF%E5%B7%9E%E5%9C%B0%E9%93%81%E6%9C%89%E4%BA%BA%E5%96%B7%E6%B4%92%E4%B8%8D%E6%98%8E%E6%B6%B2%E4%BD%93&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)