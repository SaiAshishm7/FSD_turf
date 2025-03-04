import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import AddTurf from "@/pages/AddTurf";
import TurfDetail from "@/pages/TurfDetail";
import MyBookings from "@/pages/MyBookings";
import MyTurfs from "@/pages/MyTurfs";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/NotFound";
import Turfs from "@/pages/Turfs";
import TurfBookings from "@/pages/TurfBookings";
import "./App.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client for React Query
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/add-turf" element={<AddTurf />} />
            <Route path="/turf/:id" element={<TurfDetail />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/my-turfs" element={<MyTurfs />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/turfs" element={<Turfs />} />
            <Route path="/edit-turf/:id" element={<AddTurf />} />
            <Route path="/turf-bookings/:id" element={<TurfBookings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <SonnerToaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
