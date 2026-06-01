import { useGameState } from '@/hooks/useGameState';
import { PixelPanel, PixelButton, PixelDivider } from './UIFrame';
import { CLASS_SPRITES } from '@/constants/spriteMap';
import { SKILLS } from '@/constants/skills';
import DungeonBackground from './DungeonBackground';
import Sprite from './Sprite';

export default function DeathScreen() {
  const { screen, run, meta, setScreen } = useGameState();
  const isClear = screen === 'clear';
  const earnedPoints = isClear ? 30 : run.depth * 2;

  // 스킬 중 1 이상인 것만
  const grownSkills = SKILLS.filter(
    (s) => ((run.skills as unknown as Record<string, number>)[s.id] ?? 0) >= 1,
  );

  return (
    <div
      className="flex flex-col items-center justify-start w-full min-h-screen overflow-y-auto"
      style={{
        position: 'relative',
        background: isClear ? '#0a0e08' : '#0a0608',
      }}
    >
      <DungeonBackground seed={run.randomSeed} scale={2} opacity={isClear ? 0.12 : 0.18} />

      {/* 분위기 오버레이 */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: isClear
            ? 'radial-gradient(ellipse at 50% 30%, rgba(80,60,0,0.18) 0%, transparent 70%)'
            : 'radial-gradient(ellipse at 50% 20%, rgba(80,0,0,0.22) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div
        className="flex flex-col gap-5 max-w-md w-full p-6 pb-10"
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* 타이틀 + 스프라이트 */}
        <div className="flex flex-col items-center gap-3 pt-4">
          <Sprite
            spriteKey={CLASS_SPRITES[run.characterClass ?? 'warrior']}
            scale={5}
            animation="none"
            style={{ opacity: isClear ? 1 : 0.5, filter: isClear ? 'none' : 'grayscale(60%)' }}
          />
          <p
            className="font-pixel text-center"
            style={{
              fontSize: '20px',
              color: isClear ? '#f0c040' : '#e04040',
              textShadow: isClear ? '0 0 12px #a07000' : '0 0 12px #800000',
              lineHeight: 1.6,
            }}
          >
            {isClear ? '⚔️ 던전 클리어 ⚔️' : '☠ 그대는 쓰러졌다'}
          </p>
          {!isClear && run.deathCause && (
            <p
              className="font-pixel text-center"
              style={{ fontSize: '11px', color: '#9878c0', lineHeight: 2, maxWidth: '280px' }}
            >
              {run.deathCause}
            </p>
          )}
          {isClear && (
            <p
              className="font-pixel text-center"
              style={{ fontSize: '11px', color: '#9878c0', lineHeight: 2 }}
            >
              그대의 이름이 던전에 새겨질 것이다
            </p>
          )}
        </div>

        {/* 이번 런 결과 */}
        <PixelPanel variant="dark" className="p-4">
          <p className="font-pixel mb-3" style={{ fontSize: '11px', color: '#f0c040', letterSpacing: '1px' }}>
            이번 모험
          </p>
          <div className="space-y-2">
            <Row label="클래스" value={run.characterClass ?? '-'} />
            <Row label="도달 층수" value={`${run.depth} / 10층`} />
            <Row
              label="남은 HP"
              value={`${Math.max(0, run.hp)} / ${run.maxHp}`}
              valueColor={isClear ? '#40c060' : '#e04040'}
            />
          </div>
        </PixelPanel>

        {/* 렐릭 */}
        {run.relics.length > 0 && (
          <PixelPanel variant="dark" className="p-4">
            <p className="font-pixel mb-3" style={{ fontSize: '11px', color: '#f0c040', letterSpacing: '1px' }}>
              획득한 유물 ({run.relics.length})
            </p>
            <div className="flex flex-col gap-2">
              {run.relics.map((relic, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span style={{ fontSize: '14px', lineHeight: 1.4 }}>{relic.icon}</span>
                  <div>
                    <p
                      className="font-pixel"
                      style={{
                        fontSize: '10px',
                        color: relic.isCursed ? '#e04040' : '#e8d8b8',
                        lineHeight: 1.8,
                      }}
                    >
                      {relic.name}
                      {relic.isCursed && (
                        <span style={{ color: '#e04040', marginLeft: '6px' }}>저주됨</span>
                      )}
                    </p>
                    <p className="font-pixel" style={{ fontSize: '9px', color: '#7060a0', lineHeight: 1.8 }}>
                      {relic.effect}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </PixelPanel>
        )}

        {/* 스킬 성장 */}
        {grownSkills.length > 0 && (
          <PixelPanel variant="dark" className="p-4">
            <p className="font-pixel mb-3" style={{ fontSize: '11px', color: '#f0c040', letterSpacing: '1px' }}>
              성장한 기술
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {grownSkills.map((s) => {
                const lv = (run.skills as unknown as Record<string, number>)[s.id];
                return (
                  <span key={s.id} className="font-pixel" style={{ fontSize: '11px', color: '#b8a0d8' }}>
                    {s.icon}{' '}
                    <span style={{ color: '#e8d8b8' }}>{s.name}</span>{' '}
                    <span style={{ fontSize: '9px', color: '#9878c0' }}>Lv.{lv}</span>
                  </span>
                );
              })}
            </div>
          </PixelPanel>
        )}

        {/* 유산 포인트 */}
        <PixelPanel variant={isClear ? 'brown' : 'dark'} className="p-4">
          <div className="flex justify-between items-center">
            <p className="font-pixel" style={{ fontSize: '11px', color: '#9878c0' }}>
              획득 유산 포인트
            </p>
            <p className="font-pixel" style={{ fontSize: '18px', color: '#f0c040' }}>
              +{earnedPoints} pt
            </p>
          </div>
        </PixelPanel>

        {/* 누적 기록 */}
        <PixelPanel variant="dark" className="p-4">
          <p className="font-pixel mb-3" style={{ fontSize: '11px', color: '#f0c040', letterSpacing: '1px' }}>
            누적 기록
          </p>
          <div className="space-y-2">
            <Row label="총 도전" value={`${meta.totalRuns}회`} />
            <Row label="클리어" value={`${meta.totalClears}회`} valueColor="#f0c040" />
            <Row label="최고 층수" value={`${meta.bestDepth}층`} />
            <Row label="보유 유산 포인트" value={`${meta.legacyPoints} pt`} valueColor="#f0c040" />
          </div>
        </PixelPanel>

        <PixelDivider />

        {/* 버튼 */}
        <div className="flex flex-col gap-3">
          <PixelButton variant="primary" size="lg" onClick={() => setScreen('meta')}>
            ✨ 유산 계승하기
          </PixelButton>
          <PixelButton variant="ghost" size="sm" onClick={() => setScreen('title')}>
            처음으로
          </PixelButton>
        </div>
      </div>
    </div>
  );
}

// ─── 행 컴포넌트 ──────────────────────────────
function Row({
  label,
  value,
  valueColor = '#e8d8b8',
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="font-pixel" style={{ fontSize: '10px', color: '#7060a0' }}>
        {label}
      </span>
      <span className="font-pixel" style={{ fontSize: '11px', color: valueColor }}>
        {value}
      </span>
    </div>
  );
}
