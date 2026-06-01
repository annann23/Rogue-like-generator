import { useState, useEffect, useRef } from 'react';
import { useGameState } from '@/hooks/useGameState';
import {
  generateSurveyQuestions,
  interpretSurveyAnswers,
  type SurveyQuestion,
  type SurveyResultItem,
} from '@/hooks/useClaude';
import { PixelPanel, PixelButton, PixelInput, TypewriterText } from './UIFrame';

type Phase = 'greeting' | 'loading' | 'answering' | 'final-words' | 'interpreting' | 'error';

// 총 플레이 횟수에 따른 던전의 신 인삿말
function getGreeting(totalRuns: number): { title: string; message: string } {
  if (totalRuns === 0) {
    return {
      title: '⚡ 새로운 영혼이여 ⚡',
      message:
        '처음 보는 얼굴이로군.\n\n' +
        '환생하려면 내 질문 다섯 가지에 답해야 하네.\n' +
        '겉으론 평범해 보이는 질문들이지만... 답에 따라\n' +
        '좋은 출발이 될 수도, 끔찍한 저주가 될 수도 있지.\n\n' +
        '정직하게 답하거나, 거짓말을 하거나.\n' +
        '결과는 어차피 내 마음대로니까.',
    };
  }
  const variants = [
    { title: '💀 또 왔군 💀', message: '또 왔군...\n이번엔 더 잘할 것 같나? 어디 보자.' },
    { title: '😒 ...다시', message: '이번 삶은 내가 너무 과했나?\n뭐, 어쨌든. 다시 해보지.' },
    { title: '🙄 세 번째', message: '세 번째라... 집념인지, 어리석음인지.\n구분이 안 되는군.' },
    { title: '😑 네 번', message: '네 번째군.\n솔직히 지겹지 않나? 난 지겹다.' },
    { title: '😤 다섯 번', message: '다섯 번이나... 이제 내 질문을 외울 것 같은데?\n그래도 답은 변덕대로 해석하지.' },
    { title: '🤦 여섯 번째', message: '여섯 번. 집착이 대단하군.\n..칭찬이 아니야.' },
    { title: '😴 또또', message: '또. 할 일이 없나?\n뭐, 나도 심심했으니까 받아주지.' },
    { title: '🗿 집착', message: '이 정도면 던전이 좋은 건지,\n나를 좋아하는 건지 모르겠군. 불편하다.' },
    { title: '👁️ ...', message: '말이 없어졌군. 나도 없애지.\n질문이나 하지.' },
    { title: '♾️ 영원한 도전자', message: '죽음이 두렵지 않다는 건 알았어.\n그런데 이기는 것도 안 되잖아?' },
  ];

  const idx = Math.min(totalRuns - 1, variants.length - 1);
  return variants[idx];
}

export default function SurveyScreen() {
  const { setScreen, updateRun, meta } = useGameState();

  const [phase, setPhase] = useState<Phase>('greeting');
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

  const greeting = getGreeting(meta.totalRuns);

  // 인사말 확인 후 설문 로딩 시작
  const handleStartSurvey = () => {
    setPhase('loading');
    setErrorPhase(null);
    generateSurveyQuestions(meta.totalRuns)
      .then((res) => {
        setQuestions(res.questions);
        setAnswers(new Array(res.questions.length).fill(''));
        setPhase('answering');
      })
      .catch((e) => {
        console.error(e);
        setErrorMsg('던전의 신이 응답하지 않는다... (API 오류)');
        setErrorPhase('loading');
        setPhase('error');
      });
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
      setErrorMsg('던전의 신이 판결을 내리지 못했다... (API 오류)');
      setErrorPhase('interpreting');
      setPhase('error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  const handleFinalWordsKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmitFinalWords();
    }
  };

  // ── 인삿말 ──
  if (phase === 'greeting') {
    return (
      <div className="flex items-center justify-center w-full h-full dungeon-bg p-4">
        <div className="w-full max-w-lg flex flex-col gap-6">
          <PixelPanel variant="brown" className="p-6 flex flex-col gap-5">
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
                📜 질문을 받겠다
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
              style={{ fontSize: '12px', color: '#4a3070' }}
              onClick={() => setGreetingTyped(true)}
            >
              (클릭하면 넘어갑니다)
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── 로딩 ──
  if (phase === 'loading') {
    return (
      <div className="flex items-center justify-center w-full h-full dungeon-bg">
        <PixelPanel variant="dark" className="p-8 text-center">
          <p className="font-pixel text-sm mb-6" style={{ color: '#f0c040' }}>
            ⚡ 던전의 신이 질문을 준비한다 ⚡
          </p>
          <LoadingDots />
        </PixelPanel>
      </div>
    );
  }

  // ── 해석 중 ──
  if (phase === 'interpreting') {
    return (
      <div className="flex items-center justify-center w-full h-full dungeon-bg">
        <PixelPanel variant="brown" className="p-8 text-center">
          <p className="font-pixel text-sm mb-6" style={{ color: '#f0c040' }}>
            💀 던전의 신이 판결을 내린다 💀
          </p>
          <LoadingDots color="#c8874a" />
          <p className="font-pixel mt-4" style={{ fontSize: '12px', color: '#9878c0' }}>
            {questions.length}개의 답변을 분석하는 중...
          </p>
        </PixelPanel>
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
                placeholder="신에게 무슨 말이든..."
                value={finalWords}
                onChange={(e) => setFinalWords(e.target.value)}
                onKeyDown={handleFinalWordsKeyDown}
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
                (아무 말도 하지 않는다)
              </PixelButton>
            </div>

            <p className="font-pixel text-center" style={{ fontSize: '12px', color: '#4a3070' }}>
              ⚠️ 신은 변덕스럽다. 아첨도 독이 될 수 있다.
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
            ⚡ 던전의 신이 묻는다 ⚡
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
                  <span className="font-pixel flex-1" style={{ fontSize: '11px', color: '#4a3070' }}>{q.text}</span>
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
              <p className="font-pixel" style={{ fontSize: '12px', color: '#4a3070' }}>
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

function LoadingDots({ color = '#f0c040' }: { color?: string }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: '8px',
            height: '8px',
            background: color,
            animation: `blink 1.2s step-end ${i * 0.4}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
