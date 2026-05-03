---
title: "AI系统-13特斯拉AI芯片DOJO"
source: "https://zhuanlan.zhihu.com/p/2020454107224233463"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "谷歌造TPU为了其网络AI应用，那么特斯拉造NPU就是为了智能驾驶和机器人了，同样是美国巨无霸公司，谷歌用强大来形容，那特斯拉就是牛逼了。 我们来看GPU，其需要跟CPU配合使用，谷歌的TPU也差不多是，不够纯粹。GP…"
tags:
  - "clippings"
---
[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810)

1 人赞同了该文章

![](https://pica.zhimg.com/v2-4e57766c522915292aa5042d94d5fe12_1440w.jpg)

谷歌造 [TPU](https://zhida.zhihu.com/search?content_id=272035390&content_type=Article&match_order=1&q=TPU&zhida_source=entity) 为了其网络AI应用，那么特斯拉造 [NPU](https://zhida.zhihu.com/search?content_id=272035390&content_type=Article&match_order=1&q=NPU&zhida_source=entity) 就是为了智能驾驶和机器人了，同样是美国巨无霸公司，谷歌用强大来形容，那特斯拉就是牛逼了。

我们来看 [GPU](https://zhida.zhihu.com/search?content_id=272035390&content_type=Article&match_order=1&q=GPU&zhida_source=entity) ，其需要跟CPU配合使用，谷歌的TPU也差不多是，不够纯粹。GPU支持的运算比较通用，站在当前的时间点，AI的爆发就是 [LLM](https://zhida.zhihu.com/search?content_id=272035390&content_type=Article&match_order=1&q=LLM&zhida_source=entity) 大模型，运算需要 [Transformer算法](https://zhida.zhihu.com/search?content_id=272035390&content_type=Article&match_order=1&q=Transformer%E7%AE%97%E6%B3%95&zhida_source=entity) ，大的数据需要强大的芯片和算力，训练的模型越好，才能驾驭智能驾驶和机器人。那么特斯拉 [DOJO](https://zhida.zhihu.com/search?content_id=272035390&content_type=Article&match_order=1&q=DOJO&zhida_source=entity) 就是为大规模AI计算而生的，一切的的中心就围绕：提高计算吞吐量。

![](https://pic3.zhimg.com/v2-1d5dafa2c9fb1cd66c38e02ef19e3498_1440w.jpg)

另外一个要点就是第一性原理与打破桎梏，所有的创新直接基于 [台积电](https://zhida.zhihu.com/search?content_id=272035390&content_type=Article&match_order=1&q=%E5%8F%B0%E7%A7%AF%E7%94%B5&zhida_source=entity) 的制造工艺，硬件级别创新及封装技术，硬件上的IP都用开源的，软件上基本都是基于硬件直接自研的协议。别给特斯拉说业界通用标准框架，它只盯着 [晶体管](https://zhida.zhihu.com/search?content_id=272035390&content_type=Article&match_order=1&q=%E6%99%B6%E4%BD%93%E7%AE%A1&zhida_source=entity) 快点给我算出来结果，什么用着不顺手的直接改，什么闭源的东西就直接拿开源的怼。整个就是打破旧体系的革命。

## 1\. DOJO介绍

特斯拉打造自有芯片的原因是， **GPU 并不是专门为处理深度学习训练而设计的** ，这使得GPU在计算任务中的效率相对较低。特斯拉与 Dojo（Dojo既是训练模组的名称，又是内核架构名称） 的目标是“实现最佳的 AI 训练性能。启用 **更大、更复杂的神经网络模型** ，实现高能效且经济高效的计算。” 特斯拉的标准是制造一台比其他任何计算机都更擅长人工智能计算的计算机，从而他们将来不需要再使用 GPU。

构建超级计算机一个 **关键点** 是如何在扩展计算能力同时保持高带宽（困难）和低延迟（非常困难）。特斯拉给出的解决方案是强大的芯片和独特的网格结构组成的分布式 2D 架构（平面），或者说是 **数据流近存计算架构** 。

2023年9月，大摩调高了特斯拉的股价评级。除了特斯拉本身在AI技术的积累外，更主要得益于特斯拉 **强劲的自研AI芯片** 。这颗AI芯片，不是传统上的CPU，更不是GPU，是一种 **更适合复杂AI计算的形态** 。

![](https://pic4.zhimg.com/v2-d72d4d55ecb54673b50a055d55cfbb9b_1440w.jpg)

每354个Dojo核心组成一块D1芯片，而每25颗芯片组成一个训练模组。最后120个训练模组组成一组 [ExaPOD计算集群](https://zhida.zhihu.com/search?content_id=272035390&content_type=Article&match_order=1&q=ExaPOD%E8%AE%A1%E7%AE%97%E9%9B%86%E7%BE%A4&zhida_source=entity) ，共计3000颗D1芯片。

一个特斯拉Dojo芯片训练模组可以达到6组GPU服务器的性能，成本却少于单组GPU服务器。单台Dojo服务器算力甚至达到了 **54PFLOPS** 。只用 4 个 Dojo 机柜就能取代由 4000 颗 GPU 组成的 72 组 GPU 机架。Dojo 将通常需要几个月的AI计算（训练）工作减少到了1 周。这样的“ **大算力出奇迹** ”，与特斯拉自动驾驶的风格一脉相承。显然芯片也会大大加速特斯拉AI技术的进步速度。

## 2\. 提高带宽的疯狂

![](https://pic1.zhimg.com/v2-1e8e10f759639ab5d106a0e8b7ba431c_1440w.jpg)

进入 AI 时代，所有标榜 AI 性能的芯片厂商，都在追求带宽最大化。比如英伟达为自家 [A100 芯片](https://zhida.zhihu.com/search?content_id=272035390&content_type=Article&match_order=1&q=A100+%E8%8A%AF%E7%89%87&zhida_source=entity) 配备了 [HBM 超高带宽显存](https://zhida.zhihu.com/search?content_id=272035390&content_type=Article&match_order=1&q=HBM+%E8%B6%85%E9%AB%98%E5%B8%A6%E5%AE%BD%E6%98%BE%E5%AD%98&zhida_source=entity) ，并且通过高带宽桥接器 NV-Link 连接多个 A100。这也是特斯拉在 DOJO 正式使用之前选择英伟达的重要原因。

> 首先什么通信速度最快？  
> 那就是SoC内部的 [NoC总线](https://zhida.zhihu.com/search?content_id=272035390&content_type=Article&match_order=1&q=NoC%E6%80%BB%E7%BA%BF&zhida_source=entity) ，芯片内部的才快。

![](https://pica.zhimg.com/v2-3d2ee6e7f1cfb19fc5fd0c6b2405b114_1440w.jpg)

- 一个D1芯片有354个计算单元Core就是由NoC连起来的，其速度达到 **10TB** 。
- 5x5的D1之间通信通过 [SerDes 接口](https://zhida.zhihu.com/search?content_id=272035390&content_type=Article&match_order=1&q=SerDes+%E6%8E%A5%E5%8F%A3&zhida_source=entity) ，最快的传输速率达到了 112Gbps——而特斯拉在每一块 D1 芯片的四条边上， **都累计布置了 576 个 112Gb 带宽的 SerDes 接口。** 基于Die的自定义通信。
- Tile之间通过网卡通信，自研DIP通信协议

**D1 芯片内上下左右各 10TB 每秒→D1芯片间上下左右各 4TB 每秒→5x5 D1 芯片方阵各边 9TB 每秒→Tile 与 Tile 之间最高 36TB 每秒。**

![](https://pic3.zhimg.com/v2-56b86155b7be85f39c68ddebc507e9b6_1440w.jpg)

**每一块 Tile 上面都封装着 25 块 D1 芯片，总算力高达 9PFLOPS，芯片四周扩散出每边 9TB 每秒的超高速通信接口，然后上下则分别连接着水冷散热，以及供电模块。**

## 3\. DOJO架构

### 3.1 设计哲学

Dojo核心是一个8路译码的内核，具有较高吞吐量和4路矩阵计算单元（8x8）以及 1.25 MB 的本地 SRAM。但是Dojo核心的尺寸却不大，相比之下，富士通的A64FX在同一工艺节点上占据的面积是其 **两倍以上** 。

通过Dojo核心的结构，我们可以看出特斯拉在通用AI处理器上的设计哲学：

1. **面积精简**  
	：特斯拉通过将大量计算内核集成到芯片中，以最大限度提高AI计算的吞吐量，因此需要在保障算力的情况下使单个内核的面积尽可能小，更好的折衷超算系统中算力堆叠和延迟的矛盾。
2. **缓存与延迟精简**  
	：为了实现其区域计算效率最大化，Dojo内核以相对保守的 2 GHz 运行（保守时钟电路往往占用较少的面积），只使用基本的分支预测器和小的指令缓存，在如此精简只保留必要部件的架构下。其余面积尽可能留给向量计算和矩阵计算单元。当然，如果内核程序的代码占用量很大，或分支较多时，这种策略可能会牺牲一些性能。
3. **功能精简**  
	：通过削减对运行内部计算不是必须的处理器功能来进一步减少功耗和面积使用。Dojo核心不进行数据端缓存，不支持虚拟内存，也不支持精确异常。

对于特斯拉和马斯克而言，Dojo不仅仅形状布局像道场，其设计哲学也与道场的精神息息相关，充分体现了“ **少即是多** ”的 **处理器设计美学** 。

### 3.2 DOJO核

![](https://pic4.zhimg.com/v2-68731fa7c5ebd1226abf46cdf6a60705_1440w.jpg)

每个Dojo核心是带有向量计算/矩阵计算能力的处理器，具有完整的取指、译码、执行部件。Dojo核心具有类似CPU的 风格，似乎比GPU 更能适应不同的算法和分支代码。D1的指令集 **类似于 [RISC-V](https://zhida.zhihu.com/search?content_id=272035390&content_type=Article&match_order=1&q=RISC-V&zhida_source=entity)** ，处理器运行在2GHz，具有4组8x8矩阵乘法计算单元。同时具有一组自定义向量指令， **专注于加速AI计算** 。

Dojo核心由前端、执行单元、SRAM和NoC路由4部分组成，比CPU和GPU的控制部件都更少，具有类似CPU的AGU和思路类似GPU张量核心（Tensor core）的 **矩阵计算单元** 。

64 位处理器，具有 32B 取指窗口 （ fetch window），最多可容纳 8 条指令； 8路解码器每个周期可以 处理两个线程。从提取缓冲区中， Core 中解码器每个周期可以处理两 个线程的 8条指令。 • DOJO 将解码器分成两个，并选择 两个线程在每个循环中为其提供数 据，会减少所采用分支的解码吞吐 量损失。在解码时，某些指令 （branches, predicated operations等） 可以在前端执行并从pipeline中删除。

Dojo核心结构精简，没有Rename这些改善执行部件利用率的组件，同时也难于支持虚拟内存。但这样设计的好处是减少了控制部分占用的面积，可以把芯片上更多的面积划分给计算执行单元。每个Dojo核心提供了1.024TFLOPS的算力。可以看到，每个几乎所有的算力都由矩阵计算单元提供。因而矩阵计算单元和SRAM共同决定了D1处理器的计算能效比。

1. **分支预测**  
	：相对GPU这类SIMT架构，Dojo核心也没有SIMT堆栈核心来进行多线程分支任务的分配。但Dojo核心具有 BTB（分支目标缓冲区），因此D1可以通过 **简单的分支预测** 来提升性能。BTB将分支成功的分支指令的地址和它的分支目标地址都放到一个缓冲区中保存起来，缓冲区以分支指令的地址作为标识。可以通过预测分支的路径和缓存分支使用的信息来减少流水线处理器中分支的性能损失。
2. **指令缓存**  
	： **较小** 的L1指令缓存直接与核心中的SRAM相连获取计算指令。
3. **取指**  
	：每个Dojo内核具有 32 B 的取指窗口，最多可容纳 8 条指令。
4. **译码**  
	：一个8路解码器每个周期可以处理两个线程。译码阶段从取指缓冲获取指令并译码，并根据每条指令的要求分配必要的执行资源。
5. **线程调度**  
	：在较宽的8路译码之后，则是向量的调度器（Scheduler）和寄存器堆（Register File）。貌似这里没有分支聚合的掩码判断，实际的分支执行效率可能会比GPU略低。希望特斯拉有一个强大的编译器吧。
6. **执行单元**  
	：具有2路ALU和2路AGU，以及针对向量/矩阵计算的512位SIMD和矩阵计算单元（分别执行512位向量计算和4路8x8矩阵乘法）。其中矩阵计算单元是D1芯片的 **算力主体** 。（在下一节具体介绍）
7. **ALU和AGU**  
	主要负责矩阵计算之外的少量逻辑计算。其中AGU是 **地址生成单元** ，主要用于生成操作SRAM所需的地址和访问其他核心的地址。通过由与 CPU 的其余部分并行运行地址计算。普通CPU 在执行各种操作时，需要计算从内存（或SRAM）中取数据所需的内存地址。例如，必须先计算数组元素的内存位置，然后 CPU内核才能从实际内存位置获取数据。这些地址生成计算涉及不同的整数算术运算，例如加法、减法、模运算或位移。计算内存地址可以编译多个通用机器指令，也可以类似特斯拉Dojo这样通过AGU的硬件电路直接执行。这样各种地址生成计算可以从ALU卸载，减少执行AI计算所需等待的CPU 周期数，从而 **提高计算性能** 。
8. **SIMD**  
	主要负责激活等特殊功能计算和数据的累加。
9. **矩阵计算单元**  
	是Dojo的主要算力原件，负责二维矩阵计算，进而实现卷积、Transformer等计算。

Dojo架构算力增强的核心是 **矩阵计算单元** 。矩阵计算单元与核心SRAM的数据交互构成了主要的 **内核数据搬运功耗** 。

特斯拉矩阵计算单元相应的专利如下图。该模块关键部件是一个8x8矩阵-矩阵乘法单元（图中称为矩阵计算器）。输入为数据输入阵列和权重输入阵列，计算矩阵乘法后直接在输出进行累加。每个Dojo核心包括4路8x8矩阵乘法单元。

![](https://pic1.zhimg.com/v2-5b3a263ac99afe64e67f6641ac2d8690_1440w.jpg)

特斯拉矩阵计算单元专利

由于架构图上只有一个L1 缓存和SRAM，大胆猜测特斯拉 **精简** 了RISC-V的缓存结构，目的是节约缓存面积并减少延迟。每个核心1.25MB的SRAM块可以为SIMD和矩阵计算单元提供2x512位的读（对应AI计算的权重和数据）和512位的写带宽，以及面向整数寄存器堆的64位读写能力。计算的 **主要数据流** 是从SRAM到SIMD和矩阵乘法单元。

矩阵计算单元的主要处理流程为：

1. 通过多路选择器（Mux）从SRAM中 **加载** 权重到权重输入阵列（Weight input array），同时SRAM中 **加载** 数据到数据输入阵列（Data input array）。
2. 输入的数据与权重在矩阵计算器（Matrix computation Unit）中进行 **乘法计算** （内积或外积？）
3. 乘法计算结果输出到输出累加（Output accumulator）中进行 **累加** 。这里计算时可以通过矩阵划分拼接的方式进行超过8x8的矩阵计算。
4. 累加后的输出传入后处理器寄存器堆进行 **缓存** ，随后进行 **后处理** （可执行例如激活、池化、Padding等操作）。
5. 整个计算流程由控制单元（Control unit）直接控制，无需CPU干预。
![](https://pica.zhimg.com/v2-135712f69a42c1b0e8768716036f0f70_1440w.jpg)

DOJO Core 由前端、执行引擎、SRAM 和 NoC 路由4部分组成，比CPU和GPU的控制部件都更 少，具有类似CPU的AGU和类似GPU Tensor core 的矩阵计算单元。下面进行介绍：

### 前端

![](https://pica.zhimg.com/v2-d0cae1b1f29bf7ceccd193be22d0c388_1440w.jpg)

执行单元与SRAM/NoC的数据交互

Dojo核心内的SRAM具有非常大的读写带宽，可以以 400 GB/秒的速度加载并以 270 GB/秒的速度写入。Dojo核心指令集具有专用的网络传输指令，通过NoC路由，可以直接将数据移入或移出 D1 芯片中甚至Dojo训练模块中其他内核的SRAM 存储器。

与普通的SRAM不同，Dojo的SRAM包括列表解析引擎（list parser engine）和一个收集引擎（gather engine）。列表解析功能是 D1芯片的关键特性之一，通过列表解析引擎可以将复杂的不同数据类型的传输序列进行打包，提升传输效率。

![](https://picx.zhimg.com/v2-d77c07e80199ab95a6f7a664a70fed89_1440w.jpg)

列表解析功能

为了进一步减少操作延迟、面积和复杂度，D1 并不支持虚拟内存。在通常的处理器中，程序使用的内存地址不是直接访问物理内存地址，而是由 CPU 使用操作系统设置的分页结构转换为物理地址。

在 D1内核中， 4 路 SMT 功能让计算具备显式并行性，简化 AGU 和寻址计算方式，以让特斯拉以足够低的延迟访问 SRAM，其优势是可避免中间L1 数据缓存的延迟。

### 执行引擎

![](https://picx.zhimg.com/v2-7d71510811be264149ed97b3d0cb271b_1440w.jpg)

- 执行单元：2 路 ALU 和 2 路 AGU，以及 针对向量 /矩阵计算的 512 位 SIMD 和矩 阵计算单元，其中矩阵计算单元是 D1 芯 片的算力主体 。
- ALU 和 AGU ：负责矩阵计算外少量逻辑 计算。AGU 地址生成单元，用于生成操作SRAM所需的地址和访问其他核心的地 址。通过由与 CPU 其余部分并行运行地 址计算。
- SIMD ：负责激活等特殊功能计算和数据 的累加。
- 矩阵计算单元：DOJO 主要算力，负责二 维矩阵计算，实现Conv 、Transformer 等 计算。
- DOJO 向量和矩阵执行，放置在标量 执行引擎之后，并且有两个执行 Pipel ine 。一个 Pipeline 可以执行 512 bit 向量计算，另一个 Pipeline 执行 8x8x 4 矩阵乘。
- 前端 feeds into 一个四宽标量调度器 （four-wide scalar schedule），该调度 器具有四路 SMT，2 个整数单元、2 个地址单元和 1 个用于线程的寄存器 文件。还有一个带有 4 路 SMT 的向 量调度器，数据收集引擎送入一个 64 B 宽 SIMD 单元或四个 8x8x4 矩阵乘 法单元。
- DOJO Core 架构算力增强的核心 是矩阵计算单元。矩阵计算单元与 核心 SRAM 的数据交互构成了主要 的内核数据搬运功耗。
- 内核的 4 路 SMT 功能更多的是 让单个应用程序公开显式并行 性，而不是提高多任务处理性 能。例如，一个线程可以执行 向量计算，而另一个线程将数 据从系统内存异步加载到 SRAM （通过 DMA）。

### SRAM的分析

- 每个节点 1.25MB SRAM，将内存与计算 共置，以最大限度地减少数据传输（Me mory Bound）。
- D1 上运行的代码不能直接访问系统内存， 应用程序主要在本地 SRAM 中工作；如果 需要来自主存（DDR 或 HBM）的数据， 须使用 DMA 操作进行读入。
- 通过列表解析引擎可以将复杂的不同数据 类型的传输序列进行打包，提升传输效率。
- 为了保持低延迟，SRAM 设计为非缓存， 跳过一级缓存节省芯片面积和功耗，不需 要与数据一起存储的标记和状态位。 SRAM 前面也没有 L1D 缓存。 • 为了进一步减少延迟、面积和核心复杂性， DOJO 没有虚拟内存支持。因此，没有 TLB 或页面遍历机制（page walk mechanisms）。 • DOJO 只用 21 个地址位寻址 SRAM，简化 DOJO 的 AGU 和寻址总线，以避免在其 前面实现单独的 L1 数据缓存。

### NOC Router

计算单元与 SRAM/NoC 数据交互

- SRAM 具有大读写带宽，以 400 GB/s 速 度加载并以 270 GB/s 速度写入。DOJO Core 内部指令集具有专用的网络传输指 令，通过 NoC 路由，可以直接将数据移 入或移出其他 Core SRAM 存储器。
- 嵌入在该 SRAM 中的是一个列表解析器 引擎（list parser engine），该引擎馈入 解码器对和一个收集引擎（gather engin e），馈入向量寄存器文件，可以将信息 发送到其他节点或从其他节点获取信息。
- DOJO D1 不会在 DDR 和 PCIe 控 制器上花费空间。大部分裸片都被 大量 Dojo 核心占据，除了外部设 计用于与相邻裸片接口的定制 IO 连接器。 • DOJO 不会尝试跨内核保持缓存一 致性，并且不会将任何 SRAM 用于 窥探过滤。

每个节点都连接到一个2D网格

### 3.3 Dojo指令集

D1参考了RISC-V 架构的指令，并且 **自定义了一些指令** ，特别是矢量计算相关的指令。

D1指令集支持 64 位标量指令和 64字节 SIMD 指令，网络传输与同步原语和机器学习/深度学习相关的专用原语（例如8x8矩阵计算）。

在网络数据传输和同步原语方面，支持从本地存储（SRAM）到远程存储传输数据的指令原语（Primitives），以及信号量（Semaphore）和屏障约束（ Barrier constraints）。这可以使D1支持多线程，其存储操作指令可以在多个 D1 内核中运行。

针对机器学习和深度学习，特斯拉定义了包括 shuffle、transpose 和 convert 等数学操作的指令，以及随机舍入（ stochastic rounding ），padding相关的指令。

### 3.4 D1芯片

![](https://pic3.zhimg.com/v2-acc144b8aee1d1a24c8dce32d00e2a96_1440w.jpg)

每个Dojo核心有一块1.25MB的SRAM作为主要的权重和数据存储。不同的Dojo核心通过片上网络路由（NoC路由）进行连接，不同的Dojo内核通过复杂的 **NoC网络进行数据同步** ，而 **不是共享数据缓存** 。NoC 可以处理跨节点边界4个方向（东南西北）的 8 个数据包，每个方向 64 B/每个时钟周期，即在所有四个方向上一个数据包输入和一个数据包输出到网格中每个相邻的Dojo核心。该NoC路由还可以在每个周期对核心内的 SRAM 进行一次 64 B 双向读写。

![](https://pic2.zhimg.com/v2-b8f3d5466a45474fe51c2b6d46441e15_1440w.jpg)

跨处理器传输和D1处理器内部的任务划分

每个Dojo核心都是一个相对完整的带矩阵计算能力的类CPU（由于每个核心具备单独的矩阵计算单元，且前端相对较小，所以这里称为类CPU）其数据流架构则有点类似于 [SambaNova](https://zhida.zhihu.com/search?content_id=272035390&content_type=Article&match_order=1&q=SambaNova&zhida_source=entity) 的二维数据流网格结构，数据直接在各个处理核心之间流转，无需回到内存。

D1芯片运行在2GHz，拥有巨大的440MB SRAM。特斯拉将设计重心放在计算网格中的分布式SRAM，通过大量更快更近的片上存储和片上存储之间的流转减少对内存的访问频度，来提升整个系统的性能，具有明显的 **数据流存算一体架构** （数据流近存计算）特征。

每颗D1 芯片有 576 个双向 SerDes 通道，分布在四周，可连接到其他 D1 芯片，单边带宽为 4 TB/秒。

D1处理器芯片主要参数

![](https://picx.zhimg.com/v2-0988f15596552d16cc799c3adb2c376d_1440w.jpg)

### 3.5 Tile的Chiplet封装

![](https://pic4.zhimg.com/v2-a16d0d8929297763bb1c6aa0443fcae3_1440w.jpg)

每个D1训练模块由5x5的 D1芯片阵列排布而成，以二维Mesh结构互连。片上跨内核SRAM达到惊人的11GB，当然耗电量也达到了15kW的惊人指标。能效比为0.6TFLOPS/W@BF16/CFP8。（希望是我算错了，否则这个能效比确实不是太理想）。外部32GB共享HBM内存。（HBM2e或HBM3）

![](https://pica.zhimg.com/v2-23373432d9181ce3fb9cb49cb5ec1144_1440w.jpg)

系统内存中，DOJO 芯片并不直接连接到 内存。相反，其连接到配备 HBM DIP 上。 这些接口处理器还负责与主机系统通信。

系统内存可以跨Tile 边界从每个芯片边缘 传输 900 GB/s，这意味着可以以 4.5 TB/s 的链路带宽访问接口处理器及其 HBM。

![](https://pic1.zhimg.com/v2-d2eb3a44943073cf469c0a485603149a_1440w.jpg)

单个 DOJO 芯片不能自给自足，它没有 DDR 或 PCIe 控制器。因此在 die 边缘周围有 IO 接口，可以让 die 与相邻的 die 进行通信，延迟约为 100 ns。

理论上，最小的功能性 DOJO 部署将涉及一个 DOJO D1、一个接口处理器卡和一个主机系统。但特斯拉 将 DOJO die 部署在每个包含 25 个 die 模块中；DOJO D1 die 专门设计用于超级计算机的构建块。

### 3.6 训练模组

单个：

![](https://pic3.zhimg.com/v2-7afa323543c56e265ec06c2f97edb188_1440w.jpg)

组合：

![](https://pic1.zhimg.com/v2-e20db90549f8fb86414d19de23a6e90a_1440w.jpg)

外表；

![](https://pic2.zhimg.com/v2-f6e1c77289cd56546299416f601ebdcb_1440w.jpg)

机柜：

![](https://pic2.zhimg.com/v2-48d72817261d93e1cc3141f5eed64c27_1440w.jpg)

训练模组在封装上采用 **InFO\_SoW** （Silicon on Wafer）封装来提高芯片间的互连密度。该封装除了TSMC的INFO\_SoW技术之外，也采用了 **特斯拉自己的机械封装结构** ，以减小处理器模组的失效。

每个训练模块外部边缘的 40 个 I/O 芯片达到了 36 TB/s的聚合带宽，或者10TB/s的横跨带宽。每层训练模块都连接着超高速存储系统：640GB 运行内存可以提供超过 18TB/s的带宽，另外还有超过 1TB/s的网络交换带宽。

数据传输方向与芯片平面 **平行** ，供电及液冷方向与芯片平面垂直。这是一个 **非常优美** 的结构设计，不同的训练模块之间还可以互连。通过立体结构，节约了芯片模组的供电面积，尽可能减少计算芯片间的距离。

一个 Dojo POD 机柜由两层计算托盘和存储系统组成。每一层托盘都有 6 个 D1 训练模组。两层共 12个训练模组组成的一个机柜，可提供 108PFLOPS 的深度学习算力。

组网：

![](https://pic3.zhimg.com/v2-9ea3abdb31830f8cce4b6636f413dbb6_1440w.jpg)

### 3.7 电源与散热

超算平台的 **散热** ，一直是衡量超算系统水平的重要维度。

D1 芯片的 **热设计功率** (TDP) 为 400 W。将 25 颗 D1 芯片紧密封装成为一个训练模组，仅处理器TDP就可能高达 10 kW。在如此之高密度的计算芯片矩阵环境下，综合考虑散热和电力传输，特斯拉需要为D1芯片提供全新的方案。

特斯拉在 Dojo POD 上使用了全自研的 VRM（电压调节模组），单个 VRM可以在不足 25 美分硬币面积的电路上，提供52V电压和超过 1000A 的巨大电流，电流目的为0.86A每平方毫米，共计12个独立供电相位。

![](https://pic4.zhimg.com/v2-61426ede63a72936f14d10dc69104b4b_1440w.jpg)

特斯拉的电源调节模组

对高密度芯片散热而言，其重点是控制 **热膨胀系数** （CTE）。Dojo系统的芯片密度极高，如果CTE稍微失控，都可能导致结构变形/失效，进而出现连接故障。

特斯拉这套自研 VRM 在过去2年内迭代了 14 个版本，采用了\*\*MEMS振荡器\*\*（MO）来感知电源调节模组的热形变，最终才完全符合内部对 CTE 指标的要求。这种通过MEMS技术主动调节电源功率的方式，与控制火箭箭身振动的主动调节方式类似。

特斯拉D1处理器的散热结构专利

特斯拉使用了专用的电源调节模块（VRM）和散热结构来进行功耗管理。在这里功耗管理的主要目的有2个：

1. 减少不必要的功耗损失，提升能效比。
2. 减少散热形变造成的处理器模组失效。

根据特斯拉的专利，我们可以看到电源调节模块与芯片本身垂直，极大的减少了对处理器平面的 **面积占用** ，且可以通过 **液冷** 来迅速平衡处理器的温度。

![](https://picx.zhimg.com/v2-669425eed8250804f328bde22feaa00f_1440w.jpg)

## 4\. Dojo架构处理器的编译生态

![](https://pic1.zhimg.com/v2-ca0efcbd6a82613078e8b630020e5818_1440w.jpg)

对于D1这类AI芯片来说，编译生态的重要性不低于芯片本身。

在D1处理器平面上，D1被划分为矩阵式的计算单元。编译工具链负责任务的划分和配置数据存储，并且通过多种方式进行细粒度的并行计算，并减少存储占用。

Dojo编译器支持的并行方式包括数据并行、模型并行和图并行。支持的存储分配方式包括分布式张量、重算分配和分割填充。

编译器本身可以处理各种CPU中常用的动态控制流，包括循环和图优化算法。借助Dojo编译器，用户可将Dojo大型分布式系统视作一个加速器进行整体设计和训练。

整个软件生态的顶层基于PyTorch，底层基于Dojo驱动，中间使用Dojo编译器和LLVM形成编译层。这里加入LLVM后，可以使特斯拉更好的利用LLVM上已有的各种编译生态进行编译优化。

![](https://pic1.zhimg.com/v2-edd8ca11648155ebb6c65fa6b3867a7c_1440w.jpg)

特斯拉Dojo 编译器

参考：

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位有自己公众号的留言： **申请转载** ！

纯干货持续更新，欢迎 **分享给朋友** 、 **点赞、收藏、在看、划线和评论交流** ！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

编辑于 2026-03-26 10:59・上海[嵌入式要卷成下一个Java了吗？](https://zhuanlan.zhihu.com/p/671200301)

[

嵌入式目前作为未来发展的大方向，目前确实是炙手可热，但说要卷成下一个java，还远远不够。 众所周知，前几年IT行...

](https://zhuanlan.zhihu.com/p/671200301)