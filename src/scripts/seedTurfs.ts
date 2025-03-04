import { supabase } from '../integrations/supabase/client';

const turfs = [
  {
    name: "Football Paradise",
    description: "Professional football turf with FIFA-approved artificial grass. Perfect for 11-a-side matches.",
    location: "Gachibowli, Hyderabad",
    price: 1500,
    capacity: 22,
    image: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&q=80",
    features: ["FIFA-approved turf", "Floodlights", "Changing rooms", "Parking", "Water dispensers", "First aid"],
    rating: 0,
    reviews: 0
  },
  {
    name: "Cricket Hub",
    description: "Premium cricket facility with both synthetic and natural pitches. Ideal for practice and matches.",
    location: "Madhapur, Hyderabad",
    price: 1800,
    capacity: 30,
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80",
    features: ["Natural grass", "Practice nets", "Bowling machine", "Equipment rental", "Pavilion", "Score board"],
    rating: 0,
    reviews: 0
  },
  {
    name: "Multi-Sport Arena",
    description: "Versatile facility supporting multiple sports with high-quality surfaces and equipment.",
    location: "Kondapur, Hyderabad",
    price: 1600,
    capacity: 20,
    image: "https://images.unsplash.com/photo-1542652694-40abf526446e?auto=format&fit=crop&q=80",
    features: ["Basketball court", "Volleyball court", "Badminton courts", "Table tennis", "Gym equipment", "Cafeteria"],
    rating: 0,
    reviews: 0
  },
  {
    name: "Tennis Excellence",
    description: "Professional tennis courts with premium synthetic surface and world-class facilities.",
    location: "Jubilee Hills, Hyderabad",
    price: 1200,
    capacity: 4,
    image: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80",
    features: ["Hard courts", "Ball machine", "Pro shop", "Tennis coaching", "Locker rooms", "Refreshments"],
    rating: 0,
    reviews: 0
  },
  {
    name: "Futsal Zone",
    description: "Indoor futsal facility with professional flooring and high-intensity lighting.",
    location: "Banjara Hills, Hyderabad",
    price: 1300,
    capacity: 12,
    image: "https://images.unsplash.com/photo-1577416412292-747c6607f055?auto=format&fit=crop&q=80",
    features: ["Professional futsal court", "Air conditioning", "Score display", "Sports shop", "Referee service", "Evening leagues"],
    rating: 0,
    reviews: 0
  },
  {
    name: "Basketball Central",
    description: "NBA-standard basketball court with professional facilities and training equipment.",
    location: "Kukatpally, Hyderabad",
    price: 1400,
    capacity: 15,
    image: "https://images.unsplash.com/photo-1505666287802-931dc83948e9?auto=format&fit=crop&q=80",
    features: ["Wooden court", "Shot clocks", "Training equipment", "Video analysis", "Recovery zone", "Spectator seating"],
    rating: 0,
    reviews: 0
  },
  {
    name: "Badminton Elite",
    description: "Premium badminton facility with international standard courts and equipment.",
    location: "HITEC City, Hyderabad",
    price: 1000,
    capacity: 8,
    image: "https://images.unsplash.com/photo-1613918431703-aa50889e3be8?auto=format&fit=crop&q=80",
    features: ["BWF standard courts", "Pro shop", "Shuttle service", "Coaching", "Air conditioning", "Equipment rental"],
    rating: 0,
    reviews: 0
  },
  {
    name: "Hockey Arena",
    description: "State-of-the-art hockey facility with artificial turf and professional equipment.",
    location: "Secunderabad, Hyderabad",
    price: 1700,
    capacity: 22,
    image: "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&q=80",
    features: ["Astroturf", "Flood lights", "Team dugouts", "Equipment rental", "First aid station", "Changing rooms"],
    rating: 0,
    reviews: 0
  },
  {
    name: "Volleyball Paradise",
    description: "Professional volleyball courts with both indoor and outdoor facilities.",
    location: "Miyapur, Hyderabad",
    price: 1100,
    capacity: 16,
    image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&q=80",
    features: ["Indoor court", "Beach volleyball", "Training equipment", "Coaching available", "Shower facilities", "Sports shop"],
    rating: 0,
    reviews: 0
  },
  {
    name: "Ultimate Sports Complex",
    description: "Comprehensive sports facility offering multiple courts and training areas.",
    location: "Financial District, Hyderabad",
    price: 2000,
    capacity: 50,
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80",
    features: ["Multiple courts", "Swimming pool", "Fitness center", "Cafe", "Pro shop", "Parking", "Medical room"],
    rating: 0,
    reviews: 0
  }
];

const seedTurfs = async () => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      console.error('No authenticated user found');
      return;
    }

    for (const turf of turfs) {
      const { error } = await supabase
        .from('turfs')
        .insert({
          ...turf,
          owner_id: user.user.id
        });

      if (error) {
        console.error(`Error adding turf ${turf.name}:`, error);
      } else {
        console.log(`Successfully added turf: ${turf.name}`);
      }
    }

    console.log('Finished adding all turfs');
  } catch (error) {
    console.error('Error in seed script:', error);
  }
};

export const runSeedTurfs = () => {
  seedTurfs()
    .then(() => console.log('Seeding completed'))
    .catch(console.error);
}; 