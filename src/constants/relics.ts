export interface Relic {
  name: string;
  effect: string;
  isCursed: boolean;
  icon: string;
}

export const CURSED_RELICS: Relic[] = [
  {
    name: '피의 검',
    effect: 'ATK +5 / 매 방 HP -3',
    isCursed: true,
    icon: '🗿',
  },
  {
    name: '탐욕의 코인',
    effect: '골드 2배 / 상점 가격 2배',
    isCursed: true,
    icon: '🗿',
  },
  {
    name: '광기의 눈',
    effect: '선택지 +1 / 결과 랜덤성 증가',
    isCursed: true,
    icon: '🗿',
  },
  {
    name: '바보의 돌',
    effect: '모든 스킬 +2 / 지능 0 고정',
    isCursed: true,
    icon: '🗿',
  },
  {
    name: '고독의 망토',
    effect: '은신 +3 / NPC 친밀도 상승 불가',
    isCursed: true,
    icon: '🗿',
  },
];

// 전투 승리 시 드롭될 수 있는 고정 비저주 렐릭
export const FIXED_RELICS: Relic[] = [
  { name: '영웅의 심장', effect: '최대 HP +20',                    isCursed: false, icon: '💎' },
  { name: '독사의 독니', effect: '전투 시 매 턴 적 HP -3 (독)',   isCursed: false, icon: '🐍' },
  { name: '행운의 동전', effect: '골드 획득량 +30%',               isCursed: false, icon: '🪙' },
  { name: '전사의 반지', effect: 'ATK +3, 전투 승리 시 HP +5',    isCursed: false, icon: '💍' },
  { name: '현자의 부적', effect: '스킬 성장에 필요한 사용 횟수 -1', isCursed: false, icon: '📿' },
];
