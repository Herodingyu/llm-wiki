---
doc_id: src-semaphore-vs-mutex
title: Semaphore 与 Mutex 的区别
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/semaphore和mutex的区别？ - 二律背反 的回答.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, linux, synchronization, semaphore, mutex]
---

## Summary

本文清晰地区分了 Semaphore 和 Mutex 的用途。Mutex 用于保护共享资源（互斥），Semaphore 用于调度线程（同步）。Mutex 是"一个厕所一把钥匙"，Semaphore 是"多个厕所多把钥匙"。核心区别在于：Mutex 干的活和 Semaphore 干的活不要混起来。Semaphore 不是 Mutex 的特例（即使 Semaphore value=1 时）。

## Key Points

### 1. Mutex 用途
- **一句话**: 保护共享资源
- **典型场景**: 买票（票是共享资源，防止把同一张票卖给两个人）
- **特点**: 互斥访问

### 2. Semaphore 用途
- **一句话**: 调度线程
- **典型场景**: 线程同步（如 a + b = c，线程 3 必须等线程 1 和 2 完成后执行）
- **特点**: 控制执行顺序

### 3. 区别对比
| | Mutex | Semaphore |
|---|---|---|
| 目的 | 互斥（保护资源） | 同步（调度线程） |
| 类比 | 一个厕所一把钥匙 | 多个厕所多把钥匙 |
| 所有权 | 有（谁加锁谁解锁） | 无 |
| 适用场景 | 临界区保护 | 生产者-消费者、线程依赖 |

### 4. 常见误区
- **误区**: Semaphore 是 Mutex 的 value=1 情况
- **正解**: 初学者请先将此视为错误，等融会贯通后再理解深层含义
- **误区**: Semaphore = 线程池
- **正解**: 忘记"厕所例子"，它会让初学者困惑

### 5. 线程同步示例
```c
void geta() { a = calculatea(); semaphore_increase(); }
void getb() { b = calculateb(); semaphore_increase(); }
void getc() { 
    semaphore_decrease();  // 等待 a
    semaphore_decrease();  // 等待 b
    c = a + b; 
}
```

## Evidence

- Mutex: 保护共享资源，防止竞态条件
- Semaphore: 线程间同步，控制执行顺序
- `sem_post`（increase）和 `sem_wait`（decrease）

## Key Quotes

> "根本原因是不知道semaphore的用途。"

> "如果你要做这件事，请用mutex。"

> "mutex干的活儿和semaphore干的活儿不要混起来。"

> "调度线程，就是：一些线程生产（increase）同时另一些线程消费（decrease），semaphore可以让生产和消费保持合乎逻辑的执行顺序。"

> "条件锁，是为了避免绝大多数情况下都是lock ---> 判断条件 ----> unlock的这种很占资源但又不干什么事情的线程。"

## Open Questions

- Linux 内核中 mutex 与 spinlock 的选择策略
- 读写锁（rwlock）与信号量的适用场景对比

## Related Pages

- [[mutex]]
- [[semaphore]]
- [[synchronization]]
- [[spinlock]]
