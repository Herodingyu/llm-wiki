const fs = require('fs');
const path = require('path');

const sourcesDir = 'D:\\\\llm-wiki\\\\llm-wiki\\\\wiki\\\\sources';
const files = fs.readdirSync(sourcesDir).filter(f => f.endsWith('.md'));

let fixed = 0;

for (const file of files) {
  const filePath = path.join(sourcesDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract raw_paths from frontmatter
  const rawPathsMatch = content.match(/raw_paths:\s*\n((?:\s+-\s+.+\n)+)/);
  if (!rawPathsMatch) continue;
  
  const rawPaths = rawPathsMatch[1]
    .split('\n')
    .filter(line => line.trim().startsWith('- '))
    .map(line => line.trim().replace(/^-\s+/, ''));
  
  if (rawPaths.length === 0) continue;
  
  let newContent = content;
  let changed = false;
  
  for (const rawPath of rawPaths) {
    // Calculate relative path from wiki/sources/ to vault root
    // wiki/sources/file.md -> ../../raw/xxx/xxx.md
    const obsidianPath = `../../${rawPath}`;
    
    // Pattern 1: [原始文章](raw/xxx/xxx.md)
    const mdPattern = new RegExp(
      `\\[([^\\]]+)\\]\\(${rawPath.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&')}\\)`,
      'g'
    );
    
    // Replace with both Markdown link AND Obsidian wiki link
    const replacement = `[原始文章](${rawPath}) / [[${obsidianPath}|原始文章]]`;
    
    if (mdPattern.test(newContent)) {
      newContent = newContent.replace(mdPattern, replacement);
      changed = true;
    }
    
    // Also check if there's already a wiki link, skip if exists
    const wikiPattern = new RegExp(
      `\\[\\[${obsidianPath.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&')}\\|[^\\]]+\\]\\]`,
      'g'
    );
    
    if (wikiPattern.test(newContent)) {
      // Already has wiki link, skip
      continue;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`Fixed: ${file}`);
    fixed++;
  }
}

console.log(`\nFixed ${fixed} files`);
