# Implementation plan — architectural debt audit

Target version **1.1.0**. Every claim below traces to `synthesis.md`.

## Settled

| | Decision |
|---|---|
| Subject | Repo **and** design.json; each finding carries `subject` |
| Baseline | Currently-intended architecture (design.json + ADRs) → git history → principles-only |
| Trigger | Every full run **in repo mode**. Greenfield: skipped. Below the step-0 gate: no run, no audit |
| Delegation | Subagent where available, inline otherwise. **Never the detector** |
| Scope | Architectural only + git change-coupling and churn |
| New file | `AUDIT.md`, conditionally loaded (the `EXAMPLES.md` pattern) |
| Storage | `debt` object inside `design.json` |
| Volume | No cap. Five-part admission gate instead |
| Write-back | Renders; may seed `risks[]` / `nextSteps[]`. No candidate generation, no ADR to-do list |
| Tab | `#debt`, last, after `#compare` |
| Categories | Seven, ratified |
| User interaction | None. Unknowns → `confidence: low` + stated assumption; unverifiable → "could not verify" |
| ADR conformance | Highest-weight lens, not the spine |

## Decisions I made rather than asked — veto any

1. **The merge protocol lives in `AUDIT.md`, not `SKILL.md`.** `SKILL.md` gets ~12 lines and a link.
   The audit step always loads `AUDIT.md`, so nothing is lost, and `SKILL.md` stays far under its
   500-line cap (currently 142).
2. **The audit becomes a numbered step 8**, renumbering "Write, render, verify" → 9 and "Record the
   decision" → 10. It has to sit after candidates (so `resolvedBy` can be computed) and before
   rendering (so findings are in `design.json` when the report is generated).
3. **No new item in the nine-item completion contract.** `test-skill-contract.py` asserts exactly
   nine and lists all nine markers; the audit is about the design's *debt*, not its *completeness*,
   and conflating them is wrong. The grounding requirement goes in the unconstrained "Before
   rendering, verify:" list instead. Test stays green with no edit.
4. **`render_report.py` is untouched.** Substitution only — the CLAUDE.md invariant holds.
5. **The canonical example can't demonstrate this.** `examples/design-ticketing` is greenfield, and we
   skip greenfield. The renderer test gets a synthetic repo-mode fixture with a `debt` object. A real
   repo-mode example is a separate, later piece of work.

---

## Phase 1 — `AUDIT.md` and its provenance pack

The taxonomy decision. Sonar had to rebuild theirs and every downstream dashboard broke; we get to do
it once before anything depends on it.

### `skills/system-design/AUDIT.md`

Back-links `SKILL.md` in its opening lines (CLAUDE.md convention).

**§ Evidence first.** The execution order is mandatory, not stylistic: gather structural facts —
component graph, edge contracts, ADR list, git churn and change-coupling, the envelope rows — and
write them down *before* forming any verdict. Rationale: reframing a prompt alone produced decision
flip rates of 40–72%, and under a false premise ("this already passed static analysis") recall
dropped to **0.00**. Evidence-first prompting cut flips to 12–26%. The brief must never contain a
reassuring premise about the design's quality.

**§ The admission gate.** Five parts; failing any one means not emitted.
1. Cites evidence — file, component id, ADR id, git fact, or estimate row.
2. States the interest — what it costs, concretely. Can't? It's a `note`.
3. Survives its own `disconfirming` sentence — the strongest case that this is fine. If that case
   wins, the finding dies.
4. `blocking` names the specific `inv-*` or `nfr-*` it violates.
5. Passes the four debt tests: the trade-off is **unstated** (not merely made) · no recorded decision
   or variance already covers it · the component is actually touched (frozen code is near-zero debt,
   C = Σ cp·tp) · it isn't on the suppression list.

**§ The seven categories** — grouping axis, closed enum, plus optional `affects` drawn from the
existing eleven ratings axes so a multi-quality finding isn't forced into one bucket.

| Category | Patterns |
|---|---|
| `boundaries` | wrong cuts · feature concentration · scattered functionality · temporal decomposition · pass-through component · shallow component |
| `data-ownership` | two writers · shared persistence · dual writes · derived-without-source · derived-without-cursor · no ordering authority · unstated conflict resolution |
| `coupling` | dependency cycle · hub-like dependency · unstable dependency · information leakage · distributed monolith · special-general mixture |
| `dependency-contracts` | no deadline · no retry owner · unbounded backlog · unbounded result set · unstated idempotency · unstated compatibility direction |
| `failure-containment` | integration point without timeout · unbalanced capacities · no bulkhead · SLA inversion · no steady state · untested recovery · acknowledgement before durability |
| `over-engineering` | machinery outruns envelope · gold plating · unexploited flexibility · cargo-culted architecture · unjustified distribution |
| `obsolescence` | technological gap · superseded decision still implemented · stale reference model |

Each pattern entry: signature detectable in the artifact · why it is debt · prescription · the
`Not when` clause. Same shape as the archetype packs, so the file reads like the rest of the skill.

**§ Severity** — a 2×2 lookup, derived, never hand-picked, never numeric.

`consequence` = `breaking` (violates a `domain.entities[].invariants` entry, misses a
`requirements.nonFunctional` target, or creates an unrecoverable data hazard) | `friction`.
`exposure` = `on-path` (on `canvas.primaryFlow`, inside a component the recommended candidate
changes, or in a zone the migration touches) | `off-path`.

| | on-path | off-path |
|---|---|---|
| **breaking** | `blocking` — *Fix with this change* | `high` — *Schedule it* |
| **friction** | `medium` — *Fix while you're in there* | `low` — *Record only* |

Plus `note`: an observation with no remedy. No severity, never counted in the badge — mirroring
SARIF's rule that severity is only defined for actual failures.

**§ Suppressions** — the ~30 anti-rules, each with its citation. The load-bearing ones:
false DRY (identical code ≠ duplicated knowledge) · prototype and spike code is *supposed* to be bad ·
a declared simple starting point with a stated upgrade trigger is correct, not debt · a missing
component with a stated reason is a decision, not a gap · an unbalanced capacity ratio is a signal to
require a breaker, never to equalise capacity · "count of patterns applied" is never a quality metric ·
sophisticated machinery is not over-engineering when the stated NFRs demand it · never assert LSM vs
B-tree write amplification — flag the missing amplification story instead · absence of Byzantine
tolerance is not debt · eventual consistency is not debt; unspecified conflict resolution is ·
LWW is a legitimate choice unless the design also claims no lost updates · a leader is a
simplification, not a smell · deviation from a famous company's architecture is not a finding ·
speculative flexibility is itself the defect, so never prescribe an abstraction layer for a guessed
future · **shared** mutable state is the finding, never mutable state per se.

**§ Never recommend** — a rewrite (the Grand Redesign in the Sky exists to forbid it as an output) ·
async middleware as a routine finding (near-irreversible, often not the team's choice) ·
a restructure into an untested area without naming the coverage gap as the first item ·
splitting a component without paying the four costs of subdivision.

**§ Prescriptions** — `remedy.action` is a closed verb enum: **cut · consolidate · extract · replace ·
isolate · document**. One-word badge on the collapsed row, and a filter ("show me everything we'd
delete"). Every `replace` states its cost assumption explicitly rather than assuming it.

**§ Identity and the merge protocol.**
`id = "dbt-" + pattern + "--" + sort(componentIds).join("-")`. Prose contributes nothing. No line
numbers, no paths, no ordinal index. Store the ingredients in `identity` so a future run can rematch
with a better algorithm. Version the scheme; keep `aliases[]`. Collisions mean the same finding —
merge, never append `#2`.

Eight steps: read prior file (id **and** aliases) → generate independently, without priming the model
on the old list → join → set `baselineState` → carry `status`/`justification`/`acceptedUntil`/
`firstSeen`/`aliases` forward → regenerate prose freely → keep `absent` for one run in a collapsed
section, because for an LLM producer a disappearance is at least as likely to be a miss as a fix →
first run omits `baselineState` entirely (SARIF's all-or-none constraint).

**§ The honest limit.** Identity is stable for findings the model finds *again*. Recall is not stable
and no published technique fixes that. `debt.checked[]` enumerates categories examined so a clean
category reads as checked, not missed. The report states this in its own methodology line.

**§ The pipeline.** Eight stages, each with a narrow brief and a structured output contract. Stages
pass **conclusions, never reasoning** — a stage that sees the previous stage's argument anchors on it.
Every stage is restartable from the artifact before it.

Grounding rationale: LLM-as-detector is the weak configuration (63.1% of tool-detected architectural
smells were expert-judged false positives; the most aggressive repair agent introduced 140 new ones).
LLM-as-refuter is the strong one (κ up to 0.94 with human experts at spotting false positives). The
pipeline is built on that asymmetry.

| # | Stage | Input | Output | Effort |
|---|---|---|---|---|
| 0 | **Facts** — no judgment | repo, git, design.json, ADRs | component graph, edge contracts, ADR inventory with statuses, per-path churn, change-coupling pairs, envelope rows, `inv-*`/`nfr-*` ids | deterministic |
| 1 | **Find** — one pass per category | facts + `AUDIT.md` rules | candidate findings: `pattern`, `components`, `evidence[]`, `claimedConsequence`, `claimedExposure`. Never primed with the prior run's findings | xhigh |
| 2 | **Mechanical gates** — **every** finding | candidates + facts | *Fact*: re-read the cited files/ids; evidence doesn't hold → **delete**. *Inertness*: churn on cited components; untouched → **demote**, never delete (frozen code can still be blocking on the primary flow) | low |
| 3 | **Red team** — scaled by provisional severity | facts + the claim, **not** the finder's argument | one agent per lens, each prompted to **refute**, defaulting to refuted on uncertainty. `blocking`/`high` → *Guardrail* and *Decision* separately. `medium`/`low` → one combined pass | xhigh |
| 4 | **Re-derive severity** | verified facts | consequence × exposure recomputed from what survived, not what was claimed | deterministic |
| 5 | **Remedy** — fresh author | confirmed finding + facts + the "never recommend" list | `remedy{action,text}`, `effort`, `resolvedBy` per candidate, `reversibility`. Never saw stages 1–3 | xhigh |
| 6 | **Merge** | prior `design.json` | the eight-step protocol; `baselineState` set | deterministic |
| 7 | **Render** | — | — | — |

**Kill rules.** A *Fact* refutation deletes — the claim is simply untrue. A *Decision* refutation
deletes — a recorded decision makes it a decision, not debt. A *Guardrail* refutation **demotes** and
its objection becomes the finding's `disconfirming` text. An *Inertness* refutation demotes. The
asymmetry is deliberate: a wrong kill loses a real finding silently, and Google's 10% budget prices
false positives but says nothing about the cost of a silent miss.

**`disconfirming` is no longer self-authored.** It is the strongest objection the red team actually
raised and that the finding survived. That is the field a skeptical reader reaches for first, and a
self-generated straw man is worth nothing there.

**Tools are opportunistic, never required.** The verifier uses web search, exa, deepwiki, or a local
verification skill when the harness offers them, at its discretion. **The audit must complete with
none of them available** — that is what keeps the skill portable to Codex and Cursor. Each finding
records which tools actually ran, so the reader sees the grounding level instead of guessing.

**Without a subagent primitive**, the same stages run inline as sequential passes with the framing
explicitly cleared between them. The stage contracts are the artifact; delegation is an optimization.

**`verification` sub-object** on every finding — gates run and their verdicts, each lens with its
objection and whether it refuted, tools used, and the count of refutation attempts survived. It
renders. A finding that survived two adversaries and one that survived none are not the same claim,
and collapsing them discards the most trustworthy signal the loop produces.

### `docs/provenance/AUDIT.md`

Mirrors every `##` heading. One row per claim carrying a number, threshold, or correctness claim.

**Rejected** section — the most valuable part, so these can't be quietly re-added:
Ousterhout's 10–20% investment figure (*he* labels Fig 3.1 qualitative and says no empirical
measurement exists) · "42% of developer time" (misattributed; the source never prints it and measures
maintenance) · CISQ/CAST trillion-dollar figures (inflation projections, internally inconsistent,
double-count the same survey) · debt in hours or dollars (SonarQube divides by an uncalibrated
30-min-per-LOC constant; measured against real fix times it overestimates in >70% of projects) ·
any headline score (Sonar's Maintainability Rating scores AUC 0.60 against 70 developers; a naive
275-line count scores 0.95) · smell severity rankings (smell *type* does not significantly correlate
with change, and the effect reverses in small artifacts) · "Vendor King" (not in FoSA) · the
fitness-function taxonomy (in *Building Evolutionary Architectures*, not FoSA) · any DDIA citation for
linearizability, partitioning, transactions, CDC, or schema compatibility (absent from the local 2015
Early Release).

Also add `AUDIT.md` to `docs/provenance/README.md`'s Files list.

---

## Phase 2 — schema and process

**`HTML-REPORT.md`**: the `debt` object (24 fields, ~8 optional) · schema rule 8 on finding identity
and merge · the new tab in the tab list and the "what the rendered report does" section · vocabulary
additions — use exactly *finding · debt · severity · remedy · evidence*; never substitute *issue,
problem, violation* for finding, or *score* for severity.

**`SKILL.md`**: new step 8 "Audit the architecture for debt", renumber 9 and 10. Two lines in step 2
noting that ADRs read there are the audit's reference model. Three lines added to "Before rendering,
verify": every finding cites evidence and clears the admission gate; every `blocking` finding names
the invariant or target it violates; `debt.checked[]` lists every category examined.

**`CLAUDE.md`**: add `AUDIT.md` to the sibling list; add the invariants — the category and severity
enums are closed and their sizes are asserted; findings never carry a numeric score or an
hours/dollars estimate; the merge protocol lives in `AUDIT.md`.

---

## Phase 3 — renderer (`assets/report-template.html`)

New `#debt` tab, last. ~250 lines JS, ~120 lines CSS, in the existing Wikipedia-style system.

- **Group by component, order by severity.** Severity is a facet and a sort key, never the grouping
  axis — that's what all six surveyed tools do.
- **APG Disclosure**, not bare `<details>`: `<h3><button aria-expanded aria-controls>`. Screen-reader
  exposure of `<summary>` is inconsistent, and closed `<details>` content is invisible to Ctrl+F —
  fatal when the reader's first move is searching for a component name.
- **Collapsed row carries every searchable token**: component names, pattern, remedy verb, severity
  text, `resolvedBy`. Expanded body is Sonar's three: *Where · Why · How*.
- **Open findings never collapse as a group.** Only `Accepted (N)`, `No longer present (N)`, and
  `Notes (N)` are collapsible — matching Lighthouse's actual renderer, not the folk version of it.
- **Filter chips** are `aria-pressed` toggles in a labelled `role="group"`, and they re-sort as well
  as filter. **On filter change, move focus to the results-count element** (`tabindex="-1"`,
  `aria-live="polite"`) — otherwise focus falls to `<body>` and the user is silently teleported to the
  top. That is the single most likely accessibility bug in this feature.
- **Severity badges carry text, not colour** — WCAG 1.4.1, and it survives printing.
- **Legend on the page**, including the honest sentence: a 2×2 buys reproducibility and cheap
  communication at the cost of resolution, and does not rank-order precisely.
- **Below ~5 findings, render expanded** and skip the disclosure entirely.
- **Print CSS**: force disclosures open (`::details-content` plus the older fallback), undo filter
  state so a filtered screen never prints a censored report, `break-inside: avoid`, hide chrome,
  print the legend. A `beforeprint` JS sweep is unreliable — Chrome's print-preview timing catches
  only the first element.
- **Check the existing tab strip** while in there: APG Tabs wants roving `tabindex` and
  `aria-controls`/`aria-labelledby` pairing. Pre-existing gap if present, cheap to fix now.

---

## Phase 4 — tests

**`test-skill-contract.py`**: `AUDIT.md` exists and back-links `SKILL.md` · `SKILL.md` links it at the
audit step · `docs/provenance/AUDIT.md` exists and its `##` headings mirror · the category enum has
exactly seven members and severity exactly four · every pattern entry carries a `Not when`.

**`test-report-renderer.py`**: synthetic repo-mode fixture with a `debt` object · the tab renders and
is reachable by hash · findings group by component · `aria-expanded` toggles · collapsed sections
present with `(N)` counts · print stylesheet present · the four existing diagnostics still read `0`.

---

## Phase 5 — docs and release

`README.md` — a section in "The complete journey" and a row in the artifacts table.
`CHANGELOG.md` — 1.1.0.
Version bump in three places that must agree: `SKILL.md` frontmatter, `plugin.json`, `marketplace.json`.
`SKILL.md` frontmatter `description` — add the audit so "audit our architecture for tech debt" invokes
the skill; keep under 1024 chars.
`docs/evaluations/invocation-cases.json` — one new case for an audit-shaped prompt.

---

## Estimates

| Phase | Work | Time |
|---|---|---|
| 1 | `AUDIT.md` (taxonomy, gate, suppressions, the eight stage briefs and their output contracts) + provenance pack | 3–4 h — the bulk, and the part needing your review |
| 2 | Schema + process, incl. the `verification` sub-object | 1 h |
| 3 | Renderer, incl. rendering the verification record | 2.5 h |
| 4 | Tests | 1 h |
| 5 | Docs + release | 30 min |

~8 hours total. Phase 1 is the one that's expensive to change later.

**Run cost.** Stage 0 and 2 are cheap and run on everything. Stages 1, 3 and 5 are xhigh and scale
with what survives, so a clean repo costs little and a rotten one costs what it should. The one thing
to watch during Phase 1: this feature must not become the kind of machinery the skill's own
anti-overengineering gates would reject.

## Not building

Standalone audit mode · greenfield audits · candidate generation from findings · ADR write-back ·
any numeric score, debt index, or hours/dollars estimate · code-level smells · a real repo-mode
example (separate work).

---

## What changed during implementation

Four of this plan's decisions were reversed while building. They are recorded here
rather than edited away, because the reasoning that produced them was wrong in ways
worth being able to find again.

**Grouping is by category, not component.** The plan said component; `AUDIT.md` said
category. `components` is an array, so grouping by it would either duplicate a finding
across groups or force an arbitrary primary. Category also keeps the group count stable
between runs. Components drive the filter chips instead, which is where the
"act on one component" need is actually served.

**Native `<details>`, not a button with `aria-expanded`.** The plan chose the button
partly because closed `<details>` was said to be invisible to find-in-page. That is
backwards: find-in-page reveal is in the HTML Standard and shipped in all three engines,
while `aria-expanded` plus `display:none` is invisible to it permanently. The button
choice survived on a different ground — screen-reader exposure of complex content inside
`<summary>` — which the implementation avoids by putting the heading on the group rather
than in the summary. Native `<details>` then costs no toggle script, no state to keep in
sync, and no focus to repair, and it is what makes the print stylesheet able to open
every row.

**Findings are always collapsed.** The plan said render expanded below about five
findings. The shipped behaviour is uniform, and the test asserts it: a panel whose shape
changes with its own contents is harder to describe than it is worth.

**Focus is not moved on filter change.** The plan called this "the single most likely
accessibility bug in this feature" and then specified `tabindex="-1"` and `aria-live` on
the same element, which produces the duplicate announcement it was trying to avoid. The
stated reason for moving focus only holds if the list is rebuilt; filtering hides rows
that already exist, so focus never moves and there is nothing to repair.

The print CSS in Phase 3 was also wrong as written — `@media (print)` parenthesises a
media type as if it were a feature, so the block never applies. The shipped stylesheet
uses `@media print`.
