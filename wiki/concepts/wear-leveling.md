---
doc_id: wear-leveling
title: 磨损均衡（Wear Leveling）
page_type: concept
related_sources:
  - src-stm32-flash-wear-leveling
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, bsp, storage]
---

# 磨损均衡（Wear Leveling）

## 定义

磨损均衡是一种延长 Flash 存储器寿命的技术。由于 Flash 的每个块都有擦写次数限制（如 1 万次），通过均匀分配擦写操作到所有块，避免某些块过早损坏。

## Flash 特性

- **写入前必须擦除**：Flash 写入前需要擦除整个块
- **擦写次数有限**：典型 1 万 ~ 10 万次
- **块大小**：通常 4KB ~ 256KB

## 磨损均衡算法

### 简单实现（STM32 示例）

**策略**：
1. 擦除页面后数据全为 0xFF
2. 顺序写入数据，旧数据清零
3. 保证有效数据唯一性
4. 整页写满后才擦除

**寿命计算**：
- 原始寿命：约 1 万次擦写
- 磨损均衡后：寿命延长 1024 倍（以 2KB 页面为例）

### 进阶算法

| 类型 | 说明 |
|------|------|
| 动态磨损均衡 | 数据写入时选择擦写次数少的块 |
| 静态磨损均衡 | 定期移动静态数据到磨损少的块 |
| 坏块管理 | 标记损坏块，使用备用块 |
| 映射表 | 逻辑地址到物理地址的映射 |

## Flash 文件系统

| 文件系统 | 特点 |
|----------|------|
| JFFS2 | 日志结构，磨损均衡 |
| UBIFS | 支持大容量 NAND，动态卷管理 |
| LittleFS | 掉电安全，磨损均衡，适合小容量 |
| YAFFS2 | 简单，适合小容量 NAND |

## 相关来源

- [[src-stm32-flash-wear-leveling]] — STM32 Flash 磨损均衡实现
