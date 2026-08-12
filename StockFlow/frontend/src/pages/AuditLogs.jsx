import React, { useEffect, useState } from 'react';
import { ShieldCheck, History, Clock } from 'lucide-react';
import axios from 'axios';
import { TableSkeleton } from '../components/ui/Skeleton';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/audit-logs');
      setLogs(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">System Audit & Activity Logs</h2>
          <p className="text-xs text-slate-400">Immutable trail of system operations, sales, POs, and stock movements</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={8} cols={4} />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">No activity logs recorded yet.</div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {logs.map((log) => (
              <div key={log._id} className="p-4 hover:bg-slate-50 transition flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl mt-0.5 border border-indigo-100">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{log.action}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {log.module}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1">{log.description}</p>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400 font-mono shrink-0">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
