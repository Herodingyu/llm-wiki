---
title: "一文搞懂Linux电源管理（合集）"
source: "https://zhuanlan.zhihu.com/p/580754972"
author:
  - "[[黑客与摄影师​东南大学 电子与通信工程硕士]]"
published:
created: 2026-05-02
description: "1， 介绍万物运行遵循能量守恒定律，因此，世界上并不存在永动机，一切运动都需要能量。人走路、思考需要能量，汽车在路上跑需要能量，电子产品运行需要能量。另外，能量并不是取之不尽用之不竭的。动物进化出了冬…"
tags:
  - "clippings"
---
[收录于 · linux功耗管理](https://www.zhihu.com/column/c_1589903721982472192)

78 人赞同了该文章

目录

## 1， 介绍

万物运行遵循 [能量守恒定律](https://zhida.zhihu.com/search?content_id=217190538&content_type=Article&match_order=1&q=%E8%83%BD%E9%87%8F%E5%AE%88%E6%81%92%E5%AE%9A%E5%BE%8B&zhida_source=entity) ，因此，世界上并不存在永动机，一切运动都需要能量。人走路、思考需要能量，汽车在路上跑需要能量，电子产品运行需要能量。另外，能量并不是取之不尽用之不竭的。动物进化出了冬眠，为的就是在天寒地冻，缺乏食物的冬天能够安全地度过。汽车长时间停车，就要熄火，为的就是节省燃料。电子产品在不使用的时候，就要关机或待机，为的就是省电。

对于电子产品的功耗管理是一个系统工程，需要在各使用场景下，用尽可能少的资源、功耗，完成想要的功能，并且还要长续航、不发烫。对于像手机这样的电子产品，为了续航，从供能的角度需要加大电池的电量，但是电池的电量增加，又不想增加体积。因此人们通过各种办法提升能量密度，这样电池可以做的更小，电量更大。不过随着手机支持的屏幕更大，功能更丰富，需要 [DSP](https://zhida.zhihu.com/search?content_id=217190538&content_type=Article&match_order=1&q=DSP&zhida_source=entity) 、 [CNN](https://zhida.zhihu.com/search?content_id=217190538&content_type=Article&match_order=1&q=CNN&zhida_source=entity) 等算力单元做加速，这也需要更多的功耗。高功耗一方面减少了续航；另一方面，也会带来很大的热量，导致手机这样的一个结构、材质、体积的电子产品会发热严重，甚至烫手。

为了解决不必要功耗的消耗，linux提供了多种电源管理方式。为了解决系统不工作时的功耗消耗，linux提供了休眠（suspend to ram or disk）、关机（power off）、复位（reboot）。为了解决运行时不必要的功耗消耗，linux提供了runtime pm、cpu/device dvfs、cpu hotplug、cpu idle、 [clock gate](https://zhida.zhihu.com/search?content_id=217190538&content_type=Article&match_order=1&q=clock+gate&zhida_source=entity) 、 [power gate](https://zhida.zhihu.com/search?content_id=217190538&content_type=Article&match_order=1&q=power+gate&zhida_source=entity) 、reset等电源管理的机制。为了解决运行时电源管理对性能的影响，linux提供了pm qos的功能，用于平衡性能与功耗，这样既能降低功耗，又不影响性能。

## 2， 框架

![](https://pic3.zhimg.com/v2-a9d60176bbc44fdd4613610c2d857efc_1440w.jpg)

linux功耗管理框架

功耗管理不仅是软件的逻辑，还需要硬件功能的支撑。硬件设计决定了功耗的下限，热设计决定了功耗的上限，而软件就是通过一些机制及策略将功耗尽可能逼近硬件功耗下限。

芯片上支持的低功耗机制：power domain、reset、clock、系统休眠/唤醒、cpu的低功耗、ddr自刷新等。系统一般是通过pmic芯片控制供应给各个器件电压、电流大小及有无。外设也支持低功耗模式，或者它们的供电能被开、关。

芯片、电源芯片、系统外设之上便是各个硬件低功耗功能对应的管理框架：

- [Clock framework](https://zhida.zhihu.com/search?content_id=217190538&content_type=Article&match_order=1&q=Clock+framework&zhida_source=entity) ：时钟管理框架（可参考文章《 [一文搞懂linux clock子系统 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/558783244) 》）统一管理系统的时钟资源，这些时钟资源包括pll/mux/div/gate等，对时钟资源操作做封装，维护成一个时钟树，抽象频率获取、频率设置、时钟开关等核心逻辑，为其他驱动子模块提供频率调整、频率查询、使能、失能等接口；
- [Regulator framework](https://zhida.zhihu.com/search?content_id=217190538&content_type=Article&match_order=1&q=Regulator+framework&zhida_source=entity) ：电压管理框架（可参考文章《 [一文搞懂linux regulator子系统 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/565532795) 》）统一管理系统的供电资源。这些供电资源包括pmic、corebuck等，对供电资源操作做封装，一般通过iic、spi、gpio、pwm等控制供电资源的电压、电流调整或者开/关，为其他驱动或者框架提供电压、电流调整、开关等接口；
- Power domain framework：power domain管理框架（可参考文章《 [一文搞懂linux power domain framework - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/578780233) 》）统一管理芯片的power domain。对芯片内的power domain开关操作做封装，抽象核心的开关处理逻辑，为runtime pm、系统休眠唤醒提供开关等接口；
- Reset framework：reset管理框架（可参考文章《 [一文搞懂linux reset framework](https://zhuanlan.zhihu.com/p/583021396) 》）统一管理芯片的复位。对芯片内的reset、dereset寄存器操作做封装。抽象核心的reset/dereset处理逻辑，为其他驱动提供统一的reset/dereset等接口；
- Opp framework：opp（Operating Performance Point）管理框架（可参考文章《 [一文搞懂linux device dvfs - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/585218834?) 》）统一管理使CPU或者Devices正常工作的电压和频率组合。内核提供这个Layer，是为了给出一些相对固定的电压和频率组合，从而使调频调压变得更为简单；
- Runtime pm：runtime pm管理框架（可参考文章《 [一文搞懂Linux runtime pm - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/576243151) 》）统一管理片内设备及相应power domain硬件操作。是在power domain提供的开关接口及设备运行时对应的时钟、复位、电的管理基础之上做的封装，设备会在dts指定具体的power domain，设备驱动通过在runtime\_suspend、runtime\_resume实现对时钟、复位、电的管理，然后注册到runtime pm框架。runtime pm为设备提供了pm\_runtime\_get\_xxx/pm\_runtime\_put\_xxx类接口，在使用设备前，先调用get接口，让设备退出低功耗，在使用完设备后调用put接口，让设备进入低功耗，当power domain下所有的设备都进低功耗后，就可以关闭power domain，当power domain下有一个设备需要工作时，就要打开power domain；
- Device dvfs：device dvfs管理框架（可参考文章《 [一文搞懂linux device dvfs - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/585218834?) 》）统一管理设备的频率及电压调整，利用opp framework提供的接口，根据设备驱动给定的频率进行调频调压，跟cpu dvfs很类似；
- Sleep：系统休眠唤醒（可参考文章《 [一文搞懂linux系统休眠唤醒 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/568050822) 》）能在系统不被使用的时候，进入一个功耗很低的状态，芯片功耗会很低，ddr进入自刷新，并且在系统被使用的时候，能够快速地恢复。休眠唤醒的过程中会调用device提供的system suspend、resume函数，调用power domain提供的suspend、resume函数，会关闭、打开cpuidle/cpuhotplug功能；
- Reboot/poweroff：系统重启/关机，重启和关机两个功能关系很紧密，可以简单地理解重启就是先关机再开机。系统重启能在系统出现异常后，或者在系统升级后，进行系统的复位。系统关机一般是用户不再使用机器，或者系统检测到用户不再使用或者可预见的时间不再使用，将系统断电的操作。系统重启和系统关机都是由reboot系统调用实现的，只是相应的参数不一。Service发起重启和关机后，事件会给到init进程来处理。Init会保存一些数据，停止所有srvice，杀死普通进程，最后调用系统调用reboot进行重启或者关机；
- Cpu idle：cpu idle管理框架（可参考文章《 [一文搞懂linux cpu idle - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/548268554) 》）会根据当前一段时间cpu的空闲状态及接下来空闲时间的预估，选择进入相应idle等级，不同的等级功耗收益不同，进出时间也不一样，一般功耗收益低，但对应着比较少的退出时间；
- Cpu dvfs：cpu dvfs管理框架（可参考文章《 [一文搞懂linux cpu dvfs - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/550923783) 》）提供了不同governor，用来控制cpu的频率、电压调整，这些governor有完全把cpu dvfs交给用户service的，用户service根据场景的不同进行相应的频率、电压调整，也有根据负载进行动态频率、电压调整的；
- Cpu hotplug：cpu hotplug管理框架（可参考文章《 [一文搞懂linux cpu hotplug - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/545550388) 》）提供了一种机制给到service：当前的空闲cpu loading比较多时，会由service直接拔掉一些cpu，当cpu loading的需求增加时，再由service将cpu插上；
- Pm qos：pm qos（quality of service）服务质量（可参考文章《 [一文搞懂linux PM QOS - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/561000691) 》）是解决低功耗可能会降低性能的问题，它向驱动或者上层service提供了一套对性能约束要求的接口，在cpu dvfs、cpu idle等低功耗管理的时候，会检查性能的约束需求，当发现低功耗动作会影响到性能的时候，便不会进行该次的低功耗操作；

上层service会有专门的功耗管理应用，用来协调其他service进入休眠、唤醒，在进入不同场景的时候告知各service做相应的功耗策略。

## 3， 内核中各低功耗管理模块框架

### 3.1 clock framework

详见文章《 [一文搞懂linux clock子系统 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/558783244) 》

![](https://picx.zhimg.com/v2-746f6cf9fc2941792624887da8c07991_1440w.jpg)

clock framework框架

### 3.2 Regulator framework

详见文章《 [一文搞懂linux regulator子系统 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/565532795) 》

![](https://pic3.zhimg.com/v2-1bfae715afd9902baa119693cee5f6a2_1440w.jpg)

regulator framework

### 3.3 Power domain framework

详见文章《 [一文搞懂linux power domain framework - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/578780233) 》

![](https://pic3.zhimg.com/v2-25cb26a489758238af9618a642ff8684_1440w.jpg)

power domain framework

### 3.4 Reset framework

详见文章《 [一文搞懂linux reset framework](https://zhuanlan.zhihu.com/p/583021396) 》

![](https://pic1.zhimg.com/v2-3fa181557b305b5d6f5283e625d217bc_1440w.jpg)

reset framework

### 3.5 Opp framework

opp framework比较简单，就不单独用一篇文章讲述，在文章《 [一文搞懂linux device dvfs - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/585218834?) 》对opp framework也有介绍。

### 3.6 Runtime pm

详见文章《 [一文搞懂Linux runtime pm - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/576243151) 》

![](https://picx.zhimg.com/v2-6bef311e28d15cc972f5c3752688b2f5_1440w.jpg)

rpm 框架

### 3.7 Device dvfs

详见文章《 [一文搞懂linux device dvfs - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/585218834?) 》

![](https://pic3.zhimg.com/v2-801e9917c5f254770f0f24751b590f0e_1440w.jpg)

linux device dvfs框架

### 3.8 system suspend&resume

详见文章《 [一文搞懂linux系统休眠唤醒 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/568050822) 》

![](https://picx.zhimg.com/v2-251537473d743e8aafff32e3380a251b_1440w.jpg)

系统休眠唤醒框架

### 3.9 Cpu idle

详见文章《 [一文搞懂linux cpu idle - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/548268554) 》

![](https://picx.zhimg.com/v2-c479d9eaffb5ac5b324cbadfdc9d2a4f_1440w.jpg)

cpuidle framework

### 3.10 Cpu dvfs

详见文章《 [一文搞懂linux cpu dvfs - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/550923783) 》

![](https://picx.zhimg.com/v2-d9ec3246549443757e5765c10c54dc6f_1440w.jpg)

cpu dvfs framework

### 3.11 Cpu hotplug

详见文章《 [一文搞懂linux cpu hotplug - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/545550388) 》

![](https://pic3.zhimg.com/v2-ef27dcbb5b18c93aa1238721c54e236a_1440w.jpg)

cpu hotplug

### 3.12 Pm qos

详见文章《 [一文搞懂linux PM QOS - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/561000691) 》

![](https://pica.zhimg.com/v2-d95a09fa85f829c4a2dea61b650b74d2_1440w.jpg)

pm qos framework

（平时会分享linux技术干货文章，关注我可以定期收到相关文章的推送，知乎、微信同名：黑客与摄影师）

还没有人送礼物，鼓励一下作者吧

编辑于 2024-04-02 14:32・浙江