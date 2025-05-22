const { validateApiKey } = require('./apikey');

module.exports = function(app) {
  app.get('/apikey/check', (req, res) => {
    const valid = validateApiKey(req);

    if (!valid) {
      return res.status(403).json({ status: false, message: 'Invalid or missing API key' });
    }

    res.json({
      status: true,
      message: 'Valid API key',
      owner: valid.owner
    });
  });
};
