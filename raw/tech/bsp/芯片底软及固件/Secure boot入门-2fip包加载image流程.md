---
title: "Secure boot入门-2fip包加载image流程"
source: "https://zhuanlan.zhihu.com/p/2026983828015556221"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "本小节 从代码的角度去看下，代码环境准备还是参考之前的文章：ATF入门-1qmeu搭建ARM全套源码学习环境，不用开发板免费学习ARM。 secure boot在arm上需要用到fip包，这里以bl1加载bl2为例，bl2.bin是在fip.bin里面…"
tags:
  - "clippings"
---
[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181)

2 人赞同了该文章

![](https://pic2.zhimg.com/v2-f66668d2679f713b8ccd881c454398b3_1440w.jpg)

本小节 **从代码的角度** 去看下，代码环境准备还是参考之前的文章： [ATF入门-1qmeu搭建ARM全套源码学习环境](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485508%26idx%3D1%26sn%3D99c019e8d4efddef614115d61bdfbffb%26chksm%3Dfa528e60cd2507766d08588aaed93f67c51fe6c77d502bebf8f6b429b2236c24d42d947e0108%26scene%3D21%23wechat_redirect) ， **不用开发板免费学习ARM** 。

**[secure boot](https://zhida.zhihu.com/search?content_id=272990613&content_type=Article&match_order=1&q=secure+boot&zhida_source=entity)** 在arm上需要用到 **[fip包](https://zhida.zhihu.com/search?content_id=272990613&content_type=Article&match_order=1&q=fip%E5%8C%85&zhida_source=entity)** ，这里以 **[bl1](https://zhida.zhihu.com/search?content_id=272990613&content_type=Article&match_order=1&q=bl1&zhida_source=entity) 加载 [bl2](https://zhida.zhihu.com/search?content_id=272990613&content_type=Article&match_order=1&q=bl2&zhida_source=entity) 为例** ，bl2.bin是在fip.bin里面进行打包的。参考之前的文章： [ATF入门-3BL2启动流程分析](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485554%26idx%3D1%26sn%3D320fe323b3ebf2f644c0d254ed22f4c4%26chksm%3Dfa528e56cd2507401d22aa9937b4385de1263eee040fca6bf59ef9ae069d6b8cf280892438bd%26scene%3D21%23wechat_redirect) 2.4.3中bl2镜像加载章节， **bl1\_load\_bl2** （）函数为例进行说明。

本篇文章从代码角度， **深挖到底** ，进行分析bl2的加载流程， **纯干货实操分享** ，欢迎 **下载代码进行加log打印调试** ， **上手试一试** ，还是那句：“ **纸上得来终觉浅，须知此事需躬行** ”。

## 1 使用fip.bin代码修改

```
make arm-tf DEBUG=1
make -f qemu_v8.mk run-only
```

**代码下载运行不再详述了。**

**修改atf** 的代码后，执行上面的命令就可以 **运行** 起来。但是里面有这个打印：

![](https://pic4.zhimg.com/v2-ff66fb1f234e0916ca965bc1f16d92a5_1440w.jpg)

如之前文章 [ATF入门-3BL2启动流程分析](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485554%26idx%3D1%26sn%3D320fe323b3ebf2f644c0d254ed22f4c4%26chksm%3Dfa528e56cd2507401d22aa9937b4385de1263eee040fca6bf59ef9ae069d6b8cf280892438bd%26scene%3D21%23wechat_redirect) 中说的，BL2的镜像 **直接使用的bl2.bin** 而 **不是从fip包里面获取** 的，这里的原因就是fip包的内容读取失败了，没有进行内存映射， **fip包的头校验也失败了** ，最后直接从文件获取了。

首先我们来看下 **是否有fip.bin，** 在目录

![](https://picx.zhimg.com/v2-3def7e00c2f4657cdbb34a9322519c37_1440w.jpg)

说明我们编译 **已经生成了fip.bin** ，既然bl2.bin都可以从文件里面读。那么我们 **仿照bl2.bin** 也搞一下。首先是在out目录里面建立 **软连接** ：

```
ln -s /home/XXX/optee/build/../trusted-firmware-a/build/qemu/debug/fip.bin fip.bin
```
![](https://pic3.zhimg.com/v2-4e36ed21ba9b8279e644b971c4c299a8_1440w.jpg)

我们使用 **[hexdump](https://zhida.zhihu.com/search?content_id=272990613&content_type=Article&match_order=1&q=hexdump&zhida_source=entity)** 看下这个fip.bin的内容：

![](https://pic4.zhimg.com/v2-0fd8349214a13f1161bbc89167375897_1440w.jpg)

上面我们说报错" **Firmware Image Package header check failed**.\\n"：的地方校验代码如下：

```
/* This is used as a signature to validate the blob header */
#define TOC_HEADER_NAME    0xAA640001

static inline int is_valid_header(fip_toc_header_t *header)
{
    if ((header->name == TOC_HEADER_NAME) && (header->serial_number != 0)) {
        return 1;
    } else {
        return 0;
    }
}
```

可见我们找到的fip.bin的文件 **头标识** 是对的。

那么怎么才能可以使用fip.bin？我们修改代码：

```
int plat_get_image_source(unsigned int image_id, uintptr_t *dev_handle,
              uintptr_t *image_spec)
{
    const struct plat_io_policy *policy = get_io_policy(image_id);
    int result;

    if (image_id == 0) {
        return get_alt_image_source(image_id, dev_handle, image_spec);
    }

    result = policy->check(policy->image_spec);
    if (result == 0) {
        INFO("$$$$ plat_get_image_source check success\n");

        *image_spec = policy->image_spec;
        *dev_handle = *(policy->dev_handle);
    } else {
        INFO("Trying alternative IO\n");
        result = get_alt_image_source(image_id, dev_handle, image_spec);
    }

    return result;
}
```

get\_alt\_image\_source就是从文件里面直接去读取fip.bin的。get\_alt\_image\_source--》open\_semihosting--》get\_alt\_image\_source--》get\_io\_file\_spec--》sh\_file\_spec

```
#define FIP_IMAGE_NAME    "fip.bin"

static const io_file_spec_t sh_file_spec[] = {
    [FIP_IMAGE_ID] = {
        .path = FIP_IMAGE_NAME,
        .mode = FOPEN_MODE_RB
    },
```

## 2\. bl1\_load\_bl2过程函数解析

![](https://pic1.zhimg.com/v2-170eeb17b4e7657ab750cf75c7bf893a_1440w.jpg)

## 2.1 bl1\_load\_bl2

```
bl1_load_bl2
    bl1_plat_get_image_desc
    bl1_plat_handle_pre_image_load
    load_auth_image
    bl1_plat_handle_post_image_load
```

主要就是load\_auth\_image去load bl2的bin文件。load\_auth\_image--》load\_image

```
load_image
    plat_get_image_source
    io_open
    io_read
    io_close
```

去获取镜像的资源在哪里， **plat\_get\_image\_source** 在qemu平台上在plat/qemu/common/ **qemu\_io\_storage.c** 中定义：

```
plat_get_image_source
    get_io_policy
    policy->check()
    get_alt_image_source
```

get\_io\_policy获取策略，入参是BL2的image id就是 **1** ，策略的定义如下：

```
/* Firmware Image Package */
#define FIP_IMAGE_ID            U(0)

/* Trusted Boot Firmware BL2 */
#define BL2_IMAGE_ID            U(1)

/* By default, ARM platforms load images from the FIP */
static const struct plat_io_policy policies[] = {
    [FIP_IMAGE_ID] = {
        &memmap_dev_handle,
        (uintptr_t)&fip_block_spec,
        open_memmap
    },
    [BL2_IMAGE_ID] = {
        &fip_dev_handle,
        (uintptr_t)&bl2_uuid_spec,
        open_fip
    },
```

policy->check()对于BL2\_IMAGE\_ID来说就是 **open\_fip** ()函数：open\_fip--》io\_dev\_init--》fip\_dev\_init

## 2.2 fip\_dev\_init读取fip

```
fip_dev_init
    plat_get_image_source
    io_open
    io_read
    io_close
```

**plat\_get\_image\_source** ()在plat/qemu/common/qemu\_io\_storage.c中实现,这时候是第二次进入这个函数了,这次的image id是 **0**,对应的policy是

```
[FIP_IMAGE_ID] = {
    &memmap_dev_handle,
    (uintptr_t)&fip_block_spec,
    open_memmap
},
```

这个policy有问题读不出来fip的内容，因为对于头文件校验失败fip\_dev\_init--》io\_read--》is\_valid\_header

```
typedef struct fip_toc_header {
    uint32_t    name;
    uint32_t    serial_number;
    uint64_t    flags;
} fip_toc_header_t;

static inline int is_valid_header(fip_toc_header_t *header)
{
    if ((header->name == TOC_HEADER_NAME) && (header->serial_number != 0)) {
        return 1;
    } else {
        return 0;
    }
}
```

我们直接使用 **get\_alt\_image\_source** 来在plat\_get\_image\_source()函数里面添加：

```
int plat_get_image_source(unsigned int image_id, uintptr_t *dev_handle,
              uintptr_t *image_spec)
{
    const struct plat_io_policy *policy = get_io_policy(image_id);
    int result;
        
    if (image_id == 0) {
    return get_alt_image_source(image_id, dev_handle, image_spec);
    }
```

这样读出来fip.bin再回到 **load\_image** （）函数里面，执行io\_open/io\_read/io\_close操作，把bl2.bin从fip.bin里面成功加载到内存中。

## 2.3 从fip读取bl2.bin

io\_open--》 **fip\_file\_open** ，

```
static int fip_file_open(io_dev_info_t *dev_info, const uintptr_t spec,
             io_entity_t *entity)
{
    const io_uuid_spec_t *uuid_spec = (io_uuid_spec_t *)spec;
 
     result = io_open(backend_dev_handle, backend_image_spec,
             &backend_handle);
                         
     /* Seek past the FIP header into the Table of Contents */
    result = io_seek(backend_handle, IO_SEEK_SET,
             (signed long long)sizeof(fip_toc_header_t));
        
do {
    result = io_read(backend_handle,
            (uintptr_t)&current_fip_file.entry,
            sizeof(current_fip_file.entry),
            &bytes_read);
    if (result == 0) {
        if (compare_uuids(&current_fip_file.entry.uuid,
            &uuid_spec->uuid) == 0) {
            found_file = 1;
        }
        } else {
            WARN("Failed to read FIP (%i)\n", result);
            goto fip_file_open_close;
        }
    } while ((found_file == 0) &&
        (compare_uuids(&current_fip_file.entry.uuid,
            &uuid_null) != 0));
```

spec是从 **policy** 里面获取到的，从上面代码里面看从fip包里面找bl2.bin是需要借助这个变量进行比对的，bl2\_uuid\_spec，定义为：

```
static const io_uuid_spec_t bl2_uuid_spec = {
    .uuid = UUID_TRUSTED_BOOT_FIRMWARE_BL2,
};

#define UUID_TRUSTED_BOOT_FIRMWARE_BL2 \
    {{0x5f, 0xf9, 0xec, 0x0b}, {0x4d, 0x22}, {0x3e, 0x4d}, 0xa5, 0x44, {0xc3, 0x9d, 0x81, 0xc7, 0x3f, 0x0a} }
```

关于fip包的操作都在 **drivers/io/io\_fip.c** 文件里面。fip包的格式如下：

```
------------------
| ToC Header     |
|----------------|
| ToC Entry 0    |
|----------------|
| ToC Entry 1    |
|----------------|
| ToC End Marker |
|----------------|
|                |
|     Data 0     |
|                |
|----------------|
|                |
|     Data 1     |
|                |
------------------
```

下面我们详细看下怎么读取里面的内容：

首先就是获取fip.bin的内存地址到 **backend\_handle** 。

backend\_dev\_handle和backend\_image\_spec是在打开fip.bin的时候调用 **fip\_dev\_init** 函数的时候拿到的 **全局变量** ，这里直接使用。

```
result = io_open(backend_dev_handle, backend_image_spec,
        &backend_handle);
```

然后定位去掉fip文件的头 **ToC Header** 也就是结构体 **fip\_toc\_header\_t**

```
result = io_seek(backend_handle, IO_SEEK_SET,
                 (signed long long)sizeof(fip_toc_header_t));
                 
typedef struct fip_toc_header {
    uint32_t    name;
    uint32_t    serial_number;
    uint64_t    flags;
} fip_toc_header_t;
```

之后就是 **ToC Entry 0** ，这里我们循环读取到 **current\_fip\_file.entry** 变量中

```
result = io_read(backend_handle,
                 (uintptr_t)&current_fip_file.entry,
                 sizeof(current_fip_file.entry),
                 &bytes_read);
```

然后跟我们传入的bl2的uuid\_spec-> **uuid** 进行比较：

```
if (compare_uuids(&current_fip_file.entry.uuid,
              &uuid_spec->uuid) == 0) {
        found_file = 1;
}
typedef struct fip_toc_entry {
    uuid_t        uuid;
    uint64_t    offset_address;
    uint64_t    size;
    uint64_t    flags;
} fip_toc_entry_t;

typedef struct uuid uuid_t;

struct uuid {
    uint8_t        time_low[4];
    uint8_t        time_mid[2];
    uint8_t        time_hi_and_version[2];
    uint8_t        clock_seq_hi_and_reserved;
    uint8_t        clock_seq_low;
    uint8_t        node[_UUID_NODE_LEN];
};
```

可见uuid是一个有 **6个元素** 的结构体，跟include/tools\_share/firmware\_image\_package.h中的定义一致

```
#define UUID_TRUSTED_BOOT_FIRMWARE_BL2 \
    {{0x5f, 0xf9, 0xec, 0x0b}, {0x4d, 0x22}, {0x3e, 0x4d}, 0xa5, 0x44, {0xc3, 0x9d, 0x81, 0xc7, 0x3f, 0x0a} }
```

对比好uuid，就可以拿到struct fip\_toc\_entry结构体的第二个元素offset\_address的值和size的值。

这里只是找到fip.bin中bl2.bin的位置了 **，读到内存中** 是发生在：load\_image--》plat\_get\_image\_source--》io\_read--》fip\_file\_read

```
static int fip_file_read(io_entity_t *entity, uintptr_t buffer, size_t length,
              size_t *length_read)
{
    fip_file_state_t *fp;
    fp = (fip_file_state_t *)entity->info;

    /* Seek to the position in the FIP where the payload lives */
    file_offset = fp->entry.offset_address + fp->file_pos;
    result = io_seek(backend_handle, IO_SEEK_SET,
                     (signed long long)file_offset);
```

传入是是结构体io\_entity\_t，里面entity->info才是fip\_file\_state\_t，嵌套关系如下：

```
typedef struct io_entity {
    struct io_dev_info *dev_handle;
    uintptr_t info;
} io_entity_t;

typedef struct {
    unsigned int file_pos;
    fip_toc_entry_t entry;
} fip_file_state_t;

typedef struct fip_toc_entry {
    uuid_t        uuid;
    uint64_t    offset_address;
    uint64_t    size;
    uint64_t    flags;
} fip_toc_entry_t;
```

那么这个是怎么获取的？读之前是先打开的：

load\_image--》plat\_get\_image\_source--》io\_open--》fip\_file\_open

```
static int load_image(unsigned int image_id, image_info_t *image_data)
{
uintptr_t image_handle;
io_result = io_open(dev_handle, image_spec, &image_handle);

static int fip_file_open(io_dev_info_t *dev_info, const uintptr_t spec,
             io_entity_t *entity)
{
    if (found_file == 1) {
        /* All fine. Update entity info with file state and return. Set
         * the file position to 0. The 'current_fip_file.entry' holds
         * the base and size of the file.
         */
        current_fip_file.file_pos = 0;
        entity->info = (uintptr_t)&current_fip_file;
    }
```

可见 **fip\_file\_open** 中找到 **uuid对应的bl2.bin** 后就 **把entity的info赋值** 了。

下图是笔者调试的一些打印：

![](https://pic1.zhimg.com/v2-a364bf55b90e4f8745cbbef75994afbe_1440w.jpg)

调试的时候，如果一下启动到linux里面，打印非常的多，我们可以让 **起到我们想研究的地方就停下来** ，调用如下代码就可以了：

```
void __dead2 plat_error_handler(int err)
{
    while (1)
        wfi();
}
```

> 后记：  
> 上面的分析是 **从fip包里面读取bl2.bin镜像** ，对于secure boot来说有两点：1.信任链2.加解密。这里bl1加载bl2有了信任链，但是这里 **缺少一个流程那就是加解密** 。下一个文章我们再详细介绍，这里先把fip包搞明白。  
> 最近一忙起来点， **抽空看这个代码就比较费劲** ，老是看了一会就忘记之前看到那个流程了。后来感觉需要 **画一个流程图，帮助记忆** ，这样下一次再看的时候很快就能顺起来，就这样断断续续看了一周才看完，老铁们不容易啊， **赶紧收藏研究** ，比自己看代码 **事半功倍** 。

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位有自己公众号的留言： **申请转载** ！

纯干货持续更新，欢迎 **分享给朋友** 、点赞、收藏、在看、划线和评论交流！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

编辑于 2026-04-13 11:24・上海[自学数字ic是否靠谱？](https://www.zhihu.com/question/343469193/answer/1986315667)

[

不要闹了，自学数字IC，不说要学习，就是EDA工具你都可能找不到，不要觉得我在骗你。我先给你介绍下数字IC需要学些...

](https://www.zhihu.com/question/343469193/answer/1986315667)