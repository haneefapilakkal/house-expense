const express = require('express');
const router = express.Router();
const sourceController = require('../controllers/sourceController');

router.get('/', sourceController.getSources);
router.post('/', sourceController.createSource);
router.put('/:id', sourceController.updateSource);
router.delete('/:id', sourceController.deleteSource);

module.exports = router;
