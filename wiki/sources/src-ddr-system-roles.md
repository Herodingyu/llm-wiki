---
title: DDR系统角色：Controller、PHY、DRAM、DIMM
author: Vector
source: 信号完整性和电源完整性
url: https://mp.weixin.qq.com/s/AQPi3mwZSJ_K4sezPNHXaA
date: 2026-06-17
category: dram
tags: [DDR, Controller, PHY, DRAM, DIMM]
---

原文已保存至 `raw/tech/dram/2026-06-17-DDR系统角色-Controller-PHY-DRAM-DIMM.md`

# 核心要点

DDR 系统的四大角色：

| 角色 | 职责 |
|------|------|
| Controller | 决定访问什么、什么时候访问，DDR 系统的大脑 |
| PHY | 把数字命令变成真实电信号，控制 Drive Strength/ODT/Delay/Training |
| DRAM | 真正存储数据，内部由 Bank/Row/Column/Sense Amp 组成 |
| DIMM | 标准化内存模块，含多颗 DRAM + SPD + PMIC + RCD/DB |

关键工程判断：
- 一次 Read：Controller 安排命令 → PHY 发 CA/CLK → DRAM 返回 DQ+DQS → PHY 采样
- 一次 Write：Controller 安排命令 → PHY 发 CA/CLK + DQ+DQS → DRAM 采样写入
- SIPI 仿真必须看完整链路（Controller/PHY → Package → PCB → Connector → DIMM → DRAM）
