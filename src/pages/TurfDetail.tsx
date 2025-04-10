import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, MapPin, Users, Star, Clock, CalendarIcon, CheckCircle, Trophy } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import TurfReviews from "@/components/TurfReviews";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import TurfReviewForm from "@/components/TurfReviewForm";
import BookingCalendar from "@/components/BookingCalendar";

const TurfDetail = () => {
  const { id } = useParams();
  const [turf, setTurf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("details");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const fetchTurf = useCallback(async () => {
    if (!id) {
      toast({
        title: "Error",
        description: "Turf ID is missing.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("turfs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      console.log("Fetched turf data:", data);
      setTurf(data);
    } catch (error: any) {
      console.error("Error fetching turf:", error.message);
      toast({
        title: "Error",
        description: "Failed to load turf details. Please try again.",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    fetchTurf();
  }, [fetchTurf]);

  const handleReviewAdded = useCallback(async () => {
    console.log('Review added, refreshing turf data...');
    try {
      await fetchTurf();
      toast.success('Review added successfully!');
    } catch (error) {
      console.error('Error refreshing turf data:', error);
      toast.error('Failed to refresh turf data');
    }
  }, [fetchTurf]);

  // Add a refresh trigger for reviews
  const handleRefreshReviews = useCallback(async () => {
    console.log('Manually refreshing turf data...');
    try {
      await fetchTurf();
      toast.success('Data refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    }
  }, [fetchTurf]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {loading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-8 bg-primary/20 rounded w-64"></div>
            <div className="h-4 bg-primary/10 rounded w-48"></div>
            <div className="h-96 bg-primary/5 rounded w-full max-w-3xl mt-4 shimmer"></div>
          </div>
        </div>
      ) : turf ? (
        <div className="animate-fade-in">
          <div className="turf-hero mb-8">
            <div className="absolute inset-0 bg-pattern opacity-10"></div>
            <div className="relative z-10 p-8 md:p-12">
              <div className="max-w-4xl">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground animate-fade-in">{turf.name}</h1>
                <div className="flex items-center space-x-2 text-muted-foreground mb-6 animate-fade-in animate-delay-100">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="text-lg">{turf.location}</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 animate-fade-in animate-delay-200">
                  <div className="turf-stats-card">
                    <CalendarDays className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Since</p>
                      <p className="font-medium">{new Date(turf.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="turf-stats-card">
                    <Users className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Capacity</p>
                      <p className="font-medium">{turf.capacity} players</p>
                    </div>
                  </div>
                  
                  <div className="turf-stats-card">
                    <Star className="h-6 w-6 text-yellow-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <p className="font-medium">
                        {turf.rating ? turf.rating.toFixed(1) : '0.0'} ⭐ 
                        <span className="text-sm text-muted-foreground ml-1">
                          ({turf.reviews || 0} reviews)
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="turf-stats-card">
                    <Clock className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-semibold">{formatPrice(turf.price)}/hr</p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  className="mt-2 font-medium text-base shadow-md transition-all duration-300 hover:shadow-lg animate-fade-in animate-delay-300"
                  onClick={() => setActiveSection("booking")}
                >
                  Book This Turf
                </Button>
              </div>
            </div>
          </div>

          <div className="nav-tabs-container">
            <div className="flex space-x-2 mx-auto py-2">
              <Button 
                variant="ghost"
                onClick={() => setActiveSection("details")}
                className={`turf-tab ${activeSection === "details" ? "data-[state=active]" : ""}`}
                data-state={activeSection === "details" ? "active" : "inactive"}
              >
                Turf Details
              </Button>
              <Button 
                variant="ghost"
                onClick={() => setActiveSection("booking")}
                className={`turf-tab ${activeSection === "booking" ? "data-[state=active]" : ""}`}
                data-state={activeSection === "booking" ? "active" : "inactive"}
              >
                Book Now
              </Button>
              <Button 
                variant="ghost"
                onClick={() => setActiveSection("reviews")}
                className={`turf-tab ${activeSection === "reviews" ? "data-[state=active]" : ""}`}
                data-state={activeSection === "reviews" ? "active" : "inactive"}
              >
                Reviews
              </Button>
            </div>
          </div>

          <div className="mb-8 animate-fade-in">
            {activeSection === "details" && (
              <div className="turf-card animate-fade-in">
                <div className="turf-card-header">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Turf Details
                  </CardTitle>
                </div>
                <CardContent className="grid gap-6 p-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Trophy className="h-5 w-5 mr-2 text-primary" />
                      Features:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {turf.features && turf.features.length > 0 ? (
                        turf.features.map((feature, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                          >
                            {feature}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted-foreground">No features listed.</span>
                      )}
                    </div>
                  </div>
                  <Separator className="my-2 bg-primary/10" />
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Description:</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{turf.description || 'No description provided.'}</p>
                  </div>
                </CardContent>
              </div>
            )}

            {activeSection === "booking" && (
              <div className="turf-content-section animate-fade-in">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <CalendarIcon className="mr-3 h-6 w-6 text-primary" />
                  Book Your Slot
                </h2>
                <div className="turf-card">
                  <CardContent className="p-0">
                    <BookingCalendar />
                  </CardContent>
                </div>
              </div>
            )}

            {activeSection === "reviews" && (
              <div className="turf-content-section animate-fade-in">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Star className="mr-3 h-6 w-6 text-yellow-500 fill-yellow-500" />
                  Reviews and Ratings
                </h2>
                
                {isAuthenticated && turf && (
                  <div className="turf-card mb-8">
                    <div className="turf-card-header">
                      <CardTitle className="text-xl">Write a Review</CardTitle>
                    </div>
                    <CardContent className="p-6">
                      <TurfReviewForm turfId={turf.id} onReviewAdded={handleReviewAdded} />
                    </CardContent>
                  </div>
                )}
                
                {turf && (
                  <div className="turf-card">
                    <CardContent className="p-6">
                      <TurfReviews 
                        turfId={id} 
                        onRefresh={handleRefreshReviews}
                        onReviewAdded={handleReviewAdded}
                      />
                    </CardContent>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/20 rounded-lg animate-fade-in">
          <p className="text-muted-foreground">Turf not found.</p>
        </div>
      )}
    </div>
  );
};

export default TurfDetail;
