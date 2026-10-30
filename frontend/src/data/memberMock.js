// 展示用會員資料；收藏、留言與播放紀錄只保留 Mix ID 關聯。
const memberMock = {
  nickname: 'KINU',
  email: 'kinu@example.com',
  favorites: ['M001', 'M003', 'M008'],
  comments: [
    { id: 1, mixId: 'M002', textZh: '雨聲和節奏很適合清晨。', textEn: 'The rain and rhythm feel perfect for an early morning.', date: '2026-10-12' },
    { id: 2, mixId: 'M006', textZh: '喜歡這段雨後的氛圍。', textEn: 'Love the atmosphere after the rain.', date: '2026-10-08' },
  ],
  recentPlays: ['M008', 'M006', 'M001'],
};

export default memberMock;
