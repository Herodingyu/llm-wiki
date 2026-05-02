# OpenCode 特定指令

本文件为 OpenCode 环境下的 AI Agent 提供操作指南。

## 首要参考

**`schema/AGENTS.md`** 是主要规范文件。本文件仅补充 OpenCode 特定细节。

## 工具使用模式

### 文件操作

- **读取**: 使用 `Read` 工具读取文件内容
- **写入**: 使用 `Write` 工具创建新文件
- **编辑**: 使用 `Edit` 工具修改现有文件
- **路径格式**: Windows 格式 `D:\llm-wiki\...`

### 目录浏览

- **列出**: 使用 `Read` 工具读取目录路径
- **搜索**: 使用 `Grep` 工具搜索文件内容
- **匹配**: 使用 `Glob` 工具匹配文件模式

## 工作流程

### 摄入新来源

```
1. Read raw/<domain>/<filename>.md
2. 提取关键信息（标题、来源、核心观点）
3. Write wiki/sources/src-<name>.md（含 YAML frontmatter）
4. Edit wiki/index.md 添加新来源
5. Edit wiki/log.md 追加记录
```

### 创建概念页

```
1. 分析相关来源笔记
2. Write wiki/concepts/<concept>.md（含 frontmatter + 定义 + 关联）
3. 更新相关来源笔记的 related_concepts
4. Edit wiki/index.md 添加概念
5. Edit wiki/glossary.md 添加术语
```

### 整理检查

```
1. Glob wiki/**/*.md 获取所有页面
2. 检查每个页面的 frontmatter 完整性
3. 提取所有 [[wikilink]] 验证目标存在
4. 统计入站链接数，识别孤立页面
5. 生成报告并修复问题
```

## 路径约定

| 路径 | 说明 |
|------|------|
| `D:\llm-wiki\raw\` | 原始材料 |
| `D:\llm-wiki\wiki\` | 知识库 |
| `D:\llm-wiki\schema\` | 规范文件 |
| `D:\llm-wiki\.llm-kb\` | 运行时状态（勿动） |
| `D:\llm-wiki\scripts\` | 工具脚本 |

## 批量处理提示

处理大量文件时，使用并行策略：

1. 使用多个 `Read` 并行读取源文件
2. 使用多个 `Write` 并行写入 wiki 页面
3. 每批处理 10 篇文章后更新索引

## 注意事项

- **不要修改** `raw/` 目录中的文件
- **不要手动编辑** `wiki/` 中的文件（除非你是 AI agent）
- **保持** YAML frontmatter 格式一致
- **使用** wikilink 语法 `[[page-name]]` 进行交叉引用
- **提交**时使用规范前缀（见 AGENTS.md）

---

*本文件配合 schema/AGENTS.md 使用*
