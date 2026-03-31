const intro        = document.getElementById('intro');
const introLetters = document.querySelectorAll('#introWord .intro-letter');
const heroWordmark = document.getElementById('heroWordmark');
const heroLetters  = heroWordmark.querySelectorAll('.hero-letter');
const navbar       = document.getElementById('navbar');

function spreadLetters() {
    const heroRects  = Array.from(heroLetters).map(el => el.getBoundingClientRect());
    const introRects = Array.from(introLetters).map(el => el.getBoundingClientRect());
    Array.from(introLetters).forEach((el, i) => {
        const dx = (heroRects[i].left + heroRects[i].width  / 2) - (introRects[i].left + introRects[i].width  / 2);
        const dy = (heroRects[i].top  + heroRects[i].height / 2) - (introRects[i].top  + introRects[i].height / 2);
        el.style.transition = `transform 0.85s cubic-bezier(0.76, 0, 0.24, 1)`;
        el.style.transform  = `translate(${dx}px, ${dy}px)`;
    });
    setTimeout(() => {
        heroWordmark.classList.add('visible');
        intro.classList.add('phase-out');
        navbar.classList.add('visible');
        setTimeout(() => { intro.style.visibility = 'hidden'; }, 1300);
    }, 900);
}

const delay = window.innerWidth <= 1024 ? 680 : 480;
if (window.scrollY < 50) {
    setTimeout(spreadLetters, delay);
} else {
    intro.style.visibility = 'hidden';
    heroWordmark.classList.add('visible');
    navbar.classList.add('visible');
}

let lastScrollY      = window.scrollY;
let scrollUpOrigin   = null;
const NAV_HEIGHT     = 20;

let maxScroll = document.documentElement.scrollHeight - window.innerHeight;
window.addEventListener('resize', () => {
    maxScroll = document.documentElement.scrollHeight - window.innerHeight;
});

function isInFooterZone() {
    // Footer zone = the spacer's top edge is on-screen or above.
    // We only read getBoundingClientRect once per scroll event here;
    // it's a single cheap read with no paired write so no layout thrash.
    const rect = footerSpacer.getBoundingClientRect();
    return rect.top <= window.innerHeight;
}

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    // Skip iOS elastic overscroll
    if (currentScrollY < 0 || currentScrollY > maxScroll) {
        lastScrollY = currentScrollY;
        return;
    }

    const onHero      = currentScrollY < window.innerHeight * 0.9;
    const inFooter = footerVisible;
    const scrollingUp = currentScrollY < lastScrollY;

    if (onHero) {
        navbar.classList.add('visible');
        navbar.classList.remove('scrolled-up');
        scrollUpOrigin = null;
    } else if (inFooter) {
        navbar.classList.remove('visible');
        navbar.classList.remove('scrolled-up');
    } else if (scrollingUp) {
        if (scrollUpOrigin === null) scrollUpOrigin = lastScrollY;
        const scrolledUpPx = scrollUpOrigin - currentScrollY;
        if (scrolledUpPx >= NAV_HEIGHT) {
            navbar.classList.add('visible');
            navbar.classList.add('scrolled-up');
        }
    } else {
        // Scrolling down — hide and reset origin
        navbar.classList.remove('visible');
        navbar.classList.remove('scrolled-up');
        scrollUpOrigin = null;
    }

    lastScrollY = currentScrollY;
}, { passive: true });

// Ticker
const inner = document.getElementById('tickerInner');
const original = inner.innerHTML;
inner.innerHTML = original.repeat(6);
const oneSetWidth = inner.scrollWidth / 6;
let pos = 0;
(function tick() {
    pos -= 0.6;
    if (pos <= -oneSetWidth) pos += oneSetWidth;
    inner.style.transform = `translateX(${pos}px)`;
    requestAnimationFrame(tick);
})();

const cards  = document.querySelectorAll('.behind-card');
const panels = document.querySelectorAll('.behind-panel');
const imgs   = [
    document.getElementById('bpImg1'),
    document.getElementById('bpImg2'),
    document.getElementById('bpImg3'),
];
const stack = document.getElementById('behindStack');

if (stack && cards.length) {
    let isMobile     = window.innerWidth <= 1024;
    let rafPending   = false;
    let latestScrollY = window.scrollY;

    window.addEventListener('resize', () => { isMobile = window.innerWidth <= 1024; });

    let lastProgress = [-1, -1, -1];

    function applyParallax() {
        if (isMobile) return;
        const wh = window.innerHeight;
        cards.forEach((card, i) => {
            const rect = card.getBoundingClientRect();
            const progress = Math.min(1, Math.max(0, -rect.top) / wh);
            if (Math.abs(progress - lastProgress[i]) < 0.01) return; // skip tiny updates
            lastProgress[i] = progress;
            const panel = panels[i];
            panel.style.transform = `scale(${1 - progress * 0.08})`;
            panel.style.opacity = String(1 - progress * 0.3);
            const img = imgs[i];
            if (img) img.style.transform = `translateY(${-(progress * 30)}px)`;
        });
    }

    window.addEventListener('scroll', () => {
        latestScrollY = window.scrollY;
        if (!rafPending) {
            rafPending = true;
            requestAnimationFrame(applyParallax);
        }
    }, { passive: true });

    applyParallax();
}

const footerSpacer = document.getElementById('footer-spacer');
let footerVisible = false;

const footerObserver = new IntersectionObserver((entries) => {
    footerVisible = entries[0].isIntersecting;
}, { threshold: 0 });

if (footerSpacer) footerObserver.observe(footerSpacer);