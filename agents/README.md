# Research agents

The dashboard uses a small, composable agent team in its workflow:

- **GitHub Scout** — repository and OSS activity
- **arXiv Analyst** — new research papers
- **Community Listener** — Reddit discussions and signals
- **Calendar Coordinator** — upcoming research events
- **Research Synthesizer** — converts all signals into one digest
- **Digest Courier** — delivers the finished brief using SMTP

`agents/index.js` assembles the team. The Node orchestration pipeline runs all scout agents concurrently, then passes their normalized updates to the synthesizer and courier.
