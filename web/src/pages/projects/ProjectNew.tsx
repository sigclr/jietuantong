import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useApp } from '../../mocks/store';
import { useRole } from '../../hooks/useRole';
import { isGroupAgentPartner, isPeerPartner } from '../../utils/quote';
import { QuoteItemsEditor, defaultNewQuoteLines, type QuoteLineDraft } from '../../components/QuoteItemsEditor';

export function ProjectNewPage() {
  const { partners, users, addProject, addQuoteItems, addScheduleTemplate, toast, setProjectDetailTab } = useApp();
  const { guardWrite } = useRole();
  const navigate = useNavigate();
  const [showTemplatePrompt, setShowTemplatePrompt] = useState(false);
  const [newProjectId, setNewProjectId] = useState('');
  const [newGroupNo, setNewGroupNo] = useState('');
  const [bizType, setBizType] = useState<'self_operated' | 'outsourced_out'>('self_operated');
  const [paxAdult, setPaxAdult] = useState(40);
  const [paxChild, setPaxChild] = useState(2);
  const [quoteLines, setQuoteLines] = useState<QuoteLineDraft[]>(defaultNewQuoteLines);

  const opUser = users.find((u) => u.persona === 'op') ?? users[1];
  const groupAgents = partners.filter((p) => isGroupAgentPartner(p.partnerKind));
  const peers = partners.filter((p) => isPeerPartner(p.partnerKind));

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!guardWrite('新建接团单')) return;

    const fd = new FormData(e.currentTarget);
    const outsourcedTo = (fd.get('outsourcedToPartnerId') as string) || undefined;

    if (bizType === 'outsourced_out' && !outsourcedTo) {
      toast('请选择拼出承接的同行旅行社');
      return;
    }

    const validLines = quoteLines.filter((l) => l.itemLabel.trim() && l.unitPriceCents > 0);
    if (validLines.some((l) => l.unitPriceCents <= 0)) {
      toast('团款组成每行单价须大于 0');
      return;
    }

    const { id, groupNo } = addProject({
      title: fd.get('title') as string,
      partnerId: fd.get('partnerId') as string,
      bizType,
      outsourcedToPartnerId: bizType === 'outsourced_out' ? outsourcedTo : undefined,
      status: 'pending',
      startDate: fd.get('startDate') as string,
      endDate: fd.get('endDate') as string,
      paxAdult,
      paxChild,
      ownerUserId: (fd.get('ownerUserId') as string) || opUser.id,
      leaderName: (fd.get('leaderName') as string) || undefined,
      leaderPhone: (fd.get('leaderPhone') as string) || undefined,
      remark: (fd.get('remark') as string) || undefined,
    });

    if (validLines.length > 0) {
      addQuoteItems(
        id,
        validLines.map(({ itemLabel, unitPriceCents, pricingUnit, quantity, remark }) => ({
          itemLabel,
          unitPriceCents,
          pricingUnit,
          quantity,
          remark,
        })),
      );
    }

    setNewProjectId(id);
    setNewGroupNo(groupNo);
    setShowTemplatePrompt(true);
    toast('接团单已创建');
  };

  const goDetail = () => {
    setProjectDetailTab('quote');
    navigate(`/projects/${newGroupNo}`);
  };

  const addTemplate = () => {
    addScheduleTemplate(newProjectId, 'deposit_tail');
    toast('已添加定金/尾款节点');
    setShowTemplatePrompt(false);
    setProjectDetailTab('schedules');
    navigate(`/projects/${newGroupNo}`);
  };

  return (
    <>
      <div className="page-header">
        <h1>新建接团单</h1>
      </div>

      <div className="card">
        <div className="card-h">接团基本信息</div>
        <div className="card-b">
          <form onSubmit={submit} className="grid2">
            <div className="form-g">
              <label>团号</label>
              <input disabled value="保存后自动生成" className="text-muted" />
            </div>
            <div className="form-g">
              <label>团名 *</label>
              <input name="title" required defaultValue="北疆环线8日" />
            </div>
            <div className="form-g">
              <label>组团社 *</label>
              <select name="partnerId" defaultValue={groupAgents[0]?.id} required>
                {groupAgents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-g">
              <label>业务类型</label>
              <div className="radio-row">
                <label>
                  <input
                    type="radio"
                    name="bizType"
                    checked={bizType === 'self_operated'}
                    onChange={() => setBizType('self_operated')}
                  />{' '}
                  自营
                </label>
                <label>
                  <input
                    type="radio"
                    name="bizType"
                    checked={bizType === 'outsourced_out'}
                    onChange={() => setBizType('outsourced_out')}
                  />{' '}
                  拼出
                </label>
              </div>
            </div>
            {bizType === 'outsourced_out' && (
              <div className="form-g" style={{ gridColumn: '1 / -1' }}>
                <label>承接同行 *</label>
                <select name="outsourcedToPartnerId" defaultValue={peers[0]?.id} required>
                  {peers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-g">
              <label>成人数</label>
              <input
                name="paxAdult"
                type="number"
                value={paxAdult}
                onChange={(e) => setPaxAdult(parseInt(e.target.value, 10) || 0)}
                min={0}
              />
            </div>
            <div className="form-g">
              <label>儿童数</label>
              <input
                name="paxChild"
                type="number"
                value={paxChild}
                onChange={(e) => setPaxChild(parseInt(e.target.value, 10) || 0)}
                min={0}
              />
            </div>
            <div className="form-g">
              <label>抵团日</label>
              <input name="startDate" type="date" defaultValue={dayjs().add(5, 'day').format('YYYY-MM-DD')} />
            </div>
            <div className="form-g">
              <label>送团日</label>
              <input name="endDate" type="date" defaultValue={dayjs().add(12, 'day').format('YYYY-MM-DD')} />
            </div>
            <div className="form-g">
              <label>负责人</label>
              <select name="ownerUserId" defaultValue={opUser?.id}>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-g">
              <label>领队</label>
              <input name="leaderName" placeholder="刘导" />
            </div>
            <div className="form-g" style={{ gridColumn: '1 / -1' }}>
              <label>备注</label>
              <textarea name="remark" rows={2} defaultValue="含喀纳斯区间车；需安排清真餐" />
            </div>

            <div className="form-g" style={{ gridColumn: '1 / -1' }}>
              <label>团款组成</label>
              <QuoteItemsEditor
                lines={quoteLines}
                onChange={setQuoteLines}
                paxAdult={paxAdult}
                paxChild={paxChild}
              />
            </div>

            <div style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/projects')}>
                取消
              </button>{' '}
              <button type="submit" className="btn btn-primary">
                保存
              </button>
            </div>
          </form>
        </div>
      </div>

      {showTemplatePrompt && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>是否添加定金/尾款节点？</h3>
            <p className="text-muted">将按团款组成合计自动生成 30% 定金 + 70% 尾款应收节点</p>
            <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={goDetail}>
                稍后添加
              </button>
              <button type="button" className="btn btn-primary" onClick={addTemplate}>
                一键添加
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
