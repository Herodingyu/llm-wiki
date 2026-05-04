# Bcon-less Mini-LED 背光技术分析

## 1. 技术概述

**Bcon-less**（或写作 Bconless）是 Mini LED 背光显示领域的一种系统架构创新，其核心思路是**取消独立的背光控制 MCU（即 BCON 芯片）**，将背光分区调光（Local Dimming）、时序控制等功能直接集成到主 SoC 或 FPGA 中，从而简化系统架构、降低物料成本（BOM）并减少信号传输延迟。

该术语中的 "Bcon" 即 **Backlight Control** 的缩写，指传统方案中负责背光分区控制的独立微控制器单元。

---

## 2. 术语溯源："Bcon" 在显示行业中的定义

### 2.1 Innolux（群创光电）的技术资料

Innolux 在 Mini LED 背光方案的技术说明中明确将 "Bcon" 作为标准术语使用：

| 接口类型 | 背光控制方案 |
|----------|-------------|
| MIPI | 需独立的 MCU board |
| **LVDS** | 使用 **Bcon 背光控制器** |
| eDP | 功能集成在 Tcon 时序控制器中 |

> 来源：Beck Elektronik — Innolux Mini LED Display 技术资料  
> [https://www.beck-elektronik.de/en/newsroom/news/article/innolux-mini-led-display-new-local-dimming-backlight-technology](https://www.beck-elektronik.de/en/newsroom/news/article/innolux-mini-led-display-new-local-dimming-backlight-technology)

这说明 **"Bcon" = Backlight Controller** 是显示行业的通用缩写，非某家厂商专有名词。

---

## 3. 技术架构对比

| 维度 | 传统架构（含 Bcon） | Bcon-less 架构 |
|------|---------------------|----------------|
| 控制链路 | SoC → BCON MCU → LED Driver IC → Mini LED 灯板 | SoC（内置调光算法）→ LED Driver IC → Mini LED 灯板 |
| 芯片数量 | 需独立 BCON/背光 MCU | 取消独立 MCU，功能集成至主控 |
| 链路延迟 | 多一级通信，延迟较高 | 链路缩短，响应更快 |
| BOM 成本 | 含 MCU 及周边电路成本 | 省去 MCU 芯片及配套电路 |
| 算法迭代 | 受限于 MCU 固件更新 | 主 SoC 直接控制，灵活性更高 |

---

## 4. 行业发展历程

### 4.1 Macroblock（聚积科技）— MCU-less 方案的先行者

Macroblock 是 Mini-LED 背光驱动 IC 的核心供应商之一，其技术路线与 Bcon-less 概念直接对应：

#### 中小尺寸方案（无需 MCU）

| 芯片 | 尺寸定位 | MCU 需求 | 关键特性 |
|------|----------|----------|----------|
| **MBI6322** | 笔电/平板 | **无需 MCU** | 内置 MOSFET，可直接配合 T-con IC 或 Bridge IC |
| **MBI6334** | 窄 PCB 设备 | **无需 MCU** | 细长 BGA 封装，适配紧凑空间 |

> 关键表述："MBI6322 and MBI6334 **do not need to apply MCU** to handle the dimming signal of the mini-LED backlight matrix. They can choose commercially available **T-con ICs or bridge ICs directly**."
>
> 来源：Macroblock 官方技术文章（2021-07-12）  
> [https://www.mblock.com.tw/en/news/detail/303](https://www.mblock.com.tw/en/news/detail/303)

#### 中大尺寸方案（通常需要 MCU）

| 芯片 | 尺寸定位 | MCU 需求 | 关键特性 |
|------|----------|----------|----------|
| MBI6353 | TV/Monitor/ PID | 通常需要 MCU | 大电流，多 LED 并联 |
| MBI6328 | TV/Monitor | 通常需要 MCU | 高压，多 LED 串联 |

传统中大尺寸 TV 方案通常搭配 **Nuvoton M484** 等 MCU。长虹的 Bconless 量产突破正是将 **TV 级大尺寸方案** 也做成了无 MCU 架构。

### 4.2 长虹智慧显示 — 行业首发 TV 级 Bconless

2022 年 7 月，长虹智慧显示在行业首次推出 Bconless 技术方案，取消了独立的背光控制 MCU，完成了从芯片选型、通信协议到调光算法的全链路底层设计优化，并在内部代号为 "4号项目" 的 Mini LED 电视产品中率先实现量产。

> 来源：四川省政府国有资产监督管理委员会（2025-06-17）  
> [http://gzw.sc.gov.cn/scsgzw/CU230204/2025/6/17/64aa202f31d4480583d3e7aa18f4ae74.shtml](http://gzw.sc.gov.cn/scsgzw/CU230204/2025/6/17/64aa202f31d4480583d3e7aa18f4ae74.shtml)

### 4.3 明微电子 — 芯片层跟进

2025 年，明微电子推出 **SM6228N** 系列 Mini LED 驱动芯片，在其官方资料中明确标注该产品 "特别适用于降本 BCONLESS 场景下的应用需求"，并强调该芯片在双线版本下可为 Bconless 方案提供更好的调试体验。该芯片内置 BFI（Black Frame Insertion）功能，并支持 VRR（可变刷新率）与 Local Dimming 联动。

> 来源：
> - 中芯巨能 [https://www.icanic.cn/news/6811.html](https://www.icanic.cn/news/6811.html)
> - 中国 IC 网 [https://www.chinaasic.com/news/news_detail_193.html](https://www.chinaasic.com/news/news_detail_193.html)
> - 新浪科技 [https://tech.sina.cn/2026-03-06/detail-inhpzrep9226272.d.html](https://tech.sina.cn/2026-03-06/detail-inhpzrep9226272.d.html)

### 4.4 群智咨询（Sigmaintell）— 行业研究定位

群智咨询在 Mini LED 背光电视行业研究报告中，多次将 **采用 Bconless 技术** 列为核心降本路径之一，与芯片倒装、封装工艺优化、灯板方案改进等并列，认为该技术是 Mini LED 电视向更大规模普及演进的关键手段。

> 来源：新浪财经（群智咨询报告转载）  
> [https://cj.sina.cn/articles/view/5835524730/15bd30a7a02001v8jq](https://cj.sina.cn/articles/view/5835524730/15bd30a7a02001v8jq)

---

## 5. 技术优势分析

| 优势 | 具体说明 |
|------|----------|
| **成本降低** | 直接省去 BCON MCU 芯片及其外围电阻、电容、晶振等配套器件，降低整机 BOM 成本 |
| **延迟优化** | 减少 SoC 与背光控制单元之间的通信层级，背光响应速度提升，有助于改善动态画面的光晕（Halo）问题 |
| **集成度提升** | PCB 布局更简洁，有利于超薄机型设计 |
| **算法灵活性** | 调光算法直接运行于主 SoC，便于通过 OTA 升级迭代，无需单独更新背光 MCU 固件 |

---

## 6. 产业链关键参与者

| 企业/机构 | 角色定位 | 关键动态 |
|-----------|----------|----------|
| **长虹智慧显示** | 整机方案首发 / TV OEM | 2022 年首发 Bconless 技术并完成量产落地 |
| **明微电子** | Mini LED 驱动 IC 设计 | SM6228N 明确支持 Bconless 降本场景 |
| **Macroblock（聚积科技）** | LED 驱动 IC 设计 | MBI6322/MBI6334 中小尺寸 MCU-less 方案 |
| **群智咨询** | 行业研究与咨询 | 持续跟踪 Bconless 对 Mini LED 背光降本的贡献 |

---

## 7. 专利布局分析

### 7.1 现状说明

目前公开数据库（USPTO、EPO、CNIPA）中**尚未检索到标题或摘要中直接包含 "Bconless" 或 "BCON-less" 字样的专利**。该术语更倾向于行业工程用语，而非专利标准术语。国际厂商通常使用 "MCU-less"、"integrated local dimming control" 等更通用的技术表述。

### 7.2 Macroblock 相关专利

Macroblock 在 Mini-LED/Micro-LED 驱动 IC 领域有明确的美国专利布局，其共阴极驱动架构受到专利保护：

| 专利号 | 类型 | 技术方向 |
|--------|------|----------|
| **US 11,132,940 B2** | 授权 | 共阴极 LED 驱动架构 |
| **US 11,132,939 B2** | 授权 | 共阴极 LED 驱动架构 |

> 来源：Macroblock 官方产品页  
> [https://www.mblock.com.tw/en/Driver_ICs/LED_Driver_ICs/detail/94](https://www.mblock.com.tw/en/Driver_ICs/LED_Driver_ICs/detail/94)

### 7.3 LG Electronics 相关专利

| 专利号 | 权利人 | 技术方向 |
|--------|--------|----------|
| **EP4207159 A1** | LG Electronics | Local Dimming 控制方法（含 duty ratio 和电流控制） |

> 来源：EPO 专利数据库  
> [https://data.epo.org/publication-server/rest/v1.0/publication-dates/20230705/patents/EP4207159NWA1/document.pdf](https://data.epo.org/publication-server/rest/v1.0/publication-dates/20230705/patents/EP4207159NWA1/document.pdf)

### 7.4 长虹专利

| 专利号 | 类型 | 名称 | 状态 |
|--------|------|------|------|
| **CN121500636A** | 发明专利 | Mini-LED 背光模组 | 2025.12 申请 / 2026.02 公开 |
| **CN224177061U** | 实用新型 | LED 背光模组 | 2025.05 申请 |

> 来源：
> - 新浪财经 [https://finance.sina.cn/2026-04-25/detail-inhvskfk4165326.d.html](https://finance.sina.cn/2026-04-25/detail-inhvskfk4165326.d.html)
> - 网易 [https://www.163.com/dy/article/KRK7A1JU0519QIKK.html](https://www.163.com/dy/article/KRK7A1JU0519QIKK.html)

### 7.5 行业专利趋势

TrendForce / LEDinside 在 2021 年的专利分析中指出：

> "Drivers and backlights were some of the technologies that were in development in the past but less often used in real-life applications... only until 2019-2020 when Mini LED technology matured did local dimming Mini LED displays see rapid growth."
>
> 来源：[https://www.ledinside.com/node/31722](https://www.ledinside.com/node/31722)

Apple、Samsung、LG、TCL 都在大规模布局 Mini LED 背光和 Local Dimming 相关专利，专利集中在：**分区调光算法、背光驱动架构、LED 封装、光学均匀性**。

---

## 8. 技术架构演进方向

### 8.1 传统含 MCU 架构（中大尺寸 TV）
```
SoC → MCU/BCON → LED Driver IC → Mini LED 灯板
```

### 8.2 Bcon-less / MCU-less 架构
```
SoC (内置调光算法) → LED Driver IC → Mini LED 灯板
         ↓
     T-con IC / Bridge IC 转接
```

### 8.3 延迟优化原理

LTS（Lincoln Tech Solutions）在行业资料中提到：

> "A simple downscaling FALD algorithm can compute in an inexpensive FPGA... By performing the calculation at the end of each row in this manner, frame buffers and computational time at the end of the frame aren't required. This method **prevents latency between the backlight and video stream**."
>
> 来源：[https://lincolntechsolutions.com/blog/full-array-local-dimming-mini-led-evolution-ltss-pioneering-journey/](https://lincolntechsolutions.com/blog/full-array-local-dimming-mini-led-evolution-ltss-pioneering-journey/)

---

## 9. 总结与展望

Bcon-less 技术代表了 Mini LED 背光电视从 **"模块化堆叠" 向 "高度集成"** 演进的重要方向。通过取消独立的背光控制 MCU，该架构在成本控制、系统延迟和集成度方面均有显著优势。

### 关键结论

1. **术语来源**："Bcon" = Backlight Controller，是显示行业通用缩写；Bcon-less 是中国整机厂和驱动芯片厂使用的工程营销术语，国际专利数据库中未见该词。

2. **国际对应概念**：Macroblock 的 "MCU-less" 架构、Innolux 的 "Bcon backlight controller" 描述，都是同一技术方向的不同表述。

3. **专利空白**：目前 Bcon-less 作为系统架构概念本身没有直接专利，**竞争壁垒在芯片层面**（Macroblock 的共阴极驱动架构有美国专利保护）和 **整机集成方案层面**（长虹的背光模组专利）。

4. **技术趋势**：中小尺寸（笔电/平板）天然适合 Bcon-less，TV 级大尺寸的无 MCU 方案是降本关键路径。

5. **风险点**：如果 Bcon-less 成为 TV 主流架构，传统 MCU 供应商（Nuvoton 等）在 Mini LED TV 市场的份额会被直接侵蚀。驱动芯片厂商的竞争焦点从 "LED 驱动精度" 转向 "SoC 直连兼容性 + 调试体验"。

---

## 10. 参考链接

| 序号 | 来源 | 链接 |
|------|------|------|
| 1 | Macroblock — MCU-less 方案官方技术文章 | [https://www.mblock.com.tw/en/news/detail/303](https://www.mblock.com.tw/en/news/detail/303) |
| 2 | Innolux Mini LED / Bcon 控制器定义 | [https://www.beck-elektronik.de/en/newsroom/news/article/innolux-mini-led-display-new-local-dimming-backlight-technology](https://www.beck-elektronik.de/en/newsroom/news/article/innolux-mini-led-display-new-local-dimming-backlight-technology) |
| 3 | Macroblock MBI5754 专利声明 | [https://www.mblock.com.tw/en/Driver_ICs/LED_Driver_ICs/detail/94](https://www.mblock.com.tw/en/Driver_ICs/LED_Driver_ICs/detail/94) |
| 4 | LG EP4207159 A1 专利 | [https://data.epo.org/publication-server/rest/v1.0/publication-dates/20230705/patents/EP4207159NWA1/document.pdf](https://data.epo.org/publication-server/rest/v1.0/publication-dates/20230705/patents/EP4207159NWA1/document.pdf) |
| 5 | LEDinside Mini LED 专利分析 | [https://www.ledinside.com/node/31722](https://www.ledinside.com/node/31722) |
| 6 | LTS FALD Mini-LED 技术演进 | [https://lincolntechsolutions.com/blog/full-array-local-dimming-mini-led-evolution-ltss-pioneering-journey/](https://lincolntechsolutions.com/blog/full-array-local-dimming-mini-led-evolution-ltss-pioneering-journey/) |
| 7 | 四川省国资委 — 长虹首发 Bconless | [http://gzw.sc.gov.cn/scsgzw/CU230204/2025/6/17/64aa202f31d4480583d3e7aa18f4ae74.shtml](http://gzw.sc.gov.cn/scsgzw/CU230204/2025/6/17/64aa202f31d4480583d3e7aa18f4ae74.shtml) |
| 8 | 中芯巨能 — 明微电子 SM6228N | [https://www.icanic.cn/news/6811.html](https://www.icanic.cn/news/6811.html) |
| 9 | 群智咨询 — Mini LED 背光降本路径 | [https://cj.sina.cn/articles/view/5835524730/15bd30a7a02001v8jq](https://cj.sina.cn/articles/view/5835524730/15bd30a7a02001v8jq) |
| 10 | TI E2E — Local Dimming 系统架构讨论 | [https://e2e.ti.com/support/power-management-group/power-management/f/power-management-forum/696861/does-ti-have-local-dimming-led-backlight-drive-total-solution](https://e2e.ti.com/support/power-management-group/power-management/f/power-management-forum/696861/does-ti-have-local-dimming-led-backlight-drive-total-solution) |
| 11 | MDPI — Mini-LED Backlight 综述论文 | [https://www.mdpi.com/2073-4352/14/11/922](https://www.mdpi.com/2073-4352/14/11/922) |
| 12 | 新浪财经 — 长虹 Mini-LED 背光模组专利 | [https://finance.sina.cn/2026-04-25/detail-inhvskfk4165326.d.html](https://finance.sina.cn/2026-04-25/detail-inhvskfk4165326.d.html) |

---

*整理时间：2026-05-04*  
*数据更新：基于 2025–2026 年最新公开信息*
