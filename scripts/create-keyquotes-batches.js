const fs = require('fs');
const path = require('path');

const sourcesDir = 'D:\\llm-wiki\\llm-wiki\\wiki\\sources';
const scriptsDir = 'D:\\llm-wiki\\llm-wiki\\scripts';

const files = fs.readdirSync(sourcesDir).filter(f => f.endsWith('.md'));

const missingQuotes = [];
files.forEach(f => {
  const content = fs.readFileSync(path.join(sourcesDir, f), 'utf8');
  if (!content.includes('## Key Quotes')) {
    missingQuotes.push(f);
  }
});

console.log('Missing Key Quotes:', missingQuotes.length);

// Create batch files for subagents
const batchSize = Math.ceil(missingQuotes.length / 3);
for (let i = 0; i < 3; i++) {
  const batch = missingQuotes.slice(i * batchSize, (i + 1) * batchSize);
  const content = batch.join('\n');
  fs.writeFileSync(path.join(scriptsDir, 'keyquotes-batch-' + (i+1) + '.txt'), content);
  console.log('Batch', i+1, ':', batch.length, 'files');
}
