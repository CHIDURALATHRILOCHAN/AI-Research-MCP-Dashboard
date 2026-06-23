const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'dashboard.json');
const blank = () => ({ digests: [], runs: [], sourceActivity: {} });

function read() {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return blank(); }
}

function write(data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function addRun(run) {
  const data = read();
  data.runs.unshift(run);
  data.runs = data.runs.slice(0, 40);
  write(data);
}

function saveDigest(digest) {
  const data = read();
  data.digests.unshift(digest);
  data.digests = data.digests.slice(0, 30);
  Object.entries(digest.sourceCounts).forEach(([source, count]) => {
    data.sourceActivity[source] = { count, updatedAt: digest.createdAt, status: count ? 'active' : 'quiet' };
  });
  write(data);
  return digest;
}

module.exports = { read, addRun, saveDigest };
