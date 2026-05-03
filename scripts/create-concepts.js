const fs = require('fs');
const path = require('path');

const conceptsDir = 'D:\\\\llm-wiki\\\\llm-wiki\\\\wiki\\\\concepts';
const sourcesDir = 'D:\\\\llm-wiki\\\\llm-wiki\\\\wiki\\\\sources';

const today = '2026-05-03';

// Map concepts to related source notes
const conceptMap = {
  'trustzone': { title: 'TrustZone', tags: ['concept', 'bsp', 'security'], sources: [] },
  'optee': { title: 'OP-TEE', tags: ['concept', 'bsp', 'security', 'tee'], sources: [] },
  'tee': { title: 'TEE（可信执行环境）', tags: ['concept', 'bsp', 'security'], sources: [] },
  'uefi': { title: 'UEFI', tags: ['concept', 'bsp', 'firmware'], sources: [] },
  'gic': { title: 'GIC（通用中断控制器）', tags: ['concept', 'bsp', 'interrupt'], sources: [] },
  'gicv3': { title: 'GICv3', tags: ['concept', 'bsp', 'interrupt'], sources: [] },
  'smmu': { title: 'SMMU（系统内存管理单元）', tags: ['concept', 'bsp', 'memory', 'iommu'], sources: [] },
  'scmi': { title: 'SCMI（系统控制和管理接口）', tags: ['concept', 'bsp', 'power'], sources: [] },
  'scp': { title: 'SCP（系统控制处理器）', tags: ['concept', 'bsp', 'power'], sources: [] },
  'npu': { title: 'NPU（神经网络处理单元）', tags: ['concept', 'soc-pm', 'ai'], sources: [] },
  'tpu': { title: 'TPU（张量处理单元）', tags: ['concept', 'soc-pm', 'ai'], sources: [] },
  'dojo': { title: 'Dojo（特斯拉 AI 训练芯片）', tags: ['concept', 'soc-pm', 'ai'], sources: [] },
  'dvfs': { title: 'DVFS（动态电压频率调节）', tags: ['concept', 'soc-pm', 'power'], sources: [] },
  'avs': { title: 'AVS（自适应电压调节）', tags: ['concept', 'soc-pm', 'power'], sources: [] },
  'power-gating': { title: 'Power Gating', tags: ['concept', 'soc-pm', 'power'], sources: [] },
  'power-domain': { title: 'Power Domain', tags: ['concept', 'soc-pm', 'power'], sources: [] },
  'runtime-pm': { title: 'Runtime PM', tags: ['concept', 'soc-pm', 'power'], sources: [] },
  'pm-qos': { title: 'PM QoS', tags: ['concept', 'soc-pm', 'power'], sources: [] },
  'pmu': { title: 'PMU（电源管理单元）', tags: ['concept', 'soc-pm', 'power'], sources: [] },
  'thermal': { title: 'Thermal（热管理）', tags: ['concept', 'soc-pm', 'power'], sources: [] },
  'watchdog': { title: 'Watchdog（看门狗）', tags: ['concept', 'soc-pm', 'reliability'], sources: [] },
  'cpufreq': { title: 'CPU Freq', tags: ['concept', 'soc-pm', 'power'], sources: [] },
  'devfreq': { title: 'Dev Freq', tags: ['concept', 'soc-pm', 'power'], sources: [] },
  'noc': { title: 'NoC（片上网络）', tags: ['concept', 'soc-pm', 'interconnect'], sources: [] },
  'cxl': { title: 'CXL（Compute Express Link）', tags: ['concept', 'dram', 'interconnect'], sources: [] },
  'hbm': { title: 'HBM（高带宽内存）', tags: ['concept', 'dram', 'memory'], sources: [] },
  'lpddr5x': { title: 'LPDDR5X', tags: ['concept', 'dram', 'memory'], sources: [] },
  'mmu': { title: 'MMU（内存管理单元）', tags: ['concept', 'bsp', 'memory'], sources: [] },
  'tlb': { title: 'TLB（转译后备缓冲器）', tags: ['concept', 'bsp', 'memory'], sources: [] },
  'mailbox': { title: 'Mailbox（邮箱机制）', tags: ['concept', 'bsp', 'ipc'], sources: [] },
  'mutex': { title: 'Mutex（互斥锁）', tags: ['concept', 'bsp', 'concurrency'], sources: [] },
  'uio': { title: 'UIO（用户空间 I/O）', tags: ['concept', 'bsp', 'driver'], sources: [] },
  'qspi': { title: 'QSPI（四线 SPI）', tags: ['concept', 'peripheral', 'spi'], sources: [] },
  'pinctrl': { title: 'Pinctrl（引脚控制）', tags: ['concept', 'peripheral', 'gpio'], sources: [] },
  'crypto': { title: 'Crypto（密码学）', tags: ['concept', 'bsp', 'security'], sources: [] },
  'authentication': { title: 'Authentication（认证）', tags: ['concept', 'bsp', 'security'], sources: [] },
  'public-key': { title: 'Public Key（公钥）', tags: ['concept', 'bsp', 'security'], sources: [] },
  'secure-storage': { title: 'Secure Storage', tags: ['concept', 'bsp', 'security'], sources: [] },
  'secure-debug': { title: 'Secure Debug', tags: ['concept', 'bsp', 'security'], sources: [] },
  'secure-upgrade': { title: 'Secure Upgrade', tags: ['concept', 'bsp', 'security'], sources: [] },
  'arm': { title: 'ARM 架构', tags: ['concept', 'soc-pm', 'architecture'], sources: [] },
  'cortex': { title: 'Cortex 处理器', tags: ['concept', 'soc-pm', 'architecture'], sources: [] },
  'rob': { title: 'ROB（重排序缓冲区）', tags: ['concept', 'soc-pm', 'architecture'], sources: [] },
  'hsm': { title: 'HSM（硬件安全模块）', tags: ['concept', 'soc-pm', 'security'], sources: [] },
  'fan-out': { title: 'Fan-out Packaging', tags: ['concept', 'soc-pm', 'packaging'], sources: [] },
  'fowlp': { title: 'FOWLP（扇出型晶圆级封装）', tags: ['concept', 'soc-pm', 'packaging'], sources: [] },
  'focos': { title: 'FOCoS（扇出型芯片上系统）', tags: ['concept', 'soc-pm', 'packaging'], sources: [] },
};

// Find related sources for each concept
const sourceFiles = fs.readdirSync(sourcesDir).filter(f => f.endsWith('.md'));

for (const file of sourceFiles) {
  const filePath = path.join(sourcesDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  const titleMatch = content.match(/^title:\s*(.+)$/m);
  const title = titleMatch ? titleMatch[1] : '';
  
  for (const [conceptId, info] of Object.entries(conceptMap)) {
    const keywords = conceptId.replace(/-/g, '').toLowerCase();
    const titleLower = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (titleLower.includes(keywords) || 
        title.toLowerCase().includes(info.title.toLowerCase().split('（')[0])) {
      const docId = file.replace('.md', '');
      if (!info.sources.includes(docId)) {
        info.sources.push(docId);
      }
    }
  }
}

// Create concept files
let created = 0;
for (const [conceptId, info] of Object.entries(conceptMap)) {
  const filePath = path.join(conceptsDir, `${conceptId}.md`);
  
  // Skip if already exists
  if (fs.existsSync(filePath)) {
    continue;
  }
  
  const sourcesList = info.sources.slice(0, 5).map(s => `  - ${s}`).join('\n');
  
  const content = `---
doc_id: ${conceptId}
title: ${info.title}
page_type: concept
related_sources:${sourcesList ? '\n' + sourcesList : ' []'}
related_entities: []
created: ${today}
updated: ${today}
tags: [${info.tags.join(', ')}]
---

# ${info.title}

## 定义

(TODO: 添加定义)

## 关键要点

(TODO: 添加关键要点)

## 证据

(TODO: 添加证据)

## 开放问题

(TODO: 添加开放问题)

## 相关笔记

(TODO: 添加相关笔记)
`;

  fs.writeFileSync(filePath, content, 'utf-8');
  created++;
}

console.log(`Created ${created} new concept files`);
