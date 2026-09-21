---
name: agents
description: When to delegate to a specialist sub-agent (planner, architect, tdd-guide, code-reviewer, security-reviewer, …) and how to run independent analyses in parallel.
---

# Agent Orchestration

## Available agents

Defined in `~/.thekiwidev/agents/` (installed into your runtime's agents directory where it has one; otherwise adopt the role described in the file).

| Agent | Purpose | When to use |
|-------|---------|-------------|
| planner | Implementation planning | Complex features, refactors, anything touching several files |
| architect | System design | Architectural decisions, boundaries, trade-offs |
| tdd-guide | Test-driven development | New features, bug fixes |
| code-reviewer | Code review | Immediately after writing or modifying code |
| security-reviewer | Security analysis | Auth, input handling, secrets, payments — before the owner commits |
| build-error-resolver | Fix build errors | When the build or typecheck fails |
| e2e-runner | E2E testing | Critical user flows |
| refactor-cleaner | Dead code cleanup | Maintenance passes |
| doc-updater | Documentation sync | Keeping docs/ai and codemaps current |

## Use without being asked

1. Complex feature request → **planner**
2. Code just written or modified → **code-reviewer**
3. Bug fix or new feature → **tdd-guide**
4. Architectural decision → **architect**

Delegation never bypasses the owner's approval gates: a plan produced by **planner** still waits for the owner before implementation, and no agent performs Git operations.

## Parallel execution

Run independent analyses in parallel when the runtime supports it:

```markdown
# GOOD: parallel, independent
1. security analysis of auth.ts
2. performance review of the cache layer
3. type audit of utils.ts

# BAD: sequential when nothing depends on the previous result
```

## Multi-perspective analysis

For hard problems, split roles: factual reviewer · senior engineer · security expert · consistency reviewer · redundancy checker. Merge the findings; do not average them.
