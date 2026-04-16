const { verifyToken, getProfileById } = require('../lib/supabase');

function sendUnauthorized(res) {
  return res.status(401).json({ error: 'No autorizado' });
}

async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    if (!token) {
      return sendUnauthorized(res);
    }

    const user = await verifyToken(token);
    if (!user) {
      return sendUnauthorized(res);
    }

    const profile = await getProfileById(user.id);
    req.user = {
      id: user.id,
      email: user.email,
      role: profile?.role || null,
      first_name: profile?.first_name || null,
      last_name: profile?.last_name || null,
      phone: profile?.phone || null,
    };

    return next();
  } catch (error) {
    console.error('Auth middleware error:', error.message || error);
    return sendUnauthorized(res);
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return sendUnauthorized(res);
  }

  return next();
}

module.exports = {
  auth,
  adminOnly,
};
