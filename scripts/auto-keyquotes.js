const fs = require('fs');
const path = require('path');
const NL = String.fromCharCode(10);

const sourcesDir = 'D:\\llm-wiki\\llm-wiki\\wiki\\sources';
const files = fs.readdirSync(sourcesDir).filter(f => f.endsWith('.md') && f.startsWith('src-'));
const needsKeyQuotesFiles = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(sourcesDir, file), 'utf8');
  if (!content.includes('domain: tech/bsp')) continue;
  if (content.includes('## Summary') && content.includes('## Key Points') && !content.includes('## Key Quotes')) {
    needsKeyQuotesFiles.push(file);
  }
}

const batch = needsKeyQuotesFiles.slice(0, 6);
console.log('Processing', batch.length, 'files for Key Quotes');

for (const file of batch) {
  const sourcePath = path.join(sourcesDir, file);
  const sourceContent = fs.readFileSync(sourcePath, 'utf8');
  
  const rawPathMatch = sourceContent.match(/raw_paths:\s*\n\s*-\s*(.+)/);
  if (!rawPathMatch) {
    console.log('  ✗', file, '- no raw path');
    continue;
  }
  
  const rawRelPath = rawPathMatch[1].trim();
  const rawFullPath = path.join('D:\\llm-wiki\\llm-wiki', rawRelPath);
  
  if (!fs.existsSync(rawFullPath)) {
    console.log('  ✗', file, '- raw not found');
    continue;
  }
  
  const rawContent = fs.readFileSync(rawFullPath, 'utf8');
  const quotes = [];
  
  const boldMatches = rawContent.match(/\*\*(.+?)\*\*/g);
  if (boldMatches) {
    for (const match of boldMatches.slice(0, 3)) {
      const clean = match.replace(/\*\*/g, '').trim();
      if (clean.length > 20 && clean.length < 200 && !clean.includes('http')) {
        quotes.push(clean);
      }
      if (quotes.length >= 3) break;
    }
  }
  
  if (quotes.length === 0) {
    console.log('  ✗', file, '- no quotes found');
    continue;
  }
  
  const quoteLines = quotes.map(q => '> "' + q + '"').join(NL + NL);
  const quotesSection = '## Key Quotes' + NL + NL + quoteLines;
  const newContent = sourceContent.replace(/## Open Questions/, quotesSection + NL + NL + '## Open Questions');
  
  fs.writeFileSync(sourcePath, newContent);
  console.log('  ✓', file, '- added', quotes.length, 'quotes');
}
