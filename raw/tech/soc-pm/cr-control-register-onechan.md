# 控制寄存器 CR 的本质：软件定义硬件行为的"开关矩阵"

> 来源：微信公众号「OneChan」
> 原文链接：https://mp.weixin.qq.com/s/1pqqbEkEUXwdjceyP_RG0A
> 记录时间：2026-05-04

---

## 核心观点

CR 的本质是**软件与硬件之间预先约定的"指令集接口"**。硬件设计时，把所有可配置的行为、可触发的动作、可选择的工作模式，全部编码成 CR 中的位域。软件只需按照手册编码写入，硬件就会"无条件"执行对应的指令。

## CR 的典型位域设计与语义分类

### 1. 配置型位域：一次性设置，长期生效
- 可读可写（RW），硬件永远不会改变其值
- 通常在初始化阶段一次性配置
- 例如：波特率选择、数据位/停止位配置、时钟分频系数、DMA 通道使能、中断使能位

### 2. 触发型位域：写 1 执行，自动清零
- 写 1 有效，写 0 无效
- 硬件执行完动作后自动清零
- 读取永远返回 0
- 手册通常标记为 "W1C" 或 "WO"
- **绝对不能使用读-改-写（RMW）操作！**
- 例如：软件复位位（SWRST）、发送启动位（TXSTART）、FIFO 清空位（FLUSH）

### 3. 锁存型位域：写入后锁定，直到复位
- 只写一次（Write Once）
- 写入后变为只读
- 只有系统复位才能解锁
- 例如：调试端口禁用位、Flash 写保护位、硬件看门狗锁定位

## CR 的原子性噩梦：读-改-写（RMW）

```c
// 错误的写法！编译成三条指令，非原子
UART->CR |= UART_CR_TXEN_Msk;
// LDR R0, [UART->CR]      // 1. 读取当前值
// ORR R0, #UART_CR_TXEN_Msk // 2. 置位
// STR R0, [UART->CR]      // 3. 写回
```

第 1 步和第 3 步之间，中断/DMA/硬件可能修改了 CR 的其他位，写回的是**过时的、错误的值**。

### 正确方案

#### 纯配置型 CR
```c
uint32_t primask = __get_PRIMASK();
__disable_irq();
UART->CR |= UART_CR_TXEN_Msk;
__set_PRIMASK(primask);
```

#### 含触发型位域的 CR
```c
// 直接写寄存器，只置位需要触发的位，其他位写 0
UART->CR = UART_CR_TXSTART_Msk;
```

#### 终极方案：影子寄存器
```c
static uint32_t uart_cr_shadow = 0;
uart_cr_shadow |= UART_CR_TXEN_Msk;
uart_cr_shadow &= ~UART_CR_PARITY_EN_Msk;
UART->CR = uart_cr_shadow;  // 一次性写入
UART->CR = UART_CR_TXSTART_Msk;  // 触发动作
```

## 硬件如何执行 CR 指令：状态机视角

硬件是**同步状态机**，只在时钟上升沿采样 CR，并根据当前状态决定是否执行指令。

- CR 指令执行有**延迟**，最少一个时钟周期
- 硬件只会在**特定状态**下响应特定指令
- 错误状态下写入指令，硬件会**静默忽略**
- 指令执行完成的标志是**SR 中的对应位**，不是 CR 中的位

## 常见 CR 设计陷阱

| 陷阱 | 说明 | 避坑 |
|------|------|------|
| 同一位域既是配置型又是触发型 | 不同状态下含义不同 | 不要在运行中修改，先复位到空闲状态 |
| 触发型位域需要写 0 才能生效 | 反人类设计 | 注意 "W0C" 标记，用直接写寄存器 |
| CR 写入后需要特定延时生效 | 手册不说明延时时间 | 先尝试 1us 延时，或等待对应 SR 标志位 |
| 多个 CR 位域有写入顺序要求 | 顺序错误配置失效 | 严格按照手册"配置步骤"操作 |

## 实战案例：STM32 UART CR1 寄存器

CR1 中绝大多数位域是配置型（RW），只有 **SBK（发送断开字符）** 是触发型（W1C）。

```c
void uart_init(uint32_t baudrate) {
    // 使用影子寄存器一次性写入所有配置
    uint32_t cr1 = 0;
    cr1 |= USART_CR1_TE;      // 使能发送
    cr1 |= USART_CR1_RE;      // 使能接收
    cr1 |= USART_CR1_RXNEIE;  // 使能接收中断
    USART2->CR1 = cr1;
    
    USART2->CR1 |= USART_CR1_UE;  // 使能 UART
    while(!(USART2->ISR & USART_ISR_TEACK));
    while(!(USART2->ISR & USART_ISR_REACK));
}

void uart_send_break(void) {
    // SBK 是触发型，直接写寄存器，不能用 RMW
    USART2->CR1 = USART_CR1_SBK;
}
```

## 总结

1. CR 是软件与硬件之间预先约定的指令集接口
2. 不同类型位域有完全不同的操作规则
3. 读-改-写操作不是原子的，会导致严重偶发 bug
4. 触发型位域绝对禁止 RMW 操作
5. 硬件是同步状态机，CR 指令执行有延迟
6. 永远通过 SR 寄存器判断指令是否执行完成

## Related Pages

- [[src-onechan-dr-data-register]] — 数据寄存器 DR 详解
- [[src-onechan-sr-status-register]] — 状态寄存器 SR 详解
- [[src-onechan-bootrom-first-gate-of-chip-firmware]] — BootROM 详解
- [[src-onechan-flash-ram-otp-boot]] — Flash/RAM/OTP 启动方式对比
