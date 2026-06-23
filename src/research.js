const axios = require('axios');
const nodemailer = require('nodemailer');
const { randomUUID } = require('crypto');
const store = require('./store');
const { createResearchTeam } = require('../agents');

const demo = {
  github: [
    ['openai/openai-cookbook', 'New agentic RAG examples and evaluation patterns.', 3250],
    ['microsoft/ai-agents-for-beginners', 'Added a lesson on multi-agent orchestration.', 1840],
    ['langchain-ai/langgraph', 'Released durable execution improvements.', 970]
  ],
  arxiv: [
    ['Reasoning Models as Tool-Using Researchers', 'A framework for reliable research workflows.', 'arXiv:2602.04112'],
    ['Efficient Evaluation of Autonomous AI Agents', 'Benchmarks for long-horizon tasks.', 'arXiv:2602.03801'],
    ['Multimodal Retrieval for Scientific Discovery', 'Connecting papers, code and datasets.', 'arXiv:2602.03190']
  ],
  reddit: [
    ['r/MachineLearning', 'Discussion: practical lessons from deploying small reasoning models', 892],
    ['r/LocalLLaMA', 'Open-weight models that stood out this week', 616],
    ['r/artificial', 'Research roundup: agents and scientific discovery', 401]
  ],
  googleNews: [
    ['New open AI model family announced', 'A roundup of a newly released model and its developer tooling.', 'Today'],
    ['AI agent platforms add enterprise controls', 'The latest agent releases focus on observability and deployment.', 'Yesterday']
  ],
  youtube: [
    ['What changed in this week’s AI model releases', 'A technical walkthrough of the newest models and capabilities.', '18K views'],
    ['Building reliable research agents in production', 'Practical patterns for multi-agent AI systems.', '9.4K views']
  ],
  calendar: [
    ['AI Research Lab Sync', '2026-02-23T10:00:00Z'],
    ['Paper Reading Group: Agent Evaluation', '2026-02-25T14:00:00Z']
  ]
};

const isDemo = () => process.env.DEMO_MODE !== 'false';
const item = (source, title, summary, url, metric = '') => ({ source, title, summary, url, metric, publishedAt: new Date().toISOString() });

async function github() {
  if (isDemo()) return demo.github.map(([title, summary, stars], i) => item('GitHub', title, summary, `https://github.com/${title}`, `${stars.toLocaleString()} stars`));
  const { data } = await axios.get('https://api.github.com/search/repositories', { params: { q: process.env.GITHUB_QUERY || 'topic:artificial-intelligence stars:>100', sort: 'updated', order: 'desc', per_page: 6 }, headers: process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {} });
  return data.items.map(r => item('GitHub', r.full_name, r.description || 'No description provided.', r.html_url, `${r.stargazers_count.toLocaleString()} stars`));
}

async function arxiv() {
  if (isDemo()) return demo.arxiv.map(([title, summary, id]) => item('arXiv', title, summary, `https://arxiv.org/abs/${id.replace('arXiv:', '')}`, id));
  const { data } = await axios.get('https://export.arxiv.org/api/query', { params: { search_query: 'all:artificial intelligence OR all:large language model', start: 0, max_results: 6, sortBy: 'submittedDate', sortOrder: 'descending' }, responseType: 'text' });
  const entries = data.split('<entry>').slice(1);
  return entries.map(xml => {
    const take = tag => (xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)) || [, ''])[1].replace(/\s+/g, ' ').trim();
    const id = take('id');
    return item('arXiv', take('title'), take('summary'), id, 'New paper');
  });
}

async function reddit() {
  if (isDemo()) return demo.reddit.map(([sub, title, score]) => item('Reddit', title, `Trending in ${sub}`, 'https://reddit.com', `${score} upvotes`));
  const subs = (process.env.REDDIT_SUBREDDITS || 'MachineLearning,LocalLLaMA').split(',').slice(0, 4);
  const results = await Promise.all(subs.map(async sub => {
    const { data } = await axios.get(`https://www.reddit.com/r/${sub.trim()}/hot.json`, { params: { limit: 3 }, headers: { 'User-Agent': 'AIResearchDashboard/1.0' } });
    return data.data.children.map(({ data: p }) => item('Reddit', p.title, `Trending in r/${sub.trim()}`, `https://reddit.com${p.permalink}`, `${p.score} upvotes`));
  }));
  return results.flat();
}

async function googleNews() {
  if (isDemo()) return demo.googleNews.map(([title, summary, metric]) => item('Google News', title, summary, 'https://news.google.com', metric));
  const query = encodeURIComponent(process.env.GOOGLE_NEWS_QUERY || 'artificial intelligence OR AI model release');
  const { data } = await axios.get(`https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`, { responseType: 'text' });
  return data.split('<item>').slice(1, 7).map(xml => {
    const take = tag => (xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)) || [, ''])[1].replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&amp;/g, '&').trim();
    return item('Google News', take('title'), take('description').replace(/<[^>]+>/g, '').slice(0, 240), take('link'), take('pubDate'));
  });
}

async function youtube() {
  if (isDemo()) return demo.youtube.map(([title, summary, metric]) => item('YouTube', title, summary, 'https://youtube.com', metric));
  if (!process.env.YOUTUBE_API_KEY) return [];
  const { data } = await axios.get('https://www.googleapis.com/youtube/v3/search', { params: { key: process.env.YOUTUBE_API_KEY, q: process.env.YOUTUBE_QUERY || 'artificial intelligence research OR AI model release', part: 'snippet', type: 'video', order: 'date', maxResults: 6, publishedAfter: new Date(Date.now() - 7 * 86400000).toISOString() } });
  return data.items.map(video => item('YouTube', video.snippet.title, video.snippet.description || 'Latest AI video update.', `https://www.youtube.com/watch?v=${video.id.videoId}`, new Date(video.snippet.publishedAt).toLocaleDateString()));
}

async function calendar() {
  if (isDemo()) return demo.calendar.map(([title, start]) => item('Calendar', title, 'Upcoming research event', '#', new Date(start).toLocaleString()));
  if (!process.env.GOOGLE_CALENDAR_TOKEN) return [];
  const { data } = await axios.get(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(process.env.GOOGLE_CALENDAR_ID || 'primary')}/events`, { params: { timeMin: new Date().toISOString(), maxResults: 6, singleEvents: true, orderBy: 'startTime' }, headers: { Authorization: `Bearer ${process.env.GOOGLE_CALENDAR_TOKEN}` } });
  return data.items.map(e => item('Calendar', e.summary || 'Untitled event', e.description || 'Upcoming research event', e.htmlLink || '#', e.start?.dateTime || e.start?.date || 'Scheduled'));
}

async function collectUpdates() {
  const team = createResearchTeam({ github, arxiv, reddit, calendar, googleNews, youtube, createDigest, sendDigest });
  const settled = await Promise.allSettled(team.scouts.map(agent => agent.execute()));
  const updates = []; const errors = [];
  settled.forEach((result, i) => result.status === 'fulfilled' ? updates.push(...result.value.updates) : errors.push({ source: team.scouts[i].source, agent: team.scouts[i].id, message: result.reason.message }));
  return { updates, errors };
}

function createDigest(updates) {
  const sourceCounts = updates.reduce((acc, u) => ({ ...acc, [u.source]: (acc[u.source] || 0) + 1 }), { GitHub: 0, arXiv: 0, Reddit: 0, 'Google News': 0, YouTube: 0, Calendar: 0 });
  const sections = Object.keys(sourceCounts).map(source => {
    const rows = updates.filter(u => u.source === source).map(u => `- [${u.title}](${u.url}) — ${u.summary} (${u.metric})`).join('\n');
    return `## ${source}\n${rows || '_No updates this cycle._'}`;
  }).join('\n\n');
  return { id: randomUUID(), title: `AI Research Intelligence — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`, createdAt: new Date().toISOString(), sourceCounts, updates, markdown: `# Weekly AI Research Intelligence\n\n${updates.length} updates collected across four research channels.\n\n${sections}` };
}

async function sendDigest(digest) {
  if (!process.env.SMTP_HOST || !process.env.DIGEST_RECIPIENTS) return { sent: false, reason: 'SMTP is not configured' };
  const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: Number(process.env.SMTP_PORT) === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
  await transport.sendMail({ from: process.env.SMTP_FROM, to: process.env.DIGEST_RECIPIENTS, subject: digest.title, text: digest.markdown });
  return { sent: true };
}

async function runWorkflow(trigger = 'manual') {
  const id = randomUUID(); const startedAt = new Date().toISOString();
  try {
    const { updates, errors } = await collectUpdates();
    const team = createResearchTeam({ github, arxiv, reddit, calendar, googleNews, youtube, createDigest, sendDigest });
    const digest = store.saveDigest(await team.synthesizer.execute(updates));
    const email = await team.courier.execute(digest);
    store.addRun({ id, trigger, startedAt, completedAt: new Date().toISOString(), status: errors.length ? 'completed_with_warnings' : 'completed', updates: updates.length, errors, email });
    return { digest, errors, email };
  } catch (error) {
    store.addRun({ id, trigger, startedAt, completedAt: new Date().toISOString(), status: 'failed', updates: 0, errors: [{ message: error.message }] });
    throw error;
  }
}

module.exports = { collectUpdates, createDigest, sendDigest, runWorkflow };
