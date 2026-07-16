import React from 'react';
import {
  LayoutDashboard,
  Bug as BugIcon,
  ShieldAlert,
  CheckCircle,
  Sliders,
  AlertTriangle,
  History,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

/**
 * Dashboard page — extracted from App.tsx (lines 543–689).
 * Shows summary metric cards, bug volume chart, critical hotspots, and audit timeline.
 */
export default function Dashboard() {
  const {
    activeBugsCount,
    criticalBugsCount,
    resolvedTodayCount,
    pendingReviewCount,
    bugs,
    setSelectedBugId,
  } = useAppContext();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* Header Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-[#dee1fd]">Central Workbench Dashboard</h2>
          <p className="text-xs text-[#8e90a0] font-sans mt-0.5">Real-time status analysis of current sprint performance.</p>
        </div>
        <div className="text-[11px] font-mono font-bold bg-[#1a1f32] border border-[#2a2d3e] text-[#b8c3ff] px-2.5 py-1 rounded">
          SYSTEM STATUS: HEALTHY (98.6%)
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#161a2e] p-4 rounded-xl border border-[#2a2d3e]/70 flex items-center justify-between shadow-lg">
          <div>
            <span className="block text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider">Active bugs</span>
            <span className="text-2xl font-black text-rose-300 tracking-tight block mt-1">{activeBugsCount}</span>
            <span className="text-[10px] text-zinc-400 mt-1 block">Excl. closed tickets</span>
          </div>
          <BugIcon className="w-8 h-8 text-rose-300/35" />
        </div>

        <div className="bg-[#161a2e] p-4 rounded-xl border border-[#2a2d3e]/70 flex items-center justify-between shadow-lg">
          <div>
            <span className="block text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider">S1 Blockers</span>
            <span className="text-2xl font-black text-amber-300 tracking-tight block mt-1">{criticalBugsCount}</span>
            <span className="text-[10px] text-red-300/80 font-bold mt-1 block">Urgent mitigation</span>
          </div>
          <ShieldAlert className="w-8 h-8 text-amber-300/35" />
        </div>

        <div className="bg-[#161a2e] p-4 rounded-xl border border-[#2a2d3e]/70 flex items-center justify-between shadow-lg">
          <div>
            <span className="block text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider">Resolved Tickets</span>
            <span className="text-2xl font-black text-emerald-300 tracking-tight block mt-1">{resolvedTodayCount}</span>
            <span className="text-[10px] text-zinc-400 mt-1 block">All-time resolution</span>
          </div>
          <CheckCircle className="w-8 h-8 text-emerald-300/35" />
        </div>

        <div className="bg-[#161a2e] p-4 rounded-xl border border-[#2a2d3e]/70 flex items-center justify-between shadow-lg">
          <div>
            <span className="block text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider">In Verification</span>
            <span className="text-2xl font-black text-blue-300 tracking-tight block mt-1">{pendingReviewCount}</span>
            <span className="text-[10px] text-zinc-400 mt-1 block">Pending QA clearance</span>
          </div>
          <Sliders className="w-8 h-8 text-blue-300/35" />
        </div>
      </div>

      {/* Double column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2-col span */}
        <div className="lg:col-span-2 space-y-6">

          {/* Bug Volume Distribution Chart */}
          <div className="bg-[#161a2e] border border-[#2a2d3e]/70 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-xs font-mono font-bold text-[#b8c3ff] uppercase tracking-wider flex items-center gap-1.5">
              <LayoutDashboard className="w-4 h-4" />
              <span>Bug Volume Distribution by Project</span>
            </h3>

            <div className="space-y-4 pt-2">
              {[
                { proj: 'CSE-WEB Portal frontend', open: 6, rest: 12, color: 'bg-indigo-400' },
                { proj: 'Phoenix Engine core v2', open: 3, rest: 8, color: 'bg-emerald-400' },
                { proj: 'CSE-API service layer', open: 5, rest: 14, color: 'bg-amber-400' },
                { proj: 'CLOUD-INFRA orchestrator', open: 1, rest: 4, color: 'bg-rose-400' },
              ].map((item) => {
                const openPercent = (item.open / 30) * 100;
                const restPercent = (item.rest / 30) * 100;
                return (
                  <div key={item.proj} className="space-y-1">
                    <div className="flex justify-between items-baseline text-xs font-sans">
                      <span className="font-semibold text-[#dee1fd]">{item.proj}</span>
                      <span className="font-mono text-[10px] text-[#8e90a0]">{item.open} ongoing / {item.rest} fixed</span>
                    </div>
                    <div className="h-2 w-full bg-[#1a1f32] rounded flex overflow-hidden border border-[#2a2d3e]">
                      <div className={item.color + ' h-full'} style={{ width: `${openPercent}%` }} />
                      <div className="bg-zinc-700/60 h-full" style={{ width: `${restPercent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Critical Hotspots */}
          <div className="bg-[#161a2e] border border-[#2a2d3e]/70 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-xs font-mono font-bold text-[#b8c3ff] uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Critical Hotspots ({bugs.filter(b => b.severity === 'CRITICAL').length})</span>
            </h3>

            <div className="divide-y divide-[#2a2d3e]/55 space-y-3">
              {bugs.filter(b => b.severity === 'CRITICAL').slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedBugId(item.id)}
                  className="pt-3 flex justify-between items-start cursor-pointer hover:bg-[#1a1f32]/25 rounded transition-all"
                >
                  <div>
                    <span className="text-[10px] font-mono text-[#ffb4ab] font-bold block mb-0.5">{item.id} - {item.module}</span>
                    <p className="text-xs font-bold text-[#dee1fd] font-sans hover:underline leading-relaxed">{item.title}</p>
                    <span className="text-[10px] text-[#8e90a0] font-sans mt-1 block">Assigned to: {item.assignedTo || 'Unassigned'}</span>
                  </div>
                  <span className="bg-[#93000a]/30 text-rose-200 border border-[#93000a]/50 text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded shrink-0">S1</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right col: Audit Timeline */}
        <div className="bg-[#161a2e] border border-[#2a2d3e]/70 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-xs font-mono font-bold text-[#b8c3ff] uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-4 h-4 text-[#8e90a0]" />
            <span>Live Audit Timeline Log</span>
          </h3>

          <div className="relative pl-4 border-l border-[#2a2d3e] space-y-5 h-[340px] overflow-y-auto custom-scrollbar">
            {bugs.slice(0, 6).map((b) => (
              <div key={b.id} className="relative text-xs">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#294fdb] border-2 border-[#161a2e]" />
                <p className="font-bold text-[#dee1fd] font-sans">{b.id}</p>
                <p className="text-[#c4c5d7] text-[11px] mt-0.5 line-clamp-2">{b.title}</p>
                <span className="text-[10px] text-[#8e90a0] font-mono mt-0.5 block">{b.updatedDate}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
