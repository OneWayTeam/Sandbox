declare const process: any;

import { GameEngine, createDefaultEngineState } from '../src/engine/GameEngine';
import { StorageManager } from '../src/storage/StorageManager';
import { INITIAL_SHOP_ITEMS, INITIAL_TASKS } from '../src/state/gameData';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    testsPassed++;
    console.log(`  ✓ ${message}`);
  } else {
    testsFailed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('=== TEST SUITE: STABILITY & QUALITY PASS ===\n');

// 1. CURRENCY & MATH INTEGRITY
console.log('--- 1. CURRENCY & MATH INTEGRITY ---');
const engine = new GameEngine();

// Boundary 1: Spending more than balance
const expensiveItem = INITIAL_SHOP_ITEMS.find((i) => i.price > 25);
assert(expensiveItem !== undefined, 'Found item more expensive than starting balance');
const failBuyRes = engine.buyItem(expensiveItem!);
assert(!failBuyRes.success, 'Spending more than balance is strictly rejected');
assert(engine.getState().balance === 25, 'Balance remains exactly 25 after rejected purchase');

// Boundary 2: Negative and non-finite inputs
const negIncomeRes = engine.receiveIncome(-50, 'hack', 'Отрицательный доход');
assert(!negIncomeRes.success, 'Negative income is strictly blocked');
const nanIncomeRes = engine.receiveIncome(NaN, 'hack', 'NaN доход');
assert(!nanIncomeRes.success, 'NaN income is strictly blocked');
const infIncomeRes = engine.receiveIncome(Infinity, 'hack', 'Infinity доход');
assert(!infIncomeRes.success, 'Infinity income is strictly blocked');

// Boundary 3: Negative budget planning
const negBudgetRes = engine.planBudget(-10, 5, 5);
assert(!negBudgetRes.success, 'Negative budget plan is strictly blocked');

// Boundary 4: Budget plan exceeding available capacity
const overBudgetRes = engine.confirmBudget(500, 200, 300);
assert(!overBudgetRes.success, 'Over-budget confirmation is strictly blocked');

// Boundary 5: Savings operations bounds
const negSaveRes = engine.transferToSavings(-10);
assert(!negSaveRes.success, 'Negative savings transfer is strictly blocked');
const overSaveRes = engine.transferToSavings(1000);
assert(!overSaveRes.success, 'Transferring more than wallet balance is strictly blocked');

// 2. RAPID CLICK & IDEMPOTENCY PROTECTION
console.log('\n--- 2. RAPID CLICK & IDEMPOTENCY PROTECTION ---');
// Rapid item purchase: non-consumable item
const uniqueItem = INITIAL_SHOP_ITEMS.find((i) => i.type === 'discretionary' && i.price <= 25);
assert(uniqueItem !== undefined, 'Found affordable unique item');
const firstBuy = engine.buyItem(uniqueItem!);
assert(firstBuy.success, 'First purchase of unique item succeeds');
const balanceAfterFirstBuy = engine.getState().balance;

// Simulate 5 rapid duplicate clicks
let duplicateAccepted = 0;
for (let i = 0; i < 5; i++) {
  const dupBuy = engine.buyItem(uniqueItem!);
  if (dupBuy.success) duplicateAccepted++;
}
assert(duplicateAccepted === 0, 'All 5 rapid duplicate purchases are rejected');
assert(engine.getState().balance === balanceAfterFirstBuy, 'Balance was not deducted multiple times');

// Rapid task completion & reward claiming
const testTask = engine.getState().tasks[0];
const taskOption = testTask.options[0];
const firstTaskRes = engine.completeTask(testTask.id, taskOption.id);
assert(firstTaskRes.success, 'First task completion succeeds');
const balanceAfterTask = engine.getState().balance;

let duplicateTaskAccepted = 0;
for (let i = 0; i < 5; i++) {
  const dupTask = engine.completeTask(testTask.id, taskOption.id);
  if (dupTask.success) duplicateTaskAccepted++;
}
assert(duplicateTaskAccepted === 0, 'All 5 rapid duplicate task completions are blocked');
assert(engine.getState().balance === balanceAfterTask, 'Task reward was only credited once');

// Rapid withdrawal bounds
const currentSavings = engine.getState().savings;
const withdrawOverRes = engine.withdrawFromSavings(currentSavings + 100);
assert(!withdrawOverRes.success, 'Cannot withdraw more than saved');
const withdrawZeroRes = engine.withdrawFromSavings(0);
assert(!withdrawZeroRes.success, 'Cannot withdraw 0 coins');
const withdrawNegRes = engine.withdrawFromSavings(-10);
assert(!withdrawNegRes.success, 'Cannot withdraw negative coins');

// 3. PROFILE INPUT RESILIENCE
console.log('\n--- 3. PROFILE INPUT RESILIENCE ---');
const profEngine = new GameEngine();

// Empty name fallback
profEngine.createProfile('', '', { sweaterColor: 'green', hat: 'none', accessory: 'clover' });
assert(
  profEngine.getState().playerProfile.playerName === 'Юный финансист',
  'Empty player name safely falls back to default'
);
assert(
  profEngine.getState().playerProfile.petName === 'Финни',
  'Empty pet name safely falls back to default'
);

// Whitespace-only name fallback
profEngine.createProfile('     ', '    ', { sweaterColor: 'blue', hat: 'beret', accessory: 'star' });
assert(
  profEngine.getState().playerProfile.playerName === 'Юный финансист',
  'Whitespace player name safely falls back to default'
);
assert(
  profEngine.getState().playerProfile.petName === 'Финни',
  'Whitespace pet name safely falls back to default'
);

// Special characters and numbers
profEngine.createProfile('Алиса #1 (Супер-Звезда)', 'Финни-2026!', {
  sweaterColor: 'red',
  hat: 'glasses',
  accessory: 'brush',
});
assert(
  profEngine.getState().playerProfile.playerName.includes('Алиса #1'),
  'Player name with numbers and symbols accepted safely'
);
assert(
  profEngine.getState().playerProfile.petName === 'Финни-2026!',
  'Pet name with symbols accepted safely'
);

// 4. DEMO MODE ISOLATION & DETERMINISM
console.log('\n--- 4. DEMO MODE ISOLATION & RESET ---');
const demoState1 = StorageManager.createDeterministicDemoState();
assert(demoState1.demoModeState === true, 'Demo state marks demoModeState as true');
assert(demoState1.balance === 25, 'Demo state starting balance is 25');
assert(demoState1.currentPeriod === 1, 'Demo state starts at Period 1');

// Play through demo periods
const demoEngine = new GameEngine(demoState1);
demoEngine.confirmBudget(10, 5, 10);
const p1Finish = demoEngine.finishPeriod();
assert(p1Finish.success, 'Demo period 1 finished');
assert(demoEngine.getState().currentPeriod === 2, 'Advanced to period 2 in demo');
const p2Finish = demoEngine.finishPeriod();
assert(p2Finish.success, 'Demo period 2 finished');
assert(demoEngine.getState().currentPeriod === 3, 'Advanced to period 3 in demo');

// Reset demo state
const resetDemoState = StorageManager.createDeterministicDemoState();
assert(resetDemoState.currentPeriod === 1, 'Reset demo state is back to Period 1');
assert(resetDemoState.periodHistory.length === 0, 'Reset demo state has clean history');
assert(resetDemoState.purchasedItemIds.length === 0, 'Reset demo state has 0 purchases');

// 5. STORAGE RESTORATION & CORRUPTION DEFENSE
console.log('\n--- 5. STORAGE RESTORATION & CORRUPTION DEFENSE ---');
const resilientEngine = new GameEngine();
const corruptJson = '{"balance": "NOT_A_NUMBER", "broken": true}';
const restoreResult = resilientEngine.restoreSnapshot(corruptJson);
assert(!restoreResult, 'Corrupted snapshot string safely rejected by engine');
assert(resilientEngine.getState().balance === 25, 'Engine state untouched after failed restore');

const invalidJson = 'THIS IS NOT JSON AT ALL';
const invalidResult = resilientEngine.restoreSnapshot(invalidJson);
assert(!invalidResult, 'Non-JSON string safely rejected without crash');

// Summary
console.log('\n========================================');
console.log(`TOTAL STABILITY TESTS PASSED: ${testsPassed}`);
console.log(`TOTAL STABILITY TESTS FAILED: ${testsFailed}`);
console.log('========================================');

if (testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
