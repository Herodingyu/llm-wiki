---
doc_id: src-atf入门-2大软件模型和代码编译运行探究
title: define INFO(...)    tf_log(LOG_MARKER_INFO __VA_ARGS__)
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/ATF入门-2大软件模型和代码编译运行探究.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181) 2 人赞同了该文章 ![](https://pic1.zhimg.com/v2-557b865585cf9916e2615338dd66ad7c_1440w.jpg)

## Key Points

### 1. 1\. 大软件模型
本小节周贺贺老师的视频是免费公开的，大家可以自己去看，网址如下： [bilibili.com/cheese/pla](https://link.zhihu.com/?target=https%3A//www.bilibili.com/cheese/play/ep92791%3Fquery_from%3D0%26search_id%3D5894568997539276737%26search_que

### 2. 2\. 编译过程探究


### 3. 2.1 log打印
![](https://pic2.zhimg.com/v2-0b840d0f9ad8e2ad1868ad66bbcb587f_1440w.jpg) > 按照之前的流程运行起来后，首先我们应该做点什么呢？

### 4. 2.2 去掉默认gdb
**make run** 是先编译后运行， **make -f qemu\_v8.mk run-only** 是只运行， 但是默认启动起来后需要在gdb里面输入c才能启动有打印，我们可以去掉输入c。 ![](https://pic3.zhimg.com/v2-95d8c2b557813905e2cedf95af41ce86_1440w.jpg)

### 5. 2.3 只编译atf
make run是 **全编** ，但是比较慢。比如我们只对atf关心，那么来一探究竟吧，在arm/optee/build **/qemu\_v8.mk** 中 ``` 115 TARGET_DEPS := arm-tf buildroot linux optee-os qemu

## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/ATF入门-2大软件模型和代码编译运行探究.md) [[../../raw/tech/bsp/芯片底软及固件/ATF入门-2大软件模型和代码编译运行探究.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/ATF入门-2大软件模型和代码编译运行探究.md) [[../../raw/tech/bsp/芯片底软及固件/ATF入门-2大软件模型和代码编译运行探究.md|原始文章]]
