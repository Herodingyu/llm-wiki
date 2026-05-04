---
title: "中断向量表中断号与 CMSIS IRQn 映射关系深度剖析：从硬件索引到软件句柄的桥梁"
source: "https://mp.weixin.qq.com/s/AsWtAB_UDFoI10N_2e4CFQ"
author:
  - "[[OneChan]]"
published:
created: 2026-05-04
description: "引言：两个世界的对话在 Cortex-M 处理器中，中断和异常的源头以编号的形式存在于硬件层面：每个异常（包括"
tags:
  - "clippings"
---
OneChan *2026年3月25日 19:00*

### 引言：两个世界的对话

在 Cortex-M 处理器中，中断和异常的源头以编号的形式存在于硬件层面：每个异常（包括系统异常和外部中断）都有一个唯一的硬件编号，用于在向量表中索引对应的处理程序地址。然而，在软件层面，开发者需要一种更友好、更可移植的方式来引用这些中断。CMSIS（Cortex Microcontroller Software Interface Standard）定义了 `IRQn` 类型，作为连接硬件中断号与软件接口的桥梁。理解这两者之间的映射关系，是正确配置中断、编写可移植代码的基础。

为什么不能直接使用硬件编号？因为硬件编号的分配在不同 Cortex-M 型号和不同芯片厂商之间可能略有差异（尤其是系统异常部分）。CMSIS 通过引入负值表示系统异常、非负值表示外部中断的统一模型，屏蔽了底层硬件的细节，使得开发者可以使用一致的 `IRQn` 参数调用 CMSIS 函数，而无需关心具体芯片的向量表布局。

本文将深入剖析中断向量表的结构、硬件中断号的由来、CMSIS IRQn 的定义方式，以及两者之间的转换关系，并通过图表和代码示例，揭示这一映射设计背后的哲学。

---

### 一、中断向量表：硬件层面的异常索引

#### 1.1 向量表布局

Cortex-M 处理器的向量表是一个包含 32 位地址的数组，存储在内存起始位置（默认地址 0x00000000，但可通过 VTOR 重定位）。向量表的前 16 项用于系统异常，之后的项用于外部中断，具体数量由芯片厂商决定（最多 240 个）。下表展示了典型的向量表布局：

| 向量表索引 | 异常编号 | 异常类型 | CMSIS IRQn | 描述 |
| --- | --- | --- | --- | --- |
| 0 | \- | 初始堆栈指针 | 不适用 | 复位后的 MSP 值 |
| 1 | 1 | 复位 | \-15 | 系统复位向量 |
| 2 | 2 | NMI | \-14 | 不可屏蔽中断 |
| 3 | 3 | HardFault | \-13 | 硬 fault |
| 4 | 4 | MemManage | \-12 | 内存管理 fault |
| 5 | 5 | BusFault | \-11 | 总线 fault |
| 6 | 6 | UsageFault | \-10 | 用法 fault |
| 7-10 | 7-10 | 保留 | \-9..-6 | 保留 |
| 11 | 11 | SVCall | \-5 | 系统服务调用 |
| 12 | 12 | 调试监视器 | \-4 | 调试监控 |
| 13 | 13 | 保留 | \-3 | 保留 |
| 14 | 14 | PendSV | \-2 | 可挂起的系统服务 |
| 15 | 15 | SysTick | \-1 | 系统滴答定时器 |
| 16 | 16 | 外部中断 0 | 0 | 第一个外部中断 |
| 17 | 17 | 外部中断 1 | 1 | 第二个外部中断 |
| ... | ... | ... | ... | ... |
| 16+N-1 | 16+N-1 | 外部中断 N-1 | N-1 | 第 N 个外部中断 |

关键观察：

- 向量表索引 0 存放的是初始堆栈指针，不是异常处理程序，因此不分配异常编号。
- 系统异常编号从 1 到 15（Cortex-M3/M4），占用向量表索引 1 到 15。
- 外部中断从异常编号 16 开始，对应向量表索引 16 及以后。
- 每个异常/中断的硬件编号等于其在向量表中的索引。

#### 1.2 硬件编号的作用

在硬件层面，NVIC 使用异常编号来标识中断源。例如：

- 当发生 SysTick 中断时，硬件会将异常编号 15 存入 IPSR（中断程序状态寄存器）中。
- 软件可以通过读取 IPSR 获取当前正在执行的异常编号，从而判断处于哪个中断上下文。

然而，直接使用异常编号（15 表示 SysTick，16 表示外部中断 0）对于开发者来说并不直观，而且不同 Cortex-M 版本的系统异常编号可能有细微差别（如 Cortex-M0 的异常数量更少）。因此，CMSIS 引入了 IRQn 作为软件层的抽象。

---

### 二、CMSIS IRQn：软件层的统一句柄

#### 2.1 设计意图

CMSIS 是由 ARM 公司主导的 Cortex-M 微控制器软件接口标准，旨在提供一致的编程模型，使得开发者可以轻松地在不同厂商的芯片之间移植代码。在中断管理方面，CMSIS 定义了 `IRQn_Type` 枚举类型，用于表示所有可能的异常和中断源。其设计原则是：

- 系统异常用负数表示：方便与正数的外部中断区分，且负数的大小与异常号有固定偏移关系。
- 外部中断从 0 开始编号：0 表示第一个外部中断，1 表示第二个，以此类推，与硬件中断号（异常编号）相差 16。
- 与硬件编号的解耦：开发者只需使用 CMSIS 定义的 IRQn，无需关心硬件异常编号的具体数值。

#### 2.2 CMSIS 中的 IRQn 定义

在 CMSIS 核心头文件（如 `core_cm3.h` ）中，通常会包含一个由芯片厂商扩展的枚举类型，定义所有可用的中断源。例如：

```markdown
typedef enum IRQn{    /******  Cortex-M3 系统异常（负数） ********/    NonMaskableInt_IRQn          = -14,    HardFault_IRQn                = -13,    MemoryManagement_IRQn         = -12,    BusFault_IRQn                 = -11,    UsageFault_IRQn               = -10,    SVCall_IRQn                   = -5,    DebugMonitor_IRQn             = -4,    PendSV_IRQn                   = -2,    SysTick_IRQn                  = -1,    /******  芯片特定外部中断（非负） ********/    WWDG_IRQn                     = 0,    PVD_IRQn                      = 1,    TAMPER_IRQn                   = 2,    // ... 更多中断定义} IRQn_Type;
```

观察：

- 系统异常的 IRQn 值从 -15 到 -1，但并非所有值都被使用，有些是保留的（如 -9 到 -6 未定义）。
- 外部中断从 0 开始连续递增，直到芯片支持的最大中断号减 1。

#### 2.3 IRQn 与硬件异常编号的转换

从硬件异常编号到 IRQn 的转换规则非常简单：

- 对于系统异常（异常编号 1-15）： `IRQn = 异常编号 - 16` 例如：异常编号 1（复位）→ IRQn = -15；异常编号 15（SysTick）→ IRQn = -1。
- 对于外部中断（异常编号 ≥16）： `IRQn = 异常编号 - 16` 例如：异常编号 16（第一个外部中断）→ IRQn = 0；异常编号 17 → IRQn = 1。

反过来，从 IRQn 到硬件异常编号的转换：

- 如果 IRQn < 0：异常编号 = IRQn + 16。
- 如果 IRQn ≥ 0：异常编号 = IRQn + 16。

#### 2.4 为什么系统异常 IRQn 是负数？

这个设计巧妙地利用了有符号整数的特性：

- 负数表示系统异常，正数表示外部中断，一目了然。
- 与 CMSIS 函数参数类型（int32\_t）一致，可以统一传递。
- 使得外部中断的编号从 0 开始，符合 C 语言数组索引的习惯，便于使用数组管理中断相关的数据。

同时，负数的数值与异常编号的偏移量（-16）确保了每个系统异常都有唯一的 IRQn，且与外部中断不重叠。

---

### 三、映射关系的可视化

下图直观地展示了向量表索引、硬件异常编号和 CMSIS IRQn 之间的映射关系：

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

图1：向量表索引、硬件异常编号与 CMSIS IRQn 映射关系

图片解释：左列是向量表索引，索引0存储SP，索引1-15存储系统异常处理程序地址，索引16开始存储外部中断处理程序地址。中间列是硬件异常编号，等于向量表索引（但索引0无编号）。右列是CMSIS IRQn，系统异常对应负数（编号-16），外部中断从0开始，与硬件编号相差16。箭头展示了从向量表索引到IRQn的转换路径。

---

### 四、CMSIS 函数如何利用 IRQn

CMSIS 提供了一系列中断管理函数，它们都以 `IRQn` 作为参数，内部通过该值计算出对应的硬件资源（如 NVIC 寄存器位）。理解这一过程有助于我们编写更高效的代码，并洞察 CMSIS 的设计思想。

#### 4.1 使能中断：NVIC\_EnableIRQ

以下是 `NVIC_EnableIRQ` 的典型实现（简化版）：

```cpp
#define NVIC_ISER0  ((volatile uint32_t*)0xE000E100)  // 中断使能寄存器0void NVIC_EnableIRQ(IRQn_Type IRQn){    if (IRQn >= 0) {        // 外部中断：IRQn 从0开始，对应 NVIC 的位        uint32_t regIdx = IRQn >> 5;       // 除以32，得到寄存器索引        uint32_t bitPos = IRQn & 0x1F;      // 对32取模，得到位位置        NVIC->ISER[regIdx] = (1UL << bitPos);    } else {        // 系统异常不能通过 NVIC 使能/除能，但可以设置优先级等        // 这里可能不做操作，或由其他函数处理    }}
```

关键点：

- 对于外部中断（IRQn ≥ 0）， `IRQn` 直接对应硬件中断号，因此可以直接用来计算 NVIC 寄存器中的位索引。
- 对于系统异常（IRQn < 0），NVIC 寄存器并不对应它们，因此函数通常直接返回或做特殊处理（如某些系统异常的优先级可通过 SCB 设置，但使能/除能是固定的）。

#### 4.2 设置优先级：NVIC\_SetPriority

```cpp
void NVIC_SetPriority(IRQn_Type IRQn, uint32_t priority){    if (IRQn >= 0) {        // 外部中断优先级寄存器位于 NVIC->IP        NVIC->IP[IRQn] = (uint8_t)(priority << (8 - __NVIC_PRIO_BITS));    } else {        // 系统异常优先级寄存器位于 SCB->SHP（系统处理程序优先级寄存器）        SCB->SHP[((uint32_t)(IRQn) & 0xF) - 8] = (uint8_t)(priority << (8 - __NVIC_PRIO_BITS));    }}
```

关键点：

- 对于外部中断，IRQn 直接作为索引访问 `NVIC->IP` 数组。
- 对于系统异常，IRQn 是负数，需要映射到 SCB 中的系统异常优先级寄存器索引。例如，SysTick (IRQn = -1) 对应 SHP 的某个位置。

#### 4.3 获取当前异常号：\_\_get\_IPSR

CMSIS 还提供了读取当前异常号的函数，返回的是硬件异常编号，但开发者通常不需要直接使用，而是通过比较 IRQn 来判断。例如：

```cpp
uint32_t exception_num = __get_IPSR() & 0x1FF;  // 取低9位，异常编号if (exception_num == 15) {    // 当前在 SysTick 中}
```

或者使用 CMSIS 提供的 `__get_IPSR()` 配合自定义转换。

#### 4.4 设计哲学：一次抽象，处处通用

CMSIS 通过 IRQn 将硬件细节封装起来，使得：

- 代码可移植：同一套中断处理代码可以在不同 Cortex-M 芯片上编译运行，只需修改芯片头文件中的 IRQn 枚举。
- 接口统一：所有中断管理函数都使用 int32\_t 参数，简化了函数原型。
- 扩展性：芯片厂商可以在枚举中添加自己的中断，保持与 CMSIS 核心的兼容。

---

### 五、实际应用中的注意事项

#### 5.1 在中断服务程序中识别中断源

在中断服务程序中，通常不需要显式获取中断号，因为每个中断有独立的函数名。但有时需要编写通用的处理函数，根据中断号分支处理。例如：

```javascript
void UART_IRQHandler(void){    uint32_t irq = __get_IPSR() & 0x1FF;  // 获取异常编号    if (irq == UART0_IRQn + 16) {        // 将 IRQn 转换为异常编号        // UART0 中断    } else if (irq == UART1_IRQn + 16) {        // UART1 中断    }}
```

更常用的方法是直接使用 CMSIS 提供的函数 `NVIC_GetActive(IRQn)` 或检查外设自己的中断状态寄存器。

#### 5.2 在 RTOS 中的使用

RTOS 内核通常需要管理中断优先级，它使用 CMSIS 函数设置中断优先级，因此必须正确处理 IRQn。例如，FreeRTOS 的 `portDISABLE_INTERRUPTS()` 可能通过设置 BASEPRI 来屏蔽低于某个阈值的中断，而这个阈值就是通过 IRQn 的优先级值计算得到的。

#### 5.3 常见错误：混淆 IRQn 和硬件异常编号

新手可能错误地将硬件异常编号（如 15）直接当作 IRQn 传递给 `NVIC_EnableIRQ` ，导致操作错误的外部中断。正确的做法是使用 CMSIS 定义的 IRQn 枚举值。

---

### 六、设计哲学总结：抽象与可移植的典范

CMSIS IRQn 与硬件中断号的映射关系，是嵌入式软件工程中“抽象”思想的绝佳体现。其设计哲学可以概括为：

- 分层抽象：硬件层使用连续的异常编号，简洁高效；软件层使用带语义的 IRQn，区分系统异常和外部中断，符合开发者的认知习惯。
- 统一接口：通过有符号整数统一表示所有中断源，使得 CMSIS 函数可以接受任何有效的 IRQn，内部根据正负分支处理。
- 可移植性：芯片厂商只需提供 IRQn 枚举，开发者编写的上层代码无需修改即可在不同芯片间迁移。
- 可扩展性：系统异常部分由 ARM 标准定义，外部中断部分由厂商自由扩展，互不干扰。

这种设计不仅简化了中断编程，还为 RTOS 和其他中间件提供了稳定的底层接口，是 Cortex-M 生态系统成功的关键因素之一。

---

### 七、代码示例：IRQn 的完整应用

以下示例展示了如何利用 CMSIS IRQn 在国产 Cortex-M3 芯片上完成中断配置、查询和识别：

```cpp
#include "core_cm3.h"#include "chip.h"  // 包含芯片特定的 IRQn 定义// 假设芯片有 UART0 和 UART1，IRQn 分别为 20 和 21void init_interrupts(void){    // 使能 UART0 和 UART1 中断    NVIC_EnableIRQ(UART0_IRQn);    NVIC_EnableIRQ(UART1_IRQn);    // 设置优先级：UART0 优先级 2，UART1 优先级 3    NVIC_SetPriority(UART0_IRQn, 2);    NVIC_SetPriority(UART1_IRQn, 3);}// 通用 UART 中断处理程序（如果使用向量表重定向，可以统一入口）void UART_IRQHandler(void){    uint32_t irq_num = __get_IPSR() & 0x1FF;  // 读取异常编号    if (irq_num == UART0_IRQn + 16) {        // 处理 UART0        uint32_t status = UART0->SR;        if (status & UART_SR_RXNE) {            uint8_t data = UART0->DR;            // ...        }    } else if (irq_num == UART1_IRQn + 16) {        // 处理 UART1        // ...    }}// 主函数int main(void){    init_interrupts();    while(1) {        __WFI();  // 等待中断    }}
```

代码解释：

- 使用 `UART0_IRQn` 和 `UART1_IRQn` （由芯片头文件定义）来使能中断和设置优先级，代码不依赖具体数值。
- 在中断处理程序中，通过 `__get_IPSR()` 获取硬件异常编号，然后与 `IRQn + 16` 比较，以区分中断源。
- 这种写法虽然可行，但更常见的做法是让每个外设有自己的中断函数名（如 `UART0_IRQHandler` ），直接在函数中处理对应外设，避免在通用函数中分支。

---

### 结语

中断向量表中断号与 CMSIS IRQn 的映射关系，是理解 Cortex-M 中断体系的关键一环。它不仅是一个简单的数值转换，更是嵌入式软件工程中抽象分层、接口统一、可移植性设计的典范。掌握这一映射，开发者能够更自信地编写中断处理代码，更深入地理解 CMSIS 的设计智慧，进而在复杂的嵌入式系统中游刃有余。

**微信扫一扫赞赏作者**

Cortex-M3 · 目录

作者提示: 个人观点，仅供参考

继续滑动看下一个

OneChan

向上滑动看下一个