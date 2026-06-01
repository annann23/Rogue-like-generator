import { env } from '@/env';

const MODEL = 'claude-sonnet-4-6';
const API_URL = 'https://api.anthropic.com/v1/messages';

// ─── fetch 래퍼 ──────────────────────────────
async function claudeFetch(messages: { role: string; content: string }[], maxTokens = 1024): Promise<string> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': env.VITE_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json',
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

  const data = await res.json() as { content: { type: string; text: string }[] };
  const block = data.content.find((b) => b.type === 'text');
  return block?.text ?? '';
}

// JSON 파싱 헬퍼 — 마크다운 코드 블록 제거 후 파싱
function parseJSON<T>(raw: string): T {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  return JSON.parse(cleaned) as T;
}

// ─── 타입 정의 ───────────────────────────────

export interface SurveyQuestion {
  id: number;
  text: string;
  type: 'number' | 'text';
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
  curseOrBlessing: 'good' | 'bad' | 'mixed' | 'curse';
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
  mood: 'neutral' | 'friendly' | 'hostile';
  npcSurveyQuestion: { question: string; hint: string } | null;
}

// ─── API 함수 ────────────────────────────────

export async function generateSurveyQuestions(): Promise<SurveyQuestionsResponse> {
  const text = await claudeFetch([
    {
      role: 'user',
      content: `당신은 심술궂고 변덕스러운 던전의 신입니다.
유저가 시작 전 답해야 할 5가지 질문을 만드세요.

규칙:
1. 겉으론 평범한 일상 질문처럼 보일 것
2. 숫자 답변 질문 3개 포함
3. 주관식 텍스트 답변 질문 2개 포함
4. 질문에서 결과를 유추할 수 없을 것
5. 매 런마다 완전히 다른 질문 생성

JSON으로만 응답:
{
  "questions": [
    { "id": 1, "text": "질문", "type": "number" },
    { "id": 2, "text": "질문", "type": "text" }
  ]
}`,
    },
  ], 1024);

  return parseJSON<SurveyQuestionsResponse>(text);
}

export async function interpretSurveyAnswers(
  answers: { question: string; answer: string }[],
  randomSeed: string,
  finalWords?: string,
): Promise<SurveyInterpretResponse> {
  const answersText = answers
    .map((a, i) => `${i + 1}. ${a.question} → "${a.answer}"`)
    .join('\n');

  const finalWordsSection = finalWords
    ? `\n마지막으로 한 말: "${finalWords}"
→ 이 말에 대한 반응은 오직 신의 현재 기분(기분 코드)에만 달려 있음
→ 아첨이든 욕이든 기분이 좋으면 스탯을 올려줄 수도, 기분이 나쁘면 깎을 수도 있음
→ finalSummary에서 이 마지막 말에 대한 신의 반응을 짧게 언급할 것 (결과는 밝히지 말고 의미심장하게)`
    : '';

  const text = await claudeFetch([
    {
      role: 'user',
      content: `당신은 심술궂고 변덕스러운 던전의 신입니다.

절대 규칙:
1. 오늘의 신의 기분 코드: ${randomSeed} — 이 값을 해석 방향과 강도에 내부적으로 반영할 것
   → 같은 답변도 기분 코드가 다르면 반드시 다른 결과가 나올 것
   → 단, "seed", "시드", "기분 코드", "랜덤" 같은 단어는 절대 텍스트에 노출하지 말 것
   → 신이 그냥 변덕스럽게 판결하는 것처럼 자연스럽게 표현할 것
2. 5개 결과의 curseOrBlessing 분포를 아래 비율로 맞출 것:
   - "bad" 또는 "curse": 2개 (40%)
   - "mixed": 2~3개 (40~60%)
   - "good": 1~2개 (20~40%)
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
  ], 2048);

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
  const { characterClass, hp, maxHp, atk, def, gold, skills, surveyEffects, relics, depth, roomType } = params;

  const text = await claudeFetch([
    {
      role: 'user',
      content: `당신은 다크하고 유머러스한 던전 내레이터입니다.

플레이어:
- 클래스: ${characterClass}
- HP: ${hp}/${maxHp}, ATK: ${atk}, DEF: ${def}, 골드: ${gold}
- 스킬: 지능 ${skills.intelligence ?? 0}, 협상력 ${skills.negotiation ?? 0}, 자물쇠 ${skills.lockpick ?? 0}, 은신 ${skills.stealth ?? 0}, 완력 ${skills.strength ?? 0}, 마법감지 ${skills.arcane ?? 0}
- 설문 효과: ${surveyEffects}
- 유물: ${relics.length > 0 ? relics.join(', ') : '없음'}
- 현재 방: ${depth}/10
- 방 타입: ${roomType}

선택지 3개 생성. 최소 1개는 스킬 요구, 1개는 클래스 전용.
방 묘사는 한국어로 2~3문장.

JSON으로만 응답:
{
  "description": "방 묘사 (한국어)",
  "choices": [
    { "text": "선택지 (한국어)", "icon": "이모지", "classOnly": null, "requiredSkill": null },
    { "text": "선택지 (한국어)", "icon": "🧠", "classOnly": null, "requiredSkill": { "type": "intelligence", "level": 2 } },
    { "text": "선택지 (한국어)", "icon": "🗡️", "classOnly": "rogue", "requiredSkill": null }
  ]
}`,
    },
  ], 1024);

  return parseJSON<RoomResponse>(text);
}

export async function generateRoomResult(params: {
  choice: string;
  description: string;
  hp: number;
  maxHp: number;
  atk: number;
  gold: number;
  skills: Record<string, number>;
}): Promise<RoomResultResponse> {
  const { choice, description, hp, maxHp, atk, gold, skills } = params;

  const text = await claudeFetch([
    {
      role: 'user',
      content: `선택: ${choice}
상황: ${description}
스탯: HP=${hp}/${maxHp}, ATK=${atk}, 골드=${gold}
스킬: 지능 ${skills.intelligence ?? 0}, 협상력 ${skills.negotiation ?? 0}, 자물쇠 ${skills.lockpick ?? 0}, 은신 ${skills.stealth ?? 0}, 완력 ${skills.strength ?? 0}, 마법감지 ${skills.arcane ?? 0}

결과 묘사는 한국어 2문장. 스탯 변화는 현실적으로.

JSON으로만 응답:
{
  "result": "결과 묘사 (한국어)",
  "hpChange": -20,
  "goldChange": 15,
  "skillChange": { "type": "lockpick", "amount": 1 },
  "newRelic": null,
  "isDead": false,
  "deathCause": null
}`,
    },
  ], 512);

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
  const { npcName, personality, familiarity, meetCount, remainingTurns, conversationHistory, playerInput } = params;

  const text = await claudeFetch([
    {
      role: 'user',
      content: `당신은 NPC ${npcName}입니다.
성격: ${personality}
친밀도: ${familiarity}/100
만남 횟수: ${meetCount}회
남은 대화: ${remainingTurns}회
대화 기록: ${conversationHistory || '(첫 대화)'}
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
  ], 512);

  return parseJSON<NPCDialogueResponse>(text);
}
