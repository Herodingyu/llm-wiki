---
title: "国产 SPI NOR Flash 模块深度解析与驱动设计"
source: "https://mp.weixin.qq.com/s/RAAItPUbDJYPShSvdhdOLA"
author:
  - "[[OneChan]]"
published:
created: 2026-05-04
description: "本文以一款国产 64Mbit SPI NOR Flash 为例，从底层原理到代码实现，完整剖析其工作方式。"
tags:
  - "clippings"
---
OneChan *2026年3月23日 19:30*

本文以一款国产 64Mbit SPI NOR Flash 为例，从底层原理到代码实现，完整剖析其工作方式。每一段原理讲解后均附有对应的代码实现，代码中的命令码均使用宏定义，便于理解与维护。本文旨在让读者不仅“会用”，更能“懂其所以然”，遇到问题时能快速定位根源。

---

## 一、设计目标与选型依据

在嵌入式系统中，存储方案的选择直接影响系统的成本、性能与可靠性。SPI NOR Flash 因其接口简单、支持片内执行（XiP）、擦写次数高、数据保持时间长等优势，广泛应用于以下场景：

| 应用场景 | 核心需求 |
| --- | --- |
| 代码存储 | 支持 XiP，要求读取速度快，引脚占用少 |
| 参数存储 | 小容量频繁读写，要求擦写寿命高 |
| 固件升级 | 支持扇区擦除，便于 OTA 分区管理 |
| 安全存储 | 提供唯一 ID 和 OTP 区域，防止克隆 |

本文所选芯片的核心参数如下：

- 容量：64Mbit（8MB），地址范围 0x000000 ~ 0x7FFFFF
- 页大小：256 字节（编程最小单位）
- 扇区大小：4KB（擦除最小单位）
- 块大小：32KB / 64KB（可选）
- 接口：标准 SPI / Dual SPI / Quad SPI / DTR Quad SPI
- 最高频率：133MHz（Quad 模式）
- 工作电压：2.7V ~ 3.6V
- 擦写寿命：10 万次以上
- 数据保持：20 年

---

## 二、工作原理深度解析

理解 Flash 的工作方式是写出正确驱动的前提。本节将从存储单元、接口协议、状态机、地址映射、擦写原理、高速模式、安全机制等维度深入剖析。

### 2.1 存储单元与阵列结构

#### 2.1.1 浮栅晶体管原理

NOR Flash 的每个存储单元是一个浮栅晶体管，结构如下：

```js
控制栅   │   ▼┌───────────┐│ 浮栅（绝缘） │  ← 存储电荷├───────────┤│ 源极 │ 漏极 │└───────────┘
```

- 编程（写 0）：在控制栅加高压，电子隧穿进入浮栅，使晶体管阈值电压升高。
- 擦除（写 1）：在源极加高压，电子从浮栅拉出，阈值电压降低。
- 读取：加参考电压，根据是否有电流判断是 0 还是 1。

关键特性：

- 不能原位覆盖：NOR Flash 只能将 1 写成 0，不能将 0 写成 1。因此，要修改数据必须先擦除（将整个块/扇区恢复为全 1），再编程写入新数据。
- 擦除粒度大：擦除以扇区（4KB）或块为单位，而编程以页（256 字节）为单位。

#### 2.1.2 芯片内部组织架构

本芯片采用三级寻址结构：

| 层级 | 大小 | 数量 | 地址范围（高到低） | 用途 |
| --- | --- | --- | --- | --- |
| 页 | 256B | 32768 | A7~A0（页内偏移） | 编程最小单位 |
| 扇区 | 4KB | 2048 | A19~A8（16 页/扇区） | 擦除最小单位 |
| 块 | 64KB | 128 | A23~A16（16 扇区/块） | 批量擦除优化 |

地址映射示例：

- 地址 `0x000123` ：页内偏移 `0x23` ，属于第 `0x12` 页（共 256 字节），位于扇区 `0` ，块 `0` 。
- 编程时必须确保同一页内写入不超过 256 字节，否则会发生页内回绕（自动从页起始地址覆盖）。

### 2.2 SPI 通信协议深度解析

#### 2.2.1 工作模式（Mode 0 vs Mode 3）

SPI 有四种工作模式，由时钟极性（CPOL）和时钟相位（CPHA）决定。本芯片同时支持 Mode 0 和 Mode 3：

| 模式 | CPOL | CPHA | 特性 |
| --- | --- | --- | --- |
| Mode 0 | 0 | 0 | 空闲时 SCLK 为低，上升沿采样，下降沿输出 |
| Mode 3 | 1 | 1 | 空闲时 SCLK 为高，上升沿采样，下降沿输出 |

为什么两种都支持？ 因为不同 MCU 的 SPI 控制器默认模式可能不同，双模式兼容性降低了硬件设计约束。

#### 2.2.2 命令传输的字节对齐要求

SPI NOR Flash 的每一次完整操作（从 CS# 拉低到拉高）必须以 8 的整数倍时钟周期结束。这是由内部状态机决定的：内部逻辑在每 8 个时钟后解析一个字节。如果 CS# 在非字节边界拉高，该命令会被丢弃。

#### 2.2.3 命令序列结构

所有命令遵循以下模板：

```
[命令码] + [地址（可选）] + [Dummy周期（可选）] + [数据（可选）]
```
- 命令码：1 字节，决定操作类型。
- 地址：通常 3 字节（24 位），最高位 A23 用于片内寻址。
- Dummy 周期：等待内部电路稳定，不传输有效数据，仅提供时钟。
- 数据：读取时输出数据，写入时输入数据。

### 2.3 状态机与写保护机制

#### 2.3.1 核心状态寄存器

芯片内部有两个关键状态位，驱动必须时刻关注：

| 位 | 名称 | 位置 | 说明 |
| --- | --- | --- | --- |
| WIP | Write In Progress | SR1\[0\] | 1 = 内部编程/擦除/写状态寄存器进行中，此时不接受新命令 |
| WEL | Write Enable Latch | SR1\[1\] | 1 = 已使能写操作，0 = 禁止任何修改操作 |

设计原理：

- WIP 是硬件自管理的，驱动程序只能读取。
- WEL 是软件可控的硬件锁：通过 WREN（06h）命令置 1，执行编程/擦除后自动清零，防止意外写入。

为什么需要 WEL？ 防止因 SPI 总线干扰（如 CS# 尖峰）导致误触发编程/擦除。WEL 必须在执行写操作前显式设置，增加了操作的安全性。

#### 2.3.2 块保护（Block Protect）

BP\[4:0\] 和 CMP 位组合定义受保护区域：

| BP\[4:0\] | CMP | 保护范围 |
| --- | --- | --- |
| 00000 | 0 | 无保护 |
| 00110 | 0 | 上部 1/2（4MB） |
| 00110 | 1 | 下部 1/2（4MB） |
| ... | ... | ... |

原理：保护通过硬件比较器实现，被保护的区域在收到编程/擦除命令时会自动拒绝执行，并清零 WEL。

### 2.4 擦除与编程的物理过程

#### 2.4.1 擦除原理

擦除是将浮栅中的电子移出，使单元恢复为逻辑 1。由于 NOR 结构的特点，擦除必须以扇区或块为单位进行：

- 扇区擦除（20h）：对 4KB 区域施加高压，耗时约 40ms。
- 块擦除（52h/D8h）：对 32KB 或 64KB 区域擦除，耗时更长（0.15~0.25s）。
- 全片擦除（60h/C7h）：整个芯片擦除，耗时约 15s。

为什么不能按字节擦除？ 因为擦除高压电路是全局作用于一整条字线（Word Line），无法精细到单个字节。

#### 2.4.2 编程原理

编程是将电子注入浮栅，将 1 变成 0。页编程（02h/32h）一次最多写入 256 字节，耗时约 0.3ms。

关键约束：

- 写入前该页必须是已擦除状态（全 1），否则写入结果不可预测。
- 写入不能跨页：若地址 A7~A0 非零，且写入长度超出页边界，超出的部分会从页起始地址覆盖（页内回绕）。

#### 2.4.3 Dummy 周期的作用

在高速读取命令中（如 Fast Read 0Bh），命令后需要插入 dummy 周期。其作用是：

1. 给内部读出放大器足够时间稳定输出数据。
2. 为地址解码和数据输出之间提供管道延迟。

频率与 dummy 周期的关系：

- 频率越高，需要的 dummy 周期越多。
- 用户可通过 DC 位（Status Register 3 的 Bit16）选择预设的 dummy 周期配置。

### 2.5 高速模式（Quad SPI / DTR）

#### 2.5.1 Quad SPI 的物理实现

标准 SPI 使用 MOSI 和 MISO 两根单向数据线。Quad SPI 将 WP# 和 HOLD#/RESET# 引脚复用为 IO2 和 IO3，形成四根双向数据线：

| 引脚 | 标准 SPI | Quad SPI |
| --- | --- | --- |
| SI | 数据输入 | IO0（双向） |
| SO | 数据输出 | IO1（双向） |
| WP# | 写保护 | IO2（双向） |
| HOLD# | 暂停 | IO3（双向） |

#### 2.5.2 Quad 模式启用流程

1. 设置 QE 位（状态寄存器 2 的 Bit9）：写入 1 使能 Quad 功能。
2. 硬件连接：将 IO2/IO3 连接到 MCU 对应引脚。
3. 使用 Quad 命令：如 Quad I/O Fast Read（EBh）代替 Fast Read（0Bh）。

为什么 QE 位是必需的？ 因为引脚复用需要内部切换数据方向控制逻辑，QE 位控制这一开关。

#### 2.5.3 DTR（双倍传输率）原理

DTR 模式下，数据在时钟的上升沿和下降沿同时传输，有效速率翻倍。例如 104MHz 时钟下，DTR Quad I/O 的理论带宽为：

```
104MHz × 4 条线 × 2（双沿）= 832Mbit/s
```

### 2.6 安全机制原理

#### 2.6.1 唯一 ID（Unique ID）

每个芯片出厂时烧录了一个 128 位唯一编号，位于只读区域，不可修改。其生成算法基于芯片的物理特性（如晶圆位置、工艺偏差），保证全球唯一性。

#### 2.6.2 安全寄存器与 OTP 锁定

芯片提供三个独立的 1024 字节安全寄存器，可通过 LB1~LB3 位独立锁定。锁定后该区域变为一次性编程（OTP），永久只读。这用于存放不可篡改的密钥、设备证书等。

#### 2.6.3 SFDP（串行 Flash 可发现参数）

SFDP 是 JEDEC 标准（JESD216C），定义了一个参数表，存储 Flash 的容量、时序、指令集等信息。主机可读取该表自适应驱动，无需硬编码参数。

---

## 三、完整操作流程与驱动实现

本节遵循“先流程、再分块原理、最后代码”的原则，从最上层操作到底层细节逐步展开。

### 3.1 驱动分层架构设计

为兼顾可读性、可移植性和可维护性，我们将驱动分为三层：

```js
┌─────────────────────────────────────┐│         应用层（用户调用）           ││  flash_init(), flash_write(), ...   │├─────────────────────────────────────┤│         Flash 驱动核心层             ││  实现各命令序列、状态机、等待逻辑    │├─────────────────────────────────────┤│         硬件抽象层（HAL）            ││   SPI 传输、GPIO 控制、延时函数      │└─────────────────────────────────────┘
```

分层原因：

- 硬件抽象层：隔离 MCU 差异，更换平台只需重写该层。
- 驱动核心层：实现 Flash 协议，与硬件无关，可跨平台复用。
- 应用层：面向具体业务，如分区管理、日志存储。

### 3.2 硬件抽象层接口定义

```cpp
// flash_hal.h#ifndef __FLASH_HAL_H#define __FLASH_HAL_H#include <stdint.h>/* 用户需实现以下函数（具体实现放在 flash_hal_mcu.c 中） *//** * @brief 初始化 SPI 接口 * @note  配置 SPI 模式 0，时钟频率建议从 10MHz 开始，稳定后再提升 */void flash_hal_spi_init(void);/** * @brief 片选拉低（选中 Flash） */void flash_hal_cs_low(void);/** * @brief 片选拉高（释放 Flash） * @note  两次通信之间必须拉高 CS#，否则内部状态机可能错乱 */void flash_hal_cs_high(void);/** * @brief SPI 收发一个字节（全双工） * @param tx 要发送的数据 * @return  接收到的数据 */uint8_t flash_hal_spi_transfer(uint8_t tx);/** * @brief 获取系统毫秒计数（用于超时判断） * @return 当前毫秒值 */uint32_t flash_hal_get_tick(void);/** * @brief 毫秒延时（可选，用于简单等待） * @param ms 毫秒数 */void flash_hal_delay_ms(uint32_t ms);#endif
```

### 3.3 命令码与常量定义（集中管理）

所有命令码使用宏定义，便于理解与维护：

```cpp
// flash_def.h#ifndef __FLASH_DEF_H#define __FLASH_DEF_H/* ==================== 命令码定义 ==================== */#define FLASH_CMD_WREN              0x06    /* Write Enable */#define FLASH_CMD_WRDI              0x04    /* Write Disable */#define FLASH_CMD_RDSR1             0x05    /* Read Status Register 1 */#define FLASH_CMD_RDSR2             0x35    /* Read Status Register 2 */#define FLASH_CMD_RDSR3             0x15    /* Read Status Register 3 */#define FLASH_CMD_WRSR1             0x01    /* Write Status Register 1 */#define FLASH_CMD_WRSR2             0x31    /* Write Status Register 2 */#define FLASH_CMD_WRSR3             0x11    /* Write Status Register 3 */#define FLASH_CMD_READ              0x03    /* Read Data */#define FLASH_CMD_FAST_READ         0x0B    /* Fast Read */#define FLASH_CMD_PAGE_PROGRAM      0x02    /* Page Program */#define FLASH_CMD_QUAD_PAGE_PROGRAM 0x32    /* Quad Page Program */#define FLASH_CMD_SECTOR_ERASE      0x20    /* Sector Erase (4KB) */#define FLASH_CMD_BLOCK_ERASE_32K   0x52    /* Block Erase (32KB) */#define FLASH_CMD_BLOCK_ERASE_64K   0xD8    /* Block Erase (64KB) */#define FLASH_CMD_CHIP_ERASE        0xC7    /* Chip Erase (also 0x60) */#define FLASH_CMD_RDID              0x9F    /* Read JEDEC ID */#define FLASH_CMD_RUID              0x4B    /* Read Unique ID */#define FLASH_CMD_DP                0xB9    /* Deep Power Down */#define FLASH_CMD_RDI               0xAB    /* Release from Deep Power Down */#define FLASH_CMD_SFDP              0x5A    /* Read SFDP */#define FLASH_CMD_RESET_ENABLE      0x66    /* Enable Reset */#define FLASH_CMD_RESET             0x99    /* Reset Device */#define FLASH_CMD_PES               0x75    /* Program/Erase Suspend */#define FLASH_CMD_PER               0x7A    /* Program/Erase Resume *//* ==================== 状态寄存器位掩码 ==================== */#define FLASH_SR1_WIP_MASK          0x01    /* Write In Progress */#define FLASH_SR1_WEL_MASK          0x02    /* Write Enable Latch */#define FLASH_SR1_BP0_MASK          0x04    /* Block Protect bit0 */#define FLASH_SR1_BP1_MASK          0x08    /* Block Protect bit1 */#define FLASH_SR1_BP2_MASK          0x10    /* Block Protect bit2 */#define FLASH_SR1_BP3_MASK          0x20    /* Block Protect bit3 */#define FLASH_SR1_BP4_MASK          0x40    /* Block Protect bit4 */#define FLASH_SR1_SRP0_MASK         0x80    /* Status Register Protect bit0 */#define FLASH_SR2_SRP1_MASK         0x01    /* Status Register Protect bit1 */#define FLASH_SR2_QE_MASK           0x02    /* Quad Enable */#define FLASH_SR2_LB1_MASK          0x04    /* Security Register Lock bit1 */#define FLASH_SR2_LB2_MASK          0x08    /* Security Register Lock bit2 */#define FLASH_SR2_LB3_MASK          0x10    /* Security Register Lock bit3 */#define FLASH_SR2_CMP_MASK          0x20    /* Complement Protect */#define FLASH_SR2_SUS1_MASK         0x40    /* Erase Suspend bit */#define FLASH_SR2_SUS2_MASK         0x80    /* Program Suspend bit *//* ==================== 超时时间定义（单位：毫秒） ==================== */#define FLASH_TIMEOUT_PAGE_PROGRAM   10      /* 页编程最大时间 */#define FLASH_TIMEOUT_SECTOR_ERASE   1000    /* 扇区擦除最大时间 */#define FLASH_TIMEOUT_BLOCK_ERASE    300     /* 块擦除最大时间（实际可能更长，此处保守） */#define FLASH_TIMEOUT_CHIP_ERASE     30000   /* 全片擦除最大时间 */#define FLASH_TIMEOUT_WRSR           20      /* 写状态寄存器最大时间 */#endif
```

### 3.4 底层通信与状态检查

#### 3.4.1 发送单字节命令（无地址无数据）

```javascript
/** * @brief 发送单字节命令（如 WREN、WRDI） * @param cmd 命令码 * * 原理：CS# 拉低后，通过 SPI 发送命令码，立即拉高 CS#。 * 注意：部分命令（如 WREN）只需命令码，不需要地址或数据。 */static void flash_send_cmd(uint8_t cmd) {    flash_hal_cs_low();    flash_hal_spi_transfer(cmd);    flash_hal_cs_high();}
```

#### 3.4.2 读取状态寄存器

```javascript
/** * @brief 读取状态寄存器 1（包含 WIP、WEL、BP 位） * @return 状态寄存器值 * * 原理： * 1. 发送 RDSR1（05h）命令。 * 2. 随后连续读取一个字节，即为状态寄存器内容。 * 3. 状态寄存器可在任何时候读取，不受内部操作影响。 */uint8_t flash_read_status_reg1(void) {    uint8_t status;    flash_hal_cs_low();    flash_hal_spi_transfer(FLASH_CMD_RDSR1);    status = flash_hal_spi_transfer(0xFF);    flash_hal_cs_high();    return status;}/** * @brief 读取状态寄存器 2（包含 QE、CMP、LB 位） * @return 状态寄存器 2 的值 */uint8_t flash_read_status_reg2(void) {    uint8_t status;    flash_hal_cs_low();    flash_hal_spi_transfer(FLASH_CMD_RDSR2);    status = flash_hal_spi_transfer(0xFF);    flash_hal_cs_high();    return status;}
```

#### 3.4.3 写使能（WREN）与等待就绪

```javascript
/** * @brief 使能写操作（设置 WEL 位） * * 原理： * 1. 发送 WREN 命令（06h），内部将 WEL 置 1。 * 2. 任何编程/擦除/写状态寄存器前必须调用此函数。 * 3. WEL 在执行写操作后自动清零，无需手动清除。 */void flash_write_enable(void) {    flash_send_cmd(FLASH_CMD_WREN);}/** * @brief 等待内部操作完成（WIP 位清零） * @param timeout_ms 超时时间（毫秒），0 表示无限等待 * @return 0-成功，-1-超时 * * 原理： * 1. 轮询读取状态寄存器 1，检查 WIP 位。 * 2. WIP=1 表示内部正在执行编程/擦除/写状态寄存器，此时不能发送新命令。 * 3. 超时处理防止死循环。 */int flash_wait_ready(uint32_t timeout_ms) {    uint32_t start = flash_hal_get_tick();    while (1) {        if ((flash_read_status_reg1() & FLASH_SR1_WIP_MASK) == 0) {            return 0;   /* 就绪 */        }        if (timeout_ms && (flash_hal_get_tick() - start >= timeout_ms)) {            return -1;  /* 超时 */        }        /* 避免过度占用总线，短延时 */        flash_hal_delay_ms(1);    }}
```

### 3.5 读取操作

#### 3.5.1 标准读（READ，03h）

```javascript
/** * @brief 从指定地址读取数据（标准 SPI） * @param addr 起始地址（24 位） * @param buf  数据缓冲区 * @param len  读取长度（字节） * * 原理： * 1. 发送 READ 命令（03h）。 * 2. 发送 3 字节地址（高字节在前）。 * 3. 连续读取 len 个字节，每发送一个 dummy 字节（0xFF）接收一个数据。 * 4. 地址自动递增，可跨页跨扇区连续读取。 * 5. 此命令速度较慢（最高 80MHz），但兼容性好。 */void flash_read_data(uint32_t addr, uint8_t *buf, uint32_t len) {    flash_hal_cs_low();    flash_hal_spi_transfer(FLASH_CMD_READ);    flash_hal_spi_transfer((addr >> 16) & 0xFF);    flash_hal_spi_transfer((addr >> 8) & 0xFF);    flash_hal_spi_transfer(addr & 0xFF);    for (uint32_t i = 0; i < len; i++) {        buf[i] = flash_hal_spi_transfer(0xFF);    }    flash_hal_cs_high();}
```

#### 3.5.2 快速读（Fast Read，0Bh）

```javascript
/** * @brief 快速读取数据（标准 SPI，带 dummy 周期） * @param addr 起始地址 * @param buf  缓冲区 * @param len  长度 * * 原理： * 1. 发送 FAST_READ 命令（0Bh）。 * 2. 发送 3 字节地址。 * 3. 发送 1 字节 dummy（8 个 dummy 时钟），等待内部读出放大器稳定。 * 4. 后续数据读取同标准读。 * 5. 最高频率可达 133MHz（需配合 dummy 周期配置）。 */void flash_fast_read(uint32_t addr, uint8_t *buf, uint32_t len) {    flash_hal_cs_low();    flash_hal_spi_transfer(FLASH_CMD_FAST_READ);    flash_hal_spi_transfer((addr >> 16) & 0xFF);    flash_hal_spi_transfer((addr >> 8) & 0xFF);    flash_hal_spi_transfer(addr & 0xFF);    flash_hal_spi_transfer(0xFF);           /* dummy 字节 */    for (uint32_t i = 0; i < len; i++) {        buf[i] = flash_hal_spi_transfer(0xFF);    }    flash_hal_cs_high();}
```

### 3.6 页编程（Page Program）

```kotlin
/** * @brief 页编程（写入最多 256 字节） * @param addr 起始地址（24 位） * @param data 数据缓冲区 * @param len  数据长度（1~256） * @return 0-成功，-1-失败（参数错误、超时或保护） * * 原理（完整流程）： * 1. 发送 WREN 命令使能写操作，并检查 WEL 是否置 1。 * 2. 发送 PAGE_PROGRAM 命令（02h）和 3 字节地址。 * 3. 连续发送数据，长度不超过 256 字节。 * 4. 拉高 CS# 启动内部编程。 * 5. 轮询等待 WIP 清零，确认编程完成。 * * 重要约束： * - 目标页必须预先擦除（全 1），否则写入结果不可预测。 * - 若地址不是页起始（A7~A0 ≠ 0），数据超出页边界时会自动回绕到页起始覆盖。 * - 若 len > 256，只写入最后 256 字节（但驱动应拒绝此情况）。 */int flash_page_program(uint32_t addr, const uint8_t *data, uint16_t len) {    /* 参数校验 */    if (len == 0 || len > 256) return -1;    /* 写使能并确认 WEL 已置位 */    flash_write_enable();    if ((flash_read_status_reg1() & FLASH_SR1_WEL_MASK) == 0) {        return -1;   /* WEL 未置位，可能 WREN 未成功执行 */    }    flash_hal_cs_low();    flash_hal_spi_transfer(FLASH_CMD_PAGE_PROGRAM);0xFF
0xFF
    flash_hal_spi_transfer(addr & 0xFF);    for (uint16_t i = 0; i < len; i++) {        flash_hal_spi_transfer(data[i]);    }    flash_hal_cs_high();    /* 等待编程完成，超时 10ms */    return flash_wait_ready(FLASH_TIMEOUT_PAGE_PROGRAM);}
```

### 3.7 擦除操作

```javascript
/** * @brief 扇区擦除（4KB） * @param addr 扇区内任意地址 * @return 0-成功，-1-失败 * * 原理： * 1. 写使能并确认 WEL。 * 2. 发送 SECTOR_ERASE 命令（20h）和 3 字节地址。 * 3. 拉高 CS# 启动擦除。 * 4. 等待 WIP 清零。 * * 注意：擦除过程中不能对同一扇区进行读写，但可读取其他扇区。 */int flash_sector_erase(uint32_t addr) {    flash_write_enable();    if ((flash_read_status_reg1() & FLASH_SR1_WEL_MASK) == 0) return -1;    flash_hal_cs_low();    flash_hal_spi_transfer(FLASH_CMD_SECTOR_ERASE);    flash_hal_spi_transfer((addr >> 16) & 0xFF);    flash_hal_spi_transfer((addr >> 8) & 0xFF);    flash_hal_spi_transfer(addr & 0xFF);    flash_hal_cs_high();    return flash_wait_ready(FLASH_TIMEOUT_SECTOR_ERASE);}/** * @brief 64KB 块擦除 * @param addr 块内任意地址 * @return 0-成功，-1-失败 * * 原理：同扇区擦除，但命令码不同（D8h），擦除时间更长。 */int flash_block_erase_64k(uint32_t addr) {    flash_write_enable();    if ((flash_read_status_reg1() & FLASH_SR1_WEL_MASK) == 0) return -1;    flash_hal_cs_low();    flash_hal_spi_transfer(FLASH_CMD_BLOCK_ERASE_64K);    flash_hal_spi_transfer((addr >> 16) & 0xFF);    flash_hal_spi_transfer((addr >> 8) & 0xFF);    flash_hal_spi_transfer(addr & 0xFF);    flash_hal_cs_high();    return flash_wait_ready(FLASH_TIMEOUT_BLOCK_ERASE);}/** * @brief 全片擦除 * @return 0-成功，-1-失败 * * 注意：此操作将清空整个 8MB 芯片，耗时约 15 秒。 * 执行前请确保所有数据已备份，且无保护区域（BP 位需为 0）。 */int flash_chip_erase(void) {    flash_write_enable();    if ((flash_read_status_reg1() & FLASH_SR1_WEL_MASK) == 0) return -1;    flash_send_cmd(FLASH_CMD_CHIP_ERASE);    return flash_wait_ready(FLASH_TIMEOUT_CHIP_ERASE);}
```

### 3.8 Quad SPI 模式配置

```javascript
/** * @brief 使能 Quad SPI 模式（设置 QE 位） * @return 0-成功，-1-失败 * * 原理： * 1. 读取状态寄存器 2，检查 QE 位是否已使能。 * 2. 若未使能，写使能后写入新值。 * 3. QE 位是非易失的，设置后永久生效，除非重新写入 0。 */int flash_quad_enable(void) {    uint8_t sr2;    sr2 = flash_read_status_reg2();    if (sr2 & FLASH_SR2_QE_MASK) {        return 0;   /* 已使能 */    }    flash_write_enable();    if ((flash_read_status_reg1() & FLASH_SR1_WEL_MASK) == 0) return -1;    flash_hal_cs_low();    flash_hal_spi_transfer(FLASH_CMD_WRSR2);    flash_hal_spi_transfer(sr2 | FLASH_SR2_QE_MASK);    flash_hal_cs_high();    return flash_wait_ready(FLASH_TIMEOUT_WRSR);}/** * @brief Quad I/O 快速读取（需硬件支持四线模式） * @param addr 起始地址 * @param buf  缓冲区 * @param len  长度 * * 原理： * 1. 发送 QUAD_IO_FAST_READ 命令（EBh）。 * 2. 地址以四线模式发送（IO0~IO3 同时传输）。 * 3. 发送模式字节（M7-M0），用于连续读模式。 * 4. 发送 4 个 dummy 时钟（6 个周期，此处简化）。 * 5. 以四线模式读取数据。 * * 注意：此函数假设硬件已支持四线 SPI 传输，实际实现需调用 MCU 的 Quad SPI 接口。 * 下面代码仅为命令序列示意，不包含具体四线收发实现。 */void flash_quad_io_read(uint32_t addr, uint8_t *buf, uint32_t len) {    /* 注意：以下代码需替换为实际的 Quad SPI 传输函数 */    flash_hal_cs_low();    flash_hal_spi_transfer(FLASH_CMD_QUAD_IO_READ);  /* EBh */    /* 地址需以四线模式发送，此处简化 */    flash_hal_spi_transfer((addr >> 16) & 0xFF);    flash_hal_spi_transfer((addr >> 8) & 0xFF);    flash_hal_spi_transfer(addr & 0xFF);    flash_hal_spi_transfer(0xFF);   /* 模式位 */    flash_hal_spi_transfer(0xFF);   /* dummy 字节 */    /* 四线数据读取 */    for (uint32_t i = 0; i < len; i++) {        buf[i] = flash_hal_spi_transfer(0xFF);  /* 实际应为四线接收 */    }    flash_hal_cs_high();}
```

### 3.9 安全寄存器操作

```javascript
/** * @brief 读取安全寄存器 * @param reg_no  寄存器编号（0~2） * @param offset  偏移地址（0~1023） * @param buf     缓冲区 * @param len     长度 * * 原理： * 1. 安全寄存器地址编码：A23~A16 = 0x00，A15~A12 = reg_no+1（即 1,2,3），A11~A10 = 00b。 * 2. 使用 FAST_READ 命令（48h）读取。 * 3. 若对应 LB 位已锁，可正常读取，但不可写入/擦除。 */void flash_read_security_register(uint8_t reg_no, uint16_t offset, uint8_t *buf, uint32_t len) {    uint32_t base_addr;    if (reg_no > 2) return;    base_addr = (reg_no + 1) << 12;   /* reg1: 0x1000, reg2: 0x2000, reg3: 0x3000 */    base_addr += offset;    flash_fast_read(base_addr, buf, len);   /* 复用快速读函数 */}/** * @brief 擦除安全寄存器 * @param reg_no 寄存器编号（0~2） * @return 0-成功，-1-失败 * * 注意：若对应 LB 位已锁，此操作将被忽略。 */int flash_erase_security_register(uint8_t reg_no) {    uint32_t addr;    if (reg_no > 2) return -1;    addr = (reg_no + 1) << 12;   /* 只需基地址 */    flash_write_enable();    if ((flash_read_status_reg1() & FLASH_SR1_WEL_MASK) == 0) return -1;    flash_hal_cs_low();    flash_hal_spi_transfer(FLASH_CMD_ERASE_SECURITY);  /* 44h */    flash_hal_spi_transfer((addr >> 16) & 0xFF);    flash_hal_spi_transfer((addr >> 8) & 0xFF);    flash_hal_spi_transfer(addr & 0xFF);    flash_hal_cs_high();    return flash_wait_ready(FLASH_TIMEOUT_SECTOR_ERASE);}
```

---

## 四、典型应用场景

### 4.1 作为 MCU 外部程序存储器（XiP）

- 设计要点：将固件烧录至 Flash 起始地址（0x000000），MCU 上电后通过 Quad SPI 直接取指执行。
- 驱动要求：需配置 QE 位，并在启动阶段初始化 SPI 为高速模式。

### 4.2 固件在线升级（OTA）

- 设计要点：划分两个分区（Bank0/Bank1），新固件写入非活动分区，校验成功后切换启动地址。
- 驱动要求：需实现扇区擦除、页编程、校验读取。

### 4.3 用户参数存储

- 设计要点：使用扇区循环写入（磨损均衡），避免频繁擦写同一扇区。
- 驱动要求：需封装“写入-读取-校验”接口，并管理空闲扇区。

### 4.4 安全存储

- 设计要点：将设备密钥写入安全寄存器并锁定，唯一 ID 用于设备认证。
- 驱动要求：需实现安全寄存器擦除/编程/读取接口。

---

## 五、常见问题深度排查指南

| 现象 | 可能原因 | 详细排查步骤 | 解决方案 |
| --- | --- | --- | --- |
| 读 JEDEC ID 全为 0xFF | 硬件连接错误 | 1\. 检查 CS#、SCLK、MOSI、MISO 连线  2\. 检查电源电压（2.7~3.6V）  3\. 用示波器测量 CS# 在通信期间是否拉低 | 修正硬件连接；确保 CS# 在传输期间为低 |
| 读 JEDEC ID 固定为 0x00 | SPI 模式不匹配 | 1\. 确认 SPI 模式为 Mode 0 或 Mode 3  2\. 检查时钟极性/相位配置 | 修改 SPI 初始化代码，CPOL=0, CPHA=0 或 CPOL=1, CPHA=1 |
| 读 JEDEC ID 正确但写操作无效 | 未执行 WREN | 1\. 读状态寄存器确认 WEL 是否为 1  2\. 检查 WREN 命令是否在写操作前发送 | 在每次编程/擦除前调用 `flash_write_enable()` |
| 写操作一直忙（WIP 始终为 1） | 芯片损坏或命令未正确结束 | 1\. 检查 CS# 是否在 8 字节边界拉高  2\. 测量电源电压是否稳定  3\. 若复位后仍为 1，可能芯片已损坏 | 确保 CS# 拉高时机正确；若芯片损坏需更换 |
| Quad 模式读取出错 | QE 位未使能 | 1\. 读状态寄存器 2 检查 QE 位  2\. 若 QE=0，执行 `flash_quad_enable()` | 上电后先使能 Quad 模式 |
| Quad 模式速度上不去 | Dummy 周期不足 | 1\. 检查当前时钟频率  2\. 确认 DC 位配置的 dummy 周期是否匹配 | 提高时钟频率时相应增加 dummy 周期 |
| 跨页写入数据错乱 | 页内回绕机制导致 | 1\. 检查写入地址是否对齐页边界  2\. 确认写入长度未超出页剩余空间 | 将跨页数据拆分为多次 `flash_page_program` 调用 |
| 安全寄存器写入失败 | 已被锁定（LB 位=1） | 1\. 读取状态寄存器 2 的 LB1~LB3 位  2\. 若为 1，该区域已 OTP 锁定，不可修改 | 无法恢复，只能使用新的寄存器 |
| 擦除/编程超时 | 超时时间设置过短 | 1\. 参考数据手册确认典型/最大时间  2\. 检查电源是否在操作期间跌落 | 增加超时时间；改善电源供电 |
| 芯片进入深度掉电后无法唤醒 | 未发送正确唤醒命令 | 1\. 发送 RDI 命令（ABh）并等待 tRES1  2\. 检查 CS# 在唤醒期间是否保持高电平 | 确保唤醒命令序列正确，等待足够时间 |
| 软件复位后状态未恢复 | 复位时序不正确 | 1\. 必须发送 66h + 99h 序列  2\. 两次命令之间 CS# 需拉高 | 按照 `flash_send_cmd(0x66); flash_send_cmd(0x99);` 顺序执行 |
| 硬件复位（RESET#）无效 | HOLD/RST 位配置错误 | 1\. 读取状态寄存器 3 的 HOLD/RST 位  2\. 该位=0 时引脚为 HOLD 功能，不是 RESET | 将 HOLD/RST 位设为 1，或使用软件复位 |

---

## 六、使用流程总结

基于以上原理与代码，一个典型的 Flash 操作流程如下：

```swift
┌─────────────────────────────────────────────────────────┐│                      系统上电                           │└─────────────────────────────────────────────────────────┘                           │                           ▼┌─────────────────────────────────────────────────────────┐│  1. 硬件初始化：SPI 初始化、GPIO 配置、延时等待 VCC 稳定 │└─────────────────────────────────────────────────────────┘                           │                           ▼┌─────────────────────────────────────────────────────────┐│  2. 读取 JEDEC ID，验证芯片是否在位且通信正常          │└─────────────────────────────────────────────────────────┘                           │                           ▼┌─────────────────────────────────────────────────────────┐│  3. 可选：启用 Quad 模式（如需高速读取）                │└─────────────────────────────────────────────────────────┘                           │                           ▼┌─────────────────────────────────────────────────────────┐│  4. 执行具体业务操作（编程/擦除/读取）                  ││     - 编程前：写使能 → 页编程 → 等待就绪 → 校验         ││     - 擦除前：写使能 → 扇区/块擦除 → 等待就绪           ││     - 读取：直接发送读命令                              │└─────────────────────────────────────────────────────────┘                           │                           ▼┌─────────────────────────────────────────────────────────┐│  5. 可选：进入低功耗模式（Deep Power Down）            │└─────────────────────────────────────────────────────────┘
```

关键原则：

1. 先擦后写：NOR Flash 不能覆盖写入，必须先擦除再编程。
2. 写前使能：任何修改操作前必须执行 WREN。
3. 等待就绪：所有耗时操作后必须等待 WIP 清零。
4. 地址对齐：跨页操作需拆分为多次页编程。
5. 保护检查：修改前确认目标区域未被 BP 位或硬件 WP# 保护。

---

## 七、总结

本文从物理存储原理、SPI 协议细节、状态机机制、高速模式实现到完整的驱动代码，系统地剖析了一款国产 SPI NOR Flash 模块。通过将原理与代码逐段对应，读者不仅能写出正确的驱动，更能深入理解“为什么这样写”。

在实际开发中，SPI NOR Flash 驱动是嵌入式系统的基础组件，稳定性和可靠性至关重要。希望本文提供的代码框架和排查指南能帮助读者快速完成开发，并在遇到问题时从容应对。

最后提醒：不同厂商、不同型号的 SPI NOR Flash 在命令码、状态寄存器定义、时序参数上可能存在细微差异，开发时务必以具体数据手册为准，本文代码可作为通用框架灵活适配。

**微信扫一扫赞赏作者**

作者提示: 个人观点，仅供参考

继续滑动看下一个

OneChan

向上滑动看下一个