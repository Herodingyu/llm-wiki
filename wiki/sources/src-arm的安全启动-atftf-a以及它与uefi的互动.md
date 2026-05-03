---
doc_id: src-arm的安全启动-atftf-a以及它与uefi的互动
title: ARM的安全启动—ATFTF A以及它与UEFI的互动
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/ARM的安全启动—ATFTF-A以及它与UEFI的互动.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog) 196 人赞同了该文章 ARM架构的CPU不断地在各个方向对x86体系发动一波又一波的攻击，甚至在传统x86的强势领域——服务器端，性能差距也在不断接近。作为行业风向标的云服务（CSP）厂商，它们的ARM服务器装机量持续攀升。如亚马逊自研的基于 [ARM Neoverse](https://zhida.zhihu.com/search?content_id=175041893&content_type=Article&match_order=1&q=ARM+Neoverse&z

## Key Points

### 1. ATF的由来
TF(Trusted Firmware)是ARM在Armv8引入的安全解决方案，为安全提供了整体解决方案。它包括启动和运行过程中的特权级划分，对Armv7中的TrustZone（TZ）进行了提高，补充了启动过程信任链的传导，细化了运行过程的特权级区间。TF实际有两种Profile，对ARM Profile A的CPU应用TF-A，对ARM Profile M的CPU应用TF-M。我们一般接触的都是

### 2. ATF启动流程
ARM开源了ATF的基本功能模块，大家可以在这里下载： ``` git clone  https://github.com/ARM-software/arm-trusted-firmware.git ```

### 3. 结语
ATF的官网一张图包含了更多的信息： ![](https://pic3.zhimg.com/v2-9501cfb265ec465ad2f8acf977fa47c2_1440w.jpg) 如果你仅仅对ATF的UEFI启动路径感兴趣，下面这张图可能更加简单明了：

### 4. 参考
还没有人送礼物，鼓励一下作者吧 编辑于 2021-07-20 18:55[安全](https://www.zhihu.com/topic/19569215)[ARM 架构](https://www.zhihu.com/topic/19613104)[芯片（集成电路）](https://www.zhihu.com/topic/19583435)[IC设计多个项目推荐，快速积累项目经验？](https

## Evidence

- Source: [原始文章](raw/tech/bsp/ARM的安全启动—ATFTF-A以及它与UEFI的互动.md) [[../../raw/tech/bsp/ARM的安全启动—ATFTF-A以及它与UEFI的互动.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/ARM的安全启动—ATFTF-A以及它与UEFI的互动.md) [[../../raw/tech/bsp/ARM的安全启动—ATFTF-A以及它与UEFI的互动.md|原始文章]]
