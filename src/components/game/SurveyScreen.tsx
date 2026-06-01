import { useState, useEffect, useRef } from 'react';
import { useGameState } from '@/hooks/useGameState';
import {
  generateSurveyQuestions,
  interpretSurveyAnswers,
  type SurveyQuestion,
  type SurveyResultItem,
} from '@/hooks/useClaude';
import { PixelPanel, PixelButton, PixelInput, TypewriterText } from './UIFrame';

type Phase = 'loading' | 'answering' | 'interpreting' | 'error';

export default function SurveyScreen() {
  const { setScreen, updateRun } = useGameState();

  const [phase, setPhase] = useState<Phase>('loading');
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [seed] = useState(() => Math.random().toString(36).substring(2, 10));
  const inputRef = useRef<HTMLInputElement>(null);

  // 설문 생성
  useEffect(() => {
    generateSurveyQuestions()
      .then((res) => {
        setQuestions(res.questions);
        setAnswers(new Array(res.questions.length).fill(''));
        setPhase('answering');
      })
      .catch((e) => {
        console.error(e);
        setErrorMsg('던전의 신이 응답하지 않는다... (API 오류)');
        setPhase('error');
      });
  }, []);

  // 질문 바뀔 때 입력창 포커스
  useEffect(() => {
    if (phase === 'answering') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentIdx, phase]);

  const currentQ = questions[currentIdx];

  const handleSubmitAnswer = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const newAnswers = [...answers];
    newAnswers[currentIdx] = trimmed;
    setAnswers(newAnswers);
    setInputValue('');

    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      // 모든 답변 완료 → 해석 요청
      setPhase('interpreting');
      try {
        const payload = questions.map((q, i) => ({
          question: q.text,
          answer: newAnswers[i],
        }));
        const res = await interpretSurveyAnswers(payload, seed);

        // 결과를 게임 상태에 저장
        updateRun({
          surveyResults: res.results as SurveyResultItem[],
          randomSeed: seed,
          surveyAnswers: questions.map((q, i) => ({
            questionId: q.id,
            question: q.text,
            answer: newAnswers[i],
          })),
        });
        setScreen('stat-reveal');
      } catch (e) {
        console.error(e);
        setErrorMsg('던전의 신이 판결을 내리지 못했다... (API 오류)');
        setPhase('error');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmitAnswer();
  };

  // ── 로딩 ──
  if (phase === 'loading') {
    return (
      <div className="flex items-center justify-center w-full h-full dungeon-bg">
        <PixelPanel variant="dark" className="p-8 text-center">
          <p className="font-pixel text-sm mb-6" style={{ color: '#f0c040' }}>
            ⚡ 던전의 신이 깨어난다 ⚡
          </p>
          <LoadingDots />
          <p className="font-pixel mt-4" style={{ fontSize: '7px', color: '#6b4fa0' }}>
            질문을 준비하는 중...
          </p>
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
          <p className="font-pixel mt-4" style={{ fontSize: '7px', color: '#9878c0' }}>
            당신의 답변을 분석하는 중...
          </p>
        </PixelPanel>
      </div>
    );
  }

  // ── 오류 ──
  if (phase === 'error') {
    return (
      <div className="flex items-center justify-center w-full h-full dungeon-bg">
        <PixelPanel variant="dark" className="p-8 text-center space-y-6">
          <p className="font-pixel text-sm" style={{ color: '#e04040' }}>⚠️ 오류 발생</p>
          <p className="font-pixel" style={{ fontSize: '7px', color: '#9878c0' }}>{errorMsg}</p>
          <PixelButton variant="secondary" onClick={() => {
            setPhase('loading');
            setErrorMsg('');
            setCurrentIdx(0);
            setAnswers([]);
            generateSurveyQuestions()
              .then((res) => { setQuestions(res.questions); setAnswers(new Array(res.questions.length).fill('')); setPhase('answering'); })
              .catch(() => { setErrorMsg('재시도 실패'); setPhase('error'); });
          }}>
            🔄 다시 시도
          </PixelButton>
          <PixelButton variant="ghost" onClick={() => setScreen('title')}>
            ← 돌아가기
          </PixelButton>
        </PixelPanel>
      </div>
    );
  }

  // ── 질문 답변 ──
  const progress = ((currentIdx) / questions.length) * 100;

  return (
    <div className="flex items-center justify-center w-full h-full dungeon-bg p-4">
      <div className="w-full max-w-lg flex flex-col gap-6">

        {/* 헤더 */}
        <div className="text-center">
          <p className="font-pixel text-sm" style={{ color: '#f0c040', textShadow: '2px 2px 0 #7a3c00' }}>
            ⚡ 던전의 신이 묻는다 ⚡
          </p>
        </div>

        {/* 진행 바 */}
        <div className="w-full" style={{ height: '6px', background: '#1a0f2e', border: '2px solid #4a2d7a' }}>
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: '#f0c040',
              transition: 'width 0.3s ease-out',
            }}
          />
        </div>
        <p className="font-pixel text-center" style={{ fontSize: '7px', color: '#6b4fa0', marginTop: '-16px' }}>
          {currentIdx + 1} / {questions.length}
        </p>

        {/* 질문 패널 */}
        <PixelPanel variant="brown" className="p-6 flex flex-col gap-6">

          {/* 이전 답변 요약 */}
          {currentIdx > 0 && (
            <div className="space-y-1 pb-4" style={{ borderBottom: '2px solid #5a3a10' }}>
              {questions.slice(0, currentIdx).map((q, i) => (
                <div key={q.id} className="flex gap-2 items-start">
                  <span className="font-pixel shrink-0" style={{ fontSize: '6px', color: '#6b4fa0' }}>
                    Q{i + 1}.
                  </span>
                  <span className="font-pixel" style={{ fontSize: '6px', color: '#4a3070' }}>
                    {q.text}
                  </span>
                  <span className="font-pixel ml-auto shrink-0" style={{ fontSize: '6px', color: '#f0c040' }}>
                    → {answers[i]}
                  </span>
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

              <div className="flex gap-3 items-stretch mt-2">
                <PixelInput
                  ref={inputRef}
                  type={currentQ.type === 'number' ? 'text' : 'text'}
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

              <p className="font-pixel" style={{ fontSize: '6px', color: '#4a3070' }}>
                ⚠️ 신중하게 답하라. 결과는 예측할 수 없다.
              </p>
            </div>
          )}
        </PixelPanel>

        {/* 돌아가기 */}
        <div className="text-center">
          <PixelButton variant="ghost" size="sm" onClick={() => setScreen('title')}>
            ← 도망치다
          </PixelButton>
        </div>
      </div>
    </div>
  );
}

// 로딩 애니메이션
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
