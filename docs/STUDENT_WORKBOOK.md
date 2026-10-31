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

현재 진행 (2026-10-31): 사용자가 문의 순서·행선지 전달 후 종료에 이어 **잘 모르면 사감쌤이나 다른 리더에게 묻는다**는 조건을 제출했습니다. [절차와 구현 범위](ESCALATION_PROCEDURE_KO.md)에 원문·보조 형식화·테스트를 구분했습니다. Codex가 첫 문의 모듈과 테스트 5개를 구현했으며 학생의 독립 코딩 성과로 귀속하지 않습니다. 다음 개발 단계는 익명 가상 시나리오 비교에 이 분기 결과를 연결하는 것입니다. 현재 추가 질문·시간 측정 요청은 보류합니다. 아래 학생 과제들은 참고용 대기 목록이며 한꺼번에 수행할 필요는 없습니다.

추가 분석 과제: [같은 120초의 두 설명](IDENTIFIABILITY_KO.md)을 손으로 계산하세요. 전체 시간은 같은데 왜 대안의 결과가 다른지, 어떤 관찰을 더 해야 구별할 수 있는지 본인의 말로 기록합니다. 사용자 설명상 시간은 채플실 시계를 참고했으며, 이를 초 단위 스톱워치 자료로 바꾸어 주장하지 않습니다.

변경안 과제: 사생회 공동 논의에서 본인이 실제로 제시한 의견·맡은 실행·측정 역할을 구분해 적습니다. [새 절차 관찰 양식](NEW_PROCEDURE_OBSERVATION_KO.md)을 사용해 실제 시행 후 공부 시작과 확인 완료를 따로 기록하세요. 의존관계 그래프에서 어떤 선을 없앴는지, 왜 새 확인시간을 몰라도 공부 시작 경로를 계산할 수 있는지 설명하고, 가정이 깨지는 경우를 하나 제시합니다. AI 코드의 결과를 본인의 독립 설계로 재표기하지 않습니다.
질문 부담 과제: [교내 선행 경험](LOCAL_PRECEDENT_KO.md)을 읽고 졸업생의 ‘착석 포함 2~3분’과 현재 ‘확인만 78초’가 왜 바로 비교되지 않는지 설명합니다. 질문 사건 수와 실제 질문시간, 사전 정보, 확인 대상 인원을 구분해 변수로 정의합니다. 질문 수를 포함한 예측이 인원 수만 쓰는 예측보다 나은지 검증할 계획과 반례를 직접 작성하세요. 현재 자료로 계수를 임의로 맞추거나 역사적 회상을 실측 표본으로 추가하지 않습니다.
