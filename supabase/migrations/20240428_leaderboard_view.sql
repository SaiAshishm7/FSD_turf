-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
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