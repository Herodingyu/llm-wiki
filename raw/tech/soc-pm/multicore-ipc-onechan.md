# 多核 IPC 通信：硬件队列、门铃中断与共享内存

> 来源：微信公众号「OneChan」
> 原文链接：https://mp.weixin.qq.com/s/e9jccXbkgH-cnn-rH6hFog
> 记录时间：2026-05-04

---

## 核心问题

当多个核心需要高效协同，硬件队列、门铃中断和共享内存如何构建无锁通信的桥梁，又如何在**数据一致性、延迟和吞吐量**之间艰难平衡？

## 多核通信的本质需求

- **数据传输**：一个核心产生的数据传递给另一个核心
- **同步**：协调多个核心的执行顺序，避免竞态条件
- **通知**：一个核心需要通知另一个核心某个事件的发生

简单共享内存的问题：
- 数据一致性（缓存不一致）
- 同步开销（原子操作或锁）
- 缓存颠簸（缓存行在核心间来回移动）

## 01 硬件队列（Hardware Queue）

### 结构
- 队列控制寄存器（头指针、尾指针、状态寄存器）
- 数据缓冲区（槽 0 ~ 槽 N-1）

### 操作流程
- 发送核心：检查空槽 → 写入数据 → 更新尾指针（硬件原子化）
- 接收核心：检查数据 → 从头部读取 → 更新头指针（硬件原子化）

### 优势
- 无锁设计，避免锁竞争
- 数据传递自然，适合流式数据
- 硬件管理指针，简化软件

### 挑战
- 队列深度固定，可能满或空
- 缓存一致性仍需考虑

## 02 门铃中断（Doorbell Interrupt）

### 机制
一个核心通过写特定寄存器来"按门铃"，触发另一个核心的中断。写入的值可携带少量信息（如事件类型）。

### 优势
- 低延迟通知，避免轮询开销
- 可携带少量数据，避免内存访问
- 硬件管理，无需软件同步

### 挑战
- 中断处理有开销，不适合高频通知
- 门铃寄存器数量有限
- 需要处理中断屏蔽和嵌套

## 03 共享内存与缓存一致性

### MESI 协议
多核系统使用 MESI 或其变种维护缓存一致性：

| 状态 | 含义 |
|------|------|
| Modified（已修改） | 缓存行已被修改，与内存不一致，其他核心没有副本 |
| Exclusive（独占） | 缓存行与内存一致，只存在于当前核心缓存 |
| Shared（共享） | 缓存行与内存一致，可能存在于多个核心缓存 |
| Invalid（无效） | 缓存行数据无效，不能使用 |

### 缓存一致性操作开销
核心 A 写入共享缓存行时：
1. 将核心 B 中对应缓存行置为无效
2. 将核心 A 的缓存行置为已修改
3. 核心 B 随后读取时，需从核心 A 或内存获取最新数据

## 04 四大性能陷阱

### 陷阱一：缓存伪共享（False Sharing）
两个核心访问同一缓存行中的不同变量，虽然访问的是不同变量，但由于缓存一致性协议以缓存行为单位，一个核心修改时另一个核心的缓存行会失效。

**解决方案**：
- 将频繁写入的变量放入不同的缓存行
- 使用缓存行对齐和填充
- 将只读数据和读写数据分离

### 陷阱二：锁竞争与优先级反转
高负载下核心花费大量时间等待锁。实时系统中，低优先级任务持有锁，高优先级任务等待，中优先级任务抢占低优先级任务，导致高优先级任务被无限期阻塞。

**解决方案**：
- 使用无锁数据结构（如环形队列）
- 使用读写锁
- 优先级继承
- 使用硬件原子操作代替软件锁

### 陷阱三：中断风暴
多个核心频繁使用门铃中断相互通知，产生大量中断，核心频繁响应中断无法执行实际工作。

**解决方案**：
- 批处理：合并多个事件，一次中断处理多个
- 轮询与中断混合：高负载时切换到轮询
- 中断合并：硬件支持多个中断事件合并为一个

### 陷阱四：内存屏障与顺序一致性
现代处理器和编译器会对内存访问重排序。多核通信中需要确保内存访问顺序。

**内存屏障**：
- 写屏障：确保所有写操作在屏障之前完成
- 读屏障：确保所有读操作在屏障之后开始
- 全屏障：同时具有写屏障和读屏障效果

```c
// 核心 A：准备数据并通知核心 B
data = 123;
write_memory_barrier();      // 写屏障
flag = 1;
send_doorbell();             // 触发中断

// 核心 B：等待通知并读取数据
while(flag == 0) {
    read_memory_barrier();   // 读屏障
}
read_memory_barrier();
int value = data;
```

## 05 实战：无锁环形队列

```c
typedef struct {
    uint32_t *buffer;
    uint32_t size;           // 必须是 2 的幂
    volatile uint32_t head;  // 消费者索引
    volatile uint32_t tail;  // 生产者索引
} lockless_ring_queue_t;

bool queue_enqueue(lockless_ring_queue_t *queue, uint32_t data) {
    uint32_t head = __atomic_load_n(&queue->head, __ATOMIC_ACQUIRE);
    uint32_t tail = __atomic_load_n(&queue->tail, __ATOMIC_RELAXED);
    if(tail - head >= queue->size) return false;  // 队列已满
    queue->buffer[tail & (queue->size - 1)] = data;
    __atomic_store_n(&queue->tail, tail + 1, __ATOMIC_RELEASE);
    return true;
}

bool queue_dequeue(lockless_ring_queue_t *queue, uint32_t *data) {
    uint32_t head = __atomic_load_n(&queue->head, __ATOMIC_RELAXED);
    uint32_t tail = __atomic_load_n(&queue->tail, __ATOMIC_ACQUIRE);
    if(head == tail) return false;  // 队列为空
    *data = queue->buffer[head & (queue->size - 1)];
    __atomic_store_n(&queue->head, head + 1, __ATOMIC_RELEASE);
    return true;
}
```

## 06 实战：门铃中断 + 共享内存消息传递

```c
typedef struct {
    ipc_message_t mailbox[2];
    volatile uint32_t doorbell[2];
} ipc_control_block_t;

bool ipc_send(ipc_control_block_t *ipc, int core_id, ipc_message_t *msg) {
    if(__atomic_load_n(&ipc->doorbell[core_id], __ATOMIC_ACQUIRE) != 0)
        return false;  // 上一个消息未处理
    ipc->mailbox[core_id] = *msg;
    __atomic_thread_fence(__ATOMIC_RELEASE);
    __atomic_store_n(&ipc->doorbell[core_id], 1, __ATOMIC_RELEASE);
    return true;
}

bool ipc_receive(ipc_control_block_t *ipc, int core_id, ipc_message_t *msg) {
    if(__atomic_load_n(&ipc->doorbell[core_id], __ATOMIC_ACQUIRE) == 0)
        return false;  // 没有新消息
    __atomic_thread_fence(__ATOMIC_ACQUIRE);
    *msg = ipc->mailbox[core_id];
    __atomic_store_n(&ipc->doorbell[core_id], 0, __ATOMIC_RELEASE);
    return true;
}
```

## 07 GIPC 系统设计检查清单

| 检查项 | 问题 | 检查点 |
|--------|------|--------|
| 通信模式选择 | 选择的 IPC 机制是否适合通信模式？ | 小数据高频用门铃，大数据流用队列，复杂数据用共享内存 |
| 缓存一致性 | 共享数据是否考虑了缓存一致性？ | 正确对齐，使用缓存维护操作 |
| 同步机制 | 同步机制是否高效？有无优先级反转？ | 无锁数据结构，优先级继承 |
| 中断管理 | 门铃中断频率是否合理？ | 批处理，中断合并 |
| 内存屏障 | 是否正确使用内存屏障？ | acquire-release 配对 |
| 错误处理 | IPC 失败是否被正确处理？ | 有重试或回退机制 |
| 性能监控 | 是否有 IPC 性能监控？ | 关键路径有性能计数 |
| 可扩展性 | IPC 设计是否支持核心数增加？ | 不随核心数增加而性能急剧下降 |
| 调试支持 | 是否有 IPC 调试机制？ | 有日志或追踪机制 |
| 功耗管理 | IPC 在低功耗模式下是否正常？ | 可唤醒其他核心 |

## 总结

成功的 IPC 设计不是选择"最佳"机制，而是根据通信模式选择最合适的机制：
- **高频小数据**：门铃中断
- **流式数据**：硬件队列
- **复杂数据结构**：共享内存 + 适当同步

**始终注意缓存一致性和内存屏障**。

## Related Pages

- [[src-onechan-register-types-ro-rw-wo]] — 寄存器类型（RO/RW/WO）
- [[src-onechan-register-offset-alignment-stride]] — 寄存器偏移/对齐/Stride
- [[src-onechan-peripheral-core-system-reset]] — 三类复位
- [[src-onechan-bootrom-first-gate-of-chip-firmware]] — BootROM 详解

## 开放问题

- 本文中的无锁环形队列和 IPC 代码是否值得提取为独立代码参考？
- 多核缓存一致性（MESI）是否需要单独的 wiki 概念词条？
