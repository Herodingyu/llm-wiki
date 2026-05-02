---
title: "【深度】韦东山：一文看懂linux对中断处理的前世今生(附免费视频)"
source: "https://zhuanlan.zhihu.com/p/113002536"
author:
  - "[[韦东山嵌入式关注公众号: 百问科技，学习更多嵌入式干货]]"
published:
created: 2026-05-02
description: "前言： 本文，4200字，研究代码花了一天，写出来花了一天； 录视频估计又得花半天； 真怀念以前简单粗暴的生活啊： 拿起话筒就录视频， 先画好图？那是不需要的 文档？那是不存在的 真是洒脱．．．．． 现在，要写…"
tags:
  - "clippings"
---
[收录于 · 韦东山嵌入式Linux](https://www.zhihu.com/column/c_118891916)

265 人赞同了该文章

前言：

本文，4200字，研究代码花了一天，写出来花了一天；

录视频估计又得花半天；

真怀念以前简单粗暴的生活啊：

拿起话筒就录视频，

先画好图？那是不需要的

文档？那是不存在的

真是洒脱．．．．．

现在，要写文档，又要画流程图，十几、二十分钟的视频，

真是沤心沥血做出来的，

各位，别浪费了，欢迎享受。

### Linux系统对中断处理的演进

从2005年我接触Linux到现在15年了，Linux中断系统的变化并不大。比较重要的就是引入了 [threaded irq](https://zhida.zhihu.com/search?content_id=113242159&content_type=Article&match_order=1&q=threaded+irq&zhida_source=entity) ：使用内核线程来处理中断。

Linux系统中有 [硬件中断](https://zhida.zhihu.com/search?content_id=113242159&content_type=Article&match_order=1&q=%E7%A1%AC%E4%BB%B6%E4%B8%AD%E6%96%AD&zhida_source=entity) ，也有 [软件中断](https://zhida.zhihu.com/search?content_id=113242159&content_type=Article&match_order=1&q=%E8%BD%AF%E4%BB%B6%E4%B8%AD%E6%96%AD&zhida_source=entity) 。

对硬件中断的处理有2个原则：不能嵌套，越快越好。

参考资料： [blog.csdn.net/myarrow/a](https://link.zhihu.com/?target=https%3A//blog.csdn.net/myarrow/article/details/9287169)

### 1.Linux对中断的扩展：硬件中断、软件中断

Linux系统把中断的意义扩展了，对于按键中断等硬件产生的中断，称之为“硬件中断”(hard irq)。每个硬件中断都有对应的处理函数，比如按键中断、网卡中断的处理函数肯定不一样。

为方便理解，你可以先认为对硬件中断的处理是用数组来实现的，数组里存放的是函数指针：

![](https://pic3.zhimg.com/v2-b0223404f999c23857dc72960c758de4_1440w.jpg)

**注意** ：上图是简化的，Linux中这个数组复杂多了。

当发生A中断时，对应的irq\_function\_A函数被调用。硬件导致该函数被调用。

相对的，还可以人为地制造中断：软件中断(soft irq)，如下图所示：

![](https://pic3.zhimg.com/v2-3f6d3267cbc5be36c729e1935c1d0d42_1440w.jpg)

**注意** ：上图是简化的，Linux中这个数组复杂多了。

问题来了：

a. 软件中断何时生产？

由软件决定，对于X号软件中断，只需要把它的flag设置为1就表示发生了该中断。

b. 软件中断何时处理？

软件中断嘛，并不是那么十万火急，有空再处理它好了。

什么时候有空？不能让它一直等吧？

Linux系统中，各种硬件中断频繁发生，至少定时器中断每10ms发生一次，那取个巧？

在处理写硬件中断后，再去处理软件中断？就这么办！

有哪些软件中断？

查内核源码include/linux/interrupt.h

![](https://pic3.zhimg.com/v2-36e8a0a825b900a31b18955b51a8bf6a_1440w.jpg)

怎么触发软件中断？最核心的函数是raise\_softirq，简单地理解就是设置softirq\_veq\[nr\]的标记位：

![](https://picx.zhimg.com/v2-ec1dcf703f2215d5cb38c4018f27f175_1440w.jpg)

怎么设置软件中断的处理函数：

后面讲到的中断下半部 [tasklet](https://zhida.zhihu.com/search?content_id=113242159&content_type=Article&match_order=1&q=tasklet&zhida_source=entity) 就是使用软件中断实现的。

### 2.中断处理原则1：不能嵌套

官方资料：中断处理不能嵌套

[git.kernel.org/pub/scm/](https://link.zhihu.com/?target=https%3A//git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/%3Fid%3De58aa3d2d0cc)

[中断处理函数](https://zhida.zhihu.com/search?content_id=113242159&content_type=Article&match_order=1&q=%E4%B8%AD%E6%96%AD%E5%A4%84%E7%90%86%E5%87%BD%E6%95%B0&zhida_source=entity) 需要调用C函数，这就需要用到栈。

中断A正在处理的过程中，假设又发生了中断B，那么在栈里要保存A的现场，然后处理B。

在处理B的过程中又发生了中断C，那么在栈里要保存B的现场，然后处理C。

如果中断嵌套突然暴发，那么栈将越来越大，栈终将耗尽。

所以，为了防止这种情况发生，也是为了简单化中断的处理，在Linux系统上中断无法嵌套：即当前中断A没处理完之前，不会响应另一个中断B(即使它的优先级更高)。

### 3.中断处理原则2：越快越好

妈妈在家中照顾小孩时，门铃响起，她开门取快递：这就是中断的处理。她取个快递敢花上半天吗？不怕小孩出意外吗？

同理，在Linux系统中，中断的处理也是越快越好。

在单芯片系统中，假设中断处理很慢，那应用程序在这段时间内就无法执行：系统显得很迟顿。

在SMP系统中，假设中断处理很慢，那么正在处理这个中断的CPU上的其他线程也无法执行。

在中断的处理过程中，该CPU是不能进行进程调度的，所以中断的处理要越快越好，尽早让其他中断能被处理──进程调度靠定时器中断来实现。

在Linux系统中使用中断是挺简单的，为某个中断irq注册中断处理函数handler，可以使用request\_irq函数：

![](https://pic3.zhimg.com/v2-813876ba3db51ce319f10de58c342104_1440w.jpg)

在handler函数中，代码尽可能高效。

但是，处理某个中断要做的事情就是很多，没办法加快。比如对于按键中断，我们需要等待几十毫秒消除机械抖动。难道要在handler中等待吗？对于计算机来说，这可是一个段很长的时间。

怎么办？

### 4.要处理的事情实在太多，拆分为：上半部、下半部

当一个中断要耗费很多时间来处理时，它的坏处是：在这段时间内，其他中断无法被处理。换句话说，在这段时间内，系统是关中断的。

如果某个中断就是要做那么多事，我们能不能把它拆分成两部分：紧急的、不紧急的？

在handler函数里只做紧急的事，然后就重新开中断，让系统得以正常运行；那些不紧急的事，以后再处理，处理时是开中断的。

![](https://pic4.zhimg.com/v2-577a04e1d8bbaeb8beb3c46a028aee3d_1440w.jpg)

中断下半部的实现有很多种方法，讲2种主要的：tasklet(小任务)、 [work queue](https://zhida.zhihu.com/search?content_id=113242159&content_type=Article&match_order=1&q=work+queue&zhida_source=entity) (工作队列)。

### 5.下半部要做的事情耗时不是太长：tasklet

假设我们把中断分为上半部、下半部。发生中断时，上半部下半部的代码何时、如何被调用？

当下半部比较耗时但是能忍受，并且它的处理比较简单时，可以用tasklet来处理下半部。tasklet是使用软件中断来实现。

![](https://pica.zhimg.com/v2-4068f489c47a3875cabb4fada95facfc_1440w.jpg)

写字太多，不如贴代码，代码一目了然：

![](https://pic1.zhimg.com/v2-50e8c04dbe6e21ca9ceb55dd031c0ad4_1440w.jpg)

使用流程图简化一下：

![](https://picx.zhimg.com/v2-c70d7a674e20781f3884f5566077057d_1440w.jpg)

假设硬件中断A的上半部函数为irq\_top\_half\_A，下半部为irq\_bottom\_half\_A。

使用情景化的分析，才能理解上述代码的精华。

a. 硬件中断A处理过程中，没有其他中断发生：

一开始，preempt\_count = 0；

上述流程图①～⑨依次执行，上半部、下半部的代码各执行一次。

b. 硬件中断A处理过程中，又再次发生了中断A：

一开始，preempt\_count = 0；

执行到第⑥时，一开中断后，中断A又再次使得CPU跳到中断向量表。

**注意** ：这时preempt\_count等于1，并且中断下半部的代码并未执行。

CPU又从①开始再次执行中断A的上半部代码：

在第①步preempt\_count等于2；

在第③步preempt\_count等于1；

在第④步发现preempt\_count等于1，所以直接结束当前第2次中断的处理；

**注意** ：重点来了，第2次中断发生后，打断了第一次中断的第⑦步处理。当第2次中断处理完毕，CPU会继续去执行第⑦步。

可以看到，发生2次硬件中断A时，它的上半部代码执行了2次，但是下半部代码只执行了一次。

所以，同一个中断的上半部、下半部，在执行时是多对一的关系。

c. 硬件中断A处理过程中，又再次发生了中断B：

一开始，preempt\_count = 0；

执行到第⑥时，一开中断后，中断B又再次使得CPU跳到中断向量表。

**注意** ：这时preempt\_count等于1，并且中断A下半部的代码并未执行。

CPU又从①开始再次执行中断B的上半部代码：

在第①步preempt\_count等于2；

在第③步preempt\_count等于1；

在第④步发现preempt\_count等于1，所以直接结束当前第2次中断的处理；

**注意** ：重点来了，第2次中断发生后，打断了第一次中断A的第⑦步处理。当第2次中断B处理完毕，CPU会继续去执行第⑦步。

在第⑦步里，它会去执行中断A的下半部，也会去执行中断B的下半部。

所以，多个中断的下半部，是汇集在一起处理的。

**总结** ：

a. 中断的处理可以分为上半部，下半部

b. 中断上半部，用来处理紧急的事，它是在关中断的状态下执行的

c. 中断下半部，用来处理耗时的、不那么紧急的事，它是在开中断的状态下执行的

d. 中断下半部执行时，有可能会被多次打断，有可能会再次发生同一个中断

e. 中断上半部执行完后，触发中断下半部的处理

f. 中断上半部、下半部的执行过程中，不能休眠：中断休眠的话，以后谁来调度进程啊？

### 6.下半部要做的事情太多并且很复杂：工作队列

在中断下半部的执行过程中，虽然是开中断的，期间可以处理各类中断。但是毕竟整个中断的处理还没走完，这期间APP是无法执行的。

假设下半部要执行1、2分钟，在这1、2分钟里APP都是无法响应的。

这谁受得了？

所以，如果中断要做的事情实在太耗时，那就不能用中断下半部来做，而应该用内核线程来做：在中断上半部唤醒内核线程。内核线程和APP都一样竞争执行，APP有机会执行，系统不会卡顿。

这个内核线程是系统帮我们创建的，一般是 [kworker线程](https://zhida.zhihu.com/search?content_id=113242159&content_type=Article&match_order=1&q=kworker%E7%BA%BF%E7%A8%8B&zhida_source=entity) ，内核中有很多这样的线程：

![](https://pic2.zhimg.com/v2-ccdeaf223275e542570afc78e33cad23_1440w.jpg)

kworker线程要去“工作队列”(work queue)上取出一个一个“工作”(work)，来执行它里面的函数。

那我们怎么使用work、work queue呢？

a. 创建work：

你得先写出一个函数，然后用这个函数填充一个work结构体。比如：

![](https://pic4.zhimg.com/v2-ca2d137d10d7c52bdd2a777d7b5805f5_1440w.jpg)

b. 要执行这个函数时，把work提交给work queue就可以了：

![](https://picx.zhimg.com/v2-9d329934238c9bc050688cdf94fd1507_1440w.jpg)

上述函数会把work提供给系统默认的work queue：system\_wq，它是一个队列。

c. 谁来执行work中的函数？

不用我们管，schedule\_work函数不仅仅是把work放入队列，还会把kworker线程唤醒。此线程抢到时间运行时，它就会从队列中取出work，执行里面的函数。

d. 谁把work提交给work queue？

在中断场景中，可以在中断上半部调用schedule\_work函数。

**总结** ：

a. 很耗时的中断处理，应该放到线程里去

b. 可以使用work、work queue

c. 在中断上半部调用schedule\_work函数，触发work的处理

d. 既然是在线程中运行，那对应的函数可以休眠。

### 7.新技术：threaded irq

使用线程来处理中断，并不是什么新鲜事。使用work就可以实现，但是需要定义work、调用schedule\_work，好麻烦啊。

太懒了太懒了，就这2步你们都不愿意做。

好，内核是为懒人服务的，再杀出一个函数：

![](https://pic1.zhimg.com/v2-ef59052345df18c0b05e73ca26162f0a_1440w.jpg)

你可以只提供thread\_fn，系统会为这个函数创建一个内核线程。发生中断时，内核线程就会执行这个函数。

说你懒是开玩笑，内核开发者也不会那么在乎懒人。

以前用work来线程化的处理内核，一个worker线程只能由一个CPU执行，多个中断的work都由同一个worker线程来处理，在单CPU系统中也只能忍着了。但是在SMP系统中，明明有那么多CPU空着，你偏偏让多个中断挤在这个CPU上？

新技术threaded irq，为每一个中断都创建一个内核线程；多个中断的内核线程可以分配到多个CPU上执行，这提高了效率。

---

本文已经录制了视频，linux系统对中断处理的演进，有些难懂的知识点还是视频直观

---

**我是韦东山，希望我的分享能给你带来帮助，欢迎订阅我的付费视频： [100ask.taobao.com](https://link.zhihu.com/?target=http%3A//100ask.taobao.com)**

---

还没搞懂的同学可以加我同事微信 **13163769879** 加入交流群讨论学习，

[所属专栏 · 2025-12-25 17:53 更新](https://zhuanlan.zhihu.com/c_118891916)

[![](https://pic1.zhimg.com/v2-ede5849e82d5d2ac99d74873da4371d3_720w.jpg?source=172ae18b)](https://zhuanlan.zhihu.com/c_118891916)

[韦东山嵌入式Linux](https://zhuanlan.zhihu.com/c_118891916)

[

韦东山嵌入式

234 篇内容 · 12802 赞同

](https://zhuanlan.zhihu.com/c_118891916)

[

最热内容 ·

【2020/5.29开庭】韦东山：闲鱼与盗版更配，坚决打击盗版，起诉到底绝不和解！

](https://zhuanlan.zhihu.com/c_118891916)

编辑于 2020-03-19 09:58[为什么越来越多的人要转行做嵌入式呢？](https://www.zhihu.com/question/618380415/answer/1951656963843822559)

[

你好啊，这里是汉码未来~ 确实现在越来越多人转行选嵌入式，身边不少原本做行政、机械甚至基础IT岗的朋友都在往这个方向转，大家看中的正是它的行业前景和职业稳定性，这背后其实有很...

](https://www.zhihu.com/question/618380415/answer/1951656963843822559)