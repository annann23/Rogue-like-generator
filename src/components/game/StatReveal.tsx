import { useState, useEffect } from 'react';
import { useGameState, type SurveyResult } from '@/hooks/useGameState';
import { PixelPanel, PixelButton, PixelDivider, TypewriterText } from './UIFrame';

const STAT_LABELS: Record<string, string> = {
  hp: '❤️ HP',
  atk: '⚔️ ATK',
  attack: '⚔️ ATK',
  def: '🛡️ DEF',
  defense: '🛡️ DEF',
  gold: '💰 골드',
  intelligence: '🧠 지능',
  negotiation: '🗣️ 협상력',
  lockpick: '🔓 자물쇠',
  stealth: '👁️ 은신',
  strength: '💪 완력',
  arcane: '✨ 마법감지',
};

const BLESSING_COLOR: Record<string, string> = {
  good:   '#40c040',
  bad:    '#e04040',
  mixed:  '#f0c040',
  curse:  '#c040c0',
};

const BLESSING_LABEL: Record<string, string> = {
  good:   '✨ 축복',
  bad:    '💀 저주',
  mixed:  '⚖️ 혼합',
  curse:  '🗿 저주받음',
};

function StatChangeBadge({ stat, change }: { stat: string; change: number }) {
  const isPositive = change > 0;
  const color = isPositive ? '#40c040' : '#e04040';
  const sign = isPositive ? '+' : '';
  const label = STAT_LABELS[stat] ?? stat;
  return (
    <span
      className="font-pixel inline-block px-2 py-1 mr-1 mb-1"
      style={{
        fontSize: '7px',
        color,
        background: `${color}18`,
        border: `2px solid ${color}60`,
      }}
    >
      {label} {sign}{change}
    </span>
  );
}

// 결과 카드 — visible prop으로 fade-in 제어
function ResultCard({
  result,
  index,
  visible,
  typing,        // 현재 이 카드가 타이핑 중인지
  onTypingDone,
}: {
  result: SurveyResult;
  index: number;
  visible: boolean;
  typing: boolean;
  onTypingDone: () => void;
}) {
  const accentColor = BLESSING_COLOR[result.curseOrBlessing] ?? '#f0c040';

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.45s ease ${index * 0.08}s, transform 0.45s ease ${index * 0.08}s`,
      }}
    >
      <PixelPanel variant="dark" className="p-4">
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <span className="font-pixel" style={{ fontSize: '7px', color: '#6b4fa0' }}>
              Q{index + 1}.
            </span>
            <span className="font-pixel ml-2" style={{ fontSize: '7px', color: '#9878c0' }}>
              {result.question}
            </span>
          </div>
          <span
            className="font-pixel shrink-0 px-2 py-1"
            style={{
              fontSize: '6px',
              color: accentColor,
              border: `2px solid ${accentColor}60`,
              background: `${accentColor}18`,
            }}
          >
            {BLESSING_LABEL[result.curseOrBlessing]}
          </span>
        </div>

        {/* 답변 */}
        <p className="font-pixel mb-3" style={{ fontSize: '7px', color: '#c8874a' }}>
          → &quot;{result.answer}&quot;
        </p>

        {/* 신의 해석 */}
        <div
          className="p-3 mb-3"
          style={{
            background: '#120a1e',
            borderLeft: `4px solid ${accentColor}`,
            border: `2px solid ${accentColor}30`,
            borderLeftWidth: '4px',
            minHeight: '40px',
          }}
        >
          {typing ? (
            <TypewriterText
              text={result.interpretation}
              speed={18}
              onComplete={onTypingDone}
            />
          ) : (
            <p className="font-pixel" style={{ fontSize: '8px', lineHeight: '2', color: '#e8d8b8' }}>
              {result.interpretation}
            </p>
          )}
        </div>

        {/* 플레이버 텍스트 */}
        {result.flavorText && (
          <p className="font-pixel mb-3" style={{ fontSize: '7px', color: '#6b4fa0', fontStyle: 'italic' }}>
            &ldquo;{result.flavorText}&rdquo;
          </p>
        )}

        {/* 스탯 변화 — 모두 표시 */}
        {result.statChanges && result.statChanges.length > 0 ? (
          <div className="flex flex-wrap gap-0">
            {result.statChanges.map((sc, i) => (
              <StatChangeBadge key={i} stat={sc.stat} change={sc.change} />
            ))}
          </div>
        ) : (
          <p className="font-pixel" style={{ fontSize: '6px', color: '#4a3070' }}>
            스탯 변화 없음
          </p>
        )}
      </PixelPanel>
    </div>
  );
}

// 최종 스탯 미리보기 계산 (클래스 선택 전이라 기본값 기준)
function calcTotalChanges(results: SurveyResult[]) {
  const totals: Record<string, number> = {};
  for (const r of results) {
    for (const { stat, change } of r.statChanges ?? []) {
      const key = stat === 'attack' ? 'atk' : stat === 'defense' ? 'def' : stat;
      totals[key] = (totals[key] ?? 0) + change;
    }
  }
  return totals;
}

export default function StatReveal() {
  const { run, setScreen } = useGameState();
  const results = run.surveyResults;

  // 표시된 카드 수 (순차 공개)
  const [revealedCount, setRevealedCount] = useState(0);
  // 현재 타이핑 중인 카드 인덱스
  const [typingIdx, setTypingIdx] = useState(0);
  // 최종 요약 표시 여부
  const [showSummary, setShowSummary] = useState(false);
  const [canProceed, setCanProceed] = useState(false);

  // 설문 결과가 없으면 스킵
  useEffect(() => {
    if (results.length === 0) {
      setScreen('character-select');
      return;
    }
    // 카드를 0.6초 간격으로 순차 공개
    let count = 0;
    const reveal = () => {
      count++;
      setRevealedCount(count);
      if (count < results.length) {
        setTimeout(reveal, 600);
      }
    };
    setTimeout(reveal, 300);
  }, []);

  // 카드 타이핑 완료 → 다음 카드 타이핑 시작
  const handleTypingDone = () => {
    const next = typingIdx + 1;
    if (next < results.length) {
      setTypingIdx(next);
    } else {
      // 모든 카드 타이핑 완료 → 최종 요약 표시
      setTimeout(() => {
        setShowSummary(true);
        setTimeout(() => setCanProceed(true), 800);
      }, 400);
    }
  };

  if (results.length === 0) return null;

  const totalChanges = calcTotalChanges(results);
  const changedStats = Object.entries(totalChanges).filter(([, v]) => v !== 0);

  return (
    <div className="flex items-center justify-center w-full h-full dungeon-bg p-4 overflow-y-auto">
      <div className="w-full max-w-lg flex flex-col gap-4 py-4">

        {/* 헤더 */}
        <div className="text-center">
          <p
            className="font-pixel"
            style={{ fontSize: '11px', color: '#e04040', textShadow: '2px 2px 0 #7a0000' }}
          >
            💀 던전의 신이 판결한다 💀
          </p>
        </div>

        {/* 결과 카드 5개 */}
        <div className="flex flex-col gap-3">
          {results.map((result, i) => (
            <ResultCard
              key={i}
              result={result}
              index={i}
              visible={i < revealedCount}
              typing={i === typingIdx && i < revealedCount}
              onTypingDone={handleTypingDone}
            />
          ))}
        </div>

        {/* 최종 요약 */}
        {showSummary && (
          <div
            style={{
              opacity: showSummary ? 1 : 0,
              transition: 'opacity 0.5s ease',
            }}
          >
            <PixelDivider label="신의 최종 판결" className="my-2" />

            {/* finalSummary */}
            <PixelPanel variant="brown" className="p-4 my-3">
              <TypewriterText
                text={run.surveyFinalSummary || '신은 아무 말도 하지 않는다...'}
                speed={22}
              />
            </PixelPanel>

            {/* 전체 스탯 변화 총합 */}
            {changedStats.length > 0 && (
              <PixelPanel variant="dark" className="p-4 mt-3">
                <p className="font-pixel mb-3" style={{ fontSize: '7px', color: '#9878c0' }}>
                  설문 결과 총 스탯 변화
                </p>
                <div className="flex flex-wrap gap-1">
                  {changedStats.map(([stat, val]) => (
                    <StatChangeBadge key={stat} stat={stat} change={val} />
                  ))}
                </div>
                <p className="font-pixel mt-3" style={{ fontSize: '6px', color: '#4a3070' }}>
                  ※ 선택한 클래스 기본 스탯에 가산됩니다
                </p>
              </PixelPanel>
            )}

            {/* 진행 버튼 */}
            {canProceed && (
              <div className="flex justify-center mt-5">
                <PixelButton
                  variant="primary"
                  size="lg"
                  onClick={() => setScreen('character-select')}
                >
                  ⚔️ 운명을 받아들인다
                </PixelButton>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
