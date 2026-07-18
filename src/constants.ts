// Avatar lookup for the two demo accounts the backend's demo-auth endpoint
// actually supports (see DemoAuthController). Everything else about the
// user (employeeId, fullName, role) comes from the backend session.
export const USERS: Record<string, { avatar: string }> = {
  tester: {
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  },
  developer: {
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  },
};

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
