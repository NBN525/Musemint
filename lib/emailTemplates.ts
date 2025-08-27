// lib/emailTemplates.ts
export function saleNotificationEmail(data: {
  productName: string;
  amount: string;
  currency: string;
  customerEmail: string;
  sessionId: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background: #fafafa;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://ai.rstglobal.ca/MuseMintLogo.png" alt="MuseMint" width="80" />
        <h2 style="color: #333; margin: 10px 0;">🎉 New MuseMint Sale</h2>
      </div>
      
      <p style="font-size: 16px; color: #333;">A new order has been completed:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Product</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${data.productName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Amount</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${data.amount} ${data.currency}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Customer</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${data.customerEmail}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Mode</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">LIVE</td>
        </tr>
      </table>
      
      <div style="text-align: center; margin-top: 20px;">
        <a href="https://dashboard.stripe.com/payments/${data.sessionId}" 
           style="background: #635bff; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 6px;">
          View in Stripe Dashboard
        </a>
      </div>
    </div>
  `;
}
