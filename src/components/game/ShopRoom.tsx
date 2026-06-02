import { useState } from 'react';
import { PixelPanel, PixelButton, PixelDivider } from './UIFrame';
import { getShopItems, type Item } from '@/constants/items';
import { FIXED_RELICS, type Relic } from '@/constants/relics';

interface ShopRoomProps {
  depth: number;
  gold: number;
  ownedRelicNames: string[];
  onBuy: (item: Item) => void;
  onBuyRelic: (relic: Relic, price: number) => void;
  onLeave: () => void;
}

function getRelicShopStock(depth: number, ownedRelicNames: string[]): { relic: Relic; price: number }[] {
  if (Math.random() >= 1 / 3) return [];
  const available = FIXED_RELICS.filter(r => !ownedRelicNames.includes(r.name));
  if (available.length === 0) return [];
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  const basePrice = Math.min(80, 40 + depth * 3);
  return [{ relic: shuffled[0], price: basePrice }];
}

export default function ShopRoom({ depth, gold, ownedRelicNames, onBuy, onBuyRelic, onLeave }: ShopRoomProps) {
  const [stock] = useState<Item[]>(() => getShopItems(depth));
  const [relicStock] = useState<{ relic: Relic; price: number }[]>(() => getRelicShopStock(depth, ownedRelicNames));
  const [purchased, setPurchased] = useState<Set<string>>(new Set());
  const [purchasedRelics, setPurchasedRelics] = useState<Set<string>>(new Set());

  function handleBuy(item: Item) {
    if (gold < item.value || purchased.has(item.id)) return;
    onBuy(item);
    setPurchased((prev) => new Set(prev).add(item.id));
  }

  function handleBuyRelic(relic: Relic, price: number) {
    if (gold < price || purchasedRelics.has(relic.name)) return;
    onBuyRelic(relic, price);
    setPurchasedRelics((prev) => new Set(prev).add(relic.name));
  }

  function effectLabel(item: Item): string {
    switch (item.effect.type) {
      case 'heal': return `HP +${item.effect.amount}`;
      case 'heal_full': return 'HP 완전 회복';
      case 'atk_up': return `ATK +${item.effect.amount}`;
      case 'def_up': return `DEF +${item.effect.amount}`;
      case 'mana_up': return `마나 +${item.effect.amount}`;
      default: return '';
    }
  }

  return (
    <PixelPanel variant="brown" className="p-5">
      <p
        className="font-pixel text-center mb-1"
        style={{ fontSize: '16px', color: '#f0c040' }}
      >
        🏪 상점
      </p>
      <p
        className="font-pixel text-center mb-4"
        style={{ fontSize: '11px', color: '#9878c0' }}
      >
        소지 골드: {gold} G
      </p>

      <PixelDivider />

      <div className="flex flex-col gap-4 mt-4">
        {stock.map((item) => {
          const isBought = purchased.has(item.id);
          const canAfford = gold >= item.value;

          return (
            <div
              key={item.id}
              style={{
                background: isBought ? '#0d0a15' : '#1a0f2e',
                border: `2px solid ${isBought ? '#2a1a4a' : '#6b4fa0'}`,
                padding: '12px',
                opacity: isBought ? 0.6 : 1,
              }}
            >
              {/* 아이콘 + 이름 */}
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                <span
                  className="font-pixel"
                  style={{ fontSize: '13px', color: '#e8d8b8' }}
                >
                  {item.name}
                </span>
                <span
                  className="font-pixel ml-auto"
                  style={{
                    fontSize: '10px',
                    color: '#9878c0',
                    background: '#120a1e',
                    border: '1px solid #4a2d7a',
                    padding: '2px 6px',
                  }}
                >
                  {item.category === 'consumable' ? '소비' : item.category === 'weapon' ? '무기' : '방어구'}
                </span>
              </div>

              {/* 설명 */}
              <p
                className="font-pixel mb-2"
                style={{ fontSize: '11px', color: '#9878c0', lineHeight: 1.8 }}
              >
                {item.description}
              </p>

              {/* 효과 태그 */}
              <span
                className="font-pixel inline-block mb-3"
                style={{
                  fontSize: '11px',
                  color: '#40c060',
                  background: '#0a1a0e',
                  border: '1px solid #206030',
                  padding: '2px 8px',
                }}
              >
                {effectLabel(item)}
              </span>

              {/* 가격 + 구매 버튼 */}
              <div className="flex items-center justify-between">
                <span
                  className="font-pixel"
                  style={{ fontSize: '13px', color: '#f0c040' }}
                >
                  💰 {item.value} G
                </span>
                {isBought ? (
                  <span
                    className="font-pixel"
                    style={{ fontSize: '11px', color: '#5a4a7a' }}
                  >
                    구매 완료
                  </span>
                ) : (
                  <PixelButton
                    variant={canAfford ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => handleBuy(item)}
                    disabled={!canAfford}
                  >
                    {canAfford ? '구매' : '골드 부족'}
                  </PixelButton>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 렐릭 판매 섹션 */}
      {relicStock.length > 0 && (
        <>
          <PixelDivider label="🔮 유물" className="mt-5" />
          <div className="flex flex-col gap-4 mt-4">
            {relicStock.map(({ relic, price }) => {
              const isBought = purchasedRelics.has(relic.name);
              const canAfford = gold >= price;
              return (
                <div
                  key={relic.name}
                  style={{
                    background: isBought ? '#0d0a15' : '#1a0a1e',
                    border: `2px solid ${isBought ? '#2a1a4a' : '#8040c0'}`,
                    padding: '12px',
                    opacity: isBought ? 0.6 : 1,
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ fontSize: '20px' }}>{relic.icon}</span>
                    <span className="font-pixel" style={{ fontSize: '13px', color: '#e8d8b8' }}>
                      {relic.name}
                    </span>
                    <span
                      className="font-pixel ml-auto"
                      style={{
                        fontSize: '10px',
                        color: '#9878c0',
                        background: '#120a1e',
                        border: '1px solid #4a2d7a',
                        padding: '2px 6px',
                      }}
                    >
                      유물
                    </span>
                  </div>
                  <p className="font-pixel mb-3" style={{ fontSize: '11px', color: '#9878c0', lineHeight: 1.8 }}>
                    {relic.effect}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-pixel" style={{ fontSize: '13px', color: '#f0c040' }}>
                      💰 {price} G
                    </span>
                    {isBought ? (
                      <span className="font-pixel" style={{ fontSize: '11px', color: '#5a4a7a' }}>구매 완료</span>
                    ) : (
                      <PixelButton
                        variant={canAfford ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => handleBuyRelic(relic, price)}
                        disabled={!canAfford}
                      >
                        {canAfford ? '구매' : '골드 부족'}
                      </PixelButton>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <PixelDivider className="mt-5" />

      <div className="flex justify-center mt-4">
        <PixelButton variant="secondary" size="lg" onClick={onLeave}>
          상점을 떠난다
        </PixelButton>
      </div>
    </PixelPanel>
  );
}
