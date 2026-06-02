import { PixelButton, PixelDivider } from './UIFrame';
import { ACHIEVEMENTS, CATEGORY_LABELS, type AchievementCategory } from '@/constants/achievements';
import { GEM_DEFS } from '@/constants/gems';

interface StatusPanelProps {
  collectedGems: string[];
  unlockedAchievements: Record<string, boolean | number>;
  totalCombatWins: number;
  totalNegotiations: number;
  totalClears: number;
  onClose: () => void;
}

export default function StatusPanel({
  collectedGems,
  unlockedAchievements,
  totalCombatWins,
  totalNegotiations,
  totalClears,
  onClose,
}: StatusPanelProps) {
  const unlockedCount = Object.keys(unlockedAchievements).length;
  const gemCount = collectedGems.length;

  const categories = Object.keys(CATEGORY_LABELS) as AchievementCategory[];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(5, 2, 12, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          maxHeight: '88dvh',
          overflowY: 'auto',
          background: '#1a0f2e',
          border: '4px solid #6b4fa0',
          boxShadow: 'inset 0 0 0 2px #4a2d7a, 4px 4px 0 #080413',
        }}
      >
        {/* 헤더 */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '2px solid #4a2d7a', background: '#120a1e' }}
        >
          <p className="font-pixel" style={{ fontSize: '12px', color: '#f0c040' }}>
            📊 현황
          </p>
          <PixelButton variant="ghost" size="sm" onClick={onClose}>✕</PixelButton>
        </div>

        <div className="flex flex-col gap-5 p-4">

          {/* ── 보석 ── */}
          <section>
            <p className="font-pixel mb-3" style={{ fontSize: '11px', color: '#9878c0', letterSpacing: '2px' }}>
              ✦ 보석 수집 현황 ({gemCount}/6) ✦
            </p>
            <div className="flex flex-col gap-2">
              {GEM_DEFS.map((gem) => {
                const collected = collectedGems.includes(gem.id);
                return (
                  <div
                    key={gem.id}
                    className="flex items-center gap-3 px-3 py-2 font-pixel"
                    style={{
                      background: collected ? '#0e1a0e' : '#0a0612',
                      border: `2px solid ${collected ? '#306030' : '#2a1a4a'}`,
                      opacity: collected ? 1 : 0.6,
                    }}
                  >
                    <span style={{ fontSize: '16px', minWidth: '20px' }}>
                      {collected ? gem.icon : '⬜'}
                    </span>
                    <div className="flex flex-col gap-1 flex-1">
                      <span style={{ fontSize: '10px', color: collected ? '#80e080' : '#6b4fa0' }}>
                        {collected ? `✓ ${gem.name}` : gem.name}
                      </span>
                      <span style={{ fontSize: '9px', color: '#4a3070' }}>
                        {gem.conditionLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <PixelDivider />

          {/* ── 누적 통계 ── */}
          <section>
            <p className="font-pixel mb-3" style={{ fontSize: '11px', color: '#9878c0', letterSpacing: '2px' }}>
              ✦ 누적 기록 ✦
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: '⚔️ 전투 승리', value: totalCombatWins },
                { label: '🕊️ 협상 성공', value: totalNegotiations },
                { label: '🏆 클리어',     value: totalClears },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="font-pixel px-3 py-2"
                  style={{
                    background: '#120a1e',
                    border: '2px solid #4a2d7a',
                    fontSize: '10px',
                    color: '#c8a8e8',
                  }}
                >
                  {label} <span style={{ color: '#f0c040' }}>{value}</span>
                </div>
              ))}
            </div>
          </section>

          <PixelDivider />

          {/* ── 도전과제 ── */}
          <section>
            <p className="font-pixel mb-3" style={{ fontSize: '11px', color: '#9878c0', letterSpacing: '2px' }}>
              ✦ 도전과제 ({unlockedCount}/{ACHIEVEMENTS.length}) ✦
            </p>
            <div className="flex flex-col gap-4">
              {categories.map((cat) => {
                const catAchs = ACHIEVEMENTS.filter((a) => a.category === cat);
                return (
                  <div key={cat}>
                    <p className="font-pixel mb-2" style={{ fontSize: '10px', color: '#6b4fa0' }}>
                      {CATEGORY_LABELS[cat]}
                    </p>
                    <div className="flex flex-col gap-1">
                      {catAchs.map((ach) => {
                        const unlocked = ach.id in unlockedAchievements;
                        return (
                          <div
                            key={ach.id}
                            className="flex items-center gap-3 px-3 py-2 font-pixel"
                            style={{
                              background: unlocked ? '#0e1a0e' : '#0a0612',
                              border: `2px solid ${unlocked ? '#306030' : '#1a0f2e'}`,
                              opacity: unlocked ? 1 : 0.5,
                            }}
                          >
                            <span style={{ fontSize: '14px', minWidth: '18px' }}>{ach.icon}</span>
                            <div className="flex flex-col gap-1 flex-1">
                              <span style={{ fontSize: '10px', color: unlocked ? '#80e080' : '#4a3070' }}>
                                {unlocked ? `✓ ${ach.name}` : ach.name}
                              </span>
                              <span style={{ fontSize: '9px', color: '#3a2550' }}>
                                {ach.description}
                              </span>
                            </div>
                            {unlocked && (
                              <span style={{ fontSize: '9px', color: '#f0c040' }}>
                                +{ach.reward}g
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
