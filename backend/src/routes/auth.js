const express = require('express');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/me', auth, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const { id, email, first_name, last_name, role, phone } = req.user;
  return res.json({ id, email, first_name, last_name, role, phone });
});

module.exports = router;
