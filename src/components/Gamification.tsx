import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Users, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface UserPoints {
  points: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
  points_required: number;
}

interface UserAchievement {
  achievement: Achievement;
  earned_at: string;
}

interface LeaderboardUser {
  user_id: string;
  points: number;
  username: string | null;
}

const Gamification = () => {
  const [points, setPoints] = useState<number>(0);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // First, ensure user has points record
      const { data: pointsData, error: pointsError } = await supabase
        .from('user_points')
        .select('points')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (pointsError) throw pointsError;

      // If user doesn't have points, create a record
      if (!pointsData) {
        const { error: insertError } = await supabase
          .from('user_points')
          .insert({
            user_id: user?.id,
            points: 350 // Initial points
          });

        if (insertError) throw insertError;
        setPoints(350);
      } else {
        setPoints(pointsData.points);
      }

      // Fetch user achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('user_achievements')
        .select(`
          earned_at,
          achievement:achievements (
            id,
            name,
            description,
            icon_url,
            points_required
          )
        `)
        .eq('user_id', user?.id);

      if (achievementsError) throw achievementsError;
      setAchievements(achievementsData || []);

      // Fetch leaderboard using the view
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('leaderboard_view')
        .select('*')
        .limit(10);

      if (leaderboardError) throw leaderboardError;
      setLeaderboard(leaderboardData || []);

    } catch (error: any) {
      console.error('Error fetching gamification data:', error.message);
      toast({
        title: "Error",
        description: "Failed to load gamification data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-6 bg-muted rounded-full w-3/4 mb-4"></div>
            <div className="h-4 bg-muted rounded-full w-1/2"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Points Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Your Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">
            {points} Points
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {points} INR worth of rewards available
          </p>
        </CardContent>
      </Card>

      {/* Achievements Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Your Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {achievements.length > 0 ? (
              achievements.map((userAchievement) => (
                <div
                  key={userAchievement.achievement.id}
                  className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{userAchievement.achievement.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {userAchievement.achievement.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Earned on {new Date(userAchievement.earned_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    +{userAchievement.achievement.points_required} points
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No achievements earned yet. Keep playing to earn badges!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-yellow-500" />
            Top Players
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard.map((user, index) => (
              <div
                key={user.user_id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {user.username || 'Anonymous Player'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {user.points} points
                    </p>
                  </div>
                </div>
                {index < 3 && (
                  <Badge variant={index === 0 ? "default" : "secondary"}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Referral Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-yellow-500" />
            Refer & Earn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Share your referral code with friends and earn 100 points for each successful referral!
          </p>
          <div className="flex items-center gap-4">
            <div className="flex-1 p-4 bg-muted/50 rounded-lg text-center font-mono">
              {user?.id.slice(0, 8).toUpperCase()}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(user?.id.slice(0, 8).toUpperCase() || '');
                toast({
                  title: "Copied!",
                  description: "Referral code copied to clipboard",
                });
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Copy
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Gamification; 