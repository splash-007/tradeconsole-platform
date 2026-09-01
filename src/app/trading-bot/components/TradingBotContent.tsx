'use client';
import React, { useState, useEffect } from 'react';
import { tradingBotService, Bot, BotConfig, MarketType, BotStrategy, AnalysisResult } from '@/services/trading-bot.service';
import { Bot as BotIcon, Play, Pause, Square, ChevronRight, ChevronDown, AlertTriangle, CheckCircle, Loader2, TrendingUp, TrendingDown, Minus, BarChart2, Zap, Info } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type TabKey = 'builder' | 'active' | 'paused' | 'completed';

const MARKET_TYPES: { key: MarketType; label: string; desc: string; tags: string[] }[] = [
  { key: 'SPOT', label: 'Spot', desc: 'Asset accumulation with 1× exposure. No liquidation risk from leverage.', tags: ['1× Exposure', 'No Liquidation', 'Asset Ownership'] },
  { key: 'PERPETUAL_FUTURES', label: 'Perpetual Futures', desc: 'Long/Short with leverage. Margin and liquidation risk. Strong risk controls required.', tags: ['Long / Short', 'Leverage-Capable', 'Liquidation Risk'] },
  { key: 'OPTIONS', label: 'Options', desc: 'Calls/Puts with premium-based strategies. Expiry and strike considerations apply.', tags: ['Calls / Puts', 'Premium-Based', 'Expiry / Strike'] },
];

const ASSET_PAIRS: Record<string, string[]> = {
  SPOT: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT', 'EUR/USD', 'GBP/USD', 'XAU/USD'],
  PERPETUAL_FUTURES: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT', 'DOGE/USDT'],
  OPTIONS: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'],
};

const STRATEGY_LABELS: Record<BotStrategy, string> = {
  GRID: 'Grid Strategy',
  DCA: 'DCA Strategy',
  MOMENTUM: 'Momentum Strategy',
  TECHNICAL: 'Technical Indicator Strategy',
  ARBITRAGE: 'Arbitrage Strategy',
};

const RISK_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };
const STATUS_COLORS: Record<string, string> = { active: '#22c55e', paused: '#f59e0b', completed: '#6b7280', error: '#ef4444' };

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: Step; total: number }) {
  return (
    <div className="flex items-center gap-1 mb-6">
      {Array.from({ length: total }, (_, i) => {
        const n = (i + 1) as Step;
        const done = n < current;
        const active = n === current;
        return (
          <React.Fragment key={n}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all"
              style={{
                backgroundColor: done ? 'var(--positive)' : active ? 'var(--primary)' : 'var(--muted)',
                color: done || active ? '#000' : 'var(--muted-foreground)',
              }}
            >
              {done ? <CheckCircle size={14} /> : n}
            </div>
            {i < total - 1 && (
              <div className="flex-1 h-px" style={{ backgroundColor: done ? 'var(--positive)' : 'var(--border)' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function BotCard({ bot, onAction }: { bot: Bot; onAction: (id: string, action: 'start' | 'pause' | 'stop') => void }) {
  const isPos = bot.pnl >= 0;
  return (
    <div className="rounded-lg border p-4 space-y-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{bot.name}</span>
            <span className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: `${STATUS_COLORS[bot.status]}18`, color: STATUS_COLORS[bot.status] }}>
              {bot.status.charAt(0).toUpperCase() + bot.status.slice(1)}
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{bot.symbol} · {STRATEGY_LABELS[bot.strategy]} · {bot.market.replace('_', ' ')}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold tabular-nums font-mono" style={{ color: isPos ? '#22c55e' : '#ef4444' }}>
            {isPos ? '+' : ''}${bot.pnl.toFixed(2)}
          </p>
          <p className="text-xs tabular-nums" style={{ color: isPos ? '#22c55e' : '#ef4444' }}>
            {isPos ? '+' : ''}{bot.pnlPct.toFixed(2)}%
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded p-2" style={{ backgroundColor: 'var(--muted)' }}>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Allocation</p>
          <p className="text-xs font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>${bot.allocation.toLocaleString()}</p>
        </div>
        <div className="rounded p-2" style={{ backgroundColor: 'var(--muted)' }}>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Risk</p>
          <p className="text-xs font-semibold capitalize" style={{ color: RISK_COLORS[bot.risk] }}>{bot.risk}</p>
        </div>
        <div className="rounded p-2" style={{ backgroundColor: 'var(--muted)' }}>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Created</p>
          <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{new Date(bot.created).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-1">
        {bot.status === 'paused' && (
          <button onClick={() => onAction(bot.id, 'start')} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all hover:opacity-90" style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
            <Play size={11} /> Resume
          </button>
        )}
        {bot.status === 'active' && (
          <button onClick={() => onAction(bot.id, 'pause')} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all hover:opacity-90" style={{ backgroundColor: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
            <Pause size={11} /> Pause
          </button>
        )}
        {(bot.status === 'active' || bot.status === 'paused') && (
          <button onClick={() => onAction(bot.id, 'stop')} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all hover:opacity-90" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>
            <Square size={11} /> Stop
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TradingBotContent() {
  const [tab, setTab] = useState<TabKey>('builder');
  const [step, setStep] = useState<Step>(1);
  const [marketType, setMarketType] = useState<MarketType | null>(null);
  const [selectedPair, setSelectedPair] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [investment, setInvestment] = useState('1000');
  const [leverage, setLeverage] = useState('5');
  const [stopLoss, setStopLoss] = useState('3.5');
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [bots, setBots] = useState<Bot[]>([]);
  const [configExpanded, setConfigExpanded] = useState(false);

  useEffect(() => {
    tradingBotService.getBots().then(setBots);
  }, []);

  const activeBots = bots.filter(b => b.status === 'active');
  const pausedBots = bots.filter(b => b.status === 'paused');
  const completedBots = bots.filter(b => b.status === 'completed');

  const handleAnalyze = async () => {
    if (!marketType || !selectedPair) return;
    setAnalyzing(true);
    setStep(3);
    const result = await tradingBotService.analyzeMarket(selectedPair, marketType);
    setAnalysis(result);
    setAnalyzing(false);
    setStep(4);
  };

  const handleDeploy = async () => {
    if (!analysis) return;
    setDeploying(true);
    setStep(7);
    const config: BotConfig = {
      ...analysis.suggestedConfig,
      parameters: {
        ...analysis.suggestedConfig.parameters,
        investment_amount_usdt: parseFloat(investment),
        leverage: marketType === 'PERPETUAL_FUTURES' ? parseFloat(leverage) : undefined,
        stop_loss_percentage: parseFloat(stopLoss),
      },
    };
    await tradingBotService.deployBot(config);
    setDeploying(false);
    setDeployed(true);
    tradingBotService.getBots().then(setBots);
  };

  const handleBotAction = async (id: string, action: 'start' | 'pause' | 'stop') => {
    if (action === 'start') await tradingBotService.startBot(id);
    else if (action === 'pause') await tradingBotService.pauseBot(id);
    else await tradingBotService.stopBot(id);
    setBots(prev => prev.map(b => b.id === id ? { ...b, status: action === 'start' ? 'active' : action === 'pause' ? 'paused' : 'completed' } : b));
  };

  const resetBuilder = () => {
    setStep(1); setMarketType(null); setSelectedPair(''); setAnalysis(null); setDeployed(false);
  };

  const TAB_ITEMS: { key: TabKey; label: string; count?: number }[] = [
    { key: 'builder', label: 'Bot Builder' },
    { key: 'active', label: 'Active', count: activeBots.length },
    { key: 'paused', label: 'Paused', count: pausedBots.length },
    { key: 'completed', label: 'Completed', count: completedBots.length },
  ];

  return (
    <div className="py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
            <BotIcon size={18} style={{ color: 'var(--primary)' }} />
            Trading Bot
          </h1>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>AI-powered automated strategy workspace</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(245,196,0,0.1)', color: 'var(--primary)', border: '1px solid rgba(245,196,0,0.25)' }}>
            {activeBots.length} Active Bot{activeBots.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b" style={{ borderColor: 'var(--border)' }}>
        {TAB_ITEMS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-all -mb-px"
            style={{
              borderBottomColor: tab === t.key ? 'var(--primary)' : 'transparent',
              color: tab === t.key ? 'var(--primary)' : 'var(--muted-foreground)',
            }}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-xs" style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)', fontSize: '10px' }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bot Builder Tab */}
      {tab === 'builder' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Left: Steps */}
          <div className="xl:col-span-2 space-y-4">
            {/* Step progress */}
            <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <StepIndicator current={step} total={7} />
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {['Market Type', 'Asset / Pair', 'Analyze Market', 'Strategy', 'Risk Parameters', 'Review', 'Deploy'].map((s, i) => (
                  <React.Fragment key={s}>
                    <span style={{ color: step === i + 1 ? 'var(--primary)' : step > i + 1 ? 'var(--foreground)' : 'var(--muted-foreground)', fontWeight: step === i + 1 ? 600 : 400 }}>{s}</span>
                    {i < 6 && <ChevronRight size={10} />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* STEP 1: Market Type */}
            {step >= 1 && (
              <div className="rounded-lg border p-4 space-y-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Step 1 — Select Market Type</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {MARKET_TYPES.map(mt => (
                    <button
                      key={mt.key}
                      onClick={() => { setMarketType(mt.key); if (step === 1) setStep(2); }}
                      className="text-left p-3 rounded-lg border transition-all"
                      style={{
                        borderColor: marketType === mt.key ? 'var(--primary)' : 'var(--border)',
                        backgroundColor: marketType === mt.key ? 'rgba(245,196,0,0.06)' : 'var(--muted)',
                      }}
                    >
                      <p className="text-xs font-semibold mb-1" style={{ color: marketType === mt.key ? 'var(--primary)' : 'var(--foreground)' }}>{mt.label}</p>
                      <p className="text-xs mb-2" style={{ color: 'var(--muted-foreground)', lineHeight: 1.5 }}>{mt.desc}</p>
                      <div className="flex flex-wrap gap-1">
                        {mt.tags.map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--card)', color: 'var(--muted-foreground)', fontSize: '10px' }}>{tag}</span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Asset Pair */}
            {step >= 2 && marketType && (
              <div className="rounded-lg border p-4 space-y-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Step 2 — Select Asset / Pair</h3>
                <div className="flex flex-wrap gap-2">
                  {(ASSET_PAIRS[marketType] || []).map(pair => (
                    <button
                      key={pair}
                      onClick={() => { setSelectedPair(pair); if (step === 2) setStep(3); }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        backgroundColor: selectedPair === pair ? 'rgba(245,196,0,0.15)' : 'var(--muted)',
                        color: selectedPair === pair ? 'var(--primary)' : 'var(--foreground)',
                        border: `1px solid ${selectedPair === pair ? 'rgba(245,196,0,0.4)' : 'var(--border)'}`,
                      }}
                    >
                      {pair}
                    </button>
                  ))}
                </div>
                {selectedPair && step === 3 && !analyzing && !analysis && (
                  <button
                    onClick={handleAnalyze}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90 mt-2"
                    style={{ backgroundColor: 'var(--primary)', color: '#000' }}
                  >
                    <BarChart2 size={13} />
                    Analyze {selectedPair}
                  </button>
                )}
              </div>
            )}

            {/* STEP 3: Analyzing */}
            {analyzing && (
              <div className="rounded-lg border p-6 flex flex-col items-center gap-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary)' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Analyzing {selectedPair}…</p>
                <div className="space-y-1 text-center">
                  {['Fetching OHLCV data (4H / 1H)', 'Reading order book depth', 'Calculating ATR & volatility', 'Generating strategy recommendation'].map(s => (
                    <p key={s} className="text-xs" style={{ color: 'var(--muted-foreground)' }}>⟳ {s}</p>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4+: Analysis Result */}
            {analysis && !analyzing && (
              <>
                {/* Data Sources */}
                <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted-foreground)' }}>DATA SOURCES ANALYZED</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.dataSources.map(ds => (
                      <span key={ds} className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                        <CheckCircle size={10} /> {ds}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Analysis Overview */}
                <div className="rounded-lg border p-4 space-y-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-base">🔎</span>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Data Analysis Overview</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Trend', value: analysis.trend, icon: analysis.trend === 'bullish' ? <TrendingUp size={12} style={{ color: '#22c55e' }} /> : analysis.trend === 'bearish' ? <TrendingDown size={12} style={{ color: '#ef4444' }} /> : <Minus size={12} style={{ color: '#f59e0b' }} /> },
                      { label: 'Volatility', value: analysis.volatility, icon: <Zap size={12} style={{ color: 'var(--primary)' }} /> },
                      { label: 'Support', value: `$${analysis.support.toLocaleString()}`, icon: null },
                      { label: 'Resistance', value: `$${analysis.resistance.toLocaleString()}`, icon: null },
                    ].map(item => (
                      <div key={item.label} className="rounded p-2.5" style={{ backgroundColor: 'var(--muted)' }}>
                        <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>{item.label}</p>
                        <div className="flex items-center gap-1">
                          {item.icon}
                          <p className="text-xs font-semibold capitalize" style={{ color: 'var(--foreground)' }}>{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{analysis.rationale}</p>
                </div>

                {/* Recommended Strategy */}
                <div className="rounded-lg border p-4 space-y-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-base">💡</span>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Recommended Bot Strategy</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-lg text-sm font-bold" style={{ backgroundColor: 'rgba(245,196,0,0.15)', color: 'var(--primary)', border: '1px solid rgba(245,196,0,0.3)' }}>
                      {STRATEGY_LABELS[analysis.recommendedStrategy]}
                    </div>
                    <div className="px-2.5 py-1 rounded text-xs font-medium" style={{ backgroundColor: `${RISK_COLORS[analysis.riskLevel]}18`, color: RISK_COLORS[analysis.riskLevel] }}>
                      {analysis.riskLevel.charAt(0).toUpperCase() + analysis.riskLevel.slice(1)} Risk
                    </div>
                  </div>
                  {analysis.suggestedConfig.parameters.lower_bound && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { label: 'Grid Lower', value: `$${analysis.suggestedConfig.parameters.lower_bound?.toLocaleString()}` },
                        { label: 'Grid Upper', value: `$${analysis.suggestedConfig.parameters.upper_bound?.toLocaleString()}` },
                        { label: 'Grid Count', value: `${analysis.suggestedConfig.parameters.grid_count} levels` },
                      ].map(item => (
                        <div key={item.label} className="rounded p-2" style={{ backgroundColor: 'var(--muted)' }}>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.label}</p>
                          <p className="text-xs font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* STEP 5: Risk Parameters */}
                <div className="rounded-lg border p-4 space-y-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚠️</span>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Risk Mitigation Parameters</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Investment Amount (USDT)</label>
                      <input
                        type="number"
                        value={investment}
                        onChange={e => setInvestment(e.target.value)}
                        className="w-full px-3 py-2 rounded-md text-xs border focus:outline-none"
                        style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                      />
                    </div>
                    {marketType === 'PERPETUAL_FUTURES' && (
                      <div>
                        <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Leverage (max 10×)</label>
                        <input
                          type="number"
                          value={leverage}
                          min={1}
                          max={10}
                          onChange={e => setLeverage(e.target.value)}
                          className="w-full px-3 py-2 rounded-md text-xs border focus:outline-none"
                          style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                        />
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Stop Loss (%)</label>
                      <input
                        type="number"
                        value={stopLoss}
                        onChange={e => setStopLoss(e.target.value)}
                        className="w-full px-3 py-2 rounded-md text-xs border focus:outline-none"
                        style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                      />
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 rounded-lg" style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <AlertTriangle size={13} style={{ color: '#ef4444', marginTop: 1, shrink: 0 }} />
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      All bot strategies involve market risk. Past performance is not indicative of future results. Never allocate more than you can afford to lose. This is quantitative analysis, not a guarantee of returns.
                    </p>
                  </div>
                  {step < 6 && (
                    <button onClick={() => setStep(6)} className="px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
                      Review Configuration →
                    </button>
                  )}
                </div>

                {/* STEP 6: Review + Config Preview */}
                {step >= 6 && (
                  <div className="rounded-lg border p-4 space-y-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Bot Configuration Preview</h3>
                      <button onClick={() => setConfigExpanded(!configExpanded)} className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {configExpanded ? 'Collapse' : 'Expand'} <ChevronDown size={12} style={{ transform: configExpanded ? 'rotate(180deg)' : undefined }} />
                      </button>
                    </div>
                    <div className="rounded-lg p-3 font-mono text-xs space-y-1" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {[
                          ['Market Type', analysis.recommendedMarketType],
                          ['Symbol', selectedPair],
                          ['Strategy', STRATEGY_LABELS[analysis.recommendedStrategy]],
                          ['Investment', `$${parseFloat(investment).toLocaleString()} USDT`],
                          ...(marketType === 'PERPETUAL_FUTURES' ? [['Leverage', `${leverage}×`]] : []),
                          ['Stop Loss', `${stopLoss}%`],
                          ...(analysis.suggestedConfig.parameters.lower_bound ? [
                            ['Grid Lower', `$${analysis.suggestedConfig.parameters.lower_bound.toLocaleString()}`],
                            ['Grid Upper', `$${analysis.suggestedConfig.parameters.upper_bound?.toLocaleString()}`],
                            ['Grid Count', `${analysis.suggestedConfig.parameters.grid_count} levels`],
                          ] : []),
                        ].map(([k, v]) => (
                          <React.Fragment key={k}>
                            <span style={{ color: 'var(--muted-foreground)' }}>{k}</span>
                            <span style={{ color: 'var(--foreground)' }}>{v}</span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {!deployed ? (
                      <div className="flex items-center gap-3">
                        <button onClick={() => setStep(5)} className="px-4 py-2 rounded-lg text-xs font-semibold border transition-all hover:bg-muted" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                          ← Edit Parameters
                        </button>
                        <button
                          onClick={handleDeploy}
                          disabled={deploying}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                          style={{ backgroundColor: 'var(--primary)', color: '#000' }}
                        >
                          {deploying ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                          {deploying ? 'Deploying…' : 'Deploy Bot'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
                        <CheckCircle size={16} style={{ color: '#22c55e' }} />
                        <div>
                          <p className="text-xs font-semibold" style={{ color: '#22c55e' }}>Bot deployed successfully</p>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>View it in the Active Bots tab</p>
                        </div>
                        <button onClick={resetBuilder} className="ml-auto px-3 py-1.5 rounded text-xs font-semibold" style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}>
                          New Bot
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right: AI Assistant Panel */}
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(245,196,0,0.15)', border: '1px solid rgba(245,196,0,0.3)' }}>
                  <BotIcon size={14} style={{ color: 'var(--primary)' }} />
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>AI Quant Assistant</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Trade Console · Sep 2, 2026</p>
                </div>
              </div>
              <div className="p-3 rounded-lg text-xs leading-relaxed" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                {!marketType && 'Select a market type to begin. I\'ll guide you through market selection, analysis, and strategy configuration.'}
                {marketType && !selectedPair && `${marketType.replace('_', ' ')} selected. Now choose an asset pair to analyze.`}
                {selectedPair && !analysis && !analyzing && `Ready to analyze ${selectedPair}. Click "Analyze" to fetch OHLCV, order book depth, and volatility data.`}
                {analyzing && `Analyzing ${selectedPair} across multiple data sources. Identifying trend, volatility regime, and optimal strategy parameters…`}
                {analysis && !deployed && `Analysis complete for ${selectedPair}. Trend is ${analysis.trend} with ${analysis.volatility} volatility. ${STRATEGY_LABELS[analysis.recommendedStrategy]} is recommended. Review risk parameters before deploying.`}
                {deployed && 'Bot deployed. Monitor performance in the Active Bots tab. All recommendations are quantitative analysis — not guaranteed returns.'}
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded" style={{ backgroundColor: 'rgba(245,196,0,0.05)', border: '1px solid rgba(245,196,0,0.15)' }}>
                <Info size={11} style={{ color: 'var(--primary)', marginTop: 1 }} />
                <p className="text-xs" style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>
                  Recommendations are quantitative observations and probabilities, not guaranteed outcomes. All trading involves risk.
                </p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="rounded-lg border p-4 space-y-2" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>BOT OVERVIEW</p>
              {[
                { label: 'Active Bots', value: activeBots.length, color: '#22c55e' },
                { label: 'Paused Bots', value: pausedBots.length, color: '#f59e0b' },
                { label: 'Total Allocated', value: `$${bots.reduce((s, b) => s + b.allocation, 0).toLocaleString()}`, color: 'var(--foreground)' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.label}</span>
                  <span className="text-xs font-semibold tabular-nums" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bot Management Tabs */}
      {tab !== 'builder' && (
        <div>
          {tab === 'active' && (
            <div>
              {activeBots.length === 0 ? (
                <div className="rounded-lg border flex flex-col items-center justify-center py-16 gap-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <BotIcon size={28} style={{ color: 'var(--muted-foreground)', opacity: 0.4 }} />
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No active bots</p>
                  <button onClick={() => setTab('builder')} className="px-4 py-2 rounded-lg text-xs font-semibold" style={{ backgroundColor: 'rgba(245,196,0,0.15)', color: 'var(--primary)', border: '1px solid rgba(245,196,0,0.3)' }}>
                    Create Bot
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {activeBots.map(bot => <BotCard key={bot.id} bot={bot} onAction={handleBotAction} />)}
                </div>
              )}
            </div>
          )}
          {tab === 'paused' && (
            <div>
              {pausedBots.length === 0 ? (
                <div className="rounded-lg border flex flex-col items-center justify-center py-16 gap-2" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <Pause size={28} style={{ color: 'var(--muted-foreground)', opacity: 0.4 }} />
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No paused bots</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {pausedBots.map(bot => <BotCard key={bot.id} bot={bot} onAction={handleBotAction} />)}
                </div>
              )}
            </div>
          )}
          {tab === 'completed' && (
            <div>
              {completedBots.length === 0 ? (
                <div className="rounded-lg border flex flex-col items-center justify-center py-16 gap-2" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <CheckCircle size={28} style={{ color: 'var(--muted-foreground)', opacity: 0.4 }} />
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No completed bots</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {completedBots.map(bot => <BotCard key={bot.id} bot={bot} onAction={handleBotAction} />)}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
