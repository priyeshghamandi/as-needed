# AsNeeded

A hybrid healthcare staffing marketplace and agency operations platform. Staffing agencies manage workforce, facilities, shifts, and compliance; customers discover eligible professionals through public category and search experiences, submit staffing requests routed to owning agencies, and agencies fulfill with confirmation or suggested alternatives.

## Tech stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes, PostgreSQL, Drizzle ORM
- **Auth:** Auth.js with database sessions
- **Email:** SendGrid (optional, for operational notifications)
- **Testing:** Vitest (unit), Playwright (e2e)

## Prerequisites

- Node.js 20+
- PostgreSQL
- (Optional) Google Places API keys for location autocomplete and service areas
- (Optional) SendGrid API key for notification emails

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Required variables:

   | Variable | Description |
   |----------|-------------|
   | `DATABASE_URL` | PostgreSQL connection string |
   | `AUTH_SECRET` | Session signing secret (min 32 characters) |

   See `.env.example` for optional keys (`GOOGLE_API_KEY`, `SENDGRID_API_KEY`, `NEXT_PUBLIC_APP_URL`, etc.).

3. **Run database migrations**

   ```bash
   npm run db:migrate
   ```

4. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Common scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run test` | Run unit tests (Vitest) |
| `npm run db:generate` | Generate Drizzle migrations from schema |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Open Drizzle Studio |

E2E tests use Playwright and expect the app at `http://localhost:3000` (or `PLAYWRIGHT_BASE_URL`). Chromium is installed to `.playwright-browsers` on `postinstall`.

Module-scoped test scripts (e.g. `npm run test:unit:auth`, `npm run test:e2e:workforce`) are defined in `package.json`.

## Project structure

```text
app/              Next.js routes (dashboard, marketplace, portals, API)
actions/          Server actions
components/       UI components
lib/              Business logic, auth, validations, integrations
drizzle/          Schema and migrations
e2e/              Playwright end-to-end tests
agent-setup/      Module PRDs, tasks, and agent workflow docs
```

### Main surfaces

- **Agency operations** — `/dashboard`, `/workforce`, `/facilities`, `/staffing-requests`, `/shifts`, `/settings`
- **Healthcare professional portal** — `/my-shifts`, `/availability`
- **Public marketplace** — `/marketplace` (category browse, search, professional profiles)
- **Customer flows** — `/customer`, `/care` (consumer home care)
- **Auth** — `/login`, `/signup`, `/invite`, `/onboarding`

## Database

Schema lives in `drizzle/schema.ts`. After schema changes:

```bash
npm run db:generate
npm run db:migrate
```

E2E seed scripts (require `.env` with a valid `DATABASE_URL`):

```bash
npm run db:seed:dashboard-e2e
npm run db:seed:onboarding-e2e
```

## Testing

**Unit tests**

```bash
npm run test
npm run test:unit:auth    # example: auth module only
```

**End-to-end tests**

```bash
npm run test:e2e:auth     # example: auth e2e
npm run test:e2e          # dashboard e2e suite
```

Playwright starts the dev server automatically unless one is already running (`reuseExistingServer`).

Before merging substantial changes, run:

```bash
npm run typecheck
npm run build
```

## Agent-assisted development

This repo includes a module-based workflow for Cursor agents (PRDs, tasks, acceptance tests). See [agent-setup/README.md](agent-setup/README.md) and the module registry at [agent-setup/modules/list.md](agent-setup/modules/list.md).

## License

Private — not for public distribution.
