export const AGENTS = [
  {
    id: 'titan',
    name: 'TITAN',
    symbol: 'T',
    role: 'Instagram Empire',
    desc: 'Runs PostForge AI, creates verified AI content, publishes to @aibyvineet, and tracks engagement signals.',
    color: '#f59e0b',
    status: 'active',
    revenue: 'Rs 0',
    tasks: ['Refresh verified sources', 'Generate carousels and reels', 'Publish to Instagram'],
    metrics: { posts: 0, reach: 0, engagement: '0%' },
    url: 'https://postforge-ai-one.vercel.app'
  },
  {
    id: 'alfa',
    name: 'ALFA',
    symbol: 'A',
    role: 'YouTube Empire',
    desc: 'Builds faceless YouTube content systems for Cosmos AI and NautankiPOV.',
    color: '#ef4444',
    status: 'building',
    revenue: 'Rs 0',
    tasks: ['Script generation', 'Voiceover pipeline', 'Video assembly'],
    metrics: { videos: 0, views: 0, subscribers: 0 }
  },
  {
    id: 'beta',
    name: 'BETA',
    symbol: 'B',
    role: 'Freelance Operator',
    desc: 'Scans freelance opportunities and prepares autonomous delivery workflows.',
    color: '#10b981',
    status: 'planned',
    revenue: 'Rs 0',
    tasks: ['Scan orders', 'Create deliverables', 'Track payout'],
    metrics: { orders: 0, delivered: 0, earned: '$0' }
  },
  {
    id: 'hermes',
    name: 'HERMES',
    symbol: 'H',
    role: 'KDP Publisher',
    desc: 'Researches book opportunities, creates drafts, and prepares KDP publishing assets.',
    color: '#8b5cf6',
    status: 'planned',
    revenue: 'Rs 0',
    tasks: ['Keyword research', 'Book drafting', 'KDP formatting'],
    metrics: { books: 0, royalties: '$0', rank: '-' }
  },
  {
    id: 'ares',
    name: 'ARES',
    symbol: 'R',
    role: 'LinkedIn B2B Engine',
    desc: 'Creates B2B authority content, lead magnets, and outreach workflows.',
    color: '#0ea5e9',
    status: 'planned',
    revenue: 'Rs 0',
    tasks: ['Post content', 'Generate leads', 'Book calls'],
    metrics: { connections: 0, leads: 0, calls: 0 }
  },
  {
    id: 'apollo',
    name: 'APOLLO',
    symbol: 'P',
    role: 'X Viral Engine',
    desc: 'Builds threads, monitors trends, and grows the creator presence on X.',
    color: '#f97316',
    status: 'planned',
    revenue: 'Rs 0',
    tasks: ['Thread ideas', 'Trend monitoring', 'Engagement'],
    metrics: { tweets: 0, impressions: 0, followers: 0 }
  },
  {
    id: 'athena',
    name: 'ATHENA',
    symbol: 'N',
    role: 'Intelligence Layer',
    desc: 'Feeds agents with trend intelligence, competitor research, and opportunity signals.',
    color: '#ec4899',
    status: 'planned',
    revenue: 'Support',
    tasks: ['Trend scanning', 'Competitor intel', 'Signal reports'],
    metrics: { signals: 0, reports: 0, accuracy: '0%' }
  },
  {
    id: 'hephaistos',
    name: 'HEPHAISTOS',
    symbol: 'F',
    role: 'System Maintenance',
    desc: 'Monitors agent failures, repairs workflows, and improves prompts.',
    color: '#6366f1',
    status: 'planned',
    revenue: 'Support',
    tasks: ['Monitor agents', 'Repair failures', 'Optimize prompts'],
    metrics: { uptime: '0%', fixed: 0, optimized: 0 }
  },
  {
    id: 'poseidon',
    name: 'POSEIDON',
    symbol: 'O',
    role: 'Revenue Control',
    desc: 'Tracks revenue, payout status, and financial anomalies across all agents.',
    color: '#14b8a6',
    status: 'planned',
    revenue: 'Tracker',
    tasks: ['Track revenue', 'P&L reports', 'Payout alerts'],
    metrics: { total: 'Rs 0', mtd: 'Rs 0', ytd: 'Rs 0' }
  },
  {
    id: 'zeus',
    name: 'ZEUS',
    symbol: 'Z',
    role: 'Master Overseer',
    desc: 'Coordinates all agents, distributes workload, and escalates only critical decisions.',
    color: '#eab308',
    status: 'planned',
    revenue: 'Command',
    tasks: ['Orchestrate agents', 'Escalate critical items', 'Optimize workload'],
    metrics: { decisions: 0, escalations: 0, efficiency: '0%' }
  }
];

export function agentSummary() {
  return AGENTS.map(agent => `- ${agent.name} (${agent.role}): ${agent.status.toUpperCase()}`).join('\n');
}

export function publicAgents() {
  return AGENTS.map(agent => ({
    id: agent.id,
    name: agent.name,
    symbol: agent.symbol,
    role: agent.role,
    desc: agent.desc,
    color: agent.color,
    status: agent.status,
    revenue: agent.revenue,
    tasks: agent.tasks,
    metrics: agent.metrics,
    url: agent.url || ''
  }));
}
