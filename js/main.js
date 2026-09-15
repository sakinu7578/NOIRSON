const slides = document.querySelectorAll(".hero-slide");
const dotButtons = document.querySelectorAll(".carousel-dot");
const previousButton = document.querySelector(".carousel-arrow--previous");
const nextButton = document.querySelector(".carousel-arrow--next");

let currentIndex = 0;
let carouselInterval;

function showSlide(index) {
    // This calculation keeps the index within the first and last image.
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === currentIndex);
    });

    dotButtons.forEach(function (dotButton, dotIndex) {
        const isActive = dotIndex === currentIndex;

        dotButton.classList.toggle("is-active", isActive);
        dotButton.setAttribute("aria-pressed", isActive);
    });
}

function showNextSlide() {
    showSlide(currentIndex + 1);
}

function showPreviousSlide() {
    showSlide(currentIndex - 1);
}

function startAutoSlide() {
    carouselInterval = setInterval(showNextSlide, 6000);
}

function resetAutoSlide() {
    clearInterval(carouselInterval);
    startAutoSlide();
}

dotButtons.forEach(function (dotButton, dotIndex) {
    dotButton.addEventListener("click", function () {
        showSlide(dotIndex);
        resetAutoSlide();
    });
});

previousButton.addEventListener("click", function () {
    showPreviousSlide();
    resetAutoSlide();
});

nextButton.addEventListener("click", function () {
    showNextSlide();
    resetAutoSlide();
});

startAutoSlide();
