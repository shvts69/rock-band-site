// Live Shows carousel — fetches upcoming events from Bandsintown public API.
// Arrow buttons scroll the gallery horizontally; empty/error states shown inline.
(function () {
    'use strict';

    // Bandsintown artist: https://www.bandsintown.com/a/15525831-5051
    const ARTIST = '5051';
    const APP_ID = 'js_test';
    const ENDPOINT = 'https://rest.bandsintown.com/artists/'
        + encodeURIComponent(ARTIST)
        + '/events?app_id=' + encodeURIComponent(APP_ID);

    const gallery = document.getElementById('showsGallery');
    if (!gallery) return;
    const prevBtn = document.querySelector('.shows-prev');
    const nextBtn = document.querySelector('.shows-next');

    const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

    function formatDate(iso) {
        const d = new Date(iso);
        if (isNaN(d.getTime())) return '';
        const day = String(d.getDate()).padStart(2, '0');
        return MONTHS[d.getMonth()] + ' ' + day + ' ' + d.getFullYear();
    }

    function escape(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function renderShows(events) {
        const frag = document.createDocumentFragment();
        events.forEach(ev => {
            const venue = ev.venue || {};
            const city = [venue.city, venue.region, venue.country].filter(Boolean).join(', ');
            const name = venue.name || 'TBA';
            const date = formatDate(ev.datetime || ev.starts_at);
            const url = ev.url || ev.offers && ev.offers[0] && ev.offers[0].url || '';

            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.innerHTML =
                '<div class="gallery-frame">' +
                    '<div class="gallery-placeholder">' +
                        '<div class="show-date">' + escape(date) + '</div>' +
                        '<div class="show-venue">' + escape(name) + '</div>' +
                        '<div class="show-city">' + escape(city) + '</div>' +
                        (url
                            ? '<a class="show-tickets" href="' + escape(url) + '" target="_blank" rel="noopener">GET TICKETS</a>'
                            : '<span class="show-tickets" style="opacity:0.5;cursor:default;">SOON</span>'
                        ) +
                    '</div>' +
                '</div>';
            frag.appendChild(item);
        });
        gallery.innerHTML = '';
        gallery.appendChild(frag);
        updateArrows();
    }

    function renderMessage(cls, text) {
        gallery.innerHTML = '<div class="' + cls + '">' + escape(text) + '</div>';
        updateArrows();
    }

    function updateArrows() {
        if (!prevBtn || !nextBtn) return;
        const canScroll = gallery.scrollWidth > gallery.clientWidth + 2;
        prevBtn.disabled = !canScroll || gallery.scrollLeft <= 0;
        nextBtn.disabled = !canScroll || gallery.scrollLeft >= gallery.scrollWidth - gallery.clientWidth - 2;
    }

    function scrollBy(dir) {
        // Page by full visible width (3 frames desktop, 1 frame mobile)
        const step = Math.max(240, gallery.clientWidth);
        gallery.scrollBy({ left: dir * step, behavior: 'smooth' });
    }

    if (prevBtn) prevBtn.addEventListener('click', () => scrollBy(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => scrollBy(1));
    gallery.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);

    fetch(ENDPOINT, { headers: { 'Accept': 'application/json' } })
        .then(r => {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        })
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                renderMessage('shows-empty', 'NO UPCOMING SHOWS — STAY TUNED');
                return;
            }
            renderShows(data);
        })
        .catch(() => {
            renderMessage('shows-error', 'COULD NOT LOAD SHOWS');
        });
})();
