
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import TestimonialForm from "./TestimonialForm";

interface Testimonial {
  id: string;
  user_id: string;
  name: string;
  title: string | null;
  image: string | null;
  rating: number;
  text: string;
  created_at: string;
}

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching testimonials:', error);
        throw error;
      }
      
      setTestimonials(data as Testimonial[] || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const nextTestimonial = () => {
    if (testimonials.length > 0) {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }
  };

  const prevTestimonial = () => {
    if (testimonials.length > 0) {
      setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    }
  };

  const handleTestimonialAdded = () => {
    fetchTestimonials();
    setShowForm(false);
  };

  return (
    <section id="testimonials" className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 -z-10" />
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 animate-fade-in opacity-0">
            What Our <span className="text-primary">Users Say</span>
          </h2>
          <p className="text-lg text-muted-foreground animate-fade-in opacity-0 [animation-delay:100ms]">
            Join thousands of satisfied players who book through TurfBook
          </p>
        </div>

        {showForm ? (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <TestimonialForm 
              onTestimonialAdded={handleTestimonialAdded}
              onCancel={() => setShowForm(false)} 
            />
          </div>
        ) : testimonials.length > 0 ? (
          <div className="max-w-5xl mx-auto glass rounded-3xl p-8 md:p-12 relative">
            <div className="absolute left-6 top-6">
              <Quote className="h-10 w-10 text-primary/20" />
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-center pt-8">
              <div className="md:w-1/3 flex flex-col items-center">
                <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-primary animate-fade-in opacity-0">
                  {testimonials[activeIndex].image ? (
                    <img
                      src={testimonials[activeIndex].image}
                      alt={testimonials[activeIndex].name}
                      className="absolute w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                      {testimonials[activeIndex].name.charAt(0)}
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold animate-fade-in opacity-0 [animation-delay:100ms]">
                  {testimonials[activeIndex].name}
                </h3>
                {testimonials[activeIndex].title && (
                  <p className="text-sm text-muted-foreground mb-3 animate-fade-in opacity-0 [animation-delay:150ms]">
                    {testimonials[activeIndex].title}
                  </p>
                )}
                <div className="flex space-x-1 animate-fade-in opacity-0 [animation-delay:200ms]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < testimonials[activeIndex].rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-muted text-muted"
                      )}
                    />
                  ))}
                </div>
              </div>
              
              <div className="md:w-2/3">
                <blockquote className="text-lg md:text-xl italic leading-relaxed animate-fade-in opacity-0 [animation-delay:250ms]">
                  "{testimonials[activeIndex].text}"
                </blockquote>
              </div>
            </div>

            <div className="flex justify-center mt-8 space-x-2 animate-fade-in opacity-0 [animation-delay:300ms]">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    index === activeIndex
                      ? "w-8 bg-primary"
                      : "bg-primary/30 hover:bg-primary/50"
                  )}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>

            <div className="flex justify-between mt-8 animate-fade-in opacity-0 [animation-delay:350ms]">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={prevTestimonial}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={nextTestimonial}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/20 rounded-xl border border-border max-w-5xl mx-auto animate-fade-in opacity-0">
            <Quote className="h-12 w-12 text-primary/20 mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">
              {loading ? "Loading testimonials..." : "No testimonials available yet. Be the first to share your experience!"}
            </p>
          </div>
        )}
        
        <div className="flex justify-center mt-10">
          {!showForm && (
            <Button 
              className="rounded-xl animate-fade-in opacity-0 [animation-delay:400ms]"
              onClick={() => setShowForm(true)}
              disabled={!isAuthenticated}
            >
              {isAuthenticated ? "Add Testimonial" : "Sign in to Add Testimonial"}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
