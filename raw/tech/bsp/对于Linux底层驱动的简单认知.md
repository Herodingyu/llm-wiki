---
title: "对于Linux底层驱动的简单认知"
source: "https://zhuanlan.zhihu.com/p/543559467"
author:
  - "[[内核补给站]]"
published:
created: 2026-05-02
description: "一、什么是底层驱动？底层驱动是让设备工作的 基本程序，它给用户提供了一个使用这个设备的接口。就拿树莓派来说，如果我们想要用它的那40Pin中的某个GPIO口，但是那个IO口没有相应的驱动程序给我们操作，这时，无…"
tags:
  - "clippings"
---
1 人赞同了该文章

## 一、什么是底层驱动？

底层驱动是让设备工作的 **基本程序** ，它给用户提供了一个使用这个设备的接口。就拿树莓派来说，如果我们想要用它的那40Pin中的某个GPIO口，但是那个IO口没有相应的 [驱动程序](https://zhida.zhihu.com/search?content_id=208924122&content_type=Article&match_order=1&q=%E9%A9%B1%E5%8A%A8%E7%A8%8B%E5%BA%8F&zhida_source=entity) 给我们操作，这时，无论如何我们都无法操作IO口，wiringPi库到了最后也是要通过相应的驱动程序去操作IO的。因为底层驱动会操作CPU的与该设备相关的 [寄存器](https://zhida.zhihu.com/search?content_id=208924122&content_type=Article&match_order=1&q=%E5%AF%84%E5%AD%98%E5%99%A8&zhida_source=entity) ，实现驱动功能，这就是底层驱动。

用户在使用驱动的时候，是要经过一系列复杂的流程，才能实现对设备的操作：

![](https://picx.zhimg.com/v2-fe2106c2a530ee70ea6f3fc4d5568f33_1440w.jpg)

> **【文章福利** 】小编推荐自己的Linux内核源码交流群:【 **[869634926](https://link.zhihu.com/?target=https%3A//jq.qq.com/%3F_wv%3D1027%26k%3D9ihPowUX)** 】整理了一些个人觉得比较好的学习书籍、视频资料共享在群文件里面，有需要的可以自行添加哦！！！前50名可进群领取，并额外赠送一份价值600的内核资料包（含视频教程、电子书、实战项目及代码)！

![](https://pic4.zhimg.com/v2-242c283903e232fc104e845d18dad04f_1440w.jpg)

点击下方链接即可免费领取内核相关学习资料哦

**学习直通车： [Linux内核源码/内存调优/文件系统/进程管理/设备驱动/网络协议栈](https://link.zhihu.com/?target=https%3A//ke.qq.com/course/4032547%3FflowToken%3D1040236)**

## 二、为什么要写驱动？

当系统不提供相应设备的操作库时或没有驱动时，就需要自己编写驱动。树莓派提供了wiringPi库给我们操作IO口。但是如果换到其他的Linux板子上，2440，RK3399,nanoPi等，没有像wiringPi库这样的函数库时，还是要老老实实写驱动，不然就无法操作它的底层设备了。

## 三、怎么写驱动？

在写驱动之前，我首先要了解Linux是怎么调用驱动的，用户应该怎么用驱动。在Linux系统中，一切皆文件，驱动也不例外。

### 1.驱动文件的存放位置

Linux的驱动文件同意放在/dev目录底下，写好的驱动文件在安装时，应该需要安装在/dev目录中。我们在使用驱动时，也是使用/dev底下的驱动文件：

![动图封面](https://pica.zhimg.com/v2-a7f58f150b12809c546cd2ddf55ca3c6_b.jpg)

### 2.驱动的使用及区分方式

一个驱动写好并安装之后，可以使用C库中的 open、write及read来操作，因为设备驱动也是文件嘛，这三个文件操作的函数当然也能操作：

（1）open("/dev/xxx",O\_RDWR)函数生成 [文件描述符](https://zhida.zhihu.com/search?content_id=208924122&content_type=Article&match_order=1&q=%E6%96%87%E4%BB%B6%E6%8F%8F%E8%BF%B0%E7%AC%A6&zhida_source=entity) fd;

（2）write(fd,“ xxx”,size\_t);给驱动程序发送指令；

（3）read(fd,char \*,size\_t);读取驱动程序发回来的数据；

操作方式有了，但是要怎么在 /dev 底下找到相应的驱动，系统又是怎么在众多驱动中找到我们写的驱动？有两种方式：

第一: 通过文件名；就是open打开的 /dev 目录下的某个驱动文件；

第二: 通过设备号，设备号又有两种：

| 设备号 | 说明 |
| --- | --- |
| 主设备号 | 用来区分不同的设备，以整数的形式，比如GPIO，IIC，UART等 |
| 次设备号 | 用来区分相同设备中的多个设备，比如GPIO中有GPIO.0，GPIO.1等 |

设备号的查看可用：

```cpp
cd /dev
ls -l
```
![动图封面](https://pic4.zhimg.com/v2-51ac0aea7b814965e501d35434dceda5_b.jpg)

Linux的设备管理和文件系统时紧密结合在一起的，无论 [字符设备](https://zhida.zhihu.com/search?content_id=208924122&content_type=Article&match_order=1&q=%E5%AD%97%E7%AC%A6%E8%AE%BE%E5%A4%87&zhida_source=entity) 和块设备都会有一个设备号和次设备号。驱动链表负责管理这些设备，系统的设备都注册在驱动链表当中。驱动链表就是根据设备号去查找相应的设备，我们自己写的设备也不会例外。

驱动既然是需要加入到 **驱动链表** 当中，就需要知道该链表的结构体（ **struct file\_operations**),也就是说，我们写的驱动文件会有一个框架，这个框架是根据驱动链表的结构体来写。驱动在链表中注册，就是在驱动链表当中插入一个节点，这个节点的位置由设备号来决定。

### 3.驱动链表 file\_operations

驱动链表的结构体 **file\_operations** 有大量的结构体函数，其中就有open，write，read 这三个函数：

```cpp
struct file_operations {
        struct module *owner;  //使用时阻止模块被卸载
        loff_t(*llseek) (struct file *, loff_t, int); //光标操作
        ssize_t(*read) (struct file *, char __user *, size_t, loff_t *);//读操作
        ssize_t(*aio_read) (struct kiocb *, char __user *, size_t, loff_t);//异步读操作
        ssize_t(*write) (struct file *, const char __user *, size_t, loff_t *);//写操作
        ssize_t(*aio_write) (struct kiocb *, const char __user *, size_t,loff_t);//异步写操作
        int (*readdir) (struct file *, void *, filldir_t); //读取目录
        unsigned int (*poll) (struct file *, struct poll_table_struct *);//查询对一个或多个文件描述符的读或写是否会阻塞
        int (*ioctl) (struct inode *, struct file *, unsigned int,unsigned long);//系统调用提供了发出设备特定命令的方法(例如格式化软盘的一个磁道, 这不是读也不是写).
        int (*mmap) (struct file *, struct vm_area_struct *);//用来请求将设备内存映射到进程的地址空间
        int (*open) (struct inode *, struct file *);//打开操作，使用时第一个操作
        int (*flush) (struct file *);//操作在进程关闭它的设备文件描述符的拷贝时调用
        int (*release) (struct inode *, struct file *);//在文件结构被释放时引用这个操作. 如同 open, release 可以为 NULL.
        int (*fsync) (struct file *, struct dentry *, int datasync);//用户调用来刷新任何挂着的数据. 如果这个指针是 NULL, 系统调用返回 -EINVAL.
        int (*aio_fsync) (struct kiocb *, int datasync);//这是 fsync 方法的异步版本.
        int (*fasync) (int, struct file *, int);//这个操作用来通知设备它的 FASYNC 标志的改变
        int (*lock) (struct file *, int, struct file_lock *);//用来实现文件加锁
        /*实现发散/汇聚读和写操作. 应用程序偶尔需要做一个包含多个内存区的单个读或写操作;*/
        ssize_t(*readv) (struct file *, const struct iovec *, unsigned long,loff_t *);//读汇聚/散发
        ssize_t(*writev) (struct file *, const struct iovec *, unsigned long,loff_t *);//写汇聚/散发
        ssize_t(*sendfile) (struct file *, loff_t *, size_t, read_actor_t,void __user *);//sendfile 系统调用的读, 使用最少的拷贝从一个文件描述符搬移数据到另一个
        ssize_t(*sendpage) (struct file *, struct page *, int, size_t,loff_t *, int);//在进程的地址空间找一个合适的位置来映射在底层设备上的内存段中. 这个任务通常由内存管理代码进行;
        unsigned long (*get_unmapped_area) (struct file *, unsigned long,unsigned long, unsigned long,unsigned long);
};
```

我们在写驱动时，应该根据需求给结构体的某个结构体函数写一个函数，比如open，write,read，可以这样：

```cpp
int pin4_open (struct inode *inode, struct file *file)
{
    /*      实现的操作   */
    return 0;
}
ssize_t pin4_write(struct file *file, const char __user *buf, size_t count, loff_t *loffs)//写操作
{
    /*   实现的操作   */
    return 0;
}
ssize_t pin4_read(struct file *file, char __user *buf, size_t count, loff_t *loff)
{
    /*   实现的操作   */
    return 0;
}

struct file_operations pin_pos ={
    .owner = THIS_MODULE,  
    .open  = pin4_open,
    .write = pin4_write,
    .read  = pin4_read,
};
```

上面以 “.open=xxx” 这种结构体的初始化方式只适用于Linux;做完这些之后，只是把驱动链表中的结构体搭建好了，还需要把这个结构体插入到链表当中。

### 4.驱动注册及自动创建驱动文件

建立好驱动的结构体之后，就需要把结构体插入到驱动链表中，先介绍一个函数：

**(1) 驱动注册**

**函数：** intregister\_chrdev(int major,char \*module\_name,struct file\_operations \*file\_operation );

这便是驱动链表注册函数，功能是把我们建立好的结构体插入到链表当中，并注册成字符设备，块设备用register\_blkdev。

**参数说明：**

1. major 驱动的主设备号，用来索引链表中的位置；
2. module\_name这是驱动在链表中的名字，也是驱动的标识;
3. \*file\_operation file\_operations的结构体指针，建好的驱动结构体就从这里传入。

前面提到，驱动设备管理和文件系统是紧密结合在一起的，二者缺少其一，驱动都无法生效。

**(2)自动创建驱动文件**

自动生成文件需要几个函数的配合，因为最终的函数 （ **device\_create** ），需要用到 **dev\_t** 型的设备号，而设备号又由主设备和次设备号组合而成，所以要用到MKDEV宏。函数 （ **device\_create** ）还需要用到一个类这个类由 **class\_create** 函数生成；

**宏MKDEV：** #define dev\_tMKDEV（int major，int minor）;

**功能：** 把 主设备号 **major** 和 次设备号 **minor** 整合成设备号并输出。

**返回值：** 返回一个16位的设备号，高八位为主设备号，第八位为次设备号。

**类创建函数：** struct class **class\_create** (struct module \*owner, const char \*name);

**参数说明：**

1. \*owner 通常赋值 THIS\_MODULE,表示这个驱动会生成一个单独的驱动模块；
2. \*name 驱动模块的名字，而不是驱动名字，这个参数可以随便起名，但是不能有重复。

功能说明： 生成一个类提供给 device\_create以创建相对应的设备模块。

**设备创建函数：** struct device **\*device\_create** (struct class \*class, struct device \*parent,dev\_t devt, void \*drvdata, const char \*fmt, …)

**参数说明：**

1. \*class 设备模块的类；
2. \*parent 通常赋值 NULL；
3. devt 设备号，由MKDEV 获得；
4. \*drvdata 设备相关数据，通常赋值NULL；
5. \*fmt设备名称。

**函数功能：** 在文件系统中创建一个设备；

这些操作通常由一个函数来执行，是为了给 **module\_init** 函数对模块进行初始化。

```cpp
int __init pin4_dev_init(void)
{
        int ret;
        devno =MKDEV(major,minor);
        ret=register_chrdev(major,module_name,&pin4_fops);
        pin4_class=class_create(THIS_MODULE,"myfirstdemo");
        pin4_dev =device_create(pin4_class,NULL,devno,NULL,module_name);
        return 0;
}
module_init(pin4_dev_init);
```

有驱动文件创建，当然也会有卸载，其中的函数就不过多做介绍：

```cpp
void __exit pin4_exit(void)
{
        device_destroy(pin4_class,devno);//销毁设备
        class_destroy(pin4_class);        //销毁类
        unregister_chrdev(major,module_name);//在驱动链表中卸载驱动
}
module_exit(pin4_exit);
```

pin4\_exit函数中那三个函数的顺序对应了创建的先后，后创建的先销毁。最后别忘了许可：

```cpp
MODULE_LICENSE("GPL v2");
```

“GPL v2” 代表啥意思可以自行百度。

## 四、总结

最后总结一下写驱动的基本框架：  
**1.** 构建驱动的 **file\_operations** 结构体；

**2.**写一个初始化函数，里面包括了：

- MKDEV：生成16位设备号；
- register\_chrdev():把驱动在链表中注册成字符设备；
- class\_create()：创建一个设备类；
- device\_create():在文件系统中创建驱动。

**3.** 初始化驱动模块： **module\_init();**

**4.** 写一个卸载驱动的函数，里面有：卸载驱动函数、卸载类函数和在链表中移除驱动函数；

**5.** 驱动模块卸载： **module\_exit();**

**6.** 添加许可： **MODULE\_LICENSE(“GPL v2”);**

```
原文链接：https://blog.csdn.net/qq1140920745/article/details/111893981（侵删）
```

**好文推荐：**

[Linux 环境下网络分析和抓包是怎么操作的？](https://zhuanlan.zhihu.com/p/540735358)

[浅谈ARM64Linux内核页表的块映射](https://zhuanlan.zhihu.com/p/539224828)

[Linux性能观测之dstat命令详解](https://zhuanlan.zhihu.com/p/539185753)

[解决Linux内核调测两大难题：内存被改与内存泄露](https://zhuanlan.zhihu.com/p/538322063)

[内核大神教你从 Linux 进程的角度看 Docker](https://zhuanlan.zhihu.com/p/537982888)

[Linux下CAN总线是如何使用的？](https://zhuanlan.zhihu.com/p/537791552)

![](https://pic3.zhimg.com/v2-67d7a584c37d76707f08a09408889e34_1440w.jpg)

发布于 2022-07-19 16:34[线上嵌入式培训课程，粤嵌，华清远见，千锋教育哪家好？](https://www.zhihu.com/question/653981737/answer/4679100304)

[

嵌入式课程本来就不算简单，想培训的话还是线下吧。我大学也是学的通信，毕业后考公考研有两年的时间，均失败，弄得自己和家人都很郁闷，性格也变得跟个炮仗一样，一点就着。中间也试...

](https://www.zhihu.com/question/653981737/answer/4679100304)