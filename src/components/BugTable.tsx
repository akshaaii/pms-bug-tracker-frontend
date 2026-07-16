import React, { useState } from 'react';
import { MoreVertical, Eye, Edit3, RotateCcw, RefreshCw, UserPlus, Info, User as UserIcon } from 'lucide-react';
import { Bug, Severity, Priority, BugStatus } from '../types';
import { useAppContext } from '../context/AppContext';

interface BugTableProps {
  bugs: Bug[];
  userRole: 'QA Lead' | 'Sr. Developer';
  onViewBug: (bugId: string) => void;
  onEditBug: (bugId: string) => void;
  onReopenBug: (bugId: string) => void;
  onChangeStatus: (bugId: string) => void;
  onReassignBug: (bugId: string) => void;
}

export default function BugTable({
  bugs,
  userRole,
  onViewBug,
  onEditBug,
  onReopenBug,
  onChangeStatus,
  onReassignBug,
}: BugTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const { resolveModuleName, resolveEmployeeName } = useAppContext();

  const isTester = userRole === 'QA Lead';
  const isDeveloper = userRole === 'Sr. Developer';

  const getSeverityBadge = (sev: Severity) => {
    switch (sev) {
      case 'CRITICAL': return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider font-mono bg-[#93000a]/30 text-red-200 border border-[#93000a]/60">Critical</span>;
      case 'MAJOR': return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider font-mono bg-[#e37020]/20 text-[#ffb68e] border border-[#e37020]/45">Major</span>;
      case 'MINOR': return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider font-mono bg-blue-950/40 text-blue-300 border border-blue-800/40">Minor</span>;
      case 'TRIVIAL': return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">Trivial</span>;
    }
  };

  const getPriorityElement = (priority: Priority) => {
    switch (priority) {
      case 'HIGH': return <div className="flex items-center gap-1.5 text-red-400 text-xs font-semibold"><span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse shrink-0"></span><span>High</span></div>;
      case 'MEDIUM': return <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold"><span className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0"></span><span>Medium</span></div>;
      case 'LOW': return <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0"></span><span>Low</span></div>;
    }
  };

  const getStatusBadge = (status: BugStatus) => {
    const base = "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-sans tracking-wide border ";
    const map: Record<string, string> = {
      'OPEN': 'bg-blue-950/45 text-[#b8c3ff] border-blue-800/40',
      'ASSIGNED': 'bg-amber-950/45 text-amber-300 border-amber-800/40',
      'IN PROGRESS': 'bg-amber-950/45 text-amber-300 border-amber-800/40',
      'READY FOR TESTING': 'bg-purple-950/45 text-purple-300 border-purple-800/40',
      'TESTING': 'bg-teal-950/45 text-teal-300 border-teal-800/40',
      'RESOLVED': 'bg-emerald-950/45 text-emerald-300 border-emerald-800/40',
      'CLOSED': 'bg-zinc-900 text-zinc-400 border-zinc-700/60',
      'REOPENED': 'bg-[#93000a]/20 text-red-300 border-[#93000a]/40',
      'REOPENED - IN PROGRESS': 'bg-[#93000a]/20 text-red-300 border-[#93000a]/40',
      'REOPENED - READY FOR TESTING': 'bg-[#93000a]/20 text-red-300 border-[#93000a]/40',
      'REOPENED - TESTING': 'bg-[#93000a]/20 text-red-300 border-[#93000a]/40',
      'DEFERRED': 'bg-yellow-950/40 text-yellow-300 border-yellow-800/40',
      'REJECTED/INVALID': 'bg-[#93000a]/20 text-red-300 border-[#93000a]/40',
      'DUPLICATE/ALREADY FIXED': 'bg-purple-950/45 text-purple-300 border-purple-800/40',
    };
    return <span className={base + (map[status] || 'bg-zinc-800 text-zinc-300 border-zinc-700')}>{status}</span>;
  };

  const toggleMenu = (bugId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(prev => (prev === bugId ? null : bugId));
  };

  return (
    <div className="bg-[#161a2e] border border-[#2a2d3e] rounded-xl overflow-visible shadow-2xl relative">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1a1f32] border-b border-[#2a2d3e]">
              {['Bug No','Project ID','Module','Title','Severity','Reported By','Assigned To','Priority','Status','Created Date','Updated Date','Actions'].map(h => (
                <th key={h} className="px-4 py-3.5 font-sans text-[11px] font-black text-[#8e90a0] uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2d3e]/40">
            {bugs.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-6 py-12 text-center text-[#8e90a0] text-sm">
                  <div className="flex flex-col items-center gap-2">
                    <Info className="w-8 h-8 text-[#b8c3ff]/40" />
                    <span>No bugs match the current filters.</span>
                  </div>
                </td>
              </tr>
            ) : (
              bugs.map((bug) => (
                <tr key={bug.id} onClick={() => onViewBug(bug.id)} className="hover:bg-[#1a1f32]/50 transition-colors cursor-pointer group/row">
                  <td className="px-4 py-3.5 font-semibold text-xs text-[#b8c3ff] group-hover/row:underline whitespace-nowrap">{bug.id}</td>
                  <td className="px-4 py-3.5 text-xs text-[#c4c5d7] font-mono font-bold whitespace-nowrap">{bug.projectId}</td>
                  <td className="px-4 py-3.5 text-xs text-[#c4c5d7]/85 whitespace-nowrap max-w-[150px] truncate" title={resolveModuleName(bug.projectId, bug.module)}>{resolveModuleName(bug.projectId, bug.module)}</td>
                  <td className="px-4 py-3.5 text-xs text-[#dee1fd] font-medium max-w-xs truncate" title={bug.title}>{bug.title}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">{getSeverityBadge(bug.severity)}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-[#2f3449] border border-[#2a2d3e] flex items-center justify-center">
                        <UserIcon className="w-3 h-3 text-[#8e90a0]" />
                      </div>
                      <span className="text-xs text-[#dee1fd]">{resolveEmployeeName(bug.reportedBy)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-[#2f3449] border border-[#2a2d3e] flex items-center justify-center">
                        <UserIcon className="w-3 h-3 text-[#8e90a0]" />
                      </div>
                      <span className="text-xs text-[#c4c5d7]">{bug.assignedTo ? resolveEmployeeName(bug.assignedTo) : 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">{getPriorityElement(bug.priority)}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">{getStatusBadge(bug.status)}</td>
                  <td className="px-4 py-3.5 text-xs text-[#8e90a0] whitespace-nowrap">{bug.createdDate}</td>
                  <td className="px-4 py-3.5 text-xs text-[#8e90a0] whitespace-nowrap">{bug.updatedDate}</td>

                  {/* Actions Column */}
                  <td className="px-4 py-3.5 text-right whitespace-nowrap relative overflow-visible">
                    <button
                      onClick={(e) => toggleMenu(bug.id, e)}
                      className="p-1 text-[#8e90a0] hover:text-[#b8c3ff] hover:bg-[#1a1f32] rounded transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openMenuId === bug.id && (
                      <div className="absolute right-4 mt-1 w-48 bg-[#1a1f32] border border-[#2a2d3e] rounded-lg shadow-2xl z-50 py-1 text-left animate-in fade-in duration-200">

                        {/* VIEW — both roles */}
                        <button
                          onClick={(e) => { e.stopPropagation(); onViewBug(bug.id); setOpenMenuId(null); }}
                          className="w-full px-3 py-2 text-xs text-[#dee1fd] hover:bg-[#2f3449] transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#b8c3ff]" />
                          <span>View Details</span>
                        </button>

                        {/* EDIT — tester only */}
                        {isTester && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onEditBug(bug.id); setOpenMenuId(null); }}
                            className="w-full px-3 py-2 text-xs text-[#dee1fd] hover:bg-[#2f3449] transition-colors flex items-center gap-2"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                            <span>Edit Bug</span>
                          </button>
                        )}

                        {/* REOPEN — tester only, only when RESOLVED */}
                        {isTester && bug.status === 'RESOLVED' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onReopenBug(bug.id); setOpenMenuId(null); }}
                            className="w-full px-3 py-2 text-xs text-[#dee1fd] hover:bg-[#2f3449] transition-colors flex items-center gap-2"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-rose-300" />
                            <span>Reopen Bug</span>
                          </button>
                        )}

                        {/* CHANGE STATUS — developer only */}
                        {isDeveloper && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onChangeStatus(bug.id); setOpenMenuId(null); }}
                            className="w-full px-3 py-2 text-xs text-[#dee1fd] hover:bg-[#2f3449] transition-colors flex items-center gap-2"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-teal-300" />
                            <span>Change Status</span>
                          </button>
                        )}

                        {/* REASSIGN — developer only */}
                        {isDeveloper && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onReassignBug(bug.id); setOpenMenuId(null); }}
                            className="w-full px-3 py-2 text-xs text-[#dee1fd] hover:bg-[#2f3449] transition-colors flex items-center gap-2"
                          >
                            <UserPlus className="w-3.5 h-3.5 text-blue-300" />
                            <span>Reassign Bug</span>
                          </button>
                        )}

                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
