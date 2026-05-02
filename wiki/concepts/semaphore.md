---
doc_id: semaphore
title: Semaphore 与 Mutex
page_type: concept
related_sources:
  - src-semaphore-vs-mutex
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, bsp, synchronization]
---

# Semaphore 与 Mutex

## 定义

**Mutex（互斥锁）**：保护共享资源，确保同一时间只有一个线程访问临界区。

**Semaphore（信号量）**：调度线程，控制线程执行顺序。

## 核心区别

| | Mutex | Semaphore |
|---|---|---|
| **目的** | 互斥（保护资源） | 同步（调度线程） |
| **所有权** | 有（谁加锁谁解锁） | 无 |
| **计数** | 二元（0/1） | 多元（0~N） |
| **释放** | 只能由持有者释放 | 可由任意线程释放 |
| **类比** | 一个厕所一把钥匙 | 多个厕所多把钥匙 |

## 使用场景

### Mutex — 保护共享资源
```c
pthread_mutex_lock(&mutex);
// 访问共享资源（临界区）
shared_var++;
pthread_mutex_unlock(&mutex);
```

### Semaphore — 线程同步
```c
// 线程 A
semaphore_post(&sem);  // 完成任务 A

// 线程 B
semaphore_post(&sem);  // 完成任务 B

// 线程 C
semaphore_wait(&sem);  // 等待 A
semaphore_wait(&sem);  // 等待 B
// 现在可以执行 C = A + B
```

## 常见误区

1. **Semaphore 不是 Mutex 的 value=1 情况**
   - 初学者请勿混为一谈
   - 等融会贯通后再理解深层含义

2. **不要用 Semaphore 做互斥**
   - 虽然可行，但不是设计目的
   - 互斥请用 Mutex

3. **忘记"厕所例子"**
   - 容易让人误解为线程池
   - 更好的理解：调度依赖关系

## Linux 内核实现

| 类型 | 函数 |
|------|------|
| Mutex | `mutex_lock()` / `mutex_unlock()` |
| Semaphore | `down()` / `up()` |
| Spinlock | `spin_lock()` / `spin_unlock()` |
| RWLock | `read_lock()` / `write_lock()` |

## 相关来源

- [[src-semaphore-vs-mutex]] — Semaphore 与 Mutex 的区别
