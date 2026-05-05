---
doc_id: av2
title: AV2 视频编码标准
created: 2026-05-05
updated: 2026-05-05
tags: [av2, video-codec, aomedia, av1, streaming, royalty-free]
page_type: concept
---

# AV2 视频编码标准

## 定义

AV2（AOMedia Video 2）是由 [Alliance for Open Media](https://aomedia.org/)（AOMedia）开发的下一代免版税视频编码标准，是 [AV1](https://aomedia.org/av1/) 的继任者。AOMedia 成员包括 Google、Amazon、Apple、Microsoft、Mozilla、Netflix、NVIDIA、IBM、Meta 等。

## 核心改进（相比 AV1）

| 维度 | AV1 | AV2（目标/实测） |
|------|-----|----------------|
| **压缩效率** | 基准 | **+28-32%** 比特率降低（Random Access 配置，VMAF） |
| **主观画质** | 基准 | **~38%** 比特率降低（Google 内部主观测试） |
| **解码复杂度** | 基准 | 不超过 **2×** |
| **AR/VR 支持** | 有限 | **增强**（立体视频、多视图、分屏传输） |
| **屏幕内容** | 一般 | **改进**（palette 模式、inter-block copy） |
| **画质范围** | 有限 | **更广**（低码率到高码率全范围优化） |

> 关键数据来源：Netflix Andrew Norkin 在 QoMEX'25 的演讲（AVM v11.0.0 测试结果）。见 [[src-streaminglearningcenter-inside-av2-architecture|Inside AV2 架构分析]]。

## 发展时间线

- **2018**：AV1 正式发布
- **2020**：AV2 开发启动
- **2025.09**：AOMedia 宣布年底发布，完成低层工具集定稿
- **2025.10**：AVM v11.0.0 性能数据公开（RA 配置 28.6-32.6% 增益）
- **2026.01**：CES 2026 上 VideoLAN 展示 VLC 4 实时解码 AV2（Arm MacBook）
- **2026.03**：AOMedia 发布 **draft specification**，Google/VideoLAN/THX 联合演示笔记本实时解码

## TV 领域相关性

### 为什么 TV SOC 需要关注 AV2

当前 TV 行业报告中，**AV1 已从旗舰设备向中端产品线全面渗透**，成为智能电视的"基础配置"：
- AV1 相较 HEVC 在 4K/8K 下可实现 **20-26%** 压缩效率提升
- YouTube、Netflix 已全面采用 AV1 分发
- Apple TV 4K（第三代）等设备已实现 AV1 硬件解码

AV2 的 TV 端落地时间预测：
- **2026-2027**：桌面浏览器软件解码先行（YouTube/Chrome），智能电视需等待硬件支持
- **2027-2028**：若 Netflix/YouTube 强力推动，智能电视和机顶盒硬件解码可能率先落地（参考 AV1：2018 发布 → 2020 首批电视支持）
- **移动端**：高通、联发科、苹果已重注 VVC，AV2 硬件支持可能更慢

### TV SOC 解码能力规划建议

| TV 档位 | AV2 硬件解码必要性 | 建议 |
|---------|-------------------|------|
| **4K Premier** | **2027-2028 必须支持** | 高端电视生命周期 3-5 年，2026 年发布的 SOC 应预留 AV2 解码能力或至少确保芯片架构可扩展 |
| **4K Main** | **2028-2029 建议支持** | 中端电视更新周期较长，下一代平台（2027-2028）应纳入 AV2 硬件解码 |
| **4K Entry** | **2030 前不必** | 入门级电视靠云端转码或 H.265/AV1 硬解即可，AV2 成本收益比不划算 |

## 技术细节

### 编码工具集

AV2 保持混合块架构（35 年经典框架），核心工具：
- **改进的 intra-prediction**（帧内预测）
- **增强 temporal filtering**（时域滤波）
- **Palette 模式 + Inter-block copy**（屏幕内容优化）
- **Multi-layer / Atlas-based composition**（多层/图集视频合成）
- **Film Grain Synthesis（FGS）**：AV2 中升级为**强制工具**（AV1 中为可选）

### 测试条件

AOM Testing Subgroup 定义 Common Test Conditions（v7.0，文档 CWG-E083）：
- 91 个视频序列 + 51 张图片
- 新增 HDR（BT.2100 PQ）、用户生成内容（手持/运动相机）
- 支持 4:2:2 和 4:4:4 色度采样
- 帧率覆盖 15-120 fps

### 部署障碍

1. **硬件支持空白**：目前无消费级芯片支持 AV2 硬件解码
2. **编码器成熟度**：参考编码器（AVM）性能已验证，但生产级编码器（类似 SVT-AV1）尚未出现
3. **DRM 集成**：Widevine/PlayReady/FairPlay 集成需要时间，premium 内容会延后
4. **IP 风险**：AOMedia 免版税，但第三方专利池（Access Advance、Avanci、Sisvel）可能主张权利

## 与竞品对比

| 编码标准 | 组织 | 版税 | 压缩效率（vs H.264） | 状态 |
|---------|------|------|---------------------|------|
| H.264/AVC | MPEG | 收费 | 基准 | 成熟 |
| H.265/HEVC | MPEG | 收费 | ~50% | 成熟 |
| AV1 | AOMedia | **免版税** | ~50% | 广泛部署 |
| H.266/VVC | MPEG | 收费 | ~75% | 逐渐部署 |
| **AV2** | **AOMedia** | **免版税** | **~75%** | **Draft Spec 发布** |
| AI Codec | 各公司 | 待定 | 潜力巨大 | 研发中 |

## 关联概念

- [[av1]] — AV1 视频编码标准
- [[hevc]] — H.265/HEVC 高效视频编码
- [[vvc]] — H.266/VVC 多功能视频编码
- [[dolby-vision]] — Dolby Vision HDR 标准
- [[hdmi-2-1]] — HDMI 2.1 显示接口

## 关联实体

- [[aomedia]] — Alliance for Open Media
- [[netflix]] — Netflix（AV2 联合主席 Andrew Norkin 所在公司）
- [[google]] — Google/YouTube（AV2 主要推动者）
- [[apple]] — Apple（AOMedia 创始成员）

## 参考资料

- [[src-gigazine-av2-realtime-decoding-demo|AV2 实时解码演示（GIGAZINE, 2026-03）]]
- [[src-streamingmedia-av2-arriving|AV2  arriving 分析（Streaming Media, 2025-09）]]
- [[src-streaminglearningcenter-inside-av2-architecture|Inside AV2 架构与性能（Streaming Learning Center, 2025-10）]]

---

*最后更新：2026-05-05*
