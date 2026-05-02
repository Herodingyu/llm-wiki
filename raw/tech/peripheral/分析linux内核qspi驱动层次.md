---
title: "分析linux内核qspi驱动层次"
source: "https://zhuanlan.zhihu.com/p/546293489"
author:
  - "[[精通Linux内核Linux内核技术交流群q群977878001欢迎大家进群]]"
published:
created: 2026-05-02
description: "linux qspi驱动是为了解决spi驱动异步操作的冲突问题，引入了\"队列化\"的概念。其基本的原理是把具体需要传输的message放入到队列中，启动一个内核线 程检测队列中是否有在等待的message，如果有则启动具体…"
tags:
  - "clippings"
---
linux qspi驱动是为了解决spi驱动异步操作的冲突问题，引入了" [队列化](https://zhida.zhihu.com/search?content_id=209531817&content_type=Article&match_order=1&q=%E9%98%9F%E5%88%97%E5%8C%96&zhida_source=entity) "的概念。其基本的原理是把具体需要传输的message放入到队列中，启动一个内核线

程检测队列中是否有在等待的message，如果有则启动具体的传输。

1 相关 [结构体](https://zhida.zhihu.com/search?content_id=209531817&content_type=Article&match_order=1&q=%E7%BB%93%E6%9E%84%E4%BD%93&zhida_source=entity) ：

一个SPI控制器对应一个spi\_master结构体，通过它和挂在对应控制器下面的flash进行通信。每一次传输由spi\_message来表示，spi\_message挂入到spi\_master

queue队列中，spi\_message又由多个传输片段 [spi\_transfer](https://zhida.zhihu.com/search?content_id=209531817&content_type=Article&match_order=1&q=spi_transfer&zhida_source=entity) 构成。

```
struct spi_master{
    struct device    dev;  // 控制器本身对应的设备

    struct list_head list; // 通过这个插槽把spi_master链入全局的spi_master_list，一个芯片内部可以有多个SPI控制器

    s16            bus_num; // 用于识别一个spi控制器，一个SOC或板子可以有多个spi控制器
                            // 该控制器对应的SPI总线编号(由0开始)

    /* chipselects will be integral to many controllers; some others
     * might use board-specific GPIOs.
     */
    u16            num_chipselect; // 该spi控制器支持多少个从芯片

    u16            dma_alignment;

    /* spi_device.mode flags understood by this controller driver */
    u16            mode_bits; // 工作模式

    /* bitmask of supported bits_per_word for transfers */
    u32            bits_per_word_mask;

    /* limits on transfer speed */
    u32            min_speed_hz;
    u32            max_speed_hz;

    /* other constraints relevant to this driver */
    u16            flags;

    /* lock and mutex for SPI bus locking */
    spinlock_t        bus_lock_spinlock;
    struct mutex        bus_lock_mutex;

    /* flag indicating that the SPI bus is locked for exclusive use */
    bool            bus_lock_flag;

    /* Setup mode and clock, etc (spi driver may call many times).
     *
     * IMPORTANT:  this may be called when transfers to another
     * device are active.  DO NOT UPDATE SHARED REGISTERS in ways
     * which could break those transfers.
     */
    int            (*setup)(struct spi_device *spi); // 设置spi控制器的参数

    /* 把message加入队列中,master的主要工作就是处理消息队列。选中一个芯片
     * 把数据传出去
     */
    int            (*transfer)(struct spi_device *spi,
                        struct spi_message *mesg);

    /* 释放master的回调函数 */
    void            (*cleanup)(struct spi_device *spi);

                       
    bool                queued;
    struct kthread_worker        kworker; // 
    struct task_struct        *kworker_task; // 具体的内核线程，用于处理kworker下面的每个work
    struct kthread_work        pump_messages; 
    spinlock_t            queue_lock;
    struct list_head        queue;  // 等待传输的消息队列
    struct spi_message        *cur_msg; // 当前正在处理的消息

    bool                cur_msg_mapped;
    struct completion               xfer_completion;
    size_t                max_dma_len;
    /* 用于准备硬件资源 */
    int (*prepare_transfer_hardware)(struct spi_master *master);
    /* 每个消息的原子传送回调函数 */
    int (*transfer_one_message)(struct spi_master *master,
                    struct spi_message *mesg);
    int (*prepare_message)(struct spi_master *master,
                   struct spi_message *message);
    
    /*
     * These hooks are for drivers that use a generic implementation
     * of transfer_one_message() provied by the core.
     */
    void (*set_cs)(struct spi_device *spi, bool enable);
    int (*transfer_one)(struct spi_master *master, struct spi_device *spi,
                struct spi_transfer *transfer);
    void (*handle_err)(struct spi_master *master,
               struct spi_message *message);

    /* gpio chip select */
    int            *cs_gpios;
}

struct spi_message { /* 一个多段的传输结构 */
    struct list_head    transfers; // 具体的传输片段

    struct spi_device    *spi; /* 这个传输放入具体设备的队列 */

    unsigned        is_dma_mapped:1;

    /* completion is reported through a callback */
    void            (*complete)(void *context); // 当所有的transfers传输完了以后会被调用到
    void            *context;
    unsigned        frame_length; // 所有片段的传输总数据
    unsigned        actual_length; // 已经传输的数据
    int            status;

    struct list_head    queue; /* 通过该字段把本结构体挂入到对应的master的queue中 */
    void            *state;
};

struct spi_transfer { /* 最小的传输单元 */

    const void    *tx_buf;
    void        *rx_buf;
    unsigned    len;    // rx tx buf字节总数

    dma_addr_t    tx_dma;
    dma_addr_t    rx_dma;
    struct sg_table tx_sg;
    struct sg_table rx_sg;

    unsigned    cs_change:1;
    unsigned    tx_nbits:3;
    unsigned    rx_nbits:3;

    u8        bits_per_word; // 0 默认  非0 
    u16        delay_usecs;
    u32        speed_hz;

    struct list_head transfer_list; // 通过这个挂入到 spi_message中
};
```

> **【文章福利】** 小编推荐自己的Linux内核技术交流群： **【977878001】** 整理一些个人觉得比较好得学习书籍、视频资料共享在群文件里面，有需要的可以自行添加哦！！！前100进群领取，额外赠送一份 **价值699的内核资料包** （含视频教程、电子书、实战项目及代码）

![](https://picx.zhimg.com/v2-5416593596ebd061dc704d87bc74a91b_1440w.jpg)

**内核资料直通车：** [Linux内核源码技术学习路线+视频教程代码资料](https://link.zhihu.com/?target=https%3A//docs.qq.com/doc/DUGZVQk1qWVBHTEl3)

**学习直通车：** [Linux内核源码/内存调优/文件系统/进程管理/设备驱动/网络协议栈-学习视频教程-腾讯课堂](https://link.zhihu.com/?target=https%3A//ke.qq.com/course/4032547%3FflowToken%3D1043695)

画出spi\_master结构体和spi\_message以及spi\_transfer结构体的关系如图1所示：

![](https://pic2.zhimg.com/v2-64c167ac3b70184b1a1d7ebd5e478169_1440w.jpg)

2 驱动层次

```
static struct platform_driver zynqmp_qspi_driver = { /* 平台驱动 */
    .probe = zynqmp_qspi_probe,
    .remove = zynqmp_qspi_remove,
    .driver = {   /* struct device_driver driver; */
        .name = "zynqmp-qspi",
        .of_match_table = zynqmp_qspi_of_match,
        .pm = &zynqmp_qspi_dev_pm_ops,
    },
};
struct bus_type platform_bus_type = { /* 平台总线类型 */
    .name       = "platform",
    .dev_groups = platform_dev_groups,
    .match      = platform_match,
    .uevent     = platform_uevent,
    .pm     = &platform_dev_pm_ops,
};
 
/* 注册平台驱动 */
__platform_driver_register(struct platform_driver *drv, struct module *owner) // drivers/base/platform.c
    drv->driver.bus = &platform_bus_type; // 注意是平台总线
    drv->driver.probe = platform_drv_probe; // 平台驱动探测函数
    driver_register(&drv->driver) // 注册驱动
        driver_find(drv->name, drv->bus); // .name = "zynqmp-qspi", &platform_bus_type; 看是否已经注册过了同名的驱动
        ret = bus_add_driver(drv);
            driver_attach(struct device_driver *drv)
                bus_for_each_dev(drv->bus, NULL, drv, __driver_attach); /* 通过bus设备下面的设备列表进行匹配 */
 
__driver_attach(struct device *dev, void *data) // data = device_driver
    struct device_driver *drv = data;
    driver_match_device(drv, dev)  // 匹配上了才会往下走！！！！！！！！！！！！！否则直接去匹配下一个可能的设备
        return drv->bus->match ? drv->bus->match(dev, drv) : 1 /* 调用bus下面的match函数， 既platform_match函数,
                                                                  主要通过platform_driver下面的id_table以及名字匹配*/
    /* 至此已经找到了设备 */                                                            
　　if (!dev->driver) // 还未绑定驱动，调用probe函数把驱动和设备绑定到一起
        driver_probe_device(drv, dev);
            really_probe(dev, drv);
                if (dev->bus->probe) {
                        ret = dev->bus->probe(dev); // 未设置， 为空
                } else if (drv->probe) {
                    ret = drv->probe(dev); // 走这个分支，为之前设置的platform_drv_probe
                }
     
platform_drv_probe(struct device *_dev)
    struct platform_driver *drv = to_platform_driver(_dev->driver); // 获取宿主结构体 platform_driver zynqmp_qspi_driver
    ret = drv->probe(dev); // 调用zynqmp_qspi_probe函数
     
zynqmp_qspi_probe  // 实际上是匹配控制器对应的设备
    struct spi_master *master;
    struct device *dev = &pdev->dev;
    master = spi_alloc_master(&pdev->dev, sizeof(*xqspi)); // 分配master空间，设置num_chipselect bus_num
    master->dev.of_node = pdev->dev.of_node; // 应该是dtb里面的spi控制器对应的节点？？？
    设置时钟，使能时钟 以及控制器zynqmp_qspi_init_hw(xqspi); 获取终端资源
    设置master的变量setup  set_cs transfer_one prepare_transfer_hardware unprepare_transfer_hardware max_speed_hz bits_per_word_mask mode_bits
    spi_register_master(master); // 注册master
        设置num_chipselect bus_num
        INIT_LIST_HEAD(&master->queue); /* 初始化master下面的message队列 */
        spin_lock_init(&master->queue_lock);
        dev_set_name(&master->dev, "spi%u", master->bus_num);
        status = device_add(&master->dev); // 把设备加入到系统中，平台总线上？？
        spi_master_initialize_queue(master); // 初始化队列
            master->transfer = spi_queued_transfer;
            master->transfer_one_message = spi_transfer_one_message;
            ret = spi_init_queue(master); /* 初始化和启动工作队列 */
                /* 启动一个内核线程，该线程工作对象为工作队列master->kworker,工作函数为kthread_worker_fn，后面会介绍 */
                master->kworker_task = kthread_run(kthread_worker_fn, &master->kworker, "%s", dev_name(&master->dev));
                /* 初始化工作实例master->pump_messages, 其回调的函数为spi_pump_messages */
                init_kthread_work(&master->pump_messages, spi_pump_messages);
            master->queued = true;
            ret = spi_start_queue(master);
                /* 把工作实例master->pump_messages挂入到工作队列master->kworker中 */
                queue_kthread_work(&master->kworker, &master->pump_messages);
        list_add_tail(&master->list, &spi_master_list); // 把master挂入总的链表spi_master_list
        of_register_spi_devices(master); // 注册spi控制器设备下面的子设备，这个时候才开始设置spi设备下面的flash芯片
            for_each_available_child_of_node(master->dev.of_node, nc) {
                spi = of_register_spi_device(master, nc);
                    struct spi_device *spi = spi_alloc_device(master);
                        spi->master = master;   // 将flash设备和master控制器连接到一起
                        spi->dev.parent = &master->dev; // 父设备为spi控制器
                        spi->dev.bus = &spi_bus_type;  // 明确挂入到了spi_bus下面
                    of_modalias_node(nc, spi->modalias, sizeof(spi->modalias)); // 通过dtb里面的compatible获取驱动
                    rc = of_property_read_u32(nc, "reg", &value); // 通过dtb里面的reg条目获取设备的地址，既对应的片选片选
                    spi->chip_select = value;  // 选中或者不选中对应的芯片
                    //获取 spi-rx-bus-width spi-tx-bus-width spi-max-frequency 等芯片级的信息并且设置
                    of_property_read_u32(nc, "spi-max-frequency", &value);
                    spi->max_speed_hz = value;
                    rc = spi_add_device(spi); // 注册spi设备
                        bus_for_each_dev(&spi_bus_type, NULL, spi, spi_dev_check); // 通过spi->chip_select spi->master来匹配
                        spi->cs_gpio = master->cs_gpios[spi->chip_select]; // 设置本芯片为master的哪个片选
                        spi_setup(spi); // 设置spi设备
                            status = spi->master->setup(spi);  // 调用spi_master 的 setup函数
                            spi_set_cs(spi, false); // 禁止片选
                        device_add(&spi->dev); // 加入设备，匹配具体的驱动
                            error = bus_add_device(dev);
                            bus_probe_device(dev);
                                device_initial_probe(dev);
                                    __device_attach(dev, true);
                                        bus_for_each_drv(dev->bus, NULL, &data, __device_attach_driver);
                                            driver_probe_device(drv, dev);
                                                really_probe(dev, drv);
                                                    if (dev->bus->probe) {
                                                        ret = dev->bus->probe(dev);
                                                    } else if (drv->probe) {
                                                        ret = drv->probe(dev); // m25p_probe
                                                    }
m25p_probe                             
    ret = spi_nor_scan(nor, flash_name, mode); // 建立  spi-nor   mtd   芯片的工作模式 dummy  扇区等
    return mtd_device_parse_register(&nor->mtd, NULL, &ppdata,
            data ? data->parts : NULL,
            data ? data->nr_parts : 0); // 注册mtd分区
```

继续分析剩下的函数kthread\_worker\_fn和spi\_pump\_messages

```
int kthread_worker_fn(void *worker_ptr)
    struct kthread_worker *worker = worker_ptr; // 为设置的master->kworker
    struct kthread_work *work;
repeat:
    if (!list_empty(&worker->work_list)) {
        /* 工作队列下面的work_list不为空，则取出工作实例 */
        work = list_first_entry(&worker->work_list,
                    struct kthread_work, node);
        list_del_init(&work->node); // 从工作队列中摘下具体的实例
    }
    worker->current_work = work;
    work->func(work); // 调用工作实例下面的func执行,func为spi_pump_messages
    goto repeat;
    
spi_pump_messages
    /* 取出queue下面的message,赋给master->cur_msg */
    master->cur_msg = list_first_entry(&master->queue, struct spi_message, queue);
    list_del_init(&master->cur_msg->queue);
    ret = master->prepare_transfer_hardware(master); // 准备硬件资源
    ret = master->transfer_one_message(master, master->cur_msg); // 传输
```

补齐最后的数据构造以及上传到queue以及处理过程：

```
struct kthread_worker  kworker; // 每个spi控制器上都有的一个工作队列
struct kthread_worker {
    spinlock_t        lock;                // 自旋锁
    struct list_head    work_list;       // 工作队列上的工作实例队列
    struct task_struct    *task;           // 具体执行数据传输的进程        
    struct kthread_work    *current_work;   // 工作队列当前正在处理的工作实例
};

struct task_struct        *kworker_task;   // 处理工作队列的线程

struct kthread_work pump_messages;
struct kthread_work {
    struct list_head    node;     // 通过node把work挂入到工作队列中
    // 当调度到本work时执行的回调函数，具体为spi_pump_messages
    kthread_work_func_t    func;     // void (*kthread_work_func_t)(struct kthread_work *work);
    struct kthread_worker    *worker;  // 具体属于的工作队列
};

// spi读len个数据到buf中，spi为具体要进行数据传输的设备
static inline int
spi_read(struct spi_device *spi, void *buf, size_t len) 
    // 构造spi_transfer结构体
    struct spi_transfer    t = {
            .rx_buf        = buf,
            .len        = len,
        };
    struct spi_message    m;
    
    spi_message_add_tail(&t, &m);// 把spi_transfer挂入到spi_message中
    return spi_sync(spi, &m);
        __spi_sync(spi, message, 0);
            struct spi_master *master = spi->master; // 获取到spi控制器，在初始化的时候就确定了
            message->spi = spi; // 把message和具体的spi设备挂钩
            status = __spi_queued_transfer(spi, message, false);
                list_add_tail(&msg->queue, &master->queue); // 把message挂入到master的queue中
            __spi_pump_messages(master, false); // 对message进行"抽取"
                // 把master->pump_messages工作实例挂入到master->kworker中，唤醒内核线程处理queue里面的message
                queue_kthread_work(&master->kworker, &master->pump_messages);
                return;
            wait_for_completion(&done); // 等待传输完成
            status = message->status;
            return status;

// 异步传输spi数据，主要是利用master->transfer函数进行处理
int spi_async(struct spi_device *spi, struct spi_message *message)
    ret = __spi_async(spi, message);
        return master->transfer(spi, message);
    return ret;数据的写流程和读基本一致！！
```

qspi驱动的基本流程如图2所示，红色的步骤表示数据的构造以及处理过程。

![](https://pic4.zhimg.com/v2-39b277eaed202aa63ec79fd03d984e55_1440w.jpg)

```
原文链接：https://www.cnblogs.com/samdyhc/p/9311387.html
```
![动图封面](https://pic1.zhimg.com/v2-e63f2abfb4447b02362e7c1fc8892076_b.jpg)

![动图封面](https://pic3.zhimg.com/v2-da564508fa41f8a1eeea932ff5246280_b.jpg)

发布于 2022-07-26 14:52[VMware 替代专题 | VMware 超融合国产替代之性能对比篇](https://zhuanlan.zhihu.com/p/569039543)

[

2024 最新资料：文章：VMware 替代专题｜博通收购 VMware 后的订阅策略、产品组合调整，以及不同用户...

](https://zhuanlan.zhihu.com/p/569039543)