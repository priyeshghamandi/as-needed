# Authentication & Access Management PRD

## Overview

The Authentication & Access Management module provides secure identity, login, session management, and role-based access control for the healthcare staffing operations platform.

This module supports three primary user categories:

1. Agency Users
2. Healthcare Professionals (HPs)
3. Facility Users

The system uses a unified authentication architecture with different onboarding and access flows per user type.

This module acts as the foundation for all other platform modules.

---

# Goals

## Primary Goals

- Secure authentication for all platform users
- Role-based authorization
- Agency-scoped access control
- Invite-based onboarding for non-agency-owner users
- Session management
- Password management
- Protected routes

---

# Non-Goals (MVP)

The following are NOT included in MVP:

- SSO/SAML
- Multi-factor authentication
- Social login providers
- Advanced RBAC permissions editor
- Organization switching
- Audit-grade compliance logging
- Device management
- Biometric authentication
- Passkeys

---

# User Types

## 1. Agency Users

Examples:
- Agency Owner
- Agency Admin
- Staffing Coordinator
- Recruiter
- Compliance Manager

### Access Method
- Agency Owner:
  - Self-signup
- All other agency users:
  - Invite-only

---

## 2. Healthcare Professionals (HPs)

Examples:
- RN
- CNA
- EMT
- LPN
- CNM
- CNS

### Access Method
- Invite-only
- Cannot self-signup

Reason:
Agencies own workforce onboarding and compliance validation.

---

## 3. Facility Users

Examples:
- Hospital Staffing Manager
- Clinic Operations Manager
- Nursing Home Administrator

### Access Method
- Invite-only
- Created by agency

---

# Roles

## Global Role

### platform_admin
Full system-level access.

---

## Agency-Scoped Roles

### agency_owner
- Full agency access
- Billing/settings access
- Team management

### agency_admin
- Operational admin access

### staffing_coordinator
- Staffing operations
- Shift coordination
- Assignment management

### recruiter
- Workforce management
- Professional onboarding

### compliance_manager
- Credential verification
- Compliance monitoring

### facility_user
- Facility portal access
- Request creation
- Request tracking

### provider
- Healthcare professional portal access
- Availability management
- Shift acceptance

---

# Core Flows

---

# Flow 1: Agency Owner Signup

## Description

Agency owner creates:
- user account
- agency workspace
- authenticated session

## Steps

1. User submits signup form
2. System validates data
3. Password hashed using argon2
4. User created
5. Agency created
6. user_role created:
   - role = agency_owner
7. Session created
8. Redirect to onboarding

## Signup Fields

- Agency name
- Agency type
- Workforce size
- Primary service area
- Owner name
- Phone number
- Work email
- Password

---

# Flow 2: Agency Staff Invite

## Description

Agency owner/admin invites internal team members.

## Steps

1. Admin enters email + role
2. Invite token created
3. Invite email sent
4. User opens invite
5. User sets password
6. Session created
7. User redirected to dashboard

---

# Flow 3: Healthcare Professional Invite

## Description

Agency invites healthcare professional into staffing network.

## Steps

1. Agency adds professional
2. Invite sent via email/SMS
3. Professional accepts invite
4. Password created
5. Professional profile completed
6. Session created

---

# Flow 4: Facility User Invite

## Description

Agency invites facility contact.

## Steps

1. Agency creates facility
2. Facility contact invited
3. User activates account
4. Session created
5. Facility portal accessible

---

# Authentication Requirements

## Password Rules

- Minimum 8 characters
- Hashed using argon2
- Never stored in plaintext

---

# Session Management

Use:
- Auth.js v5
- Database sessions

Requirements:
- Secure cookies
- Protected routes
- Session expiration

---

# Authorization Model

Authorization is role-based and agency-scoped.

Example:
A staffing coordinator from Agency A cannot access:
- Agency B workforce
- Agency B staffing requests
- Agency B facilities

---

# Protected Areas

## Agency Users

Protected routes:
- /dashboard
- /workforce
- /staffing-requests
- /facilities
- /compliance
- /settings

---

## Healthcare Professionals

Protected routes:
- /my-shifts
- /availability
- /notifications

---

## Facility Users

Protected routes:
- /facility/dashboard
- /facility/requests

---

# Database Schema

## users

Stores:
- identity
- login credentials
- profile basics

---

## user_roles

Stores:
- role
- agency scope

---

## agencies

Stores:
- agency workspace data

---

# Security Requirements

## Required

- Password hashing
- Server-side validation
- Route protection
- Secure sessions
- CSRF protection
- Duplicate email prevention

---

## Optional Later

- MFA
- SSO
- Device management
- IP restrictions

---

# Technical Stack

## Frontend

- Next.js App Router
- React Hook Form
- Zod
- shadcn/ui

---

## Backend

- Auth.js v5
- Drizzle ORM
- PostgreSQL
- argon2

---

# API Endpoints

## Auth

POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password

---

## Invites

POST /api/invites
POST /api/invites/accept

---

# UX Requirements

## Signup UX

Must feel:
- fast
- operational
- professional
- low-friction

Avoid:
- enterprise complexity
- excessive verification

---

# Error States

## Examples

- Email already exists
- Invalid invite token
- Expired invite
- Weak password
- Unauthorized access
- Invalid session

---

# Success Metrics

## MVP Success

- Agency owner can sign up
- Agency can invite users
- HP can accept invite
- Facility user can access portal
- Sessions work correctly
- Authorization enforced correctly

---

# Out of Scope

- Billing
- Subscription management
- MFA
- SSO
- OAuth providers
- Team analytics
- Audit-grade compliance
- Enterprise IAM