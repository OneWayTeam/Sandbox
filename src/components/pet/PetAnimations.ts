/**
 * PetAnimations.ts
 * Procedural animation system for rigged 3D pet characters.
 *
 * WHY PROCEDURAL:
 * The raccoon GLB (Meshy_AI_Character_output.glb) contains a full rig
 * (UniRigArmature, 50 joints) but NO embedded animation clips.
 * All animations are therefore driven by procedural bone manipulation.
 *
 * ARCHITECTURE:
 * - PetAnimationState: typed union of all named animation states
 * - PetAnimationClip: a function that receives bones + time → mutates transforms
 * - AnimationPriority: emotional > gameplay > interaction > passive
 */

import * as THREE from 'three';

// ─── Types ─────────────────────────────────────────────────────────────────

export type PetAnimationState =
  // Passive
  | 'idle'
  | 'idle_breathe'
  | 'blink'
  | 'look_left'
  | 'look_right'
  | 'look_up'
  | 'look_down'
  | 'curious'
  // Emotional
  | 'happy'
  | 'excited'
  | 'surprised'
  | 'sad'
  | 'thinking'
  | 'celebrate'
  // Interaction
  | 'wave'
  | 'jump'
  | 'dance'
  | 'eat'
  | 'drink'
  | 'sleep'
  | 'wake_up'
  // Gameplay
  | 'receive_reward'
  | 'complete_task'
  | 'buy'
  | 'save_money'
  | 'spend_money'
  | 'level_up'
  | 'goal_complete';

export type AnimationPriority = 'passive' | 'interaction' | 'emotional' | 'gameplay';

export interface AnimationMeta {
  state: PetAnimationState;
  priority: AnimationPriority;
  /** Duration in ms; undefined = looping */
  durationMs?: number;
  /** Whether to return to idle after completion */
  returnToIdle: boolean;
}

export const ANIMATION_META: Record<PetAnimationState, AnimationMeta> = {
  idle:           { state: 'idle',           priority: 'passive',     returnToIdle: false },
  idle_breathe:   { state: 'idle_breathe',   priority: 'passive',     durationMs: 2400, returnToIdle: true },
  blink:          { state: 'blink',          priority: 'passive',     durationMs: 200,  returnToIdle: true },
  look_left:      { state: 'look_left',      priority: 'passive',     durationMs: 1500, returnToIdle: true },
  look_right:     { state: 'look_right',     priority: 'passive',     durationMs: 1500, returnToIdle: true },
  look_up:        { state: 'look_up',        priority: 'passive',     durationMs: 1000, returnToIdle: true },
  look_down:      { state: 'look_down',      priority: 'passive',     durationMs: 1000, returnToIdle: true },
  curious:        { state: 'curious',        priority: 'passive',     durationMs: 2000, returnToIdle: true },
  happy:          { state: 'happy',          priority: 'emotional',   durationMs: 2000, returnToIdle: true },
  excited:        { state: 'excited',        priority: 'emotional',   durationMs: 2500, returnToIdle: true },
  surprised:      { state: 'surprised',      priority: 'emotional',   durationMs: 1200, returnToIdle: true },
  sad:            { state: 'sad',            priority: 'emotional',   durationMs: 3000, returnToIdle: true },
  thinking:       { state: 'thinking',       priority: 'emotional',   durationMs: 2500, returnToIdle: true },
  celebrate:      { state: 'celebrate',      priority: 'emotional',   durationMs: 3000, returnToIdle: true },
  wave:           { state: 'wave',           priority: 'interaction', durationMs: 2000, returnToIdle: true },
  jump:           { state: 'jump',           priority: 'interaction', durationMs: 800,  returnToIdle: true },
  dance:          { state: 'dance',          priority: 'interaction', durationMs: 4000, returnToIdle: true },
  eat:            { state: 'eat',            priority: 'interaction', durationMs: 2500, returnToIdle: true },
  drink:          { state: 'drink',          priority: 'interaction', durationMs: 2000, returnToIdle: true },
  sleep:          { state: 'sleep',          priority: 'emotional',   returnToIdle: false },
  wake_up:        { state: 'wake_up',        priority: 'emotional',   durationMs: 1500, returnToIdle: true },
  receive_reward: { state: 'receive_reward', priority: 'gameplay',    durationMs: 2000, returnToIdle: true },
  complete_task:  { state: 'complete_task',  priority: 'gameplay',    durationMs: 3000, returnToIdle: true },
  buy:            { state: 'buy',            priority: 'gameplay',    durationMs: 1800, returnToIdle: true },
  save_money:     { state: 'save_money',     priority: 'gameplay',    durationMs: 2000, returnToIdle: true },
  spend_money:    { state: 'spend_money',    priority: 'gameplay',    durationMs: 1500, returnToIdle: true },
  level_up:       { state: 'level_up',       priority: 'gameplay',    durationMs: 3500, returnToIdle: true },
  goal_complete:  { state: 'goal_complete',  priority: 'gameplay',    durationMs: 4000, returnToIdle: true },
};

// Priority order: gameplay > emotional > interaction > passive
const PRIORITY_ORDER: AnimationPriority[] = ['gameplay', 'emotional', 'interaction', 'passive'];

// ─── Bone name mapping (UniRigArmature — 50 joints) ─────────────────────────
// Actual bone names from GLB: Bone_000..Bone_049 (generic Meshy rig)
// We map semantic roles to bone indices we'll discover at runtime.
// The PetController discovers the actual bone structure from the skeleton.
export interface BoneRig {
  root?: THREE.Bone;
  spine?: THREE.Bone;
  chest?: THREE.Bone;
  neck?: THREE.Bone;
  head?: THREE.Bone;
  // Arms
  armL?: THREE.Bone;
  forearmL?: THREE.Bone;
  handL?: THREE.Bone;
  armR?: THREE.Bone;
  forearmR?: THREE.Bone;
  handR?: THREE.Bone;
  // Legs
  thighL?: THREE.Bone;
  shinL?: THREE.Bone;
  footL?: THREE.Bone;
  thighR?: THREE.Bone;
  shinR?: THREE.Bone;
  footR?: THREE.Bone;
  // Tail
  tail?: THREE.Bone;
  // Ears (raccoon specific)
  earL?: THREE.Bone;
  earR?: THREE.Bone;
}

// ─── Easing helpers ─────────────────────────────────────────────────────────
const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
const easeOut = (t: number) => 1 - (1 - t) * (1 - t);
const sin01 = (t: number) => (Math.sin(t * Math.PI * 2) + 1) / 2;

// ─── Procedural Pose Functions ───────────────────────────────────────────────
// Each function takes (rig, t) where t = elapsed time in seconds
// Returns a Set of modified bones (for blend weight calculation)

function poseIdle(rig: BoneRig, t: number): void {
  // Very subtle sway — alive but calm
  if (rig.spine) {
    rig.spine.rotation.z = Math.sin(t * 0.4) * 0.008;
  }
  if (rig.head) {
    rig.head.rotation.y = Math.sin(t * 0.3) * 0.015;
    rig.head.rotation.x = Math.sin(t * 0.25) * 0.005;
  }
}

function poseBreathe(rig: BoneRig, t: number): void {
  // Chest rise/fall — very subtle
  if (rig.chest) {
    rig.chest.rotation.x = Math.sin(t * Math.PI / 1.2) * 0.035;
  }
  if (rig.spine) {
    rig.spine.rotation.x = Math.sin(t * Math.PI / 1.2) * 0.018;
  }
}

function poseLookLeft(rig: BoneRig, t: number): void {
  const progress = easeInOut(Math.min(t / 0.4, 1));
  const linger = t > 0.4 && t < 1.1 ? 1 : (t >= 1.1 ? Math.max(0, 1 - (t - 1.1) / 0.4) : progress);
  if (rig.head) {
    rig.head.rotation.y = linger * -0.45;
  }
  if (rig.neck) {
    rig.neck.rotation.y = linger * -0.2;
  }
}

function poseLookRight(rig: BoneRig, t: number): void {
  const progress = easeInOut(Math.min(t / 0.4, 1));
  const linger = t > 0.4 && t < 1.1 ? 1 : (t >= 1.1 ? Math.max(0, 1 - (t - 1.1) / 0.4) : progress);
  if (rig.head) {
    rig.head.rotation.y = linger * 0.45;
  }
  if (rig.neck) {
    rig.neck.rotation.y = linger * 0.2;
  }
}

function poseCurious(rig: BoneRig, t: number): void {
  const tilt = easeOut(Math.min(t / 0.5, 1));
  if (rig.head) {
    rig.head.rotation.z = tilt * 0.25;
    rig.head.rotation.x = tilt * 0.1;
  }
  if (rig.earL) {
    rig.earL.rotation.z = tilt * -0.15;
  }
}

function poseHappy(rig: BoneRig, t: number): void {
  // Tail wag + small bob
  if (rig.tail) {
    rig.tail.rotation.z = Math.sin(t * 8) * 0.4;
  }
  if (rig.root) {
    rig.root.position.y = (rig.root as any)._baseY + Math.abs(Math.sin(t * 6)) * 0.03;
  }
  if (rig.head) {
    rig.head.rotation.z = Math.sin(t * 5) * 0.06;
  }
}

function poseExcited(rig: BoneRig, t: number): void {
  // Fast tail + arm spread
  if (rig.tail) {
    rig.tail.rotation.z = Math.sin(t * 14) * 0.6;
  }
  if (rig.armL) {
    rig.armL.rotation.z = Math.sin(t * 7) * 0.35 + 0.3;
  }
  if (rig.armR) {
    rig.armR.rotation.z = -(Math.sin(t * 7 + 0.3) * 0.35 + 0.3);
  }
  if (rig.root) {
    rig.root.position.y = (rig.root as any)._baseY + Math.abs(Math.sin(t * 9)) * 0.05;
  }
}

function poseCelebrate(rig: BoneRig, t: number): void {
  // Jump + arms up + tail wagging
  const jumpPhase = Math.max(0, Math.sin(t * 3) * 0.08);
  if (rig.root) {
    rig.root.position.y = (rig.root as any)._baseY + jumpPhase;
  }
  if (rig.armL) {
    rig.armL.rotation.z = Math.sin(t * 6) * 0.5 + 0.8;
    rig.armL.rotation.x = -0.5;
  }
  if (rig.armR) {
    rig.armR.rotation.z = -(Math.sin(t * 6 + 0.5) * 0.5 + 0.8);
    rig.armR.rotation.x = -0.5;
  }
  if (rig.tail) {
    rig.tail.rotation.z = Math.sin(t * 12) * 0.7;
  }
}

function poseWave(rig: BoneRig, t: number): void {
  // Raise right arm and wave
  if (rig.armR) {
    rig.armR.rotation.z = -1.2;
    rig.armR.rotation.x = -0.3;
  }
  if (rig.forearmR) {
    rig.forearmR.rotation.z = Math.sin(t * 8) * 0.5;
  }
  if (rig.handR) {
    rig.handR.rotation.z = Math.sin(t * 8 + 0.5) * 0.3;
  }
}

function poseSleep(rig: BoneRig, t: number): void {
  // Slumped posture, slow breathing
  if (rig.spine) rig.spine.rotation.x = 0.35;
  if (rig.head) {
    rig.head.rotation.x = 0.4 + Math.sin(t * 0.8) * 0.03;
  }
  if (rig.armL) rig.armL.rotation.z = 0.5;
  if (rig.armR) rig.armR.rotation.z = -0.5;
}

function poseSurprised(rig: BoneRig, t: number): void {
  const pop = easeOut(Math.min(t / 0.15, 1));
  if (rig.head) {
    rig.head.rotation.x = pop * -0.3;
  }
  if (rig.earL) rig.earL.rotation.x = pop * -0.3;
  if (rig.earR) rig.earR.rotation.x = pop * -0.3;
  if (rig.armL) rig.armL.rotation.z = pop * 0.6;
  if (rig.armR) rig.armR.rotation.z = pop * -0.6;
}

function poseSad(rig: BoneRig, t: number): void {
  if (rig.spine) rig.spine.rotation.x = 0.15;
  if (rig.head) rig.head.rotation.x = 0.25;
  if (rig.earL) rig.earL.rotation.x = 0.2;
  if (rig.earR) rig.earR.rotation.x = 0.2;
}

function poseThinking(rig: BoneRig, t: number): void {
  // Tilt head, raise one hand to chin area
  if (rig.head) {
    rig.head.rotation.z = 0.12;
    rig.head.rotation.y = -0.15;
  }
  if (rig.armR) {
    rig.armR.rotation.z = -0.6;
    rig.armR.rotation.x = -0.3;
  }
  if (rig.forearmR) {
    rig.forearmR.rotation.x = 0.8;
  }
}

function poseJump(rig: BoneRig, t: number): void {
  // Single bounce
  const phase = Math.sin(t * Math.PI);
  if (rig.root) {
    rig.root.position.y = (rig.root as any)._baseY + phase * 0.15;
  }
  if (rig.spine) {
    rig.spine.rotation.x = phase * -0.2;
  }
  if (rig.armL) rig.armL.rotation.z = phase * 0.5;
  if (rig.armR) rig.armR.rotation.z = phase * -0.5;
}

function poseDance(rig: BoneRig, t: number): void {
  if (rig.spine) rig.spine.rotation.z = Math.sin(t * 3) * 0.15;
  if (rig.armL) {
    rig.armL.rotation.z = Math.sin(t * 3) * 0.6 + 0.4;
    rig.armL.rotation.x = Math.cos(t * 3) * 0.3;
  }
  if (rig.armR) {
    rig.armR.rotation.z = -(Math.sin(t * 3 + Math.PI) * 0.6 + 0.4);
    rig.armR.rotation.x = Math.cos(t * 3 + Math.PI) * 0.3;
  }
  if (rig.root) {
    rig.root.position.y = (rig.root as any)._baseY + Math.abs(Math.sin(t * 3)) * 0.04;
  }
}

function poseEat(rig: BoneRig, t: number): void {
  if (rig.head) {
    rig.head.rotation.x = Math.sin(t * 4) * 0.12;
  }
  if (rig.armL) {
    rig.armL.rotation.z = 0.5;
    rig.armL.rotation.x = -0.6;
  }
  if (rig.forearmL) {
    rig.forearmL.rotation.x = 0.8 + Math.sin(t * 4) * 0.1;
  }
}

function poseSaveMoney(rig: BoneRig, t: number): void {
  // Gentle nod + arm deposit motion
  const nod = easeInOut(Math.min(t / 0.5, 1));
  if (rig.head) rig.head.rotation.x = Math.sin(t * 3) * 0.12;
  if (rig.armR) {
    rig.armR.rotation.z = -nod * 0.7;
    rig.armR.rotation.x = -nod * 0.4;
  }
  if (rig.tail) rig.tail.rotation.z = Math.sin(t * 4) * 0.25;
}

function poseReceiveReward(rig: BoneRig, t: number): void {
  // Arms out + happy hop
  const hop = Math.max(0, Math.sin(t * 4) * 0.08);
  if (rig.root) rig.root.position.y = (rig.root as any)._baseY + hop;
  if (rig.armL) {
    rig.armL.rotation.z = 0.8 + Math.sin(t * 4) * 0.2;
  }
  if (rig.armR) {
    rig.armR.rotation.z = -(0.8 + Math.sin(t * 4 + 0.3) * 0.2);
  }
  if (rig.tail) rig.tail.rotation.z = Math.sin(t * 10) * 0.5;
}

function poseLevelUp(rig: BoneRig, t: number): void {
  // Celebrate + spin head + tail fury
  const hop = Math.abs(Math.sin(t * 4)) * 0.1;
  if (rig.root) rig.root.position.y = (rig.root as any)._baseY + hop;
  if (rig.armL) {
    rig.armL.rotation.z = 1.2;
    rig.armL.rotation.x = -0.5 + Math.sin(t * 6) * 0.2;
  }
  if (rig.armR) {
    rig.armR.rotation.z = -1.2;
    rig.armR.rotation.x = -0.5 + Math.sin(t * 6 + 0.5) * 0.2;
  }
  if (rig.tail) rig.tail.rotation.z = Math.sin(t * 15) * 0.8;
  if (rig.spine) rig.spine.rotation.z = Math.sin(t * 4) * 0.08;
}

// ─── Main Animation Driver ───────────────────────────────────────────────────

/**
 * Apply the pose for a given animation state.
 * Called every render frame with elapsed time (seconds) since the animation started.
 */
export function applyPose(
  state: PetAnimationState,
  rig: BoneRig,
  elapsedSeconds: number
): void {
  const t = elapsedSeconds;
  switch (state) {
    case 'idle':           return poseIdle(rig, t);
    case 'idle_breathe':   return poseBreathe(rig, t);
    case 'blink':          break; // handled via eyelid bone/morph separately
    case 'look_left':      return poseLookLeft(rig, t);
    case 'look_right':     return poseLookRight(rig, t);
    case 'look_up':
      if (rig.head) rig.head.rotation.x = easeOut(Math.min(t / 0.4, 1)) * -0.3;
      break;
    case 'look_down':
      if (rig.head) rig.head.rotation.x = easeOut(Math.min(t / 0.4, 1)) * 0.3;
      break;
    case 'curious':        return poseCurious(rig, t);
    case 'happy':          return poseHappy(rig, t);
    case 'excited':        return poseExcited(rig, t);
    case 'surprised':      return poseSurprised(rig, t);
    case 'sad':            return poseSad(rig, t);
    case 'thinking':       return poseThinking(rig, t);
    case 'celebrate':      return poseCelebrate(rig, t);
    case 'wave':           return poseWave(rig, t);
    case 'jump':           return poseJump(rig, t);
    case 'dance':          return poseDance(rig, t);
    case 'eat':            return poseEat(rig, t);
    case 'drink':          return poseEat(rig, t); // same motion with head tilt up
    case 'sleep':          return poseSleep(rig, t);
    case 'wake_up':
      const wakeT = Math.max(0, 1 - t / 1.5);
      if (rig.spine) rig.spine.rotation.x = wakeT * 0.35;
      if (rig.head) rig.head.rotation.x = wakeT * 0.4;
      break;
    case 'receive_reward': return poseReceiveReward(rig, t);
    case 'complete_task':  return poseCelebrate(rig, t);
    case 'buy':            return poseHappy(rig, t);
    case 'save_money':     return poseSaveMoney(rig, t);
    case 'spend_money':    return poseSurprised(rig, t);
    case 'level_up':       return poseLevelUp(rig, t);
    case 'goal_complete':  return poseLevelUp(rig, t);
  }
}

/**
 * Reset all rig bones to neutral T-pose.
 * Call before applying a new pose to avoid accumulation.
 */
export function resetRig(rig: BoneRig): void {
  const bones = Object.values(rig).filter(Boolean) as THREE.Bone[];
  for (const bone of bones) {
    if ((bone as any)._baseRotation) {
      bone.rotation.copy((bone as any)._baseRotation);
    } else {
      bone.rotation.set(0, 0, 0);
    }
    if ((bone as any)._baseY !== undefined && bone.position) {
      bone.position.y = (bone as any)._baseY;
    }
  }
}

/** Determine if an animation can interrupt the currently playing one */
export function canInterrupt(
  current: PetAnimationState,
  incoming: PetAnimationState
): boolean {
  const curPriority = ANIMATION_META[current].priority;
  const inPriority = ANIMATION_META[incoming].priority;
  const curIdx = PRIORITY_ORDER.indexOf(curPriority);
  const inIdx = PRIORITY_ORDER.indexOf(inPriority);
  return inIdx <= curIdx; // lower index = higher priority
}
