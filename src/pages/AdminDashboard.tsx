import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Header from '@/components/Header';
import FlightCard from '@/components/FlightCard';
import { useAuth } from '@/contexts/AuthContext';
import { Flight, apiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Plus, Plane, Users, Calendar, DollarSign, Loader2 } from 'lucide-react';

const AdminDashboard = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFlight, setNewFlight] = useState({
    origin: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    duration: '',
    aircraft: '',
    price: 0,
    totalSeats: 0,
  });
  
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isAdmin) {
      loadFlights();
    }
  }, [isAdmin]);

  const loadFlights = async () => {
    try {
      const flightsData = await apiService.getFlights();
      setFlights(flightsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load flights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const flightData = {
        ...newFlight,
        availableSeats: newFlight.totalSeats, // Initially all seats are available
      };
      
      const createdFlight = await apiService.createFlight(flightData);
      setFlights([...flights, createdFlight]);
      setShowCreateDialog(false);
      setNewFlight({
        origin: '',
        destination: '',
        departureTime: '',
        arrivalTime: '',
        duration: '',
        aircraft: '',
        price: 0,
        totalSeats: 0,
      });
      
      toast({
        title: "Flight Created",
        description: "New flight has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create flight. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditFlight = (flight: Flight) => {
    // TODO: Implement edit functionality
    toast({
      title: "Edit Flight",
      description: "Edit functionality will be implemented here.",
    });
  };

  const handleDeleteFlight = async (flight: Flight) => {
    // TODO: Implement delete functionality
    toast({
      title: "Delete Flight",
      description: "Delete functionality will be implemented here.",
    });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">You don't have permission to access this page.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const stats = {
    totalFlights: flights.length,
    totalSeats: flights.reduce((sum, flight) => sum + flight.totalSeats, 0),
    occupiedSeats: flights.reduce((sum, flight) => sum + (flight.totalSeats - flight.availableSeats), 0),
    totalRevenue: flights.reduce((sum, flight) => sum + (flight.price * (flight.totalSeats - flight.availableSeats)), 0),
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage flights and monitor performance</p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-airline-red hover:bg-airline-red/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Flight
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Flight</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateFlight} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="origin">Origin</Label>
                    <Input
                      id="origin"
                      value={newFlight.origin}
                      onChange={(e) => setNewFlight({...newFlight, origin: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination</Label>
                    <Input
                      id="destination"
                      value={newFlight.destination}
                      onChange={(e) => setNewFlight({...newFlight, destination: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departureTime">Departure Time</Label>
                    <Input
                      id="departureTime"
                      type="datetime-local"
                      value={newFlight.departureTime}
                      onChange={(e) => setNewFlight({...newFlight, departureTime: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="arrivalTime">Arrival Time</Label>
                    <Input
                      id="arrivalTime"
                      type="datetime-local"
                      value={newFlight.arrivalTime}
                      onChange={(e) => setNewFlight({...newFlight, arrivalTime: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      placeholder="e.g., 2h 30m"
                      value={newFlight.duration}
                      onChange={(e) => setNewFlight({...newFlight, duration: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aircraft">Aircraft</Label>
                    <Input
                      id="aircraft"
                      placeholder="e.g., Boeing 737"
                      value={newFlight.aircraft}
                      onChange={(e) => setNewFlight({...newFlight, aircraft: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalSeats">Total Seats</Label>
                    <Input
                      id="totalSeats"
                      type="number"
                      value={newFlight.totalSeats}
                      onChange={(e) => setNewFlight({...newFlight, totalSeats: parseInt(e.target.value)})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newFlight.price}
                    onChange={(e) => setNewFlight({...newFlight, price: parseFloat(e.target.value)})}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-airline-red hover:bg-airline-red/90">
                    Create Flight
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Flights</CardTitle>
              <Plane className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFlights}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Seats</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSeats}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupied Seats</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.occupiedSeats}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalSeats > 0 ? Math.round((stats.occupiedSeats / stats.totalSeats) * 100) : 0}% occupancy
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Flights List */}
        <Card>
          <CardHeader>
            <CardTitle>All Flights</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-airline-blue" />
              </div>
            ) : flights.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No flights available. Create your first flight!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {flights.map((flight) => (
                  <FlightCard
                    key={flight.flightNumber}
                    flight={flight}
                    onEdit={handleEditFlight}
                    onDelete={handleDeleteFlight}
                    isAdmin={true}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;