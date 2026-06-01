// 10번 작업에서 구현
import { useGameState } from '@/hooks/useGameState';

export default function MetaScreen() {
  const { setScreen, meta } = useGameState();
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="font-pixel text-center space-y-4">
        <p style={{ color: '#f0c040' }}>🏆 유산 업그레이드</p>
        <p style={{ color: '#9878c0' }} className="text-xs">
          보유 포인트: {meta.legacyPoints}pt
        </p>
        <p style={{ color: '#9878c0' }} className="text-xs">메타 시스템 - 10번 작업에서 구현</p>
        <button
          onClick={() => setScreen('title')}
          className="font-pixel text-xs px-4 py-2 border"
          style={{ color: '#e8d8b8', borderColor: '#6b4fa0', backgroundColor: '#2d1b4e' }}
        >
          돌아가기
        </button>
      </div>
    </div>
  );
}
