---
title: "Linux驱动分析之SPI驱动架构"
source: "https://zhuanlan.zhihu.com/p/137401711"
author:
  - "[[young永个人公众号：嵌入式软件开发交流 高级软件工程师]]"
published:
created: 2026-05-02
description:
tags:
  - "clippings"
---
[收录于 · Linux驱动开发](https://www.zhihu.com/column/c_1134495265657528320)

4 人赞同了该文章

## SPI体系结构

**主要由三部分组成：**

**(1) SPI核心**

**(2) SPI控制器驱动**

**(3) SPI设备驱动**

**基本和I2C的架构差不多**

## 重要结构体

**内核版本：3.7.6**

- **spi\_master**
```c
//SPI控制器
struct spi_master {
  struct device  dev;

  struct list_head list; //控制器链表

   //控制器对应的SPI总线号 SPI-2 对应bus_num= 2
  s16      bus_num;
  u16      num_chipselect;//控制器支持的片选数量，即能支持多少个spi设备 
  u16      dma_alignment;//DMA缓冲区对齐方式
  u16      mode_bits;// mode标志

  /* other constraints relevant to this driver */
  u16      flags;
#define SPI_MASTER_HALF_DUPLEX  BIT(0)  /* can't do full duplex */
#define SPI_MASTER_NO_RX  BIT(1)    /* can't do buffer read */
#define SPI_MASTER_NO_TX  BIT(2)    /* can't do buffer write */

  // 并发同步时使用
  spinlock_t    bus_lock_spinlock;
  struct mutex    bus_lock_mutex;

  /* flag indicating that the SPI bus is locked for exclusive use */
  bool      bus_lock_flag;

    //设置SPI mode和时钟， 在spi_add_device中调用
  int      (*setup)(struct spi_device *spi);
    //传输数据函数, 实现数据的双向传输
  int      (*transfer)(struct spi_device *spi,
            struct spi_message *mesg);
  //注销时回调
  void      (*cleanup)(struct spi_device *spi);

  /*
   * These hooks are for drivers that want to use the generic
   * master transfer queueing mechanism. If these are used, the
   * transfer() function above must NOT be specified by the driver.
   * Over time we expect SPI drivers to be phased over to this API.
   */
  bool        queued;
  struct kthread_worker    kworker;
  struct task_struct    *kworker_task;
  struct kthread_work    pump_messages;
  spinlock_t      queue_lock;
  struct list_head    queue;
  struct spi_message    *cur_msg;
  bool        busy;
  bool        running;
  bool        rt;

  int (*prepare_transfer_hardware)(struct spi_master *master);
  int (*transfer_one_message)(struct spi_master *master,
            struct spi_message *mesg);
  int (*unprepare_transfer_hardware)(struct spi_master *master);
}
```
- **spi\_driver**
```c
//SPI驱动，和platform_driver,i2c_driver类似
struct spi_driver {
  const struct spi_device_id *id_table;
  int  (*probe)(struct spi_device *spi);
  int  (*remove)(struct spi_device *spi);
  void  (*shutdown)(struct spi_device *spi);
  int  (*suspend)(struct spi_device *spi, pm_message_t mesg);
  int  (*resume)(struct spi_device *spi);
  struct device_driver  driver;
};
```
- **spi\_device**
```c
//SPI 设备
struct spi_device {
  struct device    dev;
  struct spi_master  *master; //指向SPI控制器
  u32      max_speed_hz; //最大速率
  u8      chip_select; //片选
  u8      mode; //SPI设备模式，使用下面的宏
#define  SPI_CPHA  0x01      /* clock phase */
#define  SPI_CPOL  0x02      /* clock polarity */
#define  SPI_MODE_0  (0|0)      /* (original MicroWire) */
#define  SPI_MODE_1  (0|SPI_CPHA)
#define  SPI_MODE_2  (SPI_CPOL|0)
#define  SPI_MODE_3  (SPI_CPOL|SPI_CPHA)
#define  SPI_CS_HIGH  0x04      /* chipselect active high? */
#define  SPI_LSB_FIRST  0x08      /* per-word bits-on-wire */
#define  SPI_3WIRE  0x10      /* SI/SO signals shared */
#define  SPI_LOOP  0x20      /* loopback mode */
#define  SPI_NO_CS  0x40      /* 1 dev/bus, no chipselect */
#define  SPI_READY  0x80      /* slave pulls low to pause */
  u8      bits_per_word;
  int      irq;
  void      *controller_state; //控制器运行状态
  void      *controller_data; //特定板子为控制器定义的数据
  char      modalias[SPI_NAME_SIZE];

};
```
- **spi\_message**
```c
//SPI传输数据结构体
struct spi_message {
  struct list_head  transfers; // spi_transfer链表头

  struct spi_device  *spi; //spi设备

  unsigned    is_dma_mapped:1;

  //发送完成回调
  void      (*complete)(void *context);
  void      *context;
  unsigned    actual_length;
  int      status;

  /* for optional use by whatever driver currently owns the
   * spi_message ...  between calls to spi_async and then later
   * complete(), that's the spi_master controller driver.
   */
  struct list_head  queue;
  void      *state;
};
```
- **spi\_transfer**
```c
// 该结构体是spi_message下的子单元，
struct spi_transfer {
    
  const void  *tx_buf;// 发送的数据缓存区
  void    *rx_buf;// 接收的数据缓存区
  unsigned  len;

  dma_addr_t  tx_dma; //tx_buf的DMA地址
  dma_addr_t  rx_dma; //rx_buf的DMA地址

  unsigned  cs_change:1;
  u8    bits_per_word;
  u16    delay_usecs;
  u32    speed_hz;

  struct list_head transfer_list;
};
```

**总结上面结构体关系：**

**1\. spi\_driver和spi\_device**

spi\_driver对应一套驱动方法，包含probe,remove等方法。 **spi\_device对应真实的物理设备** ，每个spi设备都需要一个spi\_device来描述。spi\_driver与spi\_device是一对多的关系，一个spi\_driver上可以支持多个同类型的spi\_device。

**2\. spi\_master和spi\_device**

spi\_master 与 spi\_device 的关系和硬件上控制器与设备的关系一致，即spi\_device依附于spi\_master。

**3\. spi\_message和spi\_transfer**

spi传输数据是以 spi\_message 为单位的，我们需要传输的内容在 spi\_transfer 中。spi\_transfer是spi\_message的子单元。

1\. 将本次需要传输的 spi\_transfer 以 spi\_transfer->transfer\_list 为链表项，连接成一个transfer\_list链表，挂接在本次传输的spi\_message spi\_message->transfers链表下。

2\. 将所有等待传输的 spi\_message 以 spi\_message->queue 为链表项，连接成个链表挂接在queue下。

![](https://pic3.zhimg.com/v2-733d6b3bd0eabab05da195dffd9818d8_1440w.jpg)

## API函数

```c
//分配一个spi_master
struct spi_master *spi_alloc_master(struct device *dev, unsigned size)

//注册和注销spi_master
int spi_register_master(struct spi_master *master)
void spi_unregister_master(struct spi_master *master)

//注册和注销spi_driver
int spi_register_driver(struct spi_driver *sdrv)
void spi_unregister_driver(struct spi_driver *sdrv)

//初始化spi_message
void spi_message_init(struct spi_message *m)
//向spi_message添加transfers
void spi_message_add_tail(struct spi_transfer *t, struct spi_message *m)
//异步发送spi_message
int spi_async(struct spi_device *spi, struct spi_message *message)
//同步发送spi_message
int spi_sync(struct spi_device *spi, struct spi_message *message)

//spi同步写(封装了上面的函数)
int spi_write(struct spi_device *spi, const void *buf, size_t len)
//spi同步读(封装了上面的函数)
int spi_read(struct spi_device *spi, void *buf, size_t len)
//同步写并读取(封装了上面的函数)
int spi_write_then_read(struct spi_device *spi,
    const void *txbuf, unsigned n_tx,
    void *rxbuf, unsigned n_rx)
```

使用spi\_async()需要注意的是，在complete未返回前不要轻易访问你一提交的spi\_transfer中的buffer。也不能释放SPI系统正在使用的buffer。一旦你的complete返回了，这些buffer就又是你的了。

spi\_sync是同步的，spi\_sync提交完spi\_message后不会立即返回，会一直等待其被处理。一旦返回就可以重新使用buffer了。spi\_sync()调用了spi\_async()，并休眠直至complete返回。

上面的传输函数最终都是调用spi\_master的transfer()函数。

![](https://pic3.zhimg.com/v2-3a528712feb5c5b336e7f3f7f665c924_1440w.jpg)

更多精彩好文，关注微信公众号

发布于 2020-04-30 10:48[3分钟~带你详细了解PMP到底是什么？](https://zhuanlan.zhihu.com/p/697219145)

[

一、PMP是什么？PMP（Project Management Professional），指的是项目管理专业人士...

](https://zhuanlan.zhihu.com/p/697219145)