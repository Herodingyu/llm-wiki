# LLM Wiki 架构规范

## 项目概述

**丁工的知识库** — 基于 Karpathy LLM Wiki 模式的个人知识库，专注于硬件工程领域（DRAM、SoC、外设、显示技术、消费电子行业）。

---

## 三层架构

### 1. Raw Layer (`raw/`) — 原始材料

**所有权**: 人类  
**可变性**: 只读（对 AI 而言）

- 原始文章、PDF、笔记
- 按 `tech/` 和 `industry/` 分类
- 人类自由添加、修改、删除
- AI **绝不** 写入此目录

### 2. Wiki Layer (`wiki/`) — 知识库

**所有权**: AI  
**可变性**: AI 全权管理

- 结构化知识：来源笔记、概念页、实体页、综合分析
- 人类 **只读**（避免与 AI 冲突）
- 通过 Git 版本控制追踪变更

### 3. Schema Layer (`schema/`) — 规范定义

**所有权**: 人机共创  
**可变性**: 随实践演化

- 本文件 (`AGENTS.md`) 定义知识库结构和约定
- `CLAUDE.md` 提供 OpenCode 特定指令

---

## 页面类型

| 类型 | 目录 | 说明 | 示例 |
|------|------|------|------|
| `source` | `wiki/sources/` | 原始材料摘要 | `src-ddr-training-csdn.md` |
| `concept` | `wiki/concepts/` | 领域概念 | `ddr-training.md` |
| `entity` | `wiki/entities/` | 实体（公司/产品/标准） | `micron.md` |
| `synthesis` | `wiki/syntheses/` | 跨域综合分析 | `dram-evolution.md` |
| `output` | `wiki/outputs/` | 查询输出存档 | `query-ddr-vs-lpddr.md` |
| `overview` | `wiki/overview.md` | 全局概览 | — |
| `glossary` | `wiki/glossary.md` | 术语表 | — |
| `index` | `wiki/index.md` | 总目录 | — |
| `log` | `wiki/log.md` | 操作日志 | — |

---

## 文件命名规范

- **kebab-case**: 全小写，连字符分隔
- **匹配页面标题**: `"DDR Training"` → `ddr-training.md`
- **无空格**: 文件名不含空格
- **`.md` 扩展名**: 所有 wiki 页面

正则验证: `/^[a-z0-9][a-z0-9-]*\.md$/`

---

## YAML Frontmatter 规范

所有 wiki 页面必须包含 YAML frontmatter：

### Source 类型

```yaml
---
doc_id: src-<kebab-name>
title: <中文标题>
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/<domain>/<filename>.md
domain: <tech|industry>/<subdomain>
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [tag1, tag2]
---
```

### Concept 类型

```yaml
---
doc_id: <kebab-name>
title: <中文概念名>
page_type: concept
related_sources: [src-xxx, src-yyy]
related_entities: [entity-xxx]
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [concept, <domain>]
---
```

### Entity 类型

```yaml
---
doc_id: <kebab-name>
title: <实体名>
page_type: entity
entity_type: <company|product|standard|technology|organization>
related_sources: [src-xxx]
related_concepts: [concept-xxx]
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [entity, <type>, <domain>]
---
```

### Synthesis 类型

```yaml
---
doc_id: <kebab-name>
title: <中文标题>
page_type: synthesis
scope: <cross-domain|domain-specific>
sources: [src-xxx, src-yyy]
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [synthesis, <topic>]
---
```

---

## 交叉链接规范

- **Wikilink 语法**: `[[page-name]]`（Obsidian 兼容）
- **双向链接**: 相关页面应互相引用
- **无孤立页面**: 每个页面至少有一个入站链接
- **更新时扩散**: 修改一页时，检查并更新相关页面

---

## 核心操作流程

### Ingest（摄入）

1. 人类将新材料放入 `raw/`
2. AI 读取材料，提取关键信息
3. 在 `wiki/sources/` 创建来源笔记
4. 识别受影响的现有页面并更新
5. 按需创建新概念页、实体页
6. 更新 `wiki/glossary.md` 收录新术语
7. 更新 `wiki/index.md` 添加新页面
8. 如全局视角变化，更新 `wiki/overview.md`
9. 在 `wiki/log.md` 追加操作记录

### Query（查询）

1. 人类提出问题
2. AI 读取 `wiki/index.md` 定位相关页面
3. 读取相关页面，综合答案并附引用
4. **关键**: 询问"是否将此答案存档为 wiki 页面？"
5. 优质答案保存到 `wiki/outputs/` 或 `wiki/syntheses/`

### Lint（整理）

1. AI 读取所有 wiki 页面
2. 检查并报告：
   - 孤立页面（无入站链接）
   - 过时索引（index.md 引用不存在页面）
   - 空页面（内容 < 50 字）
   - 断裂链接（`[[xxx]]` 指向不存在文件）
   - 缺失交叉引用
   - 矛盾声明
   - 高频术语缺失概念页
3. 提出修复建议
4. 在 `wiki/log.md` 追加整理记录

---

## 语言与领域

- **主要语言**: 中文（zh-CN）
- **专业术语**: 保留英文原文，首次出现时附中文解释
- **领域**: 硬件工程（DRAM、SoC、外设、显示技术、消费电子）

---

## 关键文件说明

| 文件 | 用途 | 更新时机 |
|------|------|----------|
| `wiki/index.md` | 内容目录——AI 查询时首先读取 | 每次摄入 |
| `wiki/overview.md` | 全局综合——追踪主题、开放问题 | 全局视角变化 |
| `wiki/glossary.md` | 术语表——规范术语、弃用术语 | 发现新术语 |
| `wiki/log.md` | 只追加的操作记录 | 每次操作 |

---

## 提交规范

| 前缀 | 用途 |
|------|------|
| `schema:` | 规范/文档变更 |
| `chore:` | 结构/配置变更 |
| `wiki:` | 核心 wiki 页面更新 |
| `ingest:` | 来源处理（按领域） |
| `concepts:` | 概念页创建 |
| `entities:` | 实体页创建 |
| `xref:` | 交叉引用更新 |
| `synthesis:` | 综合分析创建 |
| `indexes:` | 索引生成 |
| `manifest:` | 清单更新 |
| `lint:` | 验证修复 |

---

## 工具链

- **查看器**: Obsidian（打开文件夹为 vault）
- **版本控制**: Git（GitHub 私有仓库）
- **同步**: `scripts/sync.sh`（服务器定时任务）
- **运行时**: `@harrylabs/llm-wiki-karpathy`（OpenClaw + Codex MCP）

---

*规范版本: 1.0*  
*更新日期: 2026-05-02*
