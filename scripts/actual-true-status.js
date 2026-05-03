const fs = require('fs');
const path = require('path');
const NL = String.fromCharCode(10);

const sourcesDir = 'D:\\llm-wiki\\llm-wiki\\wiki\\sources';
const files = fs.readdirSync(sourcesDir).filter(f => f.endsWith('.md') && f.startsWith('src-'));

const domains = {};

for (const file of files) {
  const content = fs.readFileSync(path.join(sourcesDir, file), 'utf8');
  
  const domainMatch = content.match(/domain:\s*(.+)/);
  if (!domainMatch) continue;
  const domain = domainMatch[1].trim();
  
  if (!domains[domain]) {
    domains[domain] = { total: 0, skeleton: 0, filled: 0 };
  }
  domains[domain].total++;
  
  // Check if it has any kind of summary and key points (English or Chinese)
  const hasSummary = content.includes('## Summary') || content.includes('## 摘要');
  const hasKeyPoints = content.includes('## Key Points') || content.includes('## 关键要点');
  
  if (!hasSummary || !hasKeyPoints) {
    domains[domain].skeleton++;
    continue;
  }
  
  // Extract summary text
  let summary = '';
  const summaryMatch = content.match(new RegExp('## Summary' + NL + '+(.+?)' + NL + '+## Key Points', 's'));
  if (summaryMatch) {
    summary = summaryMatch[1].trim();
  } else {
    const cnSummaryMatch = content.match(new RegExp('## 摘要' + NL + '+(.+?)' + NL + '+##', 's'));
    if (cnSummaryMatch) summary = cnSummaryMatch[1].trim();
  }
  
  // Check if summary is just metadata
  const isSkeleton = summary.includes('人赞同') || summary.includes('收录于') || summary.length < 80;
  
  if (isSkeleton) {
    domains[domain].skeleton++;
  } else {
    domains[domain].filled++;
  }
}

console.log('=== ACTUAL TRUE Final Status ===');
for (const [domain, stats] of Object.entries(domains).sort((a, b) => b[1].total - a[1].total)) {
  console.log(domain + ':');
  console.log('  Total:', stats.total, '| Skeleton:', stats.skeleton, '| Filled:', stats.filled);
}

const totalFiles = Object.values(domains).reduce((sum, d) => sum + d.total, 0);
const totalSkeleton = Object.values(domains).reduce((sum, d) => sum + d.skeleton, 0);
const totalFilled = Object.values(domains).reduce((sum, d) => sum + d.filled, 0);

console.log('\n=== Overall ===');
console.log('Total files:', totalFiles);
console.log('Skeleton:', totalSkeleton);
console.log('Filled:', totalFilled);
console.log('Completion:', Math.round((totalFilled / totalFiles) * 100) + '%');
