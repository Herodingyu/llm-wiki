---
title: "电源管理入门-5 arm-scmi和mailbox核间通信"
source: "https://zhuanlan.zhihu.com/p/2022263438747943212"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "上篇介绍了电源管理入门-4子系统reset，提到子系统reset的执行为了安全可以到SCP里面去执行，但是怎么把这个消息传递过去呢，答案就是mailbox。 Mailbox是核间通信软硬件的统称。 在软件上可以使用SCMI协议+共享内…"
tags:
  - "clippings"
---
[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679)

3 人赞同了该文章

![](https://pica.zhimg.com/v2-82644a755444a14a159bef3c819a968a_1440w.jpg)

上篇介绍了电源管理入门-4子系统reset，提到子系统reset的执行为了安全可以到SCP里面去执行，但是怎么把这个消息传递过去呢，答案就是mailbox。

> Mailbox是核间通信软硬件的统称。  
> 在软件上可以使用 [SCMI协议](https://zhida.zhihu.com/search?content_id=272281433&content_type=Article&match_order=1&q=SCMI%E5%8D%8F%E8%AE%AE&zhida_source=entity) +共享内存报文头，  
>   
> 在硬件上可以使用 [PL320](https://zhida.zhihu.com/search?content_id=272281433&content_type=Article&match_order=1&q=PL320&zhida_source=entity) 或者 [MHU](https://zhida.zhihu.com/search?content_id=272281433&content_type=Article&match_order=1&q=MHU&zhida_source=entity) 。

## 1\. 整体架构介绍

![](https://pic3.zhimg.com/v2-099965e13c45cd2a3c93bee6e75a64fc_1440w.jpg)

Reset系统架构框图

上图以NPU子模块的服务为例子，Mailbox的硬件使用PL320，整体流程如下：

1. Reset consumer模块执行devm\_reset\_control\_get（）获取npu\_reset复位句柄，然后通过reset\_control\_reset（）触发复位
2. Linux系统reset framework找到复位驱动并执行ops->reset（）回调函数
3. [scmi-reset驱动](https://zhida.zhihu.com/search?content_id=272281433&content_type=Article&match_order=1&q=scmi-reset%E9%A9%B1%E5%8A%A8&zhida_source=entity) 里面提供.reset函数的实现scmi\_reset\_deassert（），并执行
4. arm-scmi里面提供scmi reset协议的实现模块reset，里面提供reset函数scmi\_reset\_domain\_reset（）
5. arm-scmi里面提供scmi协议收发的框架driver，提供do\_xfer（）
6. arm-scmi里面提供mailbox的接口函数mailbox\_send\_message（）
7. arm-scmi里面提供共享内存的操作函数 [shmem\_tx\_prepare](https://zhida.zhihu.com/search?content_id=272281433&content_type=Article&match_order=1&q=shmem_tx_prepare&zhida_source=entity) （）
8. mailbox驱动里面提供硬件PL320的寄存器操作实现pl320\_mbox\_send\_data（）
9. SCP中PL320驱动模块接收mailbox中断
10. SCP中SMT模块从共享内存中读取SCMI报文数据
11. SCP中SCMI模块对SCMI协议报文进行解析，并进行分发处理
12. SCP中SCMI RESET DOMAIN协议模块对报文进行功能处理
13. SCP中RESET DOMAIN模块屏蔽硬件差异实现统一API
14. SCP中JUNO RESET DOMAIN模块提供具体硬件CRU寄存器操作实现

## 2 Linux中reset模块

![](https://pic2.zhimg.com/v2-bc54eaeb6ea43b517843b1841105db83_1440w.jpg)

## 2.1 Reset consumer

之前的文章电源管理入门-4子系统reset介绍了怎么使用Linux的reset子系统，这里我们就直接使用，需要在DTS中修改即可。

reset使用Linux自带的reset框架，假定consumer-firmware-npu这个驱动要使用NPU的reset，定义在DTS中有reset consumer的说明：consumer-firmware-npu。

```
/ {
        consumer_firmware@0x0 {
                compatible = "consumer-firmware-npu";
                reg = < 0x0 0x0 0x0 0x00 >;
                resets = <&scmi_reset 0>;
                reset-names = "npu_reset";
        };
};
```

drivers/firmware/consumer/consumer.c中驱动需要使用reset功能。

```
static struct platform_driver consumer_firmware_driver = {
        .driver = {
                .name = "consumer_firmware",
                .of_match_table = consumer_firmware_of_match,
        },
        .probe = consumer_firmware_probe,
        .remove = consumer_firmware_remove,
};
consumer_firmware_probe
--》devm_reset_control_get //获取"npu_reset"复位句柄
--》consumer_fw_firmware_cb 
  --》consumer_fw_memcpy //拷贝镜像
  --》consumer_control_reset //通知reset驱动进行reset
```

这样DTS探测到consumer\_firmware的时候就会触发reset操作。

```
reset_control_reset
    rstc->rcdev->ops->reset(rstc->rcdev, rstc->id);
```

reset的provider驱动使用compatible = "scmi-reset";驱动，详细见后面 **2.2** reset provider中分析。当reset时在drivers/reset/reset-scmi.c中实现

```
static int
scmi_reset_reset(struct reset_controller_dev *rcdev, unsigned long id)
{
        const struct scmi_protocol_handle *ph = to_scmi_handle(rcdev);

        return reset_ops->reset(ph, id);
}

static const struct reset_control_ops scmi_reset_ops = {
        .assert                = scmi_reset_assert,
        .deassert        = scmi_reset_deassert,
        .reset                = scmi_reset_reset,
};
```

reset\_ops在scmi\_reset\_probe的时候会赋值

```
reset_ops = handle->devm_protocol_get(sdev, SCMI_PROTOCOL_RESET, &ph);
```

handle->devm\_protocol\_get为drivers/firmware/arm\_scmi/driver.c中scmi\_devm\_protocol\_get，

```
pi = scmi_get_protocol_instance(handle, protocol_id);
return pi->proto->ops;
```

在scmi协议初始化的时候，scmi\_reset\_register会注册0x16的回调函数，详细分析见 **2.2.1** SCMI reset协议初始化内容。在drivers/firmware/arm\_scmi/reset.c中

```
static const struct scmi_reset_proto_ops reset_proto_ops = {
        .num_domains_get = scmi_reset_num_domains_get,
        .name_get = scmi_reset_name_get,
        .latency_get = scmi_reset_latency_get,
        .reset = scmi_reset_domain_reset,
        .assert = scmi_reset_domain_assert,
        .deassert = scmi_reset_domain_deassert,
};
```

scmi\_reset\_domain\_reset--》scmi\_domain\_reset ret = ph->xops->do\_xfer(ph, t); do\_xfer在drivers/firmware/arm\_scmi/driver.c中实现

```
do_xfer(ph, xfer);
ret = info->desc->ops->send_message(cinfo, xfer);
```

send\_message在drivers/firmware/arm\_scmi/mailbox.c中定义

```
static const struct scmi_transport_ops scmi_mailbox_ops = {
        .chan_available = mailbox_chan_available,
        .chan_setup = mailbox_chan_setup,
        .chan_free = mailbox_chan_free,
        .send_message = mailbox_send_message,
        .mark_txdone = mailbox_mark_txdone,
        .fetch_response = mailbox_fetch_response,
        .fetch_notification = mailbox_fetch_notification,
        .clear_channel = mailbox_clear_channel,
        .poll_done = mailbox_poll_done,
};
```

mailbox\_send\_message见 **3.2** 中分析

## 2.2 Reset provider

reset的provider是scmi-reset驱动，DTS中设置如下：

```
scmi_reset: protocol@16 {
        reg = <0x16>;
        #reset-cells = <1>;
};
```

代码位置在：drivers/reset/reset-scmi.c

```
static struct scmi_driver scmi_reset_driver = {
        .name = "scmi-reset",
        .probe = scmi_reset_probe,
        .id_table = scmi_id_table,
};
module_scmi_driver(scmi_reset_driver);
```

scmi\_reset\_probe的定义如下：

```
static int scmi_reset_probe(struct scmi_device *sdev)
{
        reset_ops = handle->devm_protocol_get(sdev, SCMI_PROTOCOL_RESET, &ph);

        data = devm_kzalloc(dev, sizeof(*data), GFP_KERNEL);
        data->rcdev.ops = &scmi_reset_ops;
        data->rcdev.owner = THIS_MODULE;
        data->rcdev.of_node = np;
        data->rcdev.nr_resets = reset_ops->num_domains_get(ph);
        data->ph = ph;

        return devm_reset_controller_register(dev, &data->rcdev);//进行驱动注册
}
```

handle->devm\_protocol\_get为scmi\_devm\_protocol\_get，这里面发送了三条0x16的scmi消息 scmi\_devm\_protocol\_get->scmi\_get\_protocol\_instance

scmi\_get\_protocol\_instance里面发送了三条0x16的scmi消息，来获取reset的版本号，支持那些devices等信息

## 3\. Linux SCMI reset通信

![](https://pica.zhimg.com/v2-aae703f2c7b704ed9ded1559a898057e_1440w.jpg)

如上图中，Linux通过非安全通道跟SCP交互。

## 3.1 SCMI reset协议初始化

系统初始化的时候会执行subsys\_initcall(scmi\_driver\_init);在drivers/firmware/arm\_scmi/driver.c中：

```
static int __init scmi_driver_init(void)
{
        int ret;

        /* Bail out if no SCMI transport was configured */
        if (WARN_ON(!IS_ENABLED(CONFIG_ARM_SCMI_HAVE_TRANSPORT)))
                return -EINVAL;

        scmi_bus_init();

        /* Initialize any compiled-in transport which provided an init/exit */
        ret = scmi_transports_init();
        if (ret)
                return ret;

        scmi_base_register();

        scmi_clock_register();
        scmi_perf_register();
        scmi_power_register();
        scmi_reset_register();
        scmi_sensors_register();
        scmi_voltage_register();
        scmi_system_register();

        return platform_driver_register(&scmi_driver);
}
```

scmi\_driver的定义为：

```
static struct platform_driver scmi_driver = {
        .driver = {
                   .name = "arm-scmi",
                   .suppress_bind_attrs = true,
                   .of_match_table = scmi_of_match,
                   .dev_groups = versions_groups,
                   },
        .probe = scmi_probe,
        .remove = scmi_remove,
};
```

drivers/firmware/arm\_scmi/driver.c中scmi\_probe函数

```
static int scmi_probe(struct platform_device *pdev)
{
    ret = scmi_txrx_setup(info, dev, SCMI_PROTOCOL_BASE);
    
    ret = scmi_xfer_info_init(info);、
    
    ret = scmi_protocol_acquire(handle, SCMI_PROTOCOL_BASE);
```

scmi\_txrx\_setup中会调用mailbox\_chan\_setup函数

```
size = resource_size(&res);
smbox->shmem = devm_ioremap(dev, res.start, size);
smbox->chan = mbox_request_channel(cl, tx ? 0 : 1);
```

scmi\_protocol\_acquire（）函数

```
int scmi_protocol_acquire(const struct scmi_handle *handle, u8 protocol_id)
{
        return PTR_ERR_OR_ZERO(scmi_get_protocol_instance(handle, protocol_id));
}
scmi_get_protocol_instance
    scmi_alloc_init_protocol_instance(info, proto);
        ret = pi->proto->instance_init(&pi->ph);
```

drivers/firmware/arm\_scmi/base.c中定义了instance\_init

```
static int scmi_base_protocol_init(const struct scmi_protocol_handle *ph)
    ret = ph->xops->version_get(ph, &version);

static const struct scmi_xfer_ops xfer_ops = {
        .version_get = version_get,
        .xfer_get_init = xfer_get_init,
        .reset_rx_to_maxsz = reset_rx_to_maxsz,
        .do_xfer = do_xfer,
        .do_xfer_with_response = do_xfer_with_response,
        .xfer_put = xfer_put,
};
```

version\_get中进行scmi的发送

```
static int version_get(const struct scmi_protocol_handle *ph, u32 *version)
{
        ret = xfer_get_init(ph, PROTOCOL_VERSION, 0, sizeof(*version), &t);
        ret = do_xfer(ph, t);
        xfer_put(ph, t);
```

xfer\_get\_init中进行了赋值xfer->hdr.id = msg\_id; do\_xfer进行了发送操作，之后等待回复

```
ret = info->desc->ops->send_message(cinfo, xfer);

/* And we wait for the response. */
timeout = msecs_to_jiffies(info->desc->max_rx_timeout_ms);
if (!wait_for_completion_timeout(&xfer->done, timeout)) {
        dev_err(dev, "timed out in resp(caller: %pS)\n",
                (void *)_RET_IP_);
        ret = -ETIMEDOUT;
}
```

send\_message在drivers/firmware/arm\_scmi/mailbox.c中定义

```
static const struct scmi_transport_ops scmi_mailbox_ops = {
        .chan_available = mailbox_chan_available,
        .chan_setup = mailbox_chan_setup,
        .chan_free = mailbox_chan_free,
        .send_message = mailbox_send_message,
        .mark_txdone = mailbox_mark_txdone,
        .fetch_response = mailbox_fetch_response,
        .fetch_notification = mailbox_fetch_notification,
        .clear_channel = mailbox_clear_channel,
        .poll_done = mailbox_poll_done,
};
```

mbox\_send\_message就是mailbox提供的发消息接口函数，详细介绍见 **3.2** 中

初始化的时候不仅初始化了scmi协议还调用了scmi\_reset\_register();注册了0x16的scmi reset协议 在drivers/firmware/arm\_scmi/reset.c中

```
static const struct scmi_protocol scmi_reset = {
        .id = SCMI_PROTOCOL_RESET,
        .owner = THIS_MODULE,
        .instance_init = &scmi_reset_protocol_init,
        .ops = &reset_proto_ops,
        .events = &reset_protocol_events,
};

DEFINE_SCMI_PROTOCOL_REGISTER_UNREGISTER(reset, scmi_reset)

#define DEFINE_SCMI_PROTOCOL_REGISTER_UNREGISTER(name, proto)        \
static const struct scmi_protocol *__this_proto = &(proto);        \
                                                                \
int __init scmi_##name##_register(void)                                \
{                                                                \
        return scmi_protocol_register(__this_proto);                \
}
```

## 3.2 SCMI reset消息收发

![](https://pic4.zhimg.com/v2-4b3c63bea7fe88f3fe8963383ab6759f_1440w.jpg)

1. A核先往某个指定共享内存空间buffer写数据，然后写入共享内存空间的地址信息到相应通道数据寄存器，mailbox触发中断给R核;
2. M核（SCP）通过得到mailbox中断，获取共享内存相应offset，读取buffer数据；
3. M核（SCP）通过mailbox触发中断通知A核接收消息完毕。

> PL320和MHU硬件的区别？  
> PL320带传输数据和中断功能，但是数据量比较小7\*32bit。对于新的SoC来说数据传输基本都使用共享内存，PL320自带的数据传输基本用不上了，所以其算过时了。新的MHU只保留了中断功能，并且是1对1的集成，核间通信时成对出现，用几个加几个更加的灵活，PL320是一次32个通道集成进SoC的，也可能浪费。  
>   
> 我们以PL320为例，只使用其中断，数据还是通过共享内存传输，驱动跟MHU原理差不多。关于PL320，可以参考ARM官网的文档，后面会专门写一个核间通信的专题介绍下。

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

## 4\. SCP中reset

![](https://pic2.zhimg.com/v2-0e0bb3efc0bd081fdd8d6678169e71ff_1440w.jpg)

## 4.1 固件新增module

- 根据我们的需求需要处理0x16 scmi reset domain协议，所以在scmi module之后需要新加协议层scmi-reset-domain
- 根据SCP固件的分层结构，协议层之后需要添加HAL层和驱动层

综上，需要在product/juno/scp\_ramfw/CMakeLists.txt中新加如下module模块：

```
if(SCP_ENABLE_SCMI_RESET)
    target_sources(
        juno-bl2
        PRIVATE
            "${CMAKE_CURRENT_SOURCE_DIR}/config_reset_domain.c"
            "${CMAKE_CURRENT_SOURCE_DIR}/config_scmi_reset_domain.c"
            "${CMAKE_CURRENT_SOURCE_DIR}/config_juno_reset_domain.c")
endif()

if(SCP_ENABLE_SCMI_RESET)
    list(APPEND SCP_MODULES "reset-domain")
    list(APPEND SCP_MODULES "scmi-reset-domain")
    list(APPEND SCP_MODULES "juno-reset-domain")
endif()
```

打开SCP\_ENABLE\_SCMI\_RESET宏，在product/juno/scp\_ramfw/Firmware.cmake中 set(SCP\_ENABLE\_SCMI\_RESET TRUE) set(SCP\_ENABLE\_SCMI\_RESET\_INIT TRUE)

## 4.2 scmi\_reset\_domain初始化

新增scmi\_reset\_domain协议module后，首先初始化的时候需要向scmi注册，这样当收到scmi消息的时候，会根据scmi协议号0x16进行协议分发处理。

![](https://picx.zhimg.com/v2-2151dcb998c4da36c61dcd5243101ec5_1440w.jpg)

module/scmi\_reset\_domain/src/mod\_scmi\_reset\_domain.c中初始化会执行.bind = scmi\_reset\_bind,函数

```
status = fwk_module_bind(FWK_ID_MODULE(FWK_MODULE_IDX_SCMI),
                         FWK_ID_API(FWK_MODULE_IDX_SCMI,
                                    MOD_SCMI_API_IDX_PROTOCOL),
                         &scmi_rd_ctx.scmi_api);
```

去绑定scmi模块，在scmi中执行.process\_bind\_request = scmi\_process\_bind\_request,

```
scmi_ctx.protocol_table[PROTOCOL_TABLE_RESERVED_ENTRIES_COUNT +
                        scmi_ctx.protocol_count++].id = source_id;
*api = &scmi_from_protocol_api;
```

会填充scmi\_ctx.protocol\_table，之后.bind = scmi\_bind,执行

```
for (protocol_idx = 0;
     protocol_idx < scmi_ctx.protocol_count; protocol_idx++) {
    protocol = &scmi_ctx.protocol_table[
        PROTOCOL_TABLE_RESERVED_ENTRIES_COUNT + protocol_idx];
    //根据module信息进行绑定，拿到api
    status = fwk_module_bind(protocol->id,
        FWK_ID_API(fwk_id_get_module_idx(protocol->id), 0), &protocol_api);
    //使用拿到的api获取scmi协议id号
    status = protocol_api->get_scmi_protocol_id(protocol->id,
                                                &scmi_protocol_id);
    FWK_LOG_INFO("[SCMI] Support scmi_protocol_id:0x%x", scmi_protocol_id));

    scmi_ctx.scmi_protocol_id_to_idx[scmi_protocol_id] =
        (uint8_t)(protocol_idx + PROTOCOL_TABLE_RESERVED_ENTRIES_COUNT);
    protocol->message_handler = protocol_api->message_handler;
}
```

protocol 是scmi协议的module，首先绑定这个module拿到两个api

```
static struct mod_scmi_to_protocol_api scmi_reset_mod_scmi_to_protocol_api = {
    .get_scmi_protocol_id = scmi_reset_get_scmi_protocol_id,
    .message_handler = scmi_reset_message_handler
};
scmi_reset_get_scmi_protocol_id为获取协议id
/*!
 * \brief SCMI Reset Domain Protocol
 */
#define MOD_SCMI_PROTOCOL_ID_RESET_DOMAIN UINT32_C(0x16)

static int scmi_reset_get_scmi_protocol_id(fwk_id_t protocol_id,
                                           uint8_t *scmi_protocol_id)
{
    *scmi_protocol_id = MOD_SCMI_PROTOCOL_ID_RESET_DOMAIN;

    return FWK_SUCCESS;
}
```

## 4.3 scmi\_reset\_domain消息处理

协议模块负责处理reset相关的所有协议子命令，对于scmi\_reset\_domain一共支持6个子命令，如下：

```
enum scmi_command_id {
    MOD_SCMI_PROTOCOL_VERSION = 0x000,
    MOD_SCMI_PROTOCOL_ATTRIBUTES = 0x001,
    MOD_SCMI_PROTOCOL_MESSAGE_ATTRIBUTES = 0x002
};
enum scmi_reset_domain_command_id {
    MOD_SCMI_RESET_DOMAIN_ATTRIBUTES = 0x03,
    MOD_SCMI_RESET_REQUEST = 0x04,
    MOD_SCMI_RESET_NOTIFY = 0x05,
    MOD_SCMI_RESET_COMMAND_COUNT,
};
```

我们需要在协议模块scmi\_reset\_domain中，给这些命令设计处理函数如下：

```
static int (*msg_handler_table[])(fwk_id_t, const uint32_t *) = {
    [MOD_SCMI_PROTOCOL_VERSION] = protocol_version_handler,
    [MOD_SCMI_PROTOCOL_ATTRIBUTES] = protocol_attributes_handler,
    [MOD_SCMI_PROTOCOL_MESSAGE_ATTRIBUTES] =
         protocol_message_attributes_handler,
    [MOD_SCMI_RESET_DOMAIN_ATTRIBUTES] = reset_attributes_handler,
    [MOD_SCMI_RESET_REQUEST] = reset_request_handler,
#ifdef BUILD_HAS_SCMI_NOTIFICATIONS
    [MOD_SCMI_RESET_NOTIFY] = reset_notify_handler,
#endif
};
```

我们以为reset\_request\_handler例，进行说明

![](https://pic2.zhimg.com/v2-8aa9678ac121ee16b396d0e41de0e57b_1440w.jpg)

4.3.1 scmi\_reset\_domain中处理

```
static struct mod_scmi_to_protocol_api scmi_reset_mod_scmi_to_protocol_api = {
    .get_scmi_protocol_id = scmi_reset_get_scmi_protocol_id,
    .message_handler = scmi_reset_message_handler
};
```

scmi\_reset\_message\_handler（）函数中会根据命令id找到处理函数执行 msg\_handler\_table\[message\_id\](service\_id, payload); message\_id就是cmd id，payload就是协议携带的数据部分。

```
[MOD_SCMI_RESET_REQUEST] = reset_request_handler,
```

reset\_request\_handler中会解析payload，并对payload的数据大小进行校验，然后进行解析

```
struct scmi_reset_domain_request_a2p {
    uint32_t domain_id;
    uint32_t flags;
    uint32_t reset_state;
};

   params = *(const struct scmi_reset_domain_request_a2p *)payload;
   status = get_reset_device(service_id, params.domain_id, &reset_device);
    status = scmi_reset_domain_reset_request_policy(&policy_status,
        &mode, &reset_state, agent_id, params.domain_id);

    status = reset_api->set_reset_state(reset_device->element_id,
                                        mode,
                                        reset_state,
                                        (uintptr_t)agent_id);
```

reset\_api->set\_reset\_state是从HAL层拿到的api

### 4.3.2 reset-domain HAL层

```
/* HAL API */
static const struct mod_reset_domain_drv_api reset_api = {
    .set_reset_state = set_reset_state,
};

static int set_reset_state(fwk_id_t reset_dev_id,
                           enum mod_reset_domain_mode mode,
                           uint32_t reset_state,
                           uintptr_t cookie)
{
    struct rd_dev_ctx *reset_ctx;
    unsigned int reset_domain_idx = fwk_id_get_element_idx(reset_dev_id);
    FWK_LOG_INFO("[RESET DOMAIN] set_reset_state");

    reset_ctx = &module_reset_ctx.dev_ctx_table[reset_domain_idx];

    return reset_ctx->driver_api->set_reset_state(reset_ctx->config->driver_id,
                                                  mode, reset_state, cookie);
}
```

从driver层拿到api进行处理

### 4.3.3 juno-reset-domain驱动层

```
static struct mod_reset_domain_drv_api juno_reset_domain_drv_api = {
    .set_reset_state = juno_set_reset_state,
};

static int juno_set_reset_state(
    fwk_id_t dev_id,
    enum mod_reset_domain_mode mode,
    uint32_t reset_state,
    uintptr_t cookie)
{
    unsigned int domain_idx = fwk_id_get_element_idx(dev_id);
    dev_ctx = &module_juno_reset_ctx.dev_ctx_table[domain_idx];
    
    if (domain_idx == juno_RESET_DOMAIN_IDX_NPU) {
        status = handle_dev_reset_set_state(dev_ctx);
        if (status != FWK_SUCCESS) {
            return status;
        }
    } 

    return FWK_SUCCESS;
}
```

handle\_dev\_reset\_set\_state里面处理具体的硬件寄存器操作：

```
/* Helper functions */
static int handle_dev_reset_set_state(struct juno_reset_dev_ctx *dev_ctx)
{
    /* Reset device */
    dev_ctx->reset_state = DEVICE_STATE_RESET;
    *dev_config->reset_reg = 0;
    for (int j = 0; j < 10000; j++)
        ;
    *dev_config->reset_reg = 1;

    *dev_config->clkctl_reg = 1;

    dev_ctx->reset_state = DEVICE_STATE_NORMAL;
```

根据2.4章节中CRU硬件，这里需要对reset寄存器和clk寄存器进行写操作来实现其他硬件模块的reset功能。

## 5\. 硬件CRU设计

CRU（Clock & Reset Unit）位于SCP子系统中，受SCP软件控制，然后硬件信号会连接到其他子系统上，我们的SCP固件一般运行在ARM的M核心上，还有一堆外围的器件，例如NXP的imx8qm里面：

![](https://pic1.zhimg.com/v2-5a4d185b0cc17e7da65dafec2268e53c_1440w.jpg)

将clock gate信号和reset信号送给多个子系统（有时钟控制、reset控制等需求的子系统）。通过SCP软件来操作CRU的相关寄存器，从而实现对子系统时钟和复位信号的控制，

![](https://pic2.zhimg.com/v2-df9f59e68a25584e60434190b16e6aeb_1440w.jpg)

芯片手册会给出控制CRU的reset及clk的寄存器配置，操作响应的寄存器即可。

> 后记：  
> 本小节介绍比较详细，其实很多知识点都是相通的，例如SCMI、SCP、Mailbox、DTS这些东西，早晚都需要掌握，但是通过一个业务流程或者场景就可以学习到，本文就是一个了解这些知识的机会。

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

后续会继续更新，纯干货分析，欢迎分享给朋友，欢迎评论交流！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

发布于 2026-03-31 10:47・上海[25年毕业 ic还能入吗?](https://www.zhihu.com/question/600773376/answer/49206663649)

[我成都某双非院校的电子信息毕业生，现在在一家AI的公司专注于riscv cpu的验证工作，回想当初快毕业了，对自己...](https://www.zhihu.com/question/600773376/answer/49206663649)