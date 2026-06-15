import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../mocks/store';

export function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [showError, setShowError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showError) {
      setShowError(false);
    }
    login();
    navigate('/projects');
  };

  return (
    <div className="auth-box">
      <h1>接团通</h1>
      <p className="text-muted" style={{ marginBottom: 16 }}>
        接团 · 核算 · 结算，一站管理
      </p>
      <div className="note">原型：任意手机号密码均可登录</div>
      <form onSubmit={submit}>
        <div className="form-g">
          <label>手机号</label>
          <input type="tel" defaultValue="13899128888" placeholder="138xxxxxxxx" />
        </div>
        <div className="form-g">
          <label>密码</label>
          <input type="password" defaultValue="********" />
        </div>
        {showError && (
          <div className="alert-bar" style={{ marginBottom: 12 }}>
            ⚠ 手机号或密码错误（剩余 3 次）
          </div>
        )}
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
          登 录
        </button>
        <button
          type="button"
          className="btn btn-outline"
          style={{ width: '100%', marginTop: 8, fontSize: 12 }}
          onClick={() => setShowError(true)}
        >
          演示错误态
        </button>
      </form>
      <p style={{ marginTop: 16, fontSize: 13, textAlign: 'center' }}>
        没有账户？<Link to="/register">创建地接社</Link>
      </p>
    </div>
  );
}
