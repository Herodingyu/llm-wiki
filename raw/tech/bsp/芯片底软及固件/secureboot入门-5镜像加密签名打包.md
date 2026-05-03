---
title: "secureboot入门-5镜像加密/签名/打包"
source: "https://zhuanlan.zhihu.com/p/2027033308584756118"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "之前讲了证书的验证： Secure boot入门-4镜像验签代码分析，那么这些证书是怎么产生，又是怎么都打包到fip.bin里面的？直接上干货分析：编译certificates相关工具cert_create，生成证书。注意证书对应未加密的镜像…"
tags:
  - "clippings"
---
[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181)

3 人赞同了该文章

![](https://pic2.zhimg.com/v2-ab2f8b95f97bfce4fe73dfa70774690f_1440w.jpg)

之前讲了证书的验证： [Secure boot入门-4镜像验签代码分析](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485784%26idx%3D1%26sn%3Da95d9d7b37fa257012cc088fb484f674%26chksm%3Dfa528f7ccd25066a583c9ef44006545a62b3b109d1f40c8498380563e2846765ade21a0926e4%26scene%3D21%23wechat_redirect) ，那么这些 **证书是怎么产生** ，又是 **怎么都打包** 到 **fip.bin** 里面的？直接上干货分析：

- 编译certificates相关工具 **[cert\_create](https://zhida.zhihu.com/search?content_id=273004680&content_type=Article&match_order=1&q=cert_create&zhida_source=entity)** ，生成 **证书** 。注意证书对应未加密的镜像。
- 如果需要加密，需要编译enctool工具 **encrypt\_fw** ，用于对镜像文件进行 **加密** ，并加上加密头struct fw\_enc\_hdr。
- **[fiptool](https://zhida.zhihu.com/search?content_id=273004680&content_type=Article&match_order=1&q=fiptool&zhida_source=entity)** 工具 **打包** 生成fip.bin，使用cert\_create生成的证书，如加密使用encrypt\_fw加密后的镜像，否则使用原始镜像，加上FIP的TOC和Entry等信息。

然后再看上面 **外卖打包图** ，这个 **菜单就是签名** ，根据签名 **核对** 下外卖是否有缺少，种类是否对。本篇文章从代码角度进行解析，那么各位铁子，没搭建 **qemu运行ATF+Linux** 运行环境的，赶紧搞起来， **零成本** 学习ARM高深技术： [ATF入门-1qmeu搭建ARM全套源码学习环境](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485508%26idx%3D1%26sn%3D99c019e8d4efddef614115d61bdfbffb%26chksm%3Dfa528e60cd2507766d08588aaed93f67c51fe6c77d502bebf8f6b429b2236c24d42d947e0108%26scene%3D21%23wechat_redirect)

## 1\. 编译

## 1.1 Secure Boot编译选项

docs/plat/qemu.rst中说明如果使 **能安全启动** 则使用如下 **编译选项** ：

```
Or, alternatively, to build with TBBR enabled, as well as, BL31 and BL32 encrypted with
test key:

.. code:: shell

    make CROSS_COMPILE=aarch64-linux-gnu- PLAT=qemu BL32=bl32.bin \
        BL32_EXTRA1=bl32_extra1.bin BL32_EXTRA2=bl32_extra2.bin \
        BL33=bl33.bin BL32_RAM_LOCATION=tdram SPD=opteed all fip \
        MBEDTLS_DIR=<path-to-mbedtls-repo> TRUSTED_BOARD_BOOT=1 \
        GENERATE_COT=1 DECRYPTION_SUPPORT=aes_gcm FW_ENC_STATUS=0 \
        ENCRYPT_BL31=1 ENCRYPT_BL32=1
```

关于编译选项可以参考 **官网文档** ： [trustedfirmware-a.readthedocs.io](https://link.zhihu.com/?target=https%3A//trustedfirmware-a.readthedocs.io/en/v2.4/design/trusted-board-boot-build.html)

![](https://pic1.zhimg.com/v2-52611b0f04a28360c027e006f13b9340_1440w.jpg)

我们在optee代码： [ATF入门-1qmeu搭建ARM全套源码学习环境](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485508%26idx%3D1%26sn%3D99c019e8d4efddef614115d61bdfbffb%26chksm%3Dfa528e60cd2507766d08588aaed93f67c51fe6c77d502bebf8f6b429b2236c24d42d947e0108%26scene%3D21%23wechat_redirect) 中打开安全启动的方法是修改 **optee/build/qemu\_v8.mk** 中：

```
11 ################################################################################  
12 # If you change this, you MUST run \`make arm-tf-clean\` first before rebuilding  
13 ################################################################################  
14 TF_A_TRUSTED_BOARD_BOOT ?= n
```

**TF\_A\_TRUSTED\_BOARD\_BOOT** 设置为 **y** 即可，作用如下：

```
204 ifeq ($(TF_A_TRUSTED_BOARD_BOOT),y)
205 TF_A_FLAGS += \
206     MBEDTLS_DIR=$(ROOT)/mbedtls \ 
207     TRUSTED_BOARD_BOOT=1 \
208     GENERATE_COT=1
209 endif

224 ifeq ($(TF_A_TRUSTED_BOARD_BOOT),y)
225     ln -sf $(TF_A_OUT)/trusted_key.crt $(BINARIES_PATH)
226     ln -sf $(TF_A_OUT)/tos_fw_key.crt $(BINARIES_PATH)
227     ln -sf $(TF_A_OUT)/tos_fw_content.crt $(BINARIES_PATH)
228     ln -sf $(TF_A_OUT)/tb_fw.crt $(BINARIES_PATH)
229     ln -sf $(TF_A_OUT)/soc_fw_key.crt $(BINARIES_PATH)
230     ln -sf $(TF_A_OUT)/soc_fw_content.crt $(BINARIES_PATH)
231     ln -sf $(TF_A_OUT)/nt_fw_key.crt $(BINARIES_PATH)
232     ln -sf $(TF_A_OUT)/nt_fw_content.crt $(BINARIES_PATH)
233 endif
```
1. MBEDTLS\_DIR=../mbedtls表示指定 **[mbedTLS](https://zhida.zhihu.com/search?content_id=273004680&content_type=Article&match_order=1&q=mbedTLS&zhida_source=entity) 库** 的源码路径。
2. TRUSTED\_BOARD\_BOOT=1表示 **使能Secure Boot** （即使能Trusted Board Boot feature），打开此选项后在BL1和BL2阶段即支持从FIP中加载镜像并对镜像进行认证。
3. GENERATE\_COT=1表示 **构建和执行 cert\_create 工具** ，按照 trusted-board-boot.md中描述的信任链生成所有证书，然后构建系统调用 fip\_create 工具以将证书打包在 FIP镜像中。通常我们会同时打开TRUSTED\_BOARD\_BOOT和GENERATE\_COT选项。

mbedTLS是一个提供加 **解密算法的开源库** ，作为OpenSSL的替代品，在移动端、嵌入式领域应用广泛。

## 2\. 证书介绍

- nt\_fw\_content.crt： **BL33** 内容证书
- nt\_fw\_key.crt： **BL33** 密钥证书
- soc\_fw\_content.crt： **BL31** 内容证书
- soc\_fw\_key.crt： **BL31** 密钥证书
- tb\_fw.crt： **BL2** 内容证书
- trusted\_key.crt： **Trusted** 密钥证书
- rot\_key.pem： **Root of Trust Key**
- rotpk\_sha256.bin： **ROTPK的sha256值**
- 其他：nt\_fw\_key.crt tos\_fw\_content.crt tos\_fw\_key.crt

证书工具首先生成所有 **tbb\_keys\[\]** 中的 **秘钥** ，然后生成tbb\_certs\[\]中的 **证书** ，并保存为命令行中指定的文件名。

| FIP中内容ID | struct auth\_img\_desc\_s | 说明 | 文件名 | cert\_create选项 | tbb\_certs | tbb\_keys |
| --- | --- | --- | --- | --- | --- | --- |
| TRUSTED\_BOOT\_FW\_CERT\_ID | trusted\_boot\_fw\_cert | Trusted Boot Firmware BL2 certificate | tb\_fw.crt | \--tb-fw-cert | TRUSTED\_BOOT\_FW\_CERT | ROT\_KEY |
| TRUSTED\_KEY\_CERT\_ID | trusted\_key\_cert | Trusted key certificate | trusted\_key.crt | \--trusted-key-cert | TRUSTED\_KEY\_CERT | ROT\_KEY |
| SOC\_FW\_KEY\_CERT\_ID | soc\_fw\_key\_cert | SoC Firmware key certificate | soc\_fw\_key.crt | \--soc-fw-key-cert | SOC\_FW\_KEY\_CERT | TRUSTED\_WORLD\_KEY |
| SOC\_FW\_CONTENT\_CERT\_ID | soc\_fw\_content\_cert | SoC Firmware content certificate | soc\_fw\_content.crt | \--soc-fw-cert | SOC\_FW\_CONTENT\_CERT | SOC\_FW\_CONTENT\_CERT\_KEY |
| TRUSTED\_OS\_FW\_KEY\_CERT\_ID | trusted\_os\_fw\_key\_cert | Trusted OS Firmware key certificate | tos\_fw\_key.crt | \--tos-fw-key-cert | TRUSTED\_OS\_FW\_KEY\_CERT | TRUSTED\_WORLD\_KEY |
| TRUSTED\_OS\_FW\_CONTENT\_CERT\_ID | trusted\_os\_fw\_content\_cert | Trusted OS Firmware content certificate | tos\_fw\_content.crt | \--tos-fw-cert | TRUSTED\_OS\_FW\_CONTENT\_CERT | TRUSTED\_OS\_FW\_CONTENT\_CERT\_KEY |
| NON\_TRUSTED\_FW\_KEY\_CERT\_ID | non\_trusted\_fw\_key\_cert | Non-Trusted Firmware key certificate | nt\_fw\_key.crt | \--nt-fw-key-cert | NON\_TRUSTED\_FW\_KEY\_CERT | NON\_TRUSTED\_WORLD\_KEY |
| NON\_TRUSTED\_FW\_CONTENT\_CERT\_ID | non\_trusted\_fw\_content\_cert | Non-Trusted Firmware content certificate | nt\_fw\_content.crt | \--nt-fw-cert | NON\_TRUSTED\_FW\_CONTENT\_CERT | NON\_TRUSTED\_FW\_CONTENT\_CERT\_KEY |

上述所有的证书都是为了 **认证镜像** 的，他们组合形成了 **认证链** ：

![](https://pica.zhimg.com/v2-d7fcef3521b38288dd2ffbdb8fcd10e6_1440w.jpg)

## 根证书tb\_fw.crt

```
static const auth_img_desc_t * const cot_desc[] = {
    [TRUSTED_BOOT_FW_CERT_ID]        =    &trusted_boot_fw_cert,
```

就是这个需要信任 **根公钥ROTPK** 去认证，里面的内容就是根证书 **tb\_fw.crt** ，这个是打包进入了 **fip.bin且id是6** ，我们load\_image的时候： **load\_image--》plat\_get\_image\_source--》get\_io\_policy--》policies\[\]** 定义如下：

```
/* By default, ARM platforms load images from the FIP */
static const struct plat_io_policy policies[] = {
    [TRUSTED_BOOT_FW_CERT_ID] = {
        &fip_dev_handle,
        (uintptr_t)&tb_fw_cert_uuid_spec,
        open_fip
    },

#define TRUSTED_BOOT_FW_CERT_ID        U(6)

static const io_uuid_spec_t tb_fw_cert_uuid_spec = {
    .uuid = UUID_TRUSTED_BOOT_FW_CERT,
};

#define UUID_TRUSTED_BOOT_FW_CERT \
    {{0xd6,  0xe2, 0x69, 0xea}, {0x5d, 0x63}, {0xe4, 0x11}, 0x8d, 0x8c, {0x9f, 0xba, 0xbe, 0x99, 0x56, 0xa5} }
```

## 3\. 镜像加密

镜像加密一般使用 **对称加密技术** ，因为镜像比较大，不像hash值可以进行非对称加密。加密工具为 **encrypt\_fw**,一般使用 **AES** 加密技术。

## 3.1 编译相关

![](https://pic4.zhimg.com/v2-13a05f5208bd367cd7e4f1ca50d1e861_1440w.jpg)

> 代码默认没打开这个镜像加密，自己调试打开下在qemu\_v8.mk里面，DECRYPTION\_SUPPORT=aes\_gcm FW\_ENC\_STATUS=0 ENCRYPT\_BL31=1 ENCRYPT\_BL32=1。这里没有对BL2加密，估计是一些考虑。

```
ifneq (${DECRYPTION_SUPPORT},none)
$(if ${BL31}, $(eval $(call TOOL_ADD_IMG,bl31,--soc-fw,,$(ENCRYPT_BL31))),\
    $(eval $(call MAKE_BL,bl31,soc-fw,,$(ENCRYPT_BL31))))
else
$(if ${BL31}, $(eval $(call TOOL_ADD_IMG,bl31,--soc-fw)),\
    $(eval $(call MAKE_BL,bl31,soc-fw)))
endif #(DECRYPTION_SUPPORT)
endif #(NEED_BL31)

-  \`\`ENCRYPT_BL31\`\`: Binary flag to enable encryption of BL31 firmware. This
   flag depends on \`\`DECRYPTION_SUPPORT\`\` build flag.

# By default BL31 encryption disabled
ENCRYPT_BL31            := 0
```

代码中的处理也有改变，在验证过程中，需要 **先解密提取数据，然后才能算hash，进行验签** ：

```
#if ENCRYPT_BL31 && !defined(DECRYPTION_SUPPORT_none)
    [BL31_IMAGE_ID] = {
        &enc_dev_handle,
        (uintptr_t)&bl31_uuid_spec,
        open_enc_fip
    },
#else
    [BL31_IMAGE_ID] = {
        &fip_dev_handle,
        (uintptr_t)&bl31_uuid_spec,
        open_fip
    },
#endif
```

**encrypt\_fw的使用** 介绍如下：

```
The firmware encryption tool loads the binary image and
outputs encrypted binary image using an encryption key
provided as an input hex string.

Usage:
    ./arm-trusted-firmware/tools/encrypt_fw/encrypt_fw [OPTIONS]

Available options:
    -h,--help                        Print this message and exit
    -f,--fw-enc-status <arg>         Firmware encryption status flag (with SSK=0 or BSSK=1).
    -a,--key-alg <arg>               Encryption key algorithm: 'gcm' (default)
    -k,--key <arg>                   Encryption key (for supported algorithm).
    -n,--nonce <arg>                 Nonce or Initialization Vector (for supported algorithm).
    -i,--in <arg>                    Input filename to be encrypted.
    -o,--out <arg>                   Encrypted output filename.
```

ATF在生成加密镜像的 **执行命令** 如下：

```
tools/encrypt_fw/encrypt_fw 
-f 0
-k 1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef--加密所使用的秘钥。
-n 1234567890abcdef12345678------------------------------------------加密所使用的Initialization Vector参数。
-i /home/al/edge10/tos/qemuv8/build/../optee_os/out/arm/core/tee-pager_v2.bin 
-o /home/al/edge10/tos/qemuv8/arm-trusted-firmware/build/qemu/release/bl32_extra1_enc.bin
```

## 3.2 encrypt\_fw代码介绍

代码在tools/encrypt\_fw下面

### 3.2.1 数据结构

struct fw\_enc\_hdr是 **加密文件头** ，共44字节。魔数为 **0xAA640001** 。

```
#define ENC_HEADER_MAGIC        0xAA640001U

#define FW_ENC_STATUS_FLAG_MASK        0x1

enum fw_enc_status_t {
    FW_ENC_WITH_SSK = 0,
    FW_ENC_WITH_BSSK = 1,
};

#define ENC_MAX_IV_SIZE            16U
#define ENC_MAX_TAG_SIZE        16U
#define ENC_MAX_KEY_SIZE        32U

struct fw_enc_hdr {
    uint32_t magic;------------------------加密文件魔数。
    uint16_t dec_algo;---------------------解密算法。
    uint16_t flags;
    uint16_t iv_len;-----------------------iv大小。
    uint16_t tag_len;----------------------tag大小。
    uint8_t iv[ENC_MAX_IV_SIZE];
    uint8_t tag[ENC_MAX_TAG_SIZE];
};
```

### 3.2.2 文件加密流程

encrypt\_fw工具目前仅支持 **AES GCM** 加密算法，通过调用 **libopenssl** 库文件实现对文件的加密，并附上文件头struct **fw\_enc\_hdr** 。

![](https://pic3.zhimg.com/v2-240e74575a316a5c831e0bbe880c7028_1440w.jpg)

```
int main(int argc, char *argv[])
{
    int i, key_alg, ret;
    int c, opt_idx = 0;
    const struct option *cmd_opt;
    char *key = NULL;
    char *nonce = NULL;
    char *in_fn = NULL;
    char *out_fn = NULL;
    unsigned short fw_enc_status = 0;

    NOTICE("Firmware Encryption Tool: %s\n", build_msg);

    /* Set default options */
    key_alg = KEY_ALG_GCM;

    /* Add common command line options */
    for (i = 0; i < NUM_ELEM(common_cmd_opt); i++) {
        cmd_opt_add(&common_cmd_opt[i]);
    }

    /* Get the command line options populated during the initialization */
    cmd_opt = cmd_opt_get_array();

    while (1) {
        /* getopt_long stores the option index here. */
        c = getopt_long(argc, argv, "a:f:hi:k:n:o:", cmd_opt, &opt_idx);

        /* Detect the end of the options. */
        if (c == -1) {
            break;
        }

        switch (c) {
        case 'a':
            key_alg = get_key_alg(optarg);--------------------------------------------目前仅支持gcm模式加密。
            if (key_alg < 0) {
                ERROR("Invalid key algorithm '%s'\n", optarg);
                exit(1);
            }
            break;
        case 'f':
            parse_fw_enc_status_flag(optarg, &fw_enc_status);
            break;
        case 'k':
            key = optarg;
            break;
        case 'i':
            in_fn = optarg;
            break;
        case 'o':
            out_fn = optarg;
            break;
        case 'n':
            nonce = optarg;
            break;
        case 'h':
            print_help(argv[0], cmd_opt);
            exit(0);
        case '?':
        default:
            print_help(argv[0], cmd_opt);
            exit(1);
        }
    }
...
    ret = encrypt_file(fw_enc_status, key_alg, key, nonce, in_fn, out_fn);-------------文件加密入口，参数包括加密算法、密钥、Initialization Vector等。。

    CRYPTO_cleanup_all_ex_data();

    return ret;
}

static int get_key_alg(const char *key_alg_str)
{
    int i;

    for (i = 0 ; i < NUM_ELEM(key_algs_str) ; i++) {
        if (strcmp(key_alg_str, key_algs_str[i]) == 0) {
            return i;
        }
    }

    return -1;
}

int encrypt_file(unsigned short fw_enc_status, int enc_alg, char *key_string,
         char *nonce_string, const char *ip_name, const char *op_name)
{
    switch (enc_alg) {
    case KEY_ALG_GCM:-------------------------------------------------------------------使用GCM模式加密文件。
        return gcm_encrypt(fw_enc_status, key_string, nonce_string,
                   ip_name, op_name);
    default:
        return -1;
    }
}

static int gcm_encrypt(unsigned short fw_enc_status, char *key_string,
               char *nonce_string, const char *ip_name,
               const char *op_name)
{
    FILE *ip_file;
    FILE *op_file;
    EVP_CIPHER_CTX *ctx;
    unsigned char data[BUFFER_SIZE], enc_data[BUFFER_SIZE];
    unsigned char key[KEY_SIZE], iv[IV_SIZE], tag[TAG_SIZE];
    int bytes, enc_len = 0, i, j, ret = 0;
    struct fw_enc_hdr header;

    memset(&header, 0, sizeof(struct fw_enc_hdr));

    if (strlen(key_string) != KEY_STRING_SIZE) {
        ERROR("Unsupported key size: %lu\n", strlen(key_string));
        return -1;
    }

    for (i = 0, j = 0; i < KEY_SIZE; i++, j += 2) {-----------------------------KEY_SIZE为32字节。
        if (sscanf(&key_string[j], "%02hhx", &key[i]) != 1) {
            ERROR("Incorrect key format\n");
            return -1;
        }
    }

    if (strlen(nonce_string) != IV_STRING_SIZE) {
        ERROR("Unsupported IV size: %lu\n", strlen(nonce_string));
        return -1;
    }

    for (i = 0, j = 0; i < IV_SIZE; i++, j += 2) {------------------------------IV_SIZE为12字节。
        if (sscanf(&nonce_string[j], "%02hhx", &iv[i]) != 1) {
            ERROR("Incorrect IV format\n");
            return -1;
        }
    }

    ip_file = fopen(ip_name, "rb");---------------------------------------------以二进制读打开原始文件。
    if (ip_file == NULL) {
        ERROR("Cannot read %s\n", ip_name);
        return -1;
    }

    op_file = fopen(op_name, "wb");---------------------------------------------以二进制读写打开输出文件。
    if (op_file == NULL) {
        ERROR("Cannot write %s\n", op_name);
        fclose(ip_file);
        return -1;
    }

    ret = fseek(op_file, sizeof(struct fw_enc_hdr), SEEK_SET);-------------------跳过输出文件头。
    if (ret) {
        ERROR("fseek failed\n");
        goto out_file;
    }

    ctx = EVP_CIPHER_CTX_new();
    if (ctx == NULL) {
        ERROR("EVP_CIPHER_CTX_new failed\n");
        ret = -1;
        goto out_file;
    }

    ret = EVP_EncryptInit_ex(ctx, EVP_aes_256_gcm(), NULL, NULL, NULL);
    if (ret != 1) {
        ERROR("EVP_EncryptInit_ex failed\n");
        ret = -1;
        goto out;
    }

    ret = EVP_EncryptInit_ex(ctx, NULL, NULL, key, iv);
    if (ret != 1) {
        ERROR("EVP_EncryptInit_ex failed\n");
        goto out;
    }

    while ((bytes = fread(data, 1, BUFFER_SIZE, ip_file)) != 0) {-----------------以256字节为单位对输入文件进行加密。
        ret = EVP_EncryptUpdate(ctx, enc_data, &enc_len, data, bytes);
        if (ret != 1) {
            ERROR("EVP_EncryptUpdate failed\n");
            ret = -1;
            goto out;
        }

        fwrite(enc_data, 1, enc_len, op_file);
    }

    ret = EVP_EncryptFinal_ex(ctx, enc_data, &enc_len);
    if (ret != 1) {
        ERROR("EVP_EncryptFinal_ex failed\n");
        ret = -1;
        goto out;
    }

    ret = EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_GET_TAG, TAG_SIZE, tag);-----------获取GCM Tag，大小为16字节。
    if (ret != 1) {
        ERROR("EVP_CIPHER_CTX_ctrl failed\n");
        ret = -1;
        goto out;
    }

    header.magic = ENC_HEADER_MAGIC;-----------------------------------------------加密文件魔数0xaa6401。
    header.flags |= fw_enc_status & FW_ENC_STATUS_FLAG_MASK;-----------------------加密文件flags，一般为0。
    header.dec_algo = KEY_ALG_GCM;-------------------------------------------------加密算法类型。
    header.iv_len = IV_SIZE;-------------------------------------------------------IV大小，0x0c字节。
    header.tag_len = TAG_SIZE;-----------------------------------------------------Tag大小，0x10字节。
    memcpy(header.iv, iv, IV_SIZE);
    memcpy(header.tag, tag, TAG_SIZE);

    ret = fseek(op_file, 0, SEEK_SET);
    if (ret) {
        ERROR("fseek failed\n");
        goto out;
    }

    fwrite(&header, 1, sizeof(struct fw_enc_hdr), op_file);

out:
    EVP_CIPHER_CTX_free(ctx);

out_file:
    fclose(ip_file);
    fclose(op_file);

    /*
     * EVP_* APIs returns 1 as success but enctool considers
     * 0 as success.
     */
    if (ret == 1)
        ret = 0;

    return ret;
}
```

## 4\. 镜像签名

## 4.1 key和证书的关系

![](https://picx.zhimg.com/v2-d55f1ae48bdb219474047073d84eeead_1440w.jpg)

**加密工具为cert\_create**,对应代码在tools/cert\_create下面。

- 编译的时候会产生密钥对，即公钥和私钥
- 打包镜像前会对镜像的hash值和公钥进行签名
- 运行时加载完镜像后会对镜像进行验签
![](https://picx.zhimg.com/v2-d328e10440dc696abf4c39d06ce54fd1_1440w.jpg)

每个key都包含私钥和公钥， **私钥进行签名，用公钥进行验签**

1. 'Trusted World key'--私钥对两个4和5两个key的公钥进行签名
2. 'Non Trusted World key'--私钥对6的公钥进行签名
3. 'SCP Firmware Content Certificate key'
4. 'SoC Firmware Content Certificate key'--私钥对BL2、BL31的hash值进行签名
5. 'Trusted OS Firmware Content Certificate key'--私钥对BL32的hash签名，使用公钥验签。
6. 'Non Trusted Firmware Content Certificate key'

证书跟key之间的关系：

1. key私钥签名+某物--》证书（里面没有私钥，只有公钥和算法以及值）
2. 证书里面有值和算法和公钥，某物需要证明自己的可信的时候就拿出来自己的证书的公钥和算法对自己一顿计算，计算出值，跟证书里面的值对比，就可以证明自己是可信的。

生成key和证书是通过cert\_create工具， **cert\_create工具指定生成密钥的算法、长度、哈希，镜像文件，证书文件，RootKey等** ， **输出一系列证书文件** 。

## 4.2 编译分析

```
${CRTTOOL}: FORCE
    ${Q}${MAKE} PLAT=${PLAT} USE_TBBR_DEFS=${USE_TBBR_DEFS} COT=${COT} OPENSSL_DIR=${OPENSSL_DIR} CRTTOOL=${CRTTOOL} DEBUG=${DEBUG} V=${V} --no-print-directory -C ${CRTTOOLPATH} all
    @${ECHO_BLANK_LINE}
    @echo "Built $@ successfully"
    @${ECHO_BLANK_LINE}

ifneq (${GENERATE_COT},0)
certificates: ${CRT_DEPS} ${CRTTOOL}
    ${Q}${CRTTOOL} ${CRT_ARGS}
    @${ECHO_BLANK_LINE}
    @echo "Built $@ successfully"
    @echo "Certificates can be found in ${BUILD_PLAT}"
    @${ECHO_BLANK_LINE}
endif #(GENERATE_COT)
```

签名的参数${ **CRT\_ARGS** }打印出来如下：

```
--tos-fw-extra1 /home/XXX/arm/optee/build/../optee_os/out/arm/core/tee-pager_v2.bin --tos-fw-extra2 /home/XXX/arm/optee/build/../optee_os/out/arm/core/tee-pageable_v2.bin -n --tfw-nvctr 0 --ntfw-nvctr 0 --trusted-key-cert /home/XXX/arm/optee/trusted-firmware-a/build/qemu/debug/trusted_key.crt --key-alg rsa --key-size 2048 --hash-alg sha256 --rot-key /home/XXX/arm/optee/trusted-firmware-a/build/qemu/debug/rot_key.pem --tb-fw-cert /home/XXX/arm/optee/trusted-firmware-a/build/qemu/debug/tb_fw.crt --soc-fw-cert /home/XXX/arm/optee/trusted-firmware-a/build/qemu/debug/soc_fw_content.crt --soc-fw-key-cert /home/XXX/arm/optee/trusted-firmware-a/build/qemu/debug/soc_fw_key.crt --tos-fw-cert /home/XXX/arm/optee/trusted-firmware-a/build/qemu/debug/tos_fw_content.crt --tos-fw-key-cert /home/XXX/arm/optee/trusted-firmware-a/build/qemu/debug/tos_fw_key.crt --nt-fw-cert /home/XXX/arm/optee/trusted-firmware-a/build/qemu/debug/nt_fw_content.crt --nt-fw-key-cert /home/XXX/arm/optee/trusted-firmware-a/build/qemu/debug/nt_fw_key.crt --tb-fw /home/XXX/arm/optee/trusted-firmware-a/build/qemu/debug/bl2.bin --soc-fw /home/XXX/arm/optee/trusted-firmware-a/build/qemu/debug/bl31.bin --tos-fw /home/XXX/arm/optee/build/../optee_os/out/arm/core/tee-header_v2.bin --nt-fw /home/XXX/arm/optee/build/../u-boot/u-boot.bin
```

**bin和crt是成对出现的** ，例如bl2.bin中：

```
--tb-fw-cert /home/XXX/arm/optee/trusted-firmware-a/build/qemu/debug/tb_fw.crt
--tb-fw /home/XXX/arm/optee/trusted-firmware-a/build/qemu/debug/bl2.bin
```

Trusted Firmware/Non-Trusted Firmware的 **NV Counter都默认为0**.

```
--tfw-nvctr 0 --ntfw-nvctr 0
```

**签名算法使用rsa 2048，哈希算法使用sha256** 如下：

```
--key-alg rsa --key-size 2048 --hash-alg sha256 --rot-key /home/XXX/arm/optee/trusted-firmware-a/build/qemu/debug/rot_key.pem
```

cert\_create工具的 **option参数** ：

```
Usage:
    ./cert_create [OPTIONS]

Available options:
    -h,--help                        Print this message and exit
    -a,--key-alg <arg>               Key algorithm: 'rsa' (default)- RSAPSS scheme as per PKCS#1 v2.1, 'ecdsa'
    -b,--key-size <arg>              Key size (for supported algorithms).
    -s,--hash-alg <arg>              Hash algorithm : 'sha256' (default), 'sha384', 'sha512'
    -k,--save-keys                   Save key pairs into files. Filenames must be provided
    -n,--new-keys                    Generate new key pairs if no key files are provided
    -p,--print-cert                  Print the certificates in the standard output
    --tb-fw-cert <arg>               Trusted Boot FW Certificate (output file)
    --trusted-key-cert <arg>         Trusted Key Certificate (output file)
    --scp-fw-key-cert <arg>          SCP Firmware Key Certificate (output file)
    --scp-fw-cert <arg>              SCP Firmware Content Certificate (output file)
    --soc-fw-key-cert <arg>          SoC Firmware Key Certificate (output file)
    --soc-fw-cert <arg>              SoC Firmware Content Certificate (output file)
    --tos-fw-key-cert <arg>          Trusted OS Firmware Key Certificate (output file)
    --tos-fw-cert <arg>              Trusted OS Firmware Content Certificate (output file)
    --nt-fw-key-cert <arg>           Non-Trusted Firmware Key Certificate (output file)
    --nt-fw-cert <arg>               Non-Trusted Firmware Content Certificate (output file)
    --sip-sp-cert <arg>              SiP owned Secure Partition Content Certificate (output file)
    --fwu-cert <arg>                 Firmware Update Certificate (output file)
    --rot-key <arg>                  Root Of Trust key (input/output file)
    --trusted-world-key <arg>        Trusted World key (input/output file)
    --non-trusted-world-key <arg>    Non Trusted World key (input/output file)
    --scp-fw-key <arg>               SCP Firmware Content Certificate key (input/output file)
    --soc-fw-key <arg>               SoC Firmware Content Certificate key (input/output file)
    --tos-fw-key <arg>               Trusted OS Firmware Content Certificate key (input/output file)
    --nt-fw-key <arg>                Non Trusted Firmware Content Certificate key (input/output file)
    --tfw-nvctr <arg>                Trusted Firmware Non-Volatile counter value
    --ntfw-nvctr <arg>               Non-Trusted Firmware Non-Volatile counter value
    --tb-fw <arg>                    Trusted Boot Firmware image file
    --tb-fw-config <arg>             Trusted Boot Firmware Config file
    --hw-config <arg>                HW Config file
    --fw-config <arg>                Firmware Config file
    --scp-fw <arg>                   SCP Firmware image file
    --soc-fw <arg>                   SoC AP Firmware image file
    --soc-fw-config <arg>            SoC Firmware Config file
    --tos-fw <arg>                   Trusted OS image file
    --tos-fw-extra1 <arg>            Trusted OS Extra1 image file
    --tos-fw-extra2 <arg>            Trusted OS Extra2 image file
    --tos-fw-config <arg>            Trusted OS Firmware Config file
    --nt-fw <arg>                    Non-Trusted World Bootloader image file
    --nt-fw-config <arg>             Non Trusted OS Firmware Config file
...
    --scp-fwu-cfg <arg>              SCP Firmware Update Config image file
    --ap-fwu-cfg <arg>               AP Firmware Update Config image file
    --fwu <arg>                      Firmware Updater image file
```

## 4.3 cert\_create工具代码分析

**证书相关数据tbb\_certs通过key和tbb\_keys关联，通过ext和tbb\_ext关联。**

### 4.3.1 秘钥数据结构

struct key\_s定义了 **cert\_create秘钥数据结构** ，id区别不同秘钥，秘钥存放于EVP\_PKEY数据结构中。

```
typedef struct key_s {
    int id;            /* Key id */
    const char *opt;    /* Command line option to specify a key */------------秘钥对应的命令行选项，决定下面的fn。
    const char *help_msg;    /* Help message */
    const char *desc;    /* Key description (debug purposes) */
    char *fn;        /* Filename to load/store the key */
    EVP_PKEY *key;        /* Key container */----------------------------------存放EVP_KEY秘钥。
} key_t;
```

通过REGISTER\_KEYS()向系统 **注册了建立TBB所需要的秘钥** ，由tbb\_keys\[\]指定，里面任何一个成员都对应一组 **RSA 2048秘钥** 。

```
/* Macro to register the keys used in the CoT */
#define REGISTER_KEYS(_keys) \
    key_t *keys = &_keys[0]; \
    const unsigned int num_keys = sizeof(_keys)/sizeof(_keys[0])

REGISTER_KEYS(tbb_keys);

static key_t tbb_keys[] = {
    [ROT_KEY] = {
        .id = ROT_KEY,
        .opt = "rot-key",
        .help_msg = "Root Of Trust key (input/output file)",
        .desc = "Root Of Trust key"
    },
...
};
```

### 4.3.2 证书数据结构

**struct cert\_s** 是cert\_create所使用的 **证书数据结构** ，包括 **id、x用于存放X509.v3格式证书** 等。

```
struct cert_s {
    int id;            /* Unique identifier */

    const char *opt;    /* Command line option to pass filename */
    const char *fn;        /* Filename to save the certificate */
    const char *cn;        /* Subject CN (Company Name) */
    const char *help_msg;    /* Help message */

    /* These fields must be defined statically */
    int key;        /* Key to be signed */----------------------------------和tbb_keys关联。
    int issuer;        /* Issuer certificate */
    int ext[CERT_MAX_EXT];    /* Certificate extensions */
    int num_ext;        /* Number of extensions in the certificate */

    X509 *x;        /* X509 certificate container */
};
```

通过 **REGISTER\_COT** 向系统注册了建立TBB所需要的证书。

```
/* Macro to register the certificates used in the CoT */
#define REGISTER_COT(_certs) \
    cert_t *certs = &_certs[0]; \
    const unsigned int num_certs = sizeof(_certs)/sizeof(_certs[0])

REGISTER_COT(tbb_certs);

/*
 * Certificates used in the chain of trust
 *
 * The order of the certificates must follow the enumeration specified in
 * tbb_cert.h. All certificates are self-signed, so the issuer certificate
 * field points to itself.
 */
static cert_t tbb_certs[] = {
    [TRUSTED_BOOT_FW_CERT] = {
        .id = TRUSTED_BOOT_FW_CERT,
        .opt = "tb-fw-cert",
        .help_msg = "Trusted Boot FW Certificate (output file)",
        .fn = NULL,
        .cn = "Trusted Boot FW Certificate",
        .key = ROT_KEY,
        .issuer = TRUSTED_BOOT_FW_CERT,
        .ext = {
            TRUSTED_FW_NVCOUNTER_EXT,
            TRUSTED_BOOT_FW_HASH_EXT,
            TRUSTED_BOOT_FW_CONFIG_HASH_EXT,
            HW_CONFIG_HASH_EXT,
            FW_CONFIG_HASH_EXT
        },
        .num_ext = 5
    },
...
};
```

### 4.3.3 证书扩展数据结构

struct ext\_s定义了 **帧数扩展数据结构** ，REGISTER\_EXTENSIONS(tbb\_ext)将支持的扩展注册到系统。

```
/*
 * This structure contains the relevant information to create the extensions
 * to be included in the certificates. This extensions will be used to
 * establish the chain of trust.
 */
typedef struct ext_s {
    const char *oid;    /* OID of the extension */
    const char *sn;        /* Short name */
    const char *ln;        /* Long description */
    const char *opt;    /* Command line option to specify data */
    const char *help_msg;    /* Help message */
    const char *arg;    /* Argument passed from command line */
    int asn1_type;        /* OpenSSL ASN1 type of the extension data.
                 * Supported types are:
                 *   - V_ASN1_INTEGER
                 *   - V_ASN1_OCTET_STRING
                 */
    int type;        /* See ext_type_e */

    /* Extension attributes (depends on extension type) */
    union {
        int nvctr_type;    /* See nvctr_type_e */
        int key;    /* Index into array of registered public keys */
    } attr;

    int alias;        /* In case OpenSSL provides an standard
                 * extension of the same type, add the new
                 * extension as an alias of this one
                 */

    X509V3_EXT_METHOD method; /* This field may be used to define a custom
                   * function to print the contents of the
                   * extension */

    int optional;    /* This field may be used optionally to exclude an image */
} ext_t;

REGISTER_EXTENSIONS(tbb_ext);

/* Macro to register the extensions used in the CoT */
#define REGISTER_EXTENSIONS(_ext) \
  ext_t *extensions = &_ext[0]; \
  const unsigned int num_extensions = sizeof(_ext)/sizeof(_ext[0])
static ext_t tbb_ext[] = {
    [TRUSTED_FW_NVCOUNTER_EXT] = {
        .oid = TRUSTED_FW_NVCOUNTER_OID,
        .opt = "tfw-nvctr",
        .help_msg = "Trusted Firmware Non-Volatile counter value",
        .sn = "TrustedWorldNVCounter",
        .ln = "Trusted World Non-Volatile counter",
        .asn1_type = V_ASN1_INTEGER,
        .type = EXT_TYPE_NVCOUNTER,
        .attr.nvctr_type = NVCTR_TYPE_TFW
    },
...
    [TRUSTED_WORLD_PK_EXT] = {
        .oid = TRUSTED_WORLD_PK_OID,
        .sn = "TrustedWorldPublicKey",
        .ln = "Trusted World Public Key",
        .asn1_type = V_ASN1_OCTET_STRING,
        .type = EXT_TYPE_PKEY,
        .attr.key = TRUSTED_WORLD_KEY
    },
...
    [TRUSTED_OS_FW_CONTENT_CERT_PK_EXT] = {
        .oid = TRUSTED_OS_FW_CONTENT_CERT_PK_OID,
        .sn = "TrustedOSFirmwareContentCertPK",
        .ln = "Trusted OS Firmware content certificate public key",
        .asn1_type = V_ASN1_OCTET_STRING,
        .type = EXT_TYPE_PKEY,
        .attr.key = TRUSTED_OS_FW_CONTENT_CERT_KEY
    },
    [TRUSTED_OS_FW_HASH_EXT] = {
        .oid = TRUSTED_OS_FW_HASH_OID,
        .opt = "tos-fw",
        .help_msg = "Trusted OS image file",
        .sn = "TrustedOSHash",
        .ln = "Trusted OS hash (SHA256)",
        .asn1_type = V_ASN1_OCTET_STRING,
        .type = EXT_TYPE_HASH
    },
    [TRUSTED_OS_FW_EXTRA1_HASH_EXT] = {
        .oid = TRUSTED_OS_FW_EXTRA1_HASH_OID,
        .opt = "tos-fw-extra1",
        .help_msg = "Trusted OS Extra1 image file",
        .sn = "TrustedOSExtra1Hash",
        .ln = "Trusted OS Extra1 hash (SHA256)",
        .asn1_type = V_ASN1_OCTET_STRING,
        .type = EXT_TYPE_HASH,
        .optional = 1
    },
    [TRUSTED_OS_FW_EXTRA2_HASH_EXT] = {
        .oid = TRUSTED_OS_FW_EXTRA2_HASH_OID,
        .opt = "tos-fw-extra2",
        .help_msg = "Trusted OS Extra2 image file",
        .sn = "TrustedOSExtra2Hash",
        .ln = "Trusted OS Extra2 hash (SHA256)",
        .asn1_type = V_ASN1_OCTET_STRING,
        .type = EXT_TYPE_HASH,
        .optional = 1
    },
...
};
```

### 4.3.4 秘钥和证书生成

首先 **解析命令行参数** ， 逐个 **生成秘钥、证书及其扩展部分** ，并将证书保存成文件。

```
int main(int argc, char *argv[])
{
    STACK_OF(X509_EXTENSION) * sk;
    X509_EXTENSION *cert_ext = NULL;
    ext_t *ext;
    key_t *key;
    cert_t *cert;
    FILE *file;
    int i, j, ext_nid, nvctr;
    int c, opt_idx = 0;
    const struct option *cmd_opt;
    const char *cur_opt;
    unsigned int err_code;
    unsigned char md[SHA512_DIGEST_LENGTH];
    unsigned int  md_len;
    const EVP_MD *md_info;

    NOTICE("CoT Generation Tool: %s\n", build_msg);
    NOTICE("Target platform: %s\n", platform_msg);

    /* Set default options */
    key_alg = KEY_ALG_RSA;
    hash_alg = HASH_ALG_SHA256;
    key_size = -1;

    /* Add common command line options */
    for (i = 0; i < NUM_ELEM(common_cmd_opt); i++) {
        cmd_opt_add(&common_cmd_opt[i]);
    }

    /* Initialize the certificates */
    if (cert_init() != 0) {
        ERROR("Cannot initialize certificates\n");
        exit(1);
    }

    /* Initialize the keys */
    if (key_init() != 0) {
        ERROR("Cannot initialize keys\n");
        exit(1);
    }

    /* Initialize the new types and register OIDs for the extensions */
    if (ext_init() != 0) {
        ERROR("Cannot initialize extensions\n");
        exit(1);
    }

    /* Get the command line options populated during the initialization */
    cmd_opt = cmd_opt_get_array();

    while (1) {
        /* getopt_long stores the option index here. */
        c = getopt_long(argc, argv, "a:b:hknps:", cmd_opt, &opt_idx);

        /* Detect the end of the options. */
        if (c == -1) {
            break;
        }

        switch (c) {
        case 'a':
            key_alg = get_key_alg(optarg);
            if (key_alg < 0) {
                ERROR("Invalid key algorithm '%s'\n", optarg);
                exit(1);
            }
            break;
        case 'b':
            key_size = get_key_size(optarg);
            if (key_size <= 0) {
                ERROR("Invalid key size '%s'\n", optarg);
                exit(1);
            }
            break;
        case 'h':
            print_help(argv[0], cmd_opt);
            exit(0);
        case 'k':
            save_keys = 1;
            break;
        case 'n':
            new_keys = 1;
            break;
        case 'p':
            print_cert = 1;
            break;
        case 's':
            hash_alg = get_hash_alg(optarg);
            if (hash_alg < 0) {
                ERROR("Invalid hash algorithm '%s'\n", optarg);
                exit(1);
            }
            break;
        case CMD_OPT_EXT:
            cur_opt = cmd_opt_get_name(opt_idx);
            ext = ext_get_by_opt(cur_opt);
            ext->arg = strdup(optarg);
            break;
        case CMD_OPT_KEY:
            cur_opt = cmd_opt_get_name(opt_idx);
            key = key_get_by_opt(cur_opt);
            key->fn = strdup(optarg);---------------------从命令行中获取相关key的文件名。
            break;
        case CMD_OPT_CERT:
            cur_opt = cmd_opt_get_name(opt_idx);
            cert = cert_get_by_opt(cur_opt);
            cert->fn = strdup(optarg);--------------------从命令行中获取相关证书的文件名。
            break;
        case '?':
        default:
            print_help(argv[0], cmd_opt);
            exit(1);
        }
    }

    /* Select a reasonable default key-size */
    if (key_size == -1) {
        key_size = KEY_SIZES[key_alg][0];
    }

    /* Check command line arguments */
    check_cmd_params();
...
    /* Load private keys from files (or generate new ones) */
    for (i = 0 ; i < num_keys ; i++) {---------------------------遍历通过REGISTER_KEYS()注册的秘钥数组,这里是tbb_keys[]。首先尝试从文件中获取，如果没有则创建新的秘钥。
    if (!key_new(&keys[i])) {------------------------------------EVP_PKEY_new()分配秘钥空间。
            ERROR("Failed to allocate key container\n");
            exit(1);
        }

        /* First try to load the key from disk */
        if (key_load(&keys[i], &err_code)) {---------------------尝试从文件系统中加载秘钥。
            /* Key loaded successfully */
            continue;
        }
...
        /* File does not exist, could not be opened or no filename was
         * given */
        if (new_keys) {
            /* Try to create a new key */
            NOTICE("Creating new key for '%s'\n", keys[i].desc);
            if (!key_create(&keys[i], key_alg, key_size)) {-------创建新的秘钥，key_alg指定算法，key_size指定长度。比如使用RSA 2048。
                ERROR("Error creating key '%s'\n", keys[i].desc);
                exit(1);
            }
        } else {
...
        }
    }

    /* Create the certificates */
    for (i = 0 ; i < num_certs ; i++) {---------------------------遍历通过REGISTER_COT()创建的证书数组，这里是tbb_certs[]。

        cert = &certs[i];

        /* Create a new stack of extensions. This stack will be used
         * to create the certificate */
        CHECK_NULL(sk, sk_X509_EXTENSION_new_null());

        for (j = 0 ; j < cert->num_ext ; j++) {------------------遍历当前证书中ext[]，

            ext = &extensions[cert->ext[j]];

            /* Get OpenSSL internal ID for this extension */
            CHECK_OID(ext_nid, ext->oid);

            /*
             * Three types of extensions are currently supported:
             *     - EXT_TYPE_NVCOUNTER
             *     - EXT_TYPE_HASH
             *     - EXT_TYPE_PKEY
             */
            switch (ext->type) {
            case EXT_TYPE_NVCOUNTER:
                if (ext->arg) {
                    nvctr = atoi(ext->arg);
                    CHECK_NULL(cert_ext, ext_new_nvcounter(ext_nid,
                        EXT_CRIT, nvctr));
                }
                break;
            case EXT_TYPE_HASH:
                if (ext->arg == NULL) {
                    if (ext->optional) {
                        /* Include a hash filled with zeros */
                        memset(md, 0x0, SHA512_DIGEST_LENGTH);
                    } else {
                        /* Do not include this hash in the certificate */
                        break;
                    }
                } else {
                    /* Calculate the hash of the file */
                    if (!sha_file(hash_alg, ext->arg, md)) {
                        ERROR("Cannot calculate hash of %s\n",
                            ext->arg);
                        exit(1);
                    }
                }
                CHECK_NULL(cert_ext, ext_new_hash(ext_nid,
                        EXT_CRIT, md_info, md,
                        md_len));
                break;
            case EXT_TYPE_PKEY:
                CHECK_NULL(cert_ext, ext_new_key(ext_nid,
                    EXT_CRIT, keys[ext->attr.key].key));
                break;
            default:
                ERROR("Unknown extension type '%d' in %s\n",
                        ext->type, cert->cn);
                exit(1);
            }

            /* Push the extension into the stack */
            sk_X509_EXTENSION_push(sk, cert_ext);
        }

        /* Create certificate. Signed with corresponding key */
        if (cert->fn && !cert_new(hash_alg, cert, VAL_DAYS, 0, sk)) {
            ERROR("Cannot create %s\n", cert->cn);
            exit(1);
        }

        sk_X509_EXTENSION_free(sk);
    }

    /* Print the certificates */
    if (print_cert) {
        for (i = 0 ; i < num_certs ; i++) {
            if (!certs[i].x) {
                continue;
            }
            printf("\n\n=====================================\n\n");
            X509_print_fp(stdout, certs[i].x);
        }
    }

    /* Save created certificates to files */
    for (i = 0 ; i < num_certs ; i++) {
        if (certs[i].x && certs[i].fn) {----------------------------如果指定证书名称，保存。
            file = fopen(certs[i].fn, "w");
            printf("Arnoldlu %s write cert to %s\n", __func__, certs[i].fn);
            if (file != NULL) {
                i2d_X509_fp(file, certs[i].x);----------------------将certs[i].x保存到文件中，为X509.v3格式文件。
                fclose(file);
            } else {
                ERROR("Cannot create file %s\n", certs[i].fn);
            }
        }
    }

    /* Save keys */
    if (save_keys) {
        for (i = 0 ; i < num_keys ; i++) {
            if (!key_store(&keys[i])) {-----------------------------如果自定秘钥名称，保存。
                ERROR("Cannot save %s\n", keys[i].desc);
            }
        }
    }

#ifndef OPENSSL_NO_ENGINE
    ENGINE_cleanup();
#endif
    CRYPTO_cleanup_all_ex_data();

    return 0;
}
```

key\_load()从文件中 **加载秘钥** ，key\_store将秘钥 **保存到文件中** ，key\_create() **创建秘钥** 。

```
int key_init(void)
{
    cmd_opt_t cmd_opt;
    key_t *key;
    unsigned int i;

    for (i = 0; i < num_keys; i++) {
        key = &keys[i];
        if (key->opt != NULL) {
            cmd_opt.long_opt.name = key->opt;
            cmd_opt.long_opt.has_arg = required_argument;
            cmd_opt.long_opt.flag = NULL;
            cmd_opt.long_opt.val = CMD_OPT_KEY;
            cmd_opt.help_msg = key->help_msg;
            cmd_opt_add(&cmd_opt);
        }
    }

    return 0;
}

int key_load(key_t *key, unsigned int *err_code)
{
    FILE *fp;
    EVP_PKEY *k;

    if (key->fn) {
        /* Load key from file */
        fp = fopen(key->fn, "r");
if (fp) {
            k = PEM_read_PrivateKey(fp, &key->key, NULL, NULL);----------读取PEM格式的秘钥到key->key中。
            fclose(fp);
...
        } else {
...
        }
    } else {
...
    }

    return 0;
}

int key_store(key_t *key)
{
    FILE *fp;

    if (key->fn) {
        fp = fopen(key->fn, "w");
if (fp) {
            PEM_write_PrivateKey(fp, key->key,
                    NULL, NULL, 0, NULL, NULL);--------------------------将PEM格式的key->key保存到文件中。
            fclose(fp);
            return 1;
        } else {
            ERROR("Cannot create file %s\n", key->fn);
        }
    } else {
        ERROR("Key filename not specified\n");
    }

    return 0;
}

int key_create(key_t *key, int type, int key_bits)
{
    if (type >= KEY_ALG_MAX_NUM) {
        printf("Invalid key type\n");
        return 0;
    }

    if (key_create_fn[type]) {
        return key_create_fn[type](key, key_bits);
    }

    return 0;
}

static const key_create_fn_t key_create_fn[KEY_ALG_MAX_NUM] = {
    key_create_rsa,     /* KEY_ALG_RSA */
#ifndef OPENSSL_NO_EC
    key_create_ecdsa,     /* KEY_ALG_ECDSA */
#endif /* OPENSSL_NO_EC */
};

static int key_create_rsa(key_t *key, int key_bits)
{
    BIGNUM *e;
    RSA *rsa = NULL;

    e = BN_new();------------------------------------------生成大数。
    if (e == NULL) {
        printf("Cannot create RSA exponent\n");
        goto err;
    }

    if (!BN_set_word(e, RSA_F4)) {
        printf("Cannot assign RSA exponent\n");
        goto err;
    }

    rsa = RSA_new();----------------------------------------初始化一个RSA结构体。
    if (rsa == NULL) {
        printf("Cannot create RSA key\n");
        goto err;
    }

    if (!RSA_generate_key_ex(rsa, key_bits, e, NULL)) {-----生成一对RSA秘钥，保存在rsa中。key_bits指定RSA秘钥宽度，指数由e指定。
        printf("Cannot generate RSA key\n");
        goto err;
    }

    if (!EVP_PKEY_assign_RSA(key->key, rsa)) {---------------从rsa中提取EVP_PKEY。
        printf("Cannot assign RSA key\n");
        goto err;
    }

    BN_free(e);----------------------------------------------释放大数。
    return 1;
err:
    RSA_free(rsa);
    BN_free(e);
    return 0;
}
```

**cert\_new()创建证书** ， **cert\_add\_ext()添加证书扩展** 。

```
int cert_init(void)
{
    cmd_opt_t cmd_opt;
    cert_t *cert;
    unsigned int i;
for (i = 0; i < num_certs; i++) {
        cert = &certs[i];
        cmd_opt.long_opt.name = cert->opt;
        cmd_opt.long_opt.has_arg = required_argument;
        cmd_opt.long_opt.flag = NULL;
        cmd_opt.long_opt.val = CMD_OPT_CERT;
        cmd_opt.help_msg = cert->help_msg;
        cmd_opt_add(&cmd_opt);
    }

    return 0;
}

int cert_new(
    int md_alg,
    cert_t *cert,
    int days,
    int ca,
    STACK_OF(X509_EXTENSION) * sk)
{
    EVP_PKEY *pkey = keys[cert->key].key;
    cert_t *issuer_cert = &certs[cert->issuer];
    EVP_PKEY *ikey = keys[issuer_cert->key].key;
    X509 *issuer = issuer_cert->x;
    X509 *x;
    X509_EXTENSION *ex;
    X509_NAME *name;
    ASN1_INTEGER *sno;
    int i, num, rc = 0;
    EVP_MD_CTX *mdCtx;
    EVP_PKEY_CTX *pKeyCtx = NULL;
/* Create the certificate structure */
    x = X509_new();
    if (!x) {
        return 0;
    }

    /* If we do not have a key, use the issuer key (the certificate will
     * become self signed). This happens in content certificates. */
    if (!pkey) {
        pkey = ikey;
    }

    /* If we do not have an issuer certificate, use our own (the certificate
     * will become self signed) */
    if (!issuer) {
        issuer = x;
    }

    mdCtx = EVP_MD_CTX_create();
    if (mdCtx == NULL) {
        ERR_print_errors_fp(stdout);
        goto END;
    }

    /* Sign the certificate with the issuer key */
    if (!EVP_DigestSignInit(mdCtx, &pKeyCtx, get_digest(md_alg), NULL, ikey)) {
        ERR_print_errors_fp(stdout);
        goto END;
    }

    /*
     * Set additional parameters if issuing public key algorithm is RSA.
     * This is not required for ECDSA.
     */
    if (EVP_PKEY_base_id(ikey) == EVP_PKEY_RSA) {
        if (!EVP_PKEY_CTX_set_rsa_padding(pKeyCtx, RSA_PKCS1_PSS_PADDING)) {
            ERR_print_errors_fp(stdout);
            goto END;
        }

        if (!EVP_PKEY_CTX_set_rsa_pss_saltlen(pKeyCtx, RSA_SALT_LEN)) {
            ERR_print_errors_fp(stdout);
            goto END;
        }

        if (!EVP_PKEY_CTX_set_rsa_mgf1_md(pKeyCtx, get_digest(md_alg))) {
            ERR_print_errors_fp(stdout);
            goto END;
        }
    }

    /* x509.v3 */
    X509_set_version(x, 2);

    /* Random serial number */
    sno = ASN1_INTEGER_new();
    rand_serial(NULL, sno);
    X509_set_serialNumber(x, sno);
    ASN1_INTEGER_free(sno);

    X509_gmtime_adj(X509_get_notBefore(x), 0);
    X509_gmtime_adj(X509_get_notAfter(x), (long)60*60*24*days);
    X509_set_pubkey(x, pkey);

    /* Subject name */
    name = X509_get_subject_name(x);
    X509_NAME_add_entry_by_txt(name, "CN", MBSTRING_ASC,
            (const unsigned char *)cert->cn, -1, -1, 0);
    X509_set_subject_name(x, name);

    /* Issuer name */
    name = X509_get_issuer_name(x);
    X509_NAME_add_entry_by_txt(name, "CN", MBSTRING_ASC,
            (const unsigned char *)issuer_cert->cn, -1, -1, 0);
    X509_set_issuer_name(x, name);

    /* Add various extensions: standard extensions */
    cert_add_ext(issuer, x, NID_subject_key_identifier, "hash");
    cert_add_ext(issuer, x, NID_authority_key_identifier, "keyid:always");
    if (ca) {
        cert_add_ext(issuer, x, NID_basic_constraints, "CA:TRUE");
        cert_add_ext(issuer, x, NID_key_usage, "keyCertSign");
    } else {
        cert_add_ext(issuer, x, NID_basic_constraints, "CA:FALSE");
    }

    /* Add custom extensions */
    if (sk != NULL) {
        num = sk_X509_EXTENSION_num(sk);
        for (i = 0; i < num; i++) {
            ex = sk_X509_EXTENSION_value(sk, i);
            X509_add_ext(x, ex, -1);
        }
    }

    if (!X509_sign_ctx(x, mdCtx)) {
        ERR_print_errors_fp(stdout);
        goto END;
    }

    /* X509 certificate signed successfully */
    rc = 1;
    cert->x = x;

END:
    EVP_MD_CTX_destroy(mdCtx);
    return rc;
}

int cert_add_ext(X509 *issuer, X509 *subject, int nid, char *value)
{
    X509_EXTENSION *ex;
    X509V3_CTX ctx;
/* No configuration database */
    X509V3_set_ctx_nodb(&ctx);

    /* Set issuer and subject certificates in the context */
    X509V3_set_ctx(&ctx, issuer, subject, NULL, NULL, 0);
    ex = X509V3_EXT_conf_nid(NULL, &ctx, nid, value);
    if (!ex) {
        ERR_print_errors_fp(stdout);
        return 0;
    }

    X509_add_ext(subject, ex, -1);
    X509_EXTENSION_free(ex);

    return 1;
}
const EVP_MD *get_digest(int alg)
{
    switch (alg) {
    case HASH_ALG_SHA256:
        return EVP_sha256();
    case HASH_ALG_SHA384:
        return EVP_sha384();
    case HASH_ALG_SHA512:
        return EVP_sha512();
    default:
        return NULL;
    }
}
```

## 5\. fiptool打包

## 5.1 fiptool编译过程

![](https://pic2.zhimg.com/v2-79ef701926c8315f83c38d5d0be0244f_1440w.jpg)

编译的log如上图，代码在 **Makefile** 中：

```
${BUILD_PLAT}/${FIP_NAME}: ${FIP_DEPS} ${FIPTOOL}
    $(eval ${CHECK_FIP_CMD})
    ${Q}${FIPTOOL} create ${FIP_ARGS} $@
    ${Q}${FIPTOOL} info $@
    @${ECHO_BLANK_LINE}
    @echo "Built $@ successfully"
    @echo "${FIPTOOL} FIP_ARGS:${FIP_ARGS}"
    @${ECHO_BLANK_LINE}
```

这里的参数${ **FIP\_ARGS** }打印出来，也是成对出现的，不过这里是打包用的：

```
--tos-fw-extra1 /home/XXX/arm/optee/build/../optee_os/out/arm/core/tee-pager_v2.bin --tos-fw-extra2 /home/XXX/arm/optee/build/../optee_os/out/arm/core/tee-pageable_v2.bin --trusted-key-cert /home/XXX/arm/optee/trusted-firmware-a/build/qemu/debug/trusted_key.crt --tb-fw-cert /home/XXX/arm/optee/trusted-firmware-a/build/qemu/debug/tb_fw.crt --soc-fw-cert /home/XXX/arm/optee/trusted-firmware-a/build/qemu/debug/soc_fw_content.crt --soc-fw-key-cert /home/XXX/arm/optee/trusted-firmware-a/build/qemu/debug/soc_fw_key.crt --tos-fw-cert /home/XXX/arm/optee/trusted-firmware-a/build/qemu/debug/tos_fw_content.crt --tos-fw-key-cert /home/XXX/arm/optee/trusted-firmware-a/build/qemu/debug/tos_fw_key.crt --nt-fw-cert /home/XXX/arm/optee/trusted-firmware-a/build/qemu/debug/nt_fw_content.crt --nt-fw-key-cert /home/XXX/arm/optee/trusted-firmware-a/build/qemu/debug/nt_fw_key.crt --tb-fw /home/XXX/arm/optee/trusted-firmware-a/build/qemu/debug/bl2.bin --soc-fw /home/XXX/arm/optee/trusted-firmware-a/build/qemu/debug/bl31.bin --tos-fw /home/XXX/arm/optee/build/../optee_os/out/arm/core/tee-header_v2.bin --nt-fw /home/XXX/arm/optee/build/../u-boot/u-boot.bin
```

fip包是 **fiptool工具** 对镜像打包，并存放在系统的 **非易失性存储器上** 。docs/design/firmware-design.rst中有fip包格式定义：

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

## 5.2 fiptool代码分析

tools/fiptool/fiptool.c中有fiptool支持的 **子命令** ：

```
/* Available subcommands. */
static cmd_t cmds[] = {
    { .name = "info",    .handler = info_cmd,    .usage = info_usage    },
    { .name = "create",  .handler = create_cmd,  .usage = create_usage  },
    { .name = "update",  .handler = update_cmd,  .usage = update_usage  },
    { .name = "unpack",  .handler = unpack_cmd,  .usage = unpack_usage  },
    { .name = "remove",  .handler = remove_cmd,  .usage = remove_usage  },
    { .name = "version", .handler = version_cmd, .usage = version_usage },
    { .name = "help",    .handler = help_cmd,    .usage = NULL          },
};
```

fiptool工具支持查询 **镜像内容、生成/更新/移除镜像内容、解压镜像等** 功能。

### 5.2.1 数据结构

toc\_entries定义了系统支持的所有 **内容入口，包括镜像和证书，使用uuid和cmdline\_name进行关联** 。

```
/* The images used depends on the platform. */
toc_entry_t toc_entries[] = {
    {
        .name = "SCP Firmware Updater Configuration FWU SCP_BL2U",
        .uuid = UUID_TRUSTED_UPDATE_FIRMWARE_SCP_BL2U,
        .cmdline_name = "scp-fwu-cfg"
    },
...
    {
        .name = NULL,
        .uuid = { {0} },
        .cmdline_name = NULL,
    }
};
```

struct fip\_toc\_header定义了 **FIP文件的头** ，struct fip\_toc\_entry定义了FIP文件中包含的每个 **内容的入口** ，通过fip\_toc\_entry可以解析出FIP中每个内容。

```
typedef struct fip_toc_header {
    uint32_t    name;
    uint32_t    serial_number;
    uint64_t    flags;
} fip_toc_header_t;

typedef struct fip_toc_entry {
    uuid_t        uuid;
    uint64_t    offset_address;
    uint64_t    size;
    uint64_t    flags;
} fip_toc_entry_t;
```

### 5.2.2 镜像生成create功能

create命令的handler是 **create\_cmd()** 。

```
static int create_cmd(int argc, char *argv[])
{
    struct option *opts = NULL;
    size_t nr_opts = 0;
    unsigned long long toc_flags = 0;
    unsigned long align = 1;

    if (argc < 2)
        create_usage(EXIT_FAILURE);

    opts = fill_common_opts(opts, &nr_opts, required_argument);
    opts = add_opt(opts, &nr_opts, "plat-toc-flags", required_argument,
        OPT_PLAT_TOC_FLAGS);
    opts = add_opt(opts, &nr_opts, "align", required_argument, OPT_ALIGN);
    opts = add_opt(opts, &nr_opts, "blob", required_argument, 'b');
    opts = add_opt(opts, &nr_opts, NULL, 0, 0);

    while (1) {
        int c, opt_index = 0;

        c = getopt_long(argc, argv, "b:", opts, &opt_index);
        if (c == -1)
            break;

        switch (c) {
        case OPT_TOC_ENTRY: {
            image_desc_t *desc;

            desc = lookup_image_desc_from_opt(opts[opt_index].name);
            set_image_desc_action(desc, DO_PACK, optarg);
            break;
        }
        case OPT_PLAT_TOC_FLAGS:
            parse_plat_toc_flags(optarg, &toc_flags);
            break;
        case OPT_ALIGN:
            align = get_image_align(optarg);
            break;
        case 'b': {
            char name[_UUID_STR_LEN + 1];
            char filename[PATH_MAX] = { 0 };
            uuid_t uuid = uuid_null;
            image_desc_t *desc;

            parse_blob_opt(optarg, &uuid,
                filename, sizeof(filename));

            if (memcmp(&uuid, &uuid_null, sizeof(uuid_t)) == 0 ||
                filename[0] == '\0')
                create_usage(EXIT_FAILURE);

            desc = lookup_image_desc_from_uuid(&uuid);
            if (desc == NULL) {
                uuid_to_str(name, sizeof(name), &uuid);
                desc = new_image_desc(&uuid, name, "blob");
                add_image_desc(desc);
            }
            set_image_desc_action(desc, DO_PACK, filename);
            break;
        }
        default:
            create_usage(EXIT_FAILURE);
        }
    }
    argc -= optind;
    argv += optind;
    free(opts);

    if (argc == 0)
        create_usage(EXIT_SUCCESS);

    update_fip();

    pack_images(argv[0], toc_flags, align);
    return 0;
}
```

fiptool **将所有的证书和镜像文件打包** ，首先生成fip的TOC头，然后是每个文件的TOC，最后是每个文件的二进制内容。

![](https://pic4.zhimg.com/v2-0f71694579bb044c3b9f0df576aabc93_1440w.jpg)

```
static int pack_images(const char *filename, uint64_t toc_flags, unsigned long align)
{
    FILE *fp;
    image_desc_t *desc;
    fip_toc_header_t *toc_header;
    fip_toc_entry_t *toc_entry;
    char *buf;
    uint64_t entry_offset, buf_size, payload_size = 0, pad_size;
    size_t nr_images = 0;

    for (desc = image_desc_head; desc != NULL; desc = desc->next)
        if (desc->image != NULL)
            nr_images++;

    buf_size = sizeof(fip_toc_header_t) +
        sizeof(fip_toc_entry_t) * (nr_images + 1);----------FIP文件头大小，包括一个struct fip_toc_header，N+1个struct fip_toc_entry。
    buf = calloc(1, buf_size);
    if (buf == NULL)
        log_err("calloc");

    /* Build up header and ToC entries from the image table. */
    toc_header = (fip_toc_header_t *)buf;-------------------配置fip_toc_header。
    toc_header->name = TOC_HEADER_NAME;
    toc_header->serial_number = TOC_HEADER_SERIAL_NUMBER;
    toc_header->flags = toc_flags;

    toc_entry = (fip_toc_entry_t *)(toc_header + 1);--------第一个struct fip_toc_entry。

    entry_offset = buf_size;
    for (desc = image_desc_head; desc != NULL; desc = desc->next) {
        image_t *image = desc->image;

        if (image == NULL)
            continue;
        payload_size += image->toc_e.size;
        entry_offset = (entry_offset + align - 1) & ~(align - 1);
        image->toc_e.offset_address = entry_offset;
        *toc_entry++ = image->toc_e;-----------------------遍历所有image_desc_head数据到toc_entry中，并更新offset_address和payload_size。
        entry_offset += image->toc_e.size;
    }

    /*
     * Append a null uuid entry to mark the end of ToC entries.
     * NOTE the offset address for the last toc_entry must match the fip
     * size.
     */
    memset(toc_entry, 0, sizeof(*toc_entry));--------------最后附加一个NULL toc_entry表示结束。
    toc_entry->offset_address = (entry_offset + align - 1) & ~(align - 1);

    /* Generate the FIP file. */
    fp = fopen(filename, "wb");
    if (fp == NULL)
        log_err("fopen %s", filename);

    if (verbose)
        log_dbgx("Metadata size: %zu bytes", buf_size);

    xfwrite(buf, buf_size, fp, filename);

    if (verbose)
        log_dbgx("Payload size: %zu bytes", payload_size);

    for (desc = image_desc_head; desc != NULL; desc = desc->next) {
        image_t *image = desc->image;

        if (image == NULL)
            continue;
if (fseek(fp, image->toc_e.offset_address, SEEK_SET))
            log_errx("Failed to set file position");

        xfwrite(image->buffer, image->toc_e.size, fp, filename);
    }

    if (fseek(fp, entry_offset, SEEK_SET))
        log_errx("Failed to set file position");

    pad_size = toc_entry->offset_address - entry_offset;
    while (pad_size--)
        fputc(0x0, fp);

    free(buf);
    fclose(fp);
    return 0;
}
```

## 6\. 启动流程中镜像解析、验签、解密

这个之前的文章已经分析过了： [Secure boot入门-4镜像验签代码分析](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485784%26idx%3D1%26sn%3Da95d9d7b37fa257012cc088fb484f674%26chksm%3Dfa528f7ccd25066a583c9ef44006545a62b3b109d1f40c8498380563e2846765ade21a0926e4%26scene%3D21%23wechat_redirect) ，这里放一个图：

![](https://pic2.zhimg.com/v2-fe4f08fba3fcb67ec34054f93543dc7b_1440w.jpg)

参考：

1. [cnblogs.com/arnoldlu/p/](https://link.zhihu.com/?target=https%3A//www.cnblogs.com/arnoldlu/p/14332530.html)

> 后记：  
> secureboot的核心代码固件ATF部分基本分析完了，感觉东西很多。  
> secureboot的内容还有很多，后续分析下avb和硬件设计上的考虑，再延伸到OPTEE里面。 **学不完，根本学不完** 。

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位有自己公众号的留言： **申请转载** ！

纯干货持续更新，欢迎 **分享给朋友** 、点赞、收藏、在看、划线和评论交流！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

发布于 2026-04-13 15:04・上海[数字IC后端，如何快速入门？](https://zhuanlan.zhihu.com/p/699135665)

[

有一段时间没聊后端了，前两年提到后端，大多数朋友的印象里都带着“薪资低、技术含量低”这类刻板标签。 两年后的现在，无论是入行门槛和薪资，还是技术含量，相信大家也该对后端有所...

](https://zhuanlan.zhihu.com/p/699135665)