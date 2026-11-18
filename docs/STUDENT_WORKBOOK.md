# Junmo's engineering workbook — to be authored by the student

Keep original explanations, sketches, failed predictions and revisions; don't replace them with polished AI prose.

1. Draw the actual seated-counting process. Which steps overlap? What exactly ends the five-minute estimate? Explain why the initial queue hypothesis was wrong.
2. Define success beyond speed. What error would make a faster workflow unacceptable? How could aggregate accuracy be checked without publishing student records?
3. Hand-calculate a three-group serial/parallel example before running the code. Explain why the coordinator can become the bottleneck.
4. Read `src/engine.ts` after implementation. Explain task ordering, ties, empty inputs and percentile conventions in your own words. Add one independently chosen counterexample and test.
5. Decide whether the provisional 120-second / 30-second targets make sense. Justify a different target or reject the change. Record the decision before collecting outcomes.
6. Propose an allowed observation protocol, including timer uncertainty and held-out validation. Record actual dates and roles, not future work as completed work.
7. Make a substantive change, link the commit and explain the before/after behavior and debugging evidence. Attribute assistance precisely.

Submitted reasoning entry: [question count versus total enquiry time](STUDENT_REASONING_01_KO.md), received 2026-10-29. The user supplied the example durations, correct totals and a response-speed observation in a guided exercise. Prompt structure, formal clarification, completed counterexample and test code are AI-assisted. Independent software changes and the remaining tasks are still pending.

현재 진행 (2026-11-17): 사용자가 보조자가 제시한 요구사항에 따라 **'모름' 조건문을 작성**했고, 첫 저장에서 조건의 위치 때문에 모름/모름이 same으로 나왔습니다. 보조자의 실패 테스트·return 설명 후 사용자가 해당 줄을 동등 비교보다 앞으로 옮겨 저장했습니다. 함수 테스트 3개와 전체 62개·빌드가 통과했습니다. 조건 작성·재배치는 사용자 작업이며 요구사항·진단·테스트는 보조 작업입니다. 독립적인 결함 발견이나 알고리즘 설계로 확대하지 않습니다. 기존 4/1/25의 조건과 다른 담당자의 정보 전달 방식은 계속 미확인입니다. 아래 과제들은 장기 참고 목록입니다.

### 저장한 함수의 확인 결과 — 2026-11-16

코드: [compareDestinations](../src/report-consistency.ts) · 검증: [두 계약 테스트](../tests/report-consistency.test.ts).

| 가상 입력 | 출력 |
| --- | --- |
| A / A | same |
| A / B | conflict |
| A / null 또는 null / A | unknown |
| 빈 문자열·공백 / A | unknown |
| 앞뒤 공백이 있는 A / A | same |

입력 순서를 바꿔도 결과가 같고, 대소문자가 다른 위치 코드를 임의로 합치지 않습니다. 이 함수는 가상 제보 문자열 사이의 일치 여부만 다루며 사실 여부를 검증하지 않습니다. 실제 문의 흐름·브라우저 UI에는 아직 연결하지 않았습니다. 코드 본문은 보조자가 제공했고 사용자가 저장했습니다.

### 직접 고른 비교 사례 — 2026-11-16

[사용자 원문과 실행 결과](../data/student-report-consistency-case-2026-11-16.json).

| 첫 답변 | 두 번째 답변 | 학생 예상 | 실제 코드 결과 |
| --- | --- | --- | --- |
| 병원 | 반 | conflict | conflict |

학생 이유: **‘둘이 답변이 다르기 때문에’**. 보조자는 깨끗한 소스 `4d4775c`의 함수를 실행했습니다. null·빈칸 검사에 걸리지 않고, 두 문자열이 같지도 않아 마지막 conflict 반환으로 끝납니다. 어떤 답변이 실제로 맞는지는 이 함수가 판단하지 않습니다. 입력·예상·이유는 학생 선택이며 실행은 보조 작업입니다. 이미 자동 테스트가 다루는 분기이므로 같은 자동 테스트를 중복 추가하지 않았습니다.

### '모름' 조건 추가와 순서 수정 — 2026-11-17

[변경 과정과 실행 결과](../data/student-unknown-marker-change-2026-11-17.json).

| 단계 | 저장된 검사 순서 | 모름 / 모름 결과 |
| --- | --- | --- |
| 사용자의 첫 수정 | null → 빈칸 → 같음 → 모름 → conflict | same — 기대와 불일치 |
| 피드백 후 사용자 수정 | null → 빈칸 → 모름 → 같음 → conflict | unknown — 기대와 일치 |

조건문 자체의 비교식은 맞았으나 앞선 return으로 검사에 도달하지 못했습니다. 사용자가 순서를 옮긴 뒤 공백이 붙은 모름과 역순 입력까지 회귀 테스트가 통과했습니다. 요구사항·테스트·설명은 보조자가 제공했고 사용자가 조건문과 재배치를 작성했습니다. 정확히 '모름'이라는 표기만 처리하며 자연어 이해·실제 출석 검증 기능은 아닙니다.

### 화면에서 직접 실행 — 2026-11-17

후속 작업으로 보조자가 [두 답변 비교 화면](REPORT_COMPARISON_KO.md)을 연결했습니다. 사용자 수정 함수는 그대로 호출하며 예제 버튼·직접 입력·결과·공백 정리한 값을 표시합니다. 학생이 화면을 직접 구현하거나 사용성 검토를 끝냈다고 기록하지 않습니다. 다음 학생 작업은 화면의 세 예제 버튼을 직접 눌러 **병원/반은 conflict, 공백 차이는 same, 모름/모름은 unknown**으로 보이는지 확인하는 것입니다. 아직 수행된 사용자 검증 결과는 아닙니다.

추가 분석 과제: [같은 120초의 두 설명](IDENTIFIABILITY_KO.md)을 손으로 계산하세요. 전체 시간은 같은데 왜 대안의 결과가 다른지, 어떤 관찰을 더 해야 구별할 수 있는지 본인의 말로 기록합니다. 사용자 설명상 시간은 채플실 시계를 참고했으며, 이를 초 단위 스톱워치 자료로 바꾸어 주장하지 않습니다.

변경안 과제: 사생회 공동 논의에서 본인이 실제로 제시한 의견·맡은 실행·측정 역할을 구분해 적습니다. [새 절차 관찰 양식](NEW_PROCEDURE_OBSERVATION_KO.md)을 사용해 실제 시행 후 공부 시작과 확인 완료를 따로 기록하세요. 의존관계 그래프에서 어떤 선을 없앴는지, 왜 새 확인시간을 몰라도 공부 시작 경로를 계산할 수 있는지 설명하고, 가정이 깨지는 경우를 하나 제시합니다. AI 코드의 결과를 본인의 독립 설계로 재표기하지 않습니다.
질문 부담 과제: [교내 선행 경험](LOCAL_PRECEDENT_KO.md)을 읽고 졸업생의 ‘착석 포함 2~3분’과 현재 ‘확인만 78초’가 왜 바로 비교되지 않는지 설명합니다. 질문 사건 수와 실제 질문시간, 사전 정보, 확인 대상 인원을 구분해 변수로 정의합니다. 질문 수를 포함한 예측이 인원 수만 쓰는 예측보다 나은지 검증할 계획과 반례를 직접 작성하세요. 현재 자료로 계수를 임의로 맞추거나 역사적 회상을 실측 표본으로 추가하지 않습니다.

### 비교를 다시 확인할 수 있는 기록 — 2026-11-17

보조자가 JSON/CSV 기록 미리보기를 연결했습니다. 다음 한 단계: **‘앞뒤 공백만 다름’ → ‘이번 비교의 JSON · CSV 기록 보기’ → ‘JSON 기록 보기’**를 누르세요. raw.first에는 원래 공백이 있고 normalized.first에는 공백이 없으며 result는 same입니다. 본인이 보게 될 코드의 입력·중간 값·결과를 한 기록에서 찾아보는 작업입니다. 아직 학생이 이 화면을 확인했다고 기록하지 않습니다.

### 공백 정리 함수 입력·연결 — 2026-11-18

사용자가 안내받은 틀을 저장한 뒤, 보조자가 제시한 정확한 한 줄 `return value.trim();`을 추가·저장했습니다. 함수는 null을 그대로 돌려주고 문자열의 앞뒤 공백만 지웁니다. 가운데 공백이나 ‘모름’이라는 글자는 보존합니다. 비교 함수가 별도로 빈칸·모름을 unknown으로 판단합니다.

보조자가 비교 판단과 기록 생성에 호출을 연결했고 화면은 기록에 담긴 값을 표시하도록 수정했습니다. 학생의 안내에 따른 코드 입력과 보조자의 연결·검증 작업을 구별합니다. 직접 실행 5개 입력과 기존 전체 66개 테스트·빌드가 통과했습니다.
