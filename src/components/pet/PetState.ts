/**
 * PetState.ts
 * Maps game events (income, purchase, task, savings, etc.)
 * to Pet3D animation states.
 *
 * This is the ONLY place that connects game logic → pet animation.
 * Game engine fires events → PetStateMapper → Pet3D.play(animation)
 */

import { PetAnimationState } from './PetAnimations';
import { PetReactionEvent } from '../../types/gameTypes';

/** Map a game reaction event to a 3D animation state */
export function mapReactionToAnimation(
  event: PetReactionEvent
): PetAnimationState {
  switch (event.type) {
    case 'income':       return 'receive_reward';
    case 'purchase':     return 'buy';
    case 'savings':      return 'save_money';
    case 'task_completed': return 'complete_task';
    case 'stage_evolution': return 'level_up';
    case 'tap':          return 'happy';
    default:             return 'happy';
  }
}

/** Map mood state string to ambient idle animation */
export function mapMoodToIdle(
  moodState: 'happy' | 'calm' | 'excited' | 'worried' | 'tired'
): PetAnimationState {
  switch (moodState) {
    case 'happy':    return 'happy';
    case 'excited':  return 'excited';
    case 'worried':  return 'thinking';
    case 'tired':    return 'sleep';
    case 'calm':
    default:         return 'idle';
  }
}

/** Complete sequence for each major game event (primary → secondary → idle) */
export interface AnimationSequence {
  primary: PetAnimationState;
  secondary?: PetAnimationState;
}

export const GAME_EVENT_SEQUENCES: Record<string, AnimationSequence> = {
  income:          { primary: 'receive_reward', secondary: 'happy' },
  purchase:        { primary: 'buy',            secondary: 'happy' },
  savings:         { primary: 'save_money',     secondary: 'happy' },
  task_completed:  { primary: 'complete_task',  secondary: 'celebrate' },
  stage_evolution: { primary: 'level_up',       secondary: 'celebrate' },
  goal_complete:   { primary: 'goal_complete',  secondary: 'celebrate' },
  spend_money:     { primary: 'spend_money',    secondary: 'idle' },
  tap:             { primary: 'happy',          secondary: 'wave' },
};
