import { useState, useEffect } from 'react';
import { useGameState, type SurveyResult } from '@/hooks/useGameState';
import { PixelPanel, PixelButton, PixelDivider, TypewriterText } from './UIFrame';

const STAT_LABELS: Record<string, string> = {
  hp: '❤️ HP', atk: '⚔️ ATK', attack: '⚔️ ATK',
  def: '🛡️ DEF', defense: '🛡️ DEF', gold: '💰 골드',
  intelligence: '🧠 지능', negotiation: '🗣️ 협상력',
  lockpick: '🔓 자물쇠', stealth: '👁️ 은신',
  strength: '💪 완력', arcane: '✨ 마법감지',
};

const BLESSING_COLOR: Record<string, string> = {
  good: '#40c040', bad: '#e04040', mixed: '#f0c040', curse: '#c040c0',
};
const BLESSING_LABEL: Record<string, string> = {
  good: '✨ 축복', bad: '💀 저주', mixed: '⚖️ 혼합', curse: '🗿 저주받음',
};

function StatChangeBadge({ stat, change }: { stat: string; change: number }) {
  const isPositive = change > 0;
  const color = isPositive ? '#40c040' : '#e04040';
  return (
    <span
      className="font-pixel inline-block px-3 py-1 mr-2 mb-2"
      style={{ fontSize: '12px', color, background: `${color}18`, border: `2px solid ${color}80` }}
    >
      {STAT_LABELS[stat] ?? stat} {isPositive ? '+' : ''}{change}
    </span>
  );
}

function ResultCard({ result, index }: { result: SurveyResult; index: number }) {
  const accentColor = BLESSING_COLOR[result.curseOrBlessing] ?? '#f0c040';
  return (
    <PixelPanel variant="dark" className="p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="font-pixel" style={{ fontSize: '12px', color: '#9878c0' }}>
          Q{index + 1}. {result.question}
        </p>
        <span
          className="font-pixel shrink-0 px-2 py-1"
          style={{ fontSize: '11px', color: accentColor, border: `2px solid ${accentColor}80`, background: `${accentColor}18` }}
        >
          {BLESSING_LABEL[result.curseOrBlessing]}
        </span>
      </div>

      <p className="font-pixel mb-4" style={{ fontSize: '13px', color: '#c8874a' }}>
        → &quot;{result.answer}&quot;
      </p>

      <div
        className="p-4 mb-4"
        style={{ background: '#120a1e', borderLeft: `4px solid ${accentColor}`, border: `2px solid ${accentColor}30`, borderLeftWidth: '4px' }}
      >
        <p className="font-pixel" style={{ fontSize: '14px', lineHeight: '2.2', color: '#e8d8b8' }}>
          {result.interpretation}
        </p>
      </div>

      {result.flavorText && (
        <p className="font-pixel mb-4" style={{ fontSize: '12px', color: '#6b4fa0' }}>
          &ldquo;{result.flavorText}&rdquo;
        </p>
      )}

      {result.statChanges?.length > 0 ? (
        <div className="flex flex-wrap">
          {result.statChanges.map((sc, i) => (
            <StatChangeBadge key={i} stat={sc.stat} change={sc.change} />
          ))}
        </div>
      ) : (
        <p className="font-pixel" style={{ fontSize: '12px', color: '#4a3070' }}>스탯 변화 없음</p>
      )}
    </PixelPanel>
  );
}

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

  const [revealedCount, setRevealedCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [canProceed, setCanProceed] = useState(false);

  useEffect(() => {
    if (results.length === 0) { setScreen('character-select'); return; }
    setRevealedCount(1);
  }, []);

  const allRevealed = revealedCount >= results.length;

  const handleNext = () => {
    if (!allRevealed) {
      setRevealedCount(c => c + 1);
    } else {
      setShowSummary(true);
      setTimeout(() => setCanProceed(true), 600);
    }
  };

  if (results.length === 0) return null;

  const totalChanges = calcTotalChanges(results);
  const changedStats = Object.entries(totalChanges).filter(([, v]) => v !== 0);
  const isLastCard = allRevealed && !showSummary;


  return (
    <div className="flex items-center justify-center w-full h-full dungeon-bg p-4 overflow-y-auto">
      <div className="w-full max-w-lg flex flex-col gap-5 py-4">

        <div className="text-center">
          <p className="font-pixel" style={{ fontSize: '16px', color: '#e04040', textShadow: '2px 2px 0 #7a0000' }}>
            💀 던전의 신이 판결한다 💀
          </p>
          <p className="font-pixel mt-2" style={{ fontSize: '12px', color: '#6b4fa0' }}>
            {revealedCount} / {results.length} 판결
          </p>
        </div>

        {/* 공개된 카드들 */}
        <div className="flex flex-col gap-4">
          {results.slice(0, revealedCount).map((result, i) => (
            <div
              key={i}
              style={{ animation: i === revealedCount - 1 ? 'slideIn 0.35s ease' : 'none' }}
            >
              <ResultCard result={result} index={i} />
            </div>
          ))}
        </div>

        {/* ── 다음 버튼 (눈에 띄게) ── */}
        {!showSummary && (
          <div className="flex justify-center mt-2">
            <button
              onClick={handleNext}
              className="font-pixel relative"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '15px',
                padding: '16px 32px',
                background: '#5a3a10',
                color: '#f0c040',
                border: '4px solid #f0c040',
                boxShadow: '0 6px 0 #1a0a04, 0 0 20px #f0c04060',
                cursor: 'pointer',
                letterSpacing: '1px',
                animation: 'pulse 1.8s ease-in-out infinite',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#7a5020'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#5a3a10'; }}
              onMouseDown={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(4px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 0 #1a0a04, 0 0 20px #f0c04060';
              }}
              onMouseUp={e => {
                (e.currentTarget as HTMLElement).style.transform = '';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 0 #1a0a04, 0 0 20px #f0c04060';
              }}
            >
              {isLastCard ? '⚖️ 최종 판결을 듣는다' : `▶ 다음 판결 (${revealedCount}/${results.length})`}
            </button>
          </div>
        )}

        {/* 최종 요약 */}
        {showSummary && (
          <div style={{ opacity: 1, transition: 'opacity 0.5s ease' }}>
            <PixelDivider label="신의 최종 판결" className="my-3" />

            <PixelPanel variant="brown" className="p-5 my-3">
              <TypewriterText
                text={run.surveyFinalSummary || '신은 아무 말도 하지 않는다...'}
                speed={22}
              />
            </PixelPanel>

            {changedStats.length > 0 && (
              <PixelPanel variant="dark" className="p-5 mt-3">
                <p className="font-pixel mb-3" style={{ fontSize: '13px', color: '#9878c0' }}>
                  설문 결과 총 스탯 변화
                </p>
                <div className="flex flex-wrap">
                  {changedStats.map(([stat, val]) => (
                    <StatChangeBadge key={stat} stat={stat} change={val} />
                  ))}
                </div>
                <p className="font-pixel mt-3" style={{ fontSize: '11px', color: '#4a3070' }}>
                  ※ 선택한 클래스 기본 스탯에 가산됩니다
                </p>
              </PixelPanel>
            )}

            {canProceed && (
              <div className="flex justify-center mt-5">
                <PixelButton variant="primary" size="lg" onClick={() => setScreen('character-select')}>
                  ⚔️ 운명을 받아들인다
                </PixelButton>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 6px 0 #1a0a04, 0 0 16px #f0c04050; }
          50%       { box-shadow: 0 6px 0 #1a0a04, 0 0 32px #f0c040b0; }
        }
      `}</style>
    </div>
  );
}
