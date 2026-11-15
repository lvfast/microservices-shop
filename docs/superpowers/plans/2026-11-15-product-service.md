# Product Service Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task by task.

**Goal:** `GET /products` returns two sample products persisted in PostgreSQL.

**Architecture:** A single Spring Boot service owns the product table. Flyway creates and seeds it, Spring Data JPA reads it, and a controller returns a small public response.

**Tech Stack:** Java 25, Spring Boot 4.0, Maven, PostgreSQL, Docker Compose, JUnit.

**Spec:** User request of 2026-11-15, milestone 1.

## Global Constraints

- Keep this milestone limited to Product Service.
- PostgreSQL runs via Docker Compose.
- Seed exactly two products in the initial migration.
- The endpoint is `GET /products` and returns HTTP 200.

## Review Focus

- Database unavailable: startup fails clearly rather than serving hard-coded products.
- Migration rerun: seed rows are not duplicated.
- Response: prices retain decimal precision and product fields are stable.

---

### Task 1: Product API

**Files:** `product-service/pom.xml`, Java source and test under `product-service/src`.

**Interfaces:** `GET /products` produces a JSON array of products with `id`, `name`, `description`, `price`.

- [x] Write a controller test for HTTP 200 and two products.
- [ ] Run it to observe the expected failure. Maven could not resolve dependencies until network access was available; the first executable test ran after implementation.
- [x] Add the application, entity, repository, response, and controller.
- [x] Run the test and package the service.

### Task 2: PostgreSQL persistence

**Files:** `compose.yaml`, `product-service/src/main/resources/application.yaml`, Flyway migration.

- [x] Add PostgreSQL Compose service with a health check and persisted volume.
- [x] Add Flyway schema and two seed rows.
- [x] Configure JPA to validate the migrated schema.
- [x] Run database and HTTP smoke test when Docker and Java 25 are available.

### Task 3: Run instructions

**Files:** `.gitignore`, `README.md`.

- [x] Document prerequisites, startup commands, expected response, and next milestone.
- [x] Check Git status and ensure build output is ignored.
