const Source = require('../models/Source');
const Expense = require('../models/Expense');

exports.getSources = async (req, res) => {
  try {
    const sources = await Source.findAll({
      include: [{ model: Expense, as: 'expenses' }]
    });

    const sourcesWithBalances = sources.map(source => {
      const expenses = source.expenses || [];
      const activeExpenses = expenses.filter(exp => exp.status !== 'Cancelled');
      const totalSpent = activeExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
      const remainingBalance = source.type === 'Person' 
        ? null 
        : parseFloat(source.totalAmount || 0) - totalSpent;

      const sourceData = source.toJSON();
      delete sourceData.expenses; // Clean up so we don't send all transactions inside sources
      return {
        ...sourceData,
        totalSpent,
        remainingBalance
      };
    });

    res.status(200).json(sourcesWithBalances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSource = async (req, res) => {
  try {
    const { name, type, totalAmount, description } = req.body;
    const source = await Source.create({
      name,
      type,
      totalAmount: type === 'Person' ? null : totalAmount,
      description
    });
    res.status(201).json(source);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateSource = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, totalAmount, description } = req.body;
    const [updated] = await Source.update(
      {
        name,
        type,
        totalAmount: type === 'Person' ? null : totalAmount,
        description
      },
      { where: { id } }
    );

    if (updated) {
      const updatedSource = await Source.findByPk(id);
      return res.status(200).json(updatedSource);
    }
    throw new Error('Source not found');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteSource = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Source.destroy({ where: { id } });
    if (deleted) {
      return res.status(204).send('Source deleted');
    }
    throw new Error('Source not found');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
