import { GameEngine } from '../src/engine/GameEngine';
import { StorageManager, STORAGE_KEYS } from '../src/storage/StorageManager';
import { INITIAL_SHOP_ITEMS, INITIAL_TASKS, INITIAL_GOALS } from '../src/state/gameData';
import { PetDevelopmentEngine } from '../src/pet/petDevelopmentEngine';

declare const process: any;

let passed = 0;
let failed = 0;

function assert(cond: boolean, msg: string) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${msg}`);
  }
}

// In-memory mock storage
const mockStore: Record<string, string> = {};
const testStorageBackend = {
  getItem: async (key: string) => mockStore[key] || null,
  setItem: async (key: string, value: string) => { mockStore[key] = value; },
  removeItem: async (key: string) => { delete mockStore[key]; },
  multiRemove: async (keys: string[]) => { keys.forEach((k) => delete mockStore[k]); },
};

StorageManager.setBackend(testStorageBackend);

async function runFullWalkthrough() {
  console.log('=== COMPLETE E2E USER LIFECYCLE WALKTHROUGH ===\n');

  // STEP 1: ПЕРВЫЙ ЗАПУСК (Fresh install, no state in storage)
  console.log('--- STEP 1: FRESH APP START ---');
  const freshLoad = await StorageManager.load();
  assert(freshLoad.isFreshInstall === true, 'Fresh app start detects no previous data');
  const engine = new GameEngine(freshLoad.state);
  assert(engine.getState().balance === 25, 'Starting baseline pocket money is 25 coins');
  assert(engine.getState().currentPeriod === 1, 'Initial period is Period 1');
  assert(engine.getState().petDevelopmentStage === 1, 'Initial pet stage is Stage 1 (Малыш)');

  // STEP 2 & 3: СОЗДАНИЕ ПРОФИЛЯ И ВНЕШНОСТИ ПИТОМЦА
  console.log('\n--- STEP 2 & 3: PROFILE CREATION & PET CUSTOMIZATION ---');
  const profRes = engine.createProfile('Алиса-Финансист #1', 'Финни-Звёздочка', {
    sweaterColor: 'blue',
    accessory: 'brush',
    hat: 'beret',
  });
  assert(profRes.success, 'Profile created successfully');
  assert(engine.getState().playerProfile.playerName === 'Алиса-Финансист #1', 'Player name saved');
  assert(engine.getState().playerProfile.petName === 'Финни-Звёздочка', 'Pet name saved');
  assert(engine.getState().petCustomization.sweaterColor === 'blue', 'Sweater color applied');
  assert(engine.getState().petCustomization.hat === 'beret', 'Hat applied');
  assert(engine.getState().petCustomization.accessory === 'brush', 'Accessory applied');

  // STEP 4 & 5: СТАРТОВЫЙ БЮДЖЕТ И ПЛАНИРОВАНИЕ
  console.log('\n--- STEP 4 & 5: BUDGET PLANNING & ALLOCATION ---');
  // Boundary check: cannot plan budget exceeding available capacity
  const invalidBudget = engine.confirmBudget(50, 50, 50);
  assert(!invalidBudget.success, 'Excessive budget plan (> available) is rejected');

  // Valid budget plan: mandatory 10, optional 5, savings 10 (total 25)
  const budgetRes = engine.confirmBudget(10, 5, 10);
  assert(budgetRes.success, 'Valid budget plan (10 / 5 / 10) confirmed');
  assert(engine.getState().isBudgetApproved, 'Budget plan is approved');
  assert(engine.getState().plannedMandatory === 10, 'Planned mandatory is 10');
  assert(engine.getState().plannedSavings === 10, 'Planned savings is 10');

  // STEP 6 & 7: ЗАДАНИЕ И НАГРАДА
  console.log('\n--- STEP 6 & 7: TASK COMPLETION & REWARD ---');
  const task = engine.getState().tasks[0];
  const option = task.options[0]; // Wise option
  const balBeforeTask = engine.getState().balance;
  const taskRes = engine.completeTask(task.id, option.id);
  assert(taskRes.success, 'Task completed successfully');
  assert(engine.getState().balance === balBeforeTask + option.rewardChange, 'Reward added to wallet');
  assert(task.completed, 'Task marked as completed');

  // Idempotency: duplicate completion rejected
  const dupTaskRes = engine.completeTask(task.id, option.id);
  assert(!dupTaskRes.success, 'Duplicate task completion strictly rejected');

  // STEP 8: ПОКУПКА
  console.log('\n--- STEP 8: PURCHASES (MANDATORY & DISCRETIONARY) ---');
  // 1. Mandatory purchase (food)
  const carrot = INITIAL_SHOP_ITEMS.find((i) => i.id === 'food_carrot')!;
  const balBeforeCarrot = engine.getState().balance;
  const buyCarrotRes = engine.buyItem(carrot);
  assert(buyCarrotRes.success, 'Mandatory carrot purchase succeeds');
  assert(engine.getState().balance === balBeforeCarrot - carrot.price, 'Carrot cost deducted');
  assert(engine.getState().actualMandatory === carrot.price, 'Actual mandatory fact updated');

  // 2. Discretionary purchase (scarf)
  const scarf = INITIAL_SHOP_ITEMS.find((i) => i.id === 'clothes_scarf')!;
  const buyScarfRes = engine.buyItem(scarf);
  assert(buyScarfRes.success, 'Unique discretionary scarf purchase succeeds');
  assert(engine.getState().purchasedItemIds.includes('clothes_scarf'), 'Scarf added to inventory');

  // Duplicate purchase of unique item rejected
  const dupScarfRes = engine.buyItem(scarf);
  assert(!dupScarfRes.success, 'Duplicate purchase of unique item rejected');

  // Insufficient funds check
  const expensive = INITIAL_SHOP_ITEMS.find((i) => i.price > 100);
  if (expensive) {
    const buyExpRes = engine.buyItem(expensive);
    assert(!buyExpRes.success, 'Cannot buy items exceeding balance');
  }

  // STEP 9 & 10: НАКОПЛЕНИЯ И ЦЕЛЬ
  console.log('\n--- STEP 9 & 10: SAVINGS & GOAL ACCUMULATION ---');
  const initialGoal = engine.getCurrentGoal()!;
  assert(initialGoal !== undefined, 'Active goal exists');
  const goalSavedBefore = initialGoal.savedAmount;
  const depositRes = engine.transferToSavings(10);
  assert(depositRes.success, 'Transferred 10 coins into savings');
  assert(engine.getState().savings >= 10, 'Savings balance updated');
  assert(engine.getState().actualSavings === 10, 'Actual savings fact updated');
  assert(engine.getCurrentGoal()!.savedAmount === goalSavedBefore + 10, 'Goal savedAmount updated');

  // Cannot transfer more than wallet balance
  const excessiveDeposit = engine.transferToSavings(1000);
  assert(!excessiveDeposit.success, 'Cannot deposit more than wallet balance');

  // STEP 11 & 12: ЗАВЕРШЕНИЕ ПЕРИОДА И РАЗВИТИЕ ПИТОМЦА
  console.log('\n--- STEP 11 & 12: FINISH PERIOD & DISCIPLINE BONUS ---');
  const finishP1 = engine.finishPeriod();
  assert(finishP1.success, 'Period 1 completed cleanly');
  assert(finishP1.data!.disciplined === true, 'Discipline bonus earned (covered mandatory + saved)');
  assert(finishP1.data!.bonusAwarded === 15, '15 bonus coins awarded');
  assert(engine.getState().currentPeriod === 2, 'Game advanced to Period 2');
  assert(engine.getState().periodHistory.length === 1, 'Period 1 summary recorded in history');

  // Complete period 2 with discipline to trigger evolution
  console.log('\n--- STEP 12b: EVOLUTION TO STAGE 2 (ЮНЫЙ МАСТЕР) ---');
  engine.confirmBudget(10, 5, 10);
  const finishP2 = engine.finishPeriod();
  assert(finishP2.success, 'Period 2 completed cleanly');
  assert(engine.getState().currentPeriod === 3, 'Game advanced to Period 3');
  assert(engine.getState().petDevelopmentStage === 2, 'Pet evolved to Stage 2 (Юный мастер)');

  // STEP 13 & 14: ЗАКРЫТИЕ И ПОВТОРНЫЙ ЗАПУСК (SAVE & RESTORE)
  console.log('\n--- STEP 13 & 14: APP CLOSE & RESTART PERSISTENCE ---');
  const savedOk = await StorageManager.save(engine.getState() as any);
  assert(savedOk, 'Game state saved to local storage');

  // Fresh load from storage
  const restored = await StorageManager.load();
  assert(!restored.isFreshInstall, 'Restored session is not fresh install');
  const restartedEngine = new GameEngine(restored.state);
  assert(restartedEngine.getState().playerProfile.playerName === 'Алиса-Финансист #1', 'Player name persisted');
  assert(restartedEngine.getState().petDevelopmentStage === 2, 'Pet Stage 2 persisted');
  assert(restartedEngine.getState().currentPeriod === 3, 'Period 3 persisted');
  assert(restartedEngine.getState().balance === engine.getState().balance, 'Balance matched exactly');
  assert(restartedEngine.getState().savings === engine.getState().savings, 'Savings matched exactly');
  assert(restartedEngine.getState().periodHistory.length === 2, '2 periods in history persisted');

  // STEP 15: РАЗДЕЛ ВЗРОСЛОГО, СБРОС И НОВЫЙ ПРОФИЛЬ
  console.log('\n--- STEP 15: ADULT ZONE, STORAGE WIPE & NEW PROFILE ---');
  await StorageManager.resetAllStorage();
  const wipedLoad = await StorageManager.load();
  assert(wipedLoad.isFreshInstall, 'Full wipe resets storage to fresh install');
  const freshEngine = new GameEngine(wipedLoad.state);
  assert(freshEngine.getState().currentPeriod === 1, 'Back to Period 1');
  assert(freshEngine.getState().periodHistory.length === 0, 'History is empty');
  assert(freshEngine.getState().purchasedItemIds.length === 0, 'Inventory is empty');

  // STEP 16: DEMO MODE MULTI-CYCLE VALIDATION
  console.log('\n--- STEP 16: DEMO MODE MULTI-RUN ISOLATION ---');
  for (let run = 1; run <= 3; run++) {
    const demoState = StorageManager.createDeterministicDemoState();
    assert(demoState.demoModeState === true, `Run ${run}: demoModeState is true`);
    assert(demoState.balance === 25, `Run ${run}: demo starting balance is 25`);
    const demoEng = new GameEngine(demoState);
    demoEng.confirmBudget(10, 5, 10);
    demoEng.finishPeriod();
    assert(demoEng.getState().currentPeriod === 2, `Run ${run}: advanced to period 2`);
    demoEng.finishPeriod();
    assert(demoEng.getState().currentPeriod === 3, `Run ${run}: advanced to period 3`);
  }
  console.log('✓ Demo mode multi-run clean and isolated');

  console.log('\n========================================');
  console.log(`TOTAL E2E WALKTHROUGH TESTS PASSED: ${passed}`);
  console.log(`TOTAL E2E WALKTHROUGH TESTS FAILED: ${failed}`);
  console.log('========================================');

  if (failed > 0) process.exit(1);
}

runFullWalkthrough();
