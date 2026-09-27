/**
 * Pet Asset Registry
 * Central registry for all 3D pet character models.
 * Add new characters here — no changes needed in Pet3D renderer.
 */

export type PetCharacter =
  | 'raccoon'
  | 'rabbit'
  | 'cat'
  | 'fox'
  | 'panda';

export interface PetAssetEntry {
  /** Require path for the GLB model */
  model: any;
  /** Human-readable name */
  displayName: string;
  /** Base scale to normalize model size */
  baseScale: number;
  /** Y offset so feet touch the ground */
  groundOffset: number;
}

/**
 * IMPORTANT: GLB animation clip names MUST match what exists in the file.
 * Raccoon GLB (Meshy_AI_Character_output.glb) has:
 *   - NO embedded animation clips
 *   - Rig: UniRigArmature (50 joints)
 *   - Mesh: Mesh0 with BakedMaterial (PBR, 3 textures)
 *
 * Animations are driven procedurally via the skeleton (PetController.ts).
 */

const safeRequire = (fn: () => any, fallback: string): any => {
  try { return fn(); } catch { return { uri: fallback }; }
};

export const PET_ASSETS: Record<PetCharacter, PetAssetEntry | null> = {
  raccoon: {
    model: safeRequire(
      () => require('../../../assets/raccoon.glb'),
      'raccoon'
    ),
    displayName: 'Финни-Енот',
    baseScale: 1.0,
    groundOffset: 0,
  },
  rabbit: null,   // Future character
  cat: null,      // Future character
  fox: null,      // Future character
  panda: null,    // Future character
};

/** Returns true if a given character has an asset loaded */
export function isPetAvailable(character: PetCharacter): boolean {
  return PET_ASSETS[character] !== null;
}
