const SourceAgent = require('./source-agent');

module.exports = collect => new SourceAgent({
  id: 'youtube-observer', name: 'YouTube Observer', role: 'Finds fresh AI technology and model-release videos.', source: 'YouTube'
}, collect);
