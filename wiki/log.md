---
doc_id: log
title: 操作日志
page_type: log
created: 2026-05-01
updated: 2026-05-03
---

# 操作日志

## [2026-05-03] ingest | 大规模资料更新

- **新增资料**: raw/ 下新增 469 篇文章（含多个子目录）
  - `raw/tech/bsp/` — 新增 TrustZone、电源管理、芯片底软及固件、SOC启动系列（~150篇）
  - `raw/tech/soc-pm/` — 新增 AI系统、Chiplet、EFUSE、总线架构等（~30篇）
  - `raw/tech/dram/` — 新增 DDR preamble/postamble、Cache优化、DWC仲裁等（~3篇）
  - `raw/tech/peripheral/` — 新增（~0篇，原有已完整）
  - `raw/industry/*/` — 新增行业资料（~50篇）
- **生成 Source Notes**: 388 篇新来源笔记
  - BSP: 196 篇
  - SoC PM: 124 篇
  - DRAM: 76 篇
  - Peripheral: 72 篇
  - Industry: 69 篇
- **更新统计**:
  - Source Notes: 180 → 568 (+388)
  - 概念页: 54 → 101 (+47)
  - 实体页: 21（待更新）
  - 总计: 268 → 703 (+435)
- **注意**: llm-wiki-karpathy v0.4.4 与现有 frontmatter 格式不兼容，手动更新索引

## [2026-05-01] init | 知识库初始化

- **创建知识库结构**：raw/ 按 tech + industry 分层
- **抓取文章**：
  - `raw/tech/dram/ddr-training-csdn.md` — CSDN DDR Training
  - `raw/tech/dram/ddr-basics-summary.md` — 博客园 DDR 基础
- **生成 Source Notes**：
  - `wiki/sources/src-ddr-training-csdn.md`
  - `wiki/sources/src-ddr-basics-summary.md`
- **创建索引**：各目录 `_article-index.md`

## [2026-05-02] init | Wiki 结构标准化

- **创建 Schema 层**：
  - `schema/AGENTS.md` — 知识库架构规范
  - `schema/CLAUDE.md` — OpenCode 特定指令
- **完善 Wiki 目录**：
  - `wiki/concepts/` — 概念页
  - `wiki/entities/` — 实体页
  - `wiki/syntheses/` — 综合分析
  - `wiki/outputs/` — 查询输出
  - `wiki/_indexes/` — 自动索引
- **更新核心页面**：
  - `wiki/index.md` — 总目录（更新为完整索引）
  - `wiki/overview.md` — 全局概览
  - `wiki/glossary.md` — 术语表
  - `wiki/log.md` — 标准化格式（添加 YAML frontmatter）
- **批量摄入**：处理 7 个领域 137 篇文章到 `wiki/sources/`
- **提取概念页**：38 个概念（DDR、I3C、OLED、AR 等）
- **提取实体页**：21 个实体（Samsung、Qualcomm、Apple 等）
- **创建综合分析**：5 篇跨域分析（DRAM 演进、显示技术对比等）
- **创建索引**：4 个自动索引（sources、concepts、entities、syntheses）
- **更新 manifest.json**：记录所有来源

## [2026-05-02] ingest | BSP 领域文章摄入

- **来源**: `raw/tech/bsp/` — 43 篇技术文章
- **创建 Source Notes**:
  - Boot/SoC/U-Boot: 12 篇（U-Boot、ARMv8、ATF、UEFI、启动流程）
  - Linux Drivers: 6 篇（设备驱动、UIO、字符设备、图形驱动）
  - Memory/IO/Cache: 7 篇（内存映射、Page Fault、零拷贝、IOMMU、IO 子系统）
  - Interrupts/Power/Concurrency: 7 篇（中断处理、软中断、Semaphore、电源管理、休眠）
  - Filesystem/Security/Hardware: 10 篇（文件系统、挂载、Flash、ACPI、eFuse、磨损均衡）
  - RTOS/Misc: 1 篇（树莓派 OS 开发）
- **更新索引**: `wiki/index.md` 添加 BSP 来源列表
- **更新 manifest.json**: 添加 `tech/bsp` domain，source 统计更新为 180

## [2026-05-02] concepts | BSP 概念提取

- **提取概念页**: 16 个 BSP 核心概念
  - Boot: u-boot、bootloader
  - Hardware: device-tree、acpi、atf、secure-boot
  - Driver: linux-device-driver、dma、iommu
  - Memory: memory-mapping、page-fault
  - Kernel: interrupt、semaphore
  - Power: power-management
  - Storage: filesystem、efuse、wear-leveling
- **更新 index.md**: 添加 BSP 概念索引
- **更新 manifest.json**: 概念页统计更新为 54

## [2026-05-02] complete | Wiki 整理完成

- **最终统计**:
  - Source Notes: 180
  - 概念页: 54 (+16)
  - 实体页: 21
  - 综合分析: 5
  - 索引: 4
  - **总计: 268 个 wiki 文件**
- **完成状态**: Wave 1-7 全部完成
- **验证**: 所有页面包含 YAML frontmatter，交叉引用已建立

---

*日志格式: `## [YYYY-MM-DD] operation_type | 描述`*
