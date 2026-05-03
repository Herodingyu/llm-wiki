---
doc_id: src-超详细-uboot驱动开发-三-uboot驱动模型
title: if CONFIG_IS_ENABLED(OF_LIVE)
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/超详细【Uboot驱动开发】（三）Uboot驱动模型.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 超详细【Uboot驱动开发】](https://www.zhihu.com/column/c_1468303841838444544) 186 人赞同了该文章 ![](https://pic1.zhimg.com/v2-3f4caa722a78951f624572edc90f1e54_1440w.jpg)

## Key Points

### 1. 三、Uboot驱动模型
![](https://pic1.zhimg.com/v2-3f4caa722a78951f624572edc90f1e54_1440w.jpg) > 全文耗时一周，精心汇总20000余字，希望对大家有所帮助，感觉可以的点赞，关注，不迷路，后续还有更多干货！

### 2. 3.1、什么是Uboot驱动模型
学过Linux的朋友基本都知道Linux的设备驱动模型，Uboot根据Linux的驱动模型架构，也引入了Uboot的驱动模型（ **driver model ：DM** ）。 **这种驱动模型为驱动的定义和访问接口提供了统一的方法。** 提高了驱动之间的兼容性以及访问的标准型，uboot驱动模型和kernel中的设备驱动模型类似。

### 3. 3.2、为什么要有驱动模型呢
> 无论是Linux还是Uboot，一个新对象的产生必定有其要解决的问题，驱动模型也不例外！ - **提高代码的可重用性** ：为了能够使代码在不同硬件平台，不同体系架构下运行，必须要最大限度的提高代码的可重用性。

### 4. 3.3、如何使用uboot的DM模型
> DM模型的使用，可以通过 [menuconfig](https://zhida.zhihu.com/search?content_id=190519958&content_type=Article&match_order=1&q=menuconfig&zhida_source=entity) 来配置。

### 5. ①：menuconfig配置全局DM模型
``` Device Drivers ->  Generic Driver Options -> Enable Driver Model ``` 通过上面的路径来打开 `Driver Model` 模型，最终配置在`.config` 文件中， `CONFIG_DM=y`

## Evidence

- Source: [原始文章](raw/tech/bsp/超详细【Uboot驱动开发】（三）Uboot驱动模型.md) [[../../raw/tech/bsp/超详细【Uboot驱动开发】（三）Uboot驱动模型.md|原始文章]]

## Key Quotes

> "driver model ：DM"

> "这种驱动模型为驱动的定义和访问接口提供了统一的方法。"

> "上面基本上就是我们的底层代码了，稍微有点绕，但是也不难！我们只需要将宏进行替换就行了！"

> "在这里，我们就把他当作一个设备识别的标志即可！"

> "传参方式：通过命令行或者接口将设备资源信息传递进来，非常灵活。"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/超详细【Uboot驱动开发】（三）Uboot驱动模型.md) [[../../raw/tech/bsp/超详细【Uboot驱动开发】（三）Uboot驱动模型.md|原始文章]]
