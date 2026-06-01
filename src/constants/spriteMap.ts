// Tiny Dungeon — 개별 타일 PNG (16×16)
// /sprites/dungeon/Tiles/tile_XXXX.png
// 타일맵: 12열 × 11행, 1px 간격
// 번호 규칙: row * 12 + col

export type SpriteKey =
  | 'warrior' | 'rogue' | 'mage'
  | 'skeleton' | 'goblin' | 'slime' | 'dragon' | 'rat' | 'zombie'
  | 'chest' | 'key' | 'potion' | 'sword' | 'shield' | 'staff'
  | 'floor' | 'wall' | 'door' | 'stairs'
  | 'npc_merchant' | 'npc_wizard' | 'npc_guard' | 'npc_innkeeper' | 'npc_thief'
  | 'coin' | 'skull' | 'heart' | 'star' | 'ghost';

// tile 번호 → 파일명: tile_${String(n).padStart(4,'0')}.png
export const SPRITE_TILES: Record<SpriteKey, number> = {
  // 플레이어 캐릭터
  warrior:      96,  // 헬멧 쓴 전사
  rogue:        112,
  mage:         84,

  // 몬스터 (row 4~5)
  skeleton:     48,
  goblin:       49,
  slime:        50,
  dragon:       51,
  rat:          52,
  zombie:       54,

  // NPC
  npc_guard:    86,   // 대장장이 이고르
  npc_merchant: 99,   // 상인 베라
  npc_innkeeper:100,  // 여관주인 메그
  npc_wizard:   111,  // 마법사 엘릭
  npc_thief:    88,   // 도둑 섀도우

  // 아이템 (row 6~7)
  chest:        72,
  potion:       73,
  key:          74,
  sword:        75,
  shield:       76,
  staff:        77,
  coin:         78,

  // 던전 타일 (row 8~9)
  floor:        96,
  wall:         97,
  door:         98,
  stairs:       99,

  // UI 요소 (row 10)
  skull:        120,
  heart:        121,
  star:         122,
  ghost:        55,
};

export function getTilePath(tileNum: number): string {
  return `/sprites/dungeon/Tiles/tile_${String(tileNum).padStart(4, '0')}.png`;
}

export function getSpritePath(key: SpriteKey): string {
  return getTilePath(SPRITE_TILES[key]);
}

// 방 타입별 대표 스프라이트
export const ROOM_TYPE_SPRITES: Record<string, SpriteKey> = {
  combat: 'goblin',
  event:  'chest',
  npc:    'npc_merchant',
  shop:   'potion',
  rest:   'stairs',
  ghost:  'ghost',
};

// 클래스별 스프라이트
export const CLASS_SPRITES: Record<string, SpriteKey> = {
  warrior: 'warrior',
  rogue:   'rogue',
  mage:    'mage',
};

// NPC ID별 스프라이트
export const NPC_SPRITES: Record<string, SpriteKey> = {
  blacksmith_igor: 'npc_guard',
  merchant_vera:   'npc_merchant',
  wizard_elric:    'npc_wizard',
  innkeeper_meg:   'npc_innkeeper',
  thief_shadow:    'npc_thief',
};
