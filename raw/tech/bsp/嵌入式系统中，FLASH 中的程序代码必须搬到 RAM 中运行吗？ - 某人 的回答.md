---
title: "嵌入式系统中，FLASH 中的程序代码必须搬到 RAM 中运行吗？ - 某人 的回答"
source: "https://www.zhihu.com/question/387640455/answer/1177762308"
author:
  - "[[某人​ 关注]]"
  - "[[Javen​​电子设备制造业 从业人员]]"
  - "[[嵌入式电子]]"
published:
created: 2026-05-02
description: "能不能在Flash中直接运行程序代码，取决于Flash的访问特性。Flash存储器是按块组织的，在使用时也倾向于…"
tags:
  - "clippings"
---
101 人赞同了该回答

能不能在Flash中直接运行程序代码，取决于Flash的访问特性。

[Flash存储器](https://zhida.zhihu.com/search?content_id=244209504&content_type=Answer&match_order=1&q=Flash%E5%AD%98%E5%82%A8%E5%99%A8&zhida_source=entity) 是按块组织的，在使用时也倾向于按块访问才更加高效。Flash类似于ROM一类的存储器，但它其实是可读可写的，不同于同样可读可写的RAM，它在写入数据时需要先将你所写位置所属的块擦除，不管你是不是只写几个字节，所以如果要改写Flash中的数据，总是会先将数据所属的块缓存到内存中，然后再在内存中改写好数据后又重新将块写回，这样就不会丢失数据，但是花销太大。读的时候，往往也是先定位块的位置，然后在块中顺序读取，在不同块中间断读取数据是非常低效的，所以按块读按块写是Flash的一大特点，它不能够随意的对存储区域寻址，典型的如NAND Flash。

不过有一类Flash存储器在读取数据时可以做到任意的寻址而不会有太大的花销，它的读操作是接近于RAM的，而写操作依然延续了按块擦除然后再按块写的特点，典型的如 [NOR Flash](https://zhida.zhihu.com/search?content_id=244209504&content_type=Answer&match_order=1&q=NOR+Flash&zhida_source=entity) 。

所以正因为这样的特性，Flash通常用于存储不需要频繁改动的掉电不能丢失的数据。

介绍完背景知识，回到你的提问：

首先要清楚的是，CPU需要在存储器中读取指令，指令地址由PC寄存器给出，每执行完一条指令PC会自动的指向下一条指令，如果指令的长度不等会使得给出的地址不总是有一致的对齐，其次程序运行总会伴随跳转，这使得指令的寻址更具有随意性，所以说要直接在某种存储器中执行程序，至少读取数据时要能够任意寻址，而NOR Flash是刚好能满足要求的，市面上常见的 [MCU](https://zhida.zhihu.com/search?content_id=244209504&content_type=Answer&match_order=1&q=MCU&zhida_source=entity) 内置的Flash就是这种类型，所以能够直接在上面运行存储的程序，而不需要加载到RAM中。其他不具备这种访问特性的存储器是不能直接在上面执行程序的，必须转移到满足这种特性的存储器当中执行，比如加载到RAM。

1、FLASH中的代码是如何得到运行的呢？比如PC指针是在哪里由谁设置的？

采用 [cortex- m内核](https://zhida.zhihu.com/search?content_id=244209504&content_type=Answer&match_order=1&q=cortex-+m%E5%86%85%E6%A0%B8&zhida_source=entity) 的MCU会根据外部启动配置引脚的电平，将启动存储器映射到0x00000000地址，如果是在Flash启动，在内部Flash的起始位置会存储一张 [异常中断向量表](https://zhida.zhihu.com/search?content_id=244209504&content_type=Answer&match_order=1&q=%E5%BC%82%E5%B8%B8%E4%B8%AD%E6%96%AD%E5%90%91%E9%87%8F%E8%A1%A8&zhida_source=entity) ，表中的第一项和第二项存储了初始的栈地址和复位向量，这张表的位置是可配置的，而复位后的位置正是在0x00000000地址。硬件上电复位后，SP，PC寄存器会自动依次设置为表中的前两项，然后根据PC设置的初始值开始执行代码，所以说PC的值是在复位时是自动设置的。

2、这些代码需要搬到RAM中才能运行吗？不这样做会有什么不妥吗？

正如前面叙述的，并不必要。在RAM中执行可能会得到更好的执行性能，但是对于MCU内部的Nor Flash来说是没有必要的。有一点要提及的是，程序一般会由代码段txt，只读数据段rodata，初始化数据段data和未初始化数据段bss(并无数据)组成，只读数据段因为和代码段一样不需要改动，所以可以留在Flash当中 ，但是需要将也存储在Flash中的data段加载到RAM中以及空出空间给bss。这是运行环境的初始化，是有搬运的，只是搬运的不是代码，这发生在进入main函数之前。

3、如果需要搬到RAM，那是片内还是片外有什么区别吗？

在片内的RAM性能会更好，但是容量一般不能做的太大。

4、如果用户存在FLASH的实际代码大小（比如1MB），超过了RAM的可用空间（比如512KB），那这个搬移过程是啥样的？

是可以分阶段加载执行的，但是对程序的组织会变得复杂，运行变得低效，如果出现了这种情况应该考虑更换硬件配置或者对程序优化裁剪。

5、片外扩展的FLASH和 [SRAM](https://zhida.zhihu.com/search?content_id=244209504&content_type=Answer&match_order=1&q=SRAM&zhida_source=entity) 与片内的想比，除了空间大小有差别，性能速度上会有怎样的差异呢？

这取决于存储器的时钟速率和访问延迟，集成在内部的存储器性能一般是能比片外的更好的，所以要使程序有更高的运行性能应该优先使用内部存储器。低端MCU由于运行速率低，内部和外部不会有太大的区别。

#### 更多回答

![](https://pic1.zhimg.com/50/v2-2adcf030ddc6cc3c16d46c0af36d014f_720w.jpg?source=1def8aca)

![](https://pic1.zhimg.com/50/v2-99bb859aa35c6fc005169b2f229b3529_720w.jpg?source=1def8aca)

前面写了一篇 STM32的完整启动流程分析，但是感觉有些地方没有完全理明白，因此对不清楚的地方又做了一些总结。 1. MCU最开始一启动后去哪里读代码？ CPU上电启动后被设计为去地址0x00000000位置处读取代码；首先会连续读取两个字，分别是栈指针初始值和复位异常处理函数的地址；然后跳去执行复位异常处理函数。 当然在一些早期的ARM处理器设计中，如Arm7TDMI，复位后会直接读取0地址处的代码进行执行，由软件初始化栈指针，0地址处存放的直接就是中断处理函数，而不是函数地址。 所以我们可以有理由推测出，第一个字是栈地址是因为接下来的复位中断处理函数涉及函数跳转，可能已经需要存放内容在栈里了。 2. 0x0地址处是bootROM代码吗，还是用户bootloader代码？ 答案是都可以。这其实取决于用户的代码是存放在哪里的。 比如说对于一些性能强的MCU（如Cortex-A系列）来说，代码本身体积比较大，存放在SD卡里或者QSPI/SPI Flash里都有可能，这些MCU启动一定是先去bootROM执行代码，因为SD卡、SPI Flash的储存不在MCU的统一编址空间里，没初始化这些外设前根本无法访问，bootROM这块Nor Flash就一定是可以被MCU直接通过总线地址访问的，0地址的代码位于bootROM中。代码从bootROM中起来后，通过启动引脚判断从哪个外设中搬用户程序，并去初始化相应外设，将外设中存储的用户代码搬到内部SRAM中执行。后续的启动流程不赘述。 对于一些小容量的MCU来说，比如Cortex-M3/M4，他们的芯片里有内置Flash，这个Flash的特点跟上面说的bootROM很像，是MCU可以直接通过地址总线去访问到的，不需要进行外设初始化的。当然，这些MCU内部也是有bootROM的，因此这些MCU一上电可以选择从bootROM中启动，也可以选择从内置Flash中启动，是通过外部引脚进行选择的，选择了谁，就把谁的起始地址映射到0地址处。 3. 类似Cortex-M3/M4是如何保证Flash起始地址是栈指针和复位异常处理函数指针的？ 这一点实际是通过编译的链接文件制定的。比如说如下是我截取的IAR的链接文件.icf。 4. MCU有可能不从0地址开始读代码吗？ M7内核芯片比较灵活了，改变了固定从0x0000 0000地址读取中断向量表的问题，以STM32H7为例，可以从 0x0000 0000 到 0x3FFF 0000 所有地址进行启动。专门安排了个选项字节来配置。 定期以通俗易懂的方式分享嵌入式知识，关注公众号，加星标，每天进步一点点。

![](chrome-extension://difoiogjjojoaoomphldepapgpbgkhkb/assets/logo-O35E636P.png) Sider

[导游称大熊猫花花是残疾游客秒报警 340 万](https://www.zhihu.com/search?q=%E5%AF%BC%E6%B8%B8%E7%A7%B0%E5%A4%A7%E7%86%8A%E7%8C%AB%E8%8A%B1%E8%8A%B1%E6%98%AF%E6%AE%8B%E7%96%BE%E6%B8%B8%E5%AE%A2%E7%A7%92%E6%8A%A5%E8%AD%A6&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[孙杨被曝疑违规录取博士 335 万](https://www.zhihu.com/search?q=%E5%AD%99%E6%9D%A8%E8%A2%AB%E6%9B%9D%E7%96%91%E8%BF%9D%E8%A7%84%E5%BD%95%E5%8F%96%E5%8D%9A%E5%A3%AB&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[女子徒手给月子里宝宝打耳洞 294 万](https://www.zhihu.com/search?q=%E5%A5%B3%E5%AD%90%E5%BE%92%E6%89%8B%E7%BB%99%E6%9C%88%E5%AD%90%E9%87%8C%E5%AE%9D%E5%AE%9D%E6%89%93%E8%80%B3%E6%B4%9E&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[曝吴宣仪提出解约遭乐华拒绝 290 万](https://www.zhihu.com/search?q=%E6%9B%9D%E5%90%B4%E5%AE%A3%E4%BB%AA%E6%8F%90%E5%87%BA%E8%A7%A3%E7%BA%A6%E9%81%AD%E4%B9%90%E5%8D%8E%E6%8B%92%E7%BB%9D&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[阿 Sa 蔡卓妍官宣结婚 290 万](https://www.zhihu.com/search?q=%E9%98%BF+Sa+%E8%94%A1%E5%8D%93%E5%A6%8D%E5%AE%98%E5%AE%A3%E7%BB%93%E5%A9%9A&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[广州地铁有人喷洒不明液体 267 万](https://www.zhihu.com/search?q=%E5%B9%BF%E5%B7%9E%E5%9C%B0%E9%93%81%E6%9C%89%E4%BA%BA%E5%96%B7%E6%B4%92%E4%B8%8D%E6%98%8E%E6%B6%B2%E4%BD%93&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)