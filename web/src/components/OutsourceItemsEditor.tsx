import { formatMoney } from '../utils/format';
import {
  emptyOutsourceDraft,
  outsourceItemAmountCents,
  outsourceSpreadCents,
  outsourceTotalCents,
  plannedIncomeCents,
  pricingUnitLabel,
} from '../utils/quote';
import type { Partner, PricingUnit, ProjectOutsourceItem, ProjectQuoteItem, OutsourceItemDraft } from '../types';

export type OutsourceLineDraft = OutsourceItemDraft & { key: string };

function newLine(peerPartnerId: string): OutsourceLineDraft {
  return { ...emptyOutsourceDraft(peerPartnerId), key: `o${Date.now()}${Math.random()}` };
}

interface OutsourceItemsEditorProps {
  lines: OutsourceLineDraft[];
  onChange: (lines: OutsourceLineDraft[]) => void;
  peers: Partner[];
  defaultPeerId?: string;
  fixedPeerId?: string;
  hidePeerHint?: boolean;
  paxAdult: number;
  paxChild: number;
  quoteItems: ProjectQuoteItem[];
  readOnly?: boolean;
}

export function OutsourceItemsEditor({
  lines,
  onChange,
  peers,
  defaultPeerId,
  fixedPeerId,
  hidePeerHint,
  paxAdult,
  paxChild,
  quoteItems,
  readOnly,
}: OutsourceItemsEditorProps) {
  const project = { paxAdult, paxChild };
  const peerId = fixedPeerId ?? defaultPeerId ?? peers[0]?.id ?? '';
  const peerLabel = peers.find((p) => p.id === peerId)?.name ?? '—';

  const asItems = lines.map((l, i) => ({
    id: l.key,
    orgId: '',
    projectId: '',
    peerPartnerId: fixedPeerId ?? l.peerPartnerId,
    itemLabel: l.itemLabel,
    unitPriceCents: l.unitPriceCents,
    pricingUnit: l.pricingUnit,
    quantity: l.quantity,
    standard: l.standard,
    remark: l.remark,
    sortOrder: i,
  })) as ProjectOutsourceItem[];

  const total = outsourceTotalCents(asItems, project);
  const spread = outsourceSpreadCents(quoteItems, asItems, project);
  const planned = plannedIncomeCents(quoteItems, project);

  const update = (key: string, patch: Partial<OutsourceLineDraft>) => {
    onChange(lines.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  };

  const remove = (key: string) => onChange(lines.filter((l) => l.key !== key));

  if (readOnly && lines.length === 0) {
    return null;
  }

  return (
    <div className="quote-editor">
      {fixedPeerId && !hidePeerHint && (
        <p className="form-section-hint" style={{ marginBottom: 8 }}>
          承接同行：<strong>{peerLabel}</strong>
        </p>
      )}
      {lines.length === 0 ? (
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 12 }}>
          添加拼出分项：费用项、单价、执行标准，合计即顶栏预估。
        </p>
      ) : (
        <table className="data-table quote-table">
          <thead>
            <tr>
              <th>费用项</th>
              <th>单价（元）</th>
              <th>计价</th>
              <th>标准</th>
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
              const sub = outsourceItemAmountCents(rowItem, paxAdult, paxChild);
              return (
                <tr key={line.key}>
                  <td>
                    {readOnly ? (
                      line.itemLabel
                    ) : (
                      <input
                        value={line.itemLabel}
                        onChange={(e) => update(line.key, { itemLabel: e.target.value })}
                        placeholder="执行团款"
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
                      line.standard || '—'
                    ) : (
                      <input
                        value={line.standard ?? ''}
                        onChange={(e) => update(line.key, { standard: e.target.value })}
                        placeholder="含车导餐不含票"
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
                        placeholder="选填"
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
      <div className="quote-total">
        {!readOnly && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => onChange([...lines, newLine(peerId)])}
          >
            + 添加一行
          </button>
        )}
        <span className="quote-total-sum">
          拼出合计（预估） <strong>{formatMoney(total)}</strong>
          {planned > 0 && lines.length > 0 && (
            <>
              {' · '}
              拼出差价（预览）{' '}
              <strong className={spread < 0 ? 'text-danger' : ''}>{formatMoney(spread)}</strong>
            </>
          )}
        </span>
      </div>
    </div>
  );
}

export function outsourceLinesFromItems(items: ProjectOutsourceItem[]): OutsourceLineDraft[] {
  return [...items]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => ({
      key: item.id,
      peerPartnerId: item.peerPartnerId,
      itemLabel: item.itemLabel,
      unitPriceCents: item.unitPriceCents,
      pricingUnit: item.pricingUnit,
      quantity: item.quantity,
      standard: item.standard,
      remark: item.remark,
    }));
}

export function defaultNewOutsourceLines(peerPartnerId: string): OutsourceLineDraft[] {
  return [
    {
      key: 'o1',
      peerPartnerId,
      itemLabel: '执行团款',
      unitPriceCents: 145000,
      pricingUnit: 'per_person',
      quantity: 1,
      standard: '含车导餐不含门票',
      remark: '',
    },
  ];
}
