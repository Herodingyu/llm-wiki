---
doc_id: src-atf入门-3bl1启动流程分析
title: ATF入门 3BL1启动流程分析
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/ATF入门-3BL1启动流程分析.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181) 5 人赞同了该文章 ![](https://pic1.zhimg.com/v2-9975f1f6c4dba9407522814e94b7c21e_1440w.jpg)

## Key Points

### 1. 1\. BL1主要功能
![](https://pica.zhimg.com/v2-bf0162d45c7b6c92bcac8238971bc7a6_1440w.jpg) BL1就是 **[bootrom](https://zhida.zhihu.com/search?content_id=272874444&content_type=Article&match_order=1&q=bootrom&zhida_sourc

### 2. 2\. 代码分析
![](https://pic1.zhimg.com/v2-3220f4c648e9582486bffa0ed1d150b4_1440w.jpg)

### 3. 2.1 BL1代码初探
![](https://pic4.zhimg.com/v2-486a9f2704ac2c462f6c55fdc2984567_1440w.jpg) ![](https://pic2.zhimg.com/v2-0b840d0f9ad8e2ad1868ad66bbcb587f_1440w.jpg)

### 4. 2.2 el3\_entrypoint\_common
el3\_entrypoint\_common函数的实现是 **汇编语言** ，在include/arch/aarch64/el3\_common\_macros.S中定义，参数定义如下： - **\_init\_sctlr** ：初始化异常等级的控制寄存器

### 5. 2.2.1 EL3异常等级的控制寄存器
``` .if _init_sctlr mov_imm    x0, (SCTLR_RESET_VAL & ~(SCTLR_EE_BIT | SCTLR_WXN_BIT \ | SCTLR_SA_BIT | SCTLR_A_BIT | SCTLR_DSSBS_BIT))

## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/ATF入门-3BL1启动流程分析.md) [[../../raw/tech/bsp/芯片底软及固件/ATF入门-3BL1启动流程分析.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/ATF入门-3BL1启动流程分析.md) [[../../raw/tech/bsp/芯片底软及固件/ATF入门-3BL1启动流程分析.md|原始文章]]
