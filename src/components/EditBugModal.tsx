import React, { useState, useEffect } from 'react';
import {
  X, Save, MessageSquare, Send, Monitor, User as UserIcon,
} from 'lucide-react';
import { Bug, Priority, Severity, BugStatus, Comment, ProjectModule } from '../types';
import { useAppContext, UpdateBugPayload } from '../context/AppContext';
import { addComment } from '../api';
import AuthedImage from './AuthedImage';
import { TESTER_ALLOWED_STATUSES } from '../statusWorkflow';

interface EditBugModalProps {
  bug: Bug | null;
  onClose: () => void;
  onUpdate: (bugId: string, payload: UpdateBugPayload) => Promise<Bug>;
}

export const SEVERITIES: Severity[] = ['CRITICAL', 'MAJOR', 'MINOR', 'TRIVIAL'];
export const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH'];
// Environment is a fixed 4-value enum, never free text.
export const ENVIRONMENTS = ['Development', 'SIT', 'UAT', 'Production'];
// Tester-only status options for the Edit form.
export const STATUSES: BugStatus[] = TESTER_ALLOWED_STATUSES;

export default function EditBugModal({ bug, onClose, onUpdate }: EditBugModalProps) {
  const { developers, getModulesForProject, resolveModuleName, isLoadingBugDetail } = useAppContext();

  // Form state
  const [title, setTitle] = useState(bug?.title || '');
  const [description, setDescription] = useState(bug?.description || '');
  const [expectedOutput, setExpectedOutput] = useState(bug?.expectedOutput || '');
  const [actualResult, setActualResult] = useState(bug?.actualResult || '');
  const [priority, setPriority] = useState<Priority>(bug?.priority || 'MEDIUM');
  const [severity, setSeverity] = useState<Severity>(bug?.severity || 'MINOR');
  const [status, setStatus] = useState<BugStatus>(bug?.status || 'OPEN');
  const [assignedTo, setAssignedTo] = useState(bug?.assignedTo || '');
  const [environment, setEnvironment] = useState(bug?.environment || ENVIRONMENTS[0]);
  const [moduleId, setModuleId] = useState(bug?.module || '');
  const [modules, setModules] = useState<ProjectModule[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Comments — same live thread as BugDetailModal, posted via the real API.
  const [comments, setComments] = useState<Comment[]>(bug?.comments || []);
  const [newCommentText, setNewCommentText] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  useEffect(() => {
    if (!bug) return;
    setTitle(bug.title);
    setDescription(bug.description);
    setExpectedOutput(bug.expectedOutput);
    setActualResult(bug.actualResult);
    setPriority(bug.priority);
    setSeverity(bug.severity);
    setStatus(bug.status);
    setAssignedTo(bug.assignedTo || '');
    setEnvironment(bug.environment || ENVIRONMENTS[0]);
    setModuleId(bug.module);
    setComments(bug.comments || []);
    setSubmitError('');
  }, [bug?.id, bug?.versionNum]);

  // Module dropdown loads from the project's module list.
  useEffect(() => {
    if (!bug) return;
    getModulesForProject(bug.projectId).then(setModules).catch(() => setModules([]));
  }, [bug?.projectId, getModulesForProject]);

  if (!bug) return null;

  const handleAddComment = async () => {
    if (!newCommentText.trim() || isPostingComment) return;
    setIsPostingComment(true);
    try {
      const saved = await addComment(bug.id, newCommentText.trim());
      setComments(prev => [...prev, {
        id: saved.commentId,
        authorName: saved.authorName,
        authorAvatar: '',
        authorRole: saved.authorRole,
        content: saved.content,
        timestamp: saved.createdAt,
      }]);
      setNewCommentText('');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to add comment.');
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleUpdate = async () => {
    if (isSubmitting) return;
    // Disable immediately, only re-enable on error.
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await onUpdate(bug.id, {
        moduleId,
        title,
        severity,
        priority,
        status,
        environment,
        description,
        expectedOutput,
        actualResult,
        assignedToId: assignedTo || null,
        versionNum: bug.versionNum,
      });
      onClose();
    } catch (err: any) {
      // On 409 CONCURRENT_EDIT_CONFLICT, show the exact required message.
      if (err.errorCode === 'CONCURRENT_EDIT_CONFLICT') {
        setSubmitError('This bug was modified by someone else since you loaded it. Please refresh and try again.');
      } else {
        // Show the backend's message directly for everything else.
        setSubmitError(err.message || 'Failed to update bug.');
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Modal Box */}
      <div className="bg-[#1a1f32] border border-[#2a2d3e] w-full max-w-6xl h-full max-h-[900px] rounded-xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 select-none">

        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-[#161a2e] border-b border-[#2a2d3e]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#93000a]/30 text-rose-300 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider font-mono border border-[#93000a]/50">
                {bug.id}
              </span>
              <span className="text-xs text-[#8e90a0] font-sans">Project: {bug.projectId}</span>
            </div>
            <h2 className="text-lg font-bold font-sans tracking-tight text-[#dee1fd]">Edit Bug Report Parameters</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-red-950/20 text-[#8e90a0] hover:text-[#ffb4ab] rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Scroll Container */}
        <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">

          {/* Left Column Fields */}
          <div className="flex-grow lg:w-2/3 p-6 overflow-y-auto custom-scrollbar space-y-6 lg:border-r lg:border-[#2a2d3e]/40">

            {/* Title Fields */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#b8c3ff] font-sans">Bug Title Description*</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-[#161a2e] border border-[#2a2d3e] text-xs text-[#dee1fd] rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#b8c3ff] focus:border-[#b8c3ff] outline-none transition-all"
              />
            </div>

            {/* Description Textarea */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#b8c3ff] font-sans">Steps to Reproduce & Context*</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full bg-[#161a2e] border border-[#2a2d3e] text-xs text-[#dee1fd] rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#b8c3ff] focus:border-[#b8c3ff] outline-none transition-all resize-none"
              />
            </div>

            {/* Expected Output */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#b8c3ff] font-sans">Expected Output Behavior</label>
              <textarea
                rows={2}
                value={expectedOutput}
                onChange={(e) => setExpectedOutput(e.target.value)}
                className="w-full bg-[#161a2e] border border-[#2a2d3e] text-xs text-[#dee1fd] rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#b8c3ff] focus:border-[#b8c3ff] outline-none transition-all resize-none"
              />
            </div>

            {/* Actual Result */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#b8c3ff] font-sans">Actual Result*</label>
              <textarea
                rows={2}
                value={actualResult}
                onChange={(e) => setActualResult(e.target.value)}
                required
                className="w-full bg-[#161a2e] border border-[#2a2d3e] text-xs text-[#dee1fd] rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#b8c3ff] focus:border-[#b8c3ff] outline-none transition-all resize-none"
              />
            </div>

            {/* Screenshots Display (read-only here — upload lives on Report/Reopen flows) */}
            {bug.artifacts && bug.artifacts.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#b8c3ff] font-sans">Evidence & Image Assets</label>
                <div className="grid grid-cols-3 gap-3">
                  {bug.artifacts.map((url, i) => (
                    <div key={i} className="relative rounded-lg overflow-hidden border border-[#2a2d3e] aspect-video">
                      <AuthedImage src={url} alt="Attachment" className="w-full h-full object-cover grayscale" />
                      <div className="absolute inset-0 bg-[#0d1226]/40 flex items-center justify-center">
                        <span className="text-[10px] text-[#dee1fd] bg-[#1a1f32]/85 px-2 py-0.5 rounded font-mono border border-[#2a2d3e]">Asset {i + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments & Discussion Thread */}
            <div className="space-y-4 pt-4 border-t border-[#2a2d3e]/50">
              <h3 className="text-xs font-bold text-[#8e90a0] font-mono uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Comments & Discussion Thread ({comments.length})</span>
              </h3>

              <div className="space-y-4 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                {comments.length === 0 ? (
                  <p className="text-xs text-[#8e90a0] italic">No comments written yet.</p>
                ) : (
                  comments.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#2f3449] border border-[#2a2d3e] flex items-center justify-center shrink-0">
                        <UserIcon className="w-4 h-4 text-[#8e90a0]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs font-bold text-[#dee1fd] font-sans">{item.authorName}</span>
                          <span className="text-[9px] text-[#8e90a0] font-mono">{item.timestamp}</span>
                        </div>
                        <div className="bg-[#161a2e] p-2.5 rounded-lg rounded-tl-none border border-[#2a2d3e]/60 mt-1 max-w-full">
                          <p className="text-xs text-[#c4c5d7] font-sans leading-normal whitespace-pre-wrap">{item.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Compose comment input */}
              <div className="flex gap-3 pt-2">
                <div className="w-8 h-8 rounded-full bg-[#294fdb]/20 text-[#b8c3ff] font-bold text-xs flex items-center justify-center shrink-0 border border-[#294fdb]/25 font-mono">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 relative flex items-center">
                  <textarea
                    rows={1}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Write a technical response comment..."
                    className="w-full bg-[#161a2e] border border-[#2a2d3e] text-xs text-[#dee1fd] rounded-lg pl-3 pr-16 py-2.5 focus:ring-1 focus:ring-[#b8c3ff] focus:border-[#b8c3ff] outline-none transition-all resize-none placeholder:text-[#8e90a0]/65"
                  />
                  <div className="absolute right-2 flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={!newCommentText.trim() || isPostingComment}
                      onClick={handleAddComment}
                      className="bg-[#294fdb] hover:bg-[#4a6cf7] disabled:opacity-50 disabled:cursor-not-allowed text-white p-1 ml-0.5 rounded transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Parameters Sidebar */}
          <div className="lg:w-[340px] bg-[#161a2e]/45 p-6 space-y-6 overflow-y-auto custom-scrollbar shrink-0">

            {/* Module — real dropdown, sends moduleId, never the display name */}
            <div className="space-y-1">
              <label className="block text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider">Module*</label>
              <select
                id="edit-module"
                value={moduleId}
                onChange={(e) => setModuleId(e.target.value)}
                className="w-full bg-[#1a1f32] border border-[#2a2d3e] text-xs text-[#dee1fd] rounded p-2 focus:border-[#b8c3ff] outline-none transition-all font-sans font-medium"
              >
                {modules.length === 0 && <option value={moduleId}>{resolveModuleName(bug.projectId, moduleId)}</option>}
                {modules.map(m => (
                  <option key={m.moduleId} value={m.moduleId}>{m.moduleName}</option>
                ))}
              </select>
            </div>

            {/* Priority option selection */}
            <div className="space-y-1">
              <label className="block text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider">Priority Label</label>
              <select
                id="edit-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-[#1a1f32] border border-[#2a2d3e] text-xs text-[#dee1fd] rounded p-2 focus:border-[#b8c3ff] outline-none transition-all font-sans font-medium"
              >
                {PRIORITIES.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Severity selection */}
            <div className="space-y-1">
              <label className="block text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider">Severity Layer</label>
              <select
                id="edit-severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Severity)}
                className="w-full bg-[#1a1f32] border border-[#2a2d3e] text-xs text-[#dee1fd] rounded p-2 focus:border-[#b8c3ff] outline-none transition-all font-sans font-medium"
              >
                {SEVERITIES.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Status (Tester options workflow — ) */}
            <div className="space-y-1">
              <label className="block text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider">Status (Tester Options)</label>
              <select
                id="edit-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as BugStatus)}
                className="w-full bg-[#1a1f32] border border-[#2a2d3e] text-xs text-[#b8c3ff] rounded p-2 focus:border-[#b8c3ff] outline-none transition-all font-sans font-bold"
              >
                {STATUSES.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Environment — fixed 4-value dropdown, never free text */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider">Environment*</label>
              <div className="bg-[#1a1f32] border border-[#2a2d3e] p-1 rounded flex items-center gap-2">
                <Monitor className="w-3.5 h-3.5 text-[#8e90a0] ml-2" />
                <select
                  id="edit-environment"
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  className="bg-transparent outline-none w-full text-xs font-sans text-white p-1.5"
                >
                  {ENVIRONMENTS.map(env => (
                    <option key={env} value={env} className="bg-[#1a1f32]">{env}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assigned To — real developer list, no free text */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider">Assigned Engineer</label>
              <div className="flex bg-[#1a1f32] border border-[#2a2d3e] rounded p-2 items-center gap-2">
                <select
                  id="edit-assignee"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="bg-gray-900 text-xs text-[#dee1fd] outline-none w-full font-bold cursor-pointer font-sans"
                >
                  <option value="">Unassigned</option>
                  {developers.map(dev => (
                    <option key={dev.employeeId} value={dev.employeeId}>{dev.fullName}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Timeline date metadata — read-only, auto-set by backend */}
            <div className="pt-4 border-t border-[#2a2d3e]/50 space-y-2">
              <div className="flex justify-between text-xs font-sans text-[#8e90a0]">
                <span>Created Log:</span>
                <span className="text-[#dee1fd]">{bug.createdDate}</span>
              </div>
              <div className="flex justify-between text-xs font-sans text-[#8e90a0]">
                <span>Last Modified:</span>
                <span className="text-[#dee1fd]">{bug.updatedDate}</span>
              </div>
            </div>

          </div>

        </div>

        {/* Error banner */}
        {submitError && (
          <div className="px-6 py-2 bg-rose-950/30 border-t border-rose-800/40 shrink-0">
            <p className="text-[11px] text-rose-300 font-sans">{submitError}</p>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-[#161a2e] border-t border-[#2a2d3e] flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg border border-[#2a2d3e] text-xs font-sans font-bold text-[#dee1fd] hover:bg-[#1a1f32] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            id="edit-update-submit"
            onClick={handleUpdate}
            disabled={isSubmitting || isLoadingBugDetail || !title.trim() || !description.trim() || !actualResult.trim() || !moduleId}
            className="bg-[#294fdb] hover:bg-[#4a6cf7] disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Saving...' : isLoadingBugDetail ? 'Loading...' : 'Update Bug Report'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
