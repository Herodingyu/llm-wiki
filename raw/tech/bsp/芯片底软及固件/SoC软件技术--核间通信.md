---
title: "SoC软件技术--核间通信"
source: "https://zhuanlan.zhihu.com/p/2025244089507923780"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "SoC就是 System on Chip，一个芯片上集成了一个系统，一个系统往往有很多核，例如M核、A核、R核，以及异构的RISC-V核等，集成到一个芯片上的好处就是节省成本并且体积更小，能耗也更低，可谓是一举多得。但是多个…"
tags:
  - "clippings"
---
[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679)

不坠青云之志 等 64 人赞同了该文章

![](https://pic2.zhimg.com/v2-958be64956e479fba1cb2fc56564d8e7_1440w.jpg)

SoC就是 **System on Chip** ，一个芯片上集成了一个系统，一个系统往往有很多核，例如 **M核、A核、R核** ，以及异构的 **RISC-V核** 等，集成到一个芯片上的好处就是节省成本并且体积更小，能耗也更低，可谓是一举多得。但是 **多个核上的各种OS之间就需要进行通信** ，这也就是本文的主题： **核间通信** 。核间通信也称为 **[Mailbox](https://zhida.zhihu.com/search?content_id=272743197&content_type=Article&match_order=1&q=Mailbox&zhida_source=entity)** ，Mailbox技术是由 **软硬件协同** 实现的。

其实核间通信之前电源管理相关的两篇文章里面提到过：

[1\. 电源管理入门-5 arm-scmi和mailbox核间通信](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247484716%26idx%3D2%26sn%3D5b68f1dd7fe42a7a8d293d462fb9f205%26chksm%3Dfa528308cd250a1e79d81671693503a2b4174029023c0126e30bb314a4ee269e898719aff3a9%26scene%3D21%23wechat_redirect)

2\. [ARM SCP入门-AP与SCP通信](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247484475%26idx%3D1%26sn%3D09183060a3506b1fdcd0af4d4877c89f%26chksm%3Dfa52821fcd250b091731b09a971f655dbc6bc92f2fa7b4ea9df457f02401717c95510883e53c%26scene%3D21%23wechat_redirect)

但是讲的并不深入，并且从 **硬件角度讲的少** ，也不全面。本篇文章就追本溯源，从 **一手资料** 的角度去看下什么是核间通信，重点从 **底层软硬件** 的角度去分析。

> 核间通信需要解决三个主要问题：

1. 告诉对方数据 **放哪里** （mailbox硬件或者共享内存实现）
2. 怎么去 **通知** 对方取数据（中断，俗称doorbell）
3. 数据的软件 **协议格式** 是什么

举个例子：引用ARM规范 [SCMI协议](https://zhida.zhihu.com/search?content_id=272743197&content_type=Article&match_order=1&q=SCMI%E5%8D%8F%E8%AE%AE&zhida_source=entity) 的核间通信例子：

《DEN0056E\_System\_Control\_and\_Management\_Interface》

![](https://pica.zhimg.com/v2-809ba221f5bf5f21b2f39901ab89c568_1440w.jpg)

Linux和BL31都是运行在A核上的，SCP一般是M核，这其中就是核间通信。

## 1\. 数据放mailbox硬件实现

![](https://pic4.zhimg.com/v2-a48879fe639bc76d3838fed4725014df_1440w.jpg)

完全 **用硬件实现数据传输** 不使用共享内存，那么数据就需要放入硬件的 **data寄存器** 里面就可以了，然后触发对方的 **中断** 去接收处理。

比较经典的两个ARM自己的mailbox IP就是 **[PL320](https://zhida.zhihu.com/search?content_id=272743197&content_type=Article&match_order=1&q=PL320&zhida_source=entity)** 和 **[MHU](https://zhida.zhihu.com/search?content_id=272743197&content_type=Article&match_order=1&q=MHU&zhida_source=entity)** 。并且代表了两种技术路线：

1. **PL320** 老一些，两个核都连在PL320上的两个通道上，PL320支持很多通道，一对多的关系，成本高
2. **MHU** 更加灵活，只提供一个通道，那么就需要一个核一个MHU跟对方连，这样小巧灵活，避免浪费。另外MHU的DATA数据寄存器传输能力更强，基本不用共享内存参与，且可以与软件深度融合定制，效率更高。

## 1.1 PL320硬件手册

这里以ARM一个经典的Mailbox硬件PL320为例进行说明，怎么样去拿到一手资料，那必须是ARM官网。

首先进入 **ARM官网： [developer.arm.com](https://link.zhihu.com/?target=https%3A//developer.arm.com)** 搜索 **PL320** ：

![](https://picx.zhimg.com/v2-ac4aea1881e2cf29438ec4c97d6cf6a1_1440w.jpg)

点击下载pdf即可，下面的内容都是摘自英文pdf的翻译：

IPCM是一个高度可配置和可编程的模块。它有三个可配置的参数：

1. 1-32个邮箱
2. 0-7个数据寄存器，
3. 1-32个中断。
![](https://pic2.zhimg.com/v2-f17421087a5d3d04043dc1f1ad09e22d_1440w.jpg)

**核心0有一条消息要发送到核心1：**

- 核心0通过在邮箱源寄存器中设置位0来 **声明邮箱** 。
- 然后，Core0在邮箱目标寄存器中设置位1， **启用中断** ，并将消息编程到邮箱数据寄存器中。
- 最后，核心0通过写入01向邮箱发送寄存器 **发送消息** 。这就生效了对核心1的中断。

**当Core1被中断时：**

- 它会读取IPCMINT\[1\]的屏蔽中断状态寄存器，以确定哪个邮箱包含该邮件。
- Core1读取该邮箱中的消息，然后清除该中断，并通过向邮箱发送寄存器写入10来断言确认中断。
- 核心0被确认消息中断，从而完成操作。然后，核心0决定是保留邮箱以发送另一条邮件还是释放邮箱，并将其释放给系统中的其他核心使用它。

IPCM的集成：

![](https://picx.zhimg.com/v2-22928e9992d42a9c4da227ec3e750ba9_1440w.jpg)

- **[AHB接口](https://zhida.zhihu.com/search?content_id=272743197&content_type=Article&match_order=1&q=AHB%E6%8E%A5%E5%8F%A3&zhida_source=entity)** ：AHB接口允许从系统总线访问到IPCM寄存器。
- **邮箱和控制逻辑** ：邮箱和控制逻辑块包含所有的邮箱寄存器和控制逻辑。
- **中断生成逻辑** ：中断生成逻辑块从所有IPCM邮箱的当前状态生成IPCM中断输出。

AHB（Advanced High-performance Bus）接口是一种在ARM处理器中使用的 **总线接口** 。它是一种高性能、低功耗的总线架构，用于连接处理器核心、内存、外设和其他系统组件。AHB接口支持高带宽、低延迟的数据传输，能够满足多种应用场景的需求。在ARM体系结构中，AHB接口被广泛应用于 **系统级总线连接和数据交换** 。

使用举例：

![](https://pic3.zhimg.com/v2-c8bc7e3c8ef86036cea9a7e7766a5b06_1440w.jpg)

两个核、四个邮箱，

- Core0是源，使用channel 1，使用邮箱0发消息
- Core1是目标，使用channel 2
![](https://picx.zhimg.com/v2-0e195d2b0ba2e7a5772c750e6d817c51_1440w.jpg)

时序图如上面所示，具体为：

1.Core0获得对邮箱0的控制，并通过在IPCM0SOURCE注册器中设置位0来将自己标识为源核心。

2.Core0通过在IPCM0MSTATUS寄存器中设置位0和1来实现对核心0和核心1的中断。

3.Core0通过在IPCM0DSTATUS寄存器中设置位1来定义目标核心。

4.Core0程序的数据有效负载，设置寄存器IPCM0DR0为DA7A0000。

5.Core0设置邮箱发送寄存器IPCM0SEND位0（就是0x01），以触发邮箱0中断到核心1。

---

6.Core1读取IPCMRIS1寄存器，以确定是哪个邮箱导致了中断。在本例中，只指示邮箱0。

7.Core1读取数据有效负载IPCM0DR0。

8.Core1可选择使用确认数据DA7A1111更新数据有效负载IPCM0DR0。

9.Core1清除位0，并在IPCM0SEND寄存器中设置位1，以清除其中断，并将手动确认中断提供回核心0。

---

10.Core0读取IPCMRIS0寄存器，以确定是哪个邮箱导致了中断。同样，只指示邮箱0。

11.Core0读取确认有效负载数据IPCM0DR0。

12.Core0清除邮箱发送寄存器IPCM0SEND中的位1，以清除其中断。

13.Core0通过清除IPCM0SOURCE寄存器来释放邮箱的所有权，进而清除IPCM0DSTATUS、IPCM0MSTATUS和IPCM0DR0寄存器。

注意：在步骤13中，通过不清除IPCM0源注册器，核心0可以保留邮箱以发送另一个数据消息。

**寄存器空间** ：

![](https://pica.zhimg.com/v2-be7c4625956d4d7f94b2127502fa849c_1440w.jpg)

## 1.2 PL320驱动（linux为例）

直接上 **github代码链接** ：

[github.com/torvalds/lin](https://link.zhihu.com/?target=https%3A//github.com/torvalds/linux/blob/master/drivers/mailbox/pl320-ipc.c)

```
static int pl320_probe(struct amba_device *adev, const struct amba_id *id)
{
    int ret;

    ipc_base = ioremap(adev->res.start, resource_size(&adev->res));
    if (ipc_base == NULL)
        return -ENOMEM;

    writel_relaxed(0, ipc_base + IPCMxSEND(IPC_TX_MBOX));

    ipc_irq = adev->irq[0];
    ret = request_irq(ipc_irq, ipc_handler, 0, dev_name(&adev->dev), NULL);
    if (ret < 0)
        goto err;

    /* Init slow mailbox */
    writel_relaxed(CHAN_MASK(A9_SOURCE),
               ipc_base + IPCMxSOURCE(IPC_TX_MBOX));
    writel_relaxed(CHAN_MASK(M3_SOURCE),
               ipc_base + IPCMxDSET(IPC_TX_MBOX));
    writel_relaxed(CHAN_MASK(M3_SOURCE) | CHAN_MASK(A9_SOURCE),
               ipc_base + IPCMxMSET(IPC_TX_MBOX));

    /* Init receive mailbox */
    writel_relaxed(CHAN_MASK(M3_SOURCE),
               ipc_base + IPCMxSOURCE(IPC_RX_MBOX));
    writel_relaxed(CHAN_MASK(A9_SOURCE),
               ipc_base + IPCMxDSET(IPC_RX_MBOX));
    writel_relaxed(CHAN_MASK(M3_SOURCE) | CHAN_MASK(A9_SOURCE),
               ipc_base + IPCMxMSET(IPC_RX_MBOX));

    return 0;
err:
    iounmap(ipc_base);
    return ret;
}
```

request\_irq(ipc\_irq, ipc\_handler 设置了 **中断** ，这跟硬件的连接有关系，PL320硬件跟A核连接上了那个中断引脚就是哪个，是 **硬件决定的** 。

初始化的时候会执行pl320\_probe，要根据具体 **硬件的连接方案** ，软件是需要有改动的，linux的驱动也不是万能的，只是提供了个例子，具体怎么用 **还需要自己去配置** ，所以驱动工程师每个公司都会养几个。

发数据的时候会调用pl320\_probe：

```
int pl320_ipc_transmit(u32 *data)
{
    int ret;

    mutex_lock(&ipc_m1_lock);

    init_completion(&ipc_completion);
    __ipc_send(IPC_TX_MBOX, data);
    ret = wait_for_completion_timeout(&ipc_completion,
                      msecs_to_jiffies(1000));
    if (ret == 0) {
        ret = -ETIMEDOUT;
        goto out;
    }

    ret = __ipc_rcv(IPC_TX_MBOX, data);
out:
    mutex_unlock(&ipc_m1_lock);
    return ret;
}
```

发生中断在

```
#define IPCMxDR(m, dr)        (((m) * 0x40) + ((dr) * 4) + 0x024)
#define IPCMxSEND(m)        (((m) * 0x40) + 0x020)

static void __ipc_send(int mbox, u32 *data)
{
    int i;
    for (i = 0; i < 7; i++)
        writel_relaxed(data[i], ipc_base + IPCMxDR(mbox, i));
    writel_relaxed(0x1, ipc_base + IPCMxSEND(mbox));
}
```
- m是channel数，一个channel的寄存器偏移占0x40的偏移大小
- 数据寄存器的偏移就是0x024。
- dr就是8个32bit的数据的那一个，一个字节8bit，32bit就是4个字节
- 0x20 IPCMxSEND就是触发了对方的中断
![](https://pic2.zhimg.com/v2-f818e3ff499633b7b8648327fb90aabf_1440w.jpg)

收数据的过程就是对方给自己一个中断，进入中断处理函数ipc\_handler

```
#define IPCMMIS(irq)        (((irq) * 8) + 0x800)

static irqreturn_t ipc_handler(int irq, void *dev)
{
    u32 irq_stat;
    u32 data[7];

    irq_stat = readl_relaxed(ipc_base + IPCMMIS(1));
    if (irq_stat & MBOX_MASK(IPC_TX_MBOX)) {
        writel_relaxed(0, ipc_base + IPCMxSEND(IPC_TX_MBOX));
        complete(&ipc_completion);
    }
    if (irq_stat & MBOX_MASK(IPC_RX_MBOX)) {
        __ipc_rcv(IPC_RX_MBOX, data);
        atomic_notifier_call_chain(&ipc_notifier, data[0], data + 1);
        writel_relaxed(2, ipc_base + IPCMxSEND(IPC_RX_MBOX));
    }

    return IRQ_HANDLED;
}
```

按照上面硬件手册中的流程：

10.Core0读取IPCMRIS0寄存器，以确定是哪个邮箱导致了中断。同样，只指示邮箱0。

对应：readl\_relaxed(ipc\_base + IPCMMIS(1));

![](https://pic4.zhimg.com/v2-ae49ca1ce891fd2babf0935bc8342561_1440w.jpg)

![](https://pic4.zhimg.com/v2-21381b5d291d7ef0f80b2eee631adc01_1440w.jpg)

11.Core0读取确认有效负载数据IPCM0DR0。

对应：\_\_ipc\_rcv

```
static u32 __ipc_rcv(int mbox, u32 *data)
{
    int i;
    for (i = 0; i < 7; i++)
        data[i] = readl_relaxed(ipc_base + IPCMxDR(mbox, i));
    return data[1];
}
```

12.Core0清除邮箱发送寄存器IPCM0SEND中的位1，以清除其中断。

对应代码：writel\_relaxed(2, ipc\_base + IPCMxSEND(IPC\_RX\_MBOX));

13.Core0通过清除IPCM0SOURCE寄存器来释放邮箱的所有权，进而清除IPCM0DSTATUS、IPCM0MSTATUS和IPCM0DR0寄存器。

## 2\. 数据放共享内存实现

参考之前的文章： [电源管理入门-5 arm-scmi和mailbox核间通信](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247484716%26idx%3D2%26sn%3D5b68f1dd7fe42a7a8d293d462fb9f205%26chksm%3Dfa528308cd250a1e79d81671693503a2b4174029023c0126e30bb314a4ee269e898719aff3a9%26scene%3D21%23wechat_redirect)

![](https://pic3.zhimg.com/v2-7908c453872d83c8a30b4154d2cb6dce_1440w.jpg)

1. A核先往某个指定 **共享内存空间buffer写数据** ，然后写入共享内存空间的地址信息到相应通道数据寄存器，mailbox触发中断给R核;
2. M核（SCP）通过得到 **mailbox中断** ，获取共享内存相应offset，读取buffer数据；
3. M核（SCP）通过mailbox **触发中断** 通知A核接收消息完毕。

这里的Mailbox硬件如果使用的PL320的话，那么只使用了其中断功能， **DR数据寄存器就闲置了** 。一般是需要传输的 **数据量比较大** 的时候,DR寄存不够用了，就必须使用共享内存了。

注意：使用共享内存的时候，双方要 **约定好共享内存的区域** ，或者动态的使用DR寄存器传输共享内存地址。

在drivers/mailbox/mailbox.c中，mailbox\_send\_message发消息的时候会调用mbox\_send\_message

```
mailbox_send_message
--》mbox_send_message
  --》msg_submit
  
static void msg_submit(struct mbox_chan *chan)
{
        data = chan->msg_data[idx];
        if (chan->cl->tx_prepare)
                chan->cl->tx_prepare(chan->cl, data);
        err = chan->mbox->ops->send_data(chan, data);
}
```

tx\_prepare-》shmem\_tx\_prepare会往共享内存里面存入数据，在drivers/firmware/arm\_scmi/shmem.c中

```
void shmem_tx_prepare(struct scmi_shared_mem __iomem *shmem,
                      struct scmi_xfer *xfer)
{
        spin_until_cond(ioread32(&shmem->channel_status) &
                        SCMI_SHMEM_CHAN_STAT_CHANNEL_FREE);
        iowrite32(0x0, &shmem->channel_status);
        iowrite32(xfer->hdr.poll_completion ? 0 : SCMI_SHMEM_FLAG_INTR_ENABLED,
                  &shmem->flags);
        iowrite32(sizeof(shmem->msg_header) + xfer->tx.len, &shmem->length);
        iowrite32(pack_scmi_header(&xfer->hdr), &shmem->msg_header);
        pr_info("#### shmem_tx_prepare shmem->msg_header=0x%x\n", shmem->msg_header);
        if (xfer->tx.buf){
                memcpy_toio(shmem->msg_payload, xfer->tx.buf, xfer->tx.len);
        pr_info("#### shmem_tx_prepare shmem->msg_payload[0]=0x%x\n", (int)shmem->msg_payload[0]);
        }
}
```

发消息drivers/mailbox/pl320-ipc.c中pl320\_mbox\_send\_data函数

```
static const struct mbox_chan_ops pl320_mbox_ops = {
        .send_data        = pl320_mbox_send_data,
};
```

ops->send\_data-》pl320\_mbox\_send\_data-》\_\_ipc\_send(pl320\_id, ch, buf);会触发中断

```
static void __ipc_send(int pl320_id, int mbox, u32 *data)
{
        ipc_base = get_ipc_base(pl320_id);

        for (i = 0; i < MBOX_MSG_LEN; i++)
                writel_relaxed(data[i], ipc_base + IPCMxDR(mbox, i));

        if (mbox % 2 == 0)
                writel_relaxed(0x1, ipc_base + IPCMxSEND(mbox));
        else
                writel_relaxed(0x2, ipc_base + IPCMxSEND(mbox));
}
```

收消息，drivers/mailbox/pl320-ipc.c中ipc\_handler

```
for (idx = 0; idx < MBOX_CHAN_MAX; idx++)
        if (irq_stat & (1 << idx))
                receive_flag |= channel_handler(mbox, idx);
```

channel\_handler中会清中断

## 3\. 数据的软件协议格式

## 3.1 SCMI协议

数据的协议格式是很灵活的，参考文章 [ARM SCP入门-AP与SCP通信](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247484475%26idx%3D1%26sn%3D09183060a3506b1fdcd0af4d4877c89f%26chksm%3Dfa52821fcd250b091731b09a971f655dbc6bc92f2fa7b4ea9df457f02401717c95510883e53c%26scene%3D21%23wechat_redirect)

中使用的SMT+SCMI协议的模式：

内存管理协议

![](https://pic1.zhimg.com/v2-e9649040d5b7082a3dcf596fbe36595e_1440w.jpg)

![](https://pica.zhimg.com/v2-87de9596a53b31063631bb6252572694_1440w.jpg)

代码参考： [github.com/torvalds/lin](https://link.zhihu.com/?target=https%3A//github.com/torvalds/linux/blob/4a4be1ad3a6efea16c56615f31117590fd881358/drivers/firmware/arm_scmi/shmem.c%23L22)

```
struct scmi_shared_mem {
    __le32 reserved;
    __le32 channel_status;
#define SCMI_SHMEM_CHAN_STAT_CHANNEL_ERROR    BIT(1)
#define SCMI_SHMEM_CHAN_STAT_CHANNEL_FREE    BIT(0)
    __le32 reserved1[2];
    __le32 flags;
#define SCMI_SHMEM_FLAG_INTR_ENABLED    BIT(0)
    __le32 length;
    __le32 msg_header;
    u8 msg_payload[];
};
```

其中里面包含了scmi协议的内容，如下：

```
__le32 msg_header;
u8 msg_payload[];
```

## 3.2 RPMsg通信

![](https://pic2.zhimg.com/v2-f6487a6eae8ba9a467d9746e319492bb_1440w.jpg)

Linux ® RPMsg框架是在 virtio 框架\[1\] \[2\]之上实现的消息传递机制，用于与远程处理器进行通信。它基于 virtio vring，通过共享内存向远程 CPU 发送消息或从远程CPU接收消息。

vring 是单向的，一个 vring 专用于向远程处理器发送消息，另一个 vring 用于从远程处理器接收消息。此外，在两个处理器都可见的内存空间中创建共享缓冲区。

- **remoteproc** ：remoteproc 框架允许不同的平台/架构控制（开机、加载固件、关机）远程处理器。此框架还为支持 RPMsg 协议的远程处理器添加了 rpmsg virtio 设备。有关此框架的更多详细信息，请参阅remote proc 框架\[1\]页面。
- **virtio** ：支持虚拟化的 VirtIO 框架。它基于共享环形缓冲区 (vring) 提供高效的传输层。有关此框架的更多详细信息，请参阅以下链接：
- Virtio：Linux 的 I/O 虚拟化框架\[1\]
- virtio 介绍 - SlideShare \[2\]
- **rpmsg** ：基于 virtio 的消息总线，允许内核驱动程序与系统上可用的远程处理器进行通信。它提供消息传递基础结构，方便客户端驱动程序编写有线协议消息。然后，客户端驱动程序可以根据需要公开适当的用户空间接口。
- **rpmsg\_client\_driver是实现与远程处理器关联的服务的客户端驱动程序。当远程处理器使用“新服务公告”** RPMsg消息请求关联服务时，RPMsg框架会探测此驱动程序。

参考：

[wiki.stmicroelectronics.cn](https://link.zhihu.com/?target=https%3A//wiki.stmicroelectronics.cn/stm32mpu/wiki/Linux_RPMsg_framework_overview)

上面说的一些概念可能比较不好理解，可以自己查阅下相关资料。

在Linux内核代码中，RPMsg的代码主要位于 **drivers/rpmsg/** 下，文件之间的主要关系如下图所示。一开始Linux中只使用VirtIO作为该协议传输层，后来又增加了Glink、SMD等，Glink和SMD主要用于高通平台。用户代码通过操纵rpmsg驱动，实现数据的收发操作。所有数据都在RPMsg总线上传递。

![](https://pic4.zhimg.com/v2-5b9c92f848b64ccafcef4712b3d50b7d_1440w.jpg)

![](https://picx.zhimg.com/v2-2f007a478d77d591ddd717075b5e8aed_1440w.jpg)

当主核需要和从核进行通信的时候可以分为四步，如上图所示：

1. 主核先从USED中取得一块内存；
2. 将消息按照消息协议填充；
3. 将该内存链接到AVAIL换中；
4. 触发中断，通知从核有消息处理。

RPMSG的报文格式：

![](https://pic2.zhimg.com/v2-387360910ca84decebafec7c65e56629_1440w.jpg)

该消息格式的定义位于 `drivers/rpmsg/virtio_rpmsg_bus.c` 中，具体定义如下。

```
struct rpmsg_hdr {
    u32 src;
    u32 dst;
    u32 reserved;
    u16 len;
    u16 flags;
    u8 data[];
} __packed;
```

参考： [jianshu.com/p/c7cdad827](https://link.zhihu.com/?target=https%3A//www.jianshu.com/p/c7cdad8273ed)

> 后记：  
>   
> 人类创造的技术，技术的思路必然会受人的思维限制，人的思维其实更多的还是先天基因就决定的，也就是本能。核间通信，说简单点例如你想给另一个人传递一个信息，那不 **写一个纸条递过去，然后敲一下对方，对方就知道打开看了** 。所以我们解决3个问题：  
>   
> 1.纸条（共享内存）  
>   
> 2.敲一下（中断）  
>   
> 3.纸条上写什么文字（软件协议）  
>   
> 这么说你理解什么是核间通信了么？ **理解了评论区扣1** 。

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

后续会继续更新，纯干货分析，欢迎分享给朋友，欢迎评论交流！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

编辑于 2026-04-08 16:11・上海[30岁机械专业 成功转行模拟IC版图，怎么办到的？](https://zhuanlan.zhihu.com/p/1946221782240596820)

[

征稿来自：已就业的2204期学员2019年我毕业于某文理学院的机械专业，跟芯片可以说是八竿子打不着的关系。 毕业后我在一家快消公司做市场专员，每天的工作就是写活动方案、对接渠道、...

](https://zhuanlan.zhihu.com/p/1946221782240596820)