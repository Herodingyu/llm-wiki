---
title: LPDDR5系统训练全解析：从命令总线到数据接口的6大关键步骤
author: YouGetMore
source: JEDEC LPDDR5 Workshop (Raj Mahajan, Tsun Ho Liu, 2019)
url: https://mp.weixin.qq.com/s/yFv-Rl6qVO7N2qeQrAu4hA
date: 2026-06-21
category: dram
tags: [LPDDR5, Training, CBT, WCK2CK, DCA, Read Gate, DFE, JEDEC]
---

原文已保存至 `raw/tech/dram/2026-06-21-LPDDR5系统训练全解析.md`

# 核心要点

LPDDR5 接口将地址/命令时钟(CK)与高速数据接口解耦：CK 最高 800-1200MHz，WCK 可达 3200-4800MHz。系统启动时必须完成 6 大训练步骤才能稳定运行。

## 6 大训练步骤

| 步骤 | 名称 | 数据速率 | 训练目标 |
|------|------|----------|----------|
| 1 | **命令总线训练(CBT)** | 800/1600 Mbps | SoC: CA/CS 延迟；DRAM: Vref(CA) |
| 2 | **WCK2CK 校准** | CK 800MHz, WCK 3200MHz | SoC: WCK 延迟 |
| 3 | **WCK 占空比训练(DCA)** | WCK 3200MHz | DRAM: DCA 代码 |
| 4 | **读门训练** | RDQS 3200MHz | SoC: 读门延迟 |
| 5 | **读数据训练** | 6400 Mbps | SoC: Rx 延迟, Vref(DQ) |
| 6 | **写数据训练** | 6400 Mbps | SoC: Tx 延迟；DRAM: Vref(DQ), DFE |

## 关键机制

- **命令总线训练**：CS(800Mbps)对齐 CK 上升沿；CA(1600Mbps)对齐 CK 并校准 Vref。模式1用 WCK+DQ；模式2额外需要 DMI，可同步训练延迟和 Vref。
- **WCK2CK 校准**：主机调整 WCK 相位使 WCK 上升沿与 CK 对齐。多 Rank 时可同时同步（性能优先，需取平均，减少 50ps 裕量）或逐个同步（功耗优先）。
- **占空比训练(DCA)**：DRAM 内置 DCA 和 DCM，通过 MR26 启动测量、翻转、读取结果、写入 MR30 调整。2 Rank 系统需逐 Rank 执行。
- **读门训练**：利用 RDQS 切换模式和增强型 RDQS 训练模式。PHY 内部采样 RDQS 而不使用 DQ 数据，扫描时序确定到达时间。
- **数据接口训练**：
  - 读训练：校准 Rx Vref、Rx 延迟、均衡
  - 写训练：校准 Tx 延迟、DRAM DFE(1抽头8设置)、DRAM Vref(DQ)
  - 可用专用训练 FIFO(8×BL16，开销小)或主存储器(支持任意长模式)
  - DMI 和 RDQS_t(奇偶校验)需特殊处理：不能同时训练，需迭代两次
- **DFE**：1抽头，8种设置(3位)，可独立编程到每个 Rank 和每个字节。可选。
- **周期性重训练**：电压和温度漂移会导致 tWCK2DQO(读响应)和 tWCK2DQI(写偏移)变化，需定期更新写训练和读门训练。

## 训练模式 MR 寄存器汇总

| 训练 | MR 模式 | 备注 |
|------|---------|------|
| CBT 模式1 | MR13 OP[6]=0 | 无 DMI 系统 |
| CBT 模式2 | MR13 OP[6]=1 | 支持 DMI+Vref 同步训练 |
| WCK2CK 校准 | MR18 OP[6]=1 | — |
| DCM 启动 | MR26 OP[0]=1 | 占空比测量 |
| DCM 翻转 | MR26 OP[1]=1 | 校正监视器不对称 |
| DCA 调整 | MR30 | 写入最佳占空比设置 |
| RDQS 切换 | MR46 OP[0]=1 | 持续发送 RDQS |
| 增强 RDQS 训练 | MR46 OP[1]=1 | 读突发间保持 RDQS_t=0/RDQS_c=1 |
| WCK-RDQS_t 训练 | MR26 OP[7]=1 | 需 MR26 OP[6]=1 支持 |
| DFE 系数 | MR24 | 1抽头，8设置，逐 Rank/Byte 可编程 |
| RDC 命令 | MR20, MR31-34 | 定义读数据校准模式 |
