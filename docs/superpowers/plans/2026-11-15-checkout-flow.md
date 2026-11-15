# Checkout Flow Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans task by task.

**Goal:** Add a product to a cart, checkout once, and reduce inventory exactly once even when the checkout request is retried.

**Architecture:** Cart, Inventory, and Order are separate Spring Boot services with separate PostgreSQL databases. Order orchestrates checkout over HTTP. Inventory owns stock and deduplicates reservations by checkout key; Order stores the same key and returns the original order on retry.

**Tech Stack:** Java 25, Spring Boot 4.0.8, Maven, PostgreSQL 17, Flyway, Spring JDBC, Testcontainers.

**Spec:** User request, milestone 2.

## Global Constraints

- Keep the existing Product Service working.
- Each new service owns its data.
- Use Testcontainers with PostgreSQL for integration checks.
- Duplicate checkout keys return the original order without reducing stock twice.

## Review Focus

- Concurrent duplicate reservations must decrement stock once.
- Insufficient stock must leave every item unchanged.
- Reused checkout key with a different cart or items must return conflict.
- An empty cart must not create an order or reserve stock.
- If Order fails after Inventory reserves, retry must finish using the same reservation.

---

### Task 1: Cart

- [x] Write a PostgreSQL Testcontainers test for adding and reading cart items.
- [x] Implement Cart API, schema, and configuration.
- [x] Verify test passes.

### Task 2: Inventory

- [x] Write PostgreSQL Testcontainers tests for reservation, repeat, conflict, and insufficient stock.
- [x] Implement stock API and transactional reservation.
- [x] Verify tests pass.

### Task 3: Order

- [x] Write PostgreSQL Testcontainers test for checkout retry and same order ID.
- [x] Implement HTTP clients, order persistence, and API.
- [x] Verify tests pass.

### Task 4: Demo and integration

- [x] Add Compose databases and run instructions.
- [x] Run the complete flow and check inventory decreased once.
- [x] Build and test all services with Java 25.
- [ ] Merge the feature branch into `main` and push.
