---
doc_id: oms
title: OMS
page_type: concept
related_sources:
  - src-cn-report-rinc1660089-automotive-dms-oms-dr
  - src-nvidianews-news-nvidia-unveils-drive-thor-centraliz
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, car-infotainment, automotive-safety]
---

# OMS

## 定义

OMS（Occupant Monitoring System，乘员监控系统）是监测车辆座舱内所有乘员（包括前排乘客和后排乘客）状态的智能系统。与 DMS 专注于驾驶员不同，OMS 关注全车乘员的安全和舒适，功能涵盖儿童遗留检测（CPD）、乘客情绪识别、健康监测、安全带提醒和防盗检测等。

## 技术细节

核心功能：

- **儿童存在检测（CPD, Child Presence Detection）**：
  - 检测儿童是否被单独留在车内
  - 法规要求：欧盟 Euro-NCAP 2025 年将 CPD 纳入评分
  - 技术方案：60GHz 毫米波雷达、UWB 雷达、摄像头

- **乘客状态监测**：
  - 识别乘客位置和姿态
  - 检测异常行为（如打斗、突发疾病）
  - 情绪识别与 DMS 类似，扩展至所有乘员

- **健康监测**：
  - 心率、呼吸频率检测（通过雷达或摄像头）
  - 晕动症检测与缓解

- **安全带提醒**：
  - 视觉识别各座位乘员是否系好安全带
  - 替代传统的座椅压力传感器方案

- **防盗检测**：
  - 识别未授权人员进入车辆
  - 触发警报并通知车主

技术路线：
- **摄像头方案**：车内广角摄像头，可同时监测多个座位
- **雷达方案**：60GHz 毫米波雷达，保护隐私（无图像），可穿透遮挡物
- **多传感器融合**：摄像头 + 雷达 + 座椅压力传感器融合

市场数据：
- **2024 年 1-11 月中国 OMS 安装量 75.5 万台（安装率 3.7%，YoY -18.1%）**
- OMS 安装率远低于 DMS，市场仍处于早期阶段
- CPD 法规推动将成为 OMS 增长的主要动力

与 DMS 的关系：
- DMS 和 OMS 通常共用计算平台和部分传感器
- 座舱内的广角摄像头可同时服务于 DMS 和 OMS
- 未来趋势是 DMS + OMS 的一体化座舱监测系统

## 相关来源

- [[src-cn-report-rinc1660089-automotive-dms-oms-dr]] — 汽车 DMS/OMS 研究报告
- [[src-nvidianews-news-nvidia-unveils-drive-thor-centraliz]] — NVIDIA  Drive Thor 平台集成的 OMS 方案

## 相关概念

- [[dms]] — 与 OMS 协同的驾驶员监控系统
- [[smart-cockpit]] — OMS 是智能座舱的安全子系统

## 相关实体

- [[qualcomm]] — Snapdragon 座舱平台集成 OMS
- [[nvidia]] — DRIVE Thor 平台集成 OMS 方案
- [[renesas]] — R-Car X5H 支持 DMS/OMS
