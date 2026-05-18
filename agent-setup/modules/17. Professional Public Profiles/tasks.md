# Professional Public Profiles — Tasks

## 1. Module Status

| Field | Value |
|---|---|
| Module | Professional Public Profiles |
| Branch | `module/professional-public-profiles` |
| Status | PENDING |
| Depends on | Marketplace Eligibility Rules (15), Workforce (4) |

---

## 3. Implementation Tasks

| ID | Task | Status | Owner |
|---|---|---|---|
| PPP-001 | Migration: `professional_marketplace_profiles` | PENDING | Code Agent |
| PPP-002 | Enum `approximate_availability` | PENDING | Code Agent |
| PPP-003 | `lib/marketplace/approximate-availability.ts` | PENDING | Code Agent |
| PPP-004 | `lib/marketplace/public-profile.ts` loader | PENDING | Code Agent |
| PPP-005 | `GET /api/marketplace/professionals/[publicSlug]` | PENDING | Code Agent |
| PPP-006 | `app/marketplace/professionals/[publicSlug]/page.tsx` | PENDING | Code Agent |
| PPP-007 | Public profile layout components | PENDING | Code Agent |
| PPP-008 | Fulfillment disclaimer component | PENDING | Code Agent |
| PPP-009 | Workforce tab `public-profile` edit form | PENDING | Code Agent |
| PPP-010 | `PATCH /api/workforce/[id]/public-profile` | PENDING | Code Agent |
| PPP-011 | `public_slug` generation on visibility enable | PENDING | Code Agent |
| PPP-012 | Open Graph metadata | PENDING | Code Agent |
| PPP-013 | Request Professional CTA link with query params | PENDING | Code Agent |
| PPP-014 | Run lint, typecheck, build | PENDING | Code Agent |

---

## 4. Testing Tasks

| ID | Task | Status | Owner |
|---|---|---|---|
| PPP-T001 | `approximate-availability.test.ts` | PENDING | Test Agent |
| PPP-T002 | API route tests | PENDING | Test Agent |
| PPP-T003 | `public-profile.spec.ts` | PENDING | Test Agent |
| PPP-T004 | `public-profile-edit.spec.ts` | PENDING | Test Agent |
| PPP-T005 | lint, typecheck, build, test | PENDING | Test Agent |

---

## 5. Acceptance Criteria

- Public profiles geo/opt-in gated with 404 fail-closed
- Approximate availability only
- Agency edit authorized
- All PPP-T* pass
