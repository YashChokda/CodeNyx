const express = require('express');
const router = express.Router();

// GET /api/user/:uid/iterations
router.get('/:uid/iterations', async (req, res) => {
  try {
    // In a full implementation this would use firebase-admin
    // For now return empty array (frontend uses Firestore client SDK)
    res.json({ iterations: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
