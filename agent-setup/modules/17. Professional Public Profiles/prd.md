# Professional Public Profiles PRD

## 1. Module Overview

The Professional Public Profiles module provides **agency-controlled, opt-in public profile pages** for healthcare professionals discoverable in the marketplace.

Profiles expose only public-safe information and **approximate availability** signals—never exact schedules.

This module is responsible for:

- public profile route `/marketplace/professionals/[publicSlug]`
- `professional_marketplace_profiles` public fields
- agency workforce UI to edit public profile content (subset of fields)
- approximate availability display logic
- **Request Professional** CTA (auth-gated)

This module does **not** implement:

- category listings (Category Directory)
- search results page (Marketplace Search)
- staffing request form (Customer Requests)
- direct messaging

---

## 2. Goals

### Primary Goals

- Render trustworthy public profiles for eligible professionals only
- Allow agency write roles to edit public headline, bio, specialty tags, photo
- Compute approximate availability from internal activity (not exact blocks)
- 404 for non-eligible, opt-out, or wrong-geo profiles when customer location known

### Secondary Goals

- Open Graph tags for sharing
- Print-friendly summary (CSS only)

---

## 3. Non-Goals (MVP)

- Customer reviews/ratings
- Public credential document downloads
- Live chat widget
- Professional-edited public content without agency approval

---

## 4. Primary Users

| User | Access |
|---|---|
| Public visitor | View profiles in supported geo context |
| Customer | View + Request Professional |
| Agency write roles | Edit public profile fields on workforce |
| Provider | No edit of public profile in MVP |

---

## 5. Entry Points

| Entry | Result |
|---|---|
| Category/search card **View profile** | `/marketplace/professionals/[publicSlug]` |
| Direct URL | Same |
| Workforce **Edit public profile** | `/workforce/[id]?tab=public-profile` |

---

## 6. User Flows

### Flow A: Public views profile

1. Visitor with location cookie opens profile URL.
2. Server loads professional by `public_slug`; runs `isProfessionalPublicEligible(id, customerLocation)`.
3. If false → 404 (do not reveal opt-out existence).
4. Render profile sections (see 8.3).
5. **Request Professional** → login if needed → Customer Requests flow with `?professionalId=`.

### Flow B: Agency edits public profile

1. Recruiter opens `/workforce/[id]?tab=public-profile`.
2. Edits: headline (80 chars), bio (500), specialties (tags), photo URL upload.
3. Saves to `professional_marketplace_profiles`.
4. If marketplace visibility ON, changes reflect immediately on public page.

### Flow C: Approximate availability refresh

1. Nightly job or on-read computation (MVP: on-read):
   - `likely_available`: has future `availability_blocks` in next 7 days (boolean only, times hidden)
   - `available_this_week`: active block this week
   - `recently_active`: `last_active_at` within 14 days
2. Store enum `approximate_availability` on profile row; never expose block times publicly.

---

## 7. Screens and Routes

| Route | Auth | Purpose |
|---|---|---|
| `/marketplace/professionals/[publicSlug]` | Public | Profile view |
| `/workforce/[id]?tab=public-profile` | Agency | Edit public fields |
| `GET /api/marketplace/professionals/[publicSlug]` | Public | Profile JSON (geo-gated) |
| `PATCH /api/workforce/[id]/public-profile` | Agency write | Update public fields |

---

## 8. Functional Requirements

### 8.1 `professional_marketplace_profiles`

| Column | Type | Notes |
|---|---|---|
| `healthcare_professional_id` | uuid FK unique | |
| `headline` | varchar(80) | |
| `bio` | text max 500 | |
| `specialties` | text[] | |
| `photo_url` | text nullable | |
| `approximate_availability` | enum | `likely_available`, `available_this_week`, `recently_active` |
| `years_experience_bucket` | enum | `<2`, `2-5`, `5+` |
| `credentials_summary` | text | e.g. "RN License — Verified" (no doc links) |
| `updated_at` | timestamptz | |

### 8.2 Public profile page sections

| Section | Content |
|---|---|
| Hero | Photo, display name, role, headline |
| Availability signal | Label from enum + helper text: *Approximate availability — confirm with agency coordinator* |
| About | Bio |
| Specialties | Tags |
| Credentials summary | Non-sensitive lines only |
| Service area | City, state (not exact address) |
| Fulfillment notice | *Staffing fulfilled by [Agency Name] coordinators. Submit a staffing request to request this professional.* |
| CTA | **Request Professional** |

**Must NOT show:** email, phone, exact shift times, internal reliability score, agency internal notes.

### 8.3 Geo gating

- Without customer location cookie: show profile metadata (SEO) but hide **Request Professional** eligibility banner OR show location prompt (product choice: **require location for CTA** — fail closed).
- With location: eligibility check; 404 if out of area.

### 8.4 `public_slug` rules

- Generated on first enable marketplace visibility: `firstname-lastname-{shortId}` lowercase
- Unique globally
- Immutable in MVP after creation

---

## 9. Data Requirements

- Reads: `healthcare_professionals`, `professional_marketplace_profiles`, `professional_marketplace_visibility`, `agencies` (name for disclaimer)
- Writes: agency-scoped PATCH only

### Dependencies

| Module | Dependency |
|---|---|
| Marketplace Eligibility Rules (15) | Visibility + geo |
| Workforce (4) | Base professional record |

---

## 10. Marketplace Rules

1. Opt-in required; 404 if not eligible (no "profile hidden" leak).
2. Approximate availability only.
3. Request Professional creates staffing request path, not hire/booking.
4. No direct contact fields on public page.

---

## 11. Authorization Rules

| Action | Roles |
|---|---|
| View public page | Anyone (geo rules apply) |
| Edit public profile | `agency_owner`, `agency_admin`, `recruiter` |
| Provider | No access to edit tab |

---

## 12. UX Requirements

- Premium, calm healthcare aesthetic
- Prominent fulfillment disclaimer
- Availability shown as badge, not calendar
- Mobile-first layout

---

## 13. Error States

| State | Behavior |
|---|---|
| Unknown slug | 404 |
| Not eligible | 404 |
| Incomplete public profile + visibility ON | Agency tab shows warnings; public 404 until minimum fields set |

---

## 14. Responsive Requirements

- Single column mobile; photo top
- CTA sticky footer on mobile

---

## 15. Acceptance Criteria

- [ ] Public profile renders for eligible slug + location
- [ ] 404 for opt-out/wrong geo
- [ ] No exact schedule times in HTML or API
- [ ] Agency can edit public fields
- [ ] Request Professional CTA auth-gated
- [ ] Tests pass

---

## 16. Out of Scope

- Messaging
- Public reviews
- Video intro
