import type { Relic } from './relics';

export interface RelicSynergy {
  id: string;
  name: string;
  description: string;
  icon: string;
  displayEffect: string;
  requiredRelicNames?: string[];  // 모두 보유해야 활성화
  minCursedCount?: number;        // 저주 유물 최소 N개 보유
  statBonus?: {
    hp?: number;
    maxHp?: number;
    atk?: number;
    def?: number;
    gold?: number;
  };
}

export const RELIC_SYNERGIES: RelicSynergy[] = [
  {
    id: 'blood_pact',
    name: '피의 계약',
    icon: '🩸',
    description: '상처가 힘이 된다.',
    displayEffect: 'ATK +8 / 전투 시작 시 잃은 HP만큼 추가 공격력',
    requiredRelicNames: ['피의 검', '영웅의 심장'],
    statBonus: { atk: 8 },
  },
  {
    id: 'avatar_of_greed',
    name: '탐욕의 화신',
    icon: '💰',
    description: '황금이 전부다.',
    displayEffect: '즉시 골드 +30 / 최대 HP -15',
    requiredRelicNames: ['탐욕의 코인', '행운의 동전'],
    statBonus: { gold: 30, maxHp: -15 },
  },
  {
    id: 'total_chaos',
    name: '완전한 혼돈',
    icon: '🌀',
    description: '지식이 혼돈을 낳는다.',
    displayEffect: 'ATK +8 / 선택지 결과 예측 불가',
    requiredRelicNames: ['광기의 눈', '바보의 돌'],
    statBonus: { atk: 8 },
  },
  {
    id: 'shadow_scholar',
    name: '그림자 학자',
    icon: '🌑',
    description: '고독 속에서 깊어진다.',
    displayEffect: 'DEF +5 / 은신 관련 선택지 성공률 대폭 상승',
    requiredRelicNames: ['고독의 망토', '현자의 부적'],
    statBonus: { def: 5 },
  },
  {
    id: 'curse_complete',
    name: '저주의 완성',
    icon: '☠️',
    description: '저주가 저주를 먹는다.',
    displayEffect: 'ATK +10 / 최대 HP -20 / 저주들이 하나의 힘으로 합쳐진다',
    minCursedCount: 3,
    statBonus: { atk: 10, maxHp: -20 },
  },
  {
    id: 'war_god_blessing',
    name: '전쟁신의 가호',
    icon: '⚔️',
    description: '전투가 곧 치유다.',
    displayEffect: 'ATK +5 / 전투 승리마다 HP +8 회복',
    requiredRelicNames: ['피의 검', '전사의 반지'],
    statBonus: { atk: 5 },
  },
  {
    id: 'lucky_venom',
    name: '행운의 독',
    icon: '🐍',
    description: '고통이 황금이 된다.',
    displayEffect: '즉시 골드 +20 / 독 피해를 줄 때마다 골드 +3',
    requiredRelicNames: ['독사의 독니', '행운의 동전'],
    statBonus: { gold: 20 },
  },
  {
    id: 'iron_hero',
    name: '철벽의 영웅',
    icon: '🛡️',
    description: '방어가 곧 공격이다.',
    displayEffect: 'DEF +5 / HP +20 / 방어 행동 시 반격 데미지 +5',
    requiredRelicNames: ['영웅의 심장', '전사의 반지'],
    statBonus: { def: 5, hp: 20 },
  },
];

export function getActiveSynergies(relics: Relic[]): RelicSynergy[] {
  const names = new Set(relics.map(r => r.name));
  const cursedCount = relics.filter(r => r.isCursed).length;

  return RELIC_SYNERGIES.filter(syn => {
    if (syn.minCursedCount !== undefined && cursedCount < syn.minCursedCount) return false;
    if (syn.requiredRelicNames && !syn.requiredRelicNames.every(n => names.has(n))) return false;
    return true;
  });
}

export function getNewlyActivatedSynergies(
  prevRelics: Relic[],
  nextRelics: Relic[],
): RelicSynergy[] {
  const prev = new Set(getActiveSynergies(prevRelics).map(s => s.id));
  return getActiveSynergies(nextRelics).filter(s => !prev.has(s.id));
}
