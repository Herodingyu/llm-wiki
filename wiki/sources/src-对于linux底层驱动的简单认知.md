---
doc_id: src-对于linux底层驱动的简单认知
title: 对于Linux底层驱动的简单认知
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/对于Linux底层驱动的简单认知.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

1 人赞同了该文章 底层驱动是让设备工作的 **基本程序** ，它给用户提供了一个使用这个设备的接口。就拿树莓派来说，如果我们想要用它的那40Pin中的某个GPIO口，但是那个IO口没有相应的 [驱动程序](https://zhida.zhihu.com/search?content_id=208924122&content_type=Article&match_order=1&q=%E9%A9%B1%E5%8A%A8%E7%A8%8B%E5%BA%8F&zhida_source=entity) 给我们操作，这时，无论如何我们都无法操作IO口，wiringPi库到了最后也是要通过相应的驱动程序

## Key Points

### 1. 一、什么是底层驱动？
底层驱动是让设备工作的 **基本程序** ，它给用户提供了一个使用这个设备的接口。就拿树莓派来说，如果我们想要用它的那40Pin中的某个GPIO口，但是那个IO口没有相应的 [驱动程序](https://zhida.zhihu.com/search?content_id=208924122&content_type=Article&match_order=1&q=%E9%A9%B1%E5%8A%A

### 2. 二、为什么要写驱动？
当系统不提供相应设备的操作库时或没有驱动时，就需要自己编写驱动。树莓派提供了wiringPi库给我们操作IO口。但是如果换到其他的Linux板子上，2440，RK3399,nanoPi等，没有像wiringPi库这样的函数库时，还是要老老实实写驱动，不然就无法操作它的底层设备了。

### 3. 三、怎么写驱动？
在写驱动之前，我首先要了解Linux是怎么调用驱动的，用户应该怎么用驱动。在Linux系统中，一切皆文件，驱动也不例外。

### 4. 1.驱动文件的存放位置
Linux的驱动文件同意放在/dev目录底下，写好的驱动文件在安装时，应该需要安装在/dev目录中。我们在使用驱动时，也是使用/dev底下的驱动文件： ![动图封面](https://pica.zhimg.com/v2-a7f58f150b12809c546cd2ddf55ca3c6_b.jpg)

### 5. 2.驱动的使用及区分方式
一个驱动写好并安装之后，可以使用C库中的 open、write及read来操作，因为设备驱动也是文件嘛，这三个文件操作的函数当然也能操作： （1）open("/dev/xxx",O\_RDWR)函数生成 [文件描述符](https://zhida.zhihu.com/search?content_id=208924122&content_type=Article&match_order=1&q=%

## Evidence

- Source: [原始文章](raw/tech/bsp/对于Linux底层驱动的简单认知.md) [[../../raw/tech/bsp/对于Linux底层驱动的简单认知.md|原始文章]]

## Key Quotes

> "struct file\_operations"

> "file\_operations"

> "MODULE\_LICENSE(“GPL v2”);"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/对于Linux底层驱动的简单认知.md) [[../../raw/tech/bsp/对于Linux底层驱动的简单认知.md|原始文章]]
