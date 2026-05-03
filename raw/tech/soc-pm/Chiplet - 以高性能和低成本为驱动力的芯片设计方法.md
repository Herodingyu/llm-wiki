---
title: "Chiplet - 以高性能和低成本为驱动力的芯片设计方法"
source: "https://zhuanlan.zhihu.com/p/2026351233410017252"
author:
  - "[[LeonardT​​芯片设计]]"
published:
created: 2026-05-03
description: "1. Chiplet介绍随着计算需求不断增长，单芯片已无法满足算力增长的需求 (工艺缩放带来的性能提升无法满足业务对性能的需求)，chiplet 系统成为主流。与单芯片相比，这些由多个独立芯片重新封装而成的芯片能够满足…"
tags:
  - "clippings"
---
[收录于 · 芯片架构设计](https://www.zhihu.com/column/c_1877951126294372352)

10 人赞同了该文章

## 1\. Chiplet介绍

随着计算需求不断增长，单芯片已无法满足算力增长的需求 (工艺缩放带来的性能提升无法满足业务对性能的需求)，chiplet 系统成为主流。与单芯片相比，这些由多个独立芯片重新封装而成的芯片能够满足极高的性能需求，且不会增加功耗、面积或良率，同时可提高芯片设计的灵活性、效率和可扩展性。构建 chiplet 架构有多种方法，其中最常见的有两种。

- 分解

将一个大芯片分割成更小的芯片，与单芯片相比，这样可以提高系统良率并降低成本。分解既适用于 [异构设计](https://zhida.zhihu.com/search?content_id=272920140&content_type=Article&match_order=1&q=%E5%BC%82%E6%9E%84%E8%AE%BE%E8%AE%A1&zhida_source=entity) ，也适用于 [同构设计](https://zhida.zhihu.com/search?content_id=272920140&content_type=Article&match_order=1&q=%E5%90%8C%E6%9E%84%E8%AE%BE%E8%AE%A1&zhida_source=entity) 。

- 组合

将采用不同工艺技术的芯片组装在一起，以实现最佳的系统功能和性能。例如，一个完整的 chiplet 芯片可以包含用于数字计算、模拟、存储和光计算的芯片，每个芯片都采用最适合其目标功能的工艺技术 (常见的方案：计算芯片位于最新的节点 N，而 SRAM 和 I/O 芯片位于节点 N-1 或 N-2)。通过集成经过验证且性能可靠的芯片（例如可重用的 IP 模块），团队可以降低设计风险并减少工作量。

![](https://pic3.zhimg.com/v2-e4f0dddd976f804f583388a9bb6a6c9a_1440w.jpg)

无论采用哪种方法，基于 chiplet 的设计都比大型单芯片 SoC 更具成本效益。与单芯片系统相比，chiplet 系统可实现更高的 PPA 和良率，同时更小的芯片尺寸和更高的良率弥补了更高的硅片面积和封装/测试成本。chiplet 方案的主要优势有：

- 更高的良率

通过将大型单芯片分解成更小的芯片，良率得以提高，同时可以避免复杂的冗余设计

- 成本效益

可以把现有的芯片在多种设计中重复使用，从而降低开发成本和时间，提升可重用性和灵活性

- 提升性能

独立优化不同功能和用途的 die，可以进一步提升整体性能，同时先进互联技术可以带来更高的带宽和更低的延迟

- 可扩展可定制可创新

模块化设计，可以单独针对某个 Die 进行定制开发，也可以灵活的完成不同 Die 之间的组合

![](https://pic4.zhimg.com/v2-2bcec7d7fcd46cdec3437f69aecc781b_1440w.jpg)

和单芯片设计相比，chiplet 方案需要更多的考虑封装对设计的影响。先进的封装类型在性能、面积和连接性方面各有优势，同时也存在复杂性和组装方面的差异。 [硅中介层](https://zhida.zhihu.com/search?content_id=272920140&content_type=Article&match_order=1&q=%E7%A1%85%E4%B8%AD%E4%BB%8B%E5%B1%82&zhida_source=entity) 是一种硅芯片，用作电信号传输的通道。由于硅中介层为信号提供了较大的通道，因此可以缩短系统 IP 模块之间的距离，并最大限度地减少寄生延迟。 [重分布层](https://zhida.zhihu.com/search?content_id=272920140&content_type=Article&match_order=1&q=%E9%87%8D%E5%88%86%E5%B8%83%E5%B1%82&zhida_source=entity) （RDL）中介层由于允许电路扇出，并允许连接到中介层的芯片之间进行横向通信，使其成为 2.5D 和 3D IC 集成不可或缺的组成部分。 [混合键合](https://zhida.zhihu.com/search?content_id=272920140&content_type=Article&match_order=1&q=%E6%B7%B7%E5%90%88%E9%94%AE%E5%90%88&zhida_source=entity) 是密度最高且能效最高的。混合键合技术采用非常小的凸点间距和硅通孔（TSV）连接，可以将两个晶圆键合在一起，使其像一个晶圆一样工作。

![](https://pic3.zhimg.com/v2-0b247f0c32d99507be1f88ab006438c8_1440w.jpg)

chiplet作为新的设计方法学，也会引入新的设计挑战，主要有：

- 通信开销

芯片间的互连会增加延迟和功耗。芯片外链路比芯片内链路速度更慢、能效更低。原本只需短距离金属层传输的信号现在必须穿过封装基板或中介层，这会增加延迟和能耗，需要在架构设计的时候考虑D2D的影响，特别是访问DDR的影响

- 电源设计

在chiplet方案中，供电也变得更加困难。每个芯片的电压、电流消耗和瞬态特性可能各不相同，尤其是在采用不同工艺节点制造或设计用于计算Die、MEM Die、IO Die等不同用途时。同时chiplet方案下电源必须经过凸点、微凸点和/或中介层。这些更长的路径会引入IR压降并降低电压精度

- 热管理

不同的Die通常运行不同的工作负载，采用不同的工艺节点，并且产生的热量也不均匀。这导致热热点分散，而非形成平滑的温度梯度，从而使系统难以有效散热。特别是3D方案下，散热是个大问题

- 封装复杂度

Chiplet依赖封装将多个Die连接成一个完整的系统实现正常工作。这意味着需要采用先进的技术：2.5D中介层、硅桥、3D堆叠和混合键合。这些技术会增加封装的成本、良率和可靠性。同时供应链协同（芯片设计公司、Fab、OSAT）也越来越重要。

![](https://pic3.zhimg.com/v2-3b5d088015764b99ccba53d9eda8215a_1440w.jpg)

---

## 2\. 常见Chiplet方案

### 2.1.对称Die

所谓对称Die (同构chiplet)，是指每个Die的形状相同，通过对称方式合封成完整的芯片，常见的有2 Die和4 Die两种产品形态。

- **2-Die**
![](https://pic1.zhimg.com/v2-0c69c98a4000d12428988dd7af2193aa_1440w.jpg)

2-Die是最常见的产品形态 ，无论是apple M2/3 Ultra CPU还是NVIDIA GPU都采用了这种形态。

***M3 Ultra (两个M3 Max合封)***

![](https://pica.zhimg.com/v2-fb70eec5cc2da11566bb9a44f6a26b42_1440w.jpg)

***NVIDIA B200***

![](https://picx.zhimg.com/v2-c32a13c1ae9dfe22e25b4de5b414b563_1440w.jpg)

2-Die的优点是：

1. 可以让芯片变的更大，突破reticle size (33mm×26mm=858mm2)的限制，提升单芯片的性能 (算力)
2. 1个die的研发投入，降低芯片研发NRE (主要是投片成本)，规避研发风险，节省开发周期

2-Die的缺点是：

1. D2D引入的面积和功耗开销 (一般占芯片面积的10%)
2. 更大的设计难度 (双Die协同，双Die之间的通信延迟带来的影响)
3. 提升封测的复杂性和成本
- **4-Die**
![](https://pic3.zhimg.com/v2-c5dcb071eac5734d333229cbe9d3d220_1440w.jpg)

最典型的4-Die芯片是 ***AMD EPYC 7451***

![](https://pica.zhimg.com/v2-5b97252019a19aae3b8811fd70b48ec2_1440w.jpg)

![](https://pic4.zhimg.com/v2-538f286b197e5c34ff484736030519ab_1440w.jpg)

4-Die方案是2-Die的升级版，它的最大好处是可以进一步减小单个Die的Size。

无论是2-Die还是4-Die的对称die方案，都有如下局限性：

1. 计算单元、存储单元(SRAM)、模拟单元(IO)在不同工艺的缩放因子是不同的，一般而言计算单元适合使用更先进的工艺，存储单元和模拟单元可以使用较成熟的工艺，同构chiplet方案需要按照计算单元的要求使用先进工艺，无法吃到异构红利
2. 计算、存储、互联的技术迭代周期是不同的，一般而言计算+存储的迭代周期要快于互联，同构chiplet方案的产品研发节奏需要完全按照计算+存储的节奏来，无法吃到异步迭代的红利 (e.g. 一个IO Die复用在两代芯片上）
3. 同构chiplet方案无法将技术成果复用在不同的产品线上，不同用途的芯片(e.g. 密算芯片, 智算芯片) 研发时需要重复投入

### 2.2. 非对称Die

和对称Die (同构chiplet)相对应的是非对称Die (异构chiplet)，指的是使用不同用途的Die合封成完整的芯片，一般而言不同用途的Die主要是指计算Die、IO Die、MEM Die (不一定有)，通过IO Die的类型进行区分。

- **半IO Die (传输Die)**

IO Die上不包括Memory接口时，属于半IO Die。

![](https://picx.zhimg.com/v2-689683b97d0f63965ef650bbe98b0021_1440w.jpg)

一般而言，使用半IO Die主要是为了让计算单元以更高带宽和更快速度访问存储接口：

- [高带宽内存](https://zhida.zhihu.com/search?content_id=272920140&content_type=Article&match_order=1&q=%E9%AB%98%E5%B8%A6%E5%AE%BD%E5%86%85%E5%AD%98&zhida_source=entity) (HBM)的带宽需求大于D2D的传输能力，使用高带宽内存无法将内存控制器和计算单元分离
- D2D传输会引入更大的延迟，对计算有负面影响
- 内存控制器仍然随着工艺进行缩放，先进的内存控制器往往只存在于先进工艺中

在AI Chip领域半IO Die架构是主流方案 ，常见的有：

***Google TPU v7***

![](https://picx.zhimg.com/v2-66095c7136acb44be7074e5d8de825e3_1440w.jpg)

***AMD MI300***

![](https://pic3.zhimg.com/v2-0afb8443e412612ef76cb8f8ffd45e90_1440w.jpg)

![](https://pic4.zhimg.com/v2-09d7ef31a4de03258b75e8ab650a7cf1_1440w.jpg)

***昇腾910***

![](https://pic2.zhimg.com/v2-b2517c9011466c903859d831658a5b35_1440w.jpg)

![](https://pica.zhimg.com/v2-983e6c4c57da481db2a7c707d2be7526_1440w.jpg)

半IO Die的优点是：

1. 简化IO Die设计，IO Die功能更纯粹
2. 把随着工艺缩放效应小的I/O和模拟电路留在成熟工艺上，IO Die面积一般较小，进一步降低了芯片成本
3. 独立的IO Die演进路线，可以实现更多产品搭配，同一代芯片上的更灵活的多种SKU
4. 多代芯片共用一个IO Die，可以降低研发成本

半IO Die的缺点是：

1. 增加一次流片NRE费用
2. 跨die内存访问需要多次D2D传输，进一步增加了延迟
- **全IO Die (传输+MEM+Ctrl Die)**
![](https://pica.zhimg.com/v2-668d77866a83784ce82680e552a88d68_1440w.jpg)

![](https://pic1.zhimg.com/v2-e8a792cf27bf04b6aba6caaed70385bc_1440w.jpg)

全IO Die目前只用于CPU产品上，AI芯片还没有类似的设计， ***AMD CPU*** 产品是典型的全IO Die方案。

![](https://pic3.zhimg.com/v2-dd5cf640fc4e1a08de653bb9822b7b9c_1440w.jpg)

![](https://pic2.zhimg.com/v2-0e2b7b0866057ebba773086eedf172b1_1440w.jpg)

![](https://pic3.zhimg.com/v2-473b8af030d28974edee059788c9b1c2_1440w.jpg)

---

## 3\. 量产Chiplet芯片示例

- ***Google TPU***

Google TPU从v5开始引入Chiplet设计。

***TPU v5p***

1 \* 计算Die + 1 \* IO Die + 6 \* HBM

![](https://pic4.zhimg.com/v2-bc3ee4435784963eb6f7ae4ed3800471_1440w.jpg)

![](https://picx.zhimg.com/v2-9bf5b32eff99829b4ac66b4d0e678227_1440w.jpg)

![](https://pic4.zhimg.com/v2-81afec2e3c105f95a40825e82d0aaf07_1440w.jpg)

***TPU v5e***

1 \* 计算Die + 1 \* IO Die + 2 \* HBM

![](https://pic2.zhimg.com/v2-2031b4d780d8ab58f59d381423c18529_1440w.jpg)

***TPU v6e***

1 \* 计算Die + 1 \* IO Die + 2 \* HBM，和TPU v5e保持一致

![](https://pic1.zhimg.com/v2-502f2bf28ef5fd6a6430949fac7556b0_1440w.jpg)

![](https://pic4.zhimg.com/v2-7086947b5dcc03f65219ee30608a10c7_1440w.jpg)

***TPU v7***

2 \* 计算Die + 1 \* IO Die + 8 \* HBM

![](https://picx.zhimg.com/v2-78d3d19528bc1d572f433a3e18d0f869_1440w.jpg)

- ***[AWS Trainium](https://zhida.zhihu.com/search?content_id=272920140&content_type=Article&match_order=1&q=AWS+Trainium&zhida_source=entity)***

***trainium2***

2 \* (1 \* 计算Die + 2 \* HBM)

![](https://pic2.zhimg.com/v2-2f8cc8f479d851829fc6740664892467_1440w.jpg)

***trainium3***

2 \* (1 \* 计算Die + 2 \* HBM)

![](https://pic2.zhimg.com/v2-c85a8df9c2f3fc0056f5266665bc9c49_1440w.jpg)

- ***[META MTIA](https://zhida.zhihu.com/search?content_id=272920140&content_type=Article&match_order=1&q=META+MTIA&zhida_source=entity)***

***MTIA 300***

1 \* 计算Die + 2 \* IO Die + 2 \* HBM

![](https://pic4.zhimg.com/v2-e1a36a4adbaf5735d5b20a02d25f265b_1440w.jpg)

***MTIA 400***

2 \* (1 \* 计算Die + 2 \* HBM) + 3 \* IO Die

![](https://pic4.zhimg.com/v2-0355ccf353e946a236cbae24b502811f_1440w.jpg)

![](https://pic2.zhimg.com/v2-8b0845f17ae9b77ddd0059793a3e73a9_1440w.jpg)

***MTIA 450?***

2 \* (1 \* 计算Die + 2 \* HBM) + 3 \* IO Die，同MTIA 400

![](https://pic2.zhimg.com/v2-05a33ec6f8880134a20c67a29f837aa1_1440w.jpg)

***MTIA 500?***

4 \* (1 \* 计算Die + 1 \* HBM) + 3 \* IO Die

![](https://picx.zhimg.com/v2-ca159c0996f320ff84a57c9b65e4fd99_1440w.jpg)

- ***[SambaNova](https://zhida.zhihu.com/search?content_id=272920140&content_type=Article&match_order=1&q=SambaNova&zhida_source=entity)***

***SN40L RDU***

2 \* (1 \* 计算Die + 4 \* HBM)

![](https://pic3.zhimg.com/v2-734166803b276f2c810807d535dc05b4_1440w.jpg)

***SN50 RDU***

2 \* (1 \* 计算Die + 4 \* HBM)

![](https://pic2.zhimg.com/v2-5a5a62502f665de081908514c0be690b_1440w.jpg)

- ***tenstorrent***

***Open Chiplet***

![](https://pic3.zhimg.com/v2-f724a1d53037157dff5c8b1e7ec32714_1440w.jpg)

- ***D-Matrix***

***CorSair***

4 \* 计算Die

![](https://pic1.zhimg.com/v2-26b8702ec96043b2e6f9b5885f9b699a_1440w.jpg)

![](https://pic1.zhimg.com/v2-793bd0a0b633d676f486397f467436e6_1440w.jpg)

- ***NVIDIA GPU***

***Blackwell***

2 \* (1 \* 计算Die + 4 \* HBM)

![](https://pica.zhimg.com/v2-84c484c7c90d6d654c8dd06f1c630934_1440w.jpg)

![](https://picx.zhimg.com/v2-463109fc7b98a5625dfeb6aa6394d225_1440w.jpg)

***Rubin***

2 \* (1 \* 计算Die + 4 \* HBM) + 1 \* IO Die

![](https://pic2.zhimg.com/v2-bb8bf0b900e25e353c9ae7335ee8eafb_1440w.jpg)

![](https://pic1.zhimg.com/v2-b9ff5ed8b972a03ab1a1b6bb7b68e176_1440w.jpg)

- ***AMD GPU***

***MI300***

![](https://pic3.zhimg.com/v2-0afb8443e412612ef76cb8f8ffd45e90_1440w.jpg)

![](https://pic4.zhimg.com/v2-09d7ef31a4de03258b75e8ab650a7cf1_1440w.jpg)

***MI350***

![](https://pic1.zhimg.com/v2-6380e9e508c63c2ffcb5eb8e50c93e10_1440w.jpg)

![](https://pic1.zhimg.com/v2-0ff8672b6a9cec09bca350b795b581be_1440w.jpg)

- ***CPU***

***AmpereOne***

1 \* 计算Die + 4 \* PCIe Die + 4/6 \* MEM Die

![](https://pic4.zhimg.com/v2-cfd597fa6b86ac8fb392d920e23725e5_1440w.jpg)

计算die采用TSMC 5nm工艺制造，包含192个定制的Arm内核。内存和PCIe控制器则被拆分到独立的7nm I/O芯片中。

***Graviton3 & Graviton4***

1 \* 计算Die + 2 \* PCIe Die + 4 \* MEM Die

![](https://pic3.zhimg.com/v2-a0d7eea2eb8a8f35de6e1e4d04ebe736_1440w.jpg)

![](https://pic4.zhimg.com/v2-f03476b4273052ac935749948ff02ebf_1440w.jpg)

![](https://picx.zhimg.com/v2-02cc0285cecc0769ee509b2db7395b6d_1440w.jpg)

---

随着单芯片算力性能目标的提升，chiplet是必然选择：计算单元数量是芯片算力的基础，更多的计算单元等于更大的芯片面积，chiplet是突破芯片面积限制的主要手段。

虽然计算Die和IO Die分离的chiplet方案会增加一次tape-out的NRE费用，但是长期看计算Die和IO Die分离更符合chiplet的发展趋势。

具体选择哪种chiplet方案还需要综合考虑产品前景 (规模)、供应链、成本评估、技术成熟度等多方面的因素，如何拼好这个积木，需要架构师仔细考量。

编辑于 2026-04-11 18:30・北京[双非本科电科想做ic请问一下哪些岗位容易进呢?](https://www.zhihu.com/question/542487738/answer/2674342765)

[常见的几个岗位？数IC前端设计工程师数字IC验证工程师数字后端设计工程师DFT设计工程师模拟IC设计工程师模拟版图设计工程师ATE芯片测试工程师嵌入式芯片工程师如何选择：https://xg.z...](https://www.zhihu.com/question/542487738/answer/2674342765)