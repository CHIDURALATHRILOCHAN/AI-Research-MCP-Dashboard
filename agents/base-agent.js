class BaseAgent {
  constructor({ id, name, role, source }) {
    this.id = id;
    this.name = name;
    this.role = role;
    this.source = source;
  }

  async execute() {
    throw new Error(`${this.name} must implement execute()`);
  }
}

module.exports = BaseAgent;
