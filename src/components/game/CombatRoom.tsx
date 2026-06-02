import { useState, useEffect, useRef, useCallback } from 'react';
import { localInitCombat, localResolveTurn } from '@/lib/combatEngine';
import type { LocalInitResult, LocalTurnResult } from '@/lib/combatEngine';
import {
  PixelPanel,
  PixelButton,
  PixelBar,
  PixelDivider,
  TypewriterText,
} from '@/components/game/UIFrame';
import Sprite from './Sprite';
import { MONSTER_SPRITES, type SpriteKey } from '@/constants/spriteMap';
import type {
  CombatState,
  PlayerAction,
  PlayerActionType,
  PlayerBuff,
  EnemyTier,
} from '@/types/combat';

// ─── FloatingDamage ───────────────────────────
interface FloatText {
  id: number;
  text: string;
  color: string;
  fontSize: string;
  x: number;
  y: number;
}

function FloatingDamageLayer({ texts }: { texts: FloatText[] }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none', zIndex: 50 }}>
      {texts.map((ft) => (
        <div
          key={ft.id}
          className="float-damage font-pixel"
          style={{ left: `${ft.x}%`, top: `${ft.y}%`, color: ft.color, fontSize: ft.fontSize }}
        >
          {ft.text}
        </div>
      ))}
    </div>
  );
}

// ─── Props ────────────────────────────────────
interface CombatRoomProps {
  depth: number;
  characterClass: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  gold: number;
  skills: Record<string, number>;
  relics: string[];
  onVictory: (
    goldReward: number,
    relic: { name: string; effect: string; isCursed: boolean } | null,
    isEliteOrBoss: boolean,
  ) => void;
  onDefeat: (deathCause: string) => void;
  onFled: () => void;
  onNegotiated: () => void;
  onHpChange: (delta: number) => void;
  fleeGuaranteed?: boolean;
  onConsumeFleeEffect?: () => void;
  onEnemyInitialized?: (tier: EnemyTier, enemyId: string) => void;
  forceEnemyId?: string;
}

// ─── 로딩 점 애니메이션 ────────────────────────
function LoadingDots() {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const timer = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);
    return () => clearInterval(timer);
  }, []);
  return <span className="font-pixel" style={{ color: '#9878c0', fontSize: '13px' }}>{dots}</span>;
}

// ─── 스프라이트 키 결정 ───────────────────────
function getEnemySpriteKey(enemyId: string, tier: EnemyTier): SpriteKey {
  const key = MONSTER_SPRITES[enemyId];
  if (key) return key;
  // fallback
  if (tier === 'boss')  return 'monster_cyclops';
  if (tier === 'elite') return 'monster_scorpion';
  return 'monster_bat';
}

// ─── 티어 배지 색상 ───────────────────────────
function getTierBadgeStyle(tier: EnemyTier): React.CSSProperties {
  if (tier === 'boss') return { background: '#3a0e0e', border: '2px solid #c03030', color: '#ff6060' };
  if (tier === 'elite') return { background: '#1a0f2e', border: '2px solid #c06010', color: '#f0a030' };
  return { background: '#0e1a0e', border: '2px solid #207040', color: '#60c080' };
}

function getTierLabel(tier: EnemyTier): string {
  if (tier === 'boss') return '👑 BOSS';
  if (tier === 'elite') return '⭐ ELITE';
  return '일반';
}

// ─── Component ────────────────────────────────
export default function CombatRoom({
  depth,
  characterClass: _characterClass,
  hp,
  maxHp,
  atk,
  def,
  gold: _gold,
  skills,
  relics: _relics,
  onVictory,
  onDefeat,
  onFled,
  onNegotiated,
  onHpChange,
  fleeGuaranteed = false,
  onConsumeFleeEffect,
  onEnemyInitialized,
  forceEnemyId,
}: CombatRoomProps) {
  const [state, setState] = useState<CombatState>({
    enemy: null,
    phase: 'init',
    currentTurn: 0,
    maxTurns: 3,
    turnHistory: [],
    isPlayerDefeated: false,
    defeatCause: null,
    rewardGold: 0,
    rewardRelic: null,
    fleeAttempted: false,
    negotiateAttempted: false,
    playerBuffs: [],
  });

  const [playerBuffs, setPlayerBuffs] = useState<PlayerBuff[]>([]);

  // 전투 로그
  const [combatLog, setCombatLog] = useState<{ turn: number; text: string; type?: 'player-damage' | 'enemy-damage' | 'player-heal' | 'info' }[]>([]);
  const [initError, setInitError] = useState<string | null>(null);

  // ─── 이펙트 state ────────────────────────────
  const [screenShake, setScreenShake] = useState(false);
  const [enemyAnim, setEnemyAnim] = useState<string>('idle');
  const [floatTexts, setFloatTexts] = useState<FloatText[]>([]);
  const [victoryClass, setVictoryClass] = useState<string>('');

  const floatIdRef = useRef(0);
  const logEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  function spawnFloat(text: string, color: string, fontSize: string, isEnemy: boolean) {
    const id = ++floatIdRef.current;
    const x = isEnemy ? 10 + Math.random() * 25 : 60 + Math.random() * 20;
    const y = isEnemy ? 15 + Math.random() * 15 : 45 + Math.random() * 15;
    setFloatTexts(prev => [...prev, { id, text, color, fontSize, x, y }]);
    setTimeout(() => setFloatTexts(prev => prev.filter(t => t.id !== id)), 1100);
  }

  // 스크롤 맨 아래로
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [combatLog]);

  // ─── 마운트 시 전투 초기화 ─────────────────────
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    initializeCombat();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── 보스 등장 연출 ──────────────────────────
  useEffect(() => {
    if (state.enemy?.tier === 'boss' && state.phase === 'player_turn' && state.currentTurn === 0) {
      setEnemyAnim('boss-enter');
      const t = setTimeout(() => setEnemyAnim('idle'), 700);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.enemy?.tier, state.phase]);

  function initializeCombat() {
    try {
      const res: LocalInitResult = localInitCombat(depth, forceEnemyId);

      setState((prev) => ({
        ...prev,
        enemy: {
          ...res.enemy,
          statusEffects: res.enemy.statusEffects ?? [],
        },
        phase: 'player_turn',
        maxTurns: res.maxTurns,
        rewardGold: res.rewardGold,
      }));

      onEnemyInitialized?.(res.enemy.tier, res.enemy.id);
      setCombatLog([{ turn: 0, text: res.openingNarrative }]);
    } catch (err) {
      setInitError(err instanceof Error ? err.message : '전투 초기화 실패');
    }
  }

  // ─── buildActions ─────────────────────────────
  const buildActions = useCallback((): PlayerAction[] => {
    const { fleeAttempted, negotiateAttempted, currentTurn } = state;

    const actions: PlayerAction[] = [
      {
        type: 'attack',
        label: '공격',
        icon: '⚔️',
        description: '적에게 기본 공격을 가한다',
      },
      {
        type: 'defend',
        label: '방어',
        icon: '🛡️',
        description: '이번 턴 피해를 반으로 줄인다',
      },
      {
        type: 'taunt',
        label: '도발',
        icon: '😤',
        description: '적을 격노시키고 반격 준비 버프를 얻는다 (다음 공격 2배)',
      },
      {
        type: 'bluff',
        label: '허세',
        icon: '🎭',
        description: '허세로 적을 위축시키고 공격력을 높인다',
      },
    ];

    // read: intelligence >= 2
    const hasRead = (skills.intelligence ?? 0) >= 2;
    actions.push({
      type: 'read',
      label: '정보 읽기',
      icon: '🧠',
      description: '적 약점 파악 (다음 공격 강화, 지능 3+: 적 약화)',
      requiredSkill: { type: 'intelligence', level: 2 },
      disabled: !hasRead,
      disableReason: hasRead ? undefined : '지능 Lv.2 필요',
    });

    // flee: stealth >= 1, fleeAttempted면 disabled
    const hasFlee = (skills.stealth ?? 0) >= 1;
    const fleeDisabled = !hasFlee || fleeAttempted;
    actions.push({
      type: 'flee',
      label: '도주',
      icon: '🏃',
      description: '전투에서 도망친다',
      requiredSkill: { type: 'stealth', level: 1 },
      disabled: fleeDisabled,
      disableReason: fleeAttempted
        ? '이미 시도함'
        : !hasFlee
          ? '은신 Lv.1 필요'
          : undefined,
    });

    // skill_attack: strength >= 2 또는 arcane >= 2
    const hasSkillAtk = (skills.strength ?? 0) >= 2 || (skills.arcane ?? 0) >= 2;
    actions.push({
      type: 'skill_attack',
      label: '스킬 공격',
      icon: '✨',
      description: '특수 기술로 강력한 피해를 준다',
      disabled: !hasSkillAtk,
      disableReason: hasSkillAtk ? undefined : '완력/마법감지 Lv.2 필요',
    });

    // negotiate: negotiation >= 3 AND currentTurn >= 3, negotiateAttempted면 disabled
    const hasNegSkill = (skills.negotiation ?? 0) >= 3;
    const hasTurnReq = currentTurn >= 3;
    const negDisabled = !hasNegSkill || !hasTurnReq || negotiateAttempted;
    let negReason: string | undefined;
    if (negotiateAttempted) {
      negReason = undefined;
    } else if (!hasNegSkill && !hasTurnReq) {
      negReason = '협상 Lv.3 & 3턴 이후 필요';
    } else if (!hasNegSkill) {
      negReason = '협상 Lv.3 필요';
    } else if (!hasTurnReq) {
      negReason = `${3 - currentTurn}턴 후 사용 가능`;
    }
    actions.push({
      type: 'negotiate',
      label: '협상',
      icon: '🗣️',
      description: '적과 협상해 전투를 종결한다',
      requiredSkill: { type: 'negotiation', level: 3 },
      disabled: negDisabled,
      disableReason: negReason,
    });

    return actions;
  }, [state, skills]);

  // ─── handleAction ─────────────────────────────
  function handleAction(action: PlayerAction) {
    if (!state.enemy || state.phase !== 'player_turn') return;
    if (action.disabled) return;

    // 도망 보장 효과 즉시 발동
    if (action.type === 'flee' && fleeGuaranteed) {
      onConsumeFleeEffect?.();
      setCombatLog((prev) => [
        ...prev,
        { turn: state.currentTurn + 1, text: '⚡ 계약의 힘으로 완벽하게 도망쳤다! (도망 보장 소모)' },
      ]);
      setState((prev) => ({ ...prev, phase: 'fled' }));
      setTimeout(() => onFled(), 1000);
      return;
    }

    // flee / negotiate 시도 기록
    const newFleeAttempted =
      action.type === 'flee' ? true : state.fleeAttempted;
    const newNegAttempted =
      action.type === 'negotiate' ? true : state.negotiateAttempted;

    setState((prev) => ({
      ...prev,
      phase: 'resolving',
      fleeAttempted: newFleeAttempted,
      negotiateAttempted: newNegAttempted,
    }));

    const nextTurn = state.currentTurn + 1;
    const isLastTurn = nextTurn >= state.maxTurns;

    try {
      const res: LocalTurnResult = localResolveTurn({
        playerAction: action.type,
        enemy: {
          name: state.enemy.name,
          hp: state.enemy.hp,
          maxHp: state.enemy.maxHp,
          atk: state.enemy.atk,
          def: state.enemy.def,
          trait: state.enemy.trait,
          tier: state.enemy.tier,
          statusEffects: state.enemy.statusEffects,
        },
        playerStats: {
          hp,
          maxHp,
          atk,
          def,
          skills,
        },
        playerBuffs,
        turn: nextTurn,
        maxTurns: state.maxTurns,
        isLastTurn,
      });

      // 적 상태 업데이트
      const updatedEnemy = { ...state.enemy };

      // HP 업데이트 (최소 0)
      updatedEnemy.hp = Math.max(0, updatedEnemy.hp + res.enemyHpChange);

      // 상태이상 업데이트: turnsRemaining 감소, 0이면 제거, 새 상태 추가
      let updatedEffects = updatedEnemy.statusEffects
        .map((e) => ({ ...e, turnsRemaining: e.turnsRemaining - 1 }))
        .filter((e) => e.turnsRemaining > 0);

      if (res.statusApplied) {
        // 같은 타입이 이미 있으면 교체, 없으면 추가
        updatedEffects = updatedEffects.filter(
          (e) => e.type !== res.statusApplied!.type,
        );
        updatedEffects.push(res.statusApplied);
      }
      updatedEnemy.statusEffects = updatedEffects;

      // 로그 추가
      const turnRecord = {
        turn: nextTurn,
        playerAction: action.type as PlayerActionType,
        narrative: res.narrative,
        hpChange: res.hpChange,
        enemyHpChange: res.enemyHpChange,
        specialEffect: res.specialEffect ?? undefined,
        statusApplied: res.statusApplied ?? undefined,
      };

      // ─── 이펙트 처리 ─────────────────────────
      const dmg = Math.abs(res.enemyHpChange);
      const isCritical = res.enemyHpChange < 0 && state.enemy != null && Math.abs(res.enemyHpChange) >= state.enemy.atk * 1.8;

      // 적 피격
      if (res.enemyHpChange < 0) {
        if (isCritical) {
          setEnemyAnim('hit-critical');
          setTimeout(() => setEnemyAnim('idle'), 500);
        } else {
          setEnemyAnim('hit-blue');
          setTimeout(() => setEnemyAnim('idle'), 500);
        }
        spawnFloat(
          isCritical ? '★' + dmg + '★' : '-' + dmg,
          isCritical ? '#f0c040' : '#ff5050',
          isCritical ? '16px' : '13px',
          true,
        );
      }

      // 플레이어 피격
      if (res.hpChange < 0) {
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 350);
        setEnemyAnim('combat');
        setTimeout(() => {
          setEnemyAnim('idle');
        }, 500);
        spawnFloat('-' + Math.abs(res.hpChange), '#a0a0ff', '12px', false);
      }

      // 플레이어 회복
      if (res.hpChange > 0) {
        spawnFloat('+' + res.hpChange, '#50e080', '12px', false);
      }

      // 로그 type 분류
      const logType: 'player-damage' | 'enemy-damage' | 'player-heal' | 'info' =
        res.hpChange < 0 ? 'player-damage' :
        res.enemyHpChange < 0 ? 'enemy-damage' :
        res.hpChange > 0 ? 'player-heal' :
        'info';

      setCombatLog((prev) => [...prev, { turn: nextTurn, text: res.narrative, type: logType }]);

      setState((prev) => ({
        ...prev,
        enemy: updatedEnemy,
        phase: 'turn_result',
        currentTurn: nextTurn,
        turnHistory: [...prev.turnHistory, turnRecord],
      }));

      // 플레이어 HP 변화를 전역 상태에 즉시 반영
      if (res.hpChange !== 0) {
        onHpChange(res.hpChange);
      }

      // 플레이어 버프 업데이트
      setPlayerBuffs(prev => {
        let updated = prev
          .filter(b => !res.consumePlayerBuffTypes.includes(b.type))
          .map(b => ({ ...b, turnsRemaining: b.turnsRemaining - 1 }))
          .filter(b => b.turnsRemaining > 0);
        if (res.playerBuffApplied) {
          updated = updated.filter(b => b.type !== res.playerBuffApplied!.type);
          updated.push(res.playerBuffApplied);
        }
        return updated;
      });

      // ─── 결과 판정 ─────────────────────────────
      // 협상 성공
      if (
        res.isCombatOver &&
        (res.specialEffect === 'negotiate_success' ||
          action.type === 'negotiate')
      ) {
        setCombatLog((prev) => [
          ...prev,
          { turn: nextTurn, text: '협상이 성공했다! 적이 물러선다.' },
        ]);
        setState((prev) => ({ ...prev, phase: 'negotiated' }));
        setTimeout(() => onNegotiated(), 1000);
        return;
      }

      // 도주 성공
      if (res.specialEffect === 'flee_success') {
        setCombatLog((prev) => [
          ...prev,
          { turn: nextTurn, text: '재빠르게 도망쳤다!' },
        ]);
        setState((prev) => ({ ...prev, phase: 'fled' }));
        setTimeout(() => onFled(), 1000);
        return;
      }

      // 플레이어 패배
      if (res.isPlayerDefeated) {
        setCombatLog((prev) => [
          ...prev,
          { turn: nextTurn, text: res.deathCause ?? '전투에서 쓰러졌다...', type: 'player-damage' as const },
        ]);
        setState((prev) => ({
          ...prev,
          phase: 'defeat',
          isPlayerDefeated: true,
          defeatCause: res.deathCause,
        }));
        setVictoryClass('combat-defeat');
        setTimeout(() => onDefeat(res.deathCause ?? '알 수 없는 이유로 쓰러졌다'), 800);
        return;
      }

      // 적 처치
      if (updatedEnemy.hp <= 0) {
        setCombatLog((prev) => [
          ...prev,
          {
            turn: nextTurn,
            text: `${updatedEnemy.name}을(를) 쓰러뜨렸다! 골드 ${state.rewardGold}G 획득!`,
            type: 'info' as const,
          },
        ]);
        setState((prev) => ({ ...prev, phase: 'victory' }));
        setVictoryClass('combat-victory');
        const isEliteOrBoss =
          updatedEnemy.tier === 'elite' || updatedEnemy.tier === 'boss';
        setTimeout(
          () => onVictory(state.rewardGold, state.rewardRelic, isEliteOrBoss),
          1000,
        );
        return;
      }

      // 다음 턴으로
      setTimeout(() => {
        setState((prev) => ({ ...prev, phase: 'player_turn' }));
      }, 1500);
    } catch (err) {
      // 오류 시 플레이어 턴으로 복구
      setCombatLog((prev) => [
        ...prev,
        {
          turn: nextTurn,
          text: `[오류] ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
        },
      ]);
      setState((prev) => ({
        ...prev,
        phase: 'player_turn',
        fleeAttempted: prev.fleeAttempted,
        negotiateAttempted: prev.negotiateAttempted,
      }));
    }
  }

  // ─── 상태이상 배지 색 ─────────────────────────
  function getStatusBadgeStyle(type: string): React.CSSProperties {
    const map: Record<string, React.CSSProperties> = {
      enraged:  { background: '#3a0e0e', border: '2px solid #c03030', color: '#ff6060' },
      cowered:  { background: '#0e1040', border: '2px solid #3060c0', color: '#6090ff' },
      weakened: { background: '#1a1a1a', border: '2px solid #606060', color: '#b0b0b0' },
      confused: { background: '#2a0e2a', border: '2px solid #9030a0', color: '#d060e0' },
    };
    return map[type] ?? {};
  }

  function getStatusLabel(type: string): string {
    const map: Record<string, string> = {
      enraged: '격노',
      cowered: '위축',
      weakened: '약화',
      confused: '혼란',
    };
    return map[type] ?? type;
  }

  const actions = buildActions();

  // ─── 렌더링 ───────────────────────────────────
  const rootClass = ['flex flex-col gap-4 w-full', screenShake ? 'screen-shake' : '', victoryClass].filter(Boolean).join(' ');

  return (
    <div className={rootClass}>

      {/* 초기화 오류 */}
      {initError && (
        <PixelPanel variant="dark" className="p-4">
          <p className="font-pixel mb-3" style={{ fontSize: '13px', color: '#ff6060' }}>
            ⚠ 전투 초기화 실패: {initError}
          </p>
          <PixelButton variant="secondary" size="sm" onClick={() => onFled()}>
            도망가기
          </PixelButton>
        </PixelPanel>
      )}

      {/* 초기화 중 */}
      {state.phase === 'init' && !initError && (
        <PixelPanel variant="dark" className="p-6 flex items-center justify-center">
          <p className="font-pixel" style={{ fontSize: '13px', color: '#9878c0' }}>
            적이 나타나고 있다<LoadingDots />
          </p>
        </PixelPanel>
      )}

      {/* 적 정보 패널 */}
      {state.enemy && (
        <PixelPanel variant="dark" className="p-4" style={{ position: 'relative' }}>
          <FloatingDamageLayer texts={floatTexts} />
          {/* 티어 배지 */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className="font-pixel px-2 py-1"
              style={{ fontSize: '11px', ...getTierBadgeStyle(state.enemy.tier) }}
            >
              {getTierLabel(state.enemy.tier)}
            </span>
          </div>

          {/* 적 이름 + 스프라이트 */}
          <div className="flex items-center gap-4 mb-3">
            <Sprite
              spriteKey={getEnemySpriteKey(state.enemy.id ?? '', state.enemy.tier)}
              scale={5}
              animation={enemyAnim as any}
              flip
            />
            <div className="flex-1 min-w-0">
              <p className="font-pixel mb-1" style={{ fontSize: '14px', color: '#f0c040' }}>
                {state.enemy.name}
              </p>
              <p className="font-pixel" style={{ fontSize: '11px', color: '#9878c0', lineHeight: '1.8' }}>
                {state.enemy.description}
              </p>
            </div>
          </div>

          {/* HP 바 */}
          <PixelBar
            value={state.enemy.hp}
            max={state.enemy.maxHp}
            variant="hp"
            label="HP"
            className="mb-2"
          />

          {/* 상태이상 뱃지 */}
          {state.enemy.statusEffects.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {state.enemy.statusEffects.map((effect, idx) => (
                <span
                  key={idx}
                  className="font-pixel px-2 py-1"
                  style={{ fontSize: '11px', ...getStatusBadgeStyle(effect.type) }}
                >
                  {getStatusLabel(effect.type)} ({effect.turnsRemaining}턴)
                </span>
              ))}
            </div>
          )}

          {/* 플레이어 버프 */}
          {playerBuffs.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {playerBuffs.map((buff) => (
                <span key={buff.type} className="font-pixel px-2 py-1" style={{
                  fontSize: '11px',
                  background: '#0e1a0e', border: '2px solid #40c080', color: '#60c0a0'
                }}>
                  {buff.icon} {buff.label} {buff.turnsRemaining > 0 ? `(${buff.turnsRemaining}턴)` : '(즉시 소모)'}
                </span>
              ))}
            </div>
          )}
        </PixelPanel>
      )}

      {/* 전투 로그 */}
      {combatLog.length > 0 && (
        <PixelPanel variant="inset" className="p-3">
          <div
            style={{
              maxHeight: '200px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {combatLog.map((log, idx) => {
              const isRecent = idx >= combatLog.length - 3;
              const borderStyle: React.CSSProperties =
                log.type === 'player-damage' ? { borderLeft: '3px solid #e0505080', paddingLeft: '6px' } :
                log.type === 'enemy-damage'  ? { borderLeft: '3px solid #5080e080', paddingLeft: '6px' } :
                log.type === 'player-heal'   ? { borderLeft: '3px solid #40c06080', paddingLeft: '6px' } :
                {};
              return (
                <div key={idx} className="font-pixel" style={{ fontSize: '12px', lineHeight: '2', ...borderStyle }}>
                  {log.turn > 0 && (
                    <span style={{ color: '#6b4fa0', marginRight: '6px' }}>
                      [{log.turn}턴]
                    </span>
                  )}
                  {isRecent ? (
                    <TypewriterText
                      text={log.text}
                      speed={20}
                      className="inline"
                    />
                  ) : (
                    <span style={{ color: '#c8b8e8', whiteSpace: 'pre-line' }}>
                      {log.text}
                    </span>
                  )}
                </div>
              );
            })}
            <div ref={logEndRef} />
          </div>
        </PixelPanel>
      )}

      {/* ─── 결과 표시 ─── */}
      {state.phase === 'resolving' && (
        <PixelPanel variant="dark" className="p-4 flex items-center gap-3">
          <p className="font-pixel" style={{ fontSize: '13px', color: '#9878c0' }}>
            판정 중<LoadingDots />
          </p>
        </PixelPanel>
      )}

      {state.phase === 'victory' && (
        <PixelPanel variant="dark" className="p-4">
          <p className="font-pixel mb-2" style={{ fontSize: '14px', color: '#60c080' }}>
            ✨ 전투 승리!
          </p>
          <p className="font-pixel" style={{ fontSize: '12px', color: '#f0c040' }}>
            💰 {state.rewardGold}G 획득
          </p>
          {state.rewardRelic && (
            <p className="font-pixel mt-1" style={{ fontSize: '12px', color: '#c0a0ff' }}>
              🔮 {state.rewardRelic.name} 획득
            </p>
          )}
        </PixelPanel>
      )}

      {state.phase === 'defeat' && (
        <PixelPanel variant="dark" className="p-4">
          <p className="font-pixel mb-2" style={{ fontSize: '14px', color: '#ff4040' }}>
            💀 전투에서 쓰러졌다...
          </p>
          {state.defeatCause && (
            <p className="font-pixel" style={{ fontSize: '12px', color: '#c87070' }}>
              {state.defeatCause}
            </p>
          )}
        </PixelPanel>
      )}

      {state.phase === 'fled' && (
        <PixelPanel variant="dark" className="p-4">
          <p className="font-pixel" style={{ fontSize: '14px', color: '#60c0d0' }}>
            🏃 성공적으로 도망쳤다!
          </p>
        </PixelPanel>
      )}

      {state.phase === 'negotiated' && (
        <PixelPanel variant="dark" className="p-4">
          <p className="font-pixel" style={{ fontSize: '14px', color: '#d0a060' }}>
            🗣️ 협상이 성공했다. 적이 물러선다.
          </p>
        </PixelPanel>
      )}

      {/* ─── 행동 선택 ─── */}
      {state.phase === 'player_turn' && state.enemy && (
        <PixelPanel variant="dark" className="p-4">
          <PixelDivider label={`턴 ${state.currentTurn + 1} / ${state.maxTurns}`} className="mb-4" />
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}
          >
            {actions.map((action) => (
              <div key={action.type} className="flex flex-col gap-1">
                <button
                  onClick={
                    action.disabled
                      ? undefined
                      : () => handleAction(action)
                  }
                  disabled={action.disabled}
                  className="w-full text-left font-pixel"
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '12px',
                    padding: '10px 12px',
                    background: action.disabled ? '#130e20' : '#2a1850',
                    color: action.disabled ? '#3a2860' : '#e8d8b8',
                    border: `3px solid ${action.disabled ? '#2a1850' : '#6b4fa0'}`,
                    borderTop: `3px solid ${action.disabled ? '#2a1850' : '#8b6fc0'}`,
                    boxShadow: action.disabled ? 'none' : '0 3px 0 #0a0420',
                    cursor: action.disabled ? 'not-allowed' : 'pointer',
                    imageRendering: 'pixelated',
                    lineHeight: '1.8',
                    transition: 'background 0.05s',
                  }}
                  onMouseEnter={(e) => {
                    if (!action.disabled)
                      (e.currentTarget as HTMLButtonElement).style.background = '#3a2860';
                  }}
                  onMouseLeave={(e) => {
                    if (!action.disabled)
                      (e.currentTarget as HTMLButtonElement).style.background = '#2a1850';
                  }}
                  onMouseDown={(e) => {
                    if (!action.disabled) {
                      e.currentTarget.style.transform = 'translateY(2px)';
                      e.currentTarget.style.boxShadow = '0 1px 0 #0a0420';
                    }
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = action.disabled
                      ? 'none'
                      : '0 3px 0 #0a0420';
                  }}
                >
                  <span className="mr-2">{action.icon}</span>
                  {action.label}
                </button>
                {action.disabled && action.disableReason && (
                  <div
                    className="font-pixel px-2 py-1"
                    style={{
                      fontSize: '10px',
                      color: '#f0c040',
                      background: '#1a0f2e',
                      border: '1px solid #3a2060',
                    }}
                  >
                    ⚠ {action.disableReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        </PixelPanel>
      )}

      {/* 판정 중 버튼 비활성 안내 */}
      {state.phase === 'resolving' && state.enemy && (
        <PixelPanel variant="dark" className="p-4">
          <PixelDivider label={`턴 ${state.currentTurn + 1} / ${state.maxTurns}`} className="mb-4" />
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}
          >
            {actions.map((action) => (
              <button
                key={action.type}
                disabled
                className="w-full text-left font-pixel"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '12px',
                  padding: '10px 12px',
                  background: '#130e20',
                  color: '#3a2860',
                  border: '3px solid #2a1850',
                  cursor: 'not-allowed',
                  opacity: 0.5,
                  imageRendering: 'pixelated',
                  lineHeight: '1.8',
                }}
              >
                <span className="mr-2">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </PixelPanel>
      )}
    </div>
  );
}
