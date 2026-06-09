const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

router.post('/', expenseController.createExpense);
router.get('/', expenseController.getExpenses);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);
router.put('/:id/request-cancel', expenseController.requestCancelExpense);
router.put('/:id/approve-cancel', expenseController.approveCancelExpense);
router.put('/:id/reject-cancel', expenseController.rejectCancelExpense);

module.exports = router;
