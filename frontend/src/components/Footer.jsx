
import useLanguage from '../hooks/useLanguage.js';

function Footer() {
    const { t } = useLanguage();
    return (
        <footer className="site-footer site-footer--v2">
            <nav className="social-links" aria-label={t('a11y.social')}>
                <a
                    href="https://www.youtube.com/@NOIRSON/featured"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
                    </svg>
                    <span>YOUTUBE</span>
                </a>
                <a
                    href="https://open.spotify.com/artist/2AEwxDNnN3ItPROEBoiIdD?si=mYXE1ziWRpimqdb7zkumOw"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.5 17.3a.75.75 0 0 1-1 .25c-2.8-1.7-6.4-2.1-10.6-1.15a.75.75 0 1 1-.33-1.46c4.6-1.04 8.6-.58 11.68 1.3.35.21.46.68.25 1.06Zm1.42-3.15a.94.94 0 0 1-1.29.31c-3.21-1.97-8.1-2.54-11.9-1.39a.94.94 0 1 1-.55-1.8c4.34-1.31 9.74-.67 13.43 1.59.44.27.58.85.31 1.29Zm.12-3.28C15.2 8.58 8.84 8.37 5.17 9.48a1.13 1.13 0 1 1-.65-2.16c4.22-1.28 11.25-1.03 15.68 1.6a1.13 1.13 0 0 1-1.16 1.95Z" />
                    </svg>
                    <span>SPOTIFY</span>
                </a>
                <a
                    href="https://www.instagram.com/noirson_0?utm_source=ig_web_button_share_sheet&amp;stkn=ZDNlZDc0MzIxNw=="
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2 0 1.8.2 2.2.4.5.2.9.5 1.3.9.4.4.7.8.9 1.3.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.2 1.8-.4 2.2-.2.5-.5.9-.9 1.3-.4.4-.8.7-1.3.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.2-2.2-.4a3.7 3.7 0 0 1-1.3-.9 3.7 3.7 0 0 1-.9-1.3c-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c0-1.2.2-1.8.4-2.2.2-.5.5-.9.9-1.3.4-.4.8-.7 1.3-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2ZM12 0C8.7 0 8.3 0 7 .1 5.7.1 4.8.3 4 .6c-.8.3-1.5.7-2.2 1.4C1.1 2.7.7 3.4.4 4.2.1 5 0 5.9 0 7.2 0 8.5 0 8.9 0 12s0 3.5.1 4.8c0 1.3.2 2.2.5 3 .3.8.7 1.5 1.4 2.2.7.7 1.4 1.1 2.2 1.4.8.3 1.7.5 3 .5 1.3.1 1.7.1 4.8.1s3.5 0 4.8-.1c1.3 0 2.2-.2 3-.5.8-.3 1.5-.7 2.2-1.4.7-.7 1.1-1.4 1.4-2.2.3-.8.5-1.7.5-3 .1-1.3.1-1.7.1-4.8s0-3.5-.1-4.8c0-1.3-.2-2.2-.5-3-.3-.8-.7-1.5-1.4-2.2A6 6 0 0 0 19.8.5c-.8-.3-1.7-.5-3-.5C15.5 0 15.1 0 12 0Zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.9-10.5a1.45 1.45 0 1 1-2.9 0 1.45 1.45 0 0 1 2.9 0Z" />
                    </svg>
                    <span>INSTAGRAM</span>
                </a>
            </nav>

            <div className="footer-meta">
                <span>{t('footer.produced')}</span>
                <span>© NOIRSON</span>
            </div>
        </footer>
    );
}

export default Footer;
