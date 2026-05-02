---
title: "电脑的 RAM 使用较多是否会比占用率偏低时费电？ - 老狼 的回答"
source: "https://www.zhihu.com/question/299840690/answer/523300904"
author:
  - "[[老狼​新知答主已关注]]"
  - "[[Linuxkr信号完整性/京都动画粉丝/摄影/音乐]]"
  - "[[Alice]]"
published:
created: 2026-05-02
description: "谢邀。问题很简单，但是回答起来却并不容易。思来想去，如果不在这个问题上加入一定的限定，结果就会非常…"
tags:
  - "clippings"
---
91 人赞同了该回答

![](https://pic1.zhimg.com/50/v2-9644e78b22c898e0be9fb7883ec76c78_720w.jpg?source=2c26e567)

1Gb DDR3 SDRAM Functional Block Diagram（出自参考资料1）

还没有人送礼物，鼓励一下作者吧

[编辑于 2018-11-06 19:20](https://www.zhihu.com/question/299840690/answer/523300904)[Kamvas 22(Gen 3)数位屏新品上市，90Hz高刷加持](https://store.huion.cn/product/shuweiping/Kamvas-22-Gen-3?spu=biz%3D0%26ci%3D3692314%26si%3Dde18e8f4-4a9f-4e45-aa0b-daeae9f93021%26ts%3D1777706679%26zid%3D1628)

[

21.5英寸屏幕，兼具大尺寸显示与高分辨率，拥有90Hz刷新率，画面通透沉浸的同时绘画更流畅；五种色彩模式辅以△...

](https://store.huion.cn/product/shuweiping/Kamvas-22-Gen-3?spu=biz%3D0%26ci%3D3692314%26si%3Dde18e8f4-4a9f-4e45-aa0b-daeae9f93021%26ts%3D1777706679%26zid%3D1628)

#### 更多回答

我觉得应该和读写操作有关，与使用的内存空间无关 内存颗粒的datasheet中会给出不同操作状态下的的功耗，但颗粒中的存储单元是否被使用只有操作系统层面才会知道吧 对于内存控制器来说都要一视同仁的刷新 除非某些bank不用可能会省掉一点刷新的功耗 还请大神来详细解析

其实我挺好奇的一点就是，内存的“缓存”里面存的是啥。

注意你的资源管理器内存页(win8及以上)，你会发现内存占用除了给你显示的占用还有缓存占用。怕是正常使用内存基本都是接近满的。

虽然以上的答案有点文不对题，但也算是说说我自己的一些简单的观察吧。

所以如果你这里的占用指的是任务管理器显示的占用，那么答案很明确，不会

![](chrome-extension://difoiogjjojoaoomphldepapgpbgkhkb/assets/logo-O35E636P.png) Sider

[导游称大熊猫花花是残疾游客秒报警 340 万](https://www.zhihu.com/search?q=%E5%AF%BC%E6%B8%B8%E7%A7%B0%E5%A4%A7%E7%86%8A%E7%8C%AB%E8%8A%B1%E8%8A%B1%E6%98%AF%E6%AE%8B%E7%96%BE%E6%B8%B8%E5%AE%A2%E7%A7%92%E6%8A%A5%E8%AD%A6&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[孙杨被曝疑违规录取博士 335 万](https://www.zhihu.com/search?q=%E5%AD%99%E6%9D%A8%E8%A2%AB%E6%9B%9D%E7%96%91%E8%BF%9D%E8%A7%84%E5%BD%95%E5%8F%96%E5%8D%9A%E5%A3%AB&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[女子徒手给月子里宝宝打耳洞 294 万](https://www.zhihu.com/search?q=%E5%A5%B3%E5%AD%90%E5%BE%92%E6%89%8B%E7%BB%99%E6%9C%88%E5%AD%90%E9%87%8C%E5%AE%9D%E5%AE%9D%E6%89%93%E8%80%B3%E6%B4%9E&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[曝吴宣仪提出解约遭乐华拒绝 289 万](https://www.zhihu.com/search?q=%E6%9B%9D%E5%90%B4%E5%AE%A3%E4%BB%AA%E6%8F%90%E5%87%BA%E8%A7%A3%E7%BA%A6%E9%81%AD%E4%B9%90%E5%8D%8E%E6%8B%92%E7%BB%9D&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[阿 Sa 蔡卓妍官宣结婚 289 万](https://www.zhihu.com/search?q=%E9%98%BF+Sa+%E8%94%A1%E5%8D%93%E5%A6%8D%E5%AE%98%E5%AE%A3%E7%BB%93%E5%A9%9A&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[广州地铁有人喷洒不明液体 266 万](https://www.zhihu.com/search?q=%E5%B9%BF%E5%B7%9E%E5%9C%B0%E9%93%81%E6%9C%89%E4%BA%BA%E5%96%B7%E6%B4%92%E4%B8%8D%E6%98%8E%E6%B6%B2%E4%BD%93&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)