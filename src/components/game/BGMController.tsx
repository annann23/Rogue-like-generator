import { useGameState } from '@/hooks/useGameState';
import { useBGM } from '@/hooks/useBGM';

// 화면·상황 → 트랙 매핑
function resolveTrack(screen: string, bgmTrack: string | null): string | null {
  // 게임 중 상황별 트랙은 GameScreen이 bgmTrack으로 직접 제어
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
  useBGM(track);

  return null;
}
