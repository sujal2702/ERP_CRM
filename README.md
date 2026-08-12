# Mini ERP + CRM Portal

A full-stack, enterprise-grade **Mini ERP & Customer CRM Portal** built with **React (TypeScript)**, **Express (Node.js)**, **Prisma ORM**, and **PostgreSQL (Neon Cloud)**.

The application streamlines wholesale business operations, including multi-role JWT authentication, customer follow-up notes, product catalog management, low-stock threshold alerting, inventory stock movement tracking, and **atomic sales challan confirmations with database stock deduction safeguards**.

---

## 1. Live Application URLs & Repository

* **Frontend Web Application (Vercel)**: [https://erp-crm-chi.vercel.app](https://erp-crm-chi.vercel.app)
* **Backend REST API (Render)**: [https://erp-crm-2gdx.onrender.com](https://erp-crm-2gdx.onrender.com)
* **API Health Check**: [https://erp-crm-2gdx.onrender.com/api/health](https://erp-crm-2gdx.onrender.com/api/health)
* **GitHub Repository**: [https://github.com/sujal2702/ERP_CRM.git](https://github.com/sujal2702/ERP_CRM.git)
* **Postman Collection**: [postman/mini_erp_crm_postman_collection.json](file:///c:/Users/sujal/OneDrive/Desktop/ERP/postman/mini_erp_crm_postman_collection.json)

---

## 2. Technology Stack

### Frontend
* **Core**: React 18, TypeScript, Vite
* **Styling**: Tailwind CSS, OKLCH Color Tokens (Violet Theme), Lucide Icons
* **Routing**: React Router v6 (Protected Routes & SPA Rewrites)
* **State & HTTP**: Context API (`AuthContext`), Axios Interceptors

### Backend
* **Runtime**: Node.js, Express.js (TypeScript)
* **ORM & Database**: Prisma ORM v5, PostgreSQL (Neon Cloud DB)
* **Security & Auth**: JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), CORS
* **Validation**: Zod Schemas

### Infrastructure & Hosting
* **Frontend**: Vercel (Single Page Application Rewrites)
* **Backend**: Render Web Service (Node.js Engine, Host `0.0.0.0`)
* **Database**: Neon Serverless PostgreSQL (`ap-southeast-1` Singapore)

---

## 3. Implemented Features

### 🔐 Authentication & Security
* JWT-based stateful authentication with `localStorage` token persistence.
* Express middleware guards (`authenticateJWT` and `requireRole`).
* Automatic browser refresh session hydration and logout redirection.

### 👥 Customer CRM
* Full customer lifecycle management (Add, Edit, Search, Paginated Listing).
* Detailed customer profile pages displaying wholesale details & GST numbers.
* Follow-up notes audit trail (`CustomerNote` entity linked to timestamp & creator).

### 📦 Product Catalog
* Catalog item registration with unique SKU validation (HTTP 409 Conflict handling).
* Product details editing (Name, SKU, Category, Unit Price, Min Stock, Warehouse Location).
* Ordinary product edits update catalog details **without altering current inventory stock**.

### 📊 Inventory & Stock Movements
* Real-time derived stock status badges:
  * `IN_STOCK`: `currentStock > minimumStock`
  * `LOW_STOCK`: `currentStock > 0` && `currentStock <= minimumStock`
  * `OUT_OF_STOCK`: `currentStock === 0`
* Manual Stock Adjustment modal (IN/OUT movements) guarded against negative stock.
* Complete stock movement audit history table tracking quantity, type, reason, and user.

### 📄 Sales Challans & Atomic Transaction Logic
* Auto-generated human-readable challan numbers (`CH-00001`, `CH-00002`).
* Multi-product line item selector with real-time total quantity calculation.
* **Product Snapshot Storage**: Stores `productNameSnapshot`, `skuSnapshot`, and `unitPriceSnapshot` on `ChallanItem` to preserve historical pricing accuracy.
* **Draft Lifecycle**: Challans are created in `DRAFT` status (**0 stock deduction**).
* **Atomic Database Confirmation**: Confirms challan inside a single **Prisma Database Transaction** (`prisma.$transaction`).
  * Validates stock for **ALL line items**.
  * If ANY product has insufficient stock (`available < requested`), the **entire confirmation rolls back** (0 stock changes, 0 OUT movements written, status remains `DRAFT`, returns HTTP 409 Conflict with exact shortfall quantities).
  * If ALL products have sufficient stock: deducts `Product.currentStock`, writes `StockMovement` (type `OUT`), and sets status to `CONFIRMED`.

---

## 4. Role Permissions Matrix

Backend authorization enforces security on every API endpoint:

| Feature / Action | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
|---|:---:|:---:|:---:|:---:|
| **View Customers & Profile** | ✅ | ✅ | ✅ | ✅ |
| **Create / Edit Customers & Notes** | ✅ | ✅ | ❌ (403) | ❌ (403) |
| **View Products & Inventory** | ✅ | ✅ | ✅ | ✅ |
| **Create / Edit Products** | ✅ | ❌ (403) | ✅ | ❌ (403) |
| **Perform Manual Stock Adjustments** | ✅ | ❌ (403) | ✅ | ❌ (403) |
| **Create & View Sales Challans** | ✅ | ✅ | ✅ (Read) | ✅ (Read) |
| **Confirm / Cancel Sales Challans** | ✅ | ✅ | ❌ (403) | ❌ (403) |

---

## 5. System Architecture

```text
               ┌────────────────────────┐
               │    Browser Client      │
               │  (Vercel SPA Frontend) │
               └───────────┬────────────┘
                           │
                 HTTPS / REST Requests
                 Bearer JWT Authorization
                           │
                           ▼
               ┌────────────────────────┐
               │   Express.js Backend   │
               │  (Render Web Service)  │
               └───────────┬────────────┘
                           │
                 Prisma Database Client
                 (Atomic Transactions)
                           │
                           ▼
               ┌────────────────────────┐
               │ Neon PostgreSQL Cloud  │
               │  (Serverless Database) │
               └────────────────────────┘
```

---

## 6. Database Entity Relationships

The PostgreSQL database contains 7 relational entities:

* **User**: System users (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`).
* **Customer**: Wholesale clients with contact information, GST numbers, and addresses.
* **CustomerNote**: One-to-Many follow-up notes linked to a `Customer` and created by a `User`.
* **Product**: Catalog items with unique `sku`, `unitPrice`, `currentStock`, `minimumStock`, and `warehouseLocation`.
* **StockMovement**: Audit log records (`IN` / `OUT`) linked to a `Product` and `User`.
* **Challan**: Delivery challan header with `challanNumber`, `customerId`, `totalQuantity`, `status` (`DRAFT` / `CONFIRMED` / `CANCELLED`), and `createdById`.
* **ChallanItem**: One-to-Many line items linked to a `Challan` and `Product`, holding historical **snapshot fields** (`productNameSnapshot`, `skuSnapshot`, `unitPriceSnapshot`, `quantity`).

---

## 7. Sales Challan Atomic Transaction Workflow

```text
                  Create Sales Challan
                           │
                           ▼
               Save as DRAFT (Status: DRAFT)
               (Stock is NOT modified)
                           │
                           ▼
                  User Clicks [ Confirm ]
                           │
                           ▼
       ┌───────────────────────────────────────┐
       │   BEGIN Prisma Database Transaction   │
       │   1. Load Challan Items & Products    │
       │   2. Validate Stock for EVERY Item    │
       └───────────────────┬───────────────────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
   [ Stock Sufficient ]          [ Insufficient Stock ]
           │                               │
           ▼                               ▼
1. Deduct Product Stock            1. ROLLBACK Entire Transaction
2. Create StockMovement (OUT)       2. 0 Stock Changes Made
3. Set Status = CONFIRMED          3. 0 OUT Movements Logged
4. COMMIT Transaction              4. Status Remains DRAFT
                                   5. Return HTTP 409 Conflict
```

---

## 8. Seeded Test Credentials

Test user accounts seeded in the database:

| Role | Email | Password | Allowed Scope |
|---|---|---|---|
| **System Admin** | `admin@erp.com` | `Password123!` | Full Access across all modules |
| **Sales Manager** | `sales@erp.com` | `Password123!` | Customer CRM, Sales Challans creation & confirmation |
| **Warehouse Manager**| `warehouse@erp.com` | `Password123!` | Product Catalog management, Stock IN/OUT adjustments |
| **Accounts Viewer** | `accounts@erp.com` | `Password123!` | Read-only business data viewing |

*Note: The frontend login page includes one-click autofill buttons for these credentials.*

---

## 9. API Specifications

### Authentication
* `POST /api/auth/login` — Authenticate credentials and return JWT token.
* `GET /api/auth/me` — Fetch currently authenticated user payload.

### Customer CRM
* `GET /api/customers?page=1&limit=10&search=` — Get paginated customer list.
* `POST /api/customers` — Create a new customer record.
* `GET /api/customers/:id` — Get customer profile details.
* `PUT /api/customers/:id` — Update customer information.
* `GET /api/customers/:id/notes` — Get customer follow-up notes.
* `POST /api/customers/:id/notes` — Add follow-up note.

### Product Management
* `GET /api/products?page=1&limit=10&search=&lowStock=` — Get product catalog.
* `POST /api/products` — Register new product (Unique SKU check).
* `GET /api/products/:id` — Get product details & movement history.
* `PUT /api/products/:id` — Update product catalog details.

### Inventory & Stock Movements
* `GET /api/inventory?page=1&limit=10&lowStock=` — Get inventory status list.
* `GET /api/inventory/movements?page=1&limit=10` — Get audit movement history.
* `POST /api/inventory/adjustments` — Perform manual stock IN / OUT adjustment.

### Sales Challans
* `GET /api/challans?page=1&limit=10&status=` — Get sales challans list.
* `POST /api/challans` — Create sales challan draft.
* `GET /api/challans/:id` — Get challan details with snapshot items.
* `POST /api/challans/:id/confirm` — Execute **Atomic Stock Deduction Transaction**.
* `POST /api/challans/:id/cancel` — Cancel draft challan.

---

## 10. Local Development Setup

### Prerequisites
* Node.js v18+ & npm
* PostgreSQL or Neon database connection string

### 1. Clone Repository
```bash
git clone https://github.com/sujal2702/ERP_CRM.git
cd ERP_CRM
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create environment configuration
cp .env.example .env
# Edit backend/.env with your DATABASE_URL and JWT_SECRET

# Run Prisma migrations & seed database
npx prisma generate
npx prisma migrate dev
npm run db:seed

# Start backend dev server (Port 5000)
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Create environment configuration
cp .env.example .env
# Ensure VITE_API_URL="http://localhost:5000/api"

# Start Vite dev server (Port 5173)
npm run dev
```

---

## 11. Environment Variables Template

### Backend (`backend/.env.example`)
```env
PORT=5000
DATABASE_URL="postgresql://user:password@ep-cool-db.neon.tech/neondb?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key"
CLIENT_URL="http://localhost:5173"
```

### Frontend (`frontend/.env.example`)
```env
VITE_API_URL="http://localhost:5000/api"
```

---

## 12. Project Structure

```text
ERP/
├── backend/
│   ├── prisma/
│   │   ├── migrations/         # Prisma SQL migration history
│   │   ├── schema.prisma       # Database schema models
│   │   └── seed.ts             # Database seeding script
│   ├── src/
│   │   ├── config/             # DB & Environment configuration
│   │   ├── controllers/        # Express route controllers
│   │   ├── middleware/         # Auth JWT & Role middleware
│   │   ├── routes/             # Express API routers
│   │   ├── services/           # Prisma business logic & transactions
│   │   ├── validators/         # Zod input validation schemas
│   │   ├── app.ts              # Express application setup
│   │   └── server.ts           # Server host & port binding
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # AdminLayout, Header, Sidebar
│   │   ├── context/            # AuthContext provider
│   │   ├── pages/              # Dashboard, CRM, Products, Inventory, Challans
│   │   ├── routes/             # ProtectedRoute wrapper
│   │   ├── services/           # Axios API services
│   │   ├── types/              # TypeScript interfaces
│   │   ├── App.tsx             # React Router routing setup
│   │   └── main.tsx            # Application entry point
│   ├── vercel.json             # SPA rewrite configuration
│   └── package.json
├── postman/
│   └── mini_erp_crm_postman_collection.json # Production API collection
└── README.md                   # Project documentation
```

---

## 13. Postman Collection

An exportable Postman collection is included at:
`postman/mini_erp_crm_postman_collection.json`

### How to Import:
1. Open Postman -> Click **Import** -> Select `postman/mini_erp_crm_postman_collection.json`.
2. The collection uses variables:
   * `{{baseUrl}}`: Set to `https://erp-crm-2gdx.onrender.com`
   * `{{token}}`: Populated with Bearer JWT token after executing the **Login** request.

---

## 14. Build & Verification Status

* **Backend Build**: ✅ **PASSED** (`npm run build` in `/backend` completed with 0 errors).
* **Frontend Build**: ✅ **PASSED** (`npm run build` in `/frontend` completed with 0 errors).
* **Git Security Audit**: ✅ **PASSED** (`.env` files ignored; zero real secrets committed).
* **Automated E2E Suite**: ✅ **PASSED** (12/12 integration test scenarios verified).
