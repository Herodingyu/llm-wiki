---
doc_id: src-secure-boot入门-2fip包加载image流程
title: Secure boot入门 2fip包加载image流程
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/Secure boot入门-2fip包加载image流程.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181) 2 人赞同了该文章 ![](https://pic2.zhimg.com/v2-f66668d2679f713b8ccd881c454398b3_1440w.jpg)

## Key Points

### 1. 1 使用fip.bin代码修改
``` make arm-tf DEBUG=1 make -f qemu_v8.mk run-only ``` **代码下载运行不再详述了。** **修改atf** 的代码后，执行上面的命令就可以 **运行** 起来。但是里面有这个打印：

### 2. 2\. bl1\_load\_bl2过程函数解析
![](https://pic1.zhimg.com/v2-170eeb17b4e7657ab750cf75c7bf893a_1440w.jpg)

### 3. 2.1 bl1\_load\_bl2
``` bl1_load_bl2 bl1_plat_get_image_desc bl1_plat_handle_pre_image_load load_auth_image bl1_plat_handle_post_image_load

### 4. 2.2 fip\_dev\_init读取fip
``` fip_dev_init plat_get_image_source io_open io_read io_close ``` **plat\_get\_image\_source** ()在plat/qemu/common/qemu\_io\_storage.c中实现,这时候是第二次进入这个函数了,这次的image id是 **0**,对应的policy是

### 5. 2.3 从fip读取bl2.bin
io\_open--》 **fip\_file\_open** ， ``` static int fip_file_open(io_dev_info_t *dev_info, const uintptr_t spec,

## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/Secure boot入门-2fip包加载image流程.md) [[../../raw/tech/bsp/芯片底软及固件/Secure boot入门-2fip包加载image流程.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/Secure boot入门-2fip包加载image流程.md) [[../../raw/tech/bsp/芯片底软及固件/Secure boot入门-2fip包加载image流程.md|原始文章]]
