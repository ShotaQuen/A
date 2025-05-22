const { addApiKey, generateRandomKey, canCreateKeys } = require('./middleware/apikey');

module.exports = function(app) {
  app.get('/api/createkey', (req, res) => {
    try {
      // Parameter dari query string
      const { owner, expires, secret } = req.query;
      
      // Secret key khusus untuk verifikasi
      const MASTER_SECRET = "RAHASIA_AND123"; // Ganti dengan secret key kuat
      
      // Verifikasi secret key
      if (secret !== MASTER_SECRET) {
        return res.status(403).json({ 
          success: false,
          message: 'Invalid secret key' 
        });
      }

      if (!owner) {
        return res.status(400).json({ 
          success: false,
          message: 'Parameter owner diperlukan' 
        });
      }

      // Hitung expiry date jika ada
      const expiresAt = expires ? 
        new Date(Date.now() + parseInt(expires) * 24 * 60 * 60 * 1000).toISOString() : 
        null;

      // Generate key baru
      const newKey = addApiKey({
        key: generateRandomKey(),
        owner,
        expiresAt
      });

      // Response sederhana
      res.json({
        success: true,
        key: newKey.key,
        owner: newKey.owner,
        expires: newKey.expiresAt || 'Tidak ada masa berlaku'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });
};