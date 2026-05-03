---
title: "AI系统-10AI芯片介绍2"
source: "https://zhuanlan.zhihu.com/p/2020452254172328746"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "之前的文章 AI系统-8AI芯片介绍1主要从算法角度来说明AI芯片的需求，本文更加的科普，从实际产品的角度介绍GPU、NPU和异构计算。1. GPU介绍 GPU 是 Graphics Processing Unit（图形处理器）的简称，它是计算机系统…"
tags:
  - "clippings"
---
[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810)

1 人赞同了该文章

![](https://pica.zhimg.com/v2-9ffb54cce21f0e32c09f28ce691d57b4_1440w.jpg)

之前的文章 [AI系统-8AI芯片介绍1](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247487066%26idx%3D1%26sn%3D83600d4698e187a759d8e7f91a5b5e11%26scene%3D21%23wechat_redirect) 主要从算法角度来说明AI芯片的需求，本文更加的科普，从实际产品的角度介绍 [GPU](https://zhida.zhihu.com/search?content_id=272034760&content_type=Article&match_order=1&q=GPU&zhida_source=entity) 、 [NPU](https://zhida.zhihu.com/search?content_id=272034760&content_type=Article&match_order=1&q=NPU&zhida_source=entity) 和 [异构计算](https://zhida.zhihu.com/search?content_id=272034760&content_type=Article&match_order=1&q=%E5%BC%82%E6%9E%84%E8%AE%A1%E7%AE%97&zhida_source=entity) 。

## 1\. GPU介绍

![](https://pic1.zhimg.com/v2-6154986109951909d01d04c537411c9a_1440w.jpg)

GPU 是 Graphics Processing Unit（图形处理器）的简称，它是计算机系统中负责处理图形和图像相关任务的核心组件。GPU 的发展历史可以追溯到对计算机图形处理需求的不断增长，以及对图像渲染速度和质量的不断追求。从最初的简单图形处理功能到如今的高性能计算和深度学习加速器，GPU 经历了一系列重要的技术突破和发展转折。

- 第一代GPU：进行2D 3D图形加速
- 第二代GPU：并行处理能力增强，计算能力赶上了CPU
- 第三代GPU：支持 [CUDA](https://zhida.zhihu.com/search?content_id=272034760&content_type=Article&match_order=1&q=CUDA&zhida_source=entity) 编程，方便编程使用。这一举措打破了 GPU 仅限于图形语言的局限，将 GPU 变成了真正的并行数据处理超级加速器。

2008 年，苹果公司推出了一个通用的并行计算编程平台 OpenCL（Open Computing Language）。与 CUDA 不同，OpenCL 并不与特定的硬件绑定，而是与具体的计算设备无关，这使得它迅速成为移动端 GPU 的编程环境业界标准。OpenCL 的出现进一步推动了 GPU 在各种应用领域的普及和应用，为广大开发者提供了更广阔的创新空间。

![](https://pic3.zhimg.com/v2-a2867b76c0ce87a2404a55cd5761daec_1440w.jpg)

GPU 和 CPU 在架构方面的主要区别包括以下几点：

1. **并行处理能力** ：CPU 拥有少量的强大计算单元（ALU），更适合处理顺序执行的任务，可以在很少的时钟周期内完成算术运算，时钟周期的频率很高，复杂的控制逻辑单元（Control）可以在程序有多个分支的情况下提供分支预测能力，因此 CPU 擅长逻辑控制和串行计算，流水线技术通过多个部件并行工作来缩短程序执行时间。GPU 控制单元可以把多个访问合并成，采用了数量众多的计算单元（ALU）和线程（Thread），大量的 ALU 可以实现非常大的计算吞吐量，超配的线程可以很好地平衡内存延时问题，因此可以同时处理多个任务，专注于大规模高度并行的计算任务。
2. **内存架构** ：CPU 被缓存 Cache 占据了大量空间，大量缓存可以保存之后可能需要访问的数据，可以降低延时； GPU 缓存很少且为线程（Thread）服务，如果很多线程需要访问一个相同的数据，缓存会合并这些访问之后再去访问 DRAM，获取数据之后由 Cache 分发到数据对应的线程。GPU 更多的寄存器可以支持大量 Thread。
3. **指令集** ：CPU 的指令集更加通用，适合执行各种类型的任务； GPU 的指令集主要用于图形处理和通用计算，如 CUDA 和 OpenCL。
4. **功耗和散热** ：CPU 的功耗相对较低，散热要求也相对较低；由于 GPU 的高度并行特性，其功耗通常较高，需要更好的散热系统来保持稳定运行。

因此，CPU 更适合处理顺序执行的任务，如操作系统、数据分析等；而 GPU 适合处理需要计算密集型 (Compute-intensive) 程序和大规模并行计算的任务，如图形处理、深度学习等。在异构系统中，GPU 和 CPU 经常会结合使用，以发挥各自的优势。

新兴的AI领域，目前来说GPU还是扮演着重要的位置，可以说其促进了AI的发展。

## 2\. NPU介绍

随着 AI 技术的飞速发展，AI 专用处理器如 NPU（Neural Processing Unit）和 [TPU](https://zhida.zhihu.com/search?content_id=272034760&content_type=Article&match_order=1&q=TPU&zhida_source=entity) （Tensor Processing Unit）也应运而生。这些处理器旨在加速深度学习和机器学习任务，相比传统的 CPU 和 GPU，它们在处理 AI 任务时表现出更高的效率和性能。

> AI 芯片是专门为加速 AI 应用中的大量针对矩阵计算任务而设计的处理器或计算模块。AI 芯片采用针对特定领域优化的体系结构（Domain-Specific Architecture，DSA），侧重于提升执行 AI 算法所需的专用计算性能。

![](https://pic4.zhimg.com/v2-501bfaa91ea6e7112bdbb5ade9b8cfd9_1440w.jpg)

DSA对特定领域优化，对于AI就是大量的MAC矩阵乘加运算，首先需要多个PE并行计算，取计算数据也要快，那么DDR和SRAM要围绕其周围存放。

## 2.1 AI芯片发展

AI 专用处理器的发展可以追溯到 2016 年，谷歌推出了第一代 TPU，采用了独特的 TPU 核心脉动阵列设计，专门用于加速 TensorFlow 框架下的机器学习任务。此后，谷歌又陆续推出了多个 TPU 系列产品，不断优化其架构和性能。

华为也紧随其后，推出了自己的 AI 专用处理器—— [昇腾 NPU](https://zhida.zhihu.com/search?content_id=272034760&content_type=Article&match_order=1&q=%E6%98%87%E8%85%BE+NPU&zhida_source=entity) 。昇腾 NPU 采用了创新的 [达芬奇架构](https://zhida.zhihu.com/search?content_id=272034760&content_type=Article&match_order=1&q=%E8%BE%BE%E8%8A%AC%E5%A5%87%E6%9E%B6%E6%9E%84&zhida_source=entity) ，集成了大量的 AI 核心，可以高效地处理各种 AI 任务。华为还推出了多款搭载昇腾 NPU 的产品，如华为 Mate 系列手机和 Atlas 服务器等。

特斯拉作为一家以电动汽车和自动驾驶技术闻名的公司，也推出了自己的 AI 芯片—— [DOJO](https://zhida.zhihu.com/search?content_id=272034760&content_type=Article&match_order=1&q=DOJO&zhida_source=entity) 。DOJO 采用了独特的架构设计，旨在加速自动驾驶系统的训练和推理任务。

除了上述几家巨头外，国内外还有许多其他公司也在积极布局 AI 芯片领域，如寒武纪的 MLU 系列、地平线的征程系列等。这些 AI 芯片在架构设计、性能表现、应用场景等方面各有特点，为 AI 技术的发展提供了强有力的硬件支持。

## 2.2 AI芯片设计要点

算力、存储、传输、功耗、散热、精度、灵活性、可扩展性、成本，九大要素构筑起训练阶段 AI 芯片的“金字塔”：

1. 算力为基，强大的并行计算能力是训练模型的根基，支撑着复杂模型的构建与优化。
2. 高带宽存储器访问则如高速公路般畅通无阻，保证数据高效流动。
3. 灵活的数据传输能力则是穿针引线的关键，使模型训练过程更加顺畅。
4. 功耗与散热如影随形，高性能计算往往伴随着高热量产生。因此，低功耗、良好的散热设计至关重要，
5. 避免过热导致性能下降甚至芯片损坏。
6. 精度至上，训练阶段要求芯片具备高精度计算能力，确保模型参数的准确无误，为模型训练奠定坚实基础。
7. 灵活为王，训练芯片需要兼容各类模型和算法，适应不断发展的 AI 技术，展现游刃有余的适应能力。
8. 可扩展性则是未来之光，面对日益庞大的模型和数据集，芯片需具备强大的扩展能力，满足不断增长的计算需求。
9. 成本考量亦不可忽视，高昂的价格可能会限制芯片的应用范围，因此合理的价格策略也是芯片赢得市场的重要因素。

另外对于推理芯片更加注意功耗、成本和实时性。相较于训练芯片在“幕后”的默默付出，推理芯片则站在了 AI 应用的前沿，将训练好的模型转化为现实世界的智能服务。如果说训练芯片是 AI 技术的发动机，那么推理芯片就是将这股力量输送到应用场景的传动装置。

> 对于AI应用来说主要就是训练芯片，但是对于终端的嵌入式设备则需要更多的推理芯片。目前训练芯片基本被英伟达垄断，但是推理芯片可能是应用方面比较窄，外国大公司可能看不上。但是苍蝇小也是肉，这块在国内比较热门，智能手机、智能家居、自动驾驶等领域，都对推理芯片有着巨大的需求。

![](https://picx.zhimg.com/v2-79226651b7205e91ec2c8be0705d6da5_1440w.jpg)

- 对于GPU一方面是其是通用计算芯片，里面的支持的算子和数量分布是通用的，针对特殊的某类应用，可能利用效率不足，不够灵活。另外其需要跟CPU配合完成任务，使用的数据还是围绕CPU，需要从CPU的内存中拿数据，受CPU的控制，并不是完全独立，这点影响了其运行速度。
- [FPGA](https://zhida.zhihu.com/search?content_id=272034760&content_type=Article&match_order=1&q=FPGA&zhida_source=entity) 可以编程比较灵活，是典型的软件硬化的好技术，不过其成本太高且共功耗大。并不能大规模应用。
- 科技巨头都在开发自己的 AI 专用 [ASIC](https://zhida.zhihu.com/search?content_id=272034760&content_type=Article&match_order=1&q=ASIC&zhida_source=entity) ，如谷歌的 TPU、华为的昇腾 Ascend NPU 系列等。与 GPU 和 FPGA 相比，ASIC 可以在计算速度、功耗、成本等方面做到更加极致的优化。ASIC 的设计周期较长，前期投入大，灵活性也较差。此外，ASIC 芯片通常需要配合专门的软件栈和开发工具，生态系统的建设也是一大挑战。

## 3\. 异构计算

传统的芯片厂商例如Intel是要卖产品的，但是其产品可能针对某种计算比较擅长，并且上面只有CPU，需要一个大板卡。然后就出现了 [SoC](https://zhida.zhihu.com/search?content_id=272034760&content_type=Article&match_order=1&q=SoC&zhida_source=entity) ，可以把尽可能的外围器件跟CPU一块集成到芯片上，SoC能出来也是因为IP授权，公司不必自己去完全设计芯片，只用买IP集成到一块就可以造自己的芯片了，门槛降低了，这集中的代表就是ARM。但是又出现了 [RISC-V](https://zhida.zhihu.com/search?content_id=272034760&content_type=Article&match_order=1&q=RISC-V&zhida_source=entity) 等IP，且擅长的东西各不一样，传统单一架构难以满足日益增长的计算需求。异构计算，犹如打破计算藩篱的利器，通过整合不同类型计算单元的优势，为计算难题提供全新的解决方案。

特斯拉 HW3 FSD 芯片（如下图），我们可以看到其单一芯片却有着 CPU，GPU，NPU 多种架构。

![](https://picx.zhimg.com/v2-8cc72dd39386249b2f0103459775d5b1_1440w.jpg)

![](https://pic2.zhimg.com/v2-c8dae92d025d97e2fe8697f778745631_1440w.jpg)

异构计算的主要优势有：

性能飞跃： 异构架构将 CPU、GPU、FPGA 等计算单元有机结合，充分发挥各自优势，实现 1+1>2 的效果，显著提升计算性能。

灵活定制： 针对不同计算任务，灵活选择合适的主张计算单元，实现资源的高效利用。

降低成本： 相比于昂贵的专用计算单元，异构架构用更低的成本实现更高的性能，带来更佳的性价比。

降低功耗： 异构架构能够根据任务需求动态调整资源分配，降低整体功耗，提升能源利用效率。

异构计算将 CPU 和 GPU 优势互补，强强联合。CPU 负责游戏逻辑、场景构建等任务，GPU 则专注于画面渲染。两者分工协作，实现更高效的硬件利用率，例如不用内存拷贝。

![](https://pica.zhimg.com/v2-1a07dfa9b004fdc37b8634c06c51104a_1440w.jpg)

其具体流程为：

1. CPU 把数据准备好，并保存在 CPU 内存中
2. 将待处理的数据从 CPU 内存复制到 GPU 内存（图中 Step1）
3. CPU 指示 GPU 工作，配置并启动 GPU 内核（图中 Step2）
4. 多个 GPU 内核并行执行，处理准备好的数据（图中 Step3）
5. 处理完成后，将处理结果复制回 CPU 内存（图中 Step4）
6. CPU 把 GPU 的结果进行后续处理
![](https://pic3.zhimg.com/v2-2a82e3d2f974f9cb398b8419b1d239d8_1440w.jpg)

异构计算本身也还是存在着一些问题：

1. 复杂计算：系统越复杂，需要选择越灵活的处理器；性能挑战越大，需要选择越偏向定制的加速处理器；
2. 本质矛盾：单一处理器无法兼顾性能和灵活性；

异构架构的处理器越来越多，需要构建高效、标准、开放接口和架构体系，才能构建一致性的宏架构（多种架构组合）平台，才能避免场景覆盖的碎片化。在正处于计算体系变革和编译体系变革 10 年，避免为了某个应用加速而去进行非必要大量上层应用迁移对接到硬件 API，应交由一致性的宏架构（多种架构组合）平台（编译/操作系统）。

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

编辑于 2026-03-26 10:50・上海[数字IC后端前景好吗？如何入门？](https://www.zhihu.com/question/618078270/answer/1954925841747284610)

[

免费教程看结尾！数字IC后端入门到精通，建议考虑下我们的培训课程：课程主要培养具备独立工程能力的数字IC后端工程师，也就是实战型的工程师。https://xg.zhihu.com/plugin/...

](https://www.zhihu.com/question/618078270/answer/1954925841747284610)