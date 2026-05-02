---
title: "IO子系统全流程介绍"
source: "https://zhuanlan.zhihu.com/p/545906763"
author:
  - "[[PilgrimTaolinux内核从业者，单片机爱好者]]"
published:
created: 2026-05-02
description: "代码基于linux kernel-5.19-rc5，作为IO子系统的初学者，文章如果有错误，请大家慷慨指出。 kernel的各个子系统互相独立又相互纠缠，这篇文章旨在从系统调用到硬件磁盘给大家简单捋一遍整个io子系统的主线流程。中…"
tags:
  - "clippings"
---
目录

代码基于 [linux kernel](https://zhida.zhihu.com/search?content_id=209445970&content_type=Article&match_order=1&q=linux+kernel&zhida_source=entity) -5.19-rc5，作为IO子系统的初学者，文章如果有错误，请大家慷慨指出。

kernel的各个子系统互相独立又相互纠缠，这篇文章旨在从系统调用到硬件磁盘给大家简单捋一遍整个io子系统的主线流程。中间涉及系统调用([syscall](https://zhida.zhihu.com/search?content_id=209445970&content_type=Article&match_order=1&q=syscall&zhida_source=entity)) -> 文件系统(fs) -> buffer\_head/iomap -> [bio](https://zhida.zhihu.com/search?content_id=209445970&content_type=Article&match_order=1&q=bio&zhida_source=entity) -> [request](https://zhida.zhihu.com/search?content_id=209445970&content_type=Article&match_order=1&q=request&zhida_source=entity) ->io调度器 -> io软件调度队列(ctx) -> io硬件调度队列(hctx) -> scsi磁盘驱动 等相关知识，如果大家不知道上面讲了个什么鬼，不要着急请耐心看完，可能你会有所收获。

## 前言

开篇先引入一个简单的c语言代码

```c
int main()
{
       char buff[128] = {0};
       int fd = open("/var/pilgrimtao.txt", O_CREAT|O_RDWR);
​
       write(fd, "pilgrimtao is cool", 18);
       pread(fd, buff, 128, 0);
       printf("%s\n", buff);
​
       close(fd);
       return 0;
}
```

这个demo非常简单，但是一些问题引发了我们的思考，例如read和write函数如何读写磁盘数据的，kernel如何解析fd、buf、len等参数，并转换为磁盘能看懂的信息，读出磁盘对应位置的数据的？

c函数库中read和write对应着内核的sys\_read和sys\_write两个系统调用（可用strace工具验证），我们将从这两个系统调用开始探索。

将大象放入冰箱需要3步，那么读写磁盘需要几步？

sys\_read：

1. 申请内存
2. 将磁盘内容读到内存中
3. 将内存内容返回用户态

sys\_write

1. 申请内存
2. 将磁盘内容读到内存中
3. 将需要修改的数据写入内存中

你肯定已经发现了，sys\_write和sys\_read前两步是完全相同的，对于sys\_write而言，在写磁盘之前要把磁盘数据先读出来，修改完再写回去，也是非常合理的。但是有两点需要注意，sys\_write并没有写磁盘的操作，而是把这个操作交给了定期开启的回写进程，如果不久之前刚读过磁盘，导致内存中有磁盘数据的缓存，那么本次读取时直接读取内存的缓存数据即可，避免了耗时的磁盘操作，这也是人们把这类内存称为page cache的原因。

如果阅读了sys\_write和sys\_read系统调用的代码，可以发现这两个函数基本没什么干货，只是做了一些简单的check操作，然后直接进入了文件系统的 [file\_operations](https://zhida.zhihu.com/search?content_id=209445970&content_type=Article&match_order=1&q=file_operations&zhida_source=entity) 回调函数。file\_operations回调函数是文件系统自定义的，我这里用 [xfs文件系统](https://zhida.zhihu.com/search?content_id=209445970&content_type=Article&match_order=1&q=xfs%E6%96%87%E4%BB%B6%E7%B3%BB%E7%BB%9F&zhida_source=entity) 举例（初学者也可以阅读minix文件系统的源码做为铺垫，因为它足够简单）。

> 代码参考：  
> SYSCALL\_DEFINE3(read,...) -> ksys\_read -> vfs\_read -> read\_iter -> xfs\_file\_read\_iter  
> SYSCALL\_DEFINE3(write,...) -> ksys\_write -> vfs\_write -> new\_sync\_write -> call\_write\_iter ->write\_iter -> xfs\_file\_write\_iter

磁盘(disk)的访问模式有三种 BUFFERED、DIRECT、DAX。前面提到的由于page cache存在可以避免耗时的磁盘通信就是BUFFERED访问模式的集中体现；但是如果我要求用户的write请求要实时存储到磁盘里，不能只在内存中更新，那么此时我便需要DIRECT模式；大家可能听说过flash分为两种nand flash和nor flash，nor flash可以像ram一样直接通过地址线和数据线访问，不需要整块整块的刷，对于这种场景我们采用DAX模式。所以file\_operations的read\_iter和write\_iter回调函数首先就需要根据不同的标志判断采用哪种访问模式。

## bio机制

常见的磁盘有机械硬盘和固态硬盘两种，机械硬盘是由一个个扇区组成，而固态硬盘由一个个存储页组成，我们统称它们为sector，为了兼容历史，我们规定一个sector为512字节。因此访问磁盘时我们需要两个信息，数据存储的sector位置和连续sector的数目。磁盘需要内存作为缓存以提高访问速度，所以我们需要先申请内存，并确定的page地址和页内偏移。磁盘驱动只有拿到sector位置、sector数目、page(folio)地址、page(folio)页内偏移才能将数据写入或者写出。

### folio简介

首先做一个简单科普，如图所示，内存是以page (4k)为单位的

![](https://pic3.zhimg.com/v2-58538a39bdc737bde8c3e5c2776a2d3a_1440w.png)

kernel在2020年12月的 [patch](https://link.zhihu.com/?target=https%3A//git.kernel.org/pub/scm/linux/kernel/git/next/linux-next.git/commit/%3Fid%3D7b230db3b8d373219f88a3d25c8fbbf12cc7f233) 中提出了folio的概念，我们可以把folio简单理解为一段连续内存，一个或多个page的集合，他和page的关系如图

![](https://pica.zhimg.com/v2-e89b418c0e572e657e4e62e4aaa156d6_1440w.jpg)

图中展示了一个8k的folio，同理我们也可以申请16K或者32K的folio，本质上是folio\_alloc也是调用了alloc\_pages(gfp, order)，对比4K的folio和4K的page其实没什么区别，而且现在kernel的folio cache一般也都是4K，但是下文依然想用folio的称呼替代page，可能是因为folio是未来趋势，代码中也是用folio表示的。

> 代码参考：xfs\_file\_write\_iter -> xfs\_file\_buffered\_write -> iomap\_file\_buffered\_write -> iomap\_write\_iter -> iomap\_write\_begin -> \_\_filemap\_get\_folio -> filemap\_alloc\_folio

### file、mem和disk的映射关系

如sys\_read和sys\_write所表示的那样，kernel给用户营造的视角是一个地址连续的file，用户读取file内容时只需要从偏移地址0的位置一直读到文件结尾，但是实际文件数据存储在mem和disk上却是不连续的。那么他们之间的关系是怎样的呢，我给大家举个例子。

![](https://pic3.zhimg.com/v2-0ed0771a4792c989593871a3dc362afe_1440w.jpg)

如果上图是一个12K的文件，那么我可以将这个文件分为3个4K的数据块，将这3个4k的数据块存储在不连续的3个4K folio中，针对每个folio又能以文件系统自定义的block size（不是磁盘sector）为单位，将一个folio映射多个不连续的磁盘空间。

kernel需要定义一些数据结构来表示这个映射关系，同时也需要存储一些关键信息，例如sector位置、sector数目、folio 地址、folio页内偏移等等，我们需要用具体的结构体将它表示出来，所以kernel定义了struct bio来实现这一目的，如下图。

![](https://pic4.zhimg.com/v2-fc8435e660889f954170cb3a6096b2b3_1440w.jpg)

struct bio描述了一段连续的磁盘空间，bvec\_iter.bi\_sector和bvec\_iter.bi\_size分别记录这段连续物理磁盘的起始段号和总大小。kernel也会申请一个名叫bio\_vec的数组，赋值给bio.bi\_io\_vec，一个bio\_vec描述了一段连续的mem空间，并且它不会超过一个folio的范围。bio\_vec.bv\_page记录了这个folio的head page，bio\_vec.bv\_offset记录folio内部offset，bio\_vec.bv\_len记录了mem映射长度，bv\_len一般不会超过一个folio size的长度，除非两个folio物理地址是连续的，会通过bio\_add\_page合并bio\_vec。一个bio中包含多少个bio\_vec取决于，bio描述的这一段连续的磁盘空间映射了多少个不连续mem空间，同时如果一个bio中bio\_vec的数目达到了bio\_vec数组的最大值，也另外申请新的bio，至于bio\_vec数组的最大值由bio初始化的时候指定（见函数bio\_alloc）。每当bio使用了一个bio\_vec，bio.bi\_vcnt就会累加，如果想使用新的bio\_vec，直接使用bio\_vec的bi\_vcnt偏移的成员即可。有个比较有意思的现象是，sys\_write产生的bio只有一个bio\_vec，但是sys\_read产生的bio却有多个bio\_vec。

### bio关键信息获取

用户调用syscall时，内核能获取到的信息只有文件fd、文件offset、读写size，如syscall的形参所表示的那样，但是磁盘(disk)并不能识别文件的fd、offset、size，我们需要将它们转化成磁盘能看懂的信息。那么如何将用户层传进来的file fd和file offset转化为folio offset、folio len、sector ID、sector size，并把这些信息交给struct bio打包起来，发送给disk，是我们要考虑的问题。

### 获取folio信息

每一个file都会维护一棵基数树（radix tree，当前kernel优化为xarray），这棵树保存在一个per file的结构体address\_space->i\_pages中，这个文件已经映射过的folio都存储在了这棵树上，如果我们发现需要读写的folio可以在这棵树中找到，那么便不需要申请新的folio，直接从树上拿过来用即可（参考\_\_filemap\_get\_folio函数），最终将folio head赋值给bio\_vec.bv\_page。

想要获得内存的folio offset和folio len十分简单，folio不仅仅在mem物理地址维度是连续的，它描述的文件数据在用户file角度也是连续的，所以我们只需要将file offset除以folio size（这里是4K）再取余数，就能得到folio offset，folio len为用户读取文件的size，保证磁盘连续的前提下与folio size取最小值。

### 获取sector信息

如果想要获取磁盘的sector ID和sector size比较复杂。一个文件有很多固有属性，包括文件名、创建时间、访问时间、修改时间、文件存储在磁盘的位置(sector ID和sector size)等，他们都存储在struct inode结构体中，每个实体文件都维护着自己私有的inode，大家可能会想，获取磁盘的sector ID和sector size有什么难的，直接从struct inode读取不就好了？事实确实是这样，如果inode存在那么确实十分简单，但是如果物理机刚刚重启过，内存清空，inode需要重建，这些信息又从何处而来？而且inode的数目十分庞大占据大量的内存空间，当内存不足时，kernel会清除这些繁重的inode（参考shrink\_slab函数），那么此时又如何获得磁盘的sector ID和sector size。不必担心文件系统会专门从磁盘中开辟一段空间存储inode信息，xfs中有一条路径是在磁盘mount的时候，将挂载位置的第0号sector保留，专门存储所有文件的inode信息，因此inode也可以理解为磁盘上文件固有属性的mem cache。

如前文所述，如果inode不存在或者被回收，此时sys\_write流程便会发生如下变化

1. 申请内存
2. 将磁盘的file inode信息读到内存中
3. 解析inode，填充bio
4. 将磁盘中真正的文件数据读到内存中
5. 将需要修改的数据写入内存中

我们可以看到，虽然只有一次sys\_write调用，但是至少会有两次读磁盘的操作，第一次读磁盘只为重建inode，第二次读磁盘才是真正的填充文件数据。

> 读取磁盘inode代码参考：iomap\_file\_buffered\_write -> iomap\_iter -> **.iomap\_begin** -> xfs\_buffered\_write\_iomap\_begin -> xfs\_iread\_extents -> xfs\_btree\_visit\_blocks -> xfs\_btree\_readahead\_ptr -> xfs\_buf\_readahead -> xfs\_buf\_readahead\_map -> xfs\_buf\_read\_map -> xfs\_buf\_read -> xfs\_buf\_submit -> \_\_xfs\_buf\_submit -> xfs\_buf\_ioapply\_map -> submit\_bio  
> 上面路径是用xfs举例的，不同的文件系统代码不同，所以这些函数知道就好，不重要。

直到现在我也不能完全回答文件系统的一些问题，文件系统到底还有什么用，在io通信的各个环节中处于什么地位，不同种类的文件系统的区别和适用场景是什么？而且xfs代码比我预想的更复杂，没有几个月也啃不下来，以后有机会再分享吧。

### iomap机制如何打包bio

sys\_read场景下，我用流程图的方式给大家展示一下从syscall到bio生成的大概过程。

![](https://pic3.zhimg.com/v2-a8b98668d95bf00d10fd9d1cfb6e482a_1440w.jpg)

> 从sys\_read读文件开始。

![](https://pica.zhimg.com/v2-fc6e7b11e06548a26f1890ce1ce0cfac_1440w.jpg)

> 代码参考： xfs\_file\_read\_iter -> xfs\_file\_buffered\_read -> generic\_file\_read\_iter -> filemap\_read -> filemap\_get\_pages -> filemap\_create\_folio -> filemap\_alloc\_folio -> folio\_alloc  
> filemap\_get\_pages -> filemap\_readahead -> page\_cache\_async\_ra -> ondemand\_readahead -> do\_page\_cache\_ra -> page\_cache\_ra\_unbounded -> filemap\_alloc\_folio/filemap\_add\_folio

![](https://pic4.zhimg.com/v2-b71d88eef67b539f6a67e60d781504bd_1440w.jpg)

> 代码参考： xfs\_file\_read\_iter -> xfs\_file\_buffered\_read -> generic\_file\_read\_iter -> filemap\_read -> copy\_folio\_to\_iter(offset)

![](https://pic4.zhimg.com/v2-ba47dc852de40f36a778527fc5cd4277_1440w.jpg)

> 代码参考：filemap\_get\_pages -> filemap\_readahead -> page\_cache\_async\_ra -> ondemand\_readahead -> do\_page\_cache\_ra -> page\_cache\_ra\_unbounded -> read\_pages -> aops.readahead -> xfs\_vm\_readahead -> iomap\_readahead -> iomap\_iter -> ops.iomap\_begin（xfs文件系统维护的回调函数）

![](https://picx.zhimg.com/v2-62c76184ec2a02aefb4a5acad52871a3_1440w.jpg)

> 代码参考：iomap\_readahead -> iomap\_readahead\_iter -> iomap\_readpage\_iter -> bio\_alloc/bio\_add\_folio

![](https://pica.zhimg.com/v2-bcc4cb84409fd4aaa715a34c3f904a0e_1440w.jpg)

> 代码参考：iomap\_readahead -> iomap\_iter -> ops.iomap\_begin（xfs文件系统维护的回调函数）

![](https://pic4.zhimg.com/v2-fde4de9ae22ac615feb7de10e658ec23_1440w.jpg)

> 代码参考：iomap\_readahead -> iomap\_readahead\_iter -> iomap\_readpage\_iter -> bio\_alloc/bio\_add\_folio

![](https://pic4.zhimg.com/v2-933c36ea257e18a93be77ae5b0fb271f_1440w.jpg)

> 代码参考：  
> sys\_read：ondemand\_readahead -> do\_page\_cache\_ra -> page\_cache\_ra\_unbounded -> xa\_load（在sys\_read流程中，因为一开始就会把所有的folio都拿到，不是一个一个拿的）  
> iomap\_readahead\_iter -> readahead\_folio  
> sys\_write：  
> xfs\_file\_write\_iter -> xfs\_file\_buffered\_write -> iomap\_file\_buffered\_write -> iomap\_write\_iter -> iomap\_write\_begin -> \_\_filemap\_get\_folio -> mapping\_get\_entry/filemap\_add\_folio （在sys\_write流程，是用完一个folio，再申请新的folio）

![](https://pic2.zhimg.com/v2-d29dd0229a02c109c40b03ac04383917_1440w.jpg)

> 代码参考；iomap\_readahead\_iter -> iomap\_adjust\_read\_range

![](https://pic2.zhimg.com/v2-bc7eab154089d524c8f7e2685bee1ceb_1440w.jpg)

> 代码参考：iomap\_readahead -> iomap\_iter -> ops.iomap\_begin（xfs文件系统维护的回调函数）

![](https://pic4.zhimg.com/v2-2f179f01e1d8b6364364ac9aaf968ab1_1440w.jpg)

> 代码参考：  
> sys\_read：iomap\_readpage\_iter -> bio\_add\_folio -> \_\_bio\_try\_merge\_page  
> sys\_write：xfs\_file\_write\_iter -> xfs\_file\_buffered\_write -> iomap\_file\_buffered\_write -> iomap\_write\_iter -> iomap\_write\_begin -> \_\_iomap\_write\_begin -> iomap\_read\_folio\_sync -> bio\_init/bio\_add\_folio （一个bio只有一个bio\_vec）

![](https://pica.zhimg.com/v2-3d0d3fb0c30bf1e2b193f1acc4f91bb2_1440w.jpg)

> 最后通过submit\_bio或者submit\_bio\_wait，开始进入下一层级 “request层”。等submit\_bio结束，将folio的数据copy到用户buff中，返回用户态，或者是将用户态buff数据写到folio中，最后通过会写进程写回磁盘。

有些人可能会听说过buffer\_head机制，它是历史的产物，还有一些早期的文件系统使用buffer\_head机制，并且buffer\_head的bio一般只有一个bio\_vec，且bio\_vec一般以block\_size为单位。而iomap比buffer\_head更加灵活，并且iomap兼容了buffer\_head机制，如果使用iomap时标记为IOMAP\_F\_BUFFER\_HEAD，那么iomap就会走buffer\_head的回调函数。当前xfs也已经全面接入了iomap。

> 代码参考：.write\_begin -> minix\_write\_begin -> block\_write\_begin -> \_\_ block\_write\_begin -> \_\_ block\_write\_begin\_int -> ll\_rw\_block -> submit\_bh (minix文件系统举例)

有时bio layer的下一层是最终的磁盘驱动程序，例如 [drbd](https://zhida.zhihu.com/search?content_id=209445970&content_type=Article&match_order=1&q=drbd&zhida_source=entity) （分布式复制块设备）或 [brd](https://zhida.zhihu.com/search?content_id=209445970&content_type=Article&match_order=1&q=brd&zhida_source=entity) （基于 RAM 的块设备）。有时下一层是中间层，例如由 md 和 dm 提供的虚拟设备。最常见的可能是整个block层级结构中的其余部分，我选择将其称为“request layer”。

## request管理机制

### request简介

bio打包完成，现在我们需要将它发送给磁盘。一个bio描述了一段连续的磁盘空间，如果两个bio在磁盘物理地址正好是相邻的，组合起来也刚好是一段连续的磁盘空间，对于这种情况实际上也只需要给磁盘发送一次请求就够了，不需要将两个bio分别单独发给磁盘。因此为了将bio重新封装，把相邻的bio进行合并，kernel又提出了新的结构体struct request。struct request和struct bio的关系如图所示。

![](https://pic1.zhimg.com/v2-59e66c556947ebc2daa8b85d0a075fcc_1440w.jpg)

相邻的bio通过bio.bi\_next构成一个链表，挂载到struct request上，由request进行统一管理，request.bio记录链表头，request.biotail记录链表尾。为了使bio找到合适自己request，我们也需要将request串成链表统一管理，有新的bio来到时，只需要遍历链表就可以找到合适自己的request，进行merge。大家可能会有一些疑问，为什么内核不将两个连续的bio合并成一个bio，而仅仅用一个request将两个连续的bio串起来管理呢？因为每个bio都有自己的上下文环境，在很多场景下（参考submit\_bio\_wait），进程需要等这个bio结束，才能继续进行下一步操作，如果bio被合并没了，那么这个bio是否执行完成也无法通知到自己的上下文。

最后我按照地址是否连续给大家做一个总结

|  | 磁盘物理地址 | 用户文件地址 | 内存物理地址 |
| --- | --- | --- | --- |
| bio\_vec | 地址连续 | 地址连续 | 地址连续 |
| bio | 地址连续 | 地址连续 | 地址不连续 |
| request | 地址连续 | 地址不连续 | 地址不连续 |

注意：bio在设计上其实只要保证磁盘物理地址连续即可，但是由于用户读取文件为顺序读取，所以几乎在所有的使用场景下，bio和bio\_vec在用户视角的文件地址上也一定是连续的。

### current->plug链表

为了更好的管理request，内核定义了一个per task的结构体struct blk\_plug，我们可以在struct task\_struct找到它。同一个进程的request都会暂时挂载到blk\_plug.mq\_list中, 新的bio到来时，会遍历blk\_plug.mq\_list如果发现存在合适的request，那么就不必再申请新的request了，只需要在已经存在的request.bio链表上新增成员就可以了，具体是放在链表头还是链表尾取决于磁盘的相对位置（参考函数blk\_attempt\_bio\_merge）。

![](https://pic3.zhimg.com/v2-8a97e4893483f6cbbd60ac3c5c3d5cce_1440w.jpg)

> 代码参考：  
> 链表新增节点位置：submit\_bio -> submit\_bio\_noacct -> submit\_bio\_noacct\_nocheck -> \_\_ submit\_bio\_noacct\_mq/ \_\_ submit\_bio\_noacct -> \_\_ submit\_bio -> blk\_mq\_submit\_bio -> blk\_add\_rq\_to\_plug  
> 链表遍历位置：\_\_ submit\_bio -> blk\_mq\_submit\_bio -> blk\_mq\_get\_cached\_request -> blk\_mq\_attempt\_bio\_merge -> blk\_attempt\_plug\_merge

值得注意的是在2013年之后的版本中，plug机制已经不能满足硬件需求了，kernel又提供了新的机制来替代它，所以当前版本current->plug并不是必须的，例如sys\_read中使用了plug机制，但是sys\_write已经不再使用plug机制。具体是否使用取决于代码作者是否在调用submit\_bio函数前后调用了blk\_start\_plug和blk\_finish\_plug两个函数对blk\_plug进行初始化。

这里说一句题外话，当bio生成后必须调用submit\_bio函数，将bio再次封装后发送给disk。disk本质上属于一个块设备，使用“md”（例如软件 RAID）和“dm”（例如 LVM2）之类的虚拟块设备很可能会产生一个块设备堆，每个块设备都会修改一个 bio并将其发送到堆栈中的下一个块设备，大量块设备会造成内核调用堆栈溢出。为了避免submit\_bio函数嵌套导致的内核堆栈溢出，kernel会将同一进程的bio统一放到current->bio\_list暂时存储，submit bio时从bio\_list中一个一个取出进行submit。

> 代码参考：submit\_bio -> submit\_bio\_noacct -> submit\_bio\_noacct\_nocheck -> bio\_list\_add

### multi-queue多队列排队机制

2013年之后引入新的 [patch](https://link.zhihu.com/?target=https%3A//git.kernel.org/pub/scm/linux/kernel/git/next/linux-next.git/commit/%3Fid%3D320ae51feed5c2f13664aa05a76bec198967e04d) ，新增了io多队列排队机制。之前的plug仅仅在per task维度进行管理，显然对于日益复杂的硬件来说是远远不够的。现在一个物理机常常会接多块磁盘，每个磁盘可能归属不同厂商，硬件配置与软件驱动都不相同。所以kernel在per disk的维度为每个磁盘构建了blk\_mq\_ctx（软件队列）和blk\_mq\_hw\_ctx（硬件队列）来管理本磁盘所有的request，他们之间的关系如图所示

![](https://picx.zhimg.com/v2-87fc725a444e70804f106d3c5dcdd087_1440w.jpg)

request一般不需要往bk\_mq\_hw\_ctx.dispatch放，它仅仅用作内核或设备资源不足时（非错误），由函数blk\_mq\_request\_bypass\_insert将request暂时存储到这个链表，下次flush时重试，

前面提到过disk本质上属于一个块设备，如果对kernel设备驱动框架了解的同学可以明白，在scsi adapter driver代码的probe函数中会扫描所有的scsi devices（对于scsi协议的disk而言，disk即是一个scsi device），如果scsi找到了存在的disk设备，那么便会根据具体硬件对disk相关数据结构进行初始化，其中就包括struct blk\_mq\_ctx和blk\_mq\_hw\_ctx，所以也进一步说明ctx和hctx是per disk的。

> ctx申请代码参考：\_\_scsi\_scan\_target -> scsi\_report\_lun\_scan -> scsi\_alloc\_sdev -> blk\_mq\_init\_queue -> blk\_mq\_init\_queue\_data -> blk\_mq\_init\_allocated\_queue -> blk\_mq\_alloc\_ctxs/blk\_mq\_realloc\_hw\_ctxs

### blk\_mq\_ctx软件队列

在重io的服务器场景下，request的数量是庞大的，为了减少全局锁的使用，避免内核同步带来的麻烦，kernel将blk\_mq\_ctx定义为per cpu变量，每个request仅可以加到本cpu的blk\_mq\_ctx链表上，这也是kernel惯用的策略。在另一方面，io请求分为读和写，在nvme设备中读和写请求共用一个queue时，写请求会将读请求阻塞，因此kernel总结出三种模式供request进行选择 default模式、只读模式、poll轮询模式（详见HCTX\_MAX\_TYPES的定义），ctx和hctx都遵循这个标准。

![](https://pic1.zhimg.com/v2-a9a431354417d1be1884ee926c61bcea_1440w.jpg)

如果不使用plug机制（也就是不加blk\_start\_plug函数），此时若有一个只读request，它会直接根据自己的request->mq\_ctx成员，找到自己所映射的是哪个磁盘的ctx，然后将request加到当前cpu的ctx.rq\_lists\[HCTX\_TYPE\_READ\]链表中，关于plug链表中所做的bio合并操作在ctx.rq\_lists链表中也会重新做一遍。如果使用plug机制，plug链表和ctx.rq\_lists链表二者也并不冲突，blk\_plug.mq\_list最终也会通过blk\_finish\_plug或者主动调用blk\_flush\_plug，重新将request加到ctx.rq\_lists中。

> 代码参考：  
> bio合并：blk\_mq\_submit\_bio -> blk\_mq\_get\_new\_requests -> blk\_mq\_sched\_bio\_merge -> blk\_bio\_list\_merge -> blk\_attempt\_bio\_merge  
> request插入ctx：blk\_mq\_submit\_bio -> blk\_mq\_sched\_insert\_request -> \_\_ blk\_mq\_insert\_request -> \_\_ blk\_mq\_insert\_req\_list -> list\_add(&rq->queuelist, &ctx->rq\_lists\[type\])  
> 取出request：blk\_mq\_run\_hw\_queue -> \_\_ blk\_mq\_delay\_run\_hw\_queue -> \_\_ blk\_mq\_run\_hw\_queue -> blk\_mq\_sched\_dispatch\_requests -> \_\_ blk\_mq\_sched\_dispatch\_requests -> blk\_mq\_do\_dispatch\_ctx -> blk\_mq\_dequeue\_from\_ctx -> dispatch\_rq\_from\_ctx  
> \_\_blk\_mq\_sched\_dispatch\_requests -> blk\_mq\_flush\_busy\_ctxs（取出）/blk\_mq\_dispatch\_rq\_list（发送给磁盘）

### io调度器

其实ctx软件队列并不是必要的，kernel有很多可选的io调度器(elevator\_queue)，例如：bpf、kyber、deadline，实现思想和cpu调度器类似。io调度器通过自定义的回调函数ops.insert\_requests拿到新的request，使用一系列调度算法将request进行合并与重新排列，通过回调函数ops.dispatch\_request输出最合适的request，跳过ctx机制，直接将request发送给磁盘。我认为ctx和elevator\_queue两者是互相替代的关系，默认情况下使用ctx机制，在复杂的场景下可选择elevator\_queue机制，举个例子，对于机械硬盘而言，磁头需要通过不停的旋转扫描盘片数据，我们总是希望多个request之间尽管不是连续的，但也尽量是一个顺序分布的关系，以减少磁盘旋转的范围，提高访问速度，在这种情况下，不同的io调度器提供的不同调度策略往往能起到更好的效果。 ctx和elevator\_queue调度器本质上都是为了更高效的访问磁盘，殊途同归。具体io调度器的实现细节我也没看过，elevator\_queue内部是否会用到ctx也不是很清楚，以后再来填这个坑吧。

> 代码参考：  
> 插入：blk\_mq\_sched\_insert\_request -> ops.insert\_requests  
> 取出：\_\_ blk\_mq\_sched\_dispatch\_requests -> blk\_mq\_do\_dispatch\_sched -> \_\_ blk\_mq\_do\_dispatch\_sched -> ops.dispatch\_request  
> 将request发送给disk：\_\_ blk\_mq\_do\_dispatch\_sched -> blk\_mq\_dispatch\_rq\_list ->.queue\_rq

### blk\_mq\_hw\_ctx硬件队列

机械磁盘只有一个磁头在不断的旋转扫描扇区数据，所以它只有一个数据传输通道，但是对于flash而言，可能硬件上支持多个通道同时传输数据，所以磁盘驱动又定义了一种新的per disk per channel的数据结构struct blk\_mq\_hw\_ctx。

首先我对已知的request队列管理模式做了个简单的总结

![](https://pic3.zhimg.com/v2-7580e3e6914470cc2f45ff09e48dc490_1440w.jpg)

关于plug和ctx已经介绍过了，并且ctx和hctx都是per disk的结构体，但是per cpu的ctx如何映射per channel hctx呢？其实没有那么复杂，默认场景下它们仅仅是一一对应的关系，但是驱动也能根据blk\_mq\_ops->map\_queues回调函数自定义映射关系。

这里以默认的HCTX\_TYPE\_DEFAULT模式举例

![](https://pic4.zhimg.com/v2-4086f9eea4d0bd7f27bf18acc5084231_1440w.jpg)

HCTX\_TYPE\_READ和HCTX\_TYPE\_POLL（如果有）也是一样的映射关系，并且可以做到硬件通道层面的隔离，kernel也做了一个优化，当cpu数目大于硬件通道数目时，同一物理cpu的不同虚拟cpu所对应的ctx，会映射到同一hctx。

> 代码参考：blk\_mq\_alloc\_tag\_set->blk\_mq\_update\_queue\_map->blk\_mq\_map\_queues

内核支持同步和异步两种方式发送request，在hctx中维护了一个delayed\_work，用于异步方式往disk发送request，避免进程由于磁盘性能问题阻塞。

> blk\_mq\_sched\_insert\_request -> blk\_mq\_run\_hw\_queue -> \_\_ blk\_mq\_delay\_run\_hw\_queue ->（异步分支：hctx.run\_work -> blk\_mq\_run\_work\_fn） -> \_\_ blk\_mq\_run\_hw\_queue -> blk\_mq\_sched\_dispatch\_requests -> \_\_ blk\_mq\_sched\_dispatch\_requests -> blk\_mq\_dispatch\_rq\_list ->.queue\_rq

request经过合并和排序之后，不断的调用磁盘驱动的回调函数.queue\_rq，将request发送给磁盘。磁盘驱动会根据request和hctx记录的硬件信息生成总线对应的通信指令（如果磁盘是scsi设备，则会生成scsi\_cmd），存储到struct request结尾（参考函数blk\_mq\_rq\_to\_pdu）。仔细阅读代码会发现每次申请struct request结构体时，会申请远大于struct request结构体本身大小的内存，多出来的部分通过磁盘驱动.init\_request回调函数填充cmd（参考blk\_mq\_alloc\_rqs），直接用于通信。

代码再深入便是硬件厂商维护的驱动代码了，对于这种五花八门的驱动代码，确实提不起兴致，大家有需求自己琢磨吧。

## 附录

国外大佬的一些文章：

《A block layer introduction part 1: the bio layer》： [lwn.net/Articles/736534](https://link.zhihu.com/?target=https%3A//lwn.net/Articles/736534/)

《Block layer introduction part 2: the request layer》： [lwn.net/Articles/738449](https://link.zhihu.com/?target=https%3A//lwn.net/Articles/738449/)

《The multiqueue block layer》： [lwn.net/Articles/552904](https://link.zhihu.com/?target=https%3A//lwn.net/Articles/552904/)

硬件科普：

《固态硬盘的缓存是干什么的》 [bilibili.com/video/BV1a](https://link.zhihu.com/?target=https%3A//www.bilibili.com/video/BV1aF411u7Ct%3Fspm_id_from%3D333.999.0.0%26vd_source%3D31d8733f402556527c503c94374789c7)

编辑于 2022-07-25 17:02