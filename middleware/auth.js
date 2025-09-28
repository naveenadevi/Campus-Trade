function isUserLoggedIn(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

function isAdminLoggedIn(req, res, next) {
  if (!req.session.adminId) return res.redirect('/admin/login');
  next();
}

module.exports = { isUserLoggedIn, isAdminLoggedIn };
