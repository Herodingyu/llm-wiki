---
doc_id: src-tomsguide-computing-smart-glasses-i-just-saw-the-f
title: I Just Saw the Future of AR Glasses — Qualcomm and VoxelSensors Partnership
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/industry/smart-glasses/tomsguide-computing-smart-glasses-i-just-saw-the-f.md
domain: industry/smart-glasses
created: 2026-05-02
updated: 2026-05-02
tags: [smart-glasses, ar, qualcomm, voxelsensors, 3d-sensing, power-efficiency]
---

# I Just Saw the Future of AR Glasses, and This Feature May Fix the Biggest Problem

## 来源

- **原始文件**: raw/industry/smart-glasses/tomsguide-computing-smart-glasses-i-just-saw-the-f.md
- **提取日期**: 2026-05-02

## 摘要

Tom's Guide记者亲身体验了Qualcomm与比利时深科技公司VoxelSensors合作开发的SPAES（单光子主动事件传感器）3D感知技术，并将其誉为"可能解决AR眼镜最大问题的关键功能"。AR眼镜长期以来面临的核心瓶颈是续航不足——现有方案难以支撑全天佩戴，而SPAES技术通过事件驱动架构实现了高达10倍的功耗节省，同时保持了低延迟和高精度的深度感知能力。

SPAES技术的核心创新在于其"主动事件传感"机制：与传统摄像头持续采集完整图像不同，SPAES仅在场景发生变化时才输出数据，大幅减少了无效数据处理。结合单光子探测的高灵敏度，SPAES在弱光、强光等挑战性光照条件下仍能保持稳定的3D感知性能。这一技术预计将于2025年12月集成到Snapdragon AR2 Gen 1平台，向精选客户开放。Tom's Guide的评测认为，如果SPAES技术能够兑现其功耗承诺，将真正实现全天候可穿戴AR智能眼镜的愿景。

## 关键要点

### SPAES技术原理与优势

| 特性 | 传统深度传感器 | SPAES |
|------|---------------|-------|
| **工作原理** | 连续帧采集 | 事件驱动，仅输出变化 |
| **功耗** | 基准 | **降低高达10倍** |
| **延迟** | 较高（帧率限制） | **极低（事件触发）** |
| **光照适应性** | 中等 | **优秀（单光子灵敏度）** |
| **数据量** | 大（完整图像） | **小（仅事件数据）** |

### 技术突破详解

- **事件驱动架构**:
  - 传统摄像头: 每秒输出30-60帧完整图像，大量冗余数据
  - SPAES: 仅在像素发生变化时输出事件，静态场景零功耗
  - 优势: 功耗与场景动态程度成正比，日常场景功耗极低
  
- **单光子灵敏度**:
  - 可探测单个光子级别的光信号
  - 弱光环境下仍保持高精度深度感知
  - 强光环境下不饱和，动态范围极宽
  
- **主动照明**:
  - 集成主动光源（近红外激光/LED）
  - 结构光或ToF原理实现深度测量
  - 不受环境光照条件影响

### 对AR眼镜的意义

- **续航突破**: 3D感知模组功耗降低10倍，整机续航可达全天
- **低延迟交互**: 事件驱动架构实现亚毫秒级响应
- **全天候可用**: 从强光户外到暗光室内，全场景覆盖
- **隐私保护**: 不采集完整图像，仅输出深度/事件数据

### Physical AI概念

- **定义**: 从人类视角采集和处理物理世界数据
- **应用**: 
  - 产品识别: 看到商品即获取信息
  - 实时导航: 基于视觉场景的路径指引
  - 上下文AR: 根据环境自动触发相关AR内容
  - 眼动追踪: 低功耗高精度注视点追踪
  
- **数据价值**: 第一人称视角（egocentric）数据对训练具身智能AI至关重要

### 集成与商用计划

- **目标平台**: Snapdragon AR2 Gen 1（初期）
- **可用时间**: 2025年12月向精选客户开放
- **后续扩展**: 预计将支持Snapdragon AR1+平台
- **BOM影响**: 传感器模组成本需评估，但功耗节省可抵消电池成本

## Key Quotes

- "SPAES delivers up to 10x power savings with lower latency for XR applications."
- "The collaboration aims to enable all-day wearable AR smart glasses with spatial computing capabilities."
- "Physical AI processes data from the human perspective to help machines better understand environments."

## 关键引用

> "I just saw the future of AR glasses, and this feature may fix the biggest problem I have with them."
> — Tom's Guide评测标题

> "SPAES delivers up to 10x power savings with lower latency for XR applications."

> "The collaboration aims to enable all-day wearable AR smart glasses with spatial computing capabilities."

> "Physical AI processes data from the human perspective to help machines better understand environments."

> "Expected availability on Snapdragon AR2 Gen 1 by December 2025 for select customers."

> "Can the technology truly enable all-day battery life in lightweight glasses? That's the billion-dollar question."

## Related Pages

- [[ar]] — Qualcomm+VoxelSensors AR 未来
- [[qualcomm]] — Snapdragon AR2 Gen 1 平台
- [[xr]] — XR 设备的 3D 感知技术
- [[slam]] — 空间定位与 3D 感知

## 开放问题

- Will SPAES technology also come to Snapdragon AR1+ platform?
- How much does the sensor module add to bill of materials?
- Can the technology truly enable all-day battery life in lightweight glasses?
