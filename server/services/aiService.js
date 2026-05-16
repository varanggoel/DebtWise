const geminiService = require('./geminiService');
const deepseekService = require('./deepseekService');

function getProvider() {
  const provider = process.env.AI_PROVIDER?.toLowerCase();
  if (provider === 'deepseek') return deepseekService;
  return geminiService;
}

function buildDebtProfileText(debts, user) {
  if (!debts.length) return 'No debts recorded yet.';

  const totalBalance = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalMin = debts.reduce((sum, d) => sum + d.minPayment, 0);
  const weightedAPR = debts.reduce((sum, d) => sum + d.balance * d.interestRate, 0) / totalBalance;

  const debtList = debts
    .map(
      (d) =>
        `  - ${d.name} (${d.type.replace(/_/g, ' ')}): ₹${d.balance.toFixed(2)} balance, ${d.interestRate}% APR, ₹${d.minPayment.toFixed(2)}/mo min payment${d.dueDate ? `, due ${d.dueDate}th` : ''}`
    )
    .join('\n');

  return `User: ${user.name}
Total Debt: ₹${totalBalance.toFixed(2)}
Weighted Average APR: ${weightedAPR.toFixed(2)}%
Total Minimum Payments: ₹${totalMin.toFixed(2)}/month

Individual Debts:
${debtList}`;
}

function buildRecommendationPrompt(profileText) {
  return `You are a certified financial counselor specializing in debt management in India. All amounts are in Indian Rupees (INR). IMPORTANT: Always use the ₹ symbol for currency — never use $ or USD. Reference Indian financial context where relevant (RBI guidelines, Indian loan market rates, etc.).
Analyze the following debt profile and provide:
1. A prioritized list of 3-5 actionable recommendations
2. Identification of any high-risk "debt traps" (e.g., high-APR credit cards, minimum payment cycles)
3. One encouraging insight about their situation

Keep your response practical, empathetic, and under 400 words. Use plain language. Use ₹ for all currency amounts.

DEBT PROFILE:
${profileText}`;
}

module.exports = {
  async getDebtAdvice(debts, user) {
    const profileText = buildDebtProfileText(debts, user);
    const prompt = buildRecommendationPrompt(profileText);
    return getProvider().generateText(prompt);
  },

  async chat(userMessage, debts, user) {
    const profileText = buildDebtProfileText(debts, user);
    const systemContext = `You are a helpful debt management assistant. Answer questions concisely and practically. All amounts are in Indian Rupees. IMPORTANT: Always use ₹ symbol for currency — never use $ or USD.
The user's current debt profile is:
${profileText}`;
    return getProvider().generateChat(systemContext, userMessage);
  },

  async getBudgetAdvice(budget, debts, user) {
    const totalExpenses = budget.expenses.reduce((s, e) => s + e.amount, 0);
    const surplus = budget.income - totalExpenses;
    const totalDebtMin = debts.reduce((s, d) => s + d.minPayment, 0);

    const expenseLines = budget.expenses
      .sort((a, b) => b.amount - a.amount)
      .map((e) => {
        const pct = budget.income > 0 ? ((e.amount / budget.income) * 100).toFixed(1) : 0;
        return `  - ${e.category}: ₹${e.amount.toLocaleString('en-IN')} (${pct}% of income)`;
      })
      .join('\n');

    const prompt = `You are a personal finance advisor in India. All amounts are in Indian Rupees (₹). IMPORTANT: Always use ₹ symbol — never use $ or USD.

Analyze this monthly budget and provide specific, actionable advice to reduce spending and increase the debt repayment surplus.

BUDGET FOR ${budget.month}/${budget.year}:
Monthly Income: ₹${budget.income.toLocaleString('en-IN')}
Total Expenses: ₹${totalExpenses.toLocaleString('en-IN')}
Current Surplus: ₹${surplus.toLocaleString('en-IN')}
Total Minimum Debt Payments: ₹${totalDebtMin.toLocaleString('en-IN')}

Expense Breakdown:
${expenseLines}

${debts.length ? `The user has ${debts.length} active debt(s) with total balance ₹${debts.reduce((s, d) => s + d.balance, 0).toLocaleString('en-IN')}.` : 'No debts recorded yet.'}

Please provide:
1. The top 2-3 expense categories that are unusually high (benchmark against typical Indian household spending)
2. Specific, practical tips to reduce each of those categories — include real Indian alternatives (e.g., meal prep vs Swiggy, BEST bus vs Ola)
3. How much extra could realistically be freed up and what impact that would have on debt repayment
4. One positive observation about this budget

Keep response under 350 words. Be direct and specific. Use ₹ for all amounts.`;

    return getProvider().generateText(prompt);
  },

  getProviderName() {
    const provider = process.env.AI_PROVIDER?.toLowerCase();
    return provider === 'deepseek' ? 'deepseek' : 'gemini';
  },
};
