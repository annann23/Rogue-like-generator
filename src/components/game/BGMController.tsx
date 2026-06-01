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
      return 'game-over.mp3';
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
  const { muted, toggleMute } = useBGM(track);

  return (
    <button
      onClick={toggleMute}
      title={muted ? 'BGM 켜기' : 'BGM 끄기'}
      style={{
        position: 'fixed',
        bottom: '12px',
        right: '12px',
        zIndex: 9999,
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '14px',
        width: '36px',
        height: '36px',
        background: '#1a0f2e',
        border: `2px solid ${muted ? '#4a3070' : '#6b4fa0'}`,
        color: muted ? '#4a3070' : '#c8b8e8',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: muted ? 0.6 : 1,
        transition: 'opacity 0.2s, border-color 0.2s',
      }}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
