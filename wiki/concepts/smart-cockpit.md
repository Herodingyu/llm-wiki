---
doc_id: smart-cockpit
title: 智能座舱
page_type: concept
related_sources:
  - src-researchandmarkets-reports-5867893-automotive-cockpit-domai
  - src-strategicmarketresearch-market-report-ai-powered-in-vehicle-cock
  - src-nvidianews-news-nvidia-unveils-drive-thor-centraliz
  - src-tomsguide-computing-smart-glasses-i-just-tested-th
  - src-tomsguide-computing-smart-glasses-i-just-saw-the-f
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, car-infotainment, automotive]
---

# 智能座舱

## 定义

智能座舱（Smart Cockpit）是现代汽车中以座舱域控制器为核心，整合仪表显示、信息娱乐、空调控制、语音交互、驾驶员监控、后排娱乐等多个子系统的智能化数字空间。智能座舱通过大尺寸高清屏幕、AI 语音助手、多模态交互和 OTA 升级，将汽车从单纯的交通工具转变为移动的智能终端和第三生活空间。

## 技术细节

系统架构：

- **座舱域控制器（Cockpit Domain Controller）**：
  - 高算力单芯片方案：Qualcomm 8295/8397、SemiDrive X9SP、SiEngine 龙鹰一号
  - 双芯片方案：双 Qualcomm 8295（如领克 900）
  - 域控 + AI 协处理器/AI BOX：分离 AI 推理和座舱显示

- **显示系统**：
  - 仪表屏：替代传统机械仪表，显示车速、转速、ADAS 状态
  - 中控屏：导航、媒体、车辆设置的主交互界面
  - 副驾/后排娱乐屏：独立音视频娱乐
  - AR-HUD：将导航和 ADAS 信息投影到前挡风玻璃

- **交互方式**：
  - 触控：多点触控大屏
  - 语音：AI 语音助手（如小鹏小 P、蔚来 NOMI、理想同学）
  - 手势：隔空手势控制
  - 物理按键：方向盘按键、空调实体旋钮（保留安全操作）

- **AI 能力**：
  - 端侧大模型：7B 参数级多模态模型上车
  - 个性化推荐：基于用户习惯和场景的智能推荐
  - 情感识别：通过 DMS 识别驾驶员情绪状态

技术趋势：
- **舱驾融合**：座舱域控制器与智驾域控制器整合（如 Qualcomm SA8775P、NVIDIA Thor）
- **2024 年中国乘用车舱驾融合域控装机量约 43.86 万台，涉及 20+ 车型**
- **小米 YU7 四合一域控**：ADD 辅助驾驶 + T-Box 通信 + DCD 座舱域控 + VCCD 整车域控集成，控制器数量减少 75%，零件重量降低 47%
- **2025 年主流高端座舱 SoC CPU 算力已达 200+K DMIPS，AI 算力约 60TOPS**

## 相关来源

- [[src-researchandmarkets-reports-5867893-automotive-cockpit-domai]] — 汽车座舱域控制器研究报告
- [[src-strategicmarketresearch-market-report-ai-powered-in-vehicle-cock]] — AI 座舱域控制器市场分析
- [[src-nvidianews-news-nvidia-unveils-drive-thor-centraliz]] — NVIDIA Thor  centralized 计算平台
- [[src-tomsguide-computing-smart-glasses-i-just-tested-th]] — 智能座舱显示技术
- [[src-tomsguide-computing-smart-glasses-i-just-saw-the-f]] — 座舱交互技术
- [[src-caixin-2025-03-17-102299245html]] — BMW 中国联手华为提升智能座舱体验
- [[src-lamboiparts-blogs-car-dvr-the-battle-for-automotive-]] — Mini LED vs OLED 车载显示之争
- [[src-newsroom-at-ces-2024-valeo-and-sennheiser-present]] — Valeo+Sennheiser 沉浸式座舱体验

## 相关概念

- [[dms]] — 智能座舱集成的驾驶员监控系统
- [[oms]] — 智能座舱集成的乘员监控系统
- [[carplay]] — 手机与智能座舱的互联方案
- [[oled]] — 智能座舱显示屏的显示技术

## 相关实体

- [[qualcomm]] — Snapdragon 座舱平台（8295/8397）
- [[nvidia]] — DRIVE Thor 舱驾融合平台
- [[mediatek]] — Dimensity Auto 座舱平台
- [[renesas]] — R-Car 系列车载 SoC
- [[apple]] — CarPlay Ultra 手机互联
- [[google]] — Android Automotive OS
