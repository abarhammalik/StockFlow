import React from 'react';
import { Database, ShieldCheck, Cpu, Terminal, Compass } from 'lucide-react';

export default function Settings() {
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Database & Environment Settings</h2>
        <p className="text-xs text-slate-400">Local MongoDB environment status and MongoDB Compass demonstration guides</p>
      </div>

      {/* MongoDB Compass Demonstration Guide */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-600" />
          MongoDB Compass Demonstration Walkthrough for Judges
        </h3>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed font-sans">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <strong className="text-slate-800 block font-mono text-sm">1. Open MongoDB Compass</strong>
            <p className="text-slate-500">Connect to URI: <code className="text-indigo-600 font-mono bg-indigo-50 px-1.5 py-0.5 rounded">mongodb://127.0.0.1:27017</code></p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <strong className="text-slate-800 block font-mono text-sm">2. Inspect Collections</strong>
            <p className="text-slate-500">Expand database <code className="text-indigo-600 font-mono bg-indigo-50 px-1.5 py-0.5 rounded">stockflow</code>. Show all 4 collections: <code className="text-slate-700 font-mono bg-slate-200 px-1.5 py-0.5 rounded">products, categories, suppliers, stock_movements</code>.</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <strong className="text-slate-800 block font-mono text-sm">3. Demonstrate Collection Relationships & References</strong>
            <p className="text-slate-500">Open a product document and point out ObjectId references <code className="text-emerald-600 font-mono bg-emerald-50 px-1.5 py-0.5 rounded">categoryId</code> and <code className="text-emerald-600 font-mono bg-emerald-50 px-1.5 py-0.5 rounded">supplierId</code>.</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <strong className="text-slate-800 block font-mono text-sm">4. Run Aggregation Pipeline</strong>
            <p className="text-slate-500">Click the Aggregations tab in Compass on the <code className="text-indigo-600 font-mono bg-indigo-50 px-1.5 py-0.5 rounded">products</code> collection and run `$lookup` → `$unwind` → `$group` stage sequence.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
