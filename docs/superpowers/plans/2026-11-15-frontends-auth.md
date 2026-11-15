# Frontends and Authentication Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans task by task.

**Goal:** Build customer Storefront and administrator Backoffice with Next.js, Keycloak login, role based access, and server side aggregation of service data.

**Architecture:** Two Next.js apps share one local Keycloak realm. Storefront serves public catalog and authenticated checkout through route handlers. Backoffice requires a `shop-admin` role for pages and BFF routes. Both apps call backend services from the server, keeping service URLs out of browser code.

**Tech Stack:** Next.js 16, React 19, TypeScript, Auth.js 5 beta, Keycloak 26, Node 24.

**Spec:** User request, milestone 3.

## Global Constraints

- Keep the four Java services and PostgreSQL flows working.
- Two browser interfaces: Storefront on port 3000 and Backoffice on port 3001.
- Use Keycloak for sign in, and enforce admin role on the server for Backoffice pages and API routes.
- BFF endpoints aggregate Product and Inventory data.
- Merge and push to `main` when tests and browser checks pass.

## Review Focus

- An unauthenticated checkout request must return 401.
- A customer account must not access Backoffice data or pages.
- Admin role must come from Keycloak, not a query parameter or browser state.
- Backend service failures must produce a visible error rather than fabricated data.
- Client secrets must stay out of browser bundles and tracked environment files.

---

### Task 1: Local identity

- [x] Add Keycloak Compose service and importable realm with customer/admin roles and demo users.
- [x] Verify discovery and sign in configuration.

### Task 2: Storefront

- [x] Scaffold Next.js App Router with TypeScript and Auth.js.
- [x] Add server catalog aggregation and customer cart/checkout BFF routes.
- [x] Build product and cart screens.
- [x] Test route behavior and production build.

### Task 3: Backoffice

- [x] Scaffold separate Next.js app and Auth.js client.
- [x] Add server enforced admin gate and product/stock overview BFF.
- [x] Build overview and order lookup screens.
- [x] Test role denial and production build.

### Task 4: Verify and integrate

- [x] Run both interfaces against Keycloak and Java services.
- [x] Check customer and admin roles in browser.
- [x] Update README with demo accounts and setup.
- [ ] Merge feature branch and push `main`.
