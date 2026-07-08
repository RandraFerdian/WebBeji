const express = require('express');
const router = express.Router();
const sarprasController = require('../controllers/sarprasController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

router.get('/', sarprasController.getSarpras);
router.get('/:id', sarprasController.getSarprasById);

// Admin only routes
router.post('/', authenticateToken, isAdmin, sarprasController.createSarpras);
router.put('/:id', authenticateToken, isAdmin, sarprasController.updateSarpras);
router.delete('/:id', authenticateToken, isAdmin, sarprasController.deleteSarpras);

module.exports = router;
