---
doc_id: src-arm-trusted-firmware分析
title: arm trusted firmware分析
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/arm-trusted-firmware分析.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · ARM/Linux嵌入式](https://www.zhihu.com/column/c_1892354515245703770) 7 人赞同了该文章 [ARM Trusted Firmware](https://zhida.zhihu.com/search?content_id=248607952&content_type=Article&match_order=1&q=ARM+Trusted+Firmware&zhida_source=entity) 实现了一个可信引导过程，并给操作系统提供运行环境（ [SMC调用服务](https://zhida.zhihu.com/sea

## Key Points

### 1. 概要
[ARM Trusted Firmware](https://zhida.zhihu.com/search?content_id=248607952&content_type=Article&match_order=1&q=ARM+Trusted+Firmware&zhida_source=entity) 实现了一个可信引导过程，并给操作系统提供运行环境（ [SMC调用服务](https://zh

### 2. 安全相关


### 3. auth\_common
此模块主要用于声明一些公共的数据结构，这些数据结构主要用与描述认证的方式 `auth_method_desc_s` 和认证的参数 `auth_param_desc_t` 。 认证参数 `auth_param_desc_t` 是由两个基本结构组成：类型 `auth_param_type_desc_t` 和数据 `auth_param_data_desc_t` 。

### 4. crypto\_mod
此模块主要实现一个框架，并非具体实现。主要用于校验哈希和签名。 此框架主要基于一个结构体，结构体定义如下: ``` typedef struct crypto_lib_desc_s { const char *name;/* 名称， */

### 5. img\_parser\_mod
此模块实现一个框架，并非具体实现。主要用于校验镜像完整性，以及从镜像中提取内容。 镜像被分为以下几种类型 ``` typedef enum img_type_enum { IMG_RAW,   /* Binary image */

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/arm-trusted-firmware分析.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/arm-trusted-firmware分析.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/arm-trusted-firmware分析.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/arm-trusted-firmware分析.md|原始文章]]
