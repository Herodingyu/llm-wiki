---
title: "secureboot入门-7安卓AVB校验代码分析"
source: "https://zhuanlan.zhihu.com/p/2027040100836550418"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "AVB相关代码跟安卓有点结合了，安卓的代码浩如烟海，这里我们只从uboot的角度来分析下，linux和安卓里面就不展开了，这位可以自己探究下。安全启动的流程，就是揪出来那些不该启动的程序（卧底），进行阻止。首先…"
tags:
  - "clippings"
---
[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181)

4 人赞同了该文章

![](https://pic1.zhimg.com/v2-014ab654d106d72dadd03b8c985371b2_1440w.jpg)

**AVB相关代码** 跟安卓有点结合了，安卓的代码浩如烟海，这里我们只从 **[uboot](https://zhida.zhihu.com/search?content_id=273007204&content_type=Article&match_order=1&q=uboot&zhida_source=entity) 的角度** 来分析下，linux和安卓里面就不展开了，这位可以自己探究下。安全启动的流程，就是揪出来那些不该启动的程序（ **卧底** ），进行阻止。

首先推荐一个资料《 **android AVB2.0学习总结** 》：

[blog.csdn.net/jackone12](https://link.zhihu.com/?target=https%3A//blog.csdn.net/jackone12347/article/details/116241676) ，如下：

![](https://pic2.zhimg.com/v2-dca24b74b032fe243bcc6a79f7197459_1440w.jpg)

## 1\. 启动流程基础

## 1.1 uboot启动状态机

![](https://pica.zhimg.com/v2-44c1fef1b1c17f4d284c64b080740d20_1440w.jpg)

- 设备应搜索所有 **A/B插槽** ，直到找到有效的操作系统进行引导。在 `LOCKED` 状态下被拒绝的插槽可能 `在UNLOCKED` 状态下不被拒绝（例如，当 `UNLOCKED` 可以使用任何密钥并且允许回滚索引失败时），因此用于选择插槽的算法会根据设备处于何种状态而变化。
- 如果找不到有效的操作系统(即没有可引导的A/B插槽)，设备无法引导，必须进入 **修复模式** 。这取决于设备。如果设备有一个屏幕，它必须将这个状态传递给用户。
- 如果设备被锁定，则只接受由已经固化的验证密钥签名的操作系统(见上一节)。此外，存储在已验证的映像中的 `rollback_index[n]` 必须大于或等于设备上的 `stored_rollback_index[n]` 中的值(对于所有的n)，并且 `stored_rollback_index[n]` 数组应该按照上一节中指定的方式进行更新。
- 如果用于验证的密钥是由最终用户设置的，并且设备有一个屏幕，那么它必须显示一个带有密钥指纹的警告，以表明设备正在启动一个定制操作系统。在引导过程继续之前，警告必须显示至少10秒。如果设备没有屏幕，则必须使用其他方式来传递设备正在引导自定义操作系统(灯条、LED等)。
- 如果设备是 `UNLOCKED` ，则不需要检查用于对OS进行签名的密钥，也不需要在设备上检查或更新回滚 `stored_rollback_index[n]` 。因此，必须始终向用户显示关于未发生验证的警告。
- 它取决于设备的外形和预期用途，取决于设备是如何实现的。如果设备具有屏幕和按钮（例如手机），则警告将在引导过程继续之前显示至少10秒。如果设备没有屏幕，则必须使用其他方式来传达设备已解锁（灯条，LED等）。

镜像加载流程大致如下图：

![](https://pic4.zhimg.com/v2-a7b4d1389ead3f1e15ce545bbaa5ce17_1440w.jpg)

经过上图的流程过后，DRAM中的的 **layout** 大致如下图：

![](https://pica.zhimg.com/v2-e6a595ca1f777a9068494243c8bbacb8_1440w.jpg)

## 1.2 avbtool和libavb

`avbtool` 主要用来生成 `vbmeta.img` ，它是验证启动的顶级对象。这个映像将被烧录到 `vbmeta` 分区（如果使用A/B分区，则为 `vbmeta_a` 或 `vbmeta_b` ）而且被设计的尽可能的小（用于带外更新 *out-of-band update* ）。 `vbmeta` 映像使用密钥签名，映像中包含用于验证 `boot.img` ， `system.img` 和其他分区映像的验证数据（例如加密摘要）。

`vbmeta` 映像还可以包含对存储验证数据的其他分区的引用，以及指定验证数据使用的公钥。这种间接方式可以将验证权进行委托，它允许第三方通过在 `vbmeta.img` 中包含它们的公钥来控制给定分区上的内容。这样只需通过更新vbmeta.img中的分区描述符，就可以轻松改变或撤销验证权限而不用修改其它分区。

将签名的验证数据存储在其他映像上(例如 `boot.img` 和 `system.img`)也是使用 `avbtool` 完成的。

除了 `avbtoo` l之外，还提供了一个库—— `libavb` 。该库在设备端执行所有验证，例如它首先加载 `vbmeta` 分区，检查签名，然后继续加载启动分区以进行验证。此库旨在用于引导加载程序和Android内部。它有一个简单的系统依赖抽象（参见 `avb_sysdeps.h` ）以及引导加载程序或操作系统应该实现的操作（参见 `avb_ops.h` ）。验证的主要入口点是 `avb_slot_verify()` 。

Adroid Things（译者注：一套谷歌推出的面向物联网平台的操作系统）对 `vbmeta` 公钥有特定的要求和验证逻辑。 `libavb_atx` 中提供了一个扩展，该扩展是 `libavb` 公钥验证操作的实现。（请参阅 `avb_ops.h` 中的 `avb_validate_vbmeta_public_key()` ）。

**文件和目录：**

`libavb/`: 映像验证的实现。这段代码可移植行强，它可以在尽可能多的上下文中使用，但编译器需要支持C99标准。库中的部分代码是算法的内部实现，应避免在外部使用。例如 `avb_rsa.[ch]` 和 `avb_sha.[ch]` 文件。平台预期提供的系统依赖关系在 `avb_sysdeps.h` 中定义。如果平台提供标准C运行环境，则可以使用 `avb_sysdeps_posix.c` 。

`libavb_atx/`: 用于验证公钥元数据的 [Android Things](https://zhida.zhihu.com/search?content_id=273007204&content_type=Article&match_order=1&q=Android+Things&zhida_source=entity) 扩展。

`libavb_user/`: 包含适用于Android用户空间的 `AvbOps` 实现。用于 `boot_control.avb` 和 `avbctl` 。

`libavb_ab/`: 用于引导加载程序和AVB示例的实验性A/B实现。注意：此代码是 *DEPRECATED* ，您必须定义 `AVB_AB_I_UNDERSTAND_LIBAVB_AB_IS_DEPRECATED` 才能使用它。该代码已经在2018年6月1日删除。

`boot_control/`: Android `boot_control` HAL的一个实现，用于使用实验性 `libavb_ab` A/B堆栈的引导加载程序。注意：此代码已弃用，已经在2018年6月1日删除。

`contrib/`: 包含其他项目中与AVB交互的补丁。例如， `contrib/linux/4.4` 有Linux内核4.4的补丁，它们是由 `git format-patch` 生成的。

`Android.bp`: 构建 `libavb` (用于设备上的静态库)、宿主端库(用于单元测试)和单元测试的构建说明。

`avbtool`: 用Python编写的工具，用于处理与验证启动相关的映像。

`test/`: `abvtool`, `libavb`, `libavb_ab`, 和 `libavb_atx` 的测试单元。

`tools/avbctl/`: 包含可用于在Android中运行时控制AVB的工具的源代码。

`examples/uefi/`: 包含使用 `libavb/` 和 `libavb_ab/` 的基于UEFI引导加载程序的源代码。

`examples/things/`: 包含适用于Android Things的插槽验证的源代码。

`docs/`: 说明文档。

**可移植性(Portability)：**

`libavb` 代码在加载Android或其他操作系统的设备引导加载程序中使用。建议的方法是将上一节中提到的相应头文件和C文件复制到引导加载程序中，并根据需要进行集成。

`libavb/` 代码库会随着时间的推移不断更新优化，集成应尽可能无创。目的是保持库的API稳定，但必要时也会进行修改。至于可移植性，该库在设计时就以高度可移植为目标，适用于小端和大端架构以及32位和64位。它还可以在没有标准C库和运行环境的非标准环境中工作。

如果设置了 `AVB_ENABLE_DEBUG` 预处理器符号，则代码将包含有用的调试信息和运行检查。生产构建中不应该使用该符号。只应在编译库时设置预处理程序符号 `AVB_COMPILATION` 。代码必须编译成一个单独的库。

使用已编译的 `libavb` 库的应用程序只能包含 `libavb/libavb.h` 文件(将包括所有公共接口)，并且必须没有 `avb_compile` 预处理器符号集。这是为了确保将来可能更改的内部代码(例如 `avb_sha.[ch]` 和 `avb_rsa.[ch]`)对应用程序代码不可见。

## 2\. uboot中avb代码分析

## 2.1 uboot中AVB开关

首先AVB的起点是 **在uboot** 里面，直接看代码里面的帮助文件：doc/android/avb2.rst

```
The following options must be enabled::

   CONFIG_LIBAVB=y
   CONFIG_AVB_VERIFY=y
   CONFIG_CMD_AVB=y
```

在uboot使用avb就需要用到 **avb命令** ，解释如下：

```
AVB 2.0 U-Boot shell commands
-----------------------------

Provides CLI interface to invoke AVB 2.0 verification + misc. commands for
different testing purposes::

    avb init <dev> - initialize avb 2.0 for <dev>
    avb verify - run verification process using hash data from vbmeta structure
    avb read_rb <num> - read rollback index at location <num>
    avb write_rb <num> <rb> - write rollback index <rb> to <num>
    avb is_unlocked - returns unlock status of the device
    avb get_uuid <partname> - read and print uuid of partition <partname>
    avb read_part <partname> <offset> <num> <addr> - read <num> bytes from
    partition <partname> to buffer <addr>
    avb write_part <partname> <offset> <num> <addr> - write <num> bytes to
    <partname> by <offset> using data from <addr>
```

使用的时候 **先init后verify** ，如下：

```
Boot or system/vendor (dm-verity metadata section) is tampered::

   => avb init 1
   => avb verify
   avb_slot_verify.c:175: ERROR: boot: Hash of data does not match digest in
   descriptor.
   Slot verification result: ERROR_IO
```

## 2.2 avb命令行实现

cmd/avb.c中：

```
static struct cmd_tbl cmd_avb[] = {
    U_BOOT_CMD_MKENT(init, 2, 0, do_avb_init, "", ""),
        .......
    U_BOOT_CMD_MKENT(verify, 2, 0, do_avb_verify_part, "", ""),
```

do\_avb\_init中：

```
ops_data->ops.read_from_partition = read_from_partition;
ops_data->ops.write_to_partition = write_to_partition;
ops_data->ops.validate_vbmeta_public_key = validate_vbmeta_public_key;
ops_data->ops.read_rollback_index = read_rollback_index;
ops_data->ops.write_rollback_index = write_rollback_index;
ops_data->ops.read_is_device_unlocked = read_is_device_unlocked;
```

例如validate\_vbmeta\_public\_key（）的实现如下：

```
static AvbIOResult validate_vbmeta_public_key(AvbOps *ops,
                          const u8 *public_key_data,
                          size_t public_key_length,
                          const u8
                          *public_key_metadata,
                          size_t
                          public_key_metadata_length,
                          bool *out_key_is_trusted)
{
    if (!public_key_length || !public_key_data || !out_key_is_trusted)
        return AVB_IO_RESULT_ERROR_IO;

    *out_key_is_trusted = false;
    if (public_key_length != sizeof(avb_root_pub))
        return AVB_IO_RESULT_ERROR_IO;

    if (memcmp(avb_root_pub, public_key_data, public_key_length) == 0)
        *out_key_is_trusted = true;

    return AVB_IO_RESULT_OK;
}
```

do\_avb\_verify\_part（）中进行打印avb校验开始，然后就调用libavb中avb\_slot\_verify（）函数进行校验。

```
avb_slot_verify(avb_ops,
        requested_partitions,
        slot_suffix,
        unlocked,
        AVB_HASHTREE_ERROR_MODE_RESTART_AND_INVALIDATE,
        &out_data);
```

这里第一个参数avb\_ops就是avb init命令的时候初始化的。

## 2.3 libavb库

不管是Uboot中调用libavb库，还是android init中调用libavb库，都是调用 **avb\_slot\_verify** 函数，在lib/libavb/avb\_slot\_verify.c中，

### 2.3.1 avb\_slot\_verify

这个函数两百多行，比较多，主要分析如下：

```
AvbSlotVerifyResult avb_slot_verify(AvbOps* ops,
                                    const char* const* requested_partitions,
                                    const char* ab_suffix,
                                    AvbSlotVerifyFlags flags,
                                    AvbHashtreeErrorMode hashtree_error_mode,
                                    AvbSlotVerifyData** out_data) {
  AvbSlotVerifyResult ret;
  AvbSlotVerifyData* slot_data = NULL;
  AvbAlgorithmType algorithm_type = AVB_ALGORITHM_TYPE_NONE;
  bool using_boot_for_vbmeta = false;
  AvbVBMetaImageHeader toplevel_vbmeta;
  bool allow_verification_error =
      (flags & AVB_SLOT_VERIFY_FLAGS_ALLOW_VERIFICATION_ERROR);
  AvbCmdlineSubstList* additional_cmdline_subst = NULL;

  /* Fail early if we're missing the AvbOps needed for slot verification. */
  //先判断下面五个基本的回调函数接口是否存在，不存在会报错，即使不实现也需要实现个空内容。
  avb_assert(ops->read_is_device_unlocked != NULL);
  avb_assert(ops->read_from_partition != NULL);
  avb_assert(ops->get_size_of_partition != NULL);
  avb_assert(ops->read_rollback_index != NULL);
  avb_assert(ops->get_unique_guid_for_partition != NULL);
。。。
  //判断是否没有vbmeta分区，默认是有vbmeta分区设计的，但是也可以append到其他分区上 这种我们先不考虑
  if (flags & AVB_SLOT_VERIFY_FLAGS_NO_VBMETA_PARTITION) {
    if (ops->validate_public_key_for_partition == NULL) {
      avb_error(
          "AVB_SLOT_VERIFY_FLAGS_NO_VBMETA_PARTITION was passed but the "
          "validate_public_key_for_partition() operation isn't implemented.\n");
      ret = AVB_SLOT_VERIFY_RESULT_ERROR_INVALID_ARGUMENT;
      goto fail;
    }
  } else {
  //默认我们是使用这种方式，需要校验vbmeta分区的public key接口是否存在，这个接口用来判断vbmeta公钥hash key是否匹配。
    avb_assert(ops->validate_vbmeta_public_key != NULL);
  }
  //alloc分配内存
  slot_data = avb_calloc(sizeof(AvbSlotVerifyData));
  if (slot_data == NULL) {
    ret = AVB_SLOT_VERIFY_RESULT_ERROR_OOM;
    goto fail;
  }
  slot_data->vbmeta_images =
      avb_calloc(sizeof(AvbVBMetaData) * MAX_NUMBER_OF_VBMETA_IMAGES);
  if (slot_data->vbmeta_images == NULL) {
    ret = AVB_SLOT_VERIFY_RESULT_ERROR_OOM;
    goto fail;
  }
  slot_data->loaded_partitions =
      avb_calloc(sizeof(AvbPartitionData) * MAX_NUMBER_OF_LOADED_PARTITIONS);
  if (slot_data->loaded_partitions == NULL) {
    ret = AVB_SLOT_VERIFY_RESULT_ERROR_OOM;
    goto fail;
  }
  //给additional_cmdline_subst也alloc分配内存，这个是后面需要将avb校验的结果转成数据append到cmdline中，传递给init使用的。
  additional_cmdline_subst = avb_new_cmdline_subst_list();
  if (additional_cmdline_subst == NULL) {
    ret = AVB_SLOT_VERIFY_RESULT_ERROR_OOM;
    goto fail;
  }

if (flags & AVB_SLOT_VERIFY_FLAGS_NO_VBMETA_PARTITION) {
   ...
   //同上，我们不分析没有vbmeta分区的情况
  } else {
    //加载和校验vbmeta分区，这个函数流程非常长，我们等会分析，先看完后续的流程
    ret = load_and_verify_vbmeta(ops,
                                 requested_partitions,
                                 ab_suffix,
                                 flags,
                                 allow_verification_error,
                                 0 /* toplevel_vbmeta_flags */,
                                 0 /* rollback_index_location */,
                                 "vbmeta",
                                 avb_strlen("vbmeta"),
                                 NULL /* expected_public_key */,
                                 0 /* expected_public_key_length */,
                                 slot_data,
                                 &algorithm_type,
                                 additional_cmdline_subst);
     //在设备lock的情况且校验失败，直接异常                      
    if (!allow_verification_error && ret != AVB_SLOT_VERIFY_RESULT_OK) {
      goto fail;
    }
  }
  //根据校验结果判断是否可继续引导启动
    if (!result_should_continue(ret)) {
    goto fail;
  }
  //将校验的结果数据slot_data拷贝给toplevel_vbemta，避免修改原数据。
  avb_vbmeta_image_header_to_host_byte_order(
      (const AvbVBMetaImageHeader*)slot_data->vbmeta_images[0].vbmeta_data,
      &toplevel_vbmeta);

//根据toplevel_vbmeta vbmete头信息中flags bit位是否为disable verification，
//这个就是传说中的adb disable-verity修改的那个Bit位了，估计很多人都不知道adb这条命令干了啥，其实就是修改了vbmeta分区Header头信息中的这个bit位
if (toplevel_vbmeta.flags & AVB_VBMETA_IMAGE_FLAGS_VERIFICATION_DISABLED) {
    /* Since verification is disabled we didn't process any
     * descriptors and thus there's no cmdline... so set root= such
     * that the system partition is mounted.
     */
    avb_assert(slot_data->cmdline == NULL);
    // Devices with dynamic partitions won't have system partition.
    // Instead, it has a large super partition to accommodate *.img files.
    // See b/119551429 for details.
    if (has_system_partition(ops, ab_suffix)) {
      slot_data->cmdline =
          avb_strdup("root=PARTUUID=$(ANDROID_SYSTEM_PARTUUID)");
    } else {
      // The |cmdline| field should be a NUL-terminated string.
      slot_data->cmdline = avb_strdup("");
    }
    if (slot_data->cmdline == NULL) {
      ret = AVB_SLOT_VERIFY_RESULT_ERROR_OOM;
      goto fail;
    }
  } else {
   /* If requested, manage dm-verity mode... */
   //这里是不是很奇怪，怎么又判断了hashtree了？其实是google设计的函数共用的功能，这个函数也可以用来校验其他Hashtree类型的分区，比如system和vendor等
    AvbHashtreeErrorMode resolved_hashtree_error_mode = hashtree_error_mode;
    if (hashtree_error_mode ==
        AVB_HASHTREE_ERROR_MODE_MANAGED_RESTART_AND_EIO) {
      AvbIOResult io_ret;
      io_ret = avb_manage_hashtree_error_mode(
          ops, flags, slot_data, &resolved_hashtree_error_mode);
      if (io_ret != AVB_IO_RESULT_OK) {
        ret = AVB_SLOT_VERIFY_RESULT_ERROR_IO;
        if (io_ret == AVB_IO_RESULT_ERROR_OOM) {
          ret = AVB_SLOT_VERIFY_RESULT_ERROR_OOM;
        }
        goto fail;
      }
      
    //调用avb_append_options追加androidboot.xxx属性到cmdline中，这个比较简单就不深入分析了。
    sub_ret = avb_append_options(ops,
                                 flags,
                                 slot_data,
                                 &toplevel_vbmeta,
                                 algorithm_type,
                                 hashtree_error_mode,
                                 resolved_hashtree_error_mode);
      if (slot_data->cmdline != NULL && avb_strlen(slot_data->cmdline) != 0) {
    char* new_cmdline;
    new_cmdline = avb_sub_cmdline(ops,
                                  slot_data->cmdline,
                                  ab_suffix,
                                  using_boot_for_vbmeta,
                                  additional_cmdline_subst);
    if (new_cmdline != slot_data->cmdline) {
      if (new_cmdline == NULL) {
        ret = AVB_SLOT_VERIFY_RESULT_ERROR_OOM;
        goto fail;
      }
      avb_free(slot_data->cmdline);
      slot_data->cmdline = new_cmdline;
    }
  }

  if (out_data != NULL) {
    *out_data = slot_data;
  } else {
    avb_slot_verify_data_free(slot_data);
  }
```

### 2.3.2 load\_and\_verify\_vbmeta

**avb\_slot\_verify** 中的主要函数就是load\_and\_verify\_vbmeta（），此函数首先就是解析AvbVBMetaImageHeader结构体

```
//能看到AvbVBMetaImageHeader头信息中主要由三部分组成
Header data：vbmeta的header数据，固定长度256字节。
Authentication data：认证校验数据，长度不固定，主要包含签名和公钥等信息。
Auxiliary data：辅助数据，主要包含vbmeta中其他分区的descriptor描述信息。

 *  +-----------------------------------------+
 *  | Header data - fixed size                |
 *  +-----------------------------------------+
 *  | Authentication data - variable size     |
 *  +-----------------------------------------+
 *  | Auxiliary data - variable size          |
 *  +-----------------------------------------+
 //每一项参数，代码中都有进行说明
typedef struct AvbVBMetaImageHeader {
   魔术AVB0占四个字节
  /*   0: Four bytes equal to "AVB0" (AVB_MAGIC). */
  uint8_t magic[AVB_MAGIC_LEN];

   AVB的版本号信息1.0.0
  /*   4: The major version of libavb required for this header. */
  uint32_t required_libavb_version_major;
  /*   8: The minor version of libavb required for this header. */
  uint32_t required_libavb_version_minor;

  签名信息长度和辅助信息长度
  /*  12: The size of the signature block. */
  uint64_t authentication_data_block_size;
  /*  20: The size of the auxiliary data block. */
  uint64_t auxiliary_data_block_size;
  
  使用的签名算法类型
  /*  28: The verification algorithm used, see |AvbAlgorithmType| enum. */
  uint32_t algorithm_type;

  签名数据的在header中的Body的Hash偏移位置
  /*  32: Offset into the "Authentication data" block of hash data. */
  uint64_t hash_offset;
  数据Body的Hash大小
  /*  40: Length of the hash data. */
  uint64_t hash_size;

  签名数据的偏移位置
  /*  48: Offset into the "Authentication data" block of signature data. */
  uint64_t signature_offset;
  签名数据的大小
  /*  56: Length of the signature data. */
  uint64_t signature_size;

  公钥的偏移位置
  /*  64: Offset into the "Auxiliary data" block of public key data. */
  uint64_t public_key_offset;
  公钥的长度
  /*  72: Length of the public key data. */
  uint64_t public_key_size;

  公钥metadata的偏移位置和长度
  /*  80: Offset into the "Auxiliary data" block of public key metadata. */
  uint64_t public_key_metadata_offset;
  /*  88: Length of the public key metadata. Must be set to zero if there
   *  is no public key metadata.
   */
  uint64_t public_key_metadata_size;

  子分区的descriptor描述信息的偏移位置和长度
  /*  96: Offset into the "Auxiliary data" block of descriptor data. */
  uint64_t descriptors_offset;
  /* 104: Length of descriptor data. */
  uint64_t descriptors_size;

  vbmeta的rollback回滚值
  /* 112: The rollback index which can be used to prevent rollback to
   *  older versions.
   */
  uint64_t rollback_index;

  vbmeta的flags标志位，是否disable-verification等
  /* 120: Flags from the AvbVBMetaImageFlags enumeration. This must be
   * set to zero if the vbmeta image is not a top-level image.
   */
  uint32_t flags;

  预留的字节，为将来可扩展准备
  /* 124: Reserved to ensure |release_string| start on a 16-byte
   * boundary. Must be set to zeroes.
   */
  uint8_t reserved0[4];

  /* 128: The release string from avbtool, e.g. "avbtool 1.0.0" or
   * "avbtool 1.0.0 xyz_board Git-234abde89". Is guaranteed to be NUL
   * terminated. Applications must not make assumptions about how this
   * string is formatted.
   */
  uint8_t release_string[AVB_RELEASE_STRING_SIZE];

  /* 176: Padding to ensure struct is size AVB_VBMETA_IMAGE_HEADER_SIZE
   * bytes. This must be set to zeroes.
   */
  uint8_t reserved[80];
} AVB_ATTR_PACKED AvbVBMetaImageHeader;
```

**load\_and\_verify\_vbmeta** 代码

```
static AvbSlotVerifyResult load_and_verify_vbmeta(
    AvbOps* ops,
    const char* const* requested_partitions,
    const char* ab_suffix,
    AvbSlotVerifyFlags flags,
    bool allow_verification_error,
    AvbVBMetaImageFlags toplevel_vbmeta_flags,
    int rollback_index_location,
    const char* partition_name,
    size_t partition_name_len,
    const uint8_t* expected_public_key,
    size_t expected_public_key_length,
    AvbSlotVerifyData* slot_data,
    AvbAlgorithmType* out_algorithm_type,
    AvbCmdlineSubstList* out_additional_cmdline_subst) {
  //alloc申请内存
  vbmeta_buf = avb_malloc(vbmeta_size);
  if (vbmeta_buf == NULL) {
    ret = AVB_SLOT_VERIFY_RESULT_ERROR_OOM;
    goto out;
  }
  //触发avb_ops.cpp中第一个回调函数，本文的下面段落中有说明
  //android侧只实现了这一个回调函数，其余的都留给厂商自己实现了，在UBOOT中就可以开发定制了。
  io_ret = ops->read_from_partition(ops,
                                    full_partition_name,
                                    vbmeta_offset,
                                    vbmeta_size,
                                    vbmeta_buf,
                                    &vbmeta_num_read);
 
   //加载完vbmeta数据后，需要对vbmeta数据进行校验，调用avb_vbmeta_image_verify函数
   //本文下面专门讲，这里先分析后续的流程
   vbmeta_ret =
      avb_vbmeta_image_verify(vbmeta_buf, vbmeta_num_read, &pk_data, &pk_len);

  //vbmeta基础数据verify通过后，校验一下公钥hash是否匹配，是否本次andorid源码编译产生的key
  //这个数据是在android编译的时候产生的，
  //validate_vbmeta_public_key是第二个回调函数，厂家可自定义实现，比如把key存储中其他地方
  //android默认为空，直接返回
      avb_assert(is_main_vbmeta);
      io_ret = ops->validate_vbmeta_public_key(ops,
                                                 pk_data,
                                                 pk_len,
                                                 pk_metadata,
                                                 pk_metadata_len,
                                                 &key_is_trusted);
   //紧接着会校验vbmeta的rollback回滚值，android默认为空，直接返回
   //这是第三个回调函数
  io_ret = ops->read_rollback_index(
      ops, rollback_index_location_to_use, &stored_rollback_index);
  //同时下面代码还有rollback_index回滚值的比较判断，主要是比较存储中的index值和vbmeta中的index值
  //更新策略为:当vbmeta中的index大于存储中的值，将存储中的值更新到存储空间；
  //如果vbmeta中的index小于存储中的值，启动boot失败，防止用户降级版本。
  //android默认为空实现，默认index为0，不需要更新写入。

  //加载vbmeta中descrptor其他分区的信息，比如vbmeta_system/boot/vendor_boot等分区的信息
  descriptors =
      avb_descriptor_get_all(vbmeta_buf, vbmeta_num_read, &num_descriptors);
  for (n = 0; n < num_descriptors; n++) {
    AvbDescriptor desc;

    if (!avb_descriptor_validate_and_byteswap(descriptors[n], &desc)) {
      avb_errorv(full_partition_name, ": Descriptor is invalid.\n", NULL);
      ret = AVB_SLOT_VERIFY_RESULT_ERROR_INVALID_METADATA;
      goto out;
    }
//如果decriptor分区是hash类型，比如boot分区，调用load_and_verify_hash_partition计算hash并进行比较
    switch (desc.tag) {
      case AVB_DESCRIPTOR_TAG_HASH: {
        AvbSlotVerifyResult sub_ret;
        sub_ret = load_and_verify_hash_partition(ops,
                                                 requested_partitions,
                                                 ab_suffix,
                                                 allow_verification_error,
                                                 descriptors[n],
                                                 slot_data);
        if (sub_ret != AVB_SLOT_VERIFY_RESULT_OK) {
          ret = sub_ret;
          if (!allow_verification_error || !result_should_continue(ret)) {
            goto out;
          }
        }
      } break;

      case AVB_DESCRIPTOR_TAG_CHAIN_PARTITION: {
      case AVB_DESCRIPTOR_TAG_KERNEL_CMDLINE: {

    //如果是hashtree类型，比如system分区，调用read_persistent_digest读此分区的digest信息
      case AVB_DESCRIPTOR_TAG_HASHTREE: {
        ret = read_persistent_digest(ops,
                                       part_name,
                                       digest_len,
                                       NULL /* initial_digest */,
                                       digest_buf);
```

### 2.3.3 avb\_vbmeta\_image\_verify

load\_and\_verify\_vbmeta函数里面主要就是

1. **read\_from\_partition** ：找到vbmeta的dev节点名称，打开fd，调用read函数，将64KB的vbmeta数据全加载出来。
2. **avb\_vbmeta\_image\_verify** 进行验签
```
AvbVBMetaVerifyResult avb_vbmeta_image_verify(
    const uint8_t* data,
    size_t length,
    const uint8_t** out_public_key_data,
    size_t* out_public_key_length) {
    ...
    //首先判断是不是以“AVB0”开头的，vim打开vbmeta.img就可以看到是以AVB0开头
  /* Ensure magic is correct. */
  if (avb_safe_memcmp(data, AVB_MAGIC, AVB_MAGIC_LEN) != 0) {
    avb_error("Magic is incorrect.\n");
    goto out;
  }

  //把数据拷贝到到h AvbVBMetaImageHeader中
  avb_vbmeta_image_header_to_host_byte_order((const AvbVBMetaImageHeader*)data,
                                             &h);
  //比较avbtool的版本号 avbtool 1.10
  if ((h.required_libavb_version_major != AVB_VERSION_MAJOR) ||
      (h.required_libavb_version_minor > AVB_VERSION_MINOR)) {
    avb_error("Mismatch between image version and libavb version.\n");
    ret = AVB_VBMETA_VERIFY_RESULT_UNSUPPORTED_VERSION;
    goto out;
  }
//判断authentication和auxiliary数据大小是不是64字节的整数倍
  if ((h.authentication_data_block_size & 0x3f) != 0 ||
      (h.auxiliary_data_block_size & 0x3f) != 0) {
    avb_error("Block size is not a multiple of 64.\n");
    goto out;
  }

//判断hash和signature内容在vbmeta header中
  uint64_t hash_end;
  if (!avb_safe_add(&hash_end, h.hash_offset, h.hash_size) ||
      hash_end > h.authentication_data_block_size) {
    avb_error("Hash is not entirely in its block.\n");
    goto out;
  }
  uint64_t signature_end;
  if (!avb_safe_add(&signature_end, h.signature_offset, h.signature_size) ||
      signature_end > h.authentication_data_block_size) {
    avb_error("Signature is not entirely in its block.\n");
    goto out;
  }

//判断public key和public key metadata内容在vbmeta header中
  /* Ensure public key is entirely in the Auxiliary data block. */
  uint64_t pubkey_end;
  if (!avb_safe_add(&pubkey_end, h.public_key_offset, h.public_key_size) ||
      pubkey_end > h.auxiliary_data_block_size) {
    avb_error("Public key is not entirely in its block.\n");
    goto out;
  }

  /* Ensure public key metadata (if set) is entirely in the Auxiliary
   * data block. */
  if (h.public_key_metadata_size > 0) {
    uint64_t pubkey_md_end;
    if (!avb_safe_add(&pubkey_md_end,
                      h.public_key_metadata_offset,
                      h.public_key_metadata_size) ||
        pubkey_md_end > h.auxiliary_data_block_size) {
      avb_error("Public key metadata is not entirely in its block.\n");
      goto out;
    }
  }

//判断RSA algorithm的type和长度是不是符合
  if (h.algorithm_type == AVB_ALGORITHM_TYPE_NONE) {
    ret = AVB_VBMETA_VERIFY_RESULT_OK_NOT_SIGNED;
    avb_error("pis algoth type none AVB_VBMETA_VERIFY_RESULT_OK_NOT_SIGNED!\n");
    goto out;
  }

  /* Ensure algorithm field is supported. */
  algorithm = avb_get_algorithm_data(h.algorithm_type);
  if (!algorithm) {
    avb_error("Invalid or unknown algorithm.\n");
    goto out;
  }

  /* Bail if the embedded hash size doesn't match the chosen algorithm. */
  if (h.hash_size != algorithm->hash_len) {
    avb_error("Embedded hash has wrong size.\n");
    goto out;
  }

//到这里基本的检查项就完成了，接下来就是验证数据是不是匹配了
  header_block = data;
  authentication_block = header_block + sizeof(AvbVBMetaImageHeader);
  auxiliary_block = authentication_block + h.authentication_data_block_size;

//我们编译vbmeta应该是使用的SHA256_RSA4096，所以走下面这段逻辑
  switch (h.algorithm_type) {
    /* Explicit fall-through: */
    case AVB_ALGORITHM_TYPE_SHA256_RSA2048:
    case AVB_ALGORITHM_TYPE_SHA256_RSA4096:
    case AVB_ALGORITHM_TYPE_SHA256_RSA8192:
      avb_sha256_init(&sha256_ctx);
      avb_sha256_update(
          &sha256_ctx, header_block, sizeof(AvbVBMetaImageHeader));
      avb_sha256_update(
          &sha256_ctx, auxiliary_block, h.auxiliary_data_block_size);
      computed_hash = avb_sha256_final(&sha256_ctx);
      break;
      
    //验证hash是否相等
    if (avb_safe_memcmp(authentication_block + h.hash_offset,
                      computed_hash,
                      h.hash_size) != 0) {
    avb_error("Hash does not match!\n");
    ret = AVB_VBMETA_VERIFY_RESULT_HASH_MISMATCH;
    goto out;
  }
  
   //验证signature签名是否匹配
  verification_result =
      avb_rsa_verify(auxiliary_block + h.public_key_offset,
                     h.public_key_size,
                     authentication_block + h.signature_offset,
                     h.signature_size,
                     authentication_block + h.hash_offset,
                     h.hash_size,
                     algorithm->padding,
                     algorithm->padding_len);
}
```

这里 **先验证了hash，后进行了验签** 。hash比较简单。验证的参数如下：

```
bool avb_rsa_verify(const uint8_t* key,
                    size_t key_num_bytes,
                    const uint8_t* sig,
                    size_t sig_num_bytes,
                    const uint8_t* hash,
                    size_t hash_num_bytes,
                    const uint8_t* padding,
                    size_t padding_num_bytes) {
```
- **`key`**: 这是一个指向存储 RSA 公钥的内存区域的指针。公钥用于验证签名。
- **`key_num_bytes`**: 公钥的大小，以字节为单位。
- **`sig`**: 这是一个指向存储 RSA 签名的内存区域的指针。这是需要验证的数据的签名。
- **`sig_num_bytes`**: 签名的长度，以字节为单位。
- **`hash`**: 这是一个指向存储要验证的数据的哈希值的内存区域的指针。
- **`hash_num_bytes`**: 哈希值的长度，以字节为单位。
- **`padding`**: 这是一个指向存储填充方案信息的内存区域的指针。RSA 签名通常使用填充方案来提高安全性。常见的填充方案包括 PKCS#1 v1.5 和 PSS。
- **`padding_num_bytes`**: 填充方案信息的长度，以字节为单位。

原理如下：

1. **公钥key，使用sig算法，解密padding**
2. **得出的值跟hash进行比较**

## 2.4 avbtool

可使用avbtool提供的工具 **查看编译出来的vbmeta.img镜像** 内容：

```
./android/external/avb/avbtool info_image --image android/out/target/product/xxx/vbmeta.img
```

可以按如下方式生成vbmeta分区的内容：

```
$ avbtool make_vbmeta_image                                                    \
    [--output OUTPUT]                                                          \
    [--algorithm ALGORITHM] [--key /path/to/key_used_for_signing_or_pub_key]   \
    [--public_key_metadata /path/to/pkmd.bin] [--rollback_index NUMBER]        \
    [--include_descriptors_from_image /path/to/image.bin]                      \
    [--setup_rootfs_from_kernel /path/to/image.bin]                            \
    [--chain_partition part_name:rollback_index_location:/path/to/key1.bin]    \
    [--signing_helper /path/to/external/signer]                                \
    [--signing_helper_with_files /path/to/external/signer_with_files]          \
    [--print_required_libavb_version]                                          \
    [--append_to_release_string STR]
```

vbmeta镜像的加解密过程简述

- **加密过程** 根据摘要信息生成private key(私钥），利用私钥extra生成public key(公钥)，同时利用私钥对vbmeta镜像进行签名(signature)，并将公钥和计算的hash写到vbmeta镜像的header中。
- **解密过程** 先验证公钥是否平台签发的（公钥比对，防止vbmeta镜像的公钥和签名都被篡改掉），然后利用公钥进行解密签名。
![](https://pic1.zhimg.com/v2-3e6998e6a12b0d29cd30c933162b4aaa_1440w.jpg)

AVB中镜像的加密和解密过程，以boot.img镜像为例

编译制作boot.img时进行签名时，先通过SHA-256算法得到一个散列值digest（十六进制长度为64），然后用带RSA算法的私钥加密这个digest，并生成签名后和公钥一起加在镜像的footer尾部上，编译时也会将这个digest存一份到vbmeta.img镜像中。

1. 在bootloader中加载boot镜像时，先从vbmeta.img镜像分区中读出boot
2. descriptor的digest，然后利用boot镜像中的公钥进行解密计算得到一个digest，和自己SHA-256计算得到的digest进行比较；
3. digest相等则说明boot.img是平台编译签名的，如果不相等，则boot.img可能是被篡改过的，boot启动失败。
4. 最后再计算一次boot镜像内容的hash是否相等，hash不相等，启动也是失败。

## 3\. AVB移植

如果项目不是安卓想用AVB，而且有 **build root** 框架，那么就需要自己搭建AVB环境，移植代码过来。其中分为uboot中的和linux中使用的，主要还是 **调用libavb库和avbtool工具** 的使用，基本思路一致。

· 在编译build root前， **生成RSA公私钥对** ，并抽出公钥hash存到veritydm模块的.h头文件中；

· 对编译的 **system镜像打包** 前，预留出签名所需要的空间；

· 全部编译完成后，分别对vbmeta.img和system.img进行 **签名** ，并生成带签名的vbmeta.img和system.img；

· 在开机挂载system分区前，调用 **veritydm程序对system进行签名验证** 并使能dm verity table到kernel md驱动；

· 设计veritydm程序，移植android的libavb库，并 **调用libavb库完成AVB校验** ， 从vbmeta中获取system分区的digest和拼接参数组合成hash tree table， 调用dmsetup程序将参数通过ioctl方式传递给kernel，完成device mapper的映射功能。

整个的设计流程如下：  
**1\. 生成RSA密钥 ==》对system.img签名 ==》生成vbmeta.img ==> Verifydm程序验证签名 ==》**  
**2\. 进行AVB校验 ==》 组建hash tree table ==》 创建device mapper映射**

## 3.1 密钥生成

使用development/tools/make\_key

```
#下面是制作RSA时用到的变量
export PRI_KEY_CONTENT='/C=CN/ST=PD/L=SH/O=XXX/OU=SS/CN=China/emailAddress=xxx@xxx.com'
SALT_DATA='5c83818fd6371cbe4ecae7ff169a5857a5cae2e8e7b7d4b0168ac3e4fd42176t'
#make_key是从andorid项目的development/tools/make_key移植过来的
MAKE_KEY_PATH=make_key
KEY_PK8=veritykey.pk8
KEY_VERITY=veritykey.pem
#avbtool是从android移植 external/avb/avbtoo.py
AVBTOOL_PATH=avbtool
# bin2header工具我在AVB系列博客中"AVB中将公钥转换成字符数组头文件的实现"有介绍
BIN2HEADER_PATH=bin2header

下面是制作的脚本内容
$MAKE_KEY_PATH veritykey $PRI_KEY_CONTENT
openssl pkcs8 -inform DER -nocrypt -in veritykey.pk8 -out $KEY_VERITY
python $AVBTOOL_PATH extract_public_key --key $KEY_VERITY --output vbmeta_pub_key.bin
$BIN2HEADER_PATH vbmeta_pub_key.bin  vbmeta_key >> vbmeta_key_header.h
```

执行完成上面步骤后，产生了RSA私钥和公钥，以及公钥对应的header头文件。

## 3.2 对system.img签名生成vbmeta.img

有了私钥文件后，接下来就可以对system.img进行 **签名** 了

```
SYSTEM_IMG_PATH=system.img
export SHA_ALGORITHM=SHA256_RSA2048
export SYSTEM_ROLLBACK=1

#调用avbtool.py脚本的calc_max_image_size函数，计算system的最大可用size
#因为要给hash tree预留空间
SIZE=\`python $AVBTOOL_PATH add_hashtree_footer  --do_not_generate_fec --partition_size $yourpartitionsize --calc_max_image_size\`

#调用avbtool.py脚本，添加footer数据，其中$KEY_VERITY就是前面步骤产生的私钥
 python $AVBTOOL_PATH add_hashtree_footer --partition_size ${SIZE} --partition_name system --image $SYSTEM_IMG_PATH\
    --salt $SALT_DATA --do_not_generate_fec --key $KEY_VERITY --hash_algorithm sha256 \
    --algorithm $SHA_ALGORITHM --rollback_index $SYSTEM_ROLLBACK
```

接下来是生成 **vbmeta.img** ，且将system.img的信息添加到vbmeta.img镜像中，主要是“–include\_descriptors\_from\_image”这句了。

```
python $AVBTOOL_PATH make_vbmeta_image --output vbmeta.img --key $KEY_VERITY --algorithm $SHA_ALGORITHM --include_descriptors_from_image $SYSTEM_IMG_PATH  --padding_size 4096
```

这样vbmeta.img和system.img就生成好了，可以使用“ **info\_image** ”命令查看一下vbmeta.img和system.img的信息，查看一下他们是否匹配。

```
python $AVBTOOL_PATH info_image --image vbmeta.img
```

## 3.3 调用验证

在uboot中可以使用 **avb init命令和avb verify命令** 实现，或者自己仿照这两个命令移植到自己的程序中直接调用libavb里面的接口。具体见上面uboot中的流程分析。

参考：

1. [blog.csdn.net/jackone12](https://link.zhihu.com/?target=https%3A//blog.csdn.net/jackone12347/article/details/116241676)

> 后记：  
> 看代码分析可以使用AI给解释会比较快。本小节写的比较乱些，作为入门也算凑合看，要钻研下就需要在网上再找点资料一块看了。

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位有自己公众号的留言： **申请转载** ！

纯干货持续更新，欢迎 **分享给朋友** 、点赞、收藏、在看、划线和评论交流！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

发布于 2026-04-13 15:07・上海[2026 年 AI录音设备横评：TicNote、360 AI Note、DingTalk A1 同台测试，哪款更值得科研人入手？](https://zhuanlan.zhihu.com/p/1982478260760757075)

[

科研人真正需要的，是“科研助手”而不只是“录音设备”本周内刷到的一个最为辛酸的帖子：环球影城下午两点有没有可以开组...

](https://zhuanlan.zhihu.com/p/1982478260760757075)