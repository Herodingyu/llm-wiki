---
title: "【系统启动】3W字理清UBoot如何跳转Kernel—uboot与linux交界"
source: "https://zhuanlan.zhihu.com/p/669599871"
author:
  - "[[TrustZone​​​海思技术有限公司 员工]]"
published:
created: 2026-05-03
description: "Perface不知道你是否有这种感觉，就是学习了Uboot，学习了kernel，学习了安卓。但是有时候总感觉是各自孤立的，将三者连续不起来？ 不知道你是否在做启动方案的时候，在宏观上知道了整个启动链路流程，但是却在汪…"
tags:
  - "clippings"
---
[收录于 · ARM/Linux嵌入式](https://www.zhihu.com/column/c_1892354515245703770)

52 人赞同了该文章

## Perface

- 不知道你是否有这种感觉，就是学习了Uboot，学习了kernel，学习了安卓。 **但是有时候总感觉是各自孤立的，将三者连续不起来？**
- 不知道你是否在做启动方案的时候，在宏观上知道了整个启动链路流程，但是却在汪洋的代码中迷了路？

那么这篇文章必定对你有点用处。

> 如果没有，那请当我没说。

我想乘着前面我们刚刚好对 [U-Boot](https://zhida.zhihu.com/search?content_id=236930367&content_type=Article&match_order=1&q=U-Boot&zhida_source=entity) 花了两期，对Uboot本身的运转流程有了深入的了解：

- **[【系统启动】ARMv8架构u-boot启动流程详细分析](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyOTY5NzkwNg%3D%3D%26mid%3D2247487653%26idx%3D1%26sn%3Dcc287dffb241b83dcba3d6d6cc3faf9e%26chksm%3Dfa5c4db8cd2bc4ae341acd9993a8b39e6319d137394d48a3a516643ca61701635689e60cb253%26token%3D1243926845%26lang%3Dzh_CN%23rd)**
- **[【系统启动】uboot启动流程源码分析](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyOTY5NzkwNg%3D%3D%26mid%3D2247487672%26idx%3D1%26sn%3Dd3beba32b748ba4df3cb900ecf193f6c%26chksm%3Dfa5c4da5cd2bc4b32f1e6758517d3244fea124ab83b860f8c25fcfa86bec9ae3a7c470a1cce3%26token%3D1243926845%26lang%3Dzh_CN%23rd)**

是时候让我们 **结合源码** 看一下 **怎么从UBoot跳转到Kernel** ，这个过程可不只是简单的设置一个PC指针那么简单的操作哦。

> 按照我的习惯，从宏观和微观两个角度：宏观了解整流程？微观了解小步骤？  
>   
> **话不多说！上车！**

## 宏观-Linux内核是怎么被引导加载启动的？

## 说明一

首先我们知道 **kernel的镜像最开始是压缩的zImage格式的存在** ，然后Uboot有工具mkimage把其转换为uImage。

什么？不知道？好，那我先给你整两幅图瞅瞅，你就知道了！

![](https://pic4.zhimg.com/v2-558c6554ab701221865fe9838934ac01_1440w.jpg)

![](https://pic1.zhimg.com/v2-07492c0d1b3dc3ef5d55ff4bee4df662_1440w.jpg)

> 亿图这个水印也是没谁了哈哈哈

知道了这个uImage怎么来的， **那这个uImage被加载到哪里呢？**

> 这个就是Uboot里面的 [bootm](https://zhida.zhihu.com/search?content_id=236930367&content_type=Article&match_order=1&q=bootm&zhida_source=entity) 机制来搞定的。

![](https://pic1.zhimg.com/v2-5554607229d4ae12bb9e20b4dd358092_1440w.jpg)

U-Boot命令bootm将内核映像复制到0x00010000，将RAMDISK映像复制到0x00800000。这时，U-Boot跳转到地址0x00010000来启动Linux内核。

## 说明二

zImage内核镜像下载到开发板之后，可以使用u-boot的go命令进行直接跳转，这个时候内核直接解压启动。

但是此时的内核无法挂载文件系统，因为 **go命令没有将内核需要的相关启动参数从u-boot中传递给内核** 。

传递 **相关启动参数必须使用u-boot的bootm命令进行跳转** ，但是u-boot的 **bootm命令只能处理uImage镜像。**

uImage相对于zImage在头部多了64个byte，即为0x40。

> （这里你应该知道了为什么要使用bootm命令，以及为什么要是有uImage格式）

## 说明三

**在前面我们曾经分析过Uboot的启动流程，两个阶段** 。

程序最终执行common/main.c中的 [main\_loop](https://zhida.zhihu.com/search?content_id=236930367&content_type=Article&match_order=1&q=main_loop&zhida_source=entity) 。在此之前都是进行一些初始化工作，U-Boot的 **main\_loop函数相当于main主函数** 。

main\_loop函数的结构很复杂，它所做的工作与具体的平台无关， **主要目的是处理用户输入的命令和引导内核启动** 。

> （终于看到了引导内核加载）

main\_loop 函数的调用关系错综复杂，而且掺杂关系复杂的条件编译，我们抓住与命令实现密切相关的操作来分析命令的实现原理。

命令实现的大致流程如下图所示。

![](https://pica.zhimg.com/v2-ee654c88cf02d028a93c165ffd0f9142_1440w.jpg)

再深入一步的详细流程下面简单展开。

### 1.启动延时

如果配置了启动延迟功能，U-Boot等待用户从控制台（一般为串口）输入字符，等待的时间由顶层配置文件中的宏定义 **CONFIG\_BOOTDELAY 决定** 。在此期间，只要用户按下任意按键就会中断等待，进入命令行输入模式。

如果没有配置启动延时功能或者启动延时超过了设置的时间， U-Boot 运行启动命令行参数，启动命令参数在顶层配置文件中，由 **[CONFIG\_BOOTCOMMAND](https://zhida.zhihu.com/search?content_id=236930367&content_type=Article&match_order=1&q=CONFIG_BOOTCOMMAND&zhida_source=entity)** 宏定义。

### 2.读取命令行输入

命令行输入模式实际上是一个死循环，循环体简化后如下所示：

```
for (;;) {
                len = readline (CONFIG_SYS_PROMPT);
                flag = 0;    /* assume no special flags for now */
                if (len > 0)
                    strcpy (lastcommand, console_buffer);
                else if (len == 0)
                    flag |= CMD_FLAG_REPEAT;
                if (len == -1)
                    puts ("<INTERRUPT>\n");
                else
                    rc = run_command(lastcommand, flag);
                if (rc <= 0) {
                    /* invalid command or not repeatable, forget it */
                    lastcommand[0] = 0;
                }
            }
```

每次循环调用readline函数从控制台读取命令行，并且读取到的字符存储在 **console\_buffer缓冲区** 中。

console\_buffer缓冲区的长度在顶层文件中通过CONFIG\_SYS\_CBSIZE宏定义。

当该函数在接收到一个回车键时认定为命令行输入结束，返回命令行长度len。

如果len大于0，将存储在缓冲区的命令行拷贝至静态数组lastcommand中，flag设置为0。

如果len等于0，即readline函数仅仅接收到一个回车键，即直接返回，flag设置为CMD\_FLAG\_REPEAT，lastcommand数组存放的数据不变。

flag用于标志是否重复上次操作，每个命令都有一个 repeatable标志，当命令的该标志为1时，此时，命令能够重复操作。

**把lastcommand和flag作为run\_command函数的参数，进而调用run\_command函数。**

从 run\_command 函数是否会返回的角度看，U-Boot 的命令分为两类。

**一类是函数返回数值rc，rc小于等于0** ，则传入的命令行参数有误，命令无效，此时把lastcommand数组清零，不再执行重复操作。

**另外一类是不再返回，一去不再复返** ，例如bootm、go等命令，这类用于启动内核，将CPU的管理权从U-Boot交付给内核，完成自己启动内核的终极使命。

### 3.解析命令行

传入的 lastcommand 参数仅仅是 readline 函数读取到用户输入的字符，接下来最主要的工作是解析命令行。

首先判断传入的lastcommand参数是否为空，如果是返回−1，否则继续往下解析。截取函数的关键代码如下，str指针指向 **lastcommand区域** 。

```
while (*str) {
                  for (inquotes = 0, sep = str; *sep; sep++) {
                    if ((*sep=='\'') &&
                        (*(sep-1) != '\\'))
                        inquotes=!inquotes;
                    if (!inquotes &&
                        (*sep == ';') &&   /* separator     */
                        ( sep != str) &&  /* past string start  */
                        (*(sep-1) != '\\'))    /* and NOT escaped    */
                        break;
                  }
```

U-Boot允许命令行存在多个命令，命令间用“;”或者“;”字符分割。

```
token = str;
                  if (*sep) {
                    str = sep + 1;   /* start of command for next pass */
                    *sep = '\0';
                  }
                  else
                    str = sep;   /* no more commands for next pass */
                  /* Extract arguments */
                  if ((argc = parse_line (finaltoken, argv)) == 0) {
                    rc = -1; /* no command at all */
                    continue;
                  }
                  if (cmd_process(flag, argc, argv, &repeatable, NULL))
                    rc = -1;
```

首先解析一个命令，token指向待解析命令的地址。

parse\_line函数分离出命令的各个参数，分别存放在argv中，参数的数目为argc，接着调用common/command.c文件中的cmd\_process函数处理解析得到的命令。

值得注意的是， **命令的第一个参数是命令的名称** 。当前命令处理完毕后， token指向命令行中的下一个命令，直到所有的命令都处理完毕。

### 4.命令处理

main.c中的代码实现了将一个命令的所有参数分离存放在argv数组中，参数的数目为argc，完成了读取命令行和解析命令行的工作。命令的处理由common/command.c文件中的函数完成。U-Boot在include/command.h中定义了一个非常重要的 [cmd\_tbl\_s](https://zhida.zhihu.com/search?content_id=236930367&content_type=Article&match_order=1&q=cmd_tbl_s&zhida_source=entity) 结构体，它在命令的实现方面起着至关重要的作用。

```
struct cmd_tbl_s {
            char    *name;       /* 命令名称            */
            int     maxargs; /* 命令的最大参数   */
            int     repeatable;  /* 是否可重复（按回车键是否会重复执行）
            */
            int     (*cmd)(struct cmd_tbl_s *, int, int, char * const []);  /* 命令响应函数*/
            char    *usage;      /* 简短的用法说明   */
        #ifdef   CONFIG_SYS_LONGHELP
            char    *help;       /* 较详细的帮助*/
        #endif
        #ifdef CONFIG_AUTO_COMPLETE
            /* 响应自动补全参数*/
            int     (*complete)(int argc,char*const argv[],char last_char,int maxv,char*cmdv[]);
        #endif
        };
```

cmd\_tbl\_s结构体包含的成员变量：命令名称、最大参数个数、可重复性、命令响应函数、用法、帮助和命令补全函数，每个命令都由这个结构体来描述。当输入“help”或者“?”会打印出所有的命令和它的usage，输入“help”或者“?”和命令名称时，会打印出help信息。

添加一个命令时，利用宏 [U\_BOOT\_CMD](https://zhida.zhihu.com/search?content_id=236930367&content_type=Article&match_order=1&q=U_BOOT_CMD&zhida_source=entity) 定义一个新的cmd\_tbl\_s结构体，并对这个结构体初始化和定义结构体的属性。例如，在文件common/cmd\_bdinfo.c中：

```
U_BOOT_CMD(
            bdinfo,  1,  1,  do_bdinfo,
            "print Board Info structure",
            ""
        );
```

增加了一个命令，它的名称为bdinfo，最大参数数目为1，可重复，响应函数是do\_bdinfo， usage为“print Board Info structure”，没有帮助信息。U\_BOOT\_CMD宏在include/command.h中定义，当不配置命令补全时，它最终被展开为：

```
#define U_BOOT_CMD(name,maxargs,rep,cmd,usage,help) \
        cmd_tbl_t __u_boot_cmd_##name __attribute__((unused, section(".u_boot_cmd"), aligned( 4))) = {#name, maxargs, rep, cmd, usage, help}
```

其中，“##”与“#”是预编译操作符，“##”表示字符串连接，“#”表示后面紧接着的是一个字符串。cmd\_tbl\_t就是struct cmd\_tbl\_s，用于\_\_u\_boot\_cmd\_##name结构体。

\_\_attribute\_\_定义了结构体的属性，将结构体放在.u\_boot\_cmd段中。简单的说，就是利用U\_BOOT\_CMD定义struct cmd\_tbl\_s结构体变量，并把类变量都放在一个段中。

在链接脚本中指定了.u\_boot\_cmd段的起始地址和结束地址，又已知每个struct cmd\_tbl\_s结构体占用内存空间的大小，这样就很方便地遍历所有的struct cmd\_tbl\_s结构体。这种巧妙的方式充分利用了链接器的功能特点，避免了花费大量的精力，去维护和更新命令结构体表。

```
cmdtp = find_cmd(argv[0]);
            if (cmdtp == NULL) {
                  printf("Unknown command '%s' - try 'help'\n", argv[0]);
                  return 1;
            }
```

cmd\_process函数首先调用find\_cmd函数根据传入的参数，在.u\_boot\_cmd段区域查找命令，如果没有找到对应的命令，打印出提示信息并返回。

如果找到则返回命令结构体 cmdtp，再检查传入参数的合法性，最后通过cmd\_call函数调用命令响应函数（cmdtp->cmd）（cmdtp, flag, argc, argv）。

## 说明四

U-boot是通过执行u-boot提供的命令来加载Linux内核的，其中 **命令bootm的功能** 即为从memory启动Linux内核映像文件。

在讲解bootm加载内核之前，先来看看u-boot中u-boot命令的执行过程。

### 1、u-boot命令的执行过程

在u-boot命令执行到最后时，开始进入命令循环，等待用户输入命令和处理命令，这是通过循环调用main\_loop()函数来实现的，main\_loop函数的主要代码如下所示。

```
len=readline (CONFIG_SYS_PROMPT);
                      flag=0;  /*assume no special flags for now*/
                      if (len > 0)
                          strcpy (lastcommand, console_buffer);
                      else if (len == 0)
                          flag —= CMD_FLAG_REPEAT;
                      rc=run_command (lastcommand, flag);
```

Main\_loop函数从串口终端读入用户输入的要执行的命令行（包括命令和参数），然后调用run\_command函数来执行用户输入的命令行。

下面分析 **run\_command函数的主要工作流程** ，run\_command的主要源码如下所示。

```
strcpy(cmdbuf, cmd);
               /*Extract arguments*/
                           if((argc=parse_line(finaltoken, argv))==0){
                               rc=-1;   /*no command at all*/
                               continue;
                           }
                          /*Look up command in command table*/
                           if((cmdtp=find_cmd(argv[0]))==NULL){
                               printf("Unknown command' %s' -try' help' \n", argv[0]);
                               rc=-1;   /*give up after bad command*/
                               continue;
                           }
                          /*OK-call function to do the command*/
                           if((cmdtp->cmd)(cmdtp, flag, argc, argv)! =0){
                               rc=-1;
                           }
```

从代码中可以看出，run\_command函数通过调用函数parse\_line分析出该命令行所对应的参数个数argc和参数指针数组\*argv\[ \]，

其中 **argv\[0\]中保存的是u-boot命令名字符串** ，接着调用 **函数find\_cmd** ，

函数 **根据命令名在u-boot命令列表中找到该命令对应的u-boot命令结构体cmd\_tbl\_t所在的地址** ，

找到该u-boot命令对应的 **命令结构体** 后，就可以调用 **该结构体中的u-boot命令对应的执行函数来完成该u-boot命令的功能** ，这样一个u-boot命令就执行完成了。

下面再来看看u-boot命令结构体cmd\_tbl\_t及其定义过程和存放的位置。

U-boot命令结构体cmd\_tbl\_t定义如下所示。

```
struct cmd_tbl_s{
                    char       *name;         /*Command Name                     */
                    int        maxargs; /*maximum number of arguments*/
                    int        repeatable;/*autorepeat allowed?      */
                                        /*Implementation function    */
                    int        (*cmd)(struct cmd_tbl_s*, int, int, char*[]);
                    char       *usage;        /*Usage message        (short)     */
                #ifdef     CONFIG_SYS_LONGHELP
                    char       *help;         /*Help  message       (long)      */
                #endif
                #ifdef CONFIG_AUTO_COMPLETE
                   /* do auto completion on the arguments */
                    int        (*complete)(int argc, char*argv[], char last_char, int maxv, char*cmdv[]);
                #endif
                };
```

Cmd\_tbl\_t结构用来保存u-boot命令的相关信息， **包括命令名称、对应的执行函数、使用说明、帮助信息等** 。

**每一条u-boot命令都对应一个cmd\_tbl\_t结构体变量** ，在u-boot中是通过宏U\_BOOT\_CMD来实现cmd\_tbl\_t结构体变量的定义和初始化的。

例如，bootm命令对应U\_BOOT\_CMD调用，代码如下所示。

```
U_BOOT_CMD(
                  bootm,    CONFIG_SYS_MAXARGS,     1,    do_bootm,
                  "boot application image from memory",
                  "[addr[arg...]]\n     -boot application image stored in memory\n"
                  "\tpassing arguments ' arg ...' ; when booting a Linux kernel, \n"
                  "\t' arg' can be the address of an initrd image\n");
```

U\_BOOT\_CMD宏定义如下所示:

```
#define U_BOOT_CMD(name, maxargs, rep, cmd, usage, help) \
              cmd_tbl_t __u_boot_cmd_##name Struct_Section={#name, maxargs, rep, cmd, usage, help
```

这样我们通过U\_BOOT\_CMD宏就定义了cmd\_tbl\_t类型的结构体变量，变量名为\*\*\_\_u\_boot\_cmd\_bootm\*\*，同时用U\_BOOT\_CMD宏中的参数对cmd\_tbl\_t结构体中的每个成员进行初始化。

Struct\_Section也是一个宏定义，定义如下所示。

```
#define Struct_Section  __attribute__((unused, section(".u_boot_cmd")))
```

Struct\_Section定义了结构体变量的段属性，cmd\_tbl\_t类型的结构体变量链接时全部链接到u\_boot\_cmd段中，可以查看u-boot.lds文件对u\_boot\_cmd段位置的安排。

> （这里我们应该有想到，关于uboot\_cmd，我们可以外界输入，内部的肯定也有提前预设的值，比如启动内核这些。如果在这个启动延时的过程中不进行输入，那么就会去执行这些默认的命令。）

上面我们知道了bootm这个命令是引导加载内核的，下面来看看bootm。

## 说明五

Bootm命令用来从memory启动内核，bootm命令的执行流程如下图所示。

在串口终端输入bootm命令后，执行do\_bootm函数来完成相应的功能。Do\_bootm函数首先调用bootm\_start函数。（如果不输入，应该也有。）

![](https://pica.zhimg.com/v2-da2080c223617cd777126efe98a1ce8e_1440w.jpg)

Bootm\_start函数的主要作用是获取内核映像文件的相关信息，并保存到全局变量images中，image是struct bootm\_headers结构类型，用来保存可执行内核映像的相关信息，主要包括内核映像的加载地址、起始地址、可执行入口地址等。

获取内核映像的相关信息是为后面的加载内核做准备；

内核可执行映像文件头包含了这些信息，这是通过工具mkimage加上去的。接下来执行bootm\_load\_os函数。

```
if (load !=image_start) {
                              memmove_wd ((void *)load,
                                      (void *)image_start, image_len, CHUNKSZ);
                          }
```

Image\_start是不包括内核映像文件头的内核起始位置，也就是zImage的起始位置。

内核加载完成后，下面开始执行内核映像，这是通过调用函数do\_bootm\_linux来实现的，下面来看do\_bootm\_linux的执行过程。

Do\_bootm\_linux首先驱动内核的入口地址，代码如下所示。

```
theKernel=(void (*)(int, int, uint))images->ep;
```

Images.ep为内核可执行映像文件的入口地址及zImage的起始地址，它是从内核映像文件头获取的，在前面的bootm\_start函数中已经为它赋值，代码如下所示。

```
images.ep=image_get_ep (&images.legacy_hdr_os_copy);
```

如果需要，准备给内核传递的启动参数，然后获取启动内核需要的两个参数：machid和传递给内核参数的位置，这两个参数都保存在全局数据结构体变量bd的成员变量中，如下所示。

```
bd->bi_boot_params
              machid=bd->bi_arch_number;
```

最后调用内核映像的第一个可执行函数，把控制权移交给内核，代码如下所示。

```
theKernel (0, machid, bd->bi_boot_params);
```

## 说明六

一个cmd\_tbl\_t结构体变量包含了调用一条命令的所需要的信息。

- 对于环境变量bootcmd，执行run\_command(bootcmd, flag)之后，最终是将bootcmd中的参数解析为命令，海思hi3521a中默认参数是bootcmd=bootm 0x82000000
- 相当于执行bootm 0x82000000 命令
- 最终将调用do\_bootm函数，do\_bootm函数在cmd\_bootm.c中实现
![](https://pic4.zhimg.com/v2-d5a31c55dfa052853e8af1929b702dc9_1440w.jpg)

在这个里面有一个函数：

```
int do_bootm_linux(int flag, int argc, char *argv[], bootm_headers_t *images)
{
    bd_t    *bd = gd->bd;
    char    *s;
    int    machid = bd->bi_arch_number;
    void    (*theKernel)(int zero, int arch, uint params);
 
#ifdef CONFIG_CMDLINE_TAG
#ifdef CONFIG_HI3536_A7
    char *commandline = getenv("slave_bootargs");
#else
    char *commandline = getenv("bootargs");   //(1)
 
#endif
#endif
 
    if ((flag != 0) && (flag != BOOTM_STATE_OS_GO))
        return 1;
 
    theKernel = (void (*)(int, int, uint))images->ep; //(2)
 
    s = getenv ("machid");                            //(3)
    if (s) {
        machid = simple_strtoul (s, NULL, 16);
        printf ("Using machid 0x%x from environment\n", machid);
    }
 
    show_boot_progress (15);
 
    debug ("## Transferring control to Linux (at address %08lx) ...\n",
           (ulong) theKernel);
 
 
    setup_start_tag (bd);                    //(4)
 
    setup_memory_tags (bd);                    
    setup_commandline_tag (bd, commandline); //(5)
 
    if (images->rd_start && images->rd_end)        
        setup_initrd_tag (bd, images->rd_start, images->rd_end);
 
    setup_eth_use_mdio_tag(bd, getenv("use_mdio"));
    setup_eth_mdiointf_tag(bd, getenv("mdio_intf"));
    setup_ethaddr_tag(bd, getenv("ethaddr"));   
 
    setup_end_tag (bd);                        //(6)
 
 
    /* we assume that the kernel is in place */
    printf ("\nStarting kernel ...\n\n");
 
#ifdef CONFIG_USB_DEVICE
    {
        extern void udc_disconnect (void);
        udc_disconnect ();
    }
#endif
 
    cleanup_before_linux ();            //(7)
 
    theKernel (0, machid, bd->bi_boot_params); //(8)
    /* does not return */
 
    return 1;
}
```
- (1)获取环境变量bootargs中的值，该环境变量用来传递参数给kernel
- (2)images->ep的地址是kernel的程序的入口地址，也就是将函数指针theKernel指向kernel最先执行的地方。
- (3)获取环境变量machid，这个应该是机器码，海思设备没有定义在环境变量中
- (4)这里是建立一个链表用来存放传递给内核的参数，在board\_init函数中有赋值 gd->bd->bi\_boot\_params = CFG\_BOOT\_PARAMS; CFG\_BOOT\_PARAMS = 0x80000000 + 0x0100 = 0x80000100
- (5)将commandline的值添加到链表中
- (6)结束参数的填充
- (7)启动linux内核前的一个清除操作，主要是关闭中断，关闭缓存等操作
- (8)由前面我们知道theKernel实际指向的是kernel的入口地址，执行这一句之后，uboot就结束了运行，kernel正式运行就从这里开始。

## 说明七

- 1.uboot 调用do\_bootm\_linux 中的 theKernel (0, machid, bd->bi\_boot\_params)进入kernel部分代码  
	该函数最终会通过r0,r1,r2这三个寄存器分别把0、machid、传递传参的首地址传给kernel。
- 2.Kernel 的入口 在head.S中ENTRY(stext)处， **此阶段是汇编阶段** ，此阶段会解析r0,r1,r2(也就是uboot的传参)最终会通过进入start\_kernel，进入到c语言环境执行。

经过前面uboot的准备工作，通过 **theKernel** (0, machid, bd->bi\_boot\_params);

开始进入到kernel部分开始执行。

其中 **第二个参数为机器 ID,** **第三参数为 u-boot 传递给内核参数存放在内存中的首地址** ，此处是 0x30000100

由 zImage 的生成过程我们可以知道，第一阶段运行的内核映像实际就是arch/arm/boot/compressed/vmlinux，而这一阶段所涉及的文件也只有三个：

- (1)arch/arm/boot/compressed/vmlinux.lds
- (2)arch/arm/boot/compressed/head.S
- (3)arch/arm/boot/compressed/misc.c
![](https://picx.zhimg.com/v2-ac1ad0512d469e2350f3b6fedb5af9cd_1440w.jpg)

下面我们的分析集中在 arch/arm/boot/compressed/head.S, 适当参考 vmlinux.lds 。

从linux/arch/arm/boot/compressed/vmlinux.lds文件可以看出head.S的入口地址为ENTRY(\_start)，也就是head.S汇编文件的\_start标号开始的第一条指令。

## 源码流程带注释

## 第一阶段zImage 解压缩阶段

下面从head.S中得\_start 标号开始分析。(有些指令不影响初始化，暂时略去不分析)

代码位置在/arch/arm/boot/compressed/head.S中：

```
start:

.type start,#function   /*uboot跳转到内核后执行的第一条代码*/

.rept 8            /*重复定义8次下面的指令，也就是空出中断向量表的位置*/

mov r0, r0            /*就是nop指令*/

.endr

b 1f                   @ 跳转到后面的标号1处

.word 0x016f2818 @ 辅助引导程序的幻数，用来判断镜像是否是zImage

.word start @ 加载运行zImage的绝对地址，start表示赋的初值

.word _edata @ zImage结尾地址，_edata是在vmlinux.lds.S中定义的，表示init,text,data三个段的结束位置

1: mov r7, r1 @ save architecture ID 保存体系结构ID 用r1保存

mov r8, r2 @ save atags pointer 保存r2寄存器 参数列表，r0始终为0

mrs r2, cpsr @ get current mode  得到当前模式

tst r2, #3 @ not user?，tst实际上是相与,判断是否处于用户模式

bne not_angel            @ 如果不是处于用户模式，就跳转到not_angel标号处

/*如果是普通用户模式，则通过软中断进入超级用户权限模式*/

mov r0, #0x17 @ angel_SWIreason_EnterSVC，向SWI中传递参数

swi 0x123456 @ angel_SWI_ARM这个是让用户空间进入SVC空间

not_angel:                                /*表示非用户模式，可以直接关闭中断*/

mrs r2, cpsr @ turn off interrupts to 读出cpsr寄存器的值放到r2中

orr r2, r2, #0xc0 @ prevent angel from running关闭中断

msr cpsr_c, r2           @ 把r2的值从新写回到cpsr中

/*读入地址表。因为我们的代码可以在任何地址执行，也就是位置无关代码（PIC），所以我们需要加上一个偏移量。下面有每一个列表项的具体意义。

LC0是表的首项，它本身就是在此head.s中定义的

.type LC0, #object

LC0: .word LC0 @ r1 LC0表的起始位置

.word __bss_start @ r2 bss段的起始地址在vmlinux.lds.S中定义

.word _end @ r3 zImage（bss）连接的结束地址在vmlinux.lds.S中定义

.word zreladdr @ r4 zImage的连接地址，我们在arch/arm/mach-s3c2410/makefile.boot中定义的

.word _start @ r5 zImage的基地址，bootp/init.S中的_start函数，主要起传递参数作用

.word _got_start @ r6 GOT（全局偏移表）起始地址，_got_start是在compressed/vmlinux.lds.in中定义的

.word _got_end @ ip GOT结束地址

.word user_stack+4096 @ sp 用户栈底 user_stack是紧跟在bss段的后面的，在compressed/vmlinux.lds.in中定义的

@ 在本head.S的末尾定义了zImag的临时栈空间，在这里分配了4K的空间用来做堆栈。

.section ".stack", "w"

user_stack: .space 4096

GOT表的初值是连接器指定的，当时程序并不知道代码在哪个地址执行。如果当前运行的地址已经和表上的地址不一样，还要修正GOT表。*/

.text

adr r0, LC0                              /*把地址表的起始地址放入r0中*/

ldmia r0, {r1, r2, r3, r4, r5, r6, ip, sp} /*加载地址表中的所有地址到相应的寄存器*/

@r0是运行时地址，而r1则是链接时地址，而它们两都是表示LC0表的起始位置，这样他们两的差则是运行和链接的偏移量，纠正了这个偏移量才可以运行与”地址相关的代码“

subs r0, r0, r1 @ calculate the delta offset 计算偏移量，并放入r0中

beq not_relocated @ if delta is zero, we are running at the address we  were linked at.

@ 如果为0，则不用重定位了，直接跳转到标号not_relocated处执行

/*

*   偏移量不为零，说明运行在不同的地址，那么需要修正几个指针

*   r5 – zImage基地址

*   r6 – GOT（全局偏移表）起始地址

*   ip – GOT结束地址

*/

add r5, r5, r0 /*加上偏移量修正zImage基地址*/

add r6, r6, r0 /*加上偏移量修正GOT（全局偏移表）起始地址*/

add ip, ip, r0 /*加上偏移量修正GOT（全局偏移表）结束地址*/

/*

* 这时需要修正BSS区域的指针，我们平台适用。

*   r2 – BSS 起始地址

*   r3 – BSS 结束地址

*   sp – 堆栈指针

*/

add r2, r2, r0 /*加上偏移量修正BSS 起始地址*/

add r3, r3, r0 /*加上偏移量修正BSS 结束地址*/

add sp, sp, r0 /*加上偏移量修正堆栈指针*/

/*

* 重新定位GOT表中所有的项.

*/

1: ldr r1, [r6, #0] @ relocate entries in the GOT

add r1, r1, r0 @ table.  This fixes up the

str r1, [r6], #4 @ C references.

cmp r6, ip

blo 1b

not_relocated: mov r0, #0

1: str r0, [r2], #4 @ clear bss 清除bss段

str r0, [r2], #4

str r0, [r2], #4

str r0, [r2], #4

cmp r2, r3

blo 1b

bl cache_on        /* 开启指令和数据Cache ，为了加快解压速度*/

@ 这里的 r1,r2 之间的空间为解压缩内核程序所使用，也是传递给 decompress_kernel 的第二和第三的参数

mov r1, sp @ malloc space above stack

add r2, sp, #0x10000 @ 64k max解压缩的缓冲区

@下面程序的意义就是保证解压地址和当前程序的地址不重叠。上面分配了64KB的空间来做解压时的数据缓存。

/*

*   检查是否会覆盖内核映像本身

*   r4 = 最终解压后的内核首地址

*   r5 = zImage 的运行时首地址，一般为 0x30008000

*   r2 = end of malloc space分配空间的结束地址（并且处于本映像的前面）

* 基本要求：r4 >= r2 或者 r4 + 映像长度 <= r5

(1)vmlinux 的起始地址大于 zImage 运行时所需的最大地址（ r2 ） , 那么直接将 zImage 解压到 vmlinux 的目标地址

cmp r4, r2

bhs wont_overwrite /*如果r4大于或等于r2的话*/

(2)zImage 的起始地址大于 vmlinux 的目标起始地址加上 vmlinux 大小（ 4M ）的地址，所以将 zImage 直接解压到 vmlinux 的目标地址

add r0, r4, #4096*1024 @ 4MB largest kernel size

cmp r0, r5

bls wont_overwrite /*如果r4 + 映像长度 <= r5 的话*/

@ 前两种方案通常都不成立，不会跳转到wont_overwrite标号处，会继续走如下分支，其解压后的内存分配示意图如下：

Linux内核启动流程分析（一）【转】-LMLPHP

mov r5, r2 @ decompress after malloc space

mov r0, r5          /*解压程序从分配空间后面存放 */

mov r3, r7

bl decompress_kernel

/******************************进入decompress_kernel***************************************************/

@ decompress_kernel共有4个参数，解压的内核地址、缓存区首地址、缓存区尾地址、和芯片ID，返回解压缩代码的长度。

decompress_kernel(ulg output_start, ulg free_mem_ptr_p, ulg free_mem_ptr_end_p,

int arch_id)

{

output_data = (uch *)output_start;/* Points to kernel start */

free_mem_ptr = free_mem_ptr_p;     /*保存缓存区首地址*/

free_mem_ptr_end = free_mem_ptr_end_p;/*保存缓冲区结束地址*/

__machine_arch_type = arch_id;

arch_decomp_setup();

makecrc();                             /*镜像校验*/

putstr("Uncompressing Linux...");

gunzip();                            /*通过free_mem_ptr来解压缩*/

putstr(" done, booting the kernel.\n");

return output_ptr;                     /*返回镜像的大小*/

}

/******************************从decompress_kernel函数返回*************************************************/

add r0, r0, #127 + 128

bic r0, r0, #127 @ align the kernel length对齐内核长度

/*

* r0     = 解压后内核长度

* r1-r3  = 未使用

* r4     = 真正内核执行地址  0x30008000

* r5     = 临时解压内核Image的起始地址

* r6     = 处理器ID

* r7     = 体系结构ID

* r8     = 参数列表               0x30000100

* r9-r14 = 未使用

*/

@ 完成了解压缩之后，由于内核没有解压到正确的地址，最后必须通过代码搬移来搬到指定的地址0x30008000。搬运过程中有

@ 可能会覆盖掉现在运行的重定位代码，所以必须将这段代码搬运到安全的地方，

@ 这里搬运到的地址是解压缩了的代码的后面r5+r0的位置。

add r1, r5, r0 @ end of decompressed kernel 解压内核的结束地址

adr r2, reloc_start

ldr r3, LC1             @ LC1: .word reloc_end - reloc_start 表示reloc_start段代码的大小

add r3, r2, r3

1: ldmia r2!, {r9 - r14}     @ copy relocation code

stmia r1!, {r9 - r14}

ldmia r2!, {r9 - r14}

stmia r1!, {r9 - r14}

cmp r2, r3

blo 1b

bl cache_clean_flush  @清 cache

ARM(add pc, r5, r0)                     @ call relocation code 跳转到重定位代码开始执行

@ 在此处会调用重定位代码reloc_start来将Image 的代码从缓冲区r5帮运到最终的目的地r4:0x30008000处

reloc_start: add r9, r5, r0         @r9中存放的是临时解压内核的末尾地址

sub r9, r9, #128      @ 不拷贝堆栈

mov r1, r4      @r1中存放的是目的地址0x30008000

1:

.rept 4

ldmia r5!, {r0, r2, r3, r10 - r14} @ relocate kernel

stmia r1!, {r0, r2, r3, r10 - r14} /*搬运内核Image的过程*/

.endr

cmp r5, r9

blo 1b

mov sp, r1                            /*留出堆栈的位置*/

add sp, sp, #128              @ relocate the stack

call_kernel: bl cache_clean_flush    @清除cache

bl cache_off            @关闭cache

mov r0, #0 @ must be zero

mov r1, r7 @ restore architecture number

mov r2, r8 @ restore atags pointer

@ 这里就是最终我们从zImage跳转到Image的伟大一跳了，跳之前准备好r0,r1,r2

mov pc, r4 @ call kernel
```

**到此kernel的第一阶段zImage 解压缩阶段已经执行完。**

## 第二阶段

开始第二阶段

```
__HEAD  /*该宏定义了下面的代码位于".head.text"段内*/

.type stext, %function                           /*声明stext为函数*/

ENTRY(stext)                                      /*第二阶段的入口地址*/

setmode PSR_F_BIT | PSR_I_BIT | SVC_MODE, r9  @ ensure svc mode and irqs disabled 进入超级权限模式，关中断

/*从协处理器CP15，C0读取CPU ID,然后在__proc_info_begin开始的段中进行查找，如果找到，则返回对应处理器相关结构体在物理地址空间的首地址到r5，最后保存在r10中*/

mrc p15, 0, r9, c0, c0                  @ get processor id 取出cpu id

bl __lookup_processor_type           @ r5=procinfo r9=cpuid

/**********************************************************************/ 

__lookup_processor_type函数的具体解析开始（\arch\arm\kernel\ head-common.S）

/**********************************************************************/ 

在讲解该程序段之前先来看一些相关知识，内核所支持的每一种CPU 类型都由结构体proc_info_list来描述。 

该结构体在文件arch/arm/include/asm/procinfo.h 中定义： 

struct proc_info_list { 

unsigned int cpu_val; 

unsigned int cpu_mask; 

unsigned long __cpu_mm_mmu_flags; /* used by head.S */ 

unsigned long __cpu_io_mmu_flags; /* used by head.S */ 

unsigned long __cpu_flush;        /* used by head.S */ 

const char *arch_name; 

const char *elf_name; 

unsigned int elf_hwcap; 

const char *cpu_name; 

struct processor *proc; 

struct cpu_tlb_fns *tlb; 

struct cpu_user_fns *user; 

struct cpu_cache_fns *cache; 

}; 

对于 arm920 来说，其对应结构体在文件 linux/arch/arm/mm/proc-arm920.S 中初始化。 

.section ".proc.info.init", #alloc, #execinstr /*定义了一个段，下面的结构体存放在该段中*/

.type __arm920_proc_info,#object              /*声明一个结构体对象*/

__arm920_proc_info:                            /*为该结构体赋值*/

.long 0x41009200

.long 0xff00fff0

.long  PMD_TYPE_SECT | \

PMD_SECT_BUFFERABLE | \

PMD_SECT_CACHEABLE | \

PMD_BIT4 | \

PMD_SECT_AP_WRITE | \

PMD_SECT_AP_READ

.long  PMD_TYPE_SECT | \

PMD_BIT4 | \

PMD_SECT_AP_WRITE | \

PMD_SECT_AP_READ

b __arm920_setup

…………………………………

.section ".proc.info.init"表明了该结构在编译后存放的位置。在链接文件 arch/arm/kernel/vmlinux.lds 中： 

SECTIONS 

{ 

#ifdef CONFIG_XIP_KERNEL 

. = XIP_VIRT_ADDR(CONFIG_XIP_PHYS_ADDR); 

#else 

. = PAGE_OFFSET + TEXT_OFFSET; 

#endif 

.text.head : { 

_stext = .; 

_sinittext = .; 

*(.text.head) 

}

.init : { /* Init code and data */ 

INIT_TEXT 

_einittext = .; 

__proc_info_begin = .; 

*(.proc.info.init) 

__proc_info_end = .; 

__arch_info_begin = .; 

*(.arch.info.init) 

__arch_info_end = .; 

__tagtable_begin = .; 

*(.taglist.init) 

__tagtable_end = .; 

……………………………… 

｝ 

所有CPU类型对应的被初始化的 proc_info_list结构体都放在 __proc_info_begin和__proc_info_end之间。 

/ *

* r9 = cpuid

*  Returns:

* r5 = proc_info pointer in physical address space

* r9 = cpuid (preserved)

*/

__lookup_processor_type:

adr r3, 3f                     @r3存储的是标号 3 的物理地址（由于没有启用 mmu ，所以当前肯定是物理地址） 

ldmia r3, {r5 - r7}              @ R5=__proc_info_begin，r6=__proc_info_end，r7=标号4处的虚拟地址，即4: .long . 处的地址

add r3, r3, #8                 @ 得到4处的物理地址，刚好是跳过两条指令

sub r3, r3, r7       @ get offset between virt&phys得到虚拟地址和物理地址之间的offset

       /*利用offset ，将 r5 和 r6 中保存的虚拟地址转变为物理地址*/

add r5, r5, r3 @ convert virt addresses to

add r6, r6, r3 @ physical address space

1: ldmia r5, {r3, r4} @ value, mask  r3= cpu_val , r4= cpu_mask

and r4, r4, r9 @ mask wanted bits;r9 中存放的是先前读出的 processor ID ，此处屏蔽不需要的位

teq r3, r4                      @ 查看代码和CPU 硬件是否匹配（ 比如想在arm920t上运行为cortex-a8编译的内核？不让）

beq 2f                          @ 如果相等则跳转到标号2处，执行返回指令

add r5, r5, #PROC_INFO_SZ @ sizeof(proc_info_list结构的长度，在这等于48)如果没找到， 跳到下一个proc_info_list 处

cmp r5, r6                             @ 判断是不是到了该段的结尾

blo 1b                                 @ 如果没有，继续跳到标号1处，查找下一个

mov r5, #0        @ unknown processor ，如果到了结尾，没找到匹配的，就把0赋值给r5，然后返回

2: mov pc, lr                             @ 找到后返回，r5指向找到的结构体

ENDPROC(__lookup_processor_type)

.align 2

3: .long __proc_info_begin

.long __proc_info_end

4: .long .                                  @“.”表示当前这行代码编译连接后的虚拟地址

.long __arch_info_begin

.long __arch_info_end

/**********************************************************************/ 

__lookup_processor_type函数的具体解析结束（\arch\arm\kernel\ head-common.S）

/**********************************************************************/ 

movs r10, r5                     @ invalid processor (r5=0)?

beq __error_p @ yes, error 'p'

/*机器 ID是由u-boot引导内核是通过thekernel第二个参数传递进来的，现在保存在r1中,在__arch_info_begin开始的段中进行查找，如果找到，则返回machine对应相关结构体在物理地址空间的首地址到r5，最后保存在r8中。

bl __lookup_machine_type @ r5=machinfo

/**********************************************************************/ 

__lookup_machine_type函数的具体解析开始（\arch\arm\kernel\ head-common.S）

/**********************************************************************/ 

每一个CPU 平台都可能有其不一样的结构体，描述这个平台的结构体是 machine_desc 。 

这个结构体在文件arch/arm/include/asm/mach/arch.h 中定义： 

struct machine_desc { 

unsigned int nr;          /* architecture number */ 

unsigned int phys_io; /* start of physical io */ 

……………………………… 

}; 

对于平台smdk2410 来说其对应 machine_desc 结构在文件linux/arch/arm/mach-s3c2410/mach-smdk2410.c中初始化： 

MACHINE_START(SMDK2410, "SMDK2410")  

.phys_io = S3C2410_PA_UART, 

.io_pg_offst = (((u32)S3C24XX_VA_UART) >> 18) & 0xfffc, 

.boot_params = S3C2410_SDRAM_PA + 0x100, 

.map_io = smdk2410_map_io, 

.init_irq = s3c24xx_init_irq, 

.init_machine = smdk2410_init, 

.timer = &s3c24xx_timer, 

MACHINE_END 

对于宏MACHINE_START 在文件 arch/arm/include/asm/mach/arch.h 中定义： 

#define MACHINE_START(_type,_name) / 

static const struct machine_desc __mach_desc_##_type / 

 __used / 

 __attribute__((__section__(".arch.info.init"))) = { / 

.nr = MACH_TYPE_##_type, / 

.name = _name, 

#define MACHINE_END / 

}; 

__attribute__((__section__(".arch.info.init")))表明该结构体在并以后存放的位置。 

在链接文件 链接脚本文件 arch/arm/kernel/vmlinux.lds 中 

SECTIONS 

{ 

#ifdef CONFIG_XIP_KERNEL 

. = XIP_VIRT_ADDR(CONFIG_XIP_PHYS_ADDR); 

#else 

. = PAGE_OFFSET + TEXT_OFFSET; 

#endif 

.text.head : { 

_stext = .; 

_sinittext = .; 

*(.text.head) 

}

.init : { /* Init code and data */ 

INIT_TEXT 

_einittext = .; 

__proc_info_begin = .; 

*(.proc.info.init) 

__proc_info_end = .; 

__arch_info_begin = .; 

*(.arch.info.init) 

__arch_info_end = .; 

……………………………… 

｝ 

在__arch_info_begin和 __arch_info_end之间存放了linux内核所支持的所有平台对应的 machine_desc 结构体。 

/*

*  r1 = machine architecture number

 * Returns:

*  r5 = mach_info pointer in physical address space

 */

__lookup_machine_type:

adr r3, 4b                      @ 把标号4处的地址放到r3寄存器里面

ldmia r3, {r4, r5, r6}            @ R 4 = 标号4处的虚拟地址 ，r 5 = __arch_info_begin ，r 6= __arch_info_end

sub r3, r3, r4 @ get offset between virt&phys 计算出虚拟地址与物理地址的偏移

/*利用offset ，将 r5 和 r6 中保存的虚拟地址转变为物理地址*/

add r5, r5, r3 @ convert virt addresses to

add r6, r6, r3 @ physical address space

/*读取machine_desc结构的 nr 参数，对于smdk2410 来说该值是 MACH_TYPE_SMDK2410,这个值在文件linux/arch/arm/tools/mach-types 中:

smdk2410    ARCH_SMDK2410 SMDK2410  193 */

1: ldr r3, [r5, #MACHINFO_TYPE] @ get machine type

teq r3, r1 @ matches loader number?把取到的machine id和从uboot中传过来的machine id（存放r1中）相比较

beq 2f @ found 如果相等，则跳到标号2处，返回

add r5, r5, #SIZEOF_MACHINE_DESC@ next machine_desc 没有找到，则继续找下一个，加上该结构体的长度

cmp r5, r6                      @ 判断是否已经到该段的末尾

blo 1b                          @ 如果没有，则跳转到标号1处，继续查找

mov r5, #0 @ unknown machine 如果已经到末尾，并且没找到，则返回值r5寄存器赋值为0

2: mov pc, lr                      @ 返回原函数，且r5作为返回值

ENDPROC(__lookup_machine_type)

.align 2

3: .long __proc_info_begin

.long __proc_info_end

4: .long .                                  @“.”表示当前这行代码编译连接后的虚拟地址

.long __arch_info_begin

.long __arch_info_end

/**********************************************************************/ 

__lookup_machine_type函数的具体解析结束（\arch\arm\kernel\ head-common.S）

/**********************************************************************/ 

movs r8, r5 @ invalid machine (r5=0)?

beq __error_a @ yes, error 'a'

/*检查 bootloader传入的参数列表 atags 的 合法性*/

bl __vet_atags

/**********************************************************************/ 

__vet_atags函数的具体解析开始（\arch\arm\kernel\ head-common.S）

/**********************************************************************/
```

## 关于参数链表：

内核参数链表的格式和说明可以从内核源代码目录树中的\\arch\\arm\\include\\asm\\setup.h中找到，参数链表必须以ATAG\_CORE开始，以ATAG\_NONE结束。

这里的 ATAG\_CORE，ATAG\_NONE是各个参数的标记，本身是一个32 位值，例如： ATAG\_CORE=0x54410001 。

其它的参数标记还包括： ATAG\_MEM32 ， ATAG\_INITRD ， ATAG\_RAMDISK ， ATAG\_COMDLINE 等。

每个参数标记就代表一个参数结构体，由各个参数结构体构成了参数链表。参数结构体的定义如下：

```
struct tag { 
      struct  tag_header  hdr; 
      union { 
             struct tag_core  core; 
             struct tag_mem32  mem; 
          struct tag_videotext videotext; 
          struct tag_ramdisk   ramdisk; 
          struct tag_initrd    initrd; 
          struct tag_serialnr  serialnr; 
          struct tag_revision  revision; 
          struct tag_videolfb  videolfb; 
          struct tag_cmdline   cmdline; 
          struct tag_acorn     acorn; 
          struct tag_memclk    memclk; 
        } u; 
}; 

参数结构体包括两个部分，一个是 tag_header 结构体 , 一个是 u 联合体。 

tag_header结构体的定义如下：  

struct tag_header {  

                 u32 size;    

                 u32 tag;  

};
```

其中 size ：表示整个 tag 结构体的大小 ( 用字的个数来表示，而不是字节的个数 ) ，等于tag\_header的大小加上 u 联合体的大小，

例如，参数结构体 ATAG\_CORE 的size=(sizeof(tag->tag\_header)+sizeof(tag->u.core))>>2，一般通过函数 tag\_size(struct \* tag\_xxx) 来获得每个参数结构体的 size 。

其中 tag ：表示整个 tag 结构体的标记，如： ATAG\_CORE 等。

```
/* r8  = machinfo

* Returns:

 *  r2 either valid atags pointer, or zero

*/

__vet_atags:

tst r2, #0x3 @ aligned? r2指向该参数链表的起始位置，此处判断它是否字对齐

bne 1f                          @ 如果没有对齐，跳到标号1处直接返回，并且把r2的值赋值为0，作为返回值

ldr r5, [r2, #0] @ is first tag ATAG_CORE? 获取第一个 tag 结构的 size

cmp r5, #ATAG_CORE_SIZE         @ 判断该 tag 的长度是否合法

cmpne r5, #ATAG_CORE_SIZE_EMPTY   

bne 1f                          @ 如果不合法，异常返回

ldr r5, [r2, #4]                @ 获取第一个 tag 结构体的标记

ldr r6, =ATAG_CORE              @ 取出标记ATAG_CORE的内容

cmp r5, r6                      @ 判断该标记是否等于ATAG_CORE

bne 1f                          @ 如果不等，异常返回

mov pc, lr @ atag pointer is ok，如果都相等，则正常返回

1: mov r2, #0                      @ 异常返回值

mov pc, lr @ 异常返回

ENDPROC(__vet_atags)

/**********************************************************************/ 

__vet_atags函数的具体解析结束（\arch\arm\kernel\ head-common.S）

/**********************************************************************/ 

/*创建内核初始化页表*/

bl __create_page_tables

/**********************************************************************/ 

__create_page_tables函数的具体解析开始（\arch\arm\kernel\ head.S）

/**********************************************************************/ 

/*

* r8  = machinfo

 * r9  = cpuid

 * r10 = procinfo

* Returns:

*  r4 = physical page table address

 */

/*在该文件的开头有如下宏定义*/

#define KERNEL_RAM_PADDR (PHYS_OFFSET + TEXT_OFFSET)

.macro pgtbl, rd

ldr\rd, =(KERNEL_RAM_PADDR - 0x4000)

.endm

其中：PHYS_OFFSET在arch/arm/mach-s3c2410/include/mach/memory.h定义，为UL(0x30000000)，而TEXT_OFFSET在arch/arm/Makefile中定义，为内核镜像在内存中到内存开始位置的偏移（字节），为$(textofs-y) textofs-y也在文件arch/arm/Makefile中定义，为textofs-y   := 0x00008000，r4 = 30004000为临时页表的起始地址，首先即是初始化16K的页表，高12位虚拟地址为页表索引，每个页表索引占4个字节，所以为4K*4 = 16K，大页表，每一个页表项，映射1MB虚拟地址.

__create_page_tables:

/*为内核代码存储区域创建页表，首先将内核起始地址-0x4000到内核起始地址之间的16K存储器清0 ，将创建的页表存于此处*/ 

pgtbl r4 @ r4中存放的为页表的基地址，最终该地址会写入cp15的寄存器c2，这个值必须是 16K 对齐的

mov r0, r4                      @ 把页表的基地址存放到r0中

mov r3, #0                      @ 把r3清0

add r6, r0, #0x4000             @ r6指向16K的末尾

1: str r3, [r0], #4                @ 把16K的页表空间清0

str r3, [r0], #4

str r3, [r0], #4

str r3, [r0], #4

teq r0, r6

bne 1b

/*从proc_info_list结构中获取字段 __cpu_mm_mmu_flags ，该字段包含了存储空间访问权限等, 此处指令执行之后r7=0x00000c1e*/

ldr r7, [r10, #PROCINFO_MM_MMUFLAGS] @ mm_mmuflags

/*为内核的第一MB创建一致的映射，以为打开MMU做准备，这个映射将会被paging_init()移除，这里使用程序计数器来获得相应的段的基地址*/

mov r6, pc

mov r6, r6, lsr #20 @ start of kernel section

orr r3, r7, r6, lsl #20 @ flags + kernel base

str r3, [r4, r6, lsl #2] @ identity mapping

/* MMU是通过 C2 中基地址（高 18 位）与虚拟地址的高 12 位组合成物理地址，在转换表中查找地址条目。 R4 中存放的就是这个基地址 0x30004000*/ 

add r0, r4,  #(KERNEL_START & 0xff000000) >> 18   @ r0 = 0x30007000 r0存放的是转换表的起始位置

str r3, [r0, #(KERNEL_START & 0x00f00000) >> 18]! @ r3存放的是内核镜像代码段的起始地址

ldr r6, =(KERNEL_END - 1)                         @ 获取内核的尾部虚拟地址存于r6中

add r0, r0, #4                                    @ 第一个地址条目存放在 0x30007004 处，以后依次递增

add r6, r4, r6, lsr #18                           @ 计算最后一个地址条目存放的位置

1: cmp r0, r6                                        @ 填充这之间的地址条目

/*每一个地址条目代表了 1MB 空间的地址映射。物理地址将从0x30100000开始映射。0X30000000 开始的 1MB 空间将在下面映射*/

add r3, r3, #1 << 20                              

strls r3, [r0], #4

bls 1b

…………………………………

…………………………………………

/*为了使用启动参数，将物理内存的第一MB映射到内核虚拟地址空间的第一个MB，r4存放的是页表的地址。映射0X30000000开始的 1MB 空间PAGE_OFFSET = 0XC0000000,PHYS_OFFSET = 0X30000000, r0 =  0x30007000, 上面是从 0x30007004开始存放地址条目的*/

add r0, r4, #PAGE_OFFSET >> 18

orr r6, r7, #(PHYS_OFFSET & 0xff000000)  @ r6= 0x30000c1e

.if (PHYS_OFFSET & 0x00f00000)

orr r6, r6, #(PHYS_OFFSET & 0x00f00000)

.endif

str r6, [r0]                            @ 将0x30000c1e 存于0x30007000处。

………………………

………………………………

mov pc, lr                              @子程序返回

ENDPROC(__create_page_tables)

/**********************************************************************/ 

__create_page_tables函数的具体解析结束（\arch\arm\kernel\ head.S）

/**********************************************************************/ 

/*把__switch_data标号处的地址放入r13寄存器，当执行完__enable_mmu函数时会把r13寄存器的值赋值给pc，跳转到__switch_data 处执行*/

ldr r13, __switch_data @ address to jump to after mmu has been enabled

/*把__enable_mmu函数的地址值，赋值给lr寄存器，当执行完__arm920_setup时，返回后执行__enable_mmu */

adr lr, BSYM(__enable_mmu) @ return (PIC) address

/**********************************************************************/ 

__enable_mmu函数的具体解析开始（\arch\arm\kernel\ head.S）

/**********************************************************************/ 

__enable_mmu: 

#ifdef CONFIG_ALIGNMENT_TRAP 

orr r0, r0, #CR_A   //使能地址对齐错误检测 

#else 

bic r0, r0, #CR_A 

#endif 

#ifdef CONFIG_CPU_DCACHE_DISABLE 

bic r0, r0, #CR_C   //禁止数据 cache 

#endif 

#ifdef CONFIG_CPU_BPREDICT_DISABLE 

bic r0, r0, #CR_Z 

#endif 

#ifdef CONFIG_CPU_ICACHE_DISABLE 

bic r0, r0, #CR_I  //禁止指令 cache 

#endif             //配置相应的访问权限并存入 r5 中 

mov r5, #(domain_val(DOMAIN_USER, DOMAIN_MANAGER) | / 

      domain_val(DOMAIN_KERNEL, DOMAIN_MANAGER) | / 

      domain_val(DOMAIN_TABLE, DOMAIN_MANAGER) | / 

      domain_val(DOMAIN_IO, DOMAIN_CLIENT)) 

mcr p15, 0, r5, c3, c0, 0 //将访问权限写入协处理器 

mcr p15, 0, r4, c2, c0, 0 //将页表基地址写入基址寄存器 C2 ， 0X30004000 

b __turn_mmu_on          //跳转到程序段去打开 MMU 

ENDPROC(__enable_mmu) 

文件linux/arch/arm/kernel/head.S 中 

__turn_mmu_on: 

mov r0, r0 

mcr p15, 0, r0, c1, c0, 0 //打开 MMU 同时打开 cache 等。 

mrc p15, 0, r3, c0, c0, 0 @ read id reg 读取 id 寄存器 

mov r3, r3 

mov r3, r3    //两个空操作，等待前面所取的指令得以执行。 

mov pc, r13  //程序跳转 

ENDPROC(__turn_mmu_on) 

/**********************************************************************/ 

__enable_mmu函数的具体解析结束（\arch\arm\kernel\ head.S）

/**********************************************************************/ 

/*执行__arm920_setup函数(\arch\arm\mm\ proc-arm920.S),该函数完成对数据cache，指令cache，write buffer等初始化操作*/

  ARM( add pc, r10, #PROCINFO_INITFUNC )

/**********************************************************************/ 

__arm920_setup函数的具体解析开始（\arch\arm\mm\ proc-arm920.S）

/**********************************************************************/ 

 

在上面程序段.section ".text.head", "ax" 的最后有这样几行： 

add pc, r10, #PROCINFO_INITFUNC 

R10中存放的是在函数 __lookup_processor_type 中成功匹配的结构体 proc_info_list。对于arm920 来说在文件 linux/arch/arm/mm/proc-arm920.S 中有： 

.section ".proc.info.init", #alloc, #execinstr 

.type  __arm920_proc_info,#object 

__arm920_proc_info: 

.long 0x41009200 

.long 0xff00fff0 

.long   PMD_TYPE_SECT | / 

PMD_SECT_BUFFERABLE | / 

PMD_SECT_CACHEABLE | / 

PMD_BIT4 | / 

PMD_SECT_AP_WRITE | / 

PMD_SECT_AP_READ 

.long   PMD_TYPE_SECT | / 

PMD_BIT4 | / 

PMD_SECT_AP_WRITE | / 

PMD_SECT_AP_READ 

b __arm920_setup 

……………………………… 

add pc, r10, #PROCINFO_INITFUNC的意思跳到函数 __arm920_setup去执行。 

.type __arm920_setup, #function  //表明这是一个函数 

__arm920_setup: 

mov r0, #0                      //设置 r0 为 0 。 

mcr p15, 0, r0, c7, c7          //使数据 cahche,  指令 cache 无效。 

mcr p15, 0, r0, c7, c10, 4      //使 write buffer 无效。 

#ifdef CONFIG_MMU 

mcr p15, 0, r0, c8, c7          //使数据 TLB, 指令 TLB 无效。 

#endif 

adr r5, arm920_crval            //获取 arm920_crval 的地址，并存入 r5 。 

ldmia r5, {r5, r6}              //获取 arm920_crval 地址处的连续 8 字节分别存入 r5,r6 。 

mrc p15, 0, r0, c1, c0          //获取 CP15 下控制寄存器的值，并存入 r0 。 

bic r0, r0, r5                  //通过查看 arm920_crval 的值可知该行是清除 r0 中相关位，为以后对这些位的赋值做准备 

orr r0, r0, r6                  //设置 r0 中的相关位，即为 mmu 做相应设置。 

mov pc, lr                      //上面有操作 adr lr, __enable_mmu ，此处将跳到程序段 __enable_mmu 处。 

.size __arm920_setup, . - __arm920_setup 

.type arm920_crval, #object 

arm920_crval: 

crval clear=0x00003f3f, mmuset=0x00003135, ucset=0x00001130 

/**********************************************************************/ 

__arm920_setup函数的具体解析结束（\arch\arm\mm\ proc-arm920.S）

/**********************************************************************/ 

ENDPROC(stext)

接着往下分析linux/arch/arm/kernel/head-common.S中：

.type __switch_data, %object      @定义__switch_data为一个对象

__switch_data:

.long __mmap_switched

.long __data_loc @ r4

.long _data @ r5

.long __bss_start @ r6

.long _end @ r7

.long processor_id @ r4

.long __machine_arch_type @ r5

.long __atags_pointer @ r6

.long cr_alignment @ r7

.long init_thread_union + THREAD_START_SP @ sp

/*

 * The following fragment of code is executed with the MMU on in MMU mode,

 * and uses absolute addresses; this is not position independent.

*  r0  = cp#15 control register

 *  r1  = machine ID

 *  r2  = atags pointer

 *  r9  = processor ID

 */

 /*其中上面的几个段的定义是在文件arch/arm/kernel/vmlinux.lds 中指定*/

********************************** vmlinux.lds开始*******************************************

 SECTIONS 

 { 

 …………………… 

 #ifdef CONFIG_XIP_KERNEL 

 __data_loc = ALIGN(4); /* location in binary */ 

 . = PAGE_OFFSET + TEXT_OFFSET; 

 #else 

 . = ALIGN(THREAD_SIZE); 

  __data_loc = .; 

 #endif 

 .data : AT(__data_loc) {  //此处数据存储在上面__data_loc处。 

  _data = .; /* address in memory */  

  *(.data.init_task) 

………………………… 

.bss : { 

__bss_start = .; /* BSS */ 

*(.bss) 

*(COMMON) 

_end = .; 

} 

……………………………… 

｝ 

init_thread_union 是 init进程的基地址.在 arch/arm/kernel/init_task.c 中: 

union thread_union init_thread_union __attribute__((__section__(".init.task"))) = { INIT_THREAD_INFO(init_task) };         

对照 vmlnux.lds.S 中,我们可以知道init task是存放在 .data 段的开始8k, 并且是THREAD_SIZE(8k)对齐的 */ 

********************************** vmlinux.lds结束*******************************************

__mmap_switched:

adr r3, __switch_data + 4

ldmia r3!, {r4, r5, r6, r7}

……………………

………………………………

mov fp, #0 @ 清除bss段

1: cmp r6, r7

strcc fp, [r6],#4

bcc 1b

 ARM( ldmia r3, {r4, r5, r6, r7, sp})  /*把__machine_arch_type变量值放入r5中，把__atags_pointer变量的值放入r6中*/

str r9, [r4] @ Save processor ID 保存处理器id到processor_id所在的地址中

str r1, [r5] @ Save machine type 保存machine  id到__machine_arch_type中

str r2, [r6] @ Save atags pointer 保存参数列表首地址到__atags_pointer中

bic r4, r0, #CR_A @ Clear 'A' bit

stmia r7, {r0, r4} @ Save control register values

b start_kernel                @程序跳转到函数 start_kernel 进入 C 语言部分。

ENDPROC(__mmap_switched)

到处我们的启动的第二阶段分析完毕。
```

**第三阶段完全是C语言代码，从start\_kernel函数开始，这次就先到这里吧。**

> 注意：kernel镜像（zImage）的前部分代码是未经压缩直接可以使用的，后半部分代码由前面一小部分未压缩的代码解压缩后再使用。后面会介绍解压缩程序。

搓搓小手等着咱们下篇：

> Kernel怎么跳转到Android：linux与安卓的交界  
>   
> 那么这次到站啦！下次见。

## 参考资料：

- 《深入理解嵌入式Linux设备驱动程序》
- 《嵌入式Linux开发实用教程》
- [blog.csdn.net/li\_wen01/](https://link.zhihu.com/?target=https%3A//blog.csdn.net/li_wen01/article/details/103353627)
- [blog.csdn.net/baidu\_386](https://link.zhihu.com/?target=https%3A//blog.csdn.net/baidu_38601468/article/details/126445751)
- [blog.chinaunix.net/uid-](https://link.zhihu.com/?target=http%3A//blog.chinaunix.net/uid-25909619-id-3380535.html)
- [blog.chinaunix.net/uid-](https://link.zhihu.com/?target=http%3A//blog.chinaunix.net/uid-25909619-id-3380544.html)

发布于 2023-11-30 10:30・新加坡[大一自学Java到毕业，学会这些内容，就可以进大厂啦](https://zhuanlan.zhihu.com/p/377897661)

[

我就是自学Java进的大厂，学校很普通一个不知名的一本，专业是计算机专业，不过在学校学不到什么，基本都是靠自学，我们班...

](https://zhuanlan.zhihu.com/p/377897661)