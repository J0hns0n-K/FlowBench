// 기본 코드는 Codex 예제이며, 사용자가 안내에 따라 '모름' 조건을 추가·재배치했습니다.
export function compareDestinations(
  first: string | null,
  second: string | null
): 'same' | 'conflict' | 'unknown' {
  const normalizedFirst = trimDestination(first);
  const normalizedSecond = trimDestination(second);
  if (normalizedFirst === null || normalizedSecond === null) return 'unknown';
  if (normalizedFirst === '' || normalizedSecond === '') return 'unknown';
  if (normalizedFirst === '모름' || normalizedSecond === '모름') return 'unknown';
  if (normalizedFirst === normalizedSecond) return 'same';
  return 'conflict';
}

// 함수 틀과 return 예제를 안내받아 사용자가 입력·저장했습니다. 호출 연결은 Codex 보조 작업입니다.
export function trimDestination(value: string | null): string | null {
  if (value === null) return null;

  return value.trim();
}

export const DESTINATION_LABEL_VERSION = 'hospital-label-v1';
export const HOSPITAL_LABEL_ALIAS = Object.freeze({ from: 'hospital', to: '병원' } as const);

// 별칭 정리 조건은 사용자 요청에 따라 Codex가 구현했습니다. 실제 위치 확인은 아닙니다.
export function normalizeDestinationLabel(value: string | null): string | null {
  const cleaned = trimDestination(value);

  if (cleaned === HOSPITAL_LABEL_ALIAS.from) return HOSPITAL_LABEL_ALIAS.to;

  return cleaned;
}
