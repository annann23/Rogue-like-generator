import { useGameState } from '@/hooks/useGameState';
import { META_UPGRADES } from '@/constants/metaUpgrades';
import { PixelPanel, PixelButton, PixelDivider } from './UIFrame';

export default function MetaScreen() {
  const { meta, setScreen, purchaseUpgrade } = useGameState();

  return (
    <div className="flex flex-col w-full h-full min-h-screen dungeon-bg overflow-y-auto">
      <div className="flex flex-col gap-5 max-w-xl mx-auto w-full p-5 py-8">

        {/* 헤더 */}
        <div className="text-center space-y-2">
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
            </div>
          </div>
        </PixelPanel>

        {/* 업그레이드 목록 */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {META_UPGRADES.map((upg) => {
            const currentLevel = meta.upgrades[upg.id] ?? 0;
            const isMaxed = currentLevel >= upg.maxLevel;
            const canAfford = meta.legacyPoints >= upg.costPerLevel;
            const nextCost = upg.costPerLevel;

            return (
              <PixelPanel
                key={upg.id}
                variant={isMaxed ? 'brown' : 'dark'}
                className="p-4"
              >
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
                    {/* 레벨 표시 */}
                    <div className="flex gap-1 mt-2">
                      {Array.from({ length: upg.maxLevel }, (_, i) => (
                        <div
                          key={i}
                          style={{
                            width: '10px', height: '10px',
                            background: i < currentLevel ? '#f0c040' : '#2d1b4e',
                            border: '2px solid #4a2d7a',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {isMaxed ? (
                      <span className="font-pixel" style={{ fontSize: '9px', color: '#f0c040' }}>MAX</span>
                    ) : (
                      <>
                        <span className="font-pixel" style={{ fontSize: '9px', color: canAfford ? '#f0c040' : '#6b4fa0' }}>
                          {nextCost} pt
                        </span>
                        <PixelButton
                          variant={canAfford ? 'primary' : 'ghost'}
                          size="sm"
                          disabled={!canAfford}
                          onClick={() => purchaseUpgrade(upg.id, nextCost)}
                        >
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

        <PixelDivider />

        {/* 새 도전 버튼 */}
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
