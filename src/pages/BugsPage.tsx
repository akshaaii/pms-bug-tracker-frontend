import React from 'react';
import { useAppContext } from '../context/AppContext';
import FilterBar from '../components/FilterBar';
import BugTable from '../components/BugTable';

/**
 * Bugs page.
 * Renders the filter bar, main bug table, and real pagination controls
 * backed by the Spring Page<T> metadata returned by GET /bugs.
 */
export default function BugsPage() {
  const {
    currentUser,
    bugs,
    isLoadingBugs,
    pageInfo,
    page,
    setPage,
    pageSize,
    setPageSize,
    filters,
    setFilters,
    projectOptions,
    moduleOptions,
    statusOptions,
    priorityOptions,
    severityOptions,
    assigneeOptions,
    setSelectedBugId,
    setEditBugId,
    setReopenBugId,
    setStatusChangeBugId,
    setReassignBugId,
  } = useAppContext();

  if (!currentUser) return null;

  const startRow = pageInfo.totalElements === 0 ? 0 : page * pageSize + 1;
  const endRow = Math.min(pageInfo.totalElements, (page + 1) * pageSize);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-[#dee1fd]">
            {currentUser.role === 'Sr. Developer' ? 'My Assigned Bugs' : 'Bug Reports'}
          </h2>
          <p className="text-xs text-[#8e90a0] font-sans mt-0.5">
            {currentUser.role === 'Sr. Developer'
              ? 'Bugs assigned to me'
              : 'Filter, search, and manage all bug reports.'}
          </p>
        </div>
        <div className="text-[11px] font-sans text-[#c4c5d7] font-semibold">
          Showing <strong>{bugs.length}</strong> of <strong>{pageInfo.totalElements}</strong> records
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        projectOptions={projectOptions}
        moduleOptions={moduleOptions}
        statusOptions={statusOptions}
        priorityOptions={priorityOptions}
        severityOptions={severityOptions}
        assigneeOptions={assigneeOptions}
      />

      {/* Bug Table */}
      {isLoadingBugs ? (
        <div className="bg-[#161a2e] border border-[#2a2d3e] rounded-xl p-12 text-center text-xs text-[#8e90a0]">
          Loading bugs...
        </div>
      ) : (
        <BugTable
          bugs={bugs}
          userRole={currentUser.role}
          onViewBug={(id) => setSelectedBugId(id)}
          onEditBug={(id) => setEditBugId(id)}
          onReopenBug={(id) => setReopenBugId(id)}
          onChangeStatus={(id) => setStatusChangeBugId(id)}
          onReassignBug={(id) => setReassignBugId(id)}
        />
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4 select-none flex-wrap gap-3">
        <span className="text-xs font-sans text-[#8e90a0]">
          Showing {startRow}-{endRow} of {pageInfo.totalElements} results
        </span>

        <div className="flex items-center gap-4">
          {/* Page size selector */}
          <div className="flex items-center gap-1.5 text-xs font-sans text-[#8e90a0]">
            <span>Rows per page:</span>
            <select
              id="page-size-select"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-[#161a2e] border border-[#2a2d3e] text-xs text-[#dee1fd] rounded px-2 py-1 outline-none focus:border-[#b8c3ff]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Page X of Y */}
          <span className="text-xs font-sans text-[#8e90a0]">
            Page {pageInfo.number + 1} of {Math.max(pageInfo.totalPages, 1)}
          </span>

          <div className="flex gap-1.5 text-xs font-mono">
            <button
              disabled={pageInfo.first}
              onClick={() => setPage(Math.max(0, page - 1))}
              className={`px-2 py-1 border rounded ${pageInfo.first
                ? 'bg-[#161a2e] border-[#2a2d3e] text-[#8e90a0] cursor-not-allowed'
                : 'bg-[#1a1f32] border-[#2a2d3e] text-[#dee1fd] hover:bg-[#2f3449]'}`}
            >
              &lt; Prev
            </button>
            <button className="px-3 py-1 bg-[#294fdb] border border-[#294fdb] rounded text-white font-bold">
              {pageInfo.number + 1}
            </button>
            <button
              disabled={pageInfo.last}
              onClick={() => setPage(page + 1)}
              className={`px-2 py-1 border rounded ${pageInfo.last
                ? 'bg-[#161a2e] border-[#2a2d3e] text-[#8e90a0] cursor-not-allowed'
                : 'bg-[#1a1f32] border-[#2a2d3e] text-[#dee1fd] hover:bg-[#2f3449]'}`}
            >
              Next &gt;
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
