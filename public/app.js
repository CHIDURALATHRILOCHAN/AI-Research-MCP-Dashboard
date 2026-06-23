const $ = s => document.querySelector(s);
const icons = { GitHub: '◈', arXiv: '⌁', Reddit: '●', Calendar: '□' };
const color = { GitHub: 'purple', arXiv: 'orange', Reddit: 'coral', 'Google News': 'blue', YouTube: 'coral', Calendar: 'blue' };
const time = value => value ? new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '—';

async function load() {
  const data = await fetch('/api/overview').then(r => r.json());
  const latest = data.digests[0];
  $('#digestTitle').textContent = latest?.title || 'No intelligence brief yet';
  $('#digestSummary').textContent = latest ? `Compiled ${time(latest.createdAt)} · ${latest.updates.length} signals synthesized across your research channels.` : 'Run an intelligence sweep to collect research updates.';
  $('#updateCount').textContent = latest?.updates.length || 0;
  $('.metrics').innerHTML = ['GitHub', 'arXiv', 'Reddit', 'Google News', 'YouTube', 'Calendar'].map(name => { const a = data.sourceActivity[name]; return `<article class="metric"><span class="source-icon ${color[name]}">${icons[name] || '◉'}</span><div><b>${a?.count ?? 0}</b><p>${name}</p></div><small>${a?.status || 'waiting'}</small></article>`; }).join('');
  $('#digestList').innerHTML = data.digests.length ? data.digests.slice(0, 5).map(d => `<button class="digest-row" data-id="${d.id}"><span class="calendar">${new Date(d.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span><span><b>${d.title}</b><small>${d.updates.length} signals · ${Object.values(d.sourceCounts).filter(Boolean).length} sources</small></span><i>›</i></button>`).join('') : '<p class="empty">Your completed intelligence briefs will appear here.</p>';
  document.querySelectorAll('.digest-row').forEach(button => button.onclick = () => openDigest(button.dataset.id));
  $('#runList').innerHTML = data.runs.length ? data.runs.slice(0, 6).map(r => `<div class="run"><span class="status ${r.status}"></span><div><b>${r.trigger === 'scheduled' ? 'Scheduled weekly sweep' : r.trigger === 'mcp' ? 'MCP intelligence sweep' : 'Manual intelligence sweep'}</b><small>${time(r.completedAt)} · ${r.updates} updates</small></div><em>${r.status.replaceAll('_', ' ')}</em></div>`).join('') : '<p class="empty">No workflow runs recorded yet.</p>';
}
async function openDigest(id) { const d = await fetch(`/api/digests/${id}`).then(r => r.json()); $('#digestContent').textContent = d.markdown; $('#digestDialog').showModal(); }
$('#runButton').onclick = async () => { const b = $('#runButton'); b.disabled = true; b.innerHTML = 'Collecting signals…'; try { await fetch('/api/workflows/run', { method: 'POST' }); await load(); } finally { b.disabled = false; b.innerHTML = '<span>↻</span> Run intelligence sweep'; } };
load();
