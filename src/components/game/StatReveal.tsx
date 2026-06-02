import { useState, useEffect, useRef } from 'react';
import { useGameState, type SurveyResult } from '@/hooks/useGameState';
import { PixelPanel, PixelButton, PixelDivider, TypewriterText } from './UIFrame';
import { PERSONA_TRAITS } from '@/constants/storyFlags';

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

function alignmentColor(alignment: string): string {
  if (alignment === 'benevolent') return '#40c0a0';
  if (alignment === 'malevolent') return '#e04060';
  return '#f0c040';
}

function alignmentLabel(alignment: string): string {
  if (alignment === 'benevolent') return '✨ 자비로운 영혼';
  if (alignment === 'malevolent') return '💀 어둠의 영혼';
  return '⚖️ 중립의 영혼';
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
  const { run, setScreen, setPersonaName } = useGameState();
  const results = run.surveyResults;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showPersona, setShowPersona] = useState(false);
  const [canProceed, setCanProceed] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (results.length === 0) { setScreen('character-select'); }
  }, []);

  if (results.length === 0) return null;

  const isLastCard = currentIdx >= results.length - 1;

  const handleNext = () => {
    if (!isLastCard) {
      setCurrentIdx(c => c + 1);
      setAnimKey(k => k + 1);
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setShowSummary(true);
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        setShowPersona(true);
        scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => setCanProceed(true), 1500);
      }, 1000);
    }
  };

  const totalChanges = calcTotalChanges(results);
  const changedStats = Object.entries(totalChanges).filter(([, v]) => v !== 0);

  return (
    <div ref={scrollRef} className="w-full h-full dungeon-bg p-4 overflow-y-auto">
      <div className="w-full max-w-lg flex flex-col gap-5 py-4">

        <div className="text-center">
          <p className="font-pixel" style={{ fontSize: '16px', color: '#e04040', textShadow: '2px 2px 0 #7a0000' }}>
            💀 던전의 신이 판결한다 💀
          </p>
          {!showSummary && (
            <p className="font-pixel mt-2" style={{ fontSize: '12px', color: '#6b4fa0' }}>
              {currentIdx + 1} / {results.length} 판결
            </p>
          )}
        </div>

        {/* 현재 카드 (단일 페이지) */}
        {!showSummary && (
          <div key={animKey} style={{ animation: 'pageIn 0.3s ease' }}>
            <ResultCard result={results[currentIdx]} index={currentIdx} />
          </div>
        )}

        {/* 다음 버튼 */}
        {!showSummary && (
          <div className="flex justify-center mt-2">
            <button
              onClick={handleNext}
              className="font-pixel"
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
              {isLastCard ? '⚖️ 최종 판결을 듣는다' : `▶ 다음 판결 →`}
            </button>
          </div>
        )}

        {/* 최종 요약 */}
        {showSummary && (
          <div style={{ animation: 'pageIn 0.4s ease' }}>
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

            {showPersona && run.persona && (
              <div style={{ animation: 'pageIn 0.5s ease' }}>
                <PixelDivider label="환생 선고" className="my-4" />

                {/* 환생 이름 */}
                <div className="text-center my-4">
                  <p className="font-pixel" style={{ fontSize: '11px', color: '#6b4fa0', marginBottom: '8px', letterSpacing: '2px' }}>
                    이 영혼은...
                  </p>
                  {editingName ? (
                    <div className="flex items-center justify-center gap-2 my-2">
                      <input
                        className="font-pixel"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value.slice(0, 20))}
                        maxLength={20}
                        autoFocus
                        style={{
                          fontFamily: "'Press Start 2P', monospace",
                          fontSize: '16px',
                          background: '#120a1e',
                          color: alignmentColor(run.persona.alignment),
                          border: `2px solid ${alignmentColor(run.persona.alignment)}`,
                          padding: '8px 12px',
                          outline: 'none',
                          textAlign: 'center',
                          width: '180px',
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && nameInput.trim()) {
                            setPersonaName(nameInput.trim());
                            setEditingName(false);
                          }
                          if (e.key === 'Escape') {
                            setNameInput(run.persona.name);
                            setEditingName(false);
                          }
                        }}
                      />
                      <button
                        className="font-pixel"
                        onClick={() => {
                          if (nameInput.trim()) setPersonaName(nameInput.trim());
                          setEditingName(false);
                        }}
                        style={{
                          fontFamily: "'Press Start 2P', monospace",
                          fontSize: '11px',
                          background: '#1a3a1a',
                          color: '#40c060',
                          border: '2px solid #40c060',
                          padding: '8px 10px',
                          cursor: 'pointer',
                        }}
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <p
                        className="font-pixel"
                        style={{
                          fontSize: '24px',
                          color: alignmentColor(run.persona.alignment),
                          textShadow: `0 0 20px ${alignmentColor(run.persona.alignment)}80`,
                          letterSpacing: '4px',
                        }}
                      >
                        {run.persona.name}
                      </p>
                      <button
                        className="font-pixel"
                        onClick={() => { setNameInput(run.persona!.name); setEditingName(true); }}
                        title="이름 수정"
                        style={{
                          fontFamily: "'Press Start 2P', monospace",
                          fontSize: '10px',
                          background: 'transparent',
                          color: '#4a3070',
                          border: '2px solid #4a3070',
                          padding: '4px 6px',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#9878c0'; (e.currentTarget as HTMLElement).style.borderColor = '#9878c0'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#4a3070'; (e.currentTarget as HTMLElement).style.borderColor = '#4a3070'; }}
                      >
                        ✎
                      </button>
                    </div>
                  )}
                  <p className="font-pixel mt-2" style={{ fontSize: '11px', color: '#9878c0' }}>
                    으로 환생할 것이다
                  </p>
                </div>

                {/* 탄생 선언문 */}
                <PixelPanel variant="brown" className="p-5 my-3">
                  <TypewriterText text={run.persona.birthNarrative} speed={18} />
                </PixelPanel>

                {/* 전생 + 성격 + 성향 */}
                <PixelPanel variant="dark" className="p-4 my-3">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-pixel" style={{ fontSize: '10px', color: '#6b4fa0' }}>전생</span>
                      <span className="font-pixel" style={{ fontSize: '11px', color: '#e8d8b8' }}>{run.persona.pastLife}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-pixel" style={{ fontSize: '10px', color: '#6b4fa0' }}>성격</span>
                      <span className="font-pixel" style={{ fontSize: '11px', color: '#e8d8b8' }}>{run.persona.personality}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-pixel" style={{ fontSize: '10px', color: '#6b4fa0' }}>성향</span>
                      <span
                        className="font-pixel"
                        style={{ fontSize: '11px', color: alignmentColor(run.persona.alignment) }}
                      >
                        {alignmentLabel(run.persona.alignment)}
                      </span>
                    </div>
                    {run.persona.traitType && PERSONA_TRAITS[run.persona.traitType] && (
                      <div className="flex justify-between items-center">
                        <span className="font-pixel" style={{ fontSize: '10px', color: '#6b4fa0' }}>성격 유형</span>
                        <span className="font-pixel" style={{ fontSize: '11px', color: '#f0c040' }}>
                          {PERSONA_TRAITS[run.persona.traitType].icon} {PERSONA_TRAITS[run.persona.traitType].name}
                        </span>
                      </div>
                    )}
                  </div>
                </PixelPanel>

                {/* 타고난 특성 */}
                {run.persona.innateTraits.length > 0 && (
                  <div className="flex flex-wrap gap-2 my-3">
                    {run.persona.innateTraits.map((trait, i) => (
                      <span
                        key={i}
                        className="font-pixel px-3 py-1"
                        style={{
                          fontSize: '10px',
                          color: '#c8a8e8',
                          background: '#1a0f2e',
                          border: '2px solid #4a2d7a',
                        }}
                      >
                        ✦ {trait}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 마지막 말 효과 */}
            {showPersona && run.lastWordEffect && run.lastWordEffect.type !== 'none' && (
              <div style={{ animation: 'pageIn 0.6s ease' }}>
                <PixelDivider label="신의 선물" className="my-4" />
                <PixelPanel variant="dark" className="p-4 my-3">
                  <div className="flex items-start gap-3">
                    <span style={{ fontSize: '24px' }}>⚡</span>
                    <div>
                      <p className="font-pixel mb-1" style={{ fontSize: '13px', color: '#f0c040' }}>
                        {run.lastWordEffect.label}
                      </p>
                      <p className="font-pixel" style={{ fontSize: '11px', color: '#9878c0', lineHeight: '1.8' }}>
                        {run.lastWordEffect.description}
                      </p>
                    </div>
                  </div>
                </PixelPanel>
              </div>
            )}

            {canProceed && (
              <div className="flex justify-center mt-5">
                <PixelButton variant="primary" size="lg" onClick={() => setScreen('character-select')}>
                  {run.persona ? `⚔️ ${run.persona.name}(으)로 태어난다` : '⚔️ 운명을 받아들인다'}
                </PixelButton>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pageIn {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 6px 0 #1a0a04, 0 0 16px #f0c04050; }
          50%       { box-shadow: 0 6px 0 #1a0a04, 0 0 32px #f0c040b0; }
        }
      `}</style>
    </div>
  );
}
