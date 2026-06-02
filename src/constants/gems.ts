export interface GemDef {
  id: string;
  name: string;
  icon: string;
  element: string;
  conditionLabel: string;
}

export const GEM_DEFS: GemDef[] = [
  {
    id: 'flame',
    name: '불꽃의 보석',
    icon: '🔴',
    element: '불꽃',
    conditionLabel: '전투 승리 누적 10회',
  },
  {
    id: 'water',
    name: '물결의 보석',
    icon: '💧',
    element: '물결',
    conditionLabel: '유령 전투 승리 1회',
  },
  {
    id: 'light',
    name: '빛의 보석',
    icon: '✨',
    element: '빛',
    conditionLabel: 'NPC 호감도 100 달성',
  },
  {
    id: 'dark',
    name: '어둠의 보석',
    icon: '🌑',
    element: '어둠',
    conditionLabel: '협상 누적 30회 성공',
  },
  {
    id: 'earth',
    name: '대지의 보석',
    icon: '🟤',
    element: '대지',
    conditionLabel: '던전 클리어 1회',
  },
  {
    id: 'soul',
    name: '영혼의 보석',
    icon: '💜',
    element: '영혼',
    conditionLabel: '나머지 5개 수집 후 던전 클리어',
  },
];

export function checkNewGems(params: {
  collectedGems: string[];
  totalCombatWins: number;
  totalGhostWins: number;
  totalNegotiations: number;
  totalClears: number;
  maxNPCFamiliarity: number;
}): string[] {
  const { collectedGems, totalCombatWins, totalGhostWins, totalNegotiations, totalClears, maxNPCFamiliarity } = params;
  const has = (id: string) => collectedGems.includes(id);
  const newGems: string[] = [];

  if (!has('flame') && totalCombatWins >= 10) newGems.push('flame');
  if (!has('water') && totalGhostWins >= 1) newGems.push('water');
  if (!has('light') && maxNPCFamiliarity >= 100) newGems.push('light');
  if (!has('dark') && totalNegotiations >= 30) newGems.push('dark');
  if (!has('earth') && totalClears >= 1) newGems.push('earth');

  const allFive = ['flame', 'water', 'light', 'dark', 'earth'].every(
    (id) => has(id) || newGems.includes(id),
  );
  if (!has('soul') && allFive && totalClears >= 1) newGems.push('soul');

  return newGems;
}
