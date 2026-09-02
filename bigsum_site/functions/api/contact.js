const TYPE_LABELS = {
  business: "配送サービス",
  recruit: "採用について",
  box: "Rakubo",
  other: "その他",
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const clean = (value, maxLength) => String(value ?? "").trim().slice(0, maxLength);
const emailIsValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;

function originIsAllowed(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const { hostname } = new URL(origin);
    return (
      hostname === "bigsumconnect.jp" ||
      hostname === "www.bigsumconnect.jp" ||
      hostname === "bigs-4hl.pages.dev" ||
      hostname.endsWith(".bigs-4hl.pages.dev") ||
      hostname === "127.0.0.1" ||
      hostname === "localhost"
    );
  } catch {
    return false;
  }
}

function detailsTable(rows) {
  return rows.map(([label, value]) => `
    <tr>
      <th style="padding:12px 16px;border-bottom:1px solid #e8e8e8;text-align:left;vertical-align:top;width:132px;color:#666;font-size:13px;">${escapeHtml(label)}</th>
      <td style="padding:12px 16px;border-bottom:1px solid #e8e8e8;color:#111;font-size:14px;line-height:1.8;white-space:pre-wrap;">${escapeHtml(value)}</td>
    </tr>`).join("");
}

function emailShell(content) {
  return `<!doctype html>
  <html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
  <body style="margin:0;padding:0;background:#f4f4f2;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue','Yu Gothic',YuGothic,Meiryo,sans-serif;color:#111;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f2;padding:28px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border-collapse:collapse;">
          <tr><td style="padding:26px 32px;background:#111;color:#fff;font-size:24px;font-weight:800;letter-spacing:.04em;">BigSum</td></tr>
          <tr><td style="padding:36px 32px;">${content}</td></tr>
          <tr><td style="padding:22px 32px;background:#f8f8f6;color:#777;font-size:12px;line-height:1.8;">合同会社Big Sum<br><a href="https://bigsumconnect.jp" style="color:#555;">bigsumconnect.jp</a></td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;
}

export async function onRequestPost({ request, env }) {
  if (!originIsAllowed(request)) return json({ ok: false, message: "送信元を確認できませんでした。" }, 403);
  if (!env.RESEND_API_KEY) return json({ ok: false, message: "メール送信設定が完了していません。" }, 503);
  if (Number(request.headers.get("content-length") || 0) > 20_000) {
    return json({ ok: false, message: "入力内容が長すぎます。" }, 413);
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, message: "入力内容を読み取れませんでした。" }, 400);
  }

  // Hidden honeypot field. Real visitors never fill it in.
  if (clean(data.company, 100)) return json({ ok: true });

  const kind = data.kind === "purchase" ? "purchase" : "general";
  const name = clean(data.name, 100);
  const email = clean(data.email, 254).toLowerCase();
  const message = clean(data.message, 4000);
  const type = TYPE_LABELS[data.type] || "お問い合わせ";
  const quantity = Math.max(1, Math.min(9999, Number.parseInt(data.quantity, 10) || 1));

  if (!name || !emailIsValid(email) || (kind === "general" && !message)) {
    return json({ ok: false, message: "必須項目をご確認ください。" }, 400);
  }

  const toEmail = env.CONTACT_TO_EMAIL || "bigsum.h-umeda@outlook.jp";
  const fromEmail = env.CONTACT_FROM_EMAIL || "BigSum Web <noreply@mail.bigsumconnect.jp>";
  const inquiryTitle = kind === "purchase" ? "Rakubo購入お問い合わせ" : type;
  const rows = kind === "purchase"
    ? [["お名前", name], ["メールアドレス", email], ["購入希望数", `${quantity}点`], ["ご要望・ご質問", message || "（記入なし）"]]
    : [["お問い合わせ種別", type], ["お名前", name], ["メールアドレス", email], ["お問い合わせ内容", message]];

  const adminHtml = emailShell(`
    <p style="margin:0 0 8px;color:#777;font-size:12px;font-weight:700;letter-spacing:.12em;">WEB INQUIRY</p>
    <h1 style="margin:0 0 24px;font-size:24px;line-height:1.5;">${escapeHtml(inquiryTitle)}を受け付けました</h1>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:2px solid #111;border-collapse:collapse;">${detailsTable(rows)}</table>
    <p style="margin:24px 0 0;color:#666;font-size:13px;line-height:1.8;">このメールに返信すると、${escapeHtml(name)}様（${escapeHtml(email)}）宛てに返信できます。</p>`);

  const customerHtml = emailShell(`
    <p style="margin:0 0 8px;color:#777;font-size:12px;font-weight:700;letter-spacing:.12em;">THANK YOU</p>
    <h1 style="margin:0 0 22px;font-size:24px;line-height:1.5;white-space:nowrap;">お問い合わせありがとうございます。</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:2;">${escapeHtml(name)} 様</p>
    <p style="margin:0 0 26px;font-size:15px;line-height:2;">合同会社Big Sumへお問い合わせいただき、誠にありがとうございます。<br>以下の内容で受け付けました。内容を確認のうえ、担当者よりご連絡いたします。</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:2px solid #111;border-collapse:collapse;">${detailsTable(rows)}</table>
    <p style="margin:26px 0 0;color:#777;font-size:12px;line-height:1.8;">このメールはお問い合わせフォームから自動送信されています。お心当たりがない場合は、お手数ですがこのメールを破棄してください。</p>`);

  const plainRows = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  const response = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
      "idempotency-key": crypto.randomUUID(),
    },
    body: JSON.stringify([
      {
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject: `【BigSum Web】${inquiryTitle}｜${name}様`,
        html: adminHtml,
        text: `${inquiryTitle}を受け付けました。\n\n${plainRows}`,
      },
      {
        from: fromEmail,
        to: [email],
        reply_to: toEmail,
        subject: "【BigSum】お問い合わせありがとうございます",
        html: customerHtml,
        text: `${name} 様\n\n合同会社Big Sumへお問い合わせいただき、誠にありがとうございます。\n以下の内容で受け付けました。内容を確認のうえ、担当者よりご連絡いたします。\n\n${plainRows}`,
      },
    ]),
  });

  if (!response.ok) {
    return json({ ok: false, message: "送信できませんでした。時間をおいて再度お試しください。" }, 502);
  }
  return json({ ok: true, message: "お問い合わせを受け付けました。確認メールをお送りしました。" });
}
