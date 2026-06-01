// Tiny Dungeon tilemap.png (16x16 per tile)
// 좌표: [col, row] → background-position: -(col*16)px -(row*16)px

export type SpriteKey =
  | 'warrior' | 'rogue' | 'mage'
  | 'skeleton' | 'goblin' | 'slime' | 'dragon' | 'rat' | 'zombie'
  | 'chest' | 'key' | 'potion' | 'sword' | 'shield' | 'staff'
  | 'floor' | 'wall' | 'door' | 'stairs'
  | 'npc_merchant' | 'npc_wizard' | 'npc_guard';

export const SPRITE_MAP: Record<SpriteKey, [number, number]> = {
  // 캐릭터
  warrior:      [0, 0],
  rogue:        [1, 0],
  mage:         [2, 0],

  // 몬스터
  skeleton:     [0, 4],
  goblin:       [1, 4],
  slime:        [2, 4],
  dragon:       [3, 4],
  rat:          [4, 4],
  zombie:       [5, 4],

  // 아이템
  chest:        [0, 6],
  key:          [1, 6],
  potion:       [2, 6],
  sword:        [3, 6],
  shield:       [4, 6],
  staff:        [5, 6],

  // 타일
  floor:        [0, 8],
  wall:         [1, 8],
  door:         [2, 8],
  stairs:       [3, 8],

  // NPC
  npc_merchant: [0, 2],
  npc_wizard:   [1, 2],
  npc_guard:    [2, 2],
};

export function getSpriteStyle(key: SpriteKey): React.CSSProperties {
  const [col, row] = SPRITE_MAP[key];
  return {
    backgroundImage: "url('/sprites/dungeon/Tilemap/tilemap.png')",
    backgroundPosition: `-${col * 16}px -${row * 16}px`,
    backgroundRepeat: 'no-repeat',
    width: '16px',
    height: '16px',
    imageRendering: 'pixelated',
  };
}
