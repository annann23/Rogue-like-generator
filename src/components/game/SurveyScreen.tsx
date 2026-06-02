import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameState, type Persona, type SurveyResult } from '@/hooks/useGameState';
import {
  generateSurveyQuestions,
  interpretSurveyAnswers,
  type SurveyQuestion,
  type SurveyResultItem,
  type LastWordEffect,
} from '@/hooks/useClaude';
import { PERSONA_TRAITS, type PersonaTraitType } from '@/constants/storyFlags';
import { PixelPanel, PixelButton, PixelInput, TypewriterText } from './UIFrame';

type Phase = 'gem-reveal' | 'greeting' | 'answering' | 'final-words' | 'interpreting' | 'error';

// ─── 보석별 기억 파편 스토리 ────────────────────────
interface GemStory {
  title: string;
  lines: string[];
  demonLine: string;
}

const GEM_STORIES: Record<string, GemStory> = {
  flame: {
    title: '🔴 불꽃의 보석',
    lines: [
      '뜨거운 것이 손에 닿는 느낌.',
      '',
      '싸우고, 지키고, 또 싸웠던 기억.',
      '누군가를 위해서였는지,',
      '이제는 잘 모르겠다.',
      '',
      '다만 — 이 빛이 낯설지 않다.',
    ],
    demonLine: '...흥미롭군. 계속해봐.',
  },
  water: {
    title: '💧 물결의 보석',
    lines: [
      '죽음을 건너온 자만이 닿을 수 있는 빛.',
      '',
      '이상하다.',
      '죽는 것이, 처음부터 그렇게 낯설지 않았다.',
      '',
      '마치 — 원래부터 알고 있었던 것처럼.',
    ],
    demonLine: '죽음이 익숙한 건... 계약 때문만은 아닐 거야.',
  },
  light: {
    title: '✨ 빛의 보석',
    lines: [
      '따뜻한 기억.',
      '',
      '많은 사람들이 곁에 있었다.',
      '이름은 기억나지 않지만,',
      '그 온기만은 손끝에 남아있다.',
      '',
      '그들이 나를 따랐던 것인지,',
      '내가 그들 곁에 있었던 것인지.',
    ],
    demonLine: '그들이 네 곁에 모이는 건... 우연이 아니야.',
  },
  dark: {
    title: '🌑 어둠의 보석',
    lines: [
      '말 한마디로 무언가를 바꾼 기억.',
      '칼보다 깊이 닿는 것이 있다는 걸',
      '오래전부터 알고 있었다.',
      '',
      '이 지혜가 어디서 왔는지 —',
      '슬슬 물어봐야 할 것 같다.',
    ],
    demonLine: '기억이 돌아오고 있어. 천천히, 하지만 확실하게.',
  },
  earth: {
    title: '🟤 대지의 보석',
    lines: [
      '바닥까지 내려가봤다.',
      '',
      '이 미궁이 — 낯설지 않다.',
      '복도의 굽이, 돌의 결,',
      '어딘가에서 본 것 같은 구조.',
      '',
      '아니면 —',
      '내가 알고 있는 게 맞는 건지도.',
    ],
    demonLine: '이 미궁이 낯설지 않은 이유. 슬슬 느끼지 않나.',
  },
  soul: {
    title: '💜 영혼의 보석',
    lines: [
      '마지막 조각.',
      '',
      '모든 것이 돌아온다.',
      '',
      '이 미궁을 처음 만들었을 때.',
      '사람들에게 보석을 내려주었을 때.',
      '그리고 스스로 사라지기로 결심했을 때.',
      '',
      '...나는 신이었다.',
    ],
    demonLine: '...수고했다. 오래 걸렸군.',
  },
};

const INTERPRETING_LINES = [
  '흠...',
  '이 대답은... 흥미롭군.',
  '거짓말인지 진심인지 따져보는 중이다.',
  '영혼의 무게를 측정 중...',
  '판결을 내리는 중이다. 기다리거라.',
  '이 성격을 한스푼 넣고..',
  '이게 맞는 저주인지... 생각 중.',
  '내 기분에 따라 결과가 달라지기도 하지. 크하하하.',
  '거의 다 되었다.',
];

// 총 플레이 횟수에 따른 던전의 악마 인삿말
function getGreeting(totalRuns: number): { title: string; message: string } {
  if (totalRuns === 0) {
    return {
      title: '👁️ 심문을 시작한다 👁️',
      message:
        '눈을 떴군.\n\n' +
        '예상대로 기억은 없겠지.\n' +
        '괜찮다. 원래 그렇게 시작하니까.\n\n' +
        '몇 가지 묻겠다.\n' +
        '답에 따라 이번 삶의 형태가 정해진다.\n\n' +
        '거짓말해도 상관없어.\n' +
        '어차피 영혼은 속일 수 없거든.',
    };
  }
  const variants = [
    { title: '💀 또 깨어났군 💀', message: '또 왔군.\n...이번엔 뭔가 달라졌나? 어디 보자.' },
    { title: '😒 ...다시', message: '이번 삶은 내가 너무 가혹했나.\n뭐, 어쨌든. 다시 시작하지.' },
    { title: '🙄 세 번째', message: '세 번째라... 집념인지, 어리석음인지.\n구분이 안 되는군.' },
    { title: '😑 네 번', message: '네 번째군.\n솔직히 지겹지 않나? 난 지겹다.' },
    { title: '😤 다섯 번', message: '다섯 번이나... 이제 내 질문을 외울 것 같은데?\n그래도 영혼은 매번 다르지.' },
    { title: '🤦 여섯 번째', message: '여섯 번. 아직도 모르겠나.\n...뭐. 계속하지.' },
    { title: '😴 또또', message: '또. 이번엔 좀 멀리 갔다 왔나?\n느낌이 달라진 것 같기도 하고.' },
    { title: '🗿 집착', message: '이 정도면 이미 뭔가 느끼고 있을 텐데.\n아직도 모른 척인가?' },
    { title: '👁️ ...', message: '......\n묻겠다.' },
    { title: '♾️ 영원한 도전자', message: '아직도.\n...대단하군. 진심으로.' },
  ];

  const idx = Math.min(totalRuns - 1, variants.length - 1);
  return variants[idx];
}

export default function SurveyScreen() {
  const { setScreen, updateRun, meta, markGemStorySeen } = useGameState();

  // 아직 못 본 보석 스토리 목록 (수집 순서대로)
  const GEM_ORDER = ['flame', 'water', 'light', 'dark', 'earth', 'soul'];
  const unseenGems = GEM_ORDER.filter(
    (id) => meta.collectedGems.includes(id) && !meta.gemStoriesSeen.includes(id),
  );

  const [phase, setPhase] = useState<Phase>(unseenGems.length > 0 ? 'gem-reveal' : 'greeting');
  const [gemQueue] = useState<string[]>(unseenGems);
  const [currentGemIdx, setCurrentGemIdx] = useState(0);
  const [gemDemonTyped, setGemDemonTyped] = useState(false);

  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [errorPhase, setErrorPhase] = useState<'loading' | 'interpreting' | null>(null);
  const [greetingTyped, setGreetingTyped] = useState(false);
  const [finalWords, setFinalWords] = useState('');
  const [seed] = useState(() => Math.random().toString(36).substring(2, 10));
  const inputRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);
  const isComposingRef = useRef(false);

  const greeting = getGreeting(meta.totalRuns);

  const handleNextGem = useCallback(() => {
    const gemId = gemQueue[currentGemIdx];
    markGemStorySeen(gemId);
    if (currentGemIdx < gemQueue.length - 1) {
      setCurrentGemIdx((i) => i + 1);
      setGemDemonTyped(false);
    } else {
      setPhase('greeting');
    }
  }, [gemQueue, currentGemIdx, markGemStorySeen]);

  // 인사말 확인 후 질문 시작 (로컬 풀에서 즉시 선택, API 없음)
  const handleStartSurvey = () => {
    setErrorPhase(null);
    generateSurveyQuestions(meta.totalRuns).then((r) => {
      setQuestions(r.questions);
      setAnswers(new Array(r.questions.length).fill(''));
      setPhase('answering');
    });
  };

  // 문답 스킵 — 랜덤 스탯 즉시 배분
  const handleRandomStats = () => {
    const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

    const statPool: { stat: string; changes: number[] }[] = [
      { stat: 'hp',            changes: [-5, -3, 3, 5, 8] },
      { stat: 'atk',           changes: [-1, 1, 2] },
      { stat: 'def',           changes: [-1, 1, 2] },
      { stat: 'gold',          changes: [-10, -5, 5, 10, 20] },
      { stat: 'intelligence',  changes: [-1, 1] },
      { stat: 'negotiation',   changes: [-1, 1] },
      { stat: 'lockpick',      changes: [-1, 1] },
      { stat: 'stealth',       changes: [-1, 1] },
      { stat: 'strength',      changes: [-1, 1] },
      { stat: 'arcane',        changes: [-1, 1] },
    ];

    const picked = [...statPool].sort(() => Math.random() - 0.5).slice(0, 5);
    const flavorTexts = ['운명이 던진 첫 번째 패', '두 번째 패', '세 번째 패', '네 번째 패', '마지막 패'];

    const results: SurveyResult[] = picked.map((s, i) => {
      const change = pick(s.changes);
      return {
        question: '(문답 생략)',
        answer: '(스킵)',
        interpretation: '악마가 무작위로 점괘를 뽑았다.',
        flavorText: flavorTexts[i],
        statChanges: [{ stat: s.stat, change }],
        curseOrBlessing: change > 0 ? 'good' : 'bad',
      };
    });

    const traitTypes: PersonaTraitType[] = ['reckless', 'cowardly', 'greedy', 'righteous', 'cynical', 'naive', 'vengeful'];
    const traitType = pick(traitTypes);
    const traitData = PERSONA_TRAITS[traitType];
    const alignment = pick(['benevolent', 'neutral', 'malevolent'] as const);
    const names = ['이름 모를 자', '방랑자', '기억 없는 자', '이방인', '잊혀진 영혼'] as const;
    const pastLives = ['사냥꾼', '상인', '학자', '기사', '도적', '농부'] as const;

    const persona: Persona = {
      name: pick(names),
      pastLife: pick(pastLives),
      personality: traitData.name,
      alignment,
      birthNarrative: '운명에 맡겨진 존재. 악마조차 이 영혼을 읽지 못했다.',
      innateTraits: [traitData.name],
      traitType,
    };

    const lastWordEffect: LastWordEffect = {
      type: 'none',
      label: '없음',
      description: '침묵. 운명이 그 빈자리를 채웠다.',
    };

    updateRun({
      surveyResults: results,
      surveyFinalSummary: '문답을 건너뛰었다. 운명이 그 빈자리를 채웠다.',
      persona,
      lastWordEffect,
      randomSeed: seed,
      surveyAnswers: [],
    });
    setScreen('stat-reveal');
  };

  // 질문 바뀔 때 입력창 포커스
  useEffect(() => {
    if (phase === 'answering' || phase === 'final-words') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentIdx, phase]);

  const currentQ = questions[currentIdx];

  const handleSubmitAnswer = () => {
    if (submittingRef.current) return;
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    submittingRef.current = true;
    const newAnswers = [...answers];
    newAnswers[currentIdx] = trimmed;
    setAnswers(newAnswers);
    setInputValue('');

    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      setPhase('final-words');
    }

    requestAnimationFrame(() => { submittingRef.current = false; });
  };

  const handleSubmitFinalWords = async () => {
    setPhase('interpreting');
    setErrorPhase(null);
    try {
      const payload = questions.map((q, i) => ({
        question: q.text,
        answer: answers[i],
      }));
      const res = await interpretSurveyAnswers(payload, seed, finalWords.trim() || undefined);
      updateRun({
        surveyResults: res.results as SurveyResultItem[],
        surveyFinalSummary: res.finalSummary,
        persona: res.persona ?? null,
        lastWordEffect: res.lastWordEffect ?? null,
        randomSeed: seed,
        surveyAnswers: questions.map((q, i) => ({
          questionId: q.id,
          question: q.text,
          answer: answers[i],
        })),
      });
      setScreen('stat-reveal');
    } catch (e) {
      console.error(e);
      setErrorMsg('던전의 악마가 판결을 내리지 못했다... (API 오류)');
      setErrorPhase('interpreting');
      setPhase('error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // IME 조합 중(한국어 등) Enter는 조합 완료 신호이므로 제출하지 않음
      if (e.nativeEvent.isComposing || isComposingRef.current) return;
      handleSubmitAnswer();
    }
  };

  const handleFinalWordsKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.nativeEvent.isComposing || isComposingRef.current) return;
      handleSubmitFinalWords();
    }
  };

  // ── 보석 기억 파편 ──
  if (phase === 'gem-reveal') {
    const gemId = gemQueue[currentGemIdx];
    const story = GEM_STORIES[gemId];
    if (!story) {
      setPhase('greeting');
      return null;
    }
    return (
      <div
        className="w-full h-full dungeon-bg flex items-center justify-center"
        style={{ padding: '24px', cursor: 'pointer' }}
        onClick={gemDemonTyped ? handleNextGem : undefined}
      >
        <div style={{ maxWidth: '480px', width: '100%' }}>
          {/* 보석 이름 */}
          <p
            className="font-pixel text-center mb-8"
            style={{ fontSize: '13px', color: '#9878c0', letterSpacing: '4px' }}
          >
            ✦ {story.title} ✦
          </p>

          {/* 기억 본문 */}
          <div style={{ minHeight: '200px', marginBottom: '32px' }}>
            {story.lines.map((line, i) => (
              <p
                key={i}
                className="font-pixel"
                style={{
                  fontSize: '14px',
                  lineHeight: '3',
                  textAlign: 'center',
                  color: line === '' ? undefined : '#c8b0e8',
                  minHeight: line === '' ? '20px' : undefined,
                }}
              >
                {line}
              </p>
            ))}
          </div>

          {/* 악마의 한 마디 */}
          <div
            style={{
              borderLeft: '3px solid #6b4fa0',
              paddingLeft: '16px',
              marginBottom: '32px',
            }}
          >
            <div className="flex justify-center mb-2">
              <img
                src="/sprites/ui/demon.svg"
                alt=""
                width={48}
                height={48}
                style={{ imageRendering: 'pixelated', opacity: 0.85 }}
              />
            </div>
            <TypewriterText
              text={story.demonLine}
              speed={35}
              onComplete={() => setGemDemonTyped(true)}
            />
          </div>

          {/* 계속 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              opacity: gemDemonTyped ? 1 : 0,
              transition: 'opacity 0.5s ease',
            }}
          >
            <p
              className="font-pixel"
              style={{
                fontSize: '12px',
                color: '#9878c0',
                letterSpacing: '2px',
                animation: gemDemonTyped ? 'pulse 1.8s ease-in-out infinite' : 'none',
              }}
            >
              클릭하여 계속 ▶
            </p>
          </div>
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // ── 인삿말 ──
  if (phase === 'greeting') {
    return (
      <div className="flex items-center justify-center w-full h-full dungeon-bg p-4">
        <div className="w-full max-w-lg flex flex-col gap-6">
          <PixelPanel variant="brown" className="p-6 flex flex-col gap-5">
            {/* 악마 이미지 */}
            <div className="flex justify-center mb-2">
              <img
                src="/sprites/ui/demon.svg"
                alt="던전의 악마"
                width={80}
                height={80}
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            {/* 타이틀 */}
            <p
              className="font-pixel text-center"
              style={{ fontSize: '16px', color: '#f0c040', textShadow: '2px 2px 0 #7a3c00' }}
            >
              {greeting.title}
            </p>

            {/* 인삿말 타이핑 */}
            <div
              className="p-4"
              style={{
                background: '#120a1e',
                border: '2px solid #6b4fa040',
                borderLeft: '4px solid #f0c040',
                minHeight: '120px',
              }}
            >
              <TypewriterText
                text={greeting.message}
                speed={28}
                onComplete={() => setGreetingTyped(true)}
              />
            </div>

            {/* 계속하기 버튼 — 타이핑 완료 후 표시 */}
            <div
              className="flex flex-col items-center gap-3"
              style={{
                opacity: greetingTyped ? 1 : 0,
                transition: 'opacity 0.4s ease',
                pointerEvents: greetingTyped ? 'auto' : 'none',
              }}
            >
              <PixelButton variant="primary" size="lg" onClick={handleStartSurvey}>
                👁️ 계약을 이행한다
              </PixelButton>
              <PixelButton variant="secondary" size="sm" onClick={handleRandomStats}>
                🎲 운명에 맡긴다 (랜덤 스탯)
              </PixelButton>
              <PixelButton variant="ghost" size="sm" onClick={() => setScreen('title')}>
                ← 도망치다
              </PixelButton>
            </div>
          </PixelPanel>

          {/* 빠른 진행 — 타이핑 중에도 클릭 가능 */}
          {!greetingTyped && (
            <p
              className="font-pixel text-center cursor-pointer"
              style={{ fontSize: '12px', color: '#9878c0' }}
              onClick={() => setGreetingTyped(true)}
            >
              (클릭하면 넘어갑니다)
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── 해석 중 ──
  if (phase === 'interpreting') {
    return (
      <div className="flex items-center justify-center w-full h-full dungeon-bg p-4">
        <div className="w-full max-w-lg">
          <PixelPanel variant="brown" className="p-6 flex flex-col gap-5">
            <p className="font-pixel text-center" style={{ fontSize: '16px', color: '#e04040', textShadow: '2px 2px 0 #7a0000' }}>
              💀 판결을 내리는 중... 💀
            </p>
            <div
              className="p-4"
              style={{
                background: '#120a1e',
                border: '2px solid #6b4fa040',
                borderLeft: '4px solid #e04040',
                minHeight: '72px',
              }}
            >
              <GodMonologue lines={INTERPRETING_LINES} />
            </div>
          </PixelPanel>
        </div>
      </div>
    );
  }

  // ── 마지막 할 말 ──
  if (phase === 'final-words') {
    return (
      <div className="flex items-center justify-center w-full h-full dungeon-bg p-4">
        <div className="w-full max-w-lg flex flex-col gap-6">
          <PixelPanel variant="brown" className="p-6 flex flex-col gap-5">
            <p
              className="font-pixel text-center"
              style={{ fontSize: '16px', color: '#e04040', textShadow: '2px 2px 0 #7a0000' }}
            >
              💀 마지막으로 할 말은? 💀
            </p>

            <div
              className="p-4"
              style={{
                background: '#120a1e',
                border: '2px solid #6b4fa040',
                borderLeft: '4px solid #e04040',
              }}
            >
              <TypewriterText
                text={'5가지 판결이 끝났다.\n\n...마지막으로 하고 싶은 말이 있나?\n감언이설도 좋고, 욕도 좋다.\n다만 결과는... 내 기분 나름이다.'}
                speed={25}
              />
            </div>

            <div className="flex gap-3 items-stretch">
              <PixelInput
                ref={inputRef}
                placeholder="악마에게 무슨 말이든..."
                value={finalWords}
                onChange={(e) => setFinalWords(e.target.value)}
                onKeyDown={handleFinalWordsKeyDown}
                onCompositionStart={() => { isComposingRef.current = true; }}
                onCompositionEnd={() => { requestAnimationFrame(() => { isComposingRef.current = false; }); }}
                className="flex-1"
              />
              <PixelButton
                variant="primary"
                size="md"
                onClick={handleSubmitFinalWords}
              >
                고한다 ✓
              </PixelButton>
            </div>

            <div className="flex justify-center">
              <PixelButton
                variant="ghost"
                size="sm"
                onClick={handleSubmitFinalWords}
              >
                아무 말도 하지 않는다
              </PixelButton>
            </div>

            <p className="font-pixel text-center" style={{ fontSize: '12px', color: '#9878c0' }}>
              ⚠️ 악마는 변덕스럽다. 아첨도 독이 될 수 있다.
            </p>
          </PixelPanel>
        </div>
      </div>
    );
  }

  // ── 오류 ──
  if (phase === 'error') {
    const handleRetry = errorPhase === 'interpreting' ? handleSubmitFinalWords : handleStartSurvey;
    const retryLabel = errorPhase === 'interpreting' ? '🔄 판결 재시도' : '🔄 다시 시도';
    return (
      <div className="flex items-center justify-center w-full h-full dungeon-bg">
        <PixelPanel variant="dark" className="p-8 text-center space-y-6">
          <p className="font-pixel text-sm" style={{ color: '#e04040' }}>⚠️ 오류 발생</p>
          <p className="font-pixel" style={{ fontSize: '12px', color: '#9878c0' }}>{errorMsg}</p>
          {errorPhase === 'interpreting' && (
            <p className="font-pixel" style={{ fontSize: '11px', color: '#6b4fa0' }}>
              5개의 답변은 그대로 보존됩니다
            </p>
          )}
          <PixelButton variant="secondary" onClick={handleRetry}>{retryLabel}</PixelButton>
          <PixelButton variant="ghost" onClick={() => setScreen('title')}>← 돌아가기</PixelButton>
        </PixelPanel>
      </div>
    );
  }

  // ── 질문 답변 ──
  const progress = (currentIdx / questions.length) * 100;

  return (
    <div className="flex items-center justify-center w-full h-full dungeon-bg p-4">
      <div className="w-full max-w-lg flex flex-col gap-6">

        <div className="text-center">
          <p className="font-pixel text-sm" style={{ color: '#f0c040', textShadow: '2px 2px 0 #7a3c00' }}>
            👁️ 던전의 악마가 심문한다 👁️
          </p>
        </div>

        {/* 진행 바 */}
        <div>
          <div style={{ height: '6px', background: '#1a0f2e', border: '2px solid #4a2d7a' }}>
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: '#f0c040',
                transition: 'width 0.3s ease-out',
              }}
            />
          </div>
          <p className="font-pixel text-center mt-1" style={{ fontSize: '12px', color: '#6b4fa0' }}>
            {currentIdx + 1} / {questions.length}
          </p>
        </div>

        <PixelPanel variant="brown" className="p-6 flex flex-col gap-5">
          {/* 이전 답변 요약 */}
          {currentIdx > 0 && (
            <div className="space-y-1 pb-4" style={{ borderBottom: '2px solid #5a3a10' }}>
              {questions.slice(0, currentIdx).map((q, i) => (
                <div key={q.id} className="flex gap-2 items-start">
                  <span className="font-pixel shrink-0" style={{ fontSize: '11px', color: '#6b4fa0' }}>Q{i + 1}.</span>
                  <span className="font-pixel flex-1" style={{ fontSize: '11px', color: '#9878c0' }}>{q.text}</span>
                  <span className="font-pixel shrink-0 ml-2" style={{ fontSize: '11px', color: '#f0c040' }}>→ {answers[i]}</span>
                </div>
              ))}
            </div>
          )}

          {/* 현재 질문 */}
          {currentQ && (
            <div className="space-y-4">
              <TypewriterText
                key={currentQ.id}
                text={`Q${currentIdx + 1}. ${currentQ.text}`}
                speed={25}
              />
              <div className="flex gap-3 items-stretch">
                <PixelInput
                  ref={inputRef}
                  inputMode={currentQ.type === 'number' ? 'numeric' : 'text'}
                  placeholder={currentQ.type === 'number' ? '숫자로 답하라...' : '솔직하게 답하라...'}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onCompositionStart={() => { isComposingRef.current = true; }}
                  onCompositionEnd={() => { requestAnimationFrame(() => { isComposingRef.current = false; }); }}
                  className="flex-1"
                />
                <PixelButton
                  variant="primary"
                  size="md"
                  onClick={handleSubmitAnswer}
                  disabled={!inputValue.trim()}
                >
                  {currentIdx < questions.length - 1 ? '답하라 →' : '완료 ✓'}
                </PixelButton>
              </div>
              <p className="font-pixel" style={{ fontSize: '12px', color: '#9878c0' }}>
                ⚠️ 신중하게 답하라. 결과는 예측할 수 없다.
              </p>
            </div>
          )}
        </PixelPanel>

        <div className="text-center">
          <PixelButton variant="ghost" size="sm" onClick={() => setScreen('title')}>
            ← 도망치다
          </PixelButton>
        </div>
      </div>
    </div>
  );
}

function GodMonologue({ lines }: { lines: string[] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % lines.length), 2400);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <p className="font-pixel" style={{ fontSize: '12px', color: '#e8d8b8', lineHeight: 2.2 }}>
      {lines[idx]}
    </p>
  );
}
