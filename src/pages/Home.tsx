import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import FlightSearchCard from '@/components/FlightSearchCard';
import FlightCard from '@/components/FlightCard';
import { Flight, supabaseService } from '@/lib/supabase-service';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const Home = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadFlights();
  }, []);

  const loadFlights = async () => {
    try {
      const flightsData = await supabaseService.getFlights();
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

  const handleSearch = async (searchParams: {
    origin: string;
    destination: string;
    date: string;
    tripType: 'oneWay' | 'roundTrip';
    passengers: number;
  }) => {
    setSearchLoading(true);
    try {
      const searchResults = await supabaseService.searchFlights({
        origin: searchParams.origin,
        destination: searchParams.destination,
        date: searchParams.date,
      });
      setFlights(searchResults);
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search flights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleFlightSelect = (flight: Flight) => {
    navigate('/booking', { state: { flight } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-airline-blue via-sky-500 to-airline-light">
      <Header />
      
      {/* Hero Section */}
      <div className="relative py-20 px-4">
        <div className="container mx-auto text-center text-white mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Fly Better with <span className="text-airline-gold">SkyWings</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Discover amazing destinations around the world with our premium airline service
          </p>
        </div>

        {/* Search Card */}
        <div className="container mx-auto max-w-4xl px-4">
          <FlightSearchCard onSearch={handleSearch} />
        </div>
      </div>

      {/* Available Flights Section */}
      <div className="bg-background py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Available Flights</h2>
            <p className="text-muted-foreground text-lg">Choose from our selection of premium flights</p>
          </div>

          {loading || searchLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-airline-blue" />
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {flights.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">No flights found. Try adjusting your search criteria.</p>
                </div>
              ) : (
                flights.map((flight) => (
                  <FlightCard
                    key={flight.flight_number}
                    flight={flight}
                    onSelect={handleFlightSelect}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;