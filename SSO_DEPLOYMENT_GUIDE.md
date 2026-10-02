# PPDA Timesheet — Windows Single Sign-On (Kerberos) Deployment Guide

Goal: get every domain user silently authenticated into `https://timesheet.ppda.go.ug`
(page loads already logged-in, no Basic-auth popup, no login form for domain users).

Server side (`/en/sso`, Apache `mod_auth_gssapi`, keytab for `HTTP/timesheet.ppda.go.ug`)
is already built and verified working end-to-end. This guide covers the **client side**
that remains: make browsers answer the Kerberos challenge, and make sure clients reach
our Apache (not the public gateway).

---

## 1. What the two registry keys do

| Browser | Key (HKLM) | Value | Meaning |
|---|---|---|---|
| Chrome | `SOFTWARE\Policies\Google\Chrome` | `AuthServerAllowlist = *.ppda.go.ug` | Allow Kerberos/Negotiate for this domain |
| Edge | `SOFTWARE\Policies\Microsoft\Edge` | `AuthServerAllowlist = *.ppda.go.ug` | Same for Edge |

Without these keys, Chrome/Edge silently refuse to send a Kerberos ticket, so the
SSO page can never authenticate you and you fall back to the login form.

**Prerequisites per machine:**
- Machine is domain-joined and the user logs in with a valid **PPDA.GO.UG** account
- User's AD password is current (check with `kinit` — stale passwords break SSO)
- Client DNS resolves `timesheet.ppda.go.ug` to the **internal** IP `192.168.33.34` (see §4)

---

## 2. Recommended method: Group Policy (all machines automatically)

Do this once on the domain controller.

1. **Server Manager → Tools → Group Policy Management.**
2. Right-click your **workstations OU** (or the root domain container to cover all
   computers) → **Create a GPO in this domain, and link it here**.
   Name it e.g. `Timesheet SSO - Browser Auth Allowlist`.
3. Right-click the new GPO → **Edit**.
4. Navigate to:
   `Computer Configuration → Preferences → Windows Settings → Registry`
5. **New → Registry Item** and configure (Action: **Update**):

   | Setting | Value |
   |---|---|
   | Action | `Update` |
   | Hive | `HKLM` |
   | Key Path | `SOFTWARE\Policies\Google\Chrome` |
   | Value name | `AuthServerAllowlist` |
   | Value type | `REG_SZ` |
   | Value data | `*.ppda.go.ug` |

6. Repeat step 5 for Microsoft Edge (`SOFTWARE\Policies\Microsoft\Edge`, same value).
7. Close the editor. Clients apply it automatically within ~90 minutes; to force:
   ```
   gpupdate /force
   ```
8. On a test machine, confirm:
   ```
   reg query "HKLM\SOFTWARE\Policies\Google\Chrome" /v AuthServerAllowlist
   reg query "HKLM\SOFTWARE\Policies\Microsoft\Edge"    /v AuthServerAllowlist
   ```
   Then **fully close and reopen** all Chrome/Edge windows.

> Optional (cleaner): instead of registry preferences, import the official
> **Chrome ADMX** and the built-in **Edge ADMX** into the Central Store and set the
> same policy under Administrative Templates. The policy is named
> `AuthServerAllowlist` ("Allow authentication over HTTP / GSSAPI") for both browsers.

---

## 3. Alternative methods (single machines / quick rollout)

### 3a. Run the included script
Copy `sso_auth_allowlist.cmd` to the machine, right-click → **Run as administrator**.
It sets both keys and prints verification.

### 3b. Push remotely with PsExec (from your admin workstation)
Put one machine name/IP per line in `machines.txt`, then:
```cmd
psexec @machines.txt -s -d cmd /c "reg add \"HKLM\SOFTWARE\Policies\Google\Chrome\" /v AuthServerAllowlist /t REG_SZ /d \"*.ppda.go.ug\" /f & reg add \"HKLM\SOFTWARE\Policies\Microsoft\Edge\" /v AuthServerAllowlist /t REG_SZ /d \"*.ppda.go.ug\" /f"
```

### 3c. Attach the script to a GPO as a Startup script
If you prefer scripting over registry preferences:
`GPO → Computer Configuration → Windows Settings → Scripts (Startup/Shutdown) → Startup → Add → Browse to sso_auth_allowlist.cmd`

---

## 3d. Firefox (separate mechanism)

Firefox does **not** read a registry key. It uses its `network.negotiate-auth.trusted-uris`
preference, which has to be set via a policy file or GPO ADMX.

### Option A — policies.json (per installed Firefox, recommended for small fleets)
1. Copy `firefox_policies.json` from this repo to:
   ```
   C:\Program Files\Mozilla Firefox\distribution\policies.json
   ```
2. Fully restart Firefox (all windows, or run `firefox -purgecaches` on one anyway).
3. Verify in Firefox: type `about:config` → search `network.negotiate-auth.trusted-uris`.
   The value should read `*.ppda.go.ug` (and, if set, the Delegated equivalent).

### Option B — GPO with Mozilla Firefox ADMX templates (all machines, recommended for fleets)
1. Download the Firefox for Enterprise ADMX templates from Mozilla's enterprise site
   and load them into your Central Store (`SYSVOL\Policies\PolicyDefinitions`).
2. In your GPO (**Computer or User Configuration → Policies →
   Administrative Templates → Firefox → Authentication**):
   - **SPNEGO** → Enabled → set `*.ppda.go.ug`
   - **Delegated** (optional, enables double-hop) → Enabled → set `*.ppda.go.ug`
3. `gpupdate /force` and fully restart Firefox.

### Known Firefox quirks
- Full restart of **all** open Firefox windows is required (policies are read at startup).
- `about:config` values are **locked** (locked gray) when set via policy — that is normal.
- Firefox keeps its own saved passwords: `about:logins` → search `timesheet` → delete.
  Also clear site data under `about:preferences#privacy` → Cookies and Site Data.

---

## 4. CRITICAL: DNS must point clients to the internal server

The registry keys only enable the browsers to *try* Kerberos. If a machine still gets
the **Basic-auth popup**, it is very likely resolving the **public** address and
hitting the firewall/gateway at `154.72.206.190`, which presents an HTTP Basic login
of its own — not our Apache.

Check on the affected machine:
```
nslookup timesheet.ppda.go.ug
```
- **Good:** `192.168.33.34` (reaches Apache directly)
- **Bad:** `154.72.206.190` (goes through the gateway → Basic popup)

Fix so all clients use the internal address:
1. Add/verify the `timesheet` **A record** in AD DNS on the DC (zone `ppda.go.ug`)
   → `192.168.33.34`.
2. Make sure client machines use AD DNS (their `ipconfig /all` DNS servers = DC IP).
3. Or as a stopgap, add to each machine's hosts file:
   ```
   192.168.33.34   timesheet.ppda.go.ug
   ```

---

## 5. Expected behaviour after a correct rollout

A user who logged into Windows with their domain account opens
`https://timesheet.ppda.go.ug`:

1. Login page loads and a hidden script calls `/en/sso`.
2. The browser (Chrome/Edge/Firefox) sees `WWW-Authenticate: Negotiate` → sends the Kerberos ticket.
3. Apache validates it, sets `REMOTE_USER`, Kimai logs the user in.
4. Page redirects to the timesheet — user never sees a form or a popup.

Non-domain users (workstations not joined, local accounts, or users not in Kimai)
are **not** affected: the handshake fails silently and they just get the normal login form.

---

## 6. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Basic-auth popup still appears | Machine resolves the public IP / hits the gateway | Fix DNS (§4) or hosts file; popup source is not Apache |
| No popup, but login form shown | Browser not sending the ticket | Chrome/Edge: verify registry key (§2.8), Firefox: verify `network.negotiate-auth.trusted-uris` / policies.json (§3d); fully restart browser; confirm user logged in with domain account |
| Page shows 403 / "forbidden" | AD says who you are, but that user has no Kimai account | Create/sync the user in Kimai with username matching the AD `samAccountName` |
| SSO worked before, now fails | AD password changed to something stale | Update the AD password; `kinit <user>` from the server to confirm |
| Auto-login works for some, not others | Those users share a machine / use local logon | Ensure they log in with a domain account |

Server verification (run on the timesheet server):
```bash
klist -k /etc/krb5.keytab | grep timesheet
curl -sI https://timesheet.ppda.go.ug/en/sso | grep -i 'www-authenticate'   # expect: Negotiate
```