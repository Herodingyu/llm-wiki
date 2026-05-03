---
title: "SoC入门-2芯片研究框架（下）"
source: "https://zhuanlan.zhihu.com/p/2019715322362470808"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "本文是下篇，主要集中在 汽车SoC芯片和终端SoC芯片上的介绍，上篇参考之前的：SoC入门-1芯片研究框架（上）参考海通国际的研报《芯片研究框架》，pdf下载： https://pdf.dfcfw.com/pdf/H3_AP202209091578190354_1.…"
tags:
  - "clippings"
---
[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810)

1 人赞同了该文章

![](https://pica.zhimg.com/v2-6a105d29e58c2e6e4928982038d4599a_1440w.jpg)

本文是下篇，主要集中在 **[汽车SoC](https://zhida.zhihu.com/search?content_id=271914456&content_type=Article&match_order=1&q=%E6%B1%BD%E8%BD%A6SoC&zhida_source=entity) 芯片** 和 **终端SoC芯片** 上的介绍，上篇参考之前的： [SoC入门-1芯片研究框架（上）](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247486009%26idx%3D1%26sn%3Db1f5e247bb43fa7c60b48f8a43ec5e6a%26chksm%3Dfa528c1dcd25050b0625ab7318d043c7dcedd382916180b60c156773ecb4c3455a3000981904%26scene%3D21%23wechat_redirect)

参考海通国际的研报《芯片研究框架》，pdf下载：

[pdf.dfcfw.com/pdf/H3\_AP](https://link.zhihu.com/?target=https%3A//pdf.dfcfw.com/pdf/H3_AP202209091578190354_1.pdf%3F1662756207000.pdf)

## 3\. 汽车芯片的高算力

> 26.汽车芯片的类型有哪些？

![](https://pic1.zhimg.com/v2-2bc914f51e9358e4fe09ebed8c24bf60_1440w.jpg)

汽车半导体涵盖了汽车芯片、功率器件、传感器等重要电子零部件。汽车的计算芯片包括传统的 [MCU芯片](https://zhida.zhihu.com/search?content_id=271914456&content_type=Article&match_order=1&q=MCU%E8%8A%AF%E7%89%87&zhida_source=entity) 和SoC芯片。MCU芯片一般包含CPU一个处理器单元；而汽车SoC一般包含多个处理单元。

[ECU](https://zhida.zhihu.com/search?content_id=271914456&content_type=Article&match_order=1&q=ECU&zhida_source=entity) （Electronic Control Unit）即电子控制单元，随着汽车市场规模的逐渐扩大，ECU需求迅速上升，带动MCU芯片需求 持续增加。需求的推动加上芯片产能不足导致近期汽车MCU芯片供不应求。

随着汽车算法算力和交互效率的不断提升，汽车电子不断发展，倒逼MCU芯片升级为SoC芯以承载大量非结构化算力需 求。汽车SoC一般应用于高级驾驶辅助系统([ADAS](https://zhida.zhihu.com/search?content_id=271914456&content_type=Article&match_order=1&q=ADAS&zhida_source=entity))、自动驾驶两大领域。

![](https://pica.zhimg.com/v2-26e537dfeef62a539bcf5c63c02f1180_1440w.jpg)

> 27.为什么汽车电子迫切需要异构核SoC？

在传统汽车分布式E/E架构（汽车电子电气架构）下，ECU相互孤立，车载功能的升级依赖ECU数量的增加。随着汽车电 子智能化、自动化的发展，ECU在算法算力、数量、总线长、软件开发模式、生产成本等方面受到阻碍。

随着计算芯片的算力需求大幅提升，汽车E/E架构向集中化趋势发展，也对芯片提出了更高要求。 [特斯拉Model3](https://zhida.zhihu.com/search?content_id=271914456&content_type=Article&match_order=1&q=%E7%89%B9%E6%96%AF%E6%8B%89Model3&zhida_source=entity) 中央集 成化的发展将多个ECU功能整合在一起，逐步实现一台嵌入式高性能计算机统一控制多项功能。在新架构下，不同ECU对 应的算法可实现整合，开发流程和成本可大幅缩短，高算力需求向中央集成化的“车-云计算”方向发展演变，快速反映 仍需要分布式架构辅助。

![](https://pic3.zhimg.com/v2-b476b9dff3e98bfd52f5ad34208c2330_1440w.jpg)

> 28.汽车产业链分类及产业分布如何？

![](https://pic1.zhimg.com/v2-bd4722e3c64593b0bb486f88ebbd905c_1440w.jpg)

汽车电子产业链：上游为芯片厂商及电子元器件厂商；下游为整车厂(OEM)；中游为汽车电子生产和制造商。中游厂商 中，欧美日等发达国家汽车产业起步时间早，占据优势，市场集中度高，国内汽车电子发展潜力巨大。2018年，三巨头 [博世](https://zhida.zhihu.com/search?content_id=271914456&content_type=Article&match_order=1&q=%E5%8D%9A%E4%B8%96&zhida_source=entity) 、 [大陆](https://zhida.zhihu.com/search?content_id=271914456&content_type=Article&match_order=1&q=%E5%A4%A7%E9%99%86&zhida_source=entity) 、 [电装](https://zhida.zhihu.com/search?content_id=271914456&content_type=Article&match_order=1&q=%E7%94%B5%E8%A3%85&zhida_source=entity) 的市场份额占比最高，合计达51%，全球CR10为74%，竞争格局集中。

![](https://pic4.zhimg.com/v2-283493190247a25eba5e6d2a00f302df_1440w.jpg)

国产替代：智能座舱、自动驾驶领域的高级芯片SoC市场，是目前全球玩家争夺的终端，国内创业公司有望占领市场份 额。受益于无人驾驶技术，国内汽车电子厂商可以跳过传统Tier 1厂商，直接对接主机厂。当前，除了英伟达、高通、华 为等消费电子巨头，还有以技术取胜的中国本土创业公司如 [地平线](https://zhida.zhihu.com/search?content_id=271914456&content_type=Article&match_order=1&q=%E5%9C%B0%E5%B9%B3%E7%BA%BF&zhida_source=entity) 、 [芯驰科技](https://zhida.zhihu.com/search?content_id=271914456&content_type=Article&match_order=1&q=%E8%8A%AF%E9%A9%B0%E7%A7%91%E6%8A%80&zhida_source=entity) 、 [黑芝麻](https://zhida.zhihu.com/search?content_id=271914456&content_type=Article&match_order=1&q=%E9%BB%91%E8%8A%9D%E9%BA%BB&zhida_source=entity) 等半导体公司加入汽车SoC市场的 争夺，虽面临车规级认证和目前车厂开发架构兼容性的障碍，但未来发展潜力巨大。

2020年汽车电子占整车比重将 达到50%，目前汽车电子在纯电动汽车中国占比最高（65%），随着未来新能源汽车的成熟和普及，汽车电子渗透率有望继续提高。

> 29.座舱SoC芯片解决那些问题？

![](https://pic1.zhimg.com/v2-a51b0bfd1992eb8ed01a042ac4094c62_1440w.jpg)

汽车电子逐渐向自动化、智能化和网联化发展，拉动汽车SOC市场需求。随着汽车座舱技术不断进步，汽车电子人机 交互、一芯多屏和平台化发展成为重要技术趋势。交互系统、操作系统及车载娱乐是汽车SoC的核心组成。

在驾驶体验升级的同时，消费者对车载娱乐的需求日益强烈，车载娱乐系统作为人机交互的端口拥有广阔的市场空间。车载娱乐系统功能的增加对主控SoC的性能提出更高要求。

![](https://pic3.zhimg.com/v2-f7cd17efb0852664e87fda36459475c4_1440w.jpg)

> 30.汽车AI芯片主要厂商及发展如何？

![](https://pic2.zhimg.com/v2-0b1ee890db4967ddde8b9c54b4dede35_1440w.jpg)

自动驾驶领域，车载AI芯片快速发展，算力、功耗、生态等成 为各厂商竞争车载AI领域的核心竞争力。NIVIDA具备完善的软 件工具和应用生态，深入布局AI SoC； [Mobileye](https://zhida.zhihu.com/search?content_id=271914456&content_type=Article&match_order=1&q=Mobileye&zhida_source=entity) （英特尔收 购）凭借一体式解决方案和自动驾驶平台在AI领域占有一定份 额；国内企业如地平线、黑芝麻、华为等发展迅猛，形成了自 身的核心竞争力，有望逐步实现国产替代。

![](https://picx.zhimg.com/v2-8b9413f5d358305a7c25381503ba904f_1440w.jpg)

![](https://pic4.zhimg.com/v2-157dd588c0f5f87511f8764fbc19793b_1440w.jpg)

## 4\. SoC终端在终端中的应用

> 31.手机SoC厂商主要有哪些？

![](https://pic4.zhimg.com/v2-134bf6a07ea072fdc31d6e94df3a073d_1440w.jpg)

智能手机是SoC最大的应用市场。智能手机CPU都基于 [Arm架构](https://zhida.zhihu.com/search?content_id=271914456&content_type=Article&match_order=1&q=Arm%E6%9E%B6%E6%9E%84&zhida_source=entity) ，通常以八核、六核的配置出现，其中大核具有强大性 能，满足多种应用程序运行需求，小核则平衡发热和耗电问题。目前，最常用的智能手机CPU有苹果A系，骁龙系列， 三星猎户座，华为海思麒麟，联发科以及小米的澎湃系列等。

手机SoC领域中主要GPU为Arm的Mali，高通Adreno，以及苹果GPU。

> 32.手机中的AI模块有哪些？

![](https://pica.zhimg.com/v2-449768b85a75e04f6b1065793c82be58_1440w.jpg)

智能手机中加入的专用AI模块能够在图像处理、语音助手、电池管理等方面 提供硬件加速支持。

华为和苹果均搭载了嵌入式神经网络处理单元（NPU），专用于处理AI计 算。华为最早在Mate10采用外挂的寒武纪NPU，后在990系列上采用自研的 达芬奇NPU。苹果从A11 SoC开始加入Neural engine，最新公布的A14 SoC 中，NPU算力已有巨大提升，Neural engine结合CPU上的机器学习加速器能 够大大提高AI应用体验。

![](https://picx.zhimg.com/v2-3849f345bd75de641703285af9e93d31_1440w.jpg)

![](https://pic2.zhimg.com/v2-29dfcca125a2d7e4deff9b8d5fa6e9dd_1440w.jpg)

> 33.苹果笔记本电脑中的SoC构成？

![](https://pica.zhimg.com/v2-6b867241bbde51fc5d194aa09ec73612_1440w.jpg)

在Arm、高通、苹果及微软等厂商的推动下，基于Arm的SoC在笔记本电脑市场的空间进一步打开。苹果于2020年11月推出 的 [M1芯片](https://zhida.zhihu.com/search?content_id=271914456&content_type=Article&match_order=1&q=M1%E8%8A%AF%E7%89%87&zhida_source=entity) 是苹果第一款基于ARM指令结构的笔记本/台式电脑SoC。M1SoC的中央处理器有四个高性能核心和四个低功耗 核心，极大程度优化了能效比，并采用苹果16 核NPU，能大幅提升ML应用的处理和计算速度。微软2019年10月发布的 Surface Pro X笔记本首次搭载 [ARM架构](https://zhida.zhihu.com/search?content_id=271914456&content_type=Article&match_order=1&q=ARM%E6%9E%B6%E6%9E%84&zhida_source=entity) 高通定制版 Microsoft SQ 1 处理器。ARM架构能够进一步满足笔记本轻薄、高续航等 方面需求，优化手机、电脑的协同性，将是笔记本SoC未来发展的重要趋势。

> 34.服务器中的SoC需求及分类有哪些？

![](https://pic4.zhimg.com/v2-0747292575e080777eb0fc741c007773_1440w.jpg)

服务器根据体系结构可分成IA架构服务器和RISC架构服务器。IA架构采用CISC指令集架构，RISC主要为ARM架构，其他 MIPS、ALPHA、POWER等架构在服务器市场生态系统较孱弱。在后摩尔时代，AI、5G、大数据增加了云端计算的需 求， [X86架构](https://zhida.zhihu.com/search?content_id=271914456&content_type=Article&match_order=1&q=X86%E6%9E%B6%E6%9E%84&zhida_source=entity) 的优势逐渐减少，ARM架构的热潮逐渐兴起。 X86服务器主流微架构包括英特尔的Sky Lake、Cascade Lake、Cooper Lake、Ice Lake，ARM服务器微架构主要包括 [Neoverse N1](https://zhida.zhihu.com/search?content_id=271914456&content_type=Article&match_order=1&q=Neoverse+N1&zhida_source=entity) 、Neoverse V1（Zeus）。

![](https://pic2.zhimg.com/v2-405505855106b80e9339e4d74bbb461f_1440w.jpg)

服务器市场X86仍是主流，但是ARM也在崛起：Ampere基于ARM v8.2架构的Altra和AltraMax；亚马逊基于Arm Neoverse的64核 Graviton2比第一代基于X86架构的服务器芯片性能提升40%；华为应用于泰山服务器的64核鲲鹏920处理器能效比超出同 类产品30%；天津飞腾的S2500、FT-2000+/64、 FT-1500A/16等产品 。

![](https://picx.zhimg.com/v2-510b8bf867d317efa78d1b423bee360f_1440w.jpg)

> 35.AI+IoT有哪些应用？

AIoT在物联网的基础上加入AI技术，近年来发展速度迅猛。物联设备快速增长，全球智能硬件厂商争相布局，根据 Transforma Insights数据，2030年全球物联设备将超过254亿台。根据艾瑞咨询数据，2018年中国AIoT市场规模达2590亿 元，2022年AIoT业务将超过7500亿元。

在AIoT智能硬件端，MCU和SoC为主控芯片。其中，AIoTSoC通常集成多个AI模块，能够处理音视频等数据，和MCU相 比能够更好地满足AI对高算力、低功耗的需求，提升物联设备交互体验和智能化水平，已占据智能终端芯片市场的主 导地位。智能音视频、智能家居、智能安防及商办等AIoT应用将成为SoC重要的增量市场。

> 36.智能家居中的IoT应用有哪些？

和普通家居相比，智能家居的交互方式愈发多样化，并兼备无线通信、智能控制、设备自动化等功能，应用场景多样化，包括智能家电、智能音箱、家用安防、智能照明、扫地机器人、智能门锁等。

![](https://picx.zhimg.com/v2-1777e9553dc66ba2e1c0a02534197697_1440w.jpg)

智能音箱是智能家居核心接入口，集成了AI处理功能，具有语音交互 功能。根据Statista预测2021年全球智能音箱出货量将达到152.5百万台。洛图科技数据表明，2019年我国智能音箱家庭普及率仅为13%， 和西方国家相比有巨大上升空间，随着智能家居不断发展，智能音箱 市场有望迎来新的增长点。智能音箱多采用SoC主控芯片，集成音频、视频相关IP，实现语音算法等AI功能。

![](https://pic4.zhimg.com/v2-b342e17544c9b7e5b6c11d3614f5a89d_1440w.jpg)

> 37.智能音箱上的AI硬件有哪些？

带屏音箱将朝AI 智能交互方向不断发展，为用户提供了语音交 互、人脸识别、手势控制能功能，未来带屏音箱 市场有望继续增长，对主控SoC的性能和集成度 提出更高要求。

![](https://pic4.zhimg.com/v2-15850d3ad2e227bf02775e552913b757_1440w.jpg)

> 38.扫地机器人上的AI硬件有哪些？

扫地机器人融合了处理器芯片、SLAM算法（同步定位与地图构建）、传感器及激光雷达等技术，产品技术迭代较快，未来新购需求强劲。根据Loup Ventures，IFR数据显示，2015年全球扫地机器人销售收入仅为0.81亿美元， 2025年销售收入将达4.98亿美元，复合增长率达20%。在我国，扫地机器人 市场集中度高，CR3高达72.5%。在芯片端，瑞芯微（RK3326、RK1808、 RK3308、RV1108 SoC）、全志科技（R系列SoC）为主要扫地机器人SoC厂商。

![](https://picx.zhimg.com/v2-132fb38e97d63d05e676a218cf7dc6af_1440w.jpg)

代扫地机器人采用视觉/3D ToF传感模组进行数据收集、vSLAM视觉导航技术进行全局路径规划，通 过神经网络算法提高扫地机器人智能识别能力，SoC算力进一步提升，满足新一代扫地机器人智能导航规划、自动识 别、语音播报、智能交互等物联功能。

![](https://pic1.zhimg.com/v2-d21a67afbd358bbd91eb8931d51d6932_1440w.jpg)

> 39.智能安防中的芯片应用有哪些？

智能家用安防市场包括智能摄像头、智能门锁和可视门铃。我国智能家用安防市场仍处于起步和快速发展阶段，随着 5G、AI、WIFI-6技术的普及和产品成本进一步降低，该市场应用将加速落地，拉动硬件层面嵌入式SoC芯片的需求和发展。

视频监控是安防行业最重要的业务之 一。视频监控系统分为模拟监控系统 分为模拟监控和网络监控，其对应的 前端芯片分别为ISP芯片、IPC SoC芯 片，后端芯片分别为DVR SoC芯片、 NVR SoC芯片。前端设备负责采集图 像、语音等视频信号，传输到监控系 统中；后端设备负责控制视频信号的 显示切换、对终端设备输出显示，以 及存储。

在计算机技术、编码压缩技术、IC工 艺、网络传输技术等信息与视频监控 不断发展的背景下，安防视频监控行业正朝数字化、高清化和智能化方向 发展。

![](https://pic1.zhimg.com/v2-2603849c5cf8107c450670d8347316a4_1440w.jpg)

> 40.ISP芯片的构成是什么？

![](https://pic4.zhimg.com/v2-b63589ac8f778e483f790f97e82bb059_1440w.jpg)

ISP芯片是视频监控摄像机的重要处理模块，ISP芯片包含了CFA 插值、白平衡校正、伽玛校正、3D降噪、边缘增强、伪彩色抑制、宽动态处理等功能模块，其作用是采集前端原始图像信号，并进行图像复原和增强处理，再将图像在后端 DVR压缩和存储。DVR SoC芯片可将处理过的音视频数据进行检索回放。

IPC SoC是视频网络监控摄像机的核心，通常包含CPU、ISP、视频编码模块等，经采集过的视频原始数据经过ISP模块处理后，进行压缩并传输到后端NVR进行处理和存储。随着智能安防不断发展，IPC SoC将集成AI模块以实现人脸识别、智能侦测等智能应用。

> 41.智能安防的发展趋势和主要厂商有哪些？

IoT、AI、云计算和大数据在安防行业加速渗透，大量数据得到结构化的处理，经过智能分析后呈现给用户，“云边端” 的智能安防体系不断完善。此外，传统监控很大程度依靠云端分析和处理数据，造成很大的数据传输和云端运输、存储 压力。越来越多的IPC厂商将视频分析技术集成至前端，利用AI技术实现分布式智能监控、分析、处理和功能应用。

![](https://pic2.zhimg.com/v2-18c75ba03e036da9a11e8f9ce8b6dbbb_1440w.jpg)

目前，传统视频解码芯片厂商海思、安霸、 [NVIDIA](https://zhida.zhihu.com/search?content_id=271914456&content_type=Article&match_order=1&q=NVIDIA&zhida_source=entity) 和Movidius（Intel旗下）已推出多款安防AI芯片，国内其他企业包括富 瀚微、北京君正、立讯微、国科微、瑞芯微、地平线等超过20家企业也正加速布局该领域。

![](https://pic3.zhimg.com/v2-fae54d6b78379a728907e1f1d1493bf6_1440w.jpg)

![](https://pica.zhimg.com/v2-b3e3c81356c96cf2c55a5f880185cec0_1440w.jpg)

> 42.智能耳机的应用有哪些？

TWS耳机智能语音助手、语音识别、语音唤醒等功能逐渐完善，对主控芯片SoC的工艺制程、集成度、功耗、AI模块和边缘 计算能力等提出了更高的要求，在芯片端市场，苹果、高通、联发科及我国的海思、恒玄科技为主要厂商。

![](https://picx.zhimg.com/v2-d7a1f6e6c8b1b323293518fe28100161_1440w.jpg)

> 43.智能商显的应用场景有哪些？

![](https://picx.zhimg.com/v2-81e294b24b0dd9c9e15d20f0939d8bcf_1440w.jpg)

商业显示作为人机交互的重要切入口，广泛应用于娱乐、教育、交通、工业、商办等场景，为SoC重要的增量市场。随着 商显智能化发展，智能监控、人脸识别等AI功能愈发重要，主控SoC需要集成AI处理模块。我国主要商显SoC厂商瑞芯微推出了RK3399、RK3288、RK3188、RK3128 SoC，可应用于大型售货机、快递柜、数字标牌、会议一体机等中高端设备；全志科技也陆续推出A20、A64、A83T等主控SoC，为商显行业行业提供全方位芯片解决方案。

> 44.VR/AR中的SoC芯片组成？

5G、AI、超高清视频、云计算的高速发展提升了VR/AR设备的体验感，随着娱乐、医疗、教育培训等应用需求不断增长， VR/AR产业有望迎来新一轮增长。

VR产业广泛应用于To B、To C端，Facebook为主要厂商，其产品Oculus Quest 2实现了VR一体机和分体机市场的统一。AR产 业发展较为缓慢，To B端涉及工业、医疗、安防、教育等领域，谷歌和微软为主要厂商。

![](https://pic4.zhimg.com/v2-0d1ebc4ee502cb77c63c57a4c2a8fcbb_1440w.jpg)

随着AR办公、AR购物、VR直播等场景兴起，硬件方面Facebook、谷歌、苹果、三星等厂商纷纷推出应用产品及平台， 5G时代的到来更是对AR/VR芯片算法、显示和通讯等模块提出了更高要求，全球各大芯片厂商积极布局AR/VR领域。高 通2012年收购AR公司Blippar，2014年推出AR引擎Vuforia，2016年推出VR头显一体机VR820，在芯片端，高通一家独大， 2018-2020年陆续推出针对AR/VR应用的骁龙XR1平台和XR2 5G平台，占据大部分市场份额。国内厂商全志科技、炬芯、 瑞芯微等均推出了用于AR/VR领域的SoC处理器。

![](https://pic3.zhimg.com/v2-cf0678539fcbefbccd0ed74245bc0326_1440w.jpg)

## 5\. 从算力到存力：存储芯片研究框架 ——AI行业系列报告

考虑到AI芯片发展的新趋势，再分享一篇研报，参考： [pdf.dfcfw.com/pdf/H3\_AP](https://link.zhihu.com/?target=http%3A//pdf.dfcfw.com/pdf/H3_AP20) …

> 45.什么是存算一体？

先进存力的前进方向：存算一体、HBM/DRAM、3D NAND

- 存算一体：将存储单元和计算单元合为一体，省去了计算的数据搬运环节，消除由于数据搬运带来的功耗，提升计算能效。
- HBM/DRAM：作为存储器主流之一的DRAM技术不断升级，衍生出HBM（高带宽内存），其是一款新型的CPU/GPU 内存芯 片，将多个DDR芯片堆叠后与GPU封装在一起，实现大容量，高位宽的DDR组合阵列， 突破内存容量与带宽瓶颈。
- 3D NAND（立体堆叠技术）：可以摆脱对先进制程工艺的束缚，不依赖于EUV技术，而闪存的容量/性能/可靠性也有了保障。

> 46.存储技术构架

![](https://pic3.zhimg.com/v2-6440fc13928bff6b3319b26f9270918e_1440w.jpg)

![](https://pic1.zhimg.com/v2-6149b163e3cb0fb6055f5ab9eb1110be_1440w.jpg)

> 46.存储芯片分类

![](https://pic3.zhimg.com/v2-44cee746266dffb57247bd0e3c253984_1440w.jpg)

这个图ROM和RAM标反了。

**ROM (Read-Only Memory) - 只读存储器**

- **数据存储方式:** ROM 中的数据在制造过程中被写入，并且 **只能读取，不能修改** 。即使断电，数据也不会丢失。
- **用途:** ROM 通常用于存储计算机启动所需的指令（如 BIOS）、嵌入式系统的固件，以及一些不需要修改的重要数据。
- **常见类型:**
- **Mask ROM:** 掩膜 ROM，数据在制造时写入，不可更改。
- **PROM:** 可编程 ROM，可以使用特殊设备写入数据一次。
- **EPROM:** 可擦除可编程 ROM，可以使用紫外线擦除数据，并重新写入。
- **EEPROM:** 电可擦除可编程 ROM，可以使用电信号擦除数据，并重新写入。
- **Flash Memory:** 闪存，一种常见的 EEPROM 类型，用于 U 盘、固态硬盘等。

**RAM (Random Access Memory) - 随机存取存储器**

- **数据存储方式:** RAM 中的数据可以 **随时读写** ，但 **断电后数据会丢失** 。
- **用途:** RAM 是计算机运行程序时的 **工作空间** ，用于存储正在运行的程序、数据以及中间结果。
- **常见类型:**
- **SRAM:** 静态 RAM，速度快、成本高，常用于 CPU 的高速缓存。
- **DRAM:** 动态 RAM，容量大、成本低，常用于计算机的主内存。

> 45.AI的挑战和存算一体的机遇

芯片的发展速度和人工智能的算力需求之间的矛盾加剧：21世纪以来，信息爆炸式增长，算力需求大规模上升，提升算力成为 芯片行业的共同目标。随着半导体发展放缓，摩尔定理逼近物理极限，依靠器件尺寸微缩来提高芯片性能的技术路径在功耗和 可靠性方面都面临巨大挑战，芯片的发展速度无法满足人工智能需求。

![](https://pic4.zhimg.com/v2-a24eaf14274164f4e4497db8c82ff9ab_1440w.jpg)

冯·诺依曼架构：该架构以计算为中心，计算与内存是两个分离单元。计算单元根据指令从内存中读取数据，在计算单元中完 成计算和处理，完成后再将数据存回内存。

先进制程的优势有限：随着摩尔定理发展放缓，基于传统架构的芯片计算性能发展速度明显放缓。基于传统架构的先进制程工 艺虽一定程度能够提升芯片的性能表现，但从投入产出比、芯片性能可靠性及应用场景的适配度角度考虑都面临较大挑战。

![](https://pic3.zhimg.com/v2-f052d3763621dc8c1cf0d7c485dfe0f6_1440w.jpg)

存算一体是先进算力的代表技术：传统构架下性能提升达到极限，冯·诺依曼架构已成为发展芯片算力的桎梏，存算一体是 一种新型计算架构，它是在存储器中嵌入计算能力，将存储单元和计算单元合为一体，省去了计算过程中数据搬运环节， 消除了由于数据搬运带来的功耗和延迟，提升计算能效。

![](https://pic4.zhimg.com/v2-ab2aa3202add6a74c8e98c8825735031_1440w.jpg)

> 45.HBM是什么？

HBM（High Bandwidth Memory，高带宽内存）是一款新型的CPU/GPU 内 存芯片，其实就是将很多个DDR芯片堆叠在一起后和GPU封装在一起，实现 大容量，高位宽的DDR组合阵列。

高速、高带宽HBM堆栈没有以外部互连线的方式与信号处理器芯片连接，而 是通过中间介质层紧凑而快速地连接，同时HBM内部的不同DRAM采用TSV 实现信号纵向连接，HBM具备的特性几乎与片内集成的RAM存储器一样。

![](https://pica.zhimg.com/v2-41983c760c15d330a366d2bec2c40de6_1440w.jpg)

![](https://pic2.zhimg.com/v2-75cc71c5d47d336de3bc98c4f02a4995_1440w.jpg)

GDDR5内存每通道位宽32bit，16通道总共512bit; 目前主流的第二代 [HBM2](https://zhida.zhihu.com/search?content_id=271914456&content_type=Article&match_order=1&q=HBM2&zhida_source=entity) 每个堆栈可以堆至多8层DRAM die，在容量和速度 方面有了提升。HBM2的每个堆栈支持最多1024个数据pin，每pin的传输速率可以达到2000Mbit/s，那么总带宽是256Gbyte/s; 在2400Mbit/s的每pin传输速率之下，一个HBM2堆栈封装的带宽为307Gbyte/s。

![](https://picx.zhimg.com/v2-ba9061be591ab88b8f705844099ff5c9_1440w.jpg)

> 46.NAND Flash的发展

对于AI应用来说，NAND Flash的应用也很广泛。

闪存芯片是最主要的存储芯片，主要为 NOR Flash 和 NAND Flash 两种。NOR Flash 主要用来存储代码及部分数据，是手机、PC、DVD、TV、 USB Key、 机顶盒、物联网设备等代码闪存应用领域的首选。NAND Flash 可以实现大容量存储、高写入和擦除速度、相当擦写次数，多应用于大容量数据存储，例如智能手机、平板电脑、U 盘、固态硬盘等领域。

NAND 存储器使用浮栅晶体管，它能在没有电源的情况下存储信息。所有的电路都依赖于 某种能量来使整个电池的电荷产生差异，这种能量迫使电子穿过栅极。随着这种电荷返回 到关闭状态，随机存取存储器 (RAM) 等易失性类型的存储器会丢失其数据。但是Nand闪存 就不同了，它的浮动栅极系统通过使用第二个栅极在电子穿过电池时收集和捕获一些电子， 这使得粘在浮栅上的电子在没有电压的情况下保持原位，在这一过程中不管是否有电源连 接，芯片都能继续存储下一个值。

![](https://pic2.zhimg.com/v2-f1dd4115e72d86c66fd59fe153b55ab9_1440w.jpg)

NAND Flash 为大容量数据存储的实现提供了廉价有效的解决方案，是目前全球市 场大容量非易失存储的主流技术方案。NAND Flash 是使用电可擦技术的高密度非 易失性存储，NAND Flash 每位只使用一个晶体管，存储密度， Flash 所存的电荷 （数据）可长期保存；同时， NAND Flash 能够实现快速读写和擦除。

![](https://pic2.zhimg.com/v2-f12b9627cb98718a6e25249da6d6bdc1_1440w.jpg)

3D NAND, 即立体堆叠技术，如果把2D NAND看成平房，那么3D NAND就是高楼大厦，建筑面积成倍扩增，理论上可以无限堆叠，可以摆脱对先 进制程工艺的束缚，同时也不依赖于极紫外光刻（EUV）技术，而闪存的容量/性能/可靠性也有了保障。

![](https://pic4.zhimg.com/v2-e107d759541871408e043363675558c9_1440w.jpg)

![](https://pica.zhimg.com/v2-7fa7f58f1277376d81bfec0735ce1046_1440w.jpg)

> 后记：  
> 面对大量的信息的时候，好像词典一样，一遍也记不住，记住了当时也用不上，但是为了防止“ **书到用时方恨少** ”，在学习的时候可以 **印证我们大脑中的通识想法** ，如果一致就可以略过，如果冲突很大，那么就需要仔细琢磨， **吸收变成自己通识的一部分** 。对于字典型的知识也不一定都要记住，但是需要的时候知道 **从哪里查** 到就可以，会问问题就行。  
> 本文参考的信息并不是最新的，但是 **SoC的基础知识和原理** 都是一样的，可以入门学习。另外这种研报仅仅是入门中的入门，给外行看的，这里一次性分享完，之后SoC入门系列就开始要纯技术了。

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位有自己公众号的留言： **申请转载** ！

纯干货持续更新，欢迎 **分享给朋友** 、 **点赞、收藏、在看、划线和评论交流** ！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

发布于 2026-03-24 10:03・上海[嵌入式培训班大家觉得有必要吗？](https://www.zhihu.com/question/452052914/answer/3245825541)

[

不太建议嵌入式的初学者一上来就看书，其实不只是嵌入式，整个IT行业都属于技术行业，初学者一上来就盯着专业书学习，很容易会感觉枯燥乏味，产生厌学的心理。如果是想要了解嵌入式，...

](https://www.zhihu.com/question/452052914/answer/3245825541)