// 12번 작업에서 구현
import { useGameState } from '@/hooks/useGameState';

export default function DeathScreen() {
  const { setScreen, screen } = useGameState();
  const isClear = screen === 'clear';

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="font-pixel text-center space-y-4">
        <p style={{ color: isClear ? '#40c040' : '#e04040' }}>
          {isClear ? '🏆 클리어!' : '💀 사망'}
        </p>
        <p style={{ color: '#9878c0' }} className="text-xs">
          사망/클리어 화면 - 12번 작업에서 구현
        </p>
        <button
          onClick={() => setScreen('title')}
          className="font-pixel text-xs px-4 py-2 border"
          style={{ color: '#e8d8b8', borderColor: '#6b4fa0', backgroundColor: '#2d1b4e' }}
        >
          처음으로
        </button>
      </div>
    </div>
  );
}
