'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { tradingService, PlaceOrderDTO } from '@/services/trading.service';
import { ChevronDown } from 'lucide-react';

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

const termBg = '#000000';
const termSurface = '#080808';
const termBorder = '#1a1a1a';
const termInput = '#0d0d0d';

export default function OrderForm({ symbol, currentPrice }: Props) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'Market' | 'Limit' | 'Stop Limit'>('Limit');
  const [showTpSl, setShowTpSl] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showOrderTypeDropdown, setShowOrderTypeDropdown] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<OrderFormData>({
    defaultValues: { price: currentPrice.toFixed(2), amount: '', total: '', takeProfitPrice: '', stopLossPrice: '', postOnly: false }
  });

  const amount = watch('amount');
  const price = watch('price');

  const handlePctClick = (pct: number) => {
    const available = 12480;
    const usePrice = orderType === 'Market' ? currentPrice : parseFloat(price) || currentPrice;
    if (side === 'buy') {
      const totalUsdc = (available * pct) / 100;
      const amtBtc = totalUsdc / usePrice;
      setValue('amount', amtBtc.toFixed(6));
      setValue('total', totalUsdc.toFixed(2));
    } else {
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
    const result = await tradingService.placeOrder(dto);
    setIsSubmitting(false);
    if (result.error) {
      setSubmitResult({ success: false, message: 'Order failed. Please try again.' });
    } else {
      setSubmitResult({ success: true, message: `${side === 'buy' ? 'Buy' : 'Sell'} order placed` });
      reset({ price: currentPrice.toFixed(2), amount: '', total: '', takeProfitPrice: '', stopLossPrice: '', postOnly: false });
      setTimeout(() => setSubmitResult(null), 4000);
    }
  };

  const isBuy = side === 'buy';

  return (
    <div className="p-3" style={{ backgroundColor: termBg }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-white">Order Form</span>
        <span className="text-xs text-gray-600">···</span>
      </div>

      {/* Buy / Sell + Order Type row */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex rounded overflow-hidden border flex-1" style={{ borderColor: termBorder }}>
          <button
            onClick={() => setSide('buy')}
            className="flex-1 py-1.5 text-xs font-bold transition-all duration-150"
            style={isBuy
              ? { backgroundColor: 'var(--primary)', color: '#000' }
              : { color: '#6b7280', backgroundColor: 'transparent' }}
          >
            Buy
          </button>
          <button
            onClick={() => setSide('sell')}
            className="flex-1 py-1.5 text-xs font-bold transition-all duration-150"
            style={!isBuy
              ? { backgroundColor: '#ef4444', color: '#fff' }
              : { color: '#6b7280', backgroundColor: 'transparent' }}
          >
            Sell
          </button>
        </div>

        {/* Order type dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowOrderTypeDropdown(!showOrderTypeDropdown)}
            className="flex items-center gap-1 px-2 py-1.5 text-xs rounded border transition-all"
            style={{ borderColor: termBorder, color: '#ffffff', backgroundColor: 'transparent' }}
          >
            {orderType}
            <ChevronDown size={10} />
          </button>
          {showOrderTypeDropdown && (
            <div
              className="absolute top-full right-0 mt-1 w-28 rounded border shadow-xl z-50"
              style={{ backgroundColor: '#111111', borderColor: termBorder }}
            >
              {ORDER_TYPES.map(ot => (
                <button
                  key={`ot-${ot}`}
                  onClick={() => { setOrderType(ot); setShowOrderTypeDropdown(false); }}
                  className="w-full text-left px-3 py-2 text-xs transition-colors hover:bg-white/5"
                  style={{ color: orderType === ot ? 'var(--primary)' : '#ffffff' }}
                >
                  {ot}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        {/* Price field */}
        {orderType !== 'Market' && (
          <div>
            <label className="block text-xs mb-1 text-gray-500">Price</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                {...register('price', { required: orderType !== 'Market' })}
                className="w-full px-2 py-1.5 rounded text-xs font-mono tabular-nums border focus:outline-none pr-14 text-white"
                style={{ backgroundColor: termInput, borderColor: termBorder }}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-600">USDC</span>
            </div>
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="block text-xs mb-1 text-gray-500">Amount</label>
          <div className="relative">
            <input
              type="number"
              step="0.000001"
              {...register('amount', { required: 'Amount is required', min: { value: 0.0001, message: 'Min 0.0001' } })}
              className="w-full px-2 py-1.5 rounded text-xs font-mono tabular-nums border focus:outline-none pr-12 text-white"
              style={{ backgroundColor: termInput, borderColor: errors.amount ? '#ef4444' : termBorder }}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-600">{symbol.split('/')[0]}</span>
          </div>
          {errors.amount && <p className="text-xs mt-0.5 text-red-400">{errors.amount.message}</p>}
        </div>

        {/* Percentage buttons */}
        <div className="grid grid-cols-4 gap-1">
          {PCT_BUTTONS.map(pct => (
            <button
              key={`pct-${pct}`}
              type="button"
              onClick={() => handlePctClick(pct)}
              className="py-0.5 text-xs rounded border transition-all hover:bg-white/5"
              style={{ borderColor: termBorder, color: '#6b7280' }}
            >
              {pct}%
            </button>
          ))}
        </div>

        {/* Total */}
        <div>
          <label className="block text-xs mb-1 text-gray-500">Total</label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              {...register('total')}
              className="w-full px-2 py-1.5 rounded text-xs font-mono tabular-nums border focus:outline-none pr-14 text-white"
              style={{ backgroundColor: termInput, borderColor: termBorder }}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-600">USDC</span>
          </div>
        </div>

        {/* TP/SL + Post Only */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <input
              type="checkbox"
              id="tpsl"
              checked={showTpSl}
              onChange={e => setShowTpSl(e.target.checked)}
              className="w-3 h-3 accent-yellow-500"
            />
            <label htmlFor="tpsl" className="text-xs text-gray-500">TP / SL</label>
          </div>
          <div className="flex items-center gap-1.5">
            <input type="checkbox" id="postOnly" {...register('postOnly')} className="w-3 h-3 accent-yellow-500" />
            <label htmlFor="postOnly" className="text-xs text-gray-500">Post Only</label>
          </div>
        </div>

        {showTpSl && (
          <div className="space-y-2">
            <div>
              <label className="block text-xs mb-1 text-green-500">Take Profit (USDC)</label>
              <input
                type="number"
                step="0.01"
                {...register('takeProfitPrice')}
                placeholder={`e.g. ${(currentPrice * 1.05).toFixed(2)}`}
                className="w-full px-2 py-1.5 rounded text-xs font-mono tabular-nums border focus:outline-none text-white placeholder-gray-700"
                style={{ backgroundColor: termInput, borderColor: termBorder }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1 text-red-400">Stop Loss (USDC)</label>
              <input
                type="number"
                step="0.01"
                {...register('stopLossPrice')}
                placeholder={`e.g. ${(currentPrice * 0.95).toFixed(2)}`}
                className="w-full px-2 py-1.5 rounded text-xs font-mono tabular-nums border focus:outline-none text-white placeholder-gray-700"
                style={{ backgroundColor: termInput, borderColor: termBorder }}
              />
            </div>
          </div>
        )}

        {/* Submit result */}
        {submitResult && (
          <div className={`p-2 rounded text-xs ${submitResult.success ? 'text-green-400 bg-green-900/20' : 'text-red-400 bg-red-900/20'}`}>
            {submitResult.message}
          </div>
        )}

        {/* CTA */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 rounded text-sm font-bold transition-all duration-150 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ backgroundColor: isBuy ? 'var(--primary)' : '#ef4444', color: isBuy ? '#000' : '#fff' }}
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'transparent', borderTopColor: isBuy ? '#000' : '#fff' }} />
          ) : (
            `Place ${isBuy ? 'Buy' : 'Sell'} Order`
          )}
        </button>

        {/* Fee estimate */}
        <div className="space-y-0.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Est. Fee</span>
            <span className="text-xs tabular-nums font-mono text-gray-600">0.1%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Est. Total</span>
            <span className="text-xs tabular-nums font-mono text-gray-600">
              {amount && !isNaN(parseFloat(amount)) ? `${(parseFloat(amount) * currentPrice * 1.001).toFixed(2)} USDC` : '0.00 USDC'}
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}