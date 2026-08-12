# Inventory Management System — Billing, Sales & Live Stock Update Specification

## 1. Project Goal

Add a complete **Billing / Point-of-Sale (POS)** system to the existing inventory management application.

The system must allow a customer to purchase one or more products, generate a professional bill/invoice containing customer and purchase information, save the sale permanently in MongoDB, and update inventory stock **immediately after a successful purchase**.

The most important requirement is:

> **When a purchase is successfully completed, the stock quantity, inventory statistics, product availability, sales records, dashboard metrics, and related views must update live without requiring a manual page refresh.**

The application should behave like a real retail/inventory management system.

---

# 2. Existing Modules

The application already contains or is expected to contain modules such as:

- Dashboard
- Products
- Categories
- Suppliers
- Inventory
- MongoDB database

The new implementation should add:

- Customers
- Billing / POS
- Cart
- Sales
- Invoices
- Sales History
- Reports
- Live inventory updates
- Notifications/status feedback

---

# 3. High-Level Architecture

```text
                    FRONTEND
                        |
        +---------------+----------------+
        |               |                |
     Products        Billing/POS      Dashboard
        |               |                |
        +---------------+----------------+
                        |
                     REST API
                        |
                    BACKEND
                        |
        +---------------+----------------+
        |               |                |
    Products         Sales           Customers
        |               |                |
        +---------------+----------------+
                        |
                    MongoDB
                        |
              +---------+---------+
              |                   |
          Inventory             Sales
```

For live updates:

```text
MongoDB
   |
Backend
   |
WebSocket / Server-Sent Events
   |
Frontend
   |
+-------------------------------+
| Dashboard                     |
| Product List                  |
| Inventory                     |
| Billing                       |
| Sales History                 |
+-------------------------------+
```

If WebSockets are already available in the project, use them.

If not, implement a simple real-time event mechanism using WebSockets or Server-Sent Events.

Polling can be used as a fallback, but real-time events are preferred.

---

# 4. Complete Customer Purchase Flow

The expected flow is:

```text
1. Staff opens Billing/POS
        ↓
2. Search/select product
        ↓
3. Product availability is checked
        ↓
4. Add product to cart
        ↓
5. Select quantity
        ↓
6. Add more products if required
        ↓
7. Enter/select customer details
        ↓
8. Calculate subtotal
        ↓
9. Apply discount
        ↓
10. Calculate tax/GST if enabled
        ↓
11. Calculate final total
        ↓
12. Select payment method
        ↓
13. Review order
        ↓
14. Confirm Purchase
        ↓
15. Backend validates stock again
        ↓
16. MongoDB transaction starts
        ↓
17. Stock is decreased
        ↓
18. Sale is created
        ↓
19. Customer is created/updated
        ↓
20. Transaction commits
        ↓
21. Real-time inventory event is emitted
        ↓
22. Frontend updates automatically
        ↓
23. Invoice is generated
        ↓
24. User can print/download invoice
```

---

# 5. Billing / POS Page

Create a dedicated `/billing` or `/pos` page.

## Layout

Recommended layout:

```text
+-------------------------------------------------------+
|                    NEW SALE                           |
+-------------------------------------------------------+
| Customer Information                                  |
| Name: [________________]                              |
| Phone: [________________]  Email: [________________] |
+-------------------------------------------------------+
| Search Products                                       |
| [ Search product...                         ]         |
+-------------------------------------------------------+
| Cart                                                  |
| Product | Price | Qty | Discount | Total | Remove    |
|-------------------------------------------------------|
| Laptop  | 50000 |  1  |    0%    | 50000 |   X       |
| Mouse   |  1000 |  2  |    0%    |  2000 |   X       |
+-------------------------------------------------------+
| Subtotal:                         ₹52,000             |
| Discount:                         ₹0                  |
| Tax/GST:                          ₹9,360              |
| Grand Total:                      ₹61,360             |
+-------------------------------------------------------+
| Payment: [UPI ▼]                                     |
|                                                       |
| [ Cancel ]                     [ CONFIRM PURCHASE ]  |
+-------------------------------------------------------+
```

---

# 6. Customer Information

The billing system must support:

### Required

- Customer name
- Phone number

### Optional

- Email
- Address
- City
- State
- Pincode

Example:

```json
{
  "name": "Rahul Sharma",
  "phone": "9876543210",
  "email": "rahul@example.com",
  "address": "Mumbai",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001"
}
```

Before creating a new customer, search by phone number.

If the customer already exists:

```text
Existing customer found
        ↓
Use existing customer
        ↓
Update changed details if necessary
```

If the customer does not exist:

```text
Create new customer
```

---

# 7. Customers Collection

MongoDB collection:

```text
customers
```

Suggested schema:

```json
{
  "_id": "ObjectId",
  "name": "Rahul Sharma",
  "phone": "9876543210",
  "email": "rahul@example.com",
  "address": "Mumbai",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "totalPurchases": 5,
  "totalSpent": 25000,
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

Recommended indexes:

```text
phone
email
```

Phone should preferably be unique if the business rules require one customer per phone number.

---

# 8. Product Selection

The billing page must allow the staff member to:

- Search by product name
- Search by SKU/product ID
- Filter by category
- View price
- View available stock
- Add product to cart
- Increase/decrease quantity
- Remove product

When a product is out of stock:

```text
Stock = 0
```

The product must not be added to the cart.

Display:

```text
OUT OF STOCK
```

If stock is 3, the maximum quantity that can initially be selected should be 3.

However, the backend must perform the final stock check again when the purchase is confirmed.

---

# 9. Cart

The cart should exist in frontend state until the purchase is confirmed.

Example:

```json
{
  "items": [
    {
      "productId": "665abc",
      "productName": "Wireless Mouse",
      "quantity": 2,
      "unitPrice": 800,
      "discount": 0,
      "total": 1600
    },
    {
      "productId": "665def",
      "productName": "Keyboard",
      "quantity": 1,
      "unitPrice": 1500,
      "discount": 100,
      "total": 1400
    }
  ]
}
```

Cart calculations:

```text
Item Total = Unit Price × Quantity

Subtotal = Sum of all Item Totals

Discount = Product discounts + bill discount

Taxable Amount = Subtotal - Discount

Tax = Taxable Amount × Tax Rate

Grand Total = Taxable Amount + Tax
```

All currency calculations should be handled carefully to avoid floating-point errors.

Prefer integer minor units (for example paise) or a decimal-safe approach on the backend.

---

# 10. Pricing

Never trust prices sent from the frontend.

The frontend can send:

```text
productId
quantity
```

The backend must retrieve the current product price from MongoDB.

Example:

```text
Frontend:
productId = ABC123
quantity = 2

Backend:
Find product ABC123
Read current price = ₹500
Calculate:
2 × ₹500 = ₹1000
```

This prevents users from manipulating the price through browser tools.

---

# 11. Tax / GST

The billing system should support configurable tax.

Example:

```text
Subtotal: ₹10,000
Discount: ₹500
Taxable Amount: ₹9,500
GST: 18%
GST Amount: ₹1,710
Grand Total: ₹11,210
```

Tax should be configurable rather than hard-coded.

Suggested configuration:

```json
{
  "taxEnabled": true,
  "taxRate": 18
}
```

If GST-specific requirements are needed later, support:

- CGST
- SGST
- IGST
- GSTIN
- HSN/SAC
- Tax-inclusive/exclusive pricing

Do not assume all businesses use the same tax rules.

---

# 12. Payment Methods

Support:

```text
Cash
UPI
Card
Bank Transfer
Other
```

Suggested payment structure:

```json
{
  "method": "UPI",
  "status": "PAID",
  "amount": 11210,
  "transactionReference": "UPI123456"
}
```

Payment status:

```text
PENDING
PAID
FAILED
REFUNDED
PARTIALLY_REFUNDED
```

A stock deduction should normally occur only after the purchase reaches the appropriate successful payment/order state.

---

# 13. Sales Collection

Create:

```text
sales
```

Suggested document:

```json
{
  "_id": "ObjectId",

  "invoiceNumber": "INV-2026-000001",

  "customer": {
    "customerId": "ObjectId",
    "name": "Rahul Sharma",
    "phone": "9876543210",
    "email": "rahul@example.com"
  },

  "items": [
    {
      "productId": "ObjectId",
      "productName": "Wireless Mouse",
      "sku": "WM-001",
      "quantity": 2,
      "unitPrice": 800,
      "discount": 0,
      "taxRate": 18,
      "taxAmount": 288,
      "total": 1888
    }
  ],

  "subtotal": 1600,
  "discount": 0,
  "tax": 288,
  "grandTotal": 1888,

  "payment": {
    "method": "UPI",
    "status": "PAID",
    "amount": 1888
  },

  "status": "COMPLETED",

  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

# 14. Invoice Number

Every completed sale needs a unique invoice number.

Example:

```text
INV-2026-000001
INV-2026-000002
INV-2026-000003
```

Never generate invoice numbers only on the frontend.

The backend must generate them safely.

The invoice number should have a unique MongoDB index.

---

# 15. Critical Requirement — Live Stock Update

This is the most important feature.

Suppose:

```text
Product:
Laptop

Current Stock:
10
```

Customer purchases:

```text
Quantity:
2
```

After successful purchase:

```text
Stock:
8
```

The following screens should automatically reflect the new value:

```text
Product page
Inventory page
Dashboard
Billing page
Low-stock alerts
Reports
```

The user should NOT have to press:

```text
Refresh
```

---

# 16. Recommended Real-Time Architecture

Use WebSockets.

Example:

```text
Customer completes purchase
             ↓
Backend updates MongoDB
             ↓
Backend commits transaction
             ↓
Backend emits event
             ↓
WebSocket server
             ↓
Connected frontend clients
             ↓
Inventory/Product/Dashboard state updates
```

Example event:

```json
{
  "type": "INVENTORY_UPDATED",
  "productId": "665abc",
  "newStock": 8,
  "quantityChanged": -2,
  "reason": "SALE",
  "saleId": "778xyz"
}
```

Frontend receives:

```text
INVENTORY_UPDATED
```

and updates the product state immediately.

---

# 17. Real-Time Events

Create a consistent event system.

Recommended events:

```text
SALE_CREATED
INVENTORY_UPDATED
PRODUCT_UPDATED
LOW_STOCK_ALERT
CUSTOMER_CREATED
CUSTOMER_UPDATED
PAYMENT_COMPLETED
SALE_CANCELLED
REFUND_COMPLETED
```

Example:

```json
{
  "type": "SALE_CREATED",
  "saleId": "778xyz",
  "invoiceNumber": "INV-2026-000021",
  "grandTotal": 1888,
  "timestamp": "2026-08-12T10:30:00Z"
}
```

---

# 18. Stock Update Must Be Atomic

Do NOT implement:

```text
1. Read stock
2. Calculate new stock in application
3. Save new stock
```

without proper concurrency protection.

Two customers could purchase the same product at nearly the same time.

Example:

```text
Stock = 5

Customer A buys 4
Customer B buys 3
```

Both requests could see:

```text
Stock = 5
```

and incorrectly allow the purchases.

Use an atomic MongoDB update.

Conceptually:

```javascript
db.products.updateOne(
  {
    _id: productId,
    stock: { $gte: quantity }
  },
  {
    $inc: { stock: -quantity }
  }
)
```

Then check whether the update actually modified one document.

If it did not:

```text
Insufficient stock
```

and the purchase must not be completed.

---

# 19. MongoDB Transaction

For a multi-product purchase, use a MongoDB transaction where supported by the deployment configuration.

Transaction:

```text
START TRANSACTION

1. Validate customer
2. Validate every product
3. Validate stock
4. Read authoritative prices
5. Calculate totals
6. Decrease stock
7. Create sale
8. Update customer purchase statistics
9. Commit transaction
```

If any step fails:

```text
ROLLBACK
```

This prevents inconsistent data.

Example failure:

```text
Product A stock updated
Product B has insufficient stock
```

The transaction should roll back Product A's stock change.

---

# 20. Purchase API

Create an endpoint such as:

```text
POST /api/sales
```

Request:

```json
{
  "customer": {
    "name": "Rahul Sharma",
    "phone": "9876543210",
    "email": "rahul@example.com"
  },

  "items": [
    {
      "productId": "665abc",
      "quantity": 2
    }
  ],

  "discount": 0,

  "payment": {
    "method": "UPI"
  }
}
```

The backend should:

```text
Validate request
       ↓
Validate customer
       ↓
Find products
       ↓
Check stock
       ↓
Read prices
       ↓
Calculate totals
       ↓
Create/update customer
       ↓
Decrease stock
       ↓
Create sale
       ↓
Commit transaction
       ↓
Emit real-time events
       ↓
Return invoice
```

---

# 21. Successful API Response

Example:

```json
{
  "success": true,
  "message": "Purchase completed successfully",

  "sale": {
    "id": "778xyz",
    "invoiceNumber": "INV-2026-000021",
    "grandTotal": 1888,
    "status": "COMPLETED"
  },

  "updatedProducts": [
    {
      "productId": "665abc",
      "stock": 8
    }
  ]
}
```

The frontend should immediately update its state using this response and/or the real-time event.

---

# 22. Failed Purchase Responses

Handle cases such as:

### Insufficient stock

```json
{
  "success": false,
  "code": "INSUFFICIENT_STOCK",
  "message": "Only 2 units are available."
}
```

### Product not found

```json
{
  "success": false,
  "code": "PRODUCT_NOT_FOUND",
  "message": "Product no longer exists."
}
```

### Payment failure

```json
{
  "success": false,
  "code": "PAYMENT_FAILED",
  "message": "Payment was not completed."
}
```

### Invalid customer information

```json
{
  "success": false,
  "code": "INVALID_CUSTOMER",
  "message": "Customer phone number is required."
}
```

---

# 23. Sales History Page

Create:

```text
/sales
```

Display:

```text
Invoice Number
Customer
Phone
Date
Number of Items
Total Amount
Payment Method
Status
Actions
```

Example:

```text
INV-2026-000021
Rahul Sharma
9876543210
12 Aug 2026
3 items
₹1,888
UPI
PAID
[View]
```

Actions:

```text
View Invoice
Print
Download PDF
Refund
```

---

# 24. Invoice Details Page

Clicking an invoice should display:

```text
------------------------------------------------
                 STORE NAME
             Store Address
          Phone / Email / GSTIN
------------------------------------------------

Invoice: INV-2026-000021
Date: 12 Aug 2026

Customer:
Rahul Sharma
9876543210
rahul@example.com

------------------------------------------------
Product        Qty    Price      Total
------------------------------------------------
Mouse           2     ₹800       ₹1600
------------------------------------------------

Subtotal:                 ₹1600
Discount:                 ₹0
GST:                      ₹288
Grand Total:              ₹1888

Payment Method: UPI
Payment Status: PAID

          Thank you for your purchase
------------------------------------------------
```

---

# 25. PDF Invoice

The application should provide:

```text
Print Invoice
Download Invoice PDF
```

The PDF should contain:

- Store name
- Store logo
- Store address
- Store contact
- Invoice number
- Date/time
- Customer name
- Customer phone
- Customer email
- Product names
- SKU
- Quantity
- Unit price
- Discount
- Tax
- Subtotal
- Grand total
- Payment method
- Payment status

Do not generate an invoice that exists only in frontend memory. It should be generated from the saved sale data.

---

# 26. Inventory Page

The inventory table should display:

```text
Product
SKU
Category
Supplier
Price
Stock
Stock Status
```

Stock status:

```text
IN STOCK
LOW STOCK
OUT OF STOCK
```

Example:

```text
Laptop
SKU: LAP-001
Stock: 8
Status: IN STOCK
```

After purchase:

```text
Stock: 6
```

should appear automatically.

---

# 27. Low Stock Logic

Create configurable thresholds.

Example:

```json
{
  "lowStockThreshold": 5
}
```

If:

```text
stock > 5
```

then:

```text
IN STOCK
```

If:

```text
0 < stock <= 5
```

then:

```text
LOW STOCK
```

If:

```text
stock = 0
```

then:

```text
OUT OF STOCK
```

When a sale causes stock to cross into low-stock territory, emit:

```text
LOW_STOCK_ALERT
```

---

# 28. Dashboard Updates

The dashboard should show real-time values such as:

```text
Today's Sales
Total Revenue
Total Orders
Total Products
Low Stock Products
Out-of-Stock Products
```

Example:

Before purchase:

```text
Today's Sales: ₹20,000
Orders: 15
```

Customer purchases ₹2,000:

```text
Today's Sales: ₹22,000
Orders: 16
```

These values should update automatically.

---

# 29. Recent Sales Widget

Dashboard should contain:

```text
Recent Sales

INV-000021  Rahul Sharma  ₹1,888  UPI
INV-000020  Aisha Khan    ₹850    Cash
INV-000019  Ahmed Ali     ₹2,500  Card
```

When a new sale is completed, it should appear automatically.

---

# 30. Product Availability in Billing

If another user purchases the last available item, the billing interface should receive:

```text
INVENTORY_UPDATED
```

and update the available quantity.

Example:

```text
Before:
Wireless Mouse
Stock: 1

Another cashier purchases it.

After real-time event:
Wireless Mouse
Stock: 0
OUT OF STOCK
```

If it is already in the current cart, the system should warn the cashier before completing the purchase.

The backend must remain the final authority.

---

# 31. Prevent Overselling

The backend must never rely only on frontend stock.

Example:

```text
Frontend says:
Stock = 5

Actual MongoDB stock:
Stock = 2
```

Customer attempts to purchase:

```text
Quantity = 5
```

Backend must reject it.

This is mandatory for correctness.

---

# 32. Refund / Cancellation

The system should be designed to support refunds later.

Example:

```text
Sale:
2 products sold

Refund:
1 product returned

Stock:
8 → 9
```

Refund process:

```text
Select Sale
      ↓
Select product
      ↓
Select refund quantity
      ↓
Confirm refund
      ↓
Increase stock
      ↓
Update sale
      ↓
Create refund record
      ↓
Emit INVENTORY_UPDATED
```

Do not simply delete the original sale.

Keep an audit trail.

---

# 33. Sale Status

Use:

```text
PENDING
COMPLETED
CANCELLED
PARTIALLY_REFUNDED
REFUNDED
```

---

# 34. Audit Trail

For important inventory operations, maintain an inventory movement history.

Create:

```text
inventory_movements
```

Example:

```json
{
  "_id": "ObjectId",
  "productId": "ObjectId",
  "type": "SALE",
  "quantity": -2,
  "previousStock": 10,
  "newStock": 8,
  "referenceId": "saleId",
  "referenceType": "SALE",
  "createdAt": "Date",
  "createdBy": "userId"
}
```

Other movement types:

```text
PURCHASE
SALE
RETURN
ADJUSTMENT
DAMAGE
INITIAL_STOCK
```

This makes inventory changes traceable.

---

# 35. Database Collections

Final recommended structure:

```text
MongoDB
│
├── products
│
├── categories
│
├── suppliers
│
├── customers
│
├── sales
│
├── inventory_movements
│
├── users
│
└── settings
```

Optional:

```text
payments
refunds
notifications
audit_logs
```

---

# 36. Relationships

Conceptually:

```text
Category
   |
   +---- Products
             |
             +---- Supplier
             |
             +---- Inventory Movements
             |
             +---- Sale Items
                              |
                              +---- Sale
                                      |
                                      +---- Customer
```

MongoDB does not require traditional SQL foreign keys, but IDs should be stored consistently.

---

# 37. Backend Routes

Suggested API structure:

## Products

```text
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

## Categories

```text
GET    /api/categories
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id
```

## Suppliers

```text
GET    /api/suppliers
POST   /api/suppliers
PUT    /api/suppliers/:id
DELETE /api/suppliers/:id
```

## Customers

```text
GET    /api/customers
GET    /api/customers/:id
GET    /api/customers/search
POST   /api/customers
PUT    /api/customers/:id
```

## Sales

```text
GET    /api/sales
GET    /api/sales/:id
POST   /api/sales
POST   /api/sales/:id/cancel
```

## Refunds

```text
POST   /api/sales/:id/refund
```

## Inventory

```text
GET    /api/inventory
GET    /api/inventory/movements
```

## Dashboard

```text
GET    /api/dashboard/stats
GET    /api/dashboard/recent-sales
```

---

# 38. Frontend State Management

The frontend should maintain a central inventory/product state.

Possible approaches:

```text
React Context
Zustand
Redux Toolkit
```

If the project is small, React Context or Zustand is sufficient.

When an event arrives:

```text
INVENTORY_UPDATED
```

update the corresponding product in the global state.

Example:

```javascript
{
  productId: "ABC123",
  stock: 8
}
```

Then every component using that product receives the new stock automatically.

---

# 39. Real-Time Connection

When the application starts:

```text
Frontend
   ↓
Connect WebSocket
   ↓
Authenticate user if required
   ↓
Subscribe to inventory/sales events
```

When a sale completes:

```text
Backend
   ↓
broadcast:
INVENTORY_UPDATED
SALE_CREATED
DASHBOARD_UPDATED
```

Frontend:

```text
Receive event
      ↓
Update global state
      ↓
React components re-render
      ↓
New stock displayed
```

---

# 40. Reconnection

WebSocket connections can fail.

Implement:

```text
Connection lost
      ↓
Wait
      ↓
Reconnect
      ↓
Resubscribe
```

Use exponential backoff rather than continuously reconnecting in a tight loop.

When reconnecting, optionally refetch current inventory to ensure the frontend has not missed events.

---

# 41. Data Consistency Strategy

The backend/database is the source of truth.

Priority:

```text
MongoDB
   ↓
Backend
   ↓
Real-time event
   ↓
Frontend
```

Never make the frontend the source of truth for stock.

The frontend displays stock.

The backend controls stock.

MongoDB stores stock.

---

# 42. Error Handling

Every important operation should provide clear feedback.

Examples:

```text
Purchase successful
Invoice generated
Stock updated
```

Errors:

```text
Insufficient stock
Product no longer available
Payment failed
Customer information invalid
Unable to generate invoice
Server error
Connection lost
```

Do not expose raw MongoDB errors to users.

Log detailed errors on the backend.

---

# 43. Loading States

The Confirm Purchase button should show:

```text
Processing Purchase...
```

and become disabled while the request is being processed.

This prevents double-clicking from creating duplicate sales.

Example:

```text
[ Confirm Purchase ]
```

becomes:

```text
[ Processing... ]
```

After success:

```text
[ Purchase Successful ]
```

---

# 44. Duplicate Purchase Protection

The frontend must prevent accidental duplicate submissions.

The backend should also support an idempotency mechanism for critical purchase requests.

Example:

```text
idempotencyKey
```

If the same purchase request is submitted twice because of a network retry, the backend should avoid creating two sales.

---

# 45. Security

Never trust:

```text
price
stock
discount
tax
grandTotal
customerId
```

sent by the frontend.

The backend must validate/recalculate important values.

Also:

- Validate MongoDB ObjectIds
- Sanitize input
- Validate phone numbers
- Validate email format
- Restrict discount permissions if needed
- Authenticate staff users
- Authorize admin-only operations
- Rate-limit sensitive endpoints
- Never expose MongoDB credentials to frontend
- Store MongoDB URI in environment variables

Example:

```text
MONGODB_URI=mongodb://127.0.0.1:27017/your_database
```

For production, use a secure secret-management approach.

---

# 46. Recommended Folder Structure

For a React + Node/Express application:

```text
project/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── billing/
│   │   │   ├── products/
│   │   │   ├── customers/
│   │   │   └── dashboard/
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Billing.jsx
│   │   │   ├── Sales.jsx
│   │   │   ├── Invoice.jsx
│   │   │   └── Inventory.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── websocket.js
│   │   │
│   │   ├── store/
│   │   │   └── inventoryStore.js
│   │   │
│   │   └── App.jsx
│
└── server/
    ├── models/
    │   ├── Product.js
    │   ├── Category.js
    │   ├── Supplier.js
    │   ├── Customer.js
    │   ├── Sale.js
    │   └── InventoryMovement.js
    │
    ├── routes/
    │   ├── productRoutes.js
    │   ├── customerRoutes.js
    │   ├── saleRoutes.js
    │   └── inventoryRoutes.js
    │
    ├── controllers/
    │   ├── saleController.js
    │   └── inventoryController.js
    │
    ├── services/
    │   ├── saleService.js
    │   ├── inventoryService.js
    │   └── invoiceService.js
    │
    ├── websocket/
    │   └── events.js
    │
    ├── middleware/
    │
    └── server.js
```

Adapt this structure to the project's existing architecture instead of unnecessarily rewriting the entire project.

---

# 47. Important Implementation Principle

Do not duplicate existing functionality.

Before implementing:

```text
Products
Categories
Suppliers
Inventory
```

inspect the existing project and reuse:

- Existing product models
- Existing category models
- Existing supplier models
- Existing API routes
- Existing authentication
- Existing UI components
- Existing database connection
- Existing styling/design system

Only add what is missing.

---

# 48. Example Complete Purchase

Initial database:

```text
Product:
Wireless Mouse

Price:
₹800

Stock:
10
```

Customer:

```text
Name:
Rahul Sharma

Phone:
9876543210

Email:
rahul@example.com
```

Customer purchases:

```text
Quantity:
2
```

Calculation:

```text
₹800 × 2 = ₹1,600

Discount = ₹0

GST 18% = ₹288

Grand Total = ₹1,888
```

After confirmation:

```text
Product stock:
10 → 8
```

Sale:

```text
INV-2026-000021
Customer: Rahul Sharma
Items: 2 Wireless Mouse
Total: ₹1,888
Payment: UPI
Status: COMPLETED
```

Inventory movement:

```text
Previous stock: 10
Change: -2
New stock: 8
Reason: SALE
```

Dashboard:

```text
Today's Sales:
+₹1,888

Orders:
+1
```

All connected screens receive the update automatically.

---

# 49. Edge Cases

The implementation must handle:

### Product deleted while billing

```text
Reject purchase
```

### Product price changed while billing

```text
Use current backend price
```

### Stock changed while billing

```text
Recheck stock during checkout
```

### Customer buys more than available stock

```text
Reject purchase
```

### Two customers buy simultaneously

```text
Atomic stock update / transaction
```

### Payment fails

```text
Do not complete sale
```

### User clicks Confirm twice

```text
Prevent duplicate sale
```

### WebSocket disconnects

```text
Reconnect + resync inventory
```

### Browser refreshes after purchase

```text
Data should still be correct because MongoDB is authoritative
```

---

# 50. Testing Requirements

## Billing Tests

Test:

```text
1 product purchase
Multiple product purchase
Multiple quantities
Zero quantity
Negative quantity
Out-of-stock product
Insufficient stock
Customer creation
Existing customer
Discount
Tax
Different payment methods
```

## Inventory Tests

Test:

```text
Stock decreases after sale
Stock never becomes negative
Stock updates atomically
Refund increases stock
Cancelled sale does not incorrectly reduce stock
```

## Real-Time Tests

Open two browser windows.

### Window A

Inventory page:

```text
Laptop Stock: 10
```

### Window B

Billing page:

Purchase:

```text
Laptop × 2
```

After successful purchase, Window A should automatically show:

```text
Laptop Stock: 8
```

without refreshing.

This is a mandatory acceptance test.

---

# 51. Multi-User Real-Time Test

Use:

```text
Browser A → Admin Dashboard
Browser B → Billing
Browser C → Inventory
```

Complete a purchase from Browser B.

Expected:

```text
Browser A:
Revenue updates
Orders update
Recent sale appears

Browser C:
Stock decreases

Browser B:
Invoice appears
Cart clears
Purchase success shown
```

No manual refresh should be required.

---

# 52. Acceptance Criteria

The feature is considered complete only when all of the following work:

- [ ] Customer can be created
- [ ] Existing customer can be searched
- [ ] Product can be searched
- [ ] Product can be added to cart
- [ ] Quantity can be changed
- [ ] Out-of-stock products cannot be purchased
- [ ] Backend rechecks stock
- [ ] Backend uses authoritative product prices
- [ ] Discount calculation works
- [ ] Tax calculation works
- [ ] Grand total is correct
- [ ] Payment method can be selected
- [ ] Purchase can be confirmed
- [ ] Sale is stored in MongoDB
- [ ] Customer is stored/updated
- [ ] Stock decreases correctly
- [ ] Inventory movement is recorded
- [ ] Invoice number is generated
- [ ] Invoice can be viewed
- [ ] Invoice can be printed
- [ ] Invoice can be downloaded as PDF
- [ ] Sales history works
- [ ] Dashboard sales statistics update
- [ ] Low-stock status updates
- [ ] Real-time inventory event works
- [ ] Multiple browser windows receive updates
- [ ] Duplicate purchase is prevented
- [ ] Failed transactions do not corrupt inventory
- [ ] Refund architecture is supported
- [ ] Error messages are user-friendly
- [ ] Backend remains the source of truth

---

# 53. Recommended Development Order

Implement in this order:

```text
Phase 1
Database Models
    ↓
Customer
Sale
Inventory Movement
Settings

Phase 2
Backend
    ↓
Customer APIs
Sales API
Inventory update logic
Transaction handling

Phase 3
Billing UI
    ↓
Product search
Cart
Customer form
Totals
Payment

Phase 4
Invoice
    ↓
Invoice view
PDF
Print

Phase 5
Sales History
    ↓
List
Filters
Details

Phase 6
Real-Time
    ↓
WebSocket
Inventory events
Dashboard events
Frontend state synchronization

Phase 7
Testing
    ↓
Concurrency
Insufficient stock
Duplicate requests
Multiple browser windows
Refunds
```

---

# 54. Final Data Flow

The final system should follow this architecture:

```text
                 CUSTOMER
                    |
                    v
              BILLING / POS
                    |
                    v
                 CART
                    |
                    v
              CONFIRM SALE
                    |
                    v
                 BACKEND
                    |
          +---------+---------+
          |                   |
      Validate             Validate
      Customer               Stock
          |                   |
          +---------+---------+
                    |
                    v
             MongoDB Transaction
                    |
        +-----------+-----------+
        |           |           |
        v           v           v
     Sale       Inventory    Customer
     Record      Update       Update
        |           |
        |           v
        |      Inventory
        |      Movement
        |
        v
      COMMIT
        |
        +------------------+
        |                  |
        v                  v
    Invoice          Real-Time Event
                           |
                           v
                    WebSocket/SSE
                           |
             +-------------+-------------+
             |             |             |
             v             v             v
         Dashboard     Inventory      Products
             |             |             |
             +-------------+-------------+
                           |
                           v
                   LIVE UPDATED UI
```

---

# 55. Core Rule

The entire billing system should follow one fundamental rule:

> **A purchase is not considered successful until the backend has successfully validated the purchase, updated inventory, saved the sale, and committed the database transaction.**

Only after that should the system:

```text
Show purchase success
Generate/display invoice
Clear cart
Update dashboard
Broadcast inventory changes
```

This prevents incorrect stock, missing invoices, duplicate sales, and inconsistent dashboard information.

---

# 56. Expected End Result

The final application should function as:

```text
                 INVENTORY MANAGEMENT
                         +
                    CUSTOMER CRM
                         +
                     BILLING/POS
                         +
                    SALES SYSTEM
                         +
                    INVOICE SYSTEM
                         +
                 REAL-TIME INVENTORY
```

A customer purchase should flow through the complete system automatically:

```text
Purchase
   ↓
Payment
   ↓
Sale saved
   ↓
Stock reduced
   ↓
Inventory movement recorded
   ↓
Customer purchase history updated
   ↓
Invoice generated
   ↓
Dashboard revenue updated
   ↓
Low-stock status recalculated
   ↓
Real-time event broadcast
   ↓
All connected screens update
```

**No manual refresh should be required for live inventory and dashboard updates.**
