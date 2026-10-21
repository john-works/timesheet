# Security & Vulnerability Report

- **Application:** Kimai (Symfony 6.4 LTS) — Timesheet
- **Path:** `/var/www/html/timesheet`
- **Runtime:** PHP 8.3.29, Node/npm build toolchain
- **Audit date:** 2026-10-21
- **Auditor:** Automated review (Composer/NPM audits + manual config/secret review)

---

## 1. Executive summary

| Area | Result | Risk |
|---|---|---|
| Hardcoded credentials in tracked files | LDAP service account + DB password in 6 files | **Critical** |
| Sensitive data in repository | 5 SQL dumps (2 with password hashes) tracked in git | **High** |
| PHP dependencies | 45 advisories / 17 packages (1 critical, 13 high, 15 medium, 10 low, 6 unknown); 1 abandoned package | **High** |
| JavaScript dependencies | 15 advisories (10 high, 5 moderate) | **Medium** |
| Public attack surface | Unauthenticated cache-wipe / opcache-reset scripts | **Medium** |
| Application security config | CSRF on login, login throttling, prod mode | Good |

**Overall risk before remediation: HIGH.**

---

## 2. Findings

### 2.1 Critical — Hardcoded credentials committed to git

Plaintext secrets are present in tracked files:

| File | Secret |
|---|---|
| `ad_pw_probe.php` | LDAP service-account password |
| `dc_cmp2.php` | LDAP service-account password |
| `create_teams.php` | LDAP service-account password + DB password |
| `import_ldap_users.php` | LDAP service-account password + DB password |
| `src/Command/LdapSyncCommand.php` | LDAP service-account password (CLI option default) |
| `src/Controller/LdapSyncController.php` | LDAP service-account password (hardcoded argument) |
| `config/packages/local.yaml` | LDAP service-account password (local, gitignored, still plaintext on disk) |

The service account is a domain account used to bind to Active Directory (`CN=itop_user,...`).
Anyone with repository access can read and reuse these credentials. The credentials also
remain in git history even after the files are changed.

**Impact:** Unauthorized LDAP/AD access, potential lateral movement, and unauthorized DB access.

**Remediation:** rotate both passwords, remove secrets from code, load them from environment
variables/Symfony secrets, delete throwaway probe scripts, and purge git history.

---

### 2.2 High — Sensitive SQL backups tracked in git

The following dumps are tracked:

- `backup_20260729.sql`
- `timesheet_new_backup_20260727_174927.sql` — contains password hashes (bcrypt/argon2)
- `recreate_elizabeth_timesheet.sql`
- `restore_elizabeth_real_timesheet.sql`
- `restore_elizabeth_submissions.sql`

The dumps contain user records, password hashes, and timesheet/personal data.

**Remediation:** remove from the working tree/repository, ignore future dumps, purge history,
and treat the exposed hashes/PII as a potential data breach.

---

### 2.3 High — PHP dependency vulnerabilities (Composer)

`composer audit`: **45 advisories affecting 17 packages** (1 critical, 13 high, 15 medium, 10 low, 6 unknown).
One abandoned package: `doctrine/cache`.

Highest-risk items:

| Package | Installed | Advisory | Severity | Fixed in |
|---|---|---|---|---|
| `twig/twig` | 3.24.0 | CVE-2026-46633 — PHP code injection via `{% use %}` | Critical | 3.26.0+ |
| `twig/twig` | 3.24.0 | CVE-2026-46640 — arbitrary PHP execution via macro reference | High | 3.26.0+ |
| `twig/twig` | 3.24.0 | Multiple sandbox bypasses (CVE-2026-49981, -48806/7/8, -47732, -24425, -46639) | High | 3.26.0–3.27.0+ |
| `symfony/security-http` | 6.4.34 | CVE-2026-48489 — firewall bypass via `failure_forward` | High | 6.4.41 |
| `symfony/security-http` | 6.4.34 | CVE-2026-45063 — identity spoofing via unanchored DN regex | High | 6.4.40 |
| `symfony/monolog-bridge` | 6.4.36 | CVE-2026-45077 — unauthenticated PHP object deserialization | High | 6.4.40 |
| `symfony/mime` | 6.4.36 | CVE-2026-45067 — email/SMTP header injection via CRLF | High | 6.4.40 |
| `phpoffice/phpspreadsheet` | 2.4.5 | CVE-2026-59932/59933/… — memory-exhaustion DoS | High | 2.4.7+ |
| `spomky-labs/otphp` | 11.4.2 | Provisioning-URI OTP state corruption / `DivisionByZeroError` | High | 11.4.3 |
| `symfony/cache` | 6.4.36 | CVE-2026-45073 — SQL injection in `PdoAdapter::doClear()` | Medium | 6.4.40 |
| `symfony/runtime` | 6.4.30 | CVE-2026-46626 — `APP_ENV`/`APP_DEBUG` override | Medium | 6.4.40 |
| `symfony/routing` | 6.4.34 | CVE-2026-48784 / -45065 — URL generation / off-site injection | Medium | 6.4.41 |
| `symfony/yaml` | 6.4.34 | CVE-2026-109413 / -45304 / -45305 / -45133 — parser DoS | Low–Medium | 6.4.45+ |
| `symfony/expression-language` | 6.4.32 | CVE-2026-109449 — unbounded nesting crash | Medium/Unknown | 6.4.48+ |
| `symfony/http-foundation` | 6.4.35 | CVE-2026-108082 (ReDoS), CVE-2026-48736 (SSRF bypass) | Medium | 6.4.46+ |

Most fixes are available in the Symfony 6.4 LTS patch line. Twig must be upgraded to the
latest 3.x because 3.24.0 predates every listed fix.

---

### 2.4 High/Medium — JavaScript dependency vulnerabilities (npm)

`npm audit`: **15 vulnerabilities (10 high, 5 moderate)**. All packages are declared under
`dependencies` (build toolchain). Most are build-time only; the runtime-relevant one is
`dompurify` 3.4.15 (multiple XSS/attribute-pollution advisories).

Examples: `dompurify`, `serialize-javascript`, `postcss`, `svgo`, `fast-uri`, `browserslist`,
`brace-expansion`, `immutable`, `js-yaml`, `nanoid`, `source-map-js`.

**Remediation:** `npm audit fix` (the `serialize-javascript` fix via webpack-encore 7 is a
breaking change and should be scheduled separately).

---

### 2.5 Medium — Unauthenticated maintenance endpoints

In the public web root:

- `public/clear-cache.php` — any anonymous visitor can wipe the prod cache pool.
- `public/ocreset.php` — any anonymous visitor can reset OPcache.

**Impact:** trivial denial of service.

---

### 2.6 Positive findings

- `APP_ENV=prod`; `APP_DEBUG` not enabled.
- `.env` is not tracked in git.
- Form login enforces CSRF (`enable_csrf: true`) and login throttling (5 attempts / 5 min).
- API firewall is stateless with a token handler; the secured area uses a `UserChecker`.
- LDAP sync controller is protected by `#[IsGranted('system_configuration')]` and CSRF token.

---

## 3. Remediation plan

1. Rotate the LDAP service-account and database passwords.
2. Replace hardcoded secrets with environment variables; delete probe scripts.
3. Untrack and ignore SQL dumps; purge secrets from git history.
4. Update Composer dependencies (Symfony 6.4 patch line + Twig + otphp + phpspreadsheet) and re-audit.
5. Run `npm audit fix` and re-audit.
6. Remove/protect the public maintenance endpoints.
7. Verify application boot, routes, and audit results.

---

## 4. Remediation results (applied)

The following changes were applied on 2026-10-21. Nothing was committed to git; changes are
left in the working tree for review.

### 4.1 Secrets removed from code

| Item | Status |
|---|---|
| `ad_pw_probe.php`, `dc_cmp2.php` | Deleted (`git rm`) |
| `create_teams.php` | DB + LDAP credentials now read from env; loads `.env` via Dotenv |
| `import_ldap_users.php` | DB + LDAP credentials now read from env; loads `.env` via Dotenv |
| `src/Command/LdapSyncCommand.php` | Credentials/options default from `$_ENV` |
| `src/Controller/LdapSyncController.php` | Credentials read from `$_ENV` |
| `.env` (untracked) | Added `LDAP_*` and `DB_*` variables (local values preserved) |
| `.env.dist` (tracked) | Added `LDAP_*` and `DB_*` placeholders (`change-me`) |

Verification: `git grep -nE "ppda2016|ppda2022" -- .` returns **no matches** in tracked files.

### 4.2 SQL dumps untracked

- `backup_20260729.sql`, `timesheet_new_backup_20260727_174927.sql`,
  `recreate_elizabeth_timesheet.sql`, `restore_elizabeth_real_timesheet.sql`,
  `restore_elizabeth_submissions.sql` were removed from git tracking with `git rm --cached`
  (local copies preserved on disk).
- `.gitignore` now ignores `*.sql`, `*.dump`, `*.sql.gz` and one-off secret/probe files.

### 4.3 PHP dependencies updated

`composer update "symfony/*" twig/twig spomky-labs/otphp phpoffice/phpspreadsheet --with-dependencies`

| Package | Before | After |
|---|---|---|
| `twig/twig` | 3.24.0 | **3.30.0** |
| `symfony/security-http` | 6.4.34 | **6.4.48** |
| `symfony/security-bundle` | 6.4.36 | **6.4.48** |
| `symfony/mime` | 6.4.36 | **6.4.46** |
| `symfony/mailer` | 6.4.34 | **6.4.46** |
| `symfony/monolog-bridge` | 6.4.36 | **6.4.45** |
| `symfony/http-foundation` | 6.4.35 | **6.4.48** |
| `symfony/routing` | 6.4.34 | **6.4.47** |
| `symfony/runtime` | 6.4.30 | **6.4.41** |
| `symfony/cache` | 6.4.36 | **6.4.47** |
| `symfony/yaml` | 6.4.34 | **6.4.48** |
| `symfony/expression-language` | 6.4.32 | **6.4.48** |
| `spomky-labs/otphp` | 11.4.2 | **11.5.0** |
| `phpoffice/phpspreadsheet` | 2.4.5 | **2.4.8** |

**Composer audit: 45 advisories → 3 advisories.**

Remaining (no patched release available at audit time):

| Package | Severity | Advisory |
|---|---|---|
| `setasign/fpdi` 2.6.6 | Medium | CVE-2026-45802 — memory exhaustion / endless loop DoS |
| `twig/cssinliner-extra` 3.24.0 | Low | CVE-2026-46637 — HTML-output `is_safe` declaration |
| `twig/intl-extra` 3.24.0 | Low | CVE-2026-46629 — formatter memoisation growth |

`doctrine/cache` remains abandoned (tech-debt, not a known vulnerability).

### 4.4 JavaScript dependencies updated

`npm audit fix` was run (non-breaking).

**npm audit: 15 vulnerabilities → 3 vulnerabilities (1 high, 2 moderate).**

Remaining: `serialize-javascript` (via `@symfony/webpack-encore` → `css-minimizer-webpack-plugin`).
The only automated fix is `npm audit fix --force`, which upgrades `@symfony/webpack-encore`
to 7.x (breaking). This is **build-time only** and should be scheduled as a separate task.

### 4.5 Public maintenance endpoints protected

`public/ocreset.php` and `public/clear-cache.php` now return HTTP 403 unless the request
comes from `127.0.0.1` / `::1`.

### 4.6 Verification performed

| Check | Result |
|---|---|
| `php -l` on all edited PHP files | OK |
| `php bin/console lint:yaml config/` | OK (27 files) |
| `php bin/console lint:container` | OK |
| `php bin/console about` | Environment `prod`, Debug `false` |
| `php bin/console debug:router` | LDAP routes present |
| `php bin/console cache:clear` | OK |
| `git grep` for leaked passwords | No matches in tracked files |
| `composer audit` | 3 low/medium advisories remaining |
| `npm audit` | 3 vulnerabilities remaining (build toolchain) |

---

## 5. Residual risks / manual actions required

These items cannot be safely completed from the shell and require an administrator:

1. **Rotate credentials (highest priority).** Change the `itop_user` LDAP service-account
   password and the `timesheet` database password. The old values are in git history and must
   be considered compromised. After rotation, update `.env` / `.env.local`.
2. **Purge git history.** Untracking does not remove the secrets or SQL dumps from past commits.
   Use `git filter-repo` (or BFG) to remove the affected paths, then force-push and have all
   clones re-cloned:
   ```bash
   git filter-repo --invert-paths \
     --path ad_pw_probe.php --path dc_cmp2.php \
     --path backup_20260729.sql \
     --path timesheet_new_backup_20260727_174927.sql \
     --path recreate_elizabeth_timesheet.sql \
     --path restore_elizabeth_real_timesheet.sql \
     --path restore_elizabeth_submissions.sql
   ```
3. **`config/packages/local.yaml`** is root-owned and still contains the plaintext LDAP
   password. As root, replace with `password: "%env(LDAP_BIND_PASSWORD)%"` and confirm
   `LDAP_BIND_PASSWORD` is set in `.env.local`.
4. **Move/encrypt the local SQL dumps.** They remain on disk at the project root. Move them
   to an access-controlled backup location and delete the project-root copies.
5. **Treat exposed password hashes as a breach.** Consider forcing password resets for
   accounts present in the leaked dumps.
6. **Plan the `@symfony/webpack-encore` 7.x upgrade** to clear the remaining npm high advisory.
7. **Review the untracked change** in `src/Validator/Constraints/TimesheetSubmissionDeadlineValidator.php`
   (pre-existing, unrelated to this audit) before committing.

---

## 6. Post-fix risk rating

| Area | Before | After |
|---|---|---|
| Secrets in repo | Critical | **Mitigated in current tree** (history purge + rotation pending) |
| Sensitive data in repo | High | **Mitigated in current tree** (history purge pending) |
| PHP dependencies | High (45) | **Low** (3 low/medium, no patch available) |
| JavaScript dependencies | Medium (15) | **Low/Medium** (3, build-time only) |
| Public attack surface | Medium | **Low** (localhost-only) |

**Overall risk after applied fixes: MEDIUM** — pending credential rotation and git-history purge,
after which it becomes LOW.

