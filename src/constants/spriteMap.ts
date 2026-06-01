// Tiny Dungeon — 개별 타일 PNG (16×16)
// /sprites/dungeon/Tiles/tile_XXXX.png
// 타일맵: 12열 × 11행, 1px 간격
// 번호 규칙: row * 12 + col

export type SpriteKey =
  | 'warrior' | 'rogue' | 'mage'
  | 'monster_bat' | 'monster_field_rat' | 'monster_cave_rat' | 'monster_spider'
  | 'monster_scorpion' | 'monster_ghost' | 'monster_mimic'
  | 'monster_cyclops' | 'monster_golem' | 'monster_dragon'
  | 'chest' | 'key' | 'potion' | 'sword' | 'shield' | 'staff'
  | 'floor' | 'wall' | 'door' | 'stairs'
  | 'npc_merchant' | 'npc_wizard' | 'npc_guard' | 'npc_innkeeper' | 'npc_thief'
  | 'coin' | 'skull' | 'heart' | 'star' | 'ghost';

// tile 번호 → 파일명: tile_${String(n).padStart(4,'0')}.png
export const SPRITE_TILES: Record<SpriteKey, number> = {
  // 플레이어 캐릭터
  warrior:      96,
  rogue:        112,
  mage:         84,

  // 몬스터 — Normal
  monster_bat:        120,
  monster_field_rat:  123,
  monster_cave_rat:   124,
  monster_spider:     122,

  // 몬스터 — Elite
  monster_scorpion:   110,
  monster_ghost:      121,
  monster_mimic:      92,

  // 몬스터 — Boss
  monster_cyclops:    109,
  monster_golem:      200,  // 커스텀 픽셀 아트
  monster_dragon:     201,  // 커스텀 픽셀 아트

  // NPC
  npc_guard:    86,   // 대장장이 이고르
  npc_merchant: 99,   // 상인 베라
  npc_innkeeper:100,  // 여관주인 메그
  npc_wizard:   111,  // 마법사 엘릭
  npc_thief:    88,   // 도둑 섀도우

  // 아이템
  chest:        72,
  potion:       73,
  key:          74,
  sword:        75,
  shield:       76,
  staff:        77,
  coin:         78,

  // 던전 타일
  floor:        96,
  wall:         97,
  door:         98,
  stairs:       99,

  // UI 요소
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

// 몬스터 ID → SpriteKey
export const MONSTER_SPRITES: Record<string, SpriteKey> = {
  bat:        'monster_bat',
  field_rat:  'monster_field_rat',
  cave_rat:   'monster_cave_rat',
  spider:     'monster_spider',
  scorpion:   'monster_scorpion',
  ghost:      'monster_ghost',
  mimic:      'monster_mimic',
  cyclops:    'monster_cyclops',
  golem:      'monster_golem',
  dragon:     'monster_dragon',
};

// 방 타입별 대표 스프라이트
export const ROOM_TYPE_SPRITES: Record<string, SpriteKey> = {
  combat: 'monster_bat',
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
