---
title: "确的使用dd进行磁盘读写速度测试"
source: "https://zhuanlan.zhihu.com/p/31280225"
author:
  - "[[梁叫兽想当年在几亿人中杀出一条生路，想当下要不是蛋拽着哥就要上天了]]"
published:
created: 2026-05-02
description: "本文抄袭至： 正确的使用dd进行磁盘读写速度测试 - 赵磊的技术博客 - ITeye博客 一般情况下，我们都是使用dd命令创建一个大文件来测试磁盘的读写速度。但是，很多人都存在一个误区，以为dd命令显示的速度就是磁盘…"
tags:
  - "clippings"
---
6 人赞同了该文章

本文抄袭至： [正确的使用dd进行磁盘读写速度测试 - 赵磊的技术博客 - ITeye博客](https://link.zhihu.com/?target=http%3A//elf8848.iteye.com/blog/2089055)

一般情况下，我们都是使用 [dd命令](https://zhida.zhihu.com/search?content_id=4700706&content_type=Article&match_order=1&q=dd%E5%91%BD%E4%BB%A4&zhida_source=entity) 创建一个大文件来测试磁盘的读写速度。但是，很多人都存在一个误区，以为dd命令显示的速度就是磁盘的写入速度，其实这是不然的。我们分析一下dd命令是如何工作的。

1\. dd if=/dev/zero of=/xiaohan/test.iso bs=1024M count=1

这种情况下测试显示的速度是dd命令将数据写入到 [内存缓冲区](https://zhida.zhihu.com/search?content_id=4700706&content_type=Article&match_order=1&q=%E5%86%85%E5%AD%98%E7%BC%93%E5%86%B2%E5%8C%BA&zhida_source=entity) 中的速度，只有当数据写入内存缓冲区完成后，才开始将数据刷入硬盘，所以这时候的数据是无法正确衡量磁盘写入速度的。

2\. dd if=/dev/zero of=/xiaohan/test.iso bs=1024M count=1;sync

这种情况下测试显示的跟上一种情况是一样的，两个命令是先后执行的，当sync开始执行的时候，dd命令已经将速度信息打印到了屏幕上，仍然无法显示从内存写硬盘时的真正速度。

3\. dd if=/dev/zero of=/xiaohan/test.iso bs=1024M count=1 conv=fdatasync

这种情况加入这个参数后，dd命令执行到最后会真正执行一次“同步(sync)”操作，所以这时候你得到的是读取这128M数据到内存并写入到磁盘上所需的时间，这样算出来的时间才是比较符合实际的。

4\. dd if=/dev/zero of=/xiaohan/test.iso bs=1024M count=1 oflag=dsync

这种情况下，dd在执行时每次都会进行同步写入操作。也就是说，这条命令每次读取1M后就要先把这1M写入磁盘，然后再读取下面这1M，一共重复128次。这可能是最慢的一种方式，基本上没有用到 [写缓存](https://zhida.zhihu.com/search?content_id=4700706&content_type=Article&match_order=1&q=%E5%86%99%E7%BC%93%E5%AD%98&zhida_source=entity) (write cache)。

总结：

建议使用测试写速度的方式为：

dd if=/dev/zero of=/xiaohan/test.iso bs=1024M count=1 conv=fdatasync

建议使用测试读速度的方式为：

dd if=/xiaohan/test.iso of=/dev/zero bs=1024M count=1 iflag=direct

\*注：要正确测试磁盘读写能力，建议测试文件的大小要远远大于内存的容量！！！

发布于 2017-11-22 10:11[非科班想转行做数据分析，最需要掌握哪三个核心技能？](https://www.zhihu.com/question/1921131858588066094/answer/1928736948098438604)

[

非科班转行做数据分析，那种两眼一抹黑的迷茫，我太懂了。看着各种专业术语和工具，心里直发怵，生怕自己学不会，更怕学了也找不到工作。我原来学的专业和数据分析八竿子打不着，学校...

](https://www.zhihu.com/question/1921131858588066094/answer/1928736948098438604)