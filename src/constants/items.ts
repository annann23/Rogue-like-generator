export type ItemEffectType = 'heal' | 'heal_full' | 'atk_up' | 'def_up' | 'mana_up';

export interface ItemEffect {
  type: ItemEffectType;
  amount: number;
}

export type ItemCategory = 'consumable' | 'weapon' | 'armor';

export interface Item {
  id: string;
  name: string;
  icon: string;
  category: ItemCategory;
  description: string;
  effect: ItemEffect;
  value: number; // 상점 구매가
}

export interface EquipmentSlots {
  weapon: Item | null;
  armor: Item | null;
}

export const ITEMS: Item[] = [
  // ── 소비 아이템 ──
  {
    id: 'potion_small',
    name: '작은 물약',
    icon: '🧪',
    category: 'consumable',
    description: 'HP를 25 회복한다.',
    effect: { type: 'heal', amount: 25 },
    value: 20,
  },
  {
    id: 'potion_medium',
    name: '물약',
    icon: '🍶',
    category: 'consumable',
    description: 'HP를 50 회복한다.',
    effect: { type: 'heal', amount: 50 },
    value: 35,
  },
  {
    id: 'potion_large',
    name: '대형 물약',
    icon: '⚗️',
    category: 'consumable',
    description: 'HP를 완전히 회복한다.',
    effect: { type: 'heal_full', amount: 0 },
    value: 60,
  },
  {
    id: 'scroll_atk',
    name: '근력 주문서',
    icon: '📜',
    category: 'consumable',
    description: 'ATK를 영구적으로 +4 증가시킨다.',
    effect: { type: 'atk_up', amount: 4 },
    value: 45,
  },
  {
    id: 'scroll_def',
    name: '수호 주문서',
    icon: '📜',
    category: 'consumable',
    description: 'DEF를 영구적으로 +4 증가시킨다.',
    effect: { type: 'def_up', amount: 4 },
    value: 45,
  },
  {
    id: 'scroll_vitality',
    name: '생명력 주문서',
    icon: '📜',
    category: 'consumable',
    description: 'HP를 완전히 회복한다.',
    effect: { type: 'heal_full', amount: 0 },
    value: 50,
  },
  {
    id: 'scroll_mana',
    name: '마나 주문서',
    icon: '📜',
    category: 'consumable',
    description: '마나를 10 회복한다.',
    effect: { type: 'mana_up', amount: 10 },
    value: 30,
  },
  // ── 무기 ──
  {
    id: 'weapon_dagger',
    name: '단검',
    icon: '🗡️',
    category: 'weapon',
    description: '가볍고 날카로운 단검. ATK +5.',
    effect: { type: 'atk_up', amount: 5 },
    value: 40,
  },
  {
    id: 'weapon_sword',
    name: '장검',
    icon: '⚔️',
    category: 'weapon',
    description: '균형 잡힌 전사의 검. ATK +10.',
    effect: { type: 'atk_up', amount: 10 },
    value: 70,
  },
  {
    id: 'weapon_axe',
    name: '전투 도끼',
    icon: '🪓',
    category: 'weapon',
    description: '묵직한 전투용 도끼. ATK +14.',
    effect: { type: 'atk_up', amount: 14 },
    value: 95,
  },
  {
    id: 'weapon_staff',
    name: '마법 지팡이',
    icon: '🪄',
    category: 'weapon',
    description: '마법 에너지가 깃든 지팡이. ATK +7.',
    effect: { type: 'atk_up', amount: 7 },
    value: 65,
  },
  // ── 방어구 ──
  {
    id: 'armor_robe',
    name: '마법사 로브',
    icon: '👘',
    category: 'armor',
    description: '마법 저항력이 있는 로브. DEF +3.',
    effect: { type: 'def_up', amount: 3 },
    value: 35,
  },
  {
    id: 'armor_leather',
    name: '가죽 갑옷',
    icon: '🥋',
    category: 'armor',
    description: '가볍고 튼튼한 가죽 갑옷. DEF +6.',
    effect: { type: 'def_up', amount: 6 },
    value: 50,
  },
  {
    id: 'armor_chain',
    name: '사슬 갑옷',
    icon: '🛡️',
    category: 'armor',
    description: '단단한 쇠사슬로 만든 갑옷. DEF +10.',
    effect: { type: 'def_up', amount: 10 },
    value: 75,
  },
];

export const SHOP_POOL: Record<'early' | 'mid' | 'late', string[]> = {
  early: ['potion_small', 'potion_medium', 'scroll_atk', 'scroll_def', 'weapon_dagger', 'armor_robe', 'armor_leather'],
  mid:   ['potion_medium', 'potion_large', 'scroll_atk', 'scroll_def', 'scroll_mana', 'weapon_sword', 'weapon_staff', 'armor_leather', 'armor_chain'],
  late:  ['potion_large', 'scroll_atk', 'scroll_def', 'weapon_axe', 'weapon_sword', 'weapon_staff', 'armor_chain'],
};

export function getShopItems(depth: number): Item[] {
  const tier = depth <= 3 ? 'early' : depth <= 6 ? 'mid' : 'late';
  const pool = SHOP_POOL[tier].map((id) => ITEMS.find((i) => i.id === id)!).filter(Boolean);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}
