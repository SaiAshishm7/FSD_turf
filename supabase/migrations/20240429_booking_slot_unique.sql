-- Add a unique constraint to prevent double booking of the same turf, date, and time slot (only for confirmed bookings)
CREATE UNIQUE INDEX IF NOT EXISTS unique_booking_slot_confirmed
ON bookings (turf_id, booking_date, start_time, end_time)
WHERE status = 'confirmed'; 