---
doc_id: src-uboot入门-5linux启动前夜
title: uboot入门 5linux启动前夜
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/uboot入门-5linux启动前夜.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181) 1 人赞同了该文章 ![](https://pic4.zhimg.com/v2-f5139f4d5ea912a86b4b2a4cf736da01_1440w.jpg)

## Key Points

### 1. 1\. boot过程
![](https://pica.zhimg.com/v2-730151ad5c9b2ae662c2f02be5a3aa08_1440w.jpg)

### 2. 1.1 boot命令
找一个命令定义，可以 **cmd目录** 搜索" **boot**, ",或者熟悉的去cmd目录下直接找，这里在 **cmd/bootm.c** 中 ``` int do_bootd(struct cmd_tbl *cmdtp, int flag, int argc, char *const argv[])

### 3. 1.2 bootm命令
**do\_bootm--》do\_bootm\_states** （在boot/bootm.c中定义）主要流程包括根据镜像头 **获取镜像信息，解压镜像，以及启动操作系统** 。以下为其主要执行流程：

### 4. 1.3 do\_bootm\_linux
![](https://picx.zhimg.com/v2-6ec2302b893861e1f82409c9878e082b_1440w.jpg) **boot\_fn=do\_bootm\_linux** 就是是最终启动 Linux 内核的函数。其调用 **[boot\_prep\_linux](https://zhida.zhihu.com/search?content_id=27299002

### 5. 2\. 镜像基础介绍
uboot主要用于启动操作系统，以armv8架构下的linux为例，其启动时需要包含 **kernel、dtb和rootfs** 三部分。

## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/uboot入门-5linux启动前夜.md) [[../../raw/tech/bsp/芯片底软及固件/uboot入门-5linux启动前夜.md|原始文章]]

## Key Quotes

> "do\_bootm--》do\_bootm\_states"

> "获取镜像信息，解压镜像，以及启动操作系统"

> "根据state的定义执行相关的处理函数"

> "bootm\_os\_get\_boot\_func"

> "boot\_selected\_os"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/uboot入门-5linux启动前夜.md) [[../../raw/tech/bsp/芯片底软及固件/uboot入门-5linux启动前夜.md|原始文章]]
