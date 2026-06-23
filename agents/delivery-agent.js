const BaseAgent = require('./base-agent');

class DeliveryAgent extends BaseAgent {
  constructor(sendDigest) {
    super({ id: 'digest-courier', name: 'Digest Courier', role: 'Delivers completed intelligence briefs through SMTP.', source: 'Email' });
    this.sendDigest = sendDigest;
  }

  async execute(digest) {
    return this.sendDigest(digest);
  }
}

module.exports = DeliveryAgent;
