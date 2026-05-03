---
doc_id: src-cache-size-test
title: Cache 大小测试（C语言实现）
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/测试cache大小-C语言实现.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-03
tags: [bsp, cache, memory, performance]
---

## Summary

本文介绍了一种使用 C 语言测试 CPU cache 大小的实用方法。核心思路基于 cache 替换原理：当数组大小超过 cache 容量时，随机读取会发生 cache miss 和替换，导致读取时间显著增加。通过测试不同大小数组（2^0 ~ 2^23 字节）的随机读取时间，找到时间突增点即可估算 cache 大小。文章提供了完整的测试代码，并通过实际运行结果验证了该方法的有效性——测试结果（约 4MB）与系统实际 L3 cache 大小（4194304 Byte）基本吻合。

## Key Points

### 1. 测试原理
| 场景 | 访问行为 | 时间特征 |
|------|---------|---------|
| 数组大小 < cache | 数据全部在 cache 中，命中率高 | 读取速度快，时间稳定 |
| 数组大小 > cache | 发生 cache 替换，需从内存读取 | 时间显著增加 |

- **关键指标**: 时间突增点即为 cache 大小的估计量
- **理论基础**: 从内存读取数据的时间远大于从 cache 读取

### 2. 测试代码核心逻辑
```c
#define READ_TIMES 999999999
#define TEST_RANGE 24

for (i = 0; i < TEST_RANGE; ++i) {
    int size = pow(2, i);  // 2^i 字节
    int *block = (int *)calloc(size, sizeof(int));
    
    clock_t start = clock();
    for(j = 0; j < READ_TIMES; ++j)
        temp += block[rand() % size];
    total_time = clock() - start;
    
    printf("At size: %ldB, we need %lf sec\n", 
           size * sizeof(int), (double)total_time / CLOCKS_PER_SEC);
}
```

### 3. 结果分析
| 数组大小 | 读取时间 | 说明 |
|---------|---------|------|
| 4B ~ 4MB | ~8 秒 | 数据在 cache 中，时间稳定 |
| 8MB | ~9 秒 | 开始出现轻微增长 |
| 16MB | ~9.6 秒 | 明显增长 |
| 32MB | ~10.2 秒 | 显著增长 |

- **估计 cache 大小**: 约 4MB（8388608 Byte 时开始突增）
- **实际 L3 cache**: 4194304 Byte（通过 `getconf -a | grep CACHE` 验证）

### 4. 注意事项
- 测试范围应覆盖预期 cache 大小的上下区间
- 读取次数要足够大（如 999,999,999 次）以消除随机误差
- 系统其他程序可能引入时间波动
- 小数组的波动可能受指令局部性影响

## Evidence

- 测试范围：2^0 ~ 2^23 字节（4B ~ 32MB）
- 读取次数：999,999,999 次
- 结果示例：4B-4MB 稳定在 8 秒左右，8MB 开始突增

## Open Questions

- 如何区分 L1/L2/L3 cache 的大小
- 多核 CPU 的共享 cache 和私有 cache 测试方法

## Key Quotes

> "从内存中读取数据的时间远大与从cache中读取的时间，因此从如果数组大于cache size那么多次随即读取的时间会增加"

> "// 每次循环测试大小为block_size[i]的数组随即读取的时间"

> "实际上可以看到数组大小到达4194304 Byte时随即读取的总时间也比较大，这可能是cache替换时出现抖动引起的"

## Related Pages

- [[cache]]
- [[memory-hierarchy]]
- [[performance-test]]
