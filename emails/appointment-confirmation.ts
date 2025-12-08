// Email templates for appointment confirmations and updates
// Used by Resend to send professional emails to clients

export const appointmentEmail = (clientName: string, date: string, service: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h2 style="color: #1f2937; margin-top: 0;">Kasaglow Cleaning Services</h2>
      <p style="color: #374151; font-size: 16px;">Hello ${clientName},</p>
      <p style="color: #374151; font-size: 16px;">Your cleaning appointment has been scheduled:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Date & Time:</strong> ${date}</p>
        <p style="margin: 5px 0;"><strong>Service:</strong> ${service}</p>
      </div>
      <p style="color: #6b7280; font-size: 14px;">If you need to reschedule, simply reply to this email.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #9ca3af; font-size: 12px;">
        Thank you,<br/>
        Kasaglow Cleaning Services<br/>
        <a href="https://kasaglowclean.com" style="color: #3b82f6; text-decoration: none;">kasaglowclean.com</a>
      </p>
    </div>
  </div>
`;

export const appointmentUpdateEmail = (clientName: string, date: string, service: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h2 style="color: #1f2937; margin-top: 0;">Kasaglow Cleaning Services</h2>
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
        <p style="margin: 0; color: #92400e; font-weight: 600;">Appointment Update</p>
      </div>
      <p style="color: #374151; font-size: 16px;">Hello ${clientName},</p>
      <p style="color: #374151; font-size: 16px;">Your appointment has been updated:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>New Date & Time:</strong> ${date}</p>
        <p style="margin: 5px 0;"><strong>Service:</strong> ${service}</p>
      </div>
      <p style="color: #6b7280; font-size: 14px;">Please contact us if this time is not convenient.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #9ca3af; font-size: 12px;">
        Thank you,<br/>
        Kasaglow Cleaning Services<br/>
        <a href="https://kasaglowclean.com" style="color: #3b82f6; text-decoration: none;">kasaglowclean.com</a>
      </p>
    </div>
  </div>
`;
