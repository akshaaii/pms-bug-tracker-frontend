import React from 'react';

/**
 * Reports page. Shows SLA performance metrics and heap diagnostics.
 */
export default function ReportsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200 uppercase select-none font-mono text-xs">
      <div>
        <h2 className="text-xl font-bold font-sans tracking-tight text-[#dee1fd] normal-case">System performance SLA reports</h2>
        <p className="text-xs text-[#8e90a0] font-sans mt-0.5 normal-case">SLA guarantees, mean time to resolve (MTTR), heap analytics, and thread monitors.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

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

        {/* VRAM Heap Diagnostics */}
        <div className="bg-[#161a2e] p-5 rounded-xl border border-[#2a2d3e] space-y-4 shadow-lg text-left">
          <h3 className="text-sm font-bold text-[#dee1fd] tracking-tight normal-case">VRAM Heap &amp; Leak Containment</h3>
          <p className="text-xs text-[#8e90a0] font-sans normal-case">Diagnostic verification on physics threads allocators.</p>

          <div className="bg-[#0d1226]/85 border border-[#2a2d3e] p-4 rounded space-y-1.5">
            <p className="text-emerald-400 font-bold">&gt; Vulkan deallocation check: OK</p>
            <p className="text-emerald-400 font-bold">&gt; Vertex data buffer handles flushed: 14/14</p>
            <p className="text-amber-400 font-bold">&gt; Thread registers lock callbacks: WAITING_CLEANUP_SIGNAL</p>
            <p className="text-[#8e90a0]">&gt; Heap allocation bound limits: 512MB / 12288MB (VRAM stable)</p>
          </div>
        </div>

      </div>
    </div>
  );
}
