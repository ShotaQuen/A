const fs = require('fs');
const path = require('path');

function getApiKeyList() {
  const data = fs.readFileSync(path.join(__dirname, '../../../../apikeys.json'));
  const parsed = JSON.parse(data);
  return parsed.apikeys || [];
}

function validateApiKey(req) {
  const apikey = req?.query?.apikey || req?.headers?.['x-api-key'];
  if (!apikey) return null;

  const apikeys = getApiKeyList();
  return apikeys.find(k => k.key === apikey) || null;
}

module.exports = { validateApiKey };
