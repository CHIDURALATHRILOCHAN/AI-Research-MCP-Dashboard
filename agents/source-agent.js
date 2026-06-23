const BaseAgent = require('./base-agent');

class SourceAgent extends BaseAgent {
  constructor(config, collect) {
    super(config);
    this.collect = collect;
  }

  async execute() {
    const startedAt = new Date().toISOString();
    const updates = await this.collect();
    return {
      agent: this.id,
      source: this.source,
      status: 'completed',
      startedAt,
      completedAt: new Date().toISOString(),
      updates
    };
  }
}

module.exports = SourceAgent;
