import { finiteInRange } from './engine.ts';
import type { Group } from './workflow.ts';

export const LOCKED_GROUPS: readonly Group[] = Object.freeze(
  [32, 38, 41, 35, 44, 30].map((countSec, i) => Object.freeze({
    id: `G${String(i + 1).padStart(2, '0')}`, countSec, reportSec: 8,
  })));

export interface GeneratorConfig {
  seed: number; groups: number; countMinSec: number; countMaxSec: number;
  reportMinSec: number; reportMaxSec: number;
}
export const DEFAULT_CONFIG: Readonly<GeneratorConfig> = Object.freeze({
  seed: 20261027, groups: 6, countMinSec: 25, countMaxSec: 50, reportMinSec: 5, reportMaxSec: 12,
});

/** Mulberry32, explicit uint32 state. Seed zero is a valid, distinct state. */
export function seededRandom(seed: number): () => number {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) {
    throw new RangeError('seed must be an unsigned 32-bit integer.');
  }
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateGroups(config: GeneratorConfig): Group[] {
  if (!Number.isInteger(config.groups) || config.groups < 1 || config.groups > 100) {
    throw new RangeError('groups must be an integer between 1 and 100.');
  }
  for (const key of ['countMinSec', 'countMaxSec', 'reportMinSec', 'reportMaxSec'] as const) {
    finiteInRange(config[key], key, 0.001, 3600);
  }
  if (config.countMinSec > config.countMaxSec || config.reportMinSec > config.reportMaxSec) {
    throw new RangeError('Minimum duration cannot exceed maximum duration.');
  }
  const random = seededRandom(config.seed);
  const sample = (min: number, max: number) => Math.round((min + random() * (max - min)) * 1000) / 1000;
  return Array.from({ length: config.groups }, (_, i) => ({
    id: `G${String(i + 1).padStart(2, '0')}`,
    countSec: sample(config.countMinSec, config.countMaxSec),
    reportSec: sample(config.reportMinSec, config.reportMaxSec),
  }));
}
