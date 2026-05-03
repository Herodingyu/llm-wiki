const fs = require('fs');
const path = require('path');

const sourcesDir = 'D:\\\\llm-wiki\\\\llm-wiki\\\\wiki\\\\sources';
const files = fs.readdirSync(sourcesDir).filter(f => f.endsWith('.md'));
let fixed = 0;

for (const file of files) {
  const filePath = path.join(sourcesDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract frontmatter
  if (!content.startsWith('---')) continue;
  
  const end = content.indexOf('---', 3);
  if (end === -1) continue;
  
  const frontmatter = content.substring(0, end + 3);
  const body = content.substring(end + 3);
  
  // Parse frontmatter lines
  const lines = frontmatter.split('\\n');
  const fields = {};
  let currentKey = null;
  let currentValue = [];
  let inFrontmatter = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === '---') {
      if (!inFrontmatter) {
        inFrontmatter = true;
      } else {
        if (currentKey) {
          fields[currentKey] = currentValue.join('\\n');
        }
        break;
      }
      continue;
    }
    
    if (!inFrontmatter) continue;
    
    // Check if line starts with a key
    const match = line.match(/^(\\w+):\\s*(.*)$/);
    if (match && !line.startsWith('  -')) {
      if (currentKey) {
        fields[currentKey] = currentValue.join('\\n');
      }
      currentKey = match[1];
      currentValue = [match[2]];
    } else if (currentKey) {
      currentValue.push(line);
    }
  }
  
  // Check if title contains other field names
  if (fields.title) {
    const titleValue = fields.title.trim();
    if (titleValue.includes('page_type:') || titleValue.includes('source_kind:') || 
        titleValue.includes('domain:') || titleValue.includes('created:') ||
        titleValue.includes('updated:') || titleValue.includes('tags:')) {
      // Extract just the title part
      const cleanTitle = titleValue.split(/\\s+(?:page_type|source_kind|domain|created|updated|tags):/)[0].trim();
      // Remove surrounding quotes if present
      fields.title = cleanTitle.replace(/^["']|["']$/g, '');
    }
  }
  
  // Ensure all required fields exist
  const requiredFields = ['doc_id', 'title', 'page_type', 'source_kind', 'domain', 'created', 'updated', 'tags'];
  let missingFields = [];
  
  for (const field of requiredFields) {
    if (!fields[field] || fields[field].trim() === '') {
      missingFields.push(field);
    }
  }
  
  // Also check raw_paths
  let hasRawPaths = false;
  for (const line of lines) {
    if (line.trim().startsWith('- raw/')) {
      hasRawPaths = true;
      break;
    }
  }
  
  if (missingFields.length > 0 || !hasRawPaths) {
    console.log(`Fixing ${file}: missing ${missingFields.join(', ')}${!hasRawPaths ? ', raw_paths' : ''}`);
    
    // Try to reconstruct from body or defaults
    if (!fields.page_type) fields.page_type = 'source';
    if (!fields.source_kind) fields.source_kind = 'raw_markdown';
    if (!fields.domain) fields.domain = 'unknown';
    if (!fields.created) fields.created = '2026-05-03';
    if (!fields.updated) fields.updated = '2026-05-03';
    if (!fields.tags) fields.tags = '[]';
    
    // Rebuild frontmatter
    let newFm = '---\\n';
    newFm += `doc_id: ${fields.doc_id || file.replace('.md', '')}\\n`;
    newFm += `title: "${(fields.title || 'Untitled').replace(/"/g, '\\"')}"\\n`;
    newFm += `page_type: ${fields.page_type}\\n`;
    newFm += `source_kind: ${fields.source_kind}\\n`;
    
    // Handle raw_paths
    if (hasRawPaths) {
      newFm += 'raw_paths:\\n';
      for (const line of lines) {
        if (line.trim().startsWith('- raw/')) {
          newFm += `${line}\\n`;
        }
      }
    } else {
      newFm += 'raw_paths:\\n';
      newFm += `  - raw/unknown/${file.replace('src-', '').replace('.md', '.md')}\\n`;
    }
    
    newFm += `domain: ${fields.domain}\\n`;
    newFm += `created: ${fields.created}\\n`;
    newFm += `updated: ${fields.updated}\\n`;
    newFm += `tags: ${fields.tags}\\n`;
    newFm += '---';
    
    fs.writeFileSync(filePath, newFm + body, 'utf-8');
    fixed++;
  }
}

console.log(`Fixed ${fixed} files`);
