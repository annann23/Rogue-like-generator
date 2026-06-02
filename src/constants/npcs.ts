import type { Relic } from './relics';

export interface NPCTemplate {
  id: string;
  name: string;
  icon: string;
  personality: string;
  baseDialogue: string;
  reunionLine: string;     // 재회 시 NPC가 영혼을 알아보는 방식의 고유 멘트
  favoriteItemTag: string; // 플레이어가 직접 알아내야 하는 선호 아이템 태그
  rewardKeyword: string;   // 이 단어를 언급하면 렐릭 선물 (호감도 60+ 시)
  rewardRelic: Relic;      // 호감도 60+ 달성 후 줄 수 있는 렐릭
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
    personality: '드워프 장인 정령. 영혼의 결을 금속처럼 감별하는 고대 존재. 과묵하고 실용적이며 품질을 중시한다. 말이 적지만 신뢰할 수 있다. 대화 속에서 자신이 정령임을 자연스럽게 드러낼 것.',
    baseDialogue: '좋은 무기는 좋은 영혼을 만들지.',
    reunionLine: '...같은 결이군. 쇠는 거짓말 안 해. 영혼도 마찬가지야.',
    favoriteItemTag: 'ore',
    rewardKeyword: '명검',
    rewardRelic: { name: '전사의 반지', effect: 'ATK +3, 전투 승리 시 HP +5', isCursed: false, icon: '💍' },
  },
  {
    id: 'merchant_vera',
    name: '상인 베라',
    icon: '💰',
    personality: '영혼의 눈을 가진 행운의 상인 반신. 수다스럽고 이익을 추구하지만 정직하다. 소문을 많이 알고 있다. 대화 속에서 자신이 반신임을 자연스럽게 드러낼 것.',
    baseDialogue: '뭘 사겠어요? 뭘 팔겠어요?',
    reunionLine: '어머, 또 보네요! 어떻게 알았냐구요? 헤헤. 저희는 눈을 보면 영혼을 알 수 있답니다.',
    favoriteItemTag: 'gold',
    rewardKeyword: '거래',
    rewardRelic: { name: '행운의 동전', effect: '골드 획득량 +30%', isCursed: false, icon: '🪙' },
  },
  {
    id: 'wizard_elric',
    name: '마법사 엘릭',
    icon: '🧙',
    personality: '불멸의 현자 반신. 영혼의 파동을 감지하는 오만하고 신비로운 존재. 지식을 과시하며 가끔 유용한 정보를 흘린다. 대화 속에서 자신이 불멸의 반신임을 자연스럽게 드러낼 것.',
    baseDialogue: '또 환생했군... 평범한 자들은 이해 못 할 것이오.',
    reunionLine: '또 왔군... 네 영혼의 파동은 어디서도 속일 수 없지. 평범한 자들은 모르겠지만, 나 같은 존재에겐 자명하오.',
    favoriteItemTag: 'book',
    rewardKeyword: '지식',
    rewardRelic: { name: '현자의 부적', effect: '스킬 성장에 필요한 사용 횟수 -1', isCursed: false, icon: '📿' },
  },
  {
    id: 'innkeeper_meg',
    name: '여관주인 메그',
    icon: '🍺',
    personality: '대지의 정령 반신. 지친 영혼을 따뜻하게 감싸는 모성적 존재. 소문을 잘 알고 적절한 조언을 해준다. 대화 속에서 자신이 정령임을 자연스럽게 드러낼 것.',
    baseDialogue: '한 잔 하겠어요? 이 어미가 얘기 들어드릴게요.',
    reunionLine: '어서 와요... 알아봤냐고요? 당신 영혼이 또 지쳐 보여서요. 이 어미가 모를 리 없죠.',
    favoriteItemTag: 'food',
    rewardKeyword: '위로',
    rewardRelic: { name: '영웅의 심장', effect: '최대 HP +20', isCursed: false, icon: '💎' },
  },
  {
    id: 'thief_shadow',
    name: '도둑 섀도우',
    icon: '🕵️',
    personality: '그림자 정령. 그림자를 통해 영혼을 읽는 불신하고 의심스러운 존재. 거래에는 공정하며 비밀 정보를 알고 있다. 대화 속에서 자신이 그림자 정령임을 자연스럽게 드러낼 것.',
    baseDialogue: '... 뭘 원해?',
    reunionLine: '...또야. 그림자가 같거든. 죽어도 그림자는 안 바뀐다고.',
    favoriteItemTag: 'herb',
    rewardKeyword: '비밀',
    rewardRelic: { name: '독사의 독니', effect: '전투 시 매 턴 적 HP -3 (독)', isCursed: false, icon: '🐍' },
  },
];

export interface NPCRelation {
  familiarity: number;
  meetCount: number;
  pendingStatEffect?: { stat: string; change: number };
  relicGiven?: boolean;
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
