export function getNotificationEmailTemplate(
  name: string,
  title: string,
  message: string,
  actionUrl?: string,
  actionLabel?: string
): string {
  const actionButton = actionUrl
    ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px auto 0;">
        <tr>
          <td style="border-radius:980px;background:#0066cc;">
            <a href="${actionUrl}" target="_blank" style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:980px;">
              ${actionLabel || "View Details"}
            </a>
          </td>
        </tr>
      </table>`
    : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f7;font-family:'DM Sans','Manrope';">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f5f5f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0066cc 0%,#0077ed 100%);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">ProcureSource</h1>
              <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.85);font-weight:400;">Industrial Procurement Platform</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 20px;">
              <h2 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#1d1d1f;">${title}</h2>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#424245;">
                Hi <strong>${name}</strong>, ${message}
              </p>
              ${actionButton}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #e8e8ed;text-align:center;">
              <p style="margin:0;font-size:12px;color:#86868b;">
                &copy; ${new Date().getFullYear()} ProcureSource. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
