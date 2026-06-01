export type SkillType = 'intelligence' | 'negotiation' | 'lockpick' | 'stealth' | 'strength' | 'arcane';

export interface SkillInfo {
  id: SkillType;
  name: string;
  icon: string;
  description: string;
}

export const SKILLS: SkillInfo[] = [
  { id: 'intelligence', name: '지능', icon: '🧠', description: '문자 해독, 함정 파악, 약점 분석' },
  { id: 'negotiation', name: '협상력', icon: '🗣️', description: '몬스터 거래, 가격 협상, NPC 설득' },
  { id: 'lockpick', name: '자물쇠', icon: '🔓', description: '잠긴 상자/문, 감옥 탈출' },
  { id: 'stealth', name: '은신', icon: '👁️', description: '전투 회피, 기습, 절취' },
  { id: 'strength', name: '완력', icon: '💪', description: '문 부수기, 제압, 장애물 제거' },
  { id: 'arcane', name: '마법감지', icon: '✨', description: '마법 함정 탐지, 아이템 감정, 해제' },
];

export const SKILL_SUCCESS_COUNT = 3; // 숙련 필요 횟수
