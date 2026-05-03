---
title: "Secure boot入门-3镜像验签基础及代码初探"
source: "https://zhuanlan.zhihu.com/p/2026984627772859050"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "各位铁子，没搭建 qemu运行ATF+Linux运行环境的，赶紧搞起来，零成本学习ARM高深技术：ATF入门-1qmeu搭建ARM全套源码学习环境上一篇： Secure boot入门-2fip包加载image流程介绍了fip包的加载流程，说明了固件信任…"
tags:
  - "clippings"
---
[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181)

3 人赞同了该文章

![](https://pic4.zhimg.com/v2-db17c3c71cb25e4284e260715efd1601_1440w.jpg)

各位铁子，没搭建 **qemu运行ATF+Linux** 运行环境的，赶紧搞起来， **零成本** 学习ARM高深技术： [ATF入门-1qmeu搭建ARM全套源码学习环境](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485508%26idx%3D1%26sn%3D99c019e8d4efddef614115d61bdfbffb%26chksm%3Dfa528e60cd2507766d08588aaed93f67c51fe6c77d502bebf8f6b429b2236c24d42d947e0108%26scene%3D21%23wechat_redirect)

上一篇： [Secure boot入门-2fip包加载image流程](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485733%26idx%3D1%26sn%3D762529eefa0bb7fcc1a2e65ccb6f821c%26chksm%3Dfa528f01cd250617415a963a61b16ae17eecaf54845aa603f796d447dc3d24c0af44f7673071%26scene%3D21%23wechat_redirect) 介绍了fip包的加载流程，说明了 **固件信任链** ，加解密验签的流程本篇开始展开， **有代码，可操作，不只说空话** 翻译外文文档，真正触摸到代码才是 **真实** ，干货满满，多分享给你的朋友。

## 1\. 验签基础知识

## 1.1 整体流程

**安全引导（ [Secure Boot](https://zhida.zhihu.com/search?content_id=272990960&content_type=Article&match_order=1&q=Secure+Boot&zhida_source=entity) ）** 功能是指在系统的整个启动过程中，使用 **链式验证电子签名** 的方式来验证系统中重要镜像文件的可靠性，然后再加载镜像文件的引导过程。

**Bootloader、Linux内核、TEE OS的启动都由ATF来加载和引导** 。对于 [ARMv8](https://zhida.zhihu.com/search?content_id=272990960&content_type=Article&match_order=1&q=ARMv8&zhida_source=entity), Bootloader、Linux内核和TEE OS镜像文件的验签工作都是在 **ATF** 中完成的。

![](https://pica.zhimg.com/v2-30abc8152021967fe3062581999f9e20_1440w.jpg)

ATF冷启动实现分为5个步骤：

- **BL1** - AP Trusted ROM，一般为BootRom。
- **BL2** - Trusted Boot Firmware，一般为Trusted Bootloader。
- **BL31** - EL3 Runtime Firmware，一般为SML，管理SMC执行处理和中断，运行在secure monitor中。
- **BL32** - Secure-EL1 Payload，一般为TEE OS Image。
- **BL33** - Non-Trusted Firmware，一般为uboot、linux kernel。
![](https://pic2.zhimg.com/v2-3fec54caeca72fafb5564aeba0a3eaa3_1440w.jpg)

1. 系统启动过程中的第一级验签操作是由 **[ChipRom](https://zhida.zhihu.com/search?content_id=272990960&content_type=Article&match_order=1&q=ChipRom&zhida_source=entity)** 来完成的，只要芯片一出厂，用户就无法修改固化在芯片中的这部分代码。
2. 验签操作使用的 **RSA公钥** 或者哈希值将会被保存在 **[OTP](https://zhida.zhihu.com/search?content_id=272990960&content_type=Article&match_order=1&q=OTP&zhida_source=entity) /efuse** 中，该区域中的数据一般只有ChipRom和TEE能够读取且无法被修改。RSA公钥或者哈希值将会在产品出厂之前被写入到OTP/efuse中，而且不同厂商使用的密钥会不一样。
3. RSA公钥或者哈希值，需要保存在 **电子证书** 中，系统启动先 **对电子证书进行验证** ，验证证书通过后再去验证镜像文件的合法性。但是一般芯片厂商直接把其放入到了fip包中。
4. ARMv8架构之后ARM提供了ATF, BootLoader、TEE镜像文件、Linux内核镜像文件、recovery镜像文件都是由 **ATF来进行引导和加载** 而不是由ChipRom来完成的。当然开发者也可以对ATF进行定制化，修改ATF中的验签过程，但是修改后的验签方案需要符合 **[TBBR规范](https://zhida.zhihu.com/search?content_id=272990960&content_type=Article&match_order=1&q=TBBR%E8%A7%84%E8%8C%83&zhida_source=entity)** （ [developer.arm.com/docum](https://link.zhihu.com/?target=https%3A//developer.arm.com/documentation/den0006/d/) ）。
5. ChipRom只会去验证ATF中 **bl1** 的合法性，后续引导过程同样也是按照链式验签的方式进行，符合TBBR规范。 **系统启动的地址只能是ChipRom** ，调试阶段可以使用xip启动模式，正式产品可以通过OTP或EFUSE中特定bit实现关xip启动模式，只能从Rom启动。

> OTP和efuse是什么？

1. 一次性可编程存储器 (**One-Time Programmable Memor** y)：OTP 是一种只能写入数据一次的存储器类型。一旦写入数据，就不能更改或擦除。这使得它非常适合存储像安全密钥、设备配置或启动模式选择等敏感信息。
2. 电子熔丝 (**Electronic Fuse**)：eFuse 是一种可以通过编程方式 “烧断” 的电子元件。烧断 eFuse 后，其状态将永久改变，无法恢复。
![](https://picx.zhimg.com/v2-f67725456e41325b10c3f8c3ef7ba3b9_1440w.jpg)

> TBBR规范是什么？  
> **ARM官方** 的secure boot实现规范TBB（Trusted Board Boot）的规格说明书TBBR（TBB Requirements）： [developer.arm.com/docum](https://link.zhihu.com/?target=https%3A//developer.arm.com/documentation/den0006/d/) 。其他厂商可以去参考。

## 1.2 算法介绍

**消息摘要算法** 是通过单向散列函数，将一段消息的内容转换为另一段 **固定长度消息的过程** ，而被其计算后生成的消息称为 **hash值** ，它具有以下特征：

1. 任意长度的输入消息都会输出 **固定长度的hash值**
2. hash函数必须具备 **单向性** ，而无法通过hash值反向算出其消息原文
3. 不同的输入消息其输出消息也不同，即其具有 **强抗碰撞性**
4. hash值的 **计算速度要快**

在密码学中有多种消息摘要算法，如 **md5、sha1、sha256、sha512、sha3** 等。随着计算机技术的发展，有些原先认为具有 **强碰撞性的算法** （如md5、sha1），在当前已经被认为并不安全，因此secureboot中一般使用sha256、sha512等算法作为完整性算法

**非对称密码算法** 是相对于对称性密码算法而言的，在对称密码算法中加密和解密时使用的密钥相同。而非对称算法加密和解密时使用的密钥不同，其中 **私钥** 由密钥属主保管，且不能泄露，而 **公钥** 可以分发给其它人。通过私钥签名的数据只能由公钥验签。

**镜像签名流程：**

![](https://pic3.zhimg.com/v2-8a7145ed19360d6b0d1ec6b544e680a2_1440w.jpg)

1. 使用hash算法生成镜像的hash值hash(image)
2. 通过镜像发布者的私钥，使用非对称算法对镜像的hash值执行签名流程，并生成其签名值sig(hash)

**镜像验签流程：**

![](https://picx.zhimg.com/v2-76a779344eadcf22db784c1bb9e41525_1440w.jpg)

1. 使用非对称算法的公钥和签名值，对镜像的hash值进行验签。若验签通过则可进一步校验镜像完整性。否则，启动失败
2. 若验签通过，则重新计算镜像的hash值hash(image)，并将其与原始hash值hash(image)比较，若其相等则表明镜像的完整性验证通过。否则启动失败

> 公钥保护  
> 如果 **黑客自己造了一对公钥和私钥** ，芯片启动 **公钥的被替换成黑客自己的公钥，黑客用自己的私钥加密自己的镜像进行验签** ，那就可以绕过去了。  
> 所以 **公钥不能被替换** ，这里又要请OTP/efuse出山帮忙了，但是一般公钥比较长，例如RSA的2048bit，一般把公钥的hash值放入OTP/efuse，而公钥还放入镜像中。这样启动时先验证公钥再进行验签。

## 1.3 数字证书

网络上为了 **防止公钥被某个节点替换** ，使用数字证书 **对发送者的公钥做认证** 。数字证书格式遵循ITUTX.509标准，其基于ASN.1编码， [X509证书](https://zhida.zhihu.com/search?content_id=272990960&content_type=Article&match_order=1&q=X509%E8%AF%81%E4%B9%A6&zhida_source=entity) 包含以下内容：

![](https://pic1.zhimg.com/v2-4a59bd5b037818d15e6e484162247fbe_1440w.jpg)

（1）证书版本（2）证书序列号（3）证书所使用的签名算法（4）证书的发行机构名称，一般采用X500格式（5）证书的有效期，通常采用UTC时间（6）证书所有人名称，一般采用X500格式（7）证书所有人的公钥（8）证书发行者对证书的签名

数字证书是由 **数字证书认证中心（CA）** 颁发，用于认证证书持有者身份的，其核心是使用认证中心的私钥对证书申请人身份（主要是公钥）进行 **签名认证** 。认证中心可以形成以下的 **层级结构** ，即根证书认证机构可为二级认证机构颁发证书，二级认证机构可为三级认证机构颁发证书，同时他们都可以为用户颁发证书。

![](https://pic2.zhimg.com/v2-ee539fd95cf7f0335c8f625b1f6071ad_1440w.jpg)

本质上，数字证书是数字证书认证中心 **对证书申请者的信息和公钥做签名，以自身的权威性为其身份做背书** 。以上数字证书的层级结构叫做数字证书链，其中顶层的证书被称为 **根证书** ，它是由根证书中心 **自签名** 的。在验证数字证书时可按照该证书链逐级验证证书的合法性。根证书的合法性是由其自身保证的，因此一般会被预先安装到操作系统或浏览器等软件中。

**所有公司都可以颁发数字证书** ，公司颁发的证书不一定能在国际上得到广泛认可。但若在自己生产的终端中安装自己建立的 **CA根证书** ，则可以建立自身的CA信任链。

## 2\. ATF中的验签基础

## 2.1 基本概念及缩写

![](https://picx.zhimg.com/v2-c80c73f7bc5e7f93946af1649a93cfcb_1440w.jpg)

- **加密模块CM** （Crypto Module）：提供数字签名验证和hash验证的接口。
- **加密库 [CL](https://zhida.zhihu.com/search?content_id=272990960&content_type=Article&match_order=1&q=CL&zhida_source=entity)** （Cryptographic Libraies）：算法部分。
- **身份验证模块AM** （Auth Module）：描述和定义 [CoT](https://zhida.zhihu.com/search?content_id=272990960&content_type=Article&match_order=1&q=CoT&zhida_source=entity) ，内存分配，记录，提供平台依赖接口
- **镜像解析模块 [IPM](https://zhida.zhihu.com/search?content_id=272990960&content_type=Article&match_order=1&q=IPM&zhida_source=entity)** （Image Parser Module）：检查镜像的完整性，提取CoT参数。
- **镜像解析库 [IPL](https://zhida.zhihu.com/search?content_id=272990960&content_type=Article&match_order=1&q=IPL&zhida_source=entity)** （Image Parser Libraries）：对应不同的镜像类型
- 解码库ASN.1

**信任链CoT（Chain of Trust）** ：一系列有联系镜像的集合，身份验证都是围绕CoT来实现的。

信任根公钥 **ROTPK** （Root Public Key）:一般把其 **SHA-256哈希值** 存储在OTP或者efuse一次性编程存储器中。在开发阶段，ROTPK可以嵌入到bin文件中。

以BL31为例，其身份验证流程为：

![](https://picx.zhimg.com/v2-9f1aff1b6dc39a1fe5e39d9cef3e841b_1440w.jpg)

1. 使用 **ROTPK公钥** 或者ROTPK Hash对 **Trusted Key Certificate** 进行验证，获取Trusted World Public Key
2. 使用 **Trusted World Public Key** 对 **BL31 Key Certificate** 进行验证，获取BL31 Key Certificate PK
3. 使用 **BL31 Key Certificate PK** 对 **BL31 Contend Certificate** 进行验证获取BL31的hash值
4. 使用 **BL31的hash** 对 **BL31镜像** 进行校验

## 2.2 CoT镜像身份描述符

![](https://picx.zhimg.com/v2-d0aa6df216a0f25e00f450baf414d627_1440w.jpg)

**CoT** 是一个结 **构体数组** ，元素为auth\_img\_desc\_t，在include/drivers/auth/auth\_mod.h中定义：

```
typedef struct auth_img_desc_s {
    unsigned int img_id;
    const struct auth_img_desc_s *parent;
    img_type_t img_type;
    const auth_method_desc_t *const img_auth_methods;
    const auth_param_desc_t *const authenticated_data;
} auth_img_desc_t;
```
- **img\_id**:由平台指定的唯一标识符，它允许IO框架在FIP中定位图像并将其加载到为数据保留的内存中 在CoT中的镜像。
- **parent**:父镜像的身份验证描述符指针，父镜像中有验证当前镜像的参数，如果为NULL，则从平台或者ROPTK获取，并且其为信任链根。-img\_type：AM用来找到适当的IPM的解析方法，例如IMG\_RAW/IMG\_PLAT/IMG\_CERT3。-img\_auth\_methods：验证方法及其参数如前一节所述。这些用于验证当前镜像。
- **authenticated\_data** ：参数，用于验证当前CoT中的下一个镜像。这些参数只能由身份验证镜像指定，并且可以在验证后从当前镜像中提取。
```
typedef struct auth_method_desc_s {
    auth_method_type_t type;
    union {
        auth_method_param_hash_t hash;
        auth_method_param_sig_t sig;
        auth_method_param_nv_ctr_t nv_ctr;
    } param;
} auth_method_desc_t;
```

**定义** 一个CoT：

```
/* Macro to register a CoT defined as an array of auth_img_desc_t pointers */
#define REGISTER_COT(_cot) \
    const auth_img_desc_t *const *const cot_desc_ptr = (_cot); \
    const size_t cot_desc_size = ARRAY_SIZE(_cot);           \
    unsigned int auth_img_flags[MAX_NUMBER_IDS]
```

## 2.3 身份验证方法

include/drivers/auth/auth\_common.h中定义 **auth\_method\_type\_t**

```
typedef struct auth_method_desc_s {
    auth_method_type_t type;
    union {
        auth_method_param_hash_t hash;
        auth_method_param_sig_t sig;
        auth_method_param_nv_ctr_t nv_ctr;
    } param;
} auth_method_desc_t;

/*
 * The method type defines how an image is authenticated
 */
typedef enum auth_method_type_enum {
    AUTH_METHOD_NONE = 0,
    AUTH_METHOD_HASH,    /* Authenticate by hash matching */
    AUTH_METHOD_SIG,    /* Authenticate by PK operation */
    AUTH_METHOD_NV_CTR,    /* Authenticate by Non-Volatile Counter */
    AUTH_METHOD_NUM     /* Number of methods */
} auth_method_type_t;
```

用于 **IPM** 从镜像中提取这些验证参数，这些参数在 **CM** 中会用到。

**AUTH\_METHOD\_HASH** ：

```
typedef struct auth_method_param_hash_s {
    auth_param_type_desc_t *data;    /* Data to hash */
    auth_param_type_desc_t *hash;    /* Hash to match with */
} auth_method_param_hash_t;

typedef struct auth_param_type_desc_s {
    auth_param_type_t type;
    void *cookie;
} auth_param_type_desc_t;

typedef struct auth_param_type_desc_s {
    auth_param_type_t type;
    void *cookie;
} auth_param_type_desc_t;

typedef enum auth_param_type_enum {
    AUTH_PARAM_NONE,
    AUTH_PARAM_RAW_DATA,        /* Raw image data */
    AUTH_PARAM_SIG,            /* The image signature */
    AUTH_PARAM_SIG_ALG,        /* The image signature algorithm */
    AUTH_PARAM_HASH,        /* A hash (including the algorithm) */
    AUTH_PARAM_PUB_KEY,        /* A public key */
    AUTH_PARAM_NV_CTR,        /* A non-volatile counter */
} auth_param_type_t;
```

**AUTH\_METHOD\_SIG**:

```
typedef struct auth_method_param_sig_s {
    auth_param_type_desc_t *pk;    /* Public key */
    auth_param_type_desc_t *sig;    /* Signature to check */
    auth_param_type_desc_t *alg;    /* Signature algorithm */
    auth_param_type_desc_t *data;    /* Data signed */
} auth_method_param_sig_t;
```

**AUTH\_METHOD\_NV\_CTR** (防止回滚的验证，non-volatile计数器，只增加):

```
typedef struct auth_method_param_nv_ctr_s {
    auth_param_type_desc_t *cert_nv_ctr;    /* NV counter in certificate */
    auth_param_type_desc_t *plat_nv_ctr;    /* NV counter in platform */
} auth_method_param_nv_ctr_t;
```

## 2.4 验证参数存储

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

## 2.5 镜像解析库IPL

AM按照CoT的定义对镜像进行身份验证。当平台层 **将镜像从存储介质加载到指定内存后** ，AM模块首先 **调用IPM中的IPL对镜像进行完整性检查，验证通过后提取子镜像的参数** 。

所以IPL的功能： **检查镜像完整性，提取验证参数** 。

```
/*
 * Image types. A parser should be instantiated and registered for each type
 */
typedef enum img_type_enum {
    IMG_RAW,            /* Binary image */
    IMG_PLAT,            /* Platform specific format */
    IMG_CERT,            /* X509v3 certificate */
    IMG_MAX_TYPES,
} img_type_t;
```
- **IMG\_RAW** ：原始二进制
- **IMG\_PLAT** ：平台特定格式
- **IMG\_CERT** ：x.509行业标准的PKI证书镜像

IPL的描述和定义：

```
/* Image parser library structure */
typedef struct img_parser_lib_desc_s {
    img_type_t img_type;
    const char *name;

    void (*init)(void);
    int (*check_integrity)(void *img, unsigned int img_len);//镜像完整性检查
    int (*get_auth_param)(const auth_param_type_desc_t *type_desc,
            void *img, unsigned int img_len,
            void **param, unsigned int *param_len);//提取镜像验证函数的指针
} img_parser_lib_desc_t;

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

IMG\_RAW不需要IPL，IMG\_CERT镜像注册了 **IPL（X509v3库），使用了mbedTLS开源密码库** 。

drivers/auth/mbedtls/mbedtls\_x509\_parser.c中

```
REGISTER_IMG_PARSER_LIB(IMG_CERT, LIB_NAME, init,
               check_integrity, get_auth_param);
```

## 2.6 加密库CL数据结构

AM使用IPM对镜像完整性进行检查通过后， **调用CM的接口进行身份验证** ， **CM** 调用 **CL** 中函数进行实现

```
/*
 * Cryptographic library descriptor
 */
typedef struct crypto_lib_desc_s {
    const char *name;//加密库名字

    /* Initialize library. This function is not expected to fail. All errors
     * must be handled inside the function, asserting or panicking in case of
     * a non-recoverable error */
    void (*init)(void);//初始化指针

    /* Verify a digital signature. Return one of the
     * 'enum crypto_ret_value' options */
    int (*verify_signature)(void *data_ptr, unsigned int data_len,
                void *sig_ptr, unsigned int sig_len,
                void *sig_alg, unsigned int sig_alg_len,
                void *pk_ptr, unsigned int pk_len);//签名验证指针

    /* Verify a hash. Return one of the 'enum crypto_ret_value' options */
    int (*verify_hash)(void *data_ptr, unsigned int data_len,
               void *digest_info_ptr, unsigned int digest_info_len);//hash函数验证指针

    /* Calculate a hash. Return hash value */
    int (*calc_hash)(enum crypto_md_algo md_alg, void *data_ptr,
             unsigned int data_len,
             unsigned char output[CRYPTO_MD_MAX_SIZE]);//技术hash值函数指针

    /* Convert Public key (optional) */
    int (*convert_pk)(void *full_pk_ptr, unsigned int full_pk_len,
              void **hashed_pk_ptr, unsigned int *hashed_pk_len);

    /*
     * Authenticated decryption. Return one of the
     * 'enum crypto_ret_value' options.
     */
    int (*auth_decrypt)(enum crypto_dec_algo dec_algo, void *data_ptr,
                size_t len, const void *key, unsigned int key_len,
                unsigned int key_flags, const void *iv,
                unsigned int iv_len, const void *tag,
                unsigned int tag_len);//解密函数指针
} crypto_lib_desc_t;
```

**注册：**

```
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

加密库 **mbedTLS** 的注册，在drivers/auth/mbedtls/mbedtls\_crypto.c中

```
#define LIB_NAME        "mbed TLS"

REGISTER_CRYPTO_LIB(LIB_NAME, init, verify_signature, verify_hash, NULL,
            NULL, NULL);
```

## 3\. 编译实操

## 3.1 打开镜像验签宏

**optee/build/qemu\_v8.mk** 中：

```
11 ################################################################################
12 # If you change this, you MUST run \`make arm-tf-clean\` first before rebuilding
13 ################################################################################
14 TF_A_TRUSTED_BOARD_BOOT ?= n
```

修改TF\_A\_TRUSTED\_BOARD\_BOOT?= **y** ，或者通过编译参数传入都可以，进行 **重新编译** ：

```
make arm-tf-clean
make arm-tf DEBUG=1 && make -f qemu_v8.mk run-only
```
![](https://pic3.zhimg.com/v2-74729230b94e789186dfae4998f68f24_1440w.jpg)

- nt\_fw\_content.crt： **BL33** 内容证书
- nt\_fw\_key.crt： **BL33** 密钥证书
- soc\_fw\_content.crt： **BL31** 内容证书
- soc\_fw\_key.crt： **BL31** 密钥证书
- tb\_fw.crt： **BL2** 内容证书
- trusted\_key.crt： **Trusted** 密钥证书
- rot\_key.pem： **Root of Trust Key**
- rotpk\_sha256.bin： **ROTPK的sha256值**
- 其他：nt\_fw\_key.crt tos\_fw\_content.crt tos\_fw\_key.crt

## 3.2 BL2的信任链定义

首先就是 **BL2的CoT** ，在drivers/auth/tbbr/ **tbbr\_cot\_bl1**.c中定义：

```
/*
 * TBBR Chain of trust definition
 */
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

/* Register the CoT in the authentication module */
REGISTER_COT(cot_desc);
```

**trusted\_boot\_fw\_cert** 是一个证书镜像，是 **BL2的父镜像** ，可以对BL2进行身份验证。

> fwu的u是什么？  
> fw就是firmware，u是update的意思，是固件升级用的镜像。

include/export/common/tbbr/tbbr\_img\_def\_exp.h中定义了这些 **镜像ID是唯一的**

```
/* Firmware Image Package */
#define FIP_IMAGE_ID            U(0)

/* Trusted Boot Firmware BL2 */
#define BL2_IMAGE_ID            U(1)

/* SCP Firmware SCP_BL2 */
#define SCP_BL2_IMAGE_ID        U(2)

/* EL3 Runtime Firmware BL31 */
#define BL31_IMAGE_ID            U(3)

/* Secure Payload BL32 (Trusted OS) */
#define BL32_IMAGE_ID            U(4)

/* Non-Trusted Firmware BL33 */
#define BL33_IMAGE_ID            U(5)

/* Certificates */
#define TRUSTED_BOOT_FW_CERT_ID        U(6)
#define TRUSTED_KEY_CERT_ID        U(7)

#define SCP_FW_KEY_CERT_ID        U(8)
#define SOC_FW_KEY_CERT_ID        U(9)
#define TRUSTED_OS_FW_KEY_CERT_ID    U(10)
#define NON_TRUSTED_FW_KEY_CERT_ID    U(11)
...........
```
- ROTPK认证trusted\_boot\_fw\_cert
- trusted\_boot\_fw\_cert获取BL2 Hash并使用其CoT验签BL2 img

drivers/auth/tbbr/ **tbbr\_cot\_common**.c中定义了trusted\_boot\_fw\_cert

```
/* trusted_boot_fw_cert */
const auth_img_desc_t trusted_boot_fw_cert = {
    .img_id = TRUSTED_BOOT_FW_CERT_ID,//值是6
    .img_type = IMG_CERT,//镜像类型是证书镜像
    .parent = NULL, //NULL表示是信任链根
    .img_auth_methods = (const auth_method_desc_t[AUTH_METHOD_NUM]) {//定义了两种身份认证方式sig（镜像签名）和nv_ctr（非易失性计数器）
        [0] = {
            .type = AUTH_METHOD_SIG,
            .param.sig = {
                .pk = &subject_pk,
                .sig = &sig,
                .alg = &sig_alg,
                .data = &raw_data
            }
        },
        [1] = {
            .type = AUTH_METHOD_NV_CTR,
            .param.nv_ctr = {
                .cert_nv_ctr = &trusted_nv_ctr,
                .plat_nv_ctr = &trusted_nv_ctr
            }
        }
    },
    .authenticated_data = (const auth_param_desc_t[COT_MAX_VERIFIED_PARAMS]) {//定义了四个验证子镜像的验证参数
        [0] = {
            .type_desc = &tb_fw_hash,
            .data = {
                .ptr = (void *)tb_fw_hash_buf,//子镜像参数位置，属于静态缓存
                .len = (unsigned int)HASH_DER_LEN
            }
        },
        [1] = {
            .type_desc = &tb_fw_config_hash,
            .data = {
                .ptr = (void *)tb_fw_config_hash_buf,
                .len = (unsigned int)HASH_DER_LEN
            }
        },
        [2] = {
            .type_desc = &hw_config_hash,
            .data = {
                .ptr = (void *)hw_config_hash_buf,
                .len = (unsigned int)HASH_DER_LEN
            }
        },
        [3] = {
            .type_desc = &fw_config_hash,
            .data = {
                .ptr = (void *)fw_config_hash_buf,
                .len = (unsigned int)HASH_DER_LEN
            }
        }
    }
};
```

**BL2的CoT** 如下：

```
static const auth_img_desc_t bl2_image = {
    .img_id = BL2_IMAGE_ID,//值是1
    .img_type = IMG_RAW,//原始二进制镜像，不需要IPL
    .parent = &trusted_boot_fw_cert,
    .img_auth_methods = (const auth_method_desc_t[AUTH_METHOD_NUM]) {
        [0] = {
            .type = AUTH_METHOD_HASH,//hash验证
            .param.hash = {
                .data = &raw_data,//验证对象就是自己的数据本身
                .hash = &tb_fw_hash//获取hash的参考值
            }
        }
    }
};
```

篇幅有限，本篇主要 **从概念和静态配置代码角度** 进行说明，下一篇从 **代码运行时序角度** 进行深度解析，敬请期待。

参考：

1. 万字长文：安全启动之SecureBoot启动吧（小白也能看懂！）： [juejin.cn/post/72678391](https://link.zhihu.com/?target=https%3A//juejin.cn/post/7267839163502739511%23heading-7)
2. 芯片信息安全（一）安全启动： [zhuanlan.zhihu.com/p/53](https://zhuanlan.zhihu.com/p/536007837)
3. 大话密码技术（五）数字签名与数字证书原理： [zhuanlan.zhihu.com/p/52](https://zhuanlan.zhihu.com/p/524010855)

> 后记：  
> 研究软件技术本质上的干货还是代码分析，但是只分析代码，很多看的读者估计一打开就退出了，只适合小部分在电脑上详细验证技术的从业者，这只占一小部分。大部分的读者要么知识扫盲科普，要么就是不是专业干这个的。所以尽量在第一章节来段文字描述，后面的代码分析就适合详细的人看了。  
> 又是干货满满的一篇，感觉学习secure boot还挺有成就感，新知识很多，大家多多支持，分享给你的好朋友。

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位有自己公众号的留言： **申请转载** ！

纯干货持续更新，欢迎 **分享给朋友** 、点赞、收藏、在看、划线和评论交流！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

发布于 2026-04-13 11:27・上海[数字IC设计，学完verilog语法，还需要学习什么？](https://www.zhihu.com/question/412273145/answer/2161825805)

[

由于现阶段数字IC设计的方向很多，主要的有：CPU设计，GPU设计，MCU设计，音视频编解码设计，接口设计，手机芯...

](https://www.zhihu.com/question/412273145/answer/2161825805)