export interface MetaUpgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;   // 레벨별 비용 = baseCost × (현재레벨 + 1)
  maxLevel: number;
  icon: string;
}

// 비용 계산 헬퍼: 다음 레벨 구매 비용
export function nextUpgradeCost(upg: MetaUpgrade, currentLevel: number): number {
  return upg.baseCost * (currentLevel + 1);
}

export const META_UPGRADES: MetaUpgrade[] = [
  { id: 'hp',           name: '유산의 피',   description: '시작 최대 HP +25',  baseCost: 2, maxLevel: 5, icon: '❤️' },
  { id: 'gold',         name: '황금 유산',   description: '시작 골드 +25',     baseCost: 2, maxLevel: 5, icon: '💰' },
  { id: 'atk',          name: '전투 혈통',   description: '시작 ATK +4',       baseCost: 4, maxLevel: 3, icon: '⚔️' },
  { id: 'def',          name: '철갑 가문',   description: '시작 DEF +4',       baseCost: 4, maxLevel: 3, icon: '🛡️' },
  { id: 'intelligence', name: '학자의 유산', description: '지능 스킬 +1',      baseCost: 5, maxLevel: 3, icon: '🧠' },
  { id: 'negotiation',  name: '상인의 혈통', description: '협상 스킬 +1',      baseCost: 5, maxLevel: 3, icon: '🗣️' },
  { id: 'stealth',      name: '그림자 가문', description: '은신 스킬 +1',      baseCost: 5, maxLevel: 3, icon: '👁️' },
  { id: 'strength',     name: '용사의 힘',   description: '완력 스킬 +1',      baseCost: 5, maxLevel: 3, icon: '💪' },
];
