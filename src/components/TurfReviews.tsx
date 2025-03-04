
import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Star, MessageCircle, ChevronDown, ChevronUp, User } from "lucide-react";

interface TurfReviewsProps {
  turfId: string;
  onRefresh?: boolean;
}

interface UserProfile {
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
}

interface Review {
  id: string;
  turf_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
  replies: Reply[];
}

interface Reply {
  id: string;
  review_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
}

const TurfReviews: React.FC<TurfReviewsProps> = ({ turfId, onRefresh }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      console.log("Fetching reviews for turf ID:", turfId);
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          *,
          user:profiles(username, full_name, avatar_url)
        `)
        .eq('turf_id', turfId)
        .order('created_at', { ascending: false });

      if (reviewsError) {
        console.error("Error fetching reviews:", reviewsError);
        throw reviewsError;
      }

      console.log("Reviews data:", reviewsData);

      if (!reviewsData || reviewsData.length === 0) {
        console.log("No reviews found for this turf");
        setReviews([]);
        setLoading(false);
        return;
      }

      const reviewIds = reviewsData.map(review => review.id);
      const { data: repliesData, error: repliesError } = await supabase
        .from('review_replies')
        .select(`
          *,
          user:profiles(username, full_name, avatar_url)
        `)
        .in('review_id', reviewIds);

      if (repliesError) {
        console.error("Error fetching replies:", repliesError);
        throw repliesError;
      }

      console.log("Replies data:", repliesData || []);

      const reviewsWithReplies: Review[] = reviewsData.map(review => {
        const reviewReplies = repliesData 
          ? repliesData.filter(reply => reply.review_id === review.id)
          : [];
        
        return {
          ...review,
          user: review.user || undefined,
          replies: reviewReplies.map(reply => ({
            ...reply,
            user: reply.user || undefined
          }))
        };
      });

      console.log("Processed reviews with replies:", reviewsWithReplies);
      setReviews(reviewsWithReplies);
      setError(null);
    } catch (err: any) {
      console.error("Error in fetchReviews:", err.message);
      setError("Failed to load reviews. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load reviews. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpand = (reviewId: string) => {
    setExpandedReviewId((prevId) => (prevId === reviewId ? null : reviewId));
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-5 w-5 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
        />
      );
    }
    return stars;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleReply = (reviewId: string) => {
    setReplyingTo(reviewId);
    setReplyText("");
  };

  const ensureUserProfileExists = async () => {
    if (!user) return false;
    
    try {
      console.log("Checking if profile exists for user ID:", user.id);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          console.log("Profile doesn't exist, creating new profile");
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              username: user.email?.split('@')[0] || 'user',
              full_name: user.user_metadata?.full_name || null,
              avatar_url: user.user_metadata?.avatar_url || null
            });
          
          if (insertError) {
            console.error("Error creating profile:", insertError);
            throw insertError;
          }
          
          console.log("Profile created successfully");
          return true;
        } else {
          console.error("Error checking profile:", profileError);
          throw profileError;
        }
      }
      
      console.log("Profile exists:", profileData);
      return true;
    } catch (err) {
      console.error("Profile check/creation error:", err);
      return false;
    }
  };

  const handleSubmitReply = async (reviewId: string) => {
    if (!replyText.trim()) {
      toast({
        title: "Warning",
        description: "Reply cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to reply to reviews.",
        variant: "destructive",
      });
      return;
    }

    try {
      const profileExists = await ensureUserProfileExists();
      if (!profileExists) {
        toast({
          title: "Error",
          description: "Failed to create or verify user profile.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Submitting reply for review ID:", reviewId);
      const { data, error } = await supabase
        .from('review_replies')
        .insert([
          {
            review_id: reviewId,
            user_id: user.id,
            comment: replyText,
          },
        ])
        .select();

      if (error) {
        console.error("Error inserting reply:", error);
        throw error;
      }

      console.log("Reply inserted:", data);

      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error("Error fetching user profile:", userError.message);
      }

      console.log("User profile for reply:", userData);

      const newReply: Reply = {
        id: data[0].id,
        review_id: data[0].review_id,
        user_id: data[0].user_id,
        comment: data[0].comment,
        created_at: data[0].created_at,
        updated_at: data[0].updated_at,
        user: userData || {
          username: 'Anonymous',
          full_name: null,
          avatar_url: null
        }
      };

      setReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === reviewId
            ? {
                ...review,
                replies: [...review.replies, newReply]
              }
            : review
        )
      );

      setReplyText("");
      setReplyingTo(null);
      toast({
        title: "Success",
        description: "Reply added successfully!",
      });
    } catch (err: any) {
      console.error("Error submitting reply:", err.message);
      toast({
        title: "Error",
        description: "Failed to submit reply. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (turfId) {
      fetchReviews();
    }
  }, [turfId, onRefresh]);

  return (
    <div className="space-y-6">
      {error && (
        <div className="text-red-500">Error: {error}</div>
      )}

      {loading ? (
        <div className="text-center py-4">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-4">No reviews yet. Be the first to review!</div>
      ) : (
        reviews.map((review) => (
          <div key={review.id} className="border rounded-md p-4">
            <div className="flex items-start space-x-4">
              <Avatar>
                {review.user?.avatar_url ? (
                  <AvatarImage src={review.user.avatar_url} alt={review.user.username || 'User'} />
                ) : (
                  <AvatarFallback>{review.user?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                )}
              </Avatar>
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{review.user?.full_name || review.user?.username || 'Anonymous'}</h4>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      {renderStars(review.rating)}
                      <span>{formatDate(review.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm">
                  {expandedReviewId === review.id ? review.comment : `${review.comment.substring(0, 200)}${review.comment.length > 200 ? '...' : ''}`}
                  {review.comment.length > 200 && (
                    <button
                      className="text-primary text-sm ml-1 font-medium"
                      onClick={() => handleToggleExpand(review.id)}
                    >
                      {expandedReviewId === review.id ? "Show Less" : "Show More"}
                    </button>
                  )}
                </div>

                {review.replies && review.replies.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h5 className="font-semibold text-sm">Replies:</h5>
                    {review.replies.map((reply) => (
                      <div key={reply.id} className="ml-4 p-3 rounded-md bg-muted/50">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-7 w-7">
                            {reply.user?.avatar_url ? (
                              <AvatarImage src={reply.user.avatar_url} alt={reply.user.username || 'User'} />
                            ) : (
                              <AvatarFallback>{reply.user?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                            )}
                          </Avatar>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{reply.user?.full_name || reply.user?.username || 'Anonymous'}</div>
                            <p className="text-sm text-muted-foreground">{reply.comment}</p>
                            <span className="text-xs text-gray-500">{formatDate(reply.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {replyingTo === review.id ? (
                  <div className="mt-4">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your reply..."
                      className="w-full text-sm"
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => handleSubmitReply(review.id)}>
                        Submit Reply
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="link" size="sm" onClick={() => handleReply(review.id)}>
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Reply
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TurfReviews;
