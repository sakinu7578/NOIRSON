// ========================================
// 共用工具：音訊播放器
// Home 與 Music Detail 使用同一套播放、時間與進度處理。
// mixes 物件由 HTML 先載入的 mix-data.js 提供，本檔不重複建立 Mix 資料。
// ========================================

// 將秒數轉換為播放器使用的 mm:ss 格式
function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

// 建立 Home 與 Detail 共用的音訊播放器。
// 傳入各頁對應的 audio、按鈕與進度列 DOM，即可共用相同事件邏輯。
function initializeAudioPlayer({ audio, playButton, progress, currentTimeLabel, totalTimeLabel, title }) {
    function updatePlayButton(isPlaying) {
        playButton.classList.toggle("is-playing", isPlaying);
        playButton.setAttribute("aria-pressed", String(isPlaying));
        playButton.setAttribute("aria-label", `${isPlaying ? "暫停" : "播放"} ${title}`);
    }

    playButton.addEventListener("click", function () {
        // audio.paused 是目前播放狀態；同一顆按鈕依狀態切換播放或暫停。
        if (audio.paused) {
            audio.play().catch(function () { updatePlayButton(false); });
        } else {
            audio.pause();
        }
    });

    audio.addEventListener("play", function () { updatePlayButton(true); });
    audio.addEventListener("pause", function () { updatePlayButton(false); });
    audio.addEventListener("ended", function () { updatePlayButton(false); });

    audio.addEventListener("loadedmetadata", function () {
        // 音訊 Metadata 載入後才能取得 duration，並設定進度列最大值。
        progress.max = audio.duration;
        totalTimeLabel.textContent = formatTime(audio.duration);
    });

    audio.addEventListener("timeupdate", function () {
        // 播放期間持續同步秒數與 CSS 進度比例。
        progress.value = audio.currentTime;
        currentTimeLabel.textContent = formatTime(audio.currentTime);
        const progressPercent = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
        progress.style.setProperty("--progress", `${progressPercent}%`);
    });

    progress.addEventListener("input", function () {
        // range 的 input 事件會在拖曳時連續觸發，因此可即時 Seek。
        audio.currentTime = Number(progress.value);
        currentTimeLabel.textContent = formatTime(audio.currentTime);
        const progressPercent = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
        progress.style.setProperty("--progress", `${progressPercent}%`);
    });
}

// ========================================
// HOME：M001 Signature Player
// 只在 body 具有 home-v2 時初始化，避免影響其他頁面的播放器。
// ========================================
if (document.body.classList.contains("home-v2")) {
    const signatureMix = mixes.M001;
    const signatureCover = document.querySelector("#signature-cover");
    const signatureSeries = document.querySelector("#signature-series");
    const signatureTitle = document.querySelector("#signature-title");
    const audio = document.querySelector("#signature-audio");
    const playButton = document.querySelector(".signature-play");
    const progress = document.querySelector("#player-progress");
    const currentTimeLabel = document.querySelector("#current-time");
    const totalTimeLabel = document.querySelector("#total-time");

    // 從 mix-data.js 的 mixes 取得 M001，更新首頁文字、圖片與音訊來源。
    signatureCover.src = signatureMix.cover;
    signatureCover.alt = `${signatureMix.title} 音樂封面`;
    signatureSeries.textContent = signatureMix.series.toUpperCase();
    signatureTitle.textContent = signatureMix.title;
    audio.src = signatureMix.audio;

    initializeAudioPlayer({ audio, playButton, progress, currentTimeLabel, totalTimeLabel, title: signatureMix.title });

    // ========================================
    // HOME：Explore Sound 無限循環 Carousel
    // Object.keys 取得 M001～M008 ID，並建立前、中、後三組卡片供無限循環使用。
    // ========================================
    const exploreMixIds = Object.keys(mixes);
    const exploreTrack = document.querySelector(".explore-track");
    const exploreViewport = document.querySelector(".explore-viewport");
    const previousMixButton = document.querySelector(".explore-arrow--previous");
    const nextMixButton = document.querySelector(".explore-arrow--next");
    const carouselMixIds = [
        ...exploreMixIds,
        ...exploreMixIds,
        ...exploreMixIds
    ];

    let cardStep = 0;
    let baseTranslateX = 0;
    let carouselIndex = exploreMixIds.length + 2;
    let dragStartX = 0;
    let dragDistance = 0;
    let isDragging = false;
    let hasDragged = false;
    let isSwitching = false;

    function updateCardStep() {
        const firstCard = exploreTrack.querySelector(".explore-card");

        if (!firstCard) return;

        const trackStyle = window.getComputedStyle(exploreTrack);
        const gap = parseFloat(trackStyle.columnGap) || 0;

        const nextCardStep = firstCard.getBoundingClientRect().width + gap;

        if (Number.isFinite(nextCardStep) && nextCardStep > 0) {
            cardStep = nextCardStep;
        }
    }

    function updateCarouselPosition() {
        const cards = exploreTrack.querySelectorAll(".explore-card");
        const currentCard = cards[carouselIndex];

        if (!currentCard) return;

        const viewportCenter = exploreViewport.clientWidth / 2;

        const cardCenter =
            currentCard.offsetLeft + currentCard.offsetWidth / 2;

        baseTranslateX = viewportCenter - cardCenter;

        exploreTrack.style.transform =
            `translate3d(${baseTranslateX}px, 0, 0)`;

        updateCardClasses();
    }
    function updateCardClasses() {
        const cards = exploreTrack.querySelectorAll(".explore-card");

        cards.forEach(function (card) {
            card.classList.remove("is-edge");
        });

        const leftEdge = cards[carouselIndex - 2];
        const rightEdge = cards[carouselIndex + 2];

        if (leftEdge) {
            leftEdge.classList.add("is-edge");
        }

        if (rightEdge) {
            rightEdge.classList.add("is-edge");
        }
    }

    function normalizeCarouselIndex() {
        const mixCount = exploreMixIds.length;

        carouselIndex =
            ((carouselIndex % mixCount) + mixCount) % mixCount
            + mixCount;
    }

    // 更新目前 Carousel 顯示內容。
    function renderCarousel() {
        exploreTrack.innerHTML = carouselMixIds.map(function (mixId) {
            const mix = mixes[mixId];

            return `
                <a class="explore-card"
                    href="music-detail.html?id=${mixId}"
                    aria-label="前往 ${mix.title} 詳細頁">
                    <span class="explore-card-image">
                        <img src="${mix.cover}"
                            alt="${mix.title} 音樂封面"
                            draggable="false">
                        <span class="explore-card-copy">
                            <strong>${mix.title}</strong>
                            <small>${mix.series}</small>
                        </span>
                    </span>
                </a>
            `;
        }).join("");

        updateCardStep();
        updateCarouselPosition();
    }

    // 控制 Explore Sound 無限循環切換。
    // isSwitching 防止短時間重複點擊造成多次索引更新。
    function moveCarousel(direction) {
        if (isSwitching || isDragging) return;

        isSwitching = true;

        carouselIndex += direction;

        updateCarouselPosition();
    }

    // Carousel 動畫完成
    exploreTrack.addEventListener("transitionend", function (event) {
        if (event.target !== exploreTrack) return;
        if (event.propertyName !== "transform") return;
        if (isDragging) return;
        if (!isSwitching) return;

        const previousIndex = carouselIndex;

        normalizeCarouselIndex();

        if (carouselIndex !== previousIndex) {
            exploreTrack.style.transition = "none";

            updateCarouselPosition();

            exploreTrack.offsetHeight;

            exploreTrack.style.transition = "";
        }

        isSwitching = false;

    });
    // 尺寸改變後重新量測；若正在拖曳或 Snap，等操作完成再置中。
    let resizeFrameId = 0;
    window.addEventListener("resize", function () {
        window.cancelAnimationFrame(resizeFrameId);

        function refreshCarouselSize() {
            if (isDragging || isSwitching) {
                resizeFrameId = window.requestAnimationFrame(refreshCarouselSize);
                return;
            }

            updateCardStep();
            exploreTrack.style.transition = "none";
            updateCarouselPosition();
            exploreTrack.offsetHeight;
            exploreTrack.style.transition = "";
            resizeFrameId = 0;
        }

        resizeFrameId = window.requestAnimationFrame(refreshCarouselSize);
    });

    previousMixButton.addEventListener("click", function () { moveCarousel(-1); });
    nextMixButton.addEventListener("click", function () { moveCarousel(1); });

    // 禁止瀏覽器接管圖片／連結的原生拖曳，交由下方 Pointer Events 控制。
    exploreTrack.addEventListener("dragstart", function (event) {
        event.preventDefault();
    });

    // Pointer Events 同時支援滑鼠與觸控；超過門檻後才視為拖曳。
    exploreViewport.addEventListener("pointerdown", function (event) {
        if (isSwitching) return;

        updateCardStep();
        if (!Number.isFinite(cardStep) || cardStep <= 0) return;

        isDragging = true;
        hasDragged = false;
        dragStartX = event.clientX;
        dragDistance = 0;

        exploreViewport.classList.add("is-grabbing");
        exploreTrack.classList.add("is-dragging");

    });

    exploreViewport.addEventListener("pointermove", function (event) {
        if (!isDragging) return;

        const rawDragDistance =
            event.clientX - dragStartX;

        const maxDragDistance =
            cardStep * (exploreMixIds.length - 1);

        dragDistance = Math.max(
            -maxDragDistance,
            Math.min(maxDragDistance, rawDragDistance)
        );

        if (Math.abs(dragDistance) > 5 && !hasDragged) {
            hasDragged = true;

            // 只有確認為拖曳後才 Capture，讓一般點按保留原生連結行為。
            exploreViewport.setPointerCapture(event.pointerId);
        }

        exploreTrack.style.transform =
            `translate3d(${baseTranslateX + dragDistance}px, 0, 0)`;
    });

    exploreViewport.addEventListener("click", function (event) {
        // detail === 0 代表鍵盤觸發，不能被先前的拖曳狀態攔截。
        if (hasDragged && event.detail !== 0) {
            event.preventDefault();
            hasDragged = false;
        } else if (event.detail === 0) {
            hasDragged = false;
        }
    }, true);

    function endDrag(event) {
        if (!isDragging) return;

        isDragging = false;

        exploreViewport.classList.remove("is-grabbing");
        exploreTrack.classList.remove("is-dragging");

        let movedCards = Math.round(
            -dragDistance / cardStep
        );

        const maxMove = exploreMixIds.length - 1;

        movedCards = Math.max(
            -maxMove,
            Math.min(maxMove, movedCards)
        );

        carouselIndex += movedCards;

        if (Math.abs(dragDistance) > 0.5) {
            isSwitching = true;
        }

        updateCarouselPosition();

        if (exploreViewport.hasPointerCapture(event.pointerId)) {
            exploreViewport.releasePointerCapture(event.pointerId);
        }

        dragDistance = 0;
    }
    exploreViewport.addEventListener("pointerup", endDrag);
    exploreViewport.addEventListener("pointercancel", endDrag);
    renderCarousel();
}


const exploreGallery = document.querySelector(".explore-gallery");

// ========================================
// EXPLORE：Mix Gallery
// 使用 mix-data.js 的正式資料動態建立八張卡片，不在 HTML 重複維護內容。
// ========================================
if (exploreGallery) {
    exploreGallery.innerHTML = Object.entries(mixes).map(function ([mixId, mix]) {
        return `
            <article class="explore-gallery-item">
                <a href="music-detail.html?id=${mixId}" aria-label="前往 ${mix.title} 詳細頁">
                    <span class="explore-gallery-cover">
                        <img src="${mix.cover}" alt="${mix.title} 音樂封面">
                        <span class="explore-gallery-id">${mixId}</span>
                    </span>
                    <span class="explore-gallery-copy">
                        <strong>${mix.title}</strong>
                        <small>${mix.series}</small>
                    </span>
                </a>
            </article>
        `;
    }).join("");
}

const detailPage = document.querySelector(".detail-v2");

// ========================================
// MUSIC DETAIL：依 URL 載入 Mix
// 讀取 ?id=M003 形式的參數；未提供或找不到資料時安全回到 M001。
// ========================================
if (detailPage) {
    const requestedMixId = new URLSearchParams(window.location.search).get("id");
    const mixId = mixes[requestedMixId] ? requestedMixId : "M001";
    const mix = mixes[mixId];
    const mainVisual = document.querySelector("#detail-main-visual");
    const detailAudio = document.querySelector("#detail-audio");

    document.title = `${mix.title} | NOIRSON`;
    document.querySelector("#detail-mix-id").textContent = mixId;
    document.querySelector("#detail-series").textContent = mix.series;
    document.querySelector("#music-detail-title").textContent = mix.title;
    document.querySelector("#detail-description").textContent = mix.description.trim();

    mainVisual.src = mix.cover;
    mainVisual.alt = `${mix.title} 主視覺`;
    detailAudio.src = mix.audio;

    const youtubeLink = document.querySelector("#detail-youtube");
    youtubeLink.href = mix.youtube;
    youtubeLink.hidden = !mix.youtube;

    // 依 M001～M008 順序循環切換上一首與下一首。
    // 取餘數讓 M001 的上一首回到 M008，M008 的下一首回到 M001。
    const detailMixIds = Object.keys(mixes);
    const currentMixIndex = detailMixIds.indexOf(mixId);
    const previousMixId = detailMixIds[(currentMixIndex - 1 + detailMixIds.length) % detailMixIds.length];
    const nextMixId = detailMixIds[(currentMixIndex + 1) % detailMixIds.length];

    document.querySelector(".detail-previous").addEventListener("click", function () {
        window.location.href = `music-detail.html?id=${previousMixId}`;
    });

    document.querySelector(".detail-next").addEventListener("click", function () {
        window.location.href = `music-detail.html?id=${nextMixId}`;
    });

    // 建立並控制浮動 Playlist。
    // 清單來自 mixes，點選項目會更新 URL 並重新載入對應 Detail。
    const playlistToggle = document.querySelector(".detail-playlist-toggle");
    const playlistPanel = document.querySelector(".detail-playlist-panel");
    const playlistClose = document.querySelector(".detail-playlist-close");
    const playlistList = document.querySelector(".detail-playlist-list");

    playlistList.innerHTML = Object.entries(mixes).map(function ([playlistMixId, playlistMix]) {
        const isActive = playlistMixId === mixId;

        return `
            <a class="detail-playlist-item${isActive ? " is-active" : ""}" href="music-detail.html?id=${playlistMixId}"${isActive ? " aria-current=\"page\"" : ""}>
                <img src="${playlistMix.cover}" alt="${playlistMix.title} 音樂封面">
                <span class="detail-playlist-item-copy">
                    <strong>${playlistMix.title}</strong>
                    <small>${playlistMix.series}</small>
                </span>
            </a>
        `;
    }).join("");

    function setPlaylistOpen(isOpen) {
        // hidden 控制面板顯示，aria-expanded 同步提供輔助工具目前狀態。
        playlistPanel.hidden = !isOpen;
        playlistToggle.setAttribute("aria-expanded", String(isOpen));
        playlistToggle.setAttribute("aria-label", `${isOpen ? "關閉" : "開啟"}播放清單`);
    }

    playlistToggle.addEventListener("click", function () {
        setPlaylistOpen(playlistPanel.hidden);
    });

    playlistClose.addEventListener("click", function () {
        setPlaylistOpen(false);
    });

    document.addEventListener("click", function (event) {
        // 點擊面板與開關以外的區域時收合 Playlist。
        if (!playlistPanel.hidden && !playlistPanel.contains(event.target) && !playlistToggle.contains(event.target)) {
            setPlaylistOpen(false);
        }
    });

    initializeAudioPlayer({
        audio: detailAudio,
        playButton: document.querySelector(".detail-play"),
        progress: document.querySelector("#detail-progress"),
        currentTimeLabel: document.querySelector("#detail-current-time"),
        totalTimeLabel: document.querySelector("#detail-total-time"),
        title: mix.title
    });

    // 建立 Gallery 並切換左側主視覺。
    // 先放入 Cover，再過濾 gallery[] 中重複的 Cover，確保可切回原始封面。
    const detailGallery = document.querySelector(".detail-gallery");
    const galleryImages = [mix.cover].concat(mix.gallery.filter(function (imagePath) {
        return imagePath !== mix.cover;
    }));

    detailGallery.innerHTML = galleryImages.map(function (imagePath, index) {
        return `
            <button class="detail-gallery-thumb${index === 0 ? " is-active" : ""}" type="button" data-image="${imagePath}" aria-label="顯示第 ${index + 1} 張 Mix 圖片">
                <img src="${imagePath}" alt="${mix.title} Gallery ${index + 1}">
            </button>
        `;
    }).join("");

    // 以「縮圖寬度 + Grid Gap」計算一次捲動距離，保持每次前進一張。
    function scrollDetailGallery(direction) {
        const thumbnail = detailGallery.querySelector(".detail-gallery-thumb");
        if (!thumbnail) return;

        const galleryGap = parseFloat(window.getComputedStyle(detailGallery).gap) || 0;
        detailGallery.scrollBy({
            left: direction * (thumbnail.offsetWidth + galleryGap),
            behavior: "smooth"
        });
    }

    document.querySelector(".detail-gallery-previous").addEventListener("click", function () {
        scrollDetailGallery(-1);
    });

    document.querySelector(".detail-gallery-next").addEventListener("click", function () {
        scrollDetailGallery(1);
    });

    detailGallery.addEventListener("click", function (event) {
        // 事件代理讓動態建立的所有縮圖共用同一個 click listener。
        const thumbnail = event.target.closest(".detail-gallery-thumb");
        if (!thumbnail) return;

        mainVisual.src = thumbnail.dataset.image;
        document.querySelectorAll(".detail-gallery-thumb").forEach(function (button) {
            button.classList.toggle("is-active", button === thumbnail);
        });
    });
}

const aboutBackgroundLayers = document.querySelectorAll(".about-background-layer");

// ========================================
// ABOUT：背景 Crossfade
// 依 00.png～16.png 固定順序切換，使用兩個 Layer 交替 Active 狀態。
// ========================================
if (aboutBackgroundLayers.length === 2) {
    const aboutImages = Array.from({ length: 17 }, function (_, index) {
        return `images/${String(index).padStart(2, "0")}.png`;
    });
    let aboutImageIndex = 0;
    let activeLayerIndex = 0;

    aboutBackgroundLayers[0].style.backgroundImage = `url("${aboutImages[0]}")`;
    aboutBackgroundLayers[1].style.backgroundImage = `url("${aboutImages[1]}")`;

    window.setInterval(function () {
        // 取餘數讓最後一張顯示後重新回到 00.png。
        aboutImageIndex = (aboutImageIndex + 1) % aboutImages.length;
        const nextLayerIndex = activeLayerIndex === 0 ? 1 : 0;
        const nextLayer = aboutBackgroundLayers[nextLayerIndex];

        nextLayer.style.backgroundImage = `url("${aboutImages[aboutImageIndex]}")`;
        nextLayer.classList.add("is-active");
        aboutBackgroundLayers[activeLayerIndex].classList.remove("is-active");
        activeLayerIndex = nextLayerIndex;
    }, 7000);
}
