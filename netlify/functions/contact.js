const nodemailer = require('nodemailer');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ success: false, message: 'Method not allowed' }) };
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { body = {}; }

  const { comment, name, email, token } = body;

  if (!comment || !name || !email || !token) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Missing required fields.' }) };
  }

  // ── Validate Cloudflare Turnstile ──────────────────────────────────────────
  const tsRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token
    }).toString()
  });
  const tsData = await tsRes.json();
  if (!tsData.success) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Bot check failed. Please refresh and try again.' }) };
  }

  // ── Send email via cPanel SMTP ─────────────────────────────────────────────
  // Netlify env vars required:
  //   SMTP_HOST     e.g. mail.asiaoutdoors.vn
  //   SMTP_PORT     587
  //   SMTP_SECURE   false
  //   SMTP_USER     info@asiaoutdoors.vn
  //   SMTP_PASS     cPanel email password
  //   CONTACT_TO    info@asiaoutdoors.vn
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    await transporter.sendMail({
      from: `"Asia Outdoors Website" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_TO || 'info@asiaoutdoors.vn',
      replyTo: email,
      subject: `Contact Form – message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${comment}`,
      html: `<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
<hr>
<p>${comment.replace(/\n/g, '<br>')}</p>`
    });
  } catch (smtpErr) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'SMTP error: ' + smtpErr.message })
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ success: true })
  };
};
