-- ==============================================================================
-- StockFlow - Supabase (PostgreSQL) Production Schema
-- Description: Complete Relational Schema for Inventory, Billing, & Live Stock
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. USERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  phone VARCHAR(50) UNIQUE,
  avatar TEXT DEFAULT '',
  auth_methods TEXT[] DEFAULT ARRAY['email']::TEXT[],
  auth_provider_id TEXT,
  is_email_verified BOOLEAN DEFAULT false,
  is_phone_verified BOOLEAN DEFAULT false,
  email_otp_hash VARCHAR(255),
  email_otp_expires TIMESTAMPTZ,
  email_otp_attempts INT DEFAULT 0,
  last_email_otp_sent_at TIMESTAMPTZ,
  otp_hash VARCHAR(255),
  otp_expires TIMESTAMPTZ,
  otp_attempts INT DEFAULT 0,
  last_otp_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- ==============================================================================
-- 2. CATEGORIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT DEFAULT '',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_owner_category_name UNIQUE (owner_id, name)
);

CREATE INDEX IF NOT EXISTS idx_categories_owner ON categories(owner_id);
CREATE INDEX IF NOT EXISTS idx_categories_owner_status ON categories(owner_id, status);

-- ==============================================================================
-- 3. SUPPLIERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  company VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) DEFAULT '',
  address TEXT DEFAULT '',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_owner ON suppliers(owner_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_owner_company ON suppliers(owner_id, company);
CREATE INDEX IF NOT EXISTS idx_suppliers_owner_status ON suppliers(owner_id, status);

-- ==============================================================================
-- 4. PRODUCTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  name VARCHAR(150) NOT NULL,
  sku VARCHAR(50) NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
  quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  min_stock INT NOT NULL DEFAULT 5 CHECK (min_stock >= 0),
  max_stock INT DEFAULT 100 CHECK (max_stock >= 0),
  unit VARCHAR(50) DEFAULT 'pcs',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'discontinued')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_owner_product_sku UNIQUE (owner_id, sku)
);

CREATE INDEX IF NOT EXISTS idx_products_owner ON products(owner_id);
CREATE INDEX IF NOT EXISTS idx_products_owner_category ON products(owner_id, category_id);
CREATE INDEX IF NOT EXISTS idx_products_owner_supplier ON products(owner_id, supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_owner_quantity ON products(owner_id, quantity);
CREATE INDEX IF NOT EXISTS idx_products_owner_status ON products(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_products_owner_name_sku ON products(owner_id, name, sku);

-- ==============================================================================
-- 5. CUSTOMERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  address TEXT DEFAULT '',
  city VARCHAR(100) DEFAULT '',
  state VARCHAR(100) DEFAULT '',
  pincode VARCHAR(20) DEFAULT '',
  total_orders INT DEFAULT 0 CHECK (total_orders >= 0),
  total_spent NUMERIC(12, 2) DEFAULT 0 CHECK (total_spent >= 0),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_owner_customer_phone UNIQUE (owner_id, phone)
);

CREATE INDEX IF NOT EXISTS idx_customers_owner ON customers(owner_id);
CREATE INDEX IF NOT EXISTS idx_customers_owner_phone ON customers(owner_id, phone);

-- ==============================================================================
-- 6. SALES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invoice_number VARCHAR(100) NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_email VARCHAR(255),
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  discount_rate NUMERIC(5, 2) DEFAULT 0 CHECK (discount_rate >= 0 AND discount_rate <= 100),
  discount_amount NUMERIC(12, 2) DEFAULT 0 CHECK (discount_amount >= 0),
  tax_rate NUMERIC(5, 2) DEFAULT 0 CHECK (tax_rate >= 0),
  tax_amount NUMERIC(12, 2) DEFAULT 0 CHECK (tax_amount >= 0),
  grand_total NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (grand_total >= 0),
  payment_method VARCHAR(50) DEFAULT 'CASH',
  payment_status VARCHAR(50) DEFAULT 'PAID',
  sale_status VARCHAR(50) DEFAULT 'COMPLETED',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_owner_invoice_number UNIQUE (owner_id, invoice_number)
);

CREATE INDEX IF NOT EXISTS idx_sales_owner ON sales(owner_id);
CREATE INDEX IF NOT EXISTS idx_sales_owner_created ON sales(owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_owner_customer ON sales(owner_id, customer_id);

-- ==============================================================================
-- 7. SALE ITEMS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  name VARCHAR(150) NOT NULL,
  sku VARCHAR(50) NOT NULL,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  cost_price NUMERIC(12, 2) DEFAULT 0,
  quantity INT NOT NULL CHECK (quantity >= 1),
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items(product_id);

-- ==============================================================================
-- 8. STOCK MOVEMENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('IN', 'OUT', 'RETURN', 'ADJUSTMENT')),
  quantity INT NOT NULL CHECK (quantity >= 1),
  previous_stock INT NOT NULL CHECK (previous_stock >= 0),
  new_stock INT NOT NULL CHECK (new_stock >= 0),
  reason TEXT DEFAULT '',
  reference TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_owner_product ON stock_movements(owner_id, product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_owner_created ON stock_movements(owner_id, created_at DESC);

-- ==============================================================================
-- 9. PURCHASE ORDERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  po_number VARCHAR(100) NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  supplier_name VARCHAR(120) NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ORDERED', 'RECEIVED', 'CANCELLED')),
  notes TEXT DEFAULT '',
  expected_delivery_date TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_owner_po_number UNIQUE (owner_id, po_number)
);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_owner ON purchase_orders(owner_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_owner_created ON purchase_orders(owner_id, created_at DESC);

-- ==============================================================================
-- 10. AUDIT LOGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  module VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  performed_by VARCHAR(100) DEFAULT 'System Admin',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_owner_created ON audit_logs(owner_id, created_at DESC);

-- ==============================================================================
-- AUTO-UPDATE updated_at FUNCTION & TRIGGERS
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated_at') THEN
    CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_categories_updated_at') THEN
    CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_timestamp();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_suppliers_updated_at') THEN
    CREATE TRIGGER trg_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_timestamp();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_products_updated_at') THEN
    CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_timestamp();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_customers_updated_at') THEN
    CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_timestamp();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_sales_updated_at') THEN
    CREATE TRIGGER trg_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_timestamp();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_purchase_orders_updated_at') THEN
    CREATE TRIGGER trg_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_timestamp();
  END IF;
END $$;
