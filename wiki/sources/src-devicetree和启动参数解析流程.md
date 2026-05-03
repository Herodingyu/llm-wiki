---
doc_id: src-devicetree和启动参数解析流程
title: devicetree和启动参数解析流程
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/devicetree和启动参数解析流程.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, linux, devicetree, boot, aarch64]
---

## Summary

本文基于AARCH64架构和Linux内核5.14.0-rc5，深入解析了设备树（Device Tree）的解析流程和启动参数（bootargs）的处理机制。文章从设备树概述出发，详细阐述了早期设备树扫描（early_init_dt_scan）解析内存和bootargs的流程、设备节点创建（unflatten_device_tree）的完整过程、以及bootargs参数的多种配置方式和解析机制。核心在于理解Linux内核如何从设备树获取硬件信息，以及如何通过bootargs向内核传递启动配置参数。

## Key Points

### 1. 设备树解析概述
- **获取方式**：AARCH64架构下内核通过设备树或ACPI获取设备信息
- **适用领域**：ACPI主要用于服务器，设备树用于嵌入式
- **传递方式**：bootloader将设备树拷贝到内存，通过x2寄存器传递给kernel
- **早期解析**：通过`early_init_dt_scan`接口先解析memory和bootargs等早期需要的信息
- **完整解析**：memory加入memblock后，通过`unflatten_device_tree`创建完整device node结构

### 2. Early Device Tree 解析流程
1. **解析chosen节点**：initrd地址和size、bootargs、rng-seed（随机数种子）
2. **获取root节点**：size-cells和address-cells值
3. **遍历memory节点**：将合法memory region加入memblock，hotplug属性标识可热插拔内存

### 3. Device Node 创建流程（unflatten_device_tree）
1. **__unflatten_device_tree**：解析所有节点和属性，创建device node结构
   - 通过父节点、子节点、兄弟节点指针维护节点关系
2. **of_alias_scan**：扫描所有别名，填充aliases_lookup全局链表
3. **unittest_unflatten_overlay_base**：解析device tree overlay用于单元测试

### 4. Bootargs 参数配置方式
- **设备树配置**：在chosen节点中定义（最常用）
- **U-Boot配置**：
  - 在设备树chosen节点中直接定义
  - U-Boot代码中通过环境变量定义默认值
  - U-Boot命令行修改bootargs环境变量
- **内核配置**：CONFIG_CMDLINE
  - CONFIG_CMDLINE_EXTEND：拼接到设备树参数后面
  - CONFIG_CMDLINE_FORCE：替换设备树参数
  - 默认：设备树未设置时作为默认bootargs
- **bootconfig方式**：key=value形式写到xbc文件，追加到initrd末尾

### 5. Bootargs 参数解析流程
- **两阶段解析**：early参数解析 → 常规参数解析
- **early param**：
  - 遍历bootargs所有参数
  - 判断kernel param类型或setup类型
  - 执行`do_early_param`函数，遍历`__setup_start`到`__setup_end`
  - 匹配early标记的参数，调用setup_func

## Key Quotes

> "AARCH64架构下内核可以通过设备树或acpi方式获取设备信息，其中acpi主要用于服务器领域，而设备树用于嵌入式领域。"

> "由于内存配置信息是由device tree传入的，而将device tree解析为device node的流程中需要为node和property分配内存。因此在device node创建之前需要先从device tree中解析出memory信息。"

> "bootargs用于向内核传递启动参数，内核启动时解析这些参数并从特定的section中查找并执行参数处理函数。"

## Evidence

- Source: [原始文章](raw/tech/bsp/devicetree和启动参数解析流程.md) [[../../raw/tech/bsp/devicetree和启动参数解析流程.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/devicetree和启动参数解析流程.md) [[../../raw/tech/bsp/devicetree和启动参数解析流程.md|原始文章]]
