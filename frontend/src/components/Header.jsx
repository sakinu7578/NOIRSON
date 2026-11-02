import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import { assetUrl } from '../utils/assetUrl.js';
import useLanguage from '../hooks/useLanguage.js';
import useAuth from '../hooks/useAuth.js';

function Header() {
    const { language, setLanguage, t } = useLanguage();
    const { currentUser, isAuthLoading, authError, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState(false);

    useEffect(() => {
        if (!menuOpen) return;
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') setMenuOpen(false);
        };
        document.addEventListener('keydown', closeOnEscape);
        return () => document.removeEventListener('keydown', closeOnEscape);
    }, [menuOpen]);

    const closeMenu = () => setMenuOpen(false);
    const changeLanguage = (nextLanguage) => {
        setLanguage(nextLanguage);
        closeMenu();
    };
    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        setLogoutError(false);
        try {
            const result = await logout();
            if (result === true) {
                closeMenu();
                navigate('/');
            } else if (result === false) {
                setLogoutError(true);
            }
        } catch {
            setLogoutError(true);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <header className="site-header">
            <Link className="logo" to="/" aria-label={t('a11y.home')} onClick={closeMenu}>
                <img src={assetUrl('images/Logo.png')} alt="NOIRSON" />
            </Link>

            <button className={`menu-toggle ${menuOpen ? 'is-open' : ''}`} type="button"
                aria-label={menuOpen ? (language === 'en' ? 'Close menu' : '關閉選單') : (language === 'en' ? 'Open menu' : '開啟選單')}
                aria-expanded={menuOpen} aria-controls="primary-navigation"
                onClick={() => setMenuOpen((open) => !open)}>
                <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
            </button>

            <nav id="primary-navigation" className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label={t('a11y.nav')}>
                <NavLink to="/" end onClick={closeMenu}>{t('nav.home')}</NavLink>
                <NavLink to="/music" onClick={closeMenu}>{t('nav.explore')}</NavLink>
                <NavLink to="/about" onClick={closeMenu}>{t('nav.about')}</NavLink>
                {currentUser && !isAuthLoading && !authError ? <>
                    <NavLink to="/member" onClick={closeMenu}>{t('nav.member')}</NavLink>
                    <button className="nav-action" type="button" onClick={handleLogout} disabled={isLoggingOut}>{t('member.logout')}</button>
                </> : <NavLink to="/login" onClick={closeMenu}>{t('nav.login')}</NavLink>}
                {logoutError && <span role="alert">{t('auth.logoutError')}</span>}

                <span className="language-switch" aria-label="Language">
                    <button className={`language-option ${language === 'zh' ? 'is-active' : ''}`} type="button"
                        aria-pressed={language === 'zh'} aria-label="切換為繁體中文" onClick={() => changeLanguage('zh')}>
                        繁中
                    </button>
                    <span aria-hidden="true">/</span>
                    <button className={`language-option ${language === 'en' ? 'is-active' : ''}`} type="button"
                        aria-pressed={language === 'en'} aria-label="Switch to English" onClick={() => changeLanguage('en')}>
                        EN
                    </button>
                </span>
            </nav>
        </header>
    );
}

export default Header;
