---
doc_id: src-stm32-flash-wear-leveling
title: STM32 Flash 磨损均衡算法
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/STM32内部Flash使用磨损均衡算法(Erase Leveling).md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, stm32, flash, wear-leveling, embedded]
---

## Summary

本文介绍了 STM32 内部 Flash 的磨损均衡（Wear Leveling）算法实现。STM32F103 内部 Flash 写寿命约 1 万次，通过磨损均衡算法可将寿命延长 1024 倍。核心思路是：按特定格式将数据一条一条写入 Flash，写入新数据前将旧数据清零，保证有效数据唯一性，直到整页写满后才擦除页面，从而极大延长 Flash 使用寿命。

## Key Points

### 1. 磨损均衡设计
- **芯片**: STM32F103ZET6
- **Flash Page Size**: 2KB
- **测试页**: Page60 (0x0801E000 ~ 0x0801E800)
- **数据帧格式**: |0x5A|data1|data2|0xA5|
- **目标**: 将 Flash 寿命延长 1024 倍

### 2. 写入策略
1. 擦除 Page60（数据全为 0xFF）
2. 顺次寻找 0xFF（未写入位置）
3. 找到后写入新数据
4. 将先前有效数据置为 0
5. 若未找到 0xFF，整页擦除后从头写

### 3. 读出策略
1. 顺次寻找 0x5A（有效数据头）
2. 读出 4 字节并校验
3. 校验：第 1 字节 + 第 4 字节 = 0xFF
4. 若未找到 0x5A，返回错误码 0

### 4. 核心数据结构
```c
typedef struct {
    uint32_t flash_start_address;
    uint32_t current_addr;
    uint32_t new_addr;
    uint16_t page_size;
    flash_pack_u buff;
} flasher_t;

#define newFlasher(start_address, page_size) { \
    start_address, start_address, start_address, page_size, {0} \
}
```

### 5. 寿命计算
- 原始寿命：约 1 万次擦写
- 每天 100 次写操作：100 天耗尽
- 磨损均衡后：寿命延长 1024 倍

## Evidence

- STM32 Flash 擦除后全为 0xFF
- 通过将旧数据清零保证有效数据唯一性
- 整页写满后才擦除，减少擦除次数

## Key Quotes

> "写在前面：大家好，我是 吴炎，既是一名项目经理，也.."

## Open Questions

- 更复杂的磨损均衡算法（如坏块管理、映射表）
- Flash 文件系统（JFFS2、UBIFS、LittleFS）的磨损均衡实现

## Related Pages

- [[wear-leveling]]
- [[stm32]]
- [[flash]]
- [[embedded-storage]]
