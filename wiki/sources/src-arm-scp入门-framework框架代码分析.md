---
doc_id: src-arm-scp入门-framework框架代码分析
title: ARM SCP入门-framework框架代码分析
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/ARM SCP入门-framework框架代码分析.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, scp, arm, framework, firmware]
---

## Summary

本文深入分析了ARM SCP（System Control Processor）固件的framework框架代码，阐述了SCP固件的模块化架构设计思想。文章从SCP的软件协议栈出发，详细解析了模块（module）的设计理念（高内聚低耦合、API隔离）、framework的初始化流程（系统初始化、模块初始化、中断服务、event服务）、以及编译构建系统（Firmware.cmake配置、gen_module_code.py代码生成）。核心在于理解SCP framework如何通过模块化设计实现安全隔离，以及模块间如何通过标准API进行交互，从而支撑整个SCP系统的运行。

## Key Points

### 1. 模块化设计理念
- **安全核心**：隔离是安全的基础，按功能形成module或domain
- **低耦合**：模块间耦合性尽量低，禁止无权限的访问
- **API隔离**：模块间交互通过预定义的API函数实现，系统初始化时设定死
- **模块数量**：公共模块77个 + 产品定制模块，总计近100个

### 2. 模块配置与构建
- **Firmware.cmake**：定义固件包含的模块列表（SCP_MODULES）
- **代码生成**：gen_module_code.py脚本生成模块信息和配置代码
- **生成产物**：
  - `fwk_module_idx.h`：模块索引枚举，顺序遵循BS_FIRMWARE_MODULES列表
  - `fwk_module_list.c`：模块列表和配置信息

### 3. 软件协议栈
```
驱动 → HAL层 → 服务 → 协议 → HAL层 → 驱动
```
- **消息流向**：外界消息通过驱动→HAL层进入，处理后经服务→协议→HAL→驱动操作硬件
- **分层设计**：驱动层、HAL层、协议层、服务层各司其职

### 4. Framework初始化流程
- **系统初始化**：底层硬件初始化、时钟、中断控制器等
- **模块初始化**：按fwk_module_idx.h顺序逐个初始化模块
- **中断服务**：注册中断处理函数
- **Event服务**：提供模块间异步通信机制
- **运行启动**：进入主循环，处理事件和中断

### 5. 固件类型
- **scp_romfw**：ROM固件，启动时运行，负责初始化和加载ramfw
- **scp_ramfw**：RAM固件，主要功能固件，运行在内存中
- **区别**：仅包含模块不同，framework流程相同

### 6. 构建系统
- **顶层Makefile**：Makefile.cmake
- **产品配置**：product/<product>/product.mk
- **模块位置**：modules/（公共）或 product/<product>/modules/（定制）

## Key Quotes

> "安全的核心就是隔离，隔离就是按功能形成module或者domain，模块之间禁止无权限的访问。"

> "module间隔离就像狗咬架，一旦伸手产生交互就祸福不能预测了，所以加上栏杆，规定好那些module间可以交互伸手。"

> "framework框架负责固件的通用流程实现，包括系统初始化，module初始化，中断服务提供，event服务提供等。"

## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/ARM SCP入门-framework框架代码分析.md) [[../../raw/tech/bsp/芯片底软及固件/ARM SCP入门-framework框架代码分析.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/ARM SCP入门-framework框架代码分析.md) [[../../raw/tech/bsp/芯片底软及固件/ARM SCP入门-framework框架代码分析.md|原始文章]]
