# 研究方法论说明

## 路由分类（Route Classification）

根据 deep-research-swarm 技能的 Route Classification 规则：

- **用户没有上传文件** → 排除 Route C（File-First）和 Route D（Upload-Heavy）
- **用户问题有明确维度**（11个领域已明确列出）→ **选择 Route B：Focused Search**

## 执行流程

### Phase 0: Epistemic Reset（认知重置）
- 确认当前日期：2026年5月5日
- 确认时间约束：2026年Q1（1-3月）
- 语言约束：中文（与用户消息语言一致）

### Phase 1: Landscape Scan（景观扫描）
- 5次粗到细的探索性搜索
- Level 1：宏观概述（搜索1-2）
- Level 2：结构性映射（搜索2-4）
- Level 3：新兴议题与张力（搜索5）

### Phase 2: Dimension Decomposition（维度分解）
- 基于用户明确的11个领域，合并为10个并行研究代理
- 代理1：SOC芯片
- 代理2：关键元器件
- 代理3：存储
- 代理4：显示
- 代理5：背光
- 代理6：多媒体+声音（合并）
- 代理7：通讯
- 代理8：AI应用
- 代理9：OS
- 代理10：CSP

### Phase 3: Parallel Deep Dive（并行深度研究）
- 创建通用深度研究代理
- 并行部署10个研究任务
- 每个代理执行250+次搜索的子集
- 输出文件保存到 /mnt/agents/output/research/

### Phase 4: Cross-Verification（交叉验证）
- 使用Python脚本提取各维度报告的关键数据点
- 识别 High/Medium/Low 置信度发现
- 标记 Conflict Zone（冲突区域）
- 共发现6个冲突/需注意区域

### Phase 5: Conflict Resolution（冲突解决）
- 大多数冲突源于统计口径差异（AVC vs RUNTO vs Omdia）
- 两个真实行业分歧：
  1. OLED vs Mini LED 长期定位之争
  2. AI电视实用价值争议

### Phase 6: Insight Extraction（洞察提取）
- 从跨维度分析中提取非显而易见的洞察
- 单一维度无法发现，只有通过比较多个维度才能看到的模式
- 共识别8个跨维度洞察

### Phase 7: Handoff to Writing（移交写作）
- 使用 report-writing 技能
- 设计13章大纲
- 并行12个写作代理
- 组装最终报告并转换为DOCX

## 引用系统

- 325个唯一引用来源
- 827处引用标记
- 脚注样式（研究报告默认）
- citation.jsonl 引用数据库

## 数据来源

- AVC（奥维睿沃）
- RUNTO（洛图科技）
- TrendForce
- 群智咨询（Sigmaintell）
- 工信部
- 各厂商CES/AWE发布会
- 财报数据
