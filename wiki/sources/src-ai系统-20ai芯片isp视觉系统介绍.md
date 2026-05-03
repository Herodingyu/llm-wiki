---
doc_id: src-ai系统-20ai芯片isp视觉系统介绍
title: AI系统 20AI芯片ISP视觉系统介绍
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/AI系统/AI系统-20AI芯片ISP视觉系统介绍.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810) 1 人赞同了该文章 ![](https://pic4.zhimg.com/v2-3d0fdb897112193992dfc298c92b3d21_1440w.jpg)

## Key Points

### 1. 1\. 摄像机工作原理介绍
![](https://pic1.zhimg.com/v2-80f095c1e68281224342e5ad96563dda_1440w.jpg)

### 2. 1.1 相机成像整体流程
![](https://pic2.zhimg.com/v2-f1c620755e93dac194f42339c850753d_1440w.jpg) **图像传感器（SENSOR）是一种半导体芯片，其表面包含有几十万到几百万的光电二极管。光电二极管受到光照射时，就会产生电荷。**

### 3. 1.2 sensor原理
![](https://pic1.zhimg.com/v2-08ccadc7bc8d35c6deb4bbc61c0214da_1440w.jpg) 我们都知道彩色是RGB三原色组成的，屏幕显示就是RGB三原色，例如把一个RGB格式的图片显示到屏幕上就是点亮屏幕上对应RGB位置的亮点就可以。这是显示的一个过程，但是这个RGB格式的图片怎么得到？

### 4. 2\. ISP功能介绍
相机看到的转化为人类看的图片就是ISP（Image Signal Processing）要干的活，可以说都是些无厘头的脏活累活。 ![](https://pica.zhimg.com/v2-3e244cc310ea1dee587df8b510d8cd70_1440w.jpg)

### 5. 1.3 拜耳阵列
![](https://pic2.zhimg.com/v2-6af7a62a8229469e83e7c86881e13543_1440w.jpg) 首先拜耳阵列中包含的 **绿色传感器是红色或蓝色传感器的两倍** 。由于人眼对绿光比红光和蓝光更敏感，因此每种原色不会获得总面积的同等比例。

## Evidence

- Source: [原始文章](raw/tech/soc-pm/AI系统/AI系统-20AI芯片ISP视觉系统介绍.md) [[../../raw/tech/soc-pm/AI系统/AI系统-20AI芯片ISP视觉系统介绍.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/AI系统/AI系统-20AI芯片ISP视觉系统介绍.md) [[../../raw/tech/soc-pm/AI系统/AI系统-20AI芯片ISP视觉系统介绍.md|原始文章]]
