const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getPengaturan, updatePengaturan } = require('../controllers/pengaturanController');

router.get('/', getPengaturan);

router.use(authenticateToken);
router.put('/', updatePengaturan);

module.exports = router;
