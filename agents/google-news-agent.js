const SourceAgent = require('./source-agent');

module.exports = collect => new SourceAgent({
  id: 'google-news-radar', name: 'Google News Radar', role: 'Monitors AI technology launches and industry updates.', source: 'Google News'
}, collect);
