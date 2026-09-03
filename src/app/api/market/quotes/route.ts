/**
 * GET /api/market/quotes?symbols=BTC/USD,ETH/USD,EUR/USD,AAPL
 *
 * Returns multiple normalized market quotes in a single request.
 * API keys are read server-side only — never returned to the client.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getQuotes } from '@/lib/server/market-data/market-data.service';
import { getMapping } from '@/lib/server/market-data/symbols';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get('symbols');

  if (!symbolsParam) {
    return NextResponse.json(
      { error: 'Missing required query parameter: symbols' },
      { status: 400 }
    );
  }

  const requested = symbolsParam
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  if (requested.length === 0) {
    return NextResponse.json({ error: 'No valid symbols provided' }, { status: 400 });
  }

  // Validate and separate supported vs unsupported
  const supported: string[] = [];
  const unsupported: string[] = [];

  for (const sym of requested) {
    if (getMapping(sym)) {
      supported.push(sym);
    } else {
      unsupported.push(sym);
    }
  }

  try {
    const results = await getQuotes(supported);

    const quotes: Record<string, {
      available: boolean;
      quote?: object;
      message?: string;
    }> = {};

    for (const sym of supported) {
      const result = results.get(sym);
      if (result?.quote) {
        quotes[sym] = { available: true, quote: result.quote };
      } else {
        quotes[sym] = {
          available: false,
          message: 'Live market data unavailable in this environment',
        };
      }
    }

    for (const sym of unsupported) {
      quotes[sym] = { available: false, message: 'Symbol not supported' };
    }

    return NextResponse.json({ quotes });
  } catch (err) {
    console.error('[/api/market/quotes] Unhandled error:', err instanceof Error ? err.message : 'unknown');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
