
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Set up CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Interface for the payload
interface EmailRequestPayload {
  type: 'booking' | 'cancellation';
  booking: {
    id: string;
    turf_name: string;
    date: string;
    start_time: string;
    end_time: string;
    location: string;
    price: number;
  };
  user: {
    email: string;
    name?: string;
  };
}

// Function to generate booking confirmation HTML
function generateBookingConfirmationEmail(payload: EmailRequestPayload): string {
  const { booking, user } = payload;
  
  // Format date
  const bookingDate = new Date(booking.date);
  const formattedDate = bookingDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Format price
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(booking.price);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>Booking Confirmation</title>
      <style>
        @media only screen and (max-width: 620px) {
          table.body h1 {
            font-size: 28px !important;
            margin-bottom: 10px !important;
          }
          
          table.body p,
          table.body ul,
          table.body ol,
          table.body td,
          table.body span,
          table.body a {
            font-size: 16px !important;
          }
          
          table.body .wrapper,
          table.body .article {
            padding: 10px !important;
          }
          
          table.body .content {
            padding: 0 !important;
          }
          
          table.body .container {
            padding: 0 !important;
            width: 100% !important;
          }
          
          table.body .main {
            border-left-width: 0 !important;
            border-radius: 0 !important;
            border-right-width: 0 !important;
          }
        }
        
        @media all {
          .ExternalClass {
            width: 100%;
          }
          
          .ExternalClass,
          .ExternalClass p,
          .ExternalClass span,
          .ExternalClass font,
          .ExternalClass td,
          .ExternalClass div {
            line-height: 100%;
          }
          
          .apple-link a {
            color: inherit !important;
            font-family: inherit !important;
            font-size: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
            text-decoration: none !important;
          }
          
          #MessageViewBody a {
            color: inherit;
            text-decoration: none;
            font-size: inherit;
            font-family: inherit;
            font-weight: inherit;
            line-height: inherit;
          }
        }
      </style>
    </head>
    <body style="background-color: #f6f6f6; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f6f6f6; width: 100%;" width="100%" bgcolor="#f6f6f6">
        <tr>
          <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
          <td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; max-width: 580px; padding: 10px; width: 580px; margin: 0 auto;" width="580" valign="top">
            <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">
              <!-- START CENTERED WHITE CONTAINER -->
              <span class="preheader" style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">Your turf booking has been confirmed!</span>
              <table role="presentation" class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #ffffff; border-radius: 3px; width: 100%;" width="100%">
                <!-- START MAIN CONTENT AREA -->
                <tr>
                  <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                      <tr>
                        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                          <div style="background-color: #22c55e; padding: 12px; border-radius: 8px 8px 0 0;">
                            <h1 style="color: #ffffff; font-family: sans-serif; font-weight: 700; margin: 0; margin-bottom: 15px; font-size: 32px; line-height: 1.3; text-align: center;">Booking Confirmed!</h1>
                          </div>
                          <div style="background-color: #f7f7f7; padding: 20px; border-radius: 0 0 8px 8px; margin-bottom: 20px;">
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Hello ${user.name || 'there'},</p>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Your booking has been confirmed. Here are the details:</p>
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="booking-details" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; margin-bottom: 20px;" width="100%">
                              <tr style="background-color: #f0f9f0;">
                                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 15px; border-bottom: 1px solid #e1e1e1; font-weight: bold; width: 40%;" width="40%" valign="top">Turf</td>
                                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 15px; border-bottom: 1px solid #e1e1e1;" valign="top">${booking.turf_name}</td>
                              </tr>
                              <tr>
                                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 15px; border-bottom: 1px solid #e1e1e1; font-weight: bold;" valign="top">Date</td>
                                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 15px; border-bottom: 1px solid #e1e1e1;" valign="top">${formattedDate}</td>
                              </tr>
                              <tr style="background-color: #f0f9f0;">
                                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 15px; border-bottom: 1px solid #e1e1e1; font-weight: bold;" valign="top">Time</td>
                                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 15px; border-bottom: 1px solid #e1e1e1;" valign="top">${booking.start_time} - ${booking.end_time}</td>
                              </tr>
                              <tr>
                                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 15px; border-bottom: 1px solid #e1e1e1; font-weight: bold;" valign="top">Location</td>
                                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 15px; border-bottom: 1px solid #e1e1e1;" valign="top">${booking.location}</td>
                              </tr>
                              <tr style="background-color: #f0f9f0;">
                                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 15px; font-weight: bold;" valign="top">Amount</td>
                                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 15px; font-weight: bold; color: #22c55e;" valign="top">${formattedPrice}</td>
                              </tr>
                            </table>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Reference ID: <span style="color: #888888; font-family: monospace;">${booking.id}</span></p>
                          </div>
                          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Please arrive 15 minutes before your scheduled time. If you need to cancel your booking, please do so at least 7 hours in advance.</p>
                          <div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
                            <a href="https://your-website.com/my-bookings" target="_blank" style="display: inline-block; color: #ffffff; background-color: #22c55e; border: solid 1px #22c55e; border-radius: 5px; box-sizing: border-box; cursor: pointer; text-decoration: none; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-transform: capitalize; border-color: #22c55e;">View Booking</a>
                          </div>
                          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Thank you for choosing our service!</p>
                          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Best regards,<br>The Turf Booking Team</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                  <tr>
                    <td class="content-block" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; color: #999999; font-size: 12px; text-align: center;" valign="top" align="center">
                      <span class="apple-link" style="color: #999999; font-size: 12px; text-align: center;">Turf Booking Service, 123 Street, City, Country</span>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </td>
          <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// Function to generate cancellation email HTML
function generateCancellationEmail(payload: EmailRequestPayload): string {
  const { booking, user } = payload;
  
  // Format date
  const bookingDate = new Date(booking.date);
  const formattedDate = bookingDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Format price
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(booking.price);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>Booking Cancellation</title>
      <style>
        @media only screen and (max-width: 620px) {
          table.body h1 {
            font-size: 28px !important;
            margin-bottom: 10px !important;
          }
          
          table.body p,
          table.body ul,
          table.body ol,
          table.body td,
          table.body span,
          table.body a {
            font-size: 16px !important;
          }
          
          table.body .wrapper,
          table.body .article {
            padding: 10px !important;
          }
          
          table.body .content {
            padding: 0 !important;
          }
          
          table.body .container {
            padding: 0 !important;
            width: 100% !important;
          }
          
          table.body .main {
            border-left-width: 0 !important;
            border-radius: 0 !important;
            border-right-width: 0 !important;
          }
        }
        
        @media all {
          .ExternalClass {
            width: 100%;
          }
          
          .ExternalClass,
          .ExternalClass p,
          .ExternalClass span,
          .ExternalClass font,
          .ExternalClass td,
          .ExternalClass div {
            line-height: 100%;
          }
          
          .apple-link a {
            color: inherit !important;
            font-family: inherit !important;
            font-size: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
            text-decoration: none !important;
          }
          
          #MessageViewBody a {
            color: inherit;
            text-decoration: none;
            font-size: inherit;
            font-family: inherit;
            font-weight: inherit;
            line-height: inherit;
          }
        }
      </style>
    </head>
    <body style="background-color: #f6f6f6; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f6f6f6; width: 100%;" width="100%" bgcolor="#f6f6f6">
        <tr>
          <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
          <td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; max-width: 580px; padding: 10px; width: 580px; margin: 0 auto;" width="580" valign="top">
            <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">
              <!-- START CENTERED WHITE CONTAINER -->
              <span class="preheader" style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">Your turf booking has been cancelled.</span>
              <table role="presentation" class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #ffffff; border-radius: 3px; width: 100%;" width="100%">
                <!-- START MAIN CONTENT AREA -->
                <tr>
                  <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                      <tr>
                        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                          <div style="background-color: #ea580c; padding: 12px; border-radius: 8px 8px 0 0;">
                            <h1 style="color: #ffffff; font-family: sans-serif; font-weight: 700; margin: 0; margin-bottom: 15px; font-size: 32px; line-height: 1.3; text-align: center;">Booking Cancelled</h1>
                          </div>
                          <div style="background-color: #f7f7f7; padding: 20px; border-radius: 0 0 8px 8px; margin-bottom: 20px;">
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Hello ${user.name || 'there'},</p>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Your booking has been successfully cancelled. Here are the details of the cancelled booking:</p>
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="booking-details" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; margin-bottom: 20px;" width="100%">
                              <tr style="background-color: #fff1e7;">
                                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 15px; border-bottom: 1px solid #e1e1e1; font-weight: bold; width: 40%;" width="40%" valign="top">Turf</td>
                                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 15px; border-bottom: 1px solid #e1e1e1;" valign="top">${booking.turf_name}</td>
                              </tr>
                              <tr>
                                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 15px; border-bottom: 1px solid #e1e1e1; font-weight: bold;" valign="top">Date</td>
                                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 15px; border-bottom: 1px solid #e1e1e1;" valign="top">${formattedDate}</td>
                              </tr>
                              <tr style="background-color: #fff1e7;">
                                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 15px; border-bottom: 1px solid #e1e1e1; font-weight: bold;" valign="top">Time</td>
                                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 15px; border-bottom: 1px solid #e1e1e1;" valign="top">${booking.start_time} - ${booking.end_time}</td>
                              </tr>
                              <tr>
                                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 15px; border-bottom: 1px solid #e1e1e1; font-weight: bold;" valign="top">Location</td>
                                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 15px; border-bottom: 1px solid #e1e1e1;" valign="top">${booking.location}</td>
                              </tr>
                              <tr style="background-color: #fff1e7;">
                                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 15px; font-weight: bold;" valign="top">Amount</td>
                                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding: 15px; font-weight: bold; color: #ea580c;" valign="top">${formattedPrice}</td>
                              </tr>
                            </table>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Reference ID: <span style="color: #888888; font-family: monospace;">${booking.id}</span></p>
                          </div>
                          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">We're sorry you had to cancel your booking. We hope to see you again soon!</p>
                          <div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
                            <a href="https://your-website.com/turfs" target="_blank" style="display: inline-block; color: #ffffff; background-color: #ea580c; border: solid 1px #ea580c; border-radius: 5px; box-sizing: border-box; cursor: pointer; text-decoration: none; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-transform: capitalize; border-color: #ea580c;">Book Another Turf</a>
                          </div>
                          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Thank you for choosing our service!</p>
                          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Best regards,<br>The Turf Booking Team</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                  <tr>
                    <td class="content-block" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; color: #999999; font-size: 12px; text-align: center;" valign="top" align="center">
                      <span class="apple-link" style="color: #999999; font-size: 12px; text-align: center;">Turf Booking Service, 123 Street, City, Country</span>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </td>
          <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Get auth token from request header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create supabase client with admin privileges
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Parse request body
    const { type, booking, user }: EmailRequestPayload = await req.json();
    console.log(`Received request to send ${type} email to ${user.email} for booking ${booking.id}`);

    // Generate email template based on type
    let subject: string;
    let htmlContent: string;

    if (type === 'booking') {
      subject = `Booking Confirmation - ${booking.turf_name}`;
      htmlContent = generateBookingConfirmationEmail({ type, booking, user });
    } else if (type === 'cancellation') {
      subject = `Booking Cancellation - ${booking.turf_name}`;
      htmlContent = generateCancellationEmail({ type, booking, user });
    } else {
      throw new Error(`Invalid email type: ${type}`);
    }

    // Send email using Supabase's built-in email functionality
    const { error } = await supabaseAdmin.auth.admin.sendEmail(
      user.email,
      subject,
      {
        html: htmlContent,
      }
    );

    if (error) {
      throw error;
    }

    // Log the successful email sending
    console.log(`Successfully sent ${type} email to ${user.email}`);

    // Return successful response
    return new Response(
      JSON.stringify({
        success: true,
        message: `${type} email sent successfully`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending email:", error.message);
    
    // Return error response
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
