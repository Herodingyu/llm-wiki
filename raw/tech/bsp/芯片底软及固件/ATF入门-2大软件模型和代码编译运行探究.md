---
title: "ATF入门-2大软件模型和代码编译运行探究"
source: "https://zhuanlan.zhihu.com/p/2025982613567849531"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "之前的文章： ATF入门-1qmeu搭建ARM全套源码学习环境中我们提到了ATF基本概念和系统启动流程，然后搭建了qemu运行开源代码的基础。可以说是 万事俱备，只欠东风了。思考下一步怎么写这个系列，还是按照周贺贺老师…"
tags:
  - "clippings"
---
[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181)

2 人赞同了该文章

![](https://pic1.zhimg.com/v2-557b865585cf9916e2615338dd66ad7c_1440w.jpg)

之前的文章： [ATF入门-1qmeu搭建ARM全套源码学习环境](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485508%26idx%3D1%26sn%3D99c019e8d4efddef614115d61bdfbffb%26chksm%3Dfa528e60cd2507766d08588aaed93f67c51fe6c77d502bebf8f6b429b2236c24d42d947e0108%26scene%3D21%23wechat_redirect) 中我们提到了 **ATF基本概念和系统启动流程** ，然后搭建了 **[qemu](https://zhida.zhihu.com/search?content_id=272874309&content_type=Article&match_order=1&q=qemu&zhida_source=entity) 运行开源代码** 的基础。

可以说是 **万事俱备，只欠东风** 了。思考下一步怎么写这个系列，还是按照 **周贺贺老师** 的收费课程顺序来挑战下，不过其是 **收费的** ，笔者肯定是不会花钱买的，找了一个知乎大神 **lgjjeff：** [zhihu.com/people/lgjjef](https://www.zhihu.com/people/lgjjeff) 的 **芯片启动** 专栏文章：

[zhihu.com/column/c\_1513](https://www.zhihu.com/column/c_1513091402841554944)

然后结合我们的具体qemu运行代码，妥妥的 **在实践中学习** 。

**福利：** 这里先给出一个周贺贺老师的 **ARM中文资料** ： [Armv8](https://zhida.zhihu.com/search?content_id=272874309&content_type=Article&match_order=1&q=Armv8&zhida_source=entity) / [armv9](https://zhida.zhihu.com/search?content_id=272874309&content_type=Article&match_order=1&q=armv9&zhida_source=entity) 架构入门指南： [hehezhou.cn/arm/index.h](https://link.zhihu.com/?target=http%3A//hehezhou.cn/arm/index.html)

其根据ARM官网DEN0024A\_v8\_architecture\_PG\_1.0.pdf翻译整理而来的，也可以自己去看英文的。

## 1\. 大软件模型

本小节周贺贺老师的视频是免费公开的，大家可以自己去看，网址如下：

[bilibili.com/cheese/pla](https://link.zhihu.com/?target=https%3A//www.bilibili.com/cheese/play/ep92791%3Fquery_from%3D0%26search_id%3D5894568997539276737%26search_query%3DATF%2BARM%26csource%3Dcommon_hpsearch_null_null%26spm_id_from%3D333.337.search-card.all.click)

![](https://pic3.zhimg.com/v2-dc9bfeeb86e13a090e18b3e18444fd84_1440w.jpg)

上图是目前流行的一个软件框架， **不仅限于安卓和linux** ，底层还有很多其他 **固件** ，从而巩固安全的需求。

![](https://pic1.zhimg.com/v2-5dea8ce7df9e4dd825b8c8b1c6d75228_1440w.jpg)

[异常中断](https://zhida.zhihu.com/search?content_id=272874309&content_type=Article&match_order=1&q=%E5%BC%82%E5%B8%B8%E4%B8%AD%E6%96%AD&zhida_source=entity) 是ARM架构的重要内容。上图是异常等级的切换模型。然后 **异常等级跟固件挂钩** 就可以在 **各个固件中间切换** 运行代码，如下：

![](https://pic2.zhimg.com/v2-5d5fd4a03c21a0ab2f450847b2da86df_1440w.jpg)

切程序地址需要 **[异常向量表](https://zhida.zhihu.com/search?content_id=272874309&content_type=Article&match_order=1&q=%E5%BC%82%E5%B8%B8%E5%90%91%E9%87%8F%E8%A1%A8&zhida_source=entity)** ，需要异常指令触发异常。异常就会进入高级别再切回来，就像 **V字形** 。

![](https://picx.zhimg.com/v2-32fc6fcb8d81a2545f735d1a22574ecd_1440w.jpg)

reset的时候也可以进行异常等级切换。这个是EL3，没有high level就需要使用 **warm reset** 。

![](https://pic2.zhimg.com/v2-10d8ca93a17aeb035877a84c9bae66a7_1440w.jpg)

对于64位系统，上层可以运行32位。但是上层64位，下层不可以32位。

![](https://pic1.zhimg.com/v2-db35b22a2af3fc7d18a1b8dd8964cd28_1440w.jpg)

上面是 **[secure boot](https://zhida.zhihu.com/search?content_id=272874309&content_type=Article&match_order=1&q=secure+boot&zhida_source=entity)** 的过程，里面各个固件的异常等级不一样，就需要使用异常跳来跳去。

![](https://pic4.zhimg.com/v2-e828db58a6905f7e8c59f465a9a9d509_1440w.jpg)

上图是一个设计的例子，里面uboot跳kernel需要smc到BL31再eret到kernel

## 2\. 编译过程探究

## 2.1 log打印

![](https://pic2.zhimg.com/v2-0b840d0f9ad8e2ad1868ad66bbcb587f_1440w.jpg)

> 按照之前的流程运行起来后，首先我们应该做点什么呢？  
> 那必须 **上手改改代码打点log小试身手** 啊。然后再探索下这个代码是怎么 **编译运行** 的，这样就能完全控制了这套代码。

例如上面的打印： **BL1: v2.10.0** ，我们使用vscode在atf代码里面搜索“BL1:”

![](https://pic4.zhimg.com/v2-0fedf769eecc91128e741e367c2987b7_1440w.jpg)

```
NOTICE(FIRMWARE_WELCOME_STR);
NOTICE("hello BL1: %s\n", version_string);
NOTICE("BL1: %s\n", build_message);
```

修改代码 **加一个hello** ，然后 **make run** 后可以看到：

![](https://pica.zhimg.com/v2-8f39bde989fcf474b69809fcdd27f3f0_1440w.jpg)

可见 **NOTICE** 进行了打印，但是我们下面的 **INFO** 并没有打印

```
#if LOG_LEVEL >= LOG_LEVEL_INFO
# define INFO(...)    tf_log(LOG_MARKER_INFO __VA_ARGS__)
#else
# define INFO(...)    no_tf_log(LOG_MARKER_INFO __VA_ARGS__)
#endif
```

**LOG\_LEVEL** 控制了打印级别，在根目录的Makefile文件中

```
ifneq (${DEBUG}, 0)
    BUILD_TYPE    :=    debug
    TF_CFLAGS    +=    -g -gdwarf-4
    ASFLAGS        +=    -g -Wa,-gdwarf-4

    # Use LOG_LEVEL_INFO by default for debug builds
    LOG_LEVEL    :=    40
else
    BUILD_TYPE    :=    release
    # Use LOG_LEVEL_NOTICE by default for release builds
    LOG_LEVEL    :=    20
endif #(Debug)
```

include/common/debug.h中的定义如下。可见编译atf的时候并没有打开${DEBUG}，一个 **简单粗暴** 的方式就是在使用 **LOG\_LEVEL** 的地方直接 **#undef** 后重定义

```
#define LOG_LEVEL_NONE            U(0)
#define LOG_LEVEL_ERROR            U(10)
#define LOG_LEVEL_NOTICE        U(20)
#define LOG_LEVEL_WARNING        U(30)
#define LOG_LEVEL_INFO            U(40)
#define LOG_LEVEL_VERBOSE        U(50)

#undef LOG_LEVEL
#define LOG_LEVEL LOG_LEVEL_INFO
```

这样重新make run下就可以看到：

![](https://pic2.zhimg.com/v2-36e17b8e9ee3d778b57a786700978b8f_1440w.jpg)

## 2.2 去掉默认gdb

**make run** 是先编译后运行，

**make -f qemu\_v8.mk run-only** 是只运行，

但是默认启动起来后需要在gdb里面输入c才能启动有打印，我们可以去掉输入c。

![](https://pic3.zhimg.com/v2-95d8c2b557813905e2cedf95af41ce86_1440w.jpg)

qemu运行gdb就需要加这个 **\-s -S** 的参数，我们可以去掉：

![](https://pic3.zhimg.com/v2-f0b96c105ee3e26a34d45c4eda8b7d16_1440w.jpg)

这样一启动，不用输入c就可以直接启动了。

## 2.3 只编译atf

make run是 **全编** ，但是比较慢。比如我们只对atf关心，那么来一探究竟吧，在arm/optee/build **/qemu\_v8.mk** 中

```
115 TARGET_DEPS := arm-tf buildroot linux optee-os qemu

all: $(TARGET_DEPS)

487 run: all                
488     $(MAKE) run-only
```

arm-tf的编译如下：

```
218 arm-tf: $(BL32_DEPS) $(BL33_DEPS)
219     $(TF_A_EXPORTS) $(MAKE) -C $(TF_A_PATH) $(TF_A_FLAGS) all fip
220     mkdir -p $(BINARIES_PATH)
```

那么就直接： **make arm-tf** 就可以了

在编译make all的依赖里面还有 **buildroot** 。这个东西有什么用？

大家都知道 **linux内核** 有 **make menuconfig** 的配置，非常 **方便裁剪，图形化的界面** 。但是对于大软件模型，除了Linux内核之外还有很多固件、应用、文件系统等软件，这些软件是否也可以有一个图形化的配置工具进行裁剪，这就诞生了buildroot。关于buildroot可以单独写一个文章，总之对于大软件系统，必须有一个这样的统一编译工具。

![](https://pic2.zhimg.com/v2-2bb6447e07a1c05ba542a32a54a298c3_1440w.jpg)

可以看到DEBUG的值是0，那么怎么改为1呢？执行如下，这样就可以不用暴力修改LOG打印宏了。

```
make arm-tf DEBUG=1
```

> 后记：  
> **万事开头难** ，关于ATF有非常多的知识点。而且其跟secure boot联系紧密，这篇文章也只是开头的开头，还没到代码分析，下一篇开始代码分析。  
> 虽然 **写的不太深入** ，但是跟着这系列文章去学习ATF，相信会有一个 **入门的效果** 。

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位有自己公众号的留言： **申请转载** ！

纯干货持续更新，欢迎 **分享给朋友** 、点赞、收藏、在看、划线和评论交流！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

编辑于 2026-04-10 17:06・上海