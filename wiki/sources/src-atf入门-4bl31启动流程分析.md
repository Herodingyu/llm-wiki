---
doc_id: src-atf入门-4bl31启动流程分析
title: ATF入门 4BL31启动流程分析
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/ATF入门-4BL31启动流程分析.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181) 3 人赞同了该文章 ![](https://pica.zhimg.com/v2-8fb77377dee4f5a917058f9b42b8ff6e_1440w.jpg)

## Key Points

### 1. 1\. BL31简介
![](https://pic3.zhimg.com/v2-11899ace58aed142d10f1f035fdd9ab4_1440w.jpg) bl31包含两部分功能， 1. 在启动时作为 **启动流程** 的一部分，执行软硬件初始化以及启动bl32和bl33镜像。

### 2. 2\. 代码分析
![](https://pic1.zhimg.com/v2-af6e4acc71b026727d9b497bb64f755a_1440w.jpg)

### 3. 2.1 bl31\_entrypoint
通过 **bl31.ld.S** 文件可知， bl31的入口函数是： **bl31\_entrypoint** 函数，该函数的内容如下： ``` func bl31_entrypoint /* ---------------------------------------------------------------

### 4. 2.2 bl31\_setup
``` void bl31_setup(u_register_t arg0, u_register_t arg1, u_register_t arg2, u_register_t arg3) { /* Perform early platform-specific setup */

### 5. 2.3 bl31\_main
该函数主要完成必要 **初始化操作** ，配置EL3中的各种smc操作，以便在后续顺利响应在CA和TA中产生的smc操作 ![](https://pic1.zhimg.com/v2-3beb70b63169e373982e16bdae3b75d0_1440w.jpg)

## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/ATF入门-4BL31启动流程分析.md) [[../../raw/tech/bsp/芯片底软及固件/ATF入门-4BL31启动流程分析.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/ATF入门-4BL31启动流程分析.md) [[../../raw/tech/bsp/芯片底软及固件/ATF入门-4BL31启动流程分析.md|原始文章]]
