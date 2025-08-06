import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Flight, supabaseService } from '@/lib/supabase-service';
import { useToast } from '@/hooks/use-toast';
import { Plane, MapPin, Clock, DollarSign, User } from 'lucide-react';

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const flight = location.state?.flight as Flight;
  const [passengerName, setPassengerName] = useState(profile ? `${profile.first_name} ${profile.last_name}` : '');
  const [seatNumber, setSeatNumber] = useState('');
  const [loading, setLoading] = useState(false);

  if (!flight) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">Flight Not Found</h2>
              <p className="text-muted-foreground mb-4">Please select a flight from the search results.</p>
              <Button onClick={() => navigate('/')}>Back to Search</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to make a booking.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      await supabaseService.createBooking({
        flight_id: flight.id,
        passenger_name: passengerName,
        seat_number: seatNumber || undefined,
        total_amount: flight.price,
      });
      
      toast({
        title: "Booking Confirmed!",
        description: "Your flight has been booked successfully.",
      });
      navigate('/bookings');
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Flight Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plane className="h-5 w-5 text-airline-blue" />
                  <span>Flight Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold">{flight.flight_number}</h3>
                  <p className="text-muted-foreground">{flight.aircraft}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">From</span>
                    </div>
                    <span className="text-xl font-bold">{flight.origin}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">To</span>
                    </div>
                    <span className="text-xl font-bold">{flight.destination}</span>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Departure</span>
                    </div>
                    <p className="text-sm">{formatDateTime(flight.departure_time)}</p>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Arrival</span>
                    </div>
                    <p className="text-sm">{formatDateTime(flight.arrival_time)}</p>
                  </div>

                  <div>
                    <span className="font-medium">Duration: </span>
                    <span>{flight.duration}</span>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between text-lg">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-airline-red" />
                      <span className="font-medium">Price</span>
                    </div>
                    <span className="text-2xl font-bold text-airline-red">${flight.price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-airline-blue" />
                  <span>Passenger Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBooking} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="passengerName">Full Name *</Label>
                    <Input
                      id="passengerName"
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      placeholder="Enter passenger full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seatNumber">Preferred Seat (Optional)</Label>
                    <Input
                      id="seatNumber"
                      value={seatNumber}
                      onChange={(e) => setSeatNumber(e.target.value)}
                      placeholder="e.g., 12A"
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty for automatic seat assignment
                    </p>
                  </div>

                  <Separator />

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Booking Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Flight ({flight.flight_number})</span>
                        <span>${flight.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxes & Fees</span>
                        <span>$0</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-semibold text-base">
                        <span>Total</span>
                        <span className="text-airline-red">${flight.price}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-airline-red hover:bg-airline-red/90"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Confirm Booking"}
                  </Button>

                  {!isAuthenticated && (
                    <p className="text-xs text-center text-muted-foreground">
                      You will be redirected to login before completing the booking
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;