const SourceAgent = require('./source-agent');

module.exports = collect => new SourceAgent({
  id: 'arxiv-analyst', name: 'arXiv Analyst', role: 'Tracks newly published AI research papers.', source: 'arXiv'
}, collect);
