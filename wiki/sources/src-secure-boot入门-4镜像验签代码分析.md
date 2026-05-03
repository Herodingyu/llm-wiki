---
doc_id: src-secure-boot入门-4镜像验签代码分析
title: Secure boot入门 4镜像验签代码分析
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/Secure boot入门-4镜像验签代码分析.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181) 1 人赞同了该文章 ![](https://pic2.zhimg.com/v2-1396f675711e58de1bf20ef86a9b7fc1_1440w.jpg)

## Key Points

### 1. 1\. 整体流程
![](https://pic3.zhimg.com/v2-9898e3c167d4ffdc288c77fe534f2858_1440w.jpg) ATF的安全启动按照ARM **TBBR规范** 要求进行实现，为了防止 **恶意固件** 在平台上运行，受信任的板级引导 (TBB) 功能要求验证所有固件镜像（包括普通世界的引导加载程序），这通过使用 **公钥密码** 标准 ([PKCS](http

### 2. 2\. BL2加载验签初始化流程
参考BL1中代码分析 [ATF入门-3BL1启动流程分析](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485541%26idx%3D1%26sn%3D0559cfb8d912ea03df6d0ba43744079f%26chksm%3Df

### 3. 2.1 加密库初始化
![](https://pic3.zhimg.com/v2-c18fcbae3c41cc4c984c1d931275cc72_1440w.jpg) **crypto\_mod\_init** （）在drivers/auth/crypto\_mod.c中定义

### 4. 2.2 IPL镜像解析库初始化
**auth\_mod\_init** ();--》img\_parser\_init() ``` void img_parser_init(void) { parser_lib_descs = (img_parser_lib_desc_t *) PARSER_LIB_DESCS_START;

### 5. 2.3 bl1\_load\_bl2
参考： [Secure boot入门-2fip包加载image流程](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485733%26idx%3D1%26sn%3D762529eefa0bb7fcc1a2e65ccb6f821c%26chks

## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/Secure boot入门-4镜像验签代码分析.md) [[../../raw/tech/bsp/芯片底软及固件/Secure boot入门-4镜像验签代码分析.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/Secure boot入门-4镜像验签代码分析.md) [[../../raw/tech/bsp/芯片底软及固件/Secure boot入门-4镜像验签代码分析.md|原始文章]]
