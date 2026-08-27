// BACKEND INTEGRATION: POST /api/v1/ai/market-analysis
// Ready to connect OpenAI (gpt-4o) or Anthropic (claude-3-5-sonnet) — currently uses mock provider

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface MarketContext {
  symbol?: string;
  price?: number;
  change24h?: number;
}

const MOCK_RESPONSES: Record<string, string> = {
  default: "Based on current market conditions, I'm seeing mixed signals across major crypto assets. BTC is consolidating near key support levels while ETH shows relative strength. Would you like me to analyze a specific asset or market segment?",
  btc: "Bitcoin is currently trading in a tight range between $65,800–$67,200. On-chain data shows accumulation by long-term holders. The 200-day MA sits at $58,400, providing strong support. Short-term momentum indicators are neutral — watch for a breakout above $67,500 for bullish continuation.",
  eth: "Ethereum is showing strength relative to BTC with a 0.8% gain in the last 24h. Staking yields remain at ~3.8% APY. Layer-2 activity is up 12% week-over-week. Key resistance at $3,720; support at $3,580.",
  trend: "Current macro trend: Risk-on sentiment is cautiously positive. DXY weakening slightly, which historically correlates with crypto strength. Institutional flows into spot ETFs remain steady at ~$180M/day average this week.",
  analysis: "Technical analysis summary: BTC RSI at 54 (neutral), MACD showing bullish crossover on 4H. ETH/BTC ratio trending up — altcoin season indicators at 42/100. Recommend watching BTC dominance for rotation signals.",
  deposit: "Regarding client deposit patterns: High-value clients (>$50K) tend to deposit via bank transfer with 2–3 day settlement. Crypto deposits settle in 1–6 confirmations. Encourage clients to use stablecoins for faster settlement and lower volatility risk.",
  withdraw: "Withdrawal risk analysis: Sudden large withdrawal requests (>20% of portfolio) may indicate client dissatisfaction. Best practice: proactive outreach before processing to understand intent and potentially retain assets.",
};

function getMockResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('bitcoin') || lower.includes('btc')) return MOCK_RESPONSES.btc;
  if (lower.includes('ethereum') || lower.includes('eth')) return MOCK_RESPONSES.eth;
  if (lower.includes('trend') || lower.includes('market')) return MOCK_RESPONSES.trend;
  if (lower.includes('analys') || lower.includes('technical')) return MOCK_RESPONSES.analysis;
  if (lower.includes('deposit')) return MOCK_RESPONSES.deposit;
  if (lower.includes('withdraw')) return MOCK_RESPONSES.withdraw;
  return MOCK_RESPONSES.default;
}

export const marketAIService = {
  async sendMessage(
    messages: AIMessage[],
    userMessage: string,
    context?: MarketContext
  ): Promise<AIMessage> {
    // BACKEND INTEGRATION:
    // Option A — OpenAI:
    //   POST /api/ai/market-chat with { messages, model: 'gpt-4o', context }
    //   Uses src/app/api/chat/route.ts (prepared by prepare_ai_integration_nextjs)
    //
    // Option B — Anthropic Claude:
    //   POST /api/ai/market-chat with { messages, model: 'claude-3-5-sonnet-20241022', context }
    //
    // For now: mock provider with realistic delay

    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));

    const response = getMockResponse(userMessage);

    return {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
    };
  },

  getSystemPrompt(context?: MarketContext): string {
    return `You are a professional crypto market analyst assistant for CryptoVault agents. 
You help agents understand market trends, analyze client portfolios, and make informed decisions.
${context?.symbol ? `Current instrument: ${context.symbol} at $${context.price?.toLocaleString()}` : ''}
Provide concise, actionable insights. Always note that this is analysis, not financial advice.`;
  },
};
