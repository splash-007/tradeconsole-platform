import React from 'react';

interface TradeRecord {
  id: string; symbol: string; side: 'buy' | 'sell'; price: number;
  amount: number; total: number; fee: number; time: string; status: string;
}

interface Props { history: TradeRecord[]; }

export default function TradeHistoryTable({ history }: Props) {
  return (
    <div className="rounded-lg border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Trade History</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Symbol', 'Side', 'Price', 'Amount', 'Total', 'Fee', 'Time', 'Status'].map(h => (
                <th key={`th-hist-${h}`} className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${h === 'Symbol' || h === 'Side' ? 'text-left' : 'text-right'}`}
                  style={{ color: 'var(--muted-foreground)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map(trade => (
              <tr key={`hist-${trade.id}`} className="hover:bg-muted transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="px-4 py-2.5">
                  <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{trade.symbol}</span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${trade.side === 'buy' ? 'bg-positive-subtle text-positive' : 'bg-negative-subtle text-negative'}`}>
                    {trade.side.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span className="text-xs tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>
                    ${trade.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span className="text-xs tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>{trade.amount}</span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span className="text-xs tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>
                    ${trade.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span className="text-xs tabular-nums font-mono" style={{ color: 'var(--muted-foreground)' }}>${trade.fee.toFixed(2)}</span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{trade.time}</span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ color: 'var(--positive)', backgroundColor: 'rgba(34,197,94,0.1)' }}>
                    {trade.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}