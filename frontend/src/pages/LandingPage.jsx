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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Background Soft Glow Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header / Navbar */}
      <header className="relative z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform duration-200">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                StockFlow
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Cloud SaaS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How It Works</a>
            <a href="#preview" className="hover:text-indigo-600 transition-colors">Product Preview</a>
            <a href="#security" className="hover:text-indigo-600 transition-colors">Security</a>
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
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-medium">How It Works</a>
            <a href="#preview" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-medium">Product Preview</a>
            <a href="#security" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-medium">Security</a>
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <Link to="/login" className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold">Sign In</Link>
              <Link to="/signup" className="w-full text-center py-2.5 rounded-xl bg-indigo-600 text-white font-semibold shadow-md">Get Started Free</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-12 pb-20 lg:pt-20 lg:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-8 backdrop-blur-sm shadow-sm">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Next-Generation Multi-User Cloud Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-5xl mx-auto leading-tight">
          Know your stock.{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-500">
            Control your inventory.
          </span>{' '}
          Grow with confidence.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed">
          StockFlow empowers business owners with private, isolated cloud inventory workspaces, real-time PostgreSQL analytics, POS billing, OTP verification, and enterprise-grade security.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/signup"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base transition-all duration-200 shadow-xl shadow-indigo-200 hover:shadow-indigo-300 flex items-center justify-center gap-3 group"
          >
            Create Your Free Account
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#preview"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-base transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
          >
            Explore Dashboard Demo
          </a>
        </div>

        {/* Hero Interactive App Window Mockup */}
        <div id="preview" className="mt-16 relative max-w-5xl mx-auto">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-400 opacity-20 blur-xl"></div>
          <div className="relative rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden text-left">
            {/* Window Top Bar */}
            <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                <span className="ml-2 text-xs font-mono text-slate-500">https://stockflow.app/app/dashboard</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="font-mono text-emerald-600 font-semibold">Supabase PostgreSQL Connected</span>
              </div>
            </div>

            {/* Mockup Body Content */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50/50">
              {/* Stat Card 1 */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 font-medium">Total Products</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">1,248</p>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" /> +12.4% this month
                </span>
              </div>

              {/* Stat Card 2 */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 font-medium">Inventory Valuation</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">$48,250.00</p>
                <span className="text-xs text-slate-400 mt-1 block">Server Aggregated</span>
              </div>

              {/* Stat Card 3 */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 font-medium">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">3 Items</p>
                <span className="text-xs text-amber-600 mt-1 block">Requires Restock</span>
              </div>

              {/* Stat Card 4 */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 font-medium">Today's POS Sales</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">$3,140.50</p>
                <span className="text-xs text-indigo-600 mt-1 block font-medium">18 Orders Processed</span>
              </div>
            </div>

            <div className="px-6 pb-4 pt-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
              <span>Owner Workspace: <strong className="text-slate-800 font-semibold">Demo Business (Isolated User Data)</strong></span>
              <span className="font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200">ownerId: req.user._id verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Built for Modern Businesses</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900">
              Everything you need for complete stock control
            </p>
            <p className="mt-4 text-slate-600 text-base">
              From small retail shops to large warehouse catalogs, StockFlow provides robust cloud tools with seamless data security.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-md group">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Private Multi-User Workspaces</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Every user gets a completely isolated inventory catalog. Backend token authentication enforces owner filtering on every single database operation.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-md group">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Live Point of Sale (POS) & Billing</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Generate instant customer bills, calculate discounts and taxes, print customer receipts, and automatically deduct product stock in real time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-md group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Real-Time PostgreSQL Analytics</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Server-side SQL aggregation queries provide instant valuation, profit margins, top-moving items, and daily sales trends.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-md group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Low Stock Alerts & Movements</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Automated threshold monitoring alerts you before items run out. Maintain an immutable audit ledger for every stock receipt and dispatch.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-md group">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Supplier Purchase Orders</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Manage vendor contacts, generate formal PO documents, and automatically increment inventory quantity when purchase shipments arrive.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-md group">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Supabase Cloud Powered</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Production-ready Supabase PostgreSQL cloud database connection with relational integrity, encrypted credentials, and instant performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Seamless Onboarding</h2>
          <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900">How StockFlow Works</p>
          <p className="mt-4 text-slate-600">Get up and running in less than 2 minutes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
            <span className="text-4xl font-extrabold text-indigo-600/20">01</span>
            <h3 className="text-lg font-bold text-slate-900 mt-2">Create & Verify Account</h3>
            <p className="text-sm text-slate-600 mt-2">Sign up via Email/Password with OTP verification, Google OAuth, or Phone OTP.</p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
            <span className="text-4xl font-extrabold text-indigo-600/20">02</span>
            <h3 className="text-lg font-bold text-slate-900 mt-2">Set Up Catalog</h3>
            <p className="text-sm text-slate-600 mt-2">Add categories, supplier contacts, and product SKUs with min/max stock thresholds.</p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
            <span className="text-4xl font-extrabold text-indigo-600/20">03</span>
            <h3 className="text-lg font-bold text-slate-900 mt-2">Track & Bill Stock</h3>
            <p className="text-sm text-slate-600 mt-2">Use POS billing for instant counter sales or record stock movements (IN, OUT, ADJUSTMENT).</p>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
            <span className="text-4xl font-extrabold text-indigo-600/20">04</span>
            <h3 className="text-lg font-bold text-slate-900 mt-2">Understand Analytics</h3>
            <p className="text-sm text-slate-600 mt-2">View real-time profit margins, valuation trends, and supplier performance metrics.</p>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 bg-indigo-50/60 border-y border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-4 border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Zero-Trust Multi-Tenancy Architecture
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">Your data stays strictly yours. Always.</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              StockFlow enforces strict server-side authorization. We never trust client-supplied owner IDs. Every database query, update, delete, and calculation is automatically bound to `req.user.id`.
            </p>
            <ul className="mt-6 space-y-3">
              <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>JWT Authentication with bcrypt password & OTP hashing</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Supabase PostgreSQL SSL encrypted connection</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Relational unique constraints (`owner_id + sku`) for data integrity</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 w-full md:w-auto min-w-[320px] font-mono text-xs text-slate-700 space-y-3 shadow-lg">
            <div className="text-indigo-600 font-bold border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Security Enforcement Code</span>
              <Lock className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-slate-400">// Backend Controller Scoping</p>
            <p className="text-emerald-600 font-semibold">const ownerId = req.user.id;</p>
            <p className="text-indigo-700">
              const {`{ data: products }`} = await supabase<br />
              &nbsp;&nbsp;.from('products')<br />
              &nbsp;&nbsp;.select('*')<br />
              &nbsp;&nbsp;.eq('owner_id', ownerId);
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-12 rounded-3xl bg-indigo-600 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold">Ready to streamline your inventory?</h2>
            <p className="mt-4 text-indigo-100 text-base">
              Join business owners managing thousands of products with StockFlow Multi-User Cloud SaaS.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                to="/signup"
                className="px-8 py-4 rounded-xl bg-white text-indigo-600 font-bold hover:bg-slate-50 transition-colors shadow-lg flex items-center gap-2"
              >
                Create Account Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Package className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900">StockFlow Cloud</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-600">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <Link to="/login" className="hover:text-indigo-600">Login</Link>
            <Link to="/signup" className="hover:text-indigo-600">Signup</Link>
            <Link to="/app" className="hover:text-indigo-600">Dashboard</Link>
          </div>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} StockFlow SaaS. Supabase PostgreSQL Powered.
          </p>
        </div>
      </footer>
    </div>
  );
}
