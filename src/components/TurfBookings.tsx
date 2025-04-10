import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';

interface Booking {
  id: string;
  turf_id: string;
  user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
  user: {
    email: string;
    id: string;
  };
}

interface TurfBookingsProps {
  turfId: string;
}

const TurfBookings: React.FC<TurfBookingsProps> = ({ turfId }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // First, let's check the actual structure of the bookings table
      const { data: tableInfo, error: tableError } = await supabase
        .from('bookings')
        .select('*')
        .limit(1);

      if (tableError) throw tableError;

      // Now fetch the bookings with the proper join
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          user:user_id (
            id,
            email
          )
        `)
        .eq('turf_id', turfId)
        .order('booking_date', { ascending: false });

      if (error) throw error;

      setBookings(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching data:', err.message);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;

      // Refresh bookings after cancellation
      fetchBookings();
    } catch (err: any) {
      console.error('Error cancelling booking:', err.message);
      setError('Failed to cancel booking');
    }
  };

  const formatDateTime = (date: string, time: string) => {
    const dateTime = new Date(`${date}T${time}`);
    return format(dateTime, 'MMM d, yyyy hh:mm a');
  };

  useEffect(() => {
    fetchBookings();
  }, [turfId]);

  if (loading) return <div>Loading bookings...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings found for this turf.</p>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    {booking.user?.email || 'Unknown User'}
                  </TableCell>
                  <TableCell>{format(new Date(booking.booking_date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    {`${format(new Date(`2000-01-01T${booking.start_time}`), 'hh:mm a')} - 
                      ${format(new Date(`2000-01-01T${booking.end_time}`), 'hh:mm a')}`}
                  </TableCell>
                  <TableCell>
                    <span className={`capitalize px-2 py-1 rounded-full text-sm
                      ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}>
                      {booking.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {booking.status !== 'cancelled' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default TurfBookings; 