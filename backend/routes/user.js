const express = require('express');
const router = express.Router();

// Firebase Admin SDK for Firestore access
let db = null;
try {
  const admin = require('firebase-admin');
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'fullstack-6f920',
    });
  }
  db = admin.firestore();
} catch (err) {
  console.warn('[User] Firebase Admin not initialized:', err.message);
}

// GET /api/user/:uid/iterations — fetch iteration history from Firestore
router.get('/:uid/iterations', async (req, res) => {
  try {
    const { uid } = req.params;
    if (!uid) return res.status(400).json({ error: 'Missing uid' });

    if (!db) {
      // If Firestore is not available, return empty array
      return res.json({ iterations: [] });
    }

    const snapshot = await db
      .collection('users')
      .doc(uid)
      .collection('iterations')
      .orderBy('round', 'asc')
      .get();

    const iterations = [];
    snapshot.forEach(doc => {
      iterations.push({ id: doc.id, ...doc.data() });
    });

    res.json({ iterations });
  } catch (err) {
    console.error('/user/:uid/iterations error:', err.message);
    res.json({ iterations: [] }); // Return empty array on error
  }
});

module.exports = router;
