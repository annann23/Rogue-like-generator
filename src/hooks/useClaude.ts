import { env } from "@/env";

const MODEL = "claude-sonnet-4-6";
const API_URL = "https://api.anthropic.com/v1/messages";

// ─── fetch 래퍼 ──────────────────────────────
async function claudeFetch(
  messages: { role: string; content: string }[],
  maxTokens = 1024,
): Promise<string> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "x-api-key": env.VITE_ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API 오류 (${res.status}): ${err}`);
  }

  const data = (await res.json()) as {
    content: { type: string; text: string }[];
  };
  const block = data.content.find((b) => b.type === "text");
  return block?.text ?? "";
}

// JSON 파싱 헬퍼 — 마크다운 코드 블록 제거 후 파싱
function parseJSON<T>(raw: string): T {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  return JSON.parse(cleaned) as T;
}

// ─── 타입 정의 ───────────────────────────────

export interface SurveyQuestion {
  id: number;
  text: string;
  type: "number" | "text";
}

export interface SurveyQuestionsResponse {
  questions: SurveyQuestion[];
}

export interface StatChange {
  stat: string;
  change: number;
}

export interface SurveyResultItem {
  question: string;
  answer: string;
  interpretation: string;
  flavorText: string;
  statChanges: StatChange[];
  curseOrBlessing: "good" | "bad" | "mixed" | "curse";
}

export interface PersonaData {
  name: string;
  pastLife: string;
  personality: string;
  alignment: 'benevolent' | 'neutral' | 'malevolent';
  birthNarrative: string;
  innateTraits: string[];
}

export interface SurveyInterpretResponse {
  results: SurveyResultItem[];
  finalSummary: string;
  persona: PersonaData;
}

export interface RoomChoice {
  text: string;
  icon: string;
  classOnly: string | null;
  requiredSkill: { type: string; level: number } | null;
}

export interface RoomResponse {
  description: string;
  choices: RoomChoice[];
}

export interface SkillChange {
  type: string;
  amount: number;
}

export interface RelicItem {
  name: string;
  effect: string;
  isCursed: boolean;
}

export interface RoomResultResponse {
  result: string;
  hpChange: number;
  goldChange: number;
  skillChange: SkillChange | null;
  newRelic: RelicItem | null;
  isDead: boolean;
  deathCause: string | null;
}

export interface NPCDialogueResponse {
  dialogue: string;
  familiarityChange: number;
  hint: string | null;
  specialOffer: { item: string; effect: string } | null;
  mood: "neutral" | "friendly" | "hostile";
  npcSurveyQuestion: { question: string; hint: string } | null;
}

// ─── API 함수 ────────────────────────────────

export async function generateSurveyQuestions(): Promise<SurveyQuestionsResponse> {
  const questionSeed = Math.random().toString(36).substring(2, 10);

  const text = await claudeFetch(
    [
      {
        role: "user",
        content: `당신은 심술궂고 변덕스러운 던전의 신입니다. 지금 새로운 영혼의 다음 생을 결정하기 위해 심문하고 있습니다.
유저가 시작 전 답해야 할 5가지 질문을 만드세요.

오늘의 질문 변형 코드: ${questionSeed}
→ 이 코드를 기반으로 매번 완전히 다른 주제와 순서로 질문을 생성할 것

규칙:
1. 겉으론 평범한 일상 질문처럼 보일 것
2. 숫자 답변 질문 3개 포함
3. 주관식 텍스트 답변 질문 2개 포함
4. 질문에서 결과를 유추할 수 없을 것
5. 아래 주제는 자주 사용 금지 (너무 자주 나옴):
   - 기상 시간 / 일어난 시간 / 몇 시에 일어났는지
   - 오늘 몇 시간 잤는지 / 수면 시간
6. 숫자 질문의 주제 예시 (매번 다르게): 신발 사이즈, 핸드폰 번호 끝자리,
   가장 좋아하는 숫자, 오늘 걸음 수, 지갑 속 현금, 나이, 형제 수,
   마지막으로 먹은 음식 칼로리, 지금 창문 밖 온도 등
7. 텍스트 질문의 주제 예시 (매번 다르게): 가장 싫어하는 색, 어릴 때 꿈,
   마지막으로 거짓말한 내용, 가장 두려운 것, 지금 기분을 날씨로 표현 등
8. 말투: 신이 인간에게 묻는 고풍스럽고 위엄 있는 반말체로 작성할 것
   - "~인가?", "~하는가?", "~있는가?", "~되는가?", "~이더냐?" 같은 고전적 어미 사용
   - "~어?", "~야?", "~해?" 같은 현대 구어체 금지
   - 예시: "네 신발의 크기는 얼마인가?", "지금 이 순간 네 지갑 속에 현금이 얼마나 들어있는가?"

JSON으로만 응답:
{
  "questions": [
    { "id": 1, "text": "질문", "type": "number" },
    { "id": 2, "text": "질문", "type": "text" }
  ]
}`,
      },
    ],
    1024,
  );

  return parseJSON<SurveyQuestionsResponse>(text);
}

export async function interpretSurveyAnswers(
  answers: { question: string; answer: string }[],
  randomSeed: string,
  finalWords?: string,
): Promise<SurveyInterpretResponse> {
  const answersText = answers
    .map((a, i) => `${i + 1}. ${a.question} → "${a.answer}"`)
    .join("\n");

  const finalWordsSection = finalWords
    ? `\n마지막으로 한 말: "${finalWords}"
→ 이 말에 대한 반응은 오직 신의 현재 기분(기분 코드)에만 달려 있음
→ 아첨이든 욕이든 기분이 좋으면 스탯을 올려줄 수도, 기분이 나쁘면 깎을 수도 있음
→ finalSummary에서 이 마지막 말에 대한 신의 반응을 짧게 언급할 것 (결과는 밝히지 말고 의미심장하게)`
    : "";

  // seed로 이번 런의 신의 기분 패턴 결정 (프론트에서 확정해서 전달)
  const seedNum = parseInt(randomSeed, 36) || 0;
  const moodPatterns = [
    { label: '불쾌한 날',  good: 0, mixed: 2, bad: 3 },
    { label: '심술궂은 날', good: 0, mixed: 3, bad: 2 },
    { label: '심술궂은 날', good: 0, mixed: 3, bad: 2 },
    { label: '변덕스러운 날', good: 1, mixed: 3, bad: 1 },
    { label: '변덕스러운 날', good: 1, mixed: 3, bad: 1 },
    { label: '변덕스러운 날', good: 1, mixed: 2, bad: 2 },
    { label: '기분 좋은 날', good: 2, mixed: 2, bad: 1 },
    { label: '기분 좋은 날', good: 2, mixed: 3, bad: 0 },
  ];
  const mood = moodPatterns[seedNum % moodPatterns.length];

  const text = await claudeFetch(
    [
      {
        role: "user",
        content: `당신은 심술궂고 변덕스러운 던전의 신입니다. 지금 한 영혼의 다음 생을 결정하는 심판을 내리고 있습니다.

절대 규칙:
1. 오늘의 신의 기분: "${mood.label}" — 이 기분이 판결 전체의 분위기를 결정함
2. 5개 결과의 curseOrBlessing을 아래 개수에 맞게 정확히 배분:
   - "good": 정확히 ${mood.good}개
   - "mixed": 정확히 ${mood.mixed}개
   - "bad" 또는 "curse" 합계: 정확히 ${mood.bad}개
3. "mixed"는 반드시 플러스와 마이너스 statChange가 동시에 존재해야 함
4. 숫자: 자릿수/홀짝/소수 여부 등 다양하게 해석
5. 텍스트: 연상 속성/온도/색/계절/감정으로 해석
6. stat 이름은 영어 소문자: hp, atk, def, gold, intelligence, negotiation, lockpick, stealth, strength, arcane 중 하나
7. 해석은 "이 영혼의 다음 생에 ~한 영향을 줄 것이다" 형식으로 환생 맥락으로 서술

페르소나 생성 규칙:
- good이 많을수록 benevolent, bad/curse가 많을수록 malevolent, 균형이면 neutral
- name: 한국어 이름 또는 고유명사 스타일 (예: 이령, 박하, 서진, 흑요 등)
- pastLife: 전생의 직업/역할 한 줄 (예: "전장을 누비던 기사", "시장의 사기꾼")
- personality: 성격 2~3 단어 (예: "냉소적이고 계산적인", "순수하고 충동적인")
- alignment: good 합계 기준
- birthNarrative: "너는 [name]으로 태어날 것이다. [성격 묘사]. [운명 암시]" 형식, 2~3문장, 신이 선고하는 어조
- innateTraits: 타고난 특성 2~3개 (예: "악몽에서 힘을 얻는다", "금속의 냄새를 맡을 수 있다")

답변 목록:
${answersText}${finalWordsSection}

JSON으로만 응답:
{
  "results": [
    {
      "question": "질문",
      "answer": "답변",
      "interpretation": "환생 맥락의 해석 (한국어)",
      "flavorText": "신의 독백 (한국어)",
      "statChanges": [{ "stat": "hp", "change": -7 }],
      "curseOrBlessing": "mixed"
    }
  ],
  "finalSummary": "신의 최종 환생 선고문 (예: '이 영혼은 무거운 업보를 안고 태어날 것이다...')",
  "persona": {
    "name": "이름",
    "pastLife": "전생 한 줄",
    "personality": "성격 묘사",
    "alignment": "neutral",
    "birthNarrative": "탄생 선고 2~3문장",
    "innateTraits": ["특성1", "특성2"]
  }
}`,
      },
    ],
    2048,
  );

  return parseJSON<SurveyInterpretResponse>(text);
}

export async function generateRoom(params: {
  characterClass: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  gold: number;
  skills: Record<string, number>;
  surveyEffects: string;
  relics: string[];
  depth: number;
  roomType: string;
  personaName?: string;
  personaPersonality?: string;
  personaAlignment?: string;
}): Promise<RoomResponse> {
  const {
    characterClass,
    hp,
    maxHp,
    atk,
    def,
    gold,
    skills,
    surveyEffects,
    relics,
    depth,
    roomType,
    personaName,
    personaPersonality,
    personaAlignment,
  } = params;

  const tier = depth <= 3 ? 'early' : depth <= 6 ? 'mid' : 'late';
  const tierDesc = {
    early: '초반(1~3층): 비교적 안전. 적들이 약하고 보상이 풍부하다.',
    mid:   '중반(4~6층): 위험이 커진다. 함정과 강적이 뒤섞인다.',
    late:  '후반(7~10층): 매우 위험. 강적과 극한의 선택만 남아있다.',
  }[tier];

  const roomGuide: Record<string, string> = {
    combat: `전투: 적을 묘사하고 싸울지 피할지 선택지 제시.`,
    event:  `이벤트: 함정·기회·수수께끼 등 특이한 상황 묘사.`,
    npc:    `NPC: 상인·광인·신비로운 존재를 등장시켜라.`,
    shop:   `상점: 물건을 파는 상인. 선택지는 구매·협상·절도 등.`,
    rest:   `휴식처: 안전한 공간. 선택지는 치료·명상·탐색 등.`,
    ghost:  `유령 조우: 죽은 자의 잔상. 선택지는 대화·무시·제압 등.`,
  };

  const text = await claudeFetch(
    [
      {
        role: "user",
        content: `당신은 다크하고 유머러스한 던전 내레이터다.

플레이어:
- 클래스: ${characterClass} | HP: ${hp}/${maxHp} | ATK: ${atk} | DEF: ${def} | 골드: ${gold}
- 스킬: 지능 ${skills.intelligence ?? 0}, 협상 ${skills.negotiation ?? 0}, 자물쇠 ${skills.lockpick ?? 0}, 은신 ${skills.stealth ?? 0}, 완력 ${skills.strength ?? 0}, 마법감지 ${skills.arcane ?? 0}
- 이름: ${personaName ?? '알 수 없음'} | 성격: ${personaPersonality ?? '알 수 없음'} | 성향: ${personaAlignment ?? 'neutral'}
- 설문 효과: ${surveyEffects}
- 유물: ${relics.length > 0 ? relics.join(', ') : '없음'}
- 현재 층: ${depth}/10 | 난이도: ${tierDesc}
- 방 타입: ${roomType} — ${roomGuide[roomType] ?? ''}

규칙:
1. 방 묘사 2~3문장 (한국어).
2. 선택지 정확히 3개.
3. 최소 1개: requiredSkill 필요 (레벨은 초반 1~2, 중반 2~3, 후반 3~4).
4. 최소 1개: classOnly 지정 (warrior/rogue/mage 중 상황에 맞는 것).
5. 나머지 1개: 누구나 선택 가능, requiredSkill null, classOnly null.
6. 성향 반영: ${personaAlignment === 'malevolent' ? '어두운 선택지와 위험한 유혹 위주로' : personaAlignment === 'benevolent' ? '협력과 도움의 선택지 포함' : '균형 있게'} 구성할 것.

JSON으로만 응답:
{
  "description": "방 묘사",
  "choices": [
    { "text": "선택지", "icon": "이모지", "classOnly": null, "requiredSkill": null },
    { "text": "선택지", "icon": "🧠", "classOnly": null, "requiredSkill": { "type": "intelligence", "level": 2 } },
    { "text": "선택지", "icon": "🗡️", "classOnly": "rogue", "requiredSkill": null }
  ]
}`,
      },
    ],
    1024,
  );

  return parseJSON<RoomResponse>(text);
}

export async function generateRoomResult(params: {
  choice: string;
  description: string;
  roomType: string;
  depth: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  gold: number;
  skills: Record<string, number>;
}): Promise<RoomResultResponse> {
  const { choice, description, roomType, depth, hp, maxHp, atk, def, gold, skills } = params;

  const tier = depth <= 3 ? 'early' : depth <= 6 ? 'mid' : 'late';

  // 방 타입별 hpChange 가이드
  const hpGuide: Record<string, Record<string, string>> = {
    combat: {
      early: `전투 피해: -(10~30). DEF ${def} 적용 후 최종 피해 = 원래피해 - ${Math.floor(def * 0.6)}. 사망 확률 5%.`,
      mid:   `전투 피해: -(20~50). DEF ${def} 적용. 사망 확률 15% (HP ${hp}/${maxHp} 고려).`,
      late:  `전투 피해: -(35~80). DEF ${def} 적용. 사망 확률 30% (HP ${hp}/${maxHp} 고려).`,
    },
    rest: {
      early: 'HP 회복: +(20~45). 골드 변화 없음.',
      mid:   'HP 회복: +(15~35). 골드 변화 없음.',
      late:  'HP 회복: +(10~25). 골드 변화 없음.',
    },
    shop: {
      early: '골드 소비: -(15~35). HP 변화 없음. 가끔 렐릭 획득 가능.',
      mid:   '골드 소비: -(25~55). HP 변화 없음. 가끔 렐릭 획득 가능.',
      late:  '골드 소비: -(40~80). HP 변화 없음. 가끔 렐릭 획득 가능.',
    },
    event: {
      early: '이벤트: HP -(0~20) 또는 +(0~20), 골드 -(0~15) 또는 +(0~20). 다양한 결과.',
      mid:   '이벤트: HP -(10~40) 또는 +(0~25), 골드 -(0~30) 또는 +(0~30). 리스크 있음.',
      late:  '이벤트: HP -(20~60) 또는 +(0~20), 골드 -(0~50) 또는 +(0~50). 극단적 결과.',
    },
  };

  const guide = hpGuide[roomType]?.[tier] ?? hpGuide['event'][tier];

  const text = await claudeFetch(
    [
      {
        role: "user",
        content: `선택: ${choice}
상황: ${description}
스탯: HP=${hp}/${maxHp}, ATK=${atk}, DEF=${def}, 골드=${gold}
스킬: 지능 ${skills.intelligence ?? 0}, 협상 ${skills.negotiation ?? 0}, 자물쇠 ${skills.lockpick ?? 0}, 은신 ${skills.stealth ?? 0}, 완력 ${skills.strength ?? 0}, 마법감지 ${skills.arcane ?? 0}
층: ${depth}/10 | 방타입: ${roomType}

피해/보상 기준 (반드시 준수): ${guide}
결과 묘사는 한국어 2~3문장. skillChange는 해당 스킬이 사용된 경우에만.
렐릭은 shop/event에서 드물게만 (20% 확률).

JSON으로만 응답:
{
  "result": "결과 묘사",
  "hpChange": 0,
  "goldChange": 0,
  "skillChange": null,
  "newRelic": null,
  "isDead": false,
  "deathCause": null
}`,
      },
    ],
    512,
  );

  return parseJSON<RoomResultResponse>(text);
}

export async function generateNPCDialogue(params: {
  npcName: string;
  personality: string;
  familiarity: number;
  meetCount: number;
  remainingTurns: number;
  conversationHistory: string;
  playerInput: string;
  personaAlignment?: string;
  favoriteItemTag?: string;
  giftOffered?: { name: string; tag: string };
}): Promise<NPCDialogueResponse> {
  const {
    npcName,
    personality,
    familiarity,
    meetCount,
    remainingTurns,
    conversationHistory,
    playerInput,
    personaAlignment,
    favoriteItemTag,
    giftOffered,
  } = params;

  const alignmentBonus = personaAlignment === 'benevolent' ? 3 : personaAlignment === 'malevolent' ? -3 : 0;

  const giftSection = giftOffered
    ? `플레이어가 선물을 건넸다: "${giftOffered.name}"
선물 반응 규칙:
- 이 NPC의 비밀 선호 아이템 태그: "${favoriteItemTag}"
- 건넨 선물 태그: "${giftOffered.tag}"
- 선물이 선호 태그와 일치하면: NPC가 매우 기뻐하며 familiarityChange +20~30. 대사에서 좋아하는 이유를 자연스럽게 드러낼 것.
- 선물이 선호 태그와 불일치하면: NPC가 정중히 받되 미묘하게 더 좋아하는 걸 암시하는 대사를 남길 것. familiarityChange +3~8.
- 어떤 경우도 선호 아이템 태그를 직접 말하지 말 것. 대화 속 힌트로만 암시할 것.`
    : '';

  const hostileHint = !giftOffered
    ? `말투 분석 규칙 (플레이어 발언 기반):
- 욕설/비하/위협/조롱 등 적대적 발언 → familiarityChange -10 ~ -25, NPC 기분 나빠짐
- 무관심하거나 중립적인 발언 → familiarityChange -2 ~ +3
- 칭찬/공감/호의적 발언 → familiarityChange +5 ~ +15
- 성향 보정값(${alignmentBonus >= 0 ? '+' : ''}${alignmentBonus})을 위 범위에 추가 적용.`
    : '';

  const hintSection = (meetCount === 0 || meetCount === 1) && !giftOffered
    ? `첫 만남이므로 대사 마지막에 자신이 좋아하는 것에 대한 힌트를 자연스럽게 한 줄 흘릴 것 (태그명 직접 언급 금지).`
    : '';

  const text = await claudeFetch(
    [
      {
        role: "user",
        content: `당신은 NPC ${npcName}입니다.
성격: ${personality}
친밀도: ${familiarity}/100 (0=적대, 100=절친)
만남 횟수: ${meetCount}회
남은 대화: ${remainingTurns}회
대화 기록: ${conversationHistory || "(첫 대화)"}
플레이어 발언: ${playerInput}
플레이어 성향: ${personaAlignment ?? 'neutral'}

${giftSection}
${hostileHint}
${hintSection}

친밀도별 응답 길이 준수 (0~19: 1~2문장, 20~39: 2~3문장, 40~59: 3~4문장, 60~79: 4~5문장, 80~: 제한없음).
meetCount > 1이면 이전 만남 자연스럽게 언급.
모든 대사는 한국어.

JSON으로만 응답:
{
  "dialogue": "NPC 대사 (한국어)",
  "familiarityChange": 5,
  "hint": null,
  "specialOffer": null,
  "mood": "neutral",
  "npcSurveyQuestion": null
}`,
      },
    ],
    512,
  );

  return parseJSON<NPCDialogueResponse>(text);
}

export interface GhostBattleReward {
  name: string;
  effect: string;
  isPassive: boolean;
}

export interface GhostBattleResponse {
  won: boolean;
  narrative: string;
  deathCause: string | null;
  reward: GhostBattleReward | null;
}

export async function generateGhostBattle(params: {
  characterClass: string;
  hp: number;
  maxHp: number;
  atk: number;
  arcane: number;
  ghostLastWords: string;
}): Promise<GhostBattleResponse> {
  const { characterClass, hp, maxHp, atk, arcane, ghostLastWords } = params;

  // 마법감지 레벨에 따라 승률 가중치 (2→25%, 3→45%, 4→65%, 5→85%)
  const winWeight = Math.min(85, 5 + arcane * 20);

  const text = await claudeFetch(
    [
      {
        role: "user",
        content: `당신은 던전 서사 판정자다.
플레이어 정보: 직업=${characterClass}, HP=${hp}/${maxHp}, 공격력=${atk}, 마법감지=${arcane}/5
유령의 마지막 말: "${ghostLastWords}"
유령 전투력: 극강 (일반 몬스터의 10배)
승리 확률: ${winWeight}% (마법감지 ${arcane}레벨 기준)

유령과의 사투를 서사적으로 묘사하라. 한국어, 3~5문장.
승리 시: 유령이 남긴 희귀한 무기 또는 패시브 스킬을 1개 드랍하라.
패배 시: 끔찍한 사인을 명시하라.

JSON으로만 응답:
{
  "won": true/false,
  "narrative": "전투 서사 (3~5문장)",
  "deathCause": null 또는 "사인 문장",
  "reward": null 또는 {
    "name": "아이템/스킬 이름",
    "effect": "효과 설명 (짧게)",
    "isPassive": true/false
  }
}`,
      },
    ],
    512,
  );

  return parseJSON<GhostBattleResponse>(text);
}

export interface ModerationResult {
  safe: boolean;
  reason?: string;
}

export async function moderateLastWords(text: string): Promise<ModerationResult> {
  const result = await claudeFetch(
    [
      {
        role: "user",
        content: `다음 텍스트가 게임 내 공개 메시지로 적합한지 판단하라.
부적절한 내용: 욕설, 비속어, 혐오 표현, 성적으로 부적절한 내용, 특정인 비하.
텍스트: "${text}"

JSON으로만 응답:
{"safe": true} 또는 {"safe": false, "reason": "부적절한 이유 한 문장"}`,
      },
    ],
    64,
  );

  try {
    return parseJSON<ModerationResult>(result);
  } catch {
    return { safe: true };
  }
}

// ─── 턴제 전투 타입 정의 ─────────────────────────

export interface InitCombatResponse {
  enemy: {
    name: string;
    description: string;
    hp: number;
    maxHp: number;
    atk: number;
    def: number;
    trait: 'aggressive' | 'cunning' | 'defensive';
    tier: 'normal' | 'elite' | 'boss';
    rageGauge: number;
    currentIntent: {
      type: 'attack' | 'defend' | 'buff' | 'special' | 'unknown';
      description: string;
      isRevealed: boolean;
    };
    statusEffects: [];
  };
  openingNarrative: string;
  rewardGold: number;
  maxTurns: number;
}

export interface TurnResultResponse {
  narrative: string;
  hpChange: number;
  enemyHpChange: number;
  enemyRageChange: number;
  newEnemyIntent: {
    type: 'attack' | 'defend' | 'buff' | 'special' | 'unknown';
    description: string;
    isRevealed: boolean;
  };
  specialEffect: 'flee_success' | 'flee_fail' | 'negotiate_success' | 'bluff_success' | 'bluff_fail' | null;
  statusApplied: { type: 'weakened' | 'enraged' | 'cowered' | 'confused'; turnsRemaining: number } | null;
  isCombatOver: boolean;
  isPlayerDefeated: boolean;
  deathCause: string | null;
}

// ─── 턴제 전투 API 함수 ──────────────────────────

export async function initCombat(params: {
  depth: number;
  characterClass: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  skills: Record<string, number>;
  relics: string[];
}): Promise<InitCombatResponse> {
  const { depth, characterClass, hp, maxHp, atk, def, skills, relics } = params;

  const text = await claudeFetch(
    [
      {
        role: "user",
        content: `당신은 다크하고 긴장감 넘치는 던전 전투 판정자다.

플레이어 정보:
- 직업: ${characterClass} | HP: ${hp}/${maxHp} | ATK: ${atk} | DEF: ${def}
- 스킬: 지능 ${skills.intelligence ?? 0}, 협상 ${skills.negotiation ?? 0}, 자물쇠 ${skills.lockpick ?? 0}, 은신 ${skills.stealth ?? 0}, 완력 ${skills.strength ?? 0}, 마법감지 ${skills.arcane ?? 0}
- 유물: ${relics.length > 0 ? relics.join(', ') : '없음'}
- 현재 층: ${depth}/10

적 생성 규칙:
- depth 1~4: tier="normal", atk 10~20, hp 30~60, maxTurns=3
- depth 5 또는 10: tier="boss", atk 25~45, hp 80~150, maxTurns=5
- depth 3, 6, 8: tier="elite", atk 18~32, hp 55~100, maxTurns=4
- 나머지 depth 4~9: tier는 normal~elite 혼합, maxTurns 3~4
- trait별 특성:
  * aggressive → rageGauge를 20으로 시작, 공격적인 성향
  * cunning → currentIntent.isRevealed를 false로, description을 모호하게 작성
  * defensive → def 값을 높게 (12~20)
- currentIntent.isRevealed는 trait에 상관없이 항상 false로 초기화
- openingNarrative: 한국어 2문장 전투 시작 서사 (긴장감 있게)
- rewardGold: ${depth * 8} ~ ${depth * 15} 범위의 정수
- 모든 텍스트는 한국어

JSON으로만 응답:
{
  "enemy": {
    "name": "적 이름",
    "description": "적 외형/특성 묘사 (한 문장)",
    "hp": 45,
    "maxHp": 45,
    "atk": 14,
    "def": 6,
    "trait": "aggressive",
    "tier": "normal",
    "rageGauge": 0,
    "currentIntent": {
      "type": "attack",
      "description": "무언가를 꾸미는 것 같다",
      "isRevealed": false
    },
    "statusEffects": []
  },
  "openingNarrative": "전투 시작 서사 2문장",
  "rewardGold": ${Math.floor(depth * 8 + Math.random() * (depth * 7))},
  "maxTurns": 3
}`,
      },
    ],
    1024,
  );

  return parseJSON<InitCombatResponse>(text);
}

export async function resolveCombatTurn(params: {
  playerAction: string;
  enemy: {
    name: string;
    hp: number;
    maxHp: number;
    atk: number;
    def: number;
    trait: string;
    tier: string;
    rageGauge: number;
    currentIntent: { type: string; description: string; isRevealed: boolean };
    statusEffects: Array<{ type: string; turnsRemaining: number }>;
  };
  playerStats: {
    hp: number;
    maxHp: number;
    atk: number;
    def: number;
    skills: Record<string, number>;
  };
  turn: number;
  maxTurns: number;
  isLastTurn: boolean;
}): Promise<TurnResultResponse> {
  const { playerAction, enemy, playerStats, turn, maxTurns, isLastTurn } = params;

  const statusEffectsDesc = enemy.statusEffects.length > 0
    ? enemy.statusEffects.map((e) => `${e.type}(${e.turnsRemaining}턴)`).join(', ')
    : '없음';

  const text = await claudeFetch(
    [
      {
        role: "user",
        content: `당신은 턴제 전투 판정자다. 규칙에 따라 정확히 계산하고 한국어로 서사를 서술하라.

현재 상태:
- 턴: ${turn}/${maxTurns}${isLastTurn ? ' (마지막 턴 — 전투 반드시 종결)' : ''}
- 플레이어 행동: "${playerAction}"
- 플레이어: HP=${playerStats.hp}/${playerStats.maxHp}, ATK=${playerStats.atk}, DEF=${playerStats.def}
  스킬: 지능 ${playerStats.skills.intelligence ?? 0}, 협상 ${playerStats.skills.negotiation ?? 0}, 은신 ${playerStats.skills.stealth ?? 0}, 완력 ${playerStats.skills.strength ?? 0}, 마법감지 ${playerStats.skills.arcane ?? 0}
- 적(${enemy.name}): HP=${enemy.hp}/${enemy.maxHp}, ATK=${enemy.atk}, DEF=${enemy.def}, trait=${enemy.trait}, tier=${enemy.tier}, rageGauge=${enemy.rageGauge}
  currentIntent: type=${enemy.currentIntent.type}, isRevealed=${enemy.currentIntent.isRevealed}
  상태이상: ${statusEffectsDesc}

행동별 판정 규칙 (반드시 준수):
- attack: 플레이어 피해 = 적ATK - (플레이어DEF * 0.5), 적 피해 = 플레이어ATK * 0.8 - (적DEF * 0.4). 양쪽 최소 피해는 5.
- defend: 이번 턴 플레이어 피해 절반. 적 피해 없음.
- taunt: enemyRageChange = +20~35. rageGauge+변화 >= 80이면 적 다음 공격 1.5배 + 20% 실수 확률 명시.
- bluff: 성공률 = negotiation * 15 + 25 %. 성공 시 statusApplied={type:"cowered",turnsRemaining:2}, specialEffect="bluff_success". 실패 시 statusApplied={type:"enraged",turnsRemaining:1}, specialEffect="bluff_fail".
- read: intelligence >= 2 필요. 성공 시 newEnemyIntent.isRevealed=true, description을 구체적으로 서술.
- negotiate: negotiation >= 3 조건. specialEffect="negotiate_success", isCombatOver=true.
- flee: 성공률 = stealth * 18 + 10 %. 성공 시 specialEffect="flee_success", isCombatOver=true. 실패 시 hpChange=-(적ATK * 0.8).
- skill_attack: strength 또는 arcane 중 높은 쪽 * 4 추가 피해를 enemyHpChange에 포함.

상태이상 적용:
- 적의 enraged 상태: 적 공격 1.5배
- 적의 cowered 상태: 적 공격 0.6배
- 플레이어의 weakened 상태: 플레이어 공격 0.7배

isLastTurn=true이면: isCombatOver=true로 강제 종결. 플레이어가 살아있으면 isPlayerDefeated=false.

hpChange는 음수(플레이어 피해), enemyHpChange는 음수(적 피해).
narrative: 한국어 2~3문장으로 이번 턴 전투 서사.

JSON으로만 응답:
{
  "narrative": "이번 턴 서사 (한국어 2~3문장)",
  "hpChange": -10,
  "enemyHpChange": -8,
  "enemyRageChange": 0,
  "newEnemyIntent": {
    "type": "attack",
    "description": "다음 의도 묘사",
    "isRevealed": false
  },
  "specialEffect": null,
  "statusApplied": null,
  "isCombatOver": false,
  "isPlayerDefeated": false,
  "deathCause": null
}`,
      },
    ],
    768,
  );

  return parseJSON<TurnResultResponse>(text);
}
