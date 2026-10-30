import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import AuthVisual from '../components/AuthVisual.jsx';
import useLanguage from '../hooks/useLanguage.js';

export default function Register() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Register | NOIRSON';
    return () => { document.title = previousTitle; };
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
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
        <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
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
            <input id="register-password" name="password" type="password" autoComplete="new-password" required
              value={form.password} onChange={updateField} />
          </div>
          <div className="auth-field">
            <label htmlFor="register-confirm-password">{t('auth.confirm')}</label>
            <input id="register-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" required
              value={form.confirmPassword} onChange={updateField} />
          </div>
          <button className="auth-submit" type="submit">{t('auth.register')}</button>
        </form>
        <p className="auth-switch"><span>{t('auth.existing')}</span>{' '}
          <Link to="/login">{t('auth.login')}</Link></p>
      </div>
    </section>
  </main>;
}
