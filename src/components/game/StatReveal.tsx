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

// 스탯 변화 수치 표현
function StatChangeBadge({ stat, change }: { stat: string; change: number }) {
  const isPositive = change > 0;
  const color = isPositive ? '#40c040' : '#e04040';
  const sign = isPositive ? '+' : '';
  const label = STAT_LABELS[stat] ?? stat;

  return (
    <span
      className="font-pixel inline-block px-2 py-1 mr-2 mb-1"
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

// 결과 카드 1개
function ResultCard({
  result,
  index,
  visible,
  onTypingDone,
}: {
  result: SurveyResult;
  index: number;
  visible: boolean;
  onTypingDone: () => void;
}) {
  const accentColor = BLESSING_COLOR[result.curseOrBlessing] ?? '#f0c040';

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}
    >
      <PixelPanel variant="dark" className="p-4">
        {/* Q 번호 + 축복/저주 배지 */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-pixel" style={{ fontSize: '7px', color: '#6b4fa0' }}>
            Q{index + 1}. {result.question}
          </span>
          <span
            className="font-pixel px-2 py-1 shrink-0 ml-2"
            style={{ fontSize: '6px', color: accentColor, border: `2px solid ${accentColor}60`, background: `${accentColor}18` }}
          >
            {BLESSING_LABEL[result.curseOrBlessing]}
          </span>
        </div>

        {/* 답변 */}
        <p className="font-pixel mb-3" style={{ fontSize: '7px', color: '#9878c0' }}>
          → &quot;{result.answer}&quot;
        </p>

        {/* 신의 해석 (타이핑) */}
        <div
          className="p-3 mb-3"
          style={{
            background: '#120a1e',
            border: `2px solid ${accentColor}40`,
            borderLeft: `4px solid ${accentColor}`,
          }}
        >
          <TypewriterText
            text={result.interpretation}
            speed={20}
            onComplete={onTypingDone}
          />
        </div>

        {/* 플레이버 텍스트 */}
        <p className="font-pixel mb-3 italic" style={{ fontSize: '7px', color: '#6b4fa0' }}>
          "{result.flavorText}"
        </p>

        {/* 스탯 변화 */}
        <div className="flex flex-wrap">
          {result.statChanges.map((sc, i) => (
            <StatChangeBadge key={i} stat={sc.stat} change={sc.change} />
          ))}
        </div>
      </PixelPanel>
    </div>
  );
}

// 최종 스탯 계산
function calcFinalStats(
  results: SurveyResult[],
  base = { hp: 100, atk: 10, def: 5 },
) {
  const totals: Record<string, number> = { hp: base.hp, atk: base.atk, def: base.def };
  for (const r of results) {
    for (const { stat, change } of r.statChanges) {
      const key = stat === 'attack' ? 'atk' : stat === 'defense' ? 'def' : stat;
      if (key in totals) totals[key] = (totals[key] ?? 0) + change;
    }
  }
  totals.hp = Math.max(10, totals.hp);
  totals.atk = Math.max(1, totals.atk);
  totals.def = Math.max(0, totals.def);
  return totals;
}

export default function StatReveal() {
  const { run, setScreen } = useGameState();
  const results = run.surveyResults;

  // 몇 번째 카드까지 표시됐는지
  const [revealedCount, setRevealedCount] = useState(0);
  // 현재 카드 타이핑 완료됐는지
  const [typingDone, setTypingDone] = useState(false);
  // 최종 요약까지 표시됐는지
  const [showSummary, setShowSummary] = useState(false);
  // 버튼 활성화
  const [canProceed, setCanProceed] = useState(false);

  const allRevealed = revealedCount >= results.length;

  // 설문 결과가 없으면 (직접 접근 등) 스킵
  useEffect(() => {
    if (results.length === 0) {
      setScreen('character-select');
    } else {
      // 첫 카드 바로 표시
      setRevealedCount(1);
    }
  }, []);

  // 타이핑 완료 → 다음 버튼 활성화
  const handleTypingDone = () => setTypingDone(true);

  // 다음 카드 공개
  const handleNext = () => {
    if (!allRevealed) {
      setRevealedCount((c) => c + 1);
      setTypingDone(false);
    } else if (!showSummary) {
      setShowSummary(true);
      setTimeout(() => setCanProceed(true), 600);
    }
  };

  const finalStats = calcFinalStats(results);
  const isLastCard = revealedCount === results.length && !showSummary;
  const showNextBtn = typingDone && !canProceed;

  if (results.length === 0) return null;

  return (
    <div className="flex items-center justify-center w-full h-full dungeon-bg p-4 overflow-y-auto">
      <div className="w-full max-w-lg flex flex-col gap-4 py-4">

        {/* 헤더 */}
        <div className="text-center">
          <p
            className="font-pixel text-sm"
            style={{ color: '#e04040', textShadow: '2px 2px 0 #7a0000' }}
          >
            💀 던전의 신이 판결한다 💀
          </p>
        </div>

        {/* 결과 카드들 */}
        <div className="flex flex-col gap-3">
          {results.map((result, i) => (
            <ResultCard
              key={i}
              result={result}
              index={i}
              visible={i < revealedCount}
              onTypingDone={i === revealedCount - 1 ? handleTypingDone : () => {}}
            />
          ))}
        </div>

        {/* 다음/최종 버튼 */}
        {showNextBtn && (
          <div className="flex justify-center">
            <PixelButton
              variant="secondary"
              size="md"
              onClick={handleNext}
            >
              {isLastCard ? '판결을 듣는다 →' : `다음 판결 (${revealedCount}/${results.length}) →`}
            </PixelButton>
          </div>
        )}

        {/* 최종 요약 */}
        {showSummary && (
          <div
            style={{
              opacity: showSummary ? 1 : 0,
              transition: 'opacity 0.5s ease',
            }}
          >
            <PixelDivider label="신의 최종 판결" />

            {/* finalSummary */}
            <PixelPanel variant="brown" className="p-4 my-3 text-center">
              <TypewriterText
                text={run.surveyFinalSummary || '신은 아무 말도 하지 않는다...'}
                speed={25}
              />
            </PixelPanel>

            {/* 최종 스탯 */}
            <PixelPanel variant="dark" className="p-4 mt-3">
              <p className="font-pixel mb-3 text-center" style={{ fontSize: '7px', color: '#9878c0' }}>
                최종 초기 스탯
              </p>
              <div className="flex justify-center gap-6">
                <div className="text-center">
                  <p className="font-pixel" style={{ fontSize: '8px', color: '#e04040' }}>❤️ HP</p>
                  <p className="font-pixel mt-1" style={{ fontSize: '12px', color: '#f0c040' }}>{finalStats.hp}</p>
                </div>
                <div className="text-center">
                  <p className="font-pixel" style={{ fontSize: '8px', color: '#e8d8b8' }}>⚔️ ATK</p>
                  <p className="font-pixel mt-1" style={{ fontSize: '12px', color: '#f0c040' }}>{finalStats.atk}</p>
                </div>
                <div className="text-center">
                  <p className="font-pixel" style={{ fontSize: '8px', color: '#e8d8b8' }}>🛡️ DEF</p>
                  <p className="font-pixel mt-1" style={{ fontSize: '12px', color: '#f0c040' }}>{finalStats.def}</p>
                </div>
              </div>
              <p className="font-pixel text-center mt-3" style={{ fontSize: '6px', color: '#4a3070' }}>
                ※ 클래스 기본 스탯에 위 수치가 가산됩니다
              </p>
            </PixelPanel>

            {/* 진행 버튼 */}
            {canProceed && (
              <div
                className="flex justify-center mt-4"
                style={{ animation: 'fadeIn 0.4s ease' }}
              >
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
