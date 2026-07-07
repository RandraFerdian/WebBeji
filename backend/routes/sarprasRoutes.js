const express = require('express');
const router = express.Router();
const sarprasController = require('../controllers/sarprasController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/', sarprasController.getSarpras);
router.get('/:id', sarprasController.getSarprasById);

// Admin only routes
router.post('/', verifyToken, isAdmin, sarprasController.createSarpras);
router.put('/:id', verifyToken, isAdmin, sarprasController.updateSarpras);
router.delete('/:id', verifyToken, isAdmin, sarprasController.deleteSarpras);

module.exports = router;
