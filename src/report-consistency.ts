// 기본 코드는 Codex 예제이며, 사용자가 안내에 따라 '모름' 조건을 추가·재배치했습니다.
export function compareDestinations(
  first: string | null,
  second: string | null
): 'same' | 'conflict' | 'unknown' {
  if (first === null || second === null) return 'unknown';
  if (first.trim() === '' || second.trim() === '') return 'unknown';
  if (first.trim() === '모름' || second.trim() === '모름') return 'unknown';
  if (first.trim() === second.trim()) return 'same';
  return 'conflict';
}
