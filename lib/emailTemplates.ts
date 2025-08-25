// /lib/emailTemplates.ts
export function welcomeEmailHTML(opts: {
  customerName?: string | null;
  productName?: string;
  downloadUrl: string;
  receiptUrl?: string | null;
}) {
  const name = (opts.customerName || "there").split(" ")[0];
  const product = opts.productName || "your purchase";
  const btn = (href: string, label: string) => `
    <a href="${href}" 
       style="display:inline-block;padding:12px 18px;border-radius:10px;
              background:#f59e0b;color:#0b0f12;text-decoration:none;
              font-weight:600">
      ${label}
    </a>`;

  return `
  <div style="background:#0b0f12;color:#eae7df;font-family:Arial,Helvetica,sans-serif;padding:32px">
    <div style="max-width:640px;margin:0 auto;background:#12161a;border-radius:16px;padding:28px;border:1px solid #22272b">
      <div style="text-align:center;margin-bottom:16px">
        <img src="https://ai.rstglobal.ca/MuseMintLogo.png" alt="MuseMint" height="64" style="display:inline-block;border-radius:8px"/>
      </div>

      <h1 style="margin:0 0 6px 0;font-size:22px;letter-spacing:.2px">Thanks, ${name}! 🎉</h1>
      <p style="margin:0 0 14px 0;line-height:1.6">
        Your order for <strong>${product}</strong> is confirmed.
      </p>

      <div style="margin:18px 0 12px 0;text-align:center">
        ${btn(opts.downloadUrl, "Download your planner")}
      </div>

      ${
        opts.receiptUrl
          ? `<p style="margin:10px 0 0 0;text-align:center">
               ${btn(opts.receiptUrl!, "View receipt")}
             </p>`
          : ""
      }

      <hr style="border:none;border-top:1px solid #2a3035;margin:24px 0"/>

      <p style="margin:0 0 10px 0;line-height:1.6">
        Need help or have a feature idea? Reply to this email—our team reads everything.
      </p>
      <p style="margin:0;color:#93a1ad;font-size:13px">
        © ${new Date().getFullYear()} MuseMint by RST Global • hello@rstglobal.ca
      </p>
    </div>
  </div>
  `;
}

export function welcomeEmailText(opts: {
  customerName?: string | null;
  productName?: string;
  downloadUrl: string;
  receiptUrl?: string | null;
}) {
  const name = (opts.customerName || "there").split(" ")[0];
  const product = opts.productName || "your purchase";
  return [
    `Thanks, ${name}!`,
    ``,
    `Your order for ${product} is confirmed.`,
    `Download: ${opts.downloadUrl}`,
    opts.receiptUrl ? `Receipt: ${opts.receiptUrl}` : "",
    ``,
    `Need help? Reply to this email.`,
    `— MuseMint by RST Global`,
  ].join("\n");
}
