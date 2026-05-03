---
doc_id: src-对抗内存物理读取攻击的利器-intel-tme和amd-sme
title: 对抗内存物理读取攻击的利器：Intel TME和AMD SME
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/对抗内存物理读取攻击的利器：Intel TME和AMD SME.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog) 146 人赞同了该文章 目录

## Key Points

### 1. TME和SME
ColdBoot的物理攻击对信息系统的威胁是紧迫的。彼时，Intel已经有了 [SGX](https://zhida.zhihu.com/search?content_id=183474908&content_type=Article&match_order=1&q=SGX&zhida_source=entity) (Software Guard eXtensions)技术，它的安全enclave

### 2. TME是怎么工作的？性能如何？
TME名字中的Total Memory就明示了它是一种全部内存加密技术。这个IP嵌入在内存控制器中，在内存写入时加密，在内存读取时解密，因此它是一种软件全透明的内存加密方案。 CPU **每次** 在启动时，都会随机生成NIST标准的 [AES-XTS](https://zhida.zhihu.com/search?content_id=183474908&content_type=Article

### 3. 结束后的思考题
TME集成在内存控制器中，这让它不但能够加密普通内存，也可以用在Intel的非易失内存上（ [傲腾](https://zhida.zhihu.com/search?content_id=183474908&content_type=Article&match_order=1&q=%E5%82%B2%E8%85%BE&zhida_source=entity) ）。TME加密的颗粒度太粗，防止了Col

### 4. 参考
1. Intel MKTME文档 [https://www.intel.com/content/dam/develop/external/us/en/documents-tps/multi-key-total-memory-encryption-spec.pdf](https://www.intel.com/content/dam/develop/external/us/en/documents-

## Evidence

- Source: [原始文章](raw/tech/dram/对抗内存物理读取攻击的利器：Intel TME和AMD SME.md) [[../../raw/tech/dram/对抗内存物理读取攻击的利器：Intel TME和AMD SME.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/对抗内存物理读取攻击的利器：Intel TME和AMD SME.md) [[../../raw/tech/dram/对抗内存物理读取攻击的利器：Intel TME和AMD SME.md|原始文章]]
