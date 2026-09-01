'use client';
import React, { useState } from 'react';
import { BookOpen, TrendingUp, BarChart2, Shield, Newspaper, Search, Clock, ChevronRight, Zap, Globe, GraduationCap } from 'lucide-react';


interface Article {
  id: string;
  title: string;
  summary: string;
  category: string;
  readTime: string;
  date: string;
  tag: string;
  tagColor: string;
}

const MARKET_NEWS: Article[] = [
  { id: 'n1', title: 'Federal Reserve Signals Potential Rate Cut Amid Cooling Inflation Data', summary: 'FOMC minutes reveal growing consensus among policymakers that monetary easing may be appropriate as CPI trends toward target.', category: 'Macro', readTime: '3 min', date: 'Sep 1, 2026', tag: 'Breaking', tagColor: '#ef4444' },
  { id: 'n2', title: 'Bitcoin Consolidates Near $68,000 as Institutional Demand Remains Elevated', summary: 'On-chain data shows continued accumulation by large wallets, while ETF inflows sustain positive momentum heading into Q4.', category: 'Crypto', readTime: '4 min', date: 'Sep 1, 2026', tag: 'Markets', tagColor: '#f59e0b' },
  { id: 'n3', title: 'S&P 500 Approaches All-Time High as Tech Earnings Beat Expectations', summary: 'Strong quarterly results from major technology companies push equity indices higher, with the S&P 500 within 1.2% of its record close.', category: 'Equities', readTime: '3 min', date: 'Aug 31, 2026', tag: 'Markets', tagColor: '#f59e0b' },
  { id: 'n4', title: 'Gold Holds Above $2,400 as Dollar Weakens on Soft Economic Data', summary: 'Precious metals maintain elevated levels as the US Dollar Index retreats, with traders positioning for potential Fed easing.', category: 'Commodities', readTime: '2 min', date: 'Aug 31, 2026', tag: 'Commodities', tagColor: '#22c55e' },
];

const INSIGHTS: Article[] = [
  { id: 'i1', title: 'Understanding Market Volatility: ATR and What It Means for Your Strategy', summary: 'Average True Range (ATR) is one of the most useful volatility indicators for position sizing and stop-loss placement. Learn how to apply it.', category: 'Technical Analysis', readTime: '6 min', date: 'Aug 30, 2026', tag: 'Analysis', tagColor: '#3b82f6' },
  { id: 'i2', title: 'Forex Session Overlaps: When Liquidity Is Highest', summary: 'The London-New York overlap produces the highest trading volume in forex markets. Understanding session timing can improve execution quality.', category: 'Forex', readTime: '5 min', date: 'Aug 29, 2026', tag: 'Insight', tagColor: '#8b5cf6' },
  { id: 'i3', title: 'Order Book Depth: Reading Liquidity Before You Trade', summary: 'A deep order book indicates strong liquidity and tighter spreads. This guide explains how to interpret bid/ask depth for better entries.', category: 'Trading', readTime: '7 min', date: 'Aug 28, 2026', tag: 'Insight', tagColor: '#8b5cf6' },
];

const EDUCATION: { icon: React.ElementType; title: string; desc: string; lessons: number; level: string; color: string }[] = [
  { icon: BarChart2, title: 'Technical Analysis Fundamentals', desc: 'Learn chart patterns, indicators, and price action analysis used by professional traders.', lessons: 12, level: 'Beginner', color: '#3b82f6' },
  { icon: TrendingUp, title: 'Futures & Derivatives Trading', desc: 'Understand leverage, margin, liquidation, and risk management for futures markets.', lessons: 10, level: 'Intermediate', color: '#f59e0b' },
  { icon: Globe, title: 'Macroeconomics for Traders', desc: 'How central bank policy, inflation, and economic data move financial markets.', lessons: 8, level: 'Intermediate', color: '#22c55e' },
  { icon: Zap, title: 'Algorithmic & Bot Trading', desc: 'Introduction to automated strategies, grid bots, DCA, and quantitative approaches.', lessons: 9, level: 'Advanced', color: '#8b5cf6' },
  { icon: Shield, title: 'Risk Management Essentials', desc: 'Position sizing, stop losses, portfolio diversification, and capital preservation.', lessons: 7, level: 'Beginner', color: '#ef4444' },
  { icon: GraduationCap, title: 'Platform Guides', desc: 'Step-by-step guides for using Trade Console features: trading, bots, prediction markets, and more.', lessons: 15, level: 'All Levels', color: '#D4A800' },
];

const LEVEL_COLORS: Record<string, string> = {
  'Beginner': '#22c55e',
  'Intermediate': '#f59e0b',
  'Advanced': '#ef4444',
  'All Levels': '#D4A800',
};

export default function NewsLearnContent() {
  const [search, setSearch] = useState('');

  return (
    <div className="py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
            <BookOpen size={18} style={{ color: 'var(--primary)' }} />
            News &amp; Learn
          </h1>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Market news, trading insights, and financial education</p>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search articles…"
            className="pl-8 pr-3 py-2 rounded-md text-xs border focus:outline-none w-48"
            style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
        </div>
      </div>

      {/* Latest Market News */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Newspaper size={14} style={{ color: 'var(--primary)' }} />
            <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Latest Market News</h2>
          </div>
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Updated Sep 1, 2026</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MARKET_NEWS.filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase())).map(article => (
            <div key={article.id} className="rounded-lg border p-4 space-y-2 cursor-pointer transition-all hover:border-primary/30" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between gap-2">
                <span className="px-1.5 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: `${article.tagColor}15`, color: article.tagColor }}>
                  {article.tag}
                </span>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{article.category}</span>
              </div>
              <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--foreground)' }}>{article.title}</p>
              <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>{article.summary}</p>
              <div className="flex items-center gap-3 pt-1">
                <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  <Clock size={10} /> {article.readTime} read
                </span>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{article.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Market Insights */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} style={{ color: 'var(--primary)' }} />
          <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Market Insights</h2>
        </div>
        <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          {INSIGHTS.filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase())).map((article, i, arr) => (
            <div
              key={article.id}
              className="flex items-start gap-4 p-4 cursor-pointer transition-colors"
              style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--muted)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${article.tagColor}15` }}>
                <BarChart2 size={14} style={{ color: article.tagColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-1.5 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: `${article.tagColor}15`, color: article.tagColor }}>
                    {article.tag}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{article.category}</span>
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{article.title}</p>
                <p className="text-xs mt-1 leading-relaxed line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>{article.summary}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <Clock size={10} /> {article.readTime} read
                  </span>
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{article.date}</span>
                </div>
              </div>
              <ChevronRight size={14} className="shrink-0 mt-1" style={{ color: 'var(--muted-foreground)' }} />
            </div>
          ))}
        </div>
      </section>

      {/* Trading Education */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap size={14} style={{ color: 'var(--primary)' }} />
          <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Trading Education</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {EDUCATION.filter(e => !search || e.title.toLowerCase().includes(search.toLowerCase())).map((course, i) => (
            <div
              key={i}
              className="rounded-lg border p-4 space-y-3 cursor-pointer transition-all hover:border-primary/30"
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${course.color}15` }}>
                  <course.icon size={16} style={{ color: course.color }} />
                </div>
                <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ backgroundColor: `${LEVEL_COLORS[course.level]}15`, color: LEVEL_COLORS[course.level] }}>
                  {course.level}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{course.title}</p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{course.desc}</p>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{course.lessons} lessons</span>
                <button className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--primary)' }}>
                  Start <ChevronRight size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Risk Education Banner */}
      <section>
        <div className="rounded-lg border p-4 flex items-start gap-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
            <Shield size={18} style={{ color: '#ef4444' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Risk Education</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              Trading financial instruments involves significant risk of loss. Past performance is not indicative of future results. Never invest more than you can afford to lose. Trade Console provides educational content for informational purposes only — nothing here constitutes financial advice.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
