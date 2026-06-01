import { useMemo } from 'react';
import { getTilePath } from '@/constants/spriteMap';

// TMX CSV값은 1-based → tile index = CSV값 - 1
const T = {
  DIRT:    0,   // tile_0000: 평범한 흙바닥
  FL_TL:   1,   // tile_0001: 성벽 좌상 모서리 바닥
  FL_T:    2,   // tile_0002: 성벽 상단 바닥
  FL_TR:   3,   // tile_0003: 성벽 우상 모서리 바닥
  W_L:    13,   // tile_0013: 왼쪽 벽
  W_R:    15,   // tile_0015: 오른쪽 벽
  W_ARCH: 40,   // tile_0040: 석조 아치/천장 행
  FLOOR:  48,   // tile_0048: 내부 바닥
  FLOOR2: 49,   // tile_0049: 내부 바닥 변형
  FLOOR3: 50,   // tile_0050: 내부 바닥 변형2
  W_BL:   25,   // tile_0025: 하단 좌코너 벽
  W_BOT:  26,   // tile_0026: 하단 수평 벽
  W_BR:   27,   // tile_0027: 하단 우코너 벽
};

function seededRng(seed: number) {
  let s = seed | 1;
  return () => {
    s = Math.imul(s, 1664525) + 1013904223;
    return (s >>> 0) / 0x100000000;
  };
}

function buildRoom(seed: number, cols: number, rows: number): number[][] {
  const rng = seededRng(seed);
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const isLeft  = c === 0;
      const isRight = c === cols - 1;

      if (r === 0) {
        if (isLeft)  return T.FL_TL;
        if (isRight) return T.FL_TR;
        return T.FL_T;
      }
      if (r === 1) {
        if (isLeft)  return T.W_L;
        if (isRight) return T.W_R;
        return T.W_ARCH;
      }
      if (r === rows - 1) {
        if (isLeft)  return T.W_BL;
        if (isRight) return T.W_BR;
        return T.W_BOT;
      }
      if (isLeft)  return T.W_L;
      if (isRight) return T.W_R;

      const v = rng();
      if (v < 0.06) return T.FLOOR2;
      if (v < 0.10) return T.FLOOR3;
      return T.FLOOR;
    })
  );
}

interface DungeonBackgroundProps {
  seed: string;
  scale?: number;
  opacity?: number;
}

export default function DungeonBackground({ seed, scale = 2, opacity = 0.3 }: DungeonBackgroundProps) {
  const COLS = 24;
  const ROWS = 14;
  const px = 16 * scale;

  const grid = useMemo(() => {
    const n = parseInt(seed, 36) % 0xffffff || 1;
    return buildRoom(n, COLS, ROWS);
  }, [seed]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        opacity,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {grid.map((row, r) => (
          <div key={r} style={{ display: 'flex' }}>
            {row.map((tileNum, c) => (
              <img
                key={c}
                src={getTilePath(tileNum)}
                width={px}
                height={px}
                alt=""
                draggable={false}
                style={{ imageRendering: 'pixelated', display: 'block' }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
