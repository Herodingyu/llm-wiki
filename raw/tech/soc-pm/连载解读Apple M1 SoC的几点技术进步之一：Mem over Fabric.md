---
title: "[连载]解读Apple M1 SoC的几点技术进步之一：Mem over Fabric"
source: "https://zhuanlan.zhihu.com/p/296374948"
author:
  - "[[Morris.Zhang​新知答主]]"
published:
created: 2026-05-02
description: "因为官方披露的技术细节着实不多，如下仅揣测性的谈谈有可能的一个创新亮点：Mem Fabric. 先回顾一下发布会的基本信息，普遍披露的文案是：“Apple所做的这一举动是15年来从未发生过的：开始了整个消费类Mac系列的…"
tags:
  - "clippings"
---
[收录于 · Morris的技术研究专栏](https://www.zhihu.com/column/morris-zhang)

36 人赞同了该文章

因为官方披露的技术细节着实不多，如下仅揣测性的谈谈有可能的一个创新亮点：Mem Fabric.

先回顾一下发布会的基本信息，普遍披露的文案是：“Apple所做的这一举动是15年来从未发生过的：开始了整个消费类Mac系列的CPU架构转型。而M1芯片的底层技术亮点在于：低功耗 + [统一内存架构](https://zhida.zhihu.com/search?content_id=153990138&content_type=Article&match_order=1&q=%E7%BB%9F%E4%B8%80%E5%86%85%E5%AD%98%E6%9E%B6%E6%9E%84&zhida_source=entity) （Unified memory architecture - UMA）设计。苹果在“移动设备”和“电脑”两者的底层技术创新开始合力了，未来是上层应用生态的融合。

上一次Apple在2006年进行这样的尝试时，放弃了IBM的PowerPC ISA指令集和处理器，转而支持 [Intel x86](https://zhida.zhihu.com/search?content_id=153990138&content_type=Article&match_order=1&q=Intel+x86&zhida_source=entity) 。如今后者正在被剥离，Apple Silicon转而采用基于Arm-ISA的处理器和CPU微 [体系结构](https://zhida.zhihu.com/search?content_id=153990138&content_type=Article&match_order=1&q=%E4%BD%93%E7%B3%BB%E7%BB%93%E6%9E%84&zhida_source=entity) 。先看看基本框架：Apple M1是首款针对Mac设计的SoC，它具有四个大型性能内核，四个效率内核和一个8-GPU内核GPU，在5nm工艺节点上具有160亿个 [晶体管](https://zhida.zhihu.com/search?content_id=153990138&content_type=Article&match_order=1&q=%E6%99%B6%E4%BD%93%E7%AE%A1&zhida_source=entity) 。并且，Apple也提到M1是一个真正的SoC，包括之前Mac笔记本PC内部的几个分立芯片的功能，比如I/O控制器和Apple的SSD和安全控制器（下面框图中的所有模块算是整个裸片的一大部分，并带有大量的辅助IP）。官方口径是：这160亿个晶体管，包括将CPU、GPU、 [神经网络引擎](https://zhida.zhihu.com/search?content_id=153990138&content_type=Article&match_order=1&q=%E7%A5%9E%E7%BB%8F%E7%BD%91%E7%BB%9C%E5%BC%95%E6%93%8E&zhida_source=entity) 、各种连接功能以及其他众多组件，统统集成在一颗SoC芯片中，有高能效、体积小、高带宽、低延时等特点，并支持雷雳/USB 4端口接口。”

![](https://picx.zhimg.com/v2-02dc5e34673cbc9882f902ee8f401145_1440w.jpg)

图片引用自半导体行业观察

需要注意的是，除了CPU和GPU上的其他 [内核](https://zhida.zhihu.com/search?content_id=153990138&content_type=Article&match_order=4&q=%E5%86%85%E6%A0%B8&zhida_source=entity) 外，M1与A14的另一项主要区别在于它运行在128位内存总线上，而不是在移动场景的A14的64位总线上，M1的内存位宽是A14的两倍， [内存延迟](https://zhida.zhihu.com/search?content_id=153990138&content_type=Article&match_order=1&q=%E5%86%85%E5%AD%98%E5%BB%B6%E8%BF%9F&zhida_source=entity) 更低。在8个16位内存通道和LPDDR4X-4266级内存中，这意味着M1达到了68.25GB / s的 [内存带宽](https://zhida.zhihu.com/search?content_id=153990138&content_type=Article&match_order=1&q=%E5%86%85%E5%AD%98%E5%B8%A6%E5%AE%BD&zhida_source=entity) 峰值。另外相比 A14，M1 核心更多、频率更高、L2 缓存更大，内存也更大，显然用于竞争x86桌面场景的M1性能显著优于移动场景的A14。

其中的亮点，也是本篇想讨论的Mem Fabric：M1自带了一个最高16GB的高速统一内存（官方口径是：“这种合而为一的高带宽、低延迟mem pool，让各种应用能在CPU、GPU和神经网络引擎间高效地共享数据，从而提高任务处理速度）”。那么我们算一算SoC上的模块建的搬数带宽就很了不起。并可以猜测M1的mem底层结构不是传统构型的，Mem fabric(mem over fabric) 也许是最可期待的亮点；可能体现在：各种xPU通过高速fabric访问mem pool，那就是多通道了，加上不必与CPU同步时序，那么集成显核的传统瓶颈也就因此弱化甚至不存在了；以及在此基础上能够把mem pool一体化也是非常不凡，推想未来可能有机会演进SCM结构咯～

展开一点说，我们知道PC上的显存共享是按地址划分，即使双通道，GPU还是受制于总线访问速度，还要跟CPU分时序…，倘若用高速fabric，则xPU之间的工作频率甚至不需要同步了（SerDes本身不受 [总线频率](https://zhida.zhihu.com/search?content_id=153990138&content_type=Article&match_order=1&q=%E6%80%BB%E7%BA%BF%E9%A2%91%E7%8E%87&zhida_source=entity) 驱动 也不传送时钟信号）。当然，有关fabric细节是不会披露的设计秘密，特别是底层PHY，还包括各种xPU访问的topology/ 时序/ [冲突解决机制](https://zhida.zhihu.com/search?content_id=153990138&content_type=Article&match_order=1&q=%E5%86%B2%E7%AA%81%E8%A7%A3%E5%86%B3%E6%9C%BA%E5%88%B6&zhida_source=entity) 等等；

目前，只能猜测它的多通道topology，那么多xPU能够异步大带宽工作的话就很了不起（总线只是对CPU而言，GPU和NPU可以是单纯数据驱动的），所以mem pool底层设计就可能大有文章。简单举例，GDDR4比DDR4快一倍，倘若在传统设计里，GPU和CPU一旦要共享mem，理论上GPU就是降半速运行，这是挂传统总线的弊端，只能有一个时钟；设想用fabric，可能突破点就在于允许xPU工作在不同时钟上，这样GPU就不必降速了。

当然，类似的Mem fabric和内存分频访问技术也广泛运用在Intel/AMD/Nvidia的设计中，比如传统Ringbus/Mesh，以及AMD的Infinity Fabric(还用来link chiplets)、NV的GPUDirect直连等，CPU和xPU挂在这些fabric上面，划分各自的 [时钟域](https://zhida.zhihu.com/search?content_id=153990138&content_type=Article&match_order=1&q=%E6%97%B6%E9%92%9F%E5%9F%9F&zhida_source=entity) (地址范围)，没有什么CPU/GPU的频率约束；虽然它们都是为了大幅提升xPU载入大型数据集的速度，减轻CPU I/O的瓶颈，提升I/O带宽和传输数据的量；但多数都与UMA这种整体内存空间共用共分配的模式不同，通常意义的UMA与内存 [共享池](https://zhida.zhihu.com/search?content_id=153990138&content_type=Article&match_order=1&q=%E5%85%B1%E4%BA%AB%E6%B1%A0&zhida_source=entity) 的根本差异在于内存空间的所有权以及其服务的方式；那么其中topology/ 时序/ 冲突解决机制，甚至fabric的底层PHY等等细节就是M1不会披露的设计亮点。

此外，过往惯例上讲，增加了那么多cache/buffer的代价，是 [指令周期](https://zhida.zhihu.com/search?content_id=153990138&content_type=Article&match_order=1&q=%E6%8C%87%E4%BB%A4%E5%91%A8%E6%9C%9F&zhida_source=entity) 得加，不提高频率的话，个别操作就显得慢（比如高IPC的任务 - 但是M1是 [降频](https://zhida.zhihu.com/search?content_id=153990138&content_type=Article&match_order=1&q=%E9%99%8D%E9%A2%91&zhida_source=entity) 加了超宽的单核8发射解码宽度来实现高IPC的指令并行度），当然升频的话相信流水线也会增加；且PC这个 [form factor](https://zhida.zhihu.com/search?content_id=153990138&content_type=Article&match_order=1&q=form+factor&zhida_source=entity) 要严肃考虑向后兼容性了，手机则不必考虑。猜想那位主管IC设计的SVP Johny Srouji还是把老东家(INTC)的祖传手艺传承了一些（为了Apple事业他放弃了Intel委任其CEO的橄榄枝）。如下的链接里陈述了M1的ILP指令级 [并行性](https://zhida.zhihu.com/search?content_id=153990138&content_type=Article&match_order=1&q=%E5%B9%B6%E8%A1%8C%E6%80%A7&zhida_source=entity) 的信息，以及OOOE乱序预测/执行的深度；

[Apple Announces The Apple Silicon M1: Ditching x86 - What to Expect, Based on A14](https://link.zhihu.com/?target=https%3A//www.anandtech.com/show/16226/apple-silicon-m1-a14-deep-dive/2)

上述的推测，在Apple几位SVP的解释中可以有些佐证，包括Johny Srouji和主持 [软件工程](https://zhida.zhihu.com/search?content_id=153990138&content_type=Article&match_order=1&q=%E8%BD%AF%E4%BB%B6%E5%B7%A5%E7%A8%8B&zhida_source=entity) 的SVP Craig Federighi的口述：【UMA本质是所有的组件——CPU、GPU、NN处理器、图像信号处理器(ISP)等——共享一个速度极快的Mem pool，且位置非常接近；这与常见的桌面范例相反，比如把一块内存池分配给CPU，另一块分配给另一边的GPU。而M1使用统一化的内存架构，不需要不断地来回移动数据，也减少重复的 [数据存储](https://zhida.zhihu.com/search?content_id=153990138&content_type=Article&match_order=1&q=%E6%95%B0%E6%8D%AE%E5%AD%98%E5%82%A8&zhida_source=entity) ，也不需要改变格式来减慢速度。性能就有很大的提升。此外，近几年来，Apple Metal图形API采用了“基于tile的延迟渲染”，M1的GPU就是为了充分利用这一点而设计的。Federighi也解释了：所以我认为过去的工作量就如同你想画的三角形，把它们送到离散的GPU上，让它去做它的事——现代计算机渲染管道并不是现在的样子。这些东西在许多不同的 [执行单元](https://zhida.zhihu.com/search?content_id=153990138&content_type=Article&match_order=1&q=%E6%89%A7%E8%A1%8C%E5%8D%95%E5%85%83&zhida_source=entity) 之间来回移动，以实现这些效果——老派的GPUs基本上是同时在整个框架上操作，而M1可以移动到极快的片上内存，然后执行一个巨大的操作序列。这是极高带宽效率的方式，那些 [离散](https://zhida.zhihu.com/search?content_id=153990138&content_type=Article&match_order=2&q=%E7%A6%BB%E6%95%A3&zhida_source=entity) 的GPU没有这样的优势。然后你只要把它与我们高带宽，以及芯片的其他效率结合起来，它就是一个更好的架构。】

另外在封装层面：M1 这种在有机封装中嵌入DRAM的封装方式对Apple来说已经习以为常；从A12开始就一直在使用这种方式。当涉及到高端芯片时，Apple倾向于使用这种封装而不是通常的智能手机POP封装(封装上的封装)，因为这些芯片在设计时考虑到了更高的TDP。所以将DRAM放在这颗CPU的旁边，而不是放在其上，这样有助于确保这些 [芯片](https://zhida.zhihu.com/search?content_id=153990138&content_type=Article&match_order=7&q=%E8%8A%AF%E7%89%87&zhida_source=entity) 仍能得到有效冷却。这也意味着，几乎可以肯定M1芯片上的128位DRAM总线，与上一代a-X芯片非常相似。

当然上述仅仅猜测，当然TSMC知晓的信息只会更清楚。

最后谈一个问题：Apple M1虽然使用ARM [指令架构](https://zhida.zhihu.com/search?content_id=153990138&content_type=Article&match_order=1&q=%E6%8C%87%E4%BB%A4%E6%9E%B6%E6%9E%84&zhida_source=entity) ，但严格而言M1并不是ARM生态，它是ARM Architectural license的产物，是苹果面向自身软硬件生态的自主定制产品，几乎不考虑对于ARM公版生态的向前和向后兼容问题，ARM会以高昂价格去限制“架构许可”的客户数量，避免像MIPS一样过于碎片化，避免侵犯到公版市场，真正的ARM生态是指“公版指令集授权、周边IP和design service”，倘若公版IP被广大处理器厂商和整机厂商所采用，才算是发扬了ARM生态。换句话讲：Apple仅通过ARM Archi License购买一个 [指令集](https://zhida.zhihu.com/search?content_id=153990138&content_type=Article&match_order=3&q=%E6%8C%87%E4%BB%A4%E9%9B%86&zhida_source=entity) ，其它的部分自行设计，兼容性自己做翻译；等于仅在指令兼容性/翻译方面向ARM买一版指令集（等同于翻译字典）（但出于修改/定制指令的需求而购买架构许可，此举解决ARM生态的兼容性问题（OS/应用软件）。

BTW：其它高含量创新亮点也有很多，比如应该HT/MT支持很好的Rosetta 2，当然Rosetta BT必然涉及内情和幕后交易的（内闻当年把Power迁移到x86，INTC出了300个NRE工程师；此次成熟度极高的Rosetta，相信 [微软](https://zhida.zhihu.com/search?content_id=153990138&content_type=Article&match_order=1&q=%E5%BE%AE%E8%BD%AF&zhida_source=entity) 大有援手，当年Windows phone, Surface并未创造巨大成功，甚至赔掉了Nokia，于是MSFT暗地积累x86-->ARM的BT也几乎10年了， 这次总算把手里藏了10年+的底层代码拿出来换成产品变现了，这些都是 [编译器](https://zhida.zhihu.com/search?content_id=153990138&content_type=Article&match_order=1&q=%E7%BC%96%E8%AF%91%E5%99%A8&zhida_source=entity) 深度优化以及对于指令集的深度理解），否则Rosetta BT也不可能这么快点亮。下次单独讨论一篇Rosetta项目吧。

下图是源于外媒Anandtech使用Veedrac的uArch [测试套件](https://zhida.zhihu.com/search?content_id=153990138&content_type=Article&match_order=1&q=%E6%B5%8B%E8%AF%95%E5%A5%97%E4%BB%B6&zhida_source=entity) 针对A14 SoC内部的Firestorm CPU核的结构推测图（M1官方并未披露）：

![](https://pica.zhimg.com/v2-4fc4a0e2b16903dff8c6d53623a99a12_1440w.jpg)

图片引用自半导体行业观察

还没有人送礼物，鼓励一下作者吧

[所属专栏 · 2026-04-16 23:44 更新](https://zhuanlan.zhihu.com/morris-zhang)

[![](https://picx.zhimg.com/v2-c636135514c58738c1f449726c583144_720w.jpg?source=172ae18b)](https://zhuanlan.zhihu.com/morris-zhang)

[Morris的技术研究专栏](https://zhuanlan.zhihu.com/morris-zhang)

[

Morris.Zhang

新知答主

100 篇内容 · 12280 赞同

](https://zhuanlan.zhihu.com/morris-zhang)

[

最热内容 ·

如何看待消息称张汝京创办的芯恩 （CIDM）8 寸芯片厂正式投片成功?

](https://zhuanlan.zhihu.com/morris-zhang)

编辑于 2022-12-08 13:44・北京