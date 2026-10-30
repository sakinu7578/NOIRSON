import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import AuthVisual from '../components/AuthVisual.jsx';
import useLanguage from '../hooks/useLanguage.js';

export default function Login() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ email: '', password: '' });

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Login | NOIRSON';
    return () => { document.title = previousTitle; };
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  return <main className="auth-page">
    <AuthVisual headingId="auth-brand-title"
      membersLabel={t('auth.members')}
      title={[t('auth.loginLine1'), t('auth.loginLine2')]}
      intro={t('auth.loginIntro')} />

    <section className="auth-panel" aria-labelledby="login-title">
      <div className="auth-panel-inner">
        <p className="section-label">{t('auth.access')}</p>
        <h2 id="login-title">{t('auth.login')}</h2>
        <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
          <div className="auth-field">
            <label htmlFor="login-email">{t('auth.email')}</label>
            <input id="login-email" name="email" type="email" autoComplete="email" required
              value={form.email} onChange={updateField} />
          </div>
          <div className="auth-field">
            <label htmlFor="login-password">{t('auth.password')}</label>
            <input id="login-password" name="password" type="password" autoComplete="current-password" required
              value={form.password} onChange={updateField} />
          </div>
          <button className="auth-submit" type="submit">{t('auth.login')}</button>
        </form>
        <p className="auth-switch"><span>{t('auth.new')}</span>{' '}
          <Link to="/register">{t('auth.register')}</Link></p>
      </div>
    </section>
  </main>;
}
