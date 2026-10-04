import React from 'react';
import { CalendarClock, CheckCircle2, Eye, Flame, Hourglass, ListTodo, PlayCircle, Wrench } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useLiveBugs } from '../hooks/useLiveBugs';
import { getAvailableStatusOptions } from '../statusWorkflow';
import { formatDateTime } from '../utils/formatDate';
import { Bug, Priority, Severity } from '../types';

/**
 * "Pending Tasks" page for developers.
 * Shows ONLY the signed-in developer's own tickets - never other developers.
 *  - "To do" = tickets the developer needs to act on
 *  - "With QA" = tickets already handed to testing (nothing for the developer to do)
 */

const FINISHED = ['RESOLVED', 'CLOSED', 'REJECTED/INVALID', 'DUPLICATE/ALREADY FIXED'];
const WITH_QA = ['READY FOR TESTING', 'TESTING'];

const PRIORITY_RANK: Record<Priority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
const SEVERITY_RANK: Record<Severity, number> = { CRITICAL: 0, MAJOR: 1, MINOR: 2, TRIVIAL: 3 };

const PRIORITY_EDGE: Record<Priority, string> = {
  HIGH: 'bg-red-400',
  MEDIUM: 'bg-amber-400',
  LOW: 'bg-emerald-400',
};
const PRIORITY_TEXT: Record<Priority, string> = {
  HIGH: 'text-red-300',
  MEDIUM: 'text-amber-300',
  LOW: 'text-emerald-300',
};
const SEVERITY_STYLE: Record<Severity, string> = {
  CRITICAL: 'bg-red-950/40 text-red-300',
  MAJOR: 'bg-orange-950/40 text-orange-300',
  MINOR: 'bg-blue-950/40 text-blue-300',
  TRIVIAL: 'bg-zinc-800 text-zinc-300',
};

const byUrgency = (a: Bug, b: Bug) =>
  PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
  SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
  a.id.localeCompare(b.id);

function StatTile({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: number | string; tone: string }) {
  return (
    <div className="bg-[#161a2e] border border-[#2a2d3e] rounded-xl p-4 flex items-center gap-3 shadow-lg">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-[#1a1f32] ${tone}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-black text-[#dee1fd] leading-none">{value}</div>
        <div className="text-[10px] font-mono font-black uppercase tracking-wider text-[#8e90a0] mt-1">{label}</div>
      </div>
    </div>
  );
}

export default function DeveloperTasksView() {
  const { currentUser, setSelectedBugId, setStatusChangeBugId, resolveModuleName } = useAppContext();
  const { liveBugs, loaded } = useLiveBugs();

  const mine = liveBugs.filter(b => !b.archived && b.assignedTo === currentUser?.employeeId && !FINISHED.includes(b.status));
  const todo = mine.filter(b => !WITH_QA.includes(b.status)).sort(byUrgency);
  const withQa = mine.filter(b => WITH_QA.includes(b.status)).sort(byUrgency);
  const inProgress = todo.filter(b => b.status === 'IN PROGRESS').length;
  const highPriority = todo.filter(b => b.priority === 'HIGH').length;

  const firstName = currentUser?.fullName?.split(' ')[0] ?? '';

  const renderCard = (bug: Bug, actionable: boolean) => {
    const canChange = actionable && !!currentUser && getAvailableStatusOptions(bug.status, currentUser.role).length > 0;
    const isStart = ['ASSIGNED', 'REOPENED', 'DEFERRED'].includes(bug.status);
    return (
      <div
        key={bug.id}
        onClick={() => setSelectedBugId(bug.id)}
        className={`relative bg-[#161a2e] border border-[#2a2d3e] hover:border-[#b8c3ff]/40 rounded-xl pl-5 pr-4 py-4 shadow-lg cursor-pointer transition-colors overflow-hidden ${actionable ? '' : 'opacity-75'}`}
      >
        <span className={`absolute left-0 top-0 bottom-0 w-1 ${PRIORITY_EDGE[bug.priority]}`} />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-[11px] font-bold font-mono text-[#b8c3ff]">{bug.id}</span>
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider font-mono ${SEVERITY_STYLE[bug.severity]}`}>{bug.severity}</span>
          <span className={`text-[10px] font-mono font-bold uppercase ${PRIORITY_TEXT[bug.priority]}`}>{bug.priority} priority</span>
          <span className="ml-auto px-2 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase tracking-wide bg-[#1a1f32] border border-[#2a2d3e] text-[#c4c5d7]">{bug.status}</span>
        </div>

        <h4 className="text-sm font-bold text-[#dee1fd] mt-2 leading-snug">{bug.title}</h4>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#8e90a0]">
            <span>{resolveModuleName(bug.projectId, bug.module)}</span>
            <span className="flex items-center gap-1"><CalendarClock className="w-3 h-3" />Updated {formatDateTime(bug.updatedDate)}</span>
            {bug.dueDate && <span className="text-amber-300">Due {formatDateTime(bug.dueDate)}</span>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedBugId(bug.id); }}
              className="flex items-center gap-1 text-[11px] font-bold text-[#b8c3ff] hover:bg-white/5 px-2.5 py-1.5 rounded-md cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" /> View
            </button>
            {canChange && (
              <button
                onClick={(e) => { e.stopPropagation(); setStatusChangeBugId(bug.id); }}
                className="flex items-center gap-1 bg-[#294fdb] hover:bg-blue-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-md cursor-pointer"
              >
                {isStart ? <PlayCircle className="w-3.5 h-3.5" /> : <Wrench className="w-3.5 h-3.5" />}
                {isStart ? 'Start work' : 'Update status'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold font-sans tracking-tight text-[#dee1fd]">My pending tasks</h2>
        <p className="text-xs text-[#8e90a0] font-sans mt-0.5">
          {firstName ? `${firstName}, these` : 'These'} are the bugs assigned to you, most urgent first.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 select-none">
        <StatTile icon={ListTodo} label="To do" value={loaded ? todo.length : '–'} tone="text-[#b8c3ff]" />
        <StatTile icon={PlayCircle} label="In progress" value={loaded ? inProgress : '–'} tone="text-amber-300" />
        <StatTile icon={Flame} label="High priority" value={loaded ? highPriority : '–'} tone="text-red-300" />
        <StatTile icon={Hourglass} label="With QA" value={loaded ? withQa.length : '–'} tone="text-purple-300" />
      </div>

      {!loaded ? (
        <div className="bg-[#161a2e] border border-[#2a2d3e] rounded-xl p-8 text-center text-xs text-[#8e90a0]">Loading your tasks...</div>
      ) : mine.length === 0 ? (
        <div className="bg-[#161a2e] border border-[#2a2d3e] rounded-xl p-10 text-center space-y-2">
          <CheckCircle2 className="w-9 h-9 text-emerald-400 mx-auto" />
          <p className="text-sm font-bold text-[#dee1fd]">You're all caught up</p>
          <p className="text-xs text-[#8e90a0]">No bugs are waiting on you right now. New assignments will appear here automatically.</p>
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h3 className="text-[11px] font-mono font-black uppercase tracking-wider text-[#8e90a0]">To do ({todo.length})</h3>
            {todo.length === 0
              ? <p className="text-xs text-[#8e90a0]">Nothing to do right now - everything is with QA.</p>
              : todo.map(b => renderCard(b, true))}
          </section>

          {withQa.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-[11px] font-mono font-black uppercase tracking-wider text-[#8e90a0]">Waiting on QA ({withQa.length})</h3>
              {withQa.map(b => renderCard(b, false))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
