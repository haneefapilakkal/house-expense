const bcrypt = require('bcryptjs');
const User = require('../models/User');

const SALT_ROUNDS = 10;

const DEFAULT_USERS = [
  { name: 'Haneefa',    email: 'admin@home.com', password: 'admin123', role: 'Admin'  },
  { name: 'Contractor', email: 'user@home.com',  password: 'user123',  role: 'Normal' }
];

// Seed default users (only if table is empty)
exports.seedUsers = async () => {
  try {
    const count = await User.count();
    if (count === 0) {
      const hashed = await Promise.all(
        DEFAULT_USERS.map(async u => ({
          ...u,
          password: await bcrypt.hash(u.password, SALT_ROUNDS)
        }))
      );
      await User.bulkCreate(hashed);
      console.log('Default users seeded: admin@home.com (admin123) | user@home.com (user123)');
    }
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

// GET /api/users  (Admin only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
      order: [['name', 'ASC']]
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/users  (Admin only)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existing = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (existing) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashed,
      role: role || 'Normal'
    });

    res.status(201).json({
      id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// PUT /api/users/:id  (Admin only)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Check email uniqueness if changing
    if (email && email.trim().toLowerCase() !== user.email) {
      const existing = await User.findOne({ where: { email: email.trim().toLowerCase() } });
      if (existing) return res.status(400).json({ error: 'Email already in use.' });
    }

    const updates = {};
    if (name)  updates.name  = name.trim();
    if (email) updates.email = email.trim().toLowerCase();
    if (role)  updates.role  = role;
    if (password && password.trim() !== '') {
      updates.password = await bcrypt.hash(password, SALT_ROUNDS);
    }

    await user.update(updates);
    res.status(200).json({
      id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE /api/users/:id  (Admin only, cannot delete self)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting your own account
    if (req.user && req.user.id === id) {
      return res.status(400).json({ error: 'You cannot delete your own account.' });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    await user.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
