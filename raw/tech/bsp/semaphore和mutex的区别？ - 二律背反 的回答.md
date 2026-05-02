---
title: "semaphore和mutex的区别？ - 二律背反 的回答"
source: "https://www.zhihu.com/question/47704079/answer/135859188"
author:
  - "[[二律背反微信：_bear234​ 关注]]"
  - "[[fisheuler​北京航空航天大学 计算机技术硕士]]"
  - "[[姚冬​C++等 3 个话题下的优秀答主]]"
published:
created: 2026-05-02
description: "mutex，一句话：保护共享资源。典型的例子就是买票：票是共享资源，现在有两个线程同时过来买票。如果你…"
tags:
  - "clippings"
---
457 人赞同了该回答

mutex，一句话：保护共享资源。

典型的例子就是买票：

票是共享资源，现在有两个线程同时过来买票。如果你不用mutex在线程里把票锁住，那么就可能出现“把同一张票卖给两个不同的人（线程）”的情况。

我想这个不需要多解释了。

一般人不明白 [semaphore](https://zhida.zhihu.com/search?content_id=49866811&content_type=Answer&match_order=1&q=semaphore&zhida_source=entity) 和mutex的区别， **根本原因是不知道semaphore的用途。**

semaphore的用途，一句话： **调度线程** 。

有的人用semaphore也可以把上面例子中的票“保护"起来以防止共享资源冲突，必须承认这是可行的，但是semaphore不是让你用来做这个的； **如果你要做这件事，请用mutex。**

在网上、包括stackoverflow等著名论坛上，有一个流传很广的厕所例子：

mutex是一个厕所一把钥匙，谁抢上钥匙谁用厕所，谁没抢上谁就等着；semaphore是多个同样厕所多把同样的钥匙 ---- 只要你能拿到一把钥匙，你就可以随便找一个空着的厕所进去。

事实上，这个例子对初学者、特别是刚刚学过mutex的初学者来说非常糟糕 ----- 我第一次读到这个例子的第一反应是：semaphore是线程池？？？所以， **请务必忘记这个例子** 。

另外，有人也会说：mutex就是semaphore的value等于1的情况。

这句话不能说不对，但是对于初学者来说，请先把这句话视为错误；等你将来彻底融会贯通这部分知识了，你才能真正理解上面这句话到底是什么意思。总之请务必记住： **mutex干的活儿和semaphore干的活儿不要混起来。**

在这里，我模拟一个最典型的使用semaphore的场景：

a源自一个线程，b源自另一个线程，计算c = a + b也是一个线程。（即一共三个线程）

显然，第三个线程必须等第一、二个线程执行完毕它才能执行。

在这个时候，我们就需要 **调度线程** 了：让第一、二个线程执行完毕后，再执行第三个线程。

此时，就需要用semaphore了。

```
int a, b, c;
void geta()
{
    a = calculatea();
    semaphore_increase();
}

void getb()
{
    b = calculateb();
    semaphore_increase();
}

void getc()
{
    semaphore_decrease();
    semaphore_decrease();
    c = a + b;
}

t1 = thread_create(geta);
t2 = thread_create(getb);
t3 = thread_create(getc);
thread_join(t3);

// semaphore的机制我在这里就不讲了，百度一下你就知道。
// semaphore_increase对应sem_post
// semaphore_decrease对应sem_wait
```

这就是semaphore最典型的用法。

说白了， **调度线程，就是：一些线程生产（increase）同时另一些线程消费（decrease），semaphore可以让生产和消费保持合乎逻辑的执行顺序。**

而线程池是程序员根据具体的硬件水平和不同的设计需求、为了达到最佳的运行效果而避免反复新建和释放线程同时对同一时刻启动的线程数量的限制，这完全是两码事。

比如如果你要计算z = a + b +...+ x + y...的结果，同时每个加数都是一个线程，那么计算z的线程和每个加数的线程之间的逻辑顺序是通过semaphore来调度的；而至于你运行该程序的时候到底要允许最多同时启动几个线程，则是用线程池来实现的。

semaphore和条件锁的区别：

条件锁，本质上还是锁，它的用途，还是围绕“共享资源”的。条件锁最典型的用途就是：防止不停地循环去判断一个共享资源是否满足某个条件。

比如还是买票的例子：

我们除了买票的线程外，现在再加一个线程：如果票数等于零，那么就要挂出“票已售完”的牌子。这种情况下如果没有条件锁，我们就不得不在“挂牌子”这个线程里不断地lock和unlock而在大多数情况下票数总是不等于零，这样的结果就是：占用了很多CPU资源但是大多数时候什么都没做。

另外，假如我们还有一个线程，是在票数等于零时向上级部门申请新的票。同理，问题和上面的一样。而如果有了条件锁，我们就可以避免这种问题，而且还可以一次性地通知所有被条件锁锁住的线程。

这里有个问题，是关于条件锁的：

[pthread\_cond\_wait 为什么需要传递 mutex 参数？](https://www.zhihu.com/question/24116967)

不清楚条件锁的朋友可以看一下。

总之请记住： **条件锁，是为了避免绝大多数情况下都是lock ---> 判断条件 ----> unlock的这种很占资源但又不干什么事情的线程。** 它和semaphore的用途是不同的。

简而言之， **锁是服务于共享资源的；而semaphore是服务于多个线程间的执行的逻辑顺序的。  
  
**\================ 确定上面的内容都彻底理解后 ===================

感谢

[@灵剑](https://www.zhihu.com/people/60cd9664ef2f13d8d5ddba060ef35a8a)

的提醒，在此补充后续内容。

请回头看那个让大家忘记的厕所例子。我之所以让大家忘记这个例子，是因为如果你从这个角度去学习semaphore的话，一定会和mutex混为一谈。semaphore的本质就是 **调度线程** ---- 在充分理解了这个概念后，我们再看这个例子。

semaphore是通过一个值来实现线程的调度的，因此借助这种机制，我们 **也可以实现对线程数量的限制。** 例子我就不写了，如果你看懂了上面的c = a + b的例子，相信你可以轻松写出来用semaphore限制线程数量的例子。而当我们把线程数量限制为1时，你会发现：共享资源受到了保护 ------ 任意时刻只有一个线程在运行，因此共享资源当然等效于受到了保护。但是我要再提醒一下， **如果你要对共享资源进行保护，请用mutex；到底应该用条件锁还是用semaphore，请务必想清楚。** 通过semaphore来实现对共享资源的保护的确可行但是是对semaphore的一种 **错用** 。

**只要你能搞清楚锁、条件锁和semaphore为什么而生、或者说它们是面对什么样的设计需求、为了解决什么样类型的问题才出现的，你自然就不会把他们混淆起来。**

\===========================================================

厕所例子：

```
semaphore sem(2);  // 同时执行的线程数量上限为2
void toiletA()
{
    semaphore_decrease(sem);
    // do something
    semaphore_increase(sem);
}

void toiletB()
{
    semaphore_decrease(sem);
    // do something
    semaphore_increase(sem);
}

void toiletC()
{
    semaphore_decrease(sem);
    // do something
    semaphore_increase(sem);
}

t1 = thread_create(toiletA);
t2 = thread_create(toiletB);
t3 = thread_create(toiletC);
thread_join(toiletA);
thread_join(toiletB);
thread_join(toiletC);
```

应该不需要多解释了。不过要强调一下，虽然semaphore的这种用法和线程池看上去很类似：都是在限制同时执行的线程数量，但是两者是有本质区别的。

**线程池是通过用固定数量的线程去执行任务队列里的任务来达到避免反复创建和销毁线程而造成的资源浪费；而semaphore并没有直接提供这种机制** ---- 上面的例子中虽然同时最多有两个线程在运行，但是最一开始三个线程就已经都创建好了；而线程池则是：一开始就创建两个线程，然后将这三个任务加入到线程池的任务队列中，让线程池利用这两个线程去完成这三个任务。

\======================= BONUS ======================

如果你可以使用面向对象语言（C++1x、Java等）而不是必须使用C语言来实现上述设计需求的话，那么promise & future和线程池是个更好的选择。

[编辑于 2016-12-16 22:58](https://www.zhihu.com/question/47704079/answer/135859188)[应届生工作半年想转行学嵌入式，求建议?](https://www.zhihu.com/question/580214790/answer/3474838125)

[我是从一个普通二本毕业，98年的，电气工程及其自动化专业（学的一塌糊涂），校招去了一家私企当了一名设备工程师。这个岗位给我的感觉就是很闲，也学不到东西，每天保养维修设备，说...](https://www.zhihu.com/question/580214790/answer/3474838125)

#### 更多回答

可以看看Linus本人是如何解释semaphore ，spinlock，mutex的区别的，还深入讨论了一下mutex代码层级的实现方式和优化方法,just that phases:"talk is cheap,show me the code"

[yarchive.net/comp/linux](https://link.zhihu.com/?target=https%3A//www.yarchive.net/comp/linux/semaphores.html)

Linus写的邮件也是嬉笑怒骂皆成文章，引用其中的一些回答。

> If your CS courses didn't tell you the difference between a semaphore  
> and a spinlock, your CS courses were bad (or just didn't cover much  
> about concurrency, which is fairly common).  
>   
> Blame your professors, don't blame the Linux kernel code.  
>   
> A spinlock is a mutual exclusion mechanism, not a semaphore (a semaphore  
> is a very specific \_kind\_ of mutual exclusion).  
>   
> But yes, you're right in that it's (by design) a busy-waiting one.  
> That's why they are called "spinlocks" - they "spin" waiting for the  
> lock to go away.  
>   
> A semaphore also has the ability to have more than one process enter the  
> critical region. Basically semaphores were (as far as I know) first  
> proposed by Dijkstra, and they explicitly imply a "sleep"/"wakeup"  
> behaviour, ie they are \_not\_ spinlocks. They originally had operations  
> called "P()" and "V()", but nobody ever remembers whether P() was down()  
> or up(), so nobody uses those names any more. Dijkstra was probably a  
> bit heavy on drugs or something (I think the official explanation is  
> that P and V are the first letters in some Dutch words, but I personally  
> find the drug overdose story much more believable).  
>   
> Also, unlike basic spinlocks, a semaphore has a "count" value: each  
> process that does a down() operation decrements the count if positive,  
> until the count would go negative. Only then do they sleep. The  
> original intent of this was to allow multiple entries to the region  
> protected by the semaphore: by initializing the count to 4, you allow  
> four down() operations and only the fifth one will block.  
>   
> However, almost all practical use of semaphores is a special case where  
> the counter is initialized to 1, and where they are used as simple  
> mutual exclusion with only one user allowed in the critical region.  
> Such a semaphore is often called a "mutex" semaphore for MUTual  
> EXclusion.  
>   
> I've never really seen anybody use the more complex case of semaphores,  
> although I do know of cases where it can be useful. For example, one use  
> of a more complex semaphore is as a "throttle", where you do something  
> like this:  
>   
> /\* Maximum concurrent users \*/  
> #define MAX\_CONCURRENT\_USERS 20  
> struct semaphore sem;  
>   
> init\_sema(&sem, MAX\_CONCURRENT\_USERS);  
>   
> and then each user does a down() on the semaphore before starting an  
> operation. It won't block until you have 20 users - you've not created  
> a mutual exclusion, but you HAVE created a throttling mechanism. See?  
>   
> Potentially useful, as I said, but the common case (and the only case  
> currently in use in the Linux kernel - even though the implementation  
> definitely can handle the general case) is certainly the mutex one.  
> \>However, you need to grab a spinlock for the purpose of grabbing a  
> \>semaphore\_t, so for short critical sections a spinlock (even with the  
> \>potential of busy-waiting) is more efficient.  
>   
> Only in bad implementations or on bad hardware.  
>   
> All reasonably modern CPU's can do a semaphore without having grabbed a  
> spinlock. Often a spinlock is needed for the \_contention\_ case, but if  
> done right that is very rare. The contention case for a semaphore is  
> usually the very expensive one, because that's when you have to  
> re-schedule etc.  
>   
> So basically spinlocks are much simpler, and faster under short-lived  
> contention, so that's why they tend to be used. Also, semaphores cannot  
> be used by interrupt handlers, as Linux doesn't allow interrupt handlers  
> to sleep, so anything that protects interrupts needs to be a spinlock.  
>   
> In addition to semaphores, there are other mutual exclusion notions, the  
> most popular being a "read-write" lock - something that requires  
> exclusive access for writers, but allows any number of readers at a  
> time. Linux has the spinning version of this, but not the blocking one.  
> We'll probably add a blocking version some day, as it's often very  
> useful, but it hasn't been a major issue yet.  
>   
> For example, the per-VM memory management semaphore could very usefully  
> be a blocking read-write lock, but without heavy thread contention a  
> mutex semaphore is basically equivalent.  
>   
> \> Since the usual practice  
> \>is to make your critical sections as short as possible, the result is  
> \>that the kernel uses a lot more spinlocks than semaphore\_t's.  
>   
> True. Semaphores are really only useful around anything that does IO,  
> for example. When the potential contention period is multiple  
> milliseconds as opposed to nano- or microseconds, blocking operations  
> (ie operations that cause a re-schedule on contention) are the right way  
> to go.  
>   
> Note that some people believe in a mix-and-match approach, where you  
> have a spinlock that gets upgraded to a semaphore if it waits too long.  
> Personally, I think that only makes sense if (a) you're in user space  
> and don't know what the scheduling rules are or (b) your locking is so  
> badly designed that you have tons of short-lived contention on your  
> semaphores, so you want to try the light approach first.  
>   
> Linus

总结一下semaphore的主要使用场景：

1 当做mutual exclusion机制来使用，和mutex的功能类似，被称为semaphore mutex.

2 当做throttling mechanism来使用，可以控制调用的次数，可以当做一种流控机制。

3 已经不推荐在内核开发中使用semaphores了。

> Exactly. But the point here is:  
>   
> \- nobody should use semaphores anyway (use mutexes)  
> \- making \*more\* code use semaphores is wrong  
> \- completions have a different \_mental\_ model  
>   
> IOW, this is not about implementation issues. It's about how you think  
> about the operations.  
>   
> We should \_not\_ implement completions as semaphores, simply because we  
> want to get \*rid\* of semaphores some day.  
>   
> So rather than this long and involved patch series that first makes  
> semaphores generic, and then makes them be used as completions, I'd much  
> rather just skip this whole pointless exercise entirely.  
>   
> Why have "generic semaphores" at all, if we want to get rid of them?

虽然 Mutex和Semaphore 在一定程度上可以互相替代，比如你可以把 值最大为1 的Semaphore当Mutex用，也可以用Mutex＋计数器当Semaphore。

但是对于设计理念上还是有不同的，Mutex管理的是资源的使用权，而Semaphore管理的是资源的数量，有那么一点微妙的小区别。

打个比方，在早餐餐厅，大家要喝咖啡。

如果用Mutex的方式，同时只有一个人可以使用咖啡机，他获得了咖啡机的使用权后，开始做咖啡，其他人只能在旁边等着，直到他做好咖啡后，另外一个人才能获得咖啡机的使用权。

如果用Semaphore的模式，服务员会把咖啡做好放到柜台上，谁想喝咖啡就拿走一杯，服务员会不断做咖啡，如果咖啡杯被拿光了，想喝咖啡的人就排队等着。

Mutex管理的是咖啡机的使用权，而Semaphore管理的是做好的咖啡数量。

![](chrome-extension://difoiogjjojoaoomphldepapgpbgkhkb/assets/logo-O35E636P.png) Sider

[导游称大熊猫花花是残疾游客秒报警 340 万](https://www.zhihu.com/search?q=%E5%AF%BC%E6%B8%B8%E7%A7%B0%E5%A4%A7%E7%86%8A%E7%8C%AB%E8%8A%B1%E8%8A%B1%E6%98%AF%E6%AE%8B%E7%96%BE%E6%B8%B8%E5%AE%A2%E7%A7%92%E6%8A%A5%E8%AD%A6&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[孙杨被曝疑违规录取博士 335 万](https://www.zhihu.com/search?q=%E5%AD%99%E6%9D%A8%E8%A2%AB%E6%9B%9D%E7%96%91%E8%BF%9D%E8%A7%84%E5%BD%95%E5%8F%96%E5%8D%9A%E5%A3%AB&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[女子徒手给月子里宝宝打耳洞 294 万](https://www.zhihu.com/search?q=%E5%A5%B3%E5%AD%90%E5%BE%92%E6%89%8B%E7%BB%99%E6%9C%88%E5%AD%90%E9%87%8C%E5%AE%9D%E5%AE%9D%E6%89%93%E8%80%B3%E6%B4%9E&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[曝吴宣仪提出解约遭乐华拒绝 290 万](https://www.zhihu.com/search?q=%E6%9B%9D%E5%90%B4%E5%AE%A3%E4%BB%AA%E6%8F%90%E5%87%BA%E8%A7%A3%E7%BA%A6%E9%81%AD%E4%B9%90%E5%8D%8E%E6%8B%92%E7%BB%9D&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[阿 Sa 蔡卓妍官宣结婚 290 万](https://www.zhihu.com/search?q=%E9%98%BF+Sa+%E8%94%A1%E5%8D%93%E5%A6%8D%E5%AE%98%E5%AE%A3%E7%BB%93%E5%A9%9A&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[广州地铁有人喷洒不明液体 267 万](https://www.zhihu.com/search?q=%E5%B9%BF%E5%B7%9E%E5%9C%B0%E9%93%81%E6%9C%89%E4%BA%BA%E5%96%B7%E6%B4%92%E4%B8%8D%E6%98%8E%E6%B6%B2%E4%BD%93&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)