import { BugStatus } from './types';

// Mirrors backend/src/main/java/com/cse/bugtracker/entity/BugStatus.java exactly.
// Keep these two files in sync - this is what stops the UI from ever
// offering a status/transition the backend would reject with a 400.

export const ALL_STATUSES: BugStatus[] = [
  'OPEN', 'ASSIGNED', 'IN PROGRESS', 'READY FOR TESTING', 'TESTING',
  'RESOLVED', 'CLOSED', 'REOPENED', 'DEFERRED', 'REJECTED/INVALID', 'DUPLICATE/ALREADY FIXED',
];

// Which statuses each role is allowed to set.
export const TESTER_ALLOWED_STATUSES: BugStatus[] = ['OPEN', 'ASSIGNED', 'TESTING', 'RESOLVED', 'REOPENED', 'DEFERRED', 'CLOSED'];
export const DEVELOPER_ALLOWED_STATUSES: BugStatus[] = ['IN PROGRESS', 'READY FOR TESTING', 'REJECTED/INVALID', 'DUPLICATE/ALREADY FIXED'];

// Valid "from -> to" transitions. Anything not listed here will be
// rejected by the backend with INVALID_STATUS_TRANSITION.
export const VALID_TRANSITIONS: Record<string, BugStatus[]> = {
  OPEN: ['ASSIGNED', 'REJECTED/INVALID', 'DUPLICATE/ALREADY FIXED'],
  ASSIGNED: ['IN PROGRESS', 'DEFERRED', 'REJECTED/INVALID', 'DUPLICATE/ALREADY FIXED'],
  'IN PROGRESS': ['READY FOR TESTING', 'DEFERRED', 'REJECTED/INVALID', 'DUPLICATE/ALREADY FIXED'],
  'READY FOR TESTING': ['TESTING'],
  TESTING: ['RESOLVED', 'REOPENED'],
  RESOLVED: ['CLOSED', 'REOPENED'],
  REOPENED: ['ASSIGNED', 'IN PROGRESS'],
  DEFERRED: ['ASSIGNED', 'IN PROGRESS'],
  'REJECTED/INVALID': ['OPEN'],
  'DUPLICATE/ALREADY FIXED': ['OPEN'],
  CLOSED: [],
};

/**
 * Returns the list of statuses that are BOTH (a) a valid transition from the
 * bug's current status, and (b) allowed for the acting user's role.
 * This is the intersection the Change Status dropdown must show.
 */
export function getAvailableStatusOptions(currentStatus: string, role: 'QA Lead' | 'Sr. Developer'): BugStatus[] {
  const roleAllowed = role === 'QA Lead' ? TESTER_ALLOWED_STATUSES : DEVELOPER_ALLOWED_STATUSES;
  const validNext = VALID_TRANSITIONS[currentStatus] || [];
  return validNext.filter(s => roleAllowed.includes(s));
}
