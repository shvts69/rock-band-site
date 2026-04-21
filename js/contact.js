(function () {
    'use strict';

    const form = document.getElementById('pubForm');
    if (!form) return;

    const BAND_EMAIL = form.getAttribute('data-contact-email') || '5051nyc@gmail.com';

    function buildGmailUrl(subject, body) {
        const params = new URLSearchParams({
            view: 'cm',
            fs: '1',
            to: BAND_EMAIL,
            su: subject,
            body: body
        });
        return 'https://mail.google.com/mail/?' + params.toString();
    }

    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text).then(() => true).catch(() => fallbackCopy(text));
        }
        return Promise.resolve(fallbackCopy(text));
    }

    function fallbackCopy(text) {
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(ta);
            return ok;
        } catch (e) {
            return false;
        }
    }

    function showToast(message, variant) {
        const t = document.createElement('div');
        t.className = 'pixel-toast' + (variant ? ' pixel-toast-' + variant : '');
        t.textContent = message;
        document.body.appendChild(t);
        requestAnimationFrame(() => t.classList.add('pixel-toast-show'));
        setTimeout(() => {
            t.classList.remove('pixel-toast-show');
            setTimeout(() => t.remove(), 400);
        }, 3800);
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = (form.elements.name && form.elements.name.value || '').trim();
        const email = (form.elements.email && form.elements.email.value || '').trim();
        const reason = (form.elements.reason && form.elements.reason.value || '').trim();
        const userSubject = (form.elements.subject && form.elements.subject.value || '').trim();
        const message = (form.elements.message && form.elements.message.value || '').trim();

        if (!name || !email || !message) {
            showToast('Fill in name, email and message first', 'err');
            return;
        }

        const reasonTag = reason ? '[' + reason.toUpperCase() + '] ' : '';
        const subject = reasonTag + (userSubject || '5051 — Contact from website');
        const body = [
            'Hey 5051,',
            '',
            message,
            '',
            '— ' + name,
            'Reply to: ' + email
        ].join('\n');

        const gmailUrl = buildGmailUrl(subject, body);
        const opened = window.open(gmailUrl, '_blank', 'noopener,noreferrer');

        copyToClipboard(BAND_EMAIL).then((copied) => {
            const msg = opened
                ? (copied ? 'Gmail opened · email copied to clipboard' : 'Gmail opened in new tab')
                : (copied ? 'Popup blocked · email copied: ' + BAND_EMAIL : 'Please email us: ' + BAND_EMAIL);
            showToast(msg, opened ? 'ok' : 'warn');
            if (window.Sound && typeof window.Sound.play === 'function') {
                try { window.Sound.play('liberty'); } catch (_) { /* non-fatal */ }
            }
        });

        if (opened) form.reset();
    });
})();
