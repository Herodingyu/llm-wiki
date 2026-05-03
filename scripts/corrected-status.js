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
    domains[domain] = { total: 0, skeleton: 0, needsQuotes: 0, filled: 0 };
  }
  domains[domain].total++;
  
  const hasSummary = content.includes('## Summary');
  const hasKeyPoints = content.includes('## Key Points');
  const hasKeyQuotes = content.includes('## Key Quotes');
  
  // Check if it's truly a skeleton
  const summaryMatch = content.match(new RegExp('## Summary' + NL + '+(.+?)' + NL + '+## Key Points', 's'));
  const summary = summaryMatch ? summaryMatch[1].trim() : '';
  const hasSkeletonContent = summary.includes('人赞同') || summary.includes('收录于') || summary.length < 100;
  
  // Check if Key Points has real content
  const kpMatch = content.match(new RegExp('## Key Points' + NL + '([\\s\\S]+?)' + NL + '##'));
  const kp = kpMatch ? kpMatch[1].trim() : '';
  const hasRealKP = kp.length > 50 && !kp.includes('To be summarized') && !kp.includes('待填充');
  
  if (hasSkeletonContent || !hasRealKP) {
    domains[domain].skeleton++;
  } else if (hasSummary && hasKeyPoints && hasRealKP && !hasKeyQuotes) {
    domains[domain].needsQuotes++;
  } else if (hasSummary && hasKeyPoints && hasRealKP && hasKeyQuotes) {
    domains[domain].filled++;
  }
}

console.log('=== Corrected All Domains Status ===');
for (const [domain, stats] of Object.entries(domains).sort((a, b) => b[1].total - a[1].total)) {
  console.log(domain + ':');
  console.log('  Total:', stats.total, '| Skeleton:', stats.skeleton, '| NeedsQuotes:', stats.needsQuotes, '| Filled:', stats.filled);
}

const totalFiles = Object.values(domains).reduce((sum, d) => sum + d.total, 0);
const totalSkeleton = Object.values(domains).reduce((sum, d) => sum + d.skeleton, 0);
const totalNeedsQuotes = Object.values(domains).reduce((sum, d) => sum + d.needsQuotes, 0);
const totalFilled = Object.values(domains).reduce((sum, d) => sum + d.filled, 0);

console.log('\n=== Overall ===');
console.log('Total files:', totalFiles);
console.log('Skeleton (being processed by agents):', totalSkeleton);
console.log('Needs Quotes:', totalNeedsQuotes);
console.log('Filled:', totalFilled);
console.log('Completion:', Math.round((totalFilled / totalFiles) * 100) + '%');
