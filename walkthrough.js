"use strict";
/* Scroll walkthrough. The page scroll position drives which "room" photo is shown.
   Hold zone = photo stays, text shown, chips float. Travel zone = zoom into the doorway and cross-fade to the next room.
   Scrolling back up plays it in reverse because everything is computed from scroll position, not from time.
   On phones (768px and below) rooms that contain several items (.w-slides) also slide those items sideways, one per
   SLIDE of scrolling, so each screen stays short and the photo stays visible. */
(() => {
    const walk = document.getElementById('walk');
    if (!walk || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.documentElement.classList.add('walk-on');

    const H = 1;            // hold length of a room with nothing to slide (viewport heights)
    const T_DESK = 1.1, T_MOB = .9;   // travel length between rooms
    const SLIDE = .7;       // phones: scroll needed per sideways slide
    const stage = walk.querySelector('.walk-stage');
    const rooms = [...walk.querySelectorAll('.w-room')].map((el, i) => {
        const layer = walk.querySelector('.w-layer[data-i="' + i + '"]');
        const track = layer.querySelector('.w-slides');
        return {
            el, img: el.querySelector('img'), layer, track,
            k: track ? track.children.length : 0,
            dots: track ? [...layer.querySelectorAll('.w-dots')] : [],
            door: JSON.parse(el.dataset.door), pos: +el.dataset.pos, ar: 2.6
        };
    });
    const N = rooms.length;
    let vh = innerHeight, tgt = 0, cur = 0, raf = 0, mob = false, T = T_DESK, hold = [], start = [], total = 0;

    rooms.forEach(r => r.dots.forEach(d => { d.innerHTML = '<span></span>'.repeat(r.k); }));

    const sm = (a, b, x) => { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); };
    const posX = r => mob ? r.door[0] : r.pos;
    const progress = () => Math.max(0, -walk.getBoundingClientRect().top / vh);

    // Each room gets a hold length; start[i] is where room i begins on the scroll ruler.
    function layout() {
        mob = innerWidth < 769; T = mob ? T_MOB : T_DESK;
        let acc = 0;
        rooms.forEach((r, i) => { hold[i] = mob && r.k > 1 ? r.k * SLIDE : H; start[i] = acc; acc += hold[i] + T; });
        total = acc - T;
    }
    // Where the doorway sits on screen, given how the photo is cropped (object-fit: cover)
    function origin(r) {
        const vw = stage.clientWidth, sh = stage.clientHeight;
        let w, h; if (vw / sh > r.ar) { w = vw; h = vw / r.ar; } else { h = sh; w = sh * r.ar; }
        return [(vw - w) * posX(r) + r.door[0] * w, (sh - h) * 0.5 + r.door[1] * h];
    }
    const hdr = document.querySelector('.nav-bar');
    function size() {
        // The stage sticks just under the sticky header, so subtract the header's height from the stage.
        walk.style.setProperty('--hdr', (hdr ? hdr.offsetHeight : 0) + 'px');
        vh = stage.clientHeight || innerHeight;
        layout();
        walk.style.height = (total + 1) * vh + 'px';
        rooms.forEach(r => {
            r.img.style.objectPosition = posX(r) * 100 + '% 50%';
            const o = origin(r); r.el.style.transformOrigin = o[0] + 'px ' + o[1] + 'px';
            if (r.track && !mob) r.track.style.removeProperty('--x');
        });
        tgt = cur = progress(); draw();
    }
    function draw() {
        const s = cur;
        let i = N - 1; while (i > 0 && s < start[i]) i--;
        const r = s - start[i];
        let u = 0, holding = true;
        if (i < N - 1 && r > hold[i]) { holding = false; u = (r - hold[i]) / T; }
        const e = u * u * (3 - 2 * u);
        rooms.forEach((rm, k) => {
            let sc = 1, op = 0, po = 0;
            if (k === i) {
                if (holding) { sc = 1 + .04 * Math.min(1, r / hold[i]); op = 1; po = 1; }
                else { sc = 1.04 + 3.4 * Math.pow(e, 2.2); op = 1 - sm(.5, .95, u); po = 1 - sm(0, .3, u); }
            } else if (k === i + 1 && !holding) { sc = .78 + .22 * e; op = sm(.1, .7, u); po = sm(.75, 1, u); }
            rm.el.style.opacity = op;
            rm.el.style.transform = 'scale(' + sc + ')';
            rm.el.style.visibility = op > .01 ? 'visible' : 'hidden';
            rm.layer.style.opacity = po;
            rm.layer.style.transform = 'translateY(' + (1 - po) * 16 + 'px)';
            rm.layer.style.visibility = po > .01 ? 'visible' : 'hidden';
            rm.layer.classList.toggle('on', po > .6);
            if (mob && rm.track) {                       // sideways position, in slides (0 = first)
                let x = k < i ? rm.k - 1 : 0;
                if (k === i && holding) {
                    const v = r / SLIDE, idx = Math.min(Math.floor(v), rm.k - 1);
                    x = idx < rm.k - 1 ? idx + sm(.6, 1, v - idx) : rm.k - 1;   // rest 60%, glide 40%
                } else if (k === i) x = rm.k - 1;
                rm.track.style.setProperty('--x', x.toFixed(3));
                rm.dots.forEach(d => [...d.children].forEach((c, n) => c.classList.toggle('on', n === Math.round(x))));
            }
        });
    }
    function tick() {
        cur += (tgt - cur) * .14;
        if (Math.abs(tgt - cur) < .0008) cur = tgt;
        draw();
        raf = cur === tgt ? 0 : requestAnimationFrame(tick);
    }
    addEventListener('scroll', () => { tgt = progress(); if (!raf) raf = requestAnimationFrame(tick); }, { passive: true });
    addEventListener('resize', size);
    rooms.forEach(r => { const ok = () => { r.ar = r.img.naturalWidth / r.img.naturalHeight; size(); }; r.img.complete ? ok() : r.img.addEventListener('load', ok); });
    size();

    // Phones: swiping an item sideways nudges the page scroll by one slide (scroll still drives everything).
    rooms.forEach(r => {
        if (!r.track) return;
        const view = r.track.closest('.w-view'); let x0 = 0, y0 = 0;
        view.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
        view.addEventListener('touchend', e => {
            if (!mob) return;
            const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
            if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) scrollBy({ top: (dx < 0 ? 1 : -1) * SLIDE * vh, behavior: 'smooth' });
        }, { passive: true });
    });

    // Nav links for sections that now live inside rooms: scroll to that room instead of a hidden anchor.
    const roomFor = { howItWorks: 2, roommates: 3, tenantAdvocacy: 4 };
    function goRoom(i, smooth) {
        const top = walk.getBoundingClientRect().top + scrollY + (start[i] + .02) * vh;
        scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
    }
    document.addEventListener('click', e => {
        const a = e.target.closest('a[href^="#"]'); if (!a) return;
        const id = a.getAttribute('href').slice(1);
        if (id in roomFor) {
            e.preventDefault(); goRoom(roomFor[id], true);
            const menu = document.querySelector('.nav-links'); if (menu) menu.classList.remove('show');
        }
    });
    const hash = location.hash.slice(1); if (hash in roomFor) goRoom(roomFor[hash], false);
})();
