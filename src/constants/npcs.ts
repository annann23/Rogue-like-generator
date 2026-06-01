export interface NPCTemplate {
  id: string;
  name: string;
  icon: string;
  personality: string;
  baseDialogue: string;
}

export const NPC_TEMPLATES: NPCTemplate[] = [
  {
    id: 'blacksmith_igor',
    name: '대장장이 이고르',
    icon: '🔨',
    personality: '과묵하고 실용적이며 품질을 중시한다. 말이 적지만 신뢰할 수 있다.',
    baseDialogue: '좋은 무기는 좋은 모험가를 만들지.',
  },
  {
    id: 'merchant_vera',
    name: '상인 베라',
    icon: '💰',
    personality: '수다스럽고 이익을 추구하지만 정직하다. 소문을 많이 알고 있다.',
    baseDialogue: '뭘 사겠어요? 뭘 팔겠어요?',
  },
  {
    id: 'wizard_elric',
    name: '마법사 엘릭',
    icon: '🧙',
    personality: '신비롭고 오만하며 지식을 과시한다. 가끔 유용한 정보를 흘린다.',
    baseDialogue: '평범한 자들은 이해 못 할 것이오...',
  },
  {
    id: 'innkeeper_meg',
    name: '여관주인 메그',
    icon: '🍺',
    personality: '따뜻하고 모성적이며 소문을 잘 안다. 적절한 조언을 해준다.',
    baseDialogue: '한 잔 하겠어요? 얘기를 들어드릴게요.',
  },
  {
    id: 'thief_shadow',
    name: '도둑 섀도우',
    icon: '🕵️',
    personality: '불신하고 의심스럽지만 거래에는 공정하다. 비밀 정보를 알고 있다.',
    baseDialogue: '... 뭘 원해?',
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
