!\[cover\_image\](https://mmbiz.qpic.cn/sz\_mmbiz\_jpg/g68z8egLoSr4 IltWeQ4GSmkaRXy6eicen7qaNnXEBspNWusj4OTKV7mX1nfDIM0bicQOkeNaOKrBM3 ViaQ7BREVIy0yFJChKRRG0s0ibLiafPaHA/0?wx\_fmt=jpeg)


# SoC（5）：架构级低功耗设计：真正省电的 SoC，不是“少干活”，而是“会干活” 

Original  alltowine  alltowine  [芯片系统成长记](javascript:void\(0\);) *2026年5月8日 14:58* * 湖北 *

在小说阅读器读本章

去阅读

在小说阅读器中沉浸阅读

做芯片低功耗设计，很多人第一反应是：降频、降压、关时钟。 

这些当然重要，但它们更像是“局部技巧”。真正决定一颗 SoC 能不能省电的，往往不是后期补救，而是在系统架构阶段就已经决定了。 

换句话说： 

低功耗不是最后优化出来的，而是一开始设计出来的。 

!\[Image\](https://mmbiz.qpic.cn/sz\_mmbiz\_png/g68z8egLoSrfYOnO9fRl8c3 IyfnoyPNJKSbO3 Mbjfk9 ZnMOUSko5bHVTaxK6guIqx4 ZaBDpsYIXubZ5AKvU3KMV3LQAMXu0twJ5 OfialI6 Fk/640?wx\_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx\_lazy=1#imgIndex=0) 


## 一、  怎么  最简单地理解  功耗 

芯片为什么耗电？ 

本质上主要有两类。 

第一类是动态功耗。 

电路中的信号从 0 变 1，或者从 1 变 0，每一次翻转都会消耗能量。翻转越频繁、频率越高、电压越高，动态功耗就越大。 

第二类是静态功耗。 

即使电路不工作，只要模块还通着电，晶体管也会有漏电流。就像家里的电器处于待机状态，虽然没真正使用，但仍然在耗电。 

所以低功耗设计的原理其实很简单： 

少翻转，少搬数据，少等待，少漏电。 

再通俗一点说，就是： 

能不动就不动； 

能少动就少动； 

能近处拿数据就别去远处拿； 

能睡觉的模块就不要一直醒着。 


## 二、处理器：别让“大马拉小车” 

在 SoC 中，通常不只有 CPU，还可能有 GPU、DSP、NPU、ISP、MCU 等不同计算单元。 

从架构级低功耗角度看，第一个原则是： 

让合适的硬件干合适的活。 

比如手机拍照后做人脸检测。 

如果全部交给 CPU 做，CPU 要频繁跑高频，功耗自然高。 

但如果交给 ISP 或 NPU 做，它们是为图像处理和 AI 推理专门设计的，单位任务能耗通常更低。  这就像搬家。 

你可以用跑车一趟趟搬箱子，也可以用货车一次装完。跑车性能强，但不代表它适合搬家。  芯片里也是一样。 

通用 CPU 很灵活，但不是所有任务都应该交给 CPU。 

架构级低功耗不是简单地让 CPU 跑慢一点，而是减少 CPU 做不该做的事。 


## 三、存储：很多时候，搬数据比计算更费电 

在 SoC 中，数据可能来自寄存器、Cache、片上 SRAM、SPM、外部 DRAM、Flash 等不同层次。 

越靠近计算单元，访问越快，通常也越省电；越远，访问代价越高。 

所以低功耗设计里有一个非常重要的思想： 

不要让数据在芯片里来回长途旅行。 

比如 AI 推理时，如果每一层计算都反复从外部 DRAM 读取权重和特征图，功耗会非常高。 

更好的做法是： 

把常用数据放在片上 SRAM 或 SPM 里； 

让数据尽量复用； 

让 DMA 搬数据，CPU 不要一直参与等待； 

减少访问外部 DRAM 的次数。 

这就像做饭。 

常用调料放在灶台边，随手可取。 

如果每放一次盐都要跑去楼下仓库，效率低，体力也浪费。  芯片里也是一样： 

减少数据搬运，往往比减少一次计算更重要。 


## 四、互连：不是所有模块都该走“高速公路” 

SoC 中有很多模块：CPU、DMA、存储控制器、显示、音频、通信接口、传感器接口等。它们之间需要通过总线、交叉开关或 NoC 互连。 

架构设计时，一个常见误区是： 

所有模块都挂到一条高性能总线上。  这看起来简单，但不一定省电。 

因为低速外设，比如 UART、I2C、SPI，本来只需要很低的带宽。如果它们每次访问都唤醒高频互连，就像骑自行车买菜却非要占用高速公路。 

更合理的做法是分层： 

高性能模块走 AXI 这类高带宽通路； 

低速外设挂到 APB 这类低功耗总线； 

中间通过桥接模块连接。 

这样做的好处是： 

高速模块不被低速模块拖累，低速模块也不用承担高性能互连的功耗代价。 


## 五、外设：让系统“被叫醒”，而不是“一直等” 

低功耗 SoC 里，很重要的一个思想是事件驱动。 

比如智能手表平时不需要主 CPU 一直运行。 

计步、心率、RTC、蓝牙低功耗模块可以处于低功耗状态，只有当传感器检测到事件时，再通过中断唤醒系统。  这比 CPU 一直轮询“有没有事情发生”要省电得多。 

通俗说就是： 

不要让系统一直睁着眼睛等消息，而是让外设在有事时叫醒它。 

这也是很多移动设备能长时间待机的关键。 


## 六、常见低功耗技术：从“关时钟”到“关电源” 

理解了架构级低功耗的思路，再看常见低功耗技术就清楚多了。 

它们本质上都是围绕一个目标： 

让芯片只在必要的时候、用必要的性能、打开必要的模块。 

!\[Image\](data:image/svg+xml,%3C%3 Fxml version='1.0' encoding='UTF-8'%3F%3E%3 Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3 Ctitle%3E%3C/title%3E%3 Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3 Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3 Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E) 


### 1\. 时钟门控：不工作，就别让它翻转 

时钟门控，也就是 Clock Gating，是最常见的低功耗技术之一。 

很多数字电路的功耗来自时钟翻转。即使某个模块暂时没有处理数据，只要时钟还在跑，里面的触发器、寄存器和部分组合逻辑仍然可能在活动。 

时钟门控的做法很直接： 

模块不用时，先把时钟停掉。 

比如一个 UART 模块只有在收发数据时才需要工作，平时没有通信任务，就可以关闭它的时钟。 

这相当于： 

人还坐在办公室，但没活的时候先别开电脑风扇狂转。 

时钟门控主要降低动态功耗。 


### 2\. 电源门控：长时间不用，直接断电 

如果一个模块只是短时间不用，关时钟就够了。 

但如果一个模块很长时间不用，只关时钟还不够，因为它仍然存在漏电。  这时候就需要电源门控，也就是 Power Gating。 

它的思路是： 

长时间不用的模块，不只是停时钟，而是直接关电源。 

比如手机待机时，GPU、摄像头 ISP、大部分高速接口都可以断电。需要时再重新上电、初始化。 

这相当于： 

短暂离开座位，可以只关屏幕； 

晚上下班，就应该把整台电脑关掉。  电源门控主要降低静态漏电功耗。 

不过它也有代价： 

重新上电需要时间； 

模块状态可能丢失； 

需要额外的隔离、保持和电源控制逻辑。 

所以电源门控适合“睡得久”的模块。 


### 3\. DVFS：需要多少性能，就给多少电压和频率 

DVFS 是 Dynamic Voltage and Frequency Scaling，动态电压频率调节。 

它的核心思想是： 

性能需求高时提高频率和电压；性能需求低时降低频率和电压。 

比如手机刷短视频、玩游戏时，CPU/GPU 需要高性能，可以升频升压。 

但阅读电子书、待机、听音乐时，性能需求低，就可以降频降压。  这像开车： 

高速超车时需要大油门； 

城市慢行时没必要一直踩到底。 

DVFS 的关键在于“按需供给”。 

它不是简单追求低频，因为太低可能导致任务执行时间变长，反而不一定省电。真正好的 DVFS 策略，是在性能、响应时间和能耗之间找到平衡。 


### 4\. 多电压域：不同区域，用不同电压 

SoC 里不同模块对性能的要求不同。 

CPU 可能需要高频运行； 

低速外设只需要很低频率； 

常开模块只承担唤醒、计时、状态保持等任务。  如果全芯片都使用同一个高电压，就会浪费。 

所以架构上常常会划分多个电压域： 

高性能域：CPU、GPU、NPU 等； 

低功耗域：外设、传感器接口等； 

常开域：RTC、唤醒控制器、电源管理模块等。  不同区域使用不同电压，才能做到： 

需要性能的地方给性能，不需要性能的地方尽量省电。 

这就像一栋楼里，不同房间按需开灯，而不是整栋楼统一开最亮。 


### 5\. 多电源域：不同模块，独立开关 

多电源域和多电压域经常一起出现。 

它的思路是把 SoC 划分成多个可以独立开关的区域。比如： 

CPU 电源域； 

GPU 电源域； 

NPU 电源域； 

外设电源域； 

Always-on 常开电源域。  这样系统可以根据场景关闭不同模块。 

比如手机待机时： 

大 CPU 关闭； 

GPU 关闭； 

ISP 关闭； 

显示相关模块关闭； 

只保留 RTC、触控唤醒、低功耗传感器等常开模块。  这就是移动设备长待机的基础。 


### 6\. 状态保持：睡觉之前，把重要信息存好 

电源门控有一个问题： 

模块断电后，里面的寄存器状态可能会丢失。 

如果每次唤醒都从头初始化，时间长、功耗也高。 

所以会用到状态保持，也就是 Retention。  简单理解就是： 

模块睡觉前，把关键状态保存下来；醒来后，快速恢复。 

比如   CPU 进入深度睡眠前，需要保存部分上下文；某些控制寄存器也需要保持状态  ，避免唤醒后重新配置大量内容。 

这有点像电脑睡眠模式： 

不是彻底关机，而是把现场保存好，下次可以快速恢复。 


### 7\. 隔离单元：关掉一个模块，别影响别人 

当某个电源域被关闭后，它的输出信号可能变成未知状态。 

如果这些未知信号传给还在工作的模块，就可能导致系统异常。 

所以需要隔离单元，也就是   Isolation Cell。 

它的作用是： 

当一个模块断电时，把它对外输出固定在安全值。 

这就像家里某个房间断电维修时，要把相关开关隔离好，不能影响整栋楼的供电系统。 

隔离单元不是直接省电的主角，但它是电源门控能安全使用的基础。 


### 8\. 多阈值电压：关键路径跑得快，非关键路径少漏电 

晶体管有一个重要参数叫阈值电压。 

低阈值晶体管速度快，但漏电大； 

高阈值晶体管速度慢，但漏电小。  所以芯片设计中常用多阈值电压技术，也就是 Multi-Vt。 

它的思路是： 

关键路径用速度快的低阈值器件； 

非关键路径用漏电小的高阈值器件。 

这相当于： 

关键岗位配高性能人员，普通岗位没必要都上顶配。 

这样可以在不明显影响性能的情况下，降低静态功耗。 


## 七、   例子：手机为什么能待机那么久？ 

!\[Image\](data:image/svg+xml,%3C%3 Fxml version='1.0' encoding='UTF-8'%3F%3E%3 Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3 Ctitle%3E%3C/title%3E%3 Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3 Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3 Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E) 

手机待机时，并不是整颗芯片都在工作。 

大 CPU 核可能已经关闭； 

GPU、ISP、显示等大功耗模块断电； 

大部分外设关闭时钟； 

DRAM 进入低功耗刷新； 

RTC、触控、基带、低功耗传感器保留唤醒能力。  当用户拿起手机、点亮屏幕、打开相机时，系统才按需唤醒相关模块。 

拍照时： 

ISP 处理图像流； 

NPU 做人脸识别和场景识别； 

CPU 负责控制和调度； 

数据尽量在片上缓存、ISP、NPU 之间流动，减少外部内存访问。  从低功耗技术看，这里面同时用了很多手段： 

时钟门控，让空闲模块不翻转； 

电源门控，让长时间不用的模块不漏电； 

DVFS，让 CPU/GPU 按需调整性能； 

多电压域，让不同模块使用不同供电； 

状态保持，让系统睡眠后可以快速恢复； 

事件唤醒，让外设有事再叫醒 CPU。  所以手机能长时间待机，不是因为芯片“什么都不做”，而是因为它知道： 

什么时候该睡，什么时候该醒，醒来以后谁来干活。 


## 八、总结：架构级低功耗的本质是“按需工作” 

架构级低功耗不是单纯让芯片变慢，也不是简单牺牲性能。 

它真正追求的是： 

该快的时候快； 

该慢的时候慢； 

该睡的时候睡； 

该交给专用硬件的时候，不要让 CPU 硬扛； 

能在片上解决的数据，不要频繁跑去外部内存； 

能关时钟就关时钟； 

能关电源就关电源； 

能分电压域就不要全芯片一个电压跑到底。 

一颗优秀的 SoC，不只是看 CPU 多强、总线多快、存储多大。 

更关键的是，它是否知道： 

什么时候工作，谁来工作，数据怎么走，哪些模块可以不工作。 

真正省电的芯片，不是“少干活”的芯片，而是“会干活”的芯片  ！  ！  ！

预览时标签不可点

**微信扫一扫赞赏作者**  [ Like the Author ](javascript:;)

Close

**[0人付费](javascript:;)

**

更多

Loading...

Loading...

Close

更多

Name cleared

**微信扫一扫赞赏作者** Like the Author  [Other Amount](javascript:;)

赞赏后展示我的头像

作品

暂无作品

Like the Author

Other Amount

¥

最低赞赏 ¥0

OK

Back

**Other Amount**

更多

赞赏金额

¥

最低赞赏 ¥0

1

2

3

4

5

6

7

8

9

0

.

SoC合集 · 目录 #SoC合集

上一篇  SoC（4）：一文详解AI时代下的处理器子系统

Close

更多

搜索「」网络结果

Close

**调整当前正文文字大小

**

更多

100%

​

Comment

暂无留言

1 comment(s)

已无更多数据

[Send Message](javascript:;)

写留言:

[](javascript:; "轻点两下打开表情键盘")[](javascript:; "轻点两下选择图片")

Scan to Follow

继续滑动看下一个

轻触阅读原文

!\[Image\](http://mmbiz.qpic.cn/mmbiz\_png/ibRFNxEJVe1KQXlyyQFTEicX9LPIBN4h4AP1qnybM2v04iaiaLWVrEDhicQBjP8ymoqJMnqK0bKAyTmNyYEzr7HMs3A/0?wx\_fmt=png)

芯片系统成长记

向上滑动看下一个

当前内容可能存在未经审核的第三方商业营销信息，请确认是否继续访问。

[继续访问](javascript:) [Cancel](javascript:)

[微信公众平台广告规范指引](javacript:;)

[Got It](javascript:;)

Scan with Weixin to  
use this Mini Program

[Cancel](javascript:void\(0\);) [Allow](javascript:void\(0\);)

[Cancel](javascript:void\(0\);) [Allow](javascript:void\(0\);)

[Cancel](javascript:void\(0\);) [Allow](javascript:void\(0\);)

× 分析

!\[跳转二维码\](https://mp.weixin.qq.com/s/-RW-yCWIFBeqSYTy-zHCXQ)!\[作者头像\](http://mmbiz.qpic.cn/mmbiz\_png/ibRFNxEJVe1KQXlyyQFTEicX9LPIBN4h4AP1qnybM2v04iaiaLWVrEDhicQBjP8ymoqJMnqK0bKAyTmNyYEzr7HMs3A/0?wx\_fmt=png)

微信扫一扫可打开此内容，  
使用完整服务

!\[Image\](https://mmbiz.qpic.cn/mmbiz\_png/ibRFNxEJVe1KQXlyyQFTEicX9LPIBN4h4AP1qnybM2v04iaiaLWVrEDhicQBjP8ymoqJMnqK0bKAyTmNyYEzr7HMs3A/300?wx\_fmt=png&wxfrom=18)

芯片系统成长记

已关注

Like

Share

Popular

Comment

:  ，  ，  ，  ，  ，  ，  ，  ，  ，  ，  ，  ，  .     Video  Mini Program  Like  ，轻点两下取消赞  Wow  ，轻点两下取消在看  Share  Comment  Favorite  听过 

可在「公众号 > 右上角  \> 划线」找到划线过的内容

!\[划线引导图\](https://res.wx.qq.com/op\_res/opqv3ix6k9E4e64 ZzO7uIqE3 ZblwIojfmt7u70m59yS1ylFK-hTu6 Ra8V\_LaWQJ1P4 OlUJPdXLfVBtrm3 TwRrw)

OK

, ,

选择留言身份

**Comment

**

暂无留言

1 comment(s)

已无更多数据

[Send Message](javascript:;)

写留言:

[](javascript:; "轻点两下打开表情键盘")[](javascript:; "轻点两下选择图片")

Close

更多

Close

**

SoC合集

**

Details

更多

Loading...

关闭


## 确认提交投诉

你可以补充投诉原因（选填）

确定