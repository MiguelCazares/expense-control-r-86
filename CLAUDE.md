# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Route Control API: a NestJS + TypeORM + Postgres backend for managing a bus fleet
(buses, drivers, shifts, income, operating expenses, cash-flow reporting). Every
resource is scoped to the authenticated owner (multi-tenant by `owner_id`, not by
separate schemas/databases). See `README.md` for module responsibilities and
`API.md` for the full endpoint reference with example payloads.

## Commands

```bash
pnpm install                # install deps
docker compose up -d        # start dev + test Postgres (ports 54380 / 54381)

pnpm run start:dev          # run API in watch mode (http://localhost:3000/api/v1)

pnpm run lint                # eslint --fix on src/apps/libs/test
pnpm run format               # prettier --write src/test

pnpm run test                 # unit tests (jest, rootDir: src)
pnpm run test:watch
pnpm run test:cov
pnpm run test:e2e             # e2e (NODE_ENV=test, separate jest-e2e.json config)
pnpm run dev:check            # lint + format + test + test:e2e, run before considering work done

pnpm migration:run             # apply pending TypeORM migrations
pnpm migration:revert           # revert the last migration
pnpm migration:generate         # diff entities vs schema into a new migration (data-source: src/infrastructure/data-source.ts)
pnpm migration:create           # blank migration file
pnpm migration:fresh             # drop schema + re-apply all migrations (./scripts/migration-fresh.sh; prompts for confirmation against the real DB, use NODE_ENV=test for the disposable test DB)
```

To run a single unit test file: `pnpm test src/buses/buses.service.spec.ts` (or `-t "name"` for a single case).
`synchronize` is off — schema changes always go through a migration, never edit tables by hand.

## Architecture

**Module-per-resource.** Each top-level resource under `src/` (`auth`, `owners`, `buses`,
`drivers`, `income`, `expenses`, `categories`, `shifts`, `cash-flow`) is a self-contained
Nest module with its own `*.controller.ts`, `*.service.ts`, `dto/`, and (where it owns
data) `entities/`. Modules that need another module's repository inject it directly
(e.g. `BusesService` injects `IncomeEntity`/`ExpenseEntity` repositories for monthly
summaries) rather than going through the other module's service.

**Auth model.** `JwtAuthGuard` is registered globally via `APP_GUARD` in `app.module.ts`,
so every route requires a valid JWT by default. Mark a route public with `@Public()`
(`src/common/decorators/public.decorator.ts`) — used only by `/auth/register` and
`/auth/login`. Inside a handler, get the authenticated owner with
`@CurrentOwner() owner: OwnerEntity` (`src/common/decorators/current-owner.decorator.ts`),
never trust an `ownerId` from the request body/params.

**Ownership scoping pattern.** Services take `ownerId` as an explicit parameter on every
method (not derived from a request-scoped context). `findOne` typically loads by primary
key alone, then throws `ForbiddenException` if `entity.ownerId !== ownerId` (see
`BusesService.findOne`) — this keeps a mismatched owner a 403, not a leaked 404. Follow
this pattern for any new resource-scoped query.

**Soft delete.** "Delete" endpoints on `buses`, `drivers`, `categories` set `active = false`
instead of removing the row, so historical `income`/`expenses`/`shifts` referencing them
keep resolving. Categories additionally block *new* expenses from referencing an inactive
category id. When adding a new resource that expenses/income/shifts can reference, prefer
this pattern over a hard delete.

**Response shape.** Controllers return `ResponseHelper.jsendSuccess(data, statusCode?)`
from `@miguelcazares/nestjs-response-helper` (JSend format: `{ status, data, statusCode }`).
Errors go through `GlobalExceptionFilter` from `@miguelcazares/nestjs-global-exception-filter`,
registered once in `main.ts` — don't build ad-hoc error response shapes in controllers.

**Pagination.** List endpoints take `PaginationQueryDto` (`page`, `limit`, optional
`search`) and return `PaginatedResponseDto<T>` via `buildPaginatedResponse()`
(`src/common/dto/pagination-response.dto.ts`). Reuse these instead of hand-rolling
pagination per module.

**Validation.** Global `ValidationPipe` in `main.ts` has `whitelist: true` and
`forbidNonWhitelisted: true` — any DTO property not explicitly declared with
`class-validator` decorators is rejected (422), so new DTO fields must be added to the
DTO class, not just the entity.

**Config.** `ConfigModule` is global; each `src/config/*.config.ts` exports a
namespaced config factory plus a Joi validation schema, both merged into
`app.module.ts`. Env file is `.env`, or `.env.test` when `NODE_ENV=test` (this switch is
duplicated in `src/infrastructure/data-source.ts` for the TypeORM CLI, since it runs
outside Nest's DI and doesn't share `ConfigModule` — keep both in sync if the logic ever
changes).

**Logging.** `nestjs-pino` (`src/infrastructure/logger.module.ts`), configured via
`src/config/logger.config.ts`; `app.useLogger(app.get(Logger))` is wired in `main.ts`.

**Expense categories** are a per-owner catalog (`expense_categories`), not a fixed enum.
Registering an owner seeds four defaults (`Combustible`, `Mantenimiento`, `Reparación`,
`Otro`); `slug` is derived from `name` and unique per owner. See `src/categories/`.

## Code style

- Prettier: single quotes, trailing commas everywhere (`.prettierrc`).
- ESLint: `typescript-eslint` recommendedTypeChecked + prettier; `no-explicit-any` is
  off, `no-floating-promises`/`no-unsafe-argument` are warnings, not errors.
