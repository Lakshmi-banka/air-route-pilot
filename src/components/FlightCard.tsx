import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flight } from '@/lib/api';
import { Plane, Clock, Users } from 'lucide-react';

interface FlightCardProps {
  flight: Flight;
  onSelect?: (flight: Flight) => void;
  onEdit?: (flight: Flight) => void;
  onDelete?: (flight: Flight) => void;
  showActions?: boolean;
  isAdmin?: boolean;
}

const FlightCard: React.FC<FlightCardProps> = ({ 
  flight, 
  onSelect, 
  onEdit, 
  onDelete, 
  showActions = true,
  isAdmin = false 
}) => {
  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getAvailabilityColor = () => {
    const percentage = (flight.availableSeats / flight.totalSeats) * 100;
    if (percentage > 50) return 'bg-green-100 text-green-800';
    if (percentage > 20) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="hover:shadow-strong transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="bg-airline-blue/10 p-2 rounded-lg">
                  <Plane className="h-5 w-5 text-airline-blue" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{flight.flightNumber}</h3>
                  <p className="text-sm text-muted-foreground">{flight.aircraft}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-airline-red">${flight.price}</p>
                <p className="text-sm text-muted-foreground">per person</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">From</p>
                <p className="font-semibold text-xl">{flight.origin}</p>
                <p className="text-sm">{formatTime(flight.departureTime)}</p>
                <p className="text-xs text-muted-foreground">{formatDate(flight.departureTime)}</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                  <span className="text-sm text-muted-foreground">{flight.duration}</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-muted"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <Plane className="h-4 w-4 text-airline-blue bg-background px-1" />
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-muted-foreground">To</p>
                <p className="font-semibold text-xl">{flight.destination}</p>
                <p className="text-sm">{formatTime(flight.arrivalTime)}</p>
                <p className="text-xs text-muted-foreground">{formatDate(flight.arrivalTime)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge className={getAvailabilityColor()}>
                  <Users className="h-3 w-3 mr-1" />
                  {flight.availableSeats} seats left
                </Badge>
              </div>

              {showActions && (
                <div className="flex space-x-2">
                  {isAdmin ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => onEdit?.(flight)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => onDelete?.(flight)}>
                        Delete
                      </Button>
                    </>
                  ) : (
                    <Button 
                      className="bg-airline-red hover:bg-airline-red/90"
                      onClick={() => onSelect?.(flight)}
                    >
                      Select Flight
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlightCard;