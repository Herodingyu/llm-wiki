---
title: "基于ARM Cortex-M的SoC存储体系结构和实战"
source: "https://zhuanlan.zhihu.com/p/150491476"
author:
  - "[[吴建明wujianmingwww.zhihu.com/people/3ph8onik]]"
published:
created: 2026-05-02
description: "基于ARM Cortex-M的SoC存储体系结构和实战 System on Chip Architecture Tutorial Memory Architecture for ARM Cortex-M based SoC-Aviral Mittal Memory Architecture for Cortex-M bases System on Chip.一旦你…"
tags:
  - "clippings"
---
11 人赞同了该文章

**System on Chip Architecture Tutorial Memory Architecture for ARM Cortex-M based SoC-Aviral Mittal**

**Memory Architecture for Cortex-M bases System on Chip.**

一旦你完成了处理器的选择（即在ARM Cortex-M家族中），内存架构可能是SoC架构的第二个最重要的方面。内存结构取决于处理器的选择。

例如，如果选择Cortex-M7，则处理器中内置 [指令缓存](https://zhida.zhihu.com/search?content_id=121574698&content_type=Article&match_order=1&q=%E6%8C%87%E4%BB%A4%E7%BC%93%E5%AD%98&zhida_source=entity) 和数据缓存作为选项，因此内存系统可能没有任何缓存。

Cortex-M7还具有紧密耦合存储器（TCMs），它提供非常快速的代码执行（来自指令TCMs）和非常快速的数据访问（来自数据TCMs）。

**NVM Memory choice for code storage.**

现在，由于这项技术是关于无主机SoC的，即一个自给自足的SoC，并且是系统的主要SoC，它应该有 [非易失性存储器](https://zhida.zhihu.com/search?content_id=121574698&content_type=Article&match_order=1&q=%E9%9D%9E%E6%98%93%E5%A4%B1%E6%80%A7%E5%AD%98%E5%82%A8%E5%99%A8&zhida_source=entity) （NVM）用于代码存储，而不像“托管”SoC，它通常从“主机”接收其代码，并且代码最终在SoC的RAM中。

**Flash or R-RAM as NVM for code storage.**

一个流行的选择是NAND Flash。对于28nm以上的几何图形，您也可以使用e-Flash，即嵌入式Flash，即集成在SoC中的闪存，但对于28nm以下的几何图形，由于技术限制，e-Flash通常不可用，因此您可能需要选择外部Flash设备，通常通过SPI接口、四SPI接口（QSPI）或 [八进制](https://zhida.zhihu.com/search?content_id=121574698&content_type=Article&match_order=1&q=%E5%85%AB%E8%BF%9B%E5%88%B6&zhida_source=entity) SPI接口。（OSPI）。但是，如果您想让NVM在SoC上实现更精细的 [几何结构](https://zhida.zhihu.com/search?content_id=121574698&content_type=Article&match_order=1&q=%E5%87%A0%E4%BD%95%E7%BB%93%E6%9E%84&zhida_source=entity) ，可以选择R-RAM（电阻RAM）或M-RAM（磁RAM）。然而，您必须记住，R-RAM是一个昂贵的事情，可以大大增加SoC的成本。

**ROM for code storage**

你可以用ROM，它比Flash或者R-RAM速度快，成本低，功耗低，但是ROM的问题是，它不是很灵活。它不能被覆盖，所以如果你想在后期更新你的系统，ROM不会让它发生。然而，ROM是最“安全”的内存，一般不需要验证或解密等。因此，如果您的系统足够稳定，如果您的代码在系统生命周期内不需要更新，ROM是一种方法。有时，在开发过程中，SoC可能有flash或R-RAM，SoCs的初始版本用flash/R-RAM发布，并且随着代码的成熟，flash/R-RAM被ROM取代。

**OnChip R-RAM Vs Flash:**

![](https://picx.zhimg.com/v2-9536dc615819e9842cc04588d07c49fd_1440w.jpg)

重要的是要考虑到Flash中的代码存储通常是在nandflash中，因为它提供随机访问，而不像NOR Flash那样随机访问是不可能的。

从上表中可以很明显地看出，R-RAM在大多数情况下都是胜出的，因此如果成本允许，并且您的SoC需要更多的性能来降低 [功耗](https://zhida.zhihu.com/search?content_id=121574698&content_type=Article&match_order=2&q=%E5%8A%9F%E8%80%97&zhida_source=entity) ，R-RAM将是NVM的选择。

然而， R-R a M是一项非常新的技术，并且目前非常昂贵，因此，大多数使用 [ARM Cortex-M](https://zhida.zhihu.com/search?content_id=121574698&content_type=Article&match_order=4&q=ARM+Cortex-M&zhida_source=entity) 类处理器的soc仍然具有e-Flash或片外Flash。

注：需要注意的是，R-RAM不能替代片上RAM。它仍然有有限的写入周期~10000，因此不能像在SoC上使用普通RAM那样使用。

从安全角度看片内与片外NVM：

片上NVM可以被认为是更安全的，因为您不需要“认证”NVM，因为它是片上的。然而，片外NVM至少在每次系统启动时都需要“身份验证”，以确保片外设备是真正的设备。

**XIP vs No XIP.**

在考虑NVM时，如果它是Flash或R-RAM（而不是ROM，ROM通常总是XIP），您可能还需要考虑是否需要XIP。XIP执行到位。你可以在这里找到更多关于XIP的信息。 如果您的系统没有高性能要求，XIP可能是一个非常好的建议。它非常经济有效，因为它比片上RAM便宜得多，而且您的代码直接从这个内存执行。即使NVM是片外闪存，使用cache存储器也可以缩小性能差距，为各种应用提供足够的性能。

然而，从片外闪存使用XIP的缺点是高功耗。在片外XIP过程中，您将消耗比将代码一次复制到片上RAM并从片上RAM执行多得多的能量。因此，这些是作为SoC架构师必须做出的权衡。成本/功率/性能。没有对错之路。这取决于你的SoC的用例是什么。

然后不使用XIP意味着代码需要从NVM复制到RAM，这意味着需要更多的内存来存储代码，因为有代码复制。但是在这些情况下，代码在NVM中被压缩，然后解压缩到RAM中，这样可以节省一些内存，但是没有XIP意味着比XIP更多的 [系统内存](https://zhida.zhihu.com/search?content_id=121574698&content_type=Article&match_order=1&q=%E7%B3%BB%E7%BB%9F%E5%86%85%E5%AD%98&zhida_source=entity) 。

The Security Aspect of XIP vs no XIP

从安全的角度来看，XIP将需要所谓的内联解密，因为代码在执行时将被解密，因为代码通常将从NVM中的随机位置获取。但是，如果没有XIP，则解密方法将是“块”解密，即在将整个图像复制到系统RAM时对其进行一次解密。

**Execute In Place (XIP)**

当嵌入式系统在没有电源的情况下启动时，它将执行的第一个代码必须来自非易失性存储器源，例如Flash或ROM。

通常应该有一个“ [bootloader](https://zhida.zhihu.com/search?content_id=121574698&content_type=Article&match_order=1&q=bootloader&zhida_source=entity) ”程序，它将尽可能少地启动和运行系统。

当系统启动时，它没有可用的ram，因此没有可用的堆栈，因此没有可用的内存来 [存储程序](https://zhida.zhihu.com/search?content_id=121574698&content_type=Article&match_order=1&q=%E5%AD%98%E5%82%A8%E7%A8%8B%E5%BA%8F&zhida_source=entity) 变量。因此，处理器运行的第一个代码必须完全使用处理器寄存器。处理器执行的第一个代码也从它所在的位置执行。也就是说，它是“就地执行”（XIP）。它不能试图修改程序本身的任何内容，因为这段代码可能在ROM中，并且代码不能自我修改。

由于上述考虑，处理器通电后执行的第一个程序通常用 [汇编语言](https://zhida.zhihu.com/search?content_id=121574698&content_type=Article&match_order=1&q=%E6%B1%87%E7%BC%96%E8%AF%AD%E8%A8%80&zhida_source=entity) 编写，因为c程序的执行几乎总是需要在读/写存储器（RAM）中设置一个“堆栈”来存储变量，并且在启动或通电时RAM可能不可用。

引导加载程序要做的一件事是使系统RAM可用。然后，它可以将代码从flash重新定位到这个ram中，然后跳到ram来执行这个复制或重新定位的代码。

是的，对于所有的XIP代码，load region=execution region，也就是说，XIP代码存储在根区域中。记住“根区域”的定义是加载地址为=执行地址的区域。

Other applications of XIP:

除了引导加载程序代码之外，XIP在 [嵌入式](https://zhida.zhihu.com/search?content_id=121574698&content_type=Article&match_order=3&q=%E5%B5%8C%E5%85%A5%E5%BC%8F&zhida_source=entity) 世界中也越来越流行，它可以直接从Flash中执行引导代码以外的程序。NOR flash可以像NAND那样随机访问，因此NOR flash显然是这样的XIP存储和就地执行代码的选择。这有助于节省片上ram区域，而这反过来又可以节省成本。当然，执行速度会比RAM执行慢，但是对于许多 [嵌入式应用程序](https://zhida.zhihu.com/search?content_id=121574698&content_type=Article&match_order=1&q=%E5%B5%8C%E5%85%A5%E5%BC%8F%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F&zhida_source=entity) 来说，它带来了成本优势，并提供了足够的性能。

**Load Region Vs Execute Region:**

在典型的 [嵌入式系统](https://zhida.zhihu.com/search?content_id=121574698&content_type=Article&match_order=2&q=%E5%B5%8C%E5%85%A5%E5%BC%8F%E7%B3%BB%E7%BB%9F&zhida_source=entity) 中，当系统断电时，所有的程序和数据都存储在非易失性存储器中。然而，当系统通电时，一些数据或代码可以在执行前（如果是代码）或在使用前（如果是数据）移动到系统SRAM（volatile mem）中。

当用户编译并“链接”程序时，会生成该程序的“图像”。这是系统可以执行的二进制 [可执行文件](https://zhida.zhihu.com/search?content_id=121574698&content_type=Article&match_order=1&q=%E5%8F%AF%E6%89%A7%E8%A1%8C%E6%96%87%E4%BB%B6&zhida_source=entity) 。

二进制“image”通常分为“Read Only”段（包含代码和只读数据）和“Read Write”段（包含可以初始化或零初始化甚至未初始化的数据）。

通常“只读”段甚至可以放入ROM（与flash相反），并且不需要从内存中的位置移动。它是“从它所在的地方执行”即它是在适当的地方执行的。

而“读写”段必须在执行开始前移入系统的读/写存储器，例如SRAM。

因此，对于代码的某些部分，系统关机时该部分所在的 [内存位置](https://zhida.zhihu.com/search?content_id=121574698&content_type=Article&match_order=1&q=%E5%86%85%E5%AD%98%E4%BD%8D%E7%BD%AE&zhida_source=entity) 与系统开机时相同。

但是

对于代码的某些部分，当系统处于关机状态时，该部分所在的内存位置与开机时该部分移动到的内存位置不同。

那么谁来移动代码呢？

[链接器](https://zhida.zhihu.com/search?content_id=121574698&content_type=Article&match_order=1&q=%E9%93%BE%E6%8E%A5%E5%99%A8&zhida_source=entity) 将把代码添加到处理器将要执行的程序中，并移动代码中需要在通电时移动到系统SRAM中的那些部分。

现在，这些代码段在“加载”时有不同的地址，这是在NVM中，而在“执行”时，通常是在SRAM中的某个地方。

因此，程序映像可以有“加载区域=执行区域”的部分，并且这部分代码是“就地执行”XIP。

对于代码的某些其他部分，“加载区域不等于执行区域”，并且这部分代码没有在适当的位置执行。

**Example:**

用户有它的应用程序代码，他编译并链接它以生成名为'图像.bin'. '图像.bin'是14246字节。

这意味着系统必须至少有该数量的NVM可供用户在系统中匹配其二进制图像。

然后，系统将具有一些SRAM（比如16KB，在本例中相当慷慨），这是在0x2000\_0000和0x2000\_3FFF位置。

现在是图像文件的永久地址'图像.bin'将在NVM中，并将占用系统中的 [内存地址](https://zhida.zhihu.com/search?content_id=121574698&content_type=Article&match_order=1&q=%E5%86%85%E5%AD%98%E5%9C%B0%E5%9D%80&zhida_source=entity) 0x0000\_0000到0x0000\_37A6。

因此，整个 [二进制文件](https://zhida.zhihu.com/search?content_id=121574698&content_type=Article&match_order=1&q=%E4%BA%8C%E8%BF%9B%E5%88%B6%E6%96%87%E4%BB%B6&zhida_source=entity) 的加载地址是从0x0000\_0000到0x0000\_37A6。这可以是一个NVM（ [闪存](https://zhida.zhihu.com/search?content_id=121574698&content_type=Article&match_order=4&q=%E9%97%AA%E5%AD%98&zhida_source=entity) ），甚至可以是ROM。

但在执行之前，作为最低要求

应设置 [堆栈内存](https://zhida.zhihu.com/search?content_id=121574698&content_type=Article&match_order=1&q=%E5%A0%86%E6%A0%88%E5%86%85%E5%AD%98&zhida_source=entity) 。

r/w数据（如变量）必须移动到r/w存储器

系统的R/W内存（假设系统中总共有16KB的SRAM可用）位于 [内存映射](https://zhida.zhihu.com/search?content_id=121574698&content_type=Article&match_order=1&q=%E5%86%85%E5%AD%98%E6%98%A0%E5%B0%84&zhida_source=entity) 中的其他位置，并假设它是从0x2000\_0000到0x2000\_3FFF（16KB）。

因此image.bin'将被移动到位于0x2000\_和0x2000\_3FFF之间的内存位置。堆栈指针将被设置为为为“stack”保留一些内存，这些内存也将位于0x2000\_0000和0x2000\_3FFF之间。

因此，对于图像.bin'文件，加载地址=执行地址，并且它保持永久性，并且在0x0000\_0000和0x0000\_37A6之间。这也是XIP，在图像.bin'.

鉴于图像.bin'文件，加载地址在0x0000~0x0000~37A6之间，执行地址在0x2000~0x2000~3FFF之间。i、 e.对于这些部分， [加载地址](https://zhida.zhihu.com/search?content_id=121574698&content_type=Article&match_order=5&q=%E5%8A%A0%E8%BD%BD%E5%9C%B0%E5%9D%80&zhida_source=entity) 不等于它们的执行地址。

**Let us take another example where the Load address is not the same as execution address:**

用户有一个用C编写的关键函数。包含此函数的图像文件放在NVM中。但是，用户希望将此函数移到离处理器非常近的SRAM中，以便快速执行。

现在这个函数有两个内存地址。

1\. 加载地址：当系统关机时，该函数在NVM内存中的位置

2．执行地址：当系统启动并运行时，函数在SRAM内存中的位置。

同样，对于这个函数，加载地址与其执行地址不同。

因此，此代码将不是XIP（就地执行）。

**Conclusion:**

二进制图像中的某些代码可以从内存中的位置执行。此代码永远不会“移动”到内存的另一个区域，并且具有永久地址。当执行此代码时，它是从它所在的位置执行的，这称为就地执行（XIP）。

发布于 2020-06-24 14:41[嵌入式系统](https://www.zhihu.com/topic/19565752)[体系结构](https://www.zhihu.com/topic/19638381)[汇编语言](https://www.zhihu.com/topic/19565122)[IC设计工程师和验证工程师哪一个的发展比较好？](https://www.zhihu.com/question/302613079/answer/49188262164)

[

本科毕业直接入行IC，投FPGA岗，阴差阳错入行DV验证岗。此后的一年多时间，从RTL的功能验证，性能验证（pv）...

](https://www.zhihu.com/question/302613079/answer/49188262164)