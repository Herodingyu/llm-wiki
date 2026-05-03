---
title: "一文搞懂OPTEE的中断处理机制"
source: "https://zhuanlan.zhihu.com/p/653927062"
author:
  - "[[TrustZone​​​海思技术有限公司 员工]]"
published:
created: 2026-05-03
description: "大家好！我是不知名的安全工程师Hkcoco！ 欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco 获取更多精彩内容哦！！！ OPTEE的中断处理机制宏观篇OP-TEE（Open Portable Trusted Execution Environment）的…"
tags:
  - "clippings"
---
2 人赞同了该文章

---

大家好！我是不知名的 [安全工程师](https://zhida.zhihu.com/search?content_id=233445737&content_type=Article&match_order=1&q=%E5%AE%89%E5%85%A8%E5%B7%A5%E7%A8%8B%E5%B8%88&zhida_source=entity) Hkcoco！

欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco

获取更多精彩内容哦！！！

---

## OPTEE的中断处理机制

## 宏观篇

OP-TEE（Open Portable Trusted Execution Environment）的中断处理机制包括以下几个步骤：

- [中断控制器](https://zhida.zhihu.com/search?content_id=233445737&content_type=Article&match_order=1&q=%E4%B8%AD%E6%96%AD%E6%8E%A7%E5%88%B6%E5%99%A8&zhida_source=entity) 初始化：在OP-TEE中，需要 **初始化中断控制器** ，以便能够正确地处理来自 [外部设备](https://zhida.zhihu.com/search?content_id=233445737&content_type=Article&match_order=1&q=%E5%A4%96%E9%83%A8%E8%AE%BE%E5%A4%87&zhida_source=entity) 的中断。在初始化过程中，需要 **设置中断控制器的中断向量表、 [中断优先级](https://zhida.zhihu.com/search?content_id=233445737&content_type=Article&match_order=1&q=%E4%B8%AD%E6%96%AD%E4%BC%98%E5%85%88%E7%BA%A7&zhida_source=entity) 、中断使能等** 参数。
- [中断处理函数](https://zhida.zhihu.com/search?content_id=233445737&content_type=Article&match_order=1&q=%E4%B8%AD%E6%96%AD%E5%A4%84%E7%90%86%E5%87%BD%E6%95%B0&zhida_source=entity) 的注册：在OP-TEE中，\*\*需要为每个中断类型注册一个中断处理函数。\*\*当中断发生时，中断控制器会调用相应的中断处理函数来处理中断。中断处理函数需要根据中断类型进行相应的处理，例如读取网络数据包、更新定时器计数器等。
- 中断通知：当中断发生时， **OP-TEE会通过中断控制器通知核心的安全监视器（Monitor）** 。Monitor是OP-TEE中负责处理安全世界和正常世界之间切换的关键组件。
- [上下文切换](https://zhida.zhihu.com/search?content_id=233445737&content_type=Article&match_order=1&q=%E4%B8%8A%E4%B8%8B%E6%96%87%E5%88%87%E6%8D%A2&zhida_source=entity) ：当发生中断时，如果当前正在执行正常世界的代码，Monitor会执行一个上下文切换，将控制权转移到安全世界的OP-TEE操作系统来处理中断\*\*。这个过程包括保存当前的处理器状态、加载安全世界的状态以及执行安全世界的异常处理程序。\*\*
- 异常处理：OP-TEE的操作系统会调用相应的异常处理程序来处理中断。 [异常处理程序](https://zhida.zhihu.com/search?content_id=233445737&content_type=Article&match_order=3&q=%E5%BC%82%E5%B8%B8%E5%A4%84%E7%90%86%E7%A8%8B%E5%BA%8F&zhida_source=entity) 会根据中断类型进行相应的处理，例如读取 [网络数据包](https://zhida.zhihu.com/search?content_id=233445737&content_type=Article&match_order=2&q=%E7%BD%91%E7%BB%9C%E6%95%B0%E6%8D%AE%E5%8C%85&zhida_source=entity) 、更新定时器计数器等。 **在处理完中断后，异常处理程序会返回一个结果，该结果会被Monitor捕获并保存。**
- 上下文恢复：当异常处理程序完成后， **Monitor会执行一个上下文恢复，将控制权返回到正常世界的代码** 。这个过程包括加载正常世界的处理器状态、保存安全世界的状态以及返回正常世界的异常处理程序。

通过这样的 [中断处理机制](https://zhida.zhihu.com/search?content_id=233445737&content_type=Article&match_order=3&q=%E4%B8%AD%E6%96%AD%E5%A4%84%E7%90%86%E6%9C%BA%E5%88%B6&zhida_source=entity) ，OP-TEE可以实现对外部设备的控制和管理，从而提高系统的安全性和可靠性。

## 微观篇

## 世界上下文切换的用例

本节列出了在世界上下文切换中涉及OP-TEE OS的所有情况。

Optee\_os在安全的世界中执行。世界 [交换机](https://zhida.zhihu.com/search?content_id=233445737&content_type=Article&match_order=1&q=%E4%BA%A4%E6%8D%A2%E6%9C%BA&zhida_source=entity) 是由核心的安全监视器级别/模式完成的，下面称为监视器。

**当正常世界调用安全 [世界时](https://zhida.zhihu.com/search?content_id=233445737&content_type=Article&match_order=1&q=%E4%B8%96%E7%95%8C%E6%97%B6&zhida_source=entity) ，正常世界就会执行一条SMC指令。**

SMC异常总是被监视器捕获。如果相关服务针对受信任的 [操作系统](https://zhida.zhihu.com/search?content_id=233445737&content_type=Article&match_order=3&q=%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F&zhida_source=entity) ，监视器将切换到OP-TEE操作系统世界执行。

当安全世界返回到正常世界时，OP-TEE OS执行一个SMC，它由监视器捕获，并切换回正常世界。

**当一个安全中断被Arm GIC发出信号时** ，它将到达OP-TEE OS中断异常向量。

**如果安全世界正在执行，OP-TEE OS将直接从它的 [异常向量](https://zhida.zhihu.com/search?content_id=233445737&content_type=Article&match_order=2&q=%E5%BC%82%E5%B8%B8%E5%90%91%E9%87%8F&zhida_source=entity) 处理中断。**

如果当安全中断引发时正常世界正在执行， **监视器 [向量](https://zhida.zhihu.com/search?content_id=233445737&content_type=Article&match_order=4&q=%E5%90%91%E9%87%8F&zhida_source=entity) 必须处理异常并调用OP-TEE OS来为中断服务** 。

**当一个非安全的中断被ARM GIC发出信号时** ，它将到达正常的世界中断异常向量。如果正常的世界正在执行，它将直接处理其异常向量中的异常。

如果安全世界在非安全中断引发时执行， **OP-TEE操作系统将通过监视器暂时回到正常世界，让正常世界为中断服务。**

```
#include <stdint.h>  
#include <stdbool.h>  
  
// 定义寄存器状态结构体  
typedef struct {  
    uint32_t r0;  
    uint32_t r1;  
    uint32_t r2;  
    uint32_t r3;  
    // 其他寄存器...  
} registers_t;  
  
// 定义上下文结构体  
typedef struct {  
    registers_t registers;  
    uint32_t sp;  
    uint32_t lr;  
    // 其他上下文信息...  
} context_t;  
  
// 定义上下文切换函数  
void context_switch(context_t* current_context, context_t* next_context) {  
    // 保存当前处理器的状态到当前上下文中  
    current_context->registers.r0 = read_register(0);  
    current_context->registers.r1 = read_register(1);  
    current_context->registers.r2 = read_register(2);  
    current_context->registers.r3 = read_register(3);  
        // 其他寄存器...  
  
    current_context->sp = read_sp();  
    current_context->lr = read_lr();  
        // 其他上下文信息...  
  
    // 加载新处理器的状态到下一个上下文中  
    next_context->registers.r0 = read_register(0);  
    next_context->registers.r1 = read_register(1);  
    next_context->registers.r2 = read_register(2);  
    next_context->registers.r3 = read_register(3);  
        // 其他寄存器...  
  
    next_context->sp = read_sp();  
    next_context->lr = read_lr();  
        // 其他上下文信息...  
  
    // 执行异常处理程序（例如，保存返回地址）  
    save_return_address();  
  
    // 执行上下文切换指令（例如，eret）  
    jump_to(next_context->lr);  
}
```

中断和核的状态组合有以下四种

## 1、安全中断和安全核心

当安全中断发生时，安全核心可以正常处理该中断，执行相应的中断处理程序，并保证系统的安全性和稳定性。

```
void handle_secure_interrupt(void)  
{  
    // 保存当前处理器的状态  
    save_processor_state();  
  
    // 处理中断  
    handle_interrupt();  
  
    // 恢复处理器状态  
    restore_processor_state();  
}
```

在上述代码中，handle\_secure\_interrupt 是处理安全中断的函数。首先，它保存当前处理器的状态；然后，调用 handle\_interrupt 函数处理中断；最后，恢复处理器状态。

## 2、安全中断和非安全核心

当安全中断发生在非安全核心上时，非安全核心可能会因为无法处理该中断而出现异常或崩溃，因此需要采取措施将核心转移到安全状态，然后处理该中断。

```
void handle_secure_interrupt_on_non_secure_core(void)  
{  
    // 保存当前处理器的状态  
    save_processor_state();  
  
    // 切换到安全核心执行  
    switch_to_secure_core();  
  
    // 处理中断  
    handle_interrupt();  
  
    // 切换回非安全核心  
    switch_to_non_secure_core();  
  
    // 恢复处理器状态  
    restore_processor_state();  
}
```

在上述代码中，handle\_secure\_interrupt\_on\_non\_secure\_core 是处理安全中断在非安全核心上的函数。首先，它保存当前处理器的状态；然后，通过 switch\_to\_secure\_core 函数切换到安全核心执行；接着，调用 handle\_interrupt 函数处理中断；最后，通过 switch\_to\_non\_secure\_core 函数切换回非安全核心，并恢复处理器状态。

## 3、非安全中断和安全核心

当非安全中断发生时，系统可能会采取一些特殊的措施来确保系统的稳定性和安全性。例如，在ARM架构中，如果安全世界正在执行，非安全中断可能需要通过监视器暂时返回正常世界，让正常世界为中断服务。

```
void handle_non_secure_interrupt(void)  
{  
    // 保存当前处理器的状态  
    save_processor_state();  
  
    // 切换到正常世界执行  
    switch_to_normal_world();  
  
    // 处理中断  
    handle_interrupt();  
  
    // 切换回安全世界  
    switch_to_secure_world();  
  
    // 恢复处理器状态  
    restore_processor_state();  
}
```

在上述代码中，handle\_non\_secure\_interrupt 是处理非安全中断的函数。首先，它保存当前处理器的状态；然后，通过 switch\_to\_normal\_world 函数切换到正常世界执行；接着，调用 handle\_interrupt 函数处理中断；最后，通过 switch\_to\_secure\_world 函数切换回安全世界，并恢复处理器状态。

## 4、非安全中断在非安全核心

非安全中断在非安全核心上处理时，需要采取一些额外的措施来确保系统的稳定性和安全性。

```
void handle_non_secure_interrupt_on_non_secure_core(void)  
{  
    // 保存当前处理器的状态  
    save_processor_state();  
  
    // 采取额外的安全措施，如执行特定的安全代码或跳转到安全核心处理  
    take_additional_security_measures();  
  
    // 处理中断  
    handle_interrupt();  
  
    // 恢复处理器状态  
    restore_processor_state();  
}
```

在上述代码中，handle\_non\_secure\_interrupt\_on\_non\_secure\_core 是处理非安全中断在非安全核心上的函数。首先，它保存当前处理器的状态；然后，采取一些额外的安全措施，例如执行特定的安全代码或通过安全核心来处理该中断；接着，调用 handle\_interrupt 函数处理中断；最后，恢复处理器状态。

要是不需要特定的安全代码，这种情况就是最常见的情况，类似于没有TEE。

## 5、异常向量

监控载体是AArch64中的VBAR\_EL3和Armv7-A/AArch32中的MVBAR。

在执行正常世界或安全世界切换时，可以达到监视器。监视器通过SCR\_NS知道正在执行的安全状态。

可以从SMC异常、IRQ或FIQ异常（即所谓的中断）和异步中止中访问监视器。显然，监视中止（数据、预取、执行）对监视器执行是本地的。

**监视器可以位于OP-TEE操作系统外部（案例CFG\_WITH\_ARM\_TRUSTED\_FW= y)）。**

如果没有，则提供本地安全监视器core/arch/arm/sm。Armv7-A平台应该使用OP-TEE OS安全监视器。 **Armv8-A平台很可能依赖于一个可信的固件A。**

在监视器外部执行时，系统正在在正常世界（SCR\_NS=1）或安全世界（SCR\_NS=0）中执行。每个世界都拥有自己的 [异常向量表](https://zhida.zhihu.com/search?content_id=233445737&content_type=Article&match_order=1&q=%E5%BC%82%E5%B8%B8%E5%90%91%E9%87%8F%E8%A1%A8&zhida_source=entity) （状态向量）：

- • VBAR\_EL2 or VBAR\_EL1 non-secure or VBAR\_EL1 secure for AArch64.
- • HVBAR or VBAR non-secure or VBAR secure for Armv7-A and AArch32.

所有SMC异常都会陷入到监视器向量中。IRQ/FIQ异常可以被捕获在监视器向量或执行世界的状态向量中。

**当正常世界执行时，系统配置为路由：**

- 安全中断到监控器，将转发到OP-TEE OS
- 非安全中断到执行的世界异常向量。（就地解决）

当安全世界正在执行时，系统被配置为路由：

- 对正在执行的OP-TEE OS异常向量的安全和非安全中断。OP-TEE操作系统应将非安全中断转发到正常世界。

**Optee\_os的非安全中断总是被困在执行世界的状态向量中** 。这反映在SCR\_（IRQ|FIQ）的静态值上。

## 6、本地和外部中断

**从OP-TEE OS的角度定义了两种类型的中断** 。

- 本地中断-由OP-TEE OS处理的中断，针对S-EL1的安全中断或安全特权模式
- 外部中断-未由OP-TEE OS处理的中断，针对正常世界的非安全中断或针对EL3的安全中断。

对于Arm GICv2模式，本机中断用FIQ信号，外部中断用IRQ信号。

对于Arm GICv3模式，外部中断信号为FIQ，可以由安全世界（32监控模式或64EL3）或正常世界处理。

Arm GICv3模式可以通过 **设置CFG\_ARM\_GICV3=y来启用** 。 **本机中断必须安全地路由到OP-TEE OS。**

外部中断，当在安全世界执行期间被捕获时，可能需要有效地路由到正常世界。

IRQ和FIQ在正常世界中保持了它们的意义，所以为了清晰起见，我们将在正常世界环境中继续使用这些名称。

## 7、正常世界使用SMC调用OP-TEE操作系统

### 进入安全监视器

该监视器将管理安全世界的所有进出口。 **要从正常世界进入安全世界，监视器将保存正常世界的状态（未存储的 [通用寄存器](https://zhida.zhihu.com/search?content_id=233445737&content_type=Article&match_order=1&q=%E9%80%9A%E7%94%A8%E5%AF%84%E5%AD%98%E5%99%A8&zhida_source=entity) 和 [系统寄存器](https://zhida.zhihu.com/search?content_id=233445737&content_type=Article&match_order=1&q=%E7%B3%BB%E7%BB%9F%E5%AF%84%E5%AD%98%E5%99%A8&zhida_source=entity) ），并恢复以前的安全世界状态。**

然后执行从异常返回，并恢复恢复的安全状态。从安全的世界退出到正常的世界则恰恰相反。

**一些通用的寄存器在进入和退出时不会被保存和恢复，这些寄存器用于在安全世界和正常世界之间传递参数** （详情请参见ARM\_DEN0028A\_SMC\_Calling\_Convention）。

### 可信操作系统的进出

在可信操作系统的进入和退出时， **每个CPU使用一个单独的入口堆栈** ，并使用IRQ和FIQ屏蔽运行。smc可分为两种类型：fast and yielding

- For fast SMCs, OP-TEEOS将在IRQ/FIQ被屏蔽的入口堆栈上执行，直到执行返回到正常世界。
- For yielding SMCs，OP-TEE操作系统将在某个时候执行请求的服务。为了处理中断，主要是外部中断的转发，OP-TEE OS为SMC分配一个可信的 [线程](https://zhida.zhihu.com/search?content_id=233445737&content_type=Article&match_order=1&q=%E7%BA%BF%E7%A8%8B&zhida_source=entity) （核心/拱/臂/内核/线程.c）请求。受信任的线程存储所请求的服务的执行上下文。当请求的服务执行和中断时，可以暂停和恢复此上下文。只有当服务执行返回完成状态时，才释放受信任线程。
- 为了yielding smc，OP-TEEOS分配或恢复一个受信任的线程，然后打开IRQ和FIQ线。当OP-TEE操作系统需要从外部中断或远程服务调用中调用正常世界时，OPTEE操作系统会屏蔽IRQ和FIQ，并挂起受信任的线程。当暂停时，OP-TEE OS将返回到入口堆栈。
- 快速和yieldingSMC都在入口堆栈上结束，IRQ和FIQ屏蔽，OP-TEE OS通过SMC调用监视器返回正常世界。

### yielding smc和fast smc有什么区别

yielding SMC和fast SMC的主要区别在于它们处理上下文切换和中断的方式以及对系统资源的使用。

**yielding SMC在执行时会关闭所有的中断，以确保在执行SMC指令期间没有其他中断发生** 。这可以避免潜在的并发问题，但同时也可能导致系统的响应速度变慢，因为所有中断都被屏蔽了。在执行SMC指令完成后，yielding SMC会恢复所有的中断。

fast SMC在执行时不会关闭中断，只屏蔽了部分特定的中断。这可以确保系统的实时性和响应速度，因为一些紧急的中断仍然可以被处理。 **然而，fast SMC可能会增加并发执行的风险，因此需要额外的安全措施来确保系统的稳定性和安全性。**

另外， **yielding SMC在进入SMC会话状态时，会将所有的CPU寄存器上下文保存到相应的OP-TEE上下文中** ，而fast SMC则不会这样做。这种行为\*\*使得fast SMC可以在同一个上下文中直接返回，\*\*而不需要保存和恢复CPU寄存器上下文，从而减少了上下文切换的开销。

ast SMC通过不保存CPU寄存器上下文，使得它可以直接在当前的OP-TEE上下文中返回，而不需要进行额外的上下文切换。

综上所述，yielding SMC和fast SMC在处理上下文切换和中断的方式以及对系统资源的使用方面有所不同。选择哪种类型的SMC取决于具体的应用场景和需求。

```
fast SMC增加并发执行的风险主要是因为它不会屏蔽所有的中断，而是一些特定的中断。这可能导致在执行SMC指令期间，一些不受信任的中断可能会干扰或破坏系统的状态，从而影响系统的稳定性和安全性。

为了确保系统的稳定性和安全性，需要采取一些额外的安全措施。例如，在执行SMC指令之前，操作系统可以检查当前的状态和上下文，确保执行SMC操作的线程是受信任的。此外，操作系统可以实施访问控制机制，确保只有授权的线程可以执行SMC指令。

另外，操作系统还可以采取一些其他的安全措施，例如对系统资源进行备份和恢复，避免在执行SMC指令期间发生资源冲突或资源丢失的情况。这些措施可以进一步降低fast SMC带来的并发执行风险，并确保系统的稳定性和安全性。
```

## 8、向正常的世界提供不安全的中断

**将外部中断从安全世界转发到正常世界** ，当外部中断在安全世界中作为IRQ或FIQ异常接收时，则安全世界：

- 1。保存受信任的线程上下文（对于Armv7-A的所有处理器模式的整个状态）
- 2。屏蔽所有中断（IRQ和FIQ）
- 3。切换到入口堆栈
- 4。发出带值的SMC，表示正常世界已检测到IRQ，并且应继续最后一次SMC调用

监视器使用返回指示即将交付IRQ的代码恢复正常世界上下文。

正常的世界发行了一个新的SMC，表明它应该继续持续到最后的SMC。

监视器恢复安全世界上下文，它定位以前保存的上下文，并检查它是从恢复上下文之前请求的外部中断的返回，并允许安全世界外部中断处理程序从将恢复执行的异常返回。

请注意，监视器本身并不知道或不关心它刚刚转发了一个外部中断到正常世界。这个记录是在OP-TEE操作系统中的可信线程处理中完成的。

正常世界负责决定安全世界线程何时恢复执行（有关详细信息，请参见线程处理）。

当设置 `SCR_NS` 时，将外部中断发送到正常世界由于SCR\_IRQ被清除，将在正常世界中使用异常向量（VBAR）传递IRQ。IRQ作为任何其他异常接收，监视器和OP-TEE操作系统根本不涉及。

## 9、向安全的世界提供安全的中断

在两种不同状态下可以接收安全（外部）中断，无论是在正常状态（设置SCR\_NS），还是在安全状态（清除SCR\_NS）。当安全监视器处于活动状态（Armv8-A EL3或Armv7-A监视器模式）时，FIQ和IRQ将被屏蔽。下面描述了在这两种不同状态下的FIQ接收情况。

### 当设置了SCR\_NS时，向安全的世界提供安全的中断

当监视器捕获一个安全中断时，它为：

- 1。保存正常世界上下文，并从上次安全世界退出的地方恢复安全世界上下文（阻止安全世界上下文）
![](https://pica.zhimg.com/v2-1bea64c69a5299ec0c035fcaa65d252c_1440w.jpg)

Fig. 1: SMC entry to secure world

![](https://pic2.zhimg.com/v2-3392f2e575b6b5d79d7e0c2f8d62875f_1440w.jpg)

Fig. 2: Foreign interrupt received in secure world and forwarded to normal world

- 2.在清除SCR\_NS
- 3 通过安全中断入口点从异常返回到OP-TEE操作系统
- 4 OP-TEE操作系统直接在入口点中处理本机中断
- 5 OP-TEE操作系统发出SMC以恢复正常世界
- 6 监视器保存安全世界上下文并恢复正常世界上下文
- 7 从异常状态返回到已恢复的上下文中
![](https://pic1.zhimg.com/v2-f2635fb25519be77c8455c0b7afd58fa_1440w.jpg)

Fig. 3: Secure interrupt received when SCR\_NS is set

### 当SCR\_NS被清除时，将FIQ交付到安全的世界

![](https://pic2.zhimg.com/v2-682c67047dcd5921733e9e4e348cee15_1440w.jpg)

在这里插入图片描述

![](https://pica.zhimg.com/v2-59b1f10adc44513536c91851ac0a5880_1440w.jpg)

Fig. 4: FIQ received while processing an IRQ forwarded from secure world

## 10、可信线程调度

在OP-TEE中，可信线程的调度是由Trusted OS来负责的。Trusted OS通过Trusted Thread机制来实现可信线程的调度。

具体来说，当正常世界中的线程需要进入TEE执行时，Trusted OS会为该线程创建一个可信线程，并为该线程分配一个唯一的线程ID。然后，该线程可以通过使用该线程ID来进行通信和执行相应的操作。

在可信线程的调度过程中，Trusted OS会根据线程的优先级和状态来决定哪个线程应该被执行。具体的调度算法可能因实现而异，但通常会使用类似于操作系统的调度算法，例如轮转调度（Round-Robin）或优先级调度（Priority Scheduling）等。

需要注意的是，由于涉及安全性和隐私保护，OP-TEE中的代码是非常敏感的，并且是高度优化的。因此，具体的代码实现可能会因不同的实现而有所不同。如果需要了解具体的代码实现，建议参考相关的 [开源项目](https://zhida.zhihu.com/search?content_id=233445737&content_type=Article&match_order=1&q=%E5%BC%80%E6%BA%90%E9%A1%B9%E7%9B%AE&zhida_source=entity) 或官方文档。

### 标准服务OP-TEE

OP-TEE yielding services通过标准SMC进行。

这些服务的执行可能会因外部中断而中断。为了挂起和恢复服务执行，optee\_os在生成SMC条目时分配了一个受信任的线程。 **当optee\_os以服务完成状态返回到正常世界时，可信线程终止** 。

一个受信任的线程执行可以被一个本机中断中断。在这种情况下，本机中断由中断异常处理程序处理，一旦服务，optee\_os返回到执行可信线程。

一个受信任的线程执行可能会被一个外部中断中断。在这种情况下，optee\_os会挂起受信任的线程，并通过监视器（optee\_os，即所谓的RPC服务）来调用正常的世界。

只有当正常世界调用具有RPC服务状态的optee\_os时，可信线程才会恢复。一个可信的线程执行可以导致optee\_os在正常世界下调用一个服务：访问一个文件，获取REE当前时间，等等。在远程服务执行期间，受信任的线程首先挂起，然后恢复。

```
OP-TEE（Open Portable Trusted Execution Environment）是一种可移植的可靠执行环境，用于提供安全可信的远程计算服务。其中，yielding service是OP-TEE中的一项服务，用于在安全世界和正常世界之间进行切换。

具体来说，yielding service提供了一种机制，使得正常世界中的操作系统或应用程序可以在需要时调用OP-TEE中的可信执行环境（TEE），并在TEE中执行相应的安全操作。当安全操作完成后，yielding service会将控制权返回给正常世界的操作系统或应用程序，以便继续执行后续的操作。

通过使用yielding service，正常世界中的操作系统或应用程序可以在保证安全性的前提下，利用TEE中的安全功能，例如加密算法、身份验证、数据加密等，实现更加安全可靠的计算和通信。
```

---

Trusted thread for standard services和OP-TEE yielding services都是OP-TEE中的服务，但它们的功能和作用不同。

Trusted thread for standard services是用于建立安全的通信通道，使得正常世界中的线程可以安全地访问TEE侧的标准服务。它提供了一种机制，使得正常世界中的操作系统或应用程序可以在需要时调用OP-TEE中的可信执行环境（TEE），并在TEE中执行相应的安全操作。这样，正常世界中的操作系统或应用程序可以使用TEE中的安全功能，例如加密算法、身份验证、数据加密等，来执行各种安全相关的操作。

而OP-TEE yielding services是用于在安全世界和正常世界之间进行切换的服务。当正常世界中的操作系统或应用程序需要调用TEE中的安全功能时，它们可以通过yielding service进入安全世界，并在TEE中执行相应的安全操作。当安全操作完成后，yielding service会将控制权返回给正常世界的操作系统或应用程序，以便继续执行后续的操作。

虽然Trusted thread for standard services和OP-TEE yielding services都是OP-TEE中的服务，但它们的功能和作用是不同的。Trusted thread for standard services主要是用于建立安全的通信通道，而OP-TEE yielding services主要是用于在安全世界和正常世界之间进行切换。这两项服务在OP-TEE中协同工作，共同提供了安全可信的远程计算服务。

### 调度注意事项

当一个可信的线程被外部中断中断，当optee\_os调用一个正常的世界服务时，正常的世界就有机会重新安排正在运行的应用程序。

只有在客户端应用程序被计划返回后，受信任的线程才会恢复。因此，一个受信任的线程执行遵循正常世界调用者上下文的调度。

Optee\_os不实现任何线程调度。每个受信任线程都应该跟踪从正常世界调用的服务，并以执行状态返回该服务。

OP-TEE Linux [驱动程序](https://zhida.zhihu.com/search?content_id=233445737&content_type=Article&match_order=1&q=%E9%A9%B1%E5%8A%A8%E7%A8%8B%E5%BA%8F&zhida_source=entity) （自Linux内核4.12以来在驱动程序/tee/optee中实现）被设计为调用OP-TEE的Linux线程在TEE端被分配一个可信的线程。

可信线程的执行与调用者Linux线程的执行有关，该线程是由Linux内核调度决策决定的。这意味着受信任的线程将由Linux内核进行调度。

### 可信线程约束

TEE核心可以处理静态数量的可信线程，请参见CFG\_NUM\_THREADS。

在内存受限的系统上，可信线程非常昂贵，这主要是因为执行堆栈的大小。

在SMP系统上，如果正常世界支持进程调度，那么optee\_os可以并行执行多个受信任的线程。

即使在UP系统上，在optee\_os中支持几个可信线程也有助于正常世界调度程序的效率。

```
UP系统（Uni-Processor，单处理器）是只有一颗处理器的系统，所有的程序都在这颗处理器上运行。相对于SMP系统而言，UP系统并没有多个处理器单元。

SMP系统（Symmetric Multi-Processor，对称多处理器）则拥有多个处理器单元，这些处理器共享内存和其他资源，并且操作系统在所有处理器上都是公平的，没有优先级的差别。SMP系统相对于UP系统而言，具有更强的并行计算能力，因为多个处理器可以同时执行不同的任务。

总之，UP系统和SMP系统的主要区别在于处理器单元的数量和处理任务的方式。
```

## 11、OP-TEE中有哪些常见的可信线程

在OP-TEE中，有以下几种可信线程：

- Trusted Thread for Standard Services：这是用于建立安全的通信通道，使得正常世界中的线程可以安全地访问TEE侧的标准服务。
- Trusted Thread for RPC：这是用于实现远程过程调用（RPC）的线程。当某个线程需要通过RPC进入TEE执行时，它会被分配一个线程ID，并使用该线程ID进行通信。
- Trusted Thread for Fast SM：这是用于实现快速上下文切换的线程。 这些可信线程都是通过Trusted Thread机制实现的，为每个相关命令分配一个线程，并使用线程ID唯一地标识该线程。这样可以确保每个命令的执行都在一个可信的线程中进行，从而提高了系统的安全性。

## 举个栗子

当OP-TEE操作系统启动时，首先需要初始化中断控制器。 **这个过程通常由 [汇编语言](https://zhida.zhihu.com/search?content_id=233445737&content_type=Article&match_order=1&q=%E6%B1%87%E7%BC%96%E8%AF%AD%E8%A8%80&zhida_source=entity) 程序实现，具体的代码可能会因不同的硬件平台而有所不同** 。

以下是一个简化的 [伪代码](https://zhida.zhihu.com/search?content_id=233445737&content_type=Article&match_order=1&q=%E4%BC%AA%E4%BB%A3%E7%A0%81&zhida_source=entity) 示例，展示了如何初始化一个简单的中断控制器：

```
void init_interrupts() {  
    // 设置中断向量表  
    for (int i = 0; i < NUM_INTERRUPTS; i++) {  
        interrupt_vector[i] = NULL;  
    }  
      
    // 设置中断优先级  
    for (int i = 0; i < NUM_INTERRUPTS; i++) {  
        interrupt_priority[i] = DEFAULT_PRIORITY;  
    }  
      
    // 使能中断  
    enable_interrupts();  
}
```

在上述代码中，

- interrupt\_vector 是一个指向中断处理函数的数组，
- interrupt\_priority 是一个整型数组，用于存储每个中断的优先级。DEFAULT\_PRIORITY 是一个预定义的常量，表示默认的中断优先级。
- enable\_interrupts 是一个汇编语言函数，用于使能中断控制器。

接下来， **需要为每个中断类型注册一个中断处理函数** 。以下是一个简化的伪代码示例，展示了如何注册一个简单的中断处理函数：

```
void register_interrupt_handler(int interrupt_number, void (*handler)(void)) {  
    interrupt_vector[interrupt_number] = handler;  
}
```

在上述代码中， **register\_interrupt\_handler 是一个函数，它接受两个参数：中断编号和中断处理函数。**

它将中断处理函数的地址存储在 interrupt\_vector 数组中，以便在中断发生时能够正确地调用该函数。

当发生中断时， **中断控制器会通过核心的安全监视器（Monitor）通知OP-TEE操作系统** 。Monitor是OP-TEE中负责处理安全世界和正常世界之间切换的关键组件。以下是一个简化的伪代码示例，展示了Monitor如何处理中断：

```
void monitor_handle_interrupt(int interrupt_number) {  
    if (interrupt_vector[interrupt_number] != NULL) {  
        safe_context_switch(); // 上下文切换到安全世界  
        exception_handler(interrupt_number)(); // 调用异常处理程序  
        safe_context_switch(); // 上下文切换回正常世界  
    } else {  
        // 中断未注册或处理失败，调用默认的处理程序  
        default_interrupt_handler();  
    }  
}
```

在上述代码中，monitor\_handle\_interrupt 是一个函数，它接受一个参数：中断编号。

- 首先，它检查该中断是否已经注册了处理函数。
- 如果有，它会执行一个上下文切换，将控制权转移到安全世界的OP-TEE操作系统，并调用相应的异常处理程序。
- 异常处理程序会根据中断类型进行相应的处理，例如读取网络数据包、更新定时器计数器等。
- 在处理完中断后，异常处理程序会返回一个结果，该结果会被Monitor捕获并保存。
- 然后，Monitor会执行一个上下文切换，将控制权返回到正常世界的代码。
- 如果中断未注册或处理失败，Monitor会调用默认的处理程序进行进一步的处理。

请注意，上述代码只是一个简化的示例，实际的OP-TEE中断处理机制可能会更加复杂。此外，具体的实现细节可能因硬件平台和 [编译器](https://zhida.zhihu.com/search?content_id=233445737&content_type=Article&match_order=1&q=%E7%BC%96%E8%AF%91%E5%99%A8&zhida_source=entity) 的不同而有所不同。

> 本文使用 [Zhihu On VSCode](https://zhuanlan.zhihu.com/p/106057556) 创作并发布

发布于 2023-09-02 17:19・四川[作为30+项目管理人，我是如何从6大热门PMP培训机构中选择的？](https://zhuanlan.zhihu.com/p/696611999)

[

24年推荐较多的6家PMP机构，乐凯、清晖、光环、艾威、希赛、51精培，到底选哪家好？ 我在项目管理岗干了4年，当初考这个...

](https://zhuanlan.zhihu.com/p/696611999)