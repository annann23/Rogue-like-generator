import { useState, useEffect, useRef } from 'react';
import { type NPCTemplate, getFamiliarityStage } from '@/constants/npcs';
import { generateNPCDialogue } from '@/hooks/useClaude';
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
  relation: { familiarity: number; meetCount: number };
  onDone: (familiarityDelta: number) => void;
  personaAlignment?: string;
}

interface Message {
  role: 'npc' | 'player';
  text: string;
}

// ─── Component ────────────────────────────────
export default function NPCRoom({ npc, relation, onDone, personaAlignment }: NPCRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [totalFamiliarityDelta, setTotalFamiliarityDelta] = useState(0);
  const [turnsUsed, setTurnsUsed] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // 친밀도 단계 계산
  const currentFamiliarity = relation.familiarity + totalFamiliarityDelta;
  const stage = getFamiliarityStage(currentFamiliarity);
  const maxTurns = stage.maxTurns === Infinity ? 10 : stage.maxTurns;
  const remainingTurns = Math.max(0, maxTurns - turnsUsed);

  // 스크롤 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 마운트 시 첫 NPC 대사 (StrictMode 이중 실행 방지)
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const playerInput =
      relation.meetCount > 0
        ? '*이전에 만난 적 있는 상대가 다시 나타났다*'
        : '*처음 만났다*';
    void callNPC(playerInput, [], 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function callNPC(
    playerInput: string,
    currentMessages: Message[],
    currentDelta: number,
  ) {
    setIsLoading(true);

    const currentFam = relation.familiarity + currentDelta;
    const currentStage = getFamiliarityStage(currentFam);
    const curMaxTurns = currentStage.maxTurns === Infinity ? 10 : currentStage.maxTurns;
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
      });

      // familiarityChange 클램핑 (-100 ~ 100)
      const clampedChange = Math.max(-100, Math.min(100, response.familiarityChange));
      const newDelta = currentDelta + clampedChange;

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

    await callNPC(trimmed, newMessages, totalFamiliarityDelta);
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
            }}
          >
            ..어디서 본 얼굴이군
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
            // 마지막 NPC 메시지는 TypewriterText로 표시
            const isLastNpc =
              isNpc &&
              idx ===
                messages.reduce(
                  (last, m, i) => (m.role === 'npc' ? i : last),
                  -1,
                );

            return (
              <div
                key={idx}
                className="font-pixel"
                style={{
                  textAlign: isNpc ? 'left' : 'right',
                  color: isNpc ? '#e8d8b8' : '#f0c040',
                  fontSize: '13px',
                  lineHeight: '2',
                  padding: '4px 8px',
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

          {/* 로딩 중 표시 */}
          {isLoading && (
            <div
              className="font-pixel"
              style={{ fontSize: '12px', color: '#9878c0', textAlign: 'left' }}
            >
              신탁을 기다리는 중...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 입력창 + 전송 버튼 */}
        {remainingTurns > 0 && (
          <div className="flex gap-2 items-center">
            <PixelInput
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLoading ? '신탁을 기다리는 중...' : '말을 건네라...'}
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
          </div>
        )}

        {/* 남은 대화 횟수 */}
        <div
          className="font-pixel"
          style={{ fontSize: '11px', color: '#9878c0', textAlign: 'right' }}
        >
          {remainingTurns > 0
            ? `남은 대화: ${remainingTurns}회`
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
