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

export interface SurveyInterpretResponse {
  results: SurveyResultItem[];
  finalSummary: string;
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
        content: `당신은 심술궂고 변덕스러운 던전의 신입니다.
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
        content: `당신은 심술궂고 변덕스러운 던전의 신입니다.

절대 규칙:
1. 오늘의 신의 기분: "${mood.label}" — 이 기분이 판결 전체의 분위기를 결정함
   → 같은 답변도 기분이 다르면 반드시 다른 결과가 나올 것
   → 단, 기분 이름을 텍스트에 직접 노출하지 말 것. 신이 자연스럽게 행동할 것
2. 5개 결과의 curseOrBlessing을 아래 개수에 맞게 정확히 배분할 것:
   - "good": 정확히 ${mood.good}개
   - "mixed": 정확히 ${mood.mixed}개
   - "bad" 또는 "curse" 합계: 정확히 ${mood.bad}개
3. "mixed"는 반드시 플러스 statChange와 마이너스 statChange가 동시에 존재해야 함
   → 둘 다 마이너스거나 둘 다 플러스면 mixed가 아니라 bad/good으로 분류할 것
4. 숫자: 숫자 자체 / 자릿수 / 홀짝 / 소수 여부 등 다양하게 해석
5. 텍스트: 연상 속성 / 온도 / 색 / 계절 / 감정 등으로 해석
6. 해석 이유를 짧고 드라마틱하게 설명 (한국어)
7. stat 이름은 반드시 영어 소문자: hp, atk, def, gold, intelligence, negotiation, lockpick, stealth, strength, arcane 중 하나

답변 목록:
${answersText}${finalWordsSection}

JSON으로만 응답:
{
  "results": [
    {
      "question": "질문",
      "answer": "답변",
      "interpretation": "드라마틱한 해석 (한국어)",
      "flavorText": "신의 독백 (한국어)",
      "statChanges": [
        { "stat": "hp", "change": -7 }
      ],
      "curseOrBlessing": "mixed"
    }
  ],
  "finalSummary": "신의 최종 판결 한 줄 (한국어)"
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
}): Promise<NPCDialogueResponse> {
  const {
    npcName,
    personality,
    familiarity,
    meetCount,
    remainingTurns,
    conversationHistory,
    playerInput,
  } = params;

  const text = await claudeFetch(
    [
      {
        role: "user",
        content: `당신은 NPC ${npcName}입니다.
성격: ${personality}
친밀도: ${familiarity}/100
만남 횟수: ${meetCount}회
남은 대화: ${remainingTurns}회
대화 기록: ${conversationHistory || "(첫 대화)"}
플레이어 발언: ${playerInput}

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
