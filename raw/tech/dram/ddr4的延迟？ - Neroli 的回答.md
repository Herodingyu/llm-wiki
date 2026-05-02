---
title: "ddr4的延迟？ - Neroli 的回答"
source: "https://www.zhihu.com/question/67547623/answer/254074644"
author:
  - "[[Neroli计算机体系结构缓存/精品咖啡/户外/龙猫​ 关注]]"
  - "[[嗒小木]]"
  - "[[Sinaean Dean计算机体系结构-CPU/GPU-操作系统-渲染-AI​ 关注]]"
published:
created: 2026-05-02
description: "来 给你看这个论文作者写的到底该怎么计算延迟  http://ieeexplore.ieee.org/document/6844484/#full-tex…"
tags:
  - "clippings"
---
7 人赞同了该回答

来 给你看这个论文作者写的到底该怎么计算延迟

[ieeexplore.ieee.org/doc](https://link.zhihu.com/?target=http%3A//ieeexplore.ieee.org/document/6844484/%23full-text-section)

这货就是写 [gem5](https://zhida.zhihu.com/search?content_id=76264963&content_type=Answer&match_order=1&q=gem5&zhida_source=entity) 里面dram controller的那个，这篇论文里有详细介绍各部分延迟是怎么算的。

下面是他写的某DDR4的参数

\# A single DDR4-2400 x64 channel (one command and address bus), with

\# timings based on a DDR4-2400 4 Gbit datasheet (Micron MT40A512M8)

\# in an 8x8 configuration.

class DDR4\_2400\_x64(DRAMCtrl):

\# size of device

device\_size = '512MB'

\# 8x8 configuration, 8 devices each with an 8-bit interface

device\_bus\_width = 8

\# DDR4 is a BL8 device

burst\_length = 8

\# Each device has a page (row buffer) size of 1 Kbyte (1K columns x8)

device\_rowbuffer\_size = '1kB'

\# 8x8 configuration, so 8 devices

devices\_per\_rank = 8

\# Match our DDR3 configurations which is dual rank

ranks\_per\_channel = 2

\# DDR4 has 2 (x16) or 4 (x4 and x8) bank groups

\# Set to 4 for x4, x8 case

bank\_groups\_per\_rank = 4

\# DDR4 has 16 banks (4 bank groups) in all

\# configurations. Currently we do not capture the additional

\# constraints incurred by the bank groups

banks\_per\_rank = 16

\# override the default buffer sizes and go for something larger to

\# accommodate the larger bank count

write\_buffer\_size = 128

read\_buffer\_size = 64

\# 1200 MHz

tCK = '0.833ns'

\# 8 beats across an x64 interface translates to 4 clocks @ 1200 MHz

\# tBURST is equivalent to the CAS-to-CAS delay (tCCD)

\# With bank group architectures, tBURST represents the CAS-to-CAS

\# delay for bursts to different bank groups (tCCD\_S)

tBURST = '3.333ns'

\# @2400 data rate, tCCD\_L is 6 CK

\# CAS-to-CAS delay for bursts to the same bank group

\# tBURST is equivalent to tCCD\_S; no explicit parameter required

\# for CAS-to-CAS delay for bursts to different bank groups

tCCD\_L = '5ns';

\# DDR4-2400 17-17-17

tRCD = '14.16ns'

tCL = '14.16ns'

tRP = '14.16ns'

tRAS = '32ns'

\# RRD\_S (different bank group) for 1K page is MAX(4 CK, 3.3ns)

tRRD = '3.3ns'

\# RRD\_L (same bank group) for 1K page is MAX(4 CK, 4.9ns)

tRRD\_L = '4.9ns';

tXAW = '21ns'

activation\_limit = 4

tRFC = '350ns'

tWR = '15ns'

\# Here using the average of WTR\_S and WTR\_L

tWTR = '5ns'

\# Greater of 4 CK or 7.5 ns

tRTP = '7.5ns'

\# Default same rank rd-to-wr bus turnaround to 2 CK, @1200 MHz = 1.666 ns

tRTW = '1.666ns'

\# Default different rank bus delay to 2 CK, @1200 MHz = 1.666 ns

tCS = '1.666ns'

\# <=85C, half for >85C

tREFI = '7.8us'

\# Current values from datasheet

IDD0 = '64mA'

IDD02 = '4mA'

IDD2N = '50mA'

IDD3N = '67mA'

IDD3N2 = '3mA'

IDD4W = '180mA'

IDD4R = '160mA'

IDD5 = '192mA'

VDD = '1.2V'

VDD2 = '2.5V'

[编辑于 2017-11-03 00:17](https://www.zhihu.com/question/67547623/answer/254074644)[如何避免缓存击穿？超融合常驻缓存和多存储池方案对比](https://zhuanlan.zhihu.com/p/10395785735)

[

作者：SmartX 解决方案专家 钟锦锌 很多运维人员都知道，混合存储介质配置可能会带来“ 缓存击穿 ”的问题，尤其是大数据分析...

](https://zhuanlan.zhihu.com/p/10395785735)

#### 更多回答

如果你想算的是cpu发出一次访存指令，经历了L1miss L2miss LLC miss，然后发到内存控制器里，再经过调度，拆分，一系列处理然后从内存控制器取数返回再把上述通路一个个填回去这个过程要经历多少纳秒的话内存参数肯定不是最大的延迟。如果你问的是从内存控制器发出请求到内存控制器取回数据的话那行命中的延迟就是14\*2(拍)/2133(Mhz)，行冲突的话比较麻烦，如果与上次访问间隔较长，那么延迟就是(14+14)\*2/2133， 如果是两个相邻的命令冲突，那么延迟就是(14+14+14)\*2/2133

泻药，爪机无力，从问题看你应该是行家，找个ddr4 spec，前面有时序图，按照时序图算一下就行了。

![](chrome-extension://difoiogjjojoaoomphldepapgpbgkhkb/assets/logo-O35E636P.png) Sider

[导游称大熊猫花花是残疾游客秒报警 340 万](https://www.zhihu.com/search?q=%E5%AF%BC%E6%B8%B8%E7%A7%B0%E5%A4%A7%E7%86%8A%E7%8C%AB%E8%8A%B1%E8%8A%B1%E6%98%AF%E6%AE%8B%E7%96%BE%E6%B8%B8%E5%AE%A2%E7%A7%92%E6%8A%A5%E8%AD%A6&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[孙杨被曝疑违规录取博士 335 万](https://www.zhihu.com/search?q=%E5%AD%99%E6%9D%A8%E8%A2%AB%E6%9B%9D%E7%96%91%E8%BF%9D%E8%A7%84%E5%BD%95%E5%8F%96%E5%8D%9A%E5%A3%AB&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[女子徒手给月子里宝宝打耳洞 294 万](https://www.zhihu.com/search?q=%E5%A5%B3%E5%AD%90%E5%BE%92%E6%89%8B%E7%BB%99%E6%9C%88%E5%AD%90%E9%87%8C%E5%AE%9D%E5%AE%9D%E6%89%93%E8%80%B3%E6%B4%9E&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[曝吴宣仪提出解约遭乐华拒绝 289 万](https://www.zhihu.com/search?q=%E6%9B%9D%E5%90%B4%E5%AE%A3%E4%BB%AA%E6%8F%90%E5%87%BA%E8%A7%A3%E7%BA%A6%E9%81%AD%E4%B9%90%E5%8D%8E%E6%8B%92%E7%BB%9D&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[阿 Sa 蔡卓妍官宣结婚 289 万](https://www.zhihu.com/search?q=%E9%98%BF+Sa+%E8%94%A1%E5%8D%93%E5%A6%8D%E5%AE%98%E5%AE%A3%E7%BB%93%E5%A9%9A&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[广州地铁有人喷洒不明液体 266 万](https://www.zhihu.com/search?q=%E5%B9%BF%E5%B7%9E%E5%9C%B0%E9%93%81%E6%9C%89%E4%BA%BA%E5%96%B7%E6%B4%92%E4%B8%8D%E6%98%8E%E6%B6%B2%E4%BD%93&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)