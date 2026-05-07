> 来源：微信公众号「黑与白聊嵌入式」
> 原URL：http://mp.weixin.qq.com/s?__biz=MzYzNzY2MzcwMg==&mid=2247484220&idx=1&sn=9e6a7fd17fcaf4f17997b3df53acb373&chksm=f0ece385c79b6a9377bc07c43576ef5187fa886feb82c2c00f90e8138c22a7de84ec68e1ec31#rd
> 收录时间：2026-05-06

---

学 Linux 启动时，很多人并不是一开始就卡在源码上，而是先卡在一堆术语上。

比如这些词，几乎每个做启动的人都见过：

```
bootcmd
bootargs
Image
uImage
dtb
initrd
initramfs
rootfs
console
earlycon
```

问题是，这些词表面上都"眼熟"，真正问到它们分别负责什么、处在哪一层、和谁容易混，很多人其实说不清。

于是后面就会出现一种非常典型的情况：

**日志看得很多，命令也敲过不少，但脑子里没有一张清楚的词汇地图。**

这一篇就专门解决这个问题。

## 一句话先讲明白

如果只记一句话，可以先记这个：

Linux 启动里很多关键词看起来都像"启动参数"或"镜像文件"，但它们其实分属不同层：有的属于 U-Boot，有的属于内核，有的属于设备树，有的属于根文件系统。

也就是说，启动问题最容易乱，不是因为词太多，而是因为：

**不同层的词，被很多人混在一起用了。**

所以这一篇最重要的，不是背定义，而是先建立一个原则：

**每个关键词，都先问自己：它属于哪一层？它到底控制什么？**

## 1. bootcmd：U-Boot 阶段的"启动脚本"

bootcmd 是 U-Boot 环境变量里最核心的变量之一。

它的作用不是传参数给 Linux，而是：

**告诉 U-Boot 开机后要执行哪一串命令。**

比如它可能包含：

• 选择启动介质
• 加载 kernel
• 加载 dtb
• 执行 bootm / booti

所以 bootcmd 的本质是：

**U-Boot 阶段的自动启动脚本。**

它最容易和谁混？

最容易和 bootargs 混。

两者的区别一定要记住：

• **bootcmd 决定 怎么启动**
• **bootargs 决定 内核按什么参数运行**

一句话：

**bootcmd 管"拉内核"，bootargs 管"内核起来后怎么跑"。**

## 2. bootargs：传给 Linux 内核的命令行参数

bootargs 也是 U-Boot 环境变量，但它不属于"执行命令"，而属于：

**传给 Linux 内核的参数字符串。**

它里面经常会包含：

```
console=
root=rw/ro
rootwait
earlycon=
```

所以 bootargs 的作用是：

**告诉内核启动后该用什么参数工作。**

它最容易让人误以为是"U-Boot 自己的运行参数"，其实不是。

U-Boot 只是负责把它交给内核。

所以你可以直接记成：

**bootcmd 是 U-Boot 自己要执行的**
**bootargs 是 U-Boot 代替内核带过去的**

## 3. Image：Linux 原生内核镜像

Image 是 Linux 内核编译后的原生镜像格式，尤其在 ARM64 里很常见。

它的特点是：

• 是 Linux 原生格式
• 一般没有 U-Boot legacy 头
• 常配合 booti 使用

它最容易和谁混？

• uImage
• zImage

要记住：

• Image 常见对应 booti
• zImage 常见对应 bootz
• uImage/FIT 常见对应 bootm

这几个词一旦混了，现场很容易出现：

• Wrong Image Format
• Bad Linux magic

## 4. dtb：设备树二进制文件

dtb 是 device tree blob，也就是设备树编译后的二进制结果。

它的作用不是"启动 Linux"，而是：

**告诉内核这块板子上到底有哪些硬件，它们的地址、时钟、中断、连接关系是什么。**

所以内核不是"自动知道硬件长什么样"，而是通过 dtb 获取板级硬件描述。

它最容易和谁混？

• 内核镜像
• 驱动源码
• bootargs

要记住：

• **kernel 负责执行**
• **dtb 负责描述硬件**
• **bootargs 负责描述运行参数**

这三者缺一不可，但职责完全不同。

## 5. initrd：启动早期临时内存盘

initrd 最容易让人觉得"听过，但说不清"。

你可以先把它理解成：

**内核启动早期可以挂载的一份临时根文件系统镜像。**

它存在的意义通常是：

• 在真正 rootfs 挂载之前，先提供过渡环境
• 帮助完成某些早期初始化
• 支持更灵活的启动流程

它最容易和谁混？

• initramfs
• rootfs

简单记：

• **initrd 是启动早期临时用的**
• **rootfs 是系统最终要用的根文件系统**

## 6. initramfs：比 initrd 更常见的内核早期文件系统机制

initramfs 和 initrd 很容易被混着说，但严格来说不是一回事。

对入门阶段，你可以先这样理解：

**它们都属于内核启动早期用于过渡的文件系统机制。**

区别在更底层实现细节上。

最稳妥的说法是：

• initrd/initramfs 都是内核早期可用的临时根文件系统方案
• 它们的目标都是帮助系统在真正 rootfs 接管前先跑起来

**initrd 是老式的、块设备格式的内存盘镜像；initramfs 是新式的、cpio 归档格式，内核自带、现在全线默认用它。**

## 7. rootfs：系统真正的根文件系统

这个词必须和 initrd/initramfs 区分开。

rootfs 的本质是：

**Linux 最终真正运行所依赖的根文件系统。**

里面通常有：

• /sbin/init
• 库文件
• Shell
• 服务程序
• 配置文件
• 用户应用

所以如果 rootfs 挂不上，你会看到非常经典的错误：

```
VFS: Cannot open root device
Waiting for root device
```

要记住一句最实用的话：

**initrd/initramfs 更像启动过渡环境，rootfs 才是系统真正的家。**

## 8. console：内核正常阶段的控制台输出

console= 经常出现在 bootargs 里，比如：

```
console=ttyS0,115200
```

它的作用是：

**告诉内核正常运行阶段，把日志和控制台输出发到哪个串口。**

它最容易和谁混？

• earlycon

区别一定要记：

• **console：偏正常内核阶段**
• **earlycon：偏更早的 early boot 阶段**

所以有时候你会遇到：

• U-Boot 有日志
• 内核早期没日志
• 但后面突然又有日志

这往往就是 console 和 earlycon 的区别没配对。

## 9. earlycon：内核很早期的串口输出通道

earlycon= 也是常见启动参数之一。

它的意义在于：

**在常规串口驱动完整起来之前，尽量提前把早期内核日志打出来。**

所以它是早期定位问题非常重要的工具。

很多系统看起来像"内核一跳转就死了"，其实只是：

**没看到 early log。**

这时就很需要 earlycon。

所以你可以简单理解成：

• **console 负责"后续正常输出"**
• **earlycon 负责"尽早让你看见"**

## 10. init：用户空间的第一进程

init 不是启动参数，也不是镜像文件，但它在启动链里非常关键。

它通常是：

```
/sbin/init
systemd
busybox init
```

它的作用是：

**把用户空间真正拉起来。**

如果内核和 rootfs 都没问题，但 init 起不来，系统照样进不了真正可用状态。

所以启动链里一定要记住：

• **kernel 起来，不等于系统起来**
• **rootfs 挂上，不等于系统起来**
• **init 跑起来，用户空间才算真正接棒**

## 最后怎么记最不容易乱？

最稳的方式不是死记定义，而是按层记：

**U-Boot 层**
• bootcmd
• bootargs

**内核镜像层**
• Image
• zImage
• uImage

**硬件描述层**
• dtb

**早期过渡文件系统层**
• initrd
• initramfs

**系统真正运行层**
• rootfs
• init

**日志输出层**
• console
• earlycon

只要按层记，这些词基本就不会再打架。

## 结尾

Linux 启动之所以让人容易越看越乱，很多时候不是因为知识太难，而是因为术语混了层次。

一旦你把这些关键词放回它们各自的位置：

• 谁属于 U-Boot
• 谁属于 kernel
• 谁属于设备树
• 谁属于 rootfs
• 谁负责日志
• 谁负责用户空间

后面你再看：

• bootcmd / bootargs
• bootm / booti
• VFS
• console
• earlycon

整个理解会顺很多。

**启动链怕的不是词多，而是层次混。**
