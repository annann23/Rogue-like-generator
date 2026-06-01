export type EnemyTrait = 'aggressive' | 'cunning' | 'defensive';
export type EnemyTier = 'normal' | 'elite' | 'boss';

export interface EnemyTemplate {
  id: string;
  name: string;
  tier: EnemyTier;
  trait: EnemyTrait;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  initRage: number;
  depthMin: number;
  description: string;
  openingLines: string[];
}

export const ENEMY_TEMPLATES: EnemyTemplate[] = [
  // ── Normal ──────────────────────────────────
  {
    id: 'bat', name: '박쥐', tier: 'normal', trait: 'aggressive',
    baseHp: 22, baseAtk: 11, baseDef: 2, initRage: 10, depthMin: 1,
    description: '날카로운 발톱과 날카로운 초음파로 공격하는 동굴 박쥐다.',
    openingLines: [
      '박쥐 떼가 어둠 속에서 날아오른다. 날개 소리가 귀를 찌른다.',
      '천장에 매달려 있던 박쥐가 급강하한다!',
    ],
  },
  {
    id: 'field_rat', name: '들쥐', tier: 'normal', trait: 'cunning',
    baseHp: 20, baseAtk: 10, baseDef: 2, initRage: 0, depthMin: 1,
    description: '빠르고 교활한 들쥐다. 틈만 나면 물어뜯는다.',
    openingLines: [
      '들쥐가 주변을 재빠르게 살피며 접근한다.',
      '끼익! 들쥐가 이빨을 드러내며 달려든다.',
    ],
  },
  {
    id: 'cave_rat', name: '동굴쥐', tier: 'normal', trait: 'defensive',
    baseHp: 28, baseAtk: 9, baseDef: 5, initRage: 0, depthMin: 2,
    description: '두꺼운 가죽을 가진 동굴 서식 쥐다. 느리지만 질기다.',
    openingLines: [
      '거대한 동굴쥐가 으르렁거리며 등줄기를 곤두세운다.',
      '동굴쥐가 코를 씰룩이며 발을 긁는다. 공격할 틈을 노리는 것 같다.',
    ],
  },
  {
    id: 'spider', name: '거미', tier: 'normal', trait: 'cunning',
    baseHp: 25, baseAtk: 13, baseDef: 3, initRage: 0, depthMin: 2,
    description: '여덟 개의 눈이 어둠 속에서 빛난다. 거미줄로 움직임을 제한한다.',
    openingLines: [
      '천장에서 거미줄을 타고 내려온다. 독액이 뚝뚝 떨어진다.',
      '거미가 실을 내뿜으며 포위망을 친다. 조심해야 한다.',
    ],
  },

  // ── Elite ──────────────────────────────────
  {
    id: 'scorpion', name: '전갈', tier: 'elite', trait: 'aggressive',
    baseHp: 65, baseAtk: 22, baseDef: 8, initRage: 15, depthMin: 3,
    description: '강렬한 독침을 가진 거대 전갈이다. 꼬리 하나에 치명적인 독이 담겨 있다.',
    openingLines: [
      '전갈이 독침을 높이 치켜들며 집게발을 딱딱거린다.',
      '거대한 꼬리가 공기를 가르며 낙하한다. 독이 튄다!',
    ],
  },
  {
    id: 'ghost', name: '유령', tier: 'elite', trait: 'cunning',
    baseHp: 55, baseAtk: 20, baseDef: 12, initRage: 0, depthMin: 3,
    description: '실체 없이 떠다니는 망령이다. 물리 공격이 잘 통하지 않는다.',
    openingLines: [
      '차가운 기운과 함께 희뿌연 형체가 나타난다. 공기가 얼어붙는다.',
      '"...살아있는 자여, 돌아가라." 유령의 목소리가 머릿속을 울린다.',
    ],
  },
  {
    id: 'mimic', name: '미믹', tier: 'elite', trait: 'cunning',
    baseHp: 80, baseAtk: 25, baseDef: 10, initRage: 0, depthMin: 4,
    description: '보물 상자로 위장한 괴물이다. 뚜껑이 열리는 순간 날카로운 이빨이 드러난다.',
    openingLines: [
      '상자가 갑자기 덜컹거리더니... 뚜껑이 열리며 이빨을 드러낸다!',
      '무심코 가까이 다가간 순간, 상자가 살아있음을 깨달았다!',
    ],
  },

  // ── Boss ──────────────────────────────────
  {
    id: 'cyclops', name: '키클롭스', tier: 'boss', trait: 'aggressive',
    baseHp: 140, baseAtk: 30, baseDef: 12, initRage: 25, depthMin: 5,
    description: '하나뿐인 거대한 눈이 빛난다. 압도적인 힘으로 주변을 파괴한다.',
    openingLines: [
      '대지가 흔들린다. 키클롭스의 거대한 발걸음이 동굴을 진동시킨다.',
      '외눈이 당신을 포착한다. 거인이 으르렁거리며 팔을 치켜든다.',
    ],
  },
  {
    id: 'golem', name: '석골렘', tier: 'boss', trait: 'defensive',
    baseHp: 170, baseAtk: 28, baseDef: 20, initRage: 0, depthMin: 6,
    description: '고대 마법으로 움직이는 돌 거인이다. 균열 사이로 붉은 마력이 새어나온다.',
    openingLines: [
      '돌이 부딪히는 굉음과 함께 석골렘이 깨어난다. 붉은 눈이 번쩍인다.',
      '"침입자... 제거." 석골렘이 돌벽을 부수며 앞으로 걸어 나온다.',
    ],
  },
  {
    id: 'dragon', name: '용', tier: 'boss', trait: 'aggressive',
    baseHp: 200, baseAtk: 36, baseDef: 15, initRage: 30, depthMin: 7,
    description: '불꽃을 내뿜는 전설의 용이다. 한 번의 날개짓으로 폭풍이 인다.',
    openingLines: [
      '용이 날개를 펼치며 화염을 내뿜는다. 열기가 얼굴을 달군다.',
      '"감히 내 영역을 침범하다니." 용의 황금빛 눈이 당신을 노린다.',
    ],
  },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function pickEnemyTemplate(depth: number): EnemyTemplate {
  const tier = pickTier(depth);
  const pool = ENEMY_TEMPLATES.filter(e => e.tier === tier && e.depthMin <= depth);
  const candidates = pool.length > 0 ? pool : ENEMY_TEMPLATES.filter(e => e.tier === tier);
  return pick(candidates);
}

export function pickTier(depth: number): EnemyTier {
  if (depth >= 8) {
    const r = Math.random();
    return r < 0.30 ? 'boss' : r < 0.60 ? 'elite' : 'normal';
  }
  if (depth >= 5) {
    const r = Math.random();
    return r < 0.15 ? 'boss' : r < 0.40 ? 'elite' : 'normal';
  }
  if (depth >= 3) {
    return Math.random() < 0.25 ? 'elite' : 'normal';
  }
  return 'normal';
}

export function scaleStats(template: EnemyTemplate, depth: number) {
  const s = 1 + depth * 0.12;
  return {
    hp:         Math.round(template.baseHp  * s),
    atk:        Math.round(template.baseAtk * s),
    def:        Math.round(template.baseDef * s),
    rewardGold: template.baseHp + depth * 6 + Math.floor(Math.random() * depth * 4),
    maxTurns:   template.tier === 'boss' ? 8 : template.tier === 'elite' ? 6 : 4,
  };
}

export type IntentType = 'attack' | 'defend' | 'buff' | 'special' | 'unknown';

const INTENT_POOLS: Record<EnemyTrait, Array<{ type: IntentType; description: string }>> = {
  aggressive: [
    { type: 'attack',  description: '강하게 치고 들어올 것 같다' },
    { type: 'attack',  description: '전력으로 공격할 태세다' },
    { type: 'special', description: '무언가 강한 기술을 준비하는 것 같다' },
    { type: 'buff',    description: '분노를 끌어모아 힘을 높이고 있다' },
  ],
  cunning: [
    { type: 'unknown', description: '의도를 알 수 없다' },
    { type: 'unknown', description: '무언가를 꾸미고 있는 것 같다' },
    { type: 'attack',  description: '허를 찌를 준비를 하는 것 같다' },
    { type: 'special', description: '기묘한 기운이 느껴진다' },
  ],
  defensive: [
    { type: 'defend',  description: '방어 자세를 취하고 있다' },
    { type: 'attack',  description: '느리지만 묵직한 공격이 올 것 같다' },
    { type: 'buff',    description: '몸을 강화하는 것 같다' },
    { type: 'defend',  description: '반격을 노리며 웅크리고 있다' },
  ],
};

export function pickIntent(trait: EnemyTrait): { type: IntentType; description: string; isRevealed: boolean } {
  return { ...pick(INTENT_POOLS[trait]), isRevealed: false };
}
