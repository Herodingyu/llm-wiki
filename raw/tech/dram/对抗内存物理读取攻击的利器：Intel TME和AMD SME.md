---
title: "对抗内存物理读取攻击的利器：Intel TME和AMD SME"
source: "https://zhuanlan.zhihu.com/p/429055957"
author:
  - "[[老狼​新知答主]]"
published:
created: 2026-05-02
description: "内存条，这个我们电脑和服务器之中必备的重要数据临时存取器件，相信大家都已经十分熟悉。大家都认为，它之中的内容只要掉电了，就会消失。其实并不然，我在这篇文章中介绍了著名的ColdBoot攻击： 老狼：内存不刷…"
tags:
  - "clippings"
---
[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog)

146 人赞同了该文章

目录

内存条，这个我们电脑和服务器之中必备的重要数据临时存取器件，相信大家都已经十分熟悉。大家都认为，它之中的内容只要掉电了，就会消失。其实并不然，我在这篇文章中介绍了著名的 [ColdBoot攻击](https://zhida.zhihu.com/search?content_id=183474908&content_type=Article&match_order=1&q=ColdBoot%E6%94%BB%E5%87%BB&zhida_source=entity) ：

简单来说，就是利用内存单元的电容在低温下电子的惰性，通过冰冻内存条，然后快速将内存条物理转移到读取器中，来读取内存条中的机密信息。这种方法简单暴力，十分有效，有没有什么办法对抗呢？有矛就有盾，这个盾就是AMD的 [SME](https://zhida.zhihu.com/search?content_id=183474908&content_type=Article&match_order=1&q=SME&zhida_source=entity) （Secure Memory Encryption）和Intel的TME（Total Memory Encryption）。

## TME和SME

ColdBoot的物理攻击对信息系统的威胁是紧迫的。彼时，Intel已经有了 [SGX](https://zhida.zhihu.com/search?content_id=183474908&content_type=Article&match_order=1&q=SGX&zhida_source=entity) (Software Guard eXtensions)技术，它的安全enclave技术虽然并不是专门针对ColdBoot攻击的，但如果使用得当，可以某种程度缓解问题。

这次技术的带头人是AMD，它在Zen设计的时候就引入了SME，并在不久更进一步提出 [SEV](https://zhida.zhihu.com/search?content_id=183474908&content_type=Article&match_order=1&q=SEV&zhida_source=entity) （ [Secure Encrypted Virtualization](https://link.zhihu.com/?target=https%3A//developer.amd.com/sev/) ）。Intel在随后Skylake才引入TME，并在Icelake中引入MKTME（Multi-Key Total Memory Encryption）。关于SEV和MKTME，我们今后专文介绍，今天我们重点介绍TME和SME，因为两者十分相似，我们就以TME来详述。

## TME是怎么工作的？性能如何？

TME名字中的Total Memory就明示了它是一种全部内存加密技术。这个IP嵌入在内存控制器中，在内存写入时加密，在内存读取时解密，因此它是一种软件全透明的内存加密方案。

CPU **每次** 在启动时，都会随机生成NIST标准的 [AES-XTS](https://zhida.zhihu.com/search?content_id=183474908&content_type=Article&match_order=1&q=AES-XTS&zhida_source=entity) 加密算法用到的秘钥（128bit）,这个秘钥临时存在内存控制器中，掉电就会消失，而且为了安全，不能被外界获取（有一种情况例外，想想是什么情况）。每次总线送过来数据存储时，就用AES-XTS自动加密，再放在内存条中；如果是读取，从内存条中取出来后，用AES-XTS算法解密后再送出去。由于这一切都是在内存控制器IP中自动发生的，外部IP并不知道发生了什么，它们只看到数据进去，然后同样的数据又可以读出来。外部IP可以是带内的CPU、Cache Agent、QPI Agent或者是带外的设备，这样好多过去可以工作的技术可以叠加在TME上工作，包括已有的SGX，兼容性十分好。

在两个CPU的服务器中系统框图如下 <sup><a href="#ref_1">[1]</a></sup> ：

![](https://pic4.zhimg.com/v2-ed30c85b4eef5ec525d1c57c20a3dac1_1440w.jpg)

来源：参考资料1

这样内存条中实际上存储的是密文而不是明文，ColdBoot攻击这样就被防住了。对某些不能存储密文的情形（想想是哪些情况），TME还专门设计了排除寄存器，可以将某些内存区域排除在外。

这么加密又解密必然带来性能损失（Overhead），那么究竟损失了多少呢？据Intel统计并公布的数据是不到5%（统计数据）的性能损失。当然在数据密集型计算的时候，1%的性能损失也是不能容忍的，所以BIOS中有专门选项来开关TME。大部分情况下，这个选项是关闭的，但这时候就要冒着被ColdBoot攻击的风险。

## 结束后的思考题

TME集成在内存控制器中，这让它不但能够加密普通内存，也可以用在Intel的非易失内存上（ [傲腾](https://zhida.zhihu.com/search?content_id=183474908&content_type=Article&match_order=1&q=%E5%82%B2%E8%85%BE&zhida_source=entity) ）。TME加密的颗粒度太粗，防止了ColdBoot攻击，但这个透明的特点，让对内部攻击毫无反击之力，这就需要MKTME和SGX技术了，在这篇文章对其做了介绍：

最后是一个思考题：TME能不能防止DMA攻击呢？为什么？欢迎大家留言讨论。

欢迎大家关注本专栏和用微信扫描下方二维码加入微信公众号"UEFIBlog"，在那里有最新的文章。关注公众号，留言“资料”，有一些公开芯片资料供下载。

![](https://pic1.zhimg.com/v2-91d380fba0955ebce85e5bf264d63cf6_1440w.jpg)

## 参考

1. Intel MKTME文档 [https://www.intel.com/content/dam/develop/external/us/en/documents-tps/multi-key-total-memory-encryption-spec.pdf](https://www.intel.com/content/dam/develop/external/us/en/documents-tps/multi-key-total-memory-encryption-spec.pdf)

还没有人送礼物，鼓励一下作者吧

编辑于 2023-01-13 10:29・上海[安全](https://www.zhihu.com/topic/19569215)[为什么有的人宁愿折腾NAS，也不愿付费iCloud？](https://www.zhihu.com/question/1966220938946262133/answer/1966571755733774470)

[

上周是我和男朋友的三周年纪念日，本来浪漫晚餐吃得好好的，我手机突然弹窗“无法拍摄照片，存储空间已满”……当场尬住！手忙脚乱地开始删软件、清聊天记录，连以前的情侣旅行视频都...

](https://www.zhihu.com/question/1966220938946262133/answer/1966571755733774470)