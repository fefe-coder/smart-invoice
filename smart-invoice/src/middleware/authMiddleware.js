import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Prístup odmietnutý' });

  jwt.verify(token, process.env.JWT_SECRET || 'super-tajny-kluc', (err, user) => {
    if (err) return res.status(403).json({ message: 'Neplatný token' });
    req.user = user; // Tu sa uloží tvoje id a email
    next();
  });
};