import { env } from "@/env";
import { pickSurveyQuestions } from "@/constants/surveyQuestions";
import { PERSONA_TRAITS, FLAG_CONTEXT, type PersonaTraitType } from "@/constants/storyFlags";

const MODEL_SONNET = "claude-sonnet-4-6";
const MODEL_HAIKU  = "claude-haiku-4-5-20251001";
const API_URL = "https://api.anthropic.com/v1/messages";

// ─── fetch 래퍼 ──────────────────────────────
async function claudeFetch(
  messages: { role: string; content: string }[],
  maxTokens = 1024,
  model = MODEL_SONNET,
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
      model,
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
    stop_reason: string;
  };
  const block = data.content.find((b) => b.type === "text");
  const text = block?.text ?? "";
  // max_tokens로 잘렸어도 텍스트를 그대로 반환 — parseJSON에서 복구 시도
  if (data.stop_reason === 'max_tokens' && !text) {
    throw new Error('API 응답이 비어 있습니다 (토큰 한도 초과).');
  }
  return text;
}

// ─── 자동 재시도 래퍼 ─────────────────────────
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  delayMs = 800,
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (i < maxRetries) {
        await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
      }
    }
  }
  throw lastError;
}

// ─── JSON 파싱 헬퍼 ───────────────────────────
function parseJSON<T>(raw: string): T {
  // 1. 마크다운 코드 블록 제거
  let cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  // 2. 응답 앞뒤에 텍스트가 붙어있는 경우 JSON 객체/배열만 추출
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  // 3. 직접 파싱
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // 4. 제어문자 이스케이프 후 재파싱
    const repaired = repairJSON(cleaned);
    try {
      return JSON.parse(repaired) as T;
    } catch {
      // 5. 토큰 잘림으로 JSON이 불완전한 경우 — 닫는 구조 보충 후 재시도
      const patched = patchTruncatedJSON(repaired);
      try {
        return JSON.parse(patched) as T;
      } catch (e3) {
        throw new Error(`JSON 파싱 실패: ${(e3 as Error).message} (응답 ${cleaned.length}자)`);
      }
    }
  }
}

// JSON 문자열 값 내부의 literal 제어문자를 이스케이프
function repairJSON(s: string): string {
  return s.replace(/"((?:[^"\\]|\\.)*)"/g, (_, inner: string) => {
    const escaped = inner
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
    return `"${escaped}"`;
  });
}

// 잘린 JSON 끝에 필요한 닫는 괄호/따옴표 보충
function patchTruncatedJSON(s: string): string {
  const stack: string[] = [];
  let inString = false;
  let escape = false;

  for (const ch of s) {
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{' || ch === '[') stack.push(ch === '{' ? '}' : ']');
    else if (ch === '}' || ch === ']') stack.pop();
  }

  // 열린 문자열이 있으면 닫기
  let result = s;
  if (inString) result += '"';

  // 스택에 남은 닫는 괄호 역순 추가
  for (let i = stack.length - 1; i >= 0; i--) {
    // 중간에 잘린 키/값이 있으면 null로 마무리
    if (stack[i] === '}') result += '}';
    else result += ']';
  }

  return result;
}

// ─── 스킬 타입 정규화 ─────────────────────────
// Claude가 arcane_detection, magic, lock_pick 등 변형 문자열을 반환하는 경우 대응
const VALID_SKILL_TYPES = ['intelligence', 'negotiation', 'lockpick', 'stealth', 'strength', 'arcane'] as const;
type ValidSkillType = typeof VALID_SKILL_TYPES[number];

const SKILL_ALIASES: Record<string, ValidSkillType> = {
  // intelligence
  intel: 'intelligence', int: 'intelligence', intellect: 'intelligence',
  knowledge: 'intelligence', wisdom: 'intelligence',
  // negotiation
  negotiate: 'negotiation', persuasion: 'negotiation', persuade: 'negotiation',
  charisma: 'negotiation', diplomacy: 'negotiation', charm: 'negotiation',
  // lockpick
  lock: 'lockpick', lock_pick: 'lockpick', lockpicking: 'lockpicking' as ValidSkillType,
  pick: 'lockpick', thievery: 'lockpick', dexterity: 'lockpick',
  // stealth
  hide: 'stealth', sneak: 'stealth', agility: 'stealth',
  evasion: 'stealth', shadow: 'stealth',
  // strength
  str: 'strength', power: 'strength', force: 'strength',
  might: 'strength', brute: 'strength', physical: 'strength',
  // arcane
  arcane_detection: 'arcane', arcane_sense: 'arcane', arcane_knowledge: 'arcane',
  magic: 'arcane', magical: 'arcane', mana: 'arcane',
  magic_detection: 'arcane', detect_magic: 'arcane', mysticism: 'arcane',
  occult: 'arcane', esoteric: 'arcane', enchantment: 'arcane',
};

function normalizeSkillType(raw: string): ValidSkillType {
  const lower = raw.toLowerCase().trim();
  // 정확히 일치하는 경우
  if ((VALID_SKILL_TYPES as readonly string[]).includes(lower)) return lower as ValidSkillType;
  // 별칭 매핑
  if (lower in SKILL_ALIASES) return SKILL_ALIASES[lower];
  // 부분 문자열 매칭 (예: "arcane_detection" → "arcane")
  for (const valid of VALID_SKILL_TYPES) {
    if (lower.includes(valid)) return valid;
  }
  // 기본값
  return 'intelligence';
}

// 모든 한국어 생성 프롬프트에 공통 삽입
const KO_STYLE = `문체 규칙: 한국어 문장에서 부연 설명을 이을 때 '-' 기호(대시)를 절대 사용하지 말 것. 쉼표(,), 마침표(.), 또는 별도 문장으로 풀어 쓸 것.`;

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
  traitType: PersonaTraitType;
}

export interface LastWordEffect {
  type: 'death_immune' | 'gold_bonus' | 'hp_restore' | 'flee_guaranteed' | 'skill_up' | 'none';
  label: string;
  description: string;
}

export interface SurveyInterpretResponse {
  results: SurveyResultItem[];
  finalSummary: string;
  persona: PersonaData;
  lastWordEffect: LastWordEffect;
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

export interface ChoiceWithResult extends RoomChoice {
  result: string;
  hpChange: number;
  goldChange: number;
  skillChange: SkillChange | null;
  newRelic: RelicItem | null;
  isDead: boolean;
  deathCause: string | null;
  storyFlagSet: { key: string; value: boolean | number | string } | null;
  personaReaction: 'bonus' | 'penalty' | 'neutral';
}

export interface RoomWithResults {
  description: string;
  choices: ChoiceWithResult[];
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

export function generateSurveyQuestions(_totalRuns = 0): Promise<SurveyQuestionsResponse> {
  // Claude 호출 없이 프론트에서 직접 무작위 선택 → 반복 없음, 즉시 반환
  return Promise.resolve({ questions: pickSurveyQuestions() });
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
→ 이 말을 듣고 신이 다음 생에 특별한 효과를 부여한다.
→ 효과는 신의 현재 기분(기분 코드)과 말의 내용/어조에 따라 결정됨.
→ finalSummary에서 이 마지막 말에 대한 신의 반응을 짧게 언급할 것 (결과는 밝히지 말고 의미심장하게).
→ lastWordEffect를 아래 규칙으로 결정:
   - 진심 어린 말, 용감한 말, 신을 경외하는 말 + 기분 좋은 날 → death_immune (즉사 1회 면제)
   - 물질적 욕심을 드러내는 말, 상인 같은 말 → gold_bonus (+50 골드)
   - 고통/상처를 드러내는 말, 애처로운 말 → hp_restore (HP 전체 회복 1회)
   - 도망치고 싶다는 말, 겁쟁이 같은 말 → flee_guaranteed (전투 도망 1회 보장)
   - 지식/능력을 뽐내는 말, 오만한 말 → skill_up (랜덤 스킬 +1)
   - 기분 나쁜 날 or 의미 없는 말 or 욕설 → none (효과 없음)`
    : `→ lastWordEffect는 { "type": "none", "label": "없음", "description": "신은 아무 말도 듣지 못했다" }로 설정.`;

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
8. 글자 수 제한 (JSON 용량 절약):
   - interpretation: 40자 이내
   - flavorText: 30자 이내
   - finalSummary: 60자 이내
   - birthNarrative: 80자 이내
   - innateTraits 각 항목: 20자 이내

페르소나 생성 규칙:
- good이 많을수록 benevolent, bad/curse가 많을수록 malevolent, 균형이면 neutral
- name: 한국어 이름 또는 고유명사 스타일 (예: 이령, 박하, 서진, 흑요 등)
- pastLife: 전생의 직업/역할 한 줄 (예: "전장을 누비던 기사", "시장의 사기꾼")
- personality: 성격 2~3 단어 (예: "냉소적이고 계산적인", "순수하고 충동적인")
- alignment: good 합계 기준
- birthNarrative: "너는 [name]으로 태어날 것이다. [성격 묘사]. [운명 암시]" 형식, 신이 선고하는 어조
- innateTraits: 타고난 특성 2~3개 (예: "악몽에서 힘을 얻는다", "금속의 냄새를 맡을 수 있다")
- traitType: 아래 7가지 중 답변 내용과 personality에 가장 어울리는 하나를 선택
  * reckless: 충동적, 무모, 두려움 없음
  * cowardly: 소심, 겁, 조심스러움 과도함
  * greedy: 욕심, 물욕, 이익 우선
  * righteous: 정의, 도덕, 희생적
  * cynical: 냉소, 의심, 현실주의
  * naive: 순진, 천진, 믿음 강함
  * vengeful: 복수심, 원한, 집착

답변 목록:
${answersText}${finalWordsSection}

${KO_STYLE}

JSON으로만 응답:
{
  "results": [
    {
      "question": "질문",
      "answer": "답변",
      "interpretation": "환생 맥락의 해석 (40자 이내)",
      "flavorText": "신의 독백 (30자 이내)",
      "statChanges": [{ "stat": "hp", "change": -7 }],
      "curseOrBlessing": "mixed"
    }
  ],
  "finalSummary": "신의 최종 환생 선고문 (60자 이내)",
  "persona": {
    "name": "이름",
    "pastLife": "전생 한 줄",
    "personality": "성격 묘사",
    "alignment": "neutral",
    "birthNarrative": "탄생 선고 (80자 이내)",
    "innateTraits": ["특성1 (20자 이내)", "특성2"],
    "traitType": "reckless"
  },
  "lastWordEffect": {
    "type": "death_immune",
    "label": "죽음의 유예",
    "description": "한 번의 치명타에서 1 HP로 살아남는다"
  }
}`,
      },
    ],
    8192,
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
    late:  '후반(7층 이후): 매우 위험. 강적과 극한의 선택만 남아있다.',
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
- 현재 층: ${depth} | 난이도: ${tierDesc}
- 방 타입: ${roomType} — ${roomGuide[roomType] ?? ''}

규칙:
1. 방 묘사 2~3문장 (한국어).
2. 선택지 정확히 3개.
3. 최소 1개: requiredSkill 필요 (레벨은 초반 1~2, 중반 2~3, 후반 3~4).
4. 최소 1개: classOnly 지정 (warrior/rogue/mage 중 상황에 맞는 것).
5. 나머지 1개: 누구나 선택 가능, requiredSkill null, classOnly null.
6. 성향 반영: ${personaAlignment === 'malevolent' ? '어두운 선택지와 위험한 유혹 위주로' : personaAlignment === 'benevolent' ? '협력과 도움의 선택지 포함' : '균형 있게'} 구성할 것.
${KO_STYLE}

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
    512,
  );

  return parseJSON<RoomResponse>(text);
}

export async function generateRoomWithResults(params: {
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
  personaTraitType?: PersonaTraitType;
  storyFlags?: Record<string, boolean | number | string>;
  recentDescriptions?: string[];
}): Promise<RoomWithResults> {
  const { characterClass, hp, maxHp, atk, def, gold, skills, surveyEffects, relics, depth, roomType, personaName, personaPersonality, personaAlignment, personaTraitType, storyFlags, recentDescriptions } = params;

  const tier = depth <= 3 ? 'early' : depth <= 6 ? 'mid' : 'late';
  const tierDesc = {
    early: '초반(1~3층): 비교적 안전. 보상이 풍부하다.',
    mid:   '중반(4~6층): 위험이 커진다. 함정과 강적이 뒤섞인다.',
    late:  '후반(7층 이후): 매우 위험. 강적과 극한의 선택만 남아있다.',
  }[tier];

  const roomGuide: Record<string, string> = {
    event:  `이벤트: 함정·기회·수수께끼 등 특이한 상황.`,
    rest:   `휴식처: 안전한 공간. 치료·명상·탐색 등.`,
    shop:   `상점: 상인. 구매·협상·절도 등.`,
  };

  const hpGuideByType: Record<string, string> = {
    event: {
      early: '각 선택별 HP: -(0~20) 또는 +(0~20), 골드: -(0~15) 또는 +(0~20).',
      mid:   '각 선택별 HP: -(10~35) 또는 +(0~25), 골드: -(0~30) 또는 +(0~30).',
      late:  '각 선택별 HP: -(20~50) 또는 +(0~20), 골드: -(0~50) 또는 +(0~50).',
    }[tier],
    rest: {
      early: '안전 선택: HP +(25~50). 탐색 선택: HP +(10~25) + 골드 소량. 위험 선택: HP -(5~20) 또는 +(30~60).',
      mid:   '안전 선택: HP +(20~40). 탐색 선택: HP +(10~20) + 골드. 위험 선택: HP -(10~30) 또는 +(30~55).',
      late:  '안전 선택: HP +(15~30). 탐색 선택: HP +(5~15). 위험 선택: HP -(15~40) 또는 +(25~50).',
    }[tier],
    shop: {
      early: '구매 선택: 골드 -(15~35). 협상 선택: 골드 -(10~20) 또는 렐릭 획득. 절도 선택: 골드 변화없음·HP -(0~20) 위험.',
      mid:   '구매 선택: 골드 -(25~55). 협상 선택: 골드 -(15~35) 또는 렐릭. 절도 선택: HP -(0~30) 위험.',
      late:  '구매 선택: 골드 -(40~80). 협상 선택: 골드 -(25~50) 또는 렐릭. 절도 선택: HP -(0~50) 위험.',
    }[tier],
  };

  const hpGuide = hpGuideByType[roomType] ?? hpGuideByType['event'];
  const personaSection = personaName ? `페르소나: ${personaName} (${personaPersonality}, ${personaAlignment})` : '';


  // 활성 스토리 플래그만 추출 (false/0 제외로 토큰 절약)
  const activeFlags = storyFlags
    ? Object.entries(storyFlags).filter(([, v]) => v !== false && v !== 0)
    : [];
  const flagsSection = activeFlags.length > 0
    ? `\n[활성 스토리 플래그 — 방 묘사와 선택 결과에 자연스럽게 녹여라]\n` +
      activeFlags.map(([k, v]) => `- ${k}(=${v}): ${FLAG_CONTEXT[k] ?? ''}`).join('\n')
    : '';

  const avoidSection = recentDescriptions && recentDescriptions.length > 0
    ? `\n[금지] 다음과 같은 배경·분위기를 반복하지 말 것: ${recentDescriptions.map(d => `"${d}"`).join(', ')}`
    : '';

  const traitInfo = personaTraitType ? PERSONA_TRAITS[personaTraitType] : null;
  const traitSection = traitInfo
    ? `\n[페르소나 성격: ${traitInfo.icon} ${traitInfo.name}]\n` +
      `- "${traitInfo.bonusKeywords.join('/', )}" 류 선택 → personaReaction="bonus", result에 이 성격답게 잘 풀리는 묘사 포함\n` +
      `- "${traitInfo.penaltyKeywords.join('/')}" 류 선택 → personaReaction="penalty", result에 성격과 어긋나 망설이거나 실패하는 묘사 포함\n` +
      `- 나머지 → personaReaction="neutral"`
    : '';

  const text = await claudeFetch(
    [
      {
        role: 'user',
        content: `당신은 다크하고 유머러스한 던전 내레이터다.

플레이어:
- 클래스: ${characterClass} | HP: ${hp}/${maxHp} | ATK: ${atk} | DEF: ${def} | 골드: ${gold}
- 스킬: 지능 ${skills.intelligence ?? 0}, 협상 ${skills.negotiation ?? 0}, 자물쇠 ${skills.lockpick ?? 0}, 은신 ${skills.stealth ?? 0}, 완력 ${skills.strength ?? 0}, 마법감지 ${skills.arcane ?? 0}
- 설문 효과: ${surveyEffects} | 유물: ${relics.length > 0 ? relics.join(', ') : '없음'}
- 현재 층: ${depth} | 난이도: ${tierDesc}
- 방 타입: ${roomType} — ${roomGuide[roomType] ?? ''}
${personaSection}${flagsSection}${traitSection}${avoidSection}

규칙:
1. 방 묘사 2~3문장.
2. 선택지 정확히 3개. 각각 서로 다른 방식 (직접/기술/창의적).
3. 최소 1개: requiredSkill 포함 (레벨 초반 1~2, 중반 2~3, 후반 3~4).
4. 최소 1개: classOnly 지정 (warrior/rogue/mage 중 상황에 맞는 것).
5. 각 선택지마다 결과(result)와 수치 변화를 미리 결정해서 포함시켜라.
6. 피해/보상 기준 (반드시 준수): ${hpGuide}
7. 렐릭(newRelic)은 event/shop에서 20% 확률로만.
8. skillChange는 해당 스킬이 실제로 사용된 선택지에서만.
9. storyFlagSet: 선택이 스토리에 중요한 흔적을 남긴다면 {"key":"플래그명","value":true} 설정. 단순한 선택은 null.
${KO_STYLE}

JSON으로만 응답:
{
  "description": "방 묘사 2~3문장",
  "choices": [
    {
      "text": "선택지 텍스트",
      "icon": "이모지",
      "classOnly": null,
      "requiredSkill": null,
      "result": "결과 묘사 2~3문장",
      "hpChange": 0,
      "goldChange": 0,
      "skillChange": null,
      "newRelic": null,
      "isDead": false,
      "deathCause": null,
      "storyFlagSet": null,
      "personaReaction": "neutral"
    }
  ]
}`,
      },
    ],
    1200,
    MODEL_HAIKU,
  );

  const parsed = parseJSON<RoomWithResults>(text);

  // Claude가 반환한 스킬 타입 정규화 (arcane_detection → arcane 등)
  parsed.choices = parsed.choices.map((c) => ({
    ...c,
    requiredSkill: c.requiredSkill
      ? { ...c.requiredSkill, type: normalizeSkillType(c.requiredSkill.type) }
      : null,
    skillChange: c.skillChange
      ? { ...c.skillChange, type: normalizeSkillType(c.skillChange.type) }
      : null,
  }));

  return parsed;
}

// 재시도 + 폴백을 포함한 public 래퍼
const FALLBACK_ROOM: RoomWithResults = {
  description: '안개가 자욱한 통로가 나타났다. 무언가 이상한 기운이 감돈다.',
  choices: [
    {
      text: '조심스럽게 앞으로 나아간다',
      icon: '👣',
      classOnly: null,
      requiredSkill: null,
      result: '조심스럽게 발걸음을 옮겼다. 특별한 일은 일어나지 않았다.',
      hpChange: 0,
      goldChange: 0,
      skillChange: null,
      newRelic: null,
      isDead: false,
      deathCause: null,
      storyFlagSet: null,
      personaReaction: 'neutral',
    },
    {
      text: '잠시 숨을 고르며 대기한다',
      icon: '🧘',
      classOnly: null,
      requiredSkill: null,
      result: '잠시 휴식을 취했다. 피로가 조금 풀렸다.',
      hpChange: 10,
      goldChange: 0,
      skillChange: null,
      newRelic: null,
      isDead: false,
      deathCause: null,
      storyFlagSet: null,
      personaReaction: 'neutral',
    },
    {
      text: '주변을 살피며 단서를 찾는다',
      icon: '🔍',
      classOnly: null,
      requiredSkill: null,
      result: '주변을 살폈지만 별다른 것을 찾지 못했다.',
      hpChange: 0,
      goldChange: 5,
      skillChange: null,
      newRelic: null,
      isDead: false,
      deathCause: null,
      storyFlagSet: null,
      personaReaction: 'neutral',
    },
  ],
};

export async function generateRoomWithResultsSafe(
  params: Parameters<typeof generateRoomWithResults>[0],
): Promise<RoomWithResults> {
  try {
    return await withRetry(() => generateRoomWithResults(params), 2, 800);
  } catch {
    return FALLBACK_ROOM;
  }
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
      early: `전투 피해: -(10~30). DEF ${def} 적용 후 최종 피해 = 원래피해 - ${def}. 사망 확률 5%.`,
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
층: ${depth} | 방타입: ${roomType}

피해/보상 기준 (반드시 준수): ${guide}
결과 묘사는 한국어 2~3문장. skillChange는 해당 스킬이 사용된 경우에만.
렐릭은 shop/event에서 드물게만 (20% 확률).
${KO_STYLE}

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

  // 친밀도 단계별 태도 + 힌트/개인사 공개 규칙
  const familiarityStage = familiarity < 30
    ? `[친밀도 낮음: ${familiarity}/100]
- 태도: 무뚝뚝하거나 형식적으로 친절한 척하되 속내는 드러내지 않음. 경계심을 유지할 것.
- 자신의 취향/과거/개인 이야기는 절대 꺼내지 말 것.
- 선물 힌트도 주지 말 것. 선물을 받아도 무덤덤하게 받을 것.`
    : familiarity < 50
    ? `[친밀도 중간: ${familiarity}/100]
- 태도: 조금씩 경계가 풀리기 시작. 가끔 진심이 살짝 비침.
- 자신이 좋아하는 것에 대한 힌트를 대사 속에 아주 자연스럽게 한 줄 흘려도 됨 (태그명 직접 언급 금지).
- 개인 이야기는 아직 꺼내지 않음.`
    : familiarity < 70
    ? `[친밀도 높음: ${familiarity}/100]
- 태도: 어느 정도 신뢰가 생겼음. 솔직한 면모가 드러남.
- 좋아하는 것에 대한 힌트를 자연스럽게 줄 것.
- 자신의 과거나 사연 중 가벼운 것을 슬쩍 언급해도 됨. (예: 과거 직업, 옛 기억 한 조각)`
    : familiarity < 90
    ? `[친밀도 매우 높음: ${familiarity}/100]
- 태도: 진정한 우호 관계. 솔직하고 따뜻함.
- 좋아하는 것에 대해 적극적으로 이야기할 수 있음.
- 자신의 더 깊은 사연이나 비밀스러운 과거를 털어놓을 것. (예: 왜 던전에 있는지, 숨긴 상처)`
    : `[친밀도 최대: ${familiarity}/100]
- 태도: 완전한 신뢰. 가장 친한 존재.
- 자신의 가장 깊은 비밀, 진짜 정체, 숨겨온 소망을 털어놓을 것.
- 선물에 대해 진심으로 반응하고 자신의 취향을 솔직히 밝혀도 됨.`;

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

${familiarityStage}

${giftSection}
${hostileHint}

친밀도별 응답 길이 준수 (0~19: 1~2문장, 20~39: 2~3문장, 40~59: 3~4문장, 60~79: 4~5문장, 80~: 제한없음).
meetCount > 1이면 이전 만남 자연스럽게 언급.
모든 대사는 한국어.
${KO_STYLE}

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
${KO_STYLE}

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
    MODEL_HAIKU,
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
    MODEL_HAIKU,
  );

  try {
    return parseJSON<ModerationResult>(result);
  } catch {
    return { safe: true };
  }
}

// ─── 턴제 전투 타입 정의 (combatEngine.ts에서 사용) ──

export interface InitCombatResponse {
  enemy: {
    id: string;
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
