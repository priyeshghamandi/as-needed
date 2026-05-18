# Marketplace Search PRD

## 1. Module Overview

The Marketplace Search module implements **public search** for healthcare professionals by **role + location + staffing need (Availability Window)** with mandatory geography filtering.

It provides the search UI, query parsing, filters, and results list consumed by Public Marketplace and links to Professional Public Profiles and Customer Requests.

This module is responsible for:

- search page `/marketplace/search`
- search API `GET /api/marketplace/search`
- query params: `role`, `location` (or cookie), `needStart`, `needEnd`, `urgency`
- sort and facet filters (role, availability signal, experience bucket)
- integration with `getEligibleProfessionals`

This module does **not** implement:

- category SEO pages (Category Directory)
- staffing request persistence (Customer Requests)
- agency fulfillment

---

## 2. Goals

### Primary Goals

- Require role + location before executing search (fail closed)
- Capture staffing need as **Availability Window** (date range) or urgency class
- Return only eligible professionals across agencies
- Support multi-select cart for Request Professional (sessionStorage until Customer Requests)

### Secondary Goals

- Recent searches in localStorage (role + location display name only)
- URL-shareable search state via query string

---

## 3. Non-Goals (MVP)

- Map view
- AI natural language search
- Saved searches account-wide
- Sort by price/rate

---

## 4. Primary Users

| User | Access |
|---|---|
| Public | Search and view results |
| Customer (`facility_user`) | Search + add to request cart |

---

## 5. Entry Points

| Entry | Result |
|---|---|
| Public Marketplace **Search** | `/marketplace/search` |
| Category empty state CTA | `/marketplace/search?role=RN` |
| Header search (marketplace layout) | Same |

---

## 6. User Flows

### Flow A: Search with full criteria

1. User opens `/marketplace/search`.
2. Fills: Role (select), Location (Places), **Availability Window** (start date, end date, shift type optional).
3. Submits → URL updates `?role=RN&needStart=...&needEnd=...`.
4. API returns eligible professionals; cards rendered.
5. User selects up to 5 professionals (checkbox) → **Continue to Request** (stores cart).

### Flow B: Missing location

1. User selects role only and submits.
2. Client blocks submit; server returns 400 if forced.

### Flow C: Urgency-based need (alternative to date range)

1. User selects **Urgency**: `asap` | `this_week` | `flexible`.
2. Passed to API for ranking boost only (not exact matching in MVP).

---

## 7. Screens and Routes

| Route | Purpose |
|---|---|
| `/marketplace/search` | Search form + results |
| `GET /api/marketplace/search` | JSON results |

### Query parameters

| Param | Required | Notes |
|---|---|---|
| `role` | Yes | Matches professional role enum |
| `lat`, `lng` OR location cookie | Yes | Fail closed |
| `needStart`, `needEnd` | No* | *At least one of date range OR `urgency` required |
| `urgency` | No | `asap`, `this_week`, `flexible` |
| `page` | No | Default 1 |
| `sort` | No | `relevance` (default), `recently_active` |

---

## 8. Functional Requirements

### 8.1 Search form fields

| Field | Validation |
|---|---|
| Role | Required; enum from workforce roles |
| Location | Required placeId + lat/lng |
| Availability Window start | Date ≥ today |
| Availability Window end | ≥ start; max 30-day span MVP |
| Shift type | Optional: `day`, `night`, `weekend`, `on_call` |

### 8.2 Results card

Same public card as Category Directory plus:

- Checkbox for selection (max 5)
- Badge for approximate availability
- Link to public profile

### 8.3 Ranking (MVP)

1. Geo eligible only (hard filter)
2. Boost `likely_available` > `available_this_week` > `recently_active`
3. If `urgency=asap`, boost recently active

**Do not** filter out professionals by exact internal calendar match in MVP.

### 8.4 Selection cart

- `sessionStorage` key `marketplace_request_cart`: `{ professionalIds: string[], role, location, need }`
- Max 5 professionals; must be same role in MVP
- **Continue to Request** → `/customer/requests/new` (Customer Requests module)

---

## 9. Data Requirements

- Read-only via eligibility service
- No new tables required (optional `marketplace_search_events` post-MVP)

### Dependencies

| Module | Dependency |
|---|---|
| Marketplace Eligibility Rules (15) | Filtering |
| Professional Public Profiles (17) | Card fields |
| Category Directory (16) | Location context component |

---

## 10. Marketplace Rules

1. Mandatory geography — no national unfiltered search.
2. No exact availability times in results.
3. Terminology: **Availability Window**, **Request Professional**.
4. Multi-agency results allowed; each card shows agency fulfillment disclaimer (agency name optional per legal).

---

## 11. Authorization Rules

- Public search API: unauthenticated OK
- Cart continuation to request creation: requires `facility_user` or customer signup flow

---

## 12. UX Requirements

- Search form above results; sticky filters on desktop
- Clear labels: *Staffing need* not *Booking dates*
- Results count: *{n} professionals available in your area*
- Zero results: suggest broader dates or different role

---

## 13. Error States

| State | UI |
|---|---|
| Missing role/location | Inline validation |
| API 400 | Banner |
| 0 results | Empty state |

---

## 14. Responsive Requirements

- Form fields stack on mobile
- Results single column mobile

---

## 15. Acceptance Criteria

- [ ] Cannot search without location
- [ ] Out-of-area professionals excluded
- [ ] Opt-out excluded
- [ ] Cart max 5 enforced
- [ ] URL reflects search state
- [ ] Tests pass

---

## 16. Out of Scope

- Elasticsearch (Postgres + eligibility sufficient MVP)
- Professional messaging
