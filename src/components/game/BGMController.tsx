import { useGameState } from '@/hooks/useGameState';
import { useBGM } from '@/hooks/useBGM';

function resolveTrack(screen: string, bgmTrack: string | null): string | null {
  if (screen === 'game') return bgmTrack;
  switch (screen) {
    case 'title':
    case 'survey':
    case 'stat-reveal':
    case 'character-select':
    case 'meta':
      return 'intro.mp3';
    case 'death':
      return 'gameover.mp3';
    case 'clear':
      return 'success.mp3';
    default:
      return 'intro.mp3';
  }
}

export default function BGMController() {
  const screen   = useGameState((s) => s.screen);
  const bgmTrack = useGameState((s) => s.bgmTrack);

  const track = resolveTrack(screen, bgmTrack);
  const { muted, blocked, toggleMute } = useBGM(track);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '12px',
        right: '12px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '6px',
        pointerEvents: 'none',
      }}
    >
      {/* 자동재생 차단 안내 — 클릭하면 BGM 시작됨 */}
      {blocked && (
        <div
          onClick={toggleMute}
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '10px',
            color: '#f0c040',
            background: '#1a0f2e',
            border: '2px solid #6b4fa0',
            padding: '6px 10px',
            cursor: 'pointer',
            pointerEvents: 'auto',
            animation: 'bgmPulse 1.4s ease-in-out infinite',
          }}
        >
          🎵 클릭해서 BGM 시작
        </div>
      )}

      {/* 뮤트 토글 버튼 */}
      <button
        onClick={toggleMute}
        title={muted ? 'BGM 켜기' : 'BGM 끄기'}
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '14px',
          width: '36px',
          height: '36px',
          background: '#1a0f2e',
          border: `2px solid ${muted ? '#4a3070' : '#6b4fa0'}`,
          color: muted ? '#4a3070' : '#c8b8e8',
          cursor: 'pointer',
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: muted ? 0.6 : 1,
          transition: 'opacity 0.2s, border-color 0.2s',
        }}
      >
        {muted ? '🔇' : '🔊'}
      </button>

      <style>{`
        @keyframes bgmPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
