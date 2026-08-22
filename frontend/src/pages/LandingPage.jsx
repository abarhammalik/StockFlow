import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  ShieldCheck,
  Zap,
  BarChart3,
  Users,
  Database,
  ArrowRight,
  CheckCircle2,
  Lock,
  Boxes,
  TrendingUp,
  Layers,
  Sparkles,
  Menu,
  X,
  CreditCard,
  Building2,
  ShoppingCart,
  Receipt,
  FileSpreadsheet,
  Clock,
  ChevronDown,
  Activity,
  Globe,
  Sliders,
  Check,
  Tag,
  AlertTriangle,
  FileCheck,
  Mail,
  MapPin,
  Phone,
  Heart,
  ExternalLink,
  Twitter,
  Linkedin,
  Github,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeHeroTab, setActiveHeroTab] = useState('pos');
  const [pricingAnnual, setPricingAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Background Soft Glow Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header / Navbar */}
      <header className="relative z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={logoImg}
              alt="StockFlow"
              className="w-10 h-10 rounded-xl object-contain shadow-sm group-hover:scale-105 transition-transform duration-200"
            />
            <div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                StockFlow
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#preview" className="hover:text-indigo-600 transition-colors">Live Preview</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
            <a href="#security" className="hover:text-indigo-600 transition-colors">Security</a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/app')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all duration-200 shadow-md shadow-indigo-200 flex items-center gap-2"
              >
                Go to Workspace
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all duration-200 shadow-md shadow-indigo-200 hover:shadow-indigo-300 flex items-center gap-2"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-medium">Features</a>
            <a href="#preview" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-medium">Live Preview</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-medium">How It Works</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-medium">Pricing</a>
            <a href="#security" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-medium">Security</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-medium">FAQ</a>
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <Link to="/login" className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold">Sign In</Link>
              <Link to="/signup" className="w-full text-center py-2.5 rounded-xl bg-indigo-600 text-white font-semibold shadow-md">Get Started Free</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-12 pb-16 lg:pt-20 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-5xl mx-auto leading-tight">
          Know your stock.{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-500">
            Control your inventory.
          </span>{' '}
          Grow with confidence.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed">
          StockFlow empowers retail stores, warehouses, and fast-scaling merchants with isolated cloud workspaces, instant POS billing & receipts, live stock ledgers, and automated business analytics.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/signup"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-base transition-all duration-200 shadow-xl shadow-indigo-200 hover:shadow-indigo-300 flex items-center justify-center gap-3 group"
          >
            Start Free 14-Day Trial
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#preview"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-base transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
          >
            Explore Interactive Demo
          </a>
        </div>

        {/* Live Performance KPI Strip */}
        <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/70 border border-slate-200/80 backdrop-blur-md shadow-sm">
          <div className="text-center p-2">
            <p className="text-2xl font-black text-indigo-600">99.99%</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">High-Availability Uptime</p>
          </div>
          <div className="text-center p-2 border-l border-slate-200/60">
            <p className="text-2xl font-black text-emerald-600">&lt; 50ms</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Live Sync Latency</p>
          </div>
          <div className="text-center p-2 border-l border-slate-200/60">
            <p className="text-2xl font-black text-slate-900">100%</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Isolated Tenant Storage</p>
          </div>
          <div className="text-center p-2 border-l border-slate-200/60">
            <p className="text-2xl font-black text-blue-600">0 Discrepancy</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Automated Stock Audits</p>
          </div>
        </div>

        {/* Hero Interactive App Window Showcase */}
        <div id="preview" className="mt-16 relative max-w-5xl mx-auto">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-400 opacity-20 blur-xl"></div>
          <div className="relative rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden text-left">
            {/* Window Top Bar */}
            <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                <span className="ml-2 text-xs font-mono text-slate-500 hidden sm:inline">https://stockflow.app/workspace/active</span>
              </div>

              {/* Interactive Tabs */}
              <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-medium">
                <button
                  onClick={() => setActiveHeroTab('pos')}
                  className={`px-3 py-1 rounded-lg transition ${activeHeroTab === 'pos' ? 'bg-white text-indigo-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  POS Billing
                </button>
                <button
                  onClick={() => setActiveHeroTab('ledger')}
                  className={`px-3 py-1 rounded-lg transition ${activeHeroTab === 'ledger' ? 'bg-white text-indigo-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Stock Ledger
                </button>
                <button
                  onClick={() => setActiveHeroTab('analytics')}
                  className={`px-3 py-1 rounded-lg transition ${activeHeroTab === 'analytics' ? 'bg-white text-indigo-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Business Analytics
                </button>
                <button
                  onClick={() => setActiveHeroTab('po')}
                  className={`px-3 py-1 rounded-lg transition ${activeHeroTab === 'po' ? 'bg-white text-indigo-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Purchase Orders
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="font-mono text-emerald-600 font-semibold">Live Cloud Engine</span>
              </div>
            </div>

            {/* Mockup Dynamic Content Based on Tab */}
            <div className="p-6 bg-slate-50/50 min-h-[340px]">
              {/* TAB 1: POS BILLING */}
              {activeHeroTab === 'pos' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
                  <div className="md:col-span-2 space-y-3">
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">SKU-01</div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Wireless Noise-Canceling Headphones</p>
                          <p className="text-[10px] text-slate-500">Unit Price: $149.00 • In Stock: 42</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-900 font-mono">$149.00</span>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">SKU-08</div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Ergonomic USB-C Mechanical Keyboard</p>
                          <p className="text-[10px] text-slate-500">Unit Price: $89.50 • In Stock: 18</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-900 font-mono">$89.50</span>
                    </div>

                    <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-slate-600">Customer: <strong>Arham Malik (+1 555-0192)</strong></span>
                      <span className="font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200 text-[10px]">Payment: Cash / Card</span>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-xl border-2 border-indigo-100 shadow-sm flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Receipt className="w-3.5 h-3.5 text-indigo-600" /> POS Summary
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Order #1084</span>
                      </div>
                      <div className="space-y-1.5 text-xs font-mono pt-3">
                        <div className="flex justify-between text-slate-500"><span>Subtotal:</span><span>$238.50</span></div>
                        <div className="flex justify-between text-slate-500"><span>Tax (5%):</span><span>$11.93</span></div>
                        <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-100"><span>Total:</span><span className="text-indigo-600">$250.43</span></div>
                      </div>
                    </div>
                    <button className="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5">
                      <ShoppingCart className="w-3.5 h-3.5" /> Complete Sale & Deduct Stock
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: STOCK LEDGER */}
              {activeHeroTab === 'ledger' && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 rounded bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">STOCK OUT</span>
                      <div>
                        <p className="font-bold text-slate-800">4K Ultra HD Display Monitor 27"</p>
                        <p className="text-[10px] text-slate-400">Transaction Ref: POS-INV-2026-089 • 2 units deducted</p>
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-rose-600">-2 Qty</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">STOCK IN</span>
                      <div>
                        <p className="font-bold text-slate-800">USB-C Multiport Hub Adapter 7-in-1</p>
                        <p className="text-[10px] text-slate-400">Supplier Shipment PO #4092 • 50 units received</p>
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-emerald-600">+50 Qty</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 rounded bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200">ADJUSTMENT</span>
                      <div>
                        <p className="font-bold text-slate-800">Bluetooth Studio Mic</p>
                        <p className="text-[10px] text-slate-400">Annual inventory reconciliation audit</p>
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-amber-600">+3 Qty</span>
                  </div>
                </div>
              )}

              {/* TAB 3: BUSINESS ANALYTICS */}
              {activeHeroTab === 'analytics' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
                  <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500 font-medium">Portfolio Valuation</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">$48,250.00</p>
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3.5 h-3.5" /> +14.8% vs last month
                    </span>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500 font-medium">Gross Margin Average</p>
                    <p className="text-2xl font-black text-indigo-600 mt-1">38.4%</p>
                    <span className="text-xs text-slate-400 mt-1 block">Calculated across 8 categories</span>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500 font-medium">Critical Stock Alerts</p>
                    <p className="text-2xl font-black text-rose-600 mt-1">2 Items</p>
                    <span className="text-xs text-rose-600 mt-1 block font-medium">Below reorder minimums</span>
                  </div>
                </div>
              )}

              {/* TAB 4: PURCHASE ORDERS */}
              {activeHeroTab === 'po' && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800">PO-2026-004 • Apex Electronics Distro</span>
                      <p className="text-[10px] text-slate-400">120 Units (Wireless Earbuds, Powerbanks) • $3,450.00</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">In Transit</span>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800">PO-2026-003 • Global Hardware Corp</span>
                      <p className="text-[10px] text-slate-400">45 Units (Monitors, Docking Stations) • $6,820.00</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Received & Stocked</span>
                  </div>
                </div>
              )}
            </div>

            {/* Window Footer */}
            <div className="px-6 pb-4 pt-3 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
              <span>Tenant Organization: <strong className="text-slate-800 font-semibold">Active Private Cloud Workspace</strong></span>
              <span className="font-mono bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded border border-slate-200 text-[11px]">Strict Multi-Tenant Isolation Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section (Bento Grid Style) */}
      <section id="features" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Built for Modern Businesses</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900">
              Everything you need for complete stock control
            </p>
            <p className="mt-4 text-slate-600 text-base">
              From small retail shops to multi-category catalogs, StockFlow provides robust cloud tools with seamless data security.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Bento Card 1: POS Billing */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-md group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md shadow-indigo-200">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Live POS Billing & Thermal Receipts</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Fast counter billing with itemized tax computation, custom discount application, customer phone search, and instant PDF/thermal receipt printing.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center text-xs font-semibold text-indigo-600">
                <span>Automatic stock deduction upon sale</span>
              </div>
            </div>

            {/* Bento Card 2: Stock Ledger */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-md group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md shadow-emerald-200">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Immutable Stock Ledger Audit</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Never lose track of missing inventory. Every movement (IN, OUT, ADJUSTMENT, SALE) is recorded with timestamp, reference, and user metadata.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center text-xs font-semibold text-emerald-600">
                <span>Zero-discrepancy inventory tracking</span>
              </div>
            </div>

            {/* Bento Card 3: Real-Time Sync */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-md group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md shadow-amber-200">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Real-Time Cloud Synchronization</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Sales at counter #1 immediately update stock levels on warehouse devices. WebSocket event pipelines ensure zero overselling.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center text-xs font-semibold text-amber-600">
                <span>Sub-50ms instant multi-device sync</span>
              </div>
            </div>

            {/* Bento Card 4: Supplier POs */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-md group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md shadow-purple-200">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Supplier Procurement & POs</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Maintain vendor contacts, create structured purchase orders, and automatically increase stock levels once shipments are received at your warehouse.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center text-xs font-semibold text-purple-600">
                <span>Integrated reordering workflow</span>
              </div>
            </div>

            {/* Bento Card 5: CRM & Customer Profiles */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-md group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md shadow-blue-200">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Customer CRM & Purchase History</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Track recurring buyers, store tax identifiers, review lifetime spend, and access past invoices with 1-click lookup.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center text-xs font-semibold text-blue-600">
                <span>Integrated customer management</span>
              </div>
            </div>

            {/* Bento Card 6: Business Intelligence */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-md group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md shadow-cyan-200">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Executive Intelligence & Margins</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Real-time profit margin analysis, inventory valuation breakdown by category, fast vs slow-moving SKU velocities, and threshold alerts.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center text-xs font-semibold text-cyan-600">
                <span>Data-driven inventory forecasting</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Seamless Onboarding</h2>
          <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900">How StockFlow Works</p>
          <p className="mt-4 text-slate-600">Get up and running with your full workspace in under 2 minutes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
            <span className="text-4xl font-black text-indigo-600/20">01</span>
            <h3 className="text-lg font-bold text-slate-900 mt-2">Create & Verify</h3>
            <p className="text-sm text-slate-600 mt-2">Sign up with your email, verify your secure link, and receive your private cloud workspace.</p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
            <span className="text-4xl font-black text-indigo-600/20">02</span>
            <h3 className="text-lg font-bold text-slate-900 mt-2">Set Up Catalog</h3>
            <p className="text-sm text-slate-600 mt-2">Add product categories, supplier records, and SKUs with cost price, retail price, and safety stock thresholds.</p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
            <span className="text-4xl font-black text-indigo-600/20">03</span>
            <h3 className="text-lg font-bold text-slate-900 mt-2">Sell & Deduct</h3>
            <p className="text-sm text-slate-600 mt-2">Process counter sales via POS with automatic receipt generation and atomic stock deductions.</p>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
            <span className="text-4xl font-black text-indigo-600/20">04</span>
            <h3 className="text-lg font-bold text-slate-900 mt-2">Analyze & Scale</h3>
            <p className="text-sm text-slate-600 mt-2">Gain real-time margin visibility, automate purchase reorders, and scale your business effortlessly.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Transparent Pricing</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900">Simple plans that scale with you</p>
            <p className="mt-4 text-slate-600">Start with our full-featured Starter plan and upgrade as your inventory grows.</p>

            {/* Monthly / Annual Toggle */}
            <div className="mt-8 inline-flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
              <button
                onClick={() => setPricingAnnual(false)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${!pricingAnnual ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setPricingAnnual(true)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${pricingAnnual ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Annual Billing <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-extrabold">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {/* Tier 1: Free Starter */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Starter</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">$0</span>
                  <span className="text-xs text-slate-400">/ forever free</span>
                </div>
                <p className="mt-3 text-xs text-slate-500">Perfect for single-store retailers and growing boutiques.</p>
                <div className="mt-6 space-y-3 text-xs text-slate-700">
                  <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Up to 50 active products</div>
                  <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Unlimited POS counter billing</div>
                  <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Standard thermal receipt printing</div>
                  <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Real-time stock deductions</div>
                  <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Isolated private cloud workspace</div>
                </div>
              </div>
              <Link
                to="/signup"
                className="mt-8 w-full py-3 rounded-xl border-2 border-slate-200 hover:border-indigo-600 text-slate-800 font-bold text-xs transition text-center block"
              >
                Get Started Free
              </Link>
            </div>

            {/* Tier 2: Pro Growth (Featured) */}
            <div className="p-8 rounded-3xl bg-slate-900 text-white border-2 border-indigo-500 shadow-2xl relative flex flex-col justify-between">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                Most Popular
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">Pro Growth</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">{pricingAnnual ? '$24' : '$29'}</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <p className="mt-3 text-xs text-slate-400">For multi-category stores and high-turnover retailers.</p>
                <div className="mt-6 space-y-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Unlimited product catalog & SKUs</div>
                  <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Full POS billing + customer credit tracking</div>
                  <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Supplier purchase orders & restocking</div>
                  <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Full business intelligence & profit margin charts</div>
                  <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Automated low-stock alerts</div>
                  <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Sub-50ms live multi-device WebSocket sync</div>
                </div>
              </div>
              <Link
                to="/signup"
                className="mt-8 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition text-center block shadow-lg shadow-indigo-500/30"
              >
                Start 14-Day Pro Trial
              </Link>
            </div>

            {/* Tier 3: Enterprise Scale */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Enterprise Scale</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">{pricingAnnual ? '$64' : '$79'}</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <p className="mt-3 text-xs text-slate-500">For multi-warehouse chains and high-volume operations.</p>
                <div className="mt-6 space-y-3 text-xs text-slate-700">
                  <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Everything in Pro Growth</div>
                  <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Multi-location warehouse management</div>
                  <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Unlimited audit log history & export</div>
                  <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Dedicated priority 24/7 technical support</div>
                  <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> 99.99% Guaranteed SLA uptime</div>
                </div>
              </div>
              <Link
                to="/signup"
                className="mt-8 w-full py-3 rounded-xl border-2 border-slate-200 hover:border-indigo-600 text-slate-800 font-bold text-xs transition text-center block"
              >
                Contact Enterprise Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 bg-indigo-50/60 border-y border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-4 border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Enterprise Multi-Tenant Security
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">Your data stays strictly yours. Always.</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              StockFlow enforces strict server-side authorization and tenant isolation. Every database transaction, update, and calculation is isolated to your organization's private workspace.
            </p>
            <ul className="mt-6 space-y-3">
              <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Industry-standard cryptographic authentication and session encryption</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>End-to-end 256-bit TLS/SSL encrypted cloud communication</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Automated inventory ledger reconciliation and audit logging</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 w-full md:w-auto min-w-[340px] text-xs text-slate-700 space-y-4 shadow-xl">
            <div className="text-indigo-600 font-bold border-b border-slate-100 pb-3 flex items-center justify-between">
              <span className="text-sm font-extrabold text-slate-900">Security & Compliance</span>
              <Lock className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-700">Data Isolation</span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Enforced</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-700">Transit Encryption</span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">TLS 1.3 / 256-bit</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-700">Audit Logging</span>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">Real-Time</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-700">Cloud Redundancy</span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">High Availability</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) Section */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Got Questions?</h2>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">Frequently Asked Questions</p>
          <p className="mt-2 text-sm text-slate-500">Everything you need to know about StockFlow.</p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'How does StockFlow isolate my store data from other businesses?',
              a: 'Every user account is assigned an isolated workspace tenant. All database transactions, stock ledgers, and sales reports are strictly bounded to your private authenticated session, guaranteeing 100% data separation.',
            },
            {
              q: 'Can I use StockFlow on tablets or counter POS touchscreens?',
              a: 'Yes! StockFlow is fully responsive and optimized for touch devices, tablets, and desktop workstations. The POS billing interface is designed for fast keyboard or touchscreen checkout.',
            },
            {
              q: 'How do automatic stock deductions work during checkout?',
              a: 'When you finalize a bill in POS Billing, StockFlow executes an atomic database transaction that instantly deducts product quantities and writes an immutable entry into your stock movement audit ledger.',
            },
            {
              q: 'Can multiple employees use the workspace simultaneously?',
              a: 'Yes. StockFlow uses real-time WebSocket pipelines to broadcast stock level updates and ledger events instantly across all open workstations without requiring manual page refreshes.',
            },
            {
              q: 'Can I generate PDF tax receipts and export sales history?',
              a: 'Yes. Every sale generates a customer tax receipt with itemized totals, store terms, and printable thermal formats. You can also review complete activity logs and export data anytime.',
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-slate-800 hover:text-indigo-600 text-sm"
              >
                <span>{item.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-indigo-600' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="relative p-12 sm:p-16 rounded-[2rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white overflow-hidden shadow-2xl shadow-indigo-300/40">

          {/* Animated background decorations */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/5 rounded-full blur-3xl"></div>

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          ></div>

          <div className="relative z-10 max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Start Free — No Credit Card Required
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
              Ready to transform how you{' '}
              <span className="relative">
                <span className="relative z-10">manage inventory</span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-white/20 rounded-sm -skew-x-3"></span>
              </span>
              ?
            </h2>

            <p className="mt-5 text-indigo-100/90 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Join thousands of modern merchants managing their stock, POS billing, and supplier orders — all from a single, powerful dashboard.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/signup"
                className="group px-8 py-4 rounded-2xl bg-white text-indigo-600 font-bold hover:bg-slate-50 transition-all duration-300 shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-2.5 hover:-translate-y-0.5 hover:shadow-2xl"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/25 text-white font-bold hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2.5 hover:-translate-y-0.5"
              >
                <Lock className="w-4 h-4" />
                Sign In
              </Link>
            </div>

            {/* Trust Stats Row */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm">

              <div className="flex items-center gap-2 text-indigo-100/80">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>Enterprise-grade security</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-100/80">
                <Zap className="w-4 h-4 text-emerald-300" />
                <span>Setup in under 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-slate-900 text-slate-300 overflow-hidden">
        {/* Top gradient accent line */}
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

        {/* Main footer content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

            {/* Brand Column */}
            <div className="lg:col-span-1 space-y-5">
              <div className="flex items-center gap-3">
                <img
                  src={logoImg}
                  alt="StockFlow"
                  className="w-10 h-10 rounded-xl object-contain shadow-lg shadow-indigo-500/20"
                />
                <div>
                  <span className="text-lg font-bold text-white tracking-tight">StockFlow</span>
                  <span className="block text-[10px] text-indigo-400 font-semibold tracking-widest uppercase">Inventory Platform</span>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                The modern inventory management platform for businesses. Manage stock, POS billing, suppliers, and analytics — all in one place.
              </p>
              {/* Social Icons */}
              <div className="flex items-center gap-3 pt-1">
                <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-indigo-600 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/25">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-indigo-600 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/25">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-indigo-600 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/25">
                  <Github className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-indigo-600 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/25">
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Product</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Dashboard', to: '/app', icon: BarChart3 },
                  { label: 'Inventory Management', to: '/signup', icon: Boxes },
                  { label: 'POS Billing', to: '/signup', icon: ShoppingCart },
                  { label: 'Supplier Orders', to: '/signup', icon: Receipt },
                  { label: 'Analytics & Reports', to: '/signup', icon: TrendingUp },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="group flex items-center gap-2.5 text-sm text-slate-400 hover:text-white transition-colors duration-200"
                    >
                      <item.icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Company</h4>
              <ul className="space-y-3">
                {[
                  { label: 'About Us', to: '/' },
                  { label: 'Pricing', to: '/' },
                  { label: 'Privacy Policy', to: '/' },
                  { label: 'Terms of Service', to: '/' },
                  { label: 'Contact Support', to: '/' },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-sm text-slate-400 hover:text-white transition-colors duration-200 flex items-center gap-1.5"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Get Started & Trust */}
            <div className="space-y-5">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Get Started</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Create your free account and start managing your inventory in minutes.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5"
              >
                Start Free
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Trust Badges */}
              <div className="pt-3 space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Enterprise-grade security</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Lock className="w-3.5 h-3.5 text-emerald-500" />
                  <span>End-to-end encrypted</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Globe className="w-3.5 h-3.5 text-emerald-500" />
                  <span>99.9% uptime guarantee</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} StockFlow Platform. All rights reserved.
            </p>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500 mx-0.5" /> for modern businesses
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <Link to="/" className="hover:text-slate-300 transition-colors">Privacy</Link>
              <Link to="/" className="hover:text-slate-300 transition-colors">Terms</Link>
              <Link to="/" className="hover:text-slate-300 transition-colors">Cookies</Link>
            </div>
          </div>
        </div>

        {/* Subtle background glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none"></div>
      </footer>
    </div>
  );
}
