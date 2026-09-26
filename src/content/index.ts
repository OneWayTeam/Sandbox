import { EDUCATIONAL_TASKS, EducationalTask } from './tasksContent';
import { EDUCATIONAL_SHOP_ITEMS, EducationalShopItem } from './shopContent';
import { EDUCATIONAL_GOALS, EducationalGoal, calculateGoalEstimatedPeriods } from './goalsContent';
import { validateEducationalContentOrThrow, ValidationReport } from './contentValidator';

// Execute validation immediately when module loads
// If content is corrupted or violates rules, application immediately halts with diagnostic report
export const CONTENT_VALIDATION_REPORT: ValidationReport = validateEducationalContentOrThrow(
  EDUCATIONAL_TASKS,
  EDUCATIONAL_SHOP_ITEMS,
  EDUCATIONAL_GOALS
);

export {
  EDUCATIONAL_TASKS,
  EducationalTask,
  EDUCATIONAL_SHOP_ITEMS,
  EducationalShopItem,
  EDUCATIONAL_GOALS,
  EducationalGoal,
  calculateGoalEstimatedPeriods,
};
