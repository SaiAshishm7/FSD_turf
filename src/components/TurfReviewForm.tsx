
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Star } from 'lucide-react';

interface TurfReviewFormProps {
  turfId: string;
  onReviewAdded: () => void;
}

const TurfReviewForm: React.FC<TurfReviewFormProps> = ({ turfId, onReviewAdded }) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to leave a review",
        variant: "destructive"
      });
      return;
    }

    if (comment.trim().length < 5) {
      toast({
        title: "Review too short",
        description: "Please write a more detailed review",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Submitting review:", {
        turf_id: turfId,
        user_id: user.id,
        rating,
        comment: comment.trim(),
      });

      // First, check if user profile exists, create if it doesn't
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profileError) {
        console.error("Error checking profile:", profileError);
        throw profileError;
      }
      
      // If profile doesn't exist, create one
      if (!profileData) {
        console.log("Profile doesn't exist, creating one...");
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: user.email?.split('@')[0] || 'user',
            full_name: user.user_metadata?.full_name || null,
            avatar_url: user.user_metadata?.avatar_url || null
          });
          
        if (createProfileError) {
          console.error("Error creating profile:", createProfileError);
          throw createProfileError;
        }
        
        console.log("Profile created successfully");
      }

      // First, update the turf's rating and review count
      const { data: turfData, error: turfFetchError } = await supabase
        .from('turfs')
        .select('rating, reviews')
        .eq('id', turfId)
        .single();

      if (turfFetchError && turfFetchError.code !== 'PGRST116') {
        console.error("Error fetching turf data:", turfFetchError);
        throw turfFetchError;
      }

      // Insert the review
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          turf_id: turfId,
          user_id: user.id,
          rating,
          comment: comment.trim(),
        })
        .select();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Review submitted successfully:", data);

      // Update the turf's rating and review count
      if (turfData) {
        const currentRating = turfData.rating || 0;
        const currentReviews = turfData.reviews || 0;
        
        // Calculate new average rating
        const newRating = (currentRating * currentReviews + rating) / (currentReviews + 1);
        
        const { error: updateError } = await supabase
          .from('turfs')
          .update({
            rating: newRating,
            reviews: currentReviews + 1
          })
          .eq('id', turfId);
          
        if (updateError) {
          console.error("Error updating turf stats:", updateError);
          // Don't throw here, we still want to consider the review successful
        }
      }

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });

      // Reset form and notify parent
      setComment("");
      setRating(5);
      onReviewAdded();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="rating" className="block mb-2">Rating</Label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <Label htmlFor="comment" className="block mb-2">Your Review</Label>
          <Textarea
            id="comment"
            placeholder="Share your experience with this turf..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px]"
            required
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={isSubmitting || !user}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
        
        {!user && (
          <p className="text-sm text-muted-foreground">Please sign in to leave a review</p>
        )}
      </form>
    </div>
  );
};

export default TurfReviewForm;