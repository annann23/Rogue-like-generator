import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CharacterClass, ClassStats } from '@/constants/classes';
import type { SkillType } from '@/constants/skills';
import type { Relic } from '@/constants/relics';
import type { NPCRelations } from '@/constants/npcs';

export type GameScreen =
  | 'title'
  | 'survey'
  | 'stat-reveal'
  | 'character-select'
  | 'game'
  | 'death'
  | 'clear'
  | 'meta';

export type RoomType = 'combat' | 'event' | 'npc' | 'shop' | 'rest';

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
  randomSeed: string;
  skillUseCounts: Record<SkillType, number>;
  isAlive: boolean;
  deathCause: string | null;
}

export interface MetaState {
  legacyPoints: number;
  upgrades: string[];
  totalRuns: number;
  bestDepth: number;
}

interface GameStore {
  screen: GameScreen;
  run: RunState;
  meta: MetaState;
  npcRelations: NPCRelations;

  setScreen: (screen: GameScreen) => void;
  startNewRun: (classData: ClassStats, surveyResults: SurveyResult[], seed: string) => void;
  updateRun: (updates: Partial<RunState>) => void;
  applyHpChange: (delta: number) => void;
  applyGoldChange: (delta: number) => void;
  incrementSkillUse: (skill: SkillType) => void;
  addRelic: (relic: Relic) => void;
  setDepth: (depth: number) => void;
  setRoomType: (type: RoomType) => void;
  killPlayer: (cause: string) => void;
  updateNPCRelation: (npcId: string, familiarity: number, meetCount: number) => void;
  addLegacyPoints: (points: number) => void;
  purchaseUpgrade: (upgradeId: string, cost: number) => void;
  resetRun: () => void;
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
  randomSeed: '',
  skillUseCounts: { intelligence: 0, negotiation: 0, lockpick: 0, stealth: 0, strength: 0, arcane: 0 },
  isAlive: true,
  deathCause: null,
};

const DEFAULT_META: MetaState = {
  legacyPoints: 0,
  upgrades: [],
  totalRuns: 0,
  bestDepth: 0,
};

export const useGameState = create<GameStore>()(
  persist(
    (set) => ({
      screen: 'title',
      run: DEFAULT_RUN,
      meta: DEFAULT_META,
      npcRelations: {},

      setScreen: (screen) => set({ screen }),

      startNewRun: (classData, surveyResults, seed) => {
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

        // 스킬 보너스 적용
        for (const { stat, change } of statChanges) {
          if (stat in skills) {
            (skills as Record<string, number>)[stat] = Math.max(0, ((skills as Record<string, number>)[stat] || 0) + change);
          }
        }

        set({
          run: {
            ...DEFAULT_RUN,
            characterClass: classData.id,
            hp: maxHp,
            maxHp,
            atk: Math.max(1, classData.atk + atkBonus),
            def: Math.max(0, classData.def + defBonus),
            gold: Math.max(0, classData.startGold + goldBonus),
            mana: classData.mana ?? 0,
            maxMana: classData.mana ?? 0,
            skills,
            surveyResults,
            randomSeed: seed,
          },
        });
      },

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
            upgrades: [...state.meta.upgrades, upgradeId],
          },
        })),

      resetRun: () => set({ run: DEFAULT_RUN }),
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
