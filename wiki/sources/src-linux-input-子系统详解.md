---
doc_id: src-linux-input-子系统详解
title: "Linux input 子系统详解"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/Linux input 子系统详解.md
domain: tech/peripheral
created: 2026-05-03
updated: 2026-05-03
tags: [peripheral]
---

# Linux input 子系统详解

## 来源

- **原始文件**: raw/tech/peripheral/Linux input 子系统详解.md
- **提取日期**: 2026-05-03

## Summary

本文详细解析了Linux内核input子系统的架构、核心机制和驱动开发方法。input子系统是Linux核心框架之一，专门用于管理各类输入设备，包括触摸屏、键盘、鼠标、摇杆等。这些输入设备属于字符设备，但种类繁多、接口各异，input子系统通过提供统一的事件抽象层，将不同硬件的输入转换为标准化的`input_event`结构，从而简化了驱动开发和应用编程。文章深入介绍了input子系统的三个层次：设备驱动层负责与硬件交互，核心层负责事件标准化和分发，事件处理层（如evdev）负责向用户空间提供统一接口。此外还涵盖了键码映射、ABS坐标系处理、多点触控协议（MT协议）以及input子系统与设备树的集成方式，是Linux驱动开发者的进阶参考资料。

## Key Points

### 模块概述与代码位置

| 组件 | 代码路径 | 功能 |
|------|----------|------|
| input核心 | `drivers/input/input.c` | 设备注册、事件分发 |
| 事件处理 | `drivers/input/evdev.c` | evdev字符设备接口 |
| 键码定义 | `include/uapi/linux/input-event-codes.h` | 标准键码和事件码 |
| 手柄驱动 | `drivers/input/joystick/` | 游戏摇杆支持 |
| 键盘驱动 | `drivers/input/keyboard/` | 键盘设备驱动 |
| 鼠标驱动 | `drivers/input/mouse/` | 鼠标设备驱动 |
| 触摸屏 | `drivers/input/touchscreen/` | 触摸屏驱动集合 |

### 核心机制

1. **事件标准化**
   - 所有输入事件统一为`struct input_event`格式
   - 包含时间戳、事件类型、事件码和值四个字段
   - 消除了不同硬件之间的接口差异

2. **键码映射**
   - 硬件扫描码（scancode）→ Linux键码（keycode）→ 按键符号（keysym）
   - 通过`set_bit()`配置设备支持的键码集合
   - 支持通过`EVIOCSKEYCODE` ioctl动态修改映射

3. **ABS坐标系**
   - 绝对坐标事件（EV_ABS）用于触摸屏、摇杆等
   - 通过`input_set_abs_params()`设置坐标范围
   - 支持压力、面积、工具类型等多维信息

4. **多点触控协议（MT Protocol）**
   - Type A：隐式跟踪，适用于简单触控
   - Type B：显式跟踪，使用slot标识不同触点
   - 支持`ABS_MT_SLOT`、`ABS_MT_TRACKING_ID`等事件

### input驱动开发进阶

| 步骤 | 关键操作 | API/函数 |
|------|----------|----------|
| 1. 分配设备 | 创建input_dev结构 | `input_allocate_device()` |
| 2. 配置能力 | 设置事件类型和码 | `set_bit()`, `input_set_abs_params()` |
| 3. 注册设备 | 加入input子系统 | `input_register_device()` |
| 4. 上报事件 | 发送输入数据 | `input_report_key()`, `input_report_abs()` |
| 5. 同步事件 | 标记事件包结束 | `input_sync()` |
| 6. 注销清理 | 释放资源 | `input_unregister_device()` |

### 与设备树集成

```dts
my_touchscreen: touchscreen@38 {
    compatible = "myvendor,my-touch";
    reg = <0x38>;
    interrupt-parent = <&gpio>;
    interrupts = <23 IRQ_TYPE_EDGE_FALLING>;
    touchscreen-size-x = <800>;
    touchscreen-size-y = <480>;
};
```

### 用户空间编程接口

```c
#include <linux/input.h>

struct input_event ev;
int fd = open("/dev/input/event0", O_RDONLY);
read(fd, &ev, sizeof(ev));
// ev.type, ev.code, ev.value
```

## Key Quotes

> "Linux输入设备种类繁杂，常见的包括触摸屏、键盘、鼠标、摇杆等；这些输入设备属于字符设备。"

> "input子系统就是管理输入的子系统，和pinctrl和gpio子系统一样，都是Linux内核的框架。"

> "drivers/input/input.c就是input输入子系统的核心层。"

> "input_dev通过全局的input_dev_list链接在一起，设备注册的时候完成这个操作。"

## Related Pages

- [[linux-input]] — Linux input子系统基础
- [[linux-driver]] — Linux 驱动开发框架
- [[touchscreen]] — 触摸屏驱动技术
- [[device-tree]] — 设备树与input设备

## 开放问题

- input子系统在高刷新率触控屏上的延迟优化
- MT Type B协议与手势识别的结合方案