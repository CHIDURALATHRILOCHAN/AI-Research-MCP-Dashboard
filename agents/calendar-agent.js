const SourceAgent = require('./source-agent');

module.exports = collect => new SourceAgent({
  id: 'calendar-coordinator', name: 'Calendar Coordinator', role: 'Keeps upcoming research events in view.', source: 'Calendar'
}, collect);
