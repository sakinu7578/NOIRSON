
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
import { useLayoutEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router';
import './styles/style.css';

const pageClasses = {
  '/': 'home-v2',
  '/music': 'explore-v2',
  '/about': 'about-v2',
  '/login': 'auth-v2',
  '/register': 'auth-v2',
  '/member': 'member-v2',
};

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
