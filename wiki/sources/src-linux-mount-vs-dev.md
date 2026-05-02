---
doc_id: src-linux-mount-vs-dev
title: Linux 挂载与 /dev 访问的区别
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/linux为什么要挂载，直接访问dev目录不行吗？ - 醉卧沙场 的回答.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, linux, mount, dev, filesystem]
---

## Summary

本文进一步解释了为什么不能直接访问 /dev 目录来读取文件。/dev 下的设备文件是"接口"而非"文件系统"，直接访问得到的是存储块（扇区）的原始数据。挂载操作将文件系统模块与设备关联，形成"激活运行状态"，用户才能通过文件系统方法看到文件和目录的存在形式。

## Key Points

### 1. /dev 的本质
- /dev 是设备登记册，记录设备的"身份证"
- 只告诉系统有哪些设备，不展示设备里的内容
- 设备文件是接口，不是文件系统

### 2. 为什么不能直接访问 /dev
```bash
cd /dev/sda1  # 根本进不去！
```
- /dev/sda1 是字符设备文件
- 用 ls -l 看就是个普通设备文件
- 不是真正的文件系统入口

### 3. 挂载的作用
```bash
mkdir /new_disk
mount /dev/sdc /new_disk
# /new_disk 下就能看到完整的文件系统结构
```
- 将设备内容摆到能直接取用的文件柜里
- 在文件目录树中隔开一个"专区"
- 可以直接访问、创建、删除文件

### 4. 类比理解
- /dev = 仓库设备登记册
- mount = 把仓库里的货物摆到文件柜里
- 登记册只记录有什么设备，文件柜展示设备里的内容

### 5. 设计哲学
- Linux 一切皆文件
- 但"文件"分两种：
  - 接口文件（/dev 下的设备文件）
  - 内容文件（挂载后的文件系统文件）

## Evidence

- mount 后才能创建、删除文件
- /dev 下只能看到设备存在，不能看到内容
- 挂载点目录是文件柜的"专区"

## Open Questions

- 设备文件（mknod）与文件系统的关系
- bind mount 和 mount namespace 的高级用法

## Related Pages

- [[mount]]
- [[dev]]
- [[filesystem]]
- [[device-file]]
