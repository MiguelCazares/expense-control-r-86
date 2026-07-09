# Route Control — API Endpoints

Base URL: `http://localhost:3000/api/v1`  
Swagger UI: `http://localhost:3000/api/docs`

> 🔐 All endpoints except Auth require `Authorization: Bearer <token>` header.

---

## Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new owner account |
| POST | `/auth/login` | Login and receive a JWT token |

### POST `/auth/register`
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "strongPassword123"
}
```
**Response**
```json
{
  "status": "success",
  "data": { "accessToken": "eyJ..." },
  "statusCode": 201
}
```

### POST `/auth/login`
```json
{
  "email": "juan@example.com",
  "password": "strongPassword123"
}
```
**Response**
```json
{
  "status": "success",
  "data": { "accessToken": "eyJ..." },
  "statusCode": 200
}
```

---

## Owners 🔐

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/owners/profile` | Get authenticated owner profile |
| PATCH | `/owners/profile` | Update name, email or password |

### PATCH `/owners/profile`
```json
{
  "name": "Juan Pérez Updated",
  "email": "new@example.com",
  "password": "newPassword123"
}
```

---

## Buses 🔐

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| POST | `/buses` | Create a bus | |
| GET | `/buses` | List all buses | `?page` `?limit` `?search` |
| GET | `/buses/:id` | Get a bus | |
| PATCH | `/buses/:id` | Update a bus | |
| DELETE | `/buses/:id` | Deactivate a bus (soft delete) | |
| GET | `/buses/:id/summary` | Monthly summary | `?month=2026-04` |

### POST `/buses`
```json
{
  "plate": "ABC-123",
  "number": "42",
  "model": "Sprinter",
  "brand": "Mercedes-Benz",
  "year": 2020,
  "route": "Route 86 - Downtown"
}
```

### GET `/buses/:id/summary?month=2026-04`
```json
{
  "status": "success",
  "data": {
    "summary": {
      "bus": { "id": 1, "plate": "ABC-123", "route": "Route 86 - Downtown" },
      "month": "2026-04",
      "totalIncome": 48000.00,
      "totalExpenses": 12300.00,
      "profit": 35700.00,
      "incomeRecords": 26,
      "expenseRecords": 14
    }
  }
}
```

---

## Drivers 🔐

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| POST | `/drivers` | Create a driver | |
| GET | `/drivers` | List all drivers | `?page` `?limit` `?search` |
| GET | `/drivers/:id` | Get a driver | |
| PATCH | `/drivers/:id` | Update a driver | |
| DELETE | `/drivers/:id` | Deactivate a driver (soft delete) | |
| POST | `/drivers/:id/assignments` | Assign driver to a bus on a date | |
| GET | `/drivers/:id/assignments` | List driver assignments | `?page` `?limit` |

### POST `/drivers`
```json
{
  "name": "Carlos",
  "lastName": "Ramírez",
  "license": "LIC-123456",
  "phone": "+521234567890"
}
```

### POST `/drivers/:id/assignments`
```json
{
  "busId": 1,
  "date": "2026-04-17"
}
```

---

## Shifts 🔐

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| POST | `/shifts` | Open a shift | |
| GET | `/shifts` | List shifts | `?driverId` `?busId` `?dateFrom` `?dateTo` |
| GET | `/shifts/:id` | Get shift with income and expenses | |
| GET | `/shifts/:id/summary` | Get shift totals and profit | |
| PATCH | `/shifts/:id` | Update shift / Close shift | |
| DELETE | `/shifts/:id` | Delete a shift | |

### POST `/shifts` — Open shift
```json
{
  "driverId": 1,
  "busId": 1,
  "date": "2026-04-17",
  "startTime": "05:30",
  "notes": "Holiday route"
}
```
**Response** — `status: "open"`

### PATCH `/shifts/:id` — Close shift
```json
{
  "endTime": "22:20"
}
```
**Response** — `status: "closed"` (auto set when endTime is provided)

### GET `/shifts/:id/summary`
```json
{
  "status": "success",
  "data": {
    "shift": { "id": 7, "date": "2026-04-17", "startTime": "05:30", "endTime": "22:20", "status": "closed" },
    "totalIncome": 3200.00,
    "totalExpenses": 1050.00,
    "profit": 2150.00
  }
}
```

---

## Income 🔐

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| POST | `/income` | Register daily income for a bus | |
| GET | `/income` | List income records | `?busId` `?dateFrom` `?dateTo` `?page` `?limit` |
| GET | `/income/:id` | Get an income record | |
| PATCH | `/income/:id` | Update an income record | |
| DELETE | `/income/:id` | Delete an income record | |

### POST `/income`
```json
{
  "busId": 1,
  "date": "2026-04-17",
  "amount": 3200.00,
  "notes": "Holiday route, extra passengers",
  "shiftId": 7
}
```

> `shiftId` is optional. Use it to link the income to an open shift.  
> Only one income record per bus per day is allowed.

---

## Expense Categories 🔐

Each owner has their own set of categories. Registering an account seeds four of them:
`Combustible` · `Mantenimiento` · `Reparación` · `Otro`.

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| POST | `/categories` | Create an expense category | |
| GET | `/categories` | List categories | `?page` `?limit` `?search` `?active` |
| GET | `/categories/:id` | Get a category | |
| PATCH | `/categories/:id` | Update name, color or active state | |
| DELETE | `/categories/:id` | Deactivate a category (soft delete) | |

### POST `/categories`
```json
{
  "name": "Peaje",
  "color": "purple"
}
```
**Response**
```json
{
  "status": "success",
  "data": {
    "category": {
      "id": 5,
      "name": "Peaje",
      "slug": "peaje",
      "color": "purple",
      "active": true
    }
  }
}
```

> `color` is optional and defaults to `default`. Available colors:
> `default` · `success` · `warning` · `danger` · `info` · `purple`  
> `slug` is derived from `name` (`Revisión Técnica` → `revision-tecnica`) and must be
> unique per owner — a duplicate name returns `400`.  
> Pass `?active=true` to list only assignable categories.

### DELETE `/categories/:id`
Deactivates the category instead of removing it. Expenses already assigned to it keep
their category and still resolve it on read, but the category can no longer be assigned
to new expenses. Reactivate it with `PATCH /categories/:id` and `{ "active": true }`.

---

## Expenses 🔐

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| POST | `/expenses` | Register an expense for a bus | |
| GET | `/expenses` | List expenses | `?busId` `?categoryId` `?dateFrom` `?dateTo` `?page` `?limit` |
| GET | `/expenses/:id` | Get an expense record | |
| PATCH | `/expenses/:id` | Update an expense record | |
| DELETE | `/expenses/:id` | Delete an expense record | |

### POST `/expenses`
```json
{
  "busId": 1,
  "date": "2026-04-17",
  "amount": 850.00,
  "categoryId": 1,
  "description": "Full tank, 80 liters",
  "shiftId": 7
}
```

**Response** — the category is embedded on read
```json
{
  "status": "success",
  "data": {
    "expense": {
      "id": 14,
      "date": "2026-04-17",
      "amount": 850.00,
      "categoryId": 1,
      "category": { "id": 1, "name": "Combustible", "slug": "fuel", "color": "warning", "active": true },
      "description": "Full tank, 80 liters"
    }
  }
}
```

> `shiftId` is optional. Use it to link the expense to an open shift.  
> `categoryId` must belong to the authenticated owner and be active — otherwise `400`.
> See [Expense Categories](#expense-categories-) to list the available ids.  
> Multiple expenses per bus per day are allowed.

---

## Cash Flow 🔐

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/cash-flow` | Business-wide income vs expenses for a date range | `?dateFrom` `?dateTo` `?busId` |

### GET `/cash-flow?dateFrom=2026-07-01&dateTo=2026-07-08`
`dateFrom` and `dateTo` are required (`YYYY-MM-DD`, inclusive). `busId` is optional — omit it to see the whole business, or pass it to scope the same response to a single bus.

```json
{
  "status": "success",
  "data": {
    "cashFlow": {
      "dateFrom": "2026-07-01",
      "dateTo": "2026-07-08",
      "busId": null,
      "totalIncome": 1250.00,
      "totalExpenses": 180.00,
      "balance": 1070.00,
      "incomeCount": 1,
      "expenseCount": 1,
      "expensesByCategory": [
        { "categoryId": 1, "name": "Combustible", "color": "warning", "amount": 180.00, "count": 1 }
      ],
      "daily": [
        { "date": "2026-07-01", "income": 0, "expenses": 0, "balance": 0 },
        { "date": "2026-07-07", "income": 1250.00, "expenses": 180.00, "balance": 1070.00 }
      ]
    }
  }
}
```

> `daily` always includes one row per day in the range, even days with no records (income/expenses default to 0).  
> Returns `400` if `dateFrom` is after `dateTo`.

---

## Full Day Flow

```
1. POST /auth/register              → create owner account
2. POST /auth/login                 → get accessToken

── SETUP (one time) ──────────────────────────────────
3. POST /buses                      → register a bus       { id: 1 }
4. POST /drivers                    → register a driver    { id: 1 }

   GET /categories                  → the 4 default categories, seeded on register
   POST /categories                 → optional: add your own  { id: 5, name: "Peaje" }

── DAILY ─────────────────────────────────────────────
5. POST /shifts                     → open shift           { id: 7, status: "open" }
   { driverId: 1, busId: 1, date, startTime }

6. POST /expenses                   → log fuel expense
   { busId: 1, date, amount: 850, categoryId: 1, shiftId: 7 }

7. POST /expenses                   → log repair expense
   { busId: 1, date, amount: 200, categoryId: 3, shiftId: 7 }

8. POST /income                     → log daily income
   { busId: 1, date, amount: 3200, shiftId: 7 }

9. PATCH /shifts/7                  → close shift          { status: "closed" }
   { endTime: "22:20" }

── REPORTS ───────────────────────────────────────────
10. GET /shifts/7/summary           → shift profit
    { totalIncome: 3200, totalExpenses: 1050, profit: 2150 }

11. GET /buses/1/summary?month=2026-04  → monthly summary
    { totalIncome: 48000, totalExpenses: 12300, profit: 35700 }

12. GET /cash-flow?dateFrom=2026-07-01&dateTo=2026-07-08  → weekly cash flow, whole business
    { totalIncome: 8200, totalExpenses: 2450, balance: 5750 }
```
