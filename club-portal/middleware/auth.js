// Only allow signed-in users through.
const islogin = (req, res, next) => {
  if (!req.session.user_id) return res.redirect("/index");
  next();
};

// Send signed-in users to their dashboard instead of the login page.
const islogout = (req, res, next) => {
  if (req.session.user_id) return res.redirect(req.session.isAdmin ? "/secondpage_admin" : "/secondpage");
  next();
};

const isadmin = (req, res, next) => {
  if (!req.session.user_id) return res.status(401).json({ error: "Sign in first" });
  if (!req.session.isAdmin) return res.status(403).json({ error: "Only club admins can manage events" });
  next();
};

module.exports = { islogin, islogout, isadmin };
