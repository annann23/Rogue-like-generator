import { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameState, type RoomType } from '@/hooks/useGameState';
import { generateRoom, generateRoomResult, generateGhostBattle, moderateLastWords, type RoomResponse, type RoomChoice, type RoomResultResponse, type GhostBattleResponse } from '@/hooks/useClaude';
import { PixelHUD, PixelPanel, PixelButton, PixelDivider, PixelChoiceButton, PixelInput, TypewriterText } from '@/components/game/UIFrame';
import { SKILLS, type SkillType } from '@/constants/skills';
import NPCRoom from './NPCRoom';
import { NPC_TEMPLATES, type NPCTemplate } from '@/constants/npcs';
import Sprite from './Sprite';
import { ROOM_TYPE_SPRITES, CLASS_SPRITES } from '@/constants/spriteMap';
import DungeonBackground from './DungeonBackground';
import { fetchGhosts, saveGhost, type Ghost } from '@/hooks/useGhosts';

// ─── Types ────────────────────────────────────
type GamePhase = 'loading' | 'npc' | 'ghost' | 'choosing' | 'resolving' | 'result' | 'dying' | 'error';

interface PrefetchEntry {
  roomType: RoomType;
  // NPC 방은 null, 일반 방은 RoomResponse promise
  promise: Promise<RoomResponse | null>;
}

// ─── Constants ────────────────────────────────
const ROOM_LABELS: Record<string, string> = {
  combat: '⚔️ 전투',
  event: '❓ 이벤트',
  npc: '🗣️ NPC',
  shop: '🏪 상점',
  rest: '🛌 휴식',
  ghost: '👻 유령 조우',
};

function pickRoomType(depth: number): RoomType {
  const pool: RoomType[] =
    depth <= 3
      ? ['combat', 'combat', 'combat', 'event', 'npc', 'shop', 'rest', 'ghost']
      : ['combat', 'combat', 'event', 'npc', 'shop', 'rest', 'ghost', 'ghost'];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── StatChangeBadge ──────────────────────────
interface StatChangeBadgeProps {
  label: string;
  value: number;
  positive?: boolean;
}

function StatChangeBadge({ label, value, positive }: StatChangeBadgeProps) {
  const isPositive = positive ?? value > 0;
  const color = value === 0 ? '#9878c0' : isPositive ? '#40c060' : '#e04040';
  const sign = value > 0 ? '+' : '';
  return (
    <span
      className="font-pixel inline-block px-2 py-1"
      style={{
        fontSize: '12px',
        color,
        background: '#120a1e',
        border: `2px solid ${color}`,
        marginRight: '6px',
        marginBottom: '4px',
      }}
    >
      {label} {sign}{value}
    </span>
  );
}

// ─── LoadingDots ──────────────────────────────
function LoadingDots() {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const timer = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 400);
    return () => clearInterval(timer);
  }, []);
  return (
    <span className="font-pixel" style={{ fontSize: '14px', color: '#9878c0' }}>
      {dots}
    </span>
  );
}

// ─── Main Component ───────────────────────────
export default function GameScreen() {
  const { run, setScreen, setDepth, setRoomType, applyHpChange, applyGoldChange, addRelic, killPlayer, clearRun, incrementSkillUse, npcRelations, updateNPCRelation } =
    useGameState(
      useShallow((s) => ({
        run: s.run,
        setScreen: s.setScreen,
        setDepth: s.setDepth,
        setRoomType: s.setRoomType,
        applyHpChange: s.applyHpChange,
        applyGoldChange: s.applyGoldChange,
        addRelic: s.addRelic,
        killPlayer: s.killPlayer,
        clearRun: s.clearRun,
        incrementSkillUse: s.incrementSkillUse,
        npcRelations: s.npcRelations,
        updateNPCRelation: s.updateNPCRelation,
      }))
    );

  const [phase, setPhase] = useState<GamePhase>('loading');
  const [room, setRoom] = useState<RoomResponse | null>(null);
  const [result, setResult] = useState<RoomResultResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [currentRoomType, setCurrentRoomType] = useState<RoomType>('combat');
  const [wallInscriptions, setWallInscriptions] = useState<Ghost[]>([]);
  const [ghostEncounter, setGhostEncounter] = useState<Ghost | null>(null);
  const [ghostBattling, setGhostBattling] = useState(false);
  const [ghostBattleResult, setGhostBattleResult] = useState<GhostBattleResponse | null>(null);
  const [lastWords, setLastWords] = useState('');
  const [pendingDeathCause, setPendingDeathCause] = useState<string | null>(null);
  const [moderating, setModerating] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);

  // 현재 진행 중인 depth를 ref로 관리 (Zustand 업데이트 비동기라 별도 추적)
  const currentDepthRef = useRef<number>(run.depth + 1);
  const selectedNpcRef = useRef<NPCTemplate | null>(null);

  // depth → PrefetchEntry: 미리 생성해둔 방 프로미스 캐시
  const prefetchCache = useRef<Map<number, PrefetchEntry>>(new Map());

  // ─── 프리페치 ────────────────────────────────
  // 현재 run 스냅샷으로 방 1개를 백그라운드에서 생성 예약
  function schedulePrefetch(depth: number) {
    if (depth < 1 || depth > 10 || prefetchCache.current.has(depth)) return;

    const roomType = pickRoomType(depth);

    if (roomType === 'npc' || roomType === 'ghost') {
      prefetchCache.current.set(depth, { roomType, promise: Promise.resolve(null) });
      return;
    }

    const surveyEffects =
      run.surveyResults.length > 0
        ? run.surveyResults
            .flatMap((r) => r.statChanges)
            .map((s) => `${s.stat} ${s.change > 0 ? '+' : ''}${s.change}`)
            .join(', ')
        : '없음';

    const promise = generateRoom({
      characterClass: run.characterClass ?? 'warrior',
      hp: run.hp,
      maxHp: run.maxHp,
      atk: run.atk,
      def: run.def,
      gold: run.gold,
      skills: run.skills as unknown as Record<string, number>,
      surveyEffects,
      relics: run.relics.map((r) => r.name),
      depth,
      roomType,
    });

    prefetchCache.current.set(depth, { roomType, promise });
  }

  // ─── 방 시작 ──────────────────────────────────
  // 캐시에서 꺼내거나, 없으면 즉시 생성
  async function startRoom(depth: number) {
    setPhase('loading');
    setRoom(null);
    setResult(null);
    setErrorMsg('');

    // 캐시에 없으면 지금 즉시 예약 (fallback)
    if (!prefetchCache.current.has(depth)) {
      schedulePrefetch(depth);
    }

    const entry = prefetchCache.current.get(depth)!;
    const { roomType } = entry;

    setCurrentRoomType(roomType);
    setDepth(depth);
    setRoomType(roomType);

    if (roomType === 'npc') {
      const npcIdx = (parseInt(run.randomSeed, 36) + depth) % NPC_TEMPLATES.length;
      selectedNpcRef.current = NPC_TEMPLATES[npcIdx];
      setPhase('npc');
      return;
    }

    if (roomType === 'ghost') {
      setGhostEncounter(null);
      setPhase('ghost');
      // 이 층 인접 유령 1명을 조우
      fetchGhosts(depth, 1).then((results) => {
        setGhostEncounter(results[0] ?? null);
      });
      return;
    }

    try {
      const roomData = await entry.promise;
      if (!roomData) throw new Error('방 생성 실패');
      setRoom(roomData);
      setPhase('choosing');
      // 벽 비문용 유령 백그라운드 fetch
      fetchGhosts(depth).then(setWallInscriptions);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '알 수 없는 오류');
      setPhase('error');
    }
  }

  // ─── 마운트 시 첫 3개 방 프리페치 ──────────────
  useEffect(() => {
    const d = currentDepthRef.current;
    schedulePrefetch(d);
    schedulePrefetch(d + 1);
    schedulePrefetch(d + 2);
    startRoom(d);
  }, []); // eslint-disable-line

  // ─── 선택지 클릭 ─────────────────────────────
  async function handleChoiceClick(choice: RoomChoice) {
    if (!room) return;
    setPhase('resolving');

    if (choice.requiredSkill) {
      incrementSkillUse(choice.requiredSkill.type as SkillType);
    }

    try {
      const res = await generateRoomResult({
        choice: choice.text,
        description: room.description,
        roomType: currentRoomType,
        depth: currentDepthRef.current,
        hp: run.hp,
        maxHp: run.maxHp,
        atk: run.atk,
        def: run.def,
        gold: run.gold,
        skills: run.skills as unknown as Record<string, number>,
      });

      applyHpChange(res.hpChange);
      applyGoldChange(res.goldChange);

      if (res.skillChange) {
        incrementSkillUse(res.skillChange.type as SkillType);
      }

      if (res.newRelic) {
        addRelic({
          name: res.newRelic.name,
          effect: res.newRelic.effect,
          isCursed: res.newRelic.isCursed,
          icon: '🗿',
        });
      }

      const willDie = res.isDead || run.hp + res.hpChange <= 0;
      if (willDie) {
        const cause = res.deathCause ?? '알 수 없는 이유';
        killPlayer(cause);
        setPendingDeathCause(cause);
        setLastWords('');
        setPhase('dying');
        return;
      }

      // 결과 보여주는 동안 다음 방 2개 프리페치
      const nextD = currentDepthRef.current + 1;
      schedulePrefetch(nextD);
      schedulePrefetch(nextD + 1);

      setResult(res);
      setPhase('result');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '알 수 없는 오류');
      setPhase('error');
    }
  }

  // ─── NPC 대화 종료 ───────────────────────────
  function handleNPCDone(familiarityDelta: number) {
    const npc = selectedNpcRef.current;
    if (npc) {
      const rel = npcRelations[npc.id] ?? { familiarity: 0, meetCount: 0 };
      const newFamiliarity = Math.max(0, Math.min(100, rel.familiarity + familiarityDelta));
      updateNPCRelation(npc.id, newFamiliarity, rel.meetCount + 1);
    }
    // 다음 방 프리페치
    const nextD = currentDepthRef.current + 1;
    schedulePrefetch(nextD);
    schedulePrefetch(nextD + 1);

    setResult({ result: '', hpChange: 0, goldChange: 0, skillChange: null, newRelic: null, isDead: false, deathCause: null });
    setPhase('result');
  }

  // ─── 유령과 전투 ──────────────────────────────
  async function handleGhostFight() {
    if (!ghostEncounter || ghostBattling) return;
    setGhostBattling(true);
    setGhostBattleResult(null);

    try {
      const res = await generateGhostBattle({
        characterClass: run.characterClass ?? 'warrior',
        hp: run.hp,
        maxHp: run.maxHp,
        atk: run.atk,
        arcane: (run.skills as unknown as Record<string, number>).arcane ?? 0,
        ghostLastWords: ghostEncounter.last_words,
      });

      setGhostBattleResult(res);

      if (!res.won) {
        const cause = res.deathCause ?? '유령에게 영혼을 빼앗겼다';
        killPlayer(cause);
        setPendingDeathCause(cause);
        setLastWords('');
        setPhase('dying');
      } else if (res.reward) {
        addRelic({
          name: res.reward.name,
          effect: res.reward.effect,
          isCursed: false,
          icon: res.reward.isPassive ? '✨' : '⚔️',
        });
      }
    } catch {
      setGhostBattleResult({
        won: false,
        narrative: '유령의 기운에 압도되어 쓰러졌다.',
        deathCause: '유령에게 영혼을 빼앗겼다',
        reward: null,
      });
    } finally {
      setGhostBattling(false);
    }
  }

  // ─── 유령 조우 종료 ───────────────────────────
  function handleGhostDismiss() {
    const nextD = currentDepthRef.current + 1;
    schedulePrefetch(nextD);
    schedulePrefetch(nextD + 1);
    setResult({ result: '', hpChange: 0, goldChange: 0, skillChange: null, newRelic: null, isDead: false, deathCause: null });
    setPhase('result');
  }

  // ─── 다음 방으로 ─────────────────────────────
  function handleNextRoom() {
    const current = currentDepthRef.current;

    if (current >= 10) {
      clearRun();
      setScreen('clear');
      return;
    }

    const next = current + 1;
    currentDepthRef.current = next;

    // 2~3개 앞 방 추가 프리페치
    schedulePrefetch(next + 1);
    schedulePrefetch(next + 2);

    startRoom(next);
  }

  // ─── 마지막 말 저장 후 사망 ─────────────────────
  async function handleSaveLastWords() {
    const trimmed = lastWords.trim();
    if (!trimmed) {
      setScreen('death');
      return;
    }

    setModerating(true);
    setModerationError(null);

    try {
      const { safe, reason } = await moderateLastWords(trimmed);
      if (!safe) {
        setModerationError(reason ?? '부적절한 내용이 포함되어 있다');
        setModerating(false);
        return;
      }
      await saveGhost({
        last_words: trimmed,
        death_cause: pendingDeathCause,
        character_class: run.characterClass ?? 'warrior',
        depth: currentDepthRef.current,
      });
    } catch {
      // 검수 실패 시 그냥 저장 허용
      await saveGhost({
        last_words: trimmed,
        death_cause: pendingDeathCause,
        character_class: run.characterClass ?? 'warrior',
        depth: currentDepthRef.current,
      });
    }

    setScreen('death');
  }

  function handleDie() {
    setScreen('death');
  }

  // ─── 재시도 ──────────────────────────────────
  function handleRetry() {
    // 실패한 캐시 제거 후 재시도
    prefetchCache.current.delete(currentDepthRef.current);
    startRoom(currentDepthRef.current);
  }

  // ─── 선택지 잠금 ─────────────────────────────
  function isChoiceLocked(choice: RoomChoice): { locked: boolean; lockReason?: string } {
    if (choice.requiredSkill) {
      const { type, level } = choice.requiredSkill;
      const skillValue = (run.skills as unknown as Record<string, number>)[type] ?? 0;
      if (skillValue < level) {
        const skillInfo = SKILLS.find((s) => s.id === type);
        const skillName = skillInfo?.name ?? type;
        return { locked: true, lockReason: `${skillName} ${level} 레벨 필요 (현재 ${skillValue})` };
      }
    }
    return { locked: false };
  }

  const currentDepth = currentDepthRef.current;

  return (
    <div className="flex flex-col w-full h-full min-h-screen" style={{ background: '#0a0612', position: 'relative' }}>
      <DungeonBackground seed={run.randomSeed} scale={2} opacity={0.22} />

      {/* HUD */}
      <PixelHUD
        hp={run.hp}
        maxHp={run.maxHp}
        gold={run.gold}
        atk={run.atk}
        def={run.def}
        depth={run.depth}
        skills={run.skills as unknown as Record<string, number>}
        className="relative"
      />

      {/* 콘텐츠 영역 */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 max-w-2xl mx-auto w-full" style={{ position: 'relative', zIndex: 1 }}>

        {/* 방 타입 배지 + 스프라이트 씬 + 층 표시 */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className="font-pixel px-3 py-1"
              style={{
                fontSize: '13px',
                color: '#f0c040',
                background: '#1a0f2e',
                border: '2px solid #6b4fa0',
              }}
            >
              {ROOM_LABELS[currentRoomType] ?? currentRoomType}
            </span>
          </div>
          {/* 플레이어 vs 방 스프라이트 */}
          <div className="flex items-center gap-4">
            <Sprite
              spriteKey={CLASS_SPRITES[run.characterClass ?? 'warrior']}
              scale={3}
              animation={phase === 'choosing' ? 'idle' : phase === 'resolving' ? 'combat' : 'none'}
            />
            {phase !== 'npc' && ROOM_TYPE_SPRITES[currentRoomType] && (
              <Sprite
                spriteKey={ROOM_TYPE_SPRITES[currentRoomType]}
                scale={3}
                animation={phase === 'choosing' ? 'float' : 'none'}
                flip
              />
            )}
          </div>
          <span className="font-pixel" style={{ fontSize: '12px', color: '#9878c0' }}>
            {currentDepth} / 10 층
          </span>
        </div>

        {/* NPC 방 페이즈 */}
        {phase === 'npc' && selectedNpcRef.current && (
          <NPCRoom
            key={`${selectedNpcRef.current.id}-${currentDepth}`}
            npc={selectedNpcRef.current}
            relation={npcRelations[selectedNpcRef.current.id] ?? { familiarity: 0, meetCount: 0 }}
            onDone={handleNPCDone}
          />
        )}

        {/* 유령 조우 */}
        {phase === 'ghost' && (
          <PixelPanel variant="dark" className="p-5">
            <div className="flex flex-col items-center gap-4">
              <Sprite
                spriteKey="ghost"
                scale={4}
                animation={ghostBattling ? 'combat' : 'float'}
              />

              {/* 유령 등장 / 마지막 말 */}
              {!ghostBattleResult && (
                ghostEncounter ? (
                  <>
                    <p className="font-pixel text-center" style={{ fontSize: '13px', color: '#9878c0', lineHeight: 2 }}>
                      어둠 속에서 희미한 형체가 나타났다.
                    </p>
                    <div
                      className="font-pixel px-4 py-3 w-full"
                      style={{
                        background: 'rgba(8,4,19,0.8)',
                        border: '2px solid #4a2d7a',
                        fontSize: '13px',
                        color: '#b8a8d8',
                        lineHeight: 2,
                        fontStyle: 'italic',
                        textAlign: 'center',
                      }}
                    >
                      &quot;{ghostEncounter.last_words}&quot;
                    </div>
                    <p className="font-pixel" style={{ fontSize: '11px', color: '#5a4a7a' }}>
                      — {ghostEncounter.character_class}, {ghostEncounter.depth}층에서 숨진 자
                    </p>
                  </>
                ) : (
                  <p className="font-pixel text-center" style={{ fontSize: '13px', color: '#6b4fa0', lineHeight: 2 }}>
                    희미한 기운이 느껴졌지만,<br />아무 말도 남기지 않은 영혼이었다.
                  </p>
                )
              )}

              {/* 전투 결과 서사 */}
              {ghostBattleResult && !ghostBattleResult.won && (
                <p className="font-pixel text-center" style={{ fontSize: '13px', color: '#e04040', lineHeight: 2 }}>
                  <TypewriterText text={ghostBattleResult.narrative} speed={20} />
                </p>
              )}
              {ghostBattleResult?.won && (
                <>
                  <p className="font-pixel text-center" style={{ fontSize: '13px', color: '#40c060', lineHeight: 2 }}>
                    <TypewriterText text={ghostBattleResult.narrative} speed={20} />
                  </p>
                  {ghostBattleResult.reward && (
                    <div
                      className="font-pixel px-4 py-3 w-full"
                      style={{
                        background: 'rgba(0,20,10,0.8)',
                        border: '2px solid #40c060',
                        fontSize: '12px',
                        color: '#80e0a0',
                        lineHeight: 2,
                        textAlign: 'center',
                      }}
                    >
                      {ghostBattleResult.reward.isPassive ? '✨' : '⚔️'} {ghostBattleResult.reward.name} 획득!
                      <br />
                      <span style={{ fontSize: '11px', color: '#609870' }}>{ghostBattleResult.reward.effect}</span>
                    </div>
                  )}
                </>
              )}

              {/* 전투 중 */}
              {ghostBattling && (
                <div className="flex items-center gap-2">
                  <p className="font-pixel" style={{ fontSize: '13px', color: '#9878c0' }}>유령과 사투 중</p>
                  <LoadingDots />
                </div>
              )}

              <PixelDivider className="w-full" />

              {/* 버튼 영역 */}
              {!ghostBattling && !ghostBattleResult && (
                <div className="flex gap-3 w-full justify-center">
                  <PixelButton variant="secondary" size="sm" onClick={handleGhostDismiss}>
                    지나친다
                  </PixelButton>
                  {ghostEncounter && (run.skills as unknown as Record<string, number>).arcane >= 2 && (
                    <PixelButton
                      variant="danger"
                      size="sm"
                      onClick={() => void handleGhostFight()}
                    >
                      ✨ 싸운다 (마법감지 {(run.skills as unknown as Record<string, number>).arcane})
                    </PixelButton>
                  )}
                </div>
              )}
              {!ghostBattling && ghostBattleResult?.won && (
                <PixelButton variant="secondary" size="sm" onClick={handleGhostDismiss}>
                  지나친다
                </PixelButton>
              )}
            </div>
          </PixelPanel>
        )}

        {/* 로딩 */}
        {phase === 'loading' && (
          <PixelPanel variant="dark" className="p-5">
            <div className="flex items-center gap-3">
              <p className="font-pixel" style={{ fontSize: '14px', color: '#9878c0' }}>
                던전이 준비된다
              </p>
              <LoadingDots />
            </div>
          </PixelPanel>
        )}

        {/* 오류 */}
        {phase === 'error' && (
          <PixelPanel variant="dark" className="p-5">
            <p className="font-pixel mb-4" style={{ fontSize: '13px', color: '#e04040', lineHeight: 2 }}>
              오류: {errorMsg}
            </p>
            <PixelButton variant="danger" size="sm" onClick={handleRetry}>
              재시도
            </PixelButton>
          </PixelPanel>
        )}

        {/* 방 설명 */}
        {(phase === 'choosing' || phase === 'resolving' || phase === 'result') && room && (
          <PixelPanel variant="dark" className="p-5">
            <TypewriterText text={room.description} speed={25} />
          </PixelPanel>
        )}

        {/* 벽 비문 — 이 층을 지나간 자들의 흔적 */}
        {phase === 'choosing' && wallInscriptions.length > 0 && (
          <div
            className="font-pixel px-4 py-3"
            style={{
              background: 'rgba(8, 4, 19, 0.7)',
              border: '2px solid #2a1a4a',
              borderTop: '3px solid #3a2a5a',
              borderBottom: '3px solid #3a2a5a',
            }}
          >
            <p style={{ fontSize: '10px', color: '#5a4a7a', marginBottom: '6px', letterSpacing: '2px' }}>
              ── 벽에 새겨진 흔적 ──
            </p>
            {wallInscriptions.map((g) => (
              <p
                key={g.id}
                style={{
                  fontSize: '11px',
                  color: '#7060a0',
                  lineHeight: 2,
                  fontStyle: 'italic',
                }}
              >
                &quot;{g.last_words}&quot;
                <span style={{ fontSize: '10px', color: '#4a3a6a', marginLeft: '6px' }}>
                  — {g.character_class}, {g.depth}층
                </span>
              </p>
            ))}
          </div>
        )}

        {/* 선택지 */}
        {(phase === 'choosing' || phase === 'resolving') && room && (
          <>
            <PixelDivider label="선택" />
            <div className="flex flex-col gap-3">
              {room.choices.map((choice, idx) => {
                const { locked, lockReason } = isChoiceLocked(choice);
                return (
                  <PixelChoiceButton
                    key={idx}
                    text={choice.text}
                    icon={choice.icon}
                    locked={locked || phase === 'resolving'}
                    lockReason={lockReason}
                    classOnly={choice.classOnly}
                    playerClass={run.characterClass ?? undefined}
                    onClick={() => handleChoiceClick(choice)}
                    disabled={phase === 'resolving'}
                  />
                );
              })}
            </div>

            {phase === 'resolving' && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <p className="font-pixel" style={{ fontSize: '13px', color: '#9878c0' }}>
                  결과 처리 중
                </p>
                <LoadingDots />
              </div>
            )}
          </>
        )}

        {/* 사망 - 마지막 말 입력 */}
        {phase === 'dying' && (
          <PixelPanel variant="dark" className="p-5">
            <p
              className="font-pixel mb-4"
              style={{ fontSize: '16px', color: '#e04040', lineHeight: 2 }}
            >
              ☠ 그대는 쓰러졌다
            </p>
            {pendingDeathCause && (
              <p
                className="font-pixel mb-4"
                style={{ fontSize: '13px', color: '#9878c0', lineHeight: 2 }}
              >
                사인: {pendingDeathCause}
              </p>
            )}
            <PixelDivider label="마지막 말" />
            <p
              className="font-pixel mb-3"
              style={{ fontSize: '12px', color: '#9878c0', lineHeight: 2 }}
            >
              후대의 모험가들에게 한마디를 남길 수 있다. (최대 80자)
            </p>
            <div className="flex gap-2 items-center mb-2">
              <PixelInput
                value={lastWords}
                onChange={(e) => {
                  setLastWords(e.target.value.slice(0, 80));
                  setModerationError(null);
                }}
                placeholder="마지막 말을 남겨라..."
                disabled={moderating}
                style={{ fontSize: '13px' }}
              />
            </div>
            {moderationError && (
              <p
                className="font-pixel mb-2"
                style={{ fontSize: '11px', color: '#e04040', lineHeight: 2 }}
              >
                ✕ {moderationError}
              </p>
            )}
            <p
              className="font-pixel mb-4"
              style={{ fontSize: '11px', color: '#6b4fa0', textAlign: 'right' }}
            >
              {lastWords.length} / 80
            </p>
            <div className="flex gap-3 justify-end">
              <PixelButton variant="secondary" size="sm" onClick={handleDie} disabled={moderating}>
                그냥 떠난다
              </PixelButton>
              <PixelButton
                variant="primary"
                size="sm"
                onClick={() => void handleSaveLastWords()}
                disabled={moderating}
              >
                {moderating ? '검수 중...' : '말을 남긴다'}
              </PixelButton>
            </div>
          </PixelPanel>
        )}

        {/* 결과 */}
        {phase === 'result' && result && (
          <>
            {result.result !== '' && (
              <>
                <PixelDivider label="결과" />
                <PixelPanel variant="brown" className="p-5">
                  <TypewriterText text={result.result} speed={20} />

                  <div className="mt-4 flex flex-wrap">
                    {result.hpChange !== 0 && (
                      <StatChangeBadge label="HP" value={result.hpChange} />
                    )}
                    {result.goldChange !== 0 && (
                      <StatChangeBadge label="골드" value={result.goldChange} />
                    )}
                    {result.skillChange && (
                      <StatChangeBadge
                        label={SKILLS.find((s) => s.id === result.skillChange?.type)?.name ?? result.skillChange.type}
                        value={result.skillChange.amount}
                        positive
                      />
                    )}
                    {result.newRelic && (
                      <span
                        className="font-pixel inline-block px-2 py-1"
                        style={{
                          fontSize: '12px',
                          color: '#f0c040',
                          background: '#1a1000',
                          border: '2px solid #f0c040',
                          marginRight: '6px',
                          marginBottom: '4px',
                        }}
                      >
                        🗿 {result.newRelic.name} 획득!
                      </span>
                    )}
                  </div>
                </PixelPanel>
              </>
            )}

            <div className="flex justify-end mt-2">
              <PixelButton variant="secondary" size="lg" onClick={handleNextRoom}>
                다음 방으로 ▶
              </PixelButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
