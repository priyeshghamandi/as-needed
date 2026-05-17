# PRD: Healthcare Staffing Operations SaaS

## 1. Product Summary

This product is a healthcare staffing operations platform for staffing agencies.

It helps agencies coordinate healthcare professional availability, manage staffing requests from facilities, assign professionals to shifts, track compliance readiness, handle cancellations, and maintain operational visibility.

The product is agency-first. Agencies are the primary paying customer and own the workspace. Healthcare professionals and facilities participate in the agency's staffing workflow.

## 2. Product Positioning

This is an operational control center for healthcare staffing agencies.

It is not:
- a job board
- an applicant tracking system
- a public labor marketplace
- payroll software
- hospital ERP
- generic HR software

Core positioning:

> Air traffic control for healthcare staffing operations.

## 3. Primary Customer

### Staffing Agencies

Agencies use the platform to:
- manage workforce availability
- create and fulfill staffing requests
- coordinate healthcare professionals
- track compliance readiness
- manage facilities/customers
- reduce manual calls, texts, and spreadsheet work
- improve fill rates and time-to-fill

## 4. User Types

### Agency Owner

Business buyer and operational leader.

Goals:
- improve fill rates
- reduce operational chaos
- monitor team productivity
- improve customer retention
- maintain compliance visibility
- scale staffing operations

### Staffing Coordinator

Primary daily operational user.

Goals:
- fill staffing requests quickly
- find available healthcare professionals
- send shift invites
- track confirmations
- handle cancellations
- monitor request status

### Recruiter

Maintains workforce supply and professional relationships.

Goals:
- add professionals
- keep workforce data current
- improve response rates
- support shift fulfillment

### Compliance Manager

Tracks required credentials and compliance risks.

Goals:
- monitor expiring credentials
- flag missing requirements
- keep assignments compliant

### Healthcare Professional

Invited by an agency. Cannot publicly self-sign up in V1.

Examples:
- RN
- CNA
- EMT
- LPN
- CNS

Goals:
- manage availability
- receive shift invites
- accept or decline shifts
- view upcoming shifts
- upload credentials
- communicate with coordinator

### Facility User

Facility/customer connected to an agency.

Examples:
- hospital staffing manager
- nursing home administrator
- clinic manager
- assisted living operations staff

Goals:
- submit staffing requests
- track fulfillment status
- view assigned professionals
- communicate with agency
- update/cancel requests

## 5. Core MVP Goal

The MVP must support the core staffing loop:

1. Agency creates workspace
2. Agency adds workforce and facilities
3. Facility or agency creates staffing request
4. Coordinator reviews request
5. System shows matching professionals from mock data
6. Coordinator invites/assigns professionals
7. Professional accepts or declines shift
8. Request moves through fulfillment statuses
9. Facility sees request status and assigned professionals
10. Agency handles cancellations, compliance alerts, and exceptions

## 6. MVP Modules

### 6.1 Public Homepage

Purpose:
Introduce the platform to agencies and explain the multi-sided workflow.

Must communicate:
- agency-first product
- workforce availability coordination
- staffing request fulfillment
- compliance visibility
- facility coordination
- operational control center

Primary CTA:
- Request a Demo

Secondary CTA:
- See Platform Overview

### 6.2 Signup

The public signup experience must show two paths:

1. Staffing Agency
   - Create agency workspace
   - Primary path

2. Facility / Customer
   - Request access or join by invite
   - Secondary path

Healthcare professionals do not have public self-signup.

### 6.3 Agency Post-Signup Onboarding

After agency signup, show an onboarding wizard.

Steps:
1. Welcome
2. Invite internal team
3. Add healthcare professionals
4. Add facilities/customers
5. Configure compliance requirements
6. Create first staffing request
7. Completion screen leading to dashboard

### 6.4 Agency Operations Dashboard

Purpose:
Control center for agency operations.

Must show:
- open staffing requests
- fill rate
- available professionals
- urgent shifts
- active facilities
- compliance alerts
- active staffing requests table
- available healthcare professionals
- operational risks
- coordinator activity
- facility activity
- recent activity feed
- quick actions

### 6.5 Staffing Requests Module

Purpose:
Manage the core fulfillment workflow.

Views:
- request list view
- request detail view
- create staffing request flow

Request statuses:
- Open
- Matching
- Partially Filled
- Confirmed
- Completed
- Cancelled
- At Risk

Detail view must include:
- request summary
- fulfillment progress
- assigned professionals
- suggested matches
- facility details
- compliance verification
- operational activity
- risk alerts
- communication panel

### 6.6 Create Staffing Request Flow

Fields:
- facility
- facility unit/department
- role needed
- specialty
- number of professionals required
- shift date
- start time
- end time
- shift type
- urgency/priority
- required certifications
- required experience
- assigned coordinator
- internal notes
- facility instructions

After creation, redirect to staffing request detail view.

### 6.7 Workforce Module

Purpose:
Manage healthcare professionals.

Views:
- workforce list
- healthcare professional profile
- add/invite/import professional flow

Workforce list must show:
- name
- role
- specialty
- location
- availability status
- current assignment
- compliance status
- reliability score
- last shift
- shift readiness

Profile must show:
- profile header
- availability calendar
- credentials and compliance
- shift history
- current assignments
- communication timeline
- operational metrics

### 6.8 RN Shift Interaction Flow

Mobile-first experience for healthcare professionals.

Screens:
- shift invite notification
- shift details
- accept/decline flow
- upcoming shifts
- availability management
- cancellation/replacement flow

Healthcare professionals join through invitation only.

### 6.9 Facility Request Flow

Lightweight portal for facilities.

Screens:
- invite acceptance/login
- facility dashboard
- create staffing request
- request status tracking
- assigned professionals view
- update/cancel request
- communication with agency

### 6.10 Notifications & Operational Alerts

Purpose:
Support real-time staffing coordination.

Notification categories:
- staffing requests
- shift updates
- cancellations
- compliance
- workforce availability
- facility updates
- critical alerts

Priority levels:
- Info
- Important
- Urgent
- Critical

Must support:
- global notification center
- dashboard alerts
- shift reminders
- cancellation alerts
- compliance alerts
- urgent staffing alerts
- mobile notification UX
- toast/banner patterns

### 6.11 Error & Exception States

Must design and support UI states for:
- no available professional found
- compliance mismatch
- shift conflict
- professional declines shift
- professional cancels shift
- facility cancels request
- request partially filled
- invite expired
- credential expired
- shift still unfilled near start time

## 7. Navigation Architecture

Agency app sidebar:
- Dashboard
- Staffing Requests
- Workforce
- Facilities
- Shifts
- Compliance
- Messages
- Reports
- Settings

Facility portal navigation:
- Dashboard
- Requests
- Assigned Staff
- Messages
- Settings

Healthcare professional navigation:
- My Shifts
- Availability
- Credentials
- Messages
- Profile

## 8. Core Entities

### Agency
- id
- name
- logo
- service regions
- timezone
- agency type

### User
- id
- name
- email
- phone
- role
- agencyId optional
- facilityId optional

### Facility
- id
- agencyId
- name
- type
- location
- contact person
- contact email
- contact phone

### HealthcareProfessional
- id
- agencyId
- name
- role
- specialty
- email
- phone
- location
- availabilityStatus
- complianceStatus
- reliabilityScore

### StaffingRequest
- id
- agencyId
- facilityId
- roleNeeded
- specialty
- numberRequired
- numberAssigned
- shiftDate
- startTime
- endTime
- priority
- status
- coordinatorId
- notes

### Shift
- id
- staffingRequestId
- facilityId
- startTime
- endTime
- status

### Assignment
- id
- shiftId
- professionalId
- status
- confirmationStatus

### Credential
- id
- professionalId
- type
- status
- expirationDate

### Availability
- id
- professionalId
- date
- startTime
- endTime
- status

### Notification
- id
- userId
- type
- priority
- title
- message
- relatedEntityType
- relatedEntityId
- readAt

### ActivityEvent
- id
- agencyId
- actorId
- entityType
- entityId
- action
- timestamp

## 9. Status Definitions

### Staffing Request Status
- Open: request created, not yet being worked
- Matching: coordinator/system is looking for professionals
- Partially Filled: some but not all required professionals assigned
- Confirmed: all required professionals confirmed
- Completed: shift has been completed
- Cancelled: request cancelled
- At Risk: request has operational risk such as low time remaining, cancellation, or no matches

### Professional Availability Status
- Available
- On Shift
- Unavailable
- Pending Confirmation
- Off Duty

### Compliance Status
- Verified
- Expiring Soon
- Missing Requirement
- Pending Review
- Suspended

### Assignment Status
- Invited
- Accepted
- Declined
- Confirmed
- Checked In
- Completed
- Cancelled
- No Show

### Notification Priority
- Info
- Important
- Urgent
- Critical

## 10. Design System Requirements

Use a clean, premium B2B SaaS visual style.

Requirements:
- TailwindCSS
- shadcn/ui components
- lucide-react icons
- white/light background
- blue/teal healthcare accents
- rounded cards
- clear tables
- consistent badge system
- responsive by default
- mobile-first for professional experience
- accessible forms and controls

## 11. Non-Goals For MVP

Do not build unless explicitly added later:
- payroll
- invoicing
- billing
- payment processing
- public healthcare professional marketplace
- job board
- applicant tracking pipeline
- automated credential verification integrations
- VMS integrations
- advanced AI optimization
- mobile native apps
- complex chat platform
- advanced analytics suite

## 12. Engineering Assumptions

For the first build:
- mock/static data is acceptable
- no backend is required unless specifically tasked
- flows can be simulated on the frontend
- local component state is acceptable
- persistence is not required unless a task says so
- focus on usable UI workflows and clean structure

## 13. Definition Of Done For MVP Prototype

The prototype is MVP-ready for engineering handoff when:
- agency can complete signup/onboarding flow
- agency can access dashboard
- agency can view/create staffing requests
- agency can view request detail and suggested matches
- agency can manage workforce list and profile
- healthcare professional can view and respond to shift invite
- facility can create and track request
- notifications and alerts are represented
- key exception states are represented
- layout is responsive
- UI language is consistent
