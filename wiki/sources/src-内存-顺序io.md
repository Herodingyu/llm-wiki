---
doc_id: src-内存-顺序io
title: 内存  顺序IO
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/内存  顺序IO.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · ARM/Linux嵌入式](https://www.zhihu.com/column/c_1892354515245703770) 2 人赞同了该文章 > Hi! 新年好呀！

## Key Points

### 1. 磁盘原理
磁盘是计算机组成一个重要部分，也是最主要的存储部件。 我们知道内存也可以用于存储数据，而且读写速度非常快，通常比磁盘要快几个数量级，但是内存资源是珍贵而且有限的，通常我们的服务器内存也就是16G，32G。

### 2. 随机IO和顺序IO
PageCache页缓存，是操作系统为了提升磁盘的读写效率，\*\*将一部分内存用来加速文件读写的区域，\*\*如图buffer/cache所占的空间部分就是PageCache所使用（还有部分是BufferCache使用）。

### 3. 预读和回写
**预读** 是指操作系统在将磁盘数据加载到内存中时，通常会将连续的后面几个页的数据也一起加载出来，这样如果后期读取的数据在这些页中，就可以直接从缓存读取，不需要再次从磁盘加载。 > 这个是出于一个原则：当读取一个数据时，很可能会对后续连续的数据进行读取。这个和mysql是类似的，尽管我们只读取一条数据，mysql也会加载一页的数据出来。

### 4. kafka/rocketmq
kafka和rocketmq存储消息都是持久化到磁盘上，它们就是利用磁盘的顺序IO来处理消息的读写，保持高性能。 我们可以看下kafka官网的介绍 ![](https://picx.zhimg.com/v2-24c4b7081829e02c7b9f416b4e4915e9_1440w.jpg)

### 5. 参考
- **[rocketmq while not use FileChannel.write](https://link.zhihu.com/?target=https%3A//github.com/apache/rocketmq/issues/575)**

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/内存  顺序IO.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/内存  顺序IO.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/内存  顺序IO.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/内存  顺序IO.md|原始文章]]
