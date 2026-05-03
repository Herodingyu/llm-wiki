---
title: "电源管理入门-4子系统reset"
source: "https://zhuanlan.zhihu.com/p/2022263163488405063"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "之前的文章电源管理入门-1关机重启详解介绍了整机SoC的重启也可以说是reset，那么子系统的reset，例如某个驱动（网卡、USB等）或者某个子系统（NPU、ISP等运行在独立的M核或者R核上的AI系统），这些零碎模块的rese…"
tags:
  - "clippings"
---
[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679)

2 人赞同了该文章

![](https://pic2.zhimg.com/v2-6a294be9bb3215fa02aace442eef7c8d_1440w.jpg)

之前的文章电源管理入门-1关机重启详解介绍了整机SoC的重启也可以说是reset，那么子系统的reset，例如某个驱动（网卡、USB等）或者某个子系统（NPU、ISP等运行在独立的M核或者R核上的AI系统），这些零碎模块的reset就需要用另外一种机制，Linux提供了 [reset framework](https://zhida.zhihu.com/search?content_id=272281338&content_type=Article&match_order=1&q=reset+framework&zhida_source=entity) 框架，我们可以使用这个框架对子系统reset，然后操作硬件 [CRU寄存器](https://zhida.zhihu.com/search?content_id=272281338&content_type=Article&match_order=1&q=CRU%E5%AF%84%E5%AD%98%E5%99%A8&zhida_source=entity) 进行硬件的reset操作。

> 考虑到安全的因素对CRU寄存器的操作可以放在：  
> [ATF](https://zhida.zhihu.com/search?content_id=272281338&content_type=Article&match_order=1&q=ATF&zhida_source=entity) 里面的 [BL31](https://zhida.zhihu.com/search?content_id=272281338&content_type=Article&match_order=1&q=BL31&zhida_source=entity) （通过SMC指令）  
>   
> 或者放到SCP里面（通过 [Linux-SCMI](https://zhida.zhihu.com/search?content_id=272281338&content_type=Article&match_order=1&q=Linux-SCMI&zhida_source=entity) -》SCP）里面进行。  
>   
> 本小节先介绍下Linux里面的通用reset框架，下篇介绍arm-scmi到SCP进行CRU硬件操作的实现。

## 1\. 简介

![](https://pic4.zhimg.com/v2-57b85d6ec057aeb5e2ace1aa4b05f775_1440w.jpg)

复杂SoC内部有很多具有独立功能的硬件模块，例如CPU cores、GPU cores、USB控制器、MMC控制器、等等，出于功耗、稳定性等方面的考虑，有些SoC在内部为这些硬件模块设计了复位信号（reset signals），软件可通过寄存器（一般1个bit控制1个硬件）控制这些硬件模块的复位状态。

![](https://picx.zhimg.com/v2-618fd92360bfdaa602636996dcbb6edf_1440w.jpg)

> 例如有3个软件I2C/EMMC/IPC都有复位某个硬件模块的需求，那么要写三个复位操作代码。  
> 这些代码可以进行抽象出来一个独立的软件框架-reset framework，  
>   
> 这样软件使用者（consumer:I2C/EMMC/IPC）直接使用硬件模块的名字，就可以对硬件进行复位。  
>   
> 一个模块硬件的复位实现为单独的reset driver（provider），只用实现一次就可以了。

再次说明了，解决复杂问题的普遍方法就是抽象，而Linux内核可以说是玩得一手好抽象，也是操作系统的必备技能。

## 2\. consumer-驱动软件

![](https://pic4.zhimg.com/v2-ab1f9704d3713893cd1d3f07be340af7_1440w.jpg)

对于硬件驱动来的需求来说，就是复位某个硬件，在驱动代码里面可以通过硬件的名字进行复位，这个名字对应设置放在了 [dts文件](https://zhida.zhihu.com/search?content_id=272281338&content_type=Article&match_order=1&q=dts%E6%96%87%E4%BB%B6&zhida_source=entity) 中，例如：

```
i2c0: i2c@0xA1006000 {
        compatible = "arch64,a10-i2c";
        reg = <0 0xA1006000 0 0x100>;
        interrupt-parent = <&gic>;
        interrupts = <0 32 4>;
        clock-frequency = <24000000>;
        resets = <&rst 0x50 11>;
        reset-names = "i2c0";
        status = "disabled";
};
```

&rst：使用rst驱动，0x50：寄存器偏移，11：使用那个bit 进行复位的时候，在驱动软件里面加上

```
i2c_dev->i2c_rst =
            devm_reset_control_get(i2c_dev->dev, "i2c0");

static int i2c_reset_assert(struct reset_control *rstc)
{
        int rc = 0;
        rc = reset_control_assert(rstc);
        if (rc < 0) {
                pr_err("%s: failed\n", __func__);
                return rc;
        }

        return rc;
}
static int i2c_reset_assert(struct reset_control *rstc)
{
        int rc = 0;
        rc = reset_control_assert(rstc);
        if (rc < 0) {
                pr_err("%s: failed\n", __func__);
                return rc;
        }

        return rc;
}

static int i2c_hw_reset(struct i2c_dev *i2c_dev)
{
                i2c_reset_assert(i2c_dev->i2c_rst );
                udelay(1);
                i2c_reset_release(i2c_dev->i2c_rst );

}
```

i2c\_dev->i2c\_rst是一个reset\_control的结构体

```
struct reset_control {
    struct reset_controller_dev *rcdev;
    struct list_head list;
    unsigned int id;
    struct kref refcnt;
    bool acquired;
    bool shared;
    bool array;
    atomic_t deassert_count;
    atomic_t triggered_count;
};
```

上面i2c驱动作为consumer调用了reset framework提供的API函数（include/linux/reset.h），如下：

```
/* 通过reset_control_get或者devm_reset_control_get获得reset句柄 */ 
struct reset_control *reset_control_get(struct device *dev, const char *id);    
void reset_control_put(struct reset_control *rstc);                             
struct reset_control *devm_reset_control_get(struct device *dev, const char *id);

/* 通过reset_control_reset进行复位，或者通过reset_control_assert使设备处于复位生效状态，通过reset_control_deassert使复位失效 */ 
reset_control_deassert(struct reset_control *rstc)//解复位
reset_control_assert(struct reset_control *rstc)//复位
reset_control_reset(struct reset_control *rstc)//先复位，延迟一会，然后解复位
```

## 3\. provider-reset驱动

![](https://pic2.zhimg.com/v2-d7c63edbbe12cd0b9bbc581d4afdd36b_1440w.jpg)

## 3.1 整体介绍

reset驱动是一个独立驱动，为其他驱动提供硬件复位的服务。首先在dts里面设置.compatible这样驱动就可以加载了，如下定义了rst驱动：

```
rst: reset-controller {
        compatible = "arch64,a10-reset";
        #reset-cells = <2>;
        reg = <0x0 0x91000000 0x0 0x1000>;
};
```

上述是一个reset控制器的节点，0x91000000是寄存器基址，0x1000是映射大小。#reset-cells代表引用该reset时需要的cells个数。

> 然后就是reset驱动的实现，reset驱动编写的基本步骤：

1. 实现struct reset\_control\_ops结构体中的.reset、.assert、.deassert、.status函数
2. 分配struct reset\_controller\_dev结构体，填充ops、owner、nr\_resets等成员内容
3. 调用reset\_controller\_register函数注册reset设备

首先定义platform\_driver:

```
static const struct of_device_id a10_reset_dt_ids[] = {
        { .compatible = "hobot,a10-reset", },
        { },
};
static struct platform_driver a10_reset_driver = {
        .probe  = a10_reset_probe,
        .driver = {
                .name       = KBUILD_MODNAME,
                .of_match_table = a10_reset_dt_ids,
        },
};

static int __init a10_reset_init(void)
{
    return platform_driver_register(&a10_reset_driver);
}
```

系统初始化，dts中配置了此reset驱动，就会调用a10\_reset\_probe

```
static int a10_reset_probe(struct platform_device *pdev)
{
        struct a10_reset_data *data;
        struct resource *res;
        struct device *dev = &pdev->dev;
        struct device_node *np = dev->of_node;
        u32 modrst_offset;

        /*
         * The binding was mainlined without the required property.
         * Do not continue, when we encounter an old DT.
         */
        if (!of_find_property(pdev->dev.of_node, "#reset-cells", NULL)) {
                dev_err(&pdev->dev, "%s missing #reset-cells property\n",
                        pdev->dev.of_node->full_name);
                return -EINVAL;
        }

        data = devm_kzalloc(&pdev->dev, sizeof(*data), GFP_KERNEL);
        if (!data)
                return -ENOMEM;

        res = platform_get_resource(pdev, IORESOURCE_MEM, 0);
        data->membase = devm_ioremap_resource(&pdev->dev, res);
        if (IS_ERR(data->membase))
                return PTR_ERR(data->membase);

        spin_lock_init(&data->lock);

        data->rcdev.owner = THIS_MODULE;
        data->rcdev.nr_resets = a10_MAX_NR_RESETS;
        data->rcdev.ops = &a10_reset_ops;
        data->rcdev.of_node = pdev->dev.of_node;
        data->rcdev.of_xlate = a10_reset_of_xlate;
        data->rcdev.of_reset_n_cells = 2;

        return devm_reset_controller_register(dev, &data->rcdev);
}
```

data->rcdev的定义如下：

```
struct reset_controller_dev{
    const struct reset_control_ops *ops;//复位控制操作函数
    struct list_head list;//全局链表，复位控制器注册后挂载到全局链表
    struct list_head reset_control_head;//各个模块复位的链表头
    struct device *dev；int of_reset_n_cells;//dts中引用时，需要几个参数
        
    //通过dts引用的参数，解析复位控制器中相应的参数
    int (*of_xlate)(struct reset_controller_dev *rcdev, const struct of_phandle_args *reset_spec)；unsigned int nr_resets;//复位设备个数
}
```
- ops提供reset操作的实现，基本上是reset provider的所有工作量。
- of\_xlate和of\_reset\_n\_cells用于解析consumer device dts node中的“resets =; ”节点，如果reset controller比较简单（仅仅是线性的索引），可以不实现，使用reset framework提供的简单版本----of\_reset\_simple\_xlate即可。
- nr\_resets，该reset controller所控制的reset信号的个数。

a10\_reset\_ops定义了reset framework的回调函数，对具体寄存器位进行操作

```
//reset可控制设备完成一次完整的复位过程。
//assert和deassert分别控制设备reset状态的生效和失效。
static const struct reset_control_ops a10_reset_ops = {
        .assert     = a10_reset_assert,
        .deassert   = a10_reset_deassert,
        .status     = a10_reset_status,
};

static int a10_reset_assert(struct reset_controller_dev *rcdev,
        unsigned long id)
{
        void __iomem    *regaddr;
        uint32_t reg_val, offset;
        unsigned long flags;
        u8 bit;
        struct a10_reset_data *data = to_a10_reset_data(rcdev);

        if (rcdev == NULL || id < 0)
                return -EINVAL;

        spin_lock_irqsave(&data->lock, flags);
        offset = (id & RESET_REG_OFFSET_MASK) >> RESET_REG_OFFSET_SHIFT;
        regaddr = data->membase + offset;

        reg_val = readl(regaddr);
        bit = (id & RESET_REG_BIT_MASK);
        reg_val |= BIT(bit);
        writel(reg_val, regaddr);

        spin_unlock_irqrestore(&data->lock, flags);

        return 0;
}

static int a10_reset_deassert(struct reset_controller_dev *rcdev,
        unsigned long id)
{
        void __iomem    *regaddr;
        uint32_t reg_val, offset;
        unsigned long flags;
        u8 bit;
        struct a10_reset_data *data = to_a10_reset_data(rcdev);

        if (rcdev == NULL || id < 0)
                return -EINVAL;

        spin_lock_irqsave(&data->lock, flags);
        offset = (id & RESET_REG_OFFSET_MASK) >> RESET_REG_OFFSET_SHIFT;
        regaddr = data->membase + offset;

        reg_val = readl(regaddr);
        bit = (id & RESET_REG_BIT_MASK);
        reg_val &= ~(BIT(bit));
        writel(reg_val, regaddr);

        spin_unlock_irqrestore(&data->lock, flags);
        return 0;
}
static int a10_reset_status(struct reset_controller_dev *rcdev,
        unsigned long id)
{
        return 0;
}
```

## 3.2 reset复位API说明

devm\_reset\_control\_get

```
struct reset_control *devm_reset_control_get(struct device *dev, const char *id)
•    作用：获取相应的reset句柄
•    参数：
￮     dev：指向申请reset资源的设备句柄
￮     id：指向要申请的reset资源名（字符串），可以为NULL
•    返回：
￮     成功：返回reset句柄
￮     失败：返回NULL
```

reset\_control\_deassert

```
int reset_control_deassert(struct reset_control *rstc)
•    作用：对传入的reset资源进行解复位操作
•    参数：
￮     rstc：指向申请reset资源的设备句柄
•    返回：
￮     成功：返回0
￮     失败：返回错误码
```

reset\_control\_assert

```
int reset_control_assert(struct reset_control *rstc)
•    作用：对传入的reset资源进行复位操作。
参数和返回值与reset_control_deassert相同
```

reset\_control\_reset

```
int reset_control_reset(struct reset_control *rstc)
•    作用：对传入的reset资源先进行复位操作，然后等待5us，再进行解复位操作。
•    相当于执行了一遍reset_control_assert后，然后delay一会，再调用reset_control_deassert
```

> 后记：  
> 使用markdown写中文发现段落行首空格实在不好搞，然后调研了很多牛人写的中文博客发现行首不用空格的很多，咱们这里为了方便书写，也不要行首空格了。毕竟工具是服务人的，规则都是在变化的。  
> 后续文章先在 **稀土掘金** 首发（写的快），然后复制过来，欢迎关注： [juejin.cn/user/20521112](https://link.zhihu.com/?target=https%3A//juejin.cn/user/2052111227697336)  
> 电源管理，可能很多人不喜欢看，我分几次多篇一块发完。也欢迎大家把喜欢看的技术留言。  
>   
> 电源管理这个专栏其实比较小众，大伙并不是那么爱看，我就先多写几篇存着，到时 **一块推送** ，避免公共资源的浪费，节省点大家的时间。有时候我也划开微信看看直播和视频号，发现很多无脑的直播，比如河边钢筋磨石头、在家转大棍子，什么科目三，感觉这些都有人看，这么无脑，我就算写点垃圾文字也比这强的吧，也有可能人看视频就是为了无脑休息下。

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

后续会继续更新，纯干货分析，欢迎分享给朋友，欢迎评论交流！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

编辑于 2026-03-31 10:45・上海[怎么复习信息系统项目管理师？真的是高级里最好考的吗？](https://zhuanlan.zhihu.com/p/31240225482)

[

“软考高项通关速览：从零到拿证的实战地图” 这篇攻略为你划清备考迷雾： 考试结构：综合知识：75道选择题（项目管理...

](https://zhuanlan.zhihu.com/p/31240225482)