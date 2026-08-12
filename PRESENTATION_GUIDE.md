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
                               │  Node.js | Socket.IO Server | Mongoose  │
                               │  Cors | Helmet | Express.json          │
                               └──────────────────┬─────────────────────┘
                                                  │ (Mongoose ODM Driver)
                                                  ▼
                               ┌────────────────────────────────────────┐
                               │            MONGODB DATABASE            │
                               │     Local Instance (Port 27017)        │
                               │    8 Structured Collections & Indexes │
                               └────────────────────────────────────────┘
```

| Layer | Technology | Key Details & Rationale |
| :--- | :--- | :--- |
| **Frontend UI** | **React (Vite)** | Fast HMR (Hot Module Replacement), modular component architecture, smooth client routing. |
| **Styling** | **Tailwind CSS & Vanilla CSS** | Clean glassmorphism cards, responsive dark/light elements, polished micro-animations. |
| **Icons & Charts**| **Lucide React & Recharts** | Modern SVG iconography and responsive revenue/sales data visualization. |
| **Backend API** | **Node.js & Express.js** | Non-blocking, asynchronous I/O ideal for handling concurrent REST requests and Socket events. |
| **Real-time Engine**| **Socket.IO** | Bi-directional, low-latency WebSocket engine for broadcasting live stock movements to all connected browsers. |
| **Database & ODM**| **MongoDB & Mongoose** | NoSQL document-store providing flexible schemas, aggregation pipelines, indexed lookups, and transactional data integrity. |

---

## 3. MongoDB Data Architecture (8 Collections & Schemas)

StockFlow utilizes **8 distinct MongoDB collections**. Every document is auto-assigned a 12-byte BSON `ObjectId` (`_id`) and timestamps (`createdAt`, `updatedAt`).

### Core Collections Overview:

1. **`products` ([Product.js](file:///c:/Users/Abdul%20Arham%20Malik/OneDrive/Desktop/StockFlow/backend/models/Product.js))**
   - **Fields:** `name`, `sku` (Unique Index), `category` (Ref -> `Category`), `supplier` (Ref -> `Supplier`), `costPrice`, `sellingPrice`, `quantity`, `minStockLevel`, `location`, `description`, `status`.
   - **Virtual Fields:** Automatically calculates `margin` and `stockValue` (`quantity * sellingPrice`).
   - **Stock Status Logic:** Computed dynamically as `out_of_stock` (`quantity === 0`), `low_stock` (`quantity <= minStockLevel`), `overstocked` (`quantity > minStockLevel * 3`), or `healthy`.

2. **`sales` ([Sale.js](file:///c:/Users/Abdul%20Arham%20Malik/OneDrive/Desktop/StockFlow/backend/models/Sale.js))**
   - **Fields:** `invoiceNumber` (Unique Index), `customer` (Ref -> `Customer`), `items` (Array of nested objects: `product`, `quantity`, `unitPrice`, `totalPrice`), `subtotal`, `tax`, `discount`, `grandTotal`, `paymentMethod`, `notes`.

3. **`stockmovements` ([StockMovement.js](file:///c:/Users/Abdul%20Arham%20Malik/OneDrive/Desktop/StockFlow/backend/models/StockMovement.js))**
   - **Fields:** `product` (Ref -> `Product`), `type` (`IN`, `OUT`, `ADJUSTMENT`), `quantity`, `previousQuantity`, `newQuantity`, `reason`, `referenceNote`.

4. **`auditlogs` ([AuditLog.js](file:///c:/Users/Abdul%20Arham%20Malik/OneDrive/Desktop/StockFlow/backend/models/AuditLog.js))**
   - **Fields:** `action`, `module`, `description`, `performedBy`, `createdAt`.
   - **Purpose:** Provides an immutable audit trail for compliance and tracking system actions.

5. **`categories` ([Category.js](file:///c:/Users/Abdul%20Arham%20Malik/OneDrive/Desktop/StockFlow/backend/models/Category.js))**: `name`, `description`, `color`.
6. **`suppliers` ([Supplier.js](file:///c:/Users/Abdul%20Arham%20Malik/OneDrive/Desktop/StockFlow/backend/models/Supplier.js))**: `name`, `email`, `phone`, `address`, `contactPerson`.
7. **`customers` ([Customer.js](file:///c:/Users/Abdul%20Arham%20Malik/OneDrive/Desktop/StockFlow/backend/models/Customer.js))**: `name`, `phone` (Unique), `email`, `address`, `totalSpent`.
8. **`purchaseorders` ([PurchaseOrder.js](file:///c:/Users/Abdul%20Arham%20Malik/OneDrive/Desktop/StockFlow/backend/models/PurchaseOrder.js))**: `orderNumber`, `supplier`, `items`, `totalAmount`, `status` (`DRAFT`, `ORDERED`, `RECEIVED`, `CANCELLED`).

---

## 4. Key Real-Time & Business Workflows

### A. Automatic POS Billing & Inventory Deductions
1. User creates a sale in the Billing tab.
2. The backend starts a database flow:
   - Decrements `quantity` in the `Product` collection for every line item.
   - Updates customer's `totalSpent`.
   - Creates a new document in `Sale`.
   - Creates `StockMovement` records (`type: 'OUT'`).
   - Appends an entry in `AuditLog`.
3. **Socket Broadcast**: `req.io.emit('stockUpdate', payload)` fires, instantly updating inventory counters on all connected dashboards without requiring a page refresh!

### B. Live Stock Adjustment / Stock Recount
1. Stock adjustment recorded via `RecordStockModal`.
2. Quantity difference computed (`newQuantity - previousQuantity`).
3. Product stock updated, movement recorded, and Socket broadcast sent to UI.

---

## 5. Currency Localization (INR ₹)

- **Storage Layer**: Raw numerical floats stored in MongoDB (e.g., `1499.00`) to maintain precision and ease mathematical queries/aggregations.
- **Presentation Layer**: Formatted into Indian numbering format using `toLocaleString('en-IN')` and displayed with `₹` across all components and audit trail strings.

---

## 6. Technical Q&A Defense Sheet (Anticipated Judge/Technical Questions)

### Q1: How do you handle database disconnection or connection errors safely?
> **Answer:** Our connection logic in `backend/config/db.js` uses event listeners (`mongoose.connection.on('error' / 'disconnected')`). If MongoDB goes down or disconnects, the Express health endpoint (`/api/health`) catches it safely without crashing the Node process.

### Q2: How are concurrent stock updates handled when multiple cashiers check out at the same time?
> **Answer:** Stock updates use MongoDB atomic update operators like `$inc` (e.g., `$inc: { quantity: -requestedQty }`). This guarantees thread-safe, atomic operations at the database engine level, preventing race conditions or double-deductions.

### Q3: Why MongoDB over a relational SQL database for this project?
> **Answer:** 
> 1. **Embedded Subdocuments:** Sales invoices store item snapshots directly inside the `Sale` document, preserving historical item pricing even if product prices change later in the main catalog.
> 2. **Flexible Schemas:** Easy to extend product attributes (such as locations or barcodes) without expensive database schema migrations.
> 3. **Aggregation Pipelines:** MongoDB's aggregation framework allows computing category valuations, sales analytics, and low-stock filters in single high-performance database queries.

### Q4: How is real-time synchronization implemented?
> **Answer:** We integrated **Socket.IO**. Express middleware attaches `req.io` to incoming HTTP requests. When a controller updates stock or creates a sale, it emits a `stockUpdate` event containing updated product IDs and quantities to all active Socket connections.

### Q5: How is the application deployed?
> **Answer:** 
> - **Development Mode**: `concurrently` executes both the Vite dev server and Node Express API simultaneously (`npm run dev`).
> - **Production Mode**: Running `npm run build` compiles Vite assets into `frontend/dist`. Express's `server.js` serves those static assets and handles single-page app (SPA) fallback routing, allowing single-command monolithic deployment (`npm start`).

---

## 7. Key Features Checklist for Presentation Demo

1. **Dashboard & Analytics**: Live revenue stats, total inventory value, top-selling products chart, and category distribution.
2. **Product Catalog**: Pagination, search, stock status badges (`Low Stock`, `Out of Stock`, `Healthy`), and product details modal.
3. **POS Billing**: Quick search by barcode/name, customer selection/creation, discount & tax calculation, instant receipt modal generation.
4. **Stock Movement Trail**: Record stock adjustments (`IN`, `OUT`, `ADJUSTMENT`) with audit logs.
5. **System Audit Logs**: Immutable operations trail formatted in INR (`₹`).
