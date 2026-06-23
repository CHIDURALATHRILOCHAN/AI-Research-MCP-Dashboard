require('dotenv').config();
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { ListToolsRequestSchema, CallToolRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const store = require('./store');
const { collectUpdates, createDigest, runWorkflow, sendDigest } = require('./research');

const server = new Server({ name: 'ai-research-dashboard', version: '1.0.0' }, { capabilities: { tools: {} } });
const tools = [
  ['research_collect_updates', 'Collect current updates from GitHub, arXiv, Reddit and Google Calendar.'],
  ['research_generate_digest', 'Run the full research workflow and save a new intelligence digest.'],
  ['research_list_digests', 'List recently generated research intelligence digests.'],
  ['research_get_source_activity', 'Get update counts and last activity for all research sources.'],
  ['research_run_history', 'Get recent workflow execution history.'],
  ['research_send_latest_digest', 'Send the most recent digest through configured SMTP.']
].map(([name, description]) => ({ name, description, inputSchema: { type: 'object', properties: {} } }));

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));
server.setRequestHandler(CallToolRequestSchema, async ({ params }) => {
  let result;
  switch (params.name) {
    case 'research_collect_updates': result = await collectUpdates(); break;
    case 'research_generate_digest': result = await runWorkflow('mcp'); break;
    case 'research_list_digests': result = store.read().digests; break;
    case 'research_get_source_activity': result = store.read().sourceActivity; break;
    case 'research_run_history': result = store.read().runs; break;
    case 'research_send_latest_digest': {
      const digest = store.read().digests[0];
      result = digest ? await sendDigest(digest) : { sent: false, reason: 'No digest available' };
      break;
    }
    default: throw new Error(`Unknown tool: ${params.name}`);
  }
  return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
});
server.connect(new StdioServerTransport());
