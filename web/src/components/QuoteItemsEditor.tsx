import { formatMoney } from '../utils/format';
import { emptyQuoteDraft, plannedIncomeCents, pricingUnitLabel, quoteItemAmountCents } from '../utils/quote';
import type { PricingUnit, ProjectQuoteItem, QuoteItemDraft } from '../types';

export type QuoteLineDraft = QuoteItemDraft & { key: string };

function newLine(): QuoteLineDraft {
  return { ...emptyQuoteDraft(), key: `q${Date.now()}${Math.random()}` };
}

interface QuoteItemsEditorProps {
  lines: QuoteLineDraft[];
  onChange: (lines: QuoteLineDraft[]) => void;
  paxAdult: number;
  paxChild: number;
  readOnly?: boolean;
}

export function QuoteItemsEditor({ lines, onChange, paxAdult, paxChild, readOnly }: QuoteItemsEditorProps) {
  const project = { paxAdult, paxChild };
  const asItems = lines.map((l, i) => ({
    id: l.key,
    orgId: '',
    projectId: '',
    itemLabel: l.itemLabel,
    unitPriceCents: l.unitPriceCents,
    pricingUnit: l.pricingUnit,
    quantity: l.quantity,
    remark: l.remark,
    sortOrder: i,
  })) as ProjectQuoteItem[];

  const total = plannedIncomeCents(asItems, project);

  const update = (key: string, patch: Partial<QuoteLineDraft>) => {
    onChange(lines.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  };

  const remove = (key: string) => onChange(lines.filter((l) => l.key !== key));

  if (readOnly && lines.length === 0) {
    return null;
  }

  return (
    <div className="quote-editor">
      {lines.length === 0 ? (
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 12 }}>
          添加团款明细。按单价填写（人均或每组），不是整团一口价。
        </p>
      ) : (
        <table className="data-table quote-table">
          <thead>
            <tr>
              <th>费用类型</th>
              <th>单价（元）</th>
              <th>计价</th>
              <th>备注</th>
              <th>小计</th>
              {!readOnly && <th style={{ width: 40 }} />}
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => {
              const rowItem = {
                unitPriceCents: line.unitPriceCents,
                pricingUnit: line.pricingUnit,
                quantity: line.quantity,
              };
              const sub = quoteItemAmountCents(rowItem, paxAdult, paxChild);
              return (
                <tr key={line.key}>
                  <td>
                    {readOnly ? (
                      line.itemLabel
                    ) : (
                      <input
                        value={line.itemLabel}
                        onChange={(e) => update(line.key, { itemLabel: e.target.value })}
                        placeholder="酒店"
                        list="quote-type-hints"
                        required
                      />
                    )}
                  </td>
                  <td>
                    {readOnly ? (
                      formatMoney(line.unitPriceCents)
                    ) : (
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={line.unitPriceCents ? line.unitPriceCents / 100 : ''}
                        onChange={(e) =>
                          update(line.key, {
                            unitPriceCents: Math.round(parseFloat(e.target.value || '0') * 100),
                          })
                        }
                        required
                      />
                    )}
                  </td>
                  <td>
                    {readOnly ? (
                      pricingUnitLabel(line.pricingUnit)
                    ) : (
                      <select
                        value={line.pricingUnit}
                        onChange={(e) =>
                          update(line.key, { pricingUnit: e.target.value as PricingUnit })
                        }
                      >
                        <option value="per_person">人均</option>
                        <option value="per_group">每组</option>
                      </select>
                    )}
                    {!readOnly && line.pricingUnit === 'per_group' && (
                      <input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(e) => update(line.key, { quantity: parseInt(e.target.value, 10) || 1 })}
                        style={{ width: 48, marginLeft: 4 }}
                        title="组数"
                      />
                    )}
                  </td>
                  <td>
                    {readOnly ? (
                      line.remark || '—'
                    ) : (
                      <input
                        value={line.remark ?? ''}
                        onChange={(e) => update(line.key, { remark: e.target.value })}
                        placeholder="标间含早"
                      />
                    )}
                  </td>
                  <td>{formatMoney(sub)}</td>
                  {!readOnly && (
                    <td>
                      <button type="button" className="btn-icon" onClick={() => remove(line.key)} aria-label="删除">
                        ×
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {!readOnly && (
        <datalist id="quote-type-hints">
          <option value="团款" />
          <option value="酒店" />
          <option value="用车" />
          <option value="门票" />
          <option value="导服" />
          <option value="餐饮" />
        </datalist>
      )}
      <div className="quote-total">
        {!readOnly && (
          <button type="button" className="btn btn-outline btn-sm" onClick={() => onChange([...lines, newLine()])}>
            + 添加一行
          </button>
        )}
        <span className="quote-total-sum">
          合计预估收入 <strong>{formatMoney(total)}</strong>
          {paxAdult + paxChild > 0 && (
            <small className="text-muted">（{paxAdult}+{paxChild} 人）</small>
          )}
        </span>
      </div>
    </div>
  );
}

export function quoteLinesFromItems(items: ProjectQuoteItem[]): QuoteLineDraft[] {
  return [...items]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => ({
      key: item.id,
      itemLabel: item.itemLabel,
      unitPriceCents: item.unitPriceCents,
      pricingUnit: item.pricingUnit,
      quantity: item.quantity,
      remark: item.remark,
    }));
}

export function defaultNewQuoteLines(): QuoteLineDraft[] {
  return [
    { key: 'q1', itemLabel: '团款', unitPriceCents: 195000, pricingUnit: 'per_person', quantity: 1, remark: '含车导餐' },
    { key: 'q2', itemLabel: '门票', unitPriceCents: 12000, pricingUnit: 'per_person', quantity: 1, remark: '喀纳斯区间车' },
  ];
}
