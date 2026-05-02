---
title: "为什么memory制程比CPU的制程低？ - 老狼 的回答"
source: "https://www.zhihu.com/question/290382241/answer/687679780"
author:
  - "[[老狼​新知答主已关注]]"
  - "[[大概没人注册半导体光刻]]"
  - "[[木头龙​中央处理器 (CPU)等 3 个话题下的优秀答主]]"
published:
created: 2026-05-02
description: "谢邀，题主虽然说Memory，但主要是在问Flash memory。看别的答案，已经造成了误解，为了清楚起见，我用NA…"
tags:
  - "clippings"
---
166 人赞同了该回答

![](https://picx.zhimg.com/50/v2-74f13767de4c6a9037838f8f7f676663_720w.jpg?source=2c26e567)

Logic是CPU，Performance Memory是DRAM,最下面的两个是NAND

还没有人送礼物，鼓励一下作者吧

[编辑于 2019-05-18 23:27](https://www.zhihu.com/question/290382241/answer/687679780)[NAS到底是极客还是大众产品？记一次给小白用户配置NAS的经历|顺便绿联DXP 4800 Plus评测](https://zhuanlan.zhihu.com/p/1987561483337486998)

[

10月份我发过一篇长文记录，具体复盘了我自己给一位新投入居家电商直播的小白用户升级全屋网络配置的思路和过程。这波没想...

](https://zhuanlan.zhihu.com/p/1987561483337486998)

#### 更多回答

定义节点的算法不一样，logic用half gate pitch定义节点，存储器用half cell pitch定义。

其实14nm的logic和20nm的DRAM光刻机曝光难度是相当的。

![](https://picx.zhimg.com/50/v2-2985a73d38376a92c4a352e6780a7b44_720w.jpg?source=1def8aca)

谢邀 一句话观点： 先进的制程成本太高，内存/SSD颗粒厂商无力承担。 用内存举例吧，直观点来看，现在主流的DDR4 8GB内存，单根单面使用了八个颗粒，例如这款： CPU开盖后，大概只有这么一点： 具体尺寸的话，主流桌面核心面积比较大的8700K的Die Size是149平方毫米\[1\]；而单颗内存颗粒封装后的尺寸大概是95平方毫米左右，8颗就是760平方毫米\[2\]，大概是CPU的5倍左右。就算实际芯片比封装尺寸小一点，3~4倍也是有的。当然，这里面CPU用的是14nm工艺，内存应该是18nm甚至20nm（没找到具体资料），但简单计算的话，20nm的芯片用14nm工艺生产的话，面积也就缩小一半而已。 而价格方面，8700K就算散片都要2000+，一根8GB DDR4现在大家都说贵的飞起，也不过500左右。最便宜的时候，也不是没有300不到的价格。就算说i7是高价型号，用i3甚至奔腾的核心去和内存比，单位面积晶片也是CPU比内存贵不少。 使用最先进的制程，意味着要分摊前期高昂的光刻生产线采购/研发成本，意味着制程尚未成熟的良品率低下。所以主流容量的内存颗粒，是不会采用最先进的制程工艺生产的。 另外，从需求方面来说，更先进的制程，往往意味着更高的频率，更低的功耗，更小的芯片面积（对于内容来说是更大的容量）。这些优势对于内存来说，不是说不重要，但远不如在CPU上那么重要——有兴趣的，可以看看4266的内存比2400的性能提升多少。也只有在手机这种尺土寸金的场合，高密度大容量的内存颗粒会更受青睐一点，但手机厂家能承受的成本也是有限的。 \[1\]： Core i7-8700 - Intel - WikiChip \[2\]： Micron MT40A1G8SA-075 Data Sheet

![](chrome-extension://difoiogjjojoaoomphldepapgpbgkhkb/assets/logo-O35E636P.png) Sider

[导游称大熊猫花花是残疾游客秒报警 340 万](https://www.zhihu.com/search?q=%E5%AF%BC%E6%B8%B8%E7%A7%B0%E5%A4%A7%E7%86%8A%E7%8C%AB%E8%8A%B1%E8%8A%B1%E6%98%AF%E6%AE%8B%E7%96%BE%E6%B8%B8%E5%AE%A2%E7%A7%92%E6%8A%A5%E8%AD%A6&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[孙杨被曝疑违规录取博士 335 万](https://www.zhihu.com/search?q=%E5%AD%99%E6%9D%A8%E8%A2%AB%E6%9B%9D%E7%96%91%E8%BF%9D%E8%A7%84%E5%BD%95%E5%8F%96%E5%8D%9A%E5%A3%AB&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[女子徒手给月子里宝宝打耳洞 294 万](https://www.zhihu.com/search?q=%E5%A5%B3%E5%AD%90%E5%BE%92%E6%89%8B%E7%BB%99%E6%9C%88%E5%AD%90%E9%87%8C%E5%AE%9D%E5%AE%9D%E6%89%93%E8%80%B3%E6%B4%9E&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[曝吴宣仪提出解约遭乐华拒绝 289 万](https://www.zhihu.com/search?q=%E6%9B%9D%E5%90%B4%E5%AE%A3%E4%BB%AA%E6%8F%90%E5%87%BA%E8%A7%A3%E7%BA%A6%E9%81%AD%E4%B9%90%E5%8D%8E%E6%8B%92%E7%BB%9D&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[阿 Sa 蔡卓妍官宣结婚 289 万](https://www.zhihu.com/search?q=%E9%98%BF+Sa+%E8%94%A1%E5%8D%93%E5%A6%8D%E5%AE%98%E5%AE%A3%E7%BB%93%E5%A9%9A&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[广州地铁有人喷洒不明液体 266 万](https://www.zhihu.com/search?q=%E5%B9%BF%E5%B7%9E%E5%9C%B0%E9%93%81%E6%9C%89%E4%BA%BA%E5%96%B7%E6%B4%92%E4%B8%8D%E6%98%8E%E6%B6%B2%E4%BD%93&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)