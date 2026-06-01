export type EnemyTrait = 'aggressive' | 'cunning' | 'defensive';
export type EnemyTier = 'normal' | 'elite' | 'boss';

export interface Enemy {
  name: string;
  description: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  trait: EnemyTrait;
  tier: EnemyTier;
  rageGauge: number;
  currentIntent: EnemyIntent;
  statusEffects: EnemyStatus[];
}

export type EnemyIntentType = 'attack' | 'defend' | 'buff' | 'special' | 'unknown';

export interface EnemyIntent {
  type: EnemyIntentType;
  description: string;
  isRevealed: boolean;
}

export type EnemyStatusType = 'weakened' | 'enraged' | 'cowered' | 'confused';

export interface EnemyStatus {
  type: EnemyStatusType;
  turnsRemaining: number;
}

export type PlayerActionType =
  | 'attack'
  | 'defend'
  | 'taunt'
  | 'bluff'
  | 'read'
  | 'negotiate'
  | 'flee'
  | 'skill_attack';

export interface PlayerAction {
  type: PlayerActionType;
  label: string;
  icon: string;
  description: string;
  requiredSkill?: { type: string; level: number };
  disabled?: boolean;
  disableReason?: string;
}

export interface CombatTurnRecord {
  turn: number;
  playerAction: PlayerActionType;
  narrative: string;
  hpChange: number;
  enemyHpChange: number;
  enemyRageChange: number;
  newEnemyIntent: EnemyIntent;
  specialEffect?: 'flee_success' | 'flee_fail' | 'negotiate_success' | 'bluff_success' | 'bluff_fail';
  statusApplied?: EnemyStatus;
}

export type CombatPhase =
  | 'init'
  | 'player_turn'
  | 'resolving'
  | 'turn_result'
  | 'victory'
  | 'defeat'
  | 'fled'
  | 'negotiated';

export interface CombatState {
  enemy: Enemy | null;
  phase: CombatPhase;
  currentTurn: number;
  maxTurns: number;
  turnHistory: CombatTurnRecord[];
  isPlayerDefeated: boolean;
  defeatCause: string | null;
  rewardGold: number;
  rewardRelic: { name: string; effect: string; isCursed: boolean } | null;
  fleeAttempted: boolean;
  negotiateAttempted: boolean;
}
