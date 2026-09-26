import { EducationalTask } from './tasksContent';
import { EducationalShopItem } from './shopContent';
import { EducationalGoal } from './goalsContent';

export interface ValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    tasksCount: number;
    shopItemsCount: number;
    goalsCount: number;
    mandatoryItemsCount: number;
    discretionaryItemsCount: number;
    topicsCount: number;
  };
}

export class ContentValidationError extends Error {
  public errors: string[];

  constructor(errors: string[]) {
    super(`Content Validation Failed with ${errors.length} error(s):\n- ${errors.join('\n- ')}`);
    this.name = 'ContentValidationError';
    this.errors = errors;
  }
}

export function validateEducationalContent(
  tasks: EducationalTask[],
  shopItems: EducationalShopItem[],
  goals: EducationalGoal[]
): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const seenIds = new Set<string>();

  // 1. VALIDATE TASKS
  if (!Array.isArray(tasks) || tasks.length < 6) {
    errors.push(`Tasks collection must contain at least 6 tasks, got ${tasks?.length ?? 0}`);
  }

  const topicsSeen = new Set<string>();

  (tasks || []).forEach((task, index) => {
    const prefix = `Task[${index} id=${task?.id || 'MISSING'}]`;

    if (!task) {
      errors.push(`${prefix}: Task item is null or undefined`);
      return;
    }

    // ID check
    if (!task.id || typeof task.id !== 'string' || task.id.trim().length === 0) {
      errors.push(`${prefix}: Missing or empty id`);
    } else if (seenIds.has(task.id)) {
      errors.push(`${prefix}: Duplicate ID '${task.id}' already exists in content`);
    } else {
      seenIds.add(task.id);
    }

    // Topic check
    if (!['budget', 'savings', 'payments'].includes(task.topic)) {
      errors.push(`${prefix}: Invalid topic '${task.topic}'. Must be 'budget', 'savings', or 'payments'`);
    } else {
      topicsSeen.add(task.topic);
    }

    // Title & Situation checks
    if (!task.title || typeof task.title !== 'string' || task.title.trim().length === 0) {
      errors.push(`${prefix}: Missing or empty title`);
    }
    if (!task.situation || typeof task.situation !== 'string' || task.situation.trim().length === 0) {
      errors.push(`${prefix}: Missing or empty situation`);
    }
    if (!task.availableResources || typeof task.availableResources !== 'string') {
      errors.push(`${prefix}: Missing availableResources description`);
    }

    // Reward check
    if (typeof task.reward !== 'number' || isNaN(task.reward) || task.reward < 0) {
      errors.push(`${prefix}: Reward must be a non-negative number, got '${task.reward}'`);
    }

    // Actions / Options check
    const actions = task.possibleActions || task.options;
    if (!Array.isArray(actions) || actions.length < 2) {
      errors.push(`${prefix}: Must contain at least 2 possible actions, got ${actions?.length ?? 0}`);
    } else {
      let hasCorrectAction = false;
      actions.forEach((act, actIdx) => {
        const actPrefix = `${prefix}.Action[${actIdx}]`;
        if (!act.id) errors.push(`${actPrefix}: Missing action id`);
        if (!act.text) errors.push(`${actPrefix}: Missing action text`);
        if (act.isCorrect) hasCorrectAction = true;

        if (typeof (act as any).rewardChange === 'number' && (act as any).rewardChange < 0) {
          errors.push(`${actPrefix}: rewardChange cannot be negative`);
        }
      });

      if (!hasCorrectAction) {
        errors.push(`${prefix}: Must contain at least 1 correct/optimal action`);
      }
    }
  });

  if (topicsSeen.size < 3) {
    errors.push(`Content must cover at least 3 distinct topics ('budget', 'savings', 'payments'), covered only ${topicsSeen.size}`);
  }

  // 2. VALIDATE SHOP ITEMS
  if (!Array.isArray(shopItems) || shopItems.length < 8) {
    errors.push(`Shop items must contain at least 8 positions, got ${shopItems?.length ?? 0}`);
  }

  let mandatoryCount = 0;
  let discretionaryCount = 0;

  (shopItems || []).forEach((item, index) => {
    const prefix = `ShopItem[${index} id=${item?.id || 'MISSING'}]`;

    if (!item) {
      errors.push(`${prefix}: ShopItem is null or undefined`);
      return;
    }

    // ID check
    if (!item.id || typeof item.id !== 'string' || item.id.trim().length === 0) {
      errors.push(`${prefix}: Missing or empty id`);
    } else if (seenIds.has(item.id)) {
      errors.push(`${prefix}: Duplicate ID '${item.id}' already in use`);
    } else {
      seenIds.add(item.id);
    }

    // Name / Title check
    const itemName = item.name || item.title;
    if (!itemName || typeof itemName !== 'string' || itemName.trim().length === 0) {
      errors.push(`${prefix}: Missing name or title`);
    }

    // Price check: strictly positive
    if (typeof item.price !== 'number' || isNaN(item.price) || item.price <= 0) {
      errors.push(`${prefix}: Price must be a strictly positive number (> 0), got '${item.price}'`);
    }

    // Type check
    if (item.type === 'mandatory') {
      mandatoryCount++;
    } else if (item.type === 'discretionary') {
      discretionaryCount++;
    } else {
      errors.push(`${prefix}: Invalid type '${item.type}'. Must be 'mandatory' or 'discretionary'`);
    }

    // Pet effect check
    if (item.petEffect) {
      if (typeof item.petEffect.satietyBoost !== 'number' || item.petEffect.satietyBoost < 0) {
        errors.push(`${prefix}: satietyBoost must be non-negative`);
      }
      if (typeof item.petEffect.moodBoost !== 'number' || item.petEffect.moodBoost < 0) {
        errors.push(`${prefix}: moodBoost must be non-negative`);
      }
    }
  });

  if (mandatoryCount < 3) {
    errors.push(`Shop items must include at least 3 mandatory items (food/care/needs), got ${mandatoryCount}`);
  }
  if (discretionaryCount < 3) {
    errors.push(`Shop items must include at least 3 optional/discretionary items, got ${discretionaryCount}`);
  }

  // 3. VALIDATE GOALS
  if (!Array.isArray(goals) || goals.length < 3) {
    errors.push(`Goals collection must contain at least 3 goals, got ${goals?.length ?? 0}`);
  }

  (goals || []).forEach((goal, index) => {
    const prefix = `Goal[${index} id=${goal?.id || 'MISSING'}]`;

    if (!goal) {
      errors.push(`${prefix}: Goal item is null or undefined`);
      return;
    }

    // ID check
    if (!goal.id || typeof goal.id !== 'string' || goal.id.trim().length === 0) {
      errors.push(`${prefix}: Missing or empty id`);
    } else if (seenIds.has(goal.id)) {
      errors.push(`${prefix}: Duplicate ID '${goal.id}' already in use`);
    } else {
      seenIds.add(goal.id);
    }

    // Title / Name check
    const goalTitle = goal.title || goal.name;
    if (!goalTitle || typeof goalTitle !== 'string' || goalTitle.trim().length === 0) {
      errors.push(`${prefix}: Missing title or name`);
    }

    // Total cost check
    if (typeof goal.totalCost !== 'number' || isNaN(goal.totalCost) || goal.totalCost <= 0) {
      errors.push(`${prefix}: Total cost must be a strictly positive number, got '${goal.totalCost}'`);
    }

    // Saved amount check
    if (typeof goal.savedAmount !== 'number' || isNaN(goal.savedAmount) || goal.savedAmount < 0) {
      errors.push(`${prefix}: Saved amount must be non-negative, got '${goal.savedAmount}'`);
    }
  });

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    warnings,
    stats: {
      tasksCount: tasks?.length ?? 0,
      shopItemsCount: shopItems?.length ?? 0,
      goalsCount: goals?.length ?? 0,
      mandatoryItemsCount: mandatoryCount,
      discretionaryItemsCount: discretionaryCount,
      topicsCount: topicsSeen.size,
    },
  };
}

export function validateEducationalContentOrThrow(
  tasks: EducationalTask[],
  shopItems: EducationalShopItem[],
  goals: EducationalGoal[]
): ValidationReport {
  const report = validateEducationalContent(tasks, shopItems, goals);
  if (!report.isValid) {
    throw new ContentValidationError(report.errors);
  }
  return report;
}
