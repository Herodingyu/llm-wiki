---
doc_id: src-atf入门-1qmeu搭建arm全套源码学习环境
title: 或者，将编译输出重定向到log中，方便编译出问题了定位
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/ATF入门-1qmeu搭建ARM全套源码学习环境.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181) 4 人赞同了该文章 ![](https://pic1.zhimg.com/v2-d5c63189472111947a4b04b75af39714_1440w.jpg)

## Key Points

### 1. 1\. 源码下载编译运行
![](https://pic3.zhimg.com/v2-d008bb645ebba81e1b1a31a5e8750018_1440w.jpg)

### 2. 1.1 源码下载
``` mkdir -p optee cd optee repo init -u https://github.com/OP-TEE/manifest.git -m qemu_v8.xml repo sync -j4 --no-clone-bundle

### 3. 1.2 源码编译
首先需要安装 **编译依赖的工具** ： ``` $ sudo dpkg --add-architecture i386 $ sudo apt-get update $ sudo apt-get install android-tools-adb android-tools-fastboot autoconf \

### 4. 1.3 源码运行
``` $ cd ~/optee/build $ make run 指定版本运行 $ make -f qemu_v8.mk run-only ``` ![](https://pic1.zhimg.com/v2-5191aaad5898dbc45154aff9de92394c_1440w.jpg)

### 5. 2\. 前情回顾
主要回顾下之前ATF文章： [ARM ATF入门-安全固件软件介绍和代码运行](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247484384%26idx%3D1%26sn%3Dc6a2c66b967a28f8f46430263bad7df6%2

## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/ATF入门-1qmeu搭建ARM全套源码学习环境.md) [[../../raw/tech/bsp/芯片底软及固件/ATF入门-1qmeu搭建ARM全套源码学习环境.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/ATF入门-1qmeu搭建ARM全套源码学习环境.md) [[../../raw/tech/bsp/芯片底软及固件/ATF入门-1qmeu搭建ARM全套源码学习环境.md|原始文章]]
