# Public Marketplace PRD

## 1. Module Overview

The Public Marketplace module is the **public discovery shell** for the hybrid staffing marketplace: homepage, shared layout, navigation, trust content, and integration points for Category Directory, Marketplace Search, and Request Professional entry.

It establishes the public `(marketplace)` route group and brand experience distinct from the agency operations app.

This module is responsible for:

- marketplace home `/marketplace`
- shared layout `app/marketplace/layout.tsx` (header, footer, location chip)
- navigation to categories, search, login/signup for customers
- trust/fulfillment explainer content
- global marketplace metadata and robots rules

This module does **not** implement:

- eligibility logic (module 15)
- category CRUD or listings logic (module 16) — embeds/links only
- search API (module 18)
- request forms (module 20)

---

## 2. Goals

### Primary Goals

- Clear entry to browse by category and search
- Communicate agency-mediated fulfillment model upfront
- Location context available globally in marketplace layout
- Conversion path to **Request Professional** without booking language

### Secondary Goals

- Customer signup CTA for facilities
- Agency signup CTA separate path (`/signup` agency flow — link only)

---

## 3. Non-Goals (MVP)

- Blog
- Pricing page
- Live chat

---

## 4. Primary Users

| User | Access |
|---|---|
| Public | Home, nav, explainer |
| Customer | Same + link to `/customer/requests` when authenticated |

---

## 5. Entry Points

| Entry | Result |
|---|---|
| Root redirect | `/` → `/marketplace` (or marketing site policy) |
| `/marketplace` | Home |
| External SEO | Home + category links |

---

## 6. User Flows

### Flow A: Discover from home

1. Visitor lands `/marketplace`.
2. Sees hero: *Find healthcare professionals for your facility — fulfilled by licensed staffing agencies.*
3. Primary CTA **Search by role and location** → `/marketplace/search`.
4. Secondary **Browse categories** → `/marketplace/categories`.
5. Sets location via header chip if not set.

### Flow B: Authenticated customer return

1. Facility user sees **My staffing requests** in header → `/customer/requests` (Facility Portal / Customer Requests).

---

## 7. Screens and Routes

| Route | Purpose |
|---|---|
| `/marketplace` | Home |
| `app/marketplace/layout.tsx` | Shared chrome |

### Layout components

| Component | Behavior |
|---|---|
| `MarketplaceHeader` | Logo, Categories, Search, Location chip, Login |
| `MarketplaceFooter` | Links, legal, agency signup |
| `LocationChip` | Shows/edits `marketplace_location` cookie |
| `FulfillmentBanner` | Short agency-mediated disclaimer on all child pages |

### Home sections

1. Hero + CTAs
2. Popular categories (top 6 from seed)
3. How it works (3 steps): Discover → Request Professional → Agency fulfills
4. Trust signals (compliance-aware platform copy — no fake stats)
5. FAQ accordion (5 questions: who fulfills, direct hire?, messaging?, availability accuracy?, regions?)

---

## 8. Functional Requirements

### 8.1 Root redirect

- `app/page.tsx` redirects to `/marketplace` for MVP (config flag `MARKETPLACE_HOME=true`).

### 8.2 Navigation

| Link | Target |
|---|---|
| Categories | `/marketplace/categories` |
| Search | `/marketplace/search` |
| For agencies | `/signup` (agency owner) |
| Log in | `/login` with marketplace callback support |

### 8.3 Metadata

- `title`: AsNeeded — Healthcare Staffing Marketplace
- `description`: Discover and request healthcare professionals. Staffing fulfilled by agency coordinators.
- Child routes inherit layout disclaimer

### 8.4 Auth awareness

- Header shows customer name if `facility_user` session
- No agency app sidebar on marketplace routes

---

## 9. Data Requirements

- Read `marketplace_categories` for popular categories grid (top 6 `sort_order`)
- No writes

### Dependencies

| Module | Dependency |
|---|---|
| Category Directory (16) | Category links |
| Marketplace Search (18) | Search CTA |
| Location context (16) | Location chip |

---

## 10. Marketplace Rules

- Copy must state agency fulfillment authority
- No instant booking claims
- No gig economy imagery/copy

---

## 11. Authorization Rules

- All `/marketplace/*` routes public except customer-specific links requiring session

---

## 12. UX Requirements

- Premium healthcare marketplace aesthetic (distinct from agency app but same design tokens)
- Generous whitespace; accessible contrast
- Mobile hamburger nav

---

## 13. Error States

- Missing categories seed → hide popular section gracefully

---

## 14. Responsive Requirements

- Hero stacks on mobile; CTAs full width

---

## 15. Acceptance Criteria

- [ ] `/marketplace` live with layout and nav
- [ ] Location chip works on all child routes
- [ ] CTAs route correctly
- [ ] FAQ reflects no direct hire / no direct messaging
- [ ] Tests pass

---

## 16. Out of Scope

- CMS for home content
- Internationalization
