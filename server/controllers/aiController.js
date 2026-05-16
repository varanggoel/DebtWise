const Debt = require('../models/Debt');
const ChatHistory = require('../models/ChatHistory');
const aiService = require('../services/aiService');

// In-memory cache: { [userId]: { advice, provider, ts } }
const recommendationCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

exports.getRecommendations = async (req, res, next) => {
  try {
    const debts = await Debt.find({ userId: req.user._id }).sort({ balance: -1 });
    if (!debts.length) {
      return res.json({
        advice: 'Add your debts first to get personalized advice.',
        provider: aiService.getProviderName(),
        alerts: [],
      });
    }

    const cacheKey = req.user._id.toString();
    const cached = recommendationCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return res.json({ advice: cached.advice, provider: cached.provider, alerts: generateAlerts(debts) });
    }

    const advice = await aiService.getDebtAdvice(debts, req.user);
    const provider = aiService.getProviderName();
    recommendationCache.set(cacheKey, { advice, provider, ts: Date.now() });

    res.json({ advice, provider, alerts: generateAlerts(debts) });
  } catch (err) {
    console.error('AI recommendations error:', err.message);
    next(err);
  }
};

exports.getAlerts = async (req, res, next) => {
  try {
    const debts = await Debt.find({ userId: req.user._id });
    res.json({ alerts: generateAlerts(debts) });
  } catch (err) {
    next(err);
  }
};

exports.getBudgetAdvice = async (req, res, next) => {
  try {
    const { income, expenses, month, year } = req.body;
    if (!income || !expenses?.length) {
      return res.status(400).json({ message: 'Save your budget first before requesting advice.' });
    }
    const debts = await Debt.find({ userId: req.user._id });
    const advice = await aiService.getBudgetAdvice({ income, expenses, month, year }, debts, req.user);
    res.json({ advice, provider: aiService.getProviderName() });
  } catch (err) {
    next(err);
  }
};

exports.chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message is required' });

    const debts = await Debt.find({ userId: req.user._id }).sort({ balance: -1 });
    const reply = await aiService.chat(message, debts, req.user);

    // Persist chat history
    await ChatHistory.findOneAndUpdate(
      { userId: req.user._id },
      {
        $push: {
          messages: {
            $each: [
              { role: 'user', text: message },
              { role: 'ai', text: reply },
            ],
          },
        },
        updatedAt: Date.now(),
      },
      { upsert: true }
    );

    res.json({ reply, provider: aiService.getProviderName() });
  } catch (err) {
    next(err);
  }
};

exports.getChatHistory = async (req, res, next) => {
  try {
    const history = await ChatHistory.findOne({ userId: req.user._id });
    res.json(history ? history.messages.slice(-50) : []);
  } catch (err) {
    next(err);
  }
};

exports.clearChatHistory = async (req, res, next) => {
  try {
    await ChatHistory.findOneAndUpdate(
      { userId: req.user._id },
      { messages: [], updatedAt: Date.now() }
    );
    res.json({ message: 'Chat history cleared' });
  } catch (err) {
    next(err);
  }
};

function generateAlerts(debts) {
  const alerts = [];
  const totalBalance = debts.reduce((s, d) => s + d.balance, 0);
  const totalMin = debts.reduce((s, d) => s + d.minPayment, 0);

  debts.forEach((d) => {
    if (d.interestRate >= 25) {
      alerts.push({ type: 'danger', message: `${d.name} has a very high APR of ${d.interestRate}% — consider prioritizing this debt.` });
    }
    const monthlyInterest = (d.balance * d.interestRate) / 100 / 12;
    if (monthlyInterest > d.minPayment * 0.8) {
      alerts.push({ type: 'warning', message: `${d.name}: most of your minimum payment goes to interest (₹${monthlyInterest.toFixed(0)}/mo). You may be in a debt trap.` });
    }
  });

  if (debts.length >= 5) {
    alerts.push({ type: 'info', message: `You have ${debts.length} active debts. Consolidation may reduce your total interest burden.` });
  }

  return alerts;
}
