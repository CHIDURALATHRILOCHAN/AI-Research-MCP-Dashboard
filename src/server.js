require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const store = require('./store');
const { collectUpdates, createDigest, runWorkflow } = require('./research');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/overview', (req, res) => {
  const data = store.read();
  res.json({ ...data, demoMode: process.env.DEMO_MODE !== 'false', configuredSources: { github: !!process.env.GITHUB_TOKEN, arxiv: true, reddit: true, calendar: !!process.env.GOOGLE_CALENDAR_TOKEN, smtp: !!process.env.SMTP_HOST } });
});
app.get('/api/digests', (req, res) => res.json(store.read().digests));
app.get('/api/digests/:id', (req, res) => {
  const digest = store.read().digests.find(d => d.id === req.params.id);
  digest ? res.json(digest) : res.status(404).json({ error: 'Digest not found' });
});
app.get('/api/updates', async (req, res) => {
  try { res.json(await collectUpdates()); } catch (error) { res.status(500).json({ error: error.message }); }
});
app.post('/api/workflows/run', async (req, res) => {
  try { res.status(201).json(await runWorkflow('manual')); } catch (error) { res.status(500).json({ error: error.message }); }
});

const schedule = process.env.DIGEST_CRON || '0 8 * * 1';
if (cron.validate(schedule)) cron.schedule(schedule, () => runWorkflow('scheduled').catch(console.error), { timezone: process.env.SCHEDULE_TIMEZONE || 'Asia/Kolkata' });
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`AI Research Dashboard listening at http://localhost:${port} (${process.env.DEMO_MODE !== 'false' ? 'demo' : 'live'} mode)`));
