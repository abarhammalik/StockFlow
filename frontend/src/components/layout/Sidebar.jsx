import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/logo.png';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/app', icon: LayoutDashboard },
    { label: 'Billing / POS', path: '/app/billing', icon: ShoppingCart, highlight: true },
    { label: 'Sales History', path: '/app/sales', icon: Receipt },
    { label: 'Sales Analytics', path: '/app/sales-analytics', icon: TrendingUp },
    { label: 'Customers', path: '/app/customers', icon: UserCheck },
    { label: 'Products', path: '/app/products', icon: Package },
    { label: 'Categories', path: '/app/categories', icon: Layers },
    { label: 'Suppliers', path: '/app/suppliers', icon: Truck },
    { label: 'Purchase Orders', path: '/app/purchase-orders', icon: FileCheck2 },
    { label: 'Stock Movements', path: '/app/stock-movements', icon: ArrowLeftRight },
    { label: 'Analytics Pipeline', path: '/app/analytics', icon: BarChart3 },
    { label: 'Audit Logs', path: '/app/audit-logs', icon: History },
    { label: 'Settings', path: '/app/settings', icon: Settings },
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
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <img
                src={logoImg}
                alt="StockFlow"
                className="w-9 h-9 rounded-xl object-contain shadow-sm"
              />
              <div>
                <h1 className="text-[15px] font-bold text-slate-800 tracking-tight">StockFlow</h1>
                <p className="text-[10px] text-slate-400 font-medium">Cloud SaaS Workspace</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-slate-600 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-0.5 mt-1 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/app'}
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

        {/* User Workspace Info & Logout Footer */}
        <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/50">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
              alt={user?.name}
              className="w-8 h-8 rounded-lg bg-slate-100 object-cover flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 truncate">{user?.name || 'Authenticated User'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || user?.phone || 'Private Workspace'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between px-2 text-[10px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Cloud Connected
            </span>
            <span className="font-mono text-[9px]">v2.0 SaaS</span>
          </div>
        </div>
      </aside>
    </>
  );
}
