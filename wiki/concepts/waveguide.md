---
doc_id: waveguide
title: 光波导
page_type: concept
related_sources:
  - src-roadtovr-meta-waveguide-provider-lumus-zoe-70-deg
  - src-en-meta-rayban-display-lcos-smart-glasses-s
  - src-jb-display-newsdetails-85html
  - src-tomsguide-computing-smart-glasses-i-just-tested-th
  - src-woshipm-ai-6341694html
  - src-xkh-semitech-news-how-silicon-carbide-sic-is-crossing
  - src-vrtuoluo-543632html
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, smart-glasses, optical-technology]
---

# 光波导

## 定义

光波导（Waveguide）是 AR 眼镜中用于将微型显示器生成的图像传导到人眼的关键光学元件。它利用光在透明介质中的全内反射原理，将图像从位于镜框侧面的微显示器"折叠"到用户视野中，同时保持镜片的轻薄和透明，让用户能同时看到现实世界和虚拟叠加内容。

## 技术细节

主要技术路线：

- **几何光波导（Geometric Waveguide）**：
  - 使用传统光学冷加工工艺在玻璃中制作反射镜面阵列
  - 通过多层半透半反镜将图像逐步耦合出波导
  - 代表厂商：Lumus
  - 优点：色散控制好、图像质量高
  - 缺点：加工工艺复杂、成本高

- **衍射光波导（Diffractive Waveguide）**：
  - 使用光栅结构（表面浮雕光栅或全息体光栅）耦合光线
  - 表面浮雕光栅（SRG）：通过半导体工艺在波导表面刻蚀光栅
  - 全息体光栅（VHG）：通过全息曝光在光敏材料中记录光栅
  - 代表厂商：WaveOptics（已被 Snap 收购）、Dispelix、珑璟光电
  - 优点：可大规模复制、成本低
  - 缺点：色散大、彩虹效应

- **混合式光波导**：
  - 结合几何和衍射的优点
  - 仍在研发阶段

材料演进：
- **普通玻璃**：成本低、工艺成熟，但折射率限制 FOV
- **高折射率玻璃**：提升 FOV，但加工难度增加
- **碳化硅（SiC）**：极高折射率，可实现 >70° FOV（Meta Orion 原型采用），但成本极高
- **塑料/树脂**：最轻薄、成本低，但光学性能较差

关键参数：
- **视场角（FOV）**：当前消费级 30°-50°，目标 70°+
- **眼盒（Eyebox）**：允许眼睛移动的范围，需足够大以保证佩戴舒适性
- **耦合效率**：光从波导进入人眼的效率，直接决定亮度
- **均匀性**：整个 FOV 内亮度一致性

## 相关来源

- [[src-roadtovr-meta-waveguide-provider-lumus-zoe-70-deg]] — Lumus 70° FoV 几何光波导
- [[src-en-meta-rayban-display-lcos-smart-glasses-s]] — Meta Ray-Ban 光波导方案
- [[src-jb-display-newsdetails-85html]] — 光波导显示技术新闻
- [[src-tomsguide-computing-smart-glasses-i-just-tested-th]] — 光波导眼镜评测
- [[src-woshipm-ai-6341694html]] — 光波导产品分析
- [[src-xkh-semitech-news-how-silicon-carbide-sic-is-crossing]] — SiC 在光波导中的应用
- [[src-vrtuoluo-543632html]] — 光波导技术分析

## 相关概念

- [[ar]] — 光波导是 AR 眼镜的核心光学组件
- [[lcos]] — 常与光波导配合使用的微显示技术
- [[micro-led]] — 未来可能与光波导结合的下一代显示方案
- [[xr]] — 光波导是 XR 设备的关键使能技术

## 相关实体

- [[meta]] — 与 Lumus 合作 70° FoV 波导
- [[meta-ray-ban]] — 采用 Lumus 波导技术
- [[apple]] — Vision Pro 采用 VST 方案（非波导）
