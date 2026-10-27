# Sources and retrieval scope — 2026-10-27

## User-provided context

- `Junmo_FlowBench_HANDOFF_2026-10-27.md`: read in full from the supplied local file. It is a starting specification, not original field evidence. The user subsequently authorized it as kickoff context.
- Current session: detailed seated-verification description and approximate five-minute estimate; explicitly user-reported. The later no-queue correction supersedes the earlier brief affirmative answer.
- Follow-up after kickoff: user explicitly answered “한 반씩 해” to distinguish sequential classes from simultaneous counting. This resolves reported serial class structure, not timing measurements or independent process verification.
- Subsequent roster screenshot: visually counted only group labels and nonempty name rows, yielding eight visible groups and 119 rows. User explicitly excluded penalty analysis. Only the aggregate table in GROUP_COUNTS_KO.md is retained; no names, individual scores or source image copied. Completeness and actual verification scope remain unconfirmed.
- Starter: user confirmed using the current handoff, without a separate Starter file.
- Shared earlier chat: background proposal, superseded where it conflicts with the detailed current workflow.
- Repository: https://github.com/J0hns0n-K/FlowBench — inspected via web, Git and authenticated API. No student identity inferred from access.

## Original activity sources not inspected

EC spreadsheet, Common App, essays and WIS records are referenced by the handoff only. Drive discovery calls for the named EC and Common App returned an unknown-tool error. Their original content was not retrieved or copied into the repository. Further original-source audit remains an open issue.

## Primary external sources

1. MySolvers official product page: https://www.mysolvers.com/ — capabilities described by vendor, not independently benchmarked.
2. Alexander Herzog MiniSimulator author repository: https://github.com/A-Herzog/MiniSimulator — README and project metadata reviewed; code not copied.
3. Dobson, G., & Shumsky, R. (2006). Web-based Simulations for Teaching Queueing, Little's Law, and Inventory Management. INFORMS Transactions on Education, 7(1), 106–124. https://doi.org/10.1287/ited.7.1.106 — publisher abstract and metadata reviewed, not full article.
4. Ma, N. L., Cheong, M. L. F., & Choy, J. (2011). Data Analysis and Monte Carlo Simulation of Airport Check-In Process. https://ink.library.smu.edu.sg/sis_research/1496/ — institutional abstract reviewed; full report unavailable there.
5. SimPy official time/scheduling documentation: https://simpy.readthedocs.io/en/4.0.2/topical_guides/time_and_scheduling.html — deterministic ordering reference, not a reused implementation.

Search lead only: https://www.sciencedirect.com/science/article/pii/S2351978919300769 — direct retrieval returned HTTP 403. No full-text findings attributed to it.

## Build tooling references

- Official action repositories https://github.com/actions/checkout and https://github.com/actions/setup-node reviewed for current usage. CI pins the v7 tag SHAs verified with `git ls-remote`, rather than a floating major version.
