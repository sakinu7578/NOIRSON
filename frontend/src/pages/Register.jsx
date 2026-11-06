// 使用React Hooks管理表單、提交狀態及提示訊息
// useState 管理狀態，useEffect 管理副作用
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import AuthVisual from '../components/AuthVisual.jsx';
import useLanguage from '../hooks/useLanguage.js';

export default function Register() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Register | NOIRSON';
    return () => { document.title = previousTitle; };
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setStatus(null);
  }
  // 處理表單送出、前端驗證及 API 請求
  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;

    const { password, confirmPassword } = form;
    const username = form.username.trim();
    const email = form.email.trim();
    if (!username || !email || !password || !confirmPassword) {
      setStatus({ type: 'error', key: 'auth.required' });
      return;
    }
    if (username.length < 2 || username.length > 20) {
      setStatus({ type: 'error', key: 'auth.usernameLength' });
      return;
    }
    // 與 MemberService 的基本 Email 格式及長度限制一致。
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus({ type: 'error', key: 'auth.emailInvalid' });
      return;
    }
    if (password.length < 8 || password.length > 20) {
      setStatus({ type: 'error', key: 'auth.passwordLength' });
      return;
    }
    if (!password.trim()) {
      setStatus({ type: 'error', key: 'auth.passwordBlank' });
      return;
    }
    // BCrypt 只處理前 72 UTF-8 bytes；僅計算長度，不修改密碼。
    if (new TextEncoder().encode(password).length > 72) {
      setStatus({ type: 'error', key: 'auth.passwordBytes' });
      return;
    }
    if (password !== confirmPassword) {
      setStatus({ type: 'error', key: 'auth.passwordMismatch' });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);
    try {
      // 開發時由 Vite 代理 /api；部署時需由同源主機轉送至後端。
      // 向後端發送 HTTP 請求
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 將 JavaScript 物件轉為 JSON 字串
        body: JSON.stringify({ username, email, password }),
      });

      // 根據 HTTP 回應狀態碼，顯示對應結果
      if (response.status === 201) {
        setStatus({ type: 'success', key: 'auth.registerSuccess' });
        setForm({ username: '', email: '', password: '', confirmPassword: '' });
      } else {
        const key = response.status === 400 ? 'auth.badRequest'
          : response.status === 409 ? 'auth.emailConflict'
            : 'auth.serverError';
        setStatus({ type: 'error', key });
      }
    } catch {
      // 請求過程發生錯誤
      setStatus({ type: 'error', key: 'auth.networkError' });
    } finally {
      // 不論成功或失敗都執行
      setIsSubmitting(false);
    }
  }

  return <main className="auth-page">
    <AuthVisual headingId="register-brand-title"
      membersLabel={t('auth.members')}
      title={[t('auth.registerLine1'), t('auth.registerLine2')]}
      intro={t('auth.registerIntro')} />

    <section className="auth-panel" aria-labelledby="register-title">
      <div className="auth-panel-inner">
        <p className="section-label">{t('auth.create')}</p>
        <h2 id="register-title">{t('auth.register')}</h2>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="register-username">{t('auth.username')}</label>
            <input id="register-username" name="username" type="text" autoComplete="username" required
              value={form.username} onChange={updateField} />
          </div>
          <div className="auth-field">
            <label htmlFor="register-email">{t('auth.email')}</label>
            <input id="register-email" name="email" type="email" autoComplete="email" required
              value={form.email} onChange={updateField} />
          </div>
          <div className="auth-field">
            <label htmlFor="register-password">{t('auth.password')}</label>
            <input id="register-password" name="password" type="password" autoComplete="new-password" maxLength="20" required
              value={form.password} onChange={updateField} />
            <p>{t('auth.passwordHint')}</p>
          </div>
          <div className="auth-field">
            <label htmlFor="register-confirm-password">{t('auth.confirm')}</label>
            <input id="register-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" maxLength="20" required
              value={form.confirmPassword} onChange={updateField} />
          </div>
          {status && <p role={status.type === 'error' ? 'alert' : 'status'}>{t(status.key)}</p>}
          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('auth.submitting') : t('auth.register')}
          </button>
        </form>
        <p className="auth-switch"><span>{t('auth.existing')}</span>{' '}
          <Link to="/login">{t('auth.login')}</Link></p>
      </div>
    </section>
  </main>;
}
