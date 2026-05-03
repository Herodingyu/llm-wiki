---
doc_id: src-secure-boot入门-1基本概念和框架
title: Secure boot入门 1基本概念和框架
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/Secure boot入门-1基本概念和框架.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181) 4 人赞同了该文章 ![](https://picx.zhimg.com/v2-f78167e93c38265e88dad3abdbf34f9d_1440w.jpg)

## Key Points

### 1. 1\. 固件加载信任链
![](https://picx.zhimg.com/v2-24d587237b64acf440f551481da458c9_1440w.jpg) 之前介绍过ATF的文章： [ATF入门-1qmeu搭建ARM全套源码学习环境](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D

### 2. 2\. 镜像加密算法基础
说完了链式加载的信任链，那么接下来就是 **对固件加密和解密** 的知识了，因为这个被破解那也是搞不定这个流程的。

### 3. 2.1 消息摘要算法介绍
为了防止数据被篡改，就要保证数据的 **完整性** ，一般做法是根据消息内容 **hash加密函数算出一个摘要** ，接收者拿到消息后也按同样的算法算出摘要，然后 **两个摘要对比** 就知道真假了。这个在消息传递的时候经常用到，这里我们用在了固件bin文件数据上。

### 4. 2.2 非对称加密算法-RSA
![](https://pic1.zhimg.com/v2-e09d19b143df52160885f5cc8b7f21ea_1440w.jpg) > 什么是对称加密？ > **使用相同的密钥进行加密和解密** 。常见的算法有AES（Advanced Encryption Standard）。如果密码被敌人获得那就完了。特别是现在的网络时代，告诉对方密码也需要通过网络，这就更加的难了。

### 5. 3\. Secure boot镜像校验应用
![](https://pic4.zhimg.com/v2-ec41563385bc8de0ee31722f9609010b_1440w.jpg) 如上图中两个要素： **1\. 信任链 2.加解密算法**

## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/Secure boot入门-1基本概念和框架.md) [[../../raw/tech/bsp/芯片底软及固件/Secure boot入门-1基本概念和框架.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/Secure boot入门-1基本概念和框架.md) [[../../raw/tech/bsp/芯片底软及固件/Secure boot入门-1基本概念和框架.md|原始文章]]
