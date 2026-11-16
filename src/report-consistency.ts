// Codex가 제공한 예제 코드를 사용자가 입력·저장한 연습입니다.
export function compareDestinations(
  first: string | null,
  second: string | null
): 'same' | 'conflict' | 'unknown' {
  if (first === null || second === null) return 'unknown';
  if (first.trim() === '' || second.trim() === '') return 'unknown';
  if (first.trim() === second.trim()) return 'same';
  return 'conflict';
}
