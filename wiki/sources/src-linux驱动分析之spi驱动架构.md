---
doc_id: src-linux驱动分析之spi驱动架构
title: "Linux驱动分析之SPI驱动架构"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/Linux驱动分析之SPI驱动架构.md
domain: tech/peripheral
created: 2026-05-03
updated: 2026-05-03
tags: [peripheral]
---

# Linux驱动分析之SPI驱动架构

## 来源

- **原始文件**: raw/tech/peripheral/Linux驱动分析之SPI驱动架构.md
- **提取日期**: 2026-05-03

## Summary

本文分析了Linux内核中SPI子系统的三层架构，其设计与I2C子系统非常相似：SPI核心层（core）、SPI控制器驱动（master/controller driver）和SPI设备驱动（protocol/driver）。SPI核心层提供通用的注册、注销和通信API；SPI控制器驱动负责管理具体的SPI硬件总线，通常也基于platform总线框架实现；SPI设备驱动则针对具体外设（如Flash、传感器、显示屏等）实现功能逻辑。文章重点介绍了关键数据结构spi_master（代表SPI控制器）、spi_device（代表SPI从设备）、spi_driver（设备驱动）和spi_transfer/spi_message（传输描述），以及核心API如spi_alloc_master()、spi_register_master()、spi_sync()和spi_async()等。理解SPI子系统的架构对于开发嵌入式Linux平台上的SPI外设驱动具有重要指导意义。

## Key Points

### Linux SPI体系结构

| 层次 | 功能 | 与I2C对应关系 |
|------|------|---------------|
| SPI核心层 | 通用API和框架 | 类似I2C核心层 |
| SPI控制器驱动 | 硬件总线控制 | 类似I2C adapter驱动 |
| SPI设备驱动 | 外设功能实现 | 类似I2C client驱动 |

### 重要数据结构

| 结构体 | 功能 | 关键字段 |
|--------|------|----------|
| `struct spi_master` | SPI控制器 | dev, list, num_chipselect, bus_num, setup, transfer |
| `struct spi_device` | SPI从设备 | master, chip_select, max_speed_hz, mode, irq |
| `struct spi_driver` | SPI设备驱动 | probe, remove, id_table |
| `struct spi_transfer` | 单次传输描述 | tx_buf, rx_buf, len, speed_hz, delay_usecs |
| `struct spi_message` | 完整消息（可含多transfer） | transfers, spi, complete, context |

### 核心API函数

| 函数 | 功能 |
|------|------|
| `spi_alloc_master()` | 分配spi_master结构体 |
| `spi_register_master()` | 注册SPI控制器 |
| `spi_unregister_master()` | 注销SPI控制器 |
| `spi_setup()` | 配置SPI设备参数 |
| `spi_sync()` | 同步传输（阻塞） |
| `spi_async()` | 异步传输（非阻塞） |

### SPI设备模式（mode）

SPI模式由CPOL（时钟极性）和CPHA（时钟相位）组合定义：

| 模式 | CPOL | CPHA | 说明 |
|------|------|------|------|
| Mode 0 | 0 | 0 | 空闲低，首沿采样 |
| Mode 1 | 0 | 1 | 空闲低，次沿采样 |
| Mode 2 | 1 | 0 | 空闲高，首沿采样 |
| Mode 3 | 1 | 1 | 空闲高，次沿采样 |

### 控制器驱动实现要点

1. **分配和初始化**
   ```c
   struct spi_master *master = spi_alloc_master(dev, sizeof(priv_data));
   master->bus_num = pdev->id;
   master->num_chipselect = 4;
   master->transfer = my_spi_transfer;
   ```

2. **传输函数实现**
   - 处理spi_message中的多个spi_transfer
   - 配置片选、时钟频率和模式
   - 执行实际的数据发送/接收
   - 处理传输完成回调

3. **注册控制器**
   ```c
   spi_register_master(master);
   ```

### 设备驱动开发流程

```c
static struct spi_driver my_spi_driver = {
    .driver = {
        .name = "my_spi_dev",
        .of_match_table = my_of_match,
    },
    .probe = my_probe,
    .remove = my_remove,
};

module_spi_driver(my_spi_driver);
```

### SPI与I2C架构对比

| 特性 | SPI | I2C |
|------|-----|-----|
| 信号线 | 4+（SCLK, MOSI, MISO, CS） | 2（SCL, SDA） |
| 速度 | 通常更快（几MHz到几十MHz） | 较慢（100K-3.4Mbps） |
| 寻址 | 片选信号（硬件） | 设备地址（软件） |
| 双工 | 全双工 | 半双工 |
| 多主 | 较少支持 | 原生支持 |
| 驱动架构 | 三层：core/master/protocol | 三层：core/adapter/client |

## Key Quotes

> "Linux SPI体系结构主要由三部分组成：SPI核心、SPI控制器驱动、SPI设备驱动，基本和I2C的架构差不多。"

> "spi_master结构体代表SPI控制器，包含设备列表、片选数量、总线号等关键信息。"

> "spi_message可以包含多个spi_transfer，用于描述一次完整的SPI通信会话。"

> "spi_driver对应一套驱动方法，包含probe,remove等方法。spi_device对应真实的物理设备。"

## Related Pages

- [[spi]] — SPI 协议基础
- [[linux-driver]] — Linux 驱动开发框架
- [[i2c-driver]] — I2C 驱动架构（对比参考）
- [[flash]] — SPI Flash 存储器

## 开放问题

- SPI控制器驱动中DMA传输与中断传输的选型策略
- 高时钟频率下SPI信号完整性问题在驱动中的处理