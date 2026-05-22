import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = path.join(__dirname, '..');
const PODCAST_DIR = path.join(ROOT, 'podcasts');
const OUTPUT_DIR = path.join(ROOT, 'data/chunks');
const TARGET_WORDS = 500;

interface Chunk {
  id: string;
  slug: string;
  idx: number;
  text: string;
  guest: string;
  episode_title: string;
  episode_date: string;
  post_url?: string;
}

function chunkText(text: string, targetWords: number): string[] {
  // Pass 1: split on blank-line paragraphs.
  const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  const coarse: string[] = [];
  let current = '';
  for (const para of paragraphs) {
    const proposed = current ? `${current}\n\n${para}` : para;
    if (proposed.split(/\s+/).length > targetWords && current) {
      coarse.push(current);
      current = para;
    } else {
      current = proposed;
    }
  }
  if (current) coarse.push(current);

  // Pass 2: any coarse chunk exceeding 2× target gets sub-split on single newlines.
  const finalChunks: string[] = [];
  for (const chunk of coarse) {
    if (chunk.split(/\s+/).length <= targetWords * 2) {
      finalChunks.push(chunk);
      continue;
    }
    const lines = chunk.split(/\n+/).map(l => l.trim()).filter(Boolean);
    let inner = '';
    for (const line of lines) {
      const proposed = inner ? `${inner}\n${line}` : line;
      if (proposed.split(/\s+/).length > targetWords && inner) {
        finalChunks.push(inner);
        inner = line;
      } else {
        inner = proposed;
      }
    }
    if (inner) finalChunks.push(inner);
  }

  return finalChunks;
}

function main() {
  const files = fs.readdirSync(PODCAST_DIR).filter(f => f.endsWith('.md'));
  console.log(`Found ${files.length} podcast files`);

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(PODCAST_DIR, file), 'utf-8');
    const { data: fm, content: body } = matter(raw);

    const texts = chunkText(body, TARGET_WORDS);
    const chunks: Chunk[] = texts.map((text, idx) => ({
      id: `${slug}-${idx}`,
      slug,
      idx,
      text,
      guest: fm.guest ?? slug,
      episode_title: fm.title ?? slug,
      episode_date: fm.date ?? '',
      post_url: fm.post_url,
    }));

    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${slug}.json`),
      JSON.stringify(chunks, null, 2),
    );
    console.log(`  ${slug}: ${chunks.length} chunks`);
  }
  console.log('Done.');
}

main();
