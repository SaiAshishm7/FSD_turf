-- Create user_points table
CREATE TABLE IF NOT EXISTS user_points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    points INTEGER DEFAULT 350,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add RLS policies for user_points
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own points"
    ON user_points FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view leaderboard"
    ON user_points FOR SELECT
    USING (true);

CREATE POLICY "System can insert points"
    ON user_points FOR INSERT
    WITH CHECK (true);

CREATE POLICY "System can update points"
    ON user_points FOR UPDATE
    USING (true);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT,
    points_required INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(user_id, achievement_id)
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    points_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(referrer_id, referred_id)
);

-- Create a view for the leaderboard
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
    up.user_id,
    up.points,
    p.username
FROM user_points up
LEFT JOIN profiles p ON p.id = up.user_id
ORDER BY up.points DESC;

-- Insert default achievements
INSERT INTO achievements (name, description, points_required) VALUES
    ('First Booking', 'Complete your first turf booking', 0),
    ('Regular Player', 'Book 5 turf sessions', 500),
    ('Turf Master', 'Book 20 turf sessions', 2000),
    ('Early Bird', 'Book a morning slot', 100),
    ('Night Owl', 'Book an evening slot', 100),
    ('Weekend Warrior', 'Book a weekend slot', 150),
    ('Group Leader', 'Book for a group of 5 or more', 300),
    ('Reviewer', 'Write your first review', 50),
    ('Super Reviewer', 'Write 5 reviews', 250),
    ('Turf Explorer', 'Book at 3 different turfs', 400);

-- Create function to update points
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS TRIGGER AS $$
BEGIN
    -- Update points when a booking is completed
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE user_points
        SET points = points + 10
        WHERE user_id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for booking completion
CREATE TRIGGER booking_completion_trigger
AFTER UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_user_points();

-- Create function to check and award achievements
CREATE OR REPLACE FUNCTION check_achievements()
RETURNS TRIGGER AS $$
DECLARE
    total_bookings INTEGER;
    total_reviews INTEGER;
    different_turfs INTEGER;
BEGIN
    -- Check booking-based achievements
    SELECT COUNT(*) INTO total_bookings
    FROM bookings
    WHERE user_id = NEW.user_id AND status = 'completed';

    -- Check review-based achievements
    SELECT COUNT(*) INTO total_reviews
    FROM reviews
    WHERE user_id = NEW.user_id;

    -- Check different turfs
    SELECT COUNT(DISTINCT turf_id) INTO different_turfs
    FROM bookings
    WHERE user_id = NEW.user_id AND status = 'completed';

    -- Award achievements based on conditions
    IF total_bookings = 1 THEN
        INSERT INTO user_achievements (user_id, achievement_id)
        SELECT NEW.user_id, id FROM achievements WHERE name = 'First Booking'
        ON CONFLICT DO NOTHING;
    END IF;

    IF total_bookings = 5 THEN
        INSERT INTO user_achievements (user_id, achievement_id)
        SELECT NEW.user_id, id FROM achievements WHERE name = 'Regular Player'
        ON CONFLICT DO NOTHING;
    END IF;

    IF total_bookings = 20 THEN
        INSERT INTO user_achievements (user_id, achievement_id)
        SELECT NEW.user_id, id FROM achievements WHERE name = 'Turf Master'
        ON CONFLICT DO NOTHING;
    END IF;

    IF total_reviews = 1 THEN
        INSERT INTO user_achievements (user_id, achievement_id)
        SELECT NEW.user_id, id FROM achievements WHERE name = 'Reviewer'
        ON CONFLICT DO NOTHING;
    END IF;

    IF total_reviews = 5 THEN
        INSERT INTO user_achievements (user_id, achievement_id)
        SELECT NEW.user_id, id FROM achievements WHERE name = 'Super Reviewer'
        ON CONFLICT DO NOTHING;
    END IF;

    IF different_turfs = 3 THEN
        INSERT INTO user_achievements (user_id, achievement_id)
        SELECT NEW.user_id, id FROM achievements WHERE name = 'Turf Explorer'
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for achievement checking
CREATE TRIGGER achievement_check_trigger
AFTER INSERT OR UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION check_achievements(); 