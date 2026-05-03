---
doc_id: src-uboot入门-6移植要点
title: uboot入门 6移植要点
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/uboot入门-6移植要点.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181) 2 人赞同了该文章 ![](https://picx.zhimg.com/v2-2099b7695777c898a41cbb689089ed41_1440w.jpg)

## Key Points

### 1. 1\. u-boot 移植要点
![](https://pica.zhimg.com/v2-3b17e89018eae65c9f29801885ebea08_1440w.jpg) **芯片公司、开发板厂家和用户** 之间联系： 1. **芯片公司** 移植的 u-boot 从一开始是基于官方的 u-boot 拿来修改，添加/修改自家的 [EVK 评估版](https://zhida.zhihu.com/search?conten

### 2. 2\. 移植修改
![](https://pic3.zhimg.com/v2-6345bb7531e6fb4823bb6c435a282a66_1440w.jpg)

### 3. 2.1 uboot代码框架
移植uboot前需要了解下uboot的代码框架，好知道修改那些代码。 ![](https://pic1.zhimg.com/v2-a02b6401e8e876843d8054fdeb16a470_1440w.jpg)

### 4. 2.2 添加board的基本步骤
当我们开始一个全新的项目时，总是希望能先让系统能运行起来，然后再在此基础上为其添加更多的feature，这个只包含能让系统运行所需模块的系统，叫做 **最小系统** 。cpu能正常运行包含以下几个条件：

### 5. 2.3 添加自己的开发板


## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/uboot入门-6移植要点.md) [[../../raw/tech/bsp/芯片底软及固件/uboot入门-6移植要点.md|原始文章]]

## Key Quotes

> "芯片是别人的，跟业务相关的底板是自己的"

> "添加Kconfig配置选项和Makefile编译选项"

> "头文件和编译所需的defconfig"

> "串口、NAND、EMMC 或 SD 卡、网络和 LCD 驱动"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/uboot入门-6移植要点.md) [[../../raw/tech/bsp/芯片底软及固件/uboot入门-6移植要点.md|原始文章]]
