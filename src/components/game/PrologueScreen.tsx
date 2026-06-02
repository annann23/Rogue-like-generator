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
    label: '신의 최후',
    lines: [
      '이 미궁 깊은 곳에, 한때 신이 살았다.',
      '여섯 개의 보석으로 이 세계를 지탱하며.',
      '',
      '어느 날 밤 — 악마가 내려왔다.',
      '',
      '신은 저항했다.',
      '그리고 산산조각 났다.',
    ],
  },
  {
    label: '계약',
    lines: [
      '악마는 보석들을 미궁 깊은 곳에 흩뿌렸다.',
      '그리고 그 자리에 있던 당신을 발견했다.',
      '',
      '"흥미롭군."',
      '',
      '당신은 무언가와 거래를 했다.',
      '무엇을 얻기 위해서였는지 — 기억나지 않는다.',
    ],
    color: '#e0a060',
  },
  {
    label: '각인',
    lines: [
      '계약은 영혼에 새겨졌다.',
      '',
      '여섯 개의 보석이 모두 모이기 전까지,',
      '이 땅을 벗어날 수 없다.',
      '죽어도 — 다시 깨어난다.',
      '',
      '그리고 깨어날 때마다,',
      '악마는 당신의 영혼을 심문한다.',
    ],
    color: '#c8a0e0',
  },
  {
    label: '그리고 오늘',
    lines: [
      '수백 번의 환생이 지났다.',
      '기억은 없어도, 손이 기억한다.',
      '',
      '무언가를 찾아야 한다는 본능.',
      '',
      '그리고 한 가지 의문 —',
      '나는 대체, 무엇과 거래를 했는가.',
    ],
    color: '#f0c040',
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
        setScreen('survey');
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
            fontSize: '13px',
            color: '#9878c0',
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
                fontSize: '14px',
                lineHeight: '3',
                textAlign: 'center',
                color: line === '' ? undefined
                  : line.startsWith('"') ? (panel.color ?? '#e8d8b8')
                  : '#c8b0e8',
                minHeight: line === '' ? '20px' : undefined,
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
                fontSize: '13px',
                color: '#9878c0',
                letterSpacing: '2px',
                animation: 'pulse 1.8s ease-in-out infinite',
              }}
            >
              클릭하여 계속 ▶
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
