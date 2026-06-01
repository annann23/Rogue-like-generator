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
