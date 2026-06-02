export type AchievementCategory = 'explore' | 'combat' | 'collect' | 'social' | 'master';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  reward: number;
  category: AchievementCategory;
}

export const ACHIEVEMENTS: Achievement[] = [
  // 탐험
  { id: 'first_step',    name: '첫 발걸음',     icon: '👣', reward: 5,  category: 'explore', description: '처음으로 던전에 발을 들였다' },
  { id: 'floor_5',       name: '심층 탐험가',   icon: '🗺️', reward: 10, category: 'explore', description: '5층에 도달했다' },
  { id: 'floor_10',      name: '던전의 지배자', icon: '🏔️', reward: 20, category: 'explore', description: '10층에 도달했다' },
  { id: 'map_complete',  name: '지도 완성',     icon: '📜', reward: 10, category: 'explore', description: '지도 조각 3개를 모두 모았다' },
  // 전투
  { id: 'first_kill',    name: '첫 번째 희생',  icon: '⚔️', reward: 5,  category: 'combat', description: '처음으로 전투에서 승리했다' },
  { id: 'elite_slayer',  name: '강자 사냥꾼',   icon: '💀', reward: 10, category: 'combat', description: '엘리트 몬스터를 처치했다' },
  { id: 'ghost_hunter',  name: '유령 퇴치사',   icon: '👻', reward: 10, category: 'combat', description: '유령과의 전투에서 승리했다' },
  { id: 'ghost_veteran', name: '유령 사냥꾼',   icon: '🔮', reward: 20, category: 'combat', description: '유령 전투 통산 3회 승리' },
  { id: 'close_call',    name: '구사일생',      icon: '❤️', reward: 10, category: 'combat', description: 'HP 10 이하의 상태로 생존했다' },
  { id: 'pacifist',      name: '평화주의자',    icon: '🕊️', reward: 15, category: 'combat', description: '협상으로 전투를 3회 종결했다' },
  // 수집
  { id: 'relic_hoarder', name: '유물 수집가',   icon: '🗿', reward: 10, category: 'collect', description: '렐릭 3개를 동시에 보유했다' },
  { id: 'cursed_heart',  name: '저주를 품다',   icon: '🩸', reward: 15, category: 'collect', description: '저주받은 유물 2개를 동시에 보유했다' },
  { id: 'bestiary_half', name: '도감 절반',     icon: '📖', reward: 15, category: 'collect', description: '적 도감의 절반 이상을 발견했다' },
  { id: 'bestiary_all',  name: '완전 도감',     icon: '📚', reward: 30, category: 'collect', description: '모든 적을 발견했다' },
  // 사교
  { id: 'diplomat',      name: '외교관',        icon: '🤝', reward: 10, category: 'social', description: 'NPC 친밀도 60 이상을 달성했다' },
  { id: 'networker',     name: '인맥 부자',     icon: '🗣️', reward: 10, category: 'social', description: '3명의 NPC와 대화했다' },
  // 마스터
  { id: 'first_clear',   name: '첫 탈출',       icon: '🏆', reward: 30, category: 'master', description: '던전을 처음으로 클리어했다' },
  { id: 'triple_clear',  name: '던전 마스터',   icon: '👑', reward: 50, category: 'master', description: '던전을 3회 클리어했다' },
  { id: 'veteran',       name: '역전의 용사',   icon: '🎖️', reward: 20, category: 'master', description: '총 10회 도전했다' },
  { id: 'lucky_cursed',  name: '저주의 수호자', icon: '🌑', reward: 25, category: 'master', description: '저주 유물을 소지한 채로 클리어했다' },
];

export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  explore: '🗺️ 탐험',
  combat:  '⚔️ 전투',
  collect: '🗿 수집',
  social:  '🗣️ 사교',
  master:  '👑 마스터',
};

export const TOTAL_ENEMIES = 10;
