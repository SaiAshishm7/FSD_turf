import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  UserPlus,
  Calendar,
  DollarSign,
  TrendingUp,
  PlusCircle,
  Users,
  Edit,
  Trash2,
  Search,
  BarChart,
  AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { runSeedTurfs } from '../scripts/seedTurfs';

interface User {
  id: string;
  email?: string | null;
  created_at: string;
  avatar_url?: string | null;
  full_name?: string | null;
  updated_at?: string | null;
  username?: string | null;
  booking_count: number;
}

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: string;
  created_at: string;
  user_id: string;
  turf_id: string;
  turf?: {
    name: string;
  };
  user?: {
    email?: string | null;
    username?: string | null;
  } | null; // Updated user type to match what we'll get
}

interface Turf {
  id: string;
  name: string;
  location: string;
  price: number;
  capacity: number;
  rating: number;
  reviews: number;
  created_at: string;
  features: string[];
  description?: string;
  image?: string;
}

interface Stats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activeBookings: number;
  recentBookings: Booking[];
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeBookings: 0,
    recentBookings: []
  });
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [turfToDelete, setTurfToDelete] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showUserBookings, setShowUserBookings] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  // Format currency in Indian Rupees
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Add this helper function after the formatDate function
  const getBookingStatus = (booking: Booking) => {
    if (booking.status === 'cancelled') return 'cancelled';
    
    const bookingDateTime = new Date(`${booking.booking_date} ${booking.end_time}`);
    const now = new Date();
    
    if (booking.status === 'confirmed' && bookingDateTime < now) {
      return 'completed';
    }
    
    return booking.status;
  };

  useEffect(() => {
    // Redirect if not logged in or not admin
    if (!user) {
      navigate('/auth');
      toast({
        title: "Authentication required",
        description: "Please sign in to access this page",
      });
      return;
    }

    if (!isAdmin) {
      navigate('/');
      toast({
        title: "Access denied",
        description: "This page is restricted to administrators only",
        variant: "destructive"
      });
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      
      try {
        // Get all turfs first
        const { data: allTurfs, error: turfsError } = await supabase
          .from('turfs')
          .select(`
            id,
            name,
            description,
            location,
            price,
            capacity,
            rating,
            reviews,
            created_at,
            features,
            image
          `)
          .order('created_at', { ascending: false });
          
        if (turfsError) {
          console.error('Error fetching turfs:', turfsError);
          toast({
            title: "Error",
            description: "Failed to load turfs. Some data might be missing.",
            variant: "destructive",
          });
        } else {
          console.log("Fetched turfs data:", allTurfs);
          setTurfs(allTurfs || []);
        }

        // Get ALL bookings with turf data
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            booking_date,
            start_time,
            end_time,
            total_price,
            status,
            created_at,
            user_id,
            turf_id,
            turf:turfs (
              name
            )
          `)
          .order('created_at', { ascending: false });
          
        if (bookingsError) {
          console.error('Error fetching bookings:', bookingsError);
          toast({
            title: "Error",
            description: "Failed to load bookings. Some data might be missing.",
            variant: "destructive",
          });
        } else {
          // Get user data for all bookings
          const userIds = [...new Set(bookingsData?.map(b => b.user_id) || [])];
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('id, user_email, username')
            .in('id', userIds);

          if (userError) {
            console.error('Error fetching user data:', userError);
          }

          // Combine booking data with user data
          const processedBookings = (bookingsData || []).map(booking => ({
            ...booking,
            user: {
              ...userData?.find(u => u.id === booking.user_id),
              email: userData?.find(u => u.id === booking.user_id)?.user_email
            } || null
          }));

          setBookings(processedBookings);

          // Update stats based on bookings
          const totalRevenue = processedBookings.reduce((sum, booking) => 
            booking.status !== 'cancelled' ? sum + (booking.total_price || 0) : sum, 0
          );
          
          const activeBookings = processedBookings.filter(booking => {
            const status = getBookingStatus(booking);
            return status === 'confirmed';
          }).length;
          
          const recentBookings = processedBookings.slice(0, 5);

          // Get all users from auth_users through RLS policy
          const { data: usersData, error: usersError } = await supabase
            .from('users_view')
            .select('*')
            .order('created_at', { ascending: false });

          if (usersError) {
            console.error('Error fetching users:', usersError);
            toast({
              title: "Error",
              description: "Failed to load user data. Some data might be missing.",
              variant: "destructive",
            });
          } else {
            setUsers(usersData || []);
            setStats({
              totalUsers: usersData?.length || 0,
              totalBookings: bookingsData.length,
              totalRevenue,
              activeBookings,
              recentBookings
            });
          }
        }
        
      } catch (error: any) {
        console.error('Error in fetchStats:', error.message);
        toast({
          title: "Error",
          description: "Some data might be missing or incomplete. Please refresh to try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, isAdmin, navigate, toast]);

  const handleDeleteTurf = async () => {
    if (!turfToDelete) return;
    
    try {
      const { error } = await supabase
        .from('turfs')
        .delete()
        .eq('id', turfToDelete);
        
      if (error) throw error;
      
      setTurfs(turfs.filter(turf => turf.id !== turfToDelete));
      
      toast({
        title: "Turf deleted",
        description: "The turf has been successfully removed.",
      });
    } catch (error: any) {
      console.error('Error deleting turf:', error.message);
      toast({
        title: "Error",
        description: "Failed to delete turf. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTurfToDelete(null);
    }
  };

  const filteredTurfs = turfs.filter(turf => 
    turf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turf.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user => 
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBookings = bookings.filter(booking => 
    (booking.turf?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.booking_date.includes(searchTerm)
  );

  const getUserBookings = (userId: string) => {
    return bookings.filter(booking => 
      booking.user_id === userId
    ).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };

  const handleSeedTurfs = () => {
    runSeedTurfs();
    toast({
      title: "Adding sample turfs",
      description: "Sample turfs are being added to the database. Please refresh in a few moments.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={handleSeedTurfs} variant="outline">
          Add Sample Turfs
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Users</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalUsers}</h3>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Bookings</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalBookings}</h3>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active Bookings</p>
                <h3 className="text-2xl font-bold mt-1">{stats.activeBookings}</h3>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Revenue</p>
                <h3 className="text-2xl font-bold mt-1">{formatPrice(stats.totalRevenue)}</h3>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="turfs" className="space-y-6">
        <TabsList className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0">
          <TabsTrigger value="turfs">Manage Turfs</TabsTrigger>
          <TabsTrigger value="bookings">All Bookings</TabsTrigger>
          <TabsTrigger value="users">Registered Users</TabsTrigger>
        </TabsList>

        {/* Turfs Tab */}
        <TabsContent value="turfs" className="space-y-6">
          <div className="flex items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search turfs by name or location..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-5 bg-muted rounded-full w-48"></div>
                        <div className="h-4 bg-muted rounded-full w-32"></div>
                      </div>
                      <div className="flex space-x-2">
                        <div className="h-9 bg-muted rounded-md w-16"></div>
                        <div className="h-9 bg-muted rounded-md w-16"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTurfs.length > 0 ? (
            <div className="space-y-4">
              {filteredTurfs.map((turf) => (
                <Card key={turf.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{turf.name}</h3>
                        <p className="text-sm text-muted-foreground">{turf.location}</p>
                        <div className="flex items-center mt-1 space-x-4">
                          <span className="text-sm">{formatPrice(turf.price)}/hr</span>
                          <span className="text-sm">Capacity: {turf.capacity}</span>
                          <span className="text-sm">Rating: {turf.rating.toFixed(1)}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(turf.features || []).map((feature, index) => (
                            <span
                              key={index}
                              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/edit-turf/${turf.id}`)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setTurfToDelete(turf.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-xl border">
              <p className="text-muted-foreground">No turfs found matching your search.</p>
            </div>
          )}
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-6">
          <div className="flex items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings by turf, status or date..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                      <div className="h-5 bg-muted rounded-full w-32"></div>
                      <div className="h-5 bg-muted rounded-full w-24"></div>
                      <div className="h-5 bg-muted rounded-full w-24"></div>
                      <div className="h-5 bg-muted rounded-full w-16"></div>
                      <div className="h-5 bg-muted rounded-full w-20"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium p-3">Turf</th>
                    <th className="text-left font-medium p-3">Date & Time</th>
                    <th className="text-left font-medium p-3">User</th>
                    <th className="text-left font-medium p-3">Price</th>
                    <th className="text-left font-medium p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">{booking.turf?.name || 'Unknown'}</td>
                      <td className="p-3">
                        {formatDate(booking.booking_date)}, {booking.start_time}
                      </td>
                      <td className="p-3 max-w-[150px] truncate">
                        {booking.user?.username || booking.user?.email || 'Anonymous User'}
                      </td>
                      <td className="p-3">{formatPrice(booking.total_price)}</td>
                      <td className="p-3">
                        <Badge variant={
                          getBookingStatus(booking) === 'completed' ? 'success' : 
                          getBookingStatus(booking) === 'confirmed' ? 'default' : 
                          getBookingStatus(booking) === 'pending' ? 'secondary' : 
                          'destructive'
                        }>
                          {getBookingStatus(booking).charAt(0).toUpperCase() + getBookingStatus(booking).slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-xl border">
              <p className="text-muted-foreground">No bookings found matching your search.</p>
            </div>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by email or username..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="h-5 bg-muted rounded-full w-32"></div>
                      <div className="h-5 bg-muted rounded-full w-24"></div>
                      <div className="h-5 bg-muted rounded-full w-24"></div>
                      <div className="h-5 bg-muted rounded-full w-16"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium px-4 py-3 w-1/5">User</th>
                    <th className="text-left font-medium px-4 py-3 w-2/5">Email</th>
                    <th className="text-left font-medium px-4 py-3 w-1/5">Joined</th>
                    <th className="text-left font-medium px-4 py-3 w-1/5">Total Bookings</th>
                    <th className="text-right font-medium px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const userBookings = getUserBookings(user.id);
                    return (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium whitespace-nowrap">
                          {user.username || 'Anonymous User'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                          {user.email || 'No email'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {user.booking_count || 0} bookings
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUserId(user.id);
                              setShowUserBookings(true);
                            }}
                          >
                            View Bookings
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-xl border">
              <p className="text-muted-foreground">No users found matching your search.</p>
            </div>
          )}

          {/* User Bookings Dialog */}
          <Dialog open={showUserBookings} onOpenChange={setShowUserBookings}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  User Bookings - {
                    selectedUserId ? 
                      (users.find(u => u.id === selectedUserId)?.email || 
                       'Anonymous User') : ''
                  }
                </DialogTitle>
              </DialogHeader>
              {selectedUserId && (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left font-medium p-3">Turf</th>
                          <th className="text-left font-medium p-3">Date & Time</th>
                          <th className="text-left font-medium p-3">Price</th>
                          <th className="text-left font-medium p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getUserBookings(selectedUserId).map((booking) => (
                          <tr key={booking.id} className="border-b hover:bg-muted/50">
                            <td className="p-3">{booking.turf?.name || 'Unknown'}</td>
                            <td className="p-3">
                              {formatDate(booking.booking_date)} • {booking.start_time} - {booking.end_time}
                            </td>
                            <td className="p-3">{formatPrice(booking.total_price)}</td>
                            <td className="p-3">
                              <Badge variant={
                                getBookingStatus(booking) === 'completed' ? 'success' : 
                                getBookingStatus(booking) === 'confirmed' ? 'default' : 
                                getBookingStatus(booking) === 'pending' ? 'secondary' : 
                                'destructive'
                              }>
                                {getBookingStatus(booking).charAt(0).toUpperCase() + getBookingStatus(booking).slice(1)}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {getUserBookings(selectedUserId).length === 0 && (
                    <div className="text-center py-8 bg-muted/20 rounded-lg">
                      <p className="text-muted-foreground">No bookings found for this user.</p>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!turfToDelete} onOpenChange={(open) => !open && setTurfToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Turf</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this turf? This action cannot be undone and will
              remove all associated bookings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTurf}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
