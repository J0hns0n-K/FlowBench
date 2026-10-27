import { finiteInRange, MAX_DURATION_SEC } from './engine.ts';

export interface DependencyTask {
  id: string; durationSec: number | null; dependsOn: readonly string[];
}
export interface DependencyEvent extends DependencyTask {
  earliestStartSec: number | null; earliestEndSec: number | null;
}

/** Earliest times on a dependency DAG. Resources are unconstrained; null means unknown. */
export function scheduleDependencies(tasks: readonly DependencyTask[]): DependencyEvent[] {
  if (tasks.length > 200) throw new RangeError('At most 200 dependency tasks are supported.');
  const byId = new Map<string, DependencyTask>();
  for (const task of tasks) {
    if (typeof task.id !== 'string' || !/^[A-Za-z0-9_-]{1,40}$/.test(task.id) || byId.has(task.id) || !Array.isArray(task.dependsOn)) {
      throw new TypeError('Task IDs must be unique codes and dependencies must be an array.');
    }
    if (task.durationSec !== null) {
      if (typeof task.durationSec !== 'number') throw new TypeError('Duration must be numeric or explicitly unknown.');
      finiteInRange(task.durationSec, 'durationSec', 0, MAX_DURATION_SEC);
    }
    byId.set(task.id, task);
  }
  for (const task of tasks) {
    if (new Set(task.dependsOn).size !== task.dependsOn.length ||
        task.dependsOn.some(id => !byId.has(id))) throw new TypeError('Duplicate or missing dependency.');
  }
  const visiting = new Set<string>(), done = new Map<string, DependencyEvent>();
  function visit(id: string): DependencyEvent {
    const cached = done.get(id);
    if (cached) return cached;
    if (visiting.has(id)) throw new TypeError('Dependency graph contains a cycle.');
    visiting.add(id);
    const task = byId.get(id)!;
    const parents = task.dependsOn.map(parent => visit(parent));
    const earliestStartSec = parents.some(parent => parent.earliestEndSec === null) ? null :
      Math.max(0, ...parents.map(parent => parent.earliestEndSec!));
    const earliestEndSec = earliestStartSec === null || task.durationSec === null ? null :
      earliestStartSec + task.durationSec;
    const result = { ...task, dependsOn: [...task.dependsOn], earliestStartSec, earliestEndSec };
    visiting.delete(id); done.set(id, result);
    return result;
  }
  // Memoized DFS is O(V+E); bounded depth and returned input order keep results reproducible.
  return tasks.map(task => visit(task.id));
}
