---
title: "AI系统-17NPU架构设计介绍"
source: "https://zhuanlan.zhihu.com/p/2021602055706408741"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "上篇文章介绍完AI SoC架构： AI系统-16AI SoC推理芯片架构介绍，那么这篇就开始NPU架构了，更加重磅干货！。之前跟随ZOMI酱《AI系统》中的内容，介绍NPU的文章不少： AI系统-8AI芯片介绍1 AI系统-10AI芯片介绍2 AI…"
tags:
  - "clippings"
---
[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810)

13 人赞同了该文章

![](https://pica.zhimg.com/v2-d079b72818a0e521df51f2080fbf4e2e_1440w.jpg)

上篇文章介绍完 [AI SoC架构](https://zhida.zhihu.com/search?content_id=272190453&content_type=Article&match_order=1&q=AI+SoC%E6%9E%B6%E6%9E%84&zhida_source=entity) ： [AI系统-16AI SoC推理芯片架构介绍](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247487299%26idx%3D1%26sn%3D2937eb9277f5f98025bbd993391e5fd8%26scene%3D21%23wechat_redirect) ，那么这篇就开始 [NPU架构](https://zhida.zhihu.com/search?content_id=272190453&content_type=Article&match_order=1&q=NPU%E6%9E%B6%E6%9E%84&zhida_source=entity) 了，更加重磅干货！。

之前跟随ZOMI酱《AI系统》中的内容，介绍NPU的文章不少：

[AI系统-8AI芯片介绍1](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247487066%26idx%3D1%26sn%3D83600d4698e187a759d8e7f91a5b5e11%26scene%3D21%23wechat_redirect)

[AI系统-10AI芯片介绍2](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247487103%26idx%3D1%26sn%3Dbaed05e73a323f92f356d40f511f134c%26scene%3D21%23wechat_redirect)

[AI系统-11AI芯片基础NPU](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247487104%26idx%3D1%26sn%3D445c8b041653290e293db411bf9e6f41%26scene%3D21%23wechat_redirect)

[AI系统-12谷歌跨时代AI芯片TPU](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247487172%26idx%3D1%26sn%3Dc192415453786748ed5cb2743a7bb999%26scene%3D21%23wechat_redirect)

[AI系统-13特斯拉AI芯片DOJO](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247487207%26idx%3D1%26sn%3Dd8417309e88661e6eb5cd8c32a6720e1%26scene%3D21%23wechat_redirect)

[AI系统-14特斯拉FSD芯片](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247487239%26idx%3D1%26sn%3D705c14f95e9e87a48965634aef99d122%26scene%3D21%23wechat_redirect)

[AI系统-15国内AI芯片介绍](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247487277%26idx%3D1%26sn%3Dfa1a9fa9c4c10a200428b760af4be084%26scene%3D21%23wechat_redirect)

但是总感觉不够深入，网上介绍NPU内部结构架构的文章也不多，可能是比较保密。ZOMI酱介绍 [华为达芬奇NPU](https://zhida.zhihu.com/search?content_id=272190453&content_type=Article&match_order=1&q=%E5%8D%8E%E4%B8%BA%E8%BE%BE%E8%8A%AC%E5%A5%87NPU&zhida_source=entity) 的时候架构资料还相对多一些，所以就以华为NPU为例，辅助之前我们介绍的几个公司的NPU技术，结合AI芯片架构分析五步法，加上我自己的理解和思考对NPU怎么设计进行探讨：

> 对于AI芯片的架构，总结有下面5点（AI芯片五步分析法）：

1. 簇：计算部分有很多的cluster就是簇
2. PE：簇里面有几个PE（处理引擎AI Core），一般是4个，里面有张量、标量等计算硬件算子
3. 调度：NPU里面有调度器管理cluster/PE的计算
4. 通信：簇之间的通信，一般通过 [NoC总线](https://zhida.zhihu.com/search?content_id=272190453&content_type=Article&match_order=1&q=NoC%E6%80%BB%E7%BA%BF&zhida_source=entity)
5. 存储： [SRAM](https://zhida.zhihu.com/search?content_id=272190453&content_type=Article&match_order=1&q=SRAM&zhida_source=entity) 一般有两级，簇有一个小的SRAM，NPU整体有一个大的SRAM

## 1\. NPU Cluster介绍

首先为什么要有簇？

一个AI计算任务，例如人脸识别需要大量的数据运算，那么要并行处理就需要对任务进行切片并行处理，那么一个子任务对应硬件的处理就是cluster，可以理解为多个cluster并行工作。

那就要保证cluster有足够的资源可以应对子任务，NPU的Core就是PE集成了计算单元，但是单个PE可能应对不了一个子任务，并且相关配套的SRAM和调度以及低频率的运算需要CPU的参与。这就需要cluster是一个最小的战斗单元，例如行军打仗，这个单元需要有做饭的，有后勤，有医疗，各种兵种都有才可以。

先举几个簇的例子：

## 1.1 壁仞科技

![](https://pic1.zhimg.com/v2-086ea583cce8f4055e7f7d61b7dbbd16_1440w.jpg)

![](https://pic4.zhimg.com/v2-891222fc7b3db7b524213ab8d46f8151_1440w.jpg)

可以看到簇之间使用NoC高速互联，簇内的Core则使用低速一点的通信就可以满足，这样二级的设计，让组织效率更加的有效。

同样cache在簇中有一级L1，PE有一级L0，这样两级的设计也让系统更加的有效。

这就是为什么说NPU的组织更像是一个公司，老板CPU发话说要干一个事情，NPU部门就对任务进行分解给各个子部门簇，子部门内部就去捯饬，不行跟相邻子部门借资源干。而不是CPU发话干一个事，没有组织的所有员工直接往上扑，就造成很多的资源浪费。

可以看到一个cluster里面有16个PE，具体多少个由业务去决定。然后就是簇里面除了EU还有什么，这个壁仞科技的只有缓存了，可见其偏GPU的设计，并不太纯粹的NPU。只是用GPU的思路，只是把里面的AI算子部分由通用直接变成神经网络深度学习专用的算子了。

## 1.2 寒武纪

![](https://pic3.zhimg.com/v2-8b6efb84523591a9d012769a07d33a0a_1440w.jpg)

其IPU就是PE，上图中是一个cluster里面有4个PE。

除了4个PE，又添加了MPU，用于内存处理的协处理器，里面有SRAM共享内存，还有DMA、针对cluster基本的调度控制，里面的东西还挺不少。但是感觉不够简洁和精细化，估计设计时间短直接堆出来的。

## 1.3 华为达芬奇

![](https://picx.zhimg.com/v2-d67e85eac1565d8e81f1bbea33b8371d_1440w.jpg)

![](https://pica.zhimg.com/v2-8fb3b85224bbdc4fc94e8421791bc4ac_1440w.jpg)

没有用簇的概念，但是其有一个任务调度器，这里面感觉是隐形的把一些Core灵活的组织成了一个Cluster，另外其Core里面有强大的功能，更像是一个core一个cluster的感觉，例如里面有协处理器、缓存等。

![](https://pica.zhimg.com/v2-7467434c097de6cb27548fc1b0511cc2_1440w.jpg)

> 本文后续都按华为的一个Core就是一个cluster来介绍，因为其实现了cluster的功能，除了PE（计算单元外又集成了存储、控制等功能）。如果这个架构扩展一个cluster4个PE，那就把计算单元给分成4份就可以了。这里根据华为的场景子任务应该不需要那么多的Core，一份就够用了，这个就是一个cluster使用几个PE的权衡。

通过对比可能是需要针对不同的产品，或者一个架构对新产品适配的周期进行灵活的调整那些任务由那些硬件完成，特别是存储、通信、调度这些其实放哪里（NPU/cluster/core）都可以，怎么放（功能分配）、放多少，这就是考虑是否组织成簇的意义。

## 2\. NPU整体架构设计

了解完cluster这个NPU中最重要的单位，我们再从NPU整体出发，以AI芯片架构分析五步法进行彻底的剖析：

> 对于AI芯片的架构，总结有下面5点（AI芯片五步分析法）：

1. 簇：计算部分有很多的cluster就是簇
2. PE：簇里面有几个PE（处理引擎AI Core），一般是4个，里面有张量、标量等计算硬件算子
3. 调度：NPU里面有调度器管理cluster/PE的计算
4. 通信：簇之间的通信，一般通过NoC总线
5. 存储：SRAM一般有两级，簇有一个小的SRAM，NPU整体有一个大的SRAM
![](https://pic2.zhimg.com/v2-48917309893d3b05247a5ed039a844c3_1440w.jpg)

NPU相关的可以看到：

1. 调度器（调度）
2. DMA和SRAM（存储）
3. 达芬奇core
4. 通信总线

达芬奇core（一个cluster）内部的：

![](https://pic4.zhimg.com/v2-9865fc91cd75dcc184f4e091536effa3_1440w.jpg)

cluster里面有：

1. 计算单元（PE）
2. 存储系统
3. 控制单元（调度相关）
4. 总线（通信）

> 华为达芬奇按AI芯片架构分析五步法归纳如下：

1. 簇：一个达芬奇Cluster就是一个簇，簇里面有PE、存储、控制、通信
2. PE计算：簇里面有1个PE，里面有张量、向量、标量等计算硬件算子
3. 调度：两级结构，独立的任务调度器和簇里面的控制器
4. 通信：两级结构，簇间通信和簇内通信，通信种类包括数据总线、指令总线、中断、共享内存等。
5. 存储：两级结构，簇有一个小的SRAM，NPU整体有一个大的SRAM

！！！重要：上面就是一个典型NPU框架设计，特别是对比上几款NPU的框架，基本也都是这么个套路，这里算是对NPU架构高度概况了下，至于细节的实现，使用什么技术怎么搭配就比较灵活了。

cluster其实是一个功能合集，设计上也最灵活，这里从功能角度介绍剩下的4个，然后再来看cluster设计的一些要点。

## 2.1 调度相关设计

我们还是以华为达芬奇为例，NPU里面的调度分为两部分：

1. 任务调度器，独立的核和固件以及SRAM，专门用于切片后的任务调度
2. Cluster内部的控制单元，里面会有指令流水线，指挥子任务的执行
![](https://picx.zhimg.com/v2-68abfae25794c78f1ebd8b627a50ff53_1440w.jpg)

首先看下调度器的上游就是CPU和DDR，关系如下：

- 调度器接收CPU的任务，并反馈给CPU运行结果
- 获取NPU的一些信息给CPU
- 按照CPU的指示对NPU进行配置
- 对DDR中的AI数据搬运到SRAM更快的进行运算，这个搬运要快就需要数据总线NoC以及DMA 调度器跟CPU的通信其实属于核间通信了，基本依赖Mailbox，也就是中断+共享内存。

调度器跟下游cluster的通信，就是是发射NPU指令。这一条指令就是一行代码，就可以完成一次AI运算，如果没有AI硬件那就需要把这个算子的算法用多行代码进行实现。如下图所示：

![](https://pic3.zhimg.com/v2-8a4103e5253752cbacd6f03436f0ac58_1440w.jpg)

> 发射的是如果是存算一体数据，那么就是调度器直接把NPU SRAM的存算一体数据给到Cluster的SRAM，这样Cluster里面的控制单元（有核一般是 [RISCV](https://zhida.zhihu.com/search?content_id=272190453&content_type=Article&match_order=1&q=RISCV&zhida_source=entity) ）就开始干活了，去取数据运行得到结果再给调度器。这点看华为达芬奇这个架构还没做，即它是指令和数据分离的，统一由调度器去先放数据，然后去发指令，不是一股脑的把存算打包为PE，这样调度器的压力就比较大，还是适合算力小的情况。  
>   
> 但是实现存算一体还有个问题就是对编译器的挑战，存算一体的数据是提前编译器搞好的，里面包含了调度依赖，这样减轻了调度器的压力（把运行时干的活放编译干，等于提前准备，干活时就快，这是计算机的一项重要技术），存算一体对PE来说是好处很多，运算时不用受调度器的指挥，只管对着存算一体数据干活，干完活才汇报，干活过程中不受打扰。

回到华为达芬奇这个调度器，其是一个固件，有核有RTOS，按照目前流行的做法是使用RISC-V+ [FreeRTOS](https://zhida.zhihu.com/search?content_id=272190453&content_type=Article&match_order=1&q=FreeRTOS&zhida_source=entity) 实现，其作用就是安排好数据和指令给到Cluster。

![](https://pic4.zhimg.com/v2-c43cee6d249d0ac8ff973ae1c27fd437_1440w.jpg)

调度的另外一部分就是Cluster内部的控制单元，按ZOMI视频的说法这个标量处理单元其实是一个ARM核，除了进行常规的CPU标量运算，其还可以管理下面的指令队列和同步模块，那就是控制啊！

![](https://pic4.zhimg.com/v2-b9493db1df52634441fbb66f91111cd9_1440w.jpg)

灰色部分就是控制单元，其可以成为标量核的附属，因为ARM核或者RISC-V核本身就自带一些这样的功能，然后再通过核上运行软件的辅助就可以实现。

控制单元主要组成部分为系统控制模块、指令缓存、标量指令处理队列、指令发射模块、矩阵运算队列、向量运算队列、存储转换队列和事件同步模块。下面详细介绍下：

1. 系统控制模块：控制任务块（AI Core最小任计算务粒度）的执行进程，在任务块执行完成后，系统控制模块会进行中断处理和状态申报。如果执行过程出错，会把执行的错误状态报告给任务调度器；
2. 指令缓存：在指令执行过程中，可以提前预取后续指令，并一次读入多条指令进入缓存，提升 指令执行效率；
3. 标量指令处理队列：指令被解码后便会被导入标量队列中，实现地址解码与 运算控制，这些指令包括矩 阵计算指令、向量计算指令以及存储转换指令等；
4. 指令发射模块：读取标量指令队列中配置好 的指令地址和参数解码，然后根据指令类型分别发送到 对应的指令执行队列中，而 标量指令会驻留在标量指令 处理队列中进行后续执行；
5. 指令执行队列：指令执行队列由矩阵运算队 列、向量运算队列和存储转 换队列组成，不同的指令进 入相应的运算队列，队列中的指令按进入顺序执行；
6. 事件同步模块：时刻控制每条指令流水线的 执行状态，并分析不同流水 线的依赖关系，从而解决指令流水线之间的数据依赖和同步的问题。
![](https://pic3.zhimg.com/v2-aed612eeaa9ff246dd9a714db2bd9a06_1440w.jpg)

这个标量处理单元怎么去触发AI矩阵运算单元和向量单元等工作呢？答案就是其可以定制NPU指令集，ARM或者RISCV是支持的，这样就可以在cluster里面做土皇帝了。自己干点标量计算的活，顺带当个工头代班指挥下别人干活。

调度器发射指令就需要用到指令总线，所以指令总线需要把Cluster都串起来，这里华为达芬奇就按1个Core就是1个Cluster来说。

![](https://pic4.zhimg.com/v2-9005b0e56b33b8898b2cb3371b33e799_1440w.jpg)

调度在软件层面非常的核心，甚至决定AI芯片的成败也在这上面，因为实现太难了，这里说的很少的篇幅，但是具体技术代码实现上用到的东西涉及核心的技术算法，研究这个的应该都是顶尖人才了。就是AI编译器静态和调度器动态的协调配合，去盘活整个NPU那么多核的资源利用率。

大家都知道CPU的平均利用率基本10%，这个NPU要想在做业务的时候是核心算子是满负载的状态，软件的确难度很大。这还涉及到NPU中硬件算子的搭配比例，不能有一些类型的算子不够而拖后腿。

## 2.2 存储相关设计

这里还是以华为达芬奇为例进行介绍：

![](https://pica.zhimg.com/v2-79220885dbe3ebfd7787f7bfc9e36d8a_1440w.jpg)

上图中cluster内部存储来说主打一个近存计算速度快，也就是说PE（计算单元）要离存储近，而且这个存储必须上快速的SRAM。

![](https://picx.zhimg.com/v2-fc8a2610a8f92100e5223249e62362e1_1440w.jpg)

要处理的AI数据的根源在DDR里面，那直接从DDR搬运到PE的SRAM就又慢了，DDR会拖后腿，那就在NPU里面放一个大的SRAM，从NPU的SRAM往PE的SRAM里面拷贝就ok了，另外这里的搬运需要用到DMA，这样把这种搬运任务从控制系统解放出来，并行操作，等于加了一个人干活。

所以，NPU里面使用了两级SRAM进行存储。 对于cluster内部的存储有三部分组成：

1. 存储控制单元：通过总线接口直接访问 AI Core 外更低层级缓存，也可直通DDR/HBM 访问内存。另外设置存储转换单元，作为AI Core内部数据通路传输控制器，负责AI Core内部数据在不同缓冲区间读写管理，以及完成一系列的格式转换操作，如补零，Img2Col，转置、解压缩等。跟BIU总线进行通信连接，这样cluster外就可以通过BIU跟这个DMA进行指令通信。
2. 输入缓冲区：用于暂存需频繁复用数据，不需要每次都通过总线接口到 AI Core 外部读取；从而减少 BUS 上数据访问频次，同时降低总线数据拥堵风险；实现节省功耗、提高IO、提升性能效果；
3. 输出缓冲区：用来存放神经网络中每层计算中间结果，从而在进入下一层计算时方便获取数据。相比较 BUS 读取数据带宽低，延迟大，通过输出缓冲区可以极大提升计算效率；
![](https://pic3.zhimg.com/v2-d3bbea2552c883a1d14be9fdbe52ea54_1440w.jpg)

## 2.3 通信相关

1\. 首先就是中断，这个核间通信必备，参考之前文章： [SoC软件技术--核间通信](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485453%26idx%3D1%26sn%3D3695bfdaa107d4f0b834b03c3975047f%26scene%3D21%23wechat_redirect) 。CPU和调度器之间，调度器和Cluster直接都使用中断去触发一些通信。

![](https://pic2.zhimg.com/v2-53d557dc827821316eaf2534f4724c4f_1440w.jpg)

![](https://pic4.zhimg.com/v2-e77023c708eb70a6f7ece15d6a622fef_1440w.jpg)

2\. 如上图，数据搬运拷贝就用NoC总线配合DMA进行。NoC是Mesh总线，就是擅长点对点的数据传输，算mesh总线。如果需要对数据进行广播的场景，在并行计算中会经常用到，一个数据广播给几个PE同时接收，这样这几个PE协同运算只用广播这一次数据就可以了。那么适用于广播的环形总线也需要安排上，把各个Cluster给串起来。

![](https://picx.zhimg.com/v2-d59d3baa6357ae8adf3b2bea0096d70f_1440w.jpg)

3\. 其他就是调度器跟Core之间的数据总线和指令总线了。指令总线在华为达芬奇里面就是BIU，数据总线没提，这些硬件根据需求都可以自己设计，例如NoC、APB这些CPU里面常用到的总线技术。

这些都是芯片最基本的技术，每个芯片里面都有这些东西，这里只是把信息提炼了下，入门简单介绍下。

在SoC里面能触发通信的单位需要有核，例如CPU、调度器、标量核。然后对于数据通信来说核都配的有DMA帮手，数据介质就是DDR、NPU SRAM、Cluster SRAM，什么核能访问什么复制什么数据，通过什么总线，都是需要设计的。权限和根据和的MPU来设置，总线的类型有快有慢，按需使用。

> NoC总线：SoC内速度最高，但是成本也高  
>   
> AXI总线：高速度、高带宽，支持管道化互联、读写并行、乱序传输和非对齐操作，适用于高性能、高带宽的SoC系统。其多通道设计（五个独立通道）和复杂的仲裁机制使其能够高效处理大量数据传输，但实现复杂度和硬件开销较大。  
>   
> APB总线：低速、低功耗，设计简单，主要用于低带宽的外围设备（如UART、I2C等）。其单主设备多从设备的架构和简单的状态机设计使其易于实现，但无法满足高性能需求。

## 2.4 计算单元PE

PE里面就是算子构成的，算子是指令直接驱动。

![](https://pic3.zhimg.com/v2-636e68298f7f408210c0f4a9d12d903a_1440w.jpg)

1. CLube矩阵计算：深度学习算法必备的算子，这类AI算子就是NPU的核心，最后都是为它服务的，干最重的活
2. 向量运算：例如平方根、求导运算等，可以完成AI中的softmax、laynorm计算
3. 标量运算：普通的运算，通用CPU即可以完成，且负责各类型标量数据运算和程序流程控制：算力最低，功能上类比小核 CPU，完成整个程序循环控制、分支判断、Cube/Vector 等指令地址和参数计算以及基本算术运算等。
4. 累加器：把当前矩阵乘结果与上一次计算中间结果相加， 可以用于完成卷积中加 bias 等操作。
5. MTE存储转换单元：例如矩阵的存储是一维的，多维矩阵就需要进行转换，这里也是一个算子
6. 同步模块：也是标量核控制的硬件，需要用指令触发

## 2.5 Cluster相关

NPU的另一种拆分从功能角度就是管理和计算。cluster专注计算，稍微带点基础队列的管理，调度器则主抓管理。所以cluster在管理和计算上有很大的灵活性。

1\. Cluster需要用多少个PE？ 通常就是寒武纪的4个，具体根据业务，如果是1个那就没有Cluster了，就像华为的。

2\. Cluster里面除了PE还可以放什么？ 首先一个SRAM供PE近存使用，这样算的快，那配套的DMA和协处理器也需要安排上。协处理器可以用RISCV同时做一些标量运算，弥补PE的缺陷，这个协处理器也可以运行队列组织PE有序的运行。

![](https://pica.zhimg.com/v2-3d176bec12f1dedf51fb883a9d86eb0c_1440w.jpg)

例如上图华为达芬奇中的。

3\. Cluster之间用什么连接？ culster是运作子任务的单位，那么子任务是由调度器去管理的，调度器跟Cluster的数据通信有NoC，还有需要指令总线和数据总线来实现，例如寒武纪的设计。

4\. 属于NPU，但是在Cluster之外有什么？ 首先就是调度器，然后是NoC总线，以及指令和数据总线。然后有一个NPU使用大的SRAM例如华为达芬奇里面的。这个就需要协调这些存储、通信、调度等资源的颗粒度，那些放NPU里面，那些放Cluster里面，那些放调度器里面。

> 后记：  
> 对于NPU的设计基础框架参考华为达芬奇就基本够了，还有本文的达芬奇介绍估计不先进，其前身还是需要看寒武纪，最新的寒武纪芯片设计应该更加先进，寒武纪老板陈天石来源于中科院计算所博导，所以先进的技术还是需要科研支撑的，门槛高。

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位有自己公众号的留言： **申请转载** ！

纯干货持续更新，欢迎 **分享给朋友** 、 **点赞、收藏、在看、划线和评论交流**

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

编辑于 2026-03-29 14:59・上海[PMP培训机构哪家好？TOP 10深度真实测评！](https://zhuanlan.zhihu.com/p/672473299)

[

身为90后，考试一直都是我的拿手好戏。 近两年，我不仅一举通过了PMP考试，还同时考过了ACP和软考高项。 那时为了迅速取得...

](https://zhuanlan.zhihu.com/p/672473299)