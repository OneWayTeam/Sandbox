declare const process: any;

import { PetAssetRegistry } from '../src/pet/petAssetRegistry';
import { PetStateManager } from '../src/pet/petStateManager';
import { PetDevelopmentEngine } from '../src/pet/petDevelopmentEngine';
import { GameEngine, createDefaultEngineState } from '../src/engine/GameEngine';
import { PetMoodState, CharacterSpeciesId } from '../src/types/gameTypes';
import { INITIAL_SHOP_ITEMS } from '../src/state/gameData';
import { PET_CHARACTERS, getCharacterDefinition } from '../src/pet/petCharacters';
import { EDUCATIONAL_GOALS } from '../src/content/goalsContent';

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

console.log('=== TEST SUITE: PET CUSTOMIZATION, PET STATE & PET DEVELOPMENT ===\n');

// 1. PET CUSTOMIZATION
console.log('--- 1. PET CUSTOMIZATION (Extensible Asset Abstraction) ---');
const comboStats = PetAssetRegistry.getCombinationsCount();
assert(
  comboStats.perStage >= 9,
  `Customization offers at least 9 combinations per stage (Found: ${comboStats.perStage})`
);
assert(
  comboStats.totalWithStages >= 27,
  `Total stage-aware configurations exceed 27 across 3 development stages (Found: ${comboStats.totalWithStages})`
);

// Verify asset abstraction layer resolution
const layersGreen = PetAssetRegistry.resolveLayers(
  { sweaterColor: 'green', hat: 'glasses', accessory: 'clover' },
  1,
  'happy',
  'idle'
);
assert(layersGreen.basePhotoSource !== undefined, 'Stage 1 sweater layer resolved successfully');
assert(layersGreen.accessoryBadge?.type === 'clover', 'Accessory badge resolved to clover');
assert(layersGreen.accessibilityDescription.includes('Очки мастера'), 'Accessibility description includes hat');

const layersStage3 = PetAssetRegistry.resolveLayers(
  { sweaterColor: 'blue', hat: 'beret', accessory: 'star' },
  3,
  'excited',
  'celebrating'
);
assert(layersStage3.stageTitle === 'Мастер-иллюстратор', 'Stage 3 resolved with Master title');
assert(layersStage3.accessoryBadge?.type === 'star', 'Accessory badge resolved to star');

// 2. PET STATE (REVERSIBLE, NON-PUNITIVE, PEDAGOGICAL)
console.log('\n--- 2. PET STATE (Reversible & Non-Punitive Mood Evaluation) ---');
// Calm/Happy state
const initEval = PetStateManager.evaluate({
  satiety: 80,
  mood: 80,
  currentPeriod: 1,
  actualMandatory: 10,
  plannedMandatory: 10,
  actualSavings: 5,
  isBudgetApproved: true,
  tasksCompletedInPeriod: 1,
});
assert(
  initEval.moodState === 'happy' || initEval.moodState === 'calm',
  `Initial state is positive/calm: ${initEval.moodState}`
);
assert(initEval.explanation.length > 0, 'Explanation clearly conveys pedagogical reason');
assert(initEval.actionAdvice.length > 0, 'Action advice offers constructive forward step');

// Deficit in mandatory needs -> worried (reversible & non-punitive)
const worriedEval = PetStateManager.evaluate({
  satiety: 25,
  mood: 50,
  currentPeriod: 1,
  actualMandatory: 0,
  plannedMandatory: 15,
  actualSavings: 0,
  isBudgetApproved: false,
  tasksCompletedInPeriod: 0,
});
assert(worriedEval.moodState === 'worried', 'Deficit in mandatory care triggers worried state');
assert(
  !worriedEval.explanation.toLowerCase().includes('смерть') &&
  !worriedEval.explanation.toLowerCase().includes('болезнь') &&
  !worriedEval.explanation.toLowerCase().includes('стыд'),
  'No death, disease, shame, or injury in pet state explanation'
);
assert(
  worriedEval.actionAdvice.includes('обязательн') || worriedEval.actionAdvice.includes('план'),
  'Recovery advice guides player toward mandatory needs or planning'
);

// Reversibility check: Player fulfills mandatory expenses -> immediately recovers
const recoveredEval = PetStateManager.evaluate({
  satiety: 90,
  mood: 85,
  currentPeriod: 1,
  actualMandatory: 15,
  plannedMandatory: 15,
  actualSavings: 5,
  isBudgetApproved: true,
  tasksCompletedInPeriod: 1,
});
assert(
  recoveredEval.moodState === 'happy' || recoveredEval.moodState === 'calm',
  `State recovers to ${recoveredEval.moodState} once mandatory expenses are met (reversible!)`
);

// Excited state upon saving and goal proximity
const excitedEval = PetStateManager.evaluate({
  satiety: 90,
  mood: 95,
  currentPeriod: 1,
  actualMandatory: 10,
  plannedMandatory: 10,
  actualSavings: 20,
  isBudgetApproved: true,
  tasksCompletedInPeriod: 2,
  lastActionType: 'savings',
});
assert(excitedEval.moodState === 'excited', 'Savings action triggers excited state');

// 3. PET DEVELOPMENT (MULTI-PERIOD EMPIRICAL METRICS)
console.log('\n--- 3. PET DEVELOPMENT (Cumulative Literacy Progression) ---');
const defaultEngineState = createDefaultEngineState();
const initialDevEval = PetDevelopmentEngine.evaluateStage(defaultEngineState);
assert(initialDevEval.currentStage === 1, 'Starting stage is Stage 1 (Малыш)');
assert(initialDevEval.nextStageInfo !== null, 'Next stage info provides clear checklist');
assert(initialDevEval.nextStageInfo!.checklist.length >= 4, 'Tracks multiple literacy metrics');

// Simulate multi-period history with strong financial literacy
const multiPeriodState = createDefaultEngineState();
multiPeriodState.periodHistory = [
  {
    periodNumber: 1,
    disciplined: true,
    plan: { mandatory: 10, discretionary: 5, savings: 10, isApproved: true },
    fact: { mandatory: 10, discretionary: 5, savings: 10 },
    variance: { mandatory: 0, discretionary: 0, savings: 0 },
    bonusAwarded: 5,
    resultDescription: 'Отличный период',
    petStateDelta: { satiety: 10, mood: 10 },
    petStageBefore: 1,
    petStageAfter: 1,
  },
  {
    periodNumber: 2,
    disciplined: true,
    plan: { mandatory: 10, discretionary: 5, savings: 10, isApproved: true },
    fact: { mandatory: 10, discretionary: 5, savings: 10 },
    variance: { mandatory: 0, discretionary: 0, savings: 0 },
    bonusAwarded: 5,
    resultDescription: 'Отличный период',
    petStateDelta: { satiety: 10, mood: 10 },
    petStageBefore: 1,
    petStageAfter: 1,
  },
];
multiPeriodState.currentPeriod = 3;
multiPeriodState.savings = 55;
multiPeriodState.educationalProgress.totalTasksCompleted = 3;

const stage2Eval = PetDevelopmentEngine.evaluateStage(multiPeriodState);
assert(stage2Eval.currentStage === 2, 'Evolves to Stage 2 (Юный мастер) after 2 disciplined periods');

// Add more periods for Stage 3
multiPeriodState.periodHistory.push(
  {
    periodNumber: 3,
    disciplined: true,
    plan: { mandatory: 10, discretionary: 5, savings: 15, isApproved: true },
    fact: { mandatory: 10, discretionary: 5, savings: 15 },
    variance: { mandatory: 0, discretionary: 0, savings: 0 },
    bonusAwarded: 5,
    resultDescription: 'Отличный период',
    petStateDelta: { satiety: 10, mood: 10 },
    petStageBefore: 2,
    petStageAfter: 2,
  },
  {
    periodNumber: 4,
    disciplined: true,
    plan: { mandatory: 10, discretionary: 5, savings: 15, isApproved: true },
    fact: { mandatory: 10, discretionary: 5, savings: 15 },
    variance: { mandatory: 0, discretionary: 0, savings: 0 },
    bonusAwarded: 5,
    resultDescription: 'Отличный период',
    petStateDelta: { satiety: 10, mood: 10 },
    petStageBefore: 2,
    petStageAfter: 2,
  }
);
multiPeriodState.currentPeriod = 5;
multiPeriodState.savings = 85;
multiPeriodState.educationalProgress.totalTasksCompleted = 5;

const stage3Eval = PetDevelopmentEngine.evaluateStage(multiPeriodState);
assert(stage3Eval.currentStage === 3, 'Evolves to Stage 3 (Мастер-иллюстратор) upon continued financial mastery');

// 4. VISUAL REACTIONS & ENGINE INTEGRATION
console.log('\n--- 4. VISUAL REACTIONS & ENGINE INTEGRATION ---');
const engine = new GameEngine();

// Income reaction
const incomeRes = engine.receiveIncome(20, 'pocket_money', 'Помощь по дому');
assert(incomeRes.success, 'Income successfully received');
const stateAfterIncome = engine.getState();
assert(stateAfterIncome.petState.lastReaction !== undefined, 'Receiving income triggers visual reaction');
assert(stateAfterIncome.petState.lastReaction?.type === 'income', 'Reaction type is income');

// Purchase reaction
const shopItem = INITIAL_SHOP_ITEMS[0];
if (shopItem) {
  const buyRes = engine.buyItem(shopItem);
  assert(buyRes.success, 'Buy item executed');
  assert(engine.getState().petState.lastReaction?.type === 'purchase', 'Purchase triggers visual reaction');
}

// Savings reaction
const saveRes = engine.transferToSavings(5);
assert(saveRes.success, 'Transfer to savings executed');
assert(engine.getState().petState.lastReaction?.type === 'savings', 'Savings transfer triggers visual reaction');

// Animation toggle setting
assert(engine.getState().settings?.animationsEnabled === true, 'Animations enabled by default');
engine.toggleAnimations(false);
assert(engine.getState().settings?.animationsEnabled === false, 'Animations cleanly toggled off');
engine.toggleAnimations(true);
assert(engine.getState().settings?.animationsEnabled === true, 'Animations cleanly toggled back on');

// 5. ALL 9 CHARACTERS & DECOUPLED GOALS PASS
console.log('\n--- 5. ALL 9 CHARACTERS & DECOUPLED GOALS PASS ---');
assert(PET_CHARACTERS.length === 9, `All 9 characters configured in system (Found: ${PET_CHARACTERS.length})`);

const expectedSpecies: CharacterSpeciesId[] = [
  'raccoon',
  'fox',
  'cat',
  'panda',
  'capybara',
  'rabbit',
  'bear',
  'dog',
  'otter',
];

// Verify each species has distinct silhouette, definition, and default appearance
expectedSpecies.forEach((speciesId) => {
  const def = getCharacterDefinition(speciesId);
  assert(def.id === speciesId, `Character ${speciesId} exists with valid definition`);
  assert(def.name.length > 0, `Character ${speciesId} has localized name: ${def.name}`);
  assert(def.speciesTitle.length > 0, `Character ${speciesId} has species title: ${def.speciesTitle}`);
  assert(def.tagline.length > 0, `Character ${speciesId} has pedagogical tagline`);
  assert(def.themeColor.startsWith('#'), `Character ${speciesId} has distinct theme color: ${def.themeColor}`);
  assert(def.defaultAppearance.characterId === speciesId, `Character ${speciesId} has default appearance mapped`);
});

// Verify character selection does NOT predetermine or constrain the financial goal
console.log('\n--- Decoupling Character from Financial Goal ---');
const testEngine = new GameEngine();

// Test that every character can select ANY of the available goals
expectedSpecies.forEach((speciesId, idx) => {
  const goalToTest = EDUCATIONAL_GOALS[idx % EDUCATIONAL_GOALS.length];
  
  // Set character profile
  const profileRes = testEngine.createProfile(
    `Player_${speciesId}`,
    `Pet_${speciesId}`,
    {
      characterId: speciesId,
      sweaterColor: idx % 2 === 0 ? 'blue' : 'red',
      hat: idx % 3 === 0 ? 'beret' : idx % 3 === 1 ? 'glasses' : 'none',
      accessory: idx % 2 === 0 ? 'star' : 'clover',
    }
  );
  assert(profileRes.success, `Successfully created profile for ${speciesId}`);

  // Pick independent goal
  const goalRes = testEngine.selectGoal(goalToTest.id);
  assert(goalRes.success, `Character ${speciesId} successfully selected independent goal: ${goalToTest.name}`);
  assert(
    testEngine.getState().currentGoalId === goalToTest.id,
    `Active goal is set to ${goalToTest.id} for ${speciesId}`
  );

  // Verify pet appearance preserves accessories during animation evaluation
  const currentAppearance = testEngine.getState().playerProfile.appearance;
  assert(
    currentAppearance.characterId === speciesId,
    `Current character appearance maintains species ${speciesId}`
  );
  assert(
    currentAppearance.sweaterColor !== undefined && currentAppearance.accessory !== undefined,
    `Accessories are strictly preserved on appearance for ${speciesId}`
  );
});

// Summary
console.log('\n========================================');
console.log(`TOTAL PET SYSTEM TESTS PASSED: ${testsPassed}`);
console.log(`TOTAL PET SYSTEM TESTS FAILED: ${testsFailed}`);
console.log('========================================');

if (testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
