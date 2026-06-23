const BaseAgent = require('./base-agent');

class SynthesisAgent extends BaseAgent {
  constructor(createDigest) {
    super({ id: 'research-synthesizer', name: 'Research Synthesizer', role: 'Combines source signals into a single intelligence brief.', source: 'Digest' });
    this.createDigest = createDigest;
  }

  async execute(updates) {
    return this.createDigest(updates);
  }
}

module.exports = SynthesisAgent;
