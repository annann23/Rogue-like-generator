import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CharacterClass, ClassStats } from '@/constants/classes';
import type { SkillType } from '@/constants/skills';
import type { Relic } from '@/constants/relics';
import type { NPCRelations } from '@/constants/npcs';
import type { LastWordEffect } from '@/hooks/useClaude';
import type { Item, EquipmentSlots } from '@/constants/items';
import type { PersonaTraitType } from '@/constants/storyFlags';

export interface Persona {
  name: string;
  pastLife: string;
  personality: string;
  alignment: 'benevolent' | 'neutral' | 'malevolent';
  birthNarrative: string;
  innateTraits: string[];
  traitType?: PersonaTraitType;
}

export type GameScreen =
  | 'title'
  | 'survey'
  | 'stat-reveal'
  | 'character-select'
  | 'game'
  | 'death'
  | 'clear'
  | 'meta';

export type RoomType = 'combat' | 'event' | 'npc' | 'shop' | 'rest' | 'ghost';

export interface Skills {
  intelligence: number;
  negotiation: number;
  lockpick: number;
  stealth: number;
  strength: number;
  arcane: number;
}

export interface SurveyAnswer {
  questionId: number;
  question: string;
  answer: string;
}

export interface StatChange {
  stat: string;
  change: number;
}

export interface SurveyResult {
  question: string;
  answer: string;
  interpretation: string;
  flavorText: string;
  statChanges: StatChange[];
  curseOrBlessing: 'good' | 'bad' | 'mixed' | 'curse';
}

export interface RunState {
  characterClass: CharacterClass | null;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  gold: number;
  mana: number;
  maxMana: number;
  skills: Skills;
  relics: Relic[];
  depth: number;
  roomType: RoomType | null;
  surveyAnswers: SurveyAnswer[];
  surveyResults: SurveyResult[];
  surveyFinalSummary: string;
  randomSeed: string;
  skillUseCounts: Record<SkillType, number>;
  isAlive: boolean;
  deathCause: string | null;
  mapFragments: number;
  eliteKills: number;
  ghostBattleWins: number;
  persona: Persona | null;
  lastWordEffect: LastWordEffect | null;
  items: Item[];
  equipment: EquipmentSlots;
  storyFlags: Record<string, boolean | number | string>;
}

export interface MetaState {
  legacyPoints: number;
  upgrades: Record<string, number>;
  totalRuns: number;
  totalClears: number;
  bestDepth: number;
}

interface GameStore {
  screen: GameScreen;
  run: RunState;
  meta: MetaState;
  npcRelations: NPCRelations;
  bgmTrack: string | null;

  setScreen: (screen: GameScreen) => void;
  setBgmTrack: (track: string | null) => void;
  startNewRun: (classData: ClassStats, surveyResults: SurveyResult[], seed: string, persona: Persona | null, lastWordEffect: LastWordEffect | null) => void;
  updateRun: (updates: Partial<RunState>) => void;
  applyHpChange: (delta: number) => void;
  applyGoldChange: (delta: number) => void;
  incrementSkillUse: (skill: SkillType) => void;
  addRelic: (relic: Relic) => void;
  setDepth: (depth: number) => void;
  setRoomType: (type: RoomType) => void;
  killPlayer: (cause: string) => void;
  clearRun: () => void;
  updateNPCRelation: (npcId: string, familiarity: number, meetCount: number) => void;
  addLegacyPoints: (points: number) => void;
  purchaseUpgrade: (upgradeId: string, cost: number) => void;
  resetRun: () => void;
  addMapFragment: () => void;
  addEliteKill: () => void;
  addGhostBattleWin: () => void;
  consumeLastWordEffect: () => void;
  addItem: (item: Item) => void;
  useItem: (itemIndex: number) => void;
  equipItem: (itemIndex: number) => void;
  unequipItem: (slot: 'weapon' | 'armor') => void;
  setStoryFlag: (key: string, value: boolean | number | string) => void;
  incrementStoryFlag: (key: string, by?: number) => void;
}

const DEFAULT_RUN: RunState = {
  characterClass: null,
  hp: 100,
  maxHp: 100,
  atk: 10,
  def: 5,
  gold: 30,
  mana: 0,
  maxMana: 0,
  skills: { intelligence: 0, negotiation: 0, lockpick: 0, stealth: 0, strength: 0, arcane: 0 },
  relics: [],
  depth: 0,
  roomType: null,
  surveyAnswers: [],
  surveyResults: [],
  surveyFinalSummary: '',
  randomSeed: '',
  skillUseCounts: { intelligence: 0, negotiation: 0, lockpick: 0, stealth: 0, strength: 0, arcane: 0 },
  isAlive: true,
  deathCause: null,
  mapFragments: 0,
  eliteKills: 0,
  ghostBattleWins: 0,
  persona: null,
  lastWordEffect: null,
  items: [],
  equipment: { weapon: null, armor: null },
  storyFlags: {},
};

const DEFAULT_META: MetaState = {
  legacyPoints: 0,
  upgrades: {},
  totalRuns: 0,
  totalClears: 0,
  bestDepth: 0,
};

export const useGameState = create<GameStore>()(
  persist(
    (set) => ({
      screen: 'title',
      run: DEFAULT_RUN,
      meta: DEFAULT_META,
      npcRelations: {},
      bgmTrack: null,

      setScreen: (screen) => set({ screen }),
      setBgmTrack: (track) => set({ bgmTrack: track }),

      startNewRun: (classData, surveyResults, seed, persona, lastWordEffect) =>
        set((state) => {
          const statChanges = surveyResults.flatMap(r => r.statChanges);
          let hpBonus = 0, atkBonus = 0, defBonus = 0, goldBonus = 0;

          for (const { stat, change } of statChanges) {
            if (stat === 'hp') hpBonus += change;
            if (stat === 'atk' || stat === 'attack') atkBonus += change;
            if (stat === 'def' || stat === 'defense') defBonus += change;
            if (stat === 'gold') goldBonus += change;
          }

          const maxHp = Math.max(10, classData.hp + hpBonus);
          const skills = { ...classData.skills };

          for (const { stat, change } of statChanges) {
            if (stat in skills) {
              (skills as Record<string, number>)[stat] = Math.max(0, ((skills as Record<string, number>)[stat] || 0) + change);
            }
          }

          const u = state.meta.upgrades;
          const finalMaxHp = Math.max(10, maxHp + (u['hp'] ?? 0) * 25);
          const finalAtk = Math.max(1, classData.atk + atkBonus + (u['atk'] ?? 0) * 4);
          const finalDef = Math.max(0, classData.def + defBonus + (u['def'] ?? 0) * 4);
          let finalGold = Math.max(0, classData.startGold + goldBonus + (u['gold'] ?? 0) * 25);

          const metaSkills = { ...skills };
          for (const skillId of ['intelligence', 'negotiation', 'stealth', 'strength', 'lockpick', 'arcane']) {
            if (u[skillId]) {
              (metaSkills as Record<string, number>)[skillId] =
                Math.min(5, ((metaSkills as Record<string, number>)[skillId] ?? 0) + u[skillId]);
            }
          }

          // 마지막 말 효과 즉시 적용 (gold_bonus, skill_up)
          if (lastWordEffect?.type === 'gold_bonus') {
            finalGold += 50;
          }
          if (lastWordEffect?.type === 'skill_up') {
            const skillKeys = ['intelligence', 'negotiation', 'stealth', 'strength', 'lockpick', 'arcane'];
            const randomSkill = skillKeys[Math.floor(Math.random() * skillKeys.length)];
            (metaSkills as Record<string, number>)[randomSkill] =
              Math.min(5, ((metaSkills as Record<string, number>)[randomSkill] ?? 0) + 1);
          }

          return {
            run: {
              ...DEFAULT_RUN,
              characterClass: classData.id,
              hp: finalMaxHp,
              maxHp: finalMaxHp,
              atk: finalAtk,
              def: finalDef,
              gold: finalGold,
              mana: classData.mana ?? 0,
              maxMana: classData.mana ?? 0,
              skills: metaSkills,
              surveyResults,
              randomSeed: seed,
              persona,
              // gold_bonus·skill_up는 이미 적용했으므로 null, 나머지는 유지
              lastWordEffect: (lastWordEffect?.type === 'none' || lastWordEffect?.type === 'gold_bonus' || lastWordEffect?.type === 'skill_up')
                ? null
                : lastWordEffect,
            },
          };
        }),

      updateRun: (updates) =>
        set((state) => ({ run: { ...state.run, ...updates } })),

      applyHpChange: (delta) =>
        set((state) => {
          const newHp = Math.min(state.run.maxHp, Math.max(0, state.run.hp + delta));
          return { run: { ...state.run, hp: newHp } };
        }),

      applyGoldChange: (delta) =>
        set((state) => ({
          run: { ...state.run, gold: Math.max(0, state.run.gold + delta) },
        })),

      incrementSkillUse: (skill) =>
        set((state) => {
          const newCounts = { ...state.run.skillUseCounts };
          newCounts[skill] = (newCounts[skill] || 0) + 1;
          const newSkills = { ...state.run.skills };

          // 3회 성공 시 자동 +1
          if (newCounts[skill] % 3 === 0) {
            newSkills[skill] = Math.min(5, (newSkills[skill] || 0) + 1);
          }

          return { run: { ...state.run, skillUseCounts: newCounts, skills: newSkills } };
        }),

      addRelic: (relic) =>
        set((state) => ({ run: { ...state.run, relics: [...state.run.relics, relic] } })),

      setDepth: (depth) =>
        set((state) => ({ run: { ...state.run, depth } })),

      setRoomType: (type) =>
        set((state) => ({ run: { ...state.run, roomType: type } })),

      killPlayer: (cause) =>
        set((state) => ({
          run: { ...state.run, isAlive: false, deathCause: cause },
          meta: {
            ...state.meta,
            totalRuns: state.meta.totalRuns + 1,
            bestDepth: Math.max(state.meta.bestDepth, state.run.depth),
            legacyPoints: state.meta.legacyPoints + 10 + state.run.depth * 3,
          },
        })),

      clearRun: () =>
        set((state) => ({
          meta: {
            ...state.meta,
            totalRuns: state.meta.totalRuns + 1,
            totalClears: state.meta.totalClears + 1,
            bestDepth: Math.max(state.meta.bestDepth, state.run.depth),
            legacyPoints: state.meta.legacyPoints + 80,
          },
        })),

      updateNPCRelation: (npcId, familiarity, meetCount) =>
        set((state) => ({
          npcRelations: {
            ...state.npcRelations,
            [npcId]: { ...state.npcRelations[npcId], familiarity, meetCount },
          },
        })),

      addLegacyPoints: (points) =>
        set((state) => ({
          meta: { ...state.meta, legacyPoints: state.meta.legacyPoints + points },
        })),

      purchaseUpgrade: (upgradeId, cost) =>
        set((state) => ({
          meta: {
            ...state.meta,
            legacyPoints: state.meta.legacyPoints - cost,
            upgrades: {
              ...state.meta.upgrades,
              [upgradeId]: (state.meta.upgrades[upgradeId] ?? 0) + 1,
            },
          },
        })),

      resetRun: () => set({ run: DEFAULT_RUN }),

      addMapFragment: () =>
        set((state) => ({
          run: { ...state.run, mapFragments: Math.min(3, state.run.mapFragments + 1) },
        })),

      addEliteKill: () =>
        set((state) => ({
          run: { ...state.run, eliteKills: state.run.eliteKills + 1 },
        })),

      addGhostBattleWin: () =>
        set((state) => ({
          run: { ...state.run, ghostBattleWins: state.run.ghostBattleWins + 1 },
        })),

      consumeLastWordEffect: () =>
        set((state) => ({ run: { ...state.run, lastWordEffect: null } })),

      addItem: (item) =>
        set((state) => ({
          run: { ...state.run, items: [...state.run.items, item] },
        })),

      useItem: (itemIndex) =>
        set((state) => {
          const item = state.run.items[itemIndex];
          if (!item || item.category !== 'consumable') return state;
          const newItems = state.run.items.filter((_, i) => i !== itemIndex);
          let hp = state.run.hp;
          let atk = state.run.atk;
          let def = state.run.def;
          let mana = state.run.mana;
          switch (item.effect.type) {
            case 'heal':
              hp = Math.min(state.run.maxHp, hp + item.effect.amount);
              break;
            case 'heal_full':
              hp = state.run.maxHp;
              break;
            case 'atk_up':
              atk += item.effect.amount;
              break;
            case 'def_up':
              def += item.effect.amount;
              break;
            case 'mana_up':
              mana = Math.min(state.run.maxMana, mana + item.effect.amount);
              break;
          }
          return { run: { ...state.run, hp, atk, def, mana, items: newItems } };
        }),

      equipItem: (itemIndex) =>
        set((state) => {
          const item = state.run.items[itemIndex];
          if (!item || item.category === 'consumable') return state;
          const slot = item.category as 'weapon' | 'armor';
          const oldEquipped = state.run.equipment[slot];

          let atk = state.run.atk;
          let def = state.run.def;

          // 기존 장비 효과 제거
          if (oldEquipped) {
            if (oldEquipped.effect.type === 'atk_up') atk -= oldEquipped.effect.amount;
            if (oldEquipped.effect.type === 'def_up') def -= oldEquipped.effect.amount;
          }
          // 새 장비 효과 적용
          if (item.effect.type === 'atk_up') atk += item.effect.amount;
          if (item.effect.type === 'def_up') def += item.effect.amount;

          // 인벤토리: 새 아이템 제거, 기존 장비 반납
          const newItems = state.run.items.filter((_, i) => i !== itemIndex);
          if (oldEquipped) newItems.push(oldEquipped);

          return {
            run: {
              ...state.run,
              atk,
              def,
              items: newItems,
              equipment: { ...state.run.equipment, [slot]: item },
            },
          };
        }),

      unequipItem: (slot) =>
        set((state) => {
          const item = state.run.equipment[slot];
          if (!item) return state;
          let atk = state.run.atk;
          let def = state.run.def;
          if (item.effect.type === 'atk_up') atk -= item.effect.amount;
          if (item.effect.type === 'def_up') def -= item.effect.amount;
          return {
            run: {
              ...state.run,
              atk,
              def,
              items: [...state.run.items, item],
              equipment: { ...state.run.equipment, [slot]: null },
            },
          };
        }),

      setStoryFlag: (key, value) =>
        set((state) => ({
          run: { ...state.run, storyFlags: { ...state.run.storyFlags, [key]: value } },
        })),

      incrementStoryFlag: (key, by = 1) =>
        set((state) => {
          const current = (state.run.storyFlags[key] as number) ?? 0;
          return {
            run: { ...state.run, storyFlags: { ...state.run.storyFlags, [key]: current + by } },
          };
        }),
    }),
    {
      name: 'dungeon-rpg-state',
      partialize: (state) => ({
        meta: state.meta,
        npcRelations: state.npcRelations,
      }),
    },
  ),
);
