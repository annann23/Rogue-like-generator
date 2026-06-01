// 2번 작업에서 구현
import { useGameState } from '@/hooks/useGameState';

export default function SurveyScreen() {
  const setScreen = useGameState((s) => s.setScreen);
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="font-pixel text-center space-y-4">
        <p style={{ color: '#f0c040' }}>⚡ 던전의 신이 묻는다... ⚡</p>
        <p style={{ color: '#9878c0' }} className="text-xs">설문조사 화면 - 3번 작업에서 구현</p>
        <button
          onClick={() => setScreen('stat-reveal')}
          className="font-pixel text-xs px-4 py-2 border"
          style={{ color: '#e8d8b8', borderColor: '#6b4fa0', backgroundColor: '#2d1b4e' }}
        >
          임시: 다음으로
        </button>
      </div>
    </div>
  );
}
