import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Send booking confirmation email to customer
 */
export const sendBookingConfirmation = async (booking) => {
  const { customer, service, bookingDate, startTime, address, confirmationCode } = booking;

  const formattedDate = new Date(bookingDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedTime = new Date(startTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: customer.email,
    subject: `Booking Confirmation - ${service.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; }
          .booking-details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4F46E5; }
          .confirmation-code { background-color: #4F46E5; color: white; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${process.env.BUSINESS_NAME || 'KasaGlowClean'}</h1>
            <p>Your Booking is Confirmed!</p>
          </div>

          <div class="content">
            <p>Dear ${customer.name},</p>
            <p>Thank you for choosing ${process.env.BUSINESS_NAME || 'KasaGlowClean'}! Your booking has been confirmed.</p>

            <div class="booking-details">
              <h3>Booking Details:</h3>
              <p><strong>Service:</strong> ${service.name}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${formattedTime}</p>
              <p><strong>Duration:</strong> ${service.durationMinutes} minutes</p>
              <p><strong>Address:</strong> ${address}</p>
              ${booking.apartmentUnit ? `<p><strong>Apt/Unit:</strong> ${booking.apartmentUnit}</p>` : ''}
              <p><strong>Price:</strong> $${service.price}</p>
            </div>

            <div class="confirmation-code">
              ${confirmationCode}
            </div>
            <p style="text-align: center; font-size: 12px;">Please keep this confirmation code for your records</p>

            ${booking.specialNotes ? `<p><strong>Special Instructions:</strong> ${booking.specialNotes}</p>` : ''}

            <p>If you need to cancel or reschedule, please contact us at least 24 hours in advance.</p>

            <p>We look forward to serving you!</p>
          </div>

          <div class="footer">
            <p>${process.env.BUSINESS_NAME || 'KasaGlowClean'}</p>
            <p>Email: ${process.env.BUSINESS_EMAIL}</p>
            <p>Phone: ${process.env.BUSINESS_PHONE}</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${customer.email}`);
    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
};

/**
 * Send booking notification email to admin
 */
export const sendAdminNotification = async (booking) => {
  const { customer, service, bookingDate, startTime, address } = booking;

  const formattedDate = new Date(bookingDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedTime = new Date(startTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.BUSINESS_EMAIL,
    subject: `New Booking - ${service.name}`,
    html: `
      <h2>New Booking Received</h2>
      <h3>Customer Details:</h3>
      <p><strong>Name:</strong> ${customer.name}</p>
      <p><strong>Email:</strong> ${customer.email}</p>
      <p><strong>Phone:</strong> ${customer.phone}</p>

      <h3>Booking Details:</h3>
      <p><strong>Service:</strong> ${service.name}</p>
      <p><strong>Date:</strong> ${formattedDate}</p>
      <p><strong>Time:</strong> ${formattedTime}</p>
      <p><strong>Address:</strong> ${address}</p>
      ${booking.apartmentUnit ? `<p><strong>Apt/Unit:</strong> ${booking.apartmentUnit}</p>` : ''}
      ${booking.specialNotes ? `<p><strong>Special Notes:</strong> ${booking.specialNotes}</p>` : ''}

      <p><strong>Confirmation Code:</strong> ${booking.confirmationCode}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Admin notification sent');
    return true;
  } catch (error) {
    console.error('Error sending admin notification:', error);
    throw error;
  }
};

/**
 * Send booking reminder email (to be called by a cron job)
 */
export const sendBookingReminder = async (booking) => {
  const { customer, service, bookingDate, startTime, address } = booking;

  const formattedDate = new Date(bookingDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedTime = new Date(startTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: customer.email,
    subject: `Reminder: Your ${service.name} appointment tomorrow`,
    html: `
      <h2>Booking Reminder</h2>
      <p>Dear ${customer.name},</p>
      <p>This is a friendly reminder about your upcoming appointment tomorrow.</p>

      <h3>Appointment Details:</h3>
      <p><strong>Service:</strong> ${service.name}</p>
      <p><strong>Date:</strong> ${formattedDate}</p>
      <p><strong>Time:</strong> ${formattedTime}</p>
      <p><strong>Address:</strong> ${address}</p>

      <p>If you need to cancel or reschedule, please contact us as soon as possible.</p>
      <p>We look forward to seeing you!</p>

      <p>Best regards,<br>${process.env.BUSINESS_NAME || 'KasaGlowClean'}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending reminder email:', error);
    throw error;
  }
};
