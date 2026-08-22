# StockFlow — Comprehensive Master Presentation & Technical Guide

---

## 1. High-Level Elevator Pitch & Overview
**StockFlow** is a real-time, full-stack inventory, billing, and sales analytics platform tailored for retail and warehouse management. Built for speed, operational reliability, and real-time visibility, StockFlow eliminates inventory discrepancies using live WebSocket updates, immutable audit trails, dynamic multi-metric analytics, and localized currency support (INR ₹).

---

## 2. Technical Stack Architecture

```
                               ┌────────────────────────────────────────┐
                               │             REACT FRONTEND             │
                               │  Vite | Tailwind CSS | Lucide Icons    │
                               │  Axios | Recharts | Socket.IO Client   │
                               └──────────────────┬─────────────────────┘
                                                  │ (HTTP REST / WebSocket)
                                                  ▼
                               ┌────────────────────────────────────────┐
                               │           EXPRESS BACKEND              │
                               │  Node.js | Socket.IO Server | Express  │
                               │  Cors | Helmet | Express.json          │
                               └──────────────────┬─────────────────────┘
                                                  │ (@supabase/supabase-js)
                                                  ▼
                               ┌────────────────────────────────────────┐
                               │       SUPABASE POSTGRESQL CLOUD        │
                               │    10 Relational Tables & Triggers    │
                               │    Foreign Keys, Cascades & Indexes    │
                               └────────────────────────────────────────┘
```

| Layer | Technology | Key Details & Rationale |
| :--- | :--- | :--- |
| **Frontend UI** | **React (Vite)** | Fast HMR (Hot Module Replacement), modular component architecture, smooth client routing. |
| **Styling** | **Tailwind CSS & Vanilla CSS** | Clean glassmorphism cards, responsive dark/light elements, polished micro-animations. |
| **Icons & Charts**| **Lucide React & Recharts** | Modern SVG iconography and responsive revenue/sales data visualization. |
| **Backend API** | **Node.js & Express.js** | Non-blocking, asynchronous I/O ideal for handling concurrent REST requests and Socket events. |
| **Real-time Engine**| **Socket.IO** | Bi-directional, low-latency WebSocket engine for broadcasting live stock movements to all connected browsers. |
| **Database & ORM**| **Supabase (PostgreSQL)** | Relational cloud database providing strict foreign-key integrity, ACID transactions, and sub-millisecond query execution. |

---

## 3. Relational Database Architecture (10 Tables)

StockFlow utilizes **10 relational tables** inside PostgreSQL. Every row has a UUID `id` primary key and automated `created_at` / `updated_at` timestamps.

### Core Tables Overview:

1. **`users`**
   - **Columns:** `id` (UUID, PK), `name`, `email` (Unique), `password_hash`, `phone`, `role`, `avatar`, `is_email_verified`, `is_phone_verified`, `auth_methods`.

2. **`categories`**
   - **Columns:** `id` (UUID, PK), `owner_id` (FK -> `users.id`), `name`, `description`, `color`.

3. **`suppliers`**
   - **Columns:** `id` (UUID, PK), `owner_id` (FK -> `users.id`), `name`, `company`, `email`, `phone`, `address`.

4. **`products`**
   - **Columns:** `id` (UUID, PK), `owner_id` (FK -> `users.id`), `name`, `sku` (Unique per owner), `category_id` (FK -> `categories.id`), `supplier_id` (FK -> `suppliers.id`), `price`, `cost_price`, `quantity`, `min_stock`, `max_stock`, `unit`, `location`, `description`, `status`.
   - **Stock Status Logic:** Computed dynamically as `out_of_stock` (`quantity === 0`), `low_stock` (`quantity <= min_stock`), `overstocked` (`quantity > max_stock`), or `healthy`.

5. **`customers`**
   - **Columns:** `id` (UUID, PK), `owner_id` (FK -> `users.id`), `name`, `phone`, `email`, `address`, `total_purchases`.

6. **`sales`**
   - **Columns:** `id` (UUID, PK), `owner_id` (FK -> `users.id`), `invoice_number` (Unique per owner), `customer_id` (FK -> `customers.id`), `customer_name`, `customer_phone`, `customer_email`, `subtotal`, `discount_rate`, `discount_amount`, `tax_rate`, `tax_amount`, `grand_total`, `payment_method`, `payment_status`, `notes`.

7. **`sale_items`**
   - **Columns:** `id` (UUID, PK), `sale_id` (FK -> `sales.id` ON DELETE CASCADE), `product_id` (FK -> `products.id`), `name`, `sku`, `quantity`, `price`, `cost_price`, `subtotal`.

8. **`stock_movements`**
   - **Columns:** `id` (UUID, PK), `owner_id` (FK -> `users.id`), `product_id` (FK -> `products.id`), `type` (`IN`, `OUT`, `RETURN`, `ADJUSTMENT`), `quantity`, `previous_quantity`, `new_quantity`, `reason`, `reference_id`, `reference_type`.

9. **`purchase_orders`**
   - **Columns:** `id` (UUID, PK), `owner_id` (FK -> `users.id`), `po_number`, `supplier_id` (FK -> `suppliers.id`), `status` (`DRAFT`, `ORDERED`, `RECEIVED`, `CANCELLED`), `total_amount`, `expected_delivery_date`, `notes`.

10. **`audit_logs`**
    - **Columns:** `id` (UUID, PK), `owner_id` (FK -> `users.id`), `action`, `resource`, `resource_id`, `details`, `ip_address`, `user_agent`.

---

## 4. Key Workflows & Real-Time Sync

1. **POS Billing Checkout:**
   - Cashier selects customer and adds items to cart.
   - On checkout, the backend runs an atomic transaction: creates `sales` record, inserts individual `sale_items`, updates `products.quantity`, records `stock_movements`, and logs to `audit_logs`.
   - Emits `SALE_CREATED` and `STOCK_UPDATED` WebSocket events to update all connected dashboards in real time.

2. **Supplier Purchase Order Intake:**
   - When a purchase order is marked as `RECEIVED`, inventory stock is automatically incremented in `products`, and an `IN` movement entry is logged in the immutable stock movement ledger.
