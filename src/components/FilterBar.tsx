import React from 'react';
import { FilterX } from 'lucide-react';

interface FilterState {
  projectId: string;
  module: string;
  status: string;
  priority: string;
  severity: string;
  assignedTo: string;
}

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  projectOptions: string[];
  moduleOptions: { moduleId: string; moduleName: string }[];
  statusOptions: string[];
  priorityOptions: string[];
  severityOptions: string[];
  assigneeOptions: { employeeId: string; fullName: string }[];
}

export default function FilterBar({
  filters,
  setFilters,
  projectOptions,
  moduleOptions,
  statusOptions,
  priorityOptions,
  severityOptions,
  assigneeOptions,
}: FilterBarProps) {
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleReset = () => {
    setFilters({
      projectId: 'All Projects',
      module: 'All Modules',
      status: 'All Statuses',
      priority: 'All Priorities',
      severity: 'All Severities',
      assignedTo: 'All Users',
    });
  };

  const selectClass = "w-full bg-[#1a1f32] border border-[#2a2d3e] text-[12px] text-[#dee1fd] rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-[#b8c3ff] focus:border-[#b8c3ff] outline-none transition-all";

  return (
    <div className="bg-[#161a2e] p-4 rounded-xl border border-[#2a2d3e]/60 mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 items-end shadow-lg">
      {/* Project ID Select */}
      <div className="space-y-1">
        <label className="block text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider">Project ID</label>
        <select
          id="filter-project"
          value={filters.projectId}
          onChange={(e) => handleFilterChange('projectId', e.target.value)}
          className={selectClass}
        >
          <option>All Projects</option>
          {projectOptions.map((proj) => (
            <option key={proj} value={proj}>{proj}</option>
          ))}
        </select>
      </div>

      {/* Module Select */}
      <div className="space-y-1">
        <label className="block text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider">Module</label>
        <select
          id="filter-module"
          value={filters.module}
          onChange={(e) => handleFilterChange('module', e.target.value)}
          className={selectClass}
        >
          <option value="All Modules">All Modules</option>
          {moduleOptions.map((mod) => (
            <option key={mod.moduleId} value={mod.moduleId}>{mod.moduleName}</option>
          ))}
        </select>
      </div>

      {/* Status Select */}
      <div className="space-y-1">
        <label className="block text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider">Status</label>
        <select
          id="filter-status"
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className={selectClass}
        >
          <option>All Statuses</option>
          {statusOptions.map((stat) => (
            <option key={stat} value={stat}>{stat}</option>
          ))}
        </select>
      </div>

      {/* Priority Select */}
      <div className="space-y-1">
        <label className="block text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider">Priority</label>
        <select
          id="filter-priority"
          value={filters.priority}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          className={selectClass}
        >
          <option>All Priorities</option>
          {priorityOptions.map((prio) => (
            <option key={prio} value={prio}>{prio}</option>
          ))}
        </select>
      </div>

      {/* Severity Select */}
      <div className="space-y-1">
        <label className="block text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider">Severity</label>
        <select
          id="filter-severity"
          value={filters.severity}
          onChange={(e) => handleFilterChange('severity', e.target.value)}
          className={selectClass}
        >
          <option>All Severities</option>
          {severityOptions.map((sev) => (
            <option key={sev} value={sev}>{sev}</option>
          ))}
        </select>
      </div>

      {/* Assigned To Select */}
      <div className="space-y-1">
        <label className="block text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider">Assigned To</label>
        <select
          id="filter-assignedTo"
          value={filters.assignedTo}
          onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
          className={selectClass}
        >
          <option value="All Users">All Users</option>
          {assigneeOptions.map((user) => (
            <option key={user.employeeId} value={user.employeeId}>{user.fullName}</option>
          ))}
        </select>
      </div>

      {/* Reset Button */}
      <button
        id="btn-filter-reset"
        onClick={handleReset}
        className="bg-[#2f3449] hover:bg-[#444655] border border-[#2a2d3e] text-xs text-[#dee1fd] font-sans font-bold h-[34px] px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <FilterX className="w-3.5 h-3.5 text-[#b8c3ff]" />
        <span>Reset</span>
      </button>
    </div>
  );
}
