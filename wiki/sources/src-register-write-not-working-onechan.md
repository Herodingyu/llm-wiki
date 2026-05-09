---
doc_id: src-register-write-not-working-onechan
title: 寄存器写入不生效：终极排查指南与 Checklist
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/register-write-not-working-onechan.md
domain: tech/soc-pm
created: 2026-05-09
updated: 2026-05-09
tags: [soc-pm]
---

## Summary

> 来源：微信公众号「OneChan」 > 原文链接：https://mp.weixin.qq.com/s/Q3PezmIqbq7GHbEI4qk4ug > 关联链接：https://mp.weixin.qq.com/s/rdzMy62uHpMyktmjphO-3Q

## Key Points

### 1. 核心观点
寄存器写入不生效是嵌入式开发里最磨人的"玄学问题"没有之一。它能让你从下午两点 debug 到凌晨三点，最后发现是少写了一个 `volatile`；也能让你对着示波器抓三天波形，最终证明是 IP 核文档写错了一个 bit 位。

### 2. 第一类：低级错误（90% 的问题在这里）


### 3. 1. 地址错误
- 把 `0x10` 当成十进制的 10 - 32 位寄存器偏移当成字节偏移（`reg_base + 1` 是第二个字节，不是第二个寄存器） - 复制粘贴时 `UART0_BASE` 写成 `UART1_BASE`

### 4. 2. 忘记 `volatile`
- 编译器优化认为变量不会被硬件改变 - 单步调试正常，全速运行异常 - `-O0` 不优化，`-O1` 以上问题突然出现 ```c // 错误 // 正确 ```

### 5. 3. 写了只读/读了只写寄存器
- 写只读：硬件直接忽略，无任何错误 - 读只写：读到不确定的值 - 某些 bit 只读、某些 bit 可写：只读 bit 被忽略

## Evidence

- Source: [原始文章](raw/tech/soc-pm/register-write-not-working-onechan.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/register-write-not-working-onechan.md)
