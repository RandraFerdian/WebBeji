const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getAdminStats } = require('../controllers/adminStatsController');

router.use(authenticateToken);
router.get('/', getAdminStats);

module.exports = router;
