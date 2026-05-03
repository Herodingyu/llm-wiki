---
doc_id: src-arm攒机指南-安全篇
title: ARM攒机指南 安全篇
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/ARM攒机指南/ARM攒机指南-安全篇.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · ARM攒机指南](https://www.zhihu.com/column/c_70349842) LogicJitterGibbs、LeonardT 等 93 人赞同了该文章 [Trustzone](https://zhida.zhihu.com/search?content_id=5135919&content_type=Article&match_order=1&q=Trustzone&zhida_source=entity) 可以追溯到十多年前，ARMv7公布的时候就有了，可惜一直没有什么实际应用。直到近几年开始，才真正的有厂商开始把这个方案大规模用于芯片里。它的基本设计

## Key Points

- (To be summarized)

## Evidence

- Source: [原始文章](raw/tech/soc-pm/ARM攒机指南/ARM攒机指南-安全篇.md) [[../../raw/tech/soc-pm/ARM攒机指南/ARM攒机指南-安全篇.md|原始文章]]

## Key Quotes

> "同样是在手机上，最新的安卓7.0要求必须对关键数据进行保护，包括密钥，指纹等信息。虽然谷歌并没有明确必须用硬件来做防护，但是他对于基于软件虚拟机等方案是持保留态度的。所以要上新版本安卓的小伙伴们千万要注意提早规划，绕过这个坑"

> "纵观以上各个领域，Trustzone做了很多在设备端的硬件安全保护，但请注意，Trustzone并不是一个服务器和客户端的完整交互方案，也没有规定密钥的交互规范，对于支付和DRM，还是需要应用层来共同解决"

> "接下来让我们从技术层面来定义Trustzone到底能做什么：

1.防止操作系统被攻破后关键数据泄密，关键数据存放在特定内存区域，而那块区域，只有安全操作系统才有可能读到"

> "首先，按照Trustzone的划分，一个芯片内被划分为安全世界和非安全世界。上图中，中间黑色的部分是总线，总线上面是主设备，下面是从设备（主设备中的缓存是例外，这个以后说）。读写请求总是从主设备发往从设备的"

> "至此，从设备就分析完了，是不是感觉特别简单？还有些细节，在把主设备也讲完后，我们会从系统角度来关注"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/ARM攒机指南/ARM攒机指南-安全篇.md) [[../../raw/tech/soc-pm/ARM攒机指南/ARM攒机指南-安全篇.md|原始文章]]
