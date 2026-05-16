const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.get('/recommendations', aiController.getRecommendations);
router.get('/alerts', aiController.getAlerts);
router.post('/budget-advice', aiController.getBudgetAdvice);
router.post('/chat', aiController.chat);
router.get('/history', aiController.getChatHistory);
router.delete('/history', aiController.clearChatHistory);

module.exports = router;
