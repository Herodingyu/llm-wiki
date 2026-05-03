---
title: "secureboot入门-6安卓AVB安全启动基础"
source: "https://zhuanlan.zhihu.com/p/2027039685248033269"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "安全启动的 第一部分就是ATF里面，但是到了BL33（uboot）的时候，之后就是第二部分linux里面了。但是linux的启动需要 很多额外的小东西，例如dtb分区、system分区、vendor分区、oem分区等，比较复杂。所以从uboot…"
tags:
  - "clippings"
---
[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181)

5 人赞同了该文章

![](https://picx.zhimg.com/v2-d4fad3651db02648a67ad9a47debe037_1440w.jpg)

安全启动的 **第一部分就是ATF** 里面，但是到了BL33（uboot）的时候，之后就是 **第二部分linux** 里面了。

但是linux的启动需要 **很多额外的小东西** ，例如dtb分区、system分区、vendor分区、oem分区等，比较复杂。

所以从uboot之后的安全启动就可以 **借鉴Android现成的AVB** （ [Android Verified Boot](https://zhida.zhihu.com/search?content_id=273007042&content_type=Article&match_order=1&q=Android+Verified+Boot&zhida_source=entity) ）机制。

## 1\. Android镜像基础

## 1.1 分区介绍

![](https://pic4.zhimg.com/v2-a9137a3be2bf0cc0577b8efa1a53544b_1440w.jpg)

- cache.img（缓存镜像）：用于 **存储系统或用户应用产生** 的临时数据。
- vendor.img：包含所有不可分发给 Android 开源项目 (AOSP) 的二进制文件。如果没有 **专有信息** ，则可以省略此分区。
- misc.img：misc 分区供 **恢复映像使用** ，存储空间不能小于 4KB。
- userdata.img：userdata 分区包 **含用户安装的应用和数据** ，包括自定义数据。
- vbmeta.img： **用于安全验证** ， **bootloader验证vbmeta的签名** ，再用vbmeta的key以及hash值验证dtbo/boot/system/vendor。 **（后面AVB要用）**
- system.img（android系统镜像）：系统镜像是地址ROM最常使用的一个镜像，用于存储Android系统的核心文件，System.img就是设备中system目录的镜像，里面包含 **了Android系统主要的目录和文件** 。一般这些文件是不允许修改的。（关于android的）
- recovery.img：recovery分区的镜像，一般用作系统恢复（刷机）。
- boot.img（ **Linux内核镜像** ）：Android系统中，通常会把zImage （ 内核镜像uImage文件） 和ramdisk.img打包到一起，生成一个boot.img镜像文件，放到boot分区，由bootloader来引导启动，其启动过程本质也是和分开的uImage&ramdisk.img类似，只不过把两个镜像按照一定的格式合并为一个镜像而已。
- ramdisk.img（ **内存磁盘镜像** ）是根文件系统：android启动时首先加载ramdisk.img镜像，并挂载到/目录下，并进行了一系列的初始化动作，包括创建各种需要的目录，初始化console，开启服务等， **尽管ramdisk.img需要放在Linux内核镜像（boot.img）中** ，但却属于Android源代码的一部分。

实际上Android的编译系统生成了三部分内容（android 9以后）

1. boot.img：仅包含正常启动内核。
2. recovery.img：包含恢复内核和恢复 ramdisk.img。
3. system.img：包含原始 system.img 和 ramdisk.img 的合并内容

boot.img：Android系统中，通常会把zImage （ 内核镜像uImage文件） 和ramdisk.img打包到一起，生成一个 **boot.img镜像文件，放到boot分区** ，由bootloader来引导启动，其启动过程本质也是和分开的uImage&ramdisk.img类似，只不过把两个镜像按照一定的格式合并为一个镜像而已。现在是将ramdisk.img与system.img放到一起了。

## 1.2 启动流程

![](https://pic2.zhimg.com/v2-ca5e42b4f9a546b67cf3fe1d8850a47d_1440w.jpg)

**bootloader会从boot分区开始启动。**

Boot分区的格式是固定的，首先是2K或者 **4K的 文件头** ，后面跟着用 **gzip压缩过的内核** ，再后面是 **ramdisk根文件系统** ，然后是第二阶段的载入程序（可选） **recovery.img** ：recovery分区的镜像，一般用作系统恢复

注：zImage文件，通过mkimage命令，给zImage文件加上了64个字节的数据头得到uImage文件，这样才能被u-boot识别

BootLoader的启动通常分为两个阶段。

其实Bootloader主要的必须的作用只有一个： **就是把操作系统映像文件拷贝到RAM中去，然后跳转到它的入口处去执行** ，我们称之为启动加载模式，该过程没有用户的介入，是它正常工作的模式。它的步骤如下：

### Stage1:

```
硬件设备初始化。为stage2的执行及随后内核的执行准备好基本的硬件环境
为加载stage2 准备ram空间。为了获得更好的执行速度，通常吧stage2加载到ram中执行
复制stage2的代码到ram中
设置好堆栈
跳转到stage2的c程序入口
```

### Stage2：

```
初始化本阶段要使用的硬件设备
检测系统内存映射
将内核映像和根文件系统映像从flash读到ram中
为内核设置启动参数
调用内核
```

Kernel负责 **启动各个子系统** ，例如CPU调度子系统和内存管理子系统等等。

Kernel启动完成之后，就会将 **Ramdisk镜像安装为根系统** ，并且在其中找到一个 **init文件** ，将其启动为 **第一个进程** 。

init进程启动就意味着系统进入到 **用户空间** 执行了，这时候各种用户空间运行时以及 **守护进程** 就会被加载起来。最终完成整个系统的启动过程。

android加载这3个镜像文件后，会把 system和 userdata分别加载到 **ramdisk文件系统 中的system和 data目录下** 。

## 1.3 A/B分区

Android从7.0开始引入新的OTA升级方式， **A/B System Updates** ，这里将其叫做A/B系统。A/B系统就是设备上有 **A和B两套可以工作的系统** （用户数据只有一份，为两套系统共用），简单来讲，可以理解为 **一套系统分区，另外一套为备份分区** 。其系统版本可能一样；也可能不一样，其中一个是新版本，另外一个旧版本，通过升级，将旧版本也更新为新版本。当然，设备出厂时这两套系统肯定是一样的。

AVB 的设计旨在与 A/B 配合使用，要求描述符中存储的任何分区名称中都不得使用 A/B 后缀。以下是具有两个插槽的示例：

![](https://pic2.zhimg.com/v2-97a0ed347dd0f1cef4e274cc807d5c4f_1440w.jpg)

请注意，不同插槽之间的回滚索引有何不同 - 对于插槽 A，回滚索引为 ， `[42, 101]` 而对于插槽 B，回滚索引为 `[43, 103]` 。

系统会在非易失的存储中保存着一份“slot metadata”，用它来管理当前要从哪个slot启动，“ **slot metadata** ”记录了：

- 上一次开机是从哪个slot启动
- 每个slot可以尝试启动的次数
- 每个slot是否成功启动过的状态
- 每个slot是否已经被认为是损坏的状态

根据“slot metadata”，于是在U-boot下就有如下状态机用于决定这次要启动哪个slot，如下图：

![](https://pic1.zhimg.com/v2-deaca53361dc85d0d3c62a134fd91dfa_1440w.jpg)

```
int ab_select_slot(struct blk_desc *dev_desc, struct disk_partition *part_info,
           bool dec_tries)
{
```

## 2\. AVB简介

## 2.1 AVB介绍

上面提到了安卓的镜像分区，那么这些镜像就需要进行 **安全校验** 了，就是下面我们要介绍的AVB（Android Verified Boot）。

> 这么多分区怎么校验？  
> google想到了这样的设计：通过 **增加一个独立的分区，这个分区包括了其他分区的重要校验信息** ；只要保证这个vbmeta的足够安全（uboot去验证，作为根），那么vbmeta中包含的其他分区的信息也就足够安全。

uboot初始化完成后，按照AVB标准流程加载、验证和启动Linux内核镜像（boot.img），然后Linux基于 [dm-verity](https://zhida.zhihu.com/search?content_id=273007042&content_type=Article&match_order=1&q=dm-verity&zhida_source=entity) 机制对根文件系统（system.img）进行分块验证和访问。校验分为两类：

1. **小分区** ： **可以整个加载到内存里面** ，计算hash值进行校验，例如boot和dtbo这类
2. 大 **分区** ： **内存装不下这么大的分区** ，例如文件系统，这时候需要使用hash树进行分解校验，一部分一部分加载到内存，利用树状结构进行校验。 **dm-verity** 驱动就是干这个事情的，可以启动时校验也可以运行时校验。

AVB2.0被用于启动引导，此用法添加一个“ **vbmeta.img** ”镜像。

**public key被编译到bootloader中** 用于 **校验vbmeta数据** ，vbmeta.img包含应 **由此public key验证的签名。**

vbmeta.img包含用于 **验证的public key** ，但只有bootloader验证过vbmeta.img才会可信，就好比认证一样，包含可信public key和签名。

![](https://pic4.zhimg.com/v2-4043f9a94a6d2e88fc16c10fe79416f7_1440w.jpg)

因此，我们在AVB中有两个重要key， **一个验证vbmeta.img的OEM key，一个验证其他分区(boot/system/vendor)的verity key** 。当然可以使用OEM key作为verity key。

我们知道OEM key用于在bootloader阶段验证vbmeta.img。这还不够，我们必须验证其他分区， **vbmeta.img包含的public key** 用于此目的。就像avb1.0中verity key一样，此public key用于验证system、vendor分区和boot分区。

这里有些不同之处，avb1.0使用OEM key验证boot分区，使用verity key验证system/vendor分区，但avb2.0使用OEM key验证vbmeta.img，并使用其中包含的public key验证其他分区(system/vendor/boot等)。

**启动时bootloader将验证两个分区** ， **一个是使用OEM key验证vbmeta.img** ， **一个是使用vbmeta.img所包含的public key验证boot分区** ，而system/vendor分区 **由init/fs\_mgr来验证** (使用vbmeta.img所包含的public key)。(注意从1.0到2.0的顺序变化)

![](https://pic2.zhimg.com/v2-951f8fe30d2b5d30280277dba6f5c977_1440w.jpg)

总结就是：

1. Uboot验证vbmeta分区
2. vbmeta验证boot.img（uboot阶段）
3. 启动内核和init进程
4. init进程拉起来dm-verity驱动，使用Hash树来运行时验证其他分区。

uboot中已经支持开源的 **libavb库** ，只需要调用接口就可以进行验证vbmeta.img和boot.img

## 2.2 VBMeta分区

![](https://pic4.zhimg.com/v2-a346da1e7559fa63c73ad812995795ff_1440w.jpg)

AVB2.0增加了一个vbmeta分区，对应的 **vbmeta.img** 由make\_vbmeta\_image工具编译生成的，其主要包含如下三大部分：

```
vbmeta image header(256 Bytes)
authentication data
    hash
    signature
auxiliary data
    public key
    public key metadata
    descriptors
        hash descriptors
        hashtree descriptors
        chain partition descriptors
```

vbmeta分区保存了 **受保护分区的所有信息** ，每个被avb2.0保护的分区后面都有一个vbmeta结构。vbmeta结构中包含多个描述符(和其他元数据)，并且所有这些数据都被加密签名。 **受保护的分区可以配置为hash分区或者chain(链式)分区：**

- **hash分区：hash校验** ，用hash描述符中hash(保存在vbmeta分区的vbmeta结构里)验证目标分区（看目标生成的保存我这里的一样不）
- **chain分区：key校验** ，用chain分区描述符中的public key(保存在vbmeta分区的vbmeta结构里)验证目标分区vbmeta结构的完整性(vbmeta被private key签名)

VBMeta 摘要是所有 VBMeta 结构的摘要，包括根结构（例如在分区中 `vbmeta` ）和链接分区中的所有 VBMeta 结构。此摘要可以在构建时使用计算 `avbtool calculate_vbmeta_digest` ，也可以在运行时使用 `avb_slot_verify_data_calculate_vbmeta_digest()` 函数计算。它也可以在内核命令行上设置为 `androidboot.vbmeta.digest` ， `avb_slot_verify()` 有关确切详细信息，请参阅文档。

此摘要可与加载的操作系统中的用户空间一起使用 `libavb` ，以验证加载的 vbmeta 结构的真实性。如果信任根和/或存储的回滚索引仅在引导加载程序中运行时可用，则这很有用。

此外，如果 VBMeta 摘要包含在硬件支持的证明数据中，则依赖方可以提取摘要并将其与已知良好操作系统的摘要列表进行比较，如果找到，则可以为应用程序正在运行的设备提供额外的保证。

### 2.2.1 chain分区：key校验

![](https://pic2.zhimg.com/v2-4c779db3afe75d8cf273eb356ac1342f_1440w.jpg)

AVB 中使用的中心数据结构是 **VBMeta 结构** 。此数据结构包含许多描述符（和其他元数据），所有这些数据都经过加密签名。描述符用于图像哈希、图像哈希树元数据和所谓的 *链式分区*

key0来自bootloader的oem\_pubk

其中主vbmeta分区在哈希描述符中保存boot分区的哈希，对于system和vendor分区，哈希表在文件系统之后，主vbmeta分区在哈希表描述符中保存哈希表的root hash、salt和offset。（这里想起前面的哈希树没–roothash）

因为vbmeta分区中的vbmeta结构是以密码方式签名的，所以bootloader可以检测签名，并验证它是有key0的所有者(例如，通过嵌入key0的公共部分)创建的，从而信任于boot、system和vendor。

**链式分区描述符用于委托权限** ——它包含委托权限的分区名称以及该特定分区上的签名所信任的public key。 `boot``system``vendor``vbmeta``vbmeta``key0``key0``boot``system``vendor`

### 2.2.2 hash分区：hash校验

![](https://pic2.zhimg.com/v2-5cd9f977c0dfa793a1f7a2ede70ac933_1440w.jpg)

链式分区描述符用于 **委派权限** - 它包含委派权限的分区的名称以及受信任的公钥，可用于此特定分区上的签名

在此设置中， `xyz` 分区具有用于完整性检查的哈希树。哈希树后面是 VBMeta 结构，其中包含带有哈希树元数据（根哈希、盐、偏移量等）的哈希树描述符，并且此结构已用 签名 `key1` 。最后，在分区的末尾是一个页脚，其中包含 VBMeta 结构的偏移量。

此设置允许引导加载程序使用链分区描述符来查找分区末尾的页脚（使用链分区描述符中的名称），这反过来有助于定位 VBMeta 结构并验证它是否由 `key1` （使用 `key1_pub` 存储在链分区描述符中的）签名。至关重要的是，因为有一个带有偏移量的页脚，所以 `xyz` 可以更新分区而无需 `vbmeta` 对分区进行任何更改。

VBMeta 结构非常灵活，允许任何分区的哈希描述符和哈希树描述符存在于该 `vbmeta` 分区、用于完整性检查的分区（通过链分区描述符）或任何其他分区（通过链分区描述符）中。这允许广泛的组织和信任关系。

链接分区不需要使用页脚 - 允许链接分区指向 VBMeta 结构位于开头的分区（例如，就像分区一样 `vbmeta` ）。这对于整个组织拥有的分区的所有哈希和哈希树描述符都存储在专用分区中的用例非常有用，例如 `vbmeta_google` 。在此示例中，的哈希树描述 `system` 符位于 `vbmeta_google` 分区中，这意味着引导加载程序根本不需要访问该分区，如果将分区作为逻辑分区进行管理（例如通过LVM 技术或类似技术）， `system` 这将很有帮助。 `system`

### 2.2.3 AVBkey

![](https://pic3.zhimg.com/v2-a49126164108cabdf8cef1018e8299f6_1440w.jpg)

AVB key 是一对非对称密钥。 **私钥用来签名，公钥用来验证** 。如关系如图所示：

![](https://pic3.zhimg.com/v2-99c4d84e1d9317f3e2719b53d8348752_1440w.jpg)

## 2.3 dm-verity

![](https://pic1.zhimg.com/v2-5acd28292f544d5f55f8457230e49c26_1440w.jpg)

**device-mapper-verity** 简称 **dm-verity** ，用于大分区例如文件系统的校验。

1、能不能将多个硬盘，映射成一个逻辑的硬盘，那样我们程序就不用关心复杂的地址问题了，也不用关系是哪个device了？DM-raid技术RAID全称为独立磁盘冗余阵列(Redundant Array of Independent Disks)

2、将某个地址段的数据进行加密，只有授权方式才可访问，比如FDE。DM-crypt技术

3、访问存储介质上的数据时，校验下是否被篡改过。DM-verity技术。

DM就是Device-Mapper的缩写，也就说上述的想法都可以基于 [Device Mapper](https://zhida.zhihu.com/search?content_id=273007042&content_type=Article&match_order=1&q=Device+Mapper&zhida_source=entity) 实现，Device Mapper可不仅仅实现了这些，还包括LVM2、DM-multipach等。

**dm-verity是内核子系统的Device Mapper中的一个子模块** ，所以在介绍dm-verity之前先要介绍一下Device Mapper的基础知识。

Device Mapper为Linux内核提供了一个 **从逻辑设备到物理设备的映射框架** ，通过它，用户可以定制资源的管理策略。当前Linux中的逻辑卷管理器如LVM2（Linux Volume Manager 2）、EVMS（Enterprise Volume Mageagement System）、dmraid等都是基于该机制实现的。（一堆陌生词汇，扫盲点安排上了）

Device Mapper有三个重要的概念： **映射设备（Mapped Device）** 、 **映射表** 、 **目标设备（Target Device）** ；

映射设备是一个 **逻辑块设备** ，用户可以像使用其他块设备那样使用映射设备。映射设备通过映射表描述的映射关系和目标设备建立映射。对映射设备的读写操作最终要映射成对目标设备的操作。而目标设备本身不一定是一个实际的物理设备，它可以是另一个映射设备，如此反复循环，理论上可以无限迭代下去。映射关系本质上就是表明映射设备中的地址对应到哪个目标设备的哪个地址。（无限套娃）

Device Mapper是一个灵活的架构，映射设备映射一个或多个目标设备，每个目标设备属于一个类型，类型不同，对I/O处理不同，构造目标设备的方法也不同。映射设备可以映射多个不同类型的目标设备。

dm-verity类型的设备需要两个底层设备， **一个是数据设备** ，顾名思义是用来存储数据，实际上就是要 **保障完整性的设备** ， **另一个是哈希设备** ，用来存储哈希值， **在校验数据设备完整性时需要。**

## 2.4 Hash树

![](https://pic4.zhimg.com/v2-078b5eb4c4df862d073b7b7dc4784177_1440w.jpg)

**哈希树（hash tree； [Merkle tree](https://zhida.zhihu.com/search?content_id=273007042&content_type=Article&match_order=1&q=Merkle+tree&zhida_source=entity) ）** ，在密码学及计算机科学中是一种树形数据结构，每个叶节点均以数据块的哈希作为标签，而除了叶节点以外的节点则以其子节点标签的加密哈希作为标签 。 **哈希树能够高效、安全地验证大型数据结构的内容。**

哈希树的顶部为 **顶部哈希（top hash）** ，亦称 **根哈希（root hash）** 或 **主哈希（master hash）** 。只要任一叶节点有变化，根哈希都会变。在比特币区块里，所有交易都按照Merkle Tree的格式组织起来，再跟区块头里的hashMerkleTreeRoot对应起来，就可以保证本区块交易信息的不可篡改。

## 2.5 回滚保护

AVB 包含回滚保护，用于 **防范已知的安全漏洞** 。每个 VBMeta 结构都嵌入了一个 *回滚索引* ，如下所示：

![](https://pic3.zhimg.com/v2-6e26d0caded3dcd68dc365beb9a46184_1440w.jpg)

这些数字被称为， `rollback_index[n]` 随着安全漏洞的发现和修复，每个图像的数字都会增加。此外，设备将最后看到的回滚索引存储在防篡改存储中：

![](https://pic3.zhimg.com/v2-e9a932f9e42f26c4723e96b8e52bcfde_1440w.jpg)

并且这些被称为 `stored_rollback_index[n]` 。

回滚保护是指让设备拒绝图像，除非 `rollback_index[n]` >= `stored_rollback_index[n]` 所有 `n` ，并且让设备随时间增加。具体如何做到这一点将在更新存储的回滚索引 `stored_rollback_index[n]` 部分讨论。

参考：

1. [developer.aliyun.com/ar](https://link.zhihu.com/?target=https%3A//developer.aliyun.com/article/1411144%3Fspm%3Da2c6h.14164896.0.0.624047c5tzrw2i%26scm%3D20140722.S_community%40%40) 文章@@1411144.\_.ID\_1411144-RL\_Android安全启动学习-LOC\_search~UND~community~UND~item-OR\_ser-V\_3-P0\_1
2. [android.googlesource.com](https://link.zhihu.com/?target=https%3A//android.googlesource.com/platform/external/avb)
3. [wx.comake.online/doc/do](https://link.zhihu.com/?target=https%3A//wx.comake.online/doc/doc/SigmaStarDocs-SSD238X-Android-20240712/platform/Android/bootflow.html)

> 后记：  
>   
> 学的越 **多** ，不知道的越 **多** ，忘记的越 **多** 。这么多“多”，如果 **事无巨细** ，把这些知识都一次学习到位，都记到脑子里面 **是不现实的** ，就像这篇博客，笔者也是参考了很多资料，并不是完全自己写的，只能算是学习别人的技术，所以自己第一遍写出来也是有“ **无力感** ”：自己也没完全100%理解和考证。但是如果有朝一日，要调试这块功能，可以投入巨量的时间，把代码从头到尾捋一遍，而且把文章中的这些描述汉字，或者官网： [android.googlesource.com](https://link.zhihu.com/?target=https%3A//android.googlesource.com/platform/external/avb) 都研究N遍，那未尝不能成为专家。真是那句：“ **好书要读多遍才能消化** ”。  
> 对于业余选手，掌握到什么程度比较合适？-- **画出一个原理图** ，甚至就是逻辑图。就像你的方案去参加评审，一堆架构和领导去评审，他们真的懂你的技术么，他们或许不懂，但是 **他们都是懂逻辑啊** ，你的流程图中肯定不能有逻辑破绽，或者他们强大的各方面都思考到的能力，从各个维度来进行评价。俗话说：一拍脑袋只要觉得合理什么都敢干， **第一性原则** ，乱拳打死老师傅，或许这也是 **创新** 。  
>   
> 这里也涉及一个内功功力的问题，技术到一定程度就是 **大道相通** ，有最基础的理论基础，其他都是衍生。从各种技术和代码中抽取出来的应该就是 **方案** ，能 **画出来，讲出来** ，对比其他方案优缺点都列出来，就是功力高深啊，所谓：“ **大道至简** ”。

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位有自己公众号的留言： **申请转载** ！

纯干货持续更新，欢迎 **分享给朋友** 、点赞、收藏、在看、划线和评论交流！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

发布于 2026-04-13 15:06・上海[2026 年了，为什么我还在劝你买一支 AI 录音设备？TicNote vs 钉钉 A1 深度横评](https://zhuanlan.zhihu.com/p/1982472325015283692)

[

一、引言 你有没有发现一个悖论——我们每天吞吐的信息量远超过去，但真正留在大脑里的却越来越少。会议、访谈、直播、长...

](https://zhuanlan.zhihu.com/p/1982472325015283692)