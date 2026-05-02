---
doc_id: vr
title: VR
page_type: concept
related_sources:
  - src-glassalmanac-galaxy-xr-reveals-android-xr-support-and
  - src-lp-research-slam-system-ar-vr-tracking
  - src-woshipm-ai-6341694html
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, smart-glasses, ar-vr]
---

# VR

## 定义

VR（Virtual Reality，虚拟现实）是一种通过计算机生成完全沉浸式的三维虚拟环境，使用户产生身临其境感觉的技术。VR 系统通常通过封闭的头戴式显示器（HMD）隔绝现实世界视觉输入，配合头部和手部追踪、空间音频和交互控制器，让用户在虚拟空间中自由观察和操作。

## 技术细节

核心特性：

- **沉浸感（Immersion）**：通过宽视场角（FOV）、高分辨率、低延迟追踪实现
- **临场感（Presence）**：用户主观感受到"真的在虚拟环境中"的心理状态
- **交互性**：支持头部转动、身体移动、手部抓取等自然交互

关键技术参数：
- **视场角（FOV）**：人眼水平 FOV 约 210°，当前主流 VR 设备 90°-120°
- **分辨率**：单眼分辨率从早期的 1080×1200 提升至 2000×2000+（如 Apple Vision Pro 单眼约 3680×3140）
- **刷新率**：72Hz-120Hz，高刷新率减少眩晕感
- **运动到光子延迟（MTP）**：从头部移动到画面更新应 < 20ms，否则产生眩晕
- **PPD（Pixels Per Degree）**：决定画面清晰度，Apple Vision Pro 约 34 PPD

追踪技术：
- **Inside-Out Tracking**：头显自带摄像头追踪环境，无需外部基站（Meta Quest、Pico 等）
- **Outside-In Tracking**：外部基站/摄像头追踪头显（HTC Vive Lighthouse、PS VR2）
- **手部追踪**：基于计算机视觉或手套传感器识别手势
- **眼动追踪**：注视点渲染降低 GPU 负载、实现社交眼神接触

显示技术：
- **Fast-LCD**：低成本、高刷新率，但对比度和响应时间一般
- **OLED/Micro OLED**：高对比度、快速响应，Apple Vision Pro 采用 Micro OLED
- **Micro LED**：未来方向，超高亮度、长寿命

内容生态：
- 游戏：Beat Saber、Half-Life: Alyx 等
- 社交：VRChat、Horizon Worlds
- 影视：360° 视频、VR 电影
- 企业培训：医疗模拟、工业操作培训

## 相关来源

- [[src-glassalmanac-galaxy-xr-reveals-android-xr-support-and]] — Samsung Galaxy VR/XR 设备分析
- [[src-lp-research-slam-system-ar-vr-tracking]] — VR 追踪技术
- [[src-woshipm-ai-6341694html]] — VR 产品分析

## 相关概念

- [[ar]] — 增强现实，与 VR 互补的沉浸式技术
- [[xr]] — 包含 VR 的扩展现实总称
- [[slam]] — VR 空间定位追踪技术
- [[oled]] — VR 设备常用的显示技术
- [[micro-led]] — 下一代 VR 显示方案

## 相关实体

- [[meta]] — Quest 系列 VR 头显市场领导者
- [[apple]] — Vision Pro（MR/VR 混合）
- [[meta-ray-ban]] — 无显示 AI 眼镜（VR 生态补充）
- [[apple-vision-pro]] — 采用 Micro-OLED 的高端头显
