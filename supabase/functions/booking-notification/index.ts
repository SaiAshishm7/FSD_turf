
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define necessary types
interface BookingData {
  id: string;
  date: string;
  startTime: string;
  turfName: string;
  price: number;
}

interface BookingNotificationRequest {
  type: 'confirmation' | 'cancellation';
  email: string;
  booking: BookingData;
}

// Set up CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with admin privileges
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse the request body
    const { type, email, booking } = await req.json() as BookingNotificationRequest;
    
    console.log(`Processing ${type} notification for ${email}`);
    
    // Format date for display
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      });
    };
    
    // Format price in Indian Rupees
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(price);
    };
    
    let subject: string;
    let content: string;
    
    // Create email content based on notification type
    if (type === 'confirmation') {
      subject = `Booking Confirmed: ${booking.turfName} on ${formatDate(booking.date)}`;
      content = `
        <h1>Your Booking is Confirmed!</h1>
        <p>Dear Customer,</p>
        <p>Your booking at <strong>${booking.turfName}</strong> has been confirmed.</p>
        <h2>Booking Details:</h2>
        <ul>
          <li><strong>Date:</strong> ${formatDate(booking.date)}</li>
          <li><strong>Time:</strong> ${booking.startTime}</li>
          <li><strong>Turf:</strong> ${booking.turfName}</li>
          <li><strong>Total Amount:</strong> ${formatPrice(booking.price)}</li>
          <li><strong>Booking Reference:</strong> ${booking.id}</li>
        </ul>
        <p>Please arrive 15 minutes before your booking time.</p>
        <p>Thank you for choosing our service!</p>
      `;
    } else {
      subject = `Booking Cancelled: ${booking.turfName} on ${formatDate(booking.date)}`;
      content = `
        <h1>Your Booking has been Cancelled</h1>
        <p>Dear Customer,</p>
        <p>Your booking at <strong>${booking.turfName}</strong> has been cancelled as requested.</p>
        <h2>Cancelled Booking Details:</h2>
        <ul>
          <li><strong>Date:</strong> ${formatDate(booking.date)}</li>
          <li><strong>Time:</strong> ${booking.startTime}</li>
          <li><strong>Turf:</strong> ${booking.turfName}</li>
          <li><strong>Total Amount:</strong> ${formatPrice(booking.price)}</li>
          <li><strong>Booking Reference:</strong> ${booking.id}</li>
        </ul>
        <p>If you didn't request this cancellation, please contact our support team immediately.</p>
        <p>Thank you for choosing our service!</p>
      `;
    }
    
    // Send email notification
    const { error } = await supabase.auth.admin.sendEmail(
      email,
      {
        subject,
        template_data: {
          content,
        },
      },
      {
        template: "user-email", // Default template that allows HTML content
      }
    );
    
    if (error) {
      throw error;
    }
    
    console.log(`${type} notification sent successfully to ${email}`);
    
    // Return success response
    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
    
  } catch (error) {
    console.error("Error in booking-notification function:", error);
    
    // Return error response
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { 
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  }
});
