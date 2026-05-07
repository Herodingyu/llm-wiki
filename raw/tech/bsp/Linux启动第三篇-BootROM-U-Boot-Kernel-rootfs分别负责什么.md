# Linux 启动链四层职责边界：BootROM、U-Boot、Kernel、rootfs

> 来源：微信公众号 - 黑与白聊嵌入式
> 链接：https://mp.weixin.qq.com/s/OydZPhbdWR2ErfsMUiMKug
> 收录时间：2026-05-07

## 一句话总结

**BootROM 负责"找到入口"，U-Boot 负责"把内核拉起来"，Kernel 负责"把硬件和系统底座跑起来"，rootfs 负责"把用户空间真正建立起来"。**

也可以把它们理解成一条接力链：

1. BootROM 先交出第一棒
2. U-Boot 把 Linux 启动材料准备好
3. Kernel 把系统内核世界搭起来
4. rootfs 把用户空间接起来

---

## 第一层：BootROM 负责"把系统拉出第一步"

**BootROM 是什么？**

它通常是芯片内部固化的一小段启动代码，出厂时就已经写死在 SoC 里。

它不是你烧进去的，也不是你日常改的源码，而是芯片自己带的第一阶段启动逻辑。

**核心职责：**

- 判断从哪个介质启动
- 到指定介质里找第一阶段镜像
- 把镜像搬到片内 SRAM/OCRAM 或指定位置
- 跳转过去执行

**BootROM 不做什么：**

- 不负责加载 Linux kernel
- 不负责解析 rootfs
- 不负责运行用户程序

**只负责把第一阶段引导程序拉起来。**

所以 BootROM 的边界很清楚：
- 它是启动起点
- 但它不是完整 bootloader
- 它只负责把第一棒交出去

---

## 第二层：U-Boot 负责"把内核启动条件准备好"

**U-Boot 的职责：**

- 选择启动介质
- 读取 kernel 镜像
- 读取设备树 dtb
- 按需加载 initrd/initramfs
- 组织 bootargs
- 执行 bootm、booti、bootz
- 把控制权交给内核

如果说 BootROM 负责"找到门"，那 U-Boot 负责的就是：
**把行李收好、路线确认好、把 Linux 送上路。**

**U-Boot 职责边界：**

到 **把控制权交给内核** 为止。

**常见启动问题（卡在 U-Boot 层）：**

- bootcmd 配错
- bootargs 配错
- 镜像地址不对
- bootm/booti/bootz 用错
- dtb 没加载对
- 启动介质选错

本质上都属于：**内核还没真正接棒，U-Boot 没把启动条件准备对。**

---

## 第三层：Kernel 负责"把系统底座搭起来"

**内核接管后的工作：**

- 初始化内存管理
- 建立中断体系
- 初始化调度器
- 初始化定时器
- 建立控制台
- 解析设备树
- 初始化各类驱动
- 识别块设备、串口、网络设备等硬件
- 最终去挂载 rootfs

**Kernel 的职责边界：**

- 负责把系统核心跑起来
- 并为用户空间准备运行基础
- **但它不是用户空间本身**

---

## 第四层：rootfs 负责"把用户空间接起来"

**rootfs 里包含：**

- /sbin/init
- Shell
- 库文件
- 配置文件
- 系统服务
- 应用程序
- 启动脚本

**rootfs 的意义：**

决定 Linux 能不能从"内核启动"进入"系统可用"。

**如果 rootfs 挂不上，经典报错：**

```
VFS: Cannot open root device
Waiting for root device
Kernel panic - not syncing: VFS: Unable to mount root fs
```

这些问题不表示内核没起来，而是表示：
**内核起来了，但没有把用户空间接起来。**

**内核启动第一个用户空间进程：**

```
/sbin/init
systemd
busybox init
```

只有这一步真正跑起来，系统才算进入可用状态。

---

## 为什么这 4 层特别容易混？

因为它们在日志上看起来像是一条连续过程，但实际上，职责已经发生了明显切换。

**最容易混淆的几个点：**

1. **看到 U-Boot，就以为"系统已经起来一半"**
   - 其实只能说明 BootROM 和前一阶段至少没彻底失败

2. **执行了 bootm/booti，就以为 Linux 启动完成**
   - 其实这只是把控制权交给内核

3. **看到内核日志，就以为 rootfs 没问题**
   - 并不一定。很多问题就死在 rootfs 挂载

4. **rootfs 挂上了，就以为系统一定能进 Shell**
   - 也不一定。init 失败照样进不去

---

## 现场最实用的判断方法

**看不到任何输出**
- 先怀疑 BootROM、启动介质、供电、时钟、早期引导

**能看到 U-Boot，但拉不起内核**
- 重点看 U-Boot：镜像、dtb、bootcmd、bootargs、启动命令

**已经有内核日志**
- 说明 U-Boot 这棒大概率交出去了，重点转到 Kernel

**有 VFS 报错**
- 说明 Kernel 已经起来，重点查 rootfs 和 root=

**rootfs 挂上了但系统还不正常**
- 重点查 init、用户空间、脚本和服务

---

## 最简记忆口诀

> **BootROM 找路，U-Boot 装车，Kernel 铺底，rootfs 开门营业。**

或者：

> **BootROM 负责找到入口，U-Boot 负责加载并启动内核，Kernel 负责建立系统核心并挂载 rootfs，rootfs 负责把用户空间真正运行起来。**

---

## 系列文章索引

1. Linux 启动不是一步完成，而是一场分层接力
2. 系统起不来时，先判断到底卡在哪一层
3. **本文：BootROM、U-Boot、Kernel、rootfs 四个角色的职责边界**
