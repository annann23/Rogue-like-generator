import { PixelPanel, PixelButton, PixelDivider } from './UIFrame';
import type { Item, EquipmentSlots } from '@/constants/items';

interface InventoryPanelProps {
  items: Item[];
  equipment: EquipmentSlots;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  onUseItem: (index: number) => void;
  onEquipItem: (index: number) => void;
  onUnequipItem: (slot: 'weapon' | 'armor') => void;
  onClose: () => void;
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

export default function InventoryPanel({
  items,
  equipment,
  hp,
  maxHp,
  atk,
  def,
  onUseItem,
  onEquipItem,
  onUnequipItem,
  onClose,
}: InventoryPanelProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(5, 2, 12, 0.82)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          maxHeight: '85dvh',
          overflowY: 'auto',
        }}
      >
        <PixelPanel variant="dark" className="p-5">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <p
              className="font-pixel"
              style={{ fontSize: '15px', color: '#f0c040' }}
            >
              🎒 인벤토리
            </p>
            <PixelButton variant="ghost" size="sm" onClick={onClose}>
              닫기
            </PixelButton>
          </div>

          {/* 현재 스탯 */}
          <div
            className="flex gap-3 mb-4 flex-wrap"
            style={{ background: '#120a1e', border: '2px solid #4a2d7a', padding: '8px 12px' }}
          >
            <span className="font-pixel" style={{ fontSize: '11px', color: '#e04060' }}>
              HP {hp}/{maxHp}
            </span>
            <span className="font-pixel" style={{ fontSize: '11px', color: '#f0c040' }}>
              ATK {atk}
            </span>
            <span className="font-pixel" style={{ fontSize: '11px', color: '#4080e0' }}>
              DEF {def}
            </span>
          </div>

          {/* 장비 슬롯 */}
          <PixelDivider label="장착 중" />
          <div className="flex flex-col gap-2 mt-3 mb-4">
            {(['weapon', 'armor'] as const).map((slot) => {
              const equipped = equipment[slot];
              return (
                <div
                  key={slot}
                  style={{
                    background: '#120a1e',
                    border: `2px solid ${equipped ? '#6b4fa0' : '#2a1a4a'}`,
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                >
                  <div>
                    <span
                      className="font-pixel"
                      style={{ fontSize: '10px', color: '#5a4a7a', display: 'block', marginBottom: '2px' }}
                    >
                      {slot === 'weapon' ? '무기' : '방어구'}
                    </span>
                    {equipped ? (
                      <span className="font-pixel" style={{ fontSize: '12px', color: '#e8d8b8' }}>
                        {equipped.icon} {equipped.name}{' '}
                        <span style={{ color: '#40c060', fontSize: '11px' }}>
                          ({effectLabel(equipped)})
                        </span>
                      </span>
                    ) : (
                      <span className="font-pixel" style={{ fontSize: '11px', color: '#3a2a5a' }}>
                        빈 슬롯
                      </span>
                    )}
                  </div>
                  {equipped && (
                    <PixelButton
                      variant="secondary"
                      size="sm"
                      onClick={() => onUnequipItem(slot)}
                    >
                      해제
                    </PixelButton>
                  )}
                </div>
              );
            })}
          </div>

          {/* 소지품 */}
          <PixelDivider label="소지품" />
          <div className="flex flex-col gap-2 mt-3">
            {items.length === 0 ? (
              <p
                className="font-pixel text-center"
                style={{ fontSize: '12px', color: '#3a2a5a', padding: '16px 0' }}
              >
                소지품이 없다
              </p>
            ) : (
              items.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  style={{
                    background: '#1a0f2e',
                    border: '2px solid #4a2d7a',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-1 mb-1">
                      <span style={{ fontSize: '16px' }}>{item.icon}</span>
                      <span
                        className="font-pixel"
                        style={{ fontSize: '12px', color: '#e8d8b8' }}
                      >
                        {item.name}
                      </span>
                    </div>
                    <span
                      className="font-pixel"
                      style={{ fontSize: '10px', color: '#40c060' }}
                    >
                      {effectLabel(item)}
                    </span>
                  </div>
                  {item.category === 'consumable' ? (
                    <PixelButton
                      variant="primary"
                      size="sm"
                      onClick={() => onUseItem(idx)}
                    >
                      사용
                    </PixelButton>
                  ) : (
                    <PixelButton
                      variant="secondary"
                      size="sm"
                      onClick={() => onEquipItem(idx)}
                    >
                      장착
                    </PixelButton>
                  )}
                </div>
              ))
            )}
          </div>
        </PixelPanel>
      </div>
    </div>
  );
}
