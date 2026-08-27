'use client';
import React, { useState } from 'react';
import { PageHeader, Card, ActionButton } from '@/components/admin/AdminUI';

type SimState = 'idle' | 'running' | 'paused';

interface SimScenario {
  id: string;
  symbol: string;
  startPrice: number;
  direction: 'up' | 'down';
  targetPct: number;
  volatility: 'low' | 'medium' | 'high';
  durationMinutes: number;
  scheduledAt: string;
  state: SimState;
}

const INITIAL_SCENARIOS: SimScenario[] = [
  { id: 'sim-001', symbol: 'BTC/USDC', startPrice: 67842, direction: 'up', targetPct: 2.5, volatility: 'medium', durationMinutes: 15, scheduledAt: '14:30', state: 'idle' },
  { id: 'sim-002', symbol: 'ETH/USDC', startPrice: 3842, direction: 'down', targetPct: 1.8, volatility: 'low', durationMinutes: 20, scheduledAt: '16:00', state: 'idle' },
];

export default function SimulationLabContent() {
  const [scenarios, setScenarios] = useState<SimScenario[]>(INITIAL_SCENARIOS);
  const [newScenario, setNewScenario] = useState<Partial<SimScenario>>({
    symbol: 'BTC/USDC', direction: 'up', targetPct: 2.5, volatility: 'medium', durationMinutes: 15, scheduledAt: '14:30',
  });

  const updateState = (id: string, state: SimState) => {
    setScenarios(prev => prev.map(s => s.id === id ? { ...s, state } : s));
  };

  const addScenario = () => {
    const s: SimScenario = {
      id: `sim-${Date.now()}`,
      symbol: newScenario.symbol || 'BTC/USDC',
      startPrice: 67842,
      direction: newScenario.direction || 'up',
      targetPct: newScenario.targetPct || 2.5,
      volatility: newScenario.volatility || 'medium',
      durationMinutes: newScenario.durationMinutes || 15,
      scheduledAt: newScenario.scheduledAt || '14:30',
      state: 'idle',
    };
    setScenarios(prev => [...prev, s]);
  };

  const STATE_COLORS: Record<SimState, string> = { idle: '#6b7280', running: '#22c55e', paused: '#F5C400' };

  return (
    <div className="space-y-4">
      {/* SIMULATION MODE banner — always visible */}
      <div className="flex items-center justify-center gap-3 py-2 px-4 rounded border-2 text-sm font-bold tracking-widest"
        style={{ borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
        ⚠ SIMULATION MODE — Data generated here is NEVER real market data and must NEVER be presented to customers as LIVE prices
      </div>

      <PageHeader title="Simulation Lab" subtitle="Admin-only testing and scenario simulation — completely separate from live market data" />

      <div className="p-3 rounded border text-xs space-y-1" style={{ borderColor: 'rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.05)', color: 'var(--muted-foreground)' }}>
        <p><strong style={{ color: '#ef4444' }}>Safety Rules:</strong></p>
        <p>• Simulated data is clearly labeled <strong>SIMULATED</strong> — never <strong>LIVE</strong></p>
        <p>• Simulation environment must be set to <code>environment=simulation</code> on the backend</p>
        <p>• Simulated prices must NEVER silently replace genuine market data for real customer accounts</p>
        <p>• All simulation actions are recorded in the Audit Log</p>
      </div>

      {/* Active Scenarios */}
      <Card>
        <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Simulation Scenarios</h3>
        <div className="space-y-3">
          {scenarios.map(s => (
            <div key={s.id} className="flex items-center gap-4 p-3 rounded border" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATE_COLORS[s.state] }} />
                <span className="font-mono font-bold text-xs" style={{ color: 'var(--primary)' }}>{s.symbol}</span>
              </div>
              <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                <div><span style={{ color: 'var(--muted-foreground)' }}>Direction: </span><span style={{ color: s.direction === 'up' ? 'var(--positive)' : 'var(--negative)', fontWeight: 600 }}>{s.direction === 'up' ? '↑' : '↓'} {s.direction}</span></div>
                <div><span style={{ color: 'var(--muted-foreground)' }}>Target: </span><span style={{ color: 'var(--foreground)' }}>{s.direction === 'up' ? '+' : '-'}{s.targetPct}%</span></div>
                <div><span style={{ color: 'var(--muted-foreground)' }}>Duration: </span><span style={{ color: 'var(--foreground)' }}>{s.durationMinutes}m</span></div>
                <div><span style={{ color: 'var(--muted-foreground)' }}>Volatility: </span><span style={{ color: 'var(--foreground)' }}>{s.volatility}</span></div>
                <div><span style={{ color: 'var(--muted-foreground)' }}>Scheduled: </span><span style={{ color: 'var(--foreground)' }}>{s.scheduledAt}</span></div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded font-medium capitalize" style={{ backgroundColor: `${STATE_COLORS[s.state]}20`, color: STATE_COLORS[s.state] }}>
                {s.state === 'running' ? '● SIMULATED' : s.state}
              </span>
              <div className="flex gap-1">
                {s.state === 'idle' && <ActionButton variant="primary" onClick={() => updateState(s.id, 'running')}>Start</ActionButton>}
                {s.state === 'running' && <ActionButton onClick={() => updateState(s.id, 'paused')}>Pause</ActionButton>}
                {s.state === 'paused' && <ActionButton variant="primary" onClick={() => updateState(s.id, 'running')}>Resume</ActionButton>}
                {s.state !== 'idle' && <ActionButton variant="danger" onClick={() => updateState(s.id, 'idle')}>Reset</ActionButton>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Create new scenario */}
      <Card>
        <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Create Simulation Scenario</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'Symbol', key: 'symbol', type: 'select', options: ['BTC/USDC', 'ETH/USDC', 'SOL/USDC', 'XAU/USD', 'EUR/USD'] },
            { label: 'Direction', key: 'direction', type: 'select', options: ['up', 'down'] },
            { label: 'Target %', key: 'targetPct', type: 'number' },
            { label: 'Volatility', key: 'volatility', type: 'select', options: ['low', 'medium', 'high'] },
            { label: 'Duration (min)', key: 'durationMinutes', type: 'number' },
            { label: 'Scheduled At', key: 'scheduledAt', type: 'time' },
          ].map(field => (
            <div key={field.key}>
              <label className="text-xs block mb-1" style={{ color: 'var(--muted-foreground)' }}>{field.label}</label>
              {field.type === 'select' ? (
                <select
                  value={String(newScenario[field.key as keyof SimScenario] || '')}
                  onChange={e => setNewScenario(p => ({ ...p, [field.key]: e.target.value }))}
                  className="w-full text-xs px-2 py-1.5 rounded border outline-none"
                  style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                  {field.options!.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={String(newScenario[field.key as keyof SimScenario] || '')}
                  onChange={e => setNewScenario(p => ({ ...p, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value }))}
                  className="w-full text-xs px-2 py-1.5 rounded border outline-none"
                  style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-3">
          <ActionButton variant="primary" onClick={addScenario}>Create Scenario</ActionButton>
        </div>
      </Card>
    </div>
  );
}
