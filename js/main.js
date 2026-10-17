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
    document.documentElement.classList.add("home-scenes");

    const signatureMixId = "M001";
    const signatureMix = mixes[signatureMixId];
    const signatureCover = document.querySelector("#signature-cover");
    const signatureBackgroundLayers = document.querySelectorAll(".signature-background");
    const signatureMiniKicker = document.querySelector("#signature-mini-kicker");
    const signatureMiniTitle = document.querySelector("#signature-mini-title");
    const signatureMiniPlayer = document.querySelector(".signature-mini-player");
    const audio = document.querySelector("#signature-audio");
    const playButton = document.querySelector(".signature-play");
    const progress = document.querySelector("#player-progress");
    const volumeSlider = document.querySelector("#signature-volume");
    const loopButton = document.querySelector(".signature-loop");
    const currentTimeLabel = document.querySelector("#current-time");
    const totalTimeLabel = document.querySelector("#total-time");
    const signatureContent = document.querySelector(".signature-content");
    const signatureVisualizer = document.querySelector(".signature-visualizer");
    const listeningAtmosphere = document.querySelector(".listening-atmosphere");
    const exploreSound = document.querySelector(".explore-sound");
    const homeFooter = document.querySelector(".site-footer--v2");
    const homeStageMarkers = document.querySelectorAll(".home-scroll-stage");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    // 從 mix-data.js 的 mixes 取得 M001，更新首頁文字、圖片與音訊來源。
    signatureCover.src = signatureMix.cover;
    signatureCover.alt = `${signatureMix.title} 音樂封面`;
    signatureMiniKicker.textContent = `NOW PLAYING · ${signatureMixId}`;
    signatureMiniTitle.textContent = signatureMix.title;
    signatureMiniPlayer.setAttribute("aria-label", `${signatureMixId} Mini Player：${signatureMix.title}`);
    audio.src = signatureMix.audio;

    // Home 三個 Stage 共用同一組固定順序背景；兩層圖片交替淡入，避免換圖瞬間露出底色。
    const signatureBackgroundImages = [
        "images/00.png",
        "images/01.png",
        "images/05.png",
        "images/04.png",
        "images/13.png",
        "images/14.png"
    ];
    const signatureBackgroundInterval = 6000;
    const signatureBackgroundFade = 2000;
    let signatureBackgroundIndex = 0;
    let activeSignatureBackgroundLayer = 0;
    let signatureBackgroundTimer = null;
    let signatureBackgroundRequest = 0;

    // 保留預載物件的參照，並等待目標圖片載入完成後才開始淡入。
    const signatureBackgroundPreloads = signatureBackgroundImages.map(function (imagePath) {
        const preloadImage = new Image();
        preloadImage.src = imagePath;
        return preloadImage;
    });

    function scheduleSignatureBackground() {
        window.clearTimeout(signatureBackgroundTimer);
        signatureBackgroundTimer = window.setTimeout(advanceSignatureBackground, signatureBackgroundInterval);
    }

    function advanceSignatureBackground() {
        const requestedIndex = (signatureBackgroundIndex + 1) % signatureBackgroundImages.length;
        const requestedImage = signatureBackgroundPreloads[requestedIndex];
        const requestId = ++signatureBackgroundRequest;

        function beginCrossfade() {
            // 過期的圖片載入回呼不可覆蓋較新的背景狀態。
            if (requestId !== signatureBackgroundRequest) return;

            const nextLayerIndex = activeSignatureBackgroundLayer === 0 ? 1 : 0;
            const currentLayer = signatureBackgroundLayers[activeSignatureBackgroundLayer];
            const nextLayer = signatureBackgroundLayers[nextLayerIndex];

            // 只更新已隱藏的圖層；目前可見圖片保持不變，直到新圖完全淡入。
            nextLayer.src = signatureBackgroundImages[requestedIndex];
            nextLayer.style.zIndex = "1";
            nextLayer.classList.add("is-active");

            window.setTimeout(function () {
                // 新圖已完全顯示後，瞬間隱藏舊層，避免舊層再跑一次淡出並蓋回新圖。
                currentLayer.classList.add("is-resetting");
                currentLayer.classList.remove("is-active");
                currentLayer.style.zIndex = "0";
                nextLayer.style.zIndex = "0";
                void currentLayer.offsetWidth;
                currentLayer.classList.remove("is-resetting");
                signatureBackgroundIndex = requestedIndex;
                activeSignatureBackgroundLayer = nextLayerIndex;
            }, signatureBackgroundFade);

            scheduleSignatureBackground();
        }

        if (requestedImage.complete && requestedImage.naturalWidth > 0) {
            beginCrossfade();
            return;
        }

        requestedImage.addEventListener("load", beginCrossfade, { once: true });
        requestedImage.addEventListener("error", scheduleSignatureBackground, { once: true });
    }

    scheduleSignatureBackground();

    initializeAudioPlayer({ audio, playButton, progress, currentTimeLabel, totalTimeLabel, title: signatureMix.title });

    const spectrumCanvas = signatureVisualizer;
    const spectrumContext = spectrumCanvas.getContext("2d");
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    let audioContext = null;
    let audioSourceNode = null;
    let analyserNode = null;
    let frequencyData = null;
    let spectrumAnimationFrame = null;
    let spectrumUnavailable = !AudioContextClass;
    let spectrumWidth = 0;
    let spectrumHeight = 0;
    let displayedSpectrumHeights = [];

    function resizeSpectrumCanvas() {
        const bounds = spectrumCanvas.getBoundingClientRect();
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        spectrumWidth = Math.max(1, bounds.width);
        spectrumHeight = Math.max(1, bounds.height);
        spectrumCanvas.width = Math.round(spectrumWidth * pixelRatio);
        spectrumCanvas.height = Math.round(spectrumHeight * pixelRatio);
        spectrumContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        if (spectrumAnimationFrame !== null) window.cancelAnimationFrame(spectrumAnimationFrame);
        spectrumAnimationFrame = null;
        drawSpectrum(true);
    }

    function drawSpectrum(forceStatic = false) {
        const barCount = Math.min(512, Math.max(64, Math.round(spectrumWidth / 12)));
        const barWidth = spectrumWidth / barCount;
        const amber = "#a39c8b";
        const canAnimate = analyserNode && !audio.paused && !reducedMotionQuery.matches && !forceStatic;

        if (displayedSpectrumHeights.length !== barCount) {
            displayedSpectrumHeights = Array(barCount).fill(1);
        }

        let frameAverageStrength = 0;

        if (canAnimate) {
            analyserNode.getByteFrequencyData(frequencyData);
            const analysedBinCount = Math.max(1, Math.floor(frequencyData.length * 0.7));
            let frameTotal = 0;

            for (let index = 0; index < analysedBinCount; index += 1) {
                frameTotal += frequencyData[index];
            }

            frameAverageStrength = frameTotal / analysedBinCount / 255;
        }

        spectrumContext.clearRect(0, 0, spectrumWidth, spectrumHeight);
        spectrumContext.fillStyle = amber;

        for (let index = 0; index < barCount; index += 1) {
            let targetHeight = 1;

            if (canAnimate) {
                const normalizedPosition = (index + 0.5) / barCount;
                const distanceFromCenter = Math.abs(normalizedPosition - 0.5) * 2;
                const isLeftSide = normalizedPosition < 0.5;
                const frequencyCurve = isLeftSide ? 1.18 : 1.12;
                const frequencyOffset = isLeftSide ? 0.012 : 0.024;
                const frequencyPosition = Math.min(1, Math.pow(distanceFromCenter, frequencyCurve) + frequencyOffset);
                const dataIndex = Math.max(1, Math.min(frequencyData.length - 1, Math.floor(frequencyPosition * frequencyData.length * 0.7)));
                const rawStrength = frequencyData[dataIndex] / 255;
                const balancedStrength = rawStrength * 0.64 + frameAverageStrength * 0.36;
                const centerEnvelope = 0.78 - distanceFromCenter * 0.18;
                targetHeight = 1 + balancedStrength * (spectrumHeight - 1) * centerEnvelope * 0.72;
            }

            const smoothing = targetHeight > displayedSpectrumHeights[index] ? 0.24 : 0.08;
            displayedSpectrumHeights[index] += (targetHeight - displayedSpectrumHeights[index]) * smoothing;
            const height = Math.max(1, displayedSpectrumHeights[index]);
            // 控制每根等化器 Bar
            spectrumContext.fillRect(
                index * barWidth,
                spectrumHeight - height,
                Math.ceil(barWidth),
                height
            );
        }

        const isReturningToRest = analyserNode && displayedSpectrumHeights.some(function (height) { return height > 1.2; });

        if ((!audio.paused && analyserNode && !reducedMotionQuery.matches) || isReturningToRest) {
            spectrumAnimationFrame = window.requestAnimationFrame(function () { drawSpectrum(false); });
        } else {
            spectrumAnimationFrame = null;
        }
    }

    function startSpectrumAnimation() {
        if (reducedMotionQuery.matches || spectrumUnavailable) {
            drawSpectrum(true);
            return;
        }

        if (spectrumAnimationFrame !== null) return;
        spectrumAnimationFrame = window.requestAnimationFrame(function () { drawSpectrum(false); });
    }

    function ensureAudioSpectrum() {
        if (spectrumUnavailable || reducedMotionQuery.matches) return Promise.resolve(false);

        try {
            if (!audioContext) {
                audioContext = new AudioContextClass();
                audioSourceNode = audioContext.createMediaElementSource(audio);
                analyserNode = audioContext.createAnalyser();
                analyserNode.fftSize = 1024;
                analyserNode.smoothingTimeConstant = 0.88;
                frequencyData = new Uint8Array(analyserNode.frequencyBinCount);
                audioSourceNode.connect(analyserNode);
                analyserNode.connect(audioContext.destination);
            }

            if (audioContext.state === "suspended") return audioContext.resume().then(function () { return true; });
            return Promise.resolve(true);
        } catch (error) {
            if (audioSourceNode && audioContext && !analyserNode) {
                audioSourceNode.connect(audioContext.destination);
            }
            spectrumUnavailable = true;
            return Promise.resolve(false);
        }
    }

    if ("ResizeObserver" in window) {
        new ResizeObserver(resizeSpectrumCanvas).observe(spectrumCanvas);
    } else {
        window.addEventListener("resize", resizeSpectrumCanvas);
    }

    resizeSpectrumCanvas();
    playButton.addEventListener("pointerdown", ensureAudioSpectrum);
    playButton.addEventListener("click", ensureAudioSpectrum);

    function updateVolumeControl() {
        volumeSlider.value = audio.volume;
        volumeSlider.style.setProperty("--volume", `${audio.volume * 100}%`);
    }

    volumeSlider.addEventListener("input", function () {
        audio.volume = Number(volumeSlider.value);
    });

    audio.addEventListener("volumechange", updateVolumeControl);
    updateVolumeControl();

    function updateLoopControl() {
        loopButton.setAttribute("aria-pressed", String(audio.loop));
        loopButton.setAttribute("aria-label", audio.loop ? "關閉循環播放" : "開啟循環播放");
    }

    audio.loop = false;
    loopButton.addEventListener("click", function () {
        audio.loop = !audio.loop;
        updateLoopControl();
    });
    updateLoopControl();

    audio.addEventListener("play", function () {
        ensureAudioSpectrum().then(startSpectrumAnimation);
    });

    function settleSpectrum() {
        if (frequencyData) frequencyData.fill(0);
        startSpectrumAnimation();
    }

    audio.addEventListener("pause", settleSpectrum);
    audio.addEventListener("ended", settleSpectrum);

    let activeHomeStage = 1;

    function setHomeStage(stageNumber) {
        const activeStage = String(stageNumber);
        activeHomeStage = stageNumber;
        document.body.dataset.homeStage = activeStage;

        [signatureContent, exploreSound, homeFooter].forEach(function (scene, index) {
            const isActive = index + 1 === stageNumber;
            scene.inert = !isActive;
            scene.setAttribute("aria-hidden", String(!isActive));
        });

        listeningAtmosphere.setAttribute("aria-hidden", String(stageNumber !== 3));
    }

    function getHomeStageFromScroll() {
        const viewportCenter = window.innerHeight / 2;
        let closestStage = 1;
        let closestDistance = Infinity;

        homeStageMarkers.forEach(function (marker) {
            const markerRect = marker.getBoundingClientRect();
            const markerCenter = markerRect.top + markerRect.height / 2;
            const distance = Math.abs(markerCenter - viewportCenter);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestStage = Number(marker.dataset.homeStage);
            }
        });

        return closestStage;
    }

    setHomeStage(getHomeStageFromScroll());

    let homeScrollFrame = null;

    function requestHomeStageUpdate() {
        if (homeScrollFrame !== null) return;

        homeScrollFrame = window.requestAnimationFrame(function () {
            setHomeStage(getHomeStageFromScroll());
            homeScrollFrame = null;
        });
    }

    window.addEventListener("scroll", requestHomeStageUpdate, { passive: true });
    window.addEventListener("resize", requestHomeStageUpdate);

    const desktopWheelQuery = window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)");
    let wheelUnlockTimer = null;
    let wheelCooldownDirection = 0;
    let isWheelStageAnimating = false;
    let isWheelStageCoolingDown = false;

    function beginWheelCooldown(direction) {
        window.clearTimeout(wheelUnlockTimer);
        wheelCooldownDirection = direction;
        isWheelStageCoolingDown = true;
        wheelUnlockTimer = window.setTimeout(function () {
            isWheelStageCoolingDown = false;
            wheelUnlockTimer = null;
        }, 180);
    }

    function scrollToHomeStage(stageNumber, direction) {
        const targetMarker = homeStageMarkers[stageNumber - 1];
        const startPosition = window.scrollY;
        const targetPosition = targetMarker.offsetTop;
        const distance = targetPosition - startPosition;
        const duration = reducedMotionQuery.matches ? 0 : 760;
        isWheelStageAnimating = true;

        if (duration === 0) {
            window.scrollTo(0, targetPosition);
            setHomeStage(stageNumber);
            isWheelStageAnimating = false;
            beginWheelCooldown(direction);
            return;
        }

        const startTime = performance.now();

        function animateStageScroll(currentTime) {
            const elapsed = Math.min(1, (currentTime - startTime) / duration);
            const easedProgress = 1 - Math.pow(1 - elapsed, 3);
            window.scrollTo(0, startPosition + distance * easedProgress);

            if (elapsed < 1) {
                window.requestAnimationFrame(animateStageScroll);
                return;
            }

            setHomeStage(stageNumber);
            isWheelStageAnimating = false;
            beginWheelCooldown(direction);
        }

        window.requestAnimationFrame(animateStageScroll);
    }

    window.addEventListener("wheel", function (event) {
        if (!desktopWheelQuery.matches || event.ctrlKey) return;
        if (event.target instanceof Element && event.target.closest('input[type="range"]')) return;

        event.preventDefault();
        const normalizedDelta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;

        if (Math.abs(normalizedDelta) < 1) return;

        const direction = normalizedDelta > 0 ? 1 : -1;

        if (isWheelStageAnimating) return;

        if (isWheelStageCoolingDown) {
            if (direction === wheelCooldownDirection) {
                beginWheelCooldown(direction);
                return;
            }

            window.clearTimeout(wheelUnlockTimer);
            wheelUnlockTimer = null;
            isWheelStageCoolingDown = false;
        }

        const targetStage = Math.min(3, Math.max(1, activeHomeStage + direction));

        if (targetStage === activeHomeStage) return;

        scrollToHomeStage(targetStage, direction);
    }, { passive: false });

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
                    <span class="explore-card-image"
                        style="background-image: url('${mix.cover}')">
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

        exploreTrack.querySelectorAll(".explore-card-image img").forEach(function (image) {
            const cover = image.closest(".explore-card-image");

            function setCoverMode() {
                const fillsByHeight = image.naturalWidth / image.naturalHeight >= 4 / 3;

                cover.classList.toggle("is-cover-by-height", fillsByHeight);
                cover.classList.toggle("is-cover-by-width", !fillsByHeight);
            }

            if (image.complete && image.naturalWidth > 0) {
                setCoverMode();
            } else {
                image.addEventListener("load", setCoverMode, { once: true });
            }
        });

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
    const detailLoopButton = document.querySelector(".detail-loop");

    document.title = `${mix.title} | NOIRSON`;
    document.querySelector("#detail-mix-id").textContent = mixId;
    document.querySelector("#detail-series").textContent = mix.series;
    document.querySelector("#music-detail-title").textContent = mix.title;
    document.querySelector("#detail-description").textContent = mix.description.trim();

    mainVisual.src = mix.cover;
    mainVisual.alt = `${mix.title} 主視覺`;
    detailAudio.src = mix.audio;

    // 同一個分頁切換 Mix 時保留循環設定；首次進入預設關閉。
    const detailLoopStorageKey = "noirson-detail-loop";

    try {
        detailAudio.loop = window.sessionStorage.getItem(detailLoopStorageKey) === "true";
    } catch (error) {
        detailAudio.loop = false;
    }

    function updateDetailLoopControl() {
        detailLoopButton.setAttribute("aria-pressed", String(detailAudio.loop));
        detailLoopButton.setAttribute("aria-label", detailAudio.loop ? "關閉循環播放" : "開啟循環播放");
    }

    detailLoopButton.addEventListener("click", function () {
        detailAudio.loop = !detailAudio.loop;

        try {
            window.sessionStorage.setItem(detailLoopStorageKey, String(detailAudio.loop));
        } catch (error) {
            // 儲存空間不可用時仍保留目前頁面的 audio.loop 行為。
        }

        updateDetailLoopControl();
    });

    updateDetailLoopControl();

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

    // 建立共用 Visual Gallery，縮圖只負責切換左側主視覺。
    const detailGallery = document.querySelector(".detail-gallery");
    const galleryImages = Array.from({ length: 17 }, function (_, index) {
        return `images/${String(index).padStart(2, "0")}.png`;
    });

    detailGallery.innerHTML = galleryImages.map(function (imagePath, index) {
        const isActive = imagePath === mix.cover;

        return `
            <button class="detail-gallery-thumb${isActive ? " is-active" : ""}" type="button" data-image="${imagePath}" data-image-index="${index}" aria-label="顯示第 ${index + 1} 張 Gallery 圖片" aria-pressed="${isActive}">
                <img src="${imagePath}" alt="${mix.title} Gallery ${index + 1}" loading="lazy">
            </button>
        `;
    }).join("");

    const galleryThumbnails = Array.from(detailGallery.querySelectorAll(".detail-gallery-thumb"));
    let currentGalleryIndex = galleryImages.indexOf(mix.cover);

    function scrollGalleryThumbnailIntoView(thumbnail, behavior) {
        const galleryRect = detailGallery.getBoundingClientRect();
        const thumbnailRect = thumbnail.getBoundingClientRect();

        if (thumbnailRect.left >= galleryRect.left && thumbnailRect.right <= galleryRect.right) {
            return;
        }

        const targetLeft = detailGallery.scrollLeft
            + thumbnailRect.left
            - galleryRect.left
            - (detailGallery.clientWidth - thumbnail.offsetWidth) / 2;

        detailGallery.scrollTo({ left: targetLeft, behavior: behavior });
    }

    function selectGalleryImage(index, behavior = "smooth") {
        currentGalleryIndex = (index + galleryImages.length) % galleryImages.length;

        const imagePath = galleryImages[currentGalleryIndex];
        const activeThumbnail = galleryThumbnails[currentGalleryIndex];

        mainVisual.src = imagePath;
        mainVisual.alt = imagePath === mix.cover
            ? `${mix.title} 主視覺`
            : `${mix.title} Gallery ${currentGalleryIndex + 1}`;

        galleryThumbnails.forEach(function (button, thumbnailIndex) {
            const isActive = thumbnailIndex === currentGalleryIndex;

            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });

        scrollGalleryThumbnailIntoView(activeThumbnail, behavior);
    }

    function moveGallerySelection(direction) {
        const nextIndex = currentGalleryIndex === -1
            ? (direction > 0 ? 0 : galleryImages.length - 1)
            : currentGalleryIndex + direction;

        selectGalleryImage(nextIndex);
    }

    document.querySelector(".detail-gallery-previous").addEventListener("click", function () {
        moveGallerySelection(-1);
    });

    document.querySelector(".detail-gallery-next").addEventListener("click", function () {
        moveGallerySelection(1);
    });

    detailGallery.addEventListener("click", function (event) {
        // 事件代理讓動態建立的所有縮圖共用同一個 click listener。
        const thumbnail = event.target.closest(".detail-gallery-thumb");
        if (!thumbnail) return;

        selectGalleryImage(Number(thumbnail.dataset.imageIndex));
    });

    if (currentGalleryIndex !== -1) {
        requestAnimationFrame(function () {
            scrollGalleryThumbnailIntoView(galleryThumbnails[currentGalleryIndex], "auto");
        });
    }
}

const aboutBackgroundLayers = document.querySelectorAll(".about-background-layer");

// ========================================
// ABOUT：背景 Crossfade
// 依 00.png～16.png 固定順序切換，使用兩個 Layer 交替 Active 狀態。
// ========================================
if (aboutBackgroundLayers.length === 2) {
    // 排除 00、09、11、16，其餘 13 張圖片保留隨機輪播。
    const excludedImages = [0, 9, 11, 16];

    const aboutImages = Array.from({ length: 17 }, function (_, index) {
        return index;
    })
        .filter(index => !excludedImages.includes(index))
        .map(index => `images/${String(index).padStart(2, "0")}.png`);
    let aboutImageIndex = Math.floor(Math.random() * aboutImages.length);
    let activeLayerIndex = 0;

    aboutBackgroundLayers[0].style.backgroundImage = `url("${aboutImages[aboutImageIndex]}")`;

    window.setInterval(function () {
        // 隨機選取下一張背景圖片，避免連續播放相同圖片。
        let nextIndex;

        do {
            nextIndex = Math.floor(Math.random() * aboutImages.length);
        } while (nextIndex === aboutImageIndex);

        aboutImageIndex = nextIndex;

        const nextLayerIndex = activeLayerIndex === 0 ? 1 : 0;
        const nextLayer = aboutBackgroundLayers[nextLayerIndex];

        nextLayer.style.backgroundImage = `url("${aboutImages[aboutImageIndex]}")`;
        nextLayer.classList.add("is-active");
        aboutBackgroundLayers[activeLayerIndex].classList.remove("is-active");
        activeLayerIndex = nextLayerIndex;
    }, 3500);
}
