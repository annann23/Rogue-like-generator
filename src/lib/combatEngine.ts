import { ENEMY_TEMPLATES, pickEnemyTemplate, scaleStats, pickIntent } from '@/constants/enemies';
import type { InitCombatResponse, TurnResultResponse } from '@/hooks/useClaude';

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── 적 초기화 ────────────────────────────────

export function localInitCombat(depth: number, forceEnemyId?: string): InitCombatResponse {
  const template = forceEnemyId
    ? (ENEMY_TEMPLATES.find((e) => e.id === forceEnemyId) ?? pickEnemyTemplate(depth))
    : pickEnemyTemplate(depth);
  const scaled   = scaleStats(template, depth);
  const intent   = pickIntent(template.trait);

  return {
    enemy: {
      id:            template.id,
      name:          template.name,
      description:   template.description,
      hp:            scaled.hp,
      maxHp:         scaled.hp,
      atk:           scaled.atk,
      def:           scaled.def,
      trait:         template.trait,
      tier:          template.tier,
      rageGauge:     template.initRage,
      currentIntent: intent,
      statusEffects: [],
    },
    openingNarrative: pick(template.openingLines),
    rewardGold:       scaled.rewardGold,
    maxTurns:         scaled.maxTurns,
  };
}

// ─── 서사 템플릿 ─────────────────────────────

const NARR = {
  attack_hit:       (name: string, pdmg: number, edmg: number) => pick([
    `${name}을(를) 공격해 ${edmg}의 피해를 입혔다. ${name}의 반격에 ${pdmg}의 피해를 받았다.`,
    `칼날이 ${name}을(를) 베어 ${edmg}의 피해! ${name}도 물러서지 않고 ${pdmg}의 반격을 가한다.`,
  ]),
  defend:           (name: string, pdmg: number) => pick([
    `방패로 몸을 감쌌다. ${name}의 공격을 ${pdmg}의 피해로 막아냈다.`,
    `자세를 낮춰 방어했다. 충격이 완화되어 ${pdmg}의 피해만 받았다.`,
  ]),
  taunt:            (name: string) => pick([
    `${name}을(를) 도발했다. 분노가 눈에 가득 찬다.`,
    `${name}의 자존심을 건드렸다. 분노 게이지가 차오른다.`,
  ]),
  bluff_success:    (name: string) => pick([
    `${name}이(가) 잠시 주춤한다. 기세에 눌린 것 같다.`,
    `허세에 넘어간 ${name}이(가) 물러서며 경계한다.`,
  ]),
  bluff_fail:       (name: string, pdmg: number) => pick([
    `${name}이(가) 허세를 간파하고 ${pdmg}의 피해를 입혔다.`,
    `허세가 통하지 않았다. 분노한 ${name}에게 ${pdmg}의 피해를 받았다.`,
  ]),
  read_success:     (name: string) => pick([
    `${name}의 움직임을 분석했다. 다음 의도가 파악됐다.`,
    `눈을 가늘게 뜨고 ${name}의 패턴을 읽었다.`,
  ]),
  negotiate:        (name: string) => pick([
    `${name}과(와) 협상에 성공했다. 적대가 사라진다.`,
    `말로 설득해 전투를 끝냈다. ${name}이(가) 뒤로 물러선다.`,
  ]),
  flee_success:     () => pick([
    '빠르게 그림자 속으로 몸을 숨겼다. 도주 성공!',
    '적의 시야를 피해 통로로 달렸다!',
  ]),
  flee_fail:        (name: string, pdmg: number) => pick([
    `도주하려 했지만 ${name}이(가) 막아서며 ${pdmg}의 피해를 입혔다.`,
    `등을 보이는 순간 ${name}에게 ${pdmg}의 피해를 받았다.`,
  ]),
  skill_attack:     (name: string, pdmg: number, edmg: number) => pick([
    `특수 기술을 발휘해 ${name}에게 ${edmg}의 강력한 피해! ${name}의 반격에 ${pdmg}의 피해를 받았다.`,
    `힘을 한껏 끌어모아 ${name}을(를) 강타! ${edmg}의 피해를 입히고 ${pdmg}의 반격을 맞았다.`,
  ]),
  combat_end_win:   (name: string) => pick([
    `${name}이(가) 쓰러졌다. 전투 종료.`,
    `${name}이(가) 마지막 숨을 내쉬며 무너진다.`,
  ]),
  player_dead:      (name: string) => pick([
    `${name}의 공격에 쓰러졌다...`,
    `더 이상 버틸 수 없었다. ${name}에게 패배했다.`,
  ]),
};

// ─── 턴 판정 ─────────────────────────────────

export function localResolveTurn(params: {
  playerAction: string;
  enemy: {
    name: string;
    hp: number;
    maxHp: number;
    atk: number;
    def: number;
    trait: string;
    tier: string;
    rageGauge: number;
    currentIntent: { type: string; description: string; isRevealed: boolean };
    statusEffects: Array<{ type: string; turnsRemaining: number }>;
  };
  playerStats: { hp: number; maxHp: number; atk: number; def: number; skills: Record<string, number> };
  turn: number;
  maxTurns: number;
  isLastTurn: boolean;
}): TurnResultResponse {
  const { playerAction, enemy, playerStats, isLastTurn } = params;
  const trait = enemy.trait as 'aggressive' | 'cunning' | 'defensive';

  // 상태이상 배율
  const enemyAtkMult = enemy.statusEffects.some(e => e.type === 'enraged') ? 1.5
    : enemy.statusEffects.some(e => e.type === 'cowered') ? 0.6 : 1.0;
  const playerAtkMult = playerStats.skills['weakened'] ? 0.7 : 1.0;

  const baseEnemyDmg = Math.max(5, Math.round((enemy.atk * enemyAtkMult) - playerStats.def * 0.5));
  const basePlayerDmg = Math.max(5, Math.round(playerStats.atk * playerAtkMult * 0.8 - enemy.def * 0.4));
  const extraSkillDmg = Math.max(playerStats.skills['strength'] ?? 0, playerStats.skills['arcane'] ?? 0) * 4;

  const nextIntent = pickIntent(trait);
  let result: TurnResultResponse = {
    narrative: '',
    hpChange: 0,
    enemyHpChange: 0,
    enemyRageChange: 0,
    newEnemyIntent: nextIntent,
    specialEffect: null,
    statusApplied: null,
    isCombatOver: false,
    isPlayerDefeated: false,
    deathCause: null,
  };

  switch (playerAction) {
    case 'attack': {
      result.hpChange = -baseEnemyDmg;
      result.enemyHpChange = -basePlayerDmg;
      result.narrative = NARR.attack_hit(enemy.name, baseEnemyDmg, basePlayerDmg);
      break;
    }
    case 'defend': {
      const reduced = Math.round(baseEnemyDmg * 0.5);
      result.hpChange = -reduced;
      result.narrative = NARR.defend(enemy.name, reduced);
      break;
    }
    case 'taunt': {
      const rage = 20 + Math.floor(Math.random() * 16);
      result.enemyRageChange = rage;
      result.narrative = NARR.taunt(enemy.name);
      // 분노 폭발 시 적 강화
      if (enemy.rageGauge + rage >= 80) {
        result.statusApplied = { type: 'enraged', turnsRemaining: 2 };
      }
      break;
    }
    case 'bluff': {
      const successRate = (playerStats.skills['negotiation'] ?? 0) * 15 + 25;
      if (Math.random() * 100 < successRate) {
        result.specialEffect = 'bluff_success';
        result.statusApplied = { type: 'cowered', turnsRemaining: 2 };
        result.narrative = NARR.bluff_success(enemy.name);
      } else {
        result.specialEffect = 'bluff_fail';
        result.hpChange = -Math.round(baseEnemyDmg * 1.2);
        result.statusApplied = { type: 'enraged', turnsRemaining: 1 };
        result.narrative = NARR.bluff_fail(enemy.name, Math.round(baseEnemyDmg * 1.2));
      }
      break;
    }
    case 'read': {
      result.newEnemyIntent = { ...nextIntent, isRevealed: true };
      result.narrative = NARR.read_success(enemy.name);
      break;
    }
    case 'negotiate': {
      result.specialEffect = 'negotiate_success';
      result.isCombatOver = true;
      result.narrative = NARR.negotiate(enemy.name);
      break;
    }
    case 'flee': {
      const successRate = (playerStats.skills['stealth'] ?? 0) * 18 + 10;
      if (Math.random() * 100 < successRate) {
        result.specialEffect = 'flee_success';
        result.isCombatOver = true;
        result.narrative = NARR.flee_success();
      } else {
        result.hpChange = -Math.round(enemy.atk * 0.8);
        result.narrative = NARR.flee_fail(enemy.name, Math.round(enemy.atk * 0.8));
      }
      break;
    }
    case 'skill_attack': {
      const skillDmg = basePlayerDmg + extraSkillDmg;
      result.hpChange = -baseEnemyDmg;
      result.enemyHpChange = -skillDmg;
      result.narrative = NARR.skill_attack(enemy.name, baseEnemyDmg, skillDmg);
      break;
    }
  }

  // 적 HP 0 이하 → 전투 종료
  const newEnemyHp = enemy.hp + result.enemyHpChange;
  if (newEnemyHp <= 0 && !result.isCombatOver) {
    result.isCombatOver = true;
    result.narrative = NARR.combat_end_win(enemy.name);
  }

  // 플레이어 HP 0 이하 → 패배
  const newPlayerHp = playerStats.hp + result.hpChange;
  if (newPlayerHp <= 0 && !result.isCombatOver) {
    result.isCombatOver = true;
    result.isPlayerDefeated = true;
    result.deathCause = `${enemy.name}에게 전투에서 패배했다`;
    result.narrative = NARR.player_dead(enemy.name);
  }

  // 마지막 턴 강제 종결
  if (isLastTurn && !result.isCombatOver) {
    result.isCombatOver = true;
    result.isPlayerDefeated = newPlayerHp <= 0;
    if (result.isPlayerDefeated) {
      result.deathCause = `${enemy.name}에게 전투에서 패배했다`;
    }
  }

  return result;
}
