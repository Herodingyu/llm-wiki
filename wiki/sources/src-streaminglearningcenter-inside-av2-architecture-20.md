---
doc_id: src-streaminglearningcenter-inside-av2-architecture-20
title: Inside AV2: Architecture, Performance, and Adoption Outlook
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/industry/tv/streaminglearningcenter-inside-av2-architecture-20251013.md
domain: industry/tv
created: 2026-05-05
updated: 2026-05-05
tags: [tv]
---

## Summary

Oct 13, 2025 AV2 began development in 2020. The fundamental architecture remains consistent with the hybrid block-based approach used for decades, but with an expanded toolset and significantly higher compression efficiency. Comparing AV2 against modified AV1 anchor across multiple configurations:

## Key Points

### 1. AV2 Architecture (Andrew Norkin, Netflix)
AV2 began development in 2020. The fundamental architecture remains consistent with the hybrid block-based approach used for decades, but with an expanded toolset and significantly higher compression

### 2. Performance Results (AVM v11.0.0)
Comparing AV2 against modified AV1 anchor across multiple configurations: - **Random Access (most representative for streaming):**

### 3. AV2 Framework and Tools
Standard components: block partitioning, intra/inter prediction, transforms, quantization, coefficient and entropy coding, in-loop filtering.

### 4. AV2 Common Test Conditions (Ryan Lei, Meta)
AOM Testing Subgroup defines Common Test Conditions (version 7.0, document CWG-E083). **Encoding configurations:**

### 5. Film Grain Synthesis (Li-Heng Chen, Netflix)
AV2 retains Film Grain Synthesis (FGS) as a **mandatory tool** (was optional in AV1), with improvements in grain randomness and smaller block support.

## Evidence

- Source: [原始文章](raw/industry/tv/streaminglearningcenter-inside-av2-architecture-20251013.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/industry/tv/streaminglearningcenter-inside-av2-architecture-20251013.md)
