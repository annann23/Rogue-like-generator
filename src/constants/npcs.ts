export interface NPCTemplate {
  id: string;
  name: string;
  icon: string;
  personality: string;
  baseDialogue: string;
  favoriteItemTag: string; // 플레이어가 직접 알아내야 하는 선호 아이템 태그
}

export interface GiftItem {
  id: string;
  name: string;
  emoji: string;
  goldCost: number;
  tag: string;
}

export const GIFT_ITEMS: GiftItem[] = [
  { id: 'gold_small',  name: '금화 조금',     emoji: '💰', goldCost: 5,  tag: 'gold'  },
  { id: 'gold_large',  name: '금화 한 주머니', emoji: '💰', goldCost: 20, tag: 'gold'  },
  { id: 'meat_dish',   name: '고기 요리',      emoji: '🍖', goldCost: 10, tag: 'food'  },
  { id: 'rare_ore',    name: '희귀 광석',      emoji: '⛏️', goldCost: 15, tag: 'ore'   },
  { id: 'magic_herb',  name: '마법 약초',      emoji: '🌿', goldCost: 10, tag: 'herb'  },
  { id: 'old_ale',     name: '오래된 술',      emoji: '🍺', goldCost: 8,  tag: 'drink' },
  { id: 'magic_tome',  name: '마법서',         emoji: '📚', goldCost: 20, tag: 'book'  },
  { id: 'jewel',       name: '보석',           emoji: '💎', goldCost: 25, tag: 'jewel' },
];

export const NPC_TEMPLATES: NPCTemplate[] = [
  {
    id: 'blacksmith_igor',
    name: '대장장이 이고르',
    icon: '🔨',
    personality: '과묵하고 실용적이며 품질을 중시한다. 말이 적지만 신뢰할 수 있다.',
    baseDialogue: '좋은 무기는 좋은 모험가를 만들지.',
    favoriteItemTag: 'ore',
  },
  {
    id: 'merchant_vera',
    name: '상인 베라',
    icon: '💰',
    personality: '수다스럽고 이익을 추구하지만 정직하다. 소문을 많이 알고 있다.',
    baseDialogue: '뭘 사겠어요? 뭘 팔겠어요?',
    favoriteItemTag: 'gold',
  },
  {
    id: 'wizard_elric',
    name: '마법사 엘릭',
    icon: '🧙',
    personality: '신비롭고 오만하며 지식을 과시한다. 가끔 유용한 정보를 흘린다.',
    baseDialogue: '평범한 자들은 이해 못 할 것이오...',
    favoriteItemTag: 'book',
  },
  {
    id: 'innkeeper_meg',
    name: '여관주인 메그',
    icon: '🍺',
    personality: '따뜻하고 모성적이며 소문을 잘 안다. 적절한 조언을 해준다.',
    baseDialogue: '한 잔 하겠어요? 얘기를 들어드릴게요.',
    favoriteItemTag: 'food',
  },
  {
    id: 'thief_shadow',
    name: '도둑 섀도우',
    icon: '🕵️',
    personality: '불신하고 의심스럽지만 거래에는 공정하다. 비밀 정보를 알고 있다.',
    baseDialogue: '... 뭘 원해?',
    favoriteItemTag: 'herb',
  },
];

export interface NPCRelation {
  familiarity: number;
  meetCount: number;
  pendingStatEffect?: { stat: string; change: number };
}

export type NPCRelations = Record<string, NPCRelation>;

export const FAMILIARITY_STAGES = [
  { min: 0, max: 19, label: '적대', icon: '😠', maxTurns: 1 },
  { min: 20, max: 39, label: '경계', icon: '😐', maxTurns: 2 },
  { min: 40, max: 59, label: '중립', icon: '🙂', maxTurns: 3 },
  { min: 60, max: 79, label: '우호', icon: '😊', maxTurns: 5 },
  { min: 80, max: 100, label: '신뢰', icon: '🤝', maxTurns: Infinity },
] as const;

export function getFamiliarityStage(familiarity: number) {
  return FAMILIARITY_STAGES.find(s => familiarity >= s.min && familiarity <= s.max) ?? FAMILIARITY_STAGES[0];
}
