---
doc_id: src-linux-input-子系统
title: "Linux input 子系统"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/Linux input 子系统.md
domain: tech/peripheral
created: 2026-05-03
updated: 2026-05-03
tags: [peripheral]
---

# Linux input 子系统

## 来源

- **原始文件**: raw/tech/peripheral/Linux input 子系统.md
- **提取日期**: 2026-05-03

## Summary

Linux input子系统是内核中专门用于处理输入设备的框架，统一管理按键、鼠标、键盘、触摸屏、摇杆等各类输入设备。尽管输入设备本质上是字符设备，但Linux内核通过input子系统提供了一层抽象，将不同硬件的输入事件统一转换为标准格式，简化了驱动开发和应用程序的接口。input子系统采用分层架构：底层是设备驱动层，负责与具体硬件交互；中间是input核心层，负责事件标准化和分发；上层通过event接口（/dev/input/eventX）向用户空间提供统一的访问方式。该框架的设计使得新增输入设备驱动时无需修改应用程序，应用程序也无需关心底层硬件细节，只需通过标准接口读取输入事件即可。input子系统是Linux嵌入式开发中不可或缺的部分，广泛应用于工业HMI、消费电子、汽车信息娱乐等场景。

## Key Points

### input子系统架构

```
用户空间应用程序
    | (read /dev/input/eventX)
    v
Input Event Interface (evdev)
    | (input_event结构体)
    v
Input Core Layer (drivers/input/input.c)
    | (事件分发、键码映射)
    v
Input Device Drivers
    | (按键、触摸、鼠标等)
    v
Hardware Input Devices
```

### 核心数据结构

| 结构体 | 功能 | 关键字段 |
|--------|------|----------|
| `struct input_dev` | 输入设备描述 | name, phys, evbit, keybit, absbit |
| `struct input_event` | 输入事件 | time, type, code, value |
| `struct input_handler` | 事件处理器 | connect, disconnect, event, filter |
| `struct input_handle` | 设备与处理器连接 | dev, handler |

### 输入事件类型（type）

| 事件类型 | 宏定义 | 说明 |
|----------|--------|------|
| 同步事件 | EV_SYN | 事件包分隔 |
| 按键事件 | EV_KEY | 键盘、按钮等 |
| 相对位移 | EV_REL | 鼠标相对移动 |
| 绝对位移 | EV_ABS | 触摸屏绝对坐标 |
| miscellaneous | EV_MSC | 杂项事件 |
| led事件 | EV_LED | LED控制 |
| 声音事件 | EV_SND | 蜂鸣器等 |
| 重复事件 | EV_REP | 自动重复 |

### input驱动编写流程

1. **分配input_dev**
   ```c
   struct input_dev *input_allocate_device(void);
   ```

2. **设置设备参数**
   - 设置设备名称：`input_dev->name`
   - 设置支持的事件类型：`set_bit(EV_KEY, input_dev->evbit)`
   - 设置支持的键码：`set_bit(KEY_A, input_dev->keybit)`

3. **注册设备**
   ```c
   int input_register_device(struct input_dev *dev);
   ```

4. **上报事件**
   ```c
   input_report_key(dev, KEY_A, 1);  // 按下
   input_report_key(dev, KEY_A, 0);  // 释放
   input_sync(dev);                   // 同步
   ```

5. **注销设备**
   ```c
   input_unregister_device(dev);
   input_free_device(dev);
   ```

### 用户空间接口

| 接口 | 路径 | 用途 |
|------|------|------|
| event接口 | `/dev/input/eventX` | 读取原始输入事件 |
| 键盘接口 | `/dev/input/jsX` | 摇杆设备 |
| 鼠标接口 | `/dev/input/mouseX` | 鼠标设备 |
| sysfs | `/sys/class/input/` | 查看设备信息 |

### 调试工具

- `evtest`：测试输入设备，显示实时事件
- `cat /proc/bus/input/devices`：查看所有输入设备
- `hexdump /dev/input/event0`：读取原始事件数据

## Key Quotes

> "按键、鼠标、键盘、触摸屏等都属于输入(input)设备，Linux内核为此专门做了一个叫做input子系统的框架来处理输入事件。"

> "输入设备本质上还是字符设备，input子系统在此基础上提供了统一的事件抽象层。"

> "input核心层会向Linux内核注册一个字符设备，drivers/input/input.c就是input输入子系统的核心层。"

> "input子系统分为input驱动层、input核心层、input事件处理层，最终给用户空间提供可访问的设备节点。"

## Related Pages

- [[linux-driver]] — Linux 驱动开发框架
- [[input-device]] — 输入设备技术
- [[touchscreen]] — 触摸屏技术
- [[keyboard]] — 键盘接口

## 开放问题

- input子系统在多触控场景下的性能优化
- 与Wayland/X11输入栈的集成细节