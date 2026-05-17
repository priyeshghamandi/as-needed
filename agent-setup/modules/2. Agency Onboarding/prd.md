# Agency Onboarding PRD

## Overview

The Agency Onboarding module helps newly registered staffing agencies become operational as quickly as possible.

The onboarding experience should:
- reduce setup friction
- guide agencies toward operational readiness
- progressively collect critical operational information
- help agencies begin staffing workflows quickly

The onboarding flow begins immediately after successful agency signup.

---

# Goals

## Primary Goals

- Configure the agency workspace
- Define operational service area
- Add initial healthcare professionals
- Add initial facilities/customers
- Establish operational readiness

---

# Non-Goals (MVP)

The following are NOT included in MVP:

- Billing setup
- Subscription plans
- Payroll setup
- Advanced compliance automation
- Credential verification integrations
- Advanced workflow automation
- Multi-branch agencies
- Multi-region operational management

---

# Entry Point

After successful agency signup:

/signup → /onboarding

Only authenticated agency users with:
- agency_owner
- agency_admin

may access onboarding.

---

# Onboarding Structure

1. Welcome
2. Agency Profile
3. Service Area
4. Workforce Setup
5. Facility Setup
6. Completion

---

# Step 1: Welcome

## Purpose

Orient the agency and explain setup progress.

## UI Requirements

Display:
- welcome message
- onboarding progress indicator
- setup checklist preview
- estimated setup time
- Start Setup CTA

---

# Step 2: Agency Profile

## Purpose

Complete operational agency information.

## Fields

- agency logo
- agency phone
- agency website
- operational contact name
- operational contact email
- agency description
- staffing specialties

Examples:
- RN Staffing
- CNA Staffing
- Hospice Staffing
- Hospital Staffing

## Requirements

- specialties selectable
- validation required
- save progress automatically or explicitly

---

# Step 3: Service Area Setup

## Purpose

Define operational geography.

## Fields

- primary service area
- staffing radius

## Requirements

Use:
- Google Places autocomplete

Store:
- placeId
- displayName
- city
- state
- country
- latitude
- longitude
- staffing radius

## Validation

- invalid locations rejected
- staffing radius required

---

# Step 4: Workforce Setup

## Purpose

Add initial healthcare professionals.

## Requirements

Agency may:
- manually add professionals
- invite professionals
- skip temporarily

## Fields

- full name
- role
- phone
- email
- location

## Allowed Roles

- RN
- CNA
- EMT
- LPN
- CNS
- CNM

## Validation Rules

- duplicate emails rejected
- invalid emails rejected
- required fields enforced
- professional location must be within agency service area

---

# Step 5: Facility Setup

## Purpose

Add initial customer facilities.

## Requirements

Agency may:
- add facilities
- invite facility contacts
- skip temporarily

## Fields

- facility name
- facility type
- location
- primary contact
- phone
- email

## Validation Rules

- duplicate emails rejected
- required fields enforced
- facility location must align with agency service area

---

# Step 6: Completion

## Purpose

Show onboarding completion state.

## Display

- workforce count
- facility count
- readiness summary
- next recommended actions

CTA:
- Go To Dashboard

## Completion Rules

On completion:
- onboarding_completed = true
- redirect to /dashboard

---

# Skip Rules

The following steps may be skipped:
- workforce setup
- facility setup

Skipped state must persist.

---

# Resume Rules

If onboarding incomplete:
- user resumes from previous step
- progress persists after refresh

---

# Progress Tracking

Track:
- completed steps
- skipped steps
- onboarding percentage
- current onboarding step

---

# Dashboard Rules

Users may access dashboard before onboarding complete.

If onboarding incomplete:
- show incomplete onboarding banner

---

# Authorization Rules

Allowed:
- agency_owner
- agency_admin

Blocked:
- provider
- facility_user
- unauthenticated users

---

# UX Requirements

The onboarding should feel:
- operational
- guided
- low friction
- fast
- focused

Avoid:
- enterprise-heavy configuration
- large forms
- cluttered setup screens

Preferred UX:
- step-based wizard
- progress sidebar
- clear next actions

---

# Mobile Requirements

Support:
- desktop
- tablet
- mobile

---

# Error States

Handle:
- invalid locations
- duplicate professional email
- duplicate facility email
- failed invite
- incomplete required fields

---

# Success Metrics

Successful onboarding means:
- agency configured
- service area configured
- workforce added or skipped
- facilities added or skipped
- onboarding completed

---

# Out of Scope

- billing
- payroll
- credential verification
- advanced workflow automation
- AI onboarding assistant
- external integrations
