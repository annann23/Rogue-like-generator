import { useState, useEffect, useCallback } from 'react';
import { useGameState } from '@/hooks/useGameState';

// ─── 프롤로그 패널 정의 ───────────────────────
interface Panel {
  label: string;       // 상단 소제목
  lines: string[];     // 본문 줄
  color?: string;      // 본문 색상
}

const PANELS: Panel[] = [
  {
    label: '태초에',
    lines: [
      '변덕스럽고 심술궂은 신이 이 지하 미궁을 만들었다.',
      '',
      '신은 선포했다.',
      '',
      '"나는 진정으로 가치 있는 영혼을 찾고 있다."',
      '"수천, 수만의 영혼 중 단 하나."',
      '"그 영혼만이 이 미궁을 빠져나갈 수 있다."',
    ],
  },
  {
    label: '심판의 저주',
    lines: [
      '신의 눈에 든 영혼은 도망칠 수 없다.',
      '',
      '죽어도 다시 이 땅에서 깨어난다.',
      '새로운 몸으로, 희미한 기억만을 안고.',
      '',
      '그것이 이 미궁의 규칙이다.',
      '신이 만든 저주이자, 신이 내린 기회다.',
    ],
    color: '#c8a0e0',
  },
  {
    label: '아직 열리지 않은 문',
    lines: [
      '던전의 가장 깊은 곳에 문이 있다고 한다.',
      '',
      '신이 인정한 영혼만이',
      '그 문의 빗장을 열 수 있다.',
      '',
      '수백 개의 영혼이 이 길을 걸었다.',
      '그 문을 연 자는 아직... 없다.',
    ],
    color: '#f0c040',
  },
  {
    label: '그리고 오늘',
    lines: [
      '오늘, 또 하나의 영혼이 눈을 뜬다.',
      '',
      '당신은 이미 이 길을 수없이 걸었는지 모른다.',
      '기억은 없어도, 영혼은 기억한다.',
      '',
      '이번에는 — 나갈 수 있을까.',
    ],
    color: '#e8d8b8',
  },
];

// ─── Component ────────────────────────────────
export default function PrologueScreen() {
  const setScreen = useGameState((s) => s.setScreen);

  const [panelIdx, setPanelIdx] = useState(0);
  const [visibleLines, setVisibleLines] = useState(0);
  const [panelDone, setPanelDone] = useState(false);
  const [exiting, setExiting] = useState(false);

  const panel = PANELS[panelIdx];
  const isLastPanel = panelIdx === PANELS.length - 1;

  // 줄 단위 reveal
  useEffect(() => {
    setPanelDone(false);
    setVisibleLines(0);
  }, [panelIdx]);

  useEffect(() => {
    if (visibleLines >= panel.lines.length) {
      setTimeout(() => setPanelDone(true), 300);
      return;
    }
    const isBlank = panel.lines[visibleLines] === '';
    const id = setTimeout(
      () => setVisibleLines((v) => v + 1),
      isBlank ? 160 : 480,
    );
    return () => clearTimeout(id);
  }, [visibleLines, panel.lines]);

  const handleNext = useCallback(() => {
    if (!panelDone) {
      // 스킵: 모든 줄 즉시 표시
      setVisibleLines(panel.lines.length);
      setPanelDone(true);
      return;
    }
    if (isLastPanel) {
      setExiting(true);
      setTimeout(() => {
        useGameState.setState((state) => ({
          meta: { ...state.meta, prologueShown: true },
        }));
        setScreen('game');
      }, 600);
    } else {
      setPanelIdx((i) => i + 1);
    }
  }, [panelDone, isLastPanel, panel.lines.length, setScreen]);

  // 키보드 스페이스/엔터
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') handleNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleNext]);

  return (
    <div
      className="w-full h-full dungeon-bg flex items-center justify-center"
      style={{
        padding: '24px',
        opacity: exiting ? 0 : 1,
        transition: 'opacity 0.6s ease',
      }}
      onClick={handleNext}
    >
      <div
        style={{
          maxWidth: '540px',
          width: '100%',
          position: 'relative',
          userSelect: 'none',
        }}
      >
        {/* 패널 번호 도트 */}
        <div className="flex justify-center gap-2 mb-6">
          {PANELS.map((_, i) => (
            <div
              key={i}
              style={{
                width: '6px',
                height: '6px',
                background: i <= panelIdx ? '#6b4fa0' : '#1a0f2e',
                border: '2px solid #3a2560',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        {/* 소제목 */}
        <p
          className="font-pixel text-center mb-8"
          style={{
            fontSize: '10px',
            color: '#6b4fa0',
            letterSpacing: '4px',
          }}
        >
          ✦ {panel.label} ✦
        </p>

        {/* 본문 */}
        <div style={{ minHeight: '260px' }}>
          {panel.lines.slice(0, visibleLines).map((line, idx) => (
            <p
              key={`${panelIdx}-${idx}`}
              className="font-pixel"
              style={{
                fontSize: '12px',
                lineHeight: '2.6',
                textAlign: 'center',
                color: line === '' ? undefined
                  : line.startsWith('"') ? (panel.color ?? '#c8b0e8')
                  : '#9878c0',
                minHeight: line === '' ? '16px' : undefined,
                fontStyle: line.startsWith('"') ? 'italic' : 'normal',
              }}
            >
              {line}
            </p>
          ))}
        </div>

        {/* 하단 버튼 */}
        <div
          style={{
            marginTop: '32px',
            display: 'flex',
            justifyContent: 'center',
            opacity: panelDone ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}
        >
          {isLastPanel ? (
            <button
              className="font-pixel"
              style={{
                fontSize: '12px',
                color: '#f0c040',
                background: '#1a0f2e',
                border: '3px solid #f0c040',
                padding: '12px 32px',
                cursor: 'pointer',
                letterSpacing: '2px',
                boxShadow: '0 4px 0 #7a3c00',
                pointerEvents: panelDone ? 'auto' : 'none',
              }}
            >
              던전에 입장한다
            </button>
          ) : (
            <p
              className="font-pixel"
              style={{
                fontSize: '10px',
                color: '#4a3070',
                letterSpacing: '2px',
                animation: 'pulse 1.8s ease-in-out infinite',
              }}
            >
              클릭하여 계속
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
