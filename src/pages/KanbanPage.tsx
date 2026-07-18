import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

/**
 * Kanban / Task Board page.
 * Four columns: OPEN/RE-OPENED → IN PROGRESS → TESTING → RESOLVED/CLOSED.
 *
 * Status changes always go through the same modals used elsewhere in the
 * app, which collect the required comment and submit through the real
 * PATCH /bugs/{id}/status or /reopen endpoints - never a direct mutation.
 */
export default function KanbanPage() {
  const { bugs, setSelectedBugId, setStatusChangeBugId, setReopenBugId, currentUser } = useAppContext();
  const isDeveloper = currentUser?.role === 'Sr. Developer';
  const isTester = currentUser?.role === 'QA Lead';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold font-sans tracking-tight text-[#dee1fd]">Engineering task board</h2>
        <p className="text-xs text-[#8e90a0] font-sans mt-0.5">Iterative workflow board. Click a card to view details, or use the quick action to update status.</p>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start select-none">

        {/* OPEN Column */}
        <div className="bg-[#161a2e] border border-[#2a2d3e] rounded-xl p-4 flex flex-col max-h-[640px] shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black uppercase font-mono tracking-wider text-[#b8c3ff]">Incoming / Open</span>
            <span className="bg-[#2a2d3e] text-xs font-bold text-white px-2 py-0.5 rounded font-mono">
              {bugs.filter(b => b.status === 'OPEN' || b.status === 'REOPENED').length}
            </span>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[560px] pr-1.5 custom-scrollbar">
            {bugs.filter(b => b.status === 'OPEN' || b.status === 'REOPENED').map((item) => (
              <div
                key={item.id}
                className="bg-[#1a1f32] p-3 rounded-lg border border-[#2a2d3e]/70 space-y-2 hover:border-[#b8c3ff]/40 transition-colors cursor-pointer"
                onClick={() => setSelectedBugId(item.id)}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[#ffb4ab] font-bold font-mono">{item.id}</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider font-mono bg-red-950/40 text-red-300">{item.severity}</span>
                </div>
                <h4 className="text-xs font-bold text-[#dee1fd] leading-snug line-clamp-2 hover:underline">{item.title}</h4>
                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-[9px] text-[#8e90a0]">{item.module}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* IN PROGRESS Column */}
        <div className="bg-[#161a2e] border border-[#2a2d3e] rounded-xl p-4 flex flex-col max-h-[640px] shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black uppercase font-mono tracking-wider text-amber-300">In development</span>
            <span className="bg-[#2a2d3e] text-xs font-bold text-white px-2 py-0.5 rounded font-mono">
              {bugs.filter(b => b.status === 'IN PROGRESS').length}
            </span>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[560px] pr-1.5 custom-scrollbar">
            {bugs.filter(b => b.status === 'IN PROGRESS').map((item) => (
              <div
                key={item.id}
                className="bg-[#1a1f32] p-3 rounded-lg border border-[#2a2d3e]/70 space-y-2 hover:border-[#b8c3ff]/40 transition-colors cursor-pointer"
                onClick={() => setSelectedBugId(item.id)}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-amber-300 font-bold font-mono">{item.id}</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider font-mono bg-blue-950/40 text-blue-300">{item.severity}</span>
                </div>
                <h4 className="text-xs font-bold text-[#dee1fd] leading-snug line-clamp-2 hover:underline">{item.title}</h4>
                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-[9px] text-[#8e90a0]">{item.assignedTo || 'Unassigned'}</span>
                  {isDeveloper && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setStatusChangeBugId(item.id); }}
                      className="bg-[#294fdb] hover:bg-blue-600 text-white text-[9px] font-bold px-2 py-1 rounded transition-all"
                    >
                      Update Status &gt;
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TESTING Column */}
        <div className="bg-[#161a2e] border border-[#2a2d3e] rounded-xl p-4 flex flex-col max-h-[640px] shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black uppercase font-mono tracking-wider text-purple-300">QA / Verification</span>
            <span className="bg-[#2a2d3e] text-xs font-bold text-white px-2 py-0.5 rounded font-mono">
              {bugs.filter(b => b.status === 'TESTING').length}
            </span>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[560px] pr-1.5 custom-scrollbar">
            {bugs.filter(b => b.status === 'TESTING').map((item) => (
              <div
                key={item.id}
                className="bg-[#1a1f32] p-3 rounded-lg border border-[#2a2d3e]/70 space-y-2 hover:border-[#b8c3ff]/40 transition-colors cursor-pointer"
                onClick={() => setSelectedBugId(item.id)}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-purple-300 font-bold font-mono">{item.id}</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider font-mono bg-zinc-800 text-zinc-300">{item.severity}</span>
                </div>
                <h4 className="text-xs font-bold text-[#dee1fd] leading-snug line-clamp-2 hover:underline">{item.title}</h4>
                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-[9px] text-[#8e90a0]">Testing...</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RESOLVED Column */}
        <div className="bg-[#161a2e] border border-[#2a2d3e] rounded-xl p-4 flex flex-col max-h-[640px] shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black uppercase font-mono tracking-wider text-emerald-300">Resolved / Closed</span>
            <span className="bg-[#2a2d3e] text-xs font-bold text-white px-2 py-0.5 rounded font-mono">
              {bugs.filter(b => b.status === 'RESOLVED' || b.status === 'CLOSED').length}
            </span>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[560px] pr-1.5 custom-scrollbar">
            {bugs.filter(b => b.status === 'RESOLVED' || b.status === 'CLOSED').map((item) => (
              <div
                key={item.id}
                className="bg-[#1a1f32]/65 p-3 rounded-lg border border-[#2a2d3e]/30 space-y-2 grayscale cursor-pointer"
                onClick={() => setSelectedBugId(item.id)}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-emerald-300 font-mono italic">{item.id}</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider font-mono bg-emerald-950/20 text-emerald-300">Complete</span>
                </div>
                <h4 className="text-xs font-bold text-[#dee1fd]/60 leading-snug line-clamp-2 hover:underline">{item.title}</h4>
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-emerald-300 font-mono font-bold flex items-center gap-1 leading-none">
                    <CheckCircle className="w-3 h-3" />
                    <span>Cleared QA specs</span>
                  </p>
                  {isTester && item.status === 'RESOLVED' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setReopenBugId(item.id); }}
                      className="bg-[#93000a] hover:bg-rose-700 text-white text-[9px] font-bold px-2 py-1 rounded transition-all"
                    >
                      Reopen &gt;
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
