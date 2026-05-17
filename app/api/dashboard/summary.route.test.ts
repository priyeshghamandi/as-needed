/**
 * OPS-T003: Dashboard uses Server Components + lib/dashboard/queries.ts
 * instead of REST routes. Authorization is covered by lib/auth/dashboard-access.test.ts.
 */
import { describe, it } from "vitest";

describe("GET /api/dashboard/summary", () => {
  it.skip("OPS-UT-020–023: N/A — no REST route; see lib/auth/dashboard-access.test.ts", () => {});
});
