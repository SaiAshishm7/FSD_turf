import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin, Users, Clock, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";

interface Turf {
  id: string;
  name: string;
  location: string;
  price: number;
  image: string;
  capacity: number;
  rating: number;
  reviews: number;
  features: string[];
  description?: string;
}

const Turfs = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [filteredTurfs, setFilteredTurfs] = useState<Turf[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTurfs = async () => {
      try {
        const { data, error } = await supabase
          .from('turfs')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setTurfs(data || []);
        setFilteredTurfs(data || []);
      } catch (error: any) {
        console.error('Error fetching turfs:', error.message);
        toast({
          title: "Error",
          description: "Failed to load turf data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTurfs();
  }, [toast]);

  useEffect(() => {
    const filtered = turfs.filter(turf => 
      turf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      turf.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (turf.features || []).some(feature => 
        feature.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredTurfs(filtered);
  }, [searchTerm, turfs]);

  // Format currency in Indian Rupees
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <Navbar />
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 animate-fade-in opacity-0">
              All <span className="text-primary">Turfs</span>
            </h2>
            <p className="text-lg text-muted-foreground animate-fade-in opacity-0 [animation-delay:100ms]">
              Discover premium playing fields designed for the perfect game experience
            </p>
          </div>

          <div className="max-w-md mx-auto mb-12">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
              <Input
                placeholder="Search by name, location, or features..."
                className="pl-10 pr-10 h-12 text-base rounded-xl border-2 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
            {searchTerm && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Found {filteredTurfs.length} {filteredTurfs.length === 1 ? 'turf' : 'turfs'} matching your search
              </p>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden border-0 shadow-lg h-[460px] animate-pulse">
                  <div className="h-56 bg-muted"></div>
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted rounded-full w-3/4 mb-3"></div>
                    <div className="h-4 bg-muted rounded-full w-1/2 mb-4"></div>
                    <div className="h-4 bg-muted rounded-full w-3/4 mb-6"></div>
                    <div className="flex space-x-4 mb-6">
                      <div className="h-6 bg-muted rounded-full w-20"></div>
                      <div className="h-6 bg-muted rounded-full w-20"></div>
                    </div>
                    <div className="h-10 bg-muted rounded-xl"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTurfs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTurfs.map((turf, index) => (
                <Card
                  key={turf.id}
                  className={cn(
                    "overflow-hidden border-0 shadow-lg transition-all duration-500 hover:shadow-xl group",
                    "opacity-0",
                    index % 3 === 0 ? "animate-fade-in [animation-delay:150ms]" : 
                    index % 3 === 1 ? "animate-fade-in [animation-delay:300ms]" : 
                    "animate-fade-in [animation-delay:450ms]"
                  )}
                  onMouseEnter={() => setHoveredCard(turf.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="relative h-56 overflow-hidden">
                    <div
                      className={cn(
                        "absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-in-out",
                        hoveredCard === turf.id ? "scale-110" : "scale-100"
                      )}
                      style={{ backgroundImage: `url(${turf.image || '/placeholder.svg'})` }}
                    />
                    <div className="absolute inset-0 bg-black/25 transition-opacity duration-300" />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-full px-3 py-1 text-white text-sm font-medium">
                      {formatPrice(turf.price)}/hr
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold">{turf.name}</h3>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{turf.rating.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({turf.reviews})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4 mr-1 text-primary" />
                      {turf.location}
                    </div>

                    <div className="flex space-x-4 mb-6">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="text-xs">{turf.capacity}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="text-xs">60 min</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {(turf.features || []).slice(0, 3).map((feature) => (
                        <span
                          key={feature}
                          className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                      {(turf.features || []).length > 3 && (
                        <span className="text-xs bg-muted px-2 py-1 rounded-full">
                          +{turf.features.length - 3} more
                        </span>
                      )}
                    </div>

                    <Button
                      className="w-full rounded-xl group-hover:bg-primary/90 transition-all duration-300"
                      onClick={() => navigate(`/turf/${turf.id}`)}
                    >
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-xl border border-border animate-fade-in opacity-0">
              <p className="text-lg text-muted-foreground">
                {searchTerm ? "No turfs found matching your search." : "No turf listings available yet."}
              </p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Turfs;
