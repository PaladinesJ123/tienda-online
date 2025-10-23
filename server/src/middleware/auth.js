import jwt from "jsonwebtoken";

export function auth(requiredRole) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "No token" });

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      // Si hay role requerido, superadmin siempre pasa
      if (requiredRole) {
        const ok =
          payload.role === "superadmin" ||
          payload.role === requiredRole ||
          (Array.isArray(requiredRole) && requiredRole.includes(payload.role));
        if (!ok) return res.status(403).json({ error: "Forbidden" });
      }
      req.user = payload;
      next();
    } catch {
      res.status(401).json({ error: "Invalid token" });
    }
  };
}
