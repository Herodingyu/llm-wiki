---
doc_id: src-linux驱动之i2c驱动架构
title: "Linux驱动之I2C驱动架构"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/Linux驱动之I2C驱动架构.md
domain: tech/peripheral
created: 2026-05-03
updated: 2026-05-03
tags: [peripheral]
---

# Linux驱动之I2C驱动架构

## 来源

- **原始文件**: raw/tech/peripheral/Linux驱动之I2C驱动架构.md
- **提取日期**: 2026-05-03

## Summary

本文详细解析了Linux内核中I2C子系统的三层架构：I2C核心层（core）、I2C控制器驱动（adapter/driver）和I2C设备驱动（client driver）。I2C核心层提供控制器和设备驱动的注册/注销方法、通用的I2C通信API，是连接上下层的关键桥梁。I2C控制器驱动负责具体的硬件总线操作，由于I2C控制器通常集成在SoC内部并通过内存映射访问，因此控制器驱动通常基于platform总线框架实现，通过platform_driver和platform_device的匹配机制完成probe。文章深入介绍了关键数据结构包括i2c_adapter（控制器/适配器）、i2c_client（从设备）、i2c_driver（设备驱动）和i2c_msg（消息），以及核心API函数如i2c_add_adapter()、i2c_del_adapter()、i2c_transfer()等。理解这一架构对于在嵌入式Linux平台上开发I2C外设驱动至关重要。

## Key Points

### Linux I2C体系结构

| 层次 | 功能 | 代码位置 |
|------|------|----------|
| I2C核心层 | 提供注册/注销方法、通用通信API | `drivers/i2c/i2c-core.c` |
| I2C控制器驱动 | 硬件总线控制，基于platform总线 | `drivers/i2c/busses/` |
| I2C设备驱动 | 针对具体外设的功能实现 | `drivers/`各子目录 |

### 重要数据结构

| 结构体 | 功能 | 关键字段 |
|--------|------|----------|
| `struct i2c_adapter` | I2C控制器/适配器 | owner, class, algo, dev, nr |
| `struct i2c_client` | I2C从设备 | addr, adapter, dev, irq |
| `struct i2c_driver` | I2C设备驱动 | probe, remove, id_table, device_driver |
| `struct i2c_msg` | I2C消息 | addr, flags, len, buf |
| `struct i2c_algorithm` | 通信算法 | master_xfer, smbus_xfer |

### 核心API函数

| 函数 | 功能 |
|------|------|
| `i2c_add_adapter()` | 注册I2C适配器 |
| `i2c_del_adapter()` | 注销I2C适配器 |
| `i2c_register_driver()` | 注册I2C设备驱动 |
| `i2c_transfer()` | 执行I2C消息传输 |
| `i2c_master_send()` | 主设备发送数据 |
| `i2c_master_recv()` | 主设备接收数据 |

### 控制器驱动实现要点

1. **Platform总线匹配**
   - I2C控制器通常连接在platform总线上
   - 通过`platform_driver`和`platform_device`匹配
   - probe函数完成硬件初始化

2. **probe()函数工作**
   - 获取并配置时钟资源
   - 初始化I2C硬件寄存器
   - 设置总线频率（clock-frequency）
   - 注册`i2c_adapter`

3. **Algorithm实现**
   - 实现`master_xfer()`函数
   - 处理START/STOP/ACK时序
   - 支持中断或DMA传输模式

### 设备驱动开发流程

```c
static struct i2c_driver my_driver = {
    .driver = {
        .name = "my_i2c_dev",
        .of_match_table = my_of_match,
    },
    .probe = my_probe,
    .remove = my_remove,
    .id_table = my_id_table,
};

module_i2c_driver(my_driver);
```

## Key Quotes

> "Linux的I2C体系结构主要由三部分组成：I2C核心、I2C控制器驱动、I2C设备驱动。"

> "I2C核心提供I2C控制器和设备驱动的注册和注销方法，I2C通信方法。"

> "由于I2C控制器通常是在内存上的，所以它本身也连接在platform总线上，通过platform_driver和platform_device的匹配来执行。"

> "i2c_transfer()函数本身不具备驱动适配器物理硬件以完成消息交互的能力，它只是寻找到与i2c_adapter对应的i2c_algorithm。"

## Related Pages

- [[i2c]] — I2C 协议基础
- [[linux-driver]] — Linux 驱动开发框架
- [[platform-driver]] — Platform总线驱动
- [[device-tree]] — 设备树配置

## 开放问题

- I2C控制器驱动在DMA模式下的实现复杂度
- 多主I2C配置在Linux中的支持现状和限制