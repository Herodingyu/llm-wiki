---
title: "AI系统-16AI SoC推理芯片架构介绍"
source: "https://zhuanlan.zhihu.com/p/2021601664050667828"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "AI应用在终端设备（手机、汽车、机器人等）上的应用，分为训练和推理两个阶段。 训练一般都在服务器上搞，使用的英伟达的显卡，目前还是可靠的提高超大算力可以买到的途径。训练得到的模型会部署到终端设备上，终…"
tags:
  - "clippings"
---
[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810)

1 人赞同了该文章

![](https://pic2.zhimg.com/v2-0ca8415ee6d8aed2040439150c0bcf17_1440w.jpg)

AI应用在终端设备（手机、汽车、机器人等）上的应用，分为训练和推理两个阶段。

训练一般都在服务器上搞，使用的英伟达的显卡，目前还是可靠的提高超大算力可以买到的途径。训练得到的模型会部署到终端设备上，终端设备利用摄像机、麦克风等传感器捕捉的信息给这个模型进行推理，从而得到智能的结果，例如手机的智能拍照、汽车的自动驾驶等计算。

推理使用的算力小，且定制化比较大，技术难度最低，所以细分的行业领域可以自己去做，例如 [地平线](https://zhida.zhihu.com/search?content_id=272190403&content_type=Article&match_order=1&q=%E5%9C%B0%E5%B9%B3%E7%BA%BF&zhida_source=entity) 和特斯拉的自动驾驶AI芯片，当然英伟达在一些热门的领域也进行了涉足，例如Orin自动驾驶芯片，但是其不像训练芯片那样一家独大。推理技术上最容易，在国内就有爆发的态势，基本有点实力的上市公司都在造AI芯片，其实就是AI推理芯片，当然字节/腾讯/阿里这种巨无霸互联网公司，没什么终端就只能造云端推理或者训练芯片了。

综上，AI推理SoC芯片无疑是目前芯片领域的一个焦点，本文直接从技术角度出发，直接掀桌式解密 [AI SoC芯片](https://zhida.zhihu.com/search?content_id=272190403&content_type=Article&match_order=1&q=AI+SoC%E8%8A%AF%E7%89%87&zhida_source=entity) 架构，干货满满，欢迎分享给好友阅读！

## 1\. AI推理SoC芯片架构

## 1.1 华为达芬奇

参考：ZOMI酱《AI系统》B站视频： [bilibili.com/video/BV1L](https://link.zhihu.com/?target=http%3A//www.bilibili.com/video/BV1Ls) …

之前的文章： [AI系统-15国内AI芯片介绍](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247487277%26idx%3D1%26sn%3Dfa1a9fa9c4c10a200428b760af4be084%26scene%3D21%23wechat_redirect) ，中有介绍过，但是不详细，也没从架构的角度去梳理，这里进行拆解介绍。

![](https://picx.zhimg.com/v2-d67e85eac1565d8e81f1bbea33b8371d_1440w.jpg)

![](https://pic3.zhimg.com/v2-96060c0927ac77221f2328529cfa32ec_1440w.jpg)

从上面两个图可以看到AI芯片的构成：

1. CPU：运行跟用户交互程序，就是AI任务在这里收集，并且发号施令丢给NPU去运算，这里基本为ARM A核CPU
2. NPU：这里的达芬奇AI core就是处理神经网络运算任务的NPU
3. cache：由SRAM组成服务于NPU，存放NPU要运算的数据，比较快，比较贵，M为单位
4. NoC：片上网络，传输速度快
5. DMA：辅助NPU要处理数据的传输，把AI core解放出来，主要用于计算
6. DDR：存放终端收集的数据，例如音视频，速度比SRAM慢但是量大，G为单位，这里也可以用HBM速度更快。
7. 任务调度器TS Core：就是把AI任务进行分片并行分配给NPU进行处理的硬件模块，这里基本为ARM M核或者RISCV
8. ISP：就是DVPP，把视频数据进行预处理，再给NPU去处理
9. SPI flash：存放系统运行的固件程序，通常ARM下就是fip包，M为单位，这个是SoC外的设备，SoC内有控制器
10. UFS：存放linux镜像和文件系统，容量大，是系统内存，G为单位，这个是SoC外的设备，SoC内有控制器
11. 外设：USB、网卡、PCIe、GPIO、I2C、SPI、UART等分为高速和低速设备，这些也是SoC外的设备，SoC内有控制器

## 1.2 特斯拉FSD芯片

参考之前文章： [AI系统-14特斯拉FSD芯片](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247487239%26idx%3D1%26sn%3D705c14f95e9e87a48965634aef99d122%26scene%3D21%23wechat_redirect)

![](https://pic1.zhimg.com/v2-fe9a8164475cad8a4cd94e5ce28f8298_1440w.jpg)

直接来看AI SoC芯片的构成：

1. CPU：使用了 [ARM A78](https://zhida.zhihu.com/search?content_id=272190403&content_type=Article&match_order=1&q=ARM+A78&zhida_source=entity) ，主要负责AI任务的发号施令
2. NPU：使用了两个，对AI任务进行硬件辅助加速计算
3. LPDDR：主存，比较低功耗一些
4. NoC：片上网络，SoC内部最快的通信，主要连接DDR和SRAM大数据传输，以及各种子系统
5. ISP：图形处理，视频数据需要预处理，才能给AI运算
6. VPU：视频编解码，主要是视频数据进行存储及上传云端的时候需要进行压缩解压处理，这里也就是用户的数据会传回给产品公司，产公司利用这些数据去训练更大更好用的模型，AI下半场拼的就是谁家的数据多，算法强，更准确。
7. 视频接口：就是摄像头跟SoC的接口，一般使用MIPI把视频数据从Camera传给SoC，ISP对数据进行预处理，就丢给NPU去推理了。同时VPU也会把一些数据通过5G上传云端。
8. 功能安全子系统：FSI，在汽车领域强调安全，这个模块主要就是对SoC进行功能失效检查，并及时的补救
9. 信息安全子系统：就是HSM，集成一些数据加解密模块，用于安全验证，例如安全启动验证，以及用户核心数据（密码登）的验证。
10. GPU：这个之后被去掉了，估计是初期NPU搞不定，跟英伟达合作，学了些东西就抛弃了

## 1.3英伟达Origin

参考： [NVIDIA ADAS-英伟达Orin芯片介绍](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485050%26idx%3D1%26sn%3D8fa0d94f783e93aaf4ccb4f7b26e117a%26scene%3D21%23wechat_redirect)

以及： [nvidia.com/content/dam](https://link.zhihu.com/?target=http%3A//www.nvidia.com/content/dam) …

![](https://pic1.zhimg.com/v2-a13456e867046cd3294feef96f3e3400_1440w.jpg)

![](https://pica.zhimg.com/v2-6780558b6f6a96c58a442c51a272ce72_1440w.jpg)

![](https://pic1.zhimg.com/v2-45f8cd6a4af4b458a4567096c94f722a_1440w.jpg)

通过上面上个图，直接解析其组成：

1. CPU：使用了A78E，这个是ARM专门为汽车搞的安全架构A核，软件RTOS应该用了QNX BSP
2. GPU：使用了Tensor Cores，其实这里是GPU里面的特色核，进行了定制就不是通过的GPU了，算NPU了
3. Cache：多级cache，跟CPU的设计思路类似
4. [LPDDR5](https://zhida.zhihu.com/search?content_id=272190403&content_type=Article&match_order=1&q=LPDDR5&zhida_source=entity) ：主存
5. [QSPI FLASH](https://zhida.zhihu.com/search?content_id=272190403&content_type=Article&match_order=1&q=QSPI+FLASH&zhida_source=entity) ：固件存储
6. Memory Controller Fabric：内存访问管理，其没有用到高效的NoC还是GPU的思路就是使用各种缓存，数据直接使用DDR里面的，这里做了一个通路
7. ISP：图像预处理
8. 电源管理系统：clock、reset、电源监测
9. FSI：功能安全，使用了ARM R52核，达到ASIL D等级
10. 信息安全：HSM也使用了ARM R52，主要管理加解密硬件和信任根eFUse等
11. AUTOSAR：车控相关系统
12. Hypervisor：因为是异构核里面运行了多个OS，例如QNX和AUTOSAR OS，需要使用虚拟机
13. 高低速外设：PCIe/CAN/SPI/I2C/GPIO/UART控制器

## 2\. AI推理芯片SoC设计

如果设计一个AI SoC首先就根据需求分模块，首先看看我们需要什么。

1. CPU根据性能和安全需求进行选择
2. 例如图像处理，那就需要ISP、NPU、VPU
3. 如果需要功能安全就用FSI
4. 如果需要信息安全就要有HSM
5. 多个子系统的电源管理和系统控制独立出来就需要SCP
6. 存储就需要UFS、SPI FLASH、DDR、SRAM等
7. 通信就是NoC、AXI等各种通信总线把这些子模块连起来
8. 异构核业务子系统，例如汽车里面的AUTOSAR，总之把产品的所有系统集成到一个SoC最好，这就是产品级别的电子架构升级

上面提到的每一个子系统在实际的研发中就可能是一个团队，就算一篇文章介绍一个也只是粗略的皮毛，后续将尝试进行一个介绍。这里先看下整体上通用芯片设计中需要关注的一些点。

## 2.1 Memory Mapping

![](https://pica.zhimg.com/v2-0531c60ef62fd87a5bcd665acdc5b6c6_1440w.jpg)

作为软件工程师，看到的硬件最直观的就是 **寄存器地址** ，那这些地址是怎么统一规划的，每个子系统基于基地址的偏移都是什么含义，这就需要看芯片手册了。

> 一般芯片会提供3个手册

1. 用户手册（User Manual）：使用环境搭建，烧写软件等，介绍怎么使用这个系统，不涉及编码和编译。
2. 开发手册（Develop Manual）：sdk代码框架介绍，编译，各种模块的配置修改方法
3. 技术参考手册（Reference Manual）：整体芯片参数，寄存器描述

Memory Mapping地址映射就是来 **规划整个系统地址的使用的** ，就像整个系统的门牌号：

1. 规定了那段地址归哪个子系统使用的，子系统内部也有内存布局
2. 不同的子系统看到的地址可能不一样
3. 出于系统安全的需求，地址分为安全世界和非安全世界
4. 地址开头都是一些cfg配置相关，然后是SRAM等存储相关，最后是DDR内存相关的地址
5. 一般的地址分为devices属性和memory属性，由一定的硬件例如MPU、TCM去控制访问关于 **存储** 的一些设置如下：
- **SRAM**  
	要比DDR更加的高效，一般的子系统核周围根据需求都配置的有，用于固件存储运行，共享内存、核间通信，信息调度中转，休眠存储信息等功能使用。
- **efuse**  
	是一次性编程存储，用于存放密钥
- **LPDDR**  
	低功耗双倍速率动态随机存取存储器
- **Flash**  
	存储器
- **UFS**  
	，存放系统程序，及应用数据
- **TCM**  
	：在ARMCortex处理器中，TCM是一种位于处理器核心旁边的高速存储器，设计目的是提供低延迟和高带宽的内存访问性能。它与处理器内核紧密耦合，因此访问TCM中的存储器通常比访问普通RAM或缓存中的存储器要快。
- **MMU**  
	用于地址映射
- **DDR**  
	交织：把连续的地址分配到不同的DDR颗粒上，这样提高DDR的带宽和利用率

对于32bit和64bit异构处理器看到的地址范围是不一样的，所以需要进行不同的映射。

## 2.2 SoC片内通信

### 2.2.1 总线发展介绍

![](https://pic3.zhimg.com/v2-d5c2686a81324a70319cd5e98a8904d0_1440w.jpg)

数据的流动主要借助了片上系统中的 **I/O总线** ，例如上图中Arm提供的 **AMBA标准** 。采用DMA控制器则可以让外部数据直接被传送到存储器，无需经过中央处理器，这可以大大改善数据吞吐的效率。

最近10年来，SoC设计的一个趋势是采用 **基于网络的拓扑结构，来提高片上通信的效率** 。这种基于路由的数据包互连网络称为“片上网络“(**NoC**)，可以克服基于传统总线网络的带宽瓶颈。

片上网络(NoC)相比传统的总线接口通信有什么优点和缺点?

SoC所包含的IP模块数量不断增加，同时片上服务质量(QoS)、仲裁和数据流优化的复杂性越来越高， **NoC逐渐取代总线和交叉开关(crossbar)，而成为片上互连的行业标准** 。总线是共享的通信资源，除了最简单的系统之外，总线无法提供系统所需的带宽。交叉开关虽然可以提供足够带宽，但是其大小随着所连接的IP模块数量成倍增长，并且大型的交叉开关根本无法构建。它们都不能很好地利用布线，而布线可是当今芯片技术中最为昂贵的东西。NoC可以 **极大地减少裸片面积** (尤其是更少的布线)， **功耗更低** ，而且可以对片上数据流和服务质量进行微调优化，甚至可以提供数据保护功能以提高整个系统的功能安全性。

总线是系统级芯片发展的早期阶段所采用的标准，那时连接的IP模块(CPU、存储器和外围控制器等)可能不超过20个。然而，随着更多IP模块连接到总线，它们 **开始争夺优先级和可用的带宽** 。总线需要集中的仲裁器和地址解码逻辑，而随着主机和从机数量的增加，大家竞争同一条总线资源，这反而成了SoC性能的瓶颈。

- NOC总线可以通过AXI、APB等跟子系统相连。通过总线访问数据对于多核就有数据一致性问题，后面搞个专题讲下。这里最典型的就是A核的多核通过NOC访问其他硬件例如LPDDR、SRAM等，就需要在A核和NOC中间加一个硬件模块，例如CMN600AE。
- 对于对带宽要求高的子系统，例如AI子系统需要处理大量的摄像头等多媒体数据，需要独立的专用通道连接到NoC上面，避免跟其他子系统进行争抢NoC资源。
- 通过NoC可以访问配置寄存器和数据寄存器。例如在A核中去访问ISP的寄存器就需要通过NoC了

### 2.2.2 ARM自家的CI-700和Arteris的NoC

NoC从结构上分为Request Path和Response Path，每个Patch内部分为NIU、switch、link、reorder buffer等，这里举例两种常用的方案 **ARM自家的CI-700和Arteris的NoC**

参考： [blog.csdn.net/ygyglg/ar](https://link.zhihu.com/?target=http%3A//blog.csdn.net/ygyglg/arti) …

![](https://pic4.zhimg.com/v2-e1e11ed0c307adb125a508f82ece5a61_1440w.jpg)

**ARM的CI-700：**

- [AMBA 5 CHI互连](https://zhida.zhihu.com/search?content_id=272190403&content_type=Article&match_order=1&q=AMBA+5+CHI%E4%BA%92%E8%BF%9E&zhida_source=entity) ：CI-700是一种基于AMBA 5 CHI（Coherent Hub Interface）的互连技术，专为移动和客户端SoC设计，提供高性能和低功耗的解决方案。
- 可定制的网状拓扑结构：CI-700支持可定制的网状拓扑结构，允许设计者根据SoC的具体需求来优化网络结构，以实现最佳的性能和功耗平衡。
- 支持 [Armv9处理器](https://zhida.zhihu.com/search?content_id=272190403&content_type=Article&match_order=1&q=Armv9%E5%A4%84%E7%90%86%E5%99%A8&zhida_source=entity) 设计：CI-700与Armv9处理器架构兼容，能够支持新一代的高性能计算需求。
- 系统级缓存：CI-700引入了系统级缓存的概念，可以提高数据传输效率，减少对外部存储器的访问，从而降低系统功耗。
![](https://pic3.zhimg.com/v2-4db632b19adf51afbae4d886fc889798_1440w.jpg)

**Arteris的NoC：**

- FlexNoC 5：Arteris的NoC技术以FlexNoC 5为代表，是一种不可或缺的IP生成器，用于高效、高性能的NoC设计。
- 物理感知：FlexNoC 5具有先进的物理感知能力，可以在设计周期早期提供直观的设计反馈，加速时序收敛，减少面积，并为物理布局团队提供良好的起点。
- 支持多种协议：Arteris的NoC支持多种协议，包括AMBA 5 ACE-Lite、AHB、AXI等，使得IP块之间的互操作性更加灵活。
- 功能安全：FlexNoC 5提供了FuSa选项，支持高达ASIL D级别的功能安全，适用于需要高安全性的汽车和工业应用。

对比总结

- 设计理念：CI-700注重于为移动和客户端SoC提供定制化的互连解决方案，而Arteris的NoC更侧重于提供灵活、可配置的网络互连技术，适用于多种应用场景。
- 性能与功耗：CI-700通过系统级缓存和网状拓扑结构优化性能和功耗，而Arteris的NoC通过物理感知和多协议支持来提升性能和降低功耗。
- 功能安全：Arteris的NoC提供了功能安全支持，这对于汽车和工业应用尤为重要，而CI-700虽然也关注安全性，但未明确提及功能安全支持。
- 互操作性：Arteris的NoC支持更广泛的协议，这使得它能够更容易地与不同的IP块进行互操作，而CI-700则专注于与Arm处理器架构的兼容性。
- 在选择适合的片上网络互连技术时，设计者需要根据SoC的具体需求、预期的应用场景以及对性能、功耗和安全性的要求来做出决策。

ARM的CI-700和Arteris的NoC都是为SoC设计提供的片上网络互连解决方案，但它们在设计理念和目标应用方面存在一些差异。

CI-700是基于ARM的AMBA 5 CHI互连标准设计的，专为移动和客户端SoC应用场景优化。它具有可定制的网状拓扑结构，能够根据SoC的需求调整网络结构，以达到高性能和低功耗的目标。CI-700与ARMv9处理器架构兼容，支持新一代的计算需求，并引入了系统级缓存来提高数据传输效率和降低系统功耗。

另一方面，Arteris的NoC，特别是FlexNoC 5，是一种高效、高性能的NoC设计，具有物理感知能力，可以在设计早期提供直观的反馈，帮助优化互连结构，减少开发时间和芯片面积，同时降低功耗。Arteris的NoC支持多种协议，包括AMBA 5，并且提供了功能安全支持，适用于需要高安全性的汽车和工业应用。

总的来说，CI-700更侧重于与ARM处理器架构的紧密集成和为移动SoC提供优化的解决方案，而Arteris的NoC提供了更广泛的协议支持和功能安全特性，适用于多种不同的应用场景。设计者在选择片上网络互连技术时，应根据项目的具体需求和目标应用来决定使用哪种技术。

ARM的手册是公开的：

[developer.arm.com/searc](https://link.zhihu.com/?target=http%3A//developer.arm.com/search%23numb) …

Arteris的需要注册账号下载。

## 2.3时钟和复位

时钟是由 **PLL** 产生的，

- 不同的子系统需要的时钟频率不同，就需要多个PLL。
- 对于FSI等有功能安全需求的模块需要单独的PLL
- 对于AON域的模块也需要单独的PLL，因为系统休眠的时候还需要单独运行
- DDR作为高速接口对稳定性要求高且内部结构复杂需要走线比较多而产生信号干扰，从而影响稳定性，需要多个PLL分开提供时钟，防止时钟偏斜和有更强的时钟供应灵活性
- PLL存在于CRU中，是CRU的一部分

对于 **电源域和电压源** ：

- 根据不同的电压设计电压域
- 根据不同的子系统功能设计电源域
- AON（Always on）是不断电的区域
- PIMC控制电源的开关

**复位** ：

- CRU控制，一个子系统例如FSI、SCP对内部的硬件模块有独立的CRU去控制，对其寄存器操作就可以
- 整个芯片系统有一个TOP CRU对各个子系统进行复位控制
- DDR有多个PLL控制，也有多个CRU控制复位状态，更加的灵活
- CRU中有PoR（Power-On Reset，上电复位）监控电源
- 整机复位由外部按钮或者特殊的GPIO信号等触发，也可以由寄存器的软复位触发，除非的子系统需要高级的权限，例如只能FSI或者SCP触发，A核和其他子系统不能触发。
- 看门狗WDT也可以触发复位

对于不同的电源模式，例如休眠模式、节能模式、关机模式等都需要关闭一些硬件功能，这时就需要使用CRU去控制这些硬件的时钟和复位信号了。对于安全复位需要先清空应用数据，特别是NoC总线上传输的数据后再进行复位操作。

ARM方案中，通常PLL集成在SCP子系统中，就是System Control Processer，系统级别的控制，去控制各个子系统的的时钟和复位操作。同时系统的休眠唤醒也主要在SCP中独立完成。当然如果不要SCP做到ATF的BL31里面也是可以的。

> 这里面对不同的场景有不同的解决方案，其实电源管理、信息安全HSM、功能安全FSI，分散在三个小核上，完全可以使用一个或者两个进行统一，不过这是对软硬件和安全的挑战，处理好也是可以的。

下面以集成SCP的系统为例：

**对于SoC的休眠：**

- A核需要把自己的数据和程序保存到DDR中
- DDR training数据保存到AON的SRAM里面
- 系统重要的数据也保存到AON的SRAM里面
- 主控核（一般是A核）通知其他子系统进入休眠
- SCP控制PPU进入低功耗状态
- SCP控制PMIC对一些硬件断电
- SCP控制PLL关闭部分时钟
- SCP自己进入WFE低功耗模式等待唤醒

**唤醒：**

- 唤醒源唤醒SCP退出WFE
- SCP控制PPL提供时钟
- SCP控制PMIC上电
- SCP控制PPU退出低功耗模式
- SCP通知主控核退出休眠
- 主控核通知其他子系统退出休眠
- DDR恢复现场继续运行

**上下电时序：**

- 根据电压域进行上电的顺序
- 必须严格按照顺序上电启动，时间间隔需要满足需求

安全复位：对子系统的安全复位需求清空其总线上通信的数据和子系统内部的安全关闭，这里以NoC清空为例：

1. 首先SCP需要发起其要复位子系统的NoC清空请求
2. NoC回复同意Ack后，则SCP就可以进行复位了 其他ADB/APB LPI Q-channel清空类似的操作。

**子系统内部安全复位**

- 需要核进入WFI后再复位，这样WFI情况下，大部分时钟已关闭，可以进行安全复位
- 或者核通过LPI总线控制自己进入低功耗模式再关闭，这样避免系统错误

## 2.4 MailBox通信

参考之前的文章： [SoC软件技术--核间通信](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485453%26idx%3D1%26sn%3D3695bfdaa107d4f0b834b03c3975047f%26scene%3D21%23wechat_redirect)

[电源管理入门-5 arm-scmi和mailbox核间通信](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247484716%26idx%3D2%26sn%3D5b68f1dd7fe42a7a8d293d462fb9f205%26scene%3D21%23wechat_redirect)

NoC解决了硬件模块的通信访问机制，就是某个子系统核去访问某个位置。但是多个子系统协同工作就需要告诉对方去访问那个位置。这就是 **核间通信MailBox，准确来说是告知** ，因为数据并不是直接发过去，而是放某个地方，告知对方来取。

1. 数据放某个地方，一般是共享内存，或者MailBox硬件内部
2. 通过硬件的中断连线触发对方中断告知

一个MailBox有很多个 **Channel** 通路，可以支持很多条通信的路同时工作。通路也分安全通路和非安全通路，接收者需要对这两种消息进行分类处理，例如非安全通路发来了安全的请求就可以丢弃。

## 2.5 子系统主要硬件模块

SoC中的每个子系统，例如SCP、FSI、HSM，以及业务的ISP、NPU、VPU都是有自己的核和OS的，围绕着核周围就需要硬件的设计，还有对应的业务需要外设

### 2.5.1 中断控制

对于 **异构核** ，例如A核（GIC）、M核（NVIC）、R核（GIC）、RISC-V核（PLIC）等，都有自己的 **中断控制器硬件** 。

芯片手册需要提供各个核的 **中断向量表** ，方便软件进行功能开发。软件debug的时候经常需要利用中断号来定位是那个模块出问题了。

### 2.5.2 DMA硬件

**DMA** 可以通过AXI、APB等接口连接到总线上。一般需要大量数据搬运的需要加上DMA硬件，例如A核和NPU等。

### 2.5.3 看门狗WDT

各个子系统内部都需要内置WDT，防止子系统死机的时候进行复位，或者上报事件给安全中心去处理。

一般WDT支持两级事件。第一级是子系统自己去处理，第二级是子系统已经死了，没有处理能力的时候，上报给外部系统处理。

### 2.5.4 Timer

为了实现定时中断和延时等时间有关的功能，需要子系统内置 **Timer硬件** 。

### 2.5.4 RTC

实时时钟（ **Real-Time Clock** ）提供时钟日历功能

### 2.5.5 调试与跟踪

一般需要上位机通过 **JTAG或者USB** 对芯片进行调试与跟踪

1. 调试架构
- **ARM CoreSight**  
	：ARM CoreSight是ARM提供的一套高级的调试和跟踪技术，专为复杂SoC设计而打造。其中，SoC-400是这一技术系列中的一个解决方案，提供系统级的调试和跟踪能力，支持多核和跨SoC调试，具有断点、观察点等高级调试功能，并能跟踪处理器的指令流、数据流和系统事件。
1. 调试工具
- **JTAG/SWD接口**  
	：JTAG（Joint Test Action Group）和SWD（Single Wire Debug）是两种常用的调试接口，允许开发人员通过边界扫描或单线调试连接来访问SoC的内部寄存器、内存和执行调试操作。
- **调试器**  
	：专业的调试器软件，如ARM的Keil MDK、IAR Embedded Workbench等，提供了图形化的调试界面，支持断点设置、单步执行、变量查看等调试功能。
1. 跟踪技术
- **指令跟踪**  
	：跟踪SoC中处理器的指令执行序列，有助于理解程序的执行流程和性能瓶颈。
- **数据流跟踪**  
	：跟踪处理器间或处理器与外部设备间的数据传输，帮助识别数据路径中的错误或性能问题。
- **系统事件跟踪**  
	：记录SoC中的系统事件，如中断、异常、DMA传输等，以便在调试时分析系统的行为。

### 2.5.6 PVT

PVT用于 **感知芯片的工艺变化和操作环境，包含以下几种传感器** ：

- Thermal Sensing（TS）：热传感，精度高，集成方便。支持功率优化和可靠性
- Distributed Thermal Sensing（DTS）：分布式热传感。支持thermal mapping，高度精细的布放，低延时
- Supply Monitoring（VM）：供电监控，测量多个域的电源电压、验证配电网络、实施静态和动态IR压降分析
- Process Monitoring（PD）：工艺监控，在大规模量产或者单个芯片生命周期，了解硅片速度变化（slow，fast，typical）。提供功率优化和老化监控

PVT-Controller对PVT温度数据进行采集后，会产生中断来获取温度数据，如果温度数据超标会继续上报给更高级的子系统例如FSI去决策，这时FSI可能令系统关机。

### 2.5.7 pinctrl引脚复用

芯片需要提供 **pin引脚复用规则** 。

大多数 SOC的 pin都是支持复用的，比如 I.MX6ULL的 GPIO1\_IO03既可以作为普通的GPIO使用，也可以作为 I2C1的 SDA等等。此外我们还需要配置 pin的电气特性，比如上 /下拉、速度、驱动能力等等。传统的配置 pin的方式就是直接操作相应的寄存器，但是这种配置方式比较繁琐、而且容易出问题 (比如 pin功能冲突 )。pinctrl子系统就是为了解决这个问题而引入的， pinctrl子系统主要工作 内容如下：

1. 获取设备树中 pin信息。
2. 根据获取到的 pin信息来设置 pin的复用功能
3. 根据获取到的 pin信息来设置 pin的电气特性，比如上 /下拉、速度、驱动能力等。

对于我们使用者来讲，只需要在设备树里面设置好某个 pin的相关属性即可，其他的初始化工作均由 pinctrl子系统来完成， linux中pinctrl子系统源码目录为 drivers/pinctrl。

### 2.5.8 SRAM

SRAM是比较快的存储方法，可以用做：

1. 固件运行的位置，包括各种程序段、数据段，堆栈等
2. 共享内存可以使用
3. 存放系统数据，例如warm reboot参数、一些配置等
4. 休眠时需要保存数据，这需要在AON的SRAM上使用

## 2.6安全设计

**TrustZone** 将系统的资源（通过寄存器地址）划分为 **安全世界和非安全世界** 。

一些硬件和数据只能安全世界去访问，Linux应用里面不能直接访问，必须通过系统调用到内核然后再到BL31或者SCP等安全子系统去执行安全寄存器的操作。这样linux应用只能访问到固定的接口，而不是暴露所有的寄存器，从而安全。

- BL31和OPTEE是安全世界
- SCP和FSI是安全世界
- DDR和SRAM可以部分是安全世界地址，部分是非安全的，需要硬件例如TZC或者APB Filter进行配置保护。
- NoC中区分了Secure slave和non-Secure slave
- DMA可以配置是否访问安全空间

## 2.7 SoC启动设计

### 2.7.1 安全启动介绍

可以参考之前的文章：

1. 安全启动 secureboot入门-8硬件杂谈和汇总
2. ATF：ATF入门-4BL31启动流程分析 等

这部分就是 **安全启动** 了，

- 需要支持ATF密码验签流程和BL1从芯片中的ROM启动。
- 对于验签需要CM硬件模块的支持。
- BootROM的启动有启动模式，可以通过efuse和pin进行配置。
- 密钥存储需要eFUSE支持
- fip包存储需要UFS的QSPI FLASH支持
- 支持XIP、安全恢复、安全配置、安全调试、诊断等模式
- 支持AB分区、生命周期管理、启动日志等功能

常见的拨码开关，pin配置：

1. 强制恢复模式：从UFS中启动
2. USB启动模式：从USB下载启动
3. XIP启动：eXecute In Place（芯片内执行）启动方式，是指芯片能够直接在非易失性存储器（如Flash）中执行程序代码，而无需将代码先复制到RAM（随机存取存储器）中。

### 2.7.2 启动示例

![](https://pic4.zhimg.com/v2-ac00dae1b82aea31934ed02d488ddb41_1440w.jpg)

上图是基于ARM SCP启动SoC的一个流程图：

**SCP\_BL1 boot 流程：**

系统启动，首先运行scp\_romfw firmware代码。执行scp应用初始化流程的初始流程fwk\_arch\_init（），按照Firmware.cmake中定义的module顺序进行初始化，中断初始化，module启动，这些完成后会循环调用处理运行时event消息。

**ATF中BL2加载SCP\_BL2：**

TF(Trusted Firmware)是ARM在Armv8引入的安全解决方案，为安全提供了整体解决方案。它包括启动和运行过程中的特权级划分。ATF BL2的主要职责就是将后续固件如u-boot。kernel，SCP或者其他异构核的固件，加载到ram中。SCP firmware的加载及boot 由arm Arm Trusted Firmware-A (TF-A)来完成。

SCP用于电源，时钟，复位和系统控制。BL2将可选的SCP\_BL2镜像从平台存储设备加载到特定的安全内存区域。SCP\_BL2的后续处理是特定于具体平台的，需要自行实现。例如，Arm juno ：

- BL2先把SCP\_BL2加载到trust sram，
- 再使用Boot Over MHU (BOM) 协议，把SCP\_BL2加载到 SCP的内部RAM之后，
- SCP运行SCP\_BL2，
- SCP给AP发出signals，通知BL2继续执行。

ATF中，BL2的编译选项在如下位置定义plat/arm/board/juno/platform.mk中的BL2\_SOURCES，morello ATF plat/arm/board/morello/platform.mk中未定义BL2\_SOURCES，不包含BL2.是否包含BL2相关通用代码及配置由CSS\_LOAD\_SCP\_IMAGES决定 关于SCP代码分析可以参考： [ARM SCP入门-framework框架代码分析](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247484453%26idx%3D1%26sn%3D2ffa12dee95867544bb54b430d6cd5f4%26scene%3D21%23wechat_redirect)

> 后记：  
> AI SoC芯片里面的内容很多，大公司花费数亿经费才可以搞的起，需要庞大的团队，里面的软硬件研发很复杂，后续的文章开始一一进行介绍，先从王炸NPU开始介绍，敬请期待。

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位有自己公众号的留言： **申请转载** ！

纯干货持续更新，欢迎 **分享给朋友** 、 **点赞、收藏、在看、划线和评论交流** ！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

发布于 2026-03-29 14:57・上海