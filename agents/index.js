const githubAgent = require('./github-agent');
const arxivAgent = require('./arxiv-agent');
const redditAgent = require('./reddit-agent');
const calendarAgent = require('./calendar-agent');
const googleNewsAgent = require('./google-news-agent');
const youtubeAgent = require('./youtube-agent');
const SynthesisAgent = require('./synthesis-agent');
const DeliveryAgent = require('./delivery-agent');

function createResearchTeam({ github, arxiv, reddit, calendar, googleNews, youtube, createDigest, sendDigest }) {
  return {
    scouts: [githubAgent(github), arxivAgent(arxiv), redditAgent(reddit), googleNewsAgent(googleNews), youtubeAgent(youtube), calendarAgent(calendar)],
    synthesizer: new SynthesisAgent(createDigest),
    courier: new DeliveryAgent(sendDigest)
  };
}

module.exports = { createResearchTeam };
