# Related work audit — 2026-10-27

Primary sources inspected; no copied implementation or benchmark comparison is claimed.

| Source | What the source establishes | Implication and limit for FlowBench |
| --- | --- | --- |
| [MySolvers](https://www.mysolvers.com/) — official product page | Visual browser-based DES with generators, servers, traffic profiles, distributions and batch summaries. Vendor capabilities were read, not independently performance-tested. | Browser execution, burst inputs, seeded experiments and percentiles are not distinctive on their own. FlowBench is deliberately much narrower. |
| [Alexander Herzog, MiniSimulator](https://github.com/A-Herzog/MiniSimulator) — author repository | A general G/G/c/K+G queueing web simulator, including impatience, retries and batch options. | A general queue simulator is established prior work; avoid world-first or algorithm-invention claims. No source code reused. |
| [Dobson & Shumsky (2006), INFORMS Transactions on Education](https://doi.org/10.1287/ited.7.1.106) — publisher abstract | Interactive web simulations teach queueing, variability and process-flow concepts. Only publisher abstract/metadata reviewed. | An educational web simulator alone is not new. Local process validation and explicit counterexamples must provide the project-specific investigation. |
| [Ma, Cheong & Choy (2011), Data Analysis and Monte Carlo Simulation of Airport Check-In Process](https://ink.library.smu.edu.sg/sis_research/1496/) — institutional record | The abstract describes data-based service-level capacity planning for airport check-in. Full report unavailable on this record. | Service-level targets and counter-count simulation precede this project. Airport distributions and results cannot establish school timing parameters. |
| [SimPy, Time and Scheduling](https://simpy.readthedocs.io/en/4.0.2/topical_guides/time_and_scheduling.html) — official documentation | Equal-time events require explicit deterministic ordering. | Motivates documenting ties and testing them. FlowBench uses a specialized FCFS recurrence, not SimPy or copied code. |

The 2019 paper “Impact of Passenger-Arrival Patterns in Outbound Processes of Airports” was found, but direct publisher retrieval returned 403. It is a search lead, **not reviewed evidence** in this audit.

## Defensible contribution, if completed by the student

An evidence-grounded model of seated attendance-checking dependencies, reproducible timing experiments, an explicit coordinator bottleneck test, and validation against approved anonymous observations. The correction of an attractive but false entrance-queue premise is part of the research record.

This is an **application and validation contribution**, not a new queueing method. It is not yet established as student-original work or as a validated improvement. A parallel workflow could be infeasible, raise error rates, or provide little benefit if reporting dominates. Those are reasons to test the idea rather than assume adoption.
