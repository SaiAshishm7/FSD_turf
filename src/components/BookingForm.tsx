const sendBookingEmail = async (
  type: 'confirmation' | 'cancellation',
  bookingDetails: {
    bookingId: string;
    turfName: string;
    date: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
  },
  userEmail: string
) => {
  try {
    console.log('Sending email with details:', { type, bookingDetails, userEmail });
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-booking-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          to: userEmail,
          type,
          bookingDetails,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || 'Failed to send email');
    }

    const result = await response.json();
    console.log('Email API response:', result);
  } catch (error) {
    console.error('Error sending email:', error);
    toast({
      title: "Warning",
      description: "Booking successful but confirmation email could not be sent.",
      variant: "warning",
    });
  }
};

const handleBooking = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user) {
    toast({
      title: "Authentication required",
      description: "Please sign in to book a turf",
      variant: "destructive",
    });
    return;
  }

  setIsSubmitting(true);

  try {
    // Calculate total price
    const hours = calculateHours(selectedTime.startTime, selectedTime.endTime);
    const totalPrice = hours * turf.price;

    // Insert booking
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        turf_id: turf.id,
        booking_date: selectedDate,
        start_time: selectedTime.startTime,
        end_time: selectedTime.endTime,
        total_price: totalPrice,
        status: 'confirmed',
      })
      .select('id')
      .single();

    if (bookingError) throw bookingError;

    // Send confirmation email
    await sendBookingEmail(
      'confirmation',
      {
        bookingId: bookingData.id,
        turfName: turf.name,
        date: selectedDate,
        startTime: selectedTime.startTime,
        endTime: selectedTime.endTime,
        totalPrice: totalPrice,
      },
      user.email || ''
    );

    toast({
      title: "Booking successful!",
      description: "Your turf has been booked successfully. Check your email for confirmation.",
    });

    onSuccess();
  } catch (error: any) {
    console.error('Error booking turf:', error);
    toast({
      title: "Error",
      description: error.message || "Failed to book turf. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
};

// Add this function to handle booking cancellations
const handleCancelBooking = async (bookingId: string) => {
  if (!user) return;

  try {
    // Get booking details before cancellation
    const { data: bookingData, error: fetchError } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_date,
        start_time,
        end_time,
        total_price,
        turf:turfs (name)
      `)
      .eq('id', bookingId)
      .single();

    if (fetchError) throw fetchError;

    // Update booking status
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (updateError) throw updateError;

    // Send cancellation email
    await sendBookingEmail(
      'cancellation',
      {
        bookingId: bookingData.id,
        turfName: bookingData.turf.name,
        date: bookingData.booking_date,
        startTime: bookingData.start_time,
        endTime: bookingData.end_time,
        totalPrice: bookingData.total_price,
      },
      user.email || ''
    );

    toast({
      title: "Booking cancelled",
      description: "Your booking has been cancelled successfully. Check your email for confirmation.",
    });
  } catch (error: any) {
    console.error('Error cancelling booking:', error);
    toast({
      title: "Error",
      description: error.message || "Failed to cancel booking. Please try again.",
      variant: "destructive",
    });
  }
}; 