"use strict";

const backToTop = document.querySelector('#backToTop');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');


// Back to Top Function
window.addEventListener('scroll', ()=> {
    backToTop.classList.toggle('show', window.scrollY > 400);
});

backToTop.addEventListener('click', ()=> {
    window.scrollTo({top: 0, behavior: 'smooth'});
})


//  Hamburger Menu
hamburger.addEventListener('click', function() {
    navLinks.classList.toggle('show');
});


// Popups (modals)
function closeModals() {
    document.querySelectorAll('.modal.active')
        .forEach(modal => modal.classList.remove('active'));
    document.body.classList.remove('modal-open');
}

function openModal(id) {
    const modal = document.getElementById(id);

    if (!modal) {
        console.warn('No popup with id:', id);
        return;
    }

    closeModals();
    navLinks.classList.remove('show');
    modal.classList.add('active');
    document.body.classList.add('modal-open');
}

document.addEventListener('click', e => {
    const opener = e.target.closest('[data-open]');
    if (opener) {
        e.preventDefault();
        openModal(opener.dataset.open);
        return;
    }

    if (e.target.closest('.close-btn, [data-close]')) {
        closeModals();
        return;
    }

    if (!e.target.closest('.modal')) {
        closeModals();
    }
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModals();
});


// Vertical scroll moves a row of cards sideways (pinned section)
function horizontalScroll(section, track, onClass) {
    if (!section || !track) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let maxShift = 0;
    let ticking = false;

    function measure() {
        if (reduceMotion.matches) {
            section.style.height = '';
            track.style.transform = '';
            if (onClass) section.classList.remove(onClass);
            return;
        }
        if (onClass) section.classList.add(onClass);
        maxShift = Math.max(0, track.scrollWidth - section.clientWidth);
        // runway = one screen + the sideways distance, so 1px scrolled = 1px moved
        section.style.height = (window.innerHeight + maxShift) + 'px';
        update();
    }

    function update() {
        ticking = false;
        if (reduceMotion.matches) return;
        const runway = section.offsetHeight - window.innerHeight;
        const progress = runway > 0
            ? Math.min(1, Math.max(0, -section.getBoundingClientRect().top / runway))
            : 0;
        track.style.transform = 'translate3d(' + (-progress * maxShift) + 'px, 0, 0)';
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    }, { passive: true });

    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    measure();
}

// Featured homes
horizontalScroll(
    document.querySelector('.featured-homes'),
    document.querySelector('.featured-homes .home-cards')
);

// Built around better renting (heading stays put, only the three cards move)
horizontalScroll(
    document.querySelector('.built-around-better'),
    document.querySelector('.built-around-better ul'),
    'hs-on'
);
