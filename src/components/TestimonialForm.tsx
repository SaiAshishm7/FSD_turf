
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Star } from 'lucide-react';

interface TestimonialFormProps {
  onTestimonialAdded: () => void;
  onCancel: () => void;
}

const TestimonialForm: React.FC<TestimonialFormProps> = ({ onTestimonialAdded, onCancel }) => {
  const [rating, setRating] = useState<number>(5);
  const [testimonialText, setTestimonialText] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to leave a testimonial",
        variant: "destructive"
      });
      return;
    }

    if (testimonialText.trim().length < 10) {
      toast({
        title: "Testimonial too short",
        description: "Please write a more detailed testimonial",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get user profile data - Fix: Use maybeSingle() instead of single()
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, username, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      // If no profile data is found, use fallback values
      const name = profileData?.full_name || profileData?.username || 'Anonymous';
      const image = profileData?.avatar_url || null;

      const { error } = await supabase
        .from('testimonials')
        .insert({
          user_id: user.id,
          name,
          title: title.trim() || null,
          image,
          rating,
          text: testimonialText.trim(),
        });

      if (error) throw error;

      toast({
        title: "Testimonial submitted",
        description: "Thank you for your feedback!",
      });

      // Reset form and notify parent
      setTestimonialText("");
      setRating(5);
      setTitle("");
      onTestimonialAdded();
    } catch (error: any) {
      console.error('Error submitting testimonial:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit testimonial",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card border rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4">Share Your Experience</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title" className="block mb-2">Your Role/Title (Optional)</Label>
          <Input
            id="title"
            placeholder="e.g. Regular Player, Football Coach, etc."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
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
          <Label htmlFor="testimonialText" className="block mb-2">Your Testimonial</Label>
          <Textarea
            id="testimonialText"
            placeholder="Share your experience with TurfBook..."
            value={testimonialText}
            onChange={(e) => setTestimonialText(e.target.value)}
            className="min-h-[120px]"
            required
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || !user}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? "Submitting..." : "Submit Testimonial"}
          </Button>
        </div>
        
        {!user && (
          <p className="text-sm text-muted-foreground">Please sign in to leave a testimonial</p>
        )}
      </form>
    </div>
  );
};

export default TestimonialForm;
