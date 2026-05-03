---
doc_id: src-linux-pwm-子系统
title: "Linux pwm 子系统"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/Linux pwm 子系统.md
domain: tech/peripheral
created: 2026-05-03
updated: 2026-05-03
tags: [peripheral]
---

# Linux pwm 子系统

## 来源

- **原始文件**: raw/tech/peripheral/Linux pwm 子系统.md
- **提取日期**: 2026-05-03

## Summary

Linux PWM（Pulse Width Modulation，脉冲宽度调制）子系统是内核中用于统一管理PWM输出设备的框架。PWM在嵌入式系统中应用广泛，包括LED亮度控制、电机调速、LCD背光调节、蜂鸣器驱动等场景。Linux PWM子系统通过提供标准化的内核API和用户空间sysfs接口，使得驱动开发者和应用程序能够以统一的方式操作不同硬件平台的PWM功能，而无需关心底层定时器寄存器的具体实现。PWM子系统的核心是`pwm_chip`结构体，代表一个PWM控制器，每个控制器可以提供多个PWM通道。芯片厂商通常为SoC编写了PWM控制器驱动，开发者在使用时主要通过设备树（Device Tree）进行配置，并在用户空间通过`/sys/class/pwm/`接口或内核API控制PWM的周期和占空比。PWM子系统的设计大大简化了跨平台PWM应用的开发。

## Key Points

### PWM子系统架构

```
用户空间
    | (sysfs /sys/class/pwm/)
    v
PWM Core (drivers/pwm/pwm-core.c)
    | (pwm_config, pwm_enable, pwm_disable)
    v
PWM Controller Driver (厂商实现)
    | (硬件寄存器操作)
    v
SoC PWM Hardware (定时器模块)
```

### 核心数据结构

| 结构体 | 功能 | 关键字段 |
|--------|------|----------|
| `struct pwm_chip` | PWM控制器 | dev, ops, base, npwm |
| `struct pwm_device` | PWM通道 | chip, hwpwm, period, duty_cycle |
| `struct pwm_ops` | 操作函数集 | request, free, config, enable, disable |

### PWM关键参数

| 参数 | 说明 | 控制方式 |
|------|------|----------|
| period | PWM周期（纳秒） | `pwm_config()`或sysfs |
| duty_cycle | 高电平时间（纳秒） | `pwm_config()`或sysfs |
| polarity | 极性（正常/反向） | `PWM_POLARITY_NORMAL`/`INVERSED` |
| enable | 使能/禁用输出 | `pwm_enable()`/`pwm_disable()` |

### 用户空间sysfs接口

| 路径 | 功能 |
|------|------|
| `/sys/class/pwm/pwmchipN/` | PWM控制器N的根目录 |
| `npwm` | 该控制器的通道数量 |
| `export` | 导出指定通道（写入通道号） |
| `unexport` | 释放指定通道 |
| `/sys/class/pwm/pwmchipN/pwmM/` | 通道M的控制接口 |
| `period` | 设置/读取周期（纳秒） |
| `duty_cycle` | 设置/读取占空比（纳秒） |
| `enable` | 使能(1)或禁用(0)PWM输出 |
| `polarity` | 设置极性 |

### 使用示例

```bash
# 导出PWM通道0
echo 0 > /sys/class/pwm/pwmchip0/export

# 设置周期为1ms (1KHz)
echo 1000000 > /sys/class/pwm/pwmchip0/pwm0/period

# 设置占空比为50%
echo 500000 > /sys/class/pwm/pwmchip0/pwm0/duty_cycle

# 使能PWM输出
echo 1 > /sys/class/pwm/pwmchip0/pwm0/enable
```

### 设备树配置示例

```dts
&pwm {
    pinctrl-names = "default";
    pinctrl-0 = <&pwm_pins>;
    status = "okay";
};

backlight: backlight {
    compatible = "pwm-backlight";
    pwms = <&pwm 0 50000>;  /* pwm, channel, period */
    brightness-levels = <0 4 8 16 32 64 128 255>;
    default-brightness-level = <6>;
};
```

### PWM驱动开发要点

- 芯片厂商通常已提供PWM控制器驱动
- 开发者主要关注设备树配置和背光/电机等上层驱动
- 参考内核文档：`Documentation/ABI/testing/sysfs-class-pwm`
- 背光绑定文档：`Documentation/devicetree/bindings/video/backlight/pwm-backlight.txt`

## Key Quotes

> "PWM：Pulse width modulation，脉冲宽度调制，在IC中，是使用定时器产生可调占空比方波的技术。"

> "PWM驱动比I2C等简单，芯片厂商已经为SoC写了PWM驱动，我们在使用过程中，只需要修改设备树。"

> "PWM子系统的核心是pwm_chip结构体，在sys/class/pwm/下会显示内核注册了几个控制器。"

> "PWM多用于控制马达、LED、振动器等模拟器件。"

## Related Pages

- [[pwm]] — PWM 技术原理
- [[linux-driver]] — Linux 驱动开发框架
- [[device-tree]] — 设备树配置
- [[backlight]] — LCD背光控制
- [[motor-control]] — 电机调速

## 开放问题

- PWM子系统在高精度音频应用中的抖动控制
- 多通道PWM同步与相位控制的内核支持