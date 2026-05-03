---
doc_id: src-arm-linux-启动时的自解压过程
title: ARM Linux 启动时的自解压过程
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/ARM Linux 启动时的自解压过程.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · Linux内核品读](https://www.zhihu.com/column/c_1287649322201272320) 30 人赞同了该文章 大家好，我是工具人老吴。

## Key Points

### 1. Bootloader
Bootloader，无论是 [RedBoot](https://zhida.zhihu.com/search?content_id=177134406&content_type=Article&match_order=1&q=RedBoot&zhida_source=entity) 、 [U-Boot](https://zhida.zhihu.com/search?content_id=1771

### 2. zImage 的解压
如果使用的是 [压缩内核](https://zhida.zhihu.com/search?content_id=177134406&content_type=Article&match_order=1&q=%E5%8E%8B%E7%BC%A9%E5%86%85%E6%A0%B8&zhida_source=entity) ，则执行开始于 arch/arm/boot/compressed/head.S

### 3. 运行 vmlinux
解压后的内核在符号 stext() 处开始执行，即文本段的开头。这段代码可以在 arch/arm/kernel/head.S 中找到。 这是另一个讨论的主题。但是请注意，此处的代码不会查找附加的设备树！如果要使用附加设备树，则必须使用压缩内核。使用 ATAG 扩充任何设备树也是如此，也必须使用压缩内核映像，因为执行此操作的代码是引导压缩内核的程序集的一部分。

### 4. 具体平台的内核解压
让我们仔细看看高通 APQ8060 的内核解压过程。 首先，你需要启用 CONFIG\_DEBUG\_LL，它使你能够在 UART 控制台上敲出字符，而无需任何高级打印机制的干预。它所做的只是为 UART 和其他代码提供物理地址以轮询以输出字符。需要设置 DEBUG\_UART\_PHYS，以便内核知道 UART I/O 物理地址位于何处。请确保这些定义是正确的。

## Evidence

- Source: [原始文章](raw/tech/bsp/ARM Linux 启动时的自解压过程.md) [[../../raw/tech/bsp/ARM Linux 启动时的自解压过程.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/ARM Linux 启动时的自解压过程.md) [[../../raw/tech/bsp/ARM Linux 启动时的自解压过程.md|原始文章]]
