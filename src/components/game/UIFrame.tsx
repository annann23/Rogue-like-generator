import { type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes, forwardRef, useState, useEffect } from 'react';

// ─────────────────────────────────────────────
// PixelPanel
// ─────────────────────────────────────────────
interface PanelProps {
  children: ReactNode;
  variant?: 'brown' | 'blue' | 'dark' | 'inset';
  className?: string;
  title?: string;
}

export function PixelPanel({ children, variant = 'brown', className = '', title }: PanelProps) {
  const variantStyles: Record<string, React.CSSProperties> = {
    brown: { background: '#2d1b0e', border: '4px solid #8b5e3c', boxShadow: 'inset 0 0 0 2px #c8874a, 4px 4px 0 #0a0704' },
    blue:  { background: '#0e1f2d', border: '4px solid #3c6e8b', boxShadow: 'inset 0 0 0 2px #4a9bc4, 4px 4px 0 #040a0e' },
    dark:  { background: '#1a0f2e', border: '4px solid #6b4fa0', boxShadow: 'inset 0 0 0 2px #4a2d7a, 4px 4px 0 #080413' },
    inset: { background: '#120a1e', border: '3px solid #4a2d7a', boxShadow: 'inset 2px 2px 0 #080413' },
  };

  return (
    <div className={`relative ${className}`} style={{ ...variantStyles[variant], imageRendering: 'pixelated' }}>
      <div className="absolute top-0 left-0 pointer-events-none" style={cornerStyle('tl', variant)} />
      <div className="absolute top-0 right-0 pointer-events-none" style={cornerStyle('tr', variant)} />
      <div className="absolute bottom-0 left-0 pointer-events-none" style={cornerStyle('bl', variant)} />
      <div className="absolute bottom-0 right-0 pointer-events-none" style={cornerStyle('br', variant)} />
      {title && (
        <div className="font-pixel px-3 py-1 absolute -top-6 left-3" style={{ color: '#f0c040', background: '#1a0f2e', fontSize: '11px' }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

function cornerStyle(pos: 'tl' | 'tr' | 'bl' | 'br', variant: string): React.CSSProperties {
  const color = variant === 'blue' ? '#4a9bc4' : variant === 'dark' ? '#6b4fa0' : '#c8874a';
  const transforms: Record<string, string> = { tl: 'none', tr: 'scaleX(-1)', bl: 'scaleY(-1)', br: 'scale(-1,-1)' };
  return { width: '8px', height: '8px', background: color, clipPath: 'polygon(0 0, 100% 0, 0 100%)', transform: transforms[pos] };
}

// ─────────────────────────────────────────────
// PixelButton
// ─────────────────────────────────────────────
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  locked?: boolean;
  lockReason?: string;
}

const BTN_VARIANTS = {
  primary:   { idle: { bg: '#5a3a10', border: '#c8874a', top: '#d4a060', text: '#f0e8c8', shadow: '#1a0a04' }, hover: { bg: '#7a4e18' } },
  secondary: { idle: { bg: '#1e1040', border: '#6b4fa0', top: '#8b6fc0', text: '#c8b8e8', shadow: '#0a0420' }, hover: { bg: '#2e1860' } },
  danger:    { idle: { bg: '#3a0e0e', border: '#a03030', top: '#c04040', text: '#f0c8c8', shadow: '#1a0404' }, hover: { bg: '#5a1818' } },
  ghost:     { idle: { bg: 'transparent', border: '#4a3070', top: '#4a3070', text: '#9878c0', shadow: 'transparent' }, hover: { bg: '#1a0f2e' } },
};

const BTN_SIZES = {
  sm: { px: '14px', py: '8px',  fontSize: '12px' },
  md: { px: '18px', py: '10px', fontSize: '14px' },
  lg: { px: '24px', py: '14px', fontSize: '16px' },
};

export function PixelButton({ variant = 'primary', size = 'md', children, locked = false, lockReason, style, className = '', disabled, onMouseEnter, onMouseLeave, ...props }: ButtonProps) {
  const v = BTN_VARIANTS[variant];
  const s = BTN_SIZES[size];
  const isDisabled = locked || disabled;

  const baseStyle: React.CSSProperties = {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: s.fontSize,
    paddingLeft: s.px, paddingRight: s.px, paddingTop: s.py, paddingBottom: s.py,
    backgroundColor: v.idle.bg,
    color: v.idle.text,
    border: `3px solid ${v.idle.border}`,
    borderTop: `3px solid ${v.idle.top}`,
    boxShadow: `0 4px 0 ${v.idle.shadow}, inset 0 1px 0 ${v.idle.top}40`,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.45 : 1,
    imageRendering: 'pixelated',
    letterSpacing: '0.5px',
    lineHeight: '1.5',
    position: 'relative',
    transition: 'background-color 0.05s, transform 0.05s, box-shadow 0.05s',
    ...style,
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        {...props}
        disabled={isDisabled}
        style={baseStyle}
        onMouseEnter={e => { if (!isDisabled) (e.currentTarget as HTMLButtonElement).style.backgroundColor = v.hover.bg; onMouseEnter?.(e); }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = v.idle.bg; onMouseLeave?.(e); }}
        onMouseDown={e => { if (!isDisabled) { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = `0 2px 0 ${v.idle.shadow}`; } }}
        onMouseUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 4px 0 ${v.idle.shadow}, inset 0 1px 0 ${v.idle.top}40`; }}
      >
        {locked && <span className="mr-2">🔒</span>}
        {children}
      </button>
      {locked && lockReason && (
        <div className="absolute bottom-full left-0 mb-1 font-pixel whitespace-nowrap pointer-events-none" style={{ fontSize: '11px', color: '#f0c040', background: '#1a0f2e', border: '2px solid #6b4fa0', padding: '6px 8px', zIndex: 10 }}>
          {lockReason}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// PixelBar
// ─────────────────────────────────────────────
interface BarProps {
  value: number;
  max: number;
  variant?: 'hp' | 'mana' | 'familiarity' | 'gold' | 'xp' | 'rage';
  label?: string;
  showNumbers?: boolean;
  className?: string;
}

const BAR_COLORS = {
  hp:          { fill: '#c03030', bg: '#3a0e0e', border: '#7a2020', shine: '#e05050' },
  mana:        { fill: '#3050c0', bg: '#0e1840', border: '#203080', shine: '#5070e0' },
  familiarity: { fill: '#308050', bg: '#0e2818', border: '#205040', shine: '#50c080' },
  gold:        { fill: '#c0a020', bg: '#2a1e08', border: '#806810', shine: '#e0c040' },
  xp:          { fill: '#8030c0', bg: '#1e0830', border: '#502080', shine: '#a050e0' },
  rage:        { fill: '#c06010', bg: '#2a1008', border: '#803010', shine: '#e08030' },
};

export function PixelBar({ value, max, variant = 'hp', label, showNumbers = true, className = '' }: BarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const c = BAR_COLORS[variant];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && <span className="font-pixel shrink-0" style={{ fontSize: '12px', color: '#e8d8b8', minWidth: '28px' }}>{label}</span>}
      <div className="relative flex-1" style={{ height: '14px', background: c.bg, border: `2px solid ${c.border}`, boxShadow: 'inset 0 2px 0 #00000030', imageRendering: 'pixelated' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: c.fill, boxShadow: `inset 0 2px 0 ${c.shine}60`, transition: 'width 0.2s ease-out' }} />
        {[25, 50, 75].map(tick => (
          <div key={tick} style={{ position: 'absolute', top: 0, left: `${tick}%`, width: '1px', height: '100%', background: '#00000040' }} />
        ))}
      </div>
      {showNumbers && <span className="font-pixel shrink-0" style={{ fontSize: '12px', color: '#e8d8b8' }}>{value}/{max}</span>}
    </div>
  );
}

// ─────────────────────────────────────────────
// PixelInput
// ─────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const PixelInput = forwardRef<HTMLInputElement, InputProps>(
  function PixelInput({ className = '', style, onFocus, onBlur, ...props }, ref) {
    return (
      <input
        ref={ref}
        {...props}
        className={`font-pixel w-full ${className}`}
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '14px',
          padding: '12px 14px',
          background: '#120a1e',
          color: '#e8d8b8',
          border: '3px solid #4a2d7a',
          borderTop: '3px solid #2a1050',
          outline: 'none',
          boxShadow: 'inset 0 2px 0 #00000060',
          imageRendering: 'pixelated',
          lineHeight: '1.6',
          ...style,
        }}
        onFocus={e => { e.currentTarget.style.borderColor = '#f0c040'; e.currentTarget.style.boxShadow = 'inset 0 2px 0 #00000060, 0 0 0 2px #f0c04040'; onFocus?.(e); }}
        onBlur={e =>  { e.currentTarget.style.borderColor = '#4a2d7a'; e.currentTarget.style.boxShadow = 'inset 0 2px 0 #00000060'; onBlur?.(e); }}
      />
    );
  },
);

// ─────────────────────────────────────────────
// PixelSlot
// ─────────────────────────────────────────────
interface SlotProps {
  children?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  cursed?: boolean;
  className?: string;
  onClick?: () => void;
}

const SLOT_SIZES = { sm: 40, md: 56, lg: 72 };

export function PixelSlot({ children, size = 'md', active = false, cursed = false, className = '', onClick }: SlotProps) {
  const px = SLOT_SIZES[size];
  const borderColor = cursed ? '#800020' : active ? '#f0c040' : '#6b4fa0';
  const bgColor = cursed ? '#1a0010' : '#120a1e';

  return (
    <div
      className={`relative flex items-center justify-center ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ width: px, height: px, background: bgColor, border: `3px solid ${borderColor}`, boxShadow: active ? `0 0 10px ${borderColor}80, inset 0 0 4px ${borderColor}40` : 'inset 0 2px 0 #00000040', imageRendering: 'pixelated', flexShrink: 0 }}
      onClick={onClick}
    >
      {cursed && <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(45deg, #80002010 0px, transparent 2px, transparent 4px)' }} />}
      <div className="text-center" style={{ fontSize: size === 'sm' ? '18px' : size === 'md' ? '24px' : '32px' }}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PixelBadge
// ─────────────────────────────────────────────
interface BadgeProps {
  icon: string;
  label: string;
  value: number;
  className?: string;
}

export function PixelBadge({ icon, label: _label, value, className = '' }: BadgeProps) {
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`} style={{ opacity: value === 0 ? 0.4 : 1 }}>
      <div className="flex items-center justify-center" style={{ width: '36px', height: '36px', background: '#1e1040', border: '2px solid #6b4fa0', boxShadow: 'inset 0 1px 0 #8b6fc040', fontSize: '18px' }}>
        {icon}
      </div>
      <span className="font-pixel" style={{ fontSize: '12px', color: '#f0c040' }}>{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// PixelDivider
// ─────────────────────────────────────────────
interface DividerProps {
  label?: string;
  className?: string;
}

export function PixelDivider({ label, className = '' }: DividerProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div style={{ flex: 1, height: '2px', background: 'repeating-linear-gradient(90deg, #6b4fa0 0px, #6b4fa0 4px, transparent 4px, transparent 8px)' }} />
      {label && <span className="font-pixel px-2" style={{ fontSize: '12px', color: '#9878c0' }}>{label}</span>}
      <div style={{ flex: 1, height: '2px', background: 'repeating-linear-gradient(90deg, #6b4fa0 0px, #6b4fa0 4px, transparent 4px, transparent 8px)' }} />
    </div>
  );
}

// ─────────────────────────────────────────────
// PixelDialogFrame
// ─────────────────────────────────────────────
interface DialogFrameProps {
  npcName: string;
  npcIcon: ReactNode;
  familiarity?: number;
  maxFamiliarity?: number;
  familiarityLabel?: string;
  children: ReactNode;
  className?: string;
}

export function PixelDialogFrame({ npcName, npcIcon, familiarity, maxFamiliarity = 100, familiarityLabel, children, className = '' }: DialogFrameProps) {
  return (
    <PixelPanel variant="brown" className={`flex flex-col ${className}`}>
      <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '3px solid #8b5e3c', background: '#1a0e08' }}>
        <div className="flex items-center justify-center shrink-0" style={{ width: '48px', height: '48px', background: '#2d1b0e', border: '3px solid #c8874a', fontSize: '26px', imageRendering: 'pixelated' }}>
          {npcIcon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-pixel" style={{ fontSize: '14px', color: '#f0c040' }}>{npcName}</p>
          {familiarity !== undefined && (
            <div className="mt-2">
              <PixelBar value={familiarity} max={maxFamiliarity} variant="familiarity" label={familiarityLabel} showNumbers={false} />
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 p-4">{children}</div>
    </PixelPanel>
  );
}

// ─────────────────────────────────────────────
// PixelHUD
// ─────────────────────────────────────────────
interface HUDProps {
  hp: number; maxHp: number; gold: number; atk: number; def: number; depth: number;
  mana?: number; maxMana?: number;
  skills: Record<string, number>;
  className?: string;
}

export function PixelHUD({ hp, maxHp, gold, atk, def, depth, mana, maxMana, skills, className = '' }: HUDProps) {
  return (
    <div className={`flex flex-col gap-2 px-4 py-3 ${className}`} style={{ background: '#120a1e', borderBottom: '3px solid #6b4fa0', boxShadow: '0 2px 0 #080413' }}>
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2" style={{ minWidth: '160px' }}>
          <span className="font-pixel" style={{ fontSize: '12px', color: '#e04040' }}>❤️</span>
          <PixelBar value={hp} max={maxHp} variant="hp" showNumbers />
        </div>
        {mana !== undefined && maxMana !== undefined && (
          <div className="flex items-center gap-2" style={{ minWidth: '140px' }}>
            <span className="font-pixel" style={{ fontSize: '12px', color: '#5070e0' }}>💙</span>
            <PixelBar value={mana} max={maxMana} variant="mana" showNumbers />
          </div>
        )}
        <span className="font-pixel" style={{ fontSize: '12px', color: '#f0c040' }}>💰 {gold}G</span>
        <span className="font-pixel" style={{ fontSize: '12px', color: '#e8d8b8' }}>⚔️ <span style={{ color: '#9878c0', fontSize: '10px' }}>ATK</span> {atk}</span>
        <span className="font-pixel" style={{ fontSize: '12px', color: '#e8d8b8' }}>🛡️ <span style={{ color: '#9878c0', fontSize: '10px' }}>DEF</span> {def}</span>
        <span className="font-pixel ml-auto" style={{ fontSize: '12px', color: '#9878c0' }}>{depth}층</span>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        {[
          { key: 'intelligence', icon: '🧠' }, { key: 'negotiation', icon: '🗣️' },
          { key: 'lockpick', icon: '🔓' },     { key: 'stealth', icon: '👁️' },
          { key: 'strength', icon: '💪' },      { key: 'arcane', icon: '✨' },
        ].map(({ key, icon }) => {
          const lv = skills[key] ?? 0;
          return (
            <span key={key} className="font-pixel" style={{ fontSize: '11px', color: lv > 0 ? '#e8d8b8' : '#4a3070' }}>
              {icon} <span style={{ fontSize: '9px', color: lv > 0 ? '#9878c0' : '#3a2060' }}>Lv.</span>{lv}<span style={{ fontSize: '9px', color: '#3a2060' }}>/5</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PixelChoiceButton
// ─────────────────────────────────────────────
interface ChoiceButtonProps {
  text: string;
  icon?: string;
  locked?: boolean;
  lockReason?: string;
  classOnly?: string | null;
  playerClass?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function PixelChoiceButton({ text, icon, locked = false, lockReason, classOnly, playerClass, onClick, disabled = false }: ChoiceButtonProps) {
  // 클래스 전용 조건: 숨기지 않고 잠금 표시
  const isClassLocked = classOnly != null && classOnly !== playerClass;
  const isLocked = locked || isClassLocked;
  const reason = isClassLocked ? `${classOnly} 전용` : lockReason;

  return (
    <div className="w-full">
      <button
        onClick={!isLocked && !disabled ? onClick : undefined}
        disabled={disabled}
        className="w-full text-left font-pixel"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '14px',
          padding: '14px 18px',
          background: isLocked ? '#130e20' : '#2a1850',
          color: isLocked ? '#3a2860' : '#e8d8b8',
          border: `3px solid ${isLocked ? '#2a1850' : '#6b4fa0'}`,
          borderTop: `3px solid ${isLocked ? '#2a1850' : '#8b6fc0'}`,
          boxShadow: isLocked ? 'none' : '0 3px 0 #0a0420',
          cursor: isLocked ? 'not-allowed' : 'pointer',
          imageRendering: 'pixelated',
          letterSpacing: '0.3px',
          lineHeight: '1.8',
          transition: 'background 0.05s',
        }}
        onMouseEnter={e => { if (!isLocked) (e.currentTarget as HTMLButtonElement).style.background = '#3a2860'; }}
        onMouseLeave={e => { if (!isLocked) (e.currentTarget as HTMLButtonElement).style.background = '#2a1850'; }}
        onMouseDown={e => { if (!isLocked) { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = '0 1px 0 #0a0420'; } }}
        onMouseUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = isLocked ? 'none' : '0 3px 0 #0a0420'; }}
      >
        <span className="mr-2">{isLocked ? '🔒' : (icon ?? '▶')}</span>
        {text}
      </button>
      {/* 잠금 이유 — 항상 표시 */}
      {isLocked && reason && (
        <div className="font-pixel mt-1 px-2 py-1" style={{ fontSize: '11px', color: '#f0c040', background: '#1a0f2e', border: '1px solid #3a2060' }}>
          ⚠ {reason}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// TypewriterText
// ─────────────────────────────────────────────
interface TypewriterProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export function TypewriterText({ text, speed = 30, className = '', onComplete }: TypewriterProps) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <p className={`font-pixel ${className}`} style={{ fontSize: '16px', lineHeight: '2.2', color: '#e8d8b8', whiteSpace: 'pre-line' }}>
      {displayed}
      {!done && <span style={{ animation: 'blink 1s step-end infinite' }}>_</span>}
    </p>
  );
}
