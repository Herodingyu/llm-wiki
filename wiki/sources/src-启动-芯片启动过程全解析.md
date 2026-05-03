---
doc_id: src-启动-芯片启动过程全解析
title: 【启动】芯片启动过程全解析
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【启动】芯片启动过程全解析.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · ARM/Linux嵌入式](https://www.zhihu.com/column/c_1892354515245703770) LeonardT 等 296 人赞同了该文章 > Hi！早，今天来和你一起聊聊芯片启动过程发生了什么。

## Key Points

### 1. BootLoader是芯片最初运行的代码吗？
**当然不是** ，其实每一块芯片在出厂时都在其内部的ROM中，烧录了它最基础的软件。 CPU 搬运并运行的第一条代码的默认位置，就在ROM的地址空间。所以一切的起始都在硬件上。 以 X86 架构的鼻祖 8086 芯片为例，按下开关的一瞬间，芯片 Reset 引脚 **接收到了电平跳变，在一连串电路的作用下** ，代码段寄存器CS恢复成0XFFFF，指令指针寄存器IP恢复成0X0000， **他们

### 2. 相关阅读推荐：
- **[【系统启动】uboot启动流程源码分析](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyOTY5NzkwNg%3D%3D%26mid%3D2247487672%26idx%3D1%26sn%3Dd3beba32b748ba4df3cb900ecf193f6c%26chksm%3Dfa5c

### 3. 参考资料
- **【系统启动】如云泊\[1\]** - **[【系统启动】uboot启动流程源码分析](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyOTY5NzkwNg%3D%3D%26mid%3D2247487672%26idx%3D1%26sn%3Dd3beba32b748ba4df3cb900ecf

### 4. 推荐观看视频：
- **[【蛋饼嵌入式】我提着鞋带拎自己？嵌入式芯片启动过程全解析，彻底理解bootloader](https://link.zhihu.com/?target=https%3A//www.bilibili.com/video/BV1AN411R7Be/%3Fspm_id_from%3D333.788.recommend_more_video.1%26vd_source%3D8c84f3ba5a3

### 5. 参考资料
\[1\] 【系统启动】如云泊: *[lifeislife.cn/2021/12/1](https://link.zhihu.com/?target=https%3A//lifeislife.cn/2021/12/18/%25E8%258A%25AF%25E7%2589%2587%25E5%2590%25AF%25E5%258A%25A8%25E8%25BF%2587%25E7%25A8%258B

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【启动】芯片启动过程全解析.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【启动】芯片启动过程全解析.md|原始文章]]

## Key Quotes

> "接收到了电平跳变，在一连串电路的作用下"

> "他们组合成 20 位的地址正好等于 ROM 中存放第一条代码的位置。"

> "之后取出这里的指令在跳转到别处。"

> "对于 32 位的芯片，通电后，PC指针寄存器复位至零地址"

> "随后从中断向量表表头的 reset 向量处获取下一个跳转的地址。"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【启动】芯片启动过程全解析.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【启动】芯片启动过程全解析.md|原始文章]]
