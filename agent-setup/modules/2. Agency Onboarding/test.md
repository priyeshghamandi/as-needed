# Agency Onboarding Test Plan

## Goal

Validate that the onboarding workflow correctly guides staffing agencies from signup to operational readiness.

---

# Welcome Screen

Validate:
- progress indicator visible
- onboarding steps visible
- estimated setup time visible
- continue CTA works

---

# Agency Profile Setup

Validate:
- required fields enforced
- specialties selectable
- invalid inputs rejected
- save/continue works
- responsive layout works

---

# Service Area Setup

Validate:
- Google Places autocomplete works
- invalid locations rejected
- service area saved correctly
- staffing radius saved correctly
- service area persists after refresh

---

# Workforce Setup

Validate:
- healthcare professional can be added
- invite flow works if implemented
- invalid emails rejected
- duplicate emails rejected
- required fields enforced
- professional location restricted to agency service area
- skip step works

---

# Facility Setup

Validate:
- facility can be added
- facility invite works if implemented
- duplicate emails rejected
- required fields enforced
- facility location restricted to agency service area
- skip step works

---

# Resume Behavior

Validate:
- onboarding progress persists
- refreshing page does not reset onboarding
- reopening onboarding resumes correct step

---

# Skip Behavior

Validate:
- workforce step can be skipped
- facility step can be skipped
- skipped state persists

---

# Completion Flow

Validate:
- onboarding completion state saved
- user redirected to dashboard
- onboarding banner removed after completion

---

# Dashboard Behavior

Validate:
- incomplete onboarding banner shown before completion
- banner removed after onboarding complete

---

# Authorization Testing

Validate:
- unauthenticated users blocked
- provider users blocked
- facility users blocked
- agency_owner allowed
- agency_admin allowed

---

# Responsive Testing

Validate:
- desktop layout
- tablet layout
- mobile layout
- no broken forms
- no overflow

---

# Accessibility Testing

Validate:
- labels exist
- buttons understandable
- keyboard navigation works
- validation messages readable

---

# Build Health

Run:

npm run lint
npm run typecheck
npm run build

---

# Acceptance Criteria

Module passes only when:
- onboarding flow works end-to-end
- onboarding progress persists
- onboarding resume works
- service area restrictions enforced
- workforce setup works
- facility setup works
- authorization enforced
- onboarding completion works
- dashboard redirect works
- build passes
- responsive behavior verified
