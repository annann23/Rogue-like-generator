export interface MetaUpgrade {
  id: string;
  name: string;
  description: string;
  costPerLevel: number;
  maxLevel: number;
  icon: string;
}

export const META_UPGRADES: MetaUpgrade[] = [
  { id: 'hp',           name: '유산의 피',   description: '시작 최대 HP +15',  costPerLevel: 3, maxLevel: 5, icon: '❤️' },
  { id: 'gold',         name: '황금 유산',   description: '시작 골드 +25',     costPerLevel: 3, maxLevel: 5, icon: '💰' },
  { id: 'atk',          name: '전투 혈통',   description: '시작 ATK +2',       costPerLevel: 5, maxLevel: 3, icon: '⚔️' },
  { id: 'def',          name: '철갑 가문',   description: '시작 DEF +2',       costPerLevel: 5, maxLevel: 3, icon: '🛡️' },
  { id: 'intelligence', name: '학자의 유산', description: '지능 스킬 +1',      costPerLevel: 6, maxLevel: 3, icon: '🧠' },
  { id: 'negotiation',  name: '상인의 혈통', description: '협상 스킬 +1',      costPerLevel: 6, maxLevel: 3, icon: '🗣️' },
  { id: 'stealth',      name: '그림자 가문', description: '은신 스킬 +1',      costPerLevel: 6, maxLevel: 3, icon: '👁️' },
  { id: 'strength',     name: '용사의 힘',   description: '완력 스킬 +1',      costPerLevel: 6, maxLevel: 3, icon: '💪' },
];
