---
title: "【系统DFX】如何诊断占用过多 CPU、内存、IO 等的神秘进程？"
source: "https://zhuanlan.zhihu.com/p/679457375"
author:
  - "[[TrustZone​​​海思技术有限公司 员工]]"
published:
created: 2026-05-03
description: "热门面试问题：如何诊断占用过多 CPU、内存、IO 等的神秘进程？ 下图展示了 Linux 系统中有用的工具。 vmstat - 报告有关进程、内存、分页、块 IO、陷阱和 CPU 活动的信息。 iostat - 报告系统的 CPU 和输入/输出…"
tags:
  - "clippings"
---
[收录于 · ARM/Linux嵌入式](https://www.zhihu.com/column/c_1892354515245703770)

2 人赞同了该文章

> **热门面试问题：如何诊断占用过多 CPU、内存、IO 等的神秘进程？**

---

下图展示了 Linux 系统中有用的工具。

![](https://pic3.zhimg.com/v2-90295eaf6255ca315baafd18c0df5a5c_1440w.jpg)

---

[vmstat](https://zhida.zhihu.com/search?content_id=239120546&content_type=Article&match_order=1&q=vmstat&zhida_source=entity) - 报告有关进程、内存、分页、块 IO、陷阱和 CPU 活动的信息。

[iostat](https://zhida.zhihu.com/search?content_id=239120546&content_type=Article&match_order=1&q=iostat&zhida_source=entity) - 报告系统的 CPU 和输入/输出统计信息。

[netstat](https://zhida.zhihu.com/search?content_id=239120546&content_type=Article&match_order=1&q=netstat&zhida_source=entity) - 显示与 IP、TCP、UDP 和 ICMP 协议相关的统计数据。

[lsof](https://zhida.zhihu.com/search?content_id=239120546&content_type=Article&match_order=1&q=lsof&zhida_source=entity) - 列出当前系统打开的文件。

[pidstat](https://zhida.zhihu.com/search?content_id=239120546&content_type=Article&match_order=1&q=pidstat&zhida_source=entity) - 监视所有或指定进程对系统资源的利用率，包括 CPU、内存、设备 IO、任务切换、线程等。

发布于 2024-01-24 00:31・四川[3分钟~带你详细了解PMP到底是什么？](https://zhuanlan.zhihu.com/p/697219145)

[

一、PMP是什么？PMP（Project Management Professional），指的是项目管理专业人士...

](https://zhuanlan.zhihu.com/p/697219145)