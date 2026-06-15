import { useApp } from '../../mocks/store';

export function SettingsPage() {
  const { organization } = useApp();

  return (
    <>
      <div className="page-header">
        <h1>企业信息</h1>
        <button type="button" className="btn btn-outline">
          编辑
        </button>
      </div>

      <div className="card">
        <div className="card-b">
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>{organization.name}</h2>
          <p className="text-muted">许可证号 {organization.licenseNo}</p>
          <p className="text-muted">所在城市 {organization.city}</p>
          <p style={{ marginTop: 16, fontSize: 13 }}>
            主营北疆环线、伊犁、天山天池；旺季 6–9 月
          </p>
        </div>
      </div>
    </>
  );
}
