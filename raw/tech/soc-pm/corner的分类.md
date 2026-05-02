---
title: "corner的分类"
source: "https://zhuanlan.zhihu.com/p/147502328"
author:
  - "[[白话IC公众号同名]]"
published:
created: 2026-05-02
description: "Corner可以分为对晶体管的偏差建模的PVT corner，以及对互联线偏差建模的RC Corner。 PVT Corner用于描述晶体管的全局工艺偏差。 RC Corner 用于描述互联线工艺偏差。 PVT corner PVT corner需要覆盖全局工艺偏差…"
tags:
  - "clippings"
---
[收录于 · IC物理设计专栏](https://www.zhihu.com/column/c_1264992427053891584)

36 人赞同了该文章

> Corner可以分为对晶体管的偏差建模的 [PVT corner](https://zhida.zhihu.com/search?content_id=120911189&content_type=Article&match_order=1&q=PVT+corner&zhida_source=entity) ，以及对互联线偏差建模的 [RC Corner](https://zhida.zhihu.com/search?content_id=120911189&content_type=Article&match_order=1&q=RC+Corner&zhida_source=entity) 。  
>   
> PVT Corner用于描述晶体管的全局工艺偏差。 RC Corner 用于描述互联线工艺偏差。

## PVT corner

PVT corner需要覆盖全局工艺偏差，温度偏差以及电压偏差。

### process corner

Lot 与 Lot 之间, Wafer Wafer之间, Die 和 Die之间的工艺的偏差都是全局工艺偏差。

全局工艺偏差的差别远大于局部工艺偏差的影响（local process variation）

由于全局工艺偏差的存在，导致 [CMOS](https://zhida.zhihu.com/search?content_id=120911189&content_type=Article&match_order=1&q=CMOS&zhida_source=entity) 的速度有的快，有的慢。从而导致芯片有快有慢。

Process corner被用于对全局工艺偏差进行建模。

由于全局工艺偏差对CMOS中NMOS， PMOS的影响有所不同，因此按照晶体管的速度，可以分为以下五种process corner：

其中常用于进行时序签收的corner为SS FF。

比较先进工艺中，foundary会提供排除local process variation的 [spice model](https://zhida.zhihu.com/search?content_id=120911189&content_type=Article&match_order=1&q=spice+model&zhida_source=entity) ，即SSG FFG等。

![](https://pic4.zhimg.com/v2-aa10540afd616bd0016e784ee846fa8f_1440w.jpg)

### voltage corner

晶体管的速度随着电压的升高而提高。 因此，时序签收时需要考虑极限电压的情况，以保证芯片在整个电压范围能够正常工作。

### temprature corner

温度会影响晶体管的速度。 时序签收时，需要能够保证芯片在设计的整个温度范围能够正常工作。 由于结温与环境温度的差异，需保留足够的设计余量。

## RC Corner

工艺与温度会对芯片内部的互联线以及via的电阻，电容造成影响。 RC Corner用于对互联线的偏差进行建模。

常用的RC Corner Typical Cbest Cworst RCbest RCworst

由于温度对于互联线以及通孔的RC有影响，因此RC Corner也需要考虑到温度的影响。

### 时序签收所用的Corner示例

电压范围：0.72 ~ 0.88 温度范围： -40C ~ 125C

![](https://picx.zhimg.com/v2-d1393705a7e7821f296dab6c7ab72581_1440w.jpg)

### 待续

注：若使用的包含有局部工艺偏差的时序库，则在ocv设置中无需在考虑局部工艺偏差。设计余量的大小需根据实际工作的温度，电压的变化谨慎评估。

更多内容请转至个人公众号“白山头讲IC”

发布于 2020-06-11 10:47[晶体管](https://www.zhihu.com/topic/19587470)[建模](https://www.zhihu.com/topic/19626304)[选择 Kubernetes 管理平台应关注哪些功能特性？](https://zhuanlan.zhihu.com/p/614106060)

[

本文为“Kubernetes 运维管理”系列内容。更多 Kubernetes 部署运维、管理平台选型评估等干货知识，欢迎阅读《IT 基础架构团...

](https://zhuanlan.zhihu.com/p/614106060)