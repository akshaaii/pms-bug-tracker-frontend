import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useLiveBugs } from '../hooks/useLiveBugs';
import { Bug, BugStatus, Severity } from '../types';

/**
 * Kanban / Task Board page.
 * Four columns: OPEN → IN DEVELOPMENT → QA / VERIFICATION → RESOLVED / CLOSED.
 *
 * The board is LIVE: it loads every bug (not just one page of the table),
 * refreshes right after you change something, and re-checks every few seconds
 * so bugs added or changed by other people show up on their own.
 *
 * Every status in the workflow belongs to exactly one column, so no bug can
 * go missing from the board.
 *
 * Status changes always go through the same modals used elsewhere in the
 * app, which collect the required comment and submit through the real
 * PATCH /bugs/{id}/status or /reopen endpoints - never a direct mutation.
 */

type ColumnKey = 'open' | 'progress' | 'verify' | 'done';

const COLUMNS: { key: ColumnKey; title: string; titleColor: string; idColor: string; statuses: BugStatus[] }[] = [
  { key: 'open',     title: 'Incoming / Open',   titleColor: 'text-[#b8c3ff]',    idColor: 'text-[#ffb4ab]',  statuses: ['OPEN', 'ASSIGNED', 'REOPENED', 'DEFERRED'] },
  { key: 'progress', title: 'In development',    titleColor: 'text-amber-300',    idColor: 'text-amber-300',  statuses: ['IN PROGRESS'] },
  { key: 'verify',   title: 'QA / Verification', titleColor: 'text-purple-300',   idColor: 'text-purple-300', statuses: ['READY FOR TESTING', 'TESTING'] },
  { key: 'done',     title: 'Resolved / Closed', titleColor: 'text-emerald-300',  idColor: 'text-emerald-300', statuses: ['RESOLVED', 'CLOSED', 'REJECTED/INVALID', 'DUPLICATE/ALREADY FIXED'] },
];

const SEVERITY_STYLE: Record<Severity, string> = {
  CRITICAL: 'bg-red-950/40 text-red-300',
  MAJOR: 'bg-orange-950/40 text-orange-300',
  MINOR: 'bg-blue-950/40 text-blue-300',
  TRIVIAL: 'bg-zinc-800 text-zinc-300',
};

export default function KanbanPage() {
  const {
    setSelectedBugId, setStatusChangeBugId, setReopenBugId, currentUser,
    resolveModuleName, resolveEmployeeName,
  } = useAppContext();
  const { liveBugs, loaded } = useLiveBugs();

  const isDeveloper = currentUser?.role === 'Sr. Developer';
  const isTester = currentUser?.role === 'QA Lead';

  // Small label shown on a card when its status is more specific than its column
  const statusNote = (bug: Bug): string | null => {
    switch (bug.status) {
      case 'ASSIGNED': return 'Assigned';
      case 'REOPENED': return 'Reopened';
      case 'DEFERRED': return 'Deferred';
      case 'READY FOR TESTING': return 'Ready for testing';
      case 'TESTING': return 'Testing';
      default: return null;
    }
  };

  const renderOpenOrActiveCard = (item: Bug, idColor: string, showDevButton: boolean) => {
    const note = statusNote(item);
    const moduleLabel = resolveModuleName(item.projectId, item.module);
    return (
      <div
        key={item.id}
        className="bg-[#1a1f32] p-3 rounded-lg border border-[#2a2d3e]/70 space-y-2 hover:border-[#b8c3ff]/40 transition-colors cursor-pointer"
        onClick={() => setSelectedBugId(item.id)}
      >
        <div className="flex justify-between items-center">
          <span className={`text-[10px] font-bold font-mono ${idColor}`}>{item.id}</span>
          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider font-mono ${SEVERITY_STYLE[item.severity] || SEVERITY_STYLE.TRIVIAL}`}>{item.severity}</span>
        </div>
        <h4 className="text-xs font-bold text-[#dee1fd] leading-snug line-clamp-2 hover:underline">{item.title}</h4>
        <div className="flex justify-between items-center pt-1.5 gap-2">
          <span className="text-[9px] text-[#8e90a0] truncate">
            {item.assignedTo ? resolveEmployeeName(item.assignedTo) : moduleLabel}
            {note && <span className="ml-1.5 text-[#b8c3ff]">· {note}</span>}
          </span>
          {showDevButton && (
            <button
              onClick={(e) => { e.stopPropagation(); setStatusChangeBugId(item.id); }}
              className="bg-[#294fdb] hover:bg-blue-600 text-white text-[9px] font-bold px-2 py-1 rounded transition-all shrink-0"
            >
              Update Status &gt;
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderDoneCard = (item: Bug) => {
    const cleared = item.status === 'RESOLVED' || item.status === 'CLOSED';
    return (
      <div
        key={item.id}
        className="bg-[#1a1f32]/65 p-3 rounded-lg border border-[#2a2d3e]/30 space-y-2 grayscale cursor-pointer"
        onClick={() => setSelectedBugId(item.id)}
      >
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-emerald-300 font-mono italic">{item.id}</span>
          <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider font-mono bg-emerald-950/20 text-emerald-300">
            {cleared ? 'Complete' : 'Closed out'}
          </span>
        </div>
        <h4 className="text-xs font-bold text-[#dee1fd]/60 leading-snug line-clamp-2 hover:underline">{item.title}</h4>
        <div className="flex justify-between items-center gap-2">
          <p className="text-[10px] text-emerald-300 font-mono font-bold flex items-center gap-1 leading-none">
            <CheckCircle className="w-3 h-3 shrink-0" />
            <span>{cleared ? 'Cleared QA specs' : item.status === 'REJECTED/INVALID' ? 'Rejected / invalid' : 'Duplicate / already fixed'}</span>
          </p>
          {isTester && item.status === 'RESOLVED' && (
            <button
              onClick={(e) => { e.stopPropagation(); setReopenBugId(item.id); }}
              className="bg-[#93000a] hover:bg-rose-700 text-white text-[9px] font-bold px-2 py-1 rounded transition-all shrink-0"
            >
              Reopen &gt;
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold font-sans tracking-tight text-[#dee1fd]">Engineering task board</h2>
        <p className="text-xs text-[#8e90a0] font-sans mt-0.5">Iterative workflow board. Click a card to view details, or use the quick action to update status. Updates automatically.</p>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start select-none">
        {COLUMNS.map((col) => {
          const items = liveBugs.filter(b => !b.archived && col.statuses.includes(b.status));
          return (
            <div key={col.key} className="bg-[#161a2e] border border-[#2a2d3e] rounded-xl p-4 flex flex-col shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <span className={`text-xs font-black uppercase font-mono tracking-wider ${col.titleColor}`}>{col.title}</span>
                <span className="bg-[#2a2d3e] text-xs font-bold text-white px-2 py-0.5 rounded font-mono">
                  {loaded ? items.length : '–'}
                </span>
              </div>
              <div className="space-y-3">
                {!loaded ? (
                  <p className="text-[11px] text-[#8e90a0] py-2">Loading...</p>
                ) : items.length === 0 ? (
                  <p className="text-[11px] text-[#8e90a0]/70 py-2 text-center">No bugs here</p>
                ) : col.key === 'done' ? (
                  items.map(renderDoneCard)
                ) : (
                  items.map(item => renderOpenOrActiveCard(item, col.idColor, isDeveloper && col.key === 'progress'))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
