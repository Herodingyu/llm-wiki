---
doc_id: src-linux驱动之i2c驱动架构
title: Linux驱动之I2C驱动架构
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/Linux驱动之I2C驱动架构.md
domain: tech/peripheral
created: 2026-05-04
updated: 2026-05-04
tags: [peripheral]
---

## Summary

[收录于 · Linux驱动开发](https://www.zhihu.com/column/c_1134495265657528320) 16 人赞同了该文章 **主要由三部分组成：**

## Key Points

### 1. 一、Linux的I2C体系结构
**主要由三部分组成：** **(1) I2C核心** 提供 [I2C控制器](https://zhida.zhihu.com/search?content_id=106323588&content_type=Article&match_order=1&q=I2C%E6%8E%A7%E5%88%B6%E5%99%A8&zhida_source=entity) 和设备驱动的注册和注销方法，I2C通信

### 2. 二、重要的结构体
- **i2c\_adapter** ```c //i2c控制器(适配器) struct i2c_adapter { struct module *owner; unsigned int class;          /* classes to allow probing for */

### 3. 三、API函数
```c //增加/删除i2c_adapter int i2c_add_adapter(struct i2c_adapter *adapter) void i2c_del_adapter(struct i2c_adapter *adap)

### 4. 四、适配器(控制器)驱动
由于I2C控制器通常是在内存上的，所以它本身也连接在platform总线上的，通过platform\_driver和platform\_device的匹配还执行。 **(1) probe()完成如下工作：**

### 5. 五、设备(外设)驱动
i2c\_dirver就是i2c标准总线设备驱动模型中的驱动部分，i2c\_client可理解为i2c总线上挂的外设。 **模板代码：** ```c static struct i2c_driver xxx_driver = {

## Evidence

- Source: [原始文章](raw/tech/peripheral/Linux驱动之I2C驱动架构.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/peripheral/Linux驱动之I2C驱动架构.md)
