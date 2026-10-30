import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router';
import { assetUrl } from '../utils/assetUrl.js';
import useLanguage from '../hooks/useLanguage.js';

function Header() {
    const { language, setLanguage, t } = useLanguage();
    const [menuOpen, setMenuOpen] = useState(false);

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
                <NavLink to="/login" onClick={closeMenu}>{t('nav.login')}</NavLink>
                <NavLink to="/member" onClick={closeMenu}>{t('nav.member')}</NavLink>

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
