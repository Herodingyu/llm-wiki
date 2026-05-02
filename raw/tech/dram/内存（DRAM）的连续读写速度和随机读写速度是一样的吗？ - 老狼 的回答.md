---
title: "内存（DRAM）的连续读写速度和随机读写速度是一样的吗？ - 老狼 的回答"
source: "https://www.zhihu.com/question/325168076/answer/690611689"
author:
  - "[[老狼​新知答主已关注]]"
  - "[[独孤星夜]]"
  - "[[北极​中央处理器 (CPU)等 5 个话题下的优秀答主]]"
published:
created: 2026-05-02
description: "谢邀。DRAM随机读写是比连续读写要慢，我们来看实际的数据：AMD和Intel的差距不在本文范围内，我们暂且忽…"
tags:
  - "clippings"
---
## 内存（DRAM）的连续读写速度和随机读写速度是一样的吗？

如果像SSD一样，随机读写还是比连续读写慢，那么页式虚拟内存管理这层转换是不是会浪费很大的性能？而且即使没有页式内存管理，在BIOS层面上的“物理地址…

198 人赞同了该回答

![](https://pica.zhimg.com/50/v2-80b0f87c58298441268afb02ad07baef_720w.jpg?source=2c26e567)

谢邀。 DRAM 随机读写是比连续读写要慢，我们来看实际的数据： AMD和Intel的差距不在本文范围内，我们暂且忽略。我们专注看第一条，就会发现： 按字节纯随机读取延迟 > 在一个page里面随机读取延迟 > 顺序连续读取延迟 这是为什么呢？我们分别来看看： 随机读取延迟为什么高？ 不是说好内存是随机读取设备吗？为什么随机读取延迟还会高呢？这里有两个原因： Burst读取 和 Prefetcher 。 我们知道内存条是有64个Bit的数据线:DQ0-DQ63，共8个字节。如果读取某个地方的数据，需要不少步骤（大致）： Precharge。 2. 行有效 。RAS#低电平，CAS#高电平。意味着现在行地址有效，同时在A0-A13传送地址信号，即2^13个Row可以选择。 3. 列有效 。RAS#高电平，CAS#低电平。意味着列地址有效，这时在A0-A13上传送的是列地址。没错，A0-A13是行列共用的，所以每个格子选择需要有1和2两步才能唯一确定。 4. 数据读出或写入 。根据COMMAND进行读取或者写入。在选定好小方格后，就已经确定了具体的存储单元，剩下的事情就是数据通过数据I/O通道（DQ）输出到内存总线上了。 而我们 Cache line 是64个字节，那么每次刷新Cache line是不是要来8次这么多步骤呢？并不是，有Burst读取，我们没用的多余的Prechange,行列选择也只要一次，就可以连续读取8个8字节数据了，也就是Burst Length(BL)是8。如果我们读了一半，不需要这么多，可以用 Burst Chop 来省电。这样我们就省了7个CL、 tRCD 、 tRP 延迟，总延迟能不下降吗？ Burst mode十分普遍，几乎出现在所有需要传输数据的地方，大到网络传输，小到UPI等等通信，DRAM和SSD都有Burst传输。 那么是不是我不是一个字节一个字节读，而是8个字节8个字节读，随机和顺序就完全一样呢？也不是，CPU中为了提高性能，有很多预取器（Prefetcher）。Prefetcher种类众多，有指令的，有数据的，有些Prefetcher对某种work load有用，有些则在某种work load中有反作用。Prefetcher也会让我们顺序读取比随机读取更快，它省了指令流水线的部分时间（想想为什么）。 为什么跨page最慢呢？ 最后分析一下跨Page随机比同page随机慢的原因。跨Page有可能要刷 TLB ，如果不停切page，则必然大量刷新TLB。TLB刷新会消耗大量的Cycle，这是它最慢的原因。

还没有人送礼物，鼓励一下作者吧

[编辑于 2019-05-22 08:57](https://www.zhihu.com/question/325168076/answer/690611689)[嵌入式视觉怎么做?](https://www.zhihu.com/question/1954553331751059811/answer/1966888806914438330)

[你好，这里是汉码未来，从接触嵌入式视觉到独立做项目，踩过不少 “先啃理论再动手” 的坑，其实这行更讲究 “边做边学”，核心是把视觉算法和嵌入式硬件的适配落地搞明白。最开始别一头...](https://www.zhihu.com/question/1954553331751059811/answer/1966888806914438330)

#### 更多回答

内存每一个bank只有一个buffer，读写都要通过这个buffer来进行，这个buffer只能装载内存的一行，也叫page。

存在buffer中的行的状态称为page opened，而同一bank其他行的状态称为page closed。

如果到来的命令正好是访问当前open状态的行，那么这叫page hit，只需要一个cas命令(列选择，既读或者写）即可完成操作。

如果所有行处于close状态，这叫page miss，需要先发一个ras命令，也叫active命令，行选择。然后再发cas命令完成操作。

如果当前访问的行和open状态的行不是同一行，那么这叫page conflict。需要先发一个pre-charge命令，关闭当前open的行，然后再ras命令，最后cas命令完成操作。

所以memory controller主要使用两种page策略，open page 和close page。open page，顾明思议，读写后不会立刻进行pre-charge，这种策略对连续地址读写方式更友好，但一旦出现page conflict，受到的影响就很明显。而close page则是每次读写后立刻pre-charge，这样每次到来的命令都是page miss，不会出现page conflict，对随机读写更加友好。

一般来说，连续命令以连续地址操作较多，所以一般性能好优化好的memory controller采用open page方式的占多数，需要对命令进行重排序，再调度，保持同一地址的读写顺序，pre-charge预测等等优化，还要采取对应的地址映射方式（这块挺复杂，简单的说，可以把collum地址映射到地址的低位，采用CS interleave，把bank group和bank地址映射到低位，bank group比bank更低为好），目的是增加page hit，减少page conflict。

close page方式是结构相对简单的memory controller主要采用。所以连续地址读写和随机地址读写的速度，根据memory controller采用的page策略有关，当然大部分是连续地址读写速度更快带宽更高。

另外，从读命令到写命令所用切换时间比从写到读少，这是因为数据操作其实主要在buffer中进行，如果前一个是读，读命令不会影响数据，buffer中数据始终和open的行中数据保持一致，所以pre-charge的时候不需要把buffer中数据写回行中。而写命令会改变数据，需要一个写回的过程。所以还尽量要减少写到读的切换，在保证正确读写顺序的基础上。

先说结论吧：DRAM的随机读写速度必然慢于连续读写。

主要原因是CPU存在着多层次的cache，随机读写会造成大量的cache miss，必然引发速度下降。除非是完全没有cache的CPU，比如Intel第一代的8086 CPU。

因为不存在cache，所以随机读写速度基本上跟连续读写是一样的，但8086的随机跳转性能会差一些，因为8086上还是有几个字节的指令预取缓存的。

回到题主的问题，段页式转化是必然要产生性能损失的，极端的例子是虚拟化，虚拟化是两次翻译，先从虚拟机的虚地址转换成虚拟机的物理地址，再转换成实际物理地址，所以虚拟机的内存访问性能要慢于非虚拟机，但这个浪费并不是“很大”，Intel号称虚拟机的内存访问性能比非虚拟化模式慢10%~30%左右，这是过去的数据，不知道现在什么样了，所以算不上“浪费很大”。

实际CPU在翻译段页地址的时候，页面内的地址翻译是有缓存的，比如对于指令来说，只要不踩到页边界，是不会触发新的地址翻译（这里特别说明一下：操作系统从实模式切换到保护模式的时候，也用了这种技巧：不跨页，不触发地址翻译）。而跨页的话，也并非到RAM里拿页表，那样开销太大了，有TLB的存在可以提高地址翻译速度。

BIOS层面上的物理地址到实际物理设备的地址翻译是在内存控制器里做的，这方面可以认为是没有性能损耗的，因为翻译的过程是可以认为是静态的，就算是有开销，也远远低于虚地址的翻译——这个是动态的，因为页表是可调整的。

不管地址翻译的开销有多大，也比不上cache miss，这个会严重影响性能。

有一些特殊的应用场合，会为了保证性能或者实时性，会关掉页表，或者做大页一一映射，这就是为了尽量让地址翻译的影响降到最低。

\-------------------------------

再说SSD的问题，SSD是不需要寻道，但SSD也是有cache的，SSD内部有一张表，保存着逻辑扇区到物理扇区的映射，为了保证性能，这个映射表运行时是被SSD放到主控的cache里的，但基于成本的考虑不会是全cache的，那么这里就会有cache miss的可能，cache miss的开销可能是微秒甚至毫秒级，这样延迟就很大了。

随机写就更复杂一点，除了SSD本身的cache miss之外，SSD写操作的最小单元要大于读，SSD读的最小单位一般是一个扇区（512B/4K），擦除的最小单位是一个block，可能是128KB甚至更大，擦除一个block的开销是毫秒级的延迟，如果连续写128KB，可能是只需要擦除一个block，但如果是随机写，那可能是擦除非常多的block，其开销是完全不一样的。

所以即使SSD不需要寻道，其随机读写的性能也慢于连续读写。

![](chrome-extension://difoiogjjojoaoomphldepapgpbgkhkb/assets/logo-O35E636P.png) Sider

[导游称大熊猫花花是残疾游客秒报警 340 万](https://www.zhihu.com/search?q=%E5%AF%BC%E6%B8%B8%E7%A7%B0%E5%A4%A7%E7%86%8A%E7%8C%AB%E8%8A%B1%E8%8A%B1%E6%98%AF%E6%AE%8B%E7%96%BE%E6%B8%B8%E5%AE%A2%E7%A7%92%E6%8A%A5%E8%AD%A6&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[孙杨被曝疑违规录取博士 334 万](https://www.zhihu.com/search?q=%E5%AD%99%E6%9D%A8%E8%A2%AB%E6%9B%9D%E7%96%91%E8%BF%9D%E8%A7%84%E5%BD%95%E5%8F%96%E5%8D%9A%E5%A3%AB&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[女子徒手给月子里宝宝打耳洞 295 万](https://www.zhihu.com/search?q=%E5%A5%B3%E5%AD%90%E5%BE%92%E6%89%8B%E7%BB%99%E6%9C%88%E5%AD%90%E9%87%8C%E5%AE%9D%E5%AE%9D%E6%89%93%E8%80%B3%E6%B4%9E&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[阿 Sa 蔡卓妍官宣结婚 289 万](https://www.zhihu.com/search?q=%E9%98%BF+Sa+%E8%94%A1%E5%8D%93%E5%A6%8D%E5%AE%98%E5%AE%A3%E7%BB%93%E5%A9%9A&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[广州地铁有人喷洒不明液体 266 万](https://www.zhihu.com/search?q=%E5%B9%BF%E5%B7%9E%E5%9C%B0%E9%93%81%E6%9C%89%E4%BA%BA%E5%96%B7%E6%B4%92%E4%B8%8D%E6%98%8E%E6%B6%B2%E4%BD%93&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[宇宙或仅剩约 333 亿年的寿命 250 万](https://www.zhihu.com/search?q=%E5%AE%87%E5%AE%99%E6%88%96%E4%BB%85%E5%89%A9%E7%BA%A6+333+%E4%BA%BF%E5%B9%B4%E7%9A%84%E5%AF%BF%E5%91%BD&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)