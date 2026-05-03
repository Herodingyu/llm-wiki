---
title: "ARM SCP入门-AP与SCP通信"
source: "https://zhuanlan.zhihu.com/p/2025243691153924224"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "SoC上有很多核，ATF和Linux占据了A核，SCP占据了一个M核，当遇到Linux没有权限的事情的时候（SMC进入EL3转PSCI协议，例如电源管理），就需要给SCP打报告，SCP审批完批条子后去执行。这其中涉及到了异构核间通信，…"
tags:
  - "clippings"
---
[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679)

5 人赞同了该文章

![](https://pic2.zhimg.com/v2-3ff766d8d2bf79d7fd19490ac061464d_1440w.jpg)

**SoC** 上有很多核，ATF和Linux占据了 **A核** ，SCP占据了一个 **M核** ，当遇到Linux没有权限的事情的时候（ **SMC** 进入 [EL3](https://zhida.zhihu.com/search?content_id=272743065&content_type=Article&match_order=1&q=EL3&zhida_source=entity) 转 **PSCI** 协议，例如电源管理），就需要给SCP **打报告** ，SCP审批完 **批条子** 后去执行。这其中涉及到了 **异构核间通信** ，估计第一时间会想到 **[mailbox](https://zhida.zhihu.com/search?content_id=272743065&content_type=Article&match_order=1&q=mailbox&zhida_source=entity)** ，不过mailbox算是一个 **传输层** ，面向的是bit位数据的传输，可以把这些传输数据组织成一个 **协议层** ，在AP与SCP的核间通信中那就是 **SCMI** 。

**1\. SMC系统调用与 [PSCI协议](https://zhida.zhihu.com/search?content_id=272743065&content_type=Article&match_order=1&q=PSCI%E5%8D%8F%E8%AE%AE&zhida_source=entity)**

![](https://pic3.zhimg.com/v2-21b3f6a9e7debaa30d61782f8dd133b8_1440w.jpg)

当Linux想要关机或者休眠的时候，这涉及到整个系统电源状态的变化，为了 **安全性** Linux内核没有权利去直接执行了，需要陷入到 **EL3等级** 去执行，可以参考之前文章 [ARM ATF入门-安全固件软件介绍和代码运行](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247484384%26idx%3D1%26sn%3Dc6a2c66b967a28f8f46430263bad7df6%26chksm%3Dfa5285c4cd250cd27a333f15bfcef80e8a8f92ac9afe8ac766f93e75a0dbc7500de2d4df0eff%26scene%3D21%23wechat_redirect) ，在EL3中处理的程序是 **BL31** ，把SMC系统调用的参数转化为PSCI协议去执行，这时如果有SCP那A核就憋屈了，自己没权利执行需要通过 **SCMI** 协议上报给SCP了。这就是整个过程的软件协议栈如上图中：

- **用户层** ：首先用户发起的一些操作，通过用户空间的各service处理，会经过内核提供的sysfs，操作cpu hotplug、device pm、EAS、IPA等。
- **内核层** ：在linux内核中，EAS（energy aware scheduling）通过感知到当前的负载及相应的功耗，经过cpu  
	idle、cpu dvfs及调度选择idle等级、cpu频率及大核或者小核上运行。IPA（intrlligent power allocation）经过与EAS的交互，做热相关的管理。
- **ATF层** ：Linux kernel中发起的操作，会经过电源状态协调接口（Power State Coordination Interface，简称PSCI），由操作系统无关的framework（ARM Trusted Firmware，简称ATF）做相关的处理后，通过系统控制与管理接口（System Control and Management Interface，简称SCMI），向系统控制处理器（system control  
	processor，简称SCP）发起低功耗操作。
- **SCP层** ：SCP（系统控制处理器system control processor）最终会控制芯片上的sensor、clock、power domain、及板级的pmic做低功耗相关的处理。

**总结：用户进程 --sysfs--> 内核（EAS、IPA）--PSCI--> ATF --SCMI-->SCP --LPI--> 功耗输出器件**

**1.1 [SMC指令](https://zhida.zhihu.com/search?content_id=272743065&content_type=Article&match_order=1&q=SMC%E6%8C%87%E4%BB%A4&zhida_source=entity)**

上面看完有一个整体的认识，下面进入正题，先介绍下什么是SMC指令，为什么走SMC就是 **安全通道** ，Linux直接给SCP通信就是 **非安全通道** ，这两种通道怎么去区分？

首先看SMC规范，ARM官方文档地址：

[developer.arm.com/docum](https://link.zhihu.com/?target=https%3A//developer.arm.com/documentation/den0028/latest)

《DEN0028E\_SMC\_Calling\_Convention\_1.4》本文档定义了一种通用的调用机制，可与Armv7和Armv8架构中的安全监视器调用（ **SMC** ）和系统监控程序调用（ **HVC** ）指令一起使用。

SMC指令用于生成一个同步异常，该异常由运行在EL3中的安全监视器代码处理。参数和返回值将在寄存器中传递。在由安全监视器处理之后，由指令产生的调用可以传递到受信任的操作系统或安全软件堆栈中的其他实体。

HVC指令用于生成由在 **EL2** 中运行的管理程序处理的同步异常。参数和返回值将在寄存器中传递。管理程序还可以捕获由客户操作系统（在EL1）发出的SMC调用，这允许适当地模拟、传递或拒绝调用。

本规范旨在简化集成和减少软件层之间的碎片化，例如操作系统、系统管理程序、受信任的操作系统、安全监视器和系统固件。具体的各种定义可以自己看手册，我们在Linux代码中执行smc调用的时候的函数例如 **关机** 为：

```
#define PSCI_0_2_FN_BASE   0x84000000
#define PSCI_0_2_FN(n) (PSCI_0_2_FN_BASE + (n))
#define PSCI_0_2_FN_SYSTEM_OFF PSCI_0_2_FN(8)
static void psci_sys_poweroff(void)
{
  invoke_psci_fn(PSCI_0_2_FN_SYSTEM_OFF, 0, 0, 0);
}
```

PSCI\_0\_2\_FN\_SYSTEM\_OFF的值计算为：0x84000000+8,在规范的表6-2：分配给不同服务的功能标识符的子范围中，

![](https://pic1.zhimg.com/v2-1f94779c3bfcea8e0591538f0c3803d6_1440w.jpg)

表中的各种功能就是走安全通道的，不是SMC或者HVC命令的功能就是非安全通道的，当然也可以根据自己的 **需求** 选择，一般 **PSCI协议** 中的功能都是走安全通道。

**1.2 PSCI协议**

PSCI协议官方地址：

[developer.arm.com/docum](https://link.zhihu.com/?target=https%3A//developer.arm.com/documentation/den0022/d/)

《Power\_State\_Coordination\_Interface\_PDD\_v1\_1\_DEN0022D》

本文档定义了一个 **电源管理** 的标准接口，操作系统供应商可用于在ARM设备上使用不同特权级别的监控软件。该接口旨在在以下电源管理场景中代码通用化：

- 内核空闲管理。
- 动态添加和删除核心，以及辅助核心引导。
- 系统关闭和复位。

该接口不包括动态电压和频率缩放（DVFS）或设备电源管理（例如，对图形处理器等外设的管理）。

**为什么需要PSCI？**

具有电源管理感知的操作系统动态地改变核心的电源状态，平衡可用的计算容量以匹配当前的工作负载，同时努力使用最小的功率量。其中一些技术可以动态地打开和关闭内核，或将它们置于静止状态，在静止状态下它们不再执行计算。这意味着它们消耗的能量很少。这些技术的主要例子是：

- **空闲管理** ：当操作系统中的内核在核心上没有线程可以调度时，它会将该核心置于时钟门控、保留状态，甚至是完全电源门控状态。然而，该核心仍然可用于操作系统。
- **热插拔** ：当计算需求低时，核心会物理关闭，当需求增加时恢复在线。该操作系统将迁移所有远离离线的核心的中断和线程，并在它们重新联机时重新平衡负载。

具体包含那些功能，可以自己去看规范文档，这里截图算个记录：

![](https://picx.zhimg.com/v2-5c08b1eb38276388a11d41c237e1e5f9_1440w.jpg)

比如关机就是5.10里面的内容。

**2\. [SCMI协议](https://zhida.zhihu.com/search?content_id=272743065&content_type=Article&match_order=1&q=SCMI%E5%8D%8F%E8%AE%AE&zhida_source=entity)**

现在继续聊SCP里面的东西，上来就是 **SCMI协议** ，同样还是去ARM官网找：

《DEN0056B\_System\_Control\_and\_Management\_Interface\_v2\_0》

这个协议在哪里用到，我们来看一个图：

![](https://picx.zhimg.com/v2-35d7c76bb666fdeafa89cb2e5a167ccd_1440w.jpg)

SCP会以服务的方式来支持AP参与运行管理，这也就需要SCP和AP之间有一个 **通信接口** 。这个通信接口在硬件上可以通过共享存储和 **[MHU](https://zhida.zhihu.com/search?content_id=272743065&content_type=Article&match_order=1&q=MHU&zhida_source=entity)** （Message Handling

Unit）实现；在软件上，通过定义一组通信协议来实现。

主要涉及的模块如下：

- **mhu模块** ：Message Handling  
	Unit (MHU)在module/mhu/src/mod\_mhu.c中实现
- **msg\_smt模块** ：Shared Memory  
	Transport 是一种用于描述系统内存拓扑的数据结构。在ARM 架构中，SCP 固件使用 Shared Memory  
	Transport来提供有关系统内存的信息，如地址范围、类型、属性等。System  
	Memory Tables 通常由系统固件在启动过程中生成，并由SCP 固件和其他系统组件使用。它们允许系统软件了解和管理系统中可用的内存资源。
- **SCMI模块** ：System Control &  
	Management Interface (SCMI)
- **业务处理模块** ，为scmi protocol模块例如scmi\_power\_domain

SCMI抽象出 **协议和传输** 两层，协议层描述能够支持的命令，传输层定义了命令通过什么方式传输，发送命令方称为 **agent** 。有个限制，每个agent的传输通道必须一个或者多个，然后如果有安全需求，那安全AP必须使用安全的通道进行传输数据。

![](https://pic3.zhimg.com/v2-0f9f6e19d0b6cf5e6f3c7cd23acda09c_1440w.jpg)

**协议层：**

- 通道（channel）必须是分开独立的，各个agent不能使用同一个。避免platform无法识别message对应方
- agent必须是独立的操作系统
- 通道支持双向通讯，另外也能够支持中断、polling两种方式，让agent选择

从agent到platform的消息分为两种， **同步和异步** ，为A2P通道：

- 同步（synchronous），agent返回的时候对应的platform操作就已经完成了。platform返回操作结果命令也是通过agent到platform的通道，同一个通道完成这些操作
- 异步（asynchronoous），当platform完成后，会发送 delayed response给到agent告知对方工作完成，这是P2A通道。agent发送完消息后，立马得到platform的返回，然后释放通道继续做下一次传输

SCMI协议的 **整体应用框图** ，从SCMI规范截图如下：

![](https://pic2.zhimg.com/v2-77614796e19e533bdbf32cec3b17dd31_1440w.jpg)

**scmi transport,channel,agent的对应关系：**

1\. 一个scp可以有多个agent,agent是运行在操作系统，安全固件的软件或者一个使用scmi协议的设备。例如juno有如下代理，0保留给平台。

enum  
juno\_scmi\_agent\_idx {  
  
/\* 0 is reserved for the platform  
\*/  
  
JUNO\_SCMI\_AGENT\_IDX\_ [OSPM](https://zhida.zhihu.com/search?content_id=272743065&content_type=Article&match_order=1&q=OSPM&zhida_source=entity) = 1,  
  
JUNO\_SCMI\_AGENT\_IDX\_PSCI,  
  
JUNO\_SCMI\_AGENT\_IDX\_COUNT,  
  
};

2\. transport定义了scmi协议如何传输。比如shared memory。一个agent可以有多个A2P或P2A channel，channel是双向的，但是协议发起者（主）-接收者（从）关系是固定的。故若要使能通知功能，除了一个A2P channel外，还需要一个P2A channel分配给这个agent.

SCMI协议的message header定义如下，对应代码module/scmi/include/mod\_scmi\_std.h中定义

![](https://pic2.zhimg.com/v2-55c394febf167a3c6884fe57a9234099_1440w.jpg)

**\[protocol\_id\]：**

![](https://pic2.zhimg.com/v2-e71b071be728d44eab0a68276e018979_1440w.jpg)

**\[message id\]：**

message id是二级功能区分id算cmd，例如设置状态、获取状态等具体操作。如果有新增的协议，那里面0/1/2这三个message都必须按照协议走。

![](https://pic3.zhimg.com/v2-b06785e70e17b4e062b825467fefc28a_1440w.jpg)

**\[message type\]：**

Commands 的message type都是0。对于不支持的协议和message类型，platform都要回复 NOT\_SUPPORTED

Delayed responses 类型都是2

Notifications 为3

**传输层：**

传输层文档也就定义了一种方式， **mailbox** 方式（核间通讯的一种ip）。这种通讯的前提是系统能够在agents和platform之间存在 **共享内存** （ddr和片上flash都行，最好是片上flash）。mailebox能够完美支持前面提到的通道的需求，中断、内存和完成中断等都能够，而且是软件可操控。比如下面流程指出的中断和polling方式：

![](https://pica.zhimg.com/v2-56b49a93c9a3ecbb003722ecded1f70e_1440w.jpg)

mailbox通讯怎么定义在flash里面的 **layout**:

![](https://picx.zhimg.com/v2-d66fa46771df792b5860945ca275d371_1440w.jpg)

**3\. Agent scmi消息处理流程**

这里我们以一个protocol\_id为 **0x11** 的 **power domain** 控制消息为例子进行说明：

![](https://pica.zhimg.com/v2-2a7aec1bd7826e98e713e5bce84c6724_1440w.jpg)

scp中scmi消息处理时序图

1\. **mhu模块-中断产生** ：scmi底层硬件对应的模块是mhu模块，当硬件收到agent的消息时候会产生中断，中断处理函数为mhu\_isr。在该函数中通过中断源查表获取对应的设备和smt

channel。然后调用transport模块的api(调用transport\_channel->api->signal\_message(transport\_channel->id);)发送消息。

2\. **transport模块-获取通道上下文**:signal\_message

api中通过channel id获取channel上下文信息，检查通道是否ready和locked，调用scmi模块的api 处理（channel\_ctx->scmi\_api->signal\_message(channel\_ctx->scmi\_service\_id);）。

3\. **scmi模块-产生处理事件** ：

•scmi的api函数signal\_message中将该消息封装成事件，通过fwk\_put\_event发送一个fwk\_event\_light。（事件中source\_id为scmi模块，.target\_id 为上一级smt 中channel\_ctx->scmi\_service\_id，也是scmi。所以让该事件是自己发给自己的）。因为event有队列，中断调用的api是实时的。在scmi的.process\_event回调函数中处理上面的事件。

•首先通过scmi维护的scmi\_ctx.service\_ctx\_table获取transport信息找到transport\_api（msg\_smt模块提供），然后读出scmi消息的头部（scmi\_protocol\_id、scmi\_message\_id、scmi\_message\_type、scmi\_token）。

•然后通过get\_agent\_id(event->target\_id, &agent\_id)获取该scmi 协议的agent\_id（OSPM、PSCI等），根据agent\_id获取到agent\_type（psci、ospi等）。

•最后根据scmi\_protocol\_id找到protocol（例如0x11是power domain处理），调用protocol->message\_handler(protocol->id,

event->target\_id,payload, payload\_size, ctx->scmi\_message\_id)执行相对应的protocol的消息处理函数。message\_handler函数执行到了scmi\_power\_domain模块。

4\. **scmi\_power\_domain模块-解析scmi消息** ：.message\_handle函数对消息进行检验，将进行权限判断，然后查表调用具体的消息处理函数handler\_table\[message\_id\](service\_id, payload)。例如scmi\_protocol\_id为scmi\_power\_domain，scmi\_message\_type为MOD\_SCMI\_PD\_POWER\_STATE\_SET，则处理函数为scmi\_pd\_power\_state\_set\_handler。该函数中将会进行策略判断（大多数模块为空），然后调用scmi\_pd\_ctx.pd\_api->set\_state(pd\_id,

pd\_power\_state)进行power domain的set,pd\_api对应power\_domain模块中对外api函数。

5\. **power\_domain模块-调用driver处理：** power\_domain模块的api set\_state函数先组装了一个event发给pd\_id，也就是自己。pd\_process\_event（）函数进行处理，process\_set\_state\_request（）按照pd的树形结构对状态进行设置，然后调用initiate\_power\_state\_transition（）执行status =

pd->driver\_api->set\_state(pd->driver\_id, state);更新pd的状态，并拿到执行结果status 。这里driver\_api是在product/juno/scp\_ramfw/config\_power\_domain.c的struct fwk\_element

element\_table变量中定义，可以看到为FWK\_MODULE\_IDX\_JUNO\_PPU中提供

6\. **juno\_ppu模块-寄存器设置：** 根据ppu\_id拿到ppu的上下文ppu\_ctx，按照传入的state值（on或者off）执行status =

ppu\_set\_state\_and\_wait(ppu\_ctx, mode);最后执行reg->POWER\_POLICY = (uint32\_t)mode;进行寄存器设置生效。

7\. **scmi\_power\_domain模块-返回结果：** 最后调用scmi\_pd\_ctx.scmi\_api->respond(service\_id, &return\_values,....)到scmi 模块。

8\. **scmi模块：** scmi中api的respond函数将会通过service\_id查表service\_ctx\_table获取transport信息，然后调用ctx->respond(ctx->transport\_id,

payload, size)，为msg\_smt模块中respond api()（注transport\_id在config\_scmi.c 中配置。指定transport为smt模块+smt内的具体channel element元素)）。

9.**transport模块：** msg\_smt模块中的respond api为smt\_respond（）函数。通过上一级传入的transport\_id/channel\_id的element\_idx部分，查表smt\_ctx.channel\_ctx\_table获取channel消息。然后填充Shared Memory，并调用channel\_ctx->driver\_api->raise\_interrupt(channel\_ctx->driver\_id)产生中断，通知agent。

10\. **mhu模块产生中断** ：raise\_interrupt（）函数中，根据slot\_id找到设备上下文，然后对寄存器进行设置reg->SET |= (1U << slot);。

从上面可以看到，scmi的处理流程基本是通用的，涉及到不同平台的就是最后硬件的设置，需要新建一个 **juno\_ppu模块-寄存器设置，及其配置文件。**

**SCP中scmi协议处理:**

系统支持两种agent： **PSCI** 和 **OSPM** ，发来的SCMI消息根据protocol\_id进行分类，然后根据message\_id子命令找到合适的处理函数，最后根据message\_type决定是否进行回复。 关于SCMI协议的一些参数定义可以参考代码：

module/scmi/include/mod\_scmi\_std.h

例如上面我们介绍过0x11 power

domain，其他的处理过程相似可以通过下面表速查到相关模块，从模块的static int (\*handler\_table中根据message\_id下标迅速找到处理函数：

| protocol\_id | 描述 | 涉及模块及处理代码 |
| --- | --- | --- |
| 0x10 | Base protocol | module/scmi/src/mod\_scmi\_base.c |
| 0x11 | Power domain management protocol | module/scmi\_power\_domain/src/mod\_scmi\_power\_domain.c |
| 0x12 | System power management protocol | module/scmi\_system\_power/src/mod\_scmi\_system\_power.c |
| 0x13 | Performance domain management protocol | module/scmi\_perf/src/mod\_scmi\_perf.c |
| 0x14 | Clock management protocol | module/scmi\_clock/src/mod\_scmi\_clock.c |
| 0x15 | Sensor management protocol | module/scmi\_sensor/src/mod\_scmi\_sensor.c |
| 0x16 | Reset domain management protocol | module/scmi\_reset\_domain/src/mod\_scmi\_reset\_domain.c |
| 0x17 | Voltage domain management protocol | module/scmi\_voltage\_domain/src/mod\_scmi\_voltage\_domain.c |
| 0x18 | Power capping and monitoring protocol | 不支持 |
| 0x19 | Pin Control protocol | 不支持 |

**4\. PPU的电源控制**

| 0x11 | Power domain management protocol | module/scmi\_power\_domain/src/mod\_scmi\_power\_domain.c |
| --- | --- | --- |
| 0x12 | System power management protocol | module/scmi\_system\_power/src/mod\_scmi\_system\_power.c |

0x11 **pd** ，0x12 **system** 是通过power domain模块，然后到 **PPU** 模块进行电源控制的。关于PPU可以去 **PCSA规范** 中查看，PPU是一个 **硬件模块** ，SCP通过PPU去控制具体的 **时钟、电源** 等硬件。PPU类型如下所示：

enum  
mod\_pd\_type {  
MOD\_PD\_TYPE\_CORE,  
MOD\_PD\_TYPE\_CLUSTER,  
MOD\_PD\_TYPE\_DEVICE,  
MOD\_PD\_TYPE\_DEVICE\_DEBUG,  
MOD\_PD\_TYPE\_SYSTEM,  
MOD\_PD\_TYPE\_COUNT  
  
};

**这里举例CPU COER的电源硬件控制，其他的自己看代码。**

**MOD\_PD\_TYPE\_CORE** 的处理api为core\_pd\_driver\_api，如下：

static  
const struct mod\_pd\_driver\_api core\_pd\_driver\_api = {  
  
.set\_state = core\_set\_state,  
  
.get\_state = pd\_get\_state,  
  
.reset = core\_reset,  
  
.prepare\_core\_for\_system\_suspend =  
core\_prepare\_core\_for\_system\_suspend,  
  
};

**core\_set\_state：**

首先根据ppu\_id拿到上下文参数（ **config\_juno\_ppu.c** 中定义），然后根据要设置的state进行分开处理：

static  
int core\_set\_state(fwk\_id\_t ppu\_id, unsigned int state) {  
  
get\_ctx(ppu\_id, &ppu\_ctx);  
  
dev\_config = ppu\_ctx->config;  
  
mode = pd\_state\_to\_ppu\_mode\[state\];  
  
switch ((enum mod\_pd\_state)state) {  
  
case MOD\_PD\_STATE\_OFF:  
  
//设置PPU状态，并等待生效  
  
status =  
ppu\_set\_state\_and\_wait(ppu\_ctx, mode);  
  
//清空这个PPU对应的中断消息  
  
status =  
clear\_pending\_wakeup\_irq(dev\_config);  
  
//关闭这个PPU对应的中断消息  
  
status =  
disable\_wakeup\_irq(dev\_config);  
  
//关闭软重启中断消息  
  
status =  
fwk\_interrupt\_disable(dev\_config->warm\_reset\_irq);  
  
break;  
  
case MOD\_PD\_STATE\_SLEEP:  
  
status =  
ppu\_set\_state\_and\_wait(ppu\_ctx, mode);  
  
status =  
clear\_pending\_wakeup\_irq(dev\_config);  
  
status = enable\_wakeup\_irq(dev\_config);  
  
status =  
fwk\_interrupt\_disable(dev\_config->warm\_reset\_irq);  
  
break;  
  
case MOD\_PD\_STATE\_ON:  
  
status =  
fwk\_interrupt\_clear\_pending(dev\_config->warm\_reset\_irq);  
  
status =  
fwk\_interrupt\_enable(dev\_config->warm\_reset\_irq);  
  
status =  
ppu\_set\_state\_and\_wait(ppu\_ctx, mode);  
  
break;  
  
default:  
  
fwk\_unexpected();  
  
status = FWK\_E\_PANIC;  
  
break;  
  
}  
  
//power\_domain模块中api调用，对这个pd进行订阅的模块会收到电源变化通知  
  
status = ppu\_ctx->pd\_api->report\_power\_state\_transition(ppu\_ctx->bound\_id,  
  
state);  
  
return FWK\_SUCCESS;  
  
}·

ppu\_set\_state\_and\_wait(ppu\_ctx, mode);中设置PPU的mode，首先mode的转化如下：

static  
enum ppu\_mode pd\_state\_to\_ppu\_mode\[\] = {  
  
\[MOD\_PD\_STATE\_OFF\]  
\= PPU\_MODE\_OFF,  
  
\[MOD\_PD\_STATE\_SLEEP\]  
\= PPU\_MODE\_OFF,  
  
\[MOD\_PD\_STATE\_ON\]  
\= PPU\_MODE\_ON,  
  
\[MOD\_SYSTEM\_POWER\_POWER\_STATE\_SLEEP0\]  
\= PPU\_MODE\_MEM\_RET,  
  
};

ppu\_set\_state\_and\_wait（）函数中，对于mode的设置：

static int ppu\_set\_state\_and\_wait(struct  
ppu\_ctx \*ppu\_ctx, enum  
ppu\_mode mode)  
  
{  
  
//对寄存器进行设置  
  
reg = ppu\_ctx->reg;  
  
reg->POWER\_POLICY =  
(uint32\_t)mode;  
  
//根据配置信息等待PPU设置完成  
  
dev\_config = ppu\_ctx->config;  
  
params.mode = mode;  
  
params.reg = reg;  
  
if (fwk\_id\_is\_equal(dev\_config->timer\_id,  
FWK\_ID\_NONE)) {  
  
/\* Wait for the PPU to set \*/  
  
while  
(!set\_power\_status\_check(&params)) {  
  
continue;  
  
}  
  
}

对于中断的控制通过framework/src/fwk\_interrupt.c中对外函数

int  
fwk\_interrupt\_disable(unsigned int interrupt)  
  
{  
  
if (!initialized) {  
  
return FWK\_E\_INIT;  
  
}  
  
return  
fwk\_interrupt\_driver->disable(interrupt);  
  
}

fwk\_interrupt\_driver在arch/arm/arm-m/src/arch\_nvic.c中实现：

static  
int disable(unsigned int interrupt)  
  
{  
  
if (interrupt >= irq\_count) {  
  
return FWK\_E\_PARAM;  
  
}  
  
NVIC\_DisableIRQ((enum  
IRQn)interrupt);  
  
return FWK\_SUCCESS;  
  
}  
  
\_\_STATIC\_INLINE void \_\_NVIC\_DisableIRQ(IRQn\_Type IRQn)  
  
{  
  
if ((int32\_t)(IRQn) >= 0)  
  
{  
  
NVIC->ICER\[(((uint32\_t)IRQn)  
\>> 5UL)\] = (uint32\_t)(1UL << (((uint32\_t)IRQn) & 0x1FUL));  
  
\_\_DSB();  
  
\_\_ISB();  
  
}  
  
}

对硬件寄存器进行了设置。

**其他：**

SCP入门系列就算讲完了， **有规范有源码** ，有一点缺陷就是没用 **qmeu运行** 起来，官方也没给出，只说用ARM的Fixed Virtual Platform (**FVP**)能运行，不熟悉操作起来估计有点费劲对PC要求也高，这个SCP也比较小众在大规模的SoC上才有应用，提出的挺早但是应用的还是不多。其实找一个qemu支持的板子，把代码改一改应该也能运行起来，有兴趣的可以自己尝试下。

后记：

**英文规范** + **源码** 才是 **一手资料** ， **看二手资料永远都跟不上别人** ，比如知乎、CSDN、公众号、bilibili等中文的总结文档，甚至我这篇博客。为什么会这样？因为英文规范很全面，总结出来的二手中文文档只是翻译了其中一部分，但是那个 **写二手文档的人肯定把一手的都看了** ，所以你看二手的因为 **不全** 而永远落后别人， **二手好处就是入门快** ，要精通还是看一手的吧。

不过我这里尽量是简介和汇总文档，而不是大篇幅的摘抄翻译，让大家好找到出处， **知道去看什么英文文档，去哪里找** ，一般就是 **ARM官网** （本文的SMC、PSCI、SCMI）或者 **github** 。搞一些有点技术含量的研发特别是靠近底层软件和芯片技术的， **英文** 是一道坎，中国没有只能 **学学老外5-10前** 的技术已经算先进的了，这些领域国内基本还是 **海归** 或者 **外企** 待过的人把持，说话都夹杂着满嘴的 **英文单词** 和 **行业术语缩写** ， **不装逼还真不是一个level的了** ，现在都是把电脑系统和常用软件都换英文显示的了，努力看英文无障碍。

“ **啥都懂一点** ， **啥都不精通** ，

**干啥都能干** ， **干啥啥不是** ，

**专业入门劝退** ， **堪称程序员杂家** ”。

后续会继续更新，纯干货分析，无广告，不打赏，欢迎转载，欢迎评论交流！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

编辑于 2026-04-08 16:09・上海[HFSS仿真研修班首期招生！0基础两个月快速掌握电磁仿真](https://zhuanlan.zhihu.com/p/1921565122821855103)

[

为推动中国智造强国战略，仿真秀以“为行业选才育才”为宗旨，2022年正式成立仿真高研院开展仿真工程师职业培训。 截止目前 已经有超3000学员报名学习，顺利毕业！学员通过两个月集中...

](https://zhuanlan.zhihu.com/p/1921565122821855103)