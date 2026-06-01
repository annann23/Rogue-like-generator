import { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameState, type RoomType } from '@/hooks/useGameState';
import { generateRoom, generateRoomResult, type RoomResponse, type RoomChoice, type RoomResultResponse } from '@/hooks/useClaude';
import { PixelHUD, PixelPanel, PixelButton, PixelDivider, PixelChoiceButton, TypewriterText } from '@/components/game/UIFrame';
import { SKILLS, type SkillType } from '@/constants/skills';
import NPCRoom from './NPCRoom';
import { NPC_TEMPLATES, type NPCTemplate } from '@/constants/npcs';
import Sprite from './Sprite';
import { ROOM_TYPE_SPRITES, CLASS_SPRITES } from '@/constants/spriteMap';
import DungeonBackground from './DungeonBackground';

// ─── Types ────────────────────────────────────
type GamePhase = 'loading' | 'npc' | 'choosing' | 'resolving' | 'result' | 'error';

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
};

const ROOM_TYPES: RoomType[] = ['combat', 'event', 'npc', 'shop', 'rest'];

function pickRoomType(depth: number): RoomType {
  const pool: RoomType[] =
    depth <= 3
      ? ['combat', 'combat', 'combat', 'event', 'npc', 'shop', 'rest']
      : ROOM_TYPES;
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

    if (roomType === 'npc') {
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

    try {
      const roomData = await entry.promise;
      if (!roomData) throw new Error('방 생성 실패');
      setRoom(roomData);
      setPhase('choosing');
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
        hp: run.hp,
        maxHp: run.maxHp,
        atk: run.atk,
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
        killPlayer(res.deathCause ?? '알 수 없는 이유');
        setScreen('death');
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
            npc={selectedNpcRef.current}
            relation={npcRelations[selectedNpcRef.current.id] ?? { familiarity: 0, meetCount: 0 }}
            onDone={handleNPCDone}
          />
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
