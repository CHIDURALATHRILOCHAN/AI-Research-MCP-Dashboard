# AI Research Dashboard Using MCP

A research intelligence workspace that combines GitHub, arXiv, Reddit, Google News, YouTube, and Google Calendar activity into scheduled weekly email digests. It includes an Express dashboard, a lightweight JSON execution store, an agent research team, and six MCP tools that can be used from MCP-compatible clients.

## Quick start

```bash
npm install
copy .env.example .env
npm run dev
```

Open `http://localhost:3000`. The application starts in `DEMO_MODE=true`, so the dashboard is populated with deterministic sample updates without credentials.

## Live sources

Set `DEMO_MODE=false` and configure the relevant variables in `.env`:

- `GITHUB_TOKEN` and `GITHUB_QUERY` for GitHub repository activity.
- `REDDIT_SUBREDDITS` for public subreddit feeds.
- `GOOGLE_NEWS_QUERY` for credential-free Google News AI-release tracking.
- `YOUTUBE_API_KEY` and `YOUTUBE_QUERY` for recent YouTube AI videos.
- `GOOGLE_CALENDAR_TOKEN` and `GOOGLE_CALENDAR_ID` for upcoming events.
- SMTP fields plus `DIGEST_RECIPIENTS` to send the generated digest.

arXiv’s public Atom endpoint is used without credentials.

## Agent team

The `agents/` folder contains the specialist agents used by the orchestration pipeline. The six source scouts run concurrently; the synthesis and delivery agents then generate and distribute the completed digest. See [`agents/README.md`](agents/README.md) for each role.

## MCP server

Run `npm run mcp` to expose tools via stdio:

- `research_collect_updates`
- `research_generate_digest`
- `research_list_digests`
- `research_get_source_activity`
- `research_run_history`
- `research_send_latest_digest`

## Scheduling

`DIGEST_CRON` defaults to `0 8 * * 1` (every Monday at 8:00 AM). `SCHEDULE_TIMEZONE` defaults to `Asia/Kolkata`; set it to your preferred IANA timezone if needed. Each scheduled execution collects sources, builds a digest, records the run, and sends mail only when SMTP recipients are configured.
