---
title: "请问 X86 与 ARM 的功耗控制有什么区别？ - Luv Letter 的回答"
source: "https://www.zhihu.com/question/267873770/answer/590286982"
author:
  - "[[Luv Letter​苹果产品话题下的优秀答主​ 关注]]"
  - "[[老狼​新知答主]]"
  - "[[北极​中央处理器 (CPU)等 5 个话题下的优秀答主]]"
published:
created: 2026-05-02
description: "x86_64 和 ARM 都是 ISA, 而微架构就是 A57, silvermont, zen 这样的代号. 而具体到微架构还涉及到片上的…"
tags:
  - "clippings"
---
## 请问 X86 与 ARM 的功耗控制有什么区别？

最省电的ATOM，性能差、功耗不低，性能比高通差好多… 好一点的core M，功耗控制不了，满载功耗十几瓦… 两者的平板和笔记本都用过，可是续航一点都…

194 人赞同了该回答

![](https://pica.zhimg.com/50/v2-f76d1d0a264e391ad4ac3a9453a12858_720w.jpg?source=2c26e567)

cascade lake

还没有人送礼物，鼓励一下作者吧

[编辑于 2019-02-06 12:11](https://www.zhihu.com/question/267873770/answer/590286982)[准备入行嵌入式，本身是计算机科班出身，兄弟们来给点意见？](https://www.zhihu.com/question/660012297/answer/3558676314)

[

兄弟，我也是计科专业的，当时大三的时候去实习，找了很多单位都没有成功，自己认为在大学里学的还可以，但是在找实习的时候就感受到压力了，在面试过程中，我发现企业所关注的不仅仅...

](https://www.zhihu.com/question/660012297/answer/3558676314)

#### 更多回答

![](https://picx.zhimg.com/50/v2-1978bbc0d774d5b0aa1480f1d97d60eb_720w.jpg?source=1def8aca)

用微信扫描二维码加入UEFIBlog公众号

![](https://picx.zhimg.com/50/v2-473f50be25b8b75908fea07cf7760b8a_720w.jpg?source=1def8aca)

前几天帮同事调试一个ARM上的cache的问题，来分享一点关于功耗和性能的问题。 一般来说ARM比x86省电，但是这种省电是有代价的，这种代价是需要软件或者操作系统设计者来承担的。 在多核环境下编程，数据一致性是一个很麻烦的问题，通常要用到锁或者原子操作之类的来保证一致性。那么，如果不保证一致性的话，会发生什么？这在ARM和x86上有着非常巨大的差距： 测试例子： ARM的单个核心上，把一个物理地址做两次map，物理地址上有一个int数的初始值，一次是有cache的，一次是non-cache的，先向有cache的地址（虚地址）写一个新值，然后再从non-cache映射的地址（虚地址）上读，正常情况下，肯定是读不到数据的，因为cache没有刷下去。 那么问题来了，要等多久，数据才会刷下去？ 答案是：在ARM上，可能一直不会。尝试过等待一个tick（约16ms），一秒，200个tick以后，non-cache地址上一直读到的都是修改前的值，除非软件主动调用cache flush。 这个问题在x86环境下是不存在的，x86架构的CPU，内存控制器会周期性的主动把cache内容刷到主存以及其它核上，这个刷新周期大概是几百到几千个cycle，时间大概是微秒级。也就是说x86架构的CPU会在一定程度上主动帮软件刷新cache，这能让软件在一些竞争不明显的场合上不必手动维护CPU cache，减少软件开发的难度。所以写操作系统和驱动的人会说x86架构更“友好”，这里就是体现出它的“友好”，这个“友好”的代价就是功耗的上升。由于ARM上经常会出现cache的问题，所以ARM上开发软件难度更大也更复杂一些。 主动刷cache是有代价的，这需要有一个总线周期性的同步各个核心的数据，周期性更新主存与cache之间的数据，这必然是一项比较大的功耗，而且不管CPU在执行什么指令，这个同步的动作都要周期性的执行。（具体的：在早期的Intel CPU里，是一个环形总线，后来是全连的总线，再后来有大小核以后，是一个类似于星形的多级总线结构）。 x86上能不能像ARM那样也不刷cache？可以，但是很多软件可能需要重写。 这就是x86与ARM功耗差距的原因之一。 评论区有人提到是不是SMPEN没有打开的问题，这其实是理解错了我这个回答要表达的场景。ARM的核间同步是没有问题的，任何多核CPU都要支持MESI或者类似的协议，否则就不能正常工作了，这个测试跟核间同步也没有关系，这个测试要测的是write back的时机。 因为一个核心是以cache方式写数据，第二个核心使用的是non-cache的方式直接访问的主存读数据，第二个核心整个读周期都没有使用cache，所以这个场景就跟MESI没关系了，说明第一个核心没有把cache写入主存。 ARM手册里也证明了这一点： 也就是说， 第一个核心写的数据一直都在L1 cache里，根本写没写下去，这一点与x86架构是完全不同的，x86程序员不需要关注也不需要调用cache invalidate来完成类似的操作，内存控制器会定期的回写L1 cache数据 。但是ARM不会，这就是ARM内存控制器省电的策略之一。

![](chrome-extension://difoiogjjojoaoomphldepapgpbgkhkb/assets/logo-O35E636P.png) Sider

[导游称大熊猫花花是残疾游客秒报警 340 万](https://www.zhihu.com/search?q=%E5%AF%BC%E6%B8%B8%E7%A7%B0%E5%A4%A7%E7%86%8A%E7%8C%AB%E8%8A%B1%E8%8A%B1%E6%98%AF%E6%AE%8B%E7%96%BE%E6%B8%B8%E5%AE%A2%E7%A7%92%E6%8A%A5%E8%AD%A6&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[孙杨被曝疑违规录取博士 335 万](https://www.zhihu.com/search?q=%E5%AD%99%E6%9D%A8%E8%A2%AB%E6%9B%9D%E7%96%91%E8%BF%9D%E8%A7%84%E5%BD%95%E5%8F%96%E5%8D%9A%E5%A3%AB&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[女子徒手给月子里宝宝打耳洞 294 万](https://www.zhihu.com/search?q=%E5%A5%B3%E5%AD%90%E5%BE%92%E6%89%8B%E7%BB%99%E6%9C%88%E5%AD%90%E9%87%8C%E5%AE%9D%E5%AE%9D%E6%89%93%E8%80%B3%E6%B4%9E&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[曝吴宣仪提出解约遭乐华拒绝 290 万](https://www.zhihu.com/search?q=%E6%9B%9D%E5%90%B4%E5%AE%A3%E4%BB%AA%E6%8F%90%E5%87%BA%E8%A7%A3%E7%BA%A6%E9%81%AD%E4%B9%90%E5%8D%8E%E6%8B%92%E7%BB%9D&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[阿 Sa 蔡卓妍官宣结婚 290 万](https://www.zhihu.com/search?q=%E9%98%BF+Sa+%E8%94%A1%E5%8D%93%E5%A6%8D%E5%AE%98%E5%AE%A3%E7%BB%93%E5%A9%9A&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[广州地铁有人喷洒不明液体 267 万](https://www.zhihu.com/search?q=%E5%B9%BF%E5%B7%9E%E5%9C%B0%E9%93%81%E6%9C%89%E4%BA%BA%E5%96%B7%E6%B4%92%E4%B8%8D%E6%98%8E%E6%B6%B2%E4%BD%93&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)