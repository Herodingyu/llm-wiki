---
title: "Linux iio 子系统"
source: "https://zhuanlan.zhihu.com/p/476558086"
author:
  - "[[嵌入式系统开发嵌入式工程师，支持一对一付费指导，定制学习路线规划]]"
published:
created: 2026-05-02
description: "工业场合里面也有大量的模拟量和数字量之间的转换，也就是我们常说的 ADC 和 DAC。而且随着手机、物联网、工业物联网和可穿戴设备的爆发，传感器的需求只持续增强。比如手机或者手环里面的加速度计、光传感器、陀…"
tags:
  - "clippings"
---
1 人赞同了该文章

工业场合里面也有大量的 [模拟量](https://zhida.zhihu.com/search?content_id=194032776&content_type=Article&match_order=1&q=%E6%A8%A1%E6%8B%9F%E9%87%8F&zhida_source=entity) 和数字量之间的转换，也就是我们常说的 ADC 和 DAC。而且随着手机、物联网、工业物联网和 [可穿戴设备](https://zhida.zhihu.com/search?content_id=194032776&content_type=Article&match_order=1&q=%E5%8F%AF%E7%A9%BF%E6%88%B4%E8%AE%BE%E5%A4%87&zhida_source=entity) 的爆发，传感器的需求只持续增强。比如手机或者手环里面的加速度计、光传感器、陀螺仪、气压计、 [磁力计](https://zhida.zhihu.com/search?content_id=194032776&content_type=Article&match_order=1&q=%E7%A3%81%E5%8A%9B%E8%AE%A1&zhida_source=entity) 等，这些传感器本质上都是ADC，大家注意查看这些传感器的手册，会发现他们内部都会有个 ADC，传感器对外提供 IIC或者 SPI 接口，SOC 可以通过 IIC 或者 SPI 接口来获取到传感器内部的 ADC 数值，从而得到想要测量的结果。Linux 内核为了管理这些日益增多的 ADC 类传感器，特地推出了 IIO [子系统](https://zhida.zhihu.com/search?content_id=194032776&content_type=Article&match_order=1&q=%E5%AD%90%E7%B3%BB%E7%BB%9F&zhida_source=entity) ，我们学习如何使用 IIO 子系统来编写 ADC 类传感器驱动。

### 1、IIO 子系统简介

IIO 全称是 Industrial I/O，翻译过来就是工业 I/O，大家不要看到“工业”两个字就觉得 IIO 是只用于工业领域的。大家一般在搜索 IIO 子系统的时候，会发现大多数讲的都是 ADC，这是因为 IIO 就是为 ADC 类传感器准备的，当然了 DAC 也是可以的。大家常用的陀螺仪、加速度计、电压/ [电流测量](https://zhida.zhihu.com/search?content_id=194032776&content_type=Article&match_order=1&q=%E7%94%B5%E6%B5%81%E6%B5%8B%E9%87%8F&zhida_source=entity) 芯片、光照传感器、 [压力传感器](https://zhida.zhihu.com/search?content_id=194032776&content_type=Article&match_order=1&q=%E5%8E%8B%E5%8A%9B%E4%BC%A0%E6%84%9F%E5%99%A8&zhida_source=entity) 等内部都是有个 ADC，内部 ADC 将原始的模拟 [数据转换](https://zhida.zhihu.com/search?content_id=194032776&content_type=Article&match_order=1&q=%E6%95%B0%E6%8D%AE%E8%BD%AC%E6%8D%A2&zhida_source=entity) 为数字量，然后通过其他的 [通信接口](https://zhida.zhihu.com/search?content_id=194032776&content_type=Article&match_order=1&q=%E9%80%9A%E4%BF%A1%E6%8E%A5%E5%8F%A3&zhida_source=entity) ，比如 IIC、SPI 等传输给 SOC。

因此，当你使用的传感器本质是 ADC 或 DAC 器件的时候，可以优先考虑使用 IIO 驱动框架。

1、iio\_dev 结构体

IIO 子系统使用结构体 iio\_dev 来描述一个具体 IIO 设备，此设备结构体定义在include/linux/iio/iio.h 文件中

2、iio\_dev 申请与释放

在使用之前要先申请 iio\_dev，申请函数为 iio\_device\_alloc， [函数原型](https://zhida.zhihu.com/search?content_id=194032776&content_type=Article&match_order=1&q=%E5%87%BD%E6%95%B0%E5%8E%9F%E5%9E%8B&zhida_source=entity) 如下：

```
struct iio_dev *iio_device_alloc(int sizeof_priv)
```

sizeof\_priv：私有数据内存空间大小，一般我们会将自己定义的设备结构体变量作为 iio\_dev 的私有数据，这样可以直接通过 iio\_device\_alloc 函数同时完成 iio\_dev 和设备结构体变量的内存申请。申请成功以后使用 iio\_priv 函数来得到自定义的设备结构体变量首地址。

返回值：如果申请成功就返回 iio\_dev 首地址，如果失败就返回 NULL。

3、iio\_dev 注册与注销

前面分配好 iio\_dev 以后就要初始化各种成员变量，初始化完成以后就需要将 iio\_dev 注册 到内核中，需要用到 iio\_device\_register 函数

4、iio\_info

iio\_dev 有个成员变量：info，为 iio\_info 结构体指针变量，这个是我们在编写 IIO 驱动的时候需要着重去实现的，因为用户空间对设备的具体操作最终都会反映到 iio\_info 里面。iio\_info结构体定义在 include/linux/iio/iio.h 中

5、iio\_chan\_spec

IIO 的核心就是通道，一个传感器可能有多路数据，比如一个 ADC 芯片支持 8 路采集，那么这个 ADC 就有 8 个通道。Linux 内核使用 iio\_chan\_spec 结构体来描述通道，定义在 include/linux/iio/iio.h 文件中。

### 2、IIO 驱动框架创建

分析 IIO 子系统的时候大家应该看出了，IIO 框架主要用于 ADC 类的传感器，比如陀螺仪、加速度计、磁力计、光强度计等，这些 [传感器](https://zhida.zhihu.com/search?content_id=194032776&content_type=Article&match_order=15&q=%E4%BC%A0%E6%84%9F%E5%99%A8&zhida_source=entity) 基本都是 IIC 或者 SPI 接口的。因此 IIO 驱动的基础框架就是 IIC 或者 SPI，我们可以在 IIC 或 SPI 驱动里面在加上 regmap。当然了，有些 SOC 内部的 ADC 也会使用 IIO 框架，那么这个时候驱动的基础框架就是 platfrom。

IIO 设备的申请、初始化以及注册在 probe 函数中完成，在注销驱动的时候还需要在 remove 函数中注销掉 IIO 设备、释放掉申请的一些内存。

以 SPI 接口为例，demo 如下

```
/* 自定义设备结构体 */
struct xxx_dev { 
 struct spi_device *spi; /* spi 设备 */
 struct regmap *regmap; /* regmap */
 struct regmap_config regmap_config;
 struct mutex lock;
};

/*
* 通道数组
*/
static const struct iio_chan_spec xxx_channels[] = {

};

/*
* @description : 读函数，当读取 sysfs 中的文件的时候最终此函数会执行，
* ：此函数里面会从传感器里面读取各种数据，然后上传给应用。
* @param - indio_dev : IIO 设备
* @param - chan : 通道
* @param - val : 读取的值，如果是小数值的话，val 是整数部分。
* @param - val2 : 读取的值，如果是小数值的话，val2 是小数部分。
* @param - mask : 掩码。
* @return : 0，成功；其他值，错误
*/
static int xxx_read_raw(struct iio_dev *indio_dev,
   struct iio_chan_spec const *chan,
   int *val, int *val2, long mask)
{
 return 0;
} 

/*
* @description : 写函数，当向 sysfs 中的文件写数据的时候最终此函数
* ：会执行，一般在此函数里面设置传感器，比如量程等。
* @param - indio_dev : IIO 设备
* @param - chan : 通道
* @param - val : 应用程序写入值，如果是小数的话，val 是整数部分。
* @param - val2 : 应用程序写入值，如果是小数的话，val2 是小数部分。
* @return : 0，成功；其他值，错误
*/
static int xxx_write_raw(struct iio_dev *indio_dev,
   struct iio_chan_spec const *chan,
   int val, int val2, long mask)
{
 return 0;
}

/*
* @description : 用户空间写数据格式，比如我们在用户空间操作 sysfs 来设
* ：置传感器的分辨率，如果分辨率带小数，那么这个小数传递到
* : 内核空间应该扩大多少倍，此函数就是用来设置这个的。
* @param - indio_dev : iio_dev
* @param - chan : 通道
* @param - mask : 掩码
* @return : 0，成功；其他值，错误
*/
static int xxx_write_raw_get_fmt(struct iio_dev *indio_dev,
   struct iio_chan_spec const *chan, long mask)
{
 return 0;
}

/*
* iio_info 结构体变量
*/
static const struct iio_info xxx_info = {
  .read_raw = xxx_read_raw,
  .write_raw = xxx_write_raw,
  .write_raw_get_fmt = &xxx_write_raw_get_fmt,
};

/*
* @description : spi 驱动的 probe 函数，当驱动与
* 设备匹配以后此函数就会执行
* @param - spi : spi 设备
* 
*/ 
static int xxx_probe(struct spi_device *spi)
{
  int ret;
  struct xxx_dev *data;
  struct iio_dev *indio_dev;

  /* 1、申请 iio_dev 内存 */
  indio_dev = devm_iio_device_alloc(&spi->dev, sizeof(*data));
  if (!indio_dev)
  return -ENOMEM;

  /* 2、获取 xxx_dev 结构体地址 */
  data = iio_priv(indio_dev);
  data->spi = spi;
  spi_set_drvdata(spi, indio_dev);
  mutex_init(&data->lock);

  /* 3、初始化 iio_dev 成员变量 */
  indio_dev->dev.parent = &spi->dev;
  indio_dev->info = &xxx_info;
  indio_dev->name = "xxx";
  indio_dev->modes = INDIO_DIRECT_MODE; /* 直接模式 /
  indio_dev->channels = xxx_channels;
  indio_dev->num_channels = ARRAY_SIZE(xxx_channels);

  iio_device_register(indio_dev);

  /* 4、regmap 相关设置 */

  /* 5、SPI 相关设置*/

  /* 6、芯片初始化 */

  return 0;

}

/*
* @description : spi 驱动的 remove 函数，移除 spi 驱动的时候此函数会执行
* @param - spi : spi 设备
* @return : 0，成功;其他负值,失败
*/
static int xxx_remove(struct spi_device *spi)
{
  struct iio_dev *indio_dev = spi_get_drvdata(spi);
  struct xxx_dev *data;

  data = iio_priv(indio_dev); ;

  /* 1、其他资源的注销以及释放 */

  /* 2、注销 IIO */
  iio_device_unregister(indio_dev);

  return 0;
}
```

### 使能内核 IIO 相关配置

Linux 内核默认使能了 IIO 子系统，但是有一些 IIO 模块没有选择上，这样会导致我们编译 驱动的时候会提示某些 API 函数不存在，需要使能的项目如下：

```
-> Device Drivers 
   -> Industrial I/O support (IIO [=y])
       -> [*]Enable buffer support within IIO //选中
       -> <*>Industrial I/O buffering based on kfifo //选中
```

IIO 驱动框架提供了 [sysfs](https://zhida.zhihu.com/search?content_id=194032776&content_type=Article&match_order=4&q=sysfs&zhida_source=entity) 接口，因此加载成功以后我们可以在用户空间访问对应的 sysfs 目录项，进入目录“/sys/bus/iio/devices/”目录里面，此目录下都是 IIO 框架设备

编辑于 2022-03-06 12:04[本科机械，工作4年 能转行做IC吗？](https://www.zhihu.com/question/596245463/answer/1946230052049105795)

[

2019年我毕业于某文理学院的机械专业，跟芯片可以说是八竿子打不着的关系。毕业后我在一家快消公司做市场专员，每天的工作就是写活动方案、对接渠道、统计销量。做了三年多，每天重复...

](https://www.zhihu.com/question/596245463/answer/1946230052049105795)