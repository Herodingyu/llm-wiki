---
doc_id: src-ai系统-31编译器基础
title: AI系统 31编译器基础
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/AI系统/AI系统-31编译器基础.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810) 3 人赞同了该文章 ![](https://pica.zhimg.com/v2-fa91b252743d69265feae17bbd69a7ce_1440w.jpg)

## Key Points

### 1. 1 编译器基础
![](https://pic4.zhimg.com/v2-afe19175bd0a4f2a3377eefc6b1b4e91_1440w.jpg) 编译器可以将整个程序转换为目标代码(object code)，这些目标代码通常存储在文件中。目标代码也被称为二进制代码，在进行链接后可以被机器直接执行。典型的编译型程序语言有 C 和 C++。

### 2. 2 Gcc编译器介绍
![](https://pic2.zhimg.com/v2-7322101b6ff7dd40ded3785fa2444287_1440w.jpg) GCC（GNU Compiler Collection，GNU 编译器集合）最初是作为 GNU 操作系统的编译器编写的，旨在为 GNU/Linux 系统开发一个高效的 C 编译器。其历史可以追溯到 1987 年，当时由理查德·斯托曼（Richard S

### 3. 2.1 预处理
例如把一个hell.c程序文件使用gcc进行编译 ``` int main(void){ printf(HELLOWORD); return 0; } ``` `进行单独预处理命令：` ``` gcc -E hello.c -o hello.i

### 4. 2.2 编译
``` gcc -S hello.i -o hello.s ``` 将经过预处理的文件（ `hello.i` ）转换为特定汇编代码文件（ `hello.s` ）的过程。只是转换为了低级语言-汇编语言。在这个过程中，经过预处理后的 `.i` 文件作为输入，通过编译器（ccl）生成相应的汇编代码 `.s` 文件。编译器（ccl）是 GCC 的前端，其主要功能是将经过预处理的代码转换为汇编代码。编译阶段

### 5. 2.3 汇编
将汇编代码转换成机器指令。这一步是通过汇编器(as)完成的。汇编器是 GCC 的后端，其主要功能是将汇编代码转换成机器指令。 汇编器的工作是将人类可读的汇编代码转换为机器指令或二进制码，生成一个可重定位的目标程序，通常以 `.o` 作为文件扩展名。

## Evidence

- Source: [原始文章](raw/tech/soc-pm/AI系统/AI系统-31编译器基础.md) [[../../raw/tech/soc-pm/AI系统/AI系统-31编译器基础.md|原始文章]]

## Key Quotes

> "解释器在程序运行时将代码转换成机器码，编译器在程序运行之前将代码转换成机器码"

> "集成开发环境（IDE，Integrated Development Environment）"

> "分析 Pass（Analysis Pass）"

> "转换 Pass（Transformation Pass）"

> "指令选择器（Instruction Selector）"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/AI系统/AI系统-31编译器基础.md) [[../../raw/tech/soc-pm/AI系统/AI系统-31编译器基础.md|原始文章]]
