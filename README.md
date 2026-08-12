# StockFlow — Enterprise SaaS Inventory & POS Management System

> **Tagline:** Know your stock. Track your sales. Master your inventory in real time.  
> **MongoDB Hackathon Challenge:** Mini Inventory & POS System (Advanced Real-Time Implementation)

---

## 📌 Executive Summary

**StockFlow** is a feature-packed, real-time inventory management and Point-of-Sale (POS) platform designed for modern businesses, retailers, and distributors. 

Beyond core product tracking, StockFlow features dynamic **POS Billing & Receipt Generation**, **Customer Relationship Management**, **Purchase Order Workflows**, **Audit Trail Logging**, **Real-Time WebSocket updates via Socket.IO**, and deep **MongoDB Aggregation Analytics**.

---

## 🏗 System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    React + Vite Frontend                    │
│      Dashboard / POS Billing / Products / Categories /      │
│     Suppliers / Customers / Purchase Orders / Audit Logs /  │
│        Stock Ledger / Aggregation Analytics & Socket.IO     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ HTTP REST API & WebSockets (Port 5000)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Node.js + Express Server                  │
│       Controllers / WebSockets / Middleware / Routes        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ Mongoose ODM
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             MongoDB Community Server (Local)                │
│       URI: mongodb://127.0.0.1:27017/stockflow              │
│                                                             │
│  ┌────────────┐ ┌────────────┐ ┌───────────┐ ┌───────────┐  │
│  │  products  │ │ categories │ │ suppliers │ │ customers │  │
│  └────────────┘ └────────────┘ └───────────┘ └───────────┘  │
│  ┌──────────────────┐ ┌────────────┐ ┌───────────────────┐  │
│  │ stock_movements  │ │   sales    │ │  purchase_orders  │  │
│  └──────────────────┘ └────────────┘ └───────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                      audit_logs                       │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     MongoDB Compass                         │
│   Visual GUI for DB verification, schema inspection,        │
│   index optimization, and native aggregation pipelines     │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ Key Technical Features & Capabilities

### 1. Data Modeling & Normalization
* **Normalized Data Schema:** Utilizes native `ObjectId` references (`products.categoryId` → `categories._id`, `products.supplierId` → `suppliers._id`, `sales.customerId` → `customers._id`, `stock_movements.productId` → `products._id`).
* **Performance Indexing:** Optimized MongoDB indexes on `sku` (unique), `categoryId`, `supplierId`, `status`, `createdAt`, plus compound & text indexes for rapid search.

### 2. Native MongoDB Aggregation Pipelines
* **`$facet` Multi-Metric Dashboard:** Computes total catalog valuation, total products, cost bases, low-stock counts, and out-of-stock items in a single non-blocking DB pipeline.
* **Category & Sales Valuation:** Natively joins `$lookup`, `$unwind`, and `$group` stages to deliver profit margins and real-time revenue analytics.
* **Stock Health & Low-Stock Alerts:** Evaluates dynamic `$expr` queries where `quantity <= minStock`.

### 3. POS Billing & Dynamic Stock Deduction
* **Interactive Checkout Terminal:** Supports customer selection, quick item search, discount application, multiple payment methods (Cash, Card, UPI, NetBanking), and printable receipts.
* **Atomic Transactions & Movements:** Automatically logs `OUT` movements into `stock_movements` and decrements product inventory upon sale completion.

### 4. Real-Time WebSockets & Audit Trail
* **Live Socket.IO Sync:** Instantly broadcasts stock level changes and transactions across connected clients without requiring full-page reloads.
* **Immutable Audit Trail:** Tracks user actions, inventory edits, purchase order status changes, and sales history in `audit_logs`.

---

## 🚀 Quick Start Guide

### Prerequisites
1. **Node.js LTS** (v18 or higher)
2. **MongoDB Community Server** running locally on port `27017`
3. **MongoDB Compass** installed

---

### 🛠 Running the Application

You can launch the backend server and frontend client from the root directory:

#### 1. Start Backend API & WebSocket Server
```bash
npm run backend
```
*Runs Express & Socket.IO server on `http://localhost:5000`.*

#### 2. Start Vite Frontend Client (in a second terminal)
```bash
npm run frontend
# or
npm run dev
```
*Runs Vite React application on `http://localhost:5173`.*

---

### 📦 Seeding & Demo Data Reset

To reset or populate your database with seed data (Categories, Suppliers, Products, Stock Movements):

```bash
npm run seed
```

*Seeds data into `mongodb://127.0.0.1:27017/stockflow`.*  
*(Note: You can also reset seed data directly from the app UI via the **Settings / Reset Demo** page).*

---

## 📡 API Reference Overview

| Module | Endpoint | Description |
| :--- | :--- | :--- |
| **Health** | `GET /api/health` | Database connection & server status check |
| **Products** | `GET /api/products` | Paginated product list with search & filter |
| **Categories** | `GET /api/categories` | Manage product categories |
| **Suppliers** | `GET /api/suppliers` | Manage supplier directory |
| **Stock Movements** | `GET /api/stock-movements` | View immutable stock movement ledger |
| **Customers** | `GET /api/customers` | Customer management & order history |
| **Sales (POS)** | `POST /api/sales` | Create POS sale & auto-deduct stock |
| **Purchase Orders**| `GET /api/purchase-orders` | Manage PO workflows & receiving |
| **Analytics** | `GET /api/analytics/dashboard` | Native MongoDB aggregated metrics |
| **Audit Logs** | `GET /api/audit-logs` | Real-time system event & change logs |

---

## 🔍 MongoDB Compass Verification Steps

1. Open **MongoDB Compass**.
2. Connect to `mongodb://127.0.0.1:27017`.
3. Select the **`stockflow`** database in the left sidebar.
4. Verify the 8 core collections:
   - `products`
   - `categories`
   - `suppliers`
   - `customers`
   - `stock_movements`
   - `sales`
   - `purchase_orders`
   - `audit_logs`
5. Inspect document normalization, indexed fields, and native `$lookup` aggregation pipelines under the **Aggregations** tab.

---

## 📜 Definition of Done

StockFlow is fully verified:
- Local MongoDB Community Server connected on port `27017`
- All 8 collections seeded and accessible via MongoDB Compass
- Real-time stock movement ledger & POS Billing workflow functioning end-to-end
- Native MongoDB aggregation pipelines serving live analytical dashboards
- WebSockets syncing live inventory state across client sessions

