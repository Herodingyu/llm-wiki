---
doc_id: src-什么是安全启动-这是物联网安全的起点
title: 什么是安全启动？这是物联网安全的起点
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/什么是安全启动？这是物联网安全的起点.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

大家好！我是不知名的 [安全工程师](https://zhida.zhihu.com/search?content_id=234596664&content_type=Article&match_order=1&q=%E5%AE%89%E5%85%A8%E5%B7%A5%E7%A8%8B%E5%B8%88&zhida_source=entity) Hkcoco！ 欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco 获取更多精彩内容哦！！！

## Key Points

### 1. 什么是安全启动？
安全启动是指在授权在启动过程中使用操作系统启动镜像和代码之前，根据硬件对其进行身份验证的过程。硬件已预先配置为使用受信任的安全凭据对代码进行身份验证。 换句话说， **安全启动确保启动技术和 [操作系统软件](https://zhida.zhihu.com/search?content_id=234596664&content_type=Article&match_order=1&q=%E6%93

### 2. 为什么安全启动很重要？
安全启动对于防止对手破坏 [操作系统](https://zhida.zhihu.com/search?content_id=234596664&content_type=Article&match_order=3&q=%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F&zhida_source=entity) 或在物联网设备中安装不同的启动程序至关重要。

### 3. 它是如何工作的？
安全启动过程要经过一系列步骤，以确保安装的完整性和真实性，从而使设备正确、安全地运行。这些步骤如下图所示： ![](https://pic4.zhimg.com/v2-2c88e8e5aedb26174c16ae76046f3d17_1440w.jpg)

### 4. 安全启动挑战
**安全启动过程的基础是与用于创建唯一设备标识证书的设备相关联的根密钥** 。 - 在设备供应期间，应使用设备上 [密钥生成](https://zhida.zhihu.com/search?content_id=234596664&content_type=Article&match_order=1&q=%E5%AF%86%E9%92%A5%E7%94%9F%E6%88%90&zhida_sour

### 5. 实施安全启动的最佳实践
为了保护您的安全启动过程，从而保护您的设备，建议遵循以下最佳做法

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/什么是安全启动？这是物联网安全的起点.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/什么是安全启动？这是物联网安全的起点.md|原始文章]]

## Key Quotes

> "联网物联网设备可以在现代数字生活的各个方面找到"

> "需要优先考虑物联网嵌入式设备的安全性，这对于数据和服务的完整性和可靠性至关重要。"

> "我们需要确保这种信任的根源确实是值得信赖的，以最大限度地减少潜在的攻击及其后果。"

> "启动加载程序可执行文件的验证是使用公钥/私钥完成的"

> "总之，设备启动过程是由受信任的启动加载程序文件启动的，只有在验证了前一阶段的真实性并成功启动后，才能运行每个阶段。"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/什么是安全启动？这是物联网安全的起点.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/什么是安全启动？这是物联网安全的起点.md|原始文章]]
