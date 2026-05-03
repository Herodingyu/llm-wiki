const fs = require('fs');
const path = require('path');

const sourcesDir = 'D:\\\\llm-wiki\\\\llm-wiki\\\\wiki\\\\sources';
const files = fs.readdirSync(sourcesDir).filter(f => f.endsWith('.md'));

let fixed = 0;

for (const file of files) {
  const filePath = path.join(sourcesDir, file);
  const stats = fs.statSync(filePath);
  
  // Only fix files created today (newly generated)
  if (stats.mtime < new Date('2026-05-03')) continue;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;
  
  // Extract raw_paths from frontmatter
  const rawPathsMatch = content.match(/raw_paths:\s*\n((?:\s+-\s+.+\n)+)/);
  if (!rawPathsMatch) continue;
  
  const rawPaths = rawPathsMatch[1]
    .split('\n')
    .filter(line => line.trim().startsWith('- '))
    .map(line => line.trim().replace(/^-\s+/, ''));
  
  if (rawPaths.length === 0) continue;
  
  for (const rawPath of rawPaths) {
    // Obsidian path from wiki/sources/file.md to raw/xxx/xxx.md
    const obsidianPath = `../../${rawPath}`;
    
    // Use simple string replacement instead of regex
    // Find: [原始文章](raw/xxx/xxx.md)
    // Replace: [原始文章](raw/xxx/xxx.md) [[../../raw/xxx/xxx.md|原始文章]]
    
    const searchStr = `](${rawPath})`;
    const wikiLink = ` [[${obsidianPath}|原始文章]]`;
    
    // Find all occurrences
    let pos = 0;
    while (true) {
      const idx = content.indexOf(searchStr, pos);
      if (idx === -1) break;
      
      // Check if already has wiki link after this
      const afterStr = content.substring(idx + searchStr.length, idx + searchStr.length + wikiLink.length);
      if (afterStr === wikiLink) {
        pos = idx + 1;
        continue;
      }
      
      // Insert wiki link after markdown link
      content = content.substring(0, idx + searchStr.length) + wikiLink + content.substring(idx + searchStr.length);
      changed = true;
      pos = idx + searchStr.length + wikiLink.length + 1;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Fixed: ${file}`);
    fixed++;
  }
}

console.log(`\nFixed ${fixed} files`);
