import React from 'react';
import { useLiveBugs } from '../hooks/useLiveBugs';
import { BugStatus, Severity } from '../types';

/**
 * Reports page. Shows SLA targets plus a live breakdown of bugs by status and severity.
 */

const STATUS_GROUPS: { label: string; statuses: BugStatus[]; bar: string }[] = [
  { label: 'Open / assigned', statuses: ['OPEN', 'ASSIGNED', 'REOPENED', 'DEFERRED'], bar: 'bg-[#b8c3ff]' },
  { label: 'In development', statuses: ['IN PROGRESS'], bar: 'bg-amber-400' },
  { label: 'In QA verification', statuses: ['READY FOR TESTING', 'TESTING'], bar: 'bg-purple-400' },
  { label: 'Resolved / closed', statuses: ['RESOLVED', 'CLOSED', 'REJECTED/INVALID', 'DUPLICATE/ALREADY FIXED'], bar: 'bg-emerald-400' },
];

const SEVERITY_ROWS: { label: string; value: Severity; bar: string }[] = [
  { label: 'Critical', value: 'CRITICAL', bar: 'bg-red-400' },
  { label: 'Major', value: 'MAJOR', bar: 'bg-orange-400' },
  { label: 'Minor', value: 'MINOR', bar: 'bg-blue-400' },
  { label: 'Trivial', value: 'TRIVIAL', bar: 'bg-zinc-400' },
];

function CountBar({ label, count, total, bar }: { label: string; count: number; total: number; bar: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span>{label}</span>
        <span className="font-bold text-[#dee1fd]">{count}</span>
      </div>
      <div className="h-2 w-full bg-[#1a1f32] rounded overflow-hidden border border-[#2a2d3e]">
        <div className={`h-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { liveBugs, loaded } = useLiveBugs();
  const total = liveBugs.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 uppercase select-none font-mono text-xs">
      <div>
        <h2 className="text-xl font-bold font-sans tracking-tight text-[#dee1fd] normal-case">Bug reports &amp; SLA</h2>
        <p className="text-xs text-[#8e90a0] font-sans mt-0.5 normal-case">Service-level targets, mean time to resolve (MTTR), and a live breakdown of all bugs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

        {/* SLA Performance */}
        <div className="bg-[#161a2e] p-5 rounded-xl border border-[#2a2d3e] space-y-4 shadow-lg text-left">
          <h3 className="text-sm font-bold text-[#b8c3ff] tracking-tight">SLA Performance Parameters</h3>
          <div className="space-y-3 pt-2">

            <div>
              <div className="flex justify-between mb-1">
                <span>Critical S1 MTTR (Avg Resolve Hours)</span>
                <span className="font-bold text-red-300">4.2 Hours</span>
              </div>
              <div className="h-2 w-full bg-[#1a1f32] rounded overflow-hidden border border-[#2a2d3e]">
                <div className="h-full bg-red-400" style={{ width: '85%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Major S2 Resolution Rate</span>
                <span className="font-bold text-amber-300">92% within 48h</span>
              </div>
              <div className="h-2 w-full bg-[#1a1f32] rounded overflow-hidden border border-[#2a2d3e]">
                <div className="h-full bg-amber-400" style={{ width: '92%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>QA Testing validation overhead</span>
                <span className="font-bold text-emerald-400">98.6% Passed</span>
              </div>
              <div className="h-2 w-full bg-[#1a1f32] rounded overflow-hidden border border-[#2a2d3e]">
                <div className="h-full bg-emerald-400" style={{ width: '98.6%' }} />
              </div>
            </div>

          </div>
        </div>

        {/* Live breakdown */}
        <div className="bg-[#161a2e] p-5 rounded-xl border border-[#2a2d3e] space-y-5 shadow-lg text-left">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-bold text-[#dee1fd] tracking-tight normal-case">Live bug breakdown</h3>
            <span className="text-[#8e90a0] normal-case font-sans">{loaded ? `${total} total` : 'Loading...'}</span>
          </div>

          <div className="space-y-3">
            <p className="text-[#8e90a0] font-bold tracking-wider">By status</p>
            {STATUS_GROUPS.map(g => (
              <CountBar
                key={g.label}
                label={g.label}
                count={liveBugs.filter(b => g.statuses.includes(b.status)).length}
                total={total}
                bar={g.bar}
              />
            ))}
          </div>

          <div className="space-y-3 pt-1">
            <p className="text-[#8e90a0] font-bold tracking-wider">By severity</p>
            {SEVERITY_ROWS.map(r => (
              <CountBar
                key={r.value}
                label={r.label}
                count={liveBugs.filter(b => b.severity === r.value).length}
                total={total}
                bar={r.bar}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
