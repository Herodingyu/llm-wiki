---
title: "一文聊聊Linux Kernel的加密子系统【Crypto Subsystem】"
source: "https://zhuanlan.zhihu.com/p/653411461"
author:
  - "[[TrustZone​​​海思技术有限公司 员工]]"
published:
created: 2026-05-03
description: "大家好！我是安全工程师Hkcoco！ 欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco 获取更多精彩内容哦！！！ PREFACELinux密码学算法可分成两层 User space layer实作Kernel space layer实作 在user space…"
tags:
  - "clippings"
---
4 人赞同了该文章

---

大家好！我是安全工程师Hkcoco！

欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco

获取更多精彩内容哦！！！

---

## PREFACE

Linux密码学算法可分成两层

- User space layer实作
- Kernel space layer实作 在user space上想要使用密码学算法，只要安装并且执行 [openssl](https://zhida.zhihu.com/search?content_id=233331271&content_type=Article&match_order=1&q=openssl&zhida_source=entity) 这类套件即可.但是加解密的软件运算在user space上实作耗时又费力，不太适用于嵌入式设备.所以我们可以透过kernel space/硬件的协助来对加解密的性能进行优化，并降低CPU运算负担.

此篇文章介绍Linux Kernel space密码学算法实作流程为主，并没有涵盖user space中纯应用程序的操作，但不会细谈各个加解密算法，因为网络已有太多精彩的内容了。

在Linux user space application上使用kernel space密码学算法，详细运作流程可分成下列三个主要步骤：

## 1\. Kernel space （Kernel Space Cryptographic Implementation）

在Kernel space密码学算法实作上，主要分成软件以及硬件运算

- 软件运算（Software calculation） 由CPU进行密码学算法运算，不需额外硬件，但很耗费CPU性能.Linux Kernel原始码位于 [crypto subsystem](https://zhida.zhihu.com/search?content_id=233331271&content_type=Article&match_order=1&q=crypto+subsystem&zhida_source=entity) 底下
- 硬件加速（Hardware component） 由硬件辅助进行密码学算法运算（offloading），不需耗费CPU性能，但需要额外硬件.

SoC Component–许多ARM SoC厂商都会将硬件加解密元件放入SoC中，Linux Kernel原始码多位于drivers/crypto底下.且设计必须遵照Linux crypto framework，不能私下修改。

[TPM](https://zhida.zhihu.com/search?content_id=233331271&content_type=Article&match_order=1&q=TPM&zhida_source=entity) –专门针对保护密钥与密码运算而设计的一个高安全性的硬件安全芯片，Linux Kernel原始码位于drivers/char/tpm底下。

另外像Intel有推出CPU instructions– [Intel® AES NI](https://zhida.zhihu.com/search?content_id=233331271&content_type=Article&match_order=1&q=Intel%C2%AE+AES+NI&zhida_source=entity) \[9\].这或许也算硬件加速的一种.

## 2\. Crypto API–User space interface

主要的功能是提供界面，让user space可存取kernel space.目前主流为 [cryptodev](https://zhida.zhihu.com/search?content_id=233331271&content_type=Article&match_order=1&q=cryptodev&zhida_source=entity) 以及 [af\_alg](https://zhida.zhihu.com/search?content_id=233331271&content_type=Article&match_order=1&q=af_alg&zhida_source=entity)

- CRYPTODEV \[12\] 不在Linux Kernel中，需要额外下载，编译并挂载kernel module
- 使用ioctl界面 从OpenBSD Cryptographic Framework移值过来 [OpenSSL](https://zhida.zhihu.com/search?content_id=233331271&content_type=Article&match_order=1&q=OpenSSL&zhida_source=entity) 早期即支持cryptodev
- AF\_ALG Linux Kernel 2.6.38开始纳入，原始码位于crypto/af\_alg.c
- 使用netlink界面 OpenSSL v1.1.0开始支持AF\_ALG （note:除此之外，OpenSSL v1.1.0加入ChaCha20 & Poly1305加解密算法并且移除SSv2）

cryptodev官网上表示使用cryptodev性能较AF\_ALG好，但根据\[17\]的实验，性能其实差异不大.

个人认为新开发的程序可以考虑使用AF\_ALG.毕竟AF\_ALG在mainline Kernel中–稳定性，兼容性以及维护性都会比较好.

## 3\. User space密码学函式库（Cryptography libraries）\[7\]

以下为较常见的User space密码学函式库\[19\]，

- OpenSSL
- [wolfSSL](https://zhida.zhihu.com/search?content_id=233331271&content_type=Article&match_order=1&q=wolfSSL&zhida_source=entity)
- [GnuTLS](https://zhida.zhihu.com/search?content_id=233331271&content_type=Article&match_order=1&q=GnuTLS&zhida_source=entity)

个人推荐OpenSSL.除了牌子老，使用者众外.OpenSSL也被Linux Foundation下Core Infrastructure Initiative所资助。

OpenSSL提供AF\_ALG以及cryptodev的engine，可透过engine来存取Crypto API.但这边要注意的是，Debian中OpenSSL套件预设关闭AF\_ALG以及cryptodev选项.所以直接执行会使用user space的密码学算法实作.若想要使用kernel space的密码学算法实作，需下载原始码下来设定并重新编译.

- 开启OpenSSL AF\_ALG engine步骤
	- 修改debian/rules，在CONFARGS最后面加入enable-afalgeng
- 开启OpenSSL cryptodev engine步骤
	- 1.下载cryptodev后，将crypto/cryptodev.h \[21\]复制一份到OpenSSL/crypto底下
		- 2.修改debian/rules，在CONFARGS最前面加入-DHAVE\_CRYPTODEV -DUSE\_CRYPTDEV\_DIGESTS 编译完的OpenSSL即可存取Kernel space密码学算法.

## PART ONE--Crypto Subsystem of Linux Kernel

介绍由应用层所发出的crypto（cryptography）request，透过system call将request传送到Linux kernel端，并经由crypto subsystem将request转发给硬件算法引擎（hardware crypto engine）的流程。

## 概览

Crypto subsystem是Linux系统中负责处理crypto request的子系统，除了包含流程控制机制之外， **另一个重要特色就是提供算法实作的抽象层，让各家厂商能够依据需求去客制化实作方式。**

其中一个常见例子就是厂商 **在硬件构架中加入用以加速特定算法运算效率的硬件算法引擎** ，并且透过crypto subsystem将驱动硬件算法引擎的流程整合进Linux系统中，供其他kernel module或是应用层使用。

一般芯片厂商都会这么玩，至少在我接触的厂商中，因为集成使用openssl软件库去计算的时候会影响整个产品的性能，一般都会使用硬件来替换软件实现，之前我也发的关于硬件IP的就是用来做运算的IP。

以下以openSSL library如何将crypto request传送到kernel crypto subsystem为例子：

![](https://pica.zhimg.com/v2-51abd3b5dc5614ac4117464f110d9ce4_1440w.jpg)

image from: Linux Kernel

## cryptodev Engine

在Linux系统中，想要实现应用层与硬件装置的沟通，第一个想到的就是透过character/block device driver，让应用程序开启表示此硬件装置的抽象层，并且藉由读写行为与硬件装置进行互动。

而Cryptodev-linux就是负责此角色，它提供中间层的服务，接收由应用层传送过来的crypto request， **再呼叫Linux kernel crypto Subsystem的crypto API将request转发给特定的硬件算法引擎。**

Cryptodev-linux为miscellaneous device类型的kernel module，预设路径是/dev/crypto，使用ioctl file operation cryptodev\_ioctl来接受应用端所传递过来的数据。

```
1// https://github.com/cryptodev-linux/cryptodev-linux/blob/master/ioctl.c
 2
 3static const struct file_operations cryptodev_fops = {
 4    .owner = THIS_MODULE,
 5    .open = cryptodev_open,
 6    .release = cryptodev_release,
 7    .unlocked_ioctl = cryptodev_ioctl,
 8#ifdef CONFIG_COMPAT
 9    .compat_ioctl = cryptodev_compat_ioctl,
10#endif /* CONFIG_COMPAT */
11    .poll = cryptodev_poll,
12};
13
14static struct miscdevice cryptodev = {
15    .minor = MISC_DYNAMIC_MINOR,
16    .name = "crypto",
17    .fops = &cryptodev_fops,
18    .mode = S_IRUSR|S_IWUSR|S_IRGRP|S_IWGRP|S_IROTH|S_IWOTH,
19};
20
21static int __init
22cryptodev_register(void)
23{
24    int rc;
25
26    rc = misc_register(&cryptodev);
27    if (unlikely(rc)) {
28        pr_err(PFX "registration of /dev/crypto failed\n");
29        return rc;
30    }
31
32    return 0;
33}
```

应用端则是使用cryptodev.h定义好的struct crypt\_op或是struct crypt\_auth\_op来组成指定crypto request，并呼叫ioctl system call将request送给Cryptodev-linux。

```
1// https://github.com/cryptodev-linux/cryptodev-linux/blob/master/crypto/cryptodev.h
 2
 3struct crypt_auth_op {
 4    __u32    ses;        /* session identifier */
 5    __u16    op;        /* COP_ENCRYPT or COP_DECRYPT */
 6    __u16    flags;        /* see COP_FLAG_AEAD_* */
 7    __u32    len;        /* length of source data */
 8    __u32    auth_len;    /* length of auth data */
 9    __u8    __user *auth_src;    /* authenticated-only data */
10
11    /* The current implementation is more efficient if data are
12     * encrypted in-place (src==dst). */
13    __u8    __user *src;    /* data to be encrypted and authenticated */
14    __u8    __user *dst;    /* pointer to output data. Must have
15                             * space for tag. For TLS this should be at least 
16                             * len + tag_size + block_size for padding */
17
18    __u8    __user *tag;    /* where the tag will be copied to. TLS mode
19                                 * doesn't use that as tag is copied to dst.
20                                 * SRTP mode copies tag there. */
21    __u32    tag_len;    /* the length of the tag. Use zero for digest size or max tag. */
22
23    /* initialization vector for encryption operations */
24    __u8    __user *iv;
25    __u32   iv_len;
26};
```

Sample code for Cryptodev-linux ioctl:

```
1// setup data for your crypto request
 2 cryp.ses = ctx->sess.ses;
 3 cryp.iv = (void*)iv;
 4 cryp.op = COP_DECRYPT;
 5 cryp.auth_len = auth_size;
 6 cryp.auth_src = (void*)auth;
 7 cryp.len = size;
 8 cryp.src = (void*)ciphertext;
 9 cryp.dst = ciphertext;
10 cryp.flags = COP_FLAG_AEAD_TLS_TYPE;
11
12 // call ioctl to pass a crypto request to \`/dev/crypto\`
13 if (ioctl(ctx->cfd, CIOCAUTHCRYPT, &cryp)) {
14   perror("ioctl(CIOCAUTHCRYPT)");
15   return -1;
16 }
```

另外，Cryptodev-linux也提供session机制，每个crypto request对应到一个session，而session管理当前crypto request的状态。

例如，目前session在initialized的状态，则表示此crypto request可执行encrypt，透过此方式来确保crypto request会在正确的流程下运作。

## Linux Kernel Crypto Subsystem

Crypto request会透过kernel crypto API传到kernel crypto subsystem中。以下为简略的crypto API调用流程：

![](https://pic1.zhimg.com/v2-96cedfab726269be6bace4500ada858e_1440w.jpg)

在这里插入图片描述

## Transformation Object & Transformation Implementation

首先Crypto subsystem有两个重要元素：

- transformation object
- transformation implementation。

transformation object在API中会简写为tfm，又被称作cipher handler；

**而transformation implementation则是transformation object底层的实作内容，又被称作crypto algo** ，以之前例子来说就是crypto engine的算法实作。

之所以要区分成object和implementation， **最主要的原因是有可能多个object会使用同一个implementation。**

举例来说，A和B使用者都要使用hmac-sha256算法，因此会新建立A和B两个transformation object并包含A和B各自拥有的key值， **但这两个object有可能会使用同一个transformation implementation来呼叫同一个crypto engine进行算法运算。**

```
TFM: The transformation object (TFM) is an instance of a transformation implementation. There can be multiple transformation objects associated with a single transformation implementation. Each of those transformation objects is held by a crypto API consumer or another transformation. https://www.kernel.org/doc/html/latest/crypto/intro.html
```

---

```
1struct crypto_tfm {
2    u32 crt_flags;
3    int node;
4    void (*exit)(struct crypto_tfm *tfm);
5    struct crypto_alg *__crt_alg; // crypto algorithm or transformation implementation
6    void *__crt_ctx[] CRYPTO_MINALIGN_ATTR;
7};
```
- 当有crypto request进来，会先根据request中指定的算法名称，从已注册的crypto algorithm list中取出适合的crypto algorithm，并新建立transformation object。
- 之后，transformation object会再被组成crypto subsystem所用的cipher request。cipher request有可能共享同一个transformation object，举例来说，hmac-sha256的transformation object包含了transformation implementation和一个key值，而这个transformation object可以使用在多个cipher request的messsage上进行hash算法（不同plaintext使用同一把key进行运算）。
- 当cipher request完成相关设值之后，接着实际调用transformation object的transformation implementation执行算法运算。

此时会出现一个问题，就是当短时间有多个request进来时，我们该如何依序地处理request？

这点crypto subsystem也设计了方便的struct crypto\_engine，crypto engine提供了queue管理机制，让多个request能够顺序地转发给对应的crypto engine。

当然如果我们有额外的需求，也可以自己实作其他机制来管理，不一定要使用crypto engine。

```
1struct crypto_engine {
 2    char            name[ENGINE_NAME_LEN];
 3    bool            idling;
 4    bool            busy;
 5    bool            running;
 6
 7    bool            retry_support;
 8
 9    struct list_head    list;
10    spinlock_t        queue_lock;
11    struct crypto_queue    queue;
12    struct device        *dev;
13
14    bool            rt;
15
16    // implement these three functions to trigger your hardware crypto engine
17    int (*prepare_crypt_hardware)(struct crypto_engine *engine);
18    int (*unprepare_crypt_hardware)(struct crypto_engine *engine);
19    int (*do_batch_requests)(struct crypto_engine *engine);
20
21    struct kthread_worker           *kworker;
22    struct kthread_work             pump_requests;
23
24    void                *priv_data;
25    struct crypto_async_request    *cur_req;
26};
```

## Register an Crypto Algorithm (Transformation Implementation)

介绍完crypt API流程后，可以知道要新增transformation implementation到crypto subsystem， **最重要的就是注册transformation implementation到crypto algorithm list中。**

而Crypto API提供了相关注册API，以stm32-cryp为例：

```
1struct skcipher_alg {
 2    int (*setkey)(struct crypto_skcipher *tfm, const u8 *key,
 3                  unsigned int keylen);
 4    int (*encrypt)(struct skcipher_request *req);
 5    int (*decrypt)(struct skcipher_request *req);
 6    int (*init)(struct crypto_skcipher *tfm);
 7    void (*exit)(struct crypto_skcipher *tfm);
 8
 9    unsigned int min_keysize;
10    unsigned int max_keysize;
11    unsigned int ivsize;
12    unsigned int chunksize;
13    unsigned int walksize;
14
15    struct crypto_alg base;
16};
17
18static struct skcipher_alg crypto_algs[] = {
19{
20    .base.cra_name        = "ecb(aes)",
21    .base.cra_driver_name    = "stm32-ecb-aes",
22    .base.cra_priority    = 200,
23    .base.cra_flags        = CRYPTO_ALG_ASYNC,
24    .base.cra_blocksize    = AES_BLOCK_SIZE,
25    .base.cra_ctxsize    = sizeof(struct stm32_cryp_ctx),
26    .base.cra_alignmask    = 0xf,
27    .base.cra_module    = THIS_MODULE,
28
29    .init            = stm32_cryp_init_tfm,
30    .min_keysize        = AES_MIN_KEY_SIZE,
31    .max_keysize        = AES_MAX_KEY_SIZE,
32    .setkey            = stm32_cryp_aes_setkey,
33    .encrypt        = stm32_cryp_aes_ecb_encrypt,
34    .decrypt        = stm32_cryp_aes_ecb_decrypt,
35},
36}
```

上述建立含有算法实作的transformation implementation后，接着呼叫注册API：

```
1ret = crypto_register_skciphers(crypto_algs, ARRAY_SIZE(crypto_algs));
2if (ret) {
3    dev_err(dev, "Could not register algs\n");
4    goto err_algs;
5}
```

即可完成注册。

另外，代码中提及的structure member中， **cra\_priority代表各transformation implementation的优先程度** ，举例来说，AES-ECB有注册软件和硬件两种不同的transformation implementation，优先程度较高的会先被采用。

```
cra_priority

Priority of this transformation implementation. In case multiple transformations with same cra_name are available to the Crypto API, the kernel will use the one with highest cra_priority.
```

---

## PART TWO--Crypto Subsystem of Linux Kernel - Asynchronous & Synchronous

在crypto subsystem中，crypto API分成asynchronous（异步）和synchronous（同步）两种机制。

最早版本的crypto API其实只有synchronous crypto API，但随着要处理的数据量增加，运算和数据传输时间也可能大幅拉长，此时synchronous crypto API有可能让处理流程陷入较长时间的等待，因此后来引入了asynchronous crypto API，供使用者依据自己的使用场景来选择适合的机制。

而asynchronous与synchronous crypto API在命名设计上有所区别，asynchronous会在前缀多加一个a字，反之synchronous则是s字，以hash为例：

```
1// asynchronous API
2int crypto_ahash_digest(struct ahash_request *req);
3
4// synchronous API
5int crypto_shash_digest(struct shash_desc *desc, const u8 *data,
6                        unsigned int len, u8 *out);
```

除了命名之外，由于两种机制的处理流程不同，因此所需的参数也会有所不同。

以下同样以hash crypto algorithm为例子，说明synchronous和asynchronous crypto API的差异和使用情境。

## Synchronous hash API

API document: [docs.kernel.org/crypto/](https://link.zhihu.com/?target=https%3A//docs.kernel.org/crypto/api-digest.html%23synchronous-message-digest-api)

![](https://pic1.zhimg.com/v2-5d998159473628822589212643083f58_1440w.jpg)

在这里插入图片描述

Synchronous hash API中有一个重要的参数struct shash\_desc \*desc，它是state handler，用以保存运算流程中所需的状态数值。

例如，在API的呼叫流程中，crypto\_shash\_update（）可以被多次呼叫，让使用者可以放入多组需要进行运算的message，而当crypto engine运算完一组message后，可能有些中间状态是需要被保存起来的，这些状态数值就会放在state handler中。

```
1struct shash_desc {
2    struct crypto_shash *tfm;
3
4  // store required state for crypto engine
5    void *__ctx[] __aligned(ARCH_SLAB_MINALIGN); 
6};
```

**因此当使用者在呼叫API前，会需要自己分配一块足够大小的內存，以让crypto engine能够存放这些状态** 。在transformation implementation中会设定好crypto engine所需的状态储存空间大小，使用者只需要呼叫特定API即可取得。

```
1unsigned int size;
2struct crypto_shash *hash; // transformation object or called cipher handler
3struct shash_desc *desc; // state handler
4
5hash = crypto_alloc_shash(name, 0, 0); // create a transformation object
6
7// get a required desc size for crypto engine via \`crypto_shash_descsize\` API
8size = sizeof(struct shash_desc) + crypto_shash_descsize(hash);
9desc = kmalloc(size, GFP_KERNEL);
```

建立好shash\_desc之后，接着执行初始化的API，

这个API主要会呼叫transformation implementation的init function，用意是让对应的crypto engine能够进行初始化或是重置等，以准备接下来的运算行为。

```
1int rc;
2rc = crypto_shash_init(desc);
3// error handling
```

初始化完成后，就可以将呼叫update API来对指定的message进行hash运算。

```
1rc = crypto_shash_update(desc, message, message_len);
2// error handling
```

最後，呼叫 final 來取得 hash 結果。

```
1 u8 result[DIGEST_SIZE];
2 rc = crypto_shash_final(desc, result);
3 // error handling
```

基本上synchronous API使用方式跟一般应用端的crypto library很相似，只要顺序的呼叫对应流程的API，并且针对返回的结果进行error handling即可。

Synchronous crypto API用起来虽然直观，但是却不适用于一些场景，除了一开始有提到synchronous机制会造成block之外，另一个可能的问题是，当需要处理的数据为不连续內存区段时，synchronous crypto API就不是这么好用。

可以看到之前所提及的例子，其中crypto\_shash\_update的输入参数message为一段连续內存的buffer，假设目前有好几段数据，那就必须要呼叫crypto\_shash\_update多次，才能够传入所有的数据。

## Asynchronous hash API

Asynchronous crypto API提供了非同步的机制和引入 [【struct scatterlist】](https://link.zhihu.com/?target=http%3A//www.wowotech.net/memory_management/scatterlist.html) ，来改善上述所提到的问题。

```
1struct ahash_request {
 2    struct crypto_async_request base;
 3
 4    unsigned int nbytes;
 5    struct scatterlist *src;
 6    u8 *result;
 7
 8    /* This field may only be used by the ahash API code. */
 9    void *priv;
10
11    void *__ctx[] CRYPTO_MINALIGN_ATTR;
12};
13
14int crypto_ahash_digest(struct ahash_request *req);
```

从API中可以看到参数一率改成struct ahash\_request，ahash\_request结构中包含重要的成员struct scatterlist \*，struct scatterlist用来描述一段连续physical memory区段，而它可以是chain的形式，这也意味着能够将多个physical memory区段串连成一个list。

```
1typedef void (*crypto_completion_t)(struct crypto_async_request *req, int err);
 2
 3struct crypto_async_request {
 4    struct list_head list;
 5    crypto_completion_t complete;
 6    void *data;
 7    struct crypto_tfm *tfm;
 8
 9    u32 flags;
10};
```

另外，struct crypto\_async\_request则是包含一个callback function crypto\_completion\_t，当运算完成之后，则会透过此callback来通知使用者接续处理完成的流程。

![](https://pic4.zhimg.com/v2-0bd09bb82515033203b94b1174700c9f_1440w.jpg)

在这里插入图片描述

由于是asynchronous非同步机制，因此crypto engine在处理request时，行为和流程也和synchronous同步机制有蛮大的差异，其中常见的实作方式加入request queue来管理多个request，当使用者呼叫update API发送request时，则会将request加入到queue中，并直接回传处理中（-EINPROGRESS）的状态信息。

以下为简单的asynchronous hash API使用例子：

```
1const u32 result_len = 16;
 2struct crypto_ahash *tfm;
 3struct ahash_request *req;
 4u8 *result;
 5
 6result = kmalloc(result_len, GFP_NOFS);
 7
 8tfm = crypto_alloc_ahash(0, 0, CRYPTO_ALG_ASYNC);
 9req = ahash_request_alloc(tfm, GFP_NOFS);
10// set callback function
11ahash_request_set_callback(req, CRYPTO_TFM_REQ_MAY_SLEEP, callback_fn, NULL);
12// set input data
13ahash_request_set_crypt(req, sc, NULL, 32);
14
15err = crypto_ahash_init(req);
16
17err = crypto_ahash_update(req);
18if (err == -EINPROGRESS)
19{
20    //
21}
22
23err = crypto_ahash_final(req);
24if (err == -EINPROGRESS)
25{
26    //
27}
```

其他注意事项： 虽然命为asynchronous hash API，但实际上对应到的crypto engine实作方式不一定就都会以非同步的方式来处理，具体流程还是要依照各家厂商的实作内容为主。

如果使用者使用asynchronous hash API，但是实际上 **对应的transformation implementation却是synchronous型态，crypto subsystem会主动进行相关的数据转换，因此也是可以正常运作的。**

## 结论

简单介绍asynchronous和synchronous crypto API以及与crypto engine的沟通流程，表面上看起来asynchronous机制更有弹性，不过对于厂商来说，实际上要实作哪种机制可能会受到硬件或是其他实作层面的限制，因此还是要多方参考后才能知道哪种方式比较好。

---

## PART THREE--Crypto Subsystem of Linux Kernel - Asynchronous Request Handling Mechanism

由于在crypto subsystem中预期多个crypto request可以同时向同一个crypto engine发出请求，因此crypto engine driver必须实作对应机制，使其有能力能应付此情况。

此外，结合在前一节有提到crypto subsystem的asynchronous crypto API流程，较常见的实作方式就是crypto queue搭配worker，额外开一个kernel thread来与crypto engine进行沟通，并让crypto request按照FIFO顺序处理，而本文主要针对此设计方式，说明整个运作流程和细节。

## Overview

![](https://pic1.zhimg.com/v2-86ef4eebae4241a1c25051c2c6c75cc6_1440w.jpg)

在这里插入图片描述

## 条件

假设hardware crypto engine一次只能处理一个request，将request根据需求设置好register之后，启动crypto engine进行运算，运算完结果后才能换下一个request。

当运算出结果后，crypto engine会举起status interrupt，通知外部已运算完成。

多个Request有可能同时对hardware crypto engine发出请求。

一个完整的crypto request流程包含三个API call: Init→Update→Final，Final结果回传后，则此crypto request将会被释放，不再使用。

## IDEA

建立一个全局的crypto request list，将进来的request依序排到list当中。

建立一个worker（kernel thread）和对应的work queue来与hardware crypto engine进行沟通。worker的任务除了从crypto request list中取出request来处理之外，也可能会包含crypto engine的初始化和资源释放等工作。

注册interrupt handler，当status interrupt举起时，呼叫user自定义的completion callback function来完成最后的流程。如果当前是执行最后的final API call且request有自定义的resource需要被释放，则会在呼叫完callback function后执行。

## verison

Linux kernel version: v5.17.3

## Crypto Queue

Linux kernel有实作通用型的crypto queue structure以及对应的操作API：

```
1struct crypto_queue {
 2    struct list_head list;
 3    struct list_head *backlog;
 4
 5    unsigned int qlen;
 6    unsigned int max_qlen;
 7};
 8
 9void crypto_init_queue(struct crypto_queue *queue, unsigned int max_qlen);
10
11int crypto_enqueue_request(struct crypto_queue *queue, struct crypto_async_request *request);
12void crypto_enqueue_request_head(struct crypto_queue *queue, struct crypto_async_request *request);
13
14struct crypto_async_request *crypto_dequeue_request(struct crypto_queue *queue);
15
16static inline unsigned int crypto_queue_len(struct crypto_queue *queue);
```

在大多数情况下，我们可以直接利用此structure来实现crypto request list，不过根据我们上述的场景，request list可能会被多个request同时操作，因此要再加上lock机制保护。

```
1struct cherie_crypto_engine {
 2    struct device  *dev;
 3
 4    struct crypto_queue        queue;
 5    struct kthread_worker   *kworker;
 6      struct kthread_work     do_requests;
 7    spinlock_t                  queue_lock;
 8
 9    struct crypto_async_request *current_req;
10};
11
12static int cherie_request_enqueue(struct ahash_request *req)
13{
14    int ret;
15    unsigned long flags;
16    struct cherie_crypto_engine *engine = get_engine();
17
18    spin_lock_irqsave(&engine->queue_lock, flags);
19    ret = crypto_enqueue_request(&engine->queue, &req->base);
20    spin_unlock_irqrestore(&engine->queue_lock, flags);
21    return ret;
22}
```

## Worker & Worker Queue

Worker是唯一可以操作crypto engine的kernel thread，以确保crypto engine一次只会执行一个任务。同样地，我们也利用Linux kernel本身提供的worker API来实现：

```
1struct kthread_worker *kthread_create_worker(unsigned int flags, const char namefmt[], ...);
2bool kthread_queue_work(struct kthread_worker *worker, struct kthread_work *work);
```

至于work可能会包含几个项目：

- crypto engine初始化。
- 从crypto request list取出request，并依据request的信息进行crypto engine相关register的读写操作。
- crypto engine资源的释放。（例如当前没有request要处理时，可以先释放相关资源）
```
1static void cherie_work(struct kthread_work *work)
 2{
 3    unsigned long flags;
 4  struct cherie_request_state *state;
 5    struct ahash_request *req;
 6    struct crypto_async_request *async_req;
 7    struct cherie_crypto_engine *engine = get_engine();
 8    
 9    spin_lock_irqsave(&engine->queue_lock, flags);
10
11    if (!engine->initialize)
12  {
13     // do initialization
14  }
15
16    // we can't fetch the next request if the current request isn't done.
17    if (engine->current_req)
18    {
19        spin_unlock_irqrestore(&engine->queue_lock, flags);
20        return;
21    }
22
23    async_req = crypto_dequeue_request(&engine->queue);
24    spin_unlock_irqrestore(&engine->queue_lock, flags);
25
26    if (!async_req)
27        return;
28
29    req = ahash_request_cast(async_req);
30    state = ahash_request_ctx(req);
31
32    switch (state->algo_op)
33    {
34    case ALGO_UPDATE:
35        cherie_do_request_update(req);
36        break;
37    case ALGO_FINAL:
38        cherie_do_request_final(req);
39        break;
40    default:
41        break;
42    }
43}
```

## Status Interrupt Handling

由于是asynchronous request机制，因此在crypto engine计算完成、举起status interrupt signal之后，透过bottom half方式呼叫user定义的completion callback function来结束此阶段的API call。

```
1static irqreturn_t cherie_crypto_engine_irq_thread_fn(int irq, void *arg)
 2{
 3    unsigned long flags;
 4    struct cherie_crypto_engine *engine = get_engine();
 5
 6    spin_lock_irqsave(&engine->queue_lock, flags);
 7
 8    if (engine->current_req)
 9    {
10        engine->current_req->complete(engine->current_req, 0);
11        engine->current_req = NULL;
12    }
13    spin_unlock_irqrestore(&engine->queue_lock, flags);
14    // add a work to process the next request
15    kthread_queue_work(ctx->kworker, &ctx->do_requests);
16
17    return IRQ_HANDLED;
18}
19
20static int cherie_crypto_engine_probe(struct platform_device *pdev)
21{
22  int irq, ret;
23  irq = platform_get_irq(pdev, 0);
24    if (irq < 0)
25        return irq;
26
27    ret = devm_request_threaded_irq(dev, irq, cherie_crypto_engine_irq_handler,
28                    cherie_crypto_engine_irq_thread_fn, IRQF_TRIGGER_HIGH | IRQF_ONESHOT,
29                    dev_name(dev), ctx);
30}
```

## Implement Crypto API

最后实作Crypto API，也就是在overview中有提到的transformation implementation。

通常来说，asynchronous request回传的status code有三种：

- 0代表成功、
- \-EINPROGRESS代表正在处理中、
- 剩下的代表其他error code。

如果我们在实作API时，回传了-EINPROGRESS，那一定要在后续的流程中呼叫user program的callback function，不然有可能user program就会陷入一直等待callback的循环中。

举例来说，我们在update API function中，当request被加入到queue后，即回传-EINPROGRESS状态给user program：

```
1static int cherie_crypto_engine_update(struct ahash_request *req)
 2{
 3    int ret;
 4    struct cherie_crypto_engine *engine = get_engine();
 5    struct cherie_request_state *state = ahash_request_ctx(req);
 6
 7    state->algo_op = ALGO_UPDATE;
 8    ret = cherie_crypto_request_enqueue(req);
 9    kthread_queue_work(ctx->kworker, &ctx->do_requests);
10    return ret; // ret is -EINPROGRESS if the request was added to queue.
11}
```

那么就要确保在worker执行任务过程中会呼叫request→complete callback function，好让user program知道他可以继续执行下一个API call。

## 结论

本篇主要是说明在Linux kernel的crypto subsystem之下，运用crypto queue来处理多个request同时对一个hardware crypto engine的情境，并且搭配worker来实现asynchronous request流程。

其中比 **较需要考察的是由于worker是唯一能与crypto engine互动的thread，因此worker需要处理的任务和顺序，是需要根据Crypto API流程和crypto engine本身的功能而设计的。**

当然，如果不想这么麻烦的话，在Linux kernel v4.9.0以上的版本，有提供抽象层 [【crypto/engine.h】](https://link.zhihu.com/?target=https%3A//elixir.bootlin.com/linux/latest/source/include/crypto/engine.h) ，它包含上述所提及的queue和worker的机制以及流程控制等，可以让硬件供应商更方便的将crypto engine整合到Linux kernel中。

## 参考资料

---

```
+ [1]: https://en.wikipedia.org/wiki/Advanced_Encryption_Standard

+ [2]: https://en.wikipedia.org/wiki/RSA_(cryptosystem)

+ [3]: https://en.wikipedia.org/wiki/Curve25519

+ [4]: https://en.wikipedia.org/wiki/SHA-2

+ [5]: https://en.wikipedia.org/wiki/SHA-3

+ [6]: https://www.kernel.org/doc/Documentation/crypto/asymmetric-keys.txt

+ [7]: https://en.wikipedia.org/wiki/Comparison_of_cryptography_libraries

+ [8]: https://www.coreinfrastructure.org/grants

+ [9]: https://en.wikipedia.org/wiki/AES_instruction_set

+ [10]: https://en.wikipedia.org/wiki/Hardware_security_module

+ [11]: https://szlin.me/2017/01/07/%E5%88%9D%E6%8E%A2-tpm-2-0/

+ [12]: http://cryptodev-linux.org/
+ [13]: https://www.kernel.org/doc/Documentation/crypto/userspace-if.rst

+ [14]: https://lwn.net/Articles/410763/

+ [15]: https://www.openssl.org/news/openssl-1.1.0-notes.html

+ [16]: https://events.linuxfoundation.org/sites/events/files/slides/lcj-2014-crypto-user.pdf

+ [17]: http://events.linuxfoundation.org/sites/events/files/slides/2017-02%20-%20ELC%20-%20Hudson%20-%20Linux%20Cryptographic%20Acceleration%20on%20an%20MX6.pdf

+ [18]: https://www.slideshare.net/nij05/slideshare-linux-crypto-60753522

+ [19]: https://en.wikipedia.org/wiki/Comparison_of_cryptography_libraries

+ [20]: https://patchwork.kernel.org/patch/9192881/

+ [21]: https://github.com/cryptodev-linux/cryptodev-linux/blob/master/crypto/cryptodev.h

+ [22]: https://www.slideshare.net/nij05/slideshare-linux-crypto-60753522

+ [23]:[【Linux Kernel Crypto API】](https://docs.kernel.org/crypto/index.html)

+ [24]:[【Kernel Crypto API Interface Specification】](https://www.kernel.org/doc/html/latest/crypto/intro.html)

+ [25]:[【An overview of the crypto subsystem - The Linux Foundation】](http://events17.linuxfoundation.org/sites/events/files/slides/brezillon-crypto-framework_0.pdf)

+ [26]:[【SZ Lin with Cybersecurity & Embedded Linux】](https://szlin.me/2017/04/05/linux-kernel-%E5%AF%86%E7%A2%BC%E5%AD%B8%E6%BC%94%E7%AE%97%E6%B3%95%E5%AF%A6%E4%BD%9C%E6%B5%81%E7%A8%8B/)
```

> 本文使用 [Zhihu On VSCode](https://zhuanlan.zhihu.com/p/106057556) 创作并发布

发布于 2023-08-31 07:54・四川[一个很变态但可以让你迅速掌握Java的方法](https://zhuanlan.zhihu.com/p/361626241)

[

从业十年，我想根据自己的行业经验给大家提一些建议。 跟其他行业相比，做Java开发的岗位确实算是高薪职业，我们那个...

](https://zhuanlan.zhihu.com/p/361626241)