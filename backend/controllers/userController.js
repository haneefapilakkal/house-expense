const User = require('../models/User');

const DEFAULT_USERS = [
  { name: 'Haneefa', role: 'Admin' },
  { name: 'Contractor', role: 'Normal' }
];

exports.seedUsers = async () => {
  try {
    const count = await User.count();
    if (count === 0) {
      await User.bulkCreate(DEFAULT_USERS);
      console.log('Default users seeded successfully (Haneefa & Contractor).');
    }
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ order: [['name', 'ASC']] });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, role } = req.body;
    const user = await User.create({ name, role });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
