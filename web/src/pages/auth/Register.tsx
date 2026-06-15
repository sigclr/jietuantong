import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../mocks/store';

export function RegisterPage() {
  const { login } = useApp();
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    navigate('/dashboard');
  };

  return (
    <div className="auth-box">
      <h1>创建你的地接社账户</h1>
      <div className="auth-tabs">
        <Link to="/register" className="auth-tab active">
          创建企业
        </Link>
        <Link to="/join/8FK2-9D3A" className="auth-tab">
          邀请码加入
        </Link>
      </div>
      <form onSubmit={submit}>
        <div className="form-g">
          <label>企业名称</label>
          <input defaultValue="乌鲁木齐丝路地接社" placeholder="XX 地接社" />
        </div>
        <div className="form-g">
          <label>你的姓名</label>
          <input defaultValue="马建国" />
        </div>
        <div className="form-g">
          <label>手机号</label>
          <input type="tel" defaultValue="13899128888" />
        </div>
        <div className="form-g">
          <label>密码</label>
          <input type="password" defaultValue="********" />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          创建企业并登录
        </button>
      </form>
      <p style={{ marginTop: 16, fontSize: 13, textAlign: 'center' }}>
        已有账户？<Link to="/login">登录</Link>
      </p>
    </div>
  );
}
