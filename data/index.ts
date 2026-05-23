export interface Chunk {
  id: string;
  slug: string;
  idx: number;
  text: string;
  guest: string;
  episode_title: string;
  episode_date: string;
  post_url?: string;
  embedding: number[];
}

export interface CharacterSheet {
  slug: string;
  guest: string;
  episode_title: string;
  episode_date: string;
  post_url?: string;
  persona_summary: string;
  core_frameworks: string[];
  signature_phrases: string[];
  pushes_back_on: string[];
  speaking_style: string;
}

export interface ScenarioCard {
  id: string;
  title: string;
  setup: string;
  suggested_moves: string[];
  judge_bench: string[];
  themes: string[];
}

export type Bucket = 'growth' | 'shipping-ai' | 'leadership' | 'zero-to-one' | 'career';

export interface ScenarioDeck {
  growth: ScenarioCard[];
  'shipping-ai': ScenarioCard[];
  leadership: ScenarioCard[];
  'zero-to-one': ScenarioCard[];
  career: ScenarioCard[];
}

export const BUCKET_LABELS: Record<Bucket, string> = {
  'growth': 'Growth & Retention',
  'shipping-ai': 'Shipping AI',
  'leadership': 'Leadership & Tough Calls',
  'zero-to-one': 'Zero-to-One',
  'career': 'Career Crossroads',
};
