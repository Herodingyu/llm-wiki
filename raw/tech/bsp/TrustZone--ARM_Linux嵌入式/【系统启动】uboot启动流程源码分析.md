---
title: "【系统启动】uboot启动流程源码分析"
source: "https://zhuanlan.zhihu.com/p/669600615"
author:
  - "[[TrustZone​​​海思技术有限公司 员工]]"
published:
created: 2026-05-03
description: "最近做AVB校验，需要uboot到kernel的这个过程。这里再复习一下。 与大多数BootLoader一样，uboot的启动过程分为BL1和BL2两个阶段。 BL1阶段通常是开发板的配置等设备初始化代码，需要依赖依赖于SoC体系结构，通常…"
tags:
  - "clippings"
---
[收录于 · ARM/Linux嵌入式](https://www.zhihu.com/column/c_1892354515245703770)

9 人赞同了该文章

最近做AVB校验，需要uboot到kernel的这个过程。这里再复习一下。

与大多数BootLoader一样，uboot的启动过程分为 [BL1](https://zhida.zhihu.com/search?content_id=236930528&content_type=Article&match_order=1&q=BL1&zhida_source=entity) 和 [BL2](https://zhida.zhihu.com/search?content_id=236930528&content_type=Article&match_order=1&q=BL2&zhida_source=entity) 两个阶段。

BL1阶段通常是开发板的配置等设备初始化代码，需要依赖依赖于 [SoC体系结构](https://zhida.zhihu.com/search?content_id=236930528&content_type=Article&match_order=1&q=SoC%E4%BD%93%E7%B3%BB%E7%BB%93%E6%9E%84&zhida_source=entity) ，通常用汇编语言来实现；

BL2阶段主要是对外部设备如网卡、Flash等的初始化以及uboot命令集等的自身实现，通常用C语言来实现。

## 1、BL1阶段

uboot的 **BL1阶段代码通常放在start.s文件中** ，用汇编语言实现，其主要代码功能如下：

- （1） 指定uboot的入口。在链接脚本uboot.lds中指定uboot的入口为start.S中的\_start。
- （2）设置异常向量(exception vector)
- （3）关闭IRQ、FIQ，设置SVC模式
- （4）关闭L1 cache、设置L2 cache、关闭MMU
- （5）根据OM引脚确定启动方式
- （6）在SoC内部SRAM中设置栈
- （7）lowlevel\_init（主要初始化系统时钟、SDRAM初始化、串口初始化等）
- （8）设置开发板供电锁存
- （9）设置SDRAM中的栈
- （10）将uboot从SD卡拷贝到SDRAM中
- （11）设置并开启MMU
- （12）通过对SDRAM整体使用规划，在SDRAM中合适的地方设置栈
- （13）清除bss段，远跳转到start\_armboot执行，BL1阶段执行完

## 2、BL2阶段

start\_armboot函数位于lib\_arm/board.c中，是C语言开始的函数，也是BL2阶段代码中C语言的 主函数，同时还是整个u-boot（armboot）的主函数，BL2阶段的主要功能如下：

- （1）规划uboot的内存使用
- （2）遍历调用函数指针数组init\_sequence中的初始化函数
- （3）初始化uboot的堆管理器 [mem\_malloc\_init](https://zhida.zhihu.com/search?content_id=236930528&content_type=Article&match_order=1&q=mem_malloc_init&zhida_source=entity)
- （4）初始化 [SMDKV210](https://zhida.zhihu.com/search?content_id=236930528&content_type=Article&match_order=1&q=SMDKV210&zhida_source=entity) 开发板的SD/MMC控制器 [mmc\_initialize](https://zhida.zhihu.com/search?content_id=236930528&content_type=Article&match_order=1&q=mmc_initialize&zhida_source=entity)
- （5）环境变量重定位 [env\_relocate](https://zhida.zhihu.com/search?content_id=236930528&content_type=Article&match_order=1&q=env_relocate&zhida_source=entity)
- （6）将环境变量中网卡地址赋值给全局变量的开发板变量
- （7）开发板硬件设备的初始化 [devices\_init](https://zhida.zhihu.com/search?content_id=236930528&content_type=Article&match_order=1&q=devices_init&zhida_source=entity)
- （8）跳转表jumptable\_init
- （9）控制台初始化console\_init\_r
- （10）网卡芯片初始化eth\_initialize
- （11）uboot进入主循环main\_loop

这里主要对第二个阶段BL2进行一个分析。

## 3、start\_armboot函数分析

start\_armboot函数的主要功能如下：

- （1）遍历调用 **函数指针数组init\_sequence中的初始化函数**

依次遍历调用函数指针数组init\_sequence中的函数，如果有函数执行出错，则执行hang函数，打印出”### ERROR ### Please RESET the board ###”，进入死循环。

- （2）初始化uboot的 **堆管理器mem\_malloc\_init**
- （3）初始化SMDKV210的 **SD/MMC控制器mmc\_initialize**
- （4）环境 **变量重定位env\_relocate**
- （5）将环境变量 **中网卡地址赋值给全局变量的开发板变量**
- （6）开发板硬件 **设备的初始化devices\_init**
- （7） **跳转表jumptable\_init**
- （8）控 **制台初始化console\_init\_r**
- （9）网卡 **芯片初始化eth\_initialize**
- （10）uboot **进入主循环main\_loop**
```
1、第二阶段的函数入口： start_armboot(void)
void start_armboot (void)
{
    init_fnc_t **init_fnc_ptr;
    char *s;
#ifndef CFG_NO_FLASH
    ulong size;
#endif
#if defined(CONFIG_VFD) || defined(CONFIG_LCD)
    unsigned long addr;
#endif
    /* Pointer is writable since we allocated a register for it */
    gd = (gd_t*)(_armboot_start - CFG_MALLOC_LEN - sizeof(gd_t));  //gd结构体内所有信息，最终会传递给Linux内核//
    /* compiler optimization barrier needed for GCC >= 3.4 */
    __asm__ __volatile__("": : :"memory");
    memset ((void*)gd, 0, sizeof (gd_t));
    gd->bd = (bd_t*)((char*)gd - sizeof(bd_t));
    memset (gd->bd, 0, sizeof (bd_t));
    monitor_flash_len = _bss_start - _armboot_start;
    for (init_fnc_ptr = init_sequence; *init_fnc_ptr; ++init_fnc_ptr) {  / /这里for循环的是一个函数接口数组：
        if ((*init_fnc_ptr)() != 0) {
            hang ();
        }
    }
/*板子初始化函数数组，函数被按照顺序调用*/
init_fnc_t *init_sequence[] = {
    cpu_init,        /* basic cpu dependent setup */
    board_init,        /* basic board dependent setup */
    interrupt_init,        /* set up exceptions */
    env_init,        /* initialize environment */
    init_baudrate,        /* initialze baudrate settings */
    serial_init,        /* serial communications setup */
    console_init_f,        /* stage 1 init of console */
    display_banner,        /* say that we are here */
#if defined(CONFIG_DISPLAY_CPUINFO)
    print_cpuinfo,        /* display cpu info (and speed) */
#endif
#if defined(CONFIG_DISPLAY_BOARDINFO)
    checkboard,        /* display board info */
#endif
    dram_init,        /* configure available RAM banks */
    display_dram_config,
    NULL,
};
/
2、cpu_init()对CPU的IRQ和FIQ堆栈初始化
此函数在./cpu/armxxx/cpu.c里
int cpu_init (void)
{
    /*
     * setup up stacks if necessary
     */
#ifdef CONFIG_USE_IRQ
    IRQ_STACK_START = _armboot_start - CFG_MALLOC_LEN - CFG_GBL_DATA_SIZE - 4;
    FIQ_STACK_START = IRQ_STACK_START - CONFIG_STACKSIZE_IRQ;
#endif
    return 0;
}
//
3、 board_init()对CPU的系统时钟、GPIO口和串口的初始化
此函数在./board/xxx/xxx.上
int board_init (void)
{
    DECLARE_GLOBAL_DATA_PTR;
    S3C24X0_CLOCK_POWER * const clk_power = S3C24X0_GetBase_CLOCK_POWER();
    S3C24X0_GPIO * const gpio = S3C24X0_GetBase_GPIO();
    /* to reduce PLL lock time, adjust the LOCKTIME register */
    clk_power->LOCKTIME = 0xFFFFFF;
    /* configure MPLL */
    clk_power->MPLLCON = ((M_MDIV << 12) + (M_PDIV << 4) + M_SDIV);
    /* some delay between MPLL and UPLL */
    delay (4000);
    /* configure UPLL */
    clk_power->UPLLCON = ((U_M_MDIV << 12) + (U_M_PDIV << 4) + U_M_SDIV);
    /* some delay between MPLL and UPLL */
    delay (8000);
    /* set up the I/O ports */
    gpio->GPACON = 0x007FFFFF;
    gpio->GPBCON = 0x00044556;
    gpio->GPBUP = 0x000007FF;
    gpio->GPCCON = 0xAAAAAAAA;
    gpio->GPCUP = 0x0000FFFF;
    gpio->GPDCON = 0xAAAAAAAA;
    gpio->GPDUP = 0x0000FFFF;
    gpio->GPECON = 0xAAAAAAAA;
    gpio->GPEUP = 0x0000FFFF;
    gpio->GPFCON = 0x000055AA;
    gpio->GPFUP = 0x000000FF;
    gpio->GPGCON = 0xFF95FF3A;
    gpio->GPGUP = 0x0000FFFF;
    gpio->GPHCON = 0x0016FAAA;
    gpio->GPHUP = 0x000007FF;
    gpio->EXTINT0=0x22222222;
    gpio->EXTINT1=0x22222222;
    gpio->EXTINT2=0x22222222;
    /* arch number of SMDK2410-Board */
    gd->bd->bi_arch_number = MACH_TYPE_SMDK2410;
    /* adress of boot parameters */
    gd->bd->bi_boot_params = 0x30000100;
    icache_enable();     //地址总线高速缓存区使能//
    dcache_enable();   //数据总线高速缓存区使能//
    return 0;
}
串口通信初始化，函数在/cpu/armxxx/xxx/serial.c里
void serial_setbrg (void)
{
    S3C24X0_UART * const uart = S3C24X0_GetBase_UART(UART_NR);
    int i;
    unsigned int reg = 0;
    /* value is calculated so : (int)(PCLK/16./baudrate) -1 */
    reg = get_PCLK() / (16 * gd->baudrate) - 1;
    /* FIFO enable, Tx/Rx FIFO clear */
    uart->UFCON = 0x07;
    uart->UMCON = 0x0;
    /* Normal,No parity,1 stop,8 bit */
    uart->ULCON = 0x3;
    /*
     * tx=level,rx=edge,disable timeout int.,enable rx error int.,
     * normal,interrupt or polling
     */
    uart->UCON = 0x245;
    uart->UBRDIV = reg;
#ifdef CONFIG_HWFLOW
    uart->UMCON = 0x1; /* RTS up */
#endif
    for (i = 0; i < 100; i++);
}
/*
* Initialise the serial port with the given baudrate. The settings
* are always 8 data bits, no parity, 1 stop bit, no start bits.
*
*/
int serial_init (void)
{
    serial_setbrg ();
    return (0);
}
//
4、 interrupt_init()配置启动定时器4中断，10ms一次
此函数在./cpu/armxxx/xxx/interupts.c上
int interrupt_init (void)
{
    S3C24X0_TIMERS * const timers = S3C24X0_GetBase_TIMERS();
    /* use PWM Timer 4 because it has no output */
    /* prescaler for Timer 4 is 16 */
    timers->TCFG0 = 0x0f00;
    if (timer_load_val == 0)
    {
        /*
         * for 10 ms clock period @ PCLK with 4 bit divider = 1/2
         * (default) and prescaler = 16. Should be 10390
         * @33.25MHz and 15625 @ 50 MHz
         */
        timer_load_val = get_PCLK()/(2 * 16 * 100);
    }
    /* load value for 10 ms timeout */
    lastdec = timers->TCNTB4 = timer_load_val;
    /* auto load, manual update of Timer 4 */
    timers->TCON = (timers->TCON & ~0x0700000) | 0x600000;
    /* auto load, start Timer 4 */
    timers->TCON = (timers->TCON & ~0x0700000) | 0x500000;
    timestamp = 0;
    return (0);
}
//
5、 env_init()配置检查可用的FLASH
此函数在./common/env_flash.c里
int  env_init(void)
{
    int crc1_ok = 0, crc2_ok = 0;
    uchar flag1 = flash_addr->flags;          //用来判断FLASH是否是空的
    uchar flag2 = flash_addr_new->flags; .
    ulong addr_default = (ulong)&default_environment[0];
    ulong addr1 = (ulong)&(flash_addr->data);
    ulong addr2 = (ulong)&(flash_addr_new->data);
#ifdef CONFIG_OMAP2420H4
    int flash_probe(void);
    if(flash_probe() == 0)
        goto bad_flash;
#endif
    /*对待用的新地址进行CRC校验*/
    crc1_ok = (crc32(0, flash_addr->data, ENV_SIZE) == flash_addr->crc);
    crc2_ok = (crc32(0, flash_addr_new->data, ENV_SIZE) == flash_addr_new->crc);
    if (crc1_ok && ! crc2_ok) {
        gd->env_addr  = addr1;
        gd->env_valid = 1;
    } else if (! crc1_ok && crc2_ok) {
        gd->env_addr  = addr2;
        gd->env_valid = 1;
    } else if (! crc1_ok && ! crc2_ok) {
        gd->env_addr  = addr_default;
        gd->env_valid = 0;
    } else if (flag1 == ACTIVE_FLAG && flag2 == OBSOLETE_FLAG) {
        gd->env_addr  = addr1;
        gd->env_valid = 1;
    } else if (flag1 == OBSOLETE_FLAG && flag2 == ACTIVE_FLAG) {
        gd->env_addr  = addr2;
        gd->env_valid = 1;
    } else if (flag1 == flag2) {
        gd->env_addr  = addr1;
        gd->env_valid = 2;
    } else if (flag1 == 0xFF) {
        gd->env_addr  = addr1;
        gd->env_valid = 2;
    } else if (flag2 == 0xFF) {
        gd->env_addr  = addr2;
        gd->env_valid = 2;
    }
#ifdef CONFIG_OMAP2420H4
bad_flash:
#endif
    return (0);
}
//
6、 init_baudrate()初始化配置串口波特率，递交给内核启动变量
此函数位置在./lib_xxx/board.c
static int init_baudrate (void)
{
    char tmp[64];    /* long enough for environment variables */
    int i = getenv_r ("baudrate", tmp, sizeof (tmp));
    gd->bd->bi_baudrate = gd->baudrate = (i > 0)
            ? (int) simple_strtoul (tmp, NULL, 10)
            : CONFIG_BAUDRATE;
    return (0);
}
//
7、 console_init_f()向Linux内核递交串口控制台信息
此函数在./common/console.c
int console_init_f (void)
{
    gd->have_console = 1;
#ifdef CONFIG_SILENT_CONSOLE
    if (getenv("silent") != NULL)
        gd->flags |= GD_FLG_SILENT;
#endif
    return (0);
}
///
8、 dram_init()函数定义了板子的内存地址与大小等信息，并向内核递交
此函数在./board/sbc2410x/sbc2410x.c
int dram_init (void)
{
    DECLARE_GLOBAL_DATA_PTR;
    gd->bd->bi_dram[0].start = PHYS_SDRAM_1;
    gd->bd->bi_dram[0].size = PHYS_SDRAM_1_SIZE;
    return 0;
}
///
9、 main_loop()引导启动Linux内核的真正函数
此函数在./common/main.c
这里面其实是启动了U-BOOT的控制台指令集，提供u-boot的各种功能包括引导启动内核
```

main\_loop()引导启动Linux内核的真正函数， **这个main\_loop()才是我最关注的函数。**

这一步找到了我想要的关注点，就是main\_loop()函数。

上一篇找到了我的关键点--main\_loop函数，这一篇来好好看一下。

uboot中的main\_loop函数是怎么工作的。

## 4、main\_loop函数是做什么的？

start\_armboot最后进入死循环调用了main\_loop 函数；

uboot的目的是启动内核，那么main\_loop一定会有 **设置启动参数** 和 **启动内核** 的实现；

main\_loop()函数做的都是与具体平台无关的工作，主要包括初始化启动次数限制机制、设置软件版本号、打印启动信息、解析命令等。

## 5、main\_loop()函数内容

```
void main_loop(void)
{
    const char *s;

    bootstage_mark_name(BOOTSTAGE_ID_MAIN_LOOP, "main_loop");

    if (IS_ENABLED(CONFIG_VERSION_VARIABLE))
        env_set("ver", version_string);  /* set version variable */

    cli_init();

    if (IS_ENABLED(CONFIG_USE_PREBOOT))
        run_preboot_environment_command();

    if (IS_ENABLED(CONFIG_UPDATE_TFTP))
        update_tftp(0UL, NULL, NULL);

    s = bootdelay_process();
    if (cli_process_fdt(&s))
        cli_secure_boot_cmd(s);

    autoboot_command(s);

    cli_loop();
    panic("No CLI available");
}
```
- env\_set：设置环境变量，两个参数分别为name和value
- cli\_init：用于初始化hash shell的一些变量
- run\_preboot\_environment\_command：执行预定义的环境变量的命令
- bootdelay\_process：加载延时处理，一般用于Uboot启动后，有几秒的倒计时，用于进入命令行模式。
- cli\_loop：命令行模式，主要作用于Uboot的命令行交互。

## bootdelay\_process

```
const char *bootdelay_process(void)
{
    char *s;
    int bootdelay;

    bootcount_inc();

    s = env_get("bootdelay");                               //先判断是否有bootdelay环境变量，如果没有，就使用menuconfig中配置的CONFIG_BOOTDELAY时间
    bootdelay = s ? (int)simple_strtol(s, NULL, 10) : CONFIG_BOOTDELAY;

    if (IS_ENABLED(CONFIG_OF_CONTROL))                      //是否使用设备树进行配置
        bootdelay = fdtdec_get_config_int(gd->fdt_blob, "bootdelay",
                          bootdelay);

    debug("### main_loop entered: bootdelay=%d\n\n", bootdelay);

    if (IS_ENABLED(CONFIG_AUTOBOOT_MENU_SHOW))
        bootdelay = menu_show(bootdelay);
    bootretry_init_cmd_timeout();

#ifdef CONFIG_POST
    if (gd->flags & GD_FLG_POSTFAIL) {
        s = env_get("failbootcmd");
    } else
#endif /* CONFIG_POST */
    if (bootcount_error())
        s = env_get("altbootcmd");
    else
        s = env_get("bootcmd");                             //获取bootcmd环境变量，用于后续的命令执行

    if (IS_ENABLED(CONFIG_OF_CONTROL))
        process_fdt_options(gd->fdt_blob);
    stored_bootdelay = bootdelay;

    return s;
}
```

## autoboot\_command

```
void autoboot_command(const char *s)
{
    debug("### main_loop: bootcmd=\"%s\"\n", s ? s : "<UNDEFINED>");

    if (stored_bootdelay != -1 && s && !abortboot(stored_bootdelay)) {
        bool lock;
        int prev;

        lock = IS_ENABLED(CONFIG_AUTOBOOT_KEYED) &&
            !IS_ENABLED(CONFIG_AUTOBOOT_KEYED_CTRLC);
        if (lock)
            prev = disable_ctrlc(1); /* disable Ctrl-C checking */

        run_command_list(s, -1, 0);

        if (lock)
            disable_ctrlc(prev);    /* restore Ctrl-C checking */
    }

    if (IS_ENABLED(CONFIG_USE_AUTOBOOT_MENUKEY) &&
        menukey == AUTOBOOT_MENUKEY) {
        s = env_get("menucmd");
        if (s)
            run_command_list(s, -1, 0);
    }
}
```

我们看一下判断条件stored\_bootdelay!= -1 && s &&!abortboot(stored\_bootdelay

- stored\_bootdelay：为环境变量的值，或者menuconfig设置的值
- s：为环境变量bootcmd的值，为后续运行的指令
- abortboot(stored\_bootdelay)： **主要用于判断是否有按键按下** 。如果按下，则不执行bootcmd命令，进入cli\_loop命令行模式；如果不按下，则执行bootcmd命令，跳转到加载Linux启动。

## cli\_loop

```
void cli_loop(void)
{
    bootstage_mark(BOOTSTAGE_ID_ENTER_CLI_LOOP);
#ifdef CONFIG_HUSH_PARSER
    parse_file_outer();
    /* This point is never reached */
    for (;;);                   //死循环
#elif defined(CONFIG_CMDLINE)
    cli_simple_loop();
#else
    printf("## U-Boot command line is disabled. Please enable CONFIG_CMDLINE\n");
#endif /*CONFIG_HUSH_PARSER*/
}
```

如上代码，程序只执行parse\_file\_outer来处理用户的输入、输出信息。

最后付一个关于main\_loop()较为丰富的函数，去掉了宏定义控制的代码

```
void main_loop (void)
{

static char lastcommand[CFG_CBSIZE] = {
 0, };
int len;
int rc = 1;
int flag;
#if defined(CONFIG_BOOTDELAY) && (CONFIG_BOOTDELAY >= 0) //是否有bootdelay
char *s;
int bootdelay;
#endif
#ifdef CONFIG_BOOTCOUNT_LIMIT //启动次数的限制
unsigned long bootcount = 0;
unsigned long bootlimit = 0;
char *bcs;
char bcs_set[16];
#endif /* CONFIG_BOOTCOUNT_LIMIT */
#ifdef CONFIG_BOOTCOUNT_LIMIT
bootcount = bootcount_load();//读取已经启动的次数
bootcount++;
bootcount_store (bootcount);//将启动次数加1再写回去保存起来
sprintf (bcs_set, "%lu", bootcount);
setenv ("bootcount", bcs_set); //设置已经启动的次数到环境变量bootcount
bcs = getenv ("bootlimit");//从环境变量获取启动次数的上限，此时返回的是字符串还需要转换成整数
bootlimit = bcs ? simple_strtoul (bcs, NULL, 10) : 0;
#endif /* CONFIG_BOOTCOUNT_LIMIT */
#ifdef CONFIG_VERSION_VARIABLE //设置ver环境变量，里面保存的是uboot的版本
{

extern char version_string[];
setenv ("ver", version_string); /* set version variable */
}
#endif /* CONFIG_VERSION_VARIABLE */
#ifdef CONFIG_AUTO_COMPLETE //命令的自动补全功能
install_auto_complete();
#endif
#ifdef CONFIG_FASTBOOT//支持fastboot刷机
if (fastboot_preboot())
run_command("fastboot", 0);
#endif
/* 下面就是实现uboot启动延时机制bootdelay的代码 */
#if defined(CONFIG_BOOTDELAY) && (CONFIG_BOOTDELAY >= 0)
s = getenv ("bootdelay"); /* 从环境变量获取启动延时的秒数 */
bootdelay = s ? (int)simple_strtol(s, NULL, 10) : CONFIG_BOOTDELAY;
debug ("### main_loop entered: bootdelay=%d\n\n", bootdelay);
/* 检查启动次数是否超过上限*/
#ifdef CONFIG_BOOTCOUNT_LIMIT
if (bootlimit && (bootcount > bootlimit)) {

printf ("Warning: Bootlimit (%u) exceeded. Using altbootcmd.\n",
(unsigned)bootlimit);
s = getenv ("altbootcmd");
}
else
#endif /* CONFIG_BOOTCOUNT_LIMIT */
s = getenv ("bootcmd"); /* 从环境变量获取启动内核的命令 */
debug ("### main_loop: bootcmd=\"%s\"\n", s ? s : "<UNDEFINED>");
/*abortboot函数是检测在bootdelay时间内是否有人按键：如果有人按键则返回1； 超过bootdelay的时间没有人按键则返回0，if条件满足则启动内核*/
if (bootdelay >= 0 && s && !abortboot (bootdelay)) {

#ifdef CONFIG_AUTOBOOT_KEYED
int prev = disable_ctrlc(1); /* 禁止 ctrl+c 功能 */
#endif
run_command (s, 0); //启动内核
#ifdef CONFIG_AUTOBOOT_KEYED
disable_ctrlc(prev); /* 恢复 ctrl+c 功能 */
#endif
}
#endif /* CONFIG_BOOTDELAY */
/* * 下面是一个死循环，不停的从控制台读取命令解析，直到执行bootm命令去启动内核 */
for (;;) {

len = readline (CFG_PROMPT); //从控制台读取一行指令，存放在console_buffer
flag = 0; /* assume no special flags for now */
if (len > 0)
strcpy (lastcommand, console_buffer);
else if (len == 0)
flag |= CMD_FLAG_REPEAT;
if (len == -1)
puts ("<INTERRUPT>\n");
else
rc = run_command (lastcommand, flag); //解析并运行读取到的指令
if (rc <= 0) {

/* invalid command or not repeatable, forget it */
lastcommand[0] = 0;
}
}
}
```

## 参考链接：

- **[【u-boot源码分析】](https://link.zhihu.com/?target=https%3A//blog.csdn.net/weixin_40639467/article/details/122506413)**
- **[【嵌入式linux开发uboot移植-uboot启动过程源码分析】](https://link.zhihu.com/?target=https%3A//blog.51cto.com/u_15169172/2710568)**

发布于 2023-11-30 10:33・新加坡[自学Java，北京第一份工作13K。（记录一下我的经历）](https://zhuanlan.zhihu.com/p/397918569)

[

毕业三年，自学Java到就业，我用了9个月。先给大家分享一下我转行的经历： 17年毕业，垃圾专科，通信专业。当初选择这个专...

](https://zhuanlan.zhihu.com/p/397918569)