---
title: "linux为什么要挂载，直接访问/dev目录不行吗？ - 醉卧沙场 的回答"
source: "https://www.zhihu.com/question/426846606/answer/1566866417"
author:
  - "[[醉卧沙场​编程等 2 个话题下的优秀答主​ 关注]]"
  - "[[沐安大数据运维再坚持一下]]"
  - "[[Lion 莱恩呀后端全栈技术布道者，系统解析从C/C++到分布式的开发实践]]"
published:
created: 2026-05-02
description: "这个问题问的就好像在问“为什么要把小麦加工成面粉后做成面包、馒头、包子、饼之类的再吃，直接吃麦粒或…"
tags:
  - "clippings"
---
326 人赞同了该回答

这个问题问的就好像在问“为什么要把小麦加工成面粉后做成面包、馒头、包子、饼之类的再吃，直接吃麦粒或面粉不香吗？”一样。

/dev/下的设备文件面向的是设备本身，你虽然可以打开、读取、写入一个 [存储设备](https://zhida.zhihu.com/search?content_id=314959317&content_type=Answer&match_order=1&q=%E5%AD%98%E5%82%A8%E8%AE%BE%E5%A4%87&zhida_source=entity) ，但是你面向的终究是一个存储设备，不是 [文件系统](https://zhida.zhihu.com/search?content_id=314959317&content_type=Answer&match_order=1&q=%E6%96%87%E4%BB%B6%E7%B3%BB%E7%BB%9F&zhida_source=entity) 。存储设备提供的访问单元是 [块](https://zhida.zhihu.com/search?content_id=314959317&content_type=Answer&match_order=1&q=%E5%9D%97&zhida_source=entity) ，比如你可以决定访问某一个或几个 [扇区](https://zhida.zhihu.com/search?content_id=314959317&content_type=Answer&match_order=1&q=%E6%89%87%E5%8C%BA&zhida_source=entity) 的数据，但是对于一个庞大的存储设备，你很难知道哪个块里是什么数据。用户需要面向的单位不是存储块本身，用户面向的单位是文件，而文件这个概念是文件系统提供的，一个文件的数据（和 [元数据](https://zhida.zhihu.com/search?content_id=314959317&content_type=Answer&match_order=1&q=%E5%85%83%E6%95%B0%E6%8D%AE&zhida_source=entity) ）可能散落在一个存储设备的各个角落，用户通过直接读取存储块的内容的方式获取文件内容是非常困难的，和大海捞针一样。

[挂载](https://zhida.zhihu.com/search?content_id=314959317&content_type=Answer&match_order=1&q=%E6%8C%82%E8%BD%BD&zhida_source=entity) 这个操作是文件系统需要的，一个文件系统通过挂载操作将对应的文件系统模块和所挂载设备上的具体文件系统关联起来，形成一个“激活运行状态”，这之后用户才能通过文件系统模块提供的很多文件系统方法看到文件的存在形式，以便访问文件。

这个问题如果展开说非常大，根本不是一个回答能讲述清楚的。我在此并不想展开，有兴趣可以到下面的连接里翻看“存储和文件系统”相关的文章和回答，我只能在有时间的时候不定时更新：

另外通过正常的计算机操作系统课程的学习，也可以正常的理解文件系统的意义。[有什么简单的库存管理软件？](https://www.zhihu.com/question/635557587/answer/1974413172032156202)

[

用表单大师搭建库存管理系统，低成本、高效率，个性化不怕踩雷，轻松实现生产、销售、库存、财务管理一体化。同时操作成本也不高，操作者往往只需要用户进行直观地拖、拉、拽、连线等...

](https://www.zhihu.com/question/635557587/answer/1974413172032156202)

#### 更多回答

刚学Linux的时候，也被“挂载”这个概念折磨得够呛。

这系统怎么这么反人类，插个U盘还得手动挂载才能用，Windows都是自动识别的啊！

先打个比方：仓库和文件柜

你有一个超大的仓库（这就是你的Linux服务器），里面堆满了各种货物（硬件设备：硬盘、U盘、光盘等等）。

现在问题是：

- `/dev` 目录就像是这个仓库的 **设备登记册** ，上面记录了所有设备的“身份证”。比如 `sda` 是第一个硬盘， `sr0` 是光驱。
- 但登记册只告诉你仓库里有哪些设备，并不负责展示设备里具体装了什么。

**个人现阶段理解挂载，就是把这个设备里的内容，摆到你能直接取用的文件柜里。**

新买的硬盘（ `/dev/sdb` ），里面装满了电影。

如果不挂载，系统只知道有这个硬盘存在，但不知道如何访问里面的电影。

把它挂载到 `/media/movies` 目录后，就等于在文件柜里隔开一个“电影专区”，可以直接访问这些电影了。

### 为什么不能直接访问/dev？

开始我也这样问：既然 `/dev/sda1` 代表第一个分区，那我直接 `cd /dev/sda1` 不就行了？

现实很骨感——如果你真这么试过，会发现根本进不去。因为 **`/dev` 里的设备文件只是个“接口”，不是真正的“文件系统”** 。

用个场景来看看：

机房有台服务器硬盘告警，紧急插了块新硬盘。如果不挂载，在 `/dev` 下只能看到 `/dev/sdc` 这个设备文件，用 `ls -l` 看就是个普通的字符设备文件。

但当我执行：

```
mkdir /new_disk
mount /dev/sdc /new_disk
```

结果就是 `/new_disk` 目录里就能看到完整的文件系统结构了，可以正常创建、删除文件。

### 设计哲学：一切皆文件

Linux有个很酷的理念： **一切皆文件** 。

硬件设备、进程信息、网络连接，在Linux眼里都是文件。

但这里的“文件”分两种：

1. **设备文件** （在 `/dev` 下）：代表硬件本身
2. **普通文件** ：我们日常操作的文件

挂载就是在这两者之间建立桥梁，让硬件设备能够以我们熟悉的方式（文件目录）来使用。

### 坑：理解挂载

以前看到过一个例子：

维护公司的文件服务器，有次系统盘空间告急。

直接把一块新硬盘 `dd` 到 `/home` 目录

系统直接崩了。

因为 `/home` 目录里有很多运行中的进程在使用，直接覆盖等于拆了房子还在里面住人。

挂载的做法是：

1. 把新硬盘挂载到临时目录，比如 `/mnt/new_disk`
2. 把 `/home` 下的数据同步过去
3. 卸载旧的 `/home` （如果有什么进程占着，还得先处理）
4. 把新硬盘重新挂载到 `/home`

这个过程我理解到： **挂载机制实际上是在管理“访问入口”** 。

### 现代Linux其实已经很智能了

虽然我刚才说的都是手动挂载，但现在大多数桌面版Linux（比如Ubuntu）已经做得很人性化了。

你插个U盘，系统会自动完成这些步骤：

1. 识别U盘设备（比如 `/dev/sdd1` ）
2. 创建挂载点（比如 `/media/yourname/USB_DISK` ）
3. 自动执行 `mount` 命令
4. 在文件管理器里显示U盘图标

但这背后的原理没变，只是自动化了。

作为运维，我们还是要懂手动挂载，因为服务器环境千奇百怪，不是每次都能自动识别。

### 进阶玩法：挂载的威力

理解了基础后，你会发现挂载这个概念特别强大：

- **挂载网络存储** ：可以把其他服务器的共享目录挂载到本地，像访问本地文件一样访问远程文件
- **挂载内存盘** ：把内存的一部分挂载成磁盘，速度飞快，适合临时文件
- **挂载镜像文件** ：不用烧录光盘，直接挂载ISO文件就能安装系统

做数据迁移，就是把远程的NFS共享挂载到本地，然后用 `rsync` 同步，比什么FTP、SCP都快得多。

### 给新手的建议

如果你刚开始接触Linux，理解挂载可能有点抽象：

1. **亲手试试**
2. **看看 `/proc/mounts`**
3. **理解 `/etc/fstab`**

Linux的很多设计看起来复杂，但理解他背后的逻辑可能看起来就通顺很多。

不刚、不怼、不评价、不带任何色彩，仅是个人理解

![](https://picx.zhimg.com/50/v2-023f2d48f38ee6920aae725a52e2451c_720w.jpg?source=1def8aca) ![](chrome-extension://difoiogjjojoaoomphldepapgpbgkhkb/assets/logo-O35E636P.png) Sider

[导游称大熊猫花花是残疾游客秒报警 340 万](https://www.zhihu.com/search?q=%E5%AF%BC%E6%B8%B8%E7%A7%B0%E5%A4%A7%E7%86%8A%E7%8C%AB%E8%8A%B1%E8%8A%B1%E6%98%AF%E6%AE%8B%E7%96%BE%E6%B8%B8%E5%AE%A2%E7%A7%92%E6%8A%A5%E8%AD%A6&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[孙杨被曝疑违规录取博士 335 万](https://www.zhihu.com/search?q=%E5%AD%99%E6%9D%A8%E8%A2%AB%E6%9B%9D%E7%96%91%E8%BF%9D%E8%A7%84%E5%BD%95%E5%8F%96%E5%8D%9A%E5%A3%AB&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[女子徒手给月子里宝宝打耳洞 294 万](https://www.zhihu.com/search?q=%E5%A5%B3%E5%AD%90%E5%BE%92%E6%89%8B%E7%BB%99%E6%9C%88%E5%AD%90%E9%87%8C%E5%AE%9D%E5%AE%9D%E6%89%93%E8%80%B3%E6%B4%9E&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[曝吴宣仪提出解约遭乐华拒绝 290 万](https://www.zhihu.com/search?q=%E6%9B%9D%E5%90%B4%E5%AE%A3%E4%BB%AA%E6%8F%90%E5%87%BA%E8%A7%A3%E7%BA%A6%E9%81%AD%E4%B9%90%E5%8D%8E%E6%8B%92%E7%BB%9D&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[阿 Sa 蔡卓妍官宣结婚 290 万](https://www.zhihu.com/search?q=%E9%98%BF+Sa+%E8%94%A1%E5%8D%93%E5%A6%8D%E5%AE%98%E5%AE%A3%E7%BB%93%E5%A9%9A&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[广州地铁有人喷洒不明液体 267 万](https://www.zhihu.com/search?q=%E5%B9%BF%E5%B7%9E%E5%9C%B0%E9%93%81%E6%9C%89%E4%BA%BA%E5%96%B7%E6%B4%92%E4%B8%8D%E6%98%8E%E6%B6%B2%E4%BD%93&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)