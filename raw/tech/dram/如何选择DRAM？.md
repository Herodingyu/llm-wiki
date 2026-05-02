---
title: "如何选择DRAM？"
source: "https://zhuanlan.zhihu.com/p/603676556"
author:
  - "[[晒科网打通科技成果转化最后一公里]]"
published:
created: 2026-05-02
description: "如何构建高性能芯片的选择数量正在增加，但附加内存的选择几乎没有变化。为了在汽车、消费和超大规模计算中实现最大性能，选择归结为一种或多种 DRAM，而最大的权衡是成本与速度。 DRAM 仍然是任何这些架构中的重…"
tags:
  - "clippings"
---
1 人赞同了该文章

如何构建高性能芯片的选择数量正在增加，但附加内存的选择几乎没有变化。为了在汽车、消费和超大规模计算中实现最大性能，选择归结为一种或多种 DRAM，而最大的权衡是成本与速度。

DRAM 仍然是任何这些架构中的重要组成部分，尽管多年来一直在努力用更快、更便宜或更通用的内存取代它，甚至将其嵌入到 SoC 中。但 DRAM 制造商并没有保持不变，而是根据性能、功耗和成本推出了多种选择。这些仍然是基本的权衡，要驾驭这些权衡，需要深入了解内存的使用方式、所有部件的连接方式，以及芯片或系统的关键属性是什么。

Rambus [产品管理](https://zhida.zhihu.com/search?content_id=222282299&content_type=Article&match_order=1&q=%E4%BA%A7%E5%93%81%E7%AE%A1%E7%90%86&zhida_source=entity) 高级总监 Frank Ferro 表示：“我们继续看到对更多带宽内存需求的非常激进的趋势，即使在 [宏观经济](https://zhida.zhihu.com/search?content_id=222282299&content_type=Article&match_order=1&q=%E5%AE%8F%E8%A7%82%E7%BB%8F%E6%B5%8E&zhida_source=entity) 形势下也是如此。” “有很多公司都在研究不同类型的 [内存架构](https://zhida.zhihu.com/search?content_id=222282299&content_type=Article&match_order=1&q=%E5%86%85%E5%AD%98%E6%9E%B6%E6%9E%84&zhida_source=entity) 。这包括解决带宽问题的各种方法，无论是具有大量片上内存的处理器还是其他方式。虽然这种方法将是最便宜和最快的，但容量非常低，因此 [人工智能算法](https://zhida.zhihu.com/search?content_id=222282299&content_type=Article&match_order=1&q=%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD%E7%AE%97%E6%B3%95&zhida_source=entity) 必须针对这种类型的架构进行定制。”

**Chiplets**

不过，这仍然没有减少对附加内存的需求。总体而言，向 [异构计算](https://zhida.zhihu.com/search?content_id=222282299&content_type=Article&match_order=1&q=%E5%BC%82%E6%9E%84%E8%AE%A1%E7%AE%97&zhida_source=entity) （尤其是小芯片）的发展只会加速对高带宽内存的需求，无论是 HBM、GDDR6 还是 LPDDR6。

HBM 是三者中最快的。但到目前为止，HBM 一直基于 2.5D 架构，这限制了它的吸引力。“制作 2.5D 中介层仍然是相对昂贵的技术，”Ferro 说。“ [供应链](https://zhida.zhihu.com/search?content_id=222282299&content_type=Article&match_order=1&q=%E4%BE%9B%E5%BA%94%E9%93%BE&zhida_source=entity) 问题并没有太大帮助。在过去的两年里，这种情况有所缓解，但它确实凸显了当你在做这些复杂的 2.5D 系统时的一些问题，因为你必须组合很多组件和基板。如果其中任何一件不可用，就会扰乱整个流程或造成很长的 [交付周期](https://zhida.zhihu.com/search?content_id=222282299&content_type=Article&match_order=1&q=%E4%BA%A4%E4%BB%98%E5%91%A8%E6%9C%9F&zhida_source=entity) 。”

![](https://pic4.zhimg.com/v2-870b46d18deea158e111f87c27892b11_1440w.jpg)

图 1：用于最大数据吞吐量的 HBM 堆栈

将 HBM连接到其他一些封装方法（例如扇出）或使用不同类型的 [中介层](https://zhida.zhihu.com/search?content_id=222282299&content_type=Article&match_order=2&q=%E4%B8%AD%E4%BB%8B%E5%B1%82&zhida_source=entity) 或桥接器堆叠芯片的工作已经进行了一段时间。这些将变得必不可少，因为更多的前沿设计包括某种类型的高级封装，这些封装具有可能在不同工艺节点开发的异构组件。

“很多 HBM 空间实际上更多地是关于制造问题而不是 IP 问题，” Cadence的 IP 集团产品营销集团总监 Marc Greenberg 说。“当你有一个内部带有 [硅中介层](https://zhida.zhihu.com/search?content_id=222282299&content_type=Article&match_order=1&q=%E7%A1%85%E4%B8%AD%E4%BB%8B%E5%B1%82&zhida_source=entity) 的系统时，你需要弄清楚如何构建一个带有硅中介层的系统。首先，您将如何在那里制造硅中介层？它比普通的硅芯片大得多。它必须变薄。它必须绑定到将要在其上的各种芯片。它需要封装。HBM 解决方案涉及很多专业制造。这最终超出了 IP 领域，更多地进入了 ASIC 供应商和 OSAT 所做的领域。”

**汽车中的 [高带宽存储器](https://zhida.zhihu.com/search?content_id=222282299&content_type=Article&match_order=1&q=%E9%AB%98%E5%B8%A6%E5%AE%BD%E5%AD%98%E5%82%A8%E5%99%A8&zhida_source=entity)**

对获得HBM 具有极大兴趣的领域之一是汽车。但仍有一些障碍需要克服，目前还没有解决这些障碍的时间表。

Synopsys产品营销总监 Brett Murdock 表示：“HBM3 具有高带宽、 [低功耗](https://zhida.zhihu.com/search?content_id=222282299&content_type=Article&match_order=1&q=%E4%BD%8E%E5%8A%9F%E8%80%97&zhida_source=entity) 和良好的密度”. “唯一的问题是它很贵。那是这个存储的一个诟病。HBM 的另一个缺点是它还没有资格用于汽车，尽管它非常适合汽车。在汽车领域，正在发生的一件有趣的事情是所有电子设备都在集中化。随着 [集中化](https://zhida.zhihu.com/search?content_id=222282299&content_type=Article&match_order=2&q=%E9%9B%86%E4%B8%AD%E5%8C%96&zhida_source=entity) 的发生，基本上现在你的主干中有一个服务器。发生的事情太多了，不一定总是发生在单个 SoC 或单个 ASIC 上。因此，现在汽车公司开始关注小芯片，以及他们如何在他们的设计中使用小芯片来获得他们在该集中域中所需的所有 [计算能力](https://zhida.zhihu.com/search?content_id=222282299&content_type=Article&match_order=1&q=%E8%AE%A1%E7%AE%97%E8%83%BD%E5%8A%9B&zhida_source=entity) 。巧妙的是，小芯片的潜在用途之一是使用中介层。如果他们现在使用 [interposer](https://zhida.zhihu.com/search?content_id=222282299&content_type=Article&match_order=1&q=interposer&zhida_source=entity) ，他们并没有解决 HBM 的interposer问题。他们正在解决小芯片的interposer问题，也许 HBM 会加入进来。然后，如果他们已经在为车辆进行小 [芯片设计](https://zhida.zhihu.com/search?content_id=222282299&content_type=Article&match_order=1&q=%E8%8A%AF%E7%89%87%E8%AE%BE%E8%AE%A1&zhida_source=entity) ，也许就不再那么昂贵了。”

HBM 非常适合那里，因为需要在车辆周围快速移动大量数据。“如果你想想汽车中的摄像头数量，所有这些摄像头的 [数据速率](https://zhida.zhihu.com/search?content_id=222282299&content_type=Article&match_order=1&q=%E6%95%B0%E6%8D%AE%E9%80%9F%E7%8E%87&zhida_source=entity) 和处理所有信息的速度都是天文数字。HBM 是所有 [汽车行业](https://zhida.zhihu.com/search?content_id=222282299&content_type=Article&match_order=1&q=%E6%B1%BD%E8%BD%A6%E8%A1%8C%E4%B8%9A&zhida_source=entity) 人士都想去的地方，” [默多克](https://zhida.zhihu.com/search?content_id=222282299&content_type=Article&match_order=1&q=%E9%BB%98%E5%A4%9A%E5%85%8B&zhida_source=entity) 说。“成本对他们来说可能并没有那么高，因为它只是整理技术，整理汽车中的中介层，以及整理 HBM 设备的汽车温度。

不过，这可能需要一段时间。与此同时，GDDR 似乎是一颗冉冉升起的新星。虽然它的吞吐量比 HBM 更有限，但对于许多应用来说仍然足够，并且已经通过汽车认证。

Rambus 的 Ferro 说：“HBM 绝对会进入汽车应用领域，在这些应用中，汽车会与不动的东西对话。” “但在车辆方面，GDDR 做得很好。LPDDR 已经在汽车中，您可以用 GDDR 替换多个 LPDDR，获得更小的占用空间和更高的带宽。然后，随着 AI 处理的提升，LPDDR5 和 LPDDR6 开始达到一些相当可观的速度 \[现在分别接近 8Gbps 和 10Gbps\]，它们也将成为汽车中非常可行的解决方案。仍然会有一些 DDR，但 LPDDR 和 GDDR 将成为汽车最喜欢的技术。”

根据 Cadence 的 Greenberg 的说法，这种方法可能会在相当长的一段时间内运作良好。“仅使用标准 PCB 和标准 [制造技术](https://zhida.zhihu.com/search?content_id=222282299&content_type=Article&match_order=1&q=%E5%88%B6%E9%80%A0%E6%8A%80%E6%9C%AF&zhida_source=entity) 的解决方案似乎比尝试在 [方程式](https://zhida.zhihu.com/search?content_id=222282299&content_type=Article&match_order=1&q=%E6%96%B9%E7%A8%8B%E5%BC%8F&zhida_source=entity) 中引入硅中介层并使其符合温度或振动或 10 年的要求更明智。寿命。与 GDDR-6 相比，在车辆中验证 HBM 解决方案似乎是一个更大的挑战，在 GDDR-6 中，您可以将内存放在 PCB 上。如果我在一家汽车公司负责一些汽车项目，我只会选择 HBM 作为最后的选择。”

**边缘 AI/ML 内存需要**

GDDR 和 LPDDR5，甚至可能是 LPDDR6，在一些边缘加速卡上也开始看起来像是可行的解决方案。

“对于进行边缘 AI 推理的 PCIe 卡，多年来我们已经在 NVIDIA 等公司的加速卡中看到了 GDDR，”Ferro 说。“现在我们看到越来越多的公司愿意考虑替代方案。例如，Achronix 正在其加速卡中使用 GDDR6，并开始研究如何使用 LPDDR，尽管其速度仍然只有 GDDR 的一半左右。它在爬升，它提供了更多的密度。这是另一种解决方案。这些给出了一个很好的权衡。它们提供了性能和成本优势，因为它们仍然使用传统的 PCB。您正在将它们焊接到die上。如果您过去使用过 DDR，则可以扔掉很多 DDR，并用一个 GDPR 或两个 LPDDR 替换它们。这就是我们现在看到的很多情况，因为开发人员试图弄清楚如何在成本、功率和价格之间取得适当的平衡。这始终是边缘的挑战。”

与往常一样，权衡是许多因素的平衡。

Greenberg 指出，在当前 AI 革命的早期阶段，第一批 HBM 存储器正在被使用。“人们正在采用一种成本是无目标/带宽是无目标的方法。HBM 很自然地融入其中，有人希望有一个典型的例子来说明他们可以从系统中获得多少 [带宽](https://zhida.zhihu.com/search?content_id=222282299&content_type=Article&match_order=8&q=%E5%B8%A6%E5%AE%BD&zhida_source=entity) 。他们会基于 HBM 构建一个芯片，根据他们对该芯片的性能指标获得 [风险投资](https://zhida.zhihu.com/search?content_id=222282299&content_type=Article&match_order=1&q=%E9%A3%8E%E9%99%A9%E6%8A%95%E8%B5%84&zhida_source=entity) 资金，而且没有人真的太担心这一切的成本。现在我们看到的是，也许您需要一些好的指标，也许是您可以使用 HBM 实现的 75%，但您希望它的成本降低一半。我们该怎么做？我们所看到的 GDDR 的吸引力在于它可以实现成本更低的解决方案，但带宽绝对接近 HBM 空间。”

默多克也看到了做出正确存储选择的困难。“对于高带宽要求，通常他们会做出成本权衡决定。我是否会去 HBM，如果不是因为成本因素，它通常非常适合该应用程序？我们有客户询问我们有关 HBM 的信息，试图在 HBM 和 LPDDR 之间做出选择。这确实是他们做出的选择，因为他们需要带宽。他们可以在这两个地方的任何一个地方得到它。我们已经看到工程团队在 SoC 周围放置了多达 16 个 LPDDR 接口实例，以满足他们的带宽需求。当你开始谈论那么多实例时，他们会说，'哦，哇，HBM 真的非常适合这个要求。但这仍然归结为成本，因为很多这些公司只是不想支付 HBM3 带来的溢价。”

HBM 还需要考虑架构方面的问题。“HBM 一开始就是一个多通道接口，因此使用 HBM，您可以在一个 HBM 堆栈上拥有 32 个 [伪通道](https://zhida.zhihu.com/search?content_id=222282299&content_type=Article&match_order=1&q=%E4%BC%AA%E9%80%9A%E9%81%93&zhida_source=entity) ，”Murdock 说。“有 16 个频道，所以实际上是 32 个伪频道。伪通道是您在每个伪通道的基础上执行实际工作负载的地方。因此，如果您在那里有 16 个伪通道，而不是如果您将大量不同的 LPDDR 实例放到您的 SoC 上，在这两种情况下，您都必须弄清楚您的流量将如何定位整个通道中的整体 [地址空间](https://zhida.zhihu.com/search?content_id=222282299&content_type=Article&match_order=1&q=%E5%9C%B0%E5%9D%80%E7%A9%BA%E9%97%B4&zhida_source=entity) 定义。在这两种情况下，你都有很多渠道，所以也许并没有太大的不同。”

对于 AI/机器学习开发人员，LPDDR 通常采用 bi-32 封装，然后具有 2-16 位通道。

“你可以在你的架构中做出一个基本的选择，”他解释道。“从系统的角度来看，我是否将内存上的这两个 16 位通道视为真正独立的通道？或者我是否将它们放在一起并使其看起来像一个 32 位通道？他们总是选择 16 位通道，因为这给了他们更高性能的接口。在内存中，我有两个频道。我有两倍的打开页面，我可能会从中点击并通过页面点击减少我的整体系统延迟。它使性能更好的系统拥有更多更小的通道，这就是我们在 HBM 上看到的情况。从 HBM2e 到 HBM3，我们非常明确地放弃了该通道和伪通道大小以应对此类市场。我们甚至在 DDR4 的 DDR5 中看到了这一点。

对于边缘 AI 推理，Greenberg 一直在观察这些应用走在前沿，并发现 GDDR-6 是一项很棒的技术。“有很多芯片都希望具有该功能。这使 AI 推理接近边缘，因此您可能会接收多个摄像头输入或多个其他 [传感器](https://zhida.zhihu.com/search?content_id=222282299&content_type=Article&match_order=1&q=%E4%BC%A0%E6%84%9F%E5%99%A8&zhida_source=entity) 输入。然后，在边缘使用人工智能，你可以深入了解你正在处理的数据，而不是将所有数据发送回服务器来执行该功能。”

Greenberg 预计很快就会有大量 [芯片](https://zhida.zhihu.com/search?content_id=222282299&content_type=Article&match_order=15&q=%E8%8A%AF%E7%89%87&zhida_source=entity) 问世，这些芯片将具有各种有趣的功能，而无需将大量数据发送回服务器。他希望 GDDR6 在那里发挥重要作用。

“前几代 GDDR 主要针对 [显卡](https://zhida.zhihu.com/search?content_id=222282299&content_type=Article&match_order=1&q=%E6%98%BE%E5%8D%A1&zhida_source=entity) ，”他说。“GDDR6 具有很多特性，使其更适合作为通用内存。事实上，虽然我们确实有用户将其用于显卡，但大多数人实际上将其用于 AI 边缘应用程序，”Greenberg 说。“如果您需要尽可能多的带宽，而且您不关心成本多少，那么 HBM 是很好的解决方案。但是，如果您不需要那么多的带宽，或者如果成本是一个问题，那么 GDDR6 在该领域发挥有利作用。GDDR6的优势在于可以在标准的FR4 PCB上完成。制造过程中不需要特殊材料。没有特殊工艺，甚至PCB本身也不需要背钻。它不需要有隐藏的 [过孔](https://zhida.zhihu.com/search?content_id=222282299&content_type=Article&match_order=1&q=%E8%BF%87%E5%AD%94&zhida_source=entity) 或类似的东西。”

最后，GDDR 领域的最后一个趋势是努力使 GDDR 对消费者更加友好。“它仍然有一些非常有利于 [图形引擎](https://zhida.zhihu.com/search?content_id=222282299&content_type=Article&match_order=1&q=%E5%9B%BE%E5%BD%A2%E5%BC%95%E6%93%8E&zhida_source=entity) 的规范部分，但作为一项技术，GDDR 正在朝着消费者的方向发展，”他说。“随着 GDDR 类技术的更广泛部署，它将继续朝着这个方向发展。”

来源： [半导体](https://zhida.zhihu.com/search?content_id=222282299&content_type=Article&match_order=1&q=%E5%8D%8A%E5%AF%BC%E4%BD%93&zhida_source=entity) 行业观察

链接： [晒科网](https://link.zhihu.com/?target=http%3A//www.shareteches.com/newweb/web/view.aspx%3Fid%3D40263)

发布于 2023-02-05 17:29・河南[漫画爱好者的Pro体验！掌阅Ocean5 Pro评测：对比Ocean4 Turbo 2025，手感、性能、显示、系统全面进化！](https://zhuanlan.zhihu.com/p/1956726064769368645)

[

如果说去年的 Ocean4 Turbo 2025 已经是掌阅在 7 英寸黑白墨水屏上的一次突破，那这次的 Ocean5 Pro，算得上是真正意义上的 “Pro 版升级”。我手里正好有两台白色版本...

](https://zhuanlan.zhihu.com/p/1956726064769368645)