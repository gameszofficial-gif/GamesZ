const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) return next();
  res.redirect('/auth/login?redirect=' + req.originalUrl);
};

const requireAdmin = (req, res, next) => {
  if (req.session && req.session.isAdmin) return next();
  res.redirect('/admin/login');
};

module.exports = { requireAuth, requireAdmin };
