---
doc_id: device-tree
title: Device Tree
page_type: concept
related_sources:
  - src-userspace-hardware-access
  - src-ioremap-why
  - src-acpi-vs-devicetree
  - src-arm-soc-bootflow-intro
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, bsp, hardware-description]
---

# Device Tree（设备树）

## 定义

Device Tree（设备树）是一种描述硬件配置的数据结构，采用树形结构组织系统中的设备信息。它起源于 Open Firmware（PowerPC、SPARC 架构），后被 ARM Linux 采纳，用于替代 arch/arm 下大量的硬编码平台代码。

## 核心文件

| 文件 | 说明 |
|------|------|
| `.dts` | Device Tree Source，文本格式的设备树源文件 |
| `.dtsi` | 设备树头文件，被多个 .dts 包含 |
| `.dtb` | Device Tree Blob，编译后的二进制设备树 |
| `dtc` | Device Tree Compiler，设备树编译器 |

## 编译流程

```bash
dtc -O dtb -o output.dtb -b 0 input.dts
```

- `.dts` → `dtc` → `.dtb`
- 类比：`.c` → `gcc` → `.o`

## 基本结构

```dts
/ {
    model = "TI AM335x BeagleBone Black";
    compatible = "ti,beaglebone-black";
    
    cpus {
        cpu@0 {
            cpu0-supply = <&dcdc2_reg>;
        };
    };
    
    memory {
        device_type = "memory";
        reg = <0x80000000 0x10000000>; /* 256 MB */
    };
};
```

## 关键属性

| 属性 | 说明 |
|------|------|
| `compatible` | 设备兼容性字符串，驱动匹配依据 |
| `reg` | 寄存器地址和大小 |
| `interrupts` | 中断号和中断触发方式 |
| `clocks` | 时钟源引用 |
| `pinctrl` | 引脚复用配置 |

## 与 ACPI 的对比

| | Device Tree | ACPI |
|---|---|---|
| 起源 | Open Firmware (PowerPC/SPARC) | x86 PC |
| 适用场景 | 嵌入式系统、手机 | 服务器、PC |
| 标准化 | 社区驱动 | UEFI 论坛标准化 |
| 动态生成 | 可静态编译或动态生成 | 通常由 BIOS/UEFI 动态生成 |
| ARM 生态 | 嵌入式主流 | 服务器强制要求 |

## 内核中的使用

- Linux 内核启动时解析 DTB
- 驱动通过 `of_match_table` 匹配 compatible 字符串
- `of_iomap()` 用于从设备树获取并映射寄存器地址

## 相关来源

- [[src-acpi-vs-devicetree]] — ARM Server 为什么用 ACPI
- [[src-userspace-hardware-access]] — UIO 框架与设备树配置
- [[src-ioremap-why]] — of_iomap() 的使用
