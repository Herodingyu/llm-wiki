---
doc_id: src-systemverilog-design-ddr4-initialization-and-calib
title: DDR4 SDRAM - Initialization, Training and Calibration - systemverilog.io
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/systemverilog-design-ddr4-initialization-and-calibrati.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

> 来源: www.systemverilog.io > 原URL: https://www.systemverilog.io/design/ddr4-initialization-and-calibration/ > 收集时间: 2026-05-01

## Key Points

### 1. DDR4 SDRAM - Initialization, Training and Calibration&para;


### 2. Introduction&para;
When a device with a DRAM sub-system is powered up, a number of things happen before the DRAM gets to an operational state. The following state-machine from the JEDEC specification shows the various s

### 3. Initialization&para;
Figure 2: Initialization States (Source: Micron Datasheet) Power-up and initialization is a fixed well-defined sequence of steps. Typically, when the system is powered up and the controller in the ASI

### 4. ZQ Calibration&para;
Figure 4: ZQCL (Source: Micron Datasheet) ZQ Calibration is related to the data pins DQ. To understand what ZQ calibration does and why it is required, we need to first look at the circuit behind each

### 5. Subscribe
Get Notified when a new article is published!

## Evidence

- Source: [原始文章](raw/tech/dram/systemverilog-design-ddr4-initialization-and-calibrati.md) [[../../raw/tech/dram/systemverilog-design-ddr4-initialization-and-calibrati.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/systemverilog-design-ddr4-initialization-and-calibrati.md) [[../../raw/tech/dram/systemverilog-design-ddr4-initialization-and-calibrati.md|原始文章]]
