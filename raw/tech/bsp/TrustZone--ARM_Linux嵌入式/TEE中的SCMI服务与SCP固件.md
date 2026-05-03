---
title: "TEE中的SCMI服务与SCP固件"
source: "https://zhuanlan.zhihu.com/p/657036771"
author:
  - "[[TrustZone​​​海思技术有限公司 员工]]"
published:
created: 2026-05-03
description: "大家好！我是不知名的安全工程师Hkcoco！ 欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco 获取更多精彩内容哦！！！ 什么是SCMISCMI（System Control and Management Interface）是一种标准化的系统控制和…"
tags:
  - "clippings"
---
3 人赞同了该文章

---

大家好！我是不知名的安全工程师Hkcoco！

欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco

获取更多精彩内容哦！！！

---

## 什么是SCMI

SCMI（System Control and Management Interface）是一种标准化的系统控制和管理接口，旨在提高跨平台设备管理的效率和可移植性。SCMI通过定义一组命令、消息和数据结构，为操作系统、虚拟机、固件和硬件提供一个通用的通信接口。

SCMI主要涉及 [电源域管理](https://zhida.zhihu.com/search?content_id=234136941&content_type=Article&match_order=1&q=%E7%94%B5%E6%BA%90%E5%9F%9F%E7%AE%A1%E7%90%86&zhida_source=entity) 、 [性能管理](https://zhida.zhihu.com/search?content_id=234136941&content_type=Article&match_order=1&q=%E6%80%A7%E8%83%BD%E7%AE%A1%E7%90%86&zhida_source=entity) 、 [时钟管理](https://zhida.zhihu.com/search?content_id=234136941&content_type=Article&match_order=1&q=%E6%97%B6%E9%92%9F%E7%AE%A1%E7%90%86&zhida_source=entity) 、 [传感器管理](https://zhida.zhihu.com/search?content_id=234136941&content_type=Article&match_order=1&q=%E4%BC%A0%E6%84%9F%E5%99%A8%E7%AE%A1%E7%90%86&zhida_source=entity) 、 [复位管理](https://zhida.zhihu.com/search?content_id=234136941&content_type=Article&match_order=1&q=%E5%A4%8D%E4%BD%8D%E7%AE%A1%E7%90%86&zhida_source=entity) 、 [电压域管理](https://zhida.zhihu.com/search?content_id=234136941&content_type=Article&match_order=1&q=%E7%94%B5%E5%8E%8B%E5%9F%9F%E7%AE%A1%E7%90%86&zhida_source=entity) 等方面。

- 电源域管理指的是根据预先设计的低功耗状态来控制芯片/模块的电源开关等。
- 电压域管理指的是配置/控制芯片和模块的供电电压，比如实现动态调压。
- 在性能管理方面，SCMI可以协助操作系统进行性能优化和管理，例如通过调整系统参数来提高运行效率。
- 时钟管理方面，SCMI可以控制设备的时钟频率和同步，以确保系统正常运行。
- 传感器管理涉及对设备上各种传感器的控制和读取，例如温度、湿度、压力等传感器的数据采集和控制。
- 复位管理指在系统出现故障或异常时，通过SCMI进行复位操作，重新启动系统。

在系统中，通常使用一个 [微控制器](https://zhida.zhihu.com/search?content_id=234136941&content_type=Article&match_order=1&q=%E5%BE%AE%E6%8E%A7%E5%88%B6%E5%99%A8&zhida_source=entity) 处理上述的系统管理问题，以减轻 [应用处理器](https://zhida.zhihu.com/search?content_id=234136941&content_type=Article&match_order=1&q=%E5%BA%94%E7%94%A8%E5%A4%84%E7%90%86%E5%99%A8&zhida_source=entity) 的负载。

应用处理器和微控制器之间的通信就需要用到SCMI，它规定了组件之间支持的消息和规范了消息如何在组件之间传递。

应用处理器可以通过安全或者非安全通道发送SCMI命令给微控制器，微控制器则协调来自所有这些请求，并将硬件驱动到适当的电源或性能状态。

## SCMI server in TEE

SCMI server in TEE的作用是提供系统管理接口（System Management Interface，简称SMI），用于管理硬件组件和系统操作。它允许安全操作系统与硬件进行交互，执行各种管理任务，例如电源管理、性能优化、时钟控制、传感器数据采集等。

在TEE环境中，SCMI server可以提供安全的通信通道，将管理指令和数据在安全操作系统和硬件组件之间传输。它可以确保管理指令和数据的完整性和机密性，防止未经授权的访问和篡改。

- ● 管理系统的关键资源
	- ○ 无电源协处理器
		- ○ 没有足够的通道
- ● 使用SCMI服务器作为代理
- ● 简化硬件配置
	- ○ 服务器可以在不同的子系统上运行
- ● 对所有配置使用一个SW
	- ○ 最大限度地重用软件
- ● [SCP固件](https://zhida.zhihu.com/search?content_id=234136941&content_type=Article&match_order=1&q=SCP%E5%9B%BA%E4%BB%B6&zhida_source=entity) ：
	- ○ 针对cortex-M处理器实现
		- ○ 基于HW mailbox的SCMI服务

具体可以看一下：

- [【SCP Firmware入门一篇就够啦】](https://link.zhihu.com/?target=https%3A//blog.csdn.net/weixin_45264425/article/details/132368341%3Fops_request_misc%3D%25257B%252522request%25255Fid%252522%25253A%252522169495956316800192245267%252522%25252C%252522scm%252522%25253A%25252220140713.130102334.pc%25255Fblog.%252522%25257D%26request_id%3D169495956316800192245267%26biz_id%3D0%26utm_medium%3Ddistribute.pc_search_result.none-task-blog-2~blog~first_rank_ecpm_v1~rank_v31_ecpm-1-132368341-null-null.268%255Ev1%255Ekoosearch%26utm_term%3DSCP%26spm%3D1018.2226.3001.4450)
- [SPC 源码](https://link.zhihu.com/?target=https%3A//github.com/ARM-software/SCP-firmware)
![](https://pic1.zhimg.com/v2-49cf1fa8887e7956683f0766bb97c0da_1440w.jpg)

典型设计

## SCMI服务在哪里运行？

![](https://picx.zhimg.com/v2-fed7eb8abb1e5625092dc40629f9d487_1440w.jpg)

## SCMI server in OP-TEE

- ● 传输层
	- ○ OP-TEE共享内存
		- ○ OP-TEE调用命令
- ● 支持每个通道多条消息
	- ○ 目前最多有8封待处理邮件
		- ○ 消息按顺序处理
- ● 支持多个通道
	- ○ 每个传输通道一个OP-TEE会话
		- ○ 允许同时处理多个请求
- ● 从背板到主线存储库
	- ○ OP-TEE中SCMI服务器集成的SCP固件主线支持
		- ○ SCMI服务器伪TA的OP-TEE支持
		- ○ SCMI驱动程序中的Linux OP-TEE传输层
		- ○ SCMI驱动程序中的U-Boot OP-TEE传输层
- ● 通知Linux代理
- ● 配套电压调节器
- ● 设备树支持
	- ○ 在编译时使用
		- ○ 启动时使用

## SCMI的学习资料

SCMI的学习资料包括协议版本、接口初始化、命令和消息、响应或通知、传输协议和SCMI应用案例，下面详细展开说说。

- SCMI协议版本和功能集：SCMI协议版本和功能集是SCMI学习资料的重要组成部分，每个版本都有不同的命令、消息和数据结构，并支持不同的设备功能。因此，要了解SCMI协议版本和功能集，并根据设备的需求选择合适的版本和功能集。
- SCMI接口初始化：SCMI接口初始化是使用SCMI的第一步，需要了解如何配置传输层参数，如传输类型、地址、端口等，并建立与底层设备的连接。此外，还需要了解如何进行安全或非安全通道的配置和认证等。
- SCMI命令和消息：SCMI命令和消息是SCMI的核心内容之一，需要了解如何使用SCMI命令或消息来执行各种任务，如读取或写入寄存器、配置时钟、启动或停止设备等。同时，还需要了解命令或消息的参数和数据结构，以及如何设置参数和数据。
- SCMI响应或通知：SCMI响应或通知是使用SCMI的重要环节之一，需要了解如何解析SCMI响应或通知，包括响应或通知的数据结构并解析返回的参数和数据。同时，还需要了解如何处理异常或错误等情况。
- SCMI传输协议：SCMI传输协议是SCMI实现的基础之一，需要了解消息如何在组件之间传递的传输协议，包括如何进行消息的封装、传输、解封装等。同时，还需要了解如何进行消息的路由和寻址等。
- SCMI应用案例：SCMI应用案例是学习SCMI的重要方式之一，通过学习SCMI应用案例，可以更好地理解SCMI在实际系统中的应用和管理方式。例如，学习如何使用SCMI进行系统电源管理、性能优化等。

> 本文使用 [Zhihu On VSCode](https://zhuanlan.zhihu.com/p/106057556) 创作并发布

发布于 2023-09-18 22:53・四川[推荐一个操作不复杂的互联网副业项目——国外steam/RF Online野路子，搞钱野路子，保姆级拆解，适合上班族兼职](https://zhuanlan.zhihu.com/p/1986116919116466005)

[

我就是靠steam搬砖一年净赚9W+，简单概括就是利用一些技巧和经验去Steam购买一些低价格商品，我们低价拿到道具，再以低...

](https://zhuanlan.zhihu.com/p/1986116919116466005)