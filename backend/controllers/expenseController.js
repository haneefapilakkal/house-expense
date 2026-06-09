const Expense = require('../models/Expense');
const Category = require('../models/Category');
const Source = require('../models/Source');
const User = require('../models/User');

// Shared include config for populated responses
const INCLUDE = [
  { model: Category, as: 'category' },
  { model: Source, as: 'source' },
  { model: User, as: 'creator' }
];

const getPopulated = (id) => Expense.findByPk(id, { include: INCLUDE });

// ─── CREATE ───────────────────────────────────────────────────────────────────
exports.createExpense = async (req, res) => {
  try {
    const { title, amount, categoryId, sourceId, date, description, userId } = req.body;

    // Input validation
    const errors = {};
    if (!title || title.trim() === '') errors.title = 'Title is required.';
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0)
      errors.amount = 'Amount must be a positive number.';
    if (!date) errors.date = 'Date is required.';
    if (!categoryId) errors.categoryId = 'Category is required.';
    if (!sourceId) errors.sourceId = 'Funding source is required.';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const expense = await Expense.create({
      title: title.trim(),
      amount: parseFloat(amount),
      categoryId,
      sourceId,
      date,
      description: description?.trim() || null,
      userId: userId || null
    });

    const populated = await getPopulated(expense.id);
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ─── READ ─────────────────────────────────────────────────────────────────────
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      include: INCLUDE,
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── UPDATE (Edit) ────────────────────────────────────────────────────────────
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, categoryId, sourceId, date, description } = req.body;

    const expense = await Expense.findByPk(id);
    if (!expense) return res.status(404).json({ error: 'Expense not found.' });
    if (expense.status !== 'Active') {
      return res.status(400).json({ error: 'Only Active transactions can be edited.' });
    }

    const errors = {};
    if (!title || title.trim() === '') errors.title = 'Title is required.';
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0)
      errors.amount = 'Amount must be a positive number.';
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    await expense.update({
      title: title.trim(),
      amount: parseFloat(amount),
      categoryId,
      sourceId,
      date,
      description: description?.trim() || null
    });

    const updated = await getPopulated(id);
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByPk(id);
    if (!expense) return res.status(404).json({ error: 'Expense not found.' });

    await expense.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ─── REQUEST CANCEL (Normal User) ────────────────────────────────────────────
exports.requestCancelExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ error: 'A cancellation reason is required.' });
    }

    const expense = await Expense.findByPk(id);
    if (!expense) return res.status(404).json({ error: 'Expense not found.' });
    if (expense.status !== 'Active') {
      return res.status(400).json({ error: 'Only Active transactions can be cancelled.' });
    }

    await expense.update({
      status: 'Pending Cancellation',
      cancellationReason: reason.trim()
    });

    const updated = await getPopulated(id);
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ─── APPROVE CANCEL (Admin) ───────────────────────────────────────────────────
exports.approveCancelExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByPk(id);
    if (!expense) return res.status(404).json({ error: 'Expense not found.' });
    if (expense.status !== 'Pending Cancellation') {
      return res.status(400).json({ error: 'Only Pending Cancellation requests can be approved.' });
    }

    await expense.update({ status: 'Cancelled' });
    const updated = await getPopulated(id);
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ─── REJECT CANCEL (Admin) ────────────────────────────────────────────────────
exports.rejectCancelExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByPk(id);
    if (!expense) return res.status(404).json({ error: 'Expense not found.' });
    if (expense.status !== 'Pending Cancellation') {
      return res.status(400).json({ error: 'Only Pending Cancellation requests can be rejected.' });
    }

    await expense.update({ status: 'Active', cancellationReason: null });
    const updated = await getPopulated(id);
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ─── ADMIN DIRECT CANCEL ──────────────────────────────────────────────────────
exports.adminCancelExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const expense = await Expense.findByPk(id);
    if (!expense) return res.status(404).json({ error: 'Expense not found.' });
    if (expense.status === 'Cancelled') {
      return res.status(400).json({ error: 'Transaction is already cancelled.' });
    }

    await expense.update({
      status: 'Cancelled',
      cancellationReason: reason?.trim() || 'Cancelled by Admin'
    });

    const updated = await getPopulated(id);
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
