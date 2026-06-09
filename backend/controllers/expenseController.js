const Expense = require('../models/Expense');

exports.createExpense = async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({ order: [['date', 'DESC']] });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Expense.update(req.body, { where: { id } });
    if (updated) {
      const updatedExpense = await Expense.findByPk(id);
      return res.status(200).json(updatedExpense);
    }
    throw new Error('Expense not found');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Expense.destroy({ where: { id } });
    if (deleted) {
      return res.status(204).send("Expense deleted");
    }
    throw new Error('Expense not found');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
