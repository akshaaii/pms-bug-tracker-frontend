import React, { useState } from 'react';
import { X, RefreshCw, UserPlus, ArrowRightCircle } from 'lucide-react';
import { Bug, BugStatus, User } from '../types';
import { useAppContext } from '../context/AppContext';
import { getAvailableStatusOptions } from '../statusWorkflow';

// ─────────────────────────────────────────────────────────────────────────────
// Change Status Modal
// ─────────────────────────────────────────────────────────────────────────────

interface ChangeStatusModalProps {
  bug: Bug | null;
  currentUser: User;
  onClose: () => void;
  onConfirmStatus: (bugId: string, newStatus: BugStatus, comment: string) => Promise<void>;
}

export function ChangeStatusModal({ bug, currentUser, onClose, onConfirmStatus }: ChangeStatusModalProps) {
  const options = bug ? getAvailableStatusOptions(bug.status, currentUser.role) : [];
  const [status, setStatus] = useState<BugStatus | ''>(options[0] || '');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!bug) return null;

  // Reset the selected status whenever a different bug opens this modal.
  React.useEffect(() => {
    setStatus(options[0] || '');
    setComment('');
    setSubmitError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bug.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Rule 4: comment is mandatory, submit stays disabled until filled.
    if (!status || !comment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');
    try {
      await onConfirmStatus(bug.id, status, comment.trim());
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to update status.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1f32] border border-[#2a2d3e] w-full max-w-lg rounded-xl overflow-hidden shadow-2xl flex flex-col select-none animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="bg-[#161a2e] border-b border-[#2a2d3e] px-5 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-[#b8c3ff]">
            <RefreshCw className="w-5 h-5" />
            <h3 className="font-bold font-sans text-sm text-[#dee1fd]">Change Status: {bug.id}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-red-950/25 rounded-full text-[#8e90a0] hover:text-[#ffb4ab] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-[#c4c5d7]/90 leading-relaxed font-sans">
            Current status: <span className="font-bold font-mono text-amber-300">{bug.status}</span>
          </p>

          {options.length === 0 ? (
            <div className="bg-amber-950/20 border border-amber-800/30 rounded-lg px-3 py-2.5">
              <p className="text-xs text-amber-300 font-sans">There's no valid next status you can set for this bug from its current state.</p>
            </div>
          ) : (
            <>
              {/* New Status — filtered to valid transitions AND role-allowed statuses (rules 2 & 3) */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider">New Status*</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as BugStatus)}
                  className="w-full bg-[#161a2e] border border-[#2a2d3e] text-xs text-[#dee1fd] rounded-lg p-2.5 outline-none focus:border-[#b8c3ff] transition-all font-sans"
                >
                  {options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Comment — mandatory (rule 4) */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider">Comment*</label>
                <textarea
                  rows={3}
                  placeholder="Explain the reason for this status change..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-[#161a2e] border border-[#2a2d3e] text-xs text-white placeholder-[#8e90a0]/50 rounded-lg p-2.5 outline-none focus:border-[#b8c3ff] transition-all resize-none font-sans"
                  required
                />
              </div>
            </>
          )}

          {submitError && (
            <div className="bg-rose-950/30 border border-rose-800/40 rounded-lg px-3 py-2">
              <p className="text-[11px] text-rose-300 font-sans">{submitError}</p>
            </div>
          )}

          <div className="pt-4 border-t border-[#2a2d3e]/50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-sans font-bold text-[#dee1fd] border border-[#2a2d3e] rounded-lg hover:bg-[#161a2e] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={options.length === 0 || !status || !comment.trim() || isSubmitting}
              className="px-5 py-2 text-xs font-sans font-bold bg-[#294fdb] text-white hover:bg-[#4a6cf7] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center gap-1.5 active:scale-95 shadow-md shadow-[#294fdb]/20 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Updating...' : 'Confirm Status Change'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Reassign Bug Modal
// ─────────────────────────────────────────────────────────────────────────────

interface ReassignBugModalProps {
  bug: Bug | null;
  currentUser: User;
  onClose: () => void;
  onConfirmReassign: (bugId: string, newAssigneeId: string, comment?: string) => Promise<void>;
}

export function ReassignBugModal({ bug, currentUser, onClose, onConfirmReassign }: ReassignBugModalProps) {
  const { developers } = useAppContext();

  // Rule 13: never allow reassigning to yourself, and only ever to another
  // Sr. Developer — both enforced here in addition to the backend check.
  const eligibleDevelopers = developers.filter(d => d.employeeId !== currentUser.employeeId);

  const [newAssigneeId, setNewAssigneeId] = useState(eligibleDevelopers[0]?.employeeId || '');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!bug) return null;

  React.useEffect(() => {
    setNewAssigneeId(eligibleDevelopers[0]?.employeeId || '');
    setComment('');
    setSubmitError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bug.id, developers.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssigneeId || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');
    try {
      await onConfirmReassign(bug.id, newAssigneeId, comment.trim() || undefined);
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to reassign bug.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1f32] border border-[#2a2d3e] w-full max-w-lg rounded-xl overflow-hidden shadow-2xl flex flex-col select-none animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="bg-[#161a2e] border-b border-[#2a2d3e] px-5 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-[#b8c3ff]">
            <UserPlus className="w-5 h-5" />
            <h3 className="font-bold font-sans text-sm text-[#dee1fd]">Reassign Bug: {bug.id}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-red-950/25 rounded-full text-[#8e90a0] hover:text-[#ffb4ab] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-[#c4c5d7]/90 leading-relaxed font-sans flex items-center gap-1.5">
            <ArrowRightCircle className="w-3.5 h-3.5 text-[#8e90a0]" />
            <span>Reassigning from yourself to another Sr. Developer.</span>
          </p>

          {/* Assignee — real developer list from GET /resources/developers, self excluded (rule 13) */}
          <div className="space-y-1">
            <label className="block text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider">New Assignee*</label>
            {eligibleDevelopers.length === 0 ? (
              <p className="text-xs text-amber-300">No other Sr. Developers are available to reassign to.</p>
            ) : (
              <select
                value={newAssigneeId}
                onChange={(e) => setNewAssigneeId(e.target.value)}
                className="w-full bg-[#161a2e] border border-[#2a2d3e] text-xs text-[#dee1fd] rounded-lg p-2.5 outline-none focus:border-[#b8c3ff] transition-all font-sans"
              >
                {eligibleDevelopers.map((dev) => (
                  <option key={dev.employeeId} value={dev.employeeId}>{dev.fullName}</option>
                ))}
              </select>
            )}
          </div>

          {/* Optional handoff note */}
          <div className="space-y-1">
            <label className="block text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider">Note (optional)</label>
            <textarea
              rows={2}
              placeholder="Any context for the new assignee..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-[#161a2e] border border-[#2a2d3e] text-xs text-white placeholder-[#8e90a0]/50 rounded-lg p-2.5 outline-none focus:border-[#b8c3ff] transition-all resize-none font-sans"
            />
          </div>

          {submitError && (
            <div className="bg-rose-950/30 border border-rose-800/40 rounded-lg px-3 py-2">
              <p className="text-[11px] text-rose-300 font-sans">{submitError}</p>
            </div>
          )}

          <div className="pt-4 border-t border-[#2a2d3e]/50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-sans font-bold text-[#dee1fd] border border-[#2a2d3e] rounded-lg hover:bg-[#161a2e] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newAssigneeId || eligibleDevelopers.length === 0 || isSubmitting}
              className="px-5 py-2 text-xs font-sans font-bold bg-[#294fdb] text-white hover:bg-[#4a6cf7] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center gap-1.5 active:scale-95 shadow-md shadow-[#294fdb]/20 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Reassigning...' : 'Confirm Reassignment'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
