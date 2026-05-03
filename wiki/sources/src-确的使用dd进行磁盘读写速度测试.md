---
doc_id: src-确的使用dd进行磁盘读写速度测试
title: 确的使用dd进行磁盘读写速度测试
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/确的使用dd进行磁盘读写速度测试.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

6 人赞同了该文章 本文抄袭至： [正确的使用dd进行磁盘读写速度测试 - 赵磊的技术博客 - ITeye博客](https://link.zhihu.com/?target=http%3A//elf8848.iteye.com/blog/2089055) 一般情况下，我们都是使用 [dd命令](https://zhida.zhihu.com/search?content_id=4700706&content_type=Article&match_order=1&q=dd%E5%91%BD%E4%BB%A4&zhida_source=entity) 创建一个大文件来测试磁盘的读写速度。但是，很

## Key Points

- (To be summarized)

## Evidence

- Source: [原始文章](raw/tech/bsp/确的使用dd进行磁盘读写速度测试.md) [[../../raw/tech/bsp/确的使用dd进行磁盘读写速度测试.md|原始文章]]

## Key Quotes

> "dd if=/dev/zero of=/xiaohan/test.iso bs=1024M count=1;sync

这种情况下测试显示的跟上一种情况是一样的，两个命令是先后执行的，当sync开始执行的时候，dd命令已经将速度信息打印到了屏幕上，仍然无法显示从内存写硬盘时的真正速度"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/确的使用dd进行磁盘读写速度测试.md) [[../../raw/tech/bsp/确的使用dd进行磁盘读写速度测试.md|原始文章]]
