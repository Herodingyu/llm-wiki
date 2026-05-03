---
doc_id: src-secure-boot入门-2fip包加载image流程
title: Secure Boot入门-2：FIP包加载Image流程
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/Secure boot入门-2fip包加载image流程.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, secure-boot, atf, fip, bl1, bl2]
---

## Summary

本文从代码角度深入分析了Secure Boot中FIP（Firmware Image Package）包的加载流程，以ATF中BL1加载BL2为例。文章详细解析了`bl1_load_bl2()`函数的完整调用链：`bl1_plat_get_image_desc` → `bl1_plat_handle_pre_image_load` → `load_auth_image` → `bl1_plat_handle_post_image_load`，以及FIP设备的初始化（`fip_dev_init`）、镜像源获取（`plat_get_image_source`）、FIP文件打开和读取（`fip_file_open`）的具体实现。核心在于理解ATF如何通过IO框架从FIP包中解析并加载经过签名验证的固件镜像。

## Key Points

### 1. FIP 包概述
- **全称**：Firmware Image Package（固件镜像包）
- **作用**：将多个固件镜像（BL2、BL31、BL32、BL33等）打包到一个文件中
- **格式**：包含TOC（Table of Contents）头部和各镜像条目
- **头部标识**：`TOC_HEADER_NAME = 0xAA640001`

### 2. BL1 加载 BL2 流程
```
bl1_load_bl2()
    → bl1_plat_get_image_desc()      // 获取镜像描述
    → bl1_plat_handle_pre_image_load()  // 加载前平台处理
    → load_auth_image()              // 加载并验证镜像
        → plat_get_image_source()    // 获取镜像源
        → io_open() → io_read()      // 打开并读取
        → 验签流程
    → bl1_plat_handle_post_image_load() // 加载后平台处理
```

### 3. 镜像源获取
**`plat_get_image_source()`：**
- 在`plat/qemu/common/qemu_io_storage.c`中实现
- 第一次进入：image id = 0，获取FIP包路径
- 第二次进入：根据具体image id获取对应镜像
- 回退机制：若FIP读取失败，直接从文件系统读取（`get_alt_image_source`）

### 4. FIP 设备初始化与读取
**`fip_dev_init()`：**
- 注册FIP设备到IO框架
- 提供FIP特定的open/read/close接口

**`fip_file_open()`：**
- 验证FIP头部（`is_valid_header`）
- 解析TOC条目，定位指定镜像
- 设置读取偏移和长度

### 5. QEMU 调试实践
- **编译**：`make arm-tf DEBUG=1`
- **运行**：`make -f qemu_v8.mk run-only`
- **常见问题**：FIP包路径未正确配置导致`Firmware Image Package header check failed`
- **解决方案**：建立软连接指向正确的fip.bin路径

### 6. IO 框架调用链
```
plat_get_image_source()
    → policy->check()              // 检查镜像源
    → get_alt_image_source()       // 回退到文件系统
        → open_semihosting()
            → get_io_file_spec()
                → sh_file_spec     // 半主机文件规范
```

## Key Quotes

> "secure boot在arm上需要用到fip包，这里以bl1加载bl2为例，bl2.bin是在fip.bin里面进行打包的。"

> "bl1_load_bl2函数为例进行说明，本篇文章从代码角度，深挖到底，进行分析bl2的加载流程。"

> "FIP包的头校验失败了，最后直接从文件获取了。"

## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/Secure boot入门-2fip包加载image流程.md) [[../../raw/tech/bsp/芯片底软及固件/Secure boot入门-2fip包加载image流程.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/Secure boot入门-2fip包加载image流程.md) [[../../raw/tech/bsp/芯片底软及固件/Secure boot入门-2fip包加载image流程.md|原始文章]]
