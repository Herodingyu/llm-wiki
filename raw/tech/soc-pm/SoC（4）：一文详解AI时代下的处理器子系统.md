!\[cover\_image\](https://mmbiz.qpic.cn/mmbiz\_jpg/g68z8egLoSo5q93fDYzygvIQs4 YbgvmVJib0 MzsnEv4cve7uhcXcoK2L96MTlP0AZhqhLyVEFUZ4WE2 OcE53 OhDoIF7nRiauhyEQnpT3 RcqeU/0?wx\_fmt=jpeg)


# SoC（4）：一文详解AI时代下的处理器子系统 

Original  alltowine  alltowine  [芯片系统成长记](javascript:void\(0\);) *2026年5月7日 12:51* * 湖北 *

在小说阅读器读本章

去阅读

在小说阅读器中沉浸阅读

如果说存储子系统是 SoC 的“记忆系统”，互联子系统是 SoC 内部的“道路和桥梁”，外设子系统是 SoC 连接真实世界的“感官和手脚”，那么处理器子系统就是 SoC 的“决策中枢”。 

很多人谈处理器子系统时，第一反应是 CPU 核。但在 SoC 里，处理器子系统远不只是一个 CPU Core。它通常还包括 Cache、MMU、总线接口、中断控制、调试跟踪、Snoop/一致性接口、协处理器接口，甚至还会和 GPU、DSP、NPU、TPU 等异构计算单元共同构成更大的计算系统。 

所以，理解处理器子系统的关键不是问“CPU 有几个核”，而是问：  SoC 中的计算任务，如何被取指、执行、调度、协同、加速和保护？ 

!\[Image\](https://mmbiz.qpic.cn/mmbiz\_png/g68z8egLoSpHibnOxPpPKDtrZbOzcZuAkYGqa0 ZxKoDXU0dIQOxJDiawicos3LDUqn8CIlRJx5wy6 KqI1 EicqGzo56K97NFXozUD9X7rHW9fo6U/640?wx\_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx\_lazy=1#imgIndex=0) 


## 一、处理器到底在做什么？ 

我们先不谈 Cortex、RISC-V、A 核、M 核、大核、小核，也不谈几纳米工艺。 

回到最底层的问题：  处理器存在的目的是什么？  答案很简单：  处理器负责按照指令改变系统状态。 

一条指令可能让处理器：从内存读取数据； 执行一次加法； 跳转到另一个地址；访问外设寄存器； 触发异常； 修改权限状态； 启动一次 DMA； 调度一个加速器任务。  从第一性原理看，处理器就是一个“状态机”：输入是指令和数据；输出是新的寄存器状态、内存状态、外设状态和系统状态。  所以处理器子系统的核心职责，可以概括为三句话：  第一，执行软件定义的控制逻辑。第二，协调 SoC 内部各种硬件资源。第三，在性能、功耗、实时性和安全之间做平衡。  这也是为什么 CPU 在 SoC 中往往不是单纯的数据搬运工，而更像系统的总调度者。 


## 二、处理器子系统不是 CPU Core，而是一套计算控制系统 

一个 CPU Core 通常只负责指令执行。但一个完整的处理器子系统通常还需要很多配套模块。 

!\[Image\](data:image/svg+xml,%3C%3 Fxml version='1.0' encoding='UTF-8'%3F%3E%3 Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3 Ctitle%3E%3C/title%3E%3 Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3 Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3 Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E) 


### 1\. CPU Core：执行指令的核心 

CPU Core 内部通常包括取指、译码、执行、访存、写回等流水线阶段。对于复杂处理器，还会有分支预测、乱序执行、寄存器重命名、多发射、Load/Store Queue、异常处理等机制。它的目标是让指令尽可能快、尽可能高效地执行。 


### 2\. Cache：减少存储访问延迟 

CPU 的速度通常远高于 DDR。如果每条指令、每个数据都去 DDR 取，CPU 会大量等待。所以处理器子系统通常会配置 L1 I-Cache、L1 D-Cache、L2 Cache，甚至共享 L3/System Cache。Cache 的价值在于利用时间局部性和空间局部性，把常用数据放到离 CPU 更近的地方。 


### 3\. MMU：把地址访问变成受控行为 

MMU 的作用不是简单做地址转换。它还支持虚拟内存、权限管理、进程隔离、Cache 属性控制、安全属性控制。在运行 Linux、Android、Hypervisor 等复杂软件系统时，MMU 是处理器子系统不可或缺的一部分。没有 MMU，就很难支撑现代操作系统的内存隔离和虚拟地址空间。 


### 4\. BIU / 总线接口：处理器连接 SoC 的出口 

CPU 执行指令时，最终要访问存储、外设和其他 IP。这些访问需要通过总线接口进入互联子系统。所以处理器子系统通常会通过 AXI、ACE、CHI 或其他接口连接到主互联、缓存一致性互联或 NoC。这也是处理器子系统与互联子系统的交界处。 


### 5\. 中断与异常：让外部事件进入处理器 

外设完成任务、定时器到期、DMA 搬运结束、访问非法地址、页表异常，这些都需要处理器响应。中断和异常机制让处理器不再只是顺序执行代码，而能响应系统事件。 

这也是操作系统、驱动程序和实时控制的基础。 


### 6\. Debug & Trace：让芯片可观察、可调试 

处理器子系统通常还包括调试接口、断点、单步执行、跟踪单元等。没有这些模块，软件调试和芯片 bring-up 会非常困难。很多 SoC 项目真正耗时的不是“跑起来”，而是出问题时能不能定位。 


### 7\. 一致性接口：让多核共享内存成立 

一旦多个 CPU Core 共享内存，就会出现 Cache 一致性问题。一个核写了数据，另一个核如何看到最新值？这需要 Snoop、Directory、一致性互联、共享 Cache 等机制支持。所以在多核 SoC 里，处理器子系统和缓存一致性子系统往往是紧密耦合的。 


## 三、处理器子系统的核心矛盾：通用性、性能、功耗和确定性不可兼得 

处理器设计最核心的矛盾，不是“频率能不能更高”，而是：  通用性、性能、功耗、面积、实时性、安全性不能同时最优。  通用 CPU 很灵活，但在矩阵乘法、图像处理、神经网络推理上不如专用加速器高效。 

大核性能强，但面积大、功耗高。小核省电，但峰值性能有限。乱序执行提升性能，但控制逻辑复杂，功耗更高，实时性更难分析。Cache 提升平均性能，但 Cache Miss 会带来延迟抖动。多核提升吞吐，但会引入一致性、同步、调度和带宽竞争问题。 

所以处理器子系统设计，本质上是在做一组取舍：要不要大核？ 要不要小核？ 要不要多核？ 要不要乱序？ 要不要 Cache？ 要不要 MMU？ 要不要一致性？ 要不要硬实时能力？ 要不要集成 AI 指令或矩阵扩展？ 要不要把一部分任务交给 NPU/DSP/GPU？ 

这就是为什么现代 SoC 处理器子系统越来越不是“一个 CPU”，而是一个复杂的异构计算平台。 


## 四、   单核、多核与异构：处理器子系统的三层演进 

!\[Image\](data:image/svg+xml,%3C%3 Fxml version='1.0' encoding='UTF-8'%3F%3E%3 Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3 Ctitle%3E%3C/title%3E%3 Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3 Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3 Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E) 


### 1\. 单核处理器：简单、确定、低成本 

单核 CPU 适合简单控制类 SoC，例如 MCU、传感器控制器、小型 IoT 芯片。 

它的优点是结构简单、软件模型清晰、验证成本低、功耗容易控制。但它的问题也明显：性能扩展能力有限。当任务变复杂，例如同时要跑操作系统、通信协议栈、图像处理和 AI 推理，单核很快不够用。 


### 2\. 多核处理器：用并行提升系统吞吐 

多核的本质是把多个 CPU Core 集成在一个系统中，让不同任务并行运行。 

比如：一个核跑操作系统； 一个核处理通信协议； 一个核处理实时控制； 一个核处理应用任务。  多核可以提升吞吐，但也引入新的问题： 

任务如何调度？ 共享内存如何一致？ 多个核同时访问 DDR 怎么仲裁？ 中断应该分配给哪个核？ 低功耗时哪些核关闭，哪些核保留？  所以多核不是简单“核越多越好”。多核真正的难点在于系统协同。 


### 3\. 异构处理器：让不同任务交给最适合的计算单元 

现代 SoC 很少只依赖 CPU。图像处理交给 ISP； 图形渲染交给 GPU； 神经网络推理交给 NPU； 音频和信号处理交给 DSP； 安全算法交给 Crypto Engine； 实时控制可能交给 MCU 子系统。  CPU 的角色逐渐从“什么都自己算”变成“负责控制、调度和通用计算”。 

这背后有一个很重要的原则：  通用计算追求灵活性，专用计算追求能效。  对于 AI、视频、图像、通信等高重复度、高吞吐任务，专用加速器通常能提供更好的性能功耗比。 


## 五、   从流水线看处理器：如何让一条指令高效执行？ 

!\[Image\](data:image/svg+xml,%3C%3 Fxml version='1.0' encoding='UTF-8'%3F%3E%3 Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3 Ctitle%3E%3C/title%3E%3 Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3 Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3 Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E) 

处理器执行程序，最朴素的方式是一条指令执行完，再执行下一条。但这样效率太低。所以现代 CPU 通常采用流水线。一个典型流水线可以抽象成：取指； 译码； 执行； 访存； 写回。  这就像工厂流水线：第一条指令在执行阶段时，第二条指令可以在译码，第三条指令可以在取指。流水线的价值是提高吞吐率。 

但流水线也会遇到冒险：  数据冒险：后面的指令依赖前面指令的结果。控制冒险：分支跳转导致后续取指方向不确定。结构冒险：多个操作争用同一个硬件资源  。 

为了提高性能，高端 CPU 会引入分支预测、乱序执行、寄存器重命名、预取、多发射等机制。但这些机制越复杂，面积和功耗越高，验证越困难。这也是为什么嵌入式实时控制芯片往往采用更简单的顺序执行核，而高性能手机和服务器 SoC 会采用复杂乱序超标量核心。 

!\[Image\](data:image/svg+xml,%3C%3 Fxml version='1.0' encoding='UTF-8'%3F%3E%3 Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3 Ctitle%3E%3C/title%3E%3 Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3 Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3 Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E) 


## 六、大核小核：不是“强弱组合”，而是功耗曲线管理 

很多移动 SoC 都会采用大核 + 小核架构。大核负责高性能任务，例如应用启动、网页渲染、游戏主线程、复杂脚本执行。小核负责后台任务、待机服务、轻负载系统任务。这种设计不是简单地把“强核”和“弱核”放在一起，而是为了覆盖更宽的功耗性能曲线。 

轻负载时用小核，能省电。重负载时用大核，能提供响应速度。中等负载时通过调度策略在不同核心之间迁移任务。  Arm 的 DynamIQ 技术就是这类多核集群设计的代表之一，它支持把大核和小核组合进统一集群，并强调共享内存子系统、功耗管理和多样化配置能力；Arm 官方资料中，DSU-120 最高可支持 14 个核心和 32MB 共享 L3 Cache，并支持 Cortex-X925、Cortex-A725、Cortex-A520 等新一代核心组合。 

从 SoC 架构角度看，大核小核设计的关键不在“有几个核”，而在：调度器是否知道核心能力差异？ 任务迁移成本是否可控？共享 Cache 和内存带宽是否足够？热设计功耗是否允许长时间高频运行？后台任务是否能在低功耗核心上稳定运行？  所以，大核小核是系统级设计，不只是 CPU IP 选择。 


## 七、AI 时代：CPU 正在从“控制核心”变成“AI 协同核心” 

过去谈 AI SoC，大家往往只看 NPU TOPS。但越来越多实际系统发现，NPU 并不能替代 CPU。 

CPU 仍然负责：模型加载； 任务调度； 数据预处理； 后处理； 内存管理； 异常处理； 驱动控制； 与操作系统协同。  同时，CPU 本身也在加入更多 AI 相关能力。例如 Arm 的 SME2 被定位为面向端侧 AI 的 CPU 扩展，用来加速矩阵类计算负载；这类技术说明 CPU 并没有退出 AI 计算，而是在承担更灵活、更通用、更靠近软件栈的 AI 计算与协同角色。 

这带来一个新的趋势：  处理器子系统不再只是 CPU Cluster，而是 CPU + NPU + GPU + DSP + Memory + Interconnect 的协同计算平台。 

NPU 提供高能效矩阵计算。GPU 提供并行图形和通用并行计算能力。DSP 处理音频、通信和信号链。 CPU 负责控制流、复杂分支、系统管理和边界情况。 

AI SoC 的难点往往不在算力峰值，而在：数据能不能喂得上； CPU 调度是否高效；DDR 带宽是否足够；NPU 与 CPU Cache 是否一致；模型切换是否频繁；功耗墙和散热是否限制持续性能。  所以 AI 时代的处理器子系统设计，必须和存储、互联、DMA、Cache 一起看。 


## 八、RISC-V 的启发：处理器子系统正在走向可定制化 

过去很多 SoC 默认选择 Arm CPU。现在 RISC-V 的影响力越来越大，一个重要原因是它的开放 ISA 和可扩展性。RISC-V International 维护的 ISA 规格和扩展是开放公开的，Vector 扩展也提供了面向不同向量长度实现的可移植编程模型。 

这对 SoC 处理器子系统有什么启发？核心不是“RISC-V 一定替代 Arm”，而是： 

处理器子系统正在从固定 IP 走向面向应用的定制计算。  对于 MCU，可以定制低功耗控制核。 对于 AI，可以扩展矩阵或向量指令。对于安全芯片，可以增强隔离和可信执行。对于存储控制器，可以集成专用管理核。 对于实时系统，可以使用确定性更强的简单核。  未来的处理器子系统，很可能不是单一通用 CPU，而是多种可配置、可扩展、可定制处理单元的组合。 


## 九、安全与虚拟化：处理器子系统的边界正在变厚 

早期处理器更多关注性能。现在处理器还必须关注安全。 

!\[Image\](data:image/svg+xml,%3C%3 Fxml version='1.0' encoding='UTF-8'%3F%3E%3 Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3 Ctitle%3E%3C/title%3E%3 Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3 Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3 Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E) 

现代 SoC 中，CPU 往往要支持：特权级； 安全世界与非安全世界； 虚拟化； 内存访问权限； 调试权限控制；安全启动；可信执行环境； 

 机密计算。  Arm Confidential Compute Architecture 是 Armv9-A 中面向机密计算的安全特性，使用 Realm 这类隔离环境保护敏感数据和代码免受未授权访问或修改。 

安全处理器子系统要解决的问题是：  即使系统中某些软件不可信，关键数据和关键执行环境仍然要被保护。 

这意味着处理器子系统不能只考虑“能不能执行”，还要考虑：谁有权限执行； 谁能访问这段内存； 异常发生时进入哪个世界； 调试口能不能读安全数据； DMA 能不能绕过 CPU 访问敏感区域； 虚拟机之间如何隔离；安全状态如何切换。  因此，处理器子系统的安全边界，已经从 CPU Core 扩展到 MMU、Cache、互联、防火墙、内存控制器和调试系统。 


## 十、Chiplet 时代：处理器子系统可能不再只在一颗 Die 内 

过去 SoC 通常是一整颗单片芯片。但随着先进工艺成本上升、芯片规模扩大，Chiplet 越来越重要。UCIe 是面向封装内 Chiplet 互联的开放标准；UCIe Consortium 的规格页面显示，新版本规格支持 48 GT/s 和 64 GT/s 数据速率，并提供架构更新以满足高速、可互操作 Chiplet 方案需求。 

!\[Image\](data:image/svg+xml,%3C%3 Fxml version='1.0' encoding='UTF-8'%3F%3E%3 Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3 Ctitle%3E%3C/title%3E%3 Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3 Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3 Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E) 

这对处理器子系统有什么影响？未来一个“处理器子系统”可能跨多个 Die： 

一个 Die 放 CPU Cluster； 

 一个 Die 放 NPU； 

 一个 Die 放 SRAM 或 Cache； 

 一个 Die 放 I/O； 

 一个 Die 使用先进工艺，另一个 Die 使用成熟工艺。 

这样做可以降低成本、提高良率、复用 IP，并突破单 Die 面积限制。但它也带来新问题： 

 Die-to-Die 延迟如何影响 Cache 一致性？ 

 跨 Die 带宽是否足够？ 

 中断和调试如何跨 Die 管理？ 

 电源域和时钟域如何协同？ 

 安全边界如何跨封装延伸？ 

  软件是否能感知非一致内存访问差异？  所以 Chiplet 时代的处理器子系统，不再只是“核内微架构问题”，而是封装级系统架构问题。 


## 十一、   处理器子系统与其他子系统的关系 

!\[Image\](data:image/svg+xml,%3C%3 Fxml version='1.0' encoding='UTF-8'%3F%3E%3 Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3 Ctitle%3E%3C/title%3E%3 Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3 Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3 Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E) 


### 1\. 与存储子系统：处理器快不快，很多时候取决于数据近不近 

CPU 再强，如果经常等 DDR，性能也会被拖住。 

所以处理器子系统必须依赖 Cache、SRAM、DDR Controller、预取和内存一致性机制。 

很多 CPU 性能问题，本质上是存储瓶颈问题。 


### 2\. 与互联子系统：多核和加速器能不能协同，取决于道路是否畅通 

CPU、DMA、GPU、NPU、ISP 都要访问共享存储。 

互联子系统决定访问如何路由、仲裁、限流和保证 QoS。 

处理器子系统的性能上限，经常受到互联带宽和仲裁策略影响。 


### 3\. 与外设子系统：CPU 是外设的配置者和异常处理者 

UART、SPI、I2C、GPIO、USB、Ethernet 等外设通常通过寄存器被 CPU 配置。 

外设完成任务后，通过中断通知 CPU。 

所以 CPU 不一定直接搬数据，但它决定外设如何工作。 


### 4\. 与电源管理子系统：处理器是功耗大户，也是功耗调度中心 

CPU Core、Cache、互联和 DDR 都是功耗敏感模块。 

DVFS、Clock Gating、Power Gating、Core Idle、Cluster Sleep 等机制，都需要处理器子系统和电源管理协同。 

性能不是单纯提高频率，而是在功耗预算内获得最大有效吞吐。 


## 十二、实践例子：AI 摄像头 SoC 中处理器子系统如何工作？ 

假设我们设计一颗 AI 摄像头 SoC。它需要完成： 

 摄像头采集图像； 

 ISP 做图像预处理； 

 NPU 做目标检测； 

 CPU 运行操作系统和应用； 

 网络模块上传结果； 

 显示模块输出画面； 

!\[Image\](data:image/svg+xml,%3C%3 Fxml version='1.0' encoding='UTF-8'%3F%3E%3 Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3 Ctitle%3E%3C/title%3E%3 Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3 Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3 Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E) 

  系统还要低功耗待机。  这时处理器子系统怎么工作？ 

第一步，Boot ROM 启动 CPU，CPU 初始化时钟、DDR、外设和安全配置。 

第二步，CPU 通过寄存器配置 Camera、ISP、DMA 和 NPU。 

第三步，Camera DMA 把图像帧写入 DDR。 

第四步，NPU 从 DDR 读取图像数据进行推理。 

第五步，CPU 处理中断，读取 NPU 结果，执行应用逻辑。 

第六步，CPU 决定是否上传结果、刷新显示、进入低功耗。 

这个流程里，CPU 没有亲自处理每一个像素，也没有亲自执行所有矩阵计算。 

但 CPU 是整个系统的控制核心。它负责： 

 启动； 

 配置； 

 调度； 

 异常处理； 

 资源管理； 

 安全策略； 

 功耗管理； 

  软件栈运行。  所以在现代 SoC 中，CPU 的价值不是“所有任务都自己算”，而是“让所有计算资源正确协同”。 


## 十三、处理器子系统最容易踩的坑 


### 1\. 只看核心数量，不看内存和互联 

很多人会问“这个 SoC 几核？”但四个核如果共享一个很弱的内存通道，实际性能可能不如两个高效核心配合更好的 Cache 和互联。处理器性能不能脱离存储和互联单独评价。 


### 2\. 只看峰值频率，不看持续性能 

移动端和边缘设备受热设计功耗限制。CPU 可以短时间冲高频，但长时间运行会降频。所以持续性能往往比峰值频率更重要。 


### 3\. 忽略 Cache 一致性 

多核、DMA、NPU、GPU 共享 DDR 时，如果 Cache 一致性和缓存维护策略没处理好，会出现非常隐蔽的数据错误。这类问题常常表现为“偶现”“难复现”“加打印就好了”。 


### 4\. 中断设计不清晰 

中断路由、优先级、亲和性、屏蔽策略、低功耗唤醒，都需要在架构阶段规划。 

否则系统跑起来后会出现响应慢、抖动大、功耗高的问题。 


### 5\. 调试能力不足 

没有 Trace、性能计数器、错误状态寄存器、死锁检测和异常日志，SoC bring-up 会非常痛苦。处理器子系统的可调试性，本质上是芯片量产风险控制的一部分。 


### 6\. 安全边界后补 

安全不能靠软件最后补。CPU 特权级、MMU、TrustZone/TEE、调试权限、DMA 防火墙、安全启动、密钥访问路径，都必须从架构阶段设计。 


## 十四、如何设计处理器子系统？ 

 这个 SoC 的核心任务是什么？ 

 是控制为主，还是计算为主？ 

 是否运行复杂操作系统？ 

 是否需要硬实时？ 

 是否需要多核？ 

 是否需要大核小核？ 

 是否需要 MMU？ 

 是否需要 Cache 一致性？ 

 是否需要虚拟化？ 

 是否需要安全世界或机密计算？ 

 是否有 AI、图像、通信等专用计算需求？ 

 CPU 和 NPU/GPU/DSP 如何分工？ 

 DDR 带宽是否能支撑多核和加速器？ 

 低功耗状态下哪个核负责唤醒？ 

 系统异常时如何调试和恢复？  然后再决定： 

使用 MCU 级内核还是应用处理器内核； 

 单核、多核还是多集群； 

 是否采用 big. LITTLE； 

 L1/L2/L3 Cache 如何配置； 

 是否需要一致性互联； 

 是否集成 DSP/NPU/GPU； 

 中断控制器如何设计； 

 调试跟踪能力如何配置； 

 安全和虚拟化边界如何规划； 

 处理器、电源、时钟和复位如何协同。  处理器子系统设计的关键，不是堆规格，而是匹配系统任务模型。 

    欢迎大家收藏点赞转发！！！

预览时标签不可点

**微信扫一扫赞赏作者**  [ Like the Author ](javascript:;)

Close

**[0人付费](javascript:;)

**

更多

Loading...

Loading...

Close

更多

Name cleared

**微信扫一扫赞赏作者** Like the Author  [Other Amount](javascript:;)

赞赏后展示我的头像

作品

暂无作品

Like the Author

Other Amount

¥

最低赞赏 ¥0

OK

Back

**Other Amount**

更多

赞赏金额

¥

最低赞赏 ¥0

1

2

3

4

5

6

7

8

9

0

.

SoC合集 · 目录 #SoC合集

上一篇  SoC（3）：浅谈存储子系统  下一篇  SoC（5）：架构级低功耗设计：真正省电的 SoC，不是“少干活”，而是“会干活”

Close

更多

搜索「」网络结果

Close

**调整当前正文文字大小

**

更多

100%

​

Comment

暂无留言

1 comment(s)

已无更多数据

[Send Message](javascript:;)

写留言:

[](javascript:; "轻点两下打开表情键盘")[](javascript:; "轻点两下选择图片")

Scan to Follow

继续滑动看下一个

轻触阅读原文

!\[Image\](http://mmbiz.qpic.cn/mmbiz\_png/ibRFNxEJVe1KQXlyyQFTEicX9LPIBN4h4AP1qnybM2v04iaiaLWVrEDhicQBjP8ymoqJMnqK0bKAyTmNyYEzr7HMs3A/0?wx\_fmt=png)

芯片系统成长记

向上滑动看下一个

当前内容可能存在未经审核的第三方商业营销信息，请确认是否继续访问。

[继续访问](javascript:) [Cancel](javascript:)

[微信公众平台广告规范指引](javacript:;)

[Got It](javascript:;)

Scan with Weixin to  
use this Mini Program

[Cancel](javascript:void\(0\);) [Allow](javascript:void\(0\);)

[Cancel](javascript:void\(0\);) [Allow](javascript:void\(0\);)

[Cancel](javascript:void\(0\);) [Allow](javascript:void\(0\);)

× 分析

!\[跳转二维码\](https://mp.weixin.qq.com/s/oUcA8k-OPz0jWsUccukvcA)!\[作者头像\](http://mmbiz.qpic.cn/mmbiz\_png/ibRFNxEJVe1KQXlyyQFTEicX9LPIBN4h4AP1qnybM2v04iaiaLWVrEDhicQBjP8ymoqJMnqK0bKAyTmNyYEzr7HMs3A/0?wx\_fmt=png)

微信扫一扫可打开此内容，  
使用完整服务

!\[Image\](https://mmbiz.qpic.cn/mmbiz\_png/ibRFNxEJVe1KQXlyyQFTEicX9LPIBN4h4AP1qnybM2v04iaiaLWVrEDhicQBjP8ymoqJMnqK0bKAyTmNyYEzr7HMs3A/300?wx\_fmt=png&wxfrom=18)

芯片系统成长记

已关注

Like

Share

Popular

Comment

:  ，  ，  ，  ，  ，  ，  ，  ，  ，  ，  ，  ，  .     Video  Mini Program  Like  ，轻点两下取消赞  Wow  ，轻点两下取消在看  Share  Comment  Favorite  听过 

可在「公众号 > 右上角  \> 划线」找到划线过的内容

!\[划线引导图\](https://res.wx.qq.com/op\_res/opqv3ix6k9E4e64 ZzO7uIqE3 ZblwIojfmt7u70m59yS1ylFK-hTu6 Ra8V\_LaWQJ1P4 OlUJPdXLfVBtrm3 TwRrw)

OK

, ,

选择留言身份

**Comment

**

暂无留言

1 comment(s)

已无更多数据

[Send Message](javascript:;)

写留言:

[](javascript:; "轻点两下打开表情键盘")[](javascript:; "轻点两下选择图片")

Close

更多

Close

**

SoC合集

**

Details

更多

Loading...

关闭


## 确认提交投诉

你可以补充投诉原因（选填）

确定