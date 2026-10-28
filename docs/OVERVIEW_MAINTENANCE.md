# Keeping the project overview current

README is the project's first reading path. It connects the question, changed assumptions, implementation, evidence, contributors and remaining tests. Its narrative is reviewed whenever the investigation changes; the generated block keeps the current quantitative evidence tied to source records.

## Update with the work

1. Preserve each field report as a new anonymous record in `data/`. Separate measurements, self-report, assumptions and unknowns. Keep earlier records intact.
2. Update the relevant decision, field-report and contribution records. Link actual artifacts; distinguish committee decisions, Junmo's field work, peer measurement and assisted code.
3. When adding a direct-performance record, review its schema and comparability, then list it in `docs/overview-state.json`. Select the relevant report document. Records must be ordered by received date; ordering records received on the same date needs an explicit editorial decision.
4. Revise README's narrative as a whole: the active question, present stage, interpretation, software capabilities, limitations, people and next investigation. Replace superseded framing and the screenshot when needed. Synchronizing numbers alone does not establish that the narrative is current.
5. Run `pnpm docs:sync`, read the complete README, then run `pnpm docs:check`. Commit the source records and overview together.

## What the checks enforce

The generator uses the same validated accounting function as the app. It preserves negative differences and unknown study/accuracy values. New direct-performance records must be explicitly reviewed in the index; unsupported evidence schemas fail rather than produce a stronger claim automatically.

An evidence fingerprint covers data records, source/tests, the text/JSON documents in `docs/`, the build/experiment/overview scripts, CI workflow and package metadata. GitHub Actions rejects an out-of-date generated block. The fingerprint normalizes line endings for Windows/Linux reproducibility.

This catches an overlooked update. It does not verify human authorship, audit attendance, establish causality or write the evolving narrative automatically. A new research question or verified outcome needs an explicit editorial and evidence review. Figures and conditional examples outside the generated block remain part of that review.
