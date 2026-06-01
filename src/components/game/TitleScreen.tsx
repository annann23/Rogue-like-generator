import { useGameState } from '@/hooks/useGameState';

export default function TitleScreen() {
  const { setScreen, meta } = useGameState();

  return (
    <div className="flex flex-col items-center justify-center w-full h-full dungeon-bg relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <span className="text-[20rem] select-none">💀</span>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {/* 타이틀 */}
        <div className="text-center space-y-4">
          <h1
            className="font-pixel text-2xl md:text-3xl leading-relaxed"
            style={{ color: '#f0c040', textShadow: '3px 3px 0 #7a3c00' }}
          >
            AI 로그라이크
          </h1>
          <h2
            className="font-pixel text-xl md:text-2xl leading-relaxed"
            style={{ color: '#f0c040', textShadow: '3px 3px 0 #7a3c00' }}
          >
            던전 RPG
          </h2>
        </div>

        {/* 부제 */}
        <p
          className="font-pixel text-xs text-center leading-6"
          style={{ color: '#9878c0' }}
        >
          ─ 던전의 신이 기다린다 ─
        </p>

        {/* 메타 정보 */}
        {meta.totalRuns > 0 && (
          <div
            className="font-pixel text-xs text-center space-y-1"
            style={{ color: '#6b4fa0' }}
          >
            <p>총 {meta.totalRuns}회 도전 · 최대 {meta.bestDepth}층</p>
            <p>유산 포인트: {meta.legacyPoints}pt</p>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex flex-col items-center gap-4 mt-4">
          <button
            onClick={() => setScreen('survey')}
            className="font-pixel text-sm px-8 py-4 cursor-pointer transition-all duration-75 active:translate-y-px border-2"
            style={{
              backgroundColor: '#4a3070',
              color: '#f0c040',
              borderColor: '#f0c040',
              textShadow: '1px 1px 0 #000',
              boxShadow: '4px 4px 0 #1a0f2e',
            }}
            onMouseEnter={e => {
              (e.target as HTMLElement).style.backgroundColor = '#6b4fa0';
            }}
            onMouseLeave={e => {
              (e.target as HTMLElement).style.backgroundColor = '#4a3070';
            }}
          >
            ⚔️ 던전에 도전하라
          </button>

          {meta.totalRuns > 0 && (
            <button
              onClick={() => setScreen('meta')}
              className="font-pixel text-xs px-6 py-3 cursor-pointer transition-all duration-75 border-2"
              style={{
                backgroundColor: '#2d1b4e',
                color: '#9878c0',
                borderColor: '#6b4fa0',
                boxShadow: '4px 4px 0 #1a0f2e',
              }}
              onMouseEnter={e => {
                (e.target as HTMLElement).style.backgroundColor = '#3d2860';
              }}
              onMouseLeave={e => {
                (e.target as HTMLElement).style.backgroundColor = '#2d1b4e';
              }}
            >
              🏆 유산 업그레이드
            </button>
          )}
        </div>

        {/* 하단 안내 */}
        <p
          className="font-pixel text-xs mt-8"
          style={{ color: '#3d2860' }}
        >
          Claude API · Supabase · Kenney CC0
        </p>
      </div>
    </div>
  );
}
