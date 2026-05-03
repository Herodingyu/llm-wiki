---
doc_id: src-i3c-lists-linux-kernel-2025-03-26-782
title: "[PATCH v2 0/3] Add Qualcomm i3c master controller driver support"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/I3C-lists-linux-kernel-2025-03-26-782.md
domain: tech/peripheral
created: 2026-05-02
updated: 2026-05-02
tags: [peripheral, i3c, linux, driver, qualcomm]
---

# [PATCH v2 0/3] Add Qualcomm i3c master controller driver support

## 来源

- **原始文件**: raw/tech/peripheral/I3C-lists-linux-kernel-2025-03-26-782.md
- **提取日期**: 2026-05-02

## Summary

这是Linux内核邮件列表中提交的一个补丁集（PATCH v2），为Qualcomm基于QUPV3串行引擎（SE）的I3C主控制器添加驱动支持。该补丁集由Mukesh Kumar Savaliya提交，实现了MIPI I3C v1.0规范定义的主控制器功能。QUPV3（Qualcomm Universal Peripheral）是高通平台广泛使用的通用外设接口框架，其串行引擎控制器支持多种协议包括I2C、SPI和I3C。该驱动已在Kailua SM8550（Snapdragon 8 Gen 2）MTP设备上测试验证，支持I3C SDR模式私有传输、标准CCC命令以及I2C传输（均使用PIO模式）。补丁集包含3个提交：设备树绑定定义（dt-bindings）、主控制器驱动实现（drivers/i3c/master/qcom-i3c-master.c，约1107行代码）和MAINTAINERS文件更新。v2版本相比v1进行了大量改进，包括遵循MIPI Alliance指导将"Master"改为"Controller"命名、优化设备树绑定、改进错误处理和代码清理等。

## Key Points

### 补丁集结构

| 文件 | 变更 | 说明 |
|------|------|------|
| `qcom,i3c-master.yaml` | +60行 | 设备树绑定文档 |
| `MAINTAINERS` | +8行 | 添加维护者信息 |
| `drivers/i3c/master/Kconfig` | +12行 | Kconfig配置选项 |
| `drivers/i3c/master/Makefile` | +1行 | 编译规则 |
| `qcom-i3c-master.c` | +1107行 | 主控制器驱动实现 |

### Qualcomm I3C控制器特性

- **硬件基础**：QUPV3 Serial Engine（SE）
- **规范合规**：MIPI I3C v1.0
- **测试平台**：Kailua SM8550 MTP（Snapdragon 8 Gen 2）
- **支持模式**：
  - I3C SDR模式私有传输（PIO模式）
  - 标准CCC命令
  - I2C传输（PIO模式）
- **不支持**：HDR模式、ENTHDR CCC

### v2版本主要改进

| 改进项 | 说明 |
|--------|------|
| 命名规范 | 遵循MIPI指导，将"Master"改为"Controller" |
| 设备树绑定 | 优化属性定义，移除不必要的约束 |
| 时钟管理 | `se-clock-frequency`从DTS读取，默认100MHz |
| 错误处理 | 使用`dev_err_probe()`替代`dev_err()` |
| 代码清理 | 移除调试日志、冗余检查、未使用变量 |
| 位操作 | 使用`FIELD_PREP`/`FIELD_GET`替代手动位移 |
| 锁机制 | 重命名spinlock为`irq_lock`，改进mutex使用 |
| 资源管理 | 使用`kzalloc`替代`devm_kzalloc`以匹配`kfree` |
| 电源管理 | 移除`CONFIG_PM`条件编译，统一runtime PM处理 |

### 代码架构要点

- 使用`geni_se`（Generic Serial Engine）通用框架
- 支持运行时电源管理（runtime PM）
- 实现完整的I3C主控制器接口：`bus_init`、`priv_xfers`、`attach_i3c_dev`等
- 支持I2C设备附加（向后兼容）
- 中断驱动架构，处理DMA和错误事件

## Key Quotes

> "This patchset adds i3c controller support for the qualcomm's QUPV3 based Serial engine (SE) hardware controller."

> "The I3C SE controller implements I3C master functionality as defined in the MIPI Specifications for I3C, Version 1.0."

> "This patchset was tested on Kailua SM8550 MTP device and data transfer has been tested in I3C SDR mode."

> "Features tested and supported: Standard CCC commands, I3C SDR mode private transfers in PIO mode, I2C transfers in PIO mode."

> "Use Controller name instead of Master as per MIPI alliance guidance and updated title."

## Related Pages

- [[i3c]] — I3C 协议规范
- [[linux-driver]] — Linux I3C 子系统
- [[qualcomm]] — Qualcomm SoC 平台
- [[qupv3]] — Qualcomm QUPV3 串行引擎

## 开放问题

- 该驱动对HDR模式的支持计划和时间表
- 与Qualcomm其他平台（如SM8650、SM8750）的兼容性
- PIO模式在大量数据传输时的性能瓶颈及DMA支持计划