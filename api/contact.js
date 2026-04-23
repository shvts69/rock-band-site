// Vercel serverless function — forwards contact-form submissions
// from js/contact.js to a Telegram chat via the Bot API. Keeps the
// bot token server-side; the client only ever sees /api/contact.

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const token = process.env.TG_BOT_TOKEN;
    const chatId = process.env.TG_CHAT_ID;
    if (!token || !chatId) {
        console.error('Missing TG_BOT_TOKEN or TG_CHAT_ID env var');
        return res.status(500).json({ error: 'Server not configured' });
    }

    const body = req.body && typeof req.body === 'object'
        ? req.body
        : safeParse(req.body);

    const name = str(body.name);
    const email = str(body.email);
    const message = str(body.message);
    const reason = str(body.reason);
    const subject = str(body.subject);

    if (!name || !email || !message) {
        return res.status(400).json({
            error: 'Fill in name, email and message first'
        });
    }
    if (name.length > 200 || email.length > 200 || message.length > 4000) {
        return res.status(400).json({ error: 'Input too long' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email' });
    }

    const lines = [
        '🎸 <b>5051 — new booking request</b>',
        `👤 <b>From:</b> ${esc(name)}`,
        `📧 <b>Email:</b> ${esc(email)}`,
        reason ? `🎯 <b>Reason:</b> ${esc(reason).toUpperCase()}` : null,
        subject ? `📝 <b>Subject:</b> ${esc(subject)}` : null,
        '',
        esc(message)
    ].filter(Boolean).join('\n');

    try {
        const r = await fetch(
            `https://api.telegram.org/bot${token}/sendMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: lines,
                    parse_mode: 'HTML',
                    disable_web_page_preview: true
                })
            }
        );
        if (!r.ok) {
            const errBody = await r.text().catch(() => '');
            console.error('Telegram API error', r.status, errBody);
            return res.status(502).json({ error: 'Delivery failed' });
        }
        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Fetch to Telegram failed', err);
        return res.status(500).json({ error: 'Internal error' });
    }
}

function str(v) {
    return typeof v === 'string' ? v.trim() : '';
}

function esc(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function safeParse(s) {
    if (!s || typeof s !== 'string') return {};
    try { return JSON.parse(s); } catch (e) { return {}; }
}
