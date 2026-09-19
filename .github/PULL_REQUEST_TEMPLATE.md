## Summary

<!-- What does this PR change, and why? Link related issues: Fixes #123 -->

## Verification

<!-- How did you verify it? Paste commands and results. -->

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` reports 0 errors
- [ ] `npm run validate:sgpc` passes (if `public/data/` touched)
- [ ] `npm run test` passes (if UI / data flows touched)

## Contributor checklist

- [ ] Focused scope — one feature or fix per PR
- [ ] New shortcuts registered in `lib/shortcuts.ts` (if any)
- [ ] New user-data keys added to `BACKUP_KEYS` in `lib/backup.ts` (if any)
- [ ] Service-worker `CACHE` bumped in `public/sw.js` (if worker changed)
- [ ] Upstream-dependent specs assert live-content **or** fallback, never live-only
- [ ] `README.md` test count / diagrams / structure map updated (if needed)
- [ ] No generated or secret artefacts committed (`.next/`, `test-results/`,
      `playwright-report/`, `.vercel/`, `.env*`, `next-env.d.ts` churn)

## Screenshots / notes

<!-- Screenshots for UI changes; notes for reviewers on domain rules touched
(Hukamnama sourcing, SGPC year math, top-bar contract, offline behaviour). -->
