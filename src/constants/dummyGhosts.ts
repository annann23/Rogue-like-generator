export interface GhostRecord {
  id: string;
  nickname: string;
  class: string;
  depth: number;
  skills: Record<string, number>;
  surveyAnswers: string[];
  cause: string;
  created_at: string;
}

export const DUMMY_GHOSTS: GhostRecord[] = [
  {
    id: 'dummy-1',
    nickname: '고대 전사',
    class: 'warrior',
    depth: 3,
    skills: { strength: 4, intelligence: 1, negotiation: 1, lockpick: 0, stealth: 0, arcane: 0 },
    surveyAnswers: ['7', '3', '커피', '2', '겨울'],
    cause: '던전 괴물에게 압도당했다',
    created_at: new Date().toISOString(),
  },
  {
    id: 'dummy-2',
    nickname: '잊혀진 도적',
    class: 'rogue',
    depth: 5,
    skills: { strength: 1, intelligence: 2, negotiation: 2, lockpick: 4, stealth: 3, arcane: 0 },
    surveyAnswers: ['13', '1', '물', '0', '여름'],
    cause: '함정에 걸려 최후를 맞이했다',
    created_at: new Date().toISOString(),
  },
  {
    id: 'dummy-3',
    nickname: '미지의 마법사',
    class: 'mage',
    depth: 7,
    skills: { strength: 0, intelligence: 4, negotiation: 1, lockpick: 0, stealth: 1, arcane: 4 },
    surveyAnswers: ['42', '5', '차', '1', '봄'],
    cause: '마나가 다 떨어져 무너졌다',
    created_at: new Date().toISOString(),
  },
];
