---
original_url: https://streaminglearningcenter.com/codecs/inside-av2-architecture-performance-and-adoption-outlook.html
source: Streaming Learning Center
author: Jan Ozer
fetched: 2026-05-05
domain: tech/video-codec
tags: [av2, aomedia, video-codec, performance, architecture]
---

# Inside AV2: Architecture, Performance, and Adoption Outlook

Oct 13, 2025

## AV2 Architecture (Andrew Norkin, Netflix)

AV2 began development in 2020. The fundamental architecture remains consistent with the hybrid block-based approach used for decades, but with an expanded toolset and significantly higher compression efficiency.

### Performance Results (AVM v11.0.0)

Comparing AV2 against modified AV1 anchor across multiple configurations:

- **Random Access (most representative for streaming):**
  - 28.6% bitrate reduction for equivalent PSNR-YUV
  - 32.6% bitrate reduction based on VMAF

The low-level toolset is essentially finalized. Work shifts to high-level syntax and specification writing.

### AV2 Framework and Tools

Standard components: block partitioning, intra/inter prediction, transforms, quantization, coefficient and entropy coding, in-loop filtering.

Additional targeted use cases:
- Screen content tools (palette modes, inter-block copy)
- Stereo video
- Multi-layer or atlas-based video compositions

Hardware decoding concerns were a consistent focus, with AMD and Realtek participating specifically to assess hardware readiness.

## AV2 Common Test Conditions (Ryan Lei, Meta)

AOM Testing Subgroup defines Common Test Conditions (version 7.0, document CWG-E083).

**Encoding configurations:**
- All Intra (AI)
- Random Access (RA) — closed GOP, five hierarchical layers
- Low Delay (LD) — one keyframe, no future references
- Adaptive Streaming (AS) — 4K downscaled to six lower resolutions
- Still Image

**Extended Color Format (ECF) Testing:**
Tests evaluate performance on high-fidelity content beyond typical 4:2:0, including 4:4:4, 4:2:2, HDR (10-bit, BT.2100 PQ), screen content, and 120 fps material.

**Subjective Quality Testing:**
Early internal testing at Google on UHD content using 11-point DCR method showed AV2 achieved an average **38% bitrate reduction** over AV1 for similar perceived quality. Individual clips showed savings as high as 50%.

## Film Grain Synthesis (Li-Heng Chen, Netflix)

AV2 retains Film Grain Synthesis (FGS) as a **mandatory tool** (was optional in AV1), with improvements in grain randomness and smaller block support.
