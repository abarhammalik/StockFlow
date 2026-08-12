import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Categories from './pages/Categories';
import Suppliers from './pages/Suppliers';
import StockMovements from './pages/StockMovements';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Billing from './pages/Billing';
import SalesHistory from './pages/SalesHistory';
import Customers from './pages/Customers';
import SalesAnalytics from './pages/SalesAnalytics';
import PurchaseOrders from './pages/PurchaseOrders';
import AuditLogs from './pages/AuditLogs';
import ProductModal from './components/products/ProductModal';
import RecordStockModal from './components/stock/RecordStockModal';
import ToastContainer from './components/ui/ToastContainer';
import GlobalSearchModal from './components/layout/GlobalSearchModal';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global Action Modals
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isRecordStockOpen, setIsRecordStockOpen] = useState(false);
  const [selectedStockProduct, setSelectedStockProduct] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return { title: 'Inventory Dashboard', subtitle: 'Real-time overview of inventory value, stock levels, and movements' };
      case '/billing':
        return { title: 'Point of Sale & Billing (POS)', subtitle: 'Create customer bills, generate invoices, and deduct stock live' };
      case '/sales':
        return { title: 'Sales & Invoices History', subtitle: 'Complete transaction history and printable customer receipts' };
      case '/sales-analytics':
        return { title: 'Sales Analytics & Revenue Reports', subtitle: 'Server-side aggregated revenue metrics and P&L breakdown' };
      case '/customers':
        return { title: 'Customers Directory', subtitle: 'Customer database with purchase history and spending metrics' };
      case '/products':
        return { title: 'Product Inventory Catalog', subtitle: 'Search, filter, and manage SKU items' };
      case '/categories':
        return { title: 'Categories & Aggregations', subtitle: 'Organize stock categories and aggregated catalog valuation' };
      case '/suppliers':
        return { title: 'Suppliers Directory', subtitle: 'Vendor contacts and inventory portfolio breakdown' };
      case '/purchase-orders':
        return { title: 'Supplier Purchase Orders (PO)', subtitle: 'Manage POs and auto-restock inventory upon receipt' };
      case '/stock-movements':
        return { title: 'Stock Movement Ledger', subtitle: 'Immutable transaction ledger of receipts, dispatches, and sales' };
      case '/analytics':
        return { title: 'MongoDB Aggregation Showcase', subtitle: 'Server-side aggregation pipelines and query operators' };
      case '/audit-logs':
        return { title: 'System Activity Logs', subtitle: 'Immutable trail of system operations and sales' };
      case '/settings':
        return { title: 'Database Settings & Demo Tools', subtitle: 'Local MongoDB status and 1-Click demo dataset tools' };
      default:
        return { title: 'StockFlow SaaS', subtitle: 'Inventory & Billing Platform' };
    }
  };

  const { title, subtitle } = getPageTitle();

  const handleOpenRecordStock = (product = null) => {
    setSelectedStockProduct(product);
    setIsRecordStockOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans antialiased">
      {/* Navigation Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setSidebarOpen(true)}
          onAddProductClick={() => setIsAddProductOpen(true)}
          onRecordStockClick={() => handleOpenRecordStock(null)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          {selectedProductId ? (
            <ProductDetails
              productId={selectedProductId}
              onBack={() => setSelectedProductId(null)}
              onRecordStockSuccess={() => setSelectedProductId(null)}
            />
          ) : (
            <Routes>
              <Route
                path="/"
                element={
                  <Dashboard
                    onAddProduct={() => setIsAddProductOpen(true)}
                    onRecordStock={(prod) => handleOpenRecordStock(prod)}
                    onViewProduct={(prod) => setSelectedProductId(prod._id)}
                  />
                }
              />
              <Route path="/billing" element={<Billing />} />
              <Route path="/sales" element={<SalesHistory />} />
              <Route path="/sales-analytics" element={<SalesAnalytics />} />
              <Route path="/customers" element={<Customers />} />
              <Route
                path="/products"
                element={
                  <Products
                    onViewDetails={(prod) => setSelectedProductId(prod._id)}
                  />
                }
              />
              <Route path="/categories" element={<Categories />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/purchase-orders" element={<PurchaseOrders />} />
              <Route path="/stock-movements" element={<StockMovements />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          )}
        </main>
      </div>

      {/* Global Toast Notifications Container */}
      <ToastContainer />

      {/* Global Cross-Collection Search Bar Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Global Add Product Modal */}
      <ProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onSuccess={() => {
          setIsAddProductOpen(false);
          navigate('/products');
        }}
      />

      {/* Global Record Stock Modal */}
      <RecordStockModal
        isOpen={isRecordStockOpen}
        onClose={() => setIsRecordStockOpen(false)}
        selectedProduct={selectedStockProduct}
        onSuccess={() => {
          setIsRecordStockOpen(false);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
