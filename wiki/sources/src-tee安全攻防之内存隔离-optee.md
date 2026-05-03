---
doc_id: src-tee安全攻防之内存隔离-optee
title: TEE安全攻防之内存隔离 【OPTEE】
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/TEE安全攻防之内存隔离-【OPTEE】.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

大家好！我是不知名的 [安全工程师](https://zhida.zhihu.com/search?content_id=233483764&content_type=Article&match_order=1&q=%E5%AE%89%E5%85%A8%E5%B7%A5%E7%A8%8B%E5%B8%88&zhida_source=entity) Hkcoco！ 欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco 获取更多精彩内容哦！！！

## Key Points

### 1. 前言
众所周知，Normal World的 **用户态与 [内核态](https://zhida.zhihu.com/search?content_id=233483764&content_type=Article&match_order=1&q=%E5%86%85%E6%A0%B8%E6%80%81&zhida_source=entity) 的地址空间隔离是基于MMU分页来实现的** ，那么Norma

### 2. 硬件隔离机制
阅读ARM TrustZone手册可知，内存的隔离是由TZASC(TrustZone Address Space Controller)来控制 ， **TZASC可以把外部DDR分成多个区域** ，每个区域可以单独配置为安全区域或非安全区域 ，Normal World的代码只能访问非安全区域。

### 3. CODE-TEEOS内存管理
下面结合 [【OP-TEE代码】](https://link.zhihu.com/?target=https%3A//www.anquanke.com/post/id/231029) 对配置 TZASC进行分析：

### 4. CODE-TEEOS内存管理
core/arch/arm/kernel/entry\_a64.S [【TEE OS启动时会调用core\_init\_mmu\_map对安全内存地址空间进行映射 ：】](https://link.zhihu.com/?target=https%3A//github.com/OP-TEE/optee_os/blob/master/core/arch/arm/kernel/entry_a64.S)

### 5. CODE-安全侧地址校验
下面以符合GP规范的TEE接口为例，简单介绍下CA和TA的通信流程： ![](https://pic3.zhimg.com/v2-0e6bc81a2ea98811c7c268594df3b642_1440w.jpg)

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/TEE安全攻防之内存隔离-【OPTEE】.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/TEE安全攻防之内存隔离-【OPTEE】.md|原始文章]]

## Key Quotes

> "TZASC可以把外部DDR分成多个区域"

> "tzc\_configure\_region"

> "imx\_configure\_tzasc"

> "CFG\_TZDRAM\_START"

> "CFG\_TZDRAM\_SIZE"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/TEE安全攻防之内存隔离-【OPTEE】.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/TEE安全攻防之内存隔离-【OPTEE】.md|原始文章]]
