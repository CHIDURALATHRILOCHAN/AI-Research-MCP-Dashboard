const SourceAgent = require('./source-agent');

module.exports = collect => new SourceAgent({
  id: 'github-scout', name: 'GitHub Scout', role: 'Finds high-signal AI repository activity.', source: 'GitHub'
}, collect);
