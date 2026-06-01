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

// ─── Types ────────────────────────────────────
type GamePhase = 'loading' | 'npc' | 'choosing' | 'resolving' | 'result' | 'error';

const ROOM_LABELS: Record<string, string> = {
  combat: '⚔️ 전투',
  event: '❓ 이벤트',
  npc: '🗣️ NPC',
  shop: '🏪 상점',
  rest: '🛌 휴식',
};

const ROOM_TYPES: RoomType[] = ['combat', 'event', 'npc', 'shop', 'rest'];

function pickRoomType(depth: number): RoomType {
  // depth 1~3: combat 가중치 높게 (combat 3번, 나머지 1번씩)
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
  const { run, setScreen, setDepth, setRoomType, applyHpChange, applyGoldChange, addRelic, killPlayer, incrementSkillUse, npcRelations, updateNPCRelation } =
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
        incrementSkillUse: s.incrementSkillUse,
        npcRelations: s.npcRelations,
        updateNPCRelation: s.updateNPCRelation,
      }))
    );

  const [phase, setPhase] = useState<GamePhase>('loading');
  const [room, setRoom] = useState<RoomResponse | null>(null);
  const [result, setResult] = useState<RoomResultResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // nextDepth를 ref로 관리 (setDepth 호출 전 run.depth는 업데이트 안 됨)
  const nextDepthRef = useRef<number>(run.depth + 1);
  const pickedRoomTypeRef = useRef<RoomType>(pickRoomType(run.depth + 1));
  const selectedNpcRef = useRef<NPCTemplate | null>(null);

  // 마운트 시 방 생성
  useEffect(() => {
    const nextDepth = nextDepthRef.current;
    const pickedRoomType = pickedRoomTypeRef.current;

    setDepth(nextDepth);
    setRoomType(pickedRoomType);
    startRoom(nextDepth, pickedRoomType);
  }, []); // eslint-disable-line

  async function startRoom(depth: number, roomType: RoomType) {
    setPhase('loading');
    setRoom(null);
    setResult(null);
    setErrorMsg('');

    if (roomType === 'npc') {
      // seed + depth 조합으로 고정된 NPC 선택
      const npcIdx = (parseInt(run.randomSeed, 36) + depth) % NPC_TEMPLATES.length;
      selectedNpcRef.current = NPC_TEMPLATES[npcIdx];
      setPhase('npc');
      return;
    }

    try {
      const surveyEffects =
        run.surveyResults.length > 0
          ? run.surveyResults
              .flatMap((r) => r.statChanges)
              .map((s) => `${s.stat} ${s.change > 0 ? '+' : ''}${s.change}`)
              .join(', ')
          : '없음';

      const roomData = await generateRoom({
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

      setRoom(roomData);
      setPhase('choosing');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '알 수 없는 오류');
      setPhase('error');
    }
  }

  async function handleChoiceClick(choice: RoomChoice) {
    if (!room) return;
    setPhase('resolving');

    // 스킬 요구사항 있으면 incrementSkillUse
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

      // 결과 적용
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

      // 사망 처리
      const willDie = res.isDead || run.hp + res.hpChange <= 0;
      if (willDie) {
        killPlayer(res.deathCause ?? '알 수 없는 이유');
        setScreen('death');
        return;
      }

      setResult(res);
      setPhase('result');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '알 수 없는 오류');
      setPhase('error');
    }
  }

  function handleNPCDone(familiarityDelta: number) {
    const npc = selectedNpcRef.current;
    if (npc) {
      const rel = npcRelations[npc.id] ?? { familiarity: 0, meetCount: 0 };
      const newFamiliarity = Math.max(0, Math.min(100, rel.familiarity + familiarityDelta));
      updateNPCRelation(npc.id, newFamiliarity, rel.meetCount + 1);
    }
    // result 없이 바로 next-room 버튼 표시
    setResult({ result: '', hpChange: 0, goldChange: 0, skillChange: null, newRelic: null, isDead: false, deathCause: null });
    setPhase('result');
  }

  function handleNextRoom() {
    const depth = nextDepthRef.current;

    if (depth >= 10) {
      setScreen('clear');
      return;
    }

    const nextDepth = depth + 1;
    const nextRoomType = pickRoomType(nextDepth);
    nextDepthRef.current = nextDepth;
    pickedRoomTypeRef.current = nextRoomType;

    setDepth(nextDepth);
    setRoomType(nextRoomType);
    startRoom(nextDepth, nextRoomType);
  }

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

  const currentDepth = nextDepthRef.current;
  const currentRoomType = pickedRoomTypeRef.current;

  return (
    <div className="flex flex-col w-full h-full min-h-screen" style={{ background: '#0a0612' }}>
      {/* HUD */}
      <PixelHUD
        hp={run.hp}
        maxHp={run.maxHp}
        gold={run.gold}
        atk={run.atk}
        def={run.def}
        depth={run.depth}
        skills={run.skills as unknown as Record<string, number>}
      />

      {/* 콘텐츠 영역 */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 max-w-2xl mx-auto w-full">
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

        {/* 방 설명 패널 */}
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

        {phase === 'error' && (
          <PixelPanel variant="dark" className="p-5">
            <p className="font-pixel mb-4" style={{ fontSize: '13px', color: '#e04040', lineHeight: 2 }}>
              오류: {errorMsg}
            </p>
            <PixelButton
              variant="danger"
              size="sm"
              onClick={() => startRoom(currentDepth, currentRoomType)}
            >
              재시도
            </PixelButton>
          </PixelPanel>
        )}

        {(phase === 'choosing' || phase === 'resolving' || phase === 'result') && room && (
          <PixelPanel variant="dark" className="p-5">
            <TypewriterText text={room.description} speed={25} />
          </PixelPanel>
        )}

        {/* 선택지 (choosing / resolving 페이즈) */}
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

        {/* 결과 (result 페이즈) */}
        {phase === 'result' && result && (
          <>
            {result.result !== '' && (
              <>
                <PixelDivider label="결과" />
                <PixelPanel variant="brown" className="p-5">
                  <TypewriterText text={result.result} speed={20} />

                  {/* 스탯 변화 배지 */}
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
