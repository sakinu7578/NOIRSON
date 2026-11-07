import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import AuthVisual from '../components/AuthVisual.jsx';
import useLanguage from '../hooks/useLanguage.js';
import useAuth from '../hooks/useAuth.js';

export default function Login() {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorKey, setErrorKey] = useState(null);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrorKey(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;
    const email = form.email.trim();
    if (!email || !form.password) {
      setErrorKey('auth.loginRequired');
      return;
    }
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorKey('auth.emailInvalid');
      return;
    }

    setIsSubmitting(true);
    setErrorKey(null);
    try {
      const status = await login(email, form.password);
      if (status === null) return;
      if (status === 200) {
        setForm({ email: '', password: '' });
        navigate('/member');
      } else if (status === 401) {
        setErrorKey('auth.loginInvalid');
      } else if (status === 400) {
        setErrorKey('auth.loginBadRequest');
      } else if (status === 429) {
        setErrorKey('auth.loginRateLimited');
      } else {
        setErrorKey('auth.serverError');
      }
    } catch {
      setErrorKey('auth.networkError');
    } finally {
      setIsSubmitting(false);
    }
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
        {location.state?.passwordUpdated && <p role="status">{t('member.passwordUpdated')}</p>}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
          {errorKey && <p role="alert">{t(errorKey)}</p>}
          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('auth.loggingIn') : t('auth.login')}
          </button>
        </form>
        <p className="auth-switch"><span>{t('auth.new')}</span>{' '}
          <Link to="/register">{t('auth.register')}</Link></p>
      </div>
    </section>
  </main>;
}
