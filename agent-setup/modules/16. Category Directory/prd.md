# Category Directory PRD

## 1. Module Overview

The Category Directory module provides **public, SEO-oriented healthcare role category pages** where customers browse eligible professionals by category within a mandatory geographic context.

It implements the public category index and category landing pages, consuming Marketplace Eligibility Rules for all listings.

This module is responsible for:

- category index at `/marketplace/categories`
- category landing pages at `/marketplace/categories/[slug]`
- seed/manage `marketplace_categories` reference data
- SEO metadata (title, description, canonical)
- location context capture (cookie/session) before showing listings
- professional cards linking to public profiles and **Request Professional** entry (via Public Marketplace module)

This module does **not** implement:

- full-text search UI (Marketplace Search)
- staffing request submission (Customer Requests)
- agency visibility toggles (Marketplace Eligibility Rules)
- fulfillment workflows

---

## 2. Goals

### Primary Goals

- Publish stable category URLs for RN, CNA, LPN, EMT, etc.
- List only geo-eligible, opt-in professionals per category
- Require customer location context before rendering listings (fail closed)
- Provide SEO-friendly headings and metadata without thin duplicate geo pages

### Secondary Goals

- Category icons and short descriptions for trust
- Breadcrumb navigation: Marketplace → Categories → [Role]
- `noindex` for listing pages without location context

---

## 3. Non-Goals (MVP)

- CMS admin for categories (use seed migration)
- City-level SEO landing pages (e.g. `/rn/denver`) — future
- Blog/content marketing pages
- Agency-branded white-label domains

---

## 4. Primary Users

| User | Access |
|---|---|
| Public visitor | Browse categories; set location; view listings |
| Customer (`facility_user`) | Same public routes + authenticated Request Professional |
| Agency users | No public category admin in MVP (seed only) |

---

## 5. Entry Points

| Entry | Result |
|---|---|
| Public Marketplace home | Link to `/marketplace/categories` |
| Footer **Browse roles** | `/marketplace/categories` |
| Direct SEO URL | `/marketplace/categories/[slug]` |
| Sitemap (future hook) | Category URLs |

---

## 6. User Flows

### Flow A: Browse categories without location

1. Visitor opens `/marketplace/categories`.
2. Sees category grid (RN, CNA, …) with descriptions.
3. Location banner: **Set your facility location to see available professionals**.
4. Category links go to slug page with location prompt (no listings).

### Flow B: Set location then browse category

1. Visitor sets location via location modal (Google Places) → stored in `marketplace_location` cookie (30 days).
2. Opens `/marketplace/categories/rn`.
3. Server calls `getEligibleProfessionals({ categorySlug: 'rn', customerLocation })`.
4. Renders professional cards (photo, role, approximate availability, agency name policy: **Staffing via partner agency**).
5. CTA **View profile** → `/marketplace/professionals/[publicSlug]`.
6. CTA **Request Professional** → requires auth; redirects to login with callback.

### Flow C: Empty geo results

1. Valid location but zero eligible professionals.
2. Show empty state: **No professionals available in your area for this role** + link to Marketplace Search or contact agency.

---

## 7. Screens and Routes

| Route | Auth | Purpose |
|---|---|---|
| `/marketplace/categories` | Public | Category index |
| `/marketplace/categories/[slug]` | Public | Category landing + listings (if location set) |
| `GET /api/marketplace/categories` | Public | Category list JSON |
| `GET /api/marketplace/categories/[slug]/professionals` | Public | Eligible professionals (requires `location` query or cookie) |

### Category slugs (seed MVP)

| slug | name | `role_filter` |
|---|---|---|
| `registered-nurse` | Registered Nurse (RN) | `RN` |
| `cna` | Certified Nursing Assistant | `CNA` |
| `lpn` | Licensed Practical Nurse | `LPN` |
| `emt` | Emergency Medical Technician | `EMT` |
| `cnm` | Certified Nurse Midwife | `CNM` |
| `cns` | Clinical Nurse Specialist | `CNS` |

Invalid slug → 404.

---

## 8. Functional Requirements

### 8.1 `marketplace_categories` table

| Column | Type |
|---|---|
| `id` | uuid |
| `slug` | text unique |
| `name` | text |
| `description` | text |
| `role_filter` | text (matches `healthcare_professionals.role`) |
| `sort_order` | int |
| `is_active` | boolean default true |
| `seo_title` | text |
| `seo_description` | text |

### 8.2 Location context

- Cookie `marketplace_location`: JSON `{ placeId, displayName, lat, lng, city, state }`
- Location modal component shared with Marketplace Search (exported from this module or `components/marketplace/location-context.tsx`)
- Category listing API returns `400` if location missing (fail closed)

### 8.3 Professional card (public)

Display fields only:

- `displayName` (first + last initial option per privacy PRD)
- `role`, `specialty` (optional)
- `approximate_availability` enum: `likely_available` | `available_this_week` | `recently_active`
- Years experience (bucket: `<2`, `2-5`, `5+`)
- **No** exact schedule, email, phone

### 8.4 SEO

- Index page: indexable
- Category slug page without location: `noindex, follow`; show category description only
- Category slug page with location: indexable with canonical `/marketplace/categories/[slug]` (geo in cookie, not URL duplication for MVP)

### 8.5 Pagination

- 24 professionals per page
- Sort default: `recently_active` desc, then name asc

---

## 9. Data Requirements

- Read `marketplace_categories`, `healthcare_professionals`, `professional_marketplace_visibility`, `professional_marketplace_profiles` (module 17)
- All listing queries via `getEligibleProfessionals` only
- No writes except optional analytics event (Activity Logs future)

### Dependencies

| Module | Dependency |
|---|---|
| Marketplace Eligibility Rules (15) | Filtering |
| Professional Public Profiles (17) | `public_slug`, profile fields |

---

## 10. Marketplace Rules

1. Listings must use eligibility service — no direct DB listing queries.
2. Never show opt-out or blocked professionals.
3. Never show out-of-area professionals.
4. No booking language; CTAs: **View profile**, **Request Professional**.
5. No customer ↔ professional messaging links.

---

## 11. Authorization Rules

- Public routes: no auth required to browse
- API routes: rate limit by IP (MVP: middleware stub)
- Authenticated facility user sees same listings; Request Professional uses auth gate

---

## 12. UX Requirements

- Trusted healthcare staffing tone; premium layout
- Prominent location context chip (editable)
- Category hero with role description and fulfillment disclaimer: *Requests are fulfilled by licensed staffing agencies.*
- Mobile: single-column cards

---

## 13. Error States

| State | UI |
|---|---|
| Invalid slug | 404 page |
| Missing location | Location prompt; no listing grid |
| Zero results | Empty state with search CTA |
| API error | Retry banner |

---

## 14. Responsive Requirements

- Category grid: 1 col mobile, 2 tablet, 3 desktop
- Location modal full-screen on mobile

---

## 15. Acceptance Criteria

- [ ] All seed categories render at `/marketplace/categories/[slug]`
- [ ] Listings empty without location context
- [ ] Listings only show eligible professionals
- [ ] SEO metadata present per category
- [ ] No exact availability times on cards
- [ ] Tests in `test.md` pass

---

## 16. Out of Scope

- Search filters beyond category role
- Agency category management UI
- City-specific landing URLs
