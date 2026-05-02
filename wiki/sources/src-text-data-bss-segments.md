---
doc_id: src-text-data-bss-segments
title: 程序的 text、data、bss 段
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/浅谈程序中的text段、data段和bss段.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, memory, text, data, bss, elf]
---

## Summary

本文介绍了程序的三个基本段：text 段、data 段和 bss 段。text 段存放程序代码（只读），data 段存放已初始化的全局变量和静态变量（可读可写），bss 段存放未初始化的全局变量（不占用可执行文件空间，由系统初始化为 0）。文章还对比了 bss 和 data 段在可执行文件大小上的差异。

## Key Points

### 1. 三个基本段
| 段 | 内容 | 属性 | 初始化 |
|----|------|------|--------|
| text | 程序代码、机器指令 | 只读 | 编译时确定 |
| data | 已初始化的全局变量、常量、静态变量 | 可读可写 | 程序初始化 |
| bss | 未初始化的全局变量 | 可读可写 | 系统清零 |

### 2. text 段
- 存放处理器机器指令
- 编译时确定，只读
- 链接器将所有目标文件的 .text 段合并
- 带 MMU 的系统将 text 段设为只读保护

### 3. data 段
- 存放编译时就能确定的数据
- 已初始化的全局变量、常量、静态变量
- 占用可执行文件空间
- 数据保存在目标文件中

### 4. bss 段
- Block Started by Symbol
- 存放未初始化的全局变量
- **不占用可执行文件空间**
- 只记录数据所需空间大小
- 由操作系统初始化（清零）
- 裸机程序需手动清零

### 5. bss vs data 对比
```c
// 程序1: bss 段
int ar[30000];
// 可执行文件小

// 程序2: data 段
int ar[300000] = {1, 2, 3, 4, 5, 6};
// 可执行文件大得多
```

### 6. 内存布局
```
低地址 → 高地址
text → data → bss → heap → stack
```

## Evidence

- bss 属于静态内存分配
- 初始化时 bss 部分清零
- data 段包含初始化后的全局变量及其值

## Open Questions

- ELF 文件中 .rodata 段与 .text 段的关系
- 嵌入式系统中如何优化 data/bss 段内存占用

## Related Pages

- [[elf]]
- [[memory-layout]]
- [[bss]]
- [[data-segment]]
