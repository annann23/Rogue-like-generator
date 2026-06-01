import { useState } from 'react';
import { useGameState, type SurveyResult } from '@/hooks/useGameState';
import { CHARACTER_CLASSES, type ClassStats } from '@/constants/classes';
import { PixelButton, PixelDivider } from './UIFrame';
import Sprite from './Sprite';
import { CLASS_SPRITES } from '@/constants/spriteMap';

const SKILL_LABELS: Record<string, string> = {
  intelligence: '🧠 지능',
  negotiation: '🗣️ 협상',
  lockpick: '🔓 자물쇠',
  stealth: '👁️ 은신',
  strength: '💪 완력',
  arcane: '✨ 마법감지',
};

function calcSurveyBonuses(surveyResults: SurveyResult[]) {
  const bonuses: Record<string, number> = {};
  for (const r of surveyResults) {
    for (const { stat, change } of r.statChanges ?? []) {
      const key = stat === 'attack' ? 'atk' : stat === 'defense' ? 'def' : stat;
      bonuses[key] = (bonuses[key] ?? 0) + change;
    }
  }
  return bonuses;
}

function StatRow({ label, base, bonus }: { label: string; base: number; bonus: number }) {
  const final = Math.max(0, base + bonus);
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="font-pixel" style={{ fontSize: '11px', color: '#9878c0', whiteSpace: 'nowrap' }}>{label}</span>
      <div className="flex items-center gap-1" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
        <span className="font-pixel" style={{ fontSize: '12px', color: '#e8d8b8' }}>{base}</span>
        {bonus !== 0 && (
          <>
            <span className="font-pixel" style={{ fontSize: '11px', color: bonus > 0 ? '#40c040' : '#e04040' }}>
              {bonus > 0 ? `+${bonus}` : bonus}
            </span>
            <span className="font-pixel" style={{ fontSize: '12px', color: '#f0c040' }}>={final}</span>
          </>
        )}
      </div>
    </div>
  );
}

function SkillDots({ level }: { level: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            width: '8px',
            height: '8px',
            background: i <= level ? '#f0c040' : '#2d1b4e',
            border: '2px solid #4a2d7a',
          }}
        />
      ))}
    </div>
  );
}

function ClassCard({
  cls,
  bonuses,
  selected,
  onClick,
}: {
  cls: ClassStats;
  bonuses: Record<string, number>;
  selected: boolean;
  onClick: () => void;
}) {
  const borderColor = selected ? '#f0c040' : '#4a2d7a';
  const bgColor = selected ? '#2a1a08' : '#0d0820';

  return (
    <button
      onClick={onClick}
      className="w-full text-left"
      style={{
        background: bgColor,
        border: `3px solid ${borderColor}`,
        boxShadow: selected
          ? '0 0 20px #f0c04050, 0 4px 0 #7a3c00'
          : '0 4px 0 #0a0414',
        padding: '20px',
        cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      {/* 헤더 — 고정 높이로 카드 간 정렬 통일 */}
      <div style={{ minHeight: '90px' }} className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <Sprite
            spriteKey={CLASS_SPRITES[cls.id]}
            scale={4}
            animation={selected ? 'idle' : 'none'}
          />
          <p className="font-pixel" style={{ fontSize: '16px', color: selected ? '#f0c040' : '#e8d8b8' }}>
            {cls.name}
          </p>
        </div>
        <p className="font-pixel" style={{ fontSize: '10px', color: '#6b4fa0', lineHeight: '2' }}>
          {cls.description}
        </p>
      </div>

      <PixelDivider />

      {/* 기본 스탯 */}
      <div className="mt-4 space-y-2">
        <StatRow label="❤️ HP" base={cls.hp} bonus={bonuses.hp ?? 0} />
        <StatRow label="⚔️ ATK" base={cls.atk} bonus={(bonuses.atk ?? 0) + (bonuses.attack ?? 0)} />
        <StatRow label="🛡️ DEF" base={cls.def} bonus={(bonuses.def ?? 0) + (bonuses.defense ?? 0)} />
        <StatRow label="💰 골드" base={cls.startGold} bonus={bonuses.gold ?? 0} />
        <StatRow label="💙 마나" base={cls.mana ?? 0} bonus={0} />
      </div>

      <PixelDivider className="mt-4" />

      {/* 스킬 */}
      <div className="mt-4 space-y-2">
        {Object.entries(cls.skills).map(([key, val]) => {
          const skillBonus = bonuses[key] ?? 0;
          const finalVal = Math.min(5, Math.max(0, val + skillBonus));
          return (
            <div key={key} className="flex items-center justify-between gap-2">
              <span className="font-pixel" style={{ fontSize: '10px', color: '#9878c0' }}>
                {SKILL_LABELS[key]}
              </span>
              <div className="flex items-center gap-2">
                <SkillDots level={Math.min(3, finalVal)} />
                {skillBonus !== 0 && (
                  <span className="font-pixel" style={{ fontSize: '10px', color: skillBonus > 0 ? '#40c040' : '#e04040' }}>
                    {skillBonus > 0 ? `+${skillBonus}` : skillBonus}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </button>
  );
}

export default function CharacterSelect() {
  const { run, startNewRun, setScreen } = useGameState();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const bonuses = calcSurveyBonuses(run.surveyResults);
  const hasBonuses = Object.values(bonuses).some((v) => v !== 0);
  const selectedClass = CHARACTER_CLASSES.find((c) => c.id === selectedId);

  const handleConfirm = () => {
    if (!selectedClass || confirming) return;
    setConfirming(true);
    startNewRun(selectedClass, run.surveyResults, run.randomSeed, run.persona);
    setScreen('game');
  };

  return (
    <div className="flex items-center justify-center w-full h-full dungeon-bg p-4 overflow-y-auto">
      <div className="w-full max-w-2xl flex flex-col gap-6 py-4">

        {/* 헤더 */}
        <div className="text-center space-y-2">
          <p className="font-pixel" style={{ fontSize: '18px', color: '#f0c040', textShadow: '2px 2px 0 #7a3c00' }}>
            ⚔️ 클래스를 선택하라 ⚔️
          </p>
          {hasBonuses && (
            <p className="font-pixel" style={{ fontSize: '11px', color: '#9878c0' }}>
              설문 결과가 기본 스탯에 반영됩니다
            </p>
          )}
        </div>

        {/* 클래스 카드 3개 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {CHARACTER_CLASSES.map((cls) => (
            <ClassCard
              key={cls.id}
              cls={cls}
              bonuses={bonuses}
              selected={selectedId === cls.id}
              onClick={() => setSelectedId(cls.id)}
            />
          ))}
        </div>

        {/* 확인 버튼 (클래스 선택 후 fade-in) */}
        <div
          className="flex flex-col items-center gap-3"
          style={{
            opacity: selectedId ? 1 : 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: selectedId ? 'auto' : 'none',
          }}
        >
          <PixelButton variant="primary" size="lg" onClick={handleConfirm} disabled={confirming}>
            {confirming
              ? '⏳ 입장 중...'
              : `${selectedClass?.icon ?? ''} ${selectedClass?.name ?? ''}(으)로 던전에 도전한다`}
          </PixelButton>
          <PixelButton variant="ghost" size="sm" onClick={() => setScreen('stat-reveal')}>
            ← 판결 다시 보기
          </PixelButton>
        </div>

      </div>
    </div>
  );
}
