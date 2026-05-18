# Request Routing — Tasks

## 1. Module Status

| Field | Value |
|---|---|
| Module | Request Routing |
| Branch | `module/request-routing` |
| Status | COMPLETE |
| Depends on | Customer Requests (20), Staffing Requests (6) |

---

## 3. Implementation Tasks

| ID | Task | Status |
|---|---|---|
| RTR-001 | Migration: `staffing_request_routes` | DONE |
| RTR-002 | `lib/request-routing/route-staffing-request.ts` | DONE |
| RTR-003 | Internal route API / server action hook | DONE |
| RTR-004 | `GET /api/staffing-requests/routed` | DONE |
| RTR-005 | `app/staffing-requests/routed/page.tsx` | DONE |
| RTR-006 | Acknowledge route action | DONE |
| RTR-007 | Marketplace banner on staffing request detail | DONE |
| RTR-008 | Sidebar **Routed requests** + badge | DONE |
| RTR-009 | Notification hook stub | DONE |
| RTR-010 | lint, typecheck, build | DONE |

---

## 4. Testing Tasks

| ID | Task | Status |
|---|---|---|
| RTR-T001 | `route-staffing-request.test.ts` | DONE |
| RTR-T002 | API + E2E specs | DONE |
| RTR-T003 | lint, typecheck, build, test | DONE |
