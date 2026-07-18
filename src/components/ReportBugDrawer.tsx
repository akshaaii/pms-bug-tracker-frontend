import React, { useState, useEffect } from 'react';
import { X, Upload, PlusCircle, Check } from 'lucide-react';
import { Bug, Priority, Severity, ProjectModule } from '../types';
import { useAppContext, CreateBugPayload } from '../context/AppContext';
import { validateScreenshotFile } from '../api';

interface ReportBugDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CreateBugPayload) => Promise<Bug>;
  reporterName: string;
  reporterTitle: string;
  reporterAvatar: string;
}

const ENVIRONMENTS = ['Development', 'SIT', 'UAT', 'Production'];

export default function ReportBugDrawer({
  isOpen,
  onClose,
  onSave,
  reporterName,
  reporterTitle,
}: ReportBugDrawerProps) {
  const { projects, developers, getModulesForProject } = useAppContext();

  // Form state
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState<Priority>('LOW');
  const [moduleId, setModuleId] = useState('');
  const [modules, setModules] = useState<ProjectModule[]>([]);
  const [severity, setSeverity] = useState<Severity>('MINOR');
  const [environment, setEnvironment] = useState(ENVIRONMENTS[3]);
  const [title, setTitle] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [description, setDescription] = useState('');
  const [actualResult, setActualResult] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Default to the first real project once loaded, then load its
  // modules — the module dropdown is only populated after a project is picked.
  useEffect(() => {
    if (isOpen && projects.length > 0 && !projectId) {
      setProjectId(projects[0].projectId);
    }
  }, [isOpen, projects, projectId]);

  useEffect(() => {
    if (!projectId) { setModules([]); return; }
    getModulesForProject(projectId).then(mods => {
      setModules(mods);
      setModuleId(mods[0]?.moduleId || '');
    }).catch(() => setModules([]));
  }, [projectId, getModulesForProject]);

  useEffect(() => {
    if (!isOpen) {
      // Reset the form each time the drawer is closed/reopened.
      setPriority('LOW');
      setSeverity('MINOR');
      setEnvironment(ENVIRONMENTS[3]);
      setTitle('');
      setExpectedOutput('');
      setDescription('');
      setActualResult('');
      setAssignedToId('');
      setFile(null);
      setFileError('');
      setSubmitError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    // Validate type/size before it ever touches the API.
    const error = validateScreenshotFile(selected);
    if (error) {
      setFileError(error);
      setFile(null);
      return;
    }
    setFileError('');
    setFile(selected);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !moduleId || !description.trim() || !actualResult.trim() || isSubmitting) return;

    // Disable immediately, only re-enable on error.
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await onSave({
        projectId,
        moduleId,
        title: title.trim(),
        severity,
        priority,
        environment,
        description: description.trim(),
        expectedOutput: expectedOutput.trim() || undefined,
        actualResult: actualResult.trim(),
        assignedToId: assignedToId || undefined,
        screenshotFile: file,
      });
      onClose();
    } catch (err: any) {
      // DUPLICATE_SUBMISSION and every other error shows the
      // backend's exact message, and re-enables the button.
      setSubmitError(err.message || 'Failed to save bug report.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        onClick={isSubmitting ? undefined : onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-over Container */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-[#1a1f32] border-l border-[#2a2d3e] shadow-2xl flex flex-col transform transition-all duration-300 animate-slide-in">

          {/* Header */}
          <div className="px-6 py-5 bg-[#161a2e] border-b border-[#2a2d3e] flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold font-sans text-[#dee1fd] tracking-tight">Report New Bug</h3>
              <p className="text-[11px] text-[#c4c5d7]/80 font-sans mt-0.5">Capture issue details for the engineering workspace.</p>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-1.5 hover:bg-red-950/20 text-[#8e90a0] hover:text-[#ffb4ab] rounded-full transition-all disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Left Column info */}
              <div className="space-y-4">

                {/* Project selector — real projects from GET /projects */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#b8c3ff] font-sans">Project ID*</label>
                  <select
                    id="report-project"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full bg-[#161a2e] border border-[#2a2d3e] text-xs text-white rounded-lg px-3 py-2 outline-none focus:border-[#b8c3ff] transition-all font-sans"
                  >
                    {projects.length === 0 && <option value="">Loading projects...</option>}
                    {projects.map((p) => (
                      <option key={p.projectId} value={p.projectId}>{p.projectName}</option>
                    ))}
                  </select>
                </div>

                {/* Module — real modules from GET /projects/{projectId}/modules, loads after project is selected */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#b8c3ff] font-sans">Module*</label>
                  <select
                    id="report-module"
                    required
                    value={moduleId}
                    onChange={(e) => setModuleId(e.target.value)}
                    disabled={!projectId || modules.length === 0}
                    className="w-full bg-[#161a2e] border border-[#2a2d3e] text-xs text-white rounded-lg px-3 py-2 outline-none focus:border-[#b8c3ff] transition-all font-sans disabled:opacity-50"
                  >
                    {modules.length === 0 && <option value="">{projectId ? 'Loading modules...' : 'Select a project first'}</option>}
                    {modules.map((m) => (
                      <option key={m.moduleId} value={m.moduleId}>{m.moduleName}</option>
                    ))}
                  </select>
                </div>

                {/* Environment — fixed 4-value dropdown */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#b8c3ff] font-sans">Environment*</label>
                  <select
                    id="report-env"
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    className="w-full bg-[#161a2e] border border-[#2a2d3e] text-xs text-white rounded-lg px-3 py-2 outline-none focus:border-[#b8c3ff] transition-all font-sans"
                  >
                    {ENVIRONMENTS.map((env) => (
                      <option key={env} value={env}>{env}</option>
                    ))}
                  </select>
                </div>

                {/* Bug No — auto-generated by backend, never sent/generated client-side */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#b8c3ff]/70 font-sans">Bug No* (Auto-generated)</label>
                  <input
                    type="text"
                    value="Auto Generated"
                    disabled
                    className="w-full bg-[#0d1226]/55 border border-[#2a2d3e]/80 text-xs text-[#8e90a0] rounded-lg px-3 py-2 cursor-not-allowed font-mono font-bold"
                  />
                </div>

                {/* Reported By — read-only, set from session server-side, never sent */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#b8c3ff]/70 font-sans">Reported By (Auto)</label>
                  <input
                    type="text"
                    value={`${reporterName} (${reporterTitle})`}
                    disabled
                    className="w-full bg-[#0d1226]/55 border border-[#2a2d3e]/80 text-xs text-[#8e90a0] rounded-lg px-3 py-2 cursor-not-allowed font-sans font-bold"
                  />
                </div>

              </div>

              {/* Right Column info */}
              <div className="space-y-4">

                {/* Priority Toggle Selection Cards — */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#b8c3ff] font-sans">Priority*</label>
                  <div className="flex gap-2">
                    {(['LOW', 'MEDIUM', 'HIGH'] as Priority[]).map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => setPriority(opt)}
                        className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all border ${
                          priority === opt
                            ? 'bg-[#b8c3ff] text-[#001e77] border-[#b8c3ff] shadow-md shadow-[#b8c3ff]/10'
                            : 'bg-[#161a2e] text-[#c4c5d7] border-[#2a2d3e] hover:bg-[#2f3449]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Severity Dropdown — */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#b8c3ff] font-sans">Severity*</label>
                  <select
                    id="report-severity"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as Severity)}
                    className="w-full bg-[#161a2e] border border-[#2a2d3e] text-xs text-white rounded-lg px-3 py-2 outline-none focus:border-[#b8c3ff] transition-all font-sans"
                  >
                    <option value="CRITICAL">S1 - Blocker / Critical</option>
                    <option value="MAJOR">S2 - Major</option>
                    <option value="MINOR">S3 - Minor</option>
                    <option value="TRIVIAL">S4 - Trivial</option>
                  </select>
                </div>

                {/* Assigned To — optional, real developers list */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#b8c3ff] font-sans">Assign To (optional)</label>
                  <select
                    id="report-assignee"
                    value={assignedToId}
                    onChange={(e) => setAssignedToId(e.target.value)}
                    className="w-full bg-[#161a2e] border border-[#2a2d3e] text-xs text-white rounded-lg px-3 py-2 outline-none focus:border-[#b8c3ff] transition-all font-sans"
                  >
                    <option value="">Unassigned</option>
                    {developers.map((dev) => (
                      <option key={dev.employeeId} value={dev.employeeId}>{dev.fullName}</option>
                    ))}
                  </select>
                </div>

                {/* Bug Status display */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#b8c3ff]/70 font-sans">Initial Status (Auto)</label>
                  <div className="w-full bg-[#0d1226]/55 border border-[#2a2d3e]/80 rounded-lg px-3 py-2 text-xs text-white flex items-center gap-2 font-mono font-bold">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                    <span>OPEN / UNASSIGNED</span>
                  </div>
                </div>

                {/* Date display — auto-set by backend, never sent */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#b8c3ff]/70 font-sans">Created / Updated Date (Auto)</label>
                  <input
                    type="text"
                    value="Auto Generated"
                    disabled
                    className="w-full bg-[#0d1226]/55 border border-[#2a2d3e]/80 text-xs text-[#8e90a0] rounded-lg px-3 py-2 cursor-not-allowed font-mono"
                  />
                </div>

              </div>

            </div>

            {/* Title Summary */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#b8c3ff] font-sans">Bug Title Description*</label>
              <input
                type="text"
                id="report-title"
                required
                placeholder="Provide a succinct, descriptive summary of the crash or leak..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#161a2e] border border-[#2a2d3e] text-xs text-white placeholder-[#8e90a0]/50 rounded-lg px-3 py-2 outline-none focus:border-[#b8c3ff] transition-all font-sans"
              />
            </div>

            {/* Expected behavior Output block */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#dee1fd] font-sans">Expected Output Behavior</label>
              <input
                type="text"
                placeholder="How should the system operate normally?"
                value={expectedOutput}
                onChange={(e) => setExpectedOutput(e.target.value)}
                className="w-full bg-[#161a2e] border border-[#2a2d3e] text-xs text-white placeholder-[#8e90a0]/50 rounded-lg px-3 py-2 outline-none focus:border-[#b8c3ff] transition-all font-sans"
              />
            </div>

            {/* Description detailed reproducible steps */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#dee1fd] font-sans">Steps to Reproduce (Description)*</label>
              <textarea
                rows={3}
                id="report-desc"
                required
                placeholder="1. Navigate to dashboard... 2. Interact with chart filters... 3. Note VRAM overhead."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#161a2e] border border-[#2a2d3e] text-xs text-white placeholder-[#8e90a0]/50 rounded-lg px-3 py-2 outline-none focus:border-[#b8c3ff] transition-all resize-none font-sans"
              />
            </div>

            {/* Actual Result Failures */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#dee1fd] font-sans">Actual Result Failure*</label>
              <textarea
                rows={2}
                id="report-actual"
                required
                placeholder="What failure behavior actually transpired?"
                value={actualResult}
                onChange={(e) => setActualResult(e.target.value)}
                className="w-full bg-[#161a2e] border border-[#2a2d3e] text-xs text-white placeholder-[#8e90a0]/50 rounded-lg px-3 py-2 outline-none focus:border-[#b8c3ff] transition-all resize-none font-sans"
              />
            </div>

            {/* Screenshot upload — real file, validated client-side, uploaded via multipart after the bug is created */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#dee1fd] font-sans">Asset/Screenshot Upload (JPG, PNG, or PDF)</label>
              <label
                htmlFor="report-file-input"
                className="border-2 border-dashed border-[#2a2d3e] hover:border-[#b8c3ff] rounded-xl p-6 bg-[#161a2e]/60 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group"
              >
                <input
                  id="report-file-input"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                {file ? (
                  <div className="flex flex-col items-center gap-1.5 animate-in zoom-in duration-200">
                    <Check className="w-8 h-8 text-emerald-400" />
                    <p className="text-xs font-bold text-emerald-400">Screenshot attached!</p>
                    <span className="text-[10px] text-[#8e90a0] truncate max-w-sm">{file.name}</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-[#8e90a0] group-hover:text-[#b8c3ff] transition-all" />
                    <p className="text-xs text-[#c4c5d7] font-semibold text-center">Click to upload diagnostic screenshots, or drag files</p>
                    <span className="text-[10px] text-[#8e90a0] uppercase tracking-wider font-mono">Max size: 5MB (JPG, PNG, PDF)</span>
                  </>
                )}
              </label>
              {fileError && <p className="text-[10px] text-rose-300">{fileError}</p>}
            </div>

          </form>

          {/* Error banner */}
          {submitError && (
            <div className="px-6 py-2 bg-rose-950/30 border-t border-rose-800/40 shrink-0">
              <p className="text-[11px] text-rose-300 font-sans">{submitError}</p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-[#161a2e] border-t border-[#2a2d3e] flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-sans font-bold text-[#dee1fd] rounded-lg border border-[#2a2d3e] hover:bg-[#1a1f32] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              id="report-bug-submit"
              onClick={handleSave}
              disabled={isSubmitting || !title.trim() || !moduleId || !description.trim() || !actualResult.trim()}
              className="bg-[#294fdb] hover:bg-[#4a6cf7] disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 font-sans font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving...' : 'Save Bug Report'}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
