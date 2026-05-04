# Bcon-less Mini-LED 背光技术分析报告

## 1. 技术概述

**Bcon-less**（或写作 Bconless）是 Mini LED 背光显示领域的一种系统架构创新，其核心思路是**取消独立的背光控制 MCU（即 BCON 芯片）**，将背光分区调光（Local Dimming）、时序控制等功能直接集成到主 SoC 或 FPGA 中，从而简化系统架构、降低物料成本（BOM）并减少信号传输延迟。

该术语中的 "Bcon" 即 **Backlight Control** 的缩写，指传统方案中负责背光分区控制的独立微控制器单元。

---

## 2. 技术架构对比

| 维度 | 传统架构（含 Bcon） | Bcon-less 架构 |
|------|---------------------|----------------|
| **控制链路** | 主 SoC → BCON MCU → LED 驱动 IC → Mini LED 灯板 | 主 SoC（内置调光算法）→ LED 驱动 IC → Mini LED 灯板 |
| **芯片数量** | 需独立 BCON/背光 MCU | 取消独立 MCU，功能集成至主控 |
| **链路延迟** | 多一级通信，延迟较高 | 链路缩短，响应更快 |
| **BOM 成本** | 含 MCU 及周边电路成本 | 省去 MCU 芯片及配套电路 |
| **算法迭代** | 受限于 MCU 固件更新 | 主 SoC 直接控制，灵活性更高 |

---

## 3. 行业发展历程

### 3.1 长虹智慧显示 —— 行业首发

2022 年 7 月，长虹智慧显示在行业首次推出 Bconless 技术方案，取消了独立的背光控制 MCU，完成了从芯片选型、通信协议到调光算法的全链路底层设计优化，并在内部代号为 "4号项目" 的 Mini LED 电视产品中率先实现量产。

> 来源：四川省政府国有资产监督管理委员会（2025-06-17）
> [http://gzw.sc.gov.cn/scsgzw/CU230204/2025/6/17/64aa202f31d4480583d3e7aa18f4ae74.shtml](http://gzw.sc.gov.cn/scsgzw/CU230204/2025/6/17/64aa202f31d4480583d3e7aa18f4ae74.shtml)

### 3.2 明微电子 —— 芯片层跟进

2025 年，明微电子推出 **SM6228N** 系列 Mini LED 驱动芯片，在其官方资料中明确标注该产品 "特别适用于降本 BCONLESS 场景下的应用需求"，并强调该芯片在双线版本下可为 Bconless 方案提供更好的调试体验。该芯片内置 BFI（Black Frame Insertion）功能，并支持 VRR（可变刷新率）与 Local Dimming 联动。

> 来源：
> - 中芯巨能 [https://www.icanic.cn/news/6811.html](https://www.icanic.cn/news/6811.html)
> - 中国 IC 网 [https://www.chinaasic.com/news/news_detail_193.html](https://www.chinaasic.com/news/news_detail_193.html)
> - 新浪科技 [https://tech.sina.cn/2026-03-06/detail-inhpzrep9226272.d.html](https://tech.sina.cn/2026-03-06/detail-inhpzrep9226272.d.html)

### 3.3 群智咨询 —— 行业研究定位

群智咨询（Sigmaintell）在 Mini LED 背光电视行业研究报告中，多次将**采用 Bconless 技术**列为核心降本路径之一，与芯片倒装、封装工艺优化、灯板方案改进等并列，认为该技术是 Mini LED 电视向更大规模普及演进的关键手段。

> 来源：新浪财经（群智咨询报告转载）
> [https://cj.sina.cn/articles/view/5835524730/15bd30a7a02001v8jq](https://cj.sina.cn/articles/view/5835524730/15bd30a7a02001v8jq)

---

## 4. 技术优势分析

| 优势 | 具体说明 |
|------|----------|
| **成本降低** | 直接省去 BCON MCU 芯片及其外围电阻、电容、晶振等配套器件，降低整机 BOM 成本 |
| **延迟优化** | 减少 SoC 与背光控制单元之间的通信层级，背光响应速度提升，有助于改善动态画面的光晕（Halo）问题 |
| **集成度提升** | PCB 布局更简洁，有利于超薄机型设计 |
| **算法灵活性** | 调光算法直接运行于主 SoC，便于通过 OTA 升级迭代，无需单独更新背光 MCU 固件 |

---

## 5. 产业链关键参与者

| 企业/机构 | 角色定位 | 关键动态 |
|-----------|----------|----------|
| **长虹智慧显示** | 整机方案首发 / TV OEM | 2022 年首发 Bconless 技术并完成量产落地 |
| **明微电子** | Mini LED 驱动 IC 设计 | SM6228N 明确支持 Bconless 降本场景 |
| **群智咨询** | 行业研究与咨询 | 持续跟踪 Bconless 对 Mini LED 背光降本的贡献 |

---

## 6. 相关专利布局

> 说明：目前公开数据库中尚未检索到标题或摘要中直接包含 "Bconless" 或 "BCON-less" 字样的专利。以下专利为长虹近期在 Mini LED 背光模组领域的布局，可能与 Bconless 技术演进相关，但具体权利要求是否覆盖该架构需进一步分析。

| 专利号 | 类型 | 名称 | 申请/公开时间 | 链接 |
|--------|------|------|---------------|------|
| **CN121500636A** | 发明专利 | Mini-LED 背光模组 | 2025.12 申请 / 2026.02 公开 | [新浪财经](https://finance.sina.cn/2026-04-25/detail-inhvskfk4165326.d.html) |
| **CN224177061U** | 实用新型 | LED 背光模组 | 2025.05 申请 | [网易](https://www.163.com/dy/article/KRK7A1JU0519QIKK.html) |

---

## 7. 总结与展望

Bcon-less 技术代表了 Mini LED 背光电视从 **"模块化堆叠" 向 "高度集成"** 演进的重要方向。通过取消独立的背光控制 MCU，该架构在成本控制、系统延迟和集成度方面均有显著优势。

随着长虹等整机厂商的量产验证，以及明微电子等上游驱动芯片厂商的产品适配，Bconless 有望成为中端及入门级 Mini LED 电视的主流方案之一，加速 Mini LED 显示技术的普及。

---

## 8. 参考链接汇总

| 序号 | 来源 | 链接 |
|------|------|------|
| 1 | 四川省国资委 — 长虹首发 Bconless 技术报道 | [http://gzw.sc.gov.cn/scsgzw/CU230204/2025/6/17/64aa202f31d4480583d3e7aa18f4ae74.shtml](http://gzw.sc.gov.cn/scsgzw/CU230204/2025/6/17/64aa202f31d4480583d3e7aa18f4ae74.shtml) |
| 2 | 中芯巨能 — 明微电子 SM6228N 介绍（BCONLESS 场景） | [https://www.icanic.cn/news/6811.html](https://www.icanic.cn/news/6811.html) |
| 3 | 中国 IC 网 — SM6228NI Bconless 调试体验 | [https://www.chinaasic.com/news/news_detail_193.html](https://www.chinaasic.com/news/news_detail_193.html) |
| 4 | 新浪科技 — 明微电子 SM6228N 内置 BFI / VRR+Local Dimming 联动 | [https://tech.sina.cn/2026-03-06/detail-inhpzrep9226272.d.html](https://tech.sina.cn/2026-03-06/detail-inhpzrep9226272.d.html) |
| 5 | 群智咨询 — Mini LED 背光降本路径（Bconless 技术） | [https://cj.sina.cn/articles/view/5835524730/15bd30a7a02001v8jq](https://cj.sina.cn/articles/view/5835524730/15bd30a7a02001v8jq) |
| 6 | 新浪财经 — 长虹 Mini-LED 背光模组专利 CN121500636A | [https://finance.sina.cn/2026-04-25/detail-inhvskfk4165326.d.html](https://finance.sina.cn/2026-04-25/detail-inhvskfk4165326.d.html) |
| 7 | 网易 — 长虹 LED 背光模组专利 CN224177061U | [https://www.163.com/dy/article/KRK7A1JU0519QIKK.html](https://www.163.com/dy/article/KRK7A1JU0519QIKK.html) |

---

*报告整理时间：2026-05-04*  
*数据来源：公开新闻报道、企业官方资料、行业研究机构*