const express = require('express');
const router = express.Router();
const AIService = require('../services/AIService');
const Customer = require('../models/Customer');
const { protect } = require('../middleware/auth');

// @route   GET /api/ai/lead-score/:customerId
// @desc    Get lead score for a customer
// @access  Private
router.get('/lead-score/:customerId', protect, async (req, res) => {
  try {
    const score = await AIService.calculateLeadScore(req.params.customerId);
    
    // Update customer's lead score
    await Customer.findByIdAndUpdate(req.params.customerId, {
      'leadScore.score': score,
      'leadScore.lastUpdated': new Date()
    });

    res.json({
      success: true,
      data: { score }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   POST /api/ai/analyze-sentiment
// @desc    Analyze text sentiment
// @access  Private
router.post('/analyze-sentiment', protect, async (req, res) => {
  try {
    const { text, customerId, source } = req.body;
    const sentiment = AIService.analyzeSentiment(text);

    if (customerId) {
      await Customer.findByIdAndUpdate(customerId, {
        $push: {
          sentimentHistory: {
            sentiment,
            source,
            text,
            date: new Date()
          }
        }
      });
    }

    res.json({
      success: true,
      data: { sentiment }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   POST /api/ai/chatbot
// @desc    Get chatbot response
// @access  Private
router.post('/chatbot', protect, async (req, res) => {
  try {
    const { message } = req.body;
    const response = AIService.generateChatbotResponse(message);

    res.json({
      success: true,
      data: { response }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/ai/churn-risk/:customerId
// @desc    Get churn risk prediction for a customer
// @access  Private
router.get('/churn-risk/:customerId', protect, async (req, res) => {
  try {
    const risk = await AIService.predictChurnRisk(req.params.customerId);
    
    // Update customer's churn risk
    await Customer.findByIdAndUpdate(req.params.customerId, {
      'churnRisk.score': risk.riskScore,
      'churnRisk.level': risk.riskLevel,
      'churnRisk.factors': risk.factors,
      'churnRisk.lastUpdated': new Date()
    });

    res.json({
      success: true,
      data: risk
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   POST /api/ai/email-response
// @desc    Generate email response
// @access  Private
router.post('/email-response', protect, async (req, res) => {
  try {
    const { interaction } = req.body;
    const response = AIService.generateEmailResponse(interaction);

    res.json({
      success: true,
      data: { response }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router; 