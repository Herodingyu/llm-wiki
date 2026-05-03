---
title: "Secure boot入门-4镜像验签代码分析"
source: "https://zhuanlan.zhihu.com/p/2027022925232972741"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "之前的文章： Secure boot入门-2fip包加载image流程中介绍了链式镜像加载，验签的基础知识和一些代码数据结构，并且修改代码打开了镜像验签功能。本小节就来实操一下，还是那句：老铁， 你的qemu运行ATF代码环境搭…"
tags:
  - "clippings"
---
[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181)

1 人赞同了该文章

![](https://pic2.zhimg.com/v2-1396f675711e58de1bf20ef86a9b7fc1_1440w.jpg)

之前的文章： [Secure boot入门-2fip包加载image流程](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485733%26idx%3D1%26sn%3D762529eefa0bb7fcc1a2e65ccb6f821c%26chksm%3Dfa528f01cd250617415a963a61b16ae17eecaf54845aa603f796d447dc3d24c0af44f7673071%26scene%3D21%23wechat_redirect) 中介绍了 **链式镜像加载** ，验签的基础知识和一些代码数据结构，并且 **修改代码** 打开了镜像验签功能。

本小节就来实操一下，还是那句：老铁， **你的qemu运行ATF代码环境搭建好了吗？** 参考： [ATF入门-1qmeu搭建ARM全套源码学习环境](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485508%26idx%3D1%26sn%3D99c019e8d4efddef614115d61bdfbffb%26chksm%3Dfa528e60cd2507766d08588aaed93f67c51fe6c77d502bebf8f6b429b2236c24d42d947e0108%26scene%3D21%23wechat_redirect)

什么是真正的技术？必须 **深挖代码** ，并且给你一份代码，一顿分析，很快就能掌握的能力，就是内功。真实可靠， **想改哪里改哪里，完全拿捏** 。本文不讲套路， **show me the code！**

## 1\. 整体流程

![](https://pic3.zhimg.com/v2-9898e3c167d4ffdc288c77fe534f2858_1440w.jpg)

ATF的安全启动按照ARM **TBBR规范** 要求进行实现，为了防止 **恶意固件** 在平台上运行，受信任的板级引导 (TBB) 功能要求验证所有固件镜像（包括普通世界的引导加载程序），这通过使用 **公钥密码** 标准 ([PKCS](https://zhida.zhihu.com/search?content_id=273001035&content_type=Article&match_order=1&q=PKCS&zhida_source=entity)) 建立信任链来做到这一点。上图中就是代码中 **doc目录下的帮助文件** 介绍，分类如下：

- GEN和IO：TF-A通用代码和IO框架，负责BL1或者BL2中的镜像启动身份验证过程
- PP：TF-A平台接口，指定信任链，提供信任根ROTPK等
- **CM** ：密码模块，验证数字签名和哈希
- **AM** ：认证模块，描述信任链，跟踪验证的镜像等
- **IPM** ：镜像解析器模块，获取用于镜像验证的参数
- **CL** ：密码算法库，提供哈希、验签和加密算法等实现
- **IPL** ：镜像解析器库，解析镜像参数，如从x509v3证书中提取参数

> 开源软件的一手资料doc文档  
> 开源软件一般都会有doc目录下的 **rst文件** ，不过都是英文的。

![](https://pic2.zhimg.com/v2-f605dfacfa61fa99558ebda61f790805_1440w.jpg)

**信任链CoT** 是一系列经过认证的镜像，信任从 **信任根** 开始往后逐级传递。信任根通常由两个组件构成： **信任根公钥和 [BootROM](https://zhida.zhihu.com/search?content_id=273001035&content_type=Article&match_order=1&q=BootROM&zhida_source=entity) 固件** 。信任根公钥用于验证可信启动证书和可信密钥证书，而BootROM代码确保镜像验证流程必须执行。

信任链的其他组件还包括符合 **[X.509 v3](https://zhida.zhihu.com/search?content_id=273001035&content_type=Article&match_order=1&q=X.509+v3&zhida_source=entity) 标准** 的证书，证书的扩展中存储了建立CoT需要的参数。 **证书是自签名的** ，因此不需要CA进行验证，这是因为CoT的建立不需要验证颁发者的有效性，只是请求证书扩展中的内容。换句话说就是 **证书链的安全性是由硬件保证** ，需要依赖外部CA：BootROM保证证书链必须经过验证，证书链的源头是由 **信任根公钥** 保证。

## 2\. BL2加载验签初始化流程

参考BL1中代码分析 [ATF入门-3BL1启动流程分析](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485541%26idx%3D1%26sn%3D0559cfb8d912ea03df6d0ba43744079f%26chksm%3Dfa528e41cd25075774d05e1b47f7702e62e3f44bc761bc0b2fc3b8cc88316c2b948ba39b31fc%26scene%3D21%23wechat_redirect) ：

```
void bl1_main(void)  
{  
/* Announce our arrival */  
NOTICE(FIRMWARE_WELCOME_STR);  
NOTICE("hello BL1: %s\n", version_string);  
NOTICE("BL1: %s\n", build_message);  
INFO("BL1: RAM %p - %p\n", (void *)BL1_RAM_BASE, (void *)BL1_RAM_LIMIT);  
  
bl1_arch_setup(); //设置下一个image的EL级别为aarch64  
crypto_mod_init();  //初始化加密库
auth_mod_init(); //初始化安全模块和镜像解析模块  
  
bl1_plat_mboot_init();  
bl1_platform_setup();  
  
image_id = bl1_plat_get_next_image_id(); //获取下一级启动镜像的ID。
  
if (image_id == BL2_IMAGE_ID)  
bl1_load_bl2(); //将BL2镜像加载到SRAM中  
else  
NOTICE("BL1-FWU: *******FWU Process Started*******\n");  
  
bl1_plat_mboot_finish();  
  
bl1_prepare_next_image(image_id); //获取bl2 image的描述信息，包括名字，ID，entry potin info等，并将这些信息保存到bl1_cpu_context的上下文中，为进入下一级镜像执行准备好上下文。
  
console_flush(); //在退出bl1之前将串口中的数据全部刷新掉  
}
```

我们需要关注： **crypto\_mod\_init、auth\_mod\_init、bl1\_load\_bl2这** 三个函数。

## 2.1 加密库初始化

![](https://pic3.zhimg.com/v2-c18fcbae3c41cc4c984c1d931275cc72_1440w.jpg)

**crypto\_mod\_init** （）在drivers/auth/crypto\_mod.c中定义

```
void crypto_mod_init(void)
{
    /* Initialize the cryptographic library */
    crypto_lib_desc.init();
    INFO("Using crypto library '%s'\n", crypto_lib_desc.name);
}
```

**crypto\_lib\_desc** 对应drivers/auth/mbedtls/mbedtls\_crypto.c如下注册：

```
#define LIB_NAME        "mbed TLS"

REGISTER_CRYPTO_LIB(LIB_NAME, init, verify_signature, verify_hash, NULL,
            NULL, NULL);

/* Macro to register a cryptographic library */  
#define REGISTER_CRYPTO_LIB(_name, _init, _verify_signature, _verify_hash, \  
_calc_hash, _auth_decrypt, _convert_pk) \  
const crypto_lib_desc_t crypto_lib_desc = { \  
.name = _name, \  
.init = _init, \  
.verify_signature = _verify_signature, \ //签名验证  
.verify_hash = _verify_hash, \ //hash验证  
.calc_hash = _calc_hash, \  
.auth_decrypt = _auth_decrypt, \  
.convert_pk = _convert_pk \  
}
```

init（）函数会执行

```
static void init(void)
{
    /* Initialize mbed TLS */
    mbedtls_init();
}

void mbedtls_init(void)
{
    if (!ready) {
        err = plat_get_mbedtls_heap(&heap_addr, &heap_size);
        /* Initialize the mbed TLS heap */
        mbedtls_memory_buffer_alloc_init(heap_addr, heap_size);

#ifdef MBEDTLS_PLATFORM_SNPRINTF_ALT
        mbedtls_platform_set_snprintf(snprintf);
#endif
        ready = 1;
    }
}
```

## 2.2 IPL镜像解析库初始化

**auth\_mod\_init** ();--》img\_parser\_init()

```
void img_parser_init(void)
{
    parser_lib_descs = (img_parser_lib_desc_t *) PARSER_LIB_DESCS_START;
    for (index = 0; index < mod_num; index++) {
        /* Check that the image parser library descriptor is valid */
        validate_desc(&parser_lib_descs[index]);
        /* Initialize image parser */
        parser_lib_descs[index].init();
        /* Keep the index of this hash calculator */
        parser_lib_indices[parser_lib_descs[index].img_type] = index;
    }
}
```

**parser\_lib\_descs** 的定义，drivers/auth/mbedtls/mbedtls\_x509\_parser.c中

```
REGISTER_IMG_PARSER_LIB(IMG_CERT, LIB_NAME, init,  
check_integrity, get_auth_param);

/* Macro to register an image parser library */  
#define REGISTER_IMG_PARSER_LIB(_type, _name, _init, _check_int, _get_param) \  
static const img_parser_lib_desc_t __img_parser_lib_desc_##_type \  
__section(".img_parser_lib_descs") __used = { \  
.img_type = _type, \  
.name = _name, \  
.init = _init, \  
.check_integrity = _check_int, \ //镜像完整性检查  
.get_auth_param = _get_param \ //提取镜像验证函数的指针  
}
```

init函数

```
static void init(void)
{
    mbedtls_init();
}
```

可见也是使用的 **mbedtls库** 。这个之前加密库初始化的时候已经初始化过了。

## 2.3 bl1\_load\_bl2

参考： [Secure boot入门-2fip包加载image流程](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485733%26idx%3D1%26sn%3D762529eefa0bb7fcc1a2e65ccb6f821c%26chksm%3Dfa528f01cd250617415a963a61b16ae17eecaf54845aa603f796d447dc3d24c0af44f7673071%26scene%3D21%23wechat_redirect) 中fip加载流程如下图：

![](https://pic4.zhimg.com/v2-fe6d6dfa95fa9439d01f8731020f895b_1440w.jpg)

但是我们打开镜像验签后，有些函数会多执行，我们重点介绍 **验签流程** ，下面再画一个图：

![](https://picx.zhimg.com/v2-78dcf71b25adddd2911e6bed4f452343_1440w.jpg)

跟之前的 **框架图** 对比下，就能对上了：

![](https://pic4.zhimg.com/v2-c45675bed18d958959b937be5659c915_1440w.jpg)

另外起一章，详细介绍下加密校验的流程

## 3\. 加密校验流程

这里还是用 **BL1加载BL2进行说明** ，其他的类似。

## 3.1 使用加密校验加载

首先就是加载流程的变化：bl1\_load\_bl2--》load\_auth\_image\_internal--》 **load\_auth\_image\_recursive**

```
static int load_auth_image_internal(unsigned int image_id,
                    image_info_t *image_data)
{
#if TRUSTED_BOARD_BOOT
    if (dyn_is_auth_disabled() == 0) {
        return load_auth_image_recursive(image_id, image_data, 0);//加密校验加载
    }
#endif

    return load_image(image_id, image_data);//直接加载
}
```

load\_auth\_image\_recursive，首先找parent， **判断parent是否进行了验证** ，如果没验证则先验证parent， **递归调用直到找到根** ，这样就是可信的。

```
static int load_auth_image_recursive(unsigned int image_id,
                    image_info_t *image_data,
                    int is_parent_image)
{
    rc = auth_mod_get_parent_id(image_id, &parent_id);
    if (rc == 0) {
        rc = load_auth_image_recursive(parent_id, image_data, 1);
    }

    rc = load_image(image_id, image_data);

    rc = auth_mod_verify_img(image_id,
                 (void *)image_data->image_base,
                 image_data->image_size);
}
```

## 3.2 获取parent

BL2的parent是trusted\_boot\_fw\_cert，因为BL2的cot定义如下：

```
static const auth_img_desc_t bl2_image = {
    .img_id = BL2_IMAGE_ID,
    .img_type = IMG_RAW,
    .parent = &trusted_boot_fw_cert,
```

下面我们看下代码怎么跟cot的定义联系上的，首先分析 **auth\_mod\_get\_parent\_id**

```
int auth_mod_get_parent_id(unsigned int img_id, unsigned int *parent_id)
{
    img_desc = FCONF_GET_PROPERTY(tbbr, cot, img_id);

    /* Check if the image has no parent (ROT) */
    if (img_desc->parent == NULL) {
        *parent_id = 0;
        return 1;
    }

    /* Check if the parent has already been authenticated */
    if (auth_img_flags[img_desc->parent->img_id] & IMG_FLAG_AUTHENTICATED) {
        *parent_id = 0;
        return 1;
    }

    *parent_id = img_desc->parent->img_id;
    return 0;
}

#define FCONF_GET_PROPERTY(a, b, c)    a##__##b##_getter(c)
```

FCONF\_GET\_PROPERTY(tbbr, cot, img\_id)就是 **tbbr\_\_cot\_getter** (1)-->cot\_desc\_ptr-->REGISTER\_COT--> **cot\_desc** \[\]，代码倒推过程如下：

```
#define tbbr__cot_getter(id) __extension__ ({    \
    assert((id) < cot_desc_size);        \
    cot_desc_ptr[id];            \
})

#define REGISTER_COT(_cot) \
    const auth_img_desc_t *const *const cot_desc_ptr = (_cot); \
    const size_t cot_desc_size = ARRAY_SIZE(_cot);           \
    unsigned int auth_img_flags[MAX_NUMBER_IDS]

REGISTER_COT(cot_desc);

static const auth_img_desc_t * const cot_desc[] = {
    [TRUSTED_BOOT_FW_CERT_ID]        =    &trusted_boot_fw_cert,
    [BL2_IMAGE_ID]                =    &bl2_image,
    [HW_CONFIG_ID]                =    &hw_config,
    [TB_FW_CONFIG_ID]            =    &tb_fw_config,
    [FW_CONFIG_ID]                =    &fw_config,
    [FWU_CERT_ID]                =    &fwu_cert,
    [SCP_BL2U_IMAGE_ID]            =    &scp_bl2u_image,
    [BL2U_IMAGE_ID]                =    &bl2u_image,
    [NS_BL2U_IMAGE_ID]            =    &ns_bl2u_image
};
```

拿到bl2的parent后，就会继续递归调用 **load\_auth\_image\_recursive** ，再去找trusted\_boot\_fw\_cert的parent，这时为NULL，那就继续执行load\_image,这时image的id就变成6了。

load\_image（）在之前的文章： [Secure boot入门-2fip包加载image流程](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485733%26idx%3D1%26sn%3D762529eefa0bb7fcc1a2e65ccb6f821c%26chksm%3Dfa528f01cd250617415a963a61b16ae17eecaf54845aa603f796d447dc3d24c0af44f7673071%26scene%3D21%23wechat_redirect) 里面有描述，这里不详述了。当把trusted\_boot\_fw\_cert load到内存里面后，就要进行 **auth\_mod\_verify\_img** （）校验了。

如果校验失败， **程序启动流程会停止，不往下执行** ，并清空数据，让系统启动不起来：

```
rc = auth_mod_verify_img(image_id,
             (void *)image_data->image_base,
             image_data->image_size);
if (rc != 0) {
    /* Authentication error, zero memory and flush it right away. */
    zero_normalmem((void *)image_data->image_base,
               image_data->image_size);
    flush_dcache_range(image_data->image_base,
               image_data->image_size);
    return -EAUTH;
}
```

## 3.3 AM校验

**auth\_mod\_verify\_img** （）整个校验过程都在这个函数里面，定义如下：

```
int auth_mod_verify_img(unsigned int img_id,
            void *img_ptr,
            unsigned int img_len)
{

    /* Get the image descriptor from the chain of trust */
    img_desc = FCONF_GET_PROPERTY(tbbr, cot, img_id);

    /* Ask the parser to check the image integrity *///完整性检查
    rc = img_parser_check_integrity(img_desc->img_type, img_ptr, img_len);

    /* Authenticate the image using the methods indicated in the image
     * descriptor. *///验证本镜像
    for (i = 0 ; i < AUTH_METHOD_NUM ; i++) {
        auth_method = &img_desc->img_auth_methods[i];
        switch (auth_method->type) {
        case AUTH_METHOD_NONE:
            rc = 0;
            break;
        case AUTH_METHOD_HASH://hash验证
            rc = auth_hash(&auth_method->param.hash,
                    img_desc, img_ptr, img_len);
        case AUTH_METHOD_SIG://签名验证
            rc = auth_signature(&auth_method->param.sig,
                    img_desc, img_ptr, img_len);
        case AUTH_METHOD_NV_CTR://版本号增加验证
            nv_ctr_param = &auth_method->param.nv_ctr;
            rc = auth_nvctr(nv_ctr_param,
                    img_desc, img_ptr, img_len,
                    &cert_nv_ctr, &need_nv_ctr_upgrade);
    }

    /* Extract the parameters indicated in the image descriptor to
     * authenticate the children images. *///验证子镜像用到的数据提取
    if (img_desc->authenticated_data != NULL) {
        for (i = 0 ; i < COT_MAX_VERIFIED_PARAMS ; i++) {
            /* Get the parameter from the image parser module */
            rc = img_parser_get_auth_param(img_desc->img_type,
                    img_desc->authenticated_data[i].type_desc,
                    img_ptr, img_len, &param_ptr, &param_len);

            /* Copy the parameter for later use */
            memcpy((void *)img_desc->authenticated_data[i].data.ptr,
                    (void *)param_ptr, param_len);

            type_desc = img_desc->authenticated_data[i].type_desc;
            if (type_desc->type == AUTH_PARAM_PUB_KEY) {
                rc = plat_mboot_measure_key(type_desc->cookie,
                                param_ptr,
                                param_len);

                }
            }
        }
    }

    /* Mark image as authenticated */
    auth_img_flags[img_desc->img_id] |= IMG_FLAG_AUTHENTICATED;

    return 0;
}
```

由三部分组成

1. **根据本镜像格式，验证本镜像完整性--IPM**
2. **验证本镜像签名--CM**
3. **提取子镜像验证需要的信息--IPM**

## 3.4 验证镜像完整性

img\_parser\_check\_integrity：检查 **镜像完整性** ，这主要是针对 **证书镜像** ，需要解析证书，检查是否符合ASN.1结构，并提取相关的数据用于后续认证操作，例如签名算法，公钥信息，扩展信息，签名值等。

IMG\_RAW不验证。其他格式需要调用 **check\_integrity** （）进行验证

```
int img_parser_check_integrity(img_type_t img_type,
                   void *img_ptr, unsigned int img_len)
{
    /* No integrity checks on raw images */
    if (img_type == IMG_RAW) {
        return IMG_PARSER_OK;
    }

    /* Find the index of the required image parser */
    idx = parser_lib_indices[img_type];
    assert(idx != INVALID_IDX);

    /* Call the function to check the image integrity */
    return parser_lib_descs[idx].check_integrity(img_ptr, img_len);
}
```

根镜像trusted\_boot\_fw\_cert的格式是 **IMG\_CERT** ，根据parser\_lib\_indices找到idx是0，这里其实 **只有一个mbedtls库进行了注册** ，drivers/auth/mbedtls/mbedtls\_x509\_parser.c中：

```
REGISTER_IMG_PARSER_LIB(IMG_CERT, LIB_NAME, init,
               check_integrity, get_auth_param);
```

parser\_lib\_indices\[IMG\_CERT\]的值在 **img\_parser\_init** 中定义， **mod\_num** 值是1，只有一个mbedtls库注册了

```
for (index = 0; index < mod_num; index++) {
    parser_lib_indices[parser_lib_descs[index].img_type] = index;
```

check\_integrity就是 **x509证书内容的解析** 了。

## 3.5 镜像校验

### 3.5.1 trusted\_boot\_fw\_cert校验auth\_signature

![](https://pica.zhimg.com/v2-a8633bcefb5a977855c72727f1776156_1440w.jpg)

> 校验要用到COT结构体auth\_img\_desc\_t，trusted\_boot\_fw\_cert如下：  
> img\_id：定义可信启动证书唯一标识符  
>   
> img\_type： **IMG\_CERT** 表示镜像类型是证书  
>   
> parent：NULL表示该镜像 **没有父镜像** ，需要使用信任根进行认证  
>   
> img\_auth\_methods：镜像认证的方法包括 **认证签名和NV计数器** ，用于验签的公钥来自主公钥subject\_pk，即信任根公钥 **ROTPK** ，而NV计数器的验证是用证书中解析的nv\_ctr与平台定义的 **nv\_ctr** 进行比较，rotpk和plat\_nv\_ctr通常存储在 **OTP** 中  
>   
> authenticated\_data：定义已经认证过的数据，这些参数通常用于认证子镜像，这里的tb\_fw\_hash即下面 **待比较的bl2镜像哈希**

可信密钥证书 **trusted\_key\_cert** 定义如下，同BL1可信启动证书一样，认证方法为验签和NV计数器比较，由于没有父镜像，因此该证书验签也由信任根公钥ROTPK进行验证。证书认证通过后，可以从中提取安全和非安全世界公钥 **trusted\_world\_pk** 和 **non\_trusted\_world\_pk** ，用于验证后续镜像的密钥证书。

对于trusted\_boot\_fw\_cert使用 **AUTH\_METHOD\_SIG** 和 **AUTH\_METHOD\_NV\_CTR** 放回滚校验

对于使用X509证书方式的镜像解析方式而言，auth\_signature函数只会针对于镜像类型为证书IMG\_CERT。

认证签名是公钥验证镜像的签名值，需要以下参数：

1. 待认证的镜像： **被签名的数据，签名值，签名算法**
2. 父镜像：公钥（或公钥哈希） 如果父镜像只包含公钥的哈希，则需要从待认证的镜像中 **提取公钥值** （即自签名的证书），并计算该公钥的 **哈希值** ，与父镜像中获取的哈希值进行比较。如果镜像没有父镜像，则需要用OTP中存储的ROTPK进行验签。
```
static int auth_signature(const auth_method_param_sig_t *param,
              const auth_img_desc_t *img_desc,
              void *img, unsigned int img_len)
{
    void *data_ptr, *pk_ptr, *cnv_pk_ptr, *pk_plat_ptr, *sig_ptr, *sig_alg_ptr, *pk_oid;
    unsigned int data_len, pk_len, cnv_pk_len, pk_plat_len, sig_len, sig_alg_len;
    unsigned int flags = 0;
    int rc;

    /* Get the data to be signed from current image */
    rc = img_parser_get_auth_param(img_desc->img_type, param->data,
            img, img_len, &data_ptr, &data_len);
    /* Get the signature from current image */
    rc = img_parser_get_auth_param(img_desc->img_type, param->sig,
            img, img_len, &sig_ptr, &sig_len);
    /* Get the signature algorithm from current image */
    rc = img_parser_get_auth_param(img_desc->img_type, param->alg,
            img, img_len, &sig_alg_ptr, &sig_alg_len);
//从镜像中获取了签名sig_ptr、签名算法sig_alg_ptr、

    /* Get the public key from the parent. If there is no parent (NULL),
     * the certificate has been signed with the ROTPK, so we have to get
     * the PK from the platform */
    if (img_desc->parent != NULL) {
        rc = auth_get_param(param->pk, img_desc->parent,
                &pk_ptr, &pk_len);
//从CoT父关系img_desc->parent中获取，公钥pk_ptr
    } else {
        /*
         * Root certificates are signed with the ROTPK, so we have to
         * get it from the platform.
         */
        rc = plat_get_rotpk_info(param->pk->cookie, &pk_plat_ptr,
                     &pk_plat_len, &flags);

        /* Also retrieve the key from the image. */
        rc = img_parser_get_auth_param(img_desc->img_type,
                           param->pk, img, img_len,
                           &pk_ptr, &pk_len);
//公钥从ROTPK获取，因为是根签名，父亲是null

        /*
         * Validate the certificate's key against the platform ROTPK.
         *
         * Platform may store key in one of the following way -
         * 1. Hash of ROTPK
         * 2. Hash if prefixed, suffixed or modified ROTPK
         * 3. Full ROTPK
         */
        if ((flags & ROTPK_NOT_DEPLOYED) != 0U) {
            NOTICE("ROTPK is not deployed on platform. "
                "Skipping ROTPK verification.\n");
//如果公钥没有部署，就跳过对公钥的验证操作，这一般用用调试场景，如果公钥已经部署并且是存储的哈希值，则需要对公钥进行哈希比较操作crypto_mod_verify_hash，以此来判断公钥是否可信
        } else if ((flags & ROTPK_IS_HASH) != 0U) {
            /*
             * platform may store the hash of a prefixed,
             * suffixed or modified pk
             */
            rc = crypto_mod_convert_pk(pk_ptr, pk_len, &cnv_pk_ptr, &cnv_pk_len);
//如果公钥为哈希，需要先从镜像中提取公钥值，然后调用密码模块crypto_mod_verify_signature进行验签操作，即调用底层的verify_signature函数，如果公钥就是实际的值，则直接进行验签操作
            /*
             * The hash of the certificate's public key must match
             * the hash of the ROTPK.
             */
            rc = crypto_mod_verify_hash(cnv_pk_ptr, cnv_pk_len,
                            pk_plat_ptr, pk_plat_len);
        } else {
            /* Platform supports full ROTPK */
            if ((pk_len != pk_plat_len) ||
                (memcmp(pk_plat_ptr, pk_ptr, pk_len) != 0)) {
                ERROR("plat and cert ROTPK len mismatch\n");
                return -1;
            }
        }

        /*
         * Public key is verified at this stage, notify platform
         * to measure and publish it.
         */
        rc = plat_mboot_measure_key(pk_oid, pk_ptr, pk_len);
    }

    /* Ask the crypto module to verify the signature */
    rc = crypto_mod_verify_signature(data_ptr, data_len,
                     sig_ptr, sig_len,
                     sig_alg_ptr, sig_alg_len,
                     pk_ptr, pk_len);
    return 0;
}
```
- data\_ptr, data\_len: **签名数据**
- sig\_ptr, sig\_len: **数字签名**
- sig\_alg\_ptr, sig\_alg\_len: **数字签名算法**
- pk\_ptr, pk\_len: **公钥**

**数字签名算法利用公钥对签名数据进行解密，然后跟数字签名对比，是否一致。**

crypto\_mod\_verify\_signature()函数的深度分析，应该挺有意思，但是也很耗费时间，专业选手肯定是要对代码全部掌握的， **加解密的库** 什么的，作者这里没有太多的时间，这里仅仅是入门，知道原理就可以，就写到这里了。

对于trusted\_boot\_fw\_cert根签名镜像，主要区别就是 **获取公钥过程** 复杂，如下：

- img\_parser\_get\_auth\_param：获取 **被签名的数据，签名值以及签名算法**
- img\_desc->parent：判断镜像是否有父镜像，并 **从父镜像已经认证过的数据中获取公钥** ，如果没有父镜像，说明证书 **使用ROTPK** 进行签名的，需要从平台如OTP中获取公钥
- ROTPK\_IS\_HASH：如果公钥为哈希，需要先 **从镜像中提取公钥值** ，然后调用密码模块crypto\_mod\_verify\_signature进行 **验签** 操作，即调用底层的verify\_signature函数，如果公钥就是实际的值，则直接进行验签操作
- ROTPK\_NOT\_DEPLOYED：如果公钥没有部署，就跳过对公钥的验证操作，这一般用用调试场景，如果 **公钥已经部署并且是存储的哈希值，则需要对公钥进行哈希比较操作** crypto\_mod\_verify\_hash，以此来判断公钥是否可信

### 3.5.2 trusted\_boot\_fw\_cert校验auth\_nvctr

认证NV计数器：

认证NV计数器是 **系统防回滚设计** ，这个计数器 **只能递增并且存储在一次性存储器如OTP中** ，所有证书中的计数器必须比平台存储的大，即不能升级版本低的固件（防回滚）。auth\_nvctr函数主要功能如下：

- img\_parser\_get\_auth\_param：获取当前镜像的NV计数器，即 **从证书中提取DER编码的计数器值** ，然后进行解析，转换成整型值
- plat\_get\_nv\_ctr： **从平台中获取当前的NV计数器值** ，比与上面计数器值进行比较，如果比他大，则认证通过，返回NV计数器需要更新need\_nv\_ctr\_upgrade

### 3.5.2 bl2\_image校验auth\_hash

对于bl2\_image使用的hash校验：

![](https://pic4.zhimg.com/v2-80cefd79772c74c4ac62afb989a659d3_1440w.jpg)

- img\_id：定义bl2镜像唯一标识符
- img\_type：IMG\_RAW表示镜像类型是原始镜像数据
- parent：表示bl2镜像的父镜像是可选启动证书 **trusted\_boot\_fw\_cert** ，即认证bl2镜像首先需要认证其父镜像trusted\_boot\_fw\_cert
- img\_auth\_methods：bl2镜像认证的方法为 **哈希比较** ，比较的可信哈希是从trusted\_boot\_fw\_cert可信启动证书中提取到的

认证哈希是通过比较哈希值是否一致，一个是 **计算镜像得到的哈希值** ，一个是 **从父镜像提取的可信哈希值** （包括哈希算法）。

auth\_hash函数中的主要流程：

- auth\_get\_param：从 **父镜像** 中获取DER编码的哈希值及哈希算法
- img\_parser\_get\_auth\_param： **获取当前镜像需要被哈希的数据** ，对于IMG\_RAW类型就是镜像本身
- crypto\_mod\_verify\_hash： **请求密码模块验证哈希** ，会调用底层密码模块verify\_hash函数
```
static int auth_hash(const auth_method_param_hash_t *param,
             const auth_img_desc_t *img_desc,
             void *img, unsigned int img_len)
{
    /* Get the hash from the parent image. This hash will be DER encoded
     * and contain the hash algorithm */
    rc = auth_get_param(param->hash, img_desc->parent,
            &hash_der_ptr, &hash_der_len);
    /* Get the data to be hashed from the current image */
    rc = img_parser_get_auth_param(img_desc->img_type, param->data,
            img, img_len, &data_ptr, &data_len);
//从父镜像获取hash_der_ptr哈希值和hash算法、数据data_ptr

    /* Ask the crypto module to verify this hash */
    rc = crypto_mod_verify_hash(data_ptr, data_len,
                    hash_der_ptr, hash_der_len);
    return 0;
}
```

> crypto\_mod\_verify\_hash（）函数，利用hash\_der\_ptr中hash算法计算数据data\_ptr的hash值，然后跟hash\_der\_ptr中hash值对比。

## 3.6 子镜像校验信息获取

从父镜像提取的子镜像验证参数，需要 **单独存储** ，因为当加载子镜像的时候会冲掉父镜像占用的内存，需要使用auth\_param\_data\_desc\_t中 **ptr指针** 存储。

```
/*  
* Store a pointer to the authentication parameter and its length  
*/  
typedef struct auth_param_data_desc_s {  
void *ptr;  
unsigned int len;  
} auth_param_data_desc_t;  
  
/*  
* Authentication parameter descriptor, including type and value  
*/  
typedef struct auth_param_desc_s {  
auth_param_type_desc_t *type_desc;  
auth_param_data_desc_t data;  
} auth_param_desc_t;
```

**IPM** 获取镜像验证参数的时候填充 **ptr和len** 。auth\_param\_desc\_t中保护了这个data。

## 3.7 mbedtls解码库

这个代码目录没在trusted-firmware-a里面，而是 **根目录下mbedtls文件夹** ，但是编译的时候 **跟随ATF一起进行编译** 的。

上面认证流程用到的哈希、验签和解密都是基于底层的密码算法库。ATF默认使用的是 **mbedtls密码算法库** ，实际场景中往往使用 **硬件加速模块** 来实现加解密软件操作替代mbedtls软件库，典型的 **软硬结合** 场景。在底层的密码模块中，注册了 **验签、哈希验证以及认证解密函数** 。

```
REGISTER_CRYPTO_LIB(LIB_NAME, init, verify_signature, verify_hash,
            auth_decrypt);
```

另外对于 **镜像解析模块** ，也注册了镜像完整性校验和认证参数解析函数。认证需要的参数如 **镜像哈希值、公钥等都是存储在X509证书中** ，在使用这些参数之前，需要从证书中解析出来（ASN.1编码的结构）。

```
REGISTER_IMG_PARSER_LIB(IMG_CERT, LIB_NAME, init, \
               check_integrity, get_auth_param);
```

## 3.8 其他信任链

BL31的信任链：

BL31的信任链CoT定义如下，包括 **密钥证书soc\_fw\_key\_cert** 、 **内容证书soc\_fw\_content\_cert** 和 **镜像bl31\_image以及配置soc\_fw\_config**

- **密钥证书** soc\_fw\_key\_cert：父镜像是可信密钥证书trusted\_key\_cert，认证方法包括验签和NV计数器，验签的公钥是安全世界公钥trusted\_world\_pk，即trusted\_key\_cert认证过的密钥数据；NV计数器是比较安全固件的计数器trusted\_nv\_ctr。认证通过后可以提取验证内容证书所用的公钥soc\_fw\_content\_pk
- **内容证书** soc\_fw\_content\_cert：父镜像是上面的密钥证书，认证方法同样是验签和NV计数器，验签公钥是上面的soc\_fw\_content\_pk，认证通过后可以提取用于bl31镜像哈希比较的哈希值soc\_fw\_hash
- **bl31镜像bl31\_image** ：父镜像是上面的内容证书，认证方法为哈希比较，比较的可信哈希为上面的soc\_fw\_hash
```
static const auth_img_desc_t soc_fw_key_cert = {
    .img_id = SOC_FW_KEY_CERT_ID,
    .img_type = IMG_CERT,
    .parent = &trusted_key_cert,
    .img_auth_methods = (const auth_method_desc_t[AUTH_METHOD_NUM]) {
        [0] = {
```

BL31的认证流程如下：

```
+------------------+       +-------------------+
| ROTPK/ROTPK Hash |------>| Trusted Key       |可信证书镜像
+------------------+       | Certificate       |
                           | (Auth Image)      |
                          /+-------------------+
                         /            |
                        /             |
                       /              |
                      /               |
                     L                v
+------------------+       +-------------------+
| Trusted World    |------>| BL31 Key          |公钥验证BL31证书镜像
| Public Key       |       | Certificate       |
+------------------+       | (Auth Image)      |
                           +-------------------+
                          /           |
                         /            |
                        /             |
                       /              |
                      /               v
+------------------+ L     +-------------------+
| BL31 Content     |------>| BL31 Content      |公钥验证BL31内容镜像
| Certificate PK   |       | Certificate       |
+------------------+       | (Auth Image)      |
                           +-------------------+
                          /           |
                         /            |
                        /             |
                       /              |
                      /               v
+------------------+ L     +-------------------+
| BL31 Hash        |------>| BL31 Image        |hash验证BL31镜像内容
|                  |       | (Data Image)      |
+------------------+       |                   |
                           +-------------------+
```

BL33的信任链:

包括密钥证书non\_trusted\_fw\_key\_cert、内容证书non\_trusted\_fw\_content\_cert和镜像bl33\_image。

- **密钥证书** non\_trusted\_fw\_key\_cert：同BL31类似，只是验签的公钥是非安全世界公钥non\_trusted\_world\_pk，NV计数器是非安全的计数器non\_trusted\_nv\_ctr。认证通过后可以提取内容证书验证公钥nt\_fw\_content\_pk
- **内容证书** non\_trusted\_fw\_content\_cert：同理，认证通过后可以提取用于镜像bl33比较的镜像哈希值nt\_world\_bl\_hash
- bl33镜像 **bl33\_image** ：父镜像是上面的内容证书，认证方法为哈希比较，比较的可信哈希为上面的nt\_world\_bl\_hash
```
static const auth_img_desc_t non_trusted_fw_key_cert = {
    .img_id = NON_TRUSTED_FW_KEY_CERT_ID,
    .img_type = IMG_CERT,
    .parent = &trusted_key_cert,
    .img_auth_methods = (const auth_method_desc_t[AUTH_METHOD_NUM]) {
        [0] = {
            .type = AUTH_METHOD_SIG,
```

参考：

1. 【安全有理--（07）ATF安全启动】 [blog.csdn.net/qq\_161061](https://link.zhihu.com/?target=https%3A//blog.csdn.net/qq_16106195/article/details/131551833)
2. 【Arnold Lu@南京--ARM Trusted Firmware分析——镜像签名/加密/生成、解析/解密/验签-- [cnblogs.com/arnoldlu/p/](https://link.zhihu.com/?target=https%3A//www.cnblogs.com/arnoldlu/p/14332530.html)

> 后记：  
> 本篇又是干货满满的一篇，但是总有一些核心的技术细节，例如到加解密mbedtls的分析，感觉太耗时了，从入门到放弃，专业选手可以搞一下。这里作为入门足够了，毕竟mbedtls开源库基本不会有人去改里面的代码，也不敢让改啊。  
> 相信跟着这个系列看到这里，对secure boot从代码级别已经有所小成了，但是工作中估计还是远远不够，一入开源代码深似海，路已经铺好，等大家自己去探索了。

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位有自己公众号的留言： **申请转载** ！

纯干货持续更新，欢迎 **分享给朋友** 、点赞、收藏、在看、划线和评论交流！

彩蛋：

1. 本公众号提供微信技术交流群，一起探讨汽车软件技术（先加微信：thatway1989，备注感兴趣的技术方向）。
2. 有需要投放广告、商业合作的也可以联系博主。
3. 赞赏1元钱交个朋友

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

编辑于 2026-04-13 14:39・上海[应届生想从事IC验证该从哪里开始学习？](https://www.zhihu.com/question/511182201/answer/2509445821)

[

IC验证该从哪里开始学习？建议在校期间就开始，搞IC验证工程师，有大学4年，研究生3年，这么长时间总不能全用来谈恋爱不是，要知道光IC验证平台就有6中以上，等你要毕业找工作了才...

](https://www.zhihu.com/question/511182201/answer/2509445821)