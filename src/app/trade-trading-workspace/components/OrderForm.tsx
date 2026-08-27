'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { tradingService, PlaceOrderDTO } from '@/services/trading.service';

interface Props {
  symbol: string;
  currentPrice: number;
}

interface OrderFormData {
  price: string;
  amount: string;
  total: string;
  takeProfitPrice: string;
  stopLossPrice: string;
  postOnly: boolean;
}

const ORDER_TYPES = ['Market', 'Limit', 'Stop Limit'] as const;
const PCT_BUTTONS = [25, 50, 75, 100];

export default function OrderForm({ symbol, currentPrice }: Props) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'Market' | 'Limit' | 'Stop Limit'>('Limit');
  const [showTpSl, setShowTpSl] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<OrderFormData>({
    defaultValues: { price: currentPrice.toFixed(2), amount: '', total: '', takeProfitPrice: '', stopLossPrice: '', postOnly: false }
  });

  const amount = watch('amount');
  const price = watch('price');

  const handlePctClick = (pct: number) => {
    // Mock: assume 12480 USDC available
    const available = 12480;
    const usePrice = orderType === 'Market' ? currentPrice : parseFloat(price) || currentPrice;
    if (side === 'buy') {
      const totalUsdc = (available * pct) / 100;
      const amtBtc = totalUsdc / usePrice;
      setValue('amount', amtBtc.toFixed(6));
      setValue('total', totalUsdc.toFixed(2));
    } else {
      // Mock: assume 0.35 BTC
      const holdingBtc = 0.35;
      const useAmt = (holdingBtc * pct) / 100;
      setValue('amount', useAmt.toFixed(6));
      setValue('total', (useAmt * usePrice).toFixed(2));
    }
  };

  const onSubmit = async (data: OrderFormData) => {
    setIsSubmitting(true);
    setSubmitResult(null);
    const dto: PlaceOrderDTO = {
      symbol,
      side,
      type: orderType === 'Market' ? 'market' : orderType === 'Limit' ? 'limit' : 'stop_limit',
      price: orderType !== 'Market' ? parseFloat(data.price) : undefined,
      amount: parseFloat(data.amount),
      total: parseFloat(data.total),
      takeProfitPrice: data.takeProfitPrice ? parseFloat(data.takeProfitPrice) : undefined,
      stopLossPrice: data.stopLossPrice ? parseFloat(data.stopLossPrice) : undefined,
      postOnly: data.postOnly,
    };
    // BACKEND INTEGRATION: tradingService.placeOrder(dto) → POST /api/v1/orders
    const result = await tradingService.placeOrder(dto);
    setIsSubmitting(false);
    if (result.error) {
      setSubmitResult({ success: false, message: 'Order failed. Please try again.' });
    } else {
      setSubmitResult({ success: true, message: `${side === 'buy' ? 'Buy' : 'Sell'} order placed — ID: ${result.orderId?.slice(0, 16)}` });
      reset({ price: currentPrice.toFixed(2), amount: '', total: '', takeProfitPrice: '', stopLossPrice: '', postOnly: false });
      setTimeout(() => setSubmitResult(null), 4000);
    }
  };

  const isBuy = side === 'buy';

  return (
    <div className="p-3" style={{ backgroundColor: 'var(--card)' }}>
      {/* Buy / Sell tabs */}
      <div className="flex rounded-md overflow-hidden mb-3 border" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => setSide('buy')}
          className={`flex-1 py-2 text-xs font-bold transition-all duration-150 ${isBuy ? 'bg-positive text-white' : 'text-muted-foreground hover:bg-muted'}`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide('sell')}
          className={`flex-1 py-2 text-xs font-bold transition-all duration-150 ${!isBuy ? 'bg-negative text-white' : 'text-muted-foreground hover:bg-muted'}`}
        >
          Sell
        </button>
      </div>

      {/* Order type */}
      <div className="flex gap-1 mb-3">
        {ORDER_TYPES.map(ot => (
          <button
            key={`ot-${ot}`}
            onClick={() => setOrderType(ot)}
            className={`flex-1 py-1 text-xs rounded transition-all ${orderType === ot ? 'bg-muted text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {ot}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        {/* Available balance */}
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Available</span>
          <span className="text-xs font-semibold tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>
            {isBuy ? '12,480.00 USDC' : '0.3500 BTC'}
          </span>
        </div>

        {/* Price field (not for Market) */}
        {orderType !== 'Market' && (
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Price (USDC)</label>
            <input
              type="number"
              step="0.01"
              {...register('price', { required: orderType !== 'Market' })}
              className="w-full px-2 py-2 rounded text-xs font-mono tabular-nums border focus:outline-none"
              style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
            Amount ({symbol.split('/')[0]})
          </label>
          <input
            type="number"
            step="0.000001"
            {...register('amount', { required: 'Amount is required', min: { value: 0.0001, message: 'Min 0.0001' } })}
            className="w-full px-2 py-2 rounded text-xs font-mono tabular-nums border focus:outline-none"
            style={{ backgroundColor: 'var(--input)', borderColor: errors.amount ? 'var(--negative)' : 'var(--border)', color: 'var(--foreground)' }}
          />
          {errors.amount && <p className="text-xs mt-0.5" style={{ color: 'var(--negative)' }}>{errors.amount.message}</p>}
        </div>

        {/* Percentage buttons */}
        <div className="grid grid-cols-4 gap-1">
          {PCT_BUTTONS.map(pct => (
            <button
              key={`pct-${pct}`}
              type="button"
              onClick={() => handlePctClick(pct)}
              className="py-1 text-xs rounded border transition-all hover:bg-muted active:scale-95"
              style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
            >
              {pct}%
            </button>
          ))}
        </div>

        {/* Total */}
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Total (USDC)</label>
          <input
            type="number"
            step="0.01"
            {...register('total')}
            className="w-full px-2 py-2 rounded text-xs font-mono tabular-nums border focus:outline-none"
            style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
        </div>

        {/* TP/SL toggle */}
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => setShowTpSl(!showTpSl)} className="text-xs flex items-center gap-1 hover:underline" style={{ color: 'var(--primary)' }}>
            TP / SL {showTpSl ? '▲' : '▼'}
          </button>
          <div className="flex items-center gap-1.5">
            <input type="checkbox" id="postOnly" {...register('postOnly')} className="w-3 h-3 accent-primary" />
            <label htmlFor="postOnly" className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Post Only</label>
          </div>
        </div>

        {showTpSl && (
          <div className="space-y-2 animate-fade-in">
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--positive)' }}>Take Profit (USDC)</label>
              <input
                type="number"
                step="0.01"
                {...register('takeProfitPrice')}
                placeholder={`e.g. ${(currentPrice * 1.05).toFixed(2)}`}
                className="w-full px-2 py-2 rounded text-xs font-mono tabular-nums border focus:outline-none"
                style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--negative)' }}>Stop Loss (USDC)</label>
              <input
                type="number"
                step="0.01"
                {...register('stopLossPrice')}
                placeholder={`e.g. ${(currentPrice * 0.95).toFixed(2)}`}
                className="w-full px-2 py-2 rounded text-xs font-mono tabular-nums border focus:outline-none"
                style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
          </div>
        )}

        {/* Fee estimate */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Est. Fee (0.1%)</span>
          <span className="text-xs tabular-nums font-mono" style={{ color: 'var(--muted-foreground)' }}>
            {amount && !isNaN(parseFloat(amount)) ? `${(parseFloat(amount) * currentPrice * 0.001).toFixed(2)} USDC` : '—'}
          </span>
        </div>

        {/* Submit result */}
        {submitResult && (
          <div className={`p-2 rounded text-xs ${submitResult.success ? 'bg-positive-subtle text-positive' : 'bg-negative-subtle text-negative'}`}>
            {submitResult.message}
          </div>
        )}

        {/* CTA */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 rounded text-sm font-bold transition-all duration-150 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ backgroundColor: isBuy ? 'var(--positive)' : 'var(--negative)', color: '#fff' }}
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'transparent', borderTopColor: '#fff' }} />
          ) : (
            `Place ${isBuy ? 'Buy' : 'Sell'} Order`
          )}
        </button>
      </form>
    </div>
  );
}