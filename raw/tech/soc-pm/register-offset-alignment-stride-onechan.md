# 寄存器地址偏移、地址对齐与 Stride 的底层逻辑

> 来源：微信公众号「OneChan」
> 原文链接：https://mp.weixin.qq.com/s/kaj70_dL_WcTSRsGDfw38g
> 记录时间：2026-05-04

---

## 核心观点

寄存器地址偏移、地址对齐、Stride 共同构成了嵌入式系统**内存映射 I/O（MMIO）**的底层逻辑，是固件开发和 FPGA 设计中必须掌握的硬件思维。

---

## 01 寄存器地址偏移：模块化寻址的硬件基石

### 核心原理
采用 **"基地址 + 偏移量"** 的线性寻址模型：

```
ADDR = BASE + OFFSET
```

- 高位地址线（如 [31:8]）用于**片选**（选中该外设）
- 低位地址线（如 [7:0]）用于**偏移译码**（选中外设内的具体寄存器）

**工程意义**：更换基地址即可将同一外设挂载到不同内存区域，无需修改寄存器偏移定义。

### 示例：ARM Cortex-M3 UART0（基地址 0x4000C000）

| 寄存器 | 偏移量 | 功能 |
|--------|--------|------|
| DR | 0x00 | 数据寄存器（读写） |
| SR | 0x04 | 状态寄存器（只读） |
| BRR | 0x08 | 波特率寄存器（读写） |

```c
#define UART0_BASE  (0x4000C000UL)
#define UART0_DR    (*(volatile uint32_t *)(UART0_BASE + 0x00))
#define UART0_SR    (*(volatile uint32_t *)(UART0_BASE + 0x04))
#define UART0_BRR   (*(volatile uint32_t *)(UART0_BASE + 0x08))
```

---

## 02 地址对齐：总线与存储系统的效率约束

### 核心原理
**访问地址必须是访问宽度的整数倍**：

```
A mod w = 0
```

- 访问宽度 w：8 位 w=1、16 位 w=2、32 位 w=4

### 未对齐访问的代价
- **性能损失**：存储控制器需拆分为多个总线周期
- **硬件异常**：部分架构（早期 RISC-V、ARM Cortex-M0/M0+）不支持未对齐访问，会触发 HardFault/BusFault

### AXI-Lite 总线对齐要求
- 32 位对齐：地址低 2 位 [1:0] 必须为 0
- 否则返回 SLVERR（从机错误）

### C 语言结构体对齐
```c
// 默认对齐（按 4 字节对齐，char 后填充 3 字节）
struct DefaultAligned {
    uint8_t  a;      // 偏移 0x00
    uint32_t b;      // 偏移 0x04（填充 3 字节）
};  // 总大小 8 字节

// 强制 1 字节对齐（无填充）
#pragma pack(1)
struct Packed {
    uint8_t  a;      // 偏移 0x00
    uint32_t b;      // 偏移 0x01（无填充）
};  // 总大小 5 字节
#pragma pack()

// 强制 8 字节对齐
struct __attribute__((aligned(8))) Aligned8 {
    uint32_t a;      // 偏移 0x00
    uint32_t b;      // 偏移 0x04
};  // 总大小 8 字节（起始地址为 8 的倍数）
```

---

## 03 Stride：非连续数据访问的硬件抽象

### 定义
**Stride（步长）= 连续两次访问的地址间隔**，用于描述"逻辑连续但物理非连续"的数据布局。

### 公式
```
单个元素 Stride = ceil(s / a) * a
一行 Stride = n × Stride_element
下一行地址 = 当前行地址 + 有效宽度 + Stride
```

### 应用场景
- 二维数组、DMA 传输的图像行
- 图像 LCD 显示、摄像头采集

### 示例：640×480 图像，每像素 2 字节，32 字节对齐
```c
#define IMAGE_WIDTH   640
#define IMAGE_HEIGHT  480
#define PIXEL_SIZE    2
#define ROW_VALID     (IMAGE_WIDTH * PIXEL_SIZE)  // 1280
#define ALIGN_SIZE    32
#define ROW_STRIDE    ((ALIGN_SIZE - (ROW_VALID % ALIGN_SIZE)) % ALIGN_SIZE)  // 32

uint8_t image_buf[IMAGE_HEIGHT][ROW_VALID + ROW_STRIDE] __attribute__((aligned(32)));
```

---

## 04 实战：AXI-Lite 寄存器地址译码（Verilog）

### 设计规则
- 寄存器宽度：32bit
- 地址偏移：0x00、0x04、0x08、0x0C...（严格 4 字节对齐）
- 译码逻辑：高位片选 + 低位偏移解码
- 对齐保证：`addr_mask = ~32'h3`（低 2 位必须为 0）

### 核心代码结构
```verilog
// 基地址 + 偏移定义
localparam BASE_ADDR     = 32'h40000000;
localparam OFFSET_CTRL   = 32'h00;
localparam OFFSET_STAT   = 32'h04;
localparam OFFSET_ADDR   = 32'h08;
localparam OFFSET_STRIDE = 32'h0C;

// 写通道：地址握手 + 数据对齐
wire [31:0] addr_mask = ~32'h3;
wr_addr <= awaddr & addr_mask;  // 对齐：去掉低 2 位

// 寄存器写操作（偏移译码）
case(wr_addr - BASE_ADDR)
    OFFSET_CTRL:   reg_ctrl   <= wdata;
    OFFSET_ADDR:   reg_addr   <= wdata;
    OFFSET_STRIDE: reg_stride <= wdata;  // Stride 寄存器写入
endcase

// 读通道：偏移译码返回对应寄存器
case(rd_addr - BASE_ADDR)
    OFFSET_CTRL:   rdata <= reg_ctrl;
    OFFSET_STAT:   rdata <= reg_status;
    OFFSET_ADDR:   rdata <= reg_addr;
    OFFSET_STRIDE: rdata <= reg_stride;
endcase
```

---

## 05 实战：DMA Stride 驱动（C 语言）

### 寄存器定义（与 Verilog 严格对应）
```c
#define DMA_BASE        0x40000000UL
#define DMA_REG_CTRL    (*(volatile uint32_t*)(DMA_BASE + 0x00))
#define DMA_REG_STATUS  (*(volatile uint32_t*)(DMA_BASE + 0x04))
#define DMA_REG_ADDR    (*(volatile uint32_t*)(DMA_BASE + 0x08))
#define DMA_REG_STRIDE  (*(volatile uint32_t*)(DMA_BASE + 0x0C))

#define DMA_START  (1U << 0)
#define DMA_DONE   (1U << 1)
```

### 带 Stride 的 DMA 传输函数
```c
void dma_transfer_with_stride(uint32_t src_addr, uint32_t row_width,
                               uint32_t stride, uint32_t rows) {
    uint32_t current_addr = src_addr;
    for(uint32_t i = 0; i < rows; i++) {
        DMA_REG_ADDR   = current_addr;
        DMA_REG_STRIDE = stride;
        DMA_REG_CTRL  |= DMA_START;
        while(!(DMA_REG_STATUS & DMA_DONE));
        DMA_REG_CTRL  &= ~DMA_START;
        DMA_REG_STATUS = 0;
        current_addr += row_width + stride;  // 核心：Stride 地址跳跃
    }
}
```

---

## 总结：三者的硬件协同关系

| 概念 | 解决的问题 | 核心公式/规则 |
|------|-----------|-------------|
| 地址偏移 | 寄存器在哪里 | ADDR = BASE + OFFSET（必须是 4 的倍数） |
| 地址对齐 | 访问效率 | A mod w = 0（AXI 强制低 2 位为 0） |
| Stride | 非连续数据访问 | 下一行 = 本行 + 有效宽度 + Stride |

**硬件+软件联动闭环**：
1. 软件配置寄存器：基地址、偏移、Stride
2. FPGA 译码：基地址 + 偏移 → 选中寄存器
3. 对齐保证：总线安全高效
4. Stride 控制：DMA 按行跳跃搬运数据

## Related Pages

- [[src-onechan-register-types-ro-rw-wo]] — 寄存器类型（RO/RW/WO）
- [[src-onechan-multicore-ipc]] — 多核 IPC 通信
- [[src-onechan-peripheral-core-system-reset]] — 三类复位
- [[src-onechan-bootrom-first-gate-of-chip-firmware]] — BootROM 详解

## 开放问题

- 本文包含大量可直接工程使用的 Verilog 和 C 代码，是否值得提取为独立的代码参考文档？
- AXI-Lite 寄存器译码模式可作为 wiki 中 FPGA/SoC 设计的标准参考模板
