import React from 'react';
import { ArrowRight, Mail, User as UserIcon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

/**
 * Team roster page.
 * Shows workload cards for real Sr. Developers (from GET /resources/developers)
 * and a shortcut to filter the Bugs page by that developer's employeeId.
 */
export default function TeamPage() {
  const { bugs, developers, setFilters } = useAppContext();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold font-sans tracking-tight text-[#dee1fd]">Engineering Workloads &amp; Roster</h2>
        <p className="text-xs text-[#8e90a0] font-sans mt-0.5">Review developer workloads, assigned tickets, and system health status indices.</p>
      </div>

      {developers.length === 0 ? (
        <div className="bg-[#161a2e] border border-[#2a2d3e] rounded-xl p-8 text-center text-xs text-[#8e90a0]">
          Loading developer roster...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 select-none">
          {developers.map((dev) => {
            const activeAssignedCount = bugs.filter(b => b.assignedTo === dev.employeeId && b.status !== 'CLOSED').length;
            const healthStatus = activeAssignedCount > 3 ? 'OVERLOADED' : activeAssignedCount > 0 ? 'STABLE' : 'AVAILABLE';
            const healthColor =
              healthStatus === 'OVERLOADED'
                ? 'text-rose-400 bg-red-950/30 border border-red-800'
                : healthStatus === 'STABLE'
                ? 'text-amber-300 bg-amber-950/20 border border-amber-800/40'
                : 'text-emerald-400 bg-emerald-950/30 border border-emerald-800/40';

            return (
              <div key={dev.employeeId} className="bg-[#161a2e] border border-[#2a2d3e] p-5 rounded-xl shadow-lg relative">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#2f3449] border border-[#294fdb]/50 flex items-center justify-center shrink-0">
                    <UserIcon className="w-6 h-6 text-[#8e90a0]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold font-sans text-[#dee1fd]">{dev.fullName}</h3>
                    <p className="text-[11px] font-mono font-black text-[#8e90a0] uppercase tracking-wider leading-none mt-0.5">{dev.role}</p>
                    <p className="text-xs text-[#c4c5d7] pt-1 font-sans flex items-center gap-1">
                      <Mail className="w-3 h-3 text-[#8e90a0]" />
                      <span>{dev.employeeId}</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 mt-4 border-t border-[#2a2d3e]/55 text-xs">
                  <div>
                    <span className="block text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider">Active bugs</span>
                    <span className="text-lg font-black block text-[#dee1fd] mt-0.5">{activeAssignedCount} tickets</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider">Capacity status</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold mt-1.5 block text-center font-mono uppercase tracking-wide ${healthColor}`}>
                      {healthStatus}
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setFilters({
                        projectId: 'All Projects',
                        module: 'All Modules',
                        status: 'All Statuses',
                        priority: 'All Priorities',
                        severity: 'All Severities',
                        assignedTo: dev.employeeId,
                      });
                      navigate('/bugs');
                    }}
                    className="text-xs font-sans text-[#b8c3ff] hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Manage assigned tickets</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
