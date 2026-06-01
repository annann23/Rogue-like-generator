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
  const { locked, muted, unlock, toggleMute } = useBGM(track);

  // locked  : 아직 첫 인터랙션 없음 → 클릭 시 unlock (소리 시작)
  // !locked : 이미 재생 중 → 클릭 시 뮤트 토글
  const handleClick = () => {
    if (locked) unlock();
    else toggleMute();
  };

  const showMuted = locked || muted;

  return (
    <button
      onClick={handleClick}
      title={locked ? 'BGM 시작' : muted ? 'BGM 켜기' : 'BGM 끄기'}
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
        border: `2px solid ${showMuted ? '#4a3070' : '#6b4fa0'}`,
        color: showMuted ? '#4a3070' : '#c8b8e8',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: showMuted ? 0.6 : 1,
        transition: 'opacity 0.2s, border-color 0.2s',
      }}
    >
      {showMuted ? '🔇' : '🔊'}
    </button>
  );
}
