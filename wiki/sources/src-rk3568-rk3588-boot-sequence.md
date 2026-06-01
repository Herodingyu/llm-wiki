---
title: 从上电到内核：瑞芯微 RK3568/RK3588 启动时序
author: 写代码的篮球球痴
source: 嵌入式Linux
url: https://mp.weixin.qq.com/s/TVb-vX3fwsA1j2XTH1Z6Fg
date: 2026-06-01
category: soc-pm
tags: [瑞芯微, RK3568, RK3588, BootROM, U-Boot, ARMv8, 启动流程]
---

原文已保存至 `raw/tech/soc-pm/2026-06-01-瑞芯微-RK3568-RK3588-启动时序.md`

# 核心要点

瑞芯微 RK3568/RK3588 的五级启动链路：

1. **BootROM**（片内 SRAM）→ 扫描启动介质，找 IDBlock
2. **DDR 初始化**（片内 SRAM）→ 旧链路用 `ddr.bin`，新链路用 U-Boot TPL
3. **SPL/Miniloader**（进入 DDR）→ 搬运 ATF + U-Boot
4. **ATF + U-Boot**（DDR）→ 安装安全服务、降特权级（EL3→EL2→EL1）
5. **Linux Kernel**（DDR）→ 解压、解析 DTB、挂载 rootfs、进入用户态

关键调试速查：
- 串口无输出 → BootROM 级（IDBlock/拨码问题）
- DDR log 后卡死 → DDR 初始化级（型号/时序参数）
- U-Boot 起但加载内核失败 → U-Boot 级（分区/DTB 问题）
- Starting kernel... 后没下文 → Kernel 早期（设备树/console 参数）
