---
title: "Tenstorrent 为什么不是又一张 GPU？"
source: "https://mp.weixin.qq.com/s?__biz=Mzg3MjcwNjExOA==&mid=2247484553&idx=1&sn=0610b2bc4156b7c0b506d40af1a9898e&chksm=ceea7da0f99df4b6315db4f278a06b7346a7fcdcd8cb54000c94c79326057820eda9076a040d&scene=178&cur_album_id=4496673538715877378&search_click_id=#rd"
author:
  - "[[JW]]"
published:
created: 2026-05-09
description: "很多人第一次看 Tenstorrent，会把它放进“又一家 AI 芯片公司”的抽屉里。RISC-V。"
tags:
  - "clippings"
---
JW *2026年5月6日 19:20*

很多人第一次看 Tenstorrent，会把它放进“又一家 AI 芯片公司”的抽屉里。

RISC-V。

Jim Keller。

开源软件栈。

便宜一点的推理卡。

这些标签都没错，但容易把重点带偏。

Tenstorrent 真正想卖的，不是一张更便宜的 GPU，也不是一颗跑 Linux 的 RISC-V CPU。它想卖的是另一种 AI 系统组织方式：

把计算、片上 SRAM、数据搬运、芯片间网络和软件栈，尽量做成同一种可扩展的结构。

这家公司最有意思的地方，也在这里。

它不是说“我也有 tensor core”。

它是在说：AI 推理后面的瓶颈，越来越不像单颗芯片的算力问题，而像数据摆放、跨芯片通信、模型适配和软件生态问题。

如果这个判断成立，Tenstorrent 就有讨论价值。

如果这个判断不成立，它就只是另一家在 CUDA 生态外硬冲的芯片公司。

## 一、先看产品：它已经不是只有开发板

Tenstorrent 当前公开产品大致分四层。

第一层是 PCIe 卡。

老一代是 Wormhole，常见产品是 n150 和 n300。n150 是单 Wormhole 处理器，72 个 Tensix core，12GB GDDR6，288GB/s 内存带宽，FP16 峰值 74 TFLOPS，板卡功耗 160W。n300 是双 Wormhole，128 个 Tensix core，24GB GDDR6，576GB/s 内存带宽，FP16 峰值 131 TFLOPS，板卡功耗 300W。

新一代是 Blackhole。公开规格里，p100a、p150a、p150b 都是 120 个 Tensix core，16 个 SiFive X280 “Big RISC-V” core，180MB SRAM，最高 32GB GDDR6，512GB/s 内存带宽，PCIe 5.0 x16，300W。p150a/p150b 还有 4 个 QSFP-DD 800G 端口，用来连接其他 Blackhole 卡。

第二层是桌面工作站。

Wormhole 版 TT-QuietBox 用 4 张 Wormhole n300，也就是 8 个 Wormhole 处理器，做成一台液冷工作站。

Blackhole 版 TT-QuietBox 用 4 个 Blackhole p150c。官方文档里它是一台 80 磅级别的工作站，主机侧是 AMD EPYC，512GB DDR5，4TB NVMe，内部有 4 个 Blackhole p150c，16 个 QSFP-DD 800G 连接口。

更新的 TT-QuietBox 2 则换成更面向桌面的产品话术：起价 9999 美元，液冷，标准电源插座，官方称可以本地跑到 120B 参数级别的开放模型。它的页面写的是“Powered by 2 Blackhole p300c”，同时强调面向个人开发者、小团队、模型实验和底层 kernel 工作。

第三层是 Galaxy 服务器。

Galaxy Wormhole 是上一代服务器，32 个 Wormhole 处理器，官方给出 9.3 PFLOPS FP8、3.8GB SRAM、384GB GDDR6、12kW 功耗。

Galaxy Blackhole 是当前更重要的产品。官方规格是：32 个 Blackhole ASIC，23 PFLOPS Block FP8，6.2GB 片上 SRAM，SRAM 带宽 2.9PB/s，1TB GDDR6，DRAM 带宽 16TB/s，单 ASIC 有 10 条 400GbE fabric link，整机最多 56 个 800GbE QSFP-DD scale-out 端口。官方标价从 11 万美元起，4 台 Galaxy Blackhole supercluster 从 44 万美元起。

第四层是 IP 授权。

Tenstorrent 不只卖卡和服务器，也卖 RISC-V CPU IP。TT-Ascalon 是它公开推的高性能 RISC-V CPU，RVA23 兼容，64 位乱序超标量，支持 RVV 1.0，官方宣称在 Samsung SF4X 工艺上超过 2.5GHz，并给出了 SPECint/SPECfp 每 GHz 指标。

这四层放在一起，就能看出它不是单点产品公司。

它的路线是：开发卡拉开发者，工作站拉小团队，Galaxy 拉生产部署，Ascalon/IP 拉芯片客户。

这不是 NVIDIA 的打法。

也不是 Groq 或 Cerebras 那种单一系统形态的打法。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

Tenstorrent 的野心更像“开放 AI 计算平台”：既卖硬件，也卖可定制 IP，还希望软件栈能从单卡一路延伸到多机集群。

## 二、Tensix 才是主角，RISC-V 不是用来硬算 MatMul 的

“RISC-V AI 芯片”这个说法很容易误导。

普通工程师听到 RISC-V，会想到 CPU。既然是 CPU，那它怎么和 GPU 比矩阵乘？

这个理解不对。

Tenstorrent 的核心单元叫 Tensix。一个 Tensix core 不是一个简单的 RISC-V CPU。它更像一个小型数据流计算岛：

- 有本地 SRAM；
- 有 NoC 路由；
- 有负责数据搬运的 RISC-V 控制核；
- 有负责 compute 的 RISC-V 控制核；
- 有矩阵引擎和向量引擎；
- 用 circular buffer 在片上 SRAM 里衔接数据。

RISC-V 在这里主要不是“亲自做矩阵乘”。

它更像工厂里的调度员和搬运控制器：什么时候从 DRAM 读 tile，什么时候放进 circular buffer，什么时候让 matrix engine 开始算，什么时候 pack 回 L1 或写回外部内存。

真正吃掉 MatMul 吞吐的，是 Tensix 里的 matrix engine。

这和 GPU 也有相似之处。GPU 里的 CUDA core 不等于 Tensor Core。你跑大模型推理，主要也不是靠普通标量 ALU 一条条做矩阵乘。

Tenstorrent 的差别在于，它把这种控制路径暴露得更明显，也更鼓励开发者理解底层。

官方 TT-Metalium 文档里，单 core MatMul 示例会先把矩阵转成 32x32 tile，因为硬件天然按 tile 工作。reader kernel 从 DRAM 搬数据，writer kernel 写结果，compute kernel 调 matrix engine 做 tile-wise MatMul。它还强调 circular buffer 和 double buffering，让数据搬运和计算重叠。

这就是 Tenstorrent 架构的底色：

不是“CPU 加速矩阵乘”。

而是“RISC-V 控制一组为 AI 数据流设计的矩阵/向量/网络硬件”。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

## 三、为什么它老是强调 SRAM 和网络

AI 芯片宣传里，大家都爱讲峰值算力。

但大模型推理真正难受的地方，常常不是峰值。

Prefill 阶段像一次大批量计算，输入 token 全部进来，attention 和 MLP 可以比较充分地吃掉矩阵算力。

Decode 阶段麻烦得多。模型一次生成一个 token。每一步都要读权重、读 KV Cache、做 attention、过 MLP、同步状态，然后进入下一步。

这时系统不只是在算。

它在反复搬数据。

模型一大，权重和 KV Cache 放不进单颗芯片。并发一高，请求之间的 cache、batch、调度和通信开始互相影响。跨卡切模型之后，每个 token 还可能牵涉芯片间通信。

所以 Tenstorrent 讲的不是“我的单卡 TOPS 更大”，而是“我的数据能不能少走冤枉路”。

Wormhole 和 Blackhole 都有本地 SRAM。Blackhole 单卡 120 个 Tensix core，对应 180MB SRAM。Galaxy Blackhole 把 32 个 Blackhole ASIC 放进一台服务器，片上 SRAM 合计 6.2GB，官方标称 SRAM 带宽 2.9PB/s。

这些数字和 HBM/GDDR 不是一个层级的东西。

GDDR 容量更大，适合放权重。

SRAM 容量小得多，但离 compute 更近，延迟低，带宽高，适合放热点数据、tile、中间结果和可复用的数据块。

Tenstorrent 的问题意识是：如果模型执行可以被切成大量 tile 和数据流片段，那就应该让数据尽量在近处被复用，而不是每一步都绕远路。

这也是它为什么重视 NoC 和外部 Ethernet。

在单芯片里，Tensix cores 靠 NoC 组成网格。

在多卡里，p150a/p150b 有 4 个 800G QSFP-DD 口。

在 Galaxy Blackhole 里，官方写的是每 ASIC 10 条 400GbE fabric link，整机最多 56 个 800GbE scale-out 端口。

它想让 scale-out 不是“额外外接一个网络系统”，而是从芯片设计开始就纳入同一种通信模型。

这句话听起来像市场话术，但对应到推理系统里很具体：模型跨设备后，通信不再是边缘问题，而是每个 token 都要付的税。

谁能把这笔税降下来，谁才有机会在长上下文、MoE、视频生成、agent 工作流里拿到优势。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

## 四、参数表里最该看的不是 FLOPS

把 Tenstorrent 和 GPU 放在一起时，最容易误读的是 FLOPS。

Blackhole p150a 的公开规格是 664 TFLOPS BlockFP8。看起来很高。

但这里有两个提醒。

第一，BlockFP8 不是 NVIDIA 表里常见的 FP8 口径。Block floating point 是块浮点，一组数共享指数，用更低存储成本换吞吐和带宽效率。它适合某些低精度 AI 计算，但不能直接和所有 FP8/FP16 指标一把尺子比较。

第二，峰值只说明“理论上能算多快”，不说明模型能不能跑起来、跑得稳不稳、开发者要花多少迁移成本。

一篇评测 Grayskull e75 MatMul 的论文很能说明这个问题。论文里，Grayskull 在原始吞吐上不是 A100/V100 的对手，但在特定 BF16/低精度配置下有不错的性能功耗比，峰值约 1.55 到 1.56 TFLOPS/W。更重要的是，性能高度依赖数据格式、Math Fidelity、矩阵尺寸、核心网格、是否使用 L1 sharding、是否使用优化 kernel。

同一颗芯片，默认 kernel 和调好内存布局的 kernel，表现不是一回事。

这点对 Tenstorrent 特别关键。

因为它卖的是“开放到底层”的能力。开放不是免费的。你拿到了更多旋钮，也意味着你要理解更多硬件约束。

如果只是想今天装上卡，明天所有 PyTorch 模型都像 CUDA 一样成熟地跑起来，Tenstorrent 不是最省事的选项。

如果你要做特定模型、特定算子、特定推理服务，愿意为了成本、功耗、可控性和供应链多付工程投入，它才开始有意义。

## 五、工具链：它押的是开源全栈，而不是只兼容 PyTorch

Tenstorrent 的软件栈可以分三层看。

最高层是 TT-Forge。

它是 MLIR-based compiler，目标是从 PyTorch、JAX、TensorFlow 这类框架把模型 lowering 到 Tenstorrent 硬件上。对大多数模型开发者来说，这层最重要，因为它决定“我已有模型能不能少改代码跑起来”。

中间层是 TT-NN。

它是 Python/C++ 神经网络算子库，接口尽量像 PyTorch，但会暴露更多硬件相关选择，比如 memory layout、data format、math fidelity、L1 还是 DRAM、op selection 和 parallelization。

底层是 TT-Metalium。

这是低级 SDK，给系统工程师和 kernel 工程师用。你可以直接接触 RISC-V processors、NoC、Tensix core 里的 matrix/vector engine，写 C++ kernels，做 fused kernel，调 tile、buffer、sharding。

再往下还有 TT-LLK 和固件侧工作。Blackhole 的 Zephyr 文档显示，它的板卡固件包括 SMC 和 DMC：DMC 处理风扇、电源、telemetry、SMBus 等板级管理；SMC 处理 PCIe、GDDR、Ethernet、电源管理、频率、热管理和 host 通信。

这套栈的战略非常明确：

普通用户走 TT-Forge。

模型/应用开发者走 TT-NN。

性能工程师走 TT-Metalium。

硬件/固件团队还能继续往下。

这和 NVIDIA 最大的差别不是“开不开源”四个字，而是 Tenstorrent 试图把很多通常被封在 vendor stack 里的层次打开。

打开的好处是可审计、可改、可定制、可做主权部署。

打开的代价是生态成熟度要靠时间补。

CUDA 的价值不只是 API。它是十几年积累下来的模型、kernel、profiling、bug workaround、社区经验和默认路径。

Tenstorrent 要赢，不是靠说“我开源”，而是要让足够多的模型在它上面少踩坑地跑起来。

它自己也知道这个问题，所以开发者页面把模型兼容性做成了入口。公开页面列了大约 60 个模型，覆盖 LLM、视觉、文本到图像、文本到视频、embedding、speech-to-text 等任务，并提供硬件筛选，包括 Wormhole n150/n300、Blackhole p100/p150、QuietBox 和 Galaxy。

官方在 Galaxy 页面上写“90% of models from HuggingFace just work”。这句话要谨慎看，它是厂商说法，不等于所有生产模型都能零成本迁移。

但它说明 Tenstorrent 当前补课的重点：不是只把硬件做出来，而是把模型覆盖表做厚。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

## 六、Roadmap：从 Wormhole 到 Blackhole，再到 CPU/IP 和 chiplet

Tenstorrent 的路线可以分成两条线。

第一条是 AI accelerator 线。

Grayskull 是更早的开发者产品，学术论文和社区实验比较多。

Wormhole 是已经商品化的开发卡、工作站和 Galaxy Wormhole 服务器。

Blackhole 是当前主推代际。它从 PCIe 卡、QuietBox，到 Galaxy Blackhole 服务器和 supercluster 都在铺。

从公开规格看，Blackhole 相比 Wormhole 的变化很直接：PCIe 5.0，更多本地 SRAM，更高 GDDR6 带宽，更强外部连接，16 个 Big RISC-V core，面向单卡、桌面、多卡和服务器统一推进。

第二条是 RISC-V CPU/IP 线。

Ascalon 是 Tenstorrent 明确公开的高性能 RISC-V CPU IP。它不是 Tensix 里的 baby RISC-V，而是面向服务器、AI infrastructure、汽车 HPC、ADAS 等场景的通用高性能 CPU core。

这条线的意义在于，Tenstorrent 不想只当加速器供应商。

它想成为“AI + RISC-V + chiplet”供应商。

这也是为什么它会讲 Innovation License，讲客户可以 own and customize IP；为什么它会参加 CHASSIS 这种汽车 chiplet 项目；为什么它会和 Baya Systems 这类 fabric/IP 公司合作；为什么它会和 Rapidus、Samsung 等先进制程生态联系在一起。

对外界传闻或媒体报道里的下一代名字，比如 Quasar、Grendel、Aegis，要分开看。

它们能帮助我们理解 Tenstorrent 过去几年的路线讨论：AI chiplet、高性能 RISC-V CPU、Tensix 组合、不同代工厂和不同工艺节点。

但写工程判断时，最好不要把未在当前产品页明确落地的名字，当成已经可购买产品。

目前能确认的主线是：

- Wormhole：上一代已商品化；
- Blackhole：当前主推，从卡到工作站到 Galaxy；
- Ascalon：高性能 RISC-V CPU IP；
- Galaxy Blackhole：面向生产和 supercluster 的服务器产品；
- chiplet/IP：明确是战略方向，但具体代际要看正式发布。

## 七、RISC-V 到底是不是优势

Tenstorrent 身上最容易被放大的标签，就是 RISC-V。

但这个标签要拆开看。

如果问题是“RISC-V 算 MatMul 是不是天然比 GPU 强”，答案基本是否定的。

RISC-V 是指令集，不是魔法。普通 RISC-V core 不会因为开放，就突然比 NVIDIA Tensor Core 更适合大规模矩阵乘。

Tenstorrent 的优势不在这里。

它的优势在于把 RISC-V 放在了一个更合适的位置：控制面。

Tensix 里的 RISC-V cores 负责调度、搬运、同步、发命令、管理数据流。矩阵/向量吞吐交给专门的 matrix engine 和 vector engine。Blackhole 里还有 16 个 Big RISC-V cores，可以承担更复杂的系统控制和通用计算角色。

这带来几个好处。

第一，可定制。

RISC-V 是开放 ISA，Tenstorrent 可以围绕自己的 AI 数据流、NoC、SRAM、chiplet 和系统管理需求做更深的设计，不必把自己塞进传统 GPU 的控制模型里。

第二，可授权。

Ascalon 这条线说明 Tenstorrent 不只想卖加速卡，也想把高性能 RISC-V CPU IP、系统 IP 和 AI accelerator 组合授权给客户。对车企、主权 AI、区域云、自研 SoC 团队来说，“我能拥有和定制这套 IP”比“我买一批卡”更有吸引力。

第三，可审计。

RISC-V、Zephyr、TT-Metalium、TT-NN、TT-Forge 这些开源或开放入口，给了客户更多可见性。对一些金融、政府、企业私有部署场景，黑盒程度低本身就是卖点。

第四，软件和硬件协同空间更大。

你可以在 TT-NN 里选 memory layout、data format、math fidelity，也可以在 TT-Metalium 里下沉到 tile、circular buffer、NoC 和 kernel。这个路径比“只能等 vendor 提供封装好的算子”更灵活。

但 RISC-V 不是免费午餐。

最大缺点是生态。

CUDA 的护城河不只是 API，而是十几年积累下来的库、kernel、profiling、debug、框架适配、量化路径、部署经验和工程默认值。很多团队今天不是“喜欢 CUDA”，而是离不开 CUDA 周边那套成熟路径。

Tenstorrent 即使用 RISC-V，也不能自动获得这些。

第二个缺点是迁移成本。

现成 PyTorch 模型能不能 compile，是第一关。

跑起来以后，性能是不是好，是第二关。

进生产以后，p99、显存/内存池、batching、模型热切换、监控、故障隔离、框架插件，是第三关。

RISC-V 本身解决不了这些。

第三个缺点是工程门槛。

开放底层意味着你可以调更多东西，也意味着你要懂更多东西。tile size、L1 sharding、NoC 路径、data format、math fidelity、kernel fusion，这些都不是普通应用团队日常想碰的东西。

第四个缺点是参数口径容易误导。

Blackhole 的 BlockFP8 峰值很好看，但 Block floating point 不是所有模型都能无成本受益。GDDR6 成本友好，也绕开一部分 HBM 供应压力，但带宽不如高端 HBM GPU。Tenstorrent 必须靠 SRAM、NoC 和数据流优化把这部分补回来。

所以，RISC-V 对 Tenstorrent 的意义不是“让它变成更快的 GPU”。

它的意义是让 Tenstorrent 有机会做一套更开放、更可定制、更像系统平台的 AI 计算架构。

这条路的上限很高。

但短期风险也很明确：生态不够厚、迁移不够顺、生产案例不够多，就会变成“很有工程美感，但只有少数团队用得起来”的平台。

## 八、它和 NVIDIA、Groq、Cerebras 的差别

如果只问“谁最快”，这个话题会很无聊。

不同 AI 芯片公司的系统假设不一样。

NVIDIA 的优势是生态和通用性。GPU 不一定是每个 workload 的最优硬件，但 CUDA、cuDNN、TensorRT、NCCL、PyTorch 路径、运维经验和云上供给，构成了事实标准。

Groq 的路线更像极致低延迟 token 机器。它把确定性执行、编译调度和 LPU 架构做到非常激进，适合强调 decode latency 的场景。

Cerebras 的路线是 wafer-scale。它试图用一整片晶圆减少跨芯片通信，把超大规模片上计算和 SRAM 做到极致。

Tenstorrent 夹在中间。

它没有 NVIDIA 的生态厚度。

它没有 Groq 那种单点低延迟叙事的纯粹。

它也没有 Cerebras 一整片晶圆那么强的视觉冲击。

但它有一个独特组合：相对开放的低层软件、RISC-V 可编程控制、Tensix 数据流、GDDR6 成本路线、以太网 scale-out、IP 授权。

这让它更像一个“工程可塑性”很强的平台。

它不一定在所有场景里最快。

但它希望你相信：当模型形态变化很快，系统不应该被一个封闭加速器栈锁死。

这也是 Tenstorrent 的商业叙事：

不是单颗芯片赢 NVIDIA。

而是在某些客户那里，用更开放、更便宜、更可控的系统，替代一部分昂贵且封闭的 AI 基础设施。

## 九、它真正适合谁

从工程角度看，Tenstorrent 当前更适合四类人。

第一类是愿意早期投入的系统团队。

他们关心单位 token 成本、功耗、供应链、私有部署，不怕调工具链，也有能力改模型和 kernel。

第二类是主权 AI、私有 AI、企业本地部署。

这类客户不只看跑分，还看供应链可控、软件可审计、是否能在自己的数据中心或合作云里长期运维。

第三类是研究和开发团队。

他们需要的不一定是最高性价比，而是能看见底层：NoC 怎么走、SRAM 怎么 shard、kernel 怎么写、模型怎么 lower。

第四类是想做自研芯片或定制 SoC 的客户。

对他们来说，Ascalon、Tensix、chiplet、Innovation License 可能比买一张卡更重要。

不适合谁？

不适合只想无脑替换 CUDA 的团队。

不适合依赖大量现成 CUDA extension、flash attention 变体、量化后端、推理框架插件的团队。

也不适合没有底层工程预算，却想马上把所有模型搬过去的团队。

迁移成本是真实成本。

生态不成熟也是真实风险。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

Tenstorrent 的产品越开放，对工程团队的要求就越高。

## 十、怎么判断这家公司后面有没有戏

看 Tenstorrent，别只盯一张卡的规格表。

可以盯五个指标。

第一，模型覆盖是不是持续变厚。

不是 demo 列表，而是主流 open-weight LLM、VLM、diffusion、embedding、speech、agent workload 在真实部署里能不能稳定跑。

第二，TT-Forge 能不能把“能跑”变成“好跑”。

编译失败、算子 fallback、性能不稳定、debug 不透明，都会杀死开发者耐心。

第三，TT-NN 和 TT-Metalium 的性能路径是否清楚。

一个好平台应该让普通用户有默认路径，让高手有优化路径，而不是所有人都被迫下沉到底层。

第四，Galaxy Blackhole 的客户部署是不是真实扩大。

官方已经提到 Equinix Distributed AI Hub、OrionVM、BetterBrain、Virtu Financial、Turiyam、Cirrascale、ai& 等部署或合作。后续要看这些名字能不能变成可复用案例，而不是发布会截图。

第五，Blackhole 之后的代际能不能按时落地。

AI 芯片公司最怕一代产品让开发者试用，下一代延期，软件栈又要重做。Tenstorrent 的承诺是同一编程模型从单 core 扩到 thousands of servers。这个承诺只有跨代稳定才算数。

## 十一、我的判断

Tenstorrent 最值得看的，不是“RISC-V 能不能打 GPU”。

这个问题本身就问错了。

RISC-V 在这里不是替代 CUDA core 的万能算术单元。它是开放控制面，是可编程调度层，是 Tenstorrent 把 AI accelerator 做成可组合系统的一部分。

真正的问题是：

在大模型推理进入长上下文、MoE、视频生成、agent 工作流之后，AI 系统的主要矛盾会不会从“单卡算力”转到“数据怎么放、怎么搬、怎么跨设备流动”？

如果答案是会，Tenstorrent 的架构就有价值。

它用 Tensix 做局部计算岛，用 SRAM 做近端复用，用 NoC 和以太网做 scale-out，用 TT-Forge/TT-NN/TT-Metalium 给不同层次的开发者入口，用 Ascalon/IP 去争取更深的系统控制权。

这条路很难。

因为它不仅要造芯片，还要补软件生态、补模型覆盖、补生产案例、补开发者信任。

但它不是一条没逻辑的路。

NVIDIA 的护城河是生态。

Tenstorrent 现在能打的牌，是开放、可控、成本、数据流和系统级 scale-out。

它短期不会成为“通用 GPU 替代品”。

更现实的定位是：在某些愿意付迁移成本的推理、私有部署、主权 AI、特定模型优化和自研芯片客户里，成为 CUDA 之外的一条认真路线。

这已经不小了。

AI 芯片市场不缺“峰值算力故事”。

缺的是能把芯片、内存、网络、编译器、模型和部署成本讲成一套工程闭环的公司。

Tenstorrent 现在还没证明自己一定能赢。

但它至少提出了一个值得工程师认真看待的问题：

如果未来 AI 计算的瓶颈不是某个算子，而是整个系统的数据流，那下一代 AI 基础设施，可能就不会长得像今天的 GPU 集群。

芯片与算力 · 目录

继续滑动看下一个

口袋 AI 系统笔记

向上滑动看下一个