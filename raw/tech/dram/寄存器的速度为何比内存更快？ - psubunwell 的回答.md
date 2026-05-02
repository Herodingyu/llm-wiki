---
title: "寄存器的速度为何比内存更快？ - psubunwell 的回答"
source: "https://www.zhihu.com/question/20075426/answer/80546829"
author:
  - "[[psubunwell​ 关注]]"
  - "[[百味寻找神奇]]"
  - "[[又见山人​芯片（集成电路）话题下的优秀答主]]"
published:
created: 2026-05-02
description: "我只是上过VLSI这门课，不敢说很懂。只不过刚刚看到题目后翻了一下Weste & Harris的CMOS VLSI Design…"
tags:
  - "clippings"
---
30 人赞同了该回答

我只是上过VLSI这门课，不敢说很懂。只不过刚刚看到题目后翻了一下Weste & Harris的CMOS VLSI Design教材，发现了一个上面答者没有注意到的词：外围电路（peripheral circuitry）？

我一开始是看了题主的题目，显然，题目的内存指的是DRAM的话，显然比Register慢太多了，因为Register是用FF来存取信息的，DRAM是用 [电容](https://zhida.zhihu.com/search?content_id=27646989&content_type=Answer&match_order=1&q=%E7%94%B5%E5%AE%B9&zhida_source=entity) 充放电存取信息的。只能说先天啊先天。。

但是举一反三地问自己一下：Register的速度为何比Cache（SRAM）更快？还是因为两者先天速度么？Register是DFF做的，SRAM都是6T Cell做的，都是利用触发或锁存来存取数据，貌似速度上先天差不多？（这个我也不是很确定。。）是否有其他因素呢？

我自己总结了一下书上的内容，做个回答吧，如有错误，希望大神指出来XD

\-------------------------------------------------------------------------------------

Latch由2个 [inverter](https://zhida.zhihu.com/search?content_id=27646989&content_type=Answer&match_order=1&q=inverter&zhida_source=entity) 和1个mux（或者2个transmission gate）组成。

[Flip-flop](https://zhida.zhihu.com/search?content_id=27646989&content_type=Answer&match_order=1&q=Flip-flop&zhida_source=entity) （FF）由2个Latch组成。

Register由FF组成。因为Register数量很小，相对的读写操作外围电路（peripheral circuitry）占大头，所以外围电路要尽量简单。FF虽然面积很大（2个Latch，约30颗MOS），但换来的正好是外围电路的简单！再加上速度要快快快！因此Register要选择用FF。

Cache Memory（SRAM）由6T Cell组成。 **注意，SRAM的功能本来也可以由FF实现，但是！** SRAM [存储单元](https://zhida.zhihu.com/search?content_id=27646989&content_type=Answer&match_order=1&q=%E5%AD%98%E5%82%A8%E5%8D%95%E5%85%83&zhida_source=entity) 数量远比Register大，外围电路占小头，缩小每bit单元面积并且共用一套略复杂的外围电路才显得划算。6T Cell结构精巧，因而面积小（仅6颗MOS），接线短，功耗低；付出的代价正好是外围电路复杂（需要额外控制读写的电路）！因此SRAM要选择用6T Cell。

> The 6T cell achieves its compactness at the expense of more complex peripheral circuitry for reading and writing the cells. This is a good trade-off in large RAM arrays where the memory cells dominate the area.  
>   
> *CMOS VLSI Design*, Weste & Harris

Main Memory（DRAM）由1T Cell（单颗MOS+一个电容）组成。DRAM要求存储单元数量更大，但因为有Cache做衔接，速度可以慢点。通过单颗MOS的 [栅电容](https://zhida.zhihu.com/search?content_id=27646989&content_type=Answer&match_order=1&q=%E6%A0%85%E7%94%B5%E5%AE%B9&zhida_source=entity) 上的电荷充放电来存储信息，速度虽然慢而且要定期刷新，但是面积大大变小（仅1个MOS），正好又符合要求！所以DRAM要选择用单个MOS。

至于外存，各类ROM，各类Disk，因为有了内存做衔接，速度就可以更慢点，而容量越大越好。

\-------------------------------------------------------------------------------------

大概就是这样了，我没有实际做过 [存储器](https://zhida.zhihu.com/search?content_id=27646989&content_type=Answer&match_order=1&q=%E5%AD%98%E5%82%A8%E5%99%A8&zhida_source=entity) 的设计和版图，也不知道这些外围电路占用面积是不是真的有书上写的那么大。但从这个角度分析，实在是为计算机存储层次设计各种各样trade-off拍案叫绝。

[发布于 2016-01-08 12:20](https://www.zhihu.com/question/20075426/answer/80546829)[金数据、麦客、表单大师 三个表单工具都有什么优缺点？](https://www.zhihu.com/question/402980538/answer/2144864344)

[

泻药！都提名了，表姐来答一波。不知道你的只做基础数据收集、分析是什么概念？没看到具体的使用场景不好说。就来谈谈我们...

](https://www.zhihu.com/question/402980538/answer/2144864344)

#### 更多回答

![](https://pic1.zhimg.com/50/1771ef10291461d5484d9d5216622e61_720w.jpg?source=1def8aca)

看了先有的答案，觉得概念有些混淆，于是主动碰瓷。 ============================概念的分割线============================= Memory大致包含了一下几种器件。 锁存器（Latch）。锁存器是电平敏感的，一般来讲作为构成寄存器（register）一部分出现。在时序电路中不会单独出现，不然容易引起时序错误。 寄存器（Register）。寄存器是沿敏感的。1bit的寄存器也叫（触发器）Flip-flop。最常见的Flip-flop结构是这样的： 通常不算 输出的话，一个Flip-flop是由16个晶体管（Transistor）组成的 @又见山人 。 Register的速度最快，消耗的晶体管也最多，所以一般作为时序电路的组成部分。所以ALU里面其实也是包含了register的。也有register专门用来储存数据的情况，比如说shift register array，但是它们的存储容量通常非常小。要知道几个kb的register的占用面积就是相当惊人的！ SRAM（Static Random Accessible Memory）。1bit由6个晶体管组成，一般作为片上存储器使用（On-chip-memory）。它消耗的晶体管比较多，但是速度快（仅次于register）。在CPU中作为cache的组成单元，大小是几MB到几十MB。Cache不是由register组成的， @时国怀 DRAM（Dynamic Random Accessible Memory）。一般1bit由一个晶体加一个电容组成。虽然面积小，但是速度慢，而且需要刷新。所以通常当内存用，存储几个GB的数据。 ROM（Read Only Memory）。这个就不说了。 ================================以下是答案=============================== registers are closer to the ALU than memory 不靠谱。因为register本身就是memory的一种。这里即使当内存理解也不对。应该这么说， register本身的结构决定了它能比构成内存的DRAM 工作在更高的时钟频率，所以才用在速度需求最快的地方（靠近ALU） 另外，给register的时钟频率就是CPU工作的时钟频率，cache（无论一级二级还是三级）也和CPU同频。所以从理论上讲，cache和register是一样快的。不过因为cache里面的东西不一定就是需要的，如果不需要的话就要一级一级往下读取，实在找不着才往内存里面找。在往下级找数据的时候CPU是需要等待的。

‘ “registers are closer to the ALU than memory" 可以解释得通吗？或者说，需要有所补充？ ’

这么说也不是不可以，但这种说法真正的问题在于混淆了因果。做个类比就是，刘翔因为跑得快上了奥运会，不是因为他上了奥运所以跑得快。

从计算机体系结构角度而言，需要把不同速度和容量的memory分层级，得到效率和成本间较好的平衡。最需要经常访问的数据放在速度最快容量最小的寄存器和L1 cache里，访问量最少的数据放在最慢最大的内存条里，以此类推。

一个相当粗略和不精确的描述如下：

寄存器（register） **经常** 自身就是CPU用的触发器， **往往** 与CPU同时钟同频，当然是最快最方便的。但这玩意一个要20多个晶体管，多了芯片面积吃不消。

SRAM的优势在于速度较快，与一般半导体工艺兼容，因此被当作cache放在芯片内部离CPU近的地方，发挥其速度快的长处。但是这玩意存储密度小（一个bit要6个晶体管），放太多就贵了。

DRAM天生速度慢但存储密度高，正好适合做内存条这种东西。

![](chrome-extension://difoiogjjojoaoomphldepapgpbgkhkb/assets/logo-O35E636P.png) Sider

[导游称大熊猫花花是残疾游客秒报警 340 万](https://www.zhihu.com/search?q=%E5%AF%BC%E6%B8%B8%E7%A7%B0%E5%A4%A7%E7%86%8A%E7%8C%AB%E8%8A%B1%E8%8A%B1%E6%98%AF%E6%AE%8B%E7%96%BE%E6%B8%B8%E5%AE%A2%E7%A7%92%E6%8A%A5%E8%AD%A6&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[孙杨被曝疑违规录取博士 334 万](https://www.zhihu.com/search?q=%E5%AD%99%E6%9D%A8%E8%A2%AB%E6%9B%9D%E7%96%91%E8%BF%9D%E8%A7%84%E5%BD%95%E5%8F%96%E5%8D%9A%E5%A3%AB&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[女子徒手给月子里宝宝打耳洞 295 万](https://www.zhihu.com/search?q=%E5%A5%B3%E5%AD%90%E5%BE%92%E6%89%8B%E7%BB%99%E6%9C%88%E5%AD%90%E9%87%8C%E5%AE%9D%E5%AE%9D%E6%89%93%E8%80%B3%E6%B4%9E&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[阿 Sa 蔡卓妍官宣结婚 289 万](https://www.zhihu.com/search?q=%E9%98%BF+Sa+%E8%94%A1%E5%8D%93%E5%A6%8D%E5%AE%98%E5%AE%A3%E7%BB%93%E5%A9%9A&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[广州地铁有人喷洒不明液体 266 万](https://www.zhihu.com/search?q=%E5%B9%BF%E5%B7%9E%E5%9C%B0%E9%93%81%E6%9C%89%E4%BA%BA%E5%96%B7%E6%B4%92%E4%B8%8D%E6%98%8E%E6%B6%B2%E4%BD%93&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[宇宙或仅剩约 333 亿年的寿命 250 万](https://www.zhihu.com/search?q=%E5%AE%87%E5%AE%99%E6%88%96%E4%BB%85%E5%89%A9%E7%BA%A6+333+%E4%BA%BF%E5%B9%B4%E7%9A%84%E5%AF%BF%E5%91%BD&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)