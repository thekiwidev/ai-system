---
name: build-fix
description: Incrementally fix TypeScript/build errors one at a time using the project's real build command; stops when a fix introduces new errors or the same error persists after three attempts.
invocable: true
---

# Build and Fix

Incrementally fix TypeScript and build errors:

1. Run the project's build command (from docs/ai/VERIFICATION.md or package.json scripts; e.g. `bun run build`, `pnpm build`, `npm run build`)

2. Parse error output:
   - Group by file
   - Sort by severity

3. For each error:
   - Show error context (5 lines before/after)
   - Explain the issue
   - Propose fix
   - Apply fix
   - Re-run build
   - Verify error resolved

4. Stop if:
   - Fix introduces new errors
   - Same error persists after 3 attempts
   - User requests pause

5. Show summary:
   - Errors fixed
   - Errors remaining
   - New errors introduced

Fix one error at a time for safety!
