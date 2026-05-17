# Compliance PRD

## 1. Module Overview

The Compliance module gives agency compliance managers, owners, and admins a single operational view at `/compliance` to track healthcare professional credentials across the agency workforce.

This module is responsible for:

- `/compliance` — filterable credentials table with status-driven badges
- Read/update credential records in `credentials` table
- Status workflow using `CredentialStatusEnum`: `pending_review`, `verified`, `expiring_soon`, `expired`, `rejected`
- Agency-scoped queries only (`credentials.agency_id = session agency`)
- Role access: `compliance_manager`, `agency_owner`, `agency_admin` (write); other agency roles read-only optional — **MVP: no access for coordinator/recruiter** (redirect)

This module does **not** implement:

- Provider self-upload portal (future; providers upload via separate flow or Workforce profile)
- Third-party license verification APIs
- Automated expiration cron (manual status update + optional batch job stub out of scope)
- Compliance requirement templates per facility
- Notifications on expiry (Notifications module)
- Document storage pipeline beyond storing `document_url` string (MVP: URL text field)

**Depends on:** Auth, Workforce (`healthcare_professionals`, `credentials`).

---

## 2. Goals

### Primary Goals

- Centralize credential visibility for compliance operations
- Support review workflow: pending → verified/rejected
- Highlight expiring and expired credentials before shifts fail
- Enforce agency isolation and role-based write access

### Secondary Goals

- Filter by professional, status, type, expiry window
- Quick actions: verify, reject, mark expiring
- Link to workforce professional profile (route `/workforce/[id]` if exists)

---

## 3. Non-Goals (MVP)

- OCR / document parsing
- Background check integrations
- State board API verification
- Bulk CSV import
- Custom credential types per agency (free-text `type` field only)
- Provider-facing credential upload UI
- Email reminders (Notifications module)
- Audit-grade immutable audit log (Activity Logs module)

---

## 4. Primary Users

| User | Role | `/compliance` access |
|---|---|---|
| Compliance Manager | `compliance_manager` | Full read + write |
| Agency Owner | `agency_owner` | Full read + write |
| Agency Admin | `agency_admin` | Full read + write |
| Staffing Coordinator | `staffing_coordinator` | No access (redirect `/dashboard`) |
| Recruiter | `recruiter` | No access |
| Provider | `provider` | No access |
| Facility User | `facility_user` | No access |

---

## 5. Entry Points

| Entry | Condition | Result |
|---|---|---|
| Sidebar **Compliance** | Agency user with write role | `/compliance` |
| Direct URL | Authorized role | Credentials table |
| Direct URL | Unauthorized agency role | Redirect `/dashboard` |
| Provider visits `/compliance` | `provider` | Redirect `/my-shifts` |

---

## 6. User Flows

### Flow A: Review credentials queue

1. Compliance manager opens `/compliance`.
2. Default filter: `status = pending_review`.
3. Table shows professional name, credential name, type, license #, expires, status badge, actions.
4. User opens row drawer or navigates to detail panel.
5. User clicks **Verify** → status `verified`, `verified_by_user_id`, `verified_at` set.
6. Or **Reject** → modal with reason (required min 10 chars) → `rejected`.

### Flow B: Mark expiring / expired

1. User filters **Expiring soon** (status `expiring_soon` or expires within 30 days — see COMP-040).
2. User can manually set status to `expiring_soon` or `expired` via row action dropdown.
3. System may auto-set `expiring_soon` when `expires_at` within 30 days on list load (server-side enrichment, optional COMP-041).

### Flow C: Add credential (agency-side)

1. User clicks **Add credential**.
2. Modal: select professional (searchable combobox), type, name, license fields, dates, optional `document_url`.
3. Insert row with `status = pending_review`, `agency_id` from session.

### Flow D: Edit credential

1. User edits fields except `agency_id` / `professional_id` (professional change = delete + recreate).
2. Save updates `updated_at`.
3. If `expires_at` changed to past date, prompt to set status `expired`.

### Flow E: Cross-agency isolation

1. User from Agency A cannot query Agency B credential by ID.
2. API returns 404.

---

## 7. Screens or Pages

### Routes

| Route | Description | Auth |
|---|---|---|
| `/compliance` | Main credentials table + filters + row actions | `compliance_manager`, `agency_owner`, `agency_admin` |

### Page layout

- Page title: **Compliance**
- Subtitle: “Track credentials and license status across your workforce.”
- Toolbar: search, status multi-select, professional filter, expiry range, **Add credential**
- Table columns:

| Column | Source |
|---|---|
| Professional | `healthcare_professionals.first_name` + `last_name` |
| Credential | `credentials.name` |
| Type | `credentials.type` |
| License # | `credentials.license_number` |
| Issuing authority | `credentials.issuing_authority` |
| Expires | `credentials.expires_at` |
| Status | `credentials.status` badge |
| Verified | `verified_at` or “—” |
| Actions | View / Verify / Reject / Edit |

- Row click opens side sheet with full detail + document link (open in new tab if URL)

---

## 8. Functional Requirements

IDs use prefix **COMP-###**.

### 8.1 Route guards (COMP-001–COMP-004)

- **COMP-001:** Unauthenticated → `/login?callbackUrl=/compliance`.
- **COMP-002:** Allowed roles: `compliance_manager`, `agency_owner`, `agency_admin` only.
- **COMP-003:** `staffing_coordinator`, `recruiter` → redirect `/dashboard`.
- **COMP-004:** `provider`, `facility_user` → respective portal redirects.

### 8.2 List & filters (COMP-010–COMP-020)

- **COMP-010:** `listCredentialsAction` returns paginated rows for `agency_id = session.agencyId`.
- **COMP-011:** Join `healthcare_professionals` for name/role display.
- **COMP-012:** Default sort: `expires_at` ASC NULLS LAST, then `status`, then `updated_at` DESC.
- **COMP-013:** Page size 25; cursor or offset pagination.
- **COMP-014:** Search matches `name`, `license_number`, `type`, professional name (case-insensitive).
- **COMP-015:** Status filter multi-select on `CredentialStatusEnum` values.
- **COMP-016:** Professional filter: UUID `professional_id`.
- **COMP-017:** Expiry filter presets: `expired`, `next_30_days`, `next_90_days`, `no_expiry`.
- **COMP-018:** KPI summary cards above table: Pending review count, Expiring soon count, Expired count, Verified count (agency-wide).
- **COMP-019:** Empty filter result: actionable empty state.
- **COMP-020:** Export CSV out of scope.

### 8.3 Status transitions (COMP-030–COMP-038)

| From | Action | To | Side effects |
|---|---|---|---|
| `pending_review` | Verify | `verified` | set `verified_by_user_id`, `verified_at` |
| `pending_review` | Reject | `rejected` | store rejection reason in metadata or `notes` field* |
| `verified` | Mark expiring | `expiring_soon` | — |
| `verified` / `expiring_soon` | Mark expired | `expired` | — |
| `rejected` | Re-open review | `pending_review` | clear verified fields |

\* Use `credentials` — add optional `review_notes` text column in migration **or** store in existing field: MVP use `issuing_authority` suffix not allowed; prefer new nullable `review_notes` text on `credentials` if migration allowed. **If no migration:** store rejection reason in activity metadata only and display in toast — document COMP-033 as require `review_notes` column migration.

**COMP-030:** `verifyCredentialAction(id)` — allowed from `pending_review` only (or re-verify from `expiring_soon` — denied; use edit).
**COMP-031:** `rejectCredentialAction(id, reason)` — reason required 10–500 chars.
**COMP-032:** `updateCredentialStatusAction(id, status)` — manual transitions for expiring_soon/expired/pending_review per table above.
**COMP-033:** Rejection reason persisted on `credentials.review_notes` (migration COMP-MIG-01).
**COMP-034:** Cannot set `verified` without `verifyCredentialAction` (sets verifier fields).
**COMP-035:** `rejected` credentials cannot be assigned to new shifts (enforcement in Matching module later; display warning badge here only COMP-035 UI).

### 8.4 CRUD (COMP-040–COMP-055)

- **COMP-040:** Auto-flag: if `expires_at` ≤ today + 30 days and status is `verified`, list endpoint may return computed badge `expiring_soon` OR update row — **MVP: display-only computed badge** without DB write on list.
- **COMP-041:** Optional nightly job out of scope.
- **COMP-042:** `createCredentialAction` — required: `professionalId`, `type`, `name`; optional: license fields, dates, `documentUrl`.
- **COMP-043:** `updateCredentialAction` — cannot change `agency_id`; professionalId immutable.
- **COMP-044:** `deleteCredentialAction` — soft delete not in schema; hard delete allowed for `agency_owner|agency_admin|compliance_manager` with confirm modal.
- **COMP-045:** Zod `credentialSchema` validates types, dates (`expires_at` >= `issued_at` when both set).
- **COMP-046:** `type` max 120; `name` max 255.
- **COMP-047:** `documentUrl` valid URL optional max 2048.
- **COMP-048:** New credentials default `status = pending_review`.
- **COMP-049:** `professionalId` must belong to same `agency_id`.
- **COMP-050:** Duplicate warning (non-blocking): same `professional_id` + `type` + `license_number` if all provided.

### 8.5 Status badge mapping (COMP-060)

| Enum value | Label | Badge variant |
|---|---|---|
| `pending_review` | Pending review | secondary |
| `verified` | Verified | default/success |
| `expiring_soon` | Expiring soon | warning |
| `expired` | Expired | destructive |
| `rejected` | Rejected | outline destructive |

### 8.6 API surface

| Method | Path / Action | Purpose |
|---|---|---|
| `GET` | `/api/compliance/credentials` | List + filters + KPIs |
| `GET` | `/api/compliance/credentials/[id]` | Detail |
| `POST` | `createCredentialAction` | Create |
| `PATCH` | `updateCredentialAction` | Update fields |
| `POST` | `verifyCredentialAction` | Verify |
| `POST` | `rejectCredentialAction` | Reject |
| `PATCH` | `updateCredentialStatusAction` | Manual status |
| `DELETE` | `deleteCredentialAction` | Delete |

All handlers: `requireAgencyContext` + `assertComplianceWriteRole`.

---

## 9. Data Requirements

### Table: `credentials` (existing)

| Column | Usage |
|---|---|
| `agency_id` | Scope |
| `professional_id` | Link to workforce |
| `type`, `name` | Display/filter |
| `license_number`, `issuing_authority` | Detail |
| `issued_at`, `expires_at` | Dates |
| `status` | `CredentialStatusEnum` |
| `document_url` | Link |
| `verified_by_user_id`, `verified_at` | Verify flow |

### Migration (COMP-MIG-01)

Add nullable column:

```sql
ALTER TABLE credentials ADD COLUMN review_notes text;
```

If migrations disallowed in module, use `activity_logs.metadata` for reject reason and COMP-033 stores reference only — prefer single migration.

### Indexes

Use existing `idx_credentials_agency`, `idx_credentials_status`, `idx_credentials_expires`.

---

## 10. Authorization Rules

| Action | compliance_manager | agency_owner | agency_admin | coordinator | recruiter |
|---|---|---|---|---|---|
| View `/compliance` | Yes | Yes | Yes | No | No |
| Create credential | Yes | Yes | Yes | No | No |
| Verify / reject | Yes | Yes | Yes | No | No |
| Delete credential | Yes | Yes | Yes | No | No |

Read-only for coordinators **not** in MVP (no access).

---

## 11. UX Requirements

- Premium B2B table with sticky header on desktop
- Status badges consistent with platform design system
- Row actions in dropdown to reduce clutter
- Confirm destructive actions (reject, delete)
- Professional combobox shows role + city in subtitle

---

## 12. Error and Empty States

| State | Copy |
|---|---|
| No credentials agency-wide | “No credentials yet. Add a credential to start tracking compliance.” |
| No pending reviews | “No credentials pending review.” |
| Professional not in agency | Validation error on create |
| Verify invalid state | “Only pending credentials can be verified.” |
| 404 wrong agency | “Credential not found.” |

---

## 13. Mobile/Responsive Requirements

- **COMP-070:** Table horizontal scroll on `< md` with priority columns pinned optional
- **COMP-071:** Filters collapse into sheet on mobile
- **COMP-072:** Playwright desktop 1280px required; mobile 375px smoke optional (table scroll)

---

## 14. Acceptance Criteria

- [ ] `/compliance` accessible only to compliance_manager, agency_owner, agency_admin.
- [ ] Table lists agency credentials with filters and KPI cards.
- [ ] Verify/reject updates status and verifier fields per schema.
- [ ] Create/update/delete respect agency scope.
- [ ] Status badges match `CredentialStatusEnum`.
- [ ] Cross-agency credential ID returns 404.
- [ ] lint/typecheck/build/tests pass per `test.md`.

---

## 15. Out of Scope

- Provider credential upload
- External verification APIs
- Expiration cron job
- Coordinator read-only access
- Compliance templates / rules engine

---

## Branch

`module/compliance`
