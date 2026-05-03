---
doc_id: src-uboot入门-2makefile和编译
title: Use sed to remove leading zeros from PATCHLEVEL to avoid using octal numbers
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/uboot入门-2Makefile和编译.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181) 4 人赞同了该文章 ![](https://pic2.zhimg.com/v2-ab04ee1be465cf3d2f8127296128e807_1440w.jpg)

## Key Points

### 1. 1\. 顶层Makefile
顶层也就是 [uboot](https://zhida.zhihu.com/search?content_id=272874848&content_type=Article&match_order=1&q=uboot&zhida_source=entity) 代码根目录下的 **Makefile** 。顶层Makefile会再去调用子目录里面的Makefile递归执行，其是一个 **树状结构**

### 2. 1.1 版本号：
![](https://pic1.zhimg.com/v2-ca2653fdfa165646bacccd781ab09c3c_1440w.jpg) 那么这个 **版本号** 怎么最后运行的时候被 **打印出来** 了。 **是时候展现下真正的技术了** ，在顶层Makefile中：

### 3. 1.2 编译命令
``` help: @echo  'Cleaning targets:' @echo  '  clean          - Remove most generated files but keep the config'

### 4. 1.3 编译相关
描述递归执行子目录的makefile进行编译，可以自己用 **AI解释** 下这个代码的含义 ``` MAKEFLAGS += --include-dir=$(CURDIR) ``` 获取 **Host主机** 的架构和系统

### 5. 2\. make过程分析


## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/uboot入门-2Makefile和编译.md) [[../../raw/tech/bsp/芯片底软及固件/uboot入门-2Makefile和编译.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/uboot入门-2Makefile和编译.md) [[../../raw/tech/bsp/芯片底软及固件/uboot入门-2Makefile和编译.md|原始文章]]
