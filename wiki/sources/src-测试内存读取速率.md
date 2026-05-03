---
doc_id: src-测试内存读取速率
title: 测试内存读取速率
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/测试内存读取速率.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

6 人赞同了该文章 平时CPU读取数据时会从cache或者内存中读取数据。如果想单纯从内存中读取数据，那么需要把cache关闭。然后从内存中顺序读取数组。读取速率bandwidth、数组大小arraysize、读取时间time之间的计算公式如下： 首先在Linux系统下关闭cache，使用如下代码将cache关闭。（ **[代码参考1](https://link.zhihu.com/?target=https%3A//blog.csdn.net/jvyiming1988/article/details/8315456)** ， **[代码参考2](https://link.zhihu.com/

## Key Points

### 1. 1\. 思路
平时CPU读取数据时会从cache或者内存中读取数据。如果想单纯从内存中读取数据，那么需要把cache关闭。然后从内存中顺序读取数组。读取速率bandwidth、数组大小arraysize、读取时间time之间的计算公式如下：

### 2. 2\. 关闭cache
首先在Linux系统下关闭cache，使用如下代码将cache关闭。（ **[代码参考1](https://link.zhihu.com/?target=https%3A//blog.csdn.net/jvyiming1988/article/details/8315456)** ， **[代码参考2](https://link.zhihu.com/?target=https%3A//stacko

### 3. 3\. 开始测试bandwidth
在关闭cache的情况下使用下面代码测试bandwidth ```c // 测试读取BIG_ARR一共需要多长时间，然后计算出bandwidth int main() { int *block = (int *)calloc(BIG_ARR, sizeof(int));

### 4. 4\. 启用cache
实际上将关闭cache载入kernel module的模块卸载就可以了，用下面的指令 ``` $ rmmod disableCache.ko $ dmesg ``` 在系统输出的log的中可以看到如下输出，说明已经将cache启用。

## Evidence

- Source: [原始文章](raw/tech/bsp/测试内存读取速率.md) [[../../raw/tech/bsp/测试内存读取速率.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/测试内存读取速率.md) [[../../raw/tech/bsp/测试内存读取速率.md|原始文章]]
