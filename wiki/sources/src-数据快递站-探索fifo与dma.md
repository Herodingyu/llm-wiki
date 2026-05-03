---
doc_id: src-数据快递站-探索fifo与dma
title: 数据快递站——探索FIFO与DMA
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/数据快递站——探索FIFO与DMA.md
domain: tech/peripheral
created: 2026-05-03
updated: 2026-05-03
tags: [peripheral]
---

## Summary

17 人赞同了该文章 在单片机或者是嵌入式编程中，通常软件和硬件是紧密相连的。编程者需要同时拥有硬件思维和软件技巧，才能使程序更高效、更稳定的运行在 [嵌入式系统](https://zhida.zhihu.com/search?content_id=226746816&content_type=Article&match_order=1&q=%E5%B5%8C%E5%85%A5%E5%BC%8F%E7%B3%BB%E7%BB%9F&zhida_source=entity) 中。在机器人系统中，各个模块间的通信就像人的神经，往往需要很高带宽与实时性， **借助DMA和FIFO能够极大程度的发挥出

## Key Points

### 1. FIFO
FIFO是“先进先出”的缩写，是一种常用的数据结构和算法。它是一种队列（Queue）的实现方式，即先进入队列的数据项先被处理，后进入队列的数据项则后被处理。 [环形队列](https://zhida.zhihu.com/search?content_id=226746816&content_type=Article&match_order=1&q=%E7%8E%AF%E5%BD%A2%E9%98%

### 2. DMA
DMA（ [Direct Memory Access](https://zhida.zhihu.com/search?content_id=226746816&content_type=Article&match_order=1&q=Direct+Memory+Access&zhida_source=entity) ，直接内存访问）。常规情况下，我们对外设的操作都是由CPU直接处理，但面向与一些低

### 3. 传输过程
DMA的传输大致分为如下三个步骤： - 预处理：由CPU完成一些必要的准备工作。首先，CPU执行几条I/O指令，用以测试I/O设备状态，向DMA控制器的有关寄存器置初值，设置传送方向、启动该设备等。然后，CPU继续执行原来的程序，直到I/O设备准备好发送的数据(输入情况)或接受的数据(输出情况)时，I/O设备向DMA控制器发送DMA请求，再由DMA控制器向CPU发送总线请求(统称为DMA请求)，用

### 4. 快递员与快递站
在实际生活中，我们随处可见DMA和FIFO的身影，为了能更加方便的理解DMA和FIFO的作用，我们可以用快递员和快递站来做比喻： - FIFO（先进先出队列）是一个快递站，快递员将快递按照到达时间顺序放在一个队列中，当需要发货时，按照队列顺序一个一个地取出快递进行发货，保证了快递的顺序性。快递站如果太小，如果收发快递数量太多，快递站就会爆满堵塞，快递丢失。如果快递站过大，则占用过多土地，得不偿失。

### 5. 更高的效率
以上用具体的例子比喻了DMA和FIFO的应用场景，实际应用也当如此。以下会介绍详细的使用方法和具体的应用场景，同时开发者也要认清，并不是所有的场景都适合使用DMA，使用时要考虑实际的稳定性和必要性。

## Evidence

- Source: [原始文章](raw/tech/peripheral/数据快递站——探索FIFO与DMA.md) [[../../raw/tech/peripheral/数据快递站——探索FIFO与DMA.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/peripheral/数据快递站——探索FIFO与DMA.md) [[../../raw/tech/peripheral/数据快递站——探索FIFO与DMA.md|原始文章]]
