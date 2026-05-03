---
title: "信息安全：软件认证（Authentication）"
source: "https://zhuanlan.zhihu.com/p/659780841"
author:
  - "[[TrustZone​​​海思技术有限公司 员工]]"
published:
created: 2026-05-03
description: "大家好！我是不知名的安全工程师Hkcoco！ 欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco 获取更多精彩内容哦！！！ Perface近些年，汽车新势力的强势入局，汽车行业，大有\"百花齐放\"的盛况。汽车…"
tags:
  - "clippings"
---
1 人赞同了该文章

---

大家好！我是不知名的 [安全工程师](https://zhida.zhihu.com/search?content_id=234746321&content_type=Article&match_order=1&q=%E5%AE%89%E5%85%A8%E5%B7%A5%E7%A8%8B%E5%B8%88&zhida_source=entity) Hkcoco！

欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco

获取更多精彩内容哦！！！

---

## Perface

近些年，汽车新势力的强势入局， [汽车行业](https://zhida.zhihu.com/search?content_id=234746321&content_type=Article&match_order=1&q=%E6%B1%BD%E8%BD%A6%E8%A1%8C%E4%B8%9A&zhida_source=entity) ，大有"百花齐放"的盛况。汽车行业的蓬勃发展，催生多种新技术的诞生和跨界使用，比如：软件认证功能（Software Authentication）。讨论的内容包括但不限于：1、软件Part创建 2、软件签名 3、软件下载与验证......

本系列话题讨论的几点内容如下所示：

## 在这里插入图片描述 Part One

**本文讨论第一个点：软件Part创建（Create SW Part）**

## 1、Create SW Part

创建软件Part示意如下所示：

![](https://pica.zhimg.com/v2-765ac32cf2dbbfa5b8c11aa3891d27d8_1440w.jpg)

图片

一个Software Part可以包含多个Data Blocks。这里解释一下Software Part和Data Blocks。

- Software Part：软件块，比如：Application程序块、 [标定块](https://zhida.zhihu.com/search?content_id=234746321&content_type=Article&match_order=1&q=%E6%A0%87%E5%AE%9A%E5%9D%97&zhida_source=entity) （Calibration）等。
- Data Blocks：软件被 [编译器](https://zhida.zhihu.com/search?content_id=234746321&content_type=Article&match_order=1&q=%E7%BC%96%E8%AF%91%E5%99%A8&zhida_source=entity) 编译后，并不连续，而是分段的。

可以用HexView打开编译后的 [可执行文件](https://zhida.zhihu.com/search?content_id=234746321&content_type=Article&match_order=1&q=%E5%8F%AF%E6%89%A7%E8%A1%8C%E6%96%87%E4%BB%B6&zhida_source=entity) （本文：.hex）,打开一个Application Part，对应的部分Data blocks如下所示：

![](https://pica.zhimg.com/v2-dbb3c96c94b977081412474b85703058_1440w.jpg)

图片

> 提示：实际的工程中， **可能会将Block间的gap用指定填充值（eg：padding value = 0x00）进行填充** ，形成一个大的Block，以便于减少hash的计算。

为了验证下载的数据，需要清楚ECU每个Data Block在内存中的起始地址、长度、CRC等信息。对于需要认证的软件，Software Part除了Data block信息外，还会附加一个VBT（Verification Block Table），置于Data block后面。

一般来说，VBT会专门分配一个block，且Start Address确定。示意如下所示：

![](https://pic1.zhimg.com/v2-427cb03f3bdbfb509df901b89be6fd80_1440w.jpg)

图片

## 2、VBT

VBT里面放置的是什么呢？

答：VBT就像一个清单列表（manifest），存储着Software Part里的每个Data Block信息，这些信息包括：起始地址、长度、 [Hash值](https://zhida.zhihu.com/search?content_id=234746321&content_type=Article&match_order=1&q=Hash%E5%80%BC&zhida_source=entity) 等。

首先，对VBT签名（sign），对应的信息（start address、 length、 hash value）存储在"Header"中，其中root hash value是指对VBT的起始地址、长度、数据的计算结果。root hash value是程序最先比对的一个对象，如果root hash value验证不过，则之后的Data block的hash值不再比对。

注意，root hash的签名信息会通过 [上位机](https://zhida.zhihu.com/search?content_id=234746321&content_type=Article&match_order=1&q=%E4%B8%8A%E4%BD%8D%E6%9C%BA&zhida_source=entity) 发送给ECU，常规做法：通过诊断 Routine Control service (0x31) 服务将签名信息下发给ECU，ECU使用已经存储的Public Key计算VBT对应的root hash value。签名信息包含在"Header"部分，如下所示：

![](https://picx.zhimg.com/v2-eb1a90be0cab9a7e8bc3f33c297107b7_1440w.jpg)

图片

> 注意：签名信息又分为产品签和开发签。开发签主要在 [开发阶段](https://zhida.zhihu.com/search?content_id=234746321&content_type=Article&match_order=1&q=%E5%BC%80%E5%8F%91%E9%98%B6%E6%AE%B5&zhida_source=entity) 使用，产品签主要用于产线。

VBT格式如下所示：

![](https://pic3.zhimg.com/v2-5a3739487ff762121925a07bd357d78c_1440w.jpg)

图片

这里我们先展开一下root hash的验证过程：

- 当VBT刷写进ECU Memory以后，会调用HSM接口，根据VBT的StartAddress、Length、Data计算root hash（这里记为root\_hash\_1）。注意，此处的VBT Block和Data Block已通过Transfer Data service (0x36) 存储到ECU的指定 Memory；
- 当ECU收到上位机发送的签名信息以后，根据签名信息再次调用HSM计算root hash（这里记为root\_hash\_2）；
- 如果root\_hash\_1 == root\_hash\_2，则VBT验证通过，之后进行后续的Data Block验证；否则，验证失败，即：刷写失败。

> 提示：
> 
> - 每个Data Block的hash值仅是Data Block的Data计算结果；
> - VBT的hash值（root hash）是VBT对应的Start Address、Length、Data计算结果。

## （一）VBT格式

VBT的格式如下所示：

![](https://pica.zhimg.com/v2-269ce1e32ebe704e44387140302a17e2_1440w.jpg)

图片

Hash value的长度与使用的 [Hash算法](https://zhida.zhihu.com/search?content_id=234746321&content_type=Article&match_order=1&q=Hash%E7%AE%97%E6%B3%95&zhida_source=entity) 相关，比如：使用SHA-256，则Hash value = 256 bit = 32 Byte。 示例：一个Data Block，VBT的Data记录信息如下所示

![](https://pic4.zhimg.com/v2-b097220022f888fc810cde7cb623a4cd_1440w.jpg)

图片

解析：

- VBT Format Identifier = 0x0000;
- Data Blocks的个数是0x0001;
- Data Block1的Start Address = 0xA0300000，Leng = 0x000FC000，Hash Value = 0xD49C8F....173C。

这里的Format Identifier是企业规范，并不属于通用规范，比如：0x0000对应SHA-256、0x0001对应SHA-384、0x0002对应 [SHA-512](https://zhida.zhihu.com/search?content_id=234746321&content_type=Article&match_order=1&q=SHA-512&zhida_source=entity) 等。此标识主要用于区分使用的SHA算法。

## 3、\*.vbf文件处理时机

需求中，一般会要求：在生成VBT之前，Data block数据不要压缩（Compression）、 [加密](https://zhida.zhihu.com/search?content_id=234746321&content_type=Article&match_order=1&q=%E5%8A%A0%E5%AF%86&zhida_source=entity) （Encryption）、编码处理等。

这些动作需要在VBT生成之后进行，如下所示：

![](https://pic2.zhimg.com/v2-beaea5a5e2d33bc1cae44a9d79c60d33_1440w.jpg)

图片

## Part Two

软件签名的大体流程如下所示：

![](https://pica.zhimg.com/v2-559c02b400684937aca4e90e123d51de_1440w.jpg)

这个流程中，有这样几个信息是本文所要讨论的：
- Sign用到的算法有哪些
- Private Key和Public Key关系

## 1、Sign用到的算法有哪些

## 1、SHA256

SHA256：Secure Hash Algorithm， [安全散列算法](https://zhida.zhihu.com/search?content_id=234746321&content_type=Article&match_order=1&q=%E5%AE%89%E5%85%A8%E6%95%A3%E5%88%97%E7%AE%97%E6%B3%95&zhida_source=entity) 。 **对任意长度的信息，SHA256均会生成一个长度256bit（32 Byte）的 [哈希值](https://zhida.zhihu.com/search?content_id=234746321&content_type=Article&match_order=1&q=%E5%93%88%E5%B8%8C%E5%80%BC&zhida_source=entity) ，这256Bit信息也称作摘要** 。软件认证中，主要用来对Data Block、VBT（Verification Block Table）生成Hash值，确保数据在通信过程中未被篡改，相比于常规的 [CRC算法](https://zhida.zhihu.com/search?content_id=234746321&content_type=Article&match_order=1&q=CRC%E7%AE%97%E6%B3%95&zhida_source=entity) ，此方法的 [数据完整性](https://zhida.zhihu.com/search?content_id=234746321&content_type=Article&match_order=1&q=%E6%95%B0%E6%8D%AE%E5%AE%8C%E6%95%B4%E6%80%A7&zhida_source=entity) 和安全性校验更可靠。

数据完整性校验，除了使用 [SHA256算法](https://zhida.zhihu.com/search?content_id=234746321&content_type=Article&match_order=1&q=SHA256%E7%AE%97%E6%B3%95&zhida_source=entity) ，常见的其他算法有SHA-384、SHA-512等。

## 2、RSA2048

RSA2048：一种 [非对称](https://zhida.zhihu.com/search?content_id=234746321&content_type=Article&match_order=1&q=%E9%9D%9E%E5%AF%B9%E7%A7%B0&zhida_source=entity) 成加密算法。收/发双方各有一组 [公钥](https://zhida.zhihu.com/search?content_id=234746321&content_type=Article&match_order=1&q=%E5%85%AC%E9%92%A5&zhida_source=entity) （Public Key）和 [私钥](https://zhida.zhihu.com/search?content_id=234746321&content_type=Article&match_order=1&q=%E7%A7%81%E9%92%A5&zhida_source=entity) （Private Key)，RSA2048常用于密钥加密。

软件认证中常用的 [签名算法](https://zhida.zhihu.com/search?content_id=234746321&content_type=Article&match_order=1&q=%E7%AD%BE%E5%90%8D%E7%AE%97%E6%B3%95&zhida_source=entity) ：SHA256\_RSA2048。

[加密算法](https://zhida.zhihu.com/search?content_id=234746321&content_type=Article&match_order=2&q=%E5%8A%A0%E5%AF%86%E7%AE%97%E6%B3%95&zhida_source=entity) ，除了常用的RSA2048，还有RSA4096等。

## 2、Private Key与Public Key关系

软件认证中，公钥（Public Key）和私钥（Private Key)是成对出现的，即：Key-Pair，两者之间的关系和作用如下所示：

![](https://picx.zhimg.com/v2-f51b9e7fde21b89a8ab0844567c1a1a7_1440w.jpg)

工程中，Public Key和Private Key一般固定长度，比如：2048 Bit（256 Byte）。
- Private Key：对Software Part进行签名（加密）。
- Public Key：对前面的Software Part进行解密。

既然用Public Key对Software Part进行解密，就需要提前将Public Key存储到ECU中。开发过程中，使用开发对应的Public Key（默认Key，eg：0xFFFFFFFFFF）；当软件完成开发以后，会将Public Key存储到一个不可修改的位置，且只能写一次，写入位置可以是HSM，这个Public Key称为产品Public Key。

工程中，Public Key一般在升级过程中，提前通过Write Data By Identifier service(0x2E)写入指定位置。

## 1、Private Key对谁加密（签名）？

工程中，Private Key主要对Root Hash进行加密，即VBT对应的hash值进行加密。

## 2、Public Key对谁解密？

既然，Private Key是对Root Hash加密，那么对应的Public Key就是对Root Hash进行解密。解密后获取VBT的Root Hash Value（记为#1），之后ECU通过调用HSM接口，对已刷写进内存的VBT Block进行Root Hash Value（记为#2）计算。

通过对比Root Hash Value#1和Root Hash Value#2即可知道当前的VBT是否可信。如果不可信，即：Root Hash Value#1 ≠ Root Hash Value#2，说明当前的信息不安全，进而刷写失败。

## 参考资料

> 转自以下前辈文章

- [mp.weixin.qq.com/s?](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyNDU4NTc1NQ%3D%3D%26mid%3D2247490561%26idx%3D1%26sn%3Dcd3ad56c4d24b4474dd0e1cb2bb10a6a%26chksm%3Dfa2a4275cd5dcb63436b8f45ba9ad3d25b296bdbc246829456b1ea63625e817d02ff8e6014fe%26scene%3D21%23wechat_redirect)
- [mp.weixin.qq.com/s?](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyNDU4NTc1NQ%3D%3D%26mid%3D2247490586%26idx%3D1%26sn%3D2be4a4463af77a9e06b1d5e8234e2a32%26chksm%3Dfa2a426ecd5dcb7887cc052269b0a3aac3519e833fc3345629d8337529ccff8f4245fdd9ed6b%26cur_album_id%3D2670421882604847110%26scene%3D189%23wechat_redirect)

> 本文使用 [Zhihu On VSCode](https://zhuanlan.zhihu.com/p/106057556) 创作并发布

发布于 2023-10-06 21:00・四川