(function () {
    'use strict';

    const form = document.getElementById('pubForm');
    if (!form) return;

    const BAND_EMAIL = form.getAttribute('data-contact-email') || '5051nyc@gmail.com';
    // Formsubmit AJAX endpoint — no signup. First submission triggers a one-time
    // email confirmation to BAND_EMAIL. Swap for the opaque hash from the
    // formsubmit dashboard later to avoid exposing the raw address here.
    const ENDPOINT = form.getAttribute('data-form-endpoint') ||
        ('https://formsubmit.co/ajax/' + encodeURIComponent(BAND_EMAIL));

    const submitBtn = form.querySelector('.pub-submit');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : '';

    function setLoading(on) {
        if (!submitBtn) return;
        submitBtn.disabled = on;
        submitBtn.innerHTML = on ? '♫ SENDING... ♫' : originalBtnText;
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

    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
        }
        return Promise.resolve(false);
    }

    form.addEventListener('submit', async function (e) {
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

        const payload = {
            name: name,
            email: email,
            _subject: subject,
            _replyto: email,
            _template: 'table',
            _captcha: 'false',
            reason: reason || '(not selected)',
            message: message
        };

        setLoading(true);

        try {
            const res = await fetch(ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json().catch(() => ({}));
            if (data && data.success === 'false') throw new Error(data.message || 'send failed');

            showToast('Message sent! We’ll get back to you ♫', 'ok');
            form.reset();
            if (window.Sound && typeof window.Sound.play === 'function') {
                try { window.Sound.play('liberty'); } catch (_) { /* non-fatal */ }
            }
        } catch (err) {
            const copied = await copyToClipboard(BAND_EMAIL);
            showToast(copied
                ? 'Send failed · email copied: ' + BAND_EMAIL
                : 'Send failed · email us: ' + BAND_EMAIL, 'err');
        } finally {
            setLoading(false);
        }
    });
})();
