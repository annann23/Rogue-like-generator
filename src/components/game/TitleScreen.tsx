import { useGameState } from '@/hooks/useGameState';
import { PixelPanel, PixelButton, PixelDivider } from './UIFrame';

export default function TitleScreen() {
  const { setScreen, meta } = useGameState();

  return (
    <div className="flex items-center justify-center w-full h-full dungeon-bg p-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <PixelPanel variant="dark" className="p-8">
          <div className="text-center space-y-6">
            <div>
              <h1
                className="font-pixel leading-relaxed"
                style={{ fontSize: '20px', color: '#f0c040', textShadow: '3px 3px 0 #7a3c00' }}
              >
                AI 로그라이크
              </h1>
              <h2
                className="font-pixel leading-relaxed mt-2"
                style={{ fontSize: '18px', color: '#f0c040', textShadow: '3px 3px 0 #7a3c00' }}
              >
                던전 RPG
              </h2>
              <p className="font-pixel mt-3" style={{ fontSize: '12px', color: '#9878c0' }}>
                ─ 던전의 신이 기다린다 ─
              </p>
            </div>

            {meta.totalRuns > 0 && (
              <div className="font-pixel space-y-1" style={{ fontSize: '12px', color: '#6b4fa0' }}>
                <p>총 {meta.totalRuns}회 도전 · 최대 {meta.bestDepth}층</p>
                <p>유산 포인트: {meta.legacyPoints}pt</p>
              </div>
            )}

            <PixelDivider label="선택" />

            <div className="flex flex-col items-center gap-3">
              <PixelButton size="lg" variant="primary" onClick={() => setScreen('survey')}>
                ⚔️ 던전에 도전하라
              </PixelButton>

              {meta.totalRuns > 0 && (
                <PixelButton size="md" variant="secondary" onClick={() => setScreen('meta')}>
                  🏆 유산 업그레이드
                </PixelButton>
              )}
            </div>
          </div>
        </PixelPanel>

        <p
          className="font-pixel text-center"
          style={{ fontSize: '11px', color: '#3d2860' }}
        >
          Claude API · Kenney CC0 Assets
        </p>
      </div>
    </div>
  );
}
