---
doc_id: dms
title: DMS
page_type: concept
related_sources:
  - src-cn-report-rinc1660089-automotive-dms-oms-dr
  - src-nvidianews-news-nvidia-unveils-drive-thor-centraliz
  - src-smarteye-wp-content-uploads-2023-12-ces-2024-coll
  - src-strategicmarketresearch-market-report-ai-powered-in-vehicle-cock
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, car-infotainment, automotive-safety]
---

# DMS

## 定义

DMS（Driver Monitoring System，驾驶员监控系统）是通过摄像头、红外传感器等感知设备实时监测驾驶员状态（疲劳、分心、情绪、健康状况等）的智能安全系统。当检测到危险状态时，DMS 通过声音、震动或灯光警示驾驶员，或在紧急情况下触发车辆主动安全措施。DMS 是实现 L2+ 及以上自动驾驶的必备功能，也是各国汽车安全法规强制要求的配置。

## 技术细节

监测功能：

- **疲劳检测**：通过眼睑闭合度（PERCLOS）、头部姿态、打哈欠频率判断疲劳程度
- **分心检测**：识别驾驶员视线偏离道路、使用手机、与乘客过度交谈等行为
- **身份识别**：面部识别确认驾驶员身份，自动调整座椅、后视镜、音乐偏好
- **情绪识别**：分析面部表情判断驾驶员情绪状态（愤怒、焦虑等）
- **健康监测**：部分高端系统可检测心率、血压异常
- **视线追踪**：追踪驾驶员注视点，用于人机交互优化和注意力分析

技术路线：
- **视觉感知（摄像头）**：主流方案，使用近红外摄像头（940nm）实现夜间监测
- **雷达传感器**：毫米波雷达可穿透墨镜，但分辨率较低
- **多传感器融合**：摄像头 + 雷达 + 方向盘传感器融合提高可靠性

法规驱动：
- **欧盟 GSR II**：2024 年 7 月起新车型必须配备 ADDW（高级驾驶员分心预警）系统，2026 年 7 月所有新车必须配备
- **中国 C-NCAP 2024 版**：首次将 DMS 纳入主动安全评估框架，给予 2 分评分
- **Euro-NCAP 2026 年 1 月新规**：扩大酒驾检测范围

市场数据：
- **2024 年 1-11 月中国 DMS 安装量 318 万台（安装率 15.8%，YoY +82.7%）**
- **预计 2027 年中国 DMS 安装量达 947.3 万辆，摄像头 DMS 市场规模 71.1 亿元**
- **前十大品牌占安装总量 62.7%：理想、HIMA、蔚来、极氪、比亚迪等**

主要供应商：
- 中国：经纬恒润、保隆汽车、MINIEYE、欧菲光、海康威视、虹软科技、商汤科技
- 国际：Continental、Magna、Cipia Vision、Valeo、Emotion3D、Smart Eye、LG Electronics

## 相关来源

- [[src-cn-report-rinc1660089-automotive-dms-oms-dr]] — 汽车 DMS/OMS 研究报告
- [[src-nvidianews-news-nvidia-unveils-drive-thor-centraliz]] — NVIDIA  Drive Thor 平台集成的 DMS 方案
- [[src-smarteye-wp-content-uploads-2023-12-ces-2024-coll]] — Smart Eye DMS 技术在 CES 2024 的展示
- [[src-strategicmarketresearch-market-report-ai-powered-in-vehicle-cock]] — AI 座舱中的 DMS 应用

## 相关概念

- [[smart-cockpit]] — DMS 是智能座舱的核心安全组件
- [[oms]] — 与 DMS 协同的乘员监控系统
- [[carplay]] — 手机互联对 DMS 功能的影响

## 相关实体

- [[qualcomm]] — Snapdragon 座舱平台集成 DMS
- [[nvidia]] — DRIVE Thor 平台集成 DMS 方案
- [[renesas]] — R-Car X5H 支持 DMS/OMS
- [[lg]] — 提供 DMS 摄像头方案
