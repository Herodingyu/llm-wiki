---
doc_id: src-google-tee环境trusty分析
title: Google TEE环境Trusty分析
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/Google TEE环境trusty分析.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, trusty, tee, google, security, little-kernel]
---

## Summary

本文深入分析了Google的TEE（可信执行环境）实现——Trusty。Trusty基于Little Kernel（LK）开发，是Android生态中重要的安全组件。文章详细解析了Trusty的初始化机制，特别是LK的初始化钩子框架：通过初始化等级（lk_init_level）和处理器标志（lk_init_flags）实现分阶段、分CPU的初始化调度。核心在于理解Trusty如何利用LK的钩子机制，在系统启动时按优先级顺序完成各组件的安全初始化，以及Trusty App的架构（数据结构、链接加载、执行流程、线程间通信、IPC等）。

## Key Points

### 1. Trusty 概述
- **基础**：基于Little Kernel（LK）开发
- **定位**：Google的TEE（可信执行环境）实现
- **源码获取**：
  ```bash
  repo init -u https://android.googlesource.com/trusty/manifest
  repo sync
  ```
- **编译**：`make -j24 generic-arm64`

### 2. LK 初始化钩子机制
Trusty继承了LK的初始化钩子框架，实现分阶段初始化。

**初始化等级（lk_init_level）：**
| 等级 | 值 | 说明 |
|------|-----|------|
| LK_INIT_LEVEL_EARLIEST | 1 | 最早初始化 |
| LK_INIT_LEVEL_ARCH_EARLY | 0x10000 | 架构早期 |
| LK_INIT_LEVEL_PLATFORM_EARLY | 0x20000 | 平台早期 |
| LK_INIT_LEVEL_TARGET_EARLY | 0x30000 | 目标早期 |
| LK_INIT_LEVEL_HEAP | 0x40000 | 堆初始化 |
| LK_INIT_LEVEL_VM | 0x50000 | 虚拟内存 |
| LK_INIT_LEVEL_KERNEL | 0x60000 | 内核 |
| LK_INIT_LEVEL_THREADING | 0x70000 | 线程 |
| LK_INIT_LEVEL_ARCH | 0x80000 | 架构 |
| LK_INIT_LEVEL_PLATFORM | 0x90000 | 平台 |
| LK_INIT_LEVEL_TARGET | 0xa0000 | 目标 |
| LK_INIT_LEVEL_APPS | 0xb0000 | 应用 |
| LK_INIT_LEVEL_LAST | UINT_MAX | 最后 |

**处理器标志（lk_init_flags）：**
- LK_INIT_FLAG_PRIMARY_CPU (0x1)：主处理器
- LK_INIT_FLAG_SECONDARY_CPUS (0x2)：次处理器
- LK_INIT_FLAG_ALL_CPUS：所有处理器
- LK_INIT_FLAG_CPU_SUSPEND (0x4)：暂停的处理器
- LK_INIT_FLAG_CPU_RESUME (0x8)：恢复执行的处理器

**钩子描述符（lk_init_struct）：**
```c
struct lk_init_struct {
    uint level;    // 初始化顺序（数字越小执行越早）
    uint flags;    // 指定此钩子函数由哪些cpu执行
    void (*hook)(void);  // 钩子函数指针
};
```

### 3. Trusty App 架构
- **数据结构**：Trusty App的数据组织方式
- **链接加载**：App的链接和加载流程
- **执行流程**：App启动和运行过程
- **线程间通信**：Trusty内部线程通信机制
- **局部存储**：Trusty App的局部存储管理
- **消息处理**：Trusty App的消息处理流程
- **轮询事件**：事件轮询和绑定机制
- **uctx**：用户上下文管理
- **IPC**：进程间通信机制
- **系统调用**：Trusty系统调用接口
- **与Monitor通信**：与Secure Monitor的交互

## Key Quotes

> "trusty是基于little kernel开发的，关于little kernel的文章请参考我之前的文章【little kernel分析】。"

> "系统把初始化过程分步，通过初始化等级描述，值越小越早执行。"

> "通过一个结构体记录钩子信息：level（初始化顺序）、flags（指定此钩子函数由哪些cpu执行）。"

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/Google TEE环境trusty分析.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/Google TEE环境trusty分析.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/Google TEE环境trusty分析.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/Google TEE环境trusty分析.md|原始文章]]
