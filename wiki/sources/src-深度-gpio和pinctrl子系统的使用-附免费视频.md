---
doc_id: src-深度-gpio和pinctrl子系统的使用-附免费视频
title: "【深度】GPIO和Pinctrl子系统的使用（附免费视频）"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/【深度】GPIO和Pinctrl子系统的使用 (附免费视频).md
domain: tech/peripheral
created: 2026-05-03
updated: 2026-05-04
tags: [peripheral, linux, gpio, pinctrl, device-tree, driver]
---

# 【深度】GPIO和Pinctrl子系统的使用（附免费视频）

## 来源

- **原始文件**: raw/tech/peripheral/【深度】GPIO和Pinctrl子系统的使用 (附免费视频).md
- **提取日期**: 2026-05-03

## Summary

本文是韦东山老师发布的关于Linux内核中GPIO和Pinctrl子系统使用的深度技术文章，面向嵌入式Linux驱动开发人员。文章指出在实际开发中不应直接操作寄存器（避免成为"寄存器工程师"），而应充分利用内核提供的标准化子系统。Pinctrl子系统负责管理芯片引脚的复用（IOMUX）和配置（上拉、下拉、开漏等），GPIO子系统则控制引脚作为通用输入输出的具体行为。文章从设备树（Device Tree）入手，详细讲解了pin controller与client device的概念、pin state（default/sleep等状态）、group与function的映射关系，并说明了BSP工程师与驱动工程师的职责分工。通过系统化的使用Pinctrl和GPIO子系统，开发人员可以高效地完成引脚配置，无需关注底层寄存器细节，大幅提升驱动开发效率和代码可移植性。

## Key Points

### 为什么需要Pinctrl子系统

现代SoC芯片动辄几百个引脚，每个引脚可复用为GPIO、I2C、SPI、UART等多种功能：

1. **引脚复用（IOMUX）**
   - pinA、pinB用于GPIO时需设置IOMUX连接到GPIO模块
   - pinA、pinB用于I2C时需设置IOMUX连接到I2C模块
   - GPIO、I2C是并列关系，使用前均需配置IOMUX

2. **引脚配置**
   - 上拉、下拉电阻
   - 开漏输出
   - 驱动强度
   - slew rate控制

3. **分工协作**
   - **BSP工程师**：在Pinctrl/GPIO子系统中添加芯片支持
   - **驱动工程师**：在BSP基础上开发，调用标准接口

### Pinctrl子系统核心概念

| 概念 | 说明 | 对应硬件/软件 |
|------|------|-------------|
| Pin Controller | 提供引脚复用和配置服务 | 对应IOMUX模块 |
| Client Device | 使用Pinctrl服务的设备 | UART、I2C等设备节点 |
| Pin State | 设备不同状态下的引脚配置 | default、sleep等 |
| Group | 一组功能相关的引脚 | 如uart0_tx/rx引脚组 |
| Function | 引脚复用为何种功能 | gpio、uart0、i2c1等 |

### Pin State状态管理

一个client device（如UART设备）可能有多种工作状态：

```
default状态：设备正常工作
  → 引脚复用为UART功能
  
sleep状态：设备休眠省电
  → 引脚复用为GPIO功能
  → 或配置为输出高电平
```

**设备树配置示例**：
- `pinctrl-names`定义状态名称：default、sleep
- `pinctrl-0`指向default状态对应的引脚配置节点
- `pinctrl-1`指向sleep状态对应的引脚配置节点
- 设备切换状态时，Pinctrl子系统自动应用对应配置

### 引脚配置节点类型

1. **Generic Pin Multiplexing Node**
   - 描述哪组（group）引脚复用为何种功能（function）
   - 例：`group = "uart0_pins"; function = "uart0";`

2. **Generic Pin Configuration Node**
   - 描述哪组引脚配置为何种电气特性（setting）
   - 例：上拉、下拉、驱动强度等

> **重要**：pin controller节点的格式没有统一标准，每家芯片厂商都不同，甚至group、function关键字也可能不同，但核心概念是一致的。

### GPIO子系统与Pinctrl的关系

| 特性 | Pinctrl子系统 | GPIO子系统 |
|------|-------------|-----------|
| 管理范围 | 引脚复用和电气配置 | 引脚输入输出方向和数据 |
| 控制对象 | 所有可复用引脚 | 配置为GPIO功能的引脚 |
| 典型操作 | 复用为UART/I2C、配置上拉 | 设置输出高/低电平、读取输入 |
| 关系 | 父级/基础 | 子级/应用 |

**关键理解**：
- 大多数芯片没有单独的IOMUX模块，引脚复用和配置在GPIO模块内部实现
- 硬件上GPIO和Pinctrl密切相关，软件上它们的关系也非常密切
- 因此这两个子系统通常一起讲解和使用

### 驱动开发中的透明使用

在驱动代码中引用Pinctrl是**透明**的，基本无需手动管理：

1. **设备枚举阶段**：platform_device和platform_driver匹配过程中，内核自动根据设备树中`pinctrl-x`属性应用对应配置
2. **状态切换**：当设备进入suspend/resume时，内核自动切换pin state
3. **驱动关注点**：驱动工程师主要关注设备本身的业务逻辑，引脚管理交给子系统

### 参考文档

- 内核 `Documentation/devicetree/bindings/pinctrl/pinctrl-bindings.txt`
- 内核 `Documentation/devicetree/bindings/gpio/gpio.txt`
- 内核 `Documentation/gpio` 目录下相关文档

## Key Quotes

> "前面的视频，我们使用直接操作寄存器的方法编写驱动。这只是为了让大家掌握驱动程序的本质，在实际开发过程中我们可不这样做，太低效了！如果驱动开发都是这样去查找寄存器，那我们就变成'寄存器工程师'了，即使是做单片机的都不执着于裸写寄存器了。"

> "所以GPIO、I2C应该是并列的关系，它们能够使用之前，需要设置IOMUX。有时候并不仅仅是设置IOMUX，还要配置引脚，比如上拉、下拉、开漏等等。"

> "等等，GPIO模块在图中跟I2C不是并列的吗？干嘛在讲Pinctrl时还把GPIO子系统拉进来？大多数的芯片，没有单独的IOMUX模块，引脚的复用、配置等等，就是在GPIO模块内部实现的。"

> "在硬件上GPIO和Pinctrl是如此密切相关，在软件上它们的关系也非常密切。"

> "注意：pin controller节点的格式，没有统一标准！！！！每家芯片都不一样。甚至上面的group、function关键字也不一定有，但是概念是有的。"

## Related Pages

- [[linux-driver]] — Linux 驱动开发
- [[device-tree]] — 设备树语法与使用
- [[gpio]] — GPIO 通用输入输出
- [[pinctrl]] — 引脚控制子系统
- [[platform-driver]] — Platform 设备驱动模型

## 开放问题

- 不同芯片厂商（NXP、TI、Rockchip、Allwinner）Pinctrl实现的差异
- 复杂SoC中多电源域对Pinctrl状态管理的影响
- GPIO子系统与中断子系统的联动机制
- 如何在驱动中处理Pinctrl配置失败的情况