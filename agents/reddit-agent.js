const SourceAgent = require('./source-agent');

module.exports = collect => new SourceAgent({
  id: 'community-listener', name: 'Community Listener', role: 'Surfaces meaningful AI community discussions.', source: 'Reddit'
}, collect);
