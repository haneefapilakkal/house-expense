const Expense = require('../models/Expense');
const Category = require('../models/Category');
const Source = require('../models/Source');
const User = require('../models/User');

exports.createExpense = async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    const populated = await Expense.findByPk(expense.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Source, as: 'source' },
        { model: User, as: 'creator' }
      ]
    });
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      include: [
        { model: Category, as: 'category' },
        { model: Source, as: 'source' },
        { model: User, as: 'creator' }
      ],
      order: [['date', 'DESC']]
    });
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
      const updatedExpense = await Expense.findByPk(id, {
        include: [
          { model: Category, as: 'category' },
          { model: Source, as: 'source' },
          { model: User, as: 'creator' }
        ]
      });
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

exports.requestCancelExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Expense.update({ status: 'Pending Cancellation' }, { where: { id } });
    if (updated) {
      const updatedExpense = await Expense.findByPk(id, {
        include: [
          { model: Category, as: 'category' },
          { model: Source, as: 'source' },
          { model: User, as: 'creator' }
        ]
      });
      return res.status(200).json(updatedExpense);
    }
    throw new Error('Expense not found');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.approveCancelExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Expense.update({ status: 'Cancelled' }, { where: { id } });
    if (updated) {
      const updatedExpense = await Expense.findByPk(id, {
        include: [
          { model: Category, as: 'category' },
          { model: Source, as: 'source' },
          { model: User, as: 'creator' }
        ]
      });
      return res.status(200).json(updatedExpense);
    }
    throw new Error('Expense not found');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.rejectCancelExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Expense.update({ status: 'Active' }, { where: { id } });
    if (updated) {
      const updatedExpense = await Expense.findByPk(id, {
        include: [
          { model: Category, as: 'category' },
          { model: Source, as: 'source' },
          { model: User, as: 'creator' }
        ]
      });
      return res.status(200).json(updatedExpense);
    }
    throw new Error('Expense not found');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
