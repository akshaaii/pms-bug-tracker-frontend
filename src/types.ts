export type Severity = 'CRITICAL' | 'MAJOR' | 'MINOR' | 'TRIVIAL';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type BugStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN PROGRESS'
  | 'READY FOR TESTING'
  | 'TESTING'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REOPENED'
  | 'DEFERRED'
  | 'REJECTED/INVALID'
  | 'DUPLICATE/ALREADY FIXED';

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  content: string;
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  type: 'status_change' | 'comment_add' | 'report' | 'reassign';
  user: string;
  message: string;
  timestamp: string;
}

export interface Bug {
  id: string;
  projectId: string;
  module: string; // moduleId as returned by backend (never the display name)
  moduleName?: string; // resolved display name, looked up client-side from the modules list
  title: string;
  severity: Severity;
  priority: Priority;
  status: BugStatus;
  reportedBy: string;
  reportedByTitle: string;
  reportedByAvatar: string;
  assignedTo: string;
  assignedToTitle: string;
  assignedToAvatar: string;
  environment: string;
  dueDate?: string;
  createdDate: string;
  updatedDate: string;
  description: string;
  expectedOutput: string;
  actualResult: string;
  artifacts: string[];
  comments: Comment[];
  activityTimeline: ActivityLog[];
  archived?: boolean;
  versionNum?: number;
}

export interface FilterState {
  projectId: string;
  module: string;
  status: string;
  priority: string;
  severity: string;
  assignedTo: string;
}

export type Role = 'QA Lead' | 'Sr. Developer';

export interface User {
  username: string;
  employeeId: string;
  fullName: string;
  role: Role;
  avatar: string;
}

export interface Project {
  projectId: string;
  projectName: string;
}

export interface ProjectModule {
  moduleId: string;
  moduleName: string;
  projectId: string;
}

export interface Developer {
  employeeId: string;
  fullName: string;
  role: string;
}

export interface PageInfo {
  totalElements: number;
  totalPages: number;
  number: number; // current page (0-based)
  size: number;
  first: boolean;
  last: boolean;
}
