import {
  EDUCATIONAL_TASKS,
  EDUCATIONAL_SHOP_ITEMS,
  EDUCATIONAL_GOALS,
  calculateGoalEstimatedPeriods,
} from '../src/content';
import {
  validateEducationalContent,
  validateEducationalContentOrThrow,
  ContentValidationError,
} from '../src/content/contentValidator';

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

function runContentValidationTests() {
  console.log('--- STARTING DEMONSTRATION EDUCATIONAL CONTENT VALIDATION TESTS ---');

  // TEST 1: Production Content Integrity Check
  console.log('Test 1: Validating Production Educational Content');
  {
    const report = validateEducationalContent(
      EDUCATIONAL_TASKS,
      EDUCATIONAL_SHOP_ITEMS,
      EDUCATIONAL_GOALS
    );

    assert.strictEqual(report.isValid, true, 'Production content must pass validation without errors');
    assert.strictEqual(report.errors.length, 0, 'No errors allowed in production content');
    assert(report.stats.tasksCount >= 6, `Must have >= 6 tasks, got ${report.stats.tasksCount}`);
    assert(report.stats.shopItemsCount >= 8, `Must have >= 8 items, got ${report.stats.shopItemsCount}`);
    assert(report.stats.goalsCount >= 3, `Must have >= 3 goals, got ${report.stats.goalsCount}`);
    assert(report.stats.mandatoryItemsCount >= 3, 'Must have >= 3 mandatory items');
    assert(report.stats.discretionaryItemsCount >= 3, 'Must have >= 3 discretionary items');
    assert.strictEqual(report.stats.topicsCount, 3, 'Must cover 3 financial literacy topics');
    console.log(`✓ Test 1 passed: ${report.stats.tasksCount} tasks, ${report.stats.shopItemsCount} items, ${report.stats.goalsCount} goals verified`);
  }

  // TEST 2: Detection of Negative or Zero Prices
  console.log('Test 2: Rejecting Invalid / Negative Prices in Shop Items');
  {
    const corruptItems = JSON.parse(JSON.stringify(EDUCATIONAL_SHOP_ITEMS));
    corruptItems[0].price = -5; // Corrupt price

    const report = validateEducationalContent(EDUCATIONAL_TASKS, corruptItems, EDUCATIONAL_GOALS);
    assert.strictEqual(report.isValid, false, 'Must reject negative price');
    assert(report.errors.some((e) => e.includes('Price must be a strictly positive number')), 'Error message must specify price issue');

    let threw = false;
    try {
      validateEducationalContentOrThrow(EDUCATIONAL_TASKS, corruptItems, EDUCATIONAL_GOALS);
    } catch (e: any) {
      threw = true;
      assert(e instanceof ContentValidationError, 'Should throw ContentValidationError');
    }
    assert.strictEqual(threw, true, 'validateOrThrow must throw on corrupt price');
    console.log('✓ Test 2 passed: Invalid prices successfully blocked');
  }

  // TEST 3: Detection of Duplicate IDs
  console.log('Test 3: Rejecting Duplicate Entity IDs');
  {
    const corruptTasks = JSON.parse(JSON.stringify(EDUCATIONAL_TASKS));
    corruptTasks[1].id = corruptTasks[0].id; // Duplicate ID

    const report = validateEducationalContent(corruptTasks, EDUCATIONAL_SHOP_ITEMS, EDUCATIONAL_GOALS);
    assert.strictEqual(report.isValid, false, 'Must reject duplicate IDs');
    assert(report.errors.some((e) => e.includes('Duplicate ID')), 'Error must mention duplicate ID');
    console.log('✓ Test 3 passed: Duplicate IDs successfully detected');
  }

  // TEST 4: Detection of Negative Rewards or Missing Fields
  console.log('Test 4: Rejecting Missing Fields & Negative Rewards');
  {
    const corruptTasks = JSON.parse(JSON.stringify(EDUCATIONAL_TASKS));
    corruptTasks[0].reward = -10;
    corruptTasks[1].title = ''; // Empty title

    const report = validateEducationalContent(corruptTasks, EDUCATIONAL_SHOP_ITEMS, EDUCATIONAL_GOALS);
    assert.strictEqual(report.isValid, false, 'Must reject corrupt rewards and titles');
    assert(report.errors.some((e) => e.includes('Reward must be a non-negative number')), 'Must report reward error');
    assert(report.errors.some((e) => e.includes('Missing or empty title')), 'Must report empty title error');
    console.log('✓ Test 4 passed: Corrupt reward and empty fields caught');
  }

  // TEST 5: Honest Goal Time Horizon Estimation (No False Precision)
  console.log('Test 5: Honest Goal Horizon Calculation (Avoiding False Precision)');
  {
    const goal = { totalCost: 100, savedAmount: 20 };

    // Case A: No historical data, no planned savings -> must NOT fake a number
    const estimateNoData = calculateGoalEstimatedPeriods(goal, [], undefined);
    assert.strictEqual(estimateNoData.estimatedPeriods, null, 'Must be null when no empirical data');
    assert.strictEqual(estimateNoData.isReliable, false, 'Must be flagged as not reliable yet');
    assert(estimateNoData.displayText.includes('Расчёт появится после первых накоплений'), 'Friendly message without false precision');

    // Case B: With approved budget plan savings of 10/period
    const estimatePlanned = calculateGoalEstimatedPeriods(goal, [], 10);
    assert.strictEqual(estimatePlanned.estimatedPeriods, 8, '80 remaining / 10 planned = 8 periods');
    assert.strictEqual(estimatePlanned.isReliable, true, 'Reliable based on plan');

    // Case C: With empirical past savings history: [10, 30] -> avg = 20
    const estimateEmpirical = calculateGoalEstimatedPeriods(goal, [10, 30], 10);
    assert.strictEqual(estimateEmpirical.estimatedPeriods, 4, '80 remaining / 20 avg = 4 periods');

    // Case D: Goal completed
    const estimateCompleted = calculateGoalEstimatedPeriods({ totalCost: 100, savedAmount: 100 }, [20], 10);
    assert.strictEqual(estimateCompleted.estimatedPeriods, 0, '0 periods remaining');
    assert(estimateCompleted.displayText.includes('Цель достигнута'), 'Goal achieved message');

    console.log('✓ Test 5 passed: Goal estimation avoids false precision and computes honest timelines');
  }

  console.log('\n======================================================');
  console.log('ALL EDUCATIONAL CONTENT VALIDATION TESTS PASSED (5/5)!');
  console.log('======================================================\n');
}

runContentValidationTests();
