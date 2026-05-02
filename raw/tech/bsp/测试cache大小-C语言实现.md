---
title: "测试cache大小-C语言实现"
source: "https://zhuanlan.zhihu.com/p/128110829"
author:
  - "[[无名之辈SOME DREAMS ARE TOO BIG TO DIE]]"
published:
created: 2026-05-02
description: "1. 简介在实际CPU从内存中取数时很多时候从cache中存取，在这个实验中使用C语言编成估计cache的大小。 2. 实验思路当一个数组的大小超过cache的大小时，随机读取数组的元素会发生cache的替换现象。如果要存取的数…"
tags:
  - "clippings"
---
4 人赞同了该文章

### 1\. 简介

在实际CPU从内存中取数时很多时候从cache中存取，在这个实验中使用C语言编成估计cache的大小。

### 2\. 实验思路

当一个数组的大小超过cache的大小时，随机读取数组的元素会发生cache的替换现象。如果要存取的数据经常不在cache中（被替换出去/没有载入），CPU需要多次从内存中读取数据。

从内存中读取数据的时间远大与从cache中读取的时间，因此从如果数组大于cache size那么多次随即读取的时间会增加。当随即读取时间出现显著增加时，数组的大小即为cache size的 [估计量](https://zhida.zhihu.com/search?content_id=116600051&content_type=Article&match_order=1&q=%E4%BC%B0%E8%AE%A1%E9%87%8F&zhida_source=entity) 。

### 3\. 代码

代码本身比较简单。注释也都比较详细，直接上代码。

```c
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <time.h>

#define READ_TIMES 999999999
#define TEST_RANGE 24

int main()
{
    int i;
    // 每次要测试的内存块大小
    int *block_size = (int *)calloc(TEST_RANGE, sizeof(int));
    for (i = 0; i < TEST_RANGE; ++i)
        block_size[i] = pow(2, i);

    srand(time(NULL));
    // 每次循环测试大小为block_size[i]的数组随即读取的时间
    for (i = 0; i < TEST_RANGE; ++i)
    {
        // 用size代替block_size[i]减少代码量
        int size = block_size[i];
        // 创建大小为block_size[i]的数组
        int *block = (int *)calloc(size, sizeof(int));

        int j, temp;
        clock_t start = clock(), total_time;
        // 开始随即读取
        for(j = 0; j < READ_TIMES; ++j)
            temp += block[rand() % size];
        total_time = clock() - start;

        // 由于数组是int类型，因此最终大小要乘 sizeof(int)
        printf("At size: %ldB, we need %lf sec\n", size * sizeof(int),\
            (double)total_time / CLOCKS_PER_SEC);
    }
    return 0;
}
```

### 4\. 运行结果

得到的运行结果如下

```
At size: 4B, we need 8.686316 sec
At size: 8B, we need 8.830951 sec
At size: 16B, we need 8.271359 sec
At size: 32B, we need 8.633918 sec
At size: 64B, we need 8.209328 sec
At size: 128B, we need 8.174642 sec
At size: 256B, we need 8.257708 sec
At size: 512B, we need 8.429885 sec
At size: 1024B, we need 8.398997 sec
At size: 2048B, we need 8.389903 sec
At size: 4096B, we need 8.349263 sec
At size: 8192B, we need 8.603128 sec
At size: 16384B, we need 8.294702 sec
At size: 32768B, we need 8.382414 sec
At size: 65536B, we need 8.452870 sec
At size: 131072B, we need 8.577709 sec
At size: 262144B, we need 8.493697 sec
At size: 524288B, we need 8.535531 sec
At size: 1048576B, we need 8.457926 sec
At size: 2097152B, we need 8.466891 sec
At size: 4194304B, we need 8.602997 sec
At size: 8388608B, we need 8.984190 sec
At size: 16777216B, we need 9.560884 sec
At size: 33554432B, we need 10.243553 sec
```

可以看到在数组大小为8388608 Byte时随机读取的时间发生了比较大的增长。因此可以估计cache的大小为4184304 Byte。

### 5\. 验证

为了验证实验的结果，使用命令

```abap
getconf -a | grep CACHE
```

来获得机器的 [硬件信息](https://zhida.zhihu.com/search?content_id=116600051&content_type=Article&match_order=1&q=%E7%A1%AC%E4%BB%B6%E4%BF%A1%E6%81%AF&zhida_source=entity) 。得到的输出如下：

```
LEVEL1_ICACHE_SIZE                 65536
LEVEL1_ICACHE_ASSOC                4
LEVEL1_ICACHE_LINESIZE             64
LEVEL1_DCACHE_SIZE                 32768
LEVEL1_DCACHE_ASSOC                8
LEVEL1_DCACHE_LINESIZE             64
LEVEL2_CACHE_SIZE                  524288
LEVEL2_CACHE_ASSOC                 8
LEVEL2_CACHE_LINESIZE              64
LEVEL3_CACHE_SIZE                  4194304
LEVEL3_CACHE_ASSOC                 16
LEVEL3_CACHE_LINESIZE              64
LEVEL4_CACHE_SIZE                  0
LEVEL4_CACHE_ASSOC                 0
LEVEL4_CACHE_LINESIZE              0
```

可以看到L3-cache的大小为4194304 Byte。因此上面估计的cache大小可以接受。

### 6\. 讨论

实际上可以看到数组大小到达4194304 Byte时随即读取的总时间也比较大，这可能是cache替换时出现抖动引起的。

在没有超过 [cache size](https://zhida.zhihu.com/search?content_id=116600051&content_type=Article&match_order=3&q=cache+size&zhida_source=entity) 时，随机读取时间也有一定的波动，可能有如下原因： （1）电脑上其他程序占用了一定的资源，并且每时每刻占用的资源大小不一样； （2）在数组比较小的时，存取时间可能受到指令的局部性的影响。

发布于 2020-04-09 22:00[打算去培训c++服务端开发了，想问问大家哪家机构最好。?](https://www.zhihu.com/question/492818979/answer/3543020752)

[我是22年培训的，也是学的C++，不知道当时我看的那些机构现在有没有变化，那些知名的大机构都挺好的啊，像黑马、千锋...](https://www.zhihu.com/question/492818979/answer/3543020752)