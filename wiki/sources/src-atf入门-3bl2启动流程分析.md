---
doc_id: src-atf入门-3bl2启动流程分析
title: ifdef BL32_BASE
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/ATF入门-3BL2启动流程分析.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181) 2 人赞同了该文章 ![](https://pic3.zhimg.com/v2-2a557c3a46c4c6fb6a7458e373443f2e_1440w.jpg)

## Key Points

### 1. 1\. BL2简介
![](https://pic3.zhimg.com/v2-bfa8c01176a030550f94d432dc449e20_1440w.jpg) Bl2的启动流程与bl1类似，主要区别是 - bl2的 **初始化** 流程比bl1更简单，

### 2. 2\. 代码分析
![](https://pic2.zhimg.com/v2-cb9447eebedcfcf7e7bcbc9d720f9829_1440w.jpg) - BL2的主要工作就是加载BL3x系列镜像，然后通过 **SMC** 进入BL1进而跳转到BL31运行。

### 3. 2.1 bl2\_entrypoint
bl2/aarch64/ **bl2\_entrypoint.S** 中是s-el1模式对应的代码。 ``` func bl2_entrypoint mov    x20, x0 mov    x21, x1

### 4. 2.1.1 参数保存
bl1虽然定义了x0 – x7寄存器用于向bl2传递参数，但bl2实际使用的 **只有x0 - x3四个寄存器** ，因此其实际传参的数量不能超过四个。在BL2中x0 - x3四个寄存器 **在bl2\_setup函数里面需要用** 。但是之前需要执行其他函数就需要 **先保存下，防止丢失** ，mov x20, x0 就是把x0的值放入x20。

### 5. 2.1.2 异常向量设置
**early\_exceptions** 在common/aarch64/early\_exceptions.S中定义，从其定义可知，bl2捕获到异常后不会对其做实际处理，而只是 **打印出异常相关的信息** ，然后将系统设置为panic状态。

## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/ATF入门-3BL2启动流程分析.md) [[../../raw/tech/bsp/芯片底软及固件/ATF入门-3BL2启动流程分析.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/ATF入门-3BL2启动流程分析.md) [[../../raw/tech/bsp/芯片底软及固件/ATF入门-3BL2启动流程分析.md|原始文章]]
