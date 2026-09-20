# Security Policy

## Supported versions

This project is released from the `main` branch and deployed to
https://srigurugranthsahib.vercel.app/. Only the latest `main` is supported
with security updates.

| Version | Supported |
| ------- | --------- |
| `main` (latest) | Yes |
| Older commits / forks | No — please update to latest `main` |

## Reporting a vulnerability

**Do not open a public GitHub issue for security reports.**

- Open a private
  [GitHub Security Advisory](https://github.com/mithun-srinivasan/srigurugranthsahib/security/advisories/new)
  against this repository, or contact the maintainers through the contact
  listed on the repository profile.
- Include: affected routes or files, steps to reproduce, impact assessment,
  and any logs or screenshots (redact secrets and personal data).
- Expect an acknowledgement within 72 hours and a remediation plan once the
  issue is confirmed.

## What to report

- Authentication / authorisation bypasses, stored or reflected XSS, SSRF in
  server actions (`app/**/actions.ts`, `lib/data.ts`), open redirects,
  service-worker cache poisoning, or data-loss bugs in backup/restore
  (`lib/backup.ts`).
- Upstream scraping concerns (SGPC / BaniDB) that leak headers, tokens, or
  user data.

Out of scope: availability of upstream providers (BaniDB, hs.sgpc.net),
social-engineering reports without a code path, and theoretical issues with
no reproduction.

## Handling of user data

All reading data (bookmarks, notes, highlights, progress, prefs) is stored
only in the user's browser `localStorage`. There is no server-side account
store. Security fixes must preserve the backup/restore envelope contract in
`lib/backup.ts` and must never silently exfiltrate local data.
