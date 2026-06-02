import { supabase } from '@/lib/supabase';

export interface Ghost {
  id: string;
  last_words: string;
  death_cause: string | null;
  character_class: string;
  persona_name: string | null;
  depth: number;
  created_at: string;
}

// 인접 층(±1)의 유령 최대 limit개 랜덤 반환
export async function fetchGhosts(depth: number, limit = 2): Promise<Ghost[]> {
  const { data, error } = await supabase
    .from('ghosts')
    .select('*')
    .gte('depth', Math.max(1, depth - 1))
    .lte('depth', Math.min(10, depth + 1))
    .order('created_at', { ascending: false })
    .limit(30);

  if (error || !data || data.length === 0) return [];

  const shuffled = [...data].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit) as Ghost[];
}

export async function saveGhost(ghost: {
  last_words: string;
  death_cause: string | null;
  character_class: string;
  persona_name?: string | null;
  depth: number;
}): Promise<void> {
  await supabase.from('ghosts').insert(ghost);
}
