---
doc_id: src-内存系列二-深入理解硬件原理
title: 内存系列二：深入理解硬件原理
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/内存系列二：深入理解硬件原理.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog) 公园野鸭 等 1329 人赞同了该文章 > 本篇文章承接上文继续介绍 [DDR内存](https://zhida.zhihu.com/search?content_id=2718035&content_type=Article&match_order=1&q=DDR%E5%86%85%E5%AD%98&zhida_source=entity) 的硬件原理，包括如何 [寻址](https://zhida.zhihu.com/search?content_id=2718035&co

## Key Points

### 1. 寻址(addressing)
为了了解前几天说的几个延迟参数，不得不介绍下 [DIMM](https://zhida.zhihu.com/search?content_id=2718035&content_type=Article&match_order=1&q=DIMM&zhida_source=entity) 的寻址方式。也许你发现了上次介绍 [Rank](https://zhida.zhihu.com/search?co

### 2. 时序（Timing）
一气说了这么多，我不禁口干舌燥，停下来喝了一大口咖啡。小张以为我说完了，着急的问我：“我好像听懂了，不过那好几个数字还没讲呢。”。别着急啊，且听我慢慢道来。正因为访问一个数据需要大致三步，为了保证信号的完整性，步骤直接要有区隔，一起发出来会造成错乱，间隔太近也会为采样带来难度，容易引入噪音。所以时序非常重要，

### 3. 时延（Latency）
小张一看到这个图，不禁大叫:”太复杂了，看得我都犯密集恐惧症了，看不懂！“。没关系，我们拆开了一个个看。 **1\. CL:** CAS Latency。CL是指CAS发出之后，仍要经过一定的时间才能有数据输出，从CAS与读取命令发出到第一笔数据输出的这段时间，被定义为CL（CAS Latency，CAS时延）。由于CL只在读取时出现，所以CL又被称为读取时延（RL，Read Latency）。也

### 4. SPD
说了这么多，小张总算搞懂内存标签条上的4-4-4-8, 5-5-5-15, 所代表的 CL-tRCD-tRP-tRAS-CMD都是啥意思了。不过小张有点搞不懂，这些数据印在纸上消费者是看懂了（实际上似乎没多少人了解），可电脑又没长眼睛，它是怎么知道的呢?其实，每个DIMM在板子上都有块小的存储芯片（EEPROM），上面详细记录了包括这些的很多参数，还有生产厂家的代码等等，这也是BIOS为什么能知道

### 5. 尾声
时间差不多了，我向小张保证下次还会介绍神秘的BIOS如何初始化内存，正要离去。小张拉住了我，说：“你上次挖的坑还没填呢！”“什么坑？”也许是我挖坑太多，记不住了。“就是上次你让我回去想的三个问题。第一个我知道了，DIMM有防呆口，几代DDR防呆口位置不同，插不进去，我在网上google过了，后面两个实在想不出来”。好吧，那我们长话短说，实际上两个问题可以一起回答，今天我们知道DDR每代的各种时延参

## Evidence

- Source: [原始文章](raw/tech/dram/内存系列二：深入理解硬件原理.md) [[../../raw/tech/dram/内存系列二：深入理解硬件原理.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/内存系列二：深入理解硬件原理.md) [[../../raw/tech/dram/内存系列二：深入理解硬件原理.md|原始文章]]
