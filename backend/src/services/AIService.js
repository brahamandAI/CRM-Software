const Customer = require('../models/Customer');
const Interaction = require('../models/Interaction');
const Task = require('../models/Task');

class AIService {
  // Lead Scoring
  static async calculateLeadScore(customerId) {
    try {
      const customer = await Customer.findById(customerId)
        .populate('interactions')
        .populate('tasks');

      let score = 50; // Base score

      // Interaction frequency score (max 20 points)
      const interactions = await Interaction.find({ customer: customerId });
      const interactionScore = Math.min(interactions.length * 2, 20);
      score += interactionScore;

      // Positive interactions score (max 15 points)
      const positiveInteractions = interactions.filter(i => i.outcome === 'positive').length;
      const positiveScore = Math.min(positiveInteractions * 3, 15);
      score += positiveScore;

      // Task completion rate (max 15 points)
      const tasks = await Task.find({ customer: customerId });
      if (tasks.length > 0) {
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const taskScore = Math.min((completedTasks / tasks.length) * 15, 15);
        score += taskScore;
      }

      return Math.min(score, 100); // Cap at 100
    } catch (error) {
      console.error('Error calculating lead score:', error);
      return 50; // Return default score on error
    }
  }

  // Email Response Generation
  static generateEmailResponse(interaction) {
    // This is a simple template-based response system
    // In a production environment, you would integrate with OpenAI/GPT API
    const templates = {
      inquiry: "Thank you for your inquiry. We'll review your request and get back to you shortly.",
      support: "We're sorry to hear you're experiencing issues. Our team will investigate and respond soon.",
      feedback: "Thank you for your feedback. We greatly value your input and will use it to improve our services.",
      default: "Thank you for your message. We'll respond to you as soon as possible."
    };

    const type = interaction.type?.toLowerCase() || 'default';
    return templates[type] || templates.default;
  }

  // Sentiment Analysis
  static analyzeSentiment(text) {
    // Simple rule-based sentiment analysis
    // In production, you would use a proper NLP service
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'satisfied', 'thanks', 'love'];
    const negativeWords = ['bad', 'poor', 'unhappy', 'dissatisfied', 'issue', 'problem', 'hate'];

    const words = text.toLowerCase().split(/\s+/);
    let score = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) score++;
      if (negativeWords.includes(word)) score--;
    });

    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  }

  // Chatbot Response Generation
  static generateChatbotResponse(message) {
    // Simple rule-based chatbot
    // In production, you would integrate with a proper chatbot service
    const responses = {
      'pricing': 'Our pricing plans start from $99/month. Would you like to speak with a sales representative?',
      'support': 'Our support team is available 24/7. Please describe your issue and we\'ll help you right away.',
      'features': 'Our CRM includes contact management, task tracking, and analytics. Would you like a demo?',
      'default': 'Thank you for your message. How can I assist you today?'
    };

    const keywords = Object.keys(responses);
    const matchedKeyword = keywords.find(key => 
      message.toLowerCase().includes(key.toLowerCase())
    );

    return responses[matchedKeyword] || responses.default;
  }

  // Churn Prediction
  static async predictChurnRisk(customerId) {
    try {
      const customer = await Customer.findById(customerId);
      const interactions = await Interaction.find({ customer: customerId });
      const tasks = await Task.find({ customer: customerId });

      let riskScore = 0;

      // Factor 1: Recent interaction frequency
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentInteractions = interactions.filter(i => 
        new Date(i.date) > thirtyDaysAgo
      ).length;
      if (recentInteractions === 0) riskScore += 30;
      else if (recentInteractions < 3) riskScore += 15;

      // Factor 2: Negative interactions
      const recentNegativeInteractions = interactions
        .filter(i => 
          new Date(i.date) > thirtyDaysAgo && 
          i.outcome === 'negative'
        ).length;
      riskScore += recentNegativeInteractions * 10;

      // Factor 3: Task completion rate
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const taskCompletionRate = tasks.length > 0 ? 
        completedTasks / tasks.length : 0;
      if (taskCompletionRate < 0.5) riskScore += 20;

      // Factor 4: Status changes
      if (customer.statusHistory && customer.statusHistory.length > 0) {
        const recentStatusChanges = customer.statusHistory.filter(sh =>
          new Date(sh.date) > thirtyDaysAgo
        ).length;
        if (recentStatusChanges > 2) riskScore += 15;
      }

      return {
        riskScore: Math.min(riskScore, 100),
        riskLevel: riskScore > 70 ? 'High' : riskScore > 40 ? 'Medium' : 'Low',
        factors: {
          lowInteraction: recentInteractions === 0,
          negativeInteractions: recentNegativeInteractions > 0,
          poorTaskCompletion: taskCompletionRate < 0.5
        }
      };
    } catch (error) {
      console.error('Error predicting churn risk:', error);
      return {
        riskScore: 0,
        riskLevel: 'Unknown',
        factors: {}
      };
    }
  }
}

module.exports = AIService; 