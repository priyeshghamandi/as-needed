# Dashboard E2E seed

Run before Playwright dashboard tests:

```bash
npm run db:seed:dashboard-e2e
```

Password for all users: `E2eTestPassword1!`

| Email | Role | Agency |
|---|---|---|
| `e2e-dash-owner-a@example.com` | `agency_owner` | Agency A (populated, onboarding complete) |
| `e2e-dash-owner-b@example.com` | `agency_owner` | Agency B (empty) |
| `e2e-dash-owner-incomplete@example.com` | `agency_owner` | Agency A incomplete onboarding |
| `e2e-dash-coordinator@example.com` | `staffing_coordinator` | Agency A |
| `e2e-dash-recruiter@example.com` | `recruiter` | Agency A |
| `e2e-dash-compliance@example.com` | `compliance_manager` | Agency A |
| `e2e-dash-provider@example.com` | `provider` | — |
| `e2e-dash-facility@example.com` | `facility_user` | — |

Agency A: 3 open requests, 2 available professionals, 1 urgent shift, 2 compliance alerts, 5 activity logs, fill rate 80% (4/5).
