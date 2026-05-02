---
doc_id: src-uboot-dm-model
title: U-Boot 驱动模型（DM）详解
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/超详细【Uboot驱动开发】（三）Uboot驱动模型.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, uboot, driver-model, dm]
---

## Summary

本文系统讲解了 U-Boot 的 Driver Model（DM）驱动模型，借鉴 Linux 设备驱动模型架构，为驱动定义和访问提供统一方法。详细介绍了 DM 模型的六大核心数据结构（global_data、uclass、uclass_driver、uclass_id、udevice、driver）、静态与动态模式、初始化流程（initf_dm/initr_dm）、设备与驱动的绑定机制、probe 探测函数的执行流程，以及 uclass 与 uclass_driver 的绑定过程。

## Key Points

### 1. DM 模型的目的
- 提高代码可重用性（跨平台、跨架构）
- 高内聚低耦合（统一抽象接口）
- 便于管理（驱动数量不断增长）

### 2. 核心数据结构
- **global_data**: 管理 DM 根设备 `dm_root` 和 uclass 链表头 `uclass_root`
- **uclass**: 驱动类别管理器，管理同一类下的所有 `udevice`
- **uclass_driver**: 为 uclass 提供统一操作接口
- **uclass_id**: 设备类型唯一标识
- **udevice**: 设备实例，通过 `U_BOOT_DEVICE` 或设备树定义
- **driver**: 驱动程序，通过 `U_BOOT_DRIVER` 定义

### 3. 静态模式 vs 动态模式
- **静态**: 对象离散，利于模块化（udevice 和 driver 独立）
- **动态**: 运行时组合成层次视图（引入 uclass/uclass_driver 关联）

### 4. 设备与驱动绑定
- `lists_bind_fdt`: 扫描设备树节点，通过 compatible 匹配 driver
- 匹配成功后创建 udevice，同时指向设备资源和 driver

### 5. probe 探测函数
- `device_probe`: 获取 driver → 判断父设备 probe → 调用 driver.probe
- 以 MMC 驱动为例：`mmc_probe` → `uclass_get_device_by_seq` → `device_probe`

### 6. uclass 与 uclass_driver 绑定
- `uclass_get`: 根据 uclass_id 查找或创建 uclass
- `uclass_add`: 查找 uclass_driver，绑定到 uclass，添加到全局链表

## Evidence

```c
// uclass 结构体
struct uclass {
    void *priv;
    struct uclass_driver *uc_drv;
    struct list_head dev_head;      // 该 uclass 的所有设备
    struct list_head sibling_node;  // 下一个 uclass
};

// udevice 结构体
struct udevice {
    const struct driver *driver;
    const char *name;
    struct uclass *uclass;
    struct udevice *parent;
    struct list_head child_head;
    struct list_head sibling_node;
};
```

## Open Questions

- DM 模型在不同硬件平台（x86/ARM/RISC-V）的适配差异
- DM 模型与 Linux Kernel 设备模型的对应关系

## Related Pages

- [[u-boot]]
- [[device-driver]]
- [[device-tree]]
- [[uboot-dm]]
