/**
 * GET /api/market/quote?symbol=BTC/USD
 *
 * Returns a single normalized market quote.
 * API keys are read server-side only — never returned to the client.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getQuote } from '@/lib/server/market-data/market-data.service';
import { getMapping } from '@/lib/server/market-data/symbols';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json(
      { error: 'Missing required query parameter: symbol' },
      { status: 400 }
    );
  }

  const mapping = getMapping(symbol);
  if (!mapping) {
    return NextResponse.json(
      { error: `Symbol not supported: ${symbol}`, supported: false },
      { status: 404 }
    );
  }

  try {
    const result = await getQuote(symbol);

    if (result.quote === null) {
      return NextResponse.json(
        {
          symbol,
          available: false,
          message: 'Live market data unavailable in this environment',
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      symbol,
      available: true,
      quote: result.quote,
    });
  } catch (err) {
    console.error('[/api/market/quote] Unhandled error:', err instanceof Error ? err.message : 'unknown');
    return NextResponse.json(
      { error: 'Internal server error', available: false },
      { status: 500 }
    );
  }
}
