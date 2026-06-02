import { useState, useEffect } from 'react';
import { useGameState } from '@/hooks/useGameState';

const MURAL_LINES = [
  '던전 입구. 먼지 쌓인 벽에 낡은 비문이 새겨져 있다.',
  '',
  '"이 곳에는 사람의 탈을 쓴 자들이 있다."',
  '"정령이라 불리는 존재들 — 그들은 인간 틈에 섞여,"',
  '"스스로를 좀처럼 드러내지 않는다."',
  '',
  '"그러나 그들은 영혼을 알아본다."',
  '"몇 번을 죽고 다시 태어나도,"',
  '"같은 영혼이 돌아오면 — 그들은 안다."',
  '',
  '"누군가의 기록에 이런 말이 있었다:"',
  '"그들과 깊은 신뢰를 쌓으면, 그들은"',
  '"무언가 귀한 것을 내어준다고..."',
  '',
  '— 비문은 여기서 끊겨있다.',
];

export default function PrologueScreen() {
  const setScreen = useGameState((s) => s.setScreen);
  const [visibleLines, setVisibleLines] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (visibleLines >= MURAL_LINES.length) {
      setTimeout(() => setDone(true), 400);
      return;
    }
    const delay = MURAL_LINES[visibleLines] === '' ? 180 : 420;
    const id = setTimeout(() => setVisibleLines((v) => v + 1), delay);
    return () => clearTimeout(id);
  }, [visibleLines]);

  function handleContinue() {
    useGameState.setState((state) => ({
      meta: { ...state.meta, prologueShown: true },
    }));
    setScreen('game');
  }

  return (
    <div
      className="w-full h-full flex items-center justify-center dungeon-bg"
      style={{ padding: '24px' }}
    >
      <div
        style={{
          maxWidth: '520px',
          width: '100%',
          background: '#0a0618',
          border: '3px solid #3a2560',
          boxShadow: '0 0 40px rgba(74,45,122,0.3), inset 0 0 30px rgba(0,0,0,0.6)',
          padding: '32px 28px',
          position: 'relative',
        }}
      >
        {/* 상단 장식 */}
        <div
          style={{
            position: 'absolute',
            top: '-2px', left: '20px', right: '20px',
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #6b4fa0, transparent)',
          }}
        />

        {/* 제목 */}
        <p
          className="font-pixel text-center mb-6"
          style={{ fontSize: '11px', color: '#6b4fa0', letterSpacing: '3px' }}
        >
          ✦ 던전 입구의 비문 ✦
        </p>

        {/* 비문 내용 */}
        <div
          style={{
            minHeight: '320px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0px',
          }}
        >
          {MURAL_LINES.slice(0, visibleLines).map((line, idx) => (
            <p
              key={idx}
              className="font-pixel"
              style={{
                fontSize: '11px',
                lineHeight: '2.4',
                color: line.startsWith('"') ? '#c8b0e8'
                  : line.startsWith('—') ? '#6b4fa0'
                  : line === '' ? undefined
                  : '#9878c0',
                fontStyle: line.startsWith('"') ? 'italic' : 'normal',
                minHeight: line === '' ? '12px' : undefined,
              }}
            >
              {line}
            </p>
          ))}
        </div>

        {/* 계속 버튼 */}
        <div
          style={{
            marginTop: '24px',
            display: 'flex',
            justifyContent: 'center',
            opacity: done ? 1 : 0,
            transition: 'opacity 0.6s ease',
            pointerEvents: done ? 'auto' : 'none',
          }}
        >
          <button
            className="font-pixel"
            onClick={handleContinue}
            style={{
              fontSize: '12px',
              color: '#f0c040',
              background: '#1a0f2e',
              border: '3px solid #f0c040',
              padding: '12px 28px',
              cursor: 'pointer',
              letterSpacing: '2px',
              boxShadow: '0 4px 0 #7a3c00',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#2a1a08';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#1a0f2e';
            }}
          >
            던전에 입장한다 →
          </button>
        </div>

        {/* 하단 장식 */}
        <div
          style={{
            position: 'absolute',
            bottom: '-2px', left: '20px', right: '20px',
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #6b4fa0, transparent)',
          }}
        />
      </div>
    </div>
  );
}
