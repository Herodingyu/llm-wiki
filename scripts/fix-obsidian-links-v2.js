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
    
    // Pattern: [原始文章](raw/xxx/xxx.md)
    // Need to escape special regex chars in rawPath
    const escapedPath = rawPath.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&');
    const mdPattern = new RegExp(`\\[([^\\]]+)\\]\\(${escapedPath}\\)`, 'g');
    
    // Check if already has obsidian link
    const wikiPattern = new RegExp(`\\[\\[${obsidianPath.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&')}\\|[^\\]]+\\]\\]`);
    
    if (wikiPattern.test(content)) {
      // Already has wiki link, skip
      continue;
    }
    
    // Replace: [原始文章](raw/xxx/xxx.md) -> [原始文章](raw/xxx/xxx.md) [[../../raw/xxx/xxx.md|原始文章]]
    const replacement = (match, text) => {
      return `${match} [[${obsidianPath}|${text}]]`;
    };
    
    const newContent = content.replace(mdPattern, replacement);
    
    if (newContent !== content) {
      content = newContent;
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Fixed: ${file}`);
    fixed++;
  }
}

console.log(`\nFixed ${fixed} files`);
