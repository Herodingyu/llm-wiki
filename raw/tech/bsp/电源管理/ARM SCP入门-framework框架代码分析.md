---
title: "ARM SCP入门-framework框架代码分析"
source: "https://zhuanlan.zhihu.com/p/2025239824399888875"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "一套软硬件跑起来的样子就像上面图里面的一样， it works。对应我们的SCP固件中，有那些框架来支撑这个系统运行起来，这里就需要一套基于M核或者单片机的通用框架程序，市面上的这种系统并不少见，例如freeRTOS等…"
tags:
  - "clippings"
---
[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679)

1 人赞同了该文章

![](https://pic2.zhimg.com/v2-1a5e0bfa7f57a897e0e8af760f64211b_1440w.jpg)

一套软硬件跑起来的样子就像上面图里面的一样， **it works** 。对应我们的SCP固件中，有那些 **框架** 来支撑这个系统运行起来，这里就需要一套基于 [M核](https://zhida.zhihu.com/search?content_id=272741777&content_type=Article&match_order=1&q=M%E6%A0%B8&zhida_source=entity) 或者 **单片机** 的通用框架程序，市面上的这种系统并不少见，例如 [freeRTOS](https://zhida.zhihu.com/search?content_id=272741777&content_type=Article&match_order=1&q=freeRTOS&zhida_source=entity) 等。

为了强调 **安全、简单** 等特性，适配ARM的控制系统固件，ARM又搞了这套通用的框架，适合在M核或者 [R核](https://zhida.zhihu.com/search?content_id=272741777&content_type=Article&match_order=1&q=R%E6%A0%B8&zhida_source=entity) 上工作，甚至 [A核](https://zhida.zhihu.com/search?content_id=272741777&content_type=Article&match_order=1&q=A%E6%A0%B8&zhida_source=entity) 的某些特权系统例如 [OPTEE](https://zhida.zhihu.com/search?content_id=272741777&content_type=Article&match_order=1&q=OPTEE&zhida_source=entity) 中。安全的核心就是 **隔离** ，隔离就是按功能形成module或者domain，模块之间禁止 **无权限的访问** 。

**1\. module介绍**

![](https://pic3.zhimg.com/v2-969bcaea1e521068300956426047697c_1440w.jpg)

SCP的每个 **功能** 都实现为一个单独的 **module** ，module间 **耦合性** 尽量低，确保安全特性，通常固件所需的整体功能应来自模块之间的交互。module间隔离就像上图中的 **狗咬架** ，一旦伸手产生交互就祸福不能预测了，所以加上 **栏杆** ， **规定** 好那些module间可以交互伸手，这都是通过 **API** 函数实现的，在系统初始化的时候设 **定死** ，下面模块间绑定章节会讲到。

SCP中的module分为两部分：在代码根目录module文件夹下，共 **77** 个公共模块，另外每个产品下面还有module，小100个可真不少。

![](https://pic1.zhimg.com/v2-7dac0d6b1d6ff4757fb0133bc139663c_1440w.jpg)

- 一个固件只包含一部分module，在 **Firmware.cmake** 中定义，gen\_module\_code.py脚本生成源码
- 这些module在framework启动时候初始化启动运行。
- 公共的module比较有通用性，产品自己的module一般是驱动需要进行定制

**模块类型及软件协议栈：**

![](https://pic2.zhimg.com/v2-adb96cc69ea92ddfd47af00e72ab61bb_1440w.jpg)

这个协议栈就是SCP软件跟外界交互的流程，一般消息都是通过 **驱动-》HAL层** 上来，然后处理的过程就是 **服务-》协议-》HAL-》驱动** 再操作硬件做出反应，这次交互就算结束了。具体如下：

![](https://picx.zhimg.com/v2-4e077bd5fac24232cfd1fdb43aee3213_1440w.jpg)

**2\. framework框架流程**

![](https://pic2.zhimg.com/v2-79d8a6c7705bdbb95752dc9fc22ce959_1440w.jpg)

framework框架负责固件的通用流程实现，包括 **系统初始化，module初始化，中断服务提供，event服务提供等** 。这样module就可以专注于自己功能和对外交互api的实现。SCP framework初始化流程图如下：

![](https://pic3.zhimg.com/v2-ce750b9cc124bb1e51de8d25cf96b11a_1440w.jpg)

备注：这里的framework框架流程适用于 **scp\_romfw** 和 **scp\_ramfw** ，两者区别只是包含module不同，定义包含了那些module在其目录下的Firmware.cmake文件中。

编译过程中 **gen\_module\_code.py** 脚本会生成module信息和配置信息的代码，过程如下：SCP/MCP 软件构建系统由一个顶级 Makefile ：Makefile.cmake和一组.mk 文件组成，例如juno产品product/juno/product.mk

BS\_PRODUCT\_NAME  
:= juno  
  
BS\_FIRMWARE\_LIST:= scp\_romfw \\  
  
scp\_romfw\_bypass \\  
  
scp\_ramfw

模块可以在项目根目录的 modules/ 目录下实现，也可以是产品特定的并在product/<product>/modules 目录下实现。

gen\_module\_code.py脚本会根据

product/juno/scp\_romfw/Firmware.cmake中SCP\_MODULES变量

list(APPEND  
SCP\_MODULES "juno-ppu")  
  
list(APPEND SCP\_MODULES "juno-rom")  
  
list(APPEND SCP\_MODULES "juno-soc-clock")  
  
list(APPEND SCP\_MODULES "clock")  
  
list(APPEND SCP\_MODULES "gtimer")  
  
list(APPEND SCP\_MODULES "sds")  
  
list(APPEND SCP\_MODULES "bootloader")

**生成**

• **[fwk\_module\_idx.h](https://zhida.zhihu.com/search?content_id=272741777&content_type=Article&match_order=1&q=fwk_module_idx.h&zhida_source=entity)** ：包含构成固件的模块索引的枚举。fwk\_module\_idx.h中枚举中模块索引的顺序保证遵循固件firmware.mk 文件中 BS\_FIRMWARE\_MODULES列表中模块名称的顺序。当执行涉及迭代固件中存在的所有模块的操作时，框架在运行时使用相同的顺序，例如 fwk\_module.c 中的 init\_modules() 函数。

enum  
fwk\_module\_idx {  
  
FWK\_MODULE\_IDX\_JUNO\_PPU = 0,  
  
FWK\_MODULE\_IDX\_JUNO\_ROM = 1,  
  
FWK\_MODULE\_IDX\_JUNO\_SOC\_CLOCK = 2,  
  
FWK\_MODULE\_IDX\_CLOCK = 3,  
  
FWK\_MODULE\_IDX\_GTIMER = 4,  
  
FWK\_MODULE\_IDX\_SDS = 5,  
  
FWK\_MODULE\_IDX\_BOOTLOADER = 6,  
  
FWK\_MODULE\_IDX\_COUNT = 7,  
  
};

• **[fwk\_module\_list.c](https://zhida.zhihu.com/search?content_id=272741777&content_type=Article&match_order=1&q=fwk_module_list.c&zhida_source=entity)** ：包含一个指向模块描述符的指针表，每个模块对应一个作为固件一部分构建的模块。该文件及其内容由框架内部使用，通常不应由其他单元（如模块）使用。

const  
struct fwk\_module \*module\_table\[FWK\_MODULE\_IDX\_COUNT\]  
\= {  
  
&module\_juno\_ppu,  
  
&module\_juno\_rom,  
  
&module\_juno\_soc\_clock,  
  
&module\_clock,  
  
&module\_gtimer,  
  
&module\_sds,  
  
&module\_bootloader,  
  
};  
  
const struct fwk\_module\_config \*module\_config\_table\[FWK\_MODULE\_IDX\_COUNT\] = {  
  
&config\_juno\_ppu,  
  
&config\_juno\_rom,  
  
&config\_juno\_soc\_clock,  
  
&config\_clock,  
  
&config\_gtimer,  
  
&config\_sds,  
  
&config\_bootloader,  
  
};

**module\_table** 和 **module\_config\_table** 用于模块初始化。

固件的 **Firmware.cmake** 文件中可以对配置开关进行声明，例如：

set(SCP\_FIRMWARE\_SOURCE\_DIR  
"${CMAKE\_CURRENT\_LIST\_DIR}")  
  
set(SCP\_GENERATE\_FLAT\_BINARY TRUE)  
  
set(SCP\_ARCHITECTURE "arm-m")

**framework.md-固件相关配置文件说明**

产品始终包含定义一个或多个固件目标的 **product.mk** 文件。

在一个产品中，总会有至少一个固件。

对于每个固件，必须在 **fmw\_memory.h** 文件中提供链接器信息，例如product/juno/scp\_romfw/fmw\_memory.h中：

#define  
FMW\_MEM\_MODEARCH\_MEM\_MODE\_DUAL\_REGION\_RELOCATION  
  
/\* ROM \*/  
  
#define FMW\_MEM0\_SIZE SCP\_ROM\_SIZE  
  
#define FMW\_MEM0\_BASE SCP\_ROM\_BASE  
  
/\* RAM \*/  
  
#define FMW\_MEM1\_SIZE (16 \* 1024)  
  
#define FMW\_MEM1\_BASE (SCP\_RAM\_BASE + SCP\_RAM\_SIZE - FMW\_MEM1\_SIZE)

如果使用双区域内存配置，则还必须定义 *FMW\_MEM1\_BASE* 和 *FMW\_MEM1\_SIZE 。*

Toolchain-\*.cmake 中定义image的体系结构目标

product/juno/scp\_romfw/ **Toolchain-GNU.cmake**

set(CMAKE\_SYSTEM\_PROCESSOR  
"cortex-m3")  
  
set(CMAKE\_TOOLCHAIN\_PREFIX "arm-none-eabi-")  
  
...

product/juno/scp\_romfw/ **CMakeLists.txt** 定义编译范围和目标，cmake会使用生成makefile文件。

**编译选项说明：**

**cmake\_readme.md-构建配置选项：**

•SCP\_ENABLE\_NOTIFICATIONS：启用/禁用 SCP 固件中的通知。

•SCP\_ENABLE\_SCMI\_NOTIFICATIONS：启用/禁用 SCMI 通知。

•SCP\_ENABLE\_RESOURCE\_PERMISSIONS：启用/禁用资源权限设置。

**单独配置编译：**

配置生效命令：

cmake  
\-B /tmp/build -DSCP\_FIRMWARE\_SOURCE\_DIR:PATH=juno/scp\_romfw  
\-DSCP\_ENABLE\_DEBUG\_UNIT=TRUE

然后就是编译命令：

cmake  
\--build /tmp/build

在编译文件中配置，例如在product/juno/scp\_romfw/Firmware.cmake中

set(SCP\_ENABLE\_NOTIFICATIONS  
TRUE)

修改后需要clean下，再继续编译。

**2.1 平台初始化**

arch/arm/arm-m/CMakeLists.txt中，arch-arm-m库的入口是arch\_exception\_reset（）函数：

```
if(CMAKE_C_COMPILER_ID  STREQUAL "ARMClang")     target_link_options(arch-arm-mPUBLIC  "LINKER:--entry=arch_exception_reset")endif()
```

arch\_exception\_reset（）函数在arch/arm/arm-m/src/arch.ld.S链接文件中也被定位了入口函数

其实现在arch/arm/arm-m/src/arch\_handlers.c：

```
noreturn  void arch_exception_reset(void) {     
extern noreturn void __main(void);     
__main(); 
}
```

\_\_main在c运行时调用main函数，对于M核实现来说，arch/arm/arm-m/src/arch\_main.c中有main（）函数

int  
main(void)  
  
{  
  
////初始化 ARM Cortex-M 系列芯片的 Configuration Control Register (CCR)。  
  
//其中，通过设置  
SCB\_CCR\_DIV\_0\_TRP\_Msk 来启用除以零的异常处理  
  
arch\_init\_ccr();  
  
//scp 入口及应用函数  
  
return [fwk\_arch\_init](https://zhida.zhihu.com/search?content_id=272741777&content_type=Article&match_order=1&q=fwk_arch_init&zhida_source=entity) (&arch\_init\_driver);  
  
}

scp 入口及应用为fwk\_arch\_init函数，在framework/src/fwk\_arch.c中

int  
fwk\_arch\_init(const struct fwk\_arch\_init\_driver \*driver)  
  
{  
  
//scp 框架初始化，完成module\_table、module\_config\_table所有模块信息的初始化  
  
//scp/module目录下的模块的初始化  
  
fwk\_module\_init();  
  
//这里构建了一个全局的fwk\_io\_stdin、 fwk\_io\_stdout， 在后面的终端输出有用  
  
status = fwk\_io\_init();  
  
//初始化日志输出方式  
  
status = fwk\_log\_init();  
  
//中断gic初始化  
  
status =  
fwk\_arch\_interrupt\_init(driver->interrupt);  
  
//所有模块初始化，开始任务  
  
status = [fwk\_module\_start](https://zhida.zhihu.com/search?content_id=272741777&content_type=Article&match_order=1&q=fwk_module_start&zhida_source=entity) ();  
  
//循环等待处理队列事件  
  
\_\_fwk\_run\_main\_loop();  
  
}

**2.2 module初始化**

**fwk\_module\_init** 函数，在framework/src/fwk\_module.c中实现

在系统构建章节中module\_table和module\_config\_table是由配置文件Firmware.cmake生成的fwk\_module\_list.c中定义。

- module见module介绍章节
- module\_config\_table就是模块的上下文信息
void  
fwk\_module\_init(void)  
  
{  
  
for (uint32\_t i = 0U; i <  
(uint32\_t)FWK\_MODULE\_IDX\_COUNT; i++) {  
  
//获取模块的上下文信息  
  
struct fwk\_module\_context \*ctx  
\= &fwk\_module\_ctx.module\_ctx\_table\[i\];  
  
fwk\_id\_t id = FWK\_ID\_MODULE(i);  
  
const struct fwk\_module \*desc = module\_table\[i\];  
  
const struct fwk\_module\_config  
\*config = module\_config\_table\[i\];  
  
//给模块上下文信息赋值  
  
\*ctx = (struct  
fwk\_module\_context){  
  
.id = id,  
  
.desc = desc,  
  
.config = config,  
  
};  
  
//初始化模块的链表  
  
fwk\_list\_init(&ctx->delayed\_response\_list);  
  
if (config->elements.type ==  
FWK\_MODULE\_ELEMENTS\_TYPE\_STATIC) {  
  
size\_t notification\_count =  
0;  
  
#ifdef BUILD\_HAS\_NOTIFICATION  
  
notification\_count =  
desc->notification\_count;  
  
#endif  
  
fwk\_module\_init\_element\_ctxs(  
  
ctx,  
config->elements.table, notification\_count);  
  
}  
  
#ifdef BUILD\_HAS\_NOTIFICATION  
  
if (desc->notification\_count  
\> 0) {  
  
fwk\_module\_init\_subscriptions(  
  
&ctx->subscription\_dlist\_table, desc->notification\_count);  
  
}  
  
#endif  
  
}  
  
}

**2.3 中断初始化**

static  
int fwk\_arch\_interrupt\_init(int (\*interrupt\_init\_handler)(  
  
const struct  
fwk\_arch\_interrupt\_driver \*\*driver))  
  
{  
  
const struct  
fwk\_arch\_interrupt\_driver \*driver;  
  
status = interrupt\_init\_handler(&driver);  
  
/\* Initialize the interrupt  
management component \*/  
  
status =  
[fwk\_interrupt\_init](https://zhida.zhihu.com/search?content_id=272741777&content_type=Article&match_order=1&q=fwk_interrupt_init&zhida_source=entity) (driver);  
  
return FWK\_SUCCESS;  
  
}

interrupt\_init\_handler是入参回调函数，对应为arch\_init\_driver

static  
const struct fwk\_arch\_init\_driver arch\_init\_driver = {  
  
.interrupt = arch\_nvic\_init,  
  
};

在arch\_nvic\_init中有\*driver =  
&arch\_nvic\_driver;

static  
const struct fwk\_arch\_interrupt\_driver arch\_nvic\_driver = {  
  
.global\_enable = global\_enable,  
  
.global\_disable = global\_disable,  
  
.is\_enabled = is\_enabled,  
  
.enable = enable,  
  
.disable = disable,  
  
.is\_pending = is\_pending,  
  
.set\_pending = set\_pending,  
  
.clear\_pending = clear\_pending,  
  
.set\_isr\_irq = set\_isr\_irq,  
  
.set\_isr\_irq\_param =  
set\_isr\_irq\_param,  
  
.set\_isr\_nmi = set\_isr\_nmi,  
  
.set\_isr\_nmi\_param = set\_isr\_nmi\_param,  
  
.set\_isr\_fault = set\_isr\_fault,  
  
.get\_current = get\_current,  
  
.is\_interrupt\_context =  
is\_interrupt\_context,  
  
};

拿到driver的值后，执行fwk\_interrupt\_init(driver);

int  
fwk\_interrupt\_init(const struct fwk\_arch\_interrupt\_driver \*driver)  
  
{  
  
//校验driver  
  
fwk\_interrupt\_driver = driver;  
  
initialized = true;  
  
return FWK\_SUCCESS;  
  
}

fwk\_interrupt\_driver 全局变量用于中断处理。

模块使用中断时，需要调用对外接口在framework/include/fwk\_interrupt.h中，

例如开启中断fwk\_interrupt\_enable函数的实现：

int  
fwk\_interrupt\_enable(unsigned int interrupt)  
  
{  
  
if (!initialized) {  
  
return FWK\_E\_INIT;  
  
}  
  
return fwk\_interrupt\_driver->enable(interrupt);  
  
}

**2.4 module启动**

**fwk\_module\_start** ()在framework/src/fwk\_module.c中定义

int  
fwk\_module\_start(void)  
  
{  
  
//初始化任务列表  
  
status =  
\_\_fwk\_init(FWK\_MODULE\_EVENT\_COUNT);  
  
fwk\_module\_ctx.stage =  
MODULE\_STAGE\_INITIALIZE;  
  
//从功能方面初始化所有module  
  
fwk\_module\_init\_modules();  
  
fwk\_module\_ctx.stage =  
MODULE\_STAGE\_BIND;  
  
//调用模块.bind回调函数完成所有模块的绑定。（此处共进行两轮调用fwk\_module\_bind\_module(round=0 1)，  
  
//每轮都将分别绑定模块module和模块的元素element）  
  
for (bind\_round = 0; bind\_round  
<= FWK\_MODULE\_BIND\_ROUND\_MAX;  
  
bind\_round++) {  
  
status =  
fwk\_module\_bind\_modules(bind\_round);  
  
if (status!= FWK\_SUCCESS) {  
  
return status;  
  
}  
  
}  
  
fwk\_module\_ctx.stage =  
MODULE\_STAGE\_START;  
  
//启动模块  
  
status = start\_modules();  
  
fwk\_module\_ctx.initialized = true;  
  
return FWK\_SUCCESS;  
  
}

fwk\_module\_init\_modules函数调用fwk\_module\_init\_module对每个模块进行功能初始化

//初始化模块元素上下文（element\_ctxs）,  
  
//调用模块的config->elements.generator，获取element信息，加入模块上下文表  
  
elements =  
config->elements.generator(ctx->id);  
  
fwk\_module\_init\_element\_ctxs(ctx,  
elements, notification\_count);  
  
//调用模块的init函数，传入element\_count,config->dat  
  
status = desc->init(ctx->id,  
ctx->element\_count, config->data);  
  
//初始化模块元素（element）,调用模块回调函数.element\_init将模块element->data配置信息导入到模块内部  
  
fwk\_module\_init\_elements(ctx);

start\_modules函数调用fwk\_module\_start\_module对每个模块进行启动

module = fwk\_mod\_ctx->desc;  
  
//调用模块.start回调函数  
  
module->start(fwk\_mod\_ctx->id);

例如在juno\_rom的.start回调函数函数中，通过event和notification机制，到达juno\_rom模块的相应回调函数，在juno\_rom中，通过ctx.bootloader\_api->load\_image()调用mod\_bootloader的api，从安全内存拷贝到指定位置，在该bootloader模块api中加载跳转scp\_ramfw。（注mod\_bootloader\_boot为汇编实现，依赖arm指令）。在product/juno/module/juno\_rom/src/mod\_juno\_rom.c中：

const  
struct fwk\_module module\_juno\_rom = {  
  
.type = FWK\_MODULE\_TYPE\_SERVICE,  
  
.event\_count = (unsigned  
int)MOD\_JUNO\_ROM\_EVENT\_COUNT,  
  
.notification\_count = (unsigned  
int)MOD\_JUNO\_ROM\_NOTIFICATION\_COUNT,  
  
.init = juno\_rom\_init,  
  
.bind = juno\_rom\_bind,  
  
.start = juno\_rom\_start,  
  
.process\_event = juno\_rom\_process\_event,  
  
.process\_notification =  
juno\_rom\_process\_notification,  
  
};

**2.5 运行状态机**

scp-firmware在完成了所有的初始化操作后，进入死循环，处理队列里面的事件或者休眠等待事件到来。

noreturn  
void \_\_fwk\_run\_main\_loop(void)  
  
{  
  
for (;;) {  
  
fwk\_process\_event\_queue();  
  
if (fwk\_log\_unbuffer() ==  
FWK\_SUCCESS) {  
  
fwk\_arch\_suspend();  
  
}  
  
}  
  
}

fwk\_process\_event\_queue主要处理三个重要的链表：free\_event\_queue, event\_queue, isr\_event\_queue所有的操作都是围绕这三个队列展开。

void  
fwk\_process\_event\_queue(void)  
  
{  
  
for (;;) {  
  
while  
(!fwk\_list\_is\_empty(&ctx.event\_queue))  
{  
  
process\_next\_event();  
  
}  
  
if (!process\_isr()) {  
  
break;  
  
}  
  
}  
  
}

event\_queue中根据target\_id找到对应module，然后调用module->process\_event进行处理，详细见module中说明。

process\_next\_event中调用duplicate\_event会处理free\_event\_queue队列中的事件

process\_isr从中断isr\_event\_queue队列中取到事件，然后加入到event\_queue中

**3\. module对外接口**

在scp代码中，所有的功能都由一个个模块提供。每个模块以api枚举及其结构体的方式对外提供该模块的功能,并在模块通用结构体fwk\_module中提供，例如

module/scmi\_power\_domain/src/mod\_scmi\_power\_domain.c中，

/\*  
SCMI Power Domain Management Protocol Definition \*/  
  
const struct fwk\_module module\_scmi\_power\_domain = {  
  
.api\_count = 1,  
  
.type = FWK\_MODULE\_TYPE\_PROTOCOL,  
  
.init = scmi\_pd\_init,  
  
.bind = scmi\_pd\_bind,  
  
.start = scmi\_pd\_start,  
  
.process\_bind\_request =  
scmi\_pd\_process\_bind\_request,  
  
.event\_count = (unsigned  
int)SCMI\_PD\_EVENT\_IDX\_COUNT,  
  
.process\_event =  
scmi\_pd\_process\_event,  
  
#ifdef BUILD\_HAS\_MOD\_DEBUG  
  
.process\_notification =  
scmi\_pd\_process\_notification,  
  
#endif  
  
};
- .**init** （模块初始化）
- .**bind** （获取绑定别的模块的api）
- .**process\_bind\_request** (被其他模块依赖的api的获取并绑定请求函数)等通用接口。
- .**start** 模块启动
- .**process\_event** 事件处理
- .**process\_notification** 通知处理

**初始化模块：**

模块在初始化时由fwk\_module.c 中fwk\_module\_start函数，调用回调函数.init,.bind，.start

•模块初始化：调用模块API的init()函数指针

•元素初始化：调用框架模块API的element\_init()函数指针

•后初始化：元素初始化后，模块交互之前的一些可选处理操作

•绑定：模块必须绑定好才能调用对方的api

•开始

**运行时：**

一旦运行前阶段成功完成，固件将开始处理模块或中断引发的事件。默认情况下，固件将永远循环等待新事件在运行前阶段结束时处理，但当事件列表为空时，可以在处理未决事件后返回。

**模块配置：**

模块初始化的时候，模块配置被读入存放到模块上下文中：

const struct fwk\_module\_config  
\*config = module\_config\_table\[i\];  
  
//给模块上下文信息赋值  
  
\*ctx = (struct  
fwk\_module\_context){  
  
.id = id,  
  
.desc = desc,  
  
.config = config,  
  
};

在module\_config\_table在fwk\_module\_list.c中定义，这里以config\_juno\_ppu为例：

const  
struct fwk\_module\_config \*module\_config\_table\[FWK\_MODULE\_IDX\_COUNT\] = {  
  
&config\_juno\_ppu,  
  
struct fwk\_module\_config config\_juno\_ppu = {  
  
.data =  
  
&(struct  
mod\_juno\_ppu\_config){  
  
.timer\_alarm\_id =  
FWK\_ID\_SUB\_ELEMENT\_INIT(  
  
FWK\_MODULE\_IDX\_TIMER,  
  
0,  
  
JUNO\_PPU\_ALARM\_IDX),  
  
},  
  
.elements = FWK\_MODULE\_DYNAMIC\_ELEMENTS(get\_element\_table),  
  
};  
  
#define FWK\_MODULE\_DYNAMIC\_ELEMENTS(GENERATOR)  
\\  
  
{ \\  
  
.type = FWK\_MODULE\_ELEMENTS\_TYPE\_DYNAMIC,  
\\  
  
.generator = (GENERATOR), \\  
  
}

如果类型为FWK\_MODULE\_ELEMENTS\_TYPE\_STATIC ，框架使用表指针中给出的静态表来访问产品为模块提供的元素表。

如果类型为 FWK\_MODULE\_ELEMENTS\_TYPE\_DYNAMIC ，则框架使用生成器函数指针。

get\_element\_table对应一个配置结构体数组：

static  
struct fwk\_element element\_table\[\] = {  
  
\[JUNO\_PPU\_DEV\_IDX\_BIG\_SSTOP\]  
\= {  
  
.name = "",  
  
.data = &(const struct  
mod\_juno\_ppu\_element\_config) {  
  
.reg\_base =  
PPU\_BIG\_SSTOP\_BASE,  
  
.timer\_id =  
FWK\_ID\_ELEMENT\_INIT(FWK\_MODULE\_IDX\_TIMER, 0),  
  
.pd\_type =  
MOD\_PD\_TYPE\_CLUSTER,  
  
},  
  
},  
  
....  
  
enum juno\_ppu\_idx {  
  
JUNO\_PPU\_DEV\_IDX\_BIG\_CPU0,  
  
JUNO\_PPU\_DEV\_IDX\_BIG\_CPU1,  
  
JUNO\_PPU\_DEV\_IDX\_BIG\_SSTOP,  
  
JUNO\_PPU\_DEV\_IDX\_LITTLE\_CPU0,  
  
JUNO\_PPU\_DEV\_IDX\_LITTLE\_CPU1,  
  
JUNO\_PPU\_DEV\_IDX\_LITTLE\_CPU2,  
  
JUNO\_PPU\_DEV\_IDX\_LITTLE\_CPU3,  
  
JUNO\_PPU\_DEV\_IDX\_LITTLE\_SSTOP,  
  
JUNO\_PPU\_DEV\_IDX\_GPUTOP,  
  
JUNO\_PPU\_DEV\_IDX\_SYSTOP,  
  
JUNO\_PPU\_DEV\_IDX\_DBGSYS,  
  
JUNO\_PPU\_DEV\_IDX\_COUNT,  
  
};

struct fwk\_element结构体表示元素，里面有名字，子元素个数和数据

**元素：**

元素表示由模块拥有或管理的资源。每个元素将表示模块与之交互和/或负责的对象。

例如，驱动程序类型的模块可能具有表示它所控制的硬件设备的元素。因为元素配置数据灵活多变，使用通用的方式const void \*data实现。

子元素表示由元素拥有或管理的资源。子元素仅由它们的索引和/或标识符表示。

**索引和标识符：**

由于框架设计为模块化，因此需要一种标准化方法来识别和引用模块、元素、子元素、事件、通知和 API。该框架为此定义了两个组件：indices和identifiers。

**indices：**

模块索引由构建系统为每个固件生成，并放在fwk\_module\_idx.h头文件中。

enum  
fwk\_module\_idx {  
  
FWK\_MODULE\_IDX\_JUNO\_PPU = 0,  
  
FWK\_MODULE\_IDX\_JUNO\_ROM = 1,  
  
......

**identifiers：**

标识符有一个类型，这决定了标识符中包含的信息。在内部，标识符始终包含模块的索引，并且可能包含在该模块的上下文中标识项目的附加索引。也在fwk\_module\_idx.h头文件中，有宏和变量两部分定义，值是一样的：

#define FWK\_MODULE\_ID\_JUNO\_PPU FWK\_ID\_MODULE(FWK\_MODULE\_IDX\_JUNO\_PPU)  
  
#define FWK\_ID\_MODULE(MODULE\_IDX) ((fwk\_id\_t)FWK\_ID\_MODULE\_INIT(MODULE\_IDX))  
  
#define FWK\_ID\_MODULE\_INIT(MODULE\_IDX) \\  
  
{ \\  
  
.common = { \\  
  
.type = (uint32\_t)\_\_FWK\_ID\_TYPE\_MODULE,  
\\  
  
.module\_idx =  
(uint32\_t)MODULE\_IDX, \\  
  
}, \\  
  
}  
  
static const fwk\_id\_t fwk\_module\_id\_juno\_ppu = FWK\_MODULE\_ID\_JUNO\_PPU\_INIT;  
  
#define FWK\_MODULE\_ID\_JUNO\_PPU\_INIT  
FWK\_ID\_MODULE\_INIT(FWK\_MODULE\_IDX\_JUNO\_PPU)

**可用的标识符类型有：**

•模块：仅由模块索引组成

•元素：由模块索引和模块内元素的索引组成

•子元素：由模块索引、模块内元素的索引和该元素拥有的子元素的索引组成。

•API：由模块索引和模块提供的API的索引组成

•事件：由模块索引和模块可能产生的事件的索引组成

•通知：由模块索引和模块可能生成的通知索引组成。

**日志：**

日志记录功能定义并实现了该组件的公共接口。该接口的文档可以在 fwk\_log.h 中找到。

#include  
<fwk\_log.h>  
  
FWK\_LOG\_ERR("\[ROM\] ERROR: Failed to turn on LITTLE cluster.");  
  
\# define FWK\_LOG\_ERR(...)  
fwk\_log\_printf(\_\_VA\_ARGS\_\_)

fwk\_log\_printf（）函数在framework/src/fwk\_log.c中定义。

**4\. event事件**

![](https://pic3.zhimg.com/v2-17ae6d5fb0557d9b7afb6de5b5e32d0e_1440w.jpg)

模块可以给自己或者别的模块发送event事件，事件的参数是结构化消息struct **fwk\_event** 。

static  
int juno\_rom\_process\_event(  
  
const struct fwk\_event \*event,  
  
struct fwk\_event \*resp)  
  
{  
  
truct fwk\_event {  
  
struct fwk\_slist\_node slist\_node;  
  
fwk\_id\_t source\_id;  
  
fwk\_id\_t target\_id;  
  
uint32\_t cookie;  
  
bool is\_response;  
  
bool response\_requested;  
  
bool is\_notification;  
  
bool is\_delayed\_response;  
  
fwk\_id\_t id;  
  
alignas(max\_align\_t) uint8\_t  
params\[FWK\_EVENT\_PARAMETERS\_SIZE\];  
  
};

该事件包含一个response\_requested 属性，该属性指示源实体是否期望对其事件的响应。为了响应这个事件，接收实体填写响应参数，框架发出一个事件，该事件以发出原始事件的实体为目标。

事件的is\_response属性用于指示新生成的事件是对原始事件的响应。

例如在juno\_rom固件初始化时，初始化juno\_rom模块，product/juno/module/juno\_rom/src/mod\_juno\_rom.c

会执行.start回调函数函数juno\_rom\_start（），给自己发了一个event，如下：

static  
int juno\_rom\_start(fwk\_id\_t id)  
  
{  
  
struct fwk\_event event = {  
  
.source\_id =  
fwk\_module\_id\_juno\_rom,  
  
.target\_id =  
fwk\_module\_id\_juno\_rom,  
  
.id =  
mod\_juno\_rom\_event\_id\_run,  
  
};  
  
.....  
  
return fwk\_put\_event(&event);  
  
}  
  
#define fwk\_put\_event(event) \\  
  
\_Generic((event), struct fwk\_event  
\* \\  
  
: \_\_fwk\_put\_event, struct  
fwk\_event\_light \* \\  
  
:  
\_\_fwk\_put\_event\_light)(event)

fwk\_put\_event把event分为两类，fwk\_event\_light 是轻量级的携带不携带额外数据参数。这里我们用fwk\_event 则处理函数为：

```
__fwk_put_event
--》put_event(event,
intr_state, FWK_EVENT_TYPE_STD);
--》fwk_list_push_tail(&ctx.event_queue,
&allocated_event->slist_node);
```

固件状态机运行的时候会循环执行framework/src/fwk\_core.c中process\_next\_event（）函数

static  
void process\_next\_event(void)  
  
{  
  
ctx.current\_event = event =  
FWK\_LIST\_GET(  
  
fwk\_list\_pop\_head(&ctx.event\_queue), struct fwk\_event,  
slist\_node);  
  
module =  
fwk\_module\_get\_ctx(event->target\_id)->desc;  
  
process\_event =  
event->is\_notification? module->process\_notification:  
  
module->process\_event;  
  
status = process\_event(event,  
&async\_response\_event);

这里找到模块juno\_rom，然后取出其event处理函数process\_event并执行，实际执行的是juno\_rom\_process\_event（），其发了一条通知消息如下：

static  
int juno\_rom\_process\_event(  
  
const struct fwk\_event \*event,  
  
struct fwk\_event \*resp)  
  
{  
  
....  
  
/\* Send SYSTOP ON notification \*/  
  
systop\_on\_event =  
  
(struct fwk\_event){  
.response\_requested = true,  
  
.id = mod\_juno\_rom\_notification\_id\_systop,  
  
.source\_id = FWK\_ID\_NONE };  
  
notification\_params = (void  
\*)systop\_on\_event.params;  
  
notification\_params->state =  
(unsigned int)MOD\_PD\_STATE\_ON;  
  
//发notification消息  
  
status =  
fwk\_notification\_notify(&systop\_on\_event, &ctx.notification\_count);  
  
if (!fwk\_expect(status ==  
FWK\_SUCCESS)) {  
  
return FWK\_E\_PANIC;  
  
}  
  
//通过ctx.bootloader\_api->load\_image()调用mod\_bootloader的api，从安全内存拷贝到指定位置，  
  
//在该bootloader 模块api中加载跳转scp\_ramfw。  
  
if (ctx.notification\_count == 0) {  
  
return deferred\_setup();  
  
}

fwk\_notification\_notify的解释见notification章节

**5\. motificaiont通知**

notification涉及到两个模块的通信，跟event的区别是：

•event是一个模块发给另外一个模块或者发给自己，比较确定

•notification是发给订阅了这个模块的所有模块，算广播，需要先进行订阅

notification接口：

•fwk\_notification\_subscribe//订阅指定模块指定通知

•fwk\_notification\_unsubscribe//取消订阅通知

•fwk\_notification\_notify//向订阅该通知的模块发送通知

在实现上notification使用event的消息传递机制，只在发消息和处理消息的时候做微小改动。

例如上面例子中使用fwk\_notification\_notify（）函数发送的通知

int  
fwk\_notification\_notify(struct fwk\_event  
\*notification\_event, unsigned  
int \*count) {  
  
send\_notifications(notification\_event, count);

通知的参数沿用event的struct fwk\_event,发送通知的时候，需要先找到订阅链表，然后进行过滤

static  
void send\_notifications(struct fwk\_event \*notification\_event,  
  
unsigned  
int \*count)  
  
{  
  
//根据id和source\_id找到订阅的链表  
  
subscription\_dlist =  
get\_subscription\_dlist(notification\_event->id,  
  
notification\_event->source\_id);  
  
notification\_event->is\_response  
\= false;  
  
notification\_event->is\_notification = true;  
  
for (node =  
fwk\_list\_head(subscription\_dlist); node!= NULL;  
  
node = fwk\_list\_next(subscription\_dlist,  
node)) {  
  
subscription =  
FWK\_LIST\_GET(node,  
  
struct  
\_\_fwk\_notification\_subscription, dlist\_node);  
  
//对比源id如果相同就进行发送  
  
if (!fwk\_id\_is\_equal(  
  
subscription->source\_id,  
notification\_event->source\_id)) {  
  
continue;  
  
}  
  
notification\_event->target\_id = subscription->target\_id;  
  
status =  
\_\_fwk\_put\_notification(notification\_event);  
  
if (status == FWK\_SUCCESS) {  
  
(\*count)++;  
  
}  
  
}  
  
}

get\_subscription\_dlist函数中source\_id 决定是模块上下文还是元素上下文

.id =  
mod\_juno\_rom\_notification\_id\_systop,  
  
.source\_id = FWK\_ID\_NONE };  
  
static const fwk\_id\_t mod\_juno\_rom\_notification\_id\_systop =  
  
FWK\_ID\_NOTIFICATION\_INIT(  
  
FWK\_MODULE\_IDX\_JUNO\_ROM,  
  
MOD\_JUNO\_ROM\_NOTIFICATION\_IDX\_SYSTOP);

拿到subscription\_dlist订阅列表后，就进行过滤发送通知

int  
\_\_fwk\_put\_notification(struct fwk\_event \*event)  
  
{  
  
event->is\_response = false;  
  
event->is\_notification = true;  
  
return put\_event(event,  
UNKNOWN\_STATE, FWK\_EVENT\_TYPE\_STD);  
  
}

这里就使用了event进行实现。然后系统状态机在处理event的时候，

static  
void process\_next\_event(void)  
  
{  
  
ctx.current\_event = event =  
FWK\_LIST\_GET(  
  
fwk\_list\_pop\_head(&ctx.event\_queue), struct fwk\_event,  
slist\_node);  
  
module =  
fwk\_module\_get\_ctx(event->target\_id)->desc;  
  
process\_event = event->is\_notification? module->process\_notification:  
  
module->process\_event;

根据is\_notification 就可以知道是notification 了，然后调用process\_notification 进行处理

**6\. 模块绑定**

一个模块或元素可以绑定到另一个模块或模块内的元素。目标是相同的 - 获取指向可在后续阶段使用的 API 的指针。当尝试绑定到模块内的元素（而不是模块本身）时，主要区别在于接收和处理绑定请求的模块能够根据目标元素更改其行为。例如，可以允许请求绑定的模块仅绑定到处理请求的模块内的元素子集。

思路： **A模块要与B模块通信，A模块的全局变量要拿到B模块的回调函数** 。

A模块在初始化的时候，会调用自己的bind函数，

bind--》fwk\_module\_bind--》B模块的process\_bind\_request（）函数，从而拿到api

![](https://picx.zhimg.com/v2-e2b61bd2210ac3a4bb6ca9930be55205_1440w.jpg)

scmi\_power\_domain模块调用scmi模块的api函数示例图

scmi\_pd\_ctx.scmi\_api赋值为scmi模块的处理函数，在.bind = scmi\_pd\_bind中，

static  
int scmi\_pd\_bind(fwk\_id\_t id, unsigned int round)  
  
{  
  
status = fwk\_module\_bind(FWK\_ID\_MODULE(FWK\_MODULE\_IDX\_SCMI),  
  
FWK\_ID\_API(FWK\_MODULE\_IDX\_SCMI,  
MOD\_SCMI\_API\_IDX\_PROTOCOL),  
  
&scmi\_pd\_ctx.scmi\_api);

fwk\_module\_bind调用依赖模块提供的process\_bind\_request函数来获取依赖模块的api，并绑定。

int  
fwk\_module\_bind(fwk\_id\_t target\_id,  
fwk\_id\_t api\_id, const void \*api)  
  
{  
  
fwk\_mod\_ctx =  
fwk\_module\_get\_ctx(target\_id);  
  
status =  
fwk\_mod\_ctx->desc->process\_bind\_request(  
  
fwk\_module\_ctx.bind\_id, target\_id, api\_id,  
(const void \*\*)api);

target\_id是FWK\_MODULE\_IDX\_SCMI，对应SCMI模块，fwk\_mod\_ctx 是SCMI模块的上下文

/\*  
SCMI module definition \*/  
  
const struct fwk\_module module\_scmi = {  
  
.api\_count = (unsigned  
int)MOD\_SCMI\_API\_IDX\_COUNT,  
  
.event\_count = 1,  
  
#ifdef BUILD\_HAS\_NOTIFICATION  
  
.notification\_count = (unsigned  
int)MOD\_SCMI\_NOTIFICATION\_IDX\_COUNT,  
  
#endif  
  
.type = FWK\_MODULE\_TYPE\_SERVICE,  
  
.init = scmi\_init,  
  
.element\_init = scmi\_service\_init,  
  
.bind = scmi\_bind,  
  
.start = scmi\_start,  
  
.process\_bind\_request = scmi\_process\_bind\_request,  
  
.process\_event =  
scmi\_process\_event,  
  
#ifdef BUILD\_HAS\_NOTIFICATION  
  
.process\_notification =  
scmi\_process\_notification,  
  
#endif  
  
};

scmi\_process\_bind\_request调用到

static  
int scmi\_process\_bind\_request(fwk\_id\_t source\_id, fwk\_id\_t target\_id,  
  
fwk\_id\_t api\_id, const void \*\*api)  
  
{  
  
unsigned int api\_idx;  
  
struct scmi\_service\_ctx \*ctx;  
  
enum mod\_scmi\_api\_idx api\_id\_type;  
  
api\_idx =  
fwk\_id\_get\_api\_idx(api\_id);  
  
api\_id\_type = (enum  
mod\_scmi\_api\_idx)api\_idx;  
  
switch (api\_id\_type) {  
  
case MOD\_SCMI\_API\_IDX\_PROTOCOL:  
  
if (!fwk\_id\_is\_type(target\_id,  
FWK\_ID\_TYPE\_MODULE)) {  
  
return FWK\_E\_SUPPORT;  
  
}  
  
if (scmi\_ctx.protocol\_count  
\>= scmi\_ctx.config->protocol\_count\_max) {  
  
return FWK\_E\_NOMEM;  
  
}  
  
scmi\_ctx.protocol\_table\[PROTOCOL\_TABLE\_RESERVED\_ENTRIES\_COUNT +  
  
scmi\_ctx.protocol\_count++\].id = source\_id;  
  
\*api = &scmi\_from\_protocol\_api;  
  
break;

到此scmi\_power\_domain模块拿到了scmi模块的处理函数，放入&scmi\_pd\_ctx.scmi\_api

几个关键的模块间api调用示例：

1. mod\_scmi\_power\_domain模块中scmi消息收发：  
	￮scmi模块绑定各个scmi协议模块的protocol\_api，根据id来找到此模块api，执行该protocol;  
	￮scmi\_power\_domain模块绑定scmi模块的api，通过调用scmi\_api（mod\_scmi.c中）来回复该protocol；
2. mod\_scmi.c/transport\_api调用mod\_smt中的transport相关功能来完成scmi协议的transport层（scmi 数据收发及解析）；
3. mod\_smt.c/driver\_api调用scmi更下一级的channel来产生中断（scmi消息通知中断产生和处理）。

后记：

本文只介绍了SCP framwork的通用流程就写了这么多，下次文章介绍 **SCIM通信** 相关的内容，还有些篇幅，就介绍完了。整理的也有些乱，对此有兴趣的可以关注，其他读者可以忽略了。

“ **啥都懂一点** ， **啥都不精通** ，

**干啥都能干** ， **干啥啥不是** ，

**专业入门劝退** ， **堪称程序员杂家** ”。

后续会继续更新，纯干货分析，无广告，不打赏，欢迎转载，欢迎评论交流！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

编辑于 2026-04-08 15:53・上海[RAG学习全流程，存一下吧很难找全了](https://zhuanlan.zhihu.com/p/1985748049927111600)

[

最近一年，LLM展示了强大的能力，但是面对幻觉、最新的知识以及复杂任务时往往略显不足。RAG（Retrieval Augmented Gener...

](https://zhuanlan.zhihu.com/p/1985748049927111600)