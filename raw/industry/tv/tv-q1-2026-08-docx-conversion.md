# Stage 3: DOCX Conversion（DOCX转换过程）

## 路由选择

根据 docx 技能的 SKILL.md 路由规则：

- **Route 1**：generate_docx — 从零生成
- **Route 2**：md2docx — 从Markdown转换 ✓（适用）

选择 **Route 2: md2docx**

## 技能加载

1. 读取 `SKILL.md` — 了解路由规则和转换流程
2. 读取 `md2docx-reference.md` — 了解具体参数和用法

## 依赖检查

| 依赖 | 状态 |
|------|------|
| pandoc | ✅ 已安装 |
| python-docx | ✅ 已安装 |
| lxml | ✅ 已安装 |
| citation.jsonl | ✅ 存在（/mnt/agents/.store/citation.jsonl） |

## 转换命令

```bash
python3 /app/.agents/skills/docx/scripts/md2docx/md2docx_convert.py \
  /mnt/agents/output/TV_Q1_Report.agent.final.md \
  --style footnote \
  --citation /mnt/agents/.store/citation.jsonl \
  --output-dir /mnt/agents/output/
```

## 转换结果

| 指标 | 数据 |
|------|------|
| 输入文件 | TV_Q1_Report.agent.final.md |
| 输出文件 | TV_Q1_Report.agent.final.footnote.docx |
| 脚注引用数 | **325个** |
| 引用位置数 | **827处** |
| 文件大小 | 2.45MB |
| 样式 | footnote（研究报告默认） |

## 文件重命名

```bash
cp /mnt/agents/output/TV_Q1_Report.agent.final.footnote.docx \
   "/mnt/agents/output/2026年Q1电视行业动态研究报告.docx"
```

## 最终交付文件

| 文件 | 路径 | 大小 |
|------|------|------|
| Word报告 | /mnt/agents/output/2026年Q1电视行业动态研究报告.docx | 2.45MB |
| Markdown源文件 | /mnt/agents/output/TV_Q1_Report.agent.final.md | ~81KB |

---

## 全部产出文件清单

### 研究阶段
- TV_Q1_dim01_SOC.md — SOC芯片维度报告
- TV_Q1_dim02_components.md — 关键元器件维度报告
- TV_Q1_dim03_storage.md — 存储芯片维度报告
- TV_Q1_dim04_display.md — 显示面板维度报告
- TV_Q1_dim05_backlight.md — 背光技术维度报告
- TV_Q1_dim06_multimedia_audio.md — 多媒体+声音维度报告
- TV_Q1_dim07_communication.md — 通讯技术维度报告
- TV_Q1_dim08_AI.md — AI应用维度报告
- TV_Q1_dim09_OS.md — 操作系统维度报告
- TV_Q1_dim10_CSP.md — CSP内容服务维度报告
- TV_Q1_cross_verification.md — 交叉验证报告
- TV_Q1_insight.md — 洞察提取

### 报告阶段
- TV_Q1_Report.agent.outline.md — 报告大纲
- TV_Q1_Report.agent.exec_summary.md — 执行摘要
- TV_Q1_Report_sec01.md — 第一章
- TV_Q1_Report_sec02.md — 第二章
- ...（sec03-sec13）
- TV_Q1_Report.agent.final.md — 完整组装报告
- 2026年Q1电视行业动态研究报告.docx — Word文档
