---
doc_id: src-memory-bandwidth-test
title: 内存读取速率测试
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/测试内存读取速率.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, memory, cache, performance]
---

## Summary

本文介绍了如何测试内存读取速率（bandwidth）。核心思路是关闭 CPU cache，然后从内存中顺序读取数组，计算读取速率。文章提供了关闭 L1/L2 cache 的内核模块代码，以及测试带宽的计算公式和实验方法。

## Key Points

### 1. 测试思路
- 关闭 CPU cache（L1/L2）
- 从内存中顺序读取数组
- 计算 bandwidth = arraysize / time

### 2. 关闭 Cache 的内核模块
```c
static int disableCache_init(void) {
    __asm__(".intel_syntax noprefix\n\t"
            "mov    rax,cr0\n\t"
            "or     rax,(1 << 30)\n\t"
            "mov    cr0,rax\n\t"
            "wbinvd\n\t"
            ".att_syntax noprefix\n\t"
    : : : "rax");
    return 0;
}
```
- 设置 CR0 寄存器的 CD 位（bit 30）
- `wbinvd`: 写回并使 cache 失效

### 3. 编译加载
```bash
make
insmod disableCache.ko
dmesg  # 查看加载日志
```

## Evidence

- CR0 寄存器 bit 30 = Cache Disable (CD)
- 关闭 cache 后系统性能显著下降
- 带宽测试需考虑数组大小和读取时间

## Key Quotes

> "启用cache

实际上将关闭cache载入kernel module的模块卸载就可以了，用下面的指令

```
$ rmmod disableCache.ko
$ dmesg
```

在系统输出的log的中可以看到如下输出，说明已经将cache启用"

## Open Questions

- 如何测试 L3 cache 和内存的混合带宽
- 不同内存类型（DDR4/DDR5/LPDDR）的带宽差异

## Related Pages

- [[cache]]
- [[memory-bandwidth]]
- [[performance-test]]
