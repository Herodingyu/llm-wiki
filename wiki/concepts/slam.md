---
doc_id: slam
title: SLAM
page_type: concept
related_sources:
  - src-lp-research-slam-system-ar-vr-tracking
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, smart-glasses, computer-vision]
---

# SLAM

## 定义

SLAM（Simultaneous Localization and Mapping，同步定位与地图构建）是一种让移动设备在未知环境中实时确定自身位置并同时构建环境地图的技术。SLAM 是 AR/VR 设备、自动驾驶汽车、服务机器人等系统的核心感知能力，使设备能够"理解"其所处的三维空间。

## 技术细节

核心问题：

- **定位（Localization）**：根据传感器数据估计设备在环境中的位姿（位置和姿态）
- **建图（Mapping）**：根据观测数据构建环境的几何或语义地图
- **同时性**：定位和建图相互依赖、交替迭代优化

传感器类型：
- **视觉 SLAM（V-SLAM）**：
  - 单目相机：仅需一个摄像头，但无法直接获得深度
  - 双目相机：通过立体视觉计算深度
  - RGB-D 相机：直接获取深度（如 Intel RealSense、Microsoft Kinect）
- **激光 SLAM（Lidar SLAM）**：使用激光雷达扫描环境，精度高但成本高
- **融合 SLAM**：视觉 + IMU（惯性测量单元）是最常见的组合（VI-SLAM）

算法框架：
- **特征点法**：提取图像特征点（ORB、SIFT），追踪特征点运动估计位姿
  - 代表：ORB-SLAM、PTAM
- **直接法**：直接使用像素亮度信息，不提取特征
  - 代表：LSD-SLAM、DSO
- **半直接法**：结合特征点和直接法优点
  - 代表：SVO
- **深度学习法**：使用神经网络提取特征或估计深度
  - 代表：DROID-SLAM、TartanVO

在 AR/VR 中的应用：
- **空间锚定**：将虚拟对象固定在物理空间特定位置
- **平面检测**：识别地面、桌面等平面，用于放置虚拟内容
- **遮挡处理**：让虚拟对象被真实物体正确遮挡
- **场景理解**：识别门、窗、家具等语义元素

挑战：
- **动态环境**：移动的人和物体会干扰定位和建图
- **特征贫乏区域**：白墙、走廊等缺乏纹理的场景
- **累积误差**：长时间运行后位姿估计漂移
- **计算资源**：实时 SLAM 需要较高的算力，与移动端功耗受限矛盾
- **回环检测（Loop Closure）**：识别曾到过的地方以消除累积误差

## 相关来源

- [[src-lp-research-slam-system-ar-vr-tracking]] — SLAM 系统在 AR/VR 追踪中的应用

## 相关概念

- [[ar]] — SLAM 是 AR 空间感知的基础
- [[vr]] — SLAM 用于 VR 的 Inside-Out 追踪
- [[xr]] — SLAM 是 XR 设备的标配能力

## 相关实体

- [[meta]] — Quest 系列 Inside-Out 追踪
- [[apple]] — Vision Pro 空间定位
- [[qualcomm]] — Snapdragon Spaces 平台支持 SLAM
