const { User } = require('../models');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Hľadáme používateľa podľa emailu
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Nesprávny email alebo heslo' });
    }

    // 2. Kontrola hesla (keďže ho v DB nemáš šifrované, porovnáme text)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Nesprávny email alebo heslo' });
    }

    // 3. Vytvorenie tokenu (použijeme tajný kľúč z .env alebo 'secret')
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'super_tajne_heslo',
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Chyba na serveri' });
  }
};