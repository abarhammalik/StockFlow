# StockFlow — Enterprise SaaS Inventory & POS Management System

> **Tagline:** Know your stock. Track your sales. Master your inventory in real time.  
> **Database Stack:** Supabase (PostgreSQL) Cloud Database

---

## 📌 Executive Summary

**StockFlow** is a feature-packed, real-time inventory management and Point-of-Sale (POS) platform designed for modern businesses, retailers, and distributors. 

Beyond core product tracking, StockFlow features dynamic **POS Billing & Receipt Generation**, **Customer Relationship Management**, **Purchase Order Workflows**, **Audit Trail Logging**, **Real-Time WebSocket updates via Socket.IO**, and deep **Supabase & PostgreSQL Analytics**.

---

## 🏗 System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    React + Vite Frontend                    │
│      Dashboard / POS Billing / Products / Categories /      │
│     Suppliers / Customers / Purchase Orders / Audit Logs /  │
│        Stock Ledger / Real-Time Analytics & Socket.IO       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ HTTP REST API & WebSockets (Port 5000)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Node.js + Express Server                  │
│       Controllers / WebSockets / Middleware / Routes        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ @supabase/supabase-js Client
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Supabase (PostgreSQL Cloud)                 │
│                                                             │
│  ┌────────────┐ ┌────────────┐ ┌───────────┐ ┌───────────┐  │
│  │  products  │ │ categories │ │ suppliers │ │ customers │  │
│  └────────────┘ └────────────┘ └───────────┘ └───────────┘  │
│  ┌──────────────────┐ ┌────────────┐ ┌───────────────────┐  │
│  │ stock_movements  │ │   sales    │ │  purchase_orders  │  │
│  └──────────────────┘ └────────────┘ └───────────────────┘  │
│  ┌──────────────────┐ ┌──────────────────────────────────┐  │
│  │    sale_items    │ │            audit_logs            │  │
│  └──────────────────┘ └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ Key Technical Features & Capabilities

### 1. Relational Data Modeling & Integrity
* **Relational Schema:** Foreign key constraints (`products.category_id` → `categories.id`, `products.supplier_id` → `suppliers.id`, `sales.customer_id` → `customers.id`, `sale_items.sale_id` → `sales.id`, `stock_movements.product_id` → `products.id`).
* **Performance Indexing:** Optimized composite indexes on `sku` (unique per owner), `owner_id`, `created_at`, `status`, and category references.

### 2. Real-Time Analytics & KPIs
* **Multi-Metric Dashboard:** Computes total catalog valuation, total products, cost bases, low-stock counts, and out-of-stock items.
* **Category & Sales Valuation:** Joins relational tables to deliver profit margins and real-time revenue analytics.
* **Stock Health & Low-Stock Alerts:** Evaluates dynamic queries where `quantity <= min_stock`.

### 3. POS Billing & Dynamic Stock Deduction
* **Interactive Checkout Terminal:** Supports customer selection, quick item search, discount application, multiple payment methods (Cash, Card, UPI, NetBanking), and printable receipts.
* **Atomic Transactions & Movements:** Automatically logs movements into `stock_movements` and decrements product inventory upon sale completion.

### 4. Real-Time WebSockets & Audit Trail
* **Live Socket.IO Sync:** Instantly broadcasts stock level changes and transactions across connected clients without requiring full-page reloads.
* **Immutable Audit Trail:** Tracks user actions, inventory edits, purchase order status changes, and sales history in `audit_logs`.

---

## 🚀 Quick Start Guide

### Prerequisites
1. **Node.js LTS** (v18 or higher)
2. **Supabase Account & Project** (free from [supabase.com](https://supabase.com))

---

### 🛠 Running the Application

1. **Install Dependencies**:
   ```bash
   npm install
   npm run build
   ```

2. **Configure Supabase in `backend/.env`**:
   ```env
   PORT=5000
   CLIENT_URL=http://localhost:5173
   JWT_SECRET=your_jwt_secret
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

3. **Deploy Schema & Seed**:
   - Paste `backend/db/schema.sql` into the Supabase SQL Editor and click **Run**.
   - Run seed script:
     ```bash
     npm run seed --prefix backend
     ```

4. **Launch Dev Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser. Demo account: `admin@stockflow.dev` / `admin123`.
