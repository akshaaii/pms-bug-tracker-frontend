import { Bug, User } from './types';

export const USERS: Record<string, User> = {
  tester: {
    username: 'tester',
    fullName: 'Akshay',
    role: 'QA Lead',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  },
  developer: {
    username: 'developer',
    fullName: 'Antony Lawrence',
    role: 'Sr. Developer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  },
  sarah: {
    username: 'sarah',
    fullName: 'Sarah Chen',
    role: 'Sr. Developer', // Graphics / Frontend
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  },
  anita: {
    username: 'anita',
    fullName: 'Anita Raj',
    role: 'QA Lead',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
  },
  saraK: {
    username: 'saraK',
    fullName: 'Sara K.',
    role: 'Sr. Developer',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
  }
};

export const INITIAL_BUGS: Bug[] = [
  {
    id: 'BUG-4821',
    projectId: 'CSE-WEB',
    module: 'Auth Service',
    title: 'Token expiration causes infinite loop in login UI',
    severity: 'CRITICAL',
    priority: 'HIGH',
    status: 'OPEN',
    reportedBy: 'Akshay',
    reportedByTitle: 'QA Lead',
    reportedByAvatar: USERS.tester.avatar,
    assignedTo: 'Antony Lawrence',
    assignedToTitle: 'Sr. Developer',
    assignedToAvatar: USERS.developer.avatar,
    environment: 'Production (v2.4.1 Chrome 121)',
    createdDate: '24 Oct 2023',
    updatedDate: '2026-06-11 09:30',
    dueDate: 'Today, 5:00 PM',
    description: 'System credentials check refresh triggers recursive callbacks repeatedly without resetting the timeout parameter, creating massive CPU load and rendering the login view unresponsive.',
    expectedOutput: 'The refresh token cycle should terminate and redirect back to the entry gateway with an error bubble if refresh attempt fails twice.',
    actualResult: 'Browser initiates thousands of parallel request calls per minute, resulting in rendering freeze.',
    artifacts: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&q=80&w=600'
    ],
    comments: [
      {
        id: 'c1',
        authorName: 'Antony Lawrence',
        authorAvatar: USERS.developer.avatar,
        authorRole: 'Sr. Developer',
        content: 'Reproduced in staging. Investigating the redirect loops and session state handler hooks.',
        timestamp: '2h ago'
      },
      {
        id: 'c2',
        authorName: 'Akshay',
        authorAvatar: USERS.tester.avatar,
        authorRole: 'QA Lead',
        content: 'Added server logs confirming token verify returns 401 code infinitely.',
        timestamp: '30m ago'
      }
    ],
    activityTimeline: [
      {
        id: 'a1',
        type: 'report',
        user: 'Akshay',
        message: 'Bug Reported by Akshay',
        timestamp: 'Yesterday'
      },
      {
        id: 'a2',
        type: 'status_change',
        user: 'Antony Lawrence',
        message: 'Status changed to Open by Antony Lawrence',
        timestamp: '2h ago'
      }
    ]
  },
  {
    id: 'BUG-4819',
    projectId: 'CSE-API',
    module: 'Data Pipeline',
    title: 'Malformed JSON in batch export payload',
    severity: 'MAJOR',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    reportedBy: 'Anita Raj',
    reportedByTitle: 'QA Lead',
    reportedByAvatar: USERS.anita.avatar,
    assignedTo: 'Sara K.',
    assignedToTitle: 'Sr. Developer',
    assignedToAvatar: USERS.saraK.avatar,
    environment: 'Staging v2.3',
    createdDate: '23 Oct 2023',
    updatedDate: '2026-06-11 09:12',
    description: 'Special boundary characters inside database records escape string sanitizers, disrupting JSON output formatting structurally on exports above 10MB records.',
    expectedOutput: 'Clean, standard-compliant JSON array formatted precisely with nested strings sanitized.',
    actualResult: 'JSON parsing raises invalid tokens syntax exception on column data strings containing double quotes.',
    artifacts: [],
    comments: [],
    activityTimeline: [
      {
        id: 'at1',
        type: 'report',
        user: 'Anita Raj',
        message: 'Bug Reported',
        timestamp: '3 days ago'
      }
    ]
  },
  {
    id: 'BUG-4815',
    projectId: 'CSE-WEB',
    module: 'Profile',
    title: 'Avatar upload fails for files larger than 2MB',
    severity: 'MINOR',
    priority: 'LOW',
    status: 'IN PROGRESS',
    reportedBy: 'Akshay',
    reportedByTitle: 'QA Lead',
    reportedByAvatar: USERS.tester.avatar,
    assignedTo: 'Antony Lawrence',
    assignedToTitle: 'Sr. Developer',
    assignedToAvatar: USERS.developer.avatar,
    environment: 'Development',
    createdDate: '22 Oct 2023',
    updatedDate: '2026-06-11 08:45',
    description: 'The maximum limits on multipart requests are hardcoded to block items exceeding 2MB on frontend upload validators, without displaying a warning dialog to users.',
    expectedOutput: 'Display descriptive warning notice and allow compress pipeline triggers for files up to 10MB.',
    actualResult: 'Silent failure on submit request, keeping the loading indicator spinning indefinitely.',
    artifacts: [],
    comments: [],
    activityTimeline: [
      {
        id: 'atl_1',
        type: 'report',
        user: 'Akshay',
        message: 'Bug Reported',
        timestamp: '4 days ago'
      }
    ]
  },
  {
    id: 'BUG-4029',
    projectId: 'CSE-WEB',
    module: 'UI/UX Components > Dashboards',
    title: 'Memory Leak on Dashboard Widget Resize',
    severity: 'CRITICAL',
    priority: 'HIGH',
    status: 'IN PROGRESS',
    reportedBy: 'Akshay',
    reportedByTitle: 'QA Lead',
    reportedByAvatar: USERS.tester.avatar,
    assignedTo: 'Antony Lawrence',
    assignedToTitle: 'Sr. Developer',
    assignedToAvatar: USERS.developer.avatar,
    environment: 'Production v2.4.1 (Chrome 121)',
    createdDate: 'Oct 24, 2023',
    updatedDate: '2026-06-11 09:33',
    description: 'Resizing standard canvas modules registers key handlers repetitively without calling clean unmount functions. Heap sizes rise progressively causing complete system overhead after minutes.',
    expectedOutput: 'Canvas component should deregister listener and clear memory resources properly.',
    actualResult: 'Memory footprint consumes over 2GB causing browser tab to crash.',
    artifacts: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600'
    ],
    comments: [
      {
        id: 'c4029_1',
        authorName: 'Antony Lawrence',
        authorAvatar: USERS.developer.avatar,
        authorRole: 'Sr. Developer',
        content: 'Working on event handler tracking to confirm which listeners remain active.',
        timestamp: '1h ago'
      }
    ],
    activityTimeline: [
      {
        id: 'a4029_1',
        type: 'report',
        user: 'Akshay',
        message: 'Bug Reported',
        timestamp: 'Oct 24, 2023'
      },
      {
        id: 'a4029_2',
        type: 'status_change',
        user: 'Antony Lawrence',
        message: 'Status changed to In Progress by Antony Lawrence',
        timestamp: '2h ago'
      }
    ]
  },
  {
    id: 'BUG-4031',
    projectId: 'CSE-API',
    module: 'Backend > Service Layer',
    title: 'API Timeout on Bulk CSV Export',
    severity: 'MAJOR',
    priority: 'HIGH',
    status: 'OPEN',
    reportedBy: 'Akshay',
    reportedByTitle: 'QA Lead',
    reportedByAvatar: USERS.tester.avatar,
    assignedTo: 'Antony Lawrence',
    assignedToTitle: 'Sr. Developer',
    assignedToAvatar: USERS.developer.avatar,
    environment: 'Production v2.4.1 (Chrome 121)',
    createdDate: 'Oct 25, 2023',
    updatedDate: '2026-06-11 09:33',
    description: 'Bulk CSV generator processes records sequentially inside server memory thread, creating timeouts on requests with active query counts above 50,000 logs.',
    expectedOutput: 'Async export triggering and sending email link upon complete records collection, bypassing gateway timeouts.',
    actualResult: 'HTTP Status Gateway timeout triggered exactly after 60 seconds.',
    artifacts: [],
    comments: [],
    activityTimeline: [
      {
        id: 'at_4031_1',
        type: 'report',
        user: 'Akshay',
        message: 'Bug Reported',
        timestamp: 'Oct 25, 2023'
      }
    ]
  },
  {
    id: 'BUG-3988',
    projectId: 'CSE-WEB',
    module: 'Content > Static Pages',
    title: 'Broken Link in Documentation Modal',
    severity: 'MINOR',
    priority: 'LOW',
    status: 'TESTING',
    reportedBy: 'Anita Raj',
    reportedByTitle: 'QA Lead',
    reportedByAvatar: USERS.anita.avatar,
    assignedTo: 'Antony Lawrence',
    assignedToTitle: 'Sr. Developer',
    assignedToAvatar: USERS.developer.avatar,
    environment: 'Staging v2.3',
    createdDate: 'Oct 20, 2023',
    updatedDate: '2026-06-11 09:33',
    description: 'Href attributes point to deprecated document URLs instead of current wiki pathways inside the global footer workspace dialog component.',
    expectedOutput: 'Href structures should map cleanly to the revised support system.',
    actualResult: 'User clicks redirect pathways to 404 page results.',
    artifacts: [],
    comments: [],
    activityTimeline: [
      {
        id: 'at_3988_1',
        type: 'report',
        user: 'Anita Raj',
        message: 'Bug Reported',
        timestamp: 'Oct 20, 2023'
      }
    ]
  },
  {
    id: 'BUG-1042',
    projectId: 'Phoenix Engine v2.4',
    module: 'Physics Thread',
    title: 'Memory Leak in Physics Thread during Scene Re-init',
    severity: 'MAJOR',
    priority: 'HIGH',
    status: 'OPEN',
    reportedBy: 'Akshay',
    reportedByAvatar: USERS.tester.avatar,
    reportedByTitle: 'QA Lead',
    assignedTo: 'Akshay', // Graphics Lead / QA Lead role
    assignedToAvatar: USERS.tester.avatar,
    assignedToTitle: 'Graphics Lead',
    environment: 'Windows 11 Pro / RTX 4090 / Vulkan 1.3',
    createdDate: 'Oct 24, 09:12 AM',
    updatedDate: 'Today, 02:45 PM',
    description: 'The physics thread fails to deallocate vertex buffers when the world origin shifts significantly, causing a gradual increase in VRAM usage until OOM crash. Observed after 30 minutes of continuous runtime on heavy assets.',
    expectedOutput: 'Full cleanup of physics buffer pool on scene transition or origin shift without frame hitching.',
    actualResult: 'VRAM builds consistently; system halts on memory allocations bounds check.',
    artifacts: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&q=80&w=600'
    ],
    comments: [
      {
        id: 'c1042_1',
        authorName: 'Antony Lawrence',
        authorAvatar: USERS.developer.avatar,
        authorRole: 'Sr. Developer',
        content: 'Confirmed this on the latest dev build. It seems related to the new HLOD system optimization we pushed last Tuesday.',
        timestamp: '2 hours ago'
      },
      {
        id: 'c1042_2',
        authorName: 'Sarah Chen',
        authorAvatar: USERS.sarah.avatar,
        authorRole: 'Sr. Developer',
        content: "I'll look into the deallocation hooks in the vertex factory. Might need a manual flush call.",
        timestamp: '45 minutes ago'
      }
    ],
    activityTimeline: [
      {
        id: 'at1042_1',
        type: 'report',
        user: 'Akshay',
        message: 'Bug Reported',
        timestamp: 'Oct 24, 09:12 AM'
      }
    ]
  },
  {
    id: 'BUG-4021',
    projectId: 'PRJ-2024',
    module: 'UI Renderer',
    title: 'Memory Leak in UI Renderer',
    severity: 'CRITICAL',
    priority: 'HIGH',
    status: 'OPEN',
    reportedBy: 'Anita Raj',
    reportedByTitle: 'QA Lead',
    reportedByAvatar: USERS.anita.avatar,
    assignedTo: 'Akshay',
    assignedToTitle: 'QA Lead',
    assignedToAvatar: USERS.tester.avatar,
    environment: 'Sprint 12',
    createdDate: 'Oct 24, 2023',
    updatedDate: '2026-06-11 09:30',
    description: 'UI drawing routines leak event buffers upon iterative layout changes during heavy updates sequence charts.',
    expectedOutput: 'Complete cleanup of render bindings after transition.',
    actualResult: 'Resources fail to deallocate.',
    artifacts: [],
    comments: [],
    activityTimeline: []
  },
  {
    id: 'BUG-3982',
    projectId: 'PRJ-2024',
    module: 'API Gateway',
    title: 'API Timeout on Heavy Load',
    severity: 'CRITICAL',
    priority: 'HIGH',
    status: 'IN PROGRESS',
    reportedBy: 'Akshay',
    reportedByTitle: 'QA Lead',
    reportedByAvatar: USERS.tester.avatar,
    assignedTo: 'Antony Lawrence',
    assignedToTitle: 'Sr. Developer',
    assignedToAvatar: USERS.developer.avatar,
    environment: 'Sprint 11',
    createdDate: 'Oct 24, 2023',
    updatedDate: '2026-06-11 09:33',
    description: 'Concurrent requests on endpoint gate trigger server threads pooling latency errors under massive stress testing environments.',
    expectedOutput: 'Rate limit policies should load balance and delegate buffer loops smoothly.',
    actualResult: 'Connections terminate arbitrarily.',
    artifacts: [],
    comments: [],
    activityTimeline: []
  }
];

export const LEARNINGS = [
  {
    id: 'l1',
    title: 'VRAM Cleanups on scene transition',
    category: 'Physics & Graphics',
    description: 'Ensure allocation lists check sizes manually. Unbind vertex buffer arrays immediately when deleting dynamic mesh instances.',
    author: 'Sarah Chen'
  },
  {
    id: 'l2',
    title: 'Double-binding on resize events',
    category: 'React & Widgets',
    description: 'Use custom hooks with clean cleanup closures. Avoid register events direct call inside component layouts.',
    author: 'Antony Lawrence'
  },
  {
    id: 'l3',
    title: 'Sanitizing dynamic array sequences',
    category: 'Backend Pipeline',
    description: 'Verify batch escape parameters structurally before assembling export query results to maintain clean JSON payload compatibility.',
    author: 'Sara K.'
  }
];
