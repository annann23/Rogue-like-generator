import { useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { META_UPGRADES } from '@/constants/metaUpgrades';
import { CHARACTER_CLASSES, CLASS_UNLOCK_COSTS } from '@/constants/classes';
import { ACHIEVEMENTS, CATEGORY_LABELS, TOTAL_ENEMIES, type AchievementCategory } from '@/constants/achievements';
import { ENEMY_TEMPLATES } from '@/constants/enemies';
import { CURSED_RELICS } from '@/constants/relics';
import { RELIC_SYNERGIES } from '@/constants/relicSynergies';
import { PixelPanel, PixelButton, PixelDivider } from './UIFrame';

type Tab = 'upgrades' | 'achievements' | 'codex';

const TAB_LABELS: Record<Tab, string> = {
  upgrades:     '⚔️ 유산 계승',
  achievements: '🏆 도전과제',
  codex:        '📚 도감',
};

// ─── 탭 버튼 ───────────────────────────────────
function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="font-pixel flex-1"
      style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '10px',
        padding: '10px 4px',
        background: active ? '#1a0f2e' : '#0a0612',
        color: active ? '#f0c040' : '#4a3070',
        border: 'none',
        borderBottom: active ? '3px solid #f0c040' : '3px solid #2a1a4a',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

// ─── 업그레이드 탭 ─────────────────────────────
function UpgradesTab() {
  const { meta, purchaseUpgrade, unlockClass } = useGameState();
  return (
    <div className="flex flex-col gap-4">
      {/* 스탯 업그레이드 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {META_UPGRADES.map((upg) => {
          const currentLevel = meta.upgrades[upg.id] ?? 0;
          const isMaxed = currentLevel >= upg.maxLevel;
          const canAfford = meta.legacyPoints >= upg.costPerLevel;

          return (
            <PixelPanel key={upg.id} variant={isMaxed ? 'brown' : 'dark'} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ fontSize: '16px' }}>{upg.icon}</span>
                    <p className="font-pixel" style={{ fontSize: '11px', color: isMaxed ? '#f0c040' : '#e8d8b8' }}>
                      {upg.name}
                    </p>
                  </div>
                  <p className="font-pixel" style={{ fontSize: '9px', color: '#9878c0', lineHeight: 2 }}>
                    {upg.description}
                  </p>
                  <div className="flex gap-1 mt-2">
                    {Array.from({ length: upg.maxLevel }, (_, i) => (
                      <div key={i} style={{ width: '10px', height: '10px', background: i < currentLevel ? '#f0c040' : '#2d1b4e', border: '2px solid #4a2d7a' }} />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {isMaxed ? (
                    <span className="font-pixel" style={{ fontSize: '9px', color: '#f0c040' }}>MAX</span>
                  ) : (
                    <>
                      <span className="font-pixel" style={{ fontSize: '9px', color: canAfford ? '#f0c040' : '#6b4fa0' }}>
                        {upg.costPerLevel} pt
                      </span>
                      <PixelButton variant={canAfford ? 'primary' : 'ghost'} size="sm" disabled={!canAfford} onClick={() => purchaseUpgrade(upg.id, upg.costPerLevel)}>
                        구매
                      </PixelButton>
                    </>
                  )}
                </div>
              </div>
            </PixelPanel>
          );
        })}
      </div>

      {/* 클래스 해금 */}
      <PixelDivider label="클래스 해금" className="mt-2" />
      <div className="flex flex-col gap-3">
        {CHARACTER_CLASSES.map((cls) => {
          const cost = CLASS_UNLOCK_COSTS[cls.id];
          const isUnlocked = cost === null || meta.unlockedClasses.includes(cls.id);
          const canAfford = cost !== null && meta.legacyPoints >= cost;
          return (
            <PixelPanel key={cls.id} variant={isUnlocked ? 'brown' : 'dark'} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: '20px' }}>{cls.icon}</span>
                  <div>
                    <p className="font-pixel" style={{ fontSize: '12px', color: isUnlocked ? '#f0c040' : '#e8d8b8' }}>
                      {cls.name}
                    </p>
                    <p className="font-pixel mt-1" style={{ fontSize: '9px', color: '#6b4fa0', lineHeight: 1.8 }}>
                      {cls.description}
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  {isUnlocked ? (
                    <span className="font-pixel" style={{ fontSize: '9px', color: '#40c060' }}>✓ 해금됨</span>
                  ) : cost !== null ? (
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-pixel" style={{ fontSize: '9px', color: canAfford ? '#f0c040' : '#6b4fa0' }}>
                        🔒 {cost} pt
                      </span>
                      <PixelButton
                        variant={canAfford ? 'primary' : 'ghost'}
                        size="sm"
                        disabled={!canAfford}
                        onClick={() => unlockClass(cls.id, cost)}
                      >
                        해금
                      </PixelButton>
                    </div>
                  ) : null}
                </div>
              </div>
            </PixelPanel>
          );
        })}
      </div>
    </div>
  );
}

// ─── 도전과제 탭 ───────────────────────────────
function AchievementsTab() {
  const { meta } = useGameState();
  const unlockedCount = Object.values(meta.achievements).filter(Boolean).length;
  const categories = ['explore', 'combat', 'collect', 'social', 'master'] as AchievementCategory[];

  return (
    <div className="flex flex-col gap-4">
      {/* 진행 현황 */}
      <PixelPanel variant="dark" className="p-4">
        <div className="flex justify-between items-center">
          <p className="font-pixel" style={{ fontSize: '11px', color: '#9878c0' }}>달성 현황</p>
          <p className="font-pixel" style={{ fontSize: '14px', color: '#f0c040' }}>
            {unlockedCount} / {ACHIEVEMENTS.length}
          </p>
        </div>
        <div className="mt-3" style={{ background: '#0a0612', border: '2px solid #2a1a4a', height: '8px' }}>
          <div
            style={{
              height: '100%',
              width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%`,
              background: '#f0c040',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </PixelPanel>

      {/* 카테고리별 목록 */}
      {categories.map(cat => {
        const catAchs = ACHIEVEMENTS.filter(a => a.category === cat);
        return (
          <div key={cat}>
            <p className="font-pixel mb-2" style={{ fontSize: '10px', color: '#9878c0', letterSpacing: '1px' }}>
              {CATEGORY_LABELS[cat]}
            </p>
            <div className="flex flex-col gap-2">
              {catAchs.map(ach => {
                const done = !!meta.achievements[ach.id];
                return (
                  <div
                    key={ach.id}
                    className="flex items-center justify-between p-3"
                    style={{
                      background: done ? '#1a1000' : '#0a0612',
                      border: `2px solid ${done ? '#f0c04060' : '#2a1a4a'}`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span style={{ fontSize: '16px', opacity: done ? 1 : 0.3 }}>{ach.icon}</span>
                      <div>
                        <p className="font-pixel" style={{ fontSize: '10px', color: done ? '#e8d8b8' : '#4a3070' }}>
                          {done ? ach.name : '???'}
                        </p>
                        <p className="font-pixel" style={{ fontSize: '9px', color: done ? '#9878c0' : '#2a1a4a', lineHeight: 1.8 }}>
                          {done ? ach.description : '아직 달성하지 못했다'}
                        </p>
                      </div>
                    </div>
                    <span className="font-pixel shrink-0" style={{ fontSize: '10px', color: done ? '#f0c040' : '#2a1a4a' }}>
                      {done ? `+${ach.reward}pt` : `${ach.reward}pt`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── 시너지 조합식 표시 ────────────────────────
function SynergyRecipe({ syn, discovered }: { syn: typeof RELIC_SYNERGIES[number]; discovered: boolean }) {
  if (discovered) {
    const ingredients = syn.requiredRelicNames
      ? syn.requiredRelicNames.join(' + ')
      : `저주 유물 ${syn.minCursedCount}개 이상`;
    return (
      <div
        className="p-3"
        style={{ background: '#0d0a1e', border: '2px solid #6030a060' }}
      >
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span style={{ fontSize: '16px' }}>{syn.icon}</span>
          <span className="font-pixel" style={{ fontSize: '10px', color: '#e8d8b8' }}>{syn.name}</span>
        </div>
        <p className="font-pixel mb-1" style={{ fontSize: '9px', color: '#9878c0', lineHeight: 1.8 }}>
          {ingredients}
        </p>
        <p className="font-pixel" style={{ fontSize: '9px', color: '#40c060', lineHeight: 1.8 }}>
          {syn.displayEffect}
        </p>
      </div>
    );
  }

  const slotCount = syn.requiredRelicNames?.length ?? syn.minCursedCount ?? 2;
  const slots = Array.from({ length: slotCount }, (_, i) => (
    <span key={i} className="font-pixel" style={{ fontSize: '10px', color: '#2a1a4a' }}>??</span>
  ));
  const joined = slots.reduce<React.ReactNode[]>((acc, el, i) => {
    if (i > 0) acc.push(<span key={`sep-${i}`} className="font-pixel" style={{ fontSize: '10px', color: '#2a1a4a' }}> + </span>);
    acc.push(el);
    return acc;
  }, []);

  return (
    <div
      className="p-3 flex items-center gap-2 flex-wrap"
      style={{ background: '#080412', border: '2px solid #1a0f2e' }}
    >
      {joined}
      <span className="font-pixel" style={{ fontSize: '10px', color: '#2a1a4a' }}> = </span>
      <span className="font-pixel" style={{ fontSize: '10px', color: '#2a1a4a' }}>??</span>
    </div>
  );
}

// ─── 도감 탭 ───────────────────────────────────
function CodexTab() {
  const { meta } = useGameState();
  const enemies = ENEMY_TEMPLATES;
  const relics = CURSED_RELICS;

  const tierLabel: Record<string, string> = {
    normal: '일반',
    elite:  '엘리트',
    boss:   '보스',
  };
  const tierColor: Record<string, string> = {
    normal: '#9878c0',
    elite:  '#f0c040',
    boss:   '#e04040',
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 적 도감 */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="font-pixel" style={{ fontSize: '11px', color: '#f0c040' }}>⚔️ 적 도감</p>
          <p className="font-pixel" style={{ fontSize: '10px', color: '#9878c0' }}>
            {meta.discoveredEnemies.length} / {TOTAL_ENEMIES}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {enemies.map(enemy => {
            const found = meta.discoveredEnemies.includes(enemy.id);
            const color = tierColor[enemy.tier] ?? '#9878c0';
            return (
              <div
                key={enemy.id}
                className="p-3"
                style={{
                  background: found ? '#0d0820' : '#080410',
                  border: `2px solid ${found ? color + '60' : '#1a0f2e'}`,
                }}
              >
                {found ? (
                  <>
                    <p className="font-pixel" style={{ fontSize: '10px', color: '#e8d8b8' }}>{enemy.name}</p>
                    <p className="font-pixel mt-1" style={{ fontSize: '9px', color }}>
                      {tierLabel[enemy.tier]}
                    </p>
                    <p className="font-pixel mt-1" style={{ fontSize: '8px', color: '#6b4fa0', lineHeight: 1.8 }}>
                      {enemy.description}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-pixel" style={{ fontSize: '10px', color: '#2a1a4a' }}>???</p>
                    <p className="font-pixel mt-1" style={{ fontSize: '9px', color: '#1a0f2e' }}>미발견</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <PixelDivider />

      {/* 저주 유물 도감 */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="font-pixel" style={{ fontSize: '11px', color: '#e04040' }}>🗿 저주 유물</p>
          <p className="font-pixel" style={{ fontSize: '10px', color: '#9878c0' }}>
            {meta.discoveredRelics.length} / {relics.length}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {relics.map(relic => {
            const found = meta.discoveredRelics.includes(relic.name);
            return (
              <div
                key={relic.name}
                className="p-3 flex items-start gap-3"
                style={{
                  background: found ? '#1a0808' : '#080410',
                  border: `2px solid ${found ? '#e0404060' : '#1a0f2e'}`,
                }}
              >
                <span style={{ fontSize: '16px', opacity: found ? 1 : 0.2 }}>{relic.icon}</span>
                <div>
                  <p className="font-pixel" style={{ fontSize: '10px', color: found ? '#e04040' : '#2a1a4a' }}>
                    {found ? relic.name : '???'}
                  </p>
                  <p className="font-pixel mt-1" style={{ fontSize: '9px', color: found ? '#9878c0' : '#1a0f2e', lineHeight: 1.8 }}>
                    {found ? relic.effect : '아직 발견하지 못했다'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <PixelDivider />

      {/* 시너지 도감 */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="font-pixel" style={{ fontSize: '11px', color: '#c060f0' }}>✨ 유물 조합</p>
          <p className="font-pixel" style={{ fontSize: '10px', color: '#9878c0' }}>
            {meta.discoveredSynergies.length} / {RELIC_SYNERGIES.length}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {RELIC_SYNERGIES.map(syn => (
            <SynergyRecipe
              key={syn.id}
              syn={syn}
              discovered={meta.discoveredSynergies.includes(syn.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 메인 ──────────────────────────────────────
export default function MetaScreen() {
  const { meta, setScreen } = useGameState();
  const [activeTab, setActiveTab] = useState<Tab>('upgrades');

  return (
    <div className="flex flex-col w-full h-full min-h-screen dungeon-bg overflow-y-auto">
      <div className="flex flex-col gap-4 max-w-xl mx-auto w-full p-5 py-6">

        {/* 헤더 */}
        <div className="text-center space-y-1">
          <p className="font-pixel" style={{ fontSize: '16px', color: '#f0c040' }}>⚔️ 유산 계승 ⚔️</p>
          <p className="font-pixel" style={{ fontSize: '11px', color: '#9878c0' }}>
            선조의 기억이 다음 모험자에게 전해진다
          </p>
        </div>

        {/* 포인트 + 기록 */}
        <PixelPanel variant="dark" className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-pixel" style={{ fontSize: '10px', color: '#9878c0' }}>보유 유산 포인트</p>
              <p className="font-pixel mt-1" style={{ fontSize: '20px', color: '#f0c040' }}>{meta.legacyPoints} pt</p>
            </div>
            <div className="text-right space-y-1">
              <p className="font-pixel" style={{ fontSize: '10px', color: '#9878c0' }}>도전 {meta.totalRuns}회 · 클리어 {meta.totalClears}회</p>
              <p className="font-pixel" style={{ fontSize: '10px', color: '#9878c0' }}>최고 기록 {meta.bestDepth}층</p>
              <p className="font-pixel" style={{ fontSize: '10px', color: '#9878c0' }}>
                도전과제 {Object.values(meta.achievements).filter(Boolean).length}/{ACHIEVEMENTS.length}
              </p>
            </div>
          </div>
        </PixelPanel>

        {/* 탭 */}
        <div className="flex" style={{ border: '2px solid #2a1a4a' }}>
          {(['upgrades', 'achievements', 'codex'] as Tab[]).map(tab => (
            <TabBtn key={tab} label={TAB_LABELS[tab]} active={activeTab === tab} onClick={() => setActiveTab(tab)} />
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        {activeTab === 'upgrades'     && <UpgradesTab />}
        {activeTab === 'achievements' && <AchievementsTab />}
        {activeTab === 'codex'        && <CodexTab />}

        <PixelDivider />

        {/* 하단 버튼 */}
        <div className="flex flex-col gap-3">
          <PixelButton variant="secondary" size="lg" onClick={() => setScreen('survey')}>
            새 모험 시작 ▶
          </PixelButton>
          <PixelButton variant="ghost" size="sm" onClick={() => setScreen('title')}>
            타이틀로
          </PixelButton>
        </div>

      </div>
    </div>
  );
}
