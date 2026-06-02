import { type SpriteKey, getSpritePath, getTilePath } from '@/constants/spriteMap';

type SpriteAnimation = 'idle' | 'combat' | 'hit' | 'float' | 'none' | 'hit-red' | 'hit-blue' | 'hit-critical' | 'knockback' | 'boss-enter';

interface SpriteProps {
  // 스프라이트 지정: key 이름 또는 tile 번호
  spriteKey?: SpriteKey;
  tileNum?: number;
  // 크기: scale=1 → 16px, 2 → 32px, 3 → 48px, 4 → 64px
  scale?: number;
  animation?: SpriteAnimation;
  flip?: boolean; // 좌우 반전 (적 캐릭터 등)
  className?: string;
  style?: React.CSSProperties;
}

const ANIM_CLASS: Record<SpriteAnimation, string> = {
  idle:          'sprite-idle',
  combat:        'sprite-combat',
  hit:           'sprite-hit',
  float:         'sprite-float',
  none:          '',
  'hit-red':     'sprite-hit-red',
  'hit-blue':    'sprite-hit-blue',
  'hit-critical':'sprite-hit-critical',
  'knockback':   'sprite-knockback',
  'boss-enter':  'sprite-boss-enter',
};

export default function Sprite({
  spriteKey,
  tileNum,
  scale = 3,
  animation = 'none',
  flip = false,
  className = '',
  style,
}: SpriteProps) {
  const src = spriteKey
    ? getSpritePath(spriteKey)
    : tileNum !== undefined
      ? getTilePath(tileNum)
      : null;

  if (!src) return null;

  const px = 16 * scale;
  const animClass = ANIM_CLASS[animation];

  return (
    <div
      className={`inline-block ${className}`}
      style={{ width: px, height: px, flexShrink: 0, ...style }}
    >
      <img
        src={src}
        alt=""
        width={px}
        height={px}
        className={animClass}
        style={{
          imageRendering: 'pixelated',
          display: 'block',
          transform: flip ? 'scaleX(-1)' : undefined,
        }}
        draggable={false}
      />
    </div>
  );
}
