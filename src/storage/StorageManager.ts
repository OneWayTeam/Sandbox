import AsyncStorage from '@react-native-async-storage/async-storage';
import { EngineState, createDefaultEngineState } from '../engine/GameEngine';
import { INITIAL_GOALS, INITIAL_TASKS } from '../state/gameData';

export const CURRENT_SCHEMA_VERSION = 2;

export interface IStorageBackend {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  multiRemove?(keys: string[]): Promise<void>;
}

let activeBackend: IStorageBackend = AsyncStorage;

export interface PersistedEnvelope {
  version: number;
  timestamp: number;
  state: EngineState;
}

export interface StorageLoadResult {
  state: EngineState;
  recoveredFromBackup: boolean;
  migrated: boolean;
  isFreshInstall: boolean;
  error?: string;
}

export const STORAGE_KEYS = {
  ACTIVE_ENVELOPE: '@finny_engine_envelope_v2',
  BACKUP_ENVELOPE: '@finny_engine_backup_v2',
  LEGACY_V1: '@finny_game_storage_v1',
  LEGACY_V2: '@finny_game_storage_v2',
};

export class StorageManager {
  public static setBackend(backend: IStorageBackend) {
    activeBackend = backend;
  }

  public static getBackend(): IStorageBackend {
    return activeBackend;
  }
  /**
   * Validate that state structure has all required fields and invariants
   */
  public static validateStateSchema(state: any): state is EngineState {
    if (!state || typeof state !== 'object') return false;

    // Check financial numbers
    if (typeof state.balance !== 'number' || isNaN(state.balance) || state.balance < 0) {
      return false;
    }
    if (typeof state.savings !== 'number' || isNaN(state.savings) || state.savings < 0) {
      return false;
    }
    if (typeof state.currentPeriod !== 'number' || isNaN(state.currentPeriod) || state.currentPeriod < 1) {
      return false;
    }

    // Check player profile
    if (!state.playerProfile || typeof state.playerProfile !== 'object') {
      return false;
    }
    if (typeof state.playerProfile.playerName !== 'string') {
      return false;
    }

    // Check pet vitals
    if (!state.petState || typeof state.petState !== 'object') {
      return false;
    }
    if (typeof state.petState.satiety !== 'number' || typeof state.petState.mood !== 'number') {
      return false;
    }

    // Check content arrays
    if (!Array.isArray(state.goals) || state.goals.length < 3) {
      return false;
    }
    if (!Array.isArray(state.tasks) || state.tasks.length < 6) {
      return false;
    }

    return true;
  }

  /**
   * Safe persistent save with automatic rolling backup
   */
  public static async save(state: EngineState): Promise<boolean> {
    try {
      if (!this.validateStateSchema(state)) {
        console.warn('Refusing to persist invalid state schema');
        return false;
      }

      const envelope: PersistedEnvelope = {
        version: CURRENT_SCHEMA_VERSION,
        timestamp: Date.now(),
        state: JSON.parse(JSON.stringify(state)),
      };

      const json = JSON.stringify(envelope);

      // Save active state
      await activeBackend.setItem(STORAGE_KEYS.ACTIVE_ENVELOPE, json);

      // Save backup snapshot
      await activeBackend.setItem(STORAGE_KEYS.BACKUP_ENVELOPE, json);

      return true;
    } catch (e) {
      console.warn('StorageManager.save failed', e);
      return false;
    }
  }

  /**
   * Safe persistent load with recovery from backup and schema migrations
   */
  public static async load(): Promise<StorageLoadResult> {
    try {
      // 1. Try reading active envelope v2
      const activeData = await activeBackend.getItem(STORAGE_KEYS.ACTIVE_ENVELOPE);
      if (activeData) {
        try {
          const envelope: PersistedEnvelope = JSON.parse(activeData);
          if (envelope && envelope.state && this.validateStateSchema(envelope.state)) {
            return {
              state: envelope.state,
              recoveredFromBackup: false,
              migrated: false,
              isFreshInstall: false,
            };
          }
        } catch {
          console.warn('Active state payload corrupted, attempting backup recovery...');
        }
      }

      // 2. If active envelope is corrupt or missing, try backup
      const backupData = await activeBackend.getItem(STORAGE_KEYS.BACKUP_ENVELOPE);
      if (backupData) {
        try {
          const envelope: PersistedEnvelope = JSON.parse(backupData);
          if (envelope && envelope.state && this.validateStateSchema(envelope.state)) {
            // Restore active state from backup
            await activeBackend.setItem(STORAGE_KEYS.ACTIVE_ENVELOPE, backupData);
            return {
              state: envelope.state,
              recoveredFromBackup: true,
              migrated: false,
              isFreshInstall: false,
            };
          }
        } catch {
          console.warn('Backup state corrupted as well');
        }
      }

      // 3. Try migrating legacy state v1 or v2 raw
      const legacyV2 = await activeBackend.getItem(STORAGE_KEYS.LEGACY_V2);
      const legacyV1 = await activeBackend.getItem(STORAGE_KEYS.LEGACY_V1);
      const rawLegacy = legacyV2 || legacyV1;

      if (rawLegacy) {
        try {
          const legacyObj = JSON.parse(rawLegacy);
          const migratedState = this.migrateLegacyState(legacyObj);
          if (migratedState && this.validateStateSchema(migratedState)) {
            await this.save(migratedState);
            return {
              state: migratedState,
              recoveredFromBackup: false,
              migrated: true,
              isFreshInstall: false,
            };
          }
        } catch (e) {
          console.warn('Failed to migrate legacy state', e);
        }
      }

      // 4. Fresh install or clean fallback
      const freshState = createDefaultEngineState();
      await this.save(freshState);
      return {
        state: freshState,
        recoveredFromBackup: false,
        migrated: false,
        isFreshInstall: true,
      };
    } catch (e: any) {
      console.warn('StorageManager.load fatal error, using safe default', e);
      const fallbackState = createDefaultEngineState();
      return {
        state: fallbackState,
        recoveredFromBackup: false,
        migrated: false,
        isFreshInstall: true,
        error: e?.message || 'Storage load error',
      };
    }
  }

  /**
   * Migrate older flat or partially-structured format to EngineState v2
   */
  public static migrateLegacyState(legacy: any): EngineState | null {
    if (!legacy || typeof legacy !== 'object') return null;

    const base = createDefaultEngineState();

    // Map player profile
    if (legacy.profile) {
      base.playerProfile.playerName = legacy.profile.playerName || base.playerProfile.playerName;
      base.playerProfile.petName = legacy.profile.petName || base.playerProfile.petName;
      base.playerProfile.onboardingCompleted = legacy.profile.onboardingCompleted ?? false;
      if (legacy.profile.appearance) {
        base.playerProfile.appearance = { ...legacy.profile.appearance };
        base.petCustomization = { ...legacy.profile.appearance };
      }
    }

    // Map balance & period
    if (typeof legacy.coins === 'number' && !isNaN(legacy.coins)) {
      base.balance = Math.max(0, legacy.coins);
    } else if (typeof legacy.balance === 'number') {
      base.balance = Math.max(0, legacy.balance);
    }

    if (typeof legacy.savings === 'number' && !isNaN(legacy.savings)) {
      base.savings = Math.max(0, legacy.savings);
    }

    if (typeof legacy.period === 'number' && legacy.period >= 1) {
      base.currentPeriod = legacy.period;
    } else if (typeof legacy.currentPeriod === 'number') {
      base.currentPeriod = legacy.currentPeriod;
    }

    // Map budget plan & fact
    if (legacy.budgetPlan) {
      base.plannedMandatory = legacy.budgetPlan.mandatory ?? 10;
      base.plannedOptional = legacy.budgetPlan.discretionary ?? 5;
      base.plannedSavings = legacy.budgetPlan.savings ?? 10;
      base.isBudgetApproved = legacy.budgetPlan.isApproved ?? false;
    }

    if (legacy.budgetFact) {
      base.actualMandatory = legacy.budgetFact.mandatory ?? 0;
      base.actualOptional = legacy.budgetFact.discretionary ?? 0;
      base.actualSavings = legacy.budgetFact.savings ?? 0;
    }

    // Map goals & tasks
    if (Array.isArray(legacy.goals) && legacy.goals.length > 0) {
      base.goals = base.goals.map((bg) => {
        const found = legacy.goals.find((lg: any) => lg.id === bg.id);
        if (found) {
          return { ...bg, savedAmount: typeof found.savedAmount === 'number' ? found.savedAmount : bg.savedAmount };
        }
        return bg;
      });
    }
    if (legacy.activeGoalId) {
      base.currentGoalId = legacy.activeGoalId;
    }

    if (Array.isArray(legacy.tasks) && legacy.tasks.length > 0) {
      base.tasks = base.tasks.map((bt) => {
        const found = legacy.tasks.find((lt: any) => lt.id === bt.id);
        if (found) {
          return { ...bt, completed: !!found.completed, userChoiceId: found.userChoiceId };
        }
        return bt;
      });
    }

    if (Array.isArray(legacy.purchasedItemIds)) {
      base.purchasedItemIds = legacy.purchasedItemIds;
    }

    // Map histories
    if (Array.isArray(legacy.periodSummaries)) {
      base.periodHistory = legacy.periodSummaries;
    }

    if (Array.isArray(legacy.transactions)) {
      base.incomeHistory = legacy.transactions.filter((t: any) => t.amount > 0);
      base.purchaseHistory = legacy.transactions.filter((t: any) => t.amount < 0);
    }

    return base;
  }

  /**
   * Deterministic Demo Profile generator for Expert Evaluation
   */
  public static createDeterministicDemoState(): EngineState {
    const goals = JSON.parse(JSON.stringify(INITIAL_GOALS));
    const tasks = JSON.parse(JSON.stringify(INITIAL_TASKS));

    // Preset 35 coins in paints goal to demonstrate progress bar
    if (goals[0]) {
      goals[0].savedAmount = 35;
    }

    return {
      playerProfile: {
        playerName: 'Юный финансист',
        petName: 'Финни',
        stage: 1,
        appearance: {
          sweaterColor: 'green',
          accessory: 'clover',
          hat: 'none',
        },
        onboardingCompleted: true,
      },
      petState: {
        satiety: 80,
        mood: 85,
        energy: 90,
        statusText: 'Демонстрационный режим готов к проверке сценариев жюри!',
      },
      petCustomization: {
        sweaterColor: 'green',
        accessory: 'clover',
        hat: 'none',
      },
      balance: 25,
      savings: 35,
      currentPeriod: 1,
      plannedMandatory: 10,
      plannedOptional: 5,
      plannedSavings: 10,
      isBudgetApproved: false,
      actualMandatory: 0,
      actualOptional: 0,
      actualSavings: 0,
      goals,
      currentGoalId: 'goal_paints',
      tasks,
      taskRewardsTotal: 0,
      claimedRewardIds: [],
      purchasedItemIds: [],
      purchaseHistory: [],
      incomeHistory: [
        {
          id: 'tx_demo_init',
          timestamp: 1774569600000, // Deterministic mock timestamp
          period: 1,
          type: 'income',
          title: 'Стартовый баланс демо-режима',
          amount: 25,
          source: 'demo_allowance',
          category: 'budget',
        },
      ],
      periodHistory: [],
      petDevelopmentStage: 1,
      educationalProgress: {
        totalTasksCompleted: 0,
        correctAnswersCount: 0,
        themesCompleted: [],
        achievementsUnlocked: [],
        literacyLevel: 'Новичок',
      },
      demoModeState: true,
      settings: {
        animationsEnabled: true,
      },
    };
  }

  /**
   * Reset all storage data completely (for adult section reset action)
   */
  public static async resetAllStorage(): Promise<void> {
    try {
      const keys = [
        STORAGE_KEYS.ACTIVE_ENVELOPE,
        STORAGE_KEYS.BACKUP_ENVELOPE,
        STORAGE_KEYS.LEGACY_V1,
        STORAGE_KEYS.LEGACY_V2,
      ];
      if (typeof activeBackend.multiRemove === 'function') {
        await activeBackend.multiRemove(keys);
      } else {
        await Promise.all(keys.map((k) => activeBackend.removeItem(k)));
      }
    } catch (e) {
      console.warn('StorageManager.resetAllStorage error', e);
    }
  }
}
