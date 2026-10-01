// 將秒數轉換為播放器使用的 mm:ss 格式
function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

// 建立 Home 與 Detail 共用的音訊播放器
function initializeAudioPlayer({ audio, playButton, progress, currentTimeLabel, totalTimeLabel, title }) {
    function updatePlayButton(isPlaying) {
        playButton.classList.toggle("is-playing", isPlaying);
        playButton.setAttribute("aria-pressed", String(isPlaying));
        playButton.setAttribute("aria-label", `${isPlaying ? "暫停" : "播放"} ${title}`);
    }

    playButton.addEventListener("click", function () {
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
        progress.max = audio.duration;
        totalTimeLabel.textContent = formatTime(audio.duration);
    });

    audio.addEventListener("timeupdate", function () {
        progress.value = audio.currentTime;
        currentTimeLabel.textContent = formatTime(audio.currentTime);
        const progressPercent = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
        progress.style.setProperty("--progress", `${progressPercent}%`);
    });

    progress.addEventListener("input", function () {
        audio.currentTime = Number(progress.value);
        currentTimeLabel.textContent = formatTime(audio.currentTime);
        const progressPercent = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
        progress.style.setProperty("--progress", `${progressPercent}%`);
    });
}

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

// 載入 M001 的正式資料
signatureCover.src = signatureMix.cover;
signatureCover.alt = `${signatureMix.title} 音樂封面`;
signatureSeries.textContent = signatureMix.series.toUpperCase();
signatureTitle.textContent = signatureMix.title;
audio.src = signatureMix.audio;

initializeAudioPlayer({ audio, playButton, progress, currentTimeLabel, totalTimeLabel, title: signatureMix.title });

const exploreMixIds = Object.keys(mixes);
const exploreTrack = document.querySelector(".explore-track");
const exploreViewport = document.querySelector(".explore-viewport");
const previousMixButton = document.querySelector(".explore-arrow--previous");
const nextMixButton = document.querySelector(".explore-arrow--next");

let carouselIndex = 2;
let dragStartX = 0;
let isDragging = false;
let hasDragged = false;
let isSwitching = false;

// 計算循環後的 Mix index
function getLoopedIndex(index) {
    return (index + exploreMixIds.length) % exploreMixIds.length;
}

// 更新目前 Carousel 顯示內容
function renderCarousel() {
    const visibleOffsets = [-2, -1, 0, 1, 2];

    exploreTrack.innerHTML = visibleOffsets.map(function (offset) {
        const mixId = exploreMixIds[getLoopedIndex(carouselIndex + offset)];
        const mix = mixes[mixId];

        return `
            <a class="explore-card" href="music-detail.html?id=${mixId}" aria-label="前往 ${mix.title} 詳細頁">
                <span class="explore-card-image"><img src="${mix.cover}" alt="${mix.title} 音樂封面" draggable="false"></span>
                <span class="explore-card-copy"><strong>${mix.title}</strong><small>${mix.series}</small></span>
            </a>
        `;
    }).join("");
}

// 控制 Explore Sound 無限循環切換
function moveCarousel(direction) {
    if (isSwitching) return;

    isSwitching = true;
    const switchingClass = direction > 0 ? "is-switching-next" : "is-switching-previous";
    exploreTrack.classList.add(switchingClass);

    window.setTimeout(function () {
        carouselIndex = getLoopedIndex(carouselIndex + direction);
        renderCarousel();
        exploreTrack.classList.remove(switchingClass);
        isSwitching = false;
    }, 180);
}

previousMixButton.addEventListener("click", function () { moveCarousel(-1); });
nextMixButton.addEventListener("click", function () { moveCarousel(1); });

// 處理滑鼠拖曳切換
exploreViewport.addEventListener("mousedown", function (event) {
    isDragging = true;
    hasDragged = false;
    dragStartX = event.clientX;
    exploreViewport.classList.add("is-grabbing");
    exploreTrack.classList.add("is-dragging");
});

window.addEventListener("mousemove", function (event) {
    if (!isDragging) return;
    const dragDistance = event.clientX - dragStartX;
    hasDragged = hasDragged || Math.abs(dragDistance) > 5;
    const limitedDistance = Math.max(-80, Math.min(80, dragDistance));
    exploreTrack.style.transform = `translate3d(${limitedDistance}px, 0, 0)`;
});

window.addEventListener("mouseup", function (event) {
    if (!isDragging) return;

    const dragDistance = event.clientX - dragStartX;
    isDragging = false;
    exploreViewport.classList.remove("is-grabbing");
    exploreTrack.classList.remove("is-dragging");
    exploreTrack.style.transform = "";

    if (Math.abs(dragDistance) >= 50) {
        moveCarousel(dragDistance < 0 ? 1 : -1);
    }
});

exploreTrack.addEventListener("click", function (event) {
    if (hasDragged) {
        event.preventDefault();
        hasDragged = false;
    }
});

renderCarousel();
}

const exploreGallery = document.querySelector(".explore-gallery");

// 使用正式 Mix 資料建立 Explore Gallery
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

// 依網址參數載入對應 Mix，無效時回到 M001
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

    initializeAudioPlayer({
        audio: detailAudio,
        playButton: document.querySelector(".detail-play"),
        progress: document.querySelector("#detail-progress"),
        currentTimeLabel: document.querySelector("#detail-current-time"),
        totalTimeLabel: document.querySelector("#detail-total-time"),
        title: mix.title
    });

    // 建立 Gallery 並切換左側主視覺
    const detailGallery = document.querySelector(".detail-gallery");
    detailGallery.innerHTML = mix.gallery.map(function (imagePath, index) {
        return `
            <button class="detail-gallery-thumb" type="button" data-image="${imagePath}" aria-label="顯示第 ${index + 1} 張 Mix 圖片">
                <img src="${imagePath}" alt="${mix.title} Gallery ${index + 1}">
            </button>
        `;
    }).join("");

    detailGallery.addEventListener("click", function (event) {
        const thumbnail = event.target.closest(".detail-gallery-thumb");
        if (!thumbnail) return;

        mainVisual.src = thumbnail.dataset.image;
        document.querySelectorAll(".detail-gallery-thumb").forEach(function (button) {
            button.classList.toggle("is-active", button === thumbnail);
        });
    });
}

const aboutBackgroundLayers = document.querySelectorAll(".about-background-layer");

// 依固定順序慢速切換 About 背景
if (aboutBackgroundLayers.length === 2) {
    const aboutImages = Array.from({ length: 17 }, function (_, index) {
        return `images/${String(index).padStart(2, "0")}.png`;
    });
    let aboutImageIndex = 0;
    let activeLayerIndex = 0;

    aboutBackgroundLayers[0].style.backgroundImage = `url("${aboutImages[0]}")`;
    aboutBackgroundLayers[1].style.backgroundImage = `url("${aboutImages[1]}")`;

    window.setInterval(function () {
        aboutImageIndex = (aboutImageIndex + 1) % aboutImages.length;
        const nextLayerIndex = activeLayerIndex === 0 ? 1 : 0;
        const nextLayer = aboutBackgroundLayers[nextLayerIndex];

        nextLayer.style.backgroundImage = `url("${aboutImages[aboutImageIndex]}")`;
        nextLayer.classList.add("is-active");
        aboutBackgroundLayers[activeLayerIndex].classList.remove("is-active");
        activeLayerIndex = nextLayerIndex;
    }, 7000);
}
