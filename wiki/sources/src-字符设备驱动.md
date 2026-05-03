---
doc_id: src-字符设备驱动
title: 字符设备驱动
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/字符设备驱动.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · Linux驱动开发](https://www.zhihu.com/column/c_1134495265657528320) 4 人赞同了该文章 在Linux内核中， 使用cdev结构体来描述一个字符设备。

## Key Points

### 1. 一、字符设备结构体(cdev)
在Linux内核中， 使用cdev结构体来描述一个字符设备。 ```c struct cdev { struct kobject kobj; //内嵌的kobject对象 struct module *owner;//所属模块

### 2. 二、字符设备API
分配和释放设备号 ```c /* 函数功能：分配一些设备号 参数说明: from:起始设备号，必须要包含主设备号 count: 连续分配的数量 name: 设备或驱动的名称 */ int register_chrdev_region(dev_t from, unsigned count, const char *name)

### 3. 三、字符设备的驱动架构
**(1) 为设备定义一个设备相关的 [结构体](https://zhida.zhihu.com/search?content_id=104568419&content_type=Article&match_order=12&q=%E7%BB%93%E6%9E%84%E4%BD%93&zhida_source=entity) (包含设备所涉及的cdev,私有数据及锁等信息)**

### 4. 四、简化字符设备驱动架构
每次编写初始化函数都要一步一步写，为了简化这个流程，Linux提供了一些封装的 [接口函数](https://zhida.zhihu.com/search?content_id=104568419&content_type=Article&match_order=1&q=%E6%8E%A5%E5%8F%A3%E5%87%BD%E6%95%B0&zhida_source=entity) 来让我们调用

### 5. 五、其他API
下面是一些平时编写字符设备驱动时可能会用到的API: ```c //创建一个类,在sys/class/目录下创建一个类 ({                        \ static struct lock_class_key __key;    \

## Evidence

- Source: [原始文章](raw/tech/bsp/字符设备驱动.md) [[../../raw/tech/bsp/字符设备驱动.md|原始文章]]

## Key Quotes

> "register\_chrdev\_region()和alloc\_chrdev\_region()的区别："

> "(2) 初始化函数xxx\_init的定义"

> "(3) 卸载函数xxx\_exit的定义"

> "(4) 定义file\_operations"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/字符设备驱动.md) [[../../raw/tech/bsp/字符设备驱动.md|原始文章]]
