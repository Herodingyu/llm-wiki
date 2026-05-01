# LLM Wiki — 丁工的知识库

基于 [Karpathy LLM Wiki](https://gist.github.com/karpathy/) 模式，由 AI 自动维护的个人知识库。

- **运行时**: `@harrylabs/llm-wiki-karpathy` (OpenClaw + Codex MCP)
- **同步**: GitHub 私有仓库 + 服务器定时推送
- **浏览**: Obsidian 直接打开为 vault

---

## 目录结构

### `raw/` — 原始材料（你放）

| 路径 | 内容 |
|------|------|
| `raw/tech/dram/` | DRAM / Controller / DDR PHY / Calibration 算法 |
| `raw/tech/peripheral/` | I2C / SPI / UART / PWM / Timer / DMA |
| `raw/tech/tv-backlight/` | Local dimming / BCONless LED driver / 单线通讯 |
| `raw/tech/soc-pm/` | SOC 开发项目管理 |
| `raw/industry/tv/` | 产品 / SOC / 面板 / Driver IC / 前沿技术 / OS 生态 |
| `raw/industry/smart-glasses/` | 产品 / SOC / 关键器件(panel/camera/sensor) / 前沿技术 / OS 生态 |
| `raw/industry/car-infotainment/` | SOC / 关键器件 / 前沿技术 |

### `wiki/` — AI 自动维护（你读，别改）

| 目录 | 内容 |
|------|------|
| `wiki/sources/` | 编译后的来源笔记 |
| `wiki/concepts/` | 概念页 |
| `wiki/entities/` | 实体页 |
| `wiki/syntheses/` | 综合/对比页 |
| `wiki/outputs/` | 查询输出 |
| `wiki/_indexes/` | 自动索引 |
| `wiki/index.md` | 总目录 |
| `wiki/log.md` | 操作日志 |

---

## 快速使用

### 添加材料

```
把 raw/tech/dram/ddr5-spec.pdf 加入知识库
```

### 查询

```
wiki 里关于 DRAM calibration 是怎么说的？
搜索知识库：local dimming 算法
```

---

## 本地使用

```bash
git clone git@github.com:Herodingyu/llm-wiki.git
# 然后在 Obsidian 中「打开文件夹作为仓库」
```

---

## 规则

- **可以动**: `raw/` 目录 — 放原始材料
- **不要动**: `wiki/` 目录 — AI 自动维护，手动改会被覆盖
- **不用管**: `.llm-kb/` 目录 — 运行时状态
