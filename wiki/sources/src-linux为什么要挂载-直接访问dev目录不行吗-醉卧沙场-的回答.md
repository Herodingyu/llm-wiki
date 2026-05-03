---
doc_id: src-linux为什么要挂载-直接访问dev目录不行吗-醉卧沙场-的回答
title: linux为什么要挂载，直接访问dev目录不行吗？   醉卧沙场 的回答
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/linux为什么要挂载，直接访问dev目录不行吗？ - 醉卧沙场 的回答.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

326 人赞同了该回答 这个问题问的就好像在问“为什么要把小麦加工成面粉后做成面包、馒头、包子、饼之类的再吃，直接吃麦粒或面粉不香吗？”一样。 /dev/下的设备文件面向的是设备本身，你虽然可以打开、读取、写入一个 [存储设备](https://zhida.zhihu.com/search?content_id=314959317&content_type=Answer&match_order=1&q=%E5%AD%98%E5%82%A8%E8%AE%BE%E5%A4%87&zhida_source=entity) ，但是你面向的终究是一个存储设备，不是 [文件系统](https://zhid

## Key Points

### 1. 为什么不能直接访问/dev？
开始我也这样问：既然 `/dev/sda1` 代表第一个分区，那我直接 `cd /dev/sda1` 不就行了？ 现实很骨感——如果你真这么试过，会发现根本进不去。因为 **`/dev` 里的设备文件只是个“接口”，不是真正的“文件系统”** 。

### 2. 设计哲学：一切皆文件
Linux有个很酷的理念： **一切皆文件** 。 硬件设备、进程信息、网络连接，在Linux眼里都是文件。 但这里的“文件”分两种： 1. **设备文件** （在 `/dev` 下）：代表硬件本身 2. **普通文件** ：我们日常操作的文件

### 3. 坑：理解挂载
以前看到过一个例子： 维护公司的文件服务器，有次系统盘空间告急。 直接把一块新硬盘 `dd` 到 `/home` 目录 系统直接崩了。 因为 `/home` 目录里有很多运行中的进程在使用，直接覆盖等于拆了房子还在里面住人。

### 4. 现代Linux其实已经很智能了
虽然我刚才说的都是手动挂载，但现在大多数桌面版Linux（比如Ubuntu）已经做得很人性化了。 你插个U盘，系统会自动完成这些步骤： 1. 识别U盘设备（比如 `/dev/sdd1` ） 2. 创建挂载点（比如 `/media/yourname/USB_DISK` ）

### 5. 进阶玩法：挂载的威力
理解了基础后，你会发现挂载这个概念特别强大： - **挂载网络存储** ：可以把其他服务器的共享目录挂载到本地，像访问本地文件一样访问远程文件 - **挂载内存盘** ：把内存的一部分挂载成磁盘，速度飞快，适合临时文件

## Evidence

- Source: [原始文章](raw/tech/bsp/linux为什么要挂载，直接访问dev目录不行吗？ - 醉卧沙场 的回答.md) [[../../raw/tech/bsp/linux为什么要挂载，直接访问dev目录不行吗？ - 醉卧沙场 的回答.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/linux为什么要挂载，直接访问dev目录不行吗？ - 醉卧沙场 的回答.md) [[../../raw/tech/bsp/linux为什么要挂载，直接访问dev目录不行吗？ - 醉卧沙场 的回答.md|原始文章]]
