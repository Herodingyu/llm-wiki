---
doc_id: src-nvidia-adas-英伟达driveos入门
title: NVIDIA ADAS 英伟达DriveOS入门
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/AI系统/NVIDIA ADAS-英伟达DriveOS入门.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810) 3 人赞同了该文章 ![](https://pic1.zhimg.com/v2-e42d9224e7c0a384743c70c7e99a2264_1440w.jpg)

## Key Points

### 1. 1\. ADAS介绍
![](https://pica.zhimg.com/v2-c6945d7ca6da24ac540789e0c54e2d98_1440w.jpg) 上图中将自动驾驶分为 **L0-L5** 级六种不同级别，根据“开启自动驾驶功能后，驾驶员是否应该处于驾驶状态”这一标准，自动驾驶以 **L3级** 为分界线，分为 **辅助驾驶** 和 **自动驾驶** 。理论上讲，只有L3级以上 （包括L3级）才能

### 2. 2\. DriveOS介绍
![](https://pic4.zhimg.com/v2-6124ca3db354be57f44ad9e72f6d4cfd_1440w.jpg) 上图中是英伟达的 **软件协议栈** ，可见其芯片有三部分： **MCU、FSI、Orin** ，也就是这个SoC是多核的，并且运行多个OS的，MCU上运行的 **AUTOSAR** 就是车控OS里面的东西，Orin这个应该是ARM架构的芯片+GPU其

### 3. 3\. DriveOS基础服务
![](https://pic3.zhimg.com/v2-9e878a6bfd93af6938495671c598783c_1440w.jpg) NVIDIA DRIVE AGX ™平台基础服务运行时软件堆栈为平台的所有组件提供 **基础架构** 。借助此基础架构，Guest操作系统可以在硬件上运行，并由虚拟机管理程序管理硬件资源的使用。

### 4. 4\. NvMedia架构
![](https://pica.zhimg.com/v2-9e5ef962ef157f9f2054dd6ea41eaba4_1440w.jpg) **NvMedia** 提供强大的多媒体数据处理能力，可在 NVIDIA DRIVE ® Orin ™设备上实现真正的 **硬件加速** 。借助 NvMedia 和 Orin 固件组件，多媒体应用程序支持多个同步摄像头馈送以进行同步处理。NvMedia

### 5. 5\. 关于一些软件规格亮点
首先，DRIVE已针对自动驾驶系统的设计、管理和存档的全面安全认证方法体系的建立制定了步骤。

## Evidence

- Source: [原始文章](raw/tech/soc-pm/AI系统/NVIDIA ADAS-英伟达DriveOS入门.md) [[../../raw/tech/soc-pm/AI系统/NVIDIA ADAS-英伟达DriveOS入门.md|原始文章]]

## Key Quotes

> "Nvidia闭环了自驾在线和离线，软件和硬件各个方面的服务"

> "硬件冗余（同时运行两套硬件，一套是备份）"

> "Adaptive AUTOSAR"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/AI系统/NVIDIA ADAS-英伟达DriveOS入门.md) [[../../raw/tech/soc-pm/AI系统/NVIDIA ADAS-英伟达DriveOS入门.md|原始文章]]
