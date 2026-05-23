import fs from 'node:fs';
import path from 'node:path';
import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import matter from 'gray-matter';

const ROOT = path.join(__dirname, '..');
const PODCAST_DIR = path.join(ROOT, 'podcasts');
const OUTPUT_DIR = path.join(ROOT, 'data/guests');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are analyzing a podcast transcript to build a "character sheet" for the guest. Your output will be used to generate in-voice persona responses to product/career scenarios, so capture what makes this person distinctive.

Be specific. Avoid generic startup-advice platitudes. Quote distinctive language where possible.

Call the submit_character_sheet tool with the analyzed character sheet.`;

const CHARACTER_SHEET_TOOL = {
  name: 'submit_character_sheet',
  description: 'Submit the analyzed character sheet for this podcast guest.',
  input_schema: {
    type: 'object' as const,
    properties: {
      persona_summary: {
        type: 'string',
        description: 'One paragraph (3-5 sentences) capturing their worldview, what they advocate for, and their general vibe.',
      },
      core_frameworks: {
        type: 'array',
        items: { type: 'string' },
        description: '3-5 frameworks or principles they emphasize.',
      },
      signature_phrases: {
        type: 'array',
        items: { type: 'string' },
        description: '3-7 distinctive phrases or vocabulary they use repeatedly.',
      },
      pushes_back_on: {
        type: 'array',
        items: { type: 'string' },
        description: '3-5 things they explicitly criticize, dismiss, or warn against.',
      },
      speaking_style: {
        type: 'string',
        description: "One sentence on tone, pacing, and how they argue (e.g. 'direct, contrarian, uses concrete examples', 'measured and analogical').",
      },
    },
    required: ['persona_summary', 'core_frameworks', 'signature_phrases', 'pushes_back_on', 'speaking_style'],
  },
};

// Use Anthropic's tool_use to force the model into a schema-validated response,
// rather than parsing free-form text for JSON. Eliminates the unescaped-quote
// failure mode (cat-wu, claire-vo-openclaw, marc-andreessen on first pass).
async function buildSheet(slug: string, body: string, fm: any) {
  const truncated = body.slice(0, 60000);
  const res = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    tools: [CHARACTER_SHEET_TOOL],
    tool_choice: { type: 'tool', name: 'submit_character_sheet' },
    messages: [{
      role: 'user',
      content: `Guest: ${fm.guest ?? slug}\nEpisode: ${fm.title ?? slug}\n\nTranscript:\n${truncated}`,
    }],
  });

  const toolBlock = res.content.find(b => b.type === 'tool_use');
  if (!toolBlock || toolBlock.type !== 'tool_use') {
    throw new Error(`No tool_use response for ${slug}: stop_reason=${res.stop_reason}`);
  }
  return toolBlock.input as Record<string, unknown>;
}

async function main() {
  const files = fs.readdirSync(PODCAST_DIR).filter(f => f.endsWith('.md'));
  console.log(`Building character sheets for ${files.length} guests`);

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const outPath = path.join(OUTPUT_DIR, `${slug}.json`);

    if (fs.existsSync(outPath)) {
      console.log(`  ${slug}: already exists, skipping`);
      continue;
    }

    const raw = fs.readFileSync(path.join(PODCAST_DIR, file), 'utf-8');
    const { data: fm, content: body } = matter(raw);

    try {
      const sheet = await buildSheet(slug, body, fm);
      const out = {
        slug,
        guest: fm.guest ?? slug,
        episode_title: fm.title ?? slug,
        episode_date: fm.date ?? '',
        post_url: fm.post_url,
        ...sheet,
      };
      fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
      console.log(`  ${slug}: ✓`);
    } catch (err: any) {
      console.error(`  ${slug}: FAILED — ${err.message}`);
    }
  }
  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
