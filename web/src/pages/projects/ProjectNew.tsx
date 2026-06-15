import { useNavigate } from 'react-router-dom';
import { useApp } from '../../mocks/store';

export function ProjectNewPage() {
  const { partners, users } = useApp();
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/projects/JTT-20260615-01');
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
              <label>团号 *</label>
              <input defaultValue="JTT-20260620-01" />
            </div>
            <div className="form-g">
              <label>团名 *</label>
              <input defaultValue="北疆环线8日" />
            </div>
            <div className="form-g">
              <label>组团社 *</label>
              <select defaultValue={partners[0]?.id}>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-g">
              <label>人数</label>
              <input type="number" defaultValue={42} />
            </div>
            <div className="form-g">
              <label>抵团日</label>
              <input type="date" defaultValue="2026-06-20" />
            </div>
            <div className="form-g">
              <label>送团日</label>
              <input type="date" defaultValue="2026-06-27" />
            </div>
            <div className="form-g">
              <label>负责人</label>
              <select defaultValue={users[1]?.id}>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-g" style={{ gridColumn: '1 / -1' }}>
              <label>备注</label>
              <textarea
                rows={3}
                defaultValue="含喀纳斯区间车；2晚乌鲁木齐+1晚布尔津+1晚禾木；需安排清真餐"
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
    </>
  );
}
