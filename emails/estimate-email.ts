// Professional email template for Free Estimate requests
// Designed to look like a formal service estimate/quote

export const estimateRequestEmail = (
  name: string,
  email: string,
  phone: string,
  service: string,
  message: string
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Estimate Request - KasaGlow Cleaning</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; max-width: 100%;">

          <!-- Header with Branding -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                KasaGlow Cleaning Services
              </h1>
              <p style="margin: 10px 0 0 0; color: #dbeafe; font-size: 14px; font-weight: 500;">
                Professional & Residential Cleaning Experts
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">

              <!-- Estimate Badge -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 6px;">
                    <p style="margin: 0; color: #1e40af; font-weight: 600; font-size: 16px;">
                      📋 New Free Estimate Request
                    </p>
                    <p style="margin: 5px 0 0 0; color: #3b82f6; font-size: 13px;">
                      Submitted on ${new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Customer Information -->
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">
                Customer Information
              </h2>

              <table width="100%" cellpadding="8" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td width="140" style="padding: 12px 0; color: #6b7280; font-size: 14px; font-weight: 600;">
                    Full Name:
                  </td>
                  <td style="padding: 12px 0; color: #1f2937; font-size: 15px; font-weight: 500;">
                    ${name}
                  </td>
                </tr>
                <tr style="border-top: 1px solid #f3f4f6;">
                  <td width="140" style="padding: 12px 0; color: #6b7280; font-size: 14px; font-weight: 600;">
                    Email Address:
                  </td>
                  <td style="padding: 12px 0;">
                    <a href="mailto:${email}" style="color: #3b82f6; font-size: 15px; text-decoration: none; font-weight: 500;">
                      ${email}
                    </a>
                  </td>
                </tr>
                <tr style="border-top: 1px solid #f3f4f6;">
                  <td width="140" style="padding: 12px 0; color: #6b7280; font-size: 14px; font-weight: 600;">
                    Phone Number:
                  </td>
                  <td style="padding: 12px 0;">
                    <a href="tel:${phone || ''}" style="color: #3b82f6; font-size: 15px; text-decoration: none; font-weight: 500;">
                      ${phone || '<span style="color: #9ca3af; font-style: italic;">Not provided</span>'}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Service Details -->
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">
                Requested Service
              </h2>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      Service Type
                    </p>
                    <p style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                      ${service || '<span style="color: #9ca3af; font-style: italic;">Not specified</span>'}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Additional Details -->
              ${message ? `
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">
                Additional Details
              </h2>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">
${message}
                    </p>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Next Steps -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                <tr>
                  <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 6px;">
                    <p style="margin: 0; color: #92400e; font-weight: 600; font-size: 14px;">
                      ⚡ Action Required
                    </p>
                    <p style="margin: 8px 0 0 0; color: #78350f; font-size: 14px; line-height: 1.5;">
                      Please contact this customer within 24 hours to provide a personalized estimate and schedule a consultation.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; border-top: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                      <strong style="color: #1f2937;">KasaGlow Cleaning Services</strong><br>
                      Professional & Residential Cleaning<br>
                      <a href="https://kasaglowclean.com" style="color: #3b82f6; text-decoration: none;">kasaglowclean.com</a>
                    </p>
                    <p style="margin: 15px 0 0 0; color: #9ca3af; font-size: 11px;">
                      This is an automated notification from your website contact form.<br>
                      Sent to: info@kasaglowclean.com
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
