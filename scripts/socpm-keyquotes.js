const fs = require('fs');
const path = require('path');
const NL = String.fromCharCode(10);

const sourcesDir = 'D:\\llm-wiki\\llm-wiki\\wiki\\sources';
const files = fs.readdirSync(sourcesDir).filter(f => f.endsWith('.md') && f.startsWith('src-'));

let processed = 0;
let skipped = 0;
let failed = 0;

for (const file of files) {
  const sourcePath = path.join(sourcesDir, file);
  const sourceContent = fs.readFileSync(sourcePath, 'utf8');
  
  // Only process SoC PM files
  if (!sourceContent.includes('domain: tech/soc-pm')) continue;
  
  // Skip if already has Key Quotes
  if (sourceContent.includes('## Key Quotes')) {
    skipped++;
    continue;
  }
  
  // Skip if missing Summary or Key Points
  if (!sourceContent.includes('## Summary') || !sourceContent.includes('## Key Points')) {
    skipped++;
    continue;
  }
  
  // Extract raw_path from frontmatter
  const rawPathMatch = sourceContent.match(/raw_paths:\s*\n\s*-\s*(.+?)(?:\n|$)/);
  if (!rawPathMatch) {
    failed++;
    continue;
  }
  
  const rawRelPath = rawPathMatch[1].trim();
  const rawFullPath = path.join('D:\\llm-wiki\\llm-wiki', rawRelPath);
  
  if (!fs.existsSync(rawFullPath)) {
    failed++;
    continue;
  }
  
  const rawContent = fs.readFileSync(rawFullPath, 'utf8');
  const quotes = [];
  
  // Strategy 1: Find bold text
  const boldMatches = rawContent.match(/\*\*([^*]+?)\*\*/g);
  if (boldMatches) {
    for (const match of boldMatches) {
      const clean = match.replace(/\*\*/g, '').trim();
      if (clean.length > 15 && clean.length < 180 && 
          !clean.includes('http') && !clean.includes('![') &&
          !quotes.includes(clean)) {
        quotes.push(clean);
      }
      if (quotes.length >= 5) break;
    }
  }
  
  // Strategy 2: Find blockquotes
  if (quotes.length < 3) {
    const quoteMatches = rawContent.match(/^>(.+)$/gm);
    if (quoteMatches) {
      for (const match of quoteMatches) {
        const clean = match.replace(/^>\s*/, '').trim();
        if (clean.length > 15 && clean.length < 180 && 
            !clean.includes('http') && !quotes.includes(clean)) {
          quotes.push(clean);
        }
        if (quotes.length >= 5) break;
      }
    }
  }
  
  // Strategy 3: Find important sentences
  if (quotes.length < 3) {
    const sentences = rawContent.split(/[.!?。！？]\s+/);
    for (const sentence of sentences) {
      const clean = sentence.trim();
      if (clean.length > 20 && clean.length < 150 && 
          (clean.includes('是') || clean.includes('指') || clean.includes('核心') || 
           clean.includes('本质') || clean.includes('关键')) &&
          !clean.includes('http') && !clean.includes('![') && !clean.includes('*') &&
          !quotes.includes(clean)) {
        quotes.push(clean);
      }
      if (quotes.length >= 5) break;
    }
  }
  
  if (quotes.length === 0) {
    failed++;
    continue;
  }
  
  // Format Key Quotes section
  const quoteLines = quotes.slice(0, 5).map(q => '> "' + q + '"').join('\n\n');
  const quotesSection = '## Key Quotes\n\n' + quoteLines;
  
  // Insert before Open Questions or at the end before Evidence
  let newContent;
  if (sourceContent.includes('## Open Questions')) {
    newContent = sourceContent.replace(
      /## Open Questions/,
      quotesSection + '\n\n## Open Questions'
    );
  } else if (sourceContent.includes('## Evidence')) {
    newContent = sourceContent.replace(
      /## Evidence/,
      quotesSection + '\n\n## Evidence'
    );
  } else {
    newContent = sourceContent + '\n\n' + quotesSection;
  }
  
  fs.writeFileSync(sourcePath, newContent);
  processed++;
  
  if (processed % 20 === 0) {
    console.log('Progress:', processed, 'processed,', skipped, 'skipped,', failed, 'failed');
  }
}

console.log('\n=== SoC PM Key Quotes Summary ===');
console.log('Processed:', processed);
console.log('Skipped:', skipped);
console.log('Failed:', failed);
console.log('Total SoC PM files:', processed + skipped + failed);
