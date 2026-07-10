# Route Control — Database Schema

Postgres, managed with TypeORM migrations (`synchronize` is off — see `database/migrations/`).
8 tables in the `public` schema, all rooted at `owners` (multi-tenant by `owner_id`).

## Entity-relationship diagram

```mermaid
erDiagram
    OWNERS ||--o{ DRIVERS : "1:N"
    OWNERS ||--o{ BUSES : "1:N"
    OWNERS ||--o{ SHIFTS : "1:N"
    OWNERS ||--o{ EXPENSE_CATEGORIES : "1:N"
    DRIVERS ||--o{ DRIVER_ASSIGNMENTS : "1:N"
    BUSES ||--o{ DRIVER_ASSIGNMENTS : "1:N"
    DRIVERS ||--o{ SHIFTS : "1:N"
    BUSES ||--o{ SHIFTS : "1:N"
    BUSES ||--o{ INCOME : "1:N"
    BUSES ||--o{ EXPENSES : "1:N"
    SHIFTS ||--o{ INCOME : "1:N (opcional)"
    SHIFTS ||--o{ EXPENSES : "1:N (opcional)"
    EXPENSE_CATEGORIES ||--o{ EXPENSES : "1:N"

    OWNERS {
        int id PK
        varchar_100 name
        varchar_150 email UK
        varchar_255 password
        bool active
    }
    DRIVERS {
        int id PK
        varchar_100 name
        varchar_100 lastName
        varchar_50 license UK
        varchar_20 phone
        bool active
        int owner_id FK
    }
    BUSES {
        int id PK
        varchar_20 plate
        varchar_20 number
        varchar_100 model
        varchar_100 brand
        int year
        varchar_150 route
        bool active
        int owner_id FK
    }
    DRIVER_ASSIGNMENTS {
        int id PK
        date date
        bool active
        int driver_id FK
        int bus_id FK
    }
    SHIFTS {
        int id PK
        date date
        time start_time
        time end_time
        enum status
        text notes
        decimal_4_1 laps
        int driver_id FK
        int bus_id FK
        int owner_id FK
    }
    INCOME {
        int id PK
        date date
        decimal_10_2 amount
        text notes
        int bus_id FK
        int shift_id FK "nullable"
    }
    EXPENSE_CATEGORIES {
        int id PK
        varchar_60 name
        varchar_60 slug
        enum color
        bool active
        int owner_id FK
    }
    EXPENSES {
        int id PK
        date date
        decimal_10_2 amount
        text description
        int category_id FK
        int bus_id FK
        int shift_id FK "nullable"
    }
```

## Design notes

**Multi-tenancy by `owner_id`.** No schema/DB-per-tenant split — `owners` is the root and
everything hangs off it, either directly (`drivers`, `buses`, `shifts`,
`expense_categories`) or transitively (`income`/`expenses` inherit their owner through
`bus_id`; `driver_assignments` through `driver_id`/`bus_id`). No query should ever cross
owners.

**Constraints enforced by the database itself:**
- `owners.email` — `UNIQUE`
- `drivers.license` — `UNIQUE` (global, not scoped per owner)
- `expense_categories (owner_id, slug)` — unique composite index
- `shifts.laps` — `CHECK` (`NULL`, or a multiple of 0.5 and `>= 0`)
- Every FK is `ON DELETE NO ACTION` — nothing cascades. The soft-delete pattern on
  `buses`/`drivers`/`expense_categories` (`active = false` instead of a real `DELETE`)
  exists precisely to avoid ever hitting this.

**Rules that exist only in the application layer (not the database):**
- Uniqueness of `buses.plate` per owner — enforced in `BusesService.create`/`update`,
  there is no `UNIQUE` constraint on the column.
- "One `income` record per bus per day" — documented in `API.md`, but not actually
  enforced anywhere in `IncomeService.create`, nor by a DB constraint. This is a known
  gap, not yet fixed.

**Notable optional relationships:** `income.shift_id` and `expenses.shift_id` are
nullable — an income/expense record can stand alone or be linked to an open shift.
