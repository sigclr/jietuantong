import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../mocks/store';

export function JoinPage() {
  const { code } = useParams();
  const { login, organization } = useApp();
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    navigate('/dashboard');
  };

  return (
    <div className="auth-box">
      <h1>接团通</h1>
      <p style={{ marginBottom: 16 }}>
        「<strong>{organization.name}</strong>」邀请你加入
      </p>
      <div className="auth-tabs">
        <Link to="/register" className="auth-tab">
          创建企业
        </Link>
        <Link to={`/join/${code ?? '8FK2-9D3A'}`} className="auth-tab active">
          邀请码加入
        </Link>
      </div>
      <form onSubmit={submit}>
        <div className="form-g">
          <label>邀请码</label>
          <input defaultValue={code ?? '8FK2-9D3A'} readOnly />
        </div>
        <div className="form-g">
          <label>你的姓名</label>
          <input defaultValue="努尔兰" />
        </div>
        <div className="form-g">
          <label>手机号</label>
          <input type="tel" defaultValue="13999887766" />
        </div>
        <div className="form-g">
          <label>密码</label>
          <input type="password" defaultValue="********" />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          加入并登录
        </button>
      </form>
    </div>
  );
}
