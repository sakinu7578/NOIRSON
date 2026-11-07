
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Explore from './pages/Explore.jsx';
import MusicDetail from './pages/MusicDetail.jsx';
import About from './pages/About.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Member from './pages/Member.jsx';
import MiniPlayer from './components/MiniPlayer.jsx';
import mixes from './data/mixData.js';
import useLanguage from './hooks/useLanguage.js';
import { useEffect, useLayoutEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router';
import './styles/style.css';

// 路由共用 Header、Footer 與 MiniPlayer；body class 只控制各頁版面樣式。
const pageClasses = {
  '/': 'home-v2',
  '/music': 'explore-v2',
  '/about': 'about-v2',
  '/login': 'auth-v2',
  '/register': 'auth-v2',
  '/member': 'member-v2',
};

const seoCopy = {
  zh: {
    home: ['NOIRSON｜探索音樂 Mix', '探索 NOIRSON 的八首音樂 Mix，從 Lofi、Jazz 到 Cloud Trap 與 City Pop，聆聽不同時刻的聲音。'],
    explore: ['探索音樂 Mix｜NOIRSON', '瀏覽 NOIRSON 的八首 Mix，依曲風分類探索 Chill、Lofi、Jazz、Cloud Trap 與 City Pop。'],
    about: ['關於 NOIRSON｜音樂內容探索平台', '認識 NOIRSON 的音樂世界，探索以氛圍與節奏串起的 Mix，以及幕後的音樂製作人。'],
    login: ['會員登入｜NOIRSON', '登入 NOIRSON 會員帳號。'],
    register: ['會員註冊｜NOIRSON', '註冊 NOIRSON 會員帳號。'],
    member: ['會員中心｜NOIRSON', '管理 NOIRSON 收藏、留言與播放紀錄。'],
  },
  en: {
    home: ['NOIRSON | Explore Music Mixes', 'Explore eight music mixes on NOIRSON, from lofi and jazz to cloud trap and city pop. Listen to sounds for different moments.'],
    explore: ['Explore Music Mixes | NOIRSON', 'Browse eight NOIRSON mixes by genre, including chill, lofi, jazz, cloud trap and city pop.'],
    about: ['About NOIRSON | Music Discovery', 'Discover the world of NOIRSON, its atmospheric music mixes and the producers behind the sound.'],
    login: ['Member Login | NOIRSON', 'Log in to your NOIRSON member account.'],
    register: ['Member Registration | NOIRSON', 'Create a NOIRSON member account.'],
    member: ['Member Area | NOIRSON', 'Manage your NOIRSON favorites, comments and play history.'],
  },
};

function PageMetadata({ pathname }) {
  const { language } = useLanguage();

  useEffect(() => {
    const copy = seoCopy[language];
    const mixId = pathname.startsWith('/music/') ? pathname.slice('/music/'.length) : null;
    const mix = mixId && Object.hasOwn(mixes, mixId) ? mixes[mixId] : null;
    let [title, description] = copy.home;

    if (mix) {
      title = language === 'en' ? `${mix.title} | Music Mix | NOIRSON` : `${mix.title}｜音樂 Mix｜NOIRSON`;
      description = (language === 'en' ? mix.description : mix.descriptionZh)
        .replace(/\s+/g, ' ').trim().slice(0, 160);
    } else {
      const page = { '/music': 'explore', '/about': 'about', '/login': 'login', '/register': 'register', '/member': 'member' }[pathname];
      if (page) [title, description] = copy[page];
    }

    document.title = title;
    document.querySelector('meta[name="description"]').setAttribute('content', description);
    let robots = document.querySelector('meta[name="robots"]');
    if (['/login', '/register', '/member'].includes(pathname)) {
      if (!robots) {
        robots = document.createElement('meta');
        robots.setAttribute('name', 'robots');
        document.head.append(robots);
      }
      robots.setAttribute('content', 'noindex, nofollow');
    } else {
      robots?.remove();
    }
  }, [language, pathname]);

  return null;
}

function App() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    const pageClass = pageClasses[pathname] ?? (pathname.startsWith('/music/') ? 'detail-v2' : '');
    document.body.classList.remove('home-v2', 'explore-v2', 'detail-v2', 'about-v2', 'auth-v2', 'member-v2');
    if (pageClass) document.body.classList.add(pageClass);
    if (pathname !== '/') {
      const footer = document.querySelector('.site-footer--v2');
      if (footer) {
        footer.inert = false;
        footer.removeAttribute('aria-hidden');
      }
      delete document.body.dataset.homeStage;
    }
    window.scrollTo(0, 0);
    return () => document.body.classList.remove(pageClass);
  }, [pathname]);

  return (
    <>
      <PageMetadata pathname={pathname} />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/music" element={<Explore />} />
        <Route path="/music/:id" element={<MusicDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/member" element={<Member />} />
      </Routes>
      <MiniPlayer />
      <Footer />
    </>
  );
}

export default App;
