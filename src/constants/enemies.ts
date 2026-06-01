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
    id: 'goblin', name: '고블린', tier: 'normal', trait: 'cunning',
    baseHp: 30, baseAtk: 12, baseDef: 3, initRage: 0, depthMin: 1,
    description: '날카로운 눈빛에 영리해 보이는 체형의 녀석이다.',
    openingLines: [
      '고블린이 킬킬거리며 주변을 살핀다. 무언가를 꾸미고 있는 것 같다.',
      '고블린이 이빨을 드러내며 앞뒤로 움직인다. 방심할 수 없다.',
    ],
  },
  {
    id: 'slime', name: '슬라임', tier: 'normal', trait: 'defensive',
    baseHp: 45, baseAtk: 8, baseDef: 8, initRage: 0, depthMin: 1,
    description: '반투명 젤리 같은 몸체가 느릿느릿 흔들린다.',
    openingLines: [
      '슬라임이 소리 없이 몸을 부풀리며 다가온다.',
      '슬라임이 바닥을 미끄러지듯 다가온다. 끈적한 기운이 느껴진다.',
    ],
  },
  {
    id: 'rat', name: '거대 쥐', tier: 'normal', trait: 'aggressive',
    baseHp: 25, baseAtk: 14, baseDef: 2, initRage: 15, depthMin: 1,
    description: '개만한 크기의 흉악한 쥐다. 날카로운 발톱이 번쩍인다.',
    openingLines: [
      '거대한 쥐가 잇새를 갈며 달려들 태세를 취한다.',
      '쥐가 귀를 납작하게 눕히며 앞발을 긁는다. 당장이라도 뛰어들 것 같다.',
    ],
  },
  {
    id: 'skeleton', name: '해골 전사', tier: 'normal', trait: 'aggressive',
    baseHp: 35, baseAtk: 13, baseDef: 5, initRage: 10, depthMin: 1,
    description: '녹슨 갑옷을 걸친 해골이 뼈 부딪히는 소리를 내며 서 있다.',
    openingLines: [
      '해골 전사가 텅 빈 눈구멍으로 당신을 바라본다. 공허한 살의가 느껴진다.',
      '뼈가 부딪히는 소리와 함께 해골이 무기를 치켜든다.',
    ],
  },
  {
    id: 'zombie', name: '좀비', tier: 'normal', trait: 'defensive',
    baseHp: 50, baseAtk: 11, baseDef: 7, initRage: 0, depthMin: 2,
    description: '생기 없는 눈으로 비틀거리며 다가오는 언데드다.',
    openingLines: [
      '좀비가 신음을 내뱉으며 두 팔을 뻗어 다가온다.',
      '썩은 냄새가 진동한다. 좀비가 느릿하지만 멈추지 않고 다가온다.',
    ],
  },
  {
    id: 'giant_spider', name: '독 거미', tier: 'normal', trait: 'cunning',
    baseHp: 28, baseAtk: 15, baseDef: 3, initRage: 0, depthMin: 2,
    description: '여덟 개의 눈이 어둠 속에서 빛난다. 독침이 번들거린다.',
    openingLines: [
      '독 거미가 천장에서 내려오며 독액을 뚝뚝 흘린다.',
      '거미가 무언가 실을 내뱉으며 움직임을 가린다. 조심해야 한다.',
    ],
  },
  {
    id: 'bandit', name: '산적', tier: 'normal', trait: 'cunning',
    baseHp: 40, baseAtk: 14, baseDef: 5, initRage: 0, depthMin: 3,
    description: '낡은 갑옷을 걸친 인간 도적이다. 눈빛이 교활하다.',
    openingLines: [
      '산적이 칼을 빙글빙글 돌리며 씩 웃는다. "지갑이나 목숨, 둘 중 하나만 내놔."',
      '산적이 뒤로 물러서며 허리춤의 단검을 빼든다.',
    ],
  },

  // ── Elite ──────────────────────────────────
  {
    id: 'goblin_chief', name: '고블린 대장', tier: 'elite', trait: 'cunning',
    baseHp: 75, baseAtk: 20, baseDef: 10, initRage: 0, depthMin: 3,
    description: '갑옷을 두른 고블린 우두머리다. 부하들의 함성이 메아리친다.',
    openingLines: [
      '고블린 대장이 배를 두드리며 웃는다. "겁쟁이 인간이 왔군!"',
      '고블린 대장이 전투 곤봉을 땅에 찍으며 포효한다.',
    ],
  },
  {
    id: 'dark_mage', name: '암흑 마법사', tier: 'elite', trait: 'cunning',
    baseHp: 60, baseAtk: 26, baseDef: 5, initRage: 0, depthMin: 4,
    description: '검은 로브로 얼굴을 가린 마법사다. 기이한 주문이 속삭인다.',
    openingLines: [
      '암흑 마법사가 양손을 펼치며 어둠의 마력을 끌어모은다.',
      '"흥미롭군... 네 영혼을 분석하겠다." 마법사의 눈이 붉게 빛난다.',
    ],
  },
  {
    id: 'bone_knight', name: '뼈 기사', tier: 'elite', trait: 'aggressive',
    baseHp: 90, baseAtk: 23, baseDef: 12, initRage: 20, depthMin: 4,
    description: '완전한 갑주를 걸친 해골 기사다. 죽음의 기운이 넘친다.',
    openingLines: [
      '뼈 기사가 검을 들어 올리며 무릎을 굽힌다. 살의가 폭발적으로 커진다.',
      '뼈 기사의 갑옷이 달그락거리며 전투 자세를 취한다.',
    ],
  },
  {
    id: 'troll', name: '트롤', tier: 'elite', trait: 'aggressive',
    baseHp: 110, baseAtk: 22, baseDef: 8, initRage: 10, depthMin: 5,
    description: '재생 능력을 가진 거대 괴물이다. 피부에 상처가 아물고 있다.',
    openingLines: [
      '트롤이 묵직한 주먹으로 가슴을 치며 으르렁댄다.',
      '트롤이 땅을 쿵쿵 밟으며 다가온다. 진동이 발바닥을 통해 전해진다.',
    ],
  },

  // ── Boss ──────────────────────────────────
  {
    id: 'dragon_spawn', name: '새끼 용', tier: 'boss', trait: 'aggressive',
    baseHp: 150, baseAtk: 32, baseDef: 14, initRage: 30, depthMin: 5,
    description: '비늘이 칼날처럼 날카롭다. 성체는 아니지만 충분히 위험하다.',
    openingLines: [
      '새끼 용이 날개를 펼치며 화염을 내뿜는다. 열기가 얼굴을 달군다.',
      '용의 황금빛 눈이 당신을 포식자의 시선으로 훑는다.',
    ],
  },
  {
    id: 'lich', name: '리치', tier: 'boss', trait: 'cunning',
    baseHp: 120, baseAtk: 38, baseDef: 8, initRage: 0, depthMin: 6,
    description: '수천 년을 살아온 불사의 마법사다. 말 하나하나에 마력이 실린다.',
    openingLines: [
      '"또 하나의 어리석은 모험가로군." 리치가 지팡이를 들어 올린다.',
      '리치의 해골이 빙글 돌아 당신을 정면으로 마주한다. 죽음의 기운이 방 전체를 압도한다.',
    ],
  },
  {
    id: 'death_knight', name: '죽음의 기사', tier: 'boss', trait: 'aggressive',
    baseHp: 180, baseAtk: 30, baseDef: 18, initRage: 20, depthMin: 7,
    description: '암흑의 힘으로 되살아난 전설의 기사다. 눈에서 검은 불꽃이 타오른다.',
    openingLines: [
      '죽음의 기사가 대검을 빼내며 허공을 베어낸다. "너의 죽음이 나의 영광이 되리."',
      '검은 갑옷이 울리며 기사가 걸음을 내딛는다. 발자국마다 바닥이 서리로 덮인다.',
    ],
  },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function pickEnemyTemplate(depth: number): EnemyTemplate {
  const tier = pickTier(depth);
  const pool = ENEMY_TEMPLATES.filter(e => e.tier === tier && e.depthMin <= depth);
  // 후보가 없으면 depthMin 무시
  const candidates = pool.length > 0 ? pool : ENEMY_TEMPLATES.filter(e => e.tier === tier);
  return pick(candidates);
}

export function pickTier(depth: number): EnemyTier {
  if (depth >= 8) {
    const r = Math.random();
    return r < 0.25 ? 'boss' : r < 0.55 ? 'elite' : 'normal';
  }
  if (depth >= 5) {
    const r = Math.random();
    return r < 0.12 ? 'boss' : r < 0.38 ? 'elite' : 'normal';
  }
  if (depth >= 3) {
    return Math.random() < 0.22 ? 'elite' : 'normal';
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
