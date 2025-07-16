import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "JuanFernandoQuintero";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "No autorizado" });

  const token = authHeader.split(" ")[1]; 
  if (!token) return res.status(401).json({ message: "No autorizado" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ message: "Token inválido" });
    req.user = user; 
    next();
  });
};
