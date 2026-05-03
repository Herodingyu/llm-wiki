#!/usr/bin/env node
/**
 * Batch ingest script for llm-wiki-karpathy
 * Creates skeleton source notes for all new/modified raw files
 */

import { readdir, readFile, writeFile, stat, mkdir } from 'fs/promises';
import { join, relative, dirname } from 'path';

const VAULT_ROOT = 'D:\\llm-wiki\\llm-wiki';
const RAW_DIR = join(VAULT_ROOT, 'raw');
const SOURCES_DIR = join(VAULT_ROOT, 'wiki', 'sources');

async function getAllMarkdownFiles(dir, base = '') {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relPath = base ? join(base, entry.name) : entry.name;
    
    if (entry.isDirectory()) {
      const subFiles = await getAllMarkdownFiles(fullPath, relPath);
      files.push(...subFiles);
    } else if (entry.name.endsWith('.md') && entry.name !== '.gitkeep') {
      files.push(relPath);
    }
  }
  
  return files;
}

function generateDocId(filePath) {
  // Remove .md extension and create doc_id
  const base = filePath.replace(/\\/g, '/').replace(/\.md$/, '');
  const parts = base.split('/');
  
  // Create a readable doc_id from path
  const lastPart = parts[parts.length - 1];
  const clean = lastPart
    .replace(/[^\w\u4e00-\u9fa5]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .substring(0, 50);
  
  return `src-${clean}`;
}

function generateDomain(filePath) {
  const parts = filePath.replace(/\\/g, '/').split('/');
  if (parts.length >= 2) {
    return parts.slice(0, 2).join('/');
  }
  return 'unknown';
}

function extractTitle(content, fileName) {
  // Try to extract title from first heading
  const match = content.match(/^#\s+(.+)$/m);
  if (match) {
    return match[1].trim();
  }
  
  // Fallback to filename
  return fileName.replace(/\.md$/, '').replace(/-/g, ' ');
}

function parseFrontmatter(content) {
  if (content.startsWith('---')) {
    const end = content.indexOf('---', 3);
    if (end !== -1) {
      return content.substring(end + 3).trimStart();
    }
  }
  return content;
}

function extractSummary(content) {
  // Remove frontmatter if exists
  const body = parseFrontmatter(content);
  
  // Get first paragraph that's not empty and not a heading
  const lines = body.split('\n');
  const paragraphs = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---')) {
      paragraphs.push(trimmed);
      if (paragraphs.length >= 3) break;
    }
  }
  
  const summary = paragraphs.join(' ').substring(0, 300);
  return summary || '(No summary available)';
}

function extractKeyPoints(content) {
  const body = parseFrontmatter(content);
  const points = [];
  
  // Find all headings and their first line
  const lines = body.split('\n');
  let currentHeading = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('## ') || line.startsWith('### ')) {
      if (currentHeading) {
        points.push(currentHeading);
      }
      currentHeading = {
        title: line.replace(/^#+\s+/, ''),
        text: ''
      };
    } else if (currentHeading && line && !line.startsWith('#')) {
      currentHeading.text += line + ' ';
      if (currentHeading.text.length > 100) {
        points.push(currentHeading);
        currentHeading = null;
      }
    }
  }
  
  if (currentHeading) {
    points.push(currentHeading);
  }
  
  return points.slice(0, 5);
}

async function createSourceNote(rawPath) {
  const fullRawPath = join(RAW_DIR, rawPath);
  const content = await readFile(fullRawPath, 'utf-8');
  
  const docId = generateDocId(rawPath);
  const title = extractTitle(content, rawPath.split(/[\\/]/).pop());
  const domain = generateDomain(rawPath);
  const summary = extractSummary(content);
  const keyPoints = extractKeyPoints(content);
  
  const today = new Date().toISOString().split('T')[0];
  
  // Determine domain tags
  const domainParts = domain.split('/');
  const tags = domainParts.filter(p => p && p !== 'tech' && p !== 'industry');
  
  const sourceNote = `---
doc_id: ${docId}
title: ${title}
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/${rawPath.replace(/\\/g, '/')}
domain: ${domain}
created: ${today}
updated: ${today}
tags: [${tags.join(', ')}]
---

## Summary

${summary}

## Key Points

${keyPoints.map((p, i) => `### ${i + 1}. ${p.title}\n${p.text.substring(0, 200).trim()}`).join('\n\n') || '- (To be summarized)'}

## Evidence

- Source: [原始文章](raw/${rawPath.replace(/\\/g, '/')})

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/${rawPath.replace(/\\/g, '/')})
`;

  const outputPath = join(SOURCES_DIR, `${docId}.md`);
  await writeFile(outputPath, sourceNote, 'utf-8');
  
  return { docId, outputPath: relative(VAULT_ROOT, outputPath), title };
}

async function main() {
  console.log('Scanning raw files...');
  const allRawFiles = await getAllMarkdownFiles(RAW_DIR);
  console.log(`Found ${allRawFiles.length} raw markdown files`);
  
  // Check which ones already have source notes
  const existingSources = new Set();
  try {
    const sourceFiles = await readdir(SOURCES_DIR);
    for (const f of sourceFiles) {
      if (f.endsWith('.md')) {
        const content = await readFile(join(SOURCES_DIR, f), 'utf-8');
        const match = content.match(/^---\n([\s\S]*?)\n---/);
        if (match) {
          const lines = match[1].split('\n');
          for (const line of lines) {
            if (line.startsWith('doc_id:')) {
              const docId = line.replace('doc_id:', '').trim();
              if (docId) existingSources.add(docId);
              break;
            }
          }
        }
      }
    }
  } catch (e) {
    console.log('No existing sources found');
  }
  
  console.log(`Found ${existingSources.size} existing source notes`);
  
  const newFiles = [];
  for (const rawFile of allRawFiles) {
    const docId = generateDocId(rawFile);
    if (!existingSources.has(docId)) {
      newFiles.push(rawFile);
    }
  }
  
  console.log(`\n${newFiles.length} new files to process:`);
  for (const f of newFiles.slice(0, 10)) {
    console.log(`  - ${f}`);
  }
  if (newFiles.length > 10) {
    console.log(`  ... and ${newFiles.length - 10} more`);
  }
  
  console.log('\nCreating source notes...');
  const results = [];
  for (let i = 0; i < newFiles.length; i++) {
    const rawFile = newFiles[i];
    try {
      const result = await createSourceNote(rawFile);
      results.push(result);
      if ((i + 1) % 10 === 0) {
        console.log(`  Progress: ${i + 1}/${newFiles.length}`);
      }
    } catch (err) {
      console.error(`  Error processing ${rawFile}: ${err.message}`);
    }
  }
  
  console.log(`\nCreated ${results.length} source notes`);
  console.log('\nDone!');
  
  // Write summary
  const summary = {
    created: results.length,
    skipped: existingSources.size,
    total_raw: allRawFiles.length,
    new_files: newFiles
  };
  
  await writeFile(
    join(VAULT_ROOT, '.llm-kb', 'ingest-summary.json'),
    JSON.stringify(summary, null, 2),
    'utf-8'
  );
}

main().catch(console.error);
