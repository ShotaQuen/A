const fs = require('fs');
const path = require('path');

const API_KEYS_FILE = path.join(__dirname, 'apikeys.json');
const MASTER_OWNER = 'admin'; // Only this owner can create new keys

// Initialize file if not exists with a master key
if (!fs.existsSync(API_KEYS_FILE)) {
  const initialKeys = {
    apikeys: [{
      key: 'MASTER_KEY_' + Math.random().toString(36).substring(2, 15),
      owner: MASTER_OWNER,
      createdAt: new Date().toISOString(),
      expiresAt: null,
      isActive: true,
      canCreateKeys: true // Special flag
    }]
  };
  fs.writeFileSync(API_KEYS_FILE, JSON.stringify(initialKeys, null, 2));
  console.log('Created initial API keys file with master key');
}

function getApiKeyList() {
  try {
    const data = fs.readFileSync(API_KEYS_FILE, 'utf8');
    return JSON.parse(data).apikeys || [];
  } catch (err) {
    console.error('Error reading API keys:', err);
    return [];
  }
}

function saveApiKeys(keys) {
  fs.writeFileSync(API_KEYS_FILE, JSON.stringify({ apikeys: keys }, null, 2));
}

function validateApiKey(req) {
  const apikey = req?.query?.apikey || req?.headers?.['x-api-key'];
  if (!apikey) return null;

  const keys = getApiKeyList();
  const foundKey = keys.find(k => k.key === apikey);

  if (!foundKey || !foundKey.isActive) return null;
  
  if (foundKey.expiresAt && new Date(foundKey.expiresAt) < new Date()) {
    return { 
      valid: false,
      reason: 'EXPIRED',
      key: foundKey 
    };
  }

  return { 
    valid: true,
    key: foundKey 
  };
}

function canCreateKeys(apiKey) {
  const keys = getApiKeyList();
  const keyData = keys.find(k => k.key === apiKey);
  return keyData && keyData.canCreateKeys;
}

function addApiKey({ key, owner, expiresAt = null }) {
  const keys = getApiKeyList();
  
  if (keys.some(k => k.key === key)) {
    throw new Error('API key already exists');
  }

  const newKey = {
    key,
    owner,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt || null,
    isActive: true,
    canCreateKeys: false // Only master key can create keys
  };

  keys.push(newKey);
  saveApiKeys(keys);
  return newKey;
}

function generateRandomKey(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = {
  validateApiKey,
  addApiKey,
  generateRandomKey,
  canCreateKeys
};