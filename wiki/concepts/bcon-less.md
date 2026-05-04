---
doc_id: bcon-less
title: Bcon-less（无背光控制器架构）
page_type: concept
related_sources:
  - src-macroblock-mcu-less-mini-led-backlight
  - src-innolux-mini-led-bcon-controller
  - src-changhong-bconless-first-launch
  - src-mingweidz-sm6228n-bconless
  - src-sigmaintell-mini-led-cost-down
  - src-ti-e2e-local-dimming-architecture
related_entities: []
created: 2026-05-04
updated: 2026-05-04
tags: [concept, display, backlight, mini-led, local-dimming, system-architecture]
---

# Bcon-less（无背光控制器架构）

## 定义

Bcon-less（或写作 Bconless）是 Mini LED 背光显示领域的一种系统架构创新，其核心思路是**取消独立的背光控制 MCU（即 BCON 芯片）**，将背光分区调光（Local Dimming）、时序控制等功能直接集成到主 SoC 或 FPGA 中，从而简化系统架构、降低物料成本（BOM）并减少信号传输延迟。

术语中的 "Bcon" 即 **Backlight Control** 的缩写，是显示行业的通用术语（见 Innolux 技术资料）。Bcon-less 即 "无需独立背光控制器" 的架构。

## 技术架构对比

| 维度 | 传统架构（含 Bcon） | Bcon-less 架构 |
|------|---------------------|----------------|
| **控制链路** | 主 SoC → BCON MCU → LED 驱动 IC → Mini LED 灯板 | 主 SoC（内置调光算法）→ LED 驱动 IC → Mini LED 灯板 |
| **芯片数量** | 需独立 BCON/背光 MCU | 取消独立 MCU，功能集成至主控 |
| **链路延迟** | 多一级通信，延迟较高 | 链路缩短，响应更快 |
| **BOM 成本** | 含 MCU 及周边电路成本 | 省去 MCU 芯片及配套电路 |
| **算法迭代** | 受限于 MCU 固件更新 | 主 SoC 直接控制，灵活性更高 |

## 技术细节

### 中小尺寸天然适合 Bcon-less

Macroblock（聚积科技）的 MBI6322/MBI6334 方案专为中小尺寸（笔电/平板）设计，无需 MCU，可直接配合 T-con IC 或 Bridge IC 工作：

- **MBI6322**：内置 MOSFET，高集成度
- **MBI6334**：细长 BGA 封装，适配窄 PCB

### TV 级大尺寸是突破重点

传统中大尺寸 TV（分区数多、电流大）通常保留 MCU（如 Nuvoton M484）。长虹 2022 年率先在 TV 级 Mini LED 产品中实现 Bconless 量产，是行业标志性事件。

### 驱动芯片适配

明微电子 SM6228N 系列明确标注 "适用于降本 BCONLESS 场景"，内置 BFI（Black Frame Insertion）功能，支持 VRR + Local Dimming 联动。

## 发展历程

| 时间 | 事件 | 意义 |
|------|------|------|
| 2021 | Macroblock MBI6322/MBI6334 发布 | 中小尺寸 MCU-less 方案成熟 |
| 2022.07 | 长虹智慧显示首发 Bconless 技术 | TV 级大尺寸首次取消背光 MCU |
| 2025 | 明微电子 SM6228N 系列推出 | 上游驱动芯片明确支持 Bconless |
| 2025-2026 | 群智咨询持续跟踪 | 行业研究将 Bconless 列为核心降本路径 |

## 优势

- **成本降低**：省去 MCU 芯片及外围器件
- **延迟优化**：减少通信层级，改善 Halo 效应
- **集成度提升**：PCB 更简洁，利于超薄设计
- **算法灵活**：调光算法直接运行于 SoC，OTA 迭代方便

## 专利现状

目前公开数据库中**尚无标题直接包含 "Bconless" 的专利**。竞争壁垒主要在：

1. **芯片层面**：Macroblock 共阴极驱动架构（US 11,132,940 B2 / US 11,132,939 B2）
2. **整机集成层面**：长虹 Mini-LED 背光模组专利（CN121500636A、CN224177061U）

## 产业链参与者

| 企业 | 角色 | 关键动态 |
|------|------|----------|
| 长虹智慧显示 | 整机 OEM | 2022 年首发 Bconless 并量产 |
| 明微电子 | 驱动 IC | SM6228N 明确支持 Bconless |
| Macroblock | 驱动 IC | MBI6322/MBI6334 中小尺寸 MCU-less |
| 群智咨询 | 行业研究 | 将 Bconless 列为核心降本路径 |

## 趋势判断

- 中小尺寸（笔电/平板）已天然适合 Bcon-less
- TV 级大尺寸的无 MCU 方案是降本关键路径
- 若成为 TV 主流架构，传统 MCU 供应商（Nuvoton 等）份额将被侵蚀
- 驱动芯片竞争焦点从 "驱动精度" 转向 "SoC 直连兼容性 + 调试体验"

## 相关来源

- [[src-macroblock-mcu-less-mini-led-backlight]] — Macroblock MCU-less 方案官方技术文章
- [[src-innolux-mini-led-bcon-controller]] — Innolux Bcon 控制器定义
- [[src-changhong-bconless-first-launch]] — 长虹首发 Bconless 技术报道
- [[src-mingweidz-sm6228n-bconless]] — 明微电子 SM6228N 支持 Bconless
- [[src-sigmaintell-mini-led-cost-down]] — 群智咨询 Mini LED 降本路径分析
- [[src-ti-e2e-local-dimming-architecture]] — TI E2E Local Dimming 系统架构讨论

## 相关概念

- [[mini-led]] — Bcon-less 主要应用于 Mini LED 背光系统
- [[local-dimming]] — Bcon-less 的核心功能是集成 Local Dimming 控制
- [[led-driver]] — 驱动 IC 的 SoC 直连兼容性是 Bcon-less 的关键
- [[tcon]] — 部分 Bcon-less 方案通过 T-con IC 转接调光信号
- [[mcu]] — Bcon-less 试图取消的独立控制单元

## 相关实体

- [[changhong]] — 长虹智慧显示，Bconless TV 量产首发
- [[mingweidz]] — 明微电子，SM6228N 驱动芯片
- [[macroblock]] — 聚积科技，中小尺寸 MCU-less 方案
