const fs = require('fs');
const path = require('path');

const sourcesDir = 'D:\\\\llm-wiki\\\\llm-wiki\\\\wiki\\\\sources';
const files = fs.readdirSync(sourcesDir).filter(f => f.endsWith('.md'));
let fixed = 0;

for (const file of files) {
  const filePath = path.join(sourcesDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Check if title line has unquoted colon
  const lines = content.split('\\n');
  let changed = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Match title lines that don't start with quote and contain colon
    if (line.match(/^title: [^\"].*:.*$/)) {
      const titleValue = line.replace(/^title: /, '');
      lines[i] = `title: "${titleValue}"`;
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, lines.join('\\n'), 'utf-8');
    console.log('Fixed: ' + file);
    fixed++;
  }
}

console.log('Fixed ' + fixed + ' files');
