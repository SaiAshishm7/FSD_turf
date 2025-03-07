const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Create email transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'kicknclick2@gmail.com',
    pass: 'jpge urly iozc ctqd'
  }
});

// Verify the connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log("Error with email configuration:", error);
  } else {
    console.log("Server is ready to send emails");
  }
});

app.post('/send-email', async (req, res) => {
  const { to, type, bookingDetails } = req.body;

  try {
    let subject, html;

    if (type === 'confirmation') {
      subject = 'Your Booking is Confirmed - kickNclick';
      html = `
        <div style="max-width: 600px; margin: 0 auto; font-family: 'Arial', 'Helvetica Neue', sans-serif; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: #059669; padding: 25px 20px; text-align: left; position: relative;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">BOOKING CONFIRMATION</h1>
            <div style="position: absolute; top: 20px; right: 20px; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 20px; font-weight: 800;">KN</span>
            </div>
          </div>
          
          <!-- Content -->
          <div style="background: #ffffff; padding: 30px 25px; color: #333333;">
            <p style="margin-top: 0;">Hello,</p>
            <p>Great news! Your turf booking has been confirmed and is ready to go. We look forward to having you play with us.</p>
            
            <!-- Status Badge -->
            <div style="display: inline-block; padding: 8px 16px; background: #059669; color: white; border-radius: 30px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 24px;">
              Confirmed
            </div>
            
            <!-- Booking Info -->
            <div style="display: flex; margin: 25px 0; background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <div style="flex: 1; text-align: center; padding: 15px; background: #ffffff; border-radius: 8px; margin-right: 10px; border: 1px solid #e5e7eb;">
                <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: 600;">DATE</div>
                <div style="font-size: 20px; font-weight: 700; color: #111827;">${bookingDetails.date.split('-')[2]}</div>
              </div>
              <div style="flex: 1; text-align: center; padding: 15px; background: #ffffff; border-radius: 8px; margin-right: 10px; border: 1px solid #e5e7eb;">
                <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: 600;">START TIME</div>
                <div style="font-size: 20px; font-weight: 700; color: #111827;">${bookingDetails.startTime}</div>
              </div>
              <div style="flex: 1; text-align: center; padding: 15px; background: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb;">
                <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: 600;">END TIME</div>
                <div style="font-size: 20px; font-weight: 700; color: #111827;">${bookingDetails.endTime}</div>
              </div>
            </div>

            <!-- Details Section -->
            <div style="margin: 25px 0; background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <div style="color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; padding-left: 10px; border-left: 3px solid #059669;">
                BOOKING DETAILS
              </div>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; color: #6b7280;">Booking ID</td>
                  <td style="padding: 12px 0; color: #111827; text-align: right; font-weight: 600;">#${bookingDetails.bookingId.slice(0, 8).toUpperCase()}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; color: #6b7280;">Turf Name</td>
                  <td style="padding: 12px 0; color: #111827; text-align: right; font-weight: 600;">${bookingDetails.turfName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; color: #6b7280;">Date</td>
                  <td style="padding: 12px 0; color: #111827; text-align: right; font-weight: 600;">${bookingDetails.date}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #6b7280;">Duration</td>
                  <td style="padding: 12px 0; color: #111827; text-align: right; font-weight: 600;">${bookingDetails.startTime} - ${bookingDetails.endTime}</td>
                </tr>
              </table>
            </div>

            <!-- Price Card -->
            <div style="background: #059669; padding: 25px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <div style="color: rgba(255, 255, 255, 0.9); font-size: 14px; margin-bottom: 10px;">TOTAL AMOUNT</div>
              <div style="color: white; font-size: 32px; font-weight: 700;">₹${bookingDetails.totalPrice}</div>
            </div>

            <!-- Important Info -->
            <div style="margin: 25px 0; background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <div style="color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; padding-left: 10px; border-left: 3px solid #059669;">
                IMPORTANT INFORMATION
              </div>
              <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
                <li style="margin-bottom: 10px;">Please arrive 15 minutes before your scheduled slot</li>
                <li style="margin-bottom: 10px;">Bring your own sports equipment and water</li>
                <li style="margin-bottom: 10px;">Present your Booking ID (#${bookingDetails.bookingId.slice(0, 8).toUpperCase()}) for verification</li>
                <li style="margin-bottom: 10px;">Wear appropriate sports footwear for the turf surface</li>
              </ul>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #4b5563; margin-bottom: 20px;">Need to manage your booking?</p>
              <a href="https://kicknclick.com/bookings" style="display: inline-block; padding: 12px 24px; background: #059669; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Manage Bookings</a>
            </div>

            <!-- Footer -->
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280;">
              <p style="margin-bottom: 15px;">Have questions? Our team is here to help</p>
              <a href="mailto:support@kicknclick.com" style="color: #059669; text-decoration: none; font-weight: 600;">support@kicknclick.com</a>
              <p style="margin-top: 20px; font-size: 12px;">© ${new Date().getFullYear()} kickNclick. All rights reserved.</p>
            </div>
          </div>
        </div>
      `;
    } else if (type === 'cancellation') {
      subject = 'Your Booking Has Been Cancelled - kickNclick';
      html = `
        <div style="max-width: 600px; margin: 0 auto; font-family: 'Arial', 'Helvetica Neue', sans-serif; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: #dc2626; padding: 25px 20px; text-align: left; position: relative;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">BOOKING CANCELLED</h1>
            <div style="position: absolute; top: 20px; right: 20px; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 20px; font-weight: 800;">KN</span>
            </div>
          </div>
          
          <!-- Content -->
          <div style="background: #ffffff; padding: 30px 25px; color: #333333;">
            <p style="margin-top: 0;">Hello,</p>
            <p>Your turf booking has been cancelled successfully. If you processed a refund, please see the details below.</p>
            
            <!-- Status Badge -->
            <div style="display: inline-block; padding: 8px 16px; background: #dc2626; color: white; border-radius: 30px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 24px;">
              Cancelled
            </div>
            
            <!-- Booking Info -->
            <div style="display: flex; margin: 25px 0; background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <div style="flex: 1; text-align: center; padding: 15px; background: #ffffff; border-radius: 8px; margin-right: 10px; border: 1px solid #e5e7eb;">
                <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: 600;">DATE</div>
                <div style="font-size: 20px; font-weight: 700; color: #111827;">${bookingDetails.date.split('-')[2]}</div>
              </div>
              <div style="flex: 1; text-align: center; padding: 15px; background: #ffffff; border-radius: 8px; margin-right: 10px; border: 1px solid #e5e7eb;">
                <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: 600;">START TIME</div>
                <div style="font-size: 20px; font-weight: 700; color: #111827;">${bookingDetails.startTime}</div>
              </div>
              <div style="flex: 1; text-align: center; padding: 15px; background: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb;">
                <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: 600;">END TIME</div>
                <div style="font-size: 20px; font-weight: 700; color: #111827;">${bookingDetails.endTime}</div>
              </div>
            </div>

            <!-- Details Section -->
            <div style="margin: 25px 0; background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <div style="color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; padding-left: 10px; border-left: 3px solid #dc2626;">
                CANCELLED BOOKING
              </div>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; color: #6b7280;">Booking ID</td>
                  <td style="padding: 12px 0; color: #111827; text-align: right; font-weight: 600;">#${bookingDetails.bookingId.slice(0, 8).toUpperCase()}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; color: #6b7280;">Turf Name</td>
                  <td style="padding: 12px 0; color: #111827; text-align: right; font-weight: 600;">${bookingDetails.turfName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; color: #6b7280;">Date</td>
                  <td style="padding: 12px 0; color: #111827; text-align: right; font-weight: 600;">${bookingDetails.date}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #6b7280;">Cancelled On</td>
                  <td style="padding: 12px 0; color: #111827; text-align: right; font-weight: 600;">${new Date().toISOString().split('T')[0]}</td>
                </tr>
              </table>
            </div>

            <!-- Price Card -->
            <div style="background: #dc2626; padding: 25px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <div style="color: rgba(255, 255, 255, 0.9); font-size: 14px; margin-bottom: 10px;">REFUND AMOUNT</div>
              <div style="color: white; font-size: 32px; font-weight: 700;">₹${bookingDetails.totalPrice}</div>
            </div>

            <!-- Refund Info -->
            <div style="margin: 25px 0; background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <div style="color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; padding-left: 10px; border-left: 3px solid #dc2626;">
                REFUND INFORMATION
              </div>
              <p style="color: #4b5563; margin-top: 0;">Your refund has been processed according to our cancellation policy. The amount will be credited back to your original payment method within 5-7 business days.</p>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #4b5563; margin-bottom: 20px;">Ready to book another turf?</p>
              <a href="https://kicknclick.com" style="display: inline-block; padding: 12px 24px; background: #059669; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Browse Available Turfs</a>
            </div>

            <!-- Footer -->
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280;">
              <p style="margin-bottom: 15px;">Have questions? Our team is here to help</p>
              <a href="mailto:support@kicknclick.com" style="color: #059669; text-decoration: none; font-weight: 600;">support@kicknclick.com</a>
              <p style="margin-top: 20px; font-size: 12px;">© ${new Date().getFullYear()} kickNclick. All rights reserved.</p>
            </div>
          </div>
        </div>
      `;
    }

    const mailOptions = {
      from: 'kicknclick2@gmail.com',
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Email server running on port ${PORT}`);
});