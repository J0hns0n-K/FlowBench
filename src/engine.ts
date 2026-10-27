/** Pure terminating FCFS service model. No DOM, wall clock, RNG or external data. */
export interface Task { id: string; arrivalSec: number; serviceSec: number }
export interface TaskEvent extends Task {
  inputIndex: number; server: number; startSec: number; endSec: number; waitSec: number;
}
export const MAX_TASKS = 5000;
export const MAX_DURATION_SEC = 86400;

export function finiteInRange(value: number, name: string, min: number, max: number): void {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(`${name} must be finite and between ${min} and ${max}.`);
  }
}

export function validateTasks(tasks: readonly Task[], servers: number): void {
  if (!Number.isInteger(servers) || servers < 1 || servers > 100) {
    throw new RangeError('servers must be an integer between 1 and 100.');
  }
  if (tasks.length > MAX_TASKS) throw new RangeError(`At most ${MAX_TASKS} tasks are supported.`);
  const seen = new Set<string>();
  for (const task of tasks) {
    if (typeof task.id !== 'string' || !/^[A-Za-z0-9_-]{1,40}$/.test(task.id) || seen.has(task.id)) {
      throw new TypeError('Task IDs must be unique anonymous alphanumeric codes (1–40 characters).');
    }
    seen.add(task.id);
    finiteInRange(task.arrivalSec, 'arrivalSec', 0, MAX_DURATION_SEC);
    finiteInRange(task.serviceSec, 'serviceSec', 0.001, MAX_DURATION_SEC);
  }
}

export function simulateFCFS(tasks: readonly Task[], servers = 1): TaskEvent[] {
  validateTasks(tasks, servers);
  const ready = tasks.map((task, inputIndex) => ({ ...task, inputIndex }))
    .sort((a, b) => a.arrivalSec - b.arrivalSec || a.inputIndex - b.inputIndex);
  const available = Array<number>(servers).fill(0);
  const events: TaskEvent[] = [];
  for (const task of ready) {
    let server = 0;
    for (let k = 1; k < servers; k++) {
      if (available[k]! < available[server]!) server = k;
    }
    const startSec = Math.max(task.arrivalSec, available[server]!);
    const endSec = startSec + task.serviceSec;
    available[server] = endSec;
    events.push({ ...task, server, startSec, endSec, waitSec: startSec - task.arrivalSec });
  }
  return events;
}

/** Nearest rank: ceil(p*N), one-based. Defined as zero for an empty sample. */
export function percentile(values: readonly number[], p: number): number {
  finiteInRange(p, 'percentile', Number.MIN_VALUE, 1);
  if (values.some(value => !Number.isFinite(value))) throw new TypeError('Quantile sample must be finite.');
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.ceil(p * sorted.length) - 1]!;
}
