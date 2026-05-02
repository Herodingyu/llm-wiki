---
title: "CPU是怎么改变频率的？ - 老狼 的回答"
source: "https://www.zhihu.com/question/391299306/answer/1237300432"
author:
  - "[[老狼​新知答主已关注]]"
  - "[[消失的苦猫逗比，该死的工科男]]"
  - "[[Bluebear​​哈尔滨工业大学 计算机应用技术博士]]"
published:
created: 2026-05-02
description: "更改倍频很简单，就是通过PLL CLOCK MULTIPLIER完成。我们从头来看一下。主板上有好几个晶振，其中最重要…"
tags:
  - "clippings"
---
[谢邀 @星环城中央电脑](https://www.zhihu.com/people/20bbc527a165f21093f13fa91b1706aa)

知乎用户mnZAy1 等 541 人赞同了该回答

![](https://picx.zhimg.com/50/v2-c47e780c0ce0d2552e26b1720ca3e4a6_720w.jpg?source=2c26e567)

大黑框里面就是ICC

还没有人送礼物，鼓励一下作者吧

[发布于 2020-05-21 19:12](https://www.zhihu.com/question/391299306/answer/1237300432)[日常家庭存储困难，有没有什么好用的个人轻NAS推荐？](https://zhuanlan.zhihu.com/p/718687369)

[

刚给家里安排上一台新NAS，买的是 绿联DXP4800，到现在用了快两个月了，一个字总结使用感就是“香”！有家庭存...

](https://zhuanlan.zhihu.com/p/718687369)

#### 更多回答[谢邀 @星环城中央电脑](https://www.zhihu.com/people/20bbc527a165f21093f13fa91b1706aa)

![](https://pica.zhimg.com/50/v2-0d7b85718633661d710c36837912014e_720w.jpg?source=1def8aca)

CPU使用PLL (Phase-Lock Loop, 锁相环)来倍频。 我手头没有合适的CPU内的倍频器的资料，但是你可以参考一下商业的独立PLL器件，例如德州仪器的： 1 主要的环路由Phase Detector/鉴相器、VCO/压控振荡器（图中一个圆圈里面有个波浪线的）以及一个分频器（N Divider）构成。当然德州仪器的这个器件为了支持小数倍频还用了Σ-Δ调制模块(Sigma-Delta Modulator)，略去不表。此外，CPout的输出在外部经由环路滤波器后，连接至Vtune。 你可能有点疑惑，明明是倍频，为什么里面用的是分频器。 其简要原理是，左侧Input Signal处为基频的基准频率输入（例如100MHz），经过一些预处理后，送入Phase Detector一端。比较结果输给电荷泵，由CPout至Vtune。Vtune决定了VCO的输出频率（VCO是一种特殊的器件，其输出频率与输入电压相关）。随后由N-Divider回到Phase Detector另一端。 如果N-Divider设置为40分频，那么Phase Detector保持稳定的条件自然是N-Divider输入为4000MHz，这样输出才是100MHz维持Phase Detector稳定。 所以右侧的频率输出将为4000MHz，整体上看仿佛是40倍频。（其实是用VCO生成一个4GHz的频率然后分频回去成100MHz比对是否准确，形成闭环控制） 所以实名反对 @Bluebear 这位哈工大的CS博士，PLL不是用来分频的。 参考 LMX2594 德州仪器 https://www.ti.com.cn/product/cn/LMX2594

举个例子，AMD Ryzen吧，基频Multiplier到合适频率，比如4G，接着用PLL分频。好玩的在于每个CCX/CCD有一个倍频一个分频，因此实际每个CCX/CCD有自己的频率，同时PLL分频决定了，有最高1的频率，还有接着分下来的0.8,0.67,0.57,0.5这几个分频的。然后又引入了clock stretch核心还能浮动0.1Ghz左右。

至于Multiplier这块，可以实现任意正整数倍的频率改变，实际上CPU的核心 Cache有不同的频率，因此有不同的Multiplier做倍频。至于基频来自南桥或者主板独立频率源。

![](chrome-extension://difoiogjjojoaoomphldepapgpbgkhkb/assets/logo-O35E636P.png) Sider

[五粮液 355 万](https://www.zhihu.com/search?q=%E4%BA%94%E7%B2%AE%E6%B6%B2&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[湖人 vs 火箭 345 万](https://www.zhihu.com/search?q=%E6%B9%96%E4%BA%BA+vs+%E7%81%AB%E7%AE%AD&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[导游称大熊猫花花是残疾游客秒报警 340 万](https://www.zhihu.com/search?q=%E5%AF%BC%E6%B8%B8%E7%A7%B0%E5%A4%A7%E7%86%8A%E7%8C%AB%E8%8A%B1%E8%8A%B1%E6%98%AF%E6%AE%8B%E7%96%BE%E6%B8%B8%E5%AE%A2%E7%A7%92%E6%8A%A5%E8%AD%A6&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[孙杨被曝疑违规录取博士 335 万](https://www.zhihu.com/search?q=%E5%AD%99%E6%9D%A8%E8%A2%AB%E6%9B%9D%E7%96%91%E8%BF%9D%E8%A7%84%E5%BD%95%E5%8F%96%E5%8D%9A%E5%A3%AB&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[女子徒手给月子里宝宝打耳洞 294 万](https://www.zhihu.com/search?q=%E5%A5%B3%E5%AD%90%E5%BE%92%E6%89%8B%E7%BB%99%E6%9C%88%E5%AD%90%E9%87%8C%E5%AE%9D%E5%AE%9D%E6%89%93%E8%80%B3%E6%B4%9E&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[曝吴宣仪提出解约遭乐华拒绝 290 万](https://www.zhihu.com/search?q=%E6%9B%9D%E5%90%B4%E5%AE%A3%E4%BB%AA%E6%8F%90%E5%87%BA%E8%A7%A3%E7%BA%A6%E9%81%AD%E4%B9%90%E5%8D%8E%E6%8B%92%E7%BB%9D&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[阿 Sa 蔡卓妍官宣结婚 290 万](https://www.zhihu.com/search?q=%E9%98%BF+Sa+%E8%94%A1%E5%8D%93%E5%A6%8D%E5%AE%98%E5%AE%A3%E7%BB%93%E5%A9%9A&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[广州地铁有人喷洒不明液体 267 万](https://www.zhihu.com/search?q=%E5%B9%BF%E5%B7%9E%E5%9C%B0%E9%93%81%E6%9C%89%E4%BA%BA%E5%96%B7%E6%B4%92%E4%B8%8D%E6%98%8E%E6%B6%B2%E4%BD%93&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[^1]: Datasheet [http://www.intel.com/content/www/us/en/chipsets/200-series-chipset-pch-datasheet-vol-1.html?wapkw=200+series+chipset](http://www.intel.com/content/www/us/en/chipsets/200-series-chipset-pch-datasheet-vol-1.html?wapkw=200+series+chipset)

[^2]: 501A [https://www.idt.com/us/en/document/dst/loco-pll-clock-multiplier](https://www.idt.com/us/en/document/dst/loco-pll-clock-multiplier)