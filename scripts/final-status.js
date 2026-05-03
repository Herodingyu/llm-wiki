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
  
  // Check for any kind of summary content (English or Chinese)
  const hasSummary = content.includes('## Summary') || content.includes('## 摘要');
  const hasKeyPoints = content.includes('## Key Points') || content.includes('## 关键要点');
  const hasKeyQuotes = content.includes('## Key Quotes') || content.includes('## 原文引用');
  
  // Check if it's a skeleton
  const summaryMatch = content.match(new RegExp('## Summary' + NL + '+(.+?)' + NL + '+## Key Points', 's'));
  const summary = summaryMatch ? summaryMatch[1].trim() : '';
  const hasSkeletonContent = summary.includes('人赞同') || summary.includes('收录于') || summary.length < 100;
  
  // Check if Key Points has real content (not just "To be summarized")
  const kpMatch = content.match(new RegExp('## Key Points' + NL + '([\\s\\S]+?)' + NL + '##'));
  const kp = kpMatch ? kpMatch[1].trim() : '';
  const hasRealKP = kp.length > 50 && !kp.includes('To be summarized') && !kp.includes('待填充');
  
  // Also check Chinese format
  const cnSummaryMatch = content.match(new RegExp('## 摘要' + NL + '+(.+?)' + NL + '+##', 's'));
  const hasCnContent = content.includes('## 关键要点') && content.includes('## 技术细节');
  
  if (hasSkeletonContent || !hasRealKP) {
    if (hasCnContent || (hasSummary && hasKeyPoints && !hasSkeletonContent)) {
      domains[domain].filled++;
    } else {
      domains[domain].skeleton++;
    }
  } else {
    domains[domain].filled++;
  }
}

console.log('=== Final Corrected Status ===');
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
