import { useGameState } from '@/hooks/useGameState';
import { PixelPanel, PixelButton, PixelDivider } from './UIFrame';
import DungeonBackground from './DungeonBackground';

export default function DeathScreen() {
  const { screen, run, meta, setScreen } = useGameState();
  const isClear = screen === 'clear';

  // 이번 런에서 획득한 레거시 포인트
  const earnedPoints = isClear ? 30 : run.depth * 2;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-screen dungeon-bg" style={{ position: 'relative' }}>
      <DungeonBackground seed={run.randomSeed} scale={2} opacity={0.15} />
      <div className="flex flex-col gap-5 max-w-md w-full p-6" style={{ position: 'relative', zIndex: 1 }}>

        {/* 타이틀 */}
        <div className="text-center">
          <p className="font-pixel" style={{ fontSize: '22px', color: isClear ? '#f0c040' : '#e04040', textShadow: isClear ? '2px 2px 0 #7a3c00' : '2px 2px 0 #600' }}>
            {isClear ? '⚔️ 던전 클리어! ⚔️' : '💀 사망 💀'}
          </p>
          {!isClear && run.deathCause && (
            <p className="font-pixel mt-2" style={{ fontSize: '11px', color: '#9878c0', lineHeight: 2 }}>
              {run.deathCause}
            </p>
          )}
        </div>

        {/* 이번 런 결과 */}
        <PixelPanel variant="dark" className="p-4">
          <p className="font-pixel mb-3" style={{ fontSize: '12px', color: '#f0c040' }}>이번 모험</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-pixel" style={{ fontSize: '11px', color: '#9878c0' }}>도달 층수</span>
              <span className="font-pixel" style={{ fontSize: '11px', color: '#e8d8b8' }}>{run.depth} / 10</span>
            </div>
            <div className="flex justify-between">
              <span className="font-pixel" style={{ fontSize: '11px', color: '#9878c0' }}>클래스</span>
              <span className="font-pixel" style={{ fontSize: '11px', color: '#e8d8b8' }}>{run.characterClass ?? '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-pixel" style={{ fontSize: '11px', color: '#9878c0' }}>남은 HP</span>
              <span className="font-pixel" style={{ fontSize: '11px', color: isClear ? '#40c060' : '#e04040' }}>{Math.max(0, run.hp)} / {run.maxHp}</span>
            </div>
          </div>

          <PixelDivider className="my-3" />

          <div className="flex justify-between items-center">
            <span className="font-pixel" style={{ fontSize: '11px', color: '#9878c0' }}>획득 유산 포인트</span>
            <span className="font-pixel" style={{ fontSize: '14px', color: '#f0c040' }}>+{earnedPoints} pt</span>
          </div>
        </PixelPanel>

        {/* 누적 기록 */}
        <PixelPanel variant="dark" className="p-4">
          <p className="font-pixel mb-3" style={{ fontSize: '12px', color: '#f0c040' }}>누적 기록</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-pixel" style={{ fontSize: '11px', color: '#9878c0' }}>총 도전 횟수</span>
              <span className="font-pixel" style={{ fontSize: '11px', color: '#e8d8b8' }}>{meta.totalRuns}회</span>
            </div>
            <div className="flex justify-between">
              <span className="font-pixel" style={{ fontSize: '11px', color: '#9878c0' }}>클리어 횟수</span>
              <span className="font-pixel" style={{ fontSize: '11px', color: '#f0c040' }}>{meta.totalClears}회</span>
            </div>
            <div className="flex justify-between">
              <span className="font-pixel" style={{ fontSize: '11px', color: '#9878c0' }}>최고 층수</span>
              <span className="font-pixel" style={{ fontSize: '11px', color: '#e8d8b8' }}>{meta.bestDepth}층</span>
            </div>
            <div className="flex justify-between">
              <span className="font-pixel" style={{ fontSize: '11px', color: '#9878c0' }}>보유 유산 포인트</span>
              <span className="font-pixel" style={{ fontSize: '12px', color: '#f0c040' }}>{meta.legacyPoints} pt</span>
            </div>
          </div>
        </PixelPanel>

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
