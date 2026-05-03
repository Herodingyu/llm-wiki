---
doc_id: src-测试cache大小-c语言实现
title: 测试cache大小 C语言实现
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/测试cache大小-C语言实现.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

4 人赞同了该文章 在实际CPU从内存中取数时很多时候从cache中存取，在这个实验中使用C语言编成估计cache的大小。 当一个数组的大小超过cache的大小时，随机读取数组的元素会发生cache的替换现象。如果要存取的数据经常不在cache中（被替换出去/没有载入），CPU需要多次从内存中读取数据。

## Key Points

### 1. 1\. 简介
在实际CPU从内存中取数时很多时候从cache中存取，在这个实验中使用C语言编成估计cache的大小。

### 2. 2\. 实验思路
当一个数组的大小超过cache的大小时，随机读取数组的元素会发生cache的替换现象。如果要存取的数据经常不在cache中（被替换出去/没有载入），CPU需要多次从内存中读取数据。 从内存中读取数据的时间远大与从cache中读取的时间，因此从如果数组大于cache size那么多次随即读取的时间会增加。当随即读取时间出现显著增加时，数组的大小即为cache size的 [估计量](https://

### 3. 3\. 代码
代码本身比较简单。注释也都比较详细，直接上代码。 ```c int main() { int i; // 每次要测试的内存块大小 int *block_size = (int *)calloc(TEST_RANGE, sizeof(int));

### 4. 4\. 运行结果
得到的运行结果如下 ``` At size: 4B, we need 8.686316 sec At size: 8B, we need 8.830951 sec At size: 16B, we need 8.271359 sec

### 5. 5\. 验证
为了验证实验的结果，使用命令 ```abap getconf -a | grep CACHE ``` 来获得机器的 [硬件信息](https://zhida.zhihu.com/search?content_id=116600051&content_type=Article&match_order=1&q=%E7%A1%AC%E4%BB%B6%E4%BF%A1%E6%81%AF&zhida_sou

## Evidence

- Source: [原始文章](raw/tech/bsp/测试cache大小-C语言实现.md) [[../../raw/tech/bsp/测试cache大小-C语言实现.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/测试cache大小-C语言实现.md) [[../../raw/tech/bsp/测试cache大小-C语言实现.md|原始文章]]
