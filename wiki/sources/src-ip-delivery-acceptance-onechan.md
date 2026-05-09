---
doc_id: src-ip-delivery-acceptance-onechan
title: IP 交付物与验收：从"交付清单"到"信任契约"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/ip-delivery-acceptance-onechan.md
domain: tech/soc-pm
created: 2026-05-09
updated: 2026-05-09
tags: [soc-pm]
---

## Summary

> 来源：微信公众号「OneChan」 > 原文链接：https://mp.weixin.qq.com/s/rjf3HKGtJFz_Qwnpwhk19g > 记录时间：2026-05-04

## Key Points

### 1. 核心观点
IP 交付不是"把代码扔过去就完事"，而是一份**信任契约**。交付物质量直接决定后续集成工作的效率，甚至项目的成败。

### 2. 交付物清单


### 3. 1. 硬件交付物
| 交付物 | 内容 | 用途 | |--------|------|------| | RTL 代码 | 可综合的 Verilog/VHDL | 集成到 SoC | | 综合脚本 | 约束文件、TCL 脚本 | 确保综合结果正确 |

### 4. 2. 软件交付物
| 交付物 | 内容 | 用途 | |--------|------|------| | 驱动代码 | 底层驱动、HAL | 软件开发 | | 固件代码 | BootROM、固件 | 系统启动 | | 测试代码 | 自测试代码 | 验证 |

### 5. 3. 文档交付物
| 交付物 | 内容 | 用途 | |--------|------|------| | 设计文档 | 架构、接口、时序 | 理解设计 | | 验证文档 | 验证计划、报告 | 确认质量 | | 集成指南 | 集成步骤、注意事项 | 指导集成 |

## Evidence

- Source: [原始文章](raw/tech/soc-pm/ip-delivery-acceptance-onechan.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/ip-delivery-acceptance-onechan.md)
