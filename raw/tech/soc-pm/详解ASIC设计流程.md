---
title: "详解ASIC设计流程"
source: "https://zhuanlan.zhihu.com/p/145714992"
author:
  - "[[李锐博恩​西安电子科技大学 电子科学与技术硕士]]"
published:
created: 2026-05-02
description: "目录 需求(Requirements) 技术指标(Specifications) 架构(Architecture) 数字设计(Digital Design) 验证(Verification) 逻辑综合(Logic Synthesis) 逻辑对等(Logic Equivalence) 布局和布线(Placement and Routing…"
tags:
  - "clippings"
---
[

收录于 · 电子、信息、半导体科普

](https://www.zhihu.com/column/c_1251280157618802688)

创作声明：内容包含虚构创作

53 人赞同了该文章

## 目录

---

***需求(Requirements)***

***技术指标(Specifications)***

***架构(Architecture)***

***数字设计(Digital Design)***

***验证(Verification)***

***逻辑综合(Logic Synthesis)***

***逻辑对等(Logic Equivalence)***

***布局和布线(Placement and Routing)***

***验证 (Validation)***

***流片（GDS II –图形数据流信息交换）***

---

## 写在前面

**[参考资料](https://link.zhihu.com/?target=https%3A//www.chipverify.com/verilog/asic-soc-chip-design-flow)** **[博客首页](https://link.zhihu.com/?target=https%3A//blog.csdn.net/Reborn_Lee)** 还记得去年应届生秋招，出身于FPGA的同学大多数都去找了 [IC前端设计](https://zhida.zhihu.com/search?content_id=120513726&content_type=Article&match_order=1&q=IC%E5%89%8D%E7%AB%AF%E8%AE%BE%E8%AE%A1&zhida_source=entity) 的工作，由于都是逻辑设计，都是相通的，倒是没有什么问题，但对于IC的基础知识还是有必要了解一二。 今天所讲的主题是 [ASIC设计流程](https://zhida.zhihu.com/search?content_id=120513726&content_type=Article&match_order=1&q=ASIC%E8%AE%BE%E8%AE%A1%E6%B5%81%E7%A8%8B&zhida_source=entity) ，据回忆，这是笔试出场率很高的一个问题。且从我个人的经验来看，能清晰了解这一个完整过程的人寥寥无几。这里参考中外文以及互联网资料，写一篇ASIC设计流程文章供大家参考，文中有不妥之处，还望批评指正，谢谢！ 注：描述版本千差万别，但内核一致。

---

## 正文

典型的设计流程遵循以下所示的结构，可以分为多个步骤。 这些阶段中的某些阶段并行发生，而某些阶段依次发生。 我们将研究当今行业中典型的项目设计周期的情况。

![](https://pic3.zhimg.com/v2-393f9eba352f75ef5d984c76c6641492_1440w.jpg)

---

## 需求(Requirements)

半导体公司的客户通常是其他一些计划在其系统或最终产品中使用该芯片的公司。 因此，客户的需求在决定如何设计芯片方面也起着重要作用。当然，第一步就是收集需求，估算最终产品的市场价值，并评估完成该项目所需的资源数量。

---

## 技术指标(Specifications)

下一步将是收集“规范”，这些规范抽象地描述了要设计的芯片的功能，接口和总体架构。这可能类似于： 1.需要计算能力才能运行成像算法以支持虚拟现实 2.需要两个具有相干互连功能的ARMA 53处理器，并且应在600MHz上运行 3.需要USB 3.0，蓝牙和PCle第二代接口 4.应使用适当的控制器支持1920x1080像素显示

---

## 架构(Architecture)

现在，架构师提出了芯片应如何工作的系统级视图。 他们将确定所需的所有其他组件，它们应以什么时钟频率运行以及如何确定功耗和性能要求。他们还将决定数据应如何在芯片内部流动。 例如，当处理器从系统ram中获取图像数据并执行时，数据流就会消失。与此同时，图形引擎将执行前一批数据的后处理数据，然后将其转储到内存的另一部分并很快执行。

![](https://pic3.zhimg.com/v2-d08fce52fd513c51dfacbbe36f112896_1440w.jpg)

---

## 数字设计(Digital Design)

由于现代芯片的复杂性，不可能从头开始构建某些东西，并且在许多情况下会重复使用许多组件。例如，X公司要求Flex CAN模块与汽车中的其他模块进行交互。 要么从另一家公司购买Flex CAN设计以节省时间和精力，要么花费资源自行构建一个系统。此外，从触发器和CMOS晶体管等基本构建模块设计这样的系统也不可行。 取而代之的是，开发了一种行为描述，以使用诸如 [Verilog](https://zhida.zhihu.com/search?content_id=120513726&content_type=Article&match_order=1&q=Verilog&zhida_source=entity) 或 [VHDL](https://zhida.zhihu.com/search?content_id=120513726&content_type=Article&match_order=1&q=VHDL&zhida_source=entity) 的硬件描述语言从功能，性能和其他高级问题方面对设计进行分析。 这通常是由数字设计师完成的，类似于配备了数字电子设备中的高级计算机程序员的软件。

![](https://pic4.zhimg.com/v2-0bc24267e2e937fe1061489aec701e03_1440w.jpg)

---

## 验证(Verification)

一旦RTL设计就绪，就需要对其功能正确性进行验证。例如，期望DSP处理器发出总线事务以从内存中获取指令，但是我们如何知道这种情况会按预期发生呢？ 因此，此时需要功能验证，这需要借助 [EDA仿真器](https://zhida.zhihu.com/search?content_id=120513726&content_type=Article&match_order=1&q=EDA%E4%BB%BF%E7%9C%9F%E5%99%A8&zhida_source=entity) 来完成，该仿真器具有对设计进行建模并对其施加不同激励的能力。这是验证工程师的工作。

![](https://pic3.zhimg.com/v2-1247a2d501cbf13896fb0af7fe27cfd6_1440w.jpg)

为了节省时间并实现功能收敛，设计团队和验证团队并行运行，其中设计人员“发布”了一个RTL版本，验证团队开发了测试平台环境和测试用例以测试该RTL版本的功能。 失败，则可能表明设计存在问题，并且该设计元素上将出现“错误”。该错误必须在设计团队的下一版RTL版本中进行修复。继续进行此过程，直到对设计的功能正确性有足够的信心为止。

---

## 逻辑综合(Logic Synthesis)

现在我们对设计感到满意，是时候使用组合门和触发器等真实元素将其转换为硬件原理图了。这一步骤称为综合。逻辑综合工具可将HDL中的RTL描述转换为门级 网表。 该网表只不过是对电路的门和它们之间的连接的描述。它可能类似于：

```
and_2_0     u_and2_0 ( .in_a (_net_112),
                       .in_b (_net_56),
                       .out  (_net_222));
 
ff_lt       u_ff_lt_122 (.d   (_net_222),
                         .clk (_net_11),
                         .q   (_net_76));
```

逻辑综合工具可确保网表满足时序，面积和功率规格，通常可以访问不同的技术节点过程和数字元素库，并且可以进行智能计算以满足所有这些不同的标准。这些库可从提供以下功能的半导体工厂获得： 不同组件的数据特性，例如触发器的上升/下降时间，组合门的输入-输出时间等。

---

## 逻辑对等(Logic Equivalence)

然后检查门级网表与RTL的逻辑等效性，有时会执行“门级验证”，其中再次验证某些元素，不同之处在于这一次是门级且处于较低级别抽象级别。由于在此阶段设计中涉及的元素数量众多，并且带有回注的延迟信息，因此仿真时间往往会变慢。

---

## 布局和布线(Placement and Routing)

然后将网表输入到物理设计流程中，在此流程中，借助EDA工具完成自动布局和布线（APR或PnR）。 Cadence Encounter和 [Synopsys IC Compiler](https://zhida.zhihu.com/search?content_id=120513726&content_type=Article&match_order=1&q=Synopsys+IC+Compiler&zhida_source=entity) 是此类工具的一个很好的例子。这将选择标准单元并将其放置为行，定义用于输入输出的球形图，创建不同的金属层，并放置缓冲区以满足时序要求。完成此过程后，将生成布局并通常发送至制造阶段。由物理设计团队处理，他们精通技术节点和物理实施细节。

![](https://pic1.zhimg.com/v2-36a7dad86c6be01230e7a86c140b4690_1440w.jpg)

---

## 验证 (Validation)

它并没有到此结束。 样品芯片可以由同一家半导体公司制造，也可以发送给第三方铸造厂，例如 [TSMC](https://zhida.zhihu.com/search?content_id=120513726&content_type=Article&match_order=1&q=TSMC&zhida_source=entity) 或Global Foundries。 该样例芯片现在经历了硅片后验证过程，其中另一个工程师团队在测试仪上运行不同的模式。与硅片前验证相比，在硅片后图标验证中调试起来要困难得多，这仅仅是因为对硅片的可见性水平 芯片的内部节点将大大减少。此外，一百万个时钟周期将在一秒钟内完成，而追溯到准确的错误时间将非常耗时。如果在此阶段发现任何实际问题或设计错误，则必须在RTL中修复此问题，然后重新进行验证，并且必须执行此之后的所有步骤。

![](https://pic2.zhimg.com/v2-e8701e793f2b5cc60c648574b1644e6f_1440w.jpg)

尽管设计流程中有多个步骤，但许多设计活动通常都集中在电路RTL描述的优化和验证上。 重要的是要注意，尽管可以使用EDA工具来使流程自动化，但使用不当会导致设计效率低下，因此设计人员必须在设计过程中做出明智的选择。

---

## 流片（GDS II –图形数据流信息交换）

在流片的最后阶段，工程师执行晶片处理，封装，测试，验证并交付给物理IC。 GDS II是半导体代工厂生产并用于制造硅并交付给客户的文件。

---

## 参考资料

**[参考资料1](https://link.zhihu.com/?target=https%3A//www.chipverify.com/verilog/asic-soc-chip-design-flow%23requirements)** **[参考资料2](https://link.zhihu.com/?target=https%3A//www.einfochips.com/blog/asic-design-flow-in-vlsi-engineering-services-a-quick-guide/)**

## 交个朋友

个人微信公众号 ：FPGA LAB，欢迎关注；

**[FPGA/IC技术交流2020](https://link.zhihu.com/?target=https%3A//blog.csdn.net/Reborn_Lee/article/details/105844330)**

1 人已送礼物

发布于 2020-06-04 04:19[ASIC](https://www.zhihu.com/topic/19650409)[RAG学习全流程，存一下吧很难找全了](https://zhuanlan.zhihu.com/p/1985748049927111600)

[

最近一年，LLM展示了强大的能力，但是面对幻觉、最新的知识以及复杂任务时往往略显不足。RAG（Retrieval Augmented Gener...

](https://zhuanlan.zhihu.com/p/1985748049927111600)