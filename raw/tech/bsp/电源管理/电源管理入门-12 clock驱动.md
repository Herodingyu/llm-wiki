---
title: "电源管理入门-12 clock驱动"
source: "https://zhuanlan.zhihu.com/p/2022624950712823832"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "电源管理的两个大方面就是 电压和时钟。Clock 时钟就是 SoC 中的 脉搏，由它来控制各个部件按各自的节奏跳动。比如，CPU主频设置，串口的波特率设置，I2S的采样率设置，I2C的速率设置等等。这些不同的clock设置，…"
tags:
  - "clippings"
---
[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679)

9 人赞同了该文章

![](https://pic2.zhimg.com/v2-aefd3dfb8925c86c046e25d5b1d257d7_1440w.jpg)

电源管理的两个大方面就是 **电压** 和 **时钟** 。

Clock 时钟就是 SoC 中的 **脉搏** ，由它来控制各个部件按各自的 **节奏跳动** 。比如，CPU主频设置，串口的波特率设置，I2S的采样率设置，I2C的速率设置等等。这些不同的clock设置，都需要从某个或某几个 **时钟源** 头而来，最终开枝散叶，形成一棵 **时钟树** 。

## 1\. clock驱动构架

![](https://picx.zhimg.com/v2-282b97f853fbb083cf2d8bf7da8c17e1_1440w.jpg)

Linux的时钟子系统由 **[CCF](https://zhida.zhihu.com/search?content_id=272340598&content_type=Article&match_order=1&q=CCF&zhida_source=entity)** （common clock framework）框架管理， **CCF向上给用户提供了通用的时钟接口，向下给驱动开发者提供硬件操作的接口** 。

这个也是一个 **consumer、framework、provider** 的模式。其中其provider会比较复杂一些，但是往往是由芯片厂商提供，我们编写设备驱动要使用调频的时候只需要在consumer里面进行配置使用就可以了。

1.1 Clock Provider介绍

在SoC上器件很多，会形成一个 **时钟树** ，如下所示：

![](https://pic3.zhimg.com/v2-0fcf76189b9ce7206009a80f10c83a32_1440w.jpg)

- 根节点一般是 **[Oscillator](https://zhida.zhihu.com/search?content_id=272340598&content_type=Article&match_order=1&q=Oscillator&zhida_source=entity)** （有源振荡器）或者 **[Crystal](https://zhida.zhihu.com/search?content_id=272340598&content_type=Article&match_order=1&q=Crystal&zhida_source=entity)** （无源振荡器）。
- 中间节点有很多种，包括 **[PLL](https://zhida.zhihu.com/search?content_id=272340598&content_type=Article&match_order=1&q=PLL&zhida_source=entity)** （锁相环，用于提升频率的）， **[Divider](https://zhida.zhihu.com/search?content_id=272340598&content_type=Article&match_order=1&q=Divider&zhida_source=entity)** （分频器，用于降频的）， **[Mux](https://zhida.zhihu.com/search?content_id=272340598&content_type=Article&match_order=1&q=Mux&zhida_source=entity)** （从多个clock path中选择一个）， **[Gate](https://zhida.zhihu.com/search?content_id=272340598&content_type=Article&match_order=1&q=Gate&zhida_source=entity)** （用来控制ON/OFF的）。
- 叶节点是使用 clock 作为输入的、有具体功能的 HW block。

可通过

cat /sys/kernel/debug/clk/clk\_summary 查看这棵时钟树。

![](https://pic4.zhimg.com/v2-93fd43080f7e5fbc74676c313b3a03a7_1440w.jpg)

image.png

## 1.2 clock consumer介绍

时钟的使用者，clock子系统向consumer的提供通用的时钟API接口，使其可以屏蔽底层硬件差异。提供给consumer操作的 **API** 如下：

```
struct clk *clk_get(struct device *dev, const char *id);
struct clk *devm_clk_get(struct device *dev, const char *id);
int clk_enable(struct clk *clk);//使能时钟，不会睡眠
void clk_disable(struct clk *clk);//使能时钟，不会睡眠
unsigned long clk_get_rate(struct clk *clk);
void clk_put(struct clk *clk);
long clk_round_rate(struct clk *clk, unsigned long rate);
int clk_set_rate(struct clk *clk, unsigned long rate);
int clk_set_parent(struct clk *clk, struct clk *parent);
struct clk *clk_get_parent(struct clk *clk);
int clk_prepare(struct clk *clk);
void clk_unprepare(struct clk *clk);
int clk_prepare_enable(struct clk *clk) //使能时钟，可能会睡眠
void clk_disable_unprepare(struct clk *clk) //禁止时钟，可能会睡眠
unsigned long clk_get_rate(struct clk *clk) //获取时钟频率
```

## 2\. Clock Provider

根据 clock 的特点，clock framework 将 clock 分为 **fixed rate、gate、devider、mux、fixed factor、composite** 六类。

![](https://pic2.zhimg.com/v2-c89daf756b86bee692c40a01938fb539_1440w.jpg)

## 2.1 数据结构表示

上面六类本质上都属于clock device，内核把这些 clock HW block 的特性抽取出来，用 struct clk\_hw 来表示，具体如下：

```
struct clk_hw {
  //指向CCF模块中对应 clock device 实例
 struct clk_core *core;
  //clk是访问clk_core的实例。每当consumer通过clk_get对CCF中的clock device（也就是clk_core）发起访问的时候都需要获取一个句柄，也就是clk
 struct clk *clk;
  //clock provider driver初始化时的数据，数据被用来初始化clk_hw对应的clk_core数据结构。
 const struct clk_init_data *init;
};

struct clk_init_data {
  //该clock设备的名字
 const char  *name;
  //clock provider driver进行具体的 HW 操作
 const struct clk_ops *ops;
  //描述该clk_hw的拓扑结构
 const char  * const *parent_names;
 const struct clk_parent_data *parent_data;
 const struct clk_hw  **parent_hws;
 u8   num_parents;
 unsigned long  flags;
};
```

以固定频率的振动器 fixed rate 为例，它的数据结构是：

```
struct clk_fixed_rate {
  //下面是fixed rate这种clock device特有的成员
  struct        clk_hw hw；
  //基类
  unsigned long    fixed_rate;
  unsigned long    fixed_accuracy;
  u8        flags;
};
```

其他clock硬件的表示也是如此。

## 2.2 clock provider注册初始化

clock驱动在时钟子系统中属于provider，provider是时钟的提供者，即具体的clock驱动。

**clock驱动在Linux刚启动的时候就要完成，比 `initcall` 都要早期，因此clock驱动是在内核中进行实现。**

这里也叫clock device，例如上面说的fixed rate，属于硬件提供服务的。在其启动的时候根据 [DTS](https://zhida.zhihu.com/search?content_id=272340598&content_type=Article&match_order=1&q=DTS&zhida_source=entity) 里面的配置进行注册。例如fixed rate

```
CLK_OF_DECLARE(fixed_clk, "fixed-clock", of_fixed_clk_setup); 

struct clk *clk_register_fixed_rate(struct device *dev, const char *name, 
        const char *parent_name, unsigned long flags,
        unsigned long fixed_rate);
```

其他的device如下：

```
clk_register_gate
clk_register_divider
clk_register_divider_table
clk_register_mux
clk_register_mux_table
clk_register_fixed_factor
clk_register_composite
```

这些注册函数最终都会通过函数 **clk\_register** 注册到 Common Clock Framework 中，返回为 struct clk 指针。如下所示：

![](https://pica.zhimg.com/v2-0e8ed2cff479e77ce2a59e4a0d88ed8c_1440w.jpg)

在内核的 `drivers/clk` 目录下，可以看到各个芯片厂商对各自芯片clock驱动的实现：

![](https://pic4.zhimg.com/v2-c891dff053ff4af30cf3b3b5e0f7fb39_1440w.jpg)

## 2.3 DTS配置

例如时钟源：

```
clocks{
 osc24M:osc24M{
  compatible = "fixed-clock";
  #clock-cells = <0>;
  clock-output-name = "osc24M";
  clock-frequency = <24000000>;
 };
};
```

| 属性 | 说明 |
| --- | --- |
| compatible | 驱动匹配名字 |
| #clock-cells | 提供输出时钟的路数。#clock-cells为0时，代表输出一路时钟 #clock-cells为1时，代表输出2路时钟。 |
| #clock-output-names | 输出时钟的名字 |
| #clock-frequency | 输出时钟的频率 |

clock驱动编写的基本步骤：

1. 实现 `struct clk_ops` 相关成员函数
2. 定义分配 `struct clk_onecell_data` 结构体，初始化相关数据
3. 定义分配 `struct clk_init_data` 结构体，初始化相关数据
4. 调用 `clk_register` 将时钟注册进框架
5. 调用 `clk_register_clkdev` 注册时钟设备
6. 调用 `of_clk_add_provider` ，将clk provider存放到of\_clk\_provider链表中管理
7. 调用 `CLK_OF_DECLARE` 声明驱动

## 2.4 clock驱动实现举例：

这里以fixed\_clk为例

fixed\_clk针对像PLL这种具有固定频率的时钟，对于PLL，我们只需要实现`.recalc_rate` 函数。

设备树：

```
#define PLL0_CLK 0

clocks{
 osc24M:osc24M{
  compatible = "fixed-clock";
  #clock-cells = <0>;
  clock-output-names = "osc24M";
  clock-frequency = <24000000>;
 };
 pll0:pll0{
  compatible = "xx, choogle-fixed-clk";
  #clock-cells = <0>;
  clock-id = <PLL0_CLK>;
  clock-frequency = <1000000000>;
  clock-output-names = "pll0";
  clocks = <&osc24M>;
 };
};
```

驱动：

```
#include <linux/clk-provier.h>
#include <linux/clkdev.h>
#include <linux/clk.h>
#include <linux/module.h>
#include <linux/of.h>
#include <linux/of_address.h>
#include <linux/platform_device.h>
#include <linux/slab.h>
#include <linux/delay.h>

#define CLOCK_BASE 0X12340000
#define CLOCK_SIZE 0X1000

struct xx_fixed_clk{
    void __iomem *reg;//保存映射后寄存器基址
    unsigned long fixed_rate;//频率
    int id;//clock id
    struct clk_hw*;
}；
static unsigned long xx_pll0_fixed_clk_recalc_rate(struct clk_hw *hw, unsigned long parent_rate)
{
 unsigned long recalc_rate;
 //硬件操作：查询寄存器，获得分频系数，计算频率然后返回
 return recalc_rate;
}

static struct clk_ops xx_pll0_fixed_clk_ops = {
 .recalc_rate  =   xx_pll0_fixed_clk_recalc_rate,
};

struct clk_ops *xx_fixed_clk_ops[] = {
 &xx_pll0_fixed_clk_ops,
};

struct clk * __init xx_register_fixed_clk(const char *name, const char *parent_name,
       void __iomem *res_reg, u32 fixed_rate, int id, 
       const struct clk_ops *ops)
{
 struct xx_fixed_clk *fixed_clk;
 struct clk *clk;
 struct clk_init_data init = {};

 fixed_clk = kzalloc(sizeof(*fixed_clk), GFP_KERNEL);
 if (!fixed_clk)
  return ERR_PTR(-ENOMEM);

    //初始化struct clk_init_data数据
 init.name = name;
 init.flags = CLK_IS_BASIC;
 init.parent_names = parent_name ? &parent_name : NULL;
 init.num_parents = parent_name ? 1 : 0;

 fixed_clk->reg = res_reg;//保存映射后的基址
 fixed_clk->fixed_rate = fixed_rate;//保存频率
 fixed_clk->id = id;//保存clock id

 fixed_clk->hw.init = &init;

    //时钟注册
 clk = clk_register(NULL, &fixed_clk->hw);
 if (IS_ERR(clk))
  kfree(fixed_clk);

 return clk;
}

static void __init of_xx_fixed_clk_init(struct device_node *np)
{
 struct clk_onecell_data *clk_data;
 const char *clk_name = np->name;
 
 const char *parent_name = of_clk_get_parent_name(np, 0);
 void __iomem *res_reg = ioremap(CLOCK_BASE, CLOCK_SIZE);//寄存器基址映射

 u32 rate = -1;
 int clock_id, index, number;

 clk_data = kmalloc(sizeof(struct clk_onecell_data), GFP_KERNEL);
 if (!clk_data )
  return;

 number = of_property_count_u32_elems(np, "clock-id");
 clk_data->clks = kcalloc(number, sizeof(struct clk*), GFP_KERNEL);
 if (!clk_data->clks)
  goto err_free_data;

 of_property_read_u32(np, "clock-frequency", &rate);

 /**
 * 操作寄存器：初始化PLL时钟频率
 * ......
 */

 for (index=0; index<number; index++) {
  of_property_read_string_index(np, "clock-output-names", index, &clk_name);
  of_property_read_u32_index(np, "clock-id", index, &clock_id);

  clk_data->clks[index] = xx_register_fixed_clk(clk_name, parent_name, 
       res_reg, rate, clock_id, ak_fixed_clk_ops[pll_id]);
  if (IS_ERR(clk_data->clks[index])) {
   pr_err("%s register fixed clk failed: clk_name:%s, index = %d\n",
     __func__, clk_name, index);
   WARN_ON(true);
   continue;
  }
  clk_register_clkdev(clk_data->clks[index], clk_name, NULL);//注册时钟设备
 }

 clk_data->clk_num = number;
 if (number == 1) {
  of_clk_add_provider(np, of_clk_src_simple_get, clk_data->clks[0]);
 } else {
  of_clk_add_provider(np, of_clk_src_onecell_get, clk_data);
 }
 return;

err_free_data:
 kfree(clk_data);

}

CLK_OF_DECLARE(xx_fixed_clk, "xx,xx-fixed-clk", of_xx_fixed_clk_init);
```

## 3\. clock consumer

![](https://pic2.zhimg.com/v2-1dff2b6673de680cadf474085b37e26b_1440w.jpg)

主要就是获取clock和操作clock。

## 3.1 获取clock

即通过 clock 名称获取 struct clk 指针的过程，由 clk\_get、devm\_clk\_get、clk\_get\_sys、of\_clk\_get、of\_clk\_get\_by\_name、of\_clk\_get\_from\_provider 等接口负责实现，这里以 clk\_get 为例，分析其实现过程：

```
struct clk *clk_get(struct device *dev, const char *con_id)
{
 const char *dev_id = dev ? dev_name(dev) : NULL;
 struct clk *clk;

 if (dev) {
  //通过扫描所有“clock-names”中的值，和传入的name比较，如果相同，获得它的index（即“clock-names”中的第几个），调用of_clk_get，取得clock指针。
  clk = __of_clk_get_by_name(dev->of_node, dev_id, con_id);
  if (!IS_ERR(clk) || PTR_ERR(clk) == -EPROBE_DEFER)
   return clk;
 }

 return clk_get_sys(dev_id, con_id);
}
```

## 3.2 操作clock

```
//启动clock前的准备工作/停止clock后的善后工作。可能会睡眠。
int clk_prepare(struct clk *clk)
void clk_unprepare(struct clk *clk)
 
//启动/停止clock。不会睡眠。
static inline int clk_enable(struct clk *clk)
static inline void clk_disable(struct clk *clk)

//clock频率的获取和设置
static inline unsigned long clk_get_rate(struct clk *clk)
static inline int clk_set_rate(struct clk *clk, unsigned long rate)
static inline long clk_round_rate(struct clk *clk, unsigned long rate)

//获取/选择clock的parent clock
static inline int clk_set_parent(struct clk *clk, struct clk *parent)
static inline struct clk *clk_get_parent(struct clk *clk)
 
//将clk_prepare和clk_enable组合起来，一起调用。将clk_disable和clk_unprepare组合起来，一起调用
static inline int clk_prepare_enable(struct clk *clk)
static inline void clk_disable_unprepare(struct clk *clk)
```

## 3.3 实例操作

我们在驱动consumer开发的时候需要使用clock，这时需要在DTS里面配置，例如mmc设备：

```
mmc0:mmc0@0x12345678{
 compatible = "xx,xx-mmc0";
 ......
 clocks = <&peri PERI_MCI0>;//指定mmc0的时钟来自PERI_MCI0，PERI_MCI0的父时钟是peri
 clocks-names = "mmc0"; //时钟名，调用devm_clk_get获取时钟时，可以传入该名字
       ......
};
```

以mmc的设备节点为例，上述mmc0指定了时钟来自PERI\_MCI0，PERI\_MCI0的父时钟是peri，并将所指定的时钟给它命名为"mmc0"。

使用方法如下：

```
/* 1、获取时钟 */
host->clk = devm_clk_get(&pdev->dev, NULL); //或者devm_clk_get(&pdev->dev, "mmc0")
 if (IS_ERR(host->clk)) {
  dev_err(dev, "failed to find clock source\n");
  ret = PTR_ERR(host->clk);
  goto probe_out_free_dev;
 }

/* 2、使能时钟 */
ret = clk_prepare_enable(host->clk);
if (ret) {
 dev_err(dev, "failed to enable clock source.\n");
 goto probe_out_free_dev;
}

probe_out_free_dev:
 kfree(host);
```

在驱动中操作时钟，第一步需要获取 `struct clk` 指针句柄，后续都通过该指针进行操作，例如：设置频率：

```
ret = clk_set_rate(host->clk, 300000);
```

获得频率：

```
ret = clk_get_rate(host->clk);
```

> 注意：devm\_clk\_get()的两个参数是二选一，可以都传入，也可以只传入一个参数。

像i2c、mmc等这些外设驱动，通常只需要使能门控即可，因为这些外设并不是时钟源，它们只有开关。如果直接调用 `clk_ser_rate` 函数设置频率， `clk_set_rate` 会向上传递，即设置它的父时钟频率。例如在该例子中直接调用 `clk_set_rate` 函数，最终设置的是时钟源 `peri` 的频率。

## 4\. SoC硬件中的使用

在硬件中一般将clock的控制和reset搞到一起，形成一个CRU（clock reset unit）。每个子系统例如NPU需要有自己独立的CRU，CRU里面有PLL

![](https://pic2.zhimg.com/v2-df9f59e68a25584e60434190b16e6aeb_1440w.jpg)

## 参考：

1. [cloud.tencent.com/devel](https://link.zhihu.com/?target=https%3A//cloud.tencent.com/developer/article/1928685)
2. [zhuanlan.zhihu.com/p/60](https://zhuanlan.zhihu.com/p/605593587)
3. [bbs.16rd.com/thread-572](https://link.zhihu.com/?target=https%3A//bbs.16rd.com/thread-572748-1-1.html)

> 后记：  
> 电源管理写了这么多篇，慢慢套路就可以摸清楚了，抓住主要构架思路，剩下的就是招式问题了。DTS、consumer，framework、provier、硬件树形组织等。先弄清楚这些东西，不论调试什么问题就比较快了。

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位自己有博客公众号的留言：申请转载，多谢！

后续会继续更新，纯干货分析，欢迎分享给朋友，欢迎点赞、收藏、在看、划线和评论交流！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

编辑于 2026-04-01 10:43・上海[PMP百科全书-2024年超全版](https://zhuanlan.zhihu.com/p/676721837)

[

一、PMP是什么PMP（Project Management Professional）是一种专业的项目管理资格认...

](https://zhuanlan.zhihu.com/p/676721837)