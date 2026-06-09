const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// All user management routes require Admin
router.get('/',    verifyToken, requireAdmin, userController.getUsers);
router.post('/',   verifyToken, requireAdmin, userController.createUser);
router.put('/:id', verifyToken, requireAdmin, userController.updateUser);
router.delete('/:id', verifyToken, requireAdmin, userController.deleteUser);

module.exports = router;
