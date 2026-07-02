const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getLogs } = require('../controllers/logController');

router.use(authenticateToken);
router.get('/', getLogs);

module.exports = router;
