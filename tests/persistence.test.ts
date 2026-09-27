import { GameEngine } from '../src/engine/GameEngine';
import { StorageManager, STORAGE_KEYS, CURRENT_SCHEMA_VERSION } from '../src/storage/StorageManager';
import { INITIAL_SHOP_ITEMS } from '../src/state/gameData';

declare const require: any;
declare const process: any;

function assert(condition: any, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}
assert.strictEqual = (actual: any, expected: any, message?: string) => {
  if (actual !== expected) {
    throw new Error(`${message || 'Assertion failed'}: expected ${expected}, got ${actual}`);
  }
};

// In-memory mock AsyncStorage for test execution
const memoryStore: Record<string, string> = {};
const mockAsyncStorage = {
  getItem: async (key: string) => memoryStore[key] || null,
  setItem: async (key: string, value: string) => { memoryStore[key] = value; },
  removeItem: async (key: string) => { delete memoryStore[key]; },
  multiRemove: async (keys: string[]) => { keys.forEach((k) => delete memoryStore[k]); },
};

// Set StorageManager backend for test execution
StorageManager.setBackend(mockAsyncStorage);

async function runPersistenceTests() {
  console.log('--- STARTING LOCAL PERSISTENCE & DEMO MODE TESTS ---');

  // TEST 1: CREATE -> PLAY -> SAVE -> REOPEN -> VERIFY
  console.log('Test 1: Full Lifecycle Persistence (CREATE -> PLAY -> CLOSE -> REOPEN -> VERIFY)');
  {
    // Step 1: CREATE
    const engine1 = new GameEngine();
    engine1.createProfile('Матвей', 'Пушок', { sweaterColor: 'blue', accessory: 'brush', hat: 'beret' });
    assert.strictEqual(engine1.getState().playerProfile.playerName, 'Матвей');
    assert.strictEqual(engine1.getState().balance, 25);

    // Step 2: PLAY
    // Confirm budget
    engine1.confirmBudget(10, 5, 10);

    // Buy mandatory item
    const carrot = INITIAL_SHOP_ITEMS.find((i) => i.id === 'food_carrot')!;
    const buyRes = engine1.buyItem(carrot);
    assert.strictEqual(buyRes.success, true);

    // Complete task
    const task = engine1.getState().tasks[0];
    const taskRes = engine1.completeTask(task.id, task.options[0].id);
    assert.strictEqual(taskRes.success, true);

    // Transfer to savings
    const savRes = engine1.transferToSavings(10);
    assert.strictEqual(savRes.success, true);

    // Finish period
    const finishRes = engine1.finishPeriod();
    assert.strictEqual(finishRes.success, true);
    assert.strictEqual(engine1.getState().currentPeriod, 2);

    // Step 3: CLOSE APP (Simulate persistence save)
    const saved = await StorageManager.save(engine1.getState() as any);
    assert.strictEqual(saved, true, 'State must be successfully persisted');

    // Step 4: REOPEN APP (Fresh instance loading from storage)
    const loadResult = await StorageManager.load();
    assert.strictEqual(loadResult.isFreshInstall, false, 'Must not be fresh install');
    assert.strictEqual(loadResult.recoveredFromBackup, false, 'Should be active state');

    const engine2 = new GameEngine(loadResult.state);

    // Step 5: VERIFY STATE
    assert.strictEqual(engine2.getState().playerProfile.playerName, 'Матвей', 'Player name must persist');
    assert.strictEqual(engine2.getState().playerProfile.petName, 'Пушок', 'Pet name must persist');
    assert.strictEqual(engine2.getState().petCustomization.sweaterColor, 'blue', 'Sweater must persist');
    assert.strictEqual(engine2.getState().petCustomization.hat, 'beret', 'Hat must persist');
    assert.strictEqual(engine2.getState().currentPeriod, 2, 'Period 2 must persist');
    assert.strictEqual(engine2.getState().balance, engine1.getState().balance, 'Balance must match exactly');
    assert.strictEqual(engine2.getState().savings, engine1.getState().savings, 'Savings must match exactly');
    assert(engine2.getState().purchasedItemIds.includes('food_carrot'), 'Purchased item must remain in inventory');
    assert(engine2.getState().tasks[0].completed, 'Task completed status must persist');
    assert.strictEqual(engine2.getState().periodHistory.length, 1, 'Period history must persist');
    console.log('✓ Test 1 passed: State completely preserved across app restart');
  }

  // TEST 2: CORRUPTED ACTIVE STATE RECOVERY FROM BACKUP
  console.log('Test 2: Automatic Recovery from Corrupted Active State');
  {
    // Deliberately corrupt active envelope in storage
    memoryStore[STORAGE_KEYS.ACTIVE_ENVELOPE] = 'INVALID_CORRUPTED_JSON_DATA{{{{';

    // Attempt to load
    const loadResult = await StorageManager.load();
    assert.strictEqual(loadResult.recoveredFromBackup, true, 'Must automatically recover from rolling backup');
    assert.strictEqual(loadResult.state.playerProfile.playerName, 'Матвей', 'Backup state must be intact');
    console.log('✓ Test 2 passed: App survives active corruption and recovers from backup');
  }

  // TEST 3: LEGACY STATE MIGRATION
  console.log('Test 3: Safe Migration of Legacy Storage Schema');
  {
    // Clear modern v2 keys
    delete memoryStore[STORAGE_KEYS.ACTIVE_ENVELOPE];
    delete memoryStore[STORAGE_KEYS.BACKUP_ENVELOPE];

    // Put legacy v1 payload
    memoryStore[STORAGE_KEYS.LEGACY_V1] = JSON.stringify({
      coins: 48,
      savings: 60,
      period: 3,
      profile: {
        playerName: 'Лера',
        petName: 'Крош',
        stage: 2,
        appearance: { sweaterColor: 'red', accessory: 'star', hat: 'none' },
      },
      goals: [{ id: 'goal_paints', title: 'Краски', totalCost: 160, savedAmount: 50 }],
      tasks: [{ id: 'task_1', completed: true }],
    });

    const loadResult = await StorageManager.load();
    assert.strictEqual(loadResult.migrated, true, 'Legacy data must be migrated');
    assert.strictEqual(loadResult.state.balance, 48, 'Migrated balance must match');
    assert.strictEqual(loadResult.state.savings, 60, 'Migrated savings must match');
    assert.strictEqual(loadResult.state.currentPeriod, 3, 'Migrated period must match');
    assert.strictEqual(loadResult.state.playerProfile.playerName, 'Лера', 'Migrated name must match');
    console.log('✓ Test 3 passed: Legacy v1 storage safely migrated to modern v2 engine state');
  }

  // TEST 4: DETERMINISTIC DEMO PROFILE PRESET
  console.log('Test 4: Deterministic Demo Profile Preset');
  {
    const demoState = StorageManager.createDeterministicDemoState();
    assert.strictEqual(demoState.demoModeState, true, 'Demo mode flag must be true');
    assert.strictEqual(demoState.balance, 25, 'Demo balance must be 25');
    assert.strictEqual(demoState.savings, 35, 'Demo savings must be 35');
    assert.strictEqual(demoState.currentPeriod, 1, 'Demo period must be 1');
    assert(demoState.goals.length >= 3, 'At least 3 educational goals must be present');
    assert.strictEqual(demoState.tasks.length, 6, 'All 6 tasks must be present');
    assert.strictEqual(demoState.tasks.every((t) => !t.completed), true, 'All tasks must be ready to solve');
    console.log('✓ Test 4 passed: Deterministic demo profile is ready for jury evaluation');
  }

  // TEST 5: COMPLETE DATA WIPE
  console.log('Test 5: Complete Storage Wipe (Adult Zone Wipe Action)');
  {
    await StorageManager.resetAllStorage();
    assert.strictEqual(Object.keys(memoryStore).length, 0, 'All storage keys must be deleted');
    const freshLoad = await StorageManager.load();
    assert.strictEqual(freshLoad.isFreshInstall, true, 'Next load must be recognized as fresh install');
    console.log('✓ Test 5 passed: Full storage wipe executes cleanly');
  }

  console.log('\n======================================================');
  console.log('ALL LOCAL PERSISTENCE & DEMO MODE TESTS PASSED (5/5)!');
  console.log('======================================================\n');
}

runPersistenceTests().catch((e) => {
  console.error('Persistence test failed:', e);
  process.exit(1);
});
