import { GameEngine, createDefaultEngineState } from '../src/engine/GameEngine';
import { INITIAL_SHOP_ITEMS } from '../src/state/gameData';

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

console.log('--- STARTING CORE GAME ENGINE ECONOMY UNIT TESTS ---');

// TEST 1: Недостаток денег (Insufficient funds)
{
  console.log('Test 1: Insufficient funds validation');
  const engine = new GameEngine();
  const initialBalance = engine.getState().balance; // 25
  const expensiveItem = INITIAL_SHOP_ITEMS.find((i) => i.price > initialBalance);
  assert(expensiveItem, 'Should find an item with price > initialBalance');

  const buyRes = engine.buyItem(expensiveItem!);
  assert.strictEqual(buyRes.success, false, 'Purchase should fail when balance < price');
  assert(buyRes.error?.includes('Не хватает'), 'Should return shortage error message');
  assert(buyRes.teachableMoment, 'Should produce a teachable moment explaining shortage');
  assert.strictEqual(engine.getState().balance, initialBalance, 'Balance must remain completely untouched on failure');
  console.log('✓ Test 1 passed: Insufficient funds properly rejected and explained');
}

// TEST 2: Точная трата всего баланса (Exact spending of entire balance)
{
  console.log('Test 2: Exact spending of entire balance');
  const engine = new GameEngine();
  // Set balance to exactly 25
  const cheapItem = INITIAL_SHOP_ITEMS.find((i) => i.id === 'food_carrot')!; // price 5
  // Buy 5 carrots (5 * 5 = 25)
  for (let i = 0; i < 5; i++) {
    const res = engine.buyItem(cheapItem);
    assert.strictEqual(res.success, true, `Carrot purchase ${i + 1} should succeed`);
  }
  assert.strictEqual(engine.getState().balance, 0, 'Balance must be exactly 0');

  // Attempting one more purchase with 0 balance
  const extraRes = engine.buyItem(cheapItem);
  assert.strictEqual(extraRes.success, false, 'Purchase with 0 balance must fail');
  assert.strictEqual(engine.getState().balance, 0, 'Balance cannot drop below 0');
  console.log('✓ Test 2 passed: Exact spending brings balance to 0 without negative balance');
}

// TEST 3: Накопление (Savings transfer)
{
  console.log('Test 3: Transfer to savings');
  const engine = new GameEngine();
  const startBalance = engine.getState().balance; // 25
  const startSavings = engine.getState().savings; // 35
  const activeGoal = engine.getCurrentGoal()!;
  const startGoalSaved = activeGoal.savedAmount;

  const depositRes = engine.transferToSavings(10);
  assert.strictEqual(depositRes.success, true, 'Deposit of 10 coins should succeed');
  assert.strictEqual(engine.getState().balance, startBalance - 10, 'Balance must decrease by exactly 10');
  assert.strictEqual(engine.getState().savings, startSavings + 10, 'Savings must increase by exactly 10');
  assert.strictEqual(engine.getState().actualSavings, 10, 'Actual savings for period must be tracked');
  assert.strictEqual(activeGoal.savedAmount, startGoalSaved + 10, 'Goal savedAmount must increase by 10');
  console.log('✓ Test 3 passed: Transfer to savings updates wallet, safe, and target goal');
}

// TEST 4: Снятие накоплений (Savings withdrawal)
{
  console.log('Test 4: Withdrawal from savings with warning');
  const engine = new GameEngine();
  const startBalance = engine.getState().balance;
  const startSavings = engine.getState().savings;
  const activeGoal = engine.getCurrentGoal()!;
  const startGoalSaved = activeGoal.savedAmount;

  const withdrawRes = engine.withdrawFromSavings(10);
  assert.strictEqual(withdrawRes.success, true, 'Withdrawal of 10 coins should succeed');
  assert.strictEqual(engine.getState().balance, startBalance + 10, 'Balance must increase by 10');
  assert.strictEqual(engine.getState().savings, startSavings - 10, 'Savings must decrease by 10');
  assert.strictEqual(activeGoal.savedAmount, startGoalSaved - 10, 'Goal savedAmount must decrease by 10');
  assert(withdrawRes.teachableMoment, 'Should produce pedagogical consequence note');

  // Attempting to withdraw more than goal has
  const excessiveRes = engine.withdrawFromSavings(9999);
  assert.strictEqual(excessiveRes.success, false, 'Excessive withdrawal must fail');
  console.log('✓ Test 4 passed: Withdrawal from savings returns money and warns of goal delay');
}

// TEST 5: Повторная покупка (Repeat purchase restriction)
{
  console.log('Test 5: Unique item duplicate purchase prevention');
  const engine = new GameEngine();
  engine.receiveIncome(100, 'test_income', 'Test allowance');
  const beretItem = INITIAL_SHOP_ITEMS.find((i) => i.id === 'clothes_beret')!;

  const firstBuy = engine.buyItem(beretItem);
  assert.strictEqual(firstBuy.success, true, 'First purchase of beret must succeed');

  const secondBuy = engine.buyItem(beretItem);
  assert.strictEqual(secondBuy.success, false, 'Duplicate purchase of unique clothing must be rejected');
  assert(secondBuy.error?.includes('уже приобретён'), 'Error must specify item is already owned');
  console.log('✓ Test 5 passed: Repeat purchase of unique items is blocked');
}

// TEST 6: Повторная награда (Repeat reward prevention)
{
  console.log('Test 6: Repeat reward claim prevention');
  const engine = new GameEngine();
  const task = engine.getState().tasks[0];
  const option = task.options[0];

  const firstClaim = engine.completeTask(task.id, option.id);
  assert.strictEqual(firstClaim.success, true, 'First task completion must succeed');

  const secondClaim = engine.completeTask(task.id, option.id);
  assert.strictEqual(secondClaim.success, false, 'Second task claim in same period must fail');
  assert(secondClaim.error?.includes('уже получена'), 'Error must prevent duplicate currency generation');
  console.log('✓ Test 6 passed: Duplicate task reward claims are strictly blocked');
}

// TEST 7: Завершение периода (Period completion & discipline calculation)
{
  console.log('Test 7: Period completion & discipline evaluation');
  const engine = new GameEngine();
  // Confirm budget: 10 mandatory, 5 discretionary, 10 savings
  engine.confirmBudget(10, 5, 10);

  // Fulfill mandatory and savings
  const carrot = INITIAL_SHOP_ITEMS.find((i) => i.id === 'food_carrot')!;
  engine.buyItem(carrot); // mandatory: 5
  engine.transferToSavings(5); // savings: 5

  const summaryRes = engine.finishPeriod();
  assert.strictEqual(summaryRes.success, true, 'Period finish must succeed');
  const summary = summaryRes.data!;

  assert.strictEqual(summary.periodNumber, 1, 'Summary must record period 1');
  assert.strictEqual(summary.disciplined, true, 'Should be disciplined when mandatory and savings fact > 0');
  assert.strictEqual(summary.bonusAwarded, 15, 'Disciplined player should receive max bonus 15');
  assert(summary.variance, 'Must compute plan-fact variance');
  assert(summary.petStateDelta, 'Must compute pet vitals impact');
  console.log('✓ Test 7 passed: Period finish calculates plan, fact, variance, and discipline bonus');
}

// TEST 8: Переход периода и стадии роста (Period advancement & pet growth)
{
  console.log('Test 8: Period advancement and growth stage');
  const engine = new GameEngine();
  assert.strictEqual(engine.getState().currentPeriod, 1);
  assert.strictEqual(engine.getState().petDevelopmentStage, 1);

  // Advance to period 2
  engine.finishPeriod();
  assert.strictEqual(engine.getState().currentPeriod, 2);
  assert.strictEqual(engine.getState().petDevelopmentStage, 1);

  // Advance to period 3 -> reaches Stage 2 (Юный мастер)
  engine.finishPeriod();
  assert.strictEqual(engine.getState().currentPeriod, 3);
  assert.strictEqual(engine.getState().petDevelopmentStage, 2, 'Period 3 must reach Stage 2');

  // Advance to period 5 -> reaches Stage 3 (Мастер-иллюстратор)
  engine.finishPeriod(); // period 4
  engine.finishPeriod(); // period 5
  assert.strictEqual(engine.getState().currentPeriod, 5);
  assert.strictEqual(engine.getState().petDevelopmentStage, 3, 'Period 5 must reach Stage 3');
  console.log('✓ Test 8 passed: Pet evolves across periods 1 -> 2 -> 3 (3 distinct stages)');
}

// TEST 9: Сброс профиля (Profile reset)
{
  console.log('Test 9: Profile reset');
  const engine = new GameEngine();
  engine.createProfile('Алиса', 'Снежок', { sweaterColor: 'red', accessory: 'star', hat: 'beret' });
  engine.receiveIncome(100, 'bonus', 'Bonus coins');
  assert.strictEqual(engine.getState().playerProfile.playerName, 'Алиса');

  engine.resetProfile();
  assert.strictEqual(engine.getState().playerProfile.playerName, 'Юный финансист');
  assert.strictEqual(engine.getState().balance, 25);
  assert.strictEqual(engine.getState().currentPeriod, 1);
  console.log('✓ Test 9 passed: Profile reset cleanly restores initial pristine state');
}

// TEST 10: Сохранение и восстановление состояния (State persistence snapshot)
{
  console.log('Test 10: State snapshot serialization & restoration');
  const engineA = new GameEngine();
  engineA.createProfile('Даня', 'Прыг', { sweaterColor: 'blue', accessory: 'brush', hat: 'glasses' });
  engineA.receiveIncome(45, 'task:1', 'Reward');
  engineA.transferToSavings(20);
  engineA.finishPeriod();

  const snapshot = engineA.getSnapshot();
  assert(typeof snapshot === 'string' && snapshot.length > 50, 'Snapshot must be a valid serialized string');

  const engineB = new GameEngine();
  const restored = engineB.restoreSnapshot(snapshot);
  assert.strictEqual(restored, true, 'Snapshot restoration must succeed');

  assert.strictEqual(engineB.getState().playerProfile.playerName, 'Даня');
  assert.strictEqual(engineB.getState().playerProfile.petName, 'Прыг');
  assert.strictEqual(engineB.getState().playerProfile.appearance.sweaterColor, 'blue');
  assert.strictEqual(engineB.getState().currentPeriod, engineA.getState().currentPeriod);
  assert.strictEqual(engineB.getState().balance, engineA.getState().balance);
  assert.strictEqual(engineB.getState().savings, engineA.getState().savings);
  assert.strictEqual(engineB.getState().periodHistory.length, 1);
  console.log('✓ Test 10 passed: State persists and restores completely without data loss');
}

console.log('\n========================================');
console.log('ALL 10 CORE GAME ENGINE UNIT TESTS PASSED!');
console.log('========================================\n');
