---
title: "Linux驱动之I2C驱动架构"
source: "https://zhuanlan.zhihu.com/p/81873821"
author:
  - "[[young永个人公众号：嵌入式软件开发交流 高级软件工程师]]"
published:
created: 2026-05-02
description: "一、Linux的I2C体系结构 主要由三部分组成： (1) I2C核心提供I2C控制器和设备驱动的注册和注销方法，I2C通信方法，与适配器无关的代码以及探测设备等。 (2) I2C控制器驱动(适配器) (3) I2C设备驱动 二、重要的结构…"
tags:
  - "clippings"
---
[收录于 · Linux驱动开发](https://www.zhihu.com/column/c_1134495265657528320)

16 人赞同了该文章

## 一、Linux的I2C体系结构

**主要由三部分组成：**

**(1) I2C核心**

提供 [I2C控制器](https://zhida.zhihu.com/search?content_id=106323588&content_type=Article&match_order=1&q=I2C%E6%8E%A7%E5%88%B6%E5%99%A8&zhida_source=entity) 和设备驱动的注册和注销方法，I2C通信方法，与适配器无关的代码以及探测设备等。

**(2) I2C控制器驱动(适配器)**

**(3) [I2C设备驱动](https://zhida.zhihu.com/search?content_id=106323588&content_type=Article&match_order=1&q=I2C%E8%AE%BE%E5%A4%87%E9%A9%B1%E5%8A%A8&zhida_source=entity)**

![](https://pica.zhimg.com/v2-783c76276f99886247bb0cd9c1a25d50_1440w.jpg)

## 二、重要的结构体

- **i2c\_adapter**
```c
//i2c控制器(适配器)
struct i2c_adapter {
    struct module *owner;
    unsigned int class;          /* classes to allow probing for */
    const struct i2c_algorithm *algo; /* 总线通信结构体指针 */
    void *algo_data; //algorithm数据

    /* data fields that are valid for all devices    */
    //并发同步，互斥锁
    const struct i2c_lock_operations *lock_ops;
    struct rt_mutex bus_lock;
    struct rt_mutex mux_lock;

    int timeout;            /* in jiffies */
    int retries; //重试次数
    struct device dev;        /* the adapter device */

    int nr;
    char name[48]; //适配器名称
    struct completion dev_released;

    struct mutex userspace_clients_lock;
    struct list_head userspace_clients; //client链表

    struct i2c_bus_recovery_info *bus_recovery_info;
    const struct i2c_adapter_quirks *quirks;

    struct irq_domain *host_notify_domain;
};
```
- **i2c\_algorithm**
```c
//I2C传输方法
struct i2c_algorithm {
    //i2c传输函数指针
    int (*master_xfer)(struct i2c_adapter *adap, struct i2c_msg *msgs,
               int num);
    //smbus传输函数指针  
    int (*smbus_xfer) (struct i2c_adapter *adap, u16 addr,
               unsigned short flags, char read_write,
               u8 command, int size, union i2c_smbus_data *data);

    //返回适配器支持的功能
    u32 (*functionality) (struct i2c_adapter *);
 
//作为从机时使用
#if IS_ENABLED(CONFIG_I2C_SLAVE)
    int (*reg_slave)(struct i2c_client *client);
    int (*unreg_slave)(struct i2c_client *client);
#endif
};
```

[SMBus](https://zhida.zhihu.com/search?content_id=106323588&content_type=Article&match_order=1&q=SMBus&zhida_source=entity) 是基于I2C总线规范的，所以上面的传输函数要根据自己的总线来选择，选择其一就可以。

- **i2c\_driver**
```c
//I2C驱动，和platform_driver,spi_driver类似
struct i2c_driver {
    unsigned int class;

    /* Standard driver model interfaces */
    int (*probe)(struct i2c_client *, const struct i2c_device_id *);
    int (*remove)(struct i2c_client *);

    int (*probe_new)(struct i2c_client *);
    void (*shutdown)(struct i2c_client *);
    void (*alert)(struct i2c_client *, enum i2c_alert_protocol protocol,
              unsigned int data);
    int (*command)(struct i2c_client *client, unsigned int cmd, void *arg);

    struct device_driver driver;
    const struct i2c_device_id *id_table; //该设备所支持的设备ID表

    /* Device detection callback for automatic device creation */
    int (*detect)(struct i2c_client *, struct i2c_board_info *);
    const unsigned short *address_list;
    struct list_head clients; //client链表

    bool disable_i2c_core_irq_mapping;
};
```
- **i2c\_client**
```c
//I2C设备
struct i2c_client {
    unsigned short flags;        //标志
    unsigned short addr;        //芯片地址，保存在addr低7位
    char name[I2C_NAME_SIZE];       //设备名称
    struct i2c_adapter *adapter;    //依附的i2c_adapter
    struct device dev;        //设备结构体
    int irq;            //设备使用的中断号
    struct list_head detected;      //client链表，和i2c_driver中clients的一样
#if IS_ENABLED(CONFIG_I2C_SLAVE)
    i2c_slave_cb_t slave_cb;    //从机模式回调
#endif
};
```
- **i2c\_msg**
```c
//I2C传输数据结构体，代表一个消息数据
struct i2c_msg {
    __u16 addr;    //设备地址
    __u16 flags;    //标志
#define I2C_M_RD        0x0001    /* read data, from slave to master */
                    /* I2C_M_RD is guaranteed to be 0x0001! */
#define I2C_M_TEN        0x0010    /* this is a ten bit chip address */
#define I2C_M_DMA_SAFE    0x0200    /* the buffer of this message is DMA safe */
                    /* makes only sense in kernelspace */
                    /* userspace buffers are copied anyway */
#define I2C_M_RECV_LEN    0x0400    /* length will be first received byte */
#define I2C_M_NO_RD_ACK    0x0800    /* if I2C_FUNC_PROTOCOL_MANGLING */
#define I2C_M_IGNORE_NAK    0x1000    /* if I2C_FUNC_PROTOCOL_MANGLING */
#define I2C_M_REV_DIR_ADDR    0x2000    /* if I2C_FUNC_PROTOCOL_MANGLING */
#define I2C_M_NOSTART    0x4000    /* if I2C_FUNC_NOSTART */
#define I2C_M_STOP        0x8000    /* if I2C_FUNC_PROTOCOL_MANGLING */
    __u16 len;        //消息长度
    __u8 *buf;        //消息数据
};
```

**总结上面结构体关系：**

**1\. i2c\_adapter和i2c\_algorithm**

i2c\_adapter对应物理上的一个适配器，而i2c\_algorithm对应一套通信方法，适配器需要通过i2c\_algorithm提供的通信函数来产生对应的访问时序。所以i2c\_adapter中包含i2c\_algorithm的指针。

i2c\_algorithm使用master\_xfer()来产生I2C时序，以i2c\_msg为单位，i2c\_msg代表一次传输的数据。

**2\. i2c\_driver和i2c\_client**

i2c\_driver对应一套驱动方法，包含probe,remove等方法。 **i2c\_clent对应真实的物理设备** ，每个i2c设备都需要一个i2c\_client来描述。i2c\_driver与i2c\_client是一对多的关系，一个i2c\_driver上可以支持多个同类型的i2c\_client。

**3\. i2c\_adapter和i2c\_client**

i2c\_adapter与i2c\_client的关系和硬件上适配器与设备的关系一致，即i2c\_client依附于i2c\_adapter。一个适配器可以连接多个设备，所以i2c\_adapter中包含i2c\_client的链表。

## 三、API函数

```c
//增加/删除i2c_adapter
int i2c_add_adapter(struct i2c_adapter *adapter)
void i2c_del_adapter(struct i2c_adapter *adap)

//增加/删除i2c_driver
int i2c_register_driver(struct module *owner, struct i2c_driver *driver)
void i2c_del_driver(struct i2c_driver *driver)
#define i2c_add_driver(driver) \
    i2c_register_driver(THIS_MODULE, driver)
 
//i2c传输、发送和接收
//完成I2C总线和I2C设备之间的一定数目的I2C message交互
int i2c_transfer(struct i2c_adapter *adap, struct i2c_msg *msgs, int num)
//通过封装i2c_transfer()完成一次I2c发送操作
int i2c_master_send(const struct i2c_client *client,
                  const char *buf, int count) 
//通过封装i2c_transfer()完成一次I2c接收操作      
int i2c_master_recv(const struct i2c_client *client,
                  char *buf, int count)
```

i2c\_transfer()函数本身不具备驱动适配器物理硬件以完成消息交互的能力，它只是寻找到与i2c\_adapter对应的i2c\_algorithm, 并使用i2c\_algorithm的master\_xfer()函数真正驱动硬件流程。

追踪i2c\_transfer()的源码会发现下面的代码

```c
for (ret = 0, try = 0; try <= adap->retries; try++) {
    ret = adap->algo->master_xfer(adap, msgs, num); //真正发送的函数
    if (ret != -EAGAIN)
    break;
    if (time_after(jiffies, orig_jiffies + adap->timeout))
    break;
}
```

## 四、适配器(控制器)驱动

由于I2C控制器通常是在内存上的，所以它本身也连接在platform总线上的，通过platform\_driver和platform\_device的匹配还执行。

**(1) probe()完成如下工作：**

- 初始化I2C控制器所使用的硬件资源，如申请IO地址，中断号，时钟等。
- 为特定I2C控制器实现通信方法，主要是实现i2c\_algorithm的 **master\_xfer** ()和 **functionality** ()函数。
- 通过i2c\_add\_adapter()添加i2c\_adapter的数据结构(i2c\_adapter成员已被初始化)。

**模板代码：**

```c
static const struct i2c_algorithm xxx_i2c_algo = {
    .master_xfer    = xxx_i2c_master_xfer,
    .functionality    = xxx_i2c_func,
};

static u32 xxx_i2c_func(struct i2c_adapter *adap)
{
    return I2C_FUNC_I2C | I2C_FUNC_10BIT_ADDR |
        (I2C_FUNC_SMBUS_EMUL & ~I2C_FUNC_SMBUS_QUICK) |
        I2C_FUNC_SMBUS_BLOCK_DATA;
}

static int xxx_i2c_master_xfer(struct i2c_adapter *adap, struct i2c_msg *msgs,
                int num)
{
    int ret, ;
    u32 reg;
    struct xxx_i2c *id = adap->algo_data;

    /* Process the msg one by one */
    for (i = 0; i < num; i++, msgs++) {
        i2c_adapter_xxx_start(); /*产生开始位*/
        /*是读消息*/
        if (msgs[i]->flags &I2C_M_RD)
        {
            i2c_adapter_xxx_setaddr((msg->addr << 1) | 1); /*发送从设备读地址*/
            i2c_adapter_xxx_wait_ack(); /*获得从设备的ack*/
            i2c_adapter_xxx_readbytes(msgs[i]->buf, msgs[i]->len); /*读取msgs[i]->len长的数据到msgs[i]->buf*/
        }
        else/*是写消息*/
        {
            i2c_adapter_xxx_setaddr(msg->addr << 1); /*发送从设备写地址*/
            i2c_adapter_xxx_wait_ack(); /*获得从设备的ack*/
            i2c_adapter_xxx_writebytes(msgs[i]->buf, msgs[i]->len); /*读取msgs[i]->len长的数据到msgs[i]->buf*/
        }
    }
    i2c_adapter_xxx_stop(); /*产生停止位*/
    return num;
}

static int xxx_i2c_probe(struct platform_device *pdev)　　// dts里的设备信息传递进来了
{
    struct resource *r_mem;
    struct xxx_i2c *id;
    int ret;

    id = devm_kzalloc(&pdev->dev, sizeof(*id), GFP_KERNEL);
    if (!id)
        return -ENOMEM;
    platform_set_drvdata(pdev, id);

　　 xxx_adapter_hw_init();　　　　//通常初始化iic适配器使用的硬件资源，如申请IO地址、中断号、时钟等
    id->adap.dev.of_node = pdev->dev.of_node;
    id->adap.algo = &xxx_i2c_algo;　　// 把altorithm连进来
    id->adap.timeout = XXX_I2C_TIMEOUT;
    id->adap.retries = 3;        /* Default retry value. */
    id->adap.algo_data = id;
    id->adap.dev.parent = &pdev->dev;

    ret = i2c_add_adapter(&id->adap);
    ...
}

static int xxx_i2c_remove(struct platform_device *pdev)
{
    struct xxx_i2c *id = platform_get_drvdata(pdev);

    i2c_del_adapter(&id->adap);
    xxx_adapter_hw_free();            // 硬件相关资源的free

    return 0;
}

static const struct of_device_id xxx_i2c_of_match[] = {
    { .compatible = "cdns,i2c-r1p10", },　　　　　　　　　　
    { /* end of table */ }
};
MODULE_DEVICE_TABLE(of, xxx_i2c_of_match);

static struct platform_driver xxx_i2c_drv = {
    .driver = {
        .name  = DRIVER_NAME,
        .owner = THIS_MODULE,
        .of_match_table = xxx_i2c_of_match,　　　　// dts匹配的依据
        .pm = &xxx_i2c_dev_pm_ops,
    },
    .probe  = xxx_i2c_probe,
    .remove = xxx_i2c_remove,
};

module_platform_driver(xxx_i2c_drv);
```

**xxx\_adapter\_hw\_init** 实现和具体的CPU和I2C控制器硬件相关的初始化。

**functionality()** 函数比较简单，返回支持的通信协议。

**master\_xfer()** 函数在适配器上完成i2c\_msg的数据传输。

## 五、设备(外设)驱动

i2c\_dirver就是i2c标准总线设备驱动模型中的驱动部分，i2c\_client可理解为i2c总线上挂的外设。

**模板代码：**

```c
static struct i2c_driver xxx_driver = {
    .driver = {
        .name = "xxx",
        .of_match_table = xxx_of_match,
        .acpi_match_table = ACPI_PTR(xxx_acpi_ids),
    },
    .probe_new = xxx_probe,
    .remove = xxx_remove,
    .id_table = xxx_ids,
};

static int __init xxx_init(void)
{
    .......
    return i2c_add_driver(&xxx_driver);　　// 匹配后，driver中的probe就能执行
}
static void __exit xxx_exit(void)
{
    i2c_del_driver(&xxx_driver);
}
module_exit(xxx_exit);
module_init(xxx_init);
```
![](https://picx.zhimg.com/v2-cfdd6b2f4253dc4f772be233abc0f893_1440w.jpg)

欢迎大家关注微信公众号

编辑于 2019-09-09 22:24[告别加班！用Wyn BI模板复用，5分钟搞定原来1天的活，新手秒变看板大神](https://zhuanlan.zhihu.com/p/1979862684024463789)

[

大家有没有经历过这种绝望？下午快下班时，老板拍拍你说：“小王，明早我要看到一个销售数据分析看板，要直观，要专业！”。 你看着空白的看板工具界面，脑海里已经开始盘算：连接数据源、...

](https://zhuanlan.zhihu.com/p/1979862684024463789)