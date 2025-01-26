const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { username, password } = req.body;

  console.log('Request Body:', req.body);

  const admin = await Admin.findOne({ username });
  console.log('Found Admin:', admin);

  if (!admin) {
    console.log('Admin not found');
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  if (admin.password !== password) {
    console.log('Password mismatch');
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
};
