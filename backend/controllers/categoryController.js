const Category = require('../models/Category');

const DEFAULT_CATEGORIES = [
  { name: 'Permits & Licensing', icon: 'FileText' },
  { name: 'Foundation & Basement', icon: 'HardHat' },
  { name: 'Laterite Stones & Bricks', icon: 'Layers' },
  { name: 'Cement, Sand & Gravel', icon: 'Container' },
  { name: 'Steel & Reinforcement', icon: 'Activity' },
  { name: 'Concrete Slab & Pillars', icon: 'Grid' },
  { name: 'Plastering & Masonry', icon: 'Brush' },
  { name: 'Carpentry & Woodwork', icon: 'Hammer' },
  { name: 'Electrical & Wiring', icon: 'Zap' },
  { name: 'Plumbing & Sanitary', icon: 'Droplet' },
  { name: 'Flooring & Tiling', icon: 'Layout' },
  { name: 'Painting & Putty', icon: 'Paintbrush' },
  { name: 'Labor & Wages', icon: 'Users' },
  { name: 'General & Miscellaneous', icon: 'MoreHorizontal' }
];

exports.seedCategories = async () => {
  try {
    const count = await Category.count();
    if (count === 0) {
      await Category.bulkCreate(DEFAULT_CATEGORIES);
      console.log('Default house building categories seeded successfully.');
    }
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;
    const category = await Category.create({ name, icon });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon } = req.body;
    const [updated] = await Category.update({ name, icon }, { where: { id } });
    if (updated) {
      const updatedCategory = await Category.findByPk(id);
      return res.status(200).json(updatedCategory);
    }
    throw new Error('Category not found');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Category.destroy({ where: { id } });
    if (deleted) {
      return res.status(204).send('Category deleted');
    }
    throw new Error('Category not found');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
