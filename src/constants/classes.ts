export type CharacterClass = 'warrior' | 'rogue' | 'mage';

export interface ClassStats {
  id: CharacterClass;
  name: string;
  icon: string;
  hp: number;
  atk: number;
  def: number;
  startGold: number;
  mana?: number;
  skills: {
    intelligence: number;
    negotiation: number;
    lockpick: number;
    stealth: number;
    strength: number;
    arcane: number;
  };
  description: string;
}

export const CHARACTER_CLASSES: ClassStats[] = [
  {
    id: 'warrior',
    name: '전사',
    icon: '⚔️',
    hp: 120,
    atk: 15,
    def: 8,
    startGold: 30,
    skills: {
      intelligence: 1,
      negotiation: 1,
      lockpick: 0,
      stealth: 0,
      strength: 3,
      arcane: 0,
    },
    description: '튼튼한 갑옷과 강인한 체력으로 정면 돌파하는 전사',
  },
  {
    id: 'rogue',
    name: '도적',
    icon: '🗡️',
    hp: 80,
    atk: 12,
    def: 4,
    startGold: 80,
    skills: {
      intelligence: 1,
      negotiation: 2,
      lockpick: 3,
      stealth: 3,
      strength: 1,
      arcane: 0,
    },
    description: '그림자 속에서 기회를 노리는 교활한 도적',
  },
  {
    id: 'mage',
    name: '마법사',
    icon: '🔮',
    hp: 70,
    atk: 10,
    def: 3,
    startGold: 30,
    mana: 20,
    skills: {
      intelligence: 3,
      negotiation: 1,
      lockpick: 0,
      stealth: 1,
      strength: 0,
      arcane: 3,
    },
    description: '강력한 마법으로 적을 제압하는 현자',
  },
];
