---
doc_id: src-cache-size-test
title: Cache 大小测试（C语言实现）
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/测试cache大小-C语言实现.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, cache, memory, performance]
---

## Summary

本文介绍了使用 C 语言测试 CPU cache 大小的方法。核心思路是：当数组大小超过 cache 大小时，随机读取会发生 cache 替换，导致读取时间显著增加。通过测试不同大小数组的随机读取时间，找到时间突增点即可估算 cache 大小。

## Key Points

### 1. 测试原理
- 数组大小 < cache 大小：数据在 cache 中，读取快
- 数组大小 > cache 大小：发生 cache 替换，需从内存读取，时间显著增加
- 时间突增点即为 cache 大小的估计量

### 2. 测试代码
```c
#define READ_TIMES 999999999
#define TEST_RANGE 24

for (i = 0; i < TEST_RANGE; ++i) {
    int size = block_size[i];  // 2^i
    int *block = (int *)calloc(size, sizeof(int));
    
    clock_t start = clock();
    for(j = 0; j < READ_TIMES; ++j)
        temp += block[rand() % size];
    total_time = clock() - start;
    
    printf("At size: %ldB, we need %lf sec\n", size * sizeof(int), 
           (double)total_time / CLOCKS_PER_SEC);
}
```

### 3. 结果分析
- 小数组（< cache）：时间稳定在 ~8 秒
- 大数组（> cache）：时间显著增加（~15-20 秒）
- 突增点对应 cache 大小

## Evidence

- 测试范围：2^0 ~ 2^23 字节（4B ~ 32MB）
- 读取次数：999,999,999 次
- 结果示例：4B-256KB 稳定在 8 秒左右，512KB 开始突增

## Open Questions

- 如何区分 L1/L2/L3 cache 的大小
- 多核 CPU 的共享 cache 和私有 cache 测试方法

## Related Pages

- [[cache]]
- [[memory-hierarchy]]
- [[performance-test]]
