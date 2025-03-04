import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

interface EmailPayload {
  to: string;
  type: 'confirmation' | 'cancellation';
  bookingDetails: {
    turfName: string;
    date: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
    bookingId: string;
  };
}

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'kicknclick2@gmail.com',
    pass: 'efzf lena ewdg xtsk'
  }
});

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

app.post('/send-email', async (req, res) => {
  try {
    const payload = req.body as EmailPayload;
    console.log('Received payload:', payload);

    // Validate payload
    if (!payload.to || !payload.type || !payload.bookingDetails) {
      throw new Error('Missing required fields in payload');
    }

    console.log('Generating email content...');
    const emailContent = payload.type === 'confirmation' 
      ? `
        <h2>Your Turf Booking is Confirmed!</h2>
        <p>Thank you for booking with us. Here are your booking details:</p>
        <div style="margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
          <p><strong>Booking ID:</strong> ${payload.bookingDetails.bookingId}</p>
          <p><strong>Turf:</strong> ${payload.bookingDetails.turfName}</p>
          <p><strong>Date:</strong> ${formatDate(payload.bookingDetails.date)}</p>
          <p><strong>Time:</strong> ${payload.bookingDetails.startTime} - ${payload.bookingDetails.endTime}</p>
          <p><strong>Total Amount:</strong> ${formatPrice(payload.bookingDetails.totalPrice)}</p>
        </div>
        <p>Please arrive 15 minutes before your scheduled time.</p>
        <p>If you need to cancel your booking, please do so at least 24 hours in advance.</p>
      `
      : `
        <h2>Your Turf Booking has been Cancelled</h2>
        <p>Your booking has been successfully cancelled. Here are the details of the cancelled booking:</p>
        <div style="margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
          <p><strong>Booking ID:</strong> ${payload.bookingDetails.bookingId}</p>
          <p><strong>Turf:</strong> ${payload.bookingDetails.turfName}</p>
          <p><strong>Date:</strong> ${formatDate(payload.bookingDetails.date)}</p>
          <p><strong>Time:</strong> ${payload.bookingDetails.startTime} - ${payload.bookingDetails.endTime}</p>
          <p><strong>Refund Amount:</strong> ${formatPrice(payload.bookingDetails.totalPrice)}</p>
        </div>
        <p>The refund will be processed within 5-7 business days.</p>
        <p>We hope to see you again soon!</p>
      `;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            h2 { color: #2563eb; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            ${emailContent}
            <div class="footer">
              <p>This is an automated message, please do not reply.</p>
              <p>© ${new Date().getFullYear()} Turf Booking. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log('Sending email...');
    // Send email
    const info = await transporter.sendMail({
      from: 'Turf Booking <kicknclick2@gmail.com>',
      to: payload.to,
      subject: payload.type === 'confirmation' 
        ? 'Booking Confirmation - Turf Booking'
        : 'Booking Cancellation - Turf Booking',
      html: htmlContent
    });

    console.log('Email sent successfully:', info.messageId);
    res.json({ 
      message: 'Email sent successfully',
      messageId: info.messageId 
    });

  } catch (error) {
    console.error('Error in email function:', error);
    res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Email server running on port ${PORT}`);
});
