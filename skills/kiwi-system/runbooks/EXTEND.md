# EXTEND — add a module that was previously pruned

**Use when** the owner asks for a module (domain document, workflow, adapter, plans directory, …) that `SYSTEM.md` → `modules.pruned` or `not_applicable` records as absent. **Spec:** INITIALIZER §24.9. "The owner asked" is sufficient evidence of need; YAGNI still bounds the size.

## Steps

1. **Intake** — `_shared.md` S1. Read `SYSTEM.md` → `modules.pruned` / `not_applicable` and state the recorded reason for the module's absence.
2. Establish, from repository evidence or the owner's statement, that the reason no longer holds. If the evidence contradicts the owner ("we now have a worker" but there is no worker), say so and **STOP**.
3. **STOP** — state exactly what will be created (one module, smallest useful version) and what will deliberately not be created alongside it. Wait.
4. Create it from the matching template (`templates/docs-ai/…`); register any rules it introduces in `RULES.md`; add it to `INDEX.md` (and the relevant sub-index) with a plain statement of when an agent should read it.
5. `SYSTEM.md`: move the module from pruned to present, keeping the pruning history as a note; `mode_history` entry.
6. **Finish** — `kiwi doctor --project` → report what was created and what was intentionally left out → Git line.
