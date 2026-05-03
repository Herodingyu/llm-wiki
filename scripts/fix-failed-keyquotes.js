const fs = require('fs');
const path = require('path');
const NL = String.fromCharCode(10);

const sourcesDir = 'D:\\llm-wiki\\llm-wiki\\wiki\\sources';
const failedFiles = [
  'src-linux-suspend-resume.md',
  'src-text-data-bss-segments.md',
  'src-一文搞懂linux系统休眠唤醒.md',
  'src-最全最完整的uboot资料-看完你就懂了.md',
  'src-浅谈程序中的text段-data段和bss段.md',
  'src-聊聊soc启动-一-armv8启动总体流程.md',
  'src-聊聊soc启动-六-uboot启动流程二.md'
];

for (const file of failedFiles) {
  const sourcePath = path.join(sourcesDir, file);
  if (!fs.existsSync(sourcePath)) {
    console.log('✗', file, '- not found');
    continue;
  }
  
  const content = fs.readFileSync(sourcePath, 'utf8');
  
  const kpMatch = content.match(new RegExp('## Key Points' + NL + '([\\s\\S]+?)' + NL + '##'));
  if (!kpMatch) {
    console.log('✗', file, '- no key points');
    continue;
  }
  
  const kp = kpMatch[1].trim();
  const lines = kp.split(NL).filter(l => l.trim().startsWith('-') || l.trim().startsWith('*') || l.includes('|'));
  const quotes = lines.slice(0, 3).map(l => l.trim().replace(/^[-*]\s*/, '').trim()).filter(l => l.length > 10);
  
  if (quotes.length === 0) {
    console.log('✗', file, '- no quotes from KP');
    continue;
  }
  
  const quoteSection = '## Key Quotes' + NL + NL + quotes.map(q => '> "' + q + '"').join(NL + NL);
  const newContent = content.replace(/## Open Questions/, quoteSection + NL + NL + '## Open Questions');
  fs.writeFileSync(sourcePath, newContent);
  console.log('✓', file, '- added', quotes.length, 'quotes from Key Points');
}
