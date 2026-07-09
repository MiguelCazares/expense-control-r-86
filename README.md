# Route Control

A NestJS API to manage a bus fleet: buses, drivers, shifts, income and operating
expenses, with cash-flow reporting.

Every resource is scoped to the authenticated owner. See [API.md](./API.md) for the full
endpoint reference.

## Modules

| Module | Responsibility |
|--------|----------------|
| `auth` | Owner registration and JWT login |
| `owners` | Owner profile |
| `buses` | Fleet, plus per-bus monthly summary |
| `drivers` | Drivers and their bus assignments |
| `shifts` | Open/close a shift, linking its income and expenses |
| `income` | Daily income per bus |
| `categories` | Expense categories, one catalog per owner |
| `expenses` | Operating expenses, each classified by a category |
| `cash-flow` | Income vs expenses over a date range, broken down by category |

## Expense categories

Categories are a per-owner catalog (`expense_categories`), not a fixed enum — owners can
create their own. Registering an account seeds four defaults: `Combustible`,
`Mantenimiento`, `Reparación` and `Otro`. Each expense references one through
`expenses.category_id`.

Deleting a category deactivates it rather than removing the row, so expenses already
classified under it keep their history; only new expenses are prevented from using it.

## Project setup

```bash
$ pnpm install
```

Start Postgres:

```bash
$ docker compose up -d
```

`docker-compose.yml` starts two databases: `route_control` (port `54380`) for development
and `route_control_test` (port `54381`) for the e2e suite. `.env` points to the first,
`.env.test` to the second.

## Database migrations

The schema is managed with TypeORM migrations (`synchronize` is off). Run them before
starting the app for the first time:

```bash
# apply pending migrations
$ pnpm migration:run

# revert the last one
$ pnpm migration:revert

# drop the schema and re-apply everything from scratch
$ pnpm migration:fresh
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Code quality

```bash
# lint, format, unit tests and e2e in one go
$ pnpm run dev:check
```
