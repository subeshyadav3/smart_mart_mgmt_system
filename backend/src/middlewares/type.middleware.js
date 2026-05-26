export const allowUserTypes = (...allowedTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowedTypes.includes(req.user.type)) {
      return res.status(403).json({
        message: "Access denied for this user type",
      });
    }

    next();
  };
};