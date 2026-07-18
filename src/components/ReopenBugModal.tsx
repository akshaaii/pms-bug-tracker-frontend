import React, { useState } from 'react';
import { X, RotateCcw, AlertOctagon, Upload, Check } from 'lucide-react';
import { Bug } from '../types';
import { validateScreenshotFile } from '../api';

interface ReopenBugModalProps {
  bug: Bug | null;
  onClose: () => void;
  onConfirmReopen: (bugId: string, reason: string, comment: string, screenshotFile?: File | null) => Promise<void>;
}

const REOPEN_REASONS = [
  'Failure still persists on staging',
  'Regression detected in downstream modules',
  'Partial resolution only (edge cases remaining)',
  'Incorrect fix application in production package',
  'Code review inspection rejection',
];

export default function ReopenBugModal({ bug, onClose, onConfirmReopen }: ReopenBugModalProps) {
  const [reason, setReason] = useState(REOPEN_REASONS[0]);
  const [comment, setComment] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!bug) return null;

  // Reopen is only ever valid from RESOLVED. AppShell only opens
  // this modal via the ⋮ menu item that's itself gated on this, but we
  // double-check here too so a stale bug reference can't slip through.
  if (bug.status !== 'RESOLVED') {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#1a1f32] border border-[#2a2d3e] w-full max-w-md rounded-xl p-6 space-y-3 text-center">
          <p className="text-xs text-[#c4c5d7]">This bug is no longer in RESOLVED status and can't be reopened. Refresh the list to see its current status.</p>
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-[#dee1fd] border border-[#2a2d3e] rounded-lg hover:bg-[#161a2e]">Close</button>
        </div>
      </div>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    // Validate type/size before ever touching the API.
    const error = validateScreenshotFile(selected);
    if (error) {
      setFileError(error);
      setFile(null);
      return;
    }
    setFileError('');
    setFile(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || isSubmitting) return;

    // Disable immediately, only re-enable on error.
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await onConfirmReopen(bug.id, reason, comment.trim(), file);
      onClose();
    } catch (err: any) {
      // Show the backend's message directly - including 409
      // CONCURRENT_EDIT_CONFLICT and DUPLICATE_SUBMISSION cases.
      setSubmitError(err.message || 'Failed to reopen bug.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1f32] border border-[#2a2d3e] w-full max-w-lg rounded-xl overflow-hidden shadow-2xl flex flex-col select-none animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="bg-[#161a2e] border-b border-[#2a2d3e] px-5 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertOctagon className="w-5 h-5" />
            <h3 className="font-bold font-sans text-sm text-[#dee1fd]">Reopen Bug Report: {bug.id}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-red-950/25 rounded-full text-[#8e90a0] hover:text-[#ffb4ab] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-[#c4c5d7]/90 leading-relaxed font-sans">
            You are changing status of <strong>{bug.id}</strong> back to <span className="text-rose-400 font-bold font-mono">REOPENED</span>. This triggers urgent alerts to the assigned developer: <strong>{bug.assignedTo || 'Lead Developer'}</strong>.
          </p>

          {/* Reopen Reason */}
          <div className="space-y-1">
            <label className="block text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider">Reopen Reason*</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#161a2e] border border-[#2a2d3e] text-xs text-[#dee1fd] rounded-lg p-2.5 outline-none focus:border-red-400 transition-all font-sans"
            >
              {REOPEN_REASONS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          {/* Tester Comment - mandatory */}
          <div className="space-y-1">
            <label className="block text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider">Tester Comment & Log Description*</label>
            <textarea
              rows={3}
              placeholder="Provide a detailed log explaining precisely which test suite failed, or describe the regression steps..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-[#161a2e] border border-[#2a2d3e] text-xs text-white placeholder-[#8e90a0]/50 rounded-lg p-2.5 outline-none focus:border-red-400 transition-all resize-none font-sans"
              required
            />
          </div>

          {/* Screenshot upload — real file input, validated client-side */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider">Attached Proof (Screenshot)</label>
            <label
              htmlFor="reopen-file-input"
              className="border-2 border-dashed border-[#2a2d3e] hover:border-red-400/50 bg-[#161a2e]/50 rounded-lg p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors group"
            >
              <input
                id="reopen-file-input"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
              {file ? (
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold font-sans">
                  <Check className="w-4 h-4" />
                  <span>{file.name} attached</span>
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-[#8e90a0] group-hover:text-red-400/70 transition-colors" />
                  <p className="text-[11px] text-[#c4c5d7] font-sans">Click to attach a JPG, PNG, or PDF (max 5MB)</p>
                </>
              )}
            </label>
            {fileError && <p className="text-[10px] text-rose-300">{fileError}</p>}
          </div>

          {submitError && (
            <div className="bg-rose-950/30 border border-rose-800/40 rounded-lg px-3 py-2">
              <p className="text-[11px] text-rose-300 font-sans">{submitError}</p>
            </div>
          )}

          {/* Actions */}
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
              id="reopen-submit-bin"
              disabled={!comment.trim() || isSubmitting}
              className="px-5 py-2 text-xs font-sans font-bold bg-[#93000a] text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center gap-1.5 active:scale-95 shadow-md shadow-[#93000a]/20 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Reopening...' : 'Confirm & Reopen Bug'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
