const { addApiKey, generateRandomKey, canCreateKeys } = require('./middleware/apikey');

module.exports = function(app) {
  app.post('/apikey/create', (req, res) => {
    try {
      const { owner, expiresInDays } = req.body;
      const requestApiKey = req?.query?.apikey || req?.headers?.['x-api-key'];
      
      // Check if requester has permission to create keys
      if (!requestApiKey || !canCreateKeys(requestApiKey)) {
        return res.status(403).json({ 
          status: false, 
          message: 'Only special API keys can create new keys' 
        });
      }

      if (!owner) {
        return res.status(400).json({ 
          status: false, 
          message: 'Owner name is required' 
        });
      }

      const expiresAt = expiresInDays ? 
        new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString() : 
        null;

      const newKey = addApiKey({
        key: generateRandomKey(),
        owner,
        expiresAt
      });

      res.json({
        status: true,
        message: expiresAt ? 
          `API key created (expires on ${new Date(expiresAt).toLocaleDateString()})` : 
          'Unlimited API key created',
        key: newKey.key,
        details: {
          owner: newKey.owner,
          expiresAt: newKey.expiresAt
        }
      });

    } catch (error) {
      res.status(400).json({
        status: false,
        message: error.message
      });
    }
  });
};