// Inline 8-bit audio player for 5051 — plays 30s previews of the
// same tracks available on Spotify / Apple Music / YT Music. Previews
// come from the iTunes CDN (no auth required, CORS-friendly).
(function () {
    'use strict';

    const player   = document.getElementById('trackPlayer');
    const audio    = document.getElementById('tpAudio');
    const titleEl  = document.getElementById('tpTitle');
    const curEl    = document.getElementById('tpCurrent');
    const durEl    = document.getElementById('tpDuration');
    const slider   = document.getElementById('tpProgress');
    const prevBtn  = document.getElementById('tpPrev');
    const playBtn  = document.getElementById('tpPlay');
    const nextBtn  = document.getElementById('tpNext');
    if (!player || !audio || !playBtn) return;

    const PLAY_GLYPH  = '▶';       // ▶
    const PAUSE_GLYPH = '❙❙'; // ❙❙

    const TRACKS = [
        { name: 'НОЧНАЯ ГАРЬ',
          src:  'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/b5/56/9f/b5569f05-829a-6625-84f8-c44384f39542/mzaf_17000836507918961663.plus.aac.p.m4a' },
        { name: 'БЕЛАРУС',
          src:  'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/e1/bd/8c/e1bd8c08-c046-3fd4-12a1-6baacd308a04/mzaf_11876947658036626145.plus.aac.p.m4a' },
        { name: 'СВЕТ КУЛЬТУРЫ',
          src:  'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/71/c1/d8/71c1d8e0-ddcd-e623-2903-5abe1b2f1c9b/mzaf_2006998124958573238.plus.aac.p.m4a' },
        { name: 'ЮЖНЫЙ БРУКЛИН',
          src:  'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/22/e3/67/22e3676e-d2e3-dccc-e3e2-f2bfd34055f5/mzaf_323384968578536741.plus.aac.p.m4a' },
        { name: 'КАЛИФОРНИЯ',
          src:  'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/7b/30/9d/7b309d47-3ee1-39f4-2fcc-7eb35027d9a7/mzaf_9311306683602299903.plus.aac.p.m4a' },
        { name: 'ТЕМНЫЕ ВРЕМЕНА',
          src:  'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/2e/91/d6/2e91d62b-3b04-e86e-3511-a3fd5f8c773b/mzaf_1042762245227354296.plus.aac.p.m4a' },
        { name: 'МОНСТАР',
          src:  'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/ff/47/c8/ff47c877-af54-94e3-c2b0-bf71024ac5e4/mzaf_10753608983608291350.plus.aac.p.m4a' },
        { name: 'НОНКОНФОРМИСТЫ',
          src:  'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/f0/2d/77/f02d7730-5afd-ac02-787c-20a00d2df218/mzaf_16006947687516964654.plus.aac.p.m4a' },
        { name: 'ТВОЙ КОТ',
          src:  'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/dc/2a/f5/dc2af542-b5bd-aac2-2649-fed87bebdd39/mzaf_3066926951565317609.plus.aac.p.m4a' },
        { name: 'ФИЛАДЕЛЬФИЙСКИЙ СТИЛЬ',
          src:  'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/fe/c8/08/fec8082d-109c-61f1-6f33-059444606db5/mzaf_9143961715826736586.plus.aac.p.m4a' },
        { name: 'КЭУК И НИК',
          src:  'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/33/48/b8/3348b873-efef-160e-43b6-7235c39bb88c/mzaf_16214350559384720006.plus.aac.p.m4a' },
        { name: 'ТУРИСТИЧЕСКАЯ',
          src:  'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/66/06/32/6606324f-b48c-28a6-03b6-00a897510653/mzaf_10301107410135846187.plus.aac.p.m4a' }
    ];

    let idx = 0;
    let seeking = false;

    function fmt(s) {
        if (!isFinite(s) || s < 0) return '0:00';
        const m = Math.floor(s / 60);
        const r = Math.floor(s % 60);
        return m + ':' + (r < 10 ? '0' : '') + r;
    }

    function setFill(pct) {
        slider.style.setProperty('--tp-fill', pct + '%');
    }

    function load(i, autoplay) {
        idx = ((i % TRACKS.length) + TRACKS.length) % TRACKS.length;
        audio.src = TRACKS[idx].src;
        titleEl.textContent = TRACKS[idx].name;
        slider.value = 0;
        setFill(0);
        curEl.textContent = '0:00';
        durEl.textContent = '0:30';
        if (autoplay) {
            const p = audio.play();
            if (p && typeof p.catch === 'function') p.catch(function () {});
        }
    }

    function togglePlay() {
        if (!audio.src) { load(0, true); return; }
        if (audio.paused) {
            const p = audio.play();
            if (p && typeof p.catch === 'function') p.catch(function () {});
        } else {
            audio.pause();
        }
    }

    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', function () {
        const wasPlaying = !audio.paused || audio.currentTime > 0;
        load(idx - 1, wasPlaying);
    });
    nextBtn.addEventListener('click', function () {
        const wasPlaying = !audio.paused || audio.currentTime > 0;
        load(idx + 1, wasPlaying);
    });

    audio.addEventListener('play', function () {
        player.classList.add('playing');
        playBtn.innerHTML = PAUSE_GLYPH;
        playBtn.setAttribute('aria-label', 'Pause');
    });
    audio.addEventListener('pause', function () {
        player.classList.remove('playing');
        playBtn.innerHTML = PLAY_GLYPH;
        playBtn.setAttribute('aria-label', 'Play');
    });
    audio.addEventListener('ended', function () {
        load(idx + 1, true);
    });
    audio.addEventListener('loadedmetadata', function () {
        durEl.textContent = fmt(audio.duration);
    });
    audio.addEventListener('timeupdate', function () {
        if (seeking || !audio.duration) return;
        const pct = (audio.currentTime / audio.duration) * 100;
        slider.value = Math.round(pct * 10);
        setFill(pct);
        curEl.textContent = fmt(audio.currentTime);
    });
    audio.addEventListener('error', function () {
        titleEl.textContent = 'TRACK UNAVAILABLE';
    });

    slider.addEventListener('input', function () {
        seeking = true;
        setFill(slider.value / 10);
        if (audio.duration) {
            curEl.textContent = fmt((slider.value / 1000) * audio.duration);
        }
    });
    slider.addEventListener('change', function () {
        if (audio.duration) {
            audio.currentTime = (slider.value / 1000) * audio.duration;
        }
        seeking = false;
    });

    // Prime the display with the first track name (no autoplay).
    titleEl.textContent = TRACKS[0].name;
    setFill(0);
})();
