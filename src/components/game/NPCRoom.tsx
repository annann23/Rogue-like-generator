import { useState, useEffect, useRef } from 'react';
import { type NPCTemplate, type GiftItem, GIFT_ITEMS, getFamiliarityStage } from '@/constants/npcs';
import { generateNPCDialogue } from '@/hooks/useClaude';
import type { Relic } from '@/constants/relics';
import {
  PixelDialogFrame,
  PixelInput,
  PixelButton,
  PixelDivider,
  TypewriterText,
} from '@/components/game/UIFrame';
import Sprite from './Sprite';
import { NPC_SPRITES } from '@/constants/spriteMap';

// ─── Types ────────────────────────────────────
interface NPCRoomProps {
  npc: NPCTemplate;
  relation: { familiarity: number; meetCount: number; relicGiven?: boolean };
  gold: number;
  onGoldSpend: (amount: number) => void;
  onDone: (familiarityDelta: number) => void;
  onRelicGiven?: (relic: Relic) => void;
  personaAlignment?: string;
}

interface Message {
  role: 'npc' | 'player';
  text: string;
  isGift?: boolean;
}

// meetCount 기반 대화 횟수 (1-2회: 1턴, 3-4회: 2턴, 5-6회: 3턴, 7+회: 4턴)
function getMaxTurnsByMeetCount(meetCount: number): number {
  if (meetCount >= 7) return 4;
  if (meetCount >= 5) return 3;
  if (meetCount >= 3) return 2;
  return 1;
}

// ─── Gift Panel ────────────────────────────────
function GiftPanel({
  gold,
  onSelect,
  onClose,
}: {
  gold: number;
  onSelect: (gift: GiftItem) => void;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        background: '#0e0820',
        border: '3px solid #f0c040',
        padding: '12px',
        marginTop: '4px',
      }}
    >
      <div className="flex justify-between items-center mb-3">
        <p className="font-pixel" style={{ fontSize: '11px', color: '#f0c040' }}>
          🎁 선물 선택 (현재 골드: {gold}g)
        </p>
        <button
          className="font-pixel"
          style={{ fontSize: '10px', color: '#9878c0', cursor: 'pointer', background: 'none', border: 'none' }}
          onClick={onClose}
        >
          ✕ 닫기
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {GIFT_ITEMS.map((gift) => {
          const canAfford = gold >= gift.goldCost;
          return (
            <button
              key={gift.id}
              className="font-pixel"
              disabled={!canAfford}
              onClick={() => onSelect(gift)}
              style={{
                fontSize: '11px',
                padding: '6px 10px',
                background: canAfford ? '#1a0a04' : '#0a0a0a',
                color: canAfford ? '#e8d8b8' : '#4a3050',
                border: `2px solid ${canAfford ? '#7a5020' : '#2a1a2a'}`,
                cursor: canAfford ? 'pointer' : 'not-allowed',
              }}
              onMouseEnter={e => {
                if (canAfford) (e.currentTarget as HTMLElement).style.borderColor = '#f0c040';
              }}
              onMouseLeave={e => {
                if (canAfford) (e.currentTarget as HTMLElement).style.borderColor = '#7a5020';
              }}
            >
              {gift.emoji} {gift.name}
              <span style={{ color: canAfford ? '#f0c040' : '#4a3050', marginLeft: '6px' }}>
                -{gift.goldCost}g
              </span>
            </button>
          );
        })}
      </div>
      <p className="font-pixel mt-2" style={{ fontSize: '10px', color: '#9878c0' }}>
        ※ NPC마다 좋아하는 선물이 다릅니다. 대화 속 힌트를 주의 깊게 들으세요.
      </p>
    </div>
  );
}

// ─── Component ────────────────────────────────
export default function NPCRoom({ npc, relation, gold, onGoldSpend, onDone, onRelicGiven, personaAlignment }: NPCRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [totalFamiliarityDelta, setTotalFamiliarityDelta] = useState(0);
  const [turnsUsed, setTurnsUsed] = useState(0);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [currentGold, setCurrentGold] = useState(gold);
  const [relicGivenThisSession, setRelicGivenThisSession] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const currentFamiliarity = relation.familiarity + totalFamiliarityDelta;
  const stage = getFamiliarityStage(currentFamiliarity);
  const maxTurns = getMaxTurnsByMeetCount(relation.meetCount);
  const remainingTurns = Math.max(0, maxTurns - turnsUsed);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const playerInput =
      relation.meetCount > 0
        ? '*이전에 만난 적 있는 상대가 다시 나타났다*'
        : '*처음 만났다*';
    void callNPC(playerInput, [], 0, undefined);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function tryTriggerRelicGift(
    currentFam: number,
    triggeredByKeyword: boolean,
    triggeredByFavoriteGift: boolean,
  ) {
    if (relicGivenThisSession || relation.relicGiven) return;
    if (currentFam < 60) return;
    if (!triggeredByKeyword && !triggeredByFavoriteGift) return;
    if (!onRelicGiven) return;

    setRelicGivenThisSession(true);
    const relic = npc.rewardRelic;
    const reason = triggeredByFavoriteGift
      ? `좋아하는 선물을 받았으니`
      : `"${npc.rewardKeyword}"... 그 말이 마음을 울렸다`;
    setMessages((prev) => [
      ...prev,
      {
        role: 'npc',
        text: `${reason}. 이걸 받아두게. [${relic.icon} ${relic.name}]`,
        isGift: true,
      },
    ]);
    onRelicGiven(relic);
  }

  async function callNPC(
    playerInput: string,
    currentMessages: Message[],
    currentDelta: number,
    giftOffered: { name: string; tag: string } | undefined,
  ) {
    setIsLoading(true);

    const currentFam = relation.familiarity + currentDelta;
    const curMaxTurns = getMaxTurnsByMeetCount(relation.meetCount);
    const curRemaining = Math.max(0, curMaxTurns - turnsUsed);

    const conversationHistory = currentMessages
      .map((m) => `${m.role === 'npc' ? npc.name : '플레이어'}: ${m.text}`)
      .join('\n');

    try {
      const response = await generateNPCDialogue({
        npcName: npc.name,
        personality: npc.personality,
        familiarity: currentFam,
        meetCount: relation.meetCount,
        remainingTurns: curRemaining,
        conversationHistory,
        playerInput,
        personaAlignment,
        favoriteItemTag: npc.favoriteItemTag,
        giftOffered,
      });

      const clampedChange = Math.max(-100, Math.min(100, response.familiarityChange));
      const newDelta = Math.max(-relation.familiarity, currentDelta + clampedChange);

      setTotalFamiliarityDelta(newDelta);
      setMessages((prev) => [
        ...prev,
        { role: 'npc', text: response.dialogue },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'npc', text: '...(말문이 막혔다)' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit() {
    const trimmed = inputText.trim();
    if (!trimmed || isLoading || remainingTurns <= 0) return;

    const playerMessage: Message = { role: 'player', text: trimmed };
    const newMessages = [...messages, playerMessage];

    setMessages(newMessages);
    setInputText('');
    setTurnsUsed((prev) => prev + 1);

    await callNPC(trimmed, newMessages, totalFamiliarityDelta, undefined);

    const famAfter = relation.familiarity + totalFamiliarityDelta;
    const hasKeyword = trimmed.includes(npc.rewardKeyword);
    tryTriggerRelicGift(famAfter, hasKeyword, false);
  }

  async function handleGiftSelect(gift: GiftItem) {
    if (currentGold < gift.goldCost || isLoading) return;

    const newGold = currentGold - gift.goldCost;
    setCurrentGold(newGold);
    onGoldSpend(gift.goldCost);
    setShowGiftPanel(false);

    const playerMessage: Message = {
      role: 'player',
      text: `🎁 ${gift.emoji} "${gift.name}"을(를) 건넸다`,
      isGift: true,
    };
    const newMessages = [...messages, playerMessage];
    setMessages(newMessages);
    setTurnsUsed((prev) => prev + 1);

    await callNPC(
      `[플레이어가 선물을 건넸다]`,
      newMessages,
      totalFamiliarityDelta,
      { name: gift.name, tag: gift.tag },
    );

    const famAfter = relation.familiarity + totalFamiliarityDelta;
    const isFavorite = gift.tag === npc.favoriteItemTag;
    tryTriggerRelicGift(famAfter, false, isFavorite);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  }

  function handleDone() {
    onDone(totalFamiliarityDelta);
  }

  const displayFamiliarity = Math.max(0, Math.min(100, currentFamiliarity));
  const familiarityDiff = totalFamiliarityDelta;

  return (
    <PixelDialogFrame
      npcName={npc.name}
      npcIcon={
        NPC_SPRITES[npc.id]
          ? <Sprite spriteKey={NPC_SPRITES[npc.id]} scale={3} animation="idle" />
          : npc.icon
      }
      familiarity={displayFamiliarity}
      familiarityLabel={stage.label}
      className="w-full"
    >
      <div className="flex flex-col gap-3">
        {/* 재회 배너 */}
        {relation.meetCount > 0 && (
          <div
            className="font-pixel px-3 py-2"
            style={{
              fontSize: '12px',
              color: '#f0c040',
              border: '2px solid #f0c040',
              background: '#1a1000',
              lineHeight: '2',
            }}
          >
            {npc.reunionLine}
          </div>
        )}

        {/* 호감도 변화 표시 */}
        {familiarityDiff !== 0 && (
          <div className="font-pixel text-right" style={{ fontSize: '11px', color: familiarityDiff > 0 ? '#40c040' : '#e04040' }}>
            호감도 {familiarityDiff > 0 ? '+' : ''}{familiarityDiff}
          </div>
        )}

        {/* 대화 기록 */}
        <div
          className="flex flex-col gap-2"
          style={{
            maxHeight: '320px',
            overflowY: 'auto',
            padding: '8px',
            background: '#120a1e',
            border: '2px solid #4a2d7a',
          }}
        >
          {messages.map((msg, idx) => {
            const isNpc = msg.role === 'npc';
            const isLastNpc =
              isNpc &&
              idx === messages.reduce((last, m, i) => (m.role === 'npc' ? i : last), -1);

            return (
              <div
                key={idx}
                className="font-pixel"
                style={{
                  textAlign: isNpc ? 'left' : 'right',
                  color: msg.isGift ? '#f0c040' : isNpc ? '#e8d8b8' : '#c8a8e8',
                  fontSize: '13px',
                  lineHeight: '2',
                  padding: '4px 8px',
                  fontStyle: msg.isGift ? 'italic' : 'normal',
                }}
              >
                {isLastNpc ? (
                  <TypewriterText text={msg.text} speed={25} />
                ) : (
                  <span style={{ whiteSpace: 'pre-line' }}>{msg.text}</span>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div
              className="font-pixel"
              style={{ fontSize: '12px', color: '#9878c0', textAlign: 'left' }}
            >
              ...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 선물 패널 */}
        {showGiftPanel && remainingTurns > 0 && (
          <GiftPanel
            gold={currentGold}
            onSelect={(gift) => void handleGiftSelect(gift)}
            onClose={() => setShowGiftPanel(false)}
          />
        )}

        {/* 입력창 + 버튼 영역 */}
        {remainingTurns > 0 && !showGiftPanel && (
          <div className="flex gap-2 items-center">
            <PixelInput
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLoading ? '...' : '말을 건네라...'}
              disabled={isLoading}
              style={{ fontSize: '13px' }}
            />
            <PixelButton
              variant="primary"
              size="sm"
              onClick={() => void handleSubmit()}
              disabled={isLoading || !inputText.trim()}
            >
              전송
            </PixelButton>
            <PixelButton
              variant="secondary"
              size="sm"
              onClick={() => setShowGiftPanel(true)}
              disabled={isLoading}
            >
              🎁
            </PixelButton>
          </div>
        )}

        {/* 남은 대화 횟수 */}
        <div
          className="font-pixel"
          style={{ fontSize: '11px', color: '#9878c0', textAlign: 'right' }}
        >
          {remainingTurns > 0
            ? `남은 대화: ${remainingTurns}회 | 골드: ${currentGold}g`
            : '대화 횟수를 모두 사용했다'}
        </div>

        <PixelDivider />

        {/* 대화 종료 버튼 */}
        <div className="flex justify-end">
          <PixelButton
            variant="secondary"
            size="sm"
            onClick={handleDone}
            disabled={isLoading}
          >
            대화 종료
          </PixelButton>
        </div>
      </div>
    </PixelDialogFrame>
  );
}
