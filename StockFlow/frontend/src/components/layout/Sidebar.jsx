import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Truck, 
  ArrowLeftRight, 
  BarChart3, 
  Settings, 
  Box, 
  Database,
  ShoppingCart,
  Receipt,
  UserCheck,
  TrendingUp,
  FileCheck2,
  History,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }) {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Billing / POS', path: '/billing', icon: ShoppingCart, highlight: true },
    { label: 'Sales History', path: '/sales', icon: Receipt },
    { label: 'Sales Analytics', path: '/sales-analytics', icon: TrendingUp },
    { label: 'Customers', path: '/customers', icon: UserCheck },
    { label: 'Products', path: '/products', icon: Package },
    { label: 'Categories', path: '/categories', icon: Layers },
    { label: 'Suppliers', path: '/suppliers', icon: Truck },
    { label: 'Purchase Orders', path: '/purchase-orders', icon: FileCheck2 },
    { label: 'Stock Movements', path: '/stock-movements', icon: ArrowLeftRight },
    { label: 'Analytics Pipeline', path: '/analytics', icon: BarChart3 },
    { label: 'Audit Logs', path: '/audit-logs', icon: History },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-[260px] bg-white border-r border-slate-200
        flex flex-col justify-between transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Brand */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-200">
                <Box className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-[15px] font-bold text-slate-800 tracking-tight">StockFlow</h1>
                <p className="text-[10px] text-slate-400 font-medium">Inventory & POS Platform</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-slate-600 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="p-3 space-y-0.5 mt-1 max-h-[calc(100vh-140px)] overflow-y-auto">
            <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2 rounded-xl text-[12px] font-medium transition-all group
                    ${isActive 
                      ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                      : item.highlight
                      ? 'text-indigo-600 hover:bg-indigo-50/60 font-semibold'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }
                  `}
                >
                  <Icon className={`w-[17px] h-[17px] ${item.highlight ? 'text-indigo-600' : ''}`} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                MongoDB Live Sync
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              127.0.0.1:27017/stockflow
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
