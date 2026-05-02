---
title: "多核 CPU 和多个 CPU 有何区别？ - 老狼 的回答"
source: "https://www.zhihu.com/question/20998226/answer/705020723"
author:
  - "[[老狼​新知答主已关注]]"
  - "[[木头龙​中央处理器 (CPU)等 3 个话题下的优秀答主]]"
  - "[[闻棠​​​南洋理工大学 哲学博士]]"
published:
created: 2026-05-02
description: "谢邀。先说结论，多核CPU和多CPU的区别主要在于性能和成本。多核CPU性能最好，但成本最高；多CPU成本小，…"
tags:
  - "clippings"
---
编辑推荐

3536 人赞同了该回答

![](https://picx.zhimg.com/50/v2-9cc9a76823ac6bea48611c190188517a_720w.jpg?source=2c26e567)

谢邀。先说结论， 多核CPU 和 多CPU 的区别主要在于性能和成本。多核CPU性能最好，但成本最高；多CPU成本小，便宜，但性能相对较差。我们来看一个例子：如果我们需要组成一个48核的计算机，我们可以有这么三种选择： 把48个核全部做到一个大Die上，Die很大。这个Die加上一些外围电路组成一个单Die多核CPU。 弄4个小Die，每个Die 12个内核，每个Die很小。把这4个Die，加上互联总线和外围电路，全部封装（Packaging）到 一个 多Die多核CPU中。 还是弄4个Die，每个Die 12个内核，每个Die很小。每个Die加上外围电路封装成一个单独的CPU，4个CPU再通过总线组成一个多路(way/socket)系统。 我们来看看他们的性能差距和成本差距。 性能差距 为了很好的理解三者之间的区别，我们通过一个生活中的场景分别指代三种方式。 我们想像每个Die是一栋大楼，Die里面的内核们，内存控制器们、PCIe控制器们和其他功能模块是其中的一个个房间。数据流和指令流在它们之间的流动看作房间里面的人们互相串门，这种串门的方便程度和走廊宽度决定了人们愿不愿意和多少人可以同时串门，也就指代了数据的延迟和带宽 。 好了，有了这种方便的比喻，我们来看看三种情况分别是什么。 48核的大Die是Intel至强系列的标准做法： 这种方法就是既然需要这么多房间，业主有钱，就建一个大楼，每层都是 超级大平层 ： 走廊众多，这里堵了，换个路过去，反正方向对了就行，总能到的。所以人们可以很方便的串门，也可以有很多人同时串门。所以延迟小，带宽高。 一个CPU pacakge里面包了4个小Die的做法是AMD的标准做法，也有部分Intel也这样： 这种做法可以看作业主没钱搞大平层，但也要这么多房间，怎么办呢？在原地 相邻得建4个小高层 ，再把小高层连起来，房间数目不变。怎么把它们连起来呢？比较现代的做法有两种： 这种做法也叫做 MCM （Multi-Chip-Module），详细内容可以看我的这篇文章： 其中AMD采用 硅中介 (Interposer),也就是上面那种；Intel采用 EMIB （Embedded Multi-die Interconnect Bridge）, 是下面那种。 硅中介的做法可以看作为了两个楼互通，我们把地下都挖空了，搞了个换乘大厅。而EMIB可以看成在两个楼之间挖了一个地下通道。显然挖通道更省钱省力，但因为通道是两两互联的，如果大楼多了，还不如换乘大厅方便。 好了，那我们的串门问题怎么解决呢？因为楼和楼(Die和Die）之间只有地下互通，要串门的人都要做电梯到地下一层，通过地道或者换乘大厅到另一个大楼地下，再做电梯去想要的楼层。路途遥远，好多人都不想串门了，同时如果串门人太多，会挤爆电梯，不得不串门联系工作的人们在电梯口排起了长队。显然，建筑四个相邻小高层的办法，延迟和带宽都比较差。 那么多CPU呢？ 还是没钱盖大平层，这次更惨，因为4层小高层间隔比较远，为了方便人们串门，不得不在园区里面搞了班车，用于跨楼通勤。因为班车开停需要时间，人们串门更加麻烦了。 借助这个比喻，我们应该能够得出结论，这三种方式提供48核的算力，延迟和带宽是依次下降的。下降的幅度和需要进行的work load有关，不能一概而论。大家可以借助一个工具 \[1\] 来具体测量一下内存的延迟： 在这个例子里面看出，本大楼的访问延迟比跨大楼的访问延迟低了一倍！ 成本差距 既然大平层这么好，为什么还有人盖小高层呢？存在都是合理的，当然是成本高了。我在这篇文章中讲述了为什么Die大了成本就高： 简单来说，晶圆在制造过程中总是避免不了缺陷，这些缺陷就像撒芝麻粒，分布在整个Wafer上： 如果考虑缺陷，Die的大小会严重影响良率： 上图大家可以点开看（图比较大），其中不太清楚的红色小点是晶圆的缺陷，在Die很大时，有很大概率它的范围内会缺陷，而只要有缺陷该Die就报废了（简化处理）；在Die比较小的时候，它含有缺陷的可能性就大大降低了。如图中，随着Die的减小，良率从第一个的35.7%提高到了95.2%!我们举个极端的例子，整个Wafer就一个Die，那么良率只有0%了，生产一个报废一个。谁还干这么傻的事！ 这种成本增加不是线性的，而是指数性增加，具体的数字是厂商的核心机密，不为外人道。但总的来说，结合前面的例子来说就是： 1个大Die成本 > 4个小Die+互联线路总成本 那么方式2和方式3成本谁高呢？实际上方式2节约了主板上大量布线和VR等成本，总成本更低，也是主板和服务器厂商喜闻乐见的形式；而方式3往往用于堆出更多的内核和需要更多内存的情况。 结论 相信读到这里，同学们已经有了答案，结论开头已经说明，就不再赘述了。多核CPU和多Die乃至多路CPU，对操作系统等来看，区别不大，BIOS都报告了同样多的很多CPU供他们调度。区别主要在于性能上面，大Die多核性能最好，也最贵。多Die性能下降，但经济实惠。最后要注意，这些性能区别有些是操作系统可以感知的，如通过NUMA等方式： 操作系统可以具体做出优化。但也有部分是操作系统不能够知道的，只有通过各种真实的workload，用户那里才会感觉有明显的不同。 最后推荐 NUC ，很好用 其他CPU硬件文章： 欢迎大家关注我的专栏和用微信扫描下方二维码加入微信公众号"UEFIBlog"，在那里有最新的文章。 参考 Intel Performance Checker https://software.intel.com/en-us/articles/intelr-memory-latency-checker

3 人已送礼物

[编辑于 2024-10-23 11:45](https://www.zhihu.com/question/20998226/answer/705020723) ・上海[我是不是不适合从事嵌入式开发啊……?](https://www.zhihu.com/question/661828274/answer/3825443011)

[作为一名曾经的计算机科学与技术专业的学生，我对“在学校里学的都可以，听的时候能听懂，但是自己做的时候手就不会写了”这种感受深有体会。其实原因就是学校都是理论为主，自己动手...](https://www.zhihu.com/question/661828274/answer/3825443011)

#### 更多回答

![](https://picx.zhimg.com/50/v2-d6ca0e8fbd49c35d305aed92bf1b487e_720w.jpg?source=1def8aca)

用于双路Xeon可扩展的主板：超微X11DAi-N

架构可以千变万化，面向需求、综合考量是王道。  
来，简单举个例子。假设现在我们要设计一台计算机的处理器部分的架构。现在摆在我们面前的有两种选择，多个单核CPU和单个多核CPU。

如果我们选择多个单核CPU，那么每一个CPU都需要有较为独立的电路支持，有自己的Cache，而他们之间通过板上的总线进行通信。假如在这样的架构上，我们要跑一个多线程的程序（常见典型情况），不考虑超线程，那么每一个线程就要跑在一个独立的CPU上，线程间的所有协作都要走总线，而共享的数据更是有可能要在好几个Cache里同时存在。这样的话，总线开销相比较而言是很大的，怎么办？那么多Cache，即使我们不心疼存储能力的浪费，一致性怎么保证？如果真正做出来，还要在主板上占多块地盘，给布局布线带来更大的挑战，怎么搞定？

如果我们选择多核单CPU，那么我们只需要一套芯片组，一套存储，多核之间通过芯片内部总线进行通信，共享使用内存。在这样的架构上，如果我们跑一个多线程的程序，那么线程间通信将比上一种情形更快。如果最终实现出来，对板上空间的占用较小，布局布线的压力也较小。

看起来，多核单CPU完胜嘛。可是，如果需要同时跑多个大程序怎么办？每个程序都需要用很多内存怎么办？假设俩大程序，每一个程序都好多线程还几乎用满cache，它们分时使用CPU，那在程序间切换的时候，光指令和数据的替换就要费多大事情啊！

所以呢，大部分一般咱们使用的电脑，都是单CPU多核的，比如我们配的Dell T3600，有一颗Intel Xeon E5-1650，6核，虚拟为12个逻辑核心。少部分高端人士需要更强的多任务并发能力，就会搞一个多颗多核CPU的机子，Mac Pro就可以有两颗。高端的服务器一般都是多颗多核，甚至还高频率。

![](chrome-extension://difoiogjjojoaoomphldepapgpbgkhkb/assets/logo-O35E636P.png) Sider

[导游称大熊猫花花是残疾游客秒报警 340 万](https://www.zhihu.com/search?q=%E5%AF%BC%E6%B8%B8%E7%A7%B0%E5%A4%A7%E7%86%8A%E7%8C%AB%E8%8A%B1%E8%8A%B1%E6%98%AF%E6%AE%8B%E7%96%BE%E6%B8%B8%E5%AE%A2%E7%A7%92%E6%8A%A5%E8%AD%A6&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[孙杨被曝疑违规录取博士 335 万](https://www.zhihu.com/search?q=%E5%AD%99%E6%9D%A8%E8%A2%AB%E6%9B%9D%E7%96%91%E8%BF%9D%E8%A7%84%E5%BD%95%E5%8F%96%E5%8D%9A%E5%A3%AB&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[女子徒手给月子里宝宝打耳洞 293 万](https://www.zhihu.com/search?q=%E5%A5%B3%E5%AD%90%E5%BE%92%E6%89%8B%E7%BB%99%E6%9C%88%E5%AD%90%E9%87%8C%E5%AE%9D%E5%AE%9D%E6%89%93%E8%80%B3%E6%B4%9E&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[曝吴宣仪提出解约遭乐华拒绝 291 万](https://www.zhihu.com/search?q=%E6%9B%9D%E5%90%B4%E5%AE%A3%E4%BB%AA%E6%8F%90%E5%87%BA%E8%A7%A3%E7%BA%A6%E9%81%AD%E4%B9%90%E5%8D%8E%E6%8B%92%E7%BB%9D&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[阿 Sa 蔡卓妍官宣结婚 290 万](https://www.zhihu.com/search?q=%E9%98%BF+Sa+%E8%94%A1%E5%8D%93%E5%A6%8D%E5%AE%98%E5%AE%A3%E7%BB%93%E5%A9%9A&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[广州地铁有人喷洒不明液体 267 万](https://www.zhihu.com/search?q=%E5%B9%BF%E5%B7%9E%E5%9C%B0%E9%93%81%E6%9C%89%E4%BA%BA%E5%96%B7%E6%B4%92%E4%B8%8D%E6%98%8E%E6%B6%B2%E4%BD%93&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)