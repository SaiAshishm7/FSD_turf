import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Clock, Users, Info, Star } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";

const timeOptions = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", 
  "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"
];

const formatTime = (time: string) => {
  const hour = parseInt(time.split(":")[0]);
  if (hour === 12) return `${hour}:00 PM`;
  if (hour > 12) return `${hour - 12}:00 PM`;
  return `${hour}:00 AM`;
};

const isTimeOverlap = (
  startTime1: string, 
  endTime1: string, 
  startTime2: string, 
  endTime2: string
) => {
  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const start1 = toMinutes(startTime1);
  const end1 = toMinutes(endTime1);
  const start2 = toMinutes(startTime2);
  const end2 = toMinutes(endTime2);
  
  return (start1 < end2 && start2 < end1);
};

const BookingCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("10:00");
  const [duration, setDuration] = useState<number>(1);
  const [selectedPeople, setSelectedPeople] = useState<number>(10);
  const [bookedSlots, setBookedSlots] = useState<Array<{date: string, start_time: string, end_time: string}>>([]);
  const [selectedTurf, setSelectedTurf] = useState<string | null>(null);
  const [turfs, setTurfs] = useState<Array<{id: string, name: string, price: number}>>([]);
  const [price, setPrice] = useState<number>(1350);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showTurfSelect, setShowTurfSelect] = useState<boolean>(true);
  const [usePoints, setUsePoints] = useState<boolean>(false);
  const [userPoints, setUserPoints] = useState<number>(0);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: turfId } = useParams();

  useEffect(() => {
    if (turfId) {
      console.log("Setting turf from URL parameter:", turfId);
      setSelectedTurf(turfId);
      setShowTurfSelect(false); // Hide turf select when a specific turf is pre-selected
    } else {
      setShowTurfSelect(true);
    }
  }, [turfId]);

  useEffect(() => {
    const fetchTurfs = async () => {
      try {
        const { data, error } = await supabase
          .from('turfs')
          .select('id, name, price');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          console.log("Fetched turfs:", data);
          setTurfs(data);
          
          if (turfId) {
            console.log("Using turf ID from URL:", turfId);
            const turf = data.find(t => t.id === turfId);
            if (turf) {
              console.log("Found matching turf:", turf);
              setSelectedTurf(turfId);
              setPrice(turf.price);
            } else {
              console.log("No matching turf found for ID:", turfId);
              setSelectedTurf(data[0].id);
              setPrice(data[0].price);
            }
          } else if (!selectedTurf) {
            setSelectedTurf(data[0].id);
            setPrice(data[0].price);
          } else {
            const turf = data.find(t => t.id === selectedTurf);
            if (turf) {
              setPrice(turf.price);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching turfs:', error);
        toast({
          title: "Error",
          description: "Failed to load turfs. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    fetchTurfs();
  }, [turfId, toast]);

  useEffect(() => {
    if (date && selectedTurf) {
      const fetchBookedSlots = async () => {
        const dateStr = date.toISOString().split('T')[0];
        
        try {
          console.log("Fetching booked slots for date:", dateStr, "and turf:", selectedTurf);
          const { data, error } = await supabase
            .from('bookings')
            .select('booking_date, start_time, end_time')
            .eq('booking_date', dateStr)
            .eq('turf_id', selectedTurf)
            .eq('status', 'confirmed');
            
          if (error) throw error;
          
          const formattedData = data?.map(item => ({
            date: item.booking_date,
            start_time: item.start_time,
            end_time: item.end_time
          })) || [];
          
          console.log("Fetched booked slots:", formattedData);
          setBookedSlots(formattedData);
        } catch (error) {
          console.error('Error fetching booked slots:', error);
          toast({
            title: "Error",
            description: "Failed to load booking information. Please try again.",
            variant: "destructive",
          });
        }
      };
      
      fetchBookedSlots();
    }
  }, [date, selectedTurf, toast]);

  useEffect(() => {
    if (startTime && duration) {
      const [hours, minutes] = startTime.split(':').map(Number);
      const endHour = hours + duration;
      const endTimeStr = `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      setEndTime(endTimeStr);
    }
  }, [startTime, duration]);

  useEffect(() => {
    if (selectedTurf) {
      const turf = turfs.find(t => t.id === selectedTurf);
      if (turf) {
        const basePrice = turf.price * duration;
        const finalPrice = usePoints ? Math.max(0, basePrice - userPoints) : basePrice;
        setPrice(finalPrice);
      }
    }
  }, [duration, selectedTurf, turfs, usePoints, userPoints]);

  useEffect(() => {
    const fetchUserPoints = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_points')
          .select('points')
          .eq('user_id', user.id)
          .single();
          
        if (error) throw error;
        setUserPoints(data?.points || 0);
      } catch (error) {
        console.error('Error fetching user points:', error);
      }
    };
    
    fetchUserPoints();
  }, [user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const isTimeSlotAvailable = (time: string) => {
    if (!date || !selectedTurf) return true;
    
    const potentialEndTime = (() => {
      const [hours, minutes] = time.split(':').map(Number);
      const endHour = hours + 1;
      return `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    })();
    
    return !bookedSlots.some(slot => 
      isTimeOverlap(time, potentialEndTime, slot.start_time, slot.end_time)
    );
  };

  const isCurrentSelectionValid = () => {
    if (!date || !selectedTurf) return false;
    
    return !bookedSlots.some(slot => 
      isTimeOverlap(startTime, endTime, slot.start_time, slot.end_time)
    );
  };

  const handleTurfSelect = (turfId: string) => {
    console.log("User selected turf:", turfId);
    setSelectedTurf(turfId);
    const turf = turfs.find(t => t.id === turfId);
    if (turf) {
      console.log("Setting price based on selected turf:", turf);
      setPrice(turf.price * duration);
    }
  };

  // Helper to send email
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
      await fetch('http://localhost:3001/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: userEmail,
          type,
          bookingDetails,
        }),
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  // Refactor fetchBookedSlots to be callable
  const fetchBookedSlots = async (dateToFetch = date, turfToFetch = selectedTurf) => {
    if (!dateToFetch || !turfToFetch) return;
    const dateStr = dateToFetch.toISOString().split('T')[0];
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('booking_date, start_time, end_time')
        .eq('booking_date', dateStr)
        .eq('turf_id', turfToFetch)
        .eq('status', 'confirmed');
      if (error) throw error;
      const formattedData = data?.map(item => ({
        date: item.booking_date,
        start_time: item.start_time,
        end_time: item.end_time
      })) || [];
      setBookedSlots(formattedData);
    } catch (error) {
      console.error('Error fetching booked slots:', error);
      toast({
        title: 'Error',
        description: 'Failed to load booking information. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleConfirmBooking = async () => {
    if (!date || !selectedTurf || !isCurrentSelectionValid()) return;
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to book a turf',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          turf_id: selectedTurf,
          booking_date: date ? new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0] : '',
          start_time: startTime,
          end_time: endTime,
          total_price: price,
          status: 'confirmed',
        })
        .select('*, turf:turf_id(name)')
        .single();
      if (error) throw error;
      // Update points if used
      if (usePoints && userPoints > 0) {
        const { error: pointsError } = await supabase
          .from('user_points')
          .update({ points: userPoints - Math.min(userPoints, price) })
          .eq('user_id', user.id);
        if (pointsError) throw pointsError;
      }
      // Send confirmation email
      await sendBookingEmail(
        'confirmation',
        {
          bookingId: data.id,
          turfName: data.turf?.name || 'Turf',
          date: data.booking_date,
          startTime: data.start_time,
          endTime: data.end_time,
          totalPrice: data.total_price,
        },
        user.email || ''
      );
      // Refresh booked slots
      await fetchBookedSlots();
      toast({
        title: 'Booking successful!',
        description: 'Your turf has been booked successfully.',
      });
      navigate('/my-bookings');
    } catch (error: any) {
      console.error('Error creating booking:', error);
      let errorMsg = error.message || 'Failed to create booking. Please try again.';
      // Check for unique constraint violation
      if (errorMsg.includes('unique_booking_slot_confirmed') || errorMsg.toLowerCase().includes('duplicate')) {
        errorMsg = 'This slot was just booked by someone else. Please choose another slot.';
        // Optionally, refresh booked slots
        await fetchBookedSlots();
      }
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      id="booking"
      className="relative py-16 lg:py-24 overflow-hidden"
    >
      <div className="absolute inset-0 bg-primary/5 -z-10" />
      <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 animate-fade-in opacity-0">
            Book Your <span className="text-primary">Perfect Slot</span>
          </h2>
          <p className="text-lg text-muted-foreground animate-fade-in opacity-0 [animation-delay:100ms]">
            Choose your preferred date, time, and number of players. We'll find
            the perfect turf for your game day.
          </p>
        </div>

        <div className="max-w-5xl mx-auto glass backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-6 p-6 md:p-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Select Date & Time</h3>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred date and time slot for booking. You can book up to 5 days in advance.
                </p>
              </div>

              <div className="bg-background rounded-xl p-4 animate-scale-up opacity-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="rounded-lg border-0"
                  disabled={(date) => {
                    const now = new Date();
                    now.setHours(0, 0, 0, 0);
                    
                    const maxDate = new Date();
                    maxDate.setDate(maxDate.getDate() + 5); // Allow bookings up to 5 days ahead
                    maxDate.setHours(23, 59, 59, 999);
                    
                    return date < now || date > maxDate;
                  }}
                />
              </div>

              <div className="animate-scale-up opacity-0 [animation-delay:100ms]">
                <div className="space-y-4">
                  {showTurfSelect && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        Select Turf
                      </label>
                      <Select
                        value={selectedTurf || undefined}
                        onValueChange={handleTurfSelect}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a turf" />
                        </SelectTrigger>
                        <SelectContent>
                          {turfs.map((turf) => (
                            <SelectItem key={turf.id} value={turf.id}>
                              {turf.name} - {formatPrice(turf.price)}/hr
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      Start Time
                    </label>
                    <Select
                      value={startTime}
                      onValueChange={setStartTime}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select start time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.slice(0, -1).map((time) => (
                          <SelectItem 
                            key={time} 
                            value={time}
                            disabled={!isTimeSlotAvailable(time)}
                            className={!isTimeSlotAvailable(time) ? "opacity-50" : ""}
                          >
                            {formatTime(time)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      Duration (in hours)
                    </label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        value={[duration]}
                        onValueChange={(value) => setDuration(value[0])}
                        max={3}
                        min={1}
                        step={1}
                        className="flex-grow"
                      />
                      <span className="text-sm font-medium w-8 text-center">{duration}h</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="animate-scale-up opacity-0 [animation-delay:200ms]">
                <div className="flex items-center mb-3">
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium">Number of Players</h4>
                </div>
                <div className="flex space-x-2">
                  {[5, 10, 15, 20].map((num) => (
                    <button
                      key={num}
                      onClick={() => setSelectedPeople(num)}
                      className={cn(
                        "py-2 px-4 text-sm font-medium rounded-lg border transition-all",
                        selectedPeople === num
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:border-primary/60"
                      )}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="space-y-2 mb-6">
                <h3 className="text-lg font-medium">Booking Summary</h3>
                <p className="text-sm text-muted-foreground">
                  Review your booking details before confirming
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="text-sm font-medium flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {date ? date.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    }) : "Select a date"}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-sm text-muted-foreground">Time</span>
                  <span className="text-sm font-medium flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-primary" />
                    {startTime && endTime 
                      ? `${formatTime(startTime)} - ${formatTime(endTime)}`
                      : "Select times"}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="text-sm font-medium">
                    {duration} {duration === 1 ? "hour" : "hours"}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-sm text-muted-foreground">Players</span>
                  <span className="text-sm font-medium flex items-center">
                    <Users className="mr-2 h-4 w-4 text-primary" />
                    {selectedPeople} people
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <div className="bg-muted/40 rounded-xl p-4 shadow-sm space-y-4 border border-primary/20 hover:shadow-lg hover:border-primary/40 transition">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-sm text-muted-foreground">Base Price</span>
                    <span className="text-sm font-medium">
                      {formatPrice(turfs.find(t => t.id === selectedTurf)?.price || 0 * duration)}
                    </span>
                  </div>
                  {userPoints > 0 && (
                    <div className="flex items-center space-x-2 pb-4 border-b">
                      <Checkbox
                        id="use-points"
                        checked={usePoints}
                        onCheckedChange={(checked) => setUsePoints(checked as boolean)}
                      />
                      <label
                        htmlFor="use-points"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                      >
                        <Star className="h-4 w-4 mr-2 text-yellow-500" />
                        Use {userPoints} points (₹{userPoints} off)
                      </label>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-medium">Total Price</span>
                    <span className="text-lg font-bold text-primary">{formatPrice(price)}</span>
                  </div>
                </div>
              </div>

              {!isCurrentSelectionValid() && (
                <div className="flex items-start space-x-2 p-3 bg-destructive/10 rounded-lg text-destructive text-sm">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>This time slot is already booked. Please select a different time.</p>
                </div>
              )}

              {!user && (
                <div className="flex items-start space-x-2 p-3 bg-amber-500/10 rounded-lg text-amber-600 text-sm">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>You need to sign in to make a booking.</p>
                </div>
              )}

              <div className="pt-4">
                <Button 
                  className="w-full rounded-xl py-6"
                  disabled={!date || !startTime || !isCurrentSelectionValid() || !selectedTurf || isLoading}
                  onClick={handleConfirmBooking}
                >
                  {isLoading ? "Processing..." : "Confirm Booking"}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  You won't be charged until you confirm
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingCalendar;
