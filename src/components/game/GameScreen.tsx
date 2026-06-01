// 6번 작업에서 구현
import { useGameState } from '@/hooks/useGameState';

export default function GameScreen() {
  const setScreen = useGameState((s) => s.setScreen);
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="font-pixel text-center space-y-4">
        <p style={{ color: '#f0c040' }}>⚔️ 던전 탐험 중...</p>
        <p style={{ color: '#9878c0' }} className="text-xs">메인 게임 화면 - 6번 작업에서 구현</p>
        <button
          onClick={() => setScreen('death')}
          className="font-pixel text-xs px-4 py-2 border"
          style={{ color: '#e04040', borderColor: '#e04040', backgroundColor: '#2d1b4e' }}
        >
          임시: 사망
        </button>
      </div>
    </div>
  );
}
