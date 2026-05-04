---
doc_id: src-深度-gpio和pinctrl子系统的使用-附免费视频
title: insmod  leddrv.ko
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/【深度】GPIO和Pinctrl子系统的使用 (附免费视频).md
domain: tech/peripheral
created: 2026-05-04
updated: 2026-05-04
tags: [peripheral]
---

## Summary

[收录于 · 韦东山嵌入式Linux](https://www.zhihu.com/column/c_118891916) 29 人赞同了该文章 参考文档：

## Key Points

### 1. 作者：韦东山


### 2. GPIO和Pinctrl子系统的使用
参考文档： a. 内核 Documentation\\devicetree\\bindings\\Pinctrl\\ 目录下： Pinctrl-bindings.txt b. 内核 Documentation\\gpio 目录下：

### 3. 1 Pinctrl子系统重要概念


### 4. 1.1 引入
无论是哪种芯片，都有类似下图的结构： ![](https://pic2.zhimg.com/v2-f3632449896964abf37fcb77df34e94f_1440w.jpg) 要想让pinA、B用于GPIO，需要设置 [IOMUX](https://zhida.zhihu.com/search?content_id=113417091&content_type=Article&match

### 5. 1.2 重要概念
从设备树开始学习Pintrl会比较容易。 主要参考文档是：内核Documentation\\devicetree\\bindings\\pinctrl\\pinctrl-bindings.txt 这会涉及2个对象：pin controller、client device。

## Evidence

- Source: [原始文章](raw/tech/peripheral/【深度】GPIO和Pinctrl子系统的使用 (附免费视频).md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/peripheral/【深度】GPIO和Pinctrl子系统的使用 (附免费视频).md)
