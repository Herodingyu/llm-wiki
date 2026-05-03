---
doc_id: src-io子系统全流程介绍
title: IO子系统全流程介绍
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/IO子系统全流程介绍.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

目录 代码基于 [linux kernel](https://zhida.zhihu.com/search?content_id=209445970&content_type=Article&match_order=1&q=linux+kernel&zhida_source=entity) -5.19-rc5，作为IO子系统的初学者，文章如果有错误，请大家慷慨指出。 kernel的各个子系统互相独立又相互纠缠，这篇文章旨在从系统调用到硬件磁盘给大家简单捋一遍整个io子系统的主线流程。中间涉及系统调用([syscall](https://zhida.zhihu.com/search?conten

## Key Points

### 1. 前言
开篇先引入一个简单的c语言代码 ```c int main() { char buff[128] = {0}; int fd = open("/var/pilgrimtao.txt", O_CREAT|O_RDWR);

### 2. bio机制
常见的磁盘有机械硬盘和固态硬盘两种，机械硬盘是由一个个扇区组成，而固态硬盘由一个个存储页组成，我们统称它们为sector，为了兼容历史，我们规定一个sector为512字节。因此访问磁盘时我们需要两个信息，数据存储的sector位置和连续sector的数目。磁盘需要内存作为缓存以提高访问速度，所以我们需要先申请内存，并确定的page地址和页内偏移。磁盘驱动只有拿到sector位置、sector数目

### 3. folio简介
首先做一个简单科普，如图所示，内存是以page (4k)为单位的 ![](https://pic3.zhimg.com/v2-58538a39bdc737bde8c3e5c2776a2d3a_1440w.png)

### 4. file、mem和disk的映射关系
如sys\_read和sys\_write所表示的那样，kernel给用户营造的视角是一个地址连续的file，用户读取file内容时只需要从偏移地址0的位置一直读到文件结尾，但是实际文件数据存储在mem和disk上却是不连续的。那么他们之间的关系是怎样的呢，我给大家举个例子。

### 5. bio关键信息获取
用户调用syscall时，内核能获取到的信息只有文件fd、文件offset、读写size，如syscall的形参所表示的那样，但是磁盘(disk)并不能识别文件的fd、offset、size，我们需要将它们转化成磁盘能看懂的信息。那么如何将用户层传进来的file fd和file offset转化为folio offset、folio len、sector ID、sector size，并把这些信息

## Evidence

- Source: [原始文章](raw/tech/bsp/IO子系统全流程介绍.md) [[../../raw/tech/bsp/IO子系统全流程介绍.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/IO子系统全流程介绍.md) [[../../raw/tech/bsp/IO子系统全流程介绍.md|原始文章]]
