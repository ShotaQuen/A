const { validateApiKey } = require('./middleware/apikey');

module.exports = function(app) {
  app.get('/secure/data', (req, res) => {
    const valid = validateApiKey(req);

    if (!valid) {
      return res.status(403).json({ status: false, message: 'Unauthorized' });
    }

    res.json({
      status: true,
      message: `Welcome ${valid.owner}`,
      data: { secret: "Ini data rahasia yang dilindungi API key" }
    });
  });
};
