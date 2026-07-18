import React, { useState } from 'react';
import { ArrowLeft, Edit3, X, CheckCircle, AlertCircle, Database, Calendar, History, Download, Send, User as UserIcon } from 'lucide-react';
import { Bug, Severity } from '../types';
import { useAppContext } from '../context/AppContext';
import { addComment } from '../api';

interface BugDetailModalProps {
  bug: Bug | null;
  userRole: 'QA Lead' | 'Sr. Developer';
  onClose: () => void;
  onEdit: (bugId: string) => void;
}

export default function BugDetailModal({ bug, userRole, onClose, onEdit }: BugDetailModalProps) {
  const { resolveModuleName, resolveEmployeeName, refetchBugs, isLoadingBugDetail } = useAppContext();
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState('');
  const [localComments, setLocalComments] = useState<Bug['comments']>(bug?.comments || []);

  // Keep the local comment thread in sync if a different bug is opened, or
  // once the full-detail fetch (GET /bugs/{id}) resolves and populates comments.
  React.useEffect(() => {
    setLocalComments(bug?.comments || []);
  }, [bug?.id, bug?.comments?.length]);

  if (!bug) return null;
  const isTester = userRole === 'QA Lead';

  const getSeverityLabel = (sev: Severity) => ({ CRITICAL: 'Critical', MAJOR: 'Major', MINOR: 'Minor', TRIVIAL: 'Trivial' }[sev]);

  const handlePostComment = async () => {
    if (!newComment.trim() || isPosting) return;
    setIsPosting(true);
    setPostError('');
    try {
      const saved = await addComment(bug.id, newComment.trim());
      setLocalComments(prev => [...prev, {
        id: saved.commentId,
        authorName: saved.authorName,
        authorAvatar: '',
        authorRole: saved.authorRole,
        content: saved.content,
        timestamp: saved.createdAt,
      }]);
      setNewComment('');
      refetchBugs();
    } catch (err: any) {
      // Show the backend's message directly.
      setPostError(err.message || 'Failed to add comment.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1f32] border border-[#2a2d3e] w-full max-w-5xl h-full max-h-[850px] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="bg-[#161a2e] border-b border-[#2a2d3e] px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="flex items-center gap-1.5 text-xs text-[#8e90a0] hover:text-[#b8c3ff] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to List</span>
            </button>
            <div className="h-4 w-px bg-[#2a2d3e]" />
            <div className="flex items-center gap-3">
              <span className="font-mono text-base font-black text-[#b8c3ff] tracking-tight">{bug.id}</span>
              <div className="flex gap-1.5">
                <span className="bg-[#93000a]/30 text-rose-200 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider font-mono border border-[#93000a]/50">
                  {getSeverityLabel(bug.severity)}
                </span>
                <span className="bg-amber-950/40 text-amber-300 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider font-mono border border-amber-800/40">
                  {bug.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Edit button — TESTER ONLY */}
            {isTester && (
              <button
                onClick={() => { onClose(); onEdit(bug.id); }}
                className="flex items-center gap-1 bg-[#1a1f32] border border-[#2a2d3e] hover:bg-[#2f3449] text-xs font-sans font-bold text-[#dee1fd] px-3 py-1.5 rounded transition-all"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#b8c3ff]" />
                <span>Edit</span>
              </button>
            )}
            <button onClick={onClose} className="p-1.5 hover:bg-red-950/20 text-[#8e90a0] hover:text-[#ffb4ab] rounded transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
          {/* Left */}
          <div className="flex-grow lg:w-2/3 p-6 space-y-6 lg:border-r lg:border-[#2a2d3e]/40">
            <section className="space-y-2">
              <h3 className="text-xl font-bold font-sans tracking-tight text-[#dee1fd] leading-snug">{bug.title}</h3>
              {/* plain text rendering only, never dangerouslySetInnerHTML */}
              {isLoadingBugDetail && !bug.description ? (
                <p className="text-xs text-[#8e90a0] italic pt-1">Loading full details...</p>
              ) : (
                <p className="text-xs text-[#c4c5d7] leading-relaxed font-sans whitespace-pre-wrap pt-1">{bug.description}</p>
              )}
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <section className="bg-[#161a2e] p-4 rounded-lg border border-[#2a2d3e]/50">
                <h4 className="text-[#b8c3ff] font-sans font-black text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /><span>Expected Output</span>
                </h4>
                <p className="text-xs text-[#c4c5d7]/90 leading-relaxed font-sans">{bug.expectedOutput || 'Not specified.'}</p>
              </section>
              <section className="bg-[#93000a]/5 p-4 rounded-lg border border-[#93000a]/20">
                <h4 className="text-amber-400 font-sans font-black text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /><span>Actual Result</span>
                </h4>
                <p className="text-xs text-[#c4c5d7]/90 leading-relaxed font-sans">{bug.actualResult || 'Not specified.'}</p>
              </section>
            </div>

            {bug.artifacts && bug.artifacts.length > 0 && (
              <section className="space-y-3">
                <h4 className="text-[11px] font-mono font-black text-[#8e90a0] uppercase tracking-wider">Screenshots ({bug.artifacts.length})</h4>
                <div className="flex flex-wrap gap-4">
                  {bug.artifacts.map((url, i) => (
                    <div key={i} onClick={() => window.open(url, '_blank')} className="group relative cursor-pointer border border-[#2a2d3e] rounded-lg overflow-hidden w-48 aspect-video">
                      <img src={url} alt="Evidence" referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Download className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Comments — POST /bugs/{bugId}/comments */}
            <section className="space-y-3 pt-2 border-t border-[#2a2d3e]/50">
              <h4 className="text-[11px] font-mono font-black text-[#8e90a0] uppercase tracking-wider">
                Comments ({localComments.length})
              </h4>
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                {localComments.length === 0 ? (
                  <p className="text-xs text-[#8e90a0] italic">No comments yet.</p>
                ) : (
                  localComments.map((c) => (
                    <div key={c.id} className="flex gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#2f3449] border border-[#2a2d3e] flex items-center justify-center shrink-0">
                        <UserIcon className="w-3.5 h-3.5 text-[#8e90a0]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs font-bold text-[#dee1fd] font-sans">{c.authorName}</span>
                          <span className="text-[9px] text-[#8e90a0] font-mono">{c.timestamp}</span>
                        </div>
                        <div className="bg-[#161a2e] p-2.5 rounded-lg rounded-tl-none border border-[#2a2d3e]/60 mt-1">
                          <p className="text-xs text-[#c4c5d7] font-sans leading-normal whitespace-pre-wrap">{c.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <textarea
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-[#161a2e] border border-[#2a2d3e] text-xs text-[#dee1fd] rounded-lg px-3 py-2 outline-none focus:border-[#b8c3ff] transition-all resize-none placeholder:text-[#8e90a0]/50"
                />
                <button
                  type="button"
                  disabled={!newComment.trim() || isPosting}
                  onClick={handlePostComment}
                  className="bg-[#294fdb] hover:bg-[#4a6cf7] disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 rounded-lg transition-all self-stretch flex items-center justify-center"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              {postError && <p className="text-[10px] text-rose-300">{postError}</p>}
            </section>
          </div>

          {/* Right */}
          <div className="lg:w-1/3 bg-[#161a2e]/45 p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider block mb-1">Module</span>
                <span className="text-xs font-bold font-sans text-[#dee1fd]">{resolveModuleName(bug.projectId, bug.module)}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider block mb-1">Assigned To</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-sans text-[#dee1fd]">{bug.assignedTo ? resolveEmployeeName(bug.assignedTo) : 'Unassigned'}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider block mb-1">Environment</span>
                <div className="flex items-center gap-1.5 text-xs text-[#dee1fd]">
                  <Database className="w-3.5 h-3.5 text-[#8e90a0]" /><span>{bug.environment}</span>
                </div>
              </div>
              {bug.dueDate && (
                <div>
                  <span className="text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider block mb-1">Due Date</span>
                  <div className="flex items-center gap-1.5 text-xs text-red-300">
                    <Calendar className="w-3.5 h-3.5" /><span>{bug.dueDate}</span>
                  </div>
                </div>
              )}
              <div>
                <span className="text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider block mb-1">Reported By</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-sans text-[#dee1fd]">{resolveEmployeeName(bug.reportedBy)}</span>
                </div>
              </div>
              <div className="flex justify-between text-xs font-sans text-[#8e90a0]">
                <span>Created:</span><span className="text-[#dee1fd]">{bug.createdDate}</span>
              </div>
              <div className="flex justify-between text-xs font-sans text-[#8e90a0]">
                <span>Updated:</span><span className="text-[#dee1fd]">{bug.updatedDate}</span>
              </div>
            </div>

            <section className="space-y-4 pt-4 border-t border-[#2a2d3e]/50">
              <h4 className="text-[11px] font-mono font-bold text-[#8e90a0] uppercase tracking-wide flex items-center gap-1">
                <History className="w-[14px] h-[14px]" /><span>Activity Timeline</span>
              </h4>
              <div className="relative pl-4 border-l border-[#2a2d3e]/65 space-y-5">
                {bug.activityTimeline && bug.activityTimeline.length > 0 ? (
                  bug.activityTimeline.map((log) => (
                    <div key={log.id} className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#b8c3ff] border-2 border-[#1a1f32]"></div>
                      <p className="text-xs text-[#dee1fd] font-medium leading-normal">{log.message}</p>
                      <span className="text-[9px] text-[#8e90a0] font-mono block mt-0.5">{log.timestamp}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#8e90a0] italic">No activity recorded yet.</p>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#161a2e] border-t border-[#2a2d3e] px-6 py-4 flex justify-end shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-xs font-sans font-bold text-[#b8c3ff] hover:bg-[#2f3449] border border-[#2a2d3e] rounded-lg transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
