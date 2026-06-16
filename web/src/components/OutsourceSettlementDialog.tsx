import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { formatMoney } from '../utils/format';
import { outsourcePaymentMethodLabel } from '../utils/quote';
import type { OutsourcePaymentMethod } from '../types';

interface OutsourceSettlementDialogProps {
  open: boolean;
  peerName: string;
  pendingCents: number;
  onClose: () => void;
  onConfirm: (payload: {
    amountCents: number;
    paymentMethod: OutsourcePaymentMethod;
    settledDate: string;
    remark?: string;
  }) => void;
}

export function OutsourceSettlementDialog({
  open,
  peerName,
  pendingCents,
  onClose,
  onConfirm,
}: OutsourceSettlementDialogProps) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<OutsourcePaymentMethod>('bank_transfer');
  const [settledDate, setSettledDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [remark, setRemark] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setAmount((pendingCents / 100).toFixed(2));
      setPaymentMethod('bank_transfer');
      setSettledDate(dayjs().format('YYYY-MM-DD'));
      setRemark('');
      setError('');
    }
  }, [open, pendingCents]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const yuan = parseFloat(amount);
    if (!yuan || yuan <= 0) {
      setError('本次结算须大于 0');
      return;
    }
    const amountCents = Math.round(yuan * 100);
    if (amountCents > pendingCents) {
      setError('本次结算不可超过待付金额');
      return;
    }
    onConfirm({
      amountCents,
      paymentMethod,
      settledDate,
      remark: remark.trim() || undefined,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <h3>应付结账</h3>
        <form onSubmit={submit}>
          <div className="form-g">
            <label>同行</label>
            <input value={peerName} readOnly />
          </div>
          <div className="form-g">
            <label>待结金额</label>
            <input value={formatMoney(pendingCents)} readOnly />
          </div>
          <div className="form-g">
            <label>本次结算（元）</label>
            <input value={amount} onChange={(e) => { setAmount(e.target.value); setError(''); }} required />
            {error && <div className="text-danger" style={{ fontSize: 12, marginTop: 4 }}>{error}</div>}
          </div>
          <div className="form-g">
            <label>结算方式</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as OutsourcePaymentMethod)}
            >
              {(['bank_transfer', 'cash', 'alipay', 'other'] as OutsourcePaymentMethod[]).map((m) => (
                <option key={m} value={m}>
                  {outsourcePaymentMethodLabel(m)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-g">
            <label>结算日期</label>
            <input type="date" value={settledDate} onChange={(e) => setSettledDate(e.target.value)} required />
          </div>
          <div className="form-g">
            <label>备注</label>
            <input value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="首笔拼出款" />
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn btn-primary">
              确定
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
