export type PersonaTraitType =
  | 'reckless'
  | 'cowardly'
  | 'greedy'
  | 'righteous'
  | 'cynical'
  | 'naive'
  | 'vengeful';

export const PERSONA_TRAITS: Record<
  PersonaTraitType,
  { name: string; icon: string; bonusKeywords: string[]; penaltyKeywords: string[] }
> = {
  reckless:  { name: '무모한',       icon: '⚡', bonusKeywords: ['돌진', '공격', '뛰어든다', '싸운다'],    penaltyKeywords: ['숨다', '도망', '협상', '조용히'] },
  cowardly:  { name: '소심한',       icon: '🌀', bonusKeywords: ['피한다', '관찰', '도망', '협상'],        penaltyKeywords: ['돌진', '공격', '도박', '싸운다'] },
  greedy:    { name: '탐욕스러운',   icon: '💰', bonusKeywords: ['훔친다', '흥정', '가져간다', '도박'],    penaltyKeywords: ['포기', '나눈다', '희생'] },
  righteous: { name: '정의로운',     icon: '⚖️', bonusKeywords: ['돕는다', '구한다', '보호'],             penaltyKeywords: ['배신', '악마와', '협박'] },
  cynical:   { name: '냉소적',       icon: '🗿', bonusKeywords: ['의심', '배신', '간파', '이용'],         penaltyKeywords: ['믿는다', '신뢰', '따른다'] },
  naive:     { name: '순진한',       icon: '🌸', bonusKeywords: ['믿는다', '탐색', '호기심', '다가간다'], penaltyKeywords: ['배신', '이용', '협박'] },
  vengeful:  { name: '복수심 강한',  icon: '🩸', bonusKeywords: ['복수', '위협', '압박', '응징'],         penaltyKeywords: ['용서', '무시', '포기'] },
};

export const FLAGS = {
  PACT_WITH_DEMON:      'pact_with_demon',
  DEMON_DEBT:           'demon_debt',
  STOLE_KING_RING:      'stole_king_ring',
  BETRAYED_ALLY:        'betrayed_ally',
  CURSED_BLOOD:         'cursed_blood',
  ATE_FORBIDDEN_FRUIT:  'ate_forbidden_fruit',
  GOD_DEFIED:           'god_defied',
  DRAGON_DEBT:          'dragon_debt',
  MARKED_BY_ABYSS:      'marked_by_abyss',
  SAVED_CHILD:          'saved_child',
  CONSUMED_SOUL:        'consumed_soul',
  ANCIENT_CURSE_LIFTED: 'ancient_curse_lifted',
  NECROMANCER_TAUGHT:   'necromancer_taught',
  TWIN_SOUL_MET:        'twin_soul_met',
  WORLD_PILLAR_BROKEN:  'world_pillar_broken',
  FIRST_KILL_MERCY:     'first_kill_mercy',
} as const;

// Claude에게 주입할 플래그별 맥락 설명 (1줄, 토큰 최소화)
export const FLAG_CONTEXT: Record<string, string> = {
  [FLAGS.PACT_WITH_DEMON]:      '악마와 계약 체결. 어두운/욕망적 선택에 악마의 조력 암시 가능.',
  [FLAGS.STOLE_KING_RING]:      '왕의 반지 절도. 귀족/권위 NPC가 이 영혼을 경계함.',
  [FLAGS.BETRAYED_ALLY]:        '동료 배신 전력. NPC들이 은근히 경계하거나 낙인을 언급할 수 있음.',
  [FLAGS.CURSED_BLOOD]:         '자신의 피로 봉인 해제. 희생 선택에 저주의 공명 암시 가능.',
  [FLAGS.ATE_FORBIDDEN_FRUIT]:  '금단의 열매 섭취. 가끔 환각/왜곡된 인식이 묘사에 섞일 수 있음.',
  [FLAGS.GOD_DEFIED]:           '신의 제단 파괴. 성스러운 존재 적대, 어두운 존재 호의적.',
  [FLAGS.DRAGON_DEBT]:          '용의 보물 절도. 골드 관련 선택에 용의 저주 암시 가능.',
  [FLAGS.MARKED_BY_ABYSS]:      '심연의 낙인. 어두운 선택에서 특별한 기회, 유령 관련 묘사 강화.',
  [FLAGS.SAVED_CHILD]:          '희생으로 아이 구출. 보호/희생 선택에 어린 영혼의 가호 암시 가능.',
  [FLAGS.CONSUMED_SOUL]:        '영혼 흡수 경험. 주변 존재들이 이 영혼의 공허함을 눈치챌 수 있음.',
  [FLAGS.ANCIENT_CURSE_LIFTED]: '고대 저주 해제. 저주받은 자들의 감사가 이어질 수 있음.',
  [FLAGS.NECROMANCER_TAUGHT]:   '네크로맨서 비법 전수. 망자/시체 관련 선택지가 열림.',
  [FLAGS.TWIN_SOUL_MET]:        '나를 닮은 유령과 만남. 유령/망자 이벤트에 특별한 연결감.',
  [FLAGS.WORLD_PILLAR_BROKEN]:  '세계의 기둥 파괴. 방 묘사가 더 황폐하고 종말론적 톤으로.',
  [FLAGS.FIRST_KILL_MERCY]:     '첫 전투에서 적을 살려줌. 자비로운 선택에 과거 자비의 보상 암시 가능.',
};
