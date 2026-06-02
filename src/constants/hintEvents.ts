import type { RoomWithResults } from '@/hooks/useClaude';

export type HintCategory = 'gem' | 'synergy' | 'npc_existence';

export interface HintEventChoice {
  text: string;
  icon: string;
  requiredSkill: { type: string; level: number } | null;
  successResult: string;
  successHpChange: number;
  successGoldChange: number;
  failResult: string;
  failHpChange: number;
  failGoldChange: number;
}

export interface HintEvent {
  id: string;
  category: HintCategory;
  minDepth: number;
  description: string;
  choices: HintEventChoice[];
}

export const HINT_EVENTS: HintEvent[] = [
  // ─── 보석 힌트 ────────────────────────────────
  {
    id: 'gem_hint_flame',
    category: 'gem',
    minDepth: 2,
    description: '그을린 돌벽에 전투의 흔적이 새겨져 있다. 무수한 영혼들의 싸움이 돌 위에 축적된 것만 같다. 가운데에는 붉게 빛나는 문양이 희미하게 남아있다.',
    choices: [
      {
        text: '문양의 의미를 해석한다',
        icon: '🧠',
        requiredSkill: { type: 'intelligence', level: 2 },
        successResult: '문양은 고대어로 새겨져 있다. "열 번의 피, 열 번의 각성. 붉은 빛은 전사의 증거." 전투의 반복이 무언가를 깨운다는 뜻인 듯하다.',
        successHpChange: 0,
        successGoldChange: 5,
        failResult: '문양이 너무 낡아 해독할 수 없었다.',
        failHpChange: 0,
        failGoldChange: 0,
      },
      {
        text: '그냥 지나친다',
        icon: '👣',
        requiredSkill: null,
        successResult: '전투의 흔적을 등 뒤로 하고 앞으로 나아갔다.',
        successHpChange: 0,
        successGoldChange: 0,
        failResult: '',
        failHpChange: 0,
        failGoldChange: 0,
      },
    ],
  },
  {
    id: 'gem_hint_water',
    category: 'gem',
    minDepth: 3,
    description: '벽에 물결 무늬가 새겨진 오래된 석판이 세워져 있다. 표면에서 차가운 기운이 느껴진다. 석판 아래쪽에 글자가 희미하게 보인다.',
    choices: [
      {
        text: '마법감지로 석판을 살핀다',
        icon: '✨',
        requiredSkill: { type: 'arcane', level: 1 },
        successResult: '빛바랜 글자가 읽힌다. "부유하는 자에게 빛을 주어라. 두 세계 사이에 선 존재가 길을 열리니." 유령... 그것과 대면해야 한다는 뜻인가.',
        successHpChange: 5,
        successGoldChange: 0,
        failResult: '석판에서 아무것도 느껴지지 않는다.',
        failHpChange: 0,
        failGoldChange: 0,
      },
      {
        text: '돌아선다',
        icon: '↩️',
        requiredSkill: null,
        successResult: '석판을 그냥 지나쳤다.',
        successHpChange: 0,
        successGoldChange: 0,
        failResult: '',
        failHpChange: 0,
        failGoldChange: 0,
      },
    ],
  },
  {
    id: 'gem_hint_light',
    category: 'gem',
    minDepth: 3,
    description: '부서진 제단 위에 먼지가 쌓인 일지가 놓여 있다. 표지에 "빛의 서약자가 기록함"이라고 쓰여 있다. 페이지 대부분은 해독 불가능하다.',
    choices: [
      {
        text: '일지를 정독한다',
        icon: '📖',
        requiredSkill: { type: 'intelligence', level: 2 },
        successResult: '"신이 사라진 후, 그의 빛을 가장 많이 받은 자가 보석을 깨울 수 있다. 이는 믿음을 쌓는 행위, 즉 오랜 인연을 맺는 것에서 시작된다." 던전 속 누군가와 신뢰를 쌓아야 한다는 뜻인가.',
        successHpChange: 0,
        successGoldChange: 8,
        failResult: '글자가 흐릿해 해독할 수 없었다.',
        failHpChange: 0,
        failGoldChange: 0,
      },
      {
        text: '일지를 덮는다',
        icon: '📕',
        requiredSkill: null,
        successResult: '일지를 그대로 두고 지나쳤다.',
        successHpChange: 0,
        successGoldChange: 0,
        failResult: '',
        failHpChange: 0,
        failGoldChange: 0,
      },
    ],
  },
  {
    id: 'gem_hint_dark',
    category: 'gem',
    minDepth: 4,
    description: '속삭이는 소리가 들린다. 어둠에서 나오는 것인지, 자신의 내면에서 나오는 것인지 알 수 없다. "협상... 협상... 말로 세상을 움직여라..."',
    choices: [
      {
        text: '어둠에 응답한다',
        icon: '🌑',
        requiredSkill: { type: 'negotiation', level: 1 },
        successResult: '속삭임이 또렷해진다. "서른 번의 말, 서른 번의 설득. 어둠은 힘이 아닌 언어를 원한다." 어둠의 보석은 협상의 기술로 얻는다는 것인가.',
        successHpChange: 5,
        successGoldChange: 0,
        failResult: '응답하려 했으나 속삭임이 멈춰버렸다.',
        failHpChange: 0,
        failGoldChange: 0,
      },
      {
        text: '무시하고 지나친다',
        icon: '🚶',
        requiredSkill: null,
        successResult: '속삭임을 뒤로하고 걸음을 옮겼다.',
        successHpChange: 0,
        successGoldChange: 0,
        failResult: '',
        failHpChange: 0,
        failGoldChange: 0,
      },
    ],
  },
  {
    id: 'gem_hint_earth',
    category: 'gem',
    minDepth: 4,
    description: '바닥에 크고 낡은 지도 조각이 놓여 있다. 무수히 많은 통로와 방이 그려져 있고, 가운데에는 "대지는 완주에서 태어난다"는 문구가 새겨져 있다.',
    choices: [
      {
        text: '지도를 분석한다',
        icon: '🗺️',
        requiredSkill: { type: 'intelligence', level: 1 },
        successResult: '출구 근처에 갈색 별표가 찍혀 있다. "완전히 통과한 자에게 대지가 응한다." 던전의 끝에 도달해야 한다는 뜻이다.',
        successHpChange: 0,
        successGoldChange: 0,
        failResult: '지도가 너무 오래되어 읽을 수 없었다.',
        failHpChange: 0,
        failGoldChange: 0,
      },
      {
        text: '지도를 챙긴다',
        icon: '🎒',
        requiredSkill: null,
        successResult: '쓸모 없어 보이지만 지도를 챙겼다. 동전 몇 개가 지도 아래 깔려 있었다.',
        successHpChange: 0,
        successGoldChange: 3,
        failResult: '',
        failHpChange: 0,
        failGoldChange: 0,
      },
    ],
  },

  // ─── 유물·시너지 힌트 ──────────────────────────
  {
    id: 'synergy_hint_blood',
    category: 'synergy',
    minDepth: 3,
    description: '오래된 무기 제련 기록이 벽에 박혀 있다. "전사의 각인이 심장을 만난다면..."이라는 구절이 눈에 띈다.',
    choices: [
      {
        text: '마법감지로 기록을 읽는다',
        icon: '✨',
        requiredSkill: { type: 'arcane', level: 2 },
        successResult: '"피의 검과 영웅의 심장이 하나가 될 때, 상처가 곧 전투력이 된다. 고통이 적을 찌르는 칼날이 되리라." 두 유물이 함께할 때 특별한 힘이 깨어나는 것 같다.',
        successHpChange: 0,
        successGoldChange: 0,
        failResult: '마법이 너무 희미해 해독에 실패했다.',
        failHpChange: 0,
        failGoldChange: 0,
      },
      {
        text: '그냥 지나친다',
        icon: '👣',
        requiredSkill: null,
        successResult: '기록을 뒤로하고 지나쳤다.',
        successHpChange: 0,
        successGoldChange: 0,
        failResult: '',
        failHpChange: 0,
        failGoldChange: 0,
      },
    ],
  },
  {
    id: 'synergy_hint_chaos',
    category: 'synergy',
    minDepth: 4,
    description: '유리 파편 위에 눈알 그림이 그려진 이상한 낙서가 있다. 그 아래 "광기와 우둔함이 만나면 세상이 뒤집힌다"고 쓰여 있다.',
    choices: [
      {
        text: '낙서를 분석한다',
        icon: '🧠',
        requiredSkill: { type: 'intelligence', level: 2 },
        successResult: '"광기의 눈과 바보의 돌이 함께라면, 지식은 무질서를 낳고 무질서는 폭력이 된다." 저주받은 유물들의 조합이 뭔가를 깨운다는 것인가.',
        successHpChange: 0,
        successGoldChange: 0,
        failResult: '낙서가 난해해 이해할 수 없었다.',
        failHpChange: 0,
        failGoldChange: 0,
      },
      {
        text: '무시한다',
        icon: '↩️',
        requiredSkill: null,
        successResult: '낙서를 무시하고 지나쳤다.',
        successHpChange: 0,
        successGoldChange: 0,
        failResult: '',
        failHpChange: 0,
        failGoldChange: 0,
      },
    ],
  },
  {
    id: 'synergy_hint_shadow',
    category: 'synergy',
    minDepth: 3,
    description: '그림자가 짙은 구석에 낡은 두루마리가 숨겨져 있다. 없는 것처럼 보였지만, 어둠 속 무언가가 시선을 끌었다.',
    choices: [
      {
        text: '조용히 접근해 살핀다',
        icon: '👁️',
        requiredSkill: { type: 'stealth', level: 2 },
        successResult: '"망토가 고독을 감싸고, 부적이 고독을 지식으로 바꾼다. 둘이 만날 때, 고독은 방패가 된다." 은신과 지식이 함께할 때 더 강해진다는 것인가.',
        successHpChange: 0,
        successGoldChange: 0,
        failResult: '발소리를 내고 말았다. 두루마리가 어둠 속으로 사라져버렸다.',
        failHpChange: 0,
        failGoldChange: 0,
      },
      {
        text: '그냥 지나친다',
        icon: '👣',
        requiredSkill: null,
        successResult: '구석의 그림자를 무시하고 지나쳤다.',
        successHpChange: 0,
        successGoldChange: 0,
        failResult: '',
        failHpChange: 0,
        failGoldChange: 0,
      },
    ],
  },
  {
    id: 'synergy_hint_iron',
    category: 'synergy',
    minDepth: 4,
    description: '철제 방패 모양의 부조가 벽에 새겨져 있다. "심장과 반지가 함께라면 방벽이 반격이 된다"는 문구가 또렷하다.',
    choices: [
      {
        text: '부조를 만져본다',
        icon: '💪',
        requiredSkill: { type: 'strength', level: 2 },
        successResult: '손가락 끝에서 진동이 느껴진다. "영웅의 심장과 전사의 반지가 한 몸이 될 때, 방어는 공격이 되고 모든 것이 강해진다." 두 유물 조합의 힘을 몸으로 느꼈다.',
        successHpChange: 10,
        successGoldChange: 0,
        failResult: '부조에서 아무 반응이 없었다.',
        failHpChange: 0,
        failGoldChange: 0,
      },
      {
        text: '그냥 지나친다',
        icon: '👣',
        requiredSkill: null,
        successResult: '부조를 뒤로하고 지나쳤다.',
        successHpChange: 0,
        successGoldChange: 0,
        failResult: '',
        failHpChange: 0,
        failGoldChange: 0,
      },
    ],
  },

  // ─── NPC 존재 암시 ─────────────────────────────
  {
    id: 'npc_hint_footprint',
    category: 'npc_existence',
    minDepth: 2,
    description: '먼지 위에 선명한 발자국이 찍혀 있다. 사람의 것 같기도 하지만, 너무 규칙적이고 균일하다. 마치 인간 흉내를 내는 존재의 흔적 같다.',
    choices: [
      {
        text: '조용히 발자국을 따라간다',
        icon: '👣',
        requiredSkill: { type: 'stealth', level: 1 },
        successResult: '발자국은 벽 앞에서 갑자기 사라진다. 벽에 손을 대니 약한 마법의 잔재가 느껴진다. 이 던전 어딘가에 정체를 숨긴 존재가 있다.',
        successHpChange: 5,
        successGoldChange: 0,
        failResult: '발자국을 쫓다가 방향을 잃었다. 돌아오는 데 시간이 걸렸다.',
        failHpChange: 0,
        failGoldChange: -3,
      },
      {
        text: '발자국을 무시한다',
        icon: '↩️',
        requiredSkill: null,
        successResult: '발자국을 그냥 지나쳤다.',
        successHpChange: 0,
        successGoldChange: 0,
        failResult: '',
        failHpChange: 0,
        failGoldChange: 0,
      },
    ],
  },
  {
    id: 'npc_hint_whisper',
    category: 'npc_existence',
    minDepth: 3,
    description: '벽 저편에서 낮고 조용한 목소리가 들린다. 상인의 목소리 같기도 하고, 대장장이의 목소리 같기도 하다. 하지만 분명 사람의 것은 아니다.',
    choices: [
      {
        text: '목소리에 말을 건다',
        icon: '🗣️',
        requiredSkill: { type: 'negotiation', level: 1 },
        successResult: '목소리가 잠시 멈추더니 말한다. "...알아챘군요. 우리는 여기에 오래 머물고 있지. 신이 사라진 후부터, 언젠가 돌아오길 기다리며." 목소리가 사라진다.',
        successHpChange: 0,
        successGoldChange: 10,
        failResult: '목소리가 멈추더니 다시는 들리지 않는다.',
        failHpChange: 0,
        failGoldChange: 0,
      },
      {
        text: '무시한다',
        icon: '🚶',
        requiredSkill: null,
        successResult: '목소리를 무시하고 지나쳤다.',
        successHpChange: 0,
        successGoldChange: 0,
        failResult: '',
        failHpChange: 0,
        failGoldChange: 0,
      },
    ],
  },
  {
    id: 'npc_hint_altar',
    category: 'npc_existence',
    minDepth: 2,
    description: '부서진 제단 위에 누군가 최근에 다녀간 흔적이 있다. 신선한 촛불 왁스와 희미한 향기. 하지만 이 층에 다른 모험가가 있을 리 없다.',
    choices: [
      {
        text: '제단을 청소하고 살핀다',
        icon: '💪',
        requiredSkill: { type: 'strength', level: 1 },
        successResult: '제단을 정리하니 밑에 작은 메모가 있다. "이곳을 지나는 자여, 던전의 거주민들을 두려워 말라. 진심으로 대하라." 메모 밑에 낡은 금화가 있었다.',
        successHpChange: 0,
        successGoldChange: 12,
        failResult: '제단이 생각보다 무거워 치우지 못했다.',
        failHpChange: 0,
        failGoldChange: 0,
      },
      {
        text: '제단을 건드리지 않는다',
        icon: '↩️',
        requiredSkill: null,
        successResult: '제단을 그냥 지나쳤다.',
        successHpChange: 0,
        successGoldChange: 0,
        failResult: '',
        failHpChange: 0,
        failGoldChange: 0,
      },
    ],
  },
];

// ─── 폴백 방 (API 실패 시 다양하게 표시) ──────────
export const FALLBACK_ROOMS: RoomWithResults[] = [
  {
    description: '오래된 석조 복도를 걷는다. 횃불이 꺼져 어둠만이 남아있다.',
    choices: [
      { text: '어둠 속을 조심스럽게 나아간다', icon: '👣', classOnly: null, requiredSkill: null, result: '천천히 발걸음을 옮겼다. 별다른 일은 없었다.', hpChange: 0, goldChange: 0, skillChange: null, newRelic: null, isDead: false, deathCause: null, storyFlagSet: null, personaReaction: 'neutral' },
      { text: '잠시 기다리며 눈을 적응시킨다', icon: '👁️', classOnly: null, requiredSkill: null, result: '어둠에 눈이 익숙해졌다. 동전 몇 개가 바닥에 떨어져 있었다.', hpChange: 0, goldChange: 4, skillChange: null, newRelic: null, isDead: false, deathCause: null, storyFlagSet: null, personaReaction: 'neutral' },
    ],
  },
  {
    description: '좁은 통로가 나온다. 천장에서 물방울이 떨어지는 소리가 규칙적으로 들린다.',
    choices: [
      { text: '빠르게 통과한다', icon: '💨', classOnly: null, requiredSkill: null, result: '통로를 빠르게 지나쳤다. 이상한 기운은 없었다.', hpChange: 0, goldChange: 0, skillChange: null, newRelic: null, isDead: false, deathCause: null, storyFlagSet: null, personaReaction: 'neutral' },
      { text: '물소리를 따라가 본다', icon: '💧', classOnly: null, requiredSkill: null, result: '작은 지하 샘을 발견했다. 물을 마시니 피로가 조금 풀린다.', hpChange: 8, goldChange: 0, skillChange: null, newRelic: null, isDead: false, deathCause: null, storyFlagSet: null, personaReaction: 'neutral' },
    ],
  },
  {
    description: '무너진 방 잔해 사이에 낡은 가방이 걸려 있다. 오래전 누군가가 두고 간 것 같다.',
    choices: [
      { text: '가방을 뒤진다', icon: '🎒', classOnly: null, requiredSkill: null, result: '가방 안에서 동전 몇 개와 낡은 천 조각이 나왔다.', hpChange: 0, goldChange: 7, skillChange: null, newRelic: null, isDead: false, deathCause: null, storyFlagSet: null, personaReaction: 'neutral' },
      { text: '건드리지 않고 지나친다', icon: '👣', classOnly: null, requiredSkill: null, result: '남의 물건에 손대지 않고 지나쳤다.', hpChange: 0, goldChange: 0, skillChange: null, newRelic: null, isDead: false, deathCause: null, storyFlagSet: null, personaReaction: 'neutral' },
    ],
  },
  {
    description: '넓은 홀에 오래된 제단 흔적이 남아 있다. 신상은 부서져 있고, 향로만 쓸쓸히 남았다.',
    choices: [
      { text: '향로 앞에 잠시 고개를 숙인다', icon: '🙏', classOnly: null, requiredSkill: null, result: '이유를 알 수 없지만 마음이 조금 편안해졌다. HP가 약간 회복된다.', hpChange: 6, goldChange: 0, skillChange: null, newRelic: null, isDead: false, deathCause: null, storyFlagSet: null, personaReaction: 'neutral' },
      { text: '향로를 살펴본다', icon: '🔍', classOnly: null, requiredSkill: null, result: '향로 아래에 동전이 몇 개 있었다.', hpChange: 0, goldChange: 5, skillChange: null, newRelic: null, isDead: false, deathCause: null, storyFlagSet: null, personaReaction: 'neutral' },
    ],
  },
  {
    description: '벽에 낡은 그림이 그려져 있다. 사람들이 무언가 빛나는 것을 바라보는 장면이다. 색이 바랬지만 경외감이 느껴진다.',
    choices: [
      { text: '그림을 자세히 들여다본다', icon: '🖼️', classOnly: null, requiredSkill: null, result: '그림 속 빛나는 것이 보석처럼 보인다. 여섯 개. 무언가 중요한 것이라는 느낌이 든다.', hpChange: 0, goldChange: 0, skillChange: null, newRelic: null, isDead: false, deathCause: null, storyFlagSet: null, personaReaction: 'neutral' },
      { text: '지나친다', icon: '👣', classOnly: null, requiredSkill: null, result: '그림을 뒤로하고 걸음을 옮겼다.', hpChange: 0, goldChange: 0, skillChange: null, newRelic: null, isDead: false, deathCause: null, storyFlagSet: null, personaReaction: 'neutral' },
    ],
  },
];

// ─── 힌트 이벤트 선택기 ───────────────────────────
export function pickHintEvent(
  seenIds: string[],
  depth: number,
): HintEvent | null {
  const available = HINT_EVENTS.filter(
    (e) => e.minDepth <= depth && !seenIds.includes(e.id),
  );
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

// ─── HintEvent → RoomWithResults 변환 ─────────────
export function adaptHintEventToRoom(
  event: HintEvent,
  skills: Record<string, number>,
): RoomWithResults {
  return {
    description: event.description,
    choices: event.choices.map((c) => {
      const skillOk =
        !c.requiredSkill ||
        (skills[c.requiredSkill.type] ?? 0) >= c.requiredSkill.level;

      return {
        text: c.text,
        icon: c.icon,
        classOnly: null,
        requiredSkill: c.requiredSkill
          ? { type: c.requiredSkill.type as never, level: c.requiredSkill.level }
          : null,
        result: skillOk ? c.successResult : c.failResult,
        hpChange: skillOk ? c.successHpChange : c.failHpChange,
        goldChange: skillOk ? c.successGoldChange : c.failGoldChange,
        skillChange: null,
        newRelic: null,
        isDead: false,
        deathCause: null,
        storyFlagSet: null,
        personaReaction: 'neutral' as const,
      };
    }),
  };
}
