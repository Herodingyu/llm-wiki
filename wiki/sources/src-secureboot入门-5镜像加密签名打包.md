---
doc_id: src-secureboot入门-5镜像加密签名打包
title: By default BL31 encryption disabled
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/secureboot入门-5镜像加密签名打包.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181) 3 人赞同了该文章 ![](https://pic2.zhimg.com/v2-ab2f8b95f97bfce4fe73dfa70774690f_1440w.jpg)

## Key Points

### 1. 1\. 编译


### 2. 1.1 Secure Boot编译选项
docs/plat/qemu.rst中说明如果使 **能安全启动** 则使用如下 **编译选项** ： ``` Or, alternatively, to build with TBBR enabled, as well as, BL31 and BL32 encrypted with

### 3. 2\. 证书介绍
- nt\_fw\_content.crt： **BL33** 内容证书 - nt\_fw\_key.crt： **BL33** 密钥证书 - soc\_fw\_content.crt： **BL31** 内容证书

### 4. 根证书tb\_fw.crt
``` static const auth_img_desc_t * const cot_desc[] = { [TRUSTED_BOOT_FW_CERT_ID]        =    &trusted_boot_fw_cert,

### 5. 3\. 镜像加密
镜像加密一般使用 **对称加密技术** ，因为镜像比较大，不像hash值可以进行非对称加密。加密工具为 **encrypt\_fw**,一般使用 **AES** 加密技术。

## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/secureboot入门-5镜像加密签名打包.md) [[../../raw/tech/bsp/芯片底软及固件/secureboot入门-5镜像加密签名打包.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/secureboot入门-5镜像加密签名打包.md) [[../../raw/tech/bsp/芯片底软及固件/secureboot入门-5镜像加密签名打包.md|原始文章]]
