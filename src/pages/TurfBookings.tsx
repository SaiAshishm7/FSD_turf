import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Clock, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: string;
  created_at: string;
  profiles: {
    id: string;
    email: string;
  };
}

interface TurfDetails {
  id: string;
  name: string;
  location: string;
}

const TurfBookings = () => {
  const { id } = useParams<{ id: string }>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [turf, setTurf] = useState<TurfDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      toast({
        title: "Authentication required",
        description: "Please sign in to view bookings",
      });
      return;
    }

    const fetchTurfAndBookings = async () => {
      try {
        // Fetch turf details
        const { data: turfData, error: turfError } = await supabase
          .from('turfs')
          .select('id, name, location')
          .eq('id', id)
          .single();

        if (turfError) throw turfError;
        if (!turfData) throw new Error('Turf not found');

        setTurf(turfData);

        // Fetch bookings with user details
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
            profiles:user_id (
              id,
              email
            )
          `)
          .eq('turf_id', id)
          .order('booking_date', { ascending: false });

        if (bookingsError) throw bookingsError;
        
        setBookings(bookingsData || []);
      } catch (error: any) {
        console.error('Error fetching data:', error.message);
        toast({
          title: "Error",
          description: "Failed to load bookings. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTurfAndBookings();
  }, [id, user, navigate, toast]);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-24">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/my-turfs')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{turf?.name || 'Loading...'}</h1>
          <p className="text-muted-foreground">
            View all bookings for this turf
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="h-6 bg-muted rounded-full w-3/4"></div>
                  <div className="h-4 bg-muted rounded-full w-1/2"></div>
                  <div className="h-4 bg-muted rounded-full w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      Booking #{booking.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      by {booking.profiles.email}
                    </p>
                  </div>
                  <Badge variant={
                    booking.status === 'confirmed' ? 'default' :
                    booking.status === 'pending' ? 'secondary' :
                    'destructive'
                  }>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 text-primary" />
                    <span>{formatDate(booking.booking_date)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    <span>{booking.start_time} - {booking.end_time}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-lg font-bold">{formatPrice(booking.total_price)}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Booked on {new Date(booking.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/20 rounded-xl border border-border">
          <h3 className="text-xl font-medium mb-2">No Bookings Yet</h3>
          <p className="text-muted-foreground">
            This turf hasn't received any bookings yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default TurfBookings; 