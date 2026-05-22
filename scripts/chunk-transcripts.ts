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
  const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    const proposed = current ? `${current}\n\n${para}` : para;
    const wordCount = proposed.split(/\s+/).length;
    if (wordCount > targetWords && current) {
      chunks.push(current);
      current = para;
    } else {
      current = proposed;
    }
  }
  if (current) chunks.push(current);
  return chunks;
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
